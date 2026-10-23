
const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");

const { v4: uuidv4 } = require("uuid");
const { transformGeHdr, transformTdmmrct } = require("./presentation");
const { generateSingleInsertQuery } = require("../../../../utility/query");
const { dateFormater } = require("../../../../utility/constant");

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const TABLE_NAMES = {
  HDR_TABLE: "THMMRCT",
  DTL_TABLE: "TDMMRCT",
};

// On Form Render setup initial Data in form
exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  let global_user_id = req?.userInfo?.global_user_id || 583; // todo: also remove hardcord user from here

  const { formStatus, appFinYear } = req?.query;

  //todo hardcode the user_id = 0 rightnow so do remove when user_id work will be do
  // as user id not engage properly with division
  global_user_id = 0; // HARD CODE  // todo remove this line after user_id issue resolved

  if (!global_user_id && !formStatus) {
    return res.status(404).json({ message: "User Not Found" });
  }

  let new_ge_id = null;
  let getPreInsertData = {};
  if (formStatus === "Insert") {
    const getInwardInfo = await db.query(`select * from callinv_yes($1, $2)`, [
      formStatus,
      "1",
    ]);

    getPreInsertData = { ...getInwardInfo.rows[0] };

    const getGeId = await db.query(`SELECT nextval('seq_ge_id') as ge_id`);
    if (getGeId.rowCount > 0) {
      new_ge_id = getGeId.rows[0]?.ge_id;
    }
  }
  let wcIdSaleReturn1, wcIdSaleReturnOther;
  // when saleReturn will be 1
  const getStoreIdwhenSR1 = await db.query(
    `	
      select cust_jw_wc_id as wc_id
			from moitparmdiv
			where division_id = $1`,
    [1]
  );

  if (getStoreIdwhenSR1.rowCount) {
    wcIdSaleReturn1 = getStoreIdwhenSR1.rows[0].wc_id;
  }

  // when saleReturn will be other then 1
  const getStoreIdwhenSROther = await db.query(
    `	
      select RECEIVING_STORE_WC_ID as wc_id
			from moitparmdiv
			where division_id = $1`,
    [1]
  );

  if (getStoreIdwhenSROther.rowCount) {
    wcIdSaleReturnOther = getStoreIdwhenSROther.rows[0].wc_id;
  }

  const getFreightItem = await db.query(`
    SELECT
        i.it_code,
        i.it_name,
        i.um_code,
        i.it_pu_um,
        i.hsn_sac_code,
        g.cgst_perc AS gst_cgst_val,
        g.sgst_perc AS gst_sgst_val,
        g.igst_perc AS gst_igst_val
       FROM mommitem i
      LEFT JOIN mosmgst_state g
       ON g.hsn_sac_code = i.hsn_sac_code
      WHERE i.it_code = 'WS22'
      ORDER BY g.eff_dt DESC
      LIMIT 1;
  `);

  let freightItem = {};
  if (getFreightItem.rowCount > 0) {
    freightItem = getFreightItem.rows[0];
}

  return res.status(200).json({
    new_ge_id,
    preInsertData: getPreInsertData,
    storeId: { wcId1: wcIdSaleReturn1, wcIdOther: wcIdSaleReturnOther },
     freightItem, 
  });
});


const getGateEntryDataOnQuery = async (req, res) => {
  let whereClauses = [];

   let searchKeys = ['ge_no', 'chln_no','chln_date','v_code','ship_to'];

  for (const key of searchKeys) {
    if (req.query[key] !== undefined && req.query[key] !== "") {
      whereClauses.push(`${key} = '${req.query[key]}'`);
    }
  }

  let queryValues =
    whereClauses.length > 0 ? "AND " + whereClauses.join(" AND ") : "";

  const { formStatus, appDivisionId, appFinYear } = req?.query;
  let transYear = appFinYear || "2023";
  let divisionId = appDivisionId || 1;
  let user_id = req?.userInfo?.user_id || 583;

  let thmmrctData = {};
  let tdmmrctData = [];

  try {
    let queryParameter = `ORDER BY inward_control_no desc LIMIT 1 OFFSET ${
      req.query.offset || 0
    }`;

    let recordCount;

    if (whereClauses.length > 0) {
      const getCount = await db.query(
        `SELECT COUNT(ge_id)
         FROM ${TABLE_NAMES.HDR_TABLE}
         WHERE trans_year = $1 AND division_id = $2 ${queryValues}`,
        [transYear, divisionId]
      );
      recordCount = getCount.rows[0]?.count;
      queryParameter = `${queryValues} ${queryParameter}`;
    } else {
      switch (req?.query?.get_data) {
        case "Query":
        case "First": {
          const getCount = await db.query(
            `SELECT COUNT(ge_id)
             FROM ${TABLE_NAMES.HDR_TABLE}
             WHERE trans_year = $1 AND division_id = $2`,
            [transYear, divisionId]
          );
          recordCount = getCount.rows[0]?.count;
          break;
        }
        case "Last": {
          queryParameter = "ORDER BY inward_control_no DESC LIMIT 1";
          break;
        }
      }
    }

    const gateEntryHdrData = await db.query(
      `SELECT *
       FROM ${TABLE_NAMES.HDR_TABLE}
       WHERE trans_year = $1 AND division_id = $2
       ${queryParameter}`,
      [transYear, divisionId]
    );

    if (!gateEntryHdrData.rows.length) {
      return res.status(200).send({
        type: "not found",
        message: "No Gate Entry data found",
        count: 0,
      });
    }

    thmmrctData = { ...gateEntryHdrData.rows[0] };

    const { material_fr, v_code, po_id, order_id, ge_id } = thmmrctData;

    let p_division_id = null;
    let v_name = null;
    let poType = null;
    let order_no = thmmrctData.order_no;
    let po_order_dt = thmmrctData.po_order_dt;

     const shipToMapping = {
  EDDAL: "ESCORTS DEALERS DEVELOPMENT ASSOCIATION LIMITED",

};

let ship_to_name = null;

if (shipToMapping[thmmrctData.ship_to]) {
  ship_to_name = shipToMapping[thmmrctData.ship_to];
} else if (thmmrctData.ship_to) {
  const shipToRes = await db.query(
    `
    SELECT c_name AS ship_to_name
    FROM mosmcust_master
    WHERE c_code = $1
    `,
    [thmmrctData.ship_to]
  );

  ship_to_name = shipToRes.rows[0]?.ship_to_name || null;
}
    // 1️ Fetch Division when Material From Supplier
    if (material_fr === "S") {
      const divRes = await db.query(
        `SELECT division_id FROM moitdivision WHERE v_code = $1`,
        [v_code]
      );
      if (divRes.rowCount > 1) {
        return res.status(200).json({
          type: "not found",
          count: 0,
          message: "This vendor defined Against more than one Division",
        });
      }
      p_division_id = divRes.rows[0]?.division_id || null;
    }

    // 2️ Vendor validation (when division matched)
    if (material_fr === "S" && p_division_id !== null) {
      if (!v_code) {
        return res.status(400).json({
          type: "not found",
          count: 0,
          message: "Vendor code cannot be blank",
        });
      }
      const vendRes = await db.query(
        `SELECT v_name FROM mommvend WHERE v_code = $1`,
        [v_code]
      );
      if (!vendRes.rowCount) {
        return res.status(400).json({
          type: "not found",
          count: 0,
          message: "Vendor does not exist in Master",
        });
      }
      v_name = vendRes.rows[0].v_name;
    }

    // 3️ Supplier but division NULL → get PO Type + vendor name
    if (material_fr === "S" && p_division_id === null) {
      const poTypeRes = await db.query(`SELECT get_po_type($1) AS po_type`, [
        po_id,
      ]);
      poType = poTypeRes.rows[0]?.po_type || null;

      const vendRes = await db.query(
        `SELECT v_name FROM mommvend WHERE v_code = $1`,
        [v_code]
      );
      v_name = vendRes.rows[0]?.v_name || null;
    }

    // 4️ Customer → Load Order + Customer Name
    if (material_fr === "C") {
      const orderRes = await db.query(
        `SELECT c_po_no AS order_no, c_po_dt AS po_order_dt
         FROM mhsmordr WHERE order_id = $1`,
        [order_id]
      );
      order_no = orderRes.rows[0]?.order_no || order_no;
      po_order_dt = orderRes.rows[0]?.po_order_dt || po_order_dt;

      if (!v_code) {
        return res.status(200).json({
          type: "not found",
          count: 0,
          message: "Customer code cannot be blank",
        });
      }

      const custRes = await db.query(
        `SELECT c_name FROM mosmcust WHERE c_code = $1`,
        [v_code]
      );
      if (!custRes.rowCount) {
        return res.status(200).json({
          type: "not found",
          count: 0,
          message: "Customer does not exist in Master",
        });
      }
      v_name = custRes.rows[0].c_name;
    }

    // 5️ Check BillCashNo Override when sale_return = 5
    const billRes = await db.query(
      `SELECT billcashno 
       FROM ${TABLE_NAMES.HDR_TABLE}
       WHERE ge_id = $1 AND sale_return = 5`,
      [ge_id]
    );
    if (billRes.rowCount > 0 && material_fr === "C") {
      order_no = billRes.rows[0].billcashno;
    }

    // Override into result object
    thmmrctData = {
      ...thmmrctData,
      p_division_id,
      v_name,
       ship_to_name,  
      poType,
      order_no,
      po_order_dt,
      ge_date: dateFormater(thmmrctData?.ge_date),
      chln_date: dateFormater(thmmrctData?.chln_date),
      sale_return: String(thmmrctData?.sale_return),
      invoice_dt: dateFormater(thmmrctData?.invoice_dt),
      inw_no:'Inward',
      inw_no1:'Control No.'
    };

    // #### end of thmmrctData post query logic

    // ## feth tdmmrctData

    const gateEntryDetails = await db.query(
      `select * from ${TABLE_NAMES.DTL_TABLE} where ge_id = $1 order by it_code`,
      [thmmrctData?.ge_id]
    );

    // ----------------------------
// WS22 GST Master
// ----------------------------
let freightGST = null;

const freightGSTRes = await db.query(`
   SELECT
        g.cgst_perc AS gst_cgst_val,
        g.sgst_perc AS gst_sgst_val,
        g.igst_perc AS gst_igst_val
    FROM mommitem i
    JOIN mosmgst_state g
        ON g.hsn_sac_code = i.hsn_sac_code
    WHERE i.it_code = 'WS22'
    LIMIT 1
      
`);

if (freightGSTRes.rowCount > 0) {
    freightGST = freightGSTRes.rows[0];
}

// ----------------------------
// Check PO GST Type
// ----------------------------
// let isIGST = false;

// const normalGSTRes = await db.query(`
//     SELECT
//         gst_igst_val
//     FROM mdmmpoit
//     WHERE po_id = $1
//       AND it_code <> 'WS22'
//     LIMIT 1
// `, [po_id]);

// if (normalGSTRes.rowCount > 0) {
//     isIGST =
//         Number(normalGSTRes.rows[0].gst_igst_val || 0) > 0;
// }

    const firstNormalItem = gateEntryDetails.rows.find(
        row => row.it_code !== "WS22"
    );
    
      let gateEntryValue = 0;

    await Promise.all(
      gateEntryDetails.rows.map(async (item, index) => {
        item.row_id = uuidv4();
        item.row_status = "X"; // same as :Tdmmrct.row_status := 'X';

        // 1️⃣ Fetch Item Name Long & other item info
        const itm = await db.query(
          `SELECT it_name_long, it_name, it_pu_um, COALESCE(std_cost,0) AS std_cost,
                it_type, old_it_code, HSN_SAC_CODE, UM_CODE AS STOCK_UM, 
                it_wgt_kg, iic_ref_no
        FROM mommitem
        WHERE it_code = $1`,
          [item.it_code]
        );

        if (itm.rowCount > 0) {
          const r = itm.rows[0];
          item.it_name_long = r.it_name_long || item.it_name_long;
          item.desc = r.it_name;
          item.uom = r.it_pu_um;
          item.std_cost = r.std_cost;
          item.it_type = r.it_type;
          item.old_it_code = r.old_it_code;
          item.HSN_SAC_CODE = r.hsn_sac_code || item.HSN_SAC_CODE;
          item.STOCK_UM = r.stock_um;
          item.it_wgt_kg = r.it_wgt_kg;
          item.iic_ref_no = r.iic_ref_no; // NEW from Oracle
          item.it_name = r.desc || item.it_name_long; // added by me
        }
        item.recd_qty = item?.qty_recd;

const geRes = await db.query(
  `SELECT
      po_mat_rat,
      gst_cgst_val,
      gst_sgst_val,
      gst_igst_val
   FROM mdmmpoit
   WHERE po_id = $1
   AND it_code = $2`,
  [item.po_id, item.it_code]
);

if (geRes.rowCount > 0) {
  const row = geRes.rows[0];

  item.po_mat_rat = Number(row.po_mat_rat || 0);
  item.gst_cgst_val = Number(row.gst_cgst_val || 0);
  item.gst_sgst_val = Number(row.gst_sgst_val || 0);
  item.gst_igst_val = Number(row.gst_igst_val || 0);

  const taxableValue =
    Number(item.qty_recd || 0) *
    Number(row.po_mat_rat || 0);

  const cgstAmt =
    taxableValue *
    Number(row.gst_cgst_val || 0) / 100;

  const sgstAmt =
    taxableValue *
    Number(row.gst_sgst_val || 0) / 100;

  const igstAmt =
    taxableValue *
    Number(row.gst_igst_val || 0) / 100;

  item.ge_value =
    taxableValue +
    cgstAmt +
    sgstAmt +
    igstAmt;
}

else if (
    item.it_code === "WS22" &&
    freightGST
) {

    let isIGST = false;

    // agar PO me WS22 already defined hai
    const ws22Res = await db.query(
        `SELECT gst_igst_val
         FROM mdmmpoit
         WHERE po_id = $1
           AND it_code = 'WS22'`,
        [item.po_id]
    );

    if (ws22Res.rowCount > 0) {

        isIGST =
            Number(ws22Res.rows[0].gst_igst_val || 0) > 0;

    }

    // agar PO me WS22 nahi hai
    else if (firstNormalItem) {

        const gstRes = await db.query(
            `SELECT gst_igst_val
             FROM mdmmpoit
             WHERE po_id = $1
               AND it_code = $2`,
            [
                firstNormalItem.po_id,
                firstNormalItem.it_code
            ]
        );

        if (gstRes.rowCount > 0) {
            isIGST =
                Number(gstRes.rows[0].gst_igst_val || 0) > 0;
        }

    }

    if (isIGST) {

        item.gst_cgst_val = 0;
        item.gst_sgst_val = 0;
        item.gst_igst_val = Number(freightGST.gst_igst_val);

    } else {

        item.gst_cgst_val = Number(freightGST.gst_cgst_val);
        item.gst_sgst_val = Number(freightGST.gst_sgst_val);
        item.gst_igst_val = 0;

    }

}
// gateEntryValue += item.ge_value;




        item.mrir_date = dateFormater(item?.mrir_date);

        // 2️⃣ When Supplier & division NULL → fetch po qty ord
        if (
          thmmrctData.material_fr === "S" &&
          thmmrctData.p_division_id == null
        ) {
          const poQtyRes = await db.query(
            `SELECT po_qty_ord 
            FROM mdmmpoit 
            WHERE po_id = $1 AND it_code = $2`,
            [item.po_id, item.it_code]
          );

          // if (poQtyRes.rowCount > 0) {
          //   item.po_qty_ord = poQtyRes.rows[0].po_qty_ord;
          // }

                    // added by akshay 17-06-26
if (poQtyRes.rowCount > 0) {

  item.po_qty_ord = Number(
    poQtyRes.rows[0].po_qty_ord || 0
  );

        const recdQtyRes = await db.query(
          `
          select coalesce(sum(qty_recd),0) as total_received
          from tdmmrct
          where po_id = $1
            and it_code = $2
          `,
          [item.po_id, item.it_code]
        );

        const totalReceived = Number( recdQtyRes.rows[0]?.total_received || 0 );
         item.bal_qty = Math.max( 0,item.po_qty_ord - totalReceived );

        // console.log({
        //   item: item.it_code,
        //   poQty: item.po_qty_ord,
        //   totalReceived,
        //   balQty: item.bal_qty
        // });
      }
          
          else {
            // .1 If not found and PO type = JW → check sub-contract RM
            const poType = thmmrctData.poType;
            if (poType === "JW") {
              const rmRes = await db.query(
                `SELECT 'Y' AS return_rm_code 
                FROM mommsubc 
                WHERE po_id = $1 AND rm_code = $2
                LIMIT 1`,
                [item.po_id, item.it_code]
              );
              if (rmRes.rowCount > 0) item.return_rm_code = "Y";
            }
          }
        }

        //  Old values tracking
        item.tmpqty_advise = item.qty_advise;
        item.oldqty_advise = item.qty_advise;
        item.oldit_code = item.it_code;

        //  Fetch PO No for detail
        const poNoRes = await db.query(
          `SELECT po_no FROM mhmmpo WHERE po_id = $1`,
          [item.po_id]
        );
        if (poNoRes.rowCount > 0) {
          item.po_no = poNoRes.rows[0].po_no;
        }

        //  Direct Item flag
        const direct = await db.query(
          `SELECT 'Y' AS direct 
        FROM mommitem i 
        JOIN moitbase t ON i.it_type = t.level1
        WHERE i.it_code = $1 
        AND UPPER(t.cat_desc) LIKE 'DIRECT%'
        LIMIT 1`,
          [item.it_code]
        );
        item.direct_item = direct.rowCount > 0 ? "Y" : "N";

        //  Recalculate amount (Oracle logic equivalent)
        item.amount =
          Number(item.po_qty_ord || 0) * Number(item.po_mat_rat || 0) -
          Number(item.po_disc_val || 0);

        tdmmrctData.push(item);
      })
    );

    // added by akshay 11-06-26 fetch po_value 

const detailPoId = gateEntryDetails.rows?.[0]?.po_id;

if (detailPoId) {
  const { rows } = await db.query(
    `SELECT po_no, po_value
     FROM mhmmpo
     WHERE po_id = $1`,
    [detailPoId]
  );

  thmmrctData.po_value = rows?.[0]?.po_value || 0;
}



if (detailPoId) {

  const { rows } = await db.query(
    `
    SELECT
      COALESCE(SUM(component_amount),0) AS po_level_charge
    FROM mdmmpo_po_level_charges
    WHERE po_id = $1
      AND chg_component IN (
        'PACKING & FORWARDING',
        'FREIGHT FIXED',
        'AGENCY COMMISSION',
        'INSURANCE'
      )
    `,
    [detailPoId]
  );

  thmmrctData.po_level_charge = Number(rows[0].po_level_charge || 0);
}


// thmmrctData.ge_value =Number(gateEntryValue.toFixed(2));


// console.log("PO VALUE", thmmrctData.po_value);
// console.log("GE VALUE", gateEntryValue);

    return res.status(200).json({
      type: "found",
      gateEntryData: thmmrctData,
      gateEntryDtlData: [...tdmmrctData],
      count: recordCount || 0,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      type: "not found ",
      count: 0,
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
  if (!["Insert", "Update", "Search"].includes(form_status)) {
    return res.status(200).send([]);
  }

  try {
if (help_list === "v_code") {
  if (form_status === "Search") {
    const vendorList = await db.query(`
      SELECT DISTINCT
             h.v_code,
             m.v_name,
             get_from_state(m.v_city,'C','N') AS party_city,
             m.v_add1 || m.v_add2 || m.v_add3 AS address
      FROM thmmrct h
      LEFT JOIN mommvend m
        ON h.v_code = m.v_code
        where trans_year = $1
      ORDER BY m.v_name
    `,[transYear]);

    return res.status(200).send(vendorList.rows);
  }

      const vendorList = await db.query(
     `select a.v_name, 
       a.v_code,  
       get_from_state((SELECT m.V_CITY FROM MOMMVEND m WHERE V_CODE = a.v_code),'C','N')PARTY_CITY,
       (select v_add1 ||  v_add2 ||  v_add3  from MOMMVEND k where k.v_code = a.v_code)Address
      from vwVendorPoWise A
      union all
      select a.v_name ,
            a.v_code,
            get_from_state((SELECT m.V_CITY FROM MOMMVEND m WHERE m.V_CODE = a.v_code),'C','N')PARTY_CITY,
            a.v_add1 ||  a.v_add2 ||  a.v_add3 Address
      from mommvend a where a.v_code in (select v_code from moitdivision)`
      );
      return res.status(200).send(vendorList.rows);
    }

    
    else if (help_list === "chln_no" && form_status === "Search") {
      const { f_inter_div } = req?.query;
      // console.log(divisionId, f_inter_div);
      //this is for accunt no help in field of acc.no reside in detail block
//       const chalanNoList = await db.query(
//         `
// SELECT INV_NO, TO_CHAR(INV_DT, 'YYYY-MM-DD') AS INV_DT, TRANS_YEAR
//   FROM MHSMINV 
//  WHERE DIVISION_ID = $1 -- send this from form formData.P_DIVISION_ID
//    AND $2 = 'I'
//   UNION
// SELECT DOC_NO, TO_CHAR(DOC_DATE, 'YYYY-MM-DD') AS DOC_DATE, TRANS_YEAR
//   FROM THMMMCHL
//  WHERE DIVISION_ID = $1
//    AND $2 = 'R'
// ORDER BY 1
//         `,
//         [divisionId, f_inter_div]
//       );
const chalanNoList = await db.query(`
  SELECT distinct chln_no as inv_no from thmmrct where trans_year = $1 order by chln_no
  `,[transYear])


      // console.log(chalanNoList.rows);
      if (chalanNoList.rows.length > 0) {
        res.status(200).json(chalanNoList.rows);
      }
    } else if (help_list === "cons_no") {
      const { v_code } = req?.query;
      const consignmentNoList = await db.query(
        `
  select distinct h.cons_ctrl_id, h.cons_ctrl_no, h.cons_ctrl_dt, inv_no,inv_dt
  from thmmcons h, tdmmcons d
  where h.cons_ctrl_id = d.cons_ctrl_id
  and d.v_code = $1
  and not exists (select 1 from thmmrct g where g.cons_ctrl_id = h.cons_ctrl_id 
  and g.v_code = d.v_code and coalesce(cancel_ge,'N') = 'N')

  `,
        [v_code]
      );
      if (consignmentNoList.rows.length > 0) {
        res.status(200).json(consignmentNoList.rows);
      }
    }
    
    else if (help_list === "ship_to") {

  if (form_status === "Search") {

    const shipToList = await db.query(`
     SELECT DISTINCT
    mm.dealer_code,
    md.city || ', ' || md.state AS location,
    mm.division AS dlr_type,
    h.ship_to,
    mc.c_name AS ship_to_name
FROM thmmrct h
LEFT JOIN mosmcust_master mc
    ON h.ship_to = mc.c_code
LEFT JOIN moedmember mm
    ON mc.c_code = mm.member_no
LEFT JOIN moeddealer md
    ON mm.dealer_code = md.dealer_code
WHERE h.ship_to IS NOT NULL
and trans_year = $1
ORDER BY h.ship_to;
    `,[transYear]);

    return res.status(200).json(shipToList.rows);
  }

      const { f_ship_to_type } = req?.query;
      let query = ''
      if(f_ship_to_type === 'E'){
        query = `select c_code as ship_to, name as ship_to_name from moitdivision`
      }else {
        // query = `select c_code as ship_to, c_name as ship_to_name from mosmcust_master where active = 'Y'`
        query = `SELECT
    mm.dealer_code,
    md.city || ', ' || md.state AS location,
    mm.division AS dlr_type,
    mc.c_code AS ship_to,
    mc.c_name AS ship_to_name
FROM moedmember mm
LEFT JOIN moeddealer md
    ON mm.dealer_code = md.dealer_code
LEFT JOIN mosmcust_master mc
    ON mm.member_no = mc.c_code
WHERE mc.active = 'Y';`
      }
      const shipToList = await db.query(query);
      if (shipToList.rows.length > 0) {
        res.status(200).json(shipToList.rows);
      }
    }
    
    else if (help_list === "order_no") {
      const orderNoList = await db.query(
        `
        select c_po_no, order_no, h.order_id, inv_no 
        from mhsmordr h, mhsminv i 
        where 
        h.cancel_flag != 'Y'
        and h.jw != 1
        and h.order_id = i.order_id
        order by 1
  `
      );
      if (orderNoList.rows.length > 0) {
        res.status(200).json(orderNoList.rows);
      }
    } else if (help_list === "manuf_code") {
      const manufNoList = await db.query(
        `
        select v_code as manuf_code,v_name as manufacturer_desc
        from mommvend
        where MOMMVEND.MANUF_FLAG = 'Y'
        `
      );
      if (manufNoList.rows.length > 0) {
        res.status(200).json(manufNoList.rows);
      }
    } else if (help_list === "c_code") {
      const custNoList = await db.query(
        `select c_name as v_name, c_code as v_code from 
          mosmcust order by 1`
      );
      if (custNoList.rows.length > 0) {
        res.status(200).json(custNoList.rows);
      }
    } // --  #### from below for detail section
    else if (help_list === "po_no") {
      const { f_v_code, f_ge_date } = req?.query;
    // ## As per sahil on 9-11-2026 we remove the po end date filter as he said there is many po which cross there end date
      // const poNoList = await db.query(
      //   `select QTN_REF,po_no, TO_CHAR(po_date, 'YYYY-MM-DD') AS po_date, TO_CHAR(po_eff_dt, 'YYYY-MM-DD') AS po_eff_dt, po_id 
      //       from mhmmpo H
      //       where v_code = $1
      //       and flag != 'R'   
      //       and cancel_flag = 'N'
      //       and H.po_end_dt::date >= $2::date 
      //       and division_id= $3
      //       AND EXISTS(SELECT 1 FROM MDMMPOIT WHERE H.PO_ID = PO_ID 
      //       AND coalesce(ACTIVE,'N') = 'Y')
      //       order by po_no
      //     `,
      //   [f_v_code, f_ge_date, divisionId]
      // );
      const poNoList = await db.query(
        `select QTN_REF,po_no, TO_CHAR(po_date, 'YYYY-MM-DD') AS po_date, TO_CHAR(po_eff_dt, 'YYYY-MM-DD') AS po_eff_dt, po_id 
            from mhmmpo H
            where v_code = $1
            and flag != 'R'   
            and cancel_flag = 'N'
            and division_id= $2
            AND EXISTS(SELECT 1 FROM MDMMPOIT WHERE H.PO_ID = PO_ID 
            AND coalesce(ACTIVE,'N') = 'Y')
            order by po_no
          `,
        [f_v_code, divisionId]
      );
      if (poNoList.rows.length > 0) {
        res.status(200).json(poNoList.rows);
      }
    }
    else if (help_list === "it_code") {
      const {po_no,po_id,ge_id } = req?.query;
      const poItemList = await db.query(
       `SELECT
    p.po_no,
    d.it_code,
    i.it_name,
    i.it_pu_um,
    d.po_qty_ord,
    d.po_mat_rat,
    d.gst_sgst_val,
    d.gst_cgst_val,
    d.gst_igst_val
FROM mdmmpoit d
INNER JOIN mhmmpo p
    ON p.po_id = d.po_id
INNER JOIN mommitem i
    ON i.it_code = d.it_code
WHERE d.po_id = $1;
        `,
        [po_id]
      );
      if (poItemList.rows.length > 0) {
        res.status(200).json(poItemList.rows);
      }
    }

     else if (help_list === "rej_gpno") {
      const { v_code, po_id, it_code } = req?.query;
      const rejGpNoList = await db.query(
        `select rej_gpno, rej_gpdt
          from tommirej
          where v_code = $1
            and po_id = $2
            and it_code = $3
          `,
        [v_code, po_id, it_code]
      );
      if (rejGpNoList.rows.length > 0) {
        res.status(200).json(rejGpNoList.rows);
      }
    } 
    
    else if (help_list === "rej_gpno") {
      const { v_code, it_code } = req?.query;
      const ddnNoList = await db.query(
        `select inv_no as ddn_no, inv_dt as ddn_dt
          from mhsminv h, mdsminv d
          where h.v_code = $1
          and h.bill_id is not null
          and h.inv_id = d.inv_id
          and d.it_code = $2
          `,
        [v_code, it_code]
      );
      if (ddnNoList.rows.length > 0) {
        res.status(200).json(ddnNoList.rows);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


// fill item using chalan number
exports.getChallanItems = async (req, res) => {
  const { chln_no } = req.query; // = :thmmrct.chln_no in Oracle

  if (!chln_no) {
    return res
      .status(400)
      .json({ type: "error", message: "Challan number required" });
  }

  const query = `

    SELECT 
      D.it_code,
      I.it_name_long as it_name,  
      D.um_code,
      D.qty_desp
    FROM vw_tdmmmchl D
    JOIN vw_thmmmchl H ON H.doc_id = D.doc_id
    JOIN mommitem I ON I.it_code = D.it_code
    WHERE H.doc_no = $1

  `;

  try {
    const result = await db.query(query, [chln_no]);
    return res.json({ type: "success", data: result.rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ type: "error", message: err.message || "Internal Server Error" });
  }
};

// below comment function is corrected

// const validatePoNo = async (req, res) => {
//   console.log(req?.query);

//   const { fPoNo, po_id, appFinYear, appDivisionId } = req?.query;

//   try {
//     const getPoType = await db.query(`select Func_po_type($1) as po_type`, [
//       po_id,
//     ]);

//     const getPoData = await db.query(`select * from mhmmpo where po_no = $1`, [
//       fPoNo,
//     ]);

//     if (getPoData.rowCount == 0) {
//       throw new Error("No Po Found with this Po No.");
//     }

//     if (getPoData.rows[0]?.flag != "F") {
//       throw new Error("Purchase Order not Authorized");
//     }

//     // get po items
//     const getPoItem = await db.query(
//       `select * from mdmmpoit where po_id = $1`,
//       [getPoData?.rows[0].po_id]
//     );

//     for (const poItemDetail of getPoItem.rows) {
//       // get item description
//       const getItemDesc = await db.query(
//         "select it_name, it_pu_um, um_code, it_p_umf, iic_ref_no from mommitem where it_code = $1",
//         [poItemDetail?.it_code]
//       );
//       poItemDetail.it_name = getItemDesc.rows[0]?.it_name;
//       poItemDetail.it_pu_um = getItemDesc.rows[0]?.it_pu_um;
//       poItemDetail.um_code = getItemDesc.rows[0]?.um_code;
//       poItemDetail.conversion_factor = getItemDesc.rows[0]?.it_p_umf;
//       poItemDetail.iic_ref_no = getItemDesc.rows[0]?.iic_ref_no;

//     }

//     return res.json({
//       type: "success",
//       data: getPoItem.rows,
//       hdrData: { 
//         potype: getPoType.rows[0]?.po_type,
//         po_end_dt: getPoData.rows[0]?.po_end_dt,
//         po_eff_dt: getPoData.rows[0]?.po_eff_dt
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .json({ type: "error", message: err.message || "Internal Server Error" });
//   }
// };

 const validatePoNo = async (req, res) => {
    console.log(req?.query);

    const { fPoNo, po_id, appFinYear, appDivisionId } = req?.query;

    try {
      const getPoType = await db.query(
        `select Func_po_type($1) as po_type`,
        [po_id]
      );

      const getPoData = await db.query(
        `select * from mhmmpo where po_no = $1`,
        [fPoNo]
      );

      if (getPoData.rowCount === 0) {
        throw new Error("No Po Found with this Po No.");
      }

      if (getPoData.rows[0]?.flag !== "F") {
        throw new Error("Purchase Order not Authorized");
      }

      // PO Items
      const getPoItem = await db.query(
        `select * from mdmmpoit where po_id = $1`,
        [getPoData.rows[0].po_id]
      );

      // console.log(getPoItem.rows);

      for (const poItemDetail of getPoItem.rows) {

        // Total received qty for same PO + Item
        const receivedQty = await db.query(
          `
          select coalesce(sum(qty_recd), 0) as total_received
          from tdmmrct
          where po_id = $1
            and it_code = $2
          `,
          [
            poItemDetail.po_id,
            poItemDetail.it_code
          ]
        );
  //        console.log({
  //   item: poItemDetail.it_code,
  //   po_qty_ord_db: poItemDetail.po_qty_ord,
  //   total_received: receivedQty.rows[0]?.total_received
  // });

        const totalReceived = Number(
          receivedQty.rows[0]?.total_received || 0
        );

        const orderedQty = Number(
        poItemDetail.po_qty_ord || 0
      );

        // Balance Qty = Ordered Qty - Total Received Qty
        const balanceQty = Math.max(
          0,
          orderedQty - totalReceived
        );

        // New column
        poItemDetail.bal_qty = balanceQty;

        // Next GE me remaining qty show 
        poItemDetail.po_qty_ord = balanceQty;

        // Item Description
        const getItemDesc = await db.query(
          `
          select
            it_name,
            it_pu_um,
            um_code,
            it_p_umf,
            iic_ref_no
          from mommitem
          where it_code = $1
          `,
          [poItemDetail.it_code]
        );

        poItemDetail.it_name = getItemDesc.rows[0]?.it_name;
        poItemDetail.it_pu_um = getItemDesc.rows[0]?.it_pu_um;
        poItemDetail.um_code = getItemDesc.rows[0]?.um_code;
        poItemDetail.conversion_factor = getItemDesc.rows[0]?.it_p_umf;
        poItemDetail.iic_ref_no = getItemDesc.rows[0]?.iic_ref_no;
      }

      return res.json({
        type: "success",
        data: getPoItem.rows,
        hdrData: {
          potype: getPoType.rows[0]?.po_type,
          po_end_dt: getPoData.rows[0]?.po_end_dt,
          po_eff_dt: getPoData.rows[0]?.po_eff_dt,
          po_value: getPoData.rows[0]?.po_value,
        },
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        type: "error",
        message: err.message || "Internal Server Error",
      });
    }
    };


exports.handleSubmitGEData = catchAsync(async (req, res) => {
  const { formHdrData, formItemData } = req.body;
  const { userId, form_status } = req?.query;

  const { division_id, trans_year, v_code } = formHdrData;

  // ------------------ BASIC VALIDATIONS ------------------
  if (!division_id || !trans_year) {
    return res.status(400).json({
      type: "error",
      message: "division id and trans year not selected",
    });
  }

  if (form_status !== "Insert") {
    return res.status(400).json({
      type: "error",
      message: "Cannot submit data please do press Insert",
    });
  }

  if (!formItemData || !formItemData.length) {
    return res.status(400).json({
      type: "error",
      message: "Please fill Item details",
    });
  }

  if (!v_code) {
    return res.status(400).json({
      type: "error",
      message: "Vendor Code cannot be null",
    });
  }

  try {
    // ================== TRANSACTION START ==================
    await db.query("BEGIN");

    // ------------------ GENERATE INWARD CONTROL NO ------------------
    const genInwCtrlNo = await db.query(
      `SELECT gen_inw_ctrl_no($1,$2,$3) AS inv_ctrl_no`,
      [trans_year, division_id, "A"]
    );

    formHdrData.inward_control_no =
      genInwCtrlNo.rows[0]?.inv_ctrl_no;

    // ------------------ GENERATE GATE ENTRY NO ------------------
    const gateEntryNo = await db.query(
      `SELECT gen_dtosp_chln_no($1,$2,$3) AS ge_no`,
      [trans_year, division_id, "DTOSP"]
    );

    formHdrData.ge_no = gateEntryNo.rows[0]?.ge_no;

    const { ge_id } = formHdrData;
    // Flags as per business rule
    formHdrData.ge_tag_ok = "Y";
    formHdrData.print_tag = "Y";
    formHdrData.recd_by_cd = userId;

    // ------------------ VENDOR LOT NO (HEADER) ------------------
    const getVendorLotNo = await db.query(
      `
      SELECT COUNT(*) AS vendor_lotno
      FROM thmmrct
      WHERE v_code = $1
        AND trans_year = $2
        AND division_id = $3
      `,
      [v_code, trans_year, division_id]
    );

    // Oracle-equivalent: next lot number
    formHdrData.vendor_lotno =
      Number(getVendorLotNo.rows[0].vendor_lotno) + 1;

    // ------------------ INSERT HEADER ------------------
    const hdrData = transformGeHdr(formHdrData);

    const insertHdrQuery = generateSingleInsertQuery(
      TABLE_NAMES.HDR_TABLE,
      hdrData,
      "create_date"
    );

    await db.query(insertHdrQuery, Object.values(hdrData));

    // ------------------ DETAIL TRANSFORM ------------------
  //    const freight_charges = Number(formHdrData.freight_charges || 0);

  //    if (![null, undefined, ''].includes(freight_charges) ){
  //     if (Number(freight_charges) > 0) {
  // const freightEntryData = {
  //   ...formItemData[0],
    // it_code: 'WS22',
    // it_pu_um: 'NOS',
    // um_code: 'NOS',
    // qty_advise: 1,
    // qty_recd: 1,
    // qty_accptd: 1,
    // qty_payment: 1,
    // qty_converted: 1,
    // qty_damaged: 0,
    // conversion_factor: 1,
    // rate_rs: freight_charges,
    // basic_val: freight_charges,
    // net_val: freight_charges,
    // cancel_mrir: 'N',
    // print_mrir: 'N',
    // print_tag: 'Y',
    // udpated: 'N',
    // modvat_val: 0,
    // modvat_perc: 0,
    // net_rate: freight_charges,
  // };


  //         formItemData.push(freightEntryData)
  //      }
  //    }

    const detailData = transformTdmmrct(
      formItemData,
      formHdrData.ge_id
    );

    // ================== DETAIL LOOP ==================
    for (const record of detailData) {
      const { material_fr, sale_return, order_id, ok_rej } = hdrData;

      record.ok_rej = ok_rej;
      record.order_id = order_id;

      // ------------------ MRIR NO GENERATION ------------------
      let genMrirParams;

      if (material_fr === "S" && sale_return !== "4") {
        genMrirParams = [
          record.po_id,
          record.wc_id,
          trans_year,
          division_id,
          material_fr,
        ];
      } else if (material_fr === "C") {
        genMrirParams = [
          order_id,
          record.wc_id,
          trans_year,
          division_id,
          material_fr,
        ];
      } else if (sale_return === "4") {
        genMrirParams = [
          record.po_id,
          record.wc_id,
          trans_year,
          division_id,
          material_fr,
        ];
      }

      if (genMrirParams) {
        const genMrirNo = await db.query(`SELECT GenMrirNo($1,$2,$3,$4,$5) AS mrir_no`,
          genMrirParams
        );
        record.mrir_no = genMrirNo.rows[0]?.mrir_no;
      }

      // ------------------ DATES ------------------
      const today = new Date().toISOString().split("T")[0];

      record.mrir_date = today;
      record.clear_dt = today;
      record.prn_ui_tag_dt = today;
      record.ins_ent_dt = today;
      record.entry_dt = today;

      // ------------------ VENDOR ITEM LOT NO ------------------
      const getVendorItemLotNo = await db.query(
        `
        SELECT COUNT(*) AS vitem_lotno
        FROM thmmrct h
        JOIN tdmmrct d ON d.ge_id = h.ge_id
        WHERE h.v_code = $1
          AND d.it_code = $2
          AND h.trans_year = $3
          AND h.division_id = $4
        `,
        [v_code, record.it_code, trans_year, division_id]
      );

      // Oracle-style next item lot
      record.vitem_lotno = Number(getVendorItemLotNo.rows[0].vitem_lotno) + 1;

      // ------------------ QTY FIELDS ------------------
      record.qty_accptd = record.qty_recd;
      record.qty_payment = record.qty_recd;

      record.qty_ok_in_stk_um = record.qty_converted;
      record.qty_acp_in_pur_um = record.qty_converted;

      record.mrir_gen_by = userId;
      record.inspector_cd = userId;

      // ------------------ INSERT DETAIL ------------------
      const insertDtlQuery = generateSingleInsertQuery(
        TABLE_NAMES.DTL_TABLE,
        record,
        "create_date"
      );

      await db.query(insertDtlQuery, Object.values(record));
    }



    // ##  call value_mrir procedure
    const allGEDtlData = await db.query(
      `select * from tdmmrct where ge_id = $1`,
      [ge_id]
    );

    if (allGEDtlData.rowCount == 0) {
      throw new Error("No Gate Entry Item data found");
    }

    // console.log("allGEDtlData.rows :: ", allGEDtlData.rows);

    let poId = allGEDtlData.rows[0]?.po_id

    for (const record of allGEDtlData.rows) {
      const { po_id, it_code, mrir_no } = record;

        if (record.it_code === 'WS22') {
          // console.log('Skipping value_mrir_ge for freight item');
          continue;
        }

      if (!po_id) {
        throw new Error(`Po Id cannot be null in Gate Entry Detail`);
      }

      if (!it_code) {
        throw new Error(`Item code cannot be null in Gate Entry Detail`);
      }

      if (!mrir_no) {
        throw new Error(`Mrir No. cannot be null in Gate Entry Detail`);
      }

      if (po_id && it_code && mrir_no) {
        await db.query(`call value_mrir_ge($1,$2,$3)`, [
          po_id,
          it_code,
          mrir_no,
        ]);

       

        // console.log("need to call value_mrir_ge for :: ", [
        //   po_id,
        //   it_code,
        //   mrir_no,
        // ]);

      }
    }

    // ## Now call update_tommmain_ge procedure to insert the data in tommmain table
    await db.query(`call update_tommmain_ge($1)`, [ge_id]);

    // ## CREATE PURCHASE VOUCHER
    const getPOType = await db.query('select po_type from mhmmpo where po_id = $1', [poId])

    if(getPOType.rows[0]?.po_type === 'A'){
      await db.query(`call cr_pv_4_po_advice2stage($1)`, [ge_id])
    }

    await db.query("COMMIT");

    return res.status(200).json({
      type: "success",
      message: "Record successfully saved",
      genInwardCtrlNo: formHdrData.inward_control_no,
      genGeNo: formHdrData.ge_no,
    });

  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);

    return res.status(400).json({
      type: "error",
      message: error.message || "Internal server error",
    });
  }
});

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (["Query", "Search"].includes(req?.query?.formStatus)) {
    await getGateEntryDataOnQuery(req, res);
    return;
  }

  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});

exports.handleValidation = catchAsync(async (req, res, next) => {
  if (req.query?.fPoNo) {
    await validatePoNo(req, res);
    return;
  }
});


exports.updateGateEntry = catchAsync(async (req, res) => {
 const {
  ge_id,
  changedHdrFields,
  changedItemRows,
  deletedItemData,
  userId: bodyUserId,
} = req.body;

const userId = Number(bodyUserId || req.query.userId);

//   console.log("body userId =>", req.body.userId);
// console.log("query userId =>", req.query.userId);

  if (!ge_id) {
    return res.status(400).json({
      type: "error",
      message: "Gate Entry ID missing",
    });
  }

  if (
    (!changedHdrFields || !Object.keys(changedHdrFields).length) &&
    (!changedItemRows || !changedItemRows.length) &&
    (!deletedItemData || !deletedItemData.length)
  ) {
    return res.status(400).json({
      type: "error",
      message: "No updates found to process",
    });
  }

  // console.log("Update Payload:", req.body);

  try {
    await db.query("BEGIN");
  

let newItemInserted = false;
let insertedPoId = null;

// Header data required for MRIR generation
const hdrResult = await db.query(
  `SELECT
      trans_year,
      division_id,
      material_fr,
      sale_return,
      order_id,
      v_code
   FROM ${TABLE_NAMES.HDR_TABLE}
   WHERE ge_id=$1`,
  [ge_id]
);

if (!hdrResult.rowCount) {
  throw new Error("Gate Entry Header not found");
}

const header = hdrResult.rows[0];


// 1. Update Header

if (changedHdrFields && Object.keys(changedHdrFields).length) {

  const columns = Object.keys(changedHdrFields);
  const values = Object.values(changedHdrFields);

  const setClause = columns
    .map((col, i) => `${col}=$${i + 1}`)
    .join(",");

  await db.query(
    `UPDATE ${TABLE_NAMES.HDR_TABLE}
     SET ${setClause}
     WHERE ge_id=$${columns.length + 1}`,
    [...values, ge_id]
  );
}


// 2. Delete Items

if (Array.isArray(deletedItemData) && deletedItemData.length) {

  for (const { it_code } of deletedItemData) {

    if (!it_code) continue;

    await db.query(
      `DELETE FROM ${TABLE_NAMES.DTL_TABLE}
       WHERE ge_id=$1
       AND it_code=$2`,
      [ge_id, it_code]
    );
  }

}


// 3. Update / Insert Items

if (Array.isArray(changedItemRows) && changedItemRows.length) {

  for (const row of changedItemRows) {

    const { it_code, ...rest } = row;

    if (!it_code) continue;

    delete rest.row_id;

    if ("recd_qty" in rest) {
      rest.qty_recd = rest.recd_qty ?? 0;
      delete rest.recd_qty;
    }

    const check = await db.query(
      `SELECT 1
       FROM ${TABLE_NAMES.DTL_TABLE}
       WHERE ge_id=$1
       AND it_code=$2`,
      [ge_id, it_code]
    );

    if (check.rowCount > 0) {

      // UPDATE PART

              // ================= UPDATE =================
      if (!Object.keys(rest).length) continue;

      const columns = Object.keys(rest);
      const values = Object.values(rest);

      const setClause = columns
        .map((col, i) => `${col}=$${i + 1}`)
        .join(",");

      await db.query(
        `UPDATE ${TABLE_NAMES.DTL_TABLE}
         SET ${setClause}
         WHERE ge_id=$${columns.length + 1}
         AND it_code=$${columns.length + 2}`,
        [...values, ge_id, it_code]
      );

    } else {

      // ================= INSERT =================

    

      const insertRow = {
        ge_id,
        it_code,
        ...rest,
      };

      //  console.log("INSERT ROW =>", insertRow);

      const columns = Object.keys(insertRow);
      const values = Object.values(insertRow);

      //  console.log("Columns =>", columns);
      // console.log("Values =>", values);

      const placeholders = columns
        .map((_, i) => `$${i + 1}`)
        .join(",");

      await db.query(
        `INSERT INTO ${TABLE_NAMES.DTL_TABLE}
        (${columns.join(",")})
        VALUES (${placeholders})`,
        values
      );

      newItemInserted = true;
      insertedPoId = insertRow.po_id;

      // ================= MRIR NO =================

      let genMrirParams;

      if (
        header.material_fr === "S" &&
        header.sale_return !== "4"
      ) {

        genMrirParams = [
          insertRow.po_id,
          insertRow.wc_id,
          header.trans_year,
          header.division_id,
          header.material_fr,
        ];

      } else if (header.material_fr === "C") {

        genMrirParams = [
          header.order_id,
          insertRow.wc_id,
          header.trans_year,
          header.division_id,
          header.material_fr,
        ];

      } else {

        genMrirParams = [
          insertRow.po_id,
          insertRow.wc_id,
          header.trans_year,
          header.division_id,
          header.material_fr,
        ];

      }

      const genMrirNo = await db.query(
        `SELECT GenMrirNo($1,$2,$3,$4,$5) AS mrir_no`,
        genMrirParams
      );

      const today = new Date().toISOString().split("T")[0];

      // ================= Vendor Item Lot =================

      const getVendorItemLotNo = await db.query(
        `
        SELECT COUNT(*) AS vitem_lotno
        FROM thmmrct h
        JOIN tdmmrct d
          ON d.ge_id = h.ge_id
        WHERE h.v_code = $1
          AND d.it_code = $2
          AND h.trans_year = $3
          AND h.division_id = $4
        `,
        [
          header.v_code,
          insertRow.it_code,
          header.trans_year,
          header.division_id,
        ]
      );

      const vitemLotNo =
        Number(getVendorItemLotNo.rows[0].vitem_lotno) + 1;

    //        console.log("UPDATE userId =>", userId);
    //        console.log("QUERY userId =>", req.query.userId);

      await db.query(
        `
        UPDATE ${TABLE_NAMES.DTL_TABLE}
        SET

          mrir_no=$1,
          mrir_date=$2,
          clear_dt=$2,
          prn_ui_tag_dt=$2,
          ins_ent_dt=$2,
          entry_dt=$2,

          qty_accptd=qty_recd,
          qty_payment=qty_recd,

          qty_ok_in_stk_um=qty_converted,
          qty_acp_in_pur_um=qty_converted,

          vitem_lotno=$3,

          mrir_gen_by=$4,
          inspector_cd=$4

        WHERE ge_id=$5
        AND it_code=$6
        `,
        [
          genMrirNo.rows[0].mrir_no,
          today,
          vitemLotNo,
          userId,
          ge_id,
          insertRow.it_code,
        ]
      );

    }

  }

}
        


// 4. Call Procedures (Only if New Item Inserted)

if (newItemInserted) {

  const allGEDtlData = await db.query(
    `SELECT * 
     FROM ${TABLE_NAMES.DTL_TABLE}
     WHERE ge_id = $1`,
    [ge_id]
  );

  if (allGEDtlData.rowCount === 0) {
    throw new Error("No Gate Entry Item data found");
  }

  let poId = insertedPoId;

  for (const record of allGEDtlData.rows) {

    // Freight item ke liye value_mrir_ge nahi chalana
    if (record.it_code === "WS22") {
      // console.log("Skipping value_mrir_ge for freight item");
      continue;
    }

    if (!record.po_id) {
      throw new Error("PO Id cannot be null");
    }

    if (!record.it_code) {
      throw new Error("Item Code cannot be null");
    }

    if (!record.mrir_no) {
      throw new Error("MRIR No cannot be null");
    }

    await db.query(
      `CALL value_mrir_ge($1,$2,$3)`,
      [
        record.po_id,
        record.it_code,
        record.mrir_no,
      ]
    );
  }

  // Update TOMMMAIN
  await db.query(
    `CALL update_tommmain_ge($1)`,
    [ge_id]
  );


  // Purchase Voucher

  if (poId) {

    const poType = await db.query(
      `SELECT po_type
         FROM mhmmpo
        WHERE po_id = $1`,
      [poId]
    );

    if (poType.rows[0]?.po_type === "A") {

      await db.query(
        `CALL cr_pv_4_po_advice($1)`,
        [ge_id]
      );

    }

  }

}

await db.query("COMMIT");

return res.status(200).json({
  type: "success",
  message: "Gate Entry updated successfully",
});

} catch (error) {

  await db.query("ROLLBACK");

  console.error("Update Gate Entry Error:", error);

  return res.status(500).json({
    type: "error",
    message: error.message,
  });

}
});

exports.validateVendorChallanNo = catchAsync(async (req, res) => {
  const { v_code, chln_no,ge_id ,formStatus} = req.body;

  if (!v_code || !chln_no) {
    return res.status(400).json({
      type: "error",
      message: "Vendor code and Challan number are required",
    });
  }

  let query = "";
let params = [];

if (formStatus === "Insert") {
  query = `
    SELECT 1
    FROM thmmrct
    WHERE v_code = $1
      AND chln_no = $2
      AND cancel_ge = 'N'
    LIMIT 1
  `;

  params = [v_code, chln_no];
} else if (formStatus === "Update") {
  query = `
    SELECT 1
    FROM thmmrct
    WHERE v_code = $1
      AND chln_no = $2
      AND ge_id <> $3
      AND cancel_ge = 'N'
    LIMIT 1
  `;

  params = [v_code, chln_no, ge_id];
}

const result = await db.query(query, params);

  if (result.rows.length > 0) {
    return res.status(200).json({
      type: "error",
      valid: false,
      message: "Vendor and Challan No already exist.",
    });
  }

  return res.status(200).json({
    type: "success",
    valid: true,
    message: "Vendor and Challan No are valid.",
  });
});


exports.printGE = catchAsync(async (req, res) => {
  const { ge_id } = req.body;

  

  if (!ge_id) {
    return res.status(400).json({ error: "Missing ge_id" });
  }


  const reportName = "gate_entry";
  const baseOutputName = `${reportName}_${ge_id}`;
  const outputFilename = `${baseOutputName}.pdf`;

  const JAR_PATH = path.resolve(
    __dirname,
    "../../../../../reportGeneration/jasper-service/target/jasper-service-1.0-SNAPSHOT-shaded.jar",
  );

  // console.log("JAR PATH:", JAR_PATH);

  const REPORT_DIR = path.resolve(
    __dirname,
    "../../../../../reportGeneration/reports/",
  );

  // console.log(" REPORT_DIR:", REPORT_DIR);

  const finalPdfPath = path.join(REPORT_DIR, outputFilename);

  // Params passed as Jasper parameters only
  const params = {
    PREP_ID: { type: "Long", value: ge_id },
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
        return res.status(500).json({ error: "Error generating Gate Entry Print" });
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

