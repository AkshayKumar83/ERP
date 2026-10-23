
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformoperationToDbData } = require("./presentation");

let TABLE_NAMES = {
    DEFINE_OPERATION: `MOEMOPNS`,
};

// Get unit master data
const getOperationDataOnQuery = async (req, res) => {
  try {
    const getData = await db.query(`
      SELECT *, COUNT(*) OVER() AS total_count 
      FROM ${TABLE_NAMES.DEFINE_OPERATION}
      ORDER BY operation_no
    `);

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        defineOprtn: getData.rows,
        totalCount: getData.rows[0].total_count, 
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        defineOprtn: [],
        totalCount: 0,
        message: "No data found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};



// Insert new unit records
const postOperationData = async (req, res) => {
  const payload = req.body;

  try {
    await db.query("BEGIN");

    const formData = payload.formData || [];

    // Filter only new records
    const newRows = formData.filter(row => row.isNew);

    for (let row of newRows) {

      //  PostgreSQL sequence (Oracle nextval replacement)
      const { rows } = await db.query(
        `SELECT nextval('s_moemopns_opn_id') AS opn_id`
      );

      const opn_id = rows[0].opn_id;

      const finalRow = { ...row, opn_id };
      const unitMstr = transformoperationToDbData(finalRow);

      const queryForInsert =
        generateSingleInsertQuery(TABLE_NAMES.DEFINE_OPERATION, unitMstr);

      const valuesForInsertQuery = Object.values(unitMstr);

      await db.query(queryForInsert, valuesForInsertQuery);
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "New Records inserted successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};


// Update / Insert / Delete handling
const updateOperationData = async (req, res) => {
  const { formData = [], deletedRecords = [] } = req.body;

  try {
    await db.query("BEGIN");

    /* ================= INSERT (NEW ROWS) ================= */
    const newRows = formData.filter(row => row.isNew);

    for (const row of newRows) {
      const { rows } = await db.query(
        `SELECT nextval('s_moemopns_opn_id') AS opn_id`
      );

      const finalRow = {
        ...row,
        opn_id: rows[0].opn_id,
      };

      const insertData = transformoperationToDbData(finalRow);
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.DEFINE_OPERATION,
        insertData
      );

      await db.query(insertQuery, Object.values(insertData));
    }

    /* ================= UPDATE (CHANGED ROWS) ================= */
    const updatedRows = formData.filter(
      row => row.isStatus === "changed" && !row.isNew
    );

    for (const row of updatedRows) {
            console.log("UPDATE ROW:", row);


      const updateData = transformoperationToDbData(row);
     console.log("UPDATE DATA:", updateData);
      const columns = Object.keys(updateData).filter(
        col => col !== "opn_id"
      );

      const values = columns.map(col => updateData[col]);
     console.log("VALUES:", values, "OPN_ID:", row.opn_id);
      const setClause = columns
        .map((col, idx) => `${col} = $${idx + 1}`)
        .join(", ");

      const updateQuery = `
        UPDATE ${TABLE_NAMES.DEFINE_OPERATION}
        SET ${setClause}
        WHERE opn_id = $${columns.length + 1}
        `;

      await db.query(updateQuery, [...values, row.opn_id]);
    }



    /* ================= DELETE ================= */
    for (const row of deletedRecords) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.DEFINE_OPERATION} WHERE opn_id = $1`,
        [row.opn_id]
      );
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Records processed successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getOperationDataOnQuery(req, res);
    return;
  }
  res.status(400).json({ message: "Invalid request" });
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateOperationData(req, res);
    return;
  }

  if (req?.query?.form_status === "Insert") {
    await postOperationData(req, res);
    return;
  }
});

exports.validateCommon = async (req, res) => {
  const { type, value, extra } = req.body;

  try {
    switch (type) {

      /* ================= OPERATION_NO ================= */
      case "OPERATION_NO": {
        if (!value) {
          return res.status(400).json({
            valid: false,
            message: "Operation No. can't be blank",
          });
        }

        let query = `
          SELECT 1
          FROM MOEMOPNS
          WHERE operation_no = $1
        `;
        const params = [value];

        const { rowCount } = await db.query(query, params);

        //  record found = duplicate
        if (rowCount > 0) {
          return res.status(409).json({
            valid: false,
            message: "Operation No. Already exists in Table.",
          });
        }

        // NO_DATA_FOUND equivalent
        return res.status(200).json({ valid: true });
      }
      /* ================= OPERATION_DESC ================= */
      case "OPERATION_DESC": {
        if (!value) {
          return res.status(400).json({
            valid: false,
            message: "Operation Desc. can't be blank",
          });
        }

        let query = `
          SELECT 1
          FROM MOEMOPNS
          WHERE opn_desc = $1
        `;
        const params = [value];

        const { rowCount } = await db.query(query, params);

        //  record found = duplicate
        if (rowCount > 0) {
          return res.status(409).json({
            valid: false,
            message: "Name exists in Table.",
          });
        }

        // NO_DATA_FOUND equivalent
        return res.status(200).json({ valid: true });
      }

      default:
        return res.status(400).json({
          valid: false,
          message: "Invalid validation type",
        });
    }

  } catch (error) {
    console.error("validateCommon error:", error);
    return res.status(500).json({
      valid: false,
      message: "Validation server error",
    });
  }
};
