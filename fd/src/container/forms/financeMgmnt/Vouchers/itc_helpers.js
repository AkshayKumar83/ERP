export const mainTabHeaders = [
  { label: "Totals", required: false, width: "10%" },
  { label: "GST Value", required: false, width: "15%" },
  { label: "Cess Value", required: false, width: "15%" },
  { label: "GST Credit Allowable", required: false, width: "15%" },
  { label: "CESS Credit Allowable", required: false, width: "15%" },
  { label: "GST Credit Availed", required: false, width: "15%" },
  { label: "GST Credit Availed", required: false, width: "15%" },
];

export const formInitialData = {
  rc_applicable: "N",
  register_type: "G",
  cash_receipt: "N",
  v_type: "V",
  whether_ge_yesno: "N",
  whether_itc_eligible:"Y",
  credit_dt: "",
  isd_yesno: "N",
  v_code: "",
  v_name: "",
  manf_code: "",
  manf_name: "",
  pack_forwad_amt: "",
  doc_no: "",
  doc_date: "",
  division_id: "",
  j_vch_id: "",
  j_vch_no: "",
  extype: "",
  opening: "",
  round_gst_flag_header: "N",
  trans_code: 2,

  igst_tot_value: "",
  igst_tot_cess_val: "",
  igst_tot_val_cr_allowable: "",
  igst_tot_cess_val_cr_allowable: "",
  igst_tot_val_cr_availed: "",
  igst_tot_cess_val_cr_availed: "",
  sgst_tot_value: "",
  sgst_tot_cess_val: "",
  sgst_tot_val_cr_allowable: "",
  sgst_tot_cess_val_cr_allowable: "",
  sgst_tot_val_cr_availed: "",
  sgst_tot_cess_val_cr_availed: "",
  cgst_tot_value: "",
  cgst_tot_cess_val: "",
  cgst_tot_val_cr_allowable: "",
  cgst_tot_cess_val_cr_allowable: "",
  cgst_tot_val_cr_availed: "",
  cgst_tot_cess_val_cr_availed: "",
};

export const formDtlInitialData = {
  id: 1,
  gst_id: "",
  nctr: "",
  po_id: "",
  po_no: "",
  um_code: "",
  mrir_code: "",
  it_code: "",
  itm_goods_service: "G",
  hsn_sac_code: "",
  it_name: "",
  qty_advise: "",
  qty: "",
  rate: "",
  //misc_chgs_in_fc: "",
  // pack_forwad_prc: "",
  // pack_forwad_amt: "",
  // pack_forward_tot: "",
  // curr_val: "",
  // val_in_fc: "",
  // val_in_inr: "",
  // insurance_prc: "",
  // insurance_amt: "",
  // t_ass_val: "",
  // custom_hndlg_perc: "",
  // custom_perc_amt: "",
  // bcd_prc: "",
  // bcd_amt_ndb: "",
  // bcd_amt: "",
  // bcd_edu_cess_prc: "",
  // //bdc_edu_cess_amt: "",
  // bcd_edu_cess_amt_ndb: "",
  // bcd_hsc_cess_prc: "",
  // //bdc_hsc_cess_amt: "",
  // bcd_hsc_cess_amt_ndb: "",
  // net_amt: "",
  gst_amt_prc: "P",
  // igst_perc: "",
  // igst_value: "",
  // igst_cess_perc: "",
  // igst_cess_val: "",
  // igst_perc_cr_allowable: "",
  // igst_val_cr_allowable: "",
  // igst_cess_perc_cr_allowable: "",
  // igst_cess_val_cr_allowable: "",
  // igst_perc_cr_availed: "",
  // igst_val_cr_availed: "",
  // sgst_perc: "",
  // sgst_value: "",
  // sgst_cess_perc: "",
  // sgst_cess_val: "",
  // sgst_perc_cr_allowable: "",
  // sgst_val_cr_allowable: "",
  // sgst_cess_perc_cr_allowable: "",
  // sgst_cess_val_cr_allowable: "",
  // sgst_perc_cr_availed: "",
  // sgst_val_cr_availed: "",
  // cgst_perc: "",
  // cgst_value: "",
  // cgst_cess_perc: "",
  // cgst_cess_val: "",
  // cgst_perc_cr_allowable: "",
  // cgst_val_cr_allowable: "",
  // cgst_cess_perc_cr_allowable: "",
  // cgst_cess_val_cr_allowable: "",
  // cgst_perc_cr_availed: "",
  // cgst_val_cr_availed: "",
  tot_net_amt: "",
  round_gst_flag_detail: "N",
};

export const tableData = [
  {
    label: "IGST",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
  {
    label: "SGST/UGST",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
  {
    label: "CGST",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
];

export const freightTabGstHeaders = [
  { label: "", required: false, width: "10%" },
  { label: "IGST", required: false, width: "10%" },
  { label: "IGST CESS", required: false, width: "15%" },
  { label: "SGST/UGST", required: false, width: "15%" },
  { label: "SGST/UGST CESS", required: false, width: "15%" },
  { label: "CGST", required: false, width: "15%" },
  { label: "CGST CESS", required: false, width: "15%" },
];
export const insOrFreightHeaders = [
  { label: "", required: false, width: "10%" },
  { label: "", required: false, width: "10%" },
];

export const withoutHeadtaxTbl = {
  label: "",
};

export const insuranceTableData = [
  {
    label: "",
    ins_chg: "",
  },
  {
    label: "value",
    ins_value: "",
  },
];

export const gstInsTaxTblHead = {
  label: "",
  gstValue: "IGST",
  cessValue: "IGST Cess",
  gstCreditAllowable: "SGST/UGST",
  cessCreditAllowable: "SGST/UGST CESS",
  gstCreditAvailed1: "CGST",
  gstCreditAvailed2: "CGST CESS",
};

export const gstInsTblData = [
  {
    label: "%",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
  {
    label: "value",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
];

export const itemTabGstHeaders = [
  { label: "", required: false, width: "10%" },
  { label: "GST", required: false, width: "10%" },
  { label: "CESS %", required: false, width: "15%" },
  { label: "GST Credit Allowable", required: false, width: "15%" },
  { label: "CESS Credit Allowable", required: false, width: "15%" },
  { label: "GST Credit Availed", required: false, width: "15%" },
  { label: "GST Credit Availed", required: false, width: "15%" },
];

export const headers = [
  //{ label: "Action", required: false, width: "5%" },
  {
    label: "Item Code / MRIR No",
    required: true,
    width: "10%",
    isHelpExist: true,
  },
  { label: "Goods/Service", required: false, width: "10%" },
  { label: "HSN/SAC / Item Name", required: true, width: "5%" },
  { label: "Challan Qty", required: false, width: "5%" },
  { label: "Recd Qty", required: true, width: "5%" },
  { label: "Discounted Rate", required: true, width: "5%" },
  { label: "Misc Chgs", required: false, width: "8%" },
  { label: "P&F %/ Amount", required: false, width: "5%" },
  { label: "Curr Rate", required: false, width: "5%" },
  { label: "Value in FC/Value in INR", required: false, width: "5%" },
  { label: "Ins % value", required: false, width: "5%" },
  { label: "Assessable value", required: false, width: "5%" },
  { label: "Handling Charges % Amt", required: false, width: "5%" },
  { label: "% Amt", required: false, width: "4%" },
  { label: "EDU % Amt", required: false, width: "4%" },
  { label: "HSC % Amt", required: false, width: "4%" },
  { label: "Net Value", required: false, width: "15%" },
];

export const igstTableData = [
  {
    label: "IGST LBL",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
  {
    label: "value",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
];

export const sgstTableData = [
  {
    label: "SGST LBL",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
  {
    label: "value",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
];

export const cgstTableData = [
  {
    label: "CGST LBL",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
  {
    label: "value",
    gstValue: "",
    cessValue: "",
    gstCreditAllowable: "",
    cessCreditAllowable: "",
    gstCreditAvailed1: "",
    gstCreditAvailed2: "",
  },
];

// vendor code help list header

export const vendorHelpListHeader = [
  { label: "Vendor Code", key: "v_code" },
  { label: "Vendor Name", key: "v_name" },
];

// invoice code help list header

export const invoiceHelpListHeader = [
  { label: "Invoice No", key: "invoice_no" },
  { label: "Invoice Date", key: "invoice_dt" },
];

// po no help list header

export const poHelpListHeader = [
  { label: "Po No", key: "po_no" },
  { label: "Po Date", key: "po_date" },
];

// item name help list header

export const itemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Item Name", key: "it_name" },
  { label: "HSN SAC Code", key: "hsn_sac_code" },
];

export const hsnHelpListHeader = [
  { label: "HSN SAC Code", key: "hsn_sac_code" },
];

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
    itc_sr_no: "itc_sr_no",
    register_type: "register_type",
    v_code: 'v_code',
    doc_no: 'doc_no'
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  //console.log("hasMasterKeys", hasMasterKeys);

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
