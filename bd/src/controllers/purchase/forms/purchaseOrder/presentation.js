




// const {
//   toIntOrNull,
//   toNumber,
//   toDate,
// } = require("../../../../utility/query");


// exports.transPOLevelChargeToDbData = (data, po_id) => {
//   return {
//     po_id: po_id,   //  always header wala
//     chg_component: data.chg_component,

//     component_flag_perc_val: data.flag || "P",
//     component_val: Number(data.amount || 0),
//     component_amount: Number(data.computed_amt || 0),
//     component_subsity: data.sub_aplicable || "N",
//     component_subsidized_amt: Number(data.subsidy_amt || 0),
//   };
// };


// exports.transformMhmmpoamd = (row) => {
//   return {
//     po_id: toNumber(row.po_id),
//     po_no: row.po_no || null,
//     wc_id: toIntOrNull(row.wc_id) || 1,
//     trans_year: row.trans_year || null,
//     division_id: toIntOrNull(row.division_id),
//     category: row.category || null,
//     v_code: row.v_code || null,
//     c_code: row.c_code || null,

//     amd_no: toIntOrNull(row.amd_no),
//     amd_date: toDate(row.amd_date),

//     consg_code: row.consg_code || null,
//     po_date: toDate(row.po_date),
//     po_eff_dt: toDate(row.po_eff_dt),
//     po_end_dt: toDate(row.po_end_dt),

//     pr_id: toNumber(row.pr_id),
//     qtn_ref: row.qtn_ref || null,

//     pric_basis: toIntOrNull(row.pric_basis),
//     pack_code: toIntOrNull(row.pack_code),
//     mode_cd: toIntOrNull(row.mode_cd),

//     curr_cd: row.curr_cd || null,
//     curr_conv: toNumber(row.curr_conv),
//     pf_flg: toIntOrNull(row.pf_flg),
//     pack_for: toNumber(row.pack_for),

//     ins_per_rat: row.ins_per_rat || null,
//     ins_flg: toIntOrNull(row.ins_flg),
//     ins_chg: toNumber(row.ins_chg),

//     frt_per_rat: row.frt_per_rat || null,
//     frt_shpflg: toIntOrNull(row.frt_shpflg),
//     frt_chg: toNumber(row.frt_chg),

//     octroi_per_rat: row.octroi_per_rat || null,
//     octroi_flg: toIntOrNull(row.octroi_flg),
//     octroi_chg: toNumber(row.octroi_chg),

//     term_code: toIntOrNull(row.term_code),
//     auth_pers: toIntOrNull(row.auth_pers),
//     trial_po: row.trial_po || null,

//     desp_by: row.desp_by || null,
//     sp_ins: row.sp_ins || null,

//     prod_flg: row.prod_flg || null,
//     po_flag: row.po_flag || null,
//     flag: row.flag || null,

//     po_note: row.po_note || null,
//     spec: row.spec || null,
//     wospec: row.wospec || null,

//     cancel_flag: row.cancel_flag || "N",
//     cancel_date: toDate(row.cancel_date),

//     closer_flag: row.closer_flag || "N",
//     closer_date: toDate(row.closer_date),

//     create_id: toIntOrNull(row.user_id),
//     // create_date: toDate(row.create_date),
//     // update_id: toIntOrNull(row.user_id),
//      update_id: null,
//     // update_date: toDate(row.update_date),

//     dlvr_schd: row.dlvr_schd || null,
//     amd_reason: row.amd_reason || null,
//     our_bankers: row.our_bankers || null,
//     transport: row.transport || null,

//     total_amount: toNumber(row.total_amount) || row?.po_value,
//     prev_po_no: row.prev_po_no || null,
//     prev_po_dt: toDate(row.prev_po_dt),

//     auth_signatory_name1: row.auth_signatory_name1 || null,
//     auth_signatory_desig1: row.auth_signatory_desig1 || null,
//     auth_signatory_name2: row.auth_signatory_name2 || null,
//     auth_signatory_desig2: row.auth_signatory_desig2 || null,

//     wo_title1: row.wo_title1 || null,
//     wo_title2: row.wo_title2 || null,

//     budget_ref: row.budget_ref || null,

//     pack_for_per_rat: row.pack_for_per_rat || null,
//     pack_for_value: toNumber(row.pack_for_value),

//     cost_centr: toIntOrNull(row.cost_centr),
//     credit_days: toIntOrNull(row.credit_days),

//     po_value: toNumber(row.po_value),
//     pur_code: toIntOrNull(row.pur_code),

//     direct_to_osp: row.direct_to_osp || null,
//     prof_inv_no: row.prof_inv_no || null,
//     ins_emp_cd: row.ins_emp_cd || null,
//     st38_no: row.st38_no || null,

//     port_of_load: row.port_of_load || null,
//     port_final_dest: row.port_final_dest || null,
//     ship_from_code: row.ship_from_code || null,
//     bill_from_code: row.bill_from_code || null,
//     old_po_no: row.old_po_no || null,

//     foc_flag: row.foc_flag || "N",
//     fin_approval_dt: toDate(row.fin_approval_dt),

//     div_id_bill_to: toIntOrNull(row.div_id_bill_to),
//     div_id_ship_to: toIntOrNull(row.div_id_ship_to),

//     misc_chrgs_lbl: row.misc_chrgs_lbl || null,
//     misc_chrgs_amt: toNumber(row.misc_chrgs_amt),

//     order_acceptance: row.order_acceptance || "N",
//     mat_disp_clearance_flg: row.mat_disp_clearance_flg || null,

//     calc_gst_on_ins: row.calc_gst_on_ins || "N",
//     gst_amt_prc_i: row.gst_amt_prc_i || "P",

//     gst_sgst_val_i: toNumber(row.gst_sgst_val_i),
//     gst_sgst_cess_val_i: toNumber(row.gst_sgst_cess_val_i),
//     gst_ugst_val_i: toNumber(row.gst_ugst_val_i),
//     gst_ugst_cess_val_i: toNumber(row.gst_ugst_cess_val_i),
//     gst_cgst_val_i: toNumber(row.gst_cgst_val_i),
//     gst_cgst_cess_val_i: toNumber(row.gst_cgst_cess_val_i),
//     gst_igst_val_i: toNumber(row.gst_igst_val_i),
//     gst_igst_cess_val_i: toNumber(row.gst_igst_cess_val_i),

//     calc_gst_on_frt: row.calc_gst_on_frt || "N",
//     gst_amt_prc_f: row.gst_amt_prc_f || "P",

//     gst_sgst_val_f: toNumber(row.gst_sgst_val_f),
//     gst_sgst_cess_val_f: toNumber(row.gst_sgst_cess_val_f),
//     gst_ugst_val_f: toNumber(row.gst_ugst_val_f),
//     gst_ugst_cess_val_f: toNumber(row.gst_ugst_cess_val_f),
//     gst_cgst_val_f: toNumber(row.gst_cgst_val_f),
//     gst_cgst_cess_val_f: toNumber(row.gst_cgst_cess_val_f),
//     gst_igst_val_f: toNumber(row.gst_igst_val_f),
//     gst_igst_cess_val_f: toNumber(row.gst_igst_cess_val_f),

//     t_gst_sgst_amt: toNumber(row.t_gst_sgst_amt),
//     t_gst_sgst_cess_amt: toNumber(row.t_gst_sgst_cess_amt),
//     t_gst_ugst_amt: toNumber(row.t_gst_ugst_amt),
//     t_gst_ugst_cess_amt: toNumber(row.t_gst_ugst_cess_amt),
//     t_gst_cgst_amt: toNumber(row.t_gst_cgst_amt),
//     t_gst_cgst_cess_amt: toNumber(row.t_gst_cgst_cess_amt),
//     t_gst_igst_amt: toNumber(row.t_gst_igst_amt),
//     t_gst_igst_cess_amt: toNumber(row.t_gst_igst_cess_amt),

//     ins_chg_value: toNumber(row.ins_chg_value),
//     frt_chg_value: toNumber(row.frt_chg_value),

//     hide_rate_import_po: row.hide_rate_import_po || "Y",
//     adv_gl_acc_no:row.adv_gl_acc_no || null,
//     adv_against_po:row.adv_against_po || null,
//     subsidy_perc:row.subsidy_perc || null,
//     po_type:row.po_type,
//     brand_code:row.brand_code,
    
    
//   };
// };

// exports.transformMdmmpoitamd = (poDetailArray, po_id,userId) => {
//   return poDetailArray.map((row) => ({

//     po_id: toNumber(po_id),

//     it_code: row.it_code || null,
//     sob_perc: toNumber(row.sob_perc),

//     pack_code: toIntOrNull(row.pack_code),
//     po_um: row.po_um || null,

//     po_qty_ord: toNumber(row.po_qty_ord),
//     po_qty_bal: toNumber(row.po_qty_ord),  //copy the above po_qty_ord value in po_qty_bal
//     po_mat_rat: toNumber(row.po_mat_rat),
//     po_ser_rat: toNumber(row.po_ser_rat),
//     po_perunit: toNumber(row.po_perunit),

//     po_disc: toNumber(row.po_disc),
//     rej_allow: toNumber(row.rej_allow),

//     ex_amtp_fl: toIntOrNull(row.ex_amtp_fl),
//     ex_amt: toNumber(row.ex_amt),
//     ex_perc: toNumber(row.ex_perc),
//     spl_ex_per: toNumber(row.spl_ex_per),

//     lst_perc: toNumber(row.lst_perc),
//     cst_perc: toNumber(row.cst_perc),

//     cst_form: row.cst_form || null,
//     surch_perc: toNumber(row.surch_perc),

//     mod_vat: row.mod_vat || null,
//     remark: row.remark || null,

//   create_id: Number(userId),
//   update_id: null,


//     po_fab_chg: toNumber(row.po_fab_chg),

//     active: row.active || "Y",

//     po_disc_val: toNumber(row.po_disc_val),
//     osp_mat_perc: toNumber(row.osp_mat_perc),

//     tax_on_disc: row.tax_on_disc || null,

//     serv_tax_perc_amt: row.serv_tax_perc_amt || "N",
//     serv_tax_value: toNumber(row.serv_tax_value),
//     serv_tax_cess: toNumber(row.serv_tax_cess),

//     serv_tax_recov: row.serv_tax_recov || "N",
//     serv_tax_on_material: row.serv_tax_on_material || "N",

//     schd_chk_flag: row.schd_chk_flag || null,
//     sch_tol_perc: toNumber(row.sch_tol_perc),

//     free_item_flg: row.free_item_flg || "N",
//     po_qty_free: toNumber(row.po_qty_free),

//     hsc_ex_perc: toNumber(row.hsc_ex_perc),
//     serv_tax_hsc: toNumber(row.serv_tax_hsc),

//     po_it_wgt: toNumber(row.po_it_wgt),
//     // po_basic_rat: toNumber(row.po_basic_rat), block it as we rename the po_basic_rat to it_taxable_val
//     it_taxable_val: toNumber(row?.amount) || 0,

//     ex_inclusiv: row.ex_inclusiv || "N",

//     alter_uom: row.alter_uom || null,

//     spl_add_cd_perc_amt: row.spl_add_cd_perc_amt || "1",
//     spl_add_cd_value: toNumber(row.spl_add_cd_value),

//     incl_servtax_in_sales_tax: row.incl_servtax_in_sales_tax || "N",

//     gst_amt_prc: row.gst_amt_prc || "P",

//     gst_sgst_val: toNumber(row.gst_sgst_val)||0,
//     gst_sgst_amt: toNumber(row.gst_sgst_amt)||0,
//     gst_sgst_cess_val: toNumber(row.gst_sgst_cess_val)||0,
//     gst_sgst_cess_amt: toNumber(row.gst_sgst_cess_amt)||0,

//     gst_ugst_val: toNumber(row.gst_ugst_val)||0,
//     gst_ugst_amt: toNumber(row.gst_ugst_amt)||0,
//     gst_ugst_cess_val: toNumber(row.gst_ugst_cess_val)||0,
//     gst_ugst_cess_amt: toNumber(row.gst_ugst_cess_amt)||0,

//     gst_cgst_val: toNumber(row.gst_cgst_val)||0,
//     gst_cgst_amt: toNumber(row.gst_cgst_amt)||0,
//     gst_cgst_cess_val: toNumber(row.gst_cgst_cess_val)||0,
//     gst_cgst_cess_amt: toNumber(row.gst_cgst_cess_amt)||0,

//     gst_igst_val: toNumber(row.gst_igst_val)||0,
//     gst_igst_amt: toNumber(row.gst_igst_amt)||0,
//     gst_igst_cess_val: toNumber(row.gst_igst_cess_val)||0,
//     gst_igst_cess_amt: toNumber(row.gst_igst_cess_amt)||0,

//     po_qty_in_stk_uom: toNumber(row.po_qty_in_stk_uom),
//     print_qty_in_stk: row.print_qty_in_stk || "P",

//     filer: row.filer || "N",
//     subsidy_applicable: row.subsidy_applicable || "N"

//   }));
// };







const {
  toIntOrNull,
  toNumber,
  toDate,
} = require("../../../../utility/query");


exports.transPOLevelChargeToDbData = (data, po_id) => {
  return {
    po_id: po_id,   //  always header wala
    chg_component: data.chg_component,

    component_flag_perc_val: data.flag || "P",
    component_val: Number(data.amount || 0),
    component_amount: Number(data.computed_amt || 0),
    component_subsity: data.sub_aplicable || "N",
    component_subsidized_amt: Number(data.subsidy_amt || 0),
  };
};


exports.transformMhmmpoamd = (row) => {
  return {
    po_id: toNumber(row.po_id),
    po_no: row.po_no || null,
    wc_id: toIntOrNull(row.wc_id) || 1,
    trans_year: row.trans_year || null,
    division_id: toIntOrNull(row.division_id),
    category: row.category || null,
    v_code: row.v_code || null,
    c_code: row.c_code || null,

    amd_no: toIntOrNull(row.amd_no),
    amd_date: toDate(row.amd_date),

    consg_code: row.consg_code || null,
    po_date: toDate(row.po_date),
    po_eff_dt: toDate(row.po_eff_dt),
    po_end_dt: toDate(row.po_end_dt),

    pr_id: toNumber(row.pr_id),
    qtn_ref: row.qtn_ref || null,

    pric_basis: toIntOrNull(row.pric_basis),
    pack_code: toIntOrNull(row.pack_code),
    mode_cd: toIntOrNull(row.mode_cd),

    curr_cd: row.curr_cd || null,
    curr_conv: toNumber(row.curr_conv),
    pf_flg: toIntOrNull(row.pf_flg),
    pack_for: toNumber(row.pack_for),

    ins_per_rat: row.ins_per_rat || null,
    ins_flg: toIntOrNull(row.ins_flg),
    ins_chg: toNumber(row.ins_chg),

    frt_per_rat: row.frt_per_rat || null,
    frt_shpflg: toIntOrNull(row.frt_shpflg),
    frt_chg: toNumber(row.frt_chg),

    octroi_per_rat: row.octroi_per_rat || null,
    octroi_flg: toIntOrNull(row.octroi_flg),
    octroi_chg: toNumber(row.octroi_chg),

    term_code: toIntOrNull(row.term_code),
    auth_pers: toIntOrNull(row.auth_pers),
    trial_po: row.trial_po || null,

    desp_by: row.desp_by || null,
    sp_ins: row.sp_ins || null,

    prod_flg: row.prod_flg || null,
    po_flag: row.po_flag || null,
    flag: row.flag || null,

    po_note: row.po_note || null,
    spec: row.spec || null,
    wospec: row.wospec || null,

    cancel_flag: row.cancel_flag || "N",
    cancel_date: toDate(row.cancel_date),

    closer_flag: row.closer_flag || "N",
    closer_date: toDate(row.closer_date),

    create_id: toIntOrNull(row.user_id),
    // create_date: toDate(row.create_date),
    // update_id: toIntOrNull(row.user_id),
     update_id: null,
    // update_date: toDate(row.update_date),

    dlvr_schd: row.dlvr_schd || null,
    amd_reason: row.amd_reason || null,
    our_bankers: row.our_bankers || null,
    transport: row.transport || null,

    total_amount: toNumber(row.total_amount) || row?.po_value,
    prev_po_no: row.prev_po_no || null,
    prev_po_dt: toDate(row.prev_po_dt),

    auth_signatory_name1: row.auth_signatory_name1 || null,
    auth_signatory_desig1: row.auth_signatory_desig1 || null,
    auth_signatory_name2: row.auth_signatory_name2 || null,
    auth_signatory_desig2: row.auth_signatory_desig2 || null,

    wo_title1: row.wo_title1 || null,
    wo_title2: row.wo_title2 || null,

    budget_ref: row.budget_ref || null,

    pack_for_per_rat: row.pack_for_per_rat || null,
    pack_for_value: toNumber(row.pack_for_value),

    cost_centr: toIntOrNull(row.cost_centr),
    credit_days: toIntOrNull(row.credit_days),

    po_value: toNumber(row.po_value),
    pur_code: toIntOrNull(row.pur_code),

    direct_to_osp: row.direct_to_osp || null,
    prof_inv_no: row.prof_inv_no || null,
    ins_emp_cd: row.ins_emp_cd || null,
    st38_no: row.st38_no || null,

    port_of_load: row.port_of_load || null,
    port_final_dest: row.port_final_dest || null,
    ship_from_code: row.ship_from_code || null,
    bill_from_code: row.bill_from_code || null,
    old_po_no: row.old_po_no || null,

    foc_flag: row.foc_flag || "N",
    fin_approval_dt: toDate(row.fin_approval_dt),

    div_id_bill_to: toIntOrNull(row.div_id_bill_to),
    div_id_ship_to: toIntOrNull(row.div_id_ship_to),

    misc_chrgs_lbl: row.misc_chrgs_lbl || null,
    misc_chrgs_amt: toNumber(row.misc_chrgs_amt),

    order_acceptance: row.order_acceptance || "N",
    mat_disp_clearance_flg: row.mat_disp_clearance_flg || null,

    calc_gst_on_ins: row.calc_gst_on_ins || "N",
    gst_amt_prc_i: row.gst_amt_prc_i || "P",

    gst_sgst_val_i: toNumber(row.gst_sgst_val_i),
    gst_sgst_cess_val_i: toNumber(row.gst_sgst_cess_val_i),
    gst_ugst_val_i: toNumber(row.gst_ugst_val_i),
    gst_ugst_cess_val_i: toNumber(row.gst_ugst_cess_val_i),
    gst_cgst_val_i: toNumber(row.gst_cgst_val_i),
    gst_cgst_cess_val_i: toNumber(row.gst_cgst_cess_val_i),
    gst_igst_val_i: toNumber(row.gst_igst_val_i),
    gst_igst_cess_val_i: toNumber(row.gst_igst_cess_val_i),

    calc_gst_on_frt: row.calc_gst_on_frt || "N",
    gst_amt_prc_f: row.gst_amt_prc_f || "P",

    gst_sgst_val_f: toNumber(row.gst_sgst_val_f),
    gst_sgst_cess_val_f: toNumber(row.gst_sgst_cess_val_f),
    gst_ugst_val_f: toNumber(row.gst_ugst_val_f),
    gst_ugst_cess_val_f: toNumber(row.gst_ugst_cess_val_f),
    gst_cgst_val_f: toNumber(row.gst_cgst_val_f),
    gst_cgst_cess_val_f: toNumber(row.gst_cgst_cess_val_f),
    gst_igst_val_f: toNumber(row.gst_igst_val_f),
    gst_igst_cess_val_f: toNumber(row.gst_igst_cess_val_f),

    t_gst_sgst_amt: toNumber(row.t_gst_sgst_amt),
    t_gst_sgst_cess_amt: toNumber(row.t_gst_sgst_cess_amt),
    t_gst_ugst_amt: toNumber(row.t_gst_ugst_amt),
    t_gst_ugst_cess_amt: toNumber(row.t_gst_ugst_cess_amt),
    t_gst_cgst_amt: toNumber(row.t_gst_cgst_amt),
    t_gst_cgst_cess_amt: toNumber(row.t_gst_cgst_cess_amt),
    t_gst_igst_amt: toNumber(row.t_gst_igst_amt),
    t_gst_igst_cess_amt: toNumber(row.t_gst_igst_cess_amt),

    ins_chg_value: toNumber(row.ins_chg_value),
    frt_chg_value: toNumber(row.frt_chg_value),

    hide_rate_import_po: row.hide_rate_import_po || "Y",
    adv_gl_acc_no:row.adv_gl_acc_no || null,
    adv_against_po:row.adv_against_po || null,
    subsidy_perc:row.subsidy_perc || null,
    po_type:row.po_type,
    brand_code:row.brand_code,
    
    
  };
};

exports.transformMdmmpoitamd = (poDetailArray, po_id,userId) => {
  return poDetailArray.map((row) => ({

    po_id: toNumber(po_id),

    it_code: row.it_code || null,
    sob_perc: toNumber(row.sob_perc),

    pack_code: toIntOrNull(row.pack_code),
    po_um: row.po_um || null,

    po_qty_ord: toNumber(row.po_qty_ord),
    po_qty_bal: toNumber(row.po_qty_ord),  //copy the above po_qty_ord value in po_qty_bal
    po_mat_rat: toNumber(row.po_mat_rat),
    po_ser_rat: toNumber(row.po_ser_rat),
    po_perunit: toNumber(row.po_perunit),

    po_disc: toNumber(row.po_disc),
    rej_allow: toNumber(row.rej_allow),

    ex_amtp_fl: toIntOrNull(row.ex_amtp_fl),
    ex_amt: toNumber(row.ex_amt),
    ex_perc: toNumber(row.ex_perc),
    spl_ex_per: toNumber(row.spl_ex_per),

    lst_perc: toNumber(row.lst_perc),
    cst_perc: toNumber(row.cst_perc),

    cst_form: row.cst_form || null,
    surch_perc: toNumber(row.surch_perc),

    mod_vat: row.mod_vat || null,
    remark: row.remark || null,

  create_id: Number(userId),
  update_id: null,


    po_fab_chg: toNumber(row.po_fab_chg),

    active: row.active || "Y",

    po_disc_val: toNumber(row.po_disc_val),
    osp_mat_perc: toNumber(row.osp_mat_perc),

    tax_on_disc: row.tax_on_disc || null,

    serv_tax_perc_amt: row.serv_tax_perc_amt || "N",
    serv_tax_value: toNumber(row.serv_tax_value),
    serv_tax_cess: toNumber(row.serv_tax_cess),

    serv_tax_recov: row.serv_tax_recov || "N",
    serv_tax_on_material: row.serv_tax_on_material || "N",

    schd_chk_flag: row.schd_chk_flag || null,
    sch_tol_perc: toNumber(row.sch_tol_perc),

    free_item_flg: row.free_item_flg || "N",
    po_qty_free: toNumber(row.po_qty_free),

    hsc_ex_perc: toNumber(row.hsc_ex_perc),
    serv_tax_hsc: toNumber(row.serv_tax_hsc),

    po_it_wgt: toNumber(row.po_it_wgt),
    // po_basic_rat: toNumber(row.po_basic_rat), block it as we rename the po_basic_rat to it_taxable_val
    it_taxable_val: toNumber(row?.amount) || 0,

    ex_inclusiv: row.ex_inclusiv || "N",

    alter_uom: row.alter_uom || null,

    spl_add_cd_perc_amt: row.spl_add_cd_perc_amt || "1",
    spl_add_cd_value: toNumber(row.spl_add_cd_value),

    incl_servtax_in_sales_tax: row.incl_servtax_in_sales_tax || "N",

    gst_amt_prc: row.gst_amt_prc || "P",

    gst_sgst_val: toNumber(row.gst_sgst_val)||0,
    gst_sgst_amt: toNumber(row.gst_sgst_amt)||0,
    gst_sgst_cess_val: toNumber(row.gst_sgst_cess_val)||0,
    gst_sgst_cess_amt: toNumber(row.gst_sgst_cess_amt)||0,

    gst_ugst_val: toNumber(row.gst_ugst_val)||0,
    gst_ugst_amt: toNumber(row.gst_ugst_amt)||0,
    gst_ugst_cess_val: toNumber(row.gst_ugst_cess_val)||0,
    gst_ugst_cess_amt: toNumber(row.gst_ugst_cess_amt)||0,

    gst_cgst_val: toNumber(row.gst_cgst_val)||0,
    gst_cgst_amt: toNumber(row.gst_cgst_amt)||0,
    gst_cgst_cess_val: toNumber(row.gst_cgst_cess_val)||0,
    gst_cgst_cess_amt: toNumber(row.gst_cgst_cess_amt)||0,

    gst_igst_val: toNumber(row.gst_igst_val)||0,
    gst_igst_amt: toNumber(row.gst_igst_amt)||0,
    gst_igst_cess_val: toNumber(row.gst_igst_cess_val)||0,
    gst_igst_cess_amt: toNumber(row.gst_igst_cess_amt)||0,

    po_qty_in_stk_uom: toNumber(row.po_qty_in_stk_uom),
    print_qty_in_stk: row.print_qty_in_stk || "P",

    filer: row.filer || "N",
    subsidy_applicable: row.subsidy_applicable || "N"

  }));
};