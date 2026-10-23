const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../utility/query");
// const { PO_HDR_VALID_COLUMNS, PO_DTL_VALID_COLUMNS } = require("./presentation"); 
//const { dateFormater, dateFormate } = require("../../../../utility/constant");

const { v4: uuidv4 } = require("uuid");
const { transformThmmmchlHdr, transformTdmmmchl, transformTdmmmchlBatch } = require("./presentation");




const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");


const TABLE_NAMES = {
  HDR_TABLE: "THMMMCHL",
  DTL_TABLE: "TDMMMCHL",
  DTL_BATCH_TABLE: "TDMMMCHL_BATCH",
};



const displaySdvMessage = async (db, thmmmchlData) => {
  let v_qty_desp = null;
  let v_qty_recd = null;

  // 1. AUTHORIZED
  if (thmmmchlData.flag === "A") {
    thmmmchlData.auth_message = "AUTHORIZED";
  }

  // 2. PRINTED
  if (thmmmchlData.print_ok === "Y") {
    thmmmchlData.sdv_message = "PRINTED";
  }

  // 3. GATE OUT
  if (thmmmchlData.out_time) {
    thmmmchlData.sdv_message = "GATE OUT";
  }

  // 4. Quantity calculation
  const qtyRes = await db.query(
    `
    SELECT 
      SUM(t.qty_desp) AS qty_desp,
      SUM(t.qty_recd) AS qty_recd
    FROM (
      SELECT 
        c.it_code,
        c.qty_desp,
        SUM(rd.qty_recd) AS qty_recd
      FROM tdmmmchl c
      JOIN thmmmchl r ON r.doc_id = c.doc_id
      JOIN thmmmchlrct rh ON rh.doc_id = r.doc_id
      JOIN tdmmmchlrct rd 
        ON rd.recd_id = rh.recd_id
       AND rd.it_code = c.it_code
      WHERE c.doc_id = $1
      GROUP BY c.it_code, c.qty_desp
    ) t
    `,
    [thmmmchlData.doc_id]
  );

  if (qtyRes.rows.length) {
    v_qty_desp = Number(qtyRes.rows[0].qty_desp);
    v_qty_recd = Number(qtyRes.rows[0].qty_recd || 0);
  }

  // 5. CLOSED / PART CLOSE
  if (v_qty_desp !== null) {
    if (v_qty_recd >= v_qty_desp) {
      thmmmchlData.sdv_message = "CLOSED";
    } else if (v_qty_recd > 0 && v_qty_recd < v_qty_desp) {
      thmmmchlData.sdv_message = "PART CLOSE";
    }
  }

  // 6. CANCELLED (final override)
  if (thmmmchlData.cancel_sdv === "Y") {
    thmmmchlData.sdv_message = "CANCELLED";
  }

  return thmmmchlData;
};

// On Form Render setup initial Data in form
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  let global_user_id = req?.userInfo?.global_user_id || 583; // todo: also remove hardcord user from here

  const { formStatus, appFinYear, appDivisionId } = req?.query;

  //todo hardcode the user_id = 0 rightnow so do remove when user_id work will be do
  // as user id not engage properly with division
  global_user_id = 0; // HARD CODE  // todo remove this line after user_id issue resolved

  if (!global_user_id && !formStatus) {
    return res.status(404).json({ message: "User Not Found" });
  }

  //todo ask this query to jsb/pm sir
  // const po_catList = await db.query(
  //   `select po_cat_description, po_cat_prefix
  //   from mommpcat,mommpocatright
  //   where mommpcat.po_cat_prefix = mommpocatright.po_category
  //   and coalesce(user_code, 'zz') != 'WO'
  //   and mommpocatright.user_id = $1
  //   order by po_cat_description`,
  //   [Number(global_user_id)]
  // );

  try {
    // todo remove this query as it is temporary use above query
    const purpList = await db.query(
      `select description, code from mommcode where cat_group = 'PURP' order by 1`
    );

    const costCList = await db.query(
      `select description, code from mommcode where cat_group = 'COSTC' order by 1`
    );

    const modeOfTransportList = await db.query(
      `select description, code from mommcode where cat_group = 'MOT' order by 1`
    );

    // get the po_id in case of Insert
    let new_doc_id = 0;
    if (formStatus === "Insert") {
      const getDocId = await db.query(
        `SELECT nextval('SEQ_SDV_DOC_ID') as doc_id`
      );
      if (getDocId.rowCount > 0) {
        new_doc_id = getDocId.rows[0].doc_id;
      }
    }

    let gstStateCd;
    if (formStatus === "Insert") {
      const result = await db.query(
        `SELECT s.gst_state_code
      FROM moitstate s
      JOIN moitdivision d 
        ON d.state_id = s.state_id
      WHERE s.type = 'S'
        AND d.division_id = $1
      `,
        [appDivisionId]
      );
      if (result.rowCount === 0) {
        throw new Error('Error in geting Division GST State Code for current Division')
      }

      gstStateCd = result.rows[0].gst_state_code

    }


    return res.status(200).json({
      purpList: purpList.rows,
      costCList: costCList.rows,
      modeOfTransportList: modeOfTransportList.rows,
      // paymentTermList: paymentTermList.rows,
      // workCenterList: workCenterList.rows,
      // priceBasisList: priceBasisList.rows,
      // currencyList: currencyList.rows,
      new_doc_id: new_doc_id,
      gstStateCd,

    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message || "Internal Error" });
  }
});

// For Query Operation
const getRmgpDataOnQuery = async (req, res) => {


  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["doc_no", "doc_date", "po_eff_dt", "po_end_dt"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;
  let transYear = appFinYear || "2025";
  let divisionId = appDivisionId || 1;
  let user_id = userId || req?.userInfo?.user_id || 583; // todo: remove this after resolving the issue of cookies not seted in db

  // console.log(divisionId)
  let thmmmchlData = {};
  let tdmmmchlData = [];

  try {
    let queryParameter = `ORDER BY doc_no desc LIMIT 1 OFFSET ${req.query.offset || 0
      }`;
    let recordCount;
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(doc_id)
         FROM ${TABLE_NAMES.HDR_TABLE}
         where DIVISION_ID = $1 
         AND TRANS_YEAR = $2 
         AND RTN_NONRTN = 'N' 
         AND CHL_TYPE IN ('M', 'W','S')
                 ${queryValues}`,
        [divisionId, transYear]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `
             SELECT COUNT(doc_id)
             FROM ${TABLE_NAMES.HDR_TABLE}
             where DIVISION_ID = $1 
             AND TRANS_YEAR = $2 
             AND RTN_NONRTN = 'N' 
             AND CHL_TYPE IN ('M', 'W','S')`,
            [divisionId, transYear]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY doc_no DESC LIMIT 1";
          break;
        }
        default:
          queryParameter = `ORDER BY doc_no desc LIMIT 1 OFFSET ${req.query.offset || 0
            }`;
          break;
      }
    }
    const rmgpHdr = await db.query(
      ` SELECT *
        FROM ${TABLE_NAMES.HDR_TABLE}
         where DIVISION_ID = $1 
         AND TRANS_YEAR = $2 
         AND RTN_NONRTN = 'N' 
         AND CHL_TYPE IN ('M', 'W','S')
        ${queryParameter}
      `,
      [divisionId, transYear]
    );

    // console.log("user_id and division-id :: ", user_id, divisionId);
    // console.log("mhmmpoamdData :: ", purchaseOrder.rows);

    if (!rmgpHdr.rows.length) {
      return res.status(200).send({
        type: "not found",
        message: "No NRGP data found",
        count: 0,
      });
    }

    // SET NRGP DATA
    thmmmchlData = { ...rmgpHdr.rows[0] };

    const wcId = thmmmchlData.wc_id;
    const okRej = thmmmchlData.ok_rej;


    // ================= POST  QUERY LOGIC =================  


    // 1. row_status
    thmmmchlData.row_status = "X";

    // 2. Vendor / Customer name
    if (thmmmchlData.customer_flag === "Y") {
      const custRes = await db.query(
        `SELECT c_name , gst_no,
        c_add1,
        c_add2,
        c_add3 FROM mosmcust WHERE c_code = $1`,
        [thmmmchlData.v_code]
      );
      if (custRes.rows.length) {
        thmmmchlData.v_name = custRes.rows[0].c_name;
        thmmmchlData.gst_no = custRes.rows[0].gst_no;
        thmmmchlData.v_add1 = custRes.rows[0].c_add1;
        thmmmchlData.v_add2 = custRes.rows[0].c_add2;
        thmmmchlData.v_add3 = custRes.rows[0].c_add3;
        
        thmmmchlData.customer_flag = "Y";
      }
    } else {
      const vendRes = await db.query(
        `SELECT v_name, gst_no,
        v_add1,
        v_add2,
        v_add3 FROM mommvend WHERE v_code = $1`,
        [thmmmchlData.v_code]
      );
      if (vendRes.rows.length) {
        thmmmchlData.v_name = vendRes.rows[0].v_name;
        thmmmchlData.gst_no = vendRes.rows[0].gst_no;
        thmmmchlData.v_add1 = vendRes.rows[0].v_add1;
        thmmmchlData.v_add2 = vendRes.rows[0].v_add2;
        thmmmchlData.v_add3 = vendRes.rows[0].v_add3;
      }
    }

    // 3. PO No
    if (thmmmchlData.po_id) {
      const poRes = await db.query(
        `SELECT po_no FROM mhmmpo WHERE po_id = $1`,
        [thmmmchlData.po_id]
      );
      if (poRes.rows.length) {
        thmmmchlData.po_no = poRes.rows[0].po_no;
      }
    }

    // 4. Work Center details
    if (thmmmchlData.wc_id) {
      const wcRes = await db.query(
        `SELECT wc_no, description 
       FROM mommwc 
       WHERE wc_id = $1`,
        [thmmmchlData.wc_id]
      );
      if (wcRes.rows.length) {
        thmmmchlData.wc_no = wcRes.rows[0].wc_no;
        thmmmchlData.wc_description = wcRes.rows[0].description;
      }
    }

    // 5. Requisition info
    if (thmmmchlData.req_id) {
      const reqRes = await db.query(
        `SELECT h.req_no, u.user_name
       FROM mhmmrmgpreq h
       JOIN user_master u ON h.create_id = u.user_id
       WHERE h.req_id = $1`,
        [thmmmchlData.req_id]
      );
      if (reqRes.rows.length) {
        thmmmchlData.req_no = reqRes.rows[0].req_no;
        thmmmchlData.req_created_by = reqRes.rows[0].user_name;
      }
    }

    // 6. CHL_TYPE UI-equivalent labels
    switch (thmmmchlData.chl_type) {
      case "M":
      case "W":
        thmmmchlData.text_item253 = "Supplier";
        thmmmchlData.item254 = "WO NO";
        break;

      case "S":
        thmmmchlData.text_item253 = "Customer";
        thmmmchlData.item254 = "Service No.";
        break;
    }

    // Apply SDV display logic
    thmmmchlData = await displaySdvMessage(db, thmmmchlData);


    // ## get Tdmmmchl Data
    const rmgpDetails = await db.query(
      `select * from ${TABLE_NAMES.DTL_TABLE} where doc_id = $1`,
      [thmmmchlData.doc_id]
    );

    // POST-QUERY DATA
    if (rmgpDetails.rows.length > 0) {
      await Promise.all(
        rmgpDetails.rows.map(async (item) => {

          if (item.it_code !== null && wcId !== null) {
            let parsedDocDate = thmmmchlData.doc_date;
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

    // ## get TdmmmchlBatch Data
    // const rmgpBatchData = await db.query(
    //   `SELECT * FROM ${TABLE_NAMES.DTL_BATCH_TABLE} WHERE doc_id = $1`,
    //   [thmmmchlData.doc_id]
    // );

    // if (rmgpBatchData.rows.length > 0) {
    //   rmgpBatchData.rows.forEach((item) => {
    //     if (item.batch_date) {
    //       item.batch_date = dateFormater(item.batch_date);
    //     }

    //   });
    // }



    return res.status(200).json({
      type: "found",
      rmgpData: {
        ...thmmmchlData,
        doc_date: dateFormater(thmmmchlData.doc_date),
        ref_date: dateFormater(thmmmchlData.ref_date),
        elec_ref_date: dateFormater(thmmmchlData.elec_ref_date),
      },
      rmgpDetailData: [...rmgpDetails.rows],
    //   rmgpBatchData: [...rmgpBatchData.rows],
      count: recordCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal Error" });
  }
};

// For HelpList
const helpListData = async (req, res) => {
  let {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
    customer_flag
  } = req?.query;

  customer_flag = customer_flag || 'N';
  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  //console.log('customer_flag', customer_flag)

  try {
    if (help_list === "vendor") {
      if (customer_flag === 'N') {


        const vendorList = await db.query(
          `select v_name, v_code, substr(GET_FROM_STATE(V_CITY,'C','N'),1,100) v_city from mommvend  where active = 'Y' order by 1`
        );
        return res.status(200).send(vendorList.rows);
      }
      else if (customer_flag === 'Y') {
        const custList = await db.query(
          `select c_name, c_code, substr(get_from_state(c_city, 'C','N'), 1, 100) c_city
          from vwCUSTActive
          order by 1
        `
        );
        return res.status(200).send(custList.rows);
      }
    } else if (help_list === "po_no") {
      const { f_v_code } = req?.query;
      const poNoList = await db.query(
        ` select a.po_no, a.po_date, b.wc_no, a.po_id, a.wc_id
            from mhmmpo a, mommwc b , mommpcat c
            where a.v_code = $1
            and a.division_id = $2
            and a.wc_id = b.wc_id
            and cancel_flag != 'Y'
            and c.po_cat_prefix = a.category
        `,
        [f_v_code, divisionId]
      );
      if (poNoList.rows.length > 0) {
        res.status(200).json(poNoList.rows);
      }
    } else if (help_list === "wc_no") {
      // const storeList = await db.query(
      //   ` select a.description, a.wc_no, b.wc_id 
      //       from mommwc a, store b
      //       where a.wc_id = b.wc_id 
      //       and b.user_id = 0
      //       and a.division_id = $1
      //       order by a.description
      //   `,
      //   [divisionId]
      // );
      const storeList = await db.query(
        ` select description, wc_no, wc_id from mommwc 
        `
      );

      if (storeList.rows.length > 0) {
        res.status(200).json(storeList.rows);
      }
    } else if (help_list === "it_code") {

      const { f_wc_id } = req?.query;
      console.log('it_code', f_wc_id)

      const itemList = await db.query(
        `select hsn_sac_code,  it_name, a.it_code, fc_code
        from mommitem a, mommstok b
        where a.it_code = b.it_code
          and b.wc_id = $1
          and b.trans_year = $2
        order by 2
        `,
        [f_wc_id, transYear]
      );

      if (itemList.rows.length > 0) {
        res.status(200).json(itemList.rows);
      }
    } else if (help_list === "it_code_po") {
      const { f_po_id, f_v_code } = req?.query;

      const itemList = await db.query(
        `select hsn_sac_code, a.it_code, a.po_um, it_name
          from mdmmpoit a, mhmmpo p, mommitem m
          where p.po_id = $1
          and p.v_code = $2
          and p.po_id = a.po_id
          and m.it_code = a.it_code
          and m.active = 'Y'
        `,
        [f_po_id, f_v_code]
      );

      if (itemList.rows.length > 0) {
        res.status(200).json(itemList.rows);
      }
    }

    else if (help_list === "batch") {
      const { wc_id, doc_date, it_code } = req?.query;

      const batchList = await db.query(
        `SELECT DISTINCT 
    v.batch_no,
    v.batch_date,
    item_current_opening_bal_batch(
        $1::smallint,
        $2::varchar,
        $3::date,
        $4::varchar,
        'O'::varchar,
        v.batch_no::varchar
    ) AS batch_qty
FROM mommstok_batch v
WHERE v.it_code = $2
  AND v.wc_id = $1
  AND v.trans_year = $4
  AND NOT EXISTS (
        SELECT 1
        FROM tommmain_batch a
        WHERE v.it_code = a.it_code
          AND v.wc_id = a.wc_id
          AND v.trans_year = a.trans_year
          AND v.batch_no = a.batch_no
          AND COALESCE(DATE_TRUNC('day', v.batch_date), CURRENT_DATE) =
              COALESCE(DATE_TRUNC('day', a.batch_date), CURRENT_DATE)
    )
  AND item_current_opening_bal_batch(
          $1::smallint,
        $2::varchar,
        $3::date,
        $4::varchar,
        'O'::varchar,
        v.batch_no::varchar
    ) > 0

UNION ALL

SELECT DISTINCT 
    v.batch_no,
    v.batch_date,
    item_current_opening_bal_batch(
         $1::smallint,
        $2::varchar,
        $3::date,
        $4::varchar,
        'O'::varchar,
        v.batch_no::varchar
    ) AS batch_qty
FROM tommmain_batch v
WHERE v.it_code = $2
  AND v.wc_id = $1
  AND v.trans_year = $4
  AND item_current_opening_bal_batch(
        $1::smallint,
        $2::varchar,
        $3::date,
        $4::varchar,
        'O'::varchar,
        v.batch_no::varchar
    ) > 0

ORDER BY batch_no
        `,
        [wc_id, it_code, doc_date, transYear]
      );

      if (batchList.rows.length > 0) {
        res.status(200).json(batchList.rows);
      }
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// for validate vendor code 
// const validateVendorCode = async (req, res) => {
//   let { v_code, customer_flag } = req.query;

//   customer_flag = customer_flag || "N";

//   try {


//     // check blank
//     if (!v_code || v_code.trim() === "") {
//       return res.status(400).json({
//         type: "error",
//         message: "Vendor Code cannot be Blank",
//       });
//     }

//     let partyQuery;

//     // Vendor Logic
//     if (customer_flag === "N") {
//       partyQuery = await db.query(
//         `SELECT v_name AS name 
//          FROM mommvend
//          WHERE v_code = $1
//          AND COALESCE(active,'N') = 'Y'`,
//         [v_code]
//       );

//       if (partyQuery.rowCount === 0) {
//         return res.status(400).json({
//           type: "error",
//           message: "Supplier does not exist / or not Active",
//         });
//       }
//     }

//     // Customer Logic
//     else if (customer_flag === "Y") {
//       partyQuery = await db.query(
//         `SELECT c_name AS name 
//          FROM mosmcust
//          WHERE c_code = $1
//          AND COALESCE(active,'N') = 'Y'`,
//         [v_code]
//       );

//       if (partyQuery.rowCount === 0) {
//         return res.status(400).json({
//           type: "error",
//           message: "Supplier does not exist / or not Active",
//         });
//       }
//     }

//     const party = partyQuery.rows[0];

//     // GST Validation

//     let gstNo;

//     if (customer_flag === "Y") {
//       const gstQuery = await db.query(
//         `SELECT gst_no 
//      FROM mosmcust
//      WHERE c_code = $1
//      AND COALESCE(active,'N') = 'Y'`,
//         [v_code]
//       );

//       if (!gstQuery.rows[0]?.gst_no) {
//         return res.status(400).json({
//           type: "error",
//           message: "Customer GST Number cannot be left blank",
//         });
//       }

//       gstNo = gstQuery.rows[0].gst_no;
//     }

//     if (customer_flag === "N") {
//       const gstQuery = await db.query(
//         `SELECT gst_no 
//      FROM mommvend
//      WHERE v_code = $1
//      AND COALESCE(active,'N') = 'Y'`,
//         [v_code]
//       );

//       if (!gstQuery.rows[0]?.gst_no) {
//         return res.status(400).json({
//           type: "error",
//           message: "Vendor GST Number cannot be left blank",
//         });
//       }

//       gstNo = gstQuery.rows[0].gst_no;
//     }

//     return res.status(200).json({
//       data: {
//         v_name: party.name,
//         gst_no: gstNo,
//         v_add1: party.v_add1,
//         v_add2: party.v_add2,
//         v_add3: party.v_add3,
//       },
//       //  message: "Validation successful",
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       type: "error",
//       message: error.message,
//     });
//   }
// };

// above comment validateVendorCode function is correct comment  by akshay but we can do with single query instead of two query for gst no.
//  so i have written new function with single query for gst no. validation and also return address in response
//  which is required in frontend

const validateVendorCode = async (req, res) => {
  let { v_code, customer_flag } = req.query;

  customer_flag = customer_flag || "N";

  try {

    if (!v_code || v_code.trim() === "") {
      return res.status(400).json({
        type: "error",
        message: "Vendor Code cannot be Blank",
      });
    }

    let partyQuery;

    // ================= VENDOR =================
    if (customer_flag === "N") {

      partyQuery = await db.query(
        `SELECT 
            v_name AS name,
            gst_no,
            v_add1 AS add1,
            v_add2 AS add2,
            v_add3 AS add3
         FROM mommvend
         WHERE v_code = $1
         AND COALESCE(active,'N') = 'Y'`,
        [v_code]
      );

      if (partyQuery.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "Supplier does not exist / or not Active",
        });
      }
    }

    // ================= CUSTOMER =================
    else if (customer_flag === "Y") {

      partyQuery = await db.query(
        `SELECT 
            c_name AS name,
            gst_no,
            c_add1 AS add1,
            c_add2 AS add2,
            c_add3 AS add3
         FROM mosmcust
         WHERE c_code = $1
         AND COALESCE(active,'N') = 'Y'`,
        [v_code]
      );

      if (partyQuery.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "Supplier does not exist / or not Active",
        });
      }
    }

    const party = partyQuery.rows[0];

    // GST Validation
    if (!party.gst_no) {
      return res.status(400).json({
        type: "error",
        message:
          customer_flag === "Y"
            ? "Customer GST Number cannot be left blank"
            : "Vendor GST Number cannot be left blank",
      });
    }

    return res.status(200).json({
      data: {
        v_name: party.name,
        gst_no: party.gst_no,
        add1: party.add1,
        add2: party.add2,
        add3: party.add3,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// for validate pono 

const validatePoNo = async (req, res) => {
  let { v_code, chl_type, po_no, serv_call_id, appDivisionId } = req.query;

  try {

    let wc_id = null;
    let po_id = null;
    let wc_no = null;


    //Work Order

    if (chl_type === "W") {
      if (!po_no) {
        return res.status(400).json({
          type: "error",
          message: "WO No. cannot be left Blank",
        });
      }

      const result = await db.query(
        `SELECT cancel_flag, category, wc_id, po_id
         FROM mhmmpo
         WHERE po_no = $1
         AND v_code = $2
         AND division_id = $3`,
        [po_no, v_code, appDivisionId]
      );

      if (result.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "WO No. does not exist for this Supplier",
        });
      }

      const row = result.rows[0];

      if (row.cancel_flag === "Y") {
        return res.status(400).json({
          type: "error",
          message: "WO has already been Cancelled",
        });
      }

      wc_id = row.wc_id;
      po_id = row.po_id;
    }


    // Purchase Order

    if (chl_type === "M") {
      if (!po_no) {
        return res.status(400).json({
          type: "error",
          message: "PO No. cannot be left Blank",
        });
      }

      const result = await db.query(
        `SELECT cancel_flag, category, wc_id, po_id
         FROM mhmmpo
         WHERE po_no = $1
         AND v_code = $2
         AND division_id = $3`,
        [po_no, v_code, appDivisionId]
      );

      if (result.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "PO No. does not exist for this Supplier",
        });
      }

      const row = result.rows[0];

      if (row.cancel_flag === "Y") {
        return res.status(400).json({
          type: "error",
          message: "PO has already been Cancelled",
        });
      }

      wc_id = row.wc_id;
      po_id = row.po_id;
    }


    // Service Call (S)
    if (chl_type === "S") {
      if (!serv_call_id) {
        return res.status(400).json({
          type: "error",
          message: "Service no. must be entered",
        });
      }

      const result = await db.query(
        `SELECT serv_call_id, serv_call_no
         FROM thsvcall
         WHERE serv_call_id = $1
         AND close_date IS NULL
         AND division_id = $2
         AND c_code = $3`,
        [serv_call_id, appDivisionId, v_code]
      );

      if (result.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "Service no. not exists or Closed",
        });
      }
    }

    // Fetch WC No
    if (wc_id) {
      const wcResult = await db.query(
        `SELECT wc_no FROM mommwc WHERE wc_id = $1`,
        [wc_id]
      );

      if (wcResult.rowCount > 0) {
        wc_no = wcResult.rows[0].wc_no;
      }
    }

    const result = await db.query(
      `SELECT nextval('SEQ_SDV_DOC_ID') AS doc_id`
    );

    const doc_id = result.rows[0].doc_id;

    return res.status(200).json({
      data: {
        wc_id,
        po_id,
        wc_no,
        doc_id
      },
      //message: "Validation successful",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// for validate wc no 
const validateWcNo = async (req, res) => {
  let { wc_id, wc_no, nonkardex_flag, appUserId } = req.query;
  console.log(wc_id, appUserId)

  try {

    if (!wc_id) {
      return res.status(400).json({
        type: "error",
        message: "Store cannot be blank",
      });
    }

    // Check in mommwc

    const wcCheck = await db.query(
      `SELECT 1 
       FROM mommwc
       WHERE wc_no = $1
       AND store_process = 'S'`,
      [wc_no]
    );

    if (wcCheck.rowCount === 0) {
      return res.status(400).json({
        type: "error",
        message: "Store does not exist",
      });
    }

    // Check in store table

    const storeCheck = await db.query(
      `SELECT *
       FROM store
       WHERE wc_id = $1
       AND user_id = $2`,
      [wc_id, appUserId]
    );

    if (storeCheck.rowCount === 0) {
      console.log('store', storeCheck.rowCount)
      return res.status(400).json({
        type: "error",
        message: "User does not exist in Store",
      });
    }


    return res.status(200).json({
      //message: "Validation successful",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// for validate item code

const getValidateItemData = async (req, res) => {
  let {
    it_code,
    wc_id,
    doc_id,
    po_id,
    v_code,
    chl_type,
    nonkardex_flag,
    appFinYear,
    ok_rej,
    appDivisionId
  } = req.query;

  try {
    let itemData = {};
    let store_stock = 0;
    let rate = 0;

    // AUTO GEN CHECK
    const autoGen = await db.query(
      `SELECT auto_gen_it FROM tdmmmchl 
       WHERE doc_id = $1 LIMIT 1`,
      [doc_id]
    );

    const auto_gen_it = autoGen.rows[0]?.auto_gen_it;

    // M / S Logic
    if (["M", "S"].includes(chl_type) && nonkardex_flag === "N") {

      if (auto_gen_it === "Y") {
        return res.status(400).json({
          type: "error",
          message: "You cannot Take both Kardex and Non kardex item",
        });
      }

      // ITEM MASTER CHECK
      const itemRes = await db.query(
        `SELECT m.it_name, m.um_code, m.hsn_sac_code,
        md.it_rate
         FROM mommitem m
         left join mdmmvend md
         on md.it_code = m.it_code
         WHERE m.it_code = $1
          and md.rate_eff_dt = (select max(rate_eff_dt) from mdmmvend d2 where d2.it_code = m.it_code and rate_eff_dt <= current_date)`,
        [it_code]
      );

      console.log("itemRes",itemRes.rows)

      if (itemRes.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "Item code does not exist in Master",
        });
      }

      const item = itemRes.rows[0];

      itemData = {
        it_name: item.it_name,
        um_code: item.um_code,
        hsn_sac_code: item.hsn_sac_code,
        rate: item.it_rate
      };

      // STOCK ACCESS CHECK
      const stockCheck = await db.query(
        `SELECT 1 FROM mommstok
         WHERE it_code = $1
         AND wc_id = $2
         LIMIT 1`,
        [it_code, wc_id]
      );

      if (stockCheck.rowCount === 0) {
        return res.status(400).json({
          type: "error",
          message: "You cannot access this item",
        });
      }
    }

    // DUPLICATE CHECK

    const dupCheck = await db.query(
      `SELECT 1 FROM tdmmmchl
       WHERE doc_id = $1
       AND it_code = $2`,
      [doc_id, it_code]
    );

    if (dupCheck.rowCount > 0) {
      return res.status(400).json({
        type: "error",
        message: "Item already exists",
      });
    }

    // WORK ORDER VALIDATION

    // if (chl_type === "W" && auto_gen_it === "N") {
    //   let exists = false;

    //   const check1 = await db.query(
    //     `SELECT 1
    //      FROM mdmmpowo a
    //      JOIN mhmmpo p ON p.po_id = a.po_id
    //      WHERE p.po_id = $1
    //      AND p.v_code = $2
    //      AND a.it_code = $3`,
    //     [po_id, v_code, it_code]
    //   );

    //   if (check1.rowCount > 0) exists = true;

    //   if (!exists) {
    //     const check2 = await db.query(
    //       `SELECT 1
    //        FROM mommsubcwo b
    //        JOIN mhmmpo m ON m.po_id = b.po_id
    //        WHERE m.po_id = $1
    //        AND m.v_code = $2
    //        AND b.rm_code = $3`,
    //       [po_id, v_code, it_code]
    //     );

    //     if (check2.rowCount > 0) exists = true;
    //   }

    //   if (!exists) {
    //     return res.status(400).json({
    //       type: "error",
    //       message: "Item does not exist in this Work Order",
    //     });
    //   }
    // }

    const rateRes = await db.query(
      `SELECT fill_item_rate(
    $1::varchar,
    $2::varchar,
    $3::varchar,
    $4::varchar,
    $5::varchar,
    $6::integer,
    $7::varchar
  ) AS rate`,
      [
        chl_type,
        nonkardex_flag,
        it_code,
        po_id,
        v_code,
        appDivisionId,
        appFinYear
      ]
    );

    // rate = item.it_rate

    // STOCK FUNCTION
    if (nonkardex_flag === "N") {
      const stockRes = await db.query(
        `SELECT integral.item_current_opening_bal(
           $1::smallint,
           $2::varchar,
           now()::date,
           $3::varchar,
           $4::varchar
         ) AS stock`,
        [wc_id, it_code, appFinYear, ok_rej]
      );

      store_stock = stockRes.rows[0]?.stock || 0;
    }

    return res.status(200).json({
      data: {
        ...itemData,
        // rate,
        store_stock,
      },
      //message: "Validation successful",
    });

  } catch (err) {
    console.error("Error in getValidateItemData:", err);
    return res.status(500).json({
      type: "error",
      message: err.message || "Internal server error",
    });
  }
};

// for validate qty_desp

const validateQtyDesp = async (req, res) => {
  let { chl_type, NONKARDEX_FLAG, ok_rej, appFinYear } = req.query;

  let {
    wc_id,
    it_code,
    store_stock,
    qty_desp,
    rate,
    di_formstatus,
  } = req.body;

  try {

    qty_desp = Number(qty_desp);
    rate = Number(rate);
    store_stock = store_stock != null ? Number(store_stock) : null;

    // Fetch store stock if null
    if (["M", "S"].includes(chl_type)) {
      if (store_stock == null) {
        const stockRes = await db.query(
          `SELECT integral.item_current_opening_bal(
             $1::smallint,
             $2::varchar,
             now()::date,
             $3::varchar,
             $4::varchar
           ) AS stock`,
          [wc_id, it_code, appFinYear, ok_rej]
        );

        store_stock = stockRes.rows[0]?.stock || 0;
      }
    }

    // qty_desp validations
    if (qty_desp === null) {
      return res.status(400).json({
        type: "error",
        message: "Despatch qty cannot be empty",
      });
    }

    if (qty_desp < 0) {
      return res.status(400).json({
        type: "error",
        message: "Despatch qty cannot be negative",
      });
    }

    if (qty_desp === 0) {
      return res.status(400).json({
        type: "error",
        message: "Despatch qty cannot be zero",
      });
    }

    // Stock validation
    if (["M", "S"].includes(chl_type)) {
      if (NONKARDEX_FLAG === "N") {
        if ((store_stock || 0) < (qty_desp || 0)) {
          return res.status(400).json({
            type: "error",
            message: "Despatch qty cannot be greater than Store Stock",
          });
        }
      }
    }

    // Amount calculation
    let amount = 0;
    if (["INSERT", "UPDATE"].includes(di_formstatus)) {
      if ((rate || 0) > 0) {
        amount = qty_desp * rate;
      }
    }

    return res.status(200).json({
      type: "success",
      data: {
        store_stock,
        qty_desp,
        amount,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// for validate amount  

const validateAmount = async (req, res) => {

  let {
    it_code,
    rate,
    hsn_sac_code,
    v_code,
    po_id,
    appDivisionId,
    gst_amt_prc,
    amount
  } = req.query;

  try {

    const result = await db.query(
      `SELECT proc_dive_gst_state_code($1) AS gst_state_code`,
      [appDivisionId]
    );

    const gstStateCode = result.rows[0].gst_state_code;
    //console.log("division_id", appDivisionId, gstStateCode)

    // call function
    const gstResult = await db.query(
      `SELECT * FROM integral.fill_gst_dtl_itemwise_rmgp($1,$2,$3,$4,$5,$6,$7)`,
      [
        hsn_sac_code,
        v_code,
        po_id,
        it_code,
        amount,
        gstStateCode,
        gst_amt_prc
      ]
    );

    const gstData = gstResult.rows[0];

    return res.json({
      type: "success",
      gst: gstData
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// validate batch no 

const validateBatchNo = async (req, res) => {

  let {
    it_code,
    batch_no,
    batch_date,
    doc_date,
    trans_year,
    ok_rej,
    doc_id
  } = req.body;

  try {

    if (batch_no) {

      // Check batch control
      const batchControlRes = await db.query(
        `SELECT chk_it_batch_control($1) AS flag`,
        [it_code]
      );

      const batchControl = batchControlRes.rows[0]?.flag;

      //  FIFO validation
      if (batch_date && batchControl === "Y") {

        const fifoRes = await db.query(
          `SELECT * FROM check_fifo_batch($1,$2,$3,$4,$5,$6)`,
          [it_code, wc_id, batch_date, ok_rej, trans_year, doc_date]
        );

        const fifoData = fifoRes.rows[0];

        if (fifoData?.check_fifo_batch === true) {
          return res.json({
            type: "warning",
            message: `Prior date batch ${fifoData.vbatch_no}-${fifoData.vfifo_dt} exists`
          });
        }
      }

      // Get batch store quantity
      const qtyRes = await db.query(
        `SELECT item_current_opening_bal_batch( $1::smallint,
        $2::varchar,
        $3::date,
        $4::varchar,
        $5::varchar,
        v.batch_no::varchar
          ) AS batch_store_qty`,
        [wc_id, it_code, doc_date, trans_year, ok_rej]
      );

      const batch_store_qty = qtyRes.rows[0]?.batch_store_qty;

      //  Check duplicate batch
      const duplicateRes = await db.query(
        `SELECT rowid FROM tdmmmchl_batch 
           WHERE doc_id = $1 AND it_code = $2 AND batch_no = $3`,
        [doc_id, it_code, batch_no]
      );

      if (duplicateRes.rows.length > 0) {
        return res.json({
          type: "error",
          message: "Batch already exist"
        });
      }

      //  Fetch location rack/bin
      let loca_rack_bin_desc = null;


      const locRes = await db.query(
        `SELECT PHYSICAL_LOCA || RACK_NO || BIN_NO AS loca
             FROM MDMMSTOK_LOCATION
             WHERE WC_ID = $1
               AND IT_CODE = $2
               AND trans_year = $3
             LIMIT 1`,
        [wc_id, it_code, trans_year]
      );

      loca_rack_bin_desc = locRes.rows[0]?.loca || null;


      return res.json({
        type: "success",
        batch_store_qty,
        loca_rack_bin_desc
      });

    } else {

      const flagRes = await db.query(
        `SELECT get_item_batch_control_flag($1) AS flag`,
        [it_code]
      );

      if (flagRes.rows[0]?.flag === "Y") {
        return res.json({
          type: "error",
          message: "Batch No must for this item"
        });
      }
    }


    return res.json({ type: "success" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// validate physical location 

const validatePhysical = async (req, res) => {

  let {
    it_code,
    loca_rack_bin_desc,
    appFinYear,
  } = req.body;

  try {

    // 1. VALIDATION PART

    if (loca_rack_bin_desc) {

      const locCheck = await db.query(
        `SELECT 1 
           FROM MDMMSTOK_LOCATION
           WHERE WC_ID = $1
             AND IT_CODE = $2
             AND trans_year = $3
             AND (PHYSICAL_LOCA || RACK_NO || BIN_NO) = $4`,
        [wc_id, it_code, appFinYear, loca_rack_bin_desc]
      );

      if (locCheck.rows.length === 0) {
        return res.json({
          type: "error",
          message: "This item not associated with this location in Item location master"
        });
      }
    }

    return res.json({
      type: "success",

    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

// handle post data 

const postRmgpDetails = async (req, res) => {
  try {
    await db.query("BEGIN");

    const {
      formData,
      detailData,
      // batchData,
      transYear,
      divisionId,
    } = req.body;

    const docId = formData.doc_id;

    // Validation
    if (!Array.isArray(detailData) || detailData.length === 0) {
      throw new Error("No detail entries provided.");
    }

    // Defaults
    formData.ok_rej = formData.ok_rej || "O";
    // formData.doc_no = `~${docId}`;
    formData.dlvr_note_no = docId;
    formData.rtn_nonrtn = formData.rtn_nonrtn || "N";


    if (!req.body.user_wc_id) {
      req.body.user_wc_id = formData.wc_id;
    }

    // Batch validation
    // await db.query(`CALL valid_batch_qty($1)`, [docId]);

    // Generate Delivery Note
    const dlvrRes = await db.query(
      `SELECT GENDLVRNOTE($1,$2,$3) AS dlvr_no`,
      [transYear, divisionId, "BIPL"]
    );
    formData.dlvr_note_no = dlvrRes.rows[0].dlvr_no;

    // Default chl_type
    if (!formData.chl_type || formData.chl_type.trim() === "") {
      formData.chl_type = "M";
    }

    //  Trans code mapping
    const transCodeMap = { J: 53, W: 54, M: 55 };
    formData.trans_code =
      transCodeMap[formData.chl_type] || formData.trans_code;

    //  Generate DOC_NO
    const docRes = await db.query(
      `SELECT integral.gensdvno(
        $1::bigint,
        $2::smallint,
        $3::varchar,
        $4::bigint,
        $5::varchar,
        $6::smallint,
        $7::varchar
      ) AS doc_no`,
      [
        formData.po_id,
        formData.wc_id,
        transYear,
        divisionId,
        formData.ok_rej,
        formData.trans_code,
        formData.chl_type,
      ]
    );

    const docNo = docRes?.rows?.[0]?.doc_no;

    //  Strict validation
    if (!docNo || docNo.toString().trim() === "") {
      throw new Error("DOC_NO generation failed");
    }

    formData.doc_no = docNo;
    const wcId = formData.wc_id;
    const poId = formData.po_id;

    console.log('id', wcId, poId)


    // INSERT HEADER
    const thmmmchlData = transformThmmmchlHdr(
      {
        ...formData,
        doc_id: docId,
        trans_year: transYear,
        division_id: divisionId,
        doc_no: docNo,
      },
      req.user
    );

    const insertHdrQuery = generateSingleInsertQuery(
      TABLE_NAMES.HDR_TABLE,
      thmmmchlData
    );

    // console.log('thmmmchlData data to log is_gst_type',thmmmchlData)

    const hdrResult = await db.query(
      insertHdrQuery,
      Object.values(thmmmchlData)
    );

    

    if (hdrResult.rowCount === 0) {
      throw new Error("Failed to insert header data.");
    }

    //  INSERT DETAILS
    for (const row of detailData) {
      const tdmmchlData = transformTdmmmchl(
        row,
        docId,
        wcId,
        poId
      );

      const query = generateSingleInsertQuery(
        TABLE_NAMES.DTL_TABLE,
        tdmmchlData
      );

      await db.query(query, Object.values(tdmmchlData));
    }

    //  INSERT BATCH
    // for (const row of batchData || []) {
    //   const batchInsertData = transformTdmmmchlBatch(row, docId);

    //   const query = generateSingleInsertQuery(
    //     TABLE_NAMES.DTL_BATCH_TABLE,
    //     batchInsertData
    //   );

    //   await db.query(query, Object.values(batchInsertData));
    // }

    // Conditional Procedure
    if (["M", "S"].includes(formData.chl_type)) {

      const hasManualItem = detailData.some(
        (row) => row.auto_gen_it === "N"
      );

      if (hasManualItem) {
        console.log(
          "call procedure update_table",
          "auto_gen_it found in detail",
          "chl_type",
          formData.chl_type
        );

        await db.query(`CALL Procedure_update_table($1, $2)`, [
          docId,
          formData.chl_type,
        ]);
      }
    }

    //  CALCULATE TOTALS
    const totalsRes = await db.query(
      `SELECT * FROM CALC_TOTALS($1::bigint)`,
      [docId]
    );

    const totals = totalsRes.rows[0];

    console.log("Totals:", totals);

    //  UPDATE HEADER TOTALS
    await db.query(
      `UPDATE thmmmchl SET 
        t_ass_val = $1,
        t_sgst_amt = $2,
        t_sgst_cess_amt = $3,
        t_ugst_amt = $4,
        t_ugst_cess_amt = $5,
        t_cgst_amt = $6,
        t_cgst_cess_amt = $7,
        t_igst_amt = $8,
        t_igst_cess_amt = $9,
        t_comp_cess_amt = $10
      WHERE doc_id = $11`,
      [
        totals.t_ass_val,
        totals.t_sgst_amt,
        totals.t_sgst_cess_amt,
        totals.t_ugst_amt,
        totals.t_ugst_cess_amt,
        totals.t_cgst_amt,
        totals.t_cgst_cess_amt,
        totals.t_igst_amt,
        totals.t_igst_cess_amt,
        totals.t_comp_cess_amt,
        docId,
      ]
    );

    //  COMMIT
    await db.query("commit");

    return res.status(200).json({
      message: `RMGP NO ${formData.doc_no} is generated`,
      doc_no: formData.doc_no,
      doc_id: docId,
    });

  } catch (error) {
    console.error("Error:", error.message);

    await db.query("ROLLBACK");

    return res.status(500).json({
      message: error.message,
    });
  }
};


// handle update data 

const updateRmgpDetails = async (req, res) => {
  const {
    formData,
    detailData,
    // batchData,
    appUserId,
    transYear,
    divisionId,
    deletedItemRecord,
    deletedBatchRecord
  } = req.body;

  // Get wcId
  const wcId = formData?.wc_id ?? null;
  const poId = formData?.po_id ?? null;
  const docId = formData?.doc_id ?? null;

  if (formData.nonkardex_flag === 'N') {

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
        console.error("User/Store is not matching");
        return false;
      }
    };
  }

  //  call proc_dive_gst_state_code    

  const result = await db.query(`select 1 from proc_dive_gst_state_code($1) as state_code`, [divisionId])

  const state_code = result.rows[0].state_code


  try {
    await db.query("BEGIN");


    //--------------------------- handle header data update -------------------------  

    // 1) Transform incoming formData to DB columns
    const dbRecord = transformThmmmchlHdr(formData);

    // 2) Extract column names and values
    const columns = Object.keys(dbRecord);
    const values = Object.values(dbRecord);

    // 3) Build SET clause dynamically
    const setClause = columns
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");

    // 4) Final update query
    const query = `
          UPDATE ${TABLE_NAMES.HDR_TABLE}
             SET ${setClause}
           WHERE doc_id = $${columns.length + 1}
        `;

    console.log("UPDATE QUERY =>", query);

    // 5) Execute query
    await db.query(query, [
      ...values,
      formData.doc_id,
    ]);


    //-------------------------------- Handle detailData UPDATE-------------------------------------
    if (Array.isArray(detailData) && detailData.length) {
      for (const record of detailData) {

        // Always assign from header
        record.doc_id = docId;
        record.wc_id = wcId;
        record.po_id = poId;

        // FIXED (pass params)
        const mapped = transformTdmmmchl(record, docId, wcId, poId);

        const { row_id, ...dbRecord } = mapped;

        // delete dbRecord.doc_id;
        // delete dbRecord.it_code;

        // -------------------- UPDATE --------------------
        if (record.init_it_code) {  

        console.log('init it code', record.init_it_code)

          console.log("UPDATE record =>", record);

          const columns = Object.keys(dbRecord);
          const values = Object.values(dbRecord);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `
        UPDATE ${TABLE_NAMES.DTL_TABLE}
        SET ${setClause}
        WHERE doc_id = $${columns.length + 1}
        AND it_code = $${columns.length + 2} 
      
      `;

          await db.query(query, [
            ...values,
            docId,
            record.init_it_code,
            
          ]);
        }

        // -------------------- INSERT --------------------
        else {

          console.log("INSERT record =>", record);

          delete record.row_id;
          delete record.store_stock;
          delete record.init_it_code;
          delete record.total_amt;
          delete record.total_gst;
          delete record.gross_amt;

          record.doc_id = docId;
          record.wc_id = wcId;
          record.po_id = poId;

          // FIXED (pass params)
          const insertData = transformTdmmmchl(record, docId, wcId, poId);

          const query = generateSingleInsertQuery(
            TABLE_NAMES.DTL_TABLE,
            insertData
          );

          const values = Object.values(insertData);

          console.log("FINAL INSERT VALUES =>", values);

          await db.query(query, values);
        }
      }
    }
    // Handle detail record DELETE
    if (Array.isArray(deletedItemRecord) && deletedItemRecord.length) {
      for (const d of deletedItemRecord) {
        await db.query(
          `DELETE FROM ${TABLE_NAMES.DTL_TABLE}
              WHERE doc_id = $1 and it_code = $2`,
          [d.doc_id, d.init_it_code]
        );
      }
    } else if (deletedItemRecord) {
      await db.query(
        `DELETE FROM ${TABLE_NAMES.DTL_TABLE}
            WHERE doc_id = $1 and it_code = $2`,
        [deletedItemRecord.doc_id, deletedItemRecord.init_it_code]
      );
    }


    // -------------------------------- Handle batchData UPDATE-----------------------------  

    // if (Array.isArray(batchData) && batchData.length) {
    //   for (const record of batchData) {

    //     record.doc_id = docId;

    //     // pass docId
    //     const mapped = transformTdmmmchlBatch(record, docId);

    //     const { row_id, ...dbRecord } = mapped;

    //     // -------------------- UPDATE --------------------
    //     if (record.init_batch_no) {

    //       console.log('UPDATE record =>', record);

    //       const columns = Object.keys(dbRecord);
    //       const values = Object.values(dbRecord);

    //       const setClause = columns
    //         .map((col, i) => `${col} = $${i + 1}`)
    //         .join(", ");

    //       const query = `
    //     UPDATE ${TABLE_NAMES.DTL_BATCH_TABLE}
    //     SET ${setClause}
    //     WHERE doc_id = $${columns.length + 1}
    //     AND batch_no = $${columns.length + 2}
    //   `;

    //       await db.query(query, [
    //         ...values,
    //         docId,
    //         record.init_batch_no
    //       ]);
    //     }

    //     // -------------------- INSERT --------------------
    //     else {

    //       console.log('INSERT record =>', record);

    //       // Clean UI fields
    //       delete record.row_id;
    //       delete record.batch_store_qty;
    //       delete record.init_batch_no;
    //       delete record.tot_batch_qty;

    //       record.doc_id = docId;

    //       //  pass docId
    //       const insertData = transformTdmmmchlBatch(record, docId);

    //       const query = generateSingleInsertQuery(
    //         TABLE_NAMES.DTL_BATCH_TABLE,
    //         insertData
    //       );

    //       const values = Object.values(insertData);

    //       console.log("FINAL BATCH INSERT VALUES =>", values);

    //       await db.query(query, values);
    //     }
    //   }
    // }

    // Handle batch record DELETE
    // if (Array.isArray(deletedBatchRecord) && deletedBatchRecord.length) {
    //   for (const d of deletedBatchRecord) {
    //     await db.query(
    //       `DELETE FROM ${TABLE_NAMES.DTL_BATCH_TABLE}
    //           WHERE doc_id = $1 and batch_no = $2`,
    //       [d.doc_id, d.init_batch_no]
    //     );
    //   }
    // } else if (deletedBatchRecord) {
    //   await db.query(
    //     `DELETE FROM ${TABLE_NAMES.DTL_BATCH_TABLE}
    //         WHERE doc_id = $1 and batch_no = $2`,
    //     [deletedBatchRecord.doc_id, deletedBatchRecord.init_batch_no]
    //   );
    // }

    // handle procedure  ----------------------------   

    // Conditional Procedure
    if (["M", "S"].includes(formData.chl_type)) {

      const hasManualItem = detailData.some(
        (row) => row.auto_gen_it === "N"
      );

      if (hasManualItem) {
        console.log("Calling Procedure_update_table...");
        console.log("docId:", docId, "chl_type:", formData.chl_type);


        await db.query(`CALL Procedure_update_table($1, $2)`, [
          docId,
          formData.chl_type,
        ]);


        console.log("Procedure_update_table executed successfully");
      }
    }

    //  CALCULATE TOTALS
    const totalsRes = await db.query(
      `SELECT * FROM CALC_TOTALS($1::bigint)`,
      [docId]
    );

    const totals = totalsRes.rows[0];

    console.log("Totals:", totals);

    //  UPDATE HEADER TOTALS
    await db.query(
      `UPDATE thmmmchl SET 
        t_ass_val = $1,
        t_sgst_amt = $2,
        t_sgst_cess_amt = $3,
        t_ugst_amt = $4,
        t_ugst_cess_amt = $5,
        t_cgst_amt = $6,
        t_cgst_cess_amt = $7,
        t_igst_amt = $8,
        t_igst_cess_amt = $9,
        t_comp_cess_amt = $10
      WHERE doc_id = $11`,
      [
        totals.t_ass_val,
        totals.t_sgst_amt,
        totals.t_sgst_cess_amt,
        totals.t_ugst_amt,
        totals.t_ugst_cess_amt,
        totals.t_cgst_amt,
        totals.t_cgst_cess_amt,
        totals.t_igst_amt,
        totals.t_igst_cess_amt,
        totals.t_comp_cess_amt,
        docId,
      ]
    );

    await db.query("COMMIT");
    res.status(200).send({ status: "Successfully updated" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(" Error updating department master:", err);
    res.status(500).send({ error: err.message });
  }

};

exports.deleteRmgpData = catchAsync(async (req, res, next) => {
  const { formData, appUserId, appFinYear, appDivisionId } = req.body;

  if (!formData?.doc_id) {
    return res.status(400).json({ message: "doc_id is required." });
  }

  try {
    await db.query("BEGIN");

    // Check user-store mapping
    const checkUserStore = async (userId, wcId) => {
      const result = await db.query(
        `SELECT 1 FROM store WHERE user_id = $1 AND wc_id = $2`,
        [userId, wcId]
      );
      return result.rows.length > 0;
    };

    const isValidUser = await checkUserStore(appUserId, formData.wc_id);

    if (!isValidUser) {
      await db.query("ROLLBACK");
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Check if record exists
    const { rows } = await db.query(
      `SELECT * FROM ${TABLE_NAMES.HDR_TABLE} WHERE doc_id = $1`,
      [formData.doc_id]
    );

    if (rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "SDV entry not found." });
    }

    const existingRecord = rows[0];

    //  Business validations (extra safety from backend)
    if (existingRecord.cancel_sdv === "Y") {
      await db.query("ROLLBACK");
      return res.status(400).json({ message: "SDV already cancelled." });
    }

    if (existingRecord.print_ok === "Y") {
      await db.query("ROLLBACK");
      return res.status(400).json({ message: "SDV already printed." });
    }

    if (existingRecord.r57f_ref) {
      await db.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "R57F4 Ref. no. already exists." });
    }

    //Delete

    // 1. Batch table
    await db.query(
      `DELETE FROM ${TABLE_NAMES.DTL_BATCH_TABLE} WHERE doc_id = $1`,
      [formData.doc_id]
    );

    // 2. Detail table
    await db.query(
      `DELETE FROM ${TABLE_NAMES.DTL_TABLE} WHERE doc_id = $1`,
      [formData.doc_id]
    );

    // 3. Header table
    await db.query(
      `DELETE FROM ${TABLE_NAMES.HDR_TABLE} WHERE doc_id = $1`,
      [formData.doc_id]
    );


    // procedure cancel_sdv;

    if (formData.chl_type === 'J') {
      await db.query(
        `DELETE FROM TOMMSUBC WHERE division_id = $1 AND trans_year = $2 AND doc_no = $3 AND trans_code = $4`,
        [appDivisionId, appFinYear, formData.doc_no, formData.trans_code]
      );
    }

    // tommmain_batch table

    await db.query(
      `DELETE FROM tommmain_batch WHERE division_id = $1 AND trans_year = $2 AND doc_no = $3 AND trans_code = $4`,
      [appDivisionId, appFinYear, formData.doc_no, formData.trans_code]
    );

    // tommmain table  

    await db.query(
      `DELETE FROM tommmain WHERE division_id = $1 AND trans_year = $2 AND doc_no = $3 AND trans_code = $4`,
      [appDivisionId, appFinYear, formData.doc_no, formData.trans_code]
    );


    await db.query("COMMIT");

    return res.status(200).json({
      message: "RMGP entry deleted successfully.",
      doc_id: formData.doc_id,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error during RMGP deletion:", error);

    return res.status(500).json({
      message: "Internal server error during deletion.",
    });
  }
});



exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getRmgpDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});



exports.handleValidateData = catchAsync(async (req, res, next) => {
  const { param } = req.query;
  if (param === "it_code") {
    await getValidateItemData(req, res);
    return;
  }

  if (param === "v_code") {
    await validateVendorCode(req, res);
  }

  if (param === "po_no") {
    await validatePoNo(req, res);
  }
  if (param === "wc_no") {
    await validateWcNo(req, res);
  }

  if (param === "qty_desp") {
    await validateQtyDesp(req, res);
  }

  if (param === "amount") {
    await validateAmount(req, res);
  }

  if (param === "batch_no") {
    await validateBatchNo(req, res);
  }

  if (param === "loca_rack_bin_desc") {
    await validatePhysical(req, res);
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  if (req?.query?.form_status && req?.query?.form_status === "Update") {
    await updateRmgpDetails(req, res);
    return;
  } else {
    await postRmgpDetails(req, res);
    return;
  }
});

exports.printNRGP = catchAsync(async (req, res) => {
  const { pDOC_ID ,pDOC_NO,pDOC_DATE,P_CHL_TYPE,P_TRANS_YEAR,P_DIVISION_ID,pSDV_PRINT_AS} = req.body;
  if (!pDOC_NO) {
    return res.status(400).json({ error: "Missing pDOC_NO" });
  }

  const reportName = "DLVR_CHALLAN";
  const baseOutputName = `${reportName}_${pDOC_NO}`;
  const outputFilename = `${baseOutputName}.pdf`;

  const JAR_PATH = path.resolve(
    __dirname,
    "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
  );

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../../reportGeneration/reports/",
  );
  // console.log("__dirname =", __dirname);
  // console.log('JAR_PATH', JAR_PATH)
  // console.log('REPORT_DIR', REPORT_DIR)


  const finalPdfPath = path.join(REPORT_DIR, outputFilename);

  // Params passed as Jasper parameters only
  const params = {
    // pDOC_ID: { type: "Integer", value: pDOC_ID },
    pDOC_NO: { type: "String", value: pDOC_NO },
    pSDV_PRINT_AS: { type: "String", value: pSDV_PRINT_AS },
    pDOC_DATE: { type: "Date", value: pDOC_DATE },
    P_TRANS_YEAR: { type: "String", value: P_TRANS_YEAR },
    P_CHL_TYPE: { type: "String", value: P_CHL_TYPE },
    P_DIVISION_ID: { type: "Integer", value: P_DIVISION_ID },
  };

  const paramString = Object.entries(params)
    .map(([key, { type, value }]) => `${key}=${type}:${value}`)
    .join(" ");

  // ✅ Pass outputFileName as a separate CLI argument (not Jasper param)
  const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

  console.log(command);

  // console.log(`🖨 Generating Service Invoice: ${outputFilename}`);

//   console.log("Node Version:", process.version);
// console.log("Platform:", process.platform);
// console.log("Command:", command);
// console.log("JAR Exists:", fs.existsSync(JAR_PATH));
// console.log("Report Exists:", fs.existsSync(REPORT_DIR));


  exec(
    command,
    {
      cwd: path.dirname(JAR_PATH),
       shell: "C:\\Windows\\System32\\cmd.exe",
      //  shell: true,
    },
    (error, stdout, stderr) => {
      // console.log(stdout);

      console.log("STDOUT:", stdout);
console.log("STDERR:", stderr);

      if (error || stderr) {
        console.error(
          "❌ Error generating NRGP print:",
          error?.message || stderr,
        );
        return res
          .status(500)
          .json({ error: "Error generating NRGP Print" });
      }

      setTimeout(() => {
        if (!fs.existsSync(finalPdfPath)) {
          console.error("Generated PDF not found:", finalPdfPath);
          return res.status(500).json({ error: "Generated PDF not found" });
        }

        // console.log(`✅ Service Invoice Ready: ${finalPdfPath}`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${outputFilename}"`,
        );
        return res.sendFile(finalPdfPath);
      }, 400);
    },
  );
});

