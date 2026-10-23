const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { v4: uuidv4 } = require('uuid');

const TABLE_NAMES = {
  MAIN_HDR_TABLE: `thfmtran`,
  MAIN_DTL_TABLE: `tdfmtran`,
  SECTION_LIST_TABLE: `moitsection`,
  USER_SECTION_LIST_TABLE: `moitusersection`,
  GLM_MASTER_TABLE: "mhfmglm",
  COST_CENTRE_VIEW: "vwcostc",
  PURPOSE_LIST_VIEW: "vwPurp",
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  let global_user_id = req?.userInfo?.global_user_id || 583; // todo: also remove hardcord user from here

  const { formStatus, appFinYear } = req?.query;

  //todo hardcode the user_id = 0 rightnow so do remove when user_id work will be do
  // as user id not engage properly with division
  // global_user_id = 0; // HARD CODE

  if (!global_user_id && !formStatus) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const sectionList = await db.query(
    `SELECT s.section_desc, u.section_id
          FROM ${TABLE_NAMES.SECTION_LIST_TABLE} s
          JOIN ${TABLE_NAMES.USER_SECTION_LIST_TABLE} u ON s.section_id = u.section_id
          WHERE u.user_id = $1
          ORDER BY s.section_desc`,
    [Number(global_user_id)]
  );

  // this will return the sect for use as perameter in voucher id generator
  const sect = await db.query(
    `SELECT SECTION_PREFIX FROM ${TABLE_NAMES.SECTION_LIST_TABLE}
         WHERE SECTION_ID = $1`,
    [sectionList.rows[0].section_id]
  );

  //this will return po_cat list
  const po_catList = await db.query(
    `select mc.po_cat_description, fc.po_cat_prefix from mofmpcat fc, mommpcat mc
      where fc.po_cat_prefix = mc.po_cat_prefix`
  );

  //this will return purpus list
  const purpose = await db.query(
    `select description, code from vwPurp order by 1`
  );

  // this will return registerType
  const rgstrTypeList = await db.query(
    `SELECT register_type FROM integral.VWEXCISEREGISTERTYPE`
  );

  return res.status(200).json({
    poCategory: po_catList.rows,
    sections: sectionList.rows,
    purposes: purpose.rows,
    registerList: rgstrTypeList.rows,
    sect: sect.rows[0].section_prefix,
  });
});

const getPurchaseVchrEntryDataOnQuery = async (req, res) => {
  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["voucher_no", "voucher_dt"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues = whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  const { formStatus, appDivisionId, appFinYear } = req?.query;
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = req?.userInfo?.user_id || req?.userId ||  583; // todo: remove this after resolving the issue of cookies not seted in client

  // console.log(divisionId)
  let thfmtranData = {};

  try {
    let queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;
    // console.log(req.query);
    // If search parameters exist, count results accordingly
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(voucher_id)
          FROM ${TABLE_NAMES.MAIN_HDR_TABLE} m
          where trans_year = $1
          and division_id = $2
          and substr(trans_type,1,1) = 'P'
          and exists (select 1
          from user_division e 
          where e.user_id = $3
          and e.division_id = m.division_id) ${queryValues}`,
        [transYear, divisionId, user_id]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
          `SELECT COUNT(voucher_id)
          FROM ${TABLE_NAMES.MAIN_HDR_TABLE} m
          where trans_year = $1
          and division_id = $2
          and substr(trans_type,1,1) = 'P'
          and exists (select 1
          from user_division e 
          where e.user_id = $3
          and e.division_id = m.division_id)`,
        [transYear, divisionId, user_id]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY voucher_id DESC LIMIT 1";
          break;
        }
        default:
          queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const purchaseVoucher = await db.query(
      `
        SELECT *
        FROM ${TABLE_NAMES.MAIN_HDR_TABLE} m
          where trans_year = $1
          and division_id = $2
          and substr(trans_type,1,1) = 'P'
          and exists (select 1
          from user_division e 
          where e.user_id = $3
          and e.division_id = m.division_id)
        ${queryParameter}
      `,
     [transYear, divisionId, user_id]
    );

    if (!purchaseVoucher.rows.length) {
      return res.status(200).send({ type: "not found", message: "No voucher data found",  count: 0 });
    }

    // SET PURCH VOUCHER DATA
    thfmtranData = { ...purchaseVoucher.rows[0] };
    thfmtranData.bill_dt = dateFormater(purchaseVoucher.rows[0]?.bill_dt)
    thfmtranData.voucher_dt = dateFormater(purchaseVoucher.rows[0]?.voucher_dt)

    // SETUP PARTY CODE AND PARTY NAME AS IN POST- QUERY ✅
    const party_detail = await db.query(
      `
      SELECT d.acc_no, m.acc_desc 
      FROM ${TABLE_NAMES.MAIN_DTL_TABLE} d, ${TABLE_NAMES.GLM_MASTER_TABLE} m
      WHERE d.voucher_id = $1
      AND d.flag = $2
      AND d.acc_no = m.acc_no
      GROUP BY d.acc_no, m.acc_desc;
      `,
      [purchaseVoucher.rows[0].voucher_id, "Y"]
    );
    thfmtranData.party_code =
      party_detail.rowCount > 0 ? party_detail.rows[0].acc_no : "";
    thfmtranData.party_name =
      party_detail.rowCount > 0 ? party_detail.rows[0].acc_desc : "";

    // SETUP PO_CAT
    const getPoCat = await db.query(
      `
        select m.po_cat_prefix as po_cat
        from mofmpcat f, mommpcat m
        where f.trans_code = $1
        and f.po_cat_prefix = m.po_cat_prefix limit 1;
      `,
      [thfmtranData.trans_type]
    );
    thfmtranData.po_cat = getPoCat.rowCount > 0 ? getPoCat.rows[0].po_cat : "";

    const getSection = await db.query(
      `
        select s.section_id as section
        from moitsection s, user_master u
        where s.section_prefix = $1
        AND s.dept_cd = u.dept_cd
        AND u.user_id = $2;
      `,
      ['G', user_id]
    );
    thfmtranData.section = getSection.rowCount > 0 ? getSection.rows[0].section : 2; // todo remove this hardcode section or ask pm sir

    const getBillLog = await db.query(
  `SELECT bill_log FROM mhapbill WHERE bill_id = $1;
      `,[purchaseVoucher.rows[0]?.bill_id])

      thfmtranData.bill_log = getBillLog.rowCount > 0 ? getBillLog.rows[0]?.bill_log :'';

    const getDivisionName = await db.query(
      `select name as division_name from moitdivision where division_id = $1;`,[appDivisionId]
    )

    thfmtranData.division_name = getDivisionName.rowCount > 0? getDivisionName.rows[0]?.division_name: ''

    // FETCH TDFMTRAN DATA RELATED TO ABOVE THFMTRAN VOUCHER_ID
    const purchaseVchrDtl = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MAIN_DTL_TABLE} WHERE voucher_id = $1 AND flag = $2 ORDER BY srl_no
      `,
      [purchaseVoucher.rows[0].voucher_id, "N"]
    );



    await Promise.all(
      purchaseVchrDtl.rows.map(async (item, index) => {
        item.old_amount = item.amount
        if (item.cost_centr !== null) {
          const cost_cntr = await db.query(
            ` SELECT description, prefix FROM ${TABLE_NAMES.COST_CENTRE_VIEW} WHERE code = $1`,
            [item.cost_centr]
          );
          item.cost_desc = cost_cntr.rows[0]?.description;
          item.cost_pre = cost_cntr.rows[0]?.prefix;
          item.cost = item.cost_pre;
        }
        if (item.pur_code !== null) {
          const purp_desc = await db.query(
            `SELECT description FROM ${TABLE_NAMES.PURPOSE_LIST_VIEW} WHERE code = $1`,
            [item.pur_code]
          );
          item.pur_desc = purp_desc.rows[0]?.description;
        }
        const acc_desc = await db.query(
          `SELECT * FROM mhfmglm WHERE acc_no = $1`,
          [item.acc_no]
        );
        if (acc_desc.rowCount > 0) {
          item.acc_desc = acc_desc.rows[0].acc_desc;
        }
        if (item.emp_cd !== null) {
          const emp_detail = await db.query(
            `SELECT emp_name FROM integral.mhpmempm WHERE emp_cd = $1`,
            [item.emp_cd]
          );
          item.emp_name = emp_detail.rows[0]?.emp_name || null;
        }

        item.row_id = uuidv4();
        item.bill_dt = dateFormater(item?.bill_dt)
        item.vch_dt = dateFormater(item?.vch_dt)
      })
    );

    return res.status(200).json({
      type: "found",
      formHdrData: { ...thfmtranData },
      formDtlData: purchaseVchrDtl.rows,
      // procInsertContra: { ...procInsertContra.rows[0] },
      count: recordCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal Error while Fetching query data" });
  }
};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("from handleFormOperation", req?.query);
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getPurchaseVchrEntryDataOnQuery(req, res);
    return;
  }
});
