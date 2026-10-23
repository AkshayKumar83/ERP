export const formDetailHeader = [
  { label: "Item Code", required: true, width: "15%", isHelpExist: true },
  { label: "Description", required: false, width: "30%" },
  { label: "Physical Loc", required: true, width: "10%", isHelpExist: true  },
  { label: "Rack No", required: true, width: "10%" , isHelpExist: true },
  { label: "Bin No", required: true, width: "10%", isHelpExist: true  },
  { label: "Loc Qty", required: true, width: "10%" },
  { label: "Coordinates", required: false, width: "10%" },
];

export const formDataInitData = {
  wc_id: "",
  wc_no: "",
  description: ""

};

export const formDetailInitData = { 
  id: 1,
  it_code: "",
  description: "",
  physical_loca: "",
  rack_no: "",
  bin_no: "",
  loc_qty: "",
  coordinate: ""

};  

//acc no helplist header

export const itemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "It Name", key: "it_name" },
];


//physical helplist header

export const physicalListHeader = [
  { label: "Physical Loca", key: "physical_loca" },
 
];

// rack helplist header

export const rackHelpListHeader = [
  { label: "Rack No", key: "rack_no" },

];  

//bin no helplist header

export const binHelpListHeader = [
  { label: "Bin No", key: "bin_no" },

];      


export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
     wc_id: "wc_id"
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




