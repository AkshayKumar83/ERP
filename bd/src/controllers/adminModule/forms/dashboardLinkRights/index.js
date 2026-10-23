const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { cleanObject } = require("../../../../utility/query");

const TABLE_NAMES ={
  DB_USER_RIGHT:`MOITDASHBOARDRIGHT`,
  DB_LINK_RIGHT:`MDITDASHBOARDRIGHT`

}

const getDataOnQuery = async (req, res) => {

 const { formStatus, appDivisionId, appFinYear, userId } = req.query;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["user_id"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "") {
            whereClauses.push(`${key} = '${req.query[key]}'`);
        }
    }

    // Build WHERE clause dynamically
    let queryValues =
        whereClauses.length > 0 ? " where " + whereClauses.join(" AND ") : "";

    let transYear = appFinYear || "2023";
    let divisionId = appDivisionId || 1;
    let user_id = userId || 583;
  


  try {
    let queryParameter = `ORDER BY user_id OFFSET ${parseInt(req.query.offset) || 0}`;
    let dataCount;

     if (whereClauses.length > 0) {
                    const getCount = await db.query(`SELECT COUNT(*) AS count FROM ${TABLE_NAMES.DB_USER_RIGHT} ${queryValues}`,
                      
                    );
                   
                   
                    dataCount = getCount.rows[0]?.count;
                    queryParameter = `${queryValues} ${queryParameter}`;
                } else {

    switch (req?.query?.get_data) {
      case "First":
      case "Query": {
        const getCount = await db.query(`SELECT COUNT(*) AS count FROM ${TABLE_NAMES.DB_USER_RIGHT}`);
        dataCount = getCount.rows[0]?.count || 0;
        break;
      }
      case "Last": {
        queryParameter = "ORDER BY user_id DESC";
        break;
      }
    }
  }

    // Get main data
    const getUserMstrData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.DB_USER_RIGHT} ${queryParameter} LIMIT 1`
    );

    if (getUserMstrData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No data found",
        userMstrData: null,
        totalCount: dataCount || 0
      });
    }

    const userData = getUserMstrData.rows[0]; // main form row
    const userId = userData.user_id;
    const dbModule = userData.db_module;

    // -------- postQuery logic --------

    // 1. Get login_name & user_name from USER_MASTER
    const loginResult = await db.query(
      `SELECT login_name, user_name FROM user_master WHERE user_id = $1`,
      [userId]
    );

    if (loginResult.rowCount > 0) {
      userData.login_name = loginResult.rows[0].login_name;
      userData.user_name = loginResult.rows[0].user_name;
    }

    // 2. Get DB_MODULE_DESC from VWDB_MODULE
    if (dbModule) {
      const dbModuleResult = await db.query(
        `SELECT full_name FROM vwdb_module WHERE sht_name = $1`,
        [dbModule]
      );

      if (dbModuleResult.rowCount > 0) {
        userData.db_module_desc = dbModuleResult.rows[0].full_name;
      }
    }

        const getLinkData = await db.query(
        `SELECT * FROM ${TABLE_NAMES.DB_LINK_RIGHT} WHERE user_id = $1  ORDER BY  link_name `,
        [userId]
        );

    return res.status(200).json({
      type: "found",
      userMstrData: userData,
      userLinkData: getLinkData.rows,
      totalCount: dataCount || 0
    });

  } catch (error) {
    console.error("Query Error:", error);
    return res.status(500).json({
      message: "Internal server error on Query"
    });
  }
};


const helpListData = async (req, res) => {
  const { help_list, form_status, } = req.query;

  if (!["Search", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "UserName") {
    const loginName = await db.query(`
      SELECT DISTINCT 
        M.login_name, M.user_name, R.user_id
      FROM 
        user_master M
      JOIN 
        moitdashboardright R ON M.user_id = R.user_id
      WHERE 
        COALESCE(M.active, 'N') = 'Y'
        AND R.user_id <> 0
      ORDER BY M.login_name
    `);
    return res.status(200).json(loginName.rows);
  }

  if (help_list === "DBModule") {
    const {f_user_id} = req.query

    if (!f_user_id) {
      return res.status(400).json({ error: "userId is required for DBModule help list" });
    }
    const dbModule = await db.query(
      `
      SELECT 
        UPPER(V.sht_name) AS sht_name,
        V.full_name
      FROM 
        vwdb_module V
      JOIN 
        moitdashboardright R 
        ON V.sht_name = R.db_module
      WHERE 
        R.user_id = $1
      `,
      [f_user_id]
    );
    return res.status(200).json(dbModule.rows);
  }

  return res.status(400).json({ error: "Invalid help_list parameter" });
};

const updateFormData = async (req, res) => {
  try {
    await db.query('BEGIN');

    const { formData, detailFormData } = req.body;

    for (const row of detailFormData) {
      const { allow_view, user_id, db_module, link_name } = row;

      const query = `
        UPDATE ${TABLE_NAMES.DB_LINK_RIGHT}
        SET allow_view = $1
        WHERE user_id = $2 AND db_module = $3 AND link_name = $4
      `;

      await db.query(query, [allow_view, user_id, db_module, link_name]);
    }

    await db.query('COMMIT');
    return res.status(200).send({ type:"success", message: 'Successfully updated' });
  } catch (error) {
    console.error('Update error:', error);
    await db.query('ROLLBACK');
    res.status(500).send({ type: 'error', message: error.message || 'Update failed' });
  }
};



exports.handleFormOperation = catchAsync(async(req,res,next)=>{
     if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await getDataOnQuery(req, res);
        return;
    }

    if(req?.query?.help_list){
        await helpListData(req,res);
        return;
    }

})

exports.handlePostFormData = catchAsync(async(req,res,next) =>{
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateFormData(req, res);
        return;
    }
    // if (req?.query?.form_status === "Insert") {
    //     await postFormData(req, res);
    //     return;
    // }

})