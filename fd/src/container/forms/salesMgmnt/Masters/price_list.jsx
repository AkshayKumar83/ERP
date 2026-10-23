import React from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import PriceListTab from './price_list_tab';
import { createSearchPayloadForCusMstrSpecificSearch, priceListInitData, } from './price_list_helper';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { useSelector } from 'react-redux';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import { fetchAppData } from '../../../../utils/fetchUtils';


const PriceList = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...priceListInitData});
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,
    setSearchQuery} = useFormStatus();

  const [helpList , setHelpList] = useState(false);
  const [helpFor,setHelpFor] = useState('');
  const [helpListHeader,setHelpListHeader] = useState([])


  const toggleHelpModal = () =>setHelpList(!helpList)

    const {user} = useSelector((state) => state.auth);

  const tabs = ["Price list"];

   const onSelectHelpItem = (data) => {
    setFormData((prev) => {
      switch(helpFor) {
        case "cCode":
          return { ...prev, c_code: data.c_code, c_name:data.c_name};

          case "itCode": 
          return { ...prev, it_code:data.it_code, it_desc:data.it_desc};

          case "itDesc":
            return { ...prev, it_code:data.it_code, it_desc:data.it_desc};  

          case "showCusProd":
            return { ...prev, cus_it_code:data.cus_it_code, cus_it_desc:data.cus_it_desc, cus_it_prc:data.cus_it_prc,it_rate:data.it_rate};      
      }
    }) 
   }

  //  const openHelpList= (fieldName,helpListHeader,index= null)=>{
  //   if(["Insert","Update"].includes(formStatus)){
  //     setHelpFor(fieldName)
  //     setHelpListHeader(helpListHeader)
  //     setHelpList(true);
  //   }
  //  }

  const handleHelpList = (data) =>{
  setHelpList(data);
}

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (formStatus === "Insert" || formStatus === "Update") {
      const priceList = validateForm("price-list", "Price List");
      if (!priceList) {
        // toast.error('Please fill all required fields');
        return;
      }

      // const isValid = validateFormOnSave(formData);
      // if (!isValid) return;

    }

      const today = new Date();
      const effDate = new Date(formData.eff_date);

      if (effDate > today) {
        toast.error("Effective date cannot be a future date");
        return;
      }
    
     let method;
            if (formStatus == "Insert") {
                method = "POST";
            } else if (formStatus == "Update") {
                method = "PUT";
            }

      const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
              APP_PROD_API.POST_PRICE_LIST_DATA
          }?form_status=${formStatus}`,
          {
              method: method,
              body: JSON.stringify({formData, checkAndSave: true}),
              headers: { "Content-Type": "application/json" },
              credentials:'include',
          }
      );

    const data = await response.json();

       //  If duplicate found, stop
    if (data?.exists) {
     toast.error(data.message || "This Customer Product Code is already defined against Selected Customer and Product and Effective date");
      return;
    }
      if (data?.type === "updated" || data?.type === "inserted") {
      toast.success("Data saved successfully!");
      formCleanup(); // Reset form
     } else {
      toast.error(data.message || "Something went wrong");
     }


  } catch (error) {
    toast.error(error.message || "Please check all the form fields or contact administrator");
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


      const handleChange = useCallback((name, value, event) => {
      if (!["Insert", "Update"].includes(formStatus)) return;

      // Prevent typing in help-list fields during Insert or Update
      if (
        ["Insert", "Update"].includes(formStatus) &&
        ["c_code", "it_code", "it_desc"].includes(name)
      ) {
        toast.error(
          "You cannot type in this field. Please select from Help List on Double Click"
        );
        return;
      }

      const { selectionStart, selectionEnd } = event.target; // Capture cursor position

      // Negative value & two decimal validation for cus_it_prc and it_rate
      if (["cus_it_prc", "it_rate"].includes(name)) {
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
      const { selectionStart, selectionEnd } = event.target;
      setTimeout(() => {
        if (event.target.setSelectionRange) {
          event.target.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  }, [formStatus]);


    const setupQueryData = useCallback(
  (queryData, btnClicked) => {
  

    if (queryData?.type === "not_found") {
      toast.error(queryData?.message || "No data found on Query");
      setFormData({});
    }
     if (queryData?.priceList) {
    const formattedData = {
      ...queryData.priceList,
      eff_date:dateFormatter(queryData.priceList.eff_date)
    }
    setFormData(formattedData);
  }
    if (btnClicked === 'Query') {
      setTotalRecordCount(queryData?.totalCount || 0);
    }
  },
  [formStatus, currentRecordNo]
);

  const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForCusMstrSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_PRICE_LIST_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        QUERY_API={APP_PROD_API.GET_PRICE_LIST_DATA}
        searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
        formName={"Price List"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
              <Form id ='price-list'>
                <PriceListTab 
                formData={formData}
                setFormData={setFormData}
                formStatus= {formStatus}
                handleChange= {handleChange}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                //  openHelpList={openHelpList}
                setHelpListHeader={setHelpListHeader}
                />
                {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size='lg'>
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                      formStatus={formStatus}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PRICE_LIST_DATA}`}
                      helpListHeader={helpListHeader}
                      handleHelpList={handleHelpList}
                      onSelectHelpItem={onSelectHelpItem}
                      queryPera={{needAppGlobalData:'Y'}} 
                      whereClause={helpFor === 'showCusProd'?{f_c_code: formData.c_code, f_it_code: formData.it_code}:{}}
                      />
                    </ModalBody>
                  </Modal>
                )}
              </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PriceList;

