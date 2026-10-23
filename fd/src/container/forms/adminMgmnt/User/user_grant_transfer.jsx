import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import UserGrantTransferUser from './user_grant_transfer_user';
import UserGrantTransferSource from './user_grant_transfer_scr_user_rgt';
import UserGrantTransferTarget from './user_grant_transfer_trgt_user_rgt';
import { ModuleInfoSRC, ModuleInfoTRG, UserActivitySRC, UserActivityTRG, UserMasterSRC, UserMasterTRG } from './user_grant_transfer_helper';


const UserGrantTransfer= () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [userSourceData, setUserSourceData] = useState([{...UserMasterSRC}]);
  const [userTargetData, setUserTargetData] = useState([{...UserMasterTRG}]);
  const [sourcePrgData, setSourcePrgData] = useState([{...ModuleInfoSRC}]);
  const [sourcePrgsData, setSourcePrgsData] = useState([{...UserActivitySRC}]);
  const [targetPrgData, setTargetPrgData] = useState([{...ModuleInfoTRG}]);
  const [targetPrgsData, setTargetPrgsData] = useState([{...UserActivityTRG}]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);


  const tabs = ["User","Source User Rights","Target User Rights"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  function handleSubmit(e) {
    e.preventDefault();

    console.log("Form submitted", formData)
  }

  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
  }, []);

 const handleChange = useCallback(() => { 
       
         
      }, []);   
      
            const handleAddRow = useCallback(() => {
             
            
            }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {

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
        QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
       <UserGrantTransferUser 
       userSourceData ={userSourceData}
       userTargetData={userTargetData}
       formStatus = {formStatus}
        handleChange = {handleChange}
        handleAddRow = {handleAddRow}
        focusedRowIndex={focusedRowIndex}
        setFocusedRowIndex={setFocusedRowIndex}
       />
          </TabPane>
          <TabPane tabId={2}>
       <UserGrantTransferSource
        sourcePrgData ={sourcePrgData}
        sourcePrgsData= {sourcePrgsData}
       formStatus = {formStatus}
        handleChange = {handleChange}
        handleAddRow = {handleAddRow}
        focusedRowIndex={focusedRowIndex}
        setFocusedRowIndex={setFocusedRowIndex}
       />
          </TabPane>
          <TabPane tabId={3}>
       <UserGrantTransferTarget
        targetPrgData={targetPrgData}
        targetPrgsData={targetPrgsData}
       formStatus = {formStatus}
        handleChange = {handleChange}
        handleAddRow = {handleAddRow}
        focusedRowIndex={focusedRowIndex}
        setFocusedRowIndex={setFocusedRowIndex}
       />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UserGrantTransfer;

