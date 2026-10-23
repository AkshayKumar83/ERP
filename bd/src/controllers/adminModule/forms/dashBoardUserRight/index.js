const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");

const TABLE_NAMES ={
  USER_MSTR: `USER_MASTER`,
  DB_USER_RIGHT:`MOITDASHBOARDRIGHT`,

}

const getDataOnQuery = async (req, res) => {
   
    const { formStatus, appDivisionId, appFinYear, userId } = req.query;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["login_name"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "") {
            whereClauses.push(`${key} = '${req.query[key]}'`);
        }
    }

    // Build WHERE clause dynamically
    let queryValues =
        whereClauses.length > 0 ? "and " + whereClauses.join(" AND ") : "";

    let transYear = appFinYear || "2023";
    let divisionId = appDivisionId || 1;
    let user_id = userId || 583;
 
    


  try {
        let whereClause = `WHERE EXISTS (
        SELECT 1 FROM moitDashboardRight R
        WHERE R.user_id = ${TABLE_NAMES.USER_MSTR}.user_id
        )`;

    let queryParameter = `ORDER BY user_id  OFFSET ${parseInt(req.query.offset) || 0}`;
    let dataCount;
    if (whereClauses.length > 0) {
                const getCount = await db.query(`SELECT COUNT(*) AS count FROM ${TABLE_NAMES.USER_MSTR}
                     ${whereClause}  ${queryValues}`,
                  
                );
                dataCount = getCount.rows[0]?.count;
                queryParameter = `${queryValues} ${queryParameter}`;
            } else {

    switch (req?.query?.get_data) {
      case "First":
      case "Query": {
        const getCount = await db.query(`SELECT COUNT(*) AS count FROM ${TABLE_NAMES.USER_MSTR} ${whereClause}`);
        dataCount = getCount.rows[0]?.count || 0;
        break;
      }
      case "Last": {
        queryParameter = "ORDER BY user_id DESC ";
        break;
      }
    }
  }
    
    const getUserMstrData = await db.query(`SELECT * FROM ${TABLE_NAMES.USER_MSTR} ${whereClause} ${queryParameter} LIMIT 1`);


    if (getUserMstrData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No data found",
        userMstrData: null,
        totalCount: dataCount || 0
      });
    }


    const userId = getUserMstrData.rows[0].user_id;

    const dbModuleData = await db.query(`SELECT * FROM ${TABLE_NAMES.DB_USER_RIGHT} where user_id =$1`,[userId]);

    await Promise.all(
      dbModuleData.rows.map(async(item, index)=>{
        const dbModuleName = await db.query(
       `SELECT 
        full_name FROM vwdb_module
        WHERE sht_name = $1`,
      [item.db_module]
        );
        item.db_module_desc = dbModuleName.rows[0]?.full_name;
      }) 
    )

    return res.status(200).json({
      type: "found",
      userMstrData: getUserMstrData.rows[0], 
      dbModuleData:dbModuleData.rows,
      totalCount: dataCount || 0,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error on Query"
    });
  }
};

const helpListData = async(req,res) =>{
    const {help_list, form_status} = req.query;
  

    if(!["Insert","Search","Update"].includes(form_status)){
        return res.status(200).send([]);
    }

//     if(help_list === "LoginName"){
//         const loginName = await db.query(`
//         SELECT user_name, login_name, user_id, active
//         FROM user_master
//         WHERE COALESCE(active, 'N') = 'Y'
//         ORDER BY user_name
//  `)

//  return res.status(200).json(loginName.rows);
//  } 
 if (help_list === "LoginName") {
      let loginName;

      if (form_status === "Search") {
        // Search ke liye join wali query
        loginName = await db.query(`
         select a.user_id , u.login_name, u.user_name from MOITDASHBOARDRIGHT a,USER_MASTER u 
         where a.user_id = u.user_id ORDER BY u.user_name;
        `);
      } else {
        // Insert/Update ke liye simple active user list
        loginName = await db.query(`
          SELECT user_name, login_name, user_id, active
          FROM user_master
          WHERE COALESCE(active, 'N') = 'Y'
          ORDER BY user_name
        `);
      }

      return res.status(200).json(loginName.rows.length > 0 ? loginName.rows : []);
    }
 else if(help_list === 'DBModule'){
    const dbModule = await db.query(`
    select sht_name,full_name from vwdb_module
        `)
  
        return res.status(200).json(dbModule.rows);
 }
}

const postFormData = async (req, res) => {
  const { formData, detailFormData } = req.body;

  try {
    await db.query('BEGIN');

    for (const row of detailFormData) {
        delete row.db_module_desc
      const insertDetailQuery = generateSingleInsertQuery(TABLE_NAMES.DB_USER_RIGHT, row);
      const detailValues = Object.values(row);
      await db.query(insertDetailQuery, detailValues);
    }

    await db.query('commit');
    return res.status(200).json({ message: 'Form data inserted successfully' });

  } catch (error) {
    console.error('Insert error:', error);
    await db.query('ROLLBACK');
    return res.status(500).json({ message: 'Insert failed', error: error.message });
  }
};
   

const updateFormData = async (req, res) => {
  const { formData, detailFormData } = req.body;
  const user_id = formData.user_id;

  try {
    if (!user_id) {
      throw new Error("user_id is required");
    }

    await db.query("BEGIN");

    // Step 1: Fetch existing records for the user
    const existingRecordsResult = await db.query(
      `SELECT * FROM ${TABLE_NAMES.DB_USER_RIGHT} WHERE user_id = $1`,
      [user_id]
    );
    const existingRecords = existingRecordsResult.rows;

    // Step 2: Identify inserts, updates, and deletes
    const existingKeys = new Set(existingRecords.map(row => row.db_module));
    const submittedKeys = new Set(detailFormData.map(row => row.db_module));

    // Rows to insert (new rows not in existing records)
    const rowsToInsert = detailFormData.filter(row => !existingKeys.has(row.db_module));
    // Rows to update (existing rows with potential changes)
    const rowsToUpdate = detailFormData.filter(row => existingKeys.has(row.db_module));
    // Rows to delete (existing rows not in submitted data)
    const rowsToDelete = existingRecords.filter(row => !submittedKeys.has(row.db_module));

    // Step 3: Handle Inserts
    for (const row of rowsToInsert) {
    
      delete row.db_module_desc; // Remove frontend-only field
      const insertQuery = generateSingleInsertQuery(TABLE_NAMES.DB_USER_RIGHT, row);
      const detailValues = Object.values(row);
      await db.query(insertQuery, detailValues);
    }

    // Step 4: Handle Updates
    for (const row of rowsToUpdate) {
     
      delete row.db_module_desc; // Remove frontend-only field
      const { user_id, db_module, ...fieldsToUpdate } = row;
      const columns = Object.keys(fieldsToUpdate);
      const values = Object.values(fieldsToUpdate);

      if (columns.length === 0) continue; // Skip if no fields to update

      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
      const updateQuery = `
        UPDATE ${TABLE_NAMES.DB_USER_RIGHT}
        SET ${setClause}
        WHERE user_id = $${columns.length + 1} AND db_module = $${columns.length + 2}
      `;
    
      await db.query(updateQuery, [...values, user_id, db_module]);
    }

    // Step 5: Handle Deletes
    for (const row of rowsToDelete) {
    
      await db.query(
        `DELETE FROM ${TABLE_NAMES.DB_USER_RIGHT} WHERE user_id = $1 AND db_module = $2`,
        [row.user_id, row.db_module]
      );
    }

    await db.query("COMMIT");
    return res.status(200).json({
      type: "success",
      message: "Form data updated successfully",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Updation failed:", error.message);
    return res.status(500).json({ type: "error", message: error.message || "Update failed" });
  }
};

    
const checkDuplicateUserRights = async (req, res) => {
  try {
    const { user_id, db_module, db_module_desc } = req.query;

    if (!db_module || db_module.trim() === '') {
      return res.status(400).json({
        exist: false,
        message: 'DB Module cannot be null',
      });
    }

    const duplicateQuery = `
      SELECT user_id, db_module 
      FROM moitdashboardright 
      WHERE user_id = $1 AND db_module = $2
      LIMIT 1
    `;

    const result = await db.query(duplicateQuery, [user_id, db_module]);

    if (result.rows.length > 0) {
      return res.status(200).json({
        exist: true,
        message: `${db_module_desc} module rights are already given to this user.`,
      });
    } else {
      return res.status(200).json({
        exist: false,
        message: 'No duplicate rights found.',
      });
    }

  } catch (error) {
    console.error('Error checking duplicate user rights:', error);
    return res.status(500).json({
      error: 'Database query failed',
    });
  }
};

exports.handleFormOperation = catchAsync(async(req,res,next)=>{
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await getDataOnQuery(req, res);
        return;
    }
    if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
   if(req?.query?.db_module_desc){
    await checkDuplicateUserRights(req,res);
    return;
   }


})


exports.handlePostFormData = catchAsync(async(req,res,next) =>{
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateFormData(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postFormData(req, res);
        return;
    }

})