import React from 'react'
import { Form, Modal,ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import TaxParameterMasterDetails from './tax_parameter_master_details';
import { createSearchPayloadForTPSpecificSearch, taxParameterMasterData } from './tax_parameter_master_helper';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { validateForm } from '../../../../utils/fn';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { useSelector } from 'react-redux';


const TaxParameterMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...taxParameterMasterData});
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,
    setSearchQuery } = useFormStatus();

    const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
    const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
    const [helpListHeader, setHelpListHeader] = useState([])

   const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList)
      
          const { user } = useSelector((state) => state.auth);
    const tabs = ["Tax Parameters Master"];

    const onSelectHelpItem = (data) => {
       
      
        setFormData((prev) => {
          switch (helpFor) {
            case "AccNo":
              return { ...prev, acc_no: data.acc_no, acc_desc: data.acc_desc };
            case "SaleAccNo":
              return { ...prev, sale_acc_head: data.acc_no, sale_acc_head_desc: data.acc_desc };
            case "TaxCode":
              return { ...prev, tax_code: data.tax_code, tax_desc: data.tax_desc };
            default:
              return prev;
          }
        });
      };

      const handleHelpList = (data) => {
        setHelpList(data);
      }

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
   if(formStatus === "Insert"){
 const taxParameter = validateForm("tax-parameter","Tax Parameter")
 if(!taxParameter){
  toast.error("Please fill all required Field")
  return;
 }
   }
  
      const {...cleanedFormData } = formData;

      const {sal_or_pur, st_form, st_type, sale_acc_head} = formData

      if(sal_or_pur === 'S'){
        if(!sale_acc_head){
          toast.error(`Sales Account Head Must Be Entered'`)
          return
        }
      }

      if(['S','P'].includes(sal_or_pur) && ['L','C'].includes(st_type) && formStatus === 'Update'){
        if(!st_form){
          toast.error(`Form Name Must Be Entered`)
          return
        }
      }

      let body = {
        formData: cleanedFormData,
      };
  
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_TAX_PARA_MSTR_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials:'include',
        }
      );
  
     if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      toast.error(errorData.message || "Can't fetch error while submitting");
      return; 
      }
      toast.success("Data saved successfully!");
      formCleanup();
    } catch (error) {
      toast.error(
        error.message ||
           "Can't fetch error while submitting"
      );
    }
  };

  
  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData({});
    releaseFormStatus()

  }

  const handleChange = useCallback((name, value,event) => {
   
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
             return;
         }

    if(['acc_no','sale_acc_head'].includes(name)){
      if(formStatus !== "Search"){
  toast.error("Please Select from Help List on Double Click ")
      return;
      }
    
    }
    // Negative value & two decimal validation for cus_it_prc and it_rate
       if (["tax_perc", "surch_per"].includes(name)) {
        // Allow empty input
        if (value === "") {
          setFormData((prev) => ({ ...prev, [name]: "" }));
          return;
        }

        // Prevent negative and allow up to 2 decimals
        if (/^\d+(\.\d{0,2})?$/.test(value)) {
          setFormData((prev) => ({ ...prev, [name]: value }));
        } 
      } else {
      // For all other fields, normal update
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      // Only text inputs need cursor restore

     if (event?.target) {
      const { selectionStart, selectionEnd } = event.target;
      setTimeout(() => {
        event.target.setSelectionRange(selectionStart, selectionEnd);
      }, 0);
        }}
      }, [formStatus]);

  
 const setupQueryData = useCallback(
  (queryData, btnClicked) => {
 
    

    if (queryData?.type === "not_found") {
      toast.error(queryData?.message || "No Record Found");
      setFormData(null);
       handleCancel()
      setTotalRecordCount(0);
      return;
    }

    setFormData(queryData?.taxParaMaster);

    if (btnClicked === "Query") {
      setTotalRecordCount(queryData?.totalCount);
    }
  },
  [formStatus, currentRecordNo]
);

  
   const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForTPSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_TAX_PARA_MSTR_DATA}?formStatus=${formStatus}&appDivisionId=${
            user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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
        QUERY_API={APP_PROD_API.GET_TAX_PARA_MSTR_DATA}
        formName={"Tax Parameter Master"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
              {/* <Form id> */}
                <TaxParameterMasterDetails 
                formData={formData}
                handleChange={handleChange}
                formStatus={formStatus}
                handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader} 
                />
              {/* </Form> */}
              {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_TAX_PARA_MSTR_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{needAppGlobalData:'Y'}}

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

export default TaxParameterMaster;

