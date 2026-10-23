const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const XLSX = require("xlsx");

const { v4: uuidv4 } = require("uuid");

const TABLE_NAMES = {
  VENDOR_MASTER_TABLE: "mommvend",
  TEMP_BILL_UPLOAD_TABLE: "tofm_bulk_upld_supp_bills_temp",
  // TEMP_BILL_UPLOAD_TABLE:"temp_bulk_upld_bills",
};

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
  } = req?.query;
  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  // for party code help list
  if (help_list === "parties") {
    const parties = await db.query(
      `Select v_code, v_name from ${TABLE_NAMES.VENDOR_MASTER_TABLE}`,
    );
    return res.status(200).send(parties.rows);
  }
};

const isValidYYYYMMDD = (val) => {
  if (!val) return false;

  // If Excel date number
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (!d) return false;
    return true;
  }

  // String date check
  if (typeof val === "string") {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(val)) return false;

    const dt = new Date(val);
    return !isNaN(dt.getTime());
  }

  return false;
};

const parseBillDate = (val) => {
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(
      2,
      "0",
    )}`;
  }
  return val;
};

const toTwoDecimal = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  if (isNaN(num)) return null;
  return Number(num.toFixed(2));
};

exports.uploadBulkBills = catchAsync(async (req, res) => {
  const { file_base64, file_name, file_type, v_code, user_id } = req.body;

  console.log({ file_name, file_type, v_code, user_id });

  if (!file_base64 || !user_id || !v_code) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const base64Data = file_base64.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const dataRows = rows.slice(1);

  try {
    /* ---------------- Collect Unique Codes ---------------- */

    const glCodes = new Set();
    const subCodes = new Set();
    const itemCodes = new Set();
    const dbAccCode = new Set();

    for (const row of dataRows) {
      if (!row || row.length === 0) continue;
      // if (row[0]) glCodes.add(row[0]);
      // if (row[1]) subCodes.add(row[1]);
      // if (row[3]) itemCodes.add(row[3]);
      if (row[0]) glCodes.add(row[0]); // acc_no
      if (row[3]) subCodes.add(row[3]); // sub_code
      if (row[5]) itemCodes.add(row[5]); // item_code
      if (row[2]) dbAccCode.add(row[2]); // debit acc code
    }

    const validGL = await db.query(
      `SELECT acc_no FROM mhfmglm WHERE acc_no = ANY($1)`,
      [[...glCodes]],
    );

    const validSub = await db.query(
      `SELECT member_no FROM moedmember WHERE member_no = ANY($1)`,
      [[...subCodes]],
    );

    const validItem = await db.query(
      `SELECT it_code FROM mommitem WHERE it_code = ANY($1)`,
      [[...itemCodes]],
    );

    const validDbAcc = await db.query(
      `select acc_no from mhfmglm where acc_no = any($1)`,
      [[...dbAccCode]],
    );

    const validGLSet = new Set(validGL.rows.map((r) => r.acc_no));
    const validSubSet = new Set(validSub.rows.map((r) => r.member_no));
    const validItemSet = new Set(validItem.rows.map((r) => r.it_code));
    const validDbAccSet = new Set(validDbAcc.rows.map((r) => r.acc_no));

    /* ---------------- Start Transaction ---------------- */

    await db.query("BEGIN");

    await db.query(
      `DELETE FROM integral.tofm_bulk_upld_supp_bills_temp WHERE  user_id  = $1`,
      [user_id],
    );

    let rowNo = 1;

    console.log(dataRows);

    for (const row of dataRows) {
      rowNo++;
      if (!row || row.length === 0) continue;

      const acc_no = row[0];
      const sub_code = row[3];
      const item_code = row[5];
      const bill_date_raw = row[10];
      const debit_acc_code = row[2];

      console.log("subcode::", sub_code, row[3]);
      console.log("item_code::", item_code, row[5]);

      let errorStatus = "ok";
      let errorDesc = [];

      /* -------- VALIDATIONS -------- */

      if (!validGLSet.has(acc_no)) {
        errorStatus = "error";
        errorDesc.push(`Invalid GL Code: ${acc_no}`);
      }

      if (!validSubSet.has(sub_code)) {
        errorStatus = "error";
        errorDesc.push(`Invalid Sub Code: ${sub_code}`);
      }

      if (item_code && !validItemSet.has(item_code)) {
        errorStatus = "error";
        errorDesc.push(`Invalid Item Code: ${item_code}`);
      }

      if (debit_acc_code && !validDbAccSet.has(debit_acc_code)) {
        errorStatus = "error";
        errorDesc.push(`Invalid Debit Acc Code: ${debit_acc_code}`);
      }

      if (!isValidYYYYMMDD(bill_date_raw)) {
        errorStatus = "error";
        errorDesc.push(`Invalid Bill Date (YYYY-MM-DD required)`);
      }

      const bill_date = isValidYYYYMMDD(bill_date_raw)
        ? parseBillDate(bill_date_raw)
        : null;

      await db.query(
        `
        INSERT INTO integral.tofm_bulk_upld_supp_bills_temp (
          v_code,
          acc_no,
          sub_code,
          discount_perc,
          item_code,
          qty,
          dr_amount,
          cr_amount,
          bill_no,
          bill_date,
          remarks,
          user_id,
          error_status,
          error_desc,
          uploaded_xl_file_name,
          tds_perc,
          debit_acc_code,
          invoicing_to_be_done
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        `,
        [
          v_code,
          acc_no,
          sub_code,
          row[4] || null,
          item_code || null,
          row[6] || null,
          toTwoDecimal(row[7]),
          toTwoDecimal(row[8]),
          row[9] || null,
          bill_date,
          row[11] || null,
          user_id,
          errorStatus,
          errorDesc.length ? errorDesc.join(" | ") : null,
          file_name,
          row[1],
          row[2],
          row[12],
        ],
      );
    }

    /* ---------------- Get Preview ---------------- */

    const result = await db.query(
      `
      SELECT
        acc_no,
        sub_code,
        discount_perc,
        item_code,
        qty,
        dr_amount,
        cr_amount,
        bill_no,
        TO_CHAR(bill_date, 'YYYY-MM-DD') AS bill_date,
        remarks,
        error_status,
        error_desc,
        tds_perc,
        debit_acc_code,
        invoicing_to_be_done
      FROM integral.tofm_bulk_upld_supp_bills_temp
      WHERE user_id = $1
        AND v_code = $2
      ORDER BY bill_no;
      `,
      [user_id, v_code],
    );

    for (const row of result.rows) {
      const getAccdesc = await db.query(
        `select acc_desc from mhfmglm where acc_no = $1`,
        [row.debit_acc_code],
      );

      row.debit_acc_desc = getAccdesc.rows[0]?.acc_desc;
    }

    /* ---------------- Check Errors ---------------- */

    const errorCheck = await db.query(
      `
      SELECT COUNT(*) AS error_count
      FROM integral.tofm_bulk_upld_supp_bills_temp
      WHERE user_id = $1
        AND v_code = $2
        AND error_status = 'error'
      `,
      [user_id, v_code],
    );

    const errorCount = Number(errorCheck.rows[0].error_count);

    /* ---------------- IF ERRORS EXIST → STOP ---------------- */

    if (errorCount > 0) {
      await db.query("rollback"); // keep temp data

      return res.status(200).json({
        message: `Upload contains ${errorCount} error rows. Fix them before proceeding.`,
        hasErrors: true,
        rows: result.rows,
        total_dr_amount: 0,
        total_cr_amount: 0,
      });
    }

    /* ---------------- IF ANY DUPLICATE RECORD, SUBCODE, GST EXIST IN XL  → STOP ---------------- */

    const checkExcelError = await db.query(
      `select CHECK_SUPP_EXCEL_FILE_UPLD($1, $2) as xl_error`,
      [v_code, file_name],
    );

    console.log("checkExcelError", checkExcelError.rows[0].xl_error);

    if (checkExcelError.rows[0].xl_error) {
      throw new Error(checkExcelError.rows[0].xl_error);
    }

    /* ---------------- Totals (Only OK Rows) ---------------- */

    const totals = await db.query(
      `
      SELECT
        COALESCE(SUM(dr_amount),0) AS total_dr_amount,
        COALESCE(SUM(cr_amount),0) AS total_cr_amount
      FROM integral.tofm_bulk_upld_supp_bills_temp
      WHERE user_id = $1
        AND v_code = $2
        AND error_status = 'ok'
      `,
      [user_id, v_code],
    );

    await db.query("COMMIT");

    return res.json({
      message: "Bulk bills uploaded successfully",
      hasErrors: false,
      rows: result.rows,
      total_dr_amount: totals.rows[0].total_dr_amount,
      total_cr_amount: totals.rows[0].total_cr_amount,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    return res.status(400).json({
      message: err.message,
    });
  }
});

exports.generateSupplyChainEntry = catchAsync(async (req, res) => {
  const {
    v_code,
    file_name,
    user_id,
    po_no,
    invoice_date,
    voucher_date,
    itc_gate_entry_date,
  } = req.body;
  let gateEntryNo;
  let gstEntryNo;
  // let purchaseEntryNo;

  console.log({ v_code, file_name, user_id, po_no });

  try {
    await db.query("BEGIN");

    // #1. calling gate entry generation procedure.
    const getGateEntryNo = await db.query(
      "call cr_ge_from_supp_bills_upldd($1, current_date, $2,$3, null)",
      [v_code, file_name,itc_gate_entry_date],
    );

    gateEntryNo = getGateEntryNo.rows[0]?.oge_no;

    // #2. calling GST entry generation procedure after gate entry generation.
    const genGstEntries = await db.query(
      "call cr_gst_from_supp_bills_upldd($1, current_date, $2,$3, null)",
      [v_code, file_name,itc_gate_entry_date],
    );

    gstEntryNo = genGstEntries.rows[0]?.oitc_sr_no;

    const genPurchaseEntry = await db.query(
      "call cr_pv_from_supp_bills_upldd($1, current_date, $2, $3)",
      [v_code, file_name, voucher_date],
    );

    // purchaseEntryNo = genPurchaseEntry.rows[0]?.pv_no;

    const genInvoiceEntry = await db.query(
      "call cr_inv_from_supp_bills_upldd($1, current_date, $2, $3)",
      [v_code, file_name, invoice_date],
    );

    await db.query("COMMIT");

    return res.json({
      type: "success",
      message: "Supply chain entries generated successfully",
      gateEntryNo: gateEntryNo,
      gstEntryNo: gstEntryNo,
    });
  } catch (error) {
    console.error("Error in generating supply chain entries:", error);
    await db.query("ROLLBACK");
    return res.status(400).json({
      type: "error",
      message: error.message,
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});
