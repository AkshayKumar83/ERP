const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  makeNullValue,
  removeKeysFromObject,
  cleanObject,
} = require("../../../../utility/query");

const { dateFormater } = require("../../../../utility/constant");

const TABLE_NAMES = {
  ACC_WISE_TDS_MASTER: "mofmtds",
};

const { transToMofmtdsDbData } = require("./presentation");

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY  acc_no OFFSET ${req.query.offset || 0}`;
    let dataCount;

    let whereClauses = [];

    // Define search keys that should be checked in WHERE clause
    let searchKeys = [
      "acc_no",
      "eff_date",
      "goods_service",
      "category_flag",
      "v_code",
    ];

    // If any of these searchKeys exist in the query, add them to WHERE clause
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    // Build WHERE clause dynamically
    let queryValues =
      whereClauses.length > 0 ? "where " + whereClauses.join(" AND ") : "";

    console.log("quey:", req?.query);
    console.log("Offset value:", req.query.offset);

    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER}`
      );
      dataCount = getCount.rows[0]?.count;

      // switch (req?.query?.get_data) {
      //   case "Query":
      //   case "First": {
      //     const getCount = await db.query(
      //       `SELECT COUNT(*) FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER}`
      //     );
      //     dataCount = getCount.rows[0]?.count;
      //     break;
      //   }

      //   case "Last": {
      //     queryParameter = "ORDER BY acc_no DESC LIMIT 1";
      //     break;
      //   }

      //   default:
      //     queryParameter = `ORDER BY acc_no LIMIT 1 OFFSET ${
      //       req.query.offset || 0
      //     }`;
      //     break;
      // }
    }

    console.log(
      `select * from ${TABLE_NAMES.ACC_WISE_TDS_MASTER} ${queryParameter} `
    );
    const accWiseTdsData = await db.query(
      `select * from ${TABLE_NAMES.ACC_WISE_TDS_MASTER} ${queryParameter} `
    );

    if (accWiseTdsData.rows.length > 0) {
      await Promise.all(
        accWiseTdsData.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const accData = await db.query(
              ` SELECT ACC_DESC
  FROM MHFMGLM
  WHERE ACC_NO = $1`,
              [item.acc_no]
            );

            item.acc_desc =
              accData.rowCount > 0 ? accData.rows[0].acc_desc : "";
          }

          if (item.tds_sur_acc_no !== null) {
            const surAccData = await db.query(
              `SELECT ACC_DESC
  FROM MHFMGLM
  WHERE ACC_NO = $1`,
              [item.tds_sur_acc_no]
            );
            item.tds_sur_acc_desc =
              surAccData.rowCount > 0
                ? surAccData.rows[0].tds_sur_acc_desc
                : "";
          }

          if (item.acc_no !== null) {
            const vnameData = await db.query(
              `select acc_desc
from mhfmglm h
where acc_no = $1`,
              [item.v_code]
            );

            item.v_name =
              vnameData.rowCount > 0 ? vnameData.rows[0].acc_desc : "";
          }

          if (item.tds_cess_acc_no !== null) {
            const tdsCessData = await db.query(
              `	SELECT ACC_DESC
	  FROM MHFMGLM
	 WHERE ACC_NO = $1`,
              [item.tds_cess_acc_no]
            );

            item.tds_cess_acc_desc =
              tdsCessData.rowCount > 0 ? tdsCessData.rows[0].acc_desc : "";
          }

          if (item.tds_hsc_acc_no !== null) {
            const tdsHscData = await db.query(
              `	SELECT ACC_DESC
	  FROM MHFMGLM
	 WHERE ACC_NO = $1`,
              [item.tds_hsc_acc_no]
            );

            item.tds_hsc_acc_desc =
              tdsHscData.rowCount > 0 ? tdsHscData.rows[0].acc_desc : "";
          }

          if (item.v_code !== null) {
            const panData = await db.query(
              `	SELECT PAN_NO
	  FROM MOMMVEND
	 WHERE v_code = substr($1,2)`,
              [item.v_code]
            );

            item.pan_no = panData.rowCount > 0 ? panData.rows[0].pan_no : "";
          }

          if (item.eff_date !== null) {
            item.eff_date = dateFormater(item.eff_date);
          }
          if (item.start_tds_deduction_dt !== null) {
            item.start_tds_deduction_dt = dateFormater(
              item.start_tds_deduction_dt
            );
          }
        })
      );
    }

    // console.log("accWiseTdsData:", accWiseTdsData.rows[0]);

    const response = {
      accWiseTdsData: accWiseTdsData.rows,
      count: dataCount || 0,
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

const helpListData = async (req, res) => {
  const { appDivisionId, appFinYear, appUserId, form_status, help_list } =
    req?.query;
  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "acc") {
    let acc;
    if (form_status === "Search") {
      acc = await db.query(
        `select distinct acc_no, acc_desc from vwGlmActiveOthers v
		where exists (select 1 from mofmtds t where v.acc_no = t.acc_no)`
      );
    }

    if (form_status === "Insert" || form_status === "Update") {
      acc = await db.query(
        `Select Acc_no, Acc_Desc from VWGLMACTIVEOTHERS
where trans_year = $1
and division_id = $2`,
        [appFinYear, appDivisionId]
      );
    }

    return res.status(200).json(acc.rows);
  } else if (help_list === "tdsAcc") {
    const tdsAcc = await db.query(
      ` Select Acc_no, Acc_Desc from VWGLMACTIVEOTHERS
where division_id = $1
  and trans_year = $2`,
      [appDivisionId, appFinYear]
    );

    return res.status(200).json(tdsAcc.rows);
  } else if (help_list === "tdsSur") {
    const tdsSur = await db.query(
      `Select Acc_no, Acc_Desc from VWGLMACTIVEOTHERS
where division_id = $1
  and trans_year = $2`,
      [appDivisionId, appFinYear]
    );
    return res.status(200).json(tdsSur.rows);
  } else if (help_list === "tdsCess") {
    const tdsCess = await db.query(
      `Select Acc_no, Acc_Desc from VWGLMACTIVEOTHERS
where division_id = $1
  and trans_year = $2`,
      [appDivisionId, appFinYear]
    );
    return res.status(200).json(tdsCess.rows);
  } else if (help_list === "tdsHsc") {
    // console.log(itm_goods_service);
    const tdsHsc = await db.query(
      `Select Acc_no, Acc_Desc from VWGLMACTIVEOTHERS
where division_id = $1
  and trans_year = $2`,
      [appDivisionId, appFinYear]
    );
    return res.status(200).json(tdsHsc.rows);
  } else if (help_list === "vendor") {
    // console.log(itm_goods_service);

    let vendor;

    if (form_status === "Search") {
      vendor =
        await db.query(`select distinct acc_no, acc_desc from vwglmactivecreditors v
		where exists (select 1 from mofmtds t where v.acc_no = t.v_code)  `);
    }

    if (form_status === "Insert" || form_status === "Update") {
      vendor = await db.query(
        `SELECT ACC_DESC, ACC_NO FROM VWGLMACTIVECREDITORS C, MOMMVEND V
WHERE DIVISION_ID = $1
AND TRANS_YEAR = $2
AND 'S'||V.V_CODE = C.ACC_NO
AND COALESCE(TDS_FLAG,'N') = 'Y' 
ORDER BY 1
`,
        [appDivisionId, appFinYear]
      );
    }

    return res.status(200).json(vendor.rows);
  }
};

exports.getValidateData = catchAsync(async (req, res) => {
  console.log("getvalidate");
  try {
    const {
      v_code,
      acc_no,
      eff_date,
      category_flag,
      appDivisionId,
      appFinYear,
    } = req.query;

    if (!v_code || !acc_no || !eff_date) {
      //return res.status(400).json({ message: "Required fields missing" });
      return;
    }

    // 1. Check for duplicate
    const duplicateCheckQuery = `
      SELECT 1 FROM mofmtds 
      WHERE v_code = $1 AND acc_no = $2 AND eff_date = $3
    `;
    const duplicateResult = await db.query(duplicateCheckQuery, [
      v_code,
      acc_no,
      eff_date,
    ]);
    if (duplicateResult.rowCount > 0) {
      return res.status(400).json({
        message:
          "This vendor code is already entered for this account and effective date",
      });
    }

    // 2. Check for active creditor with TDS applicable
    if (category_flag === "V" && v_code) {
      const tdsCheckQuery = `
         select v_name, pan_no
		from vwglmactivecreditors c, mommvend v
	where acc_no = $1/*:MOFMTDS.ACC_NO*/
	  and division_id = $2
		and trans_year = $3
		and 'S'||v.v_code = c.acc_no
		and coalesce(tds_flag,'N') = 'Y';
		  
      `;
      const tdsResult = await db.query(tdsCheckQuery, [
        v_code,
        appDivisionId,
        appFinYear,
      ]);

      if (tdsResult.rowCount === 0) {
        return res.status(400).json({
          message:
            "Vendor may not be an active creditor or TDS is not applicable",
        });
      }

      return res.status(200).json({
        message: "Validation successful",
        data: tdsResult.rows[0],
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

const postAccTdsData = async (req, res) => {
  try {
    const { formData, radioData } = req.body;
    console.log("Received body:", req.body);

    const type = radioData.category_flag;

    if (formData) {
      const formArray = Array.isArray(formData) ? formData : [formData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        // for checking duplicate item

        const duplicateCheckQuery = `
      SELECT 1 FROM mofmtds 
      WHERE v_code = $1 AND acc_no = $2 AND eff_date = $3
    `;
        const duplicateResult = await db.query(duplicateCheckQuery, [
          record.v_code,
          record.acc_no,
          record.eff_date,
        ]);
        if (duplicateResult.rowCount > 0) {
          return res.status(400).json({
            error:
              "This vendor code is already entered for this account and effective date",
          });
        }

        // Replace empty string with null
        if (record.start_tds_deduction_dt === "") {
          record.start_tds_deduction_dt = null;
        }

        // Transform record to DB-ready data
        const mofmTdsData = transToMofmtdsDbData(record);

        // Remove 'id' before insert (if DB doesn't expect it)
        delete record.id;
        delete record.acc_desc;
        delete record.tds_acc_desc;
        delete record.tds_sur_acc_desc;
        delete record.tds_cess_acc_desc;
        delete record.tds_hsc_acc_desc;
        delete record.v_name;
        delete record.pan_no;
        delete record.init_acc_no;
        delete record.init_v_code;
        delete record.init_eff_date;

        // Set debt_cred from formData
        record.category_flag = type;

        // Generate the insert query and values
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.ACC_WISE_TDS_MASTER,
          //record
          mofmTdsData
        );
        const valuesForInsertQuery = Object.values(mofmTdsData);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          //console.error(`Error inserting record at index ${index}:`, error);
          throw new Error(`Insert error at index ${index}: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: "Records inserted successfully" });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: error.message });
  }
};

// const updateAccTdsDetails = async (req, res) => {
//   // console.log("for update:", req.body);

//   const { formData, deletedData, category_flag } = req.body;

//   try {
//     await db.query("BEGIN");

//     // Update the form data
//     if (Array.isArray(formData) && formData.length >= 1) {
//       for (const [index, record] of formData.entries()) {
//         const acc_no = record.acc_no;
//         const v_code = record.v_code;

//         const mofmTdsData = transToMofmtdsDbData(record);

//         if (!record.id) {
//           //delete record.id;
//           delete record.acc_desc;
//           delete record.tds_acc_desc;
//           delete record.tds_sur_acc_desc;
//           delete record.tds_cess_acc_desc;
//           delete record.tds_hsc_acc_desc;
//           delete record.v_name;
//           delete record.pan_no;
//           //delete record.init_acc_no;

//           // Convert empty string to null if needed
//           if (record.start_tds_deduction_dt === "") {
//             record.start_tds_deduction_dt = null;
//           }

//           const { init_acc_no, init_v_code, ...restOfRecord } = record;
//           const formDataForUpdate = cleanObject(restOfRecord);
//           const columns = Object.keys(formDataForUpdate);
//           const values = Object.values(formDataForUpdate);

//           const setClause = columns
//             .map((column, idx) => `${column} = $${idx + 1}`)
//             .join(", ");

//           const query = `
//             UPDATE ${TABLE_NAMES.ACC_WISE_TDS_MASTER}
//             SET ${setClause}
//             WHERE category_flag = $${columns.length + 1}
//               AND acc_no = $${columns.length + 2} AND v_code = $${
//             columns.length + 3
//           }
//           `;

//           // console.log("SQL query for update:", query);

//           try {
//             await db.query(query, [
//               ...values,
//               category_flag,
//               init_acc_no,
//               init_v_code,
//             ]);
//           } catch (error) {
//             console.error(`Error updating record at index ${index}:`, error);
//             throw error;
//           }
//         } else {
//           console.log("Inserting new record");

//           const formDataForInsert = cleanObject({
//             ...record,
//             category_flag,
//           });

//           // record.category_flag = type;

//           delete formDataForInsert.id;
//           delete formDataForInsert.acc_desc;
//           delete formDataForInsert.tds_acc_desc;
//           delete formDataForInsert.tds_sur_acc_desc;
//           delete formDataForInsert.tds_cess_acc_desc;
//           delete formDataForInsert.tds_hsc_acc_desc;
//           delete formDataForInsert.v_name;
//           delete formDataForInsert.pan_no;
//           delete formDataForInsert.init_acc_no;
//           delete formDataForInsert.init_v_code;

//           record.category_flag = type;

//           try {
//             const queryForInsert = generateSingleInsertQuery(
//               TABLE_NAMES.ACC_WISE_TDS_MASTER,
//               formDataForInsert
//             );

//             const valuesForInsertQuery = Object.values(formDataForInsert);

//             console.log("Insert query:", queryForInsert);
//             console.log("Insert values:", valuesForInsertQuery);

//             await db.query(queryForInsert, valuesForInsertQuery);
//           } catch (error) {
//             console.error(`Error inserting record at index ${index}:`, error);
//             throw error;
//           }
//         }
//       }
//     }

//     // Delete period data
//     if (Array.isArray(deletedData) && deletedData.length) {
//       for (const deletedRecord of deletedData) {
//         const deleteQuery = `
//           DELETE FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER}
//           WHERE category_flag = $1 AND acc_no = $2 AND v_code = $3
//         `;

//         try {
//           console.log("Delete query:", deleteQuery);
//           await db.query(deleteQuery, [
//             deletedRecord.category_flag,
//             deletedRecord.acc_no,
//             deletedRecord.v_code,
//           ]);
//         } catch (error) {
//           console.error("Error deleting record:", error);
//           throw error;
//         }
//       }
//     } else if (deletedData) {
//       const deleteQuery = `
//         DELETE FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER}
//         WHERE category_flag = $1 AND acc_no = $2 AND v_code = $3
//       `;

//       try {
//         console.log("Delete query:", deleteQuery);
//         await db.query(deleteQuery, [
//           deletedData.category_flag,
//           deletedData.acc_no,
//           deletedData.v_code,
//         ]);
//       } catch (error) {
//         console.error("Error deleting record:", error);
//         throw error;
//       }
//     }

//     await db.query("COMMIT");
//     return res.status(200).send({ status: "Successfully updated" });
//   } catch (error) {
//     console.error("Error:", error);
//     await db.query("ROLLBACK");
//     return res.status(500).send({ message: "Failed to update period details" });
//   }
// };

// ✅ make sure you import or require your mapper at the top
// const { transformMofmtdsData } = require('../mappers/mofmtds');

const updateAccTdsDetails = async (req, res) => {
  const { formData, deletedData, category_flag } = req.body;

  try {
    await db.query("BEGIN");

    if (Array.isArray(formData) && formData.length) {
      for (const record of formData) {
    //     const duplicateCheckQuery = `
    //   SELECT 1 FROM mofmtds 
    //   WHERE v_code = $1 AND acc_no = $2 AND eff_date = $3
    // `;
    //     const duplicateResult = await db.query(duplicateCheckQuery, [
    //       record.v_code,
    //       record.acc_no,
    //       record.eff_date,
    //     ]);
    //     if (duplicateResult.rowCount > 0) {
    //       return res.status(400).json({
    //         error:
    //           "This vendor code is already entered for this account and effective date",
    //       });
    //     }
        // Transform to DB-ready object
        const mapped = transToMofmtdsDbData(record);

        // handle empty date
        if (mapped.start_tds_deduction_dt === "")
          mapped.start_tds_deduction_dt = null;

        // Remove UI-only fields and add category_flag
        const {
          id,
          acc_desc,
          tds_acc_desc,
          tds_sur_acc_desc,
          tds_cess_acc_desc,
          tds_hsc_acc_desc,
          v_name,
          pan_no,
          init_acc_no,
          init_v_code,
          init_eff_date,
          ...dbRecord
        } = mapped;

        dbRecord.category_flag = category_flag;

        if (!record.id) {
          // ---------- UPDATE ----------
          const columns = Object.keys(dbRecord);
          const values = Object.values(dbRecord);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `
            UPDATE ${TABLE_NAMES.ACC_WISE_TDS_MASTER}
               SET ${setClause}
             WHERE category_flag = $${columns.length + 1}
               AND acc_no       = $${columns.length + 2}
               AND v_code       = $${columns.length + 3}
          `;

          await db.query(query, [
            ...values,
            category_flag,
            record.init_acc_no,
            record.init_v_code,
          ]);
        } else {
          const duplicateCheckQuery = `
      SELECT 1 FROM mofmtds 
      WHERE v_code = $1 AND acc_no = $2 AND eff_date = $3
    `;
          const duplicateResult = await db.query(duplicateCheckQuery, [
            record.v_code,
            record.acc_no,
            record.eff_date,
          ]);
          if (duplicateResult.rowCount > 0) {
            return res.status(400).json({
              error:
                "This vendor code is already entered for this account and effective date",
            });
          }
          // ---------- INSERT ----------
          const insertColumns = Object.keys(dbRecord);
          const insertValues = Object.values(dbRecord);

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.ACC_WISE_TDS_MASTER,
            dbRecord
          );

          await db.query(insertQuery, insertValues);
        }
      }
    }

    // ---------- DELETE ----------
    if (Array.isArray(deletedData) && deletedData.length) {
      for (const d of deletedData) {
        await db.query(
          `DELETE FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER}
            WHERE category_flag = $1 AND acc_no = $2 AND v_code = $3`,
          [d.category_flag, d.acc_no, d.v_code]
        );
      }
    } else if (deletedData) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.ACC_WISE_TDS_MASTER}
          WHERE category_flag = $1 AND acc_no = $2 AND v_code = $3`,
        [deletedData.category_flag, deletedData.acc_no, deletedData.v_code]
      );
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "Successfully updated" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error updating mofmtds:", err);
    res.status(500).send({ error: err.message });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  // }

  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  const { step } = req.query;

  if (req.query.form_status === "Update") {
    await updateAccTdsDetails(req, res);
    return;
  }

  if (step === "submit") {
    await postAccTdsData(req, res);
    return;
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
