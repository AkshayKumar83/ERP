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
  transToMopmgradeDbData
} = require("./presentation");

const TABLE_NAMES = {
  MOPMGRADE: "mopmgrade", 
};  

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId, appFinYear);

  try {
    let queryParameter = `ORDER BY grade_cd OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["grade_cd"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }  

     //console.log("whereClauses", whereClauses);
      

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ?  "where " + whereClauses.join(" AND ") : "";

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);


    //          const getCount = await db.query(
    //           `SELECT COUNT(wc_id) FROM ${TABLE_NAMES.MOMMWC} where EXISTS (SELECT 'X' FROM MOMMSTOK S
    // WHERE S.WC_ID = MOMMWC.WC_ID)
    // AND DIVISION_ID = $1;
    //                       `,
    //           [divisionId]

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(grade_cd) FROM ${TABLE_NAMES.MOPMGRADE} ${queryValues};
                      `
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(grade_cd) FROM ${TABLE_NAMES.MOPMGRADE}
                      `,
        
      );
      recordCount = getCount.rows[0]?.count;
    }


    // POST QUERY DATA

    const mopmgradeData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOPMGRADE} ${queryParameter}
 `
    );      

     if (mopmgradeData.rows.length > 0) {
          await Promise.all(
            mopmgradeData.rows.map(async (item) => {
              if (item.grade_cd !== null) {
                const grdDesc = await db.query(
                  ` 		select description  from vwempgrd
    where code= $1`,
                  [item.grade_cd]
                );
    
                item.description =
                  grdDesc.rowCount > 0 ? grdDesc.rows[0].description : "";
              }
            })
          );
        }



    console.log('query', mopmgradeData)

    const responseData = {
      mopmgradeData: mopmgradeData.rows,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};    


const helpListData = async (req, res) => {
  let { appDivisionId, appFinYear, appUserId, form_status, help_list } =
    req.query;

  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "grade") {
    try {
      const gradData = await db.query(
        `	select description, code from vwempgrd
order by 1
         `
      );

      return res.status(200).json(gradData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json([]);
};   

const postGradeData = async (req, res) => {
  try {
    const { formData } = req.body;
    console.log("Received body:", req.body);

 

    if (formData) {
      const formArray = Array.isArray(formData)
        ? formData
        : [formData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
      
         // Remove unwanted keys before transformation
        delete record.id; 
        delete record.init_grade_cd;
      
   
        // Transform record to DB-ready data
        const mopmgradeData = transToMopmgradeDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOPMGRADE,
          mopmgradeData
        );
        const valuesForInsertQuery = Object.values(mopmgradeData);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          throw new Error(`Insert error at index ${index}: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateGradeData = async (req, res) => {
  const { formData, deletedData } = req.body;
  //console.log("formData", formData);  

 
  try {
    await db.query("BEGIN");

    // Define required variables

    // Handle UPDATE
    if (Array.isArray(formData) && formData.length) {
      for (const record of formData) {
       

        // Transform to DB-ready object
        const mapped = transToMopmgradeDbData(record);

        // Remove UI-only fields
        const {
          id,

          ...dbRecord
        } = mapped;

       
        dbRecord.grade_cd = record.grade_cd;

        // CASE 1: Update
        if (!record.id) {  

          console.log('update record', record)
          // console.log('update records')
          const columns = Object.keys(dbRecord);
          const values = Object.values(dbRecord);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `
            UPDATE ${TABLE_NAMES.MOPMGRADE}
               SET ${setClause}
             WHERE grade_cd = $${columns.length + 1} 
            
              
          `;

          console.log("UPDATE QUERY =>", query);
          //console.log("UPDATE VALUES =>", [...values, deptCd]);

          // console.log('query', query)

          await db.query(query, [...values,  record.init_grade_cd]);
        } else {
          
        
        // Remove unwanted keys before transformation
        delete record.id;
        delete record.description;
      
        delete record.init_grade_cd

        // Transform record to DB-ready data
        const mopmgradeData = transToMopmgradeDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOPMGRADE,
          mopmgradeData
        );
        const valuesForInsertQuery = Object.values(mopmgradeData);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          throw new Error(`Insert error at index ${index}: ${error.message}`);
        }
        }
      }
    }

    // // Handle DELETE
    // if (Array.isArray(deletedData) && deletedData.length) {
    //   for (const d of deletedData) {
    //     await db.query(
    //       `DELETE FROM ${TABLE_NAMES.MOPMCATGRD}
    //         WHERE cat_no = $1 and grd_no = $2`,
    //       [d.cat_no, d.grd_no]
    //     );
    //   }
    // } else if (deletedData) {
    //   await db.query(
    //     `DELETE FROM ${TABLE_NAMES.MOPMCATGRD}
    //       WHERE cat_no = $1 and grd_no = $2`,
    //     [deletedData.cat_no, deletedData.grd_no]
    //   );
    // }

    await db.query("COMMIT");
    res.status(200).send({ status: "Successfully updated" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(" Error updating department master:", err);
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
    await updateGradeData(req, res);
    return;
  } else {
    await postGradeData(req, res);
    return;
  }
});

