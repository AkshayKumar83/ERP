 
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformPhyinvUploadToDbData } = require("./presentation");
const upload = multer({ dest: "uploads/" }); // temp folder me file save hogi

 

let TABLE_NAMES = {
    UPLOAD_PHY_INV: `TEMP_PHYINV_UPLOAD`,  
};



// const getDataOnQuery = async (req, res) => {
//   try {
//     const action = req?.query?.get_data || "Query";
//     const offset = Number(req.query.offset || 0);
//     let dataCount = 0;
//     let groupIndex = offset;

//     // Get all unique WC_ID groups
//     const { rows: groups } = await db.query(`
//       SELECT wc_id, MIN(rec_id::int) AS first_rec_id
//       FROM ${TABLE_NAMES.UPLOAD_PHY_INV}
//       GROUP BY wc_id
//       ORDER BY first_rec_id;
//     `);

//     if (groups.length === 0) {
//       return res.status(200).json({
//         type: "not_found",
//         headerData: null,
//         rows: [],
//         count: 0,
//         message: "No data found",
//       });
//     }

//     dataCount = groups.length;

//     //  Determine which group to show
//     if (action === "First") groupIndex = 0;
//     else if (action === "Last") groupIndex = groups.length - 1;
//     else if (action === "Next") groupIndex = Math.min(groups.length - 1, offset + 1);
//     else if (action === "Prev") groupIndex = Math.max(0, offset - 1);
//     else groupIndex = offset;

//     const { wc_id } = groups[groupIndex];

//     // Fetch all rows for that WC_ID only
//     const allRecords = await db.query(
//       `
//       SELECT 
//         t.*, 
//         i.it_name, 
//         i.um_code, 
//         w.wc_no
//       FROM ${TABLE_NAMES.UPLOAD_PHY_INV} t
//       LEFT JOIN mommitem i ON i.it_code = t.it_code
//       LEFT JOIN mommwc w ON w.wc_id = t.wc_id
//       WHERE t.wc_id = $1
//       ORDER BY t.rec_id::int, t.it_code;
//       `,
//       [wc_id]
//     );

//     if (allRecords.rowCount === 0) {
//       return res.status(200).json({
//         type: "not_found",
//         headerData: null,
//         rows: [],
//         count: dataCount,
//         message: "No records found for this WC_ID.",
//       });
//     }

//     // Prepare Header Data
//     const header = allRecords.rows[0];
//     const headerData = {
//       wc_no: header.wc_no || "",
//       wc_id,
//       file_name: header.file_name || "",
//       inv_date: header.inv_date,
//       inv_month: header.inv_month,
//     };

//     //  Prepare all row data
//     const rows = allRecords.rows.map((r) => ({
//       rec_id: r.rec_id,
//       it_code: r.it_code,
//       batch_no: r.batch_no,
//       batch_date: r.batch_date,
//       make: r.make,
//       qty: r.qty,
//       it_name: r.it_name,
//       um_code: r.um_code,
//     }));

//     return res.status(200).json({
//       type: "found",
//       headerData,
//       rows,
//       count: dataCount,
//     });
//   } catch (error) {
//     console.error(" Error in getDataOnQuery:", error);
//     return res
//       .status(500)
//       .json({ message: "Internal server error on query", error });
//   }
// };


   // helplist



   const helpListData = async (req, res) => {
  try {
    const { form_status, help_list, appDivisionId, appFinYear, appUserId, it_code,
    } = req?.query;

    // For Work Center help
    if (help_list === "WcNo") {
      const wcList = await db.query(
        `
        SELECT wc_no, wc_id
        FROM mommwc
        WHERE division_id = $1
        UNION
        SELECT w.wc_no, w.wc_id
        FROM mommwc w
        JOIN moitparmdiv m 
          ON m.division_id = w.division_id
         AND m.floor_stock_wc_id = w.wc_id
        WHERE w.division_id = $1
        ORDER BY wc_no;
        `,
        [appDivisionId]
      );

      return res.status(200).json(wcList.rows);
    }

    // For Item help
    if (help_list === "item") {
      const itemList = await db.query(
      ` SELECT it_code, it_name
        FROM mommitem a
        WHERE NOT EXISTS (
          SELECT 1 
          FROM temp_phyinv_upload b
          WHERE a.it_code = b.it_code
        )
        ORDER BY it_name;
        `
      );

      return res.status(200).json(itemList.rows);
    }

    //  Default empty response
    return res.status(200).json([]);
  } catch (error) {
    console.error("Error in helpListData:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
      };

  exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
    try {
           
      let months = [];

      // Fetch month list (no condition)
      const monthResult = await db.query(
        ` select cmonth, month from vwmonths `);
          months = monthResult.rows;


      return res.status(200).json({
        success: true,
        invMonths: months,
      });
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dropdown data",
        error: error.message,
      });
    }
   });

  exports.handleFormOperation = catchAsync(async (req, res, next) => {
          //   if (["Query", "Search"].includes(req?.query?.formStatus)) {
          //     await getDataOnQuery(req, res);
          //     return;
          // }

          if (req?.query?.help_list) {
          await helpListData(req, res);
          return;
        }
      });


  // const postUploadPhyInvData = async (req, res) => {
  //   try {
  //       const { rows } = req.body;
  //       await db.query("BEGIN");

  //     if (!rows || rows.length === 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "No data received for insert.",
  //       });
  //     }

  //     for (const row of rows) {
  //       if (row.isStatus !== "new") continue;

  //       //  Find last rec_id for same wc_id
  //       const { rows: lastRec } = await db.query(
  //         `SELECT COALESCE(MAX(rec_id::int), 0) AS last_id 
  //         FROM ${TABLE_NAMES.UPLOAD_PHY_INV}
  //         WHERE wc_id = $1`,
  //         [row.wc_id]
  //       );

  //       const nextRecId = (lastRec[0]?.last_id || 0) + 1;

  //       //  Prepare final insert data (using helper)
  //       const invRow = transformPhyinvUploadToDbData({ ...row,rec_id: nextRecId,});
  //       // Generate insert query dynamically
  //       const insertQuery = generateSingleInsertQuery(
  //         TABLE_NAMES.UPLOAD_PHY_INV,
  //         invRow
  //       );
  //       const values = Object.values(invRow);

  //       await db.query(insertQuery, values);
  //     }

  //     await db.query("COMMIT");

  //     return res.status(200).json({
  //       success: true,
  //       message: "Upload Physical Inventory data saved successfully!",
  //     });
  //   } catch (err) {
  //     await db.query("ROLLBACK");
  //     console.error(" Inventory Insert Error:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: err.message || "Failed to save physical inventory data.",
  //     });
  //   }
  // };


    exports.uploadExcelToTempTable = async (req, res) => {
      const path = require("path");
      try {
        const { inv_date, inv_month, wc_id, user_id, file_name, formStatus } = req.body;

        // formStatus must be 'Update'
        if (formStatus !== "Update") {
          return res.status(400).json({
            success: false,
            message: "Upload allowed only in UPDATE mode.",
          });
        }

        // file must exist in request
        const filePath = req.file?.path;
        const originalName = req.file?.originalname;
        if (!filePath) {
          return res.status(400).json({
            success: false,
            message: "No file uploaded.",
          });
        }

        // basic header validations
        if (!inv_date) {
          return res.status(400).json({
            success: false,
            message: "Inventory date cannot be left blank.",
          });
        }
        if (!inv_month) {
          return res.status(400).json({
            success: false,
            message: "Inventory Month cannot be left blank.",
          });
        }
        if (!wc_id) {
          return res.status(400).json({
            success: false,
            message: "Work Center cannot be left blank.",
          });
        }

        // Determine final file_name to store: prefer body.file_name, else uploaded original name, else basename(filePath)
        const finalFileName = (file_name && String(file_name).trim()) || originalName || path.basename(filePath);

        //  Check if same file already uploaded
        const { rows: existing } = await db.query(
          `SELECT 1 FROM temp_phyinv_upload WHERE file_name = $1 LIMIT 1`,
          [finalFileName]
        );

        if (existing.length > 0) {
          // remove temp uploaded file from disk
          try { fs.unlinkSync(filePath); } catch (e) {}
          return res.status(400).json({
            success: false,
            message:
              "Please use SHOW UPLOADED DATA button to see the already uploaded data.",
          });
        }

        // Read CSV into memory (array of rows)
        const results = await new Promise((resolve, reject) => {
          const rows = [];
          fs.createReadStream(filePath)
            .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
            .on("data", (data) => rows.push(data))
            .on("end", () => resolve(rows))
            .on("error", (err) => reject(err));
        });

        // If no rows found
        if (!Array.isArray(results) || results.length === 0) {
          // cleanup file
          try { fs.unlinkSync(filePath); } catch (e) {}
          return res.status(200).json({
            success: false,
            message: "File uploaded contains no record.",
            rowCount: 0,
          });
        }

        // helpers
        const formatBatchDate = (dateStr) => {
          if (!dateStr) return null;
          const clean = String(dateStr).split(" ")[0].trim();
          const parts = clean.includes(".") ? clean.split(".") : clean.split("-");
          if (parts.length !== 3) return clean;
          const [dd, mm, yyyy] = parts;
          return `${dd.padStart(2, "0")}.${mm.padStart(2, "0")}.${yyyy}`;
        };

              const toPgTimestamp = (dateStr) => {
              if (!dateStr) return null;

              // 1) If input is already YYYY-MM-DD
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return `${dateStr} 00:00:00`;
              }

              // 2) If input is DD.MM.YYYY
              if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
                const [dd, mm, yyyy] = dateStr.split(".");
                return `${yyyy}-${mm}-${dd} 00:00:00`;
              }

              // 3) If input is DD-MM-YYYY
              if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
                const [dd, mm, yyyy] = dateStr.split("-");
                return `${yyyy}-${mm}-${dd} 00:00:00`;
              }

              // 4) Fallback: let JS try to parse
              const d = new Date(dateStr);
              if (!isNaN(d)) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd} 00:00:00`;
              }

              return null;
            };


        // Start DB transaction
        await db.query("BEGIN");
        try {
          // iterate and insert each row
          for (const row of results) {
            const rec_id = row["sr no"] || row["rec_id"] || null;
            const it_code = row["item code"] || row["it_code"] || null;
            const batch_no = row["batch no"] || row["batch_no"] || null;
            const batch_date = formatBatchDate(row["batch date"] || row["batch_date"] || null);
            const make = row["make"] || null;
            const qtyRaw = row["qty"] || row["quantity"] || null;
            const qty = qtyRaw !== null && qtyRaw !== undefined && qtyRaw !== "" ? qtyRaw : null;

            const invdate = toPgTimestamp(inv_date);
            const invmonth = inv_month ? parseInt(inv_month, 10) : null;
            const wcid = wc_id || row["wc id"] || null;
            const userid = user_id || row["user id"] || null;

            // Insert parameterized - file_name = finalFileName
            await db.query(
              `INSERT INTO temp_phyinv_upload
                (rec_id, it_code, batch_no, batch_date, make, qty, file_name, wc_id, inv_date, inv_month, user_id)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
              [
                rec_id,
                it_code,
                batch_no,
                batch_date,
                make,
                qty,
                finalFileName,
                wcid,
                invdate,
                invmonth,
                userid,
              ]
            );
          }

          // Delete blank rows (same as original logic)
          await db.query(`DELETE FROM temp_phyinv_upload WHERE it_code IS NULL;`);

          // Commit
          await db.query("COMMIT");

          // remove uploaded temp file from disk
          try { fs.unlinkSync(filePath); } catch (e) {}

          return res.status(200).json({
            success: true,
            message:
              "Updation of data completed. Please use SHOW UPLOADED DATA to view the data.",
            rowCount: results.length,
            file_name: finalFileName,
          });
        } catch (errInner) {
          // rollback if any insert failed
          await db.query("ROLLBACK");
          try { fs.unlinkSync(filePath); } catch (e) {}
          console.error(" Upload/insertion error:", errInner);
          return res.status(500).json({
            success: false,
            message: "Failed to insert uploaded data.",
            error: errInner.message || errInner,
          });
        }
      } catch (error) {
        console.error(" Upload error:", error);
        return res.status(500).json({
          success: false,
          message: "File upload failed.",
          error: error.message || error,
        });
      }
      };


    exports.handleShowUploadData = async (req, res) => {
      try {
        const { form_status, global_fin_year, file_name, wc_id } = req.body;

        if (!["Update"].includes(form_status)) {  
          return res.status(400).json({
            success: false,
            message: "Show Uploaded Data allowed only in UPDATE mode.",
          });
        }

        if (!file_name || !wc_id) {
          return res.status(400).json({ success: false, message: "File name and WC ID required!" });
        }

        if (!global_fin_year) { 
          return res.status(400).json({
            success: false,
            message: "Global financial year is required!",
          });
        }

        // Fetch uploaded records from temp table
        const { rows: uploadRows } = await db.query(`
          SELECT * FROM temp_phyinv_upload 
          WHERE file_name = $1 AND wc_id = $2 
          ORDER BY rec_id::int, it_code;
        `, [file_name, wc_id]);

        if (uploadRows.length === 0) {
          return res.status(200).json({
            success: false,
            message: "File uploaded contains no record.",
          });
        }
       
        // Loop to fetch IT_NAME and UOM
    const processedRows = [];
    for (const row of uploadRows) {
      const { it_code } = row;
      let it_name = '';
      let uom = null;

      // Check if item exists and fetch it_name
      const { rows: itemDetails } = await db.query(
        `SELECT it_name, um_code FROM mommitem WHERE it_code = $1 LIMIT 1`,
        [it_code]
      );

      if (itemDetails.length > 0) {
        it_name = itemDetails[0].it_name;
        uom = itemDetails[0].um_code;
      } else {
        it_name = 'Invalid Item Code'; 
      }

      // Add to row
      const updatedRow = { ...row, it_name: it_name, uom: uom };
      processedRows.push(updatedRow);
    }

        let err = 0; // invalid item code
        let error = 0; // store not defined
        const invalidItems = [];
        const missingStoreItems = [];

        // Check invalid item codes
        for (const row of uploadRows) {
          const { it_code } = row;

          const { rows: itemExist } = await db.query(
            `SELECT 1 FROM mommitem WHERE it_code = $1 LIMIT 1`,
            [it_code]
          );

          if (itemExist.length === 0) {
            invalidItems.push(it_code);
            err = 1;
          }
        }

        // Check for store definition (mommstok)
        for (const row of uploadRows) {
          const { it_code, wc_id: rowWcId } = row;  

          const { rows: storeExist } = await db.query(
            `SELECT 1
            FROM mommitem m
            JOIN mommstok s ON m.it_code = s.it_code
            WHERE m.it_code = $1
              AND s.wc_id = $2
              AND s.trans_year = $3`,
            [it_code, rowWcId, global_fin_year]
          );

          if (storeExist.length === 0) {
            missingStoreItems.push(it_code);
            error = 1;
          }
        }

        // Oracle-style error messages
        const responseMessages = [];

        if (err === 1) {
          responseMessages.push(
            "The excel uploaded contains invalid item codes, displayed in red.\n" +
              "You can not proceed further till corrections are made\n" +
              "in the excel file and file uploading done again."
          );
        }

        if (error === 1) {
          responseMessages.push(
            "The excel uploaded consists of items whose store is not defined in Item Master, displayed in blue.\n" +
              "You can not proceed further till corrections are made\n" +
              "in the excel file and file uploading done again."
          );
        }

        // Final response
        return res.status(200).json({
          success: true,
          message: responseMessages.join("\n\n") ||  "All uploaded data is valid. You may proceed.",
          invalidItems,
          missingStoreItems,
          showGenerateButton: err === 0 && error === 0,
          // rows: uploadRows,
          rows: processedRows,
        });
      } catch (error) {
        console.error("Error in handleShowUploadData:", error);
        return res.status(500).json({
          success: false,
          message: "Error while verifying uploaded data.",
          error: error.message,
        });
      }
     };



  exports.generateExceptionCSV = async (req, res) => {
    try {
      const { file_name, fin_year, wc_id } = req.body;

      if (!file_name) {
        return res.status(400).json({ success: false, message: "file_name is required!" });
      }
      if (!fin_year) {
        return res.status(400).json({ success: false, message: "Financial year is required!" });
      }
      if (!wc_id) {
        return res.status(400).json({ success: false, message: "WC ID is required!" });
      }

      const query = `
        SELECT it_code, 'Invalid Item Code' AS it_type
        FROM temp_phyinv_upload t
        WHERE file_name = $1 AND wc_id = $3
        AND NOT EXISTS (SELECT 1 FROM mommitem m WHERE t.it_code = m.it_code)

        UNION

        SELECT DISTINCT it_code, 'Store Not defined' AS it_type
        FROM temp_phyinv_upload t
        WHERE file_name = $1 AND wc_id = $3
        AND NOT EXISTS (
          SELECT 1
          FROM mommitem m
          JOIN mommstok o ON m.it_code = o.it_code
          WHERE t.it_code = m.it_code
          AND o.trans_year = $2
          AND t.wc_id = o.wc_id
        )

        UNION

        SELECT it_code, 'Negative Qty' AS it_type
        FROM temp_phyinv_upload
        WHERE file_name = $1 AND wc_id = $3
        AND qty::numeric < 0

        ORDER BY it_type;
      `;

      const result = await db.query(query, [file_name, fin_year, wc_id]);
      const rows = result.rows;

      if (rows.length === 0) {
        return res.json({
          success: true,
          message: "No exceptions found!",
          file_url: null,
        });
      }

      // fetch item names
      const processedRows = [];
      for (const row of rows) {
        const { rows: det } = await db.query(
          `SELECT it_name FROM mommitem WHERE it_code = $1 LIMIT 1`,
          [row.it_code]
        );

        processedRows.push({
          ...row,
          item_name: det.length ? det[0].it_name : "",
        });
      }

      // CSV folder path in BACKEND/downloads
      const csvPath = path.join(global.appRoot, "downloads");
      if (!fs.existsSync(csvPath)) fs.mkdirSync(csvPath);

      const timeStamp = new Date().toISOString().slice(11, 19).replace(/:/g, "");
      const fname = `${timeStamp}-phy_DATEWISE.csv`;

      const fullPath = path.join(csvPath, fname);

      // CSV create
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.write(`Item Code,Item Name,Error Type\n`);

      processedRows.forEach((row) => {
        writeStream.write(
          `${row.it_code},${(row.item_name || "").replace(/,/g, "")},${row.it_type}\n`
        );
      });

      writeStream.end();

      res.json({
        success: true,
        file_url: `http://localhost:3080/downloads/${fname}`,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error generating CSV",
        error: err.message,
      });
    }
  };


     exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await handleUploadToMainTable(req, res);
        return;
    }
    // if (req?.query?.form_status === "Insert") {
    //     await postUploadPhyInvData(req, res);
    //     return;
    // }
    });
    
 const handleUploadToMainTable = async (req, res) => {
    let nCOUNT = 0;
    let last_it_code = null;
    let seq_TOMMPINV_PINV_ID = null;
    let cStore_process = null;

    try {
      await db.query("BEGIN"); // Start transaction

      const { inv_month, inv_date, wc_id, trans_year, rows } = req.body;

      if (!inv_month || !inv_date || !wc_id || !trans_year || !rows || rows.length === 0) {
        throw new Error("inv_month, inv_date, wc_id, trans_year, and rows required!");
      }

      // Fetch store_process
      const { rows: wcRows } = await db.query(
        `SELECT store_process FROM mommwc WHERE wc_id = $1`,
        [wc_id]
      );
      if (wcRows.length === 0) {
        throw new Error("Work Center does not exist");
      }
      cStore_process = wcRows[0].store_process;

      // Sort rows by rec_id, it_code (c_header cursor logic)
      const headerRows = rows.sort(
        (a, b) =>
          (parseInt(a.rec_id) || 0) - (parseInt(b.rec_id) || 0) ||
          (a.it_code || "").localeCompare(b.it_code || "")
      );

      // ============ MAIN LOOP - c_header LOGIC ============
      for (const i of headerRows) {
        const qtyNum = Number(i.qty) || 0;
        const batch_no_combined = `${i.batch_no || ""} - ${i.make || ""}`.trim();
        const batch_date = i.batch_date ? new Date(i.batch_date) : null;

        if (i.it_code !== last_it_code) {
          // ===== NEW ITEM: Insert to TOMMPINV, TOMMPINV_BATCH, TDMMPINV =====
          const { rows: seqRows } = await db.query(
            `SELECT nextval('s_tommpinv_pinv_id') AS id`
          );
          seq_TOMMPINV_PINV_ID = seqRows[0].id;

          // Insert TOMMPINV (header)
          await db.query(
            `INSERT INTO tommpinv (it_code, wc_id, trans_year, inv_month, inv_date, it_ok_qty, store_process, pinv_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              i.it_code,
              wc_id,
              trans_year,
              inv_month,
              inv_date,
              qtyNum,
              cStore_process,
              seq_TOMMPINV_PINV_ID,
            ]
          );
          nCOUNT++;

          // Insert TOMMPINV_BATCH (batch level)
          await db.query(
            `INSERT INTO tommpinv_batch (it_code, wc_id, trans_year, inv_month, inv_date, it_ok_qty, batch_no, batch_date, pinv_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              i.it_code,
              wc_id,
              trans_year,
              inv_month,
              inv_date,
              qtyNum,
              batch_no_combined,
              batch_date,
              seq_TOMMPINV_PINV_ID,
            ]
          );
          nCOUNT++;

          // Insert TDMMPINV (daily detail)
          await db.query(
            `INSERT INTO tdmmpinv (pinv_id, wo_id, it_code, qty_ok, qty_rej, batch_no, batch_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              seq_TOMMPINV_PINV_ID,
              wc_id,
              i.it_code,
              qtyNum,
              null,
              batch_no_combined,
              batch_date,
            ]
          );
          nCOUNT++;
        } else {
          // ===== SAME ITEM (DUPLICATE BATCH): Insert batch & daily, save failures =====
          let batchInsertFailed = false;
          let dailyInsertFailed = false;

          // Try batch insert - if fails, save to _failed table (no throw)
          try {
            await db.query(
              `INSERT INTO tommpinv_batch (it_code, wc_id, trans_year, inv_month, inv_date, it_ok_qty, batch_no, batch_date, pinv_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                last_it_code,
                wc_id,
                trans_year,
                inv_month,
                inv_date,
                qtyNum,
                batch_no_combined,
                batch_date,
                seq_TOMMPINV_PINV_ID,
              ]
            );
            nCOUNT++;
          } catch (batchErr) {
            batchInsertFailed = true;
            console.log(`Batch insert failed for ${last_it_code}, saving to _failed table`);
            // Save to failed table
            await db.query(
              `INSERT INTO tommpinv_batch_failed (it_code, wc_id, trans_year, inv_month, inv_date, it_ok_qty, batch_no)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                last_it_code,
                wc_id,
                trans_year,
                inv_month,
                inv_date,
                qtyNum,
                batch_no_combined,
              ]
            );
          }

          // Try daily insert - if fails, save to _failed table (no throw)
          try {
            await db.query(
              `INSERT INTO tdmmpinv (pinv_id, wo_id, it_code, qty_ok, qty_rej, batch_no, batch_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                seq_TOMMPINV_PINV_ID,
                wc_id,
                i.it_code,
                qtyNum,
                null,
                batch_no_combined,
                batch_date,
              ]
            );
            nCOUNT++;
          } catch (dailyErr) {
            dailyInsertFailed = true;
            console.log(`Daily insert failed for ${i.it_code}, saving to _failed table`);
            // Save to failed table
            await db.query(
              `INSERT INTO tdmmpinv_failed (pinv_id, wo_id, it_code, qty_ok, qty_rej, batch_no, batch_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                seq_TOMMPINV_PINV_ID,
                wc_id,
                i.it_code,
                qtyNum,
                null,
                batch_no_combined,
                batch_date,
              ]
            );
          }
        }

        last_it_code = i.it_code;
      }

      // Update it_ok_qty sum in TOMMPINV = SUM of TOMMPINV_BATCH
      await db.query(`
        UPDATE tommpinv a
        SET it_ok_qty = (
          SELECT COALESCE(SUM(b.it_ok_qty), 0)
          FROM tommpinv_batch b
          WHERE b.it_code = a.it_code
            AND b.wc_id = a.wc_id
            AND b.trans_year = a.trans_year
            AND b.inv_month = a.inv_month
            AND b.inv_date = a.inv_date
            AND b.pinv_id = a.pinv_id
        )
      `);

      // ============ c2 CURSOR LOGIC - MISSING ITEMS ============
      if (rows.length > 0) {
        const rowItCodes = rows
          .map((r) => `'${(r.it_code || "").replace(/'/g, "''")}'`)
          .join(",");

        const { rows: missingRows } = await db.query(
          `SELECT it_code, wc_id
           FROM mommstok a
           WHERE trans_year = $1 AND wc_id = $2
           AND it_code NOT IN (${rowItCodes})`,
          [trans_year, wc_id]
        );

        for (const j of missingRows) {
          const { rows: seqRows } = await db.query(
            `SELECT nextval('s_tommpinv_pinv_id') AS id`
          );
          seq_TOMMPINV_PINV_ID = seqRows[0].id;

          // If this fails, it will bubble up to main catch and rollback
          await db.query(
            `INSERT INTO tommpinv (it_code, wc_id, trans_year, inv_month, inv_date, it_ok_qty, store_process, pinv_id)
             VALUES ($1, $2, $3, $4, $5, 0, $6, $7)`,
            [
              j.it_code,
              wc_id,
              trans_year,
              inv_month,
              inv_date,
              cStore_process,
              seq_TOMMPINV_PINV_ID,
            ]
          );
          nCOUNT++;
        }
      }

      // Delete from temporary table
      await db.query(
        `DELETE FROM temp_phyinv_upload
         WHERE inv_month = $1 AND inv_date = $2 AND wc_id = $3`,
        [inv_month, inv_date, wc_id]
      );

      // COMMIT transaction (all changes saved)
      await db.query("commit");

      console.log("Data successfully updated into main table.");
      console.log(`${nCOUNT} Rows successfully Inserted.`);

      return res.json({
        success: true,
        message: "Data successfully updated into main table.",
        insertedRows: nCOUNT,
      });
    } catch (err) {
      // ANY ERROR TRIGGERS ROLLBACK
      try {
        await db.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr.message);
      }

      console.error("Upload error:", err.message);
      return res.status(500).json({
        success: false,
        message: `Error during upload: ${err.message}`,
      });
    }
  };
