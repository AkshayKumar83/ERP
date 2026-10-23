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
const { transToMopmcatgrdDbData } = require("./presentation");

const TABLE_NAMES = {
  VWEMPCAT: "VWEMPCAT",
  MOPMCATGRD: "mopmcatgrd",
};

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY  code  OFFSET ${req.query.offset || 0}`;

    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.VWEMPCAT}`
    );
    let dataCount = getCount.rows[0]?.count;  

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["description"];

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


     if (whereClauses.length > 0) {
          const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.VWEMPCAT}`
    )
          recordCount = getCount.rows[0]?.count;
          queryParameter = `${queryValues} ${queryParameter}`;
        } else {
           const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.VWEMPCAT}`
    )
          dataCount = getCount.rows[0]?.count;
        }


      

    // switch (req?.query?.get_data) {
    //   case "Query":
    //   case "First": {
    //     const getCount = await db.query(
    //       `SELECT COUNT(*) FROM ${TABLE_NAMES.TOFMINVSUMM}`
    //     );
    //     dataCount = getCount.rows[0]?.count;
    //     break;
    //   }

    //   case "Last": {
    //     queryParameter = "ORDER BY INV_DT  DESC LIMIT 1";
    //     break;
    //   }

    //   default:
    //     queryParameter = `ORDER BY INV_DT  LIMIT 1 OFFSET ${
    //       req.query.offset || 0
    //     }`;
    //     break;
    // }

    const descriptionData = await db.query(
      `select * from ${TABLE_NAMES.VWEMPCAT} ${queryParameter} `
    );

    const code = descriptionData.rows[0]?.code;

    const categoryData = await db.query(
      `select * from  ${TABLE_NAMES.MOPMCATGRD} where cat_no = $1`,
      [code]
    );

    if (categoryData.rows.length > 0) {
      await Promise.all(
        categoryData.rows.map(async (item) => {
          if (item.grd_no !== null) {
            const grdDesc = await db.query(
              ` 		select description  from vwempgrd
where code= $1`,
              [item.grd_no]
            );

            item.grd_desc =
              grdDesc.rowCount > 0 ? grdDesc.rows[0].description : "";
          }
        })
      );
    }

    const response = {
      descriptionData: descriptionData.rows[0],
      categoryData: categoryData.rows,
      count: dataCount || 0,
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
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


exports.getValidateData = catchAsync(async (req, res) => {
  //console.log("getvalidate");
  try {
    const {
      grd_no, 
      cat_no,
      appDivisionId,
      appFinYear,
    } = req.query;

    if (!grd_no || !cat_no) {
      //return res.status(400).json({ message: "Required fields missing" });
      return;
    }

    // 1. Check for duplicate
        const duplicateCheckQuery = `
    select * from mopmcatgrd
      where cat_no = $1
      and grd_no = $2
  `;
        const duplicateResult = await db.query(duplicateCheckQuery, [
          cat_no,
          grd_no,
        ]);
        if (duplicateResult.rowCount > 0) {
          return res.status(400).json({
            error: "Combination of Category and Grade already exists",
          });
        }

 
    return res.status(200).json({ message: "Validation successful" });
  } catch (err) {
    console.error("Validation Error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error during validation." });
  }
});

const postGrdCatData = async (req, res) => {
  try {
    const { formData, formDetailData } = req.body;  
    const catNo = formData.code;
   // console.log("Received body:", req.body);

    if (formDetailData) {
      const formArray = Array.isArray(formDetailData)
        ? formDetailData
        : [formDetailData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        // Duplicate check...
        const duplicateCheckQuery = `
    select * from mopmcatgrd
      where cat_no = $1
      and grd_no = $2
  `;
        const duplicateResult = await db.query(duplicateCheckQuery, [
          catNo,
          record.grd_no,
        ]);
        if (duplicateResult.rowCount > 0) {
          return res.status(400).json({
            error: "Combination of Category and Grade already exists",
          });
        }

        // Remove unwanted keys before transformation
        delete record.id; 
        delete record.init_grd_no
        delete record.grd_desc;
        record.cat_no = catNo;

        // Transform record to DB-ready data
        const mopmcatgrdData = transToMopmcatgrdDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOPMCATGRD,
          mopmcatgrdData
        );
        const valuesForInsertQuery = Object.values(mopmcatgrdData);

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




const updateGrdCatData = async (req, res) => {
  const { formData, deletedData, formDetailData } = req.body;
  //console.log("formData", formData);  

  const catNo = formData.code;

  try {
    await db.query("BEGIN");

    // Define required variables

    // Handle UPDATE
    if (Array.isArray(formDetailData) && formDetailData.length) {
      for (const record of formDetailData) {
       

        // Transform to DB-ready object
        const mapped = transToMopmcatgrdDbData(record);

        // Remove UI-only fields
        const {
          id,

          ...dbRecord
        } = mapped;

        dbRecord.cat_no = record.cat_no;
        dbRecord.grd_no = record.grd_no;

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
            UPDATE ${TABLE_NAMES.MOPMCATGRD}
               SET ${setClause}
             WHERE cat_no = $${columns.length + 1} 
             and grd_no = $${columns.length + 2}
              
          `;

          console.log("UPDATE QUERY =>", query);
          //console.log("UPDATE VALUES =>", [...values, deptCd]);

          // console.log('query', query)

          await db.query(query, [...values, record.cat_no, record.init_grd_no]);
        } else {
          // Duplicate check...
          const duplicateCheckQuery = `
    select * from mopmcatgrd
      where cat_no = $1
      and grd_no = $2
  `;
          const duplicateResult = await db.query(duplicateCheckQuery, [
            formData.cat_no,
            record.grd_no,
          ]);
          if (duplicateResult.rowCount > 0) {
            return res.status(400).json({
              error: "Combination of Category and Grade already exists",
            });
          }

        
        // Remove unwanted keys before transformation
        delete record.id;
        delete record.grd_desc;
        record.cat_no = catNo; 
        delete record.init_grd_no

        // Transform record to DB-ready data
        const mopmcatgrdData = transToMopmcatgrdDbData(record);

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOPMCATGRD,
          mopmcatgrdData
        );
        const valuesForInsertQuery = Object.values(mopmcatgrdData);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          throw new Error(`Insert error at index ${index}: ${error.message}`);
        }
        }
      }
    }

    // Handle DELETE
    if (Array.isArray(deletedData) && deletedData.length) {
      for (const d of deletedData) {
        await db.query(
          `DELETE FROM ${TABLE_NAMES.MOPMCATGRD}
            WHERE cat_no = $1 and grd_no = $2`,
          [d.cat_no, d.grd_no]
        );
      }
    } else if (deletedData) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.MOPMCATGRD}
          WHERE cat_no = $1 and grd_no = $2`,
        [deletedData.cat_no, deletedData.grd_no]
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
    await updateGrdCatData(req, res);
    return;
  } else {
    await postGrdCatData(req, res);
    return;
  }
});
