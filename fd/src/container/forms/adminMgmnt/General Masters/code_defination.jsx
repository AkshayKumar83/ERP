import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import { APP_PROD_API } from "../../../../utils/api"
import CodeDefinitionDetail from './code_definition_Dtl';
import { catTypeInitialFormDataTemplate } from './code_definitionHelpers.js';
import { validateForm } from "../../../../utils/fn";
import toast from 'react-hot-toast';


const CodeDefination = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ cat_group: "", cat_desc: "" });
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [categoryTypeData, setCategoryTypeData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [categoryTypeMap, setCategoryTypeMap] = useState({});

  const [updatedCatTypeData, setUpdatedCatTypeData] = useState([]);
  const [deletedCatTypeData, setDeletedCatTypeData] = useState([]);

  const [categoryData, setCategoryData] = useState([]);
  const { loading, setLoading, formLoading, setFormLoading } = useFormLoading(); 

   const [catDesc, setCatDesc] = useState([]);
    const [focusedRowIndex, setFocusedRowIndex] = useState(0);

    const [page, setPage] = useState(1);
    const [limit] = useState(50);  
    const [totalPages, setTotalPages] = useState(1);

  const tabs = ["Code Definition"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const normalizeText = (value) => {
  return value
    ?.trim()
    ?.toUpperCase()
    ?.replace(/\s+/g, " ");  //  (multiple spaces → single)
};

  const isDuplicateDescription = (rows, value, rowIndex) => {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) return false;

  return rows.some((row, index) => {
    if (index === rowIndex) return false;

    return normalizeText(row.description) === normalizedValue;
  });
};



  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CODE_DEFINITION_DROPDOWNDATA}`,
          {credentials:'include',}
        );
        if (resp.status === 200) {
          const data = await resp.json();
          setCategoryData(data);

          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    if (formStatus !== "") {
      fetchCategoryData();
    }
    setLoading(false);
  }, [formStatus]);

//   useEffect(() => {
//     if (selectedCategory) { 

//       // Check if we already have data for selectedCategory
//     if (categoryTypeMap[selectedCategory]) {
//       setCategoryTypeData(categoryTypeMap[selectedCategory]);
//       return;
//     }

//       // const fetchCatTypeDetailData = async () => {
//       //   const response = await fetch(
//       //     `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CODE_DEFINITION_TYPE_DETAILDATA}?cat_group=${selectedCategory}`,
//       //     {credentials:'include',}

//       //   );
//       //   const result = await response.json();
//       //   if (result.type === "found") {
//       //     const hasCatTypeData = result?.catTypeData?.length > 0;
//       //     setCategoryTypeData(
//       //       hasCatTypeData
//       //         ? result?.catTypeData
//       //         : [catTypeInitialFormDataTemplate]
//       //     );
//       //      setFocusedRowIndex(0); 
//       //   } else if (result.type === "created") {
//       //     setCategoryTypeData([catTypeInitialFormDataTemplate]);
           
//       //      setCategoryTypeMap(prev => ({
//       //   ...prev,
//       //   [selectedCategory]: newData,
//       // }));
//       //  setFocusedRowIndex(0); 
    
//       //   }
//       // }; 

//       const fetchCatTypeDetailData = async () => {
//   try {

//     const response = await fetch(
//     `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CODE_DEFINITION_TYPE_DETAILDATA}?cat_group=${selectedCategory}&page=${page}&limit=${limit}`,
//     { credentials: "include" }
//   );

//     const result = await response.json();

//     if (result.type === "found") {

//       setCategoryTypeData(result.catTypeData || []);

//       setTotalPages(result.totalPages || 1);

//       setFocusedRowIndex(0);

//     } else {

//       setCategoryTypeData([]);

//     }

//   } catch (err) {
//     console.log(err);
//   }
// };
//          // Store data in map
       
//           if (formStatus !== "") {
//       fetchCatTypeDetailData();
//     }
    
//       //fetchCatTypeDetailData();
//     }
//   }, [selectedCategory, formStatus, page]);

  useEffect(() => {
   if (!selectedCategory || formStatus === "") return;

   const fetchCatTypeDetailData = async () => {
      try {
         const response = await fetch(
            `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CODE_DEFINITION_TYPE_DETAILDATA}?cat_group=${selectedCategory}&page=${page}&limit=${limit}`,
            { credentials: "include" }
         );

         const result = await response.json();

         if (result.type === "found") {
            setCategoryTypeData(result.catTypeData || []);
            setTotalPages(result.totalPages || 1);
            setFocusedRowIndex(0);
         }
      } catch (err) {
         console.log(err);
      }
   };

   fetchCatTypeDetailData();

}, [selectedCategory, page, formStatus]);   

  function formCleanup() {
    //setFormData({});
     setFormData({ cat_group: "", cat_desc: "" });
    setCategoryData([])
    setSelectedCategory("");
    setCategoryTypeData([{ ...catTypeInitialFormDataTemplate }])
    setCatDesc([])
    releaseFormStatus()
  };


  async function handleSubmit(e) {
  e.preventDefault();
  try {
    setFormLoading(true);

    const isValidCategoryForm = validateForm('code-defination-category-form', 'codeDefinationCategory');
    if (!isValidCategoryForm) return;

    const isValidCategoryTypeForm = validateForm('code-defination-cat-type-form', 'codeDefinationCatTypes');
    if (!isValidCategoryTypeForm) return;

    const currentCatTypeData = categoryTypeMap[selectedCategory] || [];
    let formPayload = {};

    // if (formStatus === 'Insert') {
    //   const newRecords = currentCatTypeData.filter(item => !item.hasOwnProperty('create_id'));
    //   if (!newRecords.length) {
    //     toast.error('There should be at least a New Entry for submit');
    //     return;
    //   }
    //   formPayload = {
    //     cat_group: selectedCategory,
    //     newCatType: newRecords,
    //   };
    //   console.log(formPayload);
    // }

    if (formStatus === 'Insert') {

  const newRecords = currentCatTypeData.filter(item => {

    const isNewRow = !item.code || item.code.trim() === "";
    const hasDescription = item.description && item.description.trim() !== "";

    return isNewRow && hasDescription;

  });

  if (!newRecords.length) {
    toast.error('There should be at least one valid entry');
    return;
  }

  formPayload = {
    cat_group: selectedCategory,
    newCatType: newRecords,
  };
}

    if (formStatus === 'Update') {
      //  const newRecords = currentCatTypeData.filter(item => !item.hasOwnProperty('create_id'));
      // if (!newRecords.length && !updatedCatTypeData.length && !deletedCatTypeData.length) {
      //   toast.error('There should be an Update/Delete/New Entry for Submit');
      //   return;
      // }

      const newRecords = currentCatTypeData.filter(item => {

  const isNewRow = !item.code || item.code.trim() === "";
  const hasDescription = item.description && item.description.trim() !== "";

  return isNewRow && hasDescription;

});
      formPayload = {
        cat_group: selectedCategory,
        newCatType: [...newRecords],
        updatedCatType: [...updatedCatTypeData],
        deletedCatType: [...deletedCatTypeData],
      };
      console.log( "formpayload",formPayload); 
      
    } 
   // setDeletedCatTypeData([])

    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.SUBMIT_CODE_DEFINITION_DATA}?form_status=${formStatus}`, {
      method: "POST",
      body: JSON.stringify(formPayload),
      headers: { "Content-Type": "application/json" },
       credentials:'include',
    });

    if (response.ok) {
      toast.success("Data successfully saved");
     handleCancel();
      setDeletedCatTypeData([])
    } else {
      const errorMsg = await response.json();
      toast.error(errorMsg?.message);
    }

  } catch (error) {
    toast.error(error?.message || "Please check all the form fields or contact administrator");
  } finally {
    setFormLoading(false);
  }
}


  // update category row
  const handleUpdateRow = useCallback((data) => {
    console.log(data);
    let updatedPoCategory = [...updatedCatTypeData];

    if (!data?.create_date) {
      return;
    }
    // checking if the updated data came again for update
    const existingRecord = updatedPoCategory.some(record =>
      Object.keys(record).every(key => record[key] === data[key])
    );

    if (existingRecord) {
      return;
    }

    updatedPoCategory.push(data);
    setUpdatedCatTypeData(updatedPoCategory);
  }, [updatedCatTypeData]);



  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  // const handleCancel = useCallback(() => {
  //   // Implement cancel logic here
  //   releaseFormStatus()
  //   setFormData({});
  //  setCategoryTypeData([])
  //  setSelectedCategory("");
  // }, []);

  const handleCancel = useCallback(() => {

  releaseFormStatus();

  setFormData({ cat_group: "", cat_desc: "" });

  setCategoryTypeData([]);

  setSelectedCategory("");

  setCategoryTypeMap({});         
  setUpdatedCatTypeData([]);      
  setDeletedCatTypeData([]); 
  setPage(1);
  setTotalPages(1);    

  setFocusedRowIndex(0);

}, []);

 


  const handleCatTypeDetailChange = useCallback(
  (name, value, rowIndex = null, e) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const isNumberField = e?.target?.type === "number";
    const isStringField = typeof value === "string";
    const processedValue = isStringField ? value.toUpperCase() : value;

    //  DUPLICATE CHECK (ONLY FOR DESCRIPTION)
    if (name === "description") {
      const duplicate = isDuplicateDescription(categoryTypeData, processedValue, rowIndex);

      if (duplicate) {
        toast.error("Duplicate Description not allowed in same category");
        return;   
      }
    }

    const getUpdatedValue = () => {
      if (!isNumberField && e?.target) {
        const { selectionStart, selectionEnd } = e.target;
        const newValue = processedValue;

        requestAnimationFrame(() => {
          e.target?.setSelectionRange(selectionStart, selectionEnd);
        });

        return newValue;
      }
      return processedValue;
    };

    setCategoryTypeData((prev) => {
      let updatedRows = [...prev];

      if (rowIndex !== null && rowIndex >= 0) {
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          [name]: getUpdatedValue(),
        };
      } else {
        updatedRows = updatedRows.map((row) => ({
          ...row,
          [name]: getUpdatedValue(),
        }));
      }

      setCategoryTypeMap((prevMap) => ({
        ...prevMap,
        [selectedCategory]: updatedRows,
      }));

      setUpdatedCatTypeData((prevUpdated) => {
        const changedRow = updatedRows[rowIndex];
        if (!changedRow) return prevUpdated;

        if (!changedRow.code || changedRow.code.trim() === "") {
          return prevUpdated;
        }

        const newUpdated = [...prevUpdated];
        const existingIndex = newUpdated.findIndex(
          (row) => row.code === changedRow.code
        );

        if (existingIndex >= 0) {
          newUpdated[existingIndex] = changedRow;
        } else {
          newUpdated.push(changedRow);
        }

        return newUpdated;
      });

      return updatedRows;
    });
  },
  [selectedCategory, formStatus, categoryTypeData]  
);



  const handleAddRow = useCallback(() => { 

     const isValidCategoryForm = validateForm('code-defination-category-form', 'codeDefinationCategory');
    if (!isValidCategoryForm) return;

    const isValidCategoryTypeForm = validateForm('code-defination-cat-type-form', 'codeDefinationCatTypes');
    if (!isValidCategoryTypeForm) return;

  const newRow = { ...catTypeInitialFormDataTemplate };
  setCategoryTypeData(prev => {
    const updated = [...prev, newRow];
    setCategoryTypeMap(prevMap => ({
      ...prevMap,
      [selectedCategory]: updated,
     
    }));
     setFocusedRowIndex(updated.length - 1);
    return updated;
  });
}, [selectedCategory]);


  /// delete category row
// const handleDeleteRow = useCallback((data, index) => {
 
//     let newDeleteData = [...deletedCatTypeData];
//     newDeleteData.push(data);
//     setDeletedCatTypeData(newDeleteData);
  

//   // setCategoryTypeData(prev => {
//   //   if (prev.length === 0) return prev;
//   //   return prev.filter((_, i) => i !== index);
//   // });
//   setCategoryTypeData(prev => {
//   const updated = prev.filter((_, i) => i !== index);

//   setFocusedRowIndex(prevFocus => {
//     if (prevFocus >= updated.length) {
//       return updated.length - 1;  
//     }
//     return prevFocus;
//   });

//   return updated;
// });
// }, [ deletedCatTypeData]);

const handleDeleteRow = useCallback((data, index) => {

  const isNewRow = !data.code || data.code.trim() === "";

  // ✅ ONLY DB RECORDS go to deleted payload
  if (!isNewRow) {
    setDeletedCatTypeData(prev => [...prev, data]);
  }

  // ✅ ALWAYS remove from UI
  setCategoryTypeData(prev => {

    const updated = prev.filter((_, i) => i !== index);

    setFocusedRowIndex(prevFocus => {
      if (prevFocus >= updated.length) {
        return updated.length - 1;
      }
      return prevFocus;
    });

    return updated;
  });

}, []);


  // if category change then show category type accordingly
  const handleCategory = useCallback((name, value) => {
    if (name === "cat_group") {
      setSelectedCategory(value);
      setFormData({ ...formData, [name]: value });
    }
  }, []);


  const setupQueryData = useCallback(
    (queryData, btnClicked) => {


    },
    [formStatus, currentRecordNo]
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
        //QUERY_API={"APP_PROD_API.GET_DATA_FOR_MEMBER_FORM"}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <CodeDefinitionDetail
              formData={formData}
              formStatus={formStatus}
              handleChange={handleCategory}
              handleCatTypeDetailChange={handleCatTypeDetailChange}
              categoryTypeData={categoryTypeData}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              handleUpdateRow={handleUpdateRow}
              categoryData={categoryData}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              catDesc = {catDesc}
              setCatDesc = {setCatDesc}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />

          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default CodeDefination;

