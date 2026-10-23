const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

// const getDataOnQuery = async (req, res) => {
//   try {
//     const { report_type } = req.query; 

//     let query = "SELECT * FROM moedmember";
//     let values = [];

//     if (report_type === "M") {
//       query += " WHERE member_active = $1";
//       values.push("Y"); 
//     }else if(report_type === "N"){
//        query += " WHERE member_active = $1";
//       values.push("N"); 
//     }

//     const getData = await db.query(query, values);

//     res.status(200).json(getData.rows);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Error" });
//   }
// };

     // new logic for reports
  // exports.handleFormOperation = catchAsync(async (req, res, next) => {
  //   try {
  //     const { dlr_name, from_date, to_date } = req.query;

  //     // if (!dlr_name) {
  //     //   return res.status(400).json({
  //     //     success: false,
  //     //     message: "Dealer name is required",
  //     //   });
  //     // }

  //     let query = `SELECT * FROM VW_LOAN_EMI_VS_PAID`;
  //     const params = [];
  //     const conditions = [];
    
  //      // condition 1 : Dealer Name
  //      if(dlr_name){
  //       params.push(dlr_name);
  //       conditions.push(`dlr_name = $${params.length} `);
  //   }

  //    // condition 2 :Dates Range
  //    if(from_date && to_date){
  //     params.push(from_date,to_date);
  //     conditions.push(`emi_date BETWEEN $${params.length - 1 } AND $${params.length}`);
  //    }

  //    // ANd where clause if any condtion exist
  //  if(conditions.length > 0){
  //   query += ` WHERE ` + conditions.join(" AND ")
  //   }

  //   query += ` ORDER by emi_sno`

  //     const result = await db.query(query,params);
  //     // Extract column names from the result metadata
  //     const columns = result.fields.map(f => f.name);

  //     return res.status(200).json({
  //       success: true,
  //       data: result.rows,
  //       columns: columns,
  //     });

  //   } catch (error) {
  //     console.error("handlePostFormData error:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //       error: error.message,
  //     });
  //   }
  // });



exports.handleFormOperation = catchAsync(async (req, res) => {
  try {
    const { member_id, efa_id, from_date, to_date } = req.query;

    /* =====================================================
       1. EMI VS PAID VIEW (for receipts & charts)
    ====================================================== */
    let viewQuery = `SELECT * FROM VW_LOAN_EMI_VS_PAID`;
    const params = [];
    const conditions = [];

    if (member_id) {
      params.push(member_id);
      conditions.push(`member_id = $${params.length}`);
    }

    if (efa_id) {
      params.push(efa_id);
      conditions.push(`efa_id = $${params.length}`);
    }

    if (from_date && to_date) {
      params.push(from_date, to_date);
      conditions.push(
        `emi_date BETWEEN $${params.length - 1} AND $${params.length}`
      );
    }

    if (conditions.length) {
      viewQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    viewQuery += ` ORDER BY emi_sno`;

    const viewResult = await db.query(viewQuery, params);

    if (!viewResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No EMI data found",
      });
    }

    /* =====================================================
       2. LOAN MASTER (Total EMFA Amount)
    ====================================================== */
    const loanHeader = await db.query(
      `
      SELECT efa_ctrl_id, efa_amount
      FROM thlnefatran
      WHERE efa_id = $1
      `,
      [efa_id]
    );

    const efaCtrlId = loanHeader.rows[0]?.efa_ctrl_id || "";
    const totalEmfaAmount = Number(loanHeader.rows[0]?.efa_amount || 0);

    /* =====================================================
       3. EMI SCHEDULE (Total EMI Due Amount)
    ====================================================== */
    const emiSchedule = await db.query(
      `
      SELECT
        COALESCE(SUM(
          principal_amt
        + service_chg_ded
        + interest_amt
        + igst_amt
        + cgst_amt
        + sgst_amt
        ), 0) AS total_emi_due,
        COUNT(*) AS total_emi
      FROM tdlnefatran
      WHERE efa_id = $1
      `,
      [efa_id]
    );

    const totalEmiDueAmount = Number(emiSchedule.rows[0].total_emi_due);
    const totalEmiActual = Number(emiSchedule.rows[0].total_emi);

    /* =====================================================
   3A. EMI BREAKDOWN (Schedule based, Date-safe)
====================================================== */
const emiBreakdownRes = await db.query(
  `
  SELECT
    COALESCE(SUM(principal_amt), 0) AS principal_due,
    COALESCE(SUM(service_chg_ded), 0) AS service_due,
    COALESCE(SUM(interest_amt), 0) AS interest_due,
    COALESCE(SUM(igst_amt), 0) AS igst_due,
    COALESCE(SUM(cgst_amt), 0) AS cgst_due,
    COALESCE(SUM(sgst_amt), 0) AS sgst_due
  FROM tdlnefatran
  WHERE efa_id = $1
    AND ($2::date IS NULL OR emi_date >= $2::date)
    AND ($3::date IS NULL OR emi_date <= $3::date)
  `,
  [
    efa_id,
    from_date ? from_date : null,
    to_date ? to_date : null
  ]
);


const emiBreakdown = {
  principal: Number(emiBreakdownRes.rows[0].principal_due),
  service: Number(emiBreakdownRes.rows[0].service_due),
  interest: Number(emiBreakdownRes.rows[0].interest_due),
  igst: Number(emiBreakdownRes.rows[0].igst_due),
  cgst: Number(emiBreakdownRes.rows[0].cgst_due),
  sgst: Number(emiBreakdownRes.rows[0].sgst_due),
};


    /* =====================================================
       4. MEMBER / DEALER INFO
    ====================================================== */
    const memberIds = [...new Set(viewResult.rows.map(r => r.member_id))];
    let memberMap = {};

    if (memberIds.length) {
      const memberRes = await db.query(
        `
        SELECT member_id, member_no, division, dealer_code,
               dlr_active, member_active
        FROM moedmember
        WHERE member_id = ANY($1)
        `,
        [memberIds]
      );

      memberMap = memberRes.rows.reduce((acc, r) => {
        acc[r.member_id] = r;
        return acc;
      }, {});
    }

    const enrichedRows = viewResult.rows.map(r => ({
      ...r,
      member_no: memberMap[r.member_id]?.member_no || "",
      division: memberMap[r.member_id]?.division || "",
      dealer_code: memberMap[r.member_id]?.dealer_code || "",
      dlr_active: memberMap[r.member_id]?.dlr_active ?? null,
      member_active: memberMap[r.member_id]?.member_active ?? null,
    }));

    /* =====================================================
       5. RESPONSE
    ====================================================== */
    res.json({
      success: true,
      data: enrichedRows,
      efaCtrlId,
      totalEmfaAmount,       //  Loan principal
      totalEmiDueAmount,     // EMI schedule total (principal + charges + GST)
      totalEmiActual,        // total EMI count
      emiBreakdown,
      columns: viewResult.fields.map(f => f.name),
    });

  } catch (err) {
    console.error("handleFormOperation error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});





     

  // old logic or reports
// exports.handleFormOperation = catchAsync(async (req, res, next) => {
//   try {
//     const { dlr_name, from_date, to_date } = req.query;

//     let query = `SELECT * FROM VW_LOAN_EMI_VS_PAID`;
//     const params = [];
//     const conditions = [];

//     //  Condition 1: Member ID 
//     if (dlr_name) {
//       params.push(dlr_name);
//       conditions.push(`dlr_name = $${params.length}`);
//     }

//     //  Condition 2: Date range 
//     if (from_date && to_date) {
//       params.push(from_date, to_date);
//       conditions.push(`emi_date BETWEEN $${params.length - 1} AND $${params.length}`);
//     }

//     // Combine all conditions dynamically
//     if (conditions.length > 0) {
//       query += ` WHERE ` + conditions.join(" AND ");
//     }

//     query += ` ORDER BY emi_sno`;

//     // console.log(" Executing Query:", query, params);

//     const emfaResult = await db.query(query, params);

//     if (emfaResult.rows.length === 0) {
//       return res.status(404).json({ message: "No records found" });
//     }

//     res.status(200).json(emfaResult.rows);
//   } catch (error) {
//     console.error("getDataEmfa error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });






// dropDownData
exports.getBaseConstants = catchAsync(async (req, res, next) => {
  const { member_id } = req.query; // <-- GET request se member_id lo

  const getDlrName = await db.query(
    `select distinct member_id, dlr_name 
     from VW_LOAN_EMI_VS_PAID 
     order by dlr_name`
  );

  let getLoanName = { rows: [] };

  if (member_id) {
    getLoanName = await db.query(
      `select efa_id, efa_ctrl_id 
       from thlnefatran 
       where member_id = $1`,
      [member_id]
    );
  }

  return res.status(200).json({
    dlrNameList: getDlrName.rows,
    loanNameList: getLoanName.rows
  });
});
