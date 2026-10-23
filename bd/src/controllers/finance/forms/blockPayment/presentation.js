exports.transTofmBlockPaymentToDbData = (data, userId) => {
  return {
    acc_no: data.acc_no || null,
    doc_no: data.doc_no || null,
    doc_dt: data.doc_dt || null, // Make sure to pass a valid date or convert if needed
    block_flag: data.block_flag || 'Y', // default 'Y'
    create_id: userId || null,   // assuming user.user_id maps to smallint
    create_date: new Date(),            // current timestamp
    update_id: userId || null,   // optional, set null if not updating
    update_date: new Date()             // current timestamp
  };
};
