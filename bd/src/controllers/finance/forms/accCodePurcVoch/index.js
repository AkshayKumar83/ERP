const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformAccCodePurcVochToDbData } = require("./presentation");
const { v4: uuidv4 } = require("uuid");

const TABLE_NAMES = {
  ACC_CODE_PURCH_VOCH: `MOFMFINACC`,
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req.query;

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["type", "type_desc"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;


  try {
    let queryParameter = `ORDER BY type LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount = 0;

    // HEADER QUERY (fixed list)
    const tempQuery = `
      SELECT * 
      FROM (
        VALUES 
          ('PURCHASE A/C', 'PURAC'),
          ('EXCISE A/C', 'EXPD'),
          ('EXCISE REJ A/C', 'EXREJ'),
          ('EXCISE STOCK TRANSFER A/C', 'EXST'),
          ('EXCISE RECOVERY A/C', 'EXREC'),
          ('FREIGHT A/C', 'FRGHT')
      ) AS t(type_desc, type)
    `;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM (${tempQuery}) AS x  ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM (${tempQuery}) AS x`
          );
          dataCount = getCount.rows[0]?.count || 0;
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY type DESC LIMIT 1";
          break;
        }
      }
    }

    // Get HEADER (single row)
    const headerResult = await db.query(`${tempQuery} ${queryParameter}`);
    const header = headerResult.rows[0];

      // Agar header hi nahi mila
    if (!header) {
      return res.json({
        count: 0,
        header: { type: "not found" },
        detail: [],
      });
    }

    // Get DETAIL rows
    const detailResult = await db.query(
      `SELECT * 
       FROM ${TABLE_NAMES.ACC_CODE_PURCH_VOCH} 
       WHERE type = $1 
       ORDER BY acc_no`,
      [header.type]
    );

    const detailRows = detailResult.rows;

    for (let i = 0; i < detailRows.length; i++) {
  let row = detailRows[i];

  // Add pre_ fields
  Object.assign(row, {
    pre_type: row.type,
    pre_acc_no: row.acc_no,
    pre_v_code: row.v_code,
    pre_it_code: row.it_code,
    pre_po_cat_prefix: row.po_cat_prefix,
    pre_st_type: row.st_type,
    pre_sub_acc_no: row.sub_acc_no,
    pre_hsc_acc_no: row.hsc_acc_no,
    pre_it_type: row.it_type,
    pre_it_base: row.it_base,
    pre_it_sub_c: row.it_sub_c,
    pre_division_id: row.division_id,
  });

  // === Descriptions ===
  const accDescResult = await db.query(
    `SELECT acc_desc FROM mhfmglm WHERE acc_no = $1`,
    [row.acc_no]
  );
  row.acc_desc = accDescResult.rows[0]?.acc_desc || null;

  if (row.sub_acc_no) {
    const subAccDescResult = await db.query(
      `SELECT acc_desc FROM mhfmglm WHERE acc_no = $1`,
      [row.sub_acc_no]
    );
    row.sub_acc_desc = subAccDescResult.rows[0]?.acc_desc || null;
  }

  if (row.hsc_acc_no) {
    const hscAccDescResult = await db.query(
      `SELECT acc_desc FROM mhfmglm WHERE acc_no = $1`,
      [row.hsc_acc_no]
    );
    row.hsc_acc_desc = hscAccDescResult.rows[0]?.acc_desc || null;
  }

  if (row.v_code) {
    const vNameResult = await db.query(
      `SELECT v_name FROM mommvend WHERE v_code = $1`,
      [row.v_code]
    );
    row.v_name = vNameResult.rows[0]?.v_name || null;
  }

  if (row.it_code) {
    const itDescResult = await db.query(
      `SELECT it_desc FROM mosmprod WHERE it_code = $1`,
      [row.it_code]
    );
    row.it_desc = itDescResult.rows[0]?.it_desc || null;
  }

  if (row.it_type) {
    const itTypeDescResult = await db.query(
      `SELECT DISTINCT cat_desc FROM moitbase
       WHERE level1 = $1 AND level2 = '00' AND level3 = '00'`,
      [row.it_type]
    );
    row.it_type_desc = itTypeDescResult.rows[0]?.cat_desc || null;
  }

  if (row.it_base) {
    const itBaseDescResult = await db.query(
      `SELECT DISTINCT cat_desc FROM moitbase
       WHERE level1 = $1 AND level2 = $2 AND level3 = '00'`,
      [row.it_type, row.it_base]
    );
    row.it_base_desc = itBaseDescResult.rows[0]?.cat_desc || null;
  }

  if (row.it_sub_c) {
    const itSubDescResult = await db.query(
      `SELECT DISTINCT cat_desc FROM moitbase
       WHERE level1 = $1 AND level2 = $2 AND level3 = $3`,
      [row.it_type, row.it_base, row.it_sub_c]
    );
    row.it_sub_c_desc = itSubDescResult.rows[0]?.cat_desc || null;
    }
   }

    return res.json({
      count: dataCount,
      header,
      detail: detailRows.map((item) => {
        return {
          ...item,
          pre_type: item.type,
          pre_acc_no: item.acc_no,
          pre_v_code: item.v_code,
          pre_it_code: item.it_code,
          pre_po_cat_prefix: item.po_cat_prefix,
          pre_st_type: item.st_type,
          pre_sub_acc_no: item.sub_acc_no,
          pre_hsc_acc_no: item.hsc_acc_no,
          pre_it_type: item.it_type,
          pre_it_base: item.it_base,
          pre_it_sub_c: item.it_sub_c,
          pre_division_id: item.division_id,
          row_id: uuidv4(),
        };
      }),
    });
  } catch (error) {
    console.error("Query Error:", error);
    return res.status(500).json({
      message: "Internal server error on Query",
    });
  }
};

// dropDown
exports.getFormBaseConstants = catchAsync(async (req, res) => {
  const poCat = await db.query(`
      select po_cat_description, po_cat_prefix from mommpcat order by po_cat_description
      `);

  return res.status(200).json({
    poCat: poCat.rows,
  });
});

// helpList Function
const helpListData = async (req, res) => {


  const { help_list, level1, level2 ,form_status} = req?.query;
    // this helplist only for searching(Type and Desc)
   if  ((help_list === "Type" || help_list === 'Desc') && form_status === "Search") {
  const typeList = await db.query(`
    SELECT DISTINCT m.type, t.type_desc
    FROM MOFMFINACC m
    JOIN (
      VALUES
        ('PURAC', 'PURCHASE A/C'),
        ('EXPD', 'EXCISE A/C'),
        ('EXREJ', 'EXCISE REJ A/C'),
        ('EXST', 'EXCISE STOCK TRANSFER A/C'),
        ('EXREC', 'EXCISE RECOVERY A/C'),
        ('FRGHT', 'FREIGHT A/C')
    ) AS t(type, type_desc)
      ON m.type = t.type
      order by type_desc
  `);

  return res.status(200).send(typeList.rows);
}


  if (help_list === "AccNo") {
    const accNoList = await db.query(
      `select acc_desc, acc_no  from mhfmglm order by acc_desc`
    );
  
    return res.status(200).send(accNoList.rows);
  }

  if (help_list === "SubAccNo") {
    const subAccNoList = await db.query(
      `select acc_desc, acc_no  from mhfmglm order by acc_desc`
    );

    return res.status(200).send(subAccNoList.rows);
  }
  if (help_list === "HscAccNo") {
    const HscAccNo = await db.query(
      `select acc_desc, acc_no  from mhfmglm order by acc_desc`
    );

    return res.status(200).send(HscAccNo.rows);
  }
  if (help_list === "VCode") {
    const VCode = await db.query(
      `select v_name, v_code from mommvend order by v_name`
    );
  
    return res.status(200).send(VCode.rows);
  }
  if (help_list === "ItCode") {
    const ItCode = await db.query(
      `select it_name, it_code from mommitem order by it_name`
    );
    
    return res.status(200).send(ItCode.rows);
  }
  if (help_list === "ItType") {
    const ItType = await db.query(`
          select cat_desc, level1
          from moitbase b
          where level2 = '00'
          and level3 = '00'
          order by cat_desc
          `);
    
    return res.status(200).send(ItType.rows);
  }
  if (help_list === "ItBase") {
    if (!level1) {
      return res.status(400).send({ message: "level1 is required" });
    }
    const ItBase = await db.query(
      `
      select cat_desc, level2
      from moitbase b
      where level1 = $1
      and level2 != '00'
      and level3 = '00'
      order by cat_desc
      `,
      [level1]
    );
    return res.status(200).send(ItBase.rows);
  }

  if (help_list === "ItSubc") {
    if (!level1 || !level2) {
      return res
        .status(400)
        .send({ message: "level1 and level2 are required" });
    }
    const ItSubc = await db.query(
      `
      select cat_desc, level3
      from moitbase b
      where level1 = $1
      and level2 = $2
      and level3 != '00'
      order by cat_desc
      `,
      [level1, level2]
    );
    return res.status(200).send(ItSubc.rows);
  }
};

const postAccPurcVochData = async (req, res) => {
  const payload = req.body; // { formData: [...] }
  const { newFormData:formData, type } = payload;

  try {
      await db.query("BEGIN");


    for (const row of formData) {
      delete row.id;
      row.type = type;
      const insertRow = transformAccCodePurcVochToDbData(row);
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.ACC_CODE_PURCH_VOCH,
        insertRow
      );
      const valuesForInsertQuery = Object.values(insertRow);

      await db.query(insertQuery, valuesForInsertQuery);
    }

    await db.query("COMMIT");
    res.status(200).json({type:"success", message: "Records inserted successfully" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);
    res.status(500).json({type:'error', message: error.message || "Internal Server Error"});
  }
};


function buildNullSafeWhere(pre, startIndex = 1) {
  const fields = [
    ["type", "pre_type"],
    ["acc_no", "pre_acc_no"],
    ["v_code", "pre_v_code"],
    ["it_code", "pre_it_code"],
    ["po_cat_prefix", "pre_po_cat_prefix"],
    ["st_type", "pre_st_type"],
    ["sub_acc_no", "pre_sub_acc_no"],      // include this!
    ["hsc_acc_no", "pre_hsc_acc_no"],
    ["it_type", "pre_it_type"],
    ["it_base", "pre_it_base"],
    ["it_sub_c", "pre_it_sub_c"],
    ["division_id", "pre_division_id"],
  ];

  const clauses = [];
  const params = [];
  let idx = startIndex;

  for (const [col, key] of fields) {
    const val = pre[key];
    if (val === undefined) {
      // if you *require* a full natural key, consider throwing here
      clauses.push(`${col} IS NULL`);
    } else if (val === null) {
      clauses.push(`${col} IS NULL`);
    } else {
      clauses.push(`${col} = $${idx++}`);
      params.push(val);
    }
  }

  return {
    clause: clauses.join(" AND "),
    params,
    nextIndex: idx,
  };
}

const updateAccPurcVochData = async (req, res, next) => {
  const { formData = [], newFormData = [], deletedData = [] } = req.body || {};

  if (!formData.length && !newFormData.length && !deletedData.length) {
    return res.status(404).json({
      type: "error",
      message: "No changes received. Please add/modify/delete records before submitting.",
    });
  }

  try {
    await db.query("BEGIN");

    // -----------------
    // DELETE existing
    // -----------------
    for (const entry of deletedData) {
      if (!entry) continue;

      // strip client-only keys
      const {
        id, row_id, isNew,
        // pre* keys stay for WHERE
        ...rest
      } = entry;

      const pre = entry; // contains pre_* values

      // Build NULL-safe WHERE
      const { clause, params } = buildNullSafeWhere(pre, 1);

      const sql = `
        DELETE FROM ${TABLE_NAMES.ACC_CODE_PURCH_VOCH}
        WHERE ${clause}
      `;

      await db.query(sql, params);
    }

    // -----------------
    // INSERT new rows
    // -----------------
    for (const row of newFormData) {
      if (!row) continue;
   
      const insertRow = { ...row };
      delete insertRow.row_id;
      delete insertRow.isNew;
    

      const dbRow = transformAccCodePurcVochToDbData(insertRow);
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.ACC_CODE_PURCH_VOCH,
        dbRow
      );
      const valuesForInsertQuery = Object.values(dbRow);
    
      await db.query(insertQuery, valuesForInsertQuery);
    }

    // -----------------
    // UPDATE changed rows
    // -----------------
    for (const entry of formData) {
      if (!entry) continue;

      // Remove client-only & display fields from SET
      const {
        id, row_id, isNew,isEdited,
         v_name, hsc_acc_desc, it_desc, 
        acc_desc, sub_acc_desc, it_type_desc, it_base_desc, it_sub_c_desc, originalSnapshot,// display/derived fields, not in table
        pre_type,
        pre_acc_no,
        pre_v_code,
        pre_it_code,
        pre_po_cat_prefix,
        pre_st_type,
        pre_sub_acc_no,
        pre_hsc_acc_no,
        pre_it_type,
        pre_it_base,
        pre_it_sub_c,
        pre_division_id,
        ...updatedDataRow
      } = entry;

      // If nothing to set, skip
      const columns = Object.keys(updatedDataRow);
      if (columns.length === 0) continue;

      const setFragments = [];
      const setParams = [];
      let idx = 1;

      for (const col of columns) {
        setFragments.push(`${col} = $${idx++}`);
        setParams.push(updatedDataRow[col]);
      }

      // Build WHERE starting at next index
      const pre = {
        pre_type,
        pre_acc_no,
        pre_v_code,
        pre_it_code,
        pre_po_cat_prefix,
        pre_st_type,
        pre_sub_acc_no,      // include in WHERE
        pre_hsc_acc_no,
        pre_it_type,
        pre_it_base,
        pre_it_sub_c,
        pre_division_id,
      };
      const where = buildNullSafeWhere(pre, idx);

      const updateSql = `
        UPDATE ${TABLE_NAMES.ACC_CODE_PURCH_VOCH}
        SET ${setFragments.join(", ")}
        WHERE ${where.clause}
      `;

      const params = [...setParams, ...where.params];

   
      await db.query(updateSql, params);
    }

    await db.query("COMMIT");
    return res.status(200).json({ type: "success" || "Record successfulu Updated" });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    return res.status(400).json({
      type: "error",
      message: error.message || "internal server error",
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {


  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateAccPurcVochData(req, res);
    return;
  }
  if (req?.query?.form_status === "Insert") {
    await postAccPurcVochData(req, res);
    return;
  }
});

exports.handleValidation = catchAsync(async (req, res, next) => {
  const {
    type,
    acc_no,
    v_code,
    it_code,
    po_cat_prefix,
    st_type,
    it_type,
    it_base,
    it_sub_c,
  } = req.query;

  try {
    // Check if combination exists
    const query = `
      SELECT 1
      FROM MOFMFINACC
      WHERE type = $1
        AND acc_no = $2
        AND COALESCE(v_code,'X') = COALESCE($3,'X')
        AND COALESCE(it_code,'X') = COALESCE($4,'X')
        AND COALESCE(po_cat_prefix,'X') = COALESCE($5,'X')
        AND COALESCE(st_type,'N') = COALESCE($6,'N')
        AND COALESCE(it_type,'N') = COALESCE($7,'N')
        AND COALESCE(it_base,'N') = COALESCE($8,'N')
        AND COALESCE(it_sub_c,'N') = COALESCE($9,'N')
      LIMIT 1
    `;

    const result = await db.query(query, [
      type, acc_no, v_code, it_code, po_cat_prefix,
      st_type, it_type, it_base, it_sub_c
    ]);

    if (result.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This combination already exists",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});



