import toast from "react-hot-toast"
import { APP_PROD_API } from "../../../../utils/api"
import { validate_field } from "../../../../lib"

export const WorkCenterInitData = {    // data block name is MOMMWC inside this data there are 
division_id:"",
dept_cd:"",
store_process:"",
inside_outside:"",
wc_id:"",
wc_no:"",
description:"",
store_no:"",
store_type:"",
no_of_machine:"",
machine_hour_rate:"",
efficiency:"",
setup_crew_no:"",
setup_crew_rate:"",
operator_crew_no:"",
operator_crew_rate:"",
helper_crew_no:"",
helper_crew_rate:"",
labour_burden_rate:"",
sub_work_centre:"N",
main_wc_id:"",
work_centre_no:"",
last_stage:"N",
fa_assy:"N",
}

 export const McRateHeader =[
   {label:"Machine Hour Rate", width:"40%"} ,
   {label:"Eff date", width:"50%"} ,
 ]
export const WorkCenterMcRateInitData = {    // data block name is MDMMWC
      wc_id:"",
      mc_hr_rate:"",
      wef_date:"",
      fin_engg:"",
}

export const SkillHeader =[
    {label:"Description", width:"75%", isHelpExist: true} ,
    {label:"Skill Type", width:"15%"} ,
    {label:"No of Emp", width:"10%"} ,
  ]

export const WorkCenterSkillInitData = {    // data block name is MOEMWC_SKILL
    wc_id:"",
    skill_id:"",
    skill_desc:"",
    skill_type:"",
    no_of_emp:"",
}

export const WcNoHelpListHeader = [
  { label: "WC No", key: "wc_no" },
  { label: "Description", key: "description" },
]

export const DescriptionHelpListHeader = [
{ label: "WC No", key: "wc_no" },
{ label: "Description", key: "description" },
]

export const mainWorkHelpListHeader = [
  { label: "Description", key: "description" },
  { label: "WC No", key: "wc_no" },
  { label: "Id", key: "wc_id" },
]

export const skillDescHelpListHeader = [
  { label: "skill Id", key: "skill_id"  },
   { label: "skill Desc", key: "skill_desc" },
   { label: "skill Type", key: "skill_type" },
]


// export const generateNextWcId = async (setFormData) => {

//     try {
//         const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GEN_WCID_WORK_CENTER}`);
//         const data = await response.json();

//         if (data.type === "success") {
//             setFormData((prev) => ({ ...prev, wc_id: data.wc_id }));
//         } else {
//             console.error("Error:", data.message);
//             // Show proper error toast or alert to user
//             toast.error("New WC ID not generate.")
//         }
//     } catch (error) {
//         console.error("API Error:", error);
//     }
// };

export const handleValidateField = async (e, formStatus, formData, setFormData) => {

    if (!['Insert', 'Update'].includes(formStatus)) {
        return;
    }

    const { name, value } = e.target;

    if (name === "division_id" && !value) {
        toast.error("Division cannot be null");
        document.getElementById("division_id").focus();
        return;
    }

    if (name === "dept_cd" && !value) {
        toast.error('Department cannot be null');
        document.getElementById("dept_cd").focus();
        return;
    }

    if (name === "wc_no") {
        if (!value) {
            toast.error('Work Centre No. cannot be null');
            document.getElementById("wc_no").focus();
            return;
        }

        // Duplicate check API call
        const isValid = await checkDuplicateWorkCenterNo({wc_no:value, formStatus, formData});

        if (!isValid) {
            document.getElementById("wc_no").focus();
            return;
        }

        return;
    }

    
    if (name === "description" && !value) {
        toast.error("Work Centre's Description cannot be null");
        document.getElementById("description").focus();
        return;
    }


    if (name === "work_centre_no") {
    if (formData.sub_work_centre === 'Y') {

        if (!value.trim()) {  
            toast.error("Main work centre cannot be null");
            document.getElementById("work_centre_no").focus();
            return;
        }

        // Value present  API call 
        const result = await validateMainWorkCenter(formData.sub_work_centre, value);

        if (result.valid) {
            setFormData(prev => ({ ...prev, main_wc_id: result.main_wc_id }));
        } else {
            toast.error(result.message);
            document.getElementById("work_centre_no").focus();
        }
    }
    return;
}

};

export const checkDuplicateWorkCenterNo = async ({wc_no, formStatus, formData}) => {
    if (!['Insert', 'Update'].includes(formStatus)) {
        return
    }

    if (!wc_no ) {
      toast.error('Work Centre No. can not be null')
    }
    if(formStatus == 'Update'){
        const {original_wc_no} = formData
        if(original_wc_no == wc_no){
            return true
        }
    }

    try {
        const isWcNoFound = await validate_field(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_WORK_CENTER_MASTER_DATA}`,'wc_no',wc_no);

        if(isWcNoFound.exists) {
            toast.error('Work Centre already exists');
            return false;
        }
        return true; // unique and valide
    } catch (error) {
         console.error("Error validating Work Centre No :", error);
        toast.error("Error validating Work Centre No");
        return false;
    }

}

 export const validateMainWorkCenter = async (sub_work_centre, work_centre_no) => {
    // if (!['Insert', 'Update'].includes(formStatus)) {
    //         return;
    //     }

    try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.VALIDATE_MAIN_WORK_CENTER}?sub_work_centre=${sub_work_centre}&work_centre_no=${work_centre_no}`, {
            credentials: 'include',
        });

        const result = await response.json();

        if (response.ok && result.type === 'success') {
            
            return { valid: true, main_wc_id: result.main_wc_id };
        } else {
            return { valid: false, message: result.message };
        }
    } catch (error) {
        console.error('Validation Error:', error);
        return { valid: false, message: 'Validation failed due to server error.' };
    }
  };

export const checkDuplicateMcRateWefDate = async ({ wc_id, wef_date, fin_engg, ctid,formStatus }) => {
    if (!['Insert', 'Update'].includes(formStatus)) {
            return;
        }
    try {
        const url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_WORK_CENTER_MASTER_DATA}?check_duplicate=mc_rate&wc_id=${wc_id}&wef_date=${wef_date}&fin_engg=${fin_engg}${ctid ? `&ctid=${ctid}` : ''}`;

        const response = await fetch(url, {
            credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error while checking duplicate');
        }

        return data; // { type: 'success', message: 'No duplicate found' } OR { type: 'error', message: 'Duplicate...' }

    } catch (error) {
        console.error("Error in checkDuplicateMcRateWefDate:", error);
        return { type: 'error', message: error.message || 'Something went wrong' };
    }
  };

export const checkDuplicateSkillId = async ({ wc_id, skill_id }) => {
  try {
    const url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_WORK_CENTER_MASTER_DATA}?check_duplicate=skill_id&wc_id=${wc_id}&skill_id=${skill_id}`;
    
    const response = await fetch(url, { credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error checking skill duplicate");
    }

    return data;

  } catch (error) {
    return { type: "error", message: error.message || "Something went wrong" };
  }
  };

 export const handleValidationOnSave = (formData) => {

    if (!formData.division_id) {
        toast.error("Division cannot be null");
        document.getElementById("division_id").focus();
        return false;
    }

    if (!formData.dept_cd) {
        toast.error('Department cannot be null');
        document.getElementById("dept_cd").focus();
        return false;
    }

    if (!formData.wc_no) {
        toast.error('Work Centre cannot be null');
        document.getElementById("wc_no").focus();
        return false;
    }

    if (!formData.description) {
        toast.error('Work Centre description cannot be null');
        document.getElementById("description").focus();
        return false;
    }
       
      if (formData.sub_work_centre === "Y" && !formData.work_centre_no) {
        toast.error('Main Work Centre cannot be null');
        document.getElementById("work_centre_no").focus();
        return false;
    }

    return true; // Validation passed
}

export const hasDuplicateWcIdAndWefDate = (dataArray) => {
   
  const seen = new Set();
  for (const item of dataArray) {
    const key = `${item.wc_id}__${item.wef_date}`;
    if (seen.has(key)) {
      return true; // Duplicate found
    }
    seen.add(key);
  }
  return false; // No duplicates
};


export const hasDuplicateWcIdAndSkillId = (dataArray) => {
  const seen = new Set();
  for (const item of dataArray) {
    const key = `${item.wc_id}__${item.skill_id}`;
    if (seen.has(key)) {
      return true; // Duplicate found
    }
    seen.add(key);
  }
  return false; // No duplicates
};


export const onlyNumberKeyAllow = (e ,formStatus)=> {
  if(!["Insert","Update","Search"].includes(formStatus)) return
  const value = e.target.value;

  const allowedKeys = [
    "Backspace",
    "Tab",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  const isNumberKey = e.key >= "0" && e.key <= "9";
  const isDecimalPoint = e.key === "." && !value.includes(".");
  const isMinus = e.key === "-";

  if (isMinus) {
    e.preventDefault();
    toast.error("Negative values are not allowed.");
    return;
  }

  if (allowedKeys.includes(e.key) || isNumberKey || isDecimalPoint) {
    return; // Allow
  }

  e.preventDefault();
  toast.error("Only numbers and one decimal point are allowed.");
};

  export const createSearchPayloadForWorkCntrSpecificSearch = (masterData) =>{
     let payload = {};

  let masterKeys = {
    wc_no: "wc_no",
    description:'description',
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
