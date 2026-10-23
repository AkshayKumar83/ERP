import React, { useEffect } from 'react'
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ItemMinMaxStockLevelMain from './Item_min_max_stock_level_main';
import { controlInitData, itemMinMaxInitData } from './Item_min_max_stock_level_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import toast from 'react-hot-toast';


const ItemMinMaxStockLevel = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{...itemMinMaxInitData}]);
  const [controlData, setControlData] = useState({...controlInitData})
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
      const [deletedRow, setDeletedRow] = useState([]);

      const [itemType, setItemType] = useState([]);
      const [itemBase, setItemBase] = useState([]);
      const [itemSubCat, setItemSubCat] = useState([]);
      const [paginationPage, setPaginationPage] = useState(1);

  const tabs = ["Item Min. Max. Stock Level"];

    const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  //dropdowndata
// Level1 load on formStatus
  useEffect(() => {
    const fetchLevel1 = async () => {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_DROPDOWN_DATA}`,{credentials: 'include' });
      const data = await response.json();
      setItemType([{ value: "", label: "" }, ...formatOptions(data.level1 || [], "level1","cat_desc",)]);
    };

    if (formStatus) fetchLevel1();
   }, [formStatus]);

   
// Level2 load based on Level1 selection
  useEffect(() => {
    const fetchLevel2 = async () => {
      if (controlData.level1) {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_DROPDOWN_DATA}?level1=${controlData.level1}`, { credentials: 'include' });
        const data = await response.json();
        setItemBase([{ value: "", label: "" }, ...formatOptions(data.level2 || [],  "level2","cat_desc")]);
        setItemSubCat([]);  // reset level3
      } else {
        setItemBase([]);
        setItemSubCat([]);
      }
    };

    fetchLevel2();
   }, [controlData.level1]);

// Level3 load based on Level1 + Level2 selection
  useEffect(() => {
    const fetchLevel3 = async () => {
      if (controlData.level1 && controlData.level2) {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_DROPDOWN_DATA}?level1=${controlData.level1}&level2=${controlData.level2}`, { credentials: 'include' });
        const data = await response.json();
        setItemSubCat([{ value: "", label: "" }, ...formatOptions(data.level3 || [], "level3","cat_desc", )]);
      } else {
        setItemSubCat([]);
      }
    };

    fetchLevel3();
   }, [controlData.level1, controlData.level2]);
     
      // filter data acc to select filed and item acc showing in UI table
  useEffect(() => {
   const fetchFilteredItems = async () => {
    const params = new URLSearchParams({
      level1: controlData.level1 || '',
      level2: controlData.level2 || '',
      level3: controlData.level3 || '',
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_FILTER_DATA}?${params}`, {
        credentials: 'include'
      });

      const data = await response.json();

     if (data?.type === "found") {
      setFormData(data.itemMinMaxStockLevel);
    } else if (data?.type === "empty") {
      setFormData([]);
      toast.error(data.message); 
    } else {
      setFormData([]);
    }

    } catch (error) {
      console.error("Error fetching item data:", error);
    }
  };

  if (controlData.level1 || controlData.level2 || controlData.level3) {
    fetchFilteredItems();
  }

    }, [controlData.level1, controlData.level2, controlData.level3]);


  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData([]);
    setDeletedRow([]);
    setControlData({...controlInitData});
    setPaginationPage(1);
  }, []);


//    const handleChange = useCallback((name, value, index, event) => {
//   if (!["Update"].includes(formStatus)) return;

//   const cursorPosition = event?.target?.selectionStart;
//   let newVal = value;

//   // For decimal fields
//   if (["min_stock", "max_stock", "optimumstk"].includes(name)) {
//     // allow empty (user cleared field)
//     if (newVal === '') {
//       newVal = null;
//     } else {
//       const regex = /^\d*\.?\d{0,2}$/;
//       if (!regex.test(newVal)) return;
//       newVal = Number(newVal); // convert to number
//     }
//   }

//   // For integer days fields
//   if (["min_stock_days", "max_stock_days", "optimumstk_days"].includes(name)) {
//     if (newVal === '') {
//       newVal = null;
//     } else {
//       const regex = /^\d*$/;
//       if (!regex.test(newVal)) return;
//       newVal = Number(newVal); // convert to number
//     }
//   }

//   // String fields to uppercase
//   if (typeof newVal === "string" && !["min_stock", "max_stock", "optimumstk", "min_stock_days", "max_stock_days", "optimumstk_days"].includes(name)) {
//     newVal = newVal.toUpperCase();
//   }

//   setFormData(prev => {
//     const updatedRows = [...prev];
//     updatedRows[index] = { ...updatedRows[index], [name]: newVal,isStatus: 'update' };
//     return updatedRows;
//   });

//   if (event && event.target && event.target.type === "text") {
//     setTimeout(() => {
//       event.target.setSelectionRange(cursorPosition, cursorPosition);
//     }, 0);
//   }
// }, [formStatus]);

const handleChange = useCallback((name, value, index, event) => {
  if (!["Update"].includes(formStatus)) return;

  const cursorPosition = event?.target?.selectionStart;
  let newVal = value;

  setFormData(prev => {
    const updatedRows = [...prev];
    const row = { ...updatedRows[index] };

    // Prevent filling dependent fields if max_stock or max_stock_days not filled
    const maxStockFilled = row.max_stock !== null && row.max_stock !== undefined;
    const maxStockDaysFilled = row.max_stock_days !== null && row.max_stock_days !== undefined;

    const dependentFields = ["min_stock", "optimumstk", "min_stock_days", "optimumstk_days"];
    if (dependentFields.includes(name) && (!maxStockFilled || !maxStockDaysFilled)) {
      toast.error("Please fill max_stock and max_stock_days first!");
      return prev; // ignore the change
    }

    // For decimal fields
    if (["min_stock", "max_stock", "optimumstk"].includes(name)) {
      if (newVal === '') {
        newVal = null;
      } else {
        const regex = /^\d*\.?\d{0,2}$/;
        if (!regex.test(newVal)) return prev;
        newVal = Number(newVal);
      }
    }

    // For integer days fields
    if (["min_stock_days", "max_stock_days", "optimumstk_days"].includes(name)) {
      if (newVal === '') {
        newVal = null;
      } else {
        const regex = /^\d*$/;
        if (!regex.test(newVal)) return prev;
        newVal = Number(newVal);
      }
    }

    // String fields to uppercase
    if (typeof newVal === "string" && !["min_stock", "max_stock", "optimumstk", "min_stock_days", "max_stock_days", "optimumstk_days"].includes(name)) {
      newVal = newVal.toUpperCase();
    }

    row[name] = newVal;
    row.isStatus = "update";
    updatedRows[index] = row;
    return updatedRows;
  });

  if (event && event.target && event.target.type === "text") {
    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  }
}, [formStatus]);


  const handleControlChange = (name, value) => {
      if (name === "level1") {
        setControlData(prev => ({
          ...prev,
          level1: value,
          level2: "",
          level3: ""
        }));
      } else if (name === "level2") {
        setControlData(prev => ({
          ...prev,
          level2: value,
          level3: ""
        }));
      } else {
        setControlData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };

      function handleDelete(rowData, rowIndex) {
    // const updatedRows = formData.filter((row, index) => index === rowIndex);
    
    if (rowData?.it_code) {
      setDeletedRow((prev) => [...prev, rowData]);
    }

    setFormData((prev) =>{
      let newformData = prev
      let curntRow = {...newformData[rowIndex], max_stock:null, max_stock_days:null,min_stock:null, min_stock_days:null,optimumstk:null, optimumstk_days:null}
      newformData[rowIndex]= curntRow
      return newformData
      
    });
  }


  const setupQueryData = useCallback(
      (queryData, btnClicked) => {
        
      },
      [formStatus, currentRecordNo]
  );


  const validateBeforeSubmit = (formData) => {
  for (let i = 0; i < formData.length; i++) {
    const row = formData[i];

    if (row.min_stock != null && row.max_stock != null && row.min_stock > row.max_stock) {
      toast.error(` Minimum Stock cannot be greater than Maximum Stock`);
      return false;
    }

    if (row.min_stock_days != null && row.max_stock_days != null && row.min_stock_days > row.max_stock_days) {
      toast.error(` Minimum Stock Days cannot be greater than Maximum Stock Days`);
      return false;
    }

    if (row.optimumstk != null && row.max_stock != null && row.optimumstk > row.max_stock) {
      toast.error(` Optimum Stock cannot be greater than Maximum Stock`);
      return false;
    }

    if (row.optimumstk_days != null && row.max_stock_days != null && row.optimumstk_days > row.max_stock_days) {
      toast.error(` Optimum Stock Days cannot be greater than Maximum Stock Days`);
      return false;
    }
  }

  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
    
  try {

  if (!validateBeforeSubmit(formData)) {
    return;
  }

  const rowsToSubmit = formData.filter(row => row.isStatus);

    if (rowsToSubmit.length === 0 && deletedRow.length === 0) {
      throw new Error("No rows to submit. Please update / delete at least one row.");
    }
  
    const body = { formData: rowsToSubmit, deletedRow };

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_DATA}?form_status=${formStatus}`,
      {
        method: 'PUT', 
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit form.');
    }

    const result = await response.json();
    toast.success('Form submitted successfully.');
    handleCancel();

  } catch (error) {
    console.error('Submit error:', error.message);
    toast.error(error.message || 'Something went wrong.');
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
        QUERY_API={APP_PROD_API.GET_ITEM_MIN_MAX_STOCK_DATA}
        formName={"Item min max stock level"}
        authority = {{query:"N",insert: "N", update: "Y" }}
        btnEnableDtl={{ search:false, insert:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <ItemMinMaxStockLevelMain 
            controlData={controlData}
            formData={formData}
            setFormData={setFormData}
            formStatus= {formStatus}
            handleControlChange={handleControlChange}
            handleChange= {handleChange}
            itemBase={itemBase}
            itemType={itemType}
            itemSubCat ={itemSubCat}
            focusedRowIndex={focusedRowIndex}
            setFocusedRowIndex={setFocusedRowIndex}
            paginationPage={paginationPage}
            setPaginationPage={setPaginationPage}
            handleDelete={handleDelete}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ItemMinMaxStockLevel;

