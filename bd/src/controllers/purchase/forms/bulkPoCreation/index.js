
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transBulkPoCreationToDbData } = require("./presentation");



const TABLE_NAMES = {

  HDR_TABLE: "TOMMPRE_PO_DETAILS",

};


const getRateMstrDataOnQuery = async (req, res) => {
  try {

    const { v_code, po_date, limit = 20, offset = 0  } = req.query;

    let conditions = [];
    let values = [];

    //  Dynamic filters
    if (v_code) {
      values.push(v_code);
      conditions.push(`hdr.v_code = $${values.length}`);
    }

    if (po_date) {
      values.push(po_date);
      conditions.push(`DATE(hdr.po_date) = $${values.length}`);
    }

    //  WHERE build
    let whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(" AND ")}`
      : "";


      
    // Add limit and offset AFTER all filter values
    values.push(Number(limit));
    values.push(Number(offset));
    const limitIndex  = values.length - 1;  // $N
    const offsetIndex = values.length;       // $N+1



    const getData = await db.query(
      `
      SELECT 
        hdr.*,
        itm.it_name,
        ven.v_name,
        cus.c_name,
        COUNT(*) OVER() AS total_count
      FROM ${TABLE_NAMES.HDR_TABLE} hdr
      LEFT JOIN mommitem itm 
        ON hdr.it_code = itm.it_code
      LEFT JOIN mommvend ven 
        ON hdr.v_code = ven.v_code
      LEFT JOIN mosmcust cus 
        ON hdr.ship_to = cus.c_code
      ${whereClause}
      ORDER BY hdr.po_date DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}
      `,
      values
    );

    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        bulkPoCreation: getData.rows,
        totalCount: getData.rows[0].total_count,
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        bulkPoCreation: [],
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
  const {
    form_status,
    help_list,
  } = req?.query;

  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {

    //  VENDOR HELP LIST
   if (help_list === "Vendor") {

  let vendorList;

  //  SEARCH MODE
  if (form_status === "Search") {
    vendorList = await db.query(`
      SELECT DISTINCT 
        hdr.v_code,
        ven.v_name
      FROM TOMMPRE_PO_DETAILS hdr
      LEFT JOIN MOMMVEND ven
        ON hdr.v_code = ven.v_code
      ORDER BY ven.v_name
    `);
  } 
  //  INSERT / UPDATE MODE
  else {
    vendorList = await db.query(`
      SELECT v_code, v_name
      FROM MOMMVEND
      ORDER BY v_name
    `);
  }

  return res.status(200).send(vendorList.rows);
}

    //  ITEM HELP LIST
    else if (help_list === "item") {
      const itemList = await db.query(
//         SELECT 
//   mv.it_code, 
//   mv.it_rate, 
//   itm.it_name
// FROM MDMMVEND mv
// JOIN MOMMITEM itm
//   ON mv.it_code = itm.it_code
// ORDER BY  itm.it_name;

   //  to get latest rate for each item code    
`SELECT 
    mv.it_code,
    mv.it_rate,
    itm.it_name
FROM (
    SELECT DISTINCT ON (it_code)
        it_code,
        it_rate
    FROM MDMMVEND
    ORDER BY it_code, rate_eff_dt DESC
) mv
JOIN MOMMITEM itm
    ON mv.it_code = itm.it_code
ORDER BY itm.it_name;
       
      `);
      
     

      return res.status(200).json(itemList.rows);
    }
    else if (help_list === "shipTo") {
      const itemList = await db.query(`
        select c_code ,c_name from mosmcust order by c_name
      `);

      return res.status(200).json(itemList.rows);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
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

exports.handlebulkPoCreationButton = catchAsync(async(req,res, next) => {
 const payload = req.body;

 try {
  await db.query("BEGIN");
  const bulkData = payload.rows || []

  for( const row of bulkData){

      if (!row.isNew) continue;

   if (!row.v_code || !row.it_code || !row.qty || !row.rate) continue;

  const bulkPoCreation = transBulkPoCreationToDbData(row);
  const queryForInsert = generateSingleInsertQuery(TABLE_NAMES.HDR_TABLE,bulkPoCreation);
  const valuesForInsertQuery = Object.values(bulkPoCreation);

  await db.query(queryForInsert,valuesForInsertQuery);
  }

  await db.query("COMMIT")

  return res.status(200).json({
    type:"success",
    message:"Records inserted successfully"
  })
  
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Insert error:", error);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

exports.handleSubmitBulkPO = async (req, res) => {
  try {
    const { creation_date, division_id } = req.body;

    await db.query(
      `CALL proc_create_bulk_pos($1, $2)`,
      [creation_date, division_id]
    );

    return res.json({
      type: "success",
      message: "PO Generated Successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// exports.handleSubmitData = catchAsync(async (req, res) => {
//   const payload = req.body;

//   try {
//     await db.query("BEGIN");

//     const formData = payload.inserted || [];

//     //  Insert case me direct loop
//   for (const row of formData) {

//   if (!row.isNew) continue;

//   if (!row.rate_eff_dt || !row.it_code) continue;

//   const rateMstr = transBulkPoCreationToDbData(row);

//   const queryForInsert = generateSingleInsertQuery(
//     TABLE_NAMES.HDR_TABLE,
//     rateMstr
//   );

//   const valuesForInsertQuery = Object.values(rateMstr);

//   await db.query(queryForInsert, valuesForInsertQuery);
// }

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


// exports.updateRatemstr = catchAsync(async (req, res) => {
//   const { inserted = [], updated = [], deleted = [] } = req.body;

//   try {
//     await db.query("BEGIN");

//     //  STEP 1: DELETE
//     for (const row of deleted) {
//       await db.query(
//         `DELETE FROM MDMMVEND 
//          WHERE it_code = $1 
//          AND rate_eff_dt = $2`,
//         [row.it_code, row.rate_eff_dt]
//       );
//     }

//     //  STEP 2: UPDATE
//     for (const row of updated) {
//       const detailData = transBulkPoCreationToDbData(row);

//       //  duplicate check (only if key changed)
//       if (
//         row.old_it_code !== row.it_code ||
//         row.old_rate_eff_dt !== row.rate_eff_dt
//       ) {
//         const check = await db.query(
//           `SELECT 1 FROM MDMMVEND 
//            WHERE it_code = $1 AND rate_eff_dt = $2`,
//           [row.it_code, row.rate_eff_dt]
//         );

//         if (check.rowCount > 0) {
//           throw new Error(`Same Item Code + Date already exists`);
//         }
//       }

//       const columns = Object.keys(detailData);
//       const values = [];
//       let idx = 1;

//       const setClause = columns
//         .map((col) => {
//           values.push(detailData[col]);
//           return `${col} = $${idx++}`;
//         })
//         .join(", ");

//       //  WHERE old combo pe
//       values.push(row.old_it_code || row.it_code);
//       values.push(row.old_rate_eff_dt || row.rate_eff_dt);

//       const itCodeIndex = idx++;
//       const dateIndex = idx;

//       const result = await db.query(
//         `UPDATE MDMMVEND
//          SET ${setClause}
//          WHERE it_code = $${itCodeIndex}
//          AND rate_eff_dt = $${dateIndex}`,
//         values
//       );

//       console.log("rows updated:", result.rowCount);
//     }

//     //  STEP 3: INSERT
//     for (const row of inserted) {
//       if (!row.it_code || !row.rate_eff_dt) continue;

//       const check = await db.query(
//         `SELECT 1 FROM MDMMVEND 
//          WHERE it_code = $1 AND rate_eff_dt = $2`,
//         [row.it_code, row.rate_eff_dt]
//       );

//       if (check.rowCount > 0) {
//         throw new Error(
//           `Same Item Code + Date already exists`
//         );
//       }

//       const rateMstr = transBulkPoCreationToDbData(row);

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
//       message: "Bulk Po Creation Updated Successfully",
//     });

//   } catch (error) {
//     console.error("Update Error:", error);

//     await db.query("ROLLBACK");

//     return res.status(500).json({
//       type: "error",
//       message: error.message,
//     });
//   }
// });