// Map a JS object -> DB insert/update payload for integral.mhpmdept
exports.transToMhpmdeptDbData = (data, userId) => {
  return {
    dept_cd:      data.dept_cd      || null,
    department:   data.department   || null,
    short_desc:   data.short_desc   || null,

    create_id:    userId            || null,
    create_date:  new Date(),              // current timestamp
    update_id:    userId            || null,
    update_date:  new Date(),              // current timestamp
  };
};
