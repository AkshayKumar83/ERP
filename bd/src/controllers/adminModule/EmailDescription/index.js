const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../utility/query");

const TABLE_NAMES = {
  EMAIL_DESC: "moitemailtype",
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
          `SELECT COUNT(*) FROM ${TABLE_NAMES.EMAIL_DESC}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      default:
        queryParameter = ` OFFSET ${req.query.offset || 0}`;
        break;
    }

    const emailDescData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.EMAIL_DESC} order by email_type`
    );

    const responseData = {
      emailDescData: emailDescData.rows,
      count: dataCount || 0,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// for validate data

exports.getValidateData = catchAsync(async (req, res) => {
  const { email_type, email_desc } = req.query;

  try {
    if (email_type) {
      const emailDescData = await db.query(
        "SELECT *  FROM integral.moitemailtype WHERE email_type = $1",
        [email_type]
      );

      if (emailDescData.rows.length > 0) {
        return res.status(400).json({
          error: "Email type already exists",
          // email_desc: email_desc,
        });
      }
    }

    if (email_desc) {
      const emailDescData = await db.query(
        "SELECT *  FROM integral.moitemailtype WHERE email_desc = $1",
        [email_desc]
      );

      if (emailDescData.rows.length > 0) {
        const email_desc = emailDescData.rows[0]?.email_desc;
        return res.status(400).json({
          error: "Email description already exists",
        });
      }
    }

    return res.status(200).json({ email_desc: "" }); // Send an empty string if not found
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const postEmailDescData = async (req, res) => {
  try {
    const { emailDescData } = req.body;
    console.log("req body:", req.body);

    if (emailDescData) {
      const emailDescArray = Array.isArray(emailDescData)
        ? emailDescData
        : [emailDescData];

      // Filter records that have an id
      const filteredRecords = emailDescArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        delete record.id; // Remove id before insertion
        delete record.it_type;
        delete record.it_base;
        delete record.it_sub_c;
        delete record.fc_code;
        delete record.it_pu_um;
        delete record.purac_head;
        delete record.salac_head;
        delete record.active;
        delete record.hsn_sac_code;
        delete record.init_email_type;
        delete record.init_email_desc;

        const existingEmailType = await db.query(
          "SELECT * FROM integral.moitemailtype WHERE email_type = $1",
          [record.email_type]
        );

        if (existingEmailType.rows.length > 0) {
          return res.status(400).json({
            error: "Email type already exists",
            //email_desc: existingEmailType.rows[0].email_desc,
          });
        }

        const existingEmailDesc = await db.query(
          "SELECT * FROM integral.moitemailtype WHERE email_desc = $1",
          [record.email_desc]
        );

        if (existingEmailDesc.rows.length > 0) {
          return res.status(400).json({
            error: "Email description already exists",
          });
        }

        // Generate insert query
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.EMAIL_DESC,
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

// const updateEmailDescDetails = async (req, res) => {
//   const { emailDescData, deletedEmailDescData } = req.body;
//   //console.log("After getting Update:", req.body);

//   try {
//     await db.query("BEGIN");

//     if (Array.isArray(emailDescData) && emailDescData.length >= 1) {
//       for (const [index, record] of emailDescData.entries()) {
//         // Delete unwanted properties
//         delete record.it_type;
//         delete record.it_base;
//         delete record.it_sub_c;
//         delete record.fc_code;
//         delete record.it_pu_um;
//         delete record.purac_head;
//         delete record.salac_head;
//         delete record.active;
//         delete record.hsn_sac_code;

//            const {init_email_type, init_email_desc, ...restOfRecord} = record;
//         const emailDescDataForUpdate = cleanObject(restOfRecord);
//         const columns = Object.keys(emailDescDataForUpdate);
//         const values = Object.values(emailDescDataForUpdate);

//         // Ensure email_type exists
//         if (!record.email_type) {
//           console.error(`Skipping record at index ${index} due to missing email_type`);
//           continue;
//         }

//         const setClause = columns
//           .map((column, idx) => `${column} = $${idx + 1}`)
//           .join(", ");

//         const query = `
//           UPDATE ${TABLE_NAMES.EMAIL_DESC}
//           SET ${setClause}
//           WHERE email_type = $${columns.length + 1}
//         `;

//         try {
//           // Add email_type at the end of values array
//           await db.query(query, [...values, init_email_type]);
//         } catch (error) {
//           console.error(`Error updating record at index ${index}:`, error);
//           throw error;
//         }
//       }
//     }

//     // Delete emailDesc data
//     if (Array.isArray(deletedEmailDescData) && deletedEmailDescData.length) {
//       for (const deletedRecord of deletedEmailDescData) {
//         const deleteQuery = `
//           DELETE FROM ${TABLE_NAMES.EMAIL_DESC}
//           WHERE email_type = $1 and email_desc = $2
//         `;

//         try {
//           //console.log("Delete query:", deleteQuery);
//           await db.query(deleteQuery, [deletedRecord.init_email_type, deletedEmailDescData.init_email_desc]);
//         } catch (error) {
//           console.error("Error deleting record:", error);
//           throw error;
//         }
//       }
//     }

//     await db.query("COMMIT");
//     return res.status(200).send({ status: "Successfully updated" });
//   } catch (error) {
//     console.error("Error:", error);
//     await db.query("ROLLBACK");
//     return res.status(500).send({ message: "Failed to update email description details" });
//   }
// };

const updateEmailDescDetails = async (req, res) => {
  const { emailDescData, deletedEmailDescData } = req.body;

  try {
    await db.query("BEGIN");

    // --- UPDATE SECTION ---
    if (Array.isArray(emailDescData) && emailDescData.length > 0) {
      for (const [index, record] of emailDescData.entries()) {
        // Remove unwanted properties
        const {
          it_type,
          it_base,
          it_sub_c,
          fc_code,
          it_pu_um,
          purac_head,
          salac_head,
          active,
          hsn_sac_code,
          init_email_type,
          init_email_desc,
          ...restOfRecord
        } = record;

        const emailDescDataForUpdate = cleanObject(restOfRecord);
        const columns = Object.keys(emailDescDataForUpdate);
        const values = Object.values(emailDescDataForUpdate);

        if (!record.email_type) {
          console.error(
            `Skipping record at index ${index} due to missing email_type`
          );
          continue;
        }

        const setClause = columns
          .map((column, idx) => `${column} = $${idx + 1}`)
          .join(", ");

        const query = `
          UPDATE ${TABLE_NAMES.EMAIL_DESC}
          SET ${setClause}
          WHERE email_type = $${columns.length + 1}
        `;

        try {
          await db.query(query, [...values, init_email_type]);
        } catch (error) {
          console.error(`Error updating record at index ${index}:`, error);
          throw error;
        }
      }
    }

    // --- DELETE SECTION ---
    if (
      Array.isArray(deletedEmailDescData) &&
      deletedEmailDescData.length > 0
    ) {
      for (const deletedRecord of deletedEmailDescData) {
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.EMAIL_DESC}
          WHERE email_type = $1 AND email_desc = $2
        `;

        try {
          await db.query(deleteQuery, [
            deletedRecord.init_email_type,
            deletedRecord.init_email_desc,
          ]);
        } catch (error) {
          console.error("Error deleting record:", error);
          throw error;
        }
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Error:", error);
    await db.query("ROLLBACK");
    return res.status(500).send({
      message: "Failed to update email description details",
    });
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
    await updateEmailDescDetails(req, res);
    return;
  } else {
    await postEmailDescData(req, res);
    return;
  }
});
