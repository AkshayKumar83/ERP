import { APP_PROD_API } from "../../../../utils/api";

export const itemWiseAccEntryHeader = [
    { label: "Item Code", key: "", width: "15%" },
    { label: "Item Description", key: "", width: "40%" },
    { label: "UOM", key: "", width: "" },
    { label: "Purchase Account", key: "", width: "",isHelpExist: true },
    { label: "Sales Account", key: "", width: "" ,isHelpExist: true},
];

export const itemWiseAccEntryInitData = {
    it_code: "",
    it_name: "",
    it_type: "",
    it_base: "",
    it_sub_c: "",
    fc_code: "",
    it_pu_um: "",
    purac_head: "",
    salac_head: "",
    active: "",
};

export const PurchaseAccHeadHelpListHeader = [
    { label: "Account No", key: "acc_no" },
    { label: "Account Desc.", key: "acc_desc" },
];

export const SalesAccHeadHelpListHeader = [
    { label: "Account No", key: "acc_no" },
     { label: "Account Desc.", key: "acc_desc" },
];

export const PurchaseAccHelpListHeader = [
    { label: "Account No", key: "acc_no" },
     { label: "Account Desc.", key: "acc_desc" },
];

export const SalesAccHelpListHeader = [
    { label: "Account No", key: "acc_no" },
     { label: "Account Desc.", key: "acc_desc" },
];


export const validatePurchaseAccHeadAPI = async (purac_head) => {
  try {
    const params = new URLSearchParams({ purac_head });
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_PURAC_HEAD}?${params}`, {
      credentials: 'include'
    });

    const data = await response.json();
    return data;   // { valid: true/false, message: "..." }

  } catch (error) {
    console.error('API error:', error);
    return { valid: false, message: 'Server error during account validation.' };
  }
};

export const validateSalesAccHeadAPI = async (saleac_head) => {
  try {
  const params = new URLSearchParams({ saleac_head });

  const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_WISE_ACC_ENTRY_SALEAC_HEAD}?${params}`,
    { credentials: 'include' }
  );

  const data = await response.json();
  return data;
} catch (error) {
    console.error('API error:', error);
    return { valid: false, message: 'Server error during account validation.' };
  }
}












