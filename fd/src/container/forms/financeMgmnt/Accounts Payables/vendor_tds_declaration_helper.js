export const headers1 = [
    // { label: "Action", required: false, width: "5%" },
    { label: "Vendor Code", required: true,width: "10%" },
    { label: "Vendor Name", required: true,width: "40%" },
    { label: "PAN No", required: true, width: "20%"},

  ];

  export const headers2 = [
    // { label: "Action", required: false, width: "5%" },
    { label: "Financial Year", required: true,width: "7%" },
    { label: "Specified Person", required: true,width: "3%" },
    { label: "Acknowledgement No", required: false, width: "15%"},
    { label: "Ackn. Date", required: false, width: "4%"},
    { label: "Last Date of Return Filing", required: false,width: "4%" },
    { label: "Contact Person", required: false, width: "10%"},
    { label: "Contact Telephone No", required: false, width: "10%"},
  ];

  export const vendorTDSDisableData={
    v_code:"",
    v_name:"",
    pan_no:"",
    id: "",
  }

  export const vendorTDSDeclData={
    trans_year:"",
    v_code:"",
    return_filed:"Y",
    acknowledgement_no:"",
    acknowledgement_date:"",
    last_date_return_file:"",
    contact_person:"",
    contact_person_tel:"",
    id: ""
  }  

   export const createSearchPayloadForBVSpecificSearch = (masterData) => {
      let payload = {};
    
      console.log('masterdata', masterData);
    
      let masterKeys = { 
    
        v_name: "v_name",
        v_code: "v_code",
       
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
    
