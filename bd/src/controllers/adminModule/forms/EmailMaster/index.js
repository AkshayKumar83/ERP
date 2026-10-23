const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  EMAIL_MASTER: "moit_email_master",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const divisionList = await db.query(
    `select name, division_id from moitdivision order by 2`
  );

  const emailTypeList = await db.query(
    `select email_desc,email_type from vwemailtype order by email_desc`
  );

  return res.status(200).json({
    division: divisionList.rows,
    emailType: emailTypeList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  console.log("this is working");
  try {
    let queryParameter = ` order by email_type LIMIT 1 OFFSET ${req.query.offset || 0
      }`;
    let dataCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["email_type", "email_from"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    console.log("whereClauses", queryValues);

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.EMAIL_MASTER} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter)
    }

    else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.EMAIL_MASTER}`
          );
          dataCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "order by email_type DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = ` order by email_type LIMIT 1 OFFSET ${req.query.offset || 0
            }`;
          break;
      }
    }

    const emailMasterData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.EMAIL_MASTER} ${queryParameter}`
    );
    //console.log("emailMasterData:", emailMasterData.rows[0]);

    const response = {
      ...emailMasterData.rows[0],
      count: dataCount || 0,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");

  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  // } 

    if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

const postEmailMasterDetails = async (req, res) => {
  try {
    const { formData } = req.body;
    console.log("formData", req.body);

    const cleanEmailMasterForInsert = cleanObject(formData);
    console.log("cleanEmailMasterForInsert:", cleanEmailMasterForInsert);

    if (Object.keys(cleanEmailMasterForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.EMAIL_MASTER,
      cleanEmailMasterForInsert
    );
    const valuesForInsertQuery = Object.values(cleanEmailMasterForInsert);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(400).send("Some error occurred");
  }
};

const updateEmailMasterDetails = async (req, res) => {
  console.log("for update:", req.body);

  const { email_type, division_id, ...formData } = req.body;

  try {
    await db.query("BEGIN");

    if (Object.keys(req.body).length !== 0) {
      const emailMasterDataForInsert = { ...formData };

      delete emailMasterDataForInsert.count;

      const cleanEmailMasterDataForUpdate = cleanObject(emailMasterDataForInsert);
      const columns = Object.keys(cleanEmailMasterDataForUpdate);
      const values = Object.values(cleanEmailMasterDataForUpdate);

      // Create SET clause for SQL UPDATE query
      const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${TABLE_NAMES.EMAIL_MASTER} SET ${setClause} WHERE email_type = $${columns.length + 1} AND division_id = $${columns.length + 2}`;

      console.log("here updated formData query: ", query);

      try {
        // Execute the update query
        await db.query(query, [...values, email_type, division_id]);
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
    await updateEmailMasterDetails(req, res);
    return;
  } else {
    await postEmailMasterDetails(req, res);
    return;
  }
});
