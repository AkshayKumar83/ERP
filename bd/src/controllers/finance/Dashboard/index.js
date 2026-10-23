
const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync")





exports.handleFormOperation = catchAsync(async (req, res) => {
  try {
    const { appDivisionId, appFinYear } = req.query;

    // 1. Temp table refresh
    // await db.query(`CALL GEN_DYNAMIC_DLR_CREDIOR_TABLE()`);

    // 2. L se start hone wale columns
    const columnResult = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'temp_dynamic_report'
        AND column_name LIKE 'L%'
      ORDER BY ordinal_position
    `);

    const columns = columnResult.rows.map((r) => r.column_name);

    if (!columns.length) {
      return res.status(200).json({
        financeAccounts: [],
      });
    }

    // 3. Dynamic SUM query
    const sumQuery = `
      SELECT
      ${columns
        .map((col) => `SUM("${col}") AS "${col}"`)
        .join(",\n")}
      FROM temp_dynamic_report
    `;

    const sumResult = await db.query(sumQuery);

   const financeAccounts = columns.map((col) => ({
  accountCode: col.match(/^L\d+/)?.[0] || "",
  accountName: col
    .replace(/^L\d+/, "")
    .replace(/_/g, " ")
    .trim(),
  total: Number(sumResult.rows[0][col] || 0),
}));

const stackedBarResult = await db.query(`
    select mth, acc_desc,  sum(amt) from (
	select  t.acc_no, m.acc_desc,  to_char(vch_dt, 'YYYY/MM') as mth, sum(
case db_cr
when 'C' then amount * -1
when 'D' then amount
end
	) amt
	from tdfmtran t, mhfmglm m
	where tran_type like 'B%'
	and tran_year = '2026'
	and exists(select 1 from tdfmtran t1 where t1.voucher_id = t.voucher_id and flag = 'Y' and acc_no in (select acc_no from mhfmbank) and db_cr = 'D')
	and pur_code is not null
	and t.acc_no =m.acc_no
	group by t.acc_no, m.acc_desc, vch_dt
	)x
	group by mth, acc_desc`)

    return res.status(200).json({
    //    financeAccounts,
    stackedBar:stackedBarResult.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error on finance dashboard data",
    });
  }
});


