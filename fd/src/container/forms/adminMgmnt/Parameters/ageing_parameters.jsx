import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import AgeingparameterDtl from './ageing_parameterDtl';
import { APP_PROD_API } from "../../../../utils/api";
import { periodInitialFormDataTemplate, updateFormpayloadTemplate } from './ageing_parameterHelpers';
import toast from "react-hot-toast";
import { isTypedArray } from 'lodash';


const AgeingParameters = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ debt_cred: 'C' });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  // Update Form Data payload Structure 
  const [updateFormPayload, setUpdateFormPayload] = useState({ ...updateFormpayloadTemplate })
  const [periodData, setPeriodData] = useState([{ ...periodInitialFormDataTemplate }])
  const [actualPeriodData, setActualPeriodData] = useState([{}]);
  const [deleteCredRecord, setDeletedCredRecord] = useState([]);

  const [selectedUserFlag, setSelectedUserFlag] = useState("");
  const [filteredPeriodData, setFilteredPeriodData] = useState(periodData);

  const [focusedRowIndex, setFocusedRowIndex] = useState(0)


  const tabs = ["Ageing Parameter"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleAddTableRecord = useCallback(async () => {
    // Form validation for finance year
    const periodForm = document.getElementById("ageing-parameter-form");
    if (!periodForm.checkValidity()) {
      periodForm.reportValidity();
      return;
    }


    // validation 

    // 3. Validation logic
    const fields = [
      { name: "from_period", value: periodData[focusedRowIndex]?.from_period },
      { name: "to_period", value: periodData[focusedRowIndex]?.to_period },

    ];



    if (formStatus === "Update" || formStatus === "Insert") {
      console.log("formStatus", formStatus);

      const row = periodData[focusedRowIndex];

      // Safe null/undefined-aware comparison helper
      const isEqual = (a, b) => (a == null && b == null) || a === b;

      const isChecked =
        isEqual(row?.init_from_period, row?.from_period) &&
        isEqual(row?.init_to_period, row?.to_period)


      if (!isChecked) {
        console.log("not checked");
        for (const f of fields) {
          const result = await getValidateData(
            f.name,
            f.value,
            otherQueryPera,
            focusedRowIndex
          );
          if (!result.valid) return;
        }
      }
    }


    // for add row 


    setPeriodData((prevData) => [
      ...prevData,
      {
        ...periodInitialFormDataTemplate,
        id: prevData.length + 1,
      },
    ]);
  }, [setPeriodData]);

  //DELETE ROW
  const handleDeleteRow = useCallback((index) => {
    setPeriodData((prev) => {
      if (prev.length === 0) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, [periodData]);

  // for delete record -----------------------
  async function deleteRecordInUpdate(index) {
    if (index < 0 || index >= periodData.length) {
      console.error("Invalid index:", index);
      return null;
    }

    const deletedRecord = periodData[index];

    // Track in deletedCredRecord
    setDeletedCredRecord((prev) => [...prev, deletedRecord]);

    return deletedRecord;
  }


  // for Update 
  async function updateAgeForm(data) {
    console.log("Updated Data:", data);


  }

  // for validation
  const getValidateData = async (
    fieldName,
    fieldValue,
    otherQueryPera = {},
    rowIndex
  ) => {
    let API_STRING;

    try {
      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_AGEING_PARAMETER_VALIDATE_DATA}?${fieldName}=${fieldValue}`, { credentials: 'include', };
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_AGEING_PARAMETER_VALIDATE_DATA}?${fieldName}=${fieldValue}&${otherParams}`, { credentials: 'include' };
      }

      const response = await fetch(API_STRING, { credentials: 'include' });

      if (response.status === 200) {
        const data = await response.json();
        console.log("Success data:", data);
        return true;
      }
      else if (response.status === 400) {
        const data = await response.json();

        console.log("Validation error:", data);

        if (data.error) {
          toast.error(data.error);
        }

        return false;
      }
      else {
        console.error("Unexpected status:", response.status);
        return false;
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      //toast.error("Something went wrong while validating the data.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Form validation for finance year
      const periodForm = document.getElementById("ageing-parameter-form");
      if (!periodForm.checkValidity()) {
        periodForm.reportValidity();
        return;
      }

      let body = {
        periodData: periodData,
        formData: formData,
      };

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          //deletedPeriodData: deletedPeriodData,
          updateFormPayload: updateFormPayload,
          deletedPeriodData: deleteCredRecord,
          // type: formData.type,
        };
      }  

      setDeletedCredRecord([])

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_AGEING_PARAMETER_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        }
      );

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success("Data saved successfully!");
      formCleanup()
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };


  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  function formCleanup() {
    setPeriodData([periodInitialFormDataTemplate])
    releaseFormStatus()
     setFormData({ debt_cred: "C" });
  };

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  const handleChange = useCallback((type, name, value, rowIndex = null) => {

    if (!['Insert', 'Update', 'Search', 'Query'].includes(formStatus)) {

      return
    }

    // const getUpdatedValue = () => {
    //   if (!isNumberField && e?.target) {
    //     const { selectionStart, selectionEnd } = e.target;
    //     const newValue = processedValue;

    //     requestAnimationFrame(() => {
    //       e.target?.setSelectionRange(selectionStart, selectionEnd);
    //     });

    //     return newValue;
    //   }
    //   return processedValue;
    // };

    console.log('handle checked clicked')
    switch (type) {
      case "formData":
        setFormData(prev => ({
          ...prev,
          [name]: typeof value === "string" ? value.toUpperCase() : value
        }));
        break;

      case "periodData":
        setPeriodData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update a specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: typeof value === "string" ? value.toUpperCase() : value
            };
            return newData;
          } else {
            // Update all rows (used for Select field outside table)
            return prev.map(row => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value
            }));
          }
        });
        break;

      default:
        console.log("handleChange is not properly defined");
    }
  }, [formStatus]);


  const handleSetPeriodData = (data) => {
    setPeriodData(data);
  };

  const otherQueryPera = {
    debt_cred: formData.debt_cred,  // Add debt_cred here
    // Add any other query parameters if needed
  };

  // const setupQueryData = (queryData, btnClicked) => {
  //   //console.log("query function called")
  //   if (btnClicked === "Query") {
  //     setFormData(queryData);
  //     setActualPeriodData(queryData?.periodData);
  //     setPeriodData(queryData?.periodData);
  //     console.log("query data:", queryData);
  //     // console.log("actualperioddata:", actualPeriodData)
  //   }

  //   console.log("currentRecordNo:", currentRecordNo);
  //   setTotalRecordCount(queryData?.count || totalRecordCount);
  // };  

  // const setupQueryData = (queryData, btnClicked) => {
  //   if (btnClicked === "Query") {
  //     setFormData(queryData); 

  //     setActualPeriodData(queryData?.periodData);

  //     // Filter creditor ("C") data initially
  //     const creditorData = queryData?.periodData?.filter(item => item.debt_cred === "C") || [];

  //     setFilteredPeriodData(creditorData);
  //     handleSetPeriodData(creditorData);

  //     // Set selected flag to "C"
  //     setSelectedUserFlag("C");
  //     handleChange("formData", "debt_cred", "C");
  //     //   setTotalRecordCount(queryData?.count || totalRecordCount);
  //   }
  // };  

  const setupQueryData = (queryData, btnClicked) => {
    // if (btnClicked === "Query") {  

    if (btnClicked === "Query") {
      if (queryData.count === 0) {
        toast.error('No record found')
        handleCancel()
        return
      }
    }
    const updatedData = queryData.periodData.map(item => ({
      ...item,
      init_from_period: item.from_period,
      init_to_period: item.to_period
    }));

    console.log("Updated Data:", updatedData);

    setActualPeriodData(updatedData);
    setPeriodData(updatedData);

    const creditorData = updatedData.filter(
      item => item.debt_cred?.trim().toUpperCase() === "C"
    );

    console.log("Creditor Data:", creditorData);

    setFilteredPeriodData(creditorData);
    handleSetPeriodData(creditorData);

    setSelectedUserFlag("C");
    handleChange("formData", "debt_cred", "C");

    setTotalRecordCount(queryData.count || totalRecordCount)
    setCurrentRecordNo(creditorData.length - 1)
    // }
  };





  // console.log('formStatus from ageing form', formStatus)
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
        isQueryReqOnInsertBtn={true}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_AGEING_PARAMETER_DATA}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <AgeingparameterDtl
              formData={formData}
              setFormData={setFormData}
              periodData={periodData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddTableRecord}
              handleDeleteRow={handleDeleteRow}
              updateAgeForm={updateAgeForm}
              actualPeriodData={actualPeriodData}
              handleSetPeriodData={handleSetPeriodData}
              getValidateData={getValidateData}
              deleteRecordInUpdate={deleteRecordInUpdate}
              otherQueryPera={otherQueryPera}
              setFilteredPeriodData={setFilteredPeriodData}
              setSelectedUserFlag={setSelectedUserFlag}
              setCurrentRecordNo={setCurrentRecordNo}

            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default AgeingParameters;

