const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { v4: uuidv4 } = require("uuid");

const TABLE_NAMES = {
  ACC_NO: "vwmdfmglm",
  VWGL_KARD: "vwgl_kard",
};

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
  } = req?.query;

  if (help_list === "acc_no") {
    const accNoList = await db.query(
      `select acc_desc, acc_no from ${TABLE_NAMES.ACC_NO} where division_id = $1
        and trans_year = $2 order by acc_desc`,
      [divisionId, transYear]
    );
    return res.status(200).send(accNoList.rows);
  }
  return res.status(200).send([]);
};

const validateAccNo = async (req, res) => {
  try {
    const { acc_no, division_id, trans_year } = req.query;

    const getAccDesc = await db.query(
      `select acc_desc from vwmdfmglm
            where acc_no = $1
            and division_id = $2
            and trans_year = $3
            and active = $4;`,
      [acc_no, division_id, trans_year, "Y"]
    );

    if (getAccDesc.rowCount == 0) {
      throw new Error("No such Account Code in G/L Master.");
    }

    const result = await db.query(
      `SELECT count(*) as cnt FROM mofmpartygroup WHERE main_party_code = $1`,
      [acc_no]
    );

    const count = parseInt(result.rows[0].cnt, 10);
    res
      .status(200)
      .json({ type: "found", count, acc_desc: getAccDesc.rows[0]?.acc_desc });
  } catch (err) {
    console.error("Error validating acc_no:", err);
    res
      .status(500)
      .json({ type: "error", message: err.message || "Internal server error" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  if (req?.query?.acc_no) {
    await validateAccNo(req, res);
    return;
  }
});

// exports.getFormData = catchAsync(async (req, res, next) => {
//   const {
//     acc_no,
//     division_id,
//     trans_year,
//     rg_vch,
//     from_date,
//     to_date,
//     combine_acc_yn,
//   } = req.query;

//   let yrOpBal = 0;
//   let yr_db_cr = "D";
//   let curr_bal = 0;
//   let curr_db_cr = "D";
//   let cr_total = 0;
//   let db_total = 0;

//   try {
//     const nextDate = new Date(to_date);
//     nextDate.setDate(nextDate.getDate() + 1); // add 1 day

//     console.log(
//       "openingBal para",
//       acc_no,
//       from_date,
//       rg_vch,
//       division_id,
//       trans_year,
//       combine_acc_yn,
//       rg_vch
//     );

//     // 1. Get opening balance
//     const getYrOpnBal = await db.query(
//       `SELECT * FROM proc_opening_acc_wise_dtl_entry($1, $2, $3, $4, $5, $6, $7)`,
//       [
//         acc_no,
//         from_date,
//         rg_vch,
//         division_id,
//         trans_year,
//         combine_acc_yn,
//         rg_vch,
//       ]
//     );

//     // 1.2 Get current balance of to date
//     const getCurrentBal = await db.query(
//       `SELECT * FROM proc_opening_acc_wise_dtl_entry($1, $2, $3, $4, $5, $6, $7)`,
//       [
//         acc_no,
//         nextDate,
//         rg_vch,
//         division_id,
//         trans_year,
//         combine_acc_yn,
//         rg_vch,
//       ]
//     );

//     if (getYrOpnBal.rowCount > 0) {
//       yrOpBal = getYrOpnBal.rows[0]?.yr_op_bal || 0;
//       yr_db_cr = getYrOpnBal.rows[0]?.yr_db_cr || "D";
//       curr_bal = getCurrentBal.rows[0]?.yr_op_bal || 0;
//       curr_db_cr = getCurrentBal.rows[0]?.yr_db_cr || "D";
//     }

//     // 3. Initialize tracking vars
//     const enrichedRows = [];

//     // delete all data from table temp_acc_ledger
//     await db.query("delete from temp_acc_ledger");

//     console.log('procedure all permaters',
//       acc_no,
//       combine_acc_yn,
//       division_id,
//       trans_year,
//       rg_vch,
//       from_date,
//       to_date,)

//     // CALLIING PROCEDURE
//     // await db.query(`call acc_ledger_4_postgres($1, $2, $3, $4, $5, $6, $7)`, [
//     //   acc_no,
//     //   combine_acc_yn,
//     //   division_id,
//     //   trans_year,
//     //   rg_vch,
//     //   from_date,
//     //   to_date,
//     // ]);

//     // const getData = await db.query("select * from temp_acc_ledger");

//       const getData = await db.query(`
//         SELECT *
//           FROM vwgl_kard_with_balance
//           WHERE acc_no = $1
//             AND voucher_dt BETWEEN $2 AND $3
//             AND npost = $4
//           ORDER BY voucher_dt, voucher_no
//       `,[acc_no,  from_date, to_date, combine_acc_yn]);

//     for (const rec of getData.rows) {
//       // rec.voucher_dt = dateFormater(rec?.voucher_dt);
//       rec.cref_date = dateFormater(rec?.ref_date);
//       rec.bill_dt = dateFormater(rec?.bill_dt);
//       rec.chq_dt = dateFormater(rec?.chq_dt);

//       rec.balance = Number(rec?.nbalance || 0).toFixed(2);
//       rec.db_cr = rec?.cdbcr;
//       rec.bal_dbcr = rec?.cdbcr;
//       rec.db_amount = Number(rec?.ndb_amt || 0).toFixed(2);
//       rec.cr_amount = Number(rec?.ncr_amt || 0).toFixed(2);
//       rec.cref_no = rec?.ref_no;
//       rec.party_name = rec?.cvendor_name;
//       rec.posted = rec?.npost === "Yes" ? "Y" : "N";

//       cr_total += Number(rec?.ncr_amt || 0);
//       db_total += Number(rec?.ndb_amt || 0);

//       enrichedRows.push(rec);
//     }

//     // 11. Final response
//     res.status(200).json({
//       success: true,
//       opening_balance: {
//         yr_op_bal: Number(yrOpBal || 0).toFixed(2),
//         yr_db_cr,
//         curr_bal: Number(curr_bal || 0).toFixed(2),
//         curr_db_cr,
//       },
//       kard_data: enrichedRows || [],
//       hdrData: {
//         cr_total: Number(cr_total || 0).toFixed(2),
//         db_total: Number(db_total || 0).toFixed(2),
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     await db.query("rollback");
//     return res.status(500).json({
//       type: "error",
//       message: error.message || "Internal Server Error",
//     });
//   }
// });


exports.getFormData = catchAsync(async (req, res, next) => {
  const {
    acc_no,
    division_id,
    trans_year,
    rg_vch,
    from_date,
    to_date,
    combine_acc_yn,
    id: user_id,
  } = req.query;

  let yrOpBal = 0;
  let yr_db_cr = "D";
  let curr_bal = 0;
  let curr_db_cr = "D";
  let cr_total = 0;
  let db_total = 0;

  try {

    const nextDate = new Date(to_date);
    nextDate.setDate(nextDate.getDate() + 1); // add 1 day

    console.log(
      "openingBal para",
      acc_no,
      from_date,
      rg_vch,
      division_id,
      trans_year,
      combine_acc_yn,
      rg_vch,
      to_date
    );

    // const lastTimeOfDay = await db.query(`select getlasttimeofday($1::date)`, [
    //   to_date,
    // ]);





    // console.log('last day and time of todate',lastTimeOfDay.rows[0].getlasttimeofday);

// const lastTimeOfDay = await db.query(
//   `SELECT to_char(($1::date + interval '1 day' - interval '1 second'), 'YYYY-MM-DD 00:00:00') AS last_time`,
//   [to_date]
// );

const lastTimeOfDay = await db.query(
  `SELECT ($1::date + interval '1 day')::date AS last_time`,
  [to_date]
);


console.log(lastTimeOfDay.rows[0].last_time);

    // 1. Get opening balance
    // const getYrOpnBal = await db.query(
    //   `SELECT * FROM proc_opening_acc_wise_dtl_entry($1, $2, $3, $4, $5, $6, $7)`,
    //   [
    //     acc_no,
    //     from_date,
    //     rg_vch,
    //     division_id,
    //     trans_year,
    //     combine_acc_yn,
    //     rg_vch,
    //   ]
    // );


    console.log('from_date',from_date)

    const runyrOpnBal = await db.query(
      `SELECT * from func_acc_opening_balance($1, $2, $3, $4, $5, $6)`,
      [acc_no, from_date, division_id, trans_year, rg_vch, user_id]
    );


    const getYrOpnBal = await db.query(
      `select opening_balance, db_cr from acc_opening_summary where acc_no = $1 and userid = $2`,
      [acc_no, user_id]
    );

    // 1.2 Get current balance of to date
    // const getCurrentBal = await db.query(
    //   `SELECT * FROM proc_opening_acc_wise_dtl_entry($1, $2, $3, $4, $5, $6, $7)`,
    //   [
    //     acc_no,
    //     to_date,
    //     rg_vch,
    //     division_id,
    //     trans_year,
    //     combine_acc_yn,
    //     rg_vch,
    //   ]
    // );
    // todo call below
    // const runCurrBal = await db.query(
    //   `SELECT * from func_acc_opening_balance($1, $2, $3, $4, $5, $6)`,
    //   [acc_no, lastTimeOfDay.rows[0].getlasttimeofday, division_id, trans_year, rg_vch, user_id]
    // );

    // const getCurrentBal = await db.query(
    //   `select closing_balance, db_cr from acc_opening_summary where acc_no = $1 and userid = $2`,
    //   [acc_no, user_id]
    // );

    // console.log(getCurrentBal.rows);

    if (getYrOpnBal.rowCount > 0) {
      yrOpBal = getYrOpnBal.rows[0]?.opening_balance || 0;
      yr_db_cr = getYrOpnBal.rows[0]?.db_cr || "D";
      // curr_bal = getCurrentBal.rows[0]?.closing_balance || 0;
      // curr_db_cr = getCurrentBal.rows[0]?.db_cr || "D";
    }

    // 3. Initialize tracking vars
    const enrichedRows = [];

    // delete all data from table temp_acc_ledger
    // await db.query("delete from temp_acc_ledger");

    // CALLIING PROCEDURE
    // await db.query(`call acc_ledger_4_postgres($1, $2, $3, $4, $5, $6, $7)`, [
    //   acc_no,
    //   combine_acc_yn,
    //   division_id,
    //   trans_year,
    //   rg_vch,
    //   from_date,
    //   to_date,
    // ]);

    // const getData = await db.query("select * from temp_acc_ledger");
    console.log('user_id befor inserting in DUMP_GL_ACC_WITHIN_DATE_RANGE', user_id)

    await db.query("call DUMP_GL_ACC_WITHIN_DATE_RANGE($1,$2,$3,$4,$5,$6,$7)", [
      acc_no,
      from_date,
      to_date,
      division_id,
      trans_year,
      rg_vch,
      user_id,
    ]);

    // const getData = await db.query(`
    //   (SELECT *
    //   FROM vwgl_kard_with_balance
    //   WHERE acc_no = $1
    //     AND coalesce(voucher_dt,ref_date) BETWEEN $2 AND $3
    //     AND ($4 <> 'P')
    //   ORDER BY coalesce(voucher_dt,ref_date), coalesce(voucher_no, ref_no))
    //   UNION ALL
    //   (SELECT *
    //   FROM vwgl_kard_with_balance
    //   WHERE acc_no = $1
    //     AND voucher_dt BETWEEN $2 AND $3
    //     AND ($4 = 'P' and npost = 'Y')
    //   ORDER BY voucher_dt, voucher_no)
    // `, [acc_no, from_date, to_date, rg_vch]);
    //todo remove userid
//     const getData = await db.query(`
//       SELECT
// SR_NO, SRL_NO, ACC_NO, ACC_DESC, REF_NO, REF_DATE, REMARKS, VOUCHER_NO, VOUCHER_DT, NPROJ_NO, CVENDOR_NAME, BILL_NO,
// BILL_DT, CHQ_NO, CHQ_DT, CCHQ_FAVOUR, PFROM_DATE, NDB_AMT, NCR_AMT, NPOST, ABS(RUNNING_BALANCE) running_balance,
// vch_type as type, project_number as project_no, ser_party_name, user_id,
//  CASE
//                     WHEN RUNNING_BALANCE < 0::double precision THEN 'C'::text
//                     WHEN RUNNING_BALANCE >= 0::double precision THEN 'D'::text
//                     ELSE NULL::text
//                 END AS BAL_DB_CR
// FROM
// (
// SELECT  SUM(RB) OVER (
//         PARTITION BY ACC_NO
//         ORDER BY ACC_NO, SR_NO
//     ) AS running_balance, B.*
// FROM
// (SELECT A.*,
// (CASE WHEN ndb_amt > 0  THEN ndb_amt
// WHEN ncr_amt > 0 THEN ncr_amt * -1
// WHEN NCR_AMT = 0 AND NDB_AMT = 0 AND YR_DB_CR = 'D' THEN OP_BAL
// WHEN NCR_AMT = 0 AND NDB_AMT = 0 AND YR_DB_CR = 'C' THEN OP_BAL * -1
// END) AS RB
// FROM temp_gl_records_4_printing A ORDER BY SRL_NO
// ) B
// ) final_data WHERE SR_NO NOT IN (0,9999) and user_id = $1`,[user_id]);



//     const getData = await db.query(` 
// SELECT acc_no,
//              acc_desc,
//              ref_no,
//              ref_date,
//              voucher_no,
//              voucher_dt,
//              sr_no,
//              srl_no,
//              remarks,
//              nproj_no, 
//              cvendor_name,
//              bill_no, bill_dt, chq_no, chq_dt, cchq_favour, PFROM_DATE, npost,
//              ndb_amt,
//              abs(ncr_amt) ncr_amt,
//              cdbcr,
//        -- Opening balance for this account
//        FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no) AS opening_balance,
//     -- Running balance (opening balance + cumulative debits - credits)
//         abs(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no)
//           + SUM(ndb_amt - ncr_amt) OVER (PARTITION BY acc_no ORDER BY voucher_dt, srl_no, sr_no
//                                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW))
//         AS running_balance,
//     -- Derived Debit/Credit flag
//         CASE
//           WHEN (
//             FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no)
//             + SUM(ndb_amt - ncr_amt) OVER (PARTITION BY acc_no ORDER BY voucher_dt, srl_no, sr_no
//                                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
//           ) < 0 THEN 'C'
//         ELSE 'D'
//         END AS bal_db_cr,
// 			vch_type as type, project_number as project_no, ser_party_name,
// 		    user_id
//         FROM temp_gl_records_4_printing where user_id = $1
// 	    ORDER BY acc_no, srl_no, sr_no
//       `,[user_id]);


const getData = await db.query(` 
SELECT acc_no,
             acc_desc,
             ref_no,
             ref_date,
              CASE 
            WHEN sr_no = 0 THEN 'OPENING BALANCE'
            WHEN sr_no = 9999 THEN 'CLOSING BALANCE'
            ELSE voucher_no
        END AS voucher_no,
             voucher_dt,
             sr_no,
             srl_no,
             remarks,
             nproj_no, 
             cvendor_name,
             bill_no, bill_dt, chq_no, chq_dt, cchq_favour, PFROM_DATE, npost,
             ndb_amt,
             abs(ncr_amt) ncr_amt,
             cdbcr,
             party_reference,
       -- Opening balance for this account
       FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no) AS opening_balance,
    -- Running balance (opening balance + cumulative debits - credits)
        abs(FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no)
          + SUM(ndb_amt - ncr_amt) OVER (PARTITION BY acc_no ORDER BY voucher_dt, srl_no, sr_no
                                       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW))
        AS running_balance,
    -- Derived Debit/Credit flag
        CASE
          WHEN (
            FIRST_VALUE(result_bal) OVER (PARTITION BY acc_no ORDER BY sr_no)
            + SUM(ndb_amt - ncr_amt) OVER (PARTITION BY acc_no ORDER BY voucher_dt, srl_no, sr_no
                                           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
          ) < 0 THEN 'C'
        ELSE 'D'
        END AS bal_db_cr,
			vch_type as type, project_number as project_no, ser_party_name,
		    user_id
        FROM temp_gl_records_4_printing where user_id = $1
	    ORDER BY acc_no, srl_no, sr_no
`,[user_id]);

      
    for (const rec of getData.rows) {

      let getPartyCode = await db.query(
        `select acc_desc from mhfmglm where acc_no = $1`,
        [rec?.ser_party_cd]
      );

      rec.voucher_dt = dateFormater(rec?.voucher_dt);
      rec.cref_date = dateFormater(rec?.ref_date);
      rec.ref_date = dateFormater(rec?.ref_date);
      rec.bill_dt = dateFormater(rec?.bill_dt);
      rec.chq_dt = dateFormater(rec?.chq_dt);

      rec.balance = Number(rec?.running_balance || 0).toFixed(2);

      rec.db_cr = rec?.cdbcr;
      rec.bal_dbcr = rec?.bal_db_cr;
      rec.db_amount = Number(rec?.ndb_amt || 0).toFixed(2);
      rec.cr_amount = Number(rec?.ncr_amt || 0).toFixed(2);
      rec.cref_no = rec?.ref_no;
      rec.party_name = getPartyCode.rows[0]?.acc_desc;
      // rec.posted = rec?.npost === "Yes" ? "Y" : "N";
      rec.posted = rec?.npost;

      cr_total += Number(rec?.ncr_amt || 0);
      db_total += Number(rec?.ndb_amt || 0);

      enrichedRows.push(rec);
    }

    console.log('for current bal perameters',acc_no, lastTimeOfDay.rows[0].last_time, division_id, trans_year, rg_vch, user_id)
    
    const runCurrBal = await db.query(
      `SELECT * from func_acc_opening_balance($1, $2, $3, $4, $5, $6)`,
      [acc_no, lastTimeOfDay.rows[0].last_time, division_id, trans_year, rg_vch, user_id]
    );

    const getCurrentBal = await db.query(
      `select closing_balance, db_cr from acc_opening_summary where acc_no = $1 and userid = $2`,
      [acc_no, user_id]
    );

    console.log('result',getCurrentBal.rows[0].closing_balance)

    if (getCurrentBal.rowCount > 0) {
      curr_bal = getCurrentBal.rows[0]?.closing_balance || 0;
      curr_db_cr = getCurrentBal.rows[0]?.db_cr || "D";
    }

    // 11. Final response
    res.status(200).json({
      success: true,
      opening_balance: {
        yr_op_bal: Number(yrOpBal || 0).toFixed(2),
        yr_db_cr,
        curr_bal: Number(curr_bal || 0).toFixed(2),
        curr_db_cr,
      },
      kard_data: enrichedRows || [{}],
      hdrData: {
        cr_total: Number(cr_total || 0).toFixed(2),
        db_total: Number(db_total || 0).toFixed(2),
      },
    });
  } catch (error) {
    console.error(error);
    await db.query("rollback");
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});
