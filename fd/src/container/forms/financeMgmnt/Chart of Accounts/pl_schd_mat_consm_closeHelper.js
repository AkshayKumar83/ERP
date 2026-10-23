import { update } from "lodash";

export const matConsumptionCloseNbtTHeader = [
    {
      label: "From Date",
      required: true,
      width: '25%'
    },
    {
      label: "To Date",
      required: true,
      width: '25%'
    },
  
    {
      label: "Closing Stock",
      required: true,
      width: '30%'
    },
    {
      label: "PROV Closing Stock",
      required: true,
      width: '30%'
    },
  
   
   
  ];   

  export const matConsumptionCloseNbtInitFormData = {
    id: "",
    from_date: "",
    to_date: "",
    trans_year: "",
    division_id: "",
    clos_stock: "",
    prov_clos_stock: "",
   
  
  };    
  
  export const formDetailTHeader = [
    {
      label: "Account No.",
      required: true,
      width: '15%'
    },
    {
      label: "Description",
      required: true,
      width: '40%'
    },
  
    {
      label: "PROV Op. Stock",
      required: true,
      width: '23%'
    },
    {
      label: "PROV Purchases",
      required: true,
      width: '25%'
    }, 

    {
      label: "Opening",
      required: true,
      width: '9%'
    }, 

    {
      label: "Purchases",
      required: true,
      width: '7%'
    },
  
   
   
  ];   
  
  export const  formInitData = {
    create_id: "",
    create_date: "",
    update_id: "",
    update_date: "",
    seq_no: "",
    group_by: "",
    id: "",
    description: ""

  }

  export const formDetailInitData = {
    id: "",
    division_id: "",
    create_id: "",
    trans_year: "",
    division_id: "",
    create_date: "",
    update_id: "",
    update_date: "",
    from_date: "",
    to_date: "",
    acc_no: "",
    open_stock: "",
    purchases: "",
    clos_stock: "",
    consumption: "",
    prov_open_stock: "",
    prov_purchases: "",
    prov_clos_stock: "",
    prov_consumption: "",
    acc_desc: "",
    acc_type: ""
   
  
  };   


