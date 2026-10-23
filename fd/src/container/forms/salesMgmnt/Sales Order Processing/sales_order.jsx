import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  TabContent,
  TabPane,
  Form,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";

import SaleOrderChargesTab from "./sale_order_charges_tab";
import SalesOrderItems from "./sales_order_item";
import {
  discountInitFormDataTemplate,
  volumeDiscountInitFormDataTemplate,
  chargesInitData,
  itemsInitData,
  subContractHeadInitDataTemplate,
  subContractDetailInitDataTemplate,
  controlFieldData,
  advanceInitDetailFormDataTemplate,
  advanceInitHeadFormDataTemplate,
  createSearchPayload,
  customerCodeHelpList,
  salesPersonHelpList,
  catalogCodeHelpList,
  itemCodeHelpList,
  requiredFieldsItemForm,
  requiredFieldsMainForm,
} from "./sales_order_helper";
import SalesOrderMain from "./sales_order_main";
import SalesOrderSubcontract from "./sales_order_subcontract";
import SalesOrderVolumeDiscount from "./sales_order_volume_discount";
import SalesOrderAdvance from "./sales_order_advance";
import SalesOrderDiscount from "./sales_order_discount";
import { APP_PROD_API } from "../../../../utils/api";
import { fetchAppData } from "../../../../utils/fetchUtils";
import HelpList from "../../../../components/HelpList";
import toast from "react-hot-toast";
import { set } from "lodash";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { useSelector } from "react-redux";
import { validate } from "../../memberMgmnt/Loan/efa_helper";
import Loader from "../../../../components/GenricComponents/Loader";

const TYPES = {
  ITEMS: "items",
  DISCOUNT: "discount",
  SUB_CONTRACT: "subContract",
  VOL_DISCOUNT: "volDiscount",
  ADVANCE: "advance",
};

const SalesOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [mainFormData, setMainFormData] = useState({ ...chargesInitData }); //todo change its variable name
  const [chrgFormData, setChrgFormData] = useState({ ...chargesInitData });
  const [itemFormData, setItemFormData] = useState([{ ...itemsInitData }]);
  const [formLoading, setFormLoading] = useState(false); //loading on submit
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});
  const [itemFocusedRowIndex, setItemFocusedRowIndex] = useState(0);
  const [originalMainFormData, setOriginalMainFormData] = useState(null);
  const [originalItemFormData, setOriginalItemFormData] = useState([]);

  const [discountFormData, setDiscountFormData] = useState([
    discountInitFormDataTemplate,
  ]);
  // const [discountData, setDiscountData] = useState([]);
  const {
    formStatus,
    searchQuery,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    setSearchQuery,
  } = useFormStatus();

  const [currentFormTab, setCurrentFormTab] = useState("Main"); // Default tab-> on first time render

  // SUBCONTRACT FORM DATA STATE (AS IT HAVE HEAD AND DETAIL BLOCK)
  const [subcontractHeadData, setSubcontractHeadData] = useState({
    ...subContractHeadInitDataTemplate,
  });
  const [subcontractDetailData, setSubcontractDetailData] = useState([
    { ...subContractDetailInitDataTemplate },
  ]);

  // ADVANCE FORM DATA STATE (AS IT HAVE HEAD AND DETAIL BLOCK)
  const [advanceHeadData, setAdvanceHeadData] = useState({
    ...advanceInitHeadFormDataTemplate,
  });
  const [advanceDetailData, setAdvanceDetailData] = useState([
    { ...advanceInitDetailFormDataTemplate },
  ]);

  const [volumeDiscountData, setVolumeDiscountData] = useState([
    {},
    {},
    {},
    {},
  ]);
  const [itemDiscountData, setItemDiscountData] = useState([
    {},
    {},
    {},
    {},
    {},
    {},
  ]);
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("c_code");
  const [searchQueryData, setSearchQueryData] = useState({});

  const { user } = useSelector((state) => state.auth);

  // CONTROLL FEILD //
  const [formControlField, setFormControlField] = useState({
    ...controlFieldData,
  });

  const [tabs, setTabs] = useState(["Main"]);

  const fieldRefs = useRef({});
  const isValidationInProgress = useRef(false);

  const getFieldRef = (fieldName) => {
    if (!fieldRefs.current[fieldName]) {
      fieldRefs.current[fieldName] = React.createRef();
    }
    return fieldRefs.current[fieldName];
  };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      if (!(await validateMainForm())) return;
      if (!(await validateItemForms())) return;

      const payload = preparePayload();
      await submitForm(payload);
      toast.success(
        `Sales order ${
          formStatus === "Update" ? "updated" : "submitted"
        } successfully!`
      );
      if (formStatus !== "Update") {
        handleCancel();
        setFormStatus("");
      }
    } catch (error) {
      toast.error(error?.message || "Please check the form or contact admin");
      console.error("Form submission error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const validateMainForm = async () => {
    for (const field of requiredFieldsMainForm) {
      const isValid = await validateFormFields(
        field,
        itemFocusedRowIndex,
        true
      );
      if (!isValid) return false;
    }
    return true;
  };

  const validateItemForms = async () => {
    if (
      itemFormData.length === 1 &&
      (!itemFormData[0].it_code || itemFormData[0].it_code.trim() === "")
    ) {
      return true;
    }

    for (let i = 0; i < itemFormData.length; i++) {
      for (const field of requiredFieldsItemForm) {
        const isValid = await validateFormFields(
          field,
          itemFocusedRowIndex,
          true,
          i
        );
        if (!isValid) return false;
      }
    }
    return true;
  };

  const preparePayload = () => {
    const isUpdate = formStatus === "Update";
    let mhsmordr = {};
    let mdsmordr = [];

    if (isUpdate) {
      mhsmordr = {
        order_id: mainFormData?.order_id,
        division_id: user.global_division_id,
        trans_year: user.global_fin_year,
        ...getModifiedFields(originalMainFormData, mainFormData),
      };

      mdsmordr = itemFormData
        .map((item, index) => {
          const diff = getModifiedFields(
            originalItemFormData[index] || {},
            item
          );
          // Always include it_code even if not modified
          if (item.it_code) {
            diff.it_code = item.it_code;
          }
          if (item.sr_no) {
            diff.sr_no = item.sr_no;
          }

          // Delete old_qty_ord if present
          delete diff.old_qty_ord;
          return Object.keys(diff).length > 0 ? { ...diff } : null;
        })
        .filter(Boolean);
    } else {
      mhsmordr = {
        ...mainFormData,
        division_id: user.global_division_id,
        trans_year: user.global_fin_year,
        cancel_flag: "N",
      };
      mdsmordr = itemFormData || [];
    }

    return { mhsmordr, mdsmordr };
  };

  const submitForm = async (payload) => {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_DATA_FOR_SALES_ORDER_FORM
      }?form_status=${formStatus}`,
      {
        method: formStatus === "Update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials:'include'
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Failed to submit form");
    }

    return await response.json();
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setMainFormData({ ...chargesInitData });
    setChrgFormData({ ...chargesInitData });
    setItemFormData([{ ...itemsInitData }]);
    setDiscountFormData([discountInitFormDataTemplate]);
    setCurrentFormTab("Main");
    setSubcontractHeadData({ ...subContractHeadInitDataTemplate });
    setSubcontractDetailData([{ ...subContractDetailInitDataTemplate }]);
    setAdvanceHeadData({ ...advanceInitHeadFormDataTemplate });
    setAdvanceDetailData([{ ...advanceInitDetailFormDataTemplate }]);
    setVolumeDiscountData([{}, {}, {}, {}]);
    setItemDiscountData([{}, {}, {}, {}, {}, {}]);
  }, []);

  const handleChange = (tab, name, value, index, event, block = null) => {
    const cursorPosition = event?.target?.selectionStart;
    const newVal = value.toUpperCase();

    switch (tab) {
      case "MainTab":
        setMainFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "ChargesTab":
        setChrgFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "ItemTab":
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;
      case "discountTab":
        setDiscountFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;
      case "subContractTab":
        if (block === "head") {
          setSubcontractHeadData((prev) => ({ ...prev, [name]: newVal }));
        } else {
          setSubcontractDetailData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
        }
        break;
      case "advanceTab":
        if (block === "head") {
          setAdvanceHeadData((prev) => ({ ...prev, [name]: newVal }));
        } else {
          setAdvanceDetailData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
        }
        break;

      default:
        break;
    }

    if (formStatus === "Search") {
      setSearchQueryData((prev) => ({ ...prev, [name]: newVal }));
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target)
        event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  // VOLUME DISCOUNT TAB -> DISCOUNT TABLE FIELDS
  const handleVolumeDiscountChange = (name, value, rowIndex) => {
    setVolumeDiscountData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [name]: value };
      return newData;
    });
  };

  // VOLUME DISCOUNT TAB -> ITEM FIELDS
  const handleItemDiscountChange = (name, value, index) => {
    setItemDiscountData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: value };
      return newData;
    });
  };

  // ADD TABLE'S ROW
  const handleAddRow = useCallback(
    (type) => {
      if (type === TYPES.DISCOUNT) {
        setDiscountFormData((prevData) => [
          ...prevData,
          { ...discountInitFormDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.SUB_CONTRACT) {
        setSubcontractDetailData((prevData) => [
          ...prevData,
          { ...subContractDetailInitDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.VOL_DISCOUNT) {
        setSubcontractDetailData((prevData) => [
          ...prevData,
          { ...volumeDiscountInitFormDataTemplate, id: prevData.length + 1 },
        ]);
      } else if (type === TYPES.ADVANCE) {
        setAdvanceDetailData((prevData) => [
          ...prevData,
          { ...advanceInitDetailFormDataTemplate, sr_no: prevData.length + 1 },
        ]);
      } else if (type === TYPES.ITEMS) {
        setItemFormData((prevData) => [
          ...prevData,
          { ...itemsInitData, sr_no: prevData.length + 1 },
        ]);
      }
    },
    [
      discountFormData,
      subcontractDetailData,
      volumeDiscountData,
      advanceDetailData,
    ]
  );

  const [dropdownData, setDropdownData] = useState({
    typeList: [],
    currencyList: [],
    paymentTerms: [],
    modeOfTransport: [],
    priceBasis: [],
    packingOptions: [],
  });

  useEffect(() => {
    if (!formStatus) return; // avoid calling on initial mount if empty

    const fetchDropdownData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.FETCH_SALES_ORDER_DROPDOWN_DATA
          }`,{credentials:'include'}
        );
        const data = await response.json();
        setDropdownData(data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    if (formStatus === "Insert") {
      // order_dt and eff_dt whould be by default set to current Date
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD format
      setMainFormData((prev) => ({
        ...prev,
        order_dt: formattedDate,
        eff_dt: formattedDate,
        order_amd_no: "0",
      }));
      //focus first form field
      const firstFormField = fieldRefs.current["inv_type"]?.current;
      if (firstFormField) {
        firstFormField.focus();
      }
    }

    if (formStatus === "Update") {
      setOriginalMainFormData(JSON.parse(JSON.stringify(mainFormData)));
      setOriginalItemFormData(JSON.parse(JSON.stringify(itemFormData)));
    }

    fetchDropdownData();
  }, [formStatus]);

  const getModifiedFields = (original, current) => {
    const modified = {};
    for (const key in current) {
      if (current[key] !== original[key]) {
        modified[key] = current[key];
      }
    }
    return modified;
  };

  // ON QUERY SET THE FORMDATA
  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      setMainFormData(queryData?.mainFormData);
      setTotalRecordCount(queryData?.count);
      setItemFormData(queryData?.itemFormData);
    },
    [formStatus, currentRecordNo]
  );

  const handleDeleteinDiscountTable = useCallback(
    (index) => {
      setDiscountFormData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [discountFormData]
  );

  const handleDeleteinSubcontractTable = useCallback(
    (index) => {
      setSubcontractDetailData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [subcontractDetailData]
  );

  const handleDeleteinVolumeTable = useCallback(
    (index) => {
      setVolumeDiscountData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [setVolumeDiscountData]
  );

  // CHANGING TAB
  const handleChangeTab = (getTab) => {
    if (getTab === "CancelOrder") {
      if (mainFormData.flag === "Y") {
        setConfirmationConfig({
          title: "Cancel order",
          description: `Authorised Sales Order cannot be cancel`,
          uniqKey: "authorize_cancel",
          showConfirm: false,
        });
      } else {
        setConfirmationConfig({
          title: "Cancel order",
          description: `Are you sure you want to cancel this sale order ?`,
          uniqKey: "authorize_cancel",
        });
      }
      setConfirmationModal(true);
      return;
    }
    setTabs([getTab]);
    setCurrentFormTab(getTab);
  };

  const handleSearch = async () => {
    try {
      const searchPayload = createSearchPayload(searchQueryData);
      const queryList = new URLSearchParams(searchPayload);
      setSearchQuery(searchPayload);
      const data = await fetchAppData(
        `${APP_PROD_API.GET_DATA_FOR_SALES_ORDER_FORM}?formStatus=${formStatus}&${queryList}`
      );
      if (data?.count === 0) {
        toast.error("No matching data record found");
        return;
      }
      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  const handleHelpList = (data, htmlFor, focusedRowIndex = 0) => {
    setHelpList(data);
    setHelpFor(htmlFor);
    if (focusedRowIndex) {
      setItemFocusedRowIndex(focusedRowIndex);
    }
  };

  const toggleHelpModal = () => setHelpList(!helpList);

  const fetchCustomerDependentData = async (c_code) => {
    try {
      const result = await fetchAppData(
        `${APP_PROD_API.GET_CUSTOMER_DEPENDENT_DATA}?c_code=${c_code}`
      );

      const {
        curr_cd, // Currency code
        term_code,
        mode_cd,
        price_basis,
        curr_conv,
        octroi_flg, // 1 or 2 based on octroi = 'Y'
        frt_flg, // 1 or 2 based on freight = 'Y'
        ins_flg, // 1 or 2 based on insurance = 'Y'
        final_dest, // Fallback logic between port_disc or city-based function
      } = result;

      setMainFormData((prev) => ({
        ...prev,
        curr_cd,
        term_code,
        mode_cd,
        price_basis,
        curr_conv,
        octroi_flg,
        frt_flg,
        ins_flg,
        final_dest,
      }));
    } catch (error) {
      console.error("Error fetching customer dependent data:", error);
      toast.error("Could not load customer details");
    }
  };

  const onSelectHelpItem = async (data) => {
    //switch case for helpFor
    switch (helpFor) {
      case "c_code":
        setMainFormData((prev) => ({
          ...prev,
          c_code: data.c_code,
          c_name: data.c_name,
        }));
        // fetch dependent data
        await fetchCustomerDependentData(data.c_code);
        break;
      case "sales_pers_cd":
        setMainFormData((prev) => ({
          ...prev,
          sales_pers_cd: data.emp_cd,
          sales_pers_name: data.emp_name,
        }));
        break;
      case "catalog_code":
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            catalog_code: data.catalog_code,
            it_code: data.it_code,
            it_desc: data.it_desc,
          };
          return newData;
        });
        break;
      case "it_code":
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            it_code: data.it_code,
            it_desc: data.it_desc,
            c_code: mainFormData?.c_code ?? "",
          };
          return newData;
        });
        break;
      default:
        break;
    }
  };

  const getHelpListHeaders = () => {
    if (helpFor === "c_code") {
      return customerCodeHelpList;
    }
    if (helpFor === "sales_pers_cd") {
      return salesPersonHelpList;
    }
    if (helpFor === "catalog_code") {
      return catalogCodeHelpList;
    }
    if (helpFor === "it_code") {
      return itemCodeHelpList;
    }
    return [];
  };

  const validateFormFields = async (
    fieldName,
    focusedRowIndex = 0,
    onSubmit = false,
    validationItemIndex = 0
  ) => {
    if (isValidationInProgress.current) return;
    if (formStatus !== "Insert" && formStatus !== "Update") return true;
    isValidationInProgress.current = true;
    if (focusedRowIndex && !onSubmit) {
      setItemFocusedRowIndex(focusedRowIndex);
    }
    let isValid = true;
    switch (fieldName) {
      case "inv_type":
        isValid = validateFieldNotEmpty(
          "inv_type",
          "Invoice Type cannot be empty"
        );
        break;
      case "c_code":
        isValid = validateCustomerCode(onSubmit); // 👈 await async call
        break;
      case "c_po_no":
        isValid = validateFieldNotEmpty(
          "c_po_no",
          "Customer PO No cannot be empty"
        );
        break;
      case "c_po_dt":
        isValid = validateCustomerPODate();
        break;
      case "curr_conv":
        isValid = validateCurrConversion();
        break;
      case "eff_dt":
        isValid = validateEffDate();
        break;
      case "end_dt":
        isValid = validateEndDate();
        break;
      case "delivery_date":
        isValid = validateDeliveryDate();
        break;
      case "term_code":
        isValid = validateFieldNotEmpty(
          "term_code",
          "Payment Term cannot be empty"
        );
        break;
      case "price_basis":
        isValid = validateFieldNotEmpty(
          "price_basis",
          "Price Basis cannot be empty"
        );
        break;
      case "mode_cd":
        isValid = validateFieldNotEmpty(
          "mode_cd",
          "Mode of Transport cannot be empty"
        );
        break;
      case "catalog_code":
        isValid = await validateItemCode(onSubmit, validationItemIndex);
        break;
      case "it_code":
        isValid = await validateItemCode(onSubmit, validationItemIndex);
        break;
      case "qty_ord":
        isValid = validateQtyOrd(onSubmit, validationItemIndex);
        break;
      case "mat_rat":
        isValid = processMatRate(onSubmit, validationItemIndex);
        break;
      case "perunit":
        isValid = validatePerUnit(onSubmit, validationItemIndex);
        break;
      default:
        return true;
    }

    if (!isValid) {
      const index = onSubmit ? validationItemIndex : itemFocusedRowIndex;
      const itemRowValidationFields = [
        "catalog_code",
        "it_code",
        "qty_ord",
        "mat_rat",
      ];
      setTimeout(() => {
        const field = itemRowValidationFields.includes(fieldName)
          ? `${fieldName}_${index}`
          : fieldName;
        const currentFieldRef = fieldRefs.current[field]?.current;
        if (currentFieldRef) {
          currentFieldRef.focus();
        }
        isValidationInProgress.current = false;
      }, 0); // Timeout to avoid conflict with blur event
    } else {
      isValidationInProgress.current = false;
    }

    return isValid;
  };

  const validateCustomerCode = (onSubmit) => {
    if (!helpList) {
      if (!mainFormData?.c_code) {
        toast.error("Please enter Customer Code");
        return false;
      }
    }
    if (mainFormData?.c_code && !onSubmit) {
      setMainFormData((prev) => ({
        ...prev,
        ship_to_code: mainFormData?.c_code,
        ship_to_name: mainFormData?.c_name,
        bill_to_code: mainFormData?.c_code,
        bill_to_name: mainFormData?.c_name,
      }));
    }
    return true;
  };

  const validateCustomerPODate = () => {
    if (!mainFormData?.c_po_dt) {
      toast.error("Please enter Customer PO Date");
      return false;
    }
    const today = new Date();
    const selectedDate = new Date(mainFormData?.c_po_dt);
    if (selectedDate > today) {
      toast.error("Customer PO Date cannot be future date");
      setMainFormData((prev) => ({ ...prev, c_po_dt: "" }));
      return false;
    }
    return true;
  };

  const validateCurrConversion = () => {
    const currConvVal = mainFormData["curr_conv"];
    if (currConvVal == null || currConvVal === 0 || currConvVal === "") {
      toast.error("Currency conversion cannot be blank");
      return false;
    }
    if (currConvVal <= 0) {
      toast.error("Currency conversion cannot be zero or negative");
      return false;
    }
    return true;
  };

  const validateEffDate = () => {
    // eff_dt cannot be prior than order_dt

    if (!mainFormData?.eff_dt || !mainFormData?.order_dt) {
      return true; // If either date is missing, skip validation
    }

    const effDate = new Date(mainFormData.eff_dt);
    const orderDate = new Date(mainFormData.order_dt);

    if (effDate < orderDate) {
      toast.error("Eff. Date cannot be prior to Order Date");
      setMainFormData((prev) => ({ ...prev, eff_dt: "" }));
      return false;
    }

    return true;
  };

  const validateEndDate = () => {
    // End Date must not be prior to Order Date and Eff. Date
    // End Date is mandatory

    if (!mainFormData?.end_dt) {
      toast.error("End Date is required");
      return false;
    }

    const endDate = new Date(mainFormData.end_dt);
    const orderDate = new Date(mainFormData.order_dt);
    const effDate = new Date(mainFormData.eff_dt);

    if (mainFormData.order_dt && endDate < orderDate) {
      toast.error("End Date cannot be prior to Order Date");
      setMainFormData((prev) => ({ ...prev, end_dt: "" }));
      return false;
    }

    if (mainFormData.eff_dt && endDate < effDate) {
      toast.error("End Date cannot be prior to Eff. Date");
      setMainFormData((prev) => ({ ...prev, end_dt: "" }));
      return false;
    }

    return true;
  };

  const validateDeliveryDate = () => {
    // check if delivery date and effective date is set then only validate following
    if (mainFormData?.delivery_date) {
      const effDate = new Date(mainFormData?.eff_dt);
      const deliveryDate = new Date(mainFormData?.delivery_date);
      if (deliveryDate < effDate) {
        toast.error("Delivery Date cannot be less than Eff. Date");
        setMainFormData((prev) => ({ ...prev, delivery_date: "" }));
        return false;
      }
      if (mainFormData?.end_dt) {
        const endDate = new Date(mainFormData?.end_dt);
        if (deliveryDate > endDate) {
          toast.error("Delivery Date cannot be greater than End Date");
          setMainFormData((prev) => ({ ...prev, delivery_date: "" }));
          return false;
        }
      }
    }
    return true;
  };

  const validateFieldNotEmpty = (field, errorMessage) => {
    if (!mainFormData?.[field]) {
      toast.error(errorMessage);
      return false;
    }
    return true;
  };

  const validateItemCode = async (onSubmit, validationItemIndex) => {
    const index = onSubmit ? validationItemIndex : itemFocusedRowIndex;
    if (!helpList && !itemFormData[index]?.it_code) {
      toast.error("Item Code cannot be empty");
      return false;
    }
    let returnVal = true;
    if (itemFormData[itemFocusedRowIndex]?.it_code && !onSubmit) {
      returnVal = await checkIfItemCodeIsInactive(
        itemFormData[itemFocusedRowIndex]?.it_code
      );
      if (returnVal) {
        returnVal = await getItemCodeDependentData(
          itemFormData[itemFocusedRowIndex]?.it_code,
          mainFormData?.c_code,
          mainFormData?.inv_type
        );
      }
    }
    return returnVal;
  };

  const checkIfItemCodeIsInactive = async (it_code) => {
    if (itemFormData[itemFocusedRowIndex]?.it_code) {
      const duplicateItem = itemFormData.find(
        (item, index) =>
          item.it_code === it_code &&
          item.cus_it_code === itemFormData[itemFocusedRowIndex]?.cus_it_code &&
          index !== itemFocusedRowIndex
      );
      if (duplicateItem) {
        toast.error(
          `Item Code ${it_code} with Customer Item Code ${itemFormData[itemFocusedRowIndex]?.cus_it_code} already exists`
        );
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            it_code: "",
            it_desc: "",
          };
          return newData;
        });
        return false;
      }
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_ITEM_CODE_INACTIVE_DATA
        }?it_code=${it_code}`,{credentials:'include'}
      );
      const data = await response.json();
      if (data?.length === 0) {
        toast.error("Item Code is not defined in Product Master or Inactive.");
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            it_code: "",
            it_desc: "",
          };
          return newData;
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking item code:", error);
      toast.error("Error checking item code");
      return false;
    }
  };

  const getItemCodeDependentData = async (it_code, c_code, inv_type) => {
    if (!c_code) {
      toast.error("Customer Code should be filled to fetch HSN Code");
      setItemFormData((prevData) => {
        const newData = [...prevData];
        newData[itemFocusedRowIndex] = {
          ...newData[itemFocusedRowIndex],
          it_code: "",
          it_desc: "",
        };
        return newData;
      });
      return false;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_HSN_CODE_INACTIVE_DATA
        }?it_code=${it_code}&c_code=${c_code}&inv_type=${inv_type}&division_id=${
          user.global_division_id
        }&trans_year=${user.global_fin_year}`,{credentials:'include'}
      );
      const data = await response.json();
      if (!data?.hsn_sac_code) {
        toast.error("HSN Code is not defined in Product Master.");
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            it_code: "",
            it_desc: "",
          };
          return newData;
        });
        return false;
      } else {
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[itemFocusedRowIndex] = {
            ...newData[itemFocusedRowIndex],
            hsn_sac_code: data?.hsn_sac_code,
            cus_it_code: data?.cus_it_code ?? "",
            cus_it_desc: data?.cus_it_desc ?? "",
            it_desc: data?.it_desc ?? "",
            it_uom: data?.it_uom ?? "",
            apply_tax_paid_price: data?.apply_tax_paid_price || null,
            sale_ac_head: data?.sale_ac_head ?? "",
            sale_ac_desc: data?.sale_ac_desc ?? "",
          };
          return newData;
        });
        return true;
      }
    } catch (error) {
      console.error("Error checking HSN code:", error);
      toast.error("Error checking HSN code");
      return false;
    }
  };

  const calculateAssessValue = (iIndex) => {
    const rate = Number(itemFormData[iIndex]?.mat_rat) || 0;
    const qty = Number(itemFormData[iIndex]?.qty_ord) || 0;
    const unit = Number(itemFormData[iIndex]?.perunit) || 1;

    return qty * (rate / unit);
  };

  const validateQtyOrd = (onSubmit, validationItemIndex) => {
    const iIndex = onSubmit ? validationItemIndex : itemFocusedRowIndex;
    const qtyOrd = itemFormData[iIndex]?.qty_ord;
    const oldQtyOrd = itemFormData[iIndex]?.old_qty_ord;
    const qtyBal = itemFormData[iIndex]?.qty_bal;

    const nvl = (val, def = 0) => val ?? def;
    // 1. annual_flag = 'O' and qty_ord is null or 0
    if (qtyOrd == null || qtyOrd === 0 || qtyOrd === "") {
      toast.error("Order Quantity cannot be blank");
      return false;
    }
    // 3. qty_ord < 0
    if (qtyOrd <= 0) {
      toast.error("Order Quantity cannot be zero or negative");
      return false;
    }
    // 4. qty_ord < (old_qty_ord - qty_bal)
    if (qtyOrd < nvl(oldQtyOrd) - nvl(qtyBal)) {
      toast.error("Order Quantity is less than Qty already issued to party");
      return false;
    }
    // 5. Adjust qty_bal and old_qty_ord
    const newQtyBal = nvl(qtyBal) + (nvl(qtyOrd) - nvl(oldQtyOrd));
    const newOldQtyOrd = qtyOrd;
    const calValue = calculateAssessValue(iIndex);

    setItemFormData((prevData) => {
      const newData = [...prevData];
      newData[iIndex] = {
        ...newData[iIndex],
        qty_bal: newQtyBal,
        old_qty_ord: newOldQtyOrd,
        assess_value: calValue,
        basic_value: calValue,
      };
      return newData;
    });

    return true;
  };

  const processMatRate = (onSubmit, validationItemIndex) => {
    const iIndex = onSubmit ? validationItemIndex : itemFocusedRowIndex;
    // field cannot be blank show message Rate cannot be blank
    if (!itemFormData[iIndex]?.mat_rat) {
      toast.error("Rate cannot be blank");
      return false;
    }
    // field cannot be blank show message Rate cannot be negative or zero
    if (itemFormData[iIndex]?.mat_rat <= 0) {
      toast.error("Rate cannot be negative or zero");
      return false;
    }

    const calValue = calculateAssessValue(iIndex);

    setItemFormData((prevData) => {
      const newData = [...prevData];
      newData[iIndex] = {
        ...newData[iIndex],
        assess_value: calValue,
        basic_value: calValue,
      };
      return newData;
    });
    return true;
  };

  const validatePerUnit = (onSubmit, validationItemIndex) => {
    const iIndex = onSubmit ? validationItemIndex : itemFocusedRowIndex;
    if (!itemFormData[iIndex]?.perunit) {
      toast.error("Quantity Per Unit cannot be blank");
      return false;
    }
    if (itemFormData[iIndex]?.perunit <= 0) {
      toast.error("Quantity Per Unit cannot be zero or negative");
      return false;
    }

    const calValue = calculateAssessValue(iIndex);

    setItemFormData((prevData) => {
      const newData = [...prevData];
      newData[iIndex] = {
        ...newData[iIndex],
        assess_value: calValue,
        basic_value: calValue,
      };
      return newData;
    });

    return true;
  };

  const handleItemRowDelete = (index) => {
    if (itemFormData.length === 1) {
      toast.error("Cannot delete the last row");
      return;
    }

    if (formStatus === "Update") {
      // call a delete api which delets the data of itemFormData using order_id and item_id
      const payload = {
        order_id: Number(mainFormData?.order_id),
        it_code: itemFormData[index]?.it_code,
        sr_no: Number(itemFormData[index]?.sr_no),
      };
      fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_DATA_FOR_SALES_ORDER_FORM
        }?delete_type=ITEM`,
        {
          method: "DELETE",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify(payload),
          credentials:'include'
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete item");
          }
          return response.json();
        })
        .then((data) => {
          setItemFormData((prevData) => {
            const newData = [...prevData];
            newData.splice(index, 1);
            return newData;
          });
          toast.success("Item deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting item:", error);
          toast.error("Error deleting item");
        });
    }
    if (formStatus === "Insert") {
      setItemFormData((prevData) => {
        const newData = [...prevData];
        newData.splice(index, 1);
        return newData;
      });
    }

    setItemFocusedRowIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleAuthorised = async () => {
    const desc = mainFormData?.flag === "Y" ? "UN-AUTHORIZE" : "AUTHORIZE";
    //show a confirmation dialog with message
    setConfirmationConfig({
      title: "Authorize",
      description: `ARE YOU SURE YOU WANT TO ${desc} THIS SALES ORDER ?`,
      uniqKey: "authorize_action",
    });
    setConfirmationModal(true);
  };

  const onSuccessConfirmation = async (isConfirmed, uniqKey) => {
    if (isConfirmed) {
      const payload = {
        mhsmordr: {
          order_id: mainFormData?.order_id,
          flag: mainFormData?.flag === "Y" ? "N" : "Y",
          auth_pers: user?.id,
        },
        mdsmordr: [],
      };

      if (uniqKey == "authorize_cancel") {
        payload.mhsmordr["cancel_flag"] = "Y";
        payload.mhsmordr["flag"] = "N";
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_SALES_ORDER_FORM}`,
          {
            method: "PUT",
            headers: {"Content-Type": "application/json",},
            body: JSON.stringify(payload),
            credentials:'include'
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to authorize form");
        }

        // Update local flag state
        setMainFormData((prev) => ({
          ...prev,
          flag: (() => {
            if (uniqKey === "authorize_cancel") return "N";
            return prev.flag === "Y" ? "N" : "Y";
          })(),
          cancel_flag: uniqKey === "authorize_cancel" ? "Y" : "N",
        }));
        const desc =
          mainFormData?.flag === "Y" ? "UN-AUTHORIZED" : "AUTHORIZED";
        toast.success(`Sales order ${desc} successfully!`);
      } catch (error) {
        toast.error(error?.message || "Please check the form or contact admin");
      } finally {
        setConfirmationModal(false);
      }
    }
  };

  const renderFormTab = (tab) => {
    if (tab === "Main") {
      return (
        <SalesOrderMain
          formData={mainFormData}
          formStatus={formStatus}
          dropdownData={dropdownData}
          handleChange={(name, value) => handleChange("MainTab", name, value)}
          handleChangeTab={handleChangeTab}
          handleHelpList={handleHelpList}
          validateFormFields={validateFormFields}
          getFieldRef={getFieldRef}
        />
      );
    } else if (tab === "Charges") {
      return (
        <SaleOrderChargesTab
          chrgFormData={chrgFormData}
          formStatus={formStatus}
          handleChange={(name, value) =>
            handleChange("ChargesTab", name, value)
          }
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Items") {
      return (
        <SalesOrderItems
          itemFormData={itemFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) =>
            handleChange("ItemTab", name, value, index, event)
          }
          handleAddRow={() => handleAddRow(TYPES.ITEMS)}
          handleChangeTab={handleChangeTab}
          dropdownData={dropdownData}
          handleHelpList={handleHelpList}
          validateFormFields={validateFormFields}
          handleItemRowDelete={handleItemRowDelete}
          getFieldRef={getFieldRef}
        />
      );
    } else if (tab === "Discount") {
      return (
        <SalesOrderDiscount
          formData={discountFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) =>
            handleChange("discountTab", name, value, index, event)
          }
          handleAddRow={() => handleAddRow(TYPES.DISCOUNT)}
          handleDelete={handleDeleteinDiscountTable}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Subcontract") {
      return (
        <SalesOrderSubcontract
          formData={subcontractHeadData}
          formDetailData={subcontractDetailData}
          formStatus={formStatus}
          handleChange={(name, value, index, event, block) =>
           handleChange("subContractTab",name,value,index ?? null,event,block ? block : "detail")
          }
          handleAddRow={() => handleAddRow(TYPES.SUB_CONTRACT)}
          handleDelete={handleDeleteinSubcontractTable}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Volume Discount") {
      return (
        <SalesOrderVolumeDiscount
          formData={formData}
          formStatus={formStatus}
          volumeDiscountData={volumeDiscountData}
          itemDiscountData={itemDiscountData}
          handleVolumeDiscountChange={handleVolumeDiscountChange}
          handleItemDiscountChange={handleItemDiscountChange}
          handleChange={handleChange}
          handleAddRow={() => handleAddRow(TYPES.VOL_DISCOUNT)}
          handleDelete={handleDeleteinVolumeTable}
          handleChangeTab={handleChangeTab}
        />
      );
    } else if (tab === "Advance") {
      return (
        <SalesOrderAdvance
          formData={advanceHeadData}
          formDetailData={advanceDetailData}
          formStatus={formStatus}
          handleChange={(name, value, index, event, block) =>
            handleChange("advanceTab", name, value, index ?? null, event, block ? block : "detail")
          }
          handleChangeTab={handleChangeTab}
          handleAddRow={() => handleAddRow(TYPES.ADVANCE)}
          controlFieldData={controlFieldData}
        />
      );
    }
  };

  return (
    <>
      <FormSetup
        navType="tabs"
        activeTab={activeTab}
        tabs={tabs}
        updateActiveTab={updateActiveTab}
        formStatus={formStatus}
        currentRecordNo={currentRecordNo}
        totalRecordCount={totalRecordCount}
        pageCount={1}
        totalPageCount={1}
        isSingleQuery={true}
        setupQueryData={setupQueryData}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        handleOffset={handleOffset}
        handleSearch={handleSearch}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_SALES_ORDER_FORM}
        formName={""}
        handleAuthorised={handleAuthorised}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>{renderFormTab(currentFormTab)}</TabPane>
          {helpList && (
            <Modal
              id="help-list-modal"
              isOpen={helpList}
              toggle={toggleHelpModal}
              size="lg"
            >
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_SALES_ORDEER_HELP_LIST_DATA}`}
                  helpListHeader={getHelpListHeaders()}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal}
          onClose={() => {setConfirmationModal(false)}}
          {...confirmationConfig}
          onSuccess={() =>onSuccessConfirmation(true, confirmationConfig?.uniqKey)}
        />
      )}
    </>
  );
};

export default SalesOrder;
