const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformUnitConvmstrToDbData } = require("./presentation");

let TABLE_NAMES = {
    UNIT_CONV_MASTER: `factors`,
};

// query logic
const getUnitConvMstrDataOnQuery = async (req, res) => {
    //  Fix condition check
    // if (req?.query?.get_data !== "Query") {
    //     return res.status(404).json({
    //         message: "Query Data cannot be provided, contact the administrator",
    //     });
    // }

    try {
        //  Combine both queries into one for better performance
        const getData = await db.query(`
            SELECT *, COUNT(*) OVER() AS total_count 
            FROM ${TABLE_NAMES.UNIT_CONV_MASTER} ORDER BY FROM_ID, TO_ID
        `);

        if (getData.rowCount > 0) {
            return res.status(200).json({
                type: "found",
                unitConvMaster: getData.rows,
                count: getData.rows[0].total_count, //  Include count in response
            });
        } else {
            return res.status(200).json({
                type: "not found",
                message: "No data Record found",
                unitConvMaster: [],
                count: 0, //  Return count as 0 if no data
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error on query" });
    }
};

// dropDownData
exports.getBaseConstants = catchAsync(async(req,res, next)=>{

  const getFromUnit = await db.query(
   `select unit, unit_id from units`
  )
  const getToUnit = await db.query(
    `select unit,unit_id from units`
  )
  return res.status(200).json({
    fromUnitList : getFromUnit.rows,
    toUnitList : getToUnit.rows,
  });

})


const insertUnitConvMstr = async (req, res) => {
    const { newRows = [] } = req.body;


    try {
        await db.query('BEGIN'); 

        for (let row of newRows) {
            const unitData = transformUnitConvmstrToDbData(row);
            const unitDataInsertQuery = generateSingleInsertQuery(TABLE_NAMES.UNIT_CONV_MASTER, unitData);
            const unitDataValForInsertQuery = Object.values(unitData);


            await db.query(unitDataInsertQuery, unitDataValForInsertQuery);
        }

        await db.query('COMMIT'); 

        return res.status(200).json({
            type: 'success',
            message: 'Inserted successfully'
        });
    } catch (error) {
        console.error("Database Error:", error);
        await db.query("ROLLBACK"); 

        return res.status(400).json({
            type: 'error',
            message: error.message || "Some Error Occurred"
        });
    }
}


const updateUnitConvMstr = async (req, res) => {
  const { newRows = [], updatedRows = [], deletedRows = [] } = req.body;


  try {
    await db.query('BEGIN');

    // Insert New Rows
    for (let row of newRows) {
      const unitData = transformUnitConvmstrToDbData(row);
      const unitDataInsertQuery = generateSingleInsertQuery(TABLE_NAMES.UNIT_CONV_MASTER, unitData);
      const unitDataValForInsertQuery = Object.values(unitData);

   

      await db.query(unitDataInsertQuery, unitDataValForInsertQuery);
    }

    // Update Existing Rows
    for (let row of updatedRows) {
      if (!row.old_from_id || !row.old_to_id) {
        console.error("Missing old_from_id or old_to_id:", row);
        continue; // Skip invalid rows
      }

      const unitData = transformUnitConvmstrToDbData(row);
      const columns = Object.keys(unitData);
      const values = Object.values(unitData);

      const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');

      const updateQuery = `
        UPDATE ${TABLE_NAMES.UNIT_CONV_MASTER}
        SET ${setClause}
        WHERE from_id = $${columns.length + 1} AND to_id = $${columns.length + 2}
      `;

 

      await db.query(updateQuery, [...values, row.old_from_id, row.old_to_id]);
    }

    // Delete Rows
    for (let row of deletedRows) {
      if (!row.old_from_id || !row.old_to_id) {
        console.error("Missing old_from_id or old_to_id for deletion:", row);
        continue; // Skip invalid rows
      }

      const deleteQuery = `
        DELETE FROM ${TABLE_NAMES.UNIT_CONV_MASTER}
        WHERE from_id = $1 AND to_id = $2
      `;
   
      
      await db.query(deleteQuery, [row.old_from_id, row.old_to_id]);
    }

    await db.query('COMMIT');

    return res.status(200).json({
      type: 'success',
      message: 'Updated successfully'
    });
  } catch (error) {
    console.error("Database Error:", error);
    await db.query("ROLLBACK");

    return res.status(400).json({
      type: 'error',
      message: error.message || "Some Error Occurred"
    });
  }
};

const checkDuplicateFromToId = async (req, res) => {
    try {
        const { from_id, to_id } = req.query;

        // Convert to integers and validate
        const fromId = parseInt(from_id, 10);
        const toId = parseInt(to_id, 10);

        if (isNaN(fromId) || isNaN(toId)) {
            return res.status(400).json({
                type: "error",
                message: "Invalid from_id or to_id",
            });
        }

        const findDuplicateRow = `
            SELECT from_id, to_id 
            FROM factors
            WHERE from_id = $1 AND to_id = $2
        `;
        const result = await db.query(findDuplicateRow, [fromId, toId]);

        return res.status(200).json({
            type: "success",
            exists: result.rowCount > 0,
        });
    } catch (error) {
        console.error("Error in checkDuplicateFromToId:", error);
        return res.status(500).json({
            type: "error",
            message: error.message || "Internal server error while checking duplicate",
        });
    }
};

exports.checkDuplicate = catchAsync(async (req, res, next) => {
    await checkDuplicateFromToId(req, res);
});


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (req?.query?.get_data) {
        await getUnitConvMstrDataOnQuery(req, res);
        return;
    }
    res.status(400).json({ message: "Invalid request" });
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateUnitConvMstr(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await insertUnitConvMstr(req, res);
        return;
    }
});

