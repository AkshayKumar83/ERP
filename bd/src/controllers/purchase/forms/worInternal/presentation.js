exports.transToTommstockadjDbData = (data, userId) => {
  return {
    division_id:          data.division_id            || null,
    trans_year:           data.trans_year             || null,
    adj_no:               data.adj_no                 || null,
    adj_dt:               data.adj_dt                 || null,
    adj_type:             data.adj_type               || null,
    trans_code:           data.trans_code             || null,
    wc_id_from:           data.wc_id_from             || null,
    wc_id_to:             data.wc_id_to               || null,
    it_code:              data.it_code                || null,
    qty:                  data.qty                    || null,
    ok_reg_from:          data.ok_reg_from            || null,
    ok_reg_to:            data.ok_reg_to              || null,
    auth_flag:            data.auth_flag              || 'N',
    auth_id:              data.auth_id                || null,
    auth_dt:              data.auth_dt                || null,
    v_code:               data.v_code                 || null,
    po_id:                data.po_id                  || null,
    cancel_flag:          data.cancel_flag            || 'N',
    cancel_dt:            data.cancel_dt              || null,
    cancel_reason:        data.cancel_reason          || null,
    remark:               data.remark                 || null,
    to_store_type:        data.to_store_type          || null,
    create_id:            userId                      || null,
    create_date:          new Date(), // current timestamp
    update_id:            userId                      || null,
    update_date:          new Date(), // current timestamp
    sale_to_vendor_osp:   data.sale_to_vendor_osp     || 'N',
    ledger_eff_dt:        data.ledger_eff_dt          || null,
    adj_id:               data.adj_id                 || null,
    voucher_id:           data.voucher_id             || null,
    acc_no:               data.acc_no                 || null,
    tax_code:             data.tax_code               || null,
    st_code:              data.st_code                || null,
    st_perc:              data.st_perc                || null,
    st_val:               data.st_val                 || null,
    trans_amt:            data.trans_amt              || null,
    st_form:              data.st_form                || null,
    rate:                 data.rate                   || null,
    purac_head:           data.purac_head             || null,
    st_per:               data.st_per                 || null,
    st_flag:              data.st_flag                || null
  };
};  

exports.transToTommesrBatchDbData = (data, userId) => {
  return {
    division_id:  data.division_id  || null,
    trans_year:   data.trans_year   || null,
    trans_code:   data.trans_code   || null,
    adj_no:       data.adj_no       || null,
    it_code:      data.it_code      || null,
    create_id:    userId            || null,
    create_date:  new Date(),                // current timestamp
    update_id:    userId            || null,
    update_date:  new Date(),                // current timestamp
    batch_no:     data.batch_no     || null,
    batch_dt:     data.batch_dt     || null,
    batch_qty:    data.batch_qty    || null,
    ok_rej:       data.ok_rej       || null,
    expiry_date:  data.expiry_date  || null,
  };
};

