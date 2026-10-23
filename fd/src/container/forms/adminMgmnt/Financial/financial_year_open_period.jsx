import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { financeInitialFormDataTemplate, tranInitialFormDataTemplate, updateFormDataPayloadTemplete } from './financial_year_OpenPeriodDetailHelper';
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import FinancialyearOpnPeriodDetail from './financial_year_OpenPeriodDtl';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import { update } from 'lodash';


const FinancialYearOpenPeriod = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [selectedFinIndex, setSelectedFinIndex] = useState()
  const [selectedTransId, setSelectedTransId] = useState('');

  const [selectedIndex1, setSelectedIndex1] = useState(null);

  const [financeData, setFinanceData] = useState([
    { ...financeInitialFormDataTemplate },
  ]);

  const [updateFormPayload, setUpdateFormPayload] = useState({ ...updateFormDataPayloadTemplete })

  const [focusedRowIndex, setFocusedRowIndex] = useState(0);


  // const [moduleData, setModuleData] = useState([{}]);

  // const [tranData, setTranData] = useState([{ ...tranInitialFormDataTemplate }]);

  const [selectedModeCd, setSelectedModeCd] = useState("B");
  //const [filteredModuleData, setFilteredModuleData] = useState(moduleData);


  //  const [filteredTranData, setFilteredTranData] = useState();
  // const [isFiltered, setIsFiltered] = useState(false);  // To track filtered state   
  // const [tranDataToShow, setTranDataToShow] = useState([{ ...tranInitialFormDataTemplate }])

  const [deletedTranData, setDeletedTranData] = useState([]);
  const [deletedFinData, setDeletedFinData] = useState([]);

  const [selectedFinanceData, setSelectedFinanceData] = useState(null);
  const [isUpdatedCurrentYear, setIsUpdatedCurrentYear] = useState(false)

  const TYPES = {
    TRANDATA: "tranyear",
    FINDATA: "finyear",
  };


  useEffect(() => {
    if (formStatus === "Query" && !formData?.selectedModeCd) {
      handleChange("formData", "selectedModeCd", "B"); // Set to "B" only in Query mode
    }
  }, [formStatus, formData]); // Dependency on formStatus and formData


  // useEffect(() => {
  //   console.log("useEffect for module data triggered");

  //   if (!moduleData) return; // Ensure moduleData is available before filtering

  //   let filteredData = [];

  //   if (selectedModeCd === "M") {
  //     filteredData = moduleData.filter((item) => item.module_name === item.trans_name);
  //     console.log("M CLICKED:", filteredData);
  //   } else if (selectedModeCd === "T") {
  //     filteredData = moduleData.filter((item) => item.module_name !== item.trans_name);
  //     console.log("T CLICKED:", filteredData);
  //   } else {
  //     filteredData = moduleData;
  //     console.log("B CLICKED:", moduleData);
  //   }

  //   setFilteredModuleData(filteredData);
  // }, [selectedModeCd, moduleData]); // Dependency array

  const handleModeChange = (flag) => {
    setSelectedModeCd(flag);
    handleChange("formData", "selectedModeCd", flag);
  };

  const tabs = ["Financial Year Open Period"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  // form cleanup on cancel and on submit

  const formCleanup = async () => {
    setFinanceData([financeInitialFormDataTemplate]);
    // setTranData([tranInitialFormDataTemplate]);
    // setModuleData("")
    // setFormStatus("");
    // setTranDataToShow([tranInitialFormDataTemplate])
    releaseFormStatus()
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Form validation for finance year
      const financeForm = document.getElementById(
        "financial-year-finyear-form"
      );
      if (!financeForm.checkValidity()) {
        financeForm.reportValidity();
        return;
      }


      let body = {
        financeData: financeData,
        //tranData: updatedTranData,
        deletedFinData: deletedFinData,
        //deletedTranData: deletedTranData
      };

      // Modify the body for "Update" status
      if (formStatus === "Update" && isUpdatedCurrentYear) {
        body.updatedCurrentYearData = selectedFinanceData;
      }

      setDeletedFinData([])


      console.log("Final body to send:", body);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_FINANCE_YEAR_OPEN_PERIOD_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include'
        }
      );

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success(
        `Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`
      );

      handleCancel();

    } catch (error) {
      toast.error(
        error ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  const otherQueryPera = {}

  //for field validation
  const fetchValidateData = async (
    fieldName,
    fieldValue,
    otherQueryPera = {},

  ) => {
    let API_STRING;

    try {
      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_FINANCE_YEAR_OPEN_PERIOD_VALIDATE_DATA}?${fieldName}=${fieldValue}`;
      } else {
        const otherParams = new URLSearchParams(

          otherQueryPera,

        ).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_FINANCE_YEAR_OPEN_PERIOD_VALIDATE_DATA}?${fieldName}=${fieldValue}&${otherParams}`;
      }

      console.log("API URL:", API_STRING);

      const response = await fetch(API_STRING, { credentials: 'include' });

      // Handle response status`as
      if (response.ok) {
        const data = await response.json();
        // setFinanceData((prev) => {
        //   // const updated = [...prev];
        //   // updated[focusedRowIndex] = {
        //   //   ...updated[focusedRowIndex],
        //   //   [fieldName]: '', // this clears only the current field
        //   // };
        //   // return updated; 
        // return data
        // }); 
        return true


      }
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error)
        return false
      }

    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
    }
  };


  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  // const handleChange = useCallback((type, name, value, focusedRowIndex = null) => {

  //   switch (type) {
  //     case "formData":

  //       setFormData(prev => ({
  //         ...prev,
  //         [name]: value
  //       }));
  //       break;

  //     case "financeData":
  //       setFinanceData(prev => {
  //         if (focusedRowIndex !== null && focusedRowIndex >= 0) {
  //           const newData = [...prev];
  //           newData[focusedRowIndex] = {
  //             ...newData[focusedRowIndex],
  //             [name]: value
  //           };
  //           return newData;
  //         } else {
  //           // return prev.map(row => (
  //           //   {
  //           //     ...row,
  //           //     [name]: typeof value === "string" ? value.toUpperCase : value
  //           //   }
  //           // )) 
  //           return prev.map(row => ({
  //             ...row,
  //             [name]: typeof value === "string" ? value.toUpperCase() : value
  //           }));

  //         }
  //       })
  //       break;

  //     // case "moduleData":
  //     //   setModuleData(prev => {
  //     //     if (focusedRowIndex !== null && focusedRowIndex >= 0) {
  //     //       const newData = [...prev];
  //     //       newData[focusedRowIndex] = {
  //     //         ...newData[focusedRowIndex],
  //     //         [name]: typeof value === "string" ? value.toUpperCase : value
  //     //       };
  //     //       return newData;
  //     //     } else {
  //     //       return prev.map(row => (
  //     //         {
  //     //           ...row,
  //     //           [name]: typeof value === "string" ? value.toUpperCase : value
  //     //         }
  //     //       ))
  //     //     }
  //     //   })
  //     //   break;

  //     // case "tranData":
  //     //   setTranDataToShow(prev => {
  //     //     if (focusedRowIndex !== null && focusedRowIndex >= 0) {
  //     //       const newData = [...prev];
  //     //       newData[focusedRowIndex] = {
  //     //         ...newData[focusedRowIndex],
  //     //         [name]: value
  //     //       };
  //     //       return newData;
  //     //     } else {
  //     //       return prev.map(row => (
  //     //         {
  //     //           ...row,
  //     //           [name]: value
  //     //         }
  //     //       ))
  //     //     }
  //     //   })
  //     //   break;

  //     default:
  //       console.warn("Invalid type provided to handleChange");

  //   }

  // }, []);  

  const handleChange = useCallback((type, name, value, focusedRowIndex = null) => {

    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }
    const transformedValue =
      typeof value === "string" ? value.toUpperCase() : value;

    switch (type) {
      case "formData":
        setFormData(prev => ({
          ...prev,
          [name]: transformedValue
        }));
        break;

      case "financeData":
        setFinanceData(prev => {
          if (focusedRowIndex !== null && focusedRowIndex >= 0) {
            const newData = [...prev];
            newData[focusedRowIndex] = {
              ...newData[focusedRowIndex],
              [name]: transformedValue
            };
            return newData;
          } else {
            return prev.map(row => ({
              ...row,
              [name]: transformedValue
            }));
          }
        });
        break;

      default:
        break;
    }
  }, [formStatus]);


  // ADD NEW ROW
  // const handleAddRow = useCallback((tableType) => {
  //   // Form validation for finance year
  //   const financeForm = document.getElementById(
  //     "financial-year-finyear-form"
  //   );
  //   if (!financeForm.checkValidity()) {
  //     financeForm.reportValidity();
  //     return;
  //   }  

  //   // for duplicate check 

  //   if (financeData.length > 1) {

  //     // Duplicate check
  //     const seen = new Set();
  //     for (const row of financeData) {
  //       const key = `${row.st_date}|${row.end_date}|`;
  //       if (seen.has(key)) {

  //         toast.error("Duplicate record found with same start date and end date");
  //         return
  //       }
  //       seen.add(key);
  //     }
  //   }   


  // // for checking getValidate Data   

  //     // 3. Validation logic
  //       const fields = [
  //           { name: "st_date", value: financeData[focusedRowIndex]?.st_date },
  //           { name: "end_date", value: financeData[focusedRowIndex]?.end_date },

  //       ];



  //       if (formStatus === "Update" || formStatus === "Insert") {
  //           console.log("formStatus", formStatus);

  //           const row = formDetailData[focusedRowIndex];

  //           // Safe null/undefined-aware comparison helper
  //           const isEqual = (a, b) => (a == null && b == null) || a === b;

  //           const isChecked =
  //               isEqual(row?.init_sno, row?.sno) &&
  //               isEqual(row?.init_sch_sno, row?.sch_sno)


  //           if (!isChecked) {
  //               console.log("not checked");
  //               for (const f of fields) {
  //                   const result = await getValidateData(
  //                       f.name,
  //                       f.value,
  //                       otherQueryPera,
  //                       focusedRowIndex
  //                   );
  //                   if (!result.valid) return;
  //               }
  //           }
  //       }



  //   switch (tableType) {
  //     case "financeTable":
  //       setFinanceData((prevData) => [
  //         ...prevData,
  //         {
  //           ...financeInitialFormDataTemplate,
  //           id: prevData.length + 1,
  //         }
  //       ]);
  //       break;
  //     // case "tranTable":
  //     //   setTranDataToShow((prevData) => [
  //     //     ...prevData,
  //     //     {
  //     //       ...tranInitialFormDataTemplate,
  //     //       id: prevData.length + 1,
  //     //     }
  //     //   ])
  //     //   break; 




  //     default:
  //       console.log("something went wrong")

  //   }

  // }, []);  

  const handleAddRow = useCallback(
    async (tableType) => {
      // Validate finance year form
      const financeForm = document.getElementById("financial-year-finyear-form");
      if (!financeForm.checkValidity()) {
        financeForm.reportValidity();
        return;
      }

      //  Duplicate check for financeData
      if (financeData.length > 0) {
        const seen = new Set();
        for (const row of financeData) {
          const key = `${row.st_date}|${row.end_date}`;
          if (seen.has(key)) {
            toast.error(
              "Duplicate record found with same start date and end date"
            );
            return;
          }
          seen.add(key);
        }
      }


      //  Add new row
      switch (tableType) {
        case "financeTable":
          setFinanceData((prevData) => [
            ...prevData,
            {
              ...financeInitialFormDataTemplate,
              id: prevData.length + 1,
            },
          ]);
          break;



        default:
          console.log("Invalid table type in handleAddRow");
      }
    },
    [
      financeData,
      // formDetailData,
      focusedRowIndex,
      formStatus,
      fetchValidateData,
      otherQueryPera,
      setFinanceData,
    ]
  );



  // handledelete 
  const handleDeleteRow = useCallback((type, data, index) => {
    if (type === "finyear") {
      let newDeleteData = [...deletedFinData]

      newDeleteData.push(data)
      setDeletedFinData(newDeleteData)

      setFinanceData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    }

    // if (type === "transyear") {

    //   let newDeleteData = [...deletedTranData]
    //   newDeleteData.push(data)
    //   setDeletedTranData(newDeleteData)

    //   setTranDataToShow((prev) => {
    //     if (prev.length === 0) return prev;
    //     return prev.filter((_, i) => i !== index);
    //   });
    // }


  }, [deletedFinData]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // Set data for Query action
      if (btnClicked === "Query") {

        if (queryData.count == 0) {
          toast.error('No record found')
          handleCancel()
          return
        }
      }
      setFormData(queryData);
      setFinanceData(queryData.financeData);
      // setTranData(queryData.tranData);
      // console.log("tran data:", queryData.tranData);
      // setModuleData(queryData.moduleData);
      //setFilteredTranData(queryData.tranData); // Immediately update filteredTranData
      //setIsFiltered(true); // Reset filter state
      // } else {
      console.log("moduledata clicked");
      setFormData(queryData);
      //setModuleData(queryData.moduleData);
      // }
      setTotalRecordCount(queryData?.count || totalRecordCount);
      console.log("currentRecordNo:", currentRecordNo);
    },
    // setIsFiltered(false) // Reset filter state
    [formStatus, currentRecordNo]
  );

  //for updating current year value
  const handleRowClick = (focusedRowIndex) => {
    const updatedFinanceData = financeData.map((item, i) => ({
      ...item,
      flag: i === focusedRowIndex ? "C" : "N",
    }));

    setFinanceData(updatedFinanceData);

    const selectedData = updatedFinanceData.find((item, i) => i === focusedRowIndex);
    setSelectedFinanceData(selectedData);

    console.log("Selected Finance Data:", selectedData); // Log immediately
  };


  console.log('formStatus from memberform', formStatus)
  console.log('from parent', selectedTransId)

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
        QUERY_API={APP_PROD_API.GET_FINANCE_YEAR_OPEN_PERIOD_DATA}
        formName={""}
        isQueryReqOnInsertBtn={true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <FinancialyearOpnPeriodDetail
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              financeData={financeData}
              //moduleData={filteredModuleData}
              // tranData={tranData}
              // setSelectedModeCd={setSelectedModeCd}
              selectedFinIndex={selectedFinIndex}
              triggerAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              //setTranData={setTranData}
              //handleModeChange={handleModeChange}
              //setSelectedTransId={(data)=>{setSelectedTransId(data)}}
              fetchValidateData={fetchValidateData}
              handleRowClick={handleRowClick}
              //isFiltered={isFiltered}
              //setIsFiltered={setIsFiltered}
              //tranDataToShow = {tranDataToShow}
              //setTranDataToShow={(data)=>{setTranDataToShow(data)}}
              //updateCurrentYear={updateCurrentYear}
              setIsUpdatedCurrentYear={setIsUpdatedCurrentYear}
              isUpdatedCurrentYear={isUpdatedCurrentYear}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
            //selectedTransId = {selectedTransId}

            />

          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default FinancialYearOpenPeriod;

