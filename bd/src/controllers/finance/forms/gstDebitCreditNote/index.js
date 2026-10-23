

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

const { transformTran, transformTranDetails } = require("./presentation");

const TABLE_NAMES = {
  THFMTRANGST: "thfmtran_gst_dbcr",
  TDFMTRANGST: "tdfmtran_gst_dbcr",
};

// for dropdown data

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const reasonList = await db.query(
    `SELECT REASON_DESC,REASON_ID FROM MOFMDNCRADVREFD_REASON `
  );

  return res.status(200).json({
    reason: reasonList.rows,
  });
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  console.log("userId", userId);

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["party_code"];

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
    let queryParameter = `ORDER BY trans_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(trans_id) FROM thfmtran_gst_dbcr where DIVISION_ID = $1
AND 
TRANS_TYPE IN ('C','D')  ${queryValues}
                      `,
        [divisionId]
      );

      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
      console.log("queryParameter", queryParameter);
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(trans_id) FROM thfmtran_gst_dbcr where DIVISION_ID = $1
AND 
TRANS_TYPE IN ('C','D') ;
                      `,
            [divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY trans_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY trans_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const thfmtranGstData = await db.query(
      `SELECT * FROM thfmtran_gst_dbcr where DIVISION_ID = $1
AND 
TRANS_TYPE IN ('C','D') 
         ${queryParameter}
                    `,
      [divisionId]
    );  

     if (thfmtranGstData.rowCount == 0) {
     // throw new Error("No matching record found");
     return res.status(200).json({ success: false, message: "No matching record found" , thfmtranGstData: [], getCount: 0});
    }


    const transId = thfmtranGstData.rows[0]?.trans_id;
    const vendFlag = thfmtranGstData.rows[0]?.vend_cust_flag;
    const partyCode = thfmtranGstData.rows[0]?.party_code;
    const orderId = thfmtranGstData.rows[0]?.order_id;
    const transDate = thfmtranGstData.rows[0]?.trans_date;
    const subReverse = thfmtranGstData.rows[0]?.subject_2_reverse;
    const invId = thfmtranGstData.rows[0]?.inv_id;
    const transYear = thfmtranGstData.rows[0]?.trans_year;
    const profInvId = thfmtranGstData.rows[0]?.prof_inv_id;

    console.log(transId);

    // POST QUERY DATA

    if (vendFlag === "C") {
      const partyDtl = await db.query(
        `SELECT 
       ST.C_NAME || 
       CASE 
         WHEN ST.C_NAME1 IS NULL THEN '' 
         ELSE '-' || ST.C_NAME1 
       END AS party_name,  -- changed alias to match below
       ST.C_CITY AS party_city
     FROM MOSMCUST ST
     WHERE COALESCE(ST.ACTIVE, 'N') = 'Y'
       AND ST.C_CODE = $1`,
        [partyCode]
      );

      if (thfmtranGstData.rows.length > 0) {
        thfmtranGstData.rows[0].party_name =
          partyDtl.rowCount > 0 ? partyDtl.rows[0].party_name : "";
        thfmtranGstData.rows[0].party_city =
          partyDtl.rowCount > 0 ? partyDtl.rows[0].party_city : "";
      }
    } else {
      const vendorDtl = await db.query(
        `SELECT 
       ND.V_NAME || 
       CASE 
         WHEN ND.V_NAME1 IS NULL THEN '' 
         ELSE '-' || ND.V_NAME1 
       END AS party_name,  -- changed alias to match below
       ND.V_CITY AS party_city
     FROM MOMMVEND ND
     WHERE COALESCE(ND.ACTIVE, 'N') = 'Y'
       AND ND.V_CODE = $1`,
        [partyCode]
      );

      if (thfmtranGstData.rows.length > 0) {
        thfmtranGstData.rows[0].party_name =
          vendorDtl.rowCount > 0 ? vendorDtl.rows[0].party_name : "";
        thfmtranGstData.rows[0].party_city =
          vendorDtl.rowCount > 0 ? vendorDtl.rows[0].party_city : "";
      }
    }

    if (vendFlag === "C") {
      const orderDtl = await db.query(
        ` SELECT 
  DR.ORDER_NO as order_no, 
  DR.ORDER_DT as order_dt
FROM MHSMORDR DR
WHERE COALESCE(DR.FLAG, 'N') = 'Y'
  AND COALESCE(DR.CANCEL_FLAG, 'N') = 'N'
  AND $1 BETWEEN DR.EFF_DT AND COALESCE(DR.END_DT, CURRENT_DATE)
  AND DR.C_CODE = $2
  AND DR.ORDER_ID = $3;
`,
        [transDate, partyCode, orderId]
      );

      if (thfmtranGstData.rows.length > 0) {
        thfmtranGstData.rows[0].order_no =
          orderDtl.rowCount > 0 ? orderDtl.rows[0].order_no : "";
        thfmtranGstData.rows[0].order_dt =
          orderDtl.rowCount > 0 ? dateFormater(orderDtl.rows[0].order_dt) : "";
      }
    } else {
      const orderDtl1 = await db.query(
        `SELECT 
       PO.PO_NO AS order_no, 
       PO.PO_DATE AS order_dt
     FROM MHMMPO PO
     WHERE COALESCE(PO.FLAG, 'N') = 'F'
       AND COALESCE(PO.CANCEL_FLAG, 'N') = 'N'
       AND $1 BETWEEN PO.PO_EFF_DT AND COALESCE(PO.PO_END_DT, CURRENT_DATE)
       AND PO.V_CODE = $2
       AND PO.PO_ID = $3`,
        [transDate, partyCode, orderId]
      );

      if (thfmtranGstData.rows.length > 0) {
        thfmtranGstData.rows[0].order_no =
          orderDtl1.rowCount > 0 ? orderDtl1.rows[0].order_no : "";
        thfmtranGstData.rows[0].order_dt =
          orderDtl1.rowCount > 0
            ? dateFormater(orderDtl1.rows[0].order_dt)
            : "";
      }
    }

    if (subReverse === "N") {
      const invDtl = await db.query(
        ` SELECT VV.INV_NO as inv_no, VV.INV_DT as inv_dt
		  FROM MHSMINV VV
		 WHERE VV.INV_ID = $1`,
        [invId]
      );

      if (thfmtranGstData.rows.length > 0) {
        thfmtranGstData.rows[0].inv_no =
          invDtl.rowCount > 0 ? invDtl.rows[0].inv_no : "";
        thfmtranGstData.rows[0].inv_dt =
          invDtl.rowCount > 0 ? dateFormater(invDtl.rows[0].inv_dt) : "";
      }
    } else {
      const invDtl1 = await db.query(
        ` SELECT VV.INV_NO as inv_no, VV.INV_DT as inv_dt
		  FROM MHAPBILL_RC VV
		 WHERE VV.rc_INV_ID = $1`,
        [invId]
      );

      if (thfmtranGstData.rows.length > 0) {
        thfmtranGstData.rows[0].inv_no =
          invDtl1.rowCount > 0 ? invDtl1.rows[0].inv_no : "";
        thfmtranGstData.rows[0].inv_dt =
          invDtl1.rowCount > 0 ? dateFormater(invDtl1.rows[0].inv_dt) : "";
      }
    }

    const profInvDtl = await db.query(
      `  SELECT VV.PROF_NO as prof_no, VV.PROF_DT as prof_dt
    FROM MHSMPROFINV VV
   WHERE VV.TRANS_YEAR = $1
     AND VV.ORDER_ID = $2
     AND $3 = 'C' 
     AND VV.C_CODE = $4
     AND VV.PROF_ID = $5`,
      [transYear, orderId, vendFlag, partyCode, profInvId]
    );

    if (thfmtranGstData.rows.length > 0) {
      thfmtranGstData.rows[0].prof_inv_no =
        profInvDtl.rowCount > 0 ? profInvDtl.rows[0].prof_no : "";
      thfmtranGstData.rows[0].prof_inv_dt =
        profInvDtl.rowCount > 0 ? dateFormater(profInvDtl.rows[0].prof_dt) : "";
    }

    const vchrDtl = await db.query(
      `	select voucher_no   
	  from thfmtran
	 where trans_id = $1`,
      [transId]
    );

    if (thfmtranGstData.rows.length > 0) {
      thfmtranGstData.rows[0].voucher_no =
        vchrDtl.rowCount > 0 ? vchrDtl.rows[0].voucher_no : "";
    }

    thfmtranGstData.rows[0].trans_date =
      thfmtranGstData.rowCount > 0
        ? dateFormater(thfmtranGstData.rows[0].trans_date)
        : "";

    const tdfmtranGstData = await db.query(
      `SELECT * FROM tdfmtran_gst_dbcr
 WHERE trans_id = $1
 `,
      [transId]
    );

    // POST-QUERY DATA
    if (tdfmtranGstData.rows.length > 0) {
      await Promise.all(
        tdfmtranGstData.rows.map(async (item) => {
          if (item.it_code !== null) {
            const it_name = await db.query(
              `SELECT MM.IT_NAME_LONG as it_name, MM.HSN_SAC_CODE as hsn_sac_code
	  FROM MOMMITEM MM
	 WHERE MM.IT_CODE = $1 `,
              [item.it_code]
            );

            item.it_name = it_name.rows[0]?.it_name || null;
            // item.hsn_sac_code = it_name.rows[0]?.hsn_sac_code || null;
          }

          if (item.it_code === "ADVANCE") {
            item.it_name = "ADVANCE";
            item.hsn_sac_code = "ADVANCE";
          }

          if (item.inv_id !== null) {
            const hsn_sac_code = await db.query(
              `SELECT MM.HSN_SAC_CODE as hsn_sac_code
	  FROM MOSMPROD MM
	  WHERE MM.IT_CODE = $1 `,
              [item.it_code]
            );

            item.hsn_sac_code = hsn_sac_code.rows[0]?.hsn_sac_code || null;
          }

          if (item.it_code === "ADVANCE") {
            item.it_name = "ADVANCE";
            item.hsn_sac_code = "ADVANCE";
          }

          if (item.sal_pur_acc !== null) {
            const acc_name = await db.query(
              `	select acc_desc
	  from VWMDFMGLM
	 where division_id     = $1
	   and trans_year      = $2
	   and coalesce(active,'Y') = 'Y'  	   
	   and ACC_NO          = $3 `,
              [divisionId, appFinYear, item.sal_pur_acc]
            );

            item.acc_name = acc_name.rows[0]?.acc_desc || null;
          }
        })
      );
    }

    const responseData = {
      thfmtranGstData: thfmtranGstData.rows[0],
      tdfmtranGstData: tdfmtranGstData.rows,
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
  let {
    appDivisionId,
    appFinYear,
    appUserId,
    form_status,
    help_list,
    vend_cust_flag,
    party_code,
    order_id,
    subject_2_reverse,
    inv_id,
    prof_inv_id,
    trans_type,
  } = req?.query;
  if (!["Insert", "Update"].includes(form_status)) {
    return res.status(200).send([]);
  }

  // Convert empty strings or undefined to null

  const cleanToNull = (val) => {
    return val === undefined || val === null || val === "" || val === "null"
      ? null
      : val.trim?.() ?? val;
  };

  order_id = cleanToNull(order_id);
  inv_id = cleanToNull(inv_id);
  prof_inv_id = cleanToNull(prof_inv_id);

  if (help_list === "prof") {
    const profInv = await db.query(
      ` SELECT VV.PROF_ID, VV.PROF_NO, VV.PROF_DT
  FROM MHSMPROFINV VV
 WHERE VV.TRANS_YEAR = $1
   AND VV.ORDER_ID = $2
   AND $3 = 'C' 
   AND VV.C_CODE = 'B0016'
 ORDER BY VV.PROF_ID  `,
      [appFinYear, order_id, vend_cust_flag]
    );

    return res.status(200).json(profInv.rows);
  } else if (help_list === "inv") {
    console.log("inv selected");
    const invDtl = await db.query(
      ` SELECT VV.INV_ID, VV.INV_NO, VV.INV_DT
  FROM MHSMINV VV
 WHERE  VV.ORDER_ID = $1
   AND (($2 = 'V' AND VV.V_CODE = $3 )OR
    ($2 = 'C' AND ((VV.C_CODE = $3 OR VV.BILL_TO_CODE = $3)
    OR VV.SHIP_TO_CODE = $3)))
  /* AND NVL(VV.AUTH_FLAG, 'N') = 'Y'*/
   AND $4 = 'N'
UNION
SELECT VV.rc_INV_ID, VV.INV_NO, VV.INV_DT
  FROM MHAPBILL_RC VV
 WHERE  VV.ORDER_ID = $1
   AND (($2 = 'V' AND VV.V_CODE = $3 )OR
        ($2 = 'C' AND VV.C_CODE = $3 ))
  /* AND NVL(VV.AUTH_FLAG, 'N') = 'Y'*/
   AND $4 = 'Y'   
 ORDER BY 1    
	`,
      [
        order_id,
        vend_cust_flag,
        party_code,
        subject_2_reverse,
        // order_id,
      ]
    );

    return res.status(200).json(invDtl.rows);
    //return res.status(200).json(formattedInvoices.rows)
    // dateFormater(inv.invoice_dt)
  } else if (help_list === "party") {
    const partyDtl = await db.query(
      `SELECT 
  ST.C_NAME ||
  CASE 
    WHEN ST.C_NAME1 IS NULL THEN ''
    ELSE '-' || ST.C_NAME1
  END AS name,
  ST.C_CODE AS code
FROM MOSMCUST ST
WHERE COALESCE(ST.ACTIVE, 'N') = 'Y'
  AND $1 = 'C'

UNION

SELECT 
  ND.V_NAME ||
  CASE 
    WHEN ND.V_NAME1 IS NULL THEN ''
    ELSE '-' || ND.V_NAME1
  END AS name,
  ND.V_CODE AS code
FROM MOMMVEND ND
WHERE COALESCE(ND.ACTIVE, 'N') = 'Y'
  AND $1 = 'V'
ORDER BY 1;  `,
      [vend_cust_flag]
    );
    return res.status(200).json(partyDtl.rows);
  } else if (help_list === "order") {
    const orderDtl = await db.query(
      `	  
					 SELECT DISTINCT 
  HH.ORDER_ID, 
  DR.ORDER_NO, 
  DR.ORDER_DT, 
  DR.C_PO_NO, 
  TO_CHAR(DR.C_PO_DT, 'DD-MON-YYYY') AS C_PO_DT, 
  HH.INV_NO
FROM MHSMinv HH
JOIN MHSMORDR DR ON HH.ORDER_ID = DR.ORDER_ID
WHERE COALESCE(DR.FLAG, 'N') = 'Y'
  AND COALESCE(DR.CANCEL_FLAG, 'N') = 'N'
  -- AND $3 BETWEEN DR.EFF_DT AND COALESCE(DR.END_DT, CURRENT_DATE)
  AND HH.BILL_TO_CODE = $1
  AND $2 = 'C'

UNION

SELECT 
  PO.PO_ID, 
  PO.PO_NO, 
  PO.PO_DATE, 
  NULL AS C_PO_NO, 
  NULL AS C_PO_DT, 
  NULL AS INV_NO
FROM MHMMPO PO
WHERE COALESCE(PO.FLAG, 'N') = 'F'
  AND COALESCE(PO.CANCEL_FLAG, 'N') = 'N'
  -- AND $3 BETWEEN PO.PO_EFF_DT AND COALESCE(PO.PO_END_DT, CURRENT_DATE)
  AND PO.V_CODE = $1
  AND $2 = 'V'

ORDER BY 1  `,
      [party_code, vend_cust_flag]
    );
    return res.status(200).json(orderDtl.rows);
  } else if (help_list === "acc") {
    console.log("acc");
    const accDtl = await db.query(
      `select acc_desc,acc_no 
  from VWMDFMGLM
 where division_id     = $1
   and trans_year      = $2
   and coalesce(active,'N') = 'Y'  `,
      [appDivisionId, appFinYear]
    );
    return res.status(200).json(accDtl.rows);
  } else if (help_list === "item") {
    console.log(
      order_id,
      vend_cust_flag,
      inv_id,
      prof_inv_id,
      subject_2_reverse,
      trans_type
    );
    const itemDtl = await db.query(
      `-- 1st UNION block
SELECT RR.IT_CODE, MM.IT_NAME_LONG, MM.HSN_SAC_CODE
FROM MDSMORDR RR
JOIN MOMMITEM MM ON RR.IT_CODE = MM.IT_CODE
WHERE RR.ORDER_ID = $1::BIGINT
  AND $2 = 'C'
  AND COALESCE(RR.ACTIVE, 'N') = 'Y'
  AND ($3::BIGINT IS NULL)
  AND ($4::BIGINT IS NOT NULL)
  AND (
    EXISTS (
      SELECT 1 FROM MDSMINV DD
      WHERE DD.INV_ID = $4::BIGINT
        AND $5 = 'N'
        AND DD.IT_CODE = RR.IT_CODE
      LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM MDAPBILL_RC DD
      WHERE DD.rc_INV_ID = $4::BIGINT
        AND $5 = 'Y'
        AND DD.IT_CODE = RR.IT_CODE
      LIMIT 1
    )
  )

UNION

-- 2nd UNION block
SELECT RR.IT_CODE, MM.IT_NAME_LONG, MM.HSN_SAC_CODE
FROM MDSMORDR RR
JOIN MOMMITEM MM ON RR.IT_CODE = MM.IT_CODE
WHERE RR.ORDER_ID = $1::BIGINT
  AND $2 = 'C'
  AND COALESCE(RR.ACTIVE, 'N') = 'Y'
  AND ($3::BIGINT IS NULL)
  AND ($4::BIGINT IS NOT NULL)
  AND EXISTS (
    SELECT 1 FROM MDSMPROFINV VD
    WHERE VD.PROF_ID = $4::BIGINT
      AND VD.IT_CODE = RR.IT_CODE
    LIMIT 1
  )

UNION

-- 3rd UNION block
SELECT RR.IT_CODE, MM.IT_NAME_LONG, MM.HSN_SAC_CODE
FROM MDSMORDR RR
JOIN MOMMITEM MM ON RR.IT_CODE = MM.IT_CODE
WHERE RR.ORDER_ID = $1::BIGINT
  AND $2 = 'C'
  AND COALESCE(RR.ACTIVE, 'N') = 'Y'
  AND ($3::BIGINT IS NULL)
  AND ($4::BIGINT IS NULL)

UNION

-- 4th UNION block
SELECT RR.IT_CODE, MM.IT_NAME_LONG, MM.HSN_SAC_CODE
FROM MDMMPOIT RR
JOIN MOMMITEM MM ON RR.IT_CODE = MM.IT_CODE
WHERE RR.PO_ID = $1::BIGINT
  AND $2 = 'V'
  AND COALESCE(RR.ACTIVE, 'N') = 'Y'
  AND (
    ($3::BIGINT IS NULL)
    OR (
      ($3::BIGINT IS NOT NULL) AND EXISTS (
        SELECT 1 FROM MDSMINV DD
        WHERE DD.INV_ID = $3::BIGINT
          AND $5 = 'N'
          AND DD.IT_CODE = RR.IT_CODE
        LIMIT 1
      )
    )
  )

UNION

-- 5th UNION block
SELECT RR.IT_CODE, MM.IT_NAME_LONG, MM.HSN_SAC_CODE
FROM MDMMPOWO RR
JOIN MOMMITEM MM ON RR.IT_CODE = MM.IT_CODE
WHERE RR.PO_ID = $1::BIGINT
  AND $2 = 'V'
  AND (
    ($3::BIGINT IS NULL)
    OR (
      ($3::BIGINT IS NOT NULL) AND EXISTS (
        SELECT 1 FROM MDSMINV DD
        WHERE DD.INV_ID = $3::BIGINT
          AND $5 = 'N'
          AND DD.IT_CODE = RR.IT_CODE
        LIMIT 1
      )
    )
  )

UNION

-- 6th UNION block (ADVANCE item)
SELECT 'ADVANCE' AS IT_CODE, 'ADVANCE' AS IT_NAME_LONG, 'ADVANCE' AS HSN_SAC_CODE
WHERE $6 = 'A'

UNION

-- 7th UNION block
SELECT IT_CODE, IT_NAME_LONG, HSN_SAC_CODE
FROM MOMMITEM
WHERE COALESCE(ACTIVE, 'N') = 'Y'
  AND ($1::BIGINT IS NULL)

UNION

-- 8th UNION block
SELECT RR.IT_CODE, MM.IT_NAME_LONG, MM.HSN_SAC_CODE
FROM MDSMINV RR
JOIN MOMMITEM MM ON RR.IT_CODE = MM.IT_CODE
WHERE RR.INV_ID = $3::BIGINT
  AND COALESCE(MM.ACTIVE, 'N') = 'Y'

ORDER BY 1
`,
      [
        order_id,
        vend_cust_flag,
        inv_id,
        prof_inv_id,
        subject_2_reverse,
        trans_type,
      ]
    );

    return res.status(200).json(itemDtl.rows);
  }
};


// const postGstDebitCreditDetails = async (req, res) => {
//   try {
//     await db.query("Begin");
//     const { formData, formDetailData, finYear, divisionId } = req.body;
//     console.log(req.body);
//     //  formData.vend_cust_flag = vendCustFlag;
//     let trans_id = null;

//     const transIdResult = await db.query(
//       `SELECT nextval('SEQ_TDFMTRAN_GST_DBCR_ID')`
//     );
//     trans_id = transIdResult.rows[0].nextval;
//     console.log("Generated trans_id:", trans_id);

//     // Step 1: Call the function to get the next trans no
//     const { rows } = await db.query(
//       `select generate_trans_no($1, $2, $3)  AS trans_no`,
//       [divisionId, finYear, formData.trans_type]
//     );
//     const transNo = rows[0]?.trans_no;
//     console.log("generated trans no", transNo);

//     // Clean up the formData and add the gstid and itc_sr_no
//     const cleanUserLoginDataForInsert = cleanObject(formData);
//     cleanUserLoginDataForInsert.trans_id = trans_id;
//     cleanUserLoginDataForInsert.trans_no = transNo;
//     cleanUserLoginDataForInsert.trans_year = finYear;
//     cleanUserLoginDataForInsert.division_id = divisionId;

//     // Delete unwanted fields
//     [
//       "party_name",
//       "party_code1",
//       "party_city",
//       "prof_inv_dt",
//       "inv_dt",
//       "inv_no",
//       "prof_inv_no",
//       "disp_status",
//       "voucher_no",
//       "gross_amt",
//       "order_no",
//       "order_dt",
//     ].forEach((field) => delete cleanUserLoginDataForInsert[field]);

//     if (Object.keys(cleanUserLoginDataForInsert).length === 0) {
//       return res.status(400).json({ error: "No valid data to insert" });
//     }

//     const queryForInsert = generateSingleInsertQuery(
//       TABLE_NAMES.THFMTRANGST,
//       cleanUserLoginDataForInsert
//     );
//     const valuesForInsertQuery = Object.values(cleanUserLoginDataForInsert);
//     console.log("valuesForInsertQuery:", valuesForInsertQuery);

//     await db.query(queryForInsert, valuesForInsertQuery);

//     // prepare and insert formDetailData
//     if (formDetailData.length) {
//       const formDetailArray = Array.isArray(formDetailData)
//         ? formDetailData
//         : [formDetailData];

//       for (const [index, record] of formDetailArray.entries()) {
//         // Handle record_id before deleting other fields
//         if (record.record_id === "" || record.record_id === undefined) {
//           record.record_id = null;
//         }

//         if (record.comp_cess_val === "") {
//           record.comp_cess_val = null;
//         }

//         record.trans_id = trans_id;
//         delete record.it_name;
//         delete record.acc_name;
//         delete record.acc_name;
//         delete record.id;
//         delete record.total_amt;
//         delete record.total_gst;
//         delete record.gross_amt;
//         delete record.hsn_sac_code;
//         delete record.total_cgst;
//         delete record.total_sgst;
//         delete record.total_igst;
//         delete record.total_ugst;
//         //delete record.record_id;

//         const queryForInsert = generateSingleInsertQuery(
//           TABLE_NAMES.TDFMTRANGST,
//           record
//         );
//         const valuesForInsertQuery = Object.values(record);

//         try {
//           await db.query(queryForInsert, valuesForInsertQuery);
//         } catch (error) {
//           console.error(
//             `Error inserting division record at index ${index}:`,
//             error
//           );
//           throw new Error(`Division insert error at index ${index}`);
//         }
//       }
//     }

//     await db.query("COMMIT");
//     // Respond only if this is the final step
//     return res.status(200).json({
//       success: true,
//       message: `Trans NUMBER IS ${transNo}`,
//       trans_no: transNo,
//     });
//   } catch (error) {
//     console.error("Error in postGstDebitCredit:", error);
//     await db.query("ROLLBACK");
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };



// chnaged by amit at on dt 24-02-2026 as it has not trasnforming data as per the table structure.


const postGstDebitCreditDetails = async (req, res) => {
  try {
    await db.query("Begin");
    const { formData, formDetailData, finYear, divisionId } = req.body;
    console.log(req.body);
    //  formData.vend_cust_flag = vendCustFlag;
    let trans_id = null;

    const transIdResult = await db.query(
      `SELECT nextval('SEQ_TDFMTRAN_GST_DBCR_ID')`
    );
    trans_id = transIdResult.rows[0].nextval;
    console.log("Generated trans_id:", trans_id);

    // Step 1: Call the function to get the next trans no
    const { rows } = await db.query(
      `select generate_trans_no($1, $2, $3)  AS trans_no`,
      [divisionId, finYear, formData.trans_type]
    );
    const transNo = rows[0]?.trans_no;
    console.log("generated trans no", transNo);

    // Clean up the formData and add the gstid and itc_sr_no
    // const cleanUserLoginDataForInsert = cleanObject(formData);
    // cleanUserLoginDataForInsert.trans_id = trans_id;
    // cleanUserLoginDataForInsert.trans_no = transNo;
    // cleanUserLoginDataForInsert.trans_year = finYear;
    // cleanUserLoginDataForInsert.division_id = divisionId;

    const transformedHeader = transformTran({
      ...formData,
      trans_id,
      trans_no: transNo,
      trans_year: finYear,
      division_id: divisionId,
    });

    // Delete unwanted fields
    // [
    //   "party_name",
    //   "party_code1",
    //   "party_city",
    //   "prof_inv_dt",
    //   "inv_dt",
    //   "inv_no",
    //   "prof_inv_no",
    //   "disp_status",
    //   "voucher_no",
    //   "gross_amt",
    //   "order_no",
    //   "order_dt",
    // ].forEach((field) => delete cleanUserLoginDataForInsert[field]);

    // if (Object.keys(cleanUserLoginDataForInsert).length === 0) {
    //   return res.status(400).json({ error: "No valid data to insert" });
    // }

    // const queryForInsert = generateSingleInsertQuery(
    //   TABLE_NAMES.THFMTRANGST,
    //   cleanUserLoginDataForInsert
    // );
    // const valuesForInsertQuery = Object.values(cleanUserLoginDataForInsert);

    const queryForInsert = generateSingleInsertQuery(
      TABLE_NAMES.THFMTRANGST,
      transformedHeader
    );
    const valuesForInsertQuery = Object.values(transformedHeader);

    console.log("valuesForInsertQuery:", valuesForInsertQuery);

    await db.query(queryForInsert, valuesForInsertQuery);



    // prepare and insert formDetailData
    // if (formDetailData.length) {
    //   const formDetailArray = Array.isArray(formDetailData)
    //     ? formDetailData
    //     : [formDetailData];

    //   for (const [index, record] of formDetailArray.entries()) {
    //     // Handle record_id before deleting other fields
    //     if (record.record_id === "" || record.record_id === undefined) {
    //       record.record_id = null;
    //     }

    //     if (record.comp_cess_val === "") {
    //       record.comp_cess_val = null;
    //     }

    //     record.trans_id = trans_id;
    //     delete record.it_name;
    //     delete record.acc_name;
    //     delete record.acc_name;
    //     delete record.id;
    //     delete record.total_amt;
    //     delete record.total_gst;
    //     delete record.gross_amt;
    //     delete record.hsn_sac_code;
    //     delete record.total_cgst;
    //     delete record.total_sgst;
    //     delete record.total_igst;
    //     delete record.total_ugst;
    //     //delete record.record_id;

    //     const queryForInsert = generateSingleInsertQuery(
    //       TABLE_NAMES.TDFMTRANGST,
    //       record
    //     );
    //     const valuesForInsertQuery = Object.values(record);

    //     try {
    //       await db.query(queryForInsert, valuesForInsertQuery);
    //     } catch (error) {
    //       console.error(
    //         `Error inserting division record at index ${index}:`,
    //         error
    //       );
    //       throw new Error(`Division insert error at index ${index}`);
    //     }
    //   }
    // }


        if (formDetailData?.length) {
        const transformedDetails = transformTranDetails(
          formDetailData,
          trans_id
        );

        for (const [index, record] of transformedDetails.entries()) {
          const queryForInsert = generateSingleInsertQuery(
            TABLE_NAMES.TDFMTRANGST,
            record
          );

          const valuesForInsertQuery = Object.values(record);

          try {
            await db.query(queryForInsert, valuesForInsertQuery);
          } catch (error) {
            console.error(`Detail insert error at index ${index}:`, error);
            throw error;
          }
        }
      }


    await db.query("COMMIT");
    // Respond only if this is the final step
    return res.status(200).json({
      success: true,
      message: `Trans NUMBER IS ${transNo}`,
      trans_no: transNo,
    });
  } catch (error) {
    console.error("Error in postGstDebitCredit:", error);
    await db.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateGstDebitCreditDetails = async (req, res) => {
  const { formData, formDetailData, deletedData } = req.body;

  try {
    await db.query("BEGIN");
    const trans_id = formData?.trans_id;

    // 1. Update THFMTRANGST main form data
    if (Object.keys(req.body).length !== 0) {
      const dataForInsert = { ...formData };

      // Remove unwanted fields
      [
        "party_name",
        "party_code1",
        "party_city",
        "prof_inv_dt",
        "inv_dt",
        "inv_no",
        "prof_inv_no",
        "disp_status",
        "voucher_no",
        "gross_amt",
        "order_no",
        "order_dt",
      ].forEach((field) => delete dataForInsert[field]);

      const dataForUpdate = cleanObject(dataForInsert);
      const columns = Object.keys(dataForUpdate);
      const values = Object.values(dataForUpdate);

      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");

      const query = `UPDATE ${TABLE_NAMES.THFMTRANGST}
                     SET ${setClause}
                     WHERE trans_id = $${columns.length + 1}`;

      await db.query(query, [...values, trans_id]);
    }

    // 2. Utility to clean detail record
    function cleanRecord(record) {
      const keysToDelete = [
        "it_name",
        "acc_name",
        "id",
        "total_cgst",
        "total_sgst",
        "total_igst",
        "total_ugst",
        "hsn_sac_code",
        "total_gst",
        "total_amt",
        "gross_amt",
      ];
      keysToDelete.forEach((key) => delete record[key]);
      return record;
    }

    // 3. Update or Insert Detail Records
    if (Array.isArray(formDetailData) && formDetailData.length > 0) {
      for (const [index, record] of formDetailData.entries()) {
        cleanRecord(record);

        if (record.hasOwnProperty("trans_id") && record.trans_id) {
          // Update record
          const dataForUpdate = cleanObject({ ...record });
          const columns = Object.keys(dataForUpdate);
          const values = Object.values(dataForUpdate);

          const setClause = columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(", ");

          const updateQuery = `UPDATE ${TABLE_NAMES.TDFMTRANGST}
                               SET ${setClause}
                               WHERE trans_id = $${columns.length + 1}
                                 AND it_code = $${columns.length + 2}`;

          await db.query(updateQuery, [
            ...values,
            record.trans_id,
            record.it_code,
          ]);
        } else {
          // Insert new record
          record.trans_id = trans_id;
          if (record.record_id === "" || record.record_id === undefined) {
            record.record_id = null;
          }
          delete record.it_name;
          delete record.acc_name;
          delete record.acc_name;
          delete record.id;
          delete record.total_amt;
          delete record.total_gst;
          delete record.gross_amt;
          delete record.hsn_sac_code;
          delete record.total_cgst;
          delete record.total_sgst;
          delete record.total_igst;
          delete record.total_ugst;

          const insertQuery = generateSingleInsertQuery(
            TABLE_NAMES.TDFMTRANGST,
            record
          );
          const valuesForInsertQuery = Object.values(record);

          await db.query(insertQuery, valuesForInsertQuery);
        }
      }
    }

    // 4. Delete detail records if needed
    if (Array.isArray(deletedData) && deletedData.length > 0) {
      for (const deletedRecord of deletedData) {
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.TDFMTRANGST}
          WHERE trans_id = $1 AND it_code = $2 AND qty = $3
        `;

        await db.query(deleteQuery, [
          deletedRecord.trans_id,
          deletedRecord.it_code,
          deletedRecord.qty,
        ]);
      }
    }

    // 5. Commit the transaction
    await db.query("COMMIT");
    return res.status(200).send({ status: "successfully updated" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction failed:", error);
    return res.status(500).send({
      status: "error",
      message: "Update operation failed",
      details: error.message,
    });
  }
};

exports.authorizedGstDebitCreditData = catchAsync(async (req, res, next) => {
  const { auth_flag, trans_id } = req.body.formData;

  try {
    await db.query("BEGIN");

    // Step 1: Update THFMTRANGST
    await db.query(
      `UPDATE ${TABLE_NAMES.THFMTRANGST} SET AUTH_FLAG = $1 WHERE TRANS_ID = $2`,
      [auth_flag, trans_id]
    );


    // Step 2: Fetch updated AUTH_FLAG
    const result = await db.query(
      `SELECT AUTH_FLAG FROM ${TABLE_NAMES.THFMTRANGST} WHERE TRANS_ID = $1`,
      [trans_id]
    );


    // Step 3: Fetch updated voucher_no from THFMTRAN
    const result1 = await db.query(
      `SELECT VOUCHER_NO FROM THFMTRAN WHERE TRANS_ID = $1`,
      [trans_id]
    );


    await db.query("COMMIT");

    const message =
      auth_flag === "N"
        ? "Voucher unauthorized successfully."
        : "Voucher authorized successfully.";

    return res.status(200).json({
      type: "success",
      message,
      auth_flag: result.rows[0]?.auth_flag,
      voucher_no: result1.rows[0]?.voucher_no,
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

const postGstData = async (req, res) => {
  try {
    const { formData, formDetailData, divisionId } = req.body;
    //console.log("req body:", req.body);

    const gst_amt_prc = formDetailData?.[0]?.gst_amt_prc;
    const hsn_sac_code = formDetailData?.[0]?.hsn_sac_code;
    const it_code = formDetailData?.[0]?.it_code;
    const rate = formDetailData?.[0]?.rate;

    const { party_code, order_id, vend_cust_flag } = formData;

    console.log("division_id", divisionId);
    // Get new state code from sequence
    const stateIdResult = await db.query(
      ` SELECT GST_STATE_CODE 
    FROM MOITSTATE S 
   WHERE TYPE = 'S' 
     AND STATE_ID = (SELECT NN.STATE_ID FROM MOITDIVISION NN
                      WHERE NN.DIVISION_ID = $1)
    limit 1`,
      [divisionId]
    );
    const gst_state_code = stateIdResult.rows[0]?.gst_state_code;
    console.log("state_code:", stateIdResult.rows[0]?.gst_state_code);

    // Check if any required field is missing or falsy
    if (


      (!party_code,
      //  !order_id,
      !divisionId,
      !gst_amt_prc,
      !vend_cust_flag,
      !hsn_sac_code,
      !it_code,
      !gst_state_code,
      !rate)


    ) {
      console.log(
        "All form fields must be filled.",
        party_code,
        //  order_id,
        divisionId,
        gst_amt_prc,
        vend_cust_flag,
        hsn_sac_code,
        it_code,
        gst_state_code,
        rate
      );
      //return res.status(400).json({ error: "All form fields must be filled." });
      return;
    }

    console.log(
      "function:",
      hsn_sac_code,
      party_code,
      order_id,
      it_code,
      rate,
      vend_cust_flag,
      gst_state_code
    );

    const result = await db.query(
      `SELECT * FROM fm_gst_dncn_fill_gst_dtl_itemwise($1, $2, $3, $4, $5, $6, $7)`,
      [
        hsn_sac_code,
        party_code,
        order_id || null,
        it_code,
        rate,
        vend_cust_flag,
        gst_state_code,
      ]
    );

    return res.status(200).json({
      success: true,
      tdfmtranGstData: result.rows,
      message: "GST data returned successfully",
    });
  } catch (error) {
    console.error("Error in postGstData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }

});

exports.handlePostFormData = catchAsync(async (req, res, next) => {
  const { step } = req.query;

  if (step === "gst") {
    // This handles both Insert & Update inside postGstData
    await postGstData(req, res);
    return;
  }

  if (step === "submit") {
    const { form_status } = req.query;
    if (form_status === "Update") {
      await updateGstDebitCreditDetails(req, res); // For final update
    } else {
      await postGstDebitCreditDetails(req, res); // For final insert
    }
    return;
  }

  return res.status(400).json({ message: "Invalid step or form_status" });
});








