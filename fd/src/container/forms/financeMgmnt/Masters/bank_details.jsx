import React, { useState, useEffect } from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, } from "react";
import BankDetailsMaster from './bank_details_master';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import { validateForm } from '../../../../utils/fn';
import HelpList from '../../../../components/HelpList';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { accHelpListHeader, createSearchPayloadForBVSpecificSearch } from './bank_detail_helper'



const BankDetails = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ active_bank: 'Y' });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery } = useFormStatus();

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // for Dropdown Data 
  const [currency, setCurrency] = useState([])


  // for help list 

  const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
  const [helpListHeader, setHelpListHeader] = useState([])


  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)


  const tabs = ["Bank Details"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BANK_DETAILS_DROPDOWNDATA}`, { credentials: 'include', }
        )
        if (response.status === 200) {
          const data = await response.json()
          setCurrency([{ value: "", label: "" }, ...formatOptions(data.currency || [], "curr_code", "curr_desc")])

        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    fetchConstantList()
  }, [formStatus])

  const handleHelpList = (data) => {
    setHelpList(data);
  }


  const fetchValidateData = async (fieldName, fieldValue) => {
    if (!fieldValue) return { valid: false };

    let API_STRING = (`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BANK_DETAILS_VALIDATE_DATA}?${encodeURIComponent(fieldName)}=${encodeURIComponent(fieldValue)}`);

    try {
      const response = await fetch(API_STRING, { credentials: 'include' });

      if (response.status === 409) {
        toast.error("Account Code already exists in Bank Master.");
        // setFormData((prev) => {
        //   return {
        //     ...prev,
        //     acc_no: '',
        //     bank_name: ''
        //   }
        // })
        return { valid: false };
      }

      return { valid: true };
    } catch (err) {
      console.error("Error fetching validation data:", err.error);
      toast.error(err.error || "Something went wrong while validating the data.");
      return { valid: false };
    }
  };


  const onSelectHelpItem = (data) => {
    //console.log("Selected Data:", data);
    setFormData((prev) => {
      switch (helpFor) {
        case "acc":
          return { ...prev, acc_no: data.acc_no, bank_name: data.acc_desc };

        default:
          return prev;
      }
    });
  };

  function formCleanup() {

    releaseFormStatus()
    setFormData({});
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
        `${APP_PROD_API.GET_BANK_DETAILS_DATA}?formStatus=${formStatus}&${queryList}`
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



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Form Validation
      const isValidFormData = validateForm("bank-detail-form");
      if (!isValidFormData) {
        return;
      }

      if (formStatus === "Insert") {

        // Run async validation for duplicate check
        const { valid } = await fetchValidateData("acc_no", formData.acc_no);
        if (!valid) {

          return;
        }
      }


      // Step 2: Field-level Validation
      if (formData.cr_limit < 0) {
        toast.error("Credit Limit value cannot be less than zero.");
        return;
      }

      const debitRate = parseFloat(formData.int_rt_dbb);
      const creditRate = parseFloat(formData.int_rt_crb);

      if (debitRate > 100 || debitRate < 0) {
        toast.error("Debit Interest Rate must be between 0 and 100.");
        return;
      }

      if (creditRate > 100 || creditRate < 0) {
        toast.error("Credit Interest Rate must be between 0 and 100.");
        return;
      }

      // Step 3: Prepare Payload
      let body = {
        formData: formData,
        divisionId: user.global_division_id
      };

      if (formStatus === "Update") {
        body = {
          ...formData,
          divisionId: user.global_division_id
        };
      }

      //console.log("Final body to send:", body);

      // Step 4: Submit to API
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BANK_DETAILS_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          credentials: 'include',
        }
      );

      const result = await response.json();
      //console.log("API Response:", result);

      // Optional: Handle response success or errors
      if (response.ok) {
        toast.success("Data submitted successfully!");
      } else {
        toast.error(result.error || "Failed to submit form.");
      }
      formCleanup();

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.error || "An error occurred during submission.");
    }
  };


  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  // const handleChange = useCallback((name, value) => {
  //   setFormData(prev => ({ ...prev, [name]:
  //      value }));
  // }, []);  


  const whereClauseForHelp = (helpFor) => {
    //console.log("formData data", formData)
    // if (helpFor === 'acc') {
    //   return { inv_dt: formData.inv_dt };
    // }

    return {};
  }



  // const handleChange = useCallback((name, value, type) => { 
  //    if(!['Insert', 'Update'].includes(formStatus)) {
  //     //toast.error('insert')
  //     ////console.log('query mode')
  //       return
  //     }

  //   setFormData(prev => {
  //     if (name === "acc_no") {
  //       //console.log('acc no is required')
  //       toast.error("Please select from Helplist")

  //       return
  //     }
  //     let newValue = value;

  //     if (type === "number") {
  //       if (value === "" || /^[0-9]*$/.test(value)) {
  //         if (name === "cr_limit") {
  //           newValue = value.slice(0, 17);
  //         } else if (name === "int_rt_dbb") {
  //           newValue = value.slice(0, 7);
  //         } else if (name === "int_rt_crb") {
  //           newValue = value.slice(0, 7);
  //         }
  //       } else {
  //         return prev;
  //       }
  //     } else {
  //       newValue = value?.toUpperCase();
  //     }

  //     return {
  //       ...prev,
  //       [name]: newValue,
  //     };
  //   });
  // }, []);

  const handleChange = useCallback((name, value, type, event) => {
    if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
      return;
    }

    //console.log('event', event)
    const cursorPosition = event?.target?.selectionStart;

    const isNumericField = !isNaN(value) && value !== "";
    const parsedValue = isNumericField ? parseFloat(value) : value;
    const newVal = typeof parsedValue === "string" ? parsedValue.toUpperCase() : parsedValue;


    setFormData(prev => {
      if (name === "acc_no") {
        // //console.log('acc no is required');
        toast.error("Please select from Helplist");
        return

      }

      let newValue = value;

      if (type === "number") {
        if (value === "" || /^[0-9]*$/.test(value)) {
          if (name === "cr_limit") newValue = value.slice(0, 17);
          else if (name === "int_rt_dbb" || name === "int_rt_crb") newValue = value.slice(0, 7);
        } else {
          return prev;
        }
      } else {
        newValue = value?.toUpperCase();
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });

    // Restore cursor only for text-compatible fields
    const supportedTypes = ["text", "search", "tel", "url", "password", "textarea"];
    if (event && supportedTypes.includes(event.target?.type)) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, [formStatus])


  const setupQueryData = useCallback(

    (queryData, btnClicked) => {
      //console.log("queryData:", queryData)

      // Handle failure case
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        handleCancel()
        return;
      }


      if (btnClicked === "Query") {

        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.mhfmbankData)
    },
    [formStatus, currentRecordNo]
  );

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
        setupQueryData={setupQueryData}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_BANK_DETAILS_DATA}
        formName={""}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery, }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <BankDetailsMaster
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              currency={currency}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              fetchValidateData={fetchValidateData}
            />
          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BANK_DETAILS_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: 'Y' }}
                  whereClause={whereClauseForHelp(helpFor)}


                />
              </ModalBody>
            </Modal>
          )}

        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default BankDetails;

