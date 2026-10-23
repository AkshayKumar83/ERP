import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ApBillEntryMain from "./ap_bill_entry_main";
import ApBillOuts from "./ap_bill_entry_outs";
import ApBillEntryItCanTab from "./ap_bill_entry_ItCanTab";

const ApBillEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [itemData, setItemData] = useState([{}]);
  const [itemChlnData, setItemChlnData] = useState([{}]);
  const [outsFormData, setOutsFormData] = useState([{}]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const tabs = ["Main",'Item', 'Outstanding'];

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
    setItemData([{}])
    setItemChlnData([{}])
    setOutsFormData([{}])
  }, []);

const handleChange = useCallback((name, value, target = "formData", index = 0) => {
  const upperValue = value?.toUpperCase?.() ?? "";

  switch (target) {
    case "formData":
      setFormData((prev) => ({ ...prev, [name]: upperValue }));
      break;

    case "itemData":
      setItemData((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [name]: upperValue };
        return updated;
      });
      break;

    case "itemChlnData":
      setItemChlnData((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [name]: upperValue };
        return updated;
      });
      break;

    case "outsFormData":
      setOutsFormData((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [name]: upperValue };
        return updated;
      });
      break;

    default:
      break;
  }
}, []);


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {},
    [formStatus, currentRecordNo]
  );

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
            <ApBillEntryMain
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
            />
          </TabPane>
          <TabPane tabId={2}>
            <ApBillEntryItCanTab
              itemData={itemData}
              itemChlnData={itemChlnData}
              formStatus={formStatus}
              handleChange={handleChange}
            />
          </TabPane>
          <TabPane tabId={3}>
            <ApBillOuts
              formData={outsFormData}
              formStatus={formStatus}
              handleChange={handleChange}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ApBillEntry;
