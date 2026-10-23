const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  generateInsertQuery,
} = require("../../../../utility/query");
const {
  transformMasterToDbData,
  transformNarrationToDbData,
  transformMasterToAPIData,
  transformNarrationToAPIData,
  cashVoucherDataMapping,
  cashVoucherDetailDataMapping,
} = require("./presentation");

const TABLE_NAMES = {
  MOIT_DIVISION: `integral.moitdivision`,
  USER_DIVISION: `integral.user_division`,
  MOIT_USER_SECTION: `integral.moitusersection`,
  MOIT_SECTION: `integral.moitsection`,
  CURRENCY: `integral.currency`,
  ACC_DETAILS: `integral.vwmdfmglm`,
  MOMMCODE: `integral.mommcode`,
  MHFMDATA: `integral.mhfmbank`,
  TDFMOUTS: `integral.TDFMOUTS`,
  THFMOUTS: `integral.THFMOUTS`,
  MHPMEMPM: `integral.mhpmempm`,
  MDFMACCEMP: `integral.mdfmaccemp`,
  THFMCASH: `integral.THFMCASH`,
  TDFMCASH: `integral.TDFMCASH`,
  THFMINWARDGST: `integral.thfminwardgst`,
  MOMMVEND: `integral.mommvend`,
  THFMTTRAN: `integral.thfmtran`,
  MHAPBILL: `integral.mhapbill`,
};

const fetchNarrationDetailRowByAcc = async (acc_no) => {
  let narrationDBData = await db.query(
    `
      SELECT DISTINCT td.*, mo.description AS purpose, mc.description AS cost_center, emp.emp_name as emp_name, acc.acc_desc as acc_desc
        from ${TABLE_NAMES.TDFMCASH} td 
        LEFT JOIN ${TABLE_NAMES.MOMMCODE} mo ON td.pur_code = mo.code AND mo.cat_group = 'PURP'
        LEFT JOIN ${TABLE_NAMES.MOMMCODE} mc ON td.cost_centr = mc.code AND mc.cat_group = 'COSTC'
        LEFT JOIN ${TABLE_NAMES.ACC_DETAILS} acc ON td.acc_no = acc.acc_no
        LEFT JOIN ${TABLE_NAMES.MHPMEMPM} emp ON td.emp_cd = emp.emp_cd
        WHERE td.acc_no = '${acc_no}' 
        ORDER BY ref_id, srl_no 
        LIMIT 1 OFFSET 0
      `
  );
  return narrationDBData?.rows?.length > 0
    ? narrationDBData?.rows?.[0]?.ref_id
    : null;
};

exports.getCashVoucherBaseConstants = catchAsync(async (req, res, next) => {
  // QUERY data
  let additionResponseObj = {};
  if (
    ["Query", "Last", "Next", "Prev", "First", "Search"].includes(
      req.query?.get_data
    ) ||
    req.query?.form_status === "Search"
  ) {
    // search query execution
    let searchKeys = ["ref_date", "ref_no", "voucher_no", "posted"];

    let whereClauses = [];

    for (const key of searchKeys) {
      if (req.query[key] !== undefined && req.query[key] !== "") {
        whereClauses.push(`${key} = '${req.query[key]}'`);
      }
    }

    let queryValues =
      whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

      console.log("whereClauses :", queryValues)

    if (req.query?.acc_no && req.query?.acc_no !== undefined) {
      let refId = fetchNarrationDetailRowByAcc();
      queryValues = `${queryValues ? " AND" : "WHERE"} ref_id = ${refId}`;
    }
    // end of search query execution

    const masterDBQuery = `SELECT * from ${
      TABLE_NAMES.THFMCASH
    } ${queryValues} ORDER BY ref_id LIMIT 1 OFFSET ${req.query?.offset || 0}`;
    let masterDBData = await db.query(masterDBQuery);

    console.log(`Search Query:: `, masterDBQuery);
    const totalCountQuery = `SELECT COUNT(*) FROM ${TABLE_NAMES.THFMCASH} ${queryValues}`;
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = totalCountResult.rows[0].count;

    console.log(`Total Search Query:: `, totalCountQuery);

    // can comment this for test
    if (masterDBData?.rows?.length <= 0) {
      return res.status(400).json({
        message: "No data found, please try again!",
      });
    }

    const narrationDBQuery = `
    SELECT DISTINCT td.*, mo.description AS purpose, mc.description AS cost_center, emp.emp_name as emp_name, acc.acc_desc as acc_desc
      from ${TABLE_NAMES.TDFMCASH} td 
      LEFT JOIN ${TABLE_NAMES.MOMMCODE} mo ON td.pur_code = mo.code AND mo.cat_group = 'PURP'
      LEFT JOIN ${TABLE_NAMES.MOMMCODE} mc ON td.cost_centr = mc.code AND mc.cat_group = 'COSTC'
      LEFT JOIN ${TABLE_NAMES.ACC_DETAILS} acc ON td.acc_no = acc.acc_no
      LEFT JOIN ${TABLE_NAMES.MHPMEMPM} emp ON td.emp_cd = emp.emp_cd
      WHERE td.ref_id = ${masterDBData?.rows?.[0]?.ref_id} and srl_no != 0
      ORDER BY ref_id, srl_no
    `;

    let narrationDBData =
      masterDBData?.rows?.length > 0
        ? await db.query(narrationDBQuery)
        : { rows: [] };

    console.log("Narration DB Query:: ", narrationDBQuery);

    let masterData = transformMasterToAPIData(masterDBData?.rows?.[0] || {});
    let narrationData = transformNarrationToAPIData(
      narrationDBData?.rows || []
    );

    additionResponseObj = {
      masterData: masterData,
      narrationData: narrationData,
      totalCount: parseInt(totalCount || 1),
      current: parseInt(req?.query?.offset || 0),
    };
  }
   
  // Fetch Constants
  const divisionData = await db.query(`
        SELECT h.name, h.division_id division_id 
            from ${TABLE_NAMES.MOIT_DIVISION} h, ${TABLE_NAMES.USER_DIVISION} d 
        where 
            h.division_id = d.division_id 
            and
            d.user_id = 0 
            AND
            H.DIVISION_ID = 1
    `);

  const sections = await db.query(`
        SELECT s.section_desc, u.section_id 
            from  ${TABLE_NAMES.MOIT_SECTION} s, ${TABLE_NAMES.MOIT_USER_SECTION} u
        where 
            u.user_id =0
            and 
            s.section_id = 1
        order by 1
    `);

  const ccER = await db.query(`
        SELECT curr_code as currency_code, rate as exchange_rate
        from ${TABLE_NAMES.CURRENCY} 
        where def_flag = 'Y'
    `);

  return res.status(200).json({
    division: divisionData?.rows || [],
    section: sections?.rows || [],
    currencyExchangeData: ccER?.rows || [],
    ...additionResponseObj,
  });
});

exports.getAccountDetailsList = catchAsync(async (req, res, next) => {
  const {division_id, trans_year} = req?.query
  const accountDetails = await db.query(`
        SELECT acc_desc, emp_relate, acc_no 
        from ${TABLE_NAMES.ACC_DETAILS} 
        where 
            division_id = $1 
            and 
            trans_year = $2
        order by 1
    `,[division_id, trans_year]);

  const costCenterDetails = await db.query(`
        SELECT 
            prefix, 
            description, 
            TO_CHAR(code::numeric, '9999999990') AS code
        FROM 
            ${TABLE_NAMES.MOMMCODE}
        WHERE 
            cat_group = 'COSTC'
        ORDER BY 1;
    `);

  const purpData = await db.query(
    `select description, TO_CHAR(code::numeric, '9999999990') AS code from ${TABLE_NAMES.MOMMCODE} where cat_group='PURP' order by 1`
  );

  return res.status(200).json({
    accountList: accountDetails?.rows || [],
    ccDetails: costCenterDetails?.rows || [],
    purpData: purpData?.rows || [],
  });
});

exports.getDataBasedOnAccMeta = catchAsync(async (req, res, next) => {
  const billData = await db.query(`
        SELECT 
            d.DOC_NO,
            DATE_TRUNC('day', d.DOC_DT) AS DOC_DATE, 
            TO_CHAR(ABS(SUM(CASE WHEN d.db_cr = 'D' THEN d.AMOUNT ELSE d.AMOUNT * -1 END))::numeric, '9999999990.00') AS AMOUNT
        FROM 
            ${TABLE_NAMES.TDFMOUTS} d
        JOIN 
            ${TABLE_NAMES.THFMOUTS} h ON d.OUTS_ID = h.OUTS_ID
        WHERE 
            d.ACC_NO = '${req.query.acc_no}'
            AND d.STATUS <> 'C' 
            AND h.DIVISION_ID = ${req.query.division_id || 1}
        GROUP BY 
            d.DOC_NO, DATE_TRUNC('day', d.DOC_DT)
        ORDER BY 
            d.DOC_NO;
    `);

  const chequeData = await db.query(`
        select 'Y' AS CFND  
        from ${TABLE_NAMES.MHFMDATA}
        where division_id = ${req.query.division_id || 1} and acc_no = '${
    req.query.acc_no
  }'
    `);

  const empData = await db.query(`
        SELECT e.emp_name, e.emp_cd, c.prefix
        FROM ${TABLE_NAMES.MHPMEMPM} e
        LEFT JOIN ${TABLE_NAMES.MOMMCODE} c ON e.cost_centre = c.code
        WHERE e.date_left IS NULL
        AND (
            EXISTS (
            SELECT 1
            FROM ${TABLE_NAMES.MDFMACCEMP} a
            WHERE a.emp_cd = e.emp_cd
                AND a.acc_no = '${req.query.acc_no}'
                AND COALESCE(a.active, 'N') = 'Y'
            )
            OR NOT EXISTS (
            SELECT 1
            FROM ${TABLE_NAMES.MDFMACCEMP} a
            WHERE a.acc_no = '${req.query.acc_no}'
                AND COALESCE(a.active, 'N') = 'Y'
            )
        )
        ORDER BY e.emp_name;
    `);
  return res.status(200).json({
    billData: billData?.rows || {},
    chequeData: chequeData?.rows || [],
    empData: empData?.rows || [],
  });
});

exports.getCurrencyMetaBasedOnSection = catchAsync(async (req, res, next) => {
  const section = req.query?.section;
  return res.json({
    balance: 100,
    balance_db_cr: "D",
  });
});

exports.getITCMetaData = catchAsync(async (req, res, next) => {
  const query = `
  SELECT 
      h.itc_sr_no, 
      h.gst_id, 
      h.v_code, 
      v.v_name, 
      h.doc_no, 
      h.doc_date 
  FROM 
      ${TABLE_NAMES.THFMINWARDGST} h, 
      ${TABLE_NAMES.MOMMVEND} v
  WHERE 
      cash_receipt = 'Y'
      AND division_id = ${req.query?.division_id || 1}
      AND trans_year = '${req.query?.trans_year || "2025"}'
      AND h.v_code = v.v_code
      AND v_type = 'V'
      AND NOT EXISTS (
          SELECT 1 FROM ${TABLE_NAMES.THFMCASH} c 
          WHERE c.division_id = h.division_id
          AND COALESCE(c.cancel, 'N') = 'N'
          AND gst_id IS NOT NULL 
          AND h.gst_id = c.gst_id
      )
      AND NOT EXISTS (
          SELECT 1 FROM ${TABLE_NAMES.THFMTTRAN} t 
          WHERE t.division_id = h.division_id
          AND COALESCE(t.cancel, 'N') = 'N'
          AND gst_id IS NOT NULL 
          AND h.gst_id = t.gst_id
      )
      AND NOT EXISTS (
          SELECT 1 FROM ${TABLE_NAMES.MHAPBILL} b 
          WHERE b.division_id = h.division_id
          AND COALESCE(b.cancel, 'N') = 'N'
          AND b.v_code = h.v_code
          AND b.bill_no = h.doc_no
          AND b.bill_dt = h.doc_date
      );
  `;
  const itcData = await db.query(query);
  return res.json(itcData?.rows);
});

exports.postCashVoucherData = catchAsync(async (req, res, next) => {
  let thfmCashData = transformMasterToDbData(req.body.masterData);
  //   console.log("stat will be", thfmCashData);
  //   try {
  //     // await db.query("Begin");

  try {

  await db.query('Begin')
  

   // first checking the ref_dt exists in financial open year
   const checkFinYearOpen = await db.query(` SELECT proc_lib_check_open_year_date($1, $2::date, $3, $4)`,
    [thfmCashData?.trans_year, thfmCashData?.ref_date,'FM', 'CV']);
   
   if(!checkFinYearOpen?.rowCount){
     return res.status(400).json({type:'Error',message:'Error while checking financial year open'})
   }

   const isFinanceYearOpen = checkFinYearOpen.rows[0]?.proc_lib_check_open_year_date

   // if value is 'N'
   if(isFinanceYearOpen == 'N'){
     return res.status(400).json({type:'Error',message:'INVALID DATE OR YEAR CLOSED'})
   }

  //  RUNNING SEQUENCE AND GET VALUE INTO REF_ID
  const getRefId = await db.query(
    `SELECT nextval('integral.s_thfmcash_ref_id')`
  );
  thfmCashData.ref_id = getRefId.rows[0].nextval; // UPDATE THFMCASHDATA WITH REF_ID

  // GENERATING REF_NO FROM DB FUNCTION ->
  const genRefNo = await db.query(
    `SELECT gen_cash_voucher_sect($1,$2,$3,CURRENT_DATE)`,
    [thfmCashData.division_id, "G", "P"]
  );
  thfmCashData.ref_no = genRefNo.rows[0].gen_cash_voucher_sect; // UPDATE THFMCASHDATA WITH REF_NO

  // add voucher_no procedure execution in this statement
  const thfmQuery = generateSingleInsertQuery(
    TABLE_NAMES.THFMCASH,
    thfmCashData
  );

  // thfm insertion
  const data = await db.query(thfmQuery, Object.values(thfmCashData));

  console.log('inserted master data: ',data.rows)

  console.log("refId",thfmCashData.ref_id)

  let tdfmNarrationData = transformNarrationToDbData(
    req.body.narrationData,
    thfmCashData.ref_id,
    req.body.masterData
  );

  // const narrationPromises = tdfmNarrationData.map(async (data) => {
  //   console.log("narration data", data);
  //   console.log("narration data values", Object.values(data));
  //   const tdfmQuery = generateInsertQuery(TABLE_NAMES.TDFMCASH, [data]);
  //   console.log("Generated Query:", tdfmQuery);
  //   return db.query(tdfmQuery, Object.values(data));
  // });

  // await Promise.all(narrationPromises);

  for (const data of tdfmNarrationData) {
    console.log("narration data", data);
    console.log("narration data values", Object.values(data));
    const tdfmQuery = generateInsertQuery(TABLE_NAMES.TDFMCASH, [data]);
    console.log("Generated Query:", tdfmQuery);
    await db.query(tdfmQuery, Object.values(data)); // await sequentially
  }

   // MAKE CONTRA ENTRY 
   const insertContraEntry =await db.query('CALL integral.proc_insert_contra_cashvch($1)',[Number(getRefId.rows[0].nextval)])

   await db.query('commit')

  res.status(200).send({ message: "SUCCESS" });
  } catch (error) {
    await db.query('Rollback')
    return res.status(500).json({type:'Error', message:`${error.message} || Internal Server error`})
  }

  //   } catch (error) {
  //     console.log(error);
  //     // await db.query("ROLLBACK");
  //     return res
  //       .status(400)
  //       .send({ errMsg: `Some error occurred ${error.message}` });
  //   }
});

exports.validateField = catchAsync(async (req, res, next) => {
  const { acc_no, appFinYear, appDivisionId } = req.query;

  try {
    if (!acc_no) {
      return res.status(400).json({ message: "Account No. not provided" });
    }

    let resPayload = {
      valid: false,
      message: "",
      emp_relate: "N",
      cc_purpose: "N",
    };

    // Get cash account number
    const getCashAcc = await db.query(
      `SELECT acc_no FROM MOFMPTAX WHERE TAX_CODE = $1;`,
      ["C1"]
    );

    if (getCashAcc.rowCount > 0) {
      if (acc_no === getCashAcc.rows[0].acc_no) {
        resPayload.message =
          "Cash in Hand Account cannot be used in Voucher Entry. ";
        return res.status(404).json(resPayload);
      }
    }

    // Validate account number
    const validateAccNo = await db.query(
      `SELECT ACC_DESC, EMP_RELATE, controlacc
             FROM VWMDFMGLM
             WHERE ACC_NO = $1
             AND DIVISION_ID = $2
             AND trans_year = $3
             AND ACTIVE = $4;`,
      [acc_no, Number(appDivisionId), appFinYear, "Y"]
    );

    if (validateAccNo.rowCount === 0) {
      resPayload.message = `Account Code does not exist.`;
      return res.status(404).json(resPayload);
    }
    const getCcPurpose = await db.query(
      `select cc_purpose
            from mhfmglm 
            where acc_no = $1`,
      [acc_no]
    );

    resPayload.cc_purpose = getCcPurpose.rows[0].cc_purpose;

    // ✅ Ensure `rows[0]` exists before accessing it
    const empRelate =
      validateAccNo.rows.length > 0 ? validateAccNo.rows[0].emp_relate : "";

    return res
      .status(200)
      .json({ ...resPayload, emp_relate: empRelate, valid: true });
  } catch (error) {
    console.error("Validation error:", error); // ✅ Logs the actual error for debugging
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Added backend logic
exports.updateCashVoucherData = catchAsync(async (req, res, next) => {
  const thfmCashData = cashVoucherDataMapping(req.body.masterData);
  const tdfmCashDetailData = req.body.narrationData;
  const toDeleteCashDetailData = req.body.deletedNarrationRows;
  let reference_id;

  try {
    if (thfmCashData) {
      // generate query for update
      if (!thfmCashData?.ref_id) {
        throw new Error("Reference ID missing, please refresh and try again");
      }
  
      const { ref_id, forQuery, debt_amt, crdt_amt, ...thfmData } = thfmCashData;
      reference_id = ref_id;
  
      // console.log(thfmData)
  
      if (thfmData && Object.keys(thfmData).length > 0) {
        const columns = Object.keys(thfmData);
        const values = Object.values(thfmData);
  
        const columnHead = columns.map((c, i) => `${c} = $${i + 2}`).join(", ");
        const params = [ref_id, ...values];
  
        const query = `UPDATE ${TABLE_NAMES.THFMCASH} SET ${columnHead} WHERE ref_id = $1`;
        console.log("Master Query:: ", query, params, thfmCashData);
        await db.query(query, params);
      }
    }
  
    if (tdfmCashDetailData && reference_id) {
      const masterData = await db.query(
        `SELECT * from ${TABLE_NAMES.THFMCASH} WHERE ref_id = '${reference_id}'`
      );
      const masterDataRow = masterData?.rows?.[0];
      const existingNarrationDataLastRow = await db.query(
        `SELECT * from ${TABLE_NAMES.TDFMCASH} WHERE ref_id = '${reference_id}' ORDER BY srl_no DESC LIMIT 1`
      );
      const existingNarrationDataLastRowSerialNumber = parseInt(
        existingNarrationDataLastRow?.rows?.[0]?.srl_no || 0
      );
      let counter = 1;
      let narrationQueries = tdfmCashDetailData.map(async (data) => {
        if (data && Object.keys(data)?.length > 0) {
          // if ref_id present then update otherwise insert logic
          if (data?.ref_id) {
  
            let { cost_center, ref_id, srl_no, ...modifiedData } =
              cashVoucherDetailDataMapping(data);
              delete modifiedData.purpose
            const columns = Object.keys(modifiedData);
            
            const values = Object.values(modifiedData);
  
            const columnHead = columns
              .map((c, i) => `${c} = $${i + 3}`)
              .join(", ");
            const params = [data.ref_id, srl_no, ...values];
  
            const query = `UPDATE ${TABLE_NAMES.TDFMCASH} SET ${columnHead} WHERE ref_id = $1 AND srl_no = $2`;
            console.log(`[EXISTING]:: `, query, params, modifiedData);
            return db.query(query, params);
          } else {
            let modifiedData = transformNarrationToDbData(
              [data],
              reference_id,
              masterDataRow
            );
            let { cost_center, ...transformedData } = {
              ...modifiedData?.[0],
              srl_no: existingNarrationDataLastRowSerialNumber + counter,
            };
            counter++;
            const tdfmQuery = generateInsertQuery(TABLE_NAMES.TDFMCASH, [
              transformedData,
            ]);
  
            // console.log("[NEW] Narration Query:: ", tdfmQuery, transformedData);
            if (transformedData) {
              return db.query(tdfmQuery, Object.values(transformedData));
            }
            return Promise.resolve();
          }
        }
        await db.query('commit')
        return null;
  
      });
  
      // Added: Delete narration rows
      console.log(toDeleteCashDetailData)
      if (Array.isArray(toDeleteCashDetailData) && toDeleteCashDetailData?.length > 0 && reference_id) {
        const deleteIds = toDeleteCashDetailData.map((_,index)=>`$${index+1}`).join(",")
        const deleteCashDetailDataQuery = `DELETE from ${TABLE_NAMES.TDFMCASH} WHERE ref_id = '${reference_id}' AND srl_no in (${deleteIds})`;
        await db.query(deleteCashDetailDataQuery,[...toDeleteCashDetailData]);
      };
  
      // console.log("Queries TBE:: ", narrationQueries);
      await Promise.all(narrationQueries);
    }

    console.log('reference_id ::::', reference_id)

    // MAKE CONTRA ENTRY 
    const insertContraEntry = await db.query('CALL integral.proc_insert_contra_cashvch($1)', [Number(reference_id)])
  
    res.status(200).send({type:'success',  message: "Record successfully saved" });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({type:'error', message:`${error.message || 'Internal Server Error'}`})
  }
  await db.query('begin')

});

// voucher authorization logic
exports.authorizedCashVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  let { posted, ref_id, id, division_id, trans_year, trans_type, section, pay_rec, ref_date } = vchrData;
  console.log(vchrData)
  // Temporarily hardcoded, as per your note
  division_id = Number(division_id);


  if (!ref_id) {
    return res.status(400).json({ type: 'error', message: 'Missing ref_id in vchrData' });
  }

  try {
    await db.query('BEGIN');

    // first checking the ref_dt exists in financial open year
    const checkFinYearOpen = await db.query(` SELECT proc_lib_check_open_year_date($1, $2::date, $3, $4)`,[trans_year, ref_date,'FM', 'CV']);
   
    if(!checkFinYearOpen?.rowCount){
      return res.status(400).json({type:'error',message:'Error while checking financial year open'})
    }

    const isFinanceYearOpen = checkFinYearOpen.rows[0]?.proc_lib_check_open_year_date

    // if value is 'N'
    if(isFinanceYearOpen == 'N'){
      return res.status(400).json({type:'error',message:'INVALID DATE OR YEAR CLOSED'})
    }

    // Get Cash-in-Hand acc_no
    const accRes = await db.query(`SELECT acc_no FROM mofmptax WHERE tax_code = 'C1'`);

    if (accRes.rowCount === 0) {
      throw new Error('No Cash-in-Hand Account defined in Parameter Master.');
    }

    const acc_no = accRes.rows[0].acc_no;

    // Get Opening Balance
    const opBalRes = await db.query(
      `SELECT CASE 
                WHEN yr_db_cr = 'D' THEN yr_op_bal 
                ELSE yr_op_bal * -1 
              END AS nOp 
       FROM mdfmglm 
       WHERE acc_no = $1 AND division_id = $2 AND trans_year = $3`,
      [acc_no, division_id, trans_year]
    );

    if (opBalRes.rowCount === 0) {
      throw new Error('No Opening Balance for Cash-in-Hand defined.');
    }

    const nOp = parseFloat(opBalRes.rows[0].nop || 0);

    // Get Posted, Non-Cancelled Total Transactions
    const totalRes = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN d.db_cr = 'D' THEN d.amount ELSE d.amount * -1 END), 0) AS nTotal
       FROM tdfmtran d
       JOIN thfmtran h ON d.voucher_id = h.voucher_id
       WHERE h.division_id = $1 
         AND h.trans_year = $2
         AND COALESCE(d.posted, 'N') = 'Y'
         AND COALESCE(h.cancel, 'N') = 'N'
         AND d.acc_no = $3`,
      [division_id, trans_year, acc_no]
    );

    const nTotal = parseFloat(totalRes.rows[0].ntotal || 0);

    // Check Cash Balance Constraint
    if ((nOp + nTotal) < 0) {
      throw new Error('Cash-in-Hand Balance Cannot be in Credit Mode. Unable to Post the Voucher.');
    }

    // Check if Total Debit == Credit for This Voucher
    const [debitRes, creditRes] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(amount), 0) AS total_debit FROM tdfmcash WHERE ref_id = $1 AND db_cr = 'D'`, [ref_id]),
      db.query(`SELECT COALESCE(SUM(amount), 0) AS total_credit FROM tdfmcash WHERE ref_id = $1 AND db_cr = 'C'`, [ref_id])
    ]);

    const debit = parseFloat(debitRes.rows[0].total_debit || 0);
    const credit = parseFloat(creditRes.rows[0].total_credit || 0);

    if (debit !== credit) {
      throw new Error(`Total Debit (${debit}) and Credit (${credit}) amounts are not equal. Cannot authorize.`);
    }


    // Call procedure to post the voucher
    const result = await db.query(`CALL integral.proc_post_cashvch($1, $2, $3, $4, $5, $6)`,
      [
        trans_year,       // ptrans_year
        division_id,      // pdivision_id
        trans_type,       // ptrans_type
        ref_id,           // pnref (same as ref_id)
        section,          // psection
        pay_rec,          // ppay_rec
      ]
    );


    // 2. Now select the generated voucher number
    const vnoRes = await db.query(`SELECT voucher_no, voucher_dt FROM thfmcash WHERE ref_id = $1`,
      [ref_id]
    );

    const voucher_no = vnoRes.rows?.[0]?.voucher_no || null;
    const voucher_dt = vnoRes.rows?.[0]?.voucher_dt || null;


    // Passed all checks – update to "posted"
    await db.query(`UPDATE thfmcash SET posted = $1, update_id = $2 WHERE ref_id = $3`,
      [posted, id, ref_id]
    );

    await db.query('ROLLBACK');

    return res.status(200).json({
      type: 'success',
      voucher_no: voucher_no,
      voucher_dt: voucher_dt,
      message: 'Voucher authorized successfully.',
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error authorizing cash voucher:', error.message);
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  } 
});

// Voucher cancellation logic
exports.cancelCachVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  console.log("Voucher cancellation data:", vchrData);

  try {
    const { cancel, ref_id, id } = vchrData || {};

    if (!ref_id) {
      return res.status(400).json({
        type: 'error',
        message: 'Missing ref_id in request data.',
      });
    }

    // Optional: Validate cancel value
    if (!['Y', 'N'].includes(cancel)) {
      return res.status(400).json({
        type: 'error',
        message: 'Invalid cancel value. Must be "Y" or "N".',
      });
    }

    // Optional: Validate user id
    if (!id) {
      return res.status(400).json({
        type: 'error',
        message: 'Missing user ID.',
      });
    }
    await db.query('begin')
    // Update both tables
    await db.query(
      `UPDATE thfmcash SET cancel = $1, update_id = $2 WHERE ref_id = $3`,
      [cancel, id, ref_id]
    );

    await db.query('commit')
    return res.status(200).json({
      type: 'success',
      message: cancel === 'Y' ? 'Voucher cancelled successfully.' : 'Voucher cancellation reverted successfully.',
    });

  } catch (error) {
    console.error('Error cancelling voucher:', error);
    await db.query('rollback')
    return res.status(500).json({
      type: 'error',
      message: error.message || 'Internal Server Error',
    });
  }
});


