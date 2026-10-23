import React, { useState, useCallback } from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import PaymentAdviseBill from "./payment_advise_bill_tap";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { 
  bankGaurAdjData,
  creditNoteData,
  debitNoteData,
  paymentAdviseAditionTabData, 
  paymentAdviseBillTapData, 
  paymentAdviseBillTapDetailData, 
  OnAccAdjData, 
  retensionAdjData
} from "./payment_advise_helper";
import PaymentAdviseAditionTab from "./payment_advise_addition_tab";
import PaymentAdviseOnAccAdjTab from "./payment_advise_on_acc_adj_tab";
import PaymentAdviseDebitNoteAdjTab from "./payment_advise_DebitNoteAdj_tab";
import PaymentAdviseCreditNoteAdjTab from "./payment_advise_creditNoteAdj_tab";
import PaymentAdviseRetensionAdjTab from "./payment_advise_retensionAdj_tab";
import PaymentAdviseBankGaurAdjTab from "./payment_advise_bankGaurAdj_tab";
import PaymentAdviseBillDetail from "./payment_advise_bill_detail";

const PaymentAdvice = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  
  // Form data states
  const [formData, setFormData] = useState();  
  const [billHeadFormData, setBillHeadFormData] = useState({...paymentAdviseBillTapData});
  const [billDetailFormData, setBillDetailFormData] = useState([{...paymentAdviseBillTapDetailData}]);
  const [additionFormData, setAdditionFormData] = useState([{...paymentAdviseAditionTabData}]);
  const [onAccAdjFormData, setOnAccAdjFormData] = useState([{...OnAccAdjData}]);
  const [debitFormData,setDebitFormData] = useState([{...debitNoteData}]);
  const [creditFormData, setCreditFormData] = useState([{...creditNoteData}]);
  const [retensionFormData, setRetensionFormData] = useState([{...retensionAdjData}]);
  const [bankFormData, setBankFormData] = useState([{...bankGaurAdjData}]);

  const tabs = ["Bills", "Addition/Ded", "On Account Adj.", "Debit Note Adj.", "Credit Note Adj.", "Retention Adj.", "Bank Guar. Adj."];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  
  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({});
  }, []);

  const handleOffset = (data) => {
    setCurrentRecordNo(data);
  };

  const handleChange = (tab, name, value, index, event) => {
    const cursorPosition = event?.target?.selectionStart;
    const newVal = value.toUpperCase();

    switch (tab) {
      case "billHead":
        setBillHeadFormData((prev) => ({ ...prev, [name]: newVal }));
        break;
      case "billDetail":
        setBillDetailFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;
      case "addition":
        setAdditionFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;
      case "onAccAdj":
        setOnAccAdjFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { ...newData[index], [name]: newVal };
          return newData;
        });
        break;
        case "debitNote":
          setDebitFormData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: newVal };
            return newData;
          });
          break;
          case "creditNote":
            setCreditFormData((prevData) => {
              const newData = [...prevData];
              newData[index] = { ...newData[index], [name]: newVal };
              return newData;
            });
            break;
            case "retensionAdj":
              setRetensionFormData((prevData) => {
                const newData = [...prevData];
                newData[index] = { ...newData[index], [name]: newVal };
                return newData;
              });
              break;
              case "bankGaurAdj":
                setBankFormData((prevData) => {
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

  const triggerAddRow = (tab) => {
    let newRow = {};
    switch (tab) {
      case "addition":
        newRow = { ...paymentAdviseAditionTabData };
        setAdditionFormData((prevData) => [...prevData, newRow]);
        break;
      case "billDetail":
        newRow = { ...paymentAdviseBillTapDetailData };
        setBillDetailFormData((prevData) => [...prevData, newRow]);
        break;
      case "onAccAdj":
        newRow = { ...OnAccAdjData };
        setOnAccAdjFormData((prevData) => [...prevData, newRow]);
        break;
      case "debitNote":
        newRow = { ...debitNoteData };
        setDebitFormData((prevData) => [...prevData, newRow]);
        break;
      case "creditNote":
        newRow = { ...creditNoteData };
        setCreditFormData((prevData) => [...prevData, newRow]);
        break;
      case "retensionAdj":
        newRow = { ...retensionAdjData };
        setRetensionFormData((prevData) => [...prevData, newRow]);
        break;
      case "bankGaurAdj":
        newRow = { ...bankGaurAdjData };
        setBankFormData((prevData) => [...prevData, newRow]);
        break;
      default:
        console.warn("Invalid tab for adding row:", tab);
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
        setupQueryData={() => {}}
        handleSubmit={(e) => {
          e.preventDefault();
          //console.log("Form submitted", formData);
        }}
        handleCancel={handleCancel}
        handleOperation={handleOperation}
        formData
        handleOffset={handleOffset}
        QUERY_API={"api would come here"}
        formName={"Payment Advise"}
      >
        <TabContent activeTab={activeTab}>
          {/* Bill Tab */}
          <TabPane tabId={1}>
              <PaymentAdviseBill 
                billHeadFormData={billHeadFormData}
                handleChange={(name, value, event) => handleChange("billHead", name, value, null, event)}
                formStatus={formStatus}
              />
              <PaymentAdviseBillDetail
              billDetailFormData={billDetailFormData}
              handleChange={(name, value, index, event) => handleChange("billDetail", name, value, index, event)}
              formStatus={formStatus}
              triggerAddRow={() => triggerAddRow("billDetail")}
              />
          </TabPane>

          {/* Addition/Deduction Tab */}
          <TabPane tabId={2}>
            <Form>
              <PaymentAdviseAditionTab
                additionFormData={additionFormData}
                handleChange={(name, value, index, event) => handleChange("addition", name, value, index, event)}
                triggerAddRow={() => triggerAddRow("addition")}
              />
            </Form>
          </TabPane>

          {/* On Account Adjustment Tab */}
          <TabPane tabId={3}>
            <Form>
              <PaymentAdviseOnAccAdjTab 
                onAccAdjFormData={onAccAdjFormData}
                formStatus={formStatus}
                handleChange={(name, value, index, event) => handleChange("onAccAdj", name, value, index, event)}
                triggerAddRow={() => triggerAddRow("onAccAdj")}
              />
            </Form>
          </TabPane>

          {/* Debit Note Adjustment Tab */}
          <TabPane tabId={4}>
            <PaymentAdviseDebitNoteAdjTab 
            debitFormData={debitFormData}
            formStatus={formStatus}
            handleChange={(name, value, index, event) => handleChange("debitNote", name, value, index, event)}
            triggerAddRow={() => triggerAddRow("debitNote")}
            />
          </TabPane>

          {/* Credit Note Adjustment Tab */}
          <TabPane tabId={5}>
            <PaymentAdviseCreditNoteAdjTab 
            creditFormData={creditFormData}
            formStatus={formStatus}
            handleChange={(name, value, index, event) => handleChange("creditNote", name, value, index, event)}
            triggerAddRow={() => triggerAddRow("creditNote")}
           
            />
          </TabPane>

             {/* Retension Adjustment Tab */}
          <TabPane tabId={6}>
          <PaymentAdviseRetensionAdjTab
            retensionFormData={retensionFormData}
            formStatus={formStatus}
            handleChange={(name, value, index, event) => handleChange("retensionAdj", name, value, index, event)}
            triggerAddRow={() => triggerAddRow("retensionAdj")}
            />
          </TabPane>

          {/* Bank Gaur Adjustment Tab */}
          <TabPane tabId={7}>
            <PaymentAdviseBankGaurAdjTab 
            bankFormData={bankFormData}
            formStatus={formStatus}
            handleChange={(name, value, index, event) => handleChange("bankGaurAdj", name, value, index, event)}
            triggerAddRow={() => triggerAddRow("bankGaurAdj")}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PaymentAdvice;
