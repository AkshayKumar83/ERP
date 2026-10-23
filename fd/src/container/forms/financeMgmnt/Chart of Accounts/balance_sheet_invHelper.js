export const formDataHeader = [
  {
    label: "Opening Inv.",
    required: true,
    width: "5%",
    isHelpExist: true
  },
  {
    label: "Account & Description",
    required: false,
    width: "28%",
  },

  {
    label: "Closing Inv.",
    required: true,
    width: "8%",
    isHelpExist: true
  },
  {
    label: "Account & Description",
    required: false,
    width: "28%",
  },

  {
    label: "Inv. Assets.",
    required: true,
    width: "8%",
    isHelpExist: true
  },
  {
    label: "Account & Description",
    required: false,
    width: "28%",
  },
];

export const formDetailInitData = {
  op_inv_acc: "",
  op_acc_desc: "",
  cl_inv_acc: "",
  cl_acc_desc: "",
  inv_assets_acc: "",
  inv_acc_desc: "",
  id: 1,
  init_cl_inv_acc: "",
};

// open acc no helplist header

export const opAccHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Account Description", key: "acc_desc" },
];

// close acc no helplist header

export const clAccHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Account Description", key: "acc_desc" },
];

// inv acc no helplist header

export const invAccHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Account Description", key: "acc_desc" },
];
