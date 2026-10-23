import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import EmailAlertMasterDtl from './email_alert_masterDtl';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import { validateForm } from '../../../../utils/fn';
import toast from 'react-hot-toast';
import { fetchAppData } from '../../../../utils/fetchUtils';


const EmailAlertMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();

  //DropDown Data 

  const [divisions, setDivisions] = useState([])
  const [emailTypes, setEmailTypes] = useState([])


  const tabs = ["Email Alert Master"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // form cleanup on cance and on submit
  const formCleanup = async () => {
    setFormData("");
    setFormStatus("");
  };



  // fetch drop down data 

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(

          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMAIL_MASTER_DROPDOWNDATA}`,{credentials:'include'}

        )
        if (response.status === 200) {
          const data = await response.json()
          setDivisions([{ value: "", label: "" }, ...formatOptions(data.division || [], "division_id", "name")])
          setEmailTypes([{ value: "", label: "" }, ...formatOptions(data.emailType || [], "email_type", "email_desc")])
        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
  }, [formStatus])

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const emailAlertMasterForm = validateForm("email-alert-master-form", "Email Alert Master")
      if (!emailAlertMasterForm) {

        return;
      }

      let body = {
        formData: {
          ...formData
        }
      }
      console.log("Final body to send:", body)

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        body = formData;
      }

      // Send the API request
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_EMAIL_MASTER_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials:'include'

        }
      );

      // Check the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success(
        `Data saved successfully!`
      );
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
    formCleanup();

  }, []);    


   const createSearchPayloadForBVSpecificSearch = (masterData) => {
    let payload = {};
  
    //console.log('masterdata', masterData);
  
    let masterKeys = { 
  
      email_type: "email_type", 
      email_from: "email_from"
      
     
    };
  
    let hasMasterKeys = Object.keys(masterKeys).some((key) => key in masterData);
    //console.log('hasMasterKeys', hasMasterKeys);
  
    if (hasMasterKeys) {
      Object.keys(masterKeys).forEach((key) => {
        let value = masterData[key];
  
        // Exclude undefined and empty values ("")
        if (value !== undefined && value !== "") {
            payload[masterKeys[key]] = value;
        }
      });
    }
  
    return payload;
  };

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
          `${APP_PROD_API.GET_EMAIL_MASTER_DATA}?formStatus=${formStatus}&${queryList}`
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
  

  const handleChange = useCallback((name, value, e= null) => { 
    if(!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return
    }  

     const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value.toUpperCase() : value;

      const getUpdatedValue = () => {
        if (!isNumberField && e?.target) {
          const { selectionStart, selectionEnd } = e.target;
          const newValue = processedValue;

          requestAnimationFrame(() => {
            e.target?.setSelectionRange(selectionStart, selectionEnd);
          });

          return newValue;
        }
        return processedValue;
      };
    setFormData(prev => ({
      ...prev,
      [name]: getUpdatedValue()
    }));
  }, [formStatus]);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      } 

       // Handle failure case
            if (queryData.recordCount === 0) {
              toast.error('No record found.');
              handleCancel()
              return;
            }

      setFormData(queryData);

    },
    [formStatus, currentRecordNo]
  );

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
        QUERY_API={APP_PROD_API.GET_EMAIL_MASTER_DATA}
        formName={"Email Alert Master"} 
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <EmailAlertMasterDtl
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              divisions={divisions}
              emailTypes={emailTypes}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default EmailAlertMaster;

