import React, { useState, useCallback, useEffect, useRef } from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../components/common/formSetup";
import UserMasterDtl from "./userMasterDtl";
import { APP_PROD_API } from "../../../utils/api";
import { useFormStatus } from "../../../hooks/useFormStatus";
import { useRecordCount } from "../../../hooks/useRecordCount";
import {
  initUserMasterData,
  updFormpayloadTemplate, 
  createSearchPayloadForBVSpecificSearch
} from "./userMasterHelpers";
import { formatOptions } from "../../../lib";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import HelpList from "../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { fetchAppData } from "../../../utils/fetchUtils";

const UserMasterNew = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [queryMode, setQueryMode] = useState(false);

  // Hooks
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery} =
    useFormStatus();
  const {
    handleOffset,
    currentRecordNo,
    setCurrentRecordNo,
    totalRecordCount,
    setTotalRecordCount,
  } = useRecordCount();  

  //  const [currentRecordNo, setCurrentRecordNo] = useState(0);

  // Form Data
  const [formData, setFormData] = useState({ ...initUserMasterData });

  // Update Form Data payload Structure
  const [updateFormPayload, setUpdateFormPayload] = useState({
    ...updFormpayloadTemplate,
  });

  const [deletedDivisionData, setDeletedDivisionData] = useState([]);
  const [deletedLocationData, setDeletedLocationData] = useState([]);

  // DropDown Data
  const [departments, setDepartment] = useState([]);
  const [authpersons, setAuthPerson] = useState([]);

  //Suggestion Data
  const [empSuggestions, setEmpSuggestions] = useState([]); // for emp_cd
  const [divisionSuggest, setDivisionSuggest] = useState([]); // division name
  const [locationSuggest, setLocationSuggest] = useState([]); // location_desc
  const [showSuggestionList, setShowSuggestionList] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [activeRow, setActiveRow] = useState({ type: null, index: null });

  const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState(""); //fieldName for helpList you want

  const [helpListHeader, setHelpListHeader] = useState([]);

  const [focusedRowIndex, setFocusedRowIndex] = useState(null);
  const [focusedRowIndex1, setFocusedRowIndex1] = useState(null);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_USER_MASTER_DROPDOWN_DATA
          }`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          setDepartment([
            { value: "", label: "" },
            ...formatOptions(data.departments || [], "dept_cd", "department"),
          ]);
          setAuthPerson([
            { value: "", label: "" },
            ...formatOptions(data.authpersons || [], "user_id", "login_name"),
          ]);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  //Get Validate Data for field level record--------------------

  // const getValidateData = async (validData, value) => {
  //   console.log("Fetching validData:", validData, "with value:", value);

  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_USER_MASTER_VALIDATE_DATA}?validdata=${validData}&value=${value}`
  //     );

  //     if (response.status === 200) {
  //       const data = await response.json();

  //       console.log("Received data:", data);

  //       if (validData === "employeecd") {
  //         // If employee code already exists, show error first and return immediately
  //         if (data.message === "Employee code already exists") {
  //           toast.error("Employee code already exists");
  //           return; // Stop execution here
  //         }

  //         // If emp_name is found, set it in the form
  //         if (data.emp_name) {
  //           // setFormData((prevData) => ({
  //           //   ...prevData,
  //           //   emp_name: data.emp_name,
  //           // }));
  //         }
  //       } else if (data.message) {
  //         toast.error(data.message);
  //       }
  //     } else if (response.status === 500) {
  //       const errmsg = await response.json();
  //       throw new Error(errmsg.message);
  //     } else if (response.status === 204) {
  //       //toast.error("User not found");
  //     } else {
  //       console.error("Unexpected status:", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //   }
  // };

  const getValidateData = async (validData, value) => {
    console.log("Fetching validData:", validData, "with value:", value);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_USER_MASTER_VALIDATE_DATA
        }?validdata=${validData}&value=${value}`,
        { credentials: "include" }
      );

      if (response.status === 200) {
        const data = await response.json();
        console.log("Received data:", data);

        // alert('here')
        // Employee code validation
        if (validData === "employeecd") {
          setFormData((prev) => {
            return { ...prev, emp_cd: "", emp_name: "" };
          });
          if (data.message === "Employee already defined") {
            toast.error("Employee code already exists");
            return false;
          }
        }
        // Login name validation
        else if (validData === "loginname") {
          if (data.message === "User already defined") {
            setFormData((prev) => {
              return { ...prev, login_name: "" };
            });
            toast.error("Login name already exists");
            return false;
          }
        }

        // Any generic error message
        else if (data.message) {
          toast.error(data.message);
          return false;
        }

        return true; // Passed validation
      }

      if (response.status === 204) {
        return true; // No content = valid
      }

      if (response.status === 500) {
        const errmsg = await response.json();
        throw new Error(errmsg.message);
      }

      toast.error("Unexpected error occurred");
      return false;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate input");
      return false;
    }
  };

  // for validate division data
  const validateDivisionData = (name, rowIndex) => {
    const isDuplicate = formData.userDivisionData.some(
      (division, idx) => division.name === name && idx !== rowIndex
    );

    if (isDuplicate) {
      toast.error("Division already exists");
      return false;
    }

    return true;
  };

  // for validate default div
  const validateDefaultDiv = (formData) => {
    if (!formData || !Array.isArray(formData.userDivisionData)) {
      return false; // Handle cases where formData or userDivisionData is undefined/null
    }

    // Count the number of records with default_division = "Y"
    const defaultCount = formData.userDivisionData.filter(
      (record) => record.default_division === "Y"
    ).length;

    // Check if there is more than one "Y"
    if (defaultCount > 1) {
      toast.error("Only one division can be the default division");
      return false;
    }

    return true;
  };

  //for validate location data
  const validateLocationData = (location_desc, rowIndex) => {
    const isDuplicate = formData.userLocationData.some(
      (location, idx) =>
        location.location_desc === location_desc && idx !== rowIndex
    );

    if (isDuplicate) {
      toast.error("Location already exist");
      return false;
    }
    return true;
  };

  // for validate default location data
  const validateDefaultLoc = (formData) => {
    if (!formData || !Array.isArray(formData.userLocationData)) {
      return false; // Handle cases where formData or userDivisionData is undefined/null
    }

    // Count the number of records with default_division = "Y"
    const defaultCount = formData.userLocationData.filter(
      (record) => record.default_location === "Y"
    ).length;

    // Check if there is more than one "Y"
    if (defaultCount > 1) {
      toast.error("Only one location can be the default location");
      return false;
    }

    return true;
  };

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);
    let index = focusedRowIndex;
    let index1 = focusedRowIndex1;

    setFormData((prev) => {
      if (!prev) return prev; // Ensure prev exists

      switch (helpFor) {
        case "employee":
          return { ...prev, emp_cd: data.emp_cd, emp_name: data.emp_name };

        case "division":
          if (
            !Array.isArray(prev.userDivisionData) ||
            index < 0 ||
            index >= prev.userDivisionData.length
          ) {
            return prev;
          }

          // Check for duplicate division_id before updating
          const isDuplicateDivision = prev.userDivisionData.some(
            (item) => item.division_id === data.division_id
          );
          if (isDuplicateDivision) {
            toast.error("This division already exists");
            return prev;
          }

          // Update form data
          const updatedDivisionData = prev.userDivisionData.map((item, i) =>
            i === index
              ? { ...item, division_id: data.division_id, name: data.name }
              : item
          );

          //Update updateFormPayload for Update operation
          // if (formStatus === "Update") {
          //   setUpdateFormPayload((prevPayload) => {
          //     const updatedPayload = { ...prevPayload };
          //     const arrayKey = "updatedDivision";
          //     const identifier = prev.userDivisionData[index].user_id ? "origin_division_id" : "id";

          //     // Find the index of the existing record
          //     const existingIndex = updatedPayload[arrayKey].findIndex(
          //       (item) => item[identifier] === prev.userDivisionData[index][identifier]
          //     );

          //     if (existingIndex !== -1) {
          //       // Update existing record
          //       updatedPayload[arrayKey][existingIndex] = {
          //         ...updatedPayload[arrayKey][existingIndex],
          //         division_id: data.division_id,
          //         name: data.name,
          //       };
          //     } else {
          //       // Add new record
          //       updatedPayload[arrayKey].push({
          //         ...prev.userDivisionData[index],
          //         division_id: data.division_id,
          //         name: data.name,
          //       });
          //     }

          //     return updatedPayload;
          //   });
          // }

          return {
            ...prev,
            userDivisionData: updatedDivisionData,
          };

        case "location":
          if (
            !Array.isArray(prev.userLocationData) ||
            index1 < 0 ||
            index1 >= prev.userLocationData.length
          ) {
            return prev;
          }

          // Check for duplicate location_id before updating
          const isDuplicateLocation = prev.userLocationData.some(
            (item) => item.location_id === data.location_id
          );
          if (isDuplicateLocation) {
            toast.error("This location already exists");
            return prev;
          }

          // Update form data
          const updatedLocationData = prev.userLocationData.map((item, i) =>
            i === index1
              ? {
                  ...item,
                  location_id: data.location_id,
                  location_desc: data.location_desc,
                }
              : item
          );

          // Update updateFormPayload for Update operation
          // if (formStatus === "Update") {
          //   setUpdateFormPayload((prevPayload) => {
          //     const updatedPayload = { ...prevPayload };
          //     const arrayKey = "updatedLocation";
          //     const identifier = prev.userLocationData[index1].user_id ? "origin_location_id" : "id";

          //     // Find the index of the existing record
          //     const existingIndex = updatedPayload[arrayKey].findIndex(
          //       (item) => item[identifier] === prev.userLocationData[index1][identifier]
          //     );

          //     if (existingIndex !== -1) {
          //       // Update existing record
          //       updatedPayload[arrayKey][existingIndex] = {
          //         ...updatedPayload[arrayKey][existingIndex],
          //         location_id: data.location_id,
          //         location_desc: data.location_desc,
          //       };
          //     } else {
          //       // Add new record
          //       updatedPayload[arrayKey].push({
          //         ...prev.userLocationData[index1],
          //         location_id: data.location_id,
          //         location_desc: data.location_desc,
          //       });
          //     }

          //     return updatedPayload;
          //   });
          // }

          return { ...prev, userLocationData: updatedLocationData };

        default:
          return prev;
      }
    });
  };

  // On change Input formData
  // const handleChange = useCallback(
  //   (name, value, index = -1, arrayName = null, event) => {
  //     if (!["Insert", "Update", "Search"].includes(formStatus)) {
  //       return;
  //     }

  //     console.log("event", event);
  //     const cursorPosition = event?.target?.selectionStart;
  //     const newValue = typeof value === "string" ? value.toUpperCase() : value;

  //     if (["emp_cd", "name", "location_desc"].includes(name)) {
  //       toast.error("Please select from Helplist");
  //       return;
  //     }

  //     setFormData((prev) => {
  //       const updatedData = { ...prev };

  //       // Check if we're working with an array and index is provided
  //       if (arrayName && index !== -1) {
  //         updatedData[arrayName] = prev[arrayName].map((item, i) =>
  //           i === index ? { ...item, [name]: newValue } : item
  //         );

  //         const supportedTypes = [
  //           "text",
  //           "search",
  //           "tel",
  //           "url",
  //           "password",
  //           "textarea",
  //         ];
  //         if (event && supportedTypes.includes(event.target?.type)) {
  //           setTimeout(() => {
  //             event.target.setSelectionRange(cursorPosition, cursorPosition);
  //           }, 0);
  //         }
  //       } else {
  //         updatedData[name] = newValue;
  //       }

  //       return updatedData;
  //     });
  //   },
  //   [formStatus]
  // );  


  const handleChange = useCallback(
  (name, value, index = -1, arrayName = null, event = null) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) return;

    const cursorPosition = event?.target?.selectionStart;
    const newValue = typeof value === "string" ? value.toUpperCase() : value;

    if (["emp_cd", "name", "location_desc"].includes(name)) {
      toast.error("Please select from Helplist");
      return;
    }

    setFormData((prev) => {
      const updatedData = { ...prev };

      if (arrayName && index !== -1) {
        updatedData[arrayName] = prev[arrayName].map((item, i) =>
          i === index ? { ...item, [name]: newValue } : item
        );
      } else {
        updatedData[name] = newValue;
      }

      // Restore cursor position for supported input types
      if (event && ["text", "search", "tel", "url", "password", "textarea"].includes(event.target?.type)) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }

      return updatedData;
    });
  },
  [formStatus]
);


  const handleAddTableRecord = (tableType) => {
    setFormData((prev) => {
      const maxId = formData[tableType].length;
      //   const maxId = Math.max(0, ...prev[tableType].map((item) => item.id))
      const newRow = {
        ...initUserMasterData[tableType][0],
        id: maxId + 1,
      };

      return { ...prev, [tableType]: [...prev[tableType], newRow] };
    });
  };

  // const handleDelete = useCallback((type, index) => {
  //   if (type === "userDivisionData") {
  //       let newDeleteData = [...deletedDivisionData]
  //       newDeleteData.push(data)
  //   setDeletedDivisionData(newDeleteData)

  //   }
  //   if (type === "userLocationData") {
  //       let newDeleteData = [...deletedLocationData]
  //       newDeleteData.push(data)
  //   setDeletedLocationData(newDeleteData)
  //   }

  //   setFormData((prev) => {
  //     const newData = { ...prev }
  //     const item = newData[type][index]

  //     newData[type] = newData[type].filter((_, i) => i !== index)
  //     return newData
  //   })
  // }, [])

  const handleDelete = useCallback(
    (type, index) => {
      setFormData((prev) => {
        const newData = { ...prev };
        const itemToDelete = newData[type][index]; // The item you want to delete and store

        // Store the deleted item in appropriate state
        if (type === "userDivisionData") {
          setDeletedDivisionData((prevDeleted) => [
            ...prevDeleted,
            itemToDelete,
          ]);
        }

        if (type === "userLocationData") {
          setDeletedLocationData((prevDeleted) => [
            ...prevDeleted,
            itemToDelete,
          ]);
        }

        // Remove the item from formData
        newData[type] = newData[type].filter((_, i) => i !== index);
        return newData;
      });
    },
    [formData]
  );  


    // handleSearch  
  
    const handleSearch = async () => {
      try {
        setTotalRecordCount(0);
        setCurrentRecordNo(0);
  
        const searchPayload = createSearchPayloadForBVSpecificSearch({ ...formData });
        const queryList = new URLSearchParams(searchPayload);
  
        if ([...queryList].length === 0) {
          toast.error("Please enter search criteria");
          return;
        }
  
        setSearchQuery(searchPayload);
  
        const data = await fetchAppData(
          `${APP_PROD_API.GET_USER_MASTER_DATA}?formStatus=${formStatus}&${queryList}`
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
  

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // On cancel form
  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({ ...initUserMasterData });
  }, []);

  const formCleanup = () => {
    handleCancel();
  };

  // on query setup query data in form
  const setupQueryData = (queryData, btnClicked) => { 
      if (btnClicked === "Query") {

        if (queryData.count === 0) {
          toast.error('No record found')
          handleCancel()
          return
        }
      }

    console.log("queryData", queryData);
    if (btnClicked === "Insert") {
      setFormData({
        ...initUserMasterData,
        userLoginData: queryData.userLoginData,
      });
    } else {
      //setFormData(queryData)
      setFormData({
        ...queryData,
        original_division_id:
          queryData.userDivisionData?.[0]?.division_id || null,
        original_location_id:
          queryData.userLocationData?.[0]?.location_id || null,
      });
    }
    setTotalRecordCount(queryData.count || totalRecordCount);
    console.log("currentRecordNo:", currentRecordNo);
  };

  // on Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // setFormLoading(true);
      // Submit validations
      const loginForm = document.getElementById("user-master-user-detail");
      const loginFormValidity = loginForm.checkValidity();
      if (!loginFormValidity) {
        if (loginForm.reportValidity) {
          loginForm.reportValidity();
        } else {
          throw new Error("Please fill all the required details in user login");
        }
        return;
      }

      // Form validations
      if (formData.login_name === "") {
        toast.error("Login Name cannot be empty");
        return;
      } else if (formData.user_name === "") {
        toast.error("User Name cannot be empty");
        return;
      } else if (formData.email_id === "") {
        toast.error("Email ID cannot be empty");
        return;
      }

      // End of form validations
      const userDivisionForm = document.getElementById("user-master-div-form");
      const userDivisionFormValidity = userDivisionForm.checkValidity();
      if (!userDivisionFormValidity) {
        if (userDivisionForm.reportValidity) {
          userDivisionForm.reportValidity();
        } else {
          throw new Error(
            "Please fill all the required details in user division"
          );
        }
        return;
      }

      // console.log("divData at the submission:", divisionData);

      // Check if formData.is_group === "U" before validating default_division
      if (formData.is_group === "U" || formData.type_user === "N") {
        console.log(
          "isgroup/type_user:",
          formData.is_group,
          formData.type_user
        );

        // Check if exactly one "Y" is present in default_division
        const defaultDivisionCount = formData?.userDivisionData.filter(
          (division) => division.default_division === "Y"
        ).length;

        // console.log("defaultdivisioncount:", defaultDivisionCount);

        if (defaultDivisionCount === 0) {
          toast.error("NO default division has been chosen for the user");
          return;
        }
      }

      if (!validateDefaultDiv(formData)) {
        return; // Stop submission if validation fails
      }

      if (!validateDefaultLoc(formData)) {
        return; // Stop submission if validation fails
      }

      const defaultLocationCount = formData?.userLocationData.filter(
        (location) => location.default_location === "Y"
      ).length;

      if (defaultLocationCount === 0) {
        toast.error("NO default location has been chosen for the user");
        return;
      }

      const userLocationForm = document.getElementById("user-master-loc-form");
      const userLocationFormValidity = userLocationForm.checkValidity();
      if (!userLocationFormValidity) {
        if (userLocationForm.reportValidity) {
          userLocationForm.reportValidity();
        } else {
          throw new Error(
            "Please fill all the required details in user location"
          );
        }
        return;
      }

      // console.log("locatData at the submission:", locationData);

      const { userDivisionData, userLocationData } = formData;
      const cloneFormData = { ...formData };
      delete cloneFormData.userDivisionData;
      delete cloneFormData.userLocationData;
      delete cloneFormData.userLoginData;

      let body = {
        formData: { ...cloneFormData },
        divisionData: [...userDivisionData],
        locationData: [...userLocationData],
      };

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        // Update body to include updateFormPayload for "Update"
        body = {
          ...body,
          // updateFormPayload: updateFormPayload,
          deletedDivisionData: deletedDivisionData,
          deletedLocationData: deletedLocationData,
        };
      }

      // Clear deleted items after successful submission
      setDeletedLocationData([]);
      setDeletedDivisionData([]);

      console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.SUBMIT_USER_MASTER_DATA
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      toast.success(
        `Data ${formData?.user_id ? "updated" : "saved"} successfully!`
      );
      formCleanup();
    } catch (error) {
      toast.error(
        error?.message ||
          "Please check all the form fields or contact administrator"
      );
    } finally {
      // setFormLoading(false);
    }
  };

  const suggestionRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestionList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <React.Fragment>
      <FormSetup
        navType="tabs"
        activeTab={activeTab}
        tabs={["User Master"]}
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
        QUERY_API={APP_PROD_API.GET_USER_MASTER_DATA}
        formName={"User Master"} 
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <UserMasterDtl
              formStatus={formStatus}
              formData={formData}
              handleChange={handleChange}
              departments={departments}
              authpersons={authpersons}
              showSuggestionList={showSuggestionList}
              setShowSuggestionList={setShowSuggestionList}
              empSuggestions={empSuggestions}
              setEmpSuggestions={(data) => setEmpSuggestions(data)}
              divisionSuggest={divisionSuggest}
              setDivisionSuggest={(data) => setDivisionSuggest(data)}
              locationSuggest={locationSuggest}
              setLocationSuggest={(data) => setLocationSuggest(data)}
              isLoadingSuggestions={isLoadingSuggestions}
              suggestionRef={suggestionRef}
              // fetchSuggestions={fetchSuggestions}
              handleAddTableRecord={handleAddTableRecord}
              handleDelete={handleDelete}
              activeRow={activeRow}
              setActiveRow={setActiveRow}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              //setFocusedRowIndex={(data)=>setFocusedRowIndex(data)}
              setFocusedRowIndex={setFocusedRowIndex}
              focusedRowIndex1={focusedRowIndex1}
              //setFocusedRowIndex1={(data)=>setFocusedRowIndex1(data)}
              setFocusedRowIndex1={setFocusedRowIndex1}
              getValidateData={getValidateData}
              validateDivisionData={validateDivisionData}
              validateLocationData={validateLocationData}
              validateDefaultDiv={validateDefaultDiv}
              validateDefaultLoc={validateDefaultLoc}
            />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_USER_MASTER_HELP_LIST_DATA
                    }`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                  />
                </ModalBody>
              </Modal>
            )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UserMasterNew;
