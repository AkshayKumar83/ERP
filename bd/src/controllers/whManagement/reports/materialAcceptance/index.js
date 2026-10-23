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

  if (help_list === "store") {
     const storeList = await db.query(
      `  select a.description, a.wc_no,a.wc_id
            from vwWorkCenterStore a
            where a.division_id= $1
            order by 1 `,
      [divisionId]
    );
    return res.status(200).send(storeList.rows);
 
  }
};

     // Validate WC No
  exports.validateStore = async (req, res) => {
    try {
      const { wc_no } = req.query;

      if (!wc_no) {
        return res.status(400).json({
          success: false,
          message: "WC No is required",
        });
      }

      const result = await db.query(
        `SELECT 1 
        FROM mommwc 
        WHERE wc_no = $1 
          AND store_process = 'S'`,
        [wc_no]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Store does not exist",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Store is valid",
      });

    } catch (error) {
      console.error("Store validation error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
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
    const { wc_id, trans_year, from_date, to_date } = req.body;

    if (!wc_id || !trans_year || !from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: "wc_id,trans_year, from_date and to_date are required",
      });
    } 

    const query = `
      SELECT 
       ROW_NUMBER() OVER (ORDER BY h.v_code, d.mrir_no) AS "S No.",
        h.v_code      as  "Vendor Code",
        v.v_name   as  "Vendor Name",
        d.it_code     as "Item Code",
        i.it_name as "Item Name",
        d.mrir_no,
        d.mrir_date,
        h.chln_no,
        h.chln_date,
        d.qty_recd,
        d.qty_accptd,
        d.status_flg,
        d.dev_no,
        d.dev_qty,
        d.under_seg,
        d.under_dc,
        d.it_pu_um,
        d.qty_ets,
        d.clear_dt
      FROM thmmrct h
      JOIN tdmmrct d ON h.ge_id = d.ge_id
      JOIN mommitem i ON d.it_code = i.it_code
      JOIN mommstok s ON d.it_code = s.it_code
      LEFT JOIN mommvend v ON h.v_code = v.v_code   --  Vendor name added
      WHERE d.status_flg NOT IN ('I', 'G')
        AND d.clear_dt BETWEEN COALESCE($1, d.clear_dt) 
                           AND COALESCE($2, d.clear_dt)
        AND s.wc_id = $3
        AND s.default_store = 'Y'
      ORDER BY h.v_code, d.mrir_no;
    `;

    const params = [from_date, to_date, wc_id];

    const result = await db.query(query, params);

    const formattedRows = result.rows.map(row => ({
  ...row,
  "clear_dt": dateFormater(row["clear_dt"])
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
