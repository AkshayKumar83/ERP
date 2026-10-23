export const formDataHeader = [
  {
    label: "Effective Date",
    required: true,
    width: "12%",
    isHelpExist: false,
  },
  {
    label: "Category",
    required: false,
    width: "15%",
    isHelpExist: true,
  },
  { label: "Grade", required: false, width: "15%", isHelpExist: true },
  { label: "Designation", required: false, width: "15%", isHelpExist: true },
  {
    label: "Rating",
    required: false,
    width: "15%",
    isHelpExist: false,
  },

  {
    label: "Increament Description",
    required: false,
    width: "60%",
    isHelpExist: false,
  },
  { label: "Old Basic", required: false, width: "70%", isHelpExist: false },
  {
    label: "Increament Amount",
    required: false,
    width: "15%",
    isHelpExist: false,
  },

  {
    label: "Revised Basic",
    required: false,
    width: "20%",
    isHelpExist: false,
  },

  {
    label: "Update in Month",
    required: false,
    width: "20%",
    isHelpExist: false,
  },
];

export const formDataInitData = {
  emp_cd: "",
  emp_name: "",
  p_basic: "",
  p_grade: "", 
  p_desig: "",
  p_dept: "",
  p_department: "",
  p_category: "",
  p_desig_desc: "",
  p_grade_desc: "",
  p_cat_desc: "",
};

export const formDtlInitData = {
  id: 1,
  emp_cd: "",
  eff_date: "",
  category_desc: "",
  category: "",
  grad_desc: "",
  desg_desc: "",
  grade_cd: "",
  desg_desc: "",
  desgn: "",
  rating_cd: "",
  rating_desc: "",
  increament: "",
  old_basic: "",
  increament_amt: "",
  basic: "",
  update_in_month: "",
  month_name: "",
  perf_award_amt: "",
  exgratia_amt: "",
  adjustment_amt: "",
};

export const empHelpListHeader = [
  { label: "Employee Code", key: "emp_cd" },
  { label: "Employee Name", key: "emp_name" },
 
];

export const gradeHelpListHeader = [
  { label: "Code", key: "code" },
  { label: "Description", key: "description" },
];  

export const desigHelpListHeader = [
  { label: "Code", key: "code" },
  { label: "Description", key: "description" },
];  

export const catHelpListHeader = [
  { label: "Code", key: "code" },
  { label: "Description", key: "description" },
];

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
    emp_cd: emp_cd,
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
