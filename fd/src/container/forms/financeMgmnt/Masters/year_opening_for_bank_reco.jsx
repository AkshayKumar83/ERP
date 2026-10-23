import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import YearOpeningForBankRecoDetails from "./year_opening_for_bank_reco_details";
import {
  yearBankReco1Data,
  yearBankRecoData,
} from "./year_opening_for_bank_reco_helper";

const YearOpeningForBankReco = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...yearBankReco1Data });
  const [detailFormData, setDetailFormData] = useState([yearBankRecoData]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const tabs = ["Year Opening For Bank Reco"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    //console.log("Form submitted", formData);
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
  }, []);



 

  const handleChange = useCallback((name, value, index = null, event = null) => {
    if (index === null) {
      // If index is null, update the main form data
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else {
      // If index is provided, update the detail table form data
      const cursorPosition = event?.target.selectionStart;
      let newVal = value.toUpperCase();
  
      setDetailFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
  
      // Maintain cursor position
      if (event) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }
    }
  }, []);
  

  const triggerAddRow = () => {
    setDetailFormData((prev) => [...prev, { ...yearBankRecoData }]);
  };

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {},

    [formStatus, currentRecordNo]
  );

  //console.log("formStatus from memberform", formStatus);
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
            <Form>
            <YearOpeningForBankRecoDetails
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              triggerAddRow={triggerAddRow}
              detailFormData={detailFormData}
            />
            </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default YearOpeningForBankReco;
