
export const financeDataHeader = [
   
    {
        label: "Starting Year",
        required: true,
    },
    {
        label: "Ending Year",
        required: true,
    }, 

    {
        label: "Code",
        required: true,
    },
]; 

export const ModuleDataHeader = [
   
    {
        label: "Module",
        required: true,
    },
    {
        label: "Transaction",
        required: true,
    }, 

   
];  

export const TranDataHeader = [
   
    {
        label: "From",
        required: true,
    },
    {
        label: "To",
        required: true,
    }, 
    
    {
        label: "Open",
        //required: true,
    },  
    {
        label: "Close",
        //required: true,
    }, 


]

export const updateFormDataPayloadTemplete = {
  
    deletedTranData:[],
    deletedFinData:[],
  }




export const financeInitialFormDataTemplate = 
{
  st_date: "",
  end_date: "",
  flag: "N",
  row_id: 1
}


export const tranInitialFormDataTemplate =
{
  period_start: "",
  period_end: "",
  status_flag: "",
  row_id: 1
}
