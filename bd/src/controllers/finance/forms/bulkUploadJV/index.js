const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const XLSX = require("xlsx");

const { v4: uuidv4 } = require("uuid");
const { dateFormater } = require("../../../../utility/constant");


const excelDateToJSDate = (excelDate) => {
  if (!excelDate) return null;

  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

exports.bulkUploadJV = catchAsync(async (req, res) => {
  try {
    const { file_base64, user_id } = req.body;

    if (!file_base64) {
      return res.status(400).json({ message: "File is required" });
    }

    const upload_id = uuidv4();

    /* ---------- Read Excel ---------- */
    const buffer = Buffer.from(file_base64.split(",")[1], "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: true,
    });

    if (!rawRows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    /* ---------- Normalize + Validate DR / CR ---------- */
    const rows = rawRows.map((row, index) => {
      const rowNo = index + 2;

      const acc_no = String(row.acc_no || "").trim();
      const sub_code = row.sub_code ?? null;

      const dr =
        row.dr === null || row.dr === undefined || row.dr === ""
          ? null
          : Number(row.dr);

      const cr =
        row.cr === null || row.cr === undefined || row.cr === ""
          ? null
          : Number(row.cr);

      const remarks = row.remarks || null;

      const bill_no = row.bill_no || null;
      // const bill_dt = row.bill_dt || null;
      const bill_dt =
        typeof row.bill_dt === "number"
          ? excelDateToJSDate(row.bill_dt)
          : row.bill_dt || null;

      const cost_centr = row.cost_centr || null;

      console.log('rows value', row)
      console.log(bill_no, bill_dt, cost_centr)

      if (!acc_no) {
        throw new Error(`Row ${rowNo}: Account No is required`);
      }

      if ((dr !== null && cr !== null) || (dr === null && cr === null)) {
        throw new Error(
          `Row ${rowNo}: Either DR or CR must be filled (not both)`,
        );
      }

      if ((dr !== null && dr <= 0) || (cr !== null && cr <= 0)) {
        throw new Error(
          `Row ${rowNo}: DR / CR amount must be greater than zero`,
        );
      }

      return {
        acc_no,
        sub_code,
        dr_amount: dr,
        cr_amount: cr,
        remarks,
        bill_no,
        bill_dt,
        cost_centr,

      };
    });

    /* ---------- Collect master keys ---------- */
    const accSet = [...new Set(rows.map((r) => r.acc_no))];

    const subSet = [
      ...new Set(
        rows.filter((r) => r.sub_code !== null).map((r) => r.sub_code),
      ),
    ];

    /* ---------- Validate Accounts ---------- */
    const accResult = await db.query(
      `SELECT acc_no, acc_desc
       FROM mhfmglm
       WHERE acc_no = ANY($1)`,
      [accSet],
    );

    const accMap = new Map(accResult.rows.map((r) => [r.acc_no, r.acc_desc]));

    rows.forEach((r, i) => {
      if (!accMap.has(r.acc_no)) {
        throw new Error(`Row ${i + 2}: Account No ${r.acc_no} does not exist`);
      }
    });

    /* ---------- Validate Sub Codes + Capture member_name ---------- */
    let subMap = new Map();

    if (subSet.length > 0) {
      const subResult = await db.query(
        `SELECT member_no, dlr_name
         FROM moedmember
         WHERE member_no = ANY($1)`,
        [subSet],
      );

      subMap = new Map(subResult.rows.map((r) => [r.member_no, r.dlr_name]));

      rows.forEach((r, i) => {
        if (r.sub_code !== null && !subMap.has(r.sub_code)) {
          throw new Error(
            `Row ${i + 2}: Sub Code ${r.sub_code} does not exist`,
          );
        }
      });
    }

    /* ---------- DB Transaction ---------- */
    await db.query("BEGIN");

    await db.query(
      `DELETE FROM bulk_upload_jv_temp
       WHERE uploaded_by = $1
       AND uploaded_at::date = CURRENT_DATE`,
      [user_id],
    );

    let totalDr = 0;
    let totalCr = 0;

    for (const r of rows) {
      if (r.dr_amount !== null) totalDr += r.dr_amount;
      if (r.cr_amount !== null) totalCr += r.cr_amount;

      console.log('while inserting',r.bill_no, r.bill_dt, r.cost_centr)

      await db.query(
        `
        INSERT INTO bulk_upload_jv_temp (
          acc_no,
          sub_code,
          dr_amount,
          cr_amount,
          remarks,
          upload_id,
          uploaded_by,
          bill_no,
          bill_dt,
          cost_centr
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `,
        [
          r.acc_no,
          r.sub_code,
          r.dr_amount,
          r.cr_amount,
          r.remarks,
          upload_id,
          user_id,
          r.bill_no,
          r.bill_dt,
          r.cost_centr
        ],
      );
    }

    if (totalDr !== totalCr) {
      throw new Error("JV is unbalanced (Total DR ≠ Total CR)");
    }

    await db.query("COMMIT");

    /* ---------- Preview Response ---------- */
    const previewRows = rows.map((r) => ({
      acc_no: r.acc_no,
      acc_desc: accMap.get(r.acc_no),
      sub_code: r.sub_code,
      sub_desc: r.sub_code ? subMap.get(r.sub_code) : null, // ✅ HERE
      dr: r.dr_amount,
      cr: r.cr_amount,
      remarks: r.remarks,
      bill_dt: dateFormater(r.bill_dt),
      bill_no: r.bill_no,
      cost_centr: r.cost_centr
    }));

    res.json({
      upload_id,
      inserted: rows.length,
      total_dr_amount: totalDr,
      total_cr_amount: totalCr,
      rows: previewRows,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    return res.status(400).json({
      message: err.message,
    });
  }
});


// exports.buildJvFromTempTableData = catchAsync(async (req, res) => {
//   const { user_id, trans_year } = req.body;

//   if (!user_id || !trans_year) {
//     return res.status(400).json({
//       message: "user_id and trans_year are required",
//     });
//   }

//   try {
//     /* ---------- Start Transaction ---------- */
//     await db.query("BEGIN");

//     /* ---------- Validate temp data exists ---------- */
//     const tempCheck = await db.query(
//       `
//       SELECT 
//         COALESCE(SUM(dr_amount), 0) AS total_dr,
//         COALESCE(SUM(cr_amount), 0) AS total_cr
//       FROM bulk_upload_jv_temp
//       WHERE uploaded_by = $1
//       `,
//       [user_id],
//     );

//     const { total_dr, total_cr } = tempCheck.rows[0];

//     if (Number(total_dr) === 0 && Number(total_cr) === 0) {
//       throw new Error("No uploaded JV data found to build voucher");
//     }

//     if (Number(total_dr) !== Number(total_cr)) {
//       throw new Error("JV is not balanced (Total DR ≠ Total CR)");
//     }


//     /* ---------- Call DB Procedure ---------- */
//     const result = await db.query(
//       `CALL integral.cr_pay_receive_jv($1, $2, NULL)`,
//       [user_id, trans_year],
//     );


//     const voucherNo = result.rows[0].ovoucher_no;


//     /* ---------- Cleanup temp (optional but recommended) ---------- */
//     await db.query(
//       `
//       DELETE FROM bulk_upload_jv_temp
//       WHERE uploaded_by = $1
//       `,
//       [user_id],
//     );

//     /* ---------- Commit ---------- */
//     await db.query("COMMIT");

//     res.status(200).json({
//       message: "Journal Voucher built successfully",
//       voucher_no: voucherNo,
//     });
//   } catch (err) {
//     await db.query("ROLLBACK");

//     console.error("Build JV Error:", err);

//     return res.status(400).json({
//       message: err.message || "Failed to build Journal Voucher",
//     });
//   }

// });


exports.buildJvFromTempTableData = catchAsync(async (req, res) => {
  const {file_name, user_id, trans_year} = req.body;
  // todo send file_name from frontend

  if (!user_id || !trans_year) {
    return res.status(400).json({
      message: "user_id and trans_year are required",
    });
  }

  try {
    await db.query("BEGIN");

    /* 🔒 Step 1: Lock actual rows */
    const lockResult = await db.query(
      `
      SELECT id
      FROM bulk_upload_jv_temp
      WHERE uploaded_by = $1
      FOR UPDATE
      `,
      [user_id]
    );

    if (lockResult.rowCount === 0) {
      throw new Error("No uploaded JV data found to build voucher");
    }

    /* 📊 Step 2: Now calculate totals safely */
    const tempCheck = await db.query(
      `
      SELECT 
        COALESCE(SUM(dr_amount), 0) AS total_dr,
        COALESCE(SUM(cr_amount), 0) AS total_cr
      FROM bulk_upload_jv_temp
      WHERE uploaded_by = $1
      `,
      [user_id]
    );

    const { total_dr, total_cr } = tempCheck.rows[0];

    if (Number(total_dr) !== Number(total_cr)) {
      throw new Error("JV is not balanced (Total DR ≠ Total CR)");
    }

    /* 🚀 Call Procedure */
    const result = await db.query(
      `CALL integral.cr_pay_receive_jv($1, $2, $3, NULL)`,
      [file_name, user_id, trans_year]
    );

    const voucherNo = result.rows[0]?.ovoucher_no;

    console.log(voucherNo)

    if (!voucherNo) {
      throw new Error("Voucher creation failed");
    }

    /* 🧹 Delete temp rows */
    await db.query(`DELETE FROM bulk_upload_jv_temp
       WHERE uploaded_by = $1`,
      [user_id]
    );

    await db.query("COMMIT");

    res.status(200).json({
      message: "Journal Voucher built successfully",
      voucher_no: voucherNo,
    });

  } catch (err) {
    await db.query("ROLLBACK");

    console.error("Build JV Error:", err);

    return res.status(400).json({
      message: err.message || "Failed to build Journal Voucher",
    });
  }
});


// exports.downloadBulkJVTemplate = async (req, res) => {
//   try {
//     const headers = ["acc_no", "sub_code", "dr", "cr", "remarks"];

//     const sampleRow = [
//       "L0019",
//       "M1001",
//       "1500.00",
//       "",
//       "Being JV posted",
//     ];

//     const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "JV_Template");

//     const buffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     });

//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=bulk_jv_upload_template.xlsx"
//     );

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.setHeader("Content-Length", buffer.length);

//     return res.end(buffer); 
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to generate template" });
//   }
// };




exports.downloadBulkJVTemplate = async (req, res) => {
  try {
    const headers = ["acc_no", "sub_code", "dr", "cr", "remarks", 'bill_no', 'bill_dt'];

    const sampleRow = [
      "L0019",
      "M1001",
      "1500.00",
      "",
      "Being JV posted",
      '01',
      '2026-04-01'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "JV_Template");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bulk_jv_upload_template.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Length", buffer.length);

    return res.end(buffer); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate template" });
  }
};