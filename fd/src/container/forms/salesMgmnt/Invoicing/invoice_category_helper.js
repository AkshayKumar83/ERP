 export const formInitData = {
  id: "",
  da_cat: "",
  prefix: "",
  da_cat_desc: "",
  user_code: "",
  section_id: "",
  rg23_reg_type: "",
  excisable: "N",
  excise_sr_no_reqd: "N",
  invoice: "N",
  despatch_in_prdn: "N",
  exp_dome_flag: "D",
};

 export const formDetailInitData = { 
    id: "",
    da_cat: "",
    c_code: "",
    prefix: "",
    inv_length: ""
};  

export const headers = [
    
    { label: "Code", required: true, width: '6%' },
    { label: "  Description  ", required: true, width: "7%" },
    { label: "Type of Category", required: true, width: "8%" },
     { label: "Section", required: true, width: "8%" },
    { label: "RG23 reg type", required: true, width: "8%" },
    { label: "Excisable.", required: false, width: "8%" },
     { label: "Excise Sr. No. Reqd", required: false, width: "8%" },
    { label: "Invoice Reqd", required: false, width: "8%" },
    { label: "Effect In Prdn Report", required: false, width: "7%"},
    { label: "Exp/Dome flag", required: false, width: "4%" },
    { label: "Exp", required: false, width: "5%" },
    { label: "Serv", required: false, width: "4%" },
];  

export const Dtlheaders = [
    
    { label: "Depot/Head Office", required: false, width: '30%' },
    { label: "Prefix For Invoice", required: false, width: "16%" },
    { label: "Invoice No. Length", required: false, width: "18%" },
]


