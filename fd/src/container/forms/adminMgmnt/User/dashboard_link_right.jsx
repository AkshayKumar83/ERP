import React from 'react'
import { Modal, ModalBody, ModalHeader, TabContent, TabPane  } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import DashboardLinkRightDtl from './dashboard_link_right_dtl';
import { createSearchPayloadForLRSpecificSearch, dashboardLinkRightDetailData, dashboardLinkRightInitData } from './dashboard_link_right_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { useSelector } from 'react-redux';
import HelpList from '../../../../components/HelpList';
import toast from 'react-hot-toast';
import { fetchAppData } from '../../../../utils/fetchUtils';


const DashboardLinkRights = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...dashboardLinkRightInitData});
  const [detailFormData, setDetailFormData] = useState([]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,setSearchQuery } = useFormStatus();
   const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState('');
    const [helpListHeader, setHelpListHeader] = useState([]);

    const [isHelpModelOpen, setIsHelpModelOpen] = useState()
    const toggleHelpModal = () => setHelpList(!helpList);

     const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const { user } = useSelector((state) => state.auth);

  const tabs = ["Dashboard Link Rights"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    case "UserName":
      setFormData(prev => ({
        ...prev,
        user_name: data.user_name,
        login_name: data.login_name,
        user_id: data?.user_id,
      }));
      break;

      case "DBModule":
        setFormData(prev => ({
          ...prev,
          db_module_desc: data.full_name,
          db_module:data.sht_name
        }))
      
    }
  }
 

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({});
    setDetailFormData([])
    setFocusedRowIndex(0)
  }, []);



    const handleChange = useCallback((name, value, index = null, event = null) => {
  if (!["Update"].includes(formStatus)) return;

  const cursorPosition = event?.target?.selectionStart || 0;
  let newVal = value.toUpperCase();

  if (index === null) {
    // Update main form data
    setFormData(prev => ({ ...prev, [name]: newVal }));

    // Restore cursor for inputs
    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }

  } else {
    // Update detail form data (table)
    setDetailFormData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: newVal };
      return newData;
    });

    if (
      event?.target &&
      event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)
    ) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }
}, [formStatus]);



  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.totalCount || totalRecordCount);

        if (!queryData?.userMstrData) {
          toast.error(queryData.message || "No User data found");
           handleCancel()
          return;
        }
      }

      setFormData(queryData.userMstrData);
      setDetailFormData(queryData.userLinkData || []);
      setFocusedRowIndex(0)
    },
    [formStatus, currentRecordNo]
  );

   const  handleSubmit = async(e)=>{
    e.preventDefault();
     if (!["Update"].includes(formStatus)) return;

     try {

      let body = {
        formData,
        detailFormData:detailFormData.map(row => ({
          ...row,
          user_id: formData?.user_id,
          db_module:formData?.db_module,
        }))
      };

        let method ;
       if(formStatus == 'Insert'){
        method ="POST";
       }   else if(formStatus == "Update"){
        method = "PUT";
       }

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DB_LINK_RIGHTS_FORM_DATA}?form_status=${formStatus}`,{
        method:method,
        body:JSON.stringify(body),
        headers:{"Content-Type":"application/json"},
        credentials:"include",
      })
       if(!response.ok){
       const error = await response.json().catch(() => ({}));
       throw new Error(error.message || "Something went wrong");
       }

       toast.success("Data Save Successfully");
       handleCancel();
      
     } catch (error) {
      console.error('Submit error:',error);
      toast.error(error.message || "Please check all the form fields or contact administrator")
     }

  }
 
const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForLRSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_DB_LINK_RIGHTS_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        QUERY_API={APP_PROD_API.GET_DB_LINK_RIGHTS_FORM_DATA}
        formName={""}
        // authority={{insert:"N",update: "Y"}}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        btnEnableDtl={{ insert:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
              <DashboardLinkRightDtl 
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              // triggerAddRow={triggerAddRow}
              detailFormData={detailFormData}
              // handleDelete={handleDelete}
               focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
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
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DB_LINK_RIGHTS_FORM_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                  queryPera={{
                  needAppGlobalData: "Y"}}
                  whereClause={helpFor === 'DBModule'?{f_user_id:formData.user_id}:{}}
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

export default DashboardLinkRights;

