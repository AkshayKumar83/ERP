const { db } = require("../../../../../config/dbConnection");
const catchAsync = require("../../../../../utility/catchAsync");

const { dateFormater } = require("../../../../../utility/constant");

const TABLE_NAMES = {
  LOAN_REPAY_HDR: "thlnefatran",
  LOAN_REPAY_DTL: "tdlnefatran",
  LOAN_RECEIPT_DTL: "tolnemi_receipts",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  console.log(req?.query?.member_id);
  let loanList = [];

  if (req?.query?.formStatus && req?.query?.formStatus == "Query") {
    loanList = await db.query(`SELECT efa_id, efa_ctrl_id FROM thlnefatran`);
    console.log("loanList::", loanList);
  } else {
    loanList = await db.query(
      `SELECT efa_id, efa_ctrl_id FROM thlnefatran WHERE member_id = $1`,
      [req?.query?.member_id]
    );
  }

  console.log(loanList.rows);

  return res.status(200).json({
    loanList: loanList.rows,
  });
});

exports.updateVehicalInfo = catchAsync(async (req, res, next) => {
  const { efa_id, member_id, member_no, dlr_name, ...formData } = req.body;

  try {
    await db.query("begin");
    const columns = Object.keys(formData);
    const values = Object.values(formData);

    const setClause = columns
      .map((column, index) => `${column} = $${index + 1}`)
      .join(", ");

    const query = `UPDATE ${
      TABLE_NAMES.LOAN_REPAY_HDR
    } SET ${setClause} WHERE member_id = $${columns.length + 1} and efa_id = $${
      columns.length + 2
    }`;

    await db.query(query, [...values, member_id, efa_id]);

    await db.query("commit");
    res
      .status(200)
      .json({ type: "success", message: "Data Saved Successfully" });
  } catch (error) {
    console.error(`Error : `, error);
    await db.query("ROLLBACK");
    return res
      .status(400)
      .json({ type: "error", message: `Some error occurred ${error.message}` });
  }
});
