const { db } = require("../../../../config/dbConnection");
const catchAsync = require("../../../../utility/catchAsync");
const { dateFormater } = require("../../../../utility/constant");



exports.getFormBaseConstants = catchAsync(async (req, res, next) => {
  try {
    const { level1, level2 } = req.query;

    let itemType = [];
    let itemBase = [];
    let itemSubCat = [];

    // Destination List
    // const destinationResult = await db.query(`
    //  select destype, rep_param from moitdest
    // `);
    // const destinationList = destinationResult.rows;



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
      // destinationList,
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

  if (help_list === "from" || help_list === "to") {
     const fromAndToList = await db.query(
      `  SELECT it_name, it_code
            FROM mommitem
            WHERE it_type = COALESCE(it_type, it_type)
            AND it_base = COALESCE(it_base, it_base)
            AND it_sub_c = COALESCE(it_sub_c, it_sub_c)
            ORDER BY 1 `
     
    );

    return res.status(200).send(fromAndToList.rows)}



};


exports.handleFormOperation = catchAsync(async (req, res, next) => {
  if (req?.query?.help_list) {
    await helpListData(req, res);
    return;
  }
});



exports.handlePostFormData = catchAsync(async (req, res) => {
  try {
    const { rg_item, rg_type,division_id,trans_year, it_base,it_code,it_code1,it_sub_c,it_type,} = req.body;

let baseQuery = `
  SELECT
    mi.it_code                         AS "Item Code",
    mi.it_name                         AS "Item Name",
    it.cat_desc                        AS "Type of Item",
    ib.cat_desc                        AS "Base of Item",
    isc.cat_desc                       AS "Sub Category of Item",
    CASE
      WHEN mi.it_fmp_pu = 'F' THEN 'FMP'
      ELSE 'Purchase'
    END                                AS "Purchase/FMP",
    COALESCE(
      CASE md.mrp_yn
        WHEN 'Y' THEN 'YES'
        WHEN 'N' THEN 'NO'
      END,
      'NA'
    )                                  AS "MRP(YES/NO)",
    mi.um_code                         AS "UOM Stock",
    mi.it_pu_um                        AS "UOM Purchase",
    mi.it_bom_um                       AS "UOM BOM",
    mi.it_p_umf                        AS "Conversion Purchase",
    mi.it_bom_umf                      AS "Conversion BOM",
    mi.it_pu_lt                        AS "Lead Time Purchase",
    mi.it_mfg_lt                       AS "Lead Time Manufacturing",
    CASE
      WHEN mi.batch_control_flag = 'Y' THEN 'YES'
      ELSE 'NO'
    END                                AS "Batch Control(YES/NO)",
    um.user_name                       AS "Created By",
    mi.create_date                     AS "Created Date",
    mi.um_code                         AS "Um Class",
    mi.min_stock                       AS "Min Stock",
    mi.max_stock                       AS "Max Stock",
    mi.reordr_level                    AS "Reorder Level",
    mi.reordr_qty                      AS "Reorder Qty",
    mi.active                          AS "Active",
    mi.hsn_sac_code                    AS "HSN SAC CODE",
    mi.drawing_no                      AS "Drawing No",
    mi.drawing_size                    AS "Drawing Size",

    TO_CHAR(mv.rate_eff_dt, 'YYYY-MM-DD') AS "Rate Eff. Date" ,
    mv.it_rate                         AS "Item Rate"

  FROM mommitem mi
  LEFT JOIN moitbase it
    ON it.level1 = mi.it_type
     AND it.level2='00'
     AND it.level3='00'
  LEFT JOIN moitbase ib
    ON ib.level1 = mi.it_type
     AND ib.level2=mi.it_base
      AND ib.level3='00'
  LEFT JOIN moitbase isc
    ON isc.level1 = mi.it_type
     AND isc.level2=mi.it_base
      AND isc.level3=mi.it_sub_c
  LEFT JOIN mommitemdiv md
    ON md.it_code = mi.it_code 
    AND md.division_id = $1

   -- Left join mdmmvend mv
   -- ON mv.it_code = mi.it_code

   LEFT JOIN (
    SELECT DISTINCT ON (it_code)
        it_code,
        rate_eff_dt,
        it_rate
    FROM mdmmvend
    ORDER BY it_code, rate_eff_dt DESC
) mv
    ON mv.it_code = mi.it_code

   LEFT JOIN user_master um
    ON um.user_id = mi.create_id
`;

let query = '';
let params = [division_id];

// CASE 1: Upper All + Lower All (existing)
if (rg_item === 'A' && rg_type === 'A') {
  query = baseQuery + ` ORDER BY mi.it_name `;
}

// CASE 2: Upper Selective (it_type + it_base + it_sub_c) + Lower All
else if (
  rg_type === 'S' &&
  rg_item === 'A' &&
  it_type &&
  it_base &&
  it_sub_c
) {
  query =
    baseQuery +
    ` WHERE mi.it_type = $2
      AND mi.it_base = $3
      AND mi.it_sub_c = $4
      ORDER BY mi.it_name `;

  params.push(it_type, it_base,it_sub_c);
}

// CASE 3: Upper Selective (it_type + it_base) + Lower All
else if (
  rg_type === 'S' &&
  rg_item === 'A' &&
  it_type &&
  it_base &&
  !it_sub_c
) {
  query =
    baseQuery +
    ` WHERE mi.it_type = $2
      AND mi.it_base = $3
      ORDER BY mi.it_name `;

  params.push(it_type, it_base);
}

// CASE 4: Upper Selective (only it_type) + Lower All
else if (
  rg_type === 'S' &&
  rg_item === 'A' &&
  it_type &&
  !it_base &&
  !it_sub_c
) {
  query =
    baseQuery +
    ` WHERE mi.it_type = $2
      ORDER BY mi.it_name `;

  params.push(it_type);
}


// CASE 5: Upper ALL + Lower Selective (between it_code and it_code1)
else if (
  rg_type === 'A' &&
  rg_item === 'S' &&
  it_code &&
  it_code1
) {
  query =
    baseQuery +
    ` WHERE mi.it_code BETWEEN $2 AND $3
      ORDER BY mi.it_name `;

  params.push(it_code, it_code1);
}

// CASE 6: Upper Selective(only it_type + it_base + it_sub_c) + Lower Selective (between it_code and it_code1)

else if (
  rg_type === 'S' &&
  rg_item === 'S' &&
  it_type &&
  it_base &&
  it_sub_c &&
  it_code &&
  it_code1
) {
  query =
    baseQuery +
    `WHERE mi.it_type = $2
    and mi.it_base = $3
    and mi.it_sub_c = $4
     and
     mi.it_code BETWEEN $5 AND $6
      ORDER BY mi.it_name `;

  params.push(it_type,it_base,it_sub_c,it_code, it_code1);

}

// CASE 7: Upper Selective(only it_type + it_base) + Lower Selective (between it_code and it_code1)
else if (
  rg_type === 'S' &&
  rg_item === 'S' &&
  it_type &&
  it_base &&
  it_code &&
  it_code1
) {
  query =
    baseQuery +
    `WHERE mi.it_type = $2
     and  mi.it_base = $3
     and mi.it_code BETWEEN $4 AND $5
      ORDER BY mi.it_name `;

  params.push(it_type,it_base,it_code, it_code1);
}

// CASE 8: Upper Selective(only it_type) + Lower Selective (between it_code and it_code1)
else if (
  rg_type === 'S' &&
  rg_item === 'S' &&
  it_type &&
  it_code &&
  it_code1
) {
  query =
    baseQuery +
    `WHERE mi.it_type = $2
     and
     mi.it_code BETWEEN $3 AND $4
      ORDER BY mi.it_name `;

  params.push(it_type,it_code, it_code1);
}



const result = await db.query(query, params);

const formattedRows = result.rows.map(row => ({
  ...row,
  "Created Date": dateFormater(row["Created Date"])
}));

return res.status(200).json({
  success: true,
  data: formattedRows,
  columns: result.fields.map(f => f.name)
});


  } catch (error) {
    console.error("handlePostFormData error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
});










//     PROCEDURE ITEM_DUMP_CSV IS
// out_file  Text_IO.File_Type;
//   CURSOR C1 IS
// 		SELECT ALL 	MOMMITEM.IT_CODE, replace(it_name  ,',' ,' ')IT_NAME, MOMMITEM.IT_TYPE, 
// 							MOMMITEM.IT_BASE, MOMMITEM.IT_SUB_C, MOMMITEM.DRAWING_NO, MOMMITEM.DRAWING_SIZE, 
// 							MOMMITEM.DRAWING_REF, MOMMITEM.UM_CODE, MOMMITEM.IT_ABC, 
// 							MOMMITEM.IT_XYZ, MOMMITEM.BUYER_CODE, MOMMITEM.REORDR_QTY, MOMMITEM.REORDR_LEVEL, 
// 							MOMMITEM.MIN_STOCK, MOMMITEM.MAX_STOCK, MOMMITEM.OPTIMUMSTK, MOMMITEM.PURAC_HEAD, 
// 							MOMMITEM.SALAC_HEAD, MOMMITEM.ACTIVE, MOMMITEM.IT_FMP_PU,MOMMITEM.HSN_SAC_CODE, MOMMITEM.IT_PU_UM,
// 							MOMMITEM.IT_BOM_UM, MOMMITEM.IT_P_UMF, MOMMITEM.IT_BOM_UMF, MOMMITEM.IT_PU_LT, MOMMITEM.IT_MFG_LT,
// 						  MOMMITEM.BATCH_CONTROL_FLAG, MOMMITEM.CREATE_ID, MOMMITEM.CREATE_DATE
// 			FROM MOMMITEM
// 			WHERE (MOMMITEM.IT_CODE BETWEEN :IT_CODE AND :IT_CODE1) -- uncomment by krishna 14-oct-2013 as per mukesh it is printing all item on selective option
// 			 AND MOMMITEM.IT_TYPE=DECODE(:IT_TYPE, NULL, MOMMITEM.IT_TYPE, :IT_TYPE)
// 			 AND MOMMITEM.IT_BASE=DECODE(:IT_BASE, NULL, MOMMITEM.IT_BASE, :IT_BASE)
// 			 AND MOMMITEM.IT_SUB_C=DECODE(:IT_SUB_C, NULL, MOMMITEM.IT_SUB_C, :IT_SUB_C)
// 			 ORDER BY IT_TYPE, IT_BASE, IT_SUB_C, MOMMITEM.IT_CODE;

       
//   chtml_path 						VARCHAR2(4000);--moitparm.html_path%type; --BLOCKED BECAUSE OF 12C CONVERSION.
//   v_name  							moitdivision.name%type;    
//   cFNAME 								VARCHAR2(4000);
//   cIT_TYPE  						moitbase.cat_desc%type;
//   cIT_BASE 						  moitbase.cat_desc%type;
//   cSUBC_DSC  						moitbase.cat_desc%type;
//   cMRP_YESNO 					  varchar2(10);
//   cBATCH_CONTROL_FLAG   varchar2(10);
//   cuser_name  					varchar2(100);
//   cIT_FMP_PU 					  varchar2(10);
   
// begin
// 	begin 
//     select GST_RETURN_CSV_PATH into chtml_path from moitparm_12cforms;
//   exception when no_data_found then
//     error_message('Package directory not defined in parameter master');
//   end; 
  
//   IF cHTML_PATH IS NULL THEN
//     error_message('GST RETURN CSV PATH defined in parameter master');
//   End IF; 
  	
//   cFNAME := TO_CHAR(SYSDATE,'Mon-YY')||'_'||TO_CHAR(SYSDATE,'HH24MISS')||'_ITEM_DUMP.csv';	
//   cHTML_PATH :=cHTML_PATH||cFNAME;
  
//   out_file  := Text_IO.Fopen(chtml_path, 'W');
// --    out_file  := Text_IO.Fopen('E:\oraAs\FRHome_1\Apache\Apache\htdocs\PACKAGE_HELP\TOFMGSTR1_B2B.csv', 'W');

//   Text_IO.Put_Line(out_file, 
//                              'IT Code,'||
//                              'IT Name,'||
//                              'Type of Item,'||
//                              'Base of Item,'||
//                              'Sub Category of Item,'||
//                              'Purchase/FMP,'||
//                              'MRP(YES/NO),'||
//                              'UOM Stock,'||
//                              'UOM Purchase,'||
//                              'UOM BOM,'||
//                              'Conversion Purchase,'||
//                              'Conversion BOM,'||
//                              'Lead Time Purchase,'||
//                              'Lead Time Manufacturing,'||
//                              'Batch Control(YES/NO),'||
//                              'Created By,'||
//                              'Created Date,'||
//                              'Um Class,'||
//                              'Min Stock,'||
//                              'Max Stock,'||
//                              'Recorder Level,'||
//                              'Recorder Qty,'||
//                              'Active,'||
//                              'HSN SAC CODE,'||
//                              'DRAWING NO,'||
//                              'DRAWING_SIZE');
                            
                             
//    -- This statements writes one line of comma separted data.
//   FOR REC IN C1 LOOP 
		 
//   	Begin
// 	     SELECT CAT_DESC INTO cIT_TYPE FROM MOITBASE
// 	      WHERE LEVEL1 = rec.it_type
// 	       AND LEVEL2 = '00' AND LEVEL3 = '00';
//   	Exception WHEN NO_DATA_FOUND THEN
// 	     cIT_TYPE := NULL;
//   	End;
  	
// 		Begin
// 		    SELECT CAT_DESC INTO cIT_BASE FROM MOITBASE 
// 		    WHERE LEVEL1 = rec.IT_TYPE
// 		        AND LEVEL2 = rec.IT_BASE AND LEVEL3 = '00';
// 		Exception WHEN NO_DATA_FOUND THEN
// 		      cIT_BASE := NULL;
// 		End;
		
// 		Begin
// 		      SELECT CAT_DESC INTO cSUBC_DSC FROM MOITBASE 
// 		      WHERE LEVEL1 = rec.IT_TYPE
// 		        AND LEVEL2 = rec.IT_BASE AND LEVEL3 = rec.IT_SUB_C;
// 		Exception WHEN NO_DATA_FOUND THEN
// 		      cSUBC_DSC := NULL;
// 		End;	
	 
// 	 	if REC.IT_FMP_PU = 'F' then
// 			cIT_FMP_PU := 'FMP';
// 		else
// 			cIT_FMP_PU := 'Purchase';
// 		end if;
	 	
// 	 	Begin
// 		      SELECT MRP_YN INTO 	cMRP_YESNO FROM MOMMITEMDIV 
// 		      WHERE IT_CODE = rec.IT_CODE
// 		      AND DIVISION_ID = :Global.G_Division_id;
// 		Exception WHEN NO_DATA_FOUND THEN
// 		      cMRP_YESNO := 'NA';
// 		End;
// 		if cMRP_YESNO = 'Y' then
// 			cMRP_YESNO := 'YES';
// 			ELSIF cMRP_YESNO = 'N' then
// 			cMRP_YESNO := 'NO';
// 		else
// 			cMRP_YESNO := 'NA';
// 		end if;
		
// 		if REC.BATCH_CONTROL_FLAG = 'Y' then
// 			cBATCH_CONTROL_FLAG := 'YES';
// 		else
// 			cBATCH_CONTROL_FLAG := 'NO';
// 		end if;
		
// 		Begin
// 		    select user_name into cuser_name
// 		    from user_master 
// 		    where user_id = rec.create_id;
// 		exception when no_data_found then
// 		      cuser_name := null;
// 		End;

//     Text_IO.Put_Line(out_file, REC.IT_CODE||','||
//       												 func_remove_special_char(REPLACE(REC.IT_NAME,',',' '))||','||
//      													 func_remove_special_char(REPLACE(cIT_TYPE,',',' '))||','||
//     												   func_remove_special_char(REPLACE(cIT_BASE,',',' '))||','||
//      												   func_remove_special_char(REPLACE(cSUBC_DSC,',',' '))||','||
//                                cIT_FMP_PU||','||
//                                cMRP_YESNO||','||
//                                REC.UM_CODE||','||
//                                REC.IT_PU_UM||','||
//                                REC.IT_BOM_UM||','||
//                                REC.IT_P_UMF||','||
//                                REC.IT_BOM_UMF||','||
//                                REC.IT_PU_LT||','||
//                                REC.IT_MFG_LT||','||
//                                cBATCH_CONTROL_FLAG||','||
//                                FUNC_REMOVE_SPECIAL_CHAR(replace(replace(replace(replace(cuser_name,',',' '),'’',' '),'”',' '),'¿',' '))||','||
//                                REC.CREATE_DATE||','|| 
//                                REC.UM_CODE||','||
//                                REC.MIN_STOCK||','||
//                                REC.MAX_STOCK||','||
//                                REC.REORDR_LEVEL||','||
//                                REC.REORDR_QTY||','||
//                                REC.ACTIVE||','||
//                                REC.HSN_SAC_CODE||','||
//                                REC.DRAWING_NO||','||
//                                REC.DRAWING_SIZE);
                              
//   END LOOP;
//   -- Statement to close the file "excel_output.csv",
//   -- This statement makes the file available for users.
//   Text_IO.Fclose (out_file);
// 	begin 
//     select HTML_PATH into chtml_path from moitparm_12cforms;
//   exception when no_data_found then
//     error_message('Package directory not defined in parameter master');
//   end; 
//  --- cHTML_PATH:= 'H:\';
//   IF cHTML_PATH IS NULL THEN
//     error_message('Package help directory not defined in parameter master under HTML PATH');
//   End IF; 
//   WEB.SHOW_DOCUMENT(cHTML_PATH||cFNAME,'_blank');
// END;