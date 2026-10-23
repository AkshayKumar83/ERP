import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
// #### ***************** THFMTRAN ****************** ####
// HELP LIST HEADER DATA

// PARTY CODE
export const partyHelpListHeader = [
  { label: "Party Code", key: "acc_no" },
  { label: "Party Name", key: "acc_desc" },
];

//ITC REF
export const itcRefHelpListHeader = [
  { label: "S.No", key: "itc_sr_no" },
  { label: "Party Name", key: "v_name" },
  { label: "Party Code", key: "v_code2" },
  { label: "Doc No", key: "doc_no" },
  { label: "Doc Date", key: "doc_date" },
];

// WO NO CODE
export const woNoHelpListHeader = [
  { label: "PO NO.", key: "po_no" },
  { label: "PO ID", key: "po_id" },
];

// ON CLICK IN PRINT BUTTON EXPENSE REPORT WILL CALL USING JASPER JAVA SERVICE
export async function getExpVchReport(expVchData, formStatus) {
  // e.preventDefault();
  if (formStatus !== "Query") {
    return;
  }
  const { voucher_no, division_id, trans_year } = expVchData;

  if ((!voucher_no || !division_id, !trans_year)) {
    toast.error("Required Parameter is Misssing for Report!");
    return;
  }
  try {
    // Send request to your Node.js server to generate the report
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/generate-report/exp_vch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials:'include',
        body: JSON.stringify({
          pVch_no: voucher_no,
          P_TRANS_YEAR: trans_year,
          P_DIVISION_ID: division_id,
        }), // Send the parameter in the request body
      }
    );

    if (!response.ok) {
      throw new Error("Report generation failed!");
    }

    // Convert the response to a blob (PDF file)
    const blob = await response.blob();

    // Create a link to trigger the file download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Purchase_payable_${voucher_no}.pdf`; // Specify the file name for the download
    link.click(); // Trigger the download

    //   toggleModal();  // Close modal after success
  } catch (err) {
    //console.log(err.message);
    toast.error(err.message);
  } finally {
    //   setLoading(false);  // Ensure loading state is set to false after the process
  }
}

// THFMTRAN BLOCK FIEDL ITEM
export const thfmtranInitDataTemplate = {
  section: "",
  bill_no: "",
  bill_dt: "",
  voucher_dt: "",
  on_acc: "",
  memo_vchr: "",
  voucher_no: "",
  curr_code: "",
  exchang_rt: "",
  party_code: "",
  party_name: "",
  po_id: "",
  wo_no: "",
  po_cat: "",
  wo_amt: "",
  wo_bal_amt: "",
  reference: "",
  trans_year: "",
  voucher_id: "",
  gst_id: "",
  row_status: "",
  division_id: "",
  bill_id: "",
  party_gst_no: "",
  cons_ctrl_id: "",
  cons_ctrl_no: "",

  exp_work: "E",
  trans_amt: 0,
  trans_type: "P1",
  capital_flag: "N",
  pay_rec: 0,
  posted: "N",
  cancel: "N",
  gst_registered: "N",

  pur: "", // parameter key
  p_acc: "", // parameter key
};

// VALIDATE PARTY CODE
export async function validateParty(
  e,
  party_code,
  formStatus,
  user = {},
  formData,
  cb
) {
  if (["Insert", "Update"].includes(formStatus)) {
    e.preventDefault(); // Prevent default blur behavior

    const nextElement = e.relatedTarget; // The element getting focus after blur

    // If nextElement is an input field, trigger validation
    if (!nextElement || nextElement.tagName !== "INPUT") {
      return; // Replace with your validation logic
    }

    if (party_code === "") {
      toast.error("Party code cannot be null");
      e.target.focus(); // Stay on the field
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.VALIDATE_PURC_FROM_DATA
        }/validate?party_code=${party_code}&appFinYear=${
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
        party_code: "",
        party_name: "",
        party_gst_no: "",
        gst_registered: "",
      });
      console.error(error);
      e.target.focus(); // Keep focus on the field
    }
  }
}

// VALIDATE WO ORDER NO.
export async function validateWoNo(
  e,
  wo_no,
  formStatus,
  user = {},
  formData,
  cb
) {
  if (["Insert", "Update"].includes(formStatus)) {
    e.preventDefault();
    if (formData?.exp_work === "E") {
      return;
    }
    // if no value in wo_no
    if (!wo_no) {
      return;
    }

    const nextElement = e.relatedTarget;

    // If nextElement is an input field, trigger validation
    if (!nextElement || nextElement.tagName !== "INPUT") {
      return;
    }

    if (!formData?.party_code) {
      toast.error("Party Code cannnot be null");
      let partyField = document.getElementById("party_code");
      partyField.focus();
      return;
    }

    const { party_code } = formData;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.VALIDATE_PURC_FROM_DATA
        }/validate?wo_no=${wo_no}&appFinYear=${
          user?.global_fin_year
        }&appDivisionId=${user?.global_division_id}&f_party_code=${party_code}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (response.ok) {
        cb({ ...formData, ...data?.data });
      } else {
        throw new Error(data?.message || "Validation failed");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      cb({
        ...formData,
        po_cat: "",
        po_id: "",
        trans_type: "P0",
        wo_amt: 0,
        wo_bal_amt: 0,
      });
      console.error(error);
    }
  }
}

// TRANS AMOUNT CALCULATION
export const calculateTransAmt = (expDetailData) => {
  return expDetailData.reduce((acc, item) => {
    const amount = parseFloat(item.amount || 0); // Parse the amount or default to 0
    const dbCr = item.db_cr || "D"; // Default to 'D' (debit) if not set

    return dbCr === "C" ? acc - amount : acc + amount; // Subtract if credit, add if debit
  }, 0);
};

export function validateBillNo(e, formStatus) {
  if(!['Insert', 'Update'].includes(formStatus)){
    return
  }

  const billNo = e.target.value.trim(); // Trim whitespace

  if (billNo === ""){
    toast.error('Bill No. cannot be blank')
  e.target.focus();
  } 

  if (billNo.length > 16) {
    // Enforce 16-character limit
    toast.error("Bill No. cannot be greater than 16 characters");
    e.target.focus(); // Refocus the input field if validation fails
    return
  }
}

export function validateBillDate(e, formStatus) {
  if (formStatus !== "Insert" && formStatus !== "Update") {
    return; // Exit if the form is not in Insert or Update mode
  }
  const selectedDate = new Date(e.target.value); // User input date
  const today = new Date(); // Current date

  // Remove time part to compare only the date
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    toast.error("Bill Date cannot be greater than Current Date");
    e.target.value = ""; // Clear the invalid date
  }
}

export function validateVoucherDate(cb, e, formStatus) {
  if (formStatus !== "Insert" && formStatus !== "Update") {
    return; // Exit if the form is not in Insert or Update mode
  }
  if (!e.target.value) {
    toast.error("Voucher Date is blank, must be entered.");
    e.target.focus();
    return;
  }

  const selectedDate = new Date(e.target.value); // User input date
  const today = new Date(); // Current system date

  // Remove time part to compare only the date
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    toast.error("Voucher Date cannot be higher than the present date.");
    e.target.value = today.toISOString().split("T")[0]; // Reset to today's date
    e.target.focus();
  }

  // // Call additional functions if required
  // todo ask for this to sir this is not implemented
  // CheckDateinFinYear(e.target.value);
  // CheckOpenYearDate(e.target.value, "FM", "GL");

  // Set parameter if needed
  cb({ p_vch_dt: e.target.value });
}

export function validateExpWork(e, formStatus, cb) {
  if (formStatus == "Insert" || formStatus == "Update") {
    //console.log("expbill", e.target.value);
    cb((prev) => ({ ...prev, trans_type: e.target.value == "E" ? P0 : "" }));
  }
}

// #### *************************************** TDFMTRAN **************************************** ####
// HELP LIST HEADER DATA

// ACC_NO
export const accNoHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Description", key: "acc_desc" },
];

// COST-CENTER
export const costCentreHelpListHeader = [
  { label: "Code", key: "code" },
  { label: "Prefix", key: "prefix" },
];

// THFMTRAN DETAIL TABLE HEADER
export const expenseDetailHeader = [
  { label: "Narration", key: "constitution", width: "30%" },
  { label: "Service Acctng Code", key: "desig_relation", width: "8%" },
  { label: "Acc. No.", key: "title", width: "10%", isHelpExist: true },
  { label: "C.C.", key: "name", width: "8%", isHelpExist: true },
  { label: "Purpose", key: "qualification", width: "12%" },
  { label: "Amount", key: "dob", width: "10%" },
  { label: "D/C", key: "dom", width: "3%" },
];

// TDFMTRAN FIELD ITEM
export const tdfmtranInitDataTemplate = {
  row_id: Date.now(),
  remarks: "",
  acc_no: "",
  bill_no: "",
  bill_dt: "",
  cost: "",
  amount: "",
  net_amt: "",
  acc_desc: "",
  cost_desc: "",
  old_amount: "",
  db_cr: "",
  cost_centr: "",
  emp_cd: "",
  emp_name: "",
  pur_code: "",
  pay_rec: "",
  posted: "",
  flag: "N",
  srl_no: 0,
  voucher_id: "",
  row_status: "",
  tds_cr_amt: "",
  tds_perc: "",
  tds_amt: "",
  tel_no: "",
  ref_obj_qty: "",
  tds_sur_perc: "",
  tds_sur_amt: "",
  tds_cess_perc: "",
  tds_cess_amt: "",
  ser_cr_amt: "",
  ser_party_cd: "",
  party_desc: "",
  register_type: "",
  srl_no: "",
  credit_date: "",
  tds_hsc_perc: "",
  tds_hsc_amt: "",
  sa_code: "",
  service_cat: "",
  ser_flg: "",
  cc_purpose: "N",
  emp_rel: "N",
  p_acc: "",
  tran_type: "",
};

export const expenseFormControlData = {
  party_amt: "",
  dest_type: "",
  di_formstatus: "",
  curryear: "",
  vch_stat: "",
  userid: "",
};

// GST CANVAS BLOCK FIELD ITEM
export const gstCanvasFormDataTemplate = {
  bill_date: "",
  bill_no: "",
  party_code: "",
  disp_party: "",
  itc_ref: "",
};

export const contraInitDataTemplate = {
  acc_no: "",
  amount: 0,
  bill_dt: "",
  bill_no: "",
  cost_centr: "",
  db_cr: "C",
  flag: "Y",
  pay_rec: 0,
  pur_code: "",
  remarks: "",
  srl_no: 0,
  vch_dt: "",
  vch_no: "",
  voucher_id: "",
  tran_type: "",
};

// ##-- When user Enter or Click on Insert
// implement user-insert
function userInsert() {
  // send global_user_id, to get section_id
  //get data for curr_code and exchang_rate field
  // then fill current system date into voucher_dt
  // ## then show this confirm prompt
  //`Please make sure that Bill has been captured in ITC form else auto entries will not be created.
  //  You shall not be able to proceed. Are you sure to continue ?
}

export function isEmptyField(event, formStatus) {
  if (formStatus !== "Insert" && formStatus !== "Update") {
    return;
  }

  let name, value;
  const nextElement = event.relatedTarget; // The element getting focus after blur
  // if (!nextElement || (nextElement.tagName !== "INPUT" && nextElement.tagName !== "SELECT"))return;

  if (event.target) {
    // For standard inputs & selects
    name = event.target.name;
    value = event.target.value;
  } else if (event.name) {
    // For custom Select components that pass value directly
    name = event.name;
    value = event.value;
  }

  if (!value || value.trim() === "") {
    toast.error(`${name} cannot be empty`);

    // Focus back to the field
    if (event.target) {
      event.target.focus();
    }
  }
}

// REMARKS AUTOMIZED LOGIC
export function whenValidateNarr(e, data, parameterData) {
  let updatedParameter = { ...parameterData };

  if (
    updatedParameter.common_narr === "" ||
    updatedParameter.common_narr === null
  ) {
    if (confirm("Do You Want Common Narration?")) {
      updatedParameter.common_narr = "Y";
    } else {
      updatedParameter.common_narr = "N";
    }
  }

  updatedParameter.narr =
    updatedParameter.common_narr === "Y" ? data.remarks : "";

  return updatedParameter;
}

// ACC NO VALIDATION
export async function validateAccNo(
  e,
  accNo,
  formStatus,
  user = {},
  formData,
  headData,
  cb,
  rowIndex
) {
  if (!["Insert", "Update"].includes(formStatus)) return;

  e.preventDefault();
  const nextElement = e.relatedTarget; // The element getting focus after blur

  // If nextElement is an input field, trigger validation
  if (!nextElement || nextElement.tagName !== "INPUT") {
    return; // Replace with your validation logic
  }

  if (!accNo?.trim()) {
    if (!headData?.party_code) {
      toast.error("Party Code cannot be null");
      document.getElementById("party_code")?.focus();
      return;
    }
    toast.error("Acc No cannot be null");
    e.target?.focus();
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.VALIDATE_PURC_FROM_DATA
      }/validate?acc_no=${accNo}&appFinYear=${
        user?.global_fin_year
      }&appDivisionId=${user?.global_division_id}&f_party_code=${
        headData.party_code
      }`,
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Validation failed");
    }

    // ✅ Destructure `data.data` safely
    const { acc_no, acc_desc, cc_purpose, emp_rel, p_acc } = data?.data || {};

    // ✅ Use functional state update to avoid stale state issues
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        acc_no: acc_no || "",
        acc_desc: acc_desc || "",
        cc_purpose: cc_purpose || "N",
        emp_rel: emp_rel || "N",
        p_acc: p_acc || "",
      };
      return newData;
    });
  } catch (error) {
    toast.error(error.message || "An error occurred");

    // Reset the row data if validation fails
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        acc_no: "",
        acc_desc: "",
        cc_purpose: "N",
        emp_rel: "N",
        p_acc: "",
      };
      return newData;
    });

    console.error("Validation Error:", error);
  }
}

// COST CENTRE VALIDATION
export async function validateCostCentr(
  e,
  cost,
  formStatus,
  formDetailData,
  cb,
  rowIndex
) {
  if (!["Insert", "Update"].includes(formStatus)) return;

  e.preventDefault();
  const { acc_no, cc_purpose } = formDetailData[rowIndex];
  if (cc_purpose === "Y" && cost === "") {
    toast.error(
      `Cost Centre cannot be blank...Please use double click to open Help`
    );
    e.target?.focus();
    return;
  }

  if (cc_purpose === "N") {
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        cost: "",
        cost_centr: "",
        cost_desc: "",
      };
      return newData;
    });
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.VALIDATE_PURC_FROM_DATA
      }/validate?cost=${cost}&f_accNo=${acc_no}`,
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Validation failed");
    }
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], ...data.data };
      return newData;
    });
  } catch (error) {
    toast.error(error.message || "An error occurred");

    // Reset the row data if validation fails
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        cost: "",
        cost_desc: "",
        cost_centr: "",
        cost_pre: "",
      };
      return newData;
    });

    e.target.focus();
    // console.error('Validation Error:', error);
  }
}

// VALIDATE PURPOSE FIELD
export async function validatePurCode(
  e,
  pur_code,
  formStatus,
  formDetailData,
  cb,
  rowIndex
) {
  if (!["Insert", "Update"].includes(formStatus)) return;

  e.preventDefault();
  const { acc_no, cc_purpose } = formDetailData[rowIndex];
  if (cc_purpose === "Y" && pur_code === "") {
    toast.error(`Purpose cannot be blank...Please Check`);
    e.target?.focus();
    return;
  }

  if (cc_purpose === "N") {
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], pur_code: "", pur: "" };
      return newData;
    });
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.VALIDATE_PURC_FROM_DATA
      }/validate?pur_code=${pur_code}&f_accNo=${acc_no}`,
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Validation failed");
    }
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], ...data.data };
      return newData;
    });
  } catch (error) {
    toast.error(error.message || "An error occurred");
    // Reset the row data if validation fails
    cb((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], pur_code: "", pur: "" };
      return newData;
    });

    e.target.focus();
    // console.error('Validation Error:', error);
  }
}

//DBCR FIELD
export const handleDbCrChange = (value, currentDbCr) => {
  // const numericValue = parseFloat(value);
  const numericValue = value;

  if (isNaN(numericValue)) {
    return { amount: 0, db_cr: "" }; // Edge case: non-numeric input
  }

  if (numericValue === 0) {
    return { amount: 0, db_cr: "" }; // Preserve "0" without resetting
  }

  if (numericValue < 0) {
    return { amount: Math.abs(numericValue), db_cr: "C" };
  }

  return { amount: numericValue, db_cr: "D" };
};

export const validateAmount = (e, data) => {
  const { acc_no, amount } = data;
  if (acc_no && amount == "") {
    toast.error("Bill Amount cannot be blank");
    if (e.target) {
      e.target.focus();
    }
  }
};
// CHECK IF CHECK TOTAL WILL CHECK THE DR AND CR IS EQURAL OR NOT
export const checkTotal = (tdfmtranData) => {
  if (!Array.isArray(tdfmtranData) || tdfmtranData.length === 0) {
    return false; // If data is not an array or is empty, return false
  }

  let nDB = 0; // Sum of "D" (Debit) amounts
  let nCR = 0; // Sum of "C" (Credit) amounts

  tdfmtranData.forEach((entry) => {
    if (entry?.db_cr === "D") {
      nDB += parseFloat(entry.amount) || 0;
    } else if (entry.db_cr === "C") {
      nCR += parseFloat(entry.amount) || 0;
    }
  });

  return nDB === nCR; // Returns true if balanced, false otherwise
};

// PROC INSERT COTRA ENTRY
export const makeProcInsertDataEntry = (
  formData = {},
  formDetailData = [],
  userData = {},
  controlformData = {}
) => {
  const { global_fin_year: trans_year, global_division_id: division_id } =
    userData;
  const { party_amt } = controlformData;
  let isValid = false;

  const {
    party_code,
    bill_no,
    bill_dt,
    pay_rec,
    trans_amt,
    voucher_dt,
    trans_type,
  } = formData;

  if (formDetailData.length === 0) {
    toast.error("No details found in the form detail data");
    return { isValid, contra: {} };
  }

  // Check if party_amt is valid
  if (party_amt <= 0) {
    toast.error("Voucher Amount should be Debit");
    return { isValid, contra: {} };
  }

  // Ensure required fields exist
  if (!party_code || !voucher_dt || !trans_year) {
    toast.error("Please check all the required fields in Expense voucher Head");
    return { isValid, contra: {} };
  }

  // Calculate net amount (similar to your SQL logic)
  let totalAmount = formDetailData.reduce((sum, item) => {
    let amount = parseFloat(item.amount) || 0; // Ensure item.amount is a number
    return sum + (item.db_cr === "D" ? amount : -1 * amount);
  }, 0);

  // Selecting the last detail row for cost center & purchase code
  const { cost_centr, pur_code } = formDetailData[formDetailData.length - 1];

  // Creating the proc insert data for Contra entry
  let procInsertData = {
    ...contraInitDataTemplate,
    pay_rec,
    bill_no,
    bill_dt,
    cost_centr,
    pur_code,
    amount: totalAmount,
    acc_no: party_code,
    vch_dt: voucher_dt,
    div_id: division_id, // Fixed
    tran_type: trans_type,
    tran_year: trans_year, // Fixed
  };

  return { isValid: true, contra: procInsertData, party_amt: totalAmount };
};

export const createSearchPayloadForExpSpecificSearch = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    voucher_no: "voucher_no",
    voucher_dt: "voucher_dt",
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


export const generateTDSEntries = async (
  { thfmtranData = {}, tdfmtranData = {}, srl_no, detailData, formStatus, updateFormData },
  cb
) => {
  const headerFields = {
    "Party Code": thfmtranData.party_code,
    "Bill Number": thfmtranData.bill_no,
    "Bill Date": thfmtranData.bill_dt,
    "Voucher Date": thfmtranData.voucher_dt,
  };

  const detailFields = {
    "Cost Centre": tdfmtranData.cost_centr,
    "Cost": tdfmtranData.cost,
    "Purchase Code": tdfmtranData.pur_code,
    "Amount": tdfmtranData.amount,
    "Account Number": tdfmtranData.acc_no,
    "Payment/Receipt": thfmtranData.pay_rec || '0',
  };

  const findMissingFields = (fields) =>
    Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([name]) => name);

  const missingHeader = findMissingFields(headerFields);
  const missingDetail = findMissingFields(detailFields);

  if (missingHeader.length) {
    toast.error(`Please fill the following feild in Expense Header: ${missingHeader.join(", ")}`);
    return;
  }

  if (missingDetail.length) {
    toast.error(`Please fill the following feild in Expense Detail: ${missingDetail.join(", ")}`);
    return;
  }

  const payload = {
    voucher_id: thfmtranData.voucher_id || "",
    voucher_dt: thfmtranData.voucher_dt,
    bill_no: thfmtranData.bill_no,
    bill_dt: thfmtranData.bill_dt,
    srl_no,
    party_code: thfmtranData.party_code,
    amount: tdfmtranData.amount,
    acc_no: tdfmtranData.acc_no,
    pay_rec: tdfmtranData.pay_rec,
    pur_code: tdfmtranData.pur_code,
    cost_centr: tdfmtranData.cost_centr,
    cost: tdfmtranData.cost,
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PURC_TDS_ENTRIES}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to fetch TDS entries");
    }

    const tdsData = (result?.data || []).map((item) => ({
      ...item,
      row_id: `${item.srl_no}${Date.now()}${item.srl_no}`,
      entry_type: "TDS",
    }));

    if (typeof cb === "function") {

      cb((prevNarrationData = []) => {
        const nonTdsEntries = prevNarrationData.filter((item) => {
          
          const remarks = item?.remarks?.toLowerCase() || "";
          const isTdsLike =
            item?.entry_type === "TDS" ||
            remarks.startsWith("tax deducted at source") ||
            remarks.startsWith("tds deduction for");
          return !isTdsLike;
        });
         

        return [...nonTdsEntries, ...tdsData];
      });
    }
    toast.success('TDS Entries Created')
  } catch (error) {
    toast.error(error.message || "Issue in fetching TDS entries");
  }
};




// CREATE GST ENTRIES
export const genCreateGSTEntries = async (
  { gstFormData, division_id, setThfmTranData, setTdfmTranData, setFormControlData},
  cb
) => {
  const { v_code2, v_name2, bill_no, bill_date } = gstFormData || {};
  if(!v_code2 || !bill_date || !bill_no){
    toast.error(`Please fill the itc number from Hellp List to Create Gst Entries`)
    return
  }

  const queryParams = new URLSearchParams({
    createGstWithItc: v_code2,
    divisionId: division_id,
    billDt: bill_date,
    billNo: bill_no,
  });

  const url = `${import.meta.env.VITE_BASE_API_URL}${
    APP_PROD_API.CREATE_GST_ENTRIES
  }?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message);
    }

    let gstEntriesData = result?.data;
    let { gst_no, party_amt, trans_amt, whether_gst_registered_dlr, gst_id } = result.expenseVoucher;

    setThfmTranData((prev) => {
      return {
        ...prev,
        party_code: v_code2,
        party_name: v_name2,
        gst_registered: whether_gst_registered_dlr,
        party_gst_no: gst_no,
        trans_amt,
        bill_dt:bill_date,
        bill_no:bill_no,
        gst_id
      };
    });
    setFormControlData(prev=>({...prev, party_amt}))

    setTdfmTranData((prev) => [...gstEntriesData])

    if (cb && typeof cb === "function") {
      cb();
    }
  } catch (error) {
    toast.error(error.message || "Issue in fetching GST entries");
  }
};
