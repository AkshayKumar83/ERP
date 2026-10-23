
exports.transformAccCodePurcVochToDbData = (data) => {
  return {
    type: data.type,
    acc_no: data.acc_no,
    v_code: data.v_code || null,
    it_code: data.it_code || null,
    po_cat_prefix: data.po_cat_prefix || null,
    st_type: data.st_type || null,
    sub_acc_no: data.sub_acc_no || null,
    hsc_acc_no: data.hsc_acc_no || null,
    it_type: data.it_type || null,
    it_base: data.it_base || null,
    it_sub_c: data.it_sub_c || null,
    division_id: data.division_id || 1,
  };
};





