import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import UserActivityDtl from './user_activityDtl';
import { userLoginActivityInitData, programActivityDescInitData, programDescInitData, userActivityDescInitData } from './user_activityHelper';
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { APP_PROD_API } from '../../../../utils/api'
import { useSelector } from "react-redux";
import { formatOptions } from "../../../../lib";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { useRef } from "react";
import { fetchAppData } from "../../../../utils/fetchUtils";


const UserActivity = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [userLoginData, setUserLoginData] = useState([userLoginActivityInitData]);
  const [programDescData, setProgramDescData] = useState([programDescInitData]);
  const [programActivityDescData, setProgramActivityDescData] = useState([
    programActivityDescInitData

  ]);

  const [originalProgramActivityData, setOriginalProgramActivityData] = useState([]);

  const [userActivityDescData, setUserActivityDescData] = useState([
    userActivityDescInitData

  ]);

  const [userActivityMap, setUserActivityMap] = useState({});

  const [removedActivities, setRemovedActivities] = useState([])




  // filtered pogramactivity desc data 

  //const [filteredProgramActivityData, setFilteredProgramActivityData] = useState([programActivityDescInitData])

  // for dropdown  

  const [module, setModule] = useState([])
  const [subModule, setSubModule] = useState([])

  const [focusedRowIndex1, setFocusedRowIndex1] = useState(null);
  const [focusedRowIndex2, setFocusedRowIndex2] = useState(null);

  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState()
  const [selectedActivityId, setSelectedActivityId] = useState(null)





  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);


  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_USER_ACTIVITY_LIST_OF_CONSTANTS
          }?appUserId=${user.id}`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          // setModule([
          //   { value: "", label: "" },
          //   ...formatOptions(data.modules || [], "program_id", "submod_form_name"),
          // ]); 
          setModule([
            { value: "", label: "" },
            ...(data.modules || []).map((item) => ({
              value: item.program_id,           // still program_id
              label: item.submod_form_name,     // UI label
              module_name: item.module_name     // store this
            }))
          ]);

        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  // fetch submodule data 

  useEffect(() => {
    if (!formData?.module || formStatus === "") return;

    const fetchSubModuleData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_USER_ACTIVITY_LIST_OF_SUBMODULE}?program_id=${formData.module}`,
          { credentials: "include" }
        );

        const result = await response.json();

        // setSubModule([
        //   { value: "", label: "" },
        //   ...formatOptions(result.subModuleData || [], "program_id", "submod_form_name"),
        // ]);

        setSubModule([
          { value: "", label: "" },
          ...(result.subModuleData || []).map((item) => ({
            value: item.program_id,
            label: item.submod_form_name,
            submod_form_name: item.submod_form_name
          }))
        ]);

      } catch (err) {
        console.log(err);
      }
    };

    fetchSubModuleData();

  }, [formData?.module, formStatus]);



  const TYPES = {
    USER_LOGIN: 'user',
    PROGRAM_DESC: "programDesc",
    PROGRAM_ACTIVITY: "programAct",
    USER_ACTIVITY: "userAct",

  };


  const tabs = ["User Activity"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      console.log('userActivityData', userActivityDescData)
       console.log('removedActivities', removedActivities)

      let body = {
        formData: formData,
        selectedProgramId: selectedProgramId,
        userActivityData: userActivityDescData,
        removedActivities: removedActivities,


      };

      //  Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,

        };
      } 

      setRemovedActivities([])
     // setUserActivityDescData([])

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_USER_ACTIVITY_DATA
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      handleCancel();
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

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    //setFormData({});
    setUserLoginData([userLoginActivityInitData]);
    setProgramDescData([programDescInitData]);
    setProgramActivityDescData(originalProgramActivityData)
    setUserActivityDescData([userActivityDescInitData])
    // setUserActivityMap({}); 
    //  Reset form properly
    setFormData({
      user_id: null,
      user_name: "",
      // add other fields if needed
    });
    setSelectedProgramId(null);
    setSelectedActivityId(null)
    setFocusedRowIndex1(null);
    setFocusedRowIndex2(null);



  }, []);


  const handleChange = useCallback((type, name, value, rowIndex = null, e) => {

    // Allow only valid form states
    if (!["Insert", "Update", "Search", "Query"].includes(formStatus)) {
      return;
    }

    if (name === "module") {
      setSubModule([]);
    }

    const isNumberField = e?.target?.type === "number";
    const isStringField = typeof value === "string";
    const processedValue = isStringField ? value.toUpperCase() : value;

    const inputType = e?.target?.type;
    const supportsSelection =
      inputType === "text" || inputType === "search" || inputType === "textarea";

    const getUpdatedValue = () => {
      if (!isNumberField && e?.target && supportsSelection) {
        const { selectionStart, selectionEnd } = e.target;
        const newValue = processedValue;

        requestAnimationFrame(() => {
          e.target.setSelectionRange(selectionStart, selectionEnd);
        });

        return newValue;
      }
      return processedValue;
    };

    switch (type) {

      // case "formData":
      //   setFormData(prev => ({
      //     ...prev,
      //     [name]: getUpdatedValue()
      //   }));
      //   break;  

      case "formData":
        setFormData(prev => {
          let updatedData = {
            ...prev,
            [name]: getUpdatedValue()
          };

          //if module is changed, also set module_name
          if (name === "module") {
            const selectedOption = module.find(
              (opt) => opt.value == value
            );

            updatedData.module_name = selectedOption?.module_name || "";
            updatedData.submod_form_name = selectedOption?.submod_form_name || "";
          }

          if (name === "submodule") {
            console.log("Selected value:", value);
            console.log("SubModule options:", subModule);

            let selectedOption = null;

            // Try finding from state (normal case)
            if (subModule?.length) {
              selectedOption = subModule.find(
                (opt) => String(opt.value) === String(value)
              );
            }

            console.log("Matched Option:", selectedOption);

            // Fallback if state not ready
            updatedData.submod_form_name =
              selectedOption?.submod_form_name ||
              e?.target?.selectedOptions?.[0]?.label ||
              "";

            console.log("Final submodule set:", updatedData.submod_form_name);
          }
          return updatedData;
        });
        break;

      case "userLoginData":
        setUserLoginData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            const updated = [...prev];
            updated[rowIndex] = {
              ...updated[rowIndex],
              [name]: getUpdatedValue()
            };
            return updated;
          } else {
            return {
              ...prev,
              [name]: getUpdatedValue()
            };
          }
        });
        break;


      case "programDescData":
        if (rowIndex !== null && rowIndex >= 0) {
          setProgramDescData(prev => {
            const updated = [...prev];
            updated[rowIndex] = {
              ...updated[rowIndex],
              [name]: getUpdatedValue()
            };
            return updated;
          });
        }
        break;

      case "programActivityDescData":
        if (rowIndex !== null && rowIndex >= 0) {
          setProgramActivityDescData(prev => {
            const updated = [...prev];
            updated[rowIndex] = {
              ...updated[rowIndex],
              [name]: getUpdatedValue()
            };
            return updated;
          });
        }
        break;

      case "userActivityDescData":
        if (rowIndex !== null && rowIndex >= 0) {
          setUserActivityDescData(prev => {
            const updated = [...prev];
            updated[rowIndex] = {
              ...updated[rowIndex],
              [name]: getUpdatedValue()
            };
            return updated;
          });
        }
        break;

      default:
        console.warn("Unknown handleChange target:", type);
    }

  }, [formStatus]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      if (btnClicked === 'Query') {
        // handle failure case 
        if (queryData.recordCount === 0) {
          toast.error(queryData.message)
          handleCancel();
          return
        }

      }

      setUserLoginData(queryData.userData)
      setProgramDescData(queryData.moduleData)
      setProgramActivityDescData(queryData.programData)
      setOriginalProgramActivityData(queryData.programData)
      setUserActivityDescData(queryData.userActivityData)

      setTotalRecordCount(queryData.count || totalRecordCount);

    },
    [formStatus, currentRecordNo]
  );



  // ADD NEW ROW
  const handleAddRow = useCallback((tableType) => {
    switch (tableType) {
      case "userLoginTable":
        setUserLoginData((prevData) => [
          ...prevData,
          {
            ...userLoginActivityInitData,
            id: prevData.length + 1,
          }
        ]);
        break;
      case "programDescTable":
        setProgramDescData((prevData) => [
          ...prevData,
          {
            ...programDescInitData,
            id: prevData.length + 1,
          }
        ])
        break;

      case "programactivityDescTable":
        setProgramActivityDescData((prevData) => [
          ...prevData,
          {
            ...programActivityDescInitData,
            id: prevData.length + 1,
          }
        ])
        break;

      case "useractivityDescTable":
        setUserActivityDescData((prevData) => [
          ...prevData,
          {
            ...userActivityDescInitData,
            id: prevData.length + 1,
          }
        ])
        break;

      default:
        console.log("something went wrong")

    }

  }, []);

  // DELETE ROW
  const handleDeleteRow = useCallback((tableType, index) => {
    switch (tableType) {
      case "userLoginTable":
        setUserLoginData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });

        break;

      case "programDescTable":
        setProgramDescData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });

        break;

      case "programactivityDescTable":
        setProgramActivityDescData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });

        break;

      case "useractivityDescTable":
        setUserActivityDescData((prev) => {
          if (prev.length === 0) return prev;
          return prev.filter((_, i) => i !== index);
        });

        break;

    }

  }, []);



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
        isQueryReqOnInsertBtn={true}
        setupQueryData={setupQueryData}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_USER_ACTIVITY_FORM_DATA}
        formName={""}
        authority={{ insert: "N", update: "Y" }} 
        //programId = {27}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <UserActivityDtl
              formData={formData}
              //   fetchSubmoduleData={fetchSubModuleData}
              formStatus={formStatus}
              handleChange={handleChange}
              userLoginData={userLoginData}
              userActivityDescData={userActivityDescData}
              programDescData={programDescData}
              programActivityDescData={programActivityDescData}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              module={module}
              subModule={subModule}
              setFormData={setFormData}
              focusedRowIndex1={focusedRowIndex1}
              setFocusedRowIndex1={setFocusedRowIndex1}
              focusedRowIndex2={focusedRowIndex2}
              setFocusedRowIndex2={setFocusedRowIndex2}
              selectedProgramId={selectedProgramId}
              setSelectedProgramId={setSelectedProgramId}
              selectedActivityId={selectedActivityId}
              setSelectedActivityId={setSelectedActivityId}
              setUserActivityDescData={setUserActivityDescData}
              setProgramActivityDescData={setProgramActivityDescData}
              userActivityMap={userActivityMap}
              setUserActivityMap={setUserActivityMap}
              originalProgramActivityData={originalProgramActivityData}
              setRemovedActivities={setRemovedActivities}
              removedActivities={removedActivities}


            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UserActivity;

