const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  cleanObject,
  generateSingleInsertQuery,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  DEPARTMENT_TABLE: "integral.mhpmdept",
  AUTHPERSON_TABLE: "integral.user_master",
  USER_TABLE: "integral.user_master",
  USER_DIVISION: "integral.user_division",
  USER_LOCATION: "integral.user_location",
  GET_USER_ID_BY_SEQUENCE: "nextval('integral.s_user_master_user_id')",
};

let transactions = {};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const departmentList = await db.query(
    `select department, dept_cd from ${TABLE_NAMES.DEPARTMENT_TABLE} order by 1 `
  );
  const authpersonList = await db.query(
    ` SELECT SUBSTR(RPAD(login_name, x.login_name_len, ' ') || ' - ' || user_name, 1, 100) AS login_name, 
               user_id
        FROM ${TABLE_NAMES.AUTHPERSON_TABLE} u, (SELECT MAX(LENGTH(login_name)) AS login_name_len FROM ${TABLE_NAMES.AUTHPERSON_TABLE}) x
        ORDER BY login_name `
  );

  //console.log("department:", departmentList.rows);
  // console.log("authperson:", authpersonList.rows);

  return res.status(200).json({
    departments: departmentList.rows,
    authpersons: authpersonList.rows,
  });
});

exports.getHelpListData = catchAsync(async (req, res, next) => {
  const helpType = req.query.help_list;

  try {
    let data;
    if (helpType === "employee") {
      // Query for employee data
      data = await db.query(
        `SELECT EMP_NAME, EMP_CD, C.DESCRIPTION AS P_DESIG
         FROM MHPMEMPM E
         LEFT JOIN MOMMCODE C ON C.CODE = E.P_DESIG
         ORDER BY EMP_NAME`
      );
      //console.log("dataemployee:", data)
      // return res.status(200).json({
      //   employees: data.rows,
      // });

      return res.status(200).send(data.rows);
    } else if (helpType === "location") {
      // Query for location data
      data = await db.query(`select * from integral.moitlocation`);
      // console.log("location:", data);
      return res.status(200).send(data.rows);
    } else if (helpType === "division") {
      // Query for division data
      data = await db.query(`select * from integral.moitdivision`);
      //console.log("division:", data);
      return res.status(200).send(data.rows);
    } else {
      // If an invalid helpType is passed
      return res.status(400).json({ message: "Invalid help query parameter" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching data" });
  }
});

exports.getHelpSuggestion = catchAsync(async (req, res, next) => {
  try {
    const { type, search } = req?.query;
    const searchVal = search.toUpperCase();

    if (type === "emp_cd") {
      // for employee feild
      const empList = await db.query(
        `SELECT 
              E.EMP_NAME, 
              E.EMP_CD, 
              C.DESCRIPTION AS P_DESIG
          FROM 
              MHPMEMPM E
          LEFT JOIN 
              MOMMCODE C ON C.CODE = E.P_DESIG
          WHERE 
              E.EMP_CD LIKE $1
          ORDER BY 
              E.EMP_NAME;`,
        [`${searchVal}%`] // Add the wildcard to the search term
      );

      res
        .status(200)
        .json({
          suggestionList: [...(empList.rowCount > 0 ? empList.rows : [])],
          status: "found",
        });
    } else if (type === "name") {
      // for division field
      const divisionData = await db.query(
        `select division_id, name from moitdivision where name like $1`,
        [`${searchVal}%`]
      );
      res
        .status(200)
        .json({
          suggestionList: [
            ...(divisionData.rowCount > 0 ? divisionData.rows : []),
          ],
          status: "found",
        });
    } else if (type === "location_desc") {
      // for location field
      const locationData = await db.query(
        `select location_id, location_desc from moitlocation where location_desc like $1`,
        [`${searchVal}%`]
      );
      res
        .status(200)
        .json({
          suggestionList: [
            ...(locationData.rowCount > 0 ? locationData.rows : []),
          ],
          status: "found",
        });
    } else {
      res.status(404).json({ message: "not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `server error` });
  }
});

exports.getValidateData = catchAsync(async (req, res, next) => {
  const validateData = req.query.validdata;
  const value = req.query.value;

  //console.log(`validateData: ${validateData}, value: ${value}`);

  try {
    let data;
    let message = "";

    // Handle login name validation
    if (validateData === "loginname") {
      data = await db.query(
        `SELECT * FROM integral.user_master WHERE login_name = $1`,
        [value]
      );

      if (data.rows.length > 0) {
        return res.status(200).json({ message: "User already defined" });
      } else {
        return res.status(204).send(); // No Content if login name is unique
      }
    }
    // Handle employee code validation
    else if (validateData === "employeecd") {
      // First, check if emp_cd already exists in user_master
      data = await db.query(
        `SELECT * FROM integral.user_master WHERE emp_cd = $1`,
        [value]
      );

      if (data.rows.length > 0) {
        console.log("Employee code already exists");
        return res.status(200).json({ message: "Employee already defined" });
      }

      // Then, check if emp_name exists in mhpmempm
      let data1 = await db.query(
        `SELECT emp_name FROM mhpmempm WHERE emp_cd = $1`,
        [value]
      );

      if (data1.rows.length > 0) {
        const { emp_name } = data1.rows[0];
        return res.status(200).json({ emp_name });
      }

      // If neither exists, return 204 No Content
      return res.status(204).send();
    }
    // Handle division name validation
    else if (validateData === "divisionname") {
      data = await db.query(
        `SELECT * FROM integral.moitdivision WHERE name = $1`,
        [value]
      );

      if (data.rows.length > 0) {
        return res.status(200).json({ message: "Division already exists in Division Master" });
      } else {
        return res.status(204).send(); // No Content if division name is unique
      }
    }
    // Handle location name validation
    else if (validateData === "locationname") {
      data = await db.query(
        `SELECT * FROM integral.moitlocation WHERE location_desc = $1`,
        [value]
      );

      if (data.rows.length > 0) {
        return res.status(200).json({ message: "Location already exists in Location Master" });
      } else {
        return res.status(204).send(); // No Content if location is unique
      }
    }
    // Handle invalid validation type
    else {
      return res.status(400).json({ message: "Invalid validation field" });
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    return res.status(500).json({ message: "Error fetching data" });
  }
});


exports.startTransaction = catchAsync(async (req, res, next) => {
  const transactionId = Date.now().toString(); // Simple unique ID
  console.log("Generated transactionId:", transactionId); // Log the transactionId
  const client = await db.connect();
  await client.query("BEGIN");
  transactions[transactionId] = client;

  try {
    if (req?.query?.form_status === "Insert") {
      const result = await client.query(
        `SELECT ${TABLE_NAMES.GET_USER_ID_BY_SEQUENCE} AS next_id`
      );
      const userId = result.rows[0].next_id;
      console.log("userId:", userId);

      return res.status(200).send({ transactionId, userId });
    } else {
      return res.status(200).send({ transactionId });
    }
  } catch (error) {
    console.error("Failed to get transactionid:", error);
    res.status(500).json({ error: "Failed to transaction id" });
  }
});

const postDivisionData = catchAsync(async (req, res, next) => {
  const client = transactions[req.query.transactionId];

  if (!client) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const getDivisionData = { ...req.body };
  console.log("divisionData", getDivisionData);

  const { name, isDivisionPosted, id, ...remainingData } = getDivisionData;

  const divisionDataForInsert = cleanObject({
    ...remainingData,
    user_id: req.query.userId, // Add the userId from query parameters
  });

  console.log("divisionDataForInsert:", divisionDataForInsert);

  const queryForInsert = generateSingleInsertQuery(
    TABLE_NAMES.USER_DIVISION,
    divisionDataForInsert
  );

  console.log("division data insert query: ", queryForInsert);

  const valuesForInsertQuery = Object.values(divisionDataForInsert);

  try {
    // Store the result of the query in a variable and log it
    const result = await client.query(queryForInsert, [
      ...valuesForInsertQuery,
    ]);

    console.log("Query result:", result); // Log the query result

    res.send({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.detail });
  }
});

const postLocationData = catchAsync(async (req, res, next) => {
  const client = transactions[req.query.transactionId];

  if (!client) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const getLocationData = { ...req.body };
  console.log("locationData", getLocationData);

  const { location_desc, isLocationPosted, id, ...remainingData } =
    getLocationData;

  const locationDataForInsert = cleanObject({
    ...remainingData,
    user_id: req.query.userId, // Add the userId from query parameters
  });

  console.log("locationDataForInsert:", locationDataForInsert);

  const queryForInsert = generateSingleInsertQuery(
    TABLE_NAMES.USER_LOCATION,
    locationDataForInsert
  );

  console.log("location data insert query:", queryForInsert);

  const valuesForInsertQuery = Object.values(locationDataForInsert);

  try {
    // Execute the query and store the result
    const result = await client.query(queryForInsert, valuesForInsertQuery);

    // Log the query result
    console.log("Query result:", result);

    // Send the response
    res.send({ status: "success" });
  } catch (error) {
    console.error("Error during location data insertion:", error);
    res.status(500).json({ error: error.detail });
  }
});

exports.commitTransaction = catchAsync(async (req, res, next) => {
  const client = transactions[req?.query?.transactionId];
  console.log("Request Query:", req?.query);
  console.log("Request Body:", req?.body);

  // Correctly retrieve userId from query parameters
  const userId = Array.isArray(req.query.userId)
    ? req.query.userId[0]
    : req.query.userId;
  const onlyCommit = req?.query?.onlyCommit === "Y";

  if (!client) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  try {
    if (onlyCommit) {
      await client.query("COMMIT");
      client.end();
      delete transactions[req.query.transactionId];
      return res.json({ status: "committed" });
    } else {
      const divisionData = { ...req.body.divisionData };
      const locationData = { ...req.body.locationData };

      // Insert Division Data
      if (divisionData && Object.keys(divisionData).length > 0) {
        console.log("Division Data:", divisionData);

        const { name, isDivisionPosted, id, ...divisionRemainingData } =
          divisionData;
        const divisionDataForInsert = cleanObject({
          ...divisionRemainingData,
          user_id: userId, // Corrected userId
        });

        const divisionInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.USER_DIVISION,
          divisionDataForInsert
        );
        const divisionValues = Object.values(divisionDataForInsert);

        console.log("Division Insert Query:", divisionInsertQuery);
        console.log("Division Insert Values:", divisionValues);

        // await client.query(divisionInsertQuery, divisionValues);
        console.log("Division Inserted successfully");
      }

      // Insert Location Data
      if (locationData && Object.keys(locationData).length > 0) {
        console.log("Location Data:", locationData);

        const {
          location_desc,
          isLocationPosted,
          id,
          ...locationRemainingData
        } = locationData;
        const locationDataForInsert = cleanObject({
          ...locationRemainingData,
          user_id: userId, // Corrected userId
        });

        const locationInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.USER_LOCATION,
          locationDataForInsert
        );
        const locationValues = Object.values(locationDataForInsert);

        console.log("Location Insert Query:", locationInsertQuery);
        console.log("Location Insert Values:", locationValues);

        await client.query(locationInsertQuery, locationValues);
        console.log("Location Inserted successfully");
      }

      //const isDivisionNoUpdated = await setUserOnSubmit(userId, client);
      // if (!isDivisionNoUpdated) return;

      await client.query("COMMIT");
      client.end();
      delete transactions[req.query.transactionId];
      return res.json({ status: "committed" });
    }
  } catch (error) {
    console.error("Transaction commit failed:", error);
    await client.query("ROLLBACK");
    client.end();
    delete transactions[req.query.transactionId];
    return res.status(500).json({ error: "Transaction commit failed" });
  }
});

exports.handleTransaction = catchAsync(async (req, res, next) => {
  console.log(req.query);
  if (req?.query?.transaction === "start") {
    exports.startTransaction(req, res, next);
    return;
  }
  if (req?.query?.cancelTransaction === "Y") {
    exports.rollbackTransaction(req, res, next);
    return;
  }
});

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY user_id LIMIT 1 OFFSET ${req.query.offset || 0
      }`;
    let dataCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["login_name"];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    console.log("whereClauses", queryValues);

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.USER_TABLE} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter)
    } 
    else {

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.USER_TABLE}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "ORDER BY user_id DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = `ORDER BY user_id LIMIT 1 OFFSET ${req.query.offset || 0
          }`;
        break;
    } 
  }

    const userData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.USER_TABLE} ${queryParameter}`
    );
  //  // console.log("User Data:", userData.rows[0]);

  //   if (!userData.rows.length) {
  //     return res.status(404).send({ message: "No user data found" });
  //   }

    const userLoginData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.USER_TABLE} ORDER BY user_id`
    );
    const userId = userData.rows[0].user_id;

    const userDivisionData = await db.query(
      `select * from ${TABLE_NAMES.USER_DIVISION} where user_id = $1`,
      [userId]
    );

    await Promise.all(
      userDivisionData.rows.map(async (item, index) => {
        const divname = await db.query(
          ` SELECT
            name || '-' || SHORT_NAME AS name
            FROM moitdivision
            WHERE division_id = $1`,
          [item.division_id]
        );
        item["name"] = divname.rows[0].name;
        item.original_division_id = item.division_id; // added by amit this due to track previous data on update and need to be remove this on update
      })
    );

    const userLocationData = await db.query(
      `select * from ${TABLE_NAMES.USER_LOCATION} where user_id = $1`,
      [userId]
    );

    await Promise.all(
      userLocationData.rows.map(async (item, index) => {
        const locname = await db.query(
          `SELECT location_desc 
           FROM integral.moitlocation
           WHERE location_id = $1;`,
          [item.location_id]
        );
        item["location_desc"] = locname.rows[0]?.location_desc;
        item.original_location_id = item.location_id; // added this due to track previous data on update and need to remove this on update
      })
    );

    const empCd = userData.rows[0].emp_cd;
    console.log("empCd:", empCd);

    // if (!empCd) {
    //   return res.status(404).send({ message: "No employee code provided" });
    // }

    //Fetching data from MHPMEMPM and MOMMCODE tables
    const empData = await db.query(
      ` SELECT 
      EMP_NAME, EMP_CD, C.DESCRIPTION AS P_DESIG
      FROM integral.MHPMEMPM E
      LEFT JOIN integral.MOMMCODE C ON C.CODE = E.P_DESIG
      WHERE E.EMP_CD = $1`,
      //[userData.rows[0].emp_cd]
      [empCd]
    );

    const response = {
      ...userData.rows[0],
      userLoginData: userLoginData.rows,
      userDivisionData: userDivisionData.rows,
      userLocationData: userLocationData.rows,
      emp_name: empData.rows[0]?.emp_name,
      count: dataCount || 0,
    };

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

const postUserDetails = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { formData, divisionData, locationData } = req.body;
    console.log("req body:", req.body);

    const { emp_name, ...remainingData } = formData;

    // Fetch next user_id from sequence
    const result = await db.query(
      `SELECT ${TABLE_NAMES.GET_USER_ID_BY_SEQUENCE} AS next_id`
    );
    const userId = result.rows[0].next_id;
    console.log("userId:", userId);

    // Clean up the formData and add the userId
    const cleanUserLoginDataForInsert = cleanObject(remainingData);
    cleanUserLoginDataForInsert.user_id = userId;

    console.log("Cleaned Data for Insert:", cleanUserLoginDataForInsert);

    if (Object.keys(cleanUserLoginDataForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.USER_TABLE,
      cleanUserLoginDataForInsert
    );
    const valuesForInsertQuery = Object.values(cleanUserLoginDataForInsert);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);

    console.log("userDivisionData:", divisionData);

    // Prepare and insert userDivisionData
    if (divisionData.length) {
      const divisionArray = Array.isArray(divisionData)
        ? divisionData
        : [divisionData];

      for (const [index, record] of divisionArray.entries()) {
        // Add user_id and remove unnecessary fields
        record.user_id = userId;
        delete record.isDivisionPosted;
        delete record.name;
        delete record.id;
        delete original_division_id;


        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.USER_DIVISION,
          record
        );
        const valuesForInsertQuery = Object.values(record);
        // console.log(
        //   `Division valuesForInsertQuery [index ${index}]:`,
        //   valuesForInsertQuery
        // );

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(
            `Error inserting division record at index ${index}:`,
            error
          );
          throw new Error(`Division insert error at index ${index}`);
        }
      }
    }

    console.log("userLocationData:", locationData);

    // Prepare and insert userLocationData
    if (locationData.length) {
      const locationArray = Array.isArray(locationData)
        ? locationData
        : [locationData];

      for (const [index, record] of locationArray.entries()) {
        // Add user_id and remove unnecessary fields
        record.user_id = userId;
        delete record.isLocationPosted;
        delete record.location_desc;
        delete record.id;
        delete original_location_id;

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.USER_LOCATION,
          record
        );
        const valuesForInsertQuery = Object.values(record);
        console.log(
          `Location valuesForInsertQuery [index ${index}]:`,
          valuesForInsertQuery
        );

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(
            `Error inserting location record at index ${index}:`,
            error
          );
          throw new Error(`Location insert error at index ${index}`);
        }
      }
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "success", userId });
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query("ROLLBACK");
    return res.status(400).send("Some error occurred");
  }
};

const updateUserDetails = async (req, res) => {

  const { formData, updateFormPayload, divisionData, locationData, deletedDivisionData, deletedLocationData } = { ...req?.body };
  //const { deletedDivisionData, deletedLocationData } = updateFormPayload;
  // console.log("deleting division data : ",deletedDivisionData)
  try {
    await db.query("Begin");
    let userId = formData?.user_id;

    //updating the user data
    if (Object.keys(req.body).length !== 0) {
      const userLoginDataForInsert = { ...formData };
      const user_id = userLoginDataForInsert.user_id;
      // console.log("formData for update:", formData)

      // Remove emp_name and count
      delete userLoginDataForInsert.emp_name;
      delete userLoginDataForInsert.count;
      delete userLoginDataForInsert.user_id;
      delete userLoginDataForInsert.original_division_id;
      delete userLoginDataForInsert.original_location_id;

      const cleanuserLoginDataForUpdate = cleanObject(userLoginDataForInsert);

      const columns = Object.keys(cleanuserLoginDataForUpdate);
      const values = Object.values(cleanuserLoginDataForUpdate);

      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${TABLE_NAMES.USER_TABLE
        } SET ${setClause} WHERE user_id = $${columns.length + 1} `;



      try {
        // Execute the update query
        await db.query(query, [...values, user_id]);
      } catch (error) {
        throw new Error(error);
      }
    }

    // for update the divisionData
    if (divisionData.length >= 1) {
      // const userId = updateFormPayload.updatedDivision[0].user_id || null;
      // console.log("userId from first record:", userId);

      // Loop through each record in the divisionData array
      for (const [
        index,
        record,
      ] of divisionData.entries()) {
        const { user_id, division_id } = record;

        if (record.hasOwnProperty("user_id") && user_id) {
          // Record has a user_id, so we update it
          // console.log(`Updating record at index ${index} for user_id: ${user_id}`);

          const {
            original_division_id,
            ...restOfRecord
          } = record;
          // Clean the current record only
          //const divisionDataForUpdate = cleanObject({ ...record }); 

          const divisionDataForUpdate = cleanObject(restOfRecord);


          // Exclude the 'name' column from the update
          // let original_division_id =
          //   divisionDataForUpdate?.original_division_id;
          delete divisionDataForUpdate.name;
          delete divisionDataForUpdate?.original_division_id;

          // console.log("clean division data for update:", divisionDataForUpdate);

          const columns = Object.keys(divisionDataForUpdate);
          const values = Object.values(divisionDataForUpdate);

          // Create SET clause for SQL UPDATE query
          const setClause = columns
            .map((column, index) => `${column} = $${index + 1}`)
            .join(", ");

          // Generate the full SQL query
          const query = `UPDATE ${TABLE_NAMES.USER_DIVISION} 
            SET ${setClause} 
            WHERE user_id = $${columns.length + 1} 
            AND division_id = $${columns.length + 2}`;

          // console.log("SQL query for updated division:", query);

          try {
            // Execute the update query
            await db.query(query, [...values, user_id, original_division_id]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(error);
          }
        } else {
          // Record does not have a user_id, so we insert it
          // console.log(`Inserting new record at index ${index} since user_id is missing`);

          const divisionDataForInsert = cleanObject({ ...record }); // Clean individual record
          // Exclude the 'name' column from the update
          delete divisionDataForInsert.name;
          delete divisionDataForInsert.isDivisionPosted;
          delete divisionDataForInsert.id;
          delete divisionDataForInsert.original_division_id;

          console.log("clean division data for insert:", divisionDataForInsert);

          try {
            const queryForInsert = generateSingleInsertQuery(
              TABLE_NAMES.USER_DIVISION,
              { user_id: userId, ...divisionDataForInsert } // Use existing user_id or handle null appropriately
            );

            const valuesForInsertQuery = Object.values({
              user_id: userId,
              ...divisionDataForInsert,
            });

            console.log("Insert values:", valuesForInsertQuery);

            // Insert record one by one
            await db.query(queryForInsert, [...valuesForInsertQuery]);
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(error);
          }
        }
      }
    }

    // for deleting Division data
    // if (Array.isArray(deletedDivisionData) && deletedDivisionData.length) {
    //   // Process as array
    // } else if (deletedDivisionData) {
    //   // Process as single record
    //   const deleteDivision = `DELETE FROM ${TABLE_NAMES.USER_DIVISION} WHERE user_id = $1 AND division_id = $2`;

    //   console.log("delete query:", deleteDivision);

    //   try {
    //     // Execute the delete query for the record
    //     await db.query(deleteDivision, [deletedDivisionData.user_id, deletedDivisionData.division_id]);
    //   } catch (error) {
    //     console.error(`Error deleting record:`, error);
    //     throw new Error(error);
    //   }
    // }

    // for update the locationData
    if (locationData.length >= 1) {
      // const userId = updateFormPayload.updatedLocation[0].user_id || null; // Log user_id from first record for debugging
      // console.log("userId from first record:", userId);

      // Loop through each record in the locationData array
      for (const [
        index,
        record,
      ] of locationData.entries()) {
        const { user_id, location_id } = record;

        if (record.hasOwnProperty("user_id") && user_id) {
          // Record has a user_id, so we update it
          // console.log(`Updating record at index ${index} for user_id: ${user_id}`);


          const {
            original_location_id,
            ...restOfRecord
          } = record;
          // Clean the current record only 

          //const locationDataForUpdate = cleanObject({ ...record }); 

          const locationDataForUpdate = cleanObject(restOfRecord);

          // Exclude the 'name' column from the update
          // let original_location_id =
          //   locationDataForUpdate?.original_location_id;
          //delete locationDataForUpdate.original_location_id; // this requires bcoz to updated the record
          delete locationDataForUpdate.location_desc;

          // console.log("clean location data for update:", locationDataForUpdate);

          const columns = Object.keys(locationDataForUpdate);
          const values = Object.values(locationDataForUpdate);

          // Create SET clause for SQL UPDATE query
          const setClause = columns
            .map((column, index) => `${column} = $${index + 1}`)
            .join(", ");

          // Generate the full SQL query
          const query = `UPDATE ${TABLE_NAMES.USER_LOCATION} 
            SET ${setClause} 
            WHERE user_id = $${columns.length + 1} 
            AND location_id = $${columns.length + 2}`;

          // console.log("SQL query for updated location:", query);

          try {
            // Execute the update query
            await db.query(query, [...values, user_id, original_location_id]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(error);
          }
        } else {
          // Record does not have a user_id, so we insert it
          // console.log(`Inserting new record at index ${index} since user_id is missing`);
          console.log("it came into new user");
          const locationDataForInsert = cleanObject({ ...record }); // Clean individual record
          // Exclude the 'name' column from the update
          delete locationDataForInsert.location_desc;

          delete locationDataForInsert.isLocationPosted;
          delete locationDataForInsert.id;
          delete locationDataForInsert.original_location_id;

          // console.log("clean location data for insert:", locationDataForInsert);

          try {
            const queryForInsert = generateSingleInsertQuery(
              TABLE_NAMES.USER_LOCATION,
              { user_id: userId, ...locationDataForInsert }
            );

            const valuesForInsertQuery = Object.values({
              user_id: userId,
              ...locationDataForInsert,
            });

            // console.log("Insert values:", valuesForInsertQuery);

            // Insert record one by one
            await db.query(queryForInsert, [...valuesForInsertQuery]);
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(error);
          }
        }
      }
    }

    // for deleting Location data
    // if (Array.isArray(deletedLocationData) && deletedLocationData.length) {
    //   // Process as array
    // } else if (deletedLocationData) {
    //   // Process as single record
    //   const deleteLocation = `DELETE FROM ${TABLE_NAMES.USER_LOCATION}
    //     WHERE user_id = $1 AND location_id = $2`;

    //   console.log("delete query:", deleteLocation);

    //   try {
    //     // Execute the delete query for the record
    //     await db.query(deleteLocation, [
    //       deletedLocationData.user_id,
    //       deletedLocationData.location_id,
    //     ]);
    //   } catch (error) {
    //     console.error(`Error deleting record:`, error);
    //     throw new Error(error);
    //   }
    // }

    // for deleting Location data
    if (deletedDivisionData.length) {
      for (const [index, record] of deletedDivisionData.entries()) {
        const deleteQuery = `DELETE FROM ${TABLE_NAMES.USER_DIVISION} WHERE user_id = $1 AND division_id = $2`;
        try {
          if (record?.user_id) {
            await db.query(deleteQuery, [record.user_id, record.division_id]);
          }
        } catch (error) {
          console.error(`Error deleting record at index ${index}:`, error);
          throw Error(`Deletion failed for record at index ${index}`);
        }
      }
    }

    // for deleting Division data
    if (deletedLocationData.length) {
      for (const [index, record] of deletedLocationData.entries()) {
        const deleteQuery = `DELETE FROM ${TABLE_NAMES.USER_LOCATION} WHERE user_id = $1 AND location_id = $2`;
        try {
          if (record?.user_id) {
            await db.query(deleteQuery, [record.user_id, record.location_id]);
          }
        } catch (error) {
          console.error(`Error deleting record at index ${index}:`, error);
          throw Error(`Deletion failed for record at index ${index}`);
        }
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
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

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateUserDetails(req, res);
    return;
  } else {
    await postUserDetails(req, res);
    return;
  }
});
