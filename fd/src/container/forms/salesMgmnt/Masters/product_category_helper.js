 export const formInitData = {
  id: "",
  main_cat_desc: "",
  main_cat_seq: "",
  flag_accessories: "N",
  flag_configurator: "N",
  main_cat_id:'',

 
};

 export const formDetailInitData = { 
    id: "",
    sub_cat_desc: "",
    sub_cat_seq: "",
    acc_seq: "",
  
};  

export const headers = [
    
    { label: "Main Category Description", required: true, width: '50%' },
    { label: "Sequence", required: true, width: "17%" },
    { label: "Accessories Flag", required: false, width: "18%" },
    { label: "Configurator Flag", required: false, width: "18%" },
   
];  

export const Dtlheaders = [
    
    { label: "Sub Category Description", required: true, width: '50%' },
    { label: "Squence", required: false, width: "26%" },
    { label: "Accessories", required: false, width: "27%" },
]


