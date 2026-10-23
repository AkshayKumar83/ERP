import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const CodeDefinitionTypeHeader = [
  
       
        {
            label: "Description",
            width: "80%",
            required: true,
        },
        {
            label: "Prefix",
             width: "20%",
            //required: true,
        },
    
    
]  


export const catTypeInitialFormDataTemplate = {
    cat_group:'',
    code:'',
    description:'',
    prefix:'',
    };

export const checkDuplicateFromDB = async (description, selectedCategory,formStatus) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

   if (!description?.trim()) return false;

   const resp = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CHECK_DUPLICATE_DESC}?desc=${description}&cat=${selectedCategory}`,
      { credentials: "include" }
   );

   const result = await resp.json();

   if (result.isDuplicate) {
      toast.error("This Description already exists for the selected category.");
      return true;
   }

   return false;
};