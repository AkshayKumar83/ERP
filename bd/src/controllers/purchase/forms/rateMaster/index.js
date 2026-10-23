
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transMdmmvendToDbData } = require("./presentation");



const TABLE_NAMES = {

  HDR_TABLE: "MDMMVEND",

};


// const getRateMstrDataOnQuery = async (req, res) => {
//   try {

//       const { it_code } = req.query;

//     let conditions = [];
//     let values = [];

//     //  Dynamic filters
//     if (it_code) {
//       values.push(it_code);
//       conditions.push(`hdr.it_code = $${values.length}`);
//     }

  

//     //  WHERE build
//     let whereClause = conditions.length > 0 
//       ? `WHERE ${conditions.join(" AND ")}`
//       : "";



//      const getData = await db.query(`
//       SELECT 
//         hdr.*,
//         itm.it_name,
//         ven.v_name,
//         COUNT(*) OVER() AS total_count
//       FROM ${TABLE_NAMES.HDR_TABLE} hdr
//       LEFT JOIN mommitem itm 
//         ON hdr.it_code = itm.it_code
//       LEFT JOIN mommvend ven 
//         ON hdr.v_code = ven.v_code
//           ${whereClause}
//         order by hdr.rate_eff_dt
//      `, values);
 
//      if (getData.rowCount > 0) {
//        return res.status(200).json({
//          type: "found",
//          rateMaster: getData.rows,
//          totalCount: getData.rows[0].total_count, 
//        });
//      } else {
//        return res.status(200).json({
//          type: "not_found",
//          rateMaster: [],
//          totalCount: 0,
//          message: "No data found",
//        });
//      }

//   } catch (error) {
//     console.error("Query Error:", error);
//     return res.status(500).json({
//       message: "Internal server error on Query",
//     });
//   }
// };



// For HelpList

const getRateMstrDataOnQuery = async (req, res) => {
  try {
    const { it_code, limit = 20, offset = 0 } = req.query;

    let conditions = [];
    let values = [];

    // Dynamic filters
    if (it_code) {
      values.push(it_code);
      conditions.push(`hdr.it_code = $${values.length}`);
    }

    let whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // Add limit and offset AFTER all filter values
    values.push(Number(limit));
    values.push(Number(offset));
    const limitIndex  = values.length - 1;  // $N
    const offsetIndex = values.length;       // $N+1

    const getData = await db.query(`
      SELECT 
        hdr.*,
        itm.it_name,
        ven.v_name,
        COUNT(*) OVER() AS total_count
      FROM ${TABLE_NAMES.HDR_TABLE} hdr
      LEFT JOIN mommitem itm 
        ON hdr.it_code = itm.it_code
      LEFT JOIN mommvend ven 
        ON hdr.v_code = ven.v_code
      ${whereClause}
      ORDER BY hdr.rate_eff_dt
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `, values);

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        rateMaster: getData.rows,
        totalCount: Number(getData.rows[0].total_count),
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




const helpListData = async (req, res) => {
  const { form_status, help_list } = req?.query;

  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {

    //VENDOR HELP LIST
    if (help_list === "Vendor") {
      const vendorList = await db.query(`
        SELECT v_code, v_name
        FROM MOMMVEND
        ORDER BY v_name
      `);

      return res.status(200).json(vendorList.rows);
    }

    // ITEM HELP LIST
  else if (help_list === "item") {

  let itemList;

  if (form_status === "Search") {
    itemList = await db.query(`
      SELECT DISTINCT 
        vend.it_code,
        itm.it_name,
        itm.rate_apprvd_by_chairman
      FROM MDMMVEND vend
      LEFT JOIN MOMMITEM itm
        ON vend.it_code = itm.it_code
      ORDER BY itm.it_name
    `);
  } 
  else {
    // Insert / Update ke liye pura master
    itemList = await db.query(`
      SELECT it_code, it_name, rate_apprvd_by_chairman
      FROM MOMMITEM
      ORDER BY it_name
    `);
  }

  return res.status(200).json(itemList.rows);
}

    // default fallback
    return res.status(200).json([]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getRateMstrDataOnQuery(req, res);
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

      
      if (!row.it_code || !row.rate_eff_dt) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          type: "error",
          message: "Item Code and Eff. Date are required"
        });
      }

      //  duplicate check
      const exists = await db.query(
        `SELECT 1 FROM MDMMVEND 
         WHERE it_code=$1 AND rate_eff_dt=$2`,
        [row.it_code, row.rate_eff_dt]
      );

      if (exists.rows.length > 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          type: "error",
          message: `Duplicate for Item ${row.it_code} & Date ${row.rate_eff_dt}`
        });
      }

      const rateMstr = transMdmmvendToDbData(row);

      const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.HDR_TABLE,
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

// exports.handleSubmitData = catchAsync(async (req, res) => {
//   const payload = req.body;

//   try {
//     await db.query("BEGIN");

//     const formData = payload.inserted || [];

//     const formatDate = (date) => {
//       return new Date(date).toISOString().split("T")[0];
//     };

//     for (const row of formData) {
//       if (!row.isNew) continue;
//       if (!row.rate_eff_dt || !row.it_code) continue;

//       const formattedDate = formatDate(row.rate_eff_dt);

//       // 🔥 DUPLICATE CHECK
//       const check = await db.query(
//         `SELECT 1 FROM MDMMVEND 
//          WHERE it_code = $1 AND DATE(rate_eff_dt) = $2`,
//         [row.it_code, formattedDate]
//       );

//       if (check.rowCount > 0) {
//         throw new Error(
//           `Same Item Code + Date already exists (${row.it_code})`
//         );
//       }

//       const rateMstr = transMdmmvendToDbData({
//         ...row,
//         rate_eff_dt: formattedDate, // 🔥 normalized date
//       });

//       const queryForInsert = generateSingleInsertQuery(
//         TABLE_NAMES.HDR_TABLE,
//         rateMstr
//       );

//       const valuesForInsertQuery = Object.values(rateMstr);

//       await db.query(queryForInsert, valuesForInsertQuery);
//     }

//     await db.query("COMMIT");

//     return res.status(200).json({
//       type: "success",
//       message: "Records inserted successfully",
//     });

//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error("Insert error:", error);

//     return res.status(500).json({
//       type: "error",
//       message: error.message,
//     });
//   }
// });

exports.updateRatemstr = catchAsync(async (req, res) => {
  const { inserted = [], updated = [], deleted = [] } = req.body;

  try {
    await db.query("BEGIN");

    //  STEP 1: DELETE
    for (const row of deleted) {
      await db.query(
        `DELETE FROM MDMMVEND 
         WHERE it_code = $1 
         AND rate_eff_dt = $2`,
        [row.it_code, row.rate_eff_dt]
      );
    }

    //  STEP 2: UPDATE
    for (const row of updated) {
      const detailData = transMdmmvendToDbData(row);

      //  duplicate check (only if key changed)
      if (
        row.old_it_code !== row.it_code ||
        row.old_rate_eff_dt !== row.rate_eff_dt
      ) {
        const check = await db.query(
          `SELECT 1 FROM MDMMVEND 
           WHERE it_code = $1 AND rate_eff_dt = $2`,
          [row.it_code, row.rate_eff_dt]
        );

        if (check.rowCount > 0) {
          throw new Error(`Same Item Code + Date already exists`);
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
      values.push(row.old_rate_eff_dt || row.rate_eff_dt);

      const itCodeIndex = idx++;
      const dateIndex = idx;

      const result = await db.query(
        `UPDATE MDMMVEND
         SET ${setClause}
         WHERE it_code = $${itCodeIndex}
         AND rate_eff_dt = $${dateIndex}`,
        values
      );

      console.log("rows updated:", result.rowCount);
    }

    //  STEP 3: INSERT
    for (const row of inserted) {
      if (!row.it_code || !row.rate_eff_dt) continue;

      const check = await db.query(
        `SELECT 1 FROM MDMMVEND 
         WHERE it_code = $1 AND rate_eff_dt = $2`,
        [row.it_code, row.rate_eff_dt]
      );

      if (check.rowCount > 0) {
        throw new Error(
          `Same Item Code + Date already exists`
        );
      }

      const rateMstr = transMdmmvendToDbData(row);

      const queryForInsert = generateSingleInsertQuery(
        TABLE_NAMES.HDR_TABLE,
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

exports.checkDuplicateRateEffDt = catchAsync(async (req, res) => {
  try {
    const { it_code, rate_eff_dt } = req.body;

    const query = `
      SELECT 1 
      FROM MDMMVEND
      WHERE it_code = $1 
      AND rate_eff_dt = $2
      LIMIT 1
    `;

    const result = await db.query(query, [it_code, rate_eff_dt]);

    if (result.rows.length > 0) {
      return res.json({
        type: "error",
        message: "Same Item Code + Eff. Date already exists "
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