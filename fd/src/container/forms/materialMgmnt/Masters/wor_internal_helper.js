export const formDetailHeader = [
  { label: "Batch No/Job No", required: false, width: "30%", isHelpExist: true },
  { label: "Batch Date", required: false, width: "20%" },
  { label: "Expiry Date", required: false, width: "20%" },
  { label: "Batch Qty", required: false, width: "14%" },
];

export const formDataInitData = {
  adj_no: "",
  adj_dt: "",
  to_store_type: "",
  ok_reg_from: "O",
  wc_desc_from: "",
  wc_id_from: "",
  ok_reg_to: "O",
  wc_desc_to: "",
  wc_id_to: "",
  it_code: "",
  it_desc: "",
  qty: "",
  stock_qty: "",
  v_code: "",
  po_no: "",
  po_id: "",
  remark: "",
  cancel_flag: "N",
  cancel_reason: "",
  auth_flag: "N",
  auth_id: "",
  auth_dt: "",
  adj_type: "",
  trans_code: "",
  trans_year: "",
  division_id: "",
  cancel_dt: "",
  disp_flag: "",
  tot_value: "",
  rate: ""
};

export const formDetailInitData = {
  division_id: "",
  trans_year: "",
  trans_code: "",
  adj_no: "",
  it_code: "",
  create_id: "",
  create_date: "",
  update_id: "",
  update_date: "",
  batch_no: "",
  expiry_date: "",
  batch_qty: "",
  ok_rej: "",
  batch_dt: "",
  total_qty: "",
};  

//from wc helplist header

export const fromWCHelpListHeader = [
  { label: "WC ID", key: "wc_id" },
  { label: "Description", key: "description" },
];


//to wc helplist header

export const toWCHelpListHeader = [
  { label: "WC ID", key: "wc_id" },
  { label: "Description", key: "description" },
];


// item helplist header

export const itemHelpListHeader = [
  { label: "IT Code", key: "it_code" },
  { label: "IT Name", key: "it_name" },

];  

//batch no helplist header

export const batchHelpListHeader = [
  { label: "Batch No", key: "batch_no" },
  { label: "Batch Date", key: "batch_date" },

];    


export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
   adj_no: 'adj_no',
   adj_dt: 'adj_dt'
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  console.log("hasMasterKeys", hasMasterKeys);

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




