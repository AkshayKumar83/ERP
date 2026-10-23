import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import UserSectionDtl from './user_sectionDtl';
import { userSectionInitFormDataTemplate } from './user_section_helpers';
import { APP_PROD_API } from '../../../../utils/api';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const UserWiseSections = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [userSectionData, setUserSectionData] = useState([{ ...userSectionInitFormDataTemplate }])

  const [updatedUserSectionData, setUpdatedUserSectionData] = useState([])

  const [deletedUserSectionData, setDeletedUserSectionData] = useState([]);

  const [hasValidationError, setHasValidationError] = useState(false);

    // GLOBAL USERDATA
       const { user } = useSelector((state) => state.auth);

  // for help list data   

  const [activeRowIndex, setActiveRowIndex] = useState(null);

  const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
  const [helpListHeader, setHelpListHeader] = useState([])


  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  const tabs = ["User Wise Section"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const fetchValidateData = async (fieldName, fieldValue, rowIndex, otherQueryPera = {}) => {
    if (!fieldValue) return null;

    let API_STRING = "";

    try {
      if (Object.keys(otherQueryPera).length === 0) {
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_USER_SECTION_VALIDATE_DATA}?${encodeURIComponent(fieldName)}=${encodeURIComponent(fieldValue)}&get_validate=true&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user.id}`, { credentials: 'include', };
      } else {
        const otherParams = new URLSearchParams(otherQueryPera).toString();
        API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_USER_SECTION_VALIDATE_DATA}?${encodeURIComponent(fieldName)}=${encodeURIComponent(fieldValue)}&${otherParams}&get_validate=true&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&appUserId=${user.id}`, { credentials: 'include', };
      }

      const response = await fetch(API_STRING, { credentials: 'include' });
      const data = await response.json();

      if (response.status === 409 && data?.error) {
        toast.error(data.error);
        handleChange(fieldName, "", rowIndex);
        return null;
      } else {
        setUserSectionData((prevData) =>
          prevData.map((item, index) =>
            index === rowIndex
              ? {
                ...item,
                ...(fieldName === "user_name" && { user_id: data.user_id }),
                ...(fieldName === "auth_name" && { auth_id: data.auth_id }),
                ...(fieldName === "section_name" && { section_id: data.section_id }),
              }
              : item
          )
        );
        return data; // ✅ Return the data object
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
      return null;
    }
  };


  function formCleanup() {
    setUserSectionData([userSectionInitFormDataTemplate])
    releaseFormStatus()
    setFormData({});
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // form validation for user section 
      const userSectionForm = document.getElementById("user-section-form");
      if (!userSectionForm.checkValidity()) {
        userSectionForm.reportValidity();
        return;
      }

      // Form validations: Skip the first element (index 0)
      for (let i = 1; i < userSectionData.length; i++) {
        const { user_name, auth_name } = userSectionData[i];

        if (
          user_name?.trim().toLowerCase() === auth_name?.trim().toLowerCase()
        ) {
          toast.error(`User and Authorised person cannot be the same.`);
          return;
        }
      }


      // Check for duplicates in user_name and section_name
      const seen = new Set();
      for (let i = 1; i < userSectionData.length; i++) {
        const { user_name, section_name } = userSectionData[i];

        const key = `${user_name?.trim().toLowerCase()}|${section_name?.trim().toLowerCase()}`;

        if (seen.has(key)) {
          toast.error(`This User is already assigned to the same section.`);
          return;
        }

        seen.add(key);
      }


      let body = {
        userSectionData: userSectionData
      }

      if (formStatus === "Update") {
        body = {

          deletedUserSectionData: deletedUserSectionData,
          userSectionData: userSectionData
        }
      }  

       setDeletedUserSectionData([])

      console.log("Final body to send:", body);


      //console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_USER_SECTION_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      formCleanup()
    }

    catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }

    console.log("Form submitted", formData)
  }

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
    setUserSectionData([userSectionInitFormDataTemplate])
  }, []);

  const handleChange = (name, value, rowIndex) => {
    if (["user_name", "section_name", "auth_name"].includes(name)) {
      toast.error("Please select from Helplist");
      return
    }

    setUserSectionData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [name]: typeof value === "string" ? value.toUpperCase() : value
      };
      return newData;
    });
  };

  // const handleChange = (name, value, rowIndex) => {
  //   console.log("Form status:", formStatus)
  //   setUserSectionData((prevData) => {
  //     const newData = [...prevData];
  //     const updatedValue = typeof value === "string" ? value.toUpperCase() : value;

  //     newData[rowIndex] = {
  //       ...newData[rowIndex],
  //       [name]: updatedValue
  //     };

  //     if (formStatus === "Update") {
  //       const changedRow = newData[rowIndex];

  //       setUpdatedUserSectionData((prevUpdatedData) => {
  //         const existingIndex = prevUpdatedData.findIndex(
  //           (item) => item.id === changedRow.id
  //         );

  //         if (existingIndex !== -1) {
  //           const updatedRecords = [...prevUpdatedData];
  //           updatedRecords[existingIndex] = {
  //             ...updatedRecords[existingIndex],
  //             [name]: updatedValue
  //           };
  //           console.log("Updated existing record in updatedUserSectionData", updatedRecords);
  //           return updatedRecords;
  //         } else {
  //           const updated = [...prevUpdatedData, changedRow];
  //           console.log("Added new record to updatedUserSectionData", updated);
  //           return updated;
  //         }
  //       });
  //     }

  //     return newData;
  //   });
  // };



  const handleAddRecordInTable = useCallback(() => {

    // form validation for user section 
    const userSectionForm = document.getElementById("user-section-form");
    if (!userSectionForm.checkValidity()) {
      userSectionForm.reportValidity();
      return;
    }

    setUserSectionData((prevData) => [
      ...prevData,
      {
        ...userSectionInitFormDataTemplate,
        id: prevData.length + 1,
      },
    ]);
  }, [setUserSectionData]);

  //DELETE ROW
  const handleDeleteRow = useCallback((data, index) => {
    console.log("delete row")
    let newDeleteData = [...deletedUserSectionData]

    newDeleteData.push(data)
    setDeletedUserSectionData(newDeleteData)

    setUserSectionData((prev) => {
      if (prev.length === 0) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, [userSectionData]);


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      console.log("queryData", queryData);

      // if (btnClicked === "Query") {
        const updatedData = queryData.userSectionData.map(item => ({
          ...item,
          init_user_id: item.user_id,
          init_sec_id: item.section_id,
        }));

        setUserSectionData(updatedData);
      // }

      setTotalRecordCount(queryData?.count || totalRecordCount);
    },
    [formStatus, currentRecordNo]
  );

  const handleHelpList = (data) => {
    setHelpList(data);
  }

  const onSelectHelpItem = (data) => {
    setUserSectionData((prev) => {
      const updated = [...prev];
      if (activeRowIndex === null) return prev;

      switch (helpFor) {
        case "auth":
          updated[activeRowIndex] = {
            ...updated[activeRowIndex],
            auth_id: data.user_id,
            auth_name: data.user_name,
          };
          break;

        case "user":
          updated[activeRowIndex] = {
            ...updated[activeRowIndex],
            user_id: data.user_id,
            user_name: data.user_name,
          };
          break;

        case "section":
          updated[activeRowIndex] = {
            ...updated[activeRowIndex],
            section_id: data.section_id,
            section_name: data.section_desc,
          };
          break;

        default:
          return prev;
      }

      return updated;
    });

    setHelpList(false); // optional: close help modal
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData)
    // if (helpFor === 'account') {
    //   return { inv_dt: formData.inv_dt };
    // }

    return {};
  }



  console.log('formStatus from memberform', formStatus)
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
        QUERY_API={APP_PROD_API.GET_USER_SECTION_DATA}
        formName={""}
        isQueryReqOnInsertBtn={true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <UserSectionDtl
              formData={formData}
              userSectionData={userSectionData}
              formStatus={formStatus}
              handleChange={handleChange}
              handleAddRow={handleAddRecordInTable}
              handleDelete={handleDeleteRow}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              activeRowIndex={activeRowIndex}
              setActiveRowIndex={setActiveRowIndex}
              fetchValidateData={fetchValidateData}


            />

            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_USER_SECTION_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: 'Y' }}
                    whereClause={whereClauseForHelp(helpFor)}

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

export default UserWiseSections;

