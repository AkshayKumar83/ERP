const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  generateInsertQuery,
} = require("../../../../utility/query");

const { dateFormate, dateFormater } = require("../../../../utility/constant");
const {
  transformMasterToDbData,
  transformNarrationToDbData,
} = require("./presentation");

const TABLE_NAMES = {
  THFMBANK: `thfmtran`,
  TDFMBANK: `tdfmtran`,
  TOPMLOAN: `topmloan`,
  TDFMMRIR: `tdfmmrir`,
  TDFMOUTS: `integral.TDFMOUTS`,
  THFMOUTS: `integral.THFMOUTS`,
  MHPMEMPM: `integral.mhpmempm`,
  MDFMACCEMP: `integral.mdfmaccemp`,
  THFMINWARDGST: `integral.thfminwardgst`,
  MOMMVEND: `integral.mommvend`,
  THFMTTRAN: `integral.thfmtran`,
  MHAPBILL: `integral.mhapbill`,
  TDFMTRAN_RETENTION: `tdfmtran_retention`,
  MHFMDATA: `integral.mhfmbank`,
  COST_CENTRE_VIEW: "vwcostc",
  PURPOSE_LIST_VIEW: "vwPurp",
  VENDOR_MASTER_TABLE: "mommvend",
  ACC_LIST_VIEW: "vwmdfmglm",
  MOIT_DIVISION: `moitdivision`,
  USER_DIVISION: `user_division`,
  MOIT_USER_SECTION: `moitusersection`,
  MOIT_SECTION: `moitsection`,
  CURRENCY: `currency`,
  ACC_DETAILS: `integral.vwmdfmglm`,
  MOMMCODE: `integral.mommcode`,
  MHFMGLM: `integral.mhfmglm`,
  MOFMPTAX: `integral.mofmptax`,
  GENERATE_VOUCHER_NO: `GEN_VOUCHER_SECT`,
};

// for dropdown data
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const { formStatus, appUserId, appDivisionId } = req.query;
  const DivisionList = await db.query(
    `select h.name,  (h.division_id) division_id from moitdivision h, user_division d
where h.division_id = d.division_id
and d.user_id = $1 `,
    [0], // todo make it dynamically according to user_id
  );
  //   const SectionList = await db.query(
  //     `   select s.section_desc, u.section_id
  // from  moitsection s, moitusersection u
  //  where u.user_id = $1
  //    and s.section_id = u.section_id
  // order by 1 `,
  //     [appUserId]
  //   );

  const sectionList = await db.query(
    `SELECT s.section_desc, u.section_id
          FROM moitsection s
          JOIN moitusersection u ON s.section_id = u.section_id
          WHERE u.user_id = $1
          ORDER BY s.section_desc`,
    [0], // todo make it dynamically
  );

  console.log("sectionListData", sectionList.rows, "with user_id", appUserId);

  const ccER = await db.query(`
          SELECT curr_code as currency_code, rate as exchange_rate
          from ${TABLE_NAMES.CURRENCY} 
          where def_flag = 'Y'
      `);

  //this will return purpus list
  const purpose = await db.query(
    `select description, code from integral.vwPurp order by 1`,
  );

  const bankList = await db.query(
    `select acc_no, bank_name, trans_type from mhfmbank where division_id = $1 and active_bank = 'Y' order by 2`,
    [appDivisionId],
  );

  //console.log("section:", SectionList.rows)

  return res.status(200).json({
    division: DivisionList.rows || [],
    section: sectionList.rows || [],
    currencyExchangeData: ccER.rows || [],
    purpose: purpose.rows || [],
    bankList: bankList.rows || [],
  });
});

// for query
const getBankVchrDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["voucher_no", "voucher_dt", "posted", 'pay_rec'];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = userId || 583;

  try {
    let queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMBANK}
           where trans_Type like 'B%'
         and trans_year = $1
          and exists (select 1
            from user_division e
            where e.user_id = $2
              and e.division_id = $3)  ${queryValues}`,
        [transYear, user_id, divisionId]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMBANK}
             where Trans_Type like 'B%'
           and Trans_year = $1
            and exists (select 1
              from user_division e
              where e.user_id = $2
                and e.division_id = $3)
                `,
            [transYear, user_id, divisionId]

            // --- and (:thfmbank.query_auth = 'B' or :thfmbank.query_auth is null or posted = :thfmbank.query_auth)
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY voucher_id DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const thfmbankData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.THFMBANK} where Trans_Type like 'B%'
     and trans_year = $1
    and exists (select 1
            from user_division e
            where e.user_id = $2
              and e.division_id = $3) ${queryParameter}
              --and (:thfmbank.query_auth = 'B' or :thfmbank.query_auth is null or posted = :thfmbank.query_auth)
              `,
      [transYear, user_id, divisionId]
    );

    if (thfmbankData.rows.length === 0) {
      // throw new Error("No bank voucher data found");
        return res.status(200).send({ type:'not found', message: "No voucher data found", count: 0});
    }

    const vchId = thfmbankData.rows[0].voucher_id;
    const vchNo = thfmbankData.rows[0].voucher_no;
    const vchDt = thfmbankData.rows[0].voucher_dt;
    const poId = thfmbankData.rows[0].po_id;
    const ConsId = thfmbankData.rows[0].cons_ctrl_id;
    const fundTransId = thfmbankData.rows[0].fund_trns_vch_id;
    const salEnqId = thfmbankData.rows[0].sal_enq_id;
    const transType = thfmbankData.rows[0].trans_type;
    const DivId = thfmbankData.rows[0].division_id;

    // Convert pay_rec to string if it exists
    if (
      thfmbankData.rows[0].pay_rec !== undefined &&
      thfmbankData.rows[0].pay_rec !== null
    ) {
      thfmbankData.rows[0].pay_rec = thfmbankData.rows[0].pay_rec.toString();
    }

    // set up acc_no and bank_name in POST-QUERY

    const accData = await db.query(
      `select ACC_NO, BANK_NAME
      from MHFMBANK where TRANS_TYPE = $1
      AND DIVISION_ID = $2`,
      [transType, DivId]
    );

    thfmbankData.rows[0].acc_no =
      accData.rowCount > 0 ? accData.rows[0].acc_no : "";
    thfmbankData.rows[0].bank_name =
      accData.rowCount > 0 ? accData.rows[0].bank_name : "";
    thfmbankData.rows[0].acct_type =
      accData.rowCount > 0 ? accData.rows[0].acc_no : "";

    //set up cheque no and cheque dt in POST-QUERY

    const chqData = await db.query(
      `SELECT chq_dt, chq_no FROM ${TABLE_NAMES.TDFMBANK} WHERE voucher_id = $1 AND flag = $2`,
      [vchId, "Y"]
    );

    // Modify thfmbankData.rows[0] directly
    if (chqData.rowCount > 0) {
      thfmbankData.rows[0].chq_no = chqData.rows[0].chq_no;
      thfmbankData.rows[0].chq_dt = dateFormater(chqData.rows[0].chq_dt);
    } else {
      thfmbankData.rows[0].chq_no = "";
      thfmbankData.rows[0].chq_dt = "";
    }

    // set ref_no, ref_date in POST-QUERY

    const refData = await db.query(
      `SELECT ref_no, ref_date FROM thfmbank WHERE voucher_no = $1 and voucher_dt = $2 and division_id = $3`,
      [vchNo, vchDt, appDivisionId]
    );

    if (refData.rowCount > 0) {
      thfmbankData.rows[0].ref_no = refData.rows[0].ref_no;
      thfmbankData.rows[0].ref_dt = dateFormater(refData.rows[0].ref_dt);
    } else {
      thfmbankData.rows[0].ref_no = null;
      thfmbankData.rows[0].ref_dt = null;
    }

    //set section in POST-QUERY

    const getSection = await db.query(
      ` select s.section_id as section
     from moitsection s, user_master u
    where s.section_prefix = 'G'
      AND s.dept_cd = u.dept_cd
      AND u.user_id = $1`,
      [userId]
    );

    thfmbankData.rows[0].section =
      getSection.rowCount > 0 ? getSection.rows[0].section : "";
    //console.log("section", thfmbankData.rows[0].section)

    // set dep_slip in POST-QUERY

    const depSlip = await db.query(
      `	select deposit_slip, deposit_slip_dt
		from ${TABLE_NAMES.TDFMBANK}
		where voucher_id = $1
		  and deposit_slip is not null
		  and deposit_slip_dt is not null
	  	limit 1`,
      [vchId]
    );

    if (depSlip.rowCount > 0) {
      thfmbankData.rows[0].dep_slip = depSlip.rows[0].deposit_slip;
      thfmbankData.rows[0].dep_slip_dt = dateFormater(
        depSlip.rows[0].deposit_slip_dt
      );
    } else {
      thfmbankData.rows[0].dep_slip = null;
      thfmbankData.rows[0].dep_slip_dt = null;
    }

    // set po_no in POST-QUERY

    const poData = await db.query(
      `	select po_no
		from mhmmpo
		where po_id = $1`,
      [poId]
    );

    thfmbankData.rows[0].po_no =
      poData.rowCount > 0 ? poData.rows[0].po_no : "";

    // set cons_ctrl_id in  POST-QUERY

    const consData = await db.query(
      `	select cons_ctrl_no
	from thmmcons
	where cons_ctrl_id = $1`,
      [ConsId]
    );

    thfmbankData.rows[0].cons_ctrl_no =
      consData.rowCount > 0 ? consData.rows[0].cons_ctrl_no : "";

    // set fund_trns_vch_id

    const fundTransData = await db.query(
      `select voucher_no as inter_div_no from ${TABLE_NAMES.THFMBANK} where voucher_id = $1`,
      [fundTransId]
    );
    thfmbankData.rows[0].inter_div_no =
      fundTransData.rowCount > 0 ? fundTransData.rows[0].inter_div_no : "";

    // set sal_enq_id

    const salEnqData = await db.query(
      `SELECT E.SAL_ENQ_ID, E.ENQ_NO
     FROM THSMENQ E
    JOIN MOSMCUST_MASTER C
    ON C.C_CODE = E.C_CODE
    WHERE COALESCE(E.CANCEL_FLAG, 'N') = 'N'
    AND COALESCE(E.LOST_ORDER, 'N') = 'N'
    AND E.SAL_ENQ_ID = $1`,
      [salEnqId]
    );

    thfmbankData.rows[0].sal_enq_no =
      salEnqData.rowCount > 0 ? salEnqData.rows[0].sal_enq_no : "";

    const tdfmbankData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDFMBANK} WHERE voucher_id = $1 AND flag = $2 and pay_rec != 9 ORDER BY srl_no`,
      [vchId, "N"]
    );

    const procInsertContra = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDFMBANK} WHERE voucher_id = $1 AND flag = $2`,
      [vchId, "Y"]
    );

    if (tdfmbankData.rows.length > 0) {
      await Promise.all(
        tdfmbankData.rows.map(async (item) => {
          if (item.cost_centr !== null) {
            const cost_cntr = await db.query(
              `SELECT description, prefix FROM ${TABLE_NAMES.COST_CENTRE_VIEW} WHERE code = $1`,
              [item.cost_centr]
            );
            item.cost_desc = cost_cntr.rows[0]?.description || null;
            item.cost_pre = cost_cntr.rows[0]?.prefix || null;
          }

          if (item.pur_code !== null) {
            const purp_desc = await db.query(
              `SELECT description FROM ${TABLE_NAMES.PURPOSE_LIST_VIEW} WHERE code = $1`,
              [item.pur_code]
            );
            item.pur_desc = purp_desc.rows[0]?.description || null;
          }

          if (item.ser_party_cd !== null) {
            const vend_name = await db.query(
              `SELECT v_name FROM mommvend WHERE v_code = $1`,
              [item.ser_party_cd]
            );
            item.v_name = vend_name.rows[0]?.v_name || null;
          }

          const acc_desc = await db.query(
            `SELECT * FROM ${TABLE_NAMES.ACC_LIST_VIEW} WHERE acc_no = $1`,
            [item.acc_no]
          );

          item.acc_desc =
            acc_desc.rows.length > 0 ? acc_desc.rows[0].acc_desc : null;

          if (item.emp_cd !== null) {
            const emp_detail = await db.query(
              `SELECT emp_name FROM mhpmempm WHERE emp_cd = $1`,
              [item.emp_cd]
            );
            item.emp_name = emp_detail.rows[0]?.emp_name || null;
          }
        })
      );
    }
    // todo these two query should need to be change
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

    //this will return purpus list
    const purpose = await db.query(
      `select description, code from integral.vwPurp order by 1`
    );

    // Format date fields properly
    const formattedThfmbankData = {
      ...thfmbankData.rows[0],
      voucher_dt: dateFormater(thfmbankData.rows[0]?.voucher_dt),
      bill_dt: dateFormater(thfmbankData.rows[0]?.bill_dt),
    };

    const formattedTdfmbankData =
      tdfmbankData.rows.length > 0
        ? tdfmbankData.rows.map((row) => ({
            ...row,
            bill_dt: dateFormater(row.bill_dt),
            prof_dt: dateFormater(row.prof_dt),
            bank_grn_dt: dateFormater(row.bank_grn_dt),
            chq_dt: dateFormater(row.chq_dt),
            deposit_slip_dt: dateFormater(row.deposit_slip_dt),
          }))
        : [];

    const bankList = await db.query(
      `select acc_no, bank_name, trans_type from mhfmbank where division_id = $1 and active_bank = 'Y' order by 2`,
      [appDivisionId]
    );

    const responseData = {
      division: divisionData?.rows || [],
      section: sections?.rows || [],
      currencyExchangeData: ccER?.rows || [],
      thfmbankData: formattedThfmbankData,
      tdfmbankData: formattedTdfmbankData,
      procInsertContra:
        procInsertContra.rows.length > 0 ? procInsertContra.rows[0] : {},
      count: recordCount || 0,
      purpose: purpose.rows || [],
      bankList: bankList.rows || [],
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: error.message || `Internal Server Error`,
    });
  }
};



// const getBankVchrDataOnQuery = async (req, res) => {
//   const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

//   let whereClauses = [];
//   let detailWhereClauses = [];

//   // Header fields
//   let searchKeys = ["voucher_no", "voucher_dt", "posted", "pay_rec"];

//   // Detail fields
//   let detailSearchKeys = ["chq_no", 'chq_dt'];

//   // Header filters
//   for (const key of searchKeys) {
//     if (req.query[key] !== undefined && req.query[key] !== "") {
//       whereClauses.push(`${key} = '${req.query[key]}'`);
//     }
//   }

//   // Detail filters (chq_no)
//   for (const key of detailSearchKeys) {
//     if (req.query[key] !== undefined && req.query[key] !== "") {
//       detailWhereClauses.push(`d.${key} = '${req.query[key]}'`);
//     }
//   }

//   let queryValues = "";

//   if (whereClauses.length > 0) {
//     queryValues += " AND " + whereClauses.join(" AND ");
//   }

//   if (detailWhereClauses.length > 0) {
//     queryValues += ` AND EXISTS (
//       SELECT 1 FROM ${TABLE_NAMES.TDFMBANK} d
//       WHERE d.voucher_id = ${TABLE_NAMES.THFMBANK}.voucher_id
//       AND ${detailWhereClauses.join(" AND ")}
//     )`;
//   }

//   let transYear = appFinYear || "2023";
//   let divisionId = appDivisionId || 1;
//   let user_id = userId || 583;

//   try {
//     let queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
//       req.query.offset || 0
//     }`;
//     let recordCount;

//     if (whereClauses.length > 0 || detailWhereClauses.length > 0) {
//       const getCount = await db.query(
//         `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMBANK} 
//          WHERE trans_Type like 'B%' 
//          AND trans_year = $1
//          AND exists (
//            select 1 from user_division e 
//            where e.user_id = $2
//            and e.division_id = $3
//          )
//          ${queryValues}`,
//         [transYear, user_id, divisionId],
//       );

//       recordCount = getCount.rows[0]?.count;
//       queryParameter = `${queryValues} ${queryParameter}`;
//     } else {
//       switch (req?.query?.get_data) {
//         case "Query":
//         case "First": {
//           const getCount = await db.query(
//             `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMBANK} 
//              WHERE Trans_Type like 'B%' 
//              AND Trans_year = $1
//              AND exists (
//                select 1 from user_division e 
//                where e.user_id = $2
//                and e.division_id = $3
//              )`,
//             [transYear, user_id, divisionId],
//           );
//           recordCount = getCount.rows[0]?.count;
//           break;
//         }

//         case "Last": {
//           queryParameter = "ORDER BY voucher_id DESC LIMIT 1";
//           break;
//         }

//         default:
//           queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
//             req.query.offset || 0
//           }`;
//           break;
//       }
//     }

//     const thfmbankData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.THFMBANK} 
//        WHERE Trans_Type like 'B%' 
//        AND trans_year = $1
//        AND exists (
//          select 1 from user_division e 
//          where e.user_id = $2
//          and e.division_id = $3
//        )
//        ${queryParameter}`,
//       [transYear, user_id, divisionId],
//     );

//     if (thfmbankData.rows.length === 0) {
//       return res.status(200).send({
//         type: "not found",
//         message: "No voucher data found",
//         count: 0,
//       });
//     }

//     // ----------- REMAINING CODE SAME (NO CHANGE) -----------

//     const vchId = thfmbankData.rows[0].voucher_id;

//     const chqData = await db.query(
//       `SELECT chq_dt, chq_no FROM ${TABLE_NAMES.TDFMBANK} 
//        WHERE voucher_id = $1 AND flag = $2`,
//       [vchId, "Y"],
//     );

//     if (chqData.rowCount > 0) {
//       thfmbankData.rows[0].chq_no = chqData.rows[0].chq_no;
//       thfmbankData.rows[0].chq_dt = dateFormater(chqData.rows[0].chq_dt);
//     } else {
//       thfmbankData.rows[0].chq_no = "";
//       thfmbankData.rows[0].chq_dt = "";
//     }

//     const tdfmbankData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.TDFMBANK} 
//        WHERE voucher_id = $1 
//        AND flag = $2 
//        AND pay_rec != 9 
//        ORDER BY srl_no`,
//       [vchId, "N"],
//     );

//     const procInsertContra = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.TDFMBANK} 
//        WHERE voucher_id = $1 AND flag = $2`,
//       [vchId, "Y"],
//     );

//     const formattedThfmbankData = {
//       ...thfmbankData.rows[0],
//       voucher_dt: dateFormater(thfmbankData.rows[0]?.voucher_dt),
//     };

//     const formattedTdfmbankData =
//       tdfmbankData.rows.length > 0
//         ? tdfmbankData.rows.map((row) => ({
//             ...row,
//             chq_dt: dateFormater(row.chq_dt),
//           }))
//         : [];

//     res.status(200).json({
//       thfmbankData: formattedThfmbankData,
//       tdfmbankData: formattedTdfmbankData,
//       procInsertContra:
//         procInsertContra.rows.length > 0 ? procInsertContra.rows[0] : {},
//       count: recordCount || 0,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       type: "error",
//       message: error.message || `Internal Server Error`,
//     });
//   }
// };


exports.getDataBasedOnAccMeta = catchAsync(async (req, res, next) => {
  console.log(req?.query);
  const {
    pay_rec,
    acc_no,
    chq_dt,
    chq_no,
    trans_year,
    division_id,
    voucher_id = 0,
    on_acc = "N",
  } = req?.query;

  // checking is transaction exists with this voucher_id with this check_no
  const existingVoucherQuery = `
      SELECT VOUCHER_ID AS T_V_ID
      FROM tdfmtran
      WHERE ACC_NO = $1
        AND CHQ_NO = $2
        AND CHQ_DT = $3
        AND DB_CR = CASE WHEN $4::int = 0 THEN 'D'
                        WHEN $4::int = 1 THEN 'C'
                    END
        AND VOUCHER_ID <> $5
      LIMIT 1
  `;

  const existingVoucherResult = await db.query(existingVoucherQuery, [
    acc_no,
    chq_no,
    chq_dt,
    pay_rec,
    voucher_id,
  ]);

  const existingVoucher = existingVoucherResult.rows[0] || null;

  // checking same thing as above with ref_id
  const existingRefQuery = `
  SELECT REF_ID AS T_V_ID
  FROM tdfmbank
  WHERE ACC_NO = $1
    AND CHQ_NO = $2
    AND CHQ_DT = $3
    AND DB_CR = CASE WHEN $4::int = 0 THEN 'D'
                     WHEN $4::int = 1 THEN 'C'
                END
    AND REF_ID <> $5
  LIMIT 1;
`;

  const existingRefResult = await db.query(existingRefQuery, [
    acc_no,
    chq_no,
    chq_dt,
    pay_rec,
    voucher_id,
  ]);

  const existingRef = existingRefResult.rows[0] || null;

  // Final boolean flag
  const isChequeNoExist = !!(existingVoucher || existingRef);

  // checking tax code
  const checkAccInTaxCodesQuery = `
  SELECT 'X' AS found
  FROM ${TABLE_NAMES.MHFMGLM}
  WHERE CONTROLACC IN (
    SELECT ACC_NO 
    FROM ${TABLE_NAMES.MOFMPTAX}
    WHERE TAX_CODE IN ('SDCI','SDCIA','SDCIO','SDCIT','CRDT','CRDE','CRDTR','CRDTO')
  )
  AND ACC_NO = $1
  LIMIT 1;
`;

  const ctrlAccResult = await db.query(checkAccInTaxCodesQuery, [acc_no]);

  const isControlledAccount = ctrlAccResult.rowCount > 0;

  const bankTransferQuery = `
  SELECT 'Y' AS bank_trnf_flg
  FROM mhfmbank
  WHERE DIVISION_ID = $1 AND ACC_NO = $2
  LIMIT 1;
`;

  const bankTransferResult = await db.query(bankTransferQuery, [
    division_id,
    acc_no,
  ]);

  // Set flag based on whether a record was found
  const bank_trnf_flg = bankTransferResult.rowCount > 0 ? "Y" : "N";

  // performa No helpList
  const performaHelp = await db.query(
    `
  SELECT 
  prof_no, 
  prof_dt, 
  COALESCE(SUM(value), 0) AS amount
FROM (
  -- First part: from mhsmordr_4_pi
  SELECT 
    h.proforma_inv_no AS prof_no, 
    h.pi_date AS prof_dt, 
    MIN(net_amt) AS value
  FROM mhsmordr_4_pi h
  WHERE COALESCE(cancel_flag, 'N') = 'N'
    AND h.c_code = SUBSTRING($1 FROM 2) -- :tdfmbank.acc_no without first character
  GROUP BY h.proforma_inv_no, h.pi_date

  UNION ALL

  -- Second part: from tdfmtran + thfmtran
  SELECT 
    d.prof_no, 
    d.prof_dt, 
    SUM(CASE WHEN d.db_cr = 'D' THEN d.amount ELSE -1 * d.amount END) AS value
  FROM tdfmtran d
  JOIN thfmtran h ON h.voucher_id = d.voucher_id
  WHERE d.acc_no = $1
    AND COALESCE(h.cancel, 'N') = 'N'
    AND EXISTS (
      SELECT 1 
      FROM mhsmordr_4_pi p
      WHERE p.proforma_inv_no = d.prof_no
        AND p.pi_date = d.prof_dt
    )
  GROUP BY d.prof_no, d.prof_dt
) x
GROUP BY prof_no, prof_dt;
`,
    [acc_no],
  );

  const billNoList = await db.query(
    `
	SELECT 
v.acc_no, v.acc_desc, d.bill_no,d.bill_dt::date AS bill_dt,  -- removes the timestamp, keeps only date
    abs(sum(case d.db_cr when 'D' then d.amount else d.amount*-1 end)) amount
FROM 
    vwmdfmglm v, tdfmtran d, thfmtran h 
WHERE v.trans_year = $1
and v.acc_no = $2
and v.division_id = $3
and coalesce(v.active,'N') = 'Y'
and d.acc_no =v.acc_no
and  (d.acc_no LIKE 'S%' OR d.acc_no LIKE 'C%')
AND h.voucher_id = d.voucher_id
  AND COALESCE(h.posted, 'N') = 'Y'
AND h.division_id = v.division_id
GROUP BY 
    v.acc_no, v.acc_desc, d.bill_no, d.bill_dt
HAVING 
    ABS(SUM(CASE d.db_cr WHEN 'D' THEN d.amount ELSE d.amount * -1 END)) <> 0
`,
    [trans_year, acc_no, division_id],
  );

  //   const billNoList = await db.query(
  //     `
  //   select acc_no, v.acc_desc, null bill_no,  null bill_dt, null amount, v.emp_relate, v.cc_purpose
  //     from vwmdfmglm v
  //     where trans_year = $1
  //     and division_id = $2
  //     and coalesce(active,'N')= 'Y'
  //     and not exists
  //     (select 1 from tdfmouts o
  //       where o.acc_no = v.acc_no)
  //     and /*:thfmbank.ON_ACC*/ $3 = 'N'
  //     union
  //     select v.acc_no, v.acc_desc,  doc_no bill_no,  doc_dt bill_dt, amount amount, v.emp_relate, v.cc_purpose
  //     from vwmdfmglm v, tdfmouts o, thfmouts h
  //     where v.trans_year = $1
  //     and v.division_id =  $2
  //     and coalesce(active,'N')= 'Y'
  //     and o.acc_no = v.acc_no
  //     and o.status <> 'C'
  //     and h.outs_id = o.outs_id
  //     and h.division_id = v.division_id
  //     and /*:thfmbank.ON_ACC*/ $3  = 'N'
  //     union
  //     select acc_no, v.acc_desc, null bill_no,  null bill_dt, null amount, v.emp_relate, v.cc_purpose
  //     from vwmdfmglm v
  //     where v.trans_year = $1
  //     and   v.division_id =  $2
  //     and   coalesce(active,'N')= 'Y'
  //     AND  /*:thfmbank.ON_ACC*/ $3  = 'Y'
  //     order by acc_no
  // `,
  //     [trans_year, division_id, on_acc]
  //   );

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
    billData: billNoList?.rows || {},
    chequeData: chequeData?.rows || [],
    empData: empData?.rows || [],
    isChequeNoExist,
    isControlledAccount,
    bankTransfer: bank_trnf_flg,
    profNoData:
      performaHelp?.rows.map((item) => ({
        ...item,
        prof_dt: dateFormater(item?.prof_dt),
      })) || [],
  });
});

const helpListData = async (req, res) => {
  const { help_list, form_status } = req.query;

  if (
    help_list === "bank" &&
    (form_status === "Insert" ||
      form_status === "Update" ||
      form_status === "Query")
  ) {
    try {
      const bankList = await db.query(
        `select acc_no, bank_name, trans_type from mhfmbank where division_id = 1 and active_bank = 'Y' order by 2`,
      );

      //console.log("bankList:", bankList);
      return res.status(200).json(bankList.rows);
    } catch (error) {
      console.error("Database query error:", error); // Log the error
      return res.status(500).json({ error: "Internal server error" }); // Handle the error gracefully
    }
  } else {
    return res.status(400).json({ error: "Invalid request" }); // Handle invalid requests
  }
};

exports.getAccountDetailsList = catchAsync(async (req, res, next) => {
  const { appDivisionId, appFinYear, userId, on_acc } = req?.query;
  // const accountDetails = await db.query(`
  //       SELECT acc_desc, emp_relate, cc_purpose, acc_no
  //       from ${TABLE_NAMES.ACC_DETAILS}
  //       where
  //           division_id = 1
  //           and
  //           trans_year = '2023'
  //       order by 1
  //   `);

  const accountDetails = await db.query(
    `
  select acc_no, v.acc_desc, null bill_no,  null bill_dt, null amount, v.emp_relate, v.cc_purpose
    from vwmdfmglm v
    where trans_year = $1
    and division_id = $2
    and coalesce(active,'N')= 'Y'
    and not exists
    (select 1 from tdfmouts o
      where o.acc_no = v.acc_no)   
    and /*:thfmbank.ON_ACC*/ $3 = 'N'        
    union
    select v.acc_no, v.acc_desc,  doc_no bill_no,  doc_dt bill_dt, amount amount, v.emp_relate, v.cc_purpose
    from vwmdfmglm v, tdfmouts o, thfmouts h
    where v.trans_year = $1
    and v.division_id =  $2
    and coalesce(active,'N')= 'Y'
    and o.acc_no = v.acc_no       
    and o.status <> 'C'
    and h.outs_id = o.outs_id
    and h.division_id = v.division_id
    and /*:thfmbank.ON_ACC*/ $3  = 'N'
    union  
    select acc_no, v.acc_desc, null bill_no,  null bill_dt, null amount, v.emp_relate, v.cc_purpose
    from vwmdfmglm v
    where v.trans_year = $1
    and   v.division_id =  $2
    and   coalesce(active,'N')= 'Y'
    AND  /*:thfmbank.ON_ACC*/ $3  = 'Y'
    order by acc_no 
`,
    [appFinYear, appDivisionId, on_acc],
  );

  const costCenterDetails = await db.query(`
        SELECT 
            prefix, 
            description, 
            code
        FROM 
            ${TABLE_NAMES.MOMMCODE}
        WHERE 
            cat_group = 'COSTC'
        ORDER BY 1;
    `);

  const purpData = await db.query(
    `select description, TO_CHAR(code::numeric, '9999999990') AS code from ${TABLE_NAMES.MOMMCODE} where cat_group='PURP' order by 1`,
  );

  return res.status(200).json({
    accountList:
      accountDetails?.rows.map((item) => ({
        ...item,
        bill_dt: dateFormater(item?.bill_dt),
      })) || [],
    ccDetails: costCenterDetails?.rows || [],
    purpData: purpData?.rows || [],
  });
});

exports.postBankVoucherData = catchAsync(async (req, res, next) => {
  let initBnkFormData = req.body.masterData;
  let thfmBankData;
  try {
    await db.query("Begin");

    // first checking the ref_dt exists in financial open year
    //  const checkFinYearOpen = await db.query(` SELECT proc_lib_check_open_year_date($1, $2::date, $3, $4)`,
    //   [thfmCashData?.trans_year, thfmCashData?.ref_date,'FM', 'CV']);

    //  if(!checkFinYearOpen?.rowCount){
    //    return res.status(400).json({type:'Error',message:'Error while checking financial year open'})
    //  }

    //  const isFinanceYearOpen = checkFinYearOpen.rows[0]?.proc_lib_check_open_year_date

    //  // if value is 'N'
    //  if(isFinanceYearOpen == 'N'){
    //    return res.status(400).json({type:'Error',message:'INVALID DATE OR YEAR CLOSED'})
    //  }

    //  RUNNING SEQUENCE AND GET VALUE INTO REF_ID
    const getVoucherId = await db.query(
      `SELECT nextval('integral.s_thfmtran_voucher_id')`,
    );
    console.log(getVoucherId.rows[0].nextval);
    initBnkFormData.voucher_id = getVoucherId.rows[0].nextval; // assinging voucher_id

    thfmBankData = transformMasterToDbData(initBnkFormData);
    console.log(thfmBankData);

    console.log(
      thfmBankData?.division_id,
      req.body.masterData?.section,
      thfmBankData?.pay_rec == 0 ? "P" : "R",
      thfmBankData?.trans_type,
      thfmBankData?.voucher_dt,
    );
    // GENERATING VOUCHER_NO FROM DB FUNCTION ->
    const getVoucherNo = await db.query(
      `select ${TABLE_NAMES.GENERATE_VOUCHER_NO}($1,$2,$3,$4,$5)`,
      [
        thfmBankData?.division_id,
        req.body.masterData?.section,
        thfmBankData?.pay_rec == 0 ? "P" : "R",
        thfmBankData?.trans_type,
        thfmBankData?.voucher_dt,
      ],
    );
    thfmBankData.voucher_no = getVoucherNo.rows[0].gen_voucher_sect; // assignment the voucher_no

    // add voucher_no procedure execution in this statement
    const thfmQuery = generateSingleInsertQuery(
      TABLE_NAMES.THFMBANK,
      thfmBankData,
    );

    // thfm insertion
    const data = await db.query(thfmQuery, Object.values(thfmBankData));

    console.log("inserted master data: ", data.rows);

    console.log(
      "voucher_id & voucher-no",
      thfmBankData.voucher_id,
      thfmBankData.voucher_no,
    );

    let tdfmNarrationData = transformNarrationToDbData(
      req.body.narrationData,
      thfmBankData.voucher_id,
      req.body.masterData,
    );

    for (const data of tdfmNarrationData) {
      console.log("narration data", data);
      console.log("narration data values", Object.values(data));
      const tdfmQuery = generateInsertQuery(TABLE_NAMES.TDFMBANK, [data]);
      console.log("Generated Query:", tdfmQuery);
      await db.query(tdfmQuery, Object.values(data)); // await sequentially
    }

    const insertContraEntry = await db.query(
      "CALL integral.proc_insert_contra_bnkvch($1, $2)",
      [Number(thfmBankData.voucher_id), initBnkFormData?.acct_type],
    );

    //updating ser_party_cd
    await db.query("CALL integral.update_party_acc_in_vchrs($1)", [
      thfmBankData.voucher_id,
    ]);

    // await db.query("CALL integral.proc_copy_remarks_into_contra($1)", [thfmBankData.voucher_id]);
    // await db.query("rollback");

    await db.query("commit");

    res.status(200).send({
      type: "success",
      message: "record successfully saved",
      gen_voucher_no: thfmBankData.voucher_no,
    });
  } catch (error) {
    console.error(error);
    await db.query("Rollback");
    return res.status(500).json({
      type: "Error",
      message: `${error.message} || Internal Server error`,
    });
  }
});

exports.updateBankVoucherData = catchAsync(async (req, res, next) => {
  const thfmbankData = req.body.masterData;
  const tdfmBankDetailData = req.body.narrationData;
  const toDeleteBankVchDetailData = req.body.deletedNarrationRows;

  let voucherId;
  let bankCode;

  try {
    await db.query("BEGIN"); // Start transaction

    // === 1. Update Master Data ===
    if (thfmbankData) {
      if (!thfmbankData?.voucher_id) {
        throw new Error("Voucher ID missing, please refresh and try again");
      }

      const {
        voucher_id,
        forQuery,
        debt_amt,
        crdt_amt,
        acct_type,
        chq_no,
        chq_dt,
        ...thfmData
      } = thfmbankData;
      voucherId = voucher_id;
      bankCode = acct_type;

      if (thfmData && Object.keys(thfmData).length > 0) {
        const columns = Object.keys(thfmData);
        const values = Object.values(thfmData);
        const columnHead = columns.map((c, i) => `${c} = $${i + 2}`).join(", ");
        const params = [voucherId, ...values];
        const query = `UPDATE ${TABLE_NAMES.THFMBANK} SET ${columnHead} WHERE voucher_id = $1`;

        console.log("Master Query:: ", query, params);
        await db.query(query, params);
      }
    }

    // === 2. Handle Narration Data (Insert/Update) ===
    if (tdfmBankDetailData && voucherId) {
      const masterData = await db.query(
        `SELECT * FROM ${TABLE_NAMES.THFMBANK} WHERE voucher_id = $1`,
        [voucherId],
      );
      const masterDataRow = masterData?.rows?.[0];

      const lastRowResult = await db.query(
        `SELECT srl_no FROM ${TABLE_NAMES.TDFMBANK} WHERE voucher_id = $1 ORDER BY srl_no DESC LIMIT 1`,
        [voucherId],
      );
      let nextSrlNo = parseInt(lastRowResult?.rows?.[0]?.srl_no || 0) + 1;

      // for (const data of tdfmBankDetailData) {
      //   if (data && Object.keys(data)?.length > 0) {
      //     if (data?.voucher_id) {
      //       // Update existing row
      //       const { cost_center, voucher_id, srl_no, ...modifiedData } = data;

      //       // delete non-db fields
      //       delete modifiedData.purpose;
      //       delete modifiedData?.acc_desc;
      //       delete modifiedData?.emp_relate;

      //       const columns = Object.keys(modifiedData);
      //       const values = Object.values(modifiedData);
      //       const columnHead = columns
      //         .map((c, i) => `${c} = $${i + 3}`)
      //         .join(", ");
      //       const params = [voucher_id, srl_no, ...values];
      //       const query = `UPDATE ${TABLE_NAMES.TDFMBANK} SET ${columnHead} WHERE voucher_id = $1 AND srl_no = $2`;

      //       console.log(`[EXISTING]:: `, query, params);
      //       await db.query(query, params);
      //     } else {
      //       // Insert new row
      //       let modifiedData = transformNarrationToDbData(
      //         [data],
      //         voucherId,
      //         masterDataRow
      //       );
      //       let { cost_center, ...transformedData } = {
      //         ...modifiedData?.[0],
      //         srl_no: nextSrlNo++,
      //       };

      //       const insertQuery = generateInsertQuery(TABLE_NAMES.TDFMBANK, [
      //         transformedData,
      //       ]);
      //       if (transformedData) {
      //         await db.query(insertQuery, Object.values(transformedData));
      //       }
      //     }
      //   }
      // }
      for (const data of tdfmBankDetailData) {
        if (data && Object.keys(data)?.length > 0) {
          const isTdsEntry =
            data?.remarks
              ?.toLowerCase()
              ?.startsWith("tax deducted at source") ||
            data?.remarks?.toLowerCase()?.startsWith("tds deduction for");

          if (data?.voucher_id && isTdsEntry) {
            const incomingBaseRemark = data?.remarks
              ?.toLowerCase()
              ?.split("@")[0]
              ?.trim(); // For example: "tax deducted at source"

            // Fetch all existing TDS remarks for this voucher
            const existingTds = await db.query(
              `SELECT srl_no, remarks FROM ${TABLE_NAMES.TDFMBANK} 
         WHERE voucher_id = $1 AND (
           LOWER(remarks) LIKE 'tax deducted at source%' OR 
           LOWER(remarks) LIKE 'tds deduction for%'
         )`,
              [data.voucher_id],
            );

            const tdsMatch = existingTds.rows.find((row) =>
              row?.remarks?.toLowerCase()?.includes(incomingBaseRemark),
            );

            if (tdsMatch) {
              // Delete only matching TDS remark entries
              await db.query(
                `DELETE FROM ${TABLE_NAMES.TDFMBANK} 
           WHERE voucher_id = $1 AND LOWER(remarks) LIKE $2`,
                [data.voucher_id, `%${incomingBaseRemark}%`],
              );
            }

            // Insert new TDS entry
            const transformedDataArr = transformNarrationToDbData(
              [data],
              voucherId,
              masterDataRow,
            );
            let { cost_center, ...transformedData } = {
              ...transformedDataArr?.[0],
              srl_no: nextSrlNo++,
            };

            const insertQuery = generateInsertQuery(TABLE_NAMES.TDFMBANK, [
              transformedData,
            ]);
            console.log(
              `[INSERT TDS]:: `,
              insertQuery,
              Object.values(transformedData),
            );
            await db.query(insertQuery, Object.values(transformedData));

            continue; // Skip rest of loop for this TDS item
          }

          // 🧠 Standard flow for non-TDS or unmatched entries
          if (data?.voucher_id) {
            const { cost_center, voucher_id, srl_no, ...modifiedData } = data;

            delete modifiedData.purpose;
            delete modifiedData.acc_desc;
            delete modifiedData.emp_relate;
            delete modifiedData.bank_grn_dt;
            delete modifiedData.row_id;
            delete modifiedData.entry_type;
            delete modifiedData.pur_desc;
            delete modifiedData.cc_purpose;

            modifiedData.div_id = modifiedData?.div_id || 1;
            // modifiedData.tran_year = modifiedData?.tran_year;

            const getVchNo = await db.query(
              "SELECT voucher_no, voucher_dt, trans_type FROM thfmtran WHERE voucher_id = $1",
              [voucher_id],
            );

            modifiedData.vch_no = getVchNo.rows[0]?.voucher_no;
            modifiedData.vch_dt = getVchNo.rows[0]?.voucher_dt;
            modifiedData.tran_type = getVchNo.rows[0]?.trans_type;

            const columns = Object.keys(modifiedData);
            const values = Object.values(modifiedData).map((val) =>
              val === "" ? null : val,
            );
            const columnHead = columns
              .map((c, i) => `${c} = $${i + 3}`)
              .join(", ");
            const params = [voucher_id, srl_no, ...values];

            const query = `UPDATE ${TABLE_NAMES.TDFMBANK} SET ${columnHead} WHERE voucher_id = $1 AND srl_no = $2`;

            console.log(`[EXISTING]:: `, query, params);
            const result = await db.query(query, params);

            if (result.rowCount === 0) {
              // Fallback insert
              const transformedDataArr = transformNarrationToDbData(
                [data],
                voucherId,
                masterDataRow,
              );
              let { cost_center, ...transformedData } = {
                ...transformedDataArr?.[0],
                srl_no: nextSrlNo++,
              };

              const insertQuery = generateInsertQuery(TABLE_NAMES.TDFMBANK, [
                transformedData,
              ]);
              console.log(
                `[INSERT FALLBACK]:: `,
                insertQuery,
                Object.values(transformedData),
              );
              await db.query(insertQuery, Object.values(transformedData));
            }
          } else {
            // Insert when no voucher_id (new rows)
            const transformedDataArr = transformNarrationToDbData(
              [data],
              voucherId,
              masterDataRow,
            );
            let { cost_center, ...transformedData } = {
              ...transformedDataArr?.[0],
              srl_no: nextSrlNo++,
            };

            const insertQuery = generateInsertQuery(TABLE_NAMES.TDFMBANK, [
              transformedData,
            ]);
            console.log(
              `[INSERT NEW]:: `,
              insertQuery,
              Object.values(transformedData),
            );
            await db.query(insertQuery, Object.values(transformedData));
          }
        }
      }

      // === 3. Delete Narration Rows ===
      if (
        Array.isArray(toDeleteBankVchDetailData) &&
        toDeleteBankVchDetailData.length > 0
      ) {
        const placeholders = toDeleteBankVchDetailData
          .map((_, index) => `$${index + 1}`)
          .join(",");
        const deleteQuery = `
          DELETE FROM ${TABLE_NAMES.TDFMBANK}
          WHERE voucher_id = $${toDeleteBankVchDetailData.length + 1}
          AND srl_no IN (${placeholders})
        `;
        await db.query(deleteQuery, [...toDeleteBankVchDetailData, voucherId]);
      }
    }

    // === 4. Call Contra Procedure ===
    if (voucherId && bankCode) {
      await db.query("CALL integral.proc_insert_contra_bnkvch($1, $2)", [
        Number(voucherId),
        bankCode,
      ]);
    }

    //updating ser_party_cd
    await db.query("CALL integral.update_party_acc_in_vchrs($1)", [voucherId]);

    // === 5. Commit Transaction ===
    await db.query("COMMIT");
    res
      .status(200)
      .send({ type: "success", message: "Record successfully saved" });
  } catch (error) {
    // === Rollback on Error ===
    await db.query("ROLLBACK");
    console.error("❌ Error in updateBankVoucherData:", error);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("from handleFormOperation", req?.query);
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getBankVchrDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

// voucher authorization logic
exports.authorizedBankVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  let {
    posted,
    voucher_id,
    id,
    division_id,
    trans_year,
    trans_type,
    section,
    pay_rec,
    voucher_no,
  } = vchrData;
  console.log(vchrData);
  // Temporarily hardcoded, as per your note
  division_id = Number(division_id);

  if (!voucher_id) {
    return res
      .status(400)
      .json({ type: "error", message: "Missing voucher_id in vchrData" });
  }

  try {
    await db.query("BEGIN");

    // // first checking the ref_dt exists in financial open year
    // const checkFinYearOpen = await db.query(` SELECT proc_lib_check_open_year_date($1, $2::date, $3, $4)`,[trans_year, ref_date,'FM', 'CV']);

    // if(!checkFinYearOpen?.rowCount){
    //   return res.status(400).json({type:'error',message:'Error while checking financial year open'})
    // }

    // const isFinanceYearOpen = checkFinYearOpen.rows[0]?.proc_lib_check_open_year_date

    // // if value is 'N'
    // if(isFinanceYearOpen == 'N'){
    //   return res.status(400).json({type:'error',message:'INVALID DATE OR YEAR CLOSED'})
    // }

    // // Get Cash-in-Hand acc_no
    // const accRes = await db.query(`SELECT acc_no FROM mofmptax WHERE tax_code = 'C1'`);

    // if (accRes.rowCount === 0) {
    //   throw new Error('No Cash-in-Hand Account defined in Parameter Master.');
    // }

    // const acc_no = accRes.rows[0].acc_no;

    // Get Opening Balance
    // const opBalRes = await db.query(
    //   `SELECT CASE
    //             WHEN yr_db_cr = 'D' THEN yr_op_bal
    //             ELSE yr_op_bal * -1
    //           END AS nOp
    //    FROM mdfmglm
    //    WHERE acc_no = $1 AND division_id = $2 AND trans_year = $3`,
    //   [acc_no, division_id, trans_year]
    // );

    // if (opBalRes.rowCount === 0) {
    //   throw new Error('No Opening Balance for Cash-in-Hand defined.');
    // }

    // const nOp = parseFloat(opBalRes.rows[0].nop || 0);

    // Get Posted, Non-Cancelled Total Transactions
    // const totalRes = await db.query(
    //   `SELECT
    //      COALESCE(SUM(CASE WHEN d.db_cr = 'D' THEN d.amount ELSE d.amount * -1 END), 0) AS nTotal
    //    FROM tdfmtran d
    //    JOIN thfmtran h ON d.voucher_id = h.voucher_id
    //    WHERE h.division_id = $1
    //      AND h.trans_year = $2
    //      AND COALESCE(d.posted, 'N') = 'Y'
    //      AND COALESCE(h.cancel, 'N') = 'N'
    //      AND d.acc_no = $3`,
    //   [division_id, trans_year, acc_no]
    // );

    // const nTotal = parseFloat(totalRes.rows[0].ntotal || 0);

    // // Check Cash Balance Constraint
    // if ((nOp + nTotal) < 0) {
    //   throw new Error('Cash-in-Hand Balance Cannot be in Credit Mode. Unable to Post the Voucher.');
    // }

    // // Check if Total Debit == Credit for This Voucher
    // const [debitRes, creditRes] = await Promise.all([
    //   db.query(`SELECT COALESCE(SUM(amount), 0) AS total_debit FROM tdfmcash WHERE ref_id = $1 AND db_cr = 'D'`, [ref_id]),
    //   db.query(`SELECT COALESCE(SUM(amount), 0) AS total_credit FROM tdfmcash WHERE ref_id = $1 AND db_cr = 'C'`, [ref_id])
    // ]);

    // const debit = parseFloat(debitRes.rows[0].total_debit || 0);
    // const credit = parseFloat(creditRes.rows[0].total_credit || 0);

    // if (debit !== credit) {
    //   throw new Error(`Total Debit (${debit}) and Credit (${credit}) amounts are not equal. Cannot authorize.`);
    // }

    // Call procedure to post the voucher
    // const result = await db.query(`CALL integral.proc_post_cashvch($1, $2, $3, $4, $5, $6)`,
    //   [
    //     trans_year,       // ptrans_year
    //     division_id,      // pdivision_id
    //     trans_type,       // ptrans_type
    //     ref_id,           // pnref (same as ref_id)
    //     section,          // psection
    //     pay_rec,          // ppay_rec
    //   ]
    // );

    // 2. Now select the generated voucher number
    // const vnoRes = await db.query(`SELECT voucher_no, voucher_dt FROM thfmcash WHERE ref_id = $1`,
    //   [ref_id]
    // );

    // const voucher_no = vnoRes.rows?.[0]?.voucher_no || null;
    // const voucher_dt = vnoRes.rows?.[0]?.voucher_dt || null;

    // Passed all checks – update to "posted" IN THFMTRAN
    await db.query(
      `UPDATE thfmtran SET posted = $1, update_id = $2 WHERE voucher_id = $3`,
      [posted, id, voucher_id],
    );

    // AND SAME UPDATE POSTED TO 'Y' IN TDFMTRAN
    await db.query(
      `UPDATE tdfmtran SET posted = $1, update_id = $2 WHERE voucher_id = $3`,
      [posted, id, voucher_id],
    );

    await db.query("commit");

    return res.status(200).json({
      type: "success",
      message: "Voucher authorized successfully.",
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error authorizing cash voucher:", error.message);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

// Voucher cancellation logic
exports.cancelBankVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  console.log("Voucher cancellation data:", vchrData);

  try {
    const { cancel, voucher_id, id } = vchrData || {};

    if (!voucher_id) {
      return res.status(400).json({
        type: "error",
        message: "Missing voucher_id in request data.",
      });
    }

    // Optional: Validate cancel value
    if (!["Y", "N"].includes(cancel)) {
      return res.status(400).json({
        type: "error",
        message: 'Invalid cancel value. Must be "Y" or "N".',
      });
    }

    // Optional: Validate user id
    if (!id) {
      return res.status(400).json({
        type: "error",
        message: "Missing user ID.",
      });
    }

    const isVoucherAdjusted = await db.query(
      `select 'Y' as cfnd 
		from thfmpayrcv 
		where voucher_id = $1
		limit 1`,
      [voucher_id],
    );

    if (isVoucherAdjusted.rowCount > 0) {
      throw new Error("This voucher Is Adjusted So cannot cancel");
    }

    await db.query("begin");
    // Update both tables
    await db.query(
      `UPDATE thfmtran SET cancel = $1, update_id = $2 WHERE voucher_id = $3`,
      [cancel, id, voucher_id],
    );

    await db.query("commit");
    return res.status(200).json({
      type: "success",
      message:
        cancel === "Y"
          ? "Voucher cancelled successfully."
          : "Voucher cancellation reverted successfully.",
    });
  } catch (error) {
    console.error("Error cancelling voucher:", error);
    await db.query("rollback");
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});

// create Tds Entry
exports.createTdsEntriesBnk = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log("inside createdTdsEntry");
  let {
    voucher_dt,
    bill_no,
    bill_dt,
    srl_no,
    amount,
    acc_no,
    pay_rec,
    pur_code,
    cost_centr,
    cost,
    voucher_id,
    trans_year,
    division_id,
  } = req.body;

  if (!cost_centr) {
    cost_centr = null;
  }

  if (!voucher_id) {
    const getTempVoucherId = await db.query(
      `SELECT nextval('temp_tds_voucher_id_seq')`,
    );
    voucher_id = getTempVoucherId.rows[0].nextval;
  }

  try {
    // CHECK IS THE PARTY CREDITOR
    const isPartyCreditor = await db.query(
      `select * from vwglmactivecreditors
      where division_id = $1
      and trans_year = $2
      and acc_no = $3`,
      [division_id, trans_year, acc_no],
    );

    if (isPartyCreditor.rowCount == 0) {
      throw new Error("It is not an active creditor in this Year/Division");
    }

    // IS VENDOR DEFINE IN ACC WISE TDS MASTER
    const isVendorDefin = await db.query(
      "select count(*) from mofmtds where v_code = $1",
      [acc_no],
    );
    console.log(isVendorDefin.rows);
    if (isVendorDefin.rows[0]?.count == 0) {
      throw new Error(
        "Vendor is not defined in Acc Wise TDS Master cannot deduct TDS",
      );
    }
    console.log("value goes in procedure", [
      voucher_id,
      voucher_dt,
      cost_centr,
      "ABC",
      pur_code,
      bill_no,
      bill_dt,
      srl_no,
      amount,
      null,
      acc_no,
      pay_rec,
    ]);

    const tdsEntries = await db.query(
      `call calc_tds_bank_on_acc($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        voucher_id,
        voucher_dt,
        cost_centr,
        "ABC",
        pur_code,
        bill_no,
        bill_dt,
        srl_no,
        amount,
        null,
        acc_no,
        pay_rec,
      ],
    );

    console.log(tdsEntries.rows);

    const getTdsEntries = await db.query(
      "select * from tdfmtran_temp_tds where voucher_id = $1",
      [voucher_id],
    );
    if (getTdsEntries.rowCount == 0) {
      throw new Error("No TDS Entries created");
    }
    const deleteTdsEntries = await db.query(
      "delete from tdfmtran_temp_tds where voucher_id = $1",
      [voucher_id],
    );
    return res.status(200).json({
      type: "created",
      data:
        getTdsEntries.rows.map((item) => ({
          ...item,
          bill_dt: dateFormater(item.bill_dt),
        })) || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message || `Server error while creating TDS entries.`,
      type: "error",
      data: [],
    });
  }
});
