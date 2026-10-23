export const headerInitData = {
    section:"",
    division_id:"",
    voucher_dt:"",
    e1_flag:"N",
    po_cat:"",
    bill_no:"",
    bill_dt:"",
    trans_type:"",
    pay_rec:"",
    on_acc:"",
    memo_vchr:"",
    voucher_no:"",
    curr_code:"",
    exchange_rt:"",
    party_code:"",
    party_name:"",
    trans_amt:"",
    reference:"",
    trans_year:"",
    voucher_id:"",
    posted:"",
    row_status:"",
    cancel:"",
    bill_id:"",
    bill_log:"",
    division_name:"",
}

export const headers =[
    {label:"Narration", width:"20%"},
    {label:"Account No.", width:"8%"},
    {label:"Bill No.", width:"10%"},
    {label:"Bill date", width:"5%"},
    {label:"Cost", width:"5%"},
    {label:"Pupose", width:"10%"},
    {label:"Amount", width:"10%"},
    {label:"D/C", width:"3%"},
]

export const DetailInitData = {
    id:1, // this should be deleted before submiting as it is temparay taken
    remarks:"",
    acc_no:"",
    bill_no:"",
    bill_dt:"",
    cost:"",
    amount:"",
    net_amt:"",
    acc_desc:"",
    cost_desc:"",
    old_amount:"",
    db_cr:"",
    cost_center:"",
    pur_code:"",
    register_type:"",
    sno:"",
    credit_date:"",
    pay_rec:"",
    posted:"",
    flag:"",
    srl_no:"",
    voucher_id:"",
    row_status:"",
    tds_cr_amt:"",
    tds_perc:"",
    tds_amt:"",
    tds_sur_perc:"",
    tds_sur_amt:"",
    tds_cess_perc:"",
    tds_cess_amt:"",
    tds_hsc_perc:"",
    tds_hsc_amt:"",
}


// checking before maping in datablock 
export const RestDetailInitData = {
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
    st_flag:"",
    st_form:"",
    tax_code:"",
    st_perc:"",
    st_val:"",
    trans_amt:"",
}

// MRIR
export const MRIRHeader = [
    { label: "MRIR Number", width: "70%" },
    { label: "MRIR date", width: "10%" },
  ];

export const mrirInitData = {
    mrir_no:"",
    mrir_dt:"",
    trans_type:"",
    bill_no:"",
    bill_dt:"",
    ref_id:"",
    voucher_id:"",
    srl_no:"",

}

// createSearchPayloadForPurchEntrySearch

export const createSearchPayloadForPurchEntrySearch = (masterData) => {
  let payload = {};

//   //console.log("masterdata", masterData);

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