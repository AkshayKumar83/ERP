import toast from "react-hot-toast"
import { APP_PROD_API } from "../../../../utils/api"

export const purCtgDefInitData = {
    division_id:"",
    trans_code:"",
    po_cat_prefix:"",
    po_cat_prefix_desc:"",
    frt_acc_no:"",
    acc_desc:"",
}

export const purCtgDfntHeader = [
    {label:"Trans Code",key:"trans_code", width:"10%"},
    {label:"PO Category",key:"po_cat_prefix",required:true, width:"10%",isHelpExist: true},
    {label:"Description",key:"po_cat_prefix_desc", width:"35%"},
    {label:"Freight Acc. Code",key:"frt_acc_no", width:"10%",isHelpExist: true},
    {label:"Freight Acc. Des.",key:"acc_desc", width:"35%"}

]

export const POCatHelpListHeader = [
  {label: "PO Category", key: "po_cat_prefix"},
  {label: "Description", key: "po_cat_description"},
]
export const frtAccNoHelpListHeader = [
  {label: "Description", key: "acc_desc"},
  {label: "Freight Acc. No.", key: "acc_no"},
]

  export const checkDuplicatePOPrefix = async (poCatPrefix) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PURCH_CTGY_DFNT_CHECK_DUPLICATE}?po_cat_prefix=${poCatPrefix}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error while checking duplicate!");
        return false;
      }

      // agar duplicate hai to backend se success=false ya message aayega
      if (data.exists) {
        toast.error(`Prefix "${poCatPrefix}" already exists!`);
        return true; // duplicate mila
      } else {
        return false; // safe hai
      }

    } catch (error) {
      console.error("Duplicate check error:", error);
      toast.error("Something went wrong while checking duplicate!");
      return false;
    }
  };

  export const handleValidateField = (e, formStatus) => {
  if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }

  const { name, value } = e.target;

  if (name === "po_cat_prefix") {
    if (!value) {
      toast.error("po_cat_prefix can't be blank, Please select on double click");
      e.target.focus(); // 👈 same input ko focus karega
    }
    return;
  }
};