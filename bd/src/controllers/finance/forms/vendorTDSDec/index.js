const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

const TABLE_NAMES = {
  MOMMVEND: "mommvend",
  MDMMVEND: "mdmmvend_tds_decl",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const transYearList = await db.query(
    `SELECT 
  year_code as trans_year, 
  year_code || '-' || (CAST(year_code AS integer) + 1) AS finyear  
FROM moitfinyear 
ORDER BY year_code;
  `
  );

  return res.status(200).json({
    transYear: transYearList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  console.log("this start");

  try {
    // const offset = parseInt(req.query.offset) || 0;
    // let queryParameter = `OFFSET ${offset}`;
    // console.log("query:", req?.query);
    // console.log("Offset value:", offset);

    // let dataCount;

    //  let whereClauses = [];

    // // Define search keys that should be checked in WHERE clause
    // let searchKeys = ["v_name" ,"v_code"];

    // // If any of these searchKeys exist in the query, add them to WHERE clause
    // for (const key of searchKeys) {
    //   if (req.query[key] !== undefined && req.query[key] !== "") {
    //     whereClauses.push(`${key} = '${req.query[key]}'`);
    //   }
    // }

    // console.log("whereClauses", whereClauses);

    //  // Build WHERE clause dynamically
    //     let queryValues =
    //       whereClauses.length > 0 ? whereClauses.join(" AND ") : "";

    //     //console.log("quey:", req?.query);
    //    // console.log("Offset value:", req.query.offset);

    //     // If search parameters exist, count results accordingly
    //     if (whereClauses.length > 0) {
    //       console.log("where clause")
    //       const getCount = await db.query(
    //         `SELECT COUNT(*) FROM ${TABLE_NAMES.MOMMVEND} ${queryValues}`
    //       );
    //       dataCount = getCount.rows[0]?.count;
    //       queryParameter = `${queryValues} ${queryParameter}`;

    //     }

    const offset = parseInt(req.query.offset) || 0;
    let offsetClause = `OFFSET ${offset}`;
    console.log("query:", req?.query);
    console.log("Offset value:", offset);

    let dataCount;

    let whereClauses = [`COALESCE(active, 'N') = 'Y'`]; // Always keep this as a base filter
    let searchKeys = ["v_name", "v_code"];

    // Dynamically add search keys
    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    console.log("whereClauses", whereClauses);

    let whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    let orderClause = `ORDER BY v_code`;

    if (whereClauses.length > 0) {
      console.log("where clause");
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.MOMMVEND} ${whereClause}`
      );
      dataCount = getCount.rows[0]?.count;
    } else {
      if (["Query", "First"].includes(req?.query?.get_data)) {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.MOMMVEND}  WHERE COALESCE(active, 'N') = 'Y' 
       `
        );
        dataCount = getCount.rows[0]?.count;
      }
    }

    const vendorData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MOMMVEND} 
        ${whereClause}
   ${orderClause}
   ${offsetClause}
       `
    );

    //  WHERE COALESCE(active, 'N') = 'Y'
    //  ORDER BY v_code

    const vCode = vendorData.rows[0]?.v_code;

    let vendorTDSDecData = { rows: [] };
    if (vCode) {
      vendorTDSDecData = await db.query(
        `SELECT * FROM ${TABLE_NAMES.MDMMVEND}`
      );

      vendorTDSDecData.rows.forEach((item) => {
        item.acknowledgement_date =
          dateFormater(item.acknowledgement_date) || null;
        item.last_date_return_file =
          dateFormater(item.last_date_return_file) || null;
      });
    }

    const responseData = {
      vendorData: vendorData.rows,
      count: dataCount || 0,
      vendorTDSData: vendorTDSDecData.rows,
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};   

exports.getValidateData = catchAsync(async (req, res) => {
  console.log("getvalidate");
  try {
    const {
      v_code,
      trans_year
     
    } = req.query;

    if (!v_code ) {
    
      return;
    }

    // 1. Check for duplicate
    const duplicateCheckQuery = `
      select 1
		       from mdmmvend_tds_decl
		      where trans_year = $1
						and v_code = $2
    `;
    const duplicateResult = await db.query(duplicateCheckQuery, [
      trans_year,
      v_code
    ]);
    if (duplicateResult.rowCount > 0) {
      return res.status(400).json({
        message:
          "TDS declarations already exists for  this vendor for the year",
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

const postVendorDetails = async (req, res) => {
  try {
    await db.query("BEGIN");
    const { formData, vCode } = req.body;

    const formDataArray = Array.isArray(formData) ? formData : [formData];

    // Filter records that have an id for insertion
    const insertableFormRecords = formDataArray.filter((record) => record.id);

    const insertedCode = [];

    for (const [index, record] of insertableFormRecords.entries()) {  
      const v_code = vCode; 

      // for duplicate check 
   
    const duplicateCheckQuery = `
      select 1
		       from mdmmvend_tds_decl
		      where trans_year = $1
						and v_code = $2
    `;
    const duplicateResult = await db.query(duplicateCheckQuery, [
      record.trans_year,
      v_code
    ]);
    if (duplicateResult.rowCount > 0) {
      return res.status(400).json({
        message:
           `TDS declarations already exists for this vendor ${vCode} for the year ${record.trans_year}`,
      });
    }

      insertedCode.push(v_code);

      delete record.id;
      delete record.isNew;
      delete record.isModified;
      delete record.init_trans_year;
      

      // Check and set empty date fields to null
      if (
        !record.acknowledgement_date ||
        record.acknowledgement_date.trim() === ""
      ) {
        record.acknowledgement_date = null;
      }
      if (
        !record.last_date_return_file ||
        record.last_date_return_file.trim() === ""
      ) {
        record.last_date_return_file = null;
      }

      record.v_code = v_code;
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.MDMMVEND,
        record
      );
      const insertValues = Object.values(record);

      console.log(`Inserting record ${index}: v_code = ${v_code}`);
      console.log("Insert Values:", insertValues);

      try {
        await db.query(insertQuery, insertValues);
        console.log("Insert Query:", insertQuery);
      } catch (error) {
        console.error(`Error inserting form record at index ${index}:`, error);
        throw new Error(`Form insert error at index ${index}`);
      }
    }

    await db.query("COMMIT");
    res.status(200).send({ status: "success", insertedCode });
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query("ROLLBACK");
    return res.status(400).send("Some error occurred");
  }
};

const updateVendorDetails = async (req, res) => {
  const { formData, deletedFormData, vCode } = req.body;

  try {
    await db.query("BEGIN");

    if (Array.isArray(formData) && formData.length >= 1) {
      for (const [index, record] of formData.entries()) { 
         
         // for duplicate check 
   
    const duplicateCheckQuery = `
      select 1
		       from mdmmvend_tds_decl
		      where trans_year = $1
						and v_code = $2
    `;
    const duplicateResult = await db.query(duplicateCheckQuery, [
      record.trans_year,
      vCode
      
    ]);
    if (duplicateResult.rowCount > 0) {
      console.log(vCode)
      return res.status(400).json({
        message:
          `TDS declarations already exists for this vendor ${vCode} for the year ${record.trans_year}`,
      });
    }

        const cleanedRecord = cleanObject(record);

        if (record.id) { 
          console.log('thre is an id')
          // INSERT
          delete cleanedRecord.id;
          delete cleanedRecord.isNew;
          delete cleanedRecord.isModified;
          delete cleanedRecord.init_trans_year

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.MDMMVEND,
            cleanedRecord
          );
          try {
            await db.query(insertQuery, Object.values(cleanedRecord));
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(`Insert error at index ${index}`);
          }
        } else {
          console.log("updated records");  
          const {init_trans_year} = cleanedRecord
          // UPDATE
          delete cleanedRecord.isModified;
          delete cleanedRecord.init_trans_year
          const updateRecord = { ...cleanedRecord };
          const updateColumns = Object.keys(updateRecord);
          const updateValues = Object.values(updateRecord);

          const setClause = updateColumns
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(", ");

          const updateQuery = `
        UPDATE ${TABLE_NAMES.MDMMVEND}
        SET ${setClause}
        WHERE v_code = $${updateColumns.length + 1}
          AND trans_year = $${updateColumns.length + 2}
      `;

          try {
            await db.query(updateQuery, [
              ...updateValues,
              record.v_code,
              init_trans_year,
            ]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(`Update error at index ${index}`);
          }
        }
      }
    }

    // for delete formData record
    if (Array.isArray(deletedFormData) && deletedFormData.length) {
      for (const deletedRecord of deletedFormData) {
        const { v_code, trans_year } = deletedRecord;

        try {
          const deleteQuery = `
            DELETE FROM ${TABLE_NAMES.MDMMVEND}
            WHERE v_code = $1 and trans_year = $2
          `;
          await db.query(deleteQuery, [v_code, trans_year]);
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

    await db.query("COMMIT");
    return res.status(200).send({ status: "Successfully updated" });
  } catch (error) {
    console.error("Transaction failed:", error);
    await db.query("ROLLBACK");
    return res
      .status(500)
      .send({ error: error.message});
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("handleoperation");

  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  // }
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateVendorDetails(req, res);
    return;
  } else {
    await postVendorDetails(req, res);
    return;
  }
});
