import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import BankRecoEntryHeader from './Bank_reco_entry_header';
import { detailInitData, headerInitData } from './Bank_reco_entry_helper';
import BankRecoEntryDetail from './Bank_reco_entry_detail';

const BankRecoEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...headerInitData});
      const [detailFormData, setDetailFormData] = useState([detailInitData])
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();



  const tabs = ["Bank Reco Entry"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  function handleSubmit(e){
    e.preventDefault();

    //console.log("Form submitted", formData)
  }

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
  }, []);

 const handleChange = useCallback((name, value, index = null, event = null) => {
      let newVal = value.toUpperCase();
    
      if (index === null) {
        // If index is null, update the main form data
        setFormData(prev => ({ ...prev, [name]: newVal }));
      } else {
        // If index exists, update the detail form data (table)
        const cursorPosition = event?.target?.selectionStart || 0;
    
        setDetailFormData(prevData => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
    
        setTimeout(() => {
          event?.target?.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }
    }, []);

    const handleDelete = (rowIndex) => {
      setDetailFormData((prevData) =>
        prevData.filter((_, index) => index !== rowIndex)
      );
    };

        const triggerAddRow = () => {
            setDetailFormData((prev) => [...prev, { ...detailInitData }]);
          };

  const setupQueryData = useCallback(
      (queryData, btnClicked) => {
 
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
        QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
        formName={"Bank Reco Entry"}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
              <BankRecoEntryHeader 
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              />
              <BankRecoEntryDetail 
              detailFormData={detailFormData}
              handleChange={handleChange}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDelete}
              formStatus={formStatus}
              formData={formData}
              />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default BankRecoEntry;

