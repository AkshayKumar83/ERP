
export const upldDocTrackerInitialData = 
    {
        upldd_filename: "",
        doc_type: "",
        wc_id: "",
        wc_name: "",
        doc_id: "",
        doc_no: "",
        doc_date: "",
        paty_cd: "",
        paty_name: "",
        user_id: "",
    }


export const upldDocTrackerHeader = [
    { label: "Doc Type",width:'15%'},
    { label: "Wc Id",width:'3%'},
    { label: "Wc Name",width:'20%'},
    { label:"Doc Id",width:'7%'},
    { label: "Doc No ",width:'15%'},
    { label: "Doc date",width:'5%'},
    { label: "Party Code",width:'10%'},
    { label: "Party Name",width:'30%'},
    { label: "Redirect",width:'8%'},
   
  ];


 export const createSearchPayloadForUplDocTrackerSpecificSearch = (masterData) =>{
     let payload = {};



  let masterKeys = {
    upldd_filename: "upldd_filename",


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