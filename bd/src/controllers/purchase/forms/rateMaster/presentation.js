exports.transMdmmvendToDbData = (data, user) => {
  return {
    v_code: data.v_code || null, 
    it_code: data.it_code ,

    qual_assu: data.qual_assu || "N",

    eoq_qty: data.eoq_qty || null,
    sob_perc: data.sob_perc || null,

    capcty_days: data.capcty_days || null,
    capcty_weeks: data.capcty_weeks || null,
    capcty_months: data.capcty_months || null,

    min_stk_level: data.min_stk_level || null,

    dol_flag: data.dol_flag || "N",

    fr_load_perc: data.fr_load_perc || 0,
    ins_load_perc: data.ins_load_perc || 0,

    val_per: data.val_per || "N",
    dol_qc_flag: data.dol_qc_flag || "N",
    rate_apprvd_by_chairman: data.rate_apprvd_by_chairman || "N",

    it_rate: data.it_rate || null,
    rate_eff_dt: data.rate_eff_dt ,
  };
};