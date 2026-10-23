export const formDataHeader = [
  {
    label: "Grade Description",
    required: true,
    width: "20%",
    isHelpExist: true
  },
  {
    label: "Month Days for Salary",
    required: false,
    width: "15%",
    isHelpExist: false,
  },
  { label: "Lease Ent.", required: false, width: "15%", isHelpExist: false },
  { label: "Y/N", required: false, width: "15%", isHelpExist: false },
  {
    label: "Rounded off the Salary Rupee(s)/Paise",
    required: false,
    width: "30%",
    isHelpExist: false,
  },

  { label: "Upto", required: false, width: "70%", isHelpExist: false },
  { label: "Direction", required: false, width: "70%", isHelpExist: false },
  {
    label: "Exgratia Not Apply",
    required: false,
    width: "20%",
    isHelpExist: false,
  },
];

export const formDataInitData = {
  cat_group: "",
  description: "",
  prefix: "",
  code: "",
};

export const formDtlInitData = {
  id: 1,
  grd_desc: "",
  cat_no: "",
  grd_no: "",
  calc_salary_based_on: "",
  lease_ent_per: "",
  rounded_off: "",
  rupees_paise: "",
  rounded_upto: "",
  round_direction: "",
  exgratia_not_apply: "",
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
     description: description
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

