const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformChequeMasterHeaderToDbData, transformChequeMasterDetailToDbData } = require("./presentation");

const TABLE_NAMES = {
    HEADER_TABLE: `MHFMBNKCHQ`,
    DETAIL_TABLE: `MDFMBNKCHQ`,
};

const getDataOnQuery = async (req, res) => { 
      const { formStatus, appDivisionId, appFinYear, userId } = req.query

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["bank_acc_no"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }
       
   
  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;
  console.log("req_payload:: ", req?.query);
  console.log("transformed transYr & divId::", transYear, divisionId);



    try {
        let queryParameter = `ORDER BY chq_id LIMIT 1 OFFSET ${req.query.offset || 0}`; 
        let dataCount = 0;
        
           if(whereClauses.length > 0) {
             const getCount = await db.query(
                 `SELECT COUNT(*) FROM ${TABLE_NAMES.HEADER_TABLE} ${queryValues}`
               );
               dataCount = getCount.rows[0]?.count;
               queryParameter = `${queryValues} ${queryParameter}`;
              
            } else { 
        switch(req?.query?.get_data){
            case "Query":
            case "First": {
                const getCount = await db.query(
                    `SELECT COUNT(*) FROM ${TABLE_NAMES.HEADER_TABLE}`
                );
                dataCount = getCount.rows[0]?.count || 0;
                break;
            }
            case "Last": {
                queryParameter = "ORDER BY chq_id DESC LIMIT 1"; 
                break;
            }
        }
      }
        // === Header record fetch ===
        const headerResult = await db.query(
            `SELECT * FROM ${TABLE_NAMES.HEADER_TABLE} ${queryParameter}`
        );

        if (headerResult.rows.length === 0) {
            return res.status(200).json({
                type: "not found",
                headerData: null,
                detailData: [],
                count: dataCount || 0,
            });
        }

        let headerRow = headerResult.rows[0];
        const chqId = headerRow.chq_id;  

        // === Post-Query logic: acc_desc (bank_name) fetch ===
        const bankResult = await db.query(
            `SELECT bank_name as acc_desc 
             FROM mhfmbank 
             WHERE division_id = $1 
               AND acc_no = $2`,
            [appDivisionId, headerRow.bank_acc_no]
        );

        if (bankResult.rows.length > 0) {
            headerRow = {
                ...headerRow,
                acc_desc: bankResult.rows[0].acc_desc,
            };
        }

        // === Detail record fetch ===
        const detailResult = await db.query(
            `SELECT * FROM ${TABLE_NAMES.DETAIL_TABLE} WHERE chq_id = $1`,
            [chqId]
        );

        return res.status(200).json({
            type: "success",
            headerData: headerRow,
            detailData: detailResult.rows,
            count: dataCount || 0,
        });

    } catch (error) {
        console.error("Error in getDataOnQuery:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

    // helpList Function
const helpListData = async (req, res) => {
// console.log("Helplist")

    const { help_list,appDivisionId,appFinYear,form_status } = req?.query;
     if (!["Insert","Update", "Search"].includes(form_status)) {
        return res.status(200).send([]);
    }
 
    if (help_list === "bankCode") {
      if(form_status === 'Search'){
        const bank = await db.query(
        `SELECT bank_acc_no as acc_no, bank_name FROM MHFMBNKCHQ a , mhfmbank b
         where b.acc_no = a.bank_acc_no`
        );
        return res.status(200).json(bank.rows);
      } else {
        const bankCodeList = await db.query(
          `select acc_no, bank_name
            from mhfmbank
            where division_id = $1
            order by 2`,
            [appDivisionId]  
        );
        console.log('bankCodeList',bankCodeList)
        return res.status(200).send(bankCodeList.rows);
    }
  }
   
};

// dropDownData
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const sectionIdList = await db.query(
    `select s.section_desc, s.section_id
from moitsection s
order by 1
    `
  );
    
  const divisionId = await db.query(`
    select division_id , name
from moitdivision 
`)

  return res.status(200).json({
    sectionIdList: sectionIdList.rows,
    divisionId: divisionId.rows,
  });
});



// // Check open flag (Oracle trigger equivalent)

// const checkOpenFlag = async (bankAccNo) => {
//   const result = await db.query(
//     `SELECT 1 
//      FROM ${TABLE_NAMES.HEADER_TABLE}
//      WHERE bank_acc_no = $1
//        AND open_flag = 'Y'`,
//     [bankAccNo]
//   );
//   return result.rows.length > 0;
// };


// Check open flag (Oracle trigger equivalent)
const checkOpenFlag = async (bankAccNo, excludeChqId = null) => {
  let query = `
    SELECT 1 
    FROM ${TABLE_NAMES.HEADER_TABLE}
    WHERE bank_acc_no = $1
      AND open_flag = 'Y'
  `;
  const params = [bankAccNo];

  // Exclude current record if modifying
  if (excludeChqId) {
    query += ` AND chq_id <> $2`;
    params.push(excludeChqId);
  }

  const result = await db.query(query, params);
  return result.rows.length > 0;
};


// Insert function with validation
const postChqBookData = catchAsync(async (req, res) => {
  const payload = req.body;
  const { detailFormData = [], chq_no_strt, chq_no_end, bank_acc_no, open_flag, issue_dt } = payload;

  await db.query("BEGIN");
  try {
    // Validate required fields
    if (!chq_no_strt || !chq_no_end || !bank_acc_no || !issue_dt) {
      throw new Error("Missing required fields: bank_acc_no, chq_no_strt, chq_no_end, or issue_dt");
    }
    if (isNaN(parseInt(chq_no_strt)) || isNaN(parseInt(chq_no_end))) {
      throw new Error("Cheque start and end numbers must be valid numbers");
    }
    if (parseInt(chq_no_end) < parseInt(chq_no_strt)) {
      throw new Error("Cheque end number can not be less than Cheque start number");
    }
    
    if (detailFormData.length === 0) {
      throw new Error("At least one detail record is required");
    }

    // Check for overlaps
    const startExists = await checkDuplicateChequeNo(chq_no_strt, bank_acc_no);
    const endExists = await checkDuplicateChequeNo(chq_no_end, bank_acc_no);
    if (startExists || endExists) {
      throw new Error("This Cheque Series is already defined");
    }

    // Check open flag
    if (open_flag === "Y") {
      const openFlagExists = await checkOpenFlag(bank_acc_no);
      if (openFlagExists) {
        throw new Error("Cannot Open more than one for a Bank and Section combination");
      }
    }

    // Generate chq_id
    const chqIdResult = await db.query("SELECT nextval('S_MOFMBNKCHQ_CHQ_ID') AS chq_id");
    const chq_id = chqIdResult.rows[0].chq_id;

    // Insert header
    const headerData = transformChequeMasterHeaderToDbData({ ...payload, chq_id });
    const headerInsertQuery = generateSingleInsertQuery(TABLE_NAMES.HEADER_TABLE, headerData);
    console.log("Inserting header:", headerInsertQuery, Object.values(headerData));
    await db.query(headerInsertQuery, Object.values(headerData));

    // Insert details
    const detailsArray = Array.isArray(detailFormData) ? detailFormData : [detailFormData];
    for (const detail of detailsArray) {
      if (!detail.section_id || !detail.division_id) {
        throw new Error("Missing section_id or division_id in detail record");
      }
      const detailRow = transformChequeMasterDetailToDbData({ ...detail, chq_id });
      const detailInsertQuery = generateSingleInsertQuery(TABLE_NAMES.DETAIL_TABLE, detailRow);
      console.log("Inserting detail:", detailInsertQuery, Object.values(detailRow));
      await db.query(detailInsertQuery, Object.values(detailRow));
    }

    await db.query("COMMIT");
    res.status(200).json({type:"success", message: "Insert successful", chq_id });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);
    res.status(500).json({type:"error", message: error.message  || "Failed to Insert in cheque book entry" });
  }
});

// === Update Function (final) ===

const updateChqBookData = catchAsync(async (req, res) => {
  const payload = req.body;
  const { detailFormData = [], ...formData } = payload;

  await db.query("BEGIN");
  try {
    const { chq_id, bank_acc_no, chq_no_strt, chq_no_end, open_flag, issue_dt } = formData;

    // --- Basic validations
    if (!chq_id) throw new Error("Missing chq_id for update");
    if (!chq_no_strt || !chq_no_end || !bank_acc_no || !issue_dt) {
      throw new Error("Missing required fields in header");
    }

    // --- Open flag validation (same bank, not this chq_id)
    if (open_flag === "Y") {
      const openOther = await db.query(
        `SELECT 1 FROM ${TABLE_NAMES.HEADER_TABLE}
         WHERE bank_acc_no = $1 AND open_flag = 'Y' AND chq_id <> $2`,
        [bank_acc_no, chq_id]
      );
      if (openOther.rows.length > 0) {
        throw new Error("Cannot Open more than one for a Bank and Section combination");
      }
    }

    // --- Update header
    const headerData = transformChequeMasterHeaderToDbData(formData);
    const headerKeys = Object.keys(headerData).filter(k => k !== "chq_id");
    const headerValues = headerKeys.map(k => headerData[k]);
    const setClause = headerKeys.map((col, idx) => `${col} = $${idx + 1}`).join(", ");
    await db.query(
      `UPDATE ${TABLE_NAMES.HEADER_TABLE} SET ${setClause} WHERE chq_id = $${headerKeys.length + 1}`,
      [...headerValues, chq_id]
    );

    // --- Fetch current detail combos (no delete policy, just for duplication checks)
    const currentRowsRes = await db.query(
      `SELECT section_id, division_id FROM ${TABLE_NAMES.DETAIL_TABLE} WHERE chq_id = $1`,
      [chq_id]
    );
    const existingSet = new Set(
      currentRowsRes.rows.map(r => `${r.section_id}|${r.division_id}`)
    );

    // --- Process detail rows (update or insert)
    const detailsArray = Array.isArray(detailFormData) ? detailFormData : [detailFormData];

    for (const d of detailsArray) {
      const section_id = d.section_id;
      const division_id = d.division_id;

      if (!section_id || !division_id) {
        throw new Error("Missing section_id or division_id in detail record");
      }

      const hasPrev = d.prev_section_id != null && d.prev_division_id != null;

      if (hasPrev) {
        const prevKey = `${d.prev_section_id}|${d.prev_division_id}`;
        const newKey  = `${section_id}|${division_id}`;

        // If nothing changed, skip
        if (d.prev_section_id === section_id && d.prev_division_id === division_id) {
          continue;
        }

        // Prevent duplicate after change (either already in DB or being created by another update)
        const dupCheck = await db.query(
          `SELECT 1 FROM ${TABLE_NAMES.DETAIL_TABLE}
           WHERE chq_id = $1 AND section_id = $2 AND division_id = $3`,
          [chq_id, section_id, division_id]
        );
        if (dupCheck.rows.length > 0) {
          throw new Error("Duplicate combination of Section and Division");
        }

        // Update by matching previous composite key
        const updRes = await db.query(
          `UPDATE ${TABLE_NAMES.DETAIL_TABLE}
             SET section_id = $1, division_id = $2
           WHERE chq_id = $3 AND section_id = $4 AND division_id = $5`,
          [section_id, division_id, chq_id, d.prev_section_id, d.prev_division_id]
        );

        // If previous combo not found (rare: user edited from FE set that wasn't in DB), treat as insert
        if (updRes.rowCount === 0) {
          const row = transformChequeMasterDetailToDbData({ chq_id, section_id, division_id });
          const insQ = generateSingleInsertQuery(TABLE_NAMES.DETAIL_TABLE, row);
          await db.query(insQ, Object.values(row));
        } else {
          // maintain in-memory set for sanity (optional)
          existingSet.delete(prevKey);
          existingSet.add(newKey);
        }

      } else {
        // New row -> insert (ensure not duplicate)
        const dupCheck = await db.query(
          `SELECT 1 FROM ${TABLE_NAMES.DETAIL_TABLE}
           WHERE chq_id = $1 AND section_id = $2 AND division_id = $3`,
          [chq_id, section_id, division_id]
        );
        if (dupCheck.rows.length > 0) {
          throw new Error("Duplicate combination of Section and Division");
        }

        const row = transformChequeMasterDetailToDbData({ chq_id, section_id, division_id });
        const insQ = generateSingleInsertQuery(TABLE_NAMES.DETAIL_TABLE, row);
        await db.query(insQ, Object.values(row));
        existingSet.add(`${section_id}|${division_id}`);
      }
    }

    await db.query("COMMIT");
    return res.status(200).json({type:'success', message: "Update successful", chq_id });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update error:", error);
    return res.status(500).json({type:'error', message: error.message || 'Failed to Update in cheque book entry' });
  }
});

// // Check duplicate cheque number (CHEQUE_NO_EXISTS equivalent)
// const checkDuplicateChequeNo = async (chqNo, bankAccNo) => {
//   const res = await db.query(
//     `SELECT * FROM ${TABLE_NAMES.HEADER_TABLE} 
//      WHERE bank_acc_no = $1 
//        AND $2::numeric BETWEEN chq_no_strt::numeric AND chq_no_end::numeric`,
//     [bankAccNo, chqNo]
//   );
//   return res.rows.length > 0;
// };


// // Validation endpoint
// exports.handleValidation = catchAsync(async (req, res, next) => {
//   const { chq_no, bank_acc_no } = req.query;

//   if (!chq_no || !bank_acc_no) {
//     return res.status(400).json({ error: "Missing cheque number or bank account" });
//   }

//   const exists = await checkDuplicateChequeNo(chq_no, bank_acc_no);

//   return res.status(200).json({ exists });
// });


// Check duplicate cheque number (CHEQUE_NO_EXISTS equivalent)
const checkDuplicateChequeNo = async (chqNo, bankAccNo, chqId = null) => {
  let query = `
    SELECT * FROM ${TABLE_NAMES.HEADER_TABLE} 
    WHERE bank_acc_no = $1 
      AND $2::numeric BETWEEN chq_no_strt::numeric AND chq_no_end::numeric
  `;
  let params = [bankAccNo, chqNo];

  if (chqId) {
    query += ` AND chq_id <> $3`;
    params.push(chqId);
  }

  const res = await db.query(query, params);
  return res.rows.length > 0;
};

// Validation endpoint
exports.handleValidation = catchAsync(async (req, res, next) => {
  const { chq_no, bank_acc_no, chq_id } = req.query;

  if (!chq_no || !bank_acc_no) {
    return res.status(400).json({ error: "Missing cheque number or bank account" });
  }

  const exists = await checkDuplicateChequeNo(chq_no, bank_acc_no, chq_id);

  return res.status(200).json({ exists });
});




// Open flag endpoint
exports.handleOpenFlag = catchAsync(async (req, res, next) => {
  const { bank_acc_no, chq_id } = req.query;

  if (!bank_acc_no) {
    return res.status(400).json({ error: "Missing bank_acc_no" });
  }

  const exists = await checkOpenFlag(bank_acc_no, chq_id);

  return res.status(200).json({
    exists,
    message: exists
      ? "Cannot Open more than one for a Bank and Section combination"
      : "",
  });
});


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    console.log("from handleFormOperation", req?.query);

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
        await updateChqBookData(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postChqBookData(req, res);
        return;
    }
});

