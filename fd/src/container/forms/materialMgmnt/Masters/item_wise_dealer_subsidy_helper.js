import { APP_PROD_API } from "../../../../utils/api";

export const headers=[

    { label: "IT Code", width:"20%", required: true,isHelpExist: true},
    { label: " Name", width:"40%" ,isHelpExist: true},
    { label: " Eff. Date", width:"20%" ,required: true,},
    { label: " Subsidy Percent", width:"20%"},
    
]


 export const itemWiseDealerSubSidyData={       
    it_code:"",  
    subsidy_perc:"", 
    eff_date:"",

 }

 export const ItemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Name", key: "it_name" },
//   { label: "Rate Apprvd By Chairman", key: "rate_apprvd_by_chairman" },
];

 export const ItemNameHelpListHeader = [
   { label: "Item Code", key: "it_code" },
  { label: "Name", key: "it_name" },
];

export const createSearchPayloadForItemWiseDealerSubsidySpecificSearch = (masterData) =>{
   let payload = {};
  const row = masterData?.[0] || {};

  if (row.it_code) {
    payload.it_code = row.it_code;
  }

  if (row.it_name) {
    payload.it_name = row.it_name;
  }

  return payload;
};



export const checkDuplicateFromDB = async (it_code, eff_date) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CHECK_DUPLICATE_ITEM_WISE_DEALER_SUBSIDY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ it_code, eff_date }),
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