import { DateTime } from "luxon";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import _ from "lodash";
import { validateForm } from "../../../../utils/fn";

export const bankVoucherInitialData = {
  inter_div_no: "",
  fund_trans_vch_id: "",
  division_id: "",
  pay_rec: "0",
  on_acc: "N",
  memo_vchr: "N",
  bank_trnf_flg: "N",
  query_auth: "",
  section: "",
  voucher_no: "",
  voucher_dt: "",
  ecs_flag: "N",
  computrized_chq: "N",
  chq_acc_payee: "N",
  ref_no: "",
  ref_date: "",
  curr_code: "",
  exchange_rt: "",
  dep_slip: "",
  dep_slip_dt: "",
  chq_no: "",
  not_exceed_flg: "N",
  chq_dt: "",
  acct_type: "",
  po_no: "",
  po_id: "",
  bank_name: "",
  trans_amt: "",
  reference: "",
  cons_ctrl_no: "",
  cons_ctrl_Id: "",
  capital_flag: "N",
  bill_dt: "",
  trans_type: "",
  trans_year: "",
  voucher_id: "",
  posted: "",
  row_status: "",
  cancel: "",
  prev_year_chln: "",
  max_voucher_dt: "",
  enq_no: "",
  sal_enq_id: "",
};

export const bankVoucherDetailsHeaders = [
  { label: "Narration", width: "20%" },
  { label: "Account No.", width: "8%", isHelpExist: true },
  // { label: "Prof inv. No", width: "10%", isHelpExist: true },
  // { label: "Prof inv. Date", width: "5%" },
  { label: "Bill No.", width: "10%", isHelpExist: true },
  { label: "Bill date", width: "5%" },
  { label: "Cost Center", width: "5%", isHelpExist: true },
  { label: "Purpose", width: "20%", isHelpExist: true},
  { label: "Amount", width: "10%", required:true },
  { label: "D/C", width: "3%" },
  { label: "", width: "4%" },
];

export const bankVoucherDetailsData = {
  id: 1,
  loan_id: "",
  remarks: "",
  acc_no: "",
  prof_no: "",
  prof_dt: "",
  bill_no: "",
  bill_dt: "",
  cost: "",
  amount: "",
  include_in_servtax: "N",
  net_amt: "",
  bank_grn_no: "",
  bank_grn_dt: "",
  chq_no: "",
  chq_dt: "",
  deposit_slip: "",
  deposit_slip_dt: "",
  chq_in_favour: "",
  emp_cd: "",
  cons_ctrl_no: "",
  cons_ctrl_id: "",
  acc_desc: "",
  cost_desc: "",
  pur_desc: "",
  pur_code: "",
  tel_no: "",
  ref_obj_qty: "",
  db_cr: "",
  pb_mrir: "",
  pb_ld_retn: "",
  cost_center: "",
  emp_name: "",
  tds_debit_entry: "N",
  tds_cr_amt: "",
  tds_perc: "",
  tds_amt: "",
  tds_sur_perc: "",
  tds_sur_amt: "",
  tds_cess_perc: "",
  tds_cess_amt: "",
  tds_hsc_perc: "",
  tds_hsc_amt: "",
  pay_rec: "",
  posted: "",
  old_vouch_amt: "",
  flag: "",
  srl_no: "",
  voucher_id: "",
  ser_party_cd: "",
  party_desc: "",
  ser_flg: "N",
  ser_cr_amt: "",
  row_status: "",
};

// bank code help list header
export const bankHelpListHeader = [
  { label: "Bank Code", key: "acc_no" },
  { label: "Bank Name", key: "bank_name" },
];

// MRIR
export const MRIRHeader = [
  { label: "MRIR Number", width: "70%" },
  { label: "MRIR date", width: "10%" },
];

export const bankVoucherMRIRInitData = {
  mrir_no: "",
  mrir_dt: "",
  trans_type: "",
  bill_no: "",
  bill_dt: "",
  ref_id: "",
  voucher_id: "",
  srl_no: "",
};

//  LOAN
export const bankVoucherLoanInitData = {
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

//  RETENSION
export const bankVoucherRetensioInitData = {
  voucher_id: "",
  party_acc: "",
  party_acc_desc: "",
  bill_no: "",
  bill_date: "",
  ld_amount: "",
  ld_amt_db_cr: "",
  retention_amount: "",
  ret_amt_db_cr: "",
  payment_receipt: "",
  remarks: "",
  pb_ld_main: "",
  gst: "",
  gst_tds: "",
  pbg: "",
  gst_db_cr: "",
  gst_tds_db_cr: "",
  pbg_db_cr: "",
};
//   CONTROL
export const bankVoucherControlInitData = {
  t: "",
  tot: "",
  change_in_bill_details: "",
  di_formstatus: "",
  curryear: "",
  vch_stat: "",
  userid: "",
};

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

export const runBankVoucherSubmitValidations = (masterData, narrationData) => {
  // field level validations
  let masterDataKeys = [
    "division_id",
    "pay_rec",
    // "onAccount",
    // "forQuery",
    "section",
    "voucher_dt",
    "curr_code",
    "exchang_rt",
    "acct_type",
    "trans_type",
    // "voucher_dt",
    // "ref",
    // "bill_dt",
  ];
  let narrationDataKeys = [
    // "naration",
    "acc_no",
    // "bill_no",
    // "bill_dt",
    // "cost_ctr",
    "amount",
    "db_cr",
    // "purpose",
    // "emp_cd",
    // "emp_name",
    // "total_Amt",
    // "ref_cheque_no",
    // "quantity",
    // "tds_cr_amt",
    // "service_tax",
    // "tds",
    // "tds_amt",
    // "sur",
    // "sur_amt",
    // "cess",
    // "cess_amt",
    // "acc_desc",
    // "cost_center",
    // "party_cd",
    // "party_desc",
    // "ser_tax_flag",
    // "ser_tax_credit_amt",
  ];

  const allKeysPresent = masterDataKeys.every((key) => key in masterData);
  const allValuesValid = masterDataKeys.every((key) => {
    const value = masterData[key];
    return value !== undefined && value !== null && value !== "";
  });

  if (!allValuesValid || !allKeysPresent) {
    throw new Error("Please fill all the master data details");
  }

  _.forEach(narrationData, (data) => {
    const allNarrationKeysPresent = narrationDataKeys.every(
      (key) => key in data
    );
    const allNarrationValuesValid = narrationDataKeys.every((key) => {
      const value = data[key];
      return value !== undefined && value !== null && value !== "";
    });
    if (!allNarrationValuesValid || !allNarrationKeysPresent) {
      throw new Error("Please fill all the narration data details");
    }
  });
};

export const createSearchPayload = (masterData, narrationData) => {
  let payload = {};
  let masterKeys = {
    reference_dt: "ref_date",
    reference_no: "ref_no",
    voucher_no: "voucher_no",
    posted: "posted",
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

export const fetchNarrationData = async (
  cbFn,
  transYear,
  divisionId,
  userId,
  onAcc
) => {
  try {
    const data = await fetchAppData(
      `${APP_PROD_API.GET_BASE_DATA_BANK_VOUCHER_NARRATION}?appDivisionId=${divisionId}&appFinYear=${transYear}&userId=${userId}&on_acc=${onAcc}`
    );
    cbFn(data);
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while fetching data, try again"
    );
  }
};

export const triggerFetchBillMeta = async (
  {
    acc_no,
    division_id = 1,
    trans_year,
    chq_no,
    chq_dt,
    pay_rec,
    voucher_id,
    on_acc,
  },
  cbFn
) => {
  if (!chq_no) {
    toast.error("Please Enter Check No");
    return;
  } else if (!chq_dt) {
    toast.error("Please Enter Check Date");
    return;
  }
  const params = {
    acc_no,
    division_id,
    trans_year,
    chq_no,
    chq_dt,
    pay_rec,
    voucher_id,
    on_acc,
  };

  // Filter out undefined or null values and build the query string
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null
    )
  );

  try {
    const data = await fetchAppData(
      // `${APP_PROD_API.GET_BANK_VOUCHER_BILL_META}?acc_no=${acc_no}&division_id=${division_id}&trans_year=${trans_year}`
      `${APP_PROD_API.GET_BANK_VOUCHER_BILL_META}?${queryParams.toString()}`
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

// --------------- THFMBANK ------------------

//CALCULATE TRANS_AMT
export function calcTransAmt(thfmbankData, formControlData) {
  let { tot_amt_db, tot_amt_cr } = formControlData;
  let { trans_amt, pay_rec } = thfmbankData;
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
    return; // Replace with your validation logic
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

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    voucher_no: "voucher_no",
    voucher_dt: "voucher_dt",
    posted: "posted",
    pay_rec:'pay_rec',
    // chq_no:'chq_no',
    // chq_no:'chq_dt',
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
        APP_PROD_API.VALIDATE_EXP_FROM_DATA
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

// VALIDATION AMOUNT FIELD
const validateAmt = () => {};

// CHECK NULL VALIDATION IN ACC_NO
export const validateAccNo = ({
  event,
  value,
  formStatus,
  formData,
  setNarrationData,
}) => {
  event.preventDefault();
  if (!["Insert", "Update"].includes(formStatus)) return;
  let masterKeys = [
    "section",
    "division_id",
    "curr_code",
    "exchang_rt",
    "chq_no",
    "chq_dt",
  ];
  const allKeysPresent = masterKeys.every((key) => key in formData);

  const allValuesValid = masterKeys.every((key) => {
    const value = formData[key];
    // //console.log(key, formData[key]);
    return value !== undefined && value !== null && value !== "";
  });

  if (!allKeysPresent || !allValuesValid) {
    return;
  }
  const nextElement = event.relatedTarget; // The element getting focus after blur

  // If nextElement is an input field, trigger validation
  if (!nextElement || nextElement.tagName !== "INPUT") {
    return; // Replace with your validation logic
  }

  if (!value) {
    toast.error("Account Number cannot be blank");
    event.target.focus();
    return;
  }

  genBillNo(
    { on_acc: formData?.on_acc, thfmbankData: formData },
    setNarrationData
  ); //
};

// generate bill no as per on_acc
//TODO NEED TO APPLY IT
export const genBillNo = ({ on_acc = "N", thfmbankData }, cb) => {
  cb((prev) => {
    return prev.map((item) => {
      return {
        ...item,
        bill_no:
          on_acc == "Y"
            ? `OA${item?.chq_no || thfmbankData?.chq_no}`
            : item?.bill_no,
        bill_dt:
          on_acc == "Y" ? item?.chq_dt || thfmbankData?.chq_dt : item?.bill_dt,
      };
    });
  });

  return;
};

//VALIDATE BANK HEADER DATA
export const validateBankHeader = () => {
  const isValidFormData = validateForm(
    "bank-head-form",
    "Bank Voucher Header Form"
  );
  if (!isValidFormData) {
    // toast.error("Please fill required header data first");
    return;
  }
};

//VALIDATE BANK DETAIL DATA
export const validateBankDetail = () => {
  const isValidNarration = validateForm(
    "bank-detail-form",
    "Bank Voucher Detail Form"
  );
  if (!isValidNarration) {
    return;
  }
};

// CHECK TDS APPLICABLE ON THE ACCOUNT (basic frontend level check)
export const isTDSApplicable = ({ pay_rec, on_acc = "N", formStatus }) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return true;
  }
  if (pay_rec == "0" && on_acc == "Y") {
    return false;
  }
  return true;
};


// GENERATE TDS ENTRIES
export const generateTDSEntriesBnk = async (
  { thfmBankData, tdfmBankData, srl_no, formStatus, setUpdateNarrationData },
  cb
) => {
  const { voucher_dt, voucher_id, pay_rec, division_id, trans_year } = thfmBankData || {};
  const { cost_centr, cost, pur_code, amount, acc_no, bill_no, bill_dt } = tdfmBankData;

  const payload = {
    voucher_id: voucher_id || "",
    voucher_dt,
    bill_no,
    bill_dt,
    srl_no,
    amount,
    acc_no,
    pay_rec,
    pur_code,
    cost_centr,
    cost,
    division_id,
    trans_year,
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BANK_TDS_ENTRIES}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message);
    }

    const tdsData = result?.data.map((item) => ({
      ...item,
      row_id: `${item.srl_no}${Date.now()}${item.srl_no}`,
      entry_type: "TDS",
      chq_no: item?.chq_no || thfmBankData?.chq_no || '',
      chq_dt: item?.chq_dt || thfmBankData?.chq_dt || '',
    }));

    if (cb && typeof cb === "function") {
      cb((prevNarrationData = []) => {
        let isTdsEntriesPresent = false;

        const nonTdsEntries = prevNarrationData.filter((item) => {
          const remarks = item?.remarks?.toLowerCase() || "";
          const isTdsLike =
            item?.entry_type === "TDS" ||
            remarks.startsWith("tax deducted at source") ||
            remarks.startsWith("tds deduction for");

          if (isTdsLike) {
            isTdsEntriesPresent = true;
          }

          return !isTdsLike;
        });

        const updatedNarration = [...nonTdsEntries, ...tdsData];

        // If Update mode, set the cleaned + new narration data
        if (formStatus === "Update" && typeof setUpdateNarrationData === "function") {
          setUpdateNarrationData(updatedNarration);
        }

        return updatedNarration;
      });
    }
  } catch (error) {
    toast.error(error.message || "Issue in fetching TDS entries");
  }
};


// VALIDATE CHEQUE DETAIL //todo need to add this validation 
export const validateCheque = async({e, chq_no_value, thfmbankData})=>{
  //console.log('for chq detail validation  ::', thfmbankData)
  
}

// ON CLICK IN PRINT BUTTON BANK VOUCHER REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getBnkVchReport(bnkVchData, formStatus){

  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {voucher_no, division_id, trans_year} = bnkVchData;
  
  if (!voucher_no || !division_id, !trans_year) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
  }
  try {
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/generate-report/exp_vch`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      credentials:'include',
      body: JSON.stringify({ 
          pVch_no: voucher_no,
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
    link.download = 'bank_vch_report.pdf';  // Specify the file name for the download
    link.click();  // Trigger the download

  //   toggleModal();  // Close modal after success
  } catch (err) {
    //console.log(err.message);
    toast.error(err.message)
  } finally {
  //   setLoading(false);  // Ensure loading state is set to false after the process
  }

}


//DBCR FIELD
export const handleBnkDbCrChange = (value, currentDbCr, pay_rec) => {
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



