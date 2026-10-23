// Map a JS object -> DB insert/update payload for integral.mofmtds
exports.transToMofmtdsDbData = (data) => {
  return {
    acc_no:             data.acc_no             || null,
    tds_perc:           data.tds_perc           || null,
    tds_surc_perc:      data.tds_surc_perc      || null,
    // create_id:          userId                  || null,
    // create_date:        new Date(),                     // current timestamp
    // // update_id:          userId                 || null,
    // update_date:        new Date(),                     // current timestamp
    eff_date:           data.eff_date           || null,
    category_flag:      data.category_flag      || 'V',  // default 'V'
    tds_acc_no:         data.tds_acc_no         || null,
    tds_sur_acc_no:     data.tds_sur_acc_no     || null,
    certificate_prefix: data.certificate_prefix || null,
    v_code:             data.v_code             || null,
    tds_limit:          data.tds_limit          || null,
    tds_cess_perc:      data.tds_cess_perc      || null,
    tds_cess_acc_no:    data.tds_cess_acc_no    || null,
    tds_hsc_perc:       data.tds_hsc_perc       || null,
    tds_hsc_acc_no:     data.tds_hsc_acc_no     || null,
    serv_tax_appl:      data.serv_tax_appl      || null,
    start_tds_deduction_dt: data.eff_date    || null,
    goods_service:      data.goods_service      || 'S',  // default 'S'
    tds_penal_perc:     data.tds_penal_perc     || null,
    tds_non_pan_perc:   data.tds_non_pan_perc   || null
  };
};
