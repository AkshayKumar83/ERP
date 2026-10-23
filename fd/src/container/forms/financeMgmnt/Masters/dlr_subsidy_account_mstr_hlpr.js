
 export const CrHelpListHeader = [
  { label: "Credit Acc No.", key: "acc_no" },
  { label: "Name", key: "acc_desc" },
];
 export const DrHelpListHeader = [
  { label: "Debit Acc No.", key: "acc_no" },
  { label: "Name", key: "acc_desc" },
];



 export const createSearchPayloadForDlrSubsidyAccountMstrSpecificSearch = (masterData) =>{
     let payload = {};



  let masterKeys = {
    cr_acc_no: "cr_acc_no",
    dr_acc_no:"dr_acc_no",

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