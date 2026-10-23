
import React, { useEffect } from "react";
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import PaymentTermHeader from "./payment_term_header";
import PaymentTermDetail from "./payment_term_detail";
import { calcTotalPerc, createSearchPayloadForPayTermSpecificSearch, paymentTermDetailInitialData, paymentTermHeadInitialData } from "./payment_term_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { fetchAppData } from "../../../../utils/fetchUtils";
import HelpList from "../../../../components/HelpList";

const PaymentTerm = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...paymentTermHeadInitialData, lc: "N" });
  const [paymentTermDetailData, setPaymentTermDetailData] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,
    setSearchQuery } = useFormStatus();
  const [updatedPayTermDetail, setUpdatedPayTermDetail] = useState([]);
  const [deletedPayTermDetail, setDeletedPayTermDetail] = useState([]);
  const [effectiveCode, setEffectiveCode] = useState([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
      const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want   
      const [helpListHeader, setHelpListHeader] = useState([])
  
     const [isHelpModelOpen, setIsHelpModelOpen] = useState()
      const toggleHelpModal = () => setHelpList(!helpList)
        

  const tabs = ["Payment Term Purchase"];
     const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PYMNT_TERM_LIST_OF_CONSTANTS}`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          setEffectiveCode([{ value: "", label: "" }, ...formatOptions(data.effectiveCode || [], "code", "description")]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }


 const onSelectHelpItem = (data) => {
        setFormData((prev) => {
          switch (helpFor) {
            case "Code":
              return { ...prev, term_code: data.term_code, term_desc: data.term_desc };
          }
        });
      };

      const handleHelpList = (data) => {
        setHelpList(data);
      }


  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({ lc: "N" });
    setPaymentTermDetailData([]);
    setCurrentRecordNo();
    setTotalRecordCount();
    setUpdatedPayTermDetail([]);
    setDeletedPayTermDetail([]);
  }, []);



   const handleChange = useCallback(
  (name, value, index = null, event = null) => {
    if (!['Insert', "Search", 'Update'].includes(formStatus)) return;

    let newVal = value.toUpperCase();

    if (name === "po_cr_days") {
      if (Number(value) < 0) newVal = "";
    } else {
      newVal = value.toUpperCase();
    }

    const cursorPosition = event?.target?.selectionStart || 0;

    if (index === null) {
      setFormData((prev) => ({ ...prev, [name]: newVal }));

      // Restore cursor for main form fields (TextArea/TextInput)
       if (
            event?.target &&
            event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT" &&
             !["number", "radio", "checkbox", "date"].includes(event.target.type)   
          ) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }

    } else {
      setPaymentTermDetailData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };

        if (formStatus === "Update" && newData[index].create_date) {
          const updatedRecord = { ...newData[index], term_code: formData.term_code };
          setUpdatedPayTermDetail((prev) => {
            const existingIndex = prev.findIndex((rec) => rec.sr_no === updatedRecord.sr_no);
            if (existingIndex !== -1) {
              const newUpdated = [...prev];
              newUpdated[existingIndex] = updatedRecord;
              return newUpdated;
            }
            return [...prev, updatedRecord];
          });
        }

        return newData;
      });

      // Restore cursor for detail fields
       if (
            event?.target &&
            event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT" &&
             !["number", "radio", "checkbox", "date"].includes(event.target.type)   
          )
      setTimeout(() => {
        event?.target?.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  },
  [formStatus, formData.term_code]
  );




  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isValidPayTermHeadForm = validateForm("payment-term-head-form", "Payment Term Head Form");
      if (!isValidPayTermHeadForm) {
        return;
      }

           if (formStatus === "Insert" && (!paymentTermDetailData || paymentTermDetailData.length === 0)) {
      toast.error("At least one row should be inserted in Payment Term Detail");
      return;
    }

          if (formStatus === "Update" && (!paymentTermDetailData || paymentTermDetailData.length === 0)) {
      toast.error("At least one row should be inserted in Payment Term Detail");
      return;
    }

      const isValidPayTermDetail = validateForm("pay-term-detail-form", "Payment Term Detail Form");
      if (!isValidPayTermDetail) {
        return;
      }

      const hasNegativeCrDays = paymentTermDetailData.some((item) => Number(item.po_cr_days) < 0);
      if (hasNegativeCrDays) {
        toast.error(`PO Credit Days cannot be negative`);
        return;
      }

      let isTotalPercValid = calcTotalPerc(paymentTermDetailData);
      if (!isTotalPercValid) return;

    


      if (formStatus === "Update") {
        const invalidUpdates = updatedPayTermDetail.filter(
          (rec) => !rec.per_pamnt || !rec.term_desc || !rec.po_cr_days || !rec.eff_code || !rec.sr_no
        );
        if (invalidUpdates.length) {
          toast.error("Updated records are missing required fields");
          return;
        }
      }

      let formPayload = {};
      if (formStatus === "Insert") {
        formPayload = {
          payTerm: {
            ...formData,
            sale_or_purchase: "P",
          },
          payTermDetail: paymentTermDetailData,
        };
 
      }

      if (formStatus === "Update") {
        let newRecords = paymentTermDetailData.filter((newData) => !newData.create_date);
        if (!newRecords.length && !updatedPayTermDetail.length && !deletedPayTermDetail.length) {
          toast.error("There should be an Update/Delete/New Entry for Submit");
          return;
        }
        formPayload = {
          payTerm: {
            ...formData,
            sale_or_purchase: "P",
          },
          newPayTermDetail: newRecords,
          updatedPayTermDetail,
          deletedPayTermDetail,
        };
      
        
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PYMNT_TERM_FORM_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success(`Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`);
        handleCancel();
      } else {
        const errorMsg = await response.json();
        console.error("Update Error:", errorMsg);
        toast.error(errorMsg?.message);
      }
    } catch (error) {
      toast.error(error?.message || "Please check all the form fields or contact administrator");
    }
  };


     const setupQueryData = useCallback(
  (queryData, btnClicked) => {

    if (queryData?.type === "found") {
      setFormData((prev) => ({
        ...queryData.paymentTermData,
        lc: queryData.paymentTermData.lc || "N",
      }));
      setPaymentTermDetailData((prev) =>
        queryData.paymentTermDetailData.map((item, index) => ({
          ...item,
          sr_no: item.sr_no || index + 1,
        }))
      );
      setFocusedRowIndex(0);
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count);
      }
    } else {
      // backend 404 return kare ya type "found" na ho
      toast.error(queryData?.message || "No payment Term data found");
      setFormData(); 
      handleCancel();
      setPaymentTermDetailData([]);
      setFocusedRowIndex(0);
      setTotalRecordCount(0);
    }
  },
  [formStatus, currentRecordNo]
);

   



  const handleAddRow = useCallback(() => {
    
    setPaymentTermDetailData((prevData) => {
      const maxSrNo = Math.max(...prevData.map((item) => Number(item.sr_no) || 0), 0);
      return [...prevData, { ...paymentTermDetailInitialData, sr_no: maxSrNo + 1 }];
    });
  }, []);

  const handleDeleteRow = useCallback(
    (data) => {
      if (data?.create_date) {
        setDeletedPayTermDetail((prev) => [...prev, data]);
      }
      setPaymentTermDetailData((prevData) => prevData.filter((filtrData) => filtrData.sr_no !== data.sr_no));
    },
    [deletedPayTermDetail]
  );

  const handleUpdateRow = useCallback(
    (data) => {
      if (!data?.create_date) {
        return;
      }
      setUpdatedPayTermDetail((prev) => {
        const existingIndex = prev.findIndex((rec) => rec.sr_no === data.sr_no);
        if (existingIndex !== -1) {
          const newUpdated = [...prev];
          newUpdated[existingIndex] = { ...data, term_code: formData.term_code };
          return newUpdated;
        }
        return [...prev, { ...data, term_code: formData.term_code }];
      });
    },
    [formData.term_code]
  );


  

   const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForPayTermSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_PYMNT_TERM_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        QUERY_API={APP_PROD_API.GET_PYMNT_TERM_FORM_DATA}
        formName={""}
        handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id="payment-term-head-form">
              <PaymentTermHeader 
              formData={formData} 
              formStatus={formStatus} 
              handleChange={handleChange} 
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
                                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PYMNT_TERM_FORM_DATA}`}
                                  helpListHeader={helpListHeader}
                                  handleHelpList={handleHelpList}
                                  onSelectHelpItem={onSelectHelpItem}
                                  queryPera={{needAppGlobalData:'Y'}}
                                />
                              </ModalBody>
                            </Modal>
                          )}
               </Form>
              <PaymentTermDetail
                formData={formData}
                paymentTermDetailData={paymentTermDetailData}
                formStatus={formStatus}
                effectiveCode={effectiveCode}
                handleChange={handleChange}
                handleAddRow={handleAddRow}
                handleUpdateRow={handleUpdateRow}
                handleDeleteRow={handleDeleteRow}
                totalPercentage={formData.total_perc}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
              />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PaymentTerm;