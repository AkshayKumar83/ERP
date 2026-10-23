import React from "react";
import {
  Form,
  Modal,
  ModalBody,
  ModalHeader,
  TabContent,
  TabPane,
} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup.jsx";
import { useFormStatus } from "../../../../hooks/useFormStatus.js";
import { useCallback, useState } from "react";
import AccWiseDtlEntryHdr from "./account_wise_dtl_entry_hdr.jsx";
import {
  accWiseDtlFormDtlDataInitTemp,
  accWiseDtlFormHdrDataInitTemp,
} from "./account_wise_dtl_entry_helper.js";
import HelpList from "../../../../components/HelpList/index.jsx";
import { APP_PROD_API } from "../../../../utils/api.js";
import { useSelector } from "react-redux";
import AccWiseDtlEntryDtl from "./account _wise_dtl_entry_dtl.jsx";


const AccountWiseDtlEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();
  const [formData, setFormData] = useState({
    ...accWiseDtlFormHdrDataInitTemp,
  });
  const [detailFormData, setDetailFormData] = useState([
    { ...accWiseDtlFormDtlDataInitTemp },
  ]);
  const [formControl, setFormControl] = useState({
    combine_acc_yn: "N",
  });

  // Initialize helpList to true to open the modal on mount
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const toggleHelpModal = () => setHelpList(!helpList);

  const tabs = ["Acount Wise Detail Entry"];

  // Set formStatus to "Insert" to allow help list opening
  const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Shows the Help list
  const handleHelpList = (show) => {
    setHelpList(show);
  };

  const onSelectHelpItem = (data) => {
    //console.log(data);
    setFormData((prev) => {
      switch (helpFor) {
        case "acc_no":
          return {
            ...prev,
            acc_no: data.acc_no,
            acc_desc: data.acc_desc,
          };
        default:
          return prev;
      }
    });
    setHelpList(false); 
  };

  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({ ...accWiseDtlFormHdrDataInitTemp });
    setDetailFormData([{ ...accWiseDtlFormDtlDataInitTemp }]);
  }, []);

  const handleChange = useCallback((stateKey, name, value, index, event) => {
    const cursorPosition = event?.target?.selectionStart;
    let newVal = value.toUpperCase();

    setFormData((prev) => {
      if (stateKey === "formData") {
        return { ...prev, [name]: newVal };
      }
      return prev;
    });
    

    if (stateKey === "detailFormData") {
      setDetailFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
    }

    if (event) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {}, 
    [formStatus, currentRecordNo]
  );

  const triggerAddRow = () => {
    setDetailFormData((prev) => [
      ...prev,
      { ...accWiseDtlFormDtlDataInitTemp },
    ]);
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
        formData={formData}
        authority={{ insert: "N", update: "N" }}
        handleOffset={handleOffset}
        QUERY_API={"APP_PROD_API.GET_BIN_KARD_FORM_DATA"}
        btnEnableDtl={{ query: false, search: false, insert: false }}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id="bin-kard-form">
              <AccWiseDtlEntryHdr
                formData={formData}
                formStatus={formStatus}
                handleChange={(name, value, event) => handleChange("formData", name, value, null, event)}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                user={user}
                setFormData={setFormData}
                setDetailFormData={setDetailFormData}
                setFormControl={setFormControl}
                formControl={formControl}
                
              />
              {helpList && (
                <Modal isOpen={helpList} toggle={toggleHelpModal} size="md">
                  <ModalHeader toggle={toggleHelpModal}>
                    Select Store
                  </ModalHeader>
                  <ModalBody>
                    <HelpList
                      formStatus={"Insert"}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.ACC_WISE_DTL_ENTRY}`}
                      helpListHeader={helpListHeader}
                      handleHelpList={handleHelpList}
                      onSelectHelpItem={onSelectHelpItem}
                      queryPera={{needAppGlobalData: "Y", appDivisionId: "1", appFinYear: "2024"}}
                    />
                  </ModalBody>
                </Modal>
              )}
            </Form>
            <AccWiseDtlEntryDtl
              formData={formData}
              detailFormData={detailFormData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default AccountWiseDtlEntry;
