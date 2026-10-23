// MainTab Start here
export const mainTabInitData = { // Data Block or db Table used -- THFMPAYRCV --
  pay_rec: "",
  acc_no: "",
  acc_desc: "",
  debt_cred: "",
  trans_code: "",
  inv_acc_no: "",
  inv_acc_desc: "",
  dc_acc_desc: "",
  dc_acc_desc: "",
  voucher_no: "",
  voucher_dt: "",
  instr_no: "",
  instr_dt: "",
  bank_code: "",
  bank_name: "",
  remarks: "",
  chq_amt: "",
  outs_id: "",
  journal_id: "",
  voucher_id: "",
  origin: "",
  posted: "",
  row_status: "",
  trans_year: "",
  division_id: "",
  trans_type: "",
  jrnl_vch_no: "",
  jrnl_vch_dt: "",
};

// InvoiceTab Start here
export const invoiceHeaders = [
  { label: "Invoice No.", required: true, width: "10%" },
  { label: "Invoice DT", required: true, width: "10%" },
  { label: "Due Date", required: true, width: "10%" },
  { label: "D/C", required: true, width: "5%" },
  { label: "Invoice Amount", required: true, width: "10%" },
  { label: "Already Adj. Amt", required: true, width: "10%" },
  { label: "Received Amt", required: true, width: "10%" },
  { label: "Full Amt", required: true, width: "5%" },
  { label: "Inc. in Serv Tax", required: true, width: "5%" },
];

export const invoiceTabInitData = { // Data Block or db Table used -- TDFMINV --
  doc_no: "",
  doc_dt: "",
  due_date: "",
  dr_cr: "",
  db_cr: "",
  amt: "",
  bal_amt: "",
  amount: "",
  old_amount: "",
  explanation: "",
  inv_selection: "N",
  include_in_servtax: "",
  acc_no: "",
  emp_cd: "",
  doc_type: "",
  outs_id: "",
  doc_id: "",
  row_status: "",
};

//  Debit/CreditTab start here
export const debitCreditNoteHeaders = [
  { label: "Debit/Credit Note No.", required: true, width: "5%" },
  { label: "Db/Cr Note DT", required: true, width: "3%" },
  { label: "D/C", required: true, width: "5%" },
  { label: "Amount", required: true, width: "10%" },
  { label: "Reason", required: true, width: "55%" },
];

export const debitCreditInitData = { // Data Block or db Table used -- TDFMDRCR --
  doc_no: "",
  doc_dt: "",
  due_date: "",
  db_cr: "",
  amt: "",
  amount: "",
  explanation: "",
  acc_no: "",
  emp_cd: "",
  doc_type: "",
  outs_id: "",
  doc_id: "",
  row_status: "",
};

// MisTab Start Here
export const miscHeaders = [
  { label: "Account Code", required: true, width: "10%" },
  { label: "Account Des.", required: true, width: "5%" },
  { label: "Employee name", required: true, width: "10%" },
  { label: "Document No.", required: true, width: "10%" },
  { label: "Doc. Date", required: true, width: "8%" },
  { label: "D/C", required: true, width: "5%" },
  { label: "Amount", required: true, width: "10%" },
  { label: "Explanation", required: true, width: "55%" },
];
export const miscInitData = {// Data Block or db Table used -- TDFMMISC --
  acc_no: "",
  oth_acc: "",
  acc_desc: "",
  emp_name: "",
  doc_no: "",
  doc_dt: "",
  dr_cr: "",
  db_cr: "",
  amount: "",
  amt: "",
  explanation: "",
  due_date: "",
  outs_id: "",
  emp_cd: "",
  doc_id: "",
  row_status: "",
  doc_type: "",
};

// UploadTAb Start Here
export const uploadHeaders = [
  { label: "Sr. No.", required: true, width: "5%" },
  { label: "Customer Code", required: true, width: "10%" },
  { label: "Customer name", required: true, width: "15%" },
  { label: "Inv No.", required: true, width: "10%" },
  { label: "Inv Date", required: true, width: "3%" },
  { label: "Amount", required: true, width: "10%" },
];

export const uploadInitData ={
  voucher_no:"",
  bank_name:"",
  file_name:"",
  rec_id:"",
  c_code:"",
  c_name:"",
  inv_no:"",
  inv_dt:"",
  amount:"",
}
