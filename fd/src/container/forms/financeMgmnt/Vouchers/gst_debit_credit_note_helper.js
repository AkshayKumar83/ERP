export const headers = [
  { label: "Item Code", required: true, width: "12%", isHelpExist: true },
  { label: "Account Code", required: true, width: "10%", isHelpExist: true },
  { label: "Description", required: true, width: "30%" },
  { label: "HSN/SAC Code", required: true, width: "12%" },
  { label: "Qty", required: true, width: "5%" },
  { label: "Rate", required: true, width: "12%" },
  { label: "Amount", required: true, width: "12%" },
];

export const debitCreditInitialFormDataTemplate = {
  division_id: "",
  trans_year: "",
  trans_id: "",
  trans_no: "",
  trans_date: "",
  vend_cust_flag: "C",
  trans_type: "C",
  party_code: "",
  party_code1: "",
  party_name: "",
  party_city: "",
  order_id: "",
  order_no: "",
  order_dt: "",
  prof_inv_id: "",
  prof_inv_no: "",
  prof_inv_dt: "",
  inv_id: "",
  inv_no: "",
  inv_dt: "",
  reason_id: "",
  remark: "",
  doc_thru: "",
  cancel_flag: "N",
  cancel_dt: "",
  cancel_by: "",
  auth_flag: "N",
  auth_by: "",
  auth_dt: "",
  voucher_id: "",
  subject_2_reverse: "N",
  disp_status: "",
  amount: "",
  sgst_amt: "",
  sgst_cess_amt: "",
  ugst_amt: "",
  ugst_cess_amt: "",
  cgst_amt: "",
  cgst_cess_amt: "",
  igst_amt: "",
  igst_cess_amt: "",
  comp_cess_amt: "",
  ap_bill_id: "",
  party_ref_no: "",
  party_ref_date: "",
  lut_bond_flag: "N",
  voucher_no: "",
  gross_amt: "",
  irn_no: "",
  qr_code: "",
};

export const debitCreditDetailInitialFormDataTemplate = {
  id: 1, // this should be deleted before submiting as it is temparay taken
  trans_id: "",
  it_code: "",
  sal_pur_acc: "",
  it_name: "",
  hsn_sac_code: "",
  qty: "",
  rate: "",
  amount: "",
  gst_amt_prc: "P",
  sgst_val: "",
  sgst_amt: "",
  sgst_cess_val: "",
  sgst_cess_amt: "",
  ugst_val: "",
  ugst_amt: "",
  ugst_cess_val: "",
  ugst_cess_amt: "",
  cgst_val: "",
  cgst_amt: "",
  cgst_cess_val: "",
  cgst_cess_amt: "",
  igst_val: "",
  igst_amt: "",
  igst_cess_val: "",
  igst_cess_amt: "",
  comp_cess_val: "",
  comp_cess_amt: "",
  record_id: "",
  acc_name: "",
  total_amt: "",
  total_cgst: "",
  total_sgst: "",
  total_igst: "",
  total_ugst: "",
  total_gst: "",
};

// account code help list header

export const accountHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Description", key: "acc_desc" },
];

// party code help list header

export const partyHelpListHeader = [
  { label: "Party Code", key: "code" },
  { label: "Party Name", key: "name" },
];

// order code help list header

export const orderHelpListHeader = [
  { label: "Order No", key: "order_no" },
  { label: "Order Date", key: "order_dt" },
];

// prof help list header

export const profHelpListHeader = [
  { label: "Prof No", key: "prof_no" },
  { label: "Prof Date", key: "prof_dt" },
];

// inv no help list header

export const invHelpListHeader = [
  { label: "INV No", key: "inv_no" },
  { label: "INV Date", key: "inv_dt" },
];

// ITEM help list header

export const itemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Item Name", key: "it_name_long" },
  { label: "HSN SAC Code", key: "hsn_sac_code" },
];

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
    party_code: "party_code",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  console.log("hasMasterKeys", hasMasterKeys);

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
