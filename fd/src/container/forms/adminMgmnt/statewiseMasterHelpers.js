export const stateInitFormDataTemplate = { 
    state_name: "",
    short_name: "",
    parent_desc: "",
    metro_city: "N",
    state_cap_flag: "N",
    local_flag: "",
    tds_state_code: "",
    gst_state_code: "",
    e_inv_country_cd: "",
    ut_yes_no: "N",
    id: 1
}  

export const visibleInitFormDataTemplate = { 
    
    state_name: "",
    short_name: "",
    parent_desc: "",
    metro_city: "N",
    state_cap_flag: "N",
    local_flag: "",
    tds_state_code: "",
    gst_state_code: "",
    e_inv_country_cd: "",
    ut_yes_no: "N",
    id: 1 
    
}  

export const updateFormpayloadTemplate = {
    updatedStateData:[],
    deletedStateData:[],
  }   


  export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log('masterdata', masterData);

  let masterKeys = { 

    state_name: "state_name",
    type: "type"
   
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





