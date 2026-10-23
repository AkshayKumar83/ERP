
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { dateFormater } = require("../../../utility/constant");





exports.handleFormOperation = catchAsync(async (req, res) => {
  try {
    const { appDivisionId, appFinYear } = req.query;

    // ============================
    // Dashboard Cards
    // ============================

    const cardResult = await db.query(
      `
SELECT

                 -- Member Counts

    (SELECT COUNT(*)::int FROM moedmember ) AS "totalMembers",

    ( SELECT COUNT(*)::int FROM moedmember where member_status = 'P' ) AS "pendingMembers",

    ( SELECT COUNT(*)::int FROM moedmember where member_active = 'Y') AS "activeMembers",

    ( SELECT COUNT(*)::int FROM moedmember where member_active = 'N' ) AS "inactiveMembers",

                 -- Dealer Counts

 (SELECT COUNT(*)::int
 FROM moeddealer
) AS "totalDealers",

(SELECT COUNT(*)::int
 FROM moeddealer
 WHERE UPPER(TRIM(active)) IN ('Y', 'YES')
) AS "activeDealers",

(SELECT COUNT(*)::int
 FROM moeddealer
 WHERE active IS NULL
    OR UPPER(TRIM(active)) IN ('N', 'NO')
) AS "inactiveDealers"



      `
    );

    // ============================
    // Monthly Chart
    // ============================
// const chartResult = await db.query(
//     `
//     WITH months AS (

//     SELECT 4 AS month_no,'Apr' AS month
//     UNION ALL SELECT 5,'May'
//     UNION ALL SELECT 6,'Jun'
//     UNION ALL SELECT 7,'Jul'
//     UNION ALL SELECT 8,'Aug'
//     UNION ALL SELECT 9,'Sep'
//     UNION ALL SELECT 10,'Oct'
//     UNION ALL SELECT 11,'Nov'
//     UNION ALL SELECT 12,'Dec'
//     UNION ALL SELECT 1,'Jan'
//     UNION ALL SELECT 2,'Feb'
//     UNION ALL SELECT 3,'Mar'

// ),

// member_monthly AS (

//     SELECT

//         EXTRACT(MONTH FROM member_date)::int AS month_no,

//         COUNT(*)::int AS members

//     FROM moedmember

//     WHERE  EXTRACT(YEAR FROM member_date) = EXTRACT(YEAR FROM CURRENT_DATE)

//     GROUP BY EXTRACT(MONTH FROM member_date)

// ),

//     dealer_monthly AS (

//     SELECT

//     EXTRACT(
//     MONTH FROM

//       CASE
//         WHEN appointment_date ~ '^[0-9]+(\.[0-9]+)?$'
//         THEN (DATE '1899-12-30' + CAST(appointment_date::numeric AS int))::date

//         WHEN appointment_date ~ '^[0-9]{2}-[0-9]{2}-[0-9]{4}$'
//         THEN TO_DATE(appointment_date,'DD-MM-YYYY')

//         WHEN appointment_date ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
//         THEN TO_DATE(appointment_date,'DD/MM/YYYY')
//     END

//     )::int AS month_no,

//     COUNT(*)::int dealers
//     FROM moeddealer
//     WHERE appointment_date IS NOT NULL
//     GROUP BY 1
//     )

//     SELECT
//     m.month,
//     COALESCE(mm.members,0) AS members,
//     COALESCE(dm.dealers,0) AS dealers
//     FROM months m

//     LEFT JOIN member_monthly mm
//     ON m.month_no = mm.month_no

//     LEFT JOIN dealer_monthly dm
//     ON m.month_no = dm.month_no

//       WHERE
//       (
//           EXTRACT(MONTH FROM CURRENT_DATE) >= 4
//           AND m.month_no BETWEEN 4 AND EXTRACT(MONTH FROM CURRENT_DATE)
//       )
//       OR
//       (
//           EXTRACT(MONTH FROM CURRENT_DATE) < 4
//           AND (
//               m.month_no BETWEEN 4 AND 12
//               OR m.month_no BETWEEN 1 AND EXTRACT(MONTH FROM CURRENT_DATE)
//           )
//       )

// ORDER BY

// CASE

// WHEN m.month_no=4 THEN 1
// WHEN m.month_no=5 THEN 2
// WHEN m.month_no=6 THEN 3
// WHEN m.month_no=7 THEN 4
// WHEN m.month_no=8 THEN 5
// WHEN m.month_no=9 THEN 6
// WHEN m.month_no=10 THEN 7
// WHEN m.month_no=11 THEN 8
// WHEN m.month_no=12 THEN 9
// WHEN m.month_no=1 THEN 10
// WHEN m.month_no=2 THEN 11
// WHEN m.month_no=3 THEN 12

// END
// `
// )


const memberDivisionResult = await db.query(
  `SELECT

UPPER(division) category,

COUNT(*) FILTER(WHERE member_active='Y') active,

COUNT(*) FILTER(WHERE member_active='N') inactive

FROM moedmember

WHERE
    division IS NOT NULL
    AND UPPER(LEFT(TRIM(division), 1)) BETWEEN 'A' AND 'Z'

GROUP BY UPPER(division)
ORDER BY category;
`
)

const dealerTypeResult = await db.query(
  `SELECT

    UPPER(dlr_type) AS category,

    COUNT(*) FILTER (WHERE active = 'Y') AS active,

    COUNT(*) FILTER (WHERE active = 'N') AS inactive

FROM moeddealer

WHERE
    dlr_type IS NOT NULL
    AND UPPER(LEFT(TRIM(dlr_type), 1)) BETWEEN 'A' AND 'Z'

GROUP BY UPPER(dlr_type)

ORDER BY category;

  `
)

const loanTypeResult = await db.query(`
  SELECT
        l.loan_id,
        l.loan_purpose_desc,
        COUNT(DISTINCT t.efa_id) AS member_count
    FROM mhedloan l
    LEFT JOIN thlnefatran t
        ON t.loan_id = l.loan_id
    GROUP BY
        l.loan_id,
        l.loan_purpose_desc
    ORDER BY l.loan_id desc
  `)

    return res.status(200).json({
      ...cardResult.rows[0],
      //  monthlyChart: chartResult.rows,
       memberDivisionChart: memberDivisionResult.rows,
        dealerTypeChart: dealerTypeResult.rows,
        loanTypeChart: loanTypeResult.rows
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error on member dashboard data",
    });
  }
});


exports.handleLoanMemberOperation = catchAsync(async (req, res) => {
  try {
    const { loan_id } = req.query;

    if (!loan_id) {
      return res.status(400).json({
        success: false,
        message: "Loan Id is required",
      });
    }

    const query = `
      SELECT
          ROW_NUMBER() OVER(ORDER BY t.efa_application_date DESC) AS srl_no,
          m.dlr_name AS member_name,
          t.efa_application_date AS loan_date,
          t.efa_amount AS loan_amount,
          t.no_of_install
      FROM thlnefatran t
      INNER JOIN moedmember m
          ON m.member_id = t.member_id
      WHERE t.loan_id = $1
      ORDER BY t.efa_application_date DESC
    `;

    const result = await db.query(query, [loan_id]);

    const formattedData = result.rows.map((row) => ({
      ...row,
      loan_date: row.loan_date
        ? dateFormater(row.loan_date)
        : null,

      loan_amount: row.loan_amount
        ? Number(row.loan_amount).toLocaleString("en-IN")
        : "0",
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching loan member details:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch loan member details.",
      error: error.message,
    });
  }
});