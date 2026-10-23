import React, { useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ReverseChargeInvoiceMain from "./reverse_charge_invoice_main";
import {
  controlInitData,
  createSearchPayloadForGLSpecificSearch,
  ItemInitData,
  reverseBottomBtn,
  reversechargeMainData,
} from "./reverse_charge_invoice_helper";
import ReverseChargeInvoiceItem from "./reverse_charge_invoice_Item";
import ReverseChargeInvoicePayment from "./reverse_charge_invoice_payment";
import ReverseChargeInvoiceDespatch from "./reverse_charge_invoice_despatch";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { formatOptions } from "../../../../lib";
import { dateFormatter } from "../../../../utils/fn";
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";

const ReverseChargeInvoice = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState();
  const [mainFormData, setMainFormData] = useState({...reversechargeMainData,});
  const [itemFormData, setItemFormData] = useState([{ ...ItemInitData }]);
  const [despatchFormData, setDespatchFormData] = useState({...reversechargeMainData,});
  const [paymentFormData, setPaymentFormData] = useState({...reversechargeMainData,});
  const [controlData, setControlData] = useState({...controlInitData})
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus , searchQuery,setSearchQuery} =useFormStatus();
     const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [currentFormTab, setCurrentFormTab] = useState("Main"); // Default tab-> on first time render

  const [tabs, setTabs] = useState(["Main"]);
const { user } = useSelector((state) => state.auth);
  const [updatedButtons, setUpdatedButtons] = useState(reverseBottomBtn);


    // for select Field
  const [division, setDivision] = useState([])
  const [despatch, setDespatch] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [preShipmentNo, setPreShipmentNo] = useState([]);
  const [modeOfTransport,setModeOfTransport] = useState([]);
  const [priceBasis,setPriceBasis] = useState([]);
  const [paymentTerm, setPaymentTerm] = useState([]);
  const [storageType, setStorageType] = useState([]);

  

   useEffect(() => {
          const fetchConstantList = async () => {
              try {
                  const response = await fetch(
                      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_RCM_DROPDOWNDATA}`,
                      { credentials: "include" }
                  );
                  if (response.status === 200) {
                      const data = await response.json();
                
  
                      setDivision([ { value: "", label: "" }, ...formatOptions(data.division || [], "division_id", "name")]);
                      setDespatch([ { value: "", label: "" }, ...formatOptions(data.despatch || [], "c_code", "name")]);
                      setCurrency([ { value: "", label: "",}, ...formatOptions(data.currency || [], "curr_code", 'curr_desc')])
                      setPreShipmentNo([ { value:"", label:""}, ...formatOptions(data.preShipmentNo || [], "pre_id","pre_inv_no")])
                      setModeOfTransport([ { value:"", label:""}, ...formatOptions(data.modeOfTransport || [], "mode_cd","description")])
                      setPriceBasis([ { value:"", label:""}, ...formatOptions(data.priceBasis || [], "del_terms","description")])
                      setPaymentTerm([ { value:"", label:""}, ...formatOptions(data.paymentTerm || [], "pmt_terms","term_desc")])
                      setStorageType([ { value:"", label:""}, ...formatOptions(data.storageType || [], "code","description")])
                  }
              } catch (error) {
                  //console.log(error); // Corrected error logging
              }
          };
  
          if (formStatus) {
              fetchConstantList();
          }
      }, [formStatus]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setMainFormData({})
    setItemFormData([{}])
    setDespatchFormData({})
    setPaymentFormData({})
    setControlData({}) 
  }, []);

  // COMMON FIELD CHANGE   ##'NOT INCLUDED VOLUMEN DISCOUNT TAB'
  const handleChange = (tab, name, value, index, event, block = null) => {
      if (!["Search"].includes(formStatus)) {
             return;
         }

    const cursorPosition = event?.target?.selectionStart;
    const newVal = value.toUpperCase();

    switch (tab) {
      case "MainTab":
        setMainFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "ItemTab":
        setItemFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;
      case "PaymentTab":
        setPaymentFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "DespatchTab":
        setDespatchFormData((prev) => ({ ...prev, [name]: newVal }));
        break;

      default:
        break;
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target)
        event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  // CHANGING TAB
  const handleChangeTab = (getTab) => {
    setTabs([getTab]);
    setCurrentFormTab(getTab);
  };

  const renderFormTab = (tab) => {
    if (tab === "Main") {
      return (
        <ReverseChargeInvoiceMain
          formData={mainFormData}
          formStatus={formStatus}
          handleChange={(name, value) => handleChange("MainTab", name, value)}
          handleChangeTab={handleChangeTab}
          division={division}
          despatch={despatch}
          currency={currency}
          preShipmentNo={preShipmentNo}
        />
      );
    } else if (tab === "Items") {
      return (
        <ReverseChargeInvoiceItem
          itemFormData={itemFormData}
          formStatus={formStatus}
          handleChange={(name, value, index, event) => handleChange("ItemTab", name, value, index, event)}
          handleAddRow={() => handleAddRow(TYPES.ITEMS)} 
          handleChangeTab={handleChangeTab}
          formData={mainFormData}
          controlData={controlData}
          setControlData={setControlData}
          storageType={storageType}
          focusedRowIndex={focusedRowIndex}
          setFocusedRowIndex={setFocusedRowIndex}
        />
      );
    } else if (tab === "Payment") {
      return (
        <ReverseChargeInvoicePayment
          paymentFormData={paymentFormData}
          formStatus={formStatus}
          handleChange={(name, value) =>
            handleChange("PaymentTab", name, value)
          }
          handleChangeTab={handleChangeTab}
          paymentTerm={paymentTerm}
        />
      );
    } else if (tab === "Despatch") {
      return (
        <ReverseChargeInvoiceDespatch
          despatchFormData={despatchFormData}
          formStatus={formStatus}
          handleChange={(name, value) =>
            handleChange("DespatchTab", name, value)
          }
          handleChangeTab={handleChangeTab}
          modeOfTransport={modeOfTransport}
          priceBasis={priceBasis}
        />
      );
    }
  };

    // Render Bottom Submit Bar Btn Dynamically
    const renderBottomBtn = () => {
      const curntTab = {
        name: `${currentFormTab}`,
        id: `${currentFormTab.toLowerCase()}-btn`,
        color: "secondary",
        disabled: false,
        outline: true,
      };

      function handleClick(e, btn) {
        const simpleBarElement = document.querySelector("#simplebar-container .simplebar-content-wrapper");
        if (simpleBarElement) {
          simpleBarElement.scrollTo({ top: 0, behavior: "smooth" });
        }
        // Find the index of the clicked button
        const btnIndex = updatedButtons.findIndex((item) => item.id === btn.id);
  
        if (btnIndex !== -1) {
          const newButtons = [...updatedButtons]; // Create a new array (immutability)
          newButtons[btnIndex] = curntTab; // Update the specific button
          setUpdatedButtons(newButtons); // Update state
        }
        handleChangeTab(btn.name)
      }
      return updatedButtons.map((item) => ({
        ...item,
        onClick: (e) => handleClick(e, item),
      }));
    };


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (btnClicked === "Query") {
      setTotalRecordCount(queryData.count || totalRecordCount);

      if (!queryData?.mhsminvData) {
        toast.error(queryData.message || "No User data found");
        handleCancel()
        return;
      }
    }

    // Helper function to calculate sum or return blank if both fields are empty
    const calculateSum = (valField, cessField, data) => {
      const val = data[valField];
      const cess = data[cessField];
      // If both fields are null/undefined/empty, return ""
      if (
        (val === null || val === undefined || val === "") &&
        (cess === null || cess === undefined || cess === "")
      ) {
        return "";
      }
      // Otherwise, calculate sum
      return parseFloat(val || 0) + parseFloat(cess || 0);
    };

    // Main Tab Data
    if (queryData?.mhsminvData) {
      const formattedMainData = {
        ...queryData.mhsminvData,
        inv_dt: dateFormatter(queryData.mhsminvData.inv_dt),
        gr_rr_dt: dateFormatter(queryData.mhsminvData.gr_rr_dt),
        prep_dt: dateFormatter(queryData.mhsminvData.prep_dt),
        end_c_po_date: dateFormatter(queryData.mhsminvData.end_c_po_date),
        last_inv_dt: dateFormatter(queryData.mhsminvData.last_inv_dt),
        // Calculate sums for t_gst_*_amt_1 fields
        t_gst_sgst_amt_1: calculateSum("t_gst_sgst_amt", "t_gst_sgst_cess_amt", queryData.mhsminvData),
        t_gst_ugst_amt_1: calculateSum("t_gst_ugst_amt", "t_gst_ugst_cess_amt", queryData.mhsminvData),
        t_gst_cgst_amt_1: calculateSum("t_gst_cgst_amt", "t_gst_cgst_cess_amt", queryData.mhsminvData),
        t_gst_igst_amt_1: calculateSum("t_gst_igst_amt", "t_gst_igst_cess_amt", queryData.mhsminvData),
      //   t_gst_comp_cess_amt_1: queryData.mhsminvData.t_gst_comp_cess_amt
      //     ? parseFloat(queryData.mhsminvData.t_gst_comp_cess_amt)
      //     : "",
       };
      setMainFormData(formattedMainData);
    }

    if(queryData?.mhsminvData){
      const formattedData = {
        ...queryData.mhsminvData,
        removal_dt:dateFormatter(queryData.mhsminvData.removal_dt),
       

      }
      setDespatchFormData(formattedData);
    }
    if(queryData?.mhsminvData){
      const formattedData = {
        ...queryData.mhsminvData,
        due_dt:dateFormatter(queryData.mhsminvData.due_dt),
       

      }
      setPaymentFormData(formattedData);
    }

    // setMainFormData(queryData.mhsminvData);
    // setDespatchFormData(queryData.mhsminvData)
    // setPaymentFormData(queryData.mhsminvData)
    setItemFormData(queryData?.mdapbillRcData|| [])
    setFocusedRowIndex(0)

  },
    [formStatus, currentRecordNo]
  );
  
  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForGLSpecificSearch(mainFormData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_RCM_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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
        QUERY_API={APP_PROD_API.GET_RCM_FORM_DATA}
        opterationBtn={renderBottomBtn()}
        formName={""}
        authority={{"insert":'N', "update":'N'}}
         btnEnableDtl={{ insert:false,update :false}}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            {renderFormTab(currentFormTab)}
            </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ReverseChargeInvoice;
