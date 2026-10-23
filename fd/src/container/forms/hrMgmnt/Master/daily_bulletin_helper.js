export const formDataHeader = [
  { label: "News Date", required: true, width: "20%", isHelpExist: false },
  { label: "News", required: true, width: "70%", isHelpExist: false },
 
];

export const formInitData = { 
  id: 1,
  news_date: "",
  bulletin_news: ""
};   


export const createSearchPayloadForBVSpecificSearch = (masterData) => {
  let payload = {};

  console.log("masterdata", masterData);

  let masterKeys = {
    //register_type: register_type,
     news_date: "news_date"
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

