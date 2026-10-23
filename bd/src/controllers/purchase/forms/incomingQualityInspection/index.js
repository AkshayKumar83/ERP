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
  transTdmmrctDataToDbData,
  transTommiqciToDbData,
  transTdmmrctBatchToDbData,
} = require("./presentation");

const TABLE_NAMES = {
  THMMMRCT: "thmmrct",
  TDMMMRCT: "tdmmrct",
  TOMMIQCI: "tommiqci",
  TDMMRCT_BATCH: "tdmmrct_batch",
};

const helpListData = async (req, res) => {
  const { appDivisionId, appFinYear, appUserId, form_status, help_list } =
    req?.query;
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "mrir") {
    const mrir = await db.query(
      `   
    SELECT 
      d.mrir_no,
      d.it_pu_um,
      d.mrir_date,
      h.sale_return,
      h.v_code,
      h.chln_no,
      h.chln_date,
      d.clear_dt,
      d.it_code,
      h.invward_control_no,
      d.insp_report_no,
      d.qty_in_no,
      v.v_name,
      d.qty_ets,
      d.qty_recd,
      d.qty_converted,
      d.qty_prc_flt_stk_um,
      d.qty_mat_flt_in_stk_um,
      d.qty_payment,
      d.po_id,
      h.remarks,
      d.qty_scrap_in_stk_um,
      i.it_p_umf,
      i.it_name,
      i.it_pu_um,
      i.um_code,
      d.ets_auth_id,
      d.um_code,
      d.update_id,
      d.create_id
    FROM tdmmrct d
    JOIN thmmrct h ON d.ge_id = h.ge_id
    JOIN mommvend v ON h.v_code = v.v_code
    JOIN mommitem i ON d.it_code = i.it_code
    WHERE d.status_flg = 'I'
      AND h.division_id = $1
    ORDER BY d.mrir_no;
    `,
      [appDivisionId]
    );

    // Apply remaining logic to each row
    for (let row of mrir.rows) {
      // 1️ Ensure conversion factor exists
      if (!row.it_p_umf || row.it_p_umf === 0) {
        const itemRes = await db.query(
          `SELECT it_p_umf FROM mommitem WHERE it_code = $1`,
          [row.it_code]
        );
        row.it_p_umf = itemRes.rows[0]?.it_p_umf || 1;
      }

      // 2️ Fetch PO details
      const poRes = await db.query(
        `SELECT po_no, category FROM mhmmpo WHERE po_id = $1`,
        [row.po_id]
      );
      row.po_no = poRes.rows[0]?.po_no || "";
      row.category = poRes.rows[0]?.category || "";

      // 3️ Movement ticket quantity (mommmovtkt)
      const movtktRes = await db.query(
        `SELECT COALESCE(SUM(movtkt_qty),0) AS movtkt_qty
       FROM mommmovtkt
       WHERE mrir_no = $1 AND COALESCE(cancel_ticket,'N')='N'`,
        [row.mrir_no]
      );
      let nConvertedQty = (row.qty_converted || 0) * row.it_p_umf;
      let movtktQty = movtktRes.rows[0].movtkt_qty;
      if (nConvertedQty > 0) {
        const nConvFactor = (row.qty_converted || 0) / nConvertedQty;
        movtktQty = Math.round(movtktQty * nConvFactor);
      }
      row.movtkt_qty = movtktQty;

      // 4️ ETS authorization and rejected/ok quantities
      if ((row.qty_ets || 0) > 0 && !row.ets_auth_id) {
        row.ets_authorised = false;
      } else {
        row.ets_authorised = true;
        // qty_rejd = qty_ets, qty_ok_in_stk_um = qty_converted - qty_ets
        row.qty_rejd = row.qty_ets;
        row.qty_ok_in_stk_um = (row.qty_converted || 0) - (row.qty_ets || 0);
      }

      // 5️ Set UOM fie
      row.pur_uom = row.it_pu_um;
      row.stk_um = row.um_code;

      // 6️ Deviation check (if dev_no provided in query)
      if (req.query.dev_no) {
        const devRes = await db.query(
          `SELECT COALESCE(auth_flag,'N') AS auth_flag FROM mommdvtn WHERE deviation_no = $1`,
          [req.query.dev_no]
        );
        const authFlag = devRes.rows[0]?.auth_flag || "N";
        if (authFlag === "Y")
          throw new Error("Deviation Exists and is Authorised");
        if (authFlag === "N")
          throw new Error("Unauthorised Deviation Exists.. Cannot Proceed");
      }

      // 7 User authorization
      // const userCheck = await db.query(`SELECT 1 FROM store WHERE user_id = $1 AND wc_id = $2`, [appUserId, row.wc_id]);
      // if (!userCheck.rows.length) throw new Error('Sorry....You are not authorised user ...');

      // 8 Set clear_dt to current date
      if (!row.clear_dt) {
        row.clear_dt = new Date();
      } else {
        row.clear_dt = new Date(row.clear_dt);
      }
    }

    return res.status(200).json(mrir.rows);
  }
};

const postParamData = async (req, res) => {
  try {
    const { formData } = req.body;

    const { it_code } = formData;

    // Call stored procedure to populate temp table
    await db.query(`CALL temp_fill_item_parameter($1)`, [it_code]);

    const finalResult = await db.query(
      `SELECT * FROM tommiqci WHERE it_code = $1`,
      [it_code]
    );

    // POST-QUERY DATA
    if (finalResult.rows.length > 0) {
      await Promise.all(
        finalResult.rows.map(async (item) => {
          if (item.defect_code !== null) {
            const Defname = await db.query(
              ` select DEFECT_DET_DESC 
	      from mdmmdeft
	     where DEFECT_DET_CODE = $1
	     ORDER BY DEFECT_DET_CODE DESC `,
              [item.defect_code]
            );

            item.defect_desc = Defname.rows[0]?.defect_det_desc || null;
          }

          if (item.mrir_no !== null) {
            const spec = await db.query(
              ` select spec,instrument
       from mommiqci 
    where mommiqci.it_code = $1
          and defect_code = $2`,
              [it_code, item.defect_code]
            );

            item.spec_desc = spec.rows[0]?.spec || null;
            item.inspection_mode = spec.rows[0]?.instrument || null;
          }
        })
      );
    }
    console.log("finalResult", finalResult.rows);

    return res.status(200).json({
      success: true,
      tommiquciData: finalResult.rows,
      message: "Item inserted successfully",
    });
  } catch (error) {
    // console.error("Error in postItcData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postBatchData = async (req, res) => {
  try {
    const { formData, formDetailData } = req.body;
    const { it_code, mrir_no } = formData;

    for (const item of formDetailData) {
      let { qty_ok_in_stk_um } = item;

      if (qty_ok_in_stk_um === undefined || qty_ok_in_stk_um === "") {
        qty_ok_in_stk_um = null;
      }

      try {
        // Call the PostgreSQL function
        await db.query(`SELECT process_tdmmrct_batch($1, $2, $3)`, [
          it_code,
          mrir_no,
          qty_ok_in_stk_um,
        ]);
      } catch (dbError) {
        return res.status(400).json({
          success: false,
          message: dbError.message,
        });
      }
    }

    // Fetch the final batch data if needed
    const finalResult = await db.query(
      `SELECT * FROM tdmmrct_batch WHERE mrir_no = $1`,
      [mrir_no]
    );

    finalResult.rows[0].batch_date =
      finalResult.rowCount > 0
        ? dateFormater(finalResult.rows[0].batch_date)
        : "";

    finalResult.rows[0].expiry_date =
      finalResult.rowCount > 0
        ? dateFormater(finalResult.rows[0].expiry_date)
        : "";

    return res.status(200).json({
      success: true,
      tommBatchData: finalResult.rows,
      message: "Batch inserted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};  

const postDvtnData = async (req, res) => {
  try {
    const { formData, formDetailData } = req.body;
    const { it_code, mrir_no, v_code } = formData;

    let deviation_test_value = null;

    for (const item of formDetailData) {
      let { clear_dt, qty_ok_in_stk_um } = item;

      if (qty_ok_in_stk_um === undefined || qty_ok_in_stk_um === "") {
        qty_ok_in_stk_um = null;
      }

      try {
        const result = await db.query(
          `SELECT ProcDvtnCheck($1, $2, $3, $4, $5) AS deviation_test`,
          [mrir_no, it_code, v_code, clear_dt, qty_ok_in_stk_um]
        );

        if (result.rows.length > 0) {
          deviation_test_value = result.rows[0].deviation_test;
        }
      } catch (dbError) {
        return res.status(400).json({
          success: false,
          message: dbError.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      deviation_test: deviation_test_value,
      message: "Procedure executed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postShowDvtnData = async (req, res) => {
  try {
    const { deviation_status, formData, formDetailData } = req.body;
    const { mrir_no, it_code, v_code } = formData;


    const firstItem = formDetailData[0] || {};
    const { clear_dt } = firstItem;

    let whereClause = "";
    let values = [];

    if (deviation_status === "D") {
      whereClause = `clear_dt BETWEEN $1 AND $2 AND v_code = $3`;
      values = [clear_dt, clear_dt, v_code];
    } else if (deviation_status === "M") {
      whereClause = `mrir_no = $1 AND v_code = $2`;
      values = [mrir_no, v_code];
    } else if (deviation_status === "Q") {
      whereClause = `it_code = $1 AND v_code = $2`;
      values = [it_code, v_code];
    } else {
      whereClause = `it_code = $1 AND v_code = $2`;
      values = [it_code, v_code];
    }

    const result = await db.query(
      `SELECT * FROM mommdvtn WHERE ${whereClause}`,
      values
    );

    return res.status(200).json({
      success: true,
      deviationData: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const postInqciData = async (req, res) => {
  try {
    await db.query("BEGIN");

    // ------------------ Utility functions ------------------
    function cleanNumericFields(record) {
      const newRecord = { ...record };
      for (const key in newRecord) {
        if (typeof newRecord[key] === "string" && newRecord[key].trim() === "") {
          newRecord[key] = null;
        }
      }
      return newRecord;
    }

    function cleanRecord(record, keysToDelete = []) {
      const newRecord = { ...record };
      for (const key of keysToDelete) delete newRecord[key];
      return newRecord;
    }

    async function deleteRecords(tableName, records, whereColumns) {
      for (const record of records) {
        const whereClause = whereColumns.map((col, i) => `${col} = $${i + 1}`).join(" AND ");
        const values = whereColumns.map(col => record[col]);
        await db.query(`DELETE FROM ${tableName} WHERE ${whereClause}`, values);
      }
    }

    async function upsertRecords(tableName, records, transformFn, mrirNo, idColumn = "create_id") {
      for (const [index, record] of records.entries()) {
        if (record[idColumn]) {
          // Update
          const dataForUpdate = cleanNumericFields({ ...record });
          const columns = Object.keys(dataForUpdate);
          const values = Object.values(dataForUpdate);
          const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
          const whereClause = idColumn in record
            ? `${idColumn} = $${columns.length + 1}`
            : `mrir_no = $${columns.length + 1} AND it_code = $${columns.length + 2}`;
          const whereValues = idColumn in record ? [record[idColumn]] : [record.mrir_no, record.it_code];

          await db.query(`UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`, [...values, ...whereValues]);
        } else {
          // Insert
          if ("mrir_no" in record) record.mrir_no = mrirNo;
          let transformedRecord = transformFn(record);
          transformedRecord = cleanNumericFields(transformedRecord);
          const insertQuery = generateSingleInsertQuery(tableName, transformedRecord);
          const valuesForInsert = Object.values(transformedRecord);
          await db.query(insertQuery, valuesForInsert);
        }
      }
    }

    // ------------------ Extract request body ------------------
    let {
      formData,
      formDetailData = [],
      batchData = [],
      divisionId,
      deletedTdmmrctData = [],
      deletedBatchData = [],
      deletedTommiqciData = [],
      formDtlInqData = [],
    } = req.body;

    // Filter out empty objects
    const nonEmptyFormDetailData = formDetailData.filter(r => Object.keys(r).length > 0);
    const nonEmptyBatchData = batchData.filter(r => Object.keys(r).length > 0);
    const nonEmptyFormDtlInqData = formDtlInqData.filter(r => Object.keys(r).length > 0);

    // ------------------ PROCEDURE LOGIC FIRST ------------------
    const processedKeys = new Set();
    for (const item of nonEmptyFormDetailData) {
      let qty_ok_in_stk_um = item.qty_ok_in_stk_um ?? null;

      const batchControlRes = await db.query(
        `SELECT chk_it_batch_control($1) as control`,
        [formData.it_code]
      );
      const batchControl = batchControlRes.rows[0]?.control;

      if (batchControl === "Y") {
        const batchTot = nonEmptyBatchData.find(b => b.it_code === formData.it_code)?.tot_accepted || 0;
        if (qty_ok_in_stk_um !== batchTot) {
          // optional validation
        }
      }

      if (formData.sale_return !== 5) {
        await db.query(
          `CALL value_mrir($1::bigint, $2::varchar, $3::varchar)`,
          [item.po_id, formData.it_code, formData.mrir_no]
        );
      }

      const key = `${formData.mrir_no}-${formData.it_code}`;
      if (!["G", "I"].includes(item.status_flg) && !processedKeys.has(key)) {
        const params = [
          formData.mrir_no,
          formData.it_code,
          Number(qty_ok_in_stk_um) || 0,
          Number(item.qty_converted) || 0,
          Number(item.qty_acp_in_pur_um) || 0,
          Number(item.conversion_factor) || 1,
          item.um_code,
          formData.v_code,
          item.clear_dt ? new Date(item.clear_dt) : new Date(),
          Number(item.qty_recd) || 0,
          parseInt(divisionId, 10),
          item.it_pu_um,
        ];  

        console.log("Calling update_tommmain with params:", params);

        await db.query(
          `CALL integral.update_tommmain(
            $1::varchar,$2::varchar,$3::numeric,$4::numeric,$5::numeric,
            $6::numeric,$7::varchar,$8::varchar,$9::date,$10::numeric,
            $11::smallint,$12::varchar
          )`,
          params
        );

        processedKeys.add(key);
      }
    }

    // ------------------ DELETE operations ------------------
    if (deletedTdmmrctData.length) {
      await deleteRecords(TABLE_NAMES.TDMMMRCT, deletedTdmmrctData, ["ge_id", "it_code"]);
    }
    if (deletedTommiqciData.length) {
      await deleteRecords(TABLE_NAMES.TOMMIQCI, deletedTommiqciData, ["mrir_no"]);
    }
    if (deletedBatchData.length) {
      await deleteRecords(TABLE_NAMES.TDMMRCT_BATCH, deletedBatchData, ["ge_id", "it_code"]);
    }

    // ------------------ UPSERT operations ------------------
    if (nonEmptyFormDetailData.length) {
      await upsertRecords(
        TABLE_NAMES.TDMMMRCT,
        nonEmptyFormDetailData,
        transTdmmrctDataToDbData,
        formData.it_name,
        "create_id"
      );
    }

    if (nonEmptyFormDtlInqData.length) {
      await upsertRecords(
        TABLE_NAMES.TOMMIQCI,
        nonEmptyFormDtlInqData,
        transTommiqciToDbData,
        formData.mrir_no,
        "create_id"
      );
    }

    if (nonEmptyBatchData.length) {
      await upsertRecords(
        TABLE_NAMES.TDMMRCT_BATCH,
        nonEmptyBatchData,
        transTdmmrctBatchToDbData,
        formData.mrir_no,
        "create_id"
      );
    }

    // ------------------ COMMIT ------------------
    await db.query("COMMIT");
    return res.status(200).json({ success: true, message: "Data processed successfully" });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in postInqciData:", error);
    return res.status(500).json({ success: false, message: "Error processing data", error });
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
  const { step } = req.query;

  if (step === "param") {
    await postParamData(req, res);
    return;
  }

  if (step === "batch") {
    await postBatchData(req, res);
    return;
  } 
  
    if (step === "dvtn") {
    await postDvtnData(req, res);
    return;
  }   
  
   if (step === "showDvtn") {
    await postShowDvtnData(req, res);
    return;
  }   


  if (step === "submit") {
    const { form_status } = req.query;  


    if (form_status === "Update") {
      await postInqciData(req, res);
    } else {
      await updateInqciData(req, res);
    }
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
