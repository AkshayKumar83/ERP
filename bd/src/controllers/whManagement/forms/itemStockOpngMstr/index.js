const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformMommstokForThreeDecimalQuery, transformMommwcToDbData, transformMommstokToDbData, transformMommstokBatchToDbData } = require("./presentation");

let TABLE_NAMES = {
    ITEM_STOCK_HEADER: 'mommwc',
    ITEM_STOCK_DETAIL: 'mommstok',
    ITEM_STOCK_BATCH: 'mommstok_batch',
};


  const getItemStockOpngMstrDataOnQuery = async (req,res) => {
    const { formStatus, appDivisionId, appFinYear, userId } = req.query;
  let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["wc_no"];

      // If any of these searchKeys exist in the query, add them to WHERE clause
      for (const key of searchKeys) {
          if (req.query[key] !== undefined && req.query[key] !== "") {
              whereClauses.push(`${key} = '${req.query[key]}'`);
          }
      }

      // Build WHERE clause dynamically
      let queryValues =
          whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

    let transYear = appFinYear || "2023";
      let divisionId = appDivisionId || 1;
      let user_id = userId || 583;

    try {
      let queryParameter = `ORDER BY wc_no LIMIT 1 OFFSET ${req.query.offset || 0}`;
      let dataCount;

          if (whereClauses.length > 0) {
                      const getCount =   await db.query(
                            `SELECT COUNT(*) 
                            FROM ${TABLE_NAMES.ITEM_STOCK_HEADER} a
                            WHERE a.division_id = $1
                            AND EXISTS (
                              SELECT 1 FROM store s 
                              WHERE s.user_id = $2 
                              AND s.wc_id = a.wc_id
                            ) ${queryValues}`,
                            [appDivisionId, userId]
                          );
                       
                        dataCount = getCount.rows[0]?.count;
                        queryParameter = `${queryValues} ${queryParameter}`;
                    } else {

        switch (req?.query?.get_data) {
                  case "Query":
                  const getCount = await db.query(
                      `SELECT COUNT(*) 
                      FROM ${TABLE_NAMES.ITEM_STOCK_HEADER} a
                      WHERE a.division_id = $1
                      AND EXISTS (
                        SELECT 1 FROM store s 
                        WHERE s.user_id = $2 
                        AND s.wc_id = a.wc_id
                      )`,
                      [appDivisionId, userId]
                    );
                    dataCount = getCount.rows[0]?.count;
                    break;
                  
                  case "Last": {
                      queryParameter = "ORDER BY wc_no DESC LIMIT 1";
                      break;
                  }
                  default:
                      queryParameter = `ORDER BY wc_no LIMIT 1 OFFSET ${req.query.offset || 0}`;
                      break;
              }
            }
              const getItemStockOpnMstrData = await db.query(
                  `SELECT * 
                  FROM ${TABLE_NAMES.ITEM_STOCK_HEADER} a
                  WHERE a.division_id = $1
                  AND EXISTS (
                    SELECT 1 FROM store s 
                    WHERE s.user_id = $2 
                    AND s.wc_id = a.wc_id
                  )
                  ${queryParameter}`,
                  [appDivisionId, userId]
                );

      if (getItemStockOpnMstrData.rowCount === 0) {
        return res.status(200).json({
          type: "not_found",
          itmStockOpnMstr: null,
          count: dataCount,
          message: "No data found",
        });
      }

      const wc_id = getItemStockOpnMstrData.rows[0]?.wc_id;

          //  Get detail rows
      const getItemStockOpnDtlData = await db.query(
        `SELECT * FROM MOMMSTOK WHERE trans_year = $1 AND wc_id = $2 ORDER BY it_code ASC`,
        [appFinYear, wc_id]
      );

      const itemDetails = [];

      // Post query logic (like PL/SQL)
      for (const row of getItemStockOpnDtlData.rows) {
        let item_name = null;
        let catalog_code = null;

        // Get item_name
        const itNameRes = await db.query(
          `SELECT it_name FROM mommitem WHERE it_code = $1`,
          [row.it_code]
        );
        if (itNameRes.rows.length > 0) {
          item_name = itNameRes.rows[0].it_name;
        }

        // Get catalog_code
        const catalogCodeRes = await db.query(
          `SELECT catalog_code FROM mosmprod WHERE it_code = $1`,
          [row.it_code]
        );
        if (catalogCodeRes.rows.length > 0) {
          catalog_code = catalogCodeRes.rows[0].catalog_code;
        }

        // Merge results into the same object
        itemDetails.push({
          ...row,
          item_name,
          catalog_code,
        });
      }

        // get all it_codes for this wc_id
        const itCodes = getItemStockOpnDtlData.rows.map(r => r.it_code);

        let batchStockData = [];
        if (itCodes.length > 0) {
          const batchRes = await db.query(
            `SELECT * FROM ${TABLE_NAMES.ITEM_STOCK_BATCH}
            WHERE trans_year = $1 AND wc_id = $2 AND it_code = ANY($3::text[])`,
            [appFinYear, wc_id, itCodes]
          );

          batchStockData = batchRes.rows;
        }
      return res.status(200).json({
        type: "found",
        itmStockOpnMstr: getItemStockOpnMstrData.rows[0],
        itemDetails,
        batchData:batchStockData || [],
        count: dataCount,
      });
    } catch (error) {
      console.error("Error in getItemStockOpngMstrDataOnQuery:", error);
      return res.status(500).json({ message: "Internal server error on query" });
    }
   };

 const helpListData = async (req, res) => {
  const { form_status, help_list, f_wc_id, appDivisionId, appFinYear, appUserId  } = req?.query;

  // For Update mode
  if (form_status === "Update" && help_list === "item") {
    const item = await db.query(
      `SELECT DISTINCT fc_code, i.it_code, it_name
       FROM mommstok m
       JOIN store w ON m.wc_id = w.wc_id
       JOIN mommitem i ON m.it_code = i.it_code
       WHERE w.wc_id = $1`,
      [f_wc_id]
    );

    return res.status(200).json(item.rows);
  }

  // For Search mode
  if (form_status === "Search" && help_list === "storeNo") {
    const storeNo = await db.query(
      `SELECT wc_id, wc_no
       FROM mommwc a
       WHERE a.division_id = $1
       AND EXISTS (
         SELECT 1 FROM store s 
         WHERE s.user_id = $2 
         AND s.wc_id = a.wc_id
       )ORDER BY wc_id`,
      [appDivisionId, appUserId ]
    );
    return res.status(200).json(storeNo.rows);
  }

  // Default empty
  return res.status(200).send([]);
};


  const checkItemExist = async (req, res) => {
    const { it_code, wc_id, trans_year } = req.query;

    if (!it_code || !wc_id || !trans_year) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    try {
      const checkQuery = await db.query(
        `SELECT COUNT(*) AS count
        FROM mommstok
        WHERE it_code = $1 AND wc_id = $2 AND trans_year = $3`,
        [it_code, wc_id, trans_year]
      );

      const exists = Number(checkQuery.rows[0]?.count) > 0;

      return res.status(200).json({ exists });
    } catch (error) {
      console.error("Error in checkItemExist:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
   };
      

   
 const getItemBatchControlFlag = async (it_code) => {
  const result = await db.query(
    `SELECT get_item_batch_control_flag($1) AS flag`,
    [it_code]
  );
  return result.rows[0]?.flag || 'N';
  };


  const validateBatchQtyFromPayload = async (it_code, yrop_qtyok = 0, yrop_qtyre = 0, batchRows = []) => {
    // Step 0: Check batch control flag from DB
    const flag = await getItemBatchControlFlag(it_code);
    if (flag !== 'Y') return; // skip validation if flag is N

    // Step 1: Sum OK & Reject qty from payload
    const totalOkQty = batchRows.reduce((sum, b) => sum + Number(b.ok_qty || 0), 0);
    const totalRejQty = batchRows.reduce((sum, b) => sum + Number(b.rej_qty || 0), 0);

    // Step 2: Validate OK Qty
    if (totalOkQty === 0 && Number(yrop_qtyok) !== 0) {
      throw new Error(`Item ${it_code}: Batch Ok Qty cannot be zero or null.`);
    }
    if (totalOkQty !== 0 && Number(yrop_qtyok) !== totalOkQty) {
      throw new Error(`Item ${it_code}: Total Ok Batch Qty must equal Year Opening Ok Qty.`);
    }

    // Step 3: Validate Reject Qty
    if (totalRejQty === 0 && Number(yrop_qtyre) !== 0) {
      throw new Error(`Item ${it_code}: Batch Reject Qty cannot be zero or null.`);
    }
    if (totalRejQty !== 0 && Number(yrop_qtyre) !== totalRejQty) {
      throw new Error(`Item ${it_code}: Total Reject Batch Qty must equal Year Opening Reject Qty.`);
    }
   };


const updateItemStockOpnBal = async (req, res) => {
  const { formData, detailData, batchData } = req.body;

  try {
    await db.query("BEGIN");
    const { wc_id } = formData;
    if (!wc_id) throw new Error("Missing wc_id in payload");

     // firstly delete batch data then stock
      for (const row of batchData.delete || []) {
      await db.query(
        `DELETE FROM mommstok_batch
         WHERE batch_no = $1 AND it_code = $2 AND wc_id = $3 AND trans_year = $4`,
        [row.batch_no, row.it_code, row.wc_id, row.trans_year]
      );
    }


    for (const row of detailData.delete || []) {
      await db.query(
        `DELETE FROM mommstok WHERE it_code = $1 AND wc_id = $2 AND trans_year = $3`,
        [row.it_code, row.wc_id, row.trans_year]
      );
    }

    // // STEP 1: Deduplicate items for validation
    // const uniqueItems = new Map(); // it_code => { yrop_qtyok, yrop_qtyre }
    // for (const row of detailData.update || []) {
    //   uniqueItems.set(row.it_code, {
    //     yrop_qtyok: row.yrop_qtyok,
    //     yrop_qtyre: row.yrop_qtyre
    //   });
    // }
    // for (const row of detailData.new || []) {
    //   if (!uniqueItems.has(row.it_code)) {
    //     uniqueItems.set(row.it_code, {
    //       yrop_qtyok: row.yrop_qtyok,
    //       yrop_qtyre: row.yrop_qtyre
    //     });
    //   }
    // }

    // STEP 1: Deduplicate items for validation
   
    const uniqueItems = new Map(); // it_code => { yrop_qtyok, yrop_qtyre }

    // include from detailData
    for (const row of detailData.update || []) {
      uniqueItems.set(row.it_code, {
        yrop_qtyok: row.yrop_qtyok,
        yrop_qtyre: row.yrop_qtyre
      });
    }
    for (const row of detailData.new || []) {
      if (!uniqueItems.has(row.it_code)) {
        uniqueItems.set(row.it_code, {
          yrop_qtyok: row.yrop_qtyok,
          yrop_qtyre: row.yrop_qtyre
        });
      }
    }


  // include from batchData when detailData not present
  for (const row of [...(batchData.new || []), ...(batchData.update || [])]) {
    if (!uniqueItems.has(row.it_code)) {
      // fetch yrop_qtyok/re from DB (since not in detail payload)
      const { rows } = await db.query(
        `SELECT yrop_qtyok, yrop_qtyre FROM mommstok WHERE it_code = $1 AND wc_id = $2 AND trans_year = $3`,
        [row.it_code, row.wc_id, row.trans_year]
      );
      const item = rows[0] || { yrop_qtyok: 0, yrop_qtyre: 0 };
      uniqueItems.set(row.it_code, item);
    }
  }

    // STEP 2: Run payload-based validation for each unique item
      for (const [it_code, data] of uniqueItems.entries()) {
      const relatedBatchRows = [
        ...(batchData.new || []).filter(b => b.it_code === it_code),
        ...(batchData.update || []).filter(b => b.it_code === it_code)
      ];

      // async call to validation with DB function included
      await validateBatchQtyFromPayload(it_code, data.yrop_qtyok, data.yrop_qtyre, relatedBatchRows);
    }

    // STEP 3: DETAIL DATA HANDLING (insert/update/delete)
    for (const row of detailData.new || []) {
      const detailRow = transformMommstokToDbData(row);
      const insertQuery = generateSingleInsertQuery("mommstok", detailRow);
      await db.query(insertQuery, Object.values(detailRow));
    }

    for (const row of detailData.update || []) {
      const detailRow = transformMommstokToDbData(row);
      const updateCols = Object.keys(detailRow).filter(c => !["it_code", "wc_id", "trans_year"].includes(c));
      const updateVals = updateCols.map(c => detailRow[c]);
      const setClause = updateCols.map((c, i) => `${c} = $${i + 1}`).join(", ");

      const updateQuery = `
        UPDATE mommstok
        SET ${setClause}
        WHERE it_code = $${updateCols.length + 1}
          AND wc_id = $${updateCols.length + 2}
          AND trans_year = $${updateCols.length + 3}
      `;
      await db.query(updateQuery, [...updateVals, detailRow.it_code, detailRow.wc_id, detailRow.trans_year]);
    }

 

    // STEP 4: BATCH DATA HANDLING (insert/update/delete)
    for (const row of batchData.new || []) {
      const batchRow = transformMommstokBatchToDbData(row);
      const insertQuery = generateSingleInsertQuery("mommstok_batch", batchRow);
      await db.query(insertQuery, Object.values(batchRow));
    }

    // for (const row of batchData.update || []) {
    //   const batchRow = transformMommstokBatchToDbData(row);
    //   const updateCols = Object.keys(batchRow).filter(c => !["batch_no", "it_code", "wc_id", "trans_year"].includes(c));
    //   const updateVals = updateCols.map(c => batchRow[c]);
    //   const setClause = updateCols.map((c, i) => `${c} = $${i + 1}`).join(", ");

    //   const updateQuery = `
    //     UPDATE mommstok_batch
    //     SET ${setClause}
    //     WHERE batch_no = $${updateCols.length + 1}
    //       AND it_code = $${updateCols.length + 2}
    //       AND wc_id = $${updateCols.length + 3}
    //       AND trans_year = $${updateCols.length + 4}
    //   `;
    //   await db.query(updateQuery, [...updateVals, batchRow.batch_no, batchRow.it_code, batchRow.wc_id, batchRow.trans_year]);
    // }

    for (const row of batchData.update || []) {
  const batchRow = transformMommstokBatchToDbData(row);

  // Agar old_batch_no diya gaya hai to usko use karo warna current batch_no lo
  const whereBatchNo = row.old_batch_no || row.batch_no;

  const updateCols = Object.keys(batchRow).filter(
    c => !["batch_no", "it_code", "wc_id", "trans_year"].includes(c)
  );
  const updateVals = updateCols.map(c => batchRow[c]);
  const setClause = updateCols.map((c, i) => `${c} = $${i + 1}`).join(", ");

  const updateQuery = `
    UPDATE mommstok_batch
    SET ${setClause}, batch_no = $${updateCols.length + 1}
    WHERE batch_no = $${updateCols.length + 2}
      AND it_code = $${updateCols.length + 3}
      AND wc_id = $${updateCols.length + 4}
      AND trans_year = $${updateCols.length + 5}
  `;

  await db.query(updateQuery, [
    ...updateVals,
    batchRow.batch_no,    // new batch_no
    whereBatchNo,         // old_batch_no ya current batch_no
    row.it_code,
    row.wc_id,
    row.trans_year,
  ]);
}


    // for (const row of batchData.delete || []) {
    //   await db.query(
    //     `DELETE FROM mommstok_batch
    //      WHERE batch_no = $1 AND it_code = $2 AND wc_id = $3 AND trans_year = $4`,
    //     [row.batch_no, row.it_code, row.wc_id, row.trans_year]
    //   );
    // }

    await db.query("COMMIT");
    return res.status(200).json({ type: "success", message: "Data updated successfully!" });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Update error:", err);
    return res.status(500).json({ type: "error", message: err.message || "Update failed." });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
      if (["Query", "Search"].includes(req?.query?.formStatus)) {
        await getItemStockOpngMstrDataOnQuery(req, res);
        return;
    }
    
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

    if (req?.query?.check_item_exist) {
      await checkItemExist(req, res);
      return;
    }

    res.status(400).json({ message: "Invalid request" });
});


exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
      
        await updateItemStockOpnBal(req, res);
        return;
    }
   
});






















