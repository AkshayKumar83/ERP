import React, { useEffect } from 'react'
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import UnitConversionMasterDetails from './unit_conversion_mstr_dtl';
import {  checkDuplicateFromToID, unitConversionData } from './unit_conversion_mstr_helper';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import { formatOptions } from '../../../../lib';
import { validateForm } from '../../../../utils/fn';


  const UnitConversionMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
 
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);


  
  // BELOW STATE USED FOR DROPDOWN INPUTS
  const [fromUnitList,setFromUnitList] = useState([])
  const [toUnitList,setToUnitList ] = useState([])

  const tabs = ["Unit Conversion Master"];


useEffect(() =>{
   // HERE I FETCH ALL REQUIRED DROPDOWN DATA
          // REQURIED DATA FOR MAKING THE FORM AUTO OR MANUAL

           const fetchConstantList = async () =>{
            try {
              const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_UNIT_CONVERSION_MSTR_LIST_OF_CONSTANTS}`,{
                credentials:'include'
              })
              if(response.status === 200) {
                const data = await response.json();
                setFromUnitList([{value:'', label:''}, ...formatOptions(data.fromUnitList || [],"unit_id", "unit" )])
                setToUnitList([{value:'', label:''}, ...formatOptions(data.toUnitList || [],"unit_id", "unit" )])
              }
            } catch (error) {
              console.log(error);
            }
           }
           if (formStatus){
            fetchConstantList();
           }

},[formStatus])


  const setupQueryData = useCallback((queryData, btnClicked) => {
    if (queryData?.count > 0) {
        const mappedData = queryData.unitConvMaster.map(row => ({
            ...row,
            old_from_id: row.from_id,
            old_to_id: row.to_id,
            isNew: false,
            isDeleted: false
        }));

        setFormData(mappedData);
    }
        setFocusedRowIndex(0)
    if (btnClicked === 'Query') {
        if (queryData?.count === 0) {
          handleCancel();
          setFormData([]);
         toast.error('No Data Record Found');
        }
        setTotalRecordCount(queryData?.count);
    }
}, [formStatus, currentRecordNo]);


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


const handleSubmit = async (e) => {
    e.preventDefault();
    if (!['Insert', 'Update'].includes(formStatus)) {
      return;
    }
    try {
      const isValidFormData = validateForm("unit-conversion-mstr-form", "Unit Conversion Master Form");
      if (!isValidFormData) return;

      //  DUPLICATE CHECK (UI LEVEL)
      const combinationMap = {};
      let localDuplicateFound = false;

      for (let i = 0; i < formData.length; i++) {
        const row = formData[i];
        if (row.isDeleted) continue;

        const key = `${row.from_id}_${row.to_id}`;

        if (combinationMap[key]) {
          localDuplicateFound = true;
          break;
        }
        combinationMap[key] = true;
      }

      if (localDuplicateFound) {
        toast.error('Duplicate row found From Id & To Id ');
        return; 
      }

      //  BACKEND DUPLICATE CHECK (ONLY FOR NEW ROWS)
      for (const row of formData) {
        if (row.isNew && !row.isDeleted && row.from_id && row.to_id) {
          const { exists } = await checkDuplicateFromToID({
            from_id: parseInt(row.from_id, 10),
            to_id: parseInt(row.to_id, 10),
            formStatus,
          });
          if (exists) {
            toast.error(`Duplicate found in database for From ID: ${row.from_id}, To ID: ${row.to_id}`);
            return; 
          }
        }
      }

      let payload = {};
      let method;

    

      if (formStatus === "Insert") {
  const newRows = formData.filter(row => row.isNew && !row.isDeleted);
  if (newRows.length === 0) {
    toast.error("No new rows to submit.");
    return;
  }
  payload = { newRows };
  method = "POST";

} else if (formStatus === "Update") {
  const newRows = formData.filter(row => row.isNew && !row.isDeleted);
  const updatedRows = formData.filter(row => row.isUpdated && !row.isDeleted);
  const deletedRows = formData.filter(row => row.isDeleted);

  if (newRows.length === 0 && updatedRows.length === 0 && deletedRows.length === 0) {
    toast.error("No changes to submit. At least one row should be updated, inserted, or deleted.");
    return;
  }

  payload = { newRows, updatedRows, deletedRows };
  method = "PUT";
}

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_UNIT_CONVERSION_MSTR_FORM_DATA}?form_status=${formStatus}`, {
        method: method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": 'application/json' },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (data.type === "success") {
        toast.success("Data saved successfully!");
        formCleanup();
      } else {
        console.error("Error:", data.message);
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error(error.message || "Please check all the form fields or contact administrator");
    }
};



  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

 const formCleanup = () => {
    setFormData([]);
    releaseFormStatus();
}


  const handleChange = useCallback((name, value, index, event = null) => {
  if (!["Insert", "Update", "Search"].includes(formStatus)) return;

  let newVal = value.toUpperCase();

  setFormData((prevData) => {
    const newData = [...prevData];
    const row = { ...newData[index], [name]: newVal };

    // ✅ Set isUpdated if existing row is changed
    if (!row.isNew) row.isUpdated = true;

    newData[index] = row;
    return newData;
  });

  // cursor fix
  if (event?.target && event.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(event.target.type)) {
    setTimeout(() => {
      event.target.setSelectionRange(event.target.selectionStart, event.target.selectionStart);
    }, 0);
  }
}, [formStatus]);


// const triggerAddRow = useCallback(() => {
//     const lastRow = formData[formData.length - 1];

//       const isValidFormData = validateForm("unit-conversion-mstr-form", "Unit Conversion Master Form");
//       if (!isValidFormData) return;


//     // Local duplicate check (form ke andar hi check karte hain)
//     const combinationMap = {};
//     let isDuplicate = false;

//     for (let i = 0; i < formData.length; i++) {
//       const row = formData[i];
//       if (row.isDeleted) continue;

//       const key = `${row.from_id}_${row.to_id}`;

//       if (combinationMap[key]) {
//         isDuplicate = true;
//         break;
//       }
//       combinationMap[key] = true;
//     }

//     if (isDuplicate) {
//       toast.error('The current row you have filled  FromId & ToId is  duplicate. Please correct it before adding a new row.', { id: 'duplicate-error' });
//       return;
//     }

//     // If no duplicate, add new row
//     setFormData((prev) => {
//       const newData = [...prev, { ...unitConversionData, isNew: true }];
//       setFocusedRowIndex(newData.length - 1);
//       return newData;
//     });
//   }, [formData]);

const triggerAddRow = useCallback(() => {
  const validFormData = Array.isArray(formData) ? formData : [];
  
  const isValidFormData = validateForm("unit-conversion-mstr-form", "Unit Conversion Master Form");
  if (!isValidFormData) return;

  // duplicate check...
  const combinationMap = {};
  let isDuplicate = false;

  for (let i = 0; i < validFormData.length; i++) {
    const row = validFormData[i];
    if (row.isDeleted) continue;
    const key = `${row.from_id}_${row.to_id}`;
    if (combinationMap[key]) {
      isDuplicate = true;
      break;
    }
    combinationMap[key] = true;
  }

  if (isDuplicate) {
    toast.error('The current row you have filled FromId & ToId is duplicate. Please correct it before adding a new row.');
    return;
  }

  setFormData((prev = []) => {
    const newData = [...prev, { ...unitConversionData, isNew: true }];
    setFocusedRowIndex(newData.length - 1);
    return newData;
  });
}, [formData]);

  

  const handleDelete = useCallback((rowIndex) => {
  setFormData((prevData) => {
    const newData = [...prevData];
    const row = newData[rowIndex];

    if (row.isNew) {
      // remove new rows
      newData.splice(rowIndex, 1);
    } else {
      // mark existing rows as deleted
      newData[rowIndex] = { ...row, isDeleted: true };
    }
    return newData;
  });

  setFocusedRowIndex(prev => (prev === rowIndex && prev > 0 ? prev - 1 : prev));
}, []);


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
        QUERY_API={APP_PROD_API.GET_UNIT_CONVERSION_MSTR_FORM_DATA}
        formName={"Unit Conversion Master"}
        isQueryReqOnInsertBtn = {true}
        isQueryReqOnNextPreBtn = {false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <UnitConversionMasterDetails 
            formData={formData}
            handleChange={handleChange}
            formStatus={formStatus}
            triggerAddRow={triggerAddRow}
            handleDelete={handleDelete}
            fromUnitList={fromUnitList}
            toUnitList={toUnitList}
             focusedRowIndex={focusedRowIndex}
             setFocusedRowIndex={setFocusedRowIndex}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UnitConversionMaster;