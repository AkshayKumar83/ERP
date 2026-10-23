// Map JS object -> DB insert/update payload for integral.mopmcatgrd
exports.transToMopmcatgrdDbData = (data) => {
  return {
    cat_no:                data.cat_no || null,
    grd_no:                data.grd_no || null,
    calc_salary_based_on:  data.calc_salary_based_on || 'W',
    rounded_off:           data.rounded_off || null,
    rupees_paise:          data.rupees_paise || null,
    rounded_upto:          data.rounded_upto || null,
    round_direction:       data.round_direction || null,
    lease_ent_per:         data.lease_ent_per || null,
    exgratia_not_apply:    data.exgratia_not_apply || 'N',

   
  };
};
