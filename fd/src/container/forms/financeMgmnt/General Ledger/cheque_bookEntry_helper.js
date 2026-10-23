import toast from "react-hot-toast"
import { APP_PROD_API } from "../../../../utils/api"

export const headersInitData ={   // block MHFMBNKCHQ
    bank_acc_no:"",
    acc_desc:"",
    chq_no_strt:"",
    chq_no_end:"",
    last_chq_no_used:"",
    issue_dt:"",
    no_of_chq:"",
    open_flag:" ",
    chq_id:"",

}

export const chqBookheader= [
    {label:"Section", width:"45%"},
    {label:"Division", width:"45%"}
]
export const detailsInitData ={   // block MDFMBNKCHQ
    chq_id:"",
    section_id:"",
    division_id:"",

}


export const controlData ={
    di_formStatus:"",
    curryear:"",
    division_id:"",
    userid:"",
}

export const bankCodeHelpListHeader = [
    {label: "Acc. No.", key: "acc_no"},
    {label: "Bank Name", key: "bank_name"},
 ]


 
  export const handleValidateField = async (e, formStatus, formData, setFormData) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const { name, value } = e.target;
    
    const { chq_no_strt, chq_no_end, last_chq_no_used } = formData;

    // --- Required Fields ---
    const requiredFields = {
      bank_acc_no: "Bank Account Number can not be left blank",
      chq_no_strt: "Cheque Start Number can not be left blank",
      chq_no_end: "Cheque End Number can not be left blank",
    };

    if (requiredFields[name] && !value) {
      toast.error(requiredFields[name]);
      document.getElementById(name)?.focus();
      return;
    }

    // --- Business Rules (Start vs End) ---
    if (chq_no_strt && chq_no_end) {
      if (parseInt(chq_no_strt) > parseInt(chq_no_end)) {
        toast.error("Cheque start number can not be greater than Cheque end number");
        document.getElementById("chq_no_strt")?.focus();
        return;
      }

      if (parseInt(chq_no_end) < parseInt(chq_no_strt)) {
        toast.error("Cheque end number can not be less than Cheque start number");
        document.getElementById("chq_no_end")?.focus();
        return;
      }

      // No of cheque calculation
      const noOfChq = parseInt(chq_no_end) - parseInt(chq_no_strt) + 1;
      setFormData((prev) => ({ ...prev, no_of_chq: noOfChq }));
    }

    // --- Last Cheque Validation ---
    if (name === "last_chq_no_used" && last_chq_no_used) {
      if (
        parseInt(last_chq_no_used) < parseInt(chq_no_strt) ||
        parseInt(last_chq_no_used) > parseInt(chq_no_end)
      ) {
        toast.error("Last used No. does not fall between Start no. and End no.");
        document.getElementById("last_chq_no_used")?.focus();
        return;
      }
    }

  // --- Duplicate cheque series validation (CHEQUE_NO_EXISTS equivalent) ---
  // if (["chq_no_strt", "chq_no_end"].includes(name) && value) {
  // const exists = await checkChequeNoExists(value, formData.bank_acc_no, formData.chq_id);
  //   if (exists) {
  //     if (name === "chq_no_strt") {
  //       toast.error(`Cheque start number ${value} already exists for this account`);
  //     } else if (name === "chq_no_end") {
  //       toast.error(`Cheque end number ${value} already exists for this account`);
  //     }
  //     document.getElementById(name)?.focus();
  //     return;
  //   }
  // }

      // --- Duplicate cheque series validation ---
    if (["chq_no_strt", "chq_no_end"].includes(name) && value) {
      const exists = await checkChequeNoExists(value, formData.bank_acc_no, formData.chq_id);
      if (exists) {
        toast.error(
          name === "chq_no_strt"
            ? `Cheque start number ${value} already exists for this account`
            : `Cheque end number ${value} already exists for this account`
        );
        document.getElementById(name)?.focus();
        return;
      }
    }


    // Open Flag Validation
  // if (name === "open_flag" && value === "Y" && bank_acc_no) {
  //   const exists = await checkOpenFlagExists(bank_acc_no);
  //   if (exists) {
  //     toast.error("Cannot Open more than one for a Bank and Section combination");
  //     document.getElementById("open_flag")?.focus();
  //     return;
  //   }
  // }
  };


  export const checkChequeNoExists = async (chqNo, bankAccNo, chqId = null) => {
    try {
      const url = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_DUBLICATE_CHEQUE_NO_DATA}?chq_no=${chqNo}&bank_acc_no=${bankAccNo}${
        chqId ? `&chq_id=${chqId}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error || "Something went wrong");
        return true;
      }

      return data.exists;
    } catch (err) {
      console.error("Cheque no check error:", err);
      toast.error("Server not reachable");
      return true; // fail-safe
    }
  };

  export const checkOpenFlagExists = async (bankAccNo, excludeChqId = null) => {
    try {
      const url = new URL(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_OPEN_FLAG}`
      );
      url.searchParams.append("bank_acc_no", bankAccNo);
      if (excludeChqId) {
        url.searchParams.append("chq_id", excludeChqId);
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error || "Something went wrong");
        return true;
      }

      if (data.exists) {
        toast.error(
          data.message ||
            "Cannot Open more than one for a Bank and Section combination"
        );
        return true;
      }

      return false;
    } catch (err) {
      console.error("Open flag check error:", err);
      toast.error("Server not reachable");
      return true; // fail-safe
    }
  };

// helper function to check duplicates
export function hasDuplicateSectionDivision(details) {
  const seen = new Set();
  for (const row of details) {
    const key = `${row.section_id || ""}-${row.division_id || ""}`;
    if (seen.has(key)) {
      return true; // duplicate mila
    }
    seen.add(key);
  }
  return false;
}

export const createSearchPayloadForChqBookEntrySpecificSearch = (masterData) =>{
   let payload = {};

  let masterKeys = {
    bank_acc_no: "bank_acc_no",
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
} 

// --- API call to backend (equivalent of Oracle CHEQUE_NO_EXISTS proc) ---
// const checkChequeNoExists = async (chqNo, bankAccNo) => {
//   try {
//     const res = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_DUBLICATE_CHEQUE_NO_DATA}?chq_no=${chqNo}&bank_acc_no=${bankAccNo}`
//     );
//     const data = await res.json();

//     if (!res.ok) {
//       toast.error(data.message || data.error || "Something went wrong");
//       return true;
//     }

//     return data.exists; // sirf true/false return
//   } catch (err) {
//     console.error("Cheque no check error:", err);
//     toast.error("Server not reachable");
//     return true; // fail-safe
//   }
// };
// -----------------------
    // --- API call: Check Open Flag (Oracle equivalent logic) ---
// export const checkOpenFlagExists = async (bankAccNo, sectionId, divisionId) => {
//   try {
//     const res = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_OPEN_FLAG}?bank_acc_no=${bankAccNo}&section_id=${sectionId}&division_id=${divisionId}`
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       toast.error(data.message || data.error || "Something went wrong");
//       return true;
//     }

//     if (data.exists) {
//       toast.error(data.message || "Cannot Open more than one for a Bank and Section combination");
//       return true;
//     }

//     return false;
//   } catch (err) {
//     console.error("Open flag check error:", err);
//     toast.error("Server not reachable");
//     return true; // fail-safe
//   }
// };
