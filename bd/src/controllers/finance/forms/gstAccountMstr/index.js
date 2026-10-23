const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  makeNullValue,
  removeKeysFromObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  GST_ACC_MASTER: "mofmgstaccmas",
  MOMCODE: `MOMMCODE`,
};
const transFormGstAccMstr = (formData) => {
  const keysForRemove = [
    "acc_no_available_desc",
    "acc_no_int_paid_desc",
    "acc_no_inward_desc",
    "acc_no_payable_desc",
    "acc_no_penalty_paid_desc",
    "acc_no_rev_payable_desc",
    "gst_elec_cash_legr_reg_ac_desc",
    "gst_expense_acc_desc",
    "gst_prov_acc_desc",
    "init_eff_dt",
    "init_gst_perc",
    "init_gst_type",
  ];

  const updatedGstAccMstr = makeNullValue(formData);
  const readyForInsertExpVchr = removeKeysFromObject(
    updatedGstAccMstr,
    keysForRemove
  );
  // console.log('GstAccMstr from insde For Insert :', readyForInsertExpVchr)
  return readyForInsertExpVchr;
};

// On Form Render setup initial Data in form
exports.gstAccMstrFormConstants = catchAsync(async (req, res, next) => {
  try {
    // GST TYPE DROP DOWN DATA
    const gstType = await db.query(
      `SELECT DE.DESCRIPTION, DE.PREFIX
                FROM ${TABLE_NAMES.MOMCODE} DE
                WHERE DE.CAT_GROUP = 'GSTTYP'
                ORDER BY DE.DESCRIPTION`
    );
    if (gstType.rowCount <= 0) {
      throw new Error("gst Type data not found");
    }

    return res.status(200).json({
      gstTypeList: gstType.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      errMsg: `Error: while getting dropDownData due to ${error.message}`,
    });
  }
});

const getDataOnQuery = async (req, res) => {
  try {
    if (!["Insert", "Query"].includes(req.query?.get_data)) {
      throw new Error(`Data cannot be provided, contact the administrator`);
    }

    let gstAccMasData = [];
    const getData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.GST_ACC_MASTER}`
    );
    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.GST_ACC_MASTER}`
    );
    const dataCount = parseInt(getCount.rows[0]?.count);

    if (getData.rowCount > 0) {
      gstAccMasData = [...getData.rows];
      for (const [index, record] of getData.rows.entries()) {
        // 1. ACC_NO_PAYABLE_DESC
        const getAccNoPayDesc = await db.query(
          `SELECT LM.ACC_DESC as ACC_NO_PAYABLE_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 limit 1;`,
          [record.acc_no_payable]
        );
        if (getAccNoPayDesc.rowCount > 0) {
          gstAccMasData[index].acc_no_payable_desc =
            getAccNoPayDesc.rows[0].acc_no_payable_desc;
        } else {
          gstAccMasData[index].acc_no_payable_desc = "";
        }

        // 2. ACC_NO_REV_PAYABLE_DESC
        const getAccNoRevPayableDesc = await db.query(
          `SELECT LM.ACC_DESC as ACC_NO_REV_PAYABLE_DESC FROM MHFMGLM LM 
                    WHERE LM.ACC_NO = $1 limit 1`,
          [record.acc_no_rev_payable]
        );
        if (getAccNoRevPayableDesc.rowCount > 0) {
          gstAccMasData[index].acc_no_rev_payable_desc =
            getAccNoRevPayableDesc.rows[0].acc_no_rev_payable_desc;
        } else {
          gstAccMasData[index].acc_no_rev_payable_desc = "";
        }

        // 3. ACC_NO_AVAILABLE_DESC
        const getAccNoAvailableDesc = await db.query(
          `SELECT LM.ACC_DESC as ACC_NO_AVAILABLE_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 limit 1`,
          [record.acc_no_available]
        );
        if (getAccNoAvailableDesc.rowCount > 0) {
          gstAccMasData[index].acc_no_available_desc =
            getAccNoAvailableDesc.rows[0].acc_no_available_desc;
        } else {
          gstAccMasData[index].acc_no_available_desc = "";
        }

        // 4. GST ELEC CASH LEDGER REG ACC
        const getGstElecCashLgrRegAcc = await db.query(
          `SELECT LM.ACC_DESC AS GST_ELEC_CASH_LEGR_REG_AC_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 LIMIT 1`,
          [record.gst_elec_cash_legr_reg_acc]
        );
        if (getGstElecCashLgrRegAcc.rowCount > 0) {
          gstAccMasData[index].gst_elec_cash_legr_reg_ac_desc =
            getGstElecCashLgrRegAcc.rows[0].gst_elec_cash_legr_reg_ac_desc;
        } else {
          gstAccMasData[index].gst_elec_cash_legr_reg_ac_desc = "";
        }

        // 5. ACC NO INWARD DESC
        const getAccNoInwardDesc = await db.query(
          `SELECT LM.ACC_DESC as ACC_NO_INWARD_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 LIMIT 1`,
          [record.acc_no_inward]
        );
        if (getAccNoInwardDesc.rowCount > 0) {
          gstAccMasData[index].acc_no_inward_desc =
            getAccNoInwardDesc.rows[0].acc_no_inward_desc;
        } else {
          gstAccMasData[index].acc_no_inward_desc = "";
        }

        // 6. ACC NO INT PAID DESC
        const getAccNoIntpaid = await db.query(
          `SELECT LM.ACC_DESC as ACC_NO_INT_PAID_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 limit 1`,
          [record.acc_no_int_paid]
        );
        if (getAccNoIntpaid.rowCount > 0) {
          gstAccMasData[index].acc_no_int_paid_desc =
            getAccNoIntpaid.rows[0].acc_no_int_paid_desc;
        } else {
          gstAccMasData[index].acc_no_int_paid_desc = "";
        }

        // 7. ACC NO PENALTY PAID
        const getAccNoPenaltyPaid = await db.query(
          `SELECT LM.ACC_DESC AS ACC_NO_PENALTY_PAID_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 limit 1`,
          [record.acc_no_penalty_paid]
        );
        if (getAccNoPenaltyPaid.rowCount > 0) {
          gstAccMasData[index].acc_no_penalty_paid_desc =
            getAccNoPenaltyPaid.rows[0].acc_no_penalty_paid_desc;
        } else {
          gstAccMasData[index].acc_no_penalty_paid_desc = "";
        }

        // 8. GST EXPENSE ACC DESC
        const getGstExpAccNo = await db.query(
          `SELECT LM.ACC_DESC as GST_EXPENSE_ACC_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 limit 1`,
          [record.gst_expense_acc_no]
        );
        if (getGstExpAccNo.rowCount > 0) {
          gstAccMasData[index].gst_expense_acc_desc =
            getGstExpAccNo.rows[0].gst_expense_acc_desc;
        } else {
          gstAccMasData[index].gst_expense_acc_desc = "";
        }   

         // 9. GST PROVISIONAL ACC DESC
        const getGstProvAccNo = await db.query(
          `SELECT LM.ACC_DESC as GST_PROV_ACC_DESC FROM MHFMGLM LM
                    WHERE LM.ACC_NO = $1 limit 1`,
          [record.acc_no_provisional]
        );
        if (getGstProvAccNo.rowCount > 0) {
          gstAccMasData[index].gst_prov_acc_desc =
            getGstProvAccNo.rows[0].gst_prov_acc_desc;
        } else {
          gstAccMasData[index].acc_no_provisional = "";
        }
      }
      return res.status(200).json({
        type: "found",
        gstAccDetail: [...getData.rows],
        count: dataCount,
      });
    } else {
      throw new Error("No Data Found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMsg: `Internal Server ${error.message}` });
  }
};

exports.validateFields = catchAsync(async (req, res, next) => {
  const getDescFor = req.query;

  try {
    // Map of fields to their corresponding query and error message
    const fieldMappings = {
      acc_no_payable: {
        query: `SELECT LM.ACC_DESC as ACC_NO_PAYABLE_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "Payable Account Code does not exist, Please select from Help.",
      },
      acc_no_rev_payable: {
        query: `SELECT LM.ACC_DESC as ACC_NO_REV_PAYABLE_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "Reverse Payable Account Code does not exist, Please select from Help.",
      },
      acc_no_inward: {
        query: `SELECT LM.ACC_DESC as ACC_NO_INWARD_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "Inward Account Code does not exist, Please select from Help.",
      },
      gst_elec_cash_legr_reg_acc: {
        query: `SELECT LM.ACC_DESC as GST_ELEC_CASH_LEGR_REG_AC_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "Electronic Cash Ledger Account Code does not exist, Please select from Help.",
      },
      acc_no_available: {
        query: `SELECT LM.ACC_DESC as ACC_NO_AVAILABLE_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "Available Account Code does not exist, Please select from Help.",
      },
      acc_no_int_paid: {
        query: `SELECT LM.ACC_DESC as ACC_NO_INT_PAID_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "GST Interest Paid Account Code does not exist, Please select from Help.",
      },
      acc_no_penalty_paid: {
        query: `SELECT LM.ACC_DESC as ACC_NO_PENALTY_PAID_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "GST Penalty Paid Account Code does not exist, Please select from Help.",
      },
      gst_expense_acc_no: {
        query: `SELECT LM.ACC_DESC as GST_EXPENSE_ACC_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "GST Expense Account Code does not exist, Please select from Help.",
      }, 
       acc_no_provisional: {
        query: `SELECT LM.ACC_DESC as GST_EXPENSE_ACC_DESC FROM MHFMGLM LM WHERE LM.ACC_NO = $1 LIMIT 1`,
        errorMessage:
          "GST Provisional Account Code does not exist, Please select from Help.",
      },
    };

    // Check for the first valid field in the request
    const fieldKey = Object.keys(getDescFor).find((key) => fieldMappings[key]);
    if (!fieldKey) {
      return res
        .status(400)
        .json({ errMsg: "Invalid field provided in request." });
    }

    const { query, errorMessage } = fieldMappings[fieldKey];
    const fieldValue = getDescFor[fieldKey];

    // Execute the query
    const result = await db.query(query, [fieldValue]);
    if (result.rowCount === 0) {
      throw new Error(errorMessage);
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errMsg: `Error: ${error.message}` });
  }
});

exports.getValidateData = catchAsync(async (req, res) => {
  console.log("getvalidate");
  try {
    const { gst_type, gst_pers, eff_dt, record_id } = req.query;

    // Return if any required field is empty
    if (!gst_type || !gst_pers || !eff_dt || !record_id) {
      return;
    }
    // 1. Check for duplicate
    const duplicateCheckQuery = `
     SELECT *
			    FROM MOFMGSTACCMAS
			   WHERE gst_type = $1
			     AND gst_pers = $2
			     AND eff_dt = $3
				 AND record_id = $4
    `;
    const duplicateResult = await db.query(duplicateCheckQuery, [
      gst_type,
      gst_pers,
      eff_dt,
      record_id,
    ]);
    if (duplicateResult.rowCount > 0) {
      return res.status(400).json({
        message: "GST Type, GST % and Eff. Date combination already exist.",
      });
    }

    return res.status(200).json({ message: "Validation successful" });
  } catch (err) {
    console.error("Validation Error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error during validation." });
  }
});

const insertGstAccMstr = async (req, res) => {
  console.log("this function called!");
  let gstAccMstrDetail = [...req?.body.gstAccMstr];
  if (!gstAccMstrDetail.length) {
    return res.status(404).json({ message: "please insert new Record" });
  }
  try {
    await db.query("Begin");

    for (const [index, record] of gstAccMstrDetail.entries()) {
      const getRecrdId = await db.query(`SELECT nextval('s_record_id')`);
      record.record_id = getRecrdId.rows[0].nextval;  

      if (record.gst_pers === '' || record.gst_pers === 'undefined') {
           record.gst_pers = null
      }
      
        if (record.gst_state_code === '' || record.gst_state_code === 'undefined') {
           record.gst_state_code = null
      }

      // 1. Check for duplicate
      const duplicateCheckQuery = `
     SELECT *
			    FROM MOFMGSTACCMAS
			   WHERE gst_type = $1
			     AND gst_pers = $2
			     AND eff_dt = $3
				 AND record_id = $4
    `;
      const duplicateResult = await db.query(duplicateCheckQuery, [
        record.gst_type,
        record.gst_pers,
        record.eff_dt,
        record.record_id,
      ]);
      if (duplicateResult.rowCount > 0) {
        return res.status(400).json({
          message: "GST Type, GST % and Eff. Date combination already exist.",
        });
      }

      const finalGstAccMstrData = transFormGstAccMstr(record);

      try {
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.GST_ACC_MASTER,
          finalGstAccMstrData,
          "create_date"
        );

        const valuesForInsertQuery = Object.values(finalGstAccMstrData);
        // console.log("gst Acc detail query", queryForInsert);
        // console.log("gst Acc  detail insert query", valuesForInsertQuery);
        await db.query(queryForInsert, [...valuesForInsertQuery]);
      } catch (error) {
        // Handle individual record insert error
        console.error(`Error inserting record at index ${index}:`, error);
        throw Error(error);
      }
    }
    await db.query("COMMIT"); // for the time being
    res.send({ type: "created" });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

const updateGstAccMstr = async (req, res) => {
  console.log("this function called at update");
  const deletedRecords = req?.body?.deletedGstAccMstr || [];
  const updatedRecords = req?.body?.updatedGstAccMstr || [];
  const newRecords = req?.body?.newGstAccMstr || [];
  const accGstData = req?.body?.accGstData

  try {
    await db.query("BEGIN");

    // Insert New Records
    if (newRecords.length) {
      for (const [index, record] of newRecords.entries()) { 

        if (record.gst_pers === '' || record.gst_pers === 'undefined') {
           record.gst_pers = null
      }  

        const getRecrdId = await db.query(`SELECT nextval('s_record_id')`);
        record.record_id = getRecrdId.rows[0].nextval;

        // 1. Check for duplicate
        const duplicateCheckQuery = `
     SELECT *
			    FROM MOFMGSTACCMAS
			   WHERE gst_type = $1
			     AND gst_pers = $2
			     AND eff_dt = $3
				 AND record_id = $4
    `;
        const duplicateResult = await db.query(duplicateCheckQuery, [
          record.gst_type,
          record.gst_pers,
          record.eff_dt,
          record.record_id,
        ]);
        if (duplicateResult.rowCount > 0) {
          return res.status(400).json({
            message: "GST Type, GST % and Eff. Date combination already exist.",
          });
        }

        const finalGstAccMstrData = transFormGstAccMstr(record);

        try {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.GST_ACC_MASTER,
            finalGstAccMstrData,
            "create_date"
          );

          const valuesForInsertQuery = Object.values(finalGstAccMstrData);
          // console.log("gst Acc detail query", queryForInsert);
          // console.log("gst Acc  detail insert query", valuesForInsertQuery);
          await db.query(queryForInsert, [...valuesForInsertQuery]);
        } catch (error) {
          // Handle individual record insert error
          console.error(`Error inserting record at index ${index}:`, error);
          throw Error(error);
        }
      }
    }

    // Update Existing Records
    if (updatedRecords.length) {
      for (const [index, record] of updatedRecords.entries()) { 

        if (record.gst_pers === '' || record.gst_pers === 'undefined') {
           record.gst_pers = null
      }  

        const finalGstAccMstrData = transFormGstAccMstr(record);
        const recordId = finalGstAccMstrData.record_id;
        delete finalGstAccMstrData.record_id; // deleted record_id
        delete finalGstAccMstrData.update_date; // deleted update_date to set new Updated date
        delete finalGstAccMstrData.init_eff_dt;
        delete finalGstAccMstrData.init_gst_pers;
        delete finalGstAccMstrData.init_gst_type;

        const columns = Object.keys(finalGstAccMstrData);
        const values = Object.values(finalGstAccMstrData);

        // Create SET clause for SQL UPDATE query
        const setClause = columns
          .map((column, idx) => `${column} = $${idx + 1}`)
          .join(", ");

        const query = `UPDATE ${
          TABLE_NAMES.GST_ACC_MASTER
        } SET ${setClause}, update_date = fetch_create_update_date() WHERE record_id = $${
          columns.length + 1
        }`;

        try {
          await db.query(query, [...values, recordId]);
        } catch (error) {
          console.error(`Error updating record at index ${index}:`, error);
          throw Error(`Update failed for record at index ${index}`);
        }
      }
    }

    // Delete Records
    if (deletedRecords.length) {
      for (const [index, record] of deletedRecords.entries()) {
        const deleteQuery = `DELETE FROM ${TABLE_NAMES.GST_ACC_MASTER} WHERE record_id = $1`;
        try {
          await db.query(deleteQuery, [record.record_id]);
        } catch (error) {
          console.error(`Error deleting record at index ${index}:`, error);
          throw Error(`Deletion failed for record at index ${index}`);
        }
      }
    }

    await db.query("COMMIT"); // Commit if everything succeeds
    res.status(200).json({ type: "updated" });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK"); // Rollback if something fails
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const helpListData = async (req, res) => {
  const { help_list } = req.query; // Make sure these are extracted from the request
  try {
    if (
      [
        "acc_no_payable",
        "acc_no_rev_payable",
        "acc_no_inward",
        "gst_elec_cash_legr_reg_acc",
        "acc_no_available",
        "acc_no_int_paid",
        "acc_no_penalty_paid",
        "gst_expense_acc_no",
        "acc_no_provisional"
      ].includes(help_list)
    ) {
      const helpListData = await db.query(
        `SELECT LM.ACC_NO, LM.ACC_DESC FROM MHFMGLM LM ORDER BY LM.ACC_NO`
      );
      if (helpListData.rowCount > 0) {
        return res.status(200).json(helpListData.rows);
      } else {
        return res.status(200).json([]);
      }
    } else if (help_list === "gst_pers") {
      const getGstPers = await db.query(
        ` WITH latest_dates AS (
        SELECT DISTINCT ON (GST_STATE_CODE, HSN_SAC_CODE, AMOUNT_FROM, AMOUNT_TO)
            GST_STATE_CODE,
            HSN_SAC_CODE,
            AMOUNT_FROM,
            AMOUNT_TO,
            EFF_DT
        FROM MOSMGST_STATE
        WHERE EFF_DT IS NOT NULL
        ORDER BY GST_STATE_CODE, HSN_SAC_CODE, AMOUNT_FROM, AMOUNT_TO, EFF_DT DESC
        )

        SELECT DISTINCT GSTP
        FROM (
        SELECT CASE $1
                WHEN 'C' THEN TE.CGST_PERC
                WHEN 'I' THEN TE.IGST_PERC
                WHEN 'S' THEN TE.SGST_PERC
                WHEN 'U' THEN TE.UGST_PERC
                ELSE NULL
                END AS GSTP
        FROM MOSMGST_STATE TE
        JOIN latest_dates LD ON COALESCE(TE.GST_STATE_CODE, '@') = COALESCE(LD.GST_STATE_CODE, '@')
            AND TE.HSN_SAC_CODE = LD.HSN_SAC_CODE
            AND TE.AMOUNT_FROM = LD.AMOUNT_FROM
            AND TE.AMOUNT_TO = LD.AMOUNT_TO
        WHERE $1 <> 'D'
        
        UNION

        SELECT TE.CGST_CESS_PERC AS GSTP
        FROM MOSMGST_STATE TE
        JOIN latest_dates LD ON COALESCE(TE.GST_STATE_CODE, '@') = COALESCE(LD.GST_STATE_CODE, '@')
            AND TE.HSN_SAC_CODE = LD.HSN_SAC_CODE
            AND TE.AMOUNT_FROM = LD.AMOUNT_FROM
            AND TE.AMOUNT_TO = LD.AMOUNT_TO
        WHERE $1 = 'D'
        
        UNION

        SELECT TE.IGST_CESS_PERC AS GSTP
        FROM MOSMGST_STATE TE
        JOIN latest_dates LD ON COALESCE(TE.GST_STATE_CODE, '@') = COALESCE(LD.GST_STATE_CODE, '@')
            AND TE.HSN_SAC_CODE = LD.HSN_SAC_CODE
            AND TE.AMOUNT_FROM = LD.AMOUNT_FROM
            AND TE.AMOUNT_TO = LD.AMOUNT_TO
        WHERE $1 = 'D'
        
        UNION

        SELECT TE.SGST_CESS_PERC AS GSTP
        FROM MOSMGST_STATE TE
        JOIN latest_dates LD ON COALESCE(TE.GST_STATE_CODE, '@') = COALESCE(LD.GST_STATE_CODE, '@')
            AND TE.HSN_SAC_CODE = LD.HSN_SAC_CODE
            AND TE.AMOUNT_FROM = LD.AMOUNT_FROM
            AND TE.AMOUNT_TO = LD.AMOUNT_TO
        WHERE $1 = 'D'
        
        UNION

        SELECT TE.UGST_CESS_PERC AS GSTP
        FROM MOSMGST_STATE TE
        JOIN latest_dates LD ON COALESCE(TE.GST_STATE_CODE, '@') = COALESCE(LD.GST_STATE_CODE, '@')
            AND TE.HSN_SAC_CODE = LD.HSN_SAC_CODE
            AND TE.AMOUNT_FROM = LD.AMOUNT_FROM
            AND TE.AMOUNT_TO = LD.AMOUNT_TO
        WHERE $1 = 'D'
        ) AS subquery
        ORDER BY 1;
`,
        [req?.query?.gst_type]
      );
      if (getGstPers.rowCount > 0) {
        return res.status(200).json(getGstPers.rows);
      } else {
        return res.status(200).json([]);
      }
    } else {
      return res.status(400).json({ error: "Invalid request" }); // Handle invalid requests
    }
  } catch (error) {
    console.error("Database query error:", error); // Log the error
    return res.status(500).json({ error: "Internal server error" }); // Handle the error gracefully
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
  if (req?.query?.acc_no_pay) {
    await validateAccNoPayable(req, res);
    return;
  }
});

exports.submitFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateGstAccMstr(req, res);
    return;
  } else {
    await insertGstAccMstr(req, res);
    return;
  }
});
