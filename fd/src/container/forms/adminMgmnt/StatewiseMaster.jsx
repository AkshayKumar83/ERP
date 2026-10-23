import React, { useState, useCallback } from 'react'
import FormSetup from '../../../components/common/formSetup'
import { Form, TabContent, TabPane } from "reactstrap";
import StatewiseMasterDtl from './statewiseMasterDtl';
import { stateInitFormDataTemplate, visibleInitFormDataTemplate, updateFormpayloadTemplate, createSearchPayloadForBVSpecificSearch } from './statewiseMasterHelpers';
import { APP_PROD_API } from "../../../utils/api";
import { useFormStatus } from "../../../hooks/useFormStatus";
import { useRecordCount } from "../../../hooks/useRecordCount";
import toast from "react-hot-toast";
//import { fetchAppData } from '../../../utils/fetchUtils';
import { PiKeyReturnFill } from 'react-icons/pi';
import { fetchAppData } from '../../../utils/fetchUtils'; 



const StatewiseMasterNew = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [queryMode, setQueryMode] = useState(false);


  //formdata 
  const [formData, setFormData] = useState({type: "C"});
  const [stateData, setStateData] = useState([{ ...stateInitFormDataTemplate }]);
  const [actualStateData, setActualStateData] = useState([{}]);
  const [formDataType, setFormDataType] = useState("");

  //const [visibleData, setVisibleData] = useState([{ ...visibleInitFormDataTemplate }]) 
  const [visibleData, setVisibleData] = useState([{ ...stateInitFormDataTemplate }])
  const [page, setPage] = useState(1)

  // Update Form Data payload Structure 
  const [updateFormPayload, setUpdateFormPayload] = useState({ ...updateFormpayloadTemplate })

  const ITEMS_PER_PAGE = 100

  // for delete Record 
  const [deleteStateRecord, setDeletedStateRecord] = useState([]);

  // Hooks
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();
  const { handleOffset, currentRecordNo, setCurrentRecordNo, totalRecordCount, setTotalRecordCount } = useRecordCount()

  const [selectedTypeFlag, setSelectedTypeFlag] = useState("");

  const [filteredStateData, setFilteredStateData] = useState(stateData);


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleChange = useCallback((name, value) => { 
    if(!['Insert', 'Update', 'Search', 'Query'].includes(formStatus)) {
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Updates the specific field in the formData
    }));
  }, [formStatus]);



  // const handleStateDataChange = useCallback((name, value, rowIndex) => {
  //   setVisibleData((prev) => {
  //     const newValue = typeof value === "string" ? value.toUpperCase() : value;

  //     // Update the visible data state
  //     const newData = [...prev];
  //     newData[rowIndex] = {
  //       ...newData[rowIndex],
  //       [name]: newValue,
  //     };

  //     // push the record
  //     if (formStatus === 'Update') {
  //       setUpdateFormPayload((prevPayload) => {
  //         return {
  //           ...prevPayload,
  //           updatedStateData: [
  //             ...(prevPayload?.updatedStateData || []),
  //             newData[rowIndex], // Add the updated row
  //           ],
  //         };
  //       });
  //     }

  //     console.log("Updated row added to state:", newData[rowIndex]);

  //     return newData; // Return updated data
  //   });
  // }, []);   


  const handleStateDataChange = useCallback((name, value, rowIndex) => {

    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return
    }
    setVisibleData((prev) => {
      const newValue = typeof value === "string" ? value.toUpperCase() : value;

      //  if (!["Insert", "Update", "Search"].includes(formStatus)) {
      //   return
      // }

      // Update visibleData for display
      const newData = [...prev];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [name]: newValue,
      };

      // Check if it's an existing record (has state_id)
      const isExistingRecord = !!newData[rowIndex].state_id;

      if (formStatus === "Update" && isExistingRecord) {
        setUpdateFormPayload((prevPayload) => {
          const updatedPayload = { ...prevPayload };
          const arrayKey = "updatedStateData";

          // Ensure the array exists
          if (!updatedPayload[arrayKey]) {
            updatedPayload[arrayKey] = [];
          }

          const record = newData[rowIndex]; // Always use the latest row data
          const existingIndex = updatedPayload[arrayKey].findIndex(
            (item) => item.state_id === record.state_id
          );

          if (existingIndex !== -1) {
            // Update the existing record in updatedStateData
            updatedPayload[arrayKey][existingIndex] = {
              ...updatedPayload[arrayKey][existingIndex],
              ...record,
            };
          } else {
            // Add a new record (only if it doesn't already exist)
            updatedPayload[arrayKey].push(record);
          }

          console.log("Updated updatedStateData:", updatedPayload[arrayKey]);
          return updatedPayload;
        });
      }

      console.log("Updated row in visibleData:", newData[rowIndex]);
      return newData; // Return the updated visibleData
    });
  }, [formStatus]);




  const setupQueryData = (queryData, btnClicked) => {
    if (btnClicked === "Query") {
      setActualStateData(queryData?.stateData);

      const rawStateData = queryData?.stateData || [];

      // Normalize keys to string to prevent type mismatch
      const stateMap = new Map(
        rawStateData.map((item) => [String(item.state_id), item.state_name])
      );

      const updatedFilteredData = rawStateData.map((item) => {
        let parent_desc = stateMap.get(String(item.parent_id)) || null;

        // 👇 Patch if formStatus is Search and parentDesc is returned from backend
        if (formStatus === "Search" && !parent_desc && queryData.parentDesc) {
          parent_desc = queryData.parentDesc;
        }

        return {
          ...item,
          parent_desc,
        };
      });

      const cityData = updatedFilteredData.filter((item) => item.type === "C");

      // setSelectedTypeFlag("C");
      // handleChange("type", "C");

      if (formStatus === "Search") {
        setStateData(updatedFilteredData);
        setVisibleData(updatedFilteredData.slice(0, ITEMS_PER_PAGE));
      } else {
        setStateData(cityData);
        setVisibleData(cityData.slice(0, ITEMS_PER_PAGE));
        setSelectedTypeFlag("C");
        handleChange("type", "C");
      } 
       setCurrentRecordNo(cityData.length - 1) 
    } 
      setTotalRecordCount(queryData.count || totalRecordCount) 
     // setCurrentRecordNo(cityData.length) 
      console.log("currentRecordNo", currentRecordNo)
  };



  // for search query 

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForBVSpecificSearch({ ...visibleData[0], ...formData });
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await  fetchAppData(
        `${APP_PROD_API.GET_STATEWISE_MASTER_DATA}?formStatus=${formStatus}&${queryList}`
      );

      if (data?.count == 0) {
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


  // handle add record in table 

  const handleAddTableRecord = useCallback(() => { 
     const stateForm = document.getElementById("statewise-master-form");
      if (!stateForm.checkValidity()) {
        stateForm.reportValidity();
        return;
      }

    setVisibleData((prevData) => [
      ...prevData,
      {
        ...visibleInitFormDataTemplate,
        id: prevData.length + 1,
      },
    ]);
  }, [setVisibleData]);



  //DELETE ROW
  const handleDeleteRow = useCallback((index) => {
    setVisibleData((prev) => {
      if (prev.length === 0) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, [visibleData]);

  // for delete record -----------------------
  async function deleteRecordInUpdate(index) {
    if (index < 0 || index >= visibleData.length) {
      console.error("Invalid index:", index);
      return null;
    }

    const deletedRecord = visibleData[index];

    // Track in deletedCredRecord
    setDeletedStateRecord((prev) => [...prev, deletedRecord]);

    return deletedRecord;
  }

  const handleType = () => {
    setFormDataType(formData.type);
  };

  const handleSetStateData = (data) => {
    setStateData(data);

  };

  const otherQueryPera = {
    type: formData?.type
  }


  // for validation

  const getValidateData = async (
    fieldName,
    fieldValue,
    otherQueryPera = {}
  ) => {
    let API_STRING;

    try {
      if (!Object.keys(otherQueryPera).length) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_STATEWISE_MASTER_DATA}?${fieldName}=${fieldValue}`,{credentials:'include',};
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_STATEWISE_MASTER_DATA}?${fieldName}=${fieldValue}&${otherParams}`,{credentials:'include',};
      }

      console.log("API URL:", API_STRING);

      const response = await fetch(API_STRING,{credentials:'include'});

      if (response.status === 400) {
        const data = await response.json();
        console.log("Received data:", data);
        if (data.message) {
          toast.error(data.message);
        }
      } else if (response.status === 500) {
        const errmsg = await response.json();
        throw new Error(errmsg.message);
      } else if (response.status === 204) {
        toast.info("state not found");
      } else {
        console.error("Unexpected status:", response.status);
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
      const stateForm = document.getElementById("statewise-master-form");
      if (!stateForm.checkValidity()) {
        stateForm.reportValidity();
        return;
      }

      // if (formData.type === "S" || stateData.gst_state_code === "") {
      //   toast.error("GST code is mandatory for India");
      //  // return
      // }

      let body = {
        stateData: visibleData,
        formData: formData,
      };

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        //console.log("ba")
        body = {
          ...body,
          updateFormPayload: updateFormPayload,
          type: formData.type,
          deletedStateData: deleteStateRecord
        };
      }

      console.log("Final body to send:", body);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_STATEWISE_MASTER_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials:'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success(`Data ${formData?.state_id ? "updated" : "saved"} successfully!`);
      handleCancel()
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({})
    setStateData("");
    //setVisibleData([visibleInitFormDataTemplate]) 
    setVisibleData([stateInitFormDataTemplate])
  }, []);

  return (

    <React.Fragment>
      <FormSetup
        navType="tabs"
        activeTab={"activeTab"}
        tabs={["State Wise Master"]}
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
        formData={formData}
        handleOffset={handleOffset}
        searchQueryPayload={visibleData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}
        QUERY_API={APP_PROD_API.GET_STATEWISE_MASTER_DATA}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
           
              <StatewiseMasterDtl
                formData={formData}
                stateData={stateData}
                formStatus={formStatus}
                actualStateData={actualStateData}
                handleSetStateData={handleSetStateData}
                handleChange={handleChange}
                handleStateDataChange={handleStateDataChange}
                setStateData={setStateData}
                stateInitFormDataTemplate={stateInitFormDataTemplate}
                visibleData={visibleData}
                setVisibleData={setVisibleData}
                page={page}
                setPage={setPage}
                handleAddTableRecord={handleAddTableRecord}
                handleDeleteTableRecord={handleDeleteRow}
                getValidateData={getValidateData}
                deleteRecordInUpdate={deleteRecordInUpdate}
                otherQueryPera={otherQueryPera}
                setFilteredStateData={setFilteredStateData}
                setSelectedTypeFlag={setSelectedTypeFlag}
                setCurrentRecordNo = {setCurrentRecordNo}
              />
          
          </TabPane>
        </TabContent>
      </FormSetup >
    </React.Fragment>

  )
}

export default StatewiseMasterNew


// import React, { useState, useCallback } from "react"
// import FormSetup from "../../../components/common/formSetup"
// import { Form, TabContent, TabPane } from "reactstrap"
// import StatewiseMasterDtl from "./statewiseMasterDtl"
// import { stateInitFormDataTemplate, visibleInitFormDataTemplate } from "./statewiseMasterHelpers"
// import { APP_PROD_API } from "../../../utils/api"
// import { useFormStatus } from "../../../hooks/useFormStatus"
// import { useRecordCount } from "../../../hooks/useRecordCount"

// const ITEMS_PER_PAGE = 30

// const StatewiseMasterNew = () => {
//   const [activeTab, setActiveTab] = useState(1)
//   const [queryMode, setQueryMode] = useState(false)
//   const [formData, setFormData] = useState()
//   const [stateData, setStateData] = useState([stateInitFormDataTemplate])
//   const [actualStateData, setActualStateData] = useState([{}])
//   const [formDataType, setFormDataType] = useState("")
//   const [visibleData, setVisibleData] = useState([visibleInitFormDataTemplate])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [deleteStateRecord, setDeletedStateRecord] = useState(null)

//   const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus()
//   const { handleOffset, currentRecordNo, totalRecordCount, setTotalRecordCount } = useRecordCount()

//   const updateActiveTab = useCallback((tab) => {
//     setActiveTab(tab)
//   }, [])

//   const handleChange = useCallback((name, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }, [])


// const handleStateDataChange = (name, value, rowIndex) => {
//     setVisibleData((prev) => {
//       const updatedStateData = [...prev]
//       updatedStateData[rowIndex] = {
//         ...updatedStateData[rowIndex],
//         [name]: value,
//       }
//       return updatedStateData
//     })
//   }

//   const setupQueryData = (queryData, btnClicked) => {
//     if (btnClicked === "Query") {
//       setActualStateData(queryData?.stateData)

//       const stateMap = new Map(queryData?.stateData.map((item) => [item.state_id, item.state_name]))

//       const updatedFilteredData = queryData?.stateData.map((item) => ({
//         ...item,
//         parent_desc: stateMap.get(item.parent_id) || null,
//       }))

//       setStateData(updatedFilteredData)
//       setVisibleData(updatedFilteredData.slice(0, ITEMS_PER_PAGE))
//       setCurrentPage(1)
//       setTotalRecordCount(queryData?.count || totalRecordCount)
//     }
//   }

//   const handleAddTableRecord = useCallback(() => {
//     setVisibleData((prevData) => [
//       ...prevData,
//       {
//         ...visibleInitFormDataTemplate,
//         id: prevData.length + 1,
//       },
//     ])
//   }, [setVisibleData])

//   const handlePageChange = (page) => {
//     setCurrentPage(page)
//     const startIndex = (page - 1) * ITEMS_PER_PAGE
//     const endIndex = startIndex + ITEMS_PER_PAGE
//     setVisibleData(stateData.slice(startIndex, endIndex))
//   }

//   const handleType = () => {
//     setFormDataType(formData.type)
//   }

//   const handleSetStateData = (data) => {
//     setStateData(data)
//   }

//   function handleSubmit(e) {
//     e.preventDefault()
//     console.log("Form submitted", formData)
//   }

//   const handleCancel = useCallback(() => {
//     releaseFormStatus()
//     setFormData({})
//     setStateData("")
//     setVisibleData("")
//   }, [])

//   return (
//     <React.Fragment>
//       <FormSetup
//         navType="tabs"
//         activeTab={activeTab}
//         tabs={["Statewise Master"]}
//         updateActiveTab={updateActiveTab}
//         formStatus={formStatus}
//         currentRecordNo={currentRecordNo}
//         totalRecordCount={totalRecordCount}
//         pageCount={1}
//         totalPageCount={1}
//         isSingleQuery={true}
//         setupQueryData={setupQueryData}
//         handleSubmit={handleSubmit}
//         handleCancel={handleCancel}
//         handleOperation={handleOperation}
//         formData={formData}
//         handleOffset={handleOffset}
//         QUERY_API={APP_PROD_API.GET_STATEWISE_MASTER_DATA}
//         formName={"Statewise Master"}
//       >
//         <TabContent activeTab={activeTab}>
//           <TabPane tabId={1}>
//             <Form>
//               <StatewiseMasterDtl
//                 formData={formData}
//                 stateData={stateData}
//                 formStatus={formStatus}
//                 actualStateData={actualStateData}
//                 handleSetStateData={handleSetStateData}
//                 handleChange={handleChange}
//                 handleStateDataChange={handleStateDataChange}
//                 setStateData={setStateData}
//                 stateInitFormDataTemplate={stateInitFormDataTemplate}
//                 visibleData={visibleData}
//                 setVisibleData={setVisibleData}
//                 currentPage={currentPage}
//                 handlePageChange={handlePageChange}
//                 handleAddTableRecord={handleAddTableRecord}
//                 totalPages={Math.ceil(stateData?.length / ITEMS_PER_PAGE)}
//               />
//             </Form>
//           </TabPane>
//         </TabContent>
//       </FormSetup>
//     </React.Fragment>
//   )
// }

// export default StatewiseMasterNew

