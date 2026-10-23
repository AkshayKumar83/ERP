import { APP_PROD_API } from "../../../../utils/api";

export const headers=[
     { label: "PO No.", width:"16%"},
     { label: "V Code", width:"7%",},
     { label: " Name", width:"22%" },
     { label: "C Code", width:"7%",},
     { label: "Name", width:"24%" },
     { label: "MemberShip Date", width:"1%" },
     { label: " PO Type", width:"1%" },
     { label: " Date", width:"1%" },
      { label: " PO Value", width:"10%" },
      { label: "Authorized", width:"5%" },
      { label: "Redirect",width:'5%'},
    
]


 export const pendingPOData={
    v_code:"", 
    c_code:"",
    po_type:"",       
    po_no:"",  
    po_value:"", 
    po_date:"",
    member_date:"", 
    auth_flag:"N",  
 }




