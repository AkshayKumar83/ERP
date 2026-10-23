
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformMoemcurrData, transformMdemcurrData } = require("./presentation");

const TABLE_NAMES = {
  CURR_MSTR: `MOEMCURR`,
  DTL_MSTR: `MDEMCURR`,
};

const getCurrMstrDataOnQuery = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *, COUNT(*) OVER() AS count 
      FROM ${TABLE_NAMES.CURR_MSTR}
      ORDER BY curr_code
    `);

    const rows = result.rows; 
    const totalCount = rows.length > 0 ? rows[0].count : 0;

    const historyResult = await db.query(`
      SELECT * FROM MDEMCURR order by eff_date DESC`)

    return res.status(200).json({
      type: rows.length > 0 ? "found" : "not_found",
      currMaster: rows,
      historyResult:historyResult.rows,  
      totalCount,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};

  const checkDuplicateCurrencyCode = async (req, res) => {
    try {
      const { curr_code, old_curr_code } = req.query;

      if (!curr_code) {
        return res.status(400).json({ message: "Currency Code cannot be blank" });
      }

    
      if (old_curr_code && curr_code === old_curr_code) {
        return res.status(200).json({ message: "Currency Code unchanged, valid" });
      }

    
      const duplicateCurrCode = `
        SELECT 1 FROM ${TABLE_NAMES.CURR_MSTR}
        WHERE curr_code = $1
      `;
      const result = await db.query(duplicateCurrCode, [curr_code]);

      if (result.rows.length > 0) {
        return res.status(409).json({ message: "Currency Code already exists" });
      }

      return res.status(200).json({ message: "Currency Code is unique" });
    } catch (error) {
      console.error("Error checking duplicate currency code:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    };


    const postFormData = async (req, res) => {
    const { newRecords = [], form_status } = req.body;

    if (!Array.isArray(newRecords) || newRecords.length === 0) {
      return res.status(400).json({ type: "error", message: "No data provided" });
    }

    try {
      await db.query("BEGIN");

      for (const row of newRecords) {
        const transformedMaster = transformMoemcurrData(row);
        const transformedDetail = transformMdemcurrData(row);

        const { curr_code, eff_date, ex_rate, curr_frac, end_date } = transformedDetail;

        // Check the existing eff_date from parameter (same as Oracle :PARAMETER.EFF_DATE)
        const paramEffDate = row.param_eff_date;

        if (paramEffDate !== eff_date && paramEffDate !== null) {
          // ---- CASE 1: eff_date changed => INSERT ----
          const insertDetailQuery = generateSingleInsertQuery(
            TABLE_NAMES.DTL_MSTR,
            transformedDetail
          );
          await db.query(insertDetailQuery, Object.values(transformedDetail));
        } else {
          // ---- CASE 2: eff_date same => Try UPDATE ----
          const updateQuery = `
            UPDATE ${TABLE_NAMES.DTL_MSTR}
            SET rate = $1, curr_frac = $2
            WHERE curr_code = $3 AND eff_date = $4
          `;
          const updateValues = [ex_rate, curr_frac, curr_code, eff_date];
          const updateResult = await db.query(updateQuery, updateValues);

          // If no row was updated => INSERT new record
          if (updateResult.rowCount === 0) {
            console.error(
              `No record found for ${curr_code} | ${eff_date} | rate=${ex_rate} | frac=${curr_frac}`
            );

            const insertQuery = generateSingleInsertQuery(
              TABLE_NAMES.DTL_MSTR,
              transformedDetail
            );
            await db.query(insertQuery, Object.values(transformedDetail));
          }
        }

        // ---- Master Table Insert ----
        const insertMasterQuery = generateSingleInsertQuery(
          TABLE_NAMES.CURR_MSTR,
          transformedMaster
        );
        await db.query(insertMasterQuery, Object.values(transformedMaster));
      }

      await db.query("COMMIT");

      res.status(200).json({
        type: "success",
        message: "Currency data inserted/updated successfully",
      });
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error inserting/updating currency data:", error);
      res.status(500).json({type: 'error', message: error.message || 'Inserting failed'  });
    }
     };

  const updateFormData = async (req, res) => {
    const { newRecords = [], updatedRecords = [], form_status } = req.body;

    if (
      (!Array.isArray(newRecords) || newRecords.length === 0) &&
      (!Array.isArray(updatedRecords) || updatedRecords.length === 0)
    ) {
      return res.status(400).json({ type: "error", message: "No data provided" });
    }

    const normalizeDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : null);

    try {
      await db.query("BEGIN");

      // Handle NEW RECORDS
      for (const row of newRecords) {
        const masterData = transformMoemcurrData(row);
        const detailData = transformMdemcurrData(row);

        // Insert Master
        await db.query(
          generateSingleInsertQuery(TABLE_NAMES.CURR_MSTR, masterData),
          Object.values(masterData)
        );

        // Insert Detail
        await db.query(
          generateSingleInsertQuery(TABLE_NAMES.DTL_MSTR, detailData),
          Object.values(detailData)
        );
      }

      // Handle UPDATED RECORDS
  
      for (const row of updatedRecords) {
        const masterData = transformMoemcurrData(row);
        const detailData = transformMdemcurrData(row);

        const newCode = row.curr_code;
        const oldCode = row.old_curr_code || newCode;

        //  Update Master PK if changed
        if (oldCode !== newCode) {
          // console.log(` PK change detected: ${oldCode} → ${newCode}`);

          // Update Detail FK
          await db.query(
            `UPDATE ${TABLE_NAMES.DTL_MSTR} SET curr_code = $1 WHERE curr_code = $2`,
            [newCode, oldCode]
          );

          // Update Master
          const masterColumns = Object.keys(masterData).filter(
            (c) => c !== "curr_code" && c !== "old_curr_code"
          );
          const masterValues = masterColumns.map((c) => masterData[c]);

          if (masterColumns.length > 0) {
            const setClause = masterColumns
              .map((col, i) => `${col} = $${i + 1}`)
              .join(", ");
            const updateMasterQuery = `
              UPDATE ${TABLE_NAMES.CURR_MSTR}
              SET ${setClause}, curr_code = $${masterColumns.length + 1}
              WHERE curr_code = $${masterColumns.length + 2}
            `;
            await db.query(updateMasterQuery, [...masterValues, newCode, oldCode]);
          }
        } else {
          //  Update Master normally if no PK change
          const masterColumns = Object.keys(masterData).filter(
            (c) => c !== "curr_code" && c !== "old_curr_code"
          );
          const masterValues = masterColumns.map((c) => masterData[c]);

          if (masterColumns.length > 0) {
            const setClause = masterColumns
              .map((col, i) => `${col} = $${i + 1}`)
              .join(", ");
            const updateMasterQuery = `
              UPDATE ${TABLE_NAMES.CURR_MSTR}
              SET ${setClause}
              WHERE curr_code = $${masterColumns.length + 1}
            `;
            await db.query(updateMasterQuery, [...masterValues, newCode]);
          }
        }

        //  Update Detail if exists, else insert
        const detailExists = await db.query(
          `SELECT 1 FROM ${TABLE_NAMES.DTL_MSTR} WHERE curr_code = $1 AND eff_date = $2`,
          [newCode, detailData.eff_date]
        );

        if (detailExists.rowCount === 0) {
          // Only insert if detail truly doesn't exist
          await db.query(
            generateSingleInsertQuery(TABLE_NAMES.DTL_MSTR, detailData),
            Object.values(detailData)
          );
        } else {
          // Update detail normally
          await db.query(
            `
              UPDATE ${TABLE_NAMES.DTL_MSTR}
              SET rate = $1, curr_frac = $2, end_date = $3
              WHERE curr_code = $4 AND eff_date = $5
            `,
            [detailData.rate, detailData.curr_frac, detailData.end_date, newCode, detailData.eff_date]
          );
        }
      }

      await db.query("COMMIT");

      res.status(200).json({
        type: "success",
        message: "Currency data inserted/updated successfully",
      });
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error inserting/updating currency data:", error);
      res.status(500).json({
      type: 'error', message: error.message || 'Update failed' 
      });
    }
    };


  exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (req?.query?.get_data) {
      await getCurrMstrDataOnQuery(req, res);
      return;
    }
    if (req?.query?.curr_code) {
      await checkDuplicateCurrencyCode(req, res);
      return;
    }
  });

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status === "Update") {
    await updateFormData(req, res);
    return;
  }
  if (req?.query?.form_status === "Insert") {
    await postFormData(req, res);
    return;
  }
});























// const { db } = require("../../../../config/dbConnection");
// const catchAsync = require("../../../../utility/catchAsync");
// const { generateSingleInsertQuery } = require("../../../../utility/query");
// const { transformMoemcurrData, transformMdemcurrData } = require("./presentation");

// const TABLE_NAMES = {
//   CURR_MSTR: `MOEMCURR`,
//   DTL_MSTR: `MDEMCURR`,
// };

// const getCurrMstrDataOnQuery = async (req, res) => {
//   if (req?.query?.get_data !== "Query") {
//     return res.status(404).json({
//       message: "Query Data cannot be provided, contact the administrator",
//     });
//   }

//   try {
//     const masterDataResult = await db.query(`
//       SELECT *, COUNT(*) OVER() AS total_count 
//       FROM ${TABLE_NAMES.CURR_MSTR} order by curr_code  
//     `);

//     const currMaster = masterDataResult.rows;
//     const totalCount = masterDataResult.rowCount;

//     if (totalCount > 0) {
//       const currHistryDtl = {};
//       for (const currency of currMaster) {
//         const currCode = currency.curr_code;
//         const historyResult = await db.query(`
//           SELECT * FROM ${TABLE_NAMES.DTL_MSTR} 
//           WHERE curr_code = $1
//           ORDER BY eff_date DESC
//         `, [currCode]);
//         currHistryDtl[currCode] = historyResult.rows;
//       }

//       return res.status(200).json({
//         type: "found",
//         currMaster,
//         currHistryDtl,
//         totalCount,
//       });
//     } else {
//       return res.status(200).json({
//         type: "not_found",
//         currMaster: [],
//         currHistryDtl: {},
//         totalCount: 0,
//         message: "No data found",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error on query" });
//   }
// };



  // const checkDuplicateCurrencyCode = async (req, res) => {
  //   try {
  //     const { curr_code, old_curr_code } = req.query;

  //     if (!curr_code) {
  //       return res.status(400).json({ message: "Currency Code cannot be blank" });
  //     }

    
  //     if (old_curr_code && curr_code === old_curr_code) {
  //       return res.status(200).json({ message: "Currency Code unchanged, valid" });
  //     }

    
  //     const duplicateCurrCode = `
  //       SELECT 1 FROM ${TABLE_NAMES.CURR_MSTR}
  //       WHERE curr_code = $1
  //     `;
  //     const result = await db.query(duplicateCurrCode, [curr_code]);

  //     if (result.rows.length > 0) {
  //       return res.status(409).json({ message: "Currency Code already exists" });
  //     }

  //     return res.status(200).json({ message: "Currency Code is unique" });
  //   } catch (error) {
  //     console.error("Error checking duplicate currency code:", error);
  //     return res.status(500).json({ message: "Internal Server Error" });
  //   }
  //   };


  // const postFormData = async (req, res) => {
  //   const { formData } = req.body;

  //   try {
  //     await db.query('BEGIN');

  //     for (const row of formData) {
  //       const transformedMaster = transformMoemcurrData(row);
  //       const transformedDetail = transformMdemcurrData(row);

  //       const insertRowData = generateSingleInsertQuery(TABLE_NAMES.CURR_MSTR, transformedMaster);
  //       const masterValues = Object.values(transformedMaster);
  //       await db.query(insertRowData, masterValues);

  //       const { curr_code, eff_date } = transformedDetail;
  //       const { rows: existingDtlRows } = await db.query(
  //         `SELECT * FROM ${TABLE_NAMES.DTL_MSTR} WHERE curr_code = $1 AND eff_date = $2`,
  //         [curr_code, eff_date]
  //       );

  //       if (existingDtlRows.length === 0) {
  //         const insertDtlQuery = generateSingleInsertQuery(TABLE_NAMES.DTL_MSTR, transformedDetail);
  //         await db.query(insertDtlQuery, Object.values(transformedDetail));
  //       } else {
  //         const updateResult = await db.query(
  //           `UPDATE ${TABLE_NAMES.DTL_MSTR}
  //           SET rate = $1, curr_frac = $2
  //           WHERE curr_code = $3 AND eff_date = $4`,
  //           [
  //             transformedDetail.rate,
  //             transformedDetail.curr_frac,
  //             transformedDetail.curr_code,
  //             transformedDetail.eff_date,
  //           ]
  //         );

  //         if (updateResult.rowCount === 0) {
  //           const insertDtlQuery = generateSingleInsertQuery(TABLE_NAMES.DTL_MSTR, transformedDetail);
  //           await db.query(insertDtlQuery, Object.values(transformedDetail));
  //         }
  //       }
  //     }

  //     await db.query('COMMIT');
  //     res.status(200).json({ type:"success", message: 'Currency data inserted successfully' });
  //   } catch (error) {
  //     await db.query('ROLLBACK');
  //     console.error('Error inserting currency data:', error);
  //     res.status(500).json({type:"error", message: 'Internal Server Error', error: error.message });
  //   }
  //   };

//     // validate no exact/overlap in MDEMCURR
// // async function validateCurrencyPeriodNoOverlap(db, currCode, newEffDate, newEndDate, excludeOriginal = null) {

// //   const exactParams = [currCode, newEffDate, newEndDate];
// //   let exactQuery = `SELECT COUNT(*)::int AS cnt FROM MDEMCURR
// //                     WHERE curr_code = $1
// //                       AND eff_date = $2
// //                       AND end_date = $3`;
// //   if (excludeOriginal) {
// //     exactQuery += ` AND NOT (eff_date = $4 AND end_date = $5)`;
// //     exactParams.push(excludeOriginal.eff_date, excludeOriginal.end_date);
// //   }
// //   const exactRes = await db.query(exactQuery, exactParams);
// //   if (exactRes.rows[0].cnt > 0) {
// //     const err = new Error('Sales currency details exist between this period. Enter new rates against another period');
// //     err.status = 400;
// //     throw err;
// //   }

// //   // Overlap check
// //   // This checks: existing eff_date or end_date falling inside new period OR new eff_date inside existing period.
// //   const overlapParams = [currCode, newEffDate, newEndDate];
// //   let overlapQuery = `SELECT COUNT(*)::int AS cnt FROM MDEMCURR
// //                       WHERE curr_code = $1`;
// //   if (excludeOriginal) {
// //     overlapQuery += ` AND NOT (eff_date = $4 AND end_date = $5)`;
// //     overlapParams.push(excludeOriginal.eff_date, excludeOriginal.end_date);
// //   }
// //   overlapQuery += ` AND (
// //       (eff_date BETWEEN $2 AND $3)
// //       OR (end_date BETWEEN $2 AND $3)
// //       OR ($2 BETWEEN eff_date AND end_date)
// //   )`;

// //   const overlapRes = await db.query(overlapQuery, overlapParams);
// //   if (overlapRes.rows[0].cnt > 0) {
// //     const err = new Error('Sales currency details exist between this period. Enter a valid period');
// //     err.status = 400;
// //     throw err;
// //   }

// //   return true;
// // }

  
// const updateFormData = async (req, res) => {
//   const { formData = [], deleteData = [] } = req.body;

//   try {
//     await db.query('BEGIN');

//     // Handle Insert/Update for formData
//     for (const row of formData) {

//       // Only process rows that are new or modified
//       // if (row.is_insert || 
//       //     String(row.ex_rate || '') !== String(row.old_ex_rate || '') || 
//       //     String(row.curr_frac || '') !== String(row.old_curr_frac || '') || 
//       //     String(row.end_date || '') !== String(row.old_end_date || '') ||
//       //     String(row.curr_desc || '') !== String(row.old_curr_desc || '') ||
//       //     String(row.curr_sdesc || '') !== String(row.old_curr_sdesc || '') ||
//       //     String(row.curr_customs || '') !== String(row.old_curr_customs || '') ||
//       //     String(row.def_flag || '') !== String(row.old_def_flag || '')) {
//       const isCurrExists = await db.query(`select * from moemcurr where curr_code = $1`,[row?.curr_code])
    
//       const transformedMaster = transformMoemcurrData(row);
//       const transformedDetail = transformMdemcurrData(row);
//       const { curr_code, eff_date } = transformedMaster;

//   //      const excludeOriginal = (row.is_update && row.parameter_eff_date)
//   //   ? { eff_date: row.parameter_eff_date, end_date: row.parameter_end_date || row.old_end_date }
//   //   : null;

//   // // Validate against MDEMCURR before inserting/updating detail
//   // await validateCurrencyPeriodNoOverlap(
//   //   db,
//   //   transformedDetail.curr_code,
//   //   transformedDetail.eff_date,
//   //   transformedDetail.end_date,
//   //   excludeOriginal
//   // );
      
//         // Check if master record exists
//         // const { rows: existingMasterRows } = await db.query(
//         //   `SELECT * FROM ${TABLE_NAMES.CURR_MSTR} WHERE curr_code = $1 AND eff_date = $2`,
//         //   [curr_code, eff_date]
//         // );

//         if (isCurrExists.rowCount === 0) {
//           // Insert new master record
//           const insertMasterQuery = generateSingleInsertQuery(TABLE_NAMES.CURR_MSTR, transformedMaster);
//           await db.query(insertMasterQuery, Object.values(transformedMaster));
//         } else {
//           // Update existing master record
          
//           await db.query(
//             `UPDATE ${TABLE_NAMES.CURR_MSTR}
//              SET curr_desc = $1, curr_sdesc = $2, ex_rate = $3, curr_frac = $4, end_date = $5, 
//                  curr_customs = $6, def_flag = $7, eff_date = $8
//              WHERE curr_code = $9`,
//             [
//               transformedMaster.curr_desc,
//               transformedMaster.curr_sdesc,
//               transformedMaster.ex_rate,
//               transformedMaster.curr_frac,
//               transformedMaster.end_date,
//               transformedMaster.curr_customs,
//               transformedMaster.def_flag,
//               transformedMaster.eff_date,
//               transformedMaster.curr_code,
//             ]
//           );

         
          
//         }

//         // Handle MDEMCURR per postUpdate PL/SQL logic
//         if (row.parameter_eff_date !== row.eff_date && row.parameter_eff_date !== null) {
//           // Insert into MDEMCURR if parameter_eff_date differs
//           const insertDtlQuery = generateSingleInsertQuery(TABLE_NAMES.DTL_MSTR, transformedDetail);
//           await db.query(insertDtlQuery, Object.values(transformedDetail));
//         } else {
//           // Try updating MDEMCURR
//           const updateResult = await db.query(
//             `UPDATE ${TABLE_NAMES.DTL_MSTR}
//              SET rate = $1, curr_frac = $2, end_date = $3
//              WHERE curr_code = $4 AND eff_date = $5`,
//             [
//               transformedDetail.rate,
//               transformedDetail.curr_frac,
//               transformedDetail.end_date,
//               transformedDetail.curr_code,
//               transformedDetail.eff_date,
//             ]
//           );

//           if (updateResult.rowCount === 0) {
//             // Fallback insert if update fails (per PL/SQL)
//             const insertDtlQuery = generateSingleInsertQuery(TABLE_NAMES.DTL_MSTR, transformedDetail);
//             await db.query(insertDtlQuery, Object.values(transformedDetail));
//           }
//         }

//     }

//     // // Handle Delete for deleteData
//     // for (const row of deleteData) {
//     //   const { curr_code, eff_date } = row;
//     //   console.log(`Deleting row: ${curr_code}, ${eff_date}`);

//     //   // Delete from MDEMCURR
//     //   await db.query(
//     //     `DELETE FROM ${TABLE_NAMES.DTL_MSTR} WHERE curr_code = $1 AND eff_date = $2`,
//     //     [curr_code, eff_date]
//     //   );

//     //   // Check if any detail records remain for the currency
//     //   const { rows: remainingDtlRows } = await db.query(
//     //     `SELECT * FROM ${TABLE_NAMES.DTL_MSTR} WHERE curr_code = $1`,
//     //     [curr_code]
//     //   );

//     //   // Delete from MOEMCURR if no detail records remain
//     //   if (remainingDtlRows.length === 0) {
//     //     await db.query(
//     //       `DELETE FROM ${TABLE_NAMES.CURR_MSTR} WHERE curr_code = $1 AND eff_date = $2`,
//     //       [curr_code, eff_date]
//     //     );
//     //   }
//     // }

//     await db.query('commit');
//     res.status(200).json({ type:'success', message: 'Currency data updated successfully' });
//   } catch (error) {
//     await db.query('ROLLBACK');
//     console.error('Error updating currency data:', error);
//     res.status(500).json({type:"error", message: error.message || 'Internal Server Error on submiting', });
//   }
// };

// exports.handleFormOperation = catchAsync(async (req, res, next) => {
//   if (req?.query?.get_data) {
//     await getCurrMstrDataOnQuery(req, res);
//     return;
//   }
//   if (req?.query?.curr_code) {
//     await checkDuplicateCurrencyCode(req, res);
//     return;
//   }
// });

// exports.handlePostFormData = catchAsync(async (req, res, next) => {
//   if (req?.query?.form_status === "Update") {
//     await updateFormData(req, res);
//     return;
//   }
//   if (req?.query?.form_status === "Insert") {
//     await postFormData(req, res);
//     return;
//   }
// });