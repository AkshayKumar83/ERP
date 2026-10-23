
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");

let TABLE_NAMES = {
    STD_REM: `MOMMREMARKS`,
};


const getStdRemDataOnQuery = async (req, res) => {
  try {

    // 🔹 Get main record
    const getData = await db.query(`SELECT * FROM ${TABLE_NAMES.STD_REM} order by remark_desc`);

    
    if (getData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No data found",
        stdRemark: [],
        totalCount: 0,
      });
    }
    return res.status(200).json({
      type: "found",
      stdRemark: getData.rows,
      totalCount: getData.rowCount,
    });
  } catch (error) {
    console.error("Error in getStdRemDataOnQuery:", error);
    return res.status(500).json({ message: "Internal server error on query" });
  }

};
 
exports.handlePostFormData = catchAsync(async (req, res, next) => {
    console.log("Incoming data:", req.body);
    const { newRecord } = req.body;
  
    try {
      await db.query("BEGIN");
  
      if (!newRecord?.length) {
        return res.status(400).json({ type: "error", message: "No new data found for submit" });
      }
  
      for (let index = 0; index < newRecord.length; index++) {
        let record = newRecord[index];

        const getRemarkId = await db.query(`SELECT nextval('integral.SEQ_MOMMREMARKS_REMARK_ID')`);
        record.remark_id = getRemarkId.rows[0].nextval;

      const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.STD_REM, record);
      const valuesForInsertQuery = Object.values(record);

      await db.query(queryForInsert, valuesForInsertQuery);
      }
  
      await db.query("COMMIT");
  

      return res.status(200).json({
        type: "success",
        message: `Insert records saved successfully`,
      });
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Inserting failed:", error.message);
      return res.status(500).json({ type: "error", message: error.message || "Internal Server Error" });
    }
  });


 
exports.handleUpdateFormData = catchAsync(async (req, res, next) => {
  const { updatedRecord = [], deletedRecord = [], newRecord = [] } = req.body;

  try {
    await db.query("BEGIN");

     if (
      (!newRecord || newRecord.length === 0) &&
      (!updatedRecord || updatedRecord.length === 0) &&
      (!deletedRecord || deletedRecord.length === 0)
    ) {
      return res.status(400).json({
        type: "error",
        message: "No insert / update / delete data found for submit",
      });
    }

    // Handle Insert
    if (newRecord.length > 0) {
      for (let index = 0; index < newRecord.length; index++) {
        let record = newRecord[index];

        const getRemarkId = await db.query(`SELECT nextval('integral.SEQ_MOMMREMARKS_REMARK_ID')`);
        record.remark_id = getRemarkId.rows[0].nextval;

        const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.STD_REM, record);
        const valuesForInsertQuery = Object.values(record);

        await db.query(queryForInsert, valuesForInsertQuery);
      }
    }

    // Handle Update
    if (updatedRecord.length > 0) {
      for (let record of updatedRecord) {
        const { remark_id, ...fieldsToUpdate } = record;

        const columns = Object.keys(fieldsToUpdate);
        const values = Object.values(fieldsToUpdate);

        const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
        
        await db.query(
          `UPDATE ${TABLE_NAMES.STD_REM} SET ${setClause} WHERE remark_id = $${columns.length + 1}`,
          [...values, remark_id]
        );
      }
    }

    // Handle Deletions
    if (deletedRecord.length > 0) {
      const idsToDelete = deletedRecord.map((rec) => rec.remark_id);
      await db.query(
        `DELETE FROM ${TABLE_NAMES.STD_REM} WHERE remark_id = ANY($1::int[])`,
        [idsToDelete]
      );
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: `records saved successfully`,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update/Delete failed:", error.message);
    return res.status(500).json({ type: "error", message: error.message || "Internal Server error"  });
  }
});


  
exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
        await getStdRemDataOnQuery(req, res);
        return;
    }
});