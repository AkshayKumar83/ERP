const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../../utility/query");

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const yearList = await db.query(
    `select to_char(st_date, 'dd/mm/yyyy') || ' - ' || to_char(end_date, 'dd/mm/yyyy') year_desc, year_code
from integral.moitfinyear
where year_code <= (select max(year_code)
                   from integral.moitfinyear
                   where flag = 'C') `
  );

  //console.log("year:", yearList.rows);

  return res.status(200).json({
    years: yearList.rows,
  });
});

exports.getYearData = catchAsync(async (req, res) => {
  const { formData } = req.body;
  //console.log("formData:", formData);

  try {
    const from_year = parseInt(formData.year_code);
    //console.log("from year:", from_year);

    const to_year = from_year + 1;
    //console.log("to_year:", to_year);

    // Exclude year_code and concatenate remaining fields
    const additionalParams = Object.keys(formData)
      .filter(key => key !== 'year_code')  // Exclude year_code
      .map(key => formData[key])            // Get values of remaining keys
      .join(',');

    console.log("additionalParams:", additionalParams);

    // Adjust the SQL query syntax to correctly call your procedure
    const result = await db.query(
      `CALL financial_year_closing_sub($1, $2, $3, $4)`,
      ['1', from_year, to_year, additionalParams]
    );

    res.status(200).json({
      success: true,
      message: "Procedure executed successfully.",
      data: result.rows || [],
    });
  } catch (error) {
    console.error("Error executing procedure:", error.message);

    // Handle specific "no rows" error gracefully
    if (error.message.includes('query returned no rows')) {
      return res.status(200).json({
        success: true,
        message: "Procedure executed successfully, but no data was returned.",
      });
    }

    // For other errors, return a failure response
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
});
