import React from 'react'
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import VendorTdsDeclarationDetails from './vendor_tds_declaration_dtl';
import { vendorTDSDeclData, vendorTDSDisableData, createSearchPayloadForBVSpecificSearch } from './vendor_tds_declaration_helper';
import toast from 'react-hot-toast';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { useSelector } from 'react-redux';


const VendorTdsDeclaration = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{ ...vendorTDSDeclData }]);

  const [disFormData, setDisFormData] = useState([{ ...vendorTDSDisableData }]);
  const [visibleData, setVisibleData] = useState([{ ...vendorTDSDisableData }]);
  const [recordsToShow, setRecordsToShow] = useState(100);

  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();

  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedRowIndex1, setFocusedRowIndex1] = useState(0);

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);



  const [transYear, setTransYear] = useState([])
  const [activeFormDisData, setActiveFormDisData] = useState([{ ...vendorTDSDisableData }]);

  const [deletedFormdata, setDeletedFormdata] = useState([])

  const [childDataMap, setChildDataMap] = useState({});

  useEffect(() => {
    const initialMap = {};
    formData.forEach((child) => {
      const key = child.v_code;
      if (!initialMap[key]) initialMap[key] = [];
      initialMap[key].push(child);
    });
    setChildDataMap(initialMap);
  }, [formData]);


  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_VENDOR_TDS_DROPDOWNDATA}`,
        )
        if (response.status === 200) {
          const data = await response.json()
          setTransYear([{ value: "", label: "" }, ...formatOptions(data.transYear || [], "trans_year", "trans_year")])

        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
  }, [formStatus])


  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const vCode = visibleData[focusedRowIndex]?.v_code;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vendorTdsForm = document.getElementById("vendor-tds-detail-form")
      const vendorTdsFormValidity = vendorTdsForm.checkValidity()
      if (!vendorTdsFormValidity) {
        if (vendorTdsForm.reportValidity) {
          vendorTdsForm.reportValidity()
        } else {
          throw new Error("Please fill all the required details in acc wise tds master")
        }
        return
      }

      // // const newRecords = activeFormDisData.filter(record => record.isNew);
      // const allFormData = Object.values(childDataMap)
      //   .map(childArray => childArray.filter(record => record.isNew))
      //   .flat();  

      const modifiedOrNew = Object.values(childDataMap)
        .flat()
        .filter((item) => item.isNew || item.isModified);


      let body = {
        formData: modifiedOrNew,
        vCode: vCode
      };

      if (formStatus === 'Insert') {
        let newRecords = activeFormDisData.filter(newData => newData.hasOwnProperty('id'));
        if (newRecords.length === 0) {
          toast.error('There should be atleast a New Entry for submit in Insert')
          return
        }

      }


      //  Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          deletedFormData: deletedFormdata

        };
      }

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_VENDOR_TDS_DATA}?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      handleCancel();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Please check all the form fields or contact administrator";

      toast.error(errorMsg);
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData([vendorTDSDeclData]);
    setDisFormData([vendorTDSDisableData])
    setVisibleData([vendorTDSDeclData])
    setActiveFormDisData([vendorTDSDisableData])
  }, []);



  // const handleChange = (name, value, index, event) => {
  //   const cursorPosition = event.target.selectionStart; // Store the current cursor position
  //   let newVal = value.toUpperCase();

  //   console.log(name, value, index, event, focusedRowIndex, vCode)

  //   setActiveFormDisData((prevData) => {
  //     const newData = [...prevData];
  //     newData[index] = { ...newData[index], [name]: newVal };
  //     return newData;
  //   });

  //   // setTimeout(() => {
  //   //   event.target.setSelectionRange(cursorPosition, cursorPosition);
  //   // }, 0);
  // }  

  // const handleChange = (name, value, index, event) => {
  //   const newVal = value.toUpperCase();

  //   const updatedData = [...activeFormDisData];
  //   updatedData[index] = { ...updatedData[index], [name]: newVal };

  //   // Update local state
  //   setActiveFormDisData(updatedData);

  //   // Update child map explicitly
  //   setChildDataMap((prevMap) => ({
  //     ...prevMap,
  //     [vCode]: updatedData,
  //   }));
  // };  

  const handleChange = (type, name, value, index, event) => {
    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }  
     console.log('event', event)
    const cursorPosition = event?.target?.selectionStart;

    const isNumericField = !isNaN(value) && value !== "";
    const parsedValue = isNumericField ? parseFloat(value) : value;
    const newVal = typeof parsedValue === "string" ? parsedValue.toUpperCase() : parsedValue;

  //  const newVal = value.toUpperCase();

    switch (type) {
      case "formData": {
        // Clone the array so we don't mutate state directly
        const updatedData = [...activeFormDisData];

        // Clone the record at the given index and update the property
        const targetRecord = { ...updatedData[index], [name]: newVal };

        // Mark as modified if not new
        if (!targetRecord.isNew) {
          targetRecord.isModified = true;
        }

        updatedData[index] = targetRecord;

        setActiveFormDisData(updatedData);

        setChildDataMap((prevMap) => ({
          ...prevMap,
          [vCode]: updatedData,
        }));

        break;
      }

      case "formDetailData": {
        setVisibleData((prev) => {
          if (index !== null && index >= 0) {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              [name]: newVal,
            };
            return newData;
          } else {
            return prev.map((row) => ({
              ...row,
              [name]: newVal,
            }));
          }
        });

        break;
      }

      default:
        
        break;
    }  

    // // Restore cursor only for text-compatible fields
    const supportedTypes = ["text", "search", "tel", "url", "password", "textarea"];
    if (event && supportedTypes.includes(event.target?.type)) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const otherQueryPera = {
    v_code: visibleData[focusedRowIndex]?.v_code
  }

  // for validate data  

  const getValidateData = async (fieldName, fieldValue, otherQueryPera = {}, rowIndex = null) => {
    try {
      let API_STRING;

      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_VENDOR_VALIDATE_DATA}?${fieldName}=${fieldValue}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_VENDOR_VALIDATE_DATA}?${fieldName}=${fieldValue}&${otherParams}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user?.id}`;
      }

      const response = await fetch(API_STRING);
      const data = await response.json();

      if (response.status === 200) {
        // Validation successful
        return { valid: true, data: data.data || null };
      } else if (response.status === 400) {
        toast.error(data.message);
        // setFormData((prevData) => {
        //   const updated = [...prevData];
        //   if (updated[rowIndex]) {
        //     // updated[rowIndex].v_code = "";
        //   }
        //   return updated;
        // });
        return { valid: false };
      } else if (response.status === 500) {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error(err.message);
      return { valid: false };
    }
  };


  // for search query 

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForBVSpecificSearch({ ...visibleData[0] });
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_VENDOR_TDS_DATA}?formStatus=${formStatus}&${queryList}`
      );

      if (data?.count === 0) {
        toast.error("No matching data record found");
        handleCancel()
        return;
      }

      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  // ADD NEW ROW
  const triggerAddRow = async (tableType) => {

    const vendorTdsForm = document.getElementById("vendor-tds-detail-form")
    const vendorTdsFormValidity = vendorTdsForm.checkValidity()
    if (!vendorTdsFormValidity) {
      if (vendorTdsForm.reportValidity) {
        vendorTdsForm.reportValidity()
      } else {
        throw new Error("Please fill all the required details in acc wise tds master")
      }
      return
    }

    // for checking duplicate data

    if (activeFormDisData.length > 1) {

      // Duplicate check
      const seen = new Set();
      for (const row of activeFormDisData) {
        const key = `${row.trans_year}`;
        if (seen.has(key)) {

          toast.error("Duplicate record found with same Trans Year");
          return
        }
        seen.add(key);
      }
    }


    // for check getValidateData 
    if (formStatus === "Update" || "Insert") {
      const isChecked =
        activeFormDisData[focusedRowIndex]?.init_trans_year === activeFormDisData[focusedRowIndex]?.trans_year


      if (!isChecked) {
        const result = await getValidateData(
          "trans_year",
          activeFormDisData[focusedRowIndex]?.trans_year,
          otherQueryPera,
          focusedRowIndex
        );
        if (!result.valid) return;
      }
    }

   
    // for add row

    switch (tableType) {
      case "formData":
        setVisibleData((prevData) => [
          ...prevData,
          {
            ...vendorTDSDisableData,

            id: prevData.length + 1,
          }
        ]);
        break;
      // case "formDetailData":
      //   setActiveFormDisData((prevData) => [
      //     ...prevData,
      //     {
      //       ...vendorTDSDeclData,
      //       v_code: vCode,
      //       id: prevData.length + 1,
      //     }
      //   ])
      //   break; 

      //   case "formDetailData": {
      //     const newRow = {
      //       ...vendorTDSDeclData,
      //       v_code: vCode,
      //       id: (childDataMap[vCode]?.length || 0) + 1,
      //     };

      //     const updatedData = [...activeFormDisData, newRow];
      //     setActiveFormDisData(updatedData);

      //     // Manually update the child map
      //     setChildDataMap((prevMap) => ({
      //       ...prevMap,
      //       [vCode]: updatedData,
      //     }));
      //     break;
      //   } 

      case "formDetailData":


        const newRow = {
          ...vendorTDSDeclData,
          v_code: vCode,
          id: (childDataMap[vCode]?.length || 0) + 1,
          isNew: true,  // Mark as new
        };

        setActiveFormDisData((prev) => {
          const updated = [...prev, newRow];

          setChildDataMap((prevMap) => ({
            ...prevMap,
            [vCode]: updated,
          }));

          return updated;
        });
        break;

      default:
        console.log("something went wrong")

    }

  }

  // Delete Row 
  const handleDeleteRow = useCallback((type, data, index) => {
    if (type === "formData") {
      let newDeleteData = [...deletedFormdata]

      newDeleteData.push(data)
      setDeletedFormdata(newDeleteData)

      setActiveFormDisData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    }

  }, [deletedFormdata]);



  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      if (btnClicked === 'Query') { 

        console.log('formStatus', formStatus, queryData.count) 
        
        // if (queryData.count === 0) { 
        //   console.log('jhd',queryData.count)
        //   toast.error('No Record Found')
        //   handleCancel()
        //   return
        // } 
      }
      

        if (queryData.count === 0) { 
          
          toast.error('No Record Found')
          handleCancel()
          return
        }

      // if (btnClicked === "Query") {
      setDisFormData(queryData.vendorData)
      setVisibleData(queryData.vendorData.slice(0, 50)); // First 50 only
      // setFormData(queryData.vendorTDSData) 

      const updatedData = queryData.vendorTDSData?.map(data => ({
        ...data,
        init_trans_year: data.trans_year

      })
      )

      setFormData(updatedData)
     

      setTotalRecordCount(queryData?.count || totalRecordCount);

    },
    [formStatus, currentRecordNo]
  );

  console.log('formStatus from memberform', formStatus)
  console.log('formStatus from memberform', activeFormDisData)
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
        searchQueryPayload={activeFormDisData}
        handleSearch={handleSearch}
        handleOffset={handleOffset}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}

        QUERY_API={APP_PROD_API.GET_VENDOR_TDS_DATA}
        formName={"Vendor TDS Declaration"}
        isQueryReqOnInsertBtn={true}
        isQueryReqOnNextPreBtn={false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>

            <VendorTdsDeclarationDetails
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDeleteRow}
              disFormData={disFormData}
              transYear={transYear}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              activeFormDisData={activeFormDisData}
              setActiveFormDisData={setActiveFormDisData}
              focusedRowIndex1={focusedRowIndex1}
              setFocusedRowIndex1={setFocusedRowIndex1}
              visibleData={visibleData}
              setVisibleData={setVisibleData}
              setRecordsToShow={setRecordsToShow}
              recordsToShow={recordsToShow}
              childDataMap={childDataMap}
              vCode={vCode}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}

            />

          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default VendorTdsDeclaration;

