import toast from "react-hot-toast";

export const itemMinMaxInitData = {
    it_code :"",
    it_name:"",
    it_type:"",
    it_base:"",
    it_sub_c:"",
    fc_code:"",
    it_pu_um:"",
    purac_head:"",
    salac_head:"",
    active:"",
    max_stock:"",
    max_stock_days:"",
    min_stock:"",
    min_stock_days:"",
    optimumstk:'',
    optimumstk_days:'',
}

export const controlInitData = {
    rg_sort:"I",
    level1:"",
    level2:"",
    level3:"",

}

export const itemMinMaxHeader = [
    {label:"Item Code",width:"25%"},
    {label:"Item Desc.",width:"40%"},
    {label:"UOM",width:"8%"},
    {label:"Max Stk In Nos",width:"8%"},
    {label:"In Days",width:"8%"},
    {label:"Min Stk In Nos",width:"8%"},
    {label:"In Days",width:"8%"},
    {label:"Optimun stk In Nos",width:"8%"},
    {label:"In Days",width:"8%"},
  
]


 

export const handleValidateStockField = (e, formData, formStatus, rowIndex) => {
  if (!["Update"].includes(formStatus)) return;

   

  const { name, value } = e.target;
  const row = formData[rowIndex];

  if (value === '' || value == null) return; // empty field 

  // Min vs Max Stock
  if (name === "min_stock" && row.max_stock != null && value > row.max_stock) {
    toast.error("Minimum Stock cannot be greater than Maximum Stock");
    document.getElementById(`min_stock_${rowIndex}`)?.focus();
  }

  // Similarly baki onBlur validations
  if (name === "min_stock_days" && row.max_stock_days != null && value > row.max_stock_days) {
    toast.error("Minimum Stock Days cannot be greater than Maximum Stock Days");
    document.getElementById(`min_stock_days_${rowIndex}`)?.focus();
  }

  if (name === "optimumstk" && row.max_stock != null && value > row.max_stock) {
    toast.error("Optimum Stock cannot be greater than Maximum Stock");
    document.getElementById(`optimumstk_${rowIndex}`)?.focus();
  }

  if (name === "optimumstk_days" && row.max_stock_days != null && value > row.max_stock_days) {
    toast.error("Optimum Stock Days cannot be greater than Maximum Stock Days");
    document.getElementById(`optimumstk_days_${rowIndex}`)?.focus();
  }
};
