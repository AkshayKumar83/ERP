
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformUnitmstrToDbData } = require("./presentation");

let TABLE_NAMES = {
    UNIT_MASTER: `units`,
};

// Get unit master data
const getUnitMstrDataOnQuery = async (req, res) => {
  try {
    const getData = await db.query(`
      SELECT *, COUNT(*) OVER() AS total_count 
      FROM ${TABLE_NAMES.UNIT_MASTER}
      ORDER BY unit_id
    `);

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        unitMaster: getData.rows,
        totalCount: getData.rows[0].total_count, 
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        unitMaster: [],
        totalCount: 0,
        message: "No data found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};

// Helper: check duplicate unit in DB (for update, exclude current row)
const checkDuplicateUnitInDb = async (unit, excludeId = null) => {
  if (!unit) return false;

  let query = `SELECT 1 FROM ${TABLE_NAMES.UNIT_MASTER} WHERE UPPER(unit) = $1`;
  const params = [unit.trim().toUpperCase()];

  if (excludeId) {
    query += ` AND unit_id != $2`;
    params.push(excludeId);
  }

  const { rows } = await db.query(query, params);
  return rows.length > 0;
};

// Insert new unit records
const postUnitMstrData = async (req, res) => {
  const payload = req.body; 
 

  try {
    await db.query("BEGIN");

    const formData = payload.formData || [];

    // Get current max_id 
    const { rows } = await db.query(
      `SELECT COALESCE(MAX(unit_id),0) AS max_id FROM ${TABLE_NAMES.UNIT_MASTER}`
    );
    let nextUnitId = rows[0].max_id + 1;

    // Filter only new records
    const newRows = formData.filter((row) => row.isNew);

    // Insert loop
    for (let row of newRows) {
      const isDuplicate = await checkDuplicateUnitInDb(row.unit);
      if (isDuplicate) {
        throw new Error(`Unit "${row.unit}" already exists in database`);
      }

      const finalRow = { ...row, unit_id: nextUnitId++ };
      const unitMstr = transformUnitmstrToDbData(finalRow);
      const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.UNIT_MASTER, unitMstr);
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
    return res.status(500).json({ type: "error", message: error.message });
  }
};

// Update / Insert / Delete handling
const updateUnitMstrData = async (req, res) => {
  const payload = req.body;


  try {
    await db.query("BEGIN");

    const formData = payload.formData || [];
    const deletedRecords = payload.deletedRecords || [];

    // Get current max_id for new inserts
    const { rows } = await db.query(
      `SELECT COALESCE(MAX(unit_id), 0) AS max_id FROM ${TABLE_NAMES.UNIT_MASTER}`
    );
    let nextUnitId = rows[0].max_id + 1;

    // Handle new rows (INSERT)
    const newRows = formData.filter((row) => row.isNew);
    for (let row of newRows) {
      const isDuplicate = await checkDuplicateUnitInDb(row.unit);
      if (isDuplicate) {
        throw new Error(`Unit "${row.unit}" already exists in database`);
      }

      const finalRow = { ...row, unit_id: nextUnitId++ };
      const unitMstr = transformUnitmstrToDbData(finalRow);
      const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.UNIT_MASTER, unitMstr);
      const valuesForInsertQuery = Object.values(unitMstr);

      await db.query(queryForInsert, valuesForInsertQuery);
    }

    // Handle changed rows (UPDATE)
    const changedRows = formData.filter((row) => row.isStatus === "changed");
    for (let row of changedRows) {
      const isDuplicate = await checkDuplicateUnitInDb(row.unit, row.unit_id);
      if (isDuplicate) {
        throw new Error(`Unit "${row.unit}" already exists in database`);
      }

      const unitData = transformUnitmstrToDbData(row);
      const columns = Object.keys(unitData);
      const values = Object.values(unitData);
      const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(", ");
      const updateQuery = `UPDATE ${TABLE_NAMES.UNIT_MASTER} SET ${setClause} WHERE unit_id = ${row.unit_id}`;

      await db.query(updateQuery, values);
    }

    // Handle deleted rows (DELETE)
    for (let row of deletedRecords) {
      await db.query(`DELETE FROM ${TABLE_NAMES.UNIT_MASTER} WHERE unit_id = $1`, [
        row.unit_id,
      ]);
    }

    await db.query("COMMIT");
    return res.status(200).json({
      type: "success",
      message: "Records processed successfully",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update error:", error);
    return res.status(500).json({ type: "error", message: error.message });
  }
};

// API handlers
exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getUnitMstrDataOnQuery(req, res);
    return;
  }
  res.status(400).json({ message: "Invalid request" });
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateUnitMstrData(req, res);
    return;
  }
  if (req?.query?.form_status === "Insert") {
    await postUnitMstrData(req, res);
    return;
  }
});
