const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  cleanObject,
  generateInsertQuery,
  generateSingleInsertQuery,
} = require("../../../../utility/query");

const { dateFormater } = require("../../../../utility/constant");

const TABLE_NAMES = {
  FINYEAR_TABLE: "integral.moitfinyear",
  MODULE_TABLE: "integral.moitmodule",
  TRAN_TABLE: "integral.moittranperiod",
};

const getDataOnQuery = async (req, res) => {
  console.log("this start");

  try {
    let queryParameter = ` OFFSET ${req.query.offset || 0}`;
    console.log("query:", req?.query);
    console.log("Offset value:", req.query.offset);

    let dataCount;

    switch (req?.query?.get_data) {
      case "Query":

      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.FINYEAR_TABLE}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      default:
        queryParameter = ` OFFSET ${req.query.offset || 0}`;
        break;
    }

    const financeData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.FINYEAR_TABLE} order by year_code`
    );

    console.log("finance data:", financeData.rows[0]);



    const moduleData = await db.query(
      `SELECT * FROM  ${TABLE_NAMES.MODULE_TABLE} order by trans_id`
    );
    const tranData = await db.query(`SELECT * FROM  ${TABLE_NAMES.TRAN_TABLE}`);

    const formattedRows = financeData.rows.map((row) => ({
      ...row,
      st_date: dateFormater(row.st_date),
      end_date: dateFormater(row.end_date),
    }));

    const formattedRows2 = tranData.rows.map((row) => ({
      ...row,
      period_start: dateFormater(row.period_start),
      period_end: dateFormater(row.period_end),
    }));

    const responseData = {
      financeData: formattedRows,
      moduleData: moduleData.rows,
      tranData: formattedRows2,
      count: dataCount || 0,
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getFormData = async (req, res, fields) => {
  const { st_date, end_date, period_start, period_end } = fields;
  console.log("Initial st_date before any queries:", st_date); // More descriptive logging

  try {
    const dPeriod_start = st_date;

    console.log("dperiod_start:", dPeriod_start);

    if (st_date) {
      console.log("st_date after query:", st_date);

      result = await db.query(
        `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
         WHERE $1 BETWEEN st_date AND end_date`,
        [st_date]
      );

      // Check if the st_date exists within the financial year period
      if (result?.rows?.length > 0) {
        return res.status(200).json({ error: "RANGE ALREADY EXISTS" });
      }
    }

    if (end_date) {
      console.log("st_date at end_date:", dPeriod_start);

      if (!dPeriod_start) {
        // This condition is triggering the error

        return res
          .status(400)
          .json({ error: "Start date is required for validation." });
      }

      // Calculate the end date based on the provided start date
      const dEnd_dt = new Date(dPeriod_start);
      dEnd_dt.setFullYear(dEnd_dt.getFullYear() + 1);
      dEnd_dt.setDate(dEnd_dt.getDate() - 1);

      // Check if the end date is within one year of the start date
      if (new Date(end_date) > dEnd_dt) {
        return res.status(200).json({
          error: `End date cannot be greater than ${dEnd_dt.toISOString().split("T")[0]
            }`,
        });
      }

      // Check if the end_date is between st_date and dEnd_dt
      if (
        new Date(end_date) >= new Date(dPeriod_start) &&
        new Date(end_date) <= dEnd_dt
      ) {
        return res.status(200).json({ error: "Range already exists" });
      }
    }
    if (period_start) {
      const periodstfinance = await db.query(
        `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
         WHERE $1 BETWEEN st_date AND end_date`,
        [period_start]
      );

      const periodstfinanceRows = periodstfinance?.rows[0];
      console.log("periodstfinanceRows:", periodstfinanceRows);

      // If no financial year periods are found, return an error response
      if (!periodstfinance || periodstfinance.rows.length === 0) {
        return res
          .status(200)
          .json({ error: "Date is not between any financial year" });
      }

      // Query to check if the period_start overlaps with any existing transaction periods
      const periodstResult = await db.query(
        "SELECT period_start, period_end FROM integral.moittranperiod WHERE $1 BETWEEN period_start AND period_end",
        [period_start]
      );

      const periodstRows = periodstResult?.rows[0];
      console.log("periodstRows:", periodstRows);

      // If overlapping periods are found, return an error response
      if (periodstResult.rows.length > 0) {
        console.log("existing rows found");
        return res.status(200).json({ error: "Range already exists" });
      }
    }

    if (period_end) {
      const periodendfinance = await db.query(
        `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
         WHERE $1 BETWEEN st_date AND end_date`,
        [period_end]
      );

      const periodendfinanceRows = periodendfinance?.rows[0];
      console.log("periodendfinance:", periodendfinanceRows);

      // If no financial year periods found, return an error response
      if (!periodendfinance || periodendfinance.rows.length === 0) {
        return res
          .status(200)
          .json({ error: "Date is not between any financial year" });
      }

      // Query to check if the period_start overlaps with any existing transaction periods
      const periodendResult = await db.query(
        "SELECT period_start, period_end FROM integral.moittranperiod WHERE $1 BETWEEN period_start AND period_end",
        [period_end]
      );

      const periodendRows = periodendResult?.rows[0];
      console.log("periodendRows:", periodendRows);

      // If no rows are found, it means period_end doesn't overlap with any existing transaction periods
      if (periodendResult.rows.length > 0) {
        return res.status(200).json({ error: "Range already exists" });
      }
    }
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const postFinanceDetails = async (req, res) => {
  try {
    await db.query("BEGIN")
    const { financeData } = req.body;

    //console.log("req body:", req.body);

    if (financeData) {
      const financeArray = Array.isArray(financeData) ? financeData : [financeData];

      // Only take records that have an 'id' field
      const filteredRecords = financeArray.filter((record) => record.id);
      for (const [index, record] of filteredRecords.entries()) {

        // for duplicate check
        const result = await db.query(
          `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
         WHERE $1 BETWEEN st_date AND end_date`,
          [record.st_date]
        );

        // Check if the st_date exists within the financial year period
        if (result?.rows?.length > 0) {
          return res.status(400).json({ error: "RANGE ALREADY EXISTS" });
        }


        // Calculate the end date based on the provided start date
        const dEnd_dt = new Date(record.st_date);
        dEnd_dt.setFullYear(dEnd_dt.getFullYear() + 1);
        dEnd_dt.setDate(dEnd_dt.getDate() - 1);

        // Check if the end date is within one year of the start date
        if (new Date(record.end_date) > dEnd_dt) {
          return res.status(400).json({
            error: `End date cannot be greater than ${dEnd_dt.toISOString().split("T")[0]
              }`,
          });
        }


        delete record.id;
        delete record.row_id;

        // Extract year from st_date safely
        const stDate = record.st_date ? new Date(record.st_date) : null;
        record.year_code = stDate ? stDate.getFullYear() : null;

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.FINYEAR_TABLE,
          record
        );
        const valuesForInsertQuery = Object.values(record);

        console.log(`Finance valuesForInsertQuery [index ${index}]:`, valuesForInsertQuery);
        console.log(`Generated SQL Query at finance [index ${index}]:`, queryForInsert);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(`Error inserting finance record at index ${index}:`, error);
          throw new Error(`Finance insert error at index ${index}: ${error.message}`);
        }
      }
    }



    await db.query("COMMIT");
    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    //await db.query("ROLLBACK"); // Rollback transaction in case of an error
    res.status(500).json({ error: error.message });
  }
};

// const postFinanceDetails = async (req, res) => {
//   try {
//     await db.query("BEGIN");

//     const { financeData } = req.body;

//     if (financeData) {
//       const financeArray = Array.isArray(financeData)
//         ? financeData
//         : [financeData];

//       const filteredRecords = financeArray.filter((record) => record.id);

//       for (const [index, record] of filteredRecords.entries()) {

//         // Duplicate range check
//         const result = await db.query(
//           `SELECT 1 FROM ${TABLE_NAMES.FINYEAR_TABLE}
//            WHERE ($1 BETWEEN st_date AND end_date
//            OR $2 BETWEEN st_date AND end_date)`,
//           [record.st_date, record.end_date]
//         );

//         if (result.rows.length > 0) {

//           return res.status(400).json({
//             error: `Range already exists.`,
//           });
//         }

//         // Calculate max allowed end date
//         const dEnd_dt = new Date(record.st_date);
//         dEnd_dt.setFullYear(dEnd_dt.getFullYear() + 1);
//         dEnd_dt.setDate(dEnd_dt.getDate() - 1);

//         if (new Date(record.end_date) > dEnd_dt) {

//           return res.status(400).json({
//             error: `End date cannot be greater than ${
//               dEnd_dt.toISOString().split("T")[0]
//             }`,
//           });
//         }

//         //  Prepare data
//         delete record.id;
//         delete record.row_id;

//         const stDate = record.st_date ? new Date(record.st_date) : null;
//         record.year_code = stDate ? stDate.getFullYear() : null;

//         const queryForInsert = generateSingleInsertQuery(
//           TABLE_NAMES.FINYEAR_TABLE,
//           record
//         );

//         const valuesForInsertQuery = Object.values(record);

//         console.log(`Finance index ${index}:`, valuesForInsertQuery);

//         await db.query(queryForInsert, valuesForInsertQuery);
//       }
//     }

//     await db.query("COMMIT");

//     return res.status(200).json({
//       message: "Records inserted successfully",
//     });

//   } catch (error) {
//     console.error("Transaction error:", error);
//     await db.query("ROLLBACK");

//     return res.status(500).json({
//       error: error.message,
//     });
//   }
// }; 


const updateFinanceDetails = async (req, res) => {
  // console.log("for update:", req.body);
  const {
    financeData,
    // tranData,
    // deletedTranData,
    deletedFinData,
    updatedCurrentYearData,
  } = req.body;

  //console.log("deletedtrandata:", deletedTranData);
  console.log("deletedFinData:", deletedFinData);
  //console.log("trandata:", tranData);

  try {
    await db.query("BEGIN");

    if (financeData && financeData.length > 0) {
      for (const record of financeData) {

        const { row_id, year_code, id } = record; // Destructure year_code from the record

        // Insert records that have an 'id'
        if (row_id && id) {   

          // for duplicate check  

           const result = await db.query(
          `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
         WHERE $1 BETWEEN st_date AND end_date`,
          [record.st_date]
        );

        // Check if the st_date exists within the financial year period
        if (result?.rows?.length > 0) {
          return res.status(400).json({ error: "RANGE ALREADY EXISTS" });
        }

         // Calculate the end date based on the provided start date
        const dEnd_dt = new Date(record.st_date);
        dEnd_dt.setFullYear(dEnd_dt.getFullYear() + 1);
        dEnd_dt.setDate(dEnd_dt.getDate() - 1);

        // Check if the end date is within one year of the start date
        if (new Date(record.end_date) > dEnd_dt) {
          return res.status(400).json({
            error: `End date cannot be greater than ${dEnd_dt.toISOString().split("T")[0]
              }`,
          });
        } 
          console.log("Inserting record with id:", row_id);

          // Clean the record object and delete the id field
          const financeDataForInsert = cleanObject({ ...record });
          delete financeDataForInsert.row_id; // Remove id before inserting
          delete financeDataForInsert.id; // Ensure 'id' is also removed

          // Extract year_code from st_date only for insert operation
          const stDate = new Date(record.st_date);
          const yearCode = stDate.getFullYear();
          financeDataForInsert.year_code = yearCode; // Add year_code to insert data

          // Prepare the query to insert the record
          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.FINYEAR_TABLE,
            financeDataForInsert
          );
          const valuesForInsertQuery = Object.values(financeDataForInsert);

          console.log("Insert Query:", insertQuery);
          console.log("Insert Values:", valuesForInsertQuery);

          // Execute the insert query
          await db.query(insertQuery, [...valuesForInsertQuery]);
        
        }  

        else {

        // Update records that do not have an 'id'
        const financeDataForUpdate = cleanObject({ ...record });

        const columns = Object.keys(financeDataForUpdate);
        const values = Object.values(financeDataForUpdate);

        const setClause = columns
          .map((column, index) => `${column} = $${index + 1}`)
          .join(", ");
        const updateQuery = `UPDATE ${TABLE_NAMES.FINYEAR_TABLE}
                             SET ${setClause}
                             WHERE year_code = $${columns.length + 1}`;

        console.log("Updating record with year_code:", year_code);

        await db.query(updateQuery, [...values, year_code]); 
        }
      }
    }

    // delete finyear data

       if (Array.isArray(deletedFinData) && deletedFinData.length > 0) {
         for (const deletedRecord of deletedFinData) {
           const deleteQuery = `
             DELETE FROM ${TABLE_NAMES.FINYEAR_TABLE}
             WHERE year_code = $1
           `;
   
           try {
             console.log("Delete query:", deleteQuery);
             await db.query(deleteQuery, [
               deletedRecord.year_code,
              
             ]);
           } catch (error) {
             console.error("Error deleting record:", error);
             throw error;
           }
         }
       } else if (deletedFinData) {
         const deleteQuery = `
           DELETE FROM ${TABLE_NAMES.FINYEAR_TABLE}
           WHERE year_code = $1
         `;
   
         try {
           console.log("Delete query:", deleteQuery);
           await db.query(deleteQuery, [
             deletedFinData.year_code,
             
           ]);
         } catch (error) {
           console.error("Error deleting record:", error);
           throw error;
         }
       }
   

    if (updatedCurrentYearData) {
      console.log("updatedCurrentYearData", updatedCurrentYearData);

      const result = await db.query(
        `SELECT * FROM integral.moitfinyear WHERE flag = 'C'`
      );

      if (result.rows.length > 0) {
        // Step 2: Update the existing record's flag to 'N'
        await db.query(
          `UPDATE integral.moitfinyear SET flag = 'N' WHERE flag = 'C'`
        );
        console.log("Record updated successfully.");
      } else {
        console.log("No record found with flag = 'C'.");
      }

      // Step 3: Update current year data with updatedCurrentYearData
      const updateColumns = Object.keys(updatedCurrentYearData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

      const updateValues = Object.values(updatedCurrentYearData);

      const updateQuery = `
        UPDATE integral.moitfinyear 
        SET ${updateColumns} 
        WHERE year_code = $${updateValues.length + 1}`;

      await db.query(updateQuery, [
        ...updateValues,
        updatedCurrentYearData.year_code,
      ]);

      console.log("Current year data updated successfully.");
    }

    // Commit transaction if everything was successful
    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error("Error during update:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updateCurrentYearDetails = async (req, res) => {
  const { financeData } = req.body;
  console.log("financeData at the current year:", financeData);

  try {
    await db.query("BEGIN");

    // Now check if there's any record with flag = 'C' and update it to 'N'
    const updatedFlagQuery = `UPDATE integral.moitfinyear SET flag = 'N' WHERE flag = 'C'`;
    console.log(
      "Updating record with already present c year_code:",
      updatedFlagQuery
    );
    //await db.query(updatedFlagQuery);

    for (const record of financeData) {
      const { year_code, flag } = record;

      // Check if the record with the specified year_code and flag = 'N' exists
      const checkedFlagQuery = `SELECT * FROM integral.moitfinyear WHERE year_code = $1 AND flag = 'N'`;
      const checkedFlagResult = await db.query(checkedFlagQuery, [year_code]);

      if (checkedFlagResult.rows.length > 0) {
        console.log("not already flag c");
        // If the record exists with flag = 'N', prepare to update it
        const financeDataForUpdate = cleanObject({ ...record });
        const columns = Object.keys(financeDataForUpdate);
        const values = Object.values(financeDataForUpdate);

        console.log("columns:", columns);
        console.log("values:", values);

        // Construct the update query
        const setClause = columns
          .map((column, index) => `${column} = $${index + 1}`)
          .join(", ");

        const updateQuery = `UPDATE ${TABLE_NAMES.FINYEAR_TABLE}
                             SET ${setClause}
                             WHERE year_code = $${columns.length + 1}`;

        console.log("Updating record with year_code:", updateQuery);
        await db.query(updateQuery, [...values, year_code]);
      }
    }

    // Commit transaction if everything was successful
    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error("Error during update:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({ error: "Internal server error" });
  }
};

exports.handleCurrentYearData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateCurrentYearDetails(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateFinanceDetails(req, res);
    return;
  } else {
    await postFinanceDetails(req, res);
    return;
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.getValidateData = catchAsync(async (req, res) => {
  const { st_date, end_date } = req.query;

  // if (req?.query?.formStatus === "Insert" || req?.query?.formStatus === "Update") {

  try {
    if (st_date) {
      console.log("st_date after query:", st_date);

      result = await db.query(
        `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
         WHERE $1 BETWEEN st_date AND end_date`,
        [st_date]
      );

      // Check if the st_date exists within the financial year period
      if (result?.rows?.length > 0) {
        return res.status(400).json({ error: "RANGE ALREADY EXISTS" });
      }
      else {
        return res.status(200).json({ message: 'This validation run successfully' })
      }
    }

    if (end_date) {
      // console.log("end daste is end_date")
      const dPeriod_start = st_date;
      console.log('dperiod_start', dPeriod_start)

      // console.log("dperiod_start:", dPeriod_start);

      // console.log("st_date at end_date:", st_date);

      if (!dPeriod_start) {
        // This condition is triggering the error

        return res
          .status(400)
          .json({ error: "Start date is required for validation." });
      }

      // Calculate the end date based on the provided start date
      const dEnd_dt = new Date(dPeriod_start);
      dEnd_dt.setFullYear(dEnd_dt.getFullYear() + 1);
      dEnd_dt.setDate(dEnd_dt.getDate() - 1);

      // Check if the end date is within one year of the start date
      if (new Date(end_date) > dEnd_dt) {
        return res.status(400).json({
          error: `End date cannot be greater than ${dEnd_dt.toISOString().split("T")[0]
            }`,
        });
      }

      // Query existing financial year ranges from the database
      const result = await db.query(
        `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
       WHERE $1 BETWEEN st_date AND end_date`,
        [end_date]
      );

      // Check if the end_date exists within an existing financial year period
      if (result?.rows?.length > 0) {
        return res.status(400).json({ error: "RANGE ALREADY EXISTS" });
      }
      else {
        res.status(200).json({ message: "This validation run successfully!" })
      }
    }
    // if (period_start) {
    //   const periodstfinance = await db.query(
    //     `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
    //      WHERE $1 BETWEEN st_date AND end_date`,
    //     [period_start]
    //   );

    //   const periodstfinanceRows = periodstfinance?.rows[0];
    //   console.log("periodstfinanceRows:", periodstfinanceRows);

    //   // If no financial year periods are found, return an error response
    //   if (!periodstfinance || periodstfinance.rows.length === 0) {
    //     return res
    //       .status(200)
    //       .json({ error: "Date is not between any financial year" });
    //   }

    //   // Query to check if the period_start overlaps with any existing transaction periods
    //   const periodstResult = await db.query(
    //     "SELECT period_start, period_end FROM integral.moittranperiod WHERE $1 BETWEEN period_start AND period_end",
    //     [period_start]
    //   );

    //   const periodstRows = periodstResult?.rows[0];
    //   console.log("periodstRows:", periodstRows);

    //   // If overlapping periods are found, return an error response
    //   if (periodstResult.rows.length > 0) {
    //     console.log("existing rows found");
    //     return res.status(200).json({ error: "Range already exists" });
    //   }
    // }

    // if (period_end) {
    //   const periodendfinance = await db.query(
    //     `SELECT st_date, end_date FROM ${TABLE_NAMES.FINYEAR_TABLE} 
    //      WHERE $1 BETWEEN st_date AND end_date`,
    //     [period_end]
    //   );

    //   const periodendfinanceRows = periodendfinance?.rows[0];
    //   console.log("periodendfinance:", periodendfinanceRows);

    //   // If no financial year periods found, return an error response
    //   if (!periodendfinance || periodendfinance.rows.length === 0) {
    //     return res
    //       .status(200)
    //       .json({ error: "Date is not between any financial year" });
    //   }

    //   // Query to check if the period_start overlaps with any existing transaction periods
    //   const periodendResult = await db.query(
    //     "SELECT period_start, period_end FROM integral.moittranperiod WHERE $1 BETWEEN period_start AND period_end",
    //     [period_end]
    //   );

    //   const periodendRows = periodendResult?.rows[0];
    //   console.log("periodendRows:", periodendRows);

    //   // If no rows are found, it means period_end doesn't overlap with any existing transaction periods
    //   if (periodendResult.rows.length > 0) {
    //     return res.status(200).json({ error: "Range already exists" });
    //   }
    // }
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  //}
});
