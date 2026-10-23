const {
  toIntOrNull,
  toNumber,
  toDate,
  toFloat,
} = require("../../../../utility/query");

exports.transformTran = (row) => {
  return {
    trans_id: toNumber(row.trans_id),

    trans_no: row.trans_no || null,
    trans_date: toDate(row.trans_date),

    division_id: toNumber(row.division_id),
    trans_year: row.trans_year || null,

    vend_cust_flag: row.vend_cust_flag || null,
    party_code: row.party_code || null,

    order_id: toNumber(row.order_id),
    prof_inv_id: toNumber(row.prof_inv_id),
    trans_type: row.trans_type || null,
    inv_id: toNumber(row.inv_id),

    cancel_flag: row.cancel_flag || "N",
    cancel_dt: toDate(row.cancel_dt),
    cancel_by: toNumber(row.cancel_by),

    auth_flag: row.auth_flag || "N",
    auth_by: toNumber(row.auth_by),
    auth_dt: toDate(row.auth_dt),

    voucher_id: toNumber(row.voucher_id),

    subject_2_reverse: row.subject_2_reverse || null,

    amount: toFloat(row.amount),

    sgst_amt: toFloat(row.sgst_amt),
    sgst_cess_amt: toFloat(row.sgst_cess_amt),
    ugst_amt: toFloat(row.ugst_amt),
    ugst_cess_amt: toFloat(row.ugst_cess_amt),
    cgst_amt: toFloat(row.cgst_amt),
    cgst_cess_amt: toFloat(row.cgst_cess_amt),
    igst_amt: toFloat(row.igst_amt),
    igst_cess_amt: toFloat(row.igst_cess_amt),
    comp_cess_amt: toFloat(row.comp_cess_amt),

    availed_amount: toFloat(row.availed_amount),
    availed_sgst_amt: toFloat(row.availed_sgst_amt),
    availed_sgst_cess_amt: toFloat(row.availed_sgst_cess_amt),
    availed_ugst_amt: toFloat(row.availed_ugst_amt),
    availed_ugst_cess_amt: toFloat(row.availed_ugst_cess_amt),
    availed_cgst_amt: toFloat(row.availed_cgst_amt),
    availed_cgst_cess_amt: toFloat(row.availed_cgst_cess_amt),
    availed_igst_amt: toFloat(row.availed_igst_amt),
    availed_igst_cess_amt: toFloat(row.availed_igst_cess_amt),
    availed_comp_cess_amt: toFloat(row.availed_comp_cess_amt),

    ge_id: toNumber(row.ge_id),
    remark: row.remark || null,

    ap_bill_id: toNumber(row.ap_bill_id),
    reason_id: toNumber(row.reason_id),

    auto_generated: row.auto_generated || "N",

    bank_acc_no: row.bank_acc_no || null,
    party_ref_no: row.party_ref_no || null,
    party_ref_date: toDate(row.party_ref_date),

    chq_no: row.chq_no || null,
    chq_dt: toDate(row.chq_dt),

    deposit_slip: row.deposit_slip || null,
    deposit_slip_dt: toDate(row.deposit_slip_dt),

    sal_pur_acc: row.sal_pur_acc || null,
    doc_thru: row.doc_thru || null,

    lut_bond_flag: row.lut_bond_flag || "N",
    db_note_type: row.db_note_type || null,

    irn_no: row.irn_no || null,
    qr_code: row.qr_code || null,

    tcs_amt: toFloat(row.tcs_amt),
    tcs_perc: toFloat(row.tcs_perc),

    sup_bill_id: toNumber(row.sup_bill_id),

    create_id: toNumber(row.create_id),
    create_date: toDate(row.create_date),
    update_id: toNumber(row.update_id),
    update_date: toDate(row.update_date),
  };
};

exports.transformTranDetails = (detailArray, trans_id) => {
  return detailArray.map((row) => ({
    trans_id: toNumber(trans_id),

    it_code: row.it_code || null,

    amount: toFloat(row.amount),
    gst_amt_prc: row.gst_amt_prc || "P",

    sgst_val: toFloat(row.sgst_val),
    sgst_amt: toFloat(row.sgst_amt),
    sgst_cess_val: toFloat(row.sgst_cess_val),
    sgst_cess_amt: toFloat(row.sgst_cess_amt),

    ugst_val: toFloat(row.ugst_val),
    ugst_amt: toFloat(row.ugst_amt),
    ugst_cess_val: toFloat(row.ugst_cess_val),
    ugst_cess_amt: toFloat(row.ugst_cess_amt),

    cgst_val: toFloat(row.cgst_val),
    cgst_amt: toFloat(row.cgst_amt),
    cgst_cess_val: toFloat(row.cgst_cess_val),
    cgst_cess_amt: toFloat(row.cgst_cess_amt),

    igst_val: toFloat(row.igst_val),
    igst_amt: toFloat(row.igst_amt),
    igst_cess_val: toFloat(row.igst_cess_val),
    igst_cess_amt: toFloat(row.igst_cess_amt),

    comp_cess_val: toFloat(row.comp_cess_val),
    comp_cess_amt: toFloat(row.comp_cess_amt),

    availed_amount: toFloat(row.availed_amount),
    availed_sgst_amt: toFloat(row.availed_sgst_amt),
    availed_sgst_cess_amt: toFloat(row.availed_sgst_cess_amt),
    availed_ugst_amt: toFloat(row.availed_ugst_amt),
    availed_ugst_cess_amt: toFloat(row.availed_ugst_cess_amt),
    availed_cgst_amt: toFloat(row.availed_cgst_amt),
    availed_cgst_cess_amt: toFloat(row.availed_cgst_cess_amt),
    availed_igst_amt: toFloat(row.availed_igst_amt),
    availed_igst_cess_amt: toFloat(row.availed_igst_cess_amt),
    availed_comp_cess_amt: toFloat(row.availed_comp_cess_amt),

    rate: toFloat(row.rate),
    qty: toFloat(row.qty),

    sal_pur_acc: row.sal_pur_acc || null,

    record_id: toNumber(row.record_id),

    create_id: toNumber(row.create_id),
    create_date: toDate(row.create_date),

    update_id: toNumber(row.update_id),
    update_date: toDate(row.update_date),
  }));
};