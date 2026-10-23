import toast from "react-hot-toast";
import { validate_field } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";

export const headers = [
  { label: "Dashboard Module", width: "100%", isHelpExist: true  },
];

export const dashboardUserRightInitData = {
  user_id: "",
  user_name: "",
  login_name: "",
};

export const dashboardUserRightDetailData = {
  user_id: "",
  db_module_desc: "",
  db_module: "",
};

export const LoginNameHeadHelpListHeader = [
    { label: "Login Name", key: "login_name" },
    { label: "User Name", key: "user_name" },
    { label: "User ID", key: "user_id" },
    { label: "active", key: "active" },
];

export const DBModuleHeadHelpListHeader = [
    { label: "Short Name", key: "sht_name" },
    { label: "Full Name", key: "full_name" },
];


export const handleValidateField = async (e,formStatus) =>{

  if(!['Insert','Update'].includes(formStatus)) return;

   const {name, value } = e.target;

  if(name === "login_name" && !value){
    toast.error("Login name can't be null");
    document.getElementById("login_name").focus();
    return;
  }

  if(name === "db_module_desc" && !value){
    toast.error("Dashboard Module can't be null");
    document.getElementById('db_module_desc').focus();
    return;
  }
}

export const checkDuplicateUserRights = async (user_id, db_module, db_module_desc, formStatus) => {
  if (!db_module || !user_id) {
    toast.error('User ID and DB Module cannot be empty');
    return false;
  }

  try {
    // Use a dedicated endpoint for duplicate checks if available, otherwise use the current one
    const url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DB_USER_RIGHTS_FORM_DATA}?user_id=${user_id}&db_module=${db_module}&db_module_desc=${db_module_desc}`;
    
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      console.error('Error response from API:', error);
      toast.error(error.message || 'Error validating Dashboard User right');
      return false;
    }

    const result = await response.json();
   

    if (result.exist) {
      toast.error(`${db_module_desc} rights are already given to this user`);
      return false; // Duplicate found
    }

    return true; // No duplicate, allow update

  } catch (error) {
    console.error('Error validating Dashboard User right:', error);
    toast.error('Error validating Dashboard User right');
    return false; // Error case, prevent update
  }
};

  export const createSearchPayloadForURSpecificSearch = (masterData) =>{
     let payload = {};



  let masterKeys = {
    login_name: "login_name",
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