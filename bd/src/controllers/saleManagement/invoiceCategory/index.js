const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../utility/query");

const TABLE_NAMES = {
  MOSMDACT: "mosmdact",
  MDSMDACT: "mdsmdact",
};

const getDataOnQuery = async (req, res) => {
  console.log("this start");

  try {
    let queryParameter = `OFFSET ${req.query.offset || 0}`;
    console.log("query:", req?.query);
    console.log("Offset value:", req.query.offset);

    let dataCount;

    switch (req?.query?.get_data) {
      case "Query":

      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.MOSMDACT}`
        );
        dataCount = getCount.rows[0]?.count;
        break;
      }

      default:
        queryParameter = ` OFFSET ${req.query.offset || 0}`;
        break;
    }

    const InvoiceData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOSMDACT} order by da_cat`
    );

    // const daCat = InvoiceData.rows[0].da_cat;

    const invoiceDtlData = await db.query(
      `select * from ${TABLE_NAMES.MDSMDACT}`
    );

    const responseData = {
      invoiceData: InvoiceData.rows,
      count: dataCount || 0,
      invoiceDtlData: invoiceDtlData.rows,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const sectionList = await db.query(
    `select section_desc, section_id
from moitsection
order by section_desc  `
  );

  const deptHeadList = await db.query(
    `select c_name,c_code from mosmcust where CUST_TYPE in (2216,2217)
order by c_name`
  );

  return res.status(200).json({
    section: sectionList.rows,
    deptHeadOffice: deptHeadList.rows,
  });
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");

  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.getValidateData = catchAsync(async (req, res, next) => {
  const { validdata: validateData, value } = req.query;

  try {
    let query = "";
    let message = "";

    if (validateData === "da_cat_desc") {
      query = `SELECT 1 FROM mosmdact WHERE da_cat_desc = $1`;
      message = "Category Description already exist";
    } else if (validateData === "da_cat") {
      query = `SELECT 1 FROM mosmdact WHERE da_cat = $1`;
      message = "Category Code already exist";
    } else {
      return res.status(400).json({ message: "Invalid validation field" });
    }

    const result = await db.query(query, [value]);

    if (result.rows.length > 0) {
      return res.status(200).json({ message });
    }

    return res.status(204).send(); // Valid
  } catch (err) {
    console.error("Validation error:", err);
    return res.status(500).json({ message: "Error fetching data" });
  }
});

const postInvoiceDetails = async (req, res) => {
  try {
    await db.query("BEGIN");
    const { formData, formDetailData } = req.body;
    console.log("req body:", req.body);

    const formDataArray = Array.isArray(formData) ? formData : [formData];
    const formDtlDataArray = Array.isArray(formDetailData)
      ? formDetailData
      : [formDetailData];

    // Filter records that have an id for insertion
    const insertableFormRecords = formDataArray.filter((record) => record.id);

    // Keep track of inserted da_cat values
    const insertedDaCats = [];

    for (const [index, record] of insertableFormRecords.entries()) {
      const duplicateCheckQuery = `
  SELECT da_cat, da_cat_desc 
  FROM mosmdact 
  WHERE da_cat = $1 OR da_cat_desc = $2
`;

      const duplicateResult = await db.query(duplicateCheckQuery, [
        record.da_cat,
        record.da_cat_desc,
      ]);

      if (duplicateResult.rowCount > 0) {
        const existing = duplicateResult.rows[0];

        if (existing.da_cat === record.da_cat) {
          return res
            .status(400)
            .json({ error: "Category Code already exists" });
        }

        if (existing.da_cat_desc === record.da_cat_desc) {
          return res
            .status(400)
            .json({ error: "Category Description already exists" });
        }
      }

      const da_cat = record.da_cat;
      insertedDaCats.push(da_cat);

      delete record.id;
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.MOSMDACT,
        record
      );
      const insertValues = Object.values(record);

      try {
        await db.query(insertQuery, insertValues);
      } catch (error) {
        console.error(`Error inserting form record at index ${index}:`, error);
        throw new Error(`Form insert error at index ${index}`);
      }
    }

    // Now insert detail records that have an id and assign correct da_cat
    const insertableDetailRecords = formDtlDataArray.filter(
      (record) => record.id
    );

    for (const [index, record] of insertableDetailRecords.entries()) {
      delete record.id;

      // Use corresponding da_cat — assumes order matches (you can adjust if mapping differently)
      record.da_cat = insertedDaCats[index] || insertedDaCats[0];

      const detailInsertQuery = generateSingleInsertQuery(
        TABLE_NAMES.MDSMDACT,
        record
      );
      const detailInsertValues = Object.values(record);

      try {
        await db.query(detailInsertQuery, detailInsertValues);
      } catch (error) {
        console.error(
          `Error inserting detail record at index ${index}:`,
          error
        );
        throw new Error(`Detail insert error at index ${index}`);
      }
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "success", insertedDaCats });
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query("ROLLBACK");
    return res.status(400).send("Some error occurred");
  }
};

const updateInvoiceDetails = async (req, res) => {
  const { formData, formDetailData, deletedFormData } = req.body;

  try {
    await db.query("BEGIN");

    if (Array.isArray(formData) && formData.length >= 1) {
      for (const [index, record] of formData.entries()) {
        const cleanedRecord = cleanObject(record);
        const values = Object.values(cleanedRecord);

        if (!record.da_cat) {
          console.error(
            `Skipping record at index ${index} due to missing da_cat`
          );
          continue;
        }

        if (record.id) {
          const duplicateCheckQuery = `
  SELECT da_cat, da_cat_desc 
  FROM mosmdact 
  WHERE da_cat = $1 OR da_cat_desc = $2
`;

          const duplicateResult = await db.query(duplicateCheckQuery, [
            record.da_cat,
            record.da_cat_desc,
          ]);

          if (duplicateResult.rowCount > 0) {
            const existing = duplicateResult.rows[0];

            if (existing.da_cat === record.da_cat) {
              return res
                .status(400)
                .json({ error: "Category Code already exists" });
            }

            if (existing.da_cat_desc === record.da_cat_desc) {
              return res
                .status(400)
                .json({ error: "Category Description already exists" });
            }
          }

          // INSERT if record has ID
          delete cleanedRecord.id;
          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MOSMDACT,
            cleanedRecord
          );
          try {
            await db.query(insertQuery, Object.values(cleanedRecord));
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(`Insert error at index ${index}`);
          }
        } else {
          // UPDATE if no ID (based on da_cat)
          const updateRecord = { ...cleanedRecord };
          const updateColumns = Object.keys(updateRecord);
          const updateValues = Object.values(updateRecord);

          const setClause = updateColumns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
            UPDATE ${TABLE_NAMES.MOSMDACT}
            SET ${setClause}
            WHERE da_cat = $${updateColumns.length + 1}
          `;

          try {
            await db.query(updateQuery, [...updateValues, record.da_cat]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(`Update error at index ${index}`);
          }
        }
      }
    }

    // delete record

    if (Array.isArray(deletedFormData) && deletedFormData.length) {
      for (const deletedRecord of deletedFormData) {
        const { da_cat } = deletedRecord;

        // Check if da_cat is used in mhsmda
        const checkMhsmdaQuery = `SELECT 1 FROM mhsmda WHERE da_type = $1 LIMIT 1`;
        const checkMhsminvQuery = `SELECT 1 FROM mhsminv WHERE inv_type = $1 LIMIT 1`;

        try {
          const mhsmdaResult = await db.query(checkMhsmdaQuery, [da_cat]);
          if (mhsmdaResult.rowCount > 0) {
            return res.status(400).json({
              success: false,
              message: `This category (${da_cat}) is already used in Despatch Advice`,
            });
          }

          const mhsminvResult = await db.query(checkMhsminvQuery, [da_cat]);
          if (mhsminvResult.rowCount > 0) {
            return res.status(400).json({
              success: false,
              message: `This category (${da_cat}) is already used in Invoice`,
            });
          }

          const deleteQuery = `
        DELETE FROM ${TABLE_NAMES.MOSMDACT}
        WHERE da_cat = $1
      `;
          await db.query(deleteQuery, [da_cat]);
        } catch (error) {
          console.error("Error during deletion:", error.message);
          return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during deletion.",
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Record(s) deleted successfully",
      });
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Transaction failed:", error);
    await db.query("ROLLBACK");
    return res
      .status(500)
      .send({ message: "Failed to update invoice details" });
  }
};

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateInvoiceDetails(req, res);
    return;
  } else {
    await postInvoiceDetails(req, res);
    return;
  }
});
