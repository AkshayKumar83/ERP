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
  transToMoitdlybulletinDbData
} = require("./presentation");

const TABLE_NAMES = {
  MOITDLY: "moitdlybulletin", 
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId, appFinYear);

  try {
    let queryParameter = `ORDER BY news_date OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["news_date"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }  

     console.log("whereClauses", whereClauses);
      

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
        `SELECT COUNT(news_date) FROM ${TABLE_NAMES.MOITDLY} ${queryValues};
                      `
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(news_date) FROM ${TABLE_NAMES.MOITDLY}
                      `,
        
      );
      recordCount = getCount.rows[0]?.count;
    }


    // POST QUERY DATA

    const moitDailyData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOITDLY} ${queryParameter}
 `
    );  
    

      moitDailyData.rows.forEach((item) => {
        item.news_date =
          dateFormater(item.news_date) || null;
        
      });
   // console.log('query', moitDailyData)

    const responseData = {
      moitDailyData: moitDailyData.rows,
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



const postDailyBulletinData = async (req, res) => {
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
  //       // Duplicate check...
  //       const duplicateCheckQuery = `
  //   SELECT 1 FROM  mhpmdept
  //   WHERE dept_cd = $1
  // `;
  //       const duplicateResult = await db.query(duplicateCheckQuery, [
  //         record.dept_cd,
         
  //       ]);
  //       if (duplicateResult.rowCount > 0) {
  //         return res.status(400).json({
  //           error:
  //             "Department Code already exists",
  //         });
  //       } 

         // Remove unwanted keys before transformation
        delete record.id; 
        delete record.init_news_date; 
        delete record.init_bulletin_news;
      
   
        // Transform record to DB-ready data
        const moitDailyData = transToMoitdlybulletinDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOITDLY,
          moitDailyData
        );
        const valuesForInsertQuery = Object.values(moitDailyData);

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

const updateDailyBulletinData = async (req, res) => {
  const { formData, deletedData } = req.body;
 //console.log("formData", formData);

  try {
    await db.query("BEGIN");

    // Define required variables
  

    // Handle UPDATE
    if (Array.isArray(formData) && formData.length) {
      for (const record of formData) {   

        // Transform to DB-ready object
        const mapped = transToMoitdlybulletinDbData(record);

        // Remove UI-only fields
        const {
          id,
          
          ...dbRecord
        } = mapped;

        dbRecord.news_date = record.news_date 
        dbRecord.bulletin_news = record.bulletin_news
       

        // CASE 1: Update
        if (!record.id) {  

         // console.log('update records')
          const columns = Object.keys(dbRecord);
          const values = Object.values(dbRecord);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `
            UPDATE ${TABLE_NAMES.MOITDLY}
               SET ${setClause}
             WHERE news_date = $${columns.length + 1} and bulletin_news = $${columns.length + 2}
              
          `;    

          console.log("UPDATE QUERY =>", query);
  //console.log("UPDATE VALUES =>", [...values, deptCd]);

         // console.log('query', query)

          await db.query(query, [
            ...values,
            record.init_news_date,
            record.init_bulletin_news
           
          ]);
        }  

       
       
      }
    }

    // Handle DELETE
    if (Array.isArray(deletedData) && deletedData.length) {
      for (const d of deletedData) {
        await db.query(
          `DELETE FROM ${TABLE_NAMES.MOITDLY}
            WHERE news_date = $1 and bulletin_news = $2`,
          [d.init_news_date, d.init_bulletin_news]
        );
      }
    } else if (deletedData) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.MOITDLY}
          WHERE news_date = $1 and bulletin_news = $2`,
        [deletedData.init_news_date, deletedData.init_bulletin_news]
      );
    }

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
    await updateDailyBulletinData(req, res);
    return;
  } else {
    await postDailyBulletinData(req, res);
    return;
  }
});
