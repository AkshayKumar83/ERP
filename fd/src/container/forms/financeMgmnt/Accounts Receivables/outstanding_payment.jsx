
import React from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import OutstandingPaymentHeader from './outstanding_payment_header';
import OutstandingPaymentDetail from './outstanding_payment_detail';
import { createSearchPayloadForOutstandingPaymentSearch, detailInitData, handleValidateDetailsField, outstandingIniytData, validateRow } from './outstanding_payment_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import HelpList from '../../../../components/HelpList';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../components/Modals/confirmationModal';
import { fetchAppData } from '../../../../utils/fetchUtils';

const OutstandingPayments = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...outstandingIniytData});
  const [detailData, setDetailData] = useState([]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
    setSearchQuery, } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState("");
    const [helpListHeader, setHelpListHeader] = useState([]);
    const [isHelpModelOpen, setIsHelpModelOpen] = useState();
    const toggleHelpModal = () => setHelpList(!helpList);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

     const [confirmationModal, setConfirmationModal] = useState(false);
     const [confirmationConfig, setConfirmationConfig] = useState({});

      const [deleteRecord, setDeleteRecord] = useState([]);

     const { user } = useSelector((state) => state.auth);

      const tabs = [];

      const updateActiveTab = useCallback((tab) => {
        setActiveTab(tab);
        }, []);

      function handleOffset(data){
        setCurrentRecordNo(data)
        }


     const handleHelpList = (data,rowIndex = -1) => {
        setHelpList(data);
        setSelectedRowIndex(rowIndex);
    };



    const onSelectHelpItem = (data) => {
      switch (helpFor) {
      case "PartyCode":
      setFormData((prev) => ({
        ...prev,
        acc_no: data.acc_no,
        party_desc: data.acc_desc,
        city: data.city,
      }));
      break;

    case "AccNo":
      setDetailData((prev) => {
        const updatedRows = [...prev];
        const row = { ...updatedRows[focusedRowIndex] };

        row.party_acc = data.acc_no;
        row.party_acc_desc = data.acc_desc;

          // Agar row purani thi aur unchanged thi → update bana do
        if (!row.isNewStatus || row.isNewStatus === "unchanged") {
          row.isNewStatus = "update";
        }

        updatedRows[focusedRowIndex] = row;
        return updatedRows;
      });
      break;
  }
};


    const handleCancel = useCallback(() => {
      releaseFormStatus()
      setFormData({ ...outstandingIniytData });
      setDetailData([]); 
      setDeleteRecord([]);
      }, []);




     const handleChange = useCallback((stateKey, name, value, index, event) => {
      if (!["Insert", "Search", "Update"].includes(formStatus)) return;

      if(['acc_no','party_acc'].includes(name)){
        toast.error('Please select value from help list only')
        return;
      }

      const cursorPosition = event?.target?.selectionStart;
      let newVal = value;

      // === Special case for Amount field ===
      if (name === "amount") {
        const regex = /^\d*\.?\d{0,2}$/;  // Allow only numbers with up to 2 decimal places 
        if (!regex.test(newVal))     return;
        if (parseFloat(newVal) <= 0 && newVal !== "")  return;
      }
           if (name === "tran_year") {
        const regex = /^\d{0,4}$/; // allow only up to 4 digits, no decimal
        if (!regex.test(newVal)) return; 
      }
          
      if (typeof newVal === "string" && newVal.toUpperCase) {
        newVal = newVal.toUpperCase();
      }


      if (stateKey === "formData") {
        setFormData((prev) => ({ ...prev, [name]: newVal }))
         }

        if (formStatus === "Update" && name === "acc_no") {
          // update case me detail rows ke acc_no ko bhi update karo
          setDetailData((prev) =>
            prev.map((row) => ({
              ...row,
              acc_no: newVal,
            }))
          );
        }
     
      if (stateKey === "detailData") {
     setDetailData((prevData) => {
    const newData = [...prevData];
    const updatedRow = { ...newData[index], [name]: newVal };

    //  Agar row DB se aayi thi aur pehle "unchanged" thi
    if (!updatedRow.isNewStatus || updatedRow.isNewStatus === "unchanged") {
      updatedRow.isNewStatus = "update";  // mark as update
    }

    newData[index] = updatedRow;
    return newData;
      });
    }

        if (
    event?.target &&
    event.target.tagName === "INPUT" &&
    !["number", "radio", "checkbox", "date"].includes(event.target.type)
  ) {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }
      }, [formStatus]);


      const triggerAddRow = () => {
        // const lastRow = detailData[detailData.length - 1];
        // const isValid = validateRow(lastRow, detailData.length - 1);
        // if (!isValid) return;

         const outPayHdr = validateForm("out-pay-hdr", "Outstanding Payment");
         if (!outPayHdr) return;

          if (detailData.length > 0) {
          const lastRow = detailData[detailData.length - 1];
          const isValid = validateRow(lastRow, detailData.length - 1);
          if (!isValid) return;
         }

        setDetailData((prev) => [
          ...prev,
          {
            ...detailInitData,
            id: 1, // frontend marker for new row
            outs_id: formData?.outs_id, 
            acc_no: formData?.acc_no,
            isNewStatus: "insert",   
          },
        ]);
        setFocusedRowIndex(detailData.length);
      };

 

   const handleDelete = useCallback((data, rowIndex) => {
        setDetailData((prevData) => {
          const newData = prevData.filter((_, index) => index !== rowIndex);

      
          if (!data.id) {
            setDeleteRecord((prev) => [...prev, data]);
          }

          setFocusedRowIndex((prevIndex) => {
            if (rowIndex >= newData.length) {
              return newData.length - 1;
            } else if (prevIndex > rowIndex) {
              return prevIndex - 1;
            }
            return prevIndex;
          });

          return newData;
        });
    }, []);

const setupQueryData = useCallback(
  (queryData, btnClicked) => {
 
    // Header Data formatting
    if (queryData?.headerData) {
      const formattedData = {
        ...queryData.headerData,
        voucher_dt: dateFormatter(queryData.headerData.voucher_dt)
      };
      setFormData(formattedData);
    }

    // Detail Data formatting
    setDetailData(
      (queryData.detailData || []).map((item) => ({
        ...item,
        due_date: item.due_date ? dateFormatter(item.due_date) : null,
        doc_dt: item.doc_dt ? dateFormatter(item.doc_dt) : null,
        // isNewStatus: "unchanged",
        old_acc_no: item.acc_no,  
        old_doc_no: item.doc_no,
        old_party_acc:item.party_acc,
      }))
    );
        setFocusedRowIndex(0);
        
    if (btnClicked === "Query") {
      setTotalRecordCount(queryData.count);
      if (!queryData?.headerData) {
        toast.error(queryData.message || "No User data found");
        handleCancel()
        return;
      }
    }
  },
  [formStatus, currentRecordNo]
);

    

    const handleSubmit = async (e) => {
  e.preventDefault();
  if (!["Insert", "Update"].includes(formStatus)) return;

  try {
    // ==== Validate Header Form ====
    const outPayHdr = validateForm("out-pay-hdr", "Outstanding Payment");
    if (!outPayHdr) return;

    // === Checking at least one row add in insertion time ===
        if (detailData.length === 0) {
      toast.error("Please add at least one detail row before submitting");
      return;
    }
         // ==== Validate details Form ====
    const outPayDtl = validateForm("out-pay-dtl", "Outstanding Payment");
       if (!outPayDtl) return;

   // ==== Prepare Header ====
    let headerPayload = { ...formData };

    if (formStatus === "Insert") {
      headerPayload = {
        ...headerPayload,
        trans_type: "OS",
        origin: "O",
        posted: "Y",
        division_id: user.global_division_id,
        finYear: user.global_fin_year,
      };
        } else {
          headerPayload = {
            ...headerPayload,
            division_id: user.global_division_id, 
          };
        }

        // ==== Prepare Details ====
      const detailPayload = detailData
        .filter((row) => Object.keys(row).length > 0)
        .map((row) => ({
          ...row,
          outs_id: row.outs_id || headerPayload.outs_id, 
          acc_no: headerPayload.acc_no,    // new acc_no
          old_acc_no: row.old_acc_no || headerPayload.acc_no, // original acc_no
          isNewStatus: row.isNewStatus || "unchanged", 
        }));

    // ==== Final Payload ====
    const payload = {
      header: headerPayload,
      details: detailPayload,
      deleteRecords: deleteRecord,
    };

    // ==== API Call ====
    const method = formStatus === "Insert" ? "POST" : "PUT";
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_OUTSTND_PYMT_FORM_DATA}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Can't fetching error while submiting data.");
    }

   if (response.ok) {
        let responseData = await response.json()
        toast.success("Record saved successfully");
        if(formStatus == 'Insert'){
          showGeneratedInvNo(responseData?.voucher_no)
        }
      }
    handleCancel();
  } catch (error) {
    // console.error("Submit error:", error);
    toast.error(error.message || "Please check all the form fields or contact administrator");
  }
};



 const onSuccessConfirmation = useCallback(
      (confirm, voucher_no) => {
        setConfirmationConfig({});
        setConfirmationModal(false);
      },
      [formData]
    );
    
    const showGeneratedInvNo = useCallback((voucher_no)=>{
      setConfirmationConfig({
        title: "Voucher No. generated",
        description:`New Voucher no generated is ${voucher_no}`,
        uniqKey: "voucher_no",
      });
      setConfirmationModal(true);
    },[])

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload =
        createSearchPayloadForOutstandingPaymentSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_OUTSTND_PYMT_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
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
        QUERY_API={APP_PROD_API.GET_OUTSTND_PYMT_FORM_DATA}
        formName={"Outstanding Payment"}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id = 'out-pay-hdr'>
            <OutstandingPaymentHeader  
            formData={formData}
            setFormData={setFormData}
            handleChange={(name, value, event) =>handleChange("formData", name, value, null, event)}
            formStatus= {formStatus}
             handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
            />
            </Form>
            <OutstandingPaymentDetail 
             detailData={detailData}
             setDetailData={setDetailData}
             handleChange={handleChange}
             triggerAddRow={triggerAddRow}
             handleDelete={handleDelete}
             formStatus={formStatus}
             focusedRowIndex={focusedRowIndex}
             setFocusedRowIndex={setFocusedRowIndex}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
            />
           
 {helpList && (
                            <Modal
                                isOpen={helpList}
                                toggle={toggleHelpModal}
                                size="lg"
                            >
                                <ModalHeader
                                    toggle={toggleHelpModal}
                                ></ModalHeader>
                                <ModalBody>
                                    <HelpList
                                        formStatus={formStatus}
                                        helpFor={helpFor}
                                        apiUrl={`${
                                            import.meta.env.VITE_BASE_API_URL
                                        }${
                                            APP_PROD_API.GET_OUTSTND_PYMT_FORM_DATA
                                        }`}
                                        helpListHeader={helpListHeader}
                                        handleHelpList={handleHelpList}
                                        onSelectHelpItem={onSelectHelpItem}
                                        queryPera={{ needAppGlobalData: "Y" }}
                                        whereClause={ helpFor === 'PartyCode' ? { trans_year: formData.trans_year ,
                                          debt_cred: formData.debt_cred || "D"
                                        } : {} }
                                        
                                    />
                                </ModalBody>
                            </Modal>
                        )}
                        
     {confirmationModal && (
              <ConfirmationModal
                isOpen={confirmationModal}
                onClose={() => {
                  onSuccessConfirmation(false, confirmationConfig);
                  setConfirmationModal(false);
                }}
                {...confirmationConfig}
                onSuccess={() => onSuccessConfirmation(true, confirmationConfig)}
              />
            )}
              
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default OutstandingPayments;

