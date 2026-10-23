const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const {
  generateSingleInsertQuery,
  cleanObject,
  buildSearchQuery,
  convertStringsToBooleans,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOITSTATE: "integral.moitstate",
  GET_STATE_ID_BY_SEQUENCE: "nextval(s_moitstate_state_id)",
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  //console.log("userId", userId)

  try {
    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["state_name", "type"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

    let queryParameter = `ORDER BY state_id  OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount;

    console.log("query:", req?.query);
    console.log("Offset value:", req.query.offset);

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.MOITSTATE} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.MOITSTATE}`
          );
          dataCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY state_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY state_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }
console.log(`select * from ${TABLE_NAMES.MOITSTATE} ${queryParameter} `)
    const stateData = await db.query(
      `select * from ${TABLE_NAMES.MOITSTATE} ${queryParameter}`
    );    

    if(stateData.rows.length = 0) { 
      
      return
    }
   // console.log("stateData:", stateData.rows[0]); 
   
   const parentId = stateData.rows[0]?.parent_id

   const parentData = await db.query(`select * from ${TABLE_NAMES.MOITSTATE} where state_id = $1 `, [parentId]) 

   const parentDesc = parentData.rows[0]?.state_name 
   console.log("parent desc", parentDesc) 

    const response = {
      stateData: stateData.rows,
      count: dataCount || 0,
      parentDesc: parentDesc
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
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
  const { stateName, type, shortName } = req.query;

  try {
    if (stateName) {
      console.log("state name is present");
      // Validate state name
      const stateData = await db.query(
        "SELECT * FROM moitstate WHERE state_name = $1 AND type = $2",
        [stateName, type]
      );

      if (stateData.rows.length > 0) {
        console.log("State name already exists");
        return res.status(400).json({ message: "State Name Already Exists" });
      }
    }
    if (shortName) {
      // Validate short name
      console.log("short name is already present");
      const shortData = await db.query(
        "SELECT short_name FROM moitstate WHERE short_name = $1 AND type = $2",
        [shortName, type]
      );

      if (shortData.rows.length > 0) {
        console.log("Short name already exists");
        return res.status(400).json({ message: "Short Name Already Exists" });
      }
    }

    // If validation passes
    res.status(200).json({ message: "Validation passed" });
  } catch (error) {
    console.error("Error during validation", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// for searching records -----

exports.getSearchedData = catchAsync(async (req, res) => {
  const { state_name, type, gst_state_code } = req.query;
  console.log("req query:", req.query);

  try {
    if (state_name) {
      const stateData = await db.query(
        "SELECT * FROM MOITSTATE WHERE state_name = $1 AND type = $2",
        [state_name, type]
      );

      const response = {
        stateData: stateData.rows[0],
      };

      return res.send(response);
    }

    if (gst_state_code) {
      const stateData = await db.query(
        "SELECT * FROM MOITSTATE WHERE state_name =$1 AND type = $2",
        [gst_state_code, type]
      );

      const response = {
        stateData: stateData.rows[0],
      };

      return res.send(response);
    }
  } catch (error) {}
});

exports.getQueryData = catchAsync(async (req, res) => {
  try {
    const formData = req.body["0"];
    const { type } = req.body;

    console.log("Body:", req.body);

    // Extract individual fields from formData
    const { state_name: stateName, gst_state_code: gstCode } = formData;

    console.log("state_name:", stateName);
    console.log("type:", type);

    // Execute the query to fetch the state details
    const result = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOITSTATE} WHERE state_name = $1 AND Type = $2`,
      [stateName, type]
    );

    // Check if the query returned any rows
    if (result.rows.length === 0) {
      console.log("No matching state found.");
      return res.status(404).send({ message: "State not found." });
    }

    const stateData = result.rows[0]; // Extract the first row
    const parentId = stateData?.parent_id; // Access parent_id if it exists

    let parentDesc = null;
    if (parentId) {
      // Fetch the parent description only if parentId exists
      const parentdescResult = await db.query(
        `SELECT state_name FROM ${TABLE_NAMES.MOITSTATE} WHERE state_id = $1`,
        [parentId]
      );
      parentDesc = parentdescResult.rows[0]?.state_name || null;
    }

    const response = {
      stateData,
      state_name: stateData.state_name,
      gst_state_code: stateData.gst_state_code,
      parent_desc: parentDesc,
    };

    console.log("State name is present");
    return res.send(response);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
});

const postStateData = async (req, res) => {
  try {
    const { formData, stateData } = req.body;
    console.log("req body:", req.body);

    const Type = formData.type;

    if (stateData) {
      const stateArray = Array.isArray(stateData) ? stateData : [stateData];

      for (const [index, record] of stateArray.entries()) {
        delete record.id;

        // Ensure parent_desc exists in the record
        if (!record.parent_desc) {
          throw new Error(`Missing parent_desc for record at index ${index}`);
        }

        // Fetch parentId based on parent_desc
        const parentResult = await db.query(
          `SELECT state_id FROM moitstate WHERE state_name = $1`,
          [record.parent_desc]
        );

        // Ensure parentId exists
        if (parentResult.rows.length === 0) {
          throw new Error(
            `No matching parent_id found for parent_desc: ${record.parent_desc}`
          );
        }

        const parentId = parentResult.rows[0].state_id;

        // Retrieve the next sequence value for state_id
        const get_state_id = await db.query(
          `SELECT nextval('s_moitstate_state_id') AS next_id`
        );
        const stateId = get_state_id.rows[0].next_id;

        // Add state_id, parent_id, and type fields to the record
        record.state_id = stateId;
        record.parent_id = parentId; // Adding the retrieved parentId
        record.type = Type;

        // Remove parent_desc from the record
        delete record.parent_desc;

        // Generate insert query
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOITSTATE,
          record
        );
        const valuesForInsertQuery = Object.values(record);

        // Insert the record into the database
        try {
          await db.query(queryForInsert, valuesForInsertQuery);
          console.log("inserted successfully")
        } catch (error) {
          console.error(
            `Error inserting state record at index ${index}:`,
            error
          );
          throw new Error(
            `State insert error at index ${index}: ${error.message}`
          );
        }
      }
    }

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateStateDetails = async (req, res) => {
  //console.log("For update:", req.body);

  const { state_id, formData, stateData, updateFormPayload, deletedStateData } = { ...req?.body };
  console.log(
    "After getting update:",
    // formData,
    // state_id,
    // updateFormPayload.updatedStateData,
   // updateFormPayload.deletedStateData
    //stateData
  );

  // Get the 'type' from the request body (frontend sends it as part of the body)
  const type = req.body.type || "defaultType";

  try {
    await db.query("BEGIN");

    // Update the stateData
    if (stateData && stateData.length >= 1) {
      const stateId = stateData[0].state_id || null;
      console.log("Processing state data for update or insert");

      // Loop through each record in the stateData array
      for (const [index, record] of stateData.entries()) {
        const { state_id: recordStateId } = record;

        if (record.hasOwnProperty("state_id") && recordStateId) {
          console.log(
            `Updating record at index ${index} for state_id: ${recordStateId}`
          );

          // Clean the current record only
          const stateDataForUpdate = cleanObject({ ...record });

          // Exclude the 'parent_desc' column from the update
          delete stateDataForUpdate.parent_desc;

          const columns = Object.keys(stateDataForUpdate);
          const values = Object.values(stateDataForUpdate);

          // Create SET clause for SQL UPDATE query
          const setClause = columns
            .map((column, index) => `${column} = $${index + 1}`)
            .join(", ");

          // Generate the full SQL query
          const query = `UPDATE ${TABLE_NAMES.MOITSTATE} 
                         SET ${setClause} 
                         WHERE state_id = $${columns.length + 1}`;

          //console.log("SQL query for updated state:", query);

          try {
            // Execute the update query
            await db.query(query, [...values, recordStateId]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(error);
          }
        } else {
          // Insert new record
          if (!record.parent_desc) {
            throw new Error(`Missing parent_desc for record at index ${index}`);
          }

          const parentResult = await db.query(
            `SELECT state_id FROM ${TABLE_NAMES.MOITSTATE} WHERE state_name = $1`,
            [record.parent_desc]
          );

          if (parentResult.rows.length === 0) {
            throw new Error(
              `No matching parent_id found for parent_desc: ${record.parent_desc}`
            );
          }

          const parentId = parentResult.rows[0].state_id;
          const get_state_id = await db.query(
            `SELECT nextval('s_moitstate_state_id') AS next_id`
          );
          const stateId = get_state_id.rows[0].next_id;

          const stateDataForInsert = cleanObject({
            state_id: stateId,
            parent_id: parentId,
            ...record,
            type,
          });

          delete stateDataForInsert.parent_desc;
          delete stateDataForInsert.id;

          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.MOITSTATE,
            stateDataForInsert
          );

          await db.query(queryForInsert, Object.values(stateDataForInsert));
        }
      }
    }

    // Delete State Data
    if (
      Array.isArray(deletedStateData) &&
      deletedStateData.length
    ) {
      for (const deletedRecord of deletedStateData) {
        const deleteState = `DELETE FROM ${TABLE_NAMES.MOITSTATE}
                             WHERE state_id = $1`;
        console.log("Delete query:", deleteState);

        try {
          // Execute the delete query for each record
          await db.query(deleteState, [deletedRecord.state_id]);
        } catch (error) {
          console.error(`Error deleting record:`, error);
          throw new Error(error);
        }
      }
    } else if (deletedStateData) {
      // Process as single record
      const deleteState = `DELETE FROM ${TABLE_NAMES.MOITSTATE}
                           WHERE state_id = $1`;

      console.log("Delete query:", deleteState);

      try {
        // Execute the delete query for the record
        await db.query(deleteState, [
          deletedStateData.state_id,
        ]);
      } catch (error) {
        console.error(`Error deleting record:`, error);
        throw new Error(error);
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ message: "Failed to update state details" });
  }
};

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateStateDetails(req, res);
    return;
  } else {
    await postStateData(req, res);
    return;
  }
});

// use a callback function

// function sayGoodBye() {
//   console.log("hello goodbye");
// }

// function greet(name, sayGoodBye) {
//   console.log("Hello " + name + "!");
//   sayGoodBye();
// }

// greet("Alice", sayGoodBye);
