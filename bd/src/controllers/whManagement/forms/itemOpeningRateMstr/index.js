const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

let TABLE_NAMES = {
  MOMMITEM: "mommitem",
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  //console.log("userId", userId)

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["it_code", "it_name", "rev_level"];

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

  try {
    let queryParameter = `ORDER BY it_code LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(it_code) FROM ${TABLE_NAMES.MOMMITEM}   ${queryValues}
                              `
      );

      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter);
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(it_code) FROM ${TABLE_NAMES.MOMMITEM} 
                `
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY IT_CODE DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY IT_CODE LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const mommitemData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOMMITEM} ${queryParameter}
                `
    );

    if (mommitemData.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        mommitemData: [],
        recordCount: 0,
      });
    }

    const responseData = {
      mommitemData: mommitemData.rows[0],
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateItemOpeningRate = async (req, res) => {
  console.log("for update:", req.body);

  const formData = req.body; // now direct, no destructuring

  try {
    if (!formData || Object.keys(formData).length === 0) {
      return res.status(400).send({ error: "No data provided for update" });
    }

    if (!formData.it_code) {
      return res.status(400).send({ error: "Missing it_code for update" });
    }

    await db.query("BEGIN");

    const { it_code, ...rest } = formData;
    delete rest.count;

    const cleanObjectSafe = (obj) => {
      if (!obj || typeof obj !== "object") return {};
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => {
          if (v === "") {
            return [k, null]; // only for empty strings
          }
          return [k, v];
        })
      );
    };

    const cleanItemRateForUpdate = cleanObjectSafe(rest);

    if (Object.keys(cleanItemRateForUpdate).length === 0) {
      await db.query("ROLLBACK");
      return res.status(400).send({ error: "No valid fields to update" });
    }

    const columns = Object.keys(cleanItemRateForUpdate);
    const values = Object.values(cleanItemRateForUpdate);

    const setClause = columns
      .map((column, index) => `${column} = $${index + 1}`)
      .join(", ");

    const query = `UPDATE ${
      TABLE_NAMES.MOMMITEM
    } SET ${setClause} WHERE it_code = $${columns.length + 1}`;

    // console.log("Update query:", query);
    //   console.log("Update values:", [...values, it_code]);

    await db.query(query, [...values, it_code]);
    await db.query("COMMIT");

    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ error: "Update failed" });
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

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateItemOpeningRate(req, res);
    return;
  } else {
    await postBankDetails(req, res);
    return;
  }
});
