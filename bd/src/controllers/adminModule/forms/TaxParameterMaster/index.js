const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");
const { transformTaxDataToDbData } = require("./presentation");


let TABLE_NAMES = {
  TAX_PARA_MSTR: `MOFMPTAX`,
};

const getTaxParaMstrDataOnQuery = async (req, res) => {

 const { formStatus, appDivisionId, appFinYear, userId } = req.query

let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["tax_code"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }
       
  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;

  


  try {
    const offset = parseInt(req.query.offset) || 0;
    const getDataType = req?.query?.get_data;

    let queryParameter = `ORDER BY tax_code LIMIT 1 OFFSET ${offset}`;
    let dataCount = 0;

    
       if(whereClauses.length > 0) {
         const getCount = await db.query(
             `SELECT COUNT(*) FROM ${TABLE_NAMES.TAX_PARA_MSTR} ${queryValues}`
           );
           dataCount = getCount.rows[0]?.count;
           queryParameter = `${queryValues} ${queryParameter}`;
          
   } else {
    switch (getDataType) {
      case "First":
      case "Query": {
        const getCount = await db.query(
          `SELECT COUNT(*) FROM ${TABLE_NAMES.TAX_PARA_MSTR}`
        );
        dataCount = Number(getCount.rows[0]?.count || 0);
        break;
      }
      case "Last": {
        queryParameter = "ORDER BY tax_code DESC LIMIT 1";
        break;
      }
    }
  }
    // 🔹 Get main record
    const getData = await db.query(`
            SELECT * FROM ${TABLE_NAMES.TAX_PARA_MSTR} ${queryParameter}
        `);

      if (getData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No data found",
        totalCount: dataCount,
        taxParaMaster: null,   //  frontend ko empty data bhi mile
      });
    }

    const row = getData.rows[0];
    const accNo = row?.acc_no;
    const saleAccHead = row?.sale_acc_head;

    // 🔹 Prepare placeholders for optional queries
    let accDesc = null;
    let saleAccHeadDesc = null;

    if (accNo) {
      const accResult = await db.query(
        `SELECT acc_desc FROM mhfmglm WHERE acc_no = $1`,
        [accNo]
      );
      accDesc = accResult.rows[0]?.acc_desc || null;
    }

    if (saleAccHead) {
      const saleResult = await db.query(
        `SELECT acc_desc FROM mhfmglm WHERE acc_no = $1`,
        [saleAccHead]
      );
      saleAccHeadDesc = saleResult.rows[0]?.acc_desc || null;
    }

    return res.status(200).json({
      type: "found",
      taxParaMaster: {
        ...row,
        acc_desc: accDesc,
        sale_acc_head_desc: saleAccHeadDesc,
        old_tax_code:row?.tax_code
      },
      totalCount: dataCount,
    });
  } catch (error) {
    console.error("Error in getTaxParaMstrDataOnQuery:", error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};

const helpListData = async (req, res) => {
  const { appFinYear, appDivisionId, form_status, help_list } = req?.query;

  if (!["Insert","Search", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  // for party code help list
  if (help_list === "AccNo") {
    const acc = await db.query(
      `SELECT d.acc_no, h.acc_desc
        FROM mdfmglm d
        JOIN mhfmglm h ON d.acc_no = h.acc_no
        WHERE d.division_id = $1
        AND d.trans_year = $2
        AND COALESCE(d.active, 'N') = 'Y'
        ORDER BY h.acc_desc; `,
      [appDivisionId, appFinYear]
    );
 
    
    return res.status(200).json(acc.rows);
  } else if (help_list === "SaleAccNo") {
    const SaleAccNo = await db.query(
      `SELECT d.acc_no, h.acc_desc
        FROM mdfmglm d
        JOIN mhfmglm h ON d.acc_no = h.acc_no
        WHERE d.division_id = $1
          AND d.trans_year = $2
          AND COALESCE(d.active, 'N') = 'Y'
        ORDER BY h.acc_desc; `,
      [appDivisionId, appFinYear]
    );
   
    
    return res.status(200).json(SaleAccNo.rows);
  }
   else if (help_list === "TaxCode") {
    const TaxCode = await db.query(
      `select tax_code , tax_desc from MOFMPTAX order by tax_desc`
    );
    return res.status(200).json(TaxCode.rows);
  }
}


const insertFormData = async (req, res) => {
  try {
    await db.query("begin");

    const { formData } = req.body;
    
    const taxCode = formData?.tax_code?.trim();
    if (!taxCode) {
      throw new Error("Tax Code is required.");
    }

    //  Step 1: Check if tax_code already exists
    const duplicateCheck = await db.query(
      `SELECT 1 FROM ${TABLE_NAMES.TAX_PARA_MSTR} WHERE tax_code = $1`,
      [taxCode]
    );

    if (duplicateCheck.rowCount > 0) {
      await db.query("rollback");
      return res.status(400).json({ message: "Tax Code already exists in table." });
    }

    //  Step 2: Prepare insert data
    const mofmptax = transformTaxDataToDbData({ ...formData });
    const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.TAX_PARA_MSTR, mofmptax);
    const valuesForInsertQuery = Object.values(mofmptax);

    // Step 3: Run insert query
    await db.query(queryForInsert, valuesForInsertQuery);

    await db.query("commit");
    return res.status(200).json({type:"success", message: "Record inserted successfully." });
  } catch (error) {
    await db.query("rollback");
    console.error("Insert error:", error);
    return res.status(500).json({type:"error", message: error.message || "Internal Server Error" });
  }
};

const updateTaxParameter = async (req, res) => {
  try {
    await db.query("begin");
    let { formData } = req.body;

    if (!formData || !formData.tax_code || !formData.old_tax_code) {
      return res
        .status(400)
        .json({ message: "Missing required tax_code or old_tax_code for update" });
    }

    const { total_count, acc_desc, sale_acc_head_desc, ...filteredFormData } = formData;
    const oldTaxCode = formData.old_tax_code?.trim();
    const newTaxCode = formData.tax_code?.trim();

    //  Step 1: If tax_code changed, check if new one already exists
    if (newTaxCode !== oldTaxCode) {
      const duplicateCheck = await db.query(
        `SELECT 1 FROM ${TABLE_NAMES.TAX_PARA_MSTR} WHERE tax_code = $1`,
        [newTaxCode]
      );

      if (duplicateCheck.rowCount > 0) {
        await db.query("rollback");
        return res.status(400).json({ message: "Tax Code already exists in table." });
      }
    }

    //  Step 2: Clean and normalize
    let cleanData = cleanObject(filteredFormData);
    if (cleanData.refundable !== undefined) {
      cleanData.refundable =
        cleanData.refundable === true || cleanData.refundable === "Y" ? "Y" : "N";
    }

    delete cleanData.old_tax_code;

    const columns = Object.keys(cleanData);
    const values = Object.values(cleanData);

    const setClause = columns
      .map((column, idx) => `${column} = $${idx + 1}`)
      .join(", ");

    const query = `UPDATE ${TABLE_NAMES.TAX_PARA_MSTR}
                   SET ${setClause}
                   WHERE tax_code = $${columns.length + 1}`;

    await db.query(query, [...values, oldTaxCode]);

    await db.query("commit");

    return res.status(200).json({type:"success", message: "Record updated successfully" });
  } catch (error) {
    await db.query("rollback");
    console.error("Error updating tax parameter:", error);
    return res.status(500).json({type:"error", message: error.message || "Internal Server Error"});
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
 
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getTaxParaMstrDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
  
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateTaxParameter(req, res);
    return;
  } else {
    await insertFormData(req, res);
    return;
  }
});
