export const blockPymtOptnHeader = [
  { label: "Acc No", key: "acc_no", width: "15%", required: true, isHelpExist: true },
  { label: "Acc Desc", key: "acc_desc", required: true,  width: "55%" },
  { label: "Doc No", key: "doc_no", width: "15%", required: true, isHelpExist: true },
  { label: "Doc Date", key: "doc_dt", required: true, width: "10%" },
  { label: "Blocked", key: " ", width: "5%" },
];

export const blockPymtInitData = {
  id: 1,
  acc_no: "",
  acc_desc: "",
  doc_no: "",
  doc_dt: "",
  block_flag: "Y",
  init_acc_no: "",
};

// Acc code help list header

export const accHelpListHeader = [
  { label: "Account No", key: "v_code" },
  { label: "Description", key: "v_name" },
];

// Doc no help list header

export const docHelpListHeader = [
  { label: "Doc No", key: "doc_no" },
  { label: "Doc Date", key: "doc_date" },
  { label: "Amount", key: "amount" },
];
