export const saleVoucherInitData = {
  // data block THFMTRAN
  division_id: "",
  section: "",
  trans_type: "",
  pay_rec: "",
  on_acc: "",
  memo_vchr: "",
  voucher_no: "",
  voucher_dt: "",
  inv_type: "",
  bill_no: "",
  bill_dt: "",
  curr_code: "",
  exchang_rt: "",
  party_code: "",
  party_name: "",
  trans_amt: "",
  reference: "",
  trans_year: "",
  voucher_id: "",
  posted: "",
  row_status: "",
  cancel: "",
  bill_id: "",
};

export const saleVoucherDetailHeader = [
  { label: "Narration", width: "50%" },
  { label: "Account No.", width: "15%" },
  { label: "Cost", width: "10%" },
  { label: "Amount", width: "10%" },
  { label: "D/C", width: "5%" },
];

export const DetailInitData = {
  // data block TDFMTRAn
  remarks: "",
  acc_no: "",
  bill_no: "",
  bill_dt: "",
  cost: "",
  amount: "",
  acc_desc: "",
  cost_desc: "",
  old_amount: "",
  Db_cr: "",
  cost_center: "",
  pur_code:"",
  pay_rec:"",
  posted:"",
  flag:"",
  srl_no:"",
  amount_credit:"",
  amount_debit:"",
  net_amt:"",
  voucher_id:"",
  row_status:"",

};

export const MOFMSTFORMInitData ={   //  MOFMSTFORM
voucher_id:"",
division_id:"",
trans_year:"",
trans_type:"",
voucher_no:"",
voucher_dt:"",
srl_no:"",
acc_no:"",
st_code:"",
party_code:"",
bill_no:"",
bill_dt:"",
remarks:"",
trans_amt:"",
st_flag:"",
st_form:"",
tax_code:"",
st_perc:"",
st_val:"",
}

export const controlInitData = {
    party_amt:"",
    di_formstatus:"",
    curryear:"",
    vch_stat:"",
    userid:"",

}


export const createSrchPayload = (masterData) => {
  let payload = {};

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