export const formDataHeader = [
{ label: "Grade Description", required: true, width: "45%", isHelpExist: true },
  { label: "Start Basic", required: true, width: "20%", isHelpExist: false },
  { label: "Increament", required: true, width: "18%", isHelpExist: false },
   { label: "End Basic", required: true, width: "27%", isHelpExist: false },
  
];

export const formInitData = { 
  id: 1,
  grade_cd: "",
  description: "",
  start_basic: "",
  increament: "",
  end_basic: "",

};    


export const gradeHelpListHeader = [
  {label: "Grade Code", key: "code"},
  {label: "Description", key: "description"}
]   

  

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
     grade_cd: "grade_cd"
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

