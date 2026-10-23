import toast from "react-hot-toast";
import { getLocalDateTime } from "../../../../utils/fn";
import { APP_PROD_API } from "../../../../utils/api";
import { setLoader } from "../../../../features/loader/loaderSlice";

const bottomBtnColor = "secondary";
export const serviceInvBottomBtn = [
  // {
  //   name: "Items",
  //   id: "items-btn",
  //   color: bottomBtnColor,
  //   disabled: false,
  //   outline: true,
  // },
  {
    name: "Payment",
    id: "payment-btn",
    color: bottomBtnColor,
    disabled: false,
    outline: true,
  },
  {
    name: "Cancel Invoice",
    // id: "cancel-vch-btn",
    // color: bottomBtnColor,
    // disabled: false,
    // outline: true,
  },
];

// SERVICE INVOICE ITEMS DETAIL HEADER
export const serviceOrderItemsheader = [
  // table used Mdsminv
  { label: "Item Code", key: "it_code", width: "10%", isHelpExist: true },
  { label: "HSN/SAC Code", key: "hsn_sac_code", width: "10%" },
  { label: "Item Desc.", key: "it_desc", width: "20%" },
  { label: "Invoice Qty", key: "qty", width: "5%" },
  // { label: "Foreign Curr. Order Rate", key: "order_rate", width: "10%" },
  { label: "Rate", key: "rate", width: "10%" },
  { label: "SGST %", key: "gst_sgst_val", width: "3%" },
  { label: "CGST %", key: "gst_cgst_val", width: "3%" },
  { label: "IGST %", key: "gst_igst_val", width: "3%" },

  { label: "Value", key: "basic_value", width: "10%" },
  // { label: "A#", key: "access_flg", width: "3%" },
  // { label: "", key: "fill_57f4", width: "4%" },
];

// SERVICE INVOICE BATCH DETAIL HEADER
export const serviceOrderBatchDetailHeader = [
  // table used MDSMINV_BATCH
  { label: "Mrir No.", key: "mrir_no", width: "15%" },
  { label: "Batch No.", key: "batch_no", width: "30%" },
  { label: "BE No.", key: "be_no", width: "10%" },
  { label: "BE Date", key: "be_date", width: "5%" },
  { label: "Batch Qty", key: "batch_qty", width: "10%" },
  { label: "Excise/Unit", key: "ex_value_per_unit", width: "10%" },
  { label: "Cess/Unit", key: "splex_value_per_unit", width: "3%" },
  { label: "Cess/Unit", key: "higher_edu_cess_per_uni", width: "4%" },
  { label: "Add Duty/Unit", key: "add_duty_per_unit", width: "4%" },
];

export const formControlInitDataTempate = {
  di_doc_no: "",
  divert_inv_no: "",
};

// export const mhsminvInitData = {
//   name:`tcs_calc_on
//   row_status
//   st_flag
//   tommrmda_no_mrir_flag
//   trans_year
//   foc
//   division_id
//   doc_type
//   inv_type
//   da_id
//   inv_agnst_da
//   doc_no
//   order_id
//   rej_gp_id
//   doc_id
//   divert_inv_no
//   divert_inv_id
//   jw
//   rmgp_no
//   despatch_fr
//   rmgp_id
//   inv_id
//   inv_no
//   inv_dt
//   st38_no

//   user_code: "",
//   excisable: "",
//   excise_sr_no_reqd: "",
//   customer_is_division: "",
//   commodity: "",
//   commodity_desc: "",
//   annual_flag: "",
//   c_po_no: "",
//   c_code: "",
//   party_code: "",
//   party_name: "",
//   ship_to_code: "",
//   ship_to_name: "",
//   bill_to_code: "",
//   bill_to_name: "",
//   selec_ref_no: "",
//   ass_val: "",
//   gst_sgst_amt: "",
//   gst_igst_amt: "",
//   gst_ugst_amt: "",
//   gst_cgst_amt: "",
//   gst_sgst_cess_amt: "",
//   gst_igst_cess_amt: "",
//   gst_cgst_cess_amt: "",
//   gst_comp_cess_amt: "",
//   basic_val: "",
//   discount: "",
//   volume_discount_amt: "",
//   trade_discount_amt: "",
//   pack_forw: "",
//   bed: "",
//   excise_sed: "",
//   excise_hsc: "",

//   t_excise_hsc: "",
//   t_excise: "",
//   t_sale_tax: "",
//   t_addtl_imp_duty: "",
//   t_freight: "",
//   t_insurance: "",
//   tcs_amt: "",
//   tcs_surch_amt: "",
//   net_amt: "",
//   rounded_val: "",
//   t_sale_tax_1: "",
//   t_gst_sgst_amt_1: "",
//   t_gst_ugst_amt_1: "",
//   t_gst_cgst_amt_1: "",
//   t_gst_igst_amt_1: "",
//   t_gst_comp_cess_amt_1: "",
//   t_excise_1: "",
//   t_discount_1: "",
//   t_ass_val_1: "",
//   t_basic_val_1: "",
//   net_amt_1: "",
//   voucher_id: "",
//   voucher_no: "",
//   prc_id: "",
//   credit_note_id: "",
//   credit_note: "",
//   exc_doc_no: "",
//   exc_doc_dt: "",
//   gr_rr_no: "",
//   gr_rr_dt: "",
//   prep_dt: "",
//   curr_cd: "",
//   c_ex_rate: "",
//   so_curr_cd: "",
//   so_c_ex_rate: "",

//   bank_code: "",
//   bank_name: "",
//   sp_in_dcsc_flg: "",
//   final_dest: "",
//   isdsp_inf_no: "",
//   mode_cd: "",
//   ptst_name: "",
//   vessel_no: "",
//   case_mrk: "",
//   weight: "",
//   bdco_thrul: "",
//   removal_dt: "",
//   del_terms: "",
//   policy_no: "",
//   excise_text: "",
//   remark: "",
//   fmt_terms: "",
//   due_dt: "",
//   mmdhd_no: "",
//   other_prc_val1: "",
//   other_add_less1: "",
//   other_amt1: "",
//   other_net_amt1: "",
//   other_ac_head1: "",
//   other_ac_desc1: "",
//   other_chg1: "",
//   other_add_less2: "",
//   other_amt2: "",
//   other_net_amt2: "",
//   other_ac_head2: "",
//   other_ac_desc2: "",
//   other_chg3: "",
//   other_prc_val3: ""

//   other_add_less3: "",
//   other_amt3: "",
//   other_net_amt3: "",
//   other_ac_head3: "",
//   other_ac_desc3: "",
//   tcs_perc: "",
//   tcs_surch: "",
//   tcs_cess: "",
//   ins_flag: "",
//   ins_amt_prc: "",
//   chng_on: "",
//   calc_gst_gon_ins: "",
//   gst_amt_prc_1: "",
//   gst_sgst_amt_1: "",
//   gst_sgst_cess_amt_1: "",
//   gst_sgst_val_1: "",
//   gst_sgst_cess_val_1: "",
//   gst_ugst_amt_1: "",
//   gst_ugst_cess_amt_1: "",
//   gst_ugst_val_1: "",
//   gst_ugst_cess_val_1: "",
//   gst_cgst_amt_1: "",
//   gst_cgst_cess_amt_1: "",
//   gst_cgst_val_1: "",
//   gst_cgst_cess_val_1: "",
//   gst_igst_amt_1: "",
//   gst_igst_cess_amt_1: "",
//   gst_igst_val_1: "",
//   gst_igst_cess_val_1: "",
//   gst_comp_cess_val_1: "",
//   gst_comp_cess_amt_1: "",
//   pack_amt_prc: "",
//   pack_forw: "",
//   frt: "",
//   frt_amt_prc: ""

//   frt_chg: "",
//   calc_gst_on_frt: "",
//   gst_amt_prc_f: "",
//   gst_sgst_amt_f: "",
//   gst_sgst_val_f: "",
//   gst_sgst_cess_amt_f: "",
//   gst_sgst_cess_val_f: "",
//   gst_ugst_amt_f: "",
//   gst_ugst_val_f: "",
//   gst_ugst_cess_amt_f: "",
//   gst_ugst_cess_val_f: "",
//   gst_cgst_amt_f: "",
//   gst_cgst_val_f: "",
//   gst_cgst_cess_amt_f: "",
//   gst_cgst_cess_val_f: "",
//   gst_igst_amt_f: "",
//   gst_igst_val_f: "",
//   gst_igst_cess_amt_f: "",
//   gst_igst_cess_val_f: "",
//   gst_comp_cess_amt_f: "",
//   gst_comp_cess_val_f: "",
//   octroi_chg: "",
//   cancel_flag: "",
//   cancel_dt: "",
//   rpin_flag: "",
//   form_flag: "",
//   auth_perms: "",
//   auth_flag: "",
//   auth_dt: "",
//   eddn_type: "",
//   excise_type: "",
//   curr_rg23abal_bed: "",
//   curr_rg23cabal_bed: "",
//   curr_plabal_bed: "",

//   pla_sno: "",
//   pla_dt: "",
//   pla_amt: "",
//   pla_bed_amt: "",
//   pla_sed_amt: "",
//   rg23a_sno: "",
//   rg23a_dt: "",
//   rg23a_amt: "",
//   rg23a_bed_amt: "",
//   rg23a_sed_amt: "",
//   rg23c_sno: "",
//   rg23c_dt: "",
//   rg23c_amt: "",
//   rg23c_bed_amt: "",
//   rg23c_sed_amt: "",
//   curr_rg23abal_sed: "",
//   curr_plabal_sed: "",
//   dt_excise_bed: "",
//   dt_excise_sed: "",
//   dt_excise: "",
//   dt_ser_amt: "",
//   dt_ser_sed_amt: "",
//   tcs_cess_amt: "",
//   credit_limit: "",
//   current_balance: "",
//   current_balance_db_cr: "",
//   balance_credit: "",
//   last_inv_no: "",
//   last_inv_dt: "",
//   last_inv_net_amt: "",
//   t_surc_lieu_tax_paid: "",
//   tot_surcharge: "",
//   sno_of_packet: ""
//   `
// }

export const mhsminvInitData = {
  // inv_type: "V",
  doc_type: "N",
  // inv_dt: new Date().toISOString().split("T")[0],
  // prep_dt: new Date().toISOString().slice(0, 16),
  // prep_dt: getLocalDateTime(),
  // all checkbox initial value
  with_gst: "N",
  // cancel_flag:'Y',
  // auth_flag:'Y',
  flag_cus_van: "C", // C for Customer, V for Vendor
};

export const customerCodeHelpList = [
  { label: "Customer Code", key: "c_code" },
  { label: "Customer Name", key: "c_name" },
  { label: "City", key: "city" },
  { label: "GST NO", key: "gst_no" },
];

export const vendorCodeHelpList = [
  { label: "Vendor Code", key: "v_code" },
  { label: "Vendor Name", key: "v_name" },
  { label: "City", key: "city" },
  { label: "GST NO", key: "gst_no" },
];

export const salesPersonHelpList = [
  { label: "Sales Person Code", key: "acc_no" },
  { label: "Sales Person Name", key: "acc_desc" },
];

export const debitAccHelpList = [
  { label: "Debit Acc Code", key: "acc_no" },
  { label: "Description", key: "acc_desc" },
];

export const catalogCodeHelpList = [
  { label: "Catalog Code", key: "catalog_code" },
  { label: "Item Code", key: "it_code" },
  { label: "Item Desc", key: "it_desc" },
];

export const itemCodeHelpList = [
  { label: "Item Code", key: "it_code" },
  { label: "Item Desc", key: "it_name" },
  { label: "HSN SAC CODE", key: "hsn_sac_code" },
  // { label: "Rate", key: "it_rate" },
];

// prevent negative value
export const onlyNumberKeyAllow = (e) => {
  
   if (!["Insert", "Update", "Search"].includes(formStatus)){
      return;
   }

  const value = e.target.value;

  const allowedKeys = [
    "Backspace",
    "Tab",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  const isNumberKey = e.key >= "0" && e.key <= "9";
  const isDecimalPoint = e.key === "." && !value.includes(".");
  const isMinus = e.key === "-";

  if (isMinus) {
    e.preventDefault();
    toast.error("Negative values are not allowed.");
    return;
  }

  if (allowedKeys.includes(e.key) || isNumberKey || isDecimalPoint) {
    return; // Allow
  }

  e.preventDefault();
  toast.error("Only numbers and one decimal point are allowed.");
};

// basic value calculation
export const calcBasicValue = ({ formDetailData, index, formStatus }, cb) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return;
  }
// //console.log('run to calculate basic  value', )
  const { qty, rate } = formDetailData[index] || {};

  const qtyNum = Number(qty);
  const rateNum = Number(rate);

  if (!isNaN(qtyNum) && !isNaN(rateNum)) {
    const basicVal = qtyNum * rateNum;
    //console.log('run to calculate basic  value', basicVal)
    cb((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], basic_value: basicVal };
      return newData;
    });
  }
};

export const validateItemRow = ({ formDetailData, formStatus }) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return true; // If not in these statuses, consider it valid
  }

  const requiredFields = ["it_code", "qty", "rate", "basic_value"];

  for (let i = 0; i < formDetailData.length; i++) {
    const row = formDetailData[i];

    for (let field of requiredFields) {
      const value = row[field];

      // Check for null, undefined, empty string
      if (value === undefined || value === null || value === "") {
        return {
          valid: false,
          message: `${field} cannot be blank in row ${i + 1}`,
        };
      }

      // Check for zero value where not allowed
      if (
        ["qty", "rate", "basic_value"].includes(field) &&
        Number(value) === 0
      ) {
        return {
          valid: false,
          message: `${field} cannot be zero in row ${i + 1}`,
        };
      }
    }
  }

  return { valid: true };
};

// filling Invoice Detail block hidden fields values
export const fillDtlRestFieldsValue = ({ formDetailData, formStatus }) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return;
  }

  const newFormDtlData = formDetailData.map((row) => {
    const {
      rate = 0,
      basic_value = 0,
      gst_igst_val = 0,
      gst_cgst_val = 0,
      gst_sgst_val = 0,
    } = row;

    return {
      ...row,
      assess_value: basic_value,
      order_rate: rate,
      gst_igst_amt: gst_igst_val != 0 ? Number(basic_value) * gst_igst_val/100 : 0,
      gst_cgst_amt: gst_cgst_val != 0 ? Number(basic_value) * gst_cgst_val/100 : 0,
      gst_sgst_amt: gst_sgst_val != 0 ? Number(basic_value) * gst_sgst_val/100 : 0,
    };
  });

  // // If callback is provided, call it with updated data
  // if (typeof cb === "function") {
  //   cb(newFormDtlData);
  // }

  return newFormDtlData; // Also return the new data if needed
};

// // calculate header block gst/total fields values
// export const fillHdrRestFieldValue = ({
//   formData,
//   formDetailData,
//   formStatus,
//   hdrCb,
//   dtlCb,
// }) => {
//   if (!["Insert", "Update"].includes(formStatus)) {
//     return;
//   }

//   // basic and assess calculation
//   let t_basic_val = 0,
//     t_ass_val = 0;
//   formDetailData.forEach((row) => {
//     t_basic_val = Number(t_basic_val) + Number(row?.basic_value);
//     t_ass_val = Number(t_ass_val) + Number(row?.basic_value);
//   });

//   // total gst calculation
//   let t_gst_sgst_amt = 0,
//     t_gst_cgst_amt = 0,
//     t_gst_igst_amt = 0;

//   formDetailData.forEach((row) => {
//     t_gst_sgst_amt = Number(t_gst_sgst_amt) + Number(row?.gst_sgst_amt ?? 0);
//     t_gst_cgst_amt = Number(t_gst_cgst_amt) + Number(row?.gst_cgst_amt ?? 0);
//     t_gst_igst_amt = Number(t_gst_igst_amt) + Number(row?.gst_igst_amt ?? 0);
//   });

//   // net_amt calculation

//   let net_amt = t_basic_val + t_gst_sgst_amt + t_gst_cgst_amt + t_gst_igst_amt;

//   if (typeof hdrCb === "function") {
//     hdrCb((prev) => ({
//       ...prev,
//       t_basic_val,
//       t_ass_val,
//       t_gst_sgst_amt,
//       t_gst_cgst_amt,
//       t_gst_igst_amt,
//       net_amt,
//     }));
//   }
// };

export const fillHdrRestFieldValue = ({
  formData,
  formDetailData,
  formStatus,
  hdrCb,
  dtlCb, // currently unused, consider removing if not needed
  setUpdateFormData,
}) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return;
  }

  let t_basic_val = 0;
  let t_ass_val = 0;
  let t_gst_sgst_amt = 0;
  let t_gst_cgst_amt = 0;
  let t_gst_igst_amt = 0;

  formDetailData.forEach((row) => {
    const basicValue = Number(row?.basic_value) || 0;

    t_basic_val += basicValue;
    t_ass_val += basicValue;

    t_gst_sgst_amt += Number(row?.gst_sgst_amt) || 0;
    t_gst_cgst_amt += Number(row?.gst_cgst_amt) || 0;
    t_gst_igst_amt += Number(row?.gst_igst_amt) || 0;
  });

  const net_amt =
    t_basic_val + t_gst_sgst_amt + t_gst_cgst_amt + t_gst_igst_amt;

  if (typeof hdrCb === "function") {
    hdrCb((prev) => ({
      ...prev,
      volume_discount_amt: 0,
      trade_discount_amt: 0,
      t_pack_forw: 0,
      t_basic_val,
      t_ass_val,
      t_gst_sgst_amt,
      t_gst_cgst_amt,
      t_gst_igst_amt,
      net_amt,
      t_addtl_imp_duty: 0,
      t_insurance: 0,
      t_freight: 0,
      tcs_amt: 0,
      tcs_cess_amt: 0,
      tcs_surch_amt: 0,
    }));
  }

  // Ensure updateFormData is also updated
  if (typeof setUpdateFormData === "function" && formStatus == 'Update') {
    setUpdateFormData((prev) => ({
      ...prev,
      volume_discount_amt: 0,
      trade_discount_amt: 0,
      t_pack_forw: 0,
      t_basic_val,
      t_ass_val,
      t_gst_sgst_amt,
      t_gst_cgst_amt,
      t_gst_igst_amt,
      net_amt,
      t_addtl_imp_duty: 0,
      t_insurance: 0,
      t_freight: 0,
      tcs_amt: 0,
      tcs_cess_amt: 0,
      tcs_surch_amt: 0,
    }));
  }
};

export const validateItemRecord = ({
  formData,
  formDetailData,
  formStatus,
  setFormData,
  setFormDetailData,
  setUpdateFormData
}) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  // Fill detail values and update state
  const updatedDetailData = fillDtlRestFieldsValue({
    formDetailData,
    formStatus,
  });
  if (typeof setFormDetailData === "function") {
    setFormDetailData(updatedDetailData);
  }

  // Fill header values and update state
  fillHdrRestFieldValue({
    formData,
    formDetailData: updatedDetailData, // Use updated details
    formStatus,
    hdrCb: setFormData, // Fixed typo here
    dtlCb: setFormDetailData, // Currently unused, but you passed it correctly
    setUpdateFormData
  });
};

// ON CLICK IN PRINT BUTTON EXPENSE REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getInvoicePrint(formData, formStatus, dispatch){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {inv_id, division_id, trans_year} = formData;
  
  if (!inv_id || !division_id, !trans_year) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
    
  }
  try {
      dispatch(setLoader({ key: "form", value: true })); 
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.PRINT_SERVICE_INV}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      credentials:'include',
      body: JSON.stringify({ 
          pInv_ID: inv_id,
          P_TRANS_YEAR:trans_year,
          P_DIVISION_ID:division_id,
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
    link.download = `Service_invoice_${inv_id}.pdf`;  // Specify the file name for the download
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

export const createSrchPayloadSrvInv = (masterData) => {
  let payload = {};

  console.log('masterData from inside the inv search func', masterData)
  //console.log("masterdata", masterData);

  let masterKeys = {
    inv_no: "inv_no",
    inv_dt: "inv_dt",
    party_code: "c_code"
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


