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
  MOFMINVACC: "MOFMINV_ACC_LINK",
};

const getDataOnQuery = async (req, res) => {
  try {
    let queryParameter = `ORDER BY  op_inv_acc  OFFSET ${
      req.query.offset || 0
    }`;

    const getCount = await db.query(
      `SELECT COUNT(*) FROM ${TABLE_NAMES.MOFMINVACC}`
    );
    let dataCount = getCount.rows[0]?.count;

    // switch (req?.query?.get_data) {
    //   case "Query":
    //   case "First": {
    //     const getCount = await db.query(
    //       `SELECT COUNT(*) FROM ${TABLE_NAMES.MOFMINVACC}`
    //     );
    //     dataCount = getCount.rows[0]?.count;
    //     break;
    //   }

    //   case "Last": {
    //     queryParameter = "ORDER BY op_inv_acc  DESC LIMIT 1";
    //     break;
    //   }

    //   default:
    //     queryParameter = `ORDER BY op_inv_acc  LIMIT 1 OFFSET ${
    //       req.query.offset || 0
    //     }`;
    //     break;
    // }

    const accLinkData = await db.query(
      `select * from ${TABLE_NAMES.MOFMINVACC} ${queryParameter} `
    );

    if (accLinkData.rows.length > 0) {
      await Promise.all(
        accLinkData.rows.map(async (item) => {
          if (item.op_inv_acc !== null) {
            const opAccData = await db.query(
              ` 	select acc_desc
	from mhfmglm
 where acc_no = $1`,
              [item.op_inv_acc]
            );

            item.op_acc_desc =
              opAccData.rowCount > 0 ? opAccData.rows[0].acc_desc : "";
          }

          if (item.cl_inv_acc !== null) {
            const clAccData = await db.query(
              ` 	select acc_desc
	from mhfmglm
 where acc_no = $1`,
              [item.cl_inv_acc]
            );

            item.cl_acc_desc =
              clAccData.rowCount > 0 ? clAccData.rows[0].acc_desc : "";
          }
          if (item.inv_assets_acc !== null) {
            const invAccData = await db.query(
              ` 	select acc_desc
	from mhfmglm
 where acc_no = $1`,
              [item.inv_assets_acc]
            );

            item.inv_acc_desc =
              invAccData.rowCount > 0 ? invAccData.rows[0].acc_desc : "";
          }
        })
      );
    }

    const response = {
      accLinkData: accLinkData.rows,
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
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "opAccount") {
    const opAcc = await db.query(
      `SELECT acc_no, acc_desc 
FROM mhfmglm
where CONTROLACC is null
and coalesce(CTRLPREFIX,'N') = 'N'
ORDER BY 1`
    );

    return res.status(200).json(opAcc.rows);
  } else if (help_list === "clAccount") {
    const clAcc = await db.query(
      `SELECT acc_no, acc_desc 
FROM mhfmglm
where CONTROLACC is null
and coalesce(CTRLPREFIX,'N') = 'N'
ORDER BY 1`
    );

    return res.status(200).json(clAcc.rows);
  } else if (help_list === "invAccount") {
    const invAcc = await db.query(
      `SELECT acc_no, acc_desc 
FROM mhfmglm
where CONTROLACC is null
and coalesce(CTRLPREFIX,'N') = 'N'
ORDER BY 1`
    );
    return res.status(200).json(invAcc.rows);
  }
};

exports.getValidateData = catchAsync(async (req, res) => {
  try {
    const entries = Object.entries(req.query);

    if (entries.length !== 1) {
      return res
        .status(400)
        .json({ message: "Provide exactly one field to validate." });
    }

    const [[field, value]] = entries;

    if (!value) {
      return res.status(400).json({ message: "Validation value is required." });
    }

    const query = `SELECT * FROM mofminv_acc_link WHERE ${field} = $1`;
    const result = await db.query(query, [value]);

    if (result.rowCount > 0) {
      return res.status(400).json({
        message: `Account Code already exists for ${field.replace(/_/g, " ")}`,
      });
    }

    return res.status(200).json({ message: "Validation successful" });
  } catch (err) {
    console.error("Validation Error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error during validation." });
  }
});

const postBalanceSheetData = async (req, res) => {
  try {
    const { formData } = req.body;
    console.log("Received body:", req.body);

    if (formData) {
      const formArray = Array.isArray(formData) ? formData : [formData];

      // Only take records that have an 'id' field
      const filteredRecords = formArray.filter((record) => record.id);

      for (const [index, record] of filteredRecords.entries()) {
        console.log("filtered records");

        // Duplicate check individually
        const { rows: existingOp } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE op_inv_acc = $1`,
          [record.op_inv_acc]
        );

        if (existingOp.length > 0) {
          return res
            .status(400)
            .json({
              error: `Account Code ${record.op_inv_acc} already exists as Opening Inventory Account.`,
            });
        }

        const { rows: existingCl } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE cl_inv_acc = $1`,
          [record.cl_inv_acc]
        );

        if (existingCl.length > 0) {
          return res
            .status(400)
            .json({
              error: `Account Code ${record.cl_inv_acc} already exists as Closing Inventory Account.`,
            });
        }

        const { rows: existingAsset } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE inv_assets_acc = $1`,
          [record.inv_assets_acc]
        );

        if (existingAsset.length > 0) {
          return res
            .status(400)
            .json({
              error: `Account Code ${record.inv_assets_acc} already exists as Inventory Asset Account.`,
            });
        }

        // Remove 'id' before insert
        delete record.id;
        delete record.op_acc_desc;
        delete record.cl_acc_desc;
        delete record.inv_acc_desc;
        delete record.init_cl_inv_acc;
        delete record.init_op_inv_acc;
        delete record.init_inv_assets_acc;

        // Generate the insert query and values
        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.MOFMINVACC,
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

const updateBalanceSheetData = async (req, res) => {
  const { formData } = req.body;
  console.log("After getting Update:", req.body);

  try {
    await db.query("BEGIN");

    if (Array.isArray(formData) && formData.length > 0) {
      for (const [index, record] of formData.entries()) {
      

        // Remove UI-specific fields
        const { id } = record;
        const cleanRecord = cleanObject({ ...record });

        delete cleanRecord.op_acc_desc;
        delete cleanRecord.cl_acc_desc;
        delete cleanRecord.inv_acc_desc;
        delete cleanRecord.init_cl_inv_acc;
        delete record.init_op_inv_acc;
        delete record.init_inv_assets_acc;

        delete cleanRecord.id;

        if (id) {  

           // Duplicate check individually
        const { rows: existingOp } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE op_inv_acc = $1`,
          [record.op_inv_acc]
        );

        if (existingOp.length > 0) {
          return res
            .status(400)
            .json({
              error: `Account Code ${record.op_inv_acc} already exists as Opening Inventory Account.`,
            });
        }

        const { rows: existingCl } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE cl_inv_acc = $1`,
          [record.cl_inv_acc]
        );

        if (existingCl.length > 0) {
          return res
            .status(400)
            .json({
              error: `Account Code ${record.cl_inv_acc} already exists as Closing Inventory Account.`,
            });
        }

        const { rows: existingAsset } = await db.query(
          `SELECT 1 FROM mofminv_acc_link WHERE inv_assets_acc = $1`,
          [record.inv_assets_acc]
        );

        if (existingAsset.length > 0) {
          return res
            .status(400)
            .json({
              error: `Account Code ${record.inv_assets_acc} already exists as Inventory Asset Account.`,
            });
        }

          // INSERT new record (no id yet)
          const insertQuery = generateSingleInsertQuery(
            "MOFMINV_ACC_LINK",
            cleanRecord
          );
          const valuesForInsert = Object.values(cleanRecord);

          console.log("Insert Query:", insertQuery);
          await db.query(insertQuery, valuesForInsert);
        } else {
          // UPDATE existing record
          const {
            init_cl_inv_acc,
            inv_acc_desc,
            cl_acc_desc,
            op_acc_desc,
            ...restOfRecord
          } = record;

          const cleaned = cleanObject(restOfRecord);
          const columns = Object.keys(cleaned);
          const values = Object.values(cleaned);

          const setClause = columns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
            UPDATE ${TABLE_NAMES.MOFMINVACC}
            SET ${setClause}
            WHERE cl_inv_acc = $${columns.length + 1}
          
          `;

          console.log("Update Query:", updateQuery);
          await db.query(updateQuery, [...values, init_cl_inv_acc]);
        }
      }
    }

    await db.query("COMMIT");
    res.status(200).json({ message: "Balance account updated successfully." });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction failed:", error);
    res.status(500).json({ error: "Failed to update user section details." });
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
  const { step } = req.query;

  if (req.query.form_status === "Update") {
    await updateBalanceSheetData(req, res);
    return;
  }

  if (step === "submit") {
    await postBalanceSheetData(req, res);
    return;
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
