exports.transformPriceListData = (data) => {
  return {
    c_code: data.c_code ,
    it_code: data.it_code ,
    cus_it_code: data.cus_it_code ,
    cus_it_desc: data.cus_it_desc || null,
    cus_it_prc: data.cus_it_prc || 0,
    it_rate: data.it_rate || 0,
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
    active: data.active || "Y",
    eff_date: data.eff_date 
  };
};
