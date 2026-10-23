const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const jwt = require("jsonwebtoken");
// const { PO_HDR_VALID_COLUMNS, PO_DTL_VALID_COLUMNS } = require("./presentation");

const { v4: uuidv4 } = require("uuid");
const {
  transformMhmmpoamd,
  transformMdmmpoitamd,
  transPOLevelToDbData,
  transPOLevelChargeToDbData,
} = require("./presentation");

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { sendNextAuthMail } = require("./sendAuthMail");
const { queuePOAuthorizationNotifications } = require("../../../adminModule/forms/emailNotification");

const JAR_PATH = path.resolve(
  __dirname,
  "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
);

const TABLE_NAMES = {
  HDR_TABLE: "MHMMPOAMD",
  HDR_TABLE_MAIN: "MHMMPO",
  DTL_TABLE: "MDMMPOITAMD",
  DTL_TABLE_MAIN: "MDMMPOIT",
  PO_LEVEL_CHARGE: "mdmmpo_po_level_charges",
};

const PO_HDR_VALID_COLUMNS = [
  "po_no",
  "wc_id",
  "trans_year",
  "division_id",
  "category",
  "v_code",
  "c_code",
  "amd_no",
  "amd_date",
  "consg_code",
  "po_date",
  "po_eff_dt",
  "po_end_dt",
  "pr_id",
  "qtn_ref",
  "pric_basis",
  "pack_code",
  "mode_cd",
  "curr_cd",
  "curr_conv",
  "pf_flg",
  "pack_for",
  "ins_per_rat",
  "ins_flg",
  "ins_chg",
  "frt_per_rat",
  "frt_shpflg",
  "frt_chg",
  "octroi_per_rat",
  "octroi_flg",
  "octroi_chg",
  "term_code",
  "auth_pers",
  "trial_po",
  "desp_by",
  "sp_ins",
  "prod_flg",
  "po_flag",
  "flag",
  "po_note",
  "spec",
  "wospec",
  "cancel_flag",
  "cancel_date",
  "closer_flag",
  "closer_date",
  "dlvr_schd",
  "amd_reason",
  "our_bankers",
  "transport",
  "total_amount",
  "prev_po_no",
  "prev_po_dt",
  "auth_signatory_name1",
  "auth_signatory_desig1",
  "auth_signatory_name2",
  "auth_signatory_desig2",
  "wo_title1",
  "wo_title2",
  "budget_ref",
  "pack_for_per_rat",
  "pack_for_value",
  "cost_centr",
  "credit_days",
  "po_value",
  "pur_code",
  "direct_to_osp",
  "prof_inv_no",
  "ins_emp_cd",
  "st38_no",
  "port_of_load",
  "port_final_dest",
  "ship_from_code",
  "bill_from_code",
  "old_po_no",
  "foc_flag",
  "fin_approval_dt",
  "div_id_bill_to",
  "div_id_ship_to",
  "misc_chrgs_lbl",
  "misc_chrgs_amt",
  "order_acceptance",
  "mat_disp_clearance_flg",
  "calc_gst_on_ins",
  "gst_amt_prc_i",
  "gst_sgst_val_i",
  "gst_sgst_cess_val_i",
  "gst_ugst_val_i",
  "gst_ugst_cess_val_i",
  "gst_cgst_val_i",
  "gst_cgst_cess_val_i",
  "gst_igst_val_i",
  "gst_igst_cess_val_i",
  "calc_gst_on_frt",
  "gst_amt_prc_f",
  "gst_sgst_val_f",
  "gst_sgst_cess_val_f",
  "gst_ugst_val_f",
  "gst_ugst_cess_val_f",
  "gst_cgst_val_f",
  "gst_cgst_cess_val_f",
  "gst_igst_val_f",
  "gst_igst_cess_val_f",
  "t_gst_sgst_amt",
  "t_gst_sgst_cess_amt",
  "t_gst_ugst_amt",
  "t_gst_ugst_cess_amt",
  "t_gst_cgst_amt",
  "t_gst_cgst_cess_amt",
  "t_gst_igst_amt",
  "t_gst_igst_cess_amt",
  "ins_chg_value",
  "frt_chg_value",
  "hide_rate_import_po",
  "adv_gl_acc_no",
  "adv_against_po",
  "subsidy_perc",
  "po_type",
  "brand_code",
  "create_id",
  "update_id",
  "update_date"
];

const PO_DTL_VALID_COLUMNS = [
  "it_code",
  "sob_perc",
  "pack_code",
  "po_um",
  "po_qty_ord",
  "po_qty_bal",
  "po_mat_rat",
  "po_ser_rat",
  "po_perunit",
  "po_disc",
  "rej_allow",
  "ex_amtp_fl",
  "ex_amt",
  "ex_perc",
  "spl_ex_per",
  "lst_perc",
  "cst_perc",
  "cst_form",
  "surch_perc",
  "mod_vat",
  "remark",
  "po_fab_chg",
  "active",
  "po_disc_val",
  "osp_mat_perc",
  "tax_on_disc",
  "serv_tax_perc_amt",
  "serv_tax_value",
  "serv_tax_cess",
  "serv_tax_recov",
  "serv_tax_on_material",
  "schd_chk_flag",
  "sch_tol_perc",
  "free_item_flg",
  "po_qty_free",
  "hsc_ex_perc",
  "serv_tax_hsc",
  "po_it_wgt",
  "po_basic_rat",
  "ex_inclusiv",
  "alter_uom",
  "spl_add_cd_perc_amt",
  "spl_add_cd_value",
  "incl_servtax_in_sales_tax",
  "gst_amt_prc",
  "gst_sgst_val",
  "gst_sgst_amt",
  "gst_sgst_cess_val",
  "gst_sgst_cess_amt",
  "gst_ugst_val",
  "gst_ugst_amt",
  "gst_ugst_cess_val",
  "gst_ugst_cess_amt",
  "gst_cgst_val",
  "gst_cgst_amt",
  "gst_cgst_cess_val",
  "gst_cgst_cess_amt",
  "gst_igst_val",
  "gst_igst_amt",
  "gst_igst_cess_val",
  "gst_igst_cess_amt",
  "po_qty_in_stk_uom",
  "print_qty_in_stk",
  "filer",
  "create_id",
  "update_id",
  "update_date",
  "subsidy_applicable",

  ];



exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  let global_user_id = req?.userInfo?.global_user_id || 583; // todo: also remove hardcord user from here

  const { formStatus, appFinYear,userId  } = req?.query;

console.log("userId =>", userId);


let allowedDocTypes = [];

if (formStatus === "Insert") {
  const authCheck = await db.query(
    `
    SELECT doc_type
    FROM moitauth
    WHERE active = 'Y'
      AND $1 IN (auth_id1, auth_id2, auth_id3)
    `,
    [userId]
  );

  if (authCheck.rowCount === 0) {
    return res.status(403).json({
      status: false,
      message: "You have not Rights to make Purchase Order/Advice"
    });
  }

  allowedDocTypes = authCheck.rows.map(r => r.doc_type);
}
  //todo hardcode the user_id = 0 rightnow so do remove when user_id work will be do
  // as user id not engage properly with division
   global_user_id = 0; // HARD CODE  // todo remove this line after user_id issue resolved

  if (!global_user_id && !formStatus) {
    return res.status(404).json({ message: "User Not Found" });
  }

  //todo ask this query to jsb/pm sir
  // const po_catList = await db.query(
  //   `select po_cat_description, po_cat_prefix
  //   from mommpcat,mommpocatright
  //   where mommpcat.po_cat_prefix = mommpocatright.po_category
  //   and coalesce(user_code, 'zz') != 'WO'
  //   and mommpocatright.user_id = $1
  //   order by po_cat_description`,
  //   [Number(global_user_id)]
  // );

  // todo remove this query as it is temporary use above query
  const po_catList = await db.query(
    `select po_cat_description, po_cat_prefix from mommpcat
     order by po_cat_description`,
  );

  const packingList = await db.query(
    `select description, code from mommcode where cat_group = 'PACK' order by 1`,
  );

  const modeOfTransportList = await db.query(
    `select description, code from mommcode where cat_group = 'MOT' order by 1`,
  );
  //  below this query is commented by akshay and added in helplist
  // const paymentTermList = await db.query(
  //   `select term_desc, term_code from mhmmterm where coalesce(active, 'N') = 'Y' order by 1`
  // );

  const workCenterList =
    await db.query(`select wc_no, wc_id from mommwc w, moitparmdiv d
        where d.receiving_store_wc_id = w.wc_id
        order by wc_no`);

  const priceBasisList = await db.query(
    `select description, code from mommcode where cat_group = 'PBASIS' order by 1`,
  );

  const currencyList = await db.query(
    `select curr_desc, curr_code from currency order by 1`,
  );
  const brandList = await db.query(
    `select code as brand_code, description from mommcode where cat_group= 'BRAND' `,
  );

  // get the po_id in case of Insert
  // let new_po_id = 0;
  // if (formStatus === "Insert") {
  //   const getPoId = await db.query(`SELECT nextval('s_mhmmpo_po_id') as po_id`);
  //   if (getPoId.rowCount > 0) {
  //     new_po_id = getPoId.rows[0].po_id;
  //   }
  // }

  

  return res.status(200).json({
    poCategory: po_catList.rows,
    packingList: packingList.rows,
    modeOfTransportList: modeOfTransportList.rows,
    // paymentTermList: paymentTermList.rows,
    workCenterList: workCenterList.rows,
    priceBasisList: priceBasisList.rows,
    currencyList: currencyList.rows,
    brandList: brandList.rows,
    // new_po_id: new_po_id,
    allowedDocTypes
  });
});


const getPurchaseOrderDataOnQuery = async (req, res) => {
  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["po_no", "po_date", "v_code", "po_type","c_code"];

  // If any of these searchKeys exist in the query, add them to WHERE clause
  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  // Build WHERE clause dynamically
  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  const { formStatus, appDivisionId, appFinYear, userId } = req?.query;
  let transYear = appFinYear || "2026";
  let divisionId = appDivisionId || 1;
  let user_id = userId || req?.userInfo?.user_id;

  console.log("user_id ::", user_id);
  console.log("req?.userInfo", req?.userInfo);
  console.log("queryValues ::", queryValues); // ✅ helpful for debugging

  let mhmmpoamdData = {};
  let mdmmpoitamdData = [];

  try {
    let recordCount;

    if (whereClauses.length > 0) {
      // ✅ FIX 1: use total_count (was using ?.count which returned undefined)
      const getCount = await db.query(
        `
        SELECT COUNT(po_id) AS total_count
        FROM (
            SELECT po_id, po_no, category, division_id,po_type,po_date,v_code,c_code
            FROM ${TABLE_NAMES.HDR_TABLE}

            UNION ALL

            SELECT po_id, po_no, category, division_id,po_type,po_date,v_code,c_code
            FROM ${TABLE_NAMES.HDR_TABLE_MAIN}
        ) h
        WHERE h.division_id = $1
        ${queryValues}
        `,
        [divisionId],
      );

      recordCount = getCount.rows[0]?.total_count; // ✅ FIXED (was ?.count)
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `
            SELECT COUNT(po_id) AS total_count
            FROM (
                SELECT po_id, category, division_id, po_type, po_date, v_code, c_code
                FROM ${TABLE_NAMES.HDR_TABLE}

                UNION ALL

                SELECT po_id, category, division_id, po_type, po_date, v_code, c_code
                FROM ${TABLE_NAMES.HDR_TABLE_MAIN}
            ) h
            WHERE h.division_id = $1
            `,
            [divisionId],
          );

          recordCount = getCount.rows[0]?.total_count;
          break;
        }

        case "Last":
        default:
          break;
      }
    }

    // ✅ FIX 2: purchaseOrder query now correctly uses queryValues in WHERE
    // and handles ORDER/LIMIT/OFFSET cleanly outside the UNION
    const offset = req.query.offset || 0;

    const purchaseOrder = await db.query(
      `
      SELECT h.*
      FROM (
        SELECT h1.*, t1.term_desc
        FROM ${TABLE_NAMES.HDR_TABLE} h1
        LEFT JOIN mhmmterm t1
          ON t1.term_code = h1.term_code
          AND COALESCE(t1.active, 'N') = 'Y'
        WHERE h1.division_id = $1
        ${queryValues}

        UNION ALL

        SELECT h2.*, t2.term_desc
        FROM ${TABLE_NAMES.HDR_TABLE_MAIN} h2
        LEFT JOIN mhmmterm t2
          ON t2.term_code = h2.term_code
          AND COALESCE(t2.active, 'N') = 'Y'
        WHERE h2.division_id = $1
        ${queryValues}
      ) h
      ORDER BY h.po_date, h.po_no
      LIMIT 1 OFFSET $2
      `,
      [divisionId, offset],
    );

    console.log("user_id and division_id ::", user_id, divisionId);
    console.log("purchaseOrder rows ::", purchaseOrder.rows);

    if (!purchaseOrder.rows.length) {
      return res.status(200).send({
        type: "not found",
        message: "No purchase Order data found",
        count: 0,
      });
    }

    // SET Purchase Order DATA
    mhmmpoamdData = { ...purchaseOrder.rows[0] };

    // fetching po_type value from bulk po creation form for advice column

    // const getAdvice = await db.query(
    //   `
    //   SELECT advice
    //   FROM TOMMPRE_PO_DETAILS
    //   WHERE po_no = $1
    //   LIMIT 1
    //   `,
    //   [mhmmpoamdData.po_no]
    // );

    // const adviceValue = getAdvice.rows[0]?.advice || "N";

    // // agar advice = Y → po_type = A
    // // agar advice = N → po_type = O

    // mhmmpoamdData.po_type =
    //   adviceValue === "Y" ? "A" : "O";

    // // optional debug
    // console.log("adviceValue ::", adviceValue);
    // console.log("updated po_type ::", mhmmpoamdData.po_type);

    // #### Post query logic for mhmmpoamdData ####

    // VENDOR NAME
    const getVendorName = await db.query(
      `SELECT V_NAME FROM MOMMVEND WHERE V_CODE = $1`,
      [mhmmpoamdData.v_code],
    );
    mhmmpoamdData.v_name =
      getVendorName.rowCount > 0 ? getVendorName.rows[0].v_name : null;

    // CUSTOMER NAME
    const getCustomerName = await db.query(
      `SELECT C_NAME FROM MOSMCUST WHERE C_CODE = $1`,
      [mhmmpoamdData.c_code],
    );
    mhmmpoamdData.c_name =
      getCustomerName.rowCount > 0 ? getCustomerName.rows[0].c_name : null;

    // ADVANCE GL ACC NAME
    const getAdvanceGLName = await db.query(
      `SELECT acc_desc FROM MHFMGLM WHERE acc_no = $1`,
      [mhmmpoamdData.adv_gl_acc_no],
    );
    mhmmpoamdData.acc_desc =
      getAdvanceGLName.rowCount > 0 ? getAdvanceGLName.rows[0].acc_desc : null;

    // ADVANCE GL ACC NAME
    const getTermName = await db.query(
      `SELECT term_desc FROM mhmmterm WHERE term_code = $1`,
      [mhmmpoamdData.term_code],
    );
    mhmmpoamdData.term_desc =
      getTermName.rowCount > 0 ? getTermName.rows[0].term_desc : null;

    // TRANSPORTER NAME
    const getTransporterName = await db.query(
      `SELECT TRANSPORTER_NAME FROM MOMMTRANSPORT WHERE TRANSPORTER_CD = $1`,
      [mhmmpoamdData.transport],
    );
    mhmmpoamdData.transporter_name =
      getTransporterName.rowCount > 0
        ? getTransporterName.rows[0].transporter_name
        : "";

    // BUYER
    const getBuyerId = await db.query(
      `SELECT CREATE_ID as Buyer FROM MHMMPOAMD WHERE PO_ID = $1`,
      [mhmmpoamdData.po_id],
    );
    mhmmpoamdData.buyer =
      getBuyerId.rowCount > 0 ? getBuyerId.rows[0].buyer : null;

    const dibuyer = await db.query(
      `SELECT 'Buyer : ' || USER_NAME as DI_BUYER FROM USER_MASTER WHERE USER_ID = $1`,
      [mhmmpoamdData.buyer],
    );
    mhmmpoamdData.di_buyer =
      dibuyer.rowCount > 0 ? dibuyer.rows[0].di_buyer : null;

    // JW FLAG
    const getJwFlag = await db.query(
      `SELECT 'J' as jw_flag FROM MOMMPCAT WHERE USER_CODE = $1 AND PO_CAT_PREFIX = $2`,
      ["JW", mhmmpoamdData.category],
    );
    mhmmpoamdData.jw = getJwFlag.rowCount > 0 ? "J" : "D";

    // const getUserAuthLvlId = await db.query(
    //   `SELECT auth_id1, auth_id2, auth_id3 FROM moitauth WHERE doc_type = 'PO'`,
    // );

    // const getAuthLvlName = await db.query(
    //   `SELECT user_id, user_name from user_master where user_id in (${getUserAuthLvlId.rows[0].auth_id1}, ${getUserAuthLvlId.rows[0].auth_id2}, ${getUserAuthLvlId.rows[0].auth_id3})`,
    // );

    // DISPLAY FLAG
    // if (mhmmpoamdData.cancel_flag === "Y") {
    //   mhmmpoamdData.disp_flag = "Cancelled";
    // } else if (mhmmpoamdData.flag === "Y") {
    //   mhmmpoamdData.disp_flag = "Prepared";
    // }  else if (mhmmpoamdData.flag === "A") {
    //   mhmmpoamdData.disp_flag = "Authorised";
    // } else if (mhmmpoamdData.flag === "P") {
    //   mhmmpoamdData.disp_flag = "Printed";
    // } else if (mhmmpoamdData.flag === "F") {
    //   mhmmpoamdData.disp_flag = "Approved";
    // } else if (mhmmpoamdData.flag === "R") {
    //   mhmmpoamdData.disp_flag = "Refused PO";
    // } else {
    //   mhmmpoamdData.disp_flag = "Unauthorised";
    // }

    // AUTH LEVEL
     const rawPoType = mhmmpoamdData?.po_type;
      const docType = rawPoType === "A" ? "PA" : "PO";

 
    const getAuthLevel = await db.query(
      // `SELECT auth_id1, auth_id2, auth_id3 FROM moitauth WHERE doc_type = $1`,[docType]

      `SELECT auth_id1, auth_id2, auth_id3
FROM moitauth
WHERE doc_type = $1
AND (
    auth_id1 = $2
    OR auth_id2 = $2
    OR auth_id3 = $2
)`,
[docType,user_id]
 );


    console.log("getAuthLevel ::", getAuthLevel.rows);
    console.log("user_id ::", user_id);

    // const { auth_id1, auth_id2, auth_id3 } = getAuthLevel.rows[0];

    let auth_id1 = null;
let auth_id2 = null;
let auth_id3 = null;

if (getAuthLevel.rowCount > 0) {
  ({ auth_id1, auth_id2, auth_id3 } = getAuthLevel.rows[0]);
}


    // FETCH AUTH HISTORY WITH USER NAMES
    const getPoAuthHistory = await db.query(
      `
  SELECT
    m.*,
    u.user_name
  FROM mdmmpoauth m
  LEFT JOIN user_master u
    ON u.user_id = m.auth_id
  WHERE m.po_id = $1
  `,
      [mhmmpoamdData.po_id]
    );

    console.log("getPoAuthHistory :: ", getPoAuthHistory.rows);

    const authHistory = getPoAuthHistory.rows;

    // FIND USERS
    const preparedUser = authHistory.find(
      (r) =>
        r.auth_flag === "Y" &&
        Number(r.auth_id) === Number(auth_id1)
    );

    const authorisedUser = authHistory.find(
      (r) =>
        r.auth_flag === "Y" &&
        Number(r.auth_id) === Number(auth_id2)
    );

    const approvedUser = authHistory.find(
      (r) =>
        r.auth_flag === "Y" &&
        Number(r.auth_id) === Number(auth_id3)
    );

    const refusedUser = authHistory.find(
      (r) => r.refuse_flag === "Y"
    );

    const cancelledUser = authHistory.find(
      (r) => r.cancel_flag === "Y"
    );


    if (mhmmpoamdData.cancel_flag === "Y") {

      mhmmpoamdData.disp_flag =
        `Cancelled By ${cancelledUser?.user_name || ""}`;

    } else if (mhmmpoamdData.flag === "Y") {

      mhmmpoamdData.disp_flag =
        `Prepared By ${preparedUser?.user_name || ""}`;

    } else if (mhmmpoamdData.flag === "A") {

      mhmmpoamdData.disp_flag =
        `Authorised By ${authorisedUser?.user_name || ""}`;

    } else if (mhmmpoamdData.flag === "P") {

      mhmmpoamdData.disp_flag = "Printed";

    } else if (mhmmpoamdData.flag === "F") {

      mhmmpoamdData.disp_flag =
        `Approved By MANOJ GARG`;

    } else if (mhmmpoamdData.flag === "R") {

      mhmmpoamdData.disp_flag =
        `Refused PO By ${refusedUser?.user_name || ""}`;

    } else {

      mhmmpoamdData.disp_flag = "Unauthorised";
    }
    // VENDOR EXCISE / mod_vat_yn
    const getVendorExcise = await db.query(
      `SELECT covered_excise FROM mommvend WHERE v_code = $1`,
      [mhmmpoamdData.v_code],
    );
    const parameter = {};
    parameter.mod_vat_yn =
      getVendorExcise.rowCount > 0 &&
        getVendorExcise.rows[0].covered_excise === "Y"
        ? "Y"
        : "N";
    mhmmpoamdData.parameter = parameter;

    // DIVISION GST
    const getDivisionGst = await db.query(
      `SELECT GST_NO FROM moitdivision WHERE division_id = $1`,
      [divisionId],
    );
    mhmmpoamdData.disp_po_type =
      getDivisionGst.rowCount > 0 && getDivisionGst.rows[0].gst_no
        ? "GST Registered Division"
        : "Non GST Registered Division";

    // #### End of mhmmpoamdData post query logic ####

    // FETCH LINE ITEM DETAILS
    const purchaseOrderDetails = await db.query(
      `
      SELECT * FROM ${TABLE_NAMES.DTL_TABLE} WHERE po_id = $1
      UNION ALL
      SELECT * FROM ${TABLE_NAMES.DTL_TABLE_MAIN} WHERE po_id = $1
      `,
      [mhmmpoamdData.po_id],
    );

    await Promise.all(
      purchaseOrderDetails.rows.map(async (item) => {
        item.row_id = uuidv4();

        const itm = await db.query(
          `SELECT it_name, it_pu_um, COALESCE(std_cost,0) AS std_cost, it_type,
                  old_it_code, it_name_long, HSN_SAC_CODE, UM_CODE AS STOCK_UM, it_wgt_kg,
                   subsidy_yes_no
           FROM mommitem
           WHERE it_code = $1`,
          [item.it_code],
        );

        if (itm.rowCount > 0) {
          const r = itm.rows[0];
          item.desc = r.it_name;
          item.uom = r.it_pu_um;
          item.std_cost = r.std_cost;
          item.it_type = r.it_type;
          item.old_it_code = r.old_it_code;
          item.it_name_long = r.it_name_long;
          item.hsn_sac_code = r.hsn_sac_code;
          item.stock_um = r.stock_um;
          item.it_wgt_kg = r.it_wgt_kg;
          item.subsidy_yes_no = r.subsidy_yes_no;
        }

        // DIRECT ITEM FLAG
        const direct = await db.query(
          `SELECT 'Y' AS direct FROM mommitem i JOIN moitbase t ON i.it_type = t.level1
           WHERE i.it_code = $1 AND UPPER(t.cat_desc) LIKE 'DIRECT%' LIMIT 1`,
          [item.it_code],
        );
        item.direct_item = direct.rowCount > 0 ? "Y" : "N";

        // AMOUNT CALCULATION (Oracle style)
        const qty = Number(item.po_qty_ord || 0);
        const rate = Number(item.po_mat_rat || 0);
        const perUnit = Number(item.po_perunit || 1);
        const discPerc = Number(item.po_disc || 0);
        const discVal = Number(item.po_disc_val || 0);

        const nrt = rate / perUnit;
        const discountPerUnit =
          discPerc !== 0 ? nrt * (discPerc / 100) : discVal;
        const nrate = nrt - discountPerUnit;
        item.amount = Number((nrate * qty).toFixed(2));

        // HSN SAC CODE fallback
        if (!item?.hsn_sac_code) {
          const getHsnSacCode = await db.query(
            `SELECT hsn_sac_code FROM mommitem WHERE it_code = $1`,
            [item.it_code],
          );
          item.hsn_sac_code = getHsnSacCode.rows[0]?.hsn_sac_code || null;
        }

        mdmmpoitamdData.push(item);
      }),
    );



    console.log(
      "auth_id1, auth_id2, auth_id3 ::",
      auth_id1,
      auth_id2,
      auth_id3,
    );

    // let authLevel = 0;
    // if (auth_id1 === user_id) {
    //   authLevel = 1;
    // } else if (auth_id2 === user_id) {
    //   authLevel = 2;
    // } else if (auth_id3 === user_id) {
    //   authLevel = 3;
    // }

    // const getAuthData = await db.query(
    //   `SELECT * FROM mdmmpoauth WHERE po_id = $1`,
    //   [mhmmpoamdData.po_id]
    // );

    // const rawAuthData = getAuthData.rows;

    // const authTabData = {
    //   1: rawAuthData.find((r) => Number(r.auth_id) === Number(auth_id1)) || null,
    //   2: rawAuthData.find((r) => Number(r.auth_id) === Number(auth_id2)) || null,
    //   3: rawAuthData.find((r) => Number(r.auth_id) === Number(auth_id3)) || null,
    // };

    // return res.status(200).json({
    //   type: "found",
    //   purchaseOrder: {
    //     ...mhmmpoamdData,
    //     po_date: dateFormater(mhmmpoamdData?.po_date),
    //     po_eff_dt: dateFormater(mhmmpoamdData?.po_eff_dt),
    //     po_end_dt: dateFormater(mhmmpoamdData?.po_end_dt),
    //     create_date: dateFormater(mhmmpoamdData?.create_date),
    //     authLevel: authLevel,
    //     authTabData: getAuthData.rows,
    //   },
    //   purchaseOrderDetails: [...mdmmpoitamdData],
    //   authTabData: authTabData,
    //   count: recordCount || 0,
    // });

    // FETCH USER NAMES FOR AUTH TABS from USER_MASTER
    const getAuthUserNames = await db.query(
      `SELECT user_id, user_name FROM user_master WHERE user_id IN ($1, $2, $3)`,
      [auth_id1, auth_id2, auth_id3],
    );

    const userNameMap = {};
    getAuthUserNames.rows.forEach((row) => {
      userNameMap[row.user_id] = row.user_name;
    });

    // Tab labels will be user names — fallback to "Auth Tab N" if not found
    // const authTabLabels = {
    //   1: userNameMap[auth_id1] || "Auth Tab 1",
    //   2: userNameMap[auth_id2] || "Auth Tab 2",
    //   3: userNameMap[auth_id3] || "Auth Tab 3",
    // };

    // let authLevel = 0;
    // if (auth_id1 === user_id) {
    //   authLevel = 1;
    // } else if (auth_id2 === user_id) {
    //   authLevel = 2;
    // } else if (auth_id3 === user_id) {
    //   authLevel = 3;
    // }

    let authLevel = 0;

    if (Number(auth_id1) === Number(user_id)) {
      authLevel = 1;
    } else if (Number(auth_id2) === Number(user_id)) {
      authLevel = 2;
    } else if (Number(auth_id3) === Number(user_id)) {
      authLevel = 3;
    }

    const getAuthData = await db.query(
      `SELECT * FROM mdmmpoauth WHERE po_id = $1`,
      [mhmmpoamdData.po_id],
    );

    const rawAuthData = getAuthData.rows;

    const authTabData = {
      1:
        rawAuthData.find((r) => Number(r.auth_id) === Number(auth_id1)) || null,
      2:
        rawAuthData.find((r) => Number(r.auth_id) === Number(auth_id2)) || null,
      3:
        rawAuthData.find((r) => Number(r.auth_id) === Number(auth_id3)) || null,
    };

    // po level charge query
   
   let authTabLabels = {
  1: "Auth Tab 1",
  2: "Auth Tab 2",
  3: "Auth Tab 3",
};

if (auth_id1 && auth_id2 && auth_id3) {
  const getAuthUserNames = await db.query(
    `SELECT user_id, user_name
     FROM user_master
     WHERE user_id IN ($1, $2, $3)`,
    [auth_id1, auth_id2, auth_id3]
  );

  const userNameMap = {};
  getAuthUserNames.rows.forEach((row) => {
    userNameMap[row.user_id] = row.user_name;
  });

  authTabLabels = {
    1: userNameMap[auth_id1] || "Auth Tab 1",
    2: userNameMap[auth_id2] || "Auth Tab 2",
    3: userNameMap[auth_id3] || "Auth Tab 3",
  };
}
   
   
    const getPoLevelCharges = await db.query(
      `SELECT * FROM mdmmpo_po_level_charges WHERE po_id = $1`,
      [mhmmpoamdData.po_id],
    );

    const poLevelChargesData = getPoLevelCharges.rows;

    // check the gate entry done or not
    const getGateEntry = await db.query(
      `SELECT * FROM tdmmrct WHERE po_id = $1 limit 1`,
      [mhmmpoamdData.po_id],
    );

    const isGateEntryDone = getGateEntry.rowCount > 0? true : false;

    return res.status(200).json({
      type: "found",
      purchaseOrder: {
        ...mhmmpoamdData,
        po_date: dateFormater(mhmmpoamdData?.po_date),
        po_eff_dt: dateFormater(mhmmpoamdData?.po_eff_dt),
        po_end_dt: dateFormater(mhmmpoamdData?.po_end_dt),
        create_date: dateFormater(mhmmpoamdData?.create_date),
        authLevel: authLevel,
        authTabData: getAuthData.rows,
      },
      purchaseOrderDetails: [...mdmmpoitamdData],
      poLevelCharges: poLevelChargesData,
      authTabData: authTabData,
      authTabLabels: authTabLabels, // ✅ { 1: "AMIT", 2: "RAHUL", 3: "SURESH" }
      isGateEntryDone: isGateEntryDone,
      count: recordCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal Error" });
  }
};


const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
  } = req?.query;
  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {
    // if (help_list === "vendor") {
    //   const vendorList = await db.query(
    //     `select v_name, v_code, CURR_CD ,substr(GET_FROM_STATE(V_CITY,'C','N'),1,100) City from mommvend  where active = 'Y' order by 1`,
    //   );
    //   return res.status(200).send(vendorList.rows);
    // }
    if (help_list === "vendor") {
      let vendorQuery = "";

      if (form_status === "Search") {
        vendorQuery = `
       SELECT DISTINCT 
      v.v_code,
      v.v_name
    FROM mommvend v
    JOIN (
      SELECT  v_code FROM mhmmpo
      UNION
      SELECT  v_code FROM mhmmpoamd
    ) po ON po.v_code = v.v_code
    ORDER BY v.v_code
    `;
      } else {
        vendorQuery = `
     select v_name, v_code, CURR_CD ,substr(GET_FROM_STATE(V_CITY,'C','N'),1,100) City from mommvend  where active = 'Y' order by 1`;
      }

      const vendorList = await db.query(vendorQuery);
      return res.status(200).send(vendorList.rows);
    } else if (help_list === "payTerm") {
      const payTermList = await db.query(
        `select term_desc, term_code from mhmmterm where coalesce(active, 'N') = 'Y' order by 1`,
      );
      return res.status(200).send(payTermList.rows);
    }
   else if (help_list === "shipTo") {

  let shipToQuery = "";

  if (form_status === "Search") {

    shipToQuery = `
      SELECT DISTINCT
          c.c_code,
          c.c_name,
          d.city,
          d.dealer_code
      FROM mosmcust c
      LEFT JOIN moedmember m
          ON c.c_code = m.member_no
      LEFT JOIN moeddealer d
          ON m.dealer_code = d.dealer_code
      JOIN (
          SELECT c_code FROM mhmmpo
          UNION
          SELECT c_code FROM mhmmpoamd
      ) po
          ON po.c_code = c.c_code
      ORDER BY c.c_name
    `;

  } else {

    shipToQuery = `
      SELECT
          c.c_code,
          c.c_name,
          d.city,
          d.dealer_code
      FROM mosmcust c
      LEFT JOIN moedmember m
          ON c.c_code = m.member_no
      LEFT JOIN moeddealer d
          ON m.dealer_code = d.dealer_code
      ORDER BY c.c_name
    `;
  }

  const shipToList = await db.query(shipToQuery);
  return res.status(200).send(shipToList.rows);
} 
    
    else if (help_list === "AdvanceGL") {
      const payTermList = await db.query(
        `select acc_no, acc_desc from mhfmglm where acc_no like 'L%' order by acc_no `,
      );
      return res.status(200).send(payTermList.rows);
    } else if (help_list === "it_code") {
      //this is for accunt no help in field of acc.no reside in detail block
      
    //   const itemList = await db.query(
    //     // added it_rate column from mdmmvend
    //     `SELECT 
    //     i.it_code,
    //     i.it_name_long,
    //     i.it_name,
    //     i.it_pu_um,
    //     b.cat_desc,
    //     i.subsidy_yes_no as subsidy_applicable,
    //     mv.it_rate
    // FROM moitbase b
    // JOIN mommitem i 
    //     ON i.it_type = b.level1
        
    // LEFT JOIN (
    //     SELECT DISTINCT ON (it_code)
    //         it_code,
    //         it_rate
    //     FROM mdmmvend d1
    //       where rate_eff_dt = (select max(rate_eff_dt) from mdmmvend d2 where d2.it_code = d1.it_code and rate_eff_dt <= $1)
    // ) mv
    // ON mv.it_code = i.it_code

    // WHERE b.level1 IN ('F', 'H', 'G','M')
    //     AND b.level2 IN ('01', '02')
    //     AND b.level3 = '00'
    //     AND COALESCE(i.active, 'N') = 'Y'
    // ORDER BY i.it_name`,[req?.query?.po_eff_dt]
    //   );

    
      const itemList = await db.query(
        // added it_rate column from mdmmvend
        `SELECT
    i.it_code,
    i.it_name_long,
    i.it_name,
    i.it_pu_um,
    b.cat_desc,
    i.subsidy_yes_no,
    mv.it_rate,
    mv.rate_eff_dt
FROM moitbase b
JOIN mommitem i
    ON i.it_type = b.level1

LEFT JOIN (
    -- Latest rate for all items except PT12 and FT12
    SELECT
        d1.it_code,
        d1.it_rate,
        d1.rate_eff_dt
    FROM mdmmvend d1
    WHERE d1.it_code NOT IN ('PT12', 'FT12')
      AND d1.rate_eff_dt = (
            SELECT MAX(d2.rate_eff_dt)
            FROM mdmmvend d2
            WHERE d2.it_code = d1.it_code
              AND d2.rate_eff_dt <= $1
      )

    UNION ALL

    -- All rates for PT12 and FT12
    SELECT
        it_code,
        it_rate,
        rate_eff_dt
    FROM mdmmvend
    WHERE it_code IN ('PT12', 'FT12')
      AND rate_eff_dt <= $1
) mv
ON mv.it_code = i.it_code

WHERE b.level1 IN ('F', 'H', 'G', 'M')
  AND b.level2 IN ('01', '02')
  AND b.level3 = '00'
  AND COALESCE(i.active, 'N') = 'Y'


ORDER BY
    i.it_name,
    mv.rate_eff_dt DESC;`,[req?.query?.po_eff_dt]
      );
      if (itemList.rows.length > 0) {
        res.status(200).json(itemList.rows);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};



const handleValidateVendor = async (req, res) => {
  const { v_code, form_status } = req.query;

  // Skip validation if formStatus is QUERY
  if (form_status === "Query") {
    return res
      .status(200)
      .json({ type: "error", message: "Skipped for Query mode" });
  }

  // Check if v_code is null or empty
  if (!v_code || v_code.trim() === "") {
    return res
      .status(400)
      .json({ type: "error", message: "VENDOR CANNOT BE NULL" });
  }

  try {
    // Get vendor details
    const vendorQuery = await db.query(
      `SELECT v_name, term_code, curr_cd, covered_excise, v_city
       FROM mommvend
       WHERE v_code = $1 AND active = 'Y'`,
      [v_code],
    );

    // Vendor code does not exist
    if (vendorQuery.rowCount === 0) {
      return res.status(404).json({
        type: "error",
        message: "Vendor Code does not exists in the Supplier Master.",
      });
    }

    const vendor = vendorQuery.rows[0];

    // Check if city is defined in supplier master
    const cityQuery = await db.query(
      `SELECT GET_FROM_STATE($1, 'S', 'I') AS city_check`,
      [vendor.v_city],
    );

    if (!cityQuery.rows[0]?.city_check) {
      return res.status(400).json({
        type: "error",
        message: "City is not defined in supplier master",
      });
    }

    // Set term_code only for INSERT mode
    const responseData = {
      v_name: vendor.v_name,
      // curr_cd: vendor.curr_cd,   
      mod_vat_yn: vendor.covered_excise === "Y" ? "Y" : "N",
    };

    if (form_status === "Insert") {
      responseData.term_code = vendor.term_code;
    }

    return res.status(200).json({ data: responseData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message || "Server error during vendor validation",
    });
  }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getPurchaseOrderDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.validateItemForPO = catchAsync(async (req, res) => {
  const {
    it_code,
    v_code,
    po_id,
    division_id,
    trans_year: curryear,
    po_end_dt,
    po_eff_dt,
    wc_id,
    po_type,
    c_code
  } = req.query;

  try {
    // 1. Blank check
    if (!it_code) {
      throw new Error("Item Code cannot be blank");
    }

    // 2. Item exists?
    const item = await db.query(
      // `SELECT it_name, it_pu_um as uom, old_it_code, active,
      //  hsn_sac_code, um_code
      //  FROM mommitem WHERE it_code = $1`,

      `SELECT 
        i.it_name,
        i.it_pu_um AS uom,
        i.old_it_code,
        i.active,
        i.hsn_sac_code,
        i.um_code,
        mv.it_rate,
        i.subsidy_yes_no
        FROM mommitem i
          LEFT JOIN (
    SELECT DISTINCT ON (it_code)
        it_code,
        it_rate
    FROM mdmmvend
    ORDER BY it_code, rate_eff_dt DESC
  ) mv
  ON i.it_code = mv.it_code
        WHERE i.it_code = $1`,

      [it_code],
    );

    if (item.rowCount === 0) {
      throw new Error("Item Not Found in Item Master");
    }

    const itemRow = item.rows[0];

    const po_mat_rat = itemRow.it_rate || null;

    if (itemRow.active === "N") {
      throw new Error("Item is not active");
    }

    // const { rows } = await db.query(
    //   `SELECT HSN_SAC_CODE FROM MOMMITEM WHERE IT_CODE = $1`,
    //   [it_code]
    // );

    // if (rows.length === 0) {
    //   return res.status(200).json({ hsn_sac_code: null });
    // }

    const hsn_sac_code = item.rows[0].hsn_sac_code;
    const response = { hsn_sac_code };

    // Get GST State Code (non-blocking)
    let gst_state_code = null;

    // try {
    // const gstStateQuery = `
    //     SELECT GST_STATE_CODE AS gst_state_code FROM MOITSTATE S 
    //     WHERE TYPE = 'S' AND STATE_ID = (
    //     SELECT NN.STATE_ID FROM MOITDIVISION NN WHERE NN.DIVISION_ID = $1
    //     ) LIMIT 1;
    //   `;

    // const gstStateResult = await db.query(gstStateQuery, [division_id]);

    // gst_state_code = gstStateResult.rows[0]?.gst_state_code || null;

        if(po_type == 'O'){
       const gstStateQuery = `
        SELECT GST_STATE_CODE AS gst_state_code FROM MOITSTATE S 
        WHERE TYPE = 'S' AND STATE_ID = (
        SELECT NN.STATE_ID FROM MOITDIVISION NN WHERE NN.DIVISION_ID = $1
        ) LIMIT 1;
      `;
      const gstStateResult = await db.query(gstStateQuery, [division_id]);
  
      gst_state_code = gstStateResult.rows[0]?.gst_state_code || null;
    }else if(po_type == 'A'){
      const gstStateQuery = `SELECT GST_STATE_CODE AS gst_state_code
        FROM moitstate
        WHERE UPPER(state_name) = (
            SELECT UPPER(c_state)
            FROM mosmcust
            WHERE c_code = $1
        )
        AND TYPE = 'S'`;

      const gstStateResult = await db.query(gstStateQuery, [c_code]);
      gst_state_code = gstStateResult.rows[0]?.gst_state_code || null;

    }

    if (gst_state_code) {
      response.gst_state_code = gst_state_code;
    }

    // Call pm_po_fill_gst_dtl_itemwise (non-blocking)
    if (hsn_sac_code && gst_state_code) {
      // try {
      const gstDetailQuery = `
          SELECT * FROM pm_po_fill_gst_dtl_itemwise($1, $2, NULL, $3, 0, $4)
        `;
      const { rows: gstRows } = await db.query(gstDetailQuery, [
        hsn_sac_code,
        v_code, // bill_to_code assumed as c_code
        it_code,
        gst_state_code,
      ]);

      if (gstRows.length > 0) {
        const {
          gst_sgst_val,
          gst_sgst_cess_val,
          gst_cgst_val,
          gst_cgst_cess_val,
          gst_igst_val,
          gst_igst_cess_val,
          gst_ugst_val,
          gst_ugst_cess_val,
        } = gstRows[0];

        Object.assign(response, {
          gst_sgst_val,
          gst_sgst_cess_val,
          gst_cgst_val,
          gst_cgst_cess_val,
          gst_igst_val,
          gst_igst_cess_val,
          gst_ugst_val,
          gst_ugst_cess_val,
        });

        // lets
      }
      // } catch (err) {
      //   console.error("GST detail function call failed:", err.message);
      //   // throw new Error(err)
      // }
    }

    // 3. Vendor state mapping
    const vendState = await db.query(
      `SELECT get_from_state(v_city,'S','I') AS state_id FROM mommvend WHERE v_code = $1`,
      [v_code],
    );

    if (vendState.rowCount === 0 || !vendState.rows[0].state_id) {
      throw new Error("Vendor City is not defined in Supplier Master");
    }

    const divisionState = await db.query(
      `SELECT state_id FROM moitdivision WHERE division_id = $1`,
      [division_id],
    );

    if (divisionState.rowCount === 0) {
      throw new Error("State is not defined in Division Master");
    }

    const rgType =
      vendState.rows[0].state_id === divisionState.rows[0].state_id ? "L" : "C";

    // // 4. Duplicate item check (same PO)
    // const dup = await db.query(
    //   `SELECT 1 FROM mdmmpoitamd WHERE po_id = $1 AND it_code = $2 AND COALESCE(active,'N') = 'Y' `,
    //   [po_id, it_code]
    // );

    // if (dup.rowCount > 0) {
    //   return res.json({
    //     success: false,
    //     message: "Item already exists in this PO",
    //   });
    // }

    // todo implement the duplicate item check in frontend!

    // 5. Store validation
    console.log(wc_id, it_code, curryear);
    const store = await db.query(
      `SELECT 1 FROM mommstok WHERE wc_id = $1
       AND it_code = $2
       AND trans_year = $3`,
      [wc_id, it_code, curryear],
    );

    if (store.rowCount === 0) {
      throw new Error("Item does not exist for Store selected in PO");
    }

    // 6. Vendor contract rate (quotation)
    // const qut = await db.query(
    //   `SELECT approved_rate
    //    FROM mdmmqut d
    //    JOIN mhmmqut h ON h.quot_id = d.quot_id
    //    WHERE h.v_code = $1
    //    AND d.it_code = $2
    //    AND d.eff_date <= $3
    //    AND d.auth_flag='Y'
    //    ORDER BY d.eff_date DESC LIMIT 1`,
    //   [v_code, it_code, po_eff_dt],
    // );

    // const po_mat_rat = qut.rowCount ? qut.rows[0].approved_rate : null;

    // Return final object
    return res.json({
      type: "success",
      data: {
        ...response,
        desc: itemRow.it_name,
        uom: itemRow.uom,
        old_it_code: itemRow.old_it_code,
        hsn_sac_code: itemRow.hsn_sac_code,
        stock_um: itemRow.um_code,
        // it_rate: itemRow.it_rate,
        subsidy_yes_no: itemRow.subsidy_yes_no,
        po_mat_rat,
        rg_type: rgType,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({
      type: "Error",
      message: err.message || "Internal Server Error",
    });
  }
});

exports.handleValidate = catchAsync(async (req, res, next) => {
  if (req?.query?.fname === "v_code") {
    handleValidateVendor(req, res);
  }

  if (req?.query?.fname === "it_code") {
    // Implement it_code validation logic here
  }
});

exports.handleSubmitData = catchAsync(async (req, res) => {
  const { formHdrData, formItemData, formChargesData } = req.body;
  const { userId, form_status } = req?.query;

  console.log("formHdrData ::", formHdrData);

  console.log("formItemData ::", formItemData);

  console.log("formChargesData ::", formChargesData);

  let { division_id, trans_year } = formHdrData;
  // formHdrData.inv_id = Number(formHdrData?.inv_no.substring(1));
  // formHdrData.c_code = formHdrData?.party_code;

  // division_id = 1
  // trans_year = '2026'
  // check validation
  if (!division_id && !trans_year) {
    return res.status(400).json({
      type: "error",
      message: `division id and trans year not selected`,
    });
  }

  if (form_status !== "Insert") {
    return res.status(400).json({
      type: "error",
      message: `Cannot submit data please do press Insert`,
    });
  }

  if (!formItemData.length) {
    return res
      .status(400)
      .json({ type: "error", message: "Please fill Item details" });
  }

  if (!formChargesData.length) {
    return res
      .status(400)
      .json({ type: "error", message: "Please fill PO Level details" });
  }

  try {
    await db.query("BEGIN");

    // Get Purchase Order Id from formHdrData
    // const poId = formHdrData?.po_id;

    // // Generate Purchase Order No
    // const { po_id } = formHdrData;

    
    const getPoId = await db.query(
      `SELECT nextval('s_mhmmpo_po_id') as po_id`
    );

    const generatedPoId = Number(getPoId.rows[0]?.po_id);

    formHdrData.po_id = generatedPoId;

    const genPONo = await db.query(
      `select genpono_indica($1,$2,$3,$4) as po_no`,
      [
        formHdrData?.category,
        formHdrData?.po_eff_dt,
        '2026',  // hardcoded by amit
        1
        // formHdrData?.trans_year,
        // formHdrData?.division_id,
      ],
    );
    formHdrData.po_no = genPONo.rows[0]?.po_no;

    //Insert (MHMMPOAMD) data logic
    let getTransFormData = transformMhmmpoamd(formHdrData);

    const insertHdrQuery = generateSingleInsertQuery(
      TABLE_NAMES.HDR_TABLE,
      getTransFormData,
      "create_date",
    );

    const insertHdrValues = Object.values(getTransFormData);

    // -- ######## inserting query #########
    await db.query(insertHdrQuery, insertHdrValues);

    // Insert (MDSMINV) data logic
    const getTransFormDetailData = transformMdmmpoitamd(
      formItemData,
      formHdrData?.po_id,
      userId,
    );

    for (const record of getTransFormDetailData) {
      // const getSrlNoSeq = await db.query(`SELECT ${TABLE_NAMES.GEN_SRL_NO}`);
      // record.sr_no = Number(getSrlNoSeq.rows[0]?.nextval);

      const insertDetailQuery = generateSingleInsertQuery(
        TABLE_NAMES.DTL_TABLE,
        record,
        "create_date",
      );

      // console.log(insertDetailQuery, Object.values(record));
      await db.query(insertDetailQuery, Object.values(record));
    }

    // Insert PO_LEVEL_CHARGE

    const getTransFormChargesData = formChargesData.map(
      (item) => transPOLevelChargeToDbData(item, formHdrData?.po_id), //  PASS HERE
    );

    for (const record of getTransFormChargesData) {
      const insertChargesQuery = generateSingleInsertQuery(
        TABLE_NAMES.PO_LEVEL_CHARGE,
        record,
      );

      await db.query(insertChargesQuery, Object.values(record));
    }

    console.log(
      "PROC PARAMS:",
      formHdrData?.po_id,
      formHdrData?.amd_no,
      formHdrData?.flag,
    );

    // ## create po in mhmmpo and in mdmmpo
    // await db.query("call create_po_in_mhmmpo($1,$2,$3)", [
    //   formHdrData?.po_id,
    //   formHdrData?.amd_no,
    //   formHdrData?.flag,
    // ]);

    await db.query("commit");

    res.status(200).send({
      type: "success",
      message: "record successfully saved",
      genPoNo: genPONo.rows[0]?.po_no,
    });
  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");
    return res.status(400).json({
      type: "error",
      message: error.message || "internal server error",
    });
  }
});

exports.updatePurchaseOrder = catchAsync(async (req, res) => {
  const {
    po_id,
    changedHdrFields,
    changedItemRows,
    deletedItemData,
    newItemRows, //  NEW
    formChargesData,
  } = req.body;

  console.log("REQ QUERY =>", req.query);
console.log("USER ID =>", req.query.userId);

  if (!po_id) {
    return res.status(400).json({ type: "error", message: "PO ID missing" });
  }

  if (
    (!changedHdrFields || !Object.keys(changedHdrFields).length) &&
    (!changedItemRows || !changedItemRows.length) &&
    (!deletedItemData || !deletedItemData.length) &&
    (!newItemRows || !newItemRows.length) &&
    (!formChargesData || !formChargesData.length)
  ) {
    return res.status(400).json({
      type: "error",
      message: "No updates found to process",
    });
  }

  try {
    await db.query("BEGIN");

    // 1️⃣ HEADER UPDATE
    if (changedHdrFields && Object.keys(changedHdrFields).length) {
      const validHdrUpdates = Object.fromEntries(
        Object.entries(changedHdrFields).filter(([key]) =>
          PO_HDR_VALID_COLUMNS.includes(key),
        ),
      );

    validHdrUpdates.update_id = Number(req.query.userId);
    validHdrUpdates.update_date = new Date();

      if (Object.keys(validHdrUpdates).length) {
        const columns = Object.keys(validHdrUpdates);
        const values = Object.values(validHdrUpdates);

        const setClause = columns.map((col, i) => `${col}=$${i + 1}`).join(",");

        await db.query(
          `UPDATE ${TABLE_NAMES.HDR_TABLE}
           SET ${setClause}
           WHERE po_id=$${columns.length + 1}`,
          [...values, po_id],
        );
      }
    }

    // 2️⃣ DELETE REMOVED ROWS
    if (Array.isArray(deletedItemData) && deletedItemData.length) {
      for (const { it_code } of deletedItemData) {
        if (!it_code) continue;

        await db.query(
          `DELETE FROM ${TABLE_NAMES.DTL_TABLE}
           WHERE po_id=$1 AND it_code=$2`,
          [po_id, it_code],
        );
      }
    }

    // 3️⃣ UPDATE CHANGED ROWS
    if (Array.isArray(changedItemRows) && changedItemRows.length) {
      for (const row of changedItemRows) {
        const { it_code, original_it_code, ...rest } = row;

        if (!it_code && !original_it_code) continue;

        const validDtlUpdates = Object.fromEntries(
          Object.entries(rest).filter(([key]) =>
            PO_DTL_VALID_COLUMNS.includes(key),
          ),
        );

        // amount payload me aata hai, DB me amount column nahi hai.
        // isliye usi value ko it_taxable_val me save kar dI HAI  .
        if (rest.amount !== undefined && rest.amount !== null) {
          validDtlUpdates.it_taxable_val = Number(rest.amount);
        }

     validDtlUpdates.update_id = Number(req.query.userId);
     validDtlUpdates.update_date = new Date();  

        // 🔥 Handle IT_CODE change
        if (it_code && original_it_code && it_code !== original_it_code) {
          validDtlUpdates.it_code = it_code;
        }

        if (!Object.keys(validDtlUpdates).length) continue;

        const columns = Object.keys(validDtlUpdates);
        const values = Object.values(validDtlUpdates);

        const setClause = columns.map((col, i) => `${col}=$${i + 1}`).join(",");

        await db.query(
          `UPDATE ${TABLE_NAMES.DTL_TABLE}
           SET ${setClause}
           WHERE po_id=$${columns.length + 1}
           AND it_code=$${columns.length + 2}`,
          [
            ...values,
            po_id,
            original_it_code || it_code, // 🔥 GOLD LINE
          ],
        );
      }
    }

    // 4️⃣ 🔥 INSERT NEW ROWS (MOST IMPORTANT PART)
    if (Array.isArray(newItemRows) && newItemRows.length) {
      for (const row of newItemRows) {
        const validInsertData = Object.fromEntries(
          Object.entries(row).filter(([key]) =>
            PO_DTL_VALID_COLUMNS.includes(key),
          ),
        );

        if (!Object.keys(validInsertData).length) continue;

        // 🔥 MASTER-DETAIL LINK
        validInsertData.po_id = po_id;

        validInsertData.create_id = Number(req.query.userId);
        validInsertData.update_id = null;


        const insertQuery = generateSingleInsertQuery(
          TABLE_NAMES.DTL_TABLE,
          validInsertData,
          "create_date",
        );
        await db.query(insertQuery, Object.values(validInsertData));
      }
    }

    // 5️⃣  UPDATE PO LEVEL CHARGES (DYNAMIC)

    if (Array.isArray(formChargesData) && formChargesData.length) {
      // DELETE OLD
      await db.query(`DELETE FROM mdmmpo_po_level_charges WHERE po_id = $1`, [
        po_id,
      ]);

      // INSERT NEW (dynamic)
      for (const row of formChargesData) {
        const transformedRow = transPOLevelChargeToDbData(row, po_id);

        const insertQuery = generateSingleInsertQuery(
          TABLE_NAMES.PO_LEVEL_CHARGE,
          transformedRow,
        );

        await db.query(insertQuery, Object.values(transformedRow));
      }
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "PO updated successfully",
    });
  } catch (error) {
    console.error("Update PO Error:", error);
    await db.query("ROLLBACK");

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});



exports.printPO = catchAsync(async (req, res) => {
  const { po_id, po_no } = req.body;

  let ref_id;

  try {
    if (!po_id) {
      return res.status(400).json({ error: "Missing po_id" });
    }

    const genPoRefId = await db.query(
      `select nextval('s_mhmmpo_print_temp_rep_id') as ref_id`,
    );

    if (genPoRefId.rowCount === 0) {
      throw new Error("Failed to generate PO reference ID For Print");
    }

    ref_id = Number(genPoRefId.rows[0].ref_id);

    // calling procedure to insert data in temp table for print based on po_id and generated ref_id
    console.log(ref_id, 1, po_no, po_no, "N", "Y", "N", "F", null);

    await db.query(
      `call fill_data_4_po_print($1, $2, $3, $4, 'N','Y','N','F', null)`,
      [ref_id, 1, po_no, po_no],
    );
  } catch (error) {
    console.error("Error generating PO reference ID:", error.message);
    return res
      .status(500)
      .json({ error: error.message || "Error generating PO reference ID" });
  }

  const reportName = "po_print";
  const baseOutputName = `${reportName}_${ref_id}`;
  const outputFilename = `${baseOutputName}.pdf`;

  const JAR_PATH = path.resolve(
    __dirname,
    "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
  );

  console.log("JAR PATH:", JAR_PATH);

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../../reportGeneration/reports/",
  );

  console.log(" REPORT_DIR:", REPORT_DIR);

  const finalPdfPath = path.join(REPORT_DIR, outputFilename);

  // Params passed as Jasper parameters only
  const params = {
    PREP_ID: { type: "Long", value: ref_id },
  };

  const paramString = Object.entries(params)
    .map(([key, { type, value }]) => `${key}=${type}:${value}`)
    .join(" ");

  // ✅ Pass outputFileName as a separate CLI argument (not Jasper param)
  const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

  // console.log(`🖨 Generating Service Invoice: ${outputFilename}`);
  exec(
    command,
    {
      cwd: path.dirname(JAR_PATH),
      shell: "C:\\Windows\\System32\\cmd.exe",
    },
    (error, stdout, stderr) => {
      // console.log(stdout);
      if (error || stderr) {
        console.error(
          "❌ Error generating PO print:",
          error?.message || stderr,
        );
        return res.status(500).json({ error: "Error generating PO Print" });
      }

      setTimeout(() => {
        if (!fs.existsSync(finalPdfPath)) {
          console.error("Generated PDF not found:", finalPdfPath);
          return res.status(500).json({ error: "Generated PDF not found" });
        }

        // console.log(`✅ Service Invoice Ready: ${finalPdfPath}`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${outputFilename}"`,
        );
        return res.sendFile(finalPdfPath);
      }, 400);
    },
  );
});

const generatePOPdf = async (po_id, po_no) => {
  try {
    const genPoRefId = await db.query(
      `select nextval('s_mhmmpo_print_temp_rep_id') as ref_id`,
    );

    const ref_id = genPoRefId.rows[0].ref_id;

    await db.query(
      `call fill_data_4_po_print($1, $2, $3, $4, 'N','Y','N','F', null)`,
      [ref_id, 1, po_no, po_no],
    );

    const reportName = "po_print";
    const baseOutputName = `${reportName}_${ref_id}`;
    const outputFilename = `${baseOutputName}.pdf`;

    const REPORT_DIR = path.resolve(
      __dirname,
      "../../../../../reportGeneration/reports/",
    );

    const finalPdfPath = path.join(REPORT_DIR, outputFilename);

    const params = {
      PREP_ID: { type: "Long", value: ref_id },
    };

    const paramString = Object.entries(params)
      .map(([key, { type, value }]) => `${key}=${type}:${value}`)
      .join(" ");

    const command = `java -jar "${JAR_PATH}" reportName=${reportName} outputFileName=${baseOutputName} ${paramString}`;

    // 🔥 Wrap exec in Promise
    await new Promise((resolve, reject) => {
      exec(
        command,
        {
          cwd: path.dirname(JAR_PATH),
          shell: "C:\\Windows\\System32\\cmd.exe",
        },
        (error, stdout, stderr) => {
          if (error || stderr) {
            return reject(error || new Error(stderr));
          }

          // wait for file creation
          setTimeout(() => {
            if (!fs.existsSync(finalPdfPath)) {
              return reject(new Error("Generated PDF not found"));
            }
            resolve();
          }, 500);
        },
      );
    });

    // ✅ NOW this actually returns correctly
    return finalPdfPath;
  } catch (err) {
    console.error("PDF Generation Error:", err.message);
    throw err;
  }
};



exports.authorizePo = catchAsync(async (req, res, next) => {
  const { po_id, auth_level, authData, user_id, po_no } = req.body;

  console.log("AUTH API INPUT ::", req.body);

  // 🧠 Default remarks
  if (!authData?.auth_remarks) {
    if (auth_level == 1) authData.auth_remarks = "PREPARED";
    else if (auth_level == 2) authData.auth_remarks = "CHECKED";
    else if (auth_level == 3) authData.auth_remarks = "APPROVED";
  }

  if (!po_id) {
    return res.status(400).json({
      type: "error",
      message: "Missing po_id",
    });
  }

  

  try {
    await db.query("BEGIN");
 // this variable already define below poInfo now i comment below and write here
        const poInfo = await db.query(
      `
      SELECT po_type
      FROM mhmmpoamd
      WHERE po_id = $1
      `,
      [po_id]
      );

  const rawPoType = poInfo.rows[0]?.po_type;
  const docType = rawPoType === "A" ? "PA" : "PO"; // ✅ correct mapping

  // const authRes = await db.query(
  // `
  //   SELECT auth_id1, auth_id2
  //   FROM moitauth
  //   WHERE doc_type = $1
  //     AND active = 'Y'
  //   `,
  //   [docType]
  // );

  // added by akshay 31-07-26

  const authRes = await db.query(
      `
      SELECT auth_id1, auth_id2
      FROM moitauth
      WHERE doc_type = $1
      AND active='Y'
      AND (
            auth_id1 = $2
        OR auth_id2 = $2
      )
      LIMIT 1
      `,
      [ docType, user_id ]
      );

    const skipLevel2 =
      docType === "PO" &&
      Number(authRes.rows[0]?.auth_id1) ===
      Number(authRes.rows[0]?.auth_id2);

    // 🎯 FLAG LOGIC
    let finalFlag = "N";

    // REFUSE
    if (authData?.refuse_flag === "Y") {

      finalFlag = "R";

      // AUTHORIZE
    // } else if (authData?.auth_flag === "Y") {

    //   if (auth_level == 1) {
    //     finalFlag = "Y";
    //   } else if (auth_level == 2) {
    //     finalFlag = "A";
    //   } else if (auth_level == 3) {
    //     finalFlag = "F";
    //   }

    // }

     // AUTHORIZE
    } else if (authData?.auth_flag === "Y") {

  if (auth_level == 1) {

    finalFlag = skipLevel2 ? "A" : "Y";

  } else if (auth_level == 2) {

    finalFlag = "A";

  } else if (auth_level == 3) {

    finalFlag = "F";

  }

}

    // 🧠 CHECK EXISTING
    const existingAuth = await db.query(
      `SELECT * FROM mdmmpoauthamd 
       WHERE po_id = $1 AND auth_id = $2`,
      [po_id, user_id],
    );

    
    // added  by akahay 23-06-2026

//     if (
//   auth_level == 2 &&
//   existingAuth.rows.length > 0 &&
//   existingAuth.rows[0].auth_flag === "Y"
// ) {
//   await db.query("ROLLBACK");

//   return res.status(400).json({
//     type: "error",
//     message:
//       "Level2 already approved this PO. Mail not sent again Level3"
//   });
// }

    // added  by akahay 22-06-2026
 if (
  authData?.auth_flag === "Y" &&
  existingAuth.rows.length > 0 &&
  existingAuth.rows[0].auth_flag === "Y"
) {
  await db.query("ROLLBACK");

  return res.status(400).json({
    type: "error",
    message: "You have already authorized this PO."
  });
}


    if (existingAuth.rows.length > 0) {
      await db.query(
        `UPDATE mdmmpoauthamd SET
          auth_flag = $1,
          auth_date = $2,
          auth_remarks = $3,
          refuse_flag = $4,
          refuse_date = $5,
          refuse_remarks = $6,
          cancel_flag = $7,
          cancel_date = $8,
          cancel_remarks = $9
        WHERE po_id = $10 AND auth_id = $11`,
        [
          authData?.auth_flag || "N",
          authData?.auth_date || null,
          authData?.auth_remarks || null,
          authData?.refuse_flag || "N",
          authData?.refuse_date || null,
          authData?.refuse_remarks || null,
          authData?.cancel_flag || "N",
          authData?.cancel_date || null,
          authData?.cancel_remarks || null,
          po_id,
          user_id,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO mdmmpoauthamd (
          po_id,
          auth_id,
          auth_flag,
          auth_date,
          auth_remarks,
          refuse_flag,
          refuse_date,
          refuse_remarks,
          cancel_flag,
          cancel_date,
          cancel_remarks,
          ref_id,
          amd_no
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )`,
        [
          po_id,
          user_id,
          authData?.auth_flag || "N",
          authData?.auth_date || null,
          authData?.auth_remarks || null,
          authData?.refuse_flag || "N",
          authData?.refuse_date || null,
          authData?.refuse_remarks || null,
          authData?.cancel_flag || "N",
          authData?.cancel_date || null,
          authData?.cancel_remarks || null,
          1,
          0,
        ],
      );
    }

    // 🔄 If level 2 or 3 REFUSES, reset all lower-level authorizations to "N"
    if (authData?.refuse_flag === "Y" && (auth_level == 2 || auth_level == 3)) {
      await db.query(
        `
        UPDATE mdmmpoauthamd
        SET
          auth_flag = 'N',
          auth_date = NULL
        WHERE po_id = $1
          AND auth_id <> $2
        `,
        [po_id, user_id]
      );

    }

    // 🧾 UPDATE FLAGS USING FINAL FLAG
    // await db.query(`UPDATE mhmmpoamd SET flag = $1 WHERE po_id = $2`, [
    //   finalFlag,
    //   po_id,
    // ]);
    // 🧾 UPDATE FLAGS
    await db.query(
      `
  UPDATE mhmmpoamd
  SET
    flag = $1,
    cancel_flag = $2
  WHERE po_id = $3
  `,
      [
        finalFlag,
        authData?.cancel_flag || "N",
        po_id,
      ]
    );

    // ⚙️ CALL PROCEDURE ONLY AT FINAL LEVEL
    if (auth_level == 3 && finalFlag === "F") {
      await db.query(`CALL create_po_in_mhmmpo($1,$2,$3)`, [po_id, 0, "F"]);

      // await db.query(`UPDATE mhmmpo SET flag = $1 WHERE po_id = $2`, [
      //   finalFlag,
      //   po_id,
      // ]);
    }

    await db.query("COMMIT");

       // ## sending the mails to the vendor of there authorized po's
    
        // if (email_po_ids.length > 0) {
        //   console.log('email_po_ids for email from authorisation handler:: ', email_po_ids), 
        //   await queuePOAuthorizationNotifications(
        //       email_po_ids
        //   );
        // }

        if (auth_level == 3 && finalFlag === "F") {
          try {
            await queuePOAuthorizationNotifications([po_id]);
          } catch (err) {
            console.error("Vendor email failed:", err.message);
          }
        }

      //   const poInfo = await db.query(
  //     `
  //     SELECT po_type
  //     FROM mhmmpoamd
  //     WHERE po_id = $1
  //     `,
  //     [po_id]
  //     );

  // const rawPoType = poInfo.rows[0]?.po_type;
  // const docType = rawPoType === "A" ? "PA" : "PO"; // ✅ correct mapping



    // 🚀 BACKGROUND TASK (DO NOT BLOCK API)
    (async () => {
      try {
        const pdfPath = await generatePOPdf(po_id, po_no);

      await sendNextAuthMail({
          po_id,
          po_no,
          auth_level,
          finalFlag,
          pdfPath, // ✅ send file directly
          docType,
            actionType:
    authData?.cancel_flag === "Y"
      ? "cancel"
      : authData?.refuse_flag === "Y"
        ? "refuse"
        : "approve",
         remarks:
  authData?.auth_remarks ||
  authData?.refuse_remarks ||
  authData?.cancel_remarks ||
  "",
  actionUserId: user_id,
        });
      } catch (err) {
        console.error("Mail/PDF error:", err.message);
      }
    })();

 // added  by akahay 22-06-2026
    const getUserName = await db.query(
      `SELECT user_name 
      FROM user_master 
      WHERE user_id = $1`,
      [user_id]
    );

    const userName = getUserName.rows[0]?.user_name || "";

    let disp_flag = "";

if (authData?.cancel_flag === "Y") {
  disp_flag = `Cancelled By ${userName}`;
} else if (authData?.refuse_flag === "Y") {
  disp_flag = `Refused PO By ${userName}`;
} else if (authData?.auth_flag === "Y") {
  if (auth_level == 1) {
    disp_flag = `Prepared By ${userName}`;
  } else if (auth_level == 2) {
    disp_flag = `Authorised By ${userName}`;
  } else if (auth_level == 3) {
    disp_flag = `Approved By ${userName}`;
  }
}

    return res.status(200).json({
      type: "success",
      message: `PO authorized successfully at level ${auth_level}`,
      disp_flag
    });
  } catch (error) {
    await db.query("ROLLBACK");

    console.error("❌ Error authorizing PO:", error.message);

    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
});

exports.handleEmailAuthAction = catchAsync(async (req, res) => {
  const { token, action } = req.query;

  // console.log("cancel button action", action)

  if (!token) {
    return res.send("❌ Invalid or missing token");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.send("❌ Link expired or invalid");
  }

  const { po_id, level, user_id } = decoded;

  if (!po_id || !level || !action) {
    return res.send("❌ Invalid request");
  }


    const poInfo = await db.query(
      `
      SELECT po_no, po_type
      FROM mhmmpoamd
      WHERE po_id = $1
      `,
      [po_id]
    );

    if (poInfo.rowCount === 0) {
      throw new Error("PO not found");
    }

    const { po_no, po_type } = poInfo.rows[0];

  
  try {
    await db.query("BEGIN");



    // added by aksahy 23-06-26
    const existingApproval = await db.query(
  `
  SELECT auth_flag
  FROM mdmmpoauthamd
  WHERE po_id = $1
    AND auth_id = $2
  `,
  [po_id, user_id]
);

if (
  action === "approve" &&
  existingApproval.rowCount > 0 &&
  existingApproval.rows[0].auth_flag === "Y"
) {
  await db.query("ROLLBACK");

  return res.send(`
    <div style="font-family: Arial; text-align:center; padding:20px;">
      <h2>⚠️ Already Approved</h2>
      <p>You have already approved this PO.</p>
    </div>
  `);
}

   const docType =
  po_type === "A"   // ✅ was "PA" before, now corrected
    ? "PA"
    : "PO";

    // // 🔐 1. VALIDATE USER AGAINST AUTH MATRIX
    // const authRes = await db.query(
    //   `SELECT auth_id1, auth_id2, auth_id3 
    //    FROM moitauth 
    //    WHERE doc_type='PO' AND ref_id=1`,
    // );

    // const authRes = await db.query(
    //   `
    //   SELECT auth_id1, auth_id2, auth_id3
    //   FROM moitauth
    //   WHERE doc_type = $1
    //     AND active = 'Y'
    //   `,
    //   [docType]
    // );

     const authRes = await db.query(
      `
      SELECT auth_id1, auth_id2, auth_id3
      FROM moitauth
      WHERE doc_type = $1
        AND active = 'Y'
        AND (
            (auth_id1 = $2 AND $3 = 1)
          OR (auth_id2 = $2 AND $3 = 2)
          OR (auth_id3 = $2 AND $3 = 3)
        )
      LIMIT 1
      `,
      [docType, user_id, level]
    );

    if (authRes.rowCount === 0) {
      throw new Error(
        `Authorization matrix not found for ${docType}`
      );
    }

    const { auth_id1, auth_id2, auth_id3 } = authRes.rows[0];

    let validUser = false;

    if (level == 1 && user_id == auth_id1) validUser = true;
    if (level == 2 && user_id == auth_id2) validUser = true;
    if (level == 3 && user_id == auth_id3) validUser = true;

    if (!validUser) {
      await db.query("ROLLBACK");
      return res.send("❌ Unauthorized action");
    }

    // 🎯 2. PREPARE AUTH DATA
    let authData = {
      auth_flag: "N",
      refuse_flag: "N",
      cancel_flag: "N",
      auth_date: new Date(),
    };

    if (action === "approve") authData.auth_flag = "Y";
    if (action === "refuse") authData.refuse_flag = "Y";
    if (action === "cancel") authData.cancel_flag = "Y";

    // 🎯 3. FLAG LOGIC
    let finalFlag = "N";
    let cancelFinalFlag ="N";

    if (action === "approve") {
      if (level == 1) finalFlag = "Y";
      else if (level == 2) finalFlag = "A";
      else if (level == 3) finalFlag = "F";
    }

    if (action === "refuse") finalFlag = "R";
    if (action === "cancel") finalFlag = "C";
    if (finalFlag === "C") cancelFinalFlag = "Y";

    // 🧠 4. UPSERT AUTH TABLE
    await db.query(
      `INSERT INTO mdmmpoauthamd 
    (po_id, auth_id, auth_flag, auth_date, refuse_flag, cancel_flag, ref_id, amd_no)
   VALUES ($1,$2,$3,$4,$5,$6,1,0)
   ON CONFLICT (po_id, amd_no, auth_id)
   DO UPDATE SET
     auth_flag = EXCLUDED.auth_flag,
     auth_date = EXCLUDED.auth_date,
     refuse_flag = EXCLUDED.refuse_flag,
     cancel_flag = EXCLUDED.cancel_flag`,
      [
        po_id,
        user_id,
        authData.auth_flag,
        authData.auth_date,
        authData.refuse_flag,
        authData.cancel_flag,
      ],
    );

    // 🧾 5. UPDATE MAIN TABLE
    await db.query(`UPDATE mhmmpoamd SET flag = $1, cancel_flag= $2 WHERE po_id = $3`, [
      finalFlag,
      cancelFinalFlag,
      po_id,
    ]);

    // (optional but recommended)
    await db.query(`UPDATE mhmmpo SET flag = $1 WHERE po_id = $2`, [
      finalFlag,
      po_id,
    ]);

    // ⚙️ 6. FINAL LEVEL PROCESS
    if (level == 3 && finalFlag === "F") {
      await db.query(
        `CALL create_po_in_mhmmpo($1::bigint,$2::smallint,$3::character varying)`,
        [po_id, 0, "F"],
      );
    }

    await db.query("COMMIT");

    // 📦 7. FETCH PO NUMBER FOR MAIL
    const poRes = await db.query(
      `SELECT po_no FROM mhmmpoamd WHERE po_id = $1`,
      [po_id],
    );


    const po_no = poRes.rows[0]?.po_no;
    // 📩 8. SEND NEXT LEVEL MAIL
    // await sendNextAuthMail({
    //   po_id,
    //   po_no,
    //   auth_level: Number(level),
    //   finalFlag,
    //   pdfPath: null,
    // });


//  Vendor mail only after final approval
if (level == 3 && finalFlag === "F") {
  try {
    const emailJobs = await queuePOAuthorizationNotifications([po_id]);

    console.log(
      "📧 Vendor authorization mail jobs:",
      emailJobs
    );
  } catch (mailErr) {
    console.error(
      "❌ Vendor authorization mail error:",
      mailErr.message
    );
  }
}


    const pdfPath = await generatePOPdf(po_id, po_no);

    await sendNextAuthMail({
      po_id,
      po_no,
      auth_level: Number(level),
      finalFlag,
      pdfPath,
      actionType:
    authData?.cancel_flag === "Y"
      ? "cancel"
      : authData?.refuse_flag === "Y"
        ? "refuse"
        : "approve",

  remarks:
    authData?.auth_remarks ||
    authData?.refuse_remarks ||
    authData?.cancel_remarks ||
    "",
    actionUserId: user_id,
    docType,
    });

    return res.send(`
      <div style="font-family: Arial; text-align:center; padding:20px;">
        <h2>✅ Action Completed</h2>
        <p>PO <b>${action.toUpperCase()}</b> successfully.</p>
      </div>
    `);
  } catch (err) {
    await db.query("ROLLBACK");

    console.error("❌ Email Action Error:", err.message);

    return res.send(`
      <div style="font-family: Arial; text-align:center; padding:20px;">
        <h2>❌ Error</h2>
        <p>${err.message}</p>
      </div>
    `);
  }
});

exports.getChargesMasterOnly = catchAsync(async (req, res) => {
  try {
    const query = `
      SELECT chg_component
      FROM mommpo_level_charges_master
    `;

    const result = await db.query(query);

    const order = [
      "BASIC VALUE",
      "PACKING & FORWARDING",
      "FREIGHT FIXED",
      "AGENCY COMMISSION",
      "INSURANCE",
      "IGST",
      "CGST",
      "SGST",
    ];

    const sortedData = result.rows.sort((a, b) => {
      const indexA = order.indexOf(a.chg_component);
      const indexB = order.indexOf(b.chg_component);

      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    res.status(200).json(sortedData);
  } catch (error) {
    console.error("Error fetching charges:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


exports.cancelPurchaseOrder = catchAsync(async (req, res) => {
  const {
    po_id,
    user_id: userId,
    division_id,
    trans_year,
  } = req.body;

  try {
    await db.query("BEGIN");

    // Fetch PO
    const getPO = await db.query(
      `
      SELECT po_id,
             po_no,
             flag,
             cancel_flag,
             po_type
      FROM ${TABLE_NAMES.HDR_TABLE_MAIN}
      WHERE po_id = $1
      `,
      [po_id]
    );

    if (getPO.rowCount === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({
        type: "error",
        message: "Purchase Order not found.",
      });
    }

    const poData = getPO.rows[0];

    if (poData.cancel_flag === "Y") {
      await db.query("ROLLBACK");
      return res.status(400).json({
        type: "error",
        message: "Purchase Order is already cancelled.",
      });
    }

    if (poData.flag !== "F") {
      await db.query("ROLLBACK");
      return res.status(400).json({
        type: "error",
        message: "Only fully authorised Purchase Orders can be cancelled.",
      });
    }

    // Determine PO / PA
    const docType = poData.po_type === "A" ? "PA" : "PO";

    // Check Auth3 user
    const getAuth = await db.query(
      `
        SELECT auth_id3
        FROM moitauth
        WHERE doc_type = $1
      `,
      [docType]
    );

    console.log('authid3',getAuth.rows[0].auth_id3)
    console.log('user_id',userId)

    if (Number(getAuth.rows[0].auth_id3) !== Number(userId)) {
      await db.query("ROLLBACK");
      return res.status(403).json({
        type: "error",
        message: "You are not authorised to cancel this Purchase Order.",
      });
    }

    // TODO:
    // Check Gate Entry here before cancellation

    // Cancel PO
    await db.query(
      `
      UPDATE ${TABLE_NAMES.HDR_TABLE_MAIN}
      SET
          cancel_flag = 'Y',
          update_id = $2,
          update_date = NOW()
      WHERE po_id = $1
      `,
      [po_id, userId]
    );


    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Purchase Order cancelled successfully.",
    });

  } catch (error) {
    console.error(error);
    await db.query("ROLLBACK");

    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});



exports.generatePOPdf = generatePOPdf;

