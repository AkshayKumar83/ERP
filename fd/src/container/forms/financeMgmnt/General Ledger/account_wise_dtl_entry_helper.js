import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const accWiseDtlFormDtlDataInitTemp = {
  acc_no: "",
  voucher_no: "",
  voucher_dt: "",
  ref_no: "",
  cref_no: "",
  ref_date: "",
  cref_date: "",
  // db_cr: "",
  type: "",
  project_no: "",
  bill_no: "",
  bill_dt: "",
  amount: "",
  exchang_rt: "",
  db_amount: "",
  cr_amount: "",
  balance: "",
  bal_d_c: "",
  posted: "",
  srl_no: "",
  division_id: "",
  trans_year: "",
  trans_type: "",
  dr_total: "",
  cr_total: "",
  party_name: "",
  bill_log_no: "",
  remarks: "",
  chq_no: "",
  chq_dt: "",
};

export const accWiseDtlFormHdrDataInitTemp = {
  acc_no: "",
  acc_desc: "",
  rg_vch: "Y",
  from_date: "",
  to_date: "",
  yr_op_bal: 0,
  yr_db_cr: "",
  curr_bal: 0,
  curr_db_cr: "",
  as_on_caption: "",
  rb_all_vch: "A",
};

export const headers = [
  { label: "Vch No", width: "10%" },
  { label: "Vch Date", width: "5%" },
  { label: "Ref No", width: "10%" },
  { label: "Ref Date", width: "5%" },
  // { label: "D/C", width: "2%" },
  { label: "Type", width: "5%" },
  // { label: "Project No", width: "5%" },
  { label: "Dr Amt", width: "10%" },
  { label: "Cr Amt", width: "10%" },
  { label: "Balance", width: "10%" },
  { label: "Bal D/C", width: "3%" },
  { label: "Post", width: "3%" },
];

export const accHelpListHeader = [
  { label: "Account No", key: "acc_no" },
  { label: "Account Description", key: "acc_desc" },
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

export const fetchOpeningBalance = async (
  { formData, user, setDetailData },
  cb
) => {
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

  if (!from_date || !to_date) {
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
      const errMsg = await res.json();
      throw new Error(
        errMsg?.message ||
          "Cannot get error message while fetching opening/closing balance"
      );
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
    console.error("Error fetching opening balance:", error);
    toast.error(
      error || "Something went wrong while fetching the Opening Balance."
    );
  }
};

export const fetchTommainData = async (
  { formData, user, setHdr, closing_balance },
  cb
) => {
  //console.log(user);
  const { wc_id, it_code, from_date, to_date, ok_rej } = formData;

  const queryObj = {
    wc_id,
    it_code,
    from_date,
    to_date,
    ok_rej,
    appFinYear: user?.global_fin_year,
    closing_balance,
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

    //console.log(data?.data);
    cb(data?.data ?? []);
    setHdr((prev) => ({
      ...prev,
      total_issu: data?.total_issu,
      total_recp: data?.total_recp,
    }));
  } catch (error) {
    console.error("Error fetching opening balance:", error);
    toast.error("Something went wrong while fetching the Opening Balance.");
  }
};

export const validateAccNo = async (
  { acc_no, e, trans_year, division_id, setFormData },
  cb
) => {
  if (!acc_no) {
    toast.error("Account code is blank, Please enter Account code.");
    e.target.focus();
    return;
  }
  const queryObj = {
    acc_no,
    trans_year,
    division_id,
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
        APP_PROD_API.ACC_WISE_DTL_ENTRY
      }?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errMsg = await res.json();
      throw new Error(
        errMsg.message || "Error on Getting response! error messge not receive"
      );
    }

    const data = await res.json();
    //console.log(data?.count);

    if (data?.count >= 1) {
      const userConfirmed = confirm(
        "This account code is a group. Do you want to display combined result?"
      );

      if (userConfirmed) {
        cb((prev) => {
          return { ...prev, combine_acc_yn: data?.count > 0 ? "Y" : "N" };
        });
      } else {
        cb((prev) => {
          return { ...prev, combine_acc_yn: "N" };
        });
      }
    }
    setFormData((prev) => {
      return { ...prev, acc_desc: data?.acc_desc };
    });
  } catch (error) {
    console.error("Error while validating acc no:", error.message);
    toast.error(error.message);
    e.target.focus();
  }
};

export const fetchFormDataOnShow = async ({ formData, formControl, user, setFormData, setDetailFormData}) => {
  const { acc_no, rg_vch, from_date, to_date } = formData;



  if(!to_date){
    toast.error('Till date cannot be null')
    return
  }

let currentDate = new Date();
let toDateObj = new Date(to_date);

// If to_date is in the future
if (toDateObj > currentDate) {
  alert('To date cannot be in the future');
  return;
}



  const { combine_acc_yn } = formControl;
  const {global_division_id, global_fin_year, id} = user

  const queryObj = {
    acc_no,
    division_id:global_division_id,
    trans_year:global_fin_year,
    rg_vch,
    from_date,
    to_date,
    combine_acc_yn,
    id
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
        APP_PROD_API.ACC_WISE_DTL_ENTRY_SHOW
      }?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errMsg = await res.json();
      throw new Error( errMsg?.message || "Cannot get error message while fetching form data");
    }

    const data = await res.json();
    // //console.log(data?.opening_balance)
    // //console.log(data?.kard_data)
    setFormData(prev=>({...prev, ...data?.opening_balance, ...data?.hdrData}))
    setDetailFormData(data?.kard_data)

    // const openingBalance = data?.opening_balance ?? 0;
    // const closingBalance = data?.closing_balance ?? 0;
    // cb((prev) => ({
    //   ...prev,
    //   opening_balance: openingBalance,
    //   rate: openingBalance,
    //   cl_rate: openingBalance,
    //   closing_balance: closingBalance,
    // }));

    // // fetchTommainData({formData, user, setHdr:cb, closing_balance: openingBalance},setDetailData)
    // fetchTommainData(
    //   { formData, user, setHdr: cb, closing_balance: openingBalance },
    //   (newData) => setDetailData(newData ?? [])
    // );

  } catch (error) {
    console.error("Error fetching Form Data:", error);
    toast.error(error || "Something went wrong while fetching the formData");
  }
};
