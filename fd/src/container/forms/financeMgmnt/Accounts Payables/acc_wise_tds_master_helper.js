import toast from "react-hot-toast";


export const headers = [
    // { label: "Action", required: false,  },
    { label: " Exp. Acc. No.", required: true,  isHelpExist: true, width:"3%" },
    { label: "Effective Date", required: true, width:"0%" },
    { label: "TDS%", width:'10%' },
    { label: "Surc%", required: false, width:"8%"},
    { label: "Cess%", required: false, width:"8%" },
    { label: "Hsc%", required: false, width:"8%"},
    { label: "TDS Acc.",  required: true,  isHelpExist: true, width:"5%" },
    { label: "TDS Surch Acc.",  isHelpExist: true, width:"5%" },
    { label: "TDS Cess Acc.",   isHelpExist: true , width:"5%"},
    { label: "TDS Hsc Acc.",   isHelpExist: true , width:"8%"},
    { label: "Type", required: false,  width:"5%"},
    { label: "Vendor Code", required: true,  isHelpExist: true, width:"5%" },
    { label: "TDS Limit", required: false, width:"15%" },
    // { label: "Deduction TDS From", required: false, },
    { label: "TDS Penal %", required: false, width:"5%" },
    { label: "TDS Non Pan %", required: false, width:"5" },
    { label: "Nature of Trans. ", required: true, width:"5" },
  ];

 
  export const accWiseTdsDetailData = {
    id: 1,
    category_flag:"V",
    acc_no:"",
    eff_date:"",
    tds_perc:"",
    tds_surc_perc:"",
    tds_cess_perc:"",
    tds_hsc_perc:"",
    tds_acc_no:"",
    tds_sur_acc_no:"",
    tds_cess_acc_no:"",
    tds_hsc_acc_no:"",
    acc_desc:"",
    pan_no:"",
    tds_acc_desc:"",
    tds_sur_acc_desc:"",
    certificate_prefix:"",
    v_code:"",
    v_name:"",
    tds_limit:"",
    tds_cess_acc_desc:"",
    tds_hsc_acc_desc:"",
    start_tds_deduction_dt:"",
    tds_penal_perc:"",
    tds_non_pan_perc:"",
    goods_service:"G",
    init_acc_no: "",
    init_v_code: ""
  }  


  // vendor code help list header 
  
  export const accHelpListHeader = [
    {label: "Account No", key: "acc_no"},
    {label: "Description", key: "acc_desc"}
  ]  
  
  // invoice code help list header 
  
  export const tdsAccHelpListHeader = [
    {label: "Account No", key: "acc_no"},
    {label: "Description", key: "acc_desc"}
  ]    
  
   // vendor code help list header 
  
  export const tdsSurHelpListHeader = [
    {label: "Account No", key: "acc_no"},
    {label: "Description", key: "acc_desc"}
  ]  
  
  // invoice code help list header 
  
  export const tdsCessHelpListHeader = [
    {label: "Account No", key: "acc_no"},
    {label: "Description", key: "acc_desc"}
  ]    
  
   // vendor code help list header 
  
  export const tdsHscHelpListHeader = [
    {label: "Account No", key: "acc_no"},
    {label: "Description", key: "acc_desc"}
  ]  
  
  // invoice code help list header 
  
  export const vendorHelpListHeader = [
    {label: "Vendor Code", key: "acc_no"},
    {label: "Description", key: "acc_desc"}
  ]    
  
   export const createSearchPayloadForBVSpecificSearch = (masterData) => {
    let payload = {};
  
    //console.log('masterdata', masterData);
  
    let masterKeys = { 
  
      acc_no: "acc_no",
      eff_date: "eff_date",
      goods_service: "goods_service",
      category_flag: "category_flag",
      v_code: "v_code",
     
    };
  
    let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
    //console.log('hasMasterKeys', hasMasterKeys);
  
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

export const handleValidateTdsPercAndTdsAcc = async (e, formStatus, formData, rowIndex) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  const { name, value } = e.target;
  const fieldId = `${name}-${rowIndex}`;

  // Check TDS Percentage & TDS Account Number logic
  if (name === "tds_acc_no" || name === "tds_perc") {
    const tdsPerc = Number(formData.tds_perc || 0); // current row ka tds_perc
    const tdsAccNo = formData.tds_acc_no?.trim();

    if (tdsPerc > 0 && !tdsAccNo) {
      toast.error("TDS Account Number is required when TDS Percentage is greater than 0");
      document.getElementById(`tds_acc_no-${rowIndex}`)?.focus();
      return false;
    }
  }

  return true;
};

  
  