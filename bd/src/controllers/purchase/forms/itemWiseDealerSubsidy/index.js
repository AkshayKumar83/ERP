
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transMOMMITEMSUBSIDYToDbData } = require("./presentation");



const TABLE_NAMES = {

  HDR_TABLE: "MOMMITEM_SUBSIDY",

};


const getRateMstrDataOnQuery = async (req, res) => {
  try {

      const { it_code,it_name} = req.query;

    let conditions = [];
    let values = [];

    //  Dynamic filters
    if (it_code) {
      values.push(it_code);
      conditions.push(`hdr.it_code = $${values.length}`);
    }

    if (it_name) {
      values.push(it_name);
      conditions.push(`itm.it_name = $${values.length}`);
    }

  

    //  WHERE build
    let whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(" AND ")}`
      : "";



     const getData = await db.query(`
      SELECT 
        hdr.*,
        itm.it_name,
        COUNT(*) OVER() AS total_count
      FROM ${TABLE_NAMES.HDR_TABLE} hdr
      LEFT JOIN mommitem itm 
        ON hdr.it_code = itm.it_code
          ${whereClause}
        order by hdr.eff_date
     `, values);
 
     if (getData.rowCount > 0) {
       return res.status(200).json({
         type: "found",
         itemWiseDealerSubsidy: getData.rows,
         totalCount: getData.rows[0].total_count, 
       });
     } else {
       return res.status(200).json({
         type: "not_found",
         itemWiseDealerSubsidy: [],
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
// const helpListData = async (req, res) => {
//   const { form_status, help_list } = req?.query;

//   if (!["Insert", "Update", "Search"].includes(form_status)) {
//     return res.status(200).send([]);
//   }

//   try {

//     // ITEM HELP LIST
//   if (help_list === "item") {

//   let itemList;

//   if (form_status === "Search") {
//     itemList = await db.query(`
//       SELECT DISTINCT 
//         sub.it_code,
//         itm.it_name
//       FROM mommitem_subsidy sub
//       LEFT JOIN MOMMITEM itm
//         ON sub.it_code = itm.it_code
//       ORDER BY itm.it_name
//     `);
//   } 
//   else {
  
//     itemList = await db.query(`
//       SELECT it_code, it_name
//       FROM MOMMITEM
//       ORDER BY it_name
//     `);
//   }

//   return res.status(200).json(itemList.rows);
// }

//     // default fallback
//     return res.status(200).json([]);

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: error.message || "Internal server error",
//     });
//   }
// };

const helpListData = async (req, res) => {
  const { form_status, help_list } = req?.query;

  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {

    let result;

    //  Common logic for both help_list (item / Name)
    if (form_status === "Search") {
      //  Query A (Search)
      result = await db.query(`
        SELECT DISTINCT 
          sub.it_code,
          itm.it_name
        FROM mommitem_subsidy sub
        LEFT JOIN MOMMITEM itm
          ON sub.it_code = itm.it_code
        ORDER BY itm.it_name
      `);
    } else {
      //  Query B (Insert / Update)
      result = await db.query(`
        SELECT it_code, it_name
        FROM MOMMITEM
        ORDER BY it_name
      `);
    }

    return res.status(200).json(result.rows);

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

      
      if (!row.it_code || !row.eff_date) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          type: "error",
          message: "Item Code and Eff. Date are required"
        });
      }

      //  duplicate check
      const exists = await db.query(
        `SELECT 1 FROM MOMMITEM_SUBSIDY 
         WHERE it_code=$1 AND eff_date=$2`,
        [row.it_code, row.eff_date]
      );

      if (exists.rows.length > 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          type: "error",
          message: `Duplicate for Item ${row.it_code} & Date ${row.eff_date}`
        });
      }

      const rateMstr = transMOMMITEMSUBSIDYToDbData(row);

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
//       if (!row.eff_date || !row.it_code) continue;

//       const formattedDate = formatDate(row.eff_date);

//       // 🔥 DUPLICATE CHECK
//       const check = await db.query(
//         `SELECT 1 FROM MOMMITEM_SUBSIDY 
//          WHERE it_code = $1 AND DATE(eff_date) = $2`,
//         [row.it_code, formattedDate]
//       );

//       if (check.rowCount > 0) {
//         throw new Error(
//           `Same Item Code + Date already exists (${row.it_code})`
//         );
//       }

//       const rateMstr = transMOMMITEM_SUBSIDYToDbData({
//         ...row,
//         eff_date: formattedDate, // 🔥 normalized date
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
        `DELETE FROM MOMMITEM_SUBSIDY 
         WHERE it_code = $1 
         AND eff_date = $2`,
        [row.it_code, row.eff_date]
      );
    }

    //  STEP 2: UPDATE
    for (const row of updated) {
      const detailData = transMOMMITEMSUBSIDYToDbData(row);

      //  duplicate check (only if key changed)
      if (
        row.old_it_code !== row.it_code ||
        row.old_eff_date !== row.eff_date
      ) {
        const check = await db.query(
          `SELECT 1 FROM MOMMITEM_SUBSIDY 
           WHERE it_code = $1 AND eff_date = $2`,
          [row.it_code, row.eff_date]
        );

        if (check.rowCount > 0) {
          throw new Error(`Same Item Code + Eff. Date already exists`);
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
      values.push(row.old_eff_date || row.eff_date);

      const itCodeIndex = idx++;
      const dateIndex = idx;

      const result = await db.query(
        `UPDATE mommitem_subsidy
         SET ${setClause}
         WHERE it_code = $${itCodeIndex}
         AND eff_date = $${dateIndex}`,
        values
      );

      console.log("rows updated:", result.rowCount);
    }

    //  STEP 3: INSERT
    for (const row of inserted) {
      if (!row.it_code || !row.eff_date) continue;

      const check = await db.query(
        `SELECT 1 FROM MOMMITEM_SUBSIDY 
         WHERE it_code = $1 AND eff_date = $2`,
        [row.it_code, row.eff_date]
      );

      if (check.rowCount > 0) {
        throw new Error(
          `Same Item Code + Eff.Date already exists`
        );
      }

      const rateMstr = transMOMMITEMSUBSIDYToDbData(row);

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

exports.checkDuplicateItemEffDt = catchAsync(async (req, res) => {
  try {
    const { it_code, eff_date } = req.body;

    const query = `
      SELECT 1 
      FROM MOMMITEM_SUBSIDY
      WHERE it_code = $1 
      AND eff_date = $2
      LIMIT 1
    `;

    const result = await db.query(query, [it_code, eff_date]);

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