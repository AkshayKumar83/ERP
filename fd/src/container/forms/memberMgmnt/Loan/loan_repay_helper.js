import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const efaDetalDtlHeader = [
  // { width: "5%", label: "EFA ID", required: false },
  { width: "5%", label: "EMI Sno", required: false },
  { width: "15%", label: "Receipt Ref Number", required: false },
  { width: "5%", label: "Receipt Date", required: false },
  { width: "200px", label: "Bank", required: false },
  { width: "10%", label: "Cheque Number", required: false },
  { width: "8%", label: "Cheque Date", required: false },
  { width: "200px", label: "Remarks", required: false },
  { width: "10%", label: "Amount Received(Rs.)", required: false },
  { width: "30%", label: "Service Charge Amt.", required: false },
  { width: "150px", label: "Interest Amt.", required: false },
  { width: "90px", label: "IGST", required: false },
  { width: "90px", label: "CGST", required: false },
  { width: "90px", label: "SGST", required: false },
  { width: "150px", label: "Principal Amt.", required: false },
];

export const efaDetalDtlHeaderOnQuery = [
  // { width: "5%", label: "EFA ID", required: false },
  { width: "5%", label: "EMI Sno", required: false },
  { width: "250px", label: "Party Name", required: false },
  { width: "150px", label: "Loan Refference No", require: false },
  { width: "15%", label: "Receipt Ref Number", required: false },
  { width: "5%", label: "Receipt Date", required: false },
  { width: "200px", label: "Bank", required: false },
  { width: "10%", label: "Cheque Number", required: false },
  { width: "8%", label: "Cheque Date", required: false },
  { width: "200px", label: "Remarks", required: false },
  { width: "150px", label: "Principal Amt.", required: false },
  { width: "30%", label: "Service Charge Amt.", required: false },
  { width: "150px", label: "Interest Amt.", required: false },
  { width: "90px", label: "IGST", required: false },
  { width: "90px", label: "CGST", required: false },
  { width: "90px", label: "SGST", required: false },
  { width: "10%", label: "Amount Received(Rs.)", required: false },

];

export const efaDetalHeader = [
  // { width: "5%", label: "EFA ID", required: false },
  { width: "5%", label: "EMI Sno", required: false },
  { width: "5%", label: "EFA control ID", required: false },
  { width: "10%", label: "Installment Date", required: false },
  { width: "15%", label: "Principal Amount(Rs.)", required: false },
  { width: "10%", label: "Service Charge(Rs.)", required: false },
  { width: "10%", label: "Interest(Rs.)", required: false },
  { width: "10%", label: "IGST(Rs.)", required: false },
  { width: "10%", label: "CGST(Rs.)", required: false },
  { width: "10%", label: "SGST(Rs.)", required: false },
  { width: "10%", label: "Total Amount(Rs.)", required: false },
];

export const efaRepayDtlFormDataInitTempate = {
  efa_id: "",
  emi_sno: "", // frontend only field
  receipt_number: "",
  receipt_date: "",
  bank_name: "",
  instrument_number: "",
  instrument_date: "",
  amount_recd: "",
  remarks: "",
};

export const efaRepayFormDataInitTempate = {
  efa_id: "",
  emi_sno: "", // frontend only field
  efa_ctrl_id: "", // frontend only field
  emi_date: "",
  loan_purpose: "",
  principal_amt: "",
  service_chg_ded: "",
  interest_amt: "",
  igst_amt: "",
  cgst_amt: "",
  sgst_amt: "",
  Tot_amt: "",
};

// export const memberNoHelpListHeader = [
//   { label: "Dealer name", key: "dlr_name" },
//   { label: "Member Number", key: "member_no" },
//   { label: "Member Id", key: "member_id" },
// ];
export const memberNoHelpListHeader = [
  { label: "Dealer name", key: "dlr_name" },
  { label: "Member No.", key: "member_no" },
  { label: "Division", key: "division" },
  { label: "Location", key: "location" },
  { label: "Member Id", key: "member_id" },
];

export const accNoHelpListHeader = [
  { label: "Dealer name", key: "dlr_name" },
  { label: "Member Number", key: "member_no" },
  { label: "Member Id", key: "member_id" },
];

export const loanReferenceHelpListHeader = [
  {
    label: "EFA ID",
    key: "efa_id",
    width: "10%",
  },
  {
    label: "Control ID",
    key: "efa_ctrl_id",
    width: "20%",
  },
  {
    label: "Application Date",
    key: "efa_application_date",
    width: "20%",
  },
  {
    label: "Loan ID",
    key: "loan_id",
    width: "10%",
  },
  {
    label: "Loan Type",
    key: "loan_purpose",
    width: "40%",
  },
];

export const validate = (efaDetailData) => {
  const requiredField = ["acc_no", "loan_purpose_desc"];
};

export const getCurrentBalance = async ({ efa_id }, cb) => {
  if (!efa_id) {
    toast.error("Please Select Loan Reference");
    return;
  }
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_EMI_REPAYMENT_DATA
      }/get_balance?efa_id=${efa_id}`,
      { credentials: "include" }
    );
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.message);
    }

    const result = await response.json();

    // set up the
    cb((prev) => ({ ...prev, balance_amount: result?.loan_balance, pre_close_efa: result?.pre_close_efa }));
  } catch (error) {
    toast.error(error.message || "cannot fetch balance amount");
  }
};


export const createSearchPayloadForLnReceiptSearch = (masterData) => {
  let payload = {};

  ////console.log("masterdata", masterData);

  let masterKeys = {
    // member_id: "member_id",
    receipt_date: "receipt_date",
    receipt_number: "receipt_number",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  ////console.log("hasMasterKeys", hasMasterKeys);

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
