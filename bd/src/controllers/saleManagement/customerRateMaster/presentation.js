exports.transformCustomerRateMstrData = (data) => {
  return {
    c_code: data.c_code ,
    it_code: data.it_code ,
    cus_it_code: data.cus_it_code ,
    cus_it_desc: data.cus_it_desc || null,
    cus_it_prc: data.cus_it_prc || 0,
    it_rate: data.it_rate || 0,
    active: data.active || "Y",
    eff_date: data.eff_date 
  };
};
