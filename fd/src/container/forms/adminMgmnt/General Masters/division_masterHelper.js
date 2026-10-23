

export const stateHelpListHeader = [
    {label: "State ID", key: "state_id"},
    {label: "State Name", key: "state_name"}
]  

export const cityHelpListHeader = [
    {label: "City ID", key: "city_id"},
    {label: "City Name", key: "city_name"}
]   
 
export const customerHelpListHeader = [
    {label: "C Code", key: "c_code"},
    {label: "C Name", key: "c_name"}
]   

export const bankHelpListHeader = [
    {label: "Bank Code", key: "bank_code"},
    {label: "Bank Name", key: "bank_name"}
]    

export const createSearchPayloadForBVSpecificSearch = (masterData) => {
    let payload = {};
  
    //console.log('masterdata', masterData);
  
    let masterKeys = { 
  
      name: "name",
      
     
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
  





