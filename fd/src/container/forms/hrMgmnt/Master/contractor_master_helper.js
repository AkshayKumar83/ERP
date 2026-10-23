// acc no help list header
export const cityHelpListHeader = [ 
  {label: "City Code", key: "ctycode"},
    {label: "City", key: "city"},
    {label: "State", key: "state"}, 
    {label: "Country", key: "country"},
    {label: "Region", key: "region"},
    {label: "District", key: "district"},
    {label: "Zone", key: "zone"} 
    


]   

export const formInitData = { 
  cont_code: "",
  cont_name: "",
  cont_add1: "", 
  city_name: "", 
  cont_city: "",
  cont_region: "",
  cont_country: "",
  fax: "",
  con_per1: "",
  cont_zip_code: "",
  telephone: "",
  email: "",
  cont_state: "",
  cont_state: "",
  cont_district: "",
  cont_zone: ""


};   


export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
     cont_code: "cont_code"
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

