import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const physicalInvHeader = [
 {label:"Item Code",width:"15%",isHelpExist: true ,  },
{label:"Item Description",width:"40%"},
{label:"Cat Code",width:"5%"},
{label:"Drawing No.",width:"5%"},
{label:"UOM",width:"5%"},
{label:"OK Quantity.",width:"10%",},
{label:"Rej Quantity",width:"10%"},
{label:" ",width:"5%"},
]
export const physicalInvBatch = [
{label:"Batch No",width:"35%",isHelpExist: true },
{label:"Batch Date",width:"10%"},
{label:"TAG NO",width:"15%"},
{label:"OK Quantity.",width:"20%"},
{label:"Rej Quantity.",width:"20%"},
]


export const headerInitData = {
    row_status:"",
    division_id:"",
    store_process:"",
    ok_rej:" ",
    inv_date:"",
    inv_month:"",
    wc_no:"",
    wc_id:"",
    it_type:"",
    it_base:"",
    it_sub_c:"",

}
export const detailInitData = {
cat_code:"",
drawing_no:"",
row_status:"",
it_code:"",
it_name:"",
um_code:"",
wc_id:"",
inv_month:"",
inv_date:"",
tag_no:"",
it_ok_qty:"",
it_rej_qty:"",
it_rej_prn_flg:"",
sc_flag:"",
status_flag:"",
store_process:"",
trans_year:"",
pinv_id:"",
}

export const batchInitData = {
pinv_id:"",
batch_no:"",
batch_date:"",
it_name:"",
c_name:"",
tag_no:'',
it_code:"",
qty_ok:'',
qty_rej:"",
tot_ok_qty:"",
tot_rej_qty:"",
}

export const WcNoHelpListHeader = [
  {label: "Wc Id",key:'wc_id'},
  {label: "Wc No",key:"wc_no"},
]

export const itCodeHelpListHeader = [
  {label: "Item Code",key:"it_code"},
  {label: "Item Name",key:"it_name"},
  {label: "Drawing No",key:'drawing_no'},
]
export const batchHelpListHeader = [
  {label: "Item Code",key:"it_code"},
  {label: "Batch No",key:"supp_batch_no"},
   {label: "Batch Date",key:'batch_date'},

]


  export const handleValidateHeaderField = (e, formStatus) => {
    if (!["Insert", "Update"].includes(formStatus)) return;
    
    const { name, value } = e.target;

    if (name === "inv_date") {
      if (!value) {
        toast.error("Inventory Date cannot be left blank");
        e.target.focus();
      }
      return;
    }

    if (name === "inv_month") {
      if (!value) {
        toast.error("Month cannot be left blank");
        e.target.focus();
      }
      return;
    }

    if (name === "wc_no") {
      if (!value) {
        toast.error("Work Centre cannot be left blank");
        e.target.focus();
      }
      return;
    }

  };



const handleDecimalValidation = (
  e,
  formStatus,
  data,
  setData,
  rowIndex,
  fieldNames
) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  const { name, value } = e.target;
  if (!fieldNames.includes(name)) return;

  const currentRow = data?.[rowIndex];
  const hasItCode = currentRow?.it_code && currentRow.it_code.trim() !== "";
  if (!hasItCode) return;

  if (!value || value.trim() === "") {
    toast.error(`${name.replaceAll("_", " ")} cannot be blank`);
    e.target.focus();
    return;
  }

  // Ye code tab run kare jab user field chhod de (onBlur par call karna)
  const formatWithThreeDecimals = (val) => {
    if (!val) return "";
    const num = parseFloat(val);
    if (isNaN(num)) return "0.000";
    return num.toFixed(3);
  };

  const formatted = formatWithThreeDecimals(value);

  setData((prev) =>
    prev.map((row, idx) =>
      idx === rowIndex ? { ...row, [name]: formatted } : row
    )
  );
};


export const handleValidateDetailsField = (e, formStatus, detailData, setDetailData, rowIndex) => {
  handleDecimalValidation(e, formStatus, detailData, setDetailData, rowIndex, [
    "it_ok_qty",
    "it_rej_qty",
  ]);
};

export const handleValidateBatchField = (e, formStatus, batchData, setBatchData, rowIndex) => {
  handleDecimalValidation(e, formStatus, batchData, setBatchData, rowIndex, [
    "qty_ok",
    "qty_rej",
  ]);
};



    export const checkItemExistApi = async (params) => {
      const query = new URLSearchParams({
        check_item_exist: "Y",
        it_code: params.it_code,
        wc_id: params.wc_id,
        trans_year: params.trans_year,
        it_type: params.it_type || "",
        it_base: params.it_base || "",
        it_sub_c: params.it_sub_c || "",
      });

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PHYSICAL_INV_FORM_DATA}?${query}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Item not found");
      const data = await res.json();
      return data;
      };

   //  helpers/checkBatchExistApi.js
  export const checkBatchExistApi = async (params) => {
      const query = new URLSearchParams({
        check_batch_exist: "Y",
        it_code: params.it_code,
        batch_no: params.batch_no,
        pinv_id: params.pinv_id,
      });

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PHYSICAL_INV_FORM_DATA}?${query}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Invalid Batch No");
      }

      return res.json();
    };



 export const createSearchPayloadForPhyInvSpecificSearch = (masterData) =>{
     let payload = {};

  // console.log("masterdata", masterData);

  let masterKeys = {
    wc_id: "wc_id",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  console.log("hasMasterKeys", hasMasterKeys);

  if (hasMasterKeys) {
    Object.keys(masterKeys).forEach((key) => {
      let value = masterData[key];

      // Exclude undefined and empty values ("")
      if (value !== undefined && value !== "") {
        payload[masterKeys[key]] = value;
      }
    });
  }

  return payload;
};






































    // header query
// select v.division_id, v.WC_ID, v.INV_DATE, v.INV_MONTH, v.STORE_PROCESS, v.OK_REJ
// from vw_tommpinv v
// /*where exists(select 1 from mommwc w
//               where w.wc_id = v.wc_id
//                 and w.division_id = :global.g_division_id)*/
// where clause = division_id = :global.g_division_id
// order by inv_date

//   --- header post query ---
//   :TEMP.ROW_STATUS := 'X';
// begin
// 	select wc_no into :temp.wc_no
// 	 from mommwc
// 	 where wc_id = :temp.wc_id;
// exception
// 	when no_data_found then
// 	  null;
// end;

// detail whereclause 
// INV_MONTH = :TEMP.INV_MONTH
// AND TRANS_YEAR = :Global.G_fin_year
// AND WC_ID = :TEMP.WC_ID
// AND EXISTS
// (SELECT 1 FROM MOMMITEM B
// WHERE B.IT_CODE = TOMMPINV.IT_CODE
// AND B.IT_TYPE = NVL(:TEMP.IT_TYPE, B.IT_TYPE)
// AND B.IT_BASE = NVL(:TEMP.IT_BASE, B.IT_BASE)
// AND B.IT_SUB_C = NVL(:TEMP.IT_SUB_C, B.IT_SUB_C)
// AND B.ACTIVE = 'Y')

// order by get_item_batch_control_flag(it_code) desc,it_ok_qty desc 
/*IT_CODE GET_CATALOG_CODE(IT_CODE)*/




  // detaild post_query
//   :TOMMPINV.ROW_STATUS := 'X';
// begin
//   select it_name_long, um_code into :tommpinv.it_name, :tommpinv.um_code
//   from mommitem 
//   where it_code = :tommpinv.it_code;
// exception
//   when no_data_found then
//     null;
// end;

// begin
//   select catalog_code into :cat_code from mosmprod
//   where it_code=:tommpinv.it_code;
// exception
// 	when no_data_found then
// 	null;
// end;



      //---when validate record
// if :temp.inv_date is null then
//   error_message('Inventory Date cannot be left blank');
//   raise form_trigger_failure;
// end if;

// if (:TEMP.STORE_PROCESS = 'S' AND:temp.wc_id is null) then
//   error_message('Work Centre cannot be left blank');
//   raise form_trigger_failure;
// end if;

// if :temp.inv_month is null then
//   error_message('Month cannot be left blank');
//   raise form_trigger_failure;
// end if;
// rg month select cmonth, to_char(to_number(month)) from vwmonths
// rg of it_type select cat_desc, level1 from moitbase where level2 = '00' and level3 = '00'
// rg of it_base select cat_desc, level2 from moitbase where level1 = :it_type and level3 = '00' and level2 != '00'
// rg of it_sub_c select cat_desc, level3 from moitbase where level1 = nvl(:it_type,level1) and level2 = nvl(:it_base,level2) and level3 != '00'
//-----rg item --------
// select b.it_name_long it_name, b.it_code, b.drawing_no 
//   from mommstok a, mommitem b
//  where a.wc_id = :temp.wc_id
//    and a.trans_year = :Global.G_fin_year
//    and a.it_code = b.it_code
//    and a.active = 'Y' 
//    and b.it_type = nvl(:temp.it_type, b.it_type)
//    and b.it_base =	nvl(:temp.it_base, b.it_base)
//    and b.it_sub_c = nvl(:temp.it_sub_c, b.it_sub_c)
//    and b.RAW_MATERIAL_CD is null 
//    and not exists (select 'x' from tommpinv
// 					where inv_month = :temp.inv_month
// 	  				  and trans_year = a.trans_year
// 					  and wc_id = a.wc_id
// 					  and it_code = a.it_code)

// rg batch no select distinct it_code, supp_batch_no, batch_date from tdmmrct_batch
//      where it_code = :tommpinv.it_code
//   order by it_code, supp_batch_no,batch_date