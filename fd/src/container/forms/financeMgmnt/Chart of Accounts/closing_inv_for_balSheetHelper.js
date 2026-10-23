export const formDetailHeader = [
    {
      label: "Account No",
      required: true,
      width: '10%',
      isHelpExist: true
    },
    {
      label: "Description",
      required: false,
      width: '60%'
    },  
    {
        label: "Amount",
        required: true,
        width: '15%'
      }, 

     
]   



export const formDetailInitData = { 
   id: 1,
   inv_dt: "",
   acc_no: "",
   acc_desc: "",
   amount: 0,
   init_acc_no: '',
}  

//acc no helplist header

export const accHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Account Description", key: "acc_desc" },
];
