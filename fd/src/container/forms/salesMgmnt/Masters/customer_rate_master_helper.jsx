import { APP_PROD_API } from "../../../../utils/api";

export const headers=[
    // { label: "Action", required: false,  width:"3%" },
     { label: "C Code", width:"100px",required:true,isHelpExist: true},
     { label: "Name", width:"300px" },
    { label: "IT Code", width:"150px", required: true,isHelpExist: true},
    { label: " Name", width:"350px" },
    { label: " Customer IT Code", width:"150px", required: true},
    { label: " Name", width:"350px" },
    { label: " Eff. Date", width:"100px" ,required: true,},
    { label: " Customer Price", width:"150px" ,required: true,},
    // { label: " Tax Paid Price", width:"10%" ,required: true,},
    { label: "Active", width:"50px" },
    
]


 export const customerRateMasterData={
  row_status: "",
  c_code: "",
  c_name: "",
  it_code: "",
  it_desc: "",
  cus_it_code: "",
  cus_it_desc: "",
  eff_date: "",
  cus_it_prc: "",
  it_rate: "",
  active: "N",
 }

 export const ItemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Name", key: "it_desc" },
  // { label: "Rate Apprvd By Chairman", key: "rate_apprvd_by_chairman" },
];
 export const VendorHelpListHeader = [
  { label: "Customer Code", key: "c_code" },
  { label: "Name", key: "c_name" },
];

export const createSearchPayloadForCustomerRateMstrSpecificSearch = (masterData) =>{
   let payload = {};
  const row = masterData?.[0] || {};

  if (row.it_code) {
    payload.it_code = row.it_code;
  }

  if (row.c_code) {
    payload.c_code = row.c_code;
  }

  return payload;
};



export const checkDuplicateFromDB = async (it_code, c_code, cus_it_code) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CHECK_DUPLICATE_CUSTOMER_RATE_MASTER}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ it_code, c_code, cus_it_code }),
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