import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

export const checkUnlink = async (formData) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_UNLINK_AP_BILL_CHK_UNLINK
      }`,
      {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to fetch TDS entries");
    }

    return true;
  } catch (error) {
    toast.error(
      error.message ||
        "Cannot get error while checking unlinking the current record"
    );
    return false;
  }
};

export const createSearchPaylaod = (masterData) => {
  let payload = {};

  //console.log("masterdata", masterData);

  let masterKeys = {
    bill_no: "bill_no",
    bill_dt: "bill_dt",
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
