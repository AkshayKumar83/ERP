import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const formDetailInitData = [
    {
         active: "Y",
         yr_op_bal: 0,
         cur_bal: "",
         cur_bal_dt: "",
         cur_db_cr: "C",
         acc_no: "",
         division_id: "",
         trans_year: "",
         row_status: ""
        
    }
]  

export const tdsDetailInitData = [
    {
         account_no: "",
         transporter_name: "",
         transporter_add1: "",
         transporter_add2: "",
         transporter_add3: "",
         transporter_city: "",
         city_name: "",
         zip_code: "",
         telephone1: "",
         telephone2: "",
         fax: "",
         con_per1: "",
         con_per2: "",
         pan_number: "",
         tds_cat: ""
    }
]  

// HELP LIST HEADER DATA START

export const rollUpAcc1Header = [
    { label: "RollUp Acc 1", key: "level1" },
    { label: "RollUp Acc 1 Desc", key: "cat_desc" },
  ];
export const rollUpAcc2Header = [
    { label: "RollUp Acc 2", key: "level2" },
    { label: "RollUp Acc 2 Desc", key: "cat_desc" },
  ];
export const rollUpAcc3Header = [
    { label: "RollUp Acc 3", key: "level3" },
    { label: "RollUp Acc 3 Desc", key: "cat_desc" },
  ];
export const rollUpAcc4Header = [
    { label: "RollUp Acc 4", key: "level4" },
    { label: "RollUp Acc 4 Desc", key: "cat_desc" },
  ];


export const rollUpAcc1FcHeader = [
    { label: "RollUp Acc 1", key: "level1" },
    { label: "RollUp Acc 1 Desc", key: "cat_desc" },
  ];
export const rollUpAcc2FcHeader = [
    { label: "RollUp Acc 2", key: "level2" },
    { label: "RollUp Acc 2 Desc", key: "cat_desc" },
  ];
export const rollUpAcc3FcHeader = [
    { label: "RollUp Acc 3", key: "level3" },
    { label: "RollUp Acc 3 Desc", key: "cat_desc" },
  ];
export const rollUpAcc4FcHeader = [
    { label: "RollUp Acc 4", key: "level4" },
    { label: "RollUp Acc 4 Desc", key: "cat_desc" },
  ];
export const accNoHeader = [
    { label: "Acc No", key: "acc_no" },
    { label: "Acc Desc", key: "acc_desc" },
  ];
export const accDescHeader = [
    { label: "Acc No", key: "acc_no" },
    { label: "Acc Desc", key: "acc_desc" },
  ];

  // HELP LIST HEADER DATA END

  // VALIDATE Rollup_acc1 CODE
  
  export async function validateRollUpAcc(e, fieldName, fieldValue, formStatus, formData, cb) {
    if (!['Insert', 'Update'].includes(formStatus)) return;
  
    e.preventDefault();

    const nextElement = e.relatedTarget; // The element getting focus after blur
  //     // If nextElement is an input field, trigger validation
  if (!nextElement || nextElement.tagName !== "INPUT") {
    return// Replace with your validation logic
  }

            if ((fieldName == 'rollup_acc1' || fieldName == 'rollup_acc2' || fieldName == 'rollup_acc3' ||  fieldName == 'rollup_acc4' ) && fieldValue === '') {
              toast.error(`${fieldName} cannot be null`);
              e.target.focus();
              return;
            }


    if (fieldName === 'rollup_acc2' && !formData.rollup_acc1) {
      toast.error('Rollup Acc. 1 is mandatory');
      e.target.focus();
      return;
    }
    
    if (fieldName === 'rollup_acc3' && (!formData.rollup_acc1 || !formData.rollup_acc2)) {
      toast.error('Rollup Acc. 1 and Rollup Acc. 2 are mandatory');
      e.target.focus();
      return;
    }
    
    if (fieldName === 'rollup_acc4' && (!formData.rollup_acc1 || !formData.rollup_acc2 || !formData.rollup_acc3)) {
      toast.error('Rollup Acc. 1, 2, and 3 are mandatory');
      e.target.focus();
      return;
    }
  
   
  
    try {
      let query = '';
      if (fieldName === 'rollup_acc1') {
        query = `rollup_acc1=${fieldValue}`;
      } else if (fieldName === 'rollup_acc2') {
        query = `rollup_acc1=${formData.rollup_acc1}&rollup_acc2=${fieldValue}`;
      } else if (fieldName === 'rollup_acc3') {
        query = `rollup_acc1=${formData.rollup_acc1}&rollup_acc2=${formData.rollup_acc2}&rollup_acc3=${fieldValue}`;
      } else if (fieldName === 'rollup_acc4') {
        query = `rollup_acc1=${formData.rollup_acc1}&rollup_acc2=${formData.rollup_acc2}&rollup_acc3=${formData.rollup_acc3}&rollup_acc4=${fieldValue}`;
      }

        // If validating account code (acc_no), include it in the query
    if (fieldName === 'acc_no' && fieldValue) {
      query += `&acc_no=${fieldValue}`;
    }
  
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.VALIDATE_GL_MSTR_FROM_DATA}/validate?${query}`,
        { credentials: 'include' }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        toast.error(data.message || 'Validation failed');
  
        // Dynamic reset fields based on level
        const resetFields = {
          rollup_acc: '',
          rollup_acc_fc: '',
          [`${fieldName}`]: '',
          [`${fieldName}_desc`]: '',
        };
  
        if (fieldName === 'rollup_acc2') {
          resetFields.rollup_acc2_fc = '';
          resetFields.rollup_acc2_fc_desc = '';
        }
  
        if (fieldName === 'rollup_acc3') {
          resetFields.rollup_acc3_fc = '';
          resetFields.rollup_acc3_fc_desc = '';
        }

        if (fieldName === 'rollup_acc4') {
          resetFields.rollup_acc4_fc = '';
          resetFields.rollup_acc4_fc_desc = '';
        }
  
        cb({
          ...formData,
          ...resetFields,
        });
  
        e.target.focus();
        return;
      }
  
      // Success: update the state
      cb({
        ...formData,
        [fieldName]: fieldValue,
        ...data.data,
      });
  
    } catch (error) {
      toast.error(error.message || 'An error occurred');
  
      // Same reset logic for exceptions
      const resetFields = {
        rollup_acc: '',
        rollup_acc_fc: '',
        [`${fieldName}`]: '',
        [`${fieldName}_desc`]: '',
      };
  
      if (fieldName === 'rollup_acc2') {
        resetFields.rollup_acc2_fc = '';
        resetFields.rollup_acc2_fc_desc = '';
      }
  
      if (fieldName === 'rollup_acc3') {
        resetFields.rollup_acc3_fc = '';
        resetFields.rollup_acc3_fc_desc = '';
      }

      if (fieldName === 'rollup_acc4') {
        resetFields.rollup_acc4_fc = '';
        resetFields.rollup_acc4_fc_desc = '';
      }
  
      cb({
        ...formData,
        ...resetFields,
      });
  
      e.target.focus();
    }
  }

 
 
  let hasValidationError = false;

 export const handleValidateField = (e, formStatus, isCanceling) => {
  if (!['Insert', 'Update'].includes(formStatus) || isCanceling) return;

  const { name, value } = e.target;

  if (name.startsWith("rollup_acc") && !value) {
    toast.error(`${name.replace("_", " ")} can not be blank, Please select Account on double click`);
    document.getElementById(name).focus();
    hasValidationError = true; //  flag set
    return;
  }

  if (name === "acc_desc" && !value) {
    toast.error("Account Description can not be blank");
    document.getElementById("acc_desc").focus();
    hasValidationError = true;
    return;
  }

  // if (name === "yr_op_bal" && !value) {
  //   toast.error("Year Opening Balance can not be blank");
  //   document.getElementById("yr_op_bal").focus();
  //   hasValidationError = true;
  //   return;
  // }
};

   export const handleValidateDetailField = (e, formStatus) => {
  if (!['Insert', 'Update'].includes(formStatus)) return;

  const { name, value } = e.target;

  if (name === "yr_op_bal" && !value) {
    toast.error("Year Opening Balance can not be blank");
    document.getElementById("yr_op_bal").focus();
    hasValidationError = true;
    return;
  }
};

export const handleGenerateAccNo = async ({ formData, setFormData, setFormDetailData,formStatus }) => {

  const { rollup_acc1, rollup_acc2, rollup_acc3, rollup_acc4, acc_exclusive_to_fc } = formData;
  if (!['Insert'].includes(formStatus)) return;

 
  if (hasValidationError) {
    hasValidationError = false; // reset flag
    return;
  }
  


  // if (!rollup_acc1 || !rollup_acc2 || !rollup_acc3 || !rollup_acc4) {
  //   toast.error("Please fill all required Rollup Account fields before generating Account No.");
  //   return;
  // }

  const requiredFields = [
 
  ["rollup_acc1", "Trial Balance Rollup Acc. 1"],
  ["rollup_acc2", "Trial Balance Rollup Acc. 2"],
  ["rollup_acc3", "Trial Balance Rollup Acc. 3"],
  ["rollup_acc4", "Trial Balance Rollup Acc. 4"],
  ["rollup_acc1_fc", "BSPL Rollup Acc. 1"],
  ["rollup_acc2_fc", "BSPL Rollup Acc. 2"],
  ["rollup_acc3_fc", "BSPL Rollup Acc. 3"],
  ["rollup_acc4_fc", "BSPL Rollup Acc. 4"],
];

const missingField = requiredFields.find(([key]) => {
  return !String(formData?.[key] ?? "").trim();
});

if (missingField) {
  toast.error(`${missingField[1]} is required before generating Account No.`);
  return;
}

  // baki API call same
  const params = {
    rollup_acc1,
    rollup_acc2,
    rollup_acc3,
    rollup_acc4,
    acc_exclusive_to_fc: acc_exclusive_to_fc || 'N',
  };

  const query = new URLSearchParams(params).toString();

  try {
    const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GL_MSTR_FORM_DATA}/generate-account-no?${query}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (data.success) {
      setFormData(prev => ({ ...prev, acc_no: data.acc_no }));
      setFormDetailData(prev => [{ ...prev[0], acc_no: data.acc_no }]);
      toast.success(`Generated Account No: ${data.acc_no}`);
    } else {
      toast.error(data.message || 'Account number generation failed');
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    toast.error('Server error while generating account number');
  }
};

     // added akshay 22-20-26
// export const handleGenerateAccNo = async ({
//   formData,
//   setFormData,
//   setFormDetailData,
//   formStatus,
//   rollupType = "GL",
// }) => {
//   if (formStatus !== "Insert") return;

//   if (hasValidationError) {
//     hasValidationError = false;
//     return;
//   }

//   // Active tab ke according rollup fields select 
//   const isBSPL = rollupType === "BSPL";

//   const rollup_acc1 = isBSPL
//     ? formData?.rollup_acc1_fc
//     : formData?.rollup_acc1;

//   const rollup_acc2 = isBSPL
//     ? formData?.rollup_acc2_fc
//     : formData?.rollup_acc2;

//   const rollup_acc3 = isBSPL
//     ? formData?.rollup_acc3_fc
//     : formData?.rollup_acc3;

//   const rollup_acc4 = isBSPL
//     ? formData?.rollup_acc4_fc
//     : formData?.rollup_acc4;

//   const { acc_exclusive_to_fc } = formData;

//   if (!rollup_acc1 || !rollup_acc2 || !rollup_acc3 || !rollup_acc4) {
//     toast.error(
//       `Please fill all required ${isBSPL ? "BSPL" : "GL"} Rollup Account fields before generating Account No.`
//     );
//     return;
//   }

//   const params = {
//     rollup_acc1,
//     rollup_acc2,
//     rollup_acc3,
//     rollup_acc4,
//     acc_exclusive_to_fc: acc_exclusive_to_fc || "N",
//   };

//   const query = new URLSearchParams(params).toString();

//   try {
//     const apiUrl = `${
//       import.meta.env.VITE_BASE_API_URL
//     }${APP_PROD_API.GET_GL_MSTR_FORM_DATA}/generate-account-no?${query}`;

//     const response = await fetch(apiUrl, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();

//     if (data.success) {
//       setFormData((prev) => ({
//         ...prev,
//         acc_no: data.acc_no,
//       }));

//       setFormDetailData((prev) => [
//         { ...prev[0], acc_no: data.acc_no },
//       ]);

//       toast.success(`Generated Account No: ${data.acc_no}`);
//     } else {
//       toast.error(data.message || "Account number generation failed");
//     }
//   } catch (error) {
//     console.error("Generate Account No Error:", error);
//     toast.error("Server error while generating account number");
//   }
// };


 export const createSearchPayloadForGLSpecificSearch = (masterData) =>{
     let payload = {};



  let masterKeys = {
    acc_no: "acc_no",
    acc_desc:"acc_desc",

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

 