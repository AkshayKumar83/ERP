import { v4 as uuidv4 } from "uuid";

const bottomBtnColor = "secondary";

export const rmgpBottomBtn = [
  {
    name: "Cancel SDV",
    onClick: () => {
    },
    id: "cancel-vch-btn",
    color: bottomBtnColor,
    disabled: false,
    outline: true,
  },
];

export const headerInitialData = 
  // data block name is THMMMCHL
  {
    rtn_nonrtn: "",
    ok_rej: "O",
    chl_type: "M",
    nonkardex_flag: "N",
    customer_flag: "N",
    dlvr_note_no: "",
    doc_no: "",
    doc_date: "",
    serv_call_id: "",
    gr_no: "",
    gr_date: "",
    req_id: "",
    req_no: "",
    ref_no: "",
    ref_date: "",
    v_code: "",
    v_name: "",
    po_no: "",
    po_id: "",
    po_date: "",
    wc_id: "",
    wc_no: "",
    wc_description: "",
    liability: 0,
    freg_pay: 0,
    cost_center: "",
    pur_code: "",
    manual_no: "",
    mode_cd: "",
    mat_thru: "",
    transporter: "",
    no_of_case: "",
    weight: "",
    dest_frm: "",
    dest_to: "",
    remarks: "",
    r57f_ref: "",
    r57f_ref_dt: "",
    no_of_days: "",
    req_created_by: "",
    elec_ref_no: "",
    elec_ref_date: "",
    vehicle_no: "",
    trans_code: "",
    enter_by: "",
    recd_by: "",
    print_ok: "N",
    cancle_sdv: "",
    cancle_date: "",
    trans_year: "",
    doc_id: "",
    division_id: "",
    flag: "",
    manual_57f4ref_no: "",
    sdv_message: "",
    auth_message: "",
    row_status: "",
    out_time: "",
    ein_name: "",
    ein: "",
    text_item253: "XT ITEM253",
    item254: "ITEM254",
    t_ass_val: "",
    t_sgst_amt: "",
    t_sgst_cess_amt: "",
    t_ugst_amt: "",
    t_ugst_cess_amt: "",
    t_cgst_amt: "",
    t_cgst_cess_amt: "",
    t_igst_amt: "",
    t_igst_cess_amt: "",
    t_comp_cess_amt: "",
    gross_amt: ""

  };

export const dtlInitialData = 
  {
    // data block name is TDMMMCHL
    row_id: uuidv4(),
    create_id: "",
    auto_gen_it: "N",
    it_code: "",
    it_name: "",
    it_hsn_sac_code: "",
    um_code: "",
    qty_desp: "",
    rate: "",
    amount: "",
    qty_nos: "",
    store_stock: "",
    doc_id: "",
    po_id: "",
    wc_id: "",
    gst_amt_prc: "P",
    gst_sgst_val: "",
    gst_sgst_amt: "",
    gst_sgst_cess_val: "",
    gst_sgst_cess_amt: "",
    gst_ugst_val: "",
    gst_ugst_amt: "",
    gst_ugst_cess_val: "",
    gst_ugst_cess_amt: "",
    gst_cgst_val: "",
    gst_cgst_amt: "",
    gst_cgst_cess_val: "",
    gst_cgst_cess_amt: "",
    gst_igst_val: "",
    gst_igst_amt: "",
    gst_igst_cess_val: "",
    gst_igst_cess_amt: "",
    gst_comp_cess_val: "",
    gst_comp_cess_amt: "",
    total_amt: "",
    total_cgst: "",
    total_sgst: "",
    total_igst: "",
    total_ugst: "",
    total_gst: "",
    init_it_code: ""

  };


export const batchInitialData = 
  {
    // data block name is tdmmmchl_batch 
    row_id: "",
    doc_id: "",
    it_code: "",
    batch_no: "",
    batch_date: "",
    loca_rack_bin_desc: "",
    qty_desp: "",
    trans_code: "",
    trans_year: "",
    division_id: "",
    ok_rej: "",
    expiry_date: "",
    batch_store_qty: "",
    tot_batch_qty: "",
    init_batch_no: ""
  }


export const dtlHeaders = [
  // { label: " ", required: true, width: "" },
  { label: " Item Code", required: true, width: "" , isHelpExist: true},
  { label: "Description", required: false, width: "" },
  { label: "HSN/SAC Code", required: false, width: "" },
  { label: "UM", required: false, width: "" },
  { label: "Store Stock", required: false, width: "" },
  { label: " Qty. Despatch", required: true, width: ""},
  { label: "Rate", required: true, width: "" },
  { label: "Amount", required: true, width: ""},
];

export const batchHeaders = [
  { label: "Batch No", required: false, width: "" , isHelpExist: true},
  { label: "Batch Date", required: false, width: "" },
  { label: "Batch Stock Qty", required: false, width: "" },
  { label: "Physical Location", required: false, width: "" },
  { label: "Batch Qty", required: false, width: "" },
];



// ------ HELP LIST HEADERS---------------

export const vendorHelpListHeaderRmgp = [
  { label: "name", key: "v_name" },
  { label: "Vendor Code", key: "v_code" },
  { label: "City", key: "v_city" },
];

export const custHelpListHeaderRmgp = [
  { label: "name", key: "c_name" },
  { label: "Customer Code", key: "c_code" },
  { label: "City", key: "c_city" },
];

export const poNoHelpListHeaderRmgp = [
  { label: "PO No.", key: "po_no" },
  { label: "PO Date", key: "po_date" },
  { label: "Store", key: "wc_no" },
  { label: "po Id", key: "po_id" },
  { label: "Store Id", key: "wc_id" },
];

export const storeHelpListHeaderRmgp = [
  { label: "Description", key: "description" },
  { label: "Store", key: "wc_no" },
  { label: "Store Id", key: "wc_id" },
];


export const itemHelpListHeaderRmgp = [
  { label: "HSN SAC Code", key: "hsn_sac_code", },
  { label: "Item Code", key: "it_code" },
  { label: "Item Name", key: "it_name" },
  { label: "FC Code", key: "fc_code" },
]; 

export const batchHelpListHeaderRmgp = [
  { label: "Batch No", key: "batch_no", },
  { label: "Batch Date", key: "batch_date" },
 
];  

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    
    doc_no: "doc_no",
    doc_date: "doc_date",
   
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



