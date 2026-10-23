exports.transformChequeMasterHeaderToDbData = (data) => {
  return {
    chq_id: data.chq_id,
    bank_acc_no: data.bank_acc_no,
    chq_no_strt: data.chq_no_strt,
    chq_no_end: data.chq_no_end,
    no_of_chq: data.no_of_chq,
    issue_dt: data.issue_dt,
    last_chq_no_used: data.last_chq_no_used || null,
    open_flag: data.open_flag || 'Y',
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: new Date(),
  };
};

exports.transformChequeMasterDetailToDbData = (data) => {
  return {
    chq_id: data.chq_id,
    division_id: data.division_id,
    section_id:data.section_id,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.userId || null,
    update_date: new Date(),
  };
};



