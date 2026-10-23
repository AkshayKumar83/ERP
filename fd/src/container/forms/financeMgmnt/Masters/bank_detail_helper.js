// acc no help list header
export const accHelpListHeader = [
    {label: "Account No", key: "acc_no"},
    {label: "Account Desc", key: "acc_desc"}
]    

 export const createSearchPayloadForBVSpecificSearch = (masterData) => {
    let payload = {};
  
    //console.log('masterdata', masterData);
  
    let masterKeys = { 
  
      acc_no: "acc_no",
      
     
    };
  
    let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
    //console.log('hasMasterKeys', hasMasterKeys);
  
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
  
