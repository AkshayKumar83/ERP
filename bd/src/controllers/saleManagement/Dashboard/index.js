
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");





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

    (SELECT COUNT(*)::int FROM MOSMCUST_MASTER ) AS "totalCustomers",

    ( SELECT COUNT(*)::int FROM MOSMCUST_MASTER where active = 'Y') AS "activeCustomers",

    ( SELECT COUNT(*)::int FROM MOSMCUST_MASTER where active = 'N' ) AS "inactiveCustomers"



      `
    );

    // ============================
    // Monthly Chart
    // ============================
// const chartResult = await db.query(
// ``
// )


    return res.status(200).json({
      ...cardResult.rows[0],
    //    monthlyChart: chartResult.rows,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error on member dashboard data",
    });
  }
});