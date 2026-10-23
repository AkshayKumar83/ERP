const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOFMAGEP: "integral.mofmagep",
};

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY debt_cred LIMIT 1 OFFSET ${req.query.offset || 0
      }`;
    let dataCount;

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.MOFMAGEP}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "ORDER BY debt_cred DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = `ORDER BY debt_cred LIMIT 1 OFFSET ${req.query.offset || 0
          }`;
        break;
    }

    const periodData = await db.query(`select * from ${TABLE_NAMES.MOFMAGEP}`);

    console.log("periodData:", periodData.rows[0]);

    const response = {
      periodData: periodData.rows,
      count: dataCount || 0,
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

exports.getValidateData = catchAsync(async (req, res) => {
  const { from_period, to_period, debt_cred } = req.query;
  console.log("from_period", from_period);

  try {
    if (from_period) {
      //console.log("from period is present");
      const result = await db.query(
        `SELECT from_period FROM ${TABLE_NAMES.MOFMAGEP} WHERE $1 BETWEEN from_period AND to_period AND debt_cred = $2`,
        [from_period, debt_cred]
      );
      //   console.log("result", result.rows);

      // Check if the st_date exists within the financial year period
      if (result?.rows?.length > 0) {
        console.log("rows exists");
        return res.status(400).json({
          error: "From Day period is a part of an already defined Range.",
        });
      }
      else {
        return res.status(200).json({ message: "This validation run successfully" })
      }
    }

    if (to_period) {
      //console.log("to period is present");

      const result2 = await db.query(
        `SELECT to_period FROM ${TABLE_NAMES.MOFMAGEP} WHERE $1 BETWEEN from_period AND to_period AND debt_cred = $2`,
        [to_period, debt_cred]
      );
      //  console.log("result2", result2.rows[0]?.to_period);

      if (result2?.rows?.length > 0) {
        return res.status(400).json({
          error: "Till Day period is a part of an already defined Range.",
        });
      }
      else {
        return res.status(200).json({ message: 'This validation run successfully' })
      }
    }
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const postPeriodData = async (req, res) => {
  try {
    const { formData, periodData } = req.body;
    // console.log("Received body:", req.body);

    const debtCred = formData.debt_cred;

    if (periodData) {
      const periodArray = Array.isArray(periodData) ? periodData : [periodData];

      // Only take records that have an 'id' field
      const filteredRecords = periodArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        console.log('before duplicate check')

        // for duplicate check 
        const result = await db.query(
          `SELECT from_period FROM ${TABLE_NAMES.MOFMAGEP} WHERE $1 BETWEEN from_period AND to_period AND debt_cred = $2`,
          [record.from_period, debtCred]
        );
        //   console.log("result", result.rows);

        // Check if the st_date exists within the financial year period
        if (result?.rows?.length > 0) {

          return res.status(400).json({
            error: "From Day period is a part of an already defined Range.",
          });
        }

        const result2 = await db.query(
          `SELECT to_period FROM ${TABLE_NAMES.MOFMAGEP} WHERE $1 BETWEEN from_period AND to_period AND debt_cred = $2`,
          [record.to_period, debtCred]
        );
        //  console.log("result2", result2.rows[0]?.to_period);

        if (result2?.rows?.length > 0) {
          return res.status(400).json({
            error: "Till Day period is a part of an already defined Range.",
          });
        }

        delete record.id;
        delete record.init_from_period;
        delete record.init_to_period;

        // Set debt_cred from formData
        record.debt_cred = debtCred;

        // Generate the insert query and values
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOFMAGEP,
          record
        );
        const valuesForInsertQuery = Object.values(record);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(`Error inserting record at index ${index}:`, error);
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

const updatePeriodDetails = async (req, res) => {

  const { formData, periodData, updateFormPayload, deletedPeriodData } =
    req.body;

  try {
    await db.query("BEGIN");

    // Update the period data
    if (Array.isArray(periodData) && periodData.length >= 1) {
      for (const [index, record] of periodData.entries()) {
        // Parse `to_period` and `from_period` as integers
        const toPeriod = parseInt(record.to_period, 10);
        const fromPeriod = parseInt(record.from_period, 10);
        // const initFromPeriod = parseInt(record.init_from_period, 10);

        const initFromPeriod = parseInt(record.init_from_period, 10);


        record.to_period = toPeriod;
        record.from_period = fromPeriod;

        const { debt_cred: recordDebtCred } = record;

        if (!record.id) {
          console.log('updating record')
          const { init_from_period, init_to_period, ...restOfRecord } = record;
          const periodDataForUpdate = cleanObject(restOfRecord);

          const columns = Object.keys(periodDataForUpdate);
          const values = Object.values(periodDataForUpdate);

          const setClause = columns
            .map((column, idx) => `${column} = $${idx + 1}`)
            .join(", ");

          const query = `
    UPDATE ${TABLE_NAMES.MOFMAGEP}
    SET ${setClause}
    WHERE debt_cred = $${columns.length + 1}
      AND from_period = $${columns.length + 2}::integer
  `;
          try {
            await db.query(query, [
              ...values,
              recordDebtCred,
              init_from_period,
            ]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw error;
          }
        } else if (record.id) {
          console.log("Inserting new record");

          // for duplicate check 
          const result = await db.query(
            `SELECT from_period FROM ${TABLE_NAMES.MOFMAGEP} WHERE $1 BETWEEN from_period AND to_period AND debt_cred = $2`,
            [record.from_period, formData.debt_cred]
          );
          //   console.log("result", result.rows);

          // Check if the st_date exists within the financial year period
          if (result?.rows?.length > 0) {

            return res.status(400).json({
              error: "From Day period is a part of an already defined Range.",
            });
          }

          const result2 = await db.query(
            `SELECT to_period FROM ${TABLE_NAMES.MOFMAGEP} WHERE $1 BETWEEN from_period AND to_period AND debt_cred = $2`,
            [record.to_period, formData.debt_cred]
          );
          //  console.log("result2", result2.rows[0]?.to_period);

          if (result2?.rows?.length > 0) {
            return res.status(400).json({
              error: "Till Day period is a part of an already defined Range.",
            });
          }

          const periodDataForInsert = cleanObject({
            ...record,
            debt_cred: formData.debt_cred,
          });

          delete periodDataForInsert.id;
          delete periodDataForInsert.init_from_period;
          delete periodDataForInsert.init_to_period;

          try {
            const queryForInsert = generateSingleInsertQuery(
              TABLE_NAMES.MOFMAGEP,
              periodDataForInsert
            );

            const valuesForInsertQuery = Object.values(periodDataForInsert);

            console.log("Insert query:", queryForInsert);
            console.log("Insert values:", valuesForInsertQuery);

            await db.query(queryForInsert, valuesForInsertQuery);
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw error;
          }
        }
      }
    }

    // Delete period data
    if (Array.isArray(deletedPeriodData) && deletedPeriodData.length > 0) {
      for (const deletedRecord of deletedPeriodData) {
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.MOFMAGEP}
          WHERE debt_cred = $1 AND from_period = $2
        `;

        try {
          console.log("Delete query:", deleteQuery);
          await db.query(deleteQuery, [
            deletedRecord.debt_cred,
            deletedRecord.from_period,
          ]);
        } catch (error) {
          console.error("Error deleting record:", error);
          throw error;
        }
      }
    } else if (deletedPeriodData) {
      const deleteQuery = `
        DELETE FROM ${TABLE_NAMES.MOFMAGEP}
        WHERE debt_cred = $1 AND from_period = $2
      `;

      try {
        console.log("Delete query:", deleteQuery);
        await db.query(deleteQuery, [
          deletedPeriodData.debt_cred,
          deletedPeriodData.from_period,
        ]);
      } catch (error) {
        console.error("Error deleting record:", error);
        throw error;
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ message: "Failed to update period details" });
  }
};



exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updatePeriodDetails(req, res);
    return;
  } else {
    await postPeriodData(req, res);
    return;
  }
});
