export const formDataHeader = [
  { label: "Code", required: true, width: "20%", isHelpExist: false },
  { label: "Description", required: true, width: "40%", isHelpExist: false },
  { label: "Short Desc", required: true, width: "30%", isHelpExist: false },
];

export const formInitData = { 
  id: 1,
  dept_cd: "",
  department: "",
  short_desc: "",
};   


export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
     dept_cd: "dept_cd"
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

