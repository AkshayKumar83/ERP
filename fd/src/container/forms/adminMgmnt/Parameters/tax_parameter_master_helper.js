import toast from "react-hot-toast";

export const taxParameterMasterData = {
tax_code:"",
tax_desc:"",
acc_no:"",
acc_desc:"",
sale_acc_head:"",
sale_acc_head_desc:"",
sal_or_pur:"S",
st_type:"L",
st_prc_val:"P",
st_form:"",
tax_perc:"",
surch_per:"",
refundable:"N",
separate_in_vch:"N",
active:"Y"

}

export const accHelpListHeader = [
    {label: "Acc No", key: "acc_no"},
     {label: "Acc Desc", key: "acc_desc"}
 ]
 export const saleAccDescHelpListHeader = [
    {label: "Sale Acc Head", key: "acc_no"},
    {label: "Sale Acc Desc",key: "acc_desc"},
    
 ]
 export const taxCodeHelpListHeader = [
    {label: "Tax Code", key: "tax_code"},
     {label: "Tax Desc",key: "tax_desc"},
    
 ]

 export const createSearchPayloadForTPSpecificSearch = (masterData) =>{
   let payload = {};

  let masterKeys = {
    tax_code: "tax_code",
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

export const handleValidateField = (e,formStatus) => {
  
   if (!['Insert', 'Update'].includes(formStatus)) return;

    const {name, value} = e.target;
    if(name === "tax_code"){
        if (!value) {
            toast.error("Tax Code cannot be blank");
            document.getElementById("tax_code").focus();
        }
        return;
}
    if(name === "tax_desc"){
        if (!value) {
            toast.error("Tax Description cannot be blank");
            document.getElementById("tax_desc").focus();
        }
        return;
}
    if(name === "acc_no"){
        if (!value) {
            toast.error("Tax Acc Code cannot be blank");
            document.getElementById("acc_no").focus();
        }
        return;
}
    if(name === "sale_acc_head"){
        if (!value) {
            toast.error("Sale Account Head cannot be blank");
            document.getElementById("sale_acc_head").focus();
        }
        return;
}
    if(name === "st_form"){
        if (!value) {
            toast.error("Form Name cannot be blank");
            document.getElementById("st_form").focus();
        }
        return;
}
}