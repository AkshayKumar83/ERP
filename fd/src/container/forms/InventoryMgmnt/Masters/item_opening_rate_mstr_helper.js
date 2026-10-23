export const formDataInitData = {
it_code: "",
it_name: "",
old_it_code: "",
drawing_no: "",
rev_level: "",
yrop_rate: "",
currwt_rate: "",
std_cost: ""
  
};  

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
   it_code: "",
   it_name: "",
   rev_level: ""

  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  //console.log("hasMasterKeys", hasMasterKeys);

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

