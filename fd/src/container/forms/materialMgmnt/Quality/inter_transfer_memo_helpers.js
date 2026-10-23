export const headers = [
  { label: "Item Code", required: true, width: "12%", isHelpExist: true },
  { label: "Item Description", required: true, width: "30%" },
  { label: "Catalog Code", required: false, width: "10%" },
  { label: "UOM", required: false, width: "12%" },
  { label: "Rate", required: false, width: "5%" },
  { label: "SRS Quantity", required: false, width: "12%" },
  { label: "Physical Loc", required: false, width: "12%", isHelpExist: true },
  { label: "Quantity", required: true, width: "12%" },
];

export const formDataInitData = {
  ok_rej: "O",
  trans_type: "I",
  mat_trans_type: "I",
  wc_id: "",
  wc_no: "",
  wc_description: "",
  kit_no: "",
  from_wc_id: "",
  to_wc_id: "",
  from_wc_desc: "",
  srs_id: "",
  srs_no: "",
  to_wc_desc: "",
  srs_id: "",
  srs_no: "",
  to_wc_desc: "",
  receive_issue_flag: "",
  doc_no: "",
  v_code: "",
  doc_date: "",
  acc_code: "",
  dept_code: "",
  cancel_memo: "",
  remark: "",
  division_id: "",
  trans_year: "",
  doc_id: "",
  tr_type: "",
  authorised: "N",
};

export const formDetailInitData = {
  id: 1,
  wc_id: "",
  it_code: "",
  it_name: "",
  catalog_code: "",
  um_code: "",
  rr_acptqty: "",
  rate: "",
  physical_loc: "",
  qty: "",
  srs_qty: "",
  cost_centr: "",
  cc: "",
  cost_desc: "",
  pur_code: "",
  purpose: "",
  store_stock: "",
  doc_id: "",
  init_it_code: "",
};

export const formBatchInitData = {
  id: 1,
  doc_id: "",
  it_code: "",
  ok_rej: "",
  batch_no: "",
  batch_date: "",
  batch_store_qty: "",
  batch_qty: "",
  tot_batch_qty: "",
  mrir_no: "",
};

export const batchHeaders = [
  { label: "Batch No", required: false, width: "12%", isHelpExist: true },
  { label: "Batch Date", required: false, width: "10%" },
  { label: "Mrir No", required: false, width: "12%" },
  { label: "Batch Stock Qty", required: false, width: "12%" },
  { label: "Batch Qty", required: false, width: "5%" },
];

// WC header helplist header

export const wchHelpListHeader = [
  { label: "WC no", key: "wc_no" },
  { label: "Description", key: "description" },
];

export const transHelpListHeader = [
  { label: "From Desc", key: "from_desc" },
  { label: "To Desc", key: "to_desc" },
];

export const srsHelpListHeader = [{ label: "SRS No", key: "srs_no" }];

export const itemHelpListHeader = [
  { label: "It Code", key: "it_code" },
  { label: "It Name", key: "it_name" },
  { label: "UM Code", key: "um_code" },
  { label: "Catalog Code", key: "catalog_code" },
];

export const costHelpListHeader = [
  { label: "Prefix", key: "prefix" },
  { label: "Description", key: "description" },
  { label: "Code", key: "code" },
];

export const purHelpListHeader = [
  { label: "Code", key: "code" },
  { label: "Description", key: "purpose" },
];

export const physHelpListHeader = [
  { label: "Physical Loc", key: "physical_loc" },
];

export const batchHelpListHeader = [
  { label: "Batch No", key: "batch_no" },
  { label: "Batch Date", key: "batch_date" },
  { label: "Batch Qty", key: "batch_qty" },
  { label: "MRIR No", key: "mrir_no" },
];

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
    trans_code: "trans_code",
    doc_no: "doc_no",
    doc_date: "doc_date",
    ok_rej: "ok_rej",
    trans_type: "trans_type",
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
