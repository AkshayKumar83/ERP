// Map JS object -> DB insert/update payload for integral.mopmgrade
exports.transToMopmgradeDbData = (data) => {
  return {
    grade_cd:     data.grade_cd || null,
    start_basic:  data.start_basic || null,
    increament:   data.increament || null,
    end_basic:    data.end_basic || null,
    create_id:    data.create_id || null,
    create_date:  data.create_date || null,   // Usually set from backend (NOW())
    update_id:    data.update_id || null,
    update_date:  data.update_date || null,   // Usually set on update only
  };
};
