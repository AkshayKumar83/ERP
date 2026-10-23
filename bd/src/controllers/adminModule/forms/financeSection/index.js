const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOITSECTION: "moitsection",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const departmentList = await db.query(
    `Select Department, dept_cd from mhpmdept order by department `
  );

  // console.log("department:", departmentList.rows);

  return res.status(200).json({
    department: departmentList.rows,
  });
});

exports.getSectionDataByDeptCode = catchAsync(async (req, res, next) => {

  console.log('this query function gets executed')
  if (!req.query.dept_cd) {
    return next("department required");
  }

  let response = {};

  const sectionData = await db.query(
    `SELECT * from ${TABLE_NAMES.MOITSECTION} where dept_cd = $1`,
    [req.query.dept_cd]
  );
  response = {
    type: "found",
    //category: { ...categoryData.rows[0] },
    sectionData: sectionData.rows || [],
  };

  return res.send(response);
});

// const postFinanceSecData = async (req, res) => {
//   try {
//     let selectedDepartment = req?.body.dept_cd; 
//       console.log('selectedDepartment', selectedDepartment)

//     const { sectionData } = req.body;

//     if (sectionData) {
//       const SectionArray = Array.isArray(sectionData)
//         ? sectionData
//         : [sectionData];

//       const filteredRecords = SectionArray.filter((record) => record.id);

//       await db.query("BEGIN");

//       for (const [index, record] of filteredRecords.entries()) {
//         delete record.id;
//         delete record.isNew;
//         const result = await db.query(
//           `SELECT nextval('s_moisection_section_id')`
//         );
//         const Id = result.rows[0].nextval;

//         record.section_id = Id;
//         record.dept_cd = selectedDepartment;

//         const queryForInsert = generateSingleInsertQuery(
//           TABLE_NAMES.MOITSECTION,
//           record
//         );
//         const valuesForInsertQuery = Object.values(record);

//         console.log("Generated INSERT query:", queryForInsert);
//         console.log("Values for insert:", valuesForInsertQuery);

//         try {
//           await db.query(queryForInsert, valuesForInsertQuery);
//         } catch (error) {

//           console.log("Transaction rolled back due to error.");
//           throw new Error(`Insert error at index ${index}: ${error.message}`);
//         }
//       }

//       await db.query("COMMIT");
//      // console.log("Transaction committed.");
//       res.status(200).json({ message: "Records inserted successfully" });
//     } 
//   } catch (error) {
//     console.error("Transaction error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

const postFinanceSecData = async (req, res) => {
  try {
    let selectedDepartment = req?.body.dept_cd;
    console.log("selectedDepartment", selectedDepartment);

    const { sectionData } = req.body;

    if (sectionData) {
      const SectionArray = Array.isArray(sectionData)
        ? sectionData
        : [sectionData];

      // FIX: only NEW records
      const filteredRecords = SectionArray.filter(
        (record) => !record.section_id || record.section_id === ""
      );

      await db.query("BEGIN");

      for (const [index, record] of filteredRecords.entries()) {

        // avoid mutating original object
        const newRecord = { ...record };

        delete newRecord.id;
        delete newRecord.isNew;

        const result = await db.query(
          `SELECT nextval('s_moisection_section_id')`
        );

        const Id = result.rows[0].nextval;

        newRecord.section_id = Id;
        newRecord.dept_cd = selectedDepartment;

        // ✅ OPTIONAL: prevent duplicate before insert
        const duplicateCheck = await db.query(
          `SELECT 1 FROM moitsection 
           WHERE dept_cd = $1 AND section_prefix = $2`,
          [newRecord.dept_cd, newRecord.section_prefix]
        );

        if (duplicateCheck.rows.length > 0) {
          console.log(
            `Skipping duplicate prefix ${newRecord.section_prefix}`
          );
          continue; // skip instead of crash
        }

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOITSECTION,
          newRecord
        );

        const valuesForInsertQuery = Object.values(newRecord);

        console.log("Generated INSERT query:", queryForInsert);
        console.log("Values for insert:", valuesForInsertQuery);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.log("Transaction rolled back due to error.");
          throw new Error(
            `Insert error at index ${index}: ${error.message}`
          );
        }
      }

      await db.query("COMMIT");

      res.status(200).json({
        message: "Records inserted successfully",
      });
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// const updateFinanceSecDetails = async (req, res) => {
//   const { sectionData, deletedSectionData, dept_cd } = req.body;

//   console.log("After getting Update:", req.body);

//   try {
//     await db.query("BEGIN");

//     // Insert or Update section data
//     if (Array.isArray(sectionData) && sectionData.length > 0) {
//       for (const [index, record] of sectionData.entries()) {
//         const { section_id } = record;

//         if (!section_id) {
//           // Generate new section_id
//           const result = await db.query(`SELECT nextval('s_moisection_section_id')`);
//           const newSectionId = result.rows[0].nextval;

//           // Attach generated values
//           record.section_id = newSectionId;
//           record.dept_cd = dept_cd;

//           // Prepare clean insert record
//           const cleanRecord = cleanObject({ ...record });
//           delete cleanRecord.id; // In case it's present
//           delete cleanRecord.isNew

//           const insertQuery = generateSingleInsertQuery(
//             TABLE_NAMES.MOITSECTION,
//             cleanRecord
//           );

//           const valuesForInsert = Object.values(cleanRecord);
//           console.log("Insert Query:", insertQuery);
//           await db.query(insertQuery, valuesForInsert);

//         } else {
//           // Existing section, so update
//           const cleaned = cleanObject({ ...record });
//           delete cleaned.id; // remove non-table field

//           const columns = Object.keys(cleaned);
//           const values = Object.values(cleaned);

//           const setClause = columns
//             .map((col, idx) => `${col} = $${idx + 1}`)
//             .join(", ");

//           const updateQuery = `
//             UPDATE ${TABLE_NAMES.MOITSECTION}
//             SET ${setClause}
//             WHERE section_id = $${columns.length + 1}
//           `;

//           console.log("Update Query:", updateQuery);
//           await db.query(updateQuery, [...values, record.section_id]);
//         }
//       }
//     }

//     // Delete section records if needed
//     if (Array.isArray(deletedSectionData) && deletedSectionData.length > 0) {
//       for (const deletedRecord of deletedSectionData) {
//         const deleteQuery = `
//           DELETE FROM ${TABLE_NAMES.MOITSECTION}
//           WHERE section_id = $1
//         `;

//         try {
//           await db.query(deleteQuery, [deletedRecord.section_id]);
//         } catch (error) {
//           console.error("Error deleting record:", error);
//           throw error;
//         }
//       }
//     }

//     await db.query("COMMIT");
//     res.status(200).json({ success: true, message: "Section details updated successfully" });

//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error("Transaction failed:", error);
//     res.status(500).json({ success: false, error: error || "An error occurred while updating section details." });
//   }
// };  

const updateFinanceSecDetails = async (req, res) => {
  const { sectionData, deletedSectionData, dept_cd } = req.body;

  console.log(deletedSectionData);

  try {
    await db.query("BEGIN");


    if (Array.isArray(sectionData) && sectionData.length > 0) {
      for (const [index, record] of sectionData.entries()) {

        const newRecord = { ...record };
        const section_id = newRecord.section_id;

        delete newRecord.id;
        delete newRecord.isNew;


        //  INSERT (NEW RECORD)

        if (!section_id || section_id === "") {

          newRecord.dept_cd = dept_cd;

          //  DUPLICATE CHECK
          const duplicateCheck = await db.query(
            `SELECT 1 FROM ${TABLE_NAMES.MOITSECTION}
             WHERE dept_cd = $1 AND section_prefix = $2`,
            [newRecord.dept_cd, newRecord.section_prefix]
          );

          if (duplicateCheck.rows.length > 0) {
            console.log(
              `Skipping duplicate prefix ${newRecord.section_prefix}`
            );
            continue;
          }

          // Generate new ID
          const result = await db.query(
            `SELECT nextval('s_moisection_section_id')`
          );

          newRecord.section_id = result.rows[0].nextval;

          const cleanRecord = cleanObject(newRecord);

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MOITSECTION,
            cleanRecord
          );

          const valuesForInsert = Object.values(cleanRecord);

         // console.log("Insert Query:", insertQuery);

          await db.query(insertQuery, valuesForInsert);

        } else {

          //  UPDATE (EXISTING)

          newRecord.dept_cd = dept_cd;

          // DUPLICATE CHECK (exclude self)
          const duplicateCheck = await db.query(
            `SELECT 1 FROM ${TABLE_NAMES.MOITSECTION}
             WHERE dept_cd = $1 
             AND section_prefix = $2
             AND section_id != $3`,
            [newRecord.dept_cd, newRecord.section_prefix, section_id]
          );

          if (duplicateCheck.rows.length > 0) {
            throw new Error(
              `Duplicate prefix '${newRecord.section_prefix}' for department '${dept_cd}'`
            );
          }

          const cleaned = cleanObject(newRecord);

          const columns = Object.keys(cleaned);
          const values = Object.values(cleaned);

          const setClause = columns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
            UPDATE ${TABLE_NAMES.MOITSECTION}
            SET ${setClause}
            WHERE section_id = $${columns.length + 1}
          `;

          console.log("Update Query:", updateQuery);

          await db.query(updateQuery, [...values, section_id]);
        }
      }
    }

    // DELETE LOGIC

    // if (Array.isArray(deletedSectionData) && deletedSectionData.length > 0) {
    //   for (const deletedRecord of deletedSectionData) {
    //     const deleteQuery = `
    //       DELETE FROM ${TABLE_NAMES.MOITSECTION}
    //       WHERE section_id = $1
    //     `;

    //     await db.query(deleteQuery, [deletedRecord.section_id]);
    //   }
    // }  

   
    if (Array.isArray(deletedSectionData) && deletedSectionData.length > 0) {

     console.log(deletedSectionData)

      for (const record of deletedSectionData) {
        const deleteQuery = `
      DELETE FROM ${TABLE_NAMES.MOITSECTION}
      WHERE section_id = $1
    `;

        await db.query(deleteQuery, [record.section_id]);
      }
    }

    await db.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Section details updated successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");

    console.error("Transaction failed:", error.message);

    res.status(500).json({
      success: false,
      error: error.message || "Update failed",
    });
  }
};


exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateFinanceSecDetails(req, res);
    return;
  } else {
    await postFinanceSecData(req, res);
    return;
  }
});
