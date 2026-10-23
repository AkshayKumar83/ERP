const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { v4: uuidv4 } = require('uuid');

const TABLE_NAMES = {
  WORK_CENTRE_STORE: "vwWorkCenterStore",
  ITEM_MASTER: "mommitem",
  STOCK_ITEM: "mommstok",
};

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
  } = req?.query;

  console.log("req?.query:", req?.query);

  if (help_list === "store") {
    const storeList = await db.query(
      `select description, WC_NO, wc_id from ${TABLE_NAMES.WORK_CENTRE_STORE} 
                where division_id = $1
                order by 1`,
      [divisionId]
    );
    return res.status(200).send(storeList.rows);
  } else if (help_list === "item") {
    const { wc_id } = req?.query;
    console.log(wc_id);
    if (!wc_id) {
      return res.status(400).send({ errMsg: "please first select  store" });
    }

    const itemList = await db.query(
      `select a.fc_code, b.it_code, a.it_name from ${TABLE_NAMES.ITEM_MASTER} a, ${TABLE_NAMES.STOCK_ITEM} b 
            where b.wc_id = $1
            and a.it_code = b.it_code
            AND b.trans_year = $2
            order by 1
          `,
      [wc_id, transYear]
    );
    console.log(itemList.rows);
    if (itemList.rows.length > 0) {
      res.status(200).json(itemList.rows);
    }
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});


exports.handleShowBtnOperation = catchAsync(async (req, res, next) => {
  const {
    appFinYear: transYear,
    wc_id,
    it_code,
    ok_rej,
    from_date,
    to_date,
  } = req.query;

  console.log("Received query:", req.query);

  try {
    // Fetch opening balance (from_date)
    const getOpeningBal = await db.query(
      `SELECT item_current_opening_bal($1, $2, $3, $4, $5) AS opening_balance`,
      [wc_id, it_code, from_date, transYear, ok_rej]
    );

    // Fetch closing balance (to_date)
    const getClosingBal = await db.query(
      `SELECT item_current_opening_bal($1, $2, $3, $4, $5) AS closing_balance`,
      [wc_id, it_code, to_date, transYear, ok_rej]
    );

    const rawOpeningBalance = getOpeningBal.rows[0]?.opening_balance;
    const rawClosingBalance = getClosingBal.rows[0]?.closing_balance;

    if (
      rawOpeningBalance === null ||
      rawOpeningBalance === undefined ||
      rawClosingBalance === null ||
      rawClosingBalance === undefined
    ) {
      return res.status(404).json({
        type: "error",
        message: "Opening or closing balance not found.",
      });
    }

    const openingBalance = parseFloat(rawOpeningBalance).toFixed(3);
    const closingBalance = parseFloat(rawClosingBalance).toFixed(3);

    return res.status(200).json({
      type: "success",
      opening_balance: openingBalance,
      closing_balance: closingBalance,
    });
  } catch (error) {
    console.error("Error in handleShowBtnOperation:", error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});


exports.handleGetTommmainData = catchAsync(async (req, res, next) => {
  try {
    const { it_code, from_date, to_date, ok_rej, wc_id, closing_balance } = req.query;
    let openingBalance = closing_balance || 0;
    let total_recp = 0, total_issu = 0;

    
    const sessionId = uuidv4();

    // Call the procedure
    await db.query(`CALL proc_fill_item_bin_kard($1, $2, $3, $4, $5, $6, $7)`, [
      it_code,
      from_date,
      to_date,
      ok_rej,
      Number(wc_id),
      Number(openingBalance),
      sessionId
    ]);

    // Fetch records from the session-specific result
    const result = await db.query(`SELECT * FROM temp_item_bin_kard WHERE id = $1`,[sessionId]);

    if (result.rowCount === 0) {
      return res.status(200).json({
        type: 'success',
        data: [],
        message: 'No Record found'
      });
    }

    const transformed = result.rows.map(row => {
      total_issu += Number(row.issu_qty || 0);
      total_recp += Number(row.recp_qty || 0);
      return {
        ...row,
        doc_date: dateFormater(row.doc_date)
      };
    });

    return res.status(200).json({
      type: 'success',
      data: transformed,
      total_issu,
      total_recp
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
});



// exports.handleGetTommmainData = catchAsync(async (req, res, next) => {
//   try {
//     const { it_code, from_date, to_date, ok_rej, wc_id, closing_balance } =
//       req.query;
//     let openingBalance = closing_balance || 0;
//     let total_recp = 0,
//       total_issu = 0;

//     let uniqueId = uuidv4();
//     const result = await db.query(
//       `SELECT * FROM tommmain WHERE
//         it_code = $1 AND
//         DATE(doc_date) BETWEEN DATE($2) AND DATE($3) AND
//         ok_rej = $4 AND
//         wc_id = $5`,
//       [it_code, from_date, to_date, ok_rej, wc_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(200).json({
//         type: 'success',
//         data: [],
//         message: 'No Record found'
//       });
//     }

//     for (const item of result.rows) {
//       let receive_issue_flag = null;

//       // Get type and receive_issue_flag
//       const kardTypeRes = await db.query(
//         `SELECT receive_issue_flag, type_desc FROM mommtrty WHERE trans_code = $1`,
//         [item.trans_code]
//       );
//       if (kardTypeRes.rows?.length > 0) {
//         item.type = kardTypeRes.rows[0].type_desc;
//         receive_issue_flag = kardTypeRes.rows[0].receive_issue_flag;
//       }

//       // Fallback if type not found
//       if (!item.type) {
//         const finalKardType = await db.query(
//           `SELECT trans_code_heading($1, $2) AS type`,
//           [item.trans_code, item.doc_no]
//         );
//         if (finalKardType.rows?.length > 0) {
//           item.type = finalKardType.rows[0].type;
//         }
//       }

//       // Assign qty
//       if (receive_issue_flag === 'R') {
//         item.recp_qty = item.qty;
//         item.issu_qty = 0;
//       } else if (receive_issue_flag === 'I') {
//         item.issu_qty = item.qty;
//         item.recp_qty = 0;
//       }

//       // Get dept_vend if v_code is missing
//       if (!item.v_code) {
//         let deptVendQuery;
//         if (receive_issue_flag === 'R') {
//           deptVendQuery = await db.query(
//             `SELECT description AS dept_vend FROM mommwc, mommtrty
//              WHERE mommtrty.trans_code = $1 AND mommtrty.from_wc_id = mommwc.wc_id`,
//             [item.trans_code]
//           );
//         } else if (receive_issue_flag === 'I') {
//           deptVendQuery = await db.query(
//             `SELECT description AS dept_vend FROM mommwc, mommtrty
//              WHERE mommtrty.trans_code = $1 AND mommtrty.to_wc_id = mommwc.wc_id`,
//             [item.trans_code]
//           );
//         }
//         if (!item.dept_vend && deptVendQuery?.rows?.length > 0) {
//           item.dept_vend = deptVendQuery.rows[0].dept_vend;
//         }
//       }

//       // PO no & vendor
//       const poInfo = await db.query(
//         `SELECT y.po_no AS po_no, z.v_name AS dept_vend
//          FROM tdmmrct x, mhmmpo y, mommvend z
//          WHERE x.mrir_no = $1 AND x.po_id = y.po_id AND y.v_code = z.v_code`,
//         [item.doc_no]
//       );
//       if (poInfo.rows?.length > 0) {
//         item.po_no = poInfo.rows[0].po_no;
//         if (!item.dept_vend) {
//           item.dept_vend = poInfo.rows[0].dept_vend;
//         }
//       }

//       // If doc_no contains X
//       if (item.doc_no?.toUpperCase().includes('X')) {
//         const vendDeptX = await db.query(
//           `SELECT z.v_name AS dept_vend
//            FROM thmmrct h, tdmmrct x, mommvend z
//            WHERE x.mrir_no = $1 AND h.ge_id = x.ge_id AND h.v_code = z.v_code`,
//           [item.doc_no]
//         );
//         if (!item.dept_vend && vendDeptX.rows?.length > 0) {
//           item.dept_vend = vendDeptX.rows[0].dept_vend;
//         }
//       }

//       // Chalan detail
//       const chlnDtl = await db.query(
//         `SELECT chln_no, chln_date
//          FROM thmmrct h, tdmmrct d, mommvend m
//          WHERE h.ge_id = d.ge_id AND h.v_code = m.v_code AND d.mrir_no = $1`,
//         [item.doc_no]
//       );
//       if (chlnDtl.rows?.length > 0) {
//         item.chln_no = chlnDtl.rows[0].chln_no;
//         item.chln_date = chlnDtl.rows[0].chln_date;
//       }

//       // If doc_no starts with M/N/J
//       if (/^[MNJ]/.test(item.doc_no)) {
//         const vendDept = await db.query(
//           `SELECT m.v_name AS dept_vend
//            FROM thmmmchl h, mommvend m
//            WHERE h.doc_no = $1 AND h.v_code = m.v_code`,
//           [item.doc_no]
//         );
//         if (!item.dept_vend && vendDept.rows?.length > 0) {
//           item.dept_vend = vendDept.rows[0].dept_vend;
//         }
//       }

//       // PO rate & discount
//       if (item.po_no) {
//         const poRateRes = await db.query(
//           `SELECT d.po_mat_rat AS po_rate, d.po_disc AS po_disc
//            FROM mhmmpo h, mdmmpoit d
//            WHERE h.po_id = d.po_id AND h.po_no = $1 AND d.it_code = $2`,
//           [item.po_no, it_code]
//         );
//         if (poRateRes.rows?.length > 0) {
//           item.po_rate = poRateRes.rows[0].po_rate;
//           item.po_disc = poRateRes.rows[0].po_disc;
//         }

//         // Standard rate
//         const stndRateRes = await db.query(
//           `SELECT D.total_price AS stnd_rate
//            FROM mdmmratlist D, mHmmratlist H
//            WHERE D.it_code = $1
//              AND H.po_id = (
//                SELECT po_id FROM tdmmrct WHERE it_code = $1 AND mrir_no = $2
//              )
//              AND H.effective_date = (
//                SELECT MAX(H.effective_date)
//                FROM mdmmratlist D, mHmmratlist H
//                WHERE D.it_code = $1
//                  AND H.po_id = (
//                    SELECT po_id FROM tdmmrct WHERE it_code = $1 AND mrir_no = $2
//                  )
//                  AND $3 >= H.effective_date
//                  AND D.ratlist_id = H.ratlist_id
//              )
//              AND D.ratlist_id = H.ratlist_id`,
//           [it_code, item.doc_no, item.chln_date]
//         );
//         if (stndRateRes.rows?.length > 0) {
//           item.stnd_rate = stndRateRes.rows[0].stnd_rate;
//         }
//       }

//       // Balance calculation
//       openingBalance = Number(openingBalance) + Number(item.recp_qty || 0) - Number(item.issu_qty || 0);
//       item.balance = openingBalance

//       total_recp += Number(item.recp_qty || 0);
//       total_issu += Number(item.issu_qty || 0);
//     }

//     // Format result

//     // running the procedure
    
   

//     //fetching the bin kard item


//        const transformData = result.rows.map((row) => ({
//       ...row,
//       doc_date: dateFormater(row.doc_date),
//     }));

//     return res.status(200).json({
//       type: 'success',
//       data: transformData,
//      total_issu: total_issu || 0,
//      total_recp: total_recp || 0,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       type: "error",
//       message: error.message || "Internal Server Error",
//     });
//   }
// });
