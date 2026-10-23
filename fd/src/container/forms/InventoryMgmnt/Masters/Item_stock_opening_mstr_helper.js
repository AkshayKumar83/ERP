import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const headerInitData = {
  // Data Block table name is MOMMWC
  wc_id: "",
  wc_no: "",
  description: "",
  division_id: "",
  store_process: "",
};

export const DetailStockHeader =[
{label:"Item",width:"25%",isHelpExist: true , required:true},
{label:"Item Name",width:"50%"},
{label:"Catalog Code",width:"5%"},
{label:"Year Opn. Qty Ok",width:"10%"},
{label:"Year Opn. Qty Rej",width:"10%"},
]

export const DetailStockInitData = {
  // Data Block table name is MOMMSTOK
  wc_id: "",
  it_code: "",
  item_name: "",
  catalog_code: "",
  yrop_qtyok: "",
  yrop_qtyre: "",
  trans_year: "",
};

export const DetailBatchHeader =[
    {label:"Batch No",width:"26%",required:true},
    {label:"Batch Date",width:"11%",required:true},
    {label:"Ok Qty",width:"13%"},
    {label:"Year Receipt Ok qty",width:"13%"},
    {label:"Year Issue Ok qty",width:"13%"},
    {label:"Current Balance Ok qty",width:"13%"},
    {label:"Rejected Qty",width:"11%"},
    ]
export const DetailStockBatchInitData = {
  // Data Block table name is MOMMSTOK_BATCH
  it_code: "",
  wc_id: "",
  trans_year: "",
  batch_no:"",
  batch_date:"",
  ok_qty:"",
  ytd_recpok:"",
  ytd_issuok:"",
  currbal_ok:"",
  rej_qty:"",
};

export const controlInitData ={
  tot_ok_qty:"",
  tot_rej_qty:"",
  di_formststus:"",
  userid:"",
}

export const itCodeHelpListHeader = [
  {label: "FC Code",key:'fc_code'},
  {label: "Item Code",key:"it_code"},
  {label: "Item Name",key:"it_name"},
]
export const storeNoHelpListHeader = [
  {label: "Wc Id",key:'wc_id'},
  {label: "Wc No",key:"wc_no"},
]


export const handleValidateField = (e, formStatus) => {
  if (!['Update'].includes(formStatus)) {
    return;
  }

  const { name, value } = e.target;

  if (name === "it_code") {
    if (!value) {
      toast.error("Item can't be blank, Please select Account on double click");
      e.target.focus(); 
    }
    return;
  }
};

export const validateOkQty = (yrop_qtyok, totOkQty, currentOkQty) => {
  
  const yearOk = Number(yrop_qtyok) || 0;
  const totalOk = Number(totOkQty) || 0;
  const currentOk = Number(currentOkQty) || 0;

  if (yearOk === 0 && totalOk > 0) {
    toast.error("Cannot enter Ok Qty when Year Opening Ok Qty is Null or Zero");
    return false;
  }

  if (yearOk > 0 && currentOk < 0) {
    toast.error("Batch Ok Qty cannot be Negative");
    return false;
  }
  
  if (yearOk > 0 && totalOk > yearOk) {
    toast.error("Batch Ok Qty cannot be greater than Year Opening Ok Qty");
    return false;
  }

  return true;
};


export const validateRejQty = (yrop_qtyre, totRejQty, currentRejQty) => {
  const yearRej = Number(yrop_qtyre) || 0;
  const totalRej = Number(totRejQty) || 0;
  const currentRej = Number(currentRejQty) || 0;

  if (yearRej === 0 && totalRej > 0) {
    toast.error("Cannot enter Reject Qty when Year Opening Reject Qty is Null or Zero");
    return false;
  }

  if (yearRej > 0 && currentRej < 0) {
    toast.error("Batch Reject Qty cannot be Negative");
    return false;
  }

  if (yearRej > 0 && totalRej > yearRej) {
    toast.error("Batch Reject Qty cannot be greater than Year Opening Reject Qty");
    return false;
  }

  return true;
};

 export const createSearchPayloadForISOMSpecificSearch = (masterData) =>{
     let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    wc_no: "wc_no",
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


export const checkDuplicateItCode = async (it_code, wc_id, trans_year) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_ITEM_EXIST}?check_item_exist=true&it_code=${it_code}&wc_id=${wc_id}&trans_year=${trans_year}`
    );
    const data = await res.json();
    return data.exists;
  } catch (err) {
    console.error("Error checking it_code:", err);
    return false;
  }
};

















// import toast from "react-hot-toast";

// export const headerInitData = {
//   // Data Block table name is MOMMWC
//   wc_id: "",
//   wc_no: "",
//   description: "",
//   division_id: "",
//   store_process: "",
// };

// export const DetailStockHeader =[
// {label:"Item",width:"15%",isHelpExist: true},
// {label:"Item Name",width:"40%"},
// {label:"Catalog Code",width:"7%"},
// {label:"Year Opn. Qty Ok",width:"15%"},
// {label:"Year Opn. Qty Rej",width:"15%"},
// ]

// export const DetailStockInitData = {
//   // Data Block table name is MOMMSTOK
//   wc_id: "",
//   it_code: "",
//   item_name: "",
//   catalog_code: "",
//   yrop_qtyok: "",
//   yrop_qtyre: "",
//   trans_year: "",
// };

// export const DetailBatchHeader =[
//     {label:"Batch No",width:"30%"},
//     {label:"Batch Date",width:"5%"},
//     {label:"Ok Qty",width:"15%"},
//     {label:"Year Receipt Ok qty",width:"10%"},
//     {label:"Year Issue Ok qty",width:"10%"},
//     {label:"Current Balance Ok qty",width:"10%"},
//     {label:"Rejected Qty",width:"10%"},
//     ]
// export const DetailStockBatchInitData = {
//   // Data Block table name is MOMMSTOK_BATCH
//   it_code: "",
//   wc_id: "",
//   trans_year: "",
//   batch_no:"",
//   batch_date:"",
//   ok_qty:"",
//   ytd_recpok:"",
//   ytd_issuok:"",
//   currbal_ok:"",
//   rej_qty:"",
// };

// export const controlInitData ={
//   tot_ok_qty:"",
//   tot_rej_qty:"",
//   di_formststus:"",
//   userid:"",
// }

// export const itCodeHelpListHeader = [
//   // {label: "FCCode",key:fc_code},
//   {label: "Item Code",key:"it_code"},
//   {label: "Item Name",key:"it_name"},
// ]


// export const handleValidateField = (e, formStatus) => {
//   if (!['Update'].includes(formStatus)) {
//     return;
//   }

//   const { name, value } = e.target;

//   if (name === "it_code") {
//     if (!value) {
//       toast.error("Item can't be blank, Please select Account on double click");
//       e.target.focus(); 
//     }
//     return;
//   }
// };

// export const validateBatchQty = () => {
//   const detailRow = detailData[focusedRowIndex];
//   const relatedBatchRows = batchData.filter(
//     (row) => row.detailId === detailRow.id
//   );

//   const totalBatchQty = relatedBatchRows.reduce((sum, item) => sum + Number(item.ok_qty || 0), 0);
//   const yropQtyOk = Number(detailRow.yrop_qtyok || 0);

//   if (yropQtyOk !== 0 && totalBatchQty === 0) {
//     toast.error("Batch Ok Qty cannot be zero or null");
//     return false;
//   }

//   if (totalBatchQty !== 0 && totalBatchQty !== yropQtyOk) {
//     toast.error("Total Ok Batch Qty must be equal to Year Opening Ok Qty");
//     return false;
//   }

//   return true;
// };

//  export const createSearchPayloadForISOMSpecificSearch = (masterData) =>{
//      let payload = {};

//   console.log("masterdata", masterData);

//   let masterKeys = {
//     wc_no: "wc_no",
//   };

//   let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
//   console.log("hasMasterKeys", hasMasterKeys);

//   if (hasMasterKeys) {
//     Object.keys(masterKeys).forEach((key) => {
//       let value = masterData[key];

//       // Exclude undefined and empty values ("")
//       if (value !== undefined && value !== "") {
//         payload[masterKeys[key]] = value;
//       }
//     });
//   }

//   return payload;
// };