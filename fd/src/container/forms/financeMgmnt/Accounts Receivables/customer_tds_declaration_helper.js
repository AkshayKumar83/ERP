import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const headers1 = [
    // { label: "Action", required: false, width: "5%" },
    { label: "Customer Code", required: true,width: "10%" },
    { label: "Customer Name", required: true,width: "40%" },
    { label: "Pan No", required: true, width: "20%"},

  ];

  export const headers2 = [
    // { label: "Action", required: false, width: "5%" },
    { label: "Year",width: "10%",isHelpExist: true ,required:true  },
    { label: "Return Filed", width: "5%" },
    { label: "Acknowledgement No",  width: "35%"},
    { label: "Ack. Date", width: "10%"},
    { label: "Last dt of Return Filing", width: "10%",required:true  },
    { label: "Contact Person",  width: "15%",required:true },
    { label: "Contact telephone No", width: "10%",required:true },
  ];

  export const customerTDSDisableData={
    c_code:"",
    c_name:"",
    pan_no:"",
    
  }

  export const customerTDSDeclData={
    trans_year:"",
    c_code:"",
    return_filed:"Y",
    acknowledgement_no:"",
    acknowledgement_date:"",
    last_date_return_file:"",
    contact_person:"",
    contact_person_tel:"",
   
  }

export const yearHelpListHeader = [
  {label: "Trans Year", key: "year_code"},

]

export const checkValidYear = async (c_code, trans_year) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_TDS_VALIDATE_YEAR}?c_code=${c_code}&trans_year=${trans_year}`,
      { credentials: "include" }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message || "Validation failed");
      return false;
    }

    if (data.isDuplicate) {
      toast.error("TDS declaration already exists for this year!");
      return false;
    }

    return true;
  } catch (err) {
    toast.error("Server error while validating year");
    return false;
  }
};



 export const createSearchPayloadForCusTDSDecSpecificSearch = (masterData) => {
      let payload = {};
    
      console.log('masterdata', masterData);
    
      let masterKeys = { 
        c_name: "c_name",
        c_code: "c_code",  
      };
    
      let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
      console.log('hasMasterKeys', hasMasterKeys);
    
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
    