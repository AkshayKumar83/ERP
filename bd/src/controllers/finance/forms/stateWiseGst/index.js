const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  STATE_NAME_HELP: "MOITSTATE",
  HSN_SAC_CODE_HELP: "mommitem",
  GST_STATE_MASTER: "mosmgst_state",
};

// On Form Render setup initial Data in form
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  try {
    // STATE DROP DOWN DATA
    const stateList = await db.query(
      `SELECT TE.GST_STATE_CODE, TE.STATE_NAME 
            FROM ${TABLE_NAMES.STATE_NAME_HELP} TE
            WHERE TE.GST_STATE_CODE IS NOT NULL
            ORDER BY TE.STATE_NAME`
    );

    // HSN SAC CODE DROP DOWN DATA
    const hsnCodeList = await db.query(
      `SELECT DISTINCT HSN_SAC_CODE
            FROM ${TABLE_NAMES.HSN_SAC_CODE_HELP}
            ORDER BY HSN_SAC_CODE`
    );
    return res.status(200).json({
      stateList: stateList.rows,
      hsnCodeList: hsnCodeList.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errMsg: `Error: while getting dropDownData due to ${error.message}`,
    });
  }
});


const helpListData = async (req, res) => {
  const {
    form_status,
    help_list,
  } = req?.query;

  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {

    //  VENDOR HELP LIST
   if (help_list === "HSNCode") {

  let hsnCodeList;

  //  SEARCH MODE
  if (form_status === "Search") {
    hsnCodeList = await db.query(
      // SELECT DISTINCT
      //   m.hsn_sac_code , 
      //   i.it_code
      // FROM mosmgst_state m
      // join mommitem i
      // on i.hsn_sac_code = m.hsn_sac_code
      // ORDER BY m.hsn_sac_code
`
SELECT  hsn_sac_code
FROM mosmgst_state;
    `);
    
  } 
  //  INSERT / UPDATE MODE
  else {
    hsnCodeList = await db.query(`
      SELECT hsn_sac_code , it_code
      FROM ${TABLE_NAMES.HSN_SAC_CODE_HELP}
      ORDER BY hsn_sac_code
    `);
  }

  return res.status(200).send(hsnCodeList.rows);
}

   

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

exports.validateRecOnAdd = catchAsync(async (req, res, next) => {
  const record = req.body;
  const {
    gst_state_code,
    eff_dt,
    hsn_sac_code,
    sal_or_st,
    amount_from,
    amount_to,
  } = record;

  try {
 //  const gstCode = gst_state_code || null; 
 const gstCode = gst_state_code?.trim() || null;
  
   
   const amtFrom = parseFloat(amount_from) || 0;
const amtTo = parseFloat(amount_to) || 0;


    const isDuplicate = await db.query(
      `
            SELECT 'Y' as isDupRec
            FROM ${TABLE_NAMES.GST_STATE_MASTER}
            WHERE coalesce(GST_STATE_CODE, '@') = coalesce($1, '@') 
            AND EFF_DT = $2
            AND HSN_SAC_CODE = $3
            AND SAL_OR_ST = $4
            AND (
                ($5 > 0 AND $5 BETWEEN AMOUNT_FROM AND AMOUNT_TO) OR
                ($5 > 0 AND AMOUNT_TO BETWEEN $6 AND $5 AND AMOUNT_TO > 0) OR
                ($5 = 0 AND AMOUNT_TO = 0)
            );
            `,
      [gstCode, eff_dt, hsn_sac_code, sal_or_st, amtTo, amtFrom]
    );  

    console.log('duplicate', isDuplicate.rows)

    if (isDuplicate.rowCount > 0 && isDuplicate.rows[0].isduprec === "Y") {
      return res
        .status(400)
        .json({ isValid: false, message: "GST Tax already defined against State, HSN Code, Effective Date and Amount Range." });
    }

    res.json({ isValid: true });
  } catch (error) {
    console.error("Error while checking for duplicate record:", error);
    res.status(500).json({
      errMsg: `Error: while checking duplicate record ${error.message}`,
    });
  }
});



// const getDataOnQuery = async (req, res) => {
//   try {
//     const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

//     console.log(req?.query);

//     let whereClauses = [];

//     // Define search keys that should be checked in WHERE clause
//     let searchKeys = ["gst_state_code", "hsn_sac_code", "sal_or_st", "eff_dt"];

//     // If any of these searchKeys exist in the query, add them to WHERE clause
//     for (const key of searchKeys) {
//       if (req.query[key] !== undefined && req.query[key] !== "") {
//         whereClauses.push(`${key} = '${req.query[key]}'`);
//       }
//     }

//     console.log("whereClauses", whereClauses);

//     // Build WHERE clause dynamically
//     let queryValues =
//       whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

//     let transYear = appFinYear || "2023";
//     let divisionId = appDivisionId || 1;
//     let user_id = userId || 583;
//     //   console.log("req_payload:: ", req?.query);
//     //   console.log("transformed transYr & divId::", transYear, divisionId);

//     const limit = 50;
//     let page = req.query.page;
//     const offset = parseInt(req.query.offset) || 0;
//     let queryParameter = `ORDER BY record_id LIMIT ${limit} OFFSET ${offset}`;
//     let dataCount;

//     console.log(`SELECT * FROM ${TABLE_NAMES.GST_STATE_MASTER} ${queryValues}`);
//     // If search parameters exist, count results accordingly
//     if (whereClauses.length > 0) {
//       const getCount = await db.query(
//         `SELECT COUNT(*) FROM ${TABLE_NAMES.GST_STATE_MASTER} ${queryValues}`
//       );
//       dataCount = getCount.rows[0]?.count;
//       queryParameter = `${queryValues} ${queryParameter}`;
//     } else {
//       console.log("loging queryValues", queryValues);
//       console.log("loging queryParameter", queryParameter);

//       // Handle different cases for 'get_data'
//       switch (req?.query?.get_data) {
//         case "First":
//         case "Query": {
//           const getCount = await db.query(
//             `SELECT COUNT(*) FROM ${TABLE_NAMES.GST_STATE_MASTER}`
//           );
//           dataCount = parseInt(getCount.rows[0]?.count);
//           break;
//         }
//         case "Last": {
//           const getCount = await db.query(
//             `SELECT COUNT(*) FROM ${TABLE_NAMES.GST_STATE_MASTER}`
//           );
//           dataCount = parseInt(getCount.rows[0]?.count);
//           const lastPageOffset = Math.max(0, dataCount - limit);
//           queryParameter = `ORDER BY record_id LIMIT ${limit} OFFSET ${lastPageOffset}`;
//           break;
//         }
//         case "Prev": {
//           let prevoffset = 50 * parseInt(page - 1) - 50;
//           console.log("page:", page);
//           console.log(prevoffset);
//           queryParameter = `ORDER BY record_id LIMIT ${limit} OFFSET ${prevoffset}`;
//         }
//       }
//     }

//     // Fetch mosmgst_master data
//     const stateWiseGstData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.GST_STATE_MASTER} ${queryParameter}`
//     );

//     console.log(
//       `SELECT * FROM ${TABLE_NAMES.GST_STATE_MASTER} ${queryParameter}`
//     );

//     // If no data is found, return early
//     if (stateWiseGstData.rows.length === 0) {
//       return res.send({
//         type: "not found",
//         gstStateWiseData: [],
//         count: dataCount || 0,
//       });
//     }

//     const response = {
//       type: "found",
//       gstStateWiseData: stateWiseGstData.rows,
//       count: dataCount || 0,
//       currentPage: Math.floor(offset / limit) + 1,
//       totalPages: Math.ceil(dataCount / limit),
//       hasNextPage: offset + limit < dataCount,
//       hasPreviousPage: offset > 0,
//     };

//     return res.send(response);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ message: "Internal server error on query" });
//   }
// };


const getDataOnQuery = async (req, res) => {
  try {
    const { 
      formStatus, 
      appDivisionId, 
      appFinYear, 
      userId,
      limit = 20,        // ← from frontend
      offset = 0         // ← from frontend
    } = req?.query;

    let whereClauses = [];
    let searchKeys = ["gst_state_code", "hsn_sac_code", "sal_or_st", "eff_dt"];

    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    let whereClause = whereClauses.length > 0 
      ? "WHERE " + whereClauses.join(" AND ") 
      : "";

    // Get total count (with or without filters)
    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.GST_STATE_MASTER} ${whereClause}`
    );
    const dataCount = parseInt(getCount.rows[0]?.count) || 0;

    // Fetch paginated data
    const stateWiseGstData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.GST_STATE_MASTER} 
       ${whereClause} 
       ORDER BY record_id 
       LIMIT $1 OFFSET $2`,
      [Number(limit), Number(offset)]
    );

    if (stateWiseGstData.rows.length === 0) {
      return res.status(200).json({
        type: "not_found",
        gstStateWiseData: [],
        count: 0,
      });
    }

    return res.status(200).json({
      type: "found",
      gstStateWiseData: stateWiseGstData.rows,
      count: dataCount,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};



const searchQueryRecord = async (req, res) => {
  try {
    if (req?.query?.form_status !== "Search") {
      return res.status(400).send({ message: "Bad Request!" });
    }

    const searchParams = req.query;
    const formStatus = searchParams.form_status;
    delete searchParams.form_status; // form_status for maintaing search query
    console.log(searchParams);

    const cleanSearchParam = convertStringsToBooleans(searchParams);

    const transfromSearchQuery = cleanSearchParam;
    console.log(cleanObject(transfromSearchQuery));

    const searchQuery = buildSearchQuery(transfromSearchQuery);
    console.log(searchQuery);

    const limit = 50;
    let page = req.query.page;
    const offset = parseInt(req.query.offset) || 0;
    let queryParameter = `ORDER BY record_id LIMIT ${limit} OFFSET ${offset}`;
    let dataCount;

    // Fetch mosmgst_master data
    const stateWiseGstData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.GST_STATE_MASTER} ${queryParameter}`
    );

    // If no data is found, return early
    if (stateWiseGstData.rows.length === 0) {
      return res.send({
        type: "not found",
        gstStateWiseData: [],
        count: dataCount || 0,
      });
    }

    const response = {
      type: "found",
      gstStateWiseData: stateWiseGstData.rows,
      count: dataCount || 0,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(dataCount / limit),
      hasNextPage: offset + limit < dataCount,
      hasPreviousPage: offset > 0,
    };

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

const submitStateWiseGstData = async (req, res) => {
  let stateGstData = [...req?.body.stateGstData];
  if (!stateGstData.length) {
    return res.status(404).json({ message: "please insert new Record" });
  }
  try {
    await db.query("Begin");

    for (const [index, record] of stateGstData.entries()) {
      const gstStateCode = record.gst_state_code || null;
      const amount_from = Number(record.amount_from) || 0;
      const amount_to = Number(record.amount_to) || 0;

      const isDuplicate = await db.query(
        `
            SELECT 'Y' as isDupRec
            FROM ${TABLE_NAMES.GST_STATE_MASTER}
            WHERE coalesce(GST_STATE_CODE, '@') = coalesce($1, '@') 
            AND EFF_DT = $2::date
            AND HSN_SAC_CODE = $3
            AND SAL_OR_ST = $4
            AND (
                ($5 > 0 AND $5 BETWEEN AMOUNT_FROM AND AMOUNT_TO) OR
                ($5 > 0 AND AMOUNT_TO BETWEEN $6 AND $5 AND AMOUNT_TO > 0) OR
                ($5 = 0 AND AMOUNT_TO = 0)
            );
            `,
        [
          gstStateCode,
          record.eff_dt,
          record.hsn_sac_code,
          record.sal_or_st,
          amount_to,
          amount_from,
        ]
      );

      if (isDuplicate.rowCount > 0) {
        return res
          .status(400)
          .json({
            isValid: false,
            message:
              "GST Tax already defined against State, HSN Code, Effective Date and Amount Range.",
          });
      }

      if (record.gst_state_code === "" || record.gst_state_code === undefined) {
        record.gst_state_code = null;
      }
      try {
        const getRecordId = await db.query(
          `SELECT nextval('integral.S_RECORD_ID')`
        );
        const recordId = getRecordId.rows[0].nextval;
        delete record?.state_name;
        delete record?.init_hsn_sac_code;
        delete record?.init_sal_or_st;
        delete record?.init_eff_dt;
        delete record?.it_code;
        const updatedRowForInsert = { ...record, record_id: recordId };
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.GST_STATE_MASTER,
          updatedRowForInsert,
          "create_date"
        );

        const valuesForInsertQuery = Object.values(updatedRowForInsert);
        console.log("gst detail query", queryForInsert);
        console.log("gst detail insert query", valuesForInsertQuery);
        await db.query(queryForInsert, [...valuesForInsertQuery]);
      } catch (error) {
        console.error(`Error inserting record at index ${index}:`, error);
        throw new Error(error);
      }
    }

    await db.query("COMMIT");
    res.send({ type: "created" });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

const updateStateWiseGstData = async (req, res) => {
  console.log("this function called at update");

  console.log("state gst update", req?.body?.deletedGstDetail);
  const deletedRecords = req?.body?.deletedGstDetail || [];
  const updatedRecords = req?.body?.updatedGstDetail || [];
  const newRecords = req?.body?.stateGstData || [];

  try {
    await db.query("BEGIN");

    // Insert New Records
    if (newRecords.length) {
      for (const [index, record] of newRecords.entries()) {
        if (
          record.gst_state_code === "" ||
          record.gst_state_code === "undefined"
        ) {
          record.gst_state_code = null;
        }

        const gstStateCode = record.gst_state_code || null;
        const amount_from = Number(record.amount_from) || 0;
        const amount_to = Number(record.amount_to) || 0;

        const isDuplicate = await db.query(
          `
            SELECT 'Y' as isDupRec
            FROM ${TABLE_NAMES.GST_STATE_MASTER}
            WHERE coalesce(GST_STATE_CODE, '@') = coalesce($1, '@') 
            AND EFF_DT = $2::date
            AND HSN_SAC_CODE = $3
            AND SAL_OR_ST = $4
            AND (
                ($5 > 0 AND $5 BETWEEN AMOUNT_FROM AND AMOUNT_TO) OR
                ($5 > 0 AND AMOUNT_TO BETWEEN $6 AND $5 AND AMOUNT_TO > 0) OR
                ($5 = 0 AND AMOUNT_TO = 0)
            );
            `,
          [
            gstStateCode,
            record.eff_dt,
            record.hsn_sac_code,
            record.sal_or_st,
            amount_to,
            amount_from,
          ]
        );

        if (isDuplicate.rowCount > 0) {
          return res
            .status(400)
            .json({
              isValid: false,
              message:
                "GST Tax already defined against State, HSN Code, Effective Date and Amount Range.",
            });
        }

        try {
          const getRecordId = await db.query(
            `SELECT nextval('integral.S_RECORD_ID')`
          );
          const recordId = getRecordId.rows[0].nextval;
          delete record?.state_name;
          delete record?.init_eff_dt;
          delete record?.init_hsn_sac_code;
          delete record?.init_sal_or_st;
          delete record?.it_code;
          const updatedRowForInsert = { ...record, record_id: recordId };
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.GST_STATE_MASTER,
            updatedRowForInsert,
            "create_date"
          );

          const valuesForInsertQuery = Object.values(updatedRowForInsert);
          console.log("gst detail query", queryForInsert);
          console.log("gst detail insert query", valuesForInsertQuery);
          await db.query(queryForInsert, [...valuesForInsertQuery]);
        } catch (error) {
          console.error(`Error inserting record at index ${index}:`, error);
          throw new Error(`Insertion failed for record at index ${index}`);
        }
      }
    }

    // Update Existing Records
    if (updatedRecords.length) {
      console.log("this updaterecords updating");
      for (const [index, record] of updatedRecords.entries()) {
        if (record.gst_state_code === "" || record.gst_state_code === null) {
          record.gst_state_code = null;
        }  

        // const gstStateCode = record.gst_state_code || null;
        const amount_from = Number(record.amount_from) || 0;
        const amount_to = Number(record.amount_to) || 0;

        

        // Only proceed if record_id exists
        if (!record?.record_id) {
          console.warn(
            `Skipping record at index ${index} due to missing record_id`
          );
          continue;
        }

        const { init_hsn_sac_code, init_eff_dt, init_sal_or_st } = record;

        delete record?.state_name;
        delete record?.init_eff_dt;
        delete record?.init_hsn_sac_code;
        delete record?.init_sal_or_st;
        delete record?.it_code;

        const columns = Object.keys(record);
        const values = Object.values(record);

        // Create SET clause for SQL UPDATE query
        const setClause = columns
          .map((column, idx) => `${column} = $${idx + 1}`)
          .join(", ");
      //  gst_state_code, hsn_sac_code, sal_or_st, eff_dt, amount_from, amount_to;
        const query = `UPDATE ${
          TABLE_NAMES.GST_STATE_MASTER
        } SET ${setClause} WHERE hsn_sac_code = $${
          columns.length + 1
        } and sal_or_st = $${columns.length + 2} and eff_dt = $${
          columns.length + 3
        }`;
        console.log("query:", query);  


    
        try {
          await db.query(query, [
            ...values,
            init_hsn_sac_code,
            init_sal_or_st,
            init_eff_dt,
            
          ]);

          console.log("successfully updated", values);
        } catch (error) {
          console.error(`Error updating record at index ${index}:`, error);
          throw Error(`Update failed for record at index ${index}`);
        }
      }
    }

    // Delete Records
    if (Array.isArray(deletedRecords) && deletedRecords.length > 0) {
      console.log("delete record");
      for (const [index, record] of deletedRecords.entries()) {
        const {
          gst_state_code,
          hsn_sac_code,
          sal_or_st,
          eff_dt,
          amount_from,
          amount_to,
          record_id,
        } = record;

        // const deleteQuery = `DELETE FROM ${TABLE_NAMES.GST_STATE_MASTER}
        //                  WHERE gst_state_code = $1 AND hsn_sac_code = $2 AND sal_or_st = $3
        //                  AND eff_dt = $4 AND amount_from = $5 AND amount_to = $6 AND record_id = $7`;

        const deleteQuery = `DELETE FROM ${TABLE_NAMES.GST_STATE_MASTER} where record_id = $1`;

        try {
          await db.query(deleteQuery, [
            // gst_state_code,
            // hsn_sac_code,
            // sal_or_st,
            // eff_dt,
            // amount_from,
            // amount_to,
            record_id,
          ]);
        } catch (error) {
          console.error(`Error deleting record at index ${index}:`, error);
          throw Error(`Deletion failed for record at index ${index}`);
        }
      }
    }

    await db.query("COMMIT");
    res
      .status(200)
      .json({ message: " State wise GST data updated successfully" });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK"); // Rollback if something fails
    console.error("Transaction failed", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  //     await getDataOnQuery(req, res);
  //     return;
  // }

   if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.form_status && req?.query?.form_status === "Search") {
  //     await searchQueryRecord(req, res);
  //     return;
  //   }
});

exports.submitFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateStateWiseGstData(req, res);
    return;
  } else {
    await submitStateWiseGstData(req, res);
    return;
  }
});
