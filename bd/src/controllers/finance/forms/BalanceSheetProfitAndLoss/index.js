const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { transformBalanceSheetDetailToDbData } = require("./presentation");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOFMBSPL_TABLE: "mofmbspl",
};

//data Fetch Function
const getDataOnQuery = async (req, res) => {
  const { appDivisionId, appFinYear } = req.query;
  try {
    const getData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOFMBSPL_TABLE}
       WHERE division_id = $1
       AND trans_year = $2
       ORDER BY sno`,
      [appDivisionId, appFinYear]
    );

    if (getData.rowCount === 0) {
      return res.status(200).json({
        type: "empty",
        message: "No data found",
        balSheetPL: [],
        totalCount: 0,
      });
    }

    return res.status(200).json({
      type: "found",
      balSheetPL: getData.rows,
      totalCount: getData.rowCount,
    });
  } catch (error) {
    console.error("Error in getBalSheetProfitLossDataOnQuery:", error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};

// helpList Function
const helpListData = async (req, res) => {
  const { help_list } = req.query;

  const validHelpLists = ["RollupAcc"];

  if (validHelpLists.includes(help_list)) {
    const result = await db.query(
      `SELECT DISTINCT rollup_acc1 || rollup_acc2 AS rollup_acc1
FROM mhfmglm
WHERE rollup_acc1 IS NOT NULL
ORDER BY 1;
`
    );
    return res.status(200).json(result.rows);
  }
  return res.status(400).json({ message: "Invalid help_list value" });
};

exports.getValidateData = catchAsync(async (req, res) => {
  let {
    sno,
    bs_pl_flag,
    ass_lib_inc_exp_app_sch_flag,
    appDivisionId,
    appFinYear,
    trans_year,
    description,
    line_flag,
    total_flag,
    plus_minus,
    schd_no,
    sch_sno,
    heading_flag,
    rollup_acc1,
  } = req.query;

  try {
    if (sno && bs_pl_flag && ass_lib_inc_exp_app_sch_flag) {
      // console.log("sno", sno, bs_pl_flag, ass_lib_inc_exp_app_sch_flag);
      // console.log("Query Parameters:", [appFinYear, sno, bs_pl_flag, ass_lib_inc_exp_app_sch_flag]);

      const existingRecord = await db.query(
        ` select * from mofmbspl
    where trans_year = $1
      and sno = $2
      and bs_pl_flag = $3
      and ass_lib_inc_exp_app_sch_flag = $4`,
        [appFinYear, sno, bs_pl_flag, ass_lib_inc_exp_app_sch_flag]
      );

      if (existingRecord.rowCount > 0) {
        // console.log("Seq already exists");
        return res.status(400).json({
          error: "Seq. already exists.",
        });
      }
    }

    if (schd_no && ass_lib_inc_exp_app_sch_flag) {
      const existingRecord = await db.query(
        `  SELECT * FROM MOFMBSPL
    WHERE TRANS_YEAR = $1
      AND ASS_LIB_INC_EXP_APP_SCH_FLAG = $2
      AND SCHD_NO = $3`,
        [appFinYear, ass_lib_inc_exp_app_sch_flag, schd_no]
      );

      if (existingRecord.rows.length > 0) {
        return res.status(400).json({
          error: "This Schedule No. already defined.",
        });
      }
    }

    if (
      (sch_sno,
      description &&
        bs_pl_flag &&
        ass_lib_inc_exp_app_sch_flag &&
        total_flag &&
        line_flag &&
        heading_flag &&
        plus_minus)
    ) {
      const existingRecord = await db.query(
        `   select * from mofmbspl
	      where bs_pl_flag = $1
	        and ass_lib_inc_exp_app_sch_flag = $2
	        and trans_year = $3
	        and description = $4
	        and coalesce(total_flag,'N') = $5
	        and coalesce(line_flag,'N') = $6
	        and coalesce(heading_flag,'N') = $7
	        and coalesce(plus_minus,'N') = $8`,
        [
          bs_pl_flag,
          ass_lib_inc_exp_app_sch_flag,
          appFinYear,
          description,
          total_flag,
          line_flag,
          heading_flag,
          plus_minus,
        ]
      );

      if (existingRecord.rows.length > 0) {
        return res.status(400).json({
          error: "Combination already exist",
        });
      }
    }

    if (rollup_acc1 && bs_pl_flag && schd_no && ass_lib_inc_exp_app_sch_flag) {
      // 1. Check if rollup account already exists with same flag

      // console.log(
      //   "rollup account",
      //   rollup_acc1 && bs_pl_flag && schd_no && ass_lib_inc_exp_app_sch_flag
      // );
      const existingRecord = await db.query(
        `SELECT * FROM mofmbspl
     WHERE bs_pl_flag = $1
       AND ass_lib_inc_exp_app_sch_flag = $2
       AND schd_no = $3
       AND rollup_acc1 = $4
     LIMIT 1`,
        [bs_pl_flag, ass_lib_inc_exp_app_sch_flag, schd_no, rollup_acc1]
      );

      if (existingRecord.rows.length > 0) {
        return res.status(400).json({
          error: "Rollup Account already defined",
        });
      }

      // 2. Additional check if flag is 'S'
      if (ass_lib_inc_exp_app_sch_flag === "S") {
        const specialCaseRecord = await db.query(
          `SELECT *
       FROM mhfmglm g
       JOIN mofmbspl b ON b.rollup_acc1 = g.rollup_acc1
       WHERE b.bs_pl_flag = $1
         AND b.schd_no = $2
         AND b.ass_lib_inc_exp_app_sch_flag != 'S'
         AND g.rollup_acc2 = $3
       LIMIT 1`,
          [bs_pl_flag, schd_no, rollup_acc1] // removed ass_lib_inc_exp_app_sch_flag from parameters
        );

        if (specialCaseRecord.rows.length > 0) {
          return res.status(400).json({
            // error:
            //   "Another schedule with a different flag exists for this rollup account",
          });
        }
      } else {
        // 3. Check if rollup_acc1 exists in mhfmglm when flag is not 'S'
        const accExists = await db.query(
          `SELECT * FROM mhfmglm WHERE rollup_acc1 = $1 LIMIT 1`,
          [rollup_acc1]
        );

        if (accExists.rows.length === 0) {
          return res.status(400).json({
            // error: "Rollup Account does not exist in mhfmglm",
          });
        }
      }
    }

    // No validation errors
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// InsertFunction

const insertFormData = async (req, res) => {
  try {
    await db.query("begin");

    const { formHdrData, formDtlData, appFinYear } = req.body;

    console.log("insert");

    const bs_pl_flag = formHdrData.bs_pl_flag;
    const ass_lib_inc_exp_app_sch_flag =
      formHdrData.ass_lib_inc_exp_app_sch_flag;

    //  const headerData = transformBalanceSheetHeaderToDbData(formHdrData, user);
    //  await db.query(queryForInsertHeader, Object.values(headerData));
    const formDtlArray = Array.isArray(formDtlData)
      ? formDtlData
      : [formDtlData];

    // Only take records that have an 'id' field
    const filteredRecords = formDtlArray.filter((record) => record.id);

    // Detail Rows Insert
    for (const detailRow of filteredRecords) {
      console.log("filtered", filteredRecords);

      // for duplicate check

      // Duplicate check 1 — by sno
      const existingRecord = await db.query(
        `SELECT * FROM mofmbspl
      WHERE trans_year = $1
        AND sno = $2
        AND bs_pl_flag = $3
        AND ass_lib_inc_exp_app_sch_flag = $4`,
        [
          detailRow.trans_year,
          detailRow.sno,
          detailRow.bs_pl_flag,
          detailRow.ass_lib_inc_exp_app_sch_flag,
        ]
      );

      if (existingRecord.rowCount > 0) {
        console.log("Duplicate found in mofmbspl (sno check):", {
          trans_year: appFinYear,
          sno: detailRow.sno,
          bs_pl_flag,
          ass_lib_inc_exp_app_sch_flag,
          existingRows: existingRecord.rows,
        });
        return res.status(400).json({ error: "Seq. already exists." });
      }

      // Duplicate check 2 — by schd_no
      const existingRecord1 = await db.query(
        `SELECT * FROM mofmbspl
      WHERE trans_year = $1
        AND ass_lib_inc_exp_app_sch_flag = $2
        AND schd_no = $3`,
        [
          detailRow.trans_year,
          detailRow.ass_lib_inc_exp_app_sch_flag,
          detailRow.schd_no,
        ]
      );

      if (existingRecord1.rows.length > 0) {
        console.log("Duplicate found in mofmbspl (Schedule No check):", {
          trans_year: appFinYear,
          schd_no: detailRow.schd_no,
          ass_lib_inc_exp_app_sch_flag,
          existingRows: existingRecord1.rows,
        });
        return res
          .status(400)
          .json({ error: "This Schedule No. already defined." });
      }

      // Duplicate check 3 — Rollup Account
      const existingRecord2 = await db.query(
        `SELECT * FROM mofmbspl
      WHERE bs_pl_flag = $1
        AND ass_lib_inc_exp_app_sch_flag = $2
        AND schd_no = $3
        AND rollup_acc1 = $4
      LIMIT 1`,
        [
          detailRow.bs_pl_flag,
          detailRow.ass_lib_inc_exp_app_sch_flag,
          detailRow.schd_no,
          detailRow.rollup_acc1,
        ]
      );

      if (existingRecord2.rows.length > 0) {
        console.log("Duplicate found in mofmbspl (Rollup Account check):", {
          bs_pl_flag,
          ass_lib_inc_exp_app_sch_flag,
          schd_no: detailRow.schd_no,
          rollup_acc1: detailRow.rollup_acc1,
          existingRows: existingRecord2.rows,
        });
        return res
          .status(400)
          .json({ error: "Rollup Account already defined" });
      }

      // Duplicate check 4 — Combination check
      const existingRecord3 = await db.query(
        `SELECT * FROM mofmbspl
      WHERE bs_pl_flag = $1
        AND ass_lib_inc_exp_app_sch_flag = $2
        AND trans_year = $3
        AND description = $4
        AND coalesce(total_flag, 'N') = $5
        AND coalesce(line_flag, 'N') = $6
        AND coalesce(heading_flag, 'N') = $7
        AND coalesce(plus_minus, 'N') = $8`,
        [
          detailRow.bs_pl_flag,
          detailRow.ass_lib_inc_exp_app_sch_flag,
          detailRow.trans_year,
          detailRow.description,
          detailRow.total_flag,
          detailRow.line_flag,
          detailRow.heading_flag,
          detailRow.plus_minus,
        ]
      );

      if (existingRecord3.rows.length > 0) {
        console.log("Duplicate found in mofmbspl (Combination check):", {
          bs_pl_flag,
          ass_lib_inc_exp_app_sch_flag,
          trans_year: appFinYear,
          description: detailRow.description,
          total_flag: detailRow.total_flag,
          line_flag: detailRow.line_flag,
          heading_flag: detailRow.heading_flag,
          plus_minus: detailRow.plus_minus,
          existingRows: existingRecord3.rows,
        });
        return res.status(400).json({ error: "Combination already exist" });
      }

      delete detailRow.init_description, delete detailRow.id;

      let mofmbsplData = transformBalanceSheetDetailToDbData(
        detailRow,
        req.user
      );
      mofmbsplData.ass_lib_inc_exp_app_sch_flag = ass_lib_inc_exp_app_sch_flag;
      mofmbsplData.bs_pl_flag = bs_pl_flag;

      const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.MOFMBSPL_TABLE,
        mofmbsplData
      );

      const valuesForInsertQuery = Object.values(mofmbsplData);

      await db.query(queryForInsert, valuesForInsertQuery);
    }

    await db.query("commit");

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    await db.query("rollback");
    console.error("Insert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateBalSheetPlDetails = async (req, res) => {
  const { formHdrData, formDtlData, deletedData } = req.body;

  try {
    await db.query("BEGIN");

    if (Array.isArray(formDtlData) && formDtlData.length > 0) {
      console.log("formDetalData", formDtlData);
      for (const [index, record] of formDtlData.entries()) { 


        
      // Duplicate check 1 — by sno
      const existingRecord = await db.query(
        `SELECT * FROM mofmbspl
      WHERE trans_year = $1
        AND sno = $2
        AND bs_pl_flag = $3
        AND ass_lib_inc_exp_app_sch_flag = $4`,
        [
          record.trans_year,
          record.sno,
          record.bs_pl_flag,
          record.ass_lib_inc_exp_app_sch_flag,
        ]
      );

      if (existingRecord.rowCount > 0) {
       
        return res.status(400).json({ error: "Seq. already exists." });
      }

      // Duplicate check 2 — by schd_no
      const existingRecord1 = await db.query(
        `SELECT * FROM mofmbspl
      WHERE trans_year = $1
        AND ass_lib_inc_exp_app_sch_flag = $2
        AND schd_no = $3`,
        [
          record.trans_year,
          record.ass_lib_inc_exp_app_sch_flag,
          record.schd_no,
        ]
      );

      if (existingRecord1.rows.length > 0) {
     
        return res
          .status(400)
          .json({ error: "This Schedule No. already defined." });
      }

      // Duplicate check 3 — Rollup Account
      const existingRecord2 = await db.query(
        `SELECT * FROM mofmbspl
      WHERE bs_pl_flag = $1
        AND ass_lib_inc_exp_app_sch_flag = $2
        AND schd_no = $3
        AND rollup_acc1 = $4
      LIMIT 1`,
        [
          record.bs_pl_flag,
          record.ass_lib_inc_exp_app_sch_flag,
          record.schd_no,
          record.rollup_acc1,
        ]
      );

      if (existingRecord2.rows.length > 0) {
      
        return res
          .status(400)
          .json({ error: "Rollup Account already defined" });
      }

      // Duplicate check 4 — Combination check
      const existingRecord3 = await db.query(
        `SELECT * FROM mofmbspl
      WHERE bs_pl_flag = $1
        AND ass_lib_inc_exp_app_sch_flag = $2
        AND trans_year = $3
        AND description = $4
        AND coalesce(total_flag, 'N') = $5
        AND coalesce(line_flag, 'N') = $6
        AND coalesce(heading_flag, 'N') = $7
        AND coalesce(plus_minus, 'N') = $8`,
        [
          record.bs_pl_flag,
          record.ass_lib_inc_exp_app_sch_flag,
          record.trans_year,
          record.description,
          record.total_flag,
          record.line_flag,
          record.heading_flag,
          record.plus_minus 
        ] 
      )

      if (existingRecord3.rows.length > 0) {
    
        return res.status(400).json({ error: "Combination already exist" });
      }
        if (record.sno === "") {
          record.sno = null;
        }

        if (record.sch_sno === "") {
          record.sch_sno = null;
        }

        if (record.schd_no === "") {
          record.schd_no = null;
        }

        // Remove UI-specific fields
        const { id } = record;
        const cleanRecord = cleanObject({ ...record });

        cleanRecord.bs_pl_flag = formHdrData.bs_pl_flag;
        cleanRecord.ass_lib_inc_exp_app_sch_flag =
          formHdrData.ass_lib_inc_exp_app_sch_flag;
        delete cleanRecord.id;
        delete cleanRecord.init_description;
        delete cleanRecord.init_sno;
        delete cleanRecord.init_sch_no;
        delete cleanRecord.init_schd_no;
        delete cleanRecord.init_rollup_acc1;
        delete cleanRecord.init_trans_year;

        if (id) {
          // INSERT new record (no id yet)
          const insertQuery = generateSingleInsertQuery(
            "mofmbspl",
            cleanRecord
          );
          const valuesForInsert = Object.values(cleanRecord);

          console.log("Insert Query:", insertQuery, valuesForInsert);
          await db.query(insertQuery, valuesForInsert);
        } else {
          console.log("updation logic")
          // UPDATE existing record
          const { ...restOfRecord } = record;

          const cleaned = cleanObject(restOfRecord);

          delete cleaned.init_description;
          delete cleaned.init_sno;
          delete cleaned.init_trans_year;
          delete cleaned.init_schd_no
          delete cleaned.init_rollup_acc1;
          delete cleaned.init_sch_no;

          const { init_description, init_sno } = cleanObject(restOfRecord);

          const columns = Object.keys(cleaned);
          const values = Object.values(cleaned);

          const setClause = columns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
               UPDATE ${TABLE_NAMES.MOFMBSPL_TABLE}
               SET ${setClause}
               WHERE sno = $${columns.length + 1} and trans_year = $${
            columns.length + 2
          } and ass_lib_inc_exp_app_sch_flag = $${
            columns.length + 3
          } and bs_pl_flag = $${columns.length + 4} and description = $${
            columns.length + 5
          }
             
             `;

          //  console.log("Update Query:", updateQuery);
          await db.query(updateQuery, [
            ...values,
            record.init_sno,
            record.trans_year,
            record.ass_lib_inc_exp_app_sch_flag,
            record.bs_pl_flag,
            record.init_description,
          ]);
        }
      }
    }

    // Delete detail records if needed
    if (Array.isArray(deletedData) && deletedData.length > 0) {
      for (const deletedRecord of deletedData) {
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.MOFMBSPL_TABLE}
          WHERE description = $1 AND trans_year = $2 and sno = $3
        `;
        await db.query(deleteQuery, [
          deletedRecord.init_description,
          deletedRecord.init_trans_year,
          deletedRecord.init_sno,
        ]);
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction failed:", error);
    return res.status(500).send({
      status: "error",
      message: "Update operation failed",
      details: error
    });
  }
};

exports.generateEntriesData = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { transYear, divisionId } = req.body;

    const deleteQuery = await db.query(
      `DELETE FROM ${TABLE_NAMES.MOFMBSPL_TABLE} WHERE TRANS_YEAR = $1 AND DIVISION_ID = $2`,
      [transYear, divisionId]
    );

    // Call stored procedure to populate temp table
    await db.query(`CALL generate_balsheet_data($1, $2)`, [
      transYear,
      divisionId,
    ]);

    const finalResult = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOFMBSPL_TABLE} WHERE TRANS_YEAR = $1 AND DIVISION_ID = $2`,
      [transYear, divisionId]
    );
    await db.query("COMMIT");
    return res.status(200).json({
      success: true,
      mofmData: finalResult.rows,
      message: "Regenerate Entries successfully",
    });
  } catch (error) {
    console.error("Error in postItcData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateBalSheetPlDetails(req, res);
    return;
  } else {
    await insertFormData(req, res);
    return;
  }
});
