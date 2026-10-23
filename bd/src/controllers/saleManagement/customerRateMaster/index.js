const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../utility/query");
const { transformCustomerRateMstrData } = require("./presentation");




const TABLE_NAMES = {

  PRICE_LIST: "MOSMPCUS",

};


const getCustomerRateMstrDataOnQuery = async (req, res) => {
  try {

    const { it_code ,c_code} = req.query;

    let conditions = [];
    let values = [];

    //  Dynamic filters (PRICE_LIST pe lag rahe hain)
    if (it_code) {
      values.push(it_code);
      conditions.push(`pl.it_code = $${values.length}`);
    }
    if (c_code) {
      values.push(c_code);
      conditions.push(`pl.c_code = $${values.length}`);
    }

    // WHERE build
    let whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    //  MAIN QUERY (PRICE_LIST se data uthaya)
    const getData = await db.query(`
      SELECT 
        pl.*,
        itm.it_name AS it_desc,
        cus.c_name,
        COUNT(*) OVER() AS total_count
      FROM ${TABLE_NAMES.PRICE_LIST} pl
      LEFT JOIN mommitem itm 
        ON pl.it_code = itm.it_code
      LEFT JOIN mosmcust cus 
        ON pl.c_code = cus.c_code
      ${whereClause}
      ORDER BY pl.c_code, pl.it_code
    `, values);

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        rateMaster: getData.rows,   
        totalCount: getData.rows[0].total_count,
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        rateMaster: [],
        totalCount: 0,
        message: "No data found",
      });
    }

  } catch (error) {
    console.error("Query Error:", error);
    return res.status(500).json({
      message: "Internal server error on Query",
    });
  }
};


// For HelpList
const helpListData = async (req, res) => {
  const { form_status, help_list } = req?.query;

  // Valid form_status check
  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).json([]);
  }

  try {

    //  CUSTOMER HELP LIST
    if (help_list === "Customer") {

      let customerList;

      if (form_status === "Search") {
        customerList = await db.query(
          `SELECT  Distinct
          mos.c_code , 
          vw.c_name
           FROM MOSMPCUS  mos
           left join vwcustactive vw
           on mos.c_code = vw.c_code
           ORDER BY c_name`
        );
      } else {
        customerList = await db.query(
          `SELECT c_code, c_name 
           FROM vwcustactive 
           ORDER BY c_name`
        );
      }

      return res.status(200).json(customerList.rows);
    }

    //  ITEM HELP LIST
    else if (help_list === "item") {

      let itemList;

      if (form_status === "Search") {
        itemList = await db.query(`
          SELECT DISTINCT 
            cus.it_code,
            mos.it_desc
          FROM MOSMPCUS cus
          LEFT JOIN mosmprod mos
            ON cus.it_code = mos.it_code
          ORDER BY mos.it_desc
        `);
      } else {
        itemList = await db.query(`
          SELECT it_code, it_desc 
          FROM mosmprod 
          ORDER BY it_desc
        `);
      }

      return res.status(200).json(itemList.rows);
    }

    //  fallback
    return res.status(200).json([]);

  } catch (error) {
    console.error("HelpList Error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getCustomerRateMstrDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});



exports.handleSubmitData = catchAsync(async (req, res) => {
  const payload = req.body;

  try {
    await db.query("BEGIN");

    const formData = payload.inserted || [];

    if (formData.length === 0) {
      return res.status(400).json({
        type: "error",
        message: "No records received for insert"
      });
    }

    for (const row of formData) {

      
      if (!row.it_code || !row. c_code || !row.cus_it_code) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          type: "error",
          message: "Item Code and Customer Code and Customer Item Code are required"
        });
      }

      //  duplicate check
      const exists = await db.query(
        `SELECT 1 FROM MOSMPCUS 
         WHERE c_code = $1 AND it_code=$2 AND cus_it_code=$3`,
        [row.c_code,  row.it_code, row.cus_it_code]
      );

      if (exists.rows.length > 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          type: "error",
          message: `Duplicate combination found for Customer ${row.c_code} & Item ${row.it_code} & Customer Item Code ${row.cus_it_code} `
        });
      }

      const rateMstr = transformCustomerRateMstrData(row);

      const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.PRICE_LIST,
        rateMstr
      );

      const valuesForInsertQuery = Object.values(rateMstr);

      await db.query(queryForInsert, valuesForInsertQuery);
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Records inserted successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});


exports.updateRatemstr = catchAsync(async (req, res) => {
  const { inserted = [], updated = [], deleted = [] } = req.body;

  try {
    await db.query("BEGIN");

    //  STEP 1: DELETE
    for (const row of deleted) {
      await db.query(
        `DELETE FROM MOSMPCUS 
         WHERE c_code = $1 
         AND it_code = $2
          AND cus_it_code = $3`,
        [row.c_code, row.it_code, row.cus_it_code]
      );
    }

    //  STEP 2: UPDATE
    for (const row of updated) {
      const detailData = transformCustomerRateMstrData(row);

      //  duplicate check (only if key changed)
      if (
        row.old_it_code !== row.it_code ||
        row.old_c_code !== row.c_code ||
        row.old_cus_it_code !== row.cus_it_code 

      ) {
        const check = await db.query(
          `SELECT 1 FROM MOSMPCUS 
           WHERE c_code = $1 AND it_code = $2 AND cus_it_code = $3`,
          [row.c_code, row.it_code, row.cus_it_code]
        );

        if (check.rowCount > 0) {
          throw new Error(`Same Customer Code + Item Code + Customer Item Code combination already exists`);
        }
      }

      const columns = Object.keys(detailData);
      const values = [];
      let idx = 1;

      const setClause = columns
        .map((col) => {
          values.push(detailData[col]);
          return `${col} = $${idx++}`;
        })
        .join(", ");

      //  WHERE old combo pe
      values.push(row.old_it_code || row.it_code);
      values.push(row.old_c_code || row.c_code);
      values.push(row.old_cus_it_code || row.cus_it_code);

      const itCodeIndex = idx++;
      const cCodeIndex = idx++;      
      const cusItCodeIndex = idx++;
  

      const result = await db.query(
        `UPDATE MOSMPCUS
         SET ${setClause}
         WHERE it_code = $${itCodeIndex}
         AND c_code = $${cCodeIndex}
         AND cus_it_code = $${cusItCodeIndex}`,
        values
      );

      console.log("rows updated:", result.rowCount);
    }

    //  STEP 3: INSERT
    for (const row of inserted) {
      if (!row.it_code || !row.c_code || !row.cus_it_code) continue;

      const check = await db.query(
        `SELECT 1 FROM MOSMPCUS 
         WHERE it_code = $1 AND c_code = $2 AND cus_it_code = $3`,
        [row.it_code, row.c_code, row.cus_it_code]
      );

      if (check.rowCount > 0) {
        throw new Error(
          `Same Customer Code + Item Code + Customer Item Code combination already exists`
        );
      }

      const rateMstr = transformCustomerRateMstrData(row);

      const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.PRICE_LIST,
        rateMstr
      );

      const valuesForInsertQuery = Object.values(rateMstr);

      await db.query(queryForInsert, valuesForInsertQuery);
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Rate Master Updated Successfully",
    });

  } catch (error) {
    console.error("Update Error:", error);

    await db.query("ROLLBACK");

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

exports.checkDuplicate = catchAsync(async (req, res) => {
  try {
    const { it_code, c_code, cus_it_code } = req.body;

    const query = `
      SELECT 1 
      FROM MOSMPCUS
      WHERE it_code = $1 
      AND c_code = $2
      AND cus_it_code = $3
      LIMIT 1
    `;

    const result = await db.query(query, [it_code, c_code, cus_it_code]);

    if (result.rows.length > 0) {
      return res.json({
        type: "error",
        message: "Same Item Code + Customer Code + Customer Item Code combination already exists "
      });
    }

    return res.json({
      type: "success",
      message: "No duplicate"
    });

  } catch (err) {
    return res.status(500).json({
      type: "error",
      message: err.message
    });
  }
});