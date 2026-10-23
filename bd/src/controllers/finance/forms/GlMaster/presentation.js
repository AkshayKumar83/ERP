exports.transformMasterToDbData = (data) => {
    return {
      acc_no: data.acc_no,
      acc_desc: data.acc_desc,
      controlacc: data.controlacc || null,
      rollup_acc: data.rollup_acc || null,
      rollup_acc1: data.rollup_acc1 || null,
      rollup_acc2: data.rollup_acc2 || null,
      rollup_acc3: data.rollup_acc3 || null,
      rollup_acc4: data.rollup_acc4 || null,
      ctrlprefix: data.ctrlprefix || 'N',
      emp_relate: data.emp_relate || 'N',
      sch_no: data.sch_no || null,
      default_status: data.default_status || 'D',
      rollup_rev: data.rollup_rev || null,
      acc_cat: data.acc_cat || null,
      cc_purpose: data.cc_purpose || 'N',
      sub_ledger_reqd: data.sub_ledger_reqd || 'N',
      gen_flag: data.gen_flag || null,
      sub_sch_no: data.sub_sch_no || null,
      chq_in_favour: data.chq_in_favour || null,
      allow_dn_cn: data.allow_dn_cn || 'N',
      inter_plant_ac: data.inter_plant_ac || null,
      consol_print: data.consol_print || null,
      cons_id_required: data.cons_id_required || 'N',
      rollup_acc1_fc: data.rollup_acc1_fc || null,
      rollup_acc2_fc: data.rollup_acc2_fc || null,
      rollup_acc3_fc: data.rollup_acc3_fc || null,
      rollup_acc4_fc: data.rollup_acc4_fc || null,
      rollup_acc_fc: data.rollup_acc_fc || null,
      rollup_acc_rev_fc: data.rollup_acc_rev_fc || null,
      rollup_acc_fc_own: data.rollup_acc_fc_own || null,
      acc_exclusive_to_fc: data.acc_exclusive_to_fc || 'N',
      has_fin_trans: data.has_fin_trans || 'N',
      acc_combined_flag: data.acc_combined_flag || 'N',
    };
  };
  

  exports.transformGlMasterDetailToDbData = (data, acc_no) => {
    return {
      acc_no: acc_no,
      division_id: data.division_id,
      yr_op_bal: data.yr_op_bal || 0.00,
      yr_db_cr: data.yr_db_cr || "C",
      cur_bal: data.cur_bal || 0,
      cur_bal_dt: data.cur_bal_dt || new Date(),
      cur_db_cr: data.cur_db_cr || "C",
      active: data.active || "Y",
      range_bal: data.range_bal || 0,
      range_db_cr: data.range_db_cr || "C",
      trans_year: data.trans_year ,
    };
  };
  