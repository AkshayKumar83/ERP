// transformMoitgencodeToDbData.js

// Transform a single item to match the MOITGENCODE DB schema
exports.transformMoitgencodeToDbData = (data) => {
  return {
    level1: data.level1,
    level2: data.level2 || null,
    level3: data.level3 || null,
    level4: data.level4 || null,
    cat_desc: data.cat_desc || "",
    create_id: data.create_id || null,
    create_date: data.create_date || new Date(),
    update_id: data.update_id || null,
    update_date: data.update_date || new Date(),
    igr_code: data.igr_code || "",
    itm_manu: data.itm_manu || "",
    ref_level: data.ref_level || ""
  };
};

