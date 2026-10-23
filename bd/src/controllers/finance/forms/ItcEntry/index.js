const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater, dateFormate } = require("../../../../utility/constant");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../../utility/query");
const { relativeTimeRounding } = require("moment");

TABLE_NAMES = {
  THFMINWARDGST: "integral.thfminwardgst",
  TDFMINWARDGST: "integral.tdfminwardgst",
};

// for dropdown data

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const CurrencyList = await db.query(
    `select curr_desc, curr_code from currency order by 1   `
  );

  return res.status(200).json({
    currency: CurrencyList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;

  console.log("search record........");

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  //console.log("userId", userId)

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["itc_sr_no", "register_type", "doc_no", "v_code"];

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
    let queryParameter = `ORDER BY gst_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(gst_id) FROM ${TABLE_NAMES.THFMINWARDGST} where trans_year = $1 and division_id = $2  ${queryValues}
                      `,
        [transYear, divisionId]
      );

      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter);
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(gst_id) FROM ${TABLE_NAMES.THFMINWARDGST} where trans_year = $1 and division_id = $2 
                      `,
            [transYear, divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY gst_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY gst_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const thfminwardGstData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.THFMINWARDGST} where division_id = $1 AND TRANS_YEAR = $2
        AND REGISTER_TYPE IN ('G','S') ${queryParameter}
                    `,
      [divisionId, transYear]
    );

    if (thfminwardGstData.rowCount == 0) {
     // throw new Error("No matching record found");
     return res.status(200).json({ success: false, message: "No matching record found", thfminwardGstData: [], recordCount: 0 });
    }

    // console.log(`SELECT * FROM ${TABLE_NAMES.THFMINWARDGST} where division_id = 1 AND TRANS_YEAR = 2023
    //     AND REGISTER_TYPE IN ('G','S') ${queryParameter}
    //                 `);

    const gstId = thfminwardGstData.rows[0].gst_id;
    const vCode = thfminwardGstData.rows[0].v_code;
    const docId = thfminwardGstData.rows[0].doc_id;

    thfminwardGstData.rows[0].credit_availed_date =
      thfminwardGstData.rowCount > 0
        ? dateFormater(thfminwardGstData.rows[0].credit_availed_date)
        : "";

    thfminwardGstData.rows[0].eway_bill_date =
      thfminwardGstData.rowCount > 0
        ? dateFormater(thfminwardGstData.rows[0].eway_bill_date)
        : "";

    thfminwardGstData.rows[0].doc_date =
      thfminwardGstData.rowCount > 0
        ? dateFormater(thfminwardGstData.rows[0].doc_date)
        : "";

    thfminwardGstData.rows[0].bill_of_entry_dt =
      thfminwardGstData.rowCount > 0
        ? dateFormater(thfminwardGstData.rows[0].bill_of_entry_dt)
        : "";

    // POST QUERY DATA
    const vName = await db.query(
      `Select v_name,gst_no
			  from integral.mommvend
			 where v_code = $1`,
      [vCode]
    );

    thfminwardGstData.rows[0].v_name =
      vName.rowCount > 0 ? vName.rows[0].v_name : "";
    thfminwardGstData.rows[0].gst_no =
      vName.rowCount > 0 ? vName.rows[0].gst_no : "";

    const InvNo = await db.query(
      `SELECT INV_NO FROM integral.MHAPBILL_RC WHERE GST_ID = $1`,
      [gstId]
    );

    thfminwardGstData.rows[0].rc_inv_no =
      InvNo.rowCount > 0 ? InvNo.rows[0].inv_no : "";

    const vchNo = await db.query(
      `SELECT VOUCHER_NO,I.AUTH_FLAG 
	
	  FROM integral.THFMTRAN T,integral.THFMINWARDGST I 
	 WHERE T.VOUCHER_ID = I.VOUCHER_ID
	   AND I.GST_ID     = $1  `,
      [gstId]
    );

    thfminwardGstData.rows[0].j_vch_no =
      vchNo.rowCount > 0 ? vchNo.rows[0].voucher_no : "";
    thfminwardGstData.rows[0].cAuth =
      vchNo.rowCount > 0 ? vchNo.rows[0].auth_flag : "";

    const authStatus = await db.query(
      `  	SELECT I.AUTH_FLAG 
	  FROM THFMINWARDGST I 
	 WHERE I.GST_ID     = $1`,
      [gstId]
    );

    thfminwardGstData.rows[0].cAuth =
      authStatus.rowCount > 0 ? authStatus.rows[0].auth_flag : "";
    console.log("c_auth", thfminwardGstData.rows[0].cAuth);

    const gstDetail = await db.query(
      ` SELECT ge_no, ge_date 
	    
	    FROM THMMRCT
	   WHERE GE_ID = $1`,
      [docId]
    );

    thfminwardGstData.rows[0].ge_no =
      gstDetail.rowCount > 0 ? gstDetail.rows[0].ge_no : "";

    thfminwardGstData.rows[0].ge_date =
      gstDetail.rowCount > 0 ? dateFormater(gstDetail.rows[0].ge_date) : "";

    const poDetail = await db.query(
      `SELECT PO_NO,PO_DATE 
		  FROM MHMMPO 
		 WHERE PO_ID = $1`,
      [docId]
    );

    thfminwardGstData.rows[0].ge_no =
      poDetail.rowCount > 0 ? poDetail.rows[0].po_no : "";

    thfminwardGstData.rows[0].ge_date =
      poDetail.rowCount > 0 ? dateFormater(poDetail.rows[0].po_date) : "";

    if (thfminwardGstData.rows.length === 0) {
      return res.status(404).json({ error: "No bank voucher data found" });
    }

    const tdfminwardgstData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDFMINWARDGST} WHERE gst_id = $1`,
      [gstId]
    );

    // POST-QUERY DATA
    if (tdfminwardgstData.rows.length > 0) {
      await Promise.all(
        tdfminwardgstData.rows.map(async (item) => {
          if (item.it_code !== null) {
            const it_name = await db.query(
              `  SELECT 
           it_name
         FROM integral.mommitem
          WHERE it_code = $1 `,
              [item.it_code]
            );

            item.it_name = it_name.rows[0]?.it_name || null;
            // item.hsn_sac_code = it_name.rows[0]?.hsn_sac_code || null;  pm sir mentioned block this post query of hsn_sac_code column this will retrieve from database
          }

          if (item.mrir_no !== null) {
            const qty_advise = await db.query(
              `  Select qty_advise 
               from tdmmrct
                  where mrir_no = $1 `,
              [item.mrir_no]
            );

            item.qty_advise = qty_advise.rows[0]?.qty_advise || null;
          }

          if (item.doc_id !== null) {
            const poNo = await db.query(
              `  SELECT PO_NO  
		            FROM MHMMPO 
		     WHERE PO_ID = $1;   `,
              [docId]
            );

            item.po_no = poNo.rows[0]?.po_no || null;
          }

          if (item.mrir_no !== null) {
            const po_id = await db.query(
              `  SELECT PO_NO 
		  FROM MHMMPO 
		 WHERE PO_ID = (SELECT PO_ID FROM TDMMRCT WHERE MRIR_NO = $1) `,
              [item.mrir_no]
            );

            item.po_no = po_id.rows[0]?.po_no || null;
            console.log("po_no", item.po_no);
          }
        })
      );
    }

    const responseData = {
      thfminwardGstData: thfminwardGstData.rows[0],
      tdfminwardgstData: tdfminwardgstData.rows,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        type: "error",
        message: error.message || "Internal Server Error",
      });
  }
};
    // commented on 23-07-26
// const helpListData = async (req, res) => {
//   const {
//     appDivisionId,
//     appFinYear,
//     appUserId,
//     form_status,
//     help_list,
//     whether_ge_yesno,
//     register_type,
//     cash_receipt,
//     v_code,
//     v_type,
//     credit_availed_date,
//     itm_goods_service,
//   } = req?.query;
//   // if (!["Insert", "Update"].includes(form_status)) {
//   //   return res.status(200).send([]);
//   // }

//   if (help_list === "vendor") {  
    
//         let vend;  
//     if(['Insert', 'Update'].includes(form_status)) {

//      vend = await db.query(
//       `SELECT DISTINCT V.V_NAME, V.V_CODE, S.STATE_NAME AS V_CITY
// FROM MOMMVEND V
// JOIN THMMRCT H ON V.V_CODE = H.V_CODE
// JOIN MOITSTATE S ON V.V_CITY = S.STATE_ID
// WHERE 'V' = 'V'
//   AND COALESCE($1, 'Y') = 'Y'
//   AND H.SALE_RETURN <> 5
//   AND H.TRANS_YEAR = $2
//   AND DATE(H.GE_DATE) > DATE '2017-06-30'
//   AND H.MATERIAL_FR = CASE WHEN 'V' = 'V' THEN 'S' ELSE 'V' END
//   AND H.DIVISION_ID = $3  
//   AND $4 = 'G'

// UNION

// SELECT DISTINCT V.V_NAME, V.V_CODE, S.STATE_NAME AS V_CITY
// FROM MOMMVEND V
// JOIN MOITSTATE S ON V.V_CITY = S.STATE_ID
// WHERE 'V' = 'V'
//   AND COALESCE(V.ACTIVE, 'N') = 'Y'
//   AND $4 = 'G'
//   AND COALESCE($1, 'Y') = 'N'


// UNION

// -- Query 3
// SELECT DISTINCT V.V_NAME, V.V_CODE, S.STATE_NAME AS V_CITY
// FROM MOMMVEND V
// JOIN MOITSTATE S ON V.V_CITY = S.STATE_ID
// WHERE 'V' = 'V'
//   AND 'S' = 'S'

// UNION ALL

// -- Query 4
// SELECT DISTINCT 
//   CASE 
//     WHEN C.C_NAME1 IS NULL THEN C.C_NAME 
//     ELSE C.C_NAME || '-' || C.C_NAME1 
//   END AS C_NAME,
//   C.C_CODE,
//   S.STATE_NAME AS V_CITY
// FROM MOSMCUST C
// JOIN MOITSTATE S ON C.C_CITY = S.STATE_ID
// WHERE 'V' = 'C'`,
//       [whether_ge_yesno, appFinYear, appDivisionId, register_type]
//     );
//     console.log(
//       "register_type",
//       register_type,
//       whether_ge_yesno,
//       appFinYear,
//       appDivisionId,
//       register_type,
//       itm_goods_service
//     ); 
//   }  
//   else if (form_status === 'Search') { 

//    console.log('formStatus', form_status)
//     vend = await db.query(`SELECT v_code from ${TABLE_NAMES.THFMINWARDGST}`)
//   }
//     return res.status(200).json(vend.rows);

//   } else if (help_list === "invoice") {  
//     let inv
//     if (['Insert', 'Update'].includes(form_status)) {

//    inv = await db.query(
//       `SELECT DISTINCT 
//     H.CHLN_NO, 
//     H.CHLN_DATE, 
//     H.GE_ID, 
//     H.INVOICE_NO, 
//     H.INVOICE_DT,
//     E.NAME, 
//     H.DIVISION_ID
// FROM 
//     THMMRCT H
// JOIN TDMMRCT D ON D.GE_ID = H.GE_ID
// JOIN MOITDIVISION E ON H.DIVISION_ID = E.DIVISION_ID
// JOIN USER_DIVISION U ON U.DIVISION_ID = E.DIVISION_ID
// WHERE 
//     DATE(H.GE_DATE) > DATE '2017-06-30'
//     AND COALESCE(H.CANCEL_GE, 'N') = 'N'
//     AND H.V_CODE = $1
//     AND (
//         ($2 = 'V' AND H.MATERIAL_FR = 'S') OR
//         ($2 <> 'V' AND H.MATERIAL_FR = 'S')
//     )
//     AND U.USER_ID = $3
//     AND H.DIVISION_ID = $4
//     AND  H.TRANS_YEAR = $5 
//     AND H.SALE_RETURN <> 5
//     AND $6 = 'N'  -- CASH_RECEIPT = 'N'
//     AND $7 = 'G'
//     AND NOT EXISTS (
//         SELECT 1
//         FROM THFMINWARDGST E
//         WHERE 
//             E.DOC_NO = H.CHLN_NO
//             AND E.V_CODE = H.V_CODE
//             AND DATE(E.DOC_DATE) = DATE(H.CHLN_DATE)
//     )
// UNION ALL
// -- Query 2: SALE_RETURN = 5 cases
// SELECT 
//     H.CHLN_NO,
//     H.CHLN_DATE, 
//     H.GE_ID,
//     NULL AS INVOICE_NO, 
//     NULL AS INVOICE_DT,
//     E.NAME, 
//     E.DIVISION_ID
// FROM 
//     THMMRCT H
// JOIN MOITDIVISION E ON H.DIVISION_ID = E.DIVISION_ID
// WHERE 
//     H.SALE_RETURN = 5
//     AND DATE(H.GE_DATE) > DATE '2017-06-30'
//     AND E.DIVISION_ID = 1;  
// 	`,
//       [
//         v_code,
//         v_type,
//         appUserId,
//         appDivisionId,
//         appFinYear,
//         cash_receipt,
//         register_type,
//       ]
//     );

//     const formattedInvoices = inv.rows.map((row) => ({
//       ...row,
//       invoice_dt: row.invoice_dt ? dateFormater(row.invoice_dt) : null,
//     }));  

//   }    

  

//   else if(form_status === 'Search') {
//     inv = await db.query(`Select doc_no as invoice_no from ${TABLE_NAMES.THFMINWARDGST}`) 
//        const formattedInvoices = inv.rows.map((row) => ({
//       ...row,
//       invoice_dt: row.invoice_dt ? dateFormater(row.invoice_dt) : null,
//     })); 
//   }
//     return res.status(200).json(inv.rows);
//     //return res.status(200).json(formattedInvoices.rows)
//     // dateFormater(inv.invoice_dt)
//   } else if (help_list === "pono") {
//     const poNo = await db.query(
//       `SELECT DISTINCT PO_NO,PO_DATE ,PO_ID,E.NAME, E.DIVISION_ID
//   FROM  MHMMPO H,MOITDIVISION E ,MOMMPCAT C
//  WHERE USER_CODE in ('WO','WI','PS')
//    AND C.PO_CAT_PREFIX = H.CATEGORY       
//    AND E.DIVISION_ID = H.DIVISION_ID
//   /* AND H.TRANS_YEAR  = :GLOBAL.G_FIN_YEAR */
//    AND H.V_CODE      = $1
//    AND coalesce(FLAG,'N') = 'F'    
//    AND $2 = 'N'
//    AND $3 = 'S'  
//    AND $4 BETWEEN PO_EFF_DT AND PO_END_DT`,
//       [v_code, cash_receipt, register_type, credit_availed_date]
//     );
//     return res.status(200).json(poNo.rows);
//   } else if (help_list === "item") {
//     const item = await db.query(`	  
// 					  SELECT IT_CODE,HSN_SAC_CODE,IT_NAME_LONG IT_NAME 
//    FROM MOMMITEM 
// WHERE ACTIVE = 'Y'  `);
//     return res.status(200).json(item.rows);
//   } else if (help_list === "hsn") {
//     console.log(itm_goods_service);
//     const hsn = await db.query(
//       `	  
// 					 SELECT DISTINCT HSN_SAC_CODE
// FROM MOSMGST_STATE
// WHERE SAL_OR_ST = 
//     CASE 
//         WHEN COALESCE($1, 'G') = 'G' THEN 'S'
//         ELSE 'V'
//     END  `,
//       [itm_goods_service]
//     );
//     return res.status(200).json(hsn.rows);
//   }
// };

const helpListData = async (req, res) => {
  const {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    whether_ge_yesno,
    register_type,
    cash_receipt,
    v_code,
    v_type,
    credit_availed_date,
    itm_goods_service,
  } = req?.query;
  // if (!["Insert", "Update"].includes(form_status)) {
  //   return res.status(200).send([]);
  // }

  if (help_list === "vendor") {
    let vend;
    if (["Insert", "Update"].includes(form_status)) {
      vend = await db.query(
        `SELECT DISTINCT V.V_NAME, V.V_CODE, S.STATE_NAME AS V_CITY
FROM MOMMVEND V
JOIN THMMRCT H ON V.V_CODE = H.V_CODE
JOIN MOITSTATE S ON V.V_CITY = S.STATE_ID
WHERE 'V' = 'V'
  AND COALESCE($1, 'Y') = 'Y'
  AND H.SALE_RETURN <> 5
  AND H.TRANS_YEAR = $2
  AND DATE(H.GE_DATE) > DATE '2017-06-30'
  AND H.MATERIAL_FR = CASE WHEN 'V' = 'V' THEN 'S' ELSE 'V' END
  AND H.DIVISION_ID = $3  
  AND $4 = 'G'

UNION

SELECT DISTINCT V.V_NAME, V.V_CODE, S.STATE_NAME AS V_CITY
FROM MOMMVEND V
JOIN MOITSTATE S ON V.V_CITY = S.STATE_ID
WHERE 'V' = 'V'
  AND COALESCE(V.ACTIVE, 'N') = 'Y'
  AND $4 = 'G'
  AND COALESCE($1, 'Y') = 'N'


UNION

-- Query 3
SELECT DISTINCT V.V_NAME, V.V_CODE, S.STATE_NAME AS V_CITY
FROM MOMMVEND V
JOIN MOITSTATE S ON V.V_CITY = S.STATE_ID
WHERE 'V' = 'V'
  AND 'S' = 'S'

UNION ALL

-- Query 4
SELECT DISTINCT 
  CASE 
    WHEN C.C_NAME1 IS NULL THEN C.C_NAME 
    ELSE C.C_NAME || '-' || C.C_NAME1 
  END AS C_NAME,
  C.C_CODE,
  S.STATE_NAME AS V_CITY
FROM MOSMCUST C
JOIN MOITSTATE S ON C.C_CITY = S.STATE_ID
WHERE 'V' = 'C'`,
        [whether_ge_yesno, appFinYear, appDivisionId, register_type],
      );
      console.log(
        "register_type",
        register_type,
        whether_ge_yesno,
        appFinYear,
        appDivisionId,
        register_type,
        itm_goods_service,
      );
    } else if (form_status === "Search") {
      console.log("formStatus", form_status);
      vend = await db.query(`SELECT v_code from ${TABLE_NAMES.THFMINWARDGST}`);
    }
    return res.status(200).json(vend.rows);
  } else if (help_list === "invoice") {
    let inv;
    let formattedInvoices;
    if (["Insert", "Update"].includes(form_status)) {
      inv = await db.query(
                `SELECT DISTINCT 
            H.CHLN_NO, 
            H.CHLN_DATE, 
            H.GE_ID, 
            H.INVOICE_NO, 
            H.INVOICE_DT,
            E.NAME, 
            H.DIVISION_ID
        FROM 
            THMMRCT H
        JOIN TDMMRCT D ON D.GE_ID = H.GE_ID
        JOIN MOITDIVISION E ON H.DIVISION_ID = E.DIVISION_ID
        JOIN USER_DIVISION U ON U.DIVISION_ID = E.DIVISION_ID
        WHERE 
            DATE(H.GE_DATE) > DATE '2017-06-30'
            AND COALESCE(H.CANCEL_GE, 'N') = 'N'
            AND H.V_CODE = $1
            AND (
                ($2 = 'V' AND H.MATERIAL_FR = 'S') OR
                ($2 <> 'V' AND H.MATERIAL_FR = 'S')
            )
            AND U.USER_ID = $3
            AND H.DIVISION_ID = $4
            AND  H.TRANS_YEAR = $5 
            AND H.SALE_RETURN <> 5
            AND $6 = 'N'  -- CASH_RECEIPT = 'N'
            AND $7 = 'G'
            AND NOT EXISTS (
                SELECT 1
                FROM THFMINWARDGST E
                WHERE 
                    E.DOC_NO = H.CHLN_NO
                    AND E.V_CODE = H.V_CODE
                    AND DATE(E.DOC_DATE) = DATE(H.CHLN_DATE)
            )
        UNION ALL
        -- Query 2: SALE_RETURN = 5 cases
        SELECT 
            H.CHLN_NO,
            H.CHLN_DATE, 
            H.GE_ID,
            NULL AS INVOICE_NO, 
            NULL AS INVOICE_DT,
            E.NAME, 
            E.DIVISION_ID
        FROM 
            THMMRCT H
        JOIN MOITDIVISION E ON H.DIVISION_ID = E.DIVISION_ID
        WHERE 
            H.SALE_RETURN = 5
            AND DATE(H.GE_DATE) > DATE '2017-06-30'
            AND E.DIVISION_ID = 1;  
          `,
                [
                  v_code,
                  v_type,
                  appUserId,
                  appDivisionId,
                  appFinYear,
                  cash_receipt,
                  register_type,
                ],
              );

      formattedInvoices = inv.rows.map((row) => ({
        ...row,
        // invoice_dt: dateFormater(row?.invoice_dt)
        invoice_dt: row.invoice_dt ? dateFormater(row.invoice_dt) : null,
        chln_date: row.chln_date ? dateFormater(row.chln_date) : null,
      }));

      console.log("formattedInvoices", formattedInvoices);
    } else if (form_status === "Search") {
      inv = await db.query(
        `Select doc_no as invoice_no from ${TABLE_NAMES.THFMINWARDGST}`,
      );
      formattedInvoices = inv.rows.map((row) => ({
        ...row,
        invoice_dt: row.invoice_dt ? dateFormater(row.invoice_dt) : null,
      }));
    }
    return res.status(200).json(formattedInvoices);
    //return res.status(200).json(formattedInvoices.rows)
    // dateFormater(inv.invoice_dt)
  } else if (help_list === "pono") {
    const poNo = await db.query(
      `SELECT DISTINCT PO_NO,PO_DATE ,PO_ID,E.NAME, E.DIVISION_ID
  FROM  MHMMPO H,MOITDIVISION E ,MOMMPCAT C
 WHERE USER_CODE in ('WO','WI','PS')
   AND C.PO_CAT_PREFIX = H.CATEGORY       
   AND E.DIVISION_ID = H.DIVISION_ID
  /* AND H.TRANS_YEAR  = :GLOBAL.G_FIN_YEAR */
   AND H.V_CODE      = $1
   AND coalesce(FLAG,'N') = 'F'    
   AND $2 = 'N'
   AND $3 = 'S'  
   AND $4 BETWEEN PO_EFF_DT AND PO_END_DT`,
      [v_code, cash_receipt, register_type, credit_availed_date],
    );
    return res.status(200).json(poNo.rows);
  } else if (help_list === "item") {
    const item = await db.query(`	  
					  SELECT IT_CODE,HSN_SAC_CODE,IT_NAME_LONG IT_NAME 
   FROM MOMMITEM 
WHERE ACTIVE = 'Y'  `);
    return res.status(200).json(item.rows);
  } else if (help_list === "hsn") {
    console.log(itm_goods_service);
    const hsn = await db.query(
      `	  
					 SELECT DISTINCT HSN_SAC_CODE
FROM MOSMGST_STATE
WHERE SAL_OR_ST = 
    CASE 
        WHEN COALESCE($1, 'G') = 'G' THEN 'S'
        ELSE 'V'
    END  `,
      [itm_goods_service],
    );
    return res.status(200).json(hsn.rows);
  }
};

exports.validateForVcode = catchAsync(async (req, res) => {
  const { v_code } = req.query;

  try {
    if (!v_code) {
      return res.status(400).json({ error: "v_code is required" });
    }

    const vendorData = await db.query(
      "SELECT *  FROM mommvend WHERE v_code = $1",
      [v_code]
    );

    if (vendorData.rows.length > 0) {
      v_name = vendorData.rows[0].v_name;
      gst_registered = vendorData.rows[0].whether_gst_registered_dlr;
      gst_no = vendorData.rows[0].gst_no;
      transport = vendorData.rows[0].transport;
      rc_applicable = vendorData.rows[0].rc_applicable;

      return res.status(200).json({
        v_name: v_name,
        whether_gst_registered_dlr: gst_registered,
        transport: transport,
        rc_applicable: rc_applicable,
        gst_no: gst_no,
      });
    }

    return res
      .status(400)
      .json({ error: "Vendor Code does not exist in Vendor Master" });
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.validateForGeNo = catchAsync(async (req, res) => {
  const { cash_receipt, ge_no, register_type, credit_availed_date, v_code } =
    req.query;

  try {
    const poData = await db.query(
      `SELECT DISTINCT H.PO_ID
FROM MHMMPO H
JOIN MOITDIVISION E ON E.DIVISION_ID = H.DIVISION_ID
JOIN MOMMPCAT C ON C.PO_CAT_PREFIX = H.CATEGORY
WHERE USER_CODE IN ('WO', 'WI', 'PS')
  AND H.PO_NO = $1                   -- GE_NO
  AND H.V_CODE = $2                 -- V_CODE
  AND $3 BETWEEN H.PO_EFF_DT AND H.PO_END_DT  -- CREDIT_DT
  AND COALESCE(H.FLAG, 'N') = 'F'
  AND $4 = 'N'                      -- CASH_RECEIPT
  AND $5 = 'S'`,

      [ge_no, v_code, credit_availed_date, cash_receipt, register_type]
    );

    if (poData.rows.length > 0) {
      const ge_id = poData.rows[0].po_id;

      return res.status(200).json({
        doc_id: ge_id,
      });
    }
    return res.status(400).json({
      error:
        "Invalid Work Order No/Purchase Services/Not Authorised/ Check WO/PS Effective and End date",
    }); // Send an empty string if not found
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.validateForInvData = catchAsync(async (req, res) => {
  const { doc_no, v_code, v_type, divisionId, cash_receipt, register_type } =
    req.query;

  try {
    if (!doc_no) {
      //return res.status(400).json({ error: "doc_no is required" });
      return
    }

    const invoiceData = await db.query(
      ` SELECT 
    chln_date, 
    ge_date, 
    h.ge_id, 
    ok_rej, 
    ge_no, 
    ge_date
FROM thmmrct h
WHERE chln_no = $1                      -- :THFMINWARDGST.DOC_NO
  AND v_code = $2                       -- :THFMINWARDGST.V_CODE
  AND sale_return <> 5
  AND h.ge_date > DATE '2017-06-30'
  AND h.material_fr = CASE 
                        WHEN $3 = 'V' THEN 'S'  -- :V_TYPE logic via CASE
                        ELSE $3
                      END
  AND division_id = $4
  AND COALESCE(cancel_ge, 'N') = 'N'
  AND $5 = 'N'                         -- :CASH_RECEIPT
  AND $6 = 'G'                         -- :THFMINWARDGST.REGISTER_TYPE
  AND NOT EXISTS (
        SELECT 1 
        FROM thfminwardgst e
        WHERE e.doc_no = h.chln_no
          AND e.v_code = h.v_code
          AND e.doc_date::date = h.chln_date::date
    )

UNION ALL

SELECT 
    chln_date, 
    ge_date, 
    h.ge_id, 
    ok_rej, 
    ge_no, 
    ge_date
FROM thmmrct h
WHERE sale_return = 5
  AND h.division_id = $4              -- Same division_id as above
  AND h.ge_date > DATE '2017-06-30'
  AND COALESCE(cancel_ge, 'N') = 'N'
  AND chln_no = $1                    -- :THFMINWARDGST.DOC_NO
  AND v_code = $2                     -- :THFMINWARDGST.V_CODE
  AND h.material_fr = CASE 
                        WHEN $3 = 'V' THEN 'S'
                        ELSE $3
                      END
  AND $5 = 'Y'                        -- Assuming CASH_RECEIPT is 'Y' in this block
  AND $6 = 'G'                        -- REGISTER_TYPE is still 'G'
  AND NOT EXISTS (
        SELECT 1 
        FROM thfminwardgst e
        WHERE e.doc_no = h.chln_no
          AND e.v_code = h.v_code
          AND e.doc_date::date = h.chln_date::date
    );
`,
      [doc_no, v_code, v_type, divisionId, cash_receipt, register_type]
    );

    if (invoiceData.rows.length === 0) {
      return res.status(400).json({ error: "Challan No. does not exist" });
    }

    if (invoiceData.rows.length === 1) {
      doc_dt = invoiceData.rows[0].chln_date;
      credit_availed_date = invoiceData.rows[0].ge_date;
      ge_id = invoiceData.rows[0].ge_id;
      cok_rej = invoiceData.rows[0].ok_rej;
      ge_date = invoiceData.rows[0].ge_date;
      ge_no = invoiceData.rows[0].ge_no;

      return res.status(200).json({
        doc_dt: doc_dt,
        credit_availed_date: credit_availed_date,
        ge_id: ge_id,
        cok_rej: cok_rej,
        ge_date: ge_date,
        ge_no: ge_no,
      });
    }

    if (rows.length > 1) {
      return res.status(400).json({
        error: "Challan No. exist More than once, please select from list(F1)",
      });
    }
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.validateForItemcode = catchAsync(async (req, res) => {
  const { it_code } = req.query;

  try {
    if (!it_code) {
     // return res.status(400).json({ error: "it_code is required" });
     return
    }

    const itemData = await db.query(
      `SELECT IT_CODE, IT_NAME_LONG IT_NAME , hsn_sac_code, um_code
   FROM MOMMITEM 
  WHERE coalesce(ACTIVE,'N') = 'Y'
    and it_code=$1`,
      [it_code]
    );

    if (itemData.rows.length > 0) {
      it_name = itemData.rows[0].it_name;

      return res.status(200).json({
        it_name: it_name,
        um_code:itemData.rows[0].um_code
      });
    }

    return res.status(400).json({
      error:
        "Please check item is inactive in item master form or select item from Help list",
    });
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.validateForHsncode = catchAsync(async (req, res) => {
  const { hsn_sac_code, itm_goods_service } = req.query;

  try {
    if (!hsn_sac_code) {
      return res.status(400).json({ error: "hsn code is required" });
    }

    const hsnData = await db.query(
      `SELECT HSN_SAC_CODE
       FROM MOSMGST_STATE
       WHERE HSN_SAC_CODE = $1
         AND SAL_OR_ST = CASE 
                           WHEN COALESCE($2, 'G') = 'G' THEN 'S'
                           ELSE 'V'
                         END
       LIMIT 1`,
      [hsn_sac_code, itm_goods_service]
    );

    if (hsnData.rows.length > 0) {
      hsn_sac_code = hsnData.rows[0].hsn_sac_code;

      return res.status(200).json({
        hsn_sac_code: hsn_sac_code,
      });
    }

    const hsnData1 = await db.query(
      `SELECT HSN_SAC_CODE
       FROM MOSMGST_STATE
       WHERE HSN_SAC_CODE LIKE $1 || '%'
         AND SAL_OR_ST = CASE 
                           WHEN COALESCE($2, 'G') = 'G' THEN 'S'
                           ELSE 'V'
                         END
       LIMIT 1`,
      [hsn_sac_code, itm_goods_service]
    );

    if (hsnData.rows.length > 0) {
      hsn_sac_code = hsnData1.rows[0].hsn_sac_code;

      return res.status(200).json({
        hsn_sac_code: hsn_sac_code,
      });
    }

    return res.status(400).json({ error: "INVALID HSN/SAC CODE" });
  } catch (error) {
    console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});  

exports.validateForDuplicate = catchAsync(async (req, res) => { 
  const {v_code, doc_no, doc_date} = req.query 

  try { 

     const vCode = await db.query(
      `select * from thfminwardgst where v_code = $1 and doc_no = $2 and doc_date = $3
  `,
      [v_code, doc_no, doc_date]
    );  

    if (vCode.rows.length > 0) {
      return res.status(400).json({ error: 'Party is already exists with same invoice no and invoice date' });
    } 

    return res.status(200).json({message: 'Validation Successful'})

  
  } 
  
  catch (error) {
   console.error("Error validating form data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }


})

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

const postItcData = async (req, res) => {
  try {
    const { formData, formDetailData } = req.body;
    //console.log("req body:", req.body);

    // Get new GST ID from sequence
    const gstIdResult = await db.query(
      `SELECT nextval('s_thfminwardgst_gst_id')`
    );
    const gst_id = gstIdResult.rows[0].nextval;
    console.log("gst_id:", gstIdResult.rows[0].nextval);
    const gst_amt_prc = formDetailData?.[0]?.gst_amt_prc;

    const {
      register_type,
      cash_receipt,
      gst_registered,
      rc_applicable,
      credit_availed_date: credit_date,
      v_code,
      v_type,
      doc_id: ge_id,
      division_id,
    } = formData;

    // Check if any required field is missing or falsy
    if (
      !ge_id ||
      !register_type ||
      !cash_receipt ||
      !gst_registered ||
      !rc_applicable ||
      !credit_date ||
      !v_code ||
      !v_type ||
      !division_id ||
      !gst_amt_prc
    ) {
      console.log(
        "All form fields must be filled.",
        ge_id,
        register_type,
        cash_receipt,
        gst_registered,
        rc_applicable,
        credit_date,
        v_code,
        v_type,
        division_id,
        gst_amt_prc,
        gst_id
      );
      return res.status(400).json({ error: "All form fields must be filled." });
    }

    const existing = await db.query(
      `SELECT * FROM tdfminwardgst WHERE gst_id = $1`,
      [gst_id]
    );

    console.log(
      "procedure:",
      gst_id,
      ge_id,
      register_type,
      cash_receipt,
      gst_registered,
      rc_applicable,
      credit_date,
      v_code,
      v_type,
      division_id,
      gst_amt_prc
    );

    // Call stored procedure to populate temp table
    await db.query(
      `CALL proc_create_itc_detail($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        gst_id,
        ge_id,
        register_type,
        cash_receipt,
        gst_registered,
        rc_applicable,
        credit_date,
        v_code,
        v_type,
        division_id,
        gst_amt_prc,
      ]
    );

    // Insert from temp to main table
    // await db.query(
    //   `INSERT INTO tdfminwardgst SELECT * FROM tdfminwardgst_temp WHERE gst_id = $1`,
    //   [gst_id]
    // );

    const finalResult = await db.query(
      `SELECT * FROM tdfminwardgst_temp WHERE gst_id = $1`,
      [gst_id]
    );

    // POST-QUERY DATA
    if (finalResult.rows.length > 0) {
      await Promise.all(
        finalResult.rows.map(async (item) => {
          if (item.it_code !== null) {
            const it_name = await db.query(
              `  SELECT 
           it_name,
          HSN_SAC_CODE
         FROM integral.mommitem
          WHERE it_code = $1 `,
              [item.it_code]
            );

            item.it_name = it_name.rows[0]?.it_name || null;
            item.hsn_sac_code = it_name.rows[0]?.hsn_sac_code || null;
          }

          if (item.mrir_no !== null) {
            const qty_advise = await db.query(
              `  Select qty_advise 
               from tdmmrct
                  where mrir_no = $1 `,
              [item.mrir_no]
            );

            item.qty_advise = qty_advise.rows[0]?.qty_advise || null;
          }

          if (item.doc_id !== null) {
            const poNo = await db.query(
              `  SELECT PO_NO  
		            FROM MHMMPO 
		     WHERE PO_ID = $1;   `,
              [ge_id]
            );

            item.po_no = poNo.rows[0]?.po_no || null;
          }

          if (item.mrir_no !== null) {
            const po_id = await db.query(
              `  SELECT PO_NO 
		  FROM MHMMPO 
		 WHERE PO_ID = (SELECT PO_ID FROM TDMMRCT WHERE MRIR_NO = $1) `,
              [item.mrir_no]
            );

            item.po_no = po_id.rows[0]?.po_no || null;
            console.log("po_no", item.po_no);
          }
        })
      );
    }
    console.log("finalResult", finalResult.rows);

    // await db.query(`DELETE FROM tdfminwardgst_temp WHERE gst_id = $1`, [
    //   gst_id,
    // ]);

    return res.status(200).json({
      success: true,
      tdfminwardgstData: finalResult.rows,
      message: "ITC data inserted successfully",
    });
  } catch (error) {
    console.error("Error in postItcData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postItcGstData = async (req, res) => {
  try {
    const { formData, formDetailData, divisionId } = req.body;

    let gst_id;

    // Use existing gst_id from formData if present, otherwise get from sequence
    if (formData.gst_id) {
      gst_id = formData.gst_id;
    } else {
      const gstIdResult = await db.query(
        `SELECT nextval('s_thfminwardgst_gst_id')`
      );
      gst_id = gstIdResult.rows[0].nextval;
    }

    console.log("gst_id:", gst_id);
    const gst_amt_prc = formDetailData?.[0]?.gst_amt_prc;
    const hsn_sac_code = formDetailData?.[0]?.hsn_sac_code;

    const {
      register_type,
      cash_receipt,
      gst_registered,
      rc_applicable,
      credit_availed_date: credit_date,
      v_code,
      v_type,
      doc_id: ge_id,
    } = formData;

    const geIdToSend = ge_id == undefined ? 0 : ge_id;
    // Call stored procedure to populate temp table

    console.log(
      "procedure:",
      gst_id,
      ge_id,
      register_type,
      cash_receipt,
      gst_registered,
      rc_applicable,
      credit_date,
      v_code,
      v_type,
      divisionId,
      gst_amt_prc,
      hsn_sac_code
    );

    await db.query(
      `CALL fill_itc_item_gst_detail($1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12)
      `,
      [
        gst_id,
        null, // geIdToSend,
        register_type,
        cash_receipt,
        gst_registered,
        rc_applicable,
        credit_date,
        v_code,
        v_type,
        divisionId || 1,
        gst_amt_prc,
        hsn_sac_code,
      ]
    );

    const finalResult = await db.query(
      `SELECT * FROM tdfminwardgst_temp_gst WHERE gst_id = $1`,
      [gst_id]
    );

    console.log("finalResult", finalResult.rows);

    // await db.query(`DELETE FROM tdfminwardgst_temp_gst WHERE gst_id = $1`, [
    //   gst_id,
    // ]);

    return res.status(200).json({
      success: true,
      tdfminwardgstData: finalResult.rows,
      message: "ITC gst data inserted successfully",
    });
  } catch (error) {
    console.error("Error in postItcData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postItcDetailData = async (req, res) => {
  try {
    await db.query("Begin");
    const { formData, formDetailData, finYear, divisionId } = req.body;
    // Inject divisionId into formData as division_id
    formData.division_id = divisionId;

    const {
      gst_registered,
      rc_applicable,
      gst_no,
      credit_availed_date: credit_date,
      division_id,
      rc_inv_no,
    } = formData;

    // const gst_id = formDetailData?.[0]?.gst_id; // Safely grab the first item's gst_id

    let gst_id = null;

    // Check if formDetailData is an array and has a gst_id
    if (
      Array.isArray(formDetailData) &&
      formDetailData.length > 0 &&
      formDetailData[0].gst_id
    ) {
      gst_id = formDetailData[0].gst_id;
    } else {
      // Get new GST ID from sequence
      const gstIdResult = await db.query(
        `SELECT nextval('s_thfminwardgst_gst_id')`
      );
      gst_id = gstIdResult.rows[0].nextval;
      console.log("Generated gst_id:", gst_id);
    }

    console.log("formData", formData);

    console.log("division", divisionId);
    const result = await db.query(
      `	SELECT GST_NO 
	    	
	    	  FROM MOITDIVISION
	    	 WHERE DIVISION_ID = $1
	    	   ; `,
      [division_id]
    );
    const gstNo = result.rows[0]?.gst_no;
    console.log(gstNo, "division", divisionId);

    // Step 1: Call the function to get the next ITC number (this locks the row if exists)
    const { rows } = await db.query(
      `SELECT func_gen_itc_no($1, $2) AS itc_no`,
      [gstNo, finYear]
    );
    const itcNo = rows[0]?.itc_no;
    console.log("generated itc no", itcNo);
    if (!itcNo) throw new Error("Failed to generate ITC number");

    // Step 2: Try to update the existing record
    const updateResult = await db.query(
      `UPDATE TOMMGSTITC_SNO
       SET LAST_SNO = $1
       WHERE TRANS_YEAR = $2 AND GST_NO = $3`,
      [itcNo, finYear, gstNo]
    );

    // Step 3: If no row was updated, insert a new one
    if (updateResult.rowCount === 0) {
      await db.query(
        `INSERT INTO TOMMGSTITC_SNO (GST_NO, LAST_SNO, TRANS_YEAR)
         VALUES ($1, $2, $3)`,
        [gstNo, itcNo, finYear]
      );
    }

    //await client.query('COMMIT');
    console.log("ITC NUMBER IS", itcNo);

    // Clean up the formData and add the gstid and itc_sr_no
    const cleanUserLoginDataForInsert = cleanObject(formData);
    cleanUserLoginDataForInsert.gst_id = gst_id;
    cleanUserLoginDataForInsert.itc_sr_no = itcNo;
    cleanUserLoginDataForInsert.trans_year = finYear;
    cleanUserLoginDataForInsert.trans_code = 2;
    

    // Delete unwanted fields
    [
      "credit_dt",
      "manf_code",
      "manf_name",
      "v_name",
      "j_vch_id",
      "j_vch_no",
      "extype",
      "tableData",
      "opening",
      "gst_no",
      "ge_no",
      "ge_date",
    ].forEach((field) => delete cleanUserLoginDataForInsert[field]);

    if (Object.keys(cleanUserLoginDataForInsert).length === 0) {
      return res.status(400).json({ error: "No valid data to insert" });
    }

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.THFMINWARDGST,
      cleanUserLoginDataForInsert
    );
    const valuesForInsertQuery = Object.values(cleanUserLoginDataForInsert);
    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);

    // Handle Reverse Charge logic
    if (gst_registered === "N" || rc_applicable === "Y") {
     
      const { rows } = await db.query(`CALL CRET_REV_CHRG_INV($1, $2)`, [
        gst_id,
        null,
      ]);
      const invNo = rows?.[0]?.inv_no;
      console.log("Reverse Charge Invoice No:", invNo);

      const { rows: rcResult } = await db.query(
        `CALL PROC_GEN_JV_FOR_ITC_RC($1, $2)`,
        [gst_id, null]
      );
      const voucherNo = rcResult?.[0]?.voucher_no;
      console.log("RC Voucher No:", voucherNo);
    }

    // Handle regular GST logic
      // following prodedure PROC_GEN_JV_FOR_ITC has been returned as it is no longer needed in EDDAL 10-06-2026 by JSB and comment by 14-10-26 by JSB
    // if (gst_registered === "Y" && rc_applicable === "N") {
    //   const { rows: result } = await db.query(
    //     `CALL PROC_GEN_JV_FOR_ITC($1, $2)`,
    //     [gst_id, null]
    //   );
    //   const voucherNo = result?.[0]?.voucher_no;
    //   console.log("Voucher No:", voucherNo);
    // }

    // prepare and insert formDetailData
    if (formDetailData.length) {
      const formDetailArray = Array.isArray(formDetailData)
        ? formDetailData
        : [formDetailData];

      for (const [index, record] of formDetailArray.entries()) {

        console.log('record', record)

        record.gst_id = gst_id;
        delete record.it_name;
        delete record.mrir_no;
        delete record.qty_advise;
        delete record.curr_val;
        delete record.val_in_fc;
        delete record.val_in_inr;
        delete record.t_ass_val;
        delete record.net_amt;
        delete record.tot_net_amt;
        delete record.po_no;
        delete record.qty_advise;
        delete record.bcd_amt_ndb;
        delete record.bcd_edu_cess_amt_ndb;
        delete record.bcd_hsc_cess_amt_ndb;
        delete record.igst_perc_cr_availed;
        delete record.igst_cess_perc_cr_availed;
        delete record.sgst_perc_cr_availed;
        delete record.sgst_cess_perc_cr_availed;
        delete record.cgst_perc_cr_availed;
        delete record.cgst_cess_perc_cr_availed;
        delete record.id;
        delete record.nctr;
        delete record.po_id;
        delete record.mrir_code;
        delete record.pack_forward_tot;
        delete record.custom_perc_amt;
        delete record.bdc_hsc_cess_amt;

        const queryForInsert = generateSingleInsertQuery(
          TABLE_NAMES.TDFMINWARDGST,
          record
        );

        console.log('queryForInsert dtl:: ', queryForInsert)
        
        const valuesForInsertQuery = Object.values(record);
        
        console.log('queryForInsert value dtl:: ', valuesForInsertQuery)
        try {
          await db.query(queryForInsert, valuesForInsertQuery);
        } catch (error) {
          console.error(
            `Error inserting division record at index ${index}:`,
            error
          );
          throw new Error(`Division insert error at index ${index}`);
        }
      }
    }

    await db.query(`DELETE FROM tdfminwardgst_temp WHERE gst_id = $1`, [
      gst_id,
    ]);

    await db.query(`DELETE FROM tdfminwardgst_temp_gst WHERE gst_id = $1`, [
      gst_id,
    ]);

    await db.query("commit");
    // Respond only if this is the final step
    return res.status(200).json({
      success: true,
      message: `ITC NUMBER IS ${itcNo}`,
      itc_no: itcNo,
    });
  } catch (error) {
    console.error("Error in postItcDetailData:", error);
    await db.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

const updateItcDetails = async (req, res) => {
  const { formData, formDetailData, deletedData } = req.body;
  try {
    await db.query("Begin");
    let gstId = formData?.gst_id;

    // udating thfminwardgst data
    if (Object.keys(req.body).length !== 0) {
      const dataForInsert = { ...formData };

      // Delete unwanted fields
      [
        "credit_dt",
        "manf_code",
        "manf_name",
        "v_name",
        "j_vch_id",
        "igst_tot_value",
        "j_vch_no",
        "extype",
        "rc_inv_no",
        "tableData",
        "opening",
        "cAuth",
        "gst_no",
        "ge_no",
        "ge_date",
        "igst_tot_cess_value",
        "igst_tot_val_cr_allowable",
        "igst_tot_cess_val_cr_allowable",
        "igst_tot_val_cr_availed",
        "igst_tot_cess_val_cr_availed",
        "sgst_tot_value",
        "sgst_tot_cess_value",
        "sgst_tot_val_cr_allowable",
        "sgst_tot_cess_val_cr_allowable",
        "sgst_tot_val_cr_availed",
        "sgst_tot_cess_val_cr_availed",
        "cgst_tot_value",
        "cgst_tot_cess_value",
        "cgst_tot_val_cr_allowable",
        "cgst_tot_cess_val_cr_allowable",
        "cgst_tot_val_cr_availed",
        "cgst_tot_cess_val_cr_availed",
        "trans_code",
      ].forEach((field) => delete dataForInsert[field]);

      const dataForUpdate = cleanObject(dataForInsert);

      const columns = Object.keys(dataForUpdate);
      const values = Object.values(dataForUpdate);

      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      // Generate the full SQL query
      const query = `UPDATE ${
        TABLE_NAMES.THFMINWARDGST
      } SET ${setClause} WHERE gst_id = $${columns.length + 1} `;

      try {
        // Execute the update query
        await db.query(query, [...values, gstId]);
        // Handle Reverse Charge logic
        if (formData.gst_registered === "N" || formData.rc_applicable === "Y") {
          // Simulating an OUT param using a returning function (adjust if your DB uses OUT properly)

          const { rows } = await db.query(`CALL CRET_REV_CHRG_INV($1, $2)`, [
            gstId,
            null,
          ]);
          const invNo = rows?.[0]?.inv_no;
          console.log("Reverse Charge Invoice No:", invNo);

          const { rows: rcResult } = await db.query(
            `CALL PROC_GEN_JV_FOR_ITC_RC($1, $2)`,
            [gstId, null]
          );
          const voucherNo = rcResult?.[0]?.voucher_no;
          console.log("RC Voucher No:", voucherNo);
        }

        // Handle regular GST logic and  comment by 14-10-26 by JSB
        // if (formData.gst_registered === "Y" && formData.rc_applicable === "N") {
        //   const { rows: result } = await db.query(
        //     `CALL PROC_GEN_JV_FOR_ITC($1, $2)`,
        //     [gstId, null]
        //   );
        //   const voucherNo = result?.[0]?.voucher_no;
        //   console.log("Voucher No:", voucherNo);
        // }
      } catch (error) {
        throw new Error(error);
      }
    }

    function cleanRecord(record) {
      const keysToDelete = [
        "it_name",
        "mrir_no",
        "qty_advise",
        "curr_val",
        "val_in_fc",
        "val_in_inr",
        "t_ass_val",
        "net_amt",
        "tot_net_amt",
        "po_no",
        "bcd_amt_ndb",
        "bcd_edu_cess_amt_ndb",
        "bcd_hsc_cess_amt_ndb",
        "igst_perc_cr_availed",
        "igst_cess_perc_cr_availed",
        "sgst_perc_cr_availed",
        "sgst_cess_perc_cr_availed",
        "cgst_perc_cr_availed",
        "cgst_cess_perc_cr_availed",
        "id",
        "nctr",
        "po_id",
        "mrir_code",
        "pack_forward_tot",
        "custom_perc_amt",
        "bdc_hsc_cess_amt",
        "trans_code"
      ];
      for (const key of keysToDelete) {
        delete record[key];
      }
      return record;
    }

    if (formDetailData.length >= 1) {
      for (const [index, record] of formDetailData.entries()) {
        cleanRecord(record); 
        
        record.trans_code = 2

        if (record.hasOwnProperty("gst_id") && record.gst_id) {
          // Update record
          delete record.trans_code // added by amit on 15.01.2026
          const dataForUpdate = cleanObject({ ...record });
          const columns = Object.keys(dataForUpdate);
          const values = Object.values(dataForUpdate);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const query = `UPDATE ${TABLE_NAMES.TDFMINWARDGST} 
                     SET ${setClause} 
                     WHERE gst_id = $${columns.length + 1} 
                       AND it_code = $${columns.length + 2}`;

          try {
            await db.query(query, [...values, record.gst_id, record.it_code]);
          } catch (error) {
            console.error(`Error updating record at index ${index}:`, error);
            throw new Error(error);
          }
        } else {
          // Insert record - assign existing gstId before insert
          record.gst_id = gstId;
         
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.TDFMINWARDGST,
            record
          );
          const valuesForInsertQuery = Object.values(record);

          try {
            await db.query(queryForInsert, valuesForInsertQuery);
          } catch (error) {
            console.error(`Error inserting record at index ${index}:`, error);
            throw new Error(`Insert error at index ${index}`);
          }
        }
      }
    }

    // Delete detail records if needed
    if (Array.isArray(deletedData) && deletedData.length > 0) {
      for (const deletedRecord of deletedData) {
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.TDFMINWARDGST}
          WHERE gst_id = $1 and it_code = $2 and qty = $3
        `;

        try {
          await db.query(deleteQuery, [
            deletedRecord.gst_id,
            deletedRecord.it_code,
            deletedRecord.qty,
          ]);
        } catch (error) {
          console.error("Error deleting record:", error);
          throw error;
        }
      }
    }

    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
  }
};

const getCustomerData = async (req, res) => {
  try {
    const { formData } = req.body;
    const { v_type, v_code } = formData;

    let cityResult;

    if (v_type === "C") {
      cityResult = await db.query(
        `SELECT C_CITY AS city_id 
         FROM MOSMCUST 
         WHERE C_CODE = $1 
         `,
        [v_code]
      );
    } else if (v_type === "V") {
      cityResult = await db.query(
        `SELECT V_CITY AS city_id 
         FROM MOMMVEND 
         WHERE V_CODE = $1 
         `,
        [v_code]
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid v_type" });
    }

    const city_id = cityResult.rows[0]?.city_id || null;

    return res.status(200).json({
      success: true,
      city_id: city_id,
    });
  } catch (error) {
    console.error("Error fetching customer city:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// itc authorization logic

exports.authorizedItcData = catchAsync(async (req, res, next) => {
  const { cAuth, gst_id, doc_no, doc_date, v_code, division_id, v_type } =
    req.body.itcData;

  //console.log("ITC Data Received:", req.body.itcData);

  try {
    await db.query("BEGIN");

    // Step 1: Update THFMINWARDGST
    await db.query(
      `UPDATE THFMINWARDGST SET AUTH_FLAG = $1 WHERE GST_ID = $2`,
      [cAuth, gst_id]
    );

    // Step 1: If attempting to unauthorize, perform checks
    if (cAuth === "N") {
      const checkQuery = `
  SELECT 1 FROM (
    SELECT 1
    FROM MHAPBILL
    WHERE BILL_NO = $1
      AND DATE_TRUNC('day', BILL_DT) = DATE_TRUNC('day', $2::DATE)
      AND V_CODE = $3
      AND DIVISION_ID = $4
      AND COALESCE(CANCEL, 'N') = 'N'
    LIMIT 1
  ) AS q1

  UNION

  SELECT 1 FROM (
    SELECT 1
    FROM TDFMTRAN H
    WHERE BILL_NO = $1
      AND DATE_TRUNC('day', BILL_DT) = DATE_TRUNC('day', $2::DATE)
      AND ACC_NO = (CASE WHEN $5 = 'V' THEN 'S' ELSE $5 END) || $3
      AND NOT EXISTS (
        SELECT 1 
        FROM THFMINWARDGST 
        WHERE GST_ID = $6 AND VOUCHER_ID = H.VOUCHER_ID
      )  
      AND EXISTS (
        SELECT 1
        FROM THFMINWARDGST I
        JOIN THFMTRAN D ON I.GST_ID = D.GST_ID
        WHERE I.GST_ID = $6
          AND D.VOUCHER_ID = H.VOUCHER_ID
          AND COALESCE(D.CANCEL, 'N') = 'N'
      )
    LIMIT 1
  ) AS q2

  UNION

  SELECT 1 FROM (
    SELECT 1 
    FROM THMMRCT_WO
    WHERE CHLN_NO = $1
      AND DATE_TRUNC('day', CHLN_DATE) = DATE_TRUNC('day', $2::DATE)
      AND V_CODE = $3
      AND DIVISION_ID = $4
    LIMIT 1
  ) AS q3
  LIMIT 1
`;
      const { rowCount } = await db.query(checkQuery, [
        doc_no,
        doc_date,
        v_code,
        division_id,
        v_type,
        gst_id,
      ]);

      if (rowCount > 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({
          message:
            "YOU CANNOT UNAUTHORIZE THIS ITC AS FINANCIAL ENTRIES ALREADY PROCESSED/SRN GENERATED",
        });
      }
    }

    // Step 2: Update THFMINWARDGST
    await db.query(
      `UPDATE THFMINWARDGST SET AUTH_FLAG = $1 WHERE GST_ID = $2`,
      [cAuth, gst_id]
    );

    // Step 4: Fetch updated auth_flag
    const result2 = await db.query(
      `SELECT AUTH_FLAG FROM THFMINWARDGST WHERE GST_ID = $1`,
      [gst_id]
    );

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message:
        cAuth === "Y"
          ? "ITC  authorized successfully."
          : "ITC unauthorized successfully.",
      cAuth: result2.rows[0].auth_flag,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Authorization error:", error);
    return res.status(500).json({
      type: "error",
      message: "Something went wrong.",
      error: error.message,
    });
  }
});

exports.deleteItcData = catchAsync(async (req, res, next) => {
  const { cAuth, gst_id } = req.body.itcData;

  if (!gst_id) {
    return res.status(400).json({ message: "GST ID is required." });
  }

  if (cAuth === "Y") {
    return res
      .status(403)
      .json({ message: "You cannot delete authorised ITC." });
  }

  try {
    await db.query("BEGIN");

    // Get the record first (so we can reference it if needed)
    const { rows } = await db.query(
      `SELECT * FROM ${TABLE_NAMES.THFMINWARDGST} WHERE GST_ID = $1`,
      [gst_id]
    );

    if (rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "ITC entry not found." });
    }

    const deletedRecord = rows[0];

    const today = new Date();

    // Update THFMTRAN
    await db.query(
      `UPDATE THFMTRAN 
         SET CANCEL = 'Y', POSTED = 'N'
       WHERE VOUCHER_ID = (
         SELECT VOUCHER_ID FROM ${TABLE_NAMES.THFMINWARDGST} WHERE GST_ID = $1
       )`,
      [gst_id]
    );

    // Update MHAPBILL_RC
    await db.query(
      `UPDATE MHAPBILL_RC 
         SET CANCEL_FLAG = 'Y', CANCEL_DT = $2
       WHERE GST_ID = $1`,
      [gst_id, today]
    );

    // Delete from TDFMINWARDGST
    await db.query(
      `DELETE FROM ${TABLE_NAMES.TDFMINWARDGST} WHERE GST_ID = $1`,
      [gst_id]
    );

    // Delete from THFMINWARDGST
    await db.query(
      `DELETE FROM ${TABLE_NAMES.THFMINWARDGST} WHERE GST_ID = $1`,
      [gst_id]
    );

    await db.query("COMMIT");
    return res.status(200).json({ message: "ITC entry deleted successfully." });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error during ITC deletion:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during deletion." });
  }
});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  const { step } = req.query;

  if (step === "items") {
    await postItcData(req, res);
    return;
  }

  if (step === "gst") {
    await postItcGstData(req, res);
    return;
  }

  if (step === "submit") {
    const { form_status } = req.query;

    if (form_status === "Update") {
      await updateItcDetails(req, res);
    } else {
      await postItcDetailData(req, res);
    }
  }

  return res.status(400).json({ message: "Invalid step parameter" });
});
