import { TRUE } from "sass";

export const formInitialData = {
   
   trans_year: "",
   division_id: "",
   formula_id: "",
   ass_lib_inc_exp_sch_flag: "",
   bs_pl_flag: "B",
   seq_no: "",
   seqh: ""
   
  };  

  export const formDetailHeader = [
    {
      label: "Flag",
      required: false,
      width: '10%'
    },
    {
      label: "Seq No",
      required: false,
      width: '16%',
      isHelpExist: true
    },  
    {
        label: "Particulars",
        required: false,
        width: '45%'
      }, 

      {
        label: "Plus Minus",
        required: false,
        width: '12%'
      }, 
] 

export const formDetailInitData = { 
    id : 1,
    trans_year: "",
    formula_id: "",
    ass_lib_inc_exp_sch_flag: "",
    seq_no: "",
    plus_minus: "",
    seqd: "",
    init_flag: ""
}    

// seq header helplist header

export const seqhHelpListHeader = [
  { label: "SNO", key: "sno" },
  { label: "Description", key: "description" },
];
 

export const seqdHelpListHeader = [
  { label: "SNO", key: "sno" },
  { label: "Description", key: "description" },
];


