import { APP_PROD_API } from "../../../../utils/api"
import toast from "react-hot-toast";


export const headerInitData = {
pay_rec:"0",
type_reversal:"C",
acc_no:"",
acc_desc:"",
old_voucher_id:"",
old_voucher_no:"",
chq_no:"",
chq_dt:"",
reverse_date:"",
voucher_id:"",
voucher_no:"",
division_id:"",
trans_year:"",
chq_amt:"",
party_code:"",
party_desc:"",

}

export const controlData = {
  di_formstatus: "",
  userid: "",
  curryear: "",
};

export const accHelpListHeader = [
  { label: "Acc No", key: "acc_no" },
  { label: "Acc Desc", key: "acc_desc" },
];

export const chqNoHelpListHeader = [
  { label: "Cheque No", key: "chq_no" },
  { label: "Cheque date", key: "chq_dt" },
];

export const oldVchrNoHelpListHeader = [
   {label: "Old Voucher No", key: "voucher_no"},
   {label: "Vchr Amount", key: "amount"},
   {label: "Voucher No", key:"voucher_no"},
   {label: "Voucher ID", key: "voucher_id"},

]

// import { validateParty } from "./payment_reverse_helper";

export const handleValidateField = (e, formStatus, formData, setFormData) => {
  if (!['Insert', 'Update'].includes(formStatus)) {
    return;
  }

  const { name, value } = e.target;

  if (name === "acc_no") {
    if (!value) {
      toast.error("Acc No. can't be blank, Please select on double click");
      e.target.focus();
    }
    return;
  }

  if (name === "chq_no") {
    if (!value) {
      toast.error("Chq. No. can't be blank, Please select on double click");
      e.target.focus();
    }
    return;
  }
  if (name === "reverse_date") {
    if (!value) {
      toast.error("reverse date can't be blank");
      e.target.focus();
    }
    return;
  }

  if (name === "old_voucher_no") {
    // if (!value) {
    //   toast.error("Old voucher no can't be blank, Please select on double click");
    //   e.target.focus();
    //   return;
    // }

    // only when value present, call validation
    validateParty(e, formData, formStatus, setFormData);
    return;
  }
};


 async function validateParty(e, formData, formStatus, cb) {
  if (['Insert', 'Update'].includes(formStatus)) {
    const { old_voucher_id, chq_no, old_voucher_no } = formData;

    if (!old_voucher_no) {
      toast.error("Voucher no can not be left, Please Select from Help List");
      e.target.focus(); // focus only when empty
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PYMNT_RVRS_VALIDATE_DATA}?old_voucher_id=${old_voucher_id}&chq_no=${chq_no}`,
        { credentials: 'include' }
      );

      const data = await response.json();
     

      if (response.ok) {
        cb({ ...formData, ...data });
      } else {
        // backend ne 404 diya
        toast.error(data?.message || 'Validation failed');
        cb({ ...formData, party_code: '', party_desc: '' });
        return;
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      cb({ ...formData, party_code: '', party_desc: '' });
      console.error(error);
    }
  }
}

export const createSearchPayloadForPRSpecificSearch = (masterData) =>{
   let payload = {};

  let masterKeys = {
    acc_no: "acc_no",
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


