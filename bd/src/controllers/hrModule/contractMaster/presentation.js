// Map a JS object -> DB insert/update payload for integral.mopmcontr
exports.transToMopmcontrDbData = (data, userId) => {
  return {
    cont_code:      data.cont_code      || null,
    cont_name:      data.cont_name      || null,
    cont_add1:      data.cont_add1      || null,
    cont_city:      data.cont_city      || null,
    cont_zip_code:  data.cont_zip_code  || null,
    con_per1:       data.con_per1       || null,
    telephone1:     data.telephone1     || null,
    fax:            data.fax            || null,
    email:          data.email          || null,

  };
};
