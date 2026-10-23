import toast from "react-hot-toast";

export const headers=[
    { label: "Ops No.", width:"10px"},
    { label: "From Output Code", width:"200px"},
    { label: "From Output Desc", width:"200px" },
    { label: "Work Center", width:"100px"},
    { label: "From Final Code", width:"200px"},
    { label: "To Output Code", width:"200px"},
    { label: "To Output Desc", width:"200px"},
    { label: "To Final Code", width:"200px"},
    { label: "Cancelled", width:"20px"},
    { label: "Select", width:"20px"},
]

export const routeFieldInitData = {
from_route_no:"",
to_route_no:"",
wc_no:"",
}

 export const copyRoutingData={
    route_id:"",
    new_route_id:"",
    opn_id:"",
    operation_no:"",   
    it_code:"",
    it_name:"",
    wc_id:"",
    final_code:"",
    new_it_code:"",
    new_it_name:"",
    new_final_code:"",
    cancel_flag:"N",
    select_check:"N",
 }

 export const fromRouteHelpListHeader = [
  {label: "From Route No.", key: "route_no"},
  {label: "Name", key: "it_name"},
]

export const ToRouteHelpListHeader = [
    {label: "To Route No.", key: "it_code"},
    {label: "Description", key: "it_desc"},
    {label: "Old Route No", key: "old_it_code"},
 ]

 export const handleValidateField = ( e, formStatus) => {

  if (!["Insert"].includes(formStatus)) return;

  const { name, value } = e.target;

  if (name === "from_route_no") {
    if (!value) {
      toast.error("From Route Sheet No. can't be blank");
      e.target.focus();
    }
    return;
  }

  if (name === "to_route_no") {
    if (!value) {
      toast.error("To Route Sheet No. can't be blank");
      e.target.focus();
    }
    return;
  }


}

export const validateFromDb = async ({ type, value, extra }) => {
  
  try {
    const url = import.meta.env.VITE_BASE_API_URL + "/copy-routing/validate";

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

