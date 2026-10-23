exports.transformThmmmainToDbData = (data, user) => {
  return {
    division_id: data.division_id || user?.global_division_id || null,
    trans_year: data.trans_year || user?.global_fin_year || null,
    trans_code: data.trans_code || null,
    doc_id: data.doc_id || null,
    doc_no: data.doc_no || null,
    doc_date: data.doc_date ? new Date(data.doc_date) : null,
    ok_rej: data.ok_rej || null,
    wc_id: data.wc_id || null,
    kit_no: data.kit_no || null,
    v_code: data.v_code || null,
    acc_code: data.acc_code || null,
    dept_code: data.dept_code || null,
    pur_code: data.pur_code || null,
    cost_centr: data.cost_centr || null,
    cancel_memo: data.cancel_memo || 'N',
    remark: data.remark || null,
    create_id: user?.user_id || null,
    create_date: new Date(),
    update_id: user?.user_id || null,
    update_date: new Date(),
    trans_type: data.trans_type || null,
    srs_id: data.srs_id || null,
    srs_no: data.srs_no || null,
    mat_trans_type: data.mat_trans_type || 'I',
    authorised: data.authorised || null,
    tmp_entry_no: data.tmp_entry_no || null,
    kit_new_shortage: data.kit_new_shortage || null,
    kit_issued_to: data.kit_issued_to || null,
    kit_remarks: data.kit_remarks || null
  };
};  

exports.transformTdmmmainDtlToDbData = (data, user) => {
  return {
    doc_id: data.doc_id || null,
    it_code: data.it_code || null,
    wc_id: data.wc_id || null,
    um_code: data.um_code || null,
    qty: data.qty || null,
    rr_acptqty: data.rr_acptqty || null,
    rate: data.rate || null,
    mav_rate: data.mav_rate || null,
    create_id: user?.user_id || null,
    create_date: new Date(),
    update_id: user?.user_id || null,
    update_date: new Date(),
    cost_centr: data.cost_centr || null,
    pur_code: data.pur_code || null,
    short_iss_code: data.short_iss_code || null
  };
}; 

exports.transformTdmmmainBatchToDbData = (data, user) => {
  return {
    doc_id: data.doc_id || null,
    it_code: data.it_code || null,
    batch_no: data.batch_no || null,
    batch_date: data.batch_date ? new Date(data.batch_date) : null,
    batch_qty: data.batch_qty || null,
    ok_rej: data.ok_rej || 'O',
    expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
    create_id: user?.user_id || null,
    create_date: new Date(),
    update_id: user?.user_id || null,
    update_date: new Date(),
    cwo_id: data.cwo_id || null,
    cwo_item: data.cwo_item || null,
    cwo_type: data.cwo_type || null,
    loca_rack_bin_desc: data.loca_rack_bin_desc || null
  };
};
