
import React, { useEffect } from 'react';
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import {   currencyMasterInitialData, validateCurrencyBusinessRules, validateCurrencyPeriodOverlap, } from './Currency_master_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import CurrencyMasterHdrDtl from './currency_master_Hdr_Dtl';
import toast from 'react-hot-toast';

const CurrencyMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [historyFormData, setHistoryFormData] = useState([]);
  const [deleteData, setDeleteData] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [focusedHeaderRowIndex, setFocusedHeaderRowIndex] = useState(0);
  const [focusedHistoryRowIndex, setFocusedHistoryRowIndex] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);


  const tabs = ["Currency Master"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData([]);
    setHistoryFormData([]);
    setDeleteData([]);
    setCurrentRecordNo(0);       
    setFocusedHeaderRowIndex(0);  
    setFocusedHistoryRowIndex(0);
    setHistoryPage(1);
  }, []);


  const handleChange = useCallback((name, value, index, event, dataType) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const cursorPosition = event?.target?.selectionStart || 0;
    let newVal =   value.toUpperCase();

  if (name === "ex_rate") {
    // Allow empty string for deletion
    if (value !== "") {
      const num = Number(value);
      if (num <= 0) return; // prevent zero or negative
      const regex = /^\d*\.?\d{0,3}$/;
      if (!regex.test(value)) return;
    }
  }

    // if (dataType === "formData") {
    //       setFormData((prevData) => {
    //   const updated = [...prevData];
    //   updated[index] = {
    //     ...updated[index],
    //     [name]: newVal,
       
    //   };
    //   return updated;
    // });
    // } 
    if (dataType === "formData") {
  setFormData((prevData) => {
    const updated = [...prevData];

    // Check if this is an existing row and formStatus is "Update"
    const isExistingRow = updated[index]?.isStatus !== "new"; // new rows already "new"

    updated[index] = {
      ...updated[index],
      [name]: newVal,
      ...(isExistingRow ? { isStatus: "update" } : {}), // mark as update if editing existing
    };

    return updated;
  });
}
else if (dataType === "historyFormData") {
      setHistoryFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
    }

    if (
    event?.target &&
    event.target.tagName === "INPUT" &&
    !["number", "radio", "checkbox", "date"].includes(event.target.type)
  ) {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }
  }, [formStatus]);



const hasDuplicateCurrCode = (data) => {
  const codes = data.map(row => row.curr_code?.trim()?.toUpperCase()).filter(Boolean);
  const uniqueCodes = new Set(codes);
  return uniqueCodes.size !== codes.length;
};


const triggerAddRow = async () => {
  const isValidDetail = validateForm("curr-mstr", "Currency Master");
  if (!isValidDetail) return;

  // Check duplicate curr_code in UI
  if (hasDuplicateCurrCode(formData)) {
    toast.error("Duplicate Currency Code found in existing rows");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  setFormData(prev => {
    const newIndex = prev.length;
    const newRows = [
      ...prev,
      { ...currencyMasterInitialData, eff_date: today, isStatus: "new" },
    ];
    setFocusedHeaderRowIndex(newIndex);
    return newRows;
  });
};
   

  const handleDelete = useCallback(
    (data, rowIndex) => {
      if (!["Insert", "Update"].includes(formStatus)) return;

      const selectedRow = formData[rowIndex];
      if (!selectedRow) return;

      // Check if this master has any detail (history) rows
      if (selectedRow.historyData && selectedRow.historyData.length > 0) {
        toast.error("Cannot delete History exist.");
        return;
      }
      setFormData((prev) => prev.filter((_, i) => i !== rowIndex));
      setFocusedHeaderRowIndex((prevIndex) =>
        rowIndex > 0 ? rowIndex - 1 : 0
      );
    },
    [formStatus, formData]
  );


   async function handleSubmit(e) {
     e.preventDefault();

  if (!["Insert", "Update"].includes(formStatus)) return;

  try {

     // required / null validation
  const isValidDetail = validateForm("curr-mstr", "Currency Master");
  if (!isValidDetail) return;

  //  BUSINESS VALIDATION (ORACLE LOGIC)
  for (let i = 0; i < formData.length; i++) {
    const row = formData[i];

    const isValid = validateCurrencyBusinessRules(row, formStatus);
    if (!isValid) {
      return; // submit stop
    }
  }

  if (formStatus === "Update") {
  for (const row of formData.filter(r => r.isStatus === "update")) {

    const isOnlyClosingRecord =
      row.param_eff_date === row.eff_date &&
      !row.param_end_date &&
      !!row.end_date;

    //  agar sirf close kar raha hai → overlap mat chalao
    if (isOnlyClosingRecord) {
      continue;
    }

    const isValid = validateCurrencyPeriodOverlap(
      row,
      historyFormData
    );

    if (!isValid) return;
  }
}


    // Separate new and updated records (early check)
    const newRecords = formData.filter(row => row.isStatus === "new");
    const updatedRecords = formData.filter(row => row.isStatus === "update");

    if (newRecords.length === 0 && updatedRecords.length === 0) {
      toast.error("No new record to submit");
      return;
    }
    


    if (hasDuplicateCurrCode(formData)) {
      toast.error("Duplicate Currency Code found — please fix before saving");
      return;
    }


   //  Prepare payload
      const payload = {
        newRecords: newRecords.map(row => {
          const { historyData, ...rest } = row; // remove historyData
          return rest;
        }),
        updatedRecords: updatedRecords.map(row => {
          const { historyData, ...rest } = row; // remove historyData
          return rest;
        }),
      };

    //  Decide API method
    const method = formStatus === "Insert" ? "POST" : "PUT"; 

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CURR_MSTR_DATA}?form_status=${formStatus}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to submit form");
    }

    toast.success("Form submitted successfully");
    handleCancel(); 
  } catch (error) {
    console.error("Submit error:", error);
    toast.error(error.message || "Failed to submit form");
  }
    }


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (queryData?.type === "not_found" || !queryData?.currMaster?.length) {
        toast.error("No Data Found");
        handleCancel();
        setFormData([]);
        setHistoryFormData([]);
        setTotalRecordCount(0);
        return;
      }

      // Step 1: Normalize master data
      const formattedMaster = (queryData.currMaster || []).map((item) => ({
        ...item,
        eff_date: item.eff_date ? dateFormatter(item.eff_date) : null,
        end_date: item.end_date ? dateFormatter(item.end_date) : null,
        old_ex_rate: Number(item.ex_rate),
        old_curr_code: item.curr_code,
        param_eff_date: item.eff_date ? dateFormatter(item.eff_date) : null, 
        param_end_date: item.end_date ? dateFormatter(item.end_date) : null, 
      }));

      // Step 2: Attach formatted history data
      const historyData = queryData.historyResult || [];
      const mergedMaster = formattedMaster.map((master) => {
        const filteredHistory = historyData
          .filter((h) => h.curr_code === master.curr_code)
          .map((h) => ({
            ...h,
            eff_date: h.eff_date ? dateFormatter(h.eff_date) : null,
            end_date: h.end_date ? dateFormatter(h.end_date) : null,
          }));

        return {
          ...master,
          historyData: filteredHistory,
        };
      });

      // Step 3: Set state
      setFormData(mergedMaster);

      // Step 4: Default selection (first master record)
      setFocusedHeaderRowIndex(0);
      setHistoryFormData(mergedMaster[0]?.historyData || []);

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.totalCount || 0);
        setCurrentRecordNo(0);
        setHistoryPage(1);
      }
    },
    [formStatus, currentRecordNo]
  );

    useEffect(() => {
      const selectedMaster = formData[focusedHeaderRowIndex];
      setHistoryFormData(selectedMaster?.historyData || []);
      setHistoryPage(1);
      setFocusedHistoryRowIndex(0)
    }, [focusedHeaderRowIndex, formData]);


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
        handleOffset={(data) => setCurrentRecordNo(data)}
        QUERY_API={APP_PROD_API.GET_CURR_MSTR_FORM_DATA}
        formName={"Currency Master"}
        isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn = {false}
        // reqCurrentQueryRecOnInsert = {true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <CurrencyMasterHdrDtl
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              historyFormData={historyFormData}
              focusedHeaderRowIndex={focusedHeaderRowIndex}
              setFocusedHeaderRowIndex={setFocusedHeaderRowIndex}
              focusedHistoryRowIndex={focusedHistoryRowIndex}
              setFocusedHistoryRowIndex={setFocusedHistoryRowIndex}
              handleDelete={handleDelete}
              historyPage={historyPage}             
              setHistoryPage={setHistoryPage}  
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default CurrencyMaster;



