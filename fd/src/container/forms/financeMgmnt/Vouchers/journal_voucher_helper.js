 
import { DateTime } from "luxon"; 
import _ from "lodash";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
   
export const checkDateNotGreaterThanToday = (key, value) => {
  let curr = DateTime.fromISO(value);
  const currentDate = DateTime.now();
  if (curr > currentDate) {
    throw new Error(`The provided '${key}' Can not be Higher Than System Date.`);
  }
  return true;
};

export const checkDateEqToToday = (key, value) => {
    let curr = DateTime.fromISO(value);
    const currentDate = DateTime.now();
    if (curr.hasSame(currentDate, "day")) {
        return true;
    };
    throw new Error(`The provided '${key}' is not equal to the current date.`);
};

export const checkDateNotLessThan = (key, value, minDate) => {
  let date = DateTime.fromISO(value);
  let min = DateTime.fromISO(minDate);
  if (date < min) {
    throw new Error(`The provided '${key}' is earlier than the allowed minimum date.`);
  }
  return true;
};  

export const checkDateInFinYear = (key, value) => {
}

export const JVHeaderInitData = {
  section: "",
  voucher_no: "",
  voucher_dt: "",
  curr_code: "",
  exchange_rt: "",
  max_voucher_dt: "",
  on_acc: "",
  query_auth: "",
  reference: "",
  trans_amt: "",
  bill_no: "",
  bill_dt: "",
  cons_ctrl_no: "",
  cons_ctrl_id: "",
  division_id: "",
  trans_type: "",
  pay_rec: "",
  posted: "",
  cancel: "",
  row_status: "",
  voucher_id:"",
  trans_year:"",
  prev_year_chln:"",
  memo_vchr:"N",
  enq_no:"",
  sal_enq_id:"",
};

export const detailHeader = [
  {label:"Narration", width:"20%"},
  {label:"Account No.", width:"8%"},
  {label:"Bill No.", width:"10%"},
  {label:"Bill Date", width:"4%"},
  {label:"Cost Center", width:"4%"},
  {label:"Purpose", width:"20%"},
  {label:"D/C", width:"3%"},
  {label:"Debit Amount", width:"10%"},
  {label:"Credit Amount", width:"10%"},
  // {label:"MRIR", width:"4%"},
]

export const JVDetailsInitData = {
  row_id: Date.now(),  // this should be deleted before submiting as it is temparay taken
  remarks:"",
  acc_no:"",
  bill_no:"",
  bill_dt:"",
  cost:"",
  db_cr:"",
  db_amount:"",
  cr_amount:"",
  emp_cd:"",
  pur_desc:"",
  pur_code:"",
  tds_debit_entry:"N",
  amount:"",
  cost_centr:"",
  emp_name:"",
  tds_cr_amt:"",
  tds_perc:"",
  tds_amt:"",
  tds_sur_perc:"",
  tds_sur_amt:"",
  tds_cess_perc:"",
  tds_cess_amt:"",
  pay_rec:"",
  posted:"",
  chq_no:"",
  chq_dt:"",
  old_amt:"",
  acc_desc:"",
  cost_desc:"",
  tel_no:"",
  ref_obj_qty:"",
  flag:"",
  srl_no:"",
  voucher_id:"",
  ser_cr_amt:"",
  ser_party_cd:"",
  ser_flag:"N",
  party_desc:"",
  row_status:"",
  register_type:"",
  sno:"",
  srno_date:"",
  net_amt :"", // make by me in frontend for calc net amt
}

export const JVTempInitData = {
  db_total: "",
  cr_total: "",
  vch_stat: "",
};   

// help list header
export const accHelpListHeader = [
  {label: "Account No.", key: "acc_no"},
  {label: "Account Description", key: "acc_desc"}
]    

export const billNoHelpListHeader = [
  {label: "Bill No.", key: "doc_no"},
  {label: "Bill Date", key: "doc_date"},
  {label: "Amount", key: "amount"}
]   

export const empHelpListHeader = [
  {label: "Employee Code", key: "emp_cd"},
  {label: "Employee Name", key: "emp_name"}
]  

export const costHelpListHeader = [
  {label: "Prefix", key: "prefix"},
  {label: "Description", key: "description"}
]  
export const purposeHelpListHeader = [
  {label: "Code", key: "code"},
  {label: "Description", key: "description"}
]  
   

export const vendorHelpListHeader = [
  {label: "Party Code", key: "v_code"},
  {label: "Party Desc", key: "v_name"}
]  
   

// THESE PARAMETER TAKEN AS SAME AS FORM BUILDER
export const parameterData = {
  p_acc_no: "",
  db_cr: "",
  p_sect: "",
  p_cost: "",
  p_pur: "",
  p_dt: "",
  tds: "",
  p_voucher_id: "",
  narr: "",
  common_narr: "",
};


// Form related helper functions

export function calcTransAmt(thfmtranData, formControlData) {
  let { db_total, cr_total } = formControlData;
  let { trans_amt, pay_rec } = thfmtranData;
  if (Number(pay_rec) === 0) {
    trans_amt = Number(db_total || 0) - Number(cr_total || 0);
  } else {
    trans_amt = Number(db_total || 0) - Number(cr_total || 0);
  }
  return trans_amt;
}


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
    // reference_dt: DateTime.fromISO(data.reference_dt).toFormat("yyyy-MM-dd"),
    voucher_dt: DateTime.fromISO(data.voucher_dt).toFormat("yyyy-MM-dd"), 
    db_total: Math.abs(dbAmt),
    cr_total: Math.abs(crAmt),
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
      db_amount: item?.db_cr == 'D'?item?.amount:0,
      cr_amount:item?.db_cr == 'C'?item?.amount:0,
    };
  });
};


//VALIDATE VOUCHER_DT
export const validateVoucherDt = async(formData, cb)=>{
  const { section, voucher_dt, division_id, trans_year } = formData;
  const queryParams = new URLSearchParams({section, voucher_dt, division_id, trans_year});
try {
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.VALIDATE_JOURNAL_VOUCHER}/vch_dt?${queryParams.toString()}`,{
    method:'GET',
    credentials:'include'
  })

  if(!res.ok){
    const result = await res.json()
    throw new Error(result?.message || `Failed to fetch max voucher date`)
  }
  const result = await res.json()
  //console.log(result)
  
} catch (error) {
  console.error('Validation error:', error);
  toast.error(error)
  cb(prev=> ({...prev, voucher_dt:''}))
  return
}






}


// validate dbAmount
export const validateDBAmt = (data, rowIndex, cb)=>{
  const {db_amount, db_cr} = data
  if(!db_amount && db_cr == "D"){
    toast.error('Please Enter the Debit Amount.')
    return
  }else{
    if(db_amount < 0){
      toast.error('You Cannot Enter Negative or Zero Amount.')
      cb(prev=>{
        const updated = [...prev]; // clone array
        updated[rowIndex] = {
          ...updated[rowIndex], // clone the specific row
          db_amount: "",        // update the field
        };
        return updated; // return new array
      })
      return
    }
    cb(prev=>{
      const updated = [...prev]; // clone array
      updated[rowIndex] = {
        ...updated[rowIndex], 
      amount: db_amount,
      old_amt: db_amount     
      };
      return updated; // return new array
    })


  }


}


// TRANS AMOUNT CALCULATION
export const calculateNetAmt = (narationDetail) => {
  return narationDetail.reduce((acc, item) => {
      const amount = parseFloat(item.amount || 0); // Parse the amount or default to 0
      const dbCr = item.db_cr || "D"; // Default to 'D' (debit) if not set

      return dbCr === "C" ? acc - amount : acc + amount; // Subtract if credit, add if debit
  }, 0);
};

// it calculate transAmt -- as it take all db amt
export const calculateNetDbAmt = (narrationDetail) => { 
  //console.log("narration data", narrationDetail)
  return narrationDetail.reduce((acc, item) => {
    const amount = parseFloat(item.amount || 0);
    return item.db_cr === "D" ? acc + amount : acc;
  }, 0);
};


export const createSearchPayloadForJVSpecificSearch = (masterData) => {
  let payload = {};

  //console.log('masterdata', masterData);

  let masterKeys = {
    voucher_no: "voucher_no",
    voucher_dt: "voucher_dt",
    posted: "posted",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  //console.log('hasMasterKeys', hasMasterKeys);

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


// ON CLICK IN PRINT BUTTON EXPENSE REPORT WILL CALL USING JASPER JAVA SERVICE
export  async function getJrlVchReport(JrlVchData, formStatus){
  // e.preventDefault();
  if(formStatus !== 'Query'){
      return
  }
  const {voucher_no, division_id, trans_year} = JrlVchData;
  
  if (!voucher_no || !division_id, !trans_year) {
    toast.error('Required Parameter is Misssing for Report!');
    return;
  }
  try {
    // Send request to your Node.js server to generate the report
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/generate-report/exp_vch`, {
      method: 'POST',
      credentials:'include',
      headers: {'Content-Type': 'application/json',},
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
    link.download = 'JV_report.pdf';  // Specify the file name for the download
    link.click();  // Trigger the download

  //   toggleModal();  // Close modal after success
  } catch (err) {
    //console.log(err.message);
    toast.error(err.message)
  } finally {
  //   setLoading(false);  // Ensure loading state is set to false after the process
  }

}


export const calculateDbCrTotals = (rows) => {
  const totals = rows.reduce(
    (acc, row) => {
      const dbAmt =
        row.db_cr === "D" ? Number(row.db_amount || 0) : 0;

      const crAmt =
        row.db_cr === "C" ? Number(row.cr_amount || 0) : 0;

      acc.dbTotal += dbAmt;
      acc.crTotal += crAmt;

      return acc;
    },
    { dbTotal: 0, crTotal: 0 }
  );

  return {
    dbTotal: Number(totals.dbTotal.toFixed(2)),
    crTotal: Number(totals.crTotal.toFixed(2)),
  };
};
