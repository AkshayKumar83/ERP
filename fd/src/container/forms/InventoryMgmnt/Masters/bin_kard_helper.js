import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const binKardHeaderFormData = {
  wc_id: "",
  wc_no: "",
  wc_description: "",
  ok_rej: "O",
  mehru_cd: "",
  it_code: "",
  it_name: "",
  um_code: "",
  from_date: "",
  temp_date: "",
  to_date: "",
  opening_date: "",
  closing_date: "",
  total_recp: "",
  total_issu: "",
  opening_balance: "",
  closing_balance: "",
  rate: "",
  iic_ref_no: "",
  cl_rate: "",
};

export const headers = [
  { label: "Date", width: "10%" },
  { label: "Document No", width: "15%" },
  { label: "PO No", width: "15%" },
  { label: "Department/Vendor", width: "20%" },
  { label: "Receipt Qty", width: "10%" },
  { label: "Issued Qty", width: "10%" },
  { label: "Balance", width: "10%" },
];

export const binKardDetailFormData = {
  doc_date: "",
  material_fr: "",
  doc_no: "",
  po_no: "",
  dept_vend: "",
  recp_qty: "",
  issu_qty: "",
  balance: "",
  type: "",
  trans_code: "",
  qty: "",
  v_code: "",
  chln_no: "",
  chln_date: "",
  po_rate: "",
  po_disc: "",
  stnd_rate: "",
};

export const storeHelpListHeader = [
  { label: "Description", key: "description"  },
  { label: "WC No", key: "wc_no" },
  { label: "Id", key: "wc_id" },
];

export const itemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Item Name", key: "it_name" },
  { label: "FC Code", key: "fc_code" },
];

export const getFormattedCurrentDate = (date) => {
  // const today = new Date(date);
  // const dd = String(today.getDate()).padStart(2, '0');
  // const mm = String(today.getMonth() + 1).padStart(2, '0');
  // const yy = String(today.getFullYear()).slice(2);
  // return `${dd}/${mm}/${yy}`;
  const parsedDate = date ? new Date(date) : new Date();
  const dd = String(parsedDate.getDate()).padStart(2, "0");
  const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const yy = String(parsedDate.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
};

export const fetchOpeningBalance = async ({ formData, user, setDetailData }, cb) => {
  
  const { wc_id, it_code, ok_rej, from_date, to_date } = formData;

  if (!wc_id && !it_code) {
    toast.error("Please select Store and Item first, then press Show.");
    return;
  }

  if (!wc_id) {
    toast.error("Please select Store first, then press Show.");
    return;
  }

  if (!it_code) {
    toast.error("Site doesn't Exist.");
    return;
  }

  if(!from_date || !to_date){
     toast.error("please select date range");
    return;
  }


  const queryObj = {
    wc_id,
    it_code,
    ok_rej,
    from_date,
    to_date,
    appFinYear: user?.global_fin_year,
  };

  const queryParams = new URLSearchParams();
  Object.entries(queryObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_BIN_KARD_FORM_DATA
      }/show-opn-Bal?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errMsg = await res.json()
      throw new Error(errMsg?.message || 'Cannot get error message while fetching opening/closing balance');
    }

    const data = await res.json();
    const openingBalance = data?.opening_balance ?? 0;
    const closingBalance = data?.closing_balance ?? 0;
    cb((prev) => ({
      ...prev,
      opening_balance: openingBalance,
      rate: openingBalance,
      cl_rate: openingBalance,
      closing_balance: closingBalance,
    }));

    // fetchTommainData({formData, user, setHdr:cb, closing_balance: openingBalance},setDetailData)
    fetchTommainData(
  { formData, user, setHdr: cb, closing_balance: openingBalance },
  (newData) => setDetailData(newData ?? [])
);
  } catch (error) {
    // console.error("Error fetching opening balance:", error);
    toast.error(error||"Something went wrong while fetching the Opening Balance.");
  }
};

export const fetchTommainData = async ({ formData, user, setHdr, closing_balance}, cb) => {
  // //console.log(user);
  const { wc_id, it_code, from_date, to_date, ok_rej, } = formData;

  const queryObj = {
    wc_id,
    it_code,
    from_date,
    to_date,
    ok_rej,
    appFinYear: user?.global_fin_year,
    closing_balance
  };

  const queryParams = new URLSearchParams();
  Object.entries(queryObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_BIN_KARD_STOCKS_ITEM
      }?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    const openingBalance = data?.opening_balance ?? 0;

    // //console.log(data?.data)
   cb(data?.data ?? []);
    setHdr((prev)=>({...prev, total_issu:data?.total_issu, total_recp:data?.total_recp}))
  } catch (error) {
    // console.error("Error fetching opening balance:", error);
    toast.error("Something went wrong while fetching the Opening Balance.");
  }
};
