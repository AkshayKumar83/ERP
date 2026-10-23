import { APP_PROD_API } from "../../../../utils/api";

export const headers=[
    // { label: "Action", required: false,  width:"3%" },
     { label: "V Code", width:"5%",isHelpExist: true},
     { label: " Name", width:"43%" },
    { label: "IT Code", width:"15%", required: true,isHelpExist: true},
    { label: " Name", width:"83%" },
    { label: " Eff. Date", width:"10%" ,required: true,},
    { label: " Vendor Price", width:"10%" ,required: true,},
    // { label: " Tax Paid Price", width:"10%" ,required: true,},
    { label: "Approved By Chairman", width:"5%" },
    
]


 export const rateMasterData={
    v_code:"",        
    it_code:"",  
    it_rate:"", 
    rate_eff_dt:"",
    rate_apprvd_by_chairman:"N",  
 }

 export const ItemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Name", key: "it_name" },
  { label: "Rate Apprvd By Chairman", key: "rate_apprvd_by_chairman" },
];
 export const VendorHelpListHeader = [
  { label: "Vendor Code", key: "v_code" },
  { label: "Name", key: "v_name" },
];

export const createSearchPayloadForRateMstrSpecificSearch = (masterData) =>{
   let payload = {};
  const row = masterData?.[0] || {};

  if (row.it_code) {
    payload.it_code = row.it_code;
  }

  // if (row.po_date) {
  //   payload.po_date = row.po_date; 
  // }

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