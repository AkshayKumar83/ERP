
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { transformPriceListData } = require("./presentation");
const { generateSingleInsertQuery } = require("../../../utility/query");

let TABLE_NAMES = {
  PRICE_LIST: `MOSMPCUS`,
};

// ================= GET PRICE LIST DATA =================
const getPriceListDataQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req.query;
  let whereClauses = [];
  let searchKeys = ["c_code"];

  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  let queryValues = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;

  try {
    const offset = parseInt(req.query.offset) || 0;
    const getDataType = req?.query?.get_data;

    let queryParameter = `ORDER by c_code, it_code LIMIT 1 OFFSET ${offset}`;
    let dataCount = 0;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(*) FROM ${TABLE_NAMES.PRICE_LIST} ${queryValues}`
      );
      dataCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (getDataType) {
        case "First":
        case "Query": {
          const getCount = await db.query(
            `SELECT COUNT(*) FROM ${TABLE_NAMES.PRICE_LIST}`
          );
          dataCount = Number(getCount.rows[0]?.count || 0);
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY c_code,it_code DESC LIMIT 1";
          break;
        }
      }
    }

    const getData = await db.query(`SELECT * FROM ${TABLE_NAMES.PRICE_LIST} ${queryParameter}`);
    if (getData.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        message: "No data found on Query",
        totalCount: dataCount,
      });
    }

    const row = getData.rows[0];
    const cCode = row?.c_code;
    const itCode = row?.it_code;

    let cCodeDesc = null;
    let itCodeDesc = null;

    if (cCode) {
      const cCodeResult = await db.query(`SELECT c_name FROM mosmcust WHERE c_code = $1`, [cCode]);
      cCodeDesc = cCodeResult.rows[0]?.c_name || null;
    }

    if (itCode) {
      const itCodeResult = await db.query(`SELECT it_name AS it_desc FROM mommitem WHERE it_code = $1`, [itCode]);
      itCodeDesc = itCodeResult.rows[0]?.it_desc || null;
    }

    return res.status(200).json({
      type: "found",
      priceList: {
        ...row,
        c_name: cCodeDesc,
        it_desc: itCodeDesc,
        current_c_code: cCode,
        current_it_code: itCode,
        current_cus_it_code: getData.rows[0]?.cus_it_code
      },
      totalCount: dataCount,
    });

  } catch (error) {
    console.error("Error in getPriceListDataQuery:", error);
    return res.status(500).json({ message: "Internal server error on query" });
  }
};

// ================= HELPLIST =================
const helpListData = async (req, res) => {
  const { help_list, form_status, f_c_code, f_it_code } = req.query;
  const isInsertOrUpdate = form_status === "Insert" || form_status === "Update"|| form_status === "Search";

  try {
    // if (help_list === "cCode" && isInsertOrUpdate) {

    //   const cusCode = await db.query(`SELECT c_name, c_code FROM vwcustactive ORDER BY c_name`);

    //   return res.status(200).json(cusCode.rows.length > 0 ? cusCode.rows : []);
    // }
    if (help_list === "cCode") {
      if (form_status === "Insert" || form_status === "Update") {
        // Insert/Update case
        const cusCode = await db.query(
          `SELECT c_name, c_code FROM vwcustactive ORDER BY c_name`
        );
        return res.status(200).json(cusCode.rows.length > 0 ? cusCode.rows : []);
      } else if (form_status === "Search") {
        // Search case -> distinct query
        const cusCode = await db.query(
          `select distinct a.c_code , b.c_name from MOSMPCUS a, vwcustactive b
            where b.c_code = a.c_code order by b.c_name`
        );
        return res.status(200).json(cusCode.rows.length > 0 ? cusCode.rows : []);
      }
    }
     else if (help_list === "itCode" && isInsertOrUpdate) {

      const itCode = await db.query(`SELECT it_desc, it_code FROM mosmprod ORDER BY 2`);

      return res.status(200).json(itCode.rows.length > 0 ? itCode.rows : []);
    }
     else if (help_list === "itDesc" && isInsertOrUpdate) {

      const itDesc = await db.query(`SELECT it_desc, it_code FROM mosmprod ORDER BY 1`);

      return res.status(200).json(itDesc.rows.length > 0 ? itDesc.rows : []);
    } 
    else if (help_list === "showCusProd" && isInsertOrUpdate) {

      if (!f_c_code || !f_it_code) {
        return res.status(400).json({ error: "Customer code and Item code are required" });
      }

      const showCusProd = await db.query(
        `SELECT cus_it_code, cus_it_desc, cus_it_prc, it_rate 
         FROM mosmpcus 
         WHERE c_code = $1 AND it_code = $2 
         ORDER BY cus_it_code`,
        [f_c_code, f_it_code]
      );
      return res.status(200).json(showCusProd.rows.length > 0 ? showCusProd.rows : []);
    } else {
      return res.status(400).json({ error: "Invalid request" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ================= VALIDATION =================
const validateCusCode = async (req, res) => {
  const { c_code } = req.query;
  if (!c_code) {
    return res.status(400).json({ errMsg: "customer code is required." });
  }
  try {
    const getCusCode = await db.query(
      `SELECT c_name FROM vwCustActive WHERE c_code = $1`, [c_code]
    );
    if (getCusCode.rowCount > 0) {
      res.status(200).json({ c_name: getCusCode.rows[0].c_name });
    } else {
      return res.status(200).json({ errMsg: 'Customer Code does not exist in Customer Master' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMsg: "An error occurred while fetching the customer details." });
  }
};

const validateProductCode = async (req, res) => {
  const { it_code } = req.query;
  if (!it_code) {
    return res.status(400).json({ errMsg: "Item code is required." });
  }
  try {
    const getCusCode = await db.query(
      `SELECT it_desc FROM MOSMPROD WHERE it_code = $1`, [it_code]
    );
    if (getCusCode.rowCount > 0) {
      res.status(200).json({ it_desc: getCusCode.rows[0].it_desc });
    } else {
      return res.status(200).json({ errMsg: 'Item Code does not exist in Product Master' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMsg: "An error occurred while fetching the product details." });
  }
};


// ================= DUPLICATE CHECK =================
const checkDuplicateExact = async (c_code, it_code, cus_it_code, eff_date) => {
  const query = `
    SELECT 1 FROM ${TABLE_NAMES.PRICE_LIST}
    WHERE c_code = $1 AND it_code = $2 AND cus_it_code = $3 AND eff_date = $4
  `;
  const result = await db.query(query, [c_code, it_code, cus_it_code, eff_date]);
  return result.rowCount > 0;
};

const checkDuplicateWithoutEffDate = async (c_code, it_code, cus_it_code) => {
  const query = `
    SELECT 1 FROM ${TABLE_NAMES.PRICE_LIST}
    WHERE c_code = $1 AND it_code = $2 AND cus_it_code = $3
  `;
  const result = await db.query(query, [c_code, it_code, cus_it_code]);
  return result.rowCount > 0;
};

// ================= INSERT =================
const submitPriceList = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { formData } = req.body;
    let priceListData = transformPriceListData({ ...formData });

    const requiredFields = ["c_code", "it_code", "cus_it_code", "cus_it_desc", "eff_date"];
    for (let field of requiredFields) {
      if (!priceListData[field]) {
        await db.query("ROLLBACK");
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // 1. Check for exact duplicate (including eff_date)
    if (await checkDuplicateExact(priceListData.c_code, priceListData.it_code, priceListData.cus_it_code, priceListData.eff_date)) {
      await db.query("ROLLBACK");
      return res.status(200).json({
        type: "error",
        message:
          "This Customer Product Code is already defined\n" +
          "against Selected Customer and Product and Effective date"
      });
    }

    // 2. Check for same PK combination but different eff_date
    if (await checkDuplicateWithoutEffDate(priceListData.c_code, priceListData.it_code, priceListData.cus_it_code)) {
      await db.query("ROLLBACK");
      return res.status(200).json({
        type: "error",
        message:
          "This Customer Product Code already exists for the selected Customer and Product"
      });
    }

    const priceListInsertQuery = generateSingleInsertQuery(TABLE_NAMES.PRICE_LIST, priceListData);
    await db.query(priceListInsertQuery, Object.values(priceListData));

    await db.query("COMMIT");

    res.status(200).json({
      message: "Record inserted successfully",
      type: "inserted",
      inserted: priceListData
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error at submitPriceList:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE =================
const updateFormData = async (req, res) => {
  try {
    await db.query("BEGIN");

    const formData = { ...req?.body.formData };
    const { current_c_code, current_it_code, current_cus_it_code, ...newFormData } = formData;

    const priceListData = transformPriceListData(newFormData);

    // 1. Check for exact duplicate
    const duplicateExact = await db.query(
      `SELECT 1 FROM ${TABLE_NAMES.PRICE_LIST}
       WHERE c_code = $1 AND it_code = $2 AND cus_it_code = $3 AND eff_date = $4
       AND NOT (c_code = $5 AND it_code = $6 AND cus_it_code = $7)`,
      [
        formData.c_code,
        formData.it_code,
        formData.cus_it_code,
        formData.eff_date,
        current_c_code,
        current_it_code,
        current_cus_it_code
      ]
    );

    if (duplicateExact.rowCount > 0) {
      await db.query("ROLLBACK");
      return res.status(200).json({
        type: "error",
        message:
          "This Customer Product Code is already defined\n" +
          "against Selected Customer and Product and Effective date"
      });
    }

    // 2. Check for same PK combination but different eff_date
    const duplicateNoDate = await db.query(
      `SELECT 1 FROM ${TABLE_NAMES.PRICE_LIST}
       WHERE c_code = $1 AND it_code = $2 AND cus_it_code = $3
       AND NOT (c_code = $4 AND it_code = $5 AND cus_it_code = $6)`,
      [
        formData.c_code,
        formData.it_code,
        formData.cus_it_code,
        current_c_code,
        current_it_code,
        current_cus_it_code
      ]
    );

    if (duplicateNoDate.rowCount > 0) {
      await db.query("ROLLBACK");
      return res.status(200).json({
        type: "error",
        message:
          "This Customer Product Code already exists for the selected Customer and Product"
      });
    }

    const columns = Object.keys(priceListData);
    const values = Object.values(priceListData);
    const setClause = columns.map((column, idx) => `${column} = $${idx + 1}`).join(", ");
    const whereClause = `c_code = $${columns.length + 1} AND it_code = $${columns.length + 2} AND cus_it_code = $${columns.length + 3}`;
    const query = `UPDATE ${TABLE_NAMES.PRICE_LIST} SET ${setClause} WHERE ${whereClause} RETURNING *`;

    const result = await db.query(query, [...values, current_c_code, current_it_code, current_cus_it_code]);

    if (result.rowCount === 0) {
      await db.query("ROLLBACK");
      return res.status(400).json({ type: "error", message: `No record found` });
    }

    await db.query("COMMIT");

    return res.status(200).json({ type: "updated", updatedData: result.rows[0] });
  } catch (error) {
    console.error("Update Error:", error);
    await db.query("ROLLBACK");
    return res.status(400).json({ type: "error", message: error.message || "Failed to update data" });
  }
};


exports.handleFormOperation = catchAsync(async (req, res) => {

  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getPriceListDataQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  if (req?.query?.c_code && req?.query?.form_status != 'Search') {
    await validateCusCode(req, res);
    return;
  }

  if (req?.query?.it_code && req?.query?.form_status != 'Search') {
    await validateProductCode(req, res);
    return;
  }
});


exports.handleSubmitFormData = catchAsync(async (req, res) => {
  const { form_status } = req.query;
  const { checkAndSave } = req.body;

  if (form_status === "Insert" && checkAndSave) {
    await submitPriceList(req, res);
  }
});

exports.handleUpdateFormData = catchAsync(async (req, res) => {
  if (req?.query?.form_status === "Update") {
    await updateFormData(req, res);
  }
});