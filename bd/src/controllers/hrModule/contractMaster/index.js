const { response } = require("express");
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { dateFormater, dateFormate } = require("../../../utility/constant");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../utility/query");
//const { SnowDeviceManagement } = require("aws-sdk");
const {
  transToMopmcontrDbData
} = require("./presentation");

const TABLE_NAMES = {
  MOPMCONTR: "mopmcontr", 
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  //console.log("userId", userId)

  try {
    let queryParameter = `ORDER BY cont_code LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["cont_code"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

   // console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
     
      // console.log("whereClauses", queryValues);
    
    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(cont_code) FROM ${TABLE_NAMES.MOPMCONTR} ${queryValues}`
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter)
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(cont_code) FROM ${TABLE_NAMES.MOPMCONTR}
                `
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY cont_code DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY cont_code LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const mopmcontrData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOPMCONTR} ${queryParameter}
                `
    );  

    // Check here BEFORE accessing rows[0]
if (mopmcontrData.rows.length === 0) {
  return res.status(200).json({
    success: false,
    message: "No matching record found",
    mopmcontrData: [],
    recordCount: recordCount || 0
  });
}

    const contCity = mopmcontrData.rows[0]?.cont_city; 
   // console.log("contCity", contCity)

    const contractData = await db.query(
      `		SELECT 
    CAST(M.STATE_NAME AS VARCHAR(20)) as city,
    CAST(O.STATE_NAME AS VARCHAR(20)) as district,
    CAST(I.STATE_NAME AS VARCHAR(20)) as state ,
    CAST(T.STATE_NAME AS VARCHAR(20)) as zone,
    CAST(S.STATE_NAME AS VARCHAR(20)) as country,
    CAST(A.STATE_NAME AS VARCHAR(20)) as region
FROM MOITSTATE M,
     MOITSTATE O,
     MOITSTATE I,
     MOITSTATE T,
     MOITSTATE S,
     MOITSTATE A
WHERE M.TYPE      = 'C'
  AND M.STATE_ID  = $1
  AND M.PARENT_ID = O.STATE_ID
  AND O.PARENT_ID = I.STATE_ID
  AND I.PARENT_ID = T.STATE_ID
  AND T.PARENT_ID = S.STATE_ID
  AND S.PARENT_ID = A.STATE_ID;

`,
      [contCity]
    );

    mopmcontrData.rows[0].city_name =
      contractData.rowCount > 0 ? contractData.rows[0]?.city : ""; 

        mopmcontrData.rows[0].cont_district =
      contractData.rowCount > 0 ? contractData.rows[0]?.district : ""; 

        mopmcontrData.rows[0].cont_state =
      contractData.rowCount > 0 ? contractData.rows[0]?.state : ""; 

        mopmcontrData.rows[0].cont_zone =
      contractData.rowCount > 0 ? contractData.rows[0]?.zone : "";

        mopmcontrData.rows[0].cont_country =
      contractData.rowCount > 0 ? contractData.rows[0]?.country : "";  

        mopmcontrData.rows[0].cont_region =
      contractData.rowCount > 0 ? contractData.rows[0]?.region : "";

   

    const responseData = {
      mopmcontrData: mopmcontrData.rows[0],
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};   


const helpListData = async (req, res) => {
  let { appDivisionId, appFinYear, appUserId, form_status, help_list } =
    req.query;

  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "city") {
    try {
      const cityData = await db.query(
        `SELECT 
       SUBSTR(M.STATE_NAME,1,20)  CITY,
                  M.STATE_ID      CTYCODE,
                  M.SHORT_NAME,
       SUBSTR(O.STATE_NAME,1,20)  DISTRICT,
       SUBSTR(I.STATE_NAME,1,20)  STATE,
       SUBSTR(T.STATE_NAME,1,20)  ZONE,
       SUBSTR(S.STATE_NAME,1,20)  COUNTRY,
       SUBSTR(A.STATE_NAME,1,20)  REGION
 FROM
     MOITSTATE M ,MOITSTATE O,MOITSTATE I,
     MOITSTATE T,MOITSTATE S,MOITSTATE A
 WHERE
      M.TYPE='C' AND
      M.PARENT_ID=O.STATE_ID AND
      O.PARENT_ID=I.STATE_ID AND
      I.PARENT_ID=T.STATE_ID AND
      T.PARENT_ID=S.STATE_ID AND
      S.PARENT_ID=A.STATE_ID

	
         `
      );

      return res.status(200).json(cityData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json([]);
};   


const postContractData = async (req, res) => {
  try {
    const { formData} = req.body;    


    delete formData.cont_district;
    delete formData.cont_state;
    delete formData.cont_zone;
    delete formData.cont_country;
    delete formData.cont_region;
   
        // Transform record to DB-ready data
        const mopmcontrData = transToMopmcontrDbData(formData);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOPMCONTR,
          mopmcontrData
        );
        const valuesForInsertQuery = Object.values(mopmcontrData);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          throw new Error(error.message);
        }
      
    

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};    



const updateContractData = async (req, res) => {
  const { formData } = req.body;

  try {
    await db.query("BEGIN");

    // 1) Transform incoming formData to DB columns
    const dbRecord = transToMopmcontrDbData(formData);

    // 2) Extract column names and values
    const columns = Object.keys(dbRecord);
    const values = Object.values(dbRecord);

    // 3) Build SET clause dynamically
    const setClause = columns
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");

    // 4) Final update query
    const query = `
      UPDATE ${TABLE_NAMES.MOPMCONTR}
         SET ${setClause}
       WHERE cont_code = $${columns.length + 1}
    `;

    console.log("UPDATE QUERY =>", query);

    // 5) Execute query
    await db.query(query, [
      ...values,
      formData.cont_code, 
    ]);

    await db.query("COMMIT");
    res.status(200).send({ status: "Successfully updated" });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error updating contract:", err);
    res.status(500).send({ error: err.message });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  // await getDataOnQuery(req, res);
  // return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateContractData(req, res);
    return;
  } else {
    await postContractData(req, res);
    return;
  }
});
