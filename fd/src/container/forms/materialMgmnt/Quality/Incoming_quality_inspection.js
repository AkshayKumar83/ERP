export const formDataInitData = {
  //it_code: "",
  it_name: "",
  old_it_code: "",
  drawing_no: "",
  rev_level: "",
  yrop_rate: "",
  currwt_rate: "",
  std_cost: "",
};

export const formDetailInitData = {
  qty_ok_in_stk_um: "",
  it_pu_um: "N",
  //id: 1
};

export const formDtlInqInitData = {
  //id: 1
};

export const formBatchInitData = {
  //  id: 1
};

export const formDvtnInitData = {};

export const mrirHelpListHeader = [{ label: "MRIR No", key: "mrir_no" }];

export const defectHelpListHeader = [
  { label: "Defect Code", key: "defect_det_code" },
  { label: "Description", key: "defect_det_desc" },
];

export const specHelpListHeader = [
  { label: "Spec", key: "spec" , },
  { label: "Spec No", key: "spec_no" },
  { label: "Instrument", key: "instrument" },
];

export const INQCIHeader = [
  { label: "ETS", width: "5%" },
  { label: "Movmt. Tkt.", width: "5%" },
  { label: "Rcv. Qty. in Pur.", width: "5%" },
  { label: "UOM", width: "5%" },
  { label: "Rcv. Qty. in Stk.", width: "5%" },
  { label: "UOM", width: "5%" },
  { label: "Accp. Qty. in Pur.", width: "5%" },
  { label: "UOM", width: "5%" },
  { label: "Accp. Qty. in Stk.", width: "5%" },
  { label: "UOM", width: "5%" },
  { label: "Rej. Qty. in Pur.", width: "5%" },
  { label: "Rej. Qty. in Stk.", width: "5%" },
  { label: "Picture", width: "5%" },
];

export const INQCIdetails = [
  { label: "Sample Size", width: "5%" },
  { label: "Qty Rej.", width: "5%" },
  { label: "Parameter", width: "5%", isHelpExist: true },
  { label: "Parameter Desc.", width: "5%" },
  { label: "Specification", width: "5%", isHelpExist: true },
  { label: "Specification Desc.", width: "5%" },
  { label: "Mode of Inspection", width: "5%" },
  { label: "1", width: "5%" },
  { label: "2", width: "5%" },
  { label: "3", width: "5%" },
  { label: "4", width: "5%" },
  { label: "5", width: "5%" },
  { label: "Judgement Ok/Not Ok", width: "5%" },
  { label: "Reason For rej. if Not Ok", width: "5%" },
  { label: "Disposition", width: "5%" },
  { label: "NC Ref. No.", width: "5%" },
  { label: "Actual", width: "5%" },
  { label: "Remarks", width: "5%" },
];

export const BatchHeader = [
  { label: "Batch No", width: "15%" },
  { label: "Batch Date", width: "10%" },
  { label: "Expiry Date", width: "10%" },
  { label: "Quantity Received", width: "10%" },
  { label: "Quantity Accepted", width: "10%" },
  { label: "Quantity Rejected", width: "10%" },
];

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    it_code: "",
    it_name: "",
    rev_level: "",
  };

  let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
  //console.log("hasMasterKeys", hasMasterKeys);

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
