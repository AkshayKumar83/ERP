import toast from "react-hot-toast";
import { validate_field } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";

export const priceListInitData = {
  row_status: "",
  c_code: "",
  c_name: "",
  it_code: "",
  it_desc: "",
  cus_it_code: "",
  cus_it_desc: "",
  eff_date: "",
  cus_it_prc: "",
  it_rate: "",
  active: "N",
};

export const cusCodeHelpListHeader = [
  { label: "customer code", key: "c_code" },
  { label: "customer desc", key: "c_name" },
];

export const ProductCodeHelpListHeader = [
  { label: "product code", key: "it_code" },
  { label: "product desc", key: "it_desc" },
];

export const productDescHelpListHeader = [
  { label: "product code", key: "it_code" },
  { label: "product desc", key: "it_desc" },
];

export const showCusProdHelpListHeader = [
  { label: "Customer product Code", key: "cus_it_code" },
  { label: "Description", key: "cus_it_desc" },
  { label: "Customer price", key: "cus_it_prc" },
  { label: "Tax paid Price", key: "it_rate" },
];

export const handleValidateField = (e, formStatus) => {
  if (!["Insert", "Update"].includes(formStatus)) {
    return;
  }
  const { name, value } = e.target;
 
  if (name === "c_code") {
    if (!value) {
      toast.error("Customer Code cannot be blank");
      document.getElementById("c_code").focus();
    }
    return;
  }
  if (name === "it_code") {
    if (!value) {
      toast.error("Item Code cannot be blank");
      document.getElementById("it_code").focus();
    }
    return;
  }
  if (name === "cus_it_code") {
    if (!value) {
      toast.error("Customer Product Code cannot be blank");
      document.getElementById("cus_it_code").focus();
    }
    return;
  }
  if (name === "cus_it_desc") {
    if (!value) {
      toast.error("Customer Item Description cannot be blank");
      document.getElementById("cus_it_desc").focus();
    }
    return;
  }
  if (name === "eff_date") {
    if (!value) {
      toast.error("Effective Date cannot be null");
      document.getElementById("eff_date").focus();
    }
    return;
  }
};

export const validCusCode = async (e, setData, formData = {}, formStatus) => {
  if (!formStatus) {
    return;
  }
  try {
    const { name, value } = e.target;

    // API Call to validate the field
    const getCusCode = await validate_field(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PRICE_LIST_DATA}`,
      name,
      value
    );
    if (getCusCode?.errMsg) {
      toast.error(getCusCode.errMsg);
      setData((prev) => {
        // Clear or update the form data if validation fails
        return {
          ...prev,
          c_name: "",
          c_code: "",
        }; // Or handle the state as needed
      });
      return false;
    } else {
      // Update form data if validation succeeds
      setData((prev) => {
        return {
          ...formData,
          c_name: getCusCode?.c_name, // You can add other fields returned from API if needed
        };
      });
    }
    return true;
  } catch (error) {
    console.error("Error during c_name validation:", error);
    toast.error("An error occurred while validating the customer name");
    return false;
  }
};

export const validProductCode = async (
  e,
  setData,
  formData = {},
  formStatus
) => {
  if (!formStatus) {
    return;
  }
  try {
    const { name, value } = e.target;

    // API Call to validate the field
    const getItCode = await validate_field(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PRICE_LIST_DATA}`,
      name,
      value
    );
    if (getItCode?.errMsg) {
      toast.error(getItCode.errMsg);
      setData((prev) => {
        // Clear or update the form data if validation fails
        return {
          ...prev,
          it_desc: "",
          it_code: "",
        }; // Or handle the state as needed
      });
      return false;
    } else {
      // Update form data if validation succeeds
      setData((prev) => {
        return {
          ...formData,
          it_desc: getCusCode?.it_desc, // You can add other fields returned from API if needed
        };
      });
    }
    return true;
  } catch (error) {
    console.error("Error during it_desc validation:", error);
    toast.error("An error occurred while validating the Product Name");
    return false;
  }
};

// export const validateFormOnSave = (formData) => {
//   let formValid = true;

//   if (formData?.cus_it_prc && formData.cus_it_prc < 0) {
//     toast.error(`Customer Item Price cannot be negative`);
//     formValid = false;
//   }

//   if (formData?.it_rate && formData.it_rate < 0) {
//     toast.error(`Item Price cannot be negative`);
//     formValid = false;
//   }

//   return formValid; // Return karega true/false
// };

export const handleCusItCodeBlur = async (e,formData, formStatus) => {
  // Run only if formStatus is Insert or Update
  if (formStatus !== "Insert" && formStatus !== "Update") return;

   const { name, value } = e.target;

  if (name === "cus_it_code") {
    if (!value) {
      toast.error("Customer Product Code cannot be blank");
      document.getElementById("cus_it_code").focus();
    }
    return;
  }

  const { c_code, it_code, cus_it_code } = formData;

  if (c_code && it_code && cus_it_code) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_PRICE_LIST_DATA
        }?c_code=${c_code}&it_code=${it_code}&cus_it_code=${cus_it_code}&formStatus=${formStatus}`
      );

      const data = await response.json();
     

      if (data?.exists === true) {
        toast.error(
          "Customer Product Code already exists in Combination of Customer Code and Product Code"
        );
      }
    } catch (error) {
      console.error("API check failed:", error);
      toast.error("Something went wrong while checking duplicate.");
    }
  }
};

export const createSearchPayloadForCusMstrSpecificSearch = (masterData) => {
  let payload = {};



  let masterKeys = {
    c_code: "c_code",
    // it_code: "it_code",
    // cus_it_code: "cus_it_code",
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

export const handleShowCustomerProducts = async (
  formData,
  formStatus,
  setFormData
) => {
  const { c_code, it_code } = formData;

  if (!c_code || !it_code) {
    toast.error("Customer Code and Item Code are required!");
    return;
  }

  try {
    const url =
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_PRICE_LIST_DATA
      }` +
      `?help_list=showCusProd&form_status=${formStatus}&c_code=${encodeURIComponent(
        c_code
      )}&it_code=${encodeURIComponent(it_code)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await response.json();

    if (Array.isArray(result) && result.length > 0) {
      const data = result[0]; // pick first one (if many exist)
      setFormData((prev) => ({
        ...prev,
        cus_it_code: data.cus_it_code,
        cus_it_desc: data.cus_it_desc,
        cus_it_prc: data.cus_it_prc,
        it_rate: data.it_rate,
      }));
    } else {
      toast.error("No data found for this customer and product.");
    }
  } catch (err) {
    toast.error("Error fetching customer product data.");
    console.error(err);
  }
};
