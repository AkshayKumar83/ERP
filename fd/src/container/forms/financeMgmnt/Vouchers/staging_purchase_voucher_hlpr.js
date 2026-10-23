import { APP_PROD_API } from "../../../../utils/api";

export const headers=[
 
    { label: "V Code", width:"80px",isHelpExist: true},
    { label: "Name", width:"250px" },
    { label: "Acc. Code", width:"80px", required: true,isHelpExist: true},
    { label: "Name", width:"250px" },
     { label: "Member Name", width:"300px", },
    { label: "Temp. Voucher No.", width:"150px", },
    { label: "Temp. Voucher Date.", width:"80px", },
    { label: "Voucher No.", width:"150px", },
    { label: "Voucher Date.", width:"80px", },
    { label: "Bill No.", width:"130px", required: true,isHelpExist: true},
    { label: "Bill Date", width:"40px" ,required: true,},
    { label: "Amount", width:"100px"},
    { label: "Db/Cr", width:"50px"},
    { label: "Remarks", width:"300px"},
    { label: "Cancel", required: false,  width:"3%" },
    { label: "Approve", required: false,  width:"3%" },
    { label: "PO Prepared By", width:"200px"},
    { label: "PO Checked By", width:"200px"},
    { label: "PO Authorized By", width:"200px"},
    
]


 export const stagingData={
    v_code:"",        
    bill_no:"",  
    bill_dt:"", 
    amount:"",
    voucher_no:"",
 }

 export const VendorHelpListHeader = [
  { label: "Vendor Code", key: "v_code" },
  { label: "Name", key: "v_name" },
];

 export const billNoHelpListHeader = [
  { label: "Bill No.", key: "bill_no" },
];

 export const accNoHelpListHeader = [
  { label: "Acc Code", key: "acc_no" },
  { label: "Acc desc", key: "acc_desc" },
];


export const createSearchPayloadForRateMstrSpecificSearch = (masterData) =>{
   let payload = {};
  const row = masterData?.[0] || {};

  if (row.v_code) {
    payload.v_code = row.v_code;
  }
  if (row.bill_no) {
    payload.bill_no = row.bill_no;
  }

  if (row.bill_dt) {
    payload.bill_dt = row.bill_dt; 
  }

  return payload;
};



export const checkDuplicateFromDB = async (it_code, rate_eff_dt) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CHECK_DUPLICATE_EFF_DATE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ it_code, rate_eff_dt }),
        credentials: "include"
      }
    );

    const data = await res.json();
    return data;

  } catch (err) {
    console.error("Duplicate check error:", err);
    return { type: "error", message: "Server error" };
  }
};