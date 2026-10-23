import React from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { checkValidYear, customerTDSDeclData, customerTDSDisableData } from './customer_tds_declaration_helper';
import CustomerTdsDeclarationDetails from './customer_tds_declaration_dtl';
import { APP_PROD_API } from '../../../../utils/api';
import HelpList from '../../../../components/HelpList';
import { validateForm } from '../../../../utils/fn';
import toast from 'react-hot-toast';


const CustomerTdsDeclaration = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [disFormData, setDisFormData] = useState([]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [focusedRowIndex,setFocusedRowIndex] = useState(0)
  const [focusedRowIndexDec,setFocusedRowIndexDec] = useState(0)

   const [paginationPage, setPaginationPage] = useState(1);
    const [helpList, setHelpList] = useState(false);
     const [helpFor, setHelpFor] = useState('');
     const [helpListHeader, setHelpListHeader] = useState([]);
       const toggleHelpModal = () => setHelpList(!helpList);
       const [selectedRowIndex, setSelectedRowIndex] = useState(0);
   const [deletedRecords, setDeletedRecords] = useState([]);

  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

const handleHelpList = (show, globalIndex = -1) => {
  if (globalIndex === -1) {
    setHelpList(show);
    return;
  }
  setSelectedRowIndex(globalIndex);
  setHelpList(show);
};

const isDuplicateYearUI = (c_code, trans_year, currentRowIndex) => {
  return disFormData.some(
    (row, index) =>
      row.c_code === c_code &&
      row.trans_year === trans_year &&
      row.isStatus !== "delete" &&
      index !== currentRowIndex // same row ko skip
  );
};



const onSelectHelpItem = async (data) => {
  if (helpFor === "year") {
    const selectedYear = data.year_code;

    // 1) UI duplicate check
    const duplicateUI = isDuplicateYearUI(currentCCode, selectedYear, selectedRowIndex);
    if (duplicateUI) {
      toast.error("This year already exists for this customer.");
      return;
    }

    // 2) Backend duplicate check
    const ok = await checkValidYear(currentCCode, selectedYear);
    if (!ok) return;

    // 3) UPDATE ROW + MARK STATUS
    setDisFormData((prev) =>
      prev.map((row, index) =>
        index === selectedRowIndex
          ? {
              ...row,
              trans_year: selectedYear,
              isStatus: row.isStatus === "new" ? "new" : "update",  // 🔥 IMPORTANT
            }
          : row
      )
    );
  }

  toggleHelpModal();
};



  function handleOffset(data){
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData([]);
    setDisFormData([])
    setFocusedRowIndex(0)
    setFocusedRowIndexDec(0)
  }, []);

       const selectedCustomer = formData[focusedRowIndex] || {};
      const currentCCode = selectedCustomer.c_code;


const handleChange = useCallback(
  (name, value, globalIndex, event) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const cursorPosition = event.target.selectionStart;
    const newVal = value.toUpperCase();
    
    setDisFormData((prev) => {
      const updated = [...prev];
      const old = updated[globalIndex];

      if (!old) return prev; // safety

      updated[globalIndex] = {
        ...old,
        [name]: newVal,
        isStatus: old.isStatus === "new" ? "new" : "update",
      };

      return updated;
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
  },
  [formStatus]
);


const handleDelete = useCallback(
  (globalIndex) => {
    setDisFormData((prev) => {
      const updated = [...prev];
      const row = updated[globalIndex];

      if (!row) return prev;

      // nayi row -> direct hata do
      if (row.isStatus === "new") {
        updated.splice(globalIndex, 1);
        return updated;
      }

      // purani row -> delete mark
      updated[globalIndex] = {
        ...row,
        isStatus: "delete",
      };

      return updated;
    });

    setFocusedRowIndexDec((prev) => Math.max(prev - 1, 0));
  },
  []
);




      const triggerAddRow = () => {
  // current customer ke saare active rows (delete wale chhod ke)
  const currentRows = disFormData.filter(
    (r) => r.c_code === currentCCode && r.isStatus !== "delete"
  );

  // rule check: Return Filed = Y, Ack No empty
  const invalidRow = currentRows.find(
    (r) => r.return_filed === "Y" && (!r.acknowledgement_no || r.acknowledgement_no.trim() === "")
  );

  if (invalidRow) {
    toast.error("If Return filed the Acknowledgement no is must.");

    // optional: focus us row par
    const childIndex = disFormData.findIndex(
      (r) =>
        r.c_code === invalidRow.c_code &&
        r.trans_year === invalidRow.trans_year &&
        r.isStatus !== "delete"
    );
    if (childIndex !== -1) {
      setFocusedRowIndexDec(childIndex);
    }

    return; //  nayi row add mat karo
  }

  //  sab sahi hai to hi nayi row add karo
  setDisFormData((prev) => {
    const newData = [
      ...prev,
      { ...customerTDSDeclData, c_code: currentCCode, isStatus: "new" },
    ];

    setFocusedRowIndexDec(
      newData.filter((r) => r.c_code === currentCCode).length - 1
    );

    return newData;
  });
};

            
//  const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const customerTDS = validateForm("cus-tds", "Customer TDS Declaration");
//     if (!customerTDS) return;

//     // Collect rows based on status
//     const newRows = disFormData.filter((r) => r.isStatus === "new" && r.c_code);
//     const updatedRows = disFormData.filter((r) => r.isStatus === "update" && r.c_code);
//     const deletedRows = disFormData.filter((r) => r.isStatus === "delete" && r.c_code);

//     // NOTHING TO SAVE?
//     if (newRows.length === 0 && updatedRows.length === 0 && deletedRows.length === 0) {
//       toast.error("No changes found to save");
//       return;
//     }

//     const payload = {
//       newRows,
//       updatedRows,
//       deletedRows,
//     };

//     console.log("FINAL PAYLOAD TO BACKEND:", payload);

//     const method = formStatus === "Insert" ? "POST" : "PUT";

//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CUSTOMER_TDS_FORM_DATA}?form_status=${formStatus}`,
//       {
//         method,
//         body: JSON.stringify(payload),
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Error saving data");
//     }

//     toast.success("Data saved successfully!");
//     handleCancel();
//   } catch (error) {
//     console.error("Submit error:", error);
//     toast.error(error.message || "Something went wrong during save");
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const customerTDS = validateForm("cus-tds", "Customer TDS Declaration");
    if (!customerTDS) return;

    //  pehle RETURN_FILED / ACK_NO validation sab rows par
    const activeRows = disFormData.filter((r) => r.isStatus !== "delete");

    const invalidRow = activeRows.find(
      (r) => r.return_filed === "Y" && (!r.acknowledgement_no || r.acknowledgement_no.trim() === "")
    );

    if (invalidRow) {
      toast.error("If Return filed the Acknowledgement no is must.");

      // parent table me us customer ko focus karo
      const parentIndex = formData.findIndex(
        (c) => c.c_code === invalidRow.c_code
      );
      if (parentIndex !== -1) {
        setFocusedRowIndex(parentIndex);
      }

      // child table me us row ko focus karo
      const childIndex = disFormData.findIndex(
        (r) =>
          r.c_code === invalidRow.c_code &&
          r.trans_year === invalidRow.trans_year &&
          r.isStatus !== "delete"
      );
      if (childIndex !== -1) {
        setFocusedRowIndexDec(childIndex);
      }

      return; //  submit mat karo
    }

    //  yahan se aage aapka purana payload logic
    const newRows = disFormData.filter((r) => r.isStatus === "new" && r.c_code);
    const updatedRows = disFormData.filter(
      (r) => r.isStatus === "update" && r.c_code
    );
    const deletedRows = disFormData.filter(
      (r) => r.isStatus === "delete" && r.c_code
    );

    if (
      newRows.length === 0 &&
      updatedRows.length === 0 &&
      deletedRows.length === 0
    ) {
      toast.error("No changes found to save");
      return;
    }

    const payload = { newRows, updatedRows, deletedRows };

    const method = formStatus === "Insert" ? "POST" : "PUT";

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CUSTOMER_TDS_FORM_DATA}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error saving data");
    }

    toast.success("Data saved successfully!");
    handleCancel();
  } catch (error) {
    console.error("Submit error:", error);
    toast.error(error.message || "Something went wrong during save");
  }
};




  // const setupQueryData = useCallback(
  //   (queryData, btnClicked) => {

  //     if (!queryData) return;

  //     const { customerData = [], customerTDSDecData = [], count = 0 } = queryData;

  //      if (count === 0 || customerData.length === 0) {
  //       toast.error("No Record Found");
  //       handleCancel();
  //       return;
  //     }
  //     setFormData(customerData);
  //     setDisFormData(customerTDSDecData);
  //     setTotalRecordCount(count);
  //     setFocusedRowIndex(0);
  //     setFocusedRowIndexDec(0)
  //   },
  //   [handleCancel]
  // );

const setupQueryData = useCallback(
  (queryData, btnClicked) => {
    if (!queryData) return;

    const { customerData = [], customerTDSDecData = [], count = 0 } = queryData;

    if (count === 0 || customerData.length === 0) {
      toast.error("No Record Found");
      handleCancel();
      return;
    }

    //  Add old_trans_year for safety
    const modifiedChildRows = customerTDSDecData.map((row) => ({
      ...row,
      old_trans_year: row.trans_year,   // <—— Important
    }));

    setFormData(customerData);
    setDisFormData(modifiedChildRows);
    setTotalRecordCount(count);

    setFocusedRowIndex(0);
    setFocusedRowIndexDec(0);
  },
  [handleCancel]
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
        QUERY_API={APP_PROD_API.GET_CUSTOMER_TDS_FORM_DATA}
        formName={"Customer TDS Declaration"}
         isQueryReqOnInsertBtn={true}
        isQueryReqOnNextPreBtn={false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form>
             <CustomerTdsDeclarationDetails 
             formData={formData}
             setFormData={setFormData}
             handleChange={handleChange}
             formStatus={formStatus}
             triggerAddRow={triggerAddRow}
             disFormData={disFormData}
             setDisFormData={setDisFormData}
             handleDelete={handleDelete}
             handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              setFocusedRowIndex={setFocusedRowIndex}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndexDec={setFocusedRowIndexDec}
              focusedRowIndexDec={focusedRowIndexDec}
              paginationPage={paginationPage}
              setPaginationPage={setPaginationPage}
              selectedCustomer={selectedCustomer}
              currentCCode={currentCCode}
             />
             {helpList && (
                           <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                             <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                             <ModalBody>
                               <HelpList
                                 formStatus={formStatus}
                                 helpFor={helpFor}
                                 apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CUSTOMER_TDS_FORM_DATA}`}
                                 helpListHeader={helpListHeader}
                                 handleHelpList={handleHelpList}
                                 onSelectHelpItem={onSelectHelpItem}
                                 queryPera={{ needAppGlobalData: 'Y' }}
                               />
                             </ModalBody>
                           </Modal>
                         )}
             </Form> 
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default CustomerTdsDeclaration;

