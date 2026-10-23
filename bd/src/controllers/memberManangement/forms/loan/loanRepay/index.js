const { db } = require("../../../../../config/dbConnection");
const catchAsync = require("../../../../../utility/catchAsync");
const { dateFormater } = require("../../../../../utility/constant");

const TABLE_NAMES = {
  LOAN_REPAY_HDR: "thlnefatran",
  LOAN_REPAY_DTL: "tdlnefatran",
  LOAN_RECEIPT_DTL: "tolnemi_receipts",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const bankList = await db.query(
    `SELECT acc_no as bank_cd,bank_name FROM mhfmbank where division_id = $1`,
    [req?.query?.division_id],
  );

  console.log(req?.query?.member_id);
  let loanList = [];

  if (req?.query?.formStatus && req?.query?.formStatus == "Query") {
    loanList = await db.query(`SELECT efa_id, efa_ctrl_id FROM thlnefatran`);
    console.log("loanList::", loanList);
  } else {
    loanList = await db.query(
     `SELECT efa_id, efa_ctrl_id || ' -- ' || efa_application_date as efa_ctrl_id FROM thlnefatran WHERE member_id = $1`,
      [req?.query?.member_id],
    );
  }

  console.log(loanList.rows);

  const loanPurposeList = await db.query(
    `SELECT m.loan_id, loan_purpose_desc FROM mhedloan m, 
        thlnefatran t where efa_id = $1 and m.loan_id = t.loan_id order by loan_id`,
    [req?.query?.efa_id],
  );

  return res.status(200).json({
    loanPurpose: loanPurposeList.rows,
    loanList: loanList.rows,
    bankList: bankList.rows,
  });
});

exports.calculateBalAmt = catchAsync(async (req, res, next) => {
  const { efa_id } = req.query;
  console.log(req.query, "comes inside the console");
  console.log(efa_id);

  try {
    if (!efa_id) {
      throw new Error("EFA ID is not selected");
    }

    const getPreCloserData = await db.query(
      `SELECT pre_close_efa, pre_close_emi_sno FROM thlnefatran WHERE efa_id = $1`,
      [Number(efa_id)],
    );
    console.log(getPreCloserData.rows);

    if (getPreCloserData.rowCount === 0) {
      throw new Error("No Preclosed data found");
    }

    const { pre_close_efa, pre_close_emi_sno } = getPreCloserData.rows[0];

    const getBal = await db.query(
      `SELECT get_curr_loan_bal($1, $2, $3) AS loan_bal`,
      [Number(efa_id), pre_close_efa, pre_close_emi_sno],
    );

    console.log(getBal.rows[0]?.loan_bal);

    return res.status(200).json({
      type: true,
      loan_balance: getBal.rows[0]?.loan_bal || 0,
      pre_close_efa,
    });
  } catch (error) {
    console.error("Error in calculateBalAmt:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
});

exports.getLoanReceiptNo = catchAsync(async (req, res, next) => {
  try {
    const getLoanReceiptNo = await db.query(
      `SELECT nextval('temp_efa_ln_no') AS nextfarno`,
    );
    return res.status(200).json({
      type: "success",
      newLrNo: `~FAR/${getLoanReceiptNo?.rows[0]?.nextfarno}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});

// const getDataOnQuery = async (req, res) => {
//   try {
//     let whereClauses = [];
//     let values = [];
//     const searchKeys = ["member_id", "receipt_date", "receipt_number"];

//     // Secure dynamic WHERE clause with parameterized values
//     // searchKeys.forEach((key) => {
//     //   if (req.query[key]) {
//     //     values.push(req.query[key]);
//     //     whereClauses.push(`${key} = $${values.length}`);
//     //   }
//     // });

//     for (const key of searchKeys) {
//       if (req.query[key] !== undefined && req.query[key] !== "") {
//         whereClauses.push(`${key} = '${req.query[key]}'`);
//       }
//     }

    

//     const whereCondition =
//       whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     let dataCount = 0;
//     let queryOrder = "";
//     let countQuery = "";
//     let countParams = values;

//     if (whereClauses.length > 0) {
//       countQuery = `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL} ${whereCondition}`;
//       const countResult = await db.query(countQuery, countParams);
//       dataCount = countResult.rows[0]?.count;
//       queryOrder = `${whereCondition} ORDER BY receipt_number`;
//     } else {
//       switch (req?.query?.get_data) {
//         case "Query":
//         case "First": {
//           const countResult = await db.query(
//             `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL}`,
//           );
//           dataCount = countResult.rows[0]?.count;
//           queryOrder = `ORDER BY receipt_number`;
//           break;
//         }
//         case "Last":
//           queryOrder = `ORDER BY receipt_number DESC LIMIT 1`;
//           break;
//         default:
//           queryOrder = `ORDER BY receipt_number LIMIT 1 OFFSET ${
//             req.query.offset || 0
//           }`;
//       }
//     }

//     // Get distinct receipt number for this query
//     const getDistinctLoanReceipt = await db.query(
//       `SELECT DISTINCT receipt_number FROM tolnemi_receipts ${queryOrder}`,
//     );

//     const receiptNo = getDistinctLoanReceipt.rows[0]?.receipt_number;

//     if (!receiptNo) {
//       return res.status(200).send({
//         message: "No receipt number found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     // Fetch receipt detail rows
//     const receiptDtlData = await db.query(
//       `SELECT * FROM tolnemi_receipts WHERE receipt_number = $1`,
//       [receiptNo],
//     );

//     if (!receiptDtlData.rows.length) {
//       return res.status(200).send({
//         message: "No EFA Receipt data found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     // Initialize form header from first record
//     let receiptHdrData = {
//       ...receiptDtlData.rows[0],
//       amount_recd: 0,
//     };

//     // Prepare EMI detail data
//     const loanRecptEmiDtlData = await Promise.all(
//       receiptDtlData.rows.map(async (item) => {
//         const loanHdrData = await db.query(
//           `SELECT * FROM thlnefatran WHERE efa_id = $1`,
//           [item.efa_id],
//         );
//         const loanHdr = loanHdrData.rows[0];

//         if (loanHdr?.member_id) {
//           const partyResult = await db.query(
//             `SELECT dlr_name, member_no, member_id FROM moedmember WHERE member_id = $1`,
//             [loanHdr.member_id],
//           );
//           const party = partyResult.rows[0];
//           if (party) {
//             item.party_name = party.dlr_name;
//             item.member_no = party.member_no;
//             item.member_id = party.member_id;

//             receiptHdrData.party_name = party.dlr_name;
//             receiptHdrData.member_no = party.member_no;
//             receiptHdrData.member_id = party.member_id;
//           }
//         }

//         item.efa_ctrl_id = loanHdr?.efa_ctrl_id;

//         const bankResult = await db.query(
//           `SELECT bank_name FROM mhfmbank WHERE acc_no = $1`,
//           [item.bank_acc_no],
//         );
//         if (bankResult?.rowCount) {
//           item.bank_name = bankResult.rows[0].bank_name;
//           receiptHdrData.bank_name = bankResult.rows[0].bank_name;
//         }

//         // Format dates
//         item.receipt_date = dateFormater(item?.receipt_date);
//         item.instrument_date = dateFormater(item?.instrument_date);

//         // Set formatted date on header once
//         receiptHdrData.receipt_date = item.receipt_date;
//         receiptHdrData.instrument_date = item.instrument_date;

//         // Accumulate amount
//         receiptHdrData.amount_recd += Number(item.amount_recd || 0);

//         return item;
//       }),
//     );

//     return res.send({
//       type: "found",
//       formHdrData: receiptHdrData,
//       formDtlData: [],
//       repayDtlData: loanRecptEmiDtlData,
//       count: dataCount || 0,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       message: error.message || "Internal server error on query",
//     });
//   }
// };


// const getDataOnQuery = async (req, res) => {
//   try {
//     let whereClauses = [];
//     let values = [];
//     const searchKeys = ["receipt_date", "receipt_number"];

//     // Secure dynamic WHERE clause with parameterized values
//     // searchKeys.forEach((key) => {
//     //   if (req.query[key]) {
//     //     values.push(req.query[key]);
//     //     whereClauses.push(`${key} = $${values.length}`);
//     //   }
//     // });

//           // comment by akshay  27-03-26 

//     // for (const key of searchKeys) {  
//     //   if (req.query[key] !== undefined && req.query[key] !== "") {
//     //     whereClauses.push(`${key} = '${req.query[key]}'`);
//     //   }
//     // }
        
//     // below logic write by akshay
//     for (const key of searchKeys) {
//   const value = req.query[key];

//   if (value !== undefined && value !== "") {

//     //  Special case: only date search
//     if (
//       key === "receipt_number" &&
//       value === "FAR/" &&
//       req.query.receipt_date 
//     ) {
//       continue; // ignore receipt_number
//     }

//     whereClauses.push(`${key} = '${value}'`);
//   }
// }

//     const whereCondition =
//       whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     let dataCount = 0;
//     let queryOrder = "";
//     let countQuery = "";
//     let countParams = values;

//     if (whereClauses.length > 0) {
//       countQuery = `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL} ${whereCondition}`;

//       const countResult = await db.query(countQuery, countParams);
//       dataCount = countResult.rows[0]?.count;

//       // queryOrder = `${whereCondition} ORDER BY receipt_number`;  // comment by akshay for in search time offset missing
//         queryOrder = `${whereCondition} 
//                 ORDER BY receipt_number 
//                 LIMIT 1 OFFSET ${req.query.offset || 0}`;

//     } else {
//       switch (req?.query?.get_data) {
//         case "Query":
//         case "First": {
//           const countResult = await db.query(
//             `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL}`,
//           );
//           dataCount = countResult.rows[0]?.count;
//           queryOrder = `ORDER BY receipt_number`;
//           break;
//         }
//         case "Last":
//           queryOrder = `ORDER BY receipt_number DESC LIMIT 1`;
//           break;
//         default:
//           queryOrder = `ORDER BY receipt_number LIMIT 1 OFFSET ${
//             req.query.offset || 0
//           }`;
//       }
//     }

//     // Get distinct receipt number for this query
//     const getDistinctLoanReceipt = await db.query(
//       `SELECT DISTINCT receipt_number FROM tolnemi_receipts ${queryOrder}`,
//     );

//     const receiptNo = getDistinctLoanReceipt.rows[0]?.receipt_number;

//     if (!receiptNo) {
//       return res.status(200).send({
//         message: "No receipt number found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     // Fetch receipt detail rows
//     const receiptDtlData = await db.query(
//       `SELECT * FROM tolnemi_receipts WHERE receipt_number = $1`,
//       [receiptNo],
//     );

//     if (!receiptDtlData.rows.length) {
//       return res.status(200).send({
//         message: "No EFA Receipt data found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     // Initialize form header from first record
//     let receiptHdrData = {
//       ...receiptDtlData.rows[0],
//       amount_recd: 0,
//     };

//     // Prepare EMI detail data
//     const loanRecptEmiDtlData = await Promise.all(
//       receiptDtlData.rows.map(async (item) => {
//         const loanHdrData = await db.query(
//           `SELECT * FROM thlnefatran WHERE efa_id = $1`,
//           [item.efa_id],
//         );
//         const loanHdr = loanHdrData.rows[0];

//         if (loanHdr?.member_id) {
//           const partyResult = await db.query(
//             `SELECT dlr_name, member_no, member_id FROM moedmember WHERE member_id = $1`,
//             [loanHdr.member_id],
//           );
//           const party = partyResult.rows[0];
//           if (party) {
//             item.party_name = party.dlr_name;
//             item.member_no = party.member_no;
//             item.member_id = party.member_id;

//             receiptHdrData.party_name = party.dlr_name;
//             receiptHdrData.member_no = party.member_no;
//             receiptHdrData.member_id = party.member_id;
//           }
//         }

//         item.efa_ctrl_id = loanHdr?.efa_ctrl_id;

//         const bankResult = await db.query(
//           `SELECT bank_name FROM mhfmbank WHERE acc_no = $1`,
//           [item.bank_acc_no],
//         );
//         if (bankResult?.rowCount) {
//           item.bank_name = bankResult.rows[0].bank_name;
//           receiptHdrData.bank_name = bankResult.rows[0].bank_name;
//         }

//         // Format dates
//         item.receipt_date = dateFormater(item?.receipt_date);
//         item.instrument_date = dateFormater(item?.instrument_date);

//         // Set formatted date on header once
//         receiptHdrData.receipt_date = item.receipt_date;
//         receiptHdrData.instrument_date = item.instrument_date;

//         // Accumulate amount
//         receiptHdrData.amount_recd += Number(item.amount_recd || 0);

//         return item;
//       }),
//     );

//     return res.send({
//       type: "found",
//       formHdrData: receiptHdrData,
//       formDtlData: [],
//       repayDtlData: loanRecptEmiDtlData,
//       count: dataCount || 0,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       message: error.message || "Internal server error on query",
//     });
//   }

// const getDataOnQuery = async (req, res) => {
//   try {
//     let whereClauses = [];
//     let values = [];
//     const searchKeys = ["receipt_date", "receipt_number"];

//     // Secure dynamic WHERE clause with parameterized values
//     // searchKeys.forEach((key) => {
//     //   if (req.query[key]) {
//     //     values.push(req.query[key]);
//     //     whereClauses.push(`${key} = $${values.length}`);
//     //   }
//     // });

//           // comment by akshay  27-03-26 

//     // for (const key of searchKeys) {  
//     //   if (req.query[key] !== undefined && req.query[key] !== "") {
//     //     whereClauses.push(`${key} = '${req.query[key]}'`);
//     //   }
//     // }
        
//     // below logic write by akshay
//     for (const key of searchKeys) {
//   const value = req.query[key];

//   if (value !== undefined && value !== "") {

//     //  Special case: only date search
//     if (
//       key === "receipt_number" &&
//       value === "FAR/" &&
//       req.query.receipt_date 
//     ) {
//       continue; // ignore receipt_number
//     }

//     whereClauses.push(`${key} = '${value}'`);
//   }
// }

//     const whereCondition =
//       whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

//     let dataCount = 0;
//     let queryOrder = "";
//     let countQuery = "";
//     let countParams = values;

//     if (whereClauses.length > 0) {
//       countQuery = `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL} ${whereCondition}`;

//       const countResult = await db.query(countQuery, countParams);
//       dataCount = countResult.rows[0]?.count;

//       // queryOrder = `${whereCondition} ORDER BY receipt_number`;  // comment by akshay for in search time offset missing
//         queryOrder = `${whereCondition} 
//                 ORDER BY receipt_number 
//                 LIMIT 1 OFFSET ${req.query.offset || 0}`;

//     } else {
//       switch (req?.query?.get_data) {
//         case "Query":
//         case "First": {
//           const countResult = await db.query(
//             `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL} where receipt_date between '2026-04-01' and current_date`,
//           );
//           dataCount = countResult.rows[0]?.count;
//           queryOrder = `ORDER BY receipt_number`;
//           break;
//         }
//         case "Last":
//           queryOrder = `ORDER BY receipt_number DESC LIMIT 1`;
//           break;
//         default:
//           queryOrder = `ORDER BY receipt_number LIMIT 1 OFFSET ${
//             req.query.offset || 0
//           }`;
//       }
//     }

//     // Get distinct receipt number for this query
//     const getDistinctLoanReceipt = await db.query(
//       `SELECT DISTINCT receipt_number FROM tolnemi_receipts where receipt_date between '2026-04-01' and current_date ${queryOrder}`,
//     );

//     const receiptNo = getDistinctLoanReceipt.rows[0]?.receipt_number;

//     if (!receiptNo) {
//       return res.status(200).send({
//         message: "No receipt number found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     // Fetch receipt detail rows
//     const receiptDtlData = await db.query(
//       `SELECT * FROM tolnemi_receipts WHERE receipt_number = $1`,
//       [receiptNo],
//     );

//     if (!receiptDtlData.rows.length) {
//       return res.status(200).send({
//         message: "No EFA Receipt data found",
//         type: "not found",
//         count: 0,
//       });
//     }

//     // Initialize form header from first record
//     let receiptHdrData = {
//       ...receiptDtlData.rows[0],
//       amount_recd: 0,
//     };

//     // Prepare EMI detail data
//     const loanRecptEmiDtlData = await Promise.all(
//       receiptDtlData.rows.map(async (item) => {
//         const loanHdrData = await db.query(
//           `SELECT * FROM thlnefatran WHERE efa_id = $1`,
//           [item.efa_id],
//         );
//         const loanHdr = loanHdrData.rows[0];

//         if (loanHdr?.member_id) {
//           const partyResult = await db.query(
//             `SELECT dlr_name, member_no, member_id FROM moedmember WHERE member_id = $1`,
//             [loanHdr.member_id],
//           );
//           const party = partyResult.rows[0];
//           if (party) {
//             item.party_name = party.dlr_name;
//             item.member_no = party.member_no;
//             item.member_id = party.member_id;

//             receiptHdrData.party_name = party.dlr_name;
//             receiptHdrData.member_no = party.member_no;
//             receiptHdrData.member_id = party.member_id;
//           }
//         }

//         item.efa_ctrl_id = loanHdr?.efa_ctrl_id;

//         const bankResult = await db.query(
//           `SELECT bank_name FROM mhfmbank WHERE acc_no = $1`,
//           [item.bank_acc_no],
//         );
//         if (bankResult?.rowCount) {
//           item.bank_name = bankResult.rows[0].bank_name;
//           receiptHdrData.bank_name = bankResult.rows[0].bank_name;
//         }

//         // Format dates
//         item.receipt_date = dateFormater(item?.receipt_date);
//         item.instrument_date = dateFormater(item?.instrument_date);

//         // Set formatted date on header once
//         receiptHdrData.receipt_date = item.receipt_date;
//         receiptHdrData.instrument_date = item.instrument_date;

//         // Accumulate amount
//         receiptHdrData.amount_recd += Number(item.amount_recd || 0);

//         return item;
//       }),
//     );

//     return res.send({
//       type: "found",
//       formHdrData: receiptHdrData,
//       formDtlData: [],
//       repayDtlData: loanRecptEmiDtlData,
//       count: dataCount || 0,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       message: error.message || "Internal server error on query",
//     });
//   }
// };


const getDataOnQuery = async (req, res) => {
  try {
    let whereClauses = [];
    let values = [];
    const searchKeys = ["receipt_date", "receipt_number"];

    // Secure dynamic WHERE clause with parameterized values
    // searchKeys.forEach((key) => {
    //   if (req.query[key]) {
    //     values.push(req.query[key]);
    //     whereClauses.push(`${key} = $${values.length}`);
    //   }
    // });

          // comment by akshay  27-03-26 

    // for (const key of searchKeys) {  
    //   if (req.query[key] !== undefined && req.query[key] !== "") {
    //     whereClauses.push(`${key} = '${req.query[key]}'`);
    //   }
    // }
        
    // below logic write by akshay
    for (const key of searchKeys) {
  const value = req.query[key];

  if (value !== undefined && value !== "") {

    //  Special case: only date search
    if (
      key === "receipt_number" &&
      value === "FAR/" &&
      req.query.receipt_date 
    ) {
      continue; // ignore receipt_number
    }

    whereClauses.push(`${key} = '${value}'`);
  }
}

    const whereCondition =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    let dataCount = 0;
    let queryOrder = "";
    let countQuery = "";
    let countParams = values;

    if (whereClauses.length > 0) {
      countQuery = `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL} ${whereCondition}`;

      const countResult = await db.query(countQuery, countParams);
      dataCount = countResult.rows[0]?.count;

      // queryOrder = `${whereCondition} ORDER BY receipt_number`;  // comment by akshay for in search time offset missing
        queryOrder = `${whereCondition} 
                ORDER BY receipt_number 
                LIMIT 1 OFFSET ${req.query.offset || 0}`;

    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const countResult = await db.query(
            `SELECT COUNT(DISTINCT receipt_number) AS count FROM ${TABLE_NAMES.LOAN_RECEIPT_DTL} where receipt_date between '2026-04-01' and current_date`,
          );
          dataCount = countResult.rows[0]?.count;
          queryOrder = `ORDER BY receipt_number`;
          break;
        }
        case "Last":
          queryOrder = `ORDER BY receipt_number DESC LIMIT 1`;
          break;
        default:
          queryOrder = `ORDER BY receipt_number LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
      }
    }

    // Get distinct receipt number for this query
    // const getDistinctLoanReceipt = await db.query(
    //   `SELECT DISTINCT receipt_number FROM tolnemi_receipts where receipt_date between '2026-04-01' 
    // and current_date ${queryOrder}`,
    // );

        const getDistinctLoanReceipt = await db.query(
        `SELECT DISTINCT receipt_number
        FROM tolnemi_receipts
        ${whereCondition}
        ORDER BY receipt_number
        LIMIT 1 OFFSET ${req.query.offset || 0}`
      );

    const receiptNo = getDistinctLoanReceipt.rows[0]?.receipt_number;

    if (!receiptNo) {
      return res.status(200).send({
        message: "No receipt number found",
        type: "not found",
        count: 0,
      });
    }

    // Fetch receipt detail rows
    const receiptDtlData = await db.query(
      `SELECT * FROM tolnemi_receipts WHERE receipt_number = $1`,
      [receiptNo],
    );

    if (!receiptDtlData.rows.length) {
      return res.status(200).send({
        message: "No EFA Receipt data found",
        type: "not found",
        count: 0,
      });
    }

    // Initialize form header from first record
    let receiptHdrData = {
      ...receiptDtlData.rows[0],
      amount_recd: 0,
    };

    // Prepare EMI detail data
    const loanRecptEmiDtlData = await Promise.all(
      receiptDtlData.rows.map(async (item) => {
        
        // const loanHdrData = await db.query(
        //   `SELECT * FROM thlnefatran WHERE efa_id = $1`,
        //   [item.efa_id],
        // );
        // const loanHdr = loanHdrData.rows[0];

        // below query write by akshay on 04-06-26 for show loan purpose in header

        const loanHdrData = await db.query(
          `
          SELECT t.*, m.loan_purpose_desc
          FROM thlnefatran t
          LEFT JOIN mhedloan m
          ON t.loan_id = m.loan_id
          WHERE t.efa_id = $1
          `,
          [item.efa_id]
        );

      const loanHdr = loanHdrData.rows[0];

        if (loanHdr?.member_id) {
          const partyResult = await db.query(
            `SELECT dlr_name, member_no, member_id FROM moedmember WHERE member_id = $1`,
            [loanHdr.member_id],
          );
          const party = partyResult.rows[0];
          if (party) {
            item.party_name = party.dlr_name;
            item.member_no = party.member_no;
            item.member_id = party.member_id;

            receiptHdrData.party_name = party.dlr_name;
            receiptHdrData.member_no = party.member_no;
            receiptHdrData.member_id = party.member_id;
          }
        }

        item.efa_ctrl_id = loanHdr?.efa_ctrl_id;
        receiptHdrData.efa_ctrl_id = loanHdr?.efa_ctrl_id;   // added by akshay on 04-06-26 for show in header
        receiptHdrData.loan_purpose = loanHdr?.loan_purpose_desc || "";  // added by akshay on 04-06-26 for show in header

        const bankResult = await db.query(
          `SELECT bank_name FROM mhfmbank WHERE acc_no = $1`,
          [item.bank_acc_no],
        );
        if (bankResult?.rowCount) {
          item.bank_name = bankResult.rows[0].bank_name;
          receiptHdrData.bank_name = bankResult.rows[0].bank_name;
        }

        // Format dates
        item.receipt_date = dateFormater(item?.receipt_date);
        item.instrument_date = dateFormater(item?.instrument_date);

        // Set formatted date on header once
        receiptHdrData.receipt_date = item.receipt_date;
        receiptHdrData.instrument_date = item.instrument_date;

        // Accumulate amount
        receiptHdrData.amount_recd += Number(item.amount_recd || 0);

        return item;
      }),
    );

    return res.send({
      type: "found",
      formHdrData: {
    ...receiptHdrData,
    bank_cd: receiptHdrData.bank_acc_no,  // added by akshay on 04-06-26 for show in edit form select option
  },
      formDtlData: [],
      repayDtlData: loanRecptEmiDtlData,
      count: dataCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: error.message || "Internal server error on query",
    });
  }
};


const getHelpData = async (req, res) => {
  try {
    const { help_list, form_status, appDivisionId, appFinYear } = req?.query;
    if (help_list === "party_name") {
      const getMemberDataList = await db.query(`
        Select dlr_name, member_no, division, d.city as location, member_id from moedmember m, moeddealer d
        where m.dealer_code = d.dealer_code
        order by dlr_name 
        `);
      if (getMemberDataList.rows.length > 0) {
        res.status(200).json(getMemberDataList.rows);
      }
    }
    if (help_list === "efa_ctrl_id") {

  const getLoanRefList = await db.query(
    `
    SELECT 
        a.efa_id,
        a.efa_ctrl_id,
        a.efa_application_date::date,
        a.loan_id,
        'LOAN FOR ' || l.loan_purpose_desc AS loan_purpose
    FROM thlnefatran a
    JOIN mhedloan l 
      ON a.loan_id = l.loan_id
    WHERE a.member_id = $1
    ORDER BY a.efa_id DESC
    `,
    [req.query.member_id]
  );

  return res.status(200).json(getLoanRefList.rows.map(item => ({
    ...item,
    efa_application_date: dateFormater(item.efa_application_date)
  }))); 
}
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: `${error.message}` || "Internal Server Error" });
  }
};

exports.handleRepayAdjustFifo = catchAsync(async (req, res, next) => {
  console.log("repayAdjustcall");
  console.log("req.body", req.body);

  let formData = req.body.LoanRepayHdr;

  console.log("formData", formData);

  try {
    await db.query("begin");

    // console.log(
    //   "all data fields",
    //   formData.efa_id,
    //   formData.amount_recd,
    //   formData.receipt_number,
    //   formData.receipt_date,
    //   formData.instrument_no,
    //   formData.instrument_date,
    //   formData.bank_cd,
    //   formData.remarks
    // );

    await db.query("delete from tolnemi_receipts_temp where efa_id = $1", [
      formData.efa_id,
    ]);

    const queryResult = await db.query(
      `call repay_adjust_fifo($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        formData.efa_id,
        formData.amount_recd,
        formData.receipt_number,
        formData.receipt_date,
        formData.instrument_no,
        formData.instrument_date,
        formData.bank_cd,
        formData.remarks,
      ],
    );
    let getEMIData = await db.query(
      `select d.efa_id, emi_sno,efa_ctrl_id, emi_date,  principal_amt, service_chg_ded, interest_amt, igst_amt,
        cgst_amt, sgst_amt, principal_amt+service_chg_ded+interest_amt+igst_amt+cgst_amt+sgst_amt total_amt
        from tdlnefatran d, thlnefatran h where d.efa_id = $1 and h.efa_id = d.efa_id
              order by emi_sno`,
      [formData.efa_id],
    );

    if (getEMIData.rowCount > 0) {
      getEMIData = getEMIData.rows.map((item) => ({
        ...item,
        emi_date: dateFormater(item.emi_date),
      }));
    } else {
      getEMIData = [];
    }

    let getRepayData = await db.query(
      `
            select efa_id, emi_sno, receipt_number, receipt_date,bank_name,
            instrument_no, instrument_date, amount_recd, remarks, amt_serv_chg_adjust,
            amt_interest_adjust, amt_igst_adjust, amt_cgst_adjust, amt_sgst_adjust,
            amt_principal_adjust
            from tolnemi_receipts_temp t,mhfmbank b where efa_id = $1 
            and b.acc_no = t.bank_acc_no
            order by emi_sno`,
      [formData.efa_id],
    );

    if (getRepayData.rowCount > 0) {
      getRepayData = getRepayData.rows.map((item) => ({
        ...item,
        instrument_date: dateFormater(item.instrument_date),
        receipt_date: dateFormater(item.receipt_date),
      }));
    } else {
      getRepayData = [];
    }

    // todo: bring total banlance amount

    // console.log(getRepayData.rows, "efa_id", formData.efa_id);
    await db.query("commit");
    return res.status(200).json({
      dataEMI: getEMIData,
      dataRepay: getRepayData,
      message: "EMI received amount adjusted on FIFO basis successfully",
    });
  } catch (error) {
    console.error(error);
    await db.query("rollback");
    return res
      .status(500)
      .send({ message: `${error.message}` || "Internal Server Error" });
  }
});



// const updateManualAdjEntryInTemp = async (db, loanReceiptData) => {
//   if (!Array.isArray(loanReceiptData) || loanReceiptData.length === 0) return;

//   const query = `
//     UPDATE tolnemi_receipts_temp
//     SET
//       amt_serv_chg_adjust   = $1,
//       amt_interest_adjust   = $2,
//       amt_igst_adjust       = $3,
//       amt_cgst_adjust       = $4,
//       amt_sgst_adjust       = $5,
//       amt_principal_adjust  = $6,
//       remarks               = $7
//     WHERE efa_id = $8
//       AND emi_sno = $9
//       AND receipt_number = $10
//   `;

//   for (const row of loanReceiptData) {
//     const values = [
//       row.amt_serv_chg_adjust ?? 0,
//       row.amt_interest_adjust ?? 0,
//       row.amt_igst_adjust ?? 0,
//       row.amt_cgst_adjust ?? 0,
//       row.amt_sgst_adjust ?? 0,
//       row.amt_principal_adjust ?? 0,
//       row.remarks ?? null,
//       row.efa_id,
//       row.emi_sno,
//       row.receipt_number
//     ];

//     await db.query(query, values);
//   }
// };

const toNumber = (val) =>
  val === "" || val === null || val === undefined ? 0 : Number(val);

const updateManualAdjEntryInTemp = async (db, loanReceiptData) => {
  if (!Array.isArray(loanReceiptData) || loanReceiptData.length === 0) return;

  const query = `
    UPDATE tolnemi_receipts_temp
    SET
      amt_serv_chg_adjust   = $1,
      amt_interest_adjust   = $2,
      amt_igst_adjust       = $3,
      amt_cgst_adjust       = $4,
      amt_sgst_adjust       = $5,
      amt_principal_adjust  = $6,
      remarks               = $7
    WHERE efa_id = $8
      AND emi_sno = $9
      AND receipt_number = $10
  `;

  for (const row of loanReceiptData) {
    const values = [
      toNumber(row.amt_serv_chg_adjust),
      toNumber(row.amt_interest_adjust),
      toNumber(row.amt_igst_adjust),
      toNumber(row.amt_cgst_adjust),
      toNumber(row.amt_sgst_adjust),
      toNumber(row.amt_principal_adjust),
      row.remarks || null,
      row.efa_id,
      row.emi_sno,
      row.receipt_number
    ];

    await db.query(query, values);
  }
};

exports.handleRepayAdjustFifoFinal = catchAsync(async (req, res, next) => {
  try {
    await db.query("begin");

    let formData = req.body.LoanRepayHdr;

    const {isManualAdj, loanReceiptData} = req.body;


    console.log(formData);
    console.log('loanReceiptData ::', loanReceiptData)

    if (isManualAdj) {
      await updateManualAdjEntryInTemp(
        db,
        loanReceiptData
      );
    }
    const queryResult = await db.query(
      `call create_emi_receipts_in_final($1)`,
      [formData.efa_id],
    );


    // get Loan Receipt No
    const getLrNo = await db.query(`select genLoanReceiptNo() as loanlrno`);

    const efarNo = getLrNo.rows[0]?.loanlrno;

    // udpate this efarNo into all records

    const updLrNo = await db.query(
      `update tolnemi_receipts set receipt_number = $1 where efa_id = $2 and receipt_number = $3`,
      [efarNo, formData?.efa_id, formData?.receipt_number],
    );


    const getGeneratedBnkVch = await db.query(
      `
     select vch_no from tdfmtran
where substring(vch_no, 1,2)= 'BR'
and substring(remarks,1,29) = 'PRINCIPAL PAYMENT FOR EMFA NO'
and voucher_id = (select max(voucher_id) from tdfmtran where substring(vch_no, 1,2)= 'BR'
and substring(remarks,1,29) = 'PRINCIPAL PAYMENT FOR EMFA NO')
      `,
    );

    const BnkVchNo = getGeneratedBnkVch.rows[0]?.vch_no;
    console.log("Generated Bank Voucher No: ", BnkVchNo);

    await db.query("commit");
    return res
      .status(200)
      .json({
        data: efarNo,
        message: "Data saved successfully",
        generated_bank_vch_no: BnkVchNo,
      });
  } catch (error) {
    console.error(error);
    await db.query("rollback");
    return res
      .status(500)
      .send({ message: `${error.message}` || "Internal Server Error" });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
    return;
  }
  if (req?.query?.help_list) {
    await getHelpData(req, res);
    return;
  }
});
