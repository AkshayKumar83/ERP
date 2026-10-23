
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { transMdmmvendToDbData } = require("./presentation");



const TABLE_NAMES = {

  HDR_TABLE: "thfmtran_stage",
  DTL_TABLE: "tdfmtran_stage",

};



const getStagingDataOnQuery = async (req, res) => {
  try {
    const { v_code,bill_no, bill_dt, limit = 20, offset = 0 ,status} = req.query;

    let conditions = [];
    let values = [];

    // Always fetch only P4
   conditions.push(`d.tran_type = 'P4'`);

   if (status === "Y") {
    conditions.push(`h.approve = 'Y'`);
}
else if (status === "N") {
    conditions.push(`h.cancel = 'Y'`);
}
else if (status === "P") {
    conditions.push(`
        COALESCE(h.approve,'N') = 'N'
        AND COALESCE(h.cancel,'N') = 'N'
    `);
}

    // Dynamic filters
    if (v_code) {
      values.push(v_code);
      //  conditions.push(`d.v_code = $${values.length}`);
      conditions.push(`
    d.voucher_id IN (
    SELECT voucher_id
    FROM tdfmtran_stage
    WHERE flag='Y'
      AND acc_no = $${values.length}
)
`);
    }
    if (bill_no) {
      values.push(bill_no);
     conditions.push(`d.bill_no = $${values.length}`);
    
    }
    if (bill_dt) {
      values.push(bill_dt);
     conditions.push(`d.bill_dt = $${values.length}`);
    
    }

    // let whereClause = conditions.length > 0
    //   ? `WHERE ${conditions.join(" AND ")}`
    //   : "";

      let whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // Add limit and offset AFTER all filter values
    values.push(Number(limit));
    values.push(Number(offset));
    const limitIndex  = values.length - 1;  // $N
    const offsetIndex = values.length;       // $N+1

//   const getData = await db.query(
//     `
//     SELECT
//     d.*,
   
//     mh.acc_desc,
//     h.cancel,
//      h.po_id,
//     CASE
//         WHEN d.flag = 'Y' THEN d.acc_no
//         ELSE NULL
//     END AS v_code,

//     CASE
//         WHEN d.flag = 'Y' THEN mv.v_name
//         ELSE NULL
//     END AS v_name,

//     CASE
//         WHEN d.flag = 'Y' THEN mv.gst_no
//         ELSE NULL
//     END AS gst_no,

//     COUNT(*) OVER() AS total_count

// FROM tdfmtran_stage d

// LEFT JOIN thfmtran_stage h
//     ON h.voucher_id = d.voucher_id

// LEFT JOIN mhfmglm mh
//     ON mh.acc_no = d.acc_no

// LEFT JOIN mommvend mv
//     ON d.flag = 'Y'
//    AND mv.v_code = CASE
//                       WHEN d.acc_no LIKE 'S%'
//                       THEN SUBSTRING(d.acc_no FROM 2)
//                       ELSE d.acc_no
//                    END
//       ${whereClause}
//       ORDER BY
//     d.voucher_id,
//     CASE
//         WHEN d.flag = 'Y' THEN 0
//         ELSE 1
//     END,
//     d.srl_no,
//     d.bill_dt 
//       LIMIT $${limitIndex}
//       OFFSET $${offsetIndex}
//   `, values);

 const getData = await db.query(`
  SELECT
    d.*,
    
    mh.acc_desc,
    h.cancel,
    h.po_id,
    h.approve,
    tf.vch_no AS voucher_no,
    tf.vch_dt AS voucher_dt,

    
    CASE
        WHEN d.flag = 'Y' THEN d.acc_no
        ELSE NULL
    END AS v_code,

    CASE
        WHEN d.flag = 'Y' THEN mv.v_name
        ELSE NULL
    END AS v_name,

    CASE
        WHEN d.flag = 'Y' THEN mv.gst_no
        ELSE NULL
    END AS gst_no,

    CASE
        WHEN d.flag = 'Y' THEN auth.prepared_by
        ELSE NULL
    END AS prepared_by,

    CASE
        WHEN d.flag = 'Y' THEN auth.checked_by
        ELSE NULL
    END AS checked_by,

    CASE
        WHEN d.flag = 'Y' THEN auth.authorized_by
        ELSE NULL
    END AS authorized_by,

    COUNT(*) OVER() AS total_count

FROM tdfmtran_stage d

LEFT JOIN thfmtran_stage h
       ON h.voucher_id = d.voucher_id

   LEFT JOIN (
    SELECT DISTINCT ON (voucher_id)
           voucher_id,
           vch_no,
           vch_dt
    FROM tdfmtran
    ORDER BY voucher_id
) tf
ON tf.voucher_id = d.voucher_id

/* Authorization names for one PO */
LEFT JOIN
(
    SELECT
        md.po_id,

        MAX(
            CASE
                WHEN md.auth_id = mo.auth_id1
                THEN um.login_name
            END
        ) AS prepared_by,

        MAX(
            CASE
                WHEN md.auth_id = mo.auth_id2
                THEN um.login_name
            END
        ) AS checked_by,

        MAX(
            CASE
                WHEN md.auth_id = mo.auth_id3
                THEN um.login_name
            END
        ) AS authorized_by

    FROM mdmmpoauth md

    INNER JOIN mhmmpo mp
            ON mp.po_id = md.po_id

    INNER JOIN moitauth mo
            ON mo.doc_type =
               CASE
                   WHEN mp.po_type = 'A' THEN 'PA'
                   WHEN mp.po_type = 'O' THEN 'PO'
               END

    INNER JOIN user_master um
            ON um.user_id = md.auth_id

    GROUP BY md.po_id

) auth
ON auth.po_id = h.po_id

LEFT JOIN mhfmglm mh
       ON mh.acc_no = d.acc_no

LEFT JOIN mommvend mv
       ON d.flag = 'Y'
      AND mv.v_code =
          CASE
              WHEN d.acc_no LIKE 'S%'
              THEN SUBSTRING(d.acc_no FROM 2)
              ELSE d.acc_no
          END
${whereClause}
ORDER BY
    d.voucher_id,
    CASE
        WHEN d.flag = 'Y' THEN 0
        ELSE 1
    END,
    d.srl_no,
    d.bill_dt
   LIMIT $${limitIndex}
   OFFSET $${offsetIndex}
 `, values);


// const getData = await db.query(
//   `WITH data AS
// (
//     SELECT
//         d.*,
//         mh.acc_desc,

//         CASE
//             WHEN d.flag = 'Y' THEN d.acc_no
//         END AS v_code,

//         CASE
//             WHEN d.flag = 'Y' THEN mv.v_name
//         END AS v_name,

//         CASE
//             WHEN d.flag = 'Y' THEN mv.gst_no
//         END AS gst_no

//     FROM tdfmtran_stage d

//     LEFT JOIN mhfmglm mh
//         ON mh.acc_no = d.acc_no

//     LEFT JOIN mommvend mv
//         ON d.flag='Y'
//        AND mv.v_code=
//             CASE
//                 WHEN d.acc_no LIKE 'S%'
//                 THEN SUBSTRING(d.acc_no FROM 2)
//                 ELSE d.acc_no
//             END

//     ${whereClause}
// )

// SELECT
//     d.*,

//       CASE
//         WHEN d.srl_no = 0 THEN ''
//         ELSE MAX(v_code) OVER(PARTITION BY voucher_id)
//     END AS v_code,

//     CASE
//         WHEN d.srl_no = 0 THEN 'TOTAL'
//         ELSE MAX(v_name) OVER(PARTITION BY voucher_id)
//     END AS v_name,

//     CASE
//         WHEN d.srl_no = 0 THEN NULL
//         ELSE MAX(gst_no) OVER(PARTITION BY voucher_id)
//     END AS gst_no,

//     COUNT(*) OVER() AS total_count

// FROM data d

// ORDER BY
//     voucher_id,
//     CASE
//         WHEN srl_no = 0 THEN 999999
//         ELSE srl_no
//     END,
//     bill_dt

// LIMIT $${limitIndex}
// OFFSET $${offsetIndex}`,
//  values);

  //  console.log(getData.rows.find(r => r.srl_no == 0));


    if (getData.rowCount > 0) {
      return res.status(200).json({
        type: "found",
        stagingData: getData.rows,
        totalCount: Number(getData.rows[0].total_count),
      });
    } else {
      return res.status(200).json({
        type: "not_found",
        stagingData: [],
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

  if (!["Search","Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {

    //VENDOR HELP LIST
    if ( form_status === "Search" && help_list === "Vendor") {
      const vendorList = await db.query(`
      select distinct
      d.acc_no as v_code ,
      mh.acc_desc as v_name
      from tdfmtran_stage d
      left join mhfmglm mh
      on mh.acc_no = d.acc_no
      WHERE d.flag = 'Y'
      AND d.acc_no LIKE 'S%'
      and tran_type ='P4'
      order by acc_desc
      `);
     

      return res.status(200).json(vendorList.rows);
}
    //VENDOR HELP LIST
    if ( form_status === "Search" && help_list === "billNo") {
      const billNoList = await db.query(`
      select distinct bill_no from tdfmtran_stage
      where tran_type ='P4'
      order by bill_no `);
     

      return res.status(200).json(billNoList.rows);
}
 if ( form_status==="Update" && help_list === "AccNo") {
      const accList = await db.query(
        `select acc_no, acc_desc from mhfmglm where acc_no like 'L%' order by acc_no `,
      );
      return res.status(200).send(accList.rows);
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
  if (["Query", "Search","Update"].includes(req?.query?.formStatus)) {
    await getStagingDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});


exports.updateStagingPurchaseVoucher = catchAsync(async (req, res) => {
  const { updated = [], user_id } = req.body;

  try {
    await db.query("BEGIN");

    for (const row of updated) {

      // ---------------- Header Update ----------------
      await db.query(
        `UPDATE thfmtran_stage
         SET bill_no     = $1,
             bill_dt     = $2,
             cancel      = $3,
             approve     = $4,
             update_id   = $5,
             update_date = CURRENT_TIMESTAMP
         WHERE voucher_id = $6`,
        [
          row.bill_no,
          row.bill_dt,
          row.cancel,
          row.approve,
          Number(user_id),
          row.voucher_id,
        ]
      );

      // ======================================================
      // ACC NO CHANGED
      // ======================================================
      if (row.acc_no !== row.old_acc_no) {

        // Duplicate Check
        const duplicate = await db.query(
          `SELECT 1
           FROM tdfmtran_stage
           WHERE voucher_id = $1
             AND acc_no = $2
             AND acc_no <> $3
           LIMIT 1`,
          [
            row.voucher_id,
            row.acc_no,
            row.old_acc_no,
          ]
        );

        if (duplicate.rowCount > 0) {
          throw new Error(
            `Account No '${row.acc_no}' already exists for Voucher '${row.voucher_id}'.`
          );
        }

        // Update only selected row
        await db.query(
          `UPDATE tdfmtran_stage
           SET bill_no     = $1,
               bill_dt     = $2,
               approve     = $3,
               update_id   = $4,
               update_date = CURRENT_TIMESTAMP,
               acc_no      = $5
           WHERE voucher_id = $6
             AND acc_no = $7`,
          [
            row.bill_no,
            row.bill_dt,
            row.approve,
            Number(user_id),
            row.acc_no,
            row.voucher_id,
            row.old_acc_no,
          ]
        );
        
        // Update adv_gl_acc_no in PO Master
        await db.query(
          `UPDATE mhmmpo m
          SET adv_gl_acc_no = $1,
              update_id     = $2,
              update_date   = CURRENT_TIMESTAMP
          FROM thfmtran_stage t
          WHERE m.po_id = t.po_id
            AND t.voucher_id = $3`,
          [
            row.acc_no,          // New Account No
            Number(user_id),     // Updated By
            row.voucher_id,      // Voucher Id
          ]
        );

      } else {

        // ======================================================
        // ACC NO NOT CHANGED
        // ======================================================
        // Update all rows of same voucher
        await db.query(
          `UPDATE tdfmtran_stage
           SET bill_no     = $1,
               bill_dt     = $2,
               approve     = $3,
               update_id   = $4,
               update_date = CURRENT_TIMESTAMP
           WHERE voucher_id = $5`,
          [
            row.bill_no,
            row.bill_dt,
            row.approve,
            Number(user_id),
            row.voucher_id,
          ]
        );
      }
    }

    

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Staging Purchase Voucher Updated Successfully",
    });

  } catch (error) {
    await db.query("ROLLBACK");

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

// exports.updateStagingPurchaseVoucher = catchAsync(async (req, res) => {
//   const { updated = [],user_id} = req.body;
// // console.log("user_id:", user_id);
// // console.log("typeof:", typeof user_id);
// // console.log("=== string?", user_id === "587");
// // console.log("=== number?", user_id === 587);

//    // Delete authorization check
//   const AUTHORIZED_USER_ID = 583; // MANOJ GARG user_id = 587



//   try {
//     await db.query("BEGIN");

//   // UPDATE
//   for (const row of updated) {

//     // Header Update
//     await db.query(
//       `UPDATE thfmtran_stage
//       SET bill_no     = $1,
//           bill_dt     = $2,
//           cancel      = $3,
//           approve     = $4,
//           update_id   = $5,
//           update_date = CURRENT_TIMESTAMP
//       WHERE voucher_id = $6`,
//       [
//         row.bill_no,
//         row.bill_dt,
//         row.cancel,          // Y / N
//         row.approve,         // Y / N
//         Number(user_id),
//         row.voucher_id,
//       ]
//     );

//   // Detail Update
//   await db.query(
//     `UPDATE tdfmtran_stage
//      SET bill_no     = $1,
//          bill_dt     = $2,
//          approve     = $3,
//          update_id   = $4,
//          update_date = CURRENT_TIMESTAMP
//      WHERE voucher_id = $5`,
//     [
//       row.bill_no,
//       row.bill_dt,
//       row.approve,          // Y / N
//       Number(user_id),
//       row.voucher_id,
//     ]
//   );
// }

//     await db.query("COMMIT");

//     return res.status(200).json({
//       type: "success",
//       message: "Staging Purchase Voucher Updated Successfully",
//     });

//   } catch (error) {
//     await db.query("ROLLBACK");

//     console.error(error);

//     return res.status(500).json({
//       type: "error",
//       message: error.message,
//     });
//   }
// });

// exports.checkDuplicateRateEffDt = catchAsync(async (req, res) => {
//   try {
//     const { bill_no, bill_date } = req.body;

//     const query = `
//       SELECT 1 
//       FROM MDMMVEND
//       WHERE it_code = $1 
//       AND rate_eff_dt = $2
//       LIMIT 1
//     `;

//     const result = await db.query(query, [bill_no, bill_date]);

//     if (result.rows.length > 0) {
//       return res.json({
//         type: "error",
//         message: "Same Bill No. and Date already exists"
//       });
//     }

//     return res.json({
//       type: "success",
//       message: "No duplicate"
//     });

//   } catch (err) {
//     return res.status(500).json({
//       type: "error",
//       message: err.message
//     });
//   }
// });