//**  start_transaction_block
//**  post_data

import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../utils/api";

export async function start_transaction_block(API_URL) {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    const responseBody = await response.json();
    return responseBody;
  } catch (error) {
    throw error;
  }
}

// use this post_data function for insert the formData
export async function post_data(API_URL, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    const responseBody = await response.json();
    return responseBody;
  } catch (error) {
    throw error;
  }
}

// QUERY DATA API
export async function query_data(API_URL) {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// VALIDATE INDIVIDUAL FIELD FROM DB            --builded on 07-10-2024
export async function validate_field(
  API_URL,
  fieldName,
  fieldVal,
  otherQueryPera = {}
) {
  let API_STRING;
  try {
    if (!Object.keys(otherQueryPera).length) {
      API_STRING = `${API_URL}?${fieldName}=${fieldVal}`;
    } else {
      // Attach additional key-value pairs from otherQueryPera to the API_STRING
      const otherParams = new URLSearchParams(otherQueryPera).toString();
      API_STRING = `${API_URL}?${fieldName}=${fieldVal}&${otherParams}`;
    }

    const response = await fetch(API_STRING);
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// this function give return true if field is empty
export const is_field_blank = (e) => {
  const { name, value } = e.target;
  if (!value) {
    return true;
  }
  return false;
};

// ##################### Date Related validation functions

//Date validator from current system Date
export function currentDate(inputDate) {
  const currentDate = new Date(); // Get the current date
  const providedDate = new Date(inputDate); // Convert inputDate to Date object

  // Normalize the dates by setting the time to 00:00:00 to compare only the date part
  currentDate.setHours(0, 0, 0, 0);
  providedDate.setHours(0, 0, 0, 0);

  if (isNaN(providedDate)) {
    console.log("Invalid date provided.");
    return;
  }

  if (providedDate > currentDate) {
    return {
      status: false,
      message: "The provided date is the larger then the current date",
    };
  } else if (providedDate < currentDate) {
    return {
      status: false,
      message: "provided date is lesser then current date",
    };
  } else {
    return {
      status: true,
      message: "The provided date is the current date",
    };
  }
}

export function dateNotInFuture(inputDate) {
  const currentDate = new Date(); // Get the current date
  const providedDate = new Date(inputDate); // Convert inputDate to Date object

  // Normalize the dates by setting the time to 00:00:00 to compare only the date part
  currentDate.setHours(0, 0, 0, 0);
  providedDate.setHours(0, 0, 0, 0);

  if (isNaN(providedDate)) {
    console.log("Invalid date provided.");
    return;
  }

  if (providedDate > currentDate) {
    return {
      status: false,
      message: "The provided date is the larger then the current date",
    };
  } else {
    return {
      status: true,
      message: "The provided date is the current date",
    };
  }
}

export async function validateField(
  API_URL = "N",
  fieldName = "N",
  fieldValue = ""
) {
  if (fieldName === "N" || API_URL === "N") {
    throw new Error(
      "Please provide all required parameters to the validateField function"
    );
  }

  // Construct the URL with query parameters
  const url = `${API_URL}?${fieldName}=${fieldValue}`;

  try {
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      const messageFromServer = await response.json();
      return messageFromServer;
      // throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const responseBody = await response.json();
    return responseBody; // Backend will return if the field value is valid or not
  } catch (error) {
    console.error("Validation error:", error);
    // return { valid: false, message: 'Error during validation' };
  }
}

// setup options for dropdown field using this funciton
export const formatOptions = (items, id, description) =>
  items.map((item) => ({
    value: item[id],
    label: item[description],
  }));

//this function will check the given perameter of date will exist between the current fincancial year
export const checkFinYear = async (currDate, currFinYear) => {
  //Declear variables
  let st_date;
  let end_date;
  let cur_date; // Declare cur_date

  //first fetch the current finYear
  // const getTransYr = await fetch(`http://localhost:3080/fin_year`, {
  //     method: "GET",
  // });
  // if (getTransYr.status === 200) {
  //     const trans_yr = await getTransYr.json();
  //     st_date = new Date(trans_yr.st_date.split("T")[0]);
  //     // console.log(st_date);
  //     end_date = new Date(trans_yr.end_date.split("T")[0]);
  //     // console.log(end_date);
  //     cur_date = new Date(dt1);
  //     // console.log(cur_date);
  //     const isDateBtwRange = cur_date >= st_date && cur_date <= end_date;
  //     return isDateBtwRange; // Return the result
  // } else {
  //     throw new Error("Failed to fetch trans_yr data");
  // }
};

//this function will check the bill date is not more than the voucher date
export const check_Bill_dt_btw_vchr_dt = (vchrDt = "", BillDt = "") => {
  if (!vchrDt) {
    toast.error("Voucher Date cannot be Blank");
    return false;
  }

  if (vchrDt && BillDt) {
    const nwVchrDt = new Date(vchrDt);
    const nwBillDt = new Date(BillDt);
    const isBillDtValid = nwBillDt <= nwVchrDt;
    if (!isBillDtValid) {
      toast.error("Bill Date Cannot be more than Voucher Date");
    }
    return isBillDtValid;
  }
};

export const checkRequiredFields = (data, requiredFields, isSingle = false) => {
  const isValidRow = (row) => {
    return requiredFields.every((field) => {
      return !!(row[field] && String(row[field]).trim() !== "");
    });
  };

  if (isSingle) {
    return isValidRow(data);
  }

  return data.every(isValidRow);
};

//---------------------------------------- started make these resuable function on 18.04.2025
export const checkOpenYearDate = async (enterDate) => {
    if(!enterDate){
        toast.error('Please Enter Date')
    }
  const response = await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CHECK_OPEN_YEAR_DATE}?date =${enterDate}`,
    { method: "GET", credentials: "include" }
  );

  if(response.ok){
    const result = await response.json()
    console.log(result)
  }

};
