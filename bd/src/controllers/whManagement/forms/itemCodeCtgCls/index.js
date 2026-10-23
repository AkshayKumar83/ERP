

const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformMoitgencodeToDbData } = require("./presentation");

let TABLE_NAMES = {
    ITEM_CODE_CTG_CLS: `MOITGENCODE`,
};
   
//    new version code and updated

const getDataOnQuery = async (req, res) => {
  try {
    const queryParameter = `ORDER BY cat_desc`;
    //   const { level1: level1Param, level2: level2Param, level3: level3Param } = req.query;

    const glRollUpData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.ITEM_CODE_CTG_CLS} ${queryParameter}`
    );

    if (glRollUpData.rows.length === 0) {
      return res.send({ type: "not found", glRollUpMstr: null });
    }

    const level1desc = await db.query(`
                select cat_desc ,level1 from MOITGENCODE
              where LEVEL2 IS NULL AND LEVEL3 IS NULL AND LEVEL4 IS NULL
              ORDER BY level1 ASC;
            `);

    const level2desc = await db.query(`
                SELECT DISTINCT level1, level2, cat_desc 
                FROM MOITGENCODE
                WHERE level2 IS NOT NULL AND level3 IS NULL AND level4 IS NULL
                ORDER BY level1, level2;
              `);

    const level3desc = await db.query(`
                SELECT DISTINCT level1, level2, level3, cat_desc 
                FROM MOITGENCODE
                WHERE level3 IS NOT NULL AND level4 IS NULL
                ORDER BY level2, level3;

              `);

    const level4desc = await db.query(`
                SELECT DISTINCT level1, level2, level3, level4, cat_desc 
                  FROM MOITGENCODE
                  WHERE level4 IS NOT NULL
                  ORDER BY level3, level4;

              `);

    const response = {
      type: "found",
      glRollUpMstr: glRollUpData.rows || [],
      level1List: level1desc.rows || [],
      level2List: level2desc.rows || [],
      level3List: level3desc.rows || [],
      level4List: level4desc.rows || [],
    };

    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error On Query" });
  }
};

const insertFormData = async (req, res) => {
  try {
    console.log("Starting transaction");
    await db.query("BEGIN");

    const { data, form_status } = req.body;
    console.log("Received data:", JSON.stringify(data, null, 2));
    console.log("form_status:", form_status);

    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid data format");
    }

    let insertedCount = 0;
    let skippedCount = 0;

    console.log(`Processing ${data.length} rows`);
    for (const row of data) {
      const { level1, level2, level3, level4, cat_desc } = row;
      console.log(`Processing row:`, {
        level1,
        level2,
        level3,
        level4,
        cat_desc,
      });

      // Check for duplicates with type casting for null
      const checkQuery = `
              SELECT 1 FROM ${TABLE_NAMES.ITEM_CODE_CTG_CLS}
              WHERE level1 = $1
              AND (level2 IS NULL AND $2::VARCHAR IS NULL OR level2 = $2::VARCHAR)
              AND (level3 IS NULL AND $3::VARCHAR IS NULL OR level3 = $3::VARCHAR)
              AND (level4 IS NULL AND $4::VARCHAR IS NULL OR level4 = $4::VARCHAR)
            `;
      try {
        const checkResult = await db.query(checkQuery, [
          level1,
          level2,
          level3,
          level4,
        ]);
        if (checkResult.rows.length > 0) {
          console.log(`Skipping duplicate row:`, {
            level1,
            level2,
            level3,
            level4,
            cat_desc,
          });
          skippedCount++;
          continue;
        }
      } catch (checkError) {
        console.error(`Duplicate check error for row:`, row, checkError.stack);
        throw checkError;
      }

      delete row?.isNew;
      delete row?.isAlreadyExist;

      const query = generateSingleInsertQuery(TABLE_NAMES.ITEM_CODE_CTG_CLS, row);
      const values = Object.values(row);
      console.log(`Insert query:`, query);
      console.log(`Query values:`, values);

      try {
        const insertResult = await db.query(query, values);
        console.log(`Inserted row, rows affected:`, insertResult.rowCount);
        insertedCount += insertResult.rowCount;
      } catch (insertError) {
        console.error(`Insert error for row:`, row, insertError.stack);
        throw insertError;
      }
    }

    console.log(
      `Transaction summary: ${insertedCount} rows inserted, ${skippedCount} rows skipped`
    );
    if (insertedCount === 0 && skippedCount === data.length) {
      throw new Error(
        "All rows are duplicates and were skipped. No new records were inserted."
      );
    }

    console.log("Committing transaction");
    await db.query("COMMIT");
    console.log("Transaction committed successfully");

    res.status(200).json({
      message: `Inserted ${insertedCount} records successfully, skipped ${skippedCount} duplicates`,
      inserted: insertedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Insert error:", error.stack);
    await db.query("ROLLBACK");
    console.log("Transaction rolled back");
    res.status(500).json({ message: error.message });
  }
};

const updateFormData = async (req, res) => {
  let { data, deletedData } = req.body;

  // Remove isAlreadyExist from all items
  data = data.map((item) => {
    delete item.isAlreadyExist;
    return item;
  });

  try {
    await db.query("BEGIN");

    // Helper function to check if record exists
    async function recordExists(level1, level2, level3, level4) {
      let query = `SELECT 1 FROM MOITGENCODE WHERE level1 = $1 AND level2 = $2`;
      const params = [level1, level2];
      let index = 3;

      if (level3 !== null && level3 !== undefined) {
        query += ` AND level3 = $${index++}`;
        params.push(level3);
      } else {
        query += ` AND level3 IS NULL`;
      }

      if (level4 !== null && level4 !== undefined) {
        query += ` AND level4 = $${index++}`;
        params.push(level4);
      } else {
        query += ` AND level4 IS NULL`;
      }

      const result = await db.query(query, params);
      return result.rowCount > 0;
    }

    // Helper function to update record
    async function updateRecord(item) {
      let query = `UPDATE MOITGENCODE SET cat_desc = $1 WHERE level1 = $2 AND level2 = $3`;
      const params = [item.cat_desc, item.level1, item.level2];
      let index = 4;

      if (item.level3 !== null && item.level3 !== undefined) {
        query += ` AND level3 = $${index++}`;
        params.push(item.level3);
      } else {
        query += ` AND level3 IS NULL`;
      }

      if (item.level4 !== null && item.level4 !== undefined) {
        query += ` AND level4 = $${index++}`;
        params.push(item.level4);
      } else {
        query += ` AND level4 IS NULL`;
      }

      await db.query(query, params);
    }

    // Helper function to insert record
    async function insertRecord(item) {
      await db.query(
        `INSERT INTO MOITGENCODE (level1, level2, level3, level4, cat_desc) VALUES ($1, $2, $3, $4, $5)`,
        [item.level1, item.level2, item.level3, item.level4, item.cat_desc]
      );
    }

    if (deletedData.length) {
      const barrel2Data = deletedData.filter(
        (row) => row?.barrel === "barrelTwo"
      );
      const barrel3Data = deletedData.filter(
        (row) => row?.barrel === "barrelThree"
      );
      const barrel4Data = deletedData.filter(
        (row) => row?.barrel === "barrelFour"
      );

      if (barrel4Data.length) {
        for (const entry of barrel4Data) {
          const { level1, level2, level3, level4 } = entry;
          if (level1 && level2 && level3 && level4) {
            await db.query(
              `delete from MOITGENCODE where level1 = $1
            and level2 = $2
            and level3 = $3
            and level4 = $4`,
              [level1, level2, level3, level4]
            );
          }
        }
      }
      if (barrel3Data.length) {
        for (const entry of barrel3Data) {
          const { level1, level2, level3 } = entry;
          if (level1 && level2 && level3) {
            await db.query(
              `delete from MOITGENCODE where level1 = $1
            and level2 = $2
            and level3 = $3`,
              [level1, level2, level3]
            );
          }
        }
      }
      if (barrel2Data.length) {
        for (const entry of barrel2Data) {
          const { level1, level2 } = entry;
          if (level1 && level2 ) {
            await db.query(
              `delete from MOITGENCODE where level1 = $1
            and level2 = $2`,
              [level1, level2]
            );
          }
        }
      }
    }

    // Filter barrels
    const barrel2 = data.filter(
      (item) => item.level1 && item.level2 && !item.level3 && !item.level4
    );
    const barrel3 = data.filter(
      (item) => item.level1 && item.level2 && item.level3 && !item.level4
    );
    const barrel4 = data.filter(
      (item) => item.level1 && item.level2 && item.level3 && item.level4
    );

    let updatedCount = 0;
    let insertedCount = 0;

    // Generic barrel processor
    async function processBarrel(barrel) {
      for (const item of barrel) {
        const exists = await recordExists(
          item.level1,
          item.level2,
          item.level3,
          item.level4
        );
        if (exists) {
          await updateRecord(item);
          updatedCount++;
        } else {
          await insertRecord(item);
          insertedCount++;
        }
      }
    }

    await processBarrel(barrel2);
    await processBarrel(barrel3);
    await processBarrel(barrel4);

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: `Update: ${updatedCount} updated, ${insertedCount} inserted.`,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update failed:", error.message);
    return res.status(500).json({ type: "error", message: error.message });
  }
};


exports.CheckRecordDeletable = async (req, res) => {
  const { level1, level2, level3, level4, barrel } = req?.query;
  let canDelete = false;
  try {
    if (level1 && level2 && level3 && level4 && barrel == "barrelFour") {
      const result = await db.query(
        `
        SELECT 1 FROM mhfmglm 
        WHERE rollup_acc1 = $1
          AND rollup_acc2 = $2
          AND rollup_acc3 = $3
          AND rollup_acc4 = $4
        LIMIT 1;
        `,
        [level1, level2, level3, level4]
      );

      if (result.rows.length > 0) {
        throw new Error(
          "This Rollup Combination is assigned to an Account Head in GL Master. Please remove it first."
        );
      } else {
        canDelete = true;
      }
    }
    if (level1 && level2 && level3 && barrel == "barrelThree") {
      const result = await db.query(
        `
        SELECT 1 FROM mhfmglm 
        WHERE rollup_acc1 = $1
          AND rollup_acc2 = $2
          AND rollup_acc3 = $3
        LIMIT 1;
        `,
        [level1, level2, level3]
      );

      if (result.rows.length > 0) {
        throw new Error(
          "This Rollup Combination is assigned to an Account Head in GL Master. Please remove it first."
        );
      } else {
        canDelete = true;
      }
    }
    if (level1 && level2 && barrel == "barrelTwo") {
      const result = await db.query(
        `
        SELECT 1 FROM mhfmglm 
        WHERE rollup_acc1 = $1
          AND rollup_acc2 = $2
        LIMIT 1;
        `,
        [level1, level2]
      );

      if (result.rows.length > 0) {
        throw new Error(
          "This Rollup Combination is assigned to an Account Head in GL Master. Please remove it first."
        );
      } else {
        canDelete = true;
      }
    }
    if (level1 && level2 && barrel == "barrelFirst") {
      const result = await db.query(
        `
        SELECT 1 FROM mhfmglm 
        WHERE rollup_acc1 = $1
        LIMIT 1;
        `,
        [level1]
      );

      if (result.rows.length > 0) {
        throw new Error(
          "This Rollup Combination is assigned to an Account Head in GL Master. Please remove it first."
        );
      } else {
        canDelete = true;
      }
    }

    // If no row found, allow deletion
    return res.status(200).json({
      type: "success",
      canDelete,
      message: "",
    });
  } catch (error) {
    console.error("Deletion check error:", error.message);
    return res.status(200).json({
      type: "error",
      canDelete: false,
      message: error.message || "Cannot delete the record.",
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
  if (req?.query?.form_status && req?.query?.form_status === "Insert") {
    await insertFormData(req, res);
  }
});

exports.handleUpdateFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateFormData(req, res);
  }
});

















  // below code is old version 

//    // QueryData Function
   
//     exports.handleFormOperation = catchAsync(async (req, res, next) => {
//       if (req?.query?.get_data) {
//           try {

//               const queryParameter = `ORDER BY cat_desc`;

//                 const itenCodeCtgClsfctnData = await db.query(
//                           `SELECT * FROM ${TABLE_NAMES.ITEM_CODE_CTG_CLS} ${queryParameter}`
//                       );

                      
//             if (itenCodeCtgClsfctnData.rows.length === 0) {
//                 return res.send({ type: "not found", itenCodeCtgClsfctnData: null });
//             }

//             const level1desc = await db.query(`
//             select cat_desc ,level1 from moitgencode
//             where LEVEL2 IS NULL AND LEVEL3 IS NULL AND LEVEL4 IS NULL
//             ORDER BY level1 ASC;
//           `);

//             const level2desc = await db.query(`
//               SELECT DISTINCT level1, level2, cat_desc 
//               FROM moitgencode
//               WHERE level2 IS NOT NULL AND level3 IS NULL AND level4 IS NULL
//               ORDER BY level1, level2;
//             `);

//             const level3desc = await db.query(`
//               SELECT DISTINCT level1, level2, level3, cat_desc 
//               FROM moitgencode
//               WHERE level3 IS NOT NULL AND level4 IS NULL
//               ORDER BY level2, level3;

//             `);

//             const level4desc = await db.query(`
//               SELECT DISTINCT level1, level2, level3, level4, cat_desc 
//                 FROM moitgencode
//                 WHERE level4 IS NOT NULL
//                 ORDER BY level3, level4;
//             `);
                
//             const response= {
//                   type: "found",
//                 itenCodeCtgClsfctnData: itenCodeCtgClsfctnData.rows || [],
//                 level1List: level1desc.rows || [],
//                 level2List: level2desc.rows || [],
//                 level3List: level3desc.rows || [],
//                 level4List: level4desc.rows || [],
//               };
//             return res.send(response);
//           }
//           catch (error) {
//               console.error(error);
//             return res
//                 .status(500)
//                 .send({ message: "Internal Server Error On Query" });
//           }
//       }
//     });

//     // Insert function 
// const insertFormData = async (req, res) => {
//   try {
//     await db.query("BEGIN");

//     const { formData, barrelTwo, barrelThree, barrelFour } = req.body;

//     console.log("Received Data:", formData, barrelTwo, barrelThree, barrelFour);

//     let MOITGENCODE = transformMoitgencodeToDbData(formData, barrelTwo, barrelThree, barrelFour )
//         console.log(MOITGENCODE)
        
//         const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.ITEM_CODE_CTG_CLS,MOITGENCODE);
//         // console.log('queryForInsert', queryForInsert)
    
//         const valuesForInsertQuery = Object.values(MOITGENCODE);
//         // console.log('valuesForInsertQuery', valuesForInsertQuery)
    
//           // inserting header data
//           await db.query(queryForInsert, valuesForInsertQuery);
  
//     await db.query("ROLLBACK");
//     res.status(200).json({ message: "Records inserted successfully" });

//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error("Insert error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

   
//   exports.handleFormOperation = catchAsync(async (req, res, next) => {
//     if (req?.query?.get_data) {
//       await getDataOnQuery(req, res);
//       return;
//     }
//   });

// exports.handlePostFormData = catchAsync(async (req, res, next) => {
//   if (req?.query?.form_status && req?.query?.form_status === "Insert") {
//     await insertFormData(req, res);
//   }
// });

