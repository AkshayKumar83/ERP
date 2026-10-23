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

const TABLE_NAMES = {
  TOFMINVSUMM: "TOFMINVSUMM",
};

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY  inv_dt  OFFSET ${req.query.offset || 0}`; 

     const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.TOFMINVSUMM}`
        );
       let dataCount = getCount.rows[0]?.count;

    // switch (req?.query?.get_data) {
    //   case "Query":
    //   case "First": {
    //     const getCount = await db.query(
    //       `SELECT COUNT(*) FROM ${TABLE_NAMES.TOFMINVSUMM}`
    //     );
    //     dataCount = getCount.rows[0]?.count;
    //     break;
    //   }

    //   case "Last": {
    //     queryParameter = "ORDER BY INV_DT  DESC LIMIT 1";
    //     break;
    //   }

    //   default:
    //     queryParameter = `ORDER BY INV_DT  LIMIT 1 OFFSET ${
    //       req.query.offset || 0
    //     }`;
    //     break;
    // }

    const closingInvData = await db.query(
      `select * from ${TABLE_NAMES.TOFMINVSUMM} ${queryParameter} `
    );

    if (closingInvData.rows.length > 0) {
      await Promise.all(
        closingInvData.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const accData = await db.query(
              ` 		select acc_desc
	from mhfmglm
 where acc_no = $1`,
              [item.acc_no]
            );

            item.acc_desc =
              accData.rowCount > 0 ? accData.rows[0].acc_desc : "";
          }

          // Format inv_dt
          item.inv_dt = item.inv_dt ? dateFormater(item.inv_dt) : "";
        })
      );
    }

    const response = {
      closingInvData: closingInvData.rows,
      count: dataCount || 0,
    };
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error on query" });
  }
};

const helpListData = async (req, res) => {
  let { appDivisionId, appFinYear, appUserId, form_status, help_list, inv_dt } =
    req.query;

  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  // Normalize inv_dt
  if (!inv_dt || inv_dt === "undefined") {
    inv_dt = null;
  }

  if (help_list === "account") {
    try {
      const accData = await db.query(
        `SELECT cl_inv_acc AS acc_no, acc_desc
         FROM mofminv_acc_link l
         JOIN mhfmglm g ON l.cl_inv_acc = g.acc_no
         WHERE NOT EXISTS (
           SELECT 1
           FROM tofminvsumm a
           WHERE a.acc_no = l.cl_inv_acc
             AND a.inv_dt = $1
         )`,
        [inv_dt]
      );

      return res.status(200).json(accData.rows);
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json([]);
};

const postClosingInvData = async (req, res) => {
  try {
    const { formDetailData, divisionId, inv_dt } = req.body;
    console.log("Received body:", req.body);

    if (formDetailData) {
      const formArray = Array.isArray(formDetailData)
        ? formDetailData
        : [formDetailData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);
       const validInvDt = inv_dt && inv_dt !== "undefined" ? inv_dt : null;

      for (const [index, record] of filteredRecords.entries()) {
        console.log("filtered records");  
        
        // 1. Duplicate check
      const { rows: existingRows } = await db.query(
        `SELECT 1 FROM tofminvsumm WHERE acc_no = $1 AND inv_dt = $2`,
        [record.acc_no, validInvDt]
      );
      if (existingRows.length > 0) {
        return res.status(400).json({
          error: `Account Code ${record.acc_no} already exists with same ${record.inv_dt} date.`,
        });
      }

      // 2. Linkage check
      if (record.acc_no) {
        const { rows: linkRows } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE cl_inv_acc = $1`,
          [record.acc_no]
        );
        if (linkRows.length === 0) {
          return res.status(400).json({
            error: `Account ${record.acc_no} is not mapped in Inventory Account Linkage Master.`,
          });
        }
      }
        // Remove 'id' before insert (if DB doesn't expect it)
        delete record.id;
        delete record.acc_desc;
        delete record.init_acc_no;
         delete record.init_inv_dt;
        record.inv_dt = inv_dt;
        record.division_id = divisionId;

        // Generate the insert query and values
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.TOFMINVSUMM,
          record
        );
        const valuesForInsertQuery = Object.values(record);

        try {
          await db.query(queryForInsert, valuesForInsertQuery);
          console.log("insert query", queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(`Error inserting record at index ${index}:`, error);
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

exports.getValidateData = catchAsync(async (req, res) => {
  let { acc_no, inv_dt } = req.query;

  try {
  
    if (!acc_no || !inv_dt) { 
      return
     // return res.status(400).json({ error: "Account number is required." });
    }

  
    if (!inv_dt || inv_dt === "undefined") {
      inv_dt = null;
    }


    const existingRecord = await db.query(
      `SELECT 1
       FROM tofminvsumm 
       WHERE acc_no = $1 
         AND inv_dt = $2`,
      [acc_no, inv_dt]
    );

    if (existingRecord.rows.length > 0) {
      return res.status(400).json({
        error: "Account Code already exists for the given date.",
      });
    }

    // Check if account exists in inventory account linkage master
    const accLinkCheck = await db.query(
      `SELECT 1 
       FROM mofminv_acc_link 
       WHERE cl_inv_acc = $1`,
      [acc_no]
    );

    if (accLinkCheck.rows.length === 0) {
      return res.status(400).json({
        error: "This Account is not mapped in Inventory Account Linkage Master.",
      });
    }


    return res.status(200).json({ success: true, message: "Validation passed." });

  } catch (error) {
    console.error("Error validating form data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


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

const updateClosingInvData = async (req, res) => {
  const { formDetailData, deletedData, inv_dt } = req.body;
  console.log("After getting Update:", req.body);

  try {
    await db.query("BEGIN");

    if (Array.isArray(formDetailData) && formDetailData.length > 0) {
        const validInvDt = inv_dt && inv_dt !== "undefined" ? inv_dt : null;
      for (const [index, record] of formDetailData.entries()) {  

        // Remove UI-specific fields
        const { id } = record;
        const cleanRecord = cleanObject({ ...record });

        delete cleanRecord.acc_desc;
        delete cleanRecord.init_acc_no;
         delete cleanRecord.init_inv_dt;
        delete cleanRecord.id;

        if (id) {  

            // 1. Duplicate check
      const { rows: existingRows } = await db.query(
        `SELECT 1 FROM tofminvsumm WHERE acc_no = $1 AND inv_dt = $2`,
        [record.acc_no, validInvDt]
      );
      if (existingRows.length > 0) {
        return res.status(400).json({
          error: `Account Code ${record.acc_no} already exists for the given date ${record.inv_dt}.`,
        });
      }

      // 2. Linkage check
      if (record.acc_no) {
        const { rows: linkRows } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE cl_inv_acc = $1`,
          [record.acc_no]
        );
        if (linkRows.length === 0) {
          return res.status(400).json({
            error: `Account ${record.acc_no} is not mapped in Inventory Account Linkage Master.`,
          });
        }
      }
          // INSERT new record (no id yet)
          const insertQuery = generateSingleInsertQuery(
            "TOFMINVSUMM",
            cleanRecord
          );
          const valuesForInsert = Object.values(cleanRecord);

          //console.log("Insert Query:", insertQuery);
          await db.query(insertQuery, valuesForInsert);
        } else {
          // UPDATE existing record
          const {
            init_acc_no,
            init_inv_dt,
            acc_desc,

            ...restOfRecord
          } = record;

          const cleaned = cleanObject(restOfRecord);
          const columns = Object.keys(cleaned);
          const values = Object.values(cleaned);

          const setClause = columns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
            UPDATE ${TABLE_NAMES.TOFMINVSUMM}
            SET ${setClause}
            WHERE acc_no = $${columns.length + 1} and inv_dt = $${columns.length + 2}
          
          `;

         // console.log("Update Query:", updateQuery);
          await db.query(updateQuery, [...values, init_acc_no, init_inv_dt]);
        } 

         // for delete formData record
            if (Array.isArray(deletedData) && deletedData.length) {
              for (const deletedRecord of deletedData) {
              
        
                try {
                  const deleteQuery = `
                    DELETE FROM ${TABLE_NAMES.TOFMINVSUMM}
                    WHERE inv_dt = $1 and acc_no = $2
                  `;
                  await db.query(deleteQuery, [deletedRecord.inv_dt, deletedRecord.acc_no]);
                } catch (error) {
                  console.error("Error during deletion:", error.message);
                  return res.status(500).json({
                    success: false,
                    message: "An unexpected error occurred during deletion.",
                    error: error.message,
                  });
                }
              }
            }
      }
    }

    await db.query("COMMIT");
    res.status(200).json({ message: "Closing Inv Balnace Sheet Updated Successfully." });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction failed:", error);
    res.status(500).json({ error: "Failed to closing Inv Balance Sheet." });
  }
};

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  const { step } = req.query;

  if (req.query.form_status === "Update") {
    await updateClosingInvData(req, res);
    return;
  }

  if (step === "submit") {
    await postClosingInvData(req, res);
    return;
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
