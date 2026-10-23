const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");




const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    help_list,
   
  } = req?.query;

  console.log("req?.query:", req?.query);


 if (help_list === "Year") {
  const itemList = await db.query(
    `Select year_code from moitfinyear order by 1 desc`
  );

  return res.status(200).send(itemList.rows);
}
 if (help_list === "Division") {
  const itemList = await db.query(
    `SELECT  name, division_id FROM moitdivision order by division_id`);

  return res.status(200).send(itemList.rows);
}

};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});




  exports.handlePostFormData = catchAsync(async (req, res, next) => {
  try {
    const {po_type,po_status,division_id,from_date,to_date,trans_year,report_type, } = req.body;

      console.log("po_status =", po_status);
      console.log("report_type =", report_type);
      console.log("po_type =", po_type);

    let query = "";

    // ─────────────────────────────────────────────
    // HELPER: make single SELECT block for Detail report
    // tableName  → "MHMMPO" ya "MHMMPOAMD"
    // yearFilter → "current"  : TRANS_YEAR = $2
    //              "carryforward" : eff_dt < $2 AND end_dt >= $2
    // addFlagCondition → true sirf Authorized (MHMMPO) ke liye
    // ─────────────────────────────────────────────
    const buildDetailBlock = ( tableName,detailTable, yearFilter, addFlagCondition ) => {
      const yearCondition =
        yearFilter === "current"
          ? `AND C.TRANS_YEAR = $2::varchar`
          : `AND TO_CHAR(C.PO_EFF_DT,'YYYY') < $2::varchar
             AND TO_CHAR(C.PO_END_DT,'YYYY') >= $2::varchar
             AND C.TRANS_YEAR < $2::varchar`;

      const flagCondition = addFlagCondition ? `AND C.FLAG = 'F'` : "";

            
        const authStatusCol = addFlagCondition
        ? `'AUTHORIZED'   AS "AUTHORIZED STATUS"`
        : `'UNAUTHORIZED' AS "AUTHORIZED STATUS"`;

      return `
        SELECT
            I.NAME                    AS "DIVISION NAME",
            C.PO_NO                   AS "PO NO",
            F.PO_CAT_DESCRIPTION      AS "PO DESCRIPTION",
            CASE
                WHEN C.PO_TYPE = 'O' THEN 'ORDER'
                WHEN C.PO_TYPE = 'A' THEN 'ADVICE'
                ELSE C.PO_TYPE
            END                       AS "PO TYPE",
            C.PO_DATE                 AS "PO DATE",
            C.PO_EFF_DT               AS "PO EFF DATE",
            C.PO_END_DT               AS "PO END DATE",
            B.V_CODE                  AS "VENDOR CODE",
            B.V_NAME                  AS "VENDOR NAME",
            CASE
                WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
                ELSE C.C_CODE
            END                       AS "CUSTOMER CODE",
            CASE
                WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
                ELSE ME.DEALER_CODE
            END                       AS "DEALER CODE ",
            CASE
                WHEN C.PO_TYPE = 'O'
                THEN 'ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED'
                ELSE ME.DLR_NAME
            END                       AS "DEALER NAME",
            A.IT_CODE                 AS "ITEM CODE",
            A.IT_NAME                 AS "ITEM NAME",
            D.PO_MAT_RAT              AS "RATE",
            D.PO_QTY_ORD              AS "QTY ORDER",
            COALESCE(SUM(R.QTY_RECD), 0)
                                      AS "QTY RECEIVED",
            (D.PO_QTY_ORD - COALESCE(SUM(R.QTY_RECD), 0))
                                      AS "QTY BALANCE",

                                      
        ${authStatusCol}

        FROM ${tableName} C

      JOIN ${detailTable} D
          ON C.PO_ID = D.PO_ID

      JOIN MOMMITEM A
          ON A.IT_CODE = D.IT_CODE

        JOIN MOMMVEND B
            ON B.V_CODE = C.V_CODE

        JOIN MHMMTERM E
            ON C.TERM_CODE = E.TERM_CODE

        JOIN MOMMPCAT F
            ON C.CATEGORY = F.PO_CAT_PREFIX

        JOIN MOITDIVISION I
            ON I.DIVISION_ID = C.DIVISION_ID

        LEFT JOIN MOEDMEMBER ME
            ON ME.MEMBER_NO = C.C_CODE

        LEFT JOIN TDMMRCT R
            ON R.PO_ID = D.PO_ID
           AND R.IT_CODE = D.IT_CODE

        WHERE
              C.DIVISION_ID = COALESCE($1::bigint, C.DIVISION_ID)
          ${yearCondition}
          AND (
                $3 = 'ALL'
                OR C.PO_TYPE = $3::varchar
              )
          AND B.CONTRACTOR_FLAG = 'N'
          AND C.CANCEL_FLAG     = 'N'
          ${flagCondition}

        GROUP BY
            I.NAME,
            C.PO_NO,
            F.PO_CAT_DESCRIPTION,
            C.PO_TYPE,
            C.PO_DATE,
            C.PO_EFF_DT,
            C.PO_END_DT,
            B.V_CODE,
            B.V_NAME,
            C.C_CODE,
            ME.DEALER_CODE,
            ME.DLR_NAME,
            A.IT_CODE,
            A.IT_NAME,
            D.PO_MAT_RAT,
            D.PO_QTY_ORD
      `;
    };

    // ─────────────────────────────────────────────
    // HELPER: Summary block
    // tableName          → "MHMMPO" ya "MHMMPOAMD"
    // addFlagCondition   → true sirf Authorized ke liye
    // ─────────────────────────────────────────────
 const buildSummaryBlock = ( tableName, detailTable, addFlagCondition ) => {

      const flagCondition = addFlagCondition ? `AND C.FLAG = 'F'` : "";

      const authStatusCol = addFlagCondition
  ? `'AUTHORIZED'   AS "AUTHORIZED STATUS"`
  : `'UNAUTHORIZED' AS "AUTHORIZED STATUS"`;

      return `
        SELECT
            C.PO_NO                   AS "PO NO",
            F.PO_CAT_DESCRIPTION      AS "PO DESCRIPTION",
            CASE
                WHEN C.PO_TYPE = 'O' THEN 'ORDER'
                WHEN C.PO_TYPE = 'A' THEN 'ADVICE'
                ELSE C.PO_TYPE
            END                       AS "PO TYPE",
            C.PO_DATE                 AS "PO DATE",
            C.PO_EFF_DT               AS "PO EFF DATE",
            C.PO_END_DT               AS "PO END DATE",
            
          --  CASE
            --    WHEN CURRENT_DATE BETWEEN C.PO_EFF_DT AND C.PO_END_DT
            --    THEN (C.PO_END_DT - CURRENT_DATE)
           --     ELSE 0
          --  END                       AS "PENDING AGE",

            CASE
              WHEN C.CLOSURE_FLAG = 'Y'
               THEN 0
            WHEN (
                SUM(D.PO_QTY_ORD) - COALESCE(SUM(R.QTY_RECD), 0) ) = 0
            THEN 0
            ELSE (CURRENT_DATE - C.PO_EFF_DT)
            END                                 AS "PENDING AGE IN DAYS",

            CASE
              WHEN C.CLOSURE_FLAG = 'Y'
              THEN 'COMPLETE'
                WHEN (
                    SUM(D.PO_QTY_ORD) - COALESCE(SUM(R.QTY_RECD), 0)
                ) = 0
                THEN 'COMPLETE'
                ELSE 'PENDING'
            END                       AS "PO STATUS",

            B.V_CODE                  AS "VENDOR CODE",
            B.V_NAME                  AS "VENDOR NAME",
            CASE
                WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
                ELSE C.C_CODE
            END                       AS "CUSTOMER CODE",
            CASE
                WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
                ELSE ME.DEALER_CODE
            END                       AS "DEALER CODE",
            CASE
                WHEN C.PO_TYPE = 'O'
                THEN 'ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED'
                ELSE ME.DLR_NAME
            END                       AS "DEALER NAME",
            ${authStatusCol}

        FROM ${tableName} C

        JOIN MOMMVEND B
            ON B.V_CODE = C.V_CODE

        LEFT JOIN MOEDMEMBER ME
            ON ME.MEMBER_NO = C.C_CODE

        JOIN MOMMPCAT F
            ON C.CATEGORY = F.PO_CAT_PREFIX

        JOIN ${detailTable} D
        ON D.PO_ID = C.PO_ID

      --  LEFT JOIN TDMMRCT R
      --      ON R.PO_ID = D.PO_ID
      --     AND R.IT_CODE = D.IT_CODE

      LEFT JOIN (
        SELECT
            PO_ID,
            IT_CODE,
            SUM(QTY_RECD) AS QTY_RECD
        FROM TDMMRCT
        GROUP BY
            PO_ID,
            IT_CODE
    ) R
    ON R.PO_ID = D.PO_ID
    AND R.IT_CODE = D.IT_CODE

        WHERE
              C.DIVISION_ID = COALESCE($1::bigint, C.DIVISION_ID)
          AND C.TRANS_YEAR  = $2::varchar
          AND (
                $3 = 'ALL'
                OR C.PO_TYPE = $3::varchar
              )
          AND C.CANCEL_FLAG = 'N'
          ${flagCondition}

        GROUP BY
            C.PO_NO,
            F.PO_CAT_DESCRIPTION,
            C.PO_TYPE,
            C.PO_DATE,
            C.PO_EFF_DT,
            C.PO_END_DT,
            C.CLOSURE_FLAG,
            B.V_CODE,
            B.V_NAME,
            C.C_CODE,
            ME.DEALER_CODE,
            ME.DLR_NAME
      `;
    };

    // ─────────────────────────────────────────────
    // QUERY BUILD: report_type + po_status combine
    //
    // po_status = "Authorized"   →  MHMMPO    (FLAG='F')
    // po_status = "Unauthorized" →  MHMMPOAMD (no flag)
    // po_status = "both"         → UNION 
    // ─────────────────────────────────────────────

    if (report_type === "DETAIL") {

      if (po_status === "Authorized") {
        // ── Authorized: MHMMPO current year  UNION ALL  MHMMPO carry forward ──
       query = `
          ${buildDetailBlock("MHMMPO","MDMMPOIT","current",true )}
          UNION ALL
          ${buildDetailBlock( "MHMMPO", "MDMMPOIT", "carryforward", true)}
          ORDER BY 2,5
        `;

      } else if (po_status === "Unauthorized") {
        // ── Unauthorized: MHMMPOAMD current year UNION ALL MHMMPOAMD carry forward ──
       query = `
          ${buildDetailBlock("MHMMPOAMD","MDMMPOITAMD","current",false )}
          UNION ALL
          ${buildDetailBlock("MHMMPOAMD","MDMMPOITAMD","carryforward",false)}
          ORDER BY 2,5
        `;

      } else {
        // ── Both: MHMMPO (auth) + MHMMPOAMD (unauth) — current + carryforward ──
        query = `
        ${buildDetailBlock("MHMMPO","MDMMPOIT","current",true )}
        UNION ALL ${buildDetailBlock("MHMMPO","MDMMPOIT","carryforward",true)}
        UNION ALL${buildDetailBlock( "MHMMPOAMD", "MDMMPOITAMD", "current", false )}
        UNION ALL ${buildDetailBlock("MHMMPOAMD","MDMMPOITAMD","carryforward",false )}
        ORDER BY 2,5
      `;
      }

    } else if (report_type === "SUMMARY") {

      if (po_status === "Authorized") {
        // ── Authorized: sirf MHMMPO ──
       query = `
          ${buildSummaryBlock("MHMMPO","MDMMPOIT",true )}
          ORDER BY "PO NO"
        `;

      } else if (po_status === "Unauthorized") {
        // ── Unauthorized: sirf MHMMPOAMD ──
       query = `
         ${buildSummaryBlock( "MHMMPOAMD","MDMMPOITAMD", false )}
          ORDER BY "PO NO"
        `;

      } else {
        // ── Both: UNION dono ka ──
       query = `
          ${buildSummaryBlock("MHMMPO","MDMMPOIT",true)}
          UNION ALL
          ${buildSummaryBlock( "MHMMPOAMD","MDMMPOITAMD", false )}
          ORDER BY "PO NO"
        `;
      }
    }

    const params = [
      division_id || null,
      trans_year,
      po_type || null,
    ];

    const result = await db.query(query, params);

    const formattedData = result.rows.map((row) => ({
      ...row,
      "PO DATE":     row["PO DATE"]     ? dateFormater(row["PO DATE"])     : null,
      "PO EFF DATE": row["PO EFF DATE"] ? dateFormater(row["PO EFF DATE"]) : null,
      "PO END DATE": row["PO END DATE"] ? dateFormater(row["PO END DATE"]) : null,
    }));

    const columns = result.fields.map((f) => f.name);

    return res.status(200).json({
      success: true,
      data: formattedData,
      columns: columns,
    });

  } catch (error) {
    console.error("handlePostFormData error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

//   const query = `

//   SELECT
//     I.NAME AS "DIVISION NAME",

//     C.PO_NO AS "PO NO",

//     F.PO_CAT_DESCRIPTION AS "PO DESCRIPTION",

//   --  CASE
//   --      WHEN C.PO_FLAG = 'O' THEN 'ONE TIME'
//   --      WHEN C.PO_FLAG = 'A' THEN 'OPEN'
//   --      ELSE C.PO_FLAG
//   --  END AS "PO FLAG",

//   --  C.PO_TYPE AS "PO TYPE",  

//   CASE
//    WHEN C.PO_TYPE = 'O' THEN ' ORDER'
//    WHEN C.PO_TYPE = 'A' THEN ' ADVICE'
//    ELSE C.PO_TYPE
// END AS "PO TYPE",

//     C.PO_DATE AS "PO DATE",

//     C.PO_EFF_DT AS "PO EFF DATE",

//     C.PO_END_DT AS "PO END DATE",

//    -- C.AMD_NO AS "AMD NO",

//   --  C.AMD_DATE AS "AMD DATE",

//     B.V_CODE AS "VENDOR CODE",

//     B.V_NAME AS "VENDOR NAME",

//   CASE
//     WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
//     ELSE C.C_CODE
// END AS "CUSTOMER CODE",

// CASE
//     WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
//     ELSE ME.DEALER_CODE
// END AS "DEALER CODE ",

// CASE
//     WHEN C.PO_TYPE = 'O'
//     THEN 'ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED'
//     ELSE ME.DLR_NAME
// END AS "DEALER NAME",

//     A.IT_CODE AS "ITEM CODE",

//     A.IT_NAME AS "ITEM NAME",

//     D.PO_MAT_RAT AS "RATE",

//    --- D.PO_DISC AS "PO DISC %",

//     D.PO_QTY_ORD AS "QTY ORDER"

//   --  D.ACTIVE AS "ACTIVE"

//  --   E.TERM_DESC AS "TERM DESCRIPTION"

//    -- G.USER_NAME AS "PO CREATED BY"

// FROM MOMMITEM A

// JOIN MDMMPOIT D
//     ON A.IT_CODE = D.IT_CODE

// JOIN MHMMPO C
//     ON C.PO_ID = D.PO_ID

// JOIN MOMMVEND B
//     ON B.V_CODE = C.V_CODE

// JOIN MHMMTERM E
//     ON C.TERM_CODE = E.TERM_CODE

// JOIN MOMMPCAT F
//     ON C.CATEGORY = F.PO_CAT_PREFIX

// -- JOIN USER_MASTER G
//   --  ON C.CREATE_ID = G.USER_ID
 
// JOIN MOITDIVISION I
//     ON I.DIVISION_ID = C.DIVISION_ID

// LEFT JOIN MOEDMEMBER ME
//     ON ME.MEMBER_NO = C.C_CODE

// WHERE

//       C.DIVISION_ID =
//       COALESCE($1::bigint, C.DIVISION_ID)

//   AND C.TRANS_YEAR = $2::varchar

//   --AND C.PO_TYPE = COALESCE($3::varchar, C.PO_TYPE)


//   AND (
//         $3 = 'ALL'
//         OR C.PO_TYPE = $3::varchar
//       )

//   AND B.CONTRACTOR_FLAG = 'N'

//   AND C.FLAG = 'F'

//   AND C.CANCEL_FLAG = 'N'

// UNION ALL

// SELECT
//     I.NAME AS "DIVISION NAME",

//     C.PO_NO AS "PO NO",

//     F.PO_CAT_DESCRIPTION AS "PO DESCRIPTION",

//    -- CASE
//    --     WHEN C.PO_FLAG = 'O' THEN 'ONE TIME'
//    --     WHEN C.PO_FLAG = 'A' THEN 'OPEN'
//     --    ELSE C.PO_FLAG
//    -- END AS "PO FLAG",

//    --  C.PO_TYPE AS "PO TYPE",

//    CASE
//    WHEN C.PO_TYPE = 'O' THEN 'ORDER'
//    WHEN C.PO_TYPE = 'A' THEN 'ADVICE'
//    ELSE C.PO_TYPE
// END AS "PO TYPE",

//     C.PO_DATE AS "PO DATE",

//     C.PO_EFF_DT AS "PO EFF DATE",

//     C.PO_END_DT AS "PO END DATE",

//   --  C.AMD_NO AS "AMD NO",

//   --  C.AMD_DATE AS "AMD DATE",

//     B.V_CODE AS "VENDOR CODE",

//     B.V_NAME AS "VENDOR NAME",

// CASE
//     WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
//     ELSE C.C_CODE
// END AS "CUSTOMER CODE",

// CASE
//     WHEN C.PO_TYPE = 'O' THEN 'EDDAL'
//     ELSE ME.DEALER_CODE
// END AS "DEALER CODE ",

// CASE
//     WHEN C.PO_TYPE = 'O'
//     THEN 'ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED'
//     ELSE ME.DLR_NAME
// END AS "DEALER NAME",

//     A.IT_CODE AS "ITEM CODE",

//     A.IT_NAME AS "ITEM NAME",

//     D.PO_MAT_RAT AS "RATE",

//   --  D.PO_DISC AS "PO DISC %",

//     D.PO_QTY_ORD AS "QTY ORDER"

//  --   D.ACTIVE AS "ACTIVE",

//  --   E.TERM_DESC AS "TERM DESCRIPTION"

//  --   G.USER_NAME AS "PO CREATED BY"

// FROM MOMMITEM A

// JOIN MDMMPOIT D
//     ON A.IT_CODE = D.IT_CODE

// JOIN MHMMPO C
//     ON C.PO_ID = D.PO_ID

// JOIN MOMMVEND B
//     ON B.V_CODE = C.V_CODE

// JOIN MHMMTERM E
//     ON C.TERM_CODE = E.TERM_CODE

// JOIN MOMMPCAT F
//     ON C.CATEGORY = F.PO_CAT_PREFIX

// --JOIN USER_MASTER G
// --    ON C.CREATE_ID = G.USER_ID

// JOIN MOITDIVISION I
//     ON I.DIVISION_ID = C.DIVISION_ID

//  LEFT   JOIN MOEDMEMBER ME
//     ON ME.MEMBER_NO = C.C_CODE

// WHERE

//       C.DIVISION_ID =
//       COALESCE($1::bigint, C.DIVISION_ID)

//   AND TO_CHAR(C.PO_EFF_DT,'YYYY') < $2::varchar

//   AND TO_CHAR(C.PO_END_DT,'YYYY') >= $2::varchar

//   AND C.TRANS_YEAR < $2::varchar

//  -- AND C.PO_TYPE = COALESCE($3::varchar, C.PO_TYPE)

//   AND (
//         $3 = 'ALL'
//         OR C.PO_TYPE = $3::varchar
//       )

//   AND B.CONTRACTOR_FLAG = 'N'

//   AND C.FLAG = 'F'

//   AND C.CANCEL_FLAG = 'N'

// ORDER BY 2,5

// `;
