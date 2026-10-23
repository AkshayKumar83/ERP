


import { v4 as uuidv4 } from "uuid";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { setLoader } from "../../../../features/loader/loaderSlice";
import { FaCity } from "react-icons/fa6";

export const formHdrInitData = {
  po_flag: "O",
  acc_no: "",
  acc_desc: "",
  doc_no: "",
  doc_dt: "",
  block_flag: "Y",
  init_acc_no: "",
  rb_direct_to_ost: "Q",
  flag:'N',
  amd_no:0,
  disp_po_type  : '',
  c_code:"",
  c_name:"",
  adv_gl_acc_no:'',
  adv_against_po:'',
  subsidy_perc:'',
  po_type:'',
  brand_code:'',


};

export const purchaseOrderItemHeader = [
  // { label: "Filler", key: "filler", width: "3%", },
  { label: "Item Code", key: "it_code", width: "60px", isHelpExist: true,required: true },
  { label: "HSN/SAC Code", key: "it_desc", width: "100px" },
  // { label: "Job work Sac", key: "qty_ord", width: "10%" },
  { label: "Short Description", key: "mat_rat", width: "200px" },
  { label: "Stock UOM", key: "active", width: "20px" },
  // { label: "Stock Quantity", key: "active", width: "10%" },
  { label: "Purchase UOM", key: "active", width: "20px" }, // newly added
  { label: "Purchase Qty.", key: "active", width: "10px",required: true },
  { label: "Rate", key: "active", width: "100px" },
  { label: "Dis %", key: "active", width: "5px",},
  { label: "Dis Amt", key: "active", width: "10px" },
  { label: "Amount", key: "active", width: "100px" },
  // { label: "Make", key: "active", width: "10%" },
  // { label: "Active", key: "active", width: "10%" },
   { label: "Subsidy From Item Master" ,width: "5px" },
    { label: "Subsidy applicable in PO" ,width: "5px" },
];


export const purchaseDeliveryHeader = [
  { label: "Delivery Date", key: "dlvr_dt", width: "10%" },
  { label: "Delivery Qty", key: "dlvr_qty", width: "10%" },
];

export const purchaseBillLevelHeader = [
  { label: "Charges Component", key: "chrg_component", width: "10%" },

  { label: "%/Value(P/F)", key: "flag", width: "10%", type: "text", maxLength: 1 },

  { label: "Amount", key: "amount", width: "10%", type: "number" },

  { label: "Computed Amount", key: "computed_amt", width: "10%", type: "number" },

  { label: "Subsidy Aplicable", key: "sub_aplicable", width: "10%" },

  { label: "Subsidy Amount", key: "subsidy_amt", width: "10%", type: "number" },
];

export const rowLabels = [
  { label: "Basic Value", key: "basic" },
  { label: "Packing & Forwarding", key: "basic" },
  { label: "Freight Fixed", key: "other" },
  { label: "Agency Commission ", key: "other" },
  { label: "Insurance", key: "other" },
  { label: "IGST ", key: "other" },
  { label: "CGST ", key: "other" },
  { label: "SGST ", key: "other" },
];

export const ItemInitialData = [
  {
    row_id: uuidv4(),
    row_status: "",
    osp_mat_perc: "",
    it_code: "",
    po_qty_ord: "",
    po_mat_rat: "",
    po_disc: "",
    po_disc_val: "",
    value_after_discount: "",
    tot_val_aftr_disc: "",
    old_it_code: "",
    desc: "",
    fc_code: "",
    uom: "",
    esti_cost_pur: "",
    pr_id: "",
    active: "Y",
    gst_amt_prc: "",
    ex_amtp_fl: "",
    ex_amt: "",
    ex_perc: "",
    spl_ex_per: "",
    hsc_ex_perc: "",
    rg_lst_cst: "",
    cst_form: "",
    cst_form_tax: "",
    cst_lst_perc: "",
    cst_perc: "",
    lst_perc: "",
    surch_perc: "",
    po_ser_rat: "",
    pack_code: "",
    mod_vat: "Y",
    po_perunit: 1,
    tax_on_disc: "Y",
    po_um: "",
    po_fab_chg: "",
    rej_allow: "",
    spl_add_cd_perc_amt: "",
    spl_add_cd_value: "",
    serv_tax_perc_amt: "",
    serv_tax_value: "",
    serv_tax_cess: "",
    serv_tax_recov: "Y",
    serv_tax_on_material: "Y",
    incl_servtax_in_sales_tax: "Y",
    remark: "",
    po_id: "",
    sob_perc: "",
    std_cost: "",
    it_type: "",
    direct_item: "",
    pr_no: "",
    it_name_long: "",

    serv_tax_value_sbc: "",
    serv_tax_value_kkc: "",

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

    hsn_sac_code: "",
    jw_sac: "",
    tot_det_rec: "",
    cnt_rec: "",
    esti_cost_per_unit: "",
    subsidy_applicable:'',
  },
];

export const formDlvrInitData = [
  { id: 1,}
];

export const formSubContrInitData = [
  { id: 1,}
];



export const vendorHelpListHeader = [
  { label: "name", key: "v_name" },
  { label: "Vendor Code", key: "v_code" },
  { label: "Currency Code", key: "curr_cd" },
  { label: "City", key: "city" },
];

export const shipToHelpListHeader = [

  { label: "Ship To", key: "c_code" },
  { label: "Name", key: "c_name" },
  { label: "City", key: "city" },
  { label: "Dealer Code", key: "dealer_code" },

];

export const advanceGLHelpListHeader = [

  { label: "Acc No", key: "acc_no" },
  { label: "Name", key: "acc_desc" },
];

export const paymentTermHelpListHeader = [
  { label: "Term Code", key: "term_code" },
  { label: "Description", key: "term_desc" },
];

export const itemCodeHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Long Name", key: "it_name_long" },
  { label: "Name", key: "it_name" },
  { label: "UOM", key: "it_pu_um" },
  { label: "Category", key: "cat_desc" },
  { label: "Subsidy Applicable", key: "subsidy_yes_no" },
  { label: "Rate", key: "it_rate" },
];



export const docAuth1 = {
  auth_id: '',
  auth_name: '',
  auth_flag: '',
  auth_date: '',
  auth_remarks: '',
  refuse_flag: '',
  refuse_date: '',
  refuse_remarks: '',
  cancel_flag: '',
  cancel_date: '',
  cancel_remarks: ''
}
export const docAuth2 = {
  auth_id: '',
  auth_name: '',
  auth_flag: '',
  auth_date: '',
  auth_remarks: '',
  refuse_flag: '',
  refuse_date: '',
  refuse_remarks: '',
  cancel_flag: '',
  cancel_date: '',
  cancel_remarks: ''
}
export const docAuth3 = {
  auth_id: '',
  auth_name: '',
  auth_flag: '',
  auth_date: '',
  auth_remarks: '',
  refuse_flag: '',
  refuse_date: '',
  refuse_remarks: '',
  cancel_flag: '',
  cancel_date: '',
  cancel_remarks: ''
}

// VALIDATE PARTY CODE
  export async function validateVendor(e, formStatus, user = {}, formData, cb) {
    if (["Insert", "Update"].includes(formStatus)) {
      e.preventDefault(); // Prevent default blur behavior

      const nextElement = e.relatedTarget; // The element getting focus after blur

      // If nextElement is an input field, trigger validation
      if (!nextElement || nextElement.tagName !== "INPUT") {
        return; // Replace with your validation logic
      }

      if (e.target.value === "") {
        toast.error("VENDOR CANNOT BE NULL");
        e.target.focus(); // Stay on the field
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.VALIDATE_PO_FROM_DATA
          }?fname=${e.target.name}&v_code=${e.target.value}&appFinYear=${
            user?.global_fin_year
          }&appDivisionId=${user?.global_division_id}`,
          { credentials: "include" }
        );

        const data = await response.json(); // Parse response before using

        if (response.ok) {
          cb({ ...formData, ...data?.data });
        } else {
          throw new Error(data?.message || "Validation failed");
        }
      } catch (error) {
        toast.error(error.message || "An error occurred");
        cb({
          ...formData,
          V_code: "",
          V_name: "",
          curr_cd: "",
          curr_conv: "",
        });
        console.error(error);
        e.target.focus(); // Keep focus on the field
      }
    }
   }


  export function getDispFlag(formData, setFormData) {
    const {flag, cancelFlag} = formData;
    let disp_flag = ''
    if (cancelFlag === 'Y') {
      disp_flag =  'Cancelled';
    }
    
    switch (flag) {
      case 'A':
        disp_flag = 'Authorised';
      case 'P':
        disp_flag = 'Printed';
      case 'F':
        disp_flag = 'Approved by (Finance)';
      case 'R':
        disp_flag = 'Refused PO';
      default:
        disp_flag = 'Unauthorised';
    }

    setFormData((prev)=>({...prev, disp_flag}))
   }




// export const validateItemCode = async (onSubmit, validationItemIndex) => {
//   const index = onSubmit ? validationItemIndex : itemFocusedRowIndex;
//   if (!helpList && !formDetailData[index]?.it_code) {
//     toast.error("Item Code cannot be empty");
//     return false;
//   }
//   let returnVal = true;
//   if (formDetailData[itemFocusedRowIndex]?.it_code && !onSubmit) {
//     //todo might be the below logic need to be apply
//     // returnVal = await checkIfItemCodeIsInactive(
//     //   formDetailData[itemFocusedRowIndex]?.it_code
//     // );
//     // if (returnVal) {
//     //   returnVal = await getItemCodeDependentData(
//     //     formDetailData[itemFocusedRowIndex]?.it_code,
//     //     formData?.c_code,
//     //     formData?.inv_type
//     //   );
//     // }

//     returnVal = await getItemCodeDependentData(
//       formDetailData[itemFocusedRowIndex]?.it_code,
//       formData?.party_code,
//       formData?.inv_type
//     );
//   }
//   return returnVal;
// };

// export const getItemCodeDependentData = async (it_code, v_code, inv_type) => {
//   if (!v_code) {
//     toast.error("Vendor Code should be filled to fetch HSN Code");
//     setFormDetailData((prevData) => {
//       const newData = [...prevData];
//       newData[itemFocusedRowIndex] = {
//         ...newData[itemFocusedRowIndex],
//         it_code: "",
//         it_desc: "",
//       };
//       return newData;
//     });
//     return false;
//   }
//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SERVICE_INVOICE_HSN_CODE_DATA
//       }?it_code=${it_code}&c_code=${c_code}&inv_type=${inv_type}&division_id=${user.global_division_id}&trans_year=${user.global_fin_year}`,
//       { credentials: "include" }
//     );
//     const data = await response.json();
//     if (!data?.hsn_sac_code) {
//       toast.error(data?.error || "HSN Code is not defined in Product Master.");
//       // setFormDetailData((prevData) => {
//       //   const newData = [...prevData];
//       //   newData[itemFocusedRowIndex] = {
//       //     ...newData[itemFocusedRowIndex],
//       //     it_code: "",
//       //     it_desc: "",
//       //     hsn_sac_code:'',
//       //   };
//       //   return newData;
//       // });
//       return false;
//     } else {
//       setFormDetailData((prevData) => {
//         const newData = [...prevData];
//         newData[itemFocusedRowIndex] = {
//           ...newData[itemFocusedRowIndex],
//           // hsn_sac_code: data?.hsn_sac_code,
//           // cus_it_code: data?.cus_it_code ?? "",
//           // cus_it_desc: data?.cus_it_desc ?? "",
//           // it_desc: data?.it_desc ?? "",
//           // it_uom: data?.it_uom ?? "",
//           // apply_tax_paid_price: data?.apply_tax_paid_price || null,
//           // sale_ac_head: data?.sale_ac_head ?? "",
//           // sale_ac_desc: data?.sale_ac_desc ?? "",
//           // gst_igst_val:data?.gst_igst_val ?? "",
//           ...data,
//         };
//         return newData;
//       });
//       return true;
//     }
//   } catch (error) {
//     console.error("Error checking HSN code:", error);
//     toast.error("Error checking HSN code");
//     return false;
//   }
// };



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
      gst_igst_amt: gst_igst_val != 0 ? Number(basic_value) * 0.18 : 0,
      gst_cgst_amt: gst_cgst_val != 0 ? Number(basic_value) * 0.09 : 0,
      gst_sgst_amt: gst_sgst_val != 0 ? Number(basic_value) * 0.09 : 0,
    };
  });

  // // If callback is provided, call it with updated data
  // if (typeof cb === "function") {
  //   cb(newFormDtlData);
  // }

  return newFormDtlData; // Also return the new data if needed
};


export const fillHdrRestFieldValue = ({
  formData,
  formDetailData,
  formStatus,
  hdrCb,
  dtlCb,
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
  if (typeof setUpdateFormData === "function" && formStatus == "Update") {
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
  setUpdateFormData,
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
    setUpdateFormData,
  });
};

export const calcItemValue = () => {};

// search in PO
export const createSrchPayloadPO = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    po_no: "po_no",
    po_date: "po_date",
    v_code: "v_code",
    po_type: "po_type",
    c_code:'c_code',
   
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


export const validatePoDates = (formStatus, po_eff_dt, po_end_dt) => {
  if (formStatus === 'QUERY') return;

  if (!po_end_dt) {
    throw new Error('PO End Date cannot be blank');
  }

  if (po_eff_dt && new Date(po_end_dt) < new Date(po_eff_dt)) {
    throw new Error('PO End Date cannot be less than Effective Date');
  }
};


// ON CLICK IN PRINT BUTTON PURCHASE ORDER REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getPOPrint(formData, formStatus, dispatch){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {po_id, division_id, trans_year} = formData;
  
  if (!po_id || !division_id, !trans_year) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
  }

  
  try {
      dispatch(setLoader({ key: "form", value: true })); 
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.PRINT_PURCHASE_ORDER}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      credentials:'include',
      body: JSON.stringify({ 
          po_id: po_id,
          po_no: formData?.po_no,
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
    link.download = `purchase_order_${po_id}.pdf`;  // Specify the file name for the download
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



export const recalculateCharges = (
  itemFormData,
  billFormData,
  formData
) => {

  const updated = { ...billFormData };

  // 🔹 1. TOTAL AMOUNT (ALL ITEMS)
  const totalAmount = itemFormData.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  // 🔹 2. ELIGIBLE AMOUNT (ONLY SUBSIDY ITEMS)
  const eligibleAmount = itemFormData
    .filter(item => item.subsidy_applicable === "Y")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // 🔹 3. BASIC VALUE UPDATE
  if (updated["BASIC VALUE"]) {
    updated["BASIC VALUE"].amount = totalAmount;
    updated["BASIC VALUE"].computed_amt = totalAmount;
  }

  // 🔹 4. SUBSIDY CALCULATION
  const perc = Number(formData?.subsidy_perc || 0);

  Object.keys(updated).forEach(key => {
    const row = updated[key];

    if (row.sub_aplicable === "Y") {
      row.subsidy_amt = ((eligibleAmount * perc) / 100).toFixed(2);
    } else {
      row.subsidy_amt = "";
    }
  });

  return {
    updatedCharges: updated,
    totalAmount
  };
};