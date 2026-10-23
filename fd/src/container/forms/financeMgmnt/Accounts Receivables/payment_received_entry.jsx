import React from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import PaymentReceivedEntryMainTab from "./payment_received_entry_main_tab";
import PaymentReceivedEntryInvoiceTab from "./payment_received_entry_Invoice_tab";
import PaymentReceivedEntryDebitCreditNoteTab from "./payment_received_entry_debit_credit_note_tab";
import PaymentReceivedEntryMiscellaneous from "./payment_received_entry_miscellaneous";
import { debitCreditInitData, invoiceTabInitData, mainTabInitData, miscInitData, uploadInitData } from "./payment_received_entry_helper";
import PaymentReceivedEntryUpload from "./payment_received_entry_upload";

const PaymentReceivedEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  
  const [mainFormData, setMainFormData] = useState({...mainTabInitData})
  const [invoiceFormData, setInvoiceFormData] = useState([{...invoiceTabInitData}]);
  const [dcFormData, setDCFormData] = useState([{...debitCreditInitData}]);
  const [miscFormData, setMiscFormData] = useState([{...miscInitData}]);
  const [uploadFormData, setUploadFormData] = useState([{...uploadInitData}]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const tabs = ["Main", "Invoice", "Debit/Credit Note", "Miscellaneous","Upload"];

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

  // const handleChange = useCallback((name, value) => {
  //   setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  // }, []);

  const handleChange = (tab, name, value, index, event) => {
    const cursorPosition = event?.target?.selectionStart;
    const newVal = value.toUpperCase();

    switch (tab) {
      case "MainTab":
        setMainFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
        case "InvoiceTab":
          setInvoiceFormData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
          break;
       
        case "DebitCreditTab":
          setDCFormData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
          break;
          case "MiscTab":
            setMiscFormData((prevData) => {
              const newData = [...prevData];
              newData[index] = { ...newData[index], [name]: newVal };
              return newData;
            });
            break;
            case "UploadTab":
              setUploadFormData((prevData) => {
                const newData = [...prevData];
                newData[index] = { ...newData[index], [name]: newVal };
                return newData;
              });
              break;
      default:
        break;
    }

    // Restore cursor position
    setTimeout(() => {
      if (event?.target) event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      
    },
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
              <PaymentReceivedEntryMainTab
               mainFormData= {mainFormData}
               handleChange={(name, value) => handleChange("MainTab", name, value,)}
               formStatus={formStatus}
              />
            </Form>
          </TabPane>
           <TabPane tabId={2}>
            <Form>
            <PaymentReceivedEntryInvoiceTab
              invoiceFormData={invoiceFormData}
              handleChange={(name, value, index, event) => handleChange("InvoiceTab", name, value, index, event )}
              formStatus={formStatus}           
            />
             </Form>
          </TabPane>
          <TabPane tabId={3}>
            <Form>
              <PaymentReceivedEntryDebitCreditNoteTab
              dcFormData={dcFormData}
              handleChange={(name, value, index, event) => handleChange("DebitCreditTab", name, value, index, event )}
              formStatus={formStatus}
              />
            </Form>
          </TabPane>
          <TabPane tabId={4}>
            <Form>
              <PaymentReceivedEntryMiscellaneous 
                  formStatus={formStatus}
                  miscFormData={miscFormData}
                  handleChange={(name, value, index, event) => handleChange("MiscTab", name, value, index, event )}
              />
            </Form>
          </TabPane>
          
          {/* TODO THE BELOW TAB SHOULD ACCESSED BY BOOTOM SUBMITBAR ADD THE BUTTON IN SUBMITBAR

            BUTTON NAME UPLOAD RECECIPT -> AT ON CLICKING IN THIS BUTTON THE PaymentReceivedEntryUpload DISPLAY WILL OPEN
            PLEASE KEEP IN MIND THIS IS NOT WITH THE
          
          */}
          <TabPane tabId={5}>
            <Form>
              <PaymentReceivedEntryUpload 
                uploadFormData={uploadFormData}
                formStatus={formStatus}
                handleChange={(name, value, index, event) => handleChange("UploadTab", name, value, index, event )}
              />
            </Form>
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PaymentReceivedEntry;
