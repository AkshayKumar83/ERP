import toast from "react-hot-toast";

export const efaDetalHeader = [
    { width: "25%", label: "Purpose", required: false },
    { width: "10%", label: "Acc No", required: false},
    { width: "5%", label: "Eligibility Years", required: false },
    { width: "10%", label: "Eligibility Doc 1", required: false },
    { width: "10%", label: "Eligibility Doc 2", required: false },
    { width: "10%", label: "Eligibility Doc 3", required: false },
    { width: "10%", label: "Eligibility Doc 4", required: false },
    { width: "10%", label: "Eligibility Doc 5", required: false },
    { width: "10%", label: "Eligibility Doc 6", required: false },
  ];

  export const efaDetailFormDataInitTempate = {
    row_id:'', // frontend only field
    loan_id:'',
    acc_no:'',
    loan_purpose_desc:'',
    loan_eligibility_yrs:'',
    loan_eligibility_doc1:'',
    loan_eligibility_doc2:'',
    loan_eligibility_doc3:'',
    loan_eligibility_doc4:'',
    loan_eligibility_doc5:'',
    loan_eligibility_doc6:'',
  };
  

  
export const accNoHelpListHeader= [
  { label: "Account No", key: "acc_no" },
  { label: "Description", key: "acc_desc" },
]

export const validate =(efaDetailData)=>{
  const requiredField = ['acc_no', 'loan_purpose_desc']
}

export const checkDuplicateEntry = (e, value, currentIndex, formData)=>{
  // const handleLoanPurposeBlur = (value, currentIndex) => {
    const normalizedValue = value?.toLowerCase()?.trim();
    const isDuplicate = formData.some((row, index) =>
      index !== currentIndex &&
      row.loan_purpose_desc?.toLowerCase()?.trim() === normalizedValue
    );
  
    if (isDuplicate) {
      toast.error(`Duplicate loan purpose description "${value}" is not allowed.`);
      e.target?.focus();
      // Optionally clear the field:
      // handleChange({ target: { name: "loan_purpose_desc" } }, "loan_purpose_desc", "", currentIndex);
    }
  // };
  
}