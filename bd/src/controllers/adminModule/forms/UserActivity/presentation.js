exports.transToUserActivityDbData = (data) => {
  return {
    user_id:       data.user_id || null,
    program_id:    data.program_id || null,
    activity_id:   data.activity_id || null,

    create_id:     data.create_id || null,
    create_date:   data.create_date || null,   // usually handled by trigger

    update_id:     data.update_id || null,
    update_date:   data.update_date || null,   // usually handled on update
  };
}; 

exports.transToProgramActivityDbData = (data) => {
  return {
    program_id:  data.program_id || null,
    activity_id: data.activity_id || null,

    create_id:   data.create_id || null,
    create_date: data.create_date || null,   // usually handled by trigger

    update_id:   data.update_id || null,
    update_date: data.update_date || null,   // usually handled on update
  };
};