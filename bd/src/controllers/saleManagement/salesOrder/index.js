const { response } = require("express");
const format = require("pg-format");
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  generateSingleUpdateQuery,
} = require("../../../utility/query");
const {
  fieldTypeMap,
  fieldTypeMapForUpdate,
  fieldTypeMapForMdsmordr,
} = require("./saleOrderHelper");

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
  }
});

const getDataOnQuery = async (req, res) => {
  try {
    let whereClauses = [];

    const searchKeys = ["order_no", "order_dt", "c_code"];

    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    let queryFilter =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
    let queryParameter = `ORDER BY order_no LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let dataCount;

    if (whereClauses.length > 0) {
      // Count the results based on whereClauses
      const countResult = await db.query(
        `SELECT COUNT(*) FROM mhsmordr ${queryFilter}`
      );
      dataCount = countResult.rows[0]?.count;
      queryParameter = `${queryFilter} ${queryParameter}`;
    } else {
      // Default to calculating count based on the entire table if no whereClauses
      const countResult = await db.query(`SELECT COUNT(*) FROM mhsmordr`);
      dataCount = countResult.rows[0]?.count;

      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY order_no DESC LIMIT 1";
          break;
        }
        default:
          queryParameter = `ORDER BY order_no LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
      }
    }

    // Fetch the actual data based on the modified query
    const mainOrderDataResult = await db.query(
      `SELECT * FROM mhsmordr ${queryParameter}`
    );
    const mainFormData = mainOrderDataResult.rows?.[0] || null;

    if (!mainFormData) {
      return res.status(200).send({
        message: "No sales order data found",
        type: "not found",
        count: 0,
      });
    }

    // Format all date fields as YYYY-MM-DD
    for (const key in mainFormData) {
      const value = mainFormData[key];
      if (
        value instanceof Date ||
        (typeof value === "string" &&
          !isNaN(Date.parse(value)) &&
          value.includes("T"))
      ) {
        const date = new Date(value);
        const formatted = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        mainFormData[key] = formatted;
      }
    }

    // Fetch customer-related names
    const [cNameResult, shipToNameResult, billToNameResult] = await Promise.all(
      [
        db.query(`SELECT C_NAME FROM MOSMCUST WHERE C_CODE = $1`, [
          mainFormData.c_code,
        ]),
        db.query(
          `SELECT C_NAME AS ship_to_name FROM MOSMCUST WHERE C_CODE = $1`,
          [mainFormData.ship_to_code]
        ),
        db.query(
          `SELECT C_NAME AS bill_to_name FROM MOSMCUST WHERE C_CODE = $1`,
          [mainFormData.bill_to_code]
        ),
      ]
    );

    // Append names to mainFormData
    mainFormData.c_name = cNameResult.rows?.[0]?.c_name || null;
    mainFormData.ship_to_name =
      shipToNameResult.rows?.[0]?.ship_to_name || null;
    mainFormData.bill_to_name =
      billToNameResult.rows?.[0]?.bill_to_name || null;

    // Fetch itemFormData from mdsmordr using order_no
    const itemDataResult = await db.query(
      `SELECT * FROM mdsmordr WHERE order_id = $1`,
      [mainFormData.order_id]
    );
    const itemFormData = itemDataResult.rows || [];

    // Enrich each item with it_desc and apply_tax_paid_price
    await Promise.all(
      itemFormData.map(async (item) => {
        const prodResult = await db.query(
          `SELECT p.it_desc, p.apply_tax_paid_price FROM mosmprod p WHERE p.it_code = $1`,
          [item.it_code]
        );
        const prodInfo = prodResult.rows?.[0] || {};
        item.it_desc = prodInfo.it_desc || null;
        item.apply_tax_paid_price = prodInfo.apply_tax_paid_price || null;
      })
    );

    return res.send({
      type: "found",
      mainFormData,
      itemFormData,
      count: dataCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: `Internal server error on query: ${error.message}`,
    });
  }
};

// Fetch drop down data for sales order forms various fields
exports.fetchDropdownData = catchAsync(async (req, res) => {
  console.log("Fetching dropdown data for sales order form");
  try {
    const [
      typeList,
      currencyList,
      paymentTerms,
      modeOfTransport,
      priceBasis,
      packingOptions,
    ] = await Promise.all([
      db.query(`
        SELECT da_cat as value, da_cat_desc as label
        FROM mosmdact 
        WHERE invoice = 'Y' 
        ORDER BY da_cat_desc
      `),
      db.query(`
        SELECT curr_code as value, curr_desc as label
        FROM currency 
        ORDER BY curr_desc
      `),
      db.query(`
        SELECT  term_code as value, term_desc as label
        FROM mhmmterm 
        WHERE sale_or_purchase = 'S' 
        ORDER BY term_desc
      `),
      db.query(`
        SELECT code as value, description as label  
        FROM mommcode 
        WHERE cat_group = 'MOT' 
        ORDER BY description
      `),
      db.query(`
        SELECT code as value, description as label 
        FROM mommcode 
        WHERE cat_group = 'PBASIS' 
        ORDER BY description
      `),
      db.query(`
        SELECT code as value, description as label
        FROM mommcode 
        WHERE cat_group = 'PACK' 
        ORDER BY description
      `),
    ]);

    return res.status(200).json({
      typeList: typeList.rows,
      currencyList: currencyList.rows,
      paymentTerms: paymentTerms.rows,
      modeOfTransport: modeOfTransport.rows,
      priceBasis: priceBasis.rows,
      packingOptions: packingOptions.rows,
    });
  } catch (error) {
    console.error("Dropdown Fetch Error:", error);
    return res.status(500).json({
      message: "Failed to fetch dropdown data",
      error: error.message,
    });
  }
});

exports.helpListData = catchAsync(async (req, res) => {
  try {
    const helpList = req?.query?.help_list;

    let query = "";
    let values = [];

    switch (helpList) {
      // 1. Customer code in Main Tab (Help List)
      case "c_code":
        query = `
            SELECT 
              a.c_name, 
              a.c_code, 
              SUBSTR(get_from_state(c.c_city, 'C', 'N'), 1, 100) AS city 
            FROM vwcustactive a
            JOIN mosmcust c ON a.c_code = c.c_code
            JOIN mommcode ss ON c.cust_type = ss.code
            WHERE 
              UPPER(ss.description) NOT LIKE '%DEALER%' 
              AND ss.cat_group = 'CTYPE'
            ORDER BY a.c_name
          `;
        break;

      // 2. Sales person in Main Tab
      case "sales_pers_cd":
        query = `
            SELECT emp_name, emp_cd 
            FROM mhpmempm 
            ORDER BY emp_name
          `;
        break;

      // 3. Catalog code in Item Tab
      case "catalog_code":
        query = `
            SELECT catalog_code, it_code, it_desc 
            FROM mosmprod 
            WHERE active = 1 
            ORDER BY catalog_code
          `;
        break;

      // 4. Item code in Item Tab
      case "it_code":
        query = `
            SELECT it_code, it_desc 
            FROM mosmprod 
            WHERE active = 1 
            ORDER BY it_code
          `;
        break;

      default:
        return res.status(400).send({
          message: `Invalid help_list value: ${helpList}`,
          type: "error",
        });
    }

    const result = await db.query(query, values);
    return res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error in helpListData:", error);
    return res.status(500).json({
      message: "Failed to fetch dropdown data",
      error: error.message,
    });
  }
});

exports.handlePostFormData = catchAsync(async (req, res) => {
  const formStatus = req?.query?.form_status;
  if (!formStatus) {
    return res.status(404).send({ errMsg: "Cannot Save Data" });
  }
  await postSalesOrder(req, res);
});

function sanitizePayload(input, typeMap) {
  return Object.entries(typeMap).reduce((acc, [key, expectedType]) => {
    const value = input[key];

    if (value === "" || value === undefined || value === null) {
      acc[key] = null;
      return acc;
    }

    switch (expectedType) {
      case "number":
        acc[key] = isNaN(Number(value)) ? null : Number(value);
        break;
      case "boolean":
        acc[key] = value === "Y" || value === "1" || value === true;
        break;
      case "date":
        const parsedDate = new Date(value);
        acc[key] = isNaN(parsedDate.getTime())
          ? null
          : parsedDate.toISOString();
        break;
      case "string":
        acc[key] = String(value);
        break;
      default:
        acc[key] = value;
    }

    return acc;
  }, {});
}

// Function to generate a random 6-digit number
function generateUniqueOrderId() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number between 100000 and 999999
}

const cleanObject = (obj) => {
  const cleanedObj = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleanedObj[key] = obj[key];
    }
  }
  return cleanedObj;
};

const postSalesOrder = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { mhsmordr, mdsmordr } = req.body;

    if (!mhsmordr) {
      return res.status(400).json({
        error: true,
        message: "Missing mhsmordr (order header) data",
      });
    }

    // const generateID = await db.query(
    //   `SELECT nextval('integral.s_mhsmordr_order_id')`
    // );
    const generatedOrderId = generateUniqueOrderId();
    mhsmordr.order_no = generatedOrderId;

    const headerData = sanitizePayload(
      { ...mhsmordr, order_id: generatedOrderId },
      fieldTypeMapForUpdate
    );

    const insertableKeys = Object.keys(headerData);
    const headerValues = insertableKeys.map((key) => headerData[key]);

    const insertQuery = `
      INSERT INTO integral.mhsmordr(${insertableKeys.join(", ")})
      VALUES (${insertableKeys.map((_, i) => `$${i + 1}`).join(", ")})
      RETURNING order_id;
    `;

    const headerInsertResult = await db.query(insertQuery, headerValues);
    if (headerInsertResult.rowCount === 0) {
      throw new Error("Failed to insert into mhsmordr");
    }

    const orderId = headerInsertResult.rows[0]?.order_id;

    if (orderId && Array.isArray(mdsmordr)) {
      await postMdsmordrItems(mdsmordr, orderId);
    }

    await db.query("COMMIT");
    return res.status(200).json({
      message: "Sales order inserted successfully",
      orderId,
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    await db.query("ROLLBACK");
    return res.status(500).json({
      error: true,
      message: `Sales order insert failed: ${error.message}`,
    });
  }
};

const postMdsmordrItems = async (items, orderId) => {
  const filteredItems = items.filter(
    (item) => item.it_code && item.it_code.trim() !== ""
  );

  if (filteredItems.length === 0) {
    console.log("No valid items to insert into mdsmordr.");
    return;
  }

  const sanitizedItems = filteredItems.map((item) =>
    sanitizePayload({ ...item, order_id: orderId }, fieldTypeMapForMdsmordr)
  );

  const insertableItemKeys = Object.keys(sanitizedItems[0]);
  const itemValues = sanitizedItems.map((item) =>
    insertableItemKeys.map((key) => item[key])
  );

  const insertQuery = format(
    `INSERT INTO integral.mdsmordr (%I) VALUES %L`,
    insertableItemKeys,
    itemValues
  );

  const result = await db.query(insertQuery);
  if (result.rowCount === 0) {
    throw new Error("Failed to insert items into mdsmordr");
  }
};

exports.fetchCustomerDependentData = catchAsync(async (req, res) => {
  console.log("Fetching customer-dependent data for c_code:", req.query.c_code);
  try {
    const c_code = req?.query?.c_code;

    if (!c_code) {
      return res.status(400).json({
        message: "Missing required query parameter: c_code",
      });
    }

    const result = await db.query(
      `
      SELECT 
        curr_cd, 
        term_code, 
        mode_cd, 
        del_terms AS price_basis,
        ex_rate AS curr_conv,
        CASE WHEN octroi = 'Y' THEN 2 ELSE 1 END AS octroi_flg,
        CASE WHEN freight = 'Y' THEN 2 ELSE 1 END AS frt_flg,
        CASE WHEN insurance = 'Y' THEN 2 ELSE 1 END AS ins_flg,
        COALESCE(port_disc, get_from_state(c_city, 'C', 'N')) AS final_dest
      FROM mosmcust cc
      JOIN mommcode ss ON cc.cust_type = ss.code
      LEFT JOIN moemcurr cu ON cc.curr_cd = cu.curr_code
      WHERE c_code = $1
        AND UPPER(ss.description) NOT LIKE '%DEALER%'
        AND ss.cat_group = 'CTYPE'
      `,
      [c_code]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Customer dependent data fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch customer-dependent data",
      error: error.message,
    });
  }
});

exports.verifyItemCode = catchAsync(async (req, res) => {
  console.log("Verifying item code:", req.query.it_code);

  //select it_code from mosmprod where active = 1  AND it_code= $1 -- itemFormData.it_code of selecting row

  try {
    const it_code = req?.query?.it_code;

    if (!it_code) {
      return res.status(400).json({
        message: "Missing required query parameter: it_code",
      });
    }

    const result = await db.query(
      `
      SELECT it_code 
      FROM mosmprod 
      WHERE active = 1 AND it_code = $1
      `,
      [it_code]
    );
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Item code verification error:", error);
    return res.status(500).json({
      message: "Failed to verify item code",
      error: error.message,
    });
  }
});

exports.verifyHSNCode = catchAsync(async (req, res) => {
  const {
    it_code,
    c_code: customerCode,
    inv_type,
    division_id,
    trans_year,
  } = req.query;
  console.log("Verifying HSN code:", it_code, customerCode);

  if (!it_code || !customerCode || !division_id || !trans_year) {
    return res.status(400).json({
      message:
        "Missing required query parameters: it_code, c_code, division_id or trans_year",
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT HSN_SAC_CODE FROM MOMMITEM WHERE IT_CODE = $1`,
      [it_code]
    );

    if (rows.length === 0) {
      return res.status(200).json({ hsn_sac_code: null });
    }

    const hsn_sac_code = rows[0].hsn_sac_code;
    const response = { hsn_sac_code };

    // Get GST State Code (non-blocking)
    let gst_state_code = null;
    try {
      const gstStateQuery = `
        SELECT GST_STATE_CODE AS gst_state_code FROM MOITSTATE S 
        WHERE TYPE = 'S' AND STATE_ID = (
          SELECT NN.STATE_ID FROM MOITDIVISION NN WHERE NN.DIVISION_ID = $1
        ) LIMIT 1;
      `;
      const gstStateResult = await db.query(gstStateQuery, [division_id]);
      gst_state_code = gstStateResult.rows[0]?.gst_state_code || null;
      if (gst_state_code) {
        response.gst_state_code = gst_state_code;
      }
    } catch (err) {
      console.error("Non-blocking GST state code fetch failed:", err.message);
    }

    // Call sm_so_fill_gst_dtl_itemwise (non-blocking)
    if (hsn_sac_code && gst_state_code) {
      try {
        const gstDetailQuery = `
          SELECT * FROM sm_so_fill_gst_dtl_itemwise(
            $1, $2, NULL, $3, 0, $4
          )
        `;
        const { rows: gstRows } = await db.query(gstDetailQuery, [
          hsn_sac_code,
          customerCode, // bill_to_code assumed as c_code
          it_code,
          gst_state_code,
        ]);

        if (gstRows.length > 0) {
          const {
            gst_sgst_val,
            gst_sgst_cess_val,
            gst_cgst_val,
            gst_cgst_cess_val,
            gst_igst_val,
            gst_igst_cess_val,
            gst_ugst_val,
            gst_ugst_cess_val,
          } = gstRows[0];

          Object.assign(response, {
            gst_sgst_val,
            gst_sgst_cess_val,
            gst_cgst_val,
            gst_cgst_cess_val,
            gst_igst_val,
            gst_igst_cess_val,
            gst_ugst_val,
            gst_ugst_cess_val,
          });
        }
      } catch (err) {
        console.error("GST detail function call failed:", err.message);
      }
    }

    // Customer-specific logic
    const customerResult = await db.query(
      `SELECT CUS_IT_CODE FROM mosmpcus 
       WHERE c_code = $1 AND it_code = $2 AND active = 'Y' LIMIT 1`,
      [customerCode, it_code]
    );

    const customerData = customerResult.rows[0];

    if (customerData?.cus_it_code != null) {
      response.cus_it_code = customerData.cus_it_code;
    } else {
      const itemResult = await db.query(
        `SELECT p.it_desc, p.it_um_cd AS it_uom, 
                c.cus_it_code, c.cus_it_desc, p.apply_tax_paid_price
         FROM mosmprod p
         FULL OUTER JOIN mosmpcus c 
           ON c.c_code = $1 AND c.it_code = p.it_code AND c.active = 'Y'
         WHERE p.it_code = $2 AND p.active = 1 LIMIT 1`,
        [customerCode, it_code]
      );

      if (itemResult.rows.length > 0) {
        const {
          it_desc,
          it_uom,
          cus_it_code,
          cus_it_desc,
          apply_tax_paid_price,
        } = itemResult.rows[0];

        Object.assign(response, {
          it_desc: it_desc ?? null,
          it_uom: it_uom ?? null,
          cus_it_code: cus_it_code ?? null,
          cus_it_desc: cus_it_desc ?? null,
          apply_tax_paid_price: apply_tax_paid_price ?? null,
        });
      }
    }

    // Sale AC head logic
    if (inv_type) {
      const { rows: saleHeadRows } = await db.query(
        `SELECT sm_so_get_sale_ac_head($1, $2, $3) AS sale_ac_head`,
        [inv_type, customerCode, it_code]
      );

      const sale_ac_head = saleHeadRows[0]?.sale_ac_head || null;
      let sale_ac_desc = null;

      if (sale_ac_head) {
        const { rows: descRows } = await db.query(
          `SELECT acc_desc FROM vwGlmActive 
           WHERE division_id = $1 AND acc_no = $2 AND trans_year = $3`,
          [division_id, sale_ac_head, trans_year]
        );
        sale_ac_desc = descRows[0]?.acc_desc || null;
      }

      Object.assign(response, { sale_ac_head, sale_ac_desc });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("HSN code verification error:", error);
    return res.status(500).json({
      message: "Failed to verify HSN code",
      error: error.message,
    });
  }
});


exports.handleUpdateFormData = catchAsync(async (req, res) => {
  // return error if order_id is not present in the request body
  if (!req.body?.mhsmordr?.order_id) {
    return res.status(400).json({
      error: true,
      message: "Missing order_id in request body",
    });
  }
  await updateSalesOrder(req, res);
});

const updateSalesOrder = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { mhsmordr, mdsmordr } = req.body;

    if (!mhsmordr || typeof mhsmordr !== "object") {
      throw new Error("Invalid mhsmordr data");
    }

    const orderId = mhsmordr.order_id;
    if (!orderId) throw new Error("order_id is required");
    delete mhsmordr.order_id;

    const sanitizedPayload = sanitizePayload(mhsmordr, fieldTypeMapForUpdate);

    const keys = Object.keys(sanitizedPayload).filter(
      (key) =>
        sanitizedPayload[key] !== null && sanitizedPayload[key] !== undefined
    );
    if (keys.length === 0) throw new Error("No valid fields to update");

    const values = keys.map((key) => sanitizedPayload[key]);
    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");

    const updateQuery = `
      UPDATE integral.mhsmordr
      SET ${setClause}
      WHERE order_id = $${keys.length + 1}
    `;
    const result = await db.query(updateQuery, [...values, Number(orderId)]);
    if (result.rowCount === 0) throw new Error("Failed to update mhsmordr");

    // Update items
    if (Array.isArray(mdsmordr) && mdsmordr.length > 0) {
      await updateMdsmordrItems(mdsmordr, orderId);
    }

    await db.query("COMMIT");
    return res
      .status(200)
      .json({ message: "Sales order updated successfully", orderId });
  } catch (error) {
    console.error("Transaction failed:", error);
    await db.query("ROLLBACK");
    return res.status(500).json({
      error: true,
      message: `Sales order update failed: ${error.message}`,
    });
  }
};

const updateMdsmordrItems = async (items, orderId) => {
  for (const [index, item] of items.entries()) {
    try {
      // Skip item if it_code is missing
      if (!item.it_code) {
        console.log(`Skipping detail row ${index} - missing it_code`);
        continue;
      }
      const { it_code, sr_no } = item;

      // Check if the item exists
      const checkQuery = `
        SELECT 1 FROM integral.mdsmordr
        WHERE order_id = $1 AND it_code = $2 AND sr_no = $3
      `;
      const checkResult = await db.query(checkQuery, [orderId, it_code, sr_no]);
      if (checkResult.rowCount === 0) {
        // Item doesn't exist — insert instead
        await postMdsmordrItems([item], orderId);
        continue;
      }

      // Item exists — proceed to update

      const detail = cleanObject(item);
      const keys = Object.keys(detail).filter(
        (key) => detail[key] !== null && detail[key] !== undefined
      );

      if (keys.length === 0) {
        console.log(`No valid fields to update for detail row ${index}`);
        continue;
      }

      const values = keys.map((key) => detail[key]);
      const setClause = keys
        .map((key, idx) => `${key} = $${idx + 1}`)
        .join(", ");

      const orderIdIndex = keys.length + 1;
      const itCodeIndex = keys.length + 2;
      const srNoIndex = keys.length + 3;

      const query = `
        UPDATE integral.mdsmordr
        SET ${setClause}
        WHERE order_id = $${orderIdIndex}
          AND it_code = $${itCodeIndex}
          AND sr_no = $${srNoIndex}
      `;

      await db.query(query, [...values, orderId, detail.it_code, detail.sr_no]);
    } catch (err) {
      console.error(`Error updating detail row ${index}:`, err.message);
      throw new Error(`Failed at update index ${index}`);
    }
  }
};

exports.handleDeleteFormData = catchAsync(async (req, res) => {
  console.log("Deleting sales order with order_id:", req.query.delete_type);
  try {
    const { order_id, it_code, sr_no } = req.body;

    if (!order_id || !it_code || !sr_no) {
      return res
        .status(400)
        .json({ message: "Missing order_id, item_code or sr_no" });
    }

    // Perform delete query
    const deleteQuery = `
        DELETE FROM mdsmordr
        WHERE order_id = $1 AND it_code = $2 AND sr_no = $3
      `;

    const result = await db.query(deleteQuery, [order_id, it_code, sr_no]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No item found to delete with given order_id, item_code and sr_no",
      });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
      deletedItemId: it_code,
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete item", error: error.message });
  }
});
