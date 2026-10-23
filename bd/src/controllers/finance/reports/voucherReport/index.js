const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");



exports.handlePostFormData = catchAsync(async (req, res, next) => {
  try {
    const {
      trans_year,
      from_date,
      to_date
    } = req.body;

    if (!trans_year || !from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: "trans_year, from_date and to_date are required",
      });
    }

     const query = `
      SELECT
        CASE
          WHEN H.TRANS_TYPE = 'P0' THEN 'Expense Voucher'
          WHEN H.TRANS_TYPE IN ('P1', 'P4') THEN 'Purchase Voucher'
        END AS CATEGORY,

        H.VOUCHER_NO AS VOUCHER_NO,

        TO_CHAR(H.VOUCHER_DT, 'DD-MM-YYYY') AS VOUCHER_DATE,

        H.BILL_NO AS BILL_NO,

        TO_CHAR(H.BILL_DT, 'DD-MM-YYYY') AS BILL_DATE,

        D.ACC_NO AS "Acc. No.",

        G.ACC_DESC AS NAME,

        CASE
          WHEN D.DB_CR = 'D' THEN D.AMOUNT
          ELSE 0
        END AS debit,

        CASE
          WHEN D.DB_CR = 'C' THEN D.AMOUNT
          ELSE 0
        END AS credit

      FROM thfmtran H
      JOIN tdfmtran D
        ON H.VOUCHER_ID = D.VOUCHER_ID

	 JOIN mhfmglm g
         ON D.acc_no = g.acc_no

      WHERE H.TRANS_YEAR = $1
        AND H.VOUCHER_DT BETWEEN $2 AND $3
        AND H.TRANS_TYPE IN ('P0', 'P1', 'P4')

    ORDER BY
    H.VOUCHER_NO,
    CASE
        WHEN D.FLAG = 'Y' THEN 1
        ELSE 0
    END,
    D.SRL_NO;
    `;
    
    const params = [
      trans_year,
      from_date,
      to_date
    ];

    const result = await db.query(query, params);

    const formattedRows = result.rows.map((row) => ({
      ...row,
      BILL_DT: row.BILL_DT
        ? dateFormater(row.BILL_DT)
        : row.BILL_DT,
    }));

    const columns = result.fields.map((f) => f.name);

    return res.status(200).json({
      success: true,
      data: formattedRows,
      columns,
    });

  } catch (error) {
    console.error("handlePostFormData error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
