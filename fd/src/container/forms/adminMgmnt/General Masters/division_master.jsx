import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import { Row, Col, Form } from "reactstrap";
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import Select from '../../../../components/basic/select';
import MainDetail from './division_master_mainDetail';
import TdsDetail from './division_master_TDS_Detail';
import ExciseDetail from './division_master_ExciseDetail';
import ServiceTaxDetail from './division_mater_ServiceDetail';
import PoTerms from './division_master_Poterms';
import Execution from './division_master_execution';
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from '../../../../lib';
import toast from "react-hot-toast";
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { cityHelpListHeader, stateHelpListHeader, customerHelpListHeader, bankHelpListHeader } from './division_masterHelper';
//import { Row, Col, Form } from 'reactstrap'
//import toast from 'react-hot-toast'; 
import { validateForm } from '../../../../utils/fn';
import { useSelector } from 'react-redux';
import { fetchAppData } from '../../../../utils/fetchUtils'; 
import {createSearchPayloadForBVSpecificSearch } from './division_masterHelper'

const DivisionMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({
    project_based: "N",
    registered_flag: "N",
    default_co: "N",
  });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();
  const [regions, setRegion] = useState([]);
  const [states, setState] = useState([]);

  const [helpList, setHelpList] = useState(false)
  const [helpFor, setHelpFor] = useState('')
  const [helpListHeader, setHelpListHeader] = useState([])



  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)  

   // GLOBAL USERDATA
    const { user } = useSelector((state) => state.auth);


  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DIVISION_MASTER_DROPDOWNDATA}`, { credentials: 'include' }
        )
        if (response.status === 200) {
          const data = await response.json()
          setRegion([{ value: "", label: "" }, ...formatOptions(data.regions || [], "code", "description")])
          setState([{ value: "", label: "" }, ...formatOptions(data.states || [], "code", "description")])
        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
  }, [formStatus])



  const tabs = ["Main Detail", "TDS Detail", "Excise Detail", "Service Tax Detail", "PO Terms", "Execution"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const isValidFormData = validateForm("division-master-main-form");
      if (!isValidFormData) {
        return;
      }


      if (!formData.emp_prefix?.trim()) {
        toast.error("Employee code prefix cannot be empty");
        return;
      }

      // Check if formData.legal_name is empty or consists of whitespace
      if (formData.legal_name?.trim() === "") {
        // If legal_name is empty, set it to formData.name
        setFormData((prevData) => ({
          ...prevData,
          legal_name: formData.name,
        }));
        console.log("legal name updated to:", formData.name);
      }

      // Create the body object
      let body = {
        // formData: formData,
        formData: {
          ...formData,
          legal_name: formData.legal_name || formData.name,
        },
      };

      console.log("Final body to send:", body);

      // Modify the body for "Update" status
      if (formStatus === "Update") {
        body = formData;
      }

      // Send the API request
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_DIVISION_MASTER_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include'

        }
      );

      // Check the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success(
        `Data ${formData?.division_id ? "updated" : "saved"} successfully!`
      );
      formCleanup()

    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  // for validation
  const fetchValidateData = async (fieldName, fieldValue) => {
    let API_STRING;
    try {
      API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DIVISION_MASTER_VALIDATE_DATA}?${fieldName}=${fieldValue}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}`
      
        , { credentials: 'include' };
      console.log("API URL:", API_STRING);

      const response = await fetch(API_STRING, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();

        if (fieldName === "c_code") {

          //toast.success("Customer code validated successfully.");
        } else if (fieldName === "bank_code") {

        }

        if (data.error) {
          toast.error(data.error);
        } else {
          // toast.success("Validation successful");
        }
      } else {
        const errorData = await response.json();

        if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Validation failed due to an unknown error.");
        }
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  // form cleanup on cance and on submit
  const formCleanup = async () => {
    setFormData({});
    setFormStatus("");
  };


  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  const handleChange = useCallback((name, value, e = null) => { 


    if (!['Insert','Update', 'Search'].includes(formStatus)) {
      return
    }
    if (["city_name", "state_name", "c_code", "bank_code"].includes(name)) {
      toast.error("Please select from Helplist");
      return
    }  
     
     const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value?.toUpperCase() : value;

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

       // Handle failure case
      if (queryData.count == 0) {
        toast.error('No record found');
        handleCancel()
        return;
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }
      setFormData(queryData);  

    },
    [formStatus, currentRecordNo]
  );

  const handleHelpList = (data) => {
    setHelpList(data);
  }

  const onSelectHelpItem = (data) => {
    console.log(data);
    setFormData((prev) => {
      switch (helpFor) {
        case "state":
          return { ...prev, state_id: data.state_id, state_name: data.state_name, gst_state_code: data.gst_state_code };
        case "city":
          return { ...prev, city_id: data.city_id, city_name: data.city_name };
        case "customer":
          return { ...prev, c_code: data.c_code, c_name: data.c_name };
        case "bank":
          return { ...prev, bank_code: data.bank_code, bank_name: data.bank_name };
        default:
          return prev;
      }
    });
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData)
    // if (helpFor === 'acc') {
    //   return { inv_dt: formData.inv_dt };
    // }

    return {};
  }  

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
          `${APP_PROD_API.GET_DIVISION_MASTER_DATA}?formStatus=${formStatus}&${queryList}`
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
        QUERY_API={APP_PROD_API.GET_DIVISION_MASTER_DATA}
        formName={""} 
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}
      >

        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <MainDetail
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              regions={regions}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              fetchValidateData={fetchValidateData}
              setHelpListHeader={setHelpListHeader}
            />
          </TabPane>

          <TabPane tabId={2}>
            <TdsDetail
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              states={states}
            />

          </TabPane>

          <TabPane tabId={3}>
            <ExciseDetail
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
            />
          </TabPane>


          <TabPane tabId={4}>
            <ServiceTaxDetail
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
            />

          </TabPane>

          <TabPane tabId={5}>
            <PoTerms
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
            />

          </TabPane>

          <TabPane tabId={6}>
            <Execution
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
            />

            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_HELP_LIST_DATA}`}
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

export default DivisionMaster;

