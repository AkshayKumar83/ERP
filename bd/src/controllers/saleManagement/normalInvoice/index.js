const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const { dateFormater } = require("../../../utility/constant");

const {
  generateSingleInsertQuery,
  cleanObject,
} = require("../../../utility/query");

const TABLE_NAMES = {
  MHSMINV: "mhsminv",
  MDSMINV: "mdsminv",
};  



exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const { p_rep_id, division_id, formSataus } = req?.query;

  const divisionList = await db.query(
    `select name, division_id from moitdivision
    order by 1 `
  );

  const invTypeList = await db.query(
    `select da_cat_desc, da_cat as doc_type
      from mosmdact
    where invoice = 'Y'
      and da_cat_desc not like '%SERVICES%'
    order by da_cat_desc`
  );

  const docTypeList = await db.query(
    `select description, prefix from vwinvdoc order by description`
  );

  const currencyList = await db.query(
    `select curr_desc, curr_code  from currency order by 1`
  );

  const despatchList = await db.query(
    `select name,c_code from moitdivision order by name`
  );

  const preInvList = await db.query(
    `select pre_inv_no, pre_id pre_id
      from themprin p, mosmcust c
      where p.c_code = c.c_code
      order by pre_inv_no
      `
  );

  const paymentTermList = await db.query(
    ` select term_desc, term_code as pmt_terms from mhmmterm where sale_or_purchase = 'S' order by term_desc`
  );

  const storageList = await db.query(
    `select description, code from mommcode where cat_group = 'STORAG'`
  );

  let gen_p_rep_id;

  let response = {
    division: divisionList.rows,
    invType: invTypeList.rows,
    docType: docTypeList.rows,
    currency: currencyList.rows,
    despatch: despatchList.rows,
    preInv: preInvList.rows,
    paymentTerm: paymentTermList.rows,
    storage: storageList.rows,
  };

  if (formSataus == "Insert") {
    const getCustomerCode = await db.query(
      `
       select c_code  from moitdivision
      where division_id = $1  
    `,
      [division_id]
    );
    response.despatch_fr = getCustomerCode.rows[0].c_code;

    const gstStateCode = await db.query(
      `
        SELECT GST_STATE_CODE as PARM_DIVE_GST_STATE_CODE
        FROM MOITSTATE S 
        WHERE TYPE = 'S' 
        AND STATE_ID = (SELECT NN.STATE_ID FROM MOITDIVISION NN
        WHERE NN.DIVISION_ID = $1)
        limit 1
        `,
      [division_id]
    );
    response.parm_dive_gst_state_code =
      gstStateCode.rows[0].parm_dive_gst_state_code;

    if (!p_rep_id) {
      const genPrepId = await db.query(
        `SELECT nextval('s_moitselection_repid')`
      );
      gen_p_rep_id = genPrepId.rows[0].nextval;
      response.p_rep_id = gen_p_rep_id == undefined ? p_rep_id : gen_p_rep_id;
    }
  }

  const getCustomerCode = await db.query(
    `
       select c_code  from moitdivision
      where division_id = $1  
    `,
    [division_id]
  );

  const gstStateCode = await db.query(
    `
        SELECT GST_STATE_CODE as PARM_DIVE_GST_STATE_CODE
      FROM MOITSTATE S 
      WHERE TYPE = 'S' 
        AND STATE_ID = (SELECT NN.STATE_ID FROM MOITDIVISION NN
          WHERE NN.DIVISION_ID = $1)
        limit 1
    `,
    [division_id]
  );

  if (!p_rep_id && formSataus == "Insert") {
    const genPrepId = await db.query(`SELECT nextval('s_moitselection_repid')`);
    gen_p_rep_id = genPrepId.rows[0].nextval;
  }

  return res.status(200).json(response);
});

const getDataOnQuery = async (req, res) => {
  const { formStatus, appDivisionId, appFinYear } = req?.query;

  //console.log("getQuery:", req.query )
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  //console.log("userId", userId)

  try {
    let queryParameter = `ORDER BY inv_id LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;

    switch (req?.query?.get_data) {
      case "Query":
      case "First": {
        const getCount = await db.query(
          `SELECT COUNT(inv_id) FROM ${TABLE_NAMES.MHSMINV} where division_id = $1 AND TRANS_YEAR = $2 and inv_type not in ('I','B','V')
                      `,
          [divisionId, transYear]
        );
        recordCount = getCount.rows[0]?.count;
        break;
      }

      case "Last": {
        queryParameter = "ORDER BY inv_id DESC LIMIT 1";
        break;
      }

      default:
        queryParameter = `ORDER BY inv_id LIMIT 1 OFFSET ${
          req.query.offset || 0
        }`;
        break;
    }

    const mhsmInvData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MHSMINV} where division_id = $1 AND TRANS_YEAR = $2 and inv_type not in ('I','B','V')
         ${queryParameter}
                    `,
      [divisionId, transYear]
    );

    if (mhsmInvData.rowCount == 0) {
      // throw new Error("No matching record found");
      return res.status(200).json({
        success: false,
        message: "No matching record found",
        mhsmInvData: [],
        recordCount: 0,
      });
    }

    const docType = mhsmInvData.rows[0]?.doc_type;
    const docId = mhsmInvData.rows[0]?.inv_id;
    const daId = mhsmInvData.rows[0]?.da_id;
    const invDa = mhsmInvData.rows[0]?.inv_agnst_da;
    const orderId = mhsmInvData.rows[0]?.order_id;
    const divertInvId = mhsmInvData.rows[0]?.divert_inv_id;
    const rejGpId = mhsmInvData.rows[0]?.rej_gp_id;
    let partyCode = mhsmInvData.rows[0]?.party_code;
    const cCode = mhsmInvData.rows[0]?.c_code;
    const shipToCode = mhsmInvData.rows[0]?.ship_to_code;
    const billToCode = mhsmInvData.rows[0]?.bill_to_code;
    const vCode = mhsmInvData.rows[0]?.v_code;
    const currCode = mhsmInvData.rows[0]?.curr_cd;
    const commodity = mhsmInvData.rows[0]?.commodity;
    const otherAcHead = mhsmInvData.rows[0]?.other_ac_head1;
    const otherAcHead1 = mhsmInvData.rows[0]?.other_ac_head2;
    const otherAcHead2 = mhsmInvData.rows[0]?.other_ac_head3;
    const advVchrId = mhsmInvData.rows[0]?.advance_voucher_id;
    const rmgpId = mhsmInvData.rows[0]?.rmgp_id;
    const despatch = mhsmInvData.rows[0]?.despatch_fr;
    const invType = mhsmInvData.rows[0]?.inv_type;
    const despatchVndr = mhsmInvData.rows[0]?.despatch_fr_vendor;

    // POST QUERY DATA

    if (docType === "N") {
      if (invDa === "Y") {
        const daNo = await db.query(
          `  select da_no from mhsmda
        where da_id = $1`,
          [daId]
        );

        mhsmInvData.rows[0].doc_no =
          daNo.rowCount > 0 ? daNo.rows[0].da_no : "";
      }

      if (invDa === "N") {
        const orderNo = await db.query(
          `  select order_no 
        from mhsmordr
        where order_id = $1`,
          [orderId]
        );

        mhsmInvData.rows[0].doc_no =
          orderNo.rowCount > 0 ? orderNo.rows[0].order_no : "";
      }
    }

    if (["S", "V", "P"].includes(docType)) {
      const orderNo = await db.query(
        `   select order_no 
      from mhsmordr
      where order_id = $1`,
        [orderId]
      );

      mhsmInvData.rows[0].doc_no =
        orderNo.rowCount > 0 ? orderNo.rows[0].order_no : "";

      if (divertInvId !== null) {
        const divInvNo = await db.query(
          `   select inv_no  from mhsminv
              where inv_id = $1;`,
          [divertInvId]
        );

        mhsmInvData.rows[0].divert_inv_no =
          divInvNo.rowCount > 0 ? divInvNo.rows[0].inv_no : "";
      }
    }

    if (docType === "R") {
      const regGpDtl = await db.query(
        `select rej_gpno, 'N'
      from tommirej
      where rej_gp_id = $1
      UNION
      select rej_gpno, 'Y'
      from tommrmda_no_mrir
      where rej_gp_id = $2`,
        [rejGpId, rejGpId]
      );

      mhsmInvData.rows[0].doc_no =
        regGpDtl.rowCount > 0 ? regGpDtl.rows[0].rej_gpno : "";
    }

    if (docType === "D") {
      const docDtl = await db.query(
        ` select doc_no  from thmmmchl
      where doc_id = $1`,
        [docId]
      );

      mhsmInvData.rows[0].doc_no =
        docDtl.rowCount > 0 ? docDtl.rows[0].doc_no : "";
    }

    if (["N", "S", "V", "P"].includes(docType)) {
      partyCode = cCode;
      const cDtl = await db.query(
        ` SELECT c.c_name AS party_name, s.c_name AS ship_name, b.c_name AS bill_name
FROM mosmcust c, mosmcust s, mosmcust b
WHERE c.c_code = $1
  AND s.c_code = $2
  AND b.c_code = $3
`,
        [cCode, shipToCode, billToCode]
      );

      mhsmInvData.rows[0].party_name =
        cDtl.rowCount > 0 ? cDtl.rows[0].party_name : "";

      mhsmInvData.rows[0].ship_to_name =
        cDtl.rowCount > 0 ? cDtl.rows[0].ship_name : "";

      mhsmInvData.rows[0].bill_to_name =
        cDtl.rowCount > 0 ? cDtl.rows[0].bill_name : "";
    }

    if (["R", "D"].includes(docType)) {
      partyCode = vCode;
      const vDtl = await db.query(
        ` select c.v_name as party_code, s.v_name as ship_code, b.v_name as bill_code
      from mommvend c, mommvend s, mommvend b
        where c.v_code = $1
          and s.v_code  = $2
          and b.v_code  = $3`,
        [vCode, shipToCode, billToCode]
      );

      mhsmInvData.rows[0].party_name =
        vDtl.rowCount > 0 ? vDtl.rows[0].party_code : "";

      mhsmInvData.rows[0].ship_to_name =
        vDtl.rowCount > 0 ? vDtl.rows[0].ship_code : "";

      mhsmInvData.rows[0].bill_to_name =
        vDtl.rowCount > 0 ? vDtl.rows[0].bill_code : "";
    }

    if (orderId !== null) {
      console.log("order id is not null");
      const poDtl = await db.query(
        `   select o.c_po_no as po_no, c.curr_desc as curr_desc, o.curr_conv as curr_conv, annual_flag, jw
      from mhsmordr o, currency c
      where o.order_id = $1
        and o.curr_cd = $2`,
        [orderId, currCode]
      );

      mhsmInvData.rows[0].c_po_no =
        poDtl.rowCount > 0 ? poDtl.rows[0]?.po_no : "";

      // console.log(poDtl.rows[0]?.po_no)
      mhsmInvData.rows[0].so_curr_cd =
        poDtl.rowCount > 0 ? poDtl.rows[0]?.curr_desc : "";

      mhsmInvData.rows[0].so_c_ex_rate =
        poDtl.rowCount > 0 ? poDtl.rows[0]?.curr_conv : "";

      mhsmInvData.rows[0].annual_flag =
        poDtl.rowCount > 0 ? poDtl.rows[0]?.annual_flag : "";

      mhsmInvData.rows[0].jw = poDtl.rowCount > 0 ? poDtl.rows[0]?.jw : "";

      console.log("poDtl result:", poDtl);
      console.log("orderId:", orderId, "currCode:", currCode);

      console.log(
        poDtl.rows[0]?.po_no,
        poDtl.rows[0]?.curr_conv,
        poDtl.rows[0]?.annual_flag,
        poDtl.rows[0]?.jw
      );
    }

    const commodityDtl = await db.query(
      `   select commodity_desc  from commodity
  where commodity_code = $1`,
      [commodity]
    );

    mhsmInvData.rows[0].commodity_desc =
      commodityDtl.rowCount > 0 ? commodityDtl.rows[0]?.commodity_desc : "";

    const otherDtl = await db.query(
      ` 	select acc_desc
  from mhfmglm
  where acc_no = $1`,
      [otherAcHead]
    );

    mhsmInvData.rows[0].other_ac_desc1 =
      otherDtl.rowCount > 0 ? otherDtl.rows[0]?.acc_desc : "";

    const otherDtl1 = await db.query(
      ` 	select acc_desc
  from mhfmglm 
  where acc_no = $1`,
      [otherAcHead1]
    );

    mhsmInvData.rows[0].other_ac_desc2 =
      otherDtl1.rowCount > 0 ? otherDtl1.rows[0]?.acc_desc : "";

    const otherDtl2 = await db.query(
      ` 	select acc_desc
  from mhfmglm 
  where acc_no = $1`,
      [otherAcHead2]
    );

    mhsmInvData.rows[0].other_ac_desc3 =
      otherDtl2.rowCount > 0 ? otherDtl2.rows[0]?.acc_desc : "";

    const vendorDtl = await db.query(
      ` select voucher_id, voucher_no
  from thfmtran
  where trans_type like 'S%'
    and bill_id = $1`,
      [docId]
    );

    mhsmInvData.rows[0].voucher_id =
      vendorDtl.rowCount > 0 ? vendorDtl.rows[0].voucher_id : "";

    mhsmInvData.rows[0].voucher_no =
      vendorDtl.rowCount > 0 ? vendorDtl.rows[0].voucher_no : "";

    const creditDtl = await db.query(
      `  select voucher_id, voucher_no
  from thfmtran
  where trans_type = 'RN'
    and bill_id = $1`,
      [docId]
    );

    mhsmInvData.rows[0].credit_note_id =
      creditDtl.rowCount > 0 ? creditDtl.rows[0].voucher_id : "";

    mhsmInvData.rows[0].credit_note =
      creditDtl.rowCount > 0 ? creditDtl.rows[0].voucher_no : "";

    if (rmgpId !== null) {
      const rmgpDtl = await db.query(
        `select  doc_no
       from thmmmchl 
        where division_id = $1
      and chl_type = 'M' 
          and nonkardex_flag = 'N'
          and coalesce(print_ok,'N') = 'Y' 
          and out_time is not null 
          and doc_id = $2
          and coalesce(cancel_sdv,'N') ='N'`,
        [appDivisionId, rmgpId]
      );

      mhsmInvData.rows[0].rmgp_no =
        rmgpDtl.rowCount > 0 ? rmgpDtl.rows[0].doc_no : "";
    }

    if (despatch !== null) {
      const despDtl = await db.query(
        `	select coalesce(excisable,'N')
                    from mosmdact
                where da_cat = $1`,
        [invType]
      );
      mhsmInvData.rows[0].c_excisable =
        despDtl.rowCount > 0 ? despDtl.rows[0].excisable : "";
    }

    if (mhsmInvData.rows[0].c_excisable === "N") {
      const wcDtl = await db.query(
        `		select wc_id  from mommwc 
                             where c_code = $1
                               and store_process = 'S' 
                               and store_type in ('G','D');`,
        [despatch]
      );
      mhsmInvData.rows[0].parameter_wc_id =
        wcDtl.rowCount > 0 ? wcDtl.rows[0].wc_id : "";
    }

    if (mhsmInvData.rows[0].c_excisable !== "N") {
      const wcDtl1 = await db.query(
        `	select wc_id  from mommwc 
                             where c_code = $1
                               and store_process = 'S' 
                               and store_type = 'E'`,
        [despatch]
      );
      mhsmInvData.rows[0].parameter_wc_id =
        wcDtl1.rowCount > 0 ? wcDtl1.rows[0].wc_id : "";
    }

    const transDtl = await db.query(
      ` SELECT TRANS_DATE,TRANS_NO 
FROM THFMTRAN_GST_DBCR
WHERE TRANS_ID = $1`,
      [advVchrId]
    );

    mhsmInvData.rows[0].advance_voucher_date =
      transDtl.rowCount > 0 ? dateFormater(transDtl.rows[0].trans_date) : "";

    const vendorDtl1 = await db.query(
      `	SELECT v_name	FROM mommvend
	WHERE v_code = $1`,
      [despatchVndr]
    );

    mhsmInvData.rows[0].v_name =
      vendorDtl1.rowCount > 0 ? vendorDtl1.rows[0].v_name : "";

    mhsmInvData.rows[0].inv_dt =
      mhsmInvData.rowCount > 0 ? dateFormater(mhsmInvData.rows[0].inv_dt) : "";

    mhsmInvData.rows[0].removal_dt =
      mhsmInvData.rowCount > 0
        ? dateFormater(mhsmInvData.rows[0].removal_dt)
        : "";

    mhsmInvData.rows[0].due_dt =
      mhsmInvData.rowCount > 0 ? dateFormater(mhsmInvData.rows[0].due_dt) : "";

    mhsmInvData.rows[0].advance_voucher_no =
      transDtl.rowCount > 0 ? transDtl.rows[0].trans_no : "";

    const mdsmInvData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MDSMINV} 
 WHERE inv_id = $1
 ORDER BY 
   CASE 
     WHEN access_sr_no IS NULL THEN sr_no 
     ELSE access_sr_no 
   END, 
   sr_no`,
      [docId]
    );

    // POST-QUERY DATA
    if (mdsmInvData.rows.length > 0) {
      await Promise.all(
        mdsmInvData.rows.map(async (item) => {
          if (item.da_id !== null) {
            const doc_no = await db.query(
              `   select da_no from mhsmda
  where da_id = $1 `,
              [item.da_id]
            );

            item.doc_no = doc_no.rows[0]?.da_no || null;
          }

          if (item.it_code !== null) {
            const expDtl = await db.query(
              `  select coalesce(expiry_day_check,0) 
   from mommitem
  where it_code = $1`,
              [item.it_code]
            );

            item.expdays = expDtl.rows[0]?.expiry_day_check || null;
          }

          if (item.it_code !== null) {
            const it_name = await db.query(
              `  select it_name from mommitem where it_code = $1   `,
              [item.it_code]
            );

            item.it_desc = it_name.rows[0]?.it_name || null;
          }

          if (item.cus_it_code !== null) {
            const cus_it_code = await db.query(
              `  select it_name_long from mommitem where it_code = $1 `,
              [item.cus_it_code]
            );

            item.cus_it_desc = cus_it_code.rows[0]?.it_name_long || null;
          }

          if (item.sale_ac_head !== null) {
            const sale_ac_head = await db.query(
              ` select h.acc_desc as acc_desc from mdfmglm d, mhfmglm h
    where d.acc_no = $1
      and d.division_id = $2
      and d.acc_no = h.acc_no
      and trans_year = $3 `,
              [item.sale_ac_head, appDivisionId, appFinYear]
            );

            item.sale_ac_desc = sale_ac_head.rows[0]?.acc_desc || null;
          }

          if (item.it_code !== null) {
            const catalog_code = await db.query(
              `select catalog_code
    from mosmprod
    where it_code = $1 `,
              [item.it_code]
            );

            item.catalog_code = catalog_code.rows[0]?.catalog_code || null;
          }

          if (item.wc_id !== null) {
            const wc_desc = await db.query(
              `	select description 
    from mommwc 
   where wc_id = $1`,
              [item.wc_id]
            );

            item.description = wc_desc.rows[0]?.description || null;
          }

          if (item.it_code !== null) {
            const hsnSac = await db.query(
              ` SELECT HSN_SAC_CODE 
    FROM MOSMPROD 
   WHERE IT_CODE = $1 `,
              [item.it_code]
            );

            item.hsn_sac_code = hsnSac.rows[0]?.hsn_sac_code || null;
          }
        })
      );
    }

    const responseData = {
      mhsmInvData: mhsmInvData.rows[0],
      mdsmInvData: mdsmInvData.rows,
      count: recordCount || 0,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
  } = req?.query;
  try {
    if (!["Insert", "Update", "Search"].includes(form_status)) {
      return res.status(200).send([]);
    }
    const helpList = help_list;

    let query = "";
    let values = [];

    switch (helpList) {
      case "doc_no":
        {
          if (req?.query?.use_help_query == "divert_order_no") {
            query = `select order_no, order_id, to_char(order_dt, 'dd-mm-yyyy') order_dt,
            c_po_no,d.c_name,d.c_code
            from vwopenorder h, mosmcust d
            where h.c_code = d.c_code 
            order by order_no`;
          } else if (req?.query?.use_help_query == "divert_order_no") {
            const { foc, inv_type } = req?.query;
            query = `
            select d.da_id, d.da_no, to_char(d.da_dt,'dd-mm-yyyy') da_dt, d.order_id, c.c_name
            from vwdaopen d, mosmcust c
            where d.da_type = $1
            and d.division_id = $2
            and $3 = 'N'  
            and c.c_code = d.c_code
            union all
            select d.da_id, d.da_no, to_char(d.da_dt,'dd-mm-yyyy') da_dt, d.order_id, c.c_name
            from MHSMDA d, mosmcust c
            where d.division_id = $4
              and c.c_code = d.c_code
              and $3 = 'Y' 
            AND EXISTS (
            SELECT 1 
              FROM THMMRCT GE,MHSMDA DA,MHSMINV I  
            WHERE DA.ORDER_ID = GE.ORDER_ID
              AND I.DA_ID     = DA.DA_ID 
              AND GE.GE_DATE >= I.INV_DT
              AND D.DA_ID = DA.DA_ID
              AND coalesce(GE.CANCEL_GE,'N') = 'N'   
              )
            order by 2
            `;
            values = [inv_type, divisionId, foc];
          } else if (req?.query?.use_help_query == "order_id") {
          }
        }

        break;

      case "divert_inv_no": // below i added the c_code
        query = `select h.inv_id, h.inv_no, to_char(h.inv_dt,'dd-mm-yyyy') inv_dt, h.order_id,c.c_code, c.c_name
        from mhsminv h, mosmcust c
        where h.doc_type = 'N'
          and h.division_id = $1
          and c.c_code = h.c_code
        order by h.inv_no`;
        values = [divisionId];
        break;

      case "rmgp_no":
        
        query = `select  doc_no, doc_date , doc_id 
          from thmmmchl 
        where division_id = $1
          and chl_type = 'M' 
          and nonkardex_flag = 'N'
          and coalesce(print_ok,'N') = 'Y' 
          and out_time is not null 
          and coalesce(cancel_sdv,'N') ='N'
        order by doc_id`;
        values = [divisionId];
        break;

      case "commodity":
        let {doc_type, order_id} = req?.query
        if (!order_id || order_id === "undefined" || order_id === "") {
          order_id = null;
        } else {
          order_id = Number(order_id); // cast to number
        }

        if (!doc_type || doc_type === "undefined" || doc_type === "") {
          doc_type = null;
        }

        query = `select commodity_desc, commodity_code commodity_code from commodity c 
        where $1 in ('R', 'D') or ($1 = 'S' 
        and exists (select 'x' from mdsmordr o, mosmprod p where o.order_id = $2 
        and o.it_code = p.it_code 
        and p.commodity = c.commodity_code)) order by 1`;
        values = [doc_type, order_id];
        break;

      case "bank_code":{
        let curr_cd = req.query?.curr_cd
        query = `select acc_no as bank_code, bank_name, bnk_ac_no from mhfmbank 
                 where curr_code  = $1`
        values = [curr_cd]
      }pg
      break

      case "it_code":{
        
        query = `
           SELECT it_code, it_name, hsn_sac_code FROM MOMMITEM I
              WHERE EXISTS
              (SELECT 1 FROM MOSMGST_STATE S
              WHERE S.HSN_SAC_CODE = I.HSN_SAC_CODE
              AND SAL_OR_ST = 'S')
              order by it_code
          `;
      }
        break;
      default:
        return res.status(400).send({
          message: `Invalid help_list value: ${helpList}`,
          type: "error",
      });
    }

    const result = await db.query(query, values);
    return res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error in helpListData:", error);
    return res.status(500).json({
      message: "Failed to fetch dropdown data",
      error: error.message,
    });
  }
};

//validate inv type
const validateInvType = async (req, res) => {
  const { inv_type } = req?.query;
  try {
    const result = await db.query(
      `select user_code, excisable, excise_sr_no_reqd
    from mosmdact
    where da_cat = $1`,
      [inv_type]
    );

    if (result.rowCount == 0) {
      throw new Error(`Invoice Category not exist in Invoice Category Master`);
    }
    res.status(200).json({ type: "success", data: { ...result.rows[0] } });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// validate doc_no
const validateDocNo = async (req, res) => {
  const {
    doc_no,
    inv_type,
    division_id,
    inv_agnst_da,
    commodity,
    foc,
    doc_type,
  } = req?.query;

  let responseData = { c_ex_rate: "", so_c_ex_rate: "" };

  try {
    if (doc_no) {
      if (doc_type == "N") {
        if (inv_agnst_da == "Y") {
          const result = await db.query(
            `
                      SELECT d.commodity, d.da_id, d.order_id, d.c_code,
                        d.c_code party_code, c.c_name party_name, o.c_po_no, d.ship_to_code,
                        s.c_name ship_to_name, d.bill_to_code, b.c_name bill_to_name, d.exc_doc_no,
                        d.exc_doc_dt, d.gr_rr_no, d.gr_rr_dt, d.final_dest,
                        disp_nt_no, d.mode_cd, d.tpt_name, d.vessel_no,
                        d.case_mrk, o.price_basis del_terms, o.term_code, o.curr_cd,
                        o.curr_conv c_ex_rate, NULL pack_forw, o.ins_flg, o.ins_amt_prc,
                        NULL ins_chg, o.frt_flg, o.frt_amt_prc, NULL frt_chg,
                        o.octroi_flg, o.octroi_chg, o.foc_flag foc, o.jw, o.note remarks,
                        o.spl_disc_flg, o.desp_by doc_thru, o.annual_flag, o.despatch_fr,
                        o.PACK_AMT_PRC 
                    FROM vwdaopen d, mhsmordr o, mosmcust c, mosmcust s, mosmcust b
                  WHERE d.da_no = $1
                    AND d.division_id = $2
                    AND d.da_type = $3
                    AND o.order_id = d.order_id
                    AND c.c_code = d.c_code
                    AND s.c_code = d.ship_to_code
                    AND b.c_code = d.bill_to_code;
              `,
            [doc_no, division_id, inv_type]
          );

          if (result.rowCount == 0) {
            throw new Error("No Valid DA exists for invoicing");
          }
          responseData = { ...responseData, ...result.rows[0] };

          // todo if query run and data comes then set the all related fields in form state
        } else if (inv_agnst_da == "N") {
          //todo store the value of below variable cause it requires some logical process
          // flag
          // cancel_flag
          // eff_dt
          // end_dt

          const result = await db.query(
            `
                          SELECT o.order_id, o.c_code, o.c_code party_code, c.c_name party_name,
                          o.c_po_no, o.ship_to_code, s.c_name ship_to_name, o.bill_to_code,
                          b.c_name bill_to_name, o.mode_cd, o.price_basis del_terms, o.term_code pmt_terms,
                          o.curr_cd, o.curr_conv c_ex_rate,NULL pack_forw, o.ins_flg,
                          o.ins_amt_prc, NULL ins_chg, o.frt_flg, o.frt_amt_prc,
                          NULL frt_chg, o.octroi_flg, o.octroi_chg, o.spl_disc_flg,
                          o.annual_flag, o.final_dest, o.tpt_name, o.foc_flag foc, o.jw,
                          o.note remark, o.desp_by doc_thru, o.flag, o.cancel_flag, o.eff_dt, o.end_dt, o.despatch_fr
                      FROM mhsmordr o, mosmcust c, mosmcust s, mosmcust b
                      WHERE o.order_no = $1
                      AND c.c_code = o.c_code
                      AND s.c_code = o.ship_to_code
                      AND b.c_code = o.bill_to_code;
                      `,
            [doc_no]
          );

          // todo if query run and data comes then set the all related fields in form state except above variable

          if (result.rowCount == 0) {
            throw new Error(
              `Sales Order No. does not exist in Sales Order Master`
            );
          }

          responseData = { ...responseData, ...result.rows[0] };

          const { flag, cancel_flag, eff_dt, end_dt } = result.rows[0];
          if (flag == "N") {
            throw new Error(`Sales Order is not Authorised`);
          } else if (cancel_flag == "Y") {
            throw new Error(`Sales Order is Cancelled`);
          }
        }

        const getCommodity = await db.query(
          `
              SELECT commodity_desc
                FROM commodity
              WHERE commodity_code = $1;
            `,
          [commodity]
        );

        const mosmDact = await db.query(
          `select get_mosmdact($1, 'USER_CODE')`,
          [inv_type]
        );
        const mosmDactType = mosmDact.rows[0].get_mosmdact;

        responseData.commodity_desc = getCommodity.rows[0]?.commodity_desc;

        if (foc == "Y" && mosmDactType != "F") {
          throw new Error(
            "Sales order created as Free of Cost, but Invoice category is different"
          );
        } else if (foc == "Y" && mosmDactType == "F") {
          throw new Error(
            "Sales order created as not Free of Cost, but Invoice category is Free of Cost"
          );
        }
        // send the commodity_desc in response
      } else if (doc_type == "V") {
        const result = await db.query(
          `
          SELECT o.order_id, o.c_code, o.c_code party_name, c.c_name party_name,
                 o.c_po_no, o.ship_to_code, s.c_name ship_to_name, o.bill_to_code,
                 b.c_name bill_to_name, o.mode_cd, o.price_basis del_terms, o.term_code pmt_terms,
                 o.curr_cd, o.curr_conv c_ex_rate, NULL pack_forw, o.ins_flg,
                 o.ins_amt_prc,NULL ins_chg, o.frt_flg, o.frt_amt_prc,
                 NULL frt_chg, o.octroi_flg, o.octroi_chg, o.spl_disc_flg,
                 o.annual_flag,o.despatch_fr
            FROM mhsmordr o, mosmcust c, mosmcust s, mosmcust b
           WHERE o.order_no = $1 
             AND o.division_id = $2 
             AND c.c_code = o.c_code
             AND s.c_code = o.ship_to_code
             AND b.c_code = o.bill_to_code`,
          [doc_no, division_id]
        );

        if (result.rowCount == 0) {
          throw new Error(
            `Sales Order No. does not exist in Sales Order Master`
          );
        }
        responseData = { ...responseData, ...result.rows[0] };
      } else if (doc_type == "S") {
        const result = await db.query(
          `
          SELECT o.order_id, o.c_code, o.c_code party_name, c.c_name party_name,
                 o.c_po_no, o.ship_to_code, s.c_name ship_to_name, o.bill_to_code,
                 b.c_name bill_to_name, o.mode_cd, o.price_basis del_terms, o.term_code pmt_terms,
                 o.curr_cd, o.curr_conv c_ex_rate, NULL pack_forw, o.ins_flg,
                 o.ins_amt_prc,NULL ins_chg, o.frt_flg, o.frt_amt_prc,
                 NULL frt_chg, o.octroi_flg, o.octroi_chg, o.spl_disc_flg,
                 o.annual_flag,o.despatch_fr
            FROM mhsmordr o, mosmcust c, mosmcust s, mosmcust b
           WHERE o.order_no = $1 
             AND o.division_id = $2 
             AND c.c_code = o.c_code
             AND s.c_code = o.ship_to_code
             AND b.c_code = o.bill_to_code`,
          [doc_no, division_id]
        );

        if (result.rowCount == 0) {
          throw new Error(
            `Sales Order No. does not exist in Sales Order Master`
          );
        }
        responseData = { ...responseData, ...result.rows[0] };
      } else if (doc_type == "R") {
        const result = await db.query(
          `
                  SELECT i.inv_no
            FROM tommirej r, mhsminv i
           WHERE r.rej_gpno = $1 
             AND r.division_id = $2 
             AND i.doc_type = 'R'
             AND i.rej_gp_id = r.rej_gp_id
             AND i.cancel_flag = 'N'
          UNION
          SELECT i.inv_no
            FROM tommrmda_no_mrir r, mhsminv i
           WHERE r.rej_gpno = $1 
             AND r.division_id = $2 
             AND i.doc_type = 'R'
             AND i.rej_gp_id = r.rej_gp_id
             AND i.cancel_flag = 'N'
          `,
          [doc_no, division_id]
        );

        if (result.rowCount > 0) {
          throw new Error(
            `Invoice ${result.rows[0].inv_no} already generated against selected RMDA`
          );
        }

        const result2 = await db.query(
          `
            SELECT r.rej_gp_id, r.v_code, r.v_code party_code, v.v_name party_name,
                 r.v_code ship_to_code, v.v_name ship_to_name, r.v_code bill_to_code, v.v_name bill_to_name,
                 r.r57f_ref exc_doc_no, r.r57f_ref_dt exc_doc_dt, 'N' tommrmda_no_mrir_flag
              FROM tommirej r, mommvend v
              WHERE r.rej_gpno = $1 
                AND r.division_id = $2   
                AND v.v_code = r.v_code
                UNION
            SELECT r.rej_gp_id, r.v_code, r.v_code, v.v_name, r.v_code, v.v_name, r.v_code, v.v_name, r.r57f_ref,
                      r.r57f_ref_dt, 'Y'
              FROM tommrmda_no_mrir r, mommvend v
              WHERE r.rej_gpno = $1 
            AND r.division_id = $2 
            AND v.v_code = r.v_code;
            `,
          [doc_no, division_id]
        );

        if (result2.rowCount == 0) {
          throw new Error("RMDA No. does not exist in RMDA Master");
        }
        responseData = { ...responseData, ...result2.rows[0] };
      } else if (doc_type == "D") {
        const result = await db.query(
          `
          SELECT i.inv_no
            FROM thmmmchl c, mhsminv i
           WHERE c.doc_no = $1
             AND c.division_id = $2
             AND i.doc_type = 'D'
             AND i.doc_id = c.doc_id
             AND i.cancel_flag = 'N';
          `,
          [doc_no, division_id]
        );

        if (result.rowCount > 0) {
          throw new Error(
            `Invoice ${result.rows[0].inv_no} already generated against selected SDV(Debit Challan)`
          );
        }

        const result2 = await db.query(
          `
          SELECT c.doc_id, c.v_code, c.v_code party_code, v.v_name party_name,
            c.v_code ship_to_code, v.v_name ship_to_name, c.v_code bill_to_code, v.v_name bill_to_name,
            c.r57f_ref exc_doc_no, c.r57f_ref_dt exc_doc_dt
            FROM thmmmchl c, mommvend v
            WHERE c.doc_no = $1 
            AND c.division_id = $2  
            AND v.v_code = c.v_code;
          `,
          [doc_no, division_id]
        );

        if (result2.rowCount == 0) {
          throw new Error(`SDV No. does not exist in SDV Master`);
        }
        responseData = { ...responseData, ...result2.rows[0] };
      }

      responseData.so_curr_cd = responseData?.curr_cd;
      responseData.so_c_ex_rate = responseData?.c_ex_rate;

      //GET_CUSTOMER_IS_DIVISION below is logic
      const result = await db.query(
        `
        select 'Y' as customer_is_division from moitdivision
          where c_code = $1;
        `,
        [responseData?.c_code]
      );

      if (result.rowCount == 0) {
        responseData.customer_is_division = "N";
      }
    } else if (!doc_no) {
      if (doc_type == "N") {
        if (inv_agnst_da == "Y") {
          throw new Error("DA No. cannot be blank");
        } else if (inv_agnst_da == "N") {
          throw new Error("Sales Order No. cannot be blank");
        }
      } else if (doc_type == "V" || doc_type == "S") {
        throw new Error("Sales Order No. cannot be blank");
      } else if (doc_type == "R") {
        throw new Error("RMDA No. cannot be blank");
      } else if (doc_type == "D") {
        throw new Error("SDV No. cannot be blank");
      }
    }
    res.status(200).json({ type: "success", data: { ...responseData } });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ type: "error", message: error.message });
  }
};

// validate divert_inv_no
const validateDivertInvNo = async (req, res) => {
  let { doc_type, divert_inv_no, divert_inv_id } = req?.query;

  if (!divert_inv_id || divert_inv_id === "undefined" || divert_inv_id === "") {
    divert_inv_id = null;
  } else {
    divert_inv_id = Number(divert_inv_id); // cast to number if bigint
  }

  let authFlag, cancelFlag, pdivert_inv_id, divertInvId;
  try {
    if (doc_type == "V") {
      if (divert_inv_no && divert_inv_id) {
        const result = await db.query(
          `
          select i.auth_flag, i.cancel_flag, i.inv_id, divert_inv_id
					from mhsminv i
					where i.inv_no = $1
					  and i.inv_id = $2;
          `,
          [divert_inv_no, divert_inv_id]
        );

        if (result.rowCount == 0) {
          const result2 = await db.query(
            `
              	select i.auth_flag, i.cancel_flag, i.inv_id, divert_inv_id
					from mhsminv i
					where i.inv_no = $1;
              `,
            [divert_inv_no]
          );
          if (result2.rowCount == 0) {
            throw new Error("Divert Invoice No. does not exist");
          } else if (result2.rowCount > 1) {
            throw new Error(
              "Divert Invoice No. exist more than one, please select from help"
            );
          } else if (result2.rowCount == 1) {
            authFlag = result2.rows[0].auth_flag;
            cancelFlag = result2.rows[0].cancel_flag;
            pdivert_inv_id = result2.rows[0].inv_id;
            divertInvId = result2.rows[0].divert_inv_id;
          }
        } else if (result.rowCount == 1) {
          authFlag = result.rows[0].auth_flag;
          cancelFlag = result.rows[0].cancel_flag;
          pdivert_inv_id = result.rows[0].inv_id;
          divertInvId = result.rows[0].divert_inv_id;
        } else if (result.rowCount > 1) {
          throw new Error(
            "Divert Invoice No. exist more than one, please select from help"
          );
        }

        if (cancelFlag == "Y") {
          throw new Error("Divert Invoice already Cancelled");
        } else if (authFlag == "N") {
          throw new Error("Divert Invoice does not Authorised");
        }
      }
    }
    res
      .status(200)
      .json({ type: "success", data: { divert_inv_id: pdivert_inv_id } });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// validate item code
exports.verifyHSNCode = catchAsync(async (req, res) => {
  const {
    it_code,
    c_code: customerCode,
    inv_type,
    division_id,
    trans_year,
  } = req.query;

  if (!it_code || !customerCode || !division_id || !trans_year) {
    return res.status(400).json({
      message:
        "Missing required query parameters: it_code, c_code, division_id or trans_year",
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT HSN_SAC_CODE FROM MOMMITEM WHERE IT_CODE = $1`,
      [it_code]
    );

    if (rows.length === 0) {
      return res.status(200).json({ hsn_sac_code: null });
    }

    const hsn_sac_code = rows[0].hsn_sac_code;
    const response = { hsn_sac_code };

    // Get GST State Code (non-blocking)
    let gst_state_code = null;

    try {
      const gstStateQuery = `
        SELECT GST_STATE_CODE AS gst_state_code FROM MOITSTATE S 
        WHERE TYPE = 'S' AND STATE_ID = (
          SELECT NN.STATE_ID FROM MOITDIVISION NN WHERE NN.DIVISION_ID = $1
        ) LIMIT 1;
      `;
      const gstStateResult = await db.query(gstStateQuery, [division_id]);
      gst_state_code = gstStateResult.rows[0]?.gst_state_code || null;
      if (gst_state_code) {
        response.gst_state_code = gst_state_code;
      }
    } catch (err) {
      console.error("Non-blocking GST state code fetch failed:", err.message);
    }


    // Call sm_so_fill_gst_dtl_itemwise (non-blocking)
    if (hsn_sac_code && gst_state_code) {
      try {
        const gstDetailQuery = `
          SELECT * FROM sm_so_fill_gst_dtl_itemwise(
            $1, $2, NULL, $3, 0, $4
          )
        `;
        const { rows: gstRows } = await db.query(gstDetailQuery, [
          hsn_sac_code,
          customerCode, // bill_to_code assumed as c_code
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
      } catch (err) {
        console.error("GST detail function call failed:", err.message);
      }
    }

    // Customer-specific logic
    const customerResult = await db.query(
      `SELECT CUS_IT_CODE, cus_it_desc FROM mosmpcus 
       WHERE c_code = $1 AND it_code = $2 AND active = 'Y' LIMIT 1`,
      [customerCode, it_code]
    );

    const customerData = customerResult.rows[0];

    if (customerData?.cus_it_code != null) {
      response.cus_it_code = customerData.cus_it_code;
      response.cus_it_desc = customerData.cus_it_desc;
    } else {
      const itemResult = await db.query(
        `SELECT p.it_desc, p.it_um_cd AS it_uom, 
                c.cus_it_code, c.cus_it_desc, p.apply_tax_paid_price
         FROM mosmprod p
         FULL OUTER JOIN mosmpcus c 
           ON c.c_code = $1 AND c.it_code = p.it_code AND c.active = 'Y'
         WHERE p.it_code = $2 AND p.active = 1 LIMIT 1`,
        [customerCode, it_code]
      );

      if (itemResult.rows.length > 0) {
        const {
          it_desc,
          it_uom,
          cus_it_code,
          cus_it_desc,
          apply_tax_paid_price,
        } = itemResult.rows[0];

        Object.assign(response, {
          it_desc: it_desc ?? null,
          it_uom: it_uom ?? null,
          cus_it_code: cus_it_code ?? null,
          cus_it_desc: cus_it_desc ?? null,
          apply_tax_paid_price: apply_tax_paid_price ?? null,
        });
      }
    }

    // Sale AC head logic
    if (inv_type) {
      const { rows: saleHeadRows } = await db.query(
        `SELECT sm_so_get_sale_ac_head($1, $2, $3) AS sale_ac_head`,
        [inv_type, customerCode, it_code]
      );

      const sale_ac_head = saleHeadRows[0]?.sale_ac_head || null;
      let sale_ac_desc = null;

      if (sale_ac_head) {
        const { rows: descRows } = await db.query(
          `SELECT acc_desc FROM vwGlmActive 
           WHERE division_id = $1 AND acc_no = $2 AND trans_year = $3`,
          [division_id, sale_ac_head, trans_year]
        );
        sale_ac_desc = descRows[0]?.acc_desc || null;
      }

      Object.assign(response, { sale_ac_head, sale_ac_desc });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("HSN code verification error:", error);
    return res.status(500).json({
      message: "Failed to verify HSN code",
      error: error.message,
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  if (req?.query?.get_data) {
    await getDataOnQuery(req, res);
    return;
  }
});

exports.validateFormField = catchAsync(async (req, res, next) => {
  const { validate_field } = req?.query;

  switch (validate_field) {
    case "inv_type":
      {
        validateInvType(req, res);
      }
      break;
    case "doc_no":
      {
        validateDocNo(req, res);
      }
      break;
    case "divert_inv_no":
      {
        validateDivertInvNo(req, res);
      }
      break;

    default:
      break;
  }
});
