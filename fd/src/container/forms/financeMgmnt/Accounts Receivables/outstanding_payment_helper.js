import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const outstandingIniytData = {
  debt_cred: "",
  trans_year: "",
  trans_type: "",
  acc_no: "",
  party_desc: "",
  voucher_no: "",
  voucher_dt: "",
  instr_no: "",
  instr_dt: "",
  remarks: "",
  outs_id: "",
  origin: "",
  posted: "",
  row_status: "",
  division_id: "",
};
      

export const outstandingDetailHeader = [
  { label: "Acc No.", width: "10%",isHelpExist: true ,required:true },
  { label: "Document No.", width: "15%" ,required:true},
  { label: "Doc Date.", width: "8%",required:true },
  { label: "initial Amount", width: "10%",required:true },
  { label: "D/C", width: "5%",required:true },
  { label: "Due Date", width: "8%",required:true },
  { label: "Reason", width: "40%" },
];

export const detailInitData = {  // TDFMOUTS
   id:1,
  doc_type: "BL",
  inv_type: "P",
  due_type: "N",
  party_acc: "",
  doc_no: "",
  doc_dt: "",
  amount: "",
  db_cr: "D",
  due_date: "",
  explanation: "",
  status: "",
  outs_id: "",
  doc_id: "",
  acc_no: "",
  emp_cd: "",
  row_status: "",
  party_acc_desc: "",
};


export const partyCodeHelpListHeader = [
  {label: "Account Description", key: "acc_desc"},
  {label: "Accont No.", key: "acc_no"},
  {label: "City", key: "city"},

]
export const AccNoHelpListHeader = [
  {label: "Account Description", key: "acc_desc"},
  {label: " Acc. No.", key: "acc_no",},
]


export const handleValidateField = async (e, formStatus) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  const { name, value } = e.target;

  // --- Required Fields ---
  const requiredFields = {
    trans_year: " Please enter the Year of Outstanding Bill... ",
     acc_no: "Please Enter Party''s Account Code. ",
    // voucher_no:"Please enter voucher no.",
    voucher_dt: "Voucher Date field is not blank.",
  };

  if (requiredFields[name] && !value) {
    toast.error(requiredFields[name]);
    document.getElementById(name)?.focus();
    return;
  }

   // Custom validation for voucher date
  if (name === "voucher_dt" && value) {
    const trans_year = document.getElementById("trans_year")?.value; 
    const isValid = await checkVoucherDate(trans_year, value);
    if (!isValid) {
      document.getElementById(name)?.focus();
    }
  }
};

export const checkVoucherDate = async (trans_year, voucher_dt) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CHECK_VALIDATE_DATE}?validate=voucherDate&trans_year=${trans_year}&voucher_dt=${voucher_dt}`);

  const data = await res.json();
  if (!data.success) {
    toast.error(data.message);
    return false;
  }
  return true;
};


export const handleValidateDetailsField = async (e, formStatus, rowIndex, setDetailData) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  const { name, value } = e.target;

  const requiredFields = {
    party_acc: "Account No. can not be left blank",
    doc_no: "Document Number is not blank.",
    doc_dt: "Document Date field is not blank.",
    amount: "Amount can not be null",
    due_date: "Due Date is not blank.",
    db_cr: "You Must select from (D)ebit or (C)redit.",
  };

  // --- Required field check ---
  if (requiredFields[name] && !value) {
    toast.error(requiredFields[name]);
    document.getElementById(`${name}_${rowIndex}`)?.focus();
    return;
  }

  // --- Document Date check ---
  if (name === "doc_dt" && value) {
    const trans_year = document.getElementById("trans_year")?.value;
    const dueDate = await checkDocDate(trans_year, value);

    if (dueDate) {
      // agar API se due date aayi to state update karo
      setDetailData((prev) => {
        const updated = [...prev];
        updated[rowIndex].due_date = dueDate.split("T")[0];
        return updated;
      });
    } else {
      document.getElementById(`${name}_${rowIndex}`)?.focus();
      return;
    }
  }

  // --- Due Date check ---
  if (name === "due_date" && value) {
    const docDate = document.getElementById(`doc_dt_${rowIndex}`)?.value;

    if (!value) {
      toast.error("Due Date is blank.");
      document.getElementById(`${name}_${rowIndex}`)?.focus();
      return;
    }

    if (docDate && new Date(value) < new Date(docDate)) {
      toast.error("Due Date must be higher than Document Date.");
      document.getElementById(`${name}_${rowIndex}`)?.focus();
      return;
    }
  }

  // --- DB_CR check (Oracle Forms logic) ---
  if (name === "db_cr") {
    if (!(value === "D" || value === "C")) {
      toast.error("You Must select from (D)ebit or (C)redit.");

      // default D set karna hai agar invalid hai
      setDetailData((prev) => {
        const updated = [...prev];
        updated[rowIndex].db_cr = "D";
        return updated;
      });

      document.getElementById(`${name}_${rowIndex}`)?.focus();
      return;
    }
  }
};


export const checkDocDate = async (trans_year, doc_dt) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CHECK_VALIDATE_DATE}?validate=docDate&trans_year=${trans_year}&doc_dt=${doc_dt}`
  );

  const data = await res.json();
  if (!data.success) {
    toast.error(data.message);
    return null;
  }

  return data.due_date; // if valid, return due_date 
};

// Row level validation
 export const validateRow = (row, rowIndex) => {
  if (!row) return true; 

  const requiredFields = {
    party_acc: "Account No. can not be left blank",
    doc_no: "Document Number is not blank.",
    doc_dt: "Document Date field is not blank.",
    amount: "Amount can not be null",
    due_date: "Due Date is not blank.",
    db_cr: "You Must select from (D)ebit or (C)redit.",
  };

  for (let field in requiredFields) {
    if (!row[field]) {
      toast.error(requiredFields[field]);
      document.getElementById(`${field}_${rowIndex}`)?.focus();
      return false;
    }
  }

  // special case db_cr
  if (!(row.db_cr === "D" || row.db_cr === "C")) {
    toast.error("You Must select from (D)ebit or (C)redit.");
    document.getElementById(`db_cr_${rowIndex}`)?.focus();
    return false;
  }

  // due_date < doc_dt check
  if (row.doc_dt && row.due_date && new Date(row.due_date) < new Date(row.doc_dt)) {
    toast.error("Due Date must be higher than Document Date.");
    document.getElementById(`due_date_${rowIndex}`)?.focus();
    return false;
  }

  return true;
};


export const createSearchPayloadForOutstandingPaymentSearch = (masterData) => {
  let payload = {};

  let masterKeys = {
    acc_no:'acc_no',
    voucher_no: "voucher_no", 
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
