const { db } = require("../../../config/dbConnection");
const catchAsync = require("../../../utility/catchAsync");
const {
  dateFormater,
  dateFormaterWithTime,
} = require("../../../utility/constant");
const { generateSingleInsertQuery } = require("../../../utility/query");
const {
  transFormMhsmInvData,
  transFormMdsmInvData,
} = require("./presentation");

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const TABLE_NAMES = {
  MHSMINV: "mhsminv",
  MDSMINV: "mdsminv",
  GEN_INV_ID: `nextval('s_mhsminv_inv_id')`,
  GEN_SRL_NO: `nextval('s_mdsminv_sr_no')`,
};

exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  const divisionList = await db.query(
    `select name, division_id from moitdivision order by 1`,
  );

  const invTypeList = await db.query(
    `select da_cat_desc, da_cat as doc_type 
      from mosmdact 
      where invoice = 'Y'`,
  );

  const docTypeList = await db.query(
    `select description, prefix from vwinvdoc order by description `,
  );

  const currencyList = await db.query(
    `select curr_desc, curr_code  as curr_cd from currency order by 1`,
  );

  const despatchList = await db.query(
    `select name ,c_code from moitdivision order by name`,
  );

  const preInvList = await db.query(
    `select pre_inv_no, pre_id pre_id
      from themprin p, mosmcust c
      where p.c_code = c.c_code
      order by pre_inv_no`,
  );

  const paymentTermList = await db.query(
    `select term_desc, term_code from mhmmterm where sale_or_purchase = 'S' order by term_desc`,
  );

  const storageList = await db.query(
    `select description, code from mommcode where cat_group = 'STORAG'`,
  );

  const bankList = await db.query(
    `select acc_no as bank_code, bank_name, bnk_ac_no  from mhfmbank where curr_code  = $1`,
    ["INR"],
  );

  return res.status(200).json({
    division: divisionList.rows || [],
    invType: invTypeList.rows || [],
    docType: docTypeList.rows || [],
    currency: currencyList.rows || [],
    despatch: despatchList.rows || [],
    preInv: preInvList.rows || [],
    paymentTerm: paymentTermList.rows || [],
    storage: storageList.rows || [],
    bank: bankList.rows || [],
  });
});

const getDataOnQuery = async (req, res) => {
  let whereClauses = [];

  // Define search keys that should be checked in WHERE clause
  let searchKeys = ["inv_no", "inv_dt", "c_code"];

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
  let user_id = req?.userInfo?.user_id || 583;

  // todo: remove this after resolving the issue of cookies not seted in client

  try {
    // let queryParameter = `ORDER BY inv_no LIMIT 1 OFFSET ${
    let queryParameter = `ORDER BY regexp_replace(inv_no, '.*\/', '')::int LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;
    let recordCount;
    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(inv_id) FROM ${TABLE_NAMES.MHSMINV} WHERE trans_year = $1 AND Division_id = $2 ${queryValues}`,
        [transYear, divisionId],
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(inv_id) FROM ${TABLE_NAMES.MHSMINV} where division_id = $1 AND TRANS_YEAR = $2`,
            [divisionId, transYear],
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }

        case "Last": {
          queryParameter = "ORDER BY regexp_replace(inv_no, '.*\/', '')::int DESC LIMIT 1";
          break;
        }

        default:
          queryParameter = `ORDER BY regexp_replace(inv_no, '.*\/', '')::int LIMIT 1 OFFSET ${
            req.query.offset || 0
          }`;
          break;
      }
    }

    const mhsmInvData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MHSMINV} where division_id = $1 AND TRANS_YEAR = $2 ${queryParameter}`,
      [divisionId, transYear],
    );

    if (mhsmInvData.rowCount == 0) {
      return res.status(200).json({
        type: "error",
        message: "No Record Found",
        mhsmInvData: [],
        mdsmInvData: [],
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
    const flagCusVan = mhsmInvData.rows[0]?.flag_cus_van;
    

    // POST QUERY DATA

    if (docType === "N") {
      if (invDa === "Y") {
        const daNo = await db.query(
          `  select da_no from mhsmda
        where da_id = $1`,
          [daId],
        );

        mhsmInvData.rows[0].doc_no =
          daNo.rowCount > 0 ? daNo.rows[0].da_no : "";
      }

      if (invDa === "N") {
        const orderNo = await db.query(
          `  select order_no 
        from mhsmordr
        where order_id = $1`,
          [orderId],
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
        [orderId],
      );

      mhsmInvData.rows[0].doc_no =
        orderNo.rowCount > 0 ? orderNo.rows[0].order_no : "";

      if (divertInvId !== null) {
        const divInvNo = await db.query(
          `   select inv_no  from mhsminv
		      where inv_id = $1;`,
          [divertInvId],
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
        [rejGpId, rejGpId],
      );

      mhsmInvData.rows[0].doc_no =
        regGpDtl.rowCount > 0 ? regGpDtl.rows[0].rej_gpno : "";
    }

    if (docType === "D") {
      const docDtl = await db.query(
        ` select doc_no  from thmmmchl
      where doc_id = $1`,
        [docId],
      );

      mhsmInvData.rows[0].doc_no =
        docDtl.rowCount > 0 ? docDtl.rows[0].doc_no : "";
    }

//     if (["N", "S", "V", "P"].includes(docType)) {
//       partyCode = cCode;
//       const cDtl = await db.query(
//         ` SELECT c.c_name AS party_name, 
//          c.gst_no AS gst_no,
//          s.c_name AS ship_name,
//           b.c_name AS bill_name
//         FROM mosmcust c, mosmcust s, mosmcust b
//         WHERE c.c_code = $1
//           AND s.c_code = $2
//           AND b.c_code = $3
// `,
//         [cCode, shipToCode, billToCode],
//       );

//       mhsmInvData.rows[0].gst_no =
//       cDtl.rowCount > 0 ? cDtl.rows[0].gst_no : "";

//       mhsmInvData.rows[0].party_name =
//         cDtl.rowCount > 0 ? cDtl.rows[0].party_name : "";

//       mhsmInvData.rows[0].ship_to_name =
//         cDtl.rowCount > 0 ? cDtl.rows[0].ship_name : "";

//       mhsmInvData.rows[0].bill_to_name =
//         cDtl.rowCount > 0 ? cDtl.rows[0].bill_name : "";
//     }

//     if (["R", "D"].includes(docType)) {
//       partyCode = vCode;
//       const vDtl = await db.query(
//         ` select c.v_name as party_code, s.v_name as ship_code, b.v_name as bill_code
//       from mommvend c, mommvend s, mommvend b
//         where c.v_code = $1
//           and s.v_code  = $2
//           and b.v_code  = $3`,
//         [vCode, shipToCode, billToCode],
//       );

//       mhsmInvData.rows[0].party_name =
//         vDtl.rowCount > 0 ? vDtl.rows[0].party_code : "";

//       mhsmInvData.rows[0].ship_to_name =
//         vDtl.rowCount > 0 ? vDtl.rows[0].ship_code : "";

//       mhsmInvData.rows[0].bill_to_name =
//         vDtl.rowCount > 0 ? vDtl.rows[0].bill_code : "";
//     }


if (["N", "S", "V", "P"].includes(docType)) {
  partyCode = cCode;

  if (flagCusVan === "C") {
    // CUSTOMER
    const cDtl = await db.query(
      `SELECT 
          c.c_name AS party_name,
          c.gst_no AS gst_no,
          s.c_name AS ship_name,
          b.c_name AS bill_name
       FROM mosmcust c, mosmcust s, mosmcust b
       WHERE c.c_code = $1
         AND s.c_code = $2
         AND b.c_code = $3`,
      [cCode, shipToCode, billToCode],
    );

    mhsmInvData.rows[0].gst_no =
      cDtl.rowCount > 0 ? cDtl.rows[0].gst_no : "";

    mhsmInvData.rows[0].party_name =
      cDtl.rowCount > 0 ? cDtl.rows[0].party_name : "";

    mhsmInvData.rows[0].ship_to_name =
      cDtl.rowCount > 0 ? cDtl.rows[0].ship_name : "";

    mhsmInvData.rows[0].bill_to_name =
      cDtl.rowCount > 0 ? cDtl.rows[0].bill_name : "";
  } 
  
  else if (flagCusVan === "V") {
    // VENDOR
    const vDtl = await db.query(
      `SELECT 
          c.v_name AS party_name,
          c.gst_no AS gst_no,
          s.v_name AS ship_name,
          b.v_name AS bill_name
       FROM mommvend c, mommvend s, mommvend b
       WHERE c.v_code = $1
         AND s.v_code = $2
         AND b.v_code = $3`,
      [cCode, shipToCode, billToCode],
    );

    mhsmInvData.rows[0].gst_no =
      vDtl.rowCount > 0 ? vDtl.rows[0].gst_no : "";

    mhsmInvData.rows[0].party_name =
      vDtl.rowCount > 0 ? vDtl.rows[0].party_name : "";

    mhsmInvData.rows[0].ship_to_name =
      vDtl.rowCount > 0 ? vDtl.rows[0].ship_name : "";

    mhsmInvData.rows[0].bill_to_name =
      vDtl.rowCount > 0 ? vDtl.rows[0].bill_name : "";
  }
}


    if (orderId !== null) {
      // console.log("order id is not null");
      const poDtl = await db.query(
        `select o.c_po_no as po_no, c.curr_desc as curr_desc, o.curr_conv as curr_conv, annual_flag, jw
          from mhsmordr o, currency c
          where o.order_id = $1
          and o.curr_cd = $2`,
        [orderId, currCode],
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

      // console.log("poDtl result:", poDtl);
      // console.log("orderId:", orderId, "currCode:", currCode);

      // console.log(
      //   poDtl.rows[0]?.po_no,
      //   poDtl.rows[0]?.curr_conv,
      //   poDtl.rows[0]?.annual_flag,
      //   poDtl.rows[0]?.jw
      // );
    }

    const commodityDtl = await db.query(
      `   select commodity_desc  from commodity
  where commodity_code = $1`,
      [commodity],
    );

    mhsmInvData.rows[0].commodity_desc =
      commodityDtl.rowCount > 0 ? commodityDtl.rows[0]?.commodity_desc : "";

    const otherDtl = await db.query(
      ` 	select acc_desc
  from mhfmglm
  where acc_no = $1`,
      [otherAcHead],
    );

    mhsmInvData.rows[0].other_ac_desc1 =
      otherDtl.rowCount > 0 ? otherDtl.rows[0]?.acc_desc : "";

    const otherDtl1 = await db.query(
      ` 	select acc_desc
  from mhfmglm 
  where acc_no = $1`,
      [otherAcHead1],
    );

    mhsmInvData.rows[0].other_ac_desc2 =
      otherDtl1.rowCount > 0 ? otherDtl1.rows[0]?.acc_desc : "";

    const otherDtl2 = await db.query(
      ` 	select acc_desc
  from mhfmglm 
  where acc_no = $1`,
      [otherAcHead2],
    );

    mhsmInvData.rows[0].other_ac_desc3 =
      otherDtl2.rowCount > 0 ? otherDtl2.rows[0]?.acc_desc : "";

    const vendorDtl = await db.query(
      `select voucher_id, voucher_no
        from thfmtran
        where trans_type like 'S%'
        and bill_id = $1`,
      [docId],
    );

    mhsmInvData.rows[0].voucher_id =
      vendorDtl.rowCount > 0 ? vendorDtl.rows[0].voucher_id : "";

    mhsmInvData.rows[0].voucher_no =
      vendorDtl.rowCount > 0 ? vendorDtl.rows[0].voucher_no : "";

    const creditDtl = await db.query(
      `select voucher_id, voucher_no
        from thfmtran
        where trans_type = 'RN'
          and bill_id = $1`,
      [docId],
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
        [appDivisionId, rmgpId],
      );

      mhsmInvData.rows[0].rmgp_no =
        rmgpDtl.rowCount > 0 ? rmgpDtl.rows[0].doc_no : "";
    }

    if (despatch !== null) {
      const despDtl = await db.query(
        `	select coalesce(excisable,'N')
					from mosmdact
				where da_cat = $1`,
        [invType],
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
        [despatch],
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
        [despatch],
      );
      mhsmInvData.rows[0].parameter_wc_id =
        wcDtl1.rowCount > 0 ? wcDtl1.rows[0].wc_id : "";
    }

    const transDtl = await db.query(
      ` SELECT TRANS_DATE,TRANS_NO 
          FROM THFMTRAN_GST_DBCR
          WHERE TRANS_ID = $1`,
      [advVchrId],
    );

    if (mhsmInvData.rows[0]?.debit_acc_code) {
      const debit_acc_desc = await db.query(
        "select acc_desc from mhfmglm where acc_no = $1",
        [mhsmInvData.rows[0].debit_acc_code],
      );
      mhsmInvData.rows[0].debit_acc_desc = debit_acc_desc.rows[0].acc_desc;
    }

    mhsmInvData.rows[0].advance_voucher_date =
      transDtl.rowCount > 0 ? dateFormater(transDtl.rows[0].trans_date) : "";

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

    mhsmInvData.rows[0].prep_dt =
      mhsmInvData.rowCount > 0
        ? dateFormaterWithTime(mhsmInvData.rows[0].prep_dt)
        : "";

    const mdsmInvData = await db.query(
      `SELECT * FROM ${TABLE_NAMES.MDSMINV} 
 WHERE inv_id = $1
 ORDER BY 
   CASE 
     WHEN access_sr_no IS NULL THEN sr_no 
     ELSE access_sr_no 
   END, 
   sr_no`,
      [docId],
    );

    // POST-QUERY DATA
    if (mdsmInvData.rows.length > 0) {
      await Promise.all(
        mdsmInvData.rows.map(async (item) => {
          if (item.da_id !== null) {
            const doc_no = await db.query(
              `   select da_no from mhsmda
  where da_id = $1 `,
              [item.da_id],
            );

            item.doc_no = doc_no.rows[0]?.da_no || null;
          }

          if (item.it_code !== null) {
            const expDtl = await db.query(
              `  select coalesce(expiry_day_check,0) 
                  from mommitem
                  where it_code = $1`,
              [item.it_code],
            );

            item.expdays = expDtl.rows[0]?.expiry_day_check || null;
          }

          if (item.it_code !== null) {
            const it_name = await db.query(
              `  select it_name from mommitem where it_code = $1   `,
              [item.it_code],
            );

            item.it_desc = it_name.rows[0]?.it_name || null;
          }

          if (item.cus_it_code !== null) {
            // comment this below logic for fetching cus_it_desc by amit
            // const cus_it_code = await db.query(
            //   ` select it_name_long from mommitem where it_code = $1 `,
            //   [item.cus_it_code]
            // );
            const cus_it_desc = await db.query(
              `select cus_it_desc from mosmpcus where cus_it_code = $1 `,
              [item.cus_it_code],
            );

            item.cus_it_desc = cus_it_desc.rows[0]?.cus_it_desc || null;
          }

          if (item.sale_ac_head !== null) {
            const sale_ac_head = await db.query(
              ` select h.acc_desc as acc_desc from mdfmglm d, mhfmglm h
    where d.acc_no = $1
      and d.division_id = $2
      and d.acc_no = h.acc_no
      and trans_year = $3 `,
              [item.sale_ac_head, appDivisionId, appFinYear],
            );

            item.sale_ac_desc = sale_ac_head.rows[0]?.acc_desc || null;
          }

          if (item.it_code !== null) {
            const catalog_code = await db.query(
              `select catalog_code
    from mosmprod
    where it_code = $1 `,
              [item.it_code],
            );

            item.catalog_code = catalog_code.rows[0]?.catalog_code || null;
          }

          if (item.wc_id !== null) {
            const wc_desc = await db.query(
              `	select description 
    from mommwc 
   where wc_id = $1`,
              [item.wc_id],
            );

            item.description = wc_desc.rows[0]?.description || null;
          }

          if (item.it_code !== null) {
            const hsnSac = await db.query(
              ` SELECT HSN_SAC_CODE 
    FROM mommitem 
   WHERE IT_CODE = $1 `,
              [item.it_code],
            );

            item.hsn_sac_code = hsnSac.rows[0]?.hsn_sac_code || null;
          }
        }),
      );
    }

    const responseData = {
      type: "found",
      mhsmInvData: {
        ...mhsmInvData.rows[0],
        party_code: mhsmInvData.rows[0]?.c_code,
      },
      mdsmInvData: mdsmInvData.rows || [{}],
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

const genInvoiceId = async (req, res) => {
  try {
    await db.query("BEGIN");

    const getInvId = await db.query(`SELECT ${TABLE_NAMES.GEN_INV_ID}`);
    const genInvId = getInvId.rows[0]?.nextval;

    await db.query("COMMIT");

    res.status(200).json({
      type: "success",
      gen_inv_id: genInvId,
    });
  } catch (error) {
    await db.query("ROLLBACK"); // Always rollback on error
    console.error("Error generating invoice ID:", error);

    res.status(500).json({
      type: "error",
      message:
        error.message || "Internal server error while generating invoice ID",
    });
  }
};

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    form_status,
    help_list,
    party_type
  } = req?.query;
  try {
    if (!["Insert", "Update", "Search"].includes(form_status)) {
      return res.status(200).send([]);
    }
    const helpList = help_list;

    let query = "";
    let values = [];

    switch (helpList) {
      // 1. Customer code in Main Tab (Help List)
     case "party_code": {

  if (party_type === "V") {

    query = ` SELECT v_code,v_name, v_city_name as city, gst_no FROM mommvend ORDER BY v_name`;

  } else {

    query = `
      SELECT a.c_name, a.c_code, c.gst_no,
        SUBSTR(get_from_state(c.c_city, 'C', 'N'), 1, 100) AS city
      FROM vwcustactive a
      JOIN mosmcust c
        ON a.c_code = c.c_code
      JOIN mommcode ss
        ON c.cust_type = ss.code
      ORDER BY a.c_name
    `;

  }

  break;
}

      // 2. Sales person in detail section
      case "sale_ac_head":
        query = `select acc_desc, acc_no from vwglmactive where division_id = $1 and trans_year =$2 order by acc_no`;
        values = [divisionId, transYear];
        break;

      // 2.1 Debit Account Head added on 10-03-2026
      case "debit_acc_code":
        query = `select acc_no, acc_desc from mhfmglm order by acc_no`;

        break;

      // 3. Catalog code in Item Tab
      case "catalog_code":
        query = `
            SELECT catalog_code, it_code, it_desc 
            FROM mosmprod 
            WHERE active = 1 
            ORDER BY catalog_code
          `;
        break;

      // 4. Item code in Item Tab
      case "it_code":
        const { inv_type } = req?.query;
    //     query = `
    //   SELECT it_code, it_name, hsn_sac_code FROM MOMMITEM I
    //           WHERE EXISTS
    //           (SELECT 1 FROM MOSMGST_STATE S
    //           WHERE S.HSN_SAC_CODE = I.HSN_SAC_CODE
    //           AND SAL_OR_ST = 'V')
		// 	  and exists(select 1 from mosmdact c
		// 	  where upper (da_cat_desc) like '%SERVICE%'
		// 	  and c.da_cat = $1)
		// union
		//       SELECT it_code, it_name, hsn_sac_code FROM MOMMITEM I
    //           WHERE EXISTS
    //           (SELECT 1 FROM MOSMGST_STATE S
    //           WHERE S.HSN_SAC_CODE = I.HSN_SAC_CODE
    //           AND SAL_OR_ST = 'V')
		// 	  and exists(select 1 from mosmdact c
		// 	  where upper (da_cat_desc) not like '%SERVICE%'
		// 	  and c.da_cat = $1)
    //           order by it_code
    //       `;

      query = `
    SELECT 
        I.it_code, 
        I.it_name, 
        I.hsn_sac_code,
        V.it_rate
    FROM MOMMITEM I
    LEFT JOIN MDMMVEND V 
        ON V.it_code = I.it_code

    WHERE EXISTS (
        SELECT 1 
        FROM MOSMGST_STATE S
        WHERE S.HSN_SAC_CODE = I.HSN_SAC_CODE
        AND SAL_OR_ST = 'V'
    )
    AND EXISTS (
        SELECT 1 
        FROM MOSMDACT C
        WHERE UPPER(da_cat_desc) LIKE '%SERVICE%'
        AND C.da_cat = $1
    )

    UNION

    SELECT 
        I.it_code, 
        I.it_name, 
        I.hsn_sac_code,
        V.it_rate
    FROM MOMMITEM I
    LEFT JOIN MDMMVEND V 
        ON V.it_code = I.it_code

    WHERE EXISTS (
        SELECT 1 
        FROM MOSMGST_STATE S
        WHERE S.HSN_SAC_CODE = I.HSN_SAC_CODE
        AND SAL_OR_ST != 'V'
    )
    AND EXISTS (
        SELECT 1 
        FROM MOSMDACT C
        WHERE UPPER(da_cat_desc) NOT LIKE '%SERVICE%'
        AND C.da_cat = $1
    )

    ORDER BY it_code
  `;

        values = [inv_type];
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

exports.verifyHSNCode = catchAsync(async (req, res) => {
  const {
    it_code,
    // c_code: customerCode,
      party_code: partyCode,
  party_type: partyType = "C",
    inv_type,
    division_id,
    trans_year,
  } = req.query;

 if (!it_code || !partyCode || !division_id || !trans_year) {
  return res.status(400).json({
    message:
      "Missing required query parameters: it_code, party_code, division_id or trans_year",
  });
}

  try {
    const { rows } = await db.query(
      `SELECT HSN_SAC_CODE FROM MOMMITEM WHERE IT_CODE = $1`,
      [it_code],
    );

    if (rows.length === 0) {
      return res.status(200).json({ hsn_sac_code: null });
    }

    const hsn_sac_code = rows[0].hsn_sac_code;
    const response = { hsn_sac_code };

    // Get GST State Code (non-blocking)
    let gst_state_code = null;

    // try {
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
    // } catch (err) {
    //   console.error("Non-blocking GST state code fetch failed:", err.message);

    // }

    // Call sm_so_fill_gst_dtl_itemwise (non-blocking)
    if (hsn_sac_code && gst_state_code) {
      // try {

      // const gstDetailQuery = `SELECT * FROM sm_so_fill_gst_dtl_itemwise($1, $2, NULL, $3, 0, $4)`;

      const gstDetailQuery = `SELECT * FROM sm_so_fill_gst_dtl_itemwise($1, $2, NULL, $3, 0, $4, $5)`;

      // console.log(hsn_sac_code, customerCode, it_code, gst_state_code);

      console.log( hsn_sac_code, partyCode, partyType, it_code, gst_state_code);

      // const { rows: gstRows } = await db.query(gstDetailQuery, [
      //   hsn_sac_code,
      //   customerCode, // bill_to_code assumed as c_code
      //   it_code,
      //   gst_state_code,
      // ]);

      const { rows: gstRows } = await db.query(gstDetailQuery, [
        hsn_sac_code,
        partyCode,
        it_code,
        gst_state_code,
        partyType,
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

    // Customer-specific logic
    const customerResult = await db.query(
      `SELECT CUS_IT_CODE, cus_it_desc FROM mosmpcus 
       WHERE c_code = $1 AND it_code = $2 AND active = 'Y' LIMIT 1`,
      [partyCode, it_code],
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
        [partyCode, it_code],
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
        [inv_type, partyCode, it_code],
      );

      const sale_ac_head = saleHeadRows[0]?.sale_ac_head || null;
      let sale_ac_desc = null;

      if (sale_ac_head) {
        const { rows: descRows } = await db.query(
          `SELECT acc_desc FROM vwGlmActive 
           WHERE division_id = $1 AND acc_no = $2 AND trans_year = $3`,
          [division_id, sale_ac_head, trans_year],
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

exports.handleSubmitData = catchAsync(async (req, res) => {
  const { formHdrData, formItemData } = req.body;
  const { userId, form_status } = req?.query;

  const { division_id, trans_year } = formHdrData;

   delete formHdrData.gst_no;


  formHdrData.inv_id = Number(formHdrData?.inv_no.substring(1));
  // formHdrData.c_code = formHdrData?.party_code;

    if (formHdrData?.flag_cus_van === "V") {
      formHdrData.v_code = formHdrData?.party_code;
      formHdrData.c_code = formHdrData?.party_code;

    } else {
      formHdrData.c_code = formHdrData?.party_code;
    }

delete formHdrData.party_code;

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

  if (!formItemData) {
    return res
      .status(400)
      .json({ type: "error", message: "Please fill Item details" });
  }

  try {
    await db.query("BEGIN");

    // Generate Invoice No
    const genInvoiceNo = await db.query(`select geninvno($1,$2,$3) as inv_no`, [
      "T",
      trans_year,
      division_id,
    ]);

    formHdrData.inv_no = genInvoiceNo.rows[0]?.inv_no;

    //Insert (MHSMINV) data logic
    let getTransFormData = transFormMhsmInvData(formHdrData);
    const insertHdrQuery = generateSingleInsertQuery(
      TABLE_NAMES.MHSMINV,
      getTransFormData,
      "create_date",
    );
    const insertHdrValues = Object.values(getTransFormData);
    // console.log(getTransFormData)
    // console.log(insertHdrQuery, insertHdrValues);

    // -- ######## inserting query #########
    await db.query(insertHdrQuery, insertHdrValues);

    // Insert (MDSMINV) data logic
    const getTransFormDetailData = transFormMdsmInvData(
      formItemData,
      formHdrData?.inv_id,
    );

    for (const record of getTransFormDetailData) {
      const getSrlNoSeq = await db.query(`SELECT ${TABLE_NAMES.GEN_SRL_NO}`);
      record.sr_no = Number(getSrlNoSeq.rows[0]?.nextval);

      const insertDetailQuery = generateSingleInsertQuery(
        TABLE_NAMES.MDSMINV,
        record,
        "create_date",
      );
      // console.log(insertDetailQuery, Object.values(record));
      await db.query(insertDetailQuery, Object.values(record));
    }

    await db.query("commit");

    res.status(200).send({
      type: "success",
      message: "record successfully saved",
      gen_inv_no: genInvoiceNo.rows[0]?.inv_no,
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

exports.updateSerInvData = catchAsync(async (req, res) => {
  const { formHdrData, formItemData, newFormItemData, deletedItemData } =
    req.body;
  const { userId, form_status } = req?.query;

  if (
    !deletedItemData.length &&
    !newFormItemData.length &&
    !formItemData.length &&
    !Object.keys(formHdrData).length
  ) {
    return res.status(400).json({
      type: "error",
      message: "No update data Found! Please update the data",
    });
  }

  if (form_status !== "Update") {
    return res.status(400).json({
      type: "error",
      message: `Cannot submit data please do press Update Button`,
    });
  }

  const inv_id = formHdrData?.inv_id;
  const inv_no = formHdrData?.inv_no;
  const party_name = formHdrData?.party_name;
  

  delete formHdrData.inv_id;
  delete formHdrData.inv_no;
  delete formHdrData.party_name;
  delete formHdrData?.debit_acc_desc;
  delete formHdrData?.gst_no;

  const partyType = formHdrData?.flag_cus_van;

if (formHdrData?.flag_cus_van === "V") {
  // Vendor → c_code and v_code both same
  formHdrData.c_code = formHdrData.v_code;
} else if (formHdrData?.flag_cus_van === "C") {
  // Customer → only c_code, vendor code must be cleared
  formHdrData.v_code = null;
}

  try {
    await db.query("BEGIN");

    // ## UPDATE MHSMINV DATA
    if (Object.keys(formHdrData).length && inv_id) {
      const columns = Object.keys(formHdrData);
      const values = Object.values(formHdrData);
      // Create SET clause for SQL UPDATE query
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");
      // Generate the full SQL query
      const query = `UPDATE ${TABLE_NAMES.MHSMINV} SET ${setClause}
         WHERE inv_id = $${columns.length + 1}`;
      await db.query(query, [...values, inv_id]);
    }

    // ## DELETE MDSMINV RECORDS
    if (Array.isArray(deletedItemData) && deletedItemData?.length > 0) {
      const deleteIds = deletedItemData
        .map((_, index) => `$${index + 1}`)
        .join(",");
      // const deleteInvDetailDataQuery = `DELETE from ${TABLE_NAMES.MDSMINV} WHERE inv_id = '${inv_id}' AND sr_no in (${deleteIds})`;
      // await db.query(deleteInvDetailDataQuery,[...deletedItemData]);

      const deleteInvDetailDataQuery = `DELETE from ${
        TABLE_NAMES.MDSMINV
      } WHERE inv_id = $${
        deletedItemData.length + 1
      } AND sr_no in (${deleteIds})`;
      await db.query(deleteInvDetailDataQuery, [...deletedItemData, inv_id]);
    }

    // ## INSERT NEW MDSMINV RECORDS
    const getTransFormDetailData = transFormMdsmInvData(
      newFormItemData,
      inv_id,
    );

    for (const record of getTransFormDetailData) {
      const getSrlNoSeq = await db.query(`SELECT ${TABLE_NAMES.GEN_SRL_NO}`);
      record.sr_no = Number(getSrlNoSeq.rows[0]?.nextval);

      const insertDetailQuery = generateSingleInsertQuery(
        TABLE_NAMES.MDSMINV,
        record,
        "create_date",
      );
      // console.log(insertDetailQuery, Object.values(record));
      await db.query(insertDetailQuery, Object.values(record));
    }

    // ## UPDATE MDSMINV RECORD
    for (const entry of formItemData) {
      if (!entry || Object.keys(entry).length === 0) continue; // ✅ Skip empty rows
      delete entry?.row_id;
      delete entry?.id;
      delete entry?.sale_ac_desc;
      delete entry?.it_desc;
      delete entry?.debit_acc_code;
      delete entry?.debit_acc_desc;
      const { sr_no, ...data } = entry;
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns
        .map((column, index) => `${column} = $${index + 1}`)
        .join(", ");
      const updateQuery = `UPDATE ${
        TABLE_NAMES.MDSMINV
      } SET ${setClause} WHERE sr_no = $${columns.length + 1} and inv_id=$${
        columns.length + 2
      }`;
      await db.query(updateQuery, [...values, sr_no, inv_id]);
    }

    await db.query("commit");

    res.status(200).send({
      type: "success",
      message: "record successfully saved",
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

exports.cancelSerInv = catchAsync(async (req, res) => {
  const { inv_data } = req.body;
  // console.log("Voucher cancellation data:", vchrData);

  try {
   const { cancel_flag, inv_id, id, auth_flag } = inv_data || {};


    if (!inv_id) {
      return res.status(400).json({
        type: "error",
        message: "Missing inv_id in request data.",
      });
    }

   if (auth_flag === 'Y') {
      return res.status(400).json({
        type: "error",
        message: "Please UnAuthorize the Invoice before cancelling.",
      });
    }

    // Optional: Validate cancel value
    if (!["Y", "N"].includes(cancel_flag)) {
      return res.status(400).json({
        type: "error",
        message: 'Invalid cancel_flag value. Must be "Y" or "N".',
      });
    }

    // Optional: Validate user id
    if (!id) {
      return res.status(400).json({
        type: "error",
        message: "Missing user ID.",
      });
    }
    await db.query("begin");
    // Update both tables
    await db.query(
      `UPDATE mhsminv SET cancel_flag = $1, update_id = $2 WHERE inv_id = $3`,
      [cancel_flag, id, inv_id],
    );

    await db.query("commit");
    return res.status(200).json({
      type: "success",
      message:
        cancel_flag === "Y"
          ? "Invoice cancelled successfully."
          : "Invoice cancellation reverted successfully.",
    });
  } catch (error) {
    console.error("Error cancelling Invoice:", error);
    await db.query("rollback");
    return res.status(500).json({
      type: "error",
      message: error.message || "Internal Server Error",
    });
  }
});

exports.printInv = catchAsync(async (req, res) => {
  const { pInv_ID } = req.body;

  if (!pInv_ID) {
    return res.status(400).json({ error: "Missing pInv_ID" });
  }

  const reportName = "invprint_ls";
  const baseOutputName = `${reportName}_${pInv_ID}`;
  const outputFilename = `${baseOutputName}.pdf`;

  const JAR_PATH = path.resolve(
    __dirname,
    "../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
  );

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../reportGeneration/reports/",
  );

  console.log('JAR_PATH', JAR_PATH)
  console.log('REPORT_DIR', REPORT_DIR)


  const finalPdfPath = path.join(REPORT_DIR, outputFilename);

  // Params passed as Jasper parameters only
  const params = {
    pInv_id: { type: "Integer", value: pInv_ID },
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
          "❌ Error generating service invoice print:",
          error?.message || stderr,
        );
        return res
          .status(500)
          .json({ error: "Error generating Service Invoice Print" });
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

exports.authInvoice = catchAsync(async (req, res) => {
  const { inv_id, auth_flag } = req.body.invData; // ✅ fixed

  if (!inv_id || !auth_flag) {
    return res.status(400).json({
      message: "inv_id and auth_flag are required",
    });
  }

  try {
    await db.query("begin");

    const authInv = await db.query(
      `update mhsminv 
       set auth_flag = $1 
       where inv_id = $2 
       and auth_flag = 'N'`,
      [auth_flag, inv_id],
    );

    if (authInv.rowCount === 0) {
      await db.query("rollback");
      return res.status(400).json({
        message: "Invoice already authorised or not found",
      });
    }

    await db.query("commit");

    const getSaleVouchNo = await db.query(
      `
         select voucher_no 
          from thfmtran
          where trans_type like 'S%'
          and bill_id = $1
          order by voucher_no desc
          limit 1;
      `,
      [inv_id],
    );

    let saleVouchNo = "";
    if (getSaleVouchNo.rowCount !== 0) {
      saleVouchNo = getSaleVouchNo.rows[0].voucher_no;
    }

    res.status(200).json({
      type: "Success",
      message: `Invoice Successfully Authorised with Newly Generated Sale Voucher No. ${saleVouchNo}`,
      voucher_no: saleVouchNo,
    });
  } catch (error) {
    await db.query("rollback"); // ✅ important
    return res.status(500).json({
      type: "error",
      message:
        error.message || "Something went wrong with Invoice Authorisation",
    });
  }
});

// exports.fetchCustomerDependentData = catchAsync(async (req, res) => {
//   try {
//     const c_code = req?.query?.c_code;
//     if (!c_code) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameter: c_code" });
//     }
//     const result = await db.query(
//       `SELECT 
//         curr_cd, 
//         term_code, 
//         mode_cd, 
//         del_terms AS price_basis,
//         ex_rate AS curr_conv,
//         CASE WHEN octroi = 'Y' THEN 2 ELSE 1 END AS octroi_flg,
//         CASE WHEN freight = 'Y' THEN 2 ELSE 1 END AS frt_flg,
//         CASE WHEN insurance = 'Y' THEN 2 ELSE 1 END AS ins_flg,
//         COALESCE(port_disc, get_from_state(c_city, 'C', 'N')) AS final_dest
//       FROM mosmcust cc
//       JOIN mommcode ss ON cc.cust_type = ss.code
//       LEFT JOIN moemcurr cu ON cc.curr_cd = cu.curr_code
//       WHERE c_code = $1
//         -- AND UPPER(ss.description) NOT LIKE '%DEALER%'
//         -- AND ss.cat_group = 'CTYPE'
//       `,
//       [c_code],
//     );

//     return res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error("Customer dependent data fetch error:", error);
//     return res.status(500).json({
//       type: "error",
//       message: error.message || "Failed to fetch customer-dependent data",
//     });
//   }
// });

exports.fetchCustomerDependentData = catchAsync(async (req, res) => {
  try {
    const party_code = req?.query?.party_code;
    const party_type = req?.query?.party_type || "C";

    if (!party_code) {
      return res
        .status(400)
        .json({ message: "Missing required query parameter: party_code" });
    }

    let result;

    if (party_type === "V") {
      // =========================
      // Vendor
      // =========================
      result = await db.query(
        `
        SELECT
  mv.curr_cd,
  mv.term_code,
  mv.mode_cd,
  mv.pric_basis AS price_basis,
  cu.ex_rate AS curr_conv,

  CASE
    WHEN mv.octroi_flag = 'Y' THEN 2
    ELSE 1
  END AS octroi_flg,

  CASE
    WHEN mv.frg_flag = 'Y' THEN 2
    ELSE 1
  END AS frt_flg,

  CASE
    WHEN mv.ins_flag = 'Y' THEN 2
    ELSE 1
  END AS ins_flg,

  get_from_state(mv.v_city, 'C', 'N') AS final_dest

FROM mommvend mv
JOIN mommcode ss
  ON mv.vend_type = ss.code
LEFT JOIN moemcurr cu
  ON mv.curr_cd = cu.curr_code
WHERE mv.v_code = $1
        `,
        [party_code]
      );
    } else {
      // =========================
      // Customer
      // =========================
      result = await db.query(
        `
        SELECT   curr_cd,   term_code,   mode_cd,   del_terms AS price_basis,  ex_rate AS curr_conv,

          CASE
            WHEN octroi = 'Y' THEN 2
            ELSE 1
          END AS octroi_flg,

          CASE
            WHEN freight = 'Y' THEN 2
            ELSE 1
          END AS frt_flg,

          CASE
            WHEN insurance = 'Y' THEN 2
            ELSE 1
          END AS ins_flg,

          COALESCE(
            port_disc,
            get_from_state(c_city, 'C', 'N')
          ) AS final_dest

        FROM mosmcust cc
        JOIN mommcode ss
          ON cc.cust_type = ss.code
        LEFT JOIN moemcurr cu
          ON cc.curr_cd = cu.curr_code
        WHERE c_code = $1
        `,
        [party_code]
      );
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Party dependent data fetch error:", error);

    return res.status(500).json({
      type: "error",
      message:
        error.message || "Failed to fetch party-dependent data",
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getDataOnQuery(req, res);
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }

  if (req?.query?.inv_id === "true") {
    await genInvoiceId(req, res);
    return;
  }
});
