const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");

let TABLE_NAMES = {
    PO_CATEGORY_MASTER: `mommpcat`,
};

// const getPoCategoryDataOnQuery = async (req, res) => {
//     if (
//         !req?.query?.get_data === "Query" ||
//         !req?.query?.get_data === "Insert"
//     ) {
//         return res
//             .status(404)
//             .json({
//                 message:
//                     "Query Data cannot be provided contact to administrator",
//             });
//     }
//     try {
//         const getData = await db.query(
//             `select * from ${TABLE_NAMES.PO_CATEGORY_MASTER}  order by create_date ASC`
//         );
//         // getData.rows.map((item)=>({...item,oldPrefix:item.po_cat_prefix}))
//         if (getData.rowCount > 0) {
//             res.status(200).json({
//                 type: "found",
//                 poCategories: [...getData.rows],
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal Error" });
//     }
// };

const getPoCategoryDataOnQuery = async (req, res) => {
  const {formStatus} = req?.query;
    // if (
    //     req?.query?.get_data !== "Query" &&
    //     req?.query?.get_data !== "Insert" 
    // ) {
    //     return res.status(404).json({
    //         message: "Query Data cannot be provided contact to administrator",
    //     });
    // }

    if (
        formStatus !== "Query" &&
        formStatus !== "Insert" &&
        formStatus !== "Search"
    ) {
        return res.status(404).json({
            message: "Invalid form status",
        });
    }

    try {
        const { user_code } = req.query;

        let conditions = [];
        let values = [];

        if (user_code) {
            values.push(user_code);
            conditions.push(`user_code = $${values.length}`);
        }

        let whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const getData = await db.query(
            `SELECT * FROM ${TABLE_NAMES.PO_CATEGORY_MASTER}
             ${whereClause}
             ORDER BY create_date ASC`,
            values
        );

        if (getData.rowCount > 0) {
            res.status(200).json({
                type: "found",
                poCategories: getData.rows,
            });
        } else {
            res.status(200).json({
                type: "not_found",
                poCategories: [],
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Error" });
    }
};




const postPoCategory = async (req, res) => {
    let poCategoryDetails = [...req?.body.poCategory];
    if (!poCategoryDetails.length) {
        return res.status(404).json({ message: "please insert new Record" });
    }
    try {
        await db.query("Begin");

        for (const [index, record] of poCategoryDetails.entries()) {
            try {
                const queryForInsert = generateSingleInsertQuery(
                    TABLE_NAMES.PO_CATEGORY_MASTER,
                    record,
                    "create_date"
                );

                const valuesForInsertQuery = Object.values(record);
                console.log("exp detail query", queryForInsert);
                console.log("exp detail insert query", valuesForInsertQuery);
                await db.query(queryForInsert, [...valuesForInsertQuery]);
            } catch (error) {
                // Handle individual record insert error
                console.error(
                    `Error inserting record at index ${index}:`,
                    error
                );
                throw Error(error);
            }
        }

        await db.query("COMMIT"); // for the time being
        res.json({ type: "created" });
    } catch (error) {
        console.error(error);
        await db.query("ROLLBACK");
        res.status(500).json({ message: error.message });
    }
};

// const updatePoCategory = async (req, res) => {
//     const deletedRecords = req?.body?.deletedPoCategory || [];
//     const updatedRecords = req?.body?.updatedPoCategory || [];
//     const newRecords = req?.body?.newPoCategory || [];

//     try {
//         await db.query("BEGIN");

//         // Insert New Records
//         if (newRecords.length) {
//             for (const [index, record] of newRecords.entries()) {
//                 try {
//                     const queryForInsert = generateSingleInsertQuery(
//                         TABLE_NAMES.PO_CATEGORY_MASTER,
//                         record,
//                         "create_date"
//                     );
//                     const valuesForInsertQuery = Object.values(record);
//                     console.log("Insert query:", queryForInsert);
//                     await db.query(queryForInsert, valuesForInsertQuery);
//                 } catch (error) {
//                     console.error(`Error inserting record at index ${index}:`, error);
//                     throw Error(`Insertion failed for record at index ${index}`);
//                 }
//             }
//         }

//         // Update Existing Records
//         if (updatedRecords.length) {
//             for (const [index, record] of updatedRecords.entries()) {
//                 const columns = Object.keys(record);
//                 const values = Object.values(record);

//                 // Create SET clause for SQL UPDATE query
//                 const setClause = columns
//                     .map((column, idx) => `${column} = $${idx + 1}`)
//                     .join(", ");
                
//                 const query = `UPDATE ${TABLE_NAMES.PO_CATEGORY_MASTER} SET ${setClause} WHERE po_cat_prefix = $${columns.length + 1}`;

//                 try {
//                     await db.query(query, [...values, record.po_cat_prefix]);
//                 } catch (error) {
//                     console.error(`Error updating record at index ${index}:`, error);
//                     throw Error(`Update failed for record at index ${index}`);
//                 }
//             }
//         }

//         // Delete Records
//         if (deletedRecords.length) {
//             for (const [index, record] of deletedRecords.entries()) {
//                 const deleteQuery = `DELETE FROM ${TABLE_NAMES.PO_CATEGORY_MASTER} WHERE po_cat_prefix = $1 AND po_cat_description = $2`;
//                 try {
//                     await db.query(deleteQuery, [record.po_cat_prefix, record.po_cat_description]);
//                 } catch (error) {
//                     console.error(`Error deleting record at index ${index}:`, error);
//                     throw Error(`Deletion failed for record at index ${index}`);
//                 }
//             }
//         }

//         await db.query("COMMIT"); // Commit if everything succeeds
//         res.status(200).json({ message: "Update successful" });
//     } catch (error) {
//         console.error(error);
//         await db.query("ROLLBACK"); // Rollback if something fails
//         res.status(500).json({ message: error.message || "Internal Server Error" });
//     }
// };

  const updatePoCategory = async (req, res) => {
  const deletedRecords = req?.body?.deletedPoCategory || [];
  const updatedRecords = req?.body?.updatedPoCategory || [];
  const newRecords = req?.body?.newPoCategory || [];

  try {
    await db.query("BEGIN");

    // Insert New Records
    if (newRecords.length) {
      for (const [index, record] of newRecords.entries()) {
        try {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.PO_CATEGORY_MASTER,
            record,
            "create_date"
          );
          const valuesForInsertQuery = Object.values(record);
          console.log("Insert query:", queryForInsert);
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(`Error inserting record at index ${index}:`, error);
          throw Error(`Insertion failed for record at index ${index}`);
        }
      }
    }

    // Update Existing Records
    if (updatedRecords.length) {
      for (const [index, record] of updatedRecords.entries()) {
        console.log(record)
       const { original_po_cat_prefix, ...updatedRecord } = record;
       delete record?.updatedRecord;
        const columns = Object.keys(updatedRecord);
        const values = Object.values(updatedRecord);

        // console.log(oldPrefix, updatedRecord)

        delete record.original_po_cat_prefix;

        // Create SET clause for SQL UPDATE query
        const setClause = columns
          .map((column, idx) => `${column} = $${idx + 1}`)
          .join(", ");

        const query = `UPDATE ${TABLE_NAMES.PO_CATEGORY_MASTER} SET ${setClause} WHERE po_cat_prefix = $${columns.length + 1}`;

        try {
          await db.query(query, [...values,original_po_cat_prefix ]);
        } catch (error) {
          console.error(`Error updating record at index ${index}:`, error);
          throw Error(`Update failed for record at index ${index}`);
        }
      }
    }

    // Delete Records
    if (deletedRecords.length) {
      for (const [index, record] of deletedRecords.entries()) {
        const deleteQuery = `DELETE FROM ${TABLE_NAMES.PO_CATEGORY_MASTER} WHERE po_cat_prefix = $1 AND po_cat_description = $2`;
        try {
          await db.query(deleteQuery, [record.po_cat_prefix, record.po_cat_description]);
        } catch (error) {
          console.error(`Error deleting record at index ${index}:`, error);
          throw Error(`Deletion failed for record at index ${index}`);
        }
      }
    }

    await db.query("COMMIT");
    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
    };



exports.handleFormOperation = catchAsync(async (req, res, next) => {
    // if (req?.query?.get_data) {
    //     await getPoCategoryDataOnQuery(req, res);
    //     return;
    // }
     if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getPoCategoryDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updatePoCategory(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postPoCategory(req, res);
        return;
    }
});
