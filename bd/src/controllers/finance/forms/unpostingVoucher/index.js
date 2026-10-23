const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater, dateFormate } = require("../../../../utility/constant");

const {
  generateSingleInsertQuery,
  generateInsertQuery,
  buildSearchQuery,
  convertStringsToBooleans,
  cleanObject,
} = require("../../../../utility/query");

 const TABLE_NAMES = {
  THFMINWARDGST: "integral.thfminwardgst",
  TDFMINWARDGST: "integral.tdfminwardgst",
};

// for dropdown data

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const CurrentYearList = await db.query(
    `	SELECT 
  TO_CHAR(st_date, 'DD-MM-YYYY') || ' - ' || TO_CHAR(end_date, 'DD-MM-YYYY') AS date_range,
  year_code
FROM moitfinyear
ORDER BY year_code; `
  );

  const SectionList =
    await db.query(`select section_desc, section_prefix from moitsection
order by 1 `);

  return res.status(200).json({
    currentYear: CurrentYearList.rows,
    section: SectionList.rows,
  });
});

exports.postUnpostedData = catchAsync(async (req, res, next) => {
  try {
    const { formData, divisionId, transYear } = req.body;
    const { voucher_no, vch_type, section } = formData; 
    console.log(voucher_no, divisionId, transYear, vch_type)

    const finalResult = await db.query(
      `select posted, voucher_id 
       from thfmtran
       where voucher_no = $1
         and division_id = $2
         and trans_year  = $3
         and substr($1, 1, 1) = substr($4, 1, 1);`,
      [voucher_no, divisionId, transYear, vch_type]
    );
    
    console.log("finalResult", finalResult.rows)
    //  and substr($4, 1, 1) = 'G'
    if (finalResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found.",
      });
    }

    const { posted, voucher_id } = finalResult.rows[0];

    if (posted === "N") {
      return res.status(200).json({
        success: false,
        message: "Voucher has already been unposted.",
      });
    }

    // Optional: Prevent unposting if used in payment
    const result1 = await db.query(
      `select 'Y' from thfmpayrcv where voucher_id = $1`,
      [voucher_id]
    );

    if (result1.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: "This Voucher Have already Adjusted, So can not Unauthorised",
      });
    }

    await db.query(
      `update thfmtran
       set posted = 'N'
       where voucher_no = $1
         and division_id = $2
         and trans_year  = $3
         and substr($4, 1, 1) = 'G'
         and substr($1, 1, 1) = substr($5, 1, 1);`,
      [voucher_no, divisionId, transYear, section, vch_type]
    );

    return res.status(200).json({
      success: true,
      message: "Voucher No. has been Unposted.",
    });
  } catch (error) {
    console.error("Error in postUnpostedData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

const helpListData = async (req, res) => {
  let {
    appDivisionId,
    appFinYear,
    trans_year,
    appUserId,
    //form_status,
    help_list,
    vch_type,
    section,
  } = req?.query;

  if (help_list === "voucher") {
    const voucherDtl = await db.query(
//       `select * from thfmtran
// where substr(voucher_no, 2, 1) = substr($1, 1, 1)
// -- and 
// -- substr(voucher_no, 1, 1) = substr('S', 1, 1)
// and posted = 'Y'
// and division_id = $2
// order by voucher_no    `,

    `SELECT *
    FROM thfmtran
    WHERE
    (
          ($1 = 'P' AND trans_type IN ('P1','P4'))
      OR ($1 = 'B' AND trans_type IN ('B1','B2'))
      OR ($1 NOT IN ('P','B') AND trans_type = $1)
    )
    AND posted = 'Y'
    AND cancel != 'Y'
    AND division_id = $2
    And trans_year = $3
    ORDER BY voucher_no `,

      [vch_type, appDivisionId,trans_year]
    );

    return res.status(200).json(voucherDtl.rows);
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  // if (req?.query?.get_data) {
  //   await getDataOnQuery(req, res);
  //   return;
  //   //   if (["Query", "Search"].includes(req?.query?.formStatus)) {
  //   //     await getDataOnQuery(req, res);
  //   //     return;
  // }
});
