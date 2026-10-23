import React from 'react'
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { createSearchPayloadForPRSpecificSearch, headerInitData } from './payment_reverse_helper';
import PaymentReverseHeader from './payment_reverse_header';
import { APP_PROD_API } from '../../../../utils/api';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import HelpList from '../../../../components/HelpList';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { fetchAppData } from '../../../../utils/fetchUtils';

const PaymentReverse = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...headerInitData});
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
    setSearchQuery } = useFormStatus();


  const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
  const [helpListHeader, setHelpListHeader] = useState([])


  const [isHelpModelOpen, setIsHelpModelOpen] = useState()
  const toggleHelpModal = () => setHelpList(!helpList)

  const { user } = useSelector((state) => state.auth);

  const tabs = ["Payment Reverse"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);



  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData({...headerInitData});
    releaseFormStatus()
  }

  

    const handleChange = useCallback((name, value, event) => {
  if(!["Insert","Search","Update"].includes(formStatus)) return;

      if(['old_voucher_no','acc_no','chq_no'].includes(name)){
         toast.error("Please Select from Help List on Double Click ")
        return;    
      }

  const target = event?.target;
  const cursorPos = target?.selectionStart ?? null;

  setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));

  if (cursorPos !== null && target?.setSelectionRange) {
    setTimeout(() => {
      try {
        target.setSelectionRange(cursorPos, cursorPos);
      } catch (err) {
        console.error("Cursor restore failed", err);
      }
    }, 0);
  }
}, [formStatus]);


 
  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (queryData?.pymntRvrs) {
        const formattedData = {
          ...queryData.pymntRvrs,
          reverse_date: dateFormatter(queryData.pymntRvrs.reverse_date),
          chq_dt: dateFormatter(queryData.pymntRvrs.chq_dt),
          // old_voucher_no: queryData?.pymntRvrs?.old_voucher_no || queryData?.old_voucher_no,
          // voucher_no: queryData?.pymntRvrs?.voucher_no || queryData?.voucher_no,
        };
        setFormData(formattedData);
      } else {
    toast.error(queryData?.message || "No data found");
    handleCancel()
    setFormData(null);
    }
  
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.totalCount || 0);
      }
    },
    [formStatus, currentRecordNo]
  );
  
  
  const handleHelpList = (data) => {
    if(["Insert", "Search"].includes(formStatus)){
      setHelpList(data);
    }
  }

  const onSelectHelpItem = (data) => {
  
  
    setFormData((prev) => {
      switch (helpFor) {
        case "AccNo":
          return { ...prev, acc_no: data.acc_no, acc_desc: data.acc_desc };
        case "ChqNo":
          return { ...prev, chq_no: data.chq_no, chq_dt:dateFormatter(data.chq_dt) };
        case "OldVchrNo":
          return { ...prev, old_voucher_no: data.voucher_no, chq_amt: data.amount, old_voucher_id:data.voucher_id };
        default:
          return prev;
      }
    });
  };

  const whereClauseForHelp = (helpFor) => {
    if(helpFor === 'ChqNo'){
  
      return { h_acc_no: formData.acc_no, h_pay_rec: formData?.pay_rec };
    }
    else if(helpFor === 'OldVchrNo'){
      const { chq_no, chq_dt, acc_no } = formData;
      return { h_chq_no: chq_no, h_chq_dt: chq_dt, h_acc_no: acc_no, h_pay_rec: formData?.pay_rec };
    }
    return {};
  }
   
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
       const pymntReverseForm = validateForm("payment-reverse-form", "Payment Reverse")
            if (!pymntReverseForm) {
              return;
            }

            const { chq_dt, reverse_date } = formData; 

            const chequeDate = new Date(chq_dt);
            const reverseDate = new Date(reverse_date);
            if (reverseDate < chequeDate) {
              toast.error("Reverse Date must be greater than Cheque Date");
              return;
            }

      // Clean the formData
      const { ...cleanedFormData } = formData;

      let body = {
        formData:{ ...cleanedFormData, trans_year: user.global_fin_year,division_id:user.global_division_id},  // send form data
      };
  
   
      
  
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PYMNT_RVRS_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials:'include'
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Can't fetching error while submiting data.");
      }
    
      const data = await response.json();

      toast.success(`Data saved successfully! with new Generated Voucher no. ${data?.new_voucher_no}`)
      formCleanup(); // reset the form after success
  
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error.message || "Please check all the form fields or contact administrator"
      );
    }
  

  };
  
    const handleSearch = async () => {
      try {
        setTotalRecordCount(0);
        setCurrentRecordNo(0);
        const searchPayload = createSearchPayloadForPRSpecificSearch(formData);
        const queryList = new URLSearchParams(searchPayload);
  
        if ([...queryList].length === 0) {
          toast.error("Please enter search criteria");
          return;
        }
  
        setSearchQuery(searchPayload);
  
        const data = await fetchAppData(
          `${APP_PROD_API.GET_PYMNT_RVRS_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        QUERY_API={APP_PROD_API.GET_PYMNT_RVRS_FORM_DATA}
        formName={"Payment Reversal"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        // authority={{insert:"Y",update: "N"}}
        btnEnableDtl={{ update:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>

              <PaymentReverseHeader 
              formData={formData}
              setFormData = {setFormData}
              handleChange={handleChange}
              formStatus={formStatus}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PYMNT_RVRS_FORM_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{needAppGlobalData:'Y'}}
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

export default PaymentReverse;

