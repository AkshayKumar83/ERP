const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOITUSERSECTION: "moitusersection",
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
          `SELECT COUNT(*) FROM moitusersection`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      default:
        queryParameter = ` OFFSET ${req.query.offset || 0}`;
        break;
    }

    const userSectionData = await db.query(
      `SELECT * FROM moitusersection order by user_id`
    );

    if (userSectionData.rows.length > 0) {
      await Promise.all(
        userSectionData.rows.map(async (item) => {
          if (item.auth_id !== null) {
            const auth_name = await db.query(
              `SELECT USER_NAME 
	            FROM USER_MASTER
	            WHERE USER_ID = $1`,
              [item.auth_id]
            );
            item.auth_name = auth_name.rows[0]?.user_name || null;
          }

          if (item.section_id !== null) {
            const section_name = await db.query(
              `SELECT SECTION_DESC
	            FROM MOITSECTION
	           WHERE SECTION_ID = $1`,
              [item.section_id]
            );
            item.section_name = section_name.rows[0]?.section_desc || null;
          }

          if (item.user_id !== null) {
            const user_name = await db.query(
              `	SELECT USER_NAME 
	          FROM USER_MASTER
	           WHERE USER_ID = $1`,
              [item.user_id]
            );
            item.user_name = user_name.rows[0]?.user_name || null;
          }
        })
      );
    }

    const responseData = {
      userSectionData: userSectionData.rows,
      count: dataCount || 0,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// for validate data

const getValidateData = async (req, res) => {
  const { user_name, auth_name, section_name, appUserId } = req.query;

  try {
    if (user_name) {
      const userNameData = await db.query(
        `select  *  from user_master where user_name = $1`,

        [user_name]
      );

      if (!userNameData.rows.length > 0) {
        return res.status(409).json({
          error: "User does not exist",
        });
      } else {
        return res.status(200).json({
          user_id: userNameData.rows[0].user_id,
        });
      }
    }

    if (auth_name) {
      const authNameData = await db.query(
        `select  *  from user_master where user_name = $1`,

        [auth_name]
      );

      if (!authNameData.rows.length > 0) {
        return res.status(409).json({
          error: "Authorized Person does not exist",
        });
      } else {
        return res.status(200).json({
          auth_id: authNameData.rows[0].user_id,
        });
      }
    }

    if (section_name) {
      const sectionNameData = await db.query(
        `SELECT section_id 
	fROM moitsection s, user_master u
	where section_desc = $1
	  and s.dept_cd = u.dept_cd
	  and u.user_id = $2`,

        [section_name, appUserId]
      );

      if (!sectionNameData.rows.length > 0) {
        return res.status(409).json({
          error: "Section does not exist in the department",
        });
      } else {
        return res.status(200).json({
          section_id: sectionNameData.rows[0].section_id,
        });
      }
    }
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const helpListData = async (req, res) => {
  const { form_status, help_list, appDivisionId,
    appFinYear,
    appUserId,
  } = req?.query;
  console.log(req.query);

  try {
    if (
      help_list === "user" &&
      (form_status === "Insert" || form_status === "Update")
    ) {
      const userList = await db.query(
        `select  user_id, user_name from user_master order by 1   `
      );
      return res.status(200).send(userList.rows);
    } else if (
      help_list === "auth" &&
      (form_status === "Insert" || form_status === "Update")
    ) {
      const authList = await db.query(
        `select  user_id, user_name from user_master order by 1   `
      );
      return res.status(200).send(authList.rows);
    } else if (
      help_list === "section" &&
      (form_status === "Insert" || form_status === "Update")
    ) {
      const sectionList = await db.query(
        `select section_id, section_desc from moitsection s, user_master u where s.dept_cd = u.dept_cd
          and u.user_id = $1
          order by section_id`, [appUserId]
      );
      return res.status(200).send(sectionList.rows);
    } else {
      return res
        .status(400)
        .send({ message: "Invalid help_list or form_status" });
    }
  } catch (error) {
    console.error("Error in helpListData:", error);
    return res.status(500).send({ message: "Server Error" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

// for post data
const postUserSecData = async (req, res) => {
  try {
    const { userSectionData } = req.body;
    console.log("req body:", req.body);

    if (userSectionData) {
      const userSectionArray = Array.isArray(userSectionData)
        ? userSectionData
        : [userSectionData];

      // Filter records that have an id
      const filteredRecords = userSectionArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        delete record.id; // Remove id before insertion
        delete record.user_name;
        delete record.section_name;
        delete record.auth_name;
        delete record.init_user_id;
        delete record.init_sec_id;

        // Generate insert query
        const queryForInsert = generateSingleInsertQuery(
          "moitusersection",
          record
        );
        const valuesForInsertQuery = Object.values(record);
        console.log("valuesforinsert:", queryForInsert, valuesForInsertQuery);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
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

// for update data
const updateUserSecDetails = async (req, res) => {
  const { userSectionData, deletedUserSectionData } = req.body;

  try {
    await db.query("BEGIN");

    // INSERT / UPDATE
    if (Array.isArray(userSectionData) && userSectionData.length >= 1) {
      for (const [index, record] of userSectionData.entries()) {

        const {
          id,
          init_user_id,
          init_sec_id,
          user_name,
          section_name,
          auth_name,
          ...rest
        } = record;

        const cleanedRecord = cleanObject({ ...rest });

        if (!record.id) {
          // UPDATE existing record
          console.log("Updating record");

          const columns = Object.keys(cleanedRecord);
          const values = Object.values(cleanedRecord);

          const setClause = columns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
            UPDATE moitusersection
            SET ${setClause}
            WHERE user_id = $${columns.length + 1}
              AND section_id = $${columns.length + 2}
          `;

          try {
            await db.query(updateQuery, [
              ...values,
              init_user_id,
              init_sec_id,
            ]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw error;
          }

        } else if (record.id) {
          // INSERT new record
          console.log("Inserting new record");

          const insertData = cleanObject({
            ...record,
          });

          delete insertData.id;
          delete insertData.init_user_id;
          delete insertData.init_sec_id;
          delete insertData.user_name;
          delete insertData.section_name;
          delete insertData.auth_name;

          try {
            const insertQuery = generateSingleInsertQuery(
              "moitusersection",
              insertData
            );

            const valuesForInsert = Object.values(insertData);

            console.log("Insert Query:", insertQuery);
            console.log("Insert Values:", valuesForInsert);

            await db.query(insertQuery, valuesForInsert);

          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw error;
          }
        }
      }
    }

    if (Array.isArray(deletedUserSectionData) && deletedUserSectionData.length > 0) {
      for (const deletedRecord of deletedUserSectionData) {
        const deleteQuery = `
          DELETE FROM moitusersection
          WHERE user_id = $1 AND section_id = $2
        `;

        try {
          console.log("Delete query:", deleteQuery);
          await db.query(deleteQuery, [
            deletedRecord.user_id,
            deletedRecord.section_id,
          ]);
        } catch (error) {
          console.error("Error deleting record:", error);
          throw error;
        }
      }

    } else if (deletedUserSectionData) {
      const deleteQuery = `
        DELETE FROM moitusersection
        WHERE user_id = $1 AND section_id = $2
      `;

      try {
       // console.log("Delete query:", deleteQuery);
        await db.query(deleteQuery, [
          deletedUserSectionData.user_id,
          deletedUserSectionData.section_id,
        ]);
      } catch (error) {
        console.error("Error deleting record:", error);
        throw error;
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({
      status: "User section details updated successfully",
    });

  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");

    return res.status(500).send({
      message: "Failed to update user section details",
    });
  }
};

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateUserSecDetails(req, res);
    return;
  } else {
    await postUserSecData(req, res);
    return;
  }
});

exports.handleValidateFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.get_validate) {
    await getValidateData(req, res);
    return;
  }
  if (req?.query?.get_duplicate) {
    await getDuplicateData(req, res);
    return;
  }
});
