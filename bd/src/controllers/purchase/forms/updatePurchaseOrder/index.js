




const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../../utility/query");

// const { PO_HDR_VALID_COLUMNS, PO_DTL_VALID_COLUMNS } = require("./presentation");

const { v4: uuidv4 } = require("uuid");
const {
  transformMhmmpoamd,
  transformMdmmpoitamd,
  transPOLevelToDbData,
  transPOLevelChargeToDbData,
} = require("./presentation");



const TABLE_NAMES = {
  HDR_TABLE: "MHMMPO",
  DTL_TABLE: "MDMMPOIT",
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
  "it_taxable_val",

  ];



exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  // let global_user_id = req?.userInfo?.global_user_id || 583; // todo: also remove hardcord user from here


    // console.log("Query",req.query);


  const { formStatus, appFinYear,userId  } = req?.query;



// console.log("userId =>", userId);

// console.log("formStatus =", formStatus);
// console.log("userId =", userId);


let allowedDocTypes = [];

if (formStatus === "Update") {

      // access for akshay ,amit and manoj garg
  if ([611, 586].includes(Number(userId))) {

    allowedDocTypes = ["PO", "PA"];

  } else {

    const authCheck = await db.query(
      `
      SELECT doc_type
      FROM moitauth
      WHERE active = 'Y'
        AND auth_id3 = $1
      `,
      [userId]
    );

    if (authCheck.rowCount === 0) {
      return res.status(403).json({
        status: false,
        message: "You have not Rights to Update Purchase Order/Advice"
      });
    }

    allowedDocTypes = authCheck.rows.map(r => r.doc_type);
  }
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



const getPurchaseOrderDataOnQuery = async(req, res,next) => {
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
  console.log("queryValues ::", queryValues); //  helpful for debugging

  let mhmmpoData = {};
  let mdmmpoitData = [];

  try {
    let recordCount;

    if (whereClauses.length > 0) {
      // ✅ FIX 1: use total_count (was using ?.count which returned undefined)
      const getCount = await db.query(
        `
        SELECT COUNT(po_id) AS total_count FROM ${TABLE_NAMES.HDR_TABLE}
        WHERE division_id = $1
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
            SELECT COUNT(po_id) AS total_count FROM ${TABLE_NAMES.HDR_TABLE} 
             WHERE division_id = $1
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

    // ✅ FIX 2: UpdatePurchaseOrder query now correctly uses queryValues in WHERE
    // and handles ORDER/LIMIT/OFFSET cleanly outside the UNION
    const offset = req.query.offset || 0;

    const UpdatePurchaseOrder = await db.query(
      `SELECT * from mhmmpo
      where division_id =$1
       ${queryValues}
      ORDER BY po_no,po_date
      LIMIT 1 OFFSET $2
      `,[divisionId, offset]
    );

    console.log("user_id and division_id ::", user_id, divisionId);
    console.log("UpdatePurchaseOrder rows ::", UpdatePurchaseOrder.rows);

    if (!UpdatePurchaseOrder.rows.length) {
      return res.status(200).send({
        type: "not found",
        message: "No purchase Order data found",
        count: 0,
      });
    }

    // SET Purchase Order DATA
    mhmmpoData = { ...UpdatePurchaseOrder.rows[0] };



    // #### Post query logic for mhmmpoData ####

    // VENDOR NAME
    const getVendorName = await db.query(
      `SELECT V_NAME FROM MOMMVEND WHERE V_CODE = $1`,
      [mhmmpoData.v_code],
    );
    mhmmpoData.v_name =
      getVendorName.rowCount > 0 ? getVendorName.rows[0].v_name : null;

    // CUSTOMER NAME
    const getCustomerName = await db.query(
      `SELECT C_NAME FROM MOSMCUST WHERE C_CODE = $1`,
      [mhmmpoData.c_code],
    );
    mhmmpoData.c_name =
      getCustomerName.rowCount > 0 ? getCustomerName.rows[0].c_name : null;

    // ADVANCE GL ACC NAME
    const getAdvanceGLName = await db.query(
      `SELECT acc_desc FROM MHFMGLM WHERE acc_no = $1`,
      [mhmmpoData.adv_gl_acc_no],
    );
    mhmmpoData.acc_desc =
      getAdvanceGLName.rowCount > 0 ? getAdvanceGLName.rows[0].acc_desc : null;

    // ADVANCE GL ACC NAME
    const getTermName = await db.query(
      `SELECT term_desc FROM mhmmterm WHERE term_code = $1`,
      [mhmmpoData.term_code],
    );
    mhmmpoData.term_desc =
      getTermName.rowCount > 0 ? getTermName.rows[0].term_desc : null;

    // TRANSPORTER NAME
    const getTransporterName = await db.query(
      `SELECT TRANSPORTER_NAME FROM MOMMTRANSPORT WHERE TRANSPORTER_CD = $1`,
      [mhmmpoData.transport],
    );
    mhmmpoData.transporter_name =
      getTransporterName.rowCount > 0
        ? getTransporterName.rows[0].transporter_name
        : "";

    // BUYER
    const getBuyerId = await db.query(
      `SELECT CREATE_ID as Buyer FROM MHMMPOAMD WHERE PO_ID = $1`,
      [mhmmpoData.po_id],
    );
    mhmmpoData.buyer =
      getBuyerId.rowCount > 0 ? getBuyerId.rows[0].buyer : null;

    const dibuyer = await db.query(
      `SELECT 'Buyer : ' || USER_NAME as DI_BUYER FROM USER_MASTER WHERE USER_ID = $1`,
      [mhmmpoData.buyer],
    );
    mhmmpoData.di_buyer =
      dibuyer.rowCount > 0 ? dibuyer.rows[0].di_buyer : null;

    // JW FLAG
    const getJwFlag = await db.query(
      `SELECT 'J' as jw_flag FROM MOMMPCAT WHERE USER_CODE = $1 AND PO_CAT_PREFIX = $2`,
      ["JW", mhmmpoData.category],
    );
    mhmmpoData.jw = getJwFlag.rowCount > 0 ? "J" : "D";

    
    // AUTH LEVEL
     const rawPoType = mhmmpoData?.po_type;
      const docType = rawPoType === "A" ? "PA" : "PO";

    const getAuthLevel = await db.query(
      `SELECT auth_id1, auth_id2, auth_id3 FROM moitauth WHERE doc_type = $1`,[docType]
    );

    console.log("getAuthLevel ::", getAuthLevel.rows);
    console.log("user_id ::", user_id);

    const { auth_id1, auth_id2, auth_id3 } = getAuthLevel.rows[0];


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
      [mhmmpoData.po_id]
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


    if (mhmmpoData.cancel_flag === "Y") {

      mhmmpoData.disp_flag =
        `Cancelled By ${cancelledUser?.user_name || ""}`;

    } else if (mhmmpoData.flag === "Y") {

      mhmmpoData.disp_flag =
        `Prepared By ${preparedUser?.user_name || ""}`;

    } else if (mhmmpoData.flag === "A") {

      mhmmpoData.disp_flag =
        `Authorised By ${authorisedUser?.user_name || ""}`;

    } else if (mhmmpoData.flag === "P") {

      mhmmpoData.disp_flag = "Printed";

    } else if (mhmmpoData.flag === "F") {

      mhmmpoData.disp_flag =
        `Approved By MANOJ GARG`;

    } else if (mhmmpoData.flag === "R") {

      mhmmpoData.disp_flag =
        `Refused PO By ${refusedUser?.user_name || ""}`;

    } else {

      mhmmpoData.disp_flag = "Unauthorised";
    }
    // VENDOR EXCISE / mod_vat_yn
    const getVendorExcise = await db.query(
      `SELECT covered_excise FROM mommvend WHERE v_code = $1`,
      [mhmmpoData.v_code],
    );
    const parameter = {};
    parameter.mod_vat_yn =
      getVendorExcise.rowCount > 0 &&
        getVendorExcise.rows[0].covered_excise === "Y"
        ? "Y"
        : "N";
    mhmmpoData.parameter = parameter;

    // DIVISION GST
    const getDivisionGst = await db.query(
      `SELECT GST_NO FROM moitdivision WHERE division_id = $1`,
      [divisionId],
    );
    mhmmpoData.disp_po_type =
      getDivisionGst.rowCount > 0 && getDivisionGst.rows[0].gst_no
        ? "GST Registered Division"
        : "Non GST Registered Division";

    // #### End of mhmmpoData post query logic ####

    // FETCH LINE ITEM DETAILS
    const UpdatePurchaseOrderDetails = await db.query(
      `
      SELECT * FROM ${TABLE_NAMES.DTL_TABLE} WHERE po_id = $1
    
      `,
      [mhmmpoData.po_id],
    );

    await Promise.all(
      UpdatePurchaseOrderDetails.rows.map(async (item) => {
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

        mdmmpoitData.push(item);
      }),
    );



    console.log(
      "auth_id1, auth_id2, auth_id3 ::",
      auth_id1,
      auth_id2,
      auth_id3,
    );

   
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
    const authTabLabels = {
      1: userNameMap[auth_id1] || "Auth Tab 1",
      2: userNameMap[auth_id2] || "Auth Tab 2",
      3: userNameMap[auth_id3] || "Auth Tab 3",
    };

    let authLevel = 0;
    if (auth_id1 === user_id) {
      authLevel = 1;
    } else if (auth_id2 === user_id) {
      authLevel = 2;
    } else if (auth_id3 === user_id) {
      authLevel = 3;
    }

    const getAuthData = await db.query(
      `SELECT * FROM mdmmpoauth WHERE po_id = $1`,
      [mhmmpoData.po_id],
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
    const getPoLevelCharges = await db.query(
      `SELECT * FROM mdmmpo_po_level_charges WHERE po_id = $1`,
      [mhmmpoData.po_id],
    );

    const poLevelChargesData = getPoLevelCharges.rows;

    return res.status(200).json({
      type: "found",
      UpdatePurchaseOrder: {
        ...mhmmpoData,
        po_date: dateFormater(mhmmpoData?.po_date),
        po_eff_dt: dateFormater(mhmmpoData?.po_eff_dt),
        po_end_dt: dateFormater(mhmmpoData?.po_end_dt),
        create_date: dateFormater(mhmmpoData?.create_date),
        authLevel: authLevel,
        authTabData: getAuthData.rows,
      },
      UpdatePurchaseOrderDetails: [...mdmmpoitData],
      poLevelCharges: poLevelChargesData,
      authTabData: authTabData,
      authTabLabels: authTabLabels, // ✅ { 1: "AMIT", 2: "RAHUL", 3: "SURESH" }
      count: recordCount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal Error" });
  }
};

// For HelpList
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
    }
     else if (help_list === "it_code") {
      //this is for accunt no help in field of acc.no reside in detail block
          const itemList = await db.query(
        // added it_rate column from mdmmvend
        `SELECT
    i.it_code,
    i.it_name_long,
    i.it_name,
    i.it_pu_um,
    b.cat_desc,
    i.subsidy_yes_no AS subsidy_applicable,
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
              AND d2.rate_eff_dt <= current_date
      )

    UNION ALL

    -- All rates for PT12 and FT12
    SELECT
        it_code,
        it_rate,
        rate_eff_dt
    FROM mdmmvend
    WHERE it_code IN ('PT12', 'FT12')
      AND rate_eff_dt <= current_date
) mv
ON mv.it_code = i.it_code

WHERE b.level1 IN ('F', 'H', 'G', 'M')
  AND b.level2 IN ('01', '02')
  AND b.level3 = '00'
  AND COALESCE(i.active, 'N') = 'Y'


ORDER BY
    i.it_name,
    mv.rate_eff_dt DESC`
      )
      
      if (itemList.rows.length > 0) {
        res.status(200).json(itemList.rows);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

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
    c_code,
    po_type,
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


        //  Handle IT_CODE change
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
            original_it_code || it_code, //  GOLD LINE
          ],
        );
      }
    }

    // 4️⃣  INSERT NEW ROWS (MOST IMPORTANT PART)
    if (Array.isArray(newItemRows) && newItemRows.length) {
      for (const row of newItemRows) {
        const validInsertData = Object.fromEntries(
          Object.entries(row).filter(([key]) =>
            PO_DTL_VALID_COLUMNS.includes(key),
          ),
        );

        if (!Object.keys(validInsertData).length) continue;

        //  MASTER-DETAIL LINK
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









