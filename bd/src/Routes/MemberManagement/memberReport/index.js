const express = require("express");

const {handleFormOperation,getBaseConstants} = require("../../../controllers/memberManangement/reports/memberReport");

// const { userAuth } = require("../../../middleware/auth");
const router = express.Router("router");

// router.use(userAuth) // middleware

router.get("/form-data", handleFormOperation); // new
router.get("/list-constants",getBaseConstants);

module.exports = router;


// SELECT * 
// FROM VW_LOAN_EMI_VS_PAID
// WHERE emi_date BETWEEN '2024-10-10' AND '2025-10-10';


// -- View: integral.vw_loan_emi_vs_paid

// -- DROP VIEW integral.vw_loan_emi_vs_paid;

// CREATE OR REPLACE VIEW integral.vw_loan_emi_vs_paid
//  AS
//  SELECT 'All'::text AS qry_flag,
//     d.emi_date,
//     NULL::integer AS member_id,
//     NULL::character varying AS dlr_name,
//         CASE
//             WHEN m.member_board_cease_date IS NULL THEN 'Active'::text
//             ELSE 'Inactive'::text
//         END AS active_inactive,
//     NULL::integer AS efa_id,
//     NULL::integer AS emi_sno,
//     to_char(d.emi_date, 'YYYY'::text) AS trans_year,
//     to_char(d.emi_date, 'MM'::text) AS trans_month,
//     sum(d.principal_amt) AS emi_principal,
//     sum(d.service_chg_ded) AS emi_service_chg_ded,
//     sum(d.interest_amt) AS emi_interest_amt,
//     sum(d.igst_amt) AS emi_igst_amt,
//     sum(d.cgst_amt) AS emi_cgst_amt,
//     sum(d.sgst_amt) AS emi_sgst_amt,
//     sum(d.principal_amt + d.service_chg_ded + d.interest_amt + d.igst_amt + d.cgst_amt + d.sgst_amt) AS emi_total_amt,
//     sum(r.amt_principal_adjust) AS principal_adjusted,
//     sum(r.amt_serv_chg_adjust) AS serv_chg_ded_adjusted,
//     sum(r.amt_interest_adjust) AS interest_amt_adjusted,
//     sum(r.amt_igst_adjust) AS igst_amt_adjusted,
//     sum(r.amt_cgst_adjust) AS cgst_amt_adjusted,
//     sum(r.amt_sgst_adjust) AS sgst_amt_adjusted,
//     sum(r.amount_recd) AS total_amt_adjusted
//    FROM tdlnefatran d,
//     tolnemi_receipts r,
//     thlnefatran h,
//     moedmember m
//   WHERE to_char(d.emi_date, 'YYYY-MM-DD'::text) >= '2025-09-01'::text AND to_char(d.emi_date, 'YYYY-MM-DD'::text) <= '2025-10-01'::text AND d.efa_id = r.efa_id AND d.emi_sno = r.emi_sno AND d.efa_id = h.efa_id AND m.member_id = h.member_id
//   GROUP BY (
//         CASE
//             WHEN m.member_board_cease_date IS NULL THEN 'Active'::text
//             ELSE 'Inactive'::text
//         END), d.emi_date, (to_char(d.emi_date, 'MM'::text)), (to_char(d.emi_date, 'YYYY'::text))
// UNION ALL
//  SELECT 'Single'::text AS qry_flag,
//     d.emi_date,
//     h.member_id,
//     m.dlr_name,
//         CASE
//             WHEN m.member_board_cease_date IS NULL THEN 'Active'::text
//             ELSE 'Inactive'::text
//         END AS active_inactive,
//     d.efa_id,
//     d.emi_sno,
//     to_char(d.emi_date, 'YYYY'::text) AS trans_year,
//     to_char(d.emi_date, 'MM'::text) AS trans_month,
//     sum(d.principal_amt) AS emi_principal,
//     sum(d.service_chg_ded) AS emi_service_chg_ded,
//     sum(d.interest_amt) AS emi_interest_amt,
//     sum(d.igst_amt) AS emi_igst_amt,
//     sum(d.cgst_amt) AS emi_cgst_amt,
//     sum(d.sgst_amt) AS emi_sgst_amt,
//     sum(d.principal_amt + d.service_chg_ded + d.interest_amt + d.igst_amt + d.cgst_amt + d.sgst_amt) AS emi_total_amt,
//     sum(r.amt_principal_adjust) AS principal_adjusted,
//     sum(r.amt_serv_chg_adjust) AS serv_chg_ded_adjusted,
//     sum(r.amt_interest_adjust) AS interest_amt_adjusted,
//     sum(r.amt_igst_adjust) AS igst_amt_adjusted,
//     sum(r.amt_cgst_adjust) AS cgst_amt_adjusted,
//     sum(r.amt_sgst_adjust) AS sgst_amt_adjusted,
//     sum(r.amount_recd) AS total_amt_adjusted
//    FROM tdlnefatran d,
//     tolnemi_receipts r,
//     thlnefatran h,
//     moedmember m
//   WHERE d.efa_id = r.efa_id AND d.emi_sno = r.emi_sno AND d.efa_id = h.efa_id AND m.member_id = h.member_id
//   GROUP BY h.member_id, m.dlr_name, (
//         CASE
//             WHEN m.member_board_cease_date IS NULL THEN 'Active'::text
//             ELSE 'Inactive'::text
//         END), d.emi_date, d.efa_id, d.emi_sno, (to_char(d.emi_date, 'MM'::text)), (to_char(d.emi_date, 'YYYY'::text));

// ALTER TABLE integral.vw_loan_emi_vs_paid
//     OWNER TO postgres;

