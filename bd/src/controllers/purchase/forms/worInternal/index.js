const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../../utility/query");
const { dateFormater } = require("../../../../utility/constant");
const {
  transToTommstockadjDbData,
  transToTommesrBatchDbData,
} = require("./presentation");
// const {
//   transformTdmmmainDtlToDbData,
//   transformThmmmainToDbData,
//   transformTdmmmainBatchToDbData,
// } = require("./presentation");

const TABLE_NAMES = {
  TOMMSTOCKADJ: "tommstockadj",
  TOMMESR_BATCH: "tommesr_batch",
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;
  console.log("offset", req.query.offset);

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["adj_no", "adj_dt"];

  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  console.log("whereClauses", whereClauses);

  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  console.log("queryValues", queryValues);

  try {
    let queryParameter = `ORDER BY adj_no LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(adj_no)
         FROM ${TABLE_NAMES.TOMMSTOCKADJ}
         WHERE adj_type = 'WOR'
           AND division_id = $1
           AND trans_year = $2
           ${queryValues}`,
        [divisionId, transYear]
      );

      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(adj_no)
             FROM ${TABLE_NAMES.TOMMSTOCKADJ}
             WHERE adj_type = 'WOR'
               AND division_id = $1
               AND trans_year = $2`,
            [divisionId, transYear]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }
        case "Last":
          queryParameter = "ORDER BY adj_no DESC LIMIT 1";
          break;
        default:
          queryParameter = `ORDER BY adj_no LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const tommstokAdjData = await db.query(
      `SELECT * 
       FROM ${TABLE_NAMES.TOMMSTOCKADJ}
       WHERE ADJ_TYPE = 'WOR'
         AND DIVISION_ID = $1
         AND TRANS_YEAR = $2
       ${queryParameter}`,
      [divisionId, transYear]
    );

    if (tommstokAdjData.rowCount === 0) {
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        tommstokAdjData: [],
        recordCount: 0,
      });
    }

    const adjNo = tommstokAdjData.rows[0]?.adj_no;
    const adjDt = tommstokAdjData.rows[0]?.adj_dt;
    const fromWcId = tommstokAdjData.rows[0]?.wc_id_from;
    const toWcId = tommstokAdjData.rows[0]?.wc_id_to;
    const itCode = tommstokAdjData.rows[0]?.it_code;

    // Format date
    tommstokAdjData.rows[0].adj_dt =
      tommstokAdjData.rowCount > 0
        ? dateFormater(tommstokAdjData.rows[0].adj_dt)
        : "";

    tommstokAdjData.rows[0].cancel_dt =
      tommstokAdjData.rowCount > 0
        ? dateFormater(tommstokAdjData.rows[0].cancel_dt)
        : "";

    // Fetch FROM_WC description

    const wcFromData = await db.query(
      `	SELECT DESCRIPTION  FROM MOMMWC
	WHERE WC_ID=$1`,
      [fromWcId]
    );
    tommstokAdjData.rows[0].wc_desc_from =
      wcFromData.rowCount > 0 ? wcFromData.rows[0].description : "";

    console.log(tommstokAdjData.rows[0].wc_desc_from);

    // Fetch TO_WC description

    const wcToData = await db.query(
      `SELECT description FROM mommwc WHERE wc_id = $1`,
      [toWcId]
    );
    tommstokAdjData.rows[0].wc_desc_to =
      wcToData.rowCount > 0 ? wcToData.rows[0].description : "";

    console.log(tommstokAdjData.rows[0].wc_desc_to);

    // authorisation and cancellation

    tommstokAdjData.rows[0].cancel_flag =
      tommstokAdjData.rowCount > 0 ? tommstokAdjData.rows[0].cancel_flag : "";

    tommstokAdjData.rows[0].auth_flag =
      tommstokAdjData.rowCount > 0 ? tommstokAdjData.rows[0].auth_flag : "";

    // stock qty
    const stkQtyData = await db.query(
      `SELECT item_current_opening_bal(
      $1::smallint, 
      $2, 
      $3::date, 
      $4, 
      'O'
    ) AS opening_qty`,
      [fromWcId, itCode, adjDt, appFinYear]
    );

    tommstokAdjData.rows[0].stock_qty =
      stkQtyData.rowCount > 0 ? stkQtyData.rows[0].opening_qty : "";

    // Fetch item code

    const itemData = await db.query(
      `	SELECT IT_NAME FROM MOMMITEM
	WHERE IT_CODE = $1`,
      [itCode]
    );
    tommstokAdjData.rows[0].it_desc =
      itemData.rowCount > 0 ? itemData.rows[0].it_name : "";

    console.log(tommstokAdjData.rows[0].it_name);

    // Fetch TOMMSER_BATCH data
    const tommserBatchData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TOMMESR_BATCH} WHERE adj_no = $1`,
      [adjNo]
    );

    if (tommserBatchData.rows.length > 0) {
      await Promise.all(
        tommserBatchData.rows.map(async (item) => {
          if (item.it_code !== null) {
            const itemData = await db.query(
              `SELECT it_name, um_code, drawing_no
               FROM mommitem
               WHERE it_code = $1`,
              [item.it_code]
            );

            item.it_name = itemData.rows[0]?.it_name || null;
            item.um_code = itemData.rows[0]?.um_code || null;
            item.drawing_no = itemData.rows[0]?.drawing_no || null;
          }
        })
      );
    }

    const responseData = {
      tommstokAdjData: tommstokAdjData.rows[0],
      tommserBatchData: tommserBatchData.rows,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

const helpListData = async (req, res) => {
  let {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    wc_id_from,
    adj_dt,
    it_code,
  } = req.query;

  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "item") {
    try {
      const itemData = await db.query(
        `select i.it_code, g.it_name 
 from mommstok i, mommitem g
 where i.trans_year = $1
and i.wc_id = $2
and i.it_code = g.it_code
 order by it_code  
         `,
        [appFinYear, wc_id_from]
      );

      return res.status(200).json(itemData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "wcfrom") {
    try {
      const wcFromData = await db.query(
        `  SELECT DESCRIPTION,WC_ID FROM MOMMWC WHERE DIVISION_ID = $1
 ORDER BY DESCRIPTION
	
         `,
        [appDivisionId]
      );

      return res.status(200).json(wcFromData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "wcto") {
    try {
      const wcToData = await db.query(
        `  SELECT DESCRIPTION,WC_ID FROM MOMMWC WHERE DIVISION_ID = $1
 ORDER BY DESCRIPTION
	

         `,
        [appDivisionId]
      );

      return res.status(200).json(wcToData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "item") {
    try {
      const wcToData = await db.query(
        `  SELECT A.IT_NAME,A.IT_CODE FROM MOMMITEM A,MOMMSTOK B
 WHERE A.IT_CODE=B.IT_CODE
 AND TRANS_YEAR =$1
 AND B.WC_ID=$2
 ORDER BY A.IT_NAME  
	

         `,
        [appFinYear, wc_id_from]
      );

      return res.status(200).json(wcToData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (help_list === "batch") {
    try {
      const batchData = await db.query(
        ` select batch_no,coalesce(mrir_date,batch_date) batch_date,
 item_current_opening_bal_batch(v.wc_id, v.it_code, $1, $2, 'O', v.batch_no)  batch_qty,
 'O' ok_rej,mrir_no,mrir_date,it_code
  from vwshowbatches v,mommwc m
  where it_code=$3
   and m.wc_id=v.wc_id
   and m.wc_id=$4
   and m.division_id=$5
   and v.trans_year =$2
 AND  coalesce(item_current_opening_bal_batch(v.wc_id, v.it_code, $1, $2, 'O', v.batch_no),0) > 0
 order by 1     
	

         `,
        [adj_dt, appFinYear, it_code, wc_id_from, appDivisionId]
      );

      return res.status(200).json(batchData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json([]);
};

const getValidateItemData = async (req, res) => {
  try {
    const { it_code, appFinYear, wc_id_from, wc_id_to, adj_dt, appDivisionId } =
      req.query;

    // 1 Check valid item & from store
    const itemResult = await db.query(
      `SELECT A.IT_NAME 
         FROM MOMMITEM A 
         JOIN MOMMSTOK B ON A.IT_CODE = B.IT_CODE
        WHERE A.IT_CODE = $1
          AND B.WC_ID = $2
          AND B.TRANS_YEAR = $3`,
      [it_code, wc_id_from, appFinYear]
    );

    if (itemResult.rowCount === 0) {
      return res.status(400).json({ error: "Invalid Item Code" });
    }

    //  Check item validity in FROM / TO stores
    await db.query(`CALL check_item_wc($1, $2, $3, $4)`, [
      it_code,
      wc_id_from,
      wc_id_to,
      appFinYear,
    ]);

    // 3 Get store stock (opening balance)
    const stkQtyData = await db.query(
      `SELECT item_current_opening_bal(
      $1::smallint, 
      $2, 
      $3::date, 
      $4, 
      'O'
    ) AS opening_qty`,
      [wc_id_from, it_code, adj_dt, appFinYear]
    );

    const stock_qty = stkQtyData.rows[0].opening_qty;

    // 4 Get FIFO Rate
    const rateResult = await db.query(
      `SELECT Fetchfiforate($1, 1, $2, $3, $4) AS fifo_rate`,
      [it_code, adj_dt, appDivisionId, appFinYear]
    );

    const rate = rateResult.rows[0].fifo_rate;

    // 5 Check pending unauthorized entries
    const pendingResult = await db.query(
      `SELECT 'Y'
         FROM TOMMSTOCKADJ
        WHERE it_code = $1
          AND wc_id_from = $2
          AND ADJ_TYPE = 'WOR'
          AND COALESCE(auth_flag, 'N') = 'N'
          AND COALESCE(cancel_flag, 'N') = 'N'`,
      [it_code, wc_id_from]
    );

    if (pendingResult.rowCount > 0) {
      return res.status(400).json({
        error:
          "This item code & store combination has pending authorization. Please authorise the pending entry.",
      });
    }

    // 6 Final success response
    return res.status(200).json({
      message: "Item validation successful",
      item_name: itemResult.rows[0].it_name,
      stock_qty: stock_qty,
      fifo_rate: rate,
    });
  } catch (error) {
    console.error("Validation Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getValidateWCdescFromData = async (req, res) => {
  const { physical_loca, appFinYear } = req.query;

  const result = await db.query(
    `select 1
				  from mommitem_locations
			where physical_loca = $1`,
    [physical_loca]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error: "Invalid Physical location... select from list",
    });
  }

  return res.status(200).json({
    message: "Physical location validation successful",
    data: result.rows[0],
  });
};

const getValidateWCdescToData = async (req, res) => {
  const { physical_loca, rack_no, bin_no } = req.query;

  const result = await db.query(
    `select 1
					  from mommitem_locations
				where physical_loca = $1
					  and rack_no = $2
				  and bin_no = $3`,
    [physical_loca, rack_no, bin_no]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error:
        "Invalid BIN no/Not linked with physical location/rack no in Location master... select from list",
    });
  }

  return res.status(200).json({
    message: "Physical location validation successful",
    data: result.rows[0],
  });
};

const getValidateBatchData = async (req, res) => {
  const {
    formStatus,
    it_code,
    batch_it_code,
    batch_no,
    batch_dt,
    wc_id_from,
    division_id,
    ok_reg_from,
    trans_year,
    adj_dt,
  } = req.query;

  try {
    // 1. Validate form status
    if (!["INSERT", "UPDATE"].includes(formStatus)) {
      return res.status(200).json({ message: "No validation required" });
    }

    // 2. If batch_no is NULL → mandatory IF batch control = Y
    if (!batch_no) {
      const batchCtrl = await db.query(
        `SELECT chk_it_batch_control($1) AS batch_flag`,
        [it_code]
      );

      if (batchCtrl.rows[0].batch_flag === "Y") {
        return res.status(400).json({
          error: "Batch no is must for this item",
        });
      }

      // Validate item code and batch item code
      if (it_code !== batch_it_code) {
        return res.status(400).json({
          error: "Please feed correct batch no",
        });
      }

      return res.status(200).json({ message: "Validation passed" });
    }

    // 3. Batch_no is NOT NULL → apply FIFO validation
    const batchCtrl = await db.query(
      `SELECT chk_it_batch_control($1) AS batch_flag`,
      [it_code]
    );

    if (batchCtrl.rows[0].batch_flag === "Y") {
      const fifoRes = await db.query(
        `SELECT * FROM check_fifo_batch($1,$2,$3,$4,$5,$6) 
          AS (is_prior boolean, vbatch_no text, vfifo_dt date)`,
        [it_code, wc_id_from, batch_dt, ok_reg_from, trans_year, adj_dt]
      );

      const fifo = fifoRes.rows[0];

      if (fifo.is_prior === true) {
        return res.status(400).json({
          error: `Prior batch ${fifo.vbatch_no}-${fifo.vfifo_dt} exists`,
        });
      }
    }

    // 4. Check if batch exists in vwshowbatches
    const result3 = await db.query(
      `SELECT v.batch_no 
       FROM vwshowbatches v
       JOIN mommwc m ON m.wc_id = v.wc_id
       WHERE v.it_code = $1
         AND m.wc_id = $2
         AND m.division_id = $3
         AND v.batch_no = $4`,
      [it_code, wc_id_from, division_id, batch_no]
    );

    if (result3.rowCount === 0) {
      // Batch does not exist → entering new batch
      return res.status(400).json({
        error: "You are entering new batch no.",
        batch_dt: new Date().toISOString().slice(0, 10), // Oracle's trunc(sysdate)
      });
    }

    return res.status(200).json({
      message: "Batch validation successful",
    });
  } catch (err) {
    console.error("Error in getValidateBatchData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.handleValidateData = catchAsync(async (req, res, next) => {
  const { param } = req.query;
  if (param === "it_code") {
    await getValidateItemData(req, res);
    return;
  }

  if (param === "wc_desc_from") {
    await getValidateWCdescFromData(req, res);
  }

  if (param === "batch_no") {
    await getValidateBatchData(req, res);
  }

  if (param === "wc_desc_to") {
    await getValidateWCdescToData(req, res);
  }
});

exports.authorisedWorInternalDetails = catchAsync(async (req, res, next) => {
  const {
    adj_no,
    division_id,
    trans_year,
    auth_flag, // N or Y
    cancel_flag, // NEW
    adj_dt,
    it_code,
    ok_reg_from,
    ok_reg_to,
    wc_id_from,
    wc_id_to,
    remark,
    qty,
    rate,
  } = req.body.formData;

  try {
    // Start transaction
    await db.query("BEGIN");

    // 1️ Cancelled document → block authorisation
    if (cancel_flag === "Y") {
      throw new Error("You cannot Authorise a cancelled document.");
    }

    // 2️ If NOT authorised → CALL PROC_AUTHORISE
    if (auth_flag === "N" || auth_flag === null) {
      await db.query(
        `CALL proc_authorise($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          division_id,
          trans_year,
          adj_no,
          adj_dt,
          it_code,
          ok_reg_from,
          ok_reg_to,
          wc_id_from,
          wc_id_to,
          remark,
          qty,
          rate,
        ]
      );

      await db.query("COMMIT");

      return res.status(200).json({
        type: "success",
        message: "Document is Authorised.",
        newAuthFlag: "Y",
      });
    }

    // 3️ If already authorised → CALL PROC_UNAUTHORISE
    if (auth_flag === "Y") {
      await db.query(`CALL proc_unauthorise($1,$2,$3,$4)`, [
        adj_no,
        it_code,
        division_id,
        trans_year,
      ]);

      await db.query("COMMIT");

      return res.status(200).json({
        type: "success",
        message: "Document is Unauthorised.",
        newAuthFlag: "N",
      });
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Authorisation error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Something went wrong.",
    });
  }
});

// for cancellation
exports.cancelWorInternalDetails = catchAsync(async (req, res, next) => {
  let {
    adj_no,
    division_id,
    trans_year,
    cancel_flag,
    cancel_dt,
    auth_flag,
    it_code,
  } = req.body.formData;

  const appUserId = req.body.appUserId;

  // if (!appUserId) {
  //   return res
  //     .status(401)
  //     .json({ type: "error", message: "Unauthorized: User ID not found" });
  // }

  // Use today if cancel_dt is null/blank
  if (!cancel_dt || cancel_dt === "") {
    cancel_dt = new Date();
  }

  try {
    // STEP 1: Already cancelled?
    if (cancel_flag === "Y") {
      return res.status(400).json({
        type: "error",
        message: "This Document has already been cancelled",
      });
    }

    // BEGIN TRANSACTION
    await db.query("BEGIN");

    const result = await db.query(
      `
  UPDATE ${TABLE_NAMES.TOMMSTOCKADJ}
  SET cancel_flag = 'Y', 
  auth_flag = 'N'

      cancel_dt = $4
  WHERE division_id = $1
    AND trans_year = $2 
    AND adj_no = $3
  `,
      [division_id, trans_year, adj_no, cancel_dt]
    );

    console.log("Updated rows:", result.rowCount);  

    console.log({
  adj_no,
  division_id,
  trans_year,
  cancel_dt,
});


    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Document is cancelled.",
      cancel_dt: cancel_dt,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Cancel memo error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message || "Something went wrong while cancelling memo.",
    });
  }
});

const postWorDetails = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { formData, formDetailData, transYear, divisionId, formStatus } =
      req.body;

    // STEP 1: Basic validation
    if (!Array.isArray(formDetailData) || formDetailData.length === 0) {
      throw new Error("No detail entries provided.");
    }

    // STEP 2: Document date setup
    const docDate = formData.adj_dt ? new Date(formData.adj_dt) : new Date();

    // STEP 3: Validate financial year range
    const finYearCheck = await db.query(
      `SELECT 1 FROM moitfinyear 
       WHERE year_code = $1 
         AND $2::date BETWEEN st_date AND end_date`,
      [transYear, docDate]
    );

    if (finYearCheck.rowCount === 0) {
      throw new Error("Document date does not fall within financial year.");
    }

    const checkItemBatch = await db.query(
      `SELECT chk_it_batch_control($1) AS batch_flag`,
      [formData.it_code]
    );

    if (checkItemBatch.rows[0].batch_flag === "Y") {
      return res.status(400).json({
        error: "Batch no must for this item",
      });
    }

    const result = await db.query(
      `SELECT GENSTOCKADJNO('WOR', $1, $2) AS adj_no`,
      [transYear, divisionId]
    );

    let adjNo = result.rows[0]?.adj_no;
    console.log("Generated doc_no:", adjNo);

    if (!adjNo) {
      throw new Error("gendocno() failed to generate document number");
    }

    // STEP 8: Insert header (TOMMSTOKADJ)
    const tommStokData = transToTommstockadjDbData(
      {
        ...formData,
        division_id: divisionId,
        trans_year: transYear,
        division_id: divisionId,
        trans_code: 58,
        adj_no: adjNo,
        adj_type: "WOR",
      },
      req.user
    );

    const insertThmmQuery = generateSingleInsertQuery(
      TABLE_NAMES.TOMMSTOCKADJ,
      tommStokData
    );
    const thmmResult = await db.query(
      insertThmmQuery,
      Object.values(tommStokData)
    );
    if (thmmResult.rowCount === 0) {
      throw new Error("Failed to insert header data (tommStokData).");
    }

    // STEP 9: Insert details (TOMMESR_BATCH)

    for (const detailRow of formDetailData) {
      if (detailRow.qty > 0) {
        const tommesrData = transToTommesrBatchDbData({
          ...detailRow,
          adj_no: adjNo,
        });

        const detailInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.TOMMESR_BATCH,
          tommesrData
        );
        await db.query(detailInsertQuery, Object.values(tommesrData));
      }
    }

    // STEP 12: Commit
    await db.query("COMMIT");

    return res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error in postStockAdjustmentDetails:", error.message);
    await db.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  }
};

const updateWorDetails = async (req, res) => {
  const {
    formData,
    formDetailData,
    deletedFormDtlData,
    appUserId,
    transYear,
    divisionId,
  } = req.body;

  // Get wcId early and freeze it before any usage
  // const wcId = formData?.wc_id ?? null;
  //console.log("Initial wcId:", wcId);

  console.log("formDetailData", formDetailData);

  const adj_no = formData?.adj_no;
  delete formData.description;
  delete formData.wc_desc_from;
  delete formData.wc_desc_to;
  delete formData.it_desc;
  delete formData.stock_qty;

  try {
    await db.query("BEGIN");

    // ## UPDATE TOMMSTOK (Header) DATA
    if (Object.keys(formData).length && adj_no) {
      const columns = Object.keys(formData);
      const values = Object.values(formData);
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");
      const query = `UPDATE ${
        TABLE_NAMES.TOMMSTOCKADJ
      } SET ${setClause} WHERE adj_no = $${columns.length + 1}`;
      await db.query(query, [...values, adj_no]);
    }

    // ## DELETE TDMMMAIN DETAIL RECORDS
    if (Array.isArray(deletedFormDtlData) && deletedFormDtlData.length > 0) {
      console.log("deletedFormDtlData:", deletedFormDtlData);

      // Extract only  values from the array of objects
      const deleteCodes = deletedFormDtlData.map((item) => item.it_code);

      // Create placeholders for IN clause
      const deleteIds = deleteCodes.map((_, i) => `$${i + 1}`).join(",");
      const docIdPlaceholder = `$${deleteCodes.length + 1}`;

      const deleteQuery = `
    DELETE FROM ${TABLE_NAMES.TOMMESR_BATCH}
    WHERE adj_no = ${docIdPlaceholder}
      AND it_code IN (${deleteIds})
  `;

      console.log("Delete Query:", deleteQuery);
      console.log("Query Values:", [...deleteCodes, adj_no]);

      await db.query(deleteQuery, [...deleteCodes, adj_no]);
    }

    // for update logic

    // Cleanup function
    function cleanTommesrRecord(record) {
      const keysToDelete = ["id", "it_name"];

      const cleaned = { ...record };
      for (const key of keysToDelete) {
        delete cleaned[key];
      }
      return cleaned;
    }

    // --- Main save logic ---
    for (const entry of formDetailData || []) {
      const cleaned = cleanTommesrRecord(entry);

      // Normalize numeric fields to null if empty string
      const numericFields = ["rate"];
      for (const field of numericFields) {
        if (cleaned[field] === "") {
          cleaned[field] = null;
        }
      }

      if (cleaned.adj_no && `${cleaned.adj_no}`.trim() !== "") {
        // --- UPDATE ---
        const it_code = cleaned.it_code;
        const trans_year = cleaned.trans_year;
        const entryAdjNo = cleaned.adj_no;

        if (!it_code || !entryAdjNo) {
          console.warn(
            "Skipping update: missing init_it_code or doc_id",
            entry
          );
          continue;
        }

        delete cleaned.it_code;
        delete cleaned.adj_no;

        cleaned.update_id = appUserId;
        cleaned.update_date = new Date();

        const cols = Object.keys(cleaned);
        if (!cols.length) continue;

        const vals = Object.values(cleaned);
        const setClause = cols.map((col, i) => `${col} = $${i + 1}`).join(", ");

        const updateQuery = `
      UPDATE ${TABLE_NAMES.TOMMESR_BATCH}
      SET ${setClause}
      WHERE it_code = $${cols.length + 1}
        AND adj_no = $${cols.length + 2} 
        AND trans_year = $${cols.length + 3} 
        AND division_id = $${cols.length + 4}
    `;

        console.log("Update Query:", updateQuery.trim());
        console.log("Update Values:", [...vals, it_code, entryAdjNo]);
        await db.query(updateQuery, [
          ...vals,
          it_code,
          entryAdjNo,
          transYear,
          divisionId,
        ]);
      } else {
        // --- INSERT ---
        delete cleaned.it_code;

        cleaned.adj_no = adj_no; // from formData

        // cleaned.wc_id = wcId;

        console.log("Insert record wc_id:", cleaned.adj_no);

        if (!cleaned.adj_no) {
          console.warn("Skipping insert: missing wc_id", entry);
          continue;
        }

        if (!cleaned.it_code) {
          console.warn("Skipping insert: missing it_code", entry);
          continue;
        }

        const insertQuery = generateSingleInsertQuery(
          TABLE_NAMES.TOMMESR_BATCH,
          cleaned
        );

        console.log("Insert Query:", insertQuery.trim());
        console.log("Insert Values:", Object.values(cleaned));
        await db.query(insertQuery, Object.values(cleaned));
      }
    }

    await db.query("COMMIT");

    res.status(200).json({
      type: "success",
      message: "Record successfully saved",
    });
  } catch (error) {
    console.error("Update failed:", error);
    await db.query("ROLLBACK");
    res.status(400).json({
      type: "error",
      message: error.message || "Internal server error",
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  // await getDataOnQuery(req, res);
  // return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateWorDetails(req, res);
    return;
  } else {
    await postWorDetails(req, res);
    return;
  }
});
