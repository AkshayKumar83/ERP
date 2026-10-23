const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");


exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  try {
    const { level1, level2 } = req.query;

    let itemType = [];
    let itemBase = [];
    let itemSubCat = [];
    let destList = [];

    // PO Category List
    const poCategoryResult = await db.query(`
      SELECT po_cat_description, po_cat_prefix 
      FROM mommpcat
      UNION
      SELECT 'CUSTOMER', 'C'
      UNION
      SELECT ' ', NULL;
    `);
    const poCategoryList = poCategoryResult.rows;



    // LEVEL 1 (Item Type)
    const l1Res = await db.query(`
      select cat_desc, level1 
      from moitbase 
      where level2 = '00' and level3 = '00'
      ORDER BY cat_desc;
    `);

    itemType = l1Res.rows;


  // LEVEL 2 (Item Base)
if (level1) {
  const l2Res = await db.query(
    `
    select cat_desc, level2 
    from moitbase 
    where level1 = $1 
      and level3 = '00' 
      and level2 != '00'
    union 
    select ' ', '00'
    ORDER BY cat_desc;
    `,
    [level1]
  );
  itemBase = l2Res.rows;
}

// LEVEL 3 (Sub Category)
if (level1 && level2) {
  const l3Res = await db.query(
    `
    select cat_desc, level3 
    from moitbase 
    where level1 = $1 
      and level2 = $2 
      and level3 != '00'
    ORDER BY cat_desc;
    `,
    [level1, level2]
  );
  itemSubCat = l3Res.rows;
}



    return res.status(200).json({
      success: true,
      poCategoryList,
      level1: itemType,
      level2: itemBase,
      level3: itemSubCat,
    });

  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dropdown data",
      error: error.message,
    });
  }
});

const helpListData = async (req, res) => {
  const {
    appFinYear: transYear,
    appDivisionId: divisionId,
    help_list,
  } = req?.query;

  console.log("req?.query:", req?.query);

  if (help_list === "vendor") {
     const vendorList = await db.query(
      ` select v_name, v_code from mommvend order by 1 `,
     
    );
    return res.status(200).send(vendorList.rows);
  }
  if (help_list === "item") {
     const itemList = await db.query(
      `select fc_code,it_code,it_name_long from mommitem order by 2 `,
     
    );
    return res.status(200).send(itemList.rows);
  }
  if (help_list === "PoNo") {
     const POList = await db.query(
      `  Select a.po_no, a.v_code, b.v_name , a.po_id
        from mhmmpo a, mommvend b
        where a.v_code = b.v_code
        AND a.DIVISION_ID= $1
        order by a.po_no
        `,[divisionId]
     
    );
    return res.status(200).send(POList.rows);
  }
  if (help_list === "from" || help_list === "to") {
     const fromList = await db.query(
      `  SELECT GE_NO,GE_DATE,CHLN_NO,CHLN_DATE
            FROM THMMRCT  A
            WHERE  a.DIVISION_ID=$1
            ORDER BY GE_NO,GE_DATE,CHLN_NO,CHLN_DATE
        `,[divisionId]
     
    );

    return res.status(200).send(
      fromList.rows.map((item)=>({
        ...item,
        ge_date:dateFormater(item.ge_date),
        chln_date:dateFormater(item.chln_date),
      })));
  }

   if (help_list === "mrir") {
     const mrirList = await db.query(
      `select DISTINCT mrir_no from tdmmrct `,
     
    );
    return res.status(200).send(mrirList.rows);
  }

  // if (help_list === "to") {
  //    const toList = await db.query(
  //     `  SELECT GE_NO,GE_DATE,CHLN_NO,CHLN_DATE
  //           FROM THMMRCT  A
  //           WHERE  a.DIVISION_ID=$1
  //           ORDER BY GE_NO,GE_DATE,CHLN_NO,CHLN_DATE
  //       `,[divisionId]
     
  //   );
  //     return res.status(200).send(
  //     toList.rows.map((item)=>({
  //       ...item,
  //       ge_date:dateFormater(item.ge_date),
  //       chln_date:dateFormater(item.chln_date),
  //     })));
  // }
};

exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});


  exports.validatePoNo = async (req, res) => {
    try {
      const { po_no } =  req?.query;

      if (!po_no) {
        return res.status(400).json({
          success: false,
          message: "PO No is required",
        });
      }

      const query = `
        SELECT po_id, category
        FROM mhmmpo
        WHERE po_no = $1
      `;
      const result = await db.query(query, [po_no]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "PO No. does not exist",
        });
      }

      return res.status(200).json({
        success: true,
        po: result.rows[0],
      });
    } catch (err) {
      console.error("validatePoNo error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
   };


  exports.validatePoCategory = async (req, res) => {
    try {
      const { po_category } = req.query;

      if (!po_category) {
        return res.status(400).json({
          success: false,
          message: "PO Category is required",
        });
      }

      const query = `
        SELECT 
          MIN(po_id) AS from_po_id,
          MAX(po_id) AS to_po_id
        FROM mhmmpo
        WHERE category = $1
      `;

      const result = await db.query(query, [po_category]);

      const row = result.rows[0];

      if (!row.from_po_id || !row.to_po_id) {
        return res.status(404).json({
          success: false,
          message: "PO do not exist against this PO Category",
        });
      }

      return res.status(200).json({
        success: true,
        from_po_id: row.from_po_id,
        to_po_id: row.to_po_id
      });

    } catch (err) {
      console.error("validatePoCategory error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
   };


  exports.handlePostFormData = catchAsync(async (req, res, next) => {
    try {
      const { selection, v_code, it_code, po_id, po_category, ge_no_from, ge_no_to, it_type, it_base, it_sub_c, 
        from_date, to_date, division_id,mrir_no} = req.body;

      let query = "";
      let params = [];

      switch (selection) {

    
          // C → PO CATEGORY WISE
      
        case "C":
          query = `
            SELECT h.v_code, d.mrir_no, d.mrir_date,
                  h.chln_no, h.chln_date,
                  d.it_code, d.qty_recd, d.qty_accptd, d.status_flg,
                  d.dev_no, d.dev_qty, d.under_seg, d.under_dc, d.it_pu_um,
                  p.po_no, h.ge_id, h.ge_no, h.ge_date,
                  d1.supp_batch_no,
                  d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd,
                  d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            JOIN mhmmpo p ON d.po_id = p.po_id
            LEFT JOIN tdmmrct_batch d1 ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE p.category = COALESCE($1, p.category)
              AND h.division_id = $2
              AND d.mrir_date >= $3
              AND d.mrir_date <= $4
            ORDER BY p.po_no, d.it_code, d.mrir_no
          `;
          params = [po_category, division_id, from_date, to_date];
          break;

      
        //  V → Vendor Wise
          case "V":
          query = `
            SELECT h.ge_id, h.v_code, d.mrir_no, d.mrir_date,
                  h.chln_no, h.chln_date, d.it_code, d.qty_recd, d.qty_accptd,
                  d.status_flg, d.dev_no, d.dev_qty, d.under_seg, d.under_dc,
                  d.it_pu_um, h.ge_no, h.ge_date,
                  d1.supp_batch_no,
                  d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd,
                  d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            LEFT JOIN tdmmrct_batch d1 ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE h.v_code = COALESCE($1, h.v_code)
              AND d.mrir_date >= $2
              AND d.mrir_date <= $3
              AND h.division_id = $4
            ORDER BY h.v_code, h.chln_no
          `;
          params = [v_code, from_date, to_date, division_id];
          break;

        
          //  D → Date + Vendor + Item Category Wise
      
        case "D":
          query = `
            SELECT DATE(h.ge_date) AS ge_date, h.ge_no, h.v_code,
                  d.mrir_no, d.mrir_date, h.chln_no, h.chln_date, d.it_code,
                  d.qty_recd, d.qty_accptd, d.status_flg, d.dev_no, d.dev_qty,
                  d.under_seg, d.under_dc, d.it_pu_um,
                  v.v_name, i.it_name, i.um_code,
                  h.invward_control_no, h.ge_id,
                  d1.supp_batch_no,
                  d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd,
                  d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            JOIN mommvend v ON h.v_code = v.v_code
            JOIN mommitem i ON d.it_code = i.it_code
            LEFT JOIN tdmmrct_batch d1 ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE DATE(h.ge_date) BETWEEN DATE($1) AND DATE($2)
              AND h.division_id = $3
              AND h.v_code = COALESCE($4, h.v_code)
              AND i.it_type = COALESCE($5, i.it_type)
              AND i.it_base = COALESCE($6, i.it_base)
              AND i.it_sub_c = COALESCE($7, i.it_sub_c)
            ORDER BY DATE(h.ge_date), h.v_code, d.it_code
          `;
          params = [from_date, to_date, division_id, v_code, it_type, it_base, it_sub_c];
          break;

    
        //  * G → Gate Entry No Wise
        
        case "G":
          query = `
            SELECT h.v_code, h.ge_no, h.ge_date,
                  d.mrir_no, d.mrir_date, h.chln_no, h.chln_date,
                  d.it_code, d.qty_recd, d.qty_accptd,
                  d.status_flg, d.dev_no, d.dev_qty, d.under_seg, d.under_dc,
                  d.it_pu_um, p.po_no,
                  h.ge_id, h.ge_no AS ge_no1, h.ge_date AS ge_date1,
                  d1.supp_batch_no,
                  d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd,
                  d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            LEFT JOIN mhmmpo p ON p.po_id = d.po_id
            LEFT JOIN tdmmrct_batch d1 ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE h.ge_no BETWEEN COALESCE($1, h.ge_no) AND COALESCE($2, h.ge_no)
              AND d.mrir_date >= $3
              AND d.mrir_date <= $4
            ORDER BY p.po_no, d.it_code, d.mrir_no
          `;
          params = [ge_no_from, ge_no_to, from_date, to_date];
          break;

        //  * I → Item Wise
        case "I":
          query = `
            SELECT h.v_code, d.mrir_no, d.mrir_date,
                  h.chln_no, h.chln_date, d.it_code,
                  d.qty_recd, d.qty_accptd, d.status_flg,
                  d.dev_no, d.dev_qty, d.under_seg, d.under_dc, d.it_pu_um,
                  ROW_NUMBER() OVER() AS sno,
                  h.ge_id,
                  d1.supp_batch_no,
                  d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd,
                  d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            LEFT JOIN tdmmrct_batch d1 ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE d.it_code = COALESCE($1, d.it_code)
              AND d.mrir_date >= $2
              AND d.mrir_date <= $3
              AND h.division_id = $4
            ORDER BY h.v_code, h.chln_date, d.it_code, d.mrir_no
          `;
          params = [it_code, from_date, to_date, division_id];
          break;

      
        //  P → PO Wise
        case "P":
          query = `
            SELECT h.v_code, d.mrir_no, d.mrir_date,
                  h.chln_no, h.chln_date, d.it_code,
                  d.qty_recd, d.qty_accptd, d.status_flg,
                  d.dev_no, d.dev_qty, d.under_seg, d.under_dc, d.it_pu_um,
                  p.po_no, h.ge_id, h.ge_no, h.ge_date,
                  d1.supp_batch_no,
                  d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd,
                  d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            JOIN mhmmpo p ON d.po_id = p.po_id
            LEFT JOIN tdmmrct_batch d1 ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE p.po_id = COALESCE($1, p.po_id)
              AND p.category = COALESCE($2, p.category)
              AND h.division_id = $3
              AND d.mrir_date >= $4
              AND d.mrir_date <= $5
            ORDER BY p.po_no, d.it_code, d.mrir_no
          `;
          params = [po_id, po_category, division_id, from_date, to_date];
          break;

      
        //  L → Vendor / Challan Wise
        case "L":
          query = `
            SELECT h.v_code, d.mrir_no, d.mrir_date,
                  h.chln_no, h.chln_date, d.it_code,
                  d.qty_recd, d.qty_accptd, d.status_flg,
                  d.dev_no, d.dev_qty, d.under_seg, d.under_dc, d.it_pu_um,
                  d.qty_rej, d.qty_advise,
                  h.ge_id, d.po_id, h.ge_no, h.ge_date,
                  d1.supp_batch_no, d1.qty_recd AS batch_qty_recd,
                  d1.qty_accptd AS batch_qty_accptd, d1.expiry_date
            FROM thmmrct h
            JOIN tdmmrct d ON h.ge_id = d.ge_id
            LEFT JOIN tdmmrct_batch d1
              ON d1.ge_id = d.ge_id AND d1.it_code = d.it_code
            WHERE h.v_code = COALESCE($1, h.v_code)
              AND d.mrir_date >= $2
              AND d.mrir_date <= $3
              AND h.division_id = $4
            ORDER BY h.v_code, d.it_code, d.mrir_no
          `;
          params = [v_code, from_date, to_date, division_id];
          break;

          //  B → Vendor / Item Wise
      case "B":
        query = `
          SELECT  h.ge_id, h.v_code, d.mrir_no, d.mrir_date, h.chln_no, h.chln_date, d.it_code, d.qty_recd,
          d.qty_accptd, d.status_flg, d.dev_no, d.dev_qty, d.under_seg, d.under_dc, d.it_pu_um,
            ROW_NUMBER() OVER (ORDER BY h.v_code, d.it_code, d.mrir_no) AS sno, d.qty_rej, h.ge_no, h.ge_date, 
            d1.supp_batch_no, d1.qty_recd  AS batch_qty_recd, d1.qty_accptd AS batch_qty_accptd, d1.expiry_date
          FROM thmmrct h
          JOIN tdmmrct d 
            ON h.ge_id = d.ge_id
          LEFT JOIN tdmmrct_batch d1 
            ON d1.ge_id = d.ge_id
          AND d1.it_code = d.it_code
          WHERE 
            h.v_code   = COALESCE($1, h.v_code)
            AND d.it_code = COALESCE($2, d.it_code)
            AND d.mrir_date >= $3
            AND d.mrir_date <= $4
            AND h.division_id = $5
          ORDER BY 
            h.v_code,
            d.it_code,
            d.mrir_no
        `;

        params = [v_code, it_code, from_date, to_date, division_id ];
        break;
           
           // pending for inspection and mrir_no.

        case "S": 
        query = `select * from tdmmrct where mrir_no = $1`;

        params = [mrir_no]
        break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid selection / radio button",
          });
      }

      // RUN QUERY
      const result = await db.query(query, params);

      return res.status(200).json({
        success: true,
        data: result.rows,
        columns: result.fields.map(f => f.name),
      });

    } catch (error) {
      console.error("handlePostFormData error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
    });


      
    // po_no validation

// If :po_no is not null then
//    Begin
//        Select po_id, category into :po_id, :po_category 
//            from mhmmpo where po_no = :po_no;
//    Exception
//        When no_data_found then
//        error_message('PO No. does not exist');
//        Raise form_trigger_failure;
//    End;
// End if;

    // po_id

// If :po_no is not null then
//    Begin
//        Select po_id into :to_po_id from mhmmpo where po_no = :po_no;
//    Exception
//        When no_data_found then
//        error_message('PO does not exist in Master');
//        Raise form_trigger_failure;
//    End;
// ELSE 
// 	:to_po_id := NULL;
//    change_itemlov;
//    :to_po_id := :po_id;
// End if;





// begin  po_category
//    select min(po_id) into :po_id from mhmmpo 
//          where category = :po_category
// /*           and rownum = 1  
//         order by po_id */ ;
// exception
//     when no_data_found then
//       error_message('Po does not exist against this PO');
//          Raise form_trigger_failure;
// end;

// begin
//    select max(po_id) into :to_po_id from mhmmpo 
//          where category = :po_category
// /*           and rownum = 1  
//         order by po_id desc */;
// exception
//     when no_data_found then
//       error_message('Po does not exist against this PO Category');
//          Raise form_trigger_failure;

// end;
         
// If :to_Date < :from_date then
//    error_message('TO date cannot be less than From Date..');
//    raise form_trigger_failure;
// End if;

// if :dest_type is null then
//   error_message('Destination can not be null');
//   raise form_trigger_failure;
// end if;



    // gen_from_no validation
// If :po_no is not null then
//    Begin
//        Select po_id, category into :po_id, :po_category 
//            from mhmmpo where po_no = :po_no;
//    Exception
//        When no_data_found then
//        error_message('PO No. does not exist');
//        Raise form_trigger_failure;
//    End;
// End if;
      //  gen to_no validation
// If :po_no is not null then
//    Begin
//        Select po_id, category into :po_id, :po_category 
//            from mhmmpo where po_no = :po_no;
//    Exception
//        When no_data_found then
//        error_message('PO No. does not exist');
//        Raise form_trigger_failure;
//    End;
// End if;





// 1) ISSUEPRN

// SELECT A.DOC_ID , a.TRANS_CODE, a.DOC_NO,  a.DOC_DATE,  D.IT_CODE, a.WC_ID ,a.remark,  D.UM_CODE, D.QTY, c.IT_NAME, c.IT_TYPE, c.IT_BASE, c.IT_SUB_C, p.CATALOG_CODE,
// A.CREATE_ID, A.KIT_ISSUED_TO, A.KIT_REMARKS
// FROM TDMMMAIN D,THMMMAIN a, MOMMITEM c, MOSMPROD p
// WHERE a.WC_ID = :pWC_ID 
// AND a.DOC_NO BETWEEN NVL(:pDOC_NO1, a.DOC_NO) and NVL(:pDOC_NO2, a.DOC_NO) 
// AND  D.DOC_ID = A.DOC_ID
// AND D.it_Code = c.IT_CODE
// AND C.IT_CODE = P.IT_CODE (+)
// ORDER BY DOC_NO

// SELECT DOC_ID, IT_CODE, BATCH_NO, BATCH_QTY, OK_REJ, EXPIRY_DATE FROM TDMMMAIN_BATCH
// ORDER BY BATCH_NO

// 2) MRIRCLR

// SELECT /*+ ordered INDEX (d I_TDMMRCT_STATUS_FLG) INDEX (d I_TDMMRCT_IT_CODE) */
// h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC, d.IT_PU_UM , ROWNUM SNO, d.QTY_ETS,d.CLEAR_DT,I.IT_NAME
// FROM THMMRCT h, TDMMRCT d,MOMMITEM I ,MOMMSTOK S
// WHERE d.STATUS_FLG not in ( 'I', 'G')
// AND  d.CLEAR_DT between nvl(:pCLEAR_DT1,d.CLEAR_DT) and nvl( :pCLEAR_DT2,d.CLEAR_DT)
// AND  h.GE_ID = d.GE_ID
// AND  S.WC_ID = :pWC_ID
// AND d.IT_CODE = I.IT_CODE
// AND D.IT_CODE = S.IT_CODE
// AND S.DEFAULT_STORE = 'Y'
// order by h.v_code, d.mrir_no

// SELECT V_CODE, V_NAME FROM MOMMVEND

// 3) INMATVIT

//  SELECT h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, 
// 			 d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC,   d.IT_PU_UM,
// 			 p.po_no,h.ge_id,h.ge_no,h.ge_date, d1.supp_batch_no, d1.qty_recd batch_qty_recd , 
// 			 d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 			 FROM THMMRCT h, TDMMRCT d, MHMMPO p, tdmmrct_batch d1
// 			 ---WHERE p.Po_id   = nvl(:po_id,p.po_id) 
// 			 WHERE   p.category = nvl(:po_category,p.category)----decode(:po_category, null, p.category, :po_category)
// 				 AND D.po_id = p.po_id   
// 				 AND  h.GE_ID = d.GE_ID
// 				 AND  h.division_id = :Global.G_DIVISION_ID
// 				 AND   d.MRIR_DATE >= :From_date
// 				 AND  d.MRIR_DATE <= :TO_date
// 				 AND  d1.ge_id(+) = d.ge_id
// 				 AND  d1.it_code(+) = d.it_code 
// 			 ORDER BY p.po_no , D.it_code,D.MRIR_NO;



// SELECT h.ge_id,h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, 
// 				 d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC,d.IT_PU_UM,h.ge_no,h.ge_date,
// 				 d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd ,d1.expiry_date
// 				 FROM THMMRCT h, TDMMRCT d, tdmmrct_batch d1
// 				 WHERE h.V_CODE  = NVL(:v_code,H.V_CODE)
// 				   AND   d.MRIR_DATE >= NVL(:From_date,SYSDATE)
// 				   AND  d.MRIR_DATE <= NVL( :TO_date,SYSDATE)
// 				   AND  h.GE_ID = d.GE_ID
// 				   AND  h.division_id = :Global.G_DIVISION_ID
// 				   AND  d1.ge_id(+) = d.ge_id
// 				   AND  d1.it_code(+) = d.it_code 
// 				 ORDER BY v_code, chln_no;


//  SELECT TRUNC(H.GE_DATE) GE_DATE, H.GE_NO, H.V_CODE, D.MRIR_NO, D.MRIR_DATE, H.CHLN_NO, H.CHLN_DATE, D.IT_CODE, D.QTY_RECD, D.QTY_ACCPTD, 
//        D.STATUS_FLG, D.DEV_NO, D.DEV_QTY, D.UNDER_SEG, D.UNDER_DC,   D.IT_PU_UM, V.V_NAME, I.IT_NAME, I.UM_CODE, H.INVWARD_CONTROL_NO,H.GE_ID,
//        d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 			 FROM THMMRCT H, TDMMRCT D, MOMMVEND V, MOMMITEM I,tdmmrct_batch d1
// 			 WHERE TRUNC(H.GE_DATE) BETWEEN TRUNC(:From_date) AND TRUNC(:TO_date)
// 				 AND  H.GE_ID = D.GE_ID
// 				 AND  H.DIVISION_ID = :Global.G_DIVISION_ID
// 				 AND H.V_CODE = NVL(:v_code, H.V_CODE)
// 				 AND H.V_CODE = V.V_CODE
// 				 AND D.IT_CODE = I.IT_CODE
// 				 AND I.IT_TYPE = NVL(:IT_TYPE, I.IT_TYPE)
// 				 AND I.IT_BASE = NVL(:IT_BASE, I.IT_BASE)
// 			   AND I.IT_SUB_C = NVL(:IT_SUB_C, I.IT_SUB_C)
// 			   AND  d1.ge_id(+) = d.ge_id
// 				 AND  d1.it_code(+) = d.it_code 
// 			 ORDER BY TRUNC(H.GE_DATE), H.V_CODE, D.IT_CODE;


//  SELECT h.V_CODE,H.GE_NO,H.GE_DATE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, 
// 				 d.STATUS_FLG, d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC,   d.IT_PU_UM,
// 				 p.po_no,h.ge_id,h.ge_no ge_no1,h.ge_date ge_date1,
// 				 d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 				 FROM THMMRCT h, TDMMRCT d, MHMMPO p, tdmmrct_batch d1
// 				   WHERE H.GE_NO BETWEEN NVL(:GE_NO_FROM,H.GE_NO) AND NVL(:GE_NO_TO,H.GE_NO) 
// 				--AND  p.Po_id   = nvl(:pPo_id,p.po_id) 
// 				--AND   p.category = decode(:pPO_category, null, p.category, :pPo_category)
// 				   AND p.po_id(+) = D.po_id  -----AND D.po_id = p.po_id   
// 				   AND  h.GE_ID = d.GE_ID
// 				--AND  h.division_id = :p_division_id
// 				   AND   d.MRIR_DATE >= :From_date
// 				   AND  d.MRIR_DATE <= :TO_date
// 				---AND   GE_NO = 'NK997'
// 					 AND  d1.ge_id(+) = d.ge_id
// 				   AND  d1.it_code(+) = d.it_code 
// 				 ORDER BY p.po_no , D.it_code,D.MRIR_NO;
 

//   SELECT h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, 
// 				 d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC, d.IT_PU_UM , ROWNUM SNO,H.GE_ID,
// 				 d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 				 FROM THMMRCT h, TDMMRCT d, tdmmrct_batch d1 
// 				 WHERE d.IT_CODE   = nvl(:it_code,d.it_code)
// 					 AND   d.MRIR_DATE >= :From_date
// 					 AND  d.MRIR_DATE <= :TO_date
// 					 AND  h.GE_ID = d.GE_ID
// 					 AND h.division_id = :Global.G_DIVISION_ID
// 					 AND  d1.ge_id(+) = d.ge_id
// 				   AND  d1.it_code(+) = d.it_code
// 				 ORDER BY v_code,chln_date, D.it_code, D.MRIR_NO;


// SELECT h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, 
// 				 d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC,   d.IT_PU_UM,
// 				 p.po_no,h.ge_id,h.ge_no,h.ge_date,
// 				 d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 				 FROM THMMRCT h, TDMMRCT d, MHMMPO p, tdmmrct_batch d1
// 				 WHERE  p.Po_id   = nvl(:po_id,p.po_id) 
// 					 AND  p.category = nvl(:po_category,p.category)----decode(:po_category, null, p.category, :po_category)
// 					 AND  D.po_id = p.po_id   
// 					 AND  h.GE_ID = d.GE_ID
// 					 AND  h.division_id = :Global.G_DIVISION_ID
// 					 AND  d.MRIR_DATE >= :From_date
// 					 AND  d.MRIR_DATE <= :TO_date
// 					 AND  d1.ge_id(+) = d.ge_id
// 				   AND  d1.it_code(+) = d.it_code 
// 				 ORDER BY p.po_no , D.it_code,D.MRIR_NO;
 	

//  SELECT h.ge_id,h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, 
// 			  d.DEV_NO, d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC, d.IT_PU_UM , ROWNUM SNO,D.qty_rej,ge_no,ge_date,
// 			  d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 			  FROM THMMRCT h, TDMMRCT d,tdmmrct_batch d1
// 			  WHERE h.V_CODE     = nvl(:v_code,h.v_code)
// 				  AND   d.IT_CODE    = nvl(:IT_CODE,d.it_code)
// 				--AND   d.IT_CODE   <= :pIT_CODE1
// 				  AND   d.MRIR_DATE  >= :From_date
// 				  AND   d.MRIR_DATE  <= :TO_date
// 				  AND   h.GE_ID = d.GE_ID
// 				  AND   h.division_id = :Global.G_DIVISION_ID
// 				  AND  d1.ge_id(+) = d.ge_id
// 				  AND  d1.it_code(+) = d.it_code 
// 			  Order by v_code, D.it_code, D.mrir_no;


//   SELECT h.V_CODE, d.MRIR_NO, d.MRIR_DATE, h.CHLN_NO, h.CHLN_DATE, d.IT_CODE, d.QTY_RECD, d.QTY_ACCPTD, d.STATUS_FLG, d.DEV_NO, 
// 				 d.DEV_QTY, d.UNDER_SEG, d.UNDER_DC,d.IT_PU_UM,D.QTY_REJ,QTY_ADVISE,H.GE_ID, d.po_id,h.ge_no,h.ge_date,
// 				 d1.supp_batch_no, d1.qty_recd batch_qty_recd , d1.qty_accptd batch_qty_accptd , d1.expiry_date
// 				 FROM THMMRCT h, TDMMRCT d, tdmmrct_batch d1
// 				 WHERE h.V_CODE  = NVL(:v_code,H.V_CODE)
// 					 AND   d.MRIR_DATE >= :From_date
// 					 AND  d.MRIR_DATE <= :TO_date
// 					 AND  h.GE_ID = d.GE_ID
// 					 AND  h.division_id = :Global.G_DIVISION_ID
// 					 AND  d1.ge_id(+) = d.ge_id
// 				   AND  d1.it_code(+) = d.it_code 
// 				 ORDER BY v_code, D.it_code,D.MRIR_NO;
 





