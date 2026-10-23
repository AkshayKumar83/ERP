import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { APP_PROD_API } from "./api";

export const validateFormSubmission = () => {
  return true;
};

export const validateDirectoryData = (data, isSingle = false) => {
  // const requiredFields = ["constitution", "desigRelation", "title", "name", "qualification", "dob", "dom", "mobileNo", "emailId"];
  const requiredFields = ["constitution", "name"];

  if (isSingle) {
    return requiredFields.every(
      (field) => !!(data[field] && data[field].trim() !== "")
    );
  }

  return data.every((row) => {
    return requiredFields.every((field) => {
      return !!(row[field] && row[field].trim() !== "");
    });
  });
};

export const validateFamilyData = (data) => {
  const requiredFields = ["desigRelation", "title", "name", "qualification"];
  return data.every((row) => {
    return requiredFields.every((field) => {
      return !!(row[field] && row[field].trim() !== "");
    });
  });
};

export const dateFormatter = (str) => {
  if (!str) {
    return "";
  }
  try {
    const date = DateTime.fromISO(str, { zone: "utc" }).setZone("Asia/Kolkata");
    return date.toFormat("yyyy-MM-dd");
  } catch (error) {
    console.log(error);
    return "";
  }
};

export const formatDateForInput = (dateString) => {
  if (!dateString) {
    return "";
  }
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

export const transformFamilyDetails = (data = []) => {
  if (Array.isArray(data) && data.length) {
    return data.map((row, index) => {
      return {
        ...row,
        id: index,
        desigRelation: row.relation,
        bloodGroup: row.blood_group,
        mobileNo: row.mobile_no,
        emailId: row.email_id,
        resAdd: row.res_add_1,
        resPhone: row.res_phone,
        involmentInBusiness: row.involvement_in_buisness,
        since: row.since,
        status: row.fam_member_status,
        dob: dateFormatter(row.dob),
        dom: dateFormatter(row.dom),
      };
    });
  }
  return;
};

export const transformDirectoryData = (data = []) => {
  if (Array.isArray(data) && data.length) {
    return data.map((row) => {
      return {
        ...row,
        id: row.individual_sno,
        desigRelation: row.designation,
        bloodGroup: row.blood_group,
        mobileNo: row.mobile_no,
        emailId: row.email_id,
        resAdd: row.res_add_1,
        resPhone: row.res_phone,
        memberStatus: row.member_status,
        dob: dateFormatter(row.dob),
        dom: dateFormatter(row.dom),
        familyDetails: transformFamilyDetails(row?.familyDetails),
      };
    });
  }
  return [];
};

// validate form using form_id
export const validateForm =(form_id, form_name)=>{
    const form = document.getElementById(form_id);
    const formValidity = form.checkValidity();
    if (!formValidity) {
        if (form.reportValidity) {
            form.reportValidity();
        } else {
            throw new Error(`Please fill all the required details in ${form_name}`);
        }
        return false
    }
    return true

}

//check duplicacy entery
export const checkDuplicateEntry = (formData, newEntry, uniqueFields) => {
  return formData.some((entry) =>
    uniqueFields.every((field) => entry[field] === newEntry[field])
  );
};

export const validateFormBlock = (formId, formLabel) => {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll("[required]");
  let isValid = true;

  for (const input of inputs) {
    if (input.disabled) continue;

    if (!input.value || input.value.trim() === "") {
      input.classList.add("is-invalid");

      // Try to extract a friendly label
      const fieldName =
        input.name ||
        input.getAttribute("aria-label") ||
        input.getAttribute("label") ||
        input.id ||
        "Unnamed Field";

      toast.error(`Field '${fieldName}' in '${formLabel}' is required.`);
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus();

      isValid = false;
      break; // Optional: stop at first invalid field
    } else {
      input.classList.remove("is-invalid");
    }
  }

  return isValid;
};


export const getLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};


export const formatTwoDecimal = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toFixed(2);
};


// export const checkDateFinYear = async ({date, trans_year, event})=>{

//   let queryParams = new URLSearchParams({
//     date:date,
//     trans_year
//   })

//     try {
//     const res = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${
//         APP_PROD_API.CHECK_DATE_IN_FIN_YEAR
//       }?${queryParams.toString()}`,
//       { method: "GET" }
//     );

//     if (!res.ok){
//       let errMsg = await res.json()
//       throw new Error(errMsg.message || 'Date not falling within the financial year');
     
//     }

//     const data = await res.json();
//     if(data?.isDateInFinYr == 'Y'){
//       return
//     }else{
//       return false
//     }
   
//   } catch (error) {
//     console.error("Error fetching opening balance:", error);
//     toast.error(error.message || 'cannot get error message from server');
//      return false
//   }
// }


export const checkDateFinYear = async ({ date, trans_year }) => {
  const queryParams = new URLSearchParams({
    date,
    trans_year,
  });

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_DATE_IN_FIN_YEAR}?${queryParams.toString()}`,
      { method: "GET", credentials:'include'}
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Date not falling within the financial year");
    }

    if (data?.isDateInFinYr === "Y") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking date in financial year:", error);
    toast.error(error.message || "Failed to validate financial year date.");
    return false;
  }
};