import React from 'react'
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast";
import EfaDetail from './efa_detail';
import { efaDetailFormDataInitTempate } from './efa_helper';
import { APP_PROD_API } from '../../../../utils/api';
import HelpList from '../../../../components/HelpList';


const EfaMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [efaDetailData, setEfaDetailData] = useState([{...efaDetailFormDataInitTempate}]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [changedData, setChangedData] = useState([]);
  const [deletedEfaDetails, setDeletedEfaDetails] = useState([]);


   const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // FOR HELP LIST
  const [helpList, setHelpList] = useState(false) // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState('') //fieldName for helpList you want
  const [helpListHeader, setHelpListHeader] = useState([])

  const toggleHelpModal = () => setHelpList(!helpList)

  // Update Form Data payload Structure 
  const [updateFormPayload, setUpdateFormPayload] = useState({})



  const tabs = ["EFA Master"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

   // HELP LIST HANDLING
   const handleHelpList = (show) => {
    setHelpList(show);
  };

  // HELP LIST OPENING
  const openHelpList=(fieldName, helpListHeader, index = null)=>{
    if(['Insert', 'Update'].includes(formStatus)){
      setHelpFor(fieldName)
      setHelpListHeader(helpListHeader)
      setHelpList(true);
      // setRecordIndex(index);
    }
  }


  const onSelectHelpItem = (data) => {
    const index = focusedRowIndex;
  
    if (helpFor === "acc_no") {
      setEfaDetailData((prevData) => {
        const newData = [...prevData];
        const currentRow = newData[index];
        const loanId = currentRow.loan_id;
  
        const updatedRow = {
          ...currentRow,
          acc_no: data.acc_no,
          acc_desc: data.acc_desc
        };
  
        newData[index] = updatedRow;
  
        // ✅ Track changes in Update mode
        if (formStatus === "Update" && loanId) {
          setChangedData(prev => {
            const updatedChanges = [...prev];
            const existingIndex = updatedChanges.findIndex(obj => obj.loan_id === loanId);
  
            if (existingIndex !== -1) {
              updatedChanges[existingIndex] = {
                ...updatedChanges[existingIndex],
                acc_no: data.acc_no,
                acc_desc: data.acc_desc
              };
            } else {
              updatedChanges.push({
                loan_id: loanId,
                acc_no: data.acc_no,
                acc_desc: data.acc_desc
              });
            }
  
            return updatedChanges;
          });
        }
  
        return newData;
      });
    }
  };
  


  const handleAddTableRecord = useCallback(() => {
    setEfaDetailData((prevData) => [ ...prevData, { ...efaDetailFormDataInitTempate, row_id: prevData.length + 1,},]);
  }, [efaDetailData.length]);

  //DELETE ROW
  const handleDeleteEfaDetail = (index) => {
    setEfaDetailData((prevData) => {
      const itemToDelete = prevData[index];
  
      // If loan_id exists, mark it for deletion
      if (itemToDelete.loan_id) {
        setDeletedEfaDetails((prevDeleted) => [...prevDeleted, itemToDelete]);
      }
  
      const updatedData = [...prevData];
      updatedData.splice(index, 1);
  
      return updatedData.length > 0 ? updatedData : [{ ...efaDetailFormDataInitTempate }];
    });
  };
  


  const handleSubmit = async (e) => {
      e.preventDefault();

      ////console.log(efaDetailData);
      let newEfaRecord = efaDetailData.filter((item) => item?.loan_id === "");
      ////console.log("newEfaRecord", newEfaRecord);

      try {
      
          if (formStatus === "Update" && !changedData.length && !newEfaRecord.length && !deletedEfaDetails.length) {
            toast.warning("No changes to submit.");
            return;
          }
          if (formStatus === "Update") {

            ////console.log("Changed Data to send:", changedData);
            ////console.log('delete data : ', deletedEfaDetails)
            
              const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_EFA_MSTR_DATA}`,
                  {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                          newEfaData: newEfaRecord,
                          updatedEfaData: changedData,
                          deletedEfaData:deletedEfaDetails,
                      }),
                      credentials:'include',
                  }
              );
              const responseData = await response.json();
              toast.success("Data updated successfully");
              formCleanup()
              // ////console.log("[Updated]:: ", responseData);
          } else {
              const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_EFA_MSTR_DATA}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        newRecord: newEfaRecord
                    }),
                    credentials:'include',
                  }
              );
              const responseData = await response.json();
              toast.success("Data submitted successfully");
              formCleanup()
              // ////console.log("[Inserted]:: ", responseData);
          }
      } catch (error) {
          toast.error(
              error?.message || "Some error occurred, please try again"
          );
      }
  };  


  function handleOffset(data) {
    setCurrentRecordNo(data)
  }  

  function formCleanup () {
    releaseFormStatus()
    setEfaDetailData([{}]);
    setFocusedRowIndex(0) 
  };

  const handleCancel = useCallback(() => {
   formCleanup();
  }, []);


  const handleChange = useCallback((type, e, name, value, rowIndex = null) => {
    const cursorPosition = e?.target?.selectionStart;
  
    switch (type) {
      case "formData":
        setFormData(prev => ({ ...prev, [name]: value }));
        break;
  
      case "efaDetail":
        setEfaDetailData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            const newData = [...prev];
            const updatedValue = typeof value === "string" ? value.toUpperCase() : value;
  
            const previousValue = newData[rowIndex][name];
            const currentRow = newData[rowIndex];
            const loanId = currentRow.loan_id;
  
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: updatedValue
            };
  
            // 🔥 Grouping changes by loan_id
            if (loanId && previousValue !== updatedValue) {
              setChangedData(prevChanges => {
                const updatedChanges = [...prevChanges];
                const existingIndex = updatedChanges.findIndex(obj => obj.loan_id === loanId);
  
                if (existingIndex !== -1) {
                  // Update existing entry for this loan_id
                  updatedChanges[existingIndex][name] = updatedValue;
                } else {
                  // Add new entry
                  updatedChanges.push({
                    loan_id: loanId,
                    [name]: updatedValue
                  });
                }
  
                return updatedChanges;
              });
            }
  
            return newData;
          } else {
            return prev.map(row => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value
            }));
          }
        });
        break;
  
      default:
        break;
    }
  
    if (
      e?.target &&
      e.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(e.target.type)
    ) {
      setTimeout(() => {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, []);
  
  

  const setupQueryData = (queryData, btnClicked) => {

    if (['Insert', 'Query'].includes(btnClicked)) {
      if(queryData?.efaDetailData.length === 0) {
        toast.error('No Record Found')
        return
      }
      setEfaDetailData(queryData?.efaDetailData);
      // ////console.log("query data:", queryData);
    }

    // ////console.log("currentRecordNo:", currentRecordNo);
    setTotalRecordCount(queryData?.efaDetailData.length || totalRecordCount);
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
        isQueryReqOnInsertBtn = {true}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_EFA_MSTR_DATA}
        formName={""}
         isQueryReqOnNextPreBtn={false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <EfaDetail
              formData={efaDetailData}
              formStatus={formStatus}
              handleChange={(e, name, value, rowIndex)=>handleChange('efaDetail', e, name, value, rowIndex)}
              handleAddRow={handleAddTableRecord}
              handleDeleteRow={handleDeleteEfaDetail}
              handleHelpList={handleHelpList}
              openHelpList={openHelpList}
              onSelectHelpItem={onSelectHelpItem}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={(data)=>setFocusedRowIndex(data)}
            />

            {helpList && (
              <Modal id="help-list-modal" isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={ `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EFA_MSTR_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{needAppGlobalData:'Y'}}
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

export default EfaMaster;

