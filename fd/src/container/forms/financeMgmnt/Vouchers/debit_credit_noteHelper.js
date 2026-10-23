import toast from "react-hot-toast";

export const headers = [
  { label: "Narration", required: true, width: "45%" },
  { label: "Account No.", required: true, width: "9%", isHelpExist: true },
  { label: "Bill Number", required: true, width: "9%" },
  { label: "Bill Date", required: true, width: "9%" },
  { label: "Cost", required: false, width: "9%", isHelpExist: true },
  { label: "Amount", required: false, width: "6%" },
  { label: "D/C", required: true, width: "5%" },
];

export const debitcreditHeadInitData = {
  note_type: "",
  division_id: "",
  trans_type: "RN",
  section: "",
  pay_rec: 0,
  on_acc: "N",
  memo_vchr: "N",
  query_auth: "",
  voucher_no: "",
  voucher_dt: "",
  bill_no: "",
  bill_dt: "",
  curr_code: "",
  exchang_rt: "",
  chq_no: "",
  chq_dt: "",
  trans_amt: "",
  dbcr_code: "",
  dbcr_name: "",
  reference: "",
  trans_year: "",
  voucher_id: "",
  posted: "N",
  row_status: "",
  cancel: "N",
};

export const debitcreditDtlInitData = {
  sr_no: 1,
  remarks: "",
  acc_no: "",
  bill_no: "",
  bill_dt: "",
  cost: "",
  amount: "",
  db_cr: "",
  emp_cd: "",
  pur_code: "",
  cost_desc: "",
  acc_desc: "",
  cost_centr: "",
  chq_no: "",
  chq_dt: "",
  emp_name: "",
  pay_rec: "",
  posted: "N",
  old_vouch_amt: "",
  flag: "Y",
  srl_no: 0,
  voucher_id: "",
  row_status: "",
  
};

export const debitcreditStformInitData = {
  voucher_id: "",
  division_id: "",
  trans_year: "",
  trans_type: "",
  voucher_no: "",
  voucher_dt: "",
  srl_no: 0,
  acc_no: "",
  party_code: "",
  bill_no: "",
  bill_dt: "",
  remarks: "",
  st_flag: "C",
  st_form: "",
  tax_code: "",
  st_perc: "",
  st_val: "",
  st_code: "",
  trans_amt: "",
};

// dbcr account code help list header

export const dbcrAccHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Description", key: "acc_desc" },
];

// Bill no help list header

export const BillHelpListHeader = [
  { label: "Bill No", key: "doc_no" },
  { label: "Bill Date", key: "doc_date" },
];

// currency help list header

export const CurrencyHelpListHeader = [
  { label: "Code", key: "curr_code" },
  { label: "Currency Desc", key: "curr_desc", },
   { label: "Rate", key: "rate", },
];

// account help list header

export const accountHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Acc Desc", key: "acc_desc" },
];

// cost help list  header

export const costHelpListHeader = [
  { label: "Prefix", key: "prefix" },
  { label: "Description", key: "description" },
];  

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
    voucher_no: "voucher_no",
    voucher_dt: "voucher_dt"

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


//DBCR FIELD
export const handleDbCrChng = (value, currentDbCr) => {
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





// ON CLICK IN PRINT BUTTON BANK VOUCHER REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getDbCrVchReport(bnkVchData, formStatus){

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
    link.download = 'debit_credit_report.pdf';  // Specify the file name for the download
    link.click();  // Trigger the download

  //   toggleModal();  // Close modal after success
  } catch (err) {
    //console.log(err.message);
    toast.error(err.message)
  } finally {
  //   setLoading(false);  // Ensure loading state is set to false after the process
  }

}