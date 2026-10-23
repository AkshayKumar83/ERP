const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
  transformEmptyStringToNull,
} = require("../../../utility/query");


const { dateFormater, dateFormate } = require("../../../utility/constant");
const { transformMasterToDbData, transformNarrationToDbData } = require("./presentation");
const { v4: uuidv4 } = require('uuid');

const TABLE_NAMES = {
  THFMTRAN: `thfmtran`,
  TDFMTRAN: `tdfmtran`,
  CURRENCY: `currency`,
  GENERATE_VOUCHER_NO: `GEN_VOUCHER_SECT`,
};

// for dropdown data
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const { formStatus } = req?.query;
  // const SectionList = await db.query(
  //   `select s.section_desc, u.section_id 
  //   from moitsection s, moitusersection u
  //    where u.user_id = 583
  //      and s.section_id = u.section_id
  //   order by 1 `
  // );

  const SectionList = await db.query(
    `select s.section_desc, u.section_id 
    from moitsection s, moitusersection u
     where s.section_id = u.section_id
    order by 1 limit 1 `
  );

  let prev_year_chln = "N";

  const getPrevYrChln = await db.query(
    `select include_prev_chln as prev_year_chln from mofmparm  limit 1`
  );
  if (getPrevYrChln.rowCount > 0) {
    prev_year_chln = getPrevYrChln.rows[0]?.prev_year_chln;
  }

  const ccER = await db.query(`
        SELECT curr_code , rate as exchang_rt
        from ${TABLE_NAMES.CURRENCY} 
        where def_flag = 'Y'
    `);

    //this will return purpus list
    const purpose = await db.query(
      `select description, code from integral.vwPurp order by 1`
    );

  return res.status(200).json({
    section: SectionList.rows,
    purposes: purpose.rows,
    prev_year_chln,
    currencyExchangeData: ccER?.rows[0] || {},
  });
});

// for query

// const getJournalVchrDataOnQuery = async (req, res) => {
//   const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

//   let whereClauses = [];

//   // Define search keys that should be checked in WHERE clause
//   let searchKeys = ["voucher_no", "voucher_dt", "posted"];

//   // If any of these searchKeys exist in the query, add them to WHERE clause
//   for (const key of searchKeys) {
//      if (req.query[key] !== undefined && req.query[key] !== "") {
//          whereClauses.push(`${key} = '${req.query[key]}'`);
//      }
//  }

//   // Build WHERE clause dynamically
//   let queryValues = whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

//   let transYear = appFinYear || "2023";
//   let divisionId = appDivisionId || 1;

//   try {
//     let queryParameter = `ORDER BY voucher_no LIMIT 1 OFFSET ${
//       req.query.offset || 0
//     }`;
//     let recordCount;

//     if (whereClauses.length > 0) {
//                 const getCount = await db.query(`SELECT COUNT(voucher_no) FROM ${TABLE_NAMES.THFMTRAN} 
//                 WHERE 
//           trans_year = $1 and division_id = $2
//           AND trans_type ='J1' ${queryValues}`, [transYear, divisionId]);
//                 recordCount = getCount.rows[0]?.count;
//                 queryParameter = `${queryValues} ${queryParameter}`;
//     }else{
//       switch (req?.query?.get_data) {
//         case "Query":
//         case "First": {
//           const getCount = await db.query(
//             `SELECT COUNT(voucher_no) FROM ${TABLE_NAMES.THFMTRAN} 
//                   WHERE 
//             trans_year = $1 and division_id = $2
//             AND trans_type ='J1'
//       `,[transYear, divisionId]
//           );
//           recordCount = getCount.rows[0]?.count;
//           break;
//         }
  
//         case "Last": {
//           queryParameter = "ORDER BY voucher_no DESC LIMIT 1";
//           break;
//         }
  
//         default:
//           queryParameter = `ORDER BY voucher_no LIMIT 1 OFFSET ${
//             req.query.offset || 0
//           }`;
//           break;
//       }
//     }


//     const thfmtranData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.THFMTRAN} WHERE 
//           trans_year = $1 and division_id = $2
//       AND trans_type ='J1' ${queryParameter} `,
//       [transYear, divisionId]
//     );

//     if (thfmtranData.rows.length === 0) {
//       return res.status(200).json({type:'not found', message: "No journal voucher data found", count: 0 });
//     }

//     /*and
// (:thfmtran.query_auth = 'B' or :thfmtran.query_auth is null or posted = :thfmtran.query_auth)*/
//     const vchId = thfmtranData.rows[0].voucher_id;
//     const salEnqId = thfmtranData.rows[0].sal_enq_id;
//     const accNo = thfmtranData.rows[0].acc_no;

//     const getPurp = await db.query(
//       `select description, code 
//         from mommcode m, mofmacc_purp p
//         where m.code = p.purp_id
//         and p.acc_no = $1
//         order by 1`,
//       [accNo]
//     );

//     thfmtranData.rows[0].purp_desc =
//       getPurp.rowCount > 0 ? getPurp.rows[0].purp_desc : "";

//     // set section in POST-QUERY
//     const getSection = await db.query(
//       ` select s.section_id as section
//    from moitsection s, user_master u
//   where s.section_prefix = 'G'
//     AND s.dept_cd = u.dept_cd
//     AND u.user_id = $1`,
//       [userId]
//     );

//     thfmtranData.rows[0].section =
//       getSection.rowCount > 0 ? getSection.rows[0].section : "";

//     // set sal_enq_id in POST-QUERY
//     const getSalenqId = await db.query(
//       `SELECT SAL_ENQ_ID,ENQ_NO 
//       FROM THSMENQ E,MOSMCUST_MASTER C
//     WHERE COALESCE(CANCEL_FLAG,'N') = 'N' 
//       AND COALESCE(LOST_ORDER,'N')  = 'N'
//       AND C.C_CODE = E.C_CODE
//       AND E.SAL_ENQ_ID = $1 `,
//       [salEnqId]
//     );

//     thfmtranData.rows[0].sal_enq_id =
//       getSalenqId.rowCount > 0 ? getSalenqId.rows[0].sal_enq_id : "";

//     thfmtranData.rows[0].enq_no =
//       getSalenqId.rowCount > 0 ? getSalenqId.rows[0].enq_no : "";

//     const tdfmtranData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.TDFMTRAN} WHERE VOUCHER_ID = $1`,
//       [vchId]
//     );

//     if (tdfmtranData.rows.length > 0) {
//       await Promise.all(
//         tdfmtranData.rows.map(async (item) => {
//           if (item.acc_no !== null) {
//             const acc_no = await db.query(
//               `select ACC_DESC 
//              from VWMDFMGLM
//             where ACC_NO = $1
//              and DIVISION_ID = $2
//                 and trans_year = $3`,
//               [item.acc_no, divisionId, transYear]
//             );
//             item.acc_desc = acc_no.rows[0]?.acc_desc || null;
//           }

//           if (item.cost_centr !== null) {
//             const cost_cntr = await db.query(
//               ` select prefix, description 
//                     from vwcostc
//               where cat_group = 'COSTC'
//                AND code = $1;
//                           `,
//               [item.cost_centr]
//             );
//             item.cost_desc = cost_cntr.rows[0]?.description || null;
//             item.cost = cost_cntr.rows[0]?.prefix || null;
//           }

//           if (item.emp_cd !== null) {
//             const emp_detail = await db.query(
//               `SELECT emp_name FROM mhpmempm WHERE emp_cd = $1`,
//               [item.emp_cd]
//             );
//             item.emp_name = emp_detail.rows[0]?.emp_name || null;
//           }

//           if (item.acc_no !== null) {
//             const purp_desc = await db.query(
//               `select description, code 
//                from mommcode m, mofmacc_purp p
//                 where m.code = p.purp_id
//                  and p.acc_no = $1
//                    order by 1 `,
//               [item.acc_no]
//             );

//             item.pur_desc = purp_desc.rows[0]?.description || null;
//           }

//     //       if (item.acc_no !== null) {
//     //         const bill_no = await db.query(
//     //           `SELECT 
//     //    d.DOC_NO, 
//     //    d.DOC_DT, 
//     //    TO_CHAR(d.DOC_DT, 'DD-MON-YYYY') AS DOC_DATE, 
//     //    TO_CHAR(ABS(SUM(CASE WHEN d.db_cr = 'D' THEN d.AMOUNT ELSE d.AMOUNT * -1 END)), 'FM9999999990.00') AS AMOUNT
//     //  FROM TDFMOUTS d
//     //  JOIN THFMOUTS h ON d.OUTS_ID = h.OUTS_ID
//     //  WHERE d.ACC_NO = $1
//     //    AND d.STATUS <> 'C'
//     //    AND h.DIVISION_ID = 1
//     //  GROUP BY d.DOC_NO, d.DOC_DT
//     //  ORDER BY d.DOC_DT, d.DOC_NO;`,
//     //           [item.acc_no]
//     //         );

//     //         // If you only want first doc_no:
//     //         item.bill_no = bill_no.rows[0]?.doc_no || null;
//     //       }
//           item.row_id = uuidv4()
//         })
//       );
//     }

//     // Format date fields properly
//     const formattedThfmtranData = {
//       ...thfmtranData.rows[0],
//       voucher_dt: dateFormater(thfmtranData.rows[0]?.voucher_dt),
//       bill_dt: dateFormater(thfmtranData.rows[0]?.bill_dt),
//     };

//     const formattedTdfmtranData =
//       tdfmtranData.rows.length > 0
//         ? tdfmtranData.rows.map((row) => ({
//             ...row,
//             bill_dt: dateFormater(row.bill_dt),
//             prof_dt: dateFormater(row.prof_dt),
//             bank_grn_dt: dateFormater(row.bank_grn_dt),
//             chq_dt: dateFormater(row.chq_dt),
//             deposit_slip_dt: dateFormater(row.deposit_slip_dt),
//           }))
//         : [];

//     const responseData = {
//       thfmtranData: formattedThfmtranData,
//       tdfmtranData: formattedTdfmtranData,
//       count: recordCount || 0,
//     };

//     res.status(200).json(responseData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({type:'error', message: error.message || "Internal Server Error" });
//   }
// };

const getJournalVchrDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;

  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["voucher_no", "voucher_dt", "posted"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
     if (req.query[key] !== undefined && req.query[key] !== "") {
         whereClauses.push(`${key} = '${req.query[key]}'`);
     }
 }

  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;

  try {
    let queryParameter = `ORDER BY voucher_no LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
                const getCount = await db.query(`SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMTRAN} 
                WHERE 
          trans_year = $1 and division_id = $2
          AND trans_type ='J1' ${queryValues}`, [transYear, divisionId]);
                recordCount = getCount.rows[0]?.count;
                queryParameter = `${queryValues} ${queryParameter}`;
    }else{
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMTRAN} 
                  WHERE 
            trans_year = $1 and division_id = $2
            AND trans_type ='J1'
      `,[transYear, divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }
  
        case "Last": {
          queryParameter = "ORDER BY voucher_no DESC LIMIT 1";
          break;
        }
  
        default:
          queryParameter = `ORDER BY voucher_no LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }


    const thfmtranData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.THFMTRAN} WHERE 
          trans_year = $1 and division_id = $2
      AND trans_type ='J1' ${queryParameter} `,
      [transYear, divisionId]
    );

    if (!thfmtranData.rows.length) {
      return res.status(200).json({type:'not found', message: "No journal voucher data found", count: 0 });
    }

    /*and
(:thfmtran.query_auth = 'B' or :thfmtran.query_auth is null or posted = :thfmtran.query_auth)*/
    const vchId = thfmtranData.rows[0].voucher_id;
    const salEnqId = thfmtranData.rows[0].sal_enq_id;
    const accNo = thfmtranData.rows[0].acc_no;

    const getPurp = await db.query(
      `select description, code 
from mommcode m, mofmacc_purp p
where m.code = p.purp_id
and p.acc_no = $1
order by 1`,
      [accNo]
    );

    thfmtranData.rows[0].purp_desc =
      getPurp.rowCount > 0 ? getPurp.rows[0].purp_desc : "";

    // set section in POST-QUERY
    const getSection = await db.query(
      ` select s.section_id as section
   from moitsection s, user_master u
  where s.section_prefix = 'G'
    AND s.dept_cd = u.dept_cd
    AND u.user_id = $1`,
      [userId]
    );

    thfmtranData.rows[0].section =
      getSection.rowCount > 0 ? getSection.rows[0].section : "";

    // set sal_enq_id in POST-QUERY
    const getSalenqId = await db.query(
      `SELECT SAL_ENQ_ID,ENQ_NO 
   
  FROM THSMENQ E,MOSMCUST_MASTER C
 WHERE COALESCE(CANCEL_FLAG,'N') = 'N' 
   AND COALESCE(LOST_ORDER,'N')  = 'N'
   AND C.C_CODE = E.C_CODE
   AND E.SAL_ENQ_ID = $1 `,
      [salEnqId]
    );

    thfmtranData.rows[0].sal_enq_id =
      getSalenqId.rowCount > 0 ? getSalenqId.rows[0].sal_enq_id : "";

    thfmtranData.rows[0].enq_no =
      getSalenqId.rowCount > 0 ? getSalenqId.rows[0].enq_no : "";

    const tdfmtranData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDFMTRAN} WHERE VOUCHER_ID = $1`,
      [vchId]
    );

    if (tdfmtranData.rowCount > 0) {
      await Promise.all(
        tdfmtranData.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const acc_no = await db.query(
              `select ACC_DESC 
             from VWMDFMGLM
            where ACC_NO = $1
             and DIVISION_ID = $2
                and trans_year = $3`,
              [item.acc_no, divisionId, transYear]
            );
            item.acc_desc = acc_no.rows[0]?.acc_desc || null;
          }

          if (item.cost_centr !== null) {
            const cost_cntr = await db.query(
              ` select prefix, description 
                    from vwcostc
              where cat_group = 'COSTC'
               AND code = $1;
                          `,
              [item.cost_centr]
            );
            item.cost_desc = cost_cntr.rows[0]?.description || null;
            item.cost = cost_cntr.rows[0]?.prefix || null;
          }

          if (item.emp_cd !== null) {
            const emp_detail = await db.query(
              `SELECT emp_name FROM mhpmempm WHERE emp_cd = $1`,
              [item.emp_cd]
            );
            item.emp_name = emp_detail.rows[0]?.emp_name || null;
          }

          // if (item.acc_no !== null) {
          //   const purp_desc = await db.query(
          //     `select description, code 
          //      from mommcode m, mofmacc_purp p
          //       where m.code = p.purp_id
          //        and p.acc_no = $1
          //          order by 1 `,
          //     [item.acc_no]
          //   );

          //   item.pur_desc = purp_desc.rows[0]?.description || null;
          // }


          if (item.pur_code !== null) {
            const purp_desc = await db.query(
              `SELECT description FROM vwPurp WHERE code = $1`,
              [item.pur_code]
            );

            item.pur_desc = purp_desc.rows[0]?.description || null;
          }

    //       if (item.acc_no !== null) {
    //         const bill_no = await db.query(
    //           `SELECT 
    //    d.DOC_NO, 
    //    d.DOC_DT, 
    //    TO_CHAR(d.DOC_DT, 'DD-MON-YYYY') AS DOC_DATE, 
    //    TO_CHAR(ABS(SUM(CASE WHEN d.db_cr = 'D' THEN d.AMOUNT ELSE d.AMOUNT * -1 END)), 'FM9999999990.00') AS AMOUNT
    //  FROM TDFMOUTS d
    //  JOIN THFMOUTS h ON d.OUTS_ID = h.OUTS_ID
    //  WHERE d.ACC_NO = $1
    //    AND d.STATUS <> 'C'
    //    AND h.DIVISION_ID = 1
    //  GROUP BY d.DOC_NO, d.DOC_DT
    //  ORDER BY d.DOC_DT, d.DOC_NO;`,
    //           [item.acc_no]
    //         );

    //         // If you only want first doc_no:
    //         item.bill_no = bill_no.rows[0]?.doc_no || null;
    //       }
          item.row_id = uuidv4()
        })
      );
    }

    // Format date fields properly
    const formattedThfmtranData = {
      ...thfmtranData.rows[0],
      voucher_dt: dateFormater(thfmtranData.rows[0]?.voucher_dt),
      bill_dt: dateFormater(thfmtranData.rows[0]?.bill_dt),
    };

    const formattedTdfmtranData =
      tdfmtranData.rows.length > 0
        ? tdfmtranData.rows.map((row) => ({
            ...row,
            bill_dt: dateFormater(row.bill_dt),
            prof_dt: dateFormater(row.prof_dt),
            bank_grn_dt: dateFormater(row.bank_grn_dt),
            chq_dt: dateFormater(row.chq_dt),
            deposit_slip_dt: dateFormater(row.deposit_slip_dt),
          }))
        : [];

    const responseData = {
      thfmtranData: formattedThfmtranData,
      tdfmtranData: formattedTdfmtranData,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({type:'error', message: error.message || "Internal Server Error" });
  }
};

// const searchQueryRecord = async (req, res) => {
//   try {
//     if (req?.query?.form_status !== "Search") {
//       return res.status(400).send({ message: "Bad Request!" });
//     }

//     const searchParams = req.query;
//     const formStatus = searchParams.form_status;
//     delete searchParams.form_status; // form_status for maintaing search query
//     console.log(searchParams);

//     const cleanSearchParam = convertStringsToBooleans(searchParams);

//     const transfromSearchQuery = cleanSearchParam;
//     console.log(cleanObject(transfromSearchQuery));

//     const searchQuery = buildSearchQuery(transfromSearchQuery);
//     console.log(searchQuery);

//     const thfmtranData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.THFMTRAN} WHERE 
//           Trans_year = '2023' and Division_id = 1
// AND trans_type ='J1' and ${searchQuery} `
//     );

//     if (thfmtranData.rows.length === 0) {
//       return res.status(404).json({ error: "No journal voucher data found" });
//     }

//     /*and
// (:thfmtran.query_auth = 'B' or :thfmtran.query_auth is null or posted = :thfmtran.query_auth)*/
//     const vchId = thfmtranData.rows[0].voucher_id;
//     const salEnqId = thfmtranData.rows[0].sal_enq_id;

//     // set section in POST-QUERY
//     const getSection = await db.query(
//       ` select s.section_id as section
//    from moitsection s, user_master u
//   where s.section_prefix = 'G'
//     AND s.dept_cd = u.dept_cd
//     AND u.user_id = 583`
//     );

//     thfmtranData.rows[0].section =
//       getSection.rowCount > 0 ? getSection.rows[0].section : "";

//     // set sal_enq_id in POST-QUERY
//     const getSalenqId = await db.query(
//       `SELECT SAL_ENQ_ID,ENQ_NO 
   
//   FROM THSMENQ E,MOSMCUST_MASTER C
//  WHERE COALESCE(CANCEL_FLAG,'N') = 'N' 
//    AND COALESCE(LOST_ORDER,'N')  = 'N'
//    AND C.C_CODE = E.C_CODE
//    AND E.SAL_ENQ_ID = $1 `,
//       [salEnqId]
//     );

//     thfmtranData.rows[0].sal_enq_id =
//       getSalenqId.rowCount > 0 ? getSalenqId.rows[0].sal_enq_id : "";

//     thfmtranData.rows[0].enq_no =
//       getSalenqId.rowCount > 0 ? getSalenqId.rows[0].enq_no : "";

//     const tdfmtranData = await db.query(
//       `SELECT * FROM ${TABLE_NAMES.TDFMTRAN} WHERE VOUCHER_ID = $1`,
//       [vchId]
//     );

//     if (tdfmtranData.rows.length > 0) {
//       await Promise.all(
//         tdfmtranData.rows.map(async (item) => {
//           if (item.acc_no !== null) {
//             const acc_no = await db.query(
//               `select ACC_DESC 
//              from VWMDFMGLM
//             where ACC_NO = $1
//              and DIVISION_ID = 1
//                 and trans_year = '2023'`,
//               [item.acc_no]
//             );
//             item.acc_desc = acc_no.rows[0]?.acc_desc || null;
//           }

//           if (item.cost_centr !== null) {
//             const cost_cntr = await db.query(
//               ` select prefix, description 
//                     from vwcostc
//               where cat_group = 'COSTC'
//                AND code = $1;
//                           `,
//               [item.cost_centr]
//             );
//             item.cost_desc = cost_cntr.rows[0]?.description || null;
//             item.cost = cost_cntr.rows[0]?.prefix || null;
//           }

//           if (item.emp_cd !== null) {
//             const emp_detail = await db.query(
//               `SELECT emp_name FROM mhpmempm emp_cd = $1`,
//               [item.emp_cd]
//             );
//             item.emp_name = emp_detail.rows[0]?.emp_name || null;
//           }

//           if (item.acc_no !== null) {
//             const purp_desc = await db.query(
//               `select description, code 
//                from mommcode m, mofmacc_purp p
//                 where m.code = p.purp_id
//                  and p.acc_no = $1
//                    order by 1 `,
//               [item.acc_no]
//             );

//             item.pur_desc = purp_desc.rows[0]?.description || null;
//           }

//           if (item.acc_no !== null) {
//             const bill_no = await db.query(
//               `SELECT 
//        d.DOC_NO, 
//        d.DOC_DT, 
//        TO_CHAR(d.DOC_DT, 'DD-MON-YYYY') AS DOC_DATE, 
//        TO_CHAR(ABS(SUM(CASE WHEN d.db_cr = 'D' THEN d.AMOUNT ELSE d.AMOUNT * -1 END)), 'FM9999999990.00') AS AMOUNT
//      FROM TDFMOUTS d
//      JOIN THFMOUTS h ON d.OUTS_ID = h.OUTS_ID
//      WHERE d.ACC_NO = $1
//        AND d.STATUS <> 'C'
//        AND h.DIVISION_ID = 1
//      GROUP BY d.DOC_NO, d.DOC_DT
//      ORDER BY d.DOC_DT, d.DOC_NO;`,
//               [item.acc_no]
//             );

//             // If you only want first doc_no:
//             item.bill_no = bill_no.rows[0]?.doc_no || null;
//           }
//         })
//       );
//     }

//     // Format date fields properly
//     const formattedThfmtranData = {
//       ...thfmtranData.rows[0],
//       voucher_dt: dateFormater(thfmtranData.rows[0]?.voucher_dt),
//       bill_dt: dateFormater(thfmtranData.rows[0]?.bill_dt),
//     };

//     const formattedTdfmtranData =
//       tdfmtranData.rows.length > 0
//         ? tdfmtranData.rows.map((row) => ({
//             ...row,
//             bill_dt: dateFormater(row.bill_dt),
//             prof_dt: dateFormater(row.prof_dt),
//             bank_grn_dt: dateFormater(row.bank_grn_dt),
//             chq_dt: dateFormater(row.chq_dt),
//             deposit_slip_dt: dateFormater(row.deposit_slip_dt),
//           }))
//         : [];

//     const response = {
//       type: "found",
//       thfmtranData: formattedThfmtranData,
//       tdfmtranData: formattedTdfmtranData,
//     };

//     return res.send(response);
//   } catch (error) {
//     console.error("Error processing search request:", error);
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// };

// Help list queries


const helpListData = async (req, res) => {
  const {
    form_status,
    help_list,
    appDivisionId: division_id,
    appFinYear: trans_year,
  } = req?.query;
  console.log(req.query);

  // for acc code help list
  if (help_list === "acc") {
    const accList = await db.query(
      `select acc_desc, acc_no from vwmdfmglm where division_id = $1 
        and trans_year = $2
        and active = 'Y'
        order by 1`,
      [division_id, trans_year]
    );
    return res.status(200).send(accList.rows);
  } else if (help_list === "cost") {
    const costList = await db.query(
      `select prefix, description, code from mommcode where cat_group='COSTC' order by 1`
    );
    
    return res.status(200).send(costList.rows);
  }else if (help_list === "pur_code") {
    const purpCodeList = await db.query(
      `select description, code from integral.vwPurp order by 1`
    );
    return res.status(200).send(purpCodeList.rows);
  } else if (help_list === "emp") {
    const empList = await db.query(
      `SELECT 
    e.emp_name, 
    e.emp_cd 
FROM mhpmempm e
LEFT JOIN mommcode c ON e.cost_centre = c.code
WHERE 
    (
        EXISTS (
            SELECT 1 
            FROM mdfmaccemp a
            WHERE a.emp_cd = e.emp_cd
              AND a.acc_no = acc_no
              AND COALESCE(a.active, 'N') = 'Y'
        ) 
        OR NOT EXISTS (
            SELECT 1 
            FROM mdfmaccemp a
            WHERE a.acc_no = acc_no
              AND COALESCE(a.active, 'N') = 'Y'
        )
    )
    AND e.division_id = CASE WHEN 1 = 4 THEN 1 ELSE 1 END
    AND e.active = 'Y'
ORDER BY 1;  
 `
    );
    return res.status(200).send(empList.rows);
  } else if (help_list === "vendor") {
    const vendorList = await db.query(
      `select v_name,v_code from MOMMVEND 
      union all
      select c_name v_name,c_code v_code from mosmcust
      order by  1 `
    );
    return res.status(200).send(vendorList.rows);
  } else if (help_list === "bill_no") {
    const { f_acc_no } = req?.query;
    const getBillNoList = await db.query(
      `SELECT 
  d.doc_no, 
  TO_CHAR(d.doc_dt, 'DD-MON-YYYY') AS doc_date, 
  TO_CHAR(ABS(SUM(CASE WHEN d.db_cr = 'D' THEN d.amount ELSE d.amount * -1 END)), 'FM9999999990.00') AS amount
FROM 
  tdfmouts d
JOIN 
  thfmouts h ON d.outs_id = h.outs_id
WHERE 
  d.acc_no = $1
  AND d.status <> 'C'
  AND h.division_id = $2
GROUP BY 
  d.doc_no, TO_CHAR(d.doc_dt, 'DD-MON-YYYY')
ORDER BY 
  doc_date, d.doc_no;
 `,
      [f_acc_no, division_id]
    );
    return res.status(200).send(getBillNoList.rows);
  }
};

exports.postJournalVoucher = catchAsync(async (req, res, next) => {
  let { masterData: jvData, narrationData } = req.body;

  try {
    await db.query("Begin");
    // calling sequence
    const getVoucherId = await db.query(
      `SELECT nextval('integral.s_thfmtran_voucher_id')`
    );
    console.log(getVoucherId.rows[0].nextval);
    jvData.voucher_id = getVoucherId.rows[0].nextval; // assinging voucher_id

    let thfmtranJvData = transformMasterToDbData(jvData);
    console.log(thfmtranJvData);
    //   console.log("stat will be", thfmCashData);
    //   try {
    //     // await db.query("Begin");

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

    // GENERATING VOUCHER_NO FROM DB FUNCTION ->
    const getVoucherNo = await db.query(
      `select ${TABLE_NAMES.GENERATE_VOUCHER_NO}($1,$2,$3,$4,$5)`,
      [
        thfmtranJvData?.division_id,
        jvData?.section,
        "J",
        thfmtranJvData?.trans_type,
        thfmtranJvData?.voucher_dt,
      ]
    );

    thfmtranJvData.voucher_no = getVoucherNo.rows[0].gen_voucher_sect; // assignment the voucher_no

    // building insert query
    const thfmQuery = generateSingleInsertQuery(
      TABLE_NAMES.THFMTRAN,
      thfmtranJvData
    );

    console.log(thfmQuery, Object.values(thfmtranJvData));

    // thfmtran table insertion
    const data = await db.query(thfmQuery, Object.values(thfmtranJvData));

    //  wokring in detail(tdfmtran) insertion
    let tdfmNarrationData = transformNarrationToDbData(
      narrationData,
      thfmtranJvData?.voucher_id,
      thfmtranJvData
    );

    for (const data of tdfmNarrationData) {
      console.log("narration data", data);
      console.log("narration data values", Object.values(data));
      const tdfmQuery = generateSingleInsertQuery(TABLE_NAMES.TDFMTRAN, data);
      console.log("Generated Query:", tdfmQuery);
      await db.query(tdfmQuery, Object.values(data)); // await sequentially
    }

    // await db.query("rollback");
    await db.query('commit')
    res.status(200).send({type:'success', newVoucher:thfmtranJvData?.voucher_no, message: "Record saved successfully" });
  } catch (error) {
    console.log(error);
    await db.query("Rollback");
    return res.status(500).json({
      type: "Error",
      message: `${error.message} || Internal Server error`,
    });
  }

  //   } catch (error) {
  //     console.log(error);
  //     // await db.query("ROLLBACK");
  //     return res
  //       .status(400)
  //       .send({ errMsg: `Some error occurred ${error.message}` });
  //   }
});    

exports.handleUpdateData = catchAsync(async (req, res, next) => {
  console.log("updated data", req.body);
  
  const { masterData = {}, narrationData = [], deletedNarrationRows = [] } = req.body;

  let voucher_id = masterData.voucher_id;
  delete masterData.voucher_id;
  delete masterData.net_amt;
  delete masterData.section;

  if (
    (!deletedNarrationRows || deletedNarrationRows.length === 0) &&
    (!narrationData || narrationData.length === 0) &&
    (!masterData || Object.keys(masterData).length === 0)
  ) {
    return res.status(400).json({ type: 'error', message: 'No changed data found for Update! Please make changes in data to update' });
  }

  try {
    await db.query('BEGIN');

    // update Header data
    if (Object.keys(masterData).length && voucher_id) {

      delete masterData?.db_total
      delete masterData?.cr_total

      const columns = Object.keys(masterData);
      const values = Object.values(masterData);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      const query = `UPDATE ${TABLE_NAMES.THFMTRAN} SET ${setClause} WHERE voucher_id = $${columns.length + 1}`;
      await db.query(query, [...values, voucher_id]);
    }

    if (Array.isArray(deletedNarrationRows) && deletedNarrationRows.length > 0) {
        const placeholders = deletedNarrationRows.map((_, index) => `$${index + 1}`).join(",");
        const deleteQuery = `DELETE FROM ${TABLE_NAMES.TDFMTRAN}
          WHERE voucher_id = $${deletedNarrationRows.length + 1}
          AND srl_no IN (${placeholders})
        `;
        await db.query(deleteQuery, [...deletedNarrationRows, voucher_id]);
    }
        

    // Split narrationData into new rows and updates
    const newNarrationRows = narrationData.filter(row => !row.voucher_id || !row.srl_no);
    const updateNarrationRows = narrationData.filter(row => row.voucher_id && row.srl_no);

    // Insert new narration rows
    const tdfmNarrationData = transformNarrationToDbData(newNarrationRows, voucher_id, masterData);
    for (const data of tdfmNarrationData) {
      let getMaxSrlNo = await db.query('select COALESCE(MAX(srl_no), 0) AS max_srl from tdfmtran where voucher_id = $1',[voucher_id])
      data.srl_no = Number(getMaxSrlNo.rows[0]?.max_srl) + 1;
      const tdfmQuery = generateSingleInsertQuery(TABLE_NAMES.TDFMTRAN, data);
      console.log(tdfmNarrationData)
      await db.query(tdfmQuery, Object.values(data));
    }

    // Update existing narration rows
    for (const entry of updateNarrationRows) {
      delete entry?.acc_desc;
      if(entry?.cost == ''){
        entry.cost_centr = null;
      }
      delete entry?.cost;

      delete entry?.cost_desc;
      delete entry?.cost_pre;
      if(entry?.pur_desc == ''){
        entry.pur_code = null
      }
      delete entry?.pur_desc;

      const { srl_no, voucher_id, ...data } = entry;
      const cleanedData = transformEmptyStringToNull(data);
      const columns = Object.keys(cleanedData);
      const values = Object.values(cleanedData);
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      const updateQuery = `UPDATE ${TABLE_NAMES.TDFMTRAN} SET ${setClause} WHERE srl_no = $${columns.length + 1} AND voucher_id = $${columns.length + 2}`;
      await db.query(updateQuery, [...values, srl_no, voucher_id]);
    }

    await db.query('commit');
    return res.status(200).json({ type: 'success', message: 'Record successfully saved' });
  } catch (error) {
    console.error(error);
    await db.query('ROLLBACK');
    return res.status(400).json({ type: 'error', message: error.message || 'Internal Server Error' });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (['Query','Search'].includes(req?.query?.formStatus)) {
    await getJournalVchrDataOnQuery(req, res);
    return;
  }
  
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});    

exports.authorizedJvVchData = catchAsync(async (req, res, next) => {
  const { vchrData } = req.body;
  let { posted, voucher_id, id, division_id, trans_year, trans_type, section, pay_rec, ref_date } = vchrData;

  console.log("Voucher Data Received:", vchrData);
  division_id = Number(division_id);

  try {
    await db.query('BEGIN');

    if (!voucher_id) {
      throw new Error("Missing voucher_id for voucher.");
    }

    await db.query(
      `UPDATE THFMTRAN SET POSTED = 'Y' WHERE VOUCHER_ID = $1`,
      [voucher_id]
    );

    await db.query(
      `UPDATE TDFMTRAN SET POSTED = 'Y' WHERE VOUCHER_ID = $1`,
      [voucher_id]
    );

    if (posted === 'Y') {
      console.log('Voucher is being marked as posted.');
    }

    await db.query('COMMIT');

    return res.status(200).json({
      type: 'success',
      message: 'Voucher authorized successfully.',
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error authorizing voucher:', error.message);
    return res.status(500).json({
      type: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
});   

// Voucher cancellation logic
exports.cancelJvVchData = catchAsync(async (req, res, next) => {
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
      ` select hundi_ref
	  from thaphundi h
	  where jv_vch_id = $1`,
      [voucher_id]
    );

    if (isVoucherAdjusted.rowCount > 0) {
      throw new Error("Sorry, this JV is created for Hundi Ref. no. You cannot modify it.");
    }

    await db.query("begin");
    // Update both tables
    await db.query(
      `UPDATE thfmtran SET cancel = $1, update_id = $2 WHERE voucher_id = $3`,
      [cancel, id, voucher_id]
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

