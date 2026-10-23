import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
import { fetchAppData } from "../../../../utils/fetchUtils";
import _ from "lodash";

// MainTab Table Header.
export const headers = [
  { label: "Work Center", width: "65%" },
  { label: "Active", width: "5%" },
  { label: "Default Store", width: "4%" },
];

// this below data item  MainTab, Additional tab, and Technical tab
export const itemMasterInitData = {
  // MOMMITEM Data Block 
  gen_code_manual: "Y", // fronted field need to be delete before insert/update
  gen_code_auto: "N", // To keep track if auto gen button is clicked
  main_type: "",
  it_code: "",
  it_category: "",
  it_name: "",
  it_type: "",
  // t_it_type: "",
  it_base: "",
  // t_it_base: "",
  it_sub_c: "",
  // t_it_sub_c: "",
  l_code_value: "",
  it_length: "",
  unit1: "",
  brod_lvl_purch_cat: "",
  it_width: "",
  unit2: "",
  it_thick: "",
  it_finish: "",
  finish_desc: "",
  it_colour: "",
  fsn_flag: "F",
  colour_desc: "",
  drawing_no: "",
  rev_level: "",
  mfg_process_no: "",
  development_no: "",
  multi_loca: "",
  um_code: "",
  it_pu_um: "",
  it_p_umf: "",
  it_p_umf_disabled: false,
  it_bom_um: "",
  it_bom_umf: "",
  it_bom_umf_disabled: false,
  hsn_sac_code: "",
  fifo_base: "M",
  batch_control_flag: "N",
  make_req: "N",
  srlno_req: "N",
  treat_as_consumed_on_issue: "N",
  it_abc: "",
  it_fmp_pu: "P",
  fmp_final_component: "N",
  purac_head: "",
  salac_head: "",
  it_wgt_kg: "",
  it_sh_li: "",
  bulk_flag: "N",
  bulk_issue: "",
  it_lo_im: "L",
  active: "Y",
  inventory_yesno: "N",
  mrp_yesno: "N",
  phntm_asby: "N",
  spar_part: "N",
  pack_mod: "",
  pack_lot: "",
  lot_size: "",
  it_ltd: "",
  it_pu_lt: "",
  it_mfg_lt: "",
  it_insp_lt: "",
  cycontfreq: "",
  cyc_contva: "",
  last_cydt: "",
  optimumstk: "",
  optimumstk_days: "",
  max_stock: "",
  max_stock_days: "",
  min_stock: "",
  min_stock_days: "",
  wip_norm: "",
  reorder_qty: "",
  reorder_level: "",
  excise_as_capital: "N",
  yrop_rate: "",
  std_cost: "",
  matrl_cost: "",
  max_rate: "",
  labor_cost: "",
  ovrhd_cost: "",
  currwt_rt: "",
  buyer_code: "",
  prod_level_rej: "",
  it_dt_in: "",
  it_dt_out: "",
  old_drawing_no: "",
  rev_level_ref: "",
  rev_date: "",
  fc_code: "",
  drawing_no_ref: "",
  drawing_size: "",
  mfg_process_no_ref: "",
  drawing_ref: "",
  iic_ref_no: "",
  customer_drawing_no: "",
  install_rev_no: "",
  install_eff_date: "",
  install_size: "",
  tech_spec: "",
  drawing_pic: "",
  gen_code: "",
  auth_flag: "N",
  tarrif_no: "",
  create_by: "",
  create_date: "",
  update_by: "",
  update_date: "",
  item411: "",
  load_docs: "",
  extract_docs: "",
  remove_docs: "",
  drawing_display: "",
  item_storage_type: "",
  description: "",
  it_height: "",
  unit3: "",
  it_name_long: "",
  tag_reqmnt_individual: "N",
  it_grade: "",
  density: "",
  disp_it_level1: "",
  sub_assy_ref: "",
  old_it_code: "",
};

// MOMMSTOK data block name
export const itemMasterMainTabDtlInitData = {
  it_code: "",
  wc_id: "",
  wc_no: "",
  trans_year: "",
  active: "N",
  default_store: "N",
};

// Division tab DATA
// MOMMITEMDIV data block name
export const itemMasterDivisionInitData = {
  it_code: "",
  division_id: "",
  prod_transfer_to_wc_id: "",
  optimum_stock_oty: "",
  optimumstk_days: "",
  max_stock_days: "",
  max_stock_qty: "",
  min_stock_days: "",
  min_stock_qty: "",
  reorder_level: "",
  mrp_yn: "N",
};

// Make Detail Tab
// MDMMITMAKE data block name
export const itemMasterMakeDtlInitData = {
  it_code: "",
  make_abb: "",
  make_desc: "",
};

 export const itCodeHelpListHeader = [
  {label: "Item Code",key:"it_code"},
  {label: "Item Name",key:"it_name"},
]
 export const itDescHelpListHeader = [
  {label: "Item Code",key:"it_code"},
  {label: "Item Name",key:"it_name"},
]



export const makeHeaders = [
  { label: "Abbreviation", width: "30%" },
  { label: "Make Description", width: "50%" },
];

export const runSanitization = (key, value) => {
  const non_negative_arr = [
    "it_length",
    "it_width",
    "it_height",
    "it_thick",
    "density"
  ];

  const non_negative_null_zero_arr = [
    "it_p_umf",
    "it_bom_umf",
  ];

  

  const isNumericLike = (val) => {
    return !_.isNil(val) && !isNaN(Number(val));
  };

  const numValue = Number(value);
  
  if (non_negative_arr.includes(key)) {
    if (!isNumericLike(value) || numValue < 0) {
      throw new Error(`${key}: Value must be a non-negative number or numeric string.`);
    }
  } else if (non_negative_null_zero_arr.includes(key)) {
    if (!isNumericLike(value) || numValue < 0) {
      throw new Error(`${key}: Value must be a non-zero, non-negative number or numeric string.`);
    }

    const strValue = value.toString().split(".");
    const decimalDigits = strValue[1] || "";
    
    if (decimalDigits?.length > 5) {
      throw new Error(`${key}: Decimal digits cannot be greater than 5.`);
    }
  }

  return true;
};

export const runSubmitSanitization = (data) => {
  const non_negative_null_zero_arr = [
    "it_p_umf",
    "it_bom_umf",
  ];

  const isNumericLike = (val) => {
    return !_.isNil(val) && !isNaN(Number(val));
  };

  // Added zero constraint as well
  non_negative_null_zero_arr.forEach(fieldName => {
    const numValue = Number(data[fieldName]);
    if (!isNumericLike(data[fieldName]) || numValue <= 0) {
      throw new Error(`${fieldName}: Value must be a non-zero, non-negative number or numeric string.`);
    }
    const strValue = data[fieldName].toString().split(".");
    const decimalDigits = strValue[1] || "";

    if (decimalDigits?.length > 5) {
      throw new Error(`${fieldName}: Decimal digits cannot be greater than 5.`);
    }
  })

  return true;
};

// functions
export const triggerLevelFetchConfig = async (type, level1 = "", level2 = "", level3 = "", cbFn) => {
  try {
    const data = await fetchAppData(
      `${APP_PROD_API.GET_INVENTORY_LEVEL_DATA}?type=${type}&level1=${level1}&level2=${level2}&level3=${level3}`
    );
    cbFn(data);
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while fetching data, try again"
    );
  }
};

export const generateItemCode = async (c_level, cbFn) => {
  try {
    const data = await fetchAppData(`${APP_PROD_API.GET_GENERATE_INVENTORY_CODE}?c_level=${c_level}`);
    cbFn(data);
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while generating code, try again"
    );
  }
};

export const fetchStockPurchaseUnits = async ({ it_pu_um, um_code, it_bom_um }, cbFn) => {
  try {
    const data = await fetchAppData(`${APP_PROD_API.GET_INVENTORY_STOCK_PURCHASE_UNITS}?um_code=${um_code}&it_pu_um=${it_pu_um}&it_bom_um=${it_bom_um}`);
    cbFn(data);
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while generating code, try again"
    );
  }
};

const runSubmitInventoryTransformation = (data) => {
  const keys = [
    "it_height",
    "it_width",
    "it_length",
    "density",
    "it_thick"
  ];

  keys.forEach(key => {
    if (data.hasOwnProperty(key) && data[key] == "") {
      data[key] = null;
    }
  });

  return data;
};

export const upsertInventoryData = async (data, formStatus = "", user={}) => {
  try {
    data = runSubmitInventoryTransformation(data);
    runSubmitSanitization(data);
    data.division_id = user?.global_division_id // added these trans_year and division as they uses hardcoded befor dt 10.06.2025
    data.trans_year = user?.global_fin_year
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.UPSERT_INVENTORY_DATA}?operation=${formStatus}`, {
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"},
      method: "POST",
      credentials:'include',
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    toast.error(
      error?.message || "Some error occurred while generating code, try again"
    );
    throw new Error(error);
  }
};


  export const createSearchPayloadForItemMstrSpecificSearch = (masterData) =>{
     let payload = {};

  let masterKeys = {
   it_code :'it_code',
   it_name:"it_name",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);

  if (hasMasterKeys) {
    Object.keys(masterKeys).forEach((key) => {
      let value = masterData[key];

      // Exclude undefined and empty values ("")
      if (value !== undefined && value !== "") {
        payload[masterKeys[key]] = value;
      }
    });
  }

  return payload;
};