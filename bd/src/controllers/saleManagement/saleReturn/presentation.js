exports.transformSalesReturnData = (data) => {
  return {
    return_id: data.return_id ,
    return_no: data.return_no ,
    return_dt: data.return_dt || new Date(),
      
    inv_id: data.inv_id ,
    inv_no: data.inv_no ,

    c_code: data.c_code ,
    debit_acc_code: data.debit_acc_code || null,
    sale_ac_head: data.sale_ac_head || null,

    t_basic_val: data.t_basic_val || 0,
    t_discount_val: data.t_discount_val || 0,
    t_igst_val: data.t_igst_val || 0,
    t_sgst_val: data.t_sgst_val || 0,
    t_cgst_val: data.t_cgst_val || 0,
    t_net_val: data.t_net_val || 0,
    trans_year: data.trans_year || null,
    division_id: data.division_id || null,

    create_id: data.create_id ?? null,
    create_date: data.create_id ? new Date() : null,

    update_id: data.update_id ?? null,
    update_date: data.update_id ? new Date() : null,


  };
};


exports.transformSalesReturnItem = (data) => {
  return {
    return_id: data.return_id,
    it_code: data.it_code,

    return_qty: data.return_qty,
    rate: data.rate,

    basic_val: data.basic_val || 0,
    discount_val: data.discount_val || 0,

    igst_perc: data.igst_perc || 0,
    cgst_perc: data.cgst_perc || 0,
    sgst_perc: data.sgst_perc || 0,

    igst_val: data.igst_val || 0,
    cgst_val: data.cgst_val || 0,
    sgst_val: data.sgst_val || 0,

    net_val: data.net_val || 0,

    create_id: data.create_id ?? null,
    create_date: data.create_id ? new Date() : null,

    update_id: data.update_id ?? null,
    update_date: data.update_id ? new Date() : null,

 
  };
};