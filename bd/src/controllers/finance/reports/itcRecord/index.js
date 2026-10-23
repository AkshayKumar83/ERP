
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");




exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
 const {division_id} = req.query;
  try {
    const divisionResult = await db.query(`
     select name , division_id  from moitdivision WHERE DIVISION_ID = $1 `,
     [division_id]
    );

    return res.status(200).json({
      success: true,
      divisionList: divisionResult.rows,
    });

  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dropdown data",
    });
  }
});

// const ITC_SUMMARY_QUERY = `
//   WITH detail_summary AS (
//     SELECT
//       d.gst_id,
//       SUM(d.qty * d.rate * h.curr_conv) AS discounted_rate,
//       SUM(d.misc_chgs_in_fc * h.curr_conv) AS misc_chgs,
//       SUM(d.pack_forwad_amt * h.curr_conv) AS pack_for_amt,
//       SUM(d.insurance_amt) AS insurance_amt,
//       SUM(d.bcd_amt) AS bcd_amt,
//       SUM(d.bcd_edu_cess_amt) AS bcd_edu_cess_amt,
//       SUM(d.bcd_hsc_cess_amt) AS bcd_hsc_cess_amt,
//       SUM(d.igst_value) AS igst_value,
//       SUM(d.igst_cess_val) AS igst_cess_val,
//       SUM(d.igst_val_cr_allowable) AS igst_val_cr_allowable,
//       SUM(d.igst_cess_val_cr_allowable) AS igst_cess_val_cr_allowable,
//       SUM(d.igst_val_cr_availed) AS igst_val_cr_availed,
//       SUM(d.igst_cess_val_cr_availed) AS igst_cess_val_cr_availed,
//       SUM(d.sgst_value) AS sgst_value,
//       SUM(d.sgst_cess_val) AS sgst_cess_val,
//       SUM(d.sgst_val_cr_allowable) AS sgst_val_cr_allowable,
//       SUM(d.sgst_cess_val_cr_allowable) AS sgst_cess_val_cr_allowable,
//       SUM(d.sgst_val_cr_availed) AS sgst_val_cr_availed,
//       SUM(d.sgst_cess_val_cr_availed) AS sgst_cess_val_cr_availed,
//       SUM(d.cgst_value) AS cgst_value,
//       SUM(d.cgst_cess_val) AS cgst_cess_val,
//       SUM(d.cgst_val_cr_allowable) AS cgst_val_cr_allowable,
//       SUM(d.cgst_cess_val_cr_allowable) AS cgst_cess_val_cr_allowable,
//       SUM(d.cgst_val_cr_availed) AS cgst_val_cr_availed,
//       SUM(d.cgst_cess_val_cr_availed) AS cgst_cess_val_cr_availed
//     FROM thfminwardgst h
//     INNER JOIN tdfminwardgst d ON d.gst_id = h.gst_id
//     WHERE
//       h.credit_availed_date >= $1::date
//       AND h.credit_availed_date < ($2::date + INTERVAL '1 day')
//       AND ($3::text = 'B' OR COALESCE(h.auth_flag, 'N') = $3)
//       AND ($4::text = 'B' OR h.register_type = $4)
//       AND ($5::text = 'B' OR COALESCE(h.gst_registered, 'N') = $5)
//       AND ($6::int IS NULL OR h.division_id = $6)
//     GROUP BY d.gst_id
//   )
//   SELECT
//     CASE WHEN h.register_type = 'G' THEN 'Goods'
//          WHEN h.register_type = 'S' THEN 'Service' END AS "GOODS_SER",
//     h.itc_sr_no AS "ITC_SR_NO",
//     div.gst_no AS "GST_NO",
//     h.trans_year AS "TRANS_YEAR",
//     h.credit_availed_date AS "CREDIT_DATE",
//     h.v_code AS "V_CODE",
//     CASE WHEN h.v_type = 'V' THEN REPLACE(v.v_name, ',', '')
//          ELSE REPLACE(c.c_name, ',', '') END AS "PARTY_NAME",
//     CASE
//       WHEN h.v_type = 'V' THEN
//         CASE WHEN get_from_state(v.v_city, 'T', 'N') = 'INDIA' THEN 'DOMESTIC' ELSE 'IMPORTED' END
//       ELSE
//         CASE WHEN get_from_state(c.c_city, 'T', 'N') = 'INDIA' THEN 'DOMESTIC' ELSE 'IMPORTED' END
//     END AS "DOMESTIC_IMPORT",
//     CASE WHEN h.gst_registered = 'Y' THEN 'YES' ELSE 'NO' END AS "REG_YES_NO",
//     CASE WHEN h.v_type = 'V' THEN v.gst_no ELSE c.gst_no END AS "PARTY_GST_NO",
//     CASE WHEN h.cash_receipt = 'Y' THEN 'Y' ELSE 'N' END AS "CASH_RECEIPT",
//     h.doc_no AS "DOC_NO",
//     h.doc_date AS "DOC_DATE",
//     CASE WHEN h.frt_amt_prc = 'P' THEN 'Percentage'
//          WHEN h.frt_amt_prc = 'V' THEN 'Value' END AS "FREIGHT_PERCENT_VALUE",
//     h.frt_chg AS "FRT_CHG",
//     h.frt_value AS "FRT_VALUE",
//     CASE WHEN h.gst_amt_prc_f = 'P' THEN 'Percentage'
//          WHEN h.gst_amt_prc_f = 'V' THEN 'Value' END AS "GST_ON_FREIGHT",
//     h.igst_cr_perc_f AS "IGST_CR_PERC_F",
//     h.igst_cr_val_f AS "IGST_CR_VAL_F",
//     h.sgst_cr_perc_f AS "SGST_CR_PERC_F",
//     h.sgst_cr_val_f AS "SGST_CR_VAL_F",
//     h.cgst_cr_perc_f AS "CGST_CR_PERC_F",
//     h.cgst_cr_val_f AS "CGST_CR_VAL_F",
//     CASE WHEN h.ins_amt_prc = 'P' THEN 'Percentage'
//          WHEN h.ins_amt_prc = 'V' THEN 'Value' END AS "INSURANCE_PERCENT_VALUE",
//     h.ins_chg AS "INS_CHG",
//     h.ins_value AS "INS_VALUE",
//     CASE WHEN h.gst_amt_prc_i = 'P' THEN 'Percentage'
//          WHEN h.gst_amt_prc_i = 'V' THEN 'Value' END AS "GST_ON_INSURANCE",
//     h.igst_cr_perc_i AS "IGST_CR_PERC_I",
//     h.igst_cr_val_i AS "IGST_CR_VAL_I",
//     h.sgst_cr_perc_i AS "SGST_CR_PERC_I",
//     h.sgst_cr_val_i AS "SGST_CR_VAL_I",
//     h.cgst_cr_perc_i AS "CGST_CR_PERC_I",
//     h.cgst_cr_val_i AS "CGST_CR_VAL_I",
//     CASE WHEN h.auth_flag = 'Y' THEN 'YES' ELSE 'NO' END AS "AUTH_FLAG",
//     voucher.voucher_no AS "ITC_VOUCHER_NO",
//     h.t_basic_val AS "T_BASIC_VAL",
//     h.curr_cd AS "CURR_CD",
//     cur.curr_desc AS "CURR_NAME",
//     h.curr_conv AS "CURR_CONV",
//     h.eway_bill_no AS "EWAY_BILL_NO",
//     h.eway_bill_date AS "EWAY_BILL_DATE",
//     h.isd_yesno AS "ISD_YESNO",
//     h.bill_of_entry_no AS "BILL_OF_ENTRY_NO",
//     h.bill_of_entry_dt AS "BILL_OF_ENTRY_DT",
//     CASE WHEN h.whether_ge_yesno = 'Y' THEN 'Y' ELSE 'N' END AS "WHETHER_GE_YESNO",
//     rcinv.inv_no AS "RC_INV_NO",
//     COALESCE(s.discounted_rate, 0) AS "DISCOUNTED_RATE",
//     COALESCE(s.misc_chgs, 0) AS "MISC_CHGS",
//     COALESCE(s.pack_for_amt, 0) AS "PACK_FOR_AMT",
//     COALESCE(s.insurance_amt, 0) AS "INSURANCE_AMT",
//     COALESCE(s.bcd_amt, 0) AS "BCD_AMT",
//     COALESCE(s.bcd_edu_cess_amt, 0) AS "BCD_EDU_CESS_AMT",
//     COALESCE(s.bcd_hsc_cess_amt, 0) AS "BCD_HSC_CESS_AMT",
//     COALESCE(s.igst_value, 0) AS "IGST_VALUE",
//     COALESCE(s.igst_cess_val, 0) AS "IGST_CESS_VAL",
//     COALESCE(s.igst_val_cr_allowable, 0) AS "IGST_VAL_CR_ALLOWABLE",
//     COALESCE(s.igst_cess_val_cr_allowable, 0) AS "IGST_CESS_VAL_CR_ALLOWABLE",
//     COALESCE(s.igst_val_cr_availed, 0) AS "IGST_VAL_CR_AVAILED",
//     COALESCE(s.igst_cess_val_cr_availed, 0) AS "IGST_CESS_VAL_CR_AVAILED",
//     COALESCE(s.sgst_value, 0) AS "SGST_VALUE",
//     COALESCE(s.sgst_cess_val, 0) AS "SGST_CESS_VAL",
//     COALESCE(s.sgst_val_cr_allowable, 0) AS "SGST_VAL_CR_ALLOWABLE",
//     COALESCE(s.sgst_cess_val_cr_allowable, 0) AS "SGST_CESS_VAL_CR_ALLOWABLE",
//     COALESCE(s.sgst_val_cr_availed, 0) AS "SGST_VAL_CR_AVAILED",
//     COALESCE(s.sgst_cess_val_cr_availed, 0) AS "SGST_CESS_VAL_CR_AVAILED",
//     COALESCE(s.cgst_value, 0) AS "CGST_VALUE",
//     COALESCE(s.cgst_cess_val, 0) AS "CGST_CESS_VAL",
//     COALESCE(s.cgst_val_cr_allowable, 0) AS "CGST_VAL_CR_ALLOWABLE",
//     COALESCE(s.cgst_cess_val_cr_allowable, 0) AS "CGST_CESS_VAL_CR_ALLOWABLE",
//     COALESCE(s.cgst_val_cr_availed, 0) AS "CGST_VAL_CR_AVAILED",
//     COALESCE(s.cgst_cess_val_cr_availed, 0) AS "CGST_CESS_VAL_CR_AVAILED",
//     bill.bill_log AS "BILL_LOG_NO",
//     expvoucher.voucher_no AS "EXP_VOUCHER_NO",
//     CASE WHEN h.rc_applicable = 'Y' THEN 'Y' ELSE 'N' END AS "RC_APPLICABLE",
//     CASE WHEN h.transport = 'Y' THEN 'Y' ELSE 'N' END AS "TRANSPORT"
    
//    -- get_project_no(h.gst_id, h.doc_id,
//   --    CASE WHEN h.register_type = 'G' THEN 'Goods'
//   --         WHEN h.register_type = 'S' THEN 'Service' END
//   --  ) AS "PROJECT"

//   FROM thfminwardgst h
//   INNER JOIN detail_summary s ON s.gst_id = h.gst_id
//   LEFT JOIN mommvend v ON h.v_type = 'V' AND v.v_code = h.v_code
//   LEFT JOIN mosmcust c ON h.v_type <> 'V' AND c.c_code = h.v_code
//   LEFT JOIN moitdivision div ON div.division_id = h.division_id
//   LEFT JOIN currency cur ON cur.curr_code = h.curr_cd
//   LEFT JOIN LATERAL (
//     SELECT t.voucher_no FROM thfmtran t
//     WHERE t.voucher_id = h.voucher_id
//     LIMIT 1
//   ) voucher ON TRUE
//   LEFT JOIN LATERAL (
//     SELECT r.inv_no
//     FROM mhapbill_rc r
//     INNER JOIN thfminwardgst t ON t.gst_id = r.gst_id
//     WHERE t.rc_inv_id = h.rc_inv_id
//     LIMIT 1
//   ) rcinv ON TRUE
//   LEFT JOIN LATERAL (
//     SELECT b.bill_log FROM mhapbill b
//     WHERE b.division_id = h.division_id
//       AND b.v_code = h.v_code
//       AND b.bill_no = h.doc_no
//       AND b.bill_dt = h.doc_date
//     LIMIT 1
//   ) bill ON TRUE
//   LEFT JOIN LATERAL (
//     SELECT t.voucher_no FROM thfmtran t
//     WHERE t.gst_id = h.gst_id
//     LIMIT 1
//   ) expvoucher ON TRUE
//   WHERE
//     h.credit_availed_date >= $1::date
//     AND h.credit_availed_date < ($2::date + INTERVAL '1 day')
//     AND ($3::text = 'B' OR COALESCE(h.auth_flag, 'N') = $3)
//     AND ($4::text = 'B' OR h.register_type = $4)
//     AND ($5::text = 'B' OR COALESCE(h.gst_registered, 'N') = $5)
//     AND ($6::int IS NULL OR h.division_id = $6)
//   ORDER BY h.itc_sr_no;
// `;
const ITC_SUMMARY_QUERY = `
  SELECT
    h.v_code AS "VENDOR_CODE",
    REPLACE(v.v_name, ',', '') AS "VENDOR_NAME",
    d.hsn_sac_code AS "HSN_CODE",


    ROUND(SUM(
      COALESCE(d.qty, 0) *
      COALESCE(d.rate, 0) *
      COALESCE(h.curr_conv, 1)
   )::NUMERIC, 2
   ) AS "BASIC_AMT",

     ROUND(SUM(
      COALESCE(d.sgst_value, 0) 
    )::NUMERIC, 2
    ) AS "SGST_AMT",
    
    ROUND(SUM(
      COALESCE(d.cgst_value, 0) 
   )::NUMERIC, 2
    ) AS "CGST_AMT",
    
    ROUND(SUM(
      COALESCE(d.igst_value, 0) 
   )::NUMERIC, 2
    ) AS "IGST_AMT",

    ROUND(SUM(
      COALESCE(d.igst_value, 0) +
      COALESCE(d.sgst_value, 0) +
      COALESCE(d.cgst_value, 0)
     )::NUMERIC, 2
     ) AS "GST_AMT",

    ROUND(MAX(
      COALESCE(d.igst_perc, 0) +
      COALESCE(d.sgst_perc, 0) +
      COALESCE(d.cgst_perc, 0)
      )::NUMERIC, 2
    ) AS "GST_PERCENT",

    ROUND(
      (
        SUM(
          COALESCE(d.qty, 0) *
          COALESCE(d.rate, 0) *
          COALESCE(h.curr_conv, 1)
        ) +
        SUM(
          COALESCE(d.igst_value, 0) +
          COALESCE(d.sgst_value, 0) +
          COALESCE(d.cgst_value, 0)
        )
      )::NUMERIC, 2
    ) AS "TOTAL_AMT"

  FROM thfminwardgst h

  INNER JOIN tdfminwardgst d
    ON d.gst_id = h.gst_id

  LEFT JOIN mommvend v
    ON v.v_code = h.v_code

  LEFT JOIN mommitem it
    ON it.it_code = d.it_code

  WHERE
   -- h.v_type = 'V'
  --  AND
     h.credit_availed_date >= $1::date
    AND h.credit_availed_date < ($2::date + INTERVAL '1 day')
    AND ($3::text = 'B' OR COALESCE(h.auth_flag, 'N') = $3)
    AND ($4::text = 'B' OR h.register_type = $4)
    AND ($5::text = 'B' OR COALESCE(h.gst_registered, 'N') = $5)
    AND ($6::int IS NULL OR h.division_id = $6)

  GROUP BY
    h.v_code,
    v.v_name,
    d.hsn_sac_code
  

  ORDER BY
    h.v_code,
    d.hsn_sac_code;
`;

const ITC_DETAIL_QUERY = `
      SELECT
        CASE
          WHEN h.register_type = 'G' THEN 'Goods'
          WHEN h.register_type = 'S' THEN 'Service'
          ELSE NULL
        END AS "GOODS_SER",
        h.itc_sr_no AS "ITC_SR_NO",
        div.gst_no AS "GST_NO",
        h.trans_year AS "TRANS_YEAR",
        h.credit_availed_date AS "CREDIT_DATE",
        h.v_code AS "PARTY_CODE",
        CASE
          WHEN h.v_type = 'V' THEN v.v_name
          ELSE c.c_name
        END AS "PARTY_NAME",
        CASE WHEN h.gst_registered = 'Y'
             THEN 'YES' ELSE 'NO'
        END AS "REG_YES_NO",
        CASE
          WHEN h.v_type = 'V' THEN v.gst_no
          ELSE c.gst_no
        END AS "PARTY_GST_NO",
        COALESCE(h.cash_receipt, 'N') AS "CASH_RECEIPT",
        h.doc_no AS "DOC_NO",
        h.doc_date AS "DOC_DATE",
        grn.inward_control_no AS "GRN",
        CASE
          WHEN h.frt_amt_prc = 'P' THEN 'Percentage'
          WHEN h.frt_amt_prc = 'V' THEN 'Value'
        END AS "FREIGHT_PERCENT_VALUE",
        h.frt_chg AS "FRT_CHG",
        h.frt_value AS "FRT_VALUE",
        CASE
          WHEN h.gst_amt_prc_f = 'P' THEN 'Percentage'
          WHEN h.gst_amt_prc_f = 'V' THEN 'Value'
        END AS "GST_ON_FREIGHT",
        h.igst_cr_perc_f AS "IGST_CR_PERC_F",
        h.igst_cr_val_f AS "IGST_CR_VAL_F",
        h.sgst_cr_perc_f AS "SGST_CR_PERC_F",
        h.sgst_cr_val_f AS "SGST_CR_VAL_F",
        h.cgst_cr_perc_f AS "CGST_CR_PERC_F",
        h.cgst_cr_val_f AS "CGST_CR_VAL_F",
        CASE
          WHEN h.ins_amt_prc = 'P' THEN 'Percentage'
          WHEN h.ins_amt_prc = 'V' THEN 'Value'
        END AS "INSURANCE_PERCENT_VALUE",
        h.ins_chg AS "INS_CHG",
        h.ins_value AS "INS_VALUE",
        CASE
          WHEN h.gst_amt_prc_i = 'P' THEN 'Percentage'
          WHEN h.gst_amt_prc_i = 'V' THEN 'Value'
        END AS "GST_ON_INSURANCE",
        h.igst_cr_perc_i AS "IGST_CR_PERC_I",
        h.igst_cr_val_i AS "IGST_CR_VAL_I",
        h.sgst_cr_perc_i AS "SGST_CR_PERC_I",
        h.sgst_cr_val_i AS "SGST_CR_VAL_I",
        h.cgst_cr_perc_i AS "CGST_CR_PERC_I",
        h.cgst_cr_val_i AS "CGST_CR_VAL_I",
        d.it_code AS "IT_CODE",
        it.it_name AS "ITEM_NAME",
        it.hsn_sac_code AS "ITEM_HSN_SAC_CODE",
        d.um_code AS "UM_CODE",
        d.mrir_no AS "MRIR_NO",
        mr.mrir_date AS "MRIR_DATE",
        d.qty AS "QTY",
        d.rate AS "RATE",
        COALESCE(d.qty, 0) * COALESCE(d.rate, 0) AS "BASIC_VALUE",
        d.cgst_perc AS "CGST_PERC",
        d.cgst_value AS "CGST_VALUE",
        d.sgst_perc AS "SGST_PERC",
        d.sgst_value AS "SGST_VALUE",
        d.igst_perc AS "IGST_PERC",
        d.igst_value AS "IGST_VALUE",
        COALESCE(h.auth_flag, 'N') AS "AUTH_FLAG",
        voucher.voucher_no AS "ITC_VOUCHER_NO",
        h.t_basic_val AS "T_BASIC_VAL",
        CASE WHEN h.whether_ge_yesno = 'Y'
             THEN 'Y' ELSE 'N'
        END AS "WHETHER_GE_YESNO",
        rcinv.inv_no AS "RC_INV_NO",
        d.rate * h.curr_conv AS "DISCOUNTED_RATE",
        d.misc_chgs_in_fc * h.curr_conv AS "MISC_CHGS",
        d.pack_forwad_amt * h.curr_conv AS "PACK_FOR_AMT",
        h.curr_cd AS "CURR_CD",
        cur.curr_desc AS "CURR_NAME",
        h.curr_conv AS "CURR_CONV",
        h.eway_bill_no AS "EWAY_BILL_NO",
        h.eway_bill_date AS "EWAY_BILL_DATE",
        h.isd_yesno AS "ISD_YESNO",
        h.bill_of_entry_no AS "BILL_OF_ENTRY_NO",
        h.bill_of_entry_dt AS "BILL_OF_ENTRY_DT",
        d.hsn_sac_code AS "HSN_SAC_CODE",
        d.pack_forwad_prc AS "PACK_FORWAD_PRC",
        d.insurance_prc AS "INSURANCE_PRC",
        d.insurance_amt AS "INSURANCE_AMT",
        d.bcd_prc AS "BCD_PRC",
        d.bcd_amt AS "BCD_AMT",
        d.bcd_edu_cess_prc AS "BCD_EDU_CESS_PRC",
        d.bcd_edu_cess_amt AS "BCD_EDU_CESS_AMT",
        d.bcd_hsc_cess_prc AS "BCD_HSC_CESS_PRC",
        d.bcd_hsc_cess_amt AS "BCD_HSC_CESS_AMT",
        bill.bill_log AS "BILL_LOG_NO",
        expvoucher.voucher_no AS "EXP_VOUCHER_NO",
        CASE WHEN h.rc_applicable = 'Y'
             THEN 'Y' ELSE 'N'
        END AS "RC_APPLICABLE",
        CASE WHEN h.transport = 'Y'
             THEN 'Y' ELSE 'N'
        END AS "TRANSPORT"

      FROM thfminwardgst h

      INNER JOIN tdfminwardgst d
        ON d.gst_id = h.gst_id

      LEFT JOIN mommvend v
        ON h.v_type = 'V'
       AND v.v_code = h.v_code

      LEFT JOIN mosmcust c
        ON h.v_type <> 'V'
       AND c.c_code = h.v_code

      LEFT JOIN moitdivision div
        ON div.division_id = h.division_id

      LEFT JOIN mommitem it
        ON it.it_code = d.it_code

      LEFT JOIN tdmmrct mr
        ON mr.mrir_no = d.mrir_no

      LEFT JOIN currency cur
        ON cur.curr_code = h.curr_cd

      LEFT JOIN thmmrct grn
        ON h.register_type = 'G'
       AND h.doc_id IS NOT NULL
       AND grn.ge_id = h.doc_id

      LEFT JOIN LATERAL (
        SELECT t.voucher_no
        FROM thfmtran t
        WHERE t.voucher_id = h.voucher_id
        LIMIT 1
      ) voucher ON TRUE

      LEFT JOIN LATERAL (
        SELECT r.inv_no
        FROM mhapbill_rc r
        INNER JOIN thfminwardgst t
          ON t.gst_id = r.gst_id
        WHERE t.rc_inv_id = h.rc_inv_id
        LIMIT 1
      ) rcinv ON TRUE

      LEFT JOIN LATERAL (
        SELECT b.bill_log
        FROM mhapbill b
        WHERE b.division_id = h.division_id
          AND b.v_code = h.v_code
          AND b.bill_no = h.doc_no
          AND b.bill_dt = h.doc_date
        LIMIT 1
      ) bill ON TRUE

      LEFT JOIN LATERAL (
        SELECT t.voucher_no
        FROM thfmtran t
        WHERE t.gst_id = h.gst_id
          AND COALESCE(t.cancel, 'N') = 'N'
        LIMIT 1
      ) expvoucher ON TRUE

      WHERE
        h.credit_availed_date >= $1::date
        AND h.credit_availed_date < ($2::date + INTERVAL '1 day')

        AND (
          $3::text = 'B'
          OR COALESCE(h.auth_flag, 'N') = $3
        )

        AND (
          $4::text = 'B'
          OR h.register_type = $4
        )

        AND (
          $5::text = 'B'
          OR COALESCE(h.gst_registered, 'N') = $5
        )

        AND (
          $6::int IS NULL
          OR h.division_id = $6
        )

      ORDER BY h.itc_sr_no;
`;



exports.handlePostOperation = catchAsync(async (req, res, next) => {
  try {
    const {
      inv_date_from,
      inv_date_to,
      rg_goods_service,
      rg_reverse_invoice,
      rg_auth_flag,
      rg_detail_sum,
      curryear,
      global_division_id,
      division_id,
    } = req.body;

    if (!inv_date_from || !inv_date_to) {
      return res.status(400).json({
        success: false,
        message: "From date and to date are required",
      });
    }

    const queryMap = {
      D: ITC_DETAIL_QUERY,
      S: ITC_SUMMARY_QUERY,
    };

    const selectedQuery = queryMap[rg_detail_sum];

    if (!selectedQuery) {
      return res.status(400).json({
        success: false,
        message: "Invalid report type. Use D or S.",
      });
    }

    const params = [
      inv_date_from,
      inv_date_to,
      rg_auth_flag || "B",
      rg_goods_service || "B",
      rg_reverse_invoice || "B",
      division_id || null,
    ];

    const result = await db.query(selectedQuery, params);

    const dateColumns = [
      "CREDIT_DATE",
      "DOC_DATE",
      "EWAY_BILL_DATE",
      "BILL_OF_ENTRY_DT",
      "MRIR_DATE",
    ];

    const formattedRows = result.rows.map((row) => {
      const formatted = { ...row };

      for (const column of dateColumns) {
        if (formatted[column]) {
          formatted[column] = dateFormater(formatted[column]);
        }
      }

      return formatted;
    });

    return res.status(200).json({
      success: true,
      data: formattedRows,
      columns: result.fields.map((field) => field.name),
      count: formattedRows.length,
      reportType: rg_detail_sum,
    });
  } catch (error) {
    console.error("handlePostOperation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch ITC report data",
      error: error.message,
    });
  }
});
// exports.handlePostOperation = catchAsync(async (req, res, next) => {
//   try {
//     const {
//       inv_date_from,
//       inv_date_to,
//       rg_goods_service,
//       rg_reverse_invoice,
//       rg_auth_flag,
//       rg_detail_sum,
//       curryear,
//       global_division_id,
//       division_id,
//     } = req.body;

//     if (!inv_date_from || !inv_date_to) {
//       return res.status(400).json({
//         success: false,
//         message: "From date and to date are required",
//       });
//     }



    // const query = `
    //   SELECT
    //     h.itc_sr_no AS "ITC_SR_NO",
    //     h.gst_id AS "GST_ID",
    //     h.division_id AS "DIVISION_ID",
    //     h.trans_year AS "TRANS_YEAR",
    //     h.credit_availed_date AS "CREDIT_AVAILED_DATE",
    //     h.v_code AS "V_CODE",
    //     h.v_type AS "V_TYPE",

    //     CASE
    //       WHEN h.register_type = 'G' THEN 'Goods'
    //       WHEN h.register_type = 'S' THEN 'Service'
    //       ELSE NULL
    //     END AS "GOODS_SER",

    //     CASE WHEN h.gst_registered = 'Y'
    //          THEN 'YES' ELSE 'NO'
    //     END AS "REG_YES_NO",

    //     CASE WHEN h.auth_flag = 'Y'
    //          THEN 'YES' ELSE 'NO'
    //     END AS "AUTH_YES_NO",

    //     COALESCE(h.cash_receipt, 'N') AS "CASH_RECEIPT",
    //     h.doc_id AS "DOC_ID",
    //     h.doc_no AS "DOC_NO",
    //     h.doc_date AS "DOC_DATE",
    //     h.trans_code AS "TRANS_CODE",
    //     h.register_type AS "REGISTER_TYPE",
    //     h.gst_registered AS "GST_REGISTERED",
    //     h.whether_itc_eligible AS "WHETHER_ITC_ELIGIBLE",

    //     h.igst_tot_value AS "IGST_TOT_VALUE",
    //     h.igst_tot_cess_val AS "IGST_TOT_CESS_VAL",
    //     h.igst_tot_val_cr_allowable AS "IGST_TOT_VAL_CR_ALLOWABLE",
    //     h.igst_tot_cess_val_cr_allowable AS "IGST_TOT_CESS_VAL_CR_ALLOWABLE",
    //     h.igst_tot_val_cr_availed AS "IGST_TOT_VAL_CR_AVAILED",
    //     h.igst_tot_cess_val_cr_availed AS "IGST_TOT_CESS_VAL_CR_AVAILED",

    //     h.sgst_tot_value AS "SGST_TOT_VALUE",
    //     h.sgst_tot_cess_val AS "SGST_TOT_CESS_VAL",
    //     h.sgst_tot_val_cr_allowable AS "SGST_TOT_VAL_CR_ALLOWABLE",
    //     h.sgst_tot_cess_val_cr_allowable AS "SGST_TOT_CESS_VAL_CR_ALLOWABLE",
    //     h.sgst_tot_val_cr_availed AS "SGST_TOT_VAL_CR_AVAILED",
    //     h.sgst_tot_cess_val_cr_availed AS "SGST_TOT_CESS_VAL_CR_AVAILED",

    //     h.cgst_tot_value AS "CGST_TOT_VALUE",
    //     h.cgst_tot_cess_val AS "CGST_TOT_CESS_VAL",
    //     h.cgst_tot_val_cr_allowable AS "CGST_TOT_VAL_CR_ALLOWABLE",
    //     h.cgst_tot_cess_val_cr_allowable AS "CGST_TOT_CESS_VAL_CR_ALLOWABLE",
    //     h.cgst_tot_val_cr_availed AS "CGST_TOT_VAL_CR_AVAILED",
    //     h.cgst_tot_cess_val_cr_availed AS "CGST_TOT_CESS_VAL_CR_AVAILED",

    //     h.frt_amt_prc AS "FRT_AMT_PRC",
    //     h.frt_chg AS "FRT_CHG",
    //     h.frt_value AS "FRT_VALUE",
    //     h.gst_amt_prc_f AS "GST_AMT_PRC_F",

    //     h.igst_cr_perc_f AS "IGST_CR_PERC_F",
    //     h.igst_cr_val_f AS "IGST_CR_VAL_F",
    //     h.igst_cess_perc_f AS "IGST_CESS_PERC_F",
    //     h.igst_cess_val_f AS "IGST_CESS_VAL_F",

    //     h.sgst_cr_perc_f AS "SGST_CR_PERC_F",
    //     h.sgst_cr_val_f AS "SGST_CR_VAL_F",
    //     h.sgst_cess_perc_f AS "SGST_CESS_PERC_F",
    //     h.sgst_cess_val_f AS "SGST_CESS_VAL_F",

    //     h.cgst_cr_perc_f AS "CGST_CR_PERC_F",
    //     h.cgst_cr_val_f AS "CGST_CR_VAL_F",
    //     h.cgst_cess_perc_f AS "CGST_CESS_PERC_F",
    //     h.cgst_cess_val_f AS "CGST_CESS_VAL_F",

    //     h.ins_amt_prc AS "INS_AMT_PRC",
    //     h.ins_chg AS "INS_CHG",
    //     h.ins_value AS "INS_VALUE",
    //     h.gst_amt_prc_i AS "GST_AMT_PRC_I",

    //     h.igst_cr_perc_i AS "IGST_CR_PERC_I",
    //     h.igst_cr_val_i AS "IGST_CR_VAL_I",
    //     h.igst_cess_perc_i AS "IGST_CESS_PERC_I",
    //     h.igst_cess_val_i AS "IGST_CESS_VAL_I",

    //     h.sgst_cr_perc_i AS "SGST_CR_PERC_I",
    //     h.sgst_cr_val_i AS "SGST_CR_VAL_I",
    //     h.sgst_cess_perc_i AS "SGST_CESS_PERC_I",
    //     h.sgst_cess_val_i AS "SGST_CESS_VAL_I",

    //     h.cgst_cr_perc_i AS "CGST_CR_PERC_I",
    //     h.cgst_cr_val_i AS "CGST_CR_VAL_I",
    //     h.cgst_cess_perc_i AS "CGST_CESS_PERC_I",
    //     h.cgst_cess_val_i AS "CGST_CESS_VAL_I",

    //     d.it_code AS "IT_CODE",
    //     d.mrir_no AS "MRIR_NO",
    //     d.qty AS "QTY",
    //     d.rate AS "RATE",
    //     d.um_code AS "UM_CODE",
    //     d.gst_amt_prc AS "GST_AMT_PRC",

    //     d.igst_perc AS "IGST_PERC",
    //     d.igst_value AS "IGST_VALUE",
    //     d.igst_cess_perc AS "IGST_CESS_PERC",
    //     d.igst_cess_val AS "IGST_CESS_VAL",
    //     d.igst_perc_cr_allowable AS "IGST_PERC_CR_ALLOWABLE",
    //     d.igst_val_cr_allowable AS "IGST_VAL_CR_ALLOWABLE",
    //     d.igst_cess_perc_cr_allowable AS "IGST_CESS_PERC_CR_ALLOWABLE",
    //     d.igst_cess_val_cr_allowable AS "IGST_CESS_VAL_CR_ALLOWABLE",
    //     d.igst_perc_cr_availed AS "IGST_PERC_CR_AVAILED",
    //     d.igst_val_cr_availed AS "IGST_VAL_CR_AVAILED",
    //     d.igst_cess_perc_cr_availed AS "IGST_CESS_PERC_CR_AVAILED",
    //     d.igst_cess_val_cr_availed AS "IGST_CESS_VAL_CR_AVAILED",

    //     d.sgst_perc AS "SGST_PERC",
    //     d.sgst_value AS "SGST_VALUE",
    //     d.sgst_cess_perc AS "SGST_CESS_PERC",
    //     d.sgst_cess_val AS "SGST_CESS_VAL",
    //     d.sgst_perc_cr_allowable AS "SGST_PERC_CR_ALLOWABLE",
    //     d.sgst_val_cr_allowable AS "SGST_VAL_CR_ALLOWABLE",
    //     d.sgst_cess_perc_cr_allowable AS "SGST_CESS_PERC_CR_ALLOWABLE",
    //     d.sgst_cess_val_cr_allowable AS "SGST_CESS_VAL_CR_ALLOWABLE",
    //     d.sgst_perc_cr_availed AS "SGST_PERC_CR_AVAILED",
    //     d.sgst_val_cr_availed AS "SGST_VAL_CR_AVAILED",
    //     d.sgst_cess_perc_cr_availed AS "SGST_CESS_PERC_CR_AVAILED",
    //     d.sgst_cess_val_cr_availed AS "SGST_CESS_VAL_CR_AVAILED",

    //     d.cgst_perc AS "CGST_PERC",
    //     d.cgst_value AS "CGST_VALUE",
    //     d.cgst_cess_perc AS "CGST_CESS_PERC",
    //     d.cgst_cess_val AS "CGST_CESS_VAL",
    //     d.cgst_perc_cr_allowable AS "CGST_PERC_CR_ALLOWABLE",
    //     d.cgst_val_cr_allowable AS "CGST_VAL_CR_ALLOWABLE",
    //     d.cgst_cess_perc_cr_allowable AS "CGST_CESS_PERC_CR_ALLOWABLE",
    //     d.cgst_cess_val_cr_allowable AS "CGST_CESS_VAL_CR_ALLOWABLE",
    //     d.cgst_perc_cr_availed AS "CGST_PERC_CR_AVAILED",
    //     d.cgst_val_cr_availed AS "CGST_VAL_CR_AVAILED",
    //     d.cgst_cess_perc_cr_availed AS "CGST_CESS_PERC_CR_AVAILED",
    //     d.cgst_cess_val_cr_availed AS "CGST_CESS_VAL_CR_AVAILED",

    //     COALESCE(h.auth_flag, 'N') AS "AUTH_FLAG",
    //     h.voucher_id AS "VOUCHER_ID",
    //     h.t_basic_val AS "T_BASIC_VAL",

    //     CASE WHEN h.whether_ge_yesno = 'Y'
    //          THEN 'Y' ELSE 'N'
    //     END AS "WHETHER_GE_YESNO",

    //     h.rc_inv_id AS "RC_INV_ID",

    //     d.rate * h.curr_conv AS "DISCOUNTED_RATE",
    //     d.misc_chgs_in_fc * h.curr_conv AS "MISC_CHGS",
    //     d.pack_forwad_amt * h.curr_conv AS "PACK_FOR_AMT",

    //     h.curr_cd AS "CURR_CD",
    //     h.curr_conv AS "CURR_CONV",
    //     h.eway_bill_no AS "EWAY_BILL_NO",
    //     h.eway_bill_date AS "EWAY_BILL_DATE",
    //     h.isd_yesno AS "ISD_YESNO",
    //     h.bill_of_entry_no AS "BILL_OF_ENTRY_NO",
    //     h.bill_of_entry_dt AS "BILL_OF_ENTRY_DT",

    //     d.hsn_sac_code AS "HSN_SAC_CODE",
    //     d.pack_forwad_prc AS "PACK_FORWAD_PRC",
    //     d.insurance_prc AS "INSURANCE_PRC",
    //     d.insurance_amt AS "INSURANCE_AMT",
    //     d.bcd_prc AS "BCD_PRC",
    //     d.bcd_amt AS "BCD_AMT",
    //     d.bcd_edu_cess_prc AS "BCD_EDU_CESS_PRC",
    //     d.bcd_edu_cess_amt AS "BCD_EDU_CESS_AMT",
    //     d.bcd_hsc_cess_prc AS "BCD_HSC_CESS_PRC",
    //     d.bcd_hsc_cess_amt AS "BCD_HSC_CESS_AMT",

    //     CASE WHEN h.rc_applicable = 'Y'
    //          THEN 'Y' ELSE 'N'
    //     END AS "RC_APPLICABLE",

    //     CASE WHEN h.transport = 'Y'
    //          THEN 'Y' ELSE 'N'
    //     END AS "TRANSPORT",

    //     CASE
    //       WHEN h.v_type = 'V' THEN v.v_name
    //       ELSE c.c_name
    //     END AS "PARTY_NAME",

    //     CASE
    //       WHEN h.v_type = 'V' THEN v.gst_no
    //       ELSE c.gst_no
    //     END AS "PARTY_GST_NO",

    //     div.gst_no AS "DIVISION_GST_NO",
    //     it.it_name AS "ITEM_NAME",
    //     it.hsn_sac_code AS "ITEM_HSN_SAC_CODE",
    //     mr.mrir_date AS "MRIR_DATE",
    //     cur.curr_desc AS "CURR_NAME",
    //     grn.inward_control_no AS "GRN",
    //     voucher.voucher_no AS "ITC_VOUCHER_NO",
    //     expvoucher.voucher_no AS "EXP_VOUCHER_NO",
    //     rcinv.inv_no AS "RC_INV_NO",
    //     bill.bill_log AS "BILL_LOG_NO",

    //     COALESCE(d.qty, 0) * COALESCE(d.rate, 0) AS "BASIC_VALUE",

    //     CASE
    //       WHEN h.frt_amt_prc = 'P' THEN 'Percentage'
    //       WHEN h.frt_amt_prc = 'V' THEN 'Value'
    //     END AS "FREIGHT_PERCENT_VALUE",

    //     CASE
    //       WHEN h.gst_amt_prc_f = 'P' THEN 'Percentage'
    //       WHEN h.gst_amt_prc_f = 'V' THEN 'Value'
    //     END AS "GST_ON_FREIGHT",

    //     CASE
    //       WHEN h.ins_amt_prc = 'P' THEN 'Percentage'
    //       WHEN h.ins_amt_prc = 'V' THEN 'Value'
    //     END AS "INSURANCE_PERCENT_VALUE",

    //     CASE
    //       WHEN h.gst_amt_prc_i = 'P' THEN 'Percentage'
    //       WHEN h.gst_amt_prc_i = 'V' THEN 'Value'
    //     END AS "GST_ON_INSURANCE"

    //   FROM thfminwardgst h

    //   INNER JOIN tdfminwardgst d
    //     ON d.gst_id = h.gst_id

    //   LEFT JOIN mommvend v
    //     ON h.v_type = 'V'
    //    AND v.v_code = h.v_code

    //   LEFT JOIN mosmcust c
    //     ON h.v_type <> 'V'
    //    AND c.c_code = h.v_code

    //   LEFT JOIN moitdivision div
    //     ON div.division_id = h.division_id

    //   LEFT JOIN mommitem it
    //     ON it.it_code = d.it_code

    //   LEFT JOIN tdmmrct mr
    //     ON mr.mrir_no = d.mrir_no

    //   LEFT JOIN currency cur
    //     ON cur.curr_code = h.curr_cd

    //   LEFT JOIN thmmrct grn
    //     ON h.register_type = 'G'
    //    AND h.doc_id IS NOT NULL
    //    AND grn.ge_id = h.doc_id

    //   LEFT JOIN LATERAL (
    //     SELECT t.voucher_no
    //     FROM thfmtran t
    //     WHERE t.voucher_id = h.voucher_id
    //     LIMIT 1
    //   ) voucher ON TRUE

    //   LEFT JOIN LATERAL (
    //     SELECT r.inv_no
    //     FROM mhapbill_rc r
    //     INNER JOIN thfminwardgst t
    //       ON t.gst_id = r.gst_id
    //     WHERE t.rc_inv_id = h.rc_inv_id
    //     LIMIT 1
    //   ) rcinv ON TRUE

    //   LEFT JOIN LATERAL (
    //     SELECT b.bill_log
    //     FROM mhapbill b
    //     WHERE b.division_id = h.division_id
    //       AND b.v_code = h.v_code
    //       AND b.bill_no = h.doc_no
    //       AND b.bill_dt = h.doc_date
    //     LIMIT 1
    //   ) bill ON TRUE

    //   LEFT JOIN LATERAL (
    //     SELECT t.voucher_no
    //     FROM thfmtran t
    //     WHERE t.gst_id = h.gst_id
    //       AND COALESCE(t.cancel, 'N') = 'N'
    //     LIMIT 1
    //   ) expvoucher ON TRUE

    //   WHERE
    //     h.credit_availed_date >= $1::date
    //     AND h.credit_availed_date < ($2::date + INTERVAL '1 day')

    //     AND (
    //       $3::text = 'B'
    //       OR COALESCE(h.auth_flag, 'N') = $3
    //     )

    //     AND (
    //       $4::text = 'B'
    //       OR h.register_type = $4
    //     )

    //     AND (
    //       $5::text = 'B'
    //       OR COALESCE(h.gst_registered, 'N') = $5
    //     )

    //     AND (
    //       $6::int IS NULL
    //       OR h.division_id = $6
    //     )

    //   ORDER BY h.itc_sr_no;
//     `;

//     const params = [
//       inv_date_from,
//       inv_date_to,
//       rg_auth_flag || "B",
//       rg_goods_service || "B",
//       rg_reverse_invoice || "B",
//       division_id || null,
//     ];

//     const result = await db.query(query, params);

//     const formattedRows = result.rows.map((row) => ({
//       ...row,
//       CREDIT_AVAILED_DATE: row.CREDIT_AVAILED_DATE
//         ? dateFormater(row.CREDIT_AVAILED_DATE)
//         : null,
//       DOC_DATE: row.DOC_DATE
//         ? dateFormater(row.DOC_DATE)
//         : null,
//       MRIR_DATE: row.MRIR_DATE
//         ? dateFormater(row.MRIR_DATE)
//         : null,
//       EWAY_BILL_DATE: row.EWAY_BILL_DATE
//         ? dateFormater(row.EWAY_BILL_DATE)
//         : null,
//       BILL_OF_ENTRY_DT: row.BILL_OF_ENTRY_DT
//         ? dateFormater(row.BILL_OF_ENTRY_DT)
//         : null,
//     }));

//     const columns = result.fields.map((field) => field.name);

//     return res.status(200).json({
//       success: true,
//       data: formattedRows,
//       columns,
//       count: formattedRows.length,
//       reportType: "D",
//     });
//   } catch (error) {
//     console.error("handlePostOperation error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch ITC report data",
//       error: error.message,
//     });
//   }
// });



