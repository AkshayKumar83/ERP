const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");

const TABLE_NAMES = {
  MAIN_HDR_TABLE: `mhapbill`,
};

const getUnlinkApBillDataOnQuery = async (req, res) => {
  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["bill_no", "bill_dt"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  const { formStatus, appDivisionId, appFinYear } = req?.query;
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = req?.userInfo?.user_id || req?.userId || 583; // todo: remove this after resolving the issue of cookies not seted in client

  try {
    let queryParameter = `ORDER BY bill_log LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;
    // console.log(req.query);
    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(bill_id)
          FROM ${TABLE_NAMES.MAIN_HDR_TABLE} m
          where trans_year = $1
          and division_id = $2
          ${queryValues}`,
        [transYear, divisionId]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(bill_id)
          FROM ${TABLE_NAMES.MAIN_HDR_TABLE} m
          where trans_year = $1
          and division_id = $2`,
            [transYear, divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY bill_log DESC LIMIT 1";
          break;
        }
        default:
          queryParameter = `ORDER BY bill_log LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const unlinkApBill = await db.query(
      `
        SELECT *
        FROM ${TABLE_NAMES.MAIN_HDR_TABLE} m
          where trans_year = $1
          and division_id = $2
        ${queryParameter}
      `,
      [transYear, divisionId]
    );

    if (!unlinkApBill.rows.length) {
      return res
        .status(200)
        .send({ type: "not found", message: "No data found", count: 0 });
    }

    const vendorName = await db.query(
      `
        Select v_name from mommvend
        where v_code = $1;
        `,
      [unlinkApBill.rows[0]?.v_code]
    );

    unlinkApBill.rows[0].v_name =
      vendorName.rowCount > 0 ? vendorName.rows[0]?.v_name : "";
    unlinkApBill.rows[0].blog_dt = dateFormater(unlinkApBill.rows[0]?.blog_dt);
    unlinkApBill.rows[0].bill_dt = dateFormater(unlinkApBill.rows[0]?.bill_dt);

    return res.status(200).json({
      type: "found",
      formHdrData: { ...unlinkApBill.rows[0] },
      count: recordCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Internal Error while Fetching query data",
    });
  }
};

exports.updateUnlinkFormData = catchAsync(async (req, res, next) => {
  const { bill_id } = req.body;
  try {
    await db.query("Begin");
    const makeBillUnlink = await db.query(
      `update thfmtran set cancel= $1 where bill_id= $2 and trans_type like 'P%'; `,
      ["Y", bill_id]
    );

    await db.query('update mhapbill set pend_flag= $1 where bill_id= $2;',['N', bill_id])
    await db.query("commit");
    res.status(200).json({ type: "success" });
  } catch (error) {
    res
      .status(500)
      .json({
        type: "error",
        message: error.message || "Internal Server Error",
      });
  }
});

exports.checkUnlink = catchAsync(async (req, res, next) => {
  const { pend_flag, bill_id, division_id, trans_year, v_code } = req.body;
  let paid_unposted_pay_flag = true;
  let formData = {
    posted: "",
    pay_advno: "",
    posted1: "",
    pay_flag: "",
    vou_id: "",
  };

  try {
    if (pend_flag == "Y") {
      const result = await db.query(
        `select Pay_advno, pay_flag from tofmap
            where bill_id = $1 limit 1`,
        [bill_id]
      );
      if (result.rowCount > 0) {
        formData.pay_advno = result.rows[0]?.pay_advno;
        formData.pay_flag = result.rows[0]?.pay_flag;
      }

      if (formData.pay_flag != "" && formData.pay_flag == "Y") {
        throw new Error(
          `Bank Voucher has been already created! Cannot unlink...`
        );
      }

      const result2 = await db.query(
        `
        SELECT h.posted as posted1
        FROM thfmtran h, tdfmtran d
        WHERE h.voucher_id = d.voucher_id
          AND h.division_id = $1
          AND h.trans_year = $2
          AND h.trans_type LIKE 'P%'
          AND h.bill_id = $3
          AND d.acc_no = 'S' || $4
        LIMIT 1;`,
        [division_id, trans_year, bill_id, v_code]
      );

      if (result2.rowCount > 0) {
        formData.posted1 = result2.rows[0].posted1;
      }
      if (formData.posted1 != "" && formData.posted1 == "Y") {
        throw new Error(
          "Purchase Voucher has already been Posted....! Cannot unlink."
        );
      }

      const paidUnposed = await db.query(
        `SELECT COALESCE(pay_flag, 'N') AS pay_flag
   FROM tofmduepaym
   WHERE bill_id = $1`,
        [bill_id]
      );

      if (paidUnposed.rowCount === 0) {
        throw new Error(`No Purchase Voucher created for this Bill.`);
      } else {
        for (const row of paidUnposed.rows) {
          if (row.pay_flag !== "N") {
            paid_unposted_pay_flag = false;
            break;
          }
        }

        if (!paid_unposted_pay_flag) {
          throw new Error(
            `Payment has been already made for this Bill. Cannot unlink.`
          );
        }
      }
    } else {
      throw new Error(`Bill is already Unlinked`);
    }
    res.status(200).json({ type: "success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal server error",
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("from handleFormOperation", req?.query);
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getUnlinkApBillDataOnQuery(req, res);
    return;
  }
});
