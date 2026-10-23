const {
  toIntOrNull,
  toNumber,
  toDate,
} = require("../../../../utility/query");


exports.transformGeHdr = (row) => {
  return {
    ge_id: toNumber(row.ge_id),
    trans_year: row.trans_year || null,
    ge_no: row.ge_no || null,
    ge_recno: toIntOrNull(row.ge_recno),

    ge_date: toDate(row.ge_date),
    division_id: toIntOrNull(row.division_id),
    wc_id: toIntOrNull(row.wc_id),
    plant_cd: toIntOrNull(row.plant_cd),

    v_code: row.v_code || null,
    order_id: toNumber(row.order_id),

    chln_no: row.chln_no || null,
    chln_date: toDate(row.chln_date),

    invoice_no: row.invoice_no || null,
    invoice_dt: toDate(row.invoice_dt),

    ship_inv_no: row.ship_inv_no || null,
    ship_inv_dt: toDate(row.ship_inv_dt),

    vendor_lotno: toNumber(row.vendor_lotno) || 1,
    expiry_dt: toDate(row.expiry_dt),

    exci_gp_no: row.exci_gp_no || null,
    exci_gp_dt: toDate(row.exci_gp_dt),

    sale_return: toIntOrNull(row.sale_return),
    charge_cd: row.charge_cd || null,
    mrir_type: row.mrir_type || null,

    trnsporter: row.trnsporter || null,
    trnsdoc_no: row.trnsdoc_no || null,
    trnsdoc_dt: toDate(row.trnsdoc_dt),

    excise_cp: row.excise_cp || null,
    excise_dt: toDate(row.excise_dt),

    no_of_case: toIntOrNull(row.no_of_case),
    pr_refno: row.pr_refno || null,
    billcashno: row.billcashno || null,

    remarks: row.remarks || null,
    remarks1: row.remarks1 || null,

    recd_by_cd: toIntOrNull(row.recd_by_cd),

    material_fr: row.material_fr || null,
    ok_rej: row.ok_rej || null,

    cancel_ge: row.cancel_ge || "N",
    // create_id: toIntOrNull(row.create_id),
    // create_date: toDate(row.create_date),

    // update_id: toIntOrNull(row.update_id),
    // update_date: toDate(row.update_date),

    po_no: row.po_no || null,
    material_type: row.material_type || null,

    st38_no: row.st38_no || null,
    inward_control_no: row.inward_control_no || null,

    cancel_remarks: row.cancel_remarks || null,
    po_id: toNumber(row.po_id),

    print_flag: row.print_flag || "N",
    print_date: toDate(row.print_date),

    temp_rct_flag: row.temp_rct_flag || "N",
    inter_div: row.inter_div || "N",

    vehicle_no: row.vehicle_no || null,
    cons_ctrl_id: toNumber(row.cons_ctrl_id),

    vehicle_name: row.vehicle_name || null,
    driver_name: row.driver_name || null,

    amd_no: toIntOrNull(row.amd_no),
    vend_qc_no: row.vend_qc_no || null,

    scrap_print_flag: row.scrap_print_flag || null,

    manuf_code: row.manuf_code || null,
    manuf_inv_no: row.manuf_inv_no || null,
    manuf_inv_dt: toDate(row.manuf_inv_dt),

    from_division: toIntOrNull(row.from_division),
    cca_id: toNumber(row.cca_id),
    ship_to:row.ship_to || null,
    freight_charges: row.freight_charges || 0,  // this column added by  js bnsl sir 06/04/26
    ship_to_type: row.ship_to_type ,
    other_charges: row.other_charges || 0,  // this column added by  js bnsl sir 17/07/26
    transport_chg_gst_perc:row.transport_chg_gst_perc || 0,  // this column added by  askhay, js bnsl sir 06/08/26


    
  };
};




exports.transformTdmmrct = (detailArray, ge_id) => {
  return detailArray.map((row) => ({
    ge_id: toNumber(ge_id),                // Inject parent ID like po_id earlier
    plant_cd: toIntOrNull(row.plant_cd),

    po_id: toNumber(row.po_id),
    order_id: toNumber(row.order_id),

    it_code: row.it_code || null,
    wc_id: toIntOrNull(row.wc_id),
    trans_code: toIntOrNull(row.trans_code) || 2,

    ok_rej: row.ok_rej || null,

    mrir_no: row.mrir_no || null,
    mrir_date: toDate(row.mrir_date),

    it_pu_um: row.it_pu_um || null,
    it_st_um: row.it_st_um || null,
    um_code: row.um_code || null,

    vitem_lotno: toNumber(row.vitem_lotno) || 1,

    rej_gpno: row.rej_gpno || null,
    rej_gpdt: toDate(row.rej_gpdt),

    status_flg: row.status_flg || 'S',
    reoffered: row.reoffered || null,
    old_mrirno: row.old_mrirno || null,

    purch_ac: row.purch_ac || null,

    qty_advise: toNumber(row.qty_advise),
    qty_recd: toNumber(row.qty_recd) || toNumber(row.recd_qty),
    qty_accptd: toNumber(row.qty_accptd) || toNumber(row.recd_qty),
    qty_ets: toNumber(row.qty_ets),
    qty_payment: toNumber(row.qty_payment),
    qty_converted: toNumber(row.qty_converted),
    qty_damaged: toNumber(row.qty_damaged) || 0,
    conversion_factor: toNumber(row.conversion_factor),

    qty_mat_fault: toNumber(row.qty_mat_fault),
    qty_prc_fault: toNumber(row.qty_prc_fault),

    rate_rs: toNumber(row.rate_rs),
    basic_val: toNumber(row.basic_val),
    excise_val: toNumber(row.excise_val),
    spl_ex_val: toNumber(row.spl_ex_val),
    cst_val: toNumber(row.cst_val),
    lst_val: toNumber(row.lst_val),
    surch_val: toNumber(row.surch_val),
    disc_val: toNumber(row.disc_val),
    net_val: toNumber(row.net_val),

    frt_val: toNumber(row.frt_val),
    ins_val: toNumber(row.ins_val),
    octori_val: toNumber(row.octori_val),

    due_date: toDate(row.due_date),
    clear_dt: toDate(row.clear_dt) ,

    no_of_case: toIntOrNull(row.no_of_case),
    dev_no: toIntOrNull(row.dev_no),
    dev_qty: toNumber(row.dev_qty),

    under_seg: toIntOrNull(row.under_seg),
    under_dc: toIntOrNull(row.under_dc),

    scrap: toIntOrNull(row.scrap),
    scrap_qty: toNumber(row.scrap_qty),

    cancel_mrir: row.cancel_mrir || "N",
    print_mrir: row.print_mrir || "N",
    print_tag: row.print_tag || "Y",

    chlnr57f_no: row.chlnr57f_no || null,
    chlnr57f_dt: toDate(row.chlnr57f_dt),

    remarks2: row.remarks2 || null,

    expiry_date: toDate(row.expiry_date),
    batch_no: row.batch_no || null,
    batch_date: toDate(row.batch_date),
    entry_dt: toDate(row.entry_dt),

    print_ok: row.print_ok || null,
    updated: row.updated || "N",

    ets_auth_id: toIntOrNull(row.ets_auth_id),
    ets_auth_dt: toDate(row.ets_auth_dt),

    inspector_cd: toIntOrNull(row.inspector_cd),
    ins_ent_dt: toDate(row.ins_ent_dt),
    ins_ent_tm: row.ins_ent_tm || null,

    movtkt_flag: row.movtkt_flag || "N",

    modvat_val: toNumber(row.modvat_val),
    modvat_perc: toNumber(row.modvat_perc),

    item_rate: toNumber(row.item_rate),
    net_rate: toNumber(row.net_rate),

    prn_ui_tag_dt: toDate(row.prn_ui_tag_dt),
    prn_qc_tag_dt: toDate(row.prn_qc_tag_dt),

    material_test: row.material_test || "N",
    dimen_test: row.dimen_test || "N",

    cancel_reason: row.cancel_reason || null,

    qty_reworked: toNumber(row.qty_reworked),

    ge_tag_ok: row.ge_tag_ok || "Y",

    prn_mrir_prn_dt: toDate(row.prn_mrir_prn_dt),

    osp_mat_rate: toNumber(row.osp_mat_rate),
    osp_ser_rate: toNumber(row.osp_ser_rate),

    qty_rej: toNumber(row.qty_rej),
    mrir_gen_by: toIntOrNull(row.mrir_gen_by),

    ddn_no: row.ddn_no || null,
    ddn_dt: toDate(row.ddn_dt),

    tmp_entry_no: row.tmp_entry_no || null,

    serv_tax_perc_amt: row.serv_tax_perc_amt || "1",
    serv_tax_value: toNumber(row.serv_tax_value),
    serv_tax_cess: toNumber(row.serv_tax_cess),
    serv_tax_amt: toNumber(row.serv_tax_amt),
    serv_tax_sed_amt: toNumber(row.serv_tax_sed_amt),

    dol_doc_id: toNumber(row.dol_doc_id),
    hsc_ex_val: toNumber(row.hsc_ex_val),

    ex_amtp_fl: toIntOrNull(row.ex_amtp_fl),

    qty_recd_in_alt_uom: toNumber(row.qty_recd_in_alt_uom),
    alter_uom: row.alter_uom || null,

    supp_rg23_no: toNumber(row.supp_rg23_no),
    supp_rg23_dt: toDate(row.supp_rg23_dt),

    it_frt_stax: toNumber(row.it_frt_stax),
    it_ins_stax: toNumber(row.it_ins_stax),
    it_additional_amt: toNumber(row.it_additional_amt),
    it_deduction_amt: toNumber(row.it_deduction_amt),

    packed_material: row.packed_material || null,

    qty_destructed: toNumber(row.qty_destructed),

    insp_report_no: row.insp_report_no || null,
    lab_report_no: row.lab_report_no || null,

    lot_actl_wight: toNumber(row.lot_actl_wight),
    actual_wt_kgs: toNumber(row.actual_wt_kgs),

    remarks: row.remarks || null,

    qty_in_no: toNumber(row.qty_in_no),
    qty_ok_in_stk_um: toNumber(row.qty_ok_in_stk_um),
    qty_mat_flt_in_stk_um: toNumber(row.qty_mat_flt_in_stk_um),
    qty_prc_flt_stk_um: toNumber(row.qty_prc_flt_stk_um),

    qty_qty_damaged_in_stk_um: toNumber(row.qty_qty_damaged_in_stk_um),
    qty_scrap_in_stk_um: toNumber(row.qty_scrap_in_stk_um),
    qty_destruct_in_stk_um: toNumber(row.qty_destruct_in_stk_um),
    qty_rework_in_stk_um: toNumber(row.qty_rework_in_stk_um),
    qty_rej_in_stk_um: toNumber(row.qty_rej_in_stk_um),
    qty_acp_in_pur_um: toNumber(row.qty_acp_in_pur_um),
  }));
};
