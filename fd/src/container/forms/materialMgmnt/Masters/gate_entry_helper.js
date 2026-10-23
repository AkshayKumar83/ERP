
import { v4 as uuidv4 } from "uuid";
import { APP_PROD_API } from "../../../../utils/api";
import { setLoader } from "../../../../features/loader/loaderSlice";
import toast from "react-hot-toast";


export const getGateEntryBottomBtn = (toggleCnclModal) => [
  {
    name: "Cancel Gate Entry",
    id: "cancel-vch-btn",
    color: "secondary",
    disabled: false,
    outline: true,
    onClick: toggleCnclModal,
  },
];

export const headerInitialData = {
  // data block name is thmmrct
  inter_div: "I",
  from_division: "",
  material_fr: "S",
  ok_rej: "O",
  sale_return: "0",
  material_type: "N",
  inward_control_no: "",
  ship_to_type:'M', // newly added feild as per jsb sir said on 05-01-2026
  ship_to:'',
  ge_no: "",
  ge_recno: "",
  ge_date: "",
  v_code: "",
  cons_no: "",
  order_no: "",
  potype: "",
  po_order_dt: "",
  po_eff_date: "",
  wc_id: "",
  po_id: "",
  order_id: "",
  chln_no: "",
  chln_date: "",
  st38_no: "",
  cons_ctrl_id: "",
  manuf_code: "",
  manufacturer_desc: "",
  expiry_dt: "",
  excl_gp_no: "",
  excl_gp_dt: "",
  transporter: "",
  trnsdoc_no: "",
  trnsdoc_dt: "",
  no_of_case: "",
  pr_refno: "",
  billcashno: "",
  remarks: "",
  cancel_ge: "N",
  recd_by_cd: "",
  create_id: "",
  create_date: "",
  update_id: "",
  update_date: "",
  trans_year: "",
  division_id: "",
  row_status: "",
  ge_id: "",
  vendor_lotno: "",
  temp_wc_id: "",
  cancel_message: "",
  cancel_remarks: "",
  amd_no: "",
  v_name: "",
  wcId1: "",
  charge_cd: "N",
  mrir_type: "",
  print_flag: "N",
  po_end_dt: "",
  po_eff_dt: "",
  freight_charges: "",
};

export const detailInitialData = {
  row_id: uuidv4(),
  qty_damaged: "",
  po_no: "",
  item_rate: "",
  it_code: "",
  oldit_code: "",
  mrir_no: "",
  it_name: "",
  wc_id: "",
  trans_code: "",
  it_pu_um: "",
  reoffered: "",
  po_qty_ord: "",
  purch_ac: "",
  qty_advise: "",
  tmpqty_advise: "",
  oldqty_advise: "",
  qty_ets: "",
  no_of_case: "",
  qty_recd: "",
  qty_accptd: "",
  status_flg: "",
  return_rm_code: "",
  print_tag: "",
  update_dtl: "",
  ok_rej: "",
  rej_gpno: "",
  rej_gpdt: "",
  ddn_no: "",
  ddn_dt: "",
  totalqty_accptd: "",
  totalqty_recd: "",
  totalschd_qty: "",
  totalge_qty: "",
  plus_minus_allowed: "",
  total_qty: "",
  schd_msg: "",
  row_status: "",
  ge_id: "",
  ets_auth_id: "",
  po_id: "",
  order_id: "",
  schd_btn: "",
  ge_tag_ok: "",
  rate_rs: "",
  iic_ref_no: "",
  qty_recd: "", // chalan entry form field
  conversion_factor: "", // chalan entry form field
  qty_converted: "", // chalan entry form field
};

export const initialData57F4 = [
  {
    // data block name is tdmmrct57f4
    ge_id: "",
    it_code: "",
    chlnr57f_no: "",
    chlnr57f_dt: "",
  },
];

export const initialData57F4Qty = [
  {
    // data block name is tdmmrct57f4_qty
    ge_id: "",
    it_code: "",
    it_name: "",
    chlnr57f_no: "",
    chlnr57f_dt: "",
    rm_code: "",
    rm_conv_factor: "",
    rm_qty_used: "",
    it_bom_um: "",
  },
];

export const messageInitialData = [
  {
    total_accpt: "",
    total_qty: "",
    total_ui: "",
    challan_qty: "",
    ge_qty: "",
    schd_qty: "",
    plus_minus_allowed: "",
    add_dedn_qty: "",
    po_qty_ord: "",
    message: "",
  },
];

export const dtlTableHeaders = [
  { label: "PO No", required: true, width: "120px", isHelpExist: true },
  { label: "Item Code", required: true, width: "70px", required: true, isHelpExist: true  },
  { label: "Description", required: false, width: "300px" },
  { label: "Rate", required: false, width: "100px" },
  { label: "UOM", required: false, width: "50px" },
  { label: "Ordered Qty", required: false, width: "50px" },
  { label: "Challan Qty", required: true, width: "60px" },
  { label: "Received Qty", required: true, width: "60px" },
  { label: "Balanced Qty", required: true, width: "60px" },
  { label: "MRIR No.", required: false, width: "100px" },
  { label: "MRIR Date.", required: false, width: "100px" },
  { label: "IGST ", required: false, width: "50px" },
  { label: "CGST", required: false, width: "50px" },
  { label: " SGST", required: false, width: "50px" },
  { label: "Basic value ", required: false, width: "100px" },
  { label: "Total Value", required: false, width: "100px" },
  // { label: "Gen MRIR.", required: true, width: "" },
];

export const tableHeaders57F4 = [
  { label: "Ref No.", required: true, width: "" },
  { label: "Ref Date", required: true, width: "" },
];


export const rowMaterialTableHeaders = [
  { label: "RM Code", required: true, width: "" },
  { label: "RM Description", required: true, width: "" },
  { label: "Conv Factor", required: true, width: "" },
  { label: "57F4 Qty Used", required: true, width: "" },
  { label: "UOM", required: true, width: "" },
];


// -------------------------------------------- HelpList Header ---------------------------------
export const vendorHelpListHeader = [
  { label: "Name", key: "v_name" },
  { label: "Vendor Code", key: "v_code" },
  { label: "City", key: "party_city" },
  { label: "Address", key: "address" },
];


export const chalanNoHelpListHeader = [
  { label: "Invoice No.", key: "inv_no" },
  // { label: "Invoice Date", key: "inv_dt" },
  // { label: "Trans Year", key: "trans_year" },
];


export const consNoHelpListHeader = [
  { label: "Consignment ID.", key: "cons_ctrl_id" },
  { label: "Consignment No.", key: "cons_ctrl_no" },
  { label: "Consignment Date.", key: "cons_ctrl_dt" },
  { label: "Invoice No.", key: "inv_no" },
  { label: "Invoice Date", key: "inv_dt" },
];

export const orderNoHelpListHeader = [
  { label: "Po No.", key: "c_po_no" },
  { label: "Order No.", key: "order_no" },
  { label: "Order Id", key: "order_id" },
  { label: "Invoice No.", key: "inv_no" },
];

export const manurHelpListHeader = [
  { label: "Code", key: "manuf_code" },
  { label: "Description", key: "manufacturer_desc" },
];

export const custHelpListHeader = [
  { label: "Code", key: "v_code" },
  { label: "Name", key: "v_name" },
];

export const shipToHelpListHeader = [
  { label: "Member Code", key: "ship_to" },
  { label: "Member Name", key: "ship_to_name" },
  { label: "Dealer Code", key: "dealer_code" },
  // { label: "Dealer Name", key: "dealership_name" },
  { label: "Division", key: "dlr_type" },
  { label: "Location", key: "location" },
]

export const poNoHelpListHeader = [
  { label: "Quantity", key: "qtn_ref" },
  { label: "Po No.", key: "po_no" },
  { label: "Po Date", key: "po_date" },
  { label: "Po Eff Date", key: "po_eff_dt" },
  { label: "Po Id", key: "po_id" },
];

export const poItemHelpListHeader = [
  { label: "Po No.", key: "po_no" },
  // { label: "Po Id", key: "po_id" },
  { label: "Item code", key: "it_code" },
  { label: "Name", key: "it_name" },
  { label: "Rate", key: "po_mat_rat" },
  { label: "UOM", key: "it_pu_um" },
  { label: "Ordered Qty", key: "po_qty_ord" },
 

];

export const rmdaNoHelpListHeader = [
  { label: "Rej Gp No", key: "rej_gpno" },
  { label: "Rej Gp Date", key: "rej_gpdt" },
];

export const ddnNoHelpListHeader = [
  { label: "DDN No.", key: "ddn_no" },
  { label: "DDN Date", key: "ddn_dt" },
];

export const handleFillItems = async ({ formData, user, setDetailData }) => {
  try {
    if (!formData.chln_no) {
      toast.error("Challan number is missing!");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_GATE_ETNRY_FILL_ITEM
      }?chln_no=${formData.chln_no}&appFinYear=${
        user?.global_fin_year
      }&appDivisionId=${user?.global_division_id}`,
      { credentials: "include" }
    );

    const result = await res.json().catch(() => null);

    if (!res.ok || !result) {
      toast.error(result?.message || "Unable to fetch challan data!");
      return;
    }

    const { type, data, message } = result;

    if (type !== "success" || !Array.isArray(data) || data.length === 0) {
      toast.error(message || "No items found for this challan!");
      // setDetailData([{}]);
      return;
    }

    const block1 = data.map((item) => ({
      it_code: item.it_code,
      it_name: item.it_name,
      it_pu_um: item.um_code,
      qty_advise: item.qty_desp,
    }));

    setDetailData(block1);
    toast.success("Items filled successfully!");
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Server not reachable. Try again later!");
  }
};

// added by akshay 05-06-26
export const validateGEPoNo = async ({
  data,
  setDetailData,
  setDisableFreight,
  formData,
  setFormData,
  current_po_no,
  user,
  rowIndex,
  formStatus
}) => {

   if (!["Insert", "Update",].includes(formStatus)) {
      return;
    }

    if (
      data?.po_validated === "Y" &&
      data?.po_no === current_po_no
       ) {
      return;
      }


  try {
    if (!current_po_no) {
      toast.error("PO number is missing!");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_GATE_ETNRY_VALIDATE
      }?fPoNo=${current_po_no}&po_id=${data?.po_id}&appFinYear=${
        user?.global_fin_year
      }&appDivisionId=${user?.global_division_id}`,
      { credentials: "include" }
    );

    const result = await res.json().catch(() => null);

    if (!res.ok || !result) {
      toast.error(result?.message || "Unable to fetch challan data!");
      return;
    }
    console.log(result);


    const resultData = result?.data;

    let newFormData = { ...formData };

    let updatedPoItem = resultData.map((item) => {

      return {
        ...data,
        it_code: item?.it_code,
        it_name: item?.it_name,
        it_pu_um: item?.it_pu_um,
        rate_rs: item?.po_mat_rat,
        gst_cgst_val: item.gst_cgst_val,
        gst_sgst_val: item.gst_sgst_val,
        gst_igst_val: item.gst_igst_val,
        po_qty_ord: item?.po_qty_ord,
        wc_id: formData?.wc_id,
        um_code: item?.um_code,
        conversion_factor: item?.conversion_factor || item?.it_p_umf,
        iic_ref_no: item?.iic_ref_no,
        row_id: uuidv4(),
        bal_qty:item.bal_qty,

       // reset field
        qty_advise: "",
        recd_qty: "",
        qty_converted: "",

         po_validated: "Y", // mark this po as validated
      };
    });

const ws22Row = updatedPoItem.find(
  row => row.it_code === "WS22"
);

if (!ws22Row) {
  // PO me freight item hi nahi hai
  setDisableFreight(false);
} else if (Number(ws22Row.rate_rs) > 0) {
  // Freight already PO me defined hai
  setDisableFreight(true);
} else {
  // WS22 hai but rate 0 hai
  setDisableFreight(false);
}

    setDetailData(updatedPoItem);

    const { mrir_type, charge_cd } = deriveMRIRTypeAndCharge({
      ok_rej: formData?.ok_rej,
      material_fr: formData?.material_fr,
      sale_return: String(formData?.sale_return),
      potype: result?.hdrData?.potype,
    });

    const { ge_date, chln_date } = newFormData;
    const po_end_dt = result?.hdrData?.po_end_dt || "";
    const po_eff_dt = result?.hdrData?.po_eff_dt || "";

     if (chln_date && po_end_dt) {
      if (new Date(chln_date) < new Date(po_eff_dt)) {
        toast.error("Chalan Date cannot be lesser than PO Effective Date! It should be between PO Effective Date and PO End Date.");
        newFormData.chln_date = "";
      }
    }


    if (chln_date && po_end_dt) {
      if (new Date(po_end_dt) < new Date(chln_date)) {
        toast.error("Chalan Date cannot be greater than PO End Date");
        newFormData.chln_date = "";
      }
    }

    

    setFormData((prev) => ({
      ...prev,
      mrir_type,
      charge_cd,
      po_end_dt: result?.hdrData?.po_end_dt || "",
      po_eff_dt: result?.hdrData?.po_eff_dt || "",
      po_value: Number(result?.hdrData?.po_value || 0).toFixed(2),
      ge_value: "",
    }));
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Server not reachable. Try again later!");
  }
};

export const deriveMRIRTypeAndCharge = ({
  ok_rej,
  material_fr,
  sale_return,
  potype, // e.g. "JW", "PO"
}) => {
  let mrir_type = "";
  let charge_cd = "N";

  const isJW = potype?.startsWith("J");

  // ---------- MAIN OK / REJ LOGIC ----------
  if (ok_rej === "O") {
    charge_cd = "Y";

    if (material_fr === "S" && sale_return === "0") {
      mrir_type = isJW ? "JOB WORK" : "PURCHASE MATERIAL";
    }

    if (["1", "2", "3", "4", "6", "7"].includes(sale_return)) {
      charge_cd = "N";
    }
  } else {
    charge_cd = "N";

    if (material_fr === "C" && sale_return === "0") {
      mrir_type = "CUSTOMER MATERIAL";
    }

    if (material_fr === "S") {
      mrir_type = isJW ? "OSP REJECTION" : "MISC. REJECTION";
    }

    if (material_fr === "C") {
      mrir_type = "SALE REJECTION";
    }
  }

  // ---------- FINAL OVERRIDES (VERY IMPORTANT) ----------
  if (material_fr === "C" && sale_return === "0") {
    mrir_type = "CUSTOMER MATERIAL";
    charge_cd = "N";
  }

  if (material_fr === "C" && sale_return === "1") {
    mrir_type = "Against Customer 57 F4";
    charge_cd = "N";
  }

  if (material_fr === "C" && sale_return === "2") {
    mrir_type = "For Repair";
    charge_cd = "N";
  }

  if (material_fr === "C" && sale_return === "3") {
    mrir_type = "Against Warranty Return";
    charge_cd = "N";
  }

  if (sale_return === "4") {
    mrir_type = "Against Misc SDV Return";
    charge_cd = "N";
  }

  if (sale_return === "5") {
    mrir_type = "Cash Recipt";
    charge_cd = "N";
  }

  if (material_fr === "C" && sale_return === "6") {
    mrir_type = "Against D3 Return";
    charge_cd = "N";
  }

  if (material_fr === "C" && sale_return === "7") {
    mrir_type = "Against Customer ETS Return";
    charge_cd = "N";
  }

  return { mrir_type, charge_cd };
};

export const recalcConvertedQty = (row) => {
  console.log("function recalcConvertedQty invoked with row: ", row);
  const recdQty = Number(row.recd_qty) || Number(row.qty_advise);
  const convFactor = Number(row.conversion_factor) || 0;
  const umCode = row.um_code;

  let converted = recdQty * convFactor;

  if (umCode === "NOS") {
    converted = Math.round(converted);
  }

  console.log(
    `Recalc Qty - Recd: ${recdQty}, ConvFactor: ${convFactor}, Converted: ${converted}`
  );

  return converted;
};

export const validateChlnDate = ({
  chln_date,
  ge_date,
  formStatus,
  setFormData,
}) => {
  if (!["Insert", "Update"].includes(formStatus)) return;

  if (!chln_date || !ge_date) return;

  const chlnDate = new Date(chln_date);
  const geDate = new Date(ge_date);

  if (chlnDate > geDate) {
    toast.error("Challan Date can't be greater than Gate Entry Date");

    // reset invalid value
    setFormData((prev) => ({
      ...prev,
      chln_date: "",
    }));
  }
};



// search in PO
export const createSrchPayloadGE = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    ge_no: "ge_no",
    v_code: "v_code",
    ship_to: "ship_to",
    chln_no: "chln_no",
    chln_date: "chln_date",
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


export const validateVendorChlnNO = async ({
   e,
  ge_id,
  v_code,
  chln_no,
  formStatus,
}) => {
   if (!["Insert", "Update"].includes(formStatus)) return true;

    if (!v_code || !chln_no) {
    toast.error("Vendor Code and Challan No are required.");
    return false;
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CHECK_DUPLICATE_VENDOR_CHLN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({    ge_id,v_code, chln_no,formStatus }),
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!data.valid) {
      toast.error(data.message);
        //  e.target.focus();

      if (e?.target) {
        e.target.focus();
      }
      
      //   setFormData((prev) => ({
      //   ...prev,
      //   chln_no: "",
      // }));
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    toast.error("Server error");
    return false;
  }
};

export const calculateItemValues = (row, freightCharges) => {

  const basic =
    row.it_code === "WS22"
      ? Number(freightCharges || 0)
      : Number(row.rate_rs || 0) * Number(row.recd_qty || 0);

  const cgstAmt =
    basic * Number(row.gst_cgst_val || 0) / 100;

  const sgstAmt =
    basic * Number(row.gst_sgst_val || 0) / 100;

  const igstAmt =
    basic * Number(row.gst_igst_val || 0) / 100;

  const total =
    basic + cgstAmt + sgstAmt + igstAmt;

  return {
    basic_val: basic.toFixed(3),
    cgst_amt: cgstAmt.toFixed(3),
    sgst_amt: sgstAmt.toFixed(3),
    igst_amt: igstAmt.toFixed(3),
    total_value: total.toFixed(3),
  };
};



export const calculateGEValue = (rows, freightCharges) => {
  return rows.reduce((sum, row) => {
    const values = calculateItemValues(row, freightCharges);
    return sum + Number(values.total_value || 0);
  }, 0);
};

export const applyTransportGST = (row, gstPerc) => {
  const updatedRow = { ...row };

  const isIGST = Number(updatedRow.gst_igst_val || 0) > 0;

  if (isIGST) {
    updatedRow.gst_igst_val = gstPerc;
    updatedRow.gst_cgst_val = 0;
    updatedRow.gst_sgst_val = 0;
  } else {
    updatedRow.gst_igst_val = 0;
    updatedRow.gst_cgst_val = gstPerc / 2;
    updatedRow.gst_sgst_val = gstPerc / 2;
  }

  return updatedRow;
};

// ON CLICK IN PRINT BUTTON PURCHASE ORDER REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getGEPrint(formData, formStatus, dispatch){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {ge_id, division_id, trans_year} = formData;
  
  if (!ge_id || !division_id, !trans_year) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
  }

  
  try {
      dispatch(setLoader({ key: "form", value: true })); 
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.PRINT_GATE_ENTRY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      credentials:'include',
      body: JSON.stringify({ 
          ge_id: ge_id,
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
    link.download = `Material_Gate_Entry_${ge_id}.pdf`;  // Specify the file name for the download
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