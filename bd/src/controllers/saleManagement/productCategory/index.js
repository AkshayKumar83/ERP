const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../utility/query");

const TABLE_NAMES = {
  MOSMMAINCAT: "mosmmaincat",
  MOSMSUBCAT: "mosmsubcat",
};

const getDataOnQuery = async (req, res) => {
  console.log("this start");

  try {
    let queryParameter = `OFFSET ${req.query.offset || 0}`;
    console.log("query:", req?.query);
    console.log("Offset value:", req.query.offset);

    let dataCount;

    switch (req?.query?.get_data) {
      case "Query":

      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.MOSMMAINCAT}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      default:
        queryParameter = ` OFFSET ${req.query.offset || 0}`;
        break;
    }

    const mainCatData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOSMMAINCAT} order by main_cat_id`
    );

    const subCatData = await db.query(
      `select * from ${TABLE_NAMES.MOSMSUBCAT}`
    );

    const responseData = {
      mainCatData: mainCatData.rows,
      count: dataCount || 0,
      subCatData: subCatData.rows,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");

  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});

const postProductDetails = async (req, res) => {
  try {
    await db.query("BEGIN");
    const { formData, formDetailData } = req.body;
    console.log("req body:", req.body);

    const formDataArray = Array.isArray(formData) ? formData : [formData];
    const formDtlDataArray = Array.isArray(formDetailData)
      ? formDetailData
      : [formDetailData];

    const insertedMainCatIds = [];

    // Filter records that have an id for insertion
    const insertableFormRecords = formDataArray.filter((record) => record.id);

    // Insert formData (main category data)
    for (const [index, record] of insertableFormRecords.entries()) {
      // Generate new main_cat_id from sequence
      const mainIdResult = await db.query(`SELECT nextval('s_mosmmaincat_id')`);
      const main_cat_id = mainIdResult.rows[0].nextval;

      // Assign generated ID to record
      record.main_cat_id = main_cat_id;
      insertedMainCatIds.push(main_cat_id);

      delete record.id; // Optional: remove id if not needed for insert

      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.MOSMMAINCAT,
        record
      );
      const insertValues = Object.values(record);

      try {
        await db.query(insertQuery, insertValues);
      } catch (error) {
        console.error(
          `Error inserting main_cat record at index ${index}:`,
          error
        );
        throw new Error(`Main insert error at index ${index}`);
      }
    }

    // Check if any main_cat_id is already present in formDtlDataArray
    const isMainCatIdPresent = formDtlDataArray.some((r) => r.main_cat_id);

    // Extract common main_cat_id if available in any record
    const commonMainCatId =
      formDtlDataArray.find((r) => r.main_cat_id)?.main_cat_id || null;

    // Filter detail records that have an id for insertion
    const insertableFormDtlRecords = formDtlDataArray.filter(
      (record) => record.id
    );

    // Loop over each detail record
    for (const [index, record] of insertableFormDtlRecords.entries()) {
      const subIdResult = await db.query(`SELECT nextval('s_mosmsubcat_id')`);
      const sub_cat_id = subIdResult.rows[0].nextval;
      record.sub_cat_id = sub_cat_id;

      // Case 1: Use record.main_cat_id if present
      // Case 2: Use commonMainCatId if any main_cat_id existed in formDtlDataArray
      // Case 3: Fallback to last inserted main_cat_id from formData
      if (!record.main_cat_id) {
        if (isMainCatIdPresent) {
          record.main_cat_id = commonMainCatId;
        } else {
          // fallback to last inserted one from formData
          record.main_cat_id =
            insertedMainCatIds[insertedMainCatIds.length - 1];
        }
      }

      delete record.id;
      delete record.isNew;
      delete record.isModified;

      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.MOSMSUBCAT,
        record
      );
      const insertValues = Object.values(record);

      try {
        await db.query(insertQuery, insertValues);
        console.log(insertQuery, insertValues);
      } catch (error) {
        console.error(
          `Error inserting sub_cat record at index ${index}:`,
          error
        );
        throw new Error(`Sub insert error at index ${index}`);
      }
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "success", insertedMainCatIds });
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query("ROLLBACK");
    return res.status(400).send("Some error occurred");
  }
};

const updateProductDetails = async (req, res) => {
  const { formData, formDetailData, deletedFormData, deletedFormDetailData } =
    req.body;
  console.log("req.body", req.body);
  try {
    await db.query("BEGIN");

    if (Array.isArray(formData) && formData.length >= 1) {
      const insertedMainCatIds = [];

      for (const [index, record] of formData.entries()) {
        if (record.id) {
          // INSERT case: generate new main_cat_id
          const mainIdResult = await db.query(
            `SELECT nextval('s_mosmmaincat_id')`
          );
          const main_cat_id = mainIdResult.rows[0].nextval;
          record.main_cat_id = main_cat_id;
          insertedMainCatIds.push(main_cat_id);
        }

        const cleanedRecord = cleanObject(record);
        const values = Object.values(cleanedRecord);

        if (!record.main_cat_id) {
          console.error(
            `Skipping record at index ${index} due to missing main_cat_id`
          );
          continue;
        }

        if (record.id) {
          // ✅ INSERT if record has ID
          delete cleanedRecord.id;
          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MOSMMAINCAT,
            cleanedRecord
          );
          try {
            await db.query(insertQuery, Object.values(cleanedRecord));
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(`Insert error at index ${index}`);
          }
        } else {
          // ✅ UPDATE if no ID (use existing main_cat_id)
          const { main_cat_id, ...updateRecord } = cleanedRecord;

          const updateColumns = Object.keys(updateRecord);
          const updateValues = Object.values(updateRecord);

          const setClause = updateColumns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
        UPDATE ${TABLE_NAMES.MOSMMAINCAT}
        SET ${setClause}
        WHERE main_cat_id = $${updateColumns.length + 1}
      `;

          try {
            await db.query(updateQuery, [...updateValues, main_cat_id]);
            console.log("updated successfully", updateQuery, updateValues);
            console.log(`[${record.id ? "INSERT" : "UPDATE"}] Record:`, record);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(`Update error at index ${index}`);
          }
        }
      }
    }

    // for formDetail

    if (Array.isArray(formDetailData) && formDetailData.length >= 1) {
      const insertedSubCatIds = [];

      for (const [index, record] of formDetailData.entries()) {
        if (record.id) {
          // INSERT case: generate new sub_cat_id
          const subIdResult = await db.query(
            `SELECT nextval('s_mosmsubcat_id')`
          );
          const sub_cat_id = subIdResult.rows[0].nextval;
          record.sub_cat_id = sub_cat_id;
          insertedSubCatIds.push(sub_cat_id);

          // Handle main_cat_id assignment priority:
          // 1. Use record.main_cat_id if present
          // 2. Fallback to commonMainCatId from existing formDetailData
          // 3. Fallback to last inserted main_cat_id from formData
          if (!record.main_cat_id) {
            if (commonMainCatId) {
              record.main_cat_id = commonMainCatId;
            } else if (insertedMainCatIds.length > 0) {
              record.main_cat_id =
                insertedMainCatIds[insertedMainCatIds.length - 1];
            } else {
              console.warn(
                `No main_cat_id found for detail record at index ${index}`
              );
            }
          }
        }

        const cleanedRecord = cleanObject(record);

        if (!record.sub_cat_id) {
          console.error(
            `Skipping record at index ${index} due to missing sub_cat_id`
          );
          continue;
        }

        if (record.id) {
          console.log("inserted record", cleanedRecord);
          // ✅ INSERT if record has ID
          delete cleanedRecord.id;
          delete cleanedRecord.isNew;
          delete cleanedRecord.isModified;

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MOSMSUBCAT,
            cleanedRecord
          );
          try {
            await db.query(insertQuery, Object.values(cleanedRecord));
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(`Insert error at index ${index}`);
          }
        } else {
          delete cleanedRecord.isModified;
          // ✅ UPDATE if no ID (based on sub_cat_id)
          const updateRecord = { ...cleanedRecord };
          const updateColumns = Object.keys(updateRecord);
          const updateValues = Object.values(updateRecord);

          const setClause = updateColumns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
        UPDATE ${TABLE_NAMES.MOSMSUBCAT}
        SET ${setClause}
        WHERE sub_cat_id = $${updateColumns.length + 1}
      `;

          try {
            await db.query(updateQuery, [...updateValues, record.sub_cat_id]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(`Update error at index ${index}`);
          }
        }
      }
    }

    // for delete formDetailData record
    if (Array.isArray(deletedFormDetailData) && deletedFormDetailData.length) {
      for (const deletedRecord of deletedFormDetailData) {
        const { main_cat_id, sub_cat_id } = deletedRecord;

        try {
          const deleteQuery = `
        DELETE FROM ${TABLE_NAMES.MOSMSUBCAT}
        WHERE main_cat_id = $1 and sub_cat_id = $2
      `;
          await db.query(deleteQuery, [main_cat_id, sub_cat_id]);
        } catch (error) {
          console.error("Error during deletion:", error.message);
          return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during deletion.",
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Record(s) deleted successfully",
      });
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Transaction failed:", error);
    await db.query("ROLLBACK");
    return res
      .status(500)
      .send({ message: "Failed to update invoice details" });
  }
};

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateProductDetails(req, res);
    return;
  } else {
    await postProductDetails(req, res);
    return;
  }
});
