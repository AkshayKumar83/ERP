import toast from "react-hot-toast";
import { APP_PROD_API } from '../../../../utils/api';

export const routingDetailsHeader = [
{label:"Input Item Code",width:"20%",isHelpExist: true , required:true },
{label:"Item Description",width:"50%"},
{label:"UOM",width:"10%"},
{label:"Usage",width:"10%",required:true },
{label:"Rej perc",width:"10%",required:true },
]

export const routingToolsHeader = [
{label:"Item Code",width:"20%",isHelpExist: true , required:true},
{label:"Description",width:"50%"},
{label:"UOM",width:"5%"},
{label:"No. Off",width:"10%"},
{label:"WEF",width:"5%"},
{label:"Tool life (yrs)",width:"5%"},
{label:"Tool Cost (Rs)",width:"5%"},
]


export const copyRouteInitData = {  // MDPSCOPYROUT
  new_route_no:"",
  new_it_code:"",
}

export const headerInitData = {  // MHPSROUT
  row_status: "",
  route_no: "",
  route_id: "",
  master: "Y",
  master_route_no: "",
  route_start_date: "",
  route_end_date: "",
  final_code: "",
  fianal_code_desc: "",
  opn_id: "",
  opn_no: "",
  operation_description: "",
  wc_id: "",
  wc_no: "",
  it_code:"",
  default_wc: "N",
  it_name: "",
  remarks: "",
  main_wc_id: "",
  main_wc_no: "",
  main_wc_desc: "",
  qty: "",
  min_hour_flag: "H",
  setup_time: "",
  run_time: "",
  move_time: "",
  tool_change_time: "",
  setup_crew_no: "",
  run_crew_no: "",
  helper_crew_no: "",
  cancel_flag: "",
  cancel_date: ""
};

export const detailsInitData = {  // MDPSROUT
  row_status: "",
  route_id: "",
  input_it_code:"",
  it_name:"",
  it_bom_um:"",
  usage:"",
  route_no: "",
  rej_perc:"",
 
};

export const toollsInitData = {  // MDPSROUTOOL
  row_status: "",
  route_id: "",
  route_no: "",
  it_code:"",
  it_name:"",
  no_off:"",
  uom:"",
  remarks:"",
  wef_date:"",
  tool_no_years:'',
  tool_cost:"",

 
};

export const mstrRouteHelpListHeader = [
  {label: "Master Route No.", key: "route_no"},
]

export const finalCodeHelpListHeader = [
    {label: "Final Stage Code", key: "par_it_cd"},
    {label: "Description", key: "it_name"},
 ]

 export const outputCodeHelpListHeader = [
   {label: "Output Code", key: "it_code"},
   {label: "Description", key: "it_desc"},
 ]

 export const inputItCodeHelpListHeader = [
    {label: "Input It Code", key: "chl_it_cd"},
    {label: "Description", key: "it_name"},
    {label: "Usage", key: "usage"},
 ]

  export const newProductCodeHelpListHeader = [
  {label: "New Product Code", key: "it_code"},
 
  ]

  
 export const toolItCodeHelpListHeader = [
    {label: "Item Code", key: "it_code"},
    {label: "Description", key: "it_name"},
    {label: "UOM", key: "um_code"},
 ]

export const addDays = (dateStr, days) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
};


export const handleValidateField = ( e, formStatus, headerData, setHeaderData,) => {

  if (!["Insert", "Update"].includes(formStatus)) return;

  const { name, value } = e.target;

  /* ================= ROUTE NO ================= */
  if (name === "route_no") {
    if (!value) {
      toast.error("Route No. can't be blank");
      e.target.focus();
    }
    return;
  }

  /* ================= MASTER ROUTE ================= */
  if (name === "master_route_no") {
    if (!value) {
      toast.error("Master Route No. can't be blank");
      e.target.focus();
    }
    return;
  }
  if (name === "final_code") {
    if (!value) {
      toast.error("Final Stage Code can't be blank");
      e.target.focus();
    }
    return;
  }

  /* ================= ROUTE START DATE ================= */
  if (name === "route_start_date") {
    if (!value) {
      toast.error("Route Start Date cannot be null");
      e.target.focus();
      return; //  FORM_TRIGGER_FAILURE
    }

    //start_date + 6130
    const routeEndDate = addDays(value, 6130);

    setHeaderData((prev) => ({
      ...prev,
      route_start_date: value,
      route_end_date: routeEndDate,
    }));

    return;
  }
       // end date
  if (name === "route_end_date") {

    if (!value) {
      toast.error("Route End Date cannot be null");
      e.target.focus();
      return;
    }
         // compare with start date
    if (
      headerData?.route_start_date &&
      new Date(value) < new Date(headerData.route_start_date)
    ) {
      toast.error("Route End Date cannot be less than Starting Date");
      e.target.focus();
      return; 
    }

    // accept value
    setHeaderData((prev) => ({
      ...prev,
      route_end_date: value,
    }));

    return;
  }


}


export const validateFromDb = async ({ type, value, extra }) => {
  
  try {
    const url = import.meta.env.VITE_BASE_API_URL + "/route-maintenance/validate";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type,
        value,
        extra,
      }),
    });

    const data = await response.json();

    if (data?.valid) {
      return data;
    }

    toast.error(data?.message || "Validation failed");
    return false;

  } catch (error) {
    console.error("validateFromDb fetch error:", error);
    toast.error("Server not reachable");
    return false;
  }
};

export const isDuplicateDetailItem = ({
  detailData,
  inputItCode,
  currentIndex,
  ignoreDeleted = false,
}) => {
  return detailData.some((row, idx) => {
    if (idx === currentIndex) return false;
    if (ignoreDeleted && row.isStatus === "deleted") return false;
    return row.input_it_code === inputItCode;
  });
};


export const isDuplicateToolItem = ({
  toolData,
  itCode,
  currentIndex,
  ignoreDeleted = false,
}) => {
  return toolData.some((row, idx) => {
    if (idx === currentIndex) return false;
    if (ignoreDeleted && row.isStatus === "deleted") return false;
    return row.it_code === itCode;
  });
};




