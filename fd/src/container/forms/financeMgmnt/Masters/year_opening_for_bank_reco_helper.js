export const headers = [
    // { label: "Action", required: false,width:"5%" },
    { label: "Transaction date", required: true, width:"1%" },
    { label: "Cheque No.", required: true,width:"15%"  },
    { label: "Ref. No.", required: true,width:"15%"  },
    { label: "Deposit Slip No.", required: true,width:"15%"  },
    { label: "Voucher No.", required: true, width:"15%" },
    { label: "Voucher dt.", required: true,width:"1%" },
    { label: "Dr/Cr", required: true, width: "5%" },
    { label: "Debit Amount", required: true, width: "5%" },
    { label: " Credit Amount", required: true, width:"5%" },
    // { label: " Remarks", required: true, width:"20%" },
  ];


  // below data is MOFMBANKRECO1 ,Check in DataBlock for own understanding.
export const yearBankReco1Data = {
month:"",
acc_no:"",
trans_year:"",
division_id:"",
acc_desc:"",
}

// below data is MOFMBANKRECO
export const yearBankRecoData ={
srl_no:"",
month:"",
acc_no:"",
division_id:"",
trans_year:"",
trans_date:"",
chq_no:"",
ref_no:"",
deposit_slip:"",
voucher_no:"",
voucher_dt:"",
db_amt:"",
cr_amt:"",
amount:"",
db_cr:"",
remarks:"",
dr_total:"",
cr_total:"",
repo_flag:"",
}