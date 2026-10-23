const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MHFMBANK: "mhfmbank",
};

// for dropdown data

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const CurrencyList = await db.query(
    `select curr_desc, curr_code from currency order by 1   `
  );

  return res.status(200).json({
    currency: CurrencyList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  //console.log("userId", userId)

  try {
    let queryParameter = `ORDER BY trans_type LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["acc_no"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";
     
       console.log("whereClauses", queryValues);
    
    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.MHFMBANK} WHERE  division_id =$1 ${queryValues}`, [divisionId]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter)
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(trans_type) FROM ${TABLE_NAMES.MHFMBANK} where division_id = $1
                `, [divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY trans_type DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY trans_type LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const mhfmbankData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MHFMBANK} where division_id = $1 ${queryParameter}
                `,
      [divisionId]
    );

    const accNo = mhfmbankData.rows[0].acc_no;

    const accName = await db.query(
      `select * from vwmdfmglm  where acc_no = $1`,
      [accNo]
    );

    mhfmbankData.rows[0].bank_name =
      accName.rowCount > 0 ? accName.rows[0].acc_desc : "";

    if (mhfmbankData.rows.length === 0) { 
      console.log('count')
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        mhfmbankData: [],
        recordCount: 0,
      });
    }

    const responseData = {
      mhfmbankData: mhfmbankData.rows[0],
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const helpListData = async (req, res) => {
//   const { help_list, form_status, appDivisionId, appFinYear, appUserId } =
//     req.query;

 
//   if (
//     help_list === "acc" &&
//     (form_status === "Insert" ||
//       form_status === "Update" ||
//       form_status === "Search")
//   ) {  
    

//     try {  
        
//       if (help_list === "acc") {
//     let acc;
//     if (form_status === "Search") {
//       acc = await db.query(
//         `select distinct acc_no, acc_desc from  vwmdfmglm v
// 		where exists (select 1 from mhfmbank t where v.acc_no = t.acc_no)`
//       );
//     }   
//     if(['Insert', 'Update'].form_status) {
//         acc = await db.query(
//         `select acc_no, acc_desc 
//              from vwmdfmglm 
//            where division_id = $1
//            and trans_year = $2`,
//         [appDivisionId, appFinYear]
//       );
 
//     }
     
//       return res.status(200).json(accList.rows);
//     } catch (error) {
//       console.error("Database query error:", error); // Log the error
//       return res.status(500).json({ error: "Internal server error" }); // Handle the error gracefully
//     }
//   } else {
//     return res.status(400).json({ error: "Invalid request" }); // Handle invalid requests
//   }
// };  

const helpListData = async (req, res) => {
  const { help_list, form_status, appDivisionId, appFinYear } = req.query;

  if (
    help_list === "acc" &&
    (form_status === "Insert" ||
     form_status === "Update" ||
     form_status === "Search")
  ) {
    try {
      let acc;

      if (form_status === "Search") {
        acc = await db.query(
          `SELECT DISTINCT acc_no, acc_desc 
             FROM vwmdfmglm v
            WHERE EXISTS (
                    SELECT 1 FROM mhfmbank t 
                    WHERE v.acc_no = t.acc_no
                  )`
        );
      } else if (["Insert", "Update"].includes(form_status)) {
        acc = await db.query(
          `SELECT acc_no, acc_desc
             FROM vwmdfmglm
            WHERE division_id = $1
              AND trans_year = $2`,
          [appDivisionId, appFinYear]
        );
      }

      return res.status(200).json(acc.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(400).json({ error: "Invalid request" });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  // }

  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

// for validate data

exports.getValidateData = catchAsync(async (req, res) => {
  const { acc_no } = req.query;

  try {
    if (!acc_no) {
      return res.status(400).json({ error: "account no is required" });
    }

    //console.log("email_type after query:", email_type);

    const accData = await db.query(
      "SELECT *  FROM integral.mhfmbank WHERE acc_no = $1",
      [acc_no]
    );

    if (accData.rows.length > 0) {
      return res.status(409).json({
        error: "Account Code already exists in Bank Master.",
      });
    }

    return res.status(200).json({}); // Send an empty string if not found
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const postBankDetails = async (req, res) => {
  try {
    const { formData, divisionId } = req.body;
    //console.log("formData", req.body);

    const transType = await db.query(
      ` SELECT 
    CASE 
        WHEN COALESCE(MAX(SUBSTRING(trans_type FROM 2 FOR 1)), '0') = '9' 
        THEN 'BA'
        ELSE 'B' || CHR(ASCII(COALESCE(MAX(SUBSTRING(trans_type FROM 2 FOR 1)), '0')) + 1)
    END AS result
FROM ${TABLE_NAMES.MHFMBANK}`
    );

    //console.log("trans_type:", transType.rows[0].result)
    const cleanBankDetailsForInsert = cleanObject(formData);
    cleanBankDetailsForInsert.trans_type = transType.rows[0].result;
    cleanBankDetailsForInsert.division_id = divisionId;
    //console.log("cleanBankDetailsForInsert:", cleanBankDetailsForInsert);

    if (Object.keys(cleanBankDetailsForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.MHFMBANK,
      cleanBankDetailsForInsert
    );
    const valuesForInsertQuery = Object.values(cleanBankDetailsForInsert);
    //console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(400).send("Some error occurred", error);
  }
};

const updateBankDetails = async (req, res) => {
  console.log("for update:", req.body);

  const { acc_no, divisionId, trans_type, ...formData } = req.body;

  try {
    await db.query("BEGIN");

    if (Object.keys(req.body).length !== 0) {
      
      delete formData.count;
      const cleanBankDetailsForUpdate = cleanObject(formData);
      const columns = Object.keys(cleanBankDetailsForUpdate);
      const values = Object.values(cleanBankDetailsForUpdate);

      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${
        TABLE_NAMES.MHFMBANK
      } SET ${setClause} WHERE acc_no = $${
        columns.length + 1
      } AND division_id = $${columns.length + 2} AND trans_type = $${
        columns.length + 3
      }`;

      console.log("here updated formData query: ", query);

      try {
        // Execute the update query
        await db.query(query, [...values, acc_no, divisionId, trans_type]);
        await db.query("COMMIT");
        console.log("updated successfully");
      } catch (error) {
        await db.query("ROLLBACK");
        throw new Error(error);
      }
    }
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
    return res.status(500).send({ error: "Update failed" });
  }
};

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateBankDetails(req, res);
    return;
  } else {
    await postBankDetails(req, res);
    return;
  }
});
