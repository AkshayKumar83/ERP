import React from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import PurchaseCategoryDefinationHdr from './purchase_category_defination_hdr';
import { checkDuplicatePOPrefix, purCtgDefInitData } from './puchase_category_defination_helper';
import { APP_PROD_API } from '../../../../utils/api';
import HelpList from '../../../../components/HelpList';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { validateForm } from '../../../../utils/fn';

const PurchaseCategoryDefination = () => {
 const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [focusedRowIndex,setFocusedRowIndex] = useState(0)

   const [deleteRecord, setDeleteRecord] = useState([]);

  const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState("");
    const [helpListHeader, setHelpListHeader] = useState([]);
    const [isHelpModelOpen, setIsHelpModelOpen] = useState();
    const toggleHelpModal = () => setHelpList(!helpList);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);

    const { user } = useSelector((state) => state.auth);


  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

   const handleHelpList = (data, rowIndex = -1) => {
    setHelpList(data);
    setSelectedRowIndex(rowIndex);
  };

        //  this commend function is correct 
  /*
  const onSelectHelpItem = (data) => {
    setFormData((prev) => {
      const updatedRows = [...prev];
      const rowIndex = selectedRowIndex ?? focusedRowIndex;
      if (rowIndex < 0) return prev;

      switch (helpFor) {
        case "POCat":
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            po_cat_prefix: data.po_cat_prefix,
            po_cat_prefix_desc: data.po_cat_description,
          };
          break;

        case "frtAccNo":
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            frt_acc_no: data.acc_no,
            acc_desc: data.acc_desc,
          };
          break;
      }
      return updatedRows;
    });
  }; 
       */


    //  in this function i call api for checking duplicate for po_cat_prefix

    const onSelectHelpItem = async (data) => {
      const rowIndex = selectedRowIndex ?? focusedRowIndex;
      if (rowIndex < 0) return;

      let poCatPrefix = "";
      switch (helpFor) {
        case "POCat":
          poCatPrefix = data.po_cat_prefix;
          break;
        case "frtAccNo":
          poCatPrefix = data.acc_no;
          break;
        default:
          break;
      }

      // Frontend duplicate check
      if (helpFor === "POCat") {
        const isFrontendDuplicate = formData.some(
          (row, idx) =>
            idx !== rowIndex && row.po_cat_prefix?.trim().toUpperCase() === poCatPrefix?.trim().toUpperCase()
        );
        if (isFrontendDuplicate) {
          toast.error(`PO_Cat_Prefix "${poCatPrefix}" already used!.`);
          return;
        }

        // Backend duplicate check
        const isBackendDuplicate = await checkDuplicatePOPrefix(poCatPrefix);
        if (isBackendDuplicate) return; // stop if exists in DB
      }

      //  Update formData
      setFormData((prev) => {
        const updatedRows = [...prev];
         const currentRow = updatedRows[rowIndex];
        switch (helpFor) {
          case "POCat":
            updatedRows[rowIndex] = {
              ...updatedRows[rowIndex],
              ...currentRow,
              po_cat_prefix: data.po_cat_prefix,
              po_cat_prefix_desc: data.po_cat_description,
              isStatus: currentRow.isStatus === "insert" ? "insert" : "update"
            };
            break;
          case "frtAccNo":
            updatedRows[rowIndex] = {
              ...updatedRows[rowIndex],
              ...currentRow,
              frt_acc_no: data.acc_no,
              acc_desc: data.acc_desc,
              isStatus: currentRow.isStatus === "insert" ? "insert" : "update"
            };
            break;
        }
        return updatedRows;
      });
    };


  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData([]);
    setDeleteRecord([]);
  }, []);

      const handleChange = useCallback((name, value, index, event) => {
        if (!["Insert", "Update", "Search"].includes(formStatus)) return;

         if (["po_cat_prefix", "frt_acc_no"].includes(name)) {
    toast.error("Please select value from help list only");
    return; 
  }
  
        const cursorPosition = event.target.selectionStart;
        let newVal = value.toUpperCase();

        setFormData((prevData) => {
          const newData = [...prevData];
          newData[index] = { 
            ...newData[index], 
            [name]: newVal,
            // agar row insert wali hai to override na ho, warna update mark karo
            // isStatus: newData[index].isStatus === "insert" ? "insert" : "update"
          };
          return newData;
        });

          setTimeout(() => {
            event.target.setSelectionRange(cursorPosition, cursorPosition);
          }, 0);
        }, [formStatus]);


   const triggerAddRow = () => {
     const purchCtgyDfnt = validateForm(
              "pur-ctg-defination",
              "Purchase Category Defination"
            );
            if (!purchCtgyDfnt) return;
      setFormData((prev) => [
        ...prev,
        { 
          ...purCtgDefInitData, 
          isStatus: "insert", 
          division_id: user?.global_division_id || null 
        }
      ]);
      setFocusedRowIndex(formData.length);
    };

 const handleDelete = useCallback((rowIndex) => {
    setFormData((prevData) => {
      const deletedRow = prevData[rowIndex];
      if (deletedRow && deletedRow.isStatus !== "insert") {
        // agar pehle se DB me thi to hi deleteRecord me daalo
        setDeleteRecord((prev) => [...prev, { ...deletedRow, isStatus: "delete" }]);
      }
      const updated = prevData.filter((_, i) => i !== rowIndex);
      return updated.length > 0 ? updated : [{ ...purCtgDefInitData }];
    });

    setFocusedRowIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

const setupQueryData = useCallback((queryData, btnClicked) => {
  setFormData(queryData?.purchCtgyDfnt);

  if (btnClicked === "Query") {
    setTotalRecordCount(queryData?.count);

    if (!queryData?.purchCtgyDfnt?.length) {
      toast.error(queryData.message || "No data found");
      handleCancel()
      return;
    }
  }

  setFocusedRowIndex(0);
}, [formStatus, currentRecordNo]);


    const handleSubmit = async(e)=>{
    e.preventDefault();
     if (!["Insert", "Update"].includes(formStatus)) return;
     try {
      
          
       const purchCtgyDfnt = validateForm("pur-ctg-defination", "Purchase Category Defination");
            if (!purchCtgyDfnt) return;

      const payload = { formData, deleteRecord };

     let method = formStatus === "Insert" ? "POST" : "PUT";

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_PURCH_CTGY_DFNT_FORM_DATA}?form_status=${formStatus}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Can't fetching error while submiting data. ");
      }

      toast.success(`Data saved successfully!`);
      handleCancel();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator"
      );
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
        QUERY_API={APP_PROD_API.GET_PURCH_CTGY_DFNT_FORM_DATA}
        formName={"Purchase Category Defination"}
        isQueryReqOnInsertBtn = {true}
        isQueryReqOnNextPreBtn = {false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
              <PurchaseCategoryDefinationHdr 
              formData={formData}
              setFormData={setFormData}
              formStatus={formStatus}
              handleChange={handleChange}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDelete}
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
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_PURCH_CTGY_DFNT_FORM_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: 'Y' }}
                    whereClause = {{}}
                  />
                </ModalBody>
              </Modal>
            )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PurchaseCategoryDefination
