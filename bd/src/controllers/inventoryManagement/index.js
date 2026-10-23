const { db } = require("../../config/dbConnection");
const catchAsync = require("../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../utility/query");

const TABLE_NAMES = {
  MOIT_GENCODE: `integral.moitgencode`,
  MOMMITEM: `integral.mommitem`,
  UNITS: `integral.units`,
  FACTORS: `integral.factors`,
  MOMMSTOK: `integral.mommstok`,
  MOMMWC: `integral.mommwc`,
  USER_MASTER: `integral.user_master`,
  MOMMCODE: `integral.MOMMCODE`,
  VWFINISH: `integral.VWFINISH`,
  VWWORKCENTERSTORE: `integral.VWWORKCENTERSTORE`,
  VWCOLOUR: `integral.VWCOLOUR`,
};

const executeFieldPrefilling = async (data, query = {}) => {
  additionalResponseObj = {};
  const date_fields = [
    "last_cydt",
    "install_eff_date",
    "it_dt_in",
    "it_dt_out",
    "rev_date",
    "create_date",
    "update_date",
  ];
  if (data.it_finish) {
    const finishData = await db.query(`
            SELECT PREFIX, CODE, DESCRIPTION 
            FROM ${TABLE_NAMES.VWFINISH} 
            WHERE CODE = '${data.it_finish}'
        `);
    additionalResponseObj.finish_desc = finishData.rows?.[0]?.description;
  }
  if (data.it_colour) {
    const colourData = await db.query(`
            SELECT PREFIX, CODE, DESCRIPTION 
            FROM ${TABLE_NAMES.VWCOLOUR} 
            WHERE CODE = '${data.it_colour}'
        `);
    additionalResponseObj.colour_desc = colourData.rows?.[0]?.description;
  }

  if (data.create_id != null) {
    const userData = await db.query(
      `select user_name from integral.user_master where user_id = ${data.create_id}`
    );
    additionalResponseObj.create_by = userData.rows?.[0]?.user_name;

    if (data.update_id && data.update_id == data.create_id) {
      additionalResponseObj.update_by = userData.rows?.[0]?.user_name;
    }
  }
  if (data.update_id != null && !additionalResponseObj.update_by) {
    const userData = await db.query(
      `select user_name from integral.user_master where user_id = ${data.update_id}`
    );
    additionalResponseObj.update_by = userData.rows?.[0]?.user_name;
  }

  // Item Site
  if (query.appFinYear && query.appDivisionId) {
    const itemSiteList = await db.query(
      `
            SELECT m.wc_id, w.wc_no, m.active, m.default_store
            FROM ${TABLE_NAMES.MOMMSTOK} m, ${TABLE_NAMES.MOMMWC} w
            WHERE m.it_code = $1
            AND m.trans_year = $2
            AND w.wc_id = m.wc_id
            AND w.division_id = $3
        `,
      [data.it_code, query.appFinYear, query.appDivisionId]
    );

    additionalResponseObj.siteItemsList = itemSiteList.rows || [];
  }

  date_fields.forEach((fieldName) => {
    if (data[fieldName]) {
      const date = new Date(data[fieldName]);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      additionalResponseObj[fieldName] = `${yyyy}-${mm}-${dd}`;
    }
  });

  return additionalResponseObj;
};

const fetchLevelConfiguration = async (
  type,
  level1 = "",
  level2 = "",
  level3 = ""
) => {
  if (type === "typeList") {
    const typeList = await db.query(`
            SELECT c1.level2, c.cat_desc||'-'||c1.cat_desc AS description
            FROM ${TABLE_NAMES.MOIT_GENCODE} c, ${TABLE_NAMES.MOIT_GENCODE} c1
            WHERE c.level1 IS NOT NULL
                AND c.level2 IS NULL
                AND c.level3 IS NULL
                AND c.level4 IS NULL
                AND c1.level1 IS NOT NULL
                AND c1.level2 IS NOT NULL
                AND c1.level1 = c.level1
                AND c1.level3 IS NULL
                AND c1.level4 IS NULL
                AND c.level1 = '${level1}'
                ORDER BY c1.level2
        `);
    return typeList?.rows || [];
  } else if (type === "materialBaseList") {
    const materialBase = await db.query(`
            SELECT c2.level3, c2.cat_desc
            FROM ${TABLE_NAMES.MOIT_GENCODE} c, ${TABLE_NAMES.MOIT_GENCODE} c1, ${TABLE_NAMES.MOIT_GENCODE} c2
            WHERE c.level1 IS NOT NULL
            AND c.level1 = '${level1}'
            AND c.level2 IS NULL
            AND c.level3 IS NULL
            AND c.level4 IS NULL
            AND c1.level1 IS NOT NULL
            AND c1.level2 IS NOT NULL
            AND c1.level1 = c.level1
            AND c1.level3 IS NULL
            AND c1.level4 IS NULL
            AND c2.level1 IS NOT NULL
            AND c2.level2 IS NOT NULL
            AND c2.level3 IS NOT NULL
            AND c2.level4 IS NULL
            AND c2.level1 = c1.level1
            AND c2.level2 = c1.level2
            AND c2.level2 = '${level2}'
            ORDER BY c2.level3
        `);

    return materialBase?.rows || [];
  } else if (type === "subCategoryList") {
    const subcategory = await db.query(`
            SELECT c3.level4, c3.cat_desc
            FROM ${TABLE_NAMES.MOIT_GENCODE} c, ${TABLE_NAMES.MOIT_GENCODE} c1, ${TABLE_NAMES.MOIT_GENCODE} c2, ${TABLE_NAMES.MOIT_GENCODE} c3
            WHERE c.level1 IS NOT NULL
            AND c.level1 = '${level1}'
            AND c.level2 IS NULL
            AND c.level3 IS NULL
            AND c.level4 IS NULL
            AND c1.level1 IS NOT NULL
            AND c1.level2 IS NOT NULL
            AND c1.level1 = c.level1
            AND c1.level3 IS NULL
            AND c1.level4 IS NULL
            AND c2.level1 IS NOT NULL
            AND c2.level2 IS NOT NULL
            AND c2.level3 IS NOT NULL
            AND c2.level4 IS NULL
            AND c2.level1 = c1.level1
            AND c2.level2 = c1.level2
            AND c2.level2 = '${level2}'
            AND c3.level1 IS NOT NULL
            AND c3.level2 IS NOT NULL
            AND c3.level3 IS NOT NULL
            AND c3.level4 IS NOT NULL
            AND c3.level1 = c2.level1
            AND c3.level2 = c2.level2
            AND c3.level3 = c2.level3
            AND c3.level3 = '${level3}'
            ORDER BY c3.level4
        `);

    return subcategory?.rows || [];
  } else if (type === "broadCategoryList") {
    const broadCategoryList = await db.query(`
            SELECT DESCRIPTION, CODE 
            FROM ${TABLE_NAMES.MOMMCODE} 
            WHERE CAT_GROUP = 'BLPCAT'
        `);

    return broadCategoryList?.rows || [];
  } else if (type === "finishCodeList") {
    // Finish Query
    const finishData = await db.query(`
            SELECT PREFIX, CODE, DESCRIPTION 
            FROM ${TABLE_NAMES.VWFINISH} 
            ORDER BY CODE
        `);

    return finishData?.rows || [];
  } else if (type === "colorCodeList") {
    // Color Code Query
    const colorData = await db.query(`
            SELECT PREFIX, CODE, DESCRIPTION 
            FROM ${TABLE_NAMES.VWCOLOUR} 
            ORDER BY CODE
        `);
    return colorData?.rows || [];
  } else if (type === "unitsDataList") {
    const unitsData = await db.query(`
            SELECT description, unit 
            FROM ${TABLE_NAMES.UNITS} 
            ORDER BY description
        `);

    return unitsData?.rows || [];
  } else if (type === "storageDataList") {
    // Storage Query
    const storageData = await db.query(`
            SELECT description, code 
            FROM ${TABLE_NAMES.MOMMCODE} 
            WHERE cat_group = 'STORAG'
        `);

    return storageData?.rows || [];
  } else if (type === "packingList") {
    // Packing Query
    const packingData = await db.query(`
            SELECT description, code 
            FROM ${TABLE_NAMES.MOMMCODE} 
            WHERE cat_group = 'PACK' 
            ORDER BY description
        `);

    return packingData?.rows || [];
  } else if (type === "productionDetailsList") {
    // Production Detail Query
    const productionDetailData = await db.query(`
            SELECT W.WC_NO, W.WC_ID WC_ID
            FROM ${TABLE_NAMES.VWWORKCENTERSTORE} W
            WHERE DIVISION_ID = '1'
            ORDER BY W.WC_NO
        `);

    return productionDetailData?.rows || [];
  }
};

 const fetchInventoryDataOnQuery = async (req, res, next) => {
  // Query Data
  let additionalResponseObj = {};
  let isQuery = false;
  if (
    ["Query", "Last", "Next", "Prev", "First", "Search"].includes(
      req.query?.get_data
    ) ||
    req.query?.formStatus === "Search"
  ) {
    isQuery = true;
    // search query execution
    let searchKeys = ["it_code", "it_name"];
    let whereClauses = [];

    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    const masterDBQuery = `
            SELECT * 
            from ${TABLE_NAMES.MOMMITEM} 
            ${queryValues}
            ORDER BY it_code
            LIMIT 1 
            OFFSET ${req.query?.offset || 0}
        `;
    let masterDBData = await db.query(masterDBQuery);

    console.log(`Search Query:: `, masterDBQuery);
    const totalCountQuery = `SELECT COUNT(*) FROM ${TABLE_NAMES.MOMMITEM} ${queryValues}`;
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = totalCountResult.rows[0].count;

    console.log(`Total Search Query:: `, totalCountQuery);

    // can comment this for test
    if (masterDBData?.rows?.length <= 0) {
      return res.status(400).json({
        message: "No data found, please try again!",
      });
    }

    let masterDbDataRow = masterDBData?.rows?.[0];
    let fieldPrefilling = await executeFieldPrefilling(
      masterDBData.rows?.[0] || {},
      req.query || {}
    );
    additionalResponseObj.masterData = {
      ...masterDbDataRow,
      ...fieldPrefilling,
    };
    additionalResponseObj.totalCount = totalCount;
    additionalResponseObj.current = parseInt(req?.query?.offset || 0);
  }

  let configObj = {
    typeList: [],
    materialBaseList: [],
    subCategoryList: [],
  };
  const barrelCategoryList = await db.query(`
        SELECT level1, cat_desc 
        FROM ${TABLE_NAMES.MOIT_GENCODE} c 
        WHERE 
            level1 IS NOT NULL AND 
            c.level2 IS NULL AND 
            c.level3 IS NULL AND 
            c.level4 IS NULL 
        ORDER BY level1
    `);

  const broadCategoryList = await fetchLevelConfiguration("broadCategoryList");
  const finishCodeList = await fetchLevelConfiguration("finishCodeList");
  const colorCodeList = await fetchLevelConfiguration("colorCodeList");
  const unitsDataList = await fetchLevelConfiguration("unitsDataList");
  const storageDataList = await fetchLevelConfiguration("storageDataList");
  const packingList = await fetchLevelConfiguration("packingList");
  const productionDetailsList = await fetchLevelConfiguration(
    "productionDetailsList"
  );

  if (isQuery) {
    const barrelCategory = additionalResponseObj.masterData?.main_type,
      typeItemId = additionalResponseObj.masterData?.it_type,
      materialBaseId = additionalResponseObj.masterData?.it_base;

    console.log({ barrelCategory, typeItemId, materialBaseId });
    configObj.typeList = await fetchLevelConfiguration(
      "typeList",
      barrelCategory
    );
    configObj.materialBaseList = await fetchLevelConfiguration(
      "materialBaseList",
      barrelCategory,
      typeItemId
    );
    configObj.subCategoryList = await fetchLevelConfiguration(
      "subCategoryList",
      barrelCategory,
      typeItemId,
      materialBaseId
    );
    configObj.auth_flag_status =
      (await db.query(
        `SELECT auth_flag from ${TABLE_NAMES.MOMMITEM} order by it_code DESC limit 1`
      )?.rows?.[0]?.auth_flag) || "N";
  }

  // TODO:: created by and modified by db query to be added.
  return res.status(200).json({
    configuration: {
      barrelCategoryList: barrelCategoryList?.rows || [],
      broadCategoryList,
      finishCodeList,
      colorCodeList,
      unitsDataList,
      storageDataList,
      packingList,
      productionDetailsList,
      auth_flag_status: configObj?.auth_flag_status || null,
      typeList: configObj.typeList || [],
      materialBaseList: configObj.materialBaseList || [],
      subCategoryList: configObj.subCategoryList || [],
    },
    ...additionalResponseObj,
  });
};

exports.generateITCode = catchAsync(async (req, res, next) => {
  const { c_level } = req.query;
  const queryResult = await db.query(`
    SELECT 
    LPAD(
        (COALESCE(MAX(CAST(SUBSTRING(it_code FROM 7 FOR 4) AS INTEGER)), 0) + 1)::TEXT,
        4,
        '0'
    ) AS c_max_it_no
    FROM integral.mommitem
    WHERE SUBSTRING(it_code FROM 1 FOR 6) = '${c_level}';
    `);

  if (!queryResult.rows || queryResult.rows.length === 0) {
    const c_new_it_code = `${c_level}0001-000R00`;
    return res.status(200).json({
      new_it_code: c_new_it_code,
      rev_level: "00",
      mfg_process_no: "000",
    });
  }

  const c_max_it_no = queryResult.rows[0].c_max_it_no;
  const c_new_it_code = `${c_level}${c_max_it_no}-000R00`;

  res.status(200).json({
    new_it_code: c_new_it_code,
    rev_level: "00",
    mfg_process_no: "000",
  });
});

exports.fetchInventoryBaseLevelConfiguration = catchAsync(
  async (req, res, next) => {
    const { type, level1, level2, level3 } = req.query;
    const data = await fetchLevelConfiguration(type, level1, level2, level3);
    return res.status(200).json({
      configuration: {
        [type]: data,
      },
    });
  }
);

exports.fetchPurchaseStockUnits = catchAsync(async (req, res, next) => {
  const { it_pu_um, um_code, it_bom_um } = req.query;
  let result;

  if (it_pu_um) {
    result = await db.query(`
            SELECT CAST(f.multiplier AS NUMERIC) AS it_p_umf
            FROM ${TABLE_NAMES.UNITS} u, 
                ${TABLE_NAMES.UNITS} u1, 
                ${TABLE_NAMES.FACTORS} f
            WHERE u.unit = '${um_code}'
              AND f.from_id = u.unit_id
              AND u1.unit = '${it_pu_um}'
              AND f.to_id = u1.unit_id
        `);
  }
  if (it_bom_um) {
    result = await db.query(`
            SELECT CAST(f.multiplier AS NUMERIC) AS it_p_umf
            FROM ${TABLE_NAMES.UNITS} u, 
                ${TABLE_NAMES.UNITS} u1, 
                ${TABLE_NAMES.FACTORS} f
            WHERE u.unit = '${um_code}'
              AND f.from_id = u.unit_id
              AND u1.unit = '${it_bom_um}'
              AND f.to_id = u1.unit_id
        `);
  }

  return res.status(200).json({
    fieldValue: result?.rows?.[0]?.fieldValue || "1.000",
    disabled: result?.rows?.[0]?.fieldValue ? "Y" : "N",
  });
});

const sanitizePayloadFn = (payload) => {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (value === "") return [key, null];
      return [key, value];
    })
  );
};

// Insert and Update API
exports.upsertInventoryDetails = catchAsync(async (req, res, next) => {
 
  const {
    gen_code_manual,
    gen_code_auto,
    it_p_umf_disabled,
    it_bom_umf_disabled,
    unit1,
    unit2,
    unit3,
    finish_desc,
    colour_desc,
    cyc_contva,
    reorder_qty,
    reorder_level,
    rev_level_ref,
    drawing_no_ref,
    mfg_process_no_ref,
    gen_code,
    create_by,
    modified_by,
    update_by,
    modify_date,
    item411,
    load_docs,
    extract_docs,
    remove_docs,
    drawing_display,
    description,
    disp_it_level1,
    prod_transfer_to_wc_id,
    wc_id,
    siteItemsList,
    division_id,
    trans_year,
    ...payload // payload contains actual data
  } = req.body;
  const operation = req.query?.operation;
  const currDate = new Date();

  if (operation === "Insert") {
    let insertPayload = { ...payload };
    insertPayload.create_id = 0;
    insertPayload.create_date = currDate;
    insertPayload.update_id = 0;
    insertPayload.update_date = currDate;

    const sanitizedPayload = sanitizePayloadFn(insertPayload);
    const mommitemQuery = generateSingleInsertQuery(
      TABLE_NAMES.MOMMITEM,
      sanitizedPayload
    );

    const data = await db.query(mommitemQuery, Object.values(sanitizedPayload));

    // ✅ Call Procedure (corrected syntax)
    const procCallQuery = `CALL proc_create_it_auto_mommstok_entry($1, $2, $3)`;
    const procParams = [sanitizedPayload.it_code, division_id, trans_year];

    await db.query(procCallQuery, procParams);
  } else if (operation === "Update") {
    const { it_code, ...dataset } = payload;
    dataset.update_id = 0;
    dataset.update_date = currDate;

    const columns = Object.keys(dataset);
    const values = Object.values(dataset);

    const columnHead = columns.map((c, i) => `${c} = $${i + 2}`).join(", ");
    const params = [`${it_code}`, ...values];

    const query = `UPDATE ${TABLE_NAMES.MOMMITEM} SET ${columnHead} WHERE it_code = $1`;
    await db.query(query, params);



    // ✅ Call Procedure (corrected syntax)
    const procCallQuery = `CALL proc_create_it_auto_mommstok_entry($1, $2, $3)`;
    const procParams = [it_code, division_id, trans_year];

    await db.query(procCallQuery, procParams);
  }

  return res.status(200).json({ message: "SUCCESS" });
});


 const helpListData = async (req, res) => {
  const { form_status, help_list  } = req?.query;
  if (form_status === "Search" && help_list === "item") {
    const item = await db.query(
      `select it_code ,it_name from mommitem order by it_name`
    );

    return res.status(200).json(item.rows);
  }  
  if (form_status === "Search" && help_list === "desc") {
    const desc = await db.query(
      `select it_code ,it_name from mommitem order by it_name`
    );

    return res.status(200).json(desc.rows);
  }  
};



exports.fetchInventoryConfiguration = catchAsync(async (req, res, next) => {
      if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await fetchInventoryDataOnQuery(req, res);
        return;
    }
    
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
     res.status(400).json({ message: "Invalid request" });
});
