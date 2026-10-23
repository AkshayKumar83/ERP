const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");


exports.handlePostFormData = catchAsync(async (req, res, next) => {
  try {
    const { from_date, to_date } = req.body;

    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: "from_date and to_date are required",
      });
    } 

  const query = `
SELECT
    h.c_code                as "Customer Code",
    c.c_name                as "Customer Name",
    CONCAT_WS(', ', c.c_add1, c.c_add2, c.c_add3) AS "Address",
    c.c_state               as "State",
    c.telephone2            as "Contact No.",
    c.gst_no                as "GST No",
    h.inv_no                as "Invoice No",
    h.return_no             as "Return No",
    h.return_dt             as return_date,
 -- h.sale_ac_head          as "Cr Acc",
    sale.acc_desc           AS "Cr Acc",
--  h.debit_acc_code        as "Db Acc",
    debit.acc_desc          AS "Db Acc",
    d.it_code               as "Item Code",
    mo.it_name              as "Item Name",
    mo.hsn_sac_code         as "HSN/SAC Code",
    d.return_qty            as "Return Qty.",
    d.rate                  as "Rate",
    h.t_igst_val            as "IGST Value",
    h.t_cgst_val            as "CGST Value",
    h.t_sgst_val            as "SGST Value",
    h.t_basic_val           as "Basic Value",
    h.t_net_val             as "Net Value",
    h.auth_flag             as "Auth Flag"


    FROM mhsminv_return h
    INNER JOIN mdsminv_return d

    ON h.return_id = d.return_id
    LEFT JOIN MOSMCUST_MASTER c
    ON h.c_code = c.c_code

    LEFT JOIN mommitem mo
    ON d.it_code = mo.it_code

    LEFT JOIN mhfmglm sale
    ON h.sale_ac_head = sale.acc_no

    LEFT JOIN mhfmglm debit
    ON h.debit_acc_code = debit.acc_no

    WHERE h.return_dt BETWEEN $1 AND $2

    ORDER BY h.return_id, d.it_code;
`;

const params = [from_date, to_date];

const result = await db.query(query, params);

    const formattedRows = result.rows.map(row => ({
  ...row,
  "return_dt": dateFormater(row["return_dt"])
}));

    //  MAIN CHANGE: extract columns from the query result itself
    const columns = result.fields.map(f => f.name);

    return res.status(200).json({
      success: true,
      // data: result.rows,
       data: formattedRows,
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