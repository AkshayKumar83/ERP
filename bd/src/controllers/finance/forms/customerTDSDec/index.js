const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const {transformCustomerTDSDeclToDbData} = require("./presentation");

const TABLE_NAMES = {
  CUS_HEADER: "MOSMCUST",
  CUS_DETAILS: "mdsmcust_tds_decl",
};


  const getDataOnQuery = async (req, res) => {
    try {
      const offset = parseInt(req.query.offset) || 0;
      let offsetClause = `OFFSET ${offset}`;
      console.log("query:", req?.query);
      console.log("Offset value:", offset);

      let dataCount;

      let whereClauses = [`COALESCE(active, 'N') = 'Y'`]; // Always keep this as a base filter
      let searchKeys = ["c_name", "c_code"];

      // Dynamically add search keys
      for (const key of searchKeys) {
        if (req.query[key] !== undefined && req.query[key] !== "") {
          whereClauses.push(`${key} = '${req.query[key]}'`);
        }
      }

      console.log("whereClauses", whereClauses);

      let whereClause =
        whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
      let orderClause = `ORDER BY c_code`;

      if (whereClauses.length > 0) {
        console.log("where clause");
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.CUS_HEADER} ${whereClause}`
        );
        dataCount = getCount.rows[0]?.count;
      } else {
        if (["Query", "First"].includes(req?.query?.get_data)) {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.CUS_HEADER}  WHERE COALESCE(active, 'N') = 'Y' `
          );
          dataCount = getCount.rows[0]?.count;
        }
      }

      const customerData = await db.query(
        `SELECT * FROM ${TABLE_NAMES.CUS_HEADER} 
          ${whereClause}
          ${orderClause}
          ${offsetClause}
        `
      );


      const cCode = customerData.rows[0]?.c_code;

      let customerTDSDecData = { rows: [] };
      if (cCode) {
        customerTDSDecData = await db.query(
          `SELECT * FROM ${TABLE_NAMES.CUS_DETAILS}`
        );

        customerTDSDecData.rows.forEach((item) => {
          item.acknowledgement_date = dateFormater(item.acknowledgement_date) || null;
          item.last_date_return_file = dateFormater(item.last_date_return_file) || null;
        });
      }

      const responseData = {
        customerData: customerData.rows,
        count: dataCount || 0,
        customerTDSDecData: customerTDSDecData.rows,
      };
      res.status(200).json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }; 

  const helpListData = async (req,res) => {
      const {help_list,form_status} = req?.query
    if (!["Insert","Update"].includes(form_status)) {
          return res.status(200).send([]);
      }
    if (help_list === "year") {
          const year = await db.query(
          `select year_code  from moitfinyear order by year_code`
          );
          return res.status(200).json(year.rows);
    }
  }


    const postCustomerTDS = async (req, res, next) => {
   try {
    await db.query("BEGIN");

    const tdsDeclarations = req.body.newRows || [];

    const newRows = tdsDeclarations.filter(
      (row) => row.isStatus === "new" );

    for (const row of newRows) {
      const customerData = transformCustomerTDSDeclToDbData(row);
      const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.CUS_DETAILS, customerData);
      const values = Object.values(customerData);
      await db.query(queryForInsert, values);
    }

    await db.query("COMMIT");

    res.status(200).json({
      type: "success",
      message: "Data Insert successful",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);
    res.status(500).json({
      type: "error",
      message: error.message || "Failed to Insert in customer TDS Dec.",
    });
  }
  };

const updateCustomerTDS = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { newRows = [], updatedRows = [], deletedRows = [] } = req.body;

  
         // insert
    for (const row of newRows) {
      const insertData = transformCustomerTDSDeclToDbData(row);
      const insertQuery = generateSingleInsertQuery(
        TABLE_NAMES.CUS_DETAILS,
        insertData
      );
      await db.query(insertQuery, Object.values(insertData));
    }
    // update
    for (const row of updatedRows) {
      const updateData = transformCustomerTDSDeclToDbData(row);

      const cols = Object.keys(updateData);
      const values = Object.values(updateData);

      const setClause = cols
        .map((col, idx) => `${col} = $${idx + 1}`)
        .join(", ");

      //  Use old_trans_year for WHERE
      const updateQuery = `
        UPDATE ${TABLE_NAMES.CUS_DETAILS}
        SET ${setClause}
        WHERE c_code = $${cols.length + 1}
          AND trans_year = $${cols.length + 2}
      `;

      await db.query(updateQuery, [
        ...values,
        row.c_code,
        row.old_trans_year,  
      ]);
    }

   // delete
    for (const row of deletedRows) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.CUS_DETAILS}
         WHERE c_code = $1 AND trans_year = $2`,
        [row.c_code, row.trans_year]
      );
    }

    await db.query("COMMIT");

    res.status(200).json({
      type: "success",
      message: "Customer TDS Declaration Updated Successfully",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Update Error:", error);
    res.status(500).json({
      type: "error",
      message: error.message || "Failed to update Customer TDS Declaration",
    });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
    if (req?.query?.help_list) {
        await helpListData(req, res);
        return;
    }
});

exports.checkValidateYear = catchAsync(async (req, res, next) => {

  const { c_code, trans_year } = req.query;

  if (!c_code || !trans_year) {
    return res.json({
      success: false,
      isDuplicate: false,
      message: "c_code or trans_year missing"
    });
  }

  const result = await db.query(
    `SELECT 1 FROM mdsmcust_tds_decl 
     WHERE c_code = $1 AND trans_year = $2 LIMIT 1`,
    [c_code, trans_year]
  );

  return res.json({
    success: true,
    isDuplicate: result.rowCount > 0
  });
});


exports.handlePostFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateCustomerTDS(req, res);
        return;
    }
    
    if (req?.query?.form_status === "Insert") {
        await postCustomerTDS(req, res);
        return;
    }
});