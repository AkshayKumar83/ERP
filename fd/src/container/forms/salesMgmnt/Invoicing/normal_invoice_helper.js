import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

const bottomBtnColor = "secondary";
export const invBottomBtn = [
  // {
  //     name: "OnAccBill",
  //     id: "on-acc-bills-btn",
  //     color: bottomBtnColor,
  //     disabled: false,
  //     outline: true,
  // },
  {
    name: "Items",
    id: "items-btn",
    color: bottomBtnColor,
    disabled: false,
    outline: true,
  },
  {
    name: "Payment",
    id: "payment-btn",
    color: bottomBtnColor,
    disabled: false,
    outline: true,
  },
  {
    name: "Despatch",
    id: "despatch-btn",
    color: bottomBtnColor,
    disabled: false,
    outline: true,
  },
  // {
  //     name: "Excise Sr No",
  //     id: "excise-sr-no-btn",
  //     color: bottomBtnColor,
  //     disabled: false,
  //     outline: true,
  // },
  // {
  //     name: "Excise Sr No",
  //     id: "excise-sr-no-btn",
  //     color: bottomBtnColor,
  //     disabled: false,
  //     outline: true,
  // },
  {
    name: "DDN",
    id: "ddn-btn",
    color: bottomBtnColor,
    disabled: false,
    outline: true,
  },
];

// NORMAL INVOICE ITEMS DETAIL HEADER
export const normalInvOnAccBillheader = [
  { label: "Voucher No", key: "it_code", width: "15%" },
  { label: "Bill No", key: "it_desc", width: "30%" },
  { label: "Bill Date", key: "qty", width: "10%" },
  { label: "PO No.", key: "rate", width: "10%" },
  { label: "Amount", key: "basic_value", width: "10%" },
  { label: "Db/Cr", key: "basic_value", width: "10%" },
];

export const onAccBillInitData = {
  voucher_id: "",
  voucher_no: "",
  acc_no: "",
  doc_no: "",
  doc_dt: "",
  po_no: "",
  amount: "",
  db_cr: "",
};

// NORMAL INVOICE ITEMS DETAIL HEADER
export const normalInvItemsheader = [
  // table used Mdsminv
  { label: "Item Code", key: "it_code", width: "12%" },
  { label: "Item Description", key: "it_desc", width: "20%" },
  { label: "HSN SAC Code", key: "it_desc", width: "12%" },
  { label: "Invoice Qty", key: "qty", width: "5%" },
  { label: "Conv. Rate", key: "rate", width: "8%" },
  { label: "CGST", key: "rate", width: "8%" },
  { label: "SGST", key: "rate", width: "8%" },
  { label: "IGST", key: "rate", width: "8%" },
  { label: "Value", key: "basic_value", width: "10%" },
];

//  INVOICE BATCH DETAIL HEADER
export const normalInvBatchDetailHeader = [
  // table used MDSMINV_BATCH
  { label: "Mrir No.", key: "mrir_no", width: "15%" },
  { label: "Batch No.", key: "batch_no", width: "30%" },
  { label: "BE No.", key: "be_no", width: "10%" },
  { label: "BE Date", key: "be_date", width: "5%" },
  { label: "Batch Qty", key: "batch_qty", width: "10%" },
  { label: "Excise/Unit", key: "ex_value_per_unit", width: "10%" },
  { label: "Cess/Unit", key: "splex_value_per_unit", width: "3%" },
  { label: "HSC/Unit", key: "higher_edu_cess_per_uni", width: "4%" },
  { label: "Add Duty/Unit", key: "add_duty_per_unit", width: "4%" },
];

export const formControlInitDataTempate = {
  di_doc_no: "di_doc_no",
  divert_inv_no: "divert_inv_no",
  di_party_code: "di_party_code",
  doc_no_helplist: "divert_order_no", // initially
};

export const mhsminvInitDataTemplate = {
  // di_doc_no: "di_doc_no",
  // divert_inv_no: "divert_inv_no",
  // di_party_code:'di_party_code',
  foc: "N",
  inv_agnst_da: "N",
  with_gst: "Y",
  p_rep_id: "",
  commodity: null,
};

export const paramenterInitTemplate = {
  commodity_wise_invoice: "Y",
};

export const divertOrderNoHelpListHdr = [
  // used in doc_no which is default/initial helplist header in doc_no
  { label: "Order No", key: "order_no" },
  { label: "Order Id", key: "order_id" },
  { label: "Order Date", key: "order_dt" },
  { label: "Customer Po No.", key: "c_po_no" },
  { label: "Customer Name", key: "c_name" },
  { label: "Customer Code", key: "c_code" },
];

export const daIdHelpListHdr = [
  { label: "DA Id", key: "da_id" },
  { label: "DA No", key: "da_no" },
  { label: "DA Date", key: "da_dt" },
  { label: "Order Id", key: "order_id" },
  { label: "Customer Name", key: "c_name" },
];

// below help header can be used for type
// DA, SO, cus_it_code, cus_it_desc, it_code, it_code for divert_inv, rmpda type, dc type
export const itemCodeAndDescHelpHdr = [
  // use this for DA and SO type item in which DA default and for cus_it_code and desc field also
  { label: "Item Code", key: "it_code" },
  { label: "Item Description", key: "it_desc" },
  { label: "Customer Item Code", key: "cus_it_code" },
  { label: "Customer Description", key: "cus_it_desc" },
];

export const orderIdHelpListHdr = [
  { label: "Order Id", key: "order_id" },
  { label: "Order No.", key: "order_no" },
  { label: "Customer Name", key: "c_name" },
];

export const rejGpIdHelpListHdr = [
  { label: "Rej GP Id", key: "rej_gp_id" },
  { label: "Rej GP No.", key: "rej_gpno" },
  { label: "Rej GP Date", key: "rej_gpdt" },
  { label: "Vendor Code", key: "v_code" },
  { label: "Vendor Name", key: "v_name" },
];

export const docIdHelpListHdr = [
  { label: "Doc Id", key: "doc_id" },
  { label: "Doc No.", key: "doc_no" },
  { label: "Doc Date", key: "doc_date" },
  { label: "Vendor Code", key: "v_code" },
  { label: "Vendor Name", key: "v_name" },
];

export const divertInvNoHelpListHdr = [
  { label: "Invoice Id", key: "inv_id" },
  { label: "Invoice No.", key: "inv_no" },
  { label: "Invoice Date", key: "inv_dt" },
  { label: "Order Id", key: "order_id" },
  { label: "Customer Name", key: "c_name" },
];

export const rmgpNoHelpListHdr = [
  { label: "Doc No", key: "doc_no" },
  { label: "Doc Date.", key: "doc_date" },
  { label: "Doc Id", key: "doc_id" },
];

export const commodityHelpListHdr = [
  { label: "Description", key: "commodity_desc" },
  { label: "Code", key: "commodity_code" },
];
export const bankHelpListHdr = [
  { label: "Account Code.", key: "bank_code" },
  { label: "Bank Name", key: "bank_name" },
  { label: "Bank Account No.", key: "bnk_ac_no" },
];

export const itemCodeHelpList = [
  { label: "Item Code", key: "it_code" },
  { label: "Item Desc", key: "it_name" },
  { label: "HSN SAC CODE", key: "hsn_sac_code" },
];

export const setDocType = ({
  formHdrData,
  setFormHdrData,
  event,
  setFormTempData,
}) => {
  const { name, value } = event.target;
  const { inv_agnst_da } = formHdrData;
  if (value == "N") {
    if (inv_agnst_da == "Y") {
      setFormTempData((prev) => ({
        ...prev,
        di_doc_no: "DA No.",
        di_party_code: "Customer",
        doc_no_helplist: "da_id",
      }));
      // todo enabled cust_it_code field inside the detail block
      // use daIdHelp in doc_no
      // open order rate field{ enabled it }
      // enabled btn supplimentary item in detail block
      // disabled the commodity_desc field in header
      // disabled the divert_inv_no field
    } else if (inv_agnst_da == "N") {
      setFormTempData((prev) => ({
        ...prev,
        di_doc_no: "Sales Order No.",
        di_party_code: "Customer",
      }));
      // use so type help in doc_no
      // use SO type help for item and item desc
      // use SO type help for cus_it_code and cus_it_desc
      // disabled order_rate
      // disabled the commodity_desc field in header
      // disabled divert_inv_no field

      //todo if parameter.commodity_wise_invoice is y then enable commodity_desc field
    }
  } else if (value == "V") {
    setFormTempData((prev) => ({
      ...prev,
      di_doc_no: "Sales Order No.",
      di_party_code: "Customer",
      doc_no_helplist: "divert_order_no",
    }));
    // enable cus_it_code
    // use divertOrderNoHelpListHdr help in doc_no
    // use it_code_divert_inv, it_desc_divert_inv for item and item desc
    // use cus_it_code_divert_inv, it_desc_divert_inv for cus_it_code and cus_it_desc
    // disabled order_rate and supplimentary item btn
    // disabled the commodity_desc field in header
    // enabled divert_inv_no field
  } else if (value == "S") {
    setFormTempData((prev) => ({
      ...prev,
      di_doc_no: "Sales Order No.",
      di_party_code: "Customer",
      doc_no_helplist: "order_id",
    }));
    // enable cus_it_code
    // use order_id help in doc_no and use orderIdHelpListHdr
    // use it_code_supp, it_desc_supp for item and item desc
    // use cus_it_code_supp, it_desc_supp for cus_it_code and cus_it_desc
    // enabled order_rate and supplimentary item btn
    // desabled divert_inv_no field

    //todo if parameter.commodity_wise_invoice is y then enable commodity_desc field
  } else if (value == "R") {
    setFormTempData((prev) => ({
      ...prev,
      di_doc_no: "RMDA No.",
      di_party_code: "Vendor",
      doc_no_helplist: "rej_gp_id",
    }));
    // disabeld cus_it_code
    // use rej_gp_id help for doc_no with rejGpIdHelpListHdr
    // use it_code_rmda, it_desc_rmda for item and item desc
    //enabled order_rate

    //todo if parameter.commodity_wise_invoice is y then enable commodity_desc field
    // desabled divert_inv_no field
  } else if (value == "D") {
    setFormTempData((prev) => ({
      ...prev,
      di_doc_no: "SDV No.",
      di_party_code: "Vendor",
      doc_no_helplist: "doc_id",
    }));
    // enable cus_it_code
    // use doc_id help for doc_no with docIdHelpListHdr
    // use it_code_dc, it_desc_dc for item and item desc
    //enabled order_rate and supplimentary item btn
    //todo if parameter.commodity_wise_invoice is y then enable commodity_desc field
    // desabled divert_inv_no field
  }
};

export const getMosmDactData = async ({
  formData,
  setFormData,
  user,
  e,
  formStatus,
}) => {
  const { value } = e.target;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_NORMAL_INVOICE_VALIDATE_FIELD
      }?validate_field=${"inv_type"}&inv_type=${value}&appFinYear=${
        user?.global_fin_year
      }&appDivisionId=${user?.global_division_id}`,
      { credentials: "include" }
    );

    const data = await response.json(); // Parse response before using

    if (response.ok) {
      setFormData({ ...formData, inv_type: value, ...data?.data });
    } else {
      throw new Error(data?.message || "Validation failed");
    }
    return true;
  } catch (error) {
    toast.error(error.message || "An error occurred");
    setFormData({
      ...formData,
      inv_type: value,
      user_code: "",
      excisable: "",
      excise_sr_no_reqd: "",
    });
    return false;
  }
};

export const setInvType = ({ formData, setFormData }) => {
  if (formData?.user_code == "W") {
    //todo open order_rate field
  }
};

// when validate inv_type field
export const validateInvType = async ({ e, formData, setFormData, user }) => {
  const { name, value } = e.target;
  if (["", null].includes(value)) {
    toast.error("Invoice type cannot be blank");
    e.target.focus();
    return;
  }

  const isValidFieldInput = await getMosmDactData({
    formData,
    setFormData,
    user,
    e,
  });

  if (!isValidFieldInput) {
    e.target.focus();
  }
};

export const validateDocNo = async ({ e, formData, setFormData, user }) => {
  const params = new URLSearchParams({
    validate_field: "doc_no",
    doc_no: formData?.doc_no || e.target.value,
    inv_type: formData?.inv_type,
    division_id: formData?.division_id,
    inv_agnst_da: formData?.inv_agnst_da,
    commodity: formData?.commodity,
    foc: formData?.foc,
    doc_type: formData?.doc_type,
    appFinYear: user?.global_fin_year,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_NORMAL_INVOICE_VALIDATE_FIELD
      }?${params.toString()}`,
      { credentials: "include" }
    );

    const data = await response.json(); // Parse response before using

    if (response.ok) {
      setFormData({ ...formData, ...data?.data });
    } else {
      throw new Error(data?.message || "Validation failed");
    }
    // return true;
  } catch (error) {
    toast.error(error.message || "An error occurred");
    setFormData({
      ...formData,
    });
    e.targt.focus();
    return;
    // return false;
  }
};

export const validateDivertInvNo = async ({
  e,
  formData,
  setFormData,
  user,
}) => {
  if (!e.target.value) {
    toast.error("Divert Invoice No. cannot be blank");
    e.target.focus();
    return;
  }
  const params = new URLSearchParams({
    validate_field: "divert_inv_no",
    doc_type: formData?.doc_type,
    divert_inv_no: formData?.divert_inv_no,
    divert_inv_id: formData?.divert_inv_id,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_NORMAL_INVOICE_VALIDATE_FIELD
      }?${params.toString()}`,
      { credentials: "include" }
    );

    const data = await response.json(); // Parse response before using

    if (response.ok) {
      setFormData({ ...formData, ...data?.data });
    } else {
      throw new Error(data?.message || "Validation failed");
    }
    // return true;
  } catch (error) {
    toast.error(error.message || "An error occurred");
    setFormData({
      ...formData,
    });
    e.target.focus();
    return;
  }
};

//-------------------- Item Block -----------------------

// export const validateItemCode = async (onSubmit, validationItemIndex) => {
//   const index = onSubmit ? validationItemIndex : itemFocusedRowIndex;
//   if (!helpList && !formDetailData[index]?.it_code) {
//     toast.error("Item Code cannot be empty");
//     return false;
//   }
//   let returnVal = true;
//   if (formDetailData[itemFocusedRowIndex]?.it_code && !onSubmit) {

//     returnVal = await getItemCodeDependentData(
//       formDetailData[itemFocusedRowIndex]?.it_code,
//       formData?.party_code,
//       formData?.inv_type
//     );
//   }
//   return returnVal;
// };



export const getItemCodeDependentData = async ({
  e,
  formData,
  formStatus,
  user,
  formControlData,
  formDetailData,
  setFormDetailData,
  itemFocusedRowIndex,
}) => {

    if (!["Insert", "Update"].includes(formStatus)) {
    return;
  }

  const it_code = e.target.value;
  if (!it_code) {
    toast.error("Item Code cannot be blank");
    e.target.focus();
    return
  }

  let c_code = formData.party_code
  let inv_type = formData.inv_type


  if (!c_code) {
    toast.error(
      `${
        formControlData?.di_party_code == 'di_party_code'? "Customer":formControlData?.di_party_code
      } Code should be filled to fetch HSN Code`
    );
    setFormDetailData((prevData) => {
      const newData = [...prevData];
      newData[itemFocusedRowIndex] = {
        ...newData[itemFocusedRowIndex],
        it_code: "",
        it_desc: "",
      };
      return newData;
    });
    return false;
  }
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_NORMAL_INVOICE_HSN_CODE_DATA
      }?it_code=${it_code}&c_code=${c_code}&inv_type=${inv_type}&division_id=${
        user.global_division_id
      }&trans_year=${user.global_fin_year}`,
      { credentials: "include" }
    );
    const data = await response.json();
    if (!data?.hsn_sac_code) {
      toast.error("HSN Code is not defined in Product Master.");
      setFormDetailData((prevData) => {
        const newData = [...prevData];
        newData[itemFocusedRowIndex] = {
          ...newData[itemFocusedRowIndex],
          it_code: "",
          it_desc: "",
        };
        return newData;
      });
      return false;
    } else {
      setFormDetailData((prevData) => {
        const newData = [...prevData];
        newData[itemFocusedRowIndex] = {
          ...newData[itemFocusedRowIndex],
          // hsn_sac_code: data?.hsn_sac_code,
          // cus_it_code: data?.cus_it_code ?? "",
          // cus_it_desc: data?.cus_it_desc ?? "",
          // it_desc: data?.it_desc ?? "",
          // it_uom: data?.it_uom ?? "",
          // apply_tax_paid_price: data?.apply_tax_paid_price || null,
          // sale_ac_head: data?.sale_ac_head ?? "",
          // sale_ac_desc: data?.sale_ac_desc ?? "",
          // gst_igst_val:data?.gst_igst_val ?? "",
          ...data,
        };
        return newData;
      });
      return true;
    }
  } catch (error) {
    console.error("Error checking HSN code:", error);
    toast.error(error.message || "Error checking HSN code");
    return false;
  }
};
