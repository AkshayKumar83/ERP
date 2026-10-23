const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  try {
    const { menu_name } = req.query;

    /* ===============================
       CASE 1: menu_name present
       ONLY keyNameList
    =============================== */
    if (menu_name) {
      const menuName = menu_name.split('*')[0];

      const keyResult = await db.query(
        `
        SELECT DISTINCT
               v.key_field AS key_value
        FROM vw_fin_table_audit_new v
        WHERE v.menu_name = $1
        ORDER BY v.key_field
        `,
        [menuName]
      );

      return res.status(200).json({
        success: true,
        keyNameList: keyResult.rows,
      });
    }

    /* ===============================
       CASE 2: Initial page load
       All dropdown data
    =============================== */

    // Division List
    const divisionResult = await db.query(`
      SELECT division_id, name FROM moitdivision
    `);

    // Trans Year List
    const transYearResult = await db.query(`
      SELECT year_code AS trans_year
      FROM moitfinyear
      ORDER BY year_code DESC
    `);

    // Menu List
    const menuResult = await db.query(`
      SELECT DISTINCT
        REPLACE(
          CASE
            WHEN trans_type IS NULL
              THEN menu_name || '*' || 'N'
            ELSE menu_name || '*' || trans_type
          END,
          '>',
          ','
        ) AS menu_name,
        REPLACE(menu_name, '_', ' ') AS menu_name_desc
      FROM vw_fin_table_audit_new
      WHERE key_field IS NOT NULL
      ORDER BY 
             REPLACE(
         CASE
           WHEN trans_type IS NULL
             THEN menu_name || '*' || 'N'
           ELSE menu_name || '*' || trans_type
         END,
         '>',
         ','
       )
    `);

    return res.status(200).json({
      success: true,
      divisionList: divisionResult.rows,
      transYearList: transYearResult.rows,
      menuList: menuResult.rows,
    });

  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dropdown data",
    });
  }
});


exports.getTransactionNumbers = catchAsync(async (req, res, next) => {
  try {
    const { menu_name, division_id, trans_year, from_date, to_date} = req.query;

    if ( !menu_name || !division_id || !trans_year || !from_date || !to_date) 
      {
      return res.status(200).json({
        success: true,
        transactionList: [],
      });
    }

    // menu_name like: BANK_VOUCHER*B
    const baseMenu = menu_name.split("*")[0];

//     const sql = `
//            select * from (  
//     select distinct f.key_field_value       /* 1. AP BILL ENTRY (GST > 0) */
//     from toitaudit_fin f
//     where f.trans_year = $1
//       and f.division_id = $2
//   and f.trans_type = 'BL'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'AP_BILL_ENTRY'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from mhapbill b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.bill_log::text    = f.key_field_value
//       and (coalesce(igst_tot_val,0)
//          + coalesce(cgst_tot_val,0)
//          + coalesce(sgst_tot_val,0)) > 0
//   )

// union all
//                                   /* 2. BANK VOUCHER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type like 'B%'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'BANK_VOUCHER'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.voucher_no::text  = f.key_field_value
//   )

// union all
//                                       /* 3. CASH VOUCHER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type = 'C1'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'CASH_VOUCHER'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmcash b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.ref_no::text      = f.key_field_value
//   )

// union all
//                                       /* 4. DEBIT / CREDIT NOTES */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type in ('RN','DN')
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'DEBIT/CREDIT_NOTES'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.voucher_no::text  = f.key_field_value
//   )

// union all
//                                  /* 5. GST DEBIT / CREDIT NOTE */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type = 'GSTDNCN'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'DEBIT_NOTE_AND_CREDIT_NOTE(GST)'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran_gst_dbcr b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.trans_no::text    = f.key_field_value
//   )

// union all
//                             /* 6. EXPENSE BILL */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type like 'P%'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'EXPENSE_BILL'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.voucher_no::text  = f.key_field_value
//       and b.bill_id is null
//   )

// union all
//                                     /* 7. PURCHASE VOUCHER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type like 'P%'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'PURCHASE_VOUCHER_ENTRY'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.voucher_no::text  = f.key_field_value
//       and b.bill_id is not null
//   )

// union all
//                                         /* 8. GENERAL LEDGER MASTER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_type = 'GL'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'GENERAL_LEDGER_MASTER'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from mhfmglm b
//     where b.acc_no::text = f.key_field_value
//   )

// union all
//                                               /* 9. ITC */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type = 'ITC'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'INPUT_TAX_CREDIT(ITC_ENTRY)'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfminwardgst b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.itc_sr_no::text   = f.key_field_value
//   )

// union all
//                                       /* 10. JOURNAL VOUCHER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type like 'J%'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'JOURNAL_VOUCHER'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.voucher_no::text  = f.key_field_value
//   )

// union all
//                                     /* 11. PAYMENT ADVISE */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type = 'PA'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'PAYMENT_ADVISE_ENTRY'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmpayadv b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.pay_advno::text   = f.key_field_value
//   )

// union all
//                                           /* 12. POST DATED BANK VOUCHER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type like 'B%'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'POST_DATED_BANK_VOUCHER'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmbank b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.ref_no::text      = f.key_field_value
//   )

// union all
//                                               /* 13. PRE GST AP BILL */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type = 'BL'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'PRE_GST_->AP_BILL_ENTRY'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from mhapbill b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.bill_log::text    = f.key_field_value
//       and (coalesce(igst_tot_val,0)
//          + coalesce(cgst_tot_val,0)
//          + coalesce(sgst_tot_val,0)) = 0
//   )

// union all
//                                           /* 14. SALES VOUCHER */
// select f.key_field_value
// from toitaudit_fin f
// where f.trans_year = $1
//   and f.division_id = $2
//   and f.trans_type like 'S1%'
//   and substr(f.key_field_value,1,1) <> '~'
//   and $3 = 'SALES_VOUCHER'
//   and f.update_date::date between $4 and $5
//   and exists (
//     select 1
//     from thfmtran b
//     where b.trans_year::text  = f.trans_year
//       and b.division_id::text = f.division_id::text
//       and b.voucher_no::text  = f.key_field_value
//   )

// ) x
// order by key_field_value;
//  `;

const sql = `
SELECT DISTINCT key_field_value
FROM (

/* 1. AP BILL ENTRY (GST > 0) */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type = 'BL'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'AP_BILL_ENTRY'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1
    FROM mhapbill b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.bill_log::text    = f.key_field_value
      AND (COALESCE(b.igst_tot_val,0)
         + COALESCE(b.cgst_tot_val,0)
         + COALESCE(b.sgst_tot_val,0)) > 0
  )

UNION ALL
/* 2. BANK VOUCHER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type LIKE 'B%'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'BANK_VOUCHER'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.voucher_no::text  = f.key_field_value
  )

UNION ALL
/* 3. CASH VOUCHER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type = 'C1'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'CASH_VOUCHER'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmcash b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.ref_no::text      = f.key_field_value
  )

UNION ALL
/* 4. DEBIT / CREDIT NOTES */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type IN ('RN','DN')
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'DEBIT/CREDIT_NOTES'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.voucher_no::text  = f.key_field_value
  )

UNION ALL
/* 5. GST DEBIT / CREDIT NOTE */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type = 'GSTDNCN'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'DEBIT_NOTE_AND_CREDIT_NOTE(GST)'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran_gst_dbcr b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.trans_no::text    = f.key_field_value
  )

UNION ALL
/* 6. EXPENSE BILL */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type LIKE 'P%'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'EXPENSE_BILL'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.voucher_no::text  = f.key_field_value
      AND b.bill_id IS NULL
  )

UNION ALL
/* 7. PURCHASE VOUCHER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type LIKE 'P%'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'PURCHASE_VOUCHER_ENTRY'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.voucher_no::text  = f.key_field_value
      AND b.bill_id IS NOT NULL
  )

UNION ALL
/* 8. GENERAL LEDGER MASTER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_type = 'GL'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'GENERAL_LEDGER_MASTER'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM mhfmglm b
    WHERE b.acc_no::text = f.key_field_value
  )

UNION ALL
/* 9. ITC */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type = 'ITC'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'INPUT_TAX_CREDIT(ITC_ENTRY)'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfminwardgst b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.itc_sr_no::text   = f.key_field_value
  )

UNION ALL
/* 10. JOURNAL VOUCHER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type LIKE 'J%'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'JOURNAL_VOUCHER'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.voucher_no::text  = f.key_field_value
  )

UNION ALL
/* 11. PAYMENT ADVISE */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type = 'PA'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'PAYMENT_ADVISE_ENTRY'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmpayadv b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.pay_advno::text   = f.key_field_value
  )

UNION ALL
/* 12. POST DATED BANK VOUCHER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type LIKE 'B%'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'POST_DATED_BANK_VOUCHER'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmbank b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.ref_no::text      = f.key_field_value
  )

UNION ALL
/* 13. PRE GST AP BILL */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type = 'BL'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'PRE_GST_->AP_BILL_ENTRY'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM mhapbill b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.bill_log::text    = f.key_field_value
      AND (COALESCE(b.igst_tot_val,0)
         + COALESCE(b.cgst_tot_val,0)
         + COALESCE(b.sgst_tot_val,0)) = 0
  )

UNION ALL
/* 14. SALES VOUCHER */
SELECT f.key_field_value
FROM toitaudit_fin f
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND f.trans_type LIKE 'S1%'
  AND substr(f.key_field_value,1,1) <> '~'
  AND $3 = 'SALES_VOUCHER'
  AND f.update_date::date BETWEEN $4 AND $5
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year::text  = f.trans_year
      AND b.division_id::text = f.division_id::text
      AND b.voucher_no::text  = f.key_field_value
  )

) t
ORDER BY key_field_value;
`

    const result = await db.query(sql, [
      trans_year,
      division_id,
      baseMenu,
      from_date,
      to_date,
    ]);

    return res.status(200).json({
      success: true,
      transactionList: result.rows,
    });

  } catch (error) {
    console.error("Error fetching transaction No. data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction data",
      error: error.message,
    });
  }
});


exports.handlePostFormData = catchAsync(async (req, res, next) => {
  try {
    const { division_id, year, from_date, to_date, menu_name, tran_no } = req.body;

    if (!division_id || !year || !from_date || !to_date || !menu_name || !tran_no) {
      return res.status(400).json({
        success: false,
        message:
          "division_id, year, menu_name, from_date, to_date and tran_no are required",
      });
    }

    const menu = menu_name.split("*")[0];

    const query = `
SELECT *
FROM (
/* ================= COMMON SELECT ================= */
SELECT DISTINCT
    f.doc_type,
    f.doc_no,
    f.division_id,
    f.trans_year || '-' || (f.trans_year::int + 1) AS trans_year,
    f.user_id,
    u.user_name,
    TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS') AS update_date,
    (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date) AS tr_date,
    f.field_name,
    f.old_value,
    f.new_value,
    f.action,
    f.table_name,
    f.year_of_change || '-' || (f.year_of_change::int + 1) AS year_of_change,
    f.key_field_value,
    get_trans_type(f.trans_type) AS trans_type
FROM toitaudit_fin f
JOIN user_master u ON u.user_id = f.user_id
WHERE f.trans_year = $1
  AND f.division_id = $2
  AND SUBSTRING(f.key_field_value,1,1) <> '~'
  AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
  AND f.key_field_value::text = CASE
        WHEN $5 = 'ALL' THEN f.key_field_value::text
        ELSE $5
      END
  AND DATE(f.update_date) BETWEEN $3 AND $4
  AND (

/* ================= 1. AP BILL ENTRY (GST > 0) ================= */
(
  $6 = 'AP_BILL_ENTRY'
  AND f.trans_type = 'BL'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1
    FROM mhapbill b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.bill_log::text = f.key_field_value
      AND (COALESCE(b.igst_tot_val,0)
         + COALESCE(b.cgst_tot_val,0)
         + COALESCE(b.sgst_tot_val,0)) > 0
  )
)

/* ================= 2. BANK VOUCHER ================= */
OR (
  $6 = 'BANK_VOUCHER'
  AND f.trans_type LIKE 'B%'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.voucher_no::text = f.key_field_value
  )
)

/* ================= 3. CASH VOUCHER ================= */
OR (
  $6 = 'CASH_VOUCHER'
  AND f.trans_type = 'C1'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmcash b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.ref_no::text = f.key_field_value
  )
)

/* ================= 4. DEBIT / CREDIT NOTES ================= */
OR (
  $6 = 'DEBIT/CREDIT_NOTES'
  AND f.trans_type IN ('RN','DN')
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.voucher_no::text = f.key_field_value
  )
)

/* ================= 5. GST DB / CR NOTES ================= */
OR (
  $6 = 'DEBIT_NOTE_AND_CREDIT_NOTE(GST)'
  AND f.trans_type = 'GSTDNCN'
  AND EXISTS (
    SELECT 1 FROM thfmtran_gst_dbcr b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.trans_no::text = f.key_field_value
  )
)

/* ================= 6. EXPENSE BILL ================= */
OR (
  $6 = 'EXPENSE_BILL'
  AND f.trans_type LIKE 'P%'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.voucher_no::text = f.key_field_value
      AND b.bill_id IS NULL
  )
)

/* ================= 7. PURCHASE VOUCHER ================= */
OR (
  $6 = 'PURCHASE_VOUCHER_ENTRY'
  AND f.trans_type LIKE 'P%'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.voucher_no::text = f.key_field_value
      AND b.bill_id IS NOT NULL
  )
)

/* ================= 8. GL MASTER ================= */
OR (
  $6 = 'GENERAL_LEDGER_MASTER'
  AND f.trans_type = 'GL'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM mhfmglm b
    WHERE b.acc_no::text = f.key_field_value
  )
)

/* ================= 9. ITC ================= */
OR (
  $6 = 'INPUT_TAX_CREDIT(ITC_ENTRY)'
  AND f.trans_type = 'ITC'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfminwardgst b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.itc_sr_no::text = f.key_field_value
  )
)

/* ================= 10. JOURNAL VOUCHER ================= */
OR (
  $6 = 'JOURNAL_VOUCHER'
  AND f.trans_type LIKE 'J%'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.voucher_no::text = f.key_field_value
  )
)

/* ================= 11. PAYMENT ADVISE ================= */
OR (
  $6 = 'PAYMENT_ADVISE_ENTRY'
  AND f.trans_type = 'PA'
  AND EXISTS (
    SELECT 1 FROM thfmpayadv b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.pay_advno::text = f.key_field_value
  )
)

/* ================= 12. POST DATED BANK ================= */
OR (
  $6 = 'POST_DATED_BANK_VOUCHER'
  AND f.trans_type LIKE 'B%'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmbank b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.ref_no::text = f.key_field_value
  )
)

/* ================= 13. PRE GST AP BILL ================= */
OR (
  $6 = 'PRE_GST_->AP_BILL_ENTRY'
  AND f.trans_type = 'BL'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM mhapbill b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.bill_log::text = f.key_field_value
      AND (COALESCE(b.igst_tot_val,0)
         + COALESCE(b.cgst_tot_val,0)
         + COALESCE(b.sgst_tot_val,0)) = 0
  )
)

/* ================= 14. SALES VOUCHER ================= */
OR (
  $6 = 'SALES_VOUCHER'
  AND f.trans_type LIKE 'S1%'
  AND f.action <> 'Insert'
  AND EXISTS (
    SELECT 1 FROM thfmtran b
    WHERE b.trans_year = f.trans_year
      AND b.division_id = f.division_id
      AND b.voucher_no::text = f.key_field_value
  )
)

)
) X
ORDER BY X.doc_no, X.tr_date DESC;
`;

    const params = [
      year,
      division_id,
      from_date,
      to_date,
      tran_no,
      menu,
    ];

    const result = await db.query(query, params);

    /* ================= DIVISION NAME MAP ================= */
    const divRes = await db.query(
      `SELECT division_id, name FROM moitdivision`
    );

    const divisionMap = {};
    divRes.rows.forEach(d => {
      divisionMap[d.division_id] = d.name;
    });

    /* ================= ORACLE-LIKE FORMAT ================= */
    let sno = 1;

    const formattedRows = result.rows.map(row => {
      let status = "Update";

      if (
        row.old_value &&
        row.old_value.startsWith("~") &&
        row.new_value === row.key_field_value
      ) {
        status = "New voucher";
      } else if (row.action === "Insert") {
        status = "New entry";
      }

      return {
        "S.NO": sno++,
        "Transaction Type": row.doc_type,
        "Transaction No": row.key_field_value,
        "Table Name": row.table_name,
        "Document Id": row.doc_no,
        "Division Name": divisionMap[row.division_id] || "",
        "Trans Year": row.trans_year,
        "User Name": row.user_name,
        "Update Date": row.update_date,
        "Field Name": row.field_name,
        "Old Content": row.old_value,
        "New Content": row.new_value,
        "Action": row.action,
        "Year Of Change": row.year_of_change,
        "Status": status,
        "Trans Type": row.trans_type,
      };
    });

    /* ================= COLUMN ORDER (FIXED) ================= */
    const columns = [
      "S.NO",
      "Transaction Type",
      "Transaction No",
      "Table Name",
      "Document Id",
      "Division Name",
      "Trans Year",
      "User Name",
      "Update Date",
      "Field Name",
      "Old Content",
      "New Content",
      "Action",
      "Year Of Change",
      "Status",
      "Trans Type",
    ];

    return res.status(200).json({
      success: true,
      count: formattedRows.length,
      columns,
      data: formattedRows,
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



// exports.handlePostFormData = catchAsync(async (req, res, next) => {

//   try {
//     const { division_id, year, from_date, to_date, menu_name, key_value, tran_no } = req.body;

//     if (!division_id || !year || !from_date || !to_date || !menu_name || !key_value || !tran_no) {
//       return res.status(400).json({
//         success: false,
//         message: "division_id, year, menu_name, from_date, to_date, key_value and tran_no are required",
//       });
//     }

//     const menu = menu_name.split("*")[0];

//     const query = `
//     SELECT *
// FROM (

// /* ================= 1. AP BILL ENTRY (GST > 0) ================= */
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1) AS trans_year,
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS') AS update_date,
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date) AS tr_date,
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1) AS year_of_change,
//     f.key_field_value,
//     get_trans_type(f.trans_type) AS trans_type
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type = 'BL'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'AP_BILL_ENTRY'
//   AND EXISTS (
//       SELECT 1 FROM mhapbill b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.bill_log::text = f.key_field_value
//         AND (COALESCE(b.igst_tot_val,0)
//            + COALESCE(b.cgst_tot_val,0)
//            + COALESCE(b.sgst_tot_val,0)) > 0
//   )

// /* ================= 2. BANK VOUCHER ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type LIKE 'B%'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'BANK_VOUCHER'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.voucher_no = f.key_field_value
//   )

// /* ================= 3. CASH VOUCHER ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type = 'C1'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'CASH_VOUCHER'
//   AND EXISTS (
//       SELECT 1 FROM thfmcash b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.ref_no = f.key_field_value
//   )

// /* ================= 4. DEBIT / CREDIT NOTES ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type IN ('RN','DN')
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'DEBIT/CREDIT_NOTES'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.voucher_no = f.key_field_value
//   )

// /* ================= 5. GST DB / CR NOTES ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type = 'GSTDNCN'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   -- Oracle me action <> 'Insert' COMMENTED hai → same rakha
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'DEBIT_NOTE_AND_CREDIT_NOTE(GST)'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran_gst_dbcr b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.trans_no = f.key_field_value
//   )

// /* ================= 6. EXPENSE BILL ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type LIKE 'P%'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'EXPENSE_BILL'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.voucher_no = f.key_field_value
//         AND b.bill_id IS NULL
//   )

// /* ================= 7. PURCHASE VOUCHER ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type LIKE 'P%'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'PURCHASE_VOUCHER_ENTRY'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.voucher_no = f.key_field_value
//         AND b.bill_id IS NOT NULL
//   )

// /* ================= 8. GL MASTER ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_type = 'GL'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND $6 = 'GENERAL_LEDGER_MASTER'
//   AND EXISTS (
//       SELECT 1 FROM mhfmglm b
//       WHERE b.acc_no = f.key_field_value
//   )

// /* ================= 9. ITC ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type = 'ITC'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'INPUT_TAX_CREDIT(ITC_ENTRY)'
//   AND EXISTS (
//       SELECT 1 FROM thfminwardgst b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.itc_sr_no = f.key_field_value
//   )

// /* ================= 10. JOURNAL VOUCHER ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type LIKE 'J%'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'JOURNAL_VOUCHER'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.voucher_no = f.key_field_value
//   )

// /* ================= 11. PAYMENT ADVISE ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type = 'PA'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   -- Oracle me action <> 'Insert' commented
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'PAYMENT_ADVISE_ENTRY'
//   AND EXISTS (
//       SELECT 1 FROM thfmpayadv b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.pay_advno = f.key_field_value
//   )

// /* ================= 12. POST DATED BANK ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type LIKE 'B%'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'POST_DATED_BANK_VOUCHER'
//   AND EXISTS (
//       SELECT 1 FROM thfmbank b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.ref_no = f.key_field_value
//   )

// /* ================= 13. PRE GST AP BILL ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type = 'BL'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'PRE_GST_->AP_BILL_ENTRY'
//   AND EXISTS (
//       SELECT 1 FROM mhapbill b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.bill_log = f.key_field_value
//         AND (COALESCE(b.igst_tot_val,0)
//            + COALESCE(b.cgst_tot_val,0)
//            + COALESCE(b.sgst_tot_val,0)) = 0
//   )

// /* ================= 14. SALES VOUCHER ================= */
// UNION ALL
// SELECT DISTINCT
//     f.doc_type, f.doc_no, f.division_id,
//     f.trans_year || '-' || (f.trans_year::int + 1),
//     f.user_id, u.user_name,
//     TO_CHAR(f.update_date,'DD-MM-YYYY HH24:MI:SS'),
//     (CURRENT_TIMESTAMP + INTERVAL '1 day' - f.update_date),
//     f.field_name, f.old_value, f.new_value,
//     f.action, f.table_name,
//     f.year_of_change || '-' || (f.year_of_change::int + 1),
//     f.key_field_value,
//     get_trans_type(f.trans_type)
// FROM toitaudit_fin f
// JOIN user_master u ON u.user_id = f.user_id
// WHERE f.trans_year = $1
//   AND f.division_id = $2
//   AND f.trans_type LIKE 'S1%'
//   AND SUBSTRING(f.key_field_value,1,1) <> '~'
//   AND COALESCE(f.old_value,'0') <> COALESCE(f.new_value,'0')
//   AND f.action <> 'Insert'
//   AND f.key_field_value = CASE WHEN $5 = 'ALL' THEN f.key_field_value ELSE $5 END
//   AND DATE(f.update_date) BETWEEN $3 AND $4
//   AND $6 = 'SALES_VOUCHER'
//   AND EXISTS (
//       SELECT 1 FROM thfmtran b
//       WHERE b.trans_year = f.trans_year
//         AND b.division_id = f.division_id
//         AND b.voucher_no = f.key_field_value
//   )

// ) X
// ORDER BY X.doc_no, X.tr_date DESC;

//     `

//     const params = [
//       year,
//       division_id,
//       from_date,
//       to_date,
//       tran_no,
//       menu
//     ];

//     const result = await db.query(query, params);
//     const columns = result.fields.map(f => f.name);

// const formattedRows = result.rows.map(row => ({
//   ...row,
//   "Update Date": dateFormater(row.update_date),
//   // update_date: undefined   // optional: old key hata do
// }));


//     return res.status(200).json({
//       success: true,
//       count: result.rowCount,
//       columns,
//       data: formattedRows
//     });
//   } catch (error) {
//     console.error("handlePostFormData error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// });