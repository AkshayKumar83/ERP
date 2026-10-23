const { db } = require("../../config/dbConnection");
const catchAsync = require("../../utility/catchAsync");

exports.checkDateFinYear = catchAsync(async (req, res) => {
  try {
    const { date: currentDate, trans_year: transYear } = req.query;

    console.log("Received params:", { currentDate, transYear });

    if (!currentDate || !transYear) {
      return res.status(400).json({
        type: "error",
        message: "Missing 'currentDate' or 'transYear' in query params.",
        isDateInFinYr: "N", // <=== Match key name
      });
    }

    const checkdate = await db.query(
      `SELECT checkdateinfinyear($1, $2) AS isDateInFinYear`,
      [transYear, currentDate]
    );

    console.log("DB result:", checkdate.rows[0]);

    const result = checkdate?.rows?.[0]?.isdateinfinyear;

    if (result !== "Y") {
      return res.status(400).json({
        type: "error",
        message: result || "Date not falling within the financial year",
        isDateInFinYr: "N",
      });
    }

    res.status(200).json({
      type: "success",
      isDateInFinYr: result, // key name is consistent
    });

  } catch (err) {
    console.error("Error in checkDateFinYear:", err);
    return res.status(500).json({
      type: "error",
      message: err.message || "Internal server error during financial year check.",
      isDateInFinYr: "N",
    });
  }
});

