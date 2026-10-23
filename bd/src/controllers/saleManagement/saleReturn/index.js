const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { generateSingleInsertQuery } = require("../../../utility/query");
const { transformSalesReturnData, transformSalesReturnItem } = require("./presentation");

let TABLE_NAMES = {
    SALE_HDR: `mhsminv_return`,
    SALE_DTL: `mdsminv_return`,
};

const getSaleReturnOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req.query

         let whereClauses = [];
           // Define search keys that should be checked in WHERE clause
 let searchKeys = ["c_code"];

for (const key of searchKeys) {
  if (req.query[key] !== undefined && req.query[key] !== "") {
    whereClauses.push(`h.${key} = '${req.query[key]}'`);
  }
}
                // Build WHERE clause dynamically
                        let queryValues = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

                        let transYear = appFinYear || "2023";
                        let divisionId = appDivisionId || 1;
                        let user_id = userId || 583;
                        // console.log("req_payload:: ", req?.query);
                        // console.log("transformed transYr & divId::", transYear, divisionId);



  
  try {


    let queryParameter = `ORDER BY h.return_id LIMIT 1 OFFSET ${req.query.offset || 0}`;
    let dataCount = 0;

      if(whereClauses.length > 0) {
                      const getCount = await db.query(
                            `SELECT COUNT(*) FROM ${TABLE_NAMES.SALE_HDR} h ${queryValues}`
                          );
                         dataCount = getCount.rows[0]?.count;
                         queryParameter = `${queryValues} ${queryParameter}`;
                     } else{

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(*) AS count FROM mhsminv_return`
        );
        dataCount = Number(getCount.rows[0]?.count || 0);
        break;
      }

      case "Last":
        queryParameter = `ORDER BY h.return_id DESC LIMIT 1`;
        break;

      default:
        queryParameter = `ORDER BY h.return_id LIMIT 1 OFFSET ${req.query.offset || 0}`;
        break;
    }
  }

    //  HEADER WITH JOIN (single query only)
    const headerRes = await db.query(
      `
      SELECT 
        h.*,
        c.c_name,
        CONCAT_WS(', ', c.c_add1, c.c_add2, c.c_add3) AS address,
        UPPER(c.c_state) AS c_state,
        s.acc_desc AS sale_ac_desc,
        d.acc_desc AS debit_acc_desc
      FROM mhsminv_return h
      LEFT JOIN mosmcust c ON c.c_code = h.c_code
      LEFT JOIN mhfmglm s ON s.acc_no = h.sale_ac_head
      LEFT JOIN mhfmglm d ON d.acc_no = h.debit_acc_code
      ${queryParameter}
      `
    );

    if (headerRes.rowCount === 0) {
      return res.status(200).json({
        type: "not_found",
        headerData: null,
        detailData: [],
        message: "No data found",
      });
    }

    const headerRow = headerRes.rows[0];
    const returnId = headerRow.return_id;

    //  DETAIL WITH JOIN (NO LOOP)
    const detailRes = await db.query(
      `
      SELECT 
        d.*, 
        m.it_name
      FROM mdsminv_return d
      LEFT JOIN mommitem m ON m.it_code = d.it_code
      WHERE d.return_id = $1
      `,
      [returnId]
    );

    return res.status(200).json({
      type: "found",
      headerData: headerRow,
      detailData: detailRes.rows,
      count: dataCount,
    });

  } catch (error) {
    console.error("Error in getSaleReturnOnQuery:", error);

    return res.status(500).json({
      message: "Internal server error on query",
    });
  }
};

// const helpListData = async (req, res) => {
//   const { help_list, c_code, inv_id ,form_status} = req.query;

//   //  Customer List
//   if (help_list === "cCode") {
//     // const custNoList = await db.query(`
//     //  SELECT c_name, c_code,
//     //  CONCAT_WS(', ', c_add1, c_add2, c_add3) AS address,
//     //  UPPER(c_state) AS c_state
//     //  FROM mosmcust 
//     //  ORDER BY c_name;

//     // `);
//     const custNoList = await db.query(`
//     SELECT 
//   m.c_name,
//   m.c_code,
//   CONCAT_WS(', ', m.c_add1, m.c_add2, m.c_add3) AS address,
//   UPPER(m.c_state) AS c_state,
//   s.gst_state_code AS state_code
// FROM mosmcust m
// LEFT JOIN integral.moitstate s
//   ON UPPER(TRIM(s.state_name)) = UPPER(TRIM(m.c_state))
//   AND s.type = 'S'
// ORDER BY m.c_name;

//     `);

//     return res.status(200).json(custNoList.rows);
//   }

//   //  Invoice No based on c_code
//   if (help_list === "Invoice") {
//     const invList = await db.query(
//       `
//       SELECT inv_id,inv_no 
//       FROM mhsminv
//       WHERE c_code = $1
//       AND inv_type = 'T'
//       ORDER BY inv_no DESC
//       `,
//       [c_code] 
//     );

//     return res.status(200).json(invList.rows);
//   }

//    if (help_list === "Sale") {
//     const custNoList = await db.query(`
//         select acc_no , acc_desc from mhfmglm order by acc_desc
//     `);

//     return res.status(200).json(custNoList.rows);
//   }

//    if (help_list === "DB") {
//     const custNoList = await db.query(`
//        select acc_no , acc_desc from mhfmglm order by acc_desc
//     `);

//     return res.status(200).json(custNoList.rows);
//   }

//    if (help_list === "Item") {
//     const custNoList = await db.query(`
//        SELECT 
//     i.it_code,
//     m.it_name
// FROM mdsminv i
// JOIN mommitem m 
//     ON i.it_code = m.it_code
// WHERE i.inv_id = $1
//     `,[inv_id]);

//     return res.status(200).json(custNoList.rows);
//   }
// };

const helpListData = async (req, res) => {
  const { help_list, c_code, inv_id, form_status } = req.query;

  // Customer List
  if (help_list === "cCode") {

    let query = "";
    let params = [];

    if (form_status === "Search") {
      //  SEARCH case → only c_code from return table
     if (form_status === "Search") {
  query = `
    SELECT DISTINCT
      m.c_name,
      m.c_code,
      CONCAT_WS(', ', m.c_add1, m.c_add2, m.c_add3) AS address,
      UPPER(m.c_state) AS c_state,
      s.gst_state_code AS state_code
    FROM mhsminv_return h
    JOIN mosmcust m ON m.c_code = h.c_code
    LEFT JOIN moitstate s
      ON UPPER(TRIM(s.state_name)) = UPPER(TRIM(m.c_state))
      AND s.type = 'S'
    ORDER BY m.c_name;
  `;
}
    } else {
      //  Normal case (existing query)
      query = `
        SELECT 
          m.c_name,
          m.c_code,
          CONCAT_WS(', ', m.c_add1, m.c_add2, m.c_add3) AS address,
          UPPER(m.c_state) AS c_state,
          s.gst_state_code AS state_code
        FROM mosmcust m
        LEFT JOIN moitstate s
          ON UPPER(TRIM(s.state_name)) = UPPER(TRIM(m.c_state))
          AND s.type = 'S'
        ORDER BY m.c_name;
      `;
    }

    const custNoList = await db.query(query, params);
    return res.status(200).json(custNoList.rows);
  }

  // Invoice No based on c_code
  if (help_list === "Invoice") {
    const invList = await db.query(
      `
      SELECT inv_id, inv_no 
      FROM mhsminv
      WHERE c_code = $1
    --  AND inv_type = 'T'    commented out to allow all invoice types  by akshay 3/8/26
      ORDER BY inv_no DESC
      `,
      [c_code]
    );

    return res.status(200).json(invList.rows);
  }

  if (help_list === "Sale") {
    const custNoList = await db.query(`
      select acc_no , acc_desc from mhfmglm order by acc_desc
    `);

    return res.status(200).json(custNoList.rows);
  }

  if (help_list === "DB") {
    const custNoList = await db.query(`
      select acc_no , acc_desc from mhfmglm order by acc_desc
    `);

    return res.status(200).json(custNoList.rows);
  }

  if (help_list === "Item") {
    const custNoList = await db.query(`
      SELECT 
        i.it_code,
        m.it_name
      FROM mdsminv i
      JOIN mommitem m 
        ON i.it_code = m.it_code
      WHERE i.inv_id = $1
    `, [inv_id]);

    return res.status(200).json(custNoList.rows);
  }
};


exports.verifyHSNCode = async (req, res) => {
  try {
    const {
      it_code,
      c_code,
      division_id,
      trans_year,
      inv_id 
    } = req.query;

    //  validation
    if (!it_code || !c_code || !division_id || !trans_year) {
      return res.status(400).json({
        message: "Missing required params",
      });
    }

    // =========================
    // 1. GET HSN CODE
    // =========================
    const hsnResult = await db.query(
      `SELECT HSN_SAC_CODE FROM MOMMITEM WHERE IT_CODE = $1`,
      [it_code]
    );

    if (hsnResult.rows.length === 0) {
      return res.json({});
    }

    const hsn_sac_code = hsnResult.rows[0].hsn_sac_code;

    // =========================
    // 2. GET GST STATE CODE
    // =========================
    const gstStateResult = await db.query(
      `SELECT GST_STATE_CODE 
       FROM MOITSTATE 
       WHERE TYPE = 'S' 
       AND STATE_ID = (
         SELECT STATE_ID FROM MOITDIVISION WHERE DIVISION_ID = $1
       ) LIMIT 1`,
      [division_id]
    );

    const gst_state_code = gstStateResult.rows[0]?.gst_state_code;

    let gstData = {};

    // =========================
    // 3. GST FUNCTION CALL
    // =========================
    if (hsn_sac_code && gst_state_code) {
      const gstResult = await db.query(
        `SELECT * FROM sm_so_fill_gst_dtl_itemwise($1, $2, NULL, $3, 0, $4)`,
        [
          hsn_sac_code,
          c_code,
          it_code,
          gst_state_code,
        ]
      );

      if (gstResult.rows.length > 0) {
        const row = gstResult.rows[0];

        gstData = {
          sgst: row.gst_sgst_val,
          cgst: row.gst_cgst_val,
          igst: row.gst_igst_val,
          sgst_cess: row.gst_sgst_cess_val,
          cgst_cess: row.gst_cgst_cess_val,
          igst_cess: row.gst_igst_cess_val,
        };
      }
    }

    // =========================
// 4. GET DISCOUNT FROM mdsminv
// =========================
let discount_val = 0;

if (inv_id) {
  const discountResult = await db.query(
    `SELECT discount
     FROM mdsminv 
     WHERE inv_id = $1 AND it_code = $2 
     LIMIT 1`,
    [inv_id, it_code]
  );

  if (discountResult.rows.length > 0) {
    discount_val = discountResult.rows[0].discount || 0;
  }
}

    // =========================
    // 5. FINAL RESPONSE
    // =========================
    return res.json({
      hsn_sac_code,
        discount_val,
      ...gstData,
    });

  } catch (err) {
    console.error("GST API Error:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

 const submitSaleReturn = async (req, res) => {
  const { header = {}, details = [] } = req.body;
const {trans_year, division_id} = header;
  try {
    await db.query("BEGIN");

    //  1. Generate return_id
    const seqRes = await db.query(
      `SELECT nextval('s_mhsminv_return_id') AS return_id`
    );

    const return_id = seqRes.rows[0]?.return_id;

    if (!return_id) {
      throw new Error("Failed to generate return_id");
    }

    //  2. Generate return_no
    // const returnNoRes = await db.query(
    //   `SELECT COALESCE(MAX(return_no::numeric), 0) + 1 AS return_no 
    //    FROM mhsminv_return`
    // );

     // Generate return_no
        const returnNoRes = await db.query(`select geninv_return_no($1,$2,$3) as return_no`, [
          "T",
          trans_year,
          division_id,
        ]);
    

    const return_no = returnNoRes.rows[0]?.return_no;

    //  3. Transform HEADER ( main use)
    const headerData = transformSalesReturnData({
      ...header,
      return_id,
      return_no,
    });

    //  4. Insert HEADER
    const headerQuery = generateSingleInsertQuery(
      "integral.mhsminv_return",
      headerData
    );

    await db.query(headerQuery, Object.values(headerData));

    //  5. Insert DETAILS ( transform use)
    for (const row of details) {
      const detailData = transformSalesReturnItem({
        ...row,
        return_id, // attach same id
      });

      const detailQuery = generateSingleInsertQuery(
        "mdsminv_return",
        detailData
      );

      await db.query(detailQuery, Object.values(detailData));
    }

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Sale Return saved successfully!",
      return_id,
      return_no,
    });

  } catch (err) {
    await db.query("ROLLBACK");

    console.error(" Sale Return Insert Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save Sale Return",
    });
  }
};


const updateSaleReturn = async (req, res) => {
  const {
    header = {},
    inserted = [],
    updated = [],
    deleted = [],
  } = req.body;

  try {
    await db.query("BEGIN");

    const { return_id } = header;

    if (!return_id) {
      throw new Error("return_id is required");
    }

    // =====================================================
    //  STEP 1: DELETE DETAILS
    // =====================================================
    for (const row of deleted) {
      await db.query(
        `DELETE FROM mdsminv_return 
         WHERE return_id = $1 AND it_code = $2`,
        [row.return_id || return_id, row.it_code]
      );
    }

    // =====================================================
    //  STEP 2: UPDATE DETAILS 
    // =====================================================
    for (const row of updated) {
  const detailData = transformSalesReturnItem({
    ...row,
    return_id: row.return_id || return_id,
  });

   delete detailData.create_id;
   delete detailData.create_date;

  detailData.update_id = row.update_id;
  detailData.update_date = new Date(); 


  const columns = Object.keys(detailData).filter(
    (col) => col !== "return_id"
  );

  const values = columns.map((col) => detailData[col]);

  const setClause = columns
    .map((col, idx) => `${col} = $${idx + 1}`)
    .join(", ");

  //  WHERE  old_it_code
  values.push(detailData.return_id, row.old_it_code);

  await db.query(
    `UPDATE mdsminv_return 
     SET ${setClause}
     WHERE return_id = $${values.length - 1}
     AND it_code = $${values.length}`,
    values
  );
}

    // =====================================================
    //  STEP 3: INSERT DETAILS ()
    // =====================================================
    for (const row of inserted) {
      const detailData = transformSalesReturnItem({
        ...row,
        return_id: row.return_id || return_id,
      });

      // Create info
  detailData.create_id = row.create_id;
  detailData.create_date = new Date();

  // Update info nahi hoga
  delete detailData.update_id;
  delete detailData.update_date;

      const insertQuery = generateSingleInsertQuery(
        "mdsminv_return",
        detailData
      );

      await db.query(insertQuery, Object.values(detailData));
    }

    // =====================================================
    //  STEP 4: UPDATE HEADER 
    // =====================================================
    const headerData = transformSalesReturnData(header);

    delete headerData.create_id;
    delete headerData.create_date;

    headerData.update_id = header.update_id;
    headerData.update_date = new Date();

    const columns = Object.keys(headerData).filter(
      (col) => col !== "return_id"
    );

    if (columns.length > 0) {
      const values = columns.map((col) => headerData[col]);

      const setClause = columns
        .map((col, idx) => `${col} = $${idx + 1}`)
        .join(", ");

      values.push(return_id);

      await db.query(
        `UPDATE mhsminv_return 
         SET ${setClause}
         WHERE return_id = $${values.length}`,
        values
      );
    }

    await db.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Sale Return Updated Successfully",
    });

  } catch (err) {
    await db.query("ROLLBACK");

    console.error("Update Sale Return Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
    if (['Query','Search'].includes(req?.query?.formStatus)) {
        await getSaleReturnOnQuery(req, res);
        return;
    }
     if(req?.query?.help_list){
        await helpListData(req, res)
        return;
    }
});

exports.handleSubmitFormData = catchAsync(async (req, res, next) => {
    if (req?.query?.form_status && req?.query?.form_status === "Update") {
        await updateSaleReturn(req, res);
        return;
    }
    if (req?.query?.form_status === "Insert") {
        await submitSaleReturn(req, res);
        return;
    }
});



exports.authSaleReturn = catchAsync(async (req, res) => {
  const { return_id, auth_flag } = req.body.saleReturnData; // ✅ fixed

  if (!return_id || !auth_flag) {
    return res.status(400).json({
      message: "return_id and auth_flag are required",
    });
  }

  try {
    await db.query("begin");

    const authInv = await db.query(
      `update mhsminv_return 
       set auth_flag = $1 
       where return_id = $2 
       and auth_flag = 'N'`,
      [auth_flag, return_id],
    );

    if (authInv.rowCount === 0) {
      await db.query("rollback");
      return res.status(400).json({
        message: "Sale Return already authorised or not found",
      });
    }

    await db.query("commit");

    // const getSaleVouchNo = await db.query(
    //   `
    //      select voucher_no 
    //       from thfmtran
    //       where trans_type like 'S%'
    //       and bill_id = $1
    //       order by voucher_no desc
    //       limit 1;
    //   `,
    //   [inv_id],
    // );

    // let saleVouchNo = "";
    // if (getSaleVouchNo.rowCount !== 0) {
    //   saleVouchNo = getSaleVouchNo.rows[0].voucher_no;
    // }

    res.status(200).json({
      type: "Success",
      message: `Sale Return Successfully Authorised`,
      // voucher_no: saleVouchNo,
    });
  } catch (error) {
    await db.query("rollback"); // ✅ important
    return res.status(500).json({
      type: "error",
      message:
        error.message || "Something went wrong with Sale Return Authorisation",
    });
  }
});