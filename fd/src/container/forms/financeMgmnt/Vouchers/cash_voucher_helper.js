import { DateTime } from "luxon";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import _ from "lodash";

// Added
export const DISABLED_OPTIONS = ["Insert", "Query", "Update"];

export const checkDateNotGreaterThanToday = (key, value) => {
  let curr = DateTime.fromISO(value);
  const currentDate = DateTime.now();
  if (curr > currentDate) {
    throw new Error(`The provided '${key}' is greater than the current date.`);
  }
  return true;
};



export const checkDateEqToToday = (key, value) => {
  let curr = DateTime.fromISO(value);
  const currentDate = DateTime.now();
  if (curr.hasSame(currentDate, "day")) {
    return true;
  }
  throw new Error(`The provided '${key}' is not equal to the current date.`);
};

export const isValidDateForFinancialYear = (key, dateStr, globalFinYear) => {
  const inputDate = DateTime.fromISO(dateStr);
  if (!inputDate.isValid) {
    throw new Error(`The provided '${key}' is not a valid date.`);
  }

  const finYearStart = DateTime.fromObject({
    year: parseInt(globalFinYear),
    month: 4,
    day: 1,
  });
  const finYearEnd = finYearStart.plus({ years: 1 }).minus({ days: 1 });

  // Check if date is within the financial year
  if (!(inputDate >= finYearStart && inputDate <= finYearEnd)) {
    throw new Error(`The provided '${key}' is not within the financial year.`);
  }

  // If financial year is current, ensure date is not in the future
  const today = DateTime.now();
  const currentFinYearStart =
    today.month >= 4
      ? DateTime.fromObject({ year: today.year, month: 4, day: 1 })
      : DateTime.fromObject({ year: today.year - 1, month: 4, day: 1 });

  if (globalFinYear == currentFinYearStart.year && inputDate > today) {
    throw new Error(`The provided '${key}' cannot be greater than today.`);
  }

  return true;
};

// export const runCashVoucherSubmitValidations = (masterData, narrationData) => {

//   // field level validations
//   let masterDataKeys = [
//     "division",
//     "type_user",
//     // "onAccount",
//     // "forQuery",
//     "section",
//     "reference_dt",
//     "cur_code",
//     "exchange_rate",
//     // "voucher_dt",
//     // "ref",
//     // "bill_dt",
//   ];
//   let narrationDataKeys = [
//     // "naration",
//     "acc_no",
//     // "bill_no",
//     // "bill_dt",
//     // "cost_ctr",
//     "amount",
//     "db_cr",
//     // "purpose",
//     // "emp_cd",
//     // "emp_name",
//     // "total_Amt",
//     // "ref_cheque_no",
//     // "quantity",
//     // "tds_cr_amt",
//     // "service_tax",
//     // "tds",
//     // "tds_amt",
//     // "sur",
//     // "sur_amt",
//     // "cess",
//     // "cess_amt",
//     // "acc_desc",
//     // "cost_center",
//     // "party_cd",
//     // "party_desc",
//     // "ser_tax_flag",
//     // "ser_tax_credit_amt",
//   ];

//   const allKeysPresent = masterDataKeys.every((key) => key in masterData);
//   const allValuesValid = masterDataKeys.every((key) => {
//     const value = masterData[key];
//     return value !== undefined && value !== null && value !== "";
//   });

//   if (!allValuesValid || !allKeysPresent) {
//     throw new Error("Please fill all the master data details");
//   }

//   _.forEach(narrationData, (data) => {
//     const allNarrationKeysPresent = narrationDataKeys.every(
//       (key) => key in data
//     );
//     const allNarrationValuesValid = narrationDataKeys.every((key) => {
//       const value = data[key];
//       return value !== undefined && value !== null && value !== "";
//     });
//     if (!allNarrationValuesValid || !allNarrationKeysPresent) {
//       throw new Error("Please fill all the narration data details");
//     }
//   });
// };


export const runCashVoucherSubmitValidations = (masterData, narrationData) => {
  // Define fields and labels for master section
  const masterFieldLabels = {
    division: "Division",
    type_user: "User type",
    section: "Section",
    reference_dt: "Reference Date",
    cur_code: "Currency Code",
    exchange_rate: "Exchange Rate",
  };

  // Define fields and labels for narration section
  const narrationFieldLabels = {
    acc_no: "Account No",
    amount: "Amount",
    db_cr: "Debit/Credit",
  };

  // ✅ Check master data
  const invalidMasterFields = Object.keys(masterFieldLabels).filter((key) => {
    const value = masterData[key];
    return value === undefined || value === null || value === "";
  });

  if (invalidMasterFields.length > 0) {
    const fieldNames = invalidMasterFields.map((key) => masterFieldLabels[key]).join(", ");
    throw new Error(`Please fill the following master data fields: ${fieldNames}`);
  }

  // ✅ Check narration data (array of objects)
  narrationData.forEach((data, index) => {
    const invalidNarrationFields = Object.keys(narrationFieldLabels).filter((key) => {
      const value = data[key];
      return value === undefined || value === null || value === "";
    });

    if (invalidNarrationFields.length > 0) {
      const fieldNames = invalidNarrationFields.map((key) => narrationFieldLabels[key]).join(", ");
      throw new Error(`Please fill the following row fields (Row ${index + 1}): ${fieldNames}`);
    }
  });
};


export const createSearchPayload = (masterData, narrationData) => {
  let payload = {};
  let masterKeys = {
    reference_dt: "ref_date",
    reference_no: "ref_no",
    voucher_no: "voucher_no",
    posted:'posted',
  };
  let narrationKeys = ["acc_no"];

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  if (hasMasterKeys) {
    Object.keys(masterKeys).forEach((key) => {
      if (masterData[key]) {
        payload[masterKeys[`${key}`]] = masterData[key];
      }
    });
  }

  if (_.isArray(narrationData) && narrationData?.length > 0) {
    let narrationRow = narrationData?.[0];
    if (narrationRow?.acc_no) {
      payload["acc_no"] = narrationRow.acc_no;
    }
  }

  return payload;
};

export const fetchNarrationData = async (cbFn, user) => {

  const {global_division_id, global_fin_year} = user
  try {
    const data = await fetchAppData(
      `${APP_PROD_API.GET_BASE_DATA_CASH_VOUCHER_NARRATION}?division_id=${global_division_id}&trans_year=${global_fin_year}`
    );
    cbFn(data);
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while fetching data, try again"
    );
  }
};

export const triggerFetchBillMeta = async (
  { acc_no, division_id = 1 },
  cbFn
) => {
  try {
    const data = await fetchAppData(
      `${APP_PROD_API.GET_CASH_VOUCHER_BILL_META}?acc_no=${acc_no}&division_id=${division_id}`
    );
    cbFn(data);
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while fetching data, try again"
    );
  }
};

export const triggerFetchCurrencyData = async ({ section }) => {
  try {
    const data = await fetchAppData(
      `${APP_PROD_API.GET_CASH_VOUCHER_BAL_META}?section=${section}`
    );
    // cbFn(data);
    return data;
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while fetching data, try again"
    );
  }
};

export const triggerFetchITCRefData = async () => {
  try {
    const data = await fetchAppData(
      `${APP_PROD_API.GET_CASH_VOUCHER_ITC_META}`
    );
    // cbFn(data);
    return data;
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while fetching data, try again"
    );
  }
};

// TEMP Data Block
export const tempInitDataTemplate = {
  itc_ref: "",
  disp_party: "",
  party_code: "",
  bill_no: "",
  bill_dt: "",
};

// THFMCASH Data Block
export const thfmcashInitDataTempate = {
  fund_trns_vch_id: "",
  division_id: "",
  pay_rec: 0,
  ref_no: "",
  memo_vchr: "",
  on_acc: "N",
  query_auth: "",
  section: "",
  trans_year: "",
  ref_date: "",
  curr_code: "",
  exchange_rt: "",
  reference: "",
  bill_dt: "",
  trans_amt: 0,
  trans_type: "",
  voucher_no: "",
  voucher_dt: "",
  posted: "",
  cancel: "",
  row_status: "",
  ref_id: "",
  gst_id: "",
  prev_year_chln: "",
  inter_div_no: "",
};

// TDFMCASH Data Block
export const tdfmcashInitDataTemplate = {
  loan_id: "",
  remarks: "",
  acc_no: "",
  bill_no: "",
  bill_dt: "",
  cost: "",
  amount: "",
  chq_no: "",
  chq_dt: "",
  db_cr: "",
  amt_db: "",
  amt_cr: "",
  emp_cd: "",
  pur_desc: "",
  pur_code: "",
  tel_no: "",
  ref_obj_qty: "",
  acc_name: "",
  cost_desc: "",
  cost_center: "",
  emp_name: "",
  tds_cr_amt: "",
  tds_perc: "",
  tds_amt: "",
  tds_sur_perc: "",
  tds_sur_amt: "",
  tds_cess_perc: "",
  tds_cess_amt: "",
  pay_rec: "",
  posted: "",
  flag: "",
  srl_no: "",
  ref_id: "",
  row_status: "",
  ser_party_cd: "",
  party_desc: "",
  ser_flg: "N",
  ser_cr_amt: "",
  include_in_servtax: "N",
  emp_relate: "N", // self made for handling field of emp_code this should be deleted before insert
  cc_purpose: "N", // self made for handling field of emp_code this should be deleted before insert
};

// TDFMMRIR Data Block
export const tdfmmrirInitDataTemplate = {
  mrir_no: "",
  mrir_dt: "",
  bill_no: "",
  bill_dt: "",
  trans_year: "",
  ref_id: "",
  voucher_id: "",
  srl_no: "",
};

// TOPMLOAN Data Block
export const topmloanInitDataTemplate = {
  emp_cd: "",
  emp_name: "",
  loan_code: "",
  loan_acc_no: "",
  principal: "",
  installment: "",
  int_perc: "",
  int_amt: "",
  balance: "",
  start_month: "",
  loan_id: "",
};

// Control Data Block
export const formControlInitDataTemplate = {
  t: "",
  tot_amt_db: "",
  tot_amt_cr: "",
  vch_stat: "",
  curr_bal: "",
  curr_db_cr: "",
  di_formstatus: "",
  curryear: "",
  userid: "",
};

// --------------- THFMCAHSE ------------------

//CALCULATE TRANS_AMT

export function calcTransAmt(thfmCashData, formControlData) {
  let { tot_amt_db, tot_amt_cr } = formControlData;
  let { trans_amt, pay_rec } = thfmCashData;
  if (Number(pay_rec) === 0) {
    trans_amt = Number(tot_amt_db || 0) - Number(tot_amt_cr || 0);
  } else {
    trans_amt = Number(tot_amt_cr || 0) - Number(tot_amt_db || 0);
  }

  return trans_amt;
}

export async function validateFieldAccNo(
  e,
  formData,
  formStatus,
  userDivision,
  globalFinYr,
  handleChang,
  index
) {
  e.preventDefault();
  const nextElement = e.relatedTarget; // The element getting focus after blur

  // If nextElement is an input field, trigger validation
  if (!nextElement || nextElement.tagName !== "INPUT") {
    return// Replace with your validation logic
  }


  if (formStatus !== "Insert") {
    return;
  }
  const { acc_no } = formData;

  if (!acc_no) {
    toast.error("Account Code Field cannot be Blank, Please Enter.");
    e.target.focus();
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_FORM_DATA_CASH_VOUCHER
      }?acc_no=${acc_no}&appFinYear=${globalFinYr}&appDivisionId=${userDivision}`,
      { method: "GET", credentials: "include" }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    // Handle response validation
    if (responseData.valid) {
      if (responseData.emp_relate === "Y") {
        handleChang("emp_relate", "Y", index);
      }
      if (responseData.cc_purpose === "Y") {
        //console.log("mutate cc_purpose");
        handleChang("cc_purpose", "Y", index);
      }
    } else {
      toast.error(responseData.message || "Invalid account number.");
      e.target.focus();
      return;
    }
  } catch (error) {
    console.error("Error validating account number:", error);
    toast.error("Failed to validate account number. Please try again.");
  }
}

export function validateCostCenter(e, formStatus, cc_purpose, value) {
  if (formStatus !== "Insert") {
    return;
  }
  if (cc_purpose === "Y" && !value) {
    toast.error("Cost Center is required."); // ✅ Added error message
    setTimeout(() => e.target.focus(), 0); // ✅ Ensures focus is restored
    return;
  }
}

// Added - v2
export const transformApiToFormData = (data, narrationData = []) => {
  let dbAmt = _.filter(
    narrationData,
    (e) => e.db_cr && e.db_cr === "D" && !isNaN(Number(e.amount))
  ).reduce((prev, curr) => prev + Math.abs(Number(curr.amount)), 0);

  let crAmt = _.filter(
    narrationData,
    (e) => e.db_cr && e.db_cr === "C" && !isNaN(Number(e.amount))
  ).reduce((prev, curr) => prev + Math.abs(Number(curr.amount)), 0);

  let latestFormCtrlData = {
    tot_amt_db: dbAmt,
    tot_amt_cr: crAmt,
  };

  let getTransAmt = calcTransAmt(
    { pay_rec: 0, trans_amt: data?.trans_amt || 0 },
    latestFormCtrlData
  );

  return {
    ...data,
    exchange_rate: parseFloat(data.exchange_rate).toFixed(2),
    bill_dt: DateTime.fromISO(data.bill_dt).toFormat("yyyy-MM-dd"),
    reference_dt: DateTime.fromISO(data.reference_dt).toFormat("yyyy-MM-dd"),
    voucher_dt: DateTime.fromISO(data.voucher_dt).toFormat("yyyy-MM-dd"), 
    debt_amt: Math.abs(dbAmt),
    crdt_amt: Math.abs(crAmt),
    trans_amt: Math.abs(getTransAmt),
    // voucher_dt: DateTime.fromISO(data.voucher_dt).toFormat("yyyy-MM-dd"),
  };
};

export const transformApiToNarrationFormData = (data) => {
  return data?.map((item) => {
    return {
      ...item,
      bill_dt: DateTime.fromISO(item.bill_dt).toFormat("yyyy-MM-dd"),
      purpose: item?.purpose?.trim(),
    };
  });
};


// ON CLICK IN PRINT BUTTON EXPENSE REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getCashVchReport(cashVchData, formStatus){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {voucher_no, ref_id, reference_no, division_id, trans_year} = cashVchData;
  
  if (!voucher_no || !division_id, !trans_year, !reference_no) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
  }
  try {
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/generate-report/exp_vch`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({ 
          pVch_no: reference_no,
          P_TRANS_YEAR:trans_year,
          P_DIVISION_ID:division_id,
      }), // Send the parameter in the request body
      credentials:'include',
    });

    if (!response.ok) {
      throw new Error('Report generation failed!');
    }

    // Convert the response to a blob (PDF file)
    const blob = await response.blob();

    // Create a link to trigger the file download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cash_vch_report.pdf';  // Specify the file name for the download
    link.click();  // Trigger the download

  //   toggleModal();  // Close modal after success
  } catch (err) {
    //console.log(err.message);
    toast.error(err.message)
  } finally {
  //   setLoading(false);  // Ensure loading state is set to false after the process
  }

}


// DBCR FIELD
export const handleCashDbCrChange = (value, currentDbCr, pay_rec) => {
  // const numericValue = parseFloat(value);
  const numericValue = value;

  //console.log('checking payrec value', pay_rec)

  if(currentDbCr){
    return { amount: numericValue, db_cr: currentDbCr };
  }
  let dbCrVal = pay_rec == '0'? 'D':'C'

  if (isNaN(numericValue)) {
    return { amount: 0, db_cr: "" }; // Edge case: non-numeric input
  }

  if (numericValue === 0) {
    return { amount: 0, db_cr: "" }; // Preserve "0" without resetting
  }

  // if (numericValue < 0) {
  //   return { amount: Math.abs(numericValue), db_cr: "C" };
  // }



  return { amount: numericValue, db_cr: dbCrVal };
};
