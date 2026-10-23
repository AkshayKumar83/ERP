const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater, dateFormate } = require("../../../../utility/constant");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../../utility/query");
//const { SnowDeviceManagement } = require("aws-sdk");

const TABLE_NAMES = {
  MHFMBSSEQ: "mhfmbsseq",
  MDFMBSSEQ: "mdfmbsseq",
};

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId, appFinYear);

  try {
    let queryParameter = `ORDER BY formula_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(formula_id) FROM ${TABLE_NAMES.MHFMBSSEQ} where trans_year = $1;
                      `,
          [transYear]
        );
        recordCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "ORDER BY formula_id  DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = `ORDER BY formula_id LIMIT 1 OFFSET ${
          req.query.offset || 0
        }`;
        break;
    }

    const mhfmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MHFMBSSEQ} where trans_year = $1
         ${queryParameter}
                    `,
      [transYear]
    );

    if (mhfmData.rowCount == 0) {
      // throw new Error("No matching record found");
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        mhfmData: [],
        recordCount: 0,
      });
    }

    const seqNo = mhfmData.rows[0]?.seq_no;
    const flag = mhfmData.rows[0]?.bs_pl_flag;
    const formulaId = mhfmData.rows[0].formula_id;
    const assFlag = mhfmData.rows[0].ass_lib_inc_exp_sch_flag;

    // POST QUERY DATA

    const descDtl = await db.query(
      `select description
from mofmbspl
where sno= $1
and trans_year=$2
and ASS_LIB_INC_EXP_APP_SCH_FLAG=$3
AND BS_PL_FLAG = $4
and division_id = $5`,
      [seqNo, appFinYear, assFlag, flag, divisionId]
    );

    if (mhfmData.rows.length > 0) {
      mhfmData.rows[0].seqh =
        descDtl.rowCount > 0 ? descDtl.rows[0]?.description : "";
    }

    const mdfmData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MDFMBSSEQ}
 WHERE formula_id = $1
 `,
      [formulaId]
    );

    // POST-QUERY DATA
    if (mdfmData.rows.length > 0) {
      await Promise.all(
        mdfmData.rows.map(async (item) => {
          if (item.seq_no !== null) {
            const descDtl = await db.query(
              `  select description 
  from mofmbspl
  where sno=$1
    and trans_year=$2
    and ASS_LIB_INC_EXP_APP_SCH_FLAG=$3
    and division_id = $4 `,
              [
                item.seq_no,
                appFinYear,
                item.ass_lib_inc_exp_sch_flag,
                appDivisionId,
              ]
            );

            item.seqd = descDtl.rows[0]?.description || null;
          }
        })
      );
    }

    const responseData = {
      mhfmData: mhfmData.rows[0],
      mdfmData: mdfmData.rows,
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
  const {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    bs_pl_flag,
  } = req?.query;
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "seqh") {
    const seqhDtl = await db.query(
      `SELECT SUBSTR(DESCRIPTION,1,60) as description ,SNO FROM MOFMBSPL
WHERE /*ASS_LIB_INC_EXP_APP_SCH_FLAG=:MHFMBSSEQ.ASS_LIB_INC_EXP_SCH_FLAG
AND */TRANS_YEAR=$1
AND BS_PL_FLAG = $2`,
      [appFinYear, bs_pl_flag]
    );

    return res.status(200).json(seqhDtl.rows);
  } else if (help_list === "seqd") {
    const seqdDtl = await db.query(
      `SELECT SUBSTR(DESCRIPTION,1,60) as description ,SNO FROM MOFMBSPL
WHERE /*ASS_LIB_INC_EXP_APP_SCH_FLAG=:MHFMBSSEQ.ASS_LIB_INC_EXP_SCH_FLAG
AND */TRANS_YEAR=$1
AND BS_PL_FLAG = $2`,
      [appFinYear, bs_pl_flag]
    );

    return res.status(200).json(seqdDtl.rows);
  }
};

exports.getValidateData = catchAsync(async (req, res) => {
  let {
    seq_no,
    bs_pl_flag,
    ass_lib_inc_exp_sch_flag,
    appDivisionId,
    appFinYear,
  } = req.query;

  try {
    if (!seq_no || !bs_pl_flag || !ass_lib_inc_exp_sch_flag) {
      return;
    }
    if (seq_no && bs_pl_flag && ass_lib_inc_exp_sch_flag) {
      // 1st check: Validate if acc_no and inv_dt already exist in tofminvsumm
      const existingRecord = await db.query(
        `SELECT FORMULA_ID 
      FROM MHFMBSSEQ
      WHERE ASS_LIB_INC_EXP_SCH_FLAG=$1
        AND SEQ_NO= $2
        AND TRANS_YEAR = $3
        AND BS_PL_FLAG = $4`,
        [ass_lib_inc_exp_sch_flag, seq_no, appFinYear, bs_pl_flag]
      );

      const formulaId = existingRecord.rows[0]?.formula_id;

      if (existingRecord.rows.length > 0) {
        return res.status(400).json({
          error: `Formula Already Exists Under Formula ID ${formulaId}`,
        });
      }
    }

    // No validation errors
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const postBalanceFormulaeDetails = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { formData, formDetailData, transYear, divisionId } = req.body;
    //  console.log("req body:", req.body);

    //------------for duplicate record
    const existingRecord = await db.query(
      `SELECT FORMULA_ID 
      FROM MHFMBSSEQ
      WHERE ASS_LIB_INC_EXP_SCH_FLAG=$1
        AND SEQ_NO= $2
        AND TRANS_YEAR = $3
        AND BS_PL_FLAG = $4`,
      [
        formData.ass_lib_inc_exp_sch_flag,
        formData.seq_no,
        transYear,
        formData.bs_pl_flag,
      ]
    );

    const formulaId1 = existingRecord.rows[0]?.formula_id;

    if (existingRecord.rows.length > 0) {
      return res.status(400).json({
        error: `Formula Already Exists Under Formula ID = ${formulaId1}`,
      });
    }

    // get formula_id
    const result = await db.query(
      `SELECT coalesce(MAX(FORMULA_ID),0)+1 as formula_id FROM 
MHFMBSSEQ
WHERE TRANS_YEAR=$1`,
      [transYear]
    );
    const formulaId = result.rows[0].formula_id;
    //console.log("formulaId:", formulaId);

    // Clean up the formData and add the formulaId
    const cleanFormDataForInsert = cleanObject(formData);
    cleanFormDataForInsert.formula_id = formulaId;
    cleanFormDataForInsert.trans_year = transYear;
    cleanFormDataForInsert.division_id = divisionId;
    delete cleanFormDataForInsert.seqh;

    if (Object.keys(cleanFormDataForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.MHFMBSSEQ,
      cleanFormDataForInsert
    );
    const valuesForInsertQuery = Object.values(cleanFormDataForInsert);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);  

    // Check if formDetailData is effectively empty
const isFormDetailDataEmpty =
  !Array.isArray(formDetailData) ||
  formDetailData.length === 0 ||
  formDetailData.every((obj) =>
    Object.entries(obj).every(
      ([key, value]) =>
        key === "id" || 
        key === "transYear" || 
        value === "" ||
        value === null ||
        value === undefined
    )
  );

    // Prepare and insert formDetailData
    if (!isFormDetailDataEmpty) {
      console.log("formafetaix");

    
      const formDetailArray = Array.isArray(formDetailData)
        ? formDetailData
        : [formDetailData];

      for (const [index, record] of formDetailArray.entries()) {
        // Add formula_id and remove unnecessary fields
        record.formula_id = formulaId;
        record.trans_year = transYear;
        delete record.seqd;
        delete record.id;
        delete record.init_flag;
        delete record.init_bs_pl_flag;
        delete record.init_trans_year;
        delete record.init_seq_no;

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MDFMBSSEQ,
          record
        );
        const valuesForInsertQuery = Object.values(record);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(
            `Error inserting division record at index ${index}:`,
            error
          );
          throw new Error(`Division insert error at index ${index}`);
        }
      }
    }

    await db.query("COMMIT");
    // Respond only if this is the final step
    return res.status(200).json({
      success: true,
      message: `formula Id IS ${formulaId}`,
      formula_id: formulaId,
    });
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query("ROLLBACK");
    return res.status(400).send("Some error occurred");
  }
};

const updateBalanceFormulaeDetails = async (req, res) => {
  const { formData, formDetailData, deletedData } = req.body;

  try {
    await db.query("BEGIN");
    const formula_id = formData?.formula_id;
    const division_id = formData?.division_id;
    const trans_year =  formData?.trans_year;

    // 1. Update THFMTRANGST main form data
    if (Object.keys(req.body).length !== 0) {
      const dataForInsert = { ...formData };

      // Remove unwanted fields
      ["seqh"].forEach((field) => delete dataForInsert[field]);

      const dataForUpdate = cleanObject(dataForInsert);
      const columns = Object.keys(dataForUpdate);
      const values = Object.values(dataForUpdate);

      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      const query = `UPDATE ${TABLE_NAMES.MHFMBSSEQ}
                     SET ${setClause}
                     WHERE formula_id = $${columns.length + 1} and division_id = $${columns.length + 2} and trans_year = $${columns.length + 3} `;

      await db.query(query, [...values, formula_id, division_id, trans_year ]);
    }

    // 2. Utility to clean detail record
    function cleanRecord(record) {
      const keysToDelete = ["seqd", "id", "init_bs_pl_flag", "init_trans_year", "init_seq_no"];
      keysToDelete.forEach((key) => delete record[key]);
      return record;
    }

    // 3. Update or Insert Detail Records
    if (Array.isArray(formDetailData) && formDetailData.length > 0) {
      for (const [index, record] of formDetailData.entries()) {
        cleanRecord(record);

        console.log("formDetaildata", formDetailData);

        if (record.hasOwnProperty("formula_id") && record.formula_id) {
          // Update record

          const { init_flag, ...dataForUpdate } = cleanObject({ ...record });
          const columns = Object.keys(dataForUpdate);
          const values = Object.values(dataForUpdate);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const updateQuery = `UPDATE ${TABLE_NAMES.MDFMBSSEQ}
                               SET ${setClause}
                               WHERE formula_id = $${
                                 columns.length + 1
                               } AND trans_year = $${columns.length + 2}
                                 AND ass_lib_inc_exp_sch_flag = $${
                                   columns.length + 3
                                 }`;

          await db.query(updateQuery, [
            ...values,
            record.formula_id,
            record.trans_year,
            init_flag,
          ]);
        } else {
          
          // Insert new record
          record.formula_id = formula_id;

          delete record.seqd;
          delete record.id;
          delete record.init_flag;
         // delete record.init_flag;
          delete record.init_bs_pl_flag;
          delete record.init_trans_year;
          delete record.init_seq_no;

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MDFMBSSEQ,
            record
          );
          const valuesForInsertQuery = Object.values(record);

          await db.query(insertQuery, valuesForInsertQuery);
        }
      }
    }

    // 4. Delete detail records if needed
    if (Array.isArray(deletedData) && deletedData.length > 0) {
      for (const deletedRecord of deletedData) {
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.MDFMBSSEQ}
          WHERE formula_id  = $1 AND trans_year = $2 AND ass_lib_inc_exp_sch_flag = $3
        `;

        await db.query(deleteQuery, [
          deletedRecord.formula_id,
          deletedRecord.trans_year,
          deletedRecord.ass_lib_inc_exp_sch_flag,
        ]);
      }
    }

    // 5. Commit the transaction
    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction failed:", error);
    return res.status(500).send({
      status: "error",
      message: "Update operation failed",
      details: error.message,
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }

  //   if (["Query", "Search"].includes(req?.query?.formStatus)) {
  //     await getDataOnQuery(req, res);
  //     return;
  //   }
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateBalanceFormulaeDetails(req, res);
    return;
  } else {
    await postBalanceFormulaeDetails(req, res);
    return;
  }
});
