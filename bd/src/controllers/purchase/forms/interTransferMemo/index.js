const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../../utility/query");
const { dateFormater } = require("../../../../utility/constant");
const {
  transformTdmmmainDtlToDbData,
  transformThmmmainToDbData,
  transformTdmmmainBatchToDbData,
} = require("./presentation");

const TABLE_NAMES = {
  THMMMAIN: "thmmmain",
  TDMMMAIN: "tdmmmain",
  TDMMMAINBATCH: "tdmmmain_batch",
};

// for dropdown data

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const DeptList = await db.query(
    `select department, dept_cd from mhpmdept order by 1 `
  );

  return res.status(200).json({
    department: DeptList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;
  console.log("offset", req.query.offset);
  //console.log("search record........");

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["doc_no", "doc_date", "trans_code", "ok_rej", "trans_type"];

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
    let queryParameter = `ORDER BY doc_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(doc_id) FROM ${TABLE_NAMES.THMMMAIN} where trans_year = $1 and division_id = $2  ${queryValues}
                          `,
        [transYear, divisionId]
      );

      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter);

      console.log("offset", req.query.offset);
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(doc_id) FROM ${TABLE_NAMES.THMMMAIN} where trans_year = $1 and division_id = $2 
                      `,
            [transYear, divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY doc_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY doc_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const thmmmainData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.THMMMAIN} WHERE TRANS_YEAR = $1 AND DIVISION_ID = $2
     ${queryParameter}
  `,
      [transYear, divisionId]
    );
    console.log("thmmainData", thmmmainData.rows.length);
    console.log("Params:", [divisionId, transYear]);

    console.log(
      "Query:",
      `SELECT * FROM ${TABLE_NAMES.THMMMAIN} WHERE TRANS_YEAR = $1 AND DIVISION_ID = $2 ${queryParameter}`
    );
    console.log("Params:", [transYear, divisionId]);

    if (thmmmainData.rowCount == 0) {
      // throw new Error("No matching record found");
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        thmmmainData: [],
        recordCount: 0,
      });
    }

    // POST query

    const wcId = thmmmainData.rows[0].wc_id;
    const srsId = thmmmainData.rows[0].srs_id;
    const transCode = thmmmainData.rows[0].trans_code;
    const docId = thmmmainData.rows[0].doc_id;
    const okRej = thmmmainData.rows[0].ok_rej;

    console.log("srsId", srsId);

    // Format doc_date
    thmmmainData.rows[0].doc_date =
      thmmmainData.rowCount > 0
        ? dateFormater(thmmmainData.rows[0].doc_date)
        : "";

    // Fetch WC main data
    const wcData = await db.query(
      `SELECT wc_no, description FROM mommwc WHERE wc_id = $1`,
      [wcId]
    );

    thmmmainData.rows[0].wc_no =
      wcData.rowCount > 0 ? wcData.rows[0].wc_no : "";

    thmmmainData.rows[0].wc_description =
      wcData.rowCount > 0 ? wcData.rows[0].description : "";

    // Step 1: Get from_wc_id and to_wc_id from mommtrty using trans_code
    const transData = await db.query(
      `SELECT from_wc_id, to_wc_id, receive_issue_flag, prdn_dlvry_flag
   FROM mommtrty
   WHERE trans_code = $1`,
      [transCode]
    );

    // Extract from/to wc ids
    const fromWcId =
      transData.rowCount > 0 ? transData.rows[0].from_wc_id : null;
    const toWcId = transData.rowCount > 0 ? transData.rows[0].to_wc_id : null;

    // Add them to your main data if needed
    thmmmainData.rows[0].from_wc_id = fromWcId;
    thmmmainData.rows[0].to_wc_id = toWcId;

    // Fetch FROM_WC description
    if (fromWcId) {
      const wcFromData = await db.query(
        `SELECT description FROM mommwc WHERE wc_id = $1`,
        [fromWcId]
      );

      thmmmainData.rows[0].from_wc_desc =
        wcFromData.rowCount > 0 ? wcFromData.rows[0].description : "";

      console.log("From WC Description:", thmmmainData.rows[0].from_wc_desc);
    }

    // Fetch TO_WC description
    if (toWcId) {
      const wcToData = await db.query(
        `SELECT description FROM mommwc WHERE wc_id = $1`,
        [toWcId]
      );

      thmmmainData.rows[0].to_wc_desc =
        wcToData.rowCount > 0 ? wcToData.rows[0].description : "";

      console.log("To WC Description:", thmmmainData.rows[0].to_wc_desc);
    }

    // Fetch SRS number
    const srsData = await db.query(
      `SELECT srs_no FROM mhmmsrs WHERE srs_id = $1`,
      [srsId]
    );

    thmmmainData.rows[0].srs_no =
      srsData.rowCount > 0 ? srsData.rows[0].srs_no : "";

    // fetch cancel and authorisation flag

    thmmmainData.rows[0].cancel_memo =
      thmmmainData.rowCount > 0 ? thmmmainData.rows[0].cancel_memo : "";

    thmmmainData.rows[0].authorised =
      thmmmainData.rowCount > 0 ? thmmmainData.rows[0].authorised : "";

    // Flags from transData
    if (transData.rowCount > 0) {
      const transRow = transData.rows[0];

      thmmmainData.rows[0].receive_issue_flag = transRow.receive_issue_flag;
      thmmmainData.rows[0].prdn_dlvry_flag = transRow.prdn_dlvry_flag;

      // Determine mat_trans_type
      if (transRow.prdn_dlvry_flag === "Y") {
        thmmmainData.rows[0].mat_trans_type = "P";
      } else if (transRow.receive_issue_flag === "I") {
        thmmmainData.rows[0].mat_trans_type = "P";
      } else {
        thmmmainData.rows[0].mat_trans_type = "P"; // All default to 'P'
      }
    }

    // for tdmmmainData
    const tdmmmainData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDMMMAIN} WHERE doc_id = $1`,
      [docId]
    );

    // POST-QUERY DATA
    if (tdmmmainData.rows.length > 0) {
      await Promise.all(
        tdmmmainData.rows.map(async (item) => {
          if (item.it_code !== null) {
            const itemData = await db.query(
              `  Select it_name, um_code
    from mommitem where it_code = $1 `,
              [item.it_code]
            );

            item.it_name = itemData.rows[0]?.it_name || null;
            item.um_code = itemData.rows[0]?.um_code || null;
          }

          if (item.cost_centr !== null) {
            const costData = await db.query(
              ` 	select description, prefix
	from vwcostc
	where code = $1`,
              [item.cost_centr]
            );

            item.cost_desc = costData.rows[0]?.description || null;
            item.cc = costData.rows[0]?.prefix || null;
          }

          if (item.pur_code !== null) {
            const purData = await db.query(
              `  select description
  from mommcode
  where code = $1   `,
              [item.pur_code]
            );

            item.purpose = purData.rows[0]?.description || null;
          }

          if (item.it_code !== null) {
            const srsData = await db.query(
              `   select srs_qty from mdmmsrs
  where srs_id = $1
  and it_code = $2`,
              [srsId, item.it_code]
            );

            item.srs_qty = srsData.rows[0]?.srs_qty || null;
          }
          if (item.it_code !== null) {
            const catData = await db.query(
              ` select catalog_code
  from mosmprod
  where it_code = $1`,
              [item.it_code]
            );

            item.catalog_code = catData.rows[0]?.catalog_code || null;
          }

          if (item.it_code !== null && wcId !== null) {
            let parsedDocDate = thmmmainData.rows[0].doc_date;
            const fallbackResult = await db.query(
              `SELECT item_current_opening_bal(
          $1::smallint, 
          $2::varchar, 
          $3::date, 
          $4::varchar, 
          $5::varchar
        ) AS store_stock`,
              [wcId, item.it_code, parsedDocDate, appFinYear, okRej]
            );

            item.store_stock = fallbackResult.rows[0]?.store_stock || 0;
          }
        })
      );
    }

    // for tdmmmainBatchData
    const tdmmmainBatchData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDMMMAINBATCH} WHERE doc_id = $1`,
      [docId]
    );

    // POST-QUERY DATA
    if (tdmmmainBatchData.rows.length > 0) {
      await Promise.all(
        tdmmmainBatchData.rows.map(async (item) => {
          item.batch_date = dateFormater(item.batch_date || null);
          return item;
        })
      );
    }
    const responseData = {
      thmmmainData: thmmmainData.rows[0],
      tdmmmainData: tdmmmainData.rows,
      tdmmmainBatchData: tdmmmainBatchData.rows,
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
  const {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    wc_id,
    tr_type,
    ok_rej,
    trans_code,
    it_code,
    mat_trans_type,
    division_id,
  } = req?.query;
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  if (help_list === "wcno") {
    const userWc = await db.query(
      ` select a.description, a.wc_no, b.wc_id
from mommwc a, store b  
where b.user_id = $1
and a.wc_id = b.wc_id 
and a.division_id = $2
order by 1 `,
      [appUserId, appDivisionId]
    );

    return res.status(200).json(userWc.rows);
  } else if (help_list === "trans") {
    const transType = await db.query(
      `SELECT 
  c.description AS from_desc,
  d.description AS to_desc,
  a.trans_code,
  a.ok_rej,
  a.receive_issue_flag
FROM 
  mommtrty a
  JOIN mommwc c ON c.wc_id = a.from_wc_id
  JOIN mommwc d ON d.wc_id = a.to_wc_id
WHERE 
  (a.from_wc_id = $1 OR a.to_wc_id = $1)
 
  AND a.type = $2
  AND a.ok_rej = $3
  AND a.prdn_dlvry_flag = CASE 
                             WHEN $4 = 'P' THEN 'Y' 
                             ELSE 'N' 
                          END;
  
	`,
      [wc_id, tr_type, ok_rej, mat_trans_type]
    );

    //    AND EXISTS (
    //   SELECT 1
    //   FROM mommusrcat
    //   WHERE user_id = $2 AND trans_code = a.trans_code
    // )

    return res.status(200).json(transType.rows);
  } else if (help_list === "item") {
    //     const item = await db.query(
    //       ` SELECT
    //   a.it_name,
    //   a.it_code,
    //   a.um_code,
    //   s.catalog_code
    // FROM
    //   mommitem a
    // JOIN
    //   mommstok b ON a.it_code = b.it_code
    // JOIN
    //   mommusrcat c ON c.user_id = $1
    //               AND c.trans_code = $2
    // LEFT JOIN
    //   mosmprod s ON a.it_code = s.it_code
    // WHERE
    //   b.wc_id = $3
    //   AND b.trans_year = $4
    //   AND (
    //     COALESCE(c.it_type, '00') = '00' OR COALESCE(a.it_type, '00') = COALESCE(c.it_type, '00')
    //   )
    //   AND (
    //     COALESCE(c.it_base, '00') = '00' OR COALESCE(a.it_base, '00') = COALESCE(c.it_base, '00')
    //   )
    //   AND (
    //     COALESCE(c.it_sub_c, '00') = '00' OR COALESCE(a.it_sub_c, '00') = COALESCE(c.it_sub_c, '00')
    //   )
    //   AND a.active = 'Y'
    // ORDER BY
    //   a.it_code;`,
    //       [appUserId, trans_code, wc_id, appFinYear]
    //     );

    const item =
      await db.query(` SELECT it_code, it_name, hsn_sac_code FROM MOMMITEM I
              WHERE EXISTS
              (SELECT 1 FROM MOSMGST_STATE S
              WHERE S.HSN_SAC_CODE = I.HSN_SAC_CODE
              AND SAL_OR_ST = 'S')
              order by it_code`);
    return res.status(200).json(item.rows);
  } else if (help_list === "cost") {
    const cost = await db.query(`	  
					 select prefix,description, code from vwCostc order by 1    `);
    return res.status(200).json(cost.rows);
  } else if (help_list === "purp") {
    const purp = await db.query(
      `	  
				 select prefix,description, code
from mommcode
where cat_group = 'PURP' order by 1   `
    );
    return res.status(200).json(purp.rows);
  } else if (help_list === "srs") {
    const srs = await db.query(
      `select srs_no,srs_id,srs_dt  from mhmmsrs
order by srs_no   `
    );
    return res.status(200).json(srs.rows);
  } else if (help_list === "physical") {
    const physical = await db.query(
      `select physical_loc 
from mommstok s
where trans_year = $1
and exists
(select 1 from mommstok s1
  where trans_year = $1
   and it_code = $2
   and default_store = 'Y'
   and s1.wc_id = s.wc_id
   and s1.trans_year = s.trans_year)
and physical_loc is not null    `,
      [appFinYear, it_code]
    );
    return res.status(200).json(physical.rows);
  } else if (help_list === "batch") {
    const batch = await db.query(
      `select batch_no,batch_date,batch_qty,'O' ok_rej,mrir_no,mrir_date
		 from vwshowbatches v,mommwc m
		 where it_code= $1
           and m.wc_id=v.wc_id
		   and m.wc_id=$2
		   and m.division_id=$3
           order by 1`,
      [it_code, wc_id, appDivisionId]
    );
    return res.status(200).json(batch.rows);
  }
};


const getValidateItemData = async (req, res) => {
  let {
    it_code,
    wc_id,
    appFinYear,
    division_id,
    receive_issue_flag,
    ok_rej,
    doc_date,
    doc_id,
  } = req.query;
  if (doc_id === "" || doc_id === "undefined") {
    doc_id = null;
  }
  try {
    console.log(it_code, doc_id);
    // step 0: check duplicate item
    const { rowCount: itemCount } = await db.query(
      `SELECT * FROM tdmmmain WHERE doc_id = $1 AND it_code = $2`,
      [doc_id, it_code]
    );

    if (itemCount > 0) {
      return res.status(400).json({ error: `Item already exists` });
    }

    // Step 1: Check if item exists in the store
    const { rowCount: storeCount } = await db.query(
      `SELECT 1 FROM mommstok WHERE wc_id = $1 AND it_code = $2 AND trans_year = $3 LIMIT 1`,
      [wc_id, it_code, appFinYear]
    );

    if (storeCount === 0) {
      return res
        .status(400)
        .json({ error: `Item ${it_code} does not exist in store ${wc_id}` });
    }

    // Step 2: Fetch item details
    const itemResult = await db.query(
      `SELECT it_name, um_code, ass_cost AS rate, COALESCE(active, 'N') AS active,
              IT_FMP_PU, COALESCE(SPAR_PART, 'N') AS spar_part
       FROM mommitem
       WHERE it_code = $1
       LIMIT 1`,
      [it_code]
    );

    if (itemResult.rowCount === 0) {
      return res.status(400).json({ error: "Item not found" });
    }

    const itemData = itemResult.rows[0];

    if (itemData.active === "N") {
      return res
        .status(400)
        .json({ error: "Item is not Active", data: itemData });
    }

    // Step 3: Check user access to item
    const accessResult = await db.query(
      `SELECT *
       FROM mommitem a, mommstok b, mommusrcat c
       WHERE a.it_code = $1
         AND a.it_code = b.it_code
         AND b.wc_id = $2
         AND b.trans_year = $3
         AND COALESCE(a.it_type, '0') = CASE WHEN COALESCE(c.it_type, '0') = '00' THEN COALESCE(a.it_type, '0') ELSE COALESCE(c.it_type, '0') END
         AND COALESCE(a.it_base, '00') = CASE WHEN COALESCE(c.it_base, '0') = '00' THEN COALESCE(a.it_base, '0') ELSE COALESCE(c.it_base, '0') END
         AND COALESCE(a.it_sub_c, '00') = CASE WHEN COALESCE(c.it_sub_c, '0') = '00' THEN COALESCE(a.it_sub_c, '0') ELSE COALESCE(c.it_sub_c, '0') END
       LIMIT 1`,
      [it_code, wc_id, appFinYear]
    );

    if (accessResult.rowCount === 0) {
      return res.status(403).json({ error: "You cannot access this item." });
    }

    // Step 4: Fetch document number base parameter
    const paramResult = await db.query(
      `SELECT itmemo_no_base FROM mommparm LIMIT 1`
    );
    const cParam_it_base = paramResult.rows[0]?.itmemo_no_base;

    if (!cParam_it_base) {
      return res.status(400).json({
        error:
          "Define the Parameter for Document No. Generation. Contact ISD/EDP Department",
      });
    }

    // Step 5: Check last issue date
    if (
      cParam_it_base === "I" &&
      receive_issue_flag === "I" &&
      ok_rej === "O"
    ) {
      const dateResult = await db.query(
        `SELECT MAX(t.doc_date) AS last_issue_date
         FROM tommmain t
         JOIN mommtrty y ON t.trans_code = y.trans_code
         WHERE t.it_code = $1
           AND t.wc_id = $2
           AND t.trans_year = $3
           AND t.division_id = $4
           AND y.receive_issue_flag = 'I'`,
        [it_code, wc_id, appFinYear, division_id]
      );

      const lastIssueDate = dateResult.rows[0]?.last_issue_date;

      if (lastIssueDate) {
        const issue = new Date(lastIssueDate).setHours(0, 0, 0, 0);
        const input = new Date(doc_date).setHours(0, 0, 0, 0);

        if (issue > input) {
          const formattedDate = new Date(lastIssueDate)
            .toLocaleDateString("en-GB")
            .split("/")
            .join("-");
          return res
            .status(400)
            .json({
              error: `Last Issue date for this Item - [ ${formattedDate} ]`,
            });
        }
      }
    }

    // Step 6: Get store stock using ITEM_CURRENT_OPENING_BAL
    let parsedDocDate = doc_date === "" ? null : doc_date;
    const fallbackResult = await db.query(
      `SELECT item_current_opening_bal(
          $1::smallint, 
          $2::varchar, 
          $3::date, 
          $4::varchar, 
          $5::varchar
        ) AS store_stock`,
      [wc_id, it_code, parsedDocDate, appFinYear, ok_rej]
    );

    const store_stock = fallbackResult.rows[0]?.store_stock || 0;

    // Step 7: Fetch catalog_code
    const catalogResult = await db.query(
      `SELECT catalog_code FROM mosmprod WHERE it_code = $1 LIMIT 1`,
      [it_code]
    );

    const catalog_code = catalogResult.rows[0]?.catalog_code || null;

    // Final Response
    return res.status(200).json({
      message: "Validation successful",
      data: {
        ...itemData,
        store_stock,
        catalog_code,
      },
    });
  } catch (err) {
    console.error("Error in getValidateItemData:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getValidatePhysicalData = async (req, res) => {
  const { it_code, physical_loc, appFinYear } = req.query;

  const result = await db.query(
    `SELECT physical_loc
     FROM mommstok
     WHERE trans_year = $1 AND it_code = $2 AND physical_loc = $3
     LIMIT 1`,
    [appFinYear, it_code, physical_loc]
  );

  if (result.rowCount === 0) {
    return res
      .status(400)
      .json({
        error: "Invalid Physical location or not defined in this store",
      });
  }

  return res.status(200).json({
    message: "Physical location validation successful",
    data: result.rows[0],
  });
};

const getValidateQtyData = async (req, res) => {
  try {
    const {
      qty,
      store_stock,
      temp_qty = 0,
      receive_issue_flag,
      srs_no,
      it_code,
      mat_trans_type,
    } = req.query;

    // Parse numbers
    const parsedQty = parseFloat(qty);
    const parsedStock = parseFloat(store_stock || 0);
    const parsedTemp = parseFloat(temp_qty || 0);

    console.log(parsedQty, parsedStock, parsedTemp, receive_issue_flag);

    // Basic validation

    // if (parsedQty === 0 && !srs_no) {
    //   return res.status(400).json({ error: "Qty cannot be Zero" });
    // }

    //  Issue validation
    if (receive_issue_flag === "I" && parsedQty > parsedStock + parsedTemp) {
      return res
        .status(400)
        .json({ error: "Store Stock is less than issue qty" });
    }

    //  Receive validation
    if (
      receive_issue_flag === "R" &&
      !["5U", "KU"].includes(it_code.substring(0, 2))
    ) {
      // Fetch item details
      const itemResult = await db.query(
        `SELECT IT_FMP_PU, spar_part FROM mommitem WHERE it_code = $1 LIMIT 1`,
        [it_code]
      );
      const itemData = itemResult.rows[0] || {};
      const { it_fmp_pu: it_chk, spar_part } = itemData;

      if (it_chk === "P" && spar_part === "N") {
        const rctResult = await db.query(
          `SELECT COUNT(*) AS cnt FROM tdmmrct WHERE it_code = $1`,
          [it_code]
        );
        const chk = parseInt(rctResult.rows[0]?.cnt || 0);

        if (chk === 0) {
          return res.status(400).json({ error: "No RCT. as on date....." });
        }
      } else if (
        it_chk === "P" &&
        spar_part === "Y" &&
        mat_trans_type !== "R" &&
        parsedQty > parsedStock
      ) {
        return res
          .status(400)
          .json({ error: "Store Stock is less than issue qty" });
      }
    }

    //  Success response
    return res.status(200).json({
      message: "Quantity validation successful",
      data: { qty: parsedQty },
    });
  } catch (error) {
    console.error("Error validating qty:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getValidateBatchData = async (req, res) => {
  const {
    it_code,
    batch_no,
    wc_id,
    division_id,
    appFinYear,
    ok_rej,
    doc_date,
    batch_date,
    batch_qty,
    tot_batch_qty,
    qty,
    receive_issue_flag,
    srs_no,
  } = req.query;

  let batch_store_qty = 0;

  // 🔹 If batch number is provided
  if (batch_no) {
    // 1️⃣ MRIR number check
    const mrirResult = await db.query(
      `SELECT v.mrir_no
       FROM vwshowbatches v, mommwc m
       WHERE v.it_code = $1
         AND v.batch_no = $2
         AND m.wc_id = v.wc_id
         AND m.wc_id = $3
         AND m.division_id = $4`,
      [it_code, batch_no, wc_id, division_id]
    );

    if (mrirResult.rowCount > 1) {
      return res.status(400).json({
        error: "Multiple MRIR numbers exist. Please select from batch help.",
      });
    }

    // 2️⃣ FIFO batch check
    const batchControl = await db.query(
      `SELECT chk_it_batch_control($1) AS control`,
      [it_code]
    );
    if (batchControl.rows[0]?.control === "Y" && batch_date) {
      const fifoCheck = await db.query(
        `SELECT batch_no, batch_date 
         FROM check_fifo_batch($1, $2, $3, $4, $5, $6)`,
        [it_code, wc_id, batch_date, ok_rej, appFinYear, doc_date]
      );

      if (fifoCheck.rowCount > 0) {
        const fifo = fifoCheck.rows[0];
        return res.status(400).json({
          error: `Prior batch ${fifo.batch_no} - ${fifo.batch_date} exists`,
        });
      }
    }

    // 3️⃣ Default batch date check
    if (!batch_date) {
      try {
        const batchDateResult = await db.query(
          `SELECT a.batch_date
           FROM tommmain_batch a
           JOIN tommmain b ON a.it_code = b.it_code 
                          AND a.division_id = b.division_id 
                          AND a.trans_year = b.trans_year 
                          AND a.doc_no = b.doc_no 
                          AND a.trans_code = b.trans_code
           JOIN mommtrty t ON t.trans_code = a.trans_code
           WHERE a.it_code = $1
             AND a.trans_year = $2
             AND a.division_id = $3
             AND a.ok_rej = $4
             AND b.wc_id = $5
             AND a.batch_no = $6
             AND t.receive_issue_flag = 'R'
             AND item_current_opening_bal_batch($5, $1, CURRENT_DATE, $2, $4, $6) > 0`,
          [it_code, appFinYear, division_id, ok_rej, wc_id, batch_no]
        );

        if (batchDateResult.rowCount === 0) {
          return res
            .status(400)
            .json({ error: "Invalid Batch or no balance quantity" });
        }
      } catch (err) {
        return res.status(400).json({
          error: "Same batch with more than 1 date. Please select from list",
        });
      }
    }

    // 4️⃣ Final batch store stock
    const storeQtyResult = await db.query(
      `SELECT item_current_opening_bal_batch($1, $2, $3, $4, $5, $6) AS batch_store_qty`,
      [wc_id, it_code, doc_date, appFinYear, ok_rej, batch_no]
    );

    batch_store_qty = storeQtyResult.rows[0]?.batch_store_qty || 0;
  } else {
    // 🔹 If batch control required but no batch no
    const controlCheck = await db.query(
      `SELECT get_item_batch_control_flag($1) AS control_flag`,
      [it_code]
    );
    if (controlCheck.rows[0]?.control_flag === "Y") {
      return res.status(400).json({ error: "Batch No must for this item" });
    }
  }

  // 🔹 Batch quantity validations
  if (batch_qty !== undefined && batch_qty !== null) {
    if (batch_qty < 0) {
      return res.status(400).json({ error: "Qty cannot be negative" });
    }

    if (batch_qty === 0 && !srs_no) {
      return res.status(400).json({ error: "Qty cannot be Zero" });
    }

    if (receive_issue_flag === "I") {
      if (batch_qty > batch_store_qty) {
        return res
          .status(400)
          .json({ error: "Batch Store Stock is less than batch issue qty" });
      }
    }

    const totBatchQty = tot_batch_qty ?? 0;
    const itemQty = qty ?? 0;

    if (totBatchQty > itemQty) {
      return res
        .status(400)
        .json({ error: "Batch Qty Cannot be greater than Item Qty" });
    }
  }

  // ✅ Success
  return res.status(200).json({
    message: "Batch validation successful",
    data: { batch_store_qty },
  });
};

const getValidateBatchQtyData = async (req, res) => {
  const { batch_qty, tot_batch_qty, qty, receive_issue_flag } = req.query;

  let batch_store_qty = req.query.batch_store_qty ?? 0;

  // Batch quantity validations
  if (batch_qty !== undefined && batch_qty !== null) {
    if (receive_issue_flag === "I") {
      if (batch_qty > batch_store_qty) {
        return res
          .status(400)
          .json({ error: "Batch Store Stock is less than batch issue qty" });
      }
    }

    const totBatchQty = tot_batch_qty ?? 0;
    const itemQty = qty ?? 0;

    if (totBatchQty > itemQty) {
      return res
        .status(400)
        .json({ error: "Batch Qty Cannot be greater than Item Qty" });
    }
  }

  //  Success
  return res.status(200).json({
    message: "Batch validation successful",
  });
};

const postInterTransferDetails = async (req, res) => {
  try {
    await db.query("BEGIN");

    const { formData, formDetailData, transYear, divisionId, formStatus } =
      req.body;

    // STEP 1: Detail validation
    if (!Array.isArray(formDetailData) || formDetailData.length === 0) {
      throw new Error("No detail entries provided.");
    }

    // STEP 2: Determine docDate
    const docDate = formData.doc_date
      ? new Date(formData.doc_date)
      : new Date();

    // STEP 3: Validate financial year range
    const finYearCheck = await db.query(
      `SELECT 1 FROM moitfinyear 
       WHERE year_code = $1 
         AND $2::date BETWEEN st_date AND end_date`,
      [transYear, docDate]
    );

    if (finYearCheck.rowCount === 0) {
      throw new Error("Document date does not fall within financial year.");
    }

    // STEP 4: Get doc name prefix from mommtrty.type_desc (first 3 chars)
    const docTypeMap = {
      SRS: "SRS",
      PDS: "PDS",
      SRV: "SRV",
      STN: "STN",
      D3R: "D3R",
      STO: "STO",
    };

    let cDesc = null;
    let cDoc_name = null;
    try {
      const descResult = await db.query(
        `SELECT SUBSTR(type_desc, 1, 3) AS type_desc FROM mommtrty WHERE trans_code = $1`,
        [formData.trans_code]
      );
      cDesc = descResult.rows[0]?.type_desc;
    } catch (error) {
      console.error("Error fetching type_desc from mommtrty:", error);
    }

    cDoc_name = docTypeMap[cDesc] || cDesc;

    // STEP 5: Generate new doc_id
    const docIdResult = await db.query(`SELECT nextval('Seq_thmmmain_doc_id')`);
    const docId = docIdResult.rows[0].nextval;

    // STEP 6: Generate document number
    const docNoResult = await db.query(
      `SELECT GenItmemoNo($1, $2, $3, $4, $5)`,
      [formData.wc_id, transYear, divisionId, formData.trans_code, cDoc_name]
    );
    const docNo = docNoResult.rows[0]?.genitmemono;
    if (!docNo) {
      throw new Error("Failed to generate document number from GenItmemoNo()");
    }

    // STEP 7: Check authorisation requirement
    const authResult = await db.query(
      `SELECT COALESCE(authorised_req, 'N') AS authorised_req FROM mommtrty WHERE trans_code = $1`,
      [formData.trans_code]
    );
    const cAuthorise = authResult.rows[0]?.authorised_req;

    if (cAuthorise === "Y") {
      await db.query("ROLLBACK");
      return res
        .status(200)
        .json({ message: "Authorisation is required for this transaction." });
    }

    // STEP 8: Insert into THMMMAIN header table
    const thmmData = transformThmmmainToDbData(
      {
        ...formData,
        doc_id: docId,
        doc_no: docNo,
        trans_year: transYear,
        division_id: divisionId,
        doc_date: docDate,
      },
      req.user
    );

    const insertThmmQuery = generateSingleInsertQuery(
      TABLE_NAMES.THMMMAIN,
      thmmData
    );
    const thmmResult = await db.query(insertThmmQuery, Object.values(thmmData));
    if (thmmResult.rowCount === 0) {
      throw new Error("Failed to insert header data (thmmmain).");
    }

    // STEP 9: Insert detail rows into TDMMMAIN
    const wcId = formData.wc_id;
    for (const detailRow of formDetailData) {
      if (detailRow.qty > 0) {
        const tdmmData = transformTdmmmainDtlToDbData({
          ...detailRow,
          doc_id: docId,
          wc_id: wcId,
        });

        console.log(
          "Inserting detail row with doc_id:",
          tdmmData.doc_id,
          tdmmData
        );

        const detailInsertQuery = generateSingleInsertQuery(
          TABLE_NAMES.TDMMMAIN,
          tdmmData
        );
        await db.query(detailInsertQuery, Object.values(tdmmData));
      }
    }

    // Step 1: Get from_wc_id and to_wc_id from mommtrty using trans_code
    const transData = await db.query(
      `SELECT from_wc_id, to_wc_id, receive_issue_flag
   FROM mommtrty
   WHERE trans_code = $1`,
      [formData.trans_code]
    );

    const to_wc_id = transData.rows[0]?.to_wc_id;
    const from_wc_id = transData.rows[0]?.from_wc_id;
    const receive_issue_flag = transData.rows[0]?.receive_issue_flag;

    console.log({
      receive_issue_flag,
      ok_rej: formData.ok_rej,
      docNo,
      docDate,
      to_wc_id,
      from_wc_id,
      divisionId,
      transYear,
      trans_code: formData.trans_code,

      formStatus,
    });

    // STEP 10: Call ProcGenerateContraEntry
    const params = [
      (receive_issue_flag || "").toString().charAt(0),
      (formData.ok_rej || "").toString().charAt(0),
      docNo.toString(),
      docDate instanceof Date ? docDate : new Date(docDate),
      Number(to_wc_id),
      Number(from_wc_id),
      Number(divisionId),
      transYear.toString(), // Pass transYear as string
      Number(formData.trans_code),
    ];

    await db.query(
      `CALL proc_generate_contra_entry(
    $1::char,
    $2::char,
    $3::varchar,
    $4::date,
    $5::integer,
    $6::integer,
    $7::integer,
    $8::varchar,
    $9::integer
   
  )`,
      params
    );

    // STEP 11: Call Update_tommmain for the contra doc_id

    await db.query(
      `call update_tommmain_it_memo($1::bigint, $2::integer, $3::varchar, $4::varchar, $5::integer)`,
      [
        docId, // If you have the contra doc_id, use that instead
        divisionId,
        transYear,
        formData.doc_no,
        formData.trans_code,
      ]
    );

    // STEP 12: Commit transaction
    await db.query("COMMIT");

    // STEP 13: Send success response
    const successMsg = "Data saved successfully";

    return res.status(200).json({ message: successMsg, doc_id: docId });
  } catch (error) {
    console.error("Error in postInterTransferDetails:", error.message);
    await db.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  }
};

const updateInterTransferDetails = async (req, res) => {
  const {
    formData,
    formDetailData,
    deletedFormDtlData,
    appUserId,
    transYear,
    divisionId,
  } = req.body;

  // Get wcId early and freeze it before any usage
  const wcId = formData?.wc_id ?? null;
  console.log("Initial wcId:", wcId);

  console.log("formDetailData", formDetailData);

  const matType = formData.mat_trans_type;
  console.log("mattype", matType);

  //  Function to check user/store mapping
  const checkUserStore = async (appUserId, wcId) => {
    try {
      const result = await db.query(
        `SELECT 'x' FROM store WHERE user_id = $1 AND wc_id = $2`,
        [appUserId, wcId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking user/store mapping:", error);
      return false;
    }
  };

  // Usage
  const hasAccess = await checkUserStore(appUserId, wcId);

  //
  if (formData.trans_type === "R") {
    try {
      // Get store_process for from_wc_id
      const storeFromResult = await db.query(
        `SELECT store_process FROM mommwc WHERE wc_id = $1`,
        [formData.from_wc_id]
      );
      const storeProcessFrom = storeFromResult.rows[0]?.store_process;

      // Get store_process for to_wc_id
      const storeToResult = await db.query(
        `SELECT store_process FROM mommwc WHERE wc_id = $1`,
        [formData.to_wc_id]
      );
      const storeProcessTo = storeToResult.rows[0]?.store_process;

      // If both are 'S', throw an error (like PL/SQL FuncCheck_StoreType = TRUE)
      if (storeProcessFrom === "S" && storeProcessTo === "S") {
        return res.status(400).json({
          type: "error",
          message:
            "This Receipt transaction cannot be modified.\nThe material received from other WareHouse",
        });
      }
    } catch (error) {
      console.error("Error in checking store_process:", error);
      return res.status(500).json({
        type: "error",
        message: "Internal server error while checking store types.",
      });
    }
  }

  const doc_id = formData?.doc_id;

  delete formData.wc_no;
  delete formData.wc_id;
  delete formData.wc_description;
  delete formData.from_wc_desc;
  delete formData.to_wc_desc;
  delete formData.from_wc_id;
  delete formData.to_wc_id;
  delete formData.receive_issue_flag;
  delete formData.prdn_dlvry_flag;
  delete formData.tr_type;

  try {
    await db.query("BEGIN");

    // ## UPDATE THMMMAIN (Header) DATA
    if (Object.keys(formData).length && doc_id) {
      const columns = Object.keys(formData);
      const values = Object.values(formData);
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");
      const query = `UPDATE ${
        TABLE_NAMES.THMMMAIN
      } SET ${setClause} WHERE doc_id = $${columns.length + 1}`;
      await db.query(query, [...values, doc_id]);
    }

    // ## DELETE TDMMMAIN DETAIL RECORDS
    if (Array.isArray(deletedFormDtlData) && deletedFormDtlData.length > 0) {
      console.log("deletedFormDtlData:", deletedFormDtlData);

      // Extract only init_it_code values from the array of objects
      const deleteCodes = deletedFormDtlData.map((item) => item.init_it_code);

      // Create placeholders for IN clause
      const deleteIds = deleteCodes.map((_, i) => `$${i + 1}`).join(",");
      const docIdPlaceholder = `$${deleteCodes.length + 1}`;

      const deleteQuery = `
    DELETE FROM ${TABLE_NAMES.TDMMMAIN}
    WHERE doc_id = ${docIdPlaceholder}
      AND it_code IN (${deleteIds})
  `;

      console.log("Delete Query:", deleteQuery);
      console.log("Query Values:", [...deleteCodes, doc_id]);

      await db.query(deleteQuery, [...deleteCodes, doc_id]);
    }

    // for update logic

    // Cleanup function
    function cleanTdmmmainRecord(record) {
      const keysToDelete = [
        "id",
        "it_name",
        "cost_desc",
        "cc",
        "purpose",
        "srs_qty",
        "catalog_code",
        "store_stock",
        "physical_loc",
      ];

      const cleaned = { ...record };
      for (const key of keysToDelete) {
        delete cleaned[key];
      }
      return cleaned;
    }

    // --- Main save logic ---
    for (const entry of formDetailData || []) {
      const cleaned = cleanTdmmmainRecord(entry);

      // Normalize numeric fields to null if empty string
      const numericFields = [
        "rate",
        "rr_acptqty",
        "qty",
        "mav_rate",
        "srs_qty",
        "cost_centr",
        "pur_code",
      ];
      for (const field of numericFields) {
        if (cleaned[field] === "") {
          cleaned[field] = null;
        }
      }

      if (cleaned.doc_id && `${cleaned.doc_id}`.trim() !== "") {
        // --- UPDATE ---
        const init_it_code = cleaned.init_it_code;
        const entryDocId = cleaned.doc_id;

        if (!init_it_code || !entryDocId) {
          console.warn(
            "Skipping update: missing init_it_code or doc_id",
            entry
          );
          continue;
        }

        delete cleaned.init_it_code;
        delete cleaned.doc_id;

        cleaned.update_id = appUserId;
        cleaned.update_date = new Date();

        const cols = Object.keys(cleaned);
        if (!cols.length) continue;

        const vals = Object.values(cleaned);
        const setClause = cols.map((col, i) => `${col} = $${i + 1}`).join(", ");

        const updateQuery = `
      UPDATE ${TABLE_NAMES.TDMMMAIN}
      SET ${setClause}
      WHERE it_code = $${cols.length + 1}
        AND doc_id = $${cols.length + 2}
    `;

        console.log("Update Query:", updateQuery.trim());
        console.log("Update Values:", [...vals, init_it_code, entryDocId]);
        await db.query(updateQuery, [...vals, init_it_code, entryDocId]);
      } else {
        // --- INSERT ---
        delete cleaned.init_it_code;

        cleaned.doc_id = doc_id; // from formData

        cleaned.wc_id = wcId;

        console.log("Insert record wc_id:", cleaned.wc_id);

        if (!cleaned.wc_id) {
          console.warn("Skipping insert: missing wc_id", entry);
          continue;
        }

        if (!cleaned.it_code) {
          console.warn("Skipping insert: missing it_code", entry);
          continue;
        }

        const insertQuery = generateSingleInsertQuery(
          TABLE_NAMES.TDMMMAIN,
          cleaned
        );

        console.log("Insert Query:", insertQuery.trim());
        console.log("Insert Values:", Object.values(cleaned));
        await db.query(insertQuery, Object.values(cleaned));
      }
    }

    // Step 0: Get transaction details from mommtrty
    const transData = await db.query(
      `SELECT from_wc_id, to_wc_id, receive_issue_flag, coalesce(AUTHORISED_REQ,'N') AS authorised_req
   FROM mommtrty
   WHERE trans_code = $1`,
      [formData.trans_code]
    );

    const transRow = transData.rows[0];
    const to_wc_id = transRow.to_wc_id;
    const from_wc_id = transRow.from_wc_id;
    const receive_issue_flag = transRow.receive_issue_flag;
    const authorised_req = transRow.authorised_req; // 'Y' or 'N'

    console.log({
      receive_issue_flag,
      ok_rej: formData.ok_rej,
      doc_no: formData.doc_no,
      doc_date: formData.doc_date,
      to_wc_id,
      from_wc_id,
      divisionId,
      transYear,
      trans_code: formData.trans_code,
      authorised_req,
    });

    // --- Step 1: Authorization check ---
    if (authorised_req === "Y") {
      // Authorization required
      if (formData.authorised === "N") {
        throw new Error("Authorisation is Required for this Transaction.");
      }
      // Already authorised? proceed to contra entry
    }

    // If authorised_req is 'N', or already authorised, continue to Step 2
    // Step 2: Call proc_generate_contra_entry
    const params = [
      receive_issue_flag.toString().charAt(0), // char
      formData.ok_rej.toString().charAt(0), // char
      formData.doc_no.toString(), // varchar
      formData.doc_date instanceof Date
        ? formData.doc_date
        : new Date(formData.doc_date), // date
      Number(to_wc_id), // integer
      Number(from_wc_id), // integer
      Number(divisionId), // integer
      transYear.toString(), // varchar
      Number(formData.trans_code), // integer
    ];

    await db.query(
      `CALL proc_generate_contra_entry(
    $1::char,
    $2::char,
    $3::varchar,
    $4::date,
    $5::integer,
    $6::integer,
    $7::integer,
    $8::varchar,
    $9::integer
  )`,
      params
    );

    // Step 3: Call update_tommmain_single for the contra doc
    await db.query(
      `call update_tommmain_it_memo(
    $1::bigint,
    $2::integer,
    $3::varchar,
    $4::varchar,
    $5::integer
  )`,
      [
        formData.doc_id, // use doc_id from formData
        divisionId,
        transYear,
        formData.doc_no,
        formData.trans_code,
      ]
    );

    await db.query("COMMIT");

    res.status(200).json({
      type: "success",
      message: "Record successfully saved",
    });
  } catch (error) {
    console.error("Update failed:", error);
    await db.query("ROLLBACK");
    res.status(400).json({
      type: "error",
      message: error.message || "Internal server error",
    });
  }
};

// for authorise

exports.authorisedInterTransferMemo = catchAsync(async (req, res, next) => {
  const {
    trans_code,
    authorised,
    doc_no,
    doc_id,
    doc_date,
    division_id,
    trans_year,
    ok_rej,
  } = req.body.formData;

  try {
    // Start transaction
    await db.query("BEGIN");

    // Step 1: Check if authorization is required
    const authCheck = await db.query(
      `SELECT COALESCE(authorised_req, 'N') AS authorised_req 
       FROM mommtrty 
       WHERE trans_code = $1`,
      [trans_code]
    );

    const cAUTHORISED_REQ = authCheck.rows[0]?.authorised_req || "N";

    if (cAUTHORISED_REQ === "N") {
      throw new Error("Authorisation Not Required");
    }

    if (cAUTHORISED_REQ === "Y" && authorised === "N") {
      // Step 2: Update authorised flag in thmmmain
      await db.query(
        `UPDATE thmmmain
         SET authorised = 'Y', disp_flag = 'Authorised'
         WHERE doc_no = $1`,
        [doc_no]
      );

      // Step 3: Get from_wc_id, to_wc_id, receive_issue_flag for this trans_code
      const transData = await db.query(
        `SELECT from_wc_id, to_wc_id, receive_issue_flag
         FROM mommtrty
         WHERE trans_code = $1`,
        [trans_code]
      );

      const to_wc_id = transData.rows[0]?.to_wc_id;
      const from_wc_id = transData.rows[0]?.from_wc_id;
      const receive_issue_flag = transData.rows[0]?.receive_issue_flag;

      // Step 4: Call proc_generate_contra_entry
      const params = [
        (receive_issue_flag || "").toString().charAt(0), // char
        (ok_rej || "").toString().charAt(0), // char
        doc_no.toString(), // varchar
        doc_date instanceof Date ? doc_date : new Date(doc_date), // date
        Number(to_wc_id), // integer
        Number(from_wc_id), // integer
        Number(division_id), // integer
        trans_year.toString(), // varchar
        Number(trans_code), // integer
      ];

      await db.query(
        `CALL proc_generate_contra_entry(
          $1::char,
          $2::char,
          $3::varchar,
          $4::date,
          $5::integer,
          $6::integer,
          $7::integer,
          $8::varchar,
          $9::integer,
          
        )`,
        params
      );

      // Step 5: Call update_tommmain_single for the original doc_id
      await db.query(
        `SELECT update_tommmain_it_memo($1::bigint, $2::integer, $3::varchar, $4::varchar, $5::integer)`,
        [doc_id, division_id, trans_year, doc_no, trans_code]
      );
    } else if (authorised === "Y") {
      throw new Error("Cannot Unauthorise");
    }

    // Step 6: Commit transaction
    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Authorised successfully.",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Authorization error:", error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Something went wrong.",
    });
  }
});

// for cancellation
exports.cancelInterTransferMemo = catchAsync(async (req, res, next) => {
  const {
    division_id,
    trans_year,
    doc_no,
    trans_code,
    ok_rej,
    wc_id,
    doc_id,
    cancel_memo,
    authorised,
  } = req.body.memoData;

  const appUserId = req.body.appUserId;

  if (!appUserId) {
    return res
      .status(401)
      .json({ type: "error", message: "Unauthorized: User ID not found" });
  }

  console.log("appUserId", appUserId);

  try {
    // --- STEP 1: Cancelled check ---
    if (cancel_memo === "Y") {
      return res.status(400).json({
        type: "error",
        message: "This Inter Transfer Memo has already been cancelled",
      });
    }

    // --- STEP 2: Authorised check ---
    if (authorised === "Y") {
      return res.status(400).json({
        type: "error",
        message: "You cannot cancel an Authorised Inter Transfer Memo",
      });
    }

    // --- STEP 3: UserStoreCheck ---
    const storeCheck = await db.query(
      `SELECT 1 FROM store WHERE user_id = $1 AND wc_id = $2`,
      [appUserId, wc_id]
    );
    if (storeCheck.rowCount === 0) {
      return res.status(403).json({
        type: "error",
        message: "You do not have permission to cancel this memo.",
      });
    }

    // --- STEP 4: Begin transaction ---
    await db.query("BEGIN");

    // --- STEP 5: Call delete_tommmain ---
    await db.query(`SELECT delete_tommmain($1, $2, $3, $4, $5);`, [
      division_id,
      trans_year,
      doc_no,
      trans_code,
      ok_rej,
    ]);

    await db.query(
      `UPDATE ${TABLE_NAMES.THMMMAIN}
   SET cancel_memo = 'Y'
   WHERE division_id = $1
     AND trans_year = $2
     AND doc_no = $3`,
      [division_id, trans_year, doc_no]
    );

    // // --- STEP 7: Delete from TDMMMAIN ---
    // await db.query(`DELETE FROM ${TABLE_NAMES.TDMMMAIN} WHERE doc_id = $1`, [doc_id]);

    // --- STEP 8: Commit ---
    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Inter Transfer Memo cancelled successfully.",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Cancel memo error:", error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Something went wrong while cancelling memo.",
    });
  }
});

// for check date in finyear
exports.checkDateInFinyear = catchAsync(async (req, res) => {
  let { doc_date } = req.body.memoData;
  const { appFinYear } = req.body;

  try {
    const result = await db.query(
      `SELECT checkdateinfinyear($1, $2)as is_valid`,
      [appFinYear, doc_date]
    );
    

    if (result.rows[0]?.is_valid !== 'Y') {
      return res.status(400).json({
        type: "error",
        message: "Date not falling within the financial year",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Date is within the financial year",
    });
  } catch (error) {
    console.error("checkDateInFinyear error:", error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Something went wrong while checking date.",
    });
  }
});


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  // await getDataOnQuery(req, res);
  // return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.handleValidateData = catchAsync(async (req, res, next) => {
  const { param } = req.query;
  if (param === "it_code") {
    await getValidateItemData(req, res);
    return;
  }

  if (param === "physical_loc") {
    await getValidatePhysicalData(req, res);
  }

  if (param === "qty") {
    await getValidateQtyData(req, res);
  }

  if (param === "batch_no") {
    await getValidateBatchData(req, res);
  }

  if (param === "batch_qty") {
    await getValidateBatchQtyData(req, res);
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateInterTransferDetails(req, res);
    return;
  } else {
    await postInterTransferDetails(req, res);
    return;
  }
});
