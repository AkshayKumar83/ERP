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
const { transformMasterToDbData, transformNarrationToDbData } = require("./presentation");

// TABLE_NAMES = {
//   THFMTRAN: "thfmtran",
//   TDFMTRAN: "tdfmtran",
//   MOFMSTFORM: "mofmstform",
// };

const TABLE_NAMES = {
  THFMTRAN: "thfmtran",
  TDFMTRAN: "tdfmtran",
  MOFMSTFORM: "mofmstform",
};

// for dropdown data

exports.getFormBaseConstants = catchAsync(async (req, res, next) => { 
   const { appUserId, formStatus  } = req?.query;

  const noteTypeList = await db.query(
    `SELECT NOTE_DESC, NOTE_TYPE FROM VWNOTETYPE ORDER BY NOTE_DESC    `
  );

  const divisionList = await db.query(
    `select h.name,  h.division_id from moitdivision h, user_division d
where h.division_id = d.division_id
and d.user_id = $1  `, [appUserId]
  );

  const sectionList = await db.query(
    `select s.section_desc, u.section_id 
from  moitsection s, moitusersection u
 where u.user_id = $1
   and s.section_id = u.section_id
order by 1 `, [appUserId]
  );

  const purposeList = await db.query(
    `select description, code from mommcode where cat_group= 'PURP' order by 1 `
  );

  return res.status(200).json({
    noteType: noteTypeList.rows,
    division: divisionList.rows,
    section: sectionList.rows,
    purpose: purposeList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId, appFinYear);

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["voucher_no", "voucher_dt"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  console.log("whereClauses", whereClauses);

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  console.log("whereClauses", queryValues);

  try {
    let queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(voucher_id) FROM thfmtran where trans_year = $1  AND trans_type IN ('DN', 'RN')  ${queryValues}
                      `,
        [transYear]
      );

      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter);
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(voucher_id) FROM thfmtran where trans_year = $1  AND trans_type IN ('DN', 'RN');
                      `,
            [transYear]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY voucher_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const thfmtranData = await db.query(
      `SELECT * FROM thfmtran where trans_year = $1 AND trans_type IN ('DN', 'RN')
         ${queryParameter}
                    `,
      [transYear]
    );

    const vchrId = thfmtranData.rows[0]?.voucher_id;  

     if (thfmtranData.rowCount == 0) {
     // throw new Error("No matching record found");
     return res.status(200).json({ success: false, message: "No matching record found", thfmtranData: [], recordCount: 0 });
    }

    // POST QUERY DATA

    const dbcrDtl = await db.query(
      ` select  D.ACC_NO as acc_no, G.ACC_DESC as acc_desc
    from TDFMTRAN D, MHFMGLM G
    where D.VOUCHER_ID = $1
      and D.ACC_NO = G.ACC_NO
      and D.FLAG = 'Y'`,
      [vchrId]
    );

    if (thfmtranData.rows.length > 0) {
      thfmtranData.rows[0].dbcr_code =
        dbcrDtl.rowCount > 0 ? dbcrDtl.rows[0].acc_no : "";
      thfmtranData.rows[0].dbcr_name =
        dbcrDtl.rowCount > 0 ? dbcrDtl.rows[0].acc_desc : "";
    }

    const sectionDtl = await db.query(
      ` select s.section_id as section_id
   from moitsection s, user_master u
  where s.section_prefix = 'G'
    AND s.dept_cd = u.dept_cd
    AND u.user_id = $1`,
      [userId]
    );

    if (thfmtranData.rows.length > 0) {
      thfmtranData.rows[0].section =
        sectionDtl.rowCount > 0 ? sectionDtl.rows[0].section_id : "";

      thfmtranData.rows[0].voucher_dt =
        thfmtranData.rowCount > 0
          ? dateFormater(thfmtranData.rows[0].voucher_dt)
          : "";

      thfmtranData.rows[0].bill_dt =
        thfmtranData.rowCount > 0
          ? dateFormater(thfmtranData.rows[0].bill_dt)
          : "";
    }

    const tdfmtranData = await db.query(
      `SELECT * FROM TDFMTRAN
 WHERE voucher_id = $1 and flag = 'N'
 `,
      [vchrId]
    );

    // POST-QUERY DATA
    if (tdfmtranData.rows.length > 0) {
      await Promise.all(
        tdfmtranData.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const acc_desc = await db.query(
              ` select ACC_DESC
  from VWMDFMGLM
  where ACC_NO = $1 
    and DIVISION_ID =$2
    and trans_year = $3 `,
              [item.acc_no, divisionId, transYear]
            );

            item.acc_desc = acc_desc.rows[0]?.acc_desc || null;
          }

          if (item.cost_centr !== null) {
            const cost_desc = await db.query(
              `select prefix, description
   from vwcostc
  where cat_group = 'COSTC'
    AND code = $1 `,
              [item.cost_centr]
            );

            item.cost = cost_desc.rows[0]?.prefix || null;
            item.cost_desc = cost_desc.rows[0]?.description || null;
          }

          if (item.bill_dt !== null) {
            item.bill_dt = dateFormater(tdfmtranData.rows[0]?.bill_dt) || null;
          }
        })
      );
    }

    const mofmstformData = await db.query(
      `SELECT * FROM mofmstform
 WHERE voucher_id = $1
 `,
      [vchrId]
    );

    const responseData = {
      thfmtranData: thfmtranData.rows[0],
      tdfmtranData: tdfmtranData.rows,
      mofmstformData: mofmstformData.rows,
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
  let { appDivisionId, appFinYear, form_status, help_list } = req?.query;
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "dbcrAcc") {
    const dbcrAccDtl = await db.query(
      `Select distinct acc_desc, acc_no 
from vwglmactivedebtcrdt
where division_id = $1
and trans_year = $2
order by acc_desc   `,
      [appDivisionId, appFinYear]
    );

    return res.status(200).json(dbcrAccDtl.rows);
  } else if (help_list === "curr") {
    const currDtl = await db.query(
      `select curr_desc, curr_code, rate from currency order by 1 
 `
    );

    return res.status(200).json(currDtl.rows);
  } else if (help_list === "bill") {
    const billDtl = await db.query(
      `SELECT SRNO_PART2, V_CODE, DOC_NO, DOC_DATE, coalesce(MODVAT_BED, 0) + coalesce(MODVAT_SED, 0) MODVAT_AMT
FROM THFMEXCS 
WHERE DOC_ID IS NULL
      AND DIVISION_ID = $1
      AND TRANS_YEAR = $2    `,
      [appDivisionId, appFinYear]
    );
    return res.status(200).json(billDtl.rows);
  } else if (help_list === "acc") {
    const accDtl = await db.query(
      `select acc_desc, acc_no, emp_relate from  vwglmactiveothers 
where division_id = $1  and trans_year = $2
order by 1  	  
			 `,
      [appDivisionId, appFinYear]
    );
    return res.status(200).json(accDtl.rows);
  } else if (help_list === "cost") {
    const costDtl = await db.query(
      `select prefix, description, code CODE from mommcode where cat_group= 'COSTC' order by 1
   `
    );
    return res.status(200).json(costDtl.rows);
  }
};

const postDebitCreditDetails = async (req, res) => {
  try {
    await db.query("Begin");

    const { formData, formDetailData, finYear, divisionId } = req.body;
    console.log(req.body);

    let dbcr_code = formData?.dbcr_code

    let voucher_id = null;

    // Check if any record in formDetailData has a valid voucher_id
    if (Array.isArray(formDetailData) && formDetailData.some((record) => record.voucher_id)) {
      voucher_id = formDetailData.find(
        (record) => record.voucher_id
      ).voucher_id;
    } else {
      // Get new vch ID from sequence
      const vchIdResult = await db.query(`SELECT nextval('s_thfmtran_voucher_id')`);
      voucher_id = vchIdResult.rows[0].nextval;
      console.log("Generated voucher_id:", voucher_id);
    }

   let thfmTranDbCrData = transformMasterToDbData(formData);

    // Step 1: Call the function to get the next voucher no
    const { rows } = await db.query(
      `select gen_voucher_sect($1, $2, $3, $4, $5)  AS voucher_no`,
      [
        divisionId,
        formData.section,
        "C",
        formData.trans_type,
        formData.voucher_dt,
      ]
    );
    const vchNo = rows[0]?.voucher_no;
    console.log("generated vch no", vchNo);

    thfmTranDbCrData.voucher_id = voucher_id;
    thfmTranDbCrData.voucher_no = vchNo;
    thfmTranDbCrData.trans_year = finYear;
    thfmTranDbCrData.division_id = divisionId;


    const queryForInsert = generateSingleInsertQuery("thfmtran", thfmTranDbCrData);
    const valuesForInsertQuery = Object.values(thfmTranDbCrData);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);


    let tdfmDbCrNarrationData = transformNarrationToDbData(
      formDetailData,
      thfmTranDbCrData?.voucher_id,
      thfmTranDbCrData
    );

    for (const data of tdfmDbCrNarrationData) {
      console.log("narration data", data);
      console.log("narration data values", Object.values(data));
      const tdfmQuery = generateInsertQuery('tdfmtran', [data]);
      console.log("Generated Query:", tdfmQuery);
      await db.query(tdfmQuery, Object.values(data)); // await sequentially
    }

    console.log(Number(thfmTranDbCrData?.voucher_id), thfmTranDbCrData?.dbcr_code)

    //insert contra entry 
    const insertContraEntry = await db.query(
      "CALL proc_insert_contra_dbcr_note($1, $2)",
      [Number(thfmTranDbCrData?.voucher_id), dbcr_code]
    );

    // update ser party code in tdfmtran
    const updateSerParyCode = await db.query(`call update_party_acc_in_vchrs($1)`, [thfmTranDbCrData?.voucher_id])
    

    await db.query("commit");
    // Respond only if this is the final step
    return res.status(200).json({
      success: true,
      message: `Voucher No IS ${vchNo}`,
      voucher_no: vchNo,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in postDebitCredit:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error: Internal server error Insert cannot be proceed',
      error: error.message,
    });
  }
};

// previous version without using presentation transform function 
// const postDebitCreditDetails = async (req, res) => {
//   try {
//     await db.query("Begin");
//     const { formData, formDetailData, finYear, divisionId } = req.body;
//     console.log(req.body);

//     let voucher_id = null;

//     // Check if any record in formDetailData has a valid voucher_id
//     if (
//       Array.isArray(formDetailData) &&
//       formDetailData.some((record) => record.voucher_id)
//     ) {
//       voucher_id = formDetailData.find(
//         (record) => record.voucher_id
//       ).voucher_id;
//     } else {
//       // Get new vch ID from sequence
//       const vchIdResult = await db.query(
//         `SELECT nextval('s_thfmtran_voucher_id')`
//       );
//       voucher_id = vchIdResult.rows[0].nextval;
//       console.log("Generated voucher_id:", voucher_id);
//     }

//     // Step 1: Call the function to get the next voucher no
//     const { rows } = await db.query(
//       `select gen_voucher_sect($1, $2, $3, $4, $5)  AS voucher_no`,
//       [
//         divisionId,
//         formData.section,
//         "C",
//         formData.trans_type,
//         formData.voucher_dt,
//       ]
//     );
//     const vchNo = rows[0]?.voucher_no;
//     console.log("generated vch no", vchNo);

//     // Clean up the formData and add the gstid and itc_sr_no
//     const cleanUserLoginDataForInsert = cleanObject(formData);
//     cleanUserLoginDataForInsert.voucher_id = voucher_id;
//     cleanUserLoginDataForInsert.voucher_no = vchNo;
//     cleanUserLoginDataForInsert.trans_year = finYear;
//     cleanUserLoginDataForInsert.division_id = divisionId;

//     [
//       "acc_name",
//       "dbcr_name",
//       "section",
//       "query_auth",
//       "chq_no",
//       "chq_dt",
//       "dbcr_code",
//       "row_status",
//     ].forEach((field) => delete cleanUserLoginDataForInsert[field]);

//     if (Object.keys(cleanUserLoginDataForInsert).length === 0) {
//       return res.status(400).json({ error: "No valid data to insert" });
//     }

//     const queryForInsert = generateSingleInsertQuery(
//       "thfmtran",
//       cleanUserLoginDataForInsert
//     );
//     const valuesForInsertQuery = Object.values(cleanUserLoginDataForInsert);
//     console.log("valuesForInsertQuery:", valuesForInsertQuery);

//     await db.query(queryForInsert, valuesForInsertQuery);

//     // prepare and insert formDetailData
//     if (formDetailData.length) {
//       const formDetailArray = Array.isArray(formDetailData)
//         ? formDetailData
//         : [formDetailData];

//       const validDetailArray = formDetailArray.filter(
//         (record) =>
//           record.srl_no !== null &&
//           record.srl_no !== undefined &&
//           record.srl_no !== ""
//       );

//       for (const [index, record] of validDetailArray.entries()) {
//         // Convert empty check_dt string to null

//         // Set common voucher_id if not present
//         if (!record.voucher_id) {
//           record.voucher_id = voucher_id;
//         }
//         if (record.chq_dt === "") {
//           record.chq_dt = null;
//         }

//         if (record.pay_rec === "") {
//           record.pay_rec = 0;
//         }

//         record.voucher_id = voucher_id;

//         delete record.sr_no;
//         delete record.acc_desc;
//         delete record.cost;
//         delete record.cost_desc;
//         delete record.account_no;
//         delete record.emp_name;
//         delete record.old_vouch_amt;
//         delete record.row_status;

//         const queryForInsert = generateSingleInsertQuery("tdfmtran", record);
//         const valuesForInsertQuery = Object.values(record);

//         try {
//           await db.query(queryForInsert, valuesForInsertQuery);
//         } catch (error) {
//           console.error(
//             `Error inserting division record at index ${index}:`,
//             error
//           );
//           throw new Error(`Division insert error at index ${index}`);
//         }
//       }
//     }

//     await db.query("COMMIT");
//     // Respond only if this is the final step
//     return res.status(200).json({
//       success: true,
//       message: `Voucher No IS ${vchNo}`,
//       voucher_no: vchNo,
//     });
//   } catch (error) {
//     console.error("Error in postDebitCredit:", error);
//     await db.query("ROLLBACK");
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

exports.authorisedDebitCreditData = catchAsync(async (req, res, next) => {
  const { posted, voucher_id } = req.body.vchrData;

  try {
    await db.query("BEGIN");

    // Step 1: Update THFMTRANGST
    await db.query(`UPDATE thfmtran SET posted = $1 WHERE voucher_id = $2`, [
      posted,
      voucher_id,
    ]);
    // Step 2: Update THFMTRANGST
    await db.query(`UPDATE tdfmtran SET posted = $1 WHERE voucher_id = $2`, [
      posted,
      voucher_id,
    ]);

    // Step 2: Fetch updated posted
    const result = await db.query(
      `SELECT posted FROM thfmtran WHERE voucher_id = $1`,
      [voucher_id]
    );



    await db.query("COMMIT");

    const message =
      posted === "N"
        ? "Voucher posted successfully."
        : "Voucher authorized successfully.";

    return res.status(200).json({
      type: "success",
      message,
      posted: result.rows[0]?.posted,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Authorization error:", error);
    return res.status(500).json({
      type: "error",
      message: "Something went wrong.",
      error: error.message,
    });
  }
});


exports.cancelDbCrVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  console.log("Voucher cancellation data:", vchrData);

  try {
    const { cancel, voucher_id, id } = vchrData || {};

    if (!voucher_id) {
      return res.status(400).json({
        type: "error",
        message: "Missing voucher_id in request data.",
      });
    }

    // Optional: Validate cancel value
    if (!["Y", "N"].includes(cancel)) {
      return res.status(400).json({
        type: "error",
        message: 'Invalid cancel value. Must be "Y" or "N".',
      });
    }

    // Optional: Validate user id
    if (!id) {
      return res.status(400).json({
        type: "error",
        message: "Missing user ID.",
      });
    }

    // const isVoucherAdjusted = await db.query(
    //   `select 'Y' as cfnd 
    // from thfmpayrcv 
    // where voucher_id = $1
    // limit 1`,
    //   [voucher_id]
    // );

    // if (isVoucherAdjusted.rowCount > 0) {
    //   throw new Error("This voucher Is Adjusted So cannot cancel");
    // }

    await db.query("begin");
    // Update both tables
    await db.query(
      `UPDATE thfmtran SET cancel = $1 WHERE voucher_id = $2`,
      [cancel, voucher_id]
    );

    await db.query("commit");
    return res.status(200).json({
      type: "success",
      message:
        cancel === "Y"
          ? "Voucher cancelled successfully."
          : "Voucher cancellation reverted successfully.",
    });
  } catch (error) {
    console.error("Error cancelling voucher:", error);
    await db.query("rollback");
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});

const postTdsData = async (req, res) => {
  try {
    const { formData, formDetailData } = req.body;

    // Get new voucher ID from sequence
    const vchIdResult = await db.query(
      `SELECT nextval('s_thfmtran_voucher_id')`
    );
    const voucher_id = vchIdResult.rows[0].nextval;
    console.log("vch_id:", vchIdResult.rows[0].nextval);
    const cost = formDetailData?.[0]?.cost;
    const cost_centr = formDetailData?.[0]?.cost_centr;
    const pur_code = formDetailData?.[0]?.pur_code;
    const bill_no = formDetailData?.[0]?.bill_no;
    const bill_dt = formDetailData?.[0]?.bill_dt;
    const srl_no = formDetailData?.[0]?.srl_no;
    const acc_no = formDetailData?.[0]?.acc_no;
    const amount = formDetailData?.[0]?.amount;

    const { voucher_dt, dbcr_code: party_code, pay_rec } = formData;

    // Check if any required field is missing or falsy
    if (
      voucher_id == null ||
      cost == null ||
      cost_centr == null ||
      pur_code == null ||
      bill_no == null ||
      bill_dt == null ||
      srl_no == null ||
      acc_no == null ||
      amount == null ||
      voucher_dt == null ||
      party_code == null ||
      pay_rec == null
    ) {
      console.log("All form fields must be filled.", {
        voucher_id,
        cost,
        cost_centr,
        pur_code,
        bill_no,
        bill_dt,
        srl_no,
        acc_no,
        amount,
        voucher_dt,
        party_code,
        pay_rec,
      });
      return res.status(400).json({ error: "All form fields must be filled." });
    }
    const existing = await db.query(
      `SELECT * FROM tdfmtran WHERE voucher_id = $1`,
      [voucher_id]
    );

    console.log(
      "procedure:",
      voucher_id,
      voucher_dt,
      cost_centr,
      cost,
      pur_code,
      bill_no,
      bill_dt,
      srl_no,
      amount,
      acc_no,
      party_code,
      pay_rec
    );

    // Call stored procedure to populate temp table
    await db.query(
      `CALL calc_tds_exp($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        voucher_id,
        voucher_dt,
        cost_centr,
        cost,
        pur_code,
        bill_no,
        bill_dt,
        srl_no,
        amount,
        acc_no,
        party_code,
        pay_rec,
      ]
    );

    const finalResult = await db.query(
      `SELECT * FROM tdfmtran_temp_tds WHERE voucher_id = $1`,
      [voucher_id]
    );

    // POST-QUERY DATA
    if (finalResult.rows.length > 0) {
      await Promise.all(
        finalResult.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const acc_desc = await db.query(
              ` select ACC_DESC
  from VWMDFMGLM
  where ACC_NO = $1 
    and DIVISION_ID =$2
    and trans_year = $3 `,
              [item.acc_no, formData.division_id, formData.trans_year]
            );

            item.acc_desc = acc_desc.rows[0]?.acc_desc || null;
          }

          if (item.cost_centr !== null) {
            const cost_desc = await db.query(
              `select prefix, description
   from vwcostc
  where cat_group = 'COSTC'
    AND code = $1 `,
              [item.cost_centr]
            );

            item.cost = cost_desc.rows[0]?.prefix || null;
            item.cost_desc = cost_desc.rows[0]?.description || null;
          }

          if (item.bill_dt !== null) {
            item.bill_dt = dateFormater(finalResult.rows[0]?.bill_dt) || null;
          }
        })
      );
    }

    console.log("finalResult", finalResult.rows);

    return res.status(200).json({
      success: true,
      tdfmtranGstData: finalResult.rows,
      message: "Debit Credit data inserted successfully",
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

const updateDebitCreditDetails = async (req, res) => {
  const { formData, formDetailData, deletedData } = req.body;
  try {
    await db.query("Begin");
    let vchrId = formData?.voucher_id;
    const dbcr_code = formData?.dbcr_code;

    // udating thfminwardgst data
    if (Object.keys(req.body).length !== 0) {
      const dataForInsert = { ...formData };

      // Delete unwanted fields
      [
        "acc_name",
        "dbcr_name",
        "section",
        "query_auth",
        "chq_no",
        "chq_dt",
        "dbcr_code",
        "row_status",
      ].forEach((field) => delete dataForInsert[field]);

      const dataForUpdate = cleanObject(dataForInsert);

      const columns = Object.keys(dataForUpdate);
      const values = Object.values(dataForUpdate);

      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      // Generate the full SQL query
      const query = `UPDATE thfmtran SET ${setClause} WHERE voucher_id = $${
        columns.length + 1
      }`;

      try {
        // Execute the update query
        await db.query(query, [...values, vchrId]);
      } catch (error) {
        throw new Error(error);
      }
    }

    function cleanRecord(record) {
      const keysToDelete = [
        "sr_no",
        "acc_desc",
        "cost_desc",
        "cost",
        "account_no",
        "emp_name",
        "old_vouch_amt",
        "row_status",
      ];
      for (const key of keysToDelete) {
        delete record[key];
      }
      return record;
    }

    if (formDetailData.length >= 1) {
      for (const [index, record] of formDetailData.entries()) {
        cleanRecord(record);

        if (record.hasOwnProperty("voucher_id") && record.voucher_id) {
          // Update record
          const dataForUpdate = cleanObject({ ...record });
          const columns = Object.keys(dataForUpdate);
          const values = Object.values(dataForUpdate);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `UPDATE tdfmtran 
                     SET ${setClause} 
                     WHERE voucher_id = $${columns.length + 1} 
                       AND srl_no = $${columns.length + 2}`;

          try {
            await db.query(query, [
              ...values,
              record.voucher_id,
              record.srl_no,
            ]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(error);
          }
        } else {
          // Insert record - assign existing vchId before insert
          record.voucher_id = vchrId; // Assuming vchId comes from outer scope and is valid

          const queryForInsert = generateSingleInsertQuery("tdfmtran", record);
          const valuesForInsertQuery = Object.values(record);

          try {
            await db.query(queryForInsert, valuesForInsertQuery);
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(`Insert error at index ${index}`);
          }
        }
      }
    }

    // Delete detail records if needed
    if (Array.isArray(deletedData) && deletedData.length > 0) {
      for (const deletedRecord of deletedData) {
        const deleteQuery = `
          DELETE FROM tdfmtran
          WHERE voucher_id = $1 and acc_no = $2 and srl_no = $3
        `;

        try {
          await db.query(deleteQuery, [
            deletedRecord.voucher_id,
            deletedRecord.acc_no,
            deletedRecord.srl_no,
          ]);
        } catch (error) {
          console.error("Error deleting record:", error);
          throw error;
        }
      }
    }
  
    // insert/update contra entry
   const insertContraEntry = await db.query(
      "CALL proc_insert_contra_dbcr_note($1, $2)",
      [Number(vchrId), dbcr_code]
    );

    // update ser party code in tdfmtran
    const updateSerParyCode = await db.query(`call update_party_acc_in_vchrs($1)`, [vchrId])

    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  const { step } = req.query;

  if (step === "tds") {
    await postTdsData(req, res);
    return;
  }

  if (step === "submit") {
    const { form_status } = req.query;

    if (form_status === "Update") {
      await updateDebitCreditDetails(req, res);
    } else {
      await postDebitCreditDetails(req, res);
    }
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
