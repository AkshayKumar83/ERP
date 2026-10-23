const {
  toIntOrNull,
  toNumber,
  toDate,
} = require("../../../../utility/query");


exports.transformThmmmchlHdr = (row) => {
  return {
    // Mandatory keys
    trans_year: row.trans_year || null,
    division_id: toIntOrNull(row.division_id),

    doc_id: toNumber(row.doc_id),
    doc_no: row.doc_no || null,
    doc_date: toDate(row.doc_date),

    trans_code: toIntOrNull(row.trans_code),
    wc_id: toIntOrNull(row.wc_id),

    v_code: row.v_code || null,
    po_id: toNumber(row.po_id),

    // References
    r57f_ref: row.r57f_ref || null,
    r57f_ref_dt: toDate(row.r57f_ref_dt),

    mat_thru: row.mat_thru || null,

    ref_no: row.ref_no || null,
    ref_date: toDate(row.ref_date),

    gr_no: row.gr_no || null,
    gr_date: toDate(row.gr_date),

    // Destination
    dest_frm: row.dest_frm || null,
    dest_to: row.dest_to || null,

    // Logistics
    no_of_case: toIntOrNull(row.no_of_case),
    mode_cd: toIntOrNull(row.mode_cd),
    freg_pay: toIntOrNull(row.freg_pay) ?? 1,

    cost_centr: toIntOrNull(row.cost_centr),
    pur_code: toIntOrNull(row.pur_code),
    liability: toIntOrNull(row.liability) ?? 1,

    trnsporter: row.trnsporter || null,
    vehicle_no: row.vehicle_no || null,

    // Challan flags
    chl_type: row.chl_type || null,
    is_gst_chln:row.is_gst_chln || 'N',
    ok_flag: row.ok_flag || null,
    ok_rej: row.ok_rej || null,

    rtn_nonrtn: row.rtn_nonrtn || null,
    weight: toNumber(row.weight),

    // Remarks & printing
    remarks: row.remarks || null,
    print_ok: row.print_ok || "N",

    // Cancel / SDV
    cancel_sdv: row.cancel_sdv || "N",
    cancel_date: toDate(row.cancel_date),

    // Audit
    enter_by: toIntOrNull(row.enter_by),

    create_id: toIntOrNull(row.create_id),
    create_date: toDate(row.create_date),

    update_id: toIntOrNull(row.update_id),
    update_date: toDate(row.update_date),

    flag: row.flag || null,
    auth_pers: toIntOrNull(row.auth_pers),

    // Delivery & manual
    dlvr_note_no: row.dlvr_note_no || null,
    chl_purpose: row.chl_purpose || null,
    manual_no: row.manual_no || null,
    no_of_days: toNumber(row.no_of_days),

    manual_57f4ref_no: row.manual_57f4ref_no || null,

    // 57F4 flags
    print_57f4: row.print_57f4 || "N",
    cancel_57f4: row.cancel_57f4 || "N",
    cancel_57f4_dt: toDate(row.cancel_57f4_dt),

    // Finance
    sdr_id: toNumber(row.sdr_id),
    bill_id: toNumber(row.bill_id),
    voucher_id: toNumber(row.voucher_id),
    voucher_dt: toDate(row.voucher_dt),

    tax_amount: toNumber(row.tax_amount),
    tax_acc_code: row.tax_acc_code || null,
    tax_code: row.tax_code || null,

    // Timing
    out_time: toDate(row.out_time),

    // Flags
    nonkardex_flag: row.nonkardex_flag || "N",
    customer_flag: row.customer_flag || "N",
    inter_div: row.inter_div || "N",

    // Officers / auth
    duty_officer: row.duty_officer || null,
    auth_ein: row.auth_ein || null,

    // External refs
    st38_no: row.st38_no || null,
    srs_id: toNumber(row.srs_id),

    da_id: toNumber(row.da_id),
    req_id: toNumber(row.req_id),
    serv_call_id: toNumber(row.serv_call_id),
    lrej_id: toNumber(row.lrej_id),

    against_lrej: row.against_lrej || "N",
    rej_type: row.rej_type || "N",

    // GST totals
    t_ass_val: toNumber(row.t_ass_val),

    t_sgst_amt: toNumber(row.t_sgst_amt),
    t_sgst_cess_amt: toNumber(row.t_sgst_cess_amt),

    t_ugst_amt: toNumber(row.t_ugst_amt),
    t_ugst_cess_amt: toNumber(row.t_ugst_cess_amt),

    t_cgst_amt: toNumber(row.t_cgst_amt),
    t_cgst_cess_amt: toNumber(row.t_cgst_cess_amt),

    t_igst_amt: toNumber(row.t_igst_amt),
    t_igst_cess_amt: toNumber(row.t_igst_cess_amt),

    t_comp_cess_amt: toNumber(row.t_comp_cess_amt),

    // Electronic reference
    elec_ref_no: row.elec_ref_no || null,
    elec_ref_date: toDate(row.elec_ref_date),
  };
};


exports.transformTdmmmchl = (row, doc_id, wc_id, po_id) => {
  return {
    // 🔗 Parent reference
    doc_id: toNumber(doc_id),

    po_id: toNumber(po_id),
    wc_id: toIntOrNull(wc_id),

    it_code: row.it_code || null,


    um_code: row.um_code || null,

    // Quantities
    qty_desp: toNumber(row.qty_desp),
    qty_nos: toNumber(row.qty_nos),
    pend_qty: toNumber(row.pend_qty),

    rate: toNumber(row.rate),

    // Audit
    create_id: toIntOrNull(row.create_id),
    create_date: toDate(row.create_date),

    update_id: toIntOrNull(row.update_id),
    update_date: toDate(row.update_date),

    // Item details
    it_name: row.it_name || null,
    auto_gen_it: row.auto_gen_it || null,

    scrap_tag_no: row.scrap_tag_no || null,
    item_wt: toNumber(row.item_wt),

    remarks: row.remarks || null,

    excisable: row.excisable || "N",

    // Rejection / misc
    qty_rej_in_alt_uom: toNumber(row.qty_rej_in_alt_uom),
    commodity: toNumber(row.commodity),

    tariff: row.tariff || null,
    lrej_nos: row.lrej_nos || null,

    // GST base
    gst_amt_prc: row.gst_amt_prc || "P",

    // SGST
    gst_sgst_val: toNumber(row.gst_sgst_val),
    gst_sgst_amt: toNumber(row.gst_sgst_amt),
    gst_sgst_cess_val: toNumber(row.gst_sgst_cess_val),
    gst_sgst_cess_amt: toNumber(row.gst_sgst_cess_amt),

    // CGST
    gst_cgst_val: toNumber(row.gst_cgst_val),
    gst_cgst_amt: toNumber(row.gst_cgst_amt),
    gst_cgst_cess_val: toNumber(row.gst_cgst_cess_val),
    gst_cgst_cess_amt: toNumber(row.gst_cgst_cess_amt),

    // IGST
    gst_igst_val: toNumber(row.gst_igst_val),
    gst_igst_amt: toNumber(row.gst_igst_amt),
    gst_igst_cess_val: toNumber(row.gst_igst_cess_val),
    gst_igst_cess_amt: toNumber(row.gst_igst_cess_amt),

    // UGST
    gst_ugst_val: toNumber(row.gst_ugst_val),
    gst_ugst_amt: toNumber(row.gst_ugst_amt),
    gst_ugst_cess_val: toNumber(row.gst_ugst_cess_val),
    gst_ugst_cess_amt: toNumber(row.gst_ugst_cess_amt),

    // HSN & amount
    it_hsn_sac_code: row.it_hsn_sac_code || null,
    amount: toNumber(row.amount),

    // Compensation cess
    gst_comp_cess_val: toNumber(row.gst_comp_cess_val),
    gst_comp_cess_amount: toNumber(row.gst_comp_cess_amount),
    gst_comp_cess_amt: toNumber(row.gst_comp_cess_amt),
  };
};

exports.transformTdmmmchlBatch = (row, doc_id) => {
  return {
    doc_id: toNumber(doc_id),

    it_code: row.it_code || null,
    batch_no: row.batch_no || null,

    batch_date: toDate(row.batch_date),
    expiry_date: toDate(row.expiry_date),

    create_id: toIntOrNull(row.create_id),
    create_date: toDate(row.create_date),

    update_id: toIntOrNull(row.update_id),
    update_date: toDate(row.update_date),

    trans_code: toIntOrNull(row.trans_code),
    trans_year: row.trans_year || null,

    division_id: toNumber(row.division_id),

    qty_desp: toNumber(row.qty_desp),
    batch_qty: toNumber(row.batch_qty),

    ok_rej: row.ok_rej || null,

    cwo_id: toNumber(row.cwo_id),
    cwo_item: row.cwo_item || null,

    loca_rack_bin_desc: row.loca_rack_bin_desc || null,
  };
};

