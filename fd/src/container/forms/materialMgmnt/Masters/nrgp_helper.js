import { v4 as uuidv4 } from "uuid";

import toast from "react-hot-toast";
import { getLocalDateTime } from "../../../../utils/fn";
import { setLoader } from "../../../../features/loader/loaderSlice";
import { APP_PROD_API } from "../../../../utils/api";


const bottomBtnColor = "secondary";

export const nrgpBottomBtn = [
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
    gross_amt: "",
    is_gst_chln:'N'
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
  { label: " Item Code", required: true, width: "15%" , isHelpExist: true},
  { label: "Description", required: false, width: "50%" },
  // { label: "HSN/SAC Code", required: false, width: "" },
  { label: "UM", required: false, width: "10%" },
  { label: "Store Stock", required: false, width: "10%" },
    { label: "Rate", required: true, width: "90%" },
  { label: " Qty. Despatch", required: true, width: "30%"},

  // { label: "Amount", required: true, width: ""},
];

export const batchHeaders = [
  { label: "Batch No", required: false, width: "" , isHelpExist: true},
  { label: "Batch Date", required: false, width: "" },
  { label: "Batch Stock Qty", required: false, width: "" },
  { label: "Physical Location", required: false, width: "" },
  { label: "Batch Qty", required: false, width: "" },
];



// ------ HELP LIST HEADERS---------------

export const vendorHelpListHeaderNrgp = [
  { label: "name", key: "v_name" },
  { label: "Vendor Code", key: "v_code" },
  { label: "City", key: "v_city" },
];

export const custHelpListHeaderNrgp = [
  { label: "name", key: "c_name" },
  { label: "Customer Code", key: "c_code" },
  { label: "City", key: "c_city" },
];

export const poNoHelpListHeaderNrgp = [
  { label: "PO No.", key: "po_no" },
  { label: "PO Date", key: "po_date" },
  { label: "Store", key: "wc_no" },
  { label: "po Id", key: "po_id" },
  { label: "Store Id", key: "wc_id" },
];

export const storeHelpListHeaderNrgp = [
  { label: "Description", key: "description" },
  { label: "Store", key: "wc_no" },
  { label: "Store Id", key: "wc_id" },
];


export const itemHelpListHeaderNrgp = [
  { label: "HSN SAC Code", key: "hsn_sac_code", },
  { label: "Item Code", key: "it_code" },
  { label: "Item Name", key: "it_name" },
  { label: "FC Code", key: "fc_code" },
]; 

export const batchHelpListHeaderNrgp = [
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


// ON CLICK IN PRINT BUTTON NRGP REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getNRGPPrint(formData, formStatus, dispatch){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {doc_id,doc_no,doc_date,chl_type, division_id, trans_year} = formData;
  
  if (!doc_id || !doc_no || !doc_date||!chl_type || !division_id, !trans_year) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
    
  }
  try {
      dispatch(setLoader({ key: "form", value: true })); 
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PRINT_NRGP_REPORT}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      credentials:'include',
      body: JSON.stringify({ 
          pDOC_ID:doc_id,
          pDOC_NO: doc_no,
          pDOC_DATE:doc_date,
          P_CHL_TYPE:chl_type,
          P_TRANS_YEAR:trans_year,
          P_DIVISION_ID:division_id,
          pSDV_PRINT_AS:null,
      }), // Send the parameter in the request body
    });

    if (!response.ok) {
      throw new Error('Report generation failed!');
    }

    // Convert the response to a blob (PDF file)
    const blob = await response.blob();

    // Create a link to trigger the file download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Non_Returnable_Gate_Pass_${doc_no}.pdf`;  // Specify the file name for the download
    link.click();  // Trigger the download

  //   toggleModal();  // Close modal after success
  } catch (err) {
    //console.log(err.message);
    toast.error(err.message)
  } finally {
  //   setLoading(false);  // Ensure loading state is set to false after the process
    dispatch(setLoader({ key: "form", value: false })); 
  }

}


