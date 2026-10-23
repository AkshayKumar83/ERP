export const headers = [
    
    // { label: "SNO.",  width: '6%' },
    { label: "  Part No.  ",  width: "10%", isHelpExist: true, required: true },
    { label: "Part Name",  width: "25%" },
     { label: "Discount",  width: "8%" },
    { label: "CGST %",  width: "8%" },
    { label: "SGST %",  width: "8%" },
    { label: "IGST %",  width: "8%" },
    // { label: "Type.",  width: "8%" },
     { label: "Quantity",  width: "8%",required: true },
    { label: "Rate",  width: "8%",required: true },
    { label: "Basic Amount", width: "12%"},
   
];  


export const CCodeHelpList = [
  { label: "Customer Code", key: "c_code" },
  { label: "Description", key: "c_name" },
  { label: "State", key: "c_state" },
  { label: "Code", key: "state_code" },
  { label: "Address", key: "address" },

];

export const invoiceHelpListHeader = [
  { label: "Invoice Id", key: "inv_id" },
  { label: "Invoice No.", key: "inv_no" },

];

export const saleHelpListHeader = [
  { label: "Sale A/C Code", key: "acc_no" },
  { label: "Description", key: "acc_desc" },

];

export const dbHelpListHeader = [
  { label: "Debit A/C Code", key: "acc_no" },
  { label: "Description", key: "acc_desc" },
];

export const ItemHelpListHeader = [
  { label: "Item Code", key: "it_code" },
  { label: "Name", key: "it_name" },
];


// search in PO
export const createSrchPayloadSaleReturn = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    c_code: "c_code",
   
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