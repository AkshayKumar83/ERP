const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transformTommpinvToDbData, transformTdmmpinvToDbData } = require("./presentation");


let TABLE_NAMES = {
    TOMMPINV: `tommpinv`,
    TDMMPINV: `tdmmpinv`,
};


const getDataOnQuery = async (req, res, next) => {
  try {
    const { formStatus, appDivisionId, appFinYear, userId } = req.query;

  let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = ["wc_id"];

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



    //  safe null fallback
    const it_type = req.query.it_type || null;
    const it_base = req.query.it_base || null;
    const it_sub_c = req.query.it_sub_c || null;

    let queryParameter = `ORDER BY inv_date  LIMIT 1 OFFSET ${req.query.offset || 0}`;
    let dataCount = 0;

     if (whereClauses.length > 0) {
                          const getCount =   await db.query(
                                         `SELECT COUNT(*) AS count
                                        FROM vw_tommpinv v
                                        WHERE division_id = $1`,
                                        [appDivisionId]
                              );
                           
                            dataCount = getCount.rows[0]?.count;
                            queryParameter = `${queryValues} ${queryParameter}`;
                        } else {

    switch (req?.query?.get_data) {
      case "Query": 
        case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) AS count
           FROM vw_tommpinv v
           WHERE division_id = $1`,
          [appDivisionId]
        );
        dataCount = Number(getCount.rows[0]?.count || 0);
        break;
      }

      case "Last":
        queryParameter = "ORDER BY inv_date DESC LIMIT 1";
        break;

      default:
        queryParameter = `ORDER BY inv_date LIMIT 1 OFFSET ${req.query.offset || 0}`;
        break;
    }
  }

       //  Header Data
    const getPhyInvHeaderData = await db.query(
      `SELECT v.division_id, v.WC_ID, v.INV_DATE, v.INV_MONTH, v.STORE_PROCESS, v.OK_REJ
       FROM vw_tommpinv v
       WHERE division_id = $1
       ${queryParameter}`,
      [appDivisionId]
    );

    if (getPhyInvHeaderData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        headerData: null,
        detailData: [],
        batchData: [],
        count: dataCount,
        message: "No data found",
      });
    }

    const headerRow = getPhyInvHeaderData.rows[0];
    const wcId = headerRow.wc_id;
    const invMonth = headerRow.inv_month;

    // console.log(wcId,invMonth,appFinYear);

    //  Get WC No
    const getWcNo = await db.query(
      `SELECT wc_no FROM mommwc WHERE wc_id = $1`,
      [wcId]
    );
    const wc_no = getWcNo.rows[0]?.wc_no || null;

    //  Detail Data (Main Query)
    const detailResult = await db.query(
      `
       SELECT *
      FROM tommpinv
      WHERE inv_month = $1
        AND trans_year = $2
        AND wc_id = $3
        AND EXISTS (
          SELECT 1
          FROM mommitem b
          WHERE b.it_code = tommpinv.it_code
            AND b.it_type = COALESCE($4, b.it_type)  
            AND b.it_base = COALESCE($5, b.it_base)
            AND b.it_sub_c = COALESCE($6, b.it_sub_c)
            AND b.active = 'Y'
        )
      ORDER BY get_item_batch_control_flag(it_code) DESC, it_ok_qty DESC;
      `,
      [invMonth, appFinYear, wcId, it_type, it_base, it_sub_c]
    );

    const detailData = detailResult.rows;

    // Item details
    for (const row of detailData) {
      const itemInfo = await db.query(
        `SELECT it_name_long, um_code FROM mommitem WHERE it_code = $1`,
        [row.it_code]
      );
      const catalogInfo = await db.query(
        `SELECT catalog_code FROM mosmprod WHERE it_code = $1`,
        [row.it_code]
      );
      row.it_name = itemInfo.rows[0]?.it_name_long || null;
      row.um_code = itemInfo.rows[0]?.um_code || null;
      row.cat_code = catalogInfo.rows[0]?.catalog_code || null;
    }

    // const batchResult = await db.query(`SELECT * FROM TDMMPINV`);
    // const batchData = batchResult.rows;

    let batchData = [];

if (detailData.length > 0) {
  // Extract unique combination of pinv_id + it_code
  const pairs = detailData
    .filter(d => d.pinv_id && d.it_code)
    .map(d => `('${d.pinv_id}', '${d.it_code}')`);

  if (pairs.length > 0) {
    const batchQuery = `
      SELECT *
      FROM tdmmpinv b
      WHERE (b.pinv_id, b.it_code) IN (${pairs.join(",")})
      ORDER BY b.pinv_id, b.it_code, b.tag_no;
    `;
    const batchResult = await db.query(batchQuery);
    batchData = batchResult.rows;
  }
}


    return res.status(200).json({
      type: "found",
      headerData: { ...headerRow, wc_no },
      detailData,
      batchData,
      count: dataCount,
    });
  } catch (error) {
    console.error("Error in getDataOnQuery:", error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};


         // dropDownData
  exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
    try {
      const { level1, level2 } = req.query;

      let itemType = [];
      let itemBase = [];
      let itemSubCat = [];
      let months = [];

      // Fetch month list (no condition)
      const monthResult = await db.query(
        ` select cmonth, month from vwmonths `);
      months = monthResult.rows;


      //  Case 1: No params — fetch only Level 1 (Item Type)
      if (!level1 && !level2) {
        const result = await db.query(`
          SELECT cat_desc, level1 
          FROM moitbase 
          WHERE level2 = '00' AND level3 = '00'
          ORDER BY cat_desc;
        `);
        itemType = result.rows;
      }

      //  Case 2: level1 selected — fetch only Level 2 (Item Base)
      else if (level1 && !level2) {
        const result = await db.query(`
          SELECT cat_desc, level2 
          FROM moitbase 
          WHERE level1 = $1 
            AND level3 = '00' 
            AND level2 != '00'
          ORDER BY cat_desc;
        `, [level1]);
        itemBase = result.rows;
      }

      //  Case 3: level1 + level2 selected — fetch only Level 3 (Sub Category)
      else if (level1 && level2) {
        const result = await db.query(`
          SELECT cat_desc, level3
          FROM moitbase
          WHERE level1 = $1
            AND level2 = $2
            AND level3 != '00'
          ORDER BY cat_desc;
        `, [level1, level2]);
        itemSubCat = result.rows;
      }

      return res.status(200).json({
        success: true,
        invMonths: months,
        level1: itemType,
        level2: itemBase,
        level3: itemSubCat,
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
  

       // helplist
  const helpListData = async (req, res) => {
    const { form_status, help_list, storeProcess, appDivisionId, appFinYear, appUserId, wc_id, inv_month, it_type, it_base, it_sub_c, it_code,
    } = req?.query;

    //  Normalize helper function
    const normalize = (v) => (v === "null" || v === "" ? null : v);

    // Use new variable names to avoid redeclaration conflict
    const n_it_type = normalize(it_type);
    const n_it_base = normalize(it_base);
    const n_it_sub_c = normalize(it_sub_c);

    // For WcNo help
    // if (help_list === "WcNo") {
    //   const wcList = await db.query(
    //     `
    //     SELECT wc_no, wc_id::text AS wc_id
    //     FROM mommwc
    //     WHERE store_process = $1
    //       AND division_id = $2
    //     ORDER BY wc_no;
    //     `,
    //     [storeProcess, appDivisionId]
    //   );

    //   return res.status(200).json(wcList.rows);
    // }

    if (help_list === "WcNo") {

    //  form_status = 'Search' hai → vw_tommpinv se lo
    if (form_status === "Search") {
      const wcList = await db.query(
       `SELECT 
        v.wc_id::text AS wc_id,
        m.wc_no  AS wc_no
        FROM vw_tommpinv v
        LEFT JOIN mommwc m ON m.wc_id = v.wc_id   --  join for wc_no
        ORDER BY m.wc_no
        `
      );

      return res.status(200).json(wcList.rows);
    }

    //  2) mommwc waala logic
    const wcList = await db.query(
      `
      SELECT wc_no, wc_id::text AS wc_id
      FROM mommwc
      WHERE store_process = $1
        AND division_id   = $2
      ORDER BY wc_no;
      `,
      [storeProcess, appDivisionId]
    );

    return res.status(200).json(wcList.rows);
  }

    // For Item help
    if (help_list === "item") {
      const itemList = await db.query(
        `
        SELECT 
          b.it_name_long AS it_name,
          b.it_code,
          b.drawing_no
        FROM mommstok a
        JOIN mommitem b ON a.it_code = b.it_code
        WHERE a.wc_id = $1
          AND a.trans_year = $2
          AND a.active = 'Y'
          AND (b.it_type = COALESCE($3, b.it_type))
          AND (b.it_base = COALESCE($4, b.it_base))
          AND (b.it_sub_c = COALESCE($5, b.it_sub_c))
          AND b.raw_material_cd IS NULL
          AND NOT EXISTS (
            SELECT 1 
            FROM tommpinv t
            WHERE t.inv_month = $6
              AND t.trans_year = a.trans_year
              AND t.wc_id = a.wc_id
              AND t.it_code = a.it_code
          )
        ORDER BY b.it_name_long;
        `,
        [wc_id, appFinYear, n_it_type, n_it_base, n_it_sub_c, inv_month]
      );

      return res.status(200).json(itemList.rows);
    }

    // For Batch help
    if (help_list === "batch") {
      if (!it_code) {
        return res.status(400).json({ error: "Missing parameter: it_code" });
      }

      const batchList = await db.query(
        `
        SELECT DISTINCT it_code, supp_batch_no, batch_date 
        FROM tdmmrct_batch
        WHERE it_code = $1
        ORDER BY it_code, supp_batch_no, batch_date
        `,
        [it_code]
      );

      return res.status(200).json(batchList.rows);
    }

    // Default empty
    return res.status(200).send([]);
   };
 
     // checkItemExist  
  const checkItemExist = async (req, res) => {
    try {
     const { it_code, wc_id, trans_year, it_type, it_base, it_sub_c } = req.query;

    if (!it_code || !wc_id || !trans_year) {
      return res.status(400).json({ message: "Missing parameters" });
    }

     const itemQuery = `
     SELECT  b.it_name_long AS it_name,
      b.drawing_no AS drawing_no,
      b.um_code AS um_code
      FROM mommstok a
      JOIN mommitem b 
      ON a.it_code = b.it_code
      WHERE b.it_code = $1            
        AND a.wc_id = $2               
        AND a.trans_year = $3           
        AND a.active = 'Y'
        AND b.it_type = COALESCE($4, b.it_type)  
        AND b.it_base = COALESCE($5, b.it_base)
        AND b.it_sub_c = COALESCE($6, b.it_sub_c)
        AND b.raw_material_cd IS NULL
      LIMIT 1;
    `;

    const safeType = it_type || null;
    const safeBase = it_base || null;
    const safeSubC = it_sub_c || null;

    const itemResult = await db.query(itemQuery, [
      it_code, wc_id, trans_year, safeType, safeBase, safeSubC
    ]);

     if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Please select valid item code from list" });
     }

      const item = itemResult.rows[0];

      const batchResult = await db.query(
      `SELECT get_item_batch_control_flag($1) AS batch_flag;`,
      [it_code]
      );

      const cBatch = batchResult.rows[0]?.batch_flag || "N";
    
    return res.status(200).json({
      it_name: item.it_name,
      drawing_no: item.drawing_no,
      um_code: item.um_code,
      batch_control: cBatch,
      message: cBatch === "Y" ? "Item is batch controlled" : "Item is not batch controlled",
    });

  } catch (error) {
    console.error("Error in checkItemExist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
   };

      // checkBatchExist
  const checkBatchExist = async (req, res) => {
    try {
      const { it_code, batch_no, pinv_id } = req.query;

      if (!it_code || !batch_no || !pinv_id) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      //  check duplicate batch_no for same item
      const duplicateQuery = `
        SELECT 1
        FROM tdmmpinv
        WHERE pinv_id = $1
          AND batch_no = $2
          AND it_code = $3
        LIMIT 1;
      `;
      const duplicateResult = await db.query(duplicateQuery, [
        pinv_id,
        batch_no,
        it_code,
      ]);

      if (duplicateResult.rows.length > 0) {
        return res.status(400).json({
          error: `Batch no ${batch_no} already exists for this Item.`,
        });
      }

      const flagResult = await db.query(
        `SELECT get_item_batch_control_flag($1) AS batch_flag;`,
        [it_code]
      );
      const cBatch = flagResult.rows[0]?.batch_flag || "N";

      if (cBatch === "N") {
        return res.status(400).json({
          error: "Batch no is not required for this Item",
        });
      }
      return res.status(200).json();
    } catch (err) {
      console.error("Error in checkBatchExist:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

     // insert logic 
  const postPhyInventoryData = async (req, res, next) => {
  const { formData = {}, detailData = [], batchData = [] } = req.body;

  try {

    await db.query("BEGIN");

    const { wc_id, trans_year, inv_month, inv_date, store_process } = formData;
    if (!wc_id || !trans_year || !inv_month || !inv_date || !store_process) {
      throw new Error( "Missing required fields in formData (wc_id, trans_year, inv_month, inv_date, store_process)" );
    }

    // LOOP THROUGH DETAIL DATA
    if (Array.isArray(detailData) && detailData.length > 0) {
      for (const row of detailData) {
        // Check duplicate (avoid unique key violation)
        const checkDup = await db.query(
          `SELECT pinv_id 
           FROM ${TABLE_NAMES.TOMMPINV} 
           WHERE trans_year=$1 AND wc_id=$2 AND inv_month=$3 AND it_code=$4`,
          [trans_year, wc_id, inv_month, row.it_code]
        );

        if (checkDup.rowCount > 0) {
          continue; 
        }

        //  Generate pinv_id
        const seqResult = await db.query(`SELECT nextval('s_tommpinv_pinv_id') AS pinv_id`);
        const pinv_id = seqResult.rows[0]?.pinv_id;
        if (!pinv_id) throw new Error("Failed to generate pinv_id from sequence");

        // detail row for TOMMPINV
        const detailRow = transformTommpinvToDbData({
          ...row,
          pinv_id,
          wc_id,
          trans_year,
          inv_month,
          inv_date,
          store_process,
        });

        // Insert into TOMMPINV
        const insertQuery = generateSingleInsertQuery(TABLE_NAMES.TOMMPINV, detailRow);
        await db.query(insertQuery, Object.values(detailRow));

        // INSERT RELATED BATCHES (if any)
        const relatedBatches = batchData.filter(b => b.it_code === row.it_code);
        if (relatedBatches.length > 0) {
          for (const batch of relatedBatches) {
            const batchRow = transformTdmmpinvToDbData({ ...batch,pinv_id,});

            const insertBatchQuery = generateSingleInsertQuery(TABLE_NAMES.TDMMPINV, batchRow);
            await db.query(insertBatchQuery, Object.values(batchRow));
          }
        }

        //— VALIDATION CALLS
        await db.query(`CALL valid_batch_qty_for_phy_inventry($1, $2, $3, $4, $5)`, 
          [ inv_month, row.it_code, trans_year, wc_id, store_process]);

        await db.query(`CALL check_srl_no_rec_for_phy_inventry($1, $2)`, 
          [inv_month,row.it_code,]);
      }
    }

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Physical Inventory data saved successfully!",
    });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error(" Inventory Insert Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save physical inventory data.",
    });
  }
    };



  const updatePhyInventoryData = async (req, res, next) => {
    const { formData = {}, detailData = [], batchData = [] } = req.body;

    try {
      // console.log(" ==== UPDATE PHYSICAL INVENTORY START ====");
      // console.log(
      //   " Received Payload:",
      //   JSON.stringify({ formData, detailData, batchData }, null, 2)
      // );

      await db.query("BEGIN");

      const { wc_id, trans_year, inv_month, inv_date, store_process } = formData;
      if (!wc_id || !trans_year || !inv_month || !inv_date || !store_process)
        throw new Error(" Missing required fields in formData");

      // console.log(
      //   `\n Form Info → wc_id=${wc_id}, trans_year=${trans_year}, inv_month=${inv_month}, store_process=${store_process}`
      // );

      //  — DELETE BATCHES
      const deleteBatches = batchData.filter((b) => b._delete);
      console.log(` Step 1: Deleting ${deleteBatches.length} batch rows...`);
      for (const b of deleteBatches) {
        const result = await db.query(
          `DELETE FROM ${TABLE_NAMES.TDMMPINV}
          WHERE pinv_id=$1 AND it_code=$2 AND batch_no=$3`,
          [b.pinv_id, b.it_code, b.batch_no]
        );
        // console.log(
        //   result.rowCount > 0
        //     ? `    Batch deleted [pinv_id=${b.pinv_id}, batch_no=${b.batch_no}]`
        //     : ` Batch not found for deletion [pinv_id=${b.pinv_id}, batch_no=${b.batch_no}]`
        // );
      }

      // STEP  — DELETE DETAILS
      const deleteDetails = detailData.filter((d) => d._delete);
      // console.log(`Step 2: Deleting ${deleteDetails.length} detail rows...`);
      for (const d of deleteDetails) {
        const result = await db.query(
          `DELETE FROM ${TABLE_NAMES.TOMMPINV} WHERE pinv_id=$1`,
          [d.pinv_id]
        );
        // console.log(
        //   result.rowCount > 0
        //     ? `   Detail deleted [pinv_id=${d.pinv_id}, it_code=${d.it_code}]`
        //     : ` Detail not found for deletion [pinv_id=${d.pinv_id}]`
        // );
      }

      // — UPDATE EXISTING DETAILS
      const updateDetails = detailData.filter((d) => d.isStatus === "updated");
      // console.log(`\n Step 3: Updating ${updateDetails.length} existing detail rows...`);

      for (const row of updateDetails) {
        const detailRow = transformTommpinvToDbData({
          ...row,
          wc_id,
          trans_year,
          inv_month,
          inv_date,
          store_process,
        });

        const updateCols = Object.keys(detailRow).filter(
          (c) => !["pinv_id"].includes(c)
        );
        const setClause = updateCols.map((c, i) => `${c}=$${i + 1}`).join(", ");
        const values = updateCols.map((c) => detailRow[c]);
        values.push(detailRow.pinv_id);

        const result = await db.query(
          `UPDATE ${TABLE_NAMES.TOMMPINV}
          SET ${setClause}
          WHERE pinv_id=$${values.length}`,
          values
        );

        // if (result.rowCount > 0)
        //   console.log(`    Detail updated [pinv_id=${row.pinv_id}, it_code=${row.it_code}]`);
        // else
        //   console.warn(` No matching detail found [pinv_id=${row.pinv_id}]`);
      }

      //  INSERT NEW DETAILS
      const newDetails = detailData.filter((d) => d.isStatus === "new");
      // console.log(`\n Step 4: Inserting ${newDetails.length} new detail rows...`);

      for (const row of newDetails) {
        const seq = await db.query(`SELECT nextval('s_tommpinv_pinv_id') AS pinv_id`);
        const pinv_id = seq.rows[0]?.pinv_id;

        const detailRow = transformTommpinvToDbData({
          ...row,
          pinv_id,
          wc_id,
          trans_year,
          inv_month,
          inv_date,
          store_process,
        });

        const insertQ = generateSingleInsertQuery(TABLE_NAMES.TOMMPINV, detailRow);
        await db.query(insertQ, Object.values(detailRow));
        console.log(`Detail inserted [pinv_id=${pinv_id}, it_code=${row.it_code}]`);
      }

  //  UPDATE EXISTING BATCHES (supports old values)
const updateBatches = batchData.filter((b) => b.isStatus === "updated");
// console.log(`\n Step 5: Updating ${updateBatches.length} existing batch rows...`);

for (const b of updateBatches) {
  const batchRow = transformTdmmpinvToDbData(b);

  // Include batch_no in update columns if it has changed
  const updateCols = Object.keys(batchRow).filter(
    (c) => !["pinv_id"].includes(c) // Allow batch_no to be updated
  );
  const setClause = updateCols.map((c, i) => `${c}=$${i + 1}`).join(", ");
  const values = updateCols.map((c) => batchRow[c]);

  const oldItCode = b.old_it_code || b.it_code;
  const oldBatchNo = b.old_batch_no || b.batch_no;

  values.push(batchRow.pinv_id, oldItCode, oldBatchNo);

  // console.log(
  //   ` Updating batch [pinv_id=${batchRow.pinv_id}, it_code=${batchRow.it_code}, old_it_code=${oldItCode}, batch_no=${b.batch_no}, old_batch_no=${oldBatchNo}]`
  // );

  const result = await db.query(
    `UPDATE ${TABLE_NAMES.TDMMPINV}
     SET ${setClause}
     WHERE pinv_id=$${values.length - 2}
     AND it_code=$${values.length - 1}
     AND batch_no=$${values.length}`,
    values
  );

  if (result.rowCount > 0) {
  } else {
    console.error(`Batch update failed [pinv_id=${b.pinv_id}, old_it_code=${oldItCode}, old_batch_no=${oldBatchNo}]` );
    throw new Error(
      `Batch update failed for pinv_id=${b.pinv_id}, old_it_code=${oldItCode}, old_batch_no=${oldBatchNo}`
    );
  }
}

      //  STEP  — INSERT NEW BATCHES
      const newBatches = batchData.filter((b) => b.isStatus === "new" && !b._delete);
      // console.log(` Step 6: Inserting ${newBatches.length} new batch rows...`);

      for (const b of newBatches) {
        let pinv_id = b.pinv_id;

        if (!pinv_id) {
          const res = await db.query(
            `SELECT pinv_id FROM ${TABLE_NAMES.TOMMPINV}
            WHERE it_code=$1 AND wc_id=$2 AND trans_year=$3 AND inv_month=$4 LIMIT 1`,
            [b.it_code, wc_id, trans_year, inv_month]
          );
          pinv_id = res.rows[0]?.pinv_id;
        }

        if (!pinv_id) {
          // console.warn(` Skipping batch insert — no parent found for ${b.it_code}`);
          continue;
        }

        const batchRow = transformTdmmpinvToDbData({ ...b, pinv_id });
        const insertQ = generateSingleInsertQuery(TABLE_NAMES.TDMMPINV, batchRow);
        await db.query(insertQ, Object.values(batchRow));
        // console.log(`   Batch inserted [pinv_id=${pinv_id}, it_code=${b.it_code}, batch_no=${b.batch_no}]`);
      }

        //  VALIDATIONS
      const affectedItCodes = [
        ...new Set([...detailData, ...batchData].map((x) => x.it_code)),
      ].filter(Boolean);

      // console.log(` Step 7: Running validation for ${affectedItCodes.length} it_codes...`);

      for (const it_code of affectedItCodes) {
        await db.query(`CALL valid_batch_qty($1, $2, $3, $4, $5)`, [ inv_month, it_code, trans_year, wc_id, store_process,]);
        await db.query(`CALL check_srl_no_rec($1, $2)`, [inv_month, it_code]);
        // console.log(`    Validation done for it_code=${it_code}`);
      }

      await db.query("COMMIT");
      // console.log("\n ==== UPDATE PHYSICAL INVENTORY SUCCESS ====\n");

      return res.status(200).json({
        success: true,
        message: "Physical Inventory data updated successfully!",
      });
    } catch (err) {
      await db.query("ROLLBACK");
      console.error("ERROR:", err.message);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
    };




    exports.handleFormOperation = catchAsync(async (req, res, next) => {
          if (["Query", "Search"].includes(req?.query?.formStatus)) {
            await getDataOnQuery(req, res);
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

      if (req?.query?.check_batch_exist) {
        await checkBatchExist(req, res);
        return;
      }


    });

   exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updatePhyInventoryData(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await postPhyInventoryData(req, res);
        return;
    }
});
