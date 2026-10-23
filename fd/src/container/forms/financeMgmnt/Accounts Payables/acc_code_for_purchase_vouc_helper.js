
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";


export const tempBlockInitData = {
type:"",
type_desc:"",
}

export const accCodePurVcurHeader = [
    { label: "Acc No", key: "acc_no", required:true, width: "8%" ,isHelpExist: true},
    { label: "Cess Acc No", key: "sub_acc_no", width: "6%" ,isHelpExist: true},
    { label: "Hsc Acc No", key: "hsc_acc_no", width: "6%" ,isHelpExist: true},
    { label: "V Code", key: "v_code", width: "6%",isHelpExist: true },
    { label: "Item Code ", key: "it_code", width: "6%",isHelpExist: true },
    { label: "PO Cat", key: "po_cat_prefix", width: "13%" },
    { label: "Type ", key: "it_type_desc", width: "13%" ,isHelpExist: true},
    { label: "Base", key: "it_base_desc", width: "13%",isHelpExist: true },
    { label: "Sub Cat", key: "it_sub_c_desc", width: "13%",isHelpExist: true },
    { label: "Local", key: " ", width: "3%" },
    { label: "Central", key: " ", width: "3%" },
    { label: "Both", key: " ", width: "3%" },
  ];

export const accCodePurVcurBlockInitData = {   // block name MOFMFINACC
// id:1,
type:"",
acc_no:"",
acc_desc:"",
sub_acc_no:"",
sub_acc_desc:"",
hsc_acc_no:"",
hsc_acc_desc:"",
v_code:"",
v_name:"",
it_code:"",
it_desc:"",
po_cat_prefix:"",
it_type:"",
it_type_desc:"",
it_base:"",
it_base_desc:"",
it_sub_c:"",
it_sub_c_desc:"",
st_type:"",
}

// only for searching
export const typeHelpListHeader = [
  {label: "type", key: "type"},
  {label: "Desc.", key: "type_desc"},
]
export const DescHelpListHeader = [
  {label: "type", key: "type"},
  {label: "Desc.", key: "type_desc"},
]
 /////////

export const AccHelpListHeader = [
  {label: "Account Description", key: "acc_desc"},
  {label: "Accont No.", key: "acc_no"},
]
export const CessHelpListHeader = [
  {label: "Cess Description", key: "acc_desc"},
  {label: "Cess Acc. No.", key: "acc_no"},
]
export const HscHelpListHeader = [
  {label: "HSC Description", key: "acc_desc"},
  {label: "HSC Acc. No.", key: "acc_no"},
]
export const ItemHelpListHeader = [
  {label: "Item Desc", key: "it_name"},
  {label: "Item Code", key: "it_code"},
]
export const vendorHelpListHeader = [
  {label: "Vendor Name", key: "v_name"},
  {label: "Vendor Code", key: "v_code"},
]
export const ItTypeHelpListHeader = [
  {label: "Cat Description", key: "cat_desc"},
  {label: "Type (Level 1)", key: "level1"},
]
export const ItBaseHelpListHeader = [
{label: "Cat Description", key: "cat_desc"},
  {label: "Base (Level 2)", key: "level2"},
]
export const ItSubHelpListHeader = [
{label: "Cat Description", key: "cat_desc"},
  {label: "SubC (Level 3)", key: "level3"},

]

export const createSearchPayloadForAccCodePurcVucrSearch = (masterData) => {
  let payload = {};

  let masterKeys = {
    type: "type",
    type_desc: "type_desc",
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


export const checkDuplicate = async (params) => {
  try {
    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ACC_CODE_PURC_VOCH_CHECK_DUPLICATE}?${queryString}`,
      {
        credentials: "include",
      }
    );

    const data = await response.json();
    return data; // { success: true/false, message: "..." }
  } catch (err) {
    console.error("Duplicate check error:", err);
    return { success: false, message: "Server error" };
  }
};


export const handleValidateField = (e, formStatus) => {
  if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }

  const { name, value } = e.target;

  if (name === "acc_no") {
    if (!value) {
      toast.error("Account No. can't be blank, Please select Account on double click");
      e.target.focus(); //  same input ko focus karega
    }
    return;
  }
};


