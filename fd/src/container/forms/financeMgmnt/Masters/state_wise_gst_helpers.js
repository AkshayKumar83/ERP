export const headers = [
  { label: "State Name", required: false, width: "40%" },
  { label: "HSN Code", required: true, width: "20%", isHelpExist: true},
  { label: "SGST, CESS", required: true, width: "8%" },
  { label: "CGST, CESS", required: true, width: "8%" },
  { label: "IGST, CESS", required: true, width: "8%" },
  { label: "UGST, CESS", required: true, width: "8%" },
  { label: "From Amount, To Amount", required: true, width: "7%" },
  { label: "Effective Date, Other Tax Perc", required: true, width: "4%" },
  { label: "Eligible for Credit", required: false, width: "5%" },
  { label: "GST Exempted", required: false, width: "4%" },
];

export const stateWiseGstInitialData = {
  gst_state_code: "",
  state_name: "",
  hsn_sac_code: "",
  sal_or_st: "S",
  sgst_perc: "",
  sgst_cess_perc: 0,
  cgst_perc: "",
  cgst_cess_perc: 0,
  igst_perc: "",
  igst_cess_perc: 0,
  ugst_perc: "",
  ugst_cess_perc: 0,
  amount_from: 0,
  amount_to: 0,
  eff_dt: "",
  other_tax: 0,
  credit_allowed: "Y",
  exempt_flag: "N",
  record_id: "",
};


export const HSNHelpListHeader = [
 { label: "Item Code", key: "it_code" },
 { label: "HSN Code", key: "hsn_sac_code" },
];
export const HSNHelpListHeaderForSearch = [
 { label: "HSN Code", key: "hsn_sac_code" },
];

export const createSearchPayloadForStateGst = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    gst_state_code: "gst_state_code",
    hsn_sac_code: "hsn_sac_code",
    sal_or_st: "sal_or_st",
    eff_dt: "eff_dt",
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
