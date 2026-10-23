const { db } = require("../../../../config/dbConnection");
const XLSX = require("xlsx");
const crypto = require("crypto");

/* ---------------- Utilities ---------------- */

const yn = (v) => (String(v || "").toUpperCase() === "Y" ? "Y" : "N");

const getFileHash = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");



const parseAndValidateDate = (
  memberNo,
  value,
  fieldName,
  rowNo,
  uploadDate,
  errors
) => {
  if (!value) return null;

  // Case 1: Excel serial number
  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

    // extract date parts in UTC (IMPORTANT)
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }

  // Case 2: String date (already YYYY-MM-DD or DD/MM/YYYY)
  if (typeof value === "string") {
    // normalize DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("/");
      return `${yyyy}-${mm}-${dd}`;
    }

    // YYYY-MM-DD → return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    errors.push({
      row: rowNo,
      member_no: memberNo,
      field: fieldName,
      reason: "Invalid date format",
    });
    return null;
  }

  errors.push({
    row: rowNo,
    member_no: memberNo,
    field: fieldName,
    reason: "Invalid date value",
  });

  return null;
};


const validateYN = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const v = String(value).toUpperCase();
  return v === "Y" || v === "N" ? v : null;
};

const uploadMemberDetailintoTemp = async (req, res) => {
  try {
    const {
      file_base64,
      file_name,
      user_id,
      trans_year,
      confirm_reupload = "N",
    } = req.body;

    if (!file_base64 || !user_id || !file_name || !trans_year) {
      return res.status(400).json({
        type: "error",
        message: "File, user_id or trans_year not provided",
      });
    }

    const buffer = Buffer.from(file_base64.split(";base64,").pop(), "base64");

    const fileHash = getFileHash(buffer);

    const dupCheck = await db.query(
      `SELECT upload_id FROM blk_upd_member_dtl_upload_log WHERE file_hash = $1 LIMIT 1`,
      [fileHash]
    );

    if (dupCheck.rows.length > 0 && confirm_reupload !== "Y") {
      return res.status(409).json({
        type: "confirm",
        message: "This file was already uploaded. Do you want to upload again?",
        existing_upload_id: dupCheck.rows[0].upload_id,
      });
    }

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!rows.length) {
      return res.status(400).json({
        type: "error",
        message: "Excel file is empty",
      });
    }

    /* ---------------- VALIDATIONS ---------------- */

    const errors = [];
    const uploadDate = new Date();

    /* Duplicate member_no inside Excel */
    const memberMap = new Map();
    rows.forEach((r, i) => {
      if (!r.member_no) return;
      const rowNo = i + 2;
      if (!memberMap.has(r.member_no)) memberMap.set(r.member_no, [rowNo]);
      else memberMap.get(r.member_no).push(rowNo);
    });

    memberMap.forEach((rowNos, member_no) => {
      if (rowNos.length > 1) {
        errors.push({
          member_no,
          rows: rowNos,
          reason: "Duplicate member_no in Excel",
        });
      }
    });

    /* Member existence (SAFE pair check) */
    const pairKeys = rows.map((r) => `${r.member_no}|${r.dealer_code}`);

    const dbRes = await db.query(
      `
      SELECT member_no, dealer_code, member_board_cease_date
      FROM moedmember
      WHERE (member_no || '|' || dealer_code) = ANY($1)
      `,
      [pairKeys]
    );

    const dbMap = new Map(
      dbRes.rows.map((r) => [
        `${r.member_no}|${r.dealer_code}`,
        r.member_board_cease_date,
      ])
    );

    /* ---------------- ROW LEVEL VALIDATIONS ---------------- */

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNo = i + 2;
      const key = `${r.member_no}|${r.dealer_code}`;

      if (!dbMap.has(key)) {
        errors.push({
          row: rowNo,
          member_no: r.member_no,
          reason: "Member not found for given dealer_code",
        });
        continue;
      }

      /* ---------- Y / N FLAG VALIDATION ---------- */
      const ynFields = {
        membership_fee: r.membership_fee,
        member_form: r.member_form,
        start_kit_tool: r.start_kit_tool,
        start_kit_uniform: r.start_kit_uniform,
        start_kit_promotion: r.start_kit_promotion,
        start_kit_stationery: r.start_kit_stationery,
        start_kit_all: r.start_kit_all,
      };

      Object.entries(ynFields).forEach(([field, value]) => {
        const v = validateYN(value);

        if (!v) {
          errors.push({
            row: rowNo,
            member_no: r.member_no,
            field,
            reason: "Invalid value. Only 'Y' or 'N' is allowed",
          });
        } else {
          // normalize value for rest of flow
          r[field] = v;
        }
      });

      /* ---------- Start Kit validation ---------- */
      const tool = yn(r.start_kit_tool);
      const uniform = yn(r.start_kit_uniform);
      const promo = yn(r.start_kit_promotion);
      const stationery = yn(r.start_kit_stationery);
      const all = yn(r.start_kit_all);

      const individual = [tool, uniform, promo, stationery];
      const individualYCount = individual.filter((v) => v === "Y").length;

      if (all === "Y" && individualYCount > 0) {
        errors.push({
          row: rowNo,
          member_no: r.member_no,
          field: "start_kit_all",
          reason:
            "If start_kit_all is Y, all individual start kit fields must be N",
        });
      }

      if (individualYCount === individual.length && all === "N") {
        errors.push({
          row: rowNo,
          member_no: r.member_no,
          field: "start_kit_all",
          reason:
            "All individual start kit fields are Y. Please set start_kit_all to Y and individual fields to N",
        });
      }

      /* ---------- Date validations ---------- */
      r._member_date = parseAndValidateDate(
        r.member_no,
        r.member_date,
        "member_date",
        rowNo,
        uploadDate,
        errors
      );

      r._member_board_appnt_date = parseAndValidateDate(
        r.member_no,
        r.member_board_appnt_date,
        "member_board_appnt_date",
        rowNo,
        uploadDate,
        errors
      );

      r._member_board_cease_date = parseAndValidateDate(
        r.member_no,
        r.member_board_cease_date,
        "member_board_cease_date",
        rowNo,
        uploadDate,
        errors
      );

      r._member_board_reinstate = parseAndValidateDate(
        r.member_no,
        r.member_board_reinstate,
        "member_board_reinstate",
        rowNo,
        uploadDate,
        errors
      );

      r._pay_instr_date = parseAndValidateDate(
        r.member_no,
        r.pay_instr_date,
        "pay_instr_date",
        rowNo,
        uploadDate,
        errors
      );

      if (
        r._member_date &&
        r._member_board_cease_date &&
        new Date(r._member_board_cease_date) < new Date(r._member_date)
      ) {
        errors.push({
          row: rowNo,
          field: "member_board_cease_date",
          reason: "Cease date cannot be before member date",
        });
      }

      /* ---------- BOARD STATUS DATE COUNT CHECK ---------- */

      const boardDateCount = [
        r._member_board_appnt_date,
        r._member_board_cease_date,
        r._member_board_reinstate,
      ].filter(Boolean).length;

      if (boardDateCount === 0) {
        errors.push({
          row: rowNo,
          member_no: r.member_no,
          reason:
            "At least one of member_board_appnt_date, member_board_cease_date, or member_board_reinstate must be provided",
        });
      }

      if (boardDateCount === 3) {
        errors.push({
          row: rowNo,
          member_no: r.member_no,
          reason:
            "member_board_appnt_date, member_board_cease_date and member_board_reinstate cannot all be provided at the same time",
        });
      }

      /* ---------- FINANCE CHECK  ---------- */
      const dbCeaseDate = dbMap.get(key);

      if (r._member_board_cease_date && !dbCeaseDate) {
        const finAccNo = `C${r.member_no}`;

        await db.query(
          `
          SELECT integral.func_acc_opening_balance(
            $1,
            $2,
            1::smallint,
            $3,
            'Y',
            $4
          )
          `,
          [finAccNo, r._member_board_cease_date, trans_year, user_id]
        );

        const { rows: balRows } = await db.query(
          `
          SELECT opening_balance
          FROM acc_opening_summary
          WHERE acc_no = $1
            AND userid = $2
          `,
          [finAccNo, user_id]
        );

        const balance = balRows[0]?.opening_balance ?? 0;

        if (Number(balance) !== 0) {
          errors.push({
            row: rowNo,
            member_no: r.member_no,
            field: "member_board_cease_date",
            // reason: `Finance balance exists for account ${finAccNo}. Clear balance (${balance}) before inactivation.`,
            reason: `Pending ledger balance (Rs. ${balance}/-) cannot upload. Clear balance before inactivation. `,
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        type: "error",
        code: "EXCEL_VALIDATION_FAILED",
        message: "Please correct the Excel and re-upload",
        errors,
      });
    }

    /* ---------------- INSERT TEMP ---------------- */

    await db.query("BEGIN");

    const uploadRes = await db.query(
      `
      INSERT INTO blk_upd_member_dtl_upload_log
      (upload_id, file_name, file_hash, uploaded_by, confirm_reupload, status)
      VALUES (nextval('blk_upd_member_upload_seq'), $1, $2, $3, $4, 'UPLOADED')
      RETURNING upload_id
      `,
      [file_name, fileHash, user_id, confirm_reupload]
    );

    const upload_id = uploadRes.rows[0].upload_id;

    await db.query(
      `DELETE FROM integral.temp_upload_update_member_dtl WHERE user_id = $1`,
      [user_id]
    );

    for (let r of rows) {
      await db.query(
        `
        INSERT INTO integral.temp_upload_update_member_dtl (
          member_no, dealer_code, dlr_name, member_active,
          member_date, member_board_appnt_date, member_board_cease_date, member_board_reinstate,
          membership_fee, member_form,
          pay_instr_no, pay_instr_date,
          start_kit_tool, start_kit_uniform, start_kit_promotion, start_kit_stationery, start_kit_all,
          member_fee_amount, forfeiture_amount, facebook_acc,
          update_id, update_date, user_id, uploaded_at
        )
        VALUES (
          $1,$2,$3,$4,
          $5,$6,$7,$8,
          $9,$10,
          $11,$12,
          $13,$14,$15,$16,$17,
          $18,$19,$20,
          $21,CURRENT_DATE,$22,NOW()
        )
        `,
        [
          r.member_no,
          r.dealer_code,
          r.dlr_name,
          yn(r.member_active),
          r._member_date,
          r._member_board_appnt_date,
          r._member_board_cease_date,
          r._member_board_reinstate,
          yn(r.membership_fee),
          yn(r.member_form),
          r.pay_instr_no,
          r._pay_instr_date,
          yn(r.start_kit_tool),
          yn(r.start_kit_uniform),
          yn(r.start_kit_promotion),
          yn(r.start_kit_stationery),
          yn(r.start_kit_all),
          r.member_fee_amount,
          r.forfeiture_amount,
          r.facebook_acc,
          user_id,
          user_id,
        ]
      );
    }

    const { rows: uploadedRows } = await db.query(
      `
      SELECT
        member_no,
        dealer_code,
        dlr_name,
        member_date,
        member_board_appnt_date,
        member_board_cease_date,
        member_board_reinstate,
        membership_fee,
        member_form,
        pay_instr_no,
        pay_instr_date,
        start_kit_tool,
        start_kit_uniform,
        start_kit_promotion,
        start_kit_stationery,
        start_kit_all,
        member_fee_amount,
        forfeiture_amount,
        facebook_acc
      FROM integral.temp_upload_update_member_dtl
      WHERE user_id = $1
      ORDER BY member_no
      `,
      [user_id]
    );

    await db.query("COMMIT");

    res.json({
      type: "success",
      message: "Member update file uploaded successfully",
      upload_id,
      inserted: rows.length,
      rows: uploadedRows,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(400).json({
      type: "error",
      message: err.message,
    });
  }
};

/* ---------------- OTHER APIS UNCHANGED ---------------- */


const updateMemberIntoMainTable = async (req, res) => {
  try {
    const { user_id, trans_year, upload_id } = req.body;

    if (!user_id || !trans_year || !upload_id) {
      return res.status(400).json({
        type: "error",
        message: "user_id, trans_year or upload_id missing",
      });
    }

    await db.query("BEGIN");

    await db.query("CALL integral.bulk_update_member_detail($1, $2, $3)", [
      user_id,
      trans_year,
      upload_id,
    ]);

    const { rows: failedMembers } = await db.query(
      `
      SELECT member_no, error_stage, error_message
      FROM integral.blk_upd_member_dtl_upload_log
      WHERE upload_id = $1 AND status = 'FAILED'
      `,
      [upload_id]
    );

    await db.query("COMMIT");

    res.json({
      type: "success",
      message: "Bulk update completed",
      failedMembers,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    res.status(400).json({
      type: "error",
      message: err.message,
    });
  }
};


const downloadMemberUpdateTemplate = async (req, res) => {
  const XLSX = require("xlsx");

  // Header row (MUST match backend keys exactly)
  const headers = [
    "member_no",
    "dealer_code",
    "dlr_name",
    // "division",
    // "member_status",
    "member_date",
    "member_board_appnt_date",
    "member_board_cease_date",
    "member_board_reinstate",
    "membership_fee",
    "member_form",
    "pay_instr_no",
    "pay_instr_date",
    "start_kit_tool",
    "start_kit_uniform",
    "start_kit_promotion",
    "start_kit_stationery",
    "start_kit_all",
    "member_fee_amount",
    "forfeiture_amount",
    "facebook_acc",
  ];

  // Dummy / sample data row
  const sampleRow = [
    "M1001", // member_no (must exist in system)
    "D001", // dealer_code (read-only)
    "ABC DEALER", // dlr_name (read-only)
    "2024-04-01", // member_date
    "2024-04-10", // member_board_appnt_date
    "", // member_board_cease_date
    "", // member_board_reinstate
    "Y", // membership_fee
    "Y", // member_form
    "PI12345", // pay_instr_no
    "2024-04-05", // pay_instr_date
    "Y", // start_kit_tool
    "N", // start_kit_uniform
    "Y", // start_kit_promotion
    "N", // start_kit_stationery
    "N", // start_kit_all
    "1500", // member_fee_amount
    "0", // forfeiture_amount
    "abc_dealer_fb", // facebook_acc
  ];

  // Create sheet data
  const sheetData = [headers, sampleRow];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Member_Update_Template");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=member_update_template.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.send(buffer);
};


module.exports = {
  uploadMemberDetailintoTemp,
  updateMemberIntoMainTable,
  downloadMemberUpdateTemplate,
};
