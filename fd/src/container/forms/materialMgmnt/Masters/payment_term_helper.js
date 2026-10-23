import toast from "react-hot-toast";
import { checkRequiredFields } from "../../../../lib";

// Header Data Start Here
export const paymentTermHeadInitialData = {
    term_code:'',
    term_desc:'',
    lc:'N',
    active:'N',
    inv_type:'',
    sale_or_purchase:'P', //todo: this field value should be dynamically varied if call from purchase then P if from Sale then S
    po_id:'',
    total_perc: 0,
}

// Details Data Start Here
export const headers = [
    { label: "Payment %",required: true, width: "5%" },
    { label: "Description",required: true, width: "50%" },
    { label: "Credit Days",required: true, width: "3%" },
    { label: "Effective Code",required: true, width: "40%" },
  ];

export const paymentTermDetailInitialData = 
    {   sr_no: 1,
        per_pamnt:'',
        old_per_pamnt:'',
        term_code:'',
        term_desc:'',
        po_cr_days: '',
        eff_code:'',
    }

     export const termCodeHelpListHeader= [
        { label: "Term Code ", key: "term_code" },
        { label: "Description", key: "term_desc" },
      ]

export const updateFormDataPayloadTemplete = {
    updatedPayTermHeadData:{},
    updatedPayTermDetail:[],
    deletedPayTermDetail:[],
    newPayTermDetail:[],
}

// export const validatePayTermDetail =(data, isSingle = false)=>{
//     const requiredFields = ["per_pamnt", "term_desc", 'po_cr_days', 'eff_code'];

//     const requiredFieldsValid = checkRequiredFields(data, requiredFields, isSingle);
    
//     if (!requiredFieldsValid) {
//         return {
//             isValid: false,
//             error: "Please fill all required fields (Payment %, Term Description, Po cr Days, Eff Code)."
//         };
//     }

//     return { isValid: true };

// }


export const validatePayTermDetail = (data) => {
  const requiredFields = ["per_pamnt", "term_desc", "po_cr_days", "eff_code"];

  // Har row ke liye required fields check karo
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let field of requiredFields) {
      if (
        row[field] === null ||
        row[field] === undefined ||
        row[field] === ""
      ) {
        return {
          isValid: false,
          error: ` Please fill all required fields (Payment %, Term Description, Po cr Days, Eff Code).`
        };
      }
    }
  }

  return { isValid: true };
};


export const validatePerPamnt = (e, data, index = 0, formStatus) => {
  if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }

  const { name, value } = e.target;
  if (name === 'per_pamnt') {
    const newVal = Number(value);
    let nVal;

    if (!value) {
      toast.error(`Payment % cannot be left blank`);
      e.target.focus();
      return;
    }

    if (isNaN(newVal)) {
      toast.error(`Payment % must be a number`);
      e.target.focus();
      return;
    }

    if (newVal <= 0) {
      toast.error(`Payment % must be greater than 0`);
      e.target.focus();
      return;
    }

    if (data.length === 1) {
      nVal = newVal;
    } else {
      const totval = data.reduce((acc, curr) => {
        return acc + (Number(curr.per_pamnt) || 0);
      }, 0);

      const oldPerPamnt = Number(data[index].old_per_pamnt || 0);
      nVal = totval - oldPerPamnt;
    }

    if (nVal > 100) {
      toast.error(`Payment % cannot be greater than 100`);
      e.target.focus();
      return;
    }
  }

  return true;
};

  export const validateTermDesc = async(e,formStatus)=>{
      if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }
      const {name, value } = e.target;
      if(name === "term_desc"){
      if (!value) {
          toast.error(`Term Description cannot be left blank`);
             e.target.focus();
      }
         return;
    }
   }


   
export const validateCrDays = (e, formStatus) => {
   if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }
  const { name, value } = e.target;

  if (name === "po_cr_days") {
    if (!value) {
      toast.error(`PO Credit Days cannot be left blank`);
      e.target.focus();
      return;
    }

    if (Number(value) < 0) {
      toast.error(`PO Credit Days cannot be negative`);
      e.target.focus();
      return;
    }
  }
};

export const validateEffCode = (e, formStatus)=>{
     if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }
      const {name,value} = e.target;
      if (name === "eff_code") {
      if(!value){
          toast.error(`Effect Code cannot be left blank`);
           e.target.focus();
          }
       return;
   }
  }

  

export const calcTotalPerc = (formData) => {
    let isValid = true;
    let totval = formData.reduce((accumulator, currentObject) => {
        return parseInt(accumulator) + (parseInt(currentObject.per_pamnt) || 0);
    }, 0);

    if(totval != 100){
        toast.error(`Total of Percentage must be 100`)
        isValid = false;
    }
    return isValid;
};

export const createSearchPayloadForPayTermSpecificSearch = (masterData) =>{
   let payload = {};


  let masterKeys = {
    term_code: "term_code",
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

   ////////////////////////////
     
// export const validatePerPamnt = (e,data,index = 0) => {
//   const {value} = e.target ;
//   const newVal = Number(value);
//   let nVal;

//   if(!value){
//     toast.error(`Payment % cannot be left blank`);
//     return
//   }
//    // add by Akshay for new check 
//    if (isNaN(newVal)) {
//     toast.error(`Payment % must be a number`);
//     return;
//   }

//   if (newVal <= 0) {
//     toast.error(`Payment % must be greater than 0`);
//     return;
//   }

//    if (data.length === 1) {
//     nVal = newVal;
//   } else {
//     const totval = data.reduce((acc, curr) => {
//       return acc + (Number(curr.per_pamnt) || 0);
//     }, 0);

//     const oldPerPamnt = Number(data[index].old_per_pamnt || 0);
//     nVal = totval - oldPerPamnt;
//   }

//  if (nVal > 100) {
//     toast.error(`Payment % cannot be greater than 100`);
//     return;
//   }

//   return true;
// };

// export const validateOnSave = (formData={},paymentTermHeadInitialData=[{}]) =>{
//   if(!formData?.term_desc){
//       toast.error("Payment Term Description cannot be left blank");
//       return
//   }

//   if(!paymentTermHeadInitialData?.per_pamnt){
//      toast.error("Payment Percentage cannot be left blank");
//      return;
//   }

//   if(!paymentTermHeadInitialData?.term_desc){
//      toast.error("Term Description cannot be left blank");
//      return;
//   }

//   if(!paymentTermHeadInitialData?.po_cr_days){
//      toast.error("PO Credit Days cannot be left blank");
//      return;
//   }

//   if(!paymentTermHeadInitialData?.po_cr_days < 0){
//      toast.error(`PO Credit Days cannot be negative`);
//      return;
//   }
//     if(!paymentTermHeadInitialData?.eff_code){
//       toast.error("Effect Code cannot be left blank");
//      return;
//   }

// }

// export const handleValidateField = (
//   e,
//   formStatus,
//   formData,
//   paymentTermDetailData = [], // Default to empty array
//   index = null
// ) => {
//   if (!["Insert", "Update"].includes(formStatus)) return;

//   const { name, value } = e.target;

//   //  Validate main formData field term_desc
//   if (name === "term_desc" && index === null) {
//     if (!formData?.term_desc?.trim()) {
//       toast.error("Payment Term Description cannot be left blank");
//       document.getElementById("term_desc")?.focus();
//     }
//     return;
//   }

//   //  Validate detail table row's term_desc
//   if (name === "per_pamnt" && index !== null) {
//     const row = paymentTermDetailData?.[index] || {};
//     if (!row?.per_pamnt?.trim()) {
//       toast.error("Payment Percentage cannot be left blank");
//       document.getElementById(`per_pamnt_${index}`)?.focus();
//     }
//     return;
//   }
//   //  Validate detail table row's term_desc
//   if (name === "term_desc" && index !== null) {
//     const row = paymentTermDetailData?.[index] || {};
//     if (!row?.term_desc?.trim()) {
//       toast.error("Term Description cannot be left blank");
//       document.getElementById(`term_desc_${index}`)?.focus();
//     }
//     return;
//   }

//   //  Validate po_cr_days
//   if (name === "po_cr_days" && index !== null) {
//     const row = paymentTermDetailData?.[index] || {};
//     if (!row?.po_cr_days?.toString()?.trim()) {
//       toast.error("PO Credit Days cannot be left blank");
//       document.getElementById(`po_cr_days_${index}`)?.focus();
//     }
//     return;
//   }

//   //  Validate eff_code
//   if (name === "eff_code" && index !== null) {
//     const row = paymentTermDetailData?.[index] || {};
//     if (!row?.eff_code?.toString()?.trim()) {
//       toast.error("Effect Code cannot be left blank");
//       document.getElementById(`eff_code_${index}`)?.focus();
//     }
//     return;
//   }
// };


// export const validateCrDays = (e, data, index = 0)=>{
//     const {value} = e.target;
//     if(!value){
//         toast.error(`PO Credit Days cannot be left blank`);
//         return;
//     }
//     if(value < 0){
//         toast.error(`PO Credit Days cannot be negative`);
//     }
// }

// export const validateEffCode = (e, data, index = 0)=>{
//     const {value} = e.target;
//     if(!value){
//         toast.error(`Effect Code cannot be left blank`);
//         return;
//     }
// }
// export const validateTermDesc = async(e, data, index = 0, headData)=>{
//     const {name, value } = e.target;
//     if (!value) {
//         toast.error(`Term Description cannot be left blank`);
//         return;
//     }
// }
