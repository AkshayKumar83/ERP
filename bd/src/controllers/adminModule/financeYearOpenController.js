const {db}= require("../../config/dbConnection");
const { dateFormate } = require("../../utility/constant");

const onQuery = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM integral.moitfinyear`);
    const result1 = await db.query(
      "SELECT * FROM integral.moitmodule order by trans_id"
    );
    const result2 = await db.query("SELECT * FROM integral.moittranperiod");

    const formattedRows = result.rows.map((row) => ({
      ...row,
      st_date: dateFormate(row.st_date),
      end_date: dateFormate(row.end_date),
    }));

    const formattedRows2 = result2.rows.map((row) => ({
      ...row,
      period_start: dateFormate(row.period_start),
      period_end: dateFormate(row.period_end),
    }));

    const responseData = {
      result: formattedRows,
      result1: result1.rows, // Include result1.rows in responseData
      result2: formattedRows2,
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const onSumbit = async (req, res) => {
  try {
    const FinanceYearOpen = { ...req.body };
    const { insertFinc } = FinanceYearOpen;

    for (const fin of insertFinc) {
      const { st_date, end_date, flag } = fin;

      result = await db.query(
        `INSERT INTO integral.moitfinyear (st_date, flag, end_date,  year_code) 
            VALUES ($1, $2, $3, EXTRACT(YEAR FROM $1::TIMESTAMP)) RETURNING st_date`,
        [st_date, flag, end_date],
        {
          types: ["timestamp", "text", "timestamp"],
        }
      );
      console.log("Insert Query:", result.rows);
      newForm = result.rows[0].flag;
      console.log("flag:", newForm);
    }

    const { insertTranp, childrnTranp } = FinanceYearOpen;
    let result1query; // Declare result1query outside the loop

    if (childrnTranp.length === 0) {
      console.log("No child records found in childrnTranp.");
    } else {
      for (const trans of insertTranp) {
        const { period_start, period_end, status_flag } = trans;
        // Accessing trans_id from childrnTranp
        for (const transid of childrnTranp) {
          const { trans_id } = transid;
          console.log("trans_id:", transid);

          // Check if trans_id is present in childrnTranp
          const matchingChild = childrnTranp.find(
            (child) => child.trans_id === trans_id
          );

          if (matchingChild) {
            result1query = await db.query(
              `INSERT INTO integral.moittranperiod (period_start, period_end, status_flag, trans_id, trans_year) 
                VALUES ($1, $2, $3, $4, EXTRACT(YEAR FROM $1::TIMESTAMP)) RETURNING period_start`,
              [period_start, period_end, status_flag, trans_id],
              {
                types: ["timestamp", "timestamp", "int", "int"],
              }
            );

            console.log("insertquery:", result1query);
          } else {
            console.log(
              "Matching child record not found for trans_id:",
              trans_id
            );
          }
        }
      }
    }

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error.message);
    res.status(500).json({ error: "Failed to insert data" });
  }
};

const onUpdate = async (req, res) => {
  try {
    const FinanceYearOpen = { ...req.body };
    console.log("departmentform:", FinanceYearOpen);
    const { childrnFinc, childrnTranp } = FinanceYearOpen;

    // Iterate over the childrnDept array and update each item
    const transIdFromChildrnTranp = childrnTranp[0].trans_id;
    console.log("Trans ID from childrnTranp:", transIdFromChildrnTranp);

    for (const Finc of childrnFinc) {
      const { st_date, end_date, year_code } = Finc;

      console.log("update:", Finc);

      // Correct the data types and order of parameters
      const params = [st_date, end_date, year_code]; // Include year_code in params array

      console.log("Parameters:", params); // Log parameters for debugging

      // Generate the SET part of the SQL query dynamically, excluding create_id, update_id, create_date, update_date, carry_forward, and flag
      const setColumns = Object.keys(Finc)
        .filter(
          (key) =>
            key !== "create_id" &&
            key !== "update_id" &&
            key !== "create_date" &&
            key !== "update_date" &&
            key !== "carry_forward" &&
            key !== "flag" &&
            key !== "year_code"
        ) // Exclude create_id, update_id, create_date, update_date, carry_forward, and flag
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

      // Prepare the SQL query with placeholders
      const updateQuery = `UPDATE integral.moitfinyear 
                               SET ${setColumns}
                               WHERE year_code = $${params.length}`; // Adjusted placeholder count

      try {
        // Execute the query with parameters
        const result = await db.query(updateQuery, params);
        console.log(
          "Updated Financial year Form:",
          result.rowCount,
          "rows affected"
        );
      } catch (error) {
        console.error("Error updating Financial year Form:", error.message);
        // Handle the error as needed
      }
    }

    const store1 = childrnTranp[0].trans_id; // Pick up trans_id from childrnTranp before the loop

    for (const Tranp of childrnTranp) {
      const {
        trans_id,
        trans_year,
        period_start,
        period_end,
        status_flag,
        create_id,
        create_date,
        update_id,
        update_date,
      } = Tranp;

      // Check if the trans_id is picked up correctly
      console.log("Current trans_id:", trans_id);

      const existingRecordQuery = `SELECT * FROM integral.moittranperiod WHERE period_start = $1 AND period_end = $2`; // Modify query to check only trans_id
      const existingRecordResult = await db.query(existingRecordQuery, [
        period_start,
        period_end,
      ]); // Pass trans_id to the query

      if (existingRecordResult.rows.length === 0) {
        console.log("No existing record found for trans_id:");

        console.log("store1:", store1);

        try {
          // Insert the record with the picked up trans_id
          const result1query = await db.query(
            `INSERT INTO integral.moittranperiod (period_start, period_end, status_flag, trans_id, trans_year) 
              VALUES ($1, $2, $3, $4, EXTRACT(YEAR FROM $1::TIMESTAMP)) RETURNING period_start`,
            [period_start, period_end, status_flag, store1], // Use picked up trans_id
            {
              types: ["timestamp", "timestamp", "int", "int"],
            }
          );
          console.log(
            "Inserted Transaction period Form:",
            result1query.rows.length,
            "rows affected"
          );
        } catch (error) {
          console.error(
            "Error inserting Transaction period Form:",
            error.message
          );
          // Handle the error as needed
        }
      } else {
        try {
          const updateColumns = Object.keys(Tranp)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
          const params = [
            period_start,
            period_end,
            status_flag,
            create_id,
            create_date,
            update_id,
            update_date,
            trans_year,
            trans_id,
          ]; // Add other properties as needed
          const updateQuery = await db.query(
            `UPDATE integral.moittranperiod 
                                                SET ${updateColumns}
                                                WHERE trans_id = $${
                                                  Object.keys(Tranp).length + 1
                                                } AND trans_year = $${
              Object.keys(Tranp).length + 2
            }`,
            params
          );
          console.log(
            "Updated Transaction period Form:",
            updateQuery.rowCount,
            "rows affected"
          );
        } catch (error) {
          console.error(
            "Error updating Transaction period Form:",
            error.message
          );
          // Handle the error as needed
        }
      }
    }

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating departments:", error.message);
    res.status(500).json({ error: "Failed to update departments" });
  }
};

const updateCurrentForm = async (req, res) => {
  try {
    const FinanceYearOpen = { ...req.body };
    const { childrnFinc } = FinanceYearOpen;

    for (const Finc of childrnFinc) {
      const { year_code, flag } = Finc;
      console.log("year_code:", year_code, Finc); // Log the year_code value

      // Update the flag based on the year_code parameter
      const result = await db.query(
        `UPDATE integral.moitfinyear 
            SET flag = $1               
            WHERE year_code = $2`,
        [flag, year_code]
      );

      if (result.rowCount > 0) {
        console.log(
          `Updated ${result.rowCount} row(s) for year code: ${year_code}`
        );
      } else {
        console.log(`No rows updated for year code: ${year_code}`);
      }
    }

    // Send a response after processing all the data
    res.status(200).json({ message: "Data processed successfully" });
  } catch (error) {
    console.error("Error processing data:", error.message);
    res.status(500).json({ error: "Failed to process data" });
  }
};

const deleteTranPeriod = async (req, res) => {
  try {
    const { value } = req.params; // Extract value from request parameters

    // Parse the period_start from the query parameters
    const periodSt = JSON.parse(req.query.period_start);
    console.log("periodSt:", periodSt);

    // Construct the SQL query string
    const queryString =
      "DELETE FROM integral.moittranperiod WHERE period_start = $1 AND trans_year = $2";
    const queryParams = [periodSt, value];

    // Log the SQL query
    console.log("SQL Query:", queryString);
    console.log("Query Parameters:", queryParams);

    // Perform deletion based on period_start and value
    await db.query(queryString, queryParams);

    // Respond with success message
    res
      .status(200)
      .json({ message: "moittranperiod record deleted successfully." });
  } catch (error) {
    // If an error occurs during deletion, respond with an error message
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteFinPeriod = async (req, res) => {
  try {
    const { value } = req.params; // Extract value from request parameters

    // Parse the period_start from the query parameters
    const stdate = JSON.parse(req.query.st_date);
    console.log("stdate:", stdate);

    // Construct the SQL query string
    const queryString =
      "DELETE FROM integral.moitfinyear WHERE st_date = $1 AND year_code = $2";
    const queryParams = [stdate, value];

    // Log the SQL query
    console.log("SQL Query:", queryString);
    console.log("Query Parameters:", queryParams);

    // Perform deletion based on period_start and value
    await db.query(queryString, queryParams);

    // Respond with success message
    res
      .status(200)
      .json({ message: "moitfinyear record deleted successfully." });
  } catch (error) {
    // If an error occurs during deletion, respond with an error message
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const whenValidateStDate = async (req, res) => {
  const { data } = req.params;
  try {
    // Query to check if the provided st_date falls within any financial year period
    const result = await db.query(
      "SELECT st_date, end_date FROM integral.moitfinyear WHERE $1 BETWEEN st_date AND end_date",
      [data]
    );

    // If no rows are found, return a 204 status (No Content)
    if (result.rows.length === 0) {
      return res.status(500).json({ error: "RANGE ALREADY EXIST " });
    }
  } catch (err) {
    // If an error occurs during the database query execution, return a 500 status (Internal Server Error)
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const whenValidateEndDate = async (req, res) => {
  const { data } = req.params;
  try {
    // Query to check if the provided st_date falls within any financial year period
    const result = await db.query(
      "SELECT st_date, end_date FROM integral.moitfinyear WHERE $1 BETWEEN st_date AND end_date",
      [data]
    );

    // If no rows are found, return a 204 status (No Content)
    if (result.rows.length === 0) {
      return res.status(500).json({ error: "RANGE ALREADY EXIST " });
    }

    // Fetch the financial year period
    const dPeriod_start = result.rows[0].st_date;
    const dPeriod_end = result.rows[0].end_date;

    // Calculate the end date based on the provided start date
    const dEnd_dt = new Date(data);
    dEnd_dt.setFullYear(dEnd_dt.getFullYear() + 1);
    dEnd_dt.setDate(dEnd_dt.getDate() - 1);

    // Check if the end date is greater than one year from the calculated end date
    if (new Date(result.rows[0].end_date) > dEnd_dt) {
      // If the end date is greater than one year from the calculated end date, return an error
      return res
        .status(500)
        .send(
          `End date cannot be greater than ${
            dEnd_dt.toISOString().split("T")[0]
          }`
        );
    }
  } catch (err) {
    // If an error occurs during the database query execution, return a 500 status (Internal Server Error)
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const whenValidatePeriodSt = async (req, res) => {
  const { data } = req.params;

  try {
    // Check if the provided period_start falls within any financial year period
    const financialYearResult = await db.query(
      "SELECT st_date, end_date FROM integral.moitfinyear WHERE $1 BETWEEN st_date AND end_date",
      [data]
    );

    const financialYearRows = financialYearResult?.rows[0];
    console.log("financialYearRows:", financialYearRows);

    // If no financial year periods found, return an error response
    if (!financialYearRows || financialYearRows.length === 0) {
      return res
        .status(500)
        .json({ error: "Date is not between any financial year" });
    }
    // Query to check if the period_start overlaps with any existing transaction periods
    const transactionResult = await db.query(
      "SELECT period_start, period_end FROM integral.moittranperiod WHERE $1 BETWEEN period_start AND period_end",
      [data]
    );

    const transactionYearRows = transactionResult?.rows[0];
    console.log("transactionYearRows:", transactionYearRows);

    // If no rows are found, it means period_start doesn't overlap with any existing transaction periods
    if (transactionResult.rows.length === 0) {
      return res.status(200).json({ message: "Form submitted successfully" });
    } else {
      return res.status(500).json({ error: "Range already exists" });
    }
  } catch (err) {
    // If an error occurs during the database query execution, return a 500 status (Internal Server Error)
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const whenValidatePeriodEnd = async (req, res) => {
  const { data } = req.params;

  try {
    // Check if the provided period_start falls within any financial year period
    const financialYearResult = await db.query(
      "SELECT st_date, end_date FROM integral.moitfinyear WHERE $1 BETWEEN st_date AND end_date",
      [data]
    );

    const financialYearRows = financialYearResult?.rows[0];
    console.log("financialYearRows:", financialYearRows);

    // If no financial year periods found, return an error response
    if (!financialYearRows || financialYearRows.length === 0) {
      return res
        .status(500)
        .json({ error: "Date is not between any financial year" });
    }
    // Query to check if the period_start overlaps with any existing transaction periods
    const transactionResult = await db.query(
      "SELECT period_start, period_end FROM integral.moittranperiod WHERE $1 BETWEEN period_start AND period_end",
      [data]
    );

    const transactionYearRows = transactionResult?.rows[0];
    console.log("transactionYearRows:", transactionYearRows);

    // If no rows are found, it means period_start doesn't overlap with any existing transaction periods
    if (transactionResult.rows.length === 0) {
      return res.status(200).json({ message: "Form submitted successfully" });
    } else {
      return res.status(500).json({ error: "Range already exists" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  onQuery,
  onSumbit,
  onUpdate,
  updateCurrentForm,
  deleteTranPeriod,
  deleteFinPeriod,
  whenValidateStDate,
  whenValidateEndDate,
  whenValidatePeriodSt,
  whenValidatePeriodEnd,
};
