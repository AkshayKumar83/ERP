const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformTransactionMasterToDbData } = require("./presentation");

let TABLE_NAMES = {
    TRANS_MSTR: `mommtrty`,
};
   

const getDataOnQuery = async (req, res) => {
   const { formStatus, appDivisionId, appFinYear, userId } = req.query

let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ['type_desc'];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }
       
  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "and " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;
  console.log("req_payload:: ", req?.query);
  console.log("transformed transYr & divId::", transYear, divisionId);

  try {
    let whereClause = "WHERE trans_code > 100";
    let queryParameter = `ORDER BY trans_code LIMIT 1 OFFSET ${req.query.offset || 0}`;
    let dataCount;

      if(whereClauses.length > 0) {
             const getCount = await db.query(
                 `SELECT COUNT(*) FROM ${TABLE_NAMES.TRANS_MSTR} ${whereClause} ${queryValues}`
               );
               dataCount = getCount.rows[0]?.count;
               queryParameter = `${queryValues} ${queryParameter}`;
              
       } else {

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.TRANS_MSTR} ${whereClause}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }
      case "Last": {
        queryParameter = ` ORDER BY trans_code DESC LIMIT 1`;
        break;
      }
      default:
        queryParameter = `ORDER BY trans_code LIMIT 1 OFFSET ${req.query.offset || 0}`;
        break;
    }
  }

    const getMOMMTRTYData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TRANS_MSTR} ${whereClause} ${queryParameter}`
    );

    if (getMOMMTRTYData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        transMstrData: [],
        count: 0,
      });
    }

 
     const transaction = getMOMMTRTYData.rows[0]

         // postQuery 
    // query: from_wc_no, from_desc
    const fromData = await db.query(
      `SELECT wc_no, description FROM mommwc WHERE wc_id = $1`,
      [transaction.from_wc_id]);
    
    const toData = await db.query(`
      SELECT wc_no, description  FROM mommwc WHERE wc_id = $1`,
    [transaction.to_wc_id]);

    return res.status(200).json({
      transMstrData: [{
        ...transaction,
        from_wc_no: fromData.rows[0]?.wc_no || null,
        from_desc: fromData.rows[0]?.description || null,
        to_wc_no: toData.rows[0]?.wc_no || null,
        to_desc: toData.rows[0]?.description || null,
      }],
      count: dataCount,
    });
  } catch (error) {
    console.error("Error in getTransactionMasterDataOnQuery:", error);
    return res.status(500).json({
      message: "Internal server error on query",
    });
  }
};

    // helpList Function
const helpListData = async (req, res) => {
  const { form_status, help_list } = req?.query;
  // Allowed form statuses
  if (!["Insert", "Search", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }
     // Same query for both `from` and `to`
  const baseQuery = `
    SELECT description, wc_no, wc_id 
    FROM vwWorkCenterStore 
    UNION 
    SELECT description, wc_no, wc_id 
    FROM mommwc 
    WHERE store_process = 'P'
    ORDER BY 1
  `;

  if (["from", "to"].includes(help_list)) {
    const result = await db.query(baseQuery);
    return res.status(200).json(result.rows);
  }
    // New helplist for Searching
    if (help_list === "Desc") {
      const query = `
        SELECT trans_code, type_desc
        FROM mommtrty
        WHERE trans_code > '100'
        ORDER BY trans_code
      `;
      const result = await db.query(query);
      return res.status(200).json(result.rows);
    }
  // If help_list value doesn't match
  return res.status(400).json({ error: "Invalid help_list value" });
};

    // below both comment function are converted in pg one is function(func_gen_trans_code) and one is procedure(insertContraEntry)
{/*    
const funcGenTransCode = async (pType) => {
    if (pType == null) {
        throw new Error("Transaction code not generated .. Select Type");
    }

    const result = await db.query(
        `SELECT MAX(trans_code) AS max_code
         FROM ${TABLE_NAMES.TRANS_MSTR}
         WHERE type <> 0`
    );

    const nTrans_code = result.rows[0]?.max_code;
    let nNewTrans_code;

    if (nTrans_code == null) {
        nNewTrans_code = 101;
    } else {
        nNewTrans_code = nTrans_code + 1;
    }

    return nNewTrans_code;
};
  
const insertContraEntry = async ({ from_wc_id, to_wc_id, type }) => {
    try {
        // From store_process
        let cProcess_store = null;
        const fromResult = await db.query(
            `SELECT store_process FROM mommwc WHERE wc_id = $1`,
            [from_wc_id]
        );
        if (fromResult.rowCount > 0) {
            cProcess_store = fromResult.rows[0].store_process;
        }

        // To store_process
        let cProcess_store1 = null;
        const toResult = await db.query(
            `SELECT store_process FROM mommwc WHERE wc_id = $1`,
            [to_wc_id]
        );
        if (toResult.rowCount > 0) {
            cProcess_store1 = toResult.rows[0].store_process;
        }

             // Sirf tab chale jab dono 'S' ho
        if (cProcess_store === 'S' && cProcess_store1 === 'S') {

            let nType, cOk_rej, cReceive_issue_flag, cType_desc;

            if (type === 1) {
                nType = 2;
                cOk_rej = 'O';
                cReceive_issue_flag = 'I';
                cType_desc = 'NON PRODUCTIVE ISSUE';
            } else if (type === 2) {
                nType = 1;
                cOk_rej = 'O';
                cReceive_issue_flag = 'R';
                cType_desc = 'MATERIAL RETURN';
            } else if (type === 3) {
                nType = 4;
                cOk_rej = 'R';
                cReceive_issue_flag = 'I';
                cType_desc = 'REJECTION ISSUE';
            } else if (type === 4) {
                nType = 3;
                cOk_rej = 'R';
                cReceive_issue_flag = 'R';
                cType_desc = 'MATERIAL RETURN (REJ.)';
            }

            // New transaction code
            const nTrans_code = await funcGenTransCode(nType);

            // Contra entry insert
            await db.query(
                `INSERT INTO mommtrty
                (trans_code, type, type_desc, from_wc_id, to_wc_id, ok_rej, receive_issue_flag)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [nTrans_code, nType, cType_desc, from_wc_id, to_wc_id, cOk_rej, cReceive_issue_flag]
            );

            return { message: "Contra entry inserted successfully" };
        }

        return { message: "No contra entry needed" };

    } catch (error) {
        console.error("Error inserting contra entry:", error);
        throw error;
    }
};
*/} 

const postTransMstrData = async (req, res) => {
  const payload = req.body;
  console.log("Insert request data:", payload);

  try {
         //  trans_code generate
    const newTransCode = await db.query('select func_gen_trans_code($1) as trans_code',[payload.type])

    // console.log('func_gen_trans_code', newTransCode.rows[0].trans_code)
    payload.trans_code = newTransCode.rows[0].trans_code;
    

        // DB insert (Post_Data)
    const mommtrty = transformTransactionMasterToDbData({ ...payload });
    const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.TRANS_MSTR, mommtrty);
    const valuesForInsertQuery = Object.values(mommtrty);

    await db.query("BEGIN");
    await db.query(queryForInsert, valuesForInsertQuery);

        // Contra entry insert
    await db.query('call InsertContraEntry($1,$2,$3)',[payload.from_wc_id,payload.to_wc_id, payload.type])
    await db.query("COMMIT");
    return res.status(200).json({ message: "Record & Contra entry inserted successfully" });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const updateTransMstrData = async (req, res) => {
  try {
    await db.query("BEGIN");

    const payload = req.body;
    const { trans_code, ...restPayload } = payload;

    if (!trans_code) {
      return res.status(400).json({ message: "trans_code is required" });
    }

    // Pass trans_code also for trigger handling
    const mommtrty = transformTransactionMasterToDbData({
      trans_code,
      ...restPayload
    });

    const columns = Object.keys(mommtrty);
    const values = Object.values(mommtrty);

    if (columns.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const setClause = columns
      .map((column, idx) => `${column} = $${idx + 1}`)
      .join(", ");

    const query = `
      UPDATE ${TABLE_NAMES.TRANS_MSTR}
      SET ${setClause}
      WHERE trans_code = $${columns.length + 1}
    `;

    await db.query(query, [...values, trans_code]);

    await db.query("COMMIT");

    return res.status(200).json({ type:'success', message: "Record updated successfully",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error updating transaction master:", error);
    return res.status(500).json({ type:'error',
     message: error.message || "Failed to update transaction master",
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
})

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateTransMstrData(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postTransMstrData(req, res);
        return;
    }
});



