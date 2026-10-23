exports.transMOMMITEMSUBSIDYToDbData = (data, user) => {
  return {
    it_code: data.it_code ,
    subsidy_perc: data.subsidy_perc || 0,
    eff_date: data.eff_date ,
  };
};