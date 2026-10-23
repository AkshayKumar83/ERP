const { response } = require("express");
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");

const TABLE_NAMES = {
  THFMTRAN: `thfmtran`,
  TDFMTRAN: `tdfmtran`,
};

// for dropdown data
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const { appUserId } = req.query;

  const DivisionList = await db.query(
    `select h.name,  (h.division_id) division_id from moitdivision h, user_division d
    where h.division_id = d.division_id
    and d.user_id = $1 `,
    [appUserId]
  );
  const SectionList = await db.query(
    `select s.section_desc, u.section_id 
      from  moitsection s, moitusersection u
      where u.user_id = $1
      and s.section_id = u.section_id
      order by 1 `,
    [appUserId]
  );

  const InvoiceList = await db.query(
    `select da_cat_desc, da_cat from mosmdact where invoice = 'Y' order by 1  `
  );

  const PurposeList = await db.query(
    `select description, code from vwpurp order by description`
  );

  return res.status(200).json({
    division: DivisionList.rows,
    section: SectionList.rows,
    invoice: InvoiceList.rows,
    purpose: PurposeList.rows,
  });
});

// for query
const getSaleVchrDataOnQuery = async (req, res) => {
  const { appDivisionId, appFinYear, userId } = req?.query;
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
  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  try {
    let queryParameter = `ORDER BY voucher_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMTRAN} 
            where trans_year = $1 and Division_id = $2 and trans_type like 'S%' 
            and exists (select 1
            from user_division e 
            where e.user_id = $3
            and e.division_id = $2) ${queryValues}`,
        [transYear, appDivisionId, userId]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(voucher_id) FROM ${TABLE_NAMES.THFMTRAN} 
              where trans_year = $1 and Division_id = $2 and trans_type like 'S%' 
              and exists (select 1
              from user_division e 
              where e.user_id = $3
              and e.division_id = $2)
              `,
            [appFinYear, appDivisionId, userId]
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

    const thfmtranData = await db.query(
      `SELECT * 
        FROM thfmtran 
        WHERE trans_year = $1
        AND Division_id = $2
        AND trans_type LIKE 'S%' 
        AND EXISTS (
            SELECT 1
            FROM user_division e
            WHERE e.user_id = $3
            AND e.division_id = $2
) ${queryParameter};  
            `,
      [appFinYear, appDivisionId, userId]
    );

    if (thfmtranData.rowCount == 0) {
      // throw new Error("No matching record found");
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        thfmtranData: [],
        recordCount: 0,
      });
    }
    const vchId = thfmtranData.rows[0].voucher_id;
    const partyCd = thfmtranData.rows[0].party_code;

    // set party code in POST-QUERY

    const getPartyCode = await db.query(
      `SELECT TDFMTRAN.ACC_NO AS party_code, MHFMGLM.ACC_DESC AS party_name
        FROM TDFMTRAN
          JOIN MHFMGLM ON TDFMTRAN.ACC_NO = MHFMGLM.ACC_NO
          WHERE TDFMTRAN.VOUCHER_ID = $1
          AND TDFMTRAN.FLAG = 'Y'`,
      [vchId]
    );

    thfmtranData.rows[0].party_code =
      getPartyCode.rowCount > 0 ? getPartyCode.rows[0].party_code : "";

    thfmtranData.rows[0].party_name =
      getPartyCode.rowCount > 0 ? getPartyCode.rows[0].party_name : "";

    //set section in POST-QUERY

    const getSection = await db.query(
      ` select s.section_id as section
       from moitsection s, user_master u
        where s.section_prefix = 'G'
          AND s.dept_cd = u.dept_cd
          AND u.user_id = $1`,
      [userId]
    );

    thfmtranData.rows[0].section =
      getSection.rowCount > 0 ? getSection.rows[0].section : "";

    const tdfmtranData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDFMTRAN} WHERE voucher_id = $1 AND flag = $2 ORDER BY srl_no`,
      [vchId, "N"]
    );

    const procInsertContra = await db.query(
      `SELECT * FROM ${TABLE_NAMES.TDFMTRAN} WHERE voucher_id = $1 AND flag = $2`,
      [vchId, "Y"]
    );

    if (tdfmtranData.rows.length > 0) {
      await Promise.all(
        tdfmtranData.rows.map(async (item) => {
          if (item.acc_no !== null) {
            const acc_no = await db.query(
              `select ACC_DESC 
               from VWMDFMGLM
              where ACC_NO = $1
               and DIVISION_ID = $2
                  and trans_year = $3`,
              [item.acc_no, appDivisionId, appFinYear]
            );
            item.acc_desc = acc_no.rows[0]?.acc_desc || null;
          }

          if (item.cost_centr !== null) {
            const cost_cntr = await db.query(
              ` select prefix, description 
                from vwcostc
                where cat_group = 'COSTC'
                 AND code = $1;`,
              [item.cost_centr]
            );
            item.cost_desc = cost_cntr.rows[0]?.description || null;
            item.cost = cost_cntr.rows[0]?.prefix || null;
          }
        })
      );
    }

    // Format date fields properly
    const formattedThfmtranData = {
      ...thfmtranData.rows[0],
      voucher_dt: dateFormater(thfmtranData.rows[0]?.voucher_dt),
      bill_dt: dateFormater(thfmtranData.rows[0]?.bill_dt),
    };

    const formattedTdfmtranData =
      tdfmtranData.rows.length > 0
        ? tdfmtranData.rows.map((row) => ({
            ...row,
            bill_dt: dateFormater(row.bill_dt),
            prof_dt: dateFormater(row.prof_dt),
            bank_grn_dt: dateFormater(row.bank_grn_dt),
            chq_dt: dateFormater(row.chq_dt),
            deposit_slip_dt: dateFormater(row.deposit_slip_dt),
          }))
        : [];

    const responseData = {
      thfmtranData: formattedThfmtranData,
      tdfmtranData: formattedTdfmtranData,
      procInsertContra:
        procInsertContra.rows.length > 0 ? procInsertContra.rows[0] : {},
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  console.log("from handleFormOperation", req?.query);
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getSaleVchrDataOnQuery(req, res);
    return;
  }
});
