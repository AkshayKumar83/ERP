import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import MainTab from "./itc_Main";
import Freight from "./itc_Freight";
import Items from "./itc_Items";
import {
  formInitialData,
  formDtlInitialData,
  createSearchPayloadForBVSpecificSearch,
} from "./itc_helpers";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { FALSE } from "sass";
import { dateFormatter } from "../../../../utils/fn";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useLocation, useNavigate } from "react-router-dom";
//import { totAmt, getCalData} from '../Vouchers/itc_Items'

const ItcEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...formInitialData });

  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const [formDetailData, setFormDetailData] = useState([
    { ...formDtlInitialData },
  ]);

  const [deletedRecord, setDeletedRecord] = useState([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [totnetAmt, setTotnetAmt] = useState(0);

  const [isdetailDataAutoFilled, setIsDetailDataAutoFilled] = useState(false);

  const [city, setCity] = useState();

  const navigate = useNavigate();

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);
  const divisionId = user?.global_division_id;

  // for dropdown data

  const [currency, setCurrency] = useState([]);

  // for help list

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  // for help list

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [currentFormTab, setCurrentFormTab] = useState("Main");

  const [tabs, setTabs] = useState(["Main"]);

const location = useLocation();

 useEffect(() => {
  const params = new URLSearchParams(location.search);

  const docNo = params.get("doc_no");
  const fromTracker = params.get("fromTracker");

   const cameFromTracker = sessionStorage.getItem("fromTrackerNav");

  if (fromTracker === "true" && docNo && cameFromTracker === "true") {
    // flag consume karo taaki refresh par na chale
    sessionStorage.removeItem("fromTrackerNav");
    setFormData(prev=>({
      ...prev,
     itc_sr_no:docNo 
    }))
    
    setFormStatus('Search')
  }
}, []);



  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_ITC_ENTRY_DROPDOWNDATA
          }`,
          { credentials: "include" },
        );
        if (response.status === 200) {
          const data = await response.json();
          setCurrency([
            { value: "", label: "" },
            ...formatOptions(data.currency || [], "curr_code", "curr_desc"),
          ]);

          if (formStatus === "Insert") {
            setFormData((prev) => ({
              ...prev,
              curr_cd: "INR",
              curr_conv: 1.0,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);

    // Update main form data
    if (["vendor", "invoice", "pono"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "vendor":
            return {
              ...prev,
              v_code: data.v_code,
              v_name: data.v_name,
              gst_registered: data.whether_gst_registered_dlr,
              transport: data.transport,
              //rc_applicable: data.rc_applicable,
              gst_no: data.gst_no,
            };

          case "invoice":
            return {
              ...prev,
              doc_no: data.invoice_no,
              doc_date: dateFormatter(data.invoice_dt),
              ge_no: data.chln_no,
              ge_date: dateFormatter(data.chln_date),
              doc_id: data.ge_id,
              division_id: data.division_id,
            };

          case "pono":
            return { ...prev, ge_no: data.po_no, ge_date: data.po_date };

          default:
            return prev;
        }
      });
    }

    // Update detail data (table rows)
    if (["item", "hsn"].includes(helpFor) && activeRowIndex !== null) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "item":
            currentRow.it_code = data.it_code;
            currentRow.it_name = data.it_name;
            currentRow.hsn_sac_code = data.hsn_sac_code;
            break;

          case "hsn":
            currentRow.hsn_sac_code = data.hsn_sac_code;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  //   const onSelectHelpItem = (data) => {
  //   //console.log("Selected Data:", data);

  //   // Update main form data
  //   if (["vendor", "invoice", "pono"].includes(helpFor)) {
  //     setFormData((prev) => {
  //       switch (helpFor) {
  //         case "vendor":
  //           return {
  //             ...prev,
  //             v_code: data.v_code,
  //             v_name: data.v_name,
  //             gst_registered: data.whether_gst_registered_dlr,
  //             transport: data.transport,
  //             rc_applicable: data.rc_applicable,
  //             gst_no: data.gst_no
  //           };

  //         case "invoice":
  //           return {
  //             ...prev,
  //             doc_no: data.invoice_no,
  //             doc_date: dateFormatter(data.invoice_dt),
  //             ge_no: data.chln_no,
  //             ge_date: dateFormatter(data.chln_date),
  //             doc_id: data.ge_id,
  //             division_id: data.division_id
  //           };

  //         case "pono":
  //           return {
  //             ...prev,
  //             ge_no: data.po_no,
  //             ge_date: data.po_date
  //           };

  //         default:
  //           return prev;
  //       }
  //     });
  //   }

  //   // Update detail data (table rows)
  //   if (["item", "hsn"].includes(helpFor) && activeRowIndex !== null) {
  //     setFormDetailData((prev) => {
  //       const updated = [...prev];
  //       const currentRow = { ...updated[activeRowIndex] };

  //       switch (helpFor) {
  //         case "item":
  //           currentRow.it_code = data.it_code;
  //           currentRow.it_name = data.it_name;
  //           currentRow.unit = data.unit;
  //           currentRow.hsn_code = data.hsn_code;
  //           currentRow.gst_rate = data.gst_rate;
  //           // add other fields as needed from your data
  //           break;

  //         case "hsn":
  //           currentRow.hsn_code = data.hsn_code;
  //           currentRow.gst_rate = data.gst_rate;
  //           break;

  //         default:
  //           break;
  //       }

  //       updated[activeRowIndex] = currentRow;
  //       return updated;
  //     });
  //   }
  // };

  const whereClauseForHelp = (helpFor) => {
    if (helpFor === "vendor") {
      return {
        whether_ge_yesno: formData.whether_ge_yesno,
        register_type: formData.register_type,
      };
    } else if (helpFor === "invoice") {
      const { cash_receipt, v_type, v_code, register_type } = formData;
      return {
        cash_receipt: cash_receipt,
        v_type: v_type,
        v_code: v_code,
        register_type: register_type,
      };
    } else if (helpFor === "pono") {
      const { credit_availed_date } = formData;
      return { credit_availed_date: credit_availed_date };
    } else if (helpFor === "hsn") {
      const itm_goods_service = formDetailData[0]?.itm_goods_service;
      return { itm_goods_service: itm_goods_service };
    }
    return {};
  };

  const validateDateField = () => {
    const today = new Date();
    const creditDate = new Date(formData.credit_availed_date);
    const invoiceDate = new Date(formData.doc_date);

    // 1. Credit Date cannot be in the future
    if (creditDate > today) {
      toast.error("Credit Date cannot be greater than today's date");
      return false;
    }

    // 2. Credit Date must be on or after the Invoice Date
    if (creditDate < invoiceDate) {
      toast.error("Credit Date cannot be less than Invoice Date");
      return false;
    }

    // 3. If GE is required, validate Credit Date against GE Date and Today
    if (
      formData.whether_ge_yesno === "Y" &&
      formData.register_type === "G" &&
      formData.ge_date
    ) {
      const geDate = new Date(formData.ge_date);

      if (creditDate < geDate) {
        toast.error("Credit Date cannot be less than Gate Entry Date");
        return false;
      }
    }

    // Optional: Add any return value if needed
    return true;
  };

  const validateCurrField = () => {
    const currCd = formData.curr_cd?.trim();
    const currConv = Number(formData.curr_conv);

    if (currCd === "INR") {
      handleChange("formData", "curr_conv", "1.00");
      return true;
    }

    // Validate non-INR conversion rate
    if (currCd !== "INR" && currConv === 1) {
      // toast.error("Currency conversion rate cannot be 1 for foreign currency");
      return false;
    }

    return true;
  };

  const validateRateField = () => {
    if (formDetailData[0]?.qty === 0) {
      toast.error("QTY IS ZERO");
    }

    if (formDetailData[0]?.qty < 0) {
      toast.error("QTY CANNOT BE NEGATIVE");
    }
  };


  // form validation

  const validatePercField1 = () => {
    const fields = [
      { key: "igst_cr_perc_i", label: "IGST Insurance" },
      { key: "cgst_cr_perc_i", label: "SGST Insurance" },
      { key: "sgst_cr_perc_i", label: "CGST Insurance" },
      { key: "igst_cess_perc_i", label: "IGST Cess Insurance" },
      { key: "sgst_cess_perc_i", label: "SGST Cess Insurance" },
      { key: "cgst_cess_perc_i", label: "CGST Cess Insurance" },
      { key: "igst_cr_perc_f", label: "IGST Freight" },
      { key: "cgst_cr_perc_f", label: "SGST Freight" },
      { key: "sgst_cr_perc_f", label: "CGST Freight" },
      { key: "igst_cess_perc_f", label: "IGST Cess Freight" },
      { key: "cgst_cess_perc_f", label: "SGST Cess Freight" },
      { key: "sgst_cess_perc_f", label: "CGST Cess Freight" },
      { key: "sgst_cess_perc_f", label: "CGST Cess Freight" },
      { key: "ins_chg", label: "Insurence Charges" },
      { key: "frt_chg", label: "Freight Charges" },
    ];

    fields.forEach(({ key, label }) => {
      const value = formData.tableData[0][key];

      if (value < 0) {
        toast.error(`${label} Percentage cannot be Negative`);
      } else if (value > 100) {
        toast.error(`${label} Percentage cannot be Greater than 100`);
      }
    });
  };

  const validatePercField2 = () => {
    const fields = [
      { key: "igst_perc", label: "IGST" },
      { key: "cgst_cr_perc_i", label: "SGST Insurance" },
      { key: "sgst_cr_perc_i", label: "CGST Insurance" },
      { key: "igst_cess_perc_i", label: "IGST Cess Insurance" },
      { key: "sgst_cess_perc_i", label: "SGST Cess Insurance" },
      { key: "cgst_cess_perc_i", label: "CGST Cess Insurance" },
      { key: "igst_cr_perc_f", label: "IGST Freight" },
      { key: "cgst_cr_perc_f", label: "SGST Freight" },
      { key: "sgst_cr_perc_f", label: "CGST Freight" },
      { key: "igst_cess_perc_f", label: "IGST Cess Freight" },
      { key: "cgst_cess_perc_f", label: "SGST Cess Freight" },
      { key: "sgst_cess_perc_f", label: "CGST Cess Freight" },
      { key: "ins_chg", label: "Insurance Charges" },
      { key: "frt_chg", label: "Freight Charges" },
    ];

    fields.forEach(({ key, label }) => {
      const value = formDetailData[key];

      if (value < 0) {
        toast.error(`${label} percentage cannot be negative`);
      } else if (value > 100) {
        toast.error(`${label} percentage cannot be more than 100`);
      }
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Only preventDefault if event is passed

    if (currentFormTab == "Main") {
      const isValidFormData = validateForm("itc-form");
      if (!isValidFormData) {
        return;
      }
    }

    if (!validateDateField()) {
      toast.error("validateDateField failed");
      return;
    }

    if (!validateCurrField()) {
      toast.error("validateCurrfield failed");
      return;
    }

    // check not null fields
    let notNullFields = ["v_code", "doc_no", "doc_date", "credit_availed_date"];
    for (let field of notNullFields) {
      if (!formData[field]) {
        toast.error(`Please fill the required field: ${field}`);
        return;
      }
    }

    //  if (!validateRateField()) {
    //   toast.error("valdateRateField failed")
    //   return; // stop if currency validation fails
    // }

    // If GST is not registered or reverse charge is applicable, alert the user
    if (formData.gst_registerd === "N" || formData.rc_applicable === "Y") {
      alert(
        "As this supplier is not registered in GST or,\n" +
          "Reverse charge applicable\n\n" +
          "Would you like to Create Reverse charge Invoice?",
      );
    }
    if (!totals) return;

    // //console.log("t_basic_value as totnetAmt", totnetAmt)

    const updatedFormData = {
      ...formData,
      ...totals,
      t_basic_val: totnetAmt.toFixed(2),
    };

    const vchFormData = {
      createGstWithItc: `S${formData?.v_code}`,
      partyName: formData?.v_code,
      divisionId: 1,
      billDt: formData?.doc_date,
      billNo: formData?.doc_no,
      gst_id: formData?.gst_id,
    };

    try {
      let body = {
        formData: updatedFormData,
        formDetailData: formDetailData,
        finYear: user.global_fin_year,
        divisionId: user.global_division_id,
      };

      if (formStatus === "Update") {
        if (formData.cAuth === "Y") {
          toast.error("YOU CANNOT MODIFY AUTHORISED ITC");
        }
        body = {
          formData: updatedFormData,
          formDetailData: formDetailData,
          finYear: user.global_fin_year,
          deletedData: deletedRecord,
        };

        // //console.log("basic amount", basicAmt)
      }

      setDeletedRecord([]);

      //console.log("Final body to send:", body);
      //console.log("total", totnetAmt)

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_ITC_ENTRY_DATA
        }?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }
      const data = await response.json();
      toast.success(data.message || "Data Saved successfully!");

      // const shouldNavigate = confirm(
      //   `Do you Want to Book bill in ${
      //     formData?.register_type === "S"
      //       ? "Expense Voucher"
      //       : "Purchase Voucher"
      //   } for this party.`
      // );

      // if (formStatus === 'Insert' && shouldNavigate) {
      //   navigateToVoucher(formData?.register_type, vchFormData);
      //   return; // 🔥 STOP execution
      // }

      if (formStatus === "Insert") {
        const shouldNavigate = confirm(
          `Do you Want to Book bill in ${
            formData?.register_type === "S"
              ? "Expense Voucher"
              : "Purchase Voucher"
          } for this party.`,
        );

        if (shouldNavigate) {
          navigateToVoucher(formData?.register_type, vchFormData);
          return; // 🔥 STOP execution
        }
      }

      handleCancel();

      return data;
    } catch (error) {
      toast.error(
        error.error ||
          "Please check all the form fields or contact administrator",
      );
      return false;
    }
  };

  // ITC Authorization logic
  const handleAuthItc = async () => {
    const { cAuth, gst_id, doc_no, doc_date, v_code, division_id, v_type } =
      formData;
    const { global_division_id, global_fin_year } = user;

    const action = cAuth === "Y" ? "Un-authorise" : "Authorise";

    if (confirm(`Are you sure you want to ${action} ITC ?`)) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.AUTHORIZED_ITC_ENTRY_DATA
          }`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              itcData: {
                cAuth: cAuth === "Y" ? "N" : "Y",
                gst_id,
                doc_no,
                doc_date,
                v_code,
                division_id: global_division_id,
                trans_year: global_fin_year,
                v_type,
              },
            }),
          },
        );

        const result = await response.json();

        if (response.ok) {
          toast.success(result?.message || "Authorization status updated.");
          setFormData((prev) => ({
            ...prev,
            cAuth: result.cAuth,
          }));
        } else {
          toast.error(result?.message || "Failed to update authorization.");
        }
      } catch (error) {
        console.error("Authorization error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  //Delete ITC logic

  const handleDeleteItc = async () => {
    const { gst_id, cAuth } = formData;

    if (cAuth === "Y") {
      toast.error("You cannot delete authorised ITC");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete the ITC entry?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.DELETE_ITC_ENTRY_DATA
        }`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itcData: {
              cAuth,
              gst_id,
            },
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      //console.log("Deletion error:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  // For Search Record
  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForBVSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_ITC_ENTRY_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`,
      );

      if (data?.error) {
        toast.error(data?.error);
        return;
      }
      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  const getCustomerCity = async (e) => {
    if (e) e.preventDefault(); // Only preventDefault if event is passed

    try {
      let body = {
        formData: formData,
        //formDetailData: formDetailData,
        // divisionId: user.division_id,
      };

      //console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_ITC_ENTRY_DATA
        }?form_status=${formStatus}&step=freight`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      //toast.success("Data inserted successfully!");
      return data; //Success
      setCity(data.city_id);
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator",
      );
      return false; // Failed
    }
  };

  const getGstRate = async (e) => {
    if (e) e.preventDefault();

    try {
      let body = {
        formData: formData,
        formDetailData: formDetailData,
        // divisionId: user.division_id,
        city: city,
      };

      //console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_ITC_ENTRY_DATA
        }?form_status=${formStatus}&step=gstrate`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      //toast.success("Data inserted successfully!");
      return data;
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator",
      );
      return false;
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({ ...formInitialData });
    setFormDetailData([formDtlInitialData]);
  }, []);

  const handleChange = useCallback(
    (type, name, value, rowIndex = null) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }

      if (["hsn_sac_code", "it_code", "v_code"].includes(name)) {
        toast.error("Please select from Helplist");
        return;
      }

      // const isNumericField = !isNaN(value) && value !== "";

      // const parsedValue = isNumericField ? parseFloat(value) : value;
      const parsedValue = value;

      if (type === "formData") {
        if (rowIndex !== null) {
          setFormData((prev) => {
            const newTableData = [...prev.tableData];
            if (!isAmountField || isValidAmount) {
              newTableData[rowIndex] = {
                ...newTableData[rowIndex],
                [name]: parsedValue,
              };
            }
            return { ...prev, tableData: newTableData };
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: parsedValue,
          }));
        }
      } else if (type === "formDetailData") {
        // const isNumericField = !isNaN(value) && value !== "";
        // const parsedValue = isNumericField ? parseFloat(value) : value;
        const parsedValue = value;

        if (rowIndex !== null) {
          setFormDetailData((prev) => {
            const updatedFormDetails = [...prev];

            // First: get the existing row and apply the current field change
            const prevRow = updatedFormDetails[rowIndex] || {};
            const updatedRow = {
              ...prevRow,
              [name]: parsedValue,
            };

            // Apply computed values to the updated row
            updatedFormDetails[rowIndex] = {
              ...updatedRow,
            };

            return updatedFormDetails;
          });
        } else {
          setFormDetailData((prev) => ({
            ...prev,
            [name]: parsedValue,
          }));
        }
      }
    },
    [formStatus],
  );

  useEffect(() => {
    if (formData.curr_conv) {
      setFormDetailData((prev) =>
        prev.map((row) => ({
          ...row,
          curr_val: row.curr_val || parseFloat(formData.curr_conv),
        })),
      );
    }
  }, [formData.curr_conv]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      //console.log("queryData:", queryData);

      // Handle failure case
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        handleCancel();
        return;
      }
      //  handleCancel()

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      const tableData = queryData.thfminwardGstData
        ? [queryData.thfminwardGstData]
        : [];
      setFormData({
        ...queryData.thfminwardGstData,
        tableData: tableData,
      });

      setFormDetailData(queryData.tdfminwardgstData || []);
    },
    [formStatus, currentRecordNo],
  );

  const triggerAddRow = () => {
    const isValidFormData = validateForm("itc-item-form");
    if (!isValidFormData) {
      return;
    }

    setFormDetailData((prev) => [
      ...prev,
      { ...formDtlInitialData, id: prev.length + 1 },
    ]);
  };

  const handleDeleteRow = useCallback(
    (data, index) => {
      if (
        !(
          (formData.register_type === "G" &&
            formData.whether_ge_yesno === "N") ||
          formData.register_type === "S"
        )
      ) {
        toast.error("You can't delete this record");
        return;
      }

      let newDeleteData = [...deletedRecord];
      newDeleteData.push(data);
      setDeletedRecord(newDeleteData);

      setFormDetailData((prev) => {
        if (prev.length === 0) return prev;

        const newData = prev.filter((_, i) => i !== index);

        // Adjust focus index if needed
        setFocusedRowIndex((currentFocusIndex) => {
          if (index === currentFocusIndex) {
            // Focus the previous row, or 0 if no previous
            return index > 0 ? index - 1 : 0;
          } else if (index < currentFocusIndex) {
            // Row above deleted, shift focus index down by 1
            return currentFocusIndex - 1;
          } else {
            // No change needed
            return currentFocusIndex;
          }
        });

        return newData;
      });
    },
    [deletedRecord],
  );

  const fetchValidateData = async (fieldName, fieldValue, rowIndex = null) => {
    if (!fieldValue) return;

    const queryParams = new URLSearchParams();
    // queryParams.append(fieldName, fieldValue);

    const additionalFields = [
      "doc_no",
      "credit_availed_date",
      "ge_id",
      "register_type",
      "cash_receipt",
      "v_code",
      "ge_no",
      "divisionId",
      "v_type",
      "it_code",
      "hsn_sac_code",
      "itm_goods_service",
    ];

    additionalFields.forEach((key) => {
      if (key === "it_code" && rowIndex !== null) {
        const rowItem = formDetailData?.[rowIndex];
        if (rowItem?.it_code) {
          queryParams.append("it_code", rowItem.it_code);
        }
      } else if (key === "hsn_sac_code" && rowIndex !== null) {
        const rowItem = formDetailData?.[rowIndex];
        if (rowItem?.hsn_sac_code) {
          queryParams.append("hsn_sac_code", rowItem.hsn_sac_code);
        }
      } else if (key === "itm_goods_service" && rowIndex !== null) {
        const rowItem = formDetailData?.[rowIndex];
        if (rowItem?.itm_goods_service) {
          queryParams.append("itm_goods_service", rowItem.itm_goods_service);
        }
      } else if (formData[key]) {
        queryParams.append(key, formData[key]);
      }
    });

    const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${
      APP_PROD_API.GET_ITC_ENTRY_VALIDATE_DATA
    }/${fieldName}?${queryParams.toString()}`;

    //console.log("API URL:", API_STRING);

    try {
      const response = await fetch(API_STRING);
      const data = await response.json();

      if (response.status === 200) {
        // Handle response depending on what was being validated
        if (fieldName === "v_code") {
          setFormData((prevData) => ({
            ...prevData,
            v_name: data.v_name,
            gst_registered: data.whether_gst_registered_dlr,
            transport: data.transport,
            //rc_applicable: data.rc_applicable,
            gst_no: data.gst_no,
          }));
        } else if (fieldName === "ge_no") {
          setFormData((prevData) => ({
            ...prevData,
            doc_id: data.doc_id,
          }));
        } else if (fieldName === "doc_no") {
          setFormData((prevData) => ({
            ...prevData,
            doc_dt: data.doc_dt,
            credit_availed_date: data.credit_availed_date,
            ge_id: data.ge_id,
            cok_rej: data.cok_rej,
            ge_date: data.ge_date,
            ge_no: data.ge_no,
          }));
        } else if (fieldName === "it_code") {
          setFormDetailData((prevData) =>
            prevData.map((item, index) =>
              index === rowIndex
                ? { ...item, it_name: data?.it_name, um_code: data?.um_code }
                : item,
            ),
          );
        } else if (fieldName === "hsn_sac_code") {
          setFormDetailData((prevData) =>
            prevData.map((item, index) =>
              index === rowIndex
                ? {
                    ...item,
                    hsn_sac_code: data.hsn_sac_code,
                    credit_allowed: data.credit_allowed,
                  }
                : item,
            ),
          );
        }
      } else if (response.status === 400) {
        if (fieldName === "v_code") {
          toast.error("Vendor Code does not exist in Vendor Master");
        } else if (fieldName === "ge_no") {
          toast.error(
            "Invalid Work Order No/Purchase Services/Not Authorised/ Check WO/PS Effective and End date",
          );
        } else if (fieldName === "doc_no") {
          const err = response.data?.error;
          //console.log("Challan Error:", err);

          if (err?.includes("Challan No. does not exist")) {
            toast.error("Challan No. does not exist");
          } else if (err?.includes("exist More than once")) {
            toast.error(
              "Challan No. exists more than once, please select from list (F1)",
            );
          } else {
            //toast.error("Unknown Challan error");
          }
        }
        if (fieldName === "it_code") {
          toast.error(
            "Please check item is inactive in item master form or select item from Help list",
          );
        }

        if (fieldName === "hsn_sac_code") {
          toast.error("INVALID HSN/SAC CODE");
        } else {
          //toast.error("Validation failed");
        }
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error(err || "Something went wrong while validating the data.");
    }
  };

  // getValidate data

  const getValidateData = async (
    otherQueryPera = {
      v_code: formData.v_code,
      doc_no: formData.doc_no,
      doc_date: formData.doc_date,
    },
  ) => {
    try {
      const queryParams = new URLSearchParams({
        ...otherQueryPera,
        appDivisionId: user?.global_division_id,
        appFinYear: user?.global_fin_year,
      });

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_ITC_ENTRY_VALIDATE_DATA
      }?${queryParams.toString()}`;

      //console.log("Validation API:", API_STRING);

      const response = await fetch(API_STRING);
      const data = await response.json();

      if (response.ok) {
        //console.log("Validation successful:", data);

        return true;
      } else {
        toast.error(data.error || "Validation failed.");
        return false;
      }
    } catch (err) {
      console.error("Error validating field:", err);
      toast.error("Something went wrong while validating the data.");
      return false;
    }
  };

  const getMaxGst4Frt = async (
    formData,
    formDetailData,
    destinationState,
    getCustomerCityFunc,
    getGstRate,
    getUtFlag,
    setMaxGst = false,
  ) => {
    // Fetch city from the async getCustomerCity function
    const cityData = await getCustomerCityFunc();
    if (!cityData || !cityData.city_id) {
      console.error("City ID not found.");
      return;
    }

    const customerCityId = cityData.city_id;

    // Step 0: Determine if interstate
    const isInterstate = destinationState !== customerCityId;

    // Step 1: Check if any GST credit % already present
    const gstCreditExists = formData.some(
      (row) =>
        row.IGST_CR_PERC_F ||
        row.SGST_CR_PERC_F ||
        row.CGST_CR_PERC_F ||
        row.IGST_CESS_PERC_F ||
        row.SGST_CESS_PERC_F ||
        row.CGST_CESS_PERC_F ||
        row.IGST_CR_PERC_I ||
        row.SGST_CR_PERC_I ||
        row.CGST_CR_PERC_I ||
        row.IGST_CESS_PERC_I ||
        row.SGST_CESS_PERC_I ||
        row.CGST_CESS_PERC_I,
    );

    if (gstCreditExists && !setMaxGst) {
      //console.log("GST already exists and setMaxGst is false. Returning early.");
      return;
    }

    //  Loop through formDetailData to calculate max GST
    for (const row of formDetailData) {
      if (!row.hsn_sac_code) {
        console.error("Error: HSN Code is null");
        continue;
      }

      try {
        const gstRates = await getGstRate(
          row.hsn_sac_code,
          isInterstate,
          row.register_type,
        ); // customize as needed

        maxIGST = Math.max(maxIGST, gstRates.igst || 0);
        maxCGST = Math.max(maxCGST, gstRates.cgst || 0);
        maxSGST = Math.max(maxSGST, gstRates.sgst || 0);

        maxIGSTCess = Math.max(maxIGSTCess, gstRates.igstCess || 0);
        maxCGSTCess = Math.max(maxCGSTCess, gstRates.cgstCess || 0);
        maxSGSTCess = Math.max(maxSGSTCess, gstRates.sgstCess || 0);
      } catch (err) {
        console.error(`Failed to get GST for HSN ${row.hsn_sac_code}`, err);
      }
    }

    // Optionally update formData if setMaxGst is true
    if (setMaxGst) {
      formData.forEach((row) => {
        row.IGST_CR_PERC_F = maxIGST;
        row.CGST_CR_PERC_F = maxCGST;
        row.SGST_CR_PERC_F = maxSGST;

        row.IGST_CESS_PERC_F = maxIGSTCess;
        row.CGST_CESS_PERC_F = maxCGSTCess;
        row.SGST_CESS_PERC_F = maxSGSTCess;

        row.IGST_CR_PERC_I = maxIGST;
        row.CGST_CR_PERC_I = maxCGST;
        row.SGST_CR_PERC_I = maxSGST;

        row.IGST_CESS_PERC_I = maxIGSTCess;
        row.CGST_CESS_PERC_I = maxCGSTCess;
        row.SGST_CESS_PERC_I = maxSGSTCess;
      });
    }

    return {
      maxIGST,
      maxCGST,
      maxSGST,
      maxIGSTCess,
      maxCGSTCess,
      maxSGSTCess,
      isInterstate,
    };
  };

  function updateGstTotals(formData, formDetailData) {
    //console.log("this function called")
    // Reset all totals
    let igst_tot_value = 0;
    let igst_tot_cess_val = 0;
    let igst_tot_val_cr_allowable = 0;
    let igst_tot_cess_val_cr_allowable = 0;
    let igst_tot_val_cr_availed = 0;
    let igst_tot_cess_val_cr_availed = 0;

    let cgst_tot_value = 0;
    let cgst_tot_cess_val = 0;
    let cgst_tot_val_cr_allowable = 0;
    let cgst_tot_cess_val_cr_allowable = 0;
    let cgst_tot_val_cr_availed = 0;
    let cgst_tot_cess_val_cr_availed = 0;

    let sgst_tot_value = 0;
    let sgst_tot_cess_val = 0;
    let sgst_tot_val_cr_allowable = 0;
    let sgst_tot_cess_val_cr_allowable = 0;
    let sgst_tot_val_cr_availed = 0;
    let sgst_tot_cess_val_cr_availed = 0;

    //let t_basic_value = 0;

    // Optional tracking totals
    let nTOTAL_IGST_WITH_GST = 0;
    let nTOTAL_CGST_WITH_GST = 0;
    let nTOTAL_SGST_WITH_GST = 0;

    // Loop through each row
    formDetailData.forEach((row) => {
      igst_tot_value += parseFloat(row.igst_value || 0);
      igst_tot_cess_val += parseFloat(row.igst_cess_val || 0);
      igst_tot_val_cr_allowable += parseFloat(row.igst_val_cr_allowable || 0);
      igst_tot_cess_val_cr_allowable += parseFloat(
        row.igst_cess_val_cr_allowable || 0,
      );
      igst_tot_val_cr_availed += parseFloat(row.igst_val_cr_availed || 0);
      igst_tot_cess_val_cr_availed += parseFloat(
        row.igst_cess_val_cr_availed || 0,
      );

      cgst_tot_value += parseFloat(row.cgst_value || 0);
      cgst_tot_cess_val += parseFloat(row.cgst_cess_val || 0);
      cgst_tot_val_cr_allowable += parseFloat(row.cgst_val_cr_allowable || 0);
      cgst_tot_cess_val_cr_allowable += parseFloat(
        row.cgst_cess_val_cr_allowable || 0,
      );
      cgst_tot_val_cr_availed += parseFloat(row.cgst_val_cr_availed || 0);
      cgst_tot_cess_val_cr_availed += parseFloat(
        row.cgst_cess_val_cr_availed || 0,
      );

      sgst_tot_value += parseFloat(row.sgst_value || 0);
      sgst_tot_cess_val += parseFloat(row.sgst_cess_val || 0);
      sgst_tot_val_cr_allowable += parseFloat(row.sgst_val_cr_allowable || 0);
      sgst_tot_cess_val_cr_allowable += parseFloat(
        row.sgst_cess_val_cr_allowable || 0,
      );
      sgst_tot_val_cr_availed += parseFloat(row.sgst_val_cr_availed || 0);
      sgst_tot_cess_val_cr_availed += parseFloat(
        row.sgst_cess_val_cr_availed || 0,
      );

      // t_basic_value  += parseFloat(row.t_ass_val || 0)

      // Optional tracking
      nTOTAL_IGST_WITH_GST += parseFloat(row.igst_value || 0);
      nTOTAL_CGST_WITH_GST += parseFloat(row.cgst_value || 0);
      nTOTAL_SGST_WITH_GST += parseFloat(row.sgst_value || 0);
    });

    return {
      igst_tot_value: igst_tot_value.toFixed(2),
      igst_tot_cess_val: igst_tot_cess_val.toFixed(2),
      igst_tot_val_cr_allowable: igst_tot_val_cr_allowable.toFixed(2),
      igst_tot_cess_val_cr_allowable: igst_tot_cess_val_cr_allowable.toFixed(2),
      igst_tot_val_cr_availed: igst_tot_val_cr_availed.toFixed(2),
      igst_tot_cess_val_cr_availed: igst_tot_cess_val_cr_availed.toFixed(2),

      cgst_tot_value: cgst_tot_value.toFixed(2),
      cgst_tot_cess_val: cgst_tot_cess_val.toFixed(2),
      cgst_tot_val_cr_allowable: cgst_tot_val_cr_allowable.toFixed(2),
      cgst_tot_cess_val_cr_allowable: cgst_tot_cess_val_cr_allowable.toFixed(2),
      cgst_tot_val_cr_availed: cgst_tot_val_cr_availed.toFixed(2),
      cgst_tot_cess_val_cr_availed: cgst_tot_cess_val_cr_availed.toFixed(2),

      sgst_tot_value: sgst_tot_value.toFixed(2),
      sgst_tot_cess_val: sgst_tot_cess_val.toFixed(2),
      sgst_tot_val_cr_allowable: sgst_tot_val_cr_allowable.toFixed(2),
      sgst_tot_cess_val_cr_allowable: sgst_tot_cess_val_cr_allowable.toFixed(2),
      sgst_tot_val_cr_availed: sgst_tot_val_cr_availed.toFixed(2),
      sgst_tot_cess_val_cr_availed: sgst_tot_cess_val_cr_availed.toFixed(2),

      //t_basic_value: t_basic_value.toFixed(2)
    };
  }

  function validateBillOfEntry(formDetailData, gst_id, bill_of_entry_no) {
    if (!Array.isArray(formDetailData)) {
      console.error(
        "Expected formDetailData to be an array but got:",
        formDetailData,
      );
      return;
    }

    let nBCD_AMT = 0;

    for (const row of formDetailData) {
      if (row.gst_id === gst_id) {
        nBCD_AMT += parseFloat(row.bcd_amt_ndb) || 0;
      }
    }

    if (nBCD_AMT > 0 && (!bill_of_entry_no || bill_of_entry_no.trim() === "")) {
      alert("PLEASE ENTER BILL OF ENTRY NO");
      throw new Error("Form validation failed: BILL OF ENTRY NO is required");
    }
  }

  const callInsertMainDataAPI = async (e) => {
    if (e) e.preventDefault();

    const {
      ge_id,
      register_type,
      cash_receipt,
      gst_registered,
      rc_applicable,
      credit_date,
      v_code,
      v_type,
      gst_amt_prc,
      gst_id,
    } = formData;

    const requiredFields = {
      //ge_id,
      register_type,
      cash_receipt,
      gst_registered,
      rc_applicable,
      // credit_date,
      v_code,
      v_type,
      // gst_amt_prc,
      // gst_id,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === null || value === undefined || value === "") {
        toast.error(`Please fill in the "${key}" field.`);
        return; // Stop function execution if any required field missing
      }
    }

    try {
      const body = {
        formData,
        formDetailData,
        divisionId: user.division_id,
      };

      //console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_ITC_ENTRY_DATA
        }?form_status=${formStatus}&step=items`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success("Data inserted successfully!");
      return data; // Success
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator",
      );
      return null; // Failed
    }
  };

  const callInsertGstDataAPI = async (e) => {
    //console.log("gst fill called")
    if (e) e.preventDefault();

    try {
      const body = {
        formData,
        formDetailData,
        // divisionId: user.division_id
      };

      //console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_ITC_ENTRY_DATA
        }?form_status=${formStatus}&step=gst`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      //toast.success("Data inserted successfully!");
      return data; // Success
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator",
      );
      return null; // Failed
    }
  };

  const totals = updateGstTotals(formData, formDetailData);

  const handleChangeTab = async (getTab) => {
    if (formStatus === "Query") {
      setTabs([getTab]);
      setCurrentFormTab(getTab);
      return;
    }

    if (
      getTab === "Items" &&
      formStatus === "Insert" &&
      !isdetailDataAutoFilled &&
      formData?.whether_ge_yesno === "Y"
    ) {
      const result = await callInsertMainDataAPI();
      //console.log("result", result);

      if (!result) return; // If result is falsy, return early

      // Set form data and auto-fill
      setIsDetailDataAutoFilled(true);
      //console.log("Data before setting in setFormDetailData:", result.tdfminwardgstData);
      setFormDetailData(result.tdfminwardgstData);

      // Ensure that state updates before moving to next tab
      // Delayed tab switch with setTimeout or trigger via useEffect
      setTimeout(() => {
        setTabs([getTab]);
        setCurrentFormTab(getTab);
      }, 0); // Ensure this runs after state update
    } else {
      // If the condition doesn't hold, just move to the next tab

      setTabs([getTab]);
      setCurrentFormTab(getTab);
      updateGstTotals(formData, formDetailData);
    }
  };

  const navigateToVoucher = (register_type, navFormData) => {
    sessionStorage.setItem("FROM_ITC_AUTO_CREATE", "Y");
    if (register_type === "S") {
      // navigate("/module/financeMgmnt/40202", { replace: true });
      navigate("/module/financeMgmnt/40202", {
        replace: true,
        state: {
          openMode: "INSERT",
          from: "ITC",
          ...navFormData,
        },
      });
    } else if (register_type === "G") {
      navigate("/module/financeMgmnt/40211", {
        replace: true,
        state: {
          openMode: "INSERT",
          from: "ITC",
          ...navFormData,
        },
      });
    }
  };

  const renderFormTab = (tab) => {
    if (tab === "Main") {
      return (
        <MainTab
          formData={formData}
          formStatus={formStatus}
          handleChange={handleChange}
          handleChangeTab={handleChangeTab}
          currency={currency}
          handleHelpList={handleHelpList}
          setHelpFor={setHelpFor}
          setHelpListHeader={setHelpListHeader}
          validateDateField={validateDateField}
          fetchValidateData={fetchValidateData}
          validateCurrField={validateCurrField}
          setFormData={setFormData}
          updateGstTotals={updateGstTotals}
          formDetailData={formDetailData}
          totals={totals}
          handleDeleteItc={handleDeleteItc}
          handleCancel={handleCancel}
          getValidateData={getValidateData}
          navigateToVoucher={navigateToVoucher}
        />
      );
    } else if (tab === "Freight") {
      return (
        <Freight
          formData={formData}
          formStatus={formStatus}
          handleChange={handleChange}
          //insFreightData={insFreightData}
          fetchValidateData={fetchValidateData}
          handleChangeTab={handleChangeTab}
          getMaxGst4Frt={getMaxGst4Frt}
        />
      );
    } else if (tab === "Items") {
      return (
        <Items
          formData={formDetailData}
          handleChange={handleChange}
          formStatus={formStatus}
          handleChangeTab={handleChangeTab}
          triggerAddRow={triggerAddRow}
          activeRowIndex={activeRowIndex}
          setActiveRowIndex={setActiveRowIndex}
          handleHelpList={handleHelpList}
          setHelpFor={setHelpFor}
          setHelpListHeader={setHelpListHeader}
          fetchValidateData={fetchValidateData}
          validateRateField={validateRateField}
          formData1={formData}
          handleDelete={handleDeleteRow}
          focusedRowIndex={focusedRowIndex}
          setFocusedRowIndex={setFocusedRowIndex}
          setTotnetAmt={setTotnetAmt}
          callInsertGstDataAPI={callInsertGstDataAPI}
          setFormDetailData={setFormDetailData}
          updateGstTotals={updateGstTotals}
        />
      );
    }
  };

  //console.log('formStatus from memberform', formStatus)
  return (
    <React.Fragment>
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
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_ITC_ENTRY_DATA}
        handleAuthRecord={handleAuthItc}
        formName={""}
        authority={{
          insert: "Y",
          update: formData?.cAuth === "Y" ? "N" : "Y",
          message:
            formData?.cAuth === "Y" ? "YOU CANNOT MODIFY AUTHORISED ITC." : "",
        }}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>{renderFormTab(currentFormTab)}</TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                    APP_PROD_API.GET_ITC_ENTRY_DATA
                  }`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                  whereClause={whereClauseForHelp(helpFor)}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ItcEntry;
