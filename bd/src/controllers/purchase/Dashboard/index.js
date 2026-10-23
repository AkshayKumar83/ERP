
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { dateFormater } = require("../../../utility/constant");





exports.handleFormOperation = catchAsync(async (req, res) => {
  try {
    const { appDivisionId, appFinYear, poType } = req.query;

    // Dashboard Cards

    const cardResult = await db.query(
      `
      WITH all_po AS (

          SELECT po_type, flag, closure_flag, po_date,create_id,cancel_flag
          FROM mhmmpo
          WHERE division_id = $1
            AND trans_year = $2
            AND COALESCE(cancel_flag, 'N') <> 'Y'

          UNION ALL

          SELECT po_type, flag, closure_flag, po_date,create_id, cancel_flag
          FROM mhmmpoamd
          WHERE division_id = $1
          AND trans_year = $2
          AND COALESCE(cancel_flag, 'N') <> 'Y'

      )

      SELECT

          COUNT(*) FILTER (WHERE po_type='A')::int AS "purchaseAdvice",

          COUNT(*) FILTER (WHERE po_type='O')::int AS "purchaseOrders",

          COUNT(*) FILTER (WHERE flag <> 'F' OR flag IS NULL)::int AS "pendingAuthorization",

          COUNT(*) FILTER (WHERE flag='F')::int AS "authorized",

          COUNT(*) FILTER (WHERE closure_flag='N')::int AS "openPO",

          COUNT(*) FILTER (WHERE closure_flag='Y')::int AS "closedPO",

            -- Purchase Advice Users
           --   COUNT(*) FILTER (WHERE po_type='A' AND create_id = 614 )::int     AS "rekhaCount",
           
           COUNT(*) FILTER (
            WHERE po_type = 'A'
            AND (
                create_id = 614
                OR create_id = 10
                OR create_id IS NULL
            )
          )::int AS "rekhaCount",

             -- COUNT(*) FILTER ( WHERE po_type='A' AND create_id = 613 )::int     AS "sandeepCount",

             COUNT(*) FILTER (WHERE create_id = 613 )::int AS "sandeepCount",

              -- Purchase Order User
              COUNT(*) FILTER ( WHERE po_type='O' AND create_id = 615 )::int AS "sudhirCount",
              COUNT(*) FILTER ( WHERE po_type='O' AND create_id = 617 )::int AS "kanishkaCount",

          (
            SELECT COUNT(*)::int
            FROM thmmrct
            WHERE division_id=$1
            AND trans_year=$2
            AND COALESCE(cancel_ge,'N') <> 'Y'
          ) AS "gateEntry",

          (
            SELECT COUNT(*)::int
            FROM thmmmchl
            WHERE division_id=$1
            AND trans_year=$2
            AND rtn_nonrtn='N'
            AND COALESCE(cancel_sdv,'N') <> 'Y'
          ) AS "nrgp"

      FROM all_po
      WHERE po_type=$3
      `,
      [appDivisionId, appFinYear, poType]
    );

 const creatorResult = await db.query(
  `
  WITH all_po AS (

      SELECT po_type, create_id, cancel_flag
      FROM mhmmpo
      WHERE division_id = $1
        AND trans_year = $2
         AND COALESCE(cancel_flag, 'N') <> 'Y'


      UNION ALL

      SELECT po_type, create_id, cancel_flag
      FROM mhmmpoamd
      WHERE division_id = $1
      AND trans_year = $2
      AND COALESCE(cancel_flag, 'N') <> 'Y'
  ),

  creator_data AS (

      SELECT
          CASE
              WHEN create_id = 10 OR create_id IS NULL
                  THEN 614
              ELSE create_id
          END AS user_id

      FROM all_po

      WHERE po_type = $3
  )

  SELECT
      c.user_id AS "userId",
      u.user_name AS "userName",
      COUNT(*)::int AS "count"

  FROM creator_data c

  INNER JOIN user_master u
      ON u.user_id = c.user_id

  GROUP BY
      c.user_id,
      u.user_name

  ORDER BY
      u.user_name
  `,
  [appDivisionId, appFinYear, poType]
);


    // Monthly Chart
 
//     const monthlyChartResult  = await db.query(
 
//   `WITH months AS (

//       SELECT 4 AS month_no,'Apr' AS month
//       UNION ALL SELECT 5,'May'
//       UNION ALL SELECT 6,'Jun'
//       UNION ALL SELECT 7,'Jul'
//       UNION ALL SELECT 8,'Aug'
//       UNION ALL SELECT 9,'Sep'
//       UNION ALL SELECT 10,'Oct'
//       UNION ALL SELECT 11,'Nov'
//       UNION ALL SELECT 12,'Dec'
//       UNION ALL SELECT 1,'Jan'
//       UNION ALL SELECT 2,'Feb'
//       UNION ALL SELECT 3,'Mar'

//   ),

// po_monthly AS (

//     SELECT
//         EXTRACT(MONTH FROM po_date)::int AS month_no,

//         COUNT(*)::int AS total,

//         -- PA
//         COUNT(*) FILTER (
//             WHERE (
//                 create_id = 614
//                 OR create_id = 10
//                 OR create_id IS NULL
//             )
//         )::int AS rekha,

//         COUNT(*) FILTER (
//             WHERE create_id = 613
//         )::int AS sandeep,

//         -- PO
//         COUNT(*) FILTER (
//             WHERE create_id = 615
//         )::int AS sudhir,

//         COUNT(*) FILTER (
//             WHERE create_id = 617
//         )::int AS kanishka

//     FROM (

//         SELECT po_date,po_type,create_id
//         FROM mhmmpo
//         WHERE division_id=$1
//         AND trans_year=$2

//         UNION ALL

//         SELECT po_date,po_type,create_id
//         FROM mhmmpoamd
//         WHERE division_id=$1
//         AND trans_year=$2

//     ) p

//     WHERE po_type=$3

//     GROUP BY EXTRACT(MONTH FROM po_date)

// ),

//   ge_monthly AS (

//       SELECT

//           EXTRACT(MONTH FROM ge_date)::int AS month_no,

//           COUNT(*)::int AS "gateEntry"

//       FROM thmmrct

//       WHERE division_id = $1
//         AND trans_year = $2
//         AND COALESCE(cancel_ge,'N') <> 'Y'

//       GROUP BY EXTRACT(MONTH FROM ge_date)

//   ),

//   nrgp_monthly AS (

//       SELECT

//           EXTRACT(MONTH FROM doc_date)::int AS month_no,

//           COUNT(*)::int AS nrgp

//       FROM thmmmchl

//       WHERE division_id = $1
//         AND trans_year = $2
//         AND rtn_nonrtn = 'N'
//         AND COALESCE(cancel_sdv,'N') <> 'Y'

//       GROUP BY EXTRACT(MONTH FROM doc_date)

//   )

//   SELECT

//       m.month,

//       COALESCE(p.total,0) AS total,

//        COALESCE(p.rekha,0)     AS rekha,

//       COALESCE(p.sandeep,0)   AS sandeep,

//       COALESCE(p.sudhir,0) AS sudhir,

//       COALESCE(p.kanishka,0) AS kanishka,

//       COALESCE(g."gateEntry",0) AS "gateEntry",

//       COALESCE(n.nrgp,0)        AS nrgp

//   FROM months m

//   LEFT JOIN po_monthly p
//   ON m.month_no = p.month_no

//   LEFT JOIN ge_monthly g
//   ON m.month_no = g.month_no

//   LEFT JOIN nrgp_monthly n
//   ON m.month_no = n.month_no

//   WHERE
//   (
//       EXTRACT(MONTH FROM CURRENT_DATE) >= 4
//       AND m.month_no BETWEEN 4 AND EXTRACT(MONTH FROM CURRENT_DATE)
//   )
//   OR
//   (
//       EXTRACT(MONTH FROM CURRENT_DATE) < 4
//       AND (
//           m.month_no BETWEEN 4 AND 12
//           OR m.month_no BETWEEN 1 AND EXTRACT(MONTH FROM CURRENT_DATE)
//       )
//   )

//   ORDER BY

//   CASE

//       WHEN m.month_no = 4 THEN 1
//       WHEN m.month_no = 5 THEN 2
//       WHEN m.month_no = 6 THEN 3
//       WHEN m.month_no = 7 THEN 4
//       WHEN m.month_no = 8 THEN 5
//       WHEN m.month_no = 9 THEN 6
//       WHEN m.month_no = 10 THEN 7
//       WHEN m.month_no = 11 THEN 8
//       WHEN m.month_no = 12 THEN 9
//       WHEN m.month_no = 1 THEN 10
//       WHEN m.month_no = 2 THEN 11
//       WHEN m.month_no = 3 THEN 12

//     END;`,

//       [appDivisionId, appFinYear,poType]
//     );

const monthlyChartResult = await db.query(
  `
  WITH months AS (

      SELECT 4 AS month_no, 'Apr' AS month
      UNION ALL SELECT 5, 'May'
      UNION ALL SELECT 6, 'Jun'
      UNION ALL SELECT 7, 'Jul'
      UNION ALL SELECT 8, 'Aug'
      UNION ALL SELECT 9, 'Sep'
      UNION ALL SELECT 10, 'Oct'
      UNION ALL SELECT 11, 'Nov'
      UNION ALL SELECT 12, 'Dec'
      UNION ALL SELECT 1, 'Jan'
      UNION ALL SELECT 2, 'Feb'
      UNION ALL SELECT 3, 'Mar'

  ),

  all_po AS (

      SELECT
          po_date,
          po_type,
          create_id,
          cancel_flag
      FROM mhmmpo
      WHERE division_id = $1
        AND trans_year = $2
      AND COALESCE(cancel_flag, 'N') <> 'Y'
      UNION ALL

      SELECT
          po_date,
          po_type,
          create_id,
          cancel_flag
      FROM mhmmpoamd
      WHERE division_id = $1
        AND trans_year = $2
        AND COALESCE(cancel_flag, 'N') <> 'Y'

  ),

  po_monthly AS (

    SELECT
        EXTRACT(MONTH FROM po_date)::int AS month_no,

        CASE
            WHEN create_id = 10 OR create_id IS NULL
                THEN 614
            ELSE create_id
        END AS creator_id,

        COUNT(*)::int AS creator_count

    FROM all_po

    WHERE po_type = $3

    GROUP BY
        EXTRACT(MONTH FROM po_date),

        CASE
            WHEN create_id = 10 OR create_id IS NULL
                THEN 614
            ELSE create_id
        END

),

  po_total AS (

      SELECT
          EXTRACT(MONTH FROM po_date)::int AS month_no,
          COUNT(*)::int AS total

      FROM all_po

      WHERE po_type = $3

      GROUP BY EXTRACT(MONTH FROM po_date)

  ),

  ge_monthly AS (

      SELECT
          EXTRACT(MONTH FROM ge_date)::int AS month_no,
          COUNT(*)::int AS "gateEntry"

      FROM thmmrct

      WHERE division_id = $1
        AND trans_year = $2
        AND COALESCE(cancel_ge,'N') <> 'Y'

      GROUP BY EXTRACT(MONTH FROM ge_date)

  ),

  nrgp_monthly AS (

      SELECT
          EXTRACT(MONTH FROM doc_date)::int AS month_no,
          COUNT(*)::int AS nrgp

      FROM thmmmchl

      WHERE division_id = $1
        AND trans_year = $2
        AND rtn_nonrtn = 'N'
        AND COALESCE(cancel_sdv,'N') <> 'Y'

      GROUP BY EXTRACT(MONTH FROM doc_date)

  )

SELECT

    m.month,

    COALESCE(t.total, 0) AS total,

    COALESCE(
        json_agg(
            json_build_object(
                'userId', p.creator_id,
                'userName', u.user_name,
                'count', p.creator_count
            )
            ORDER BY u.user_name
        ) FILTER (WHERE p.creator_id IS NOT NULL),
        '[]'::json
    ) AS creators,

    COALESCE(g."gateEntry", 0) AS "gateEntry",

    COALESCE(n.nrgp, 0) AS nrgp

  FROM months m

  LEFT JOIN po_total t
      ON m.month_no = t.month_no

  LEFT JOIN po_monthly p
      ON m.month_no = p.month_no

 LEFT JOIN user_master u
    ON u.user_id = p.creator_id

  LEFT JOIN ge_monthly g
      ON m.month_no = g.month_no

  LEFT JOIN nrgp_monthly n
      ON m.month_no = n.month_no

  WHERE
  (
      EXTRACT(MONTH FROM CURRENT_DATE) >= 4
      AND m.month_no BETWEEN 4
      AND EXTRACT(MONTH FROM CURRENT_DATE)
  )
  OR
  (
      EXTRACT(MONTH FROM CURRENT_DATE) < 4
      AND (
          m.month_no BETWEEN 4 AND 12
          OR m.month_no BETWEEN 1
          AND EXTRACT(MONTH FROM CURRENT_DATE)
      )
  )

  GROUP BY
      m.month_no,
      m.month,
      t.total,
      g."gateEntry",
      n.nrgp

  ORDER BY
      CASE
          WHEN m.month_no = 4 THEN 1
          WHEN m.month_no = 5 THEN 2
          WHEN m.month_no = 6 THEN 3
          WHEN m.month_no = 7 THEN 4
          WHEN m.month_no = 8 THEN 5
          WHEN m.month_no = 9 THEN 6
          WHEN m.month_no = 10 THEN 7
          WHEN m.month_no = 11 THEN 8
          WHEN m.month_no = 12 THEN 9
          WHEN m.month_no = 1 THEN 10
          WHEN m.month_no = 2 THEN 11
          WHEN m.month_no = 3 THEN 12
      END;
  `,
  [appDivisionId, appFinYear, poType]
);

    return res.status(200).json({
  ...cardResult.rows[0],
  creatorSummary: creatorResult.rows,
  monthlyChart: monthlyChartResult.rows,
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error on purchase dashboard data",
    });
  }
});


exports.handleVendorMonthData = catchAsync(async (req, res) => {
  try {
    const { appDivisionId, appFinYear, poType, selectedChart, month } = req.query;

    const monthMap = {
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
      Jan: 1,
      Feb: 2,
      Mar: 3,
    };

    const monthNo = monthMap[month];



let userFilter = "";

if (
  selectedChart &&
  selectedChart !== "total"
) {
  userFilter = `
    AND (
      p.create_id = $5
      ${
        Number(selectedChart) === 614
          ? `
            OR p.create_id = 10
            OR p.create_id IS NULL
          `
          : ""
      }
    )
  `;
}

 

    const query =`
    WITH all_po AS (

    SELECT
        po_id,
        v_code,
        create_id,
        po_type,
        po_date,
        brand_code,
        cancel_flag
    FROM mhmmpo
    WHERE division_id = $1
      AND trans_year = $2
      AND COALESCE(cancel_flag, 'N') <> 'Y'

    UNION ALL

    SELECT
        po_id,
        v_code,
        create_id,
        po_type,
        po_date,
        brand_code,
        cancel_flag
    FROM mhmmpoamd
    WHERE division_id = $1
      AND trans_year = $2
    AND COALESCE(cancel_flag, 'N') <> 'Y'
),

 vendor_data AS (

    SELECT
        p.v_code,
        v.v_name,
        COUNT(DISTINCT p.po_id)::int AS total

    FROM all_po p

    JOIN mommvend v
      ON v.v_code = p.v_code

   WHERE
    p.po_type = $3
    AND EXTRACT(MONTH FROM p.po_date) = $4

    AND (
        $5 = 'total'

        OR (
            $5 = '614'
            AND (
                p.create_id = 614
                OR p.create_id = 10
                OR p.create_id IS NULL
            )
        )

        OR (
            $5 <> 'total'
            AND $5 <> '614'
            AND p.create_id = $5::bigint
        )
    )

    GROUP BY
        p.v_code,
        v.v_name

),

brand_data AS (

    SELECT
        p.brand_code,
        c.description AS brand_name,

        COUNT(DISTINCT p.po_id)::int AS total

    FROM all_po p

    LEFT JOIN mommcode c
      ON c.code = p.brand_code
     AND c.cat_group = 'BRAND'

  WHERE
    p.po_type = $3
    AND EXTRACT(MONTH FROM p.po_date) = $4
    AND p.brand_code IS NOT NULL

    AND (
        $5 = 'total'

        OR (
            $5 = '614'
            AND (
                p.create_id = 614
                OR p.create_id = 10
                OR p.create_id IS NULL
            )
        )

        OR (
            $5 <> 'total'
            AND $5 <> '614'
            AND p.create_id = $5::bigint
        )
    )

    GROUP BY
        p.brand_code,
        c.description

)
SELECT
    (
        SELECT json_agg(v ORDER BY total DESC, v_name)
        FROM vendor_data v
    ) AS vendorData,

    (
        SELECT json_agg(b ORDER BY total DESC, brand_name)
        FROM brand_data b
    ) AS brandData;
    `
    const vendorResult = await db.query(query, [ appDivisionId, appFinYear, poType, monthNo ,selectedChart]);

    // return res.status(200).json(vendorResult.rows);

 return res.status(200).json({
    vendorData: vendorResult.rows[0].vendordata || [],
    brandData: vendorResult.rows[0].branddata || [],
});

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error on purchase vendor list showing",
    });
  }
});

exports.handleVendorPurchaseMonthData = catchAsync(async (req, res) => {

  const { appDivisionId, appFinYear, poType, selectedChart, month, vCode } = req.query;

  try {
    const result = await db.query(
`WITH PO_DATA AS (

    ---------------- Authorized ----------------

    SELECT

        H.PO_ID,
        H.PO_NO,
        H.PO_DATE,
        H.PO_EFF_DT,
        H.DIVISION_ID,
        H.TRANS_YEAR,
        H.PO_TYPE,
        H.V_CODE,
        H.CREATE_ID,

        D.IT_CODE,
        D.PO_QTY_ORD

    FROM MHMMPO H

    JOIN MDMMPOIT D
        ON D.PO_ID = H.PO_ID
         
    WHERE COALESCE(H.CANCEL_FLAG, 'N') <> 'Y'

    UNION ALL

    ---------------- Unauthorized ----------------

    SELECT

        H.PO_ID,
        H.PO_NO,
        H.PO_DATE,
        H.PO_EFF_DT,
        H.DIVISION_ID,
        H.TRANS_YEAR,
        H.PO_TYPE,
        H.V_CODE,
        H.CREATE_ID,

        D.IT_CODE,
        D.PO_QTY_ORD

    FROM MHMMPOAMD H

    JOIN MDMMPOITAMD D
        ON D.PO_ID = H.PO_ID

      WHERE COALESCE(H.CANCEL_FLAG, 'N') <> 'Y'
),

RECEIVED AS (

    SELECT

        PO_ID,
        IT_CODE,
        SUM(QTY_RECD) AS QTY_RECD

    FROM TDMMRCT

    GROUP BY
        PO_ID,
        IT_CODE

)

SELECT

    P.PO_ID,
    P.PO_NO,
    P.PO_DATE,
    P.PO_EFF_DT,

    SUM(P.PO_QTY_ORD)::numeric AS order_qty,

    COALESCE(SUM(R.QTY_RECD),0)::numeric AS received_qty,

   ROUND(
    SUM(P.PO_QTY_ORD)
    -
    COALESCE(SUM(R.QTY_RECD::numeric),0),
    3
) AS pending_qty,

    CASE

        WHEN ROUND
        (
            SUM(P.PO_QTY_ORD)
            -
             COALESCE(SUM(R.QTY_RECD::numeric),0),
       3
        ) = 0

        THEN 0

        ELSE CURRENT_DATE - P.PO_EFF_DT

    END AS ageing

  --  CASE

  --      WHEN
  --      (
  --          SUM(P.PO_QTY_ORD)
  --          -
  --          COALESCE(SUM(R.QTY_RECD),0)
   --     ) = 0

   --     THEN 'Completed'

   --     ELSE 'Pending'

  --  END AS status

FROM PO_DATA P

LEFT JOIN RECEIVED R

ON R.PO_ID = P.PO_ID
AND R.IT_CODE = P.IT_CODE

WHERE

P.DIVISION_ID = $1
AND P.TRANS_YEAR = $2
AND P.PO_TYPE = $3
AND P.V_CODE = $4

AND EXTRACT(MONTH FROM P.PO_DATE)=

CASE $5

WHEN 'Jan' THEN 1
WHEN 'Feb' THEN 2
WHEN 'Mar' THEN 3
WHEN 'Apr' THEN 4
WHEN 'May' THEN 5
WHEN 'Jun' THEN 6
WHEN 'Jul' THEN 7
WHEN 'Aug' THEN 8
WHEN 'Sep' THEN 9
WHEN 'Oct' THEN 10
WHEN 'Nov' THEN 11
WHEN 'Dec' THEN 12

END

AND
(
    $6 = 'total'

    OR (
        $6 = '614'
        AND (
            P.CREATE_ID = 614
            OR P.CREATE_ID = 10
            OR P.CREATE_ID IS NULL
        )
    )

    OR (
        $6 <> 'total'
        AND $6 <> '614'
        AND P.CREATE_ID = $6::bigint
    )
)

GROUP BY

P.PO_ID,
P.PO_NO,
P.PO_DATE,
P.PO_EFF_DT

HAVING ROUND
(
    SUM(P.PO_QTY_ORD)
    -
   COALESCE(SUM(R.QTY_RECD::numeric),0),
         3
) > 0

ORDER BY
P.PO_NO,P.PO_DATE;`,
[
  appDivisionId,
  appFinYear,
  poType,
  vCode,
  month,
  selectedChart
]
    )

   const formattedData = result.rows.map((row) => ({
  ...row,
  po_eff_dt: row.po_eff_dt
    ? dateFormater(row.po_eff_dt)
    : null,
  po_date: row.po_date
    ? dateFormater(row.po_date)
    : null,
}));

return res.status(200).json(formattedData);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal server error on vendor PO summary",
    });

  }

});
