export const headers = [
  // {label: "Action",required: false,width:"20%"},
  { label: "DASHBOARD LINKS", required: true,width:"85%" },
  { label: "ALLOW", required: true, width:"15%" },
];

export const dashboardLinkRightInitData = {
  user_id: "",
  user_name: "",
  login_name: "",
  db_module_desc: "",
  db_module: "",
};

export const dashboardLinkRightDetailData = {
  user_id: "",
  db_module: "",
  link_name: "",
  allow_view: "N",
};

export const LoginNameHeadHelpListHeader = [
    { label: "Login Name", key: "login_name" },
    { label: "User Name", key: "user_name" },
    { label: "User ID", key: "user_id" },
    // { label: "active", key: "active" },
];

export const DBModuleHeadHelpListHeader = [
    { label: "Short Name", key: "sht_name" },
    { label: "Full Name", key: "full_name" },
];
  export const createSearchPayloadForLRSpecificSearch = (masterData) =>{
     let payload = {};



  let masterKeys = {
    user_id: "user_id",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);


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