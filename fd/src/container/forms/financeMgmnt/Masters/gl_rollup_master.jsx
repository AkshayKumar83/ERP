
import React, { useEffect, useCallback, useState } from 'react';
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import GLrollupMasterDtl from './gl_rollup_masterDtl';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import { transformCategoryToDbData } from './gl_rollup_masterHelpers';
import { validateForm } from '../../../../utils/fn';

const GlRollUpMaster = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [hierarchicalData, setHierarchicalData] = useState({ level1: [] });
  const [focusedRows, setFocusedRows] = useState({ level1: 0, level2: 0, level3: 0, level4: 0});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [deletedData, setDeletedData] = useState([]);


  const tabs = ["GL Rollup Master"];

  function setupQueryData(data,btnClicked) {

   if (!data || data.type === "not found") {
    toast.error(" No Records Found");
    setHierarchicalData({ level1: [] });
    setTotalRecordCount(0);
    handleCancel();
    return;
  }

    const level1List = data.level1List || [];
    const level2List = data.level2List || [];
    const level3List = data.level3List || [];
    const level4List = data.level4List || [];

    const hierarchical = level1List.map((l1) => ({
      level1: l1.level1,
      cat_desc: l1.cat_desc,
      level2: level2List
        .filter((l2) => l2.level1 === l1.level1)
        .map((l2) => ({
          level2: l2.level2,
          cat_desc: l2.cat_desc,
          level3: level3List
            .filter((l3) => l3.level1 === l1.level1 && l3.level2 === l2.level2)
            .map((l3) => ({
              level3: l3.level3,
              cat_desc: l3.cat_desc,
              level4: level4List
                .filter(
                  (l4) =>
                    l4.level1 === l1.level1 &&
                    l4.level2 === l2.level2 &&
                    l4.level3 === l3.level3
                )
                .map((l4) => ({
                  level4: l4.level4,
                  cat_desc: l4.cat_desc,
                })),
            })),
        })),
    }));

    setHierarchicalData({ level1: hierarchical });
    
     if (btnClicked === "Query") {
    setTotalRecordCount(data.count || 0);
  }
  }

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

      const formCleanup = () => {
      setHierarchicalData({ level1: [] });
      setFocusedRows({ level1: 0, level2: 0, level3: 0, level4: 0 });
      releaseFormStatus();
      }


  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);


const handleChange = useCallback(
  (name, value, index, event, key) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) return;

    const cursorPosition = event.target.selectionStart;
    let newVal = ["level2", "level3", "level4"].includes(name)
      ? value.replace(/[^0-9]/g, "").slice(0, 2)
      : value.toUpperCase();

    setHierarchicalData((prev) => {
      const newData = { ...prev };

      if (key === "formData") {
        newData.level1[index] = {
          ...newData.level1[index],
          [name]: newVal,
        };
      } else if (key === "barrelTwo") {
        newData.level1[focusedRows.level1].level2[index] = {
          ...newData.level1[focusedRows.level1].level2[index],
          [name]: newVal,
          ...(formStatus === 'Update' ? { isAlreadyExist: true } : {})
        };
      } else if (key === "barrelThree") {
        newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[index] = {
          ...newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[index],
          [name]: newVal,
          ...(formStatus === 'Update' ? { isAlreadyExist: true } : {})
        };
      } else if (key === "barrelFour") {
        newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[focusedRows.level3].level4[index] = {
          ...newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[focusedRows.level3].level4[index],
          [name]: newVal,
          ...(formStatus === 'Update' ? { isAlreadyExist: true } : {})
        };
      
      }

      return newData;
    });

    setTimeout(() => {
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  },
  [formStatus, focusedRows]
);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      let transformedData = transformCategoryToDbData({
        hierarchicalData,
        focusedRows,
        formStatus
      });

   

    // Filter only updated records (those with isAlreadyExist: true) for Update operation
    if (formStatus === 'Update') {
      transformedData = transformedData.filter(item => item.isAlreadyExist === true);

      if (transformedData.length === 0 && deletedData.length == 0) {
        throw new Error("No updated records found to submit.");
      }
    }
    
    if (transformedData.length === 0 && formStatus == 'Insert') {
      throw new Error("No data found for submit");
    }

      const body = {
        data: transformedData,
        form_status: formStatus,
        deletedData:deletedData
      };

       let method;//formStatus === "Insert" ? "POST" : "PUT";
      if(formStatus =='Insert'){
        method = 'POST'
      
      }else{
        method ='PUT'
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GL_ROLLUP_MSTR_DATA}?form_status=${formStatus}`,
        {
          method,
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials:'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Can't fetching error while submiting data.");
      }

      toast.success("Data saved successfully!");
      formCleanup();
    } catch (error) {
      toast.error(error.message || "Please check all form fields or contact administrator");
    }
  };



 const triggerAddRow = (key) => {

  let isValidData = validateForm(key,key)
  if(!isValidData) return;
    
    setHierarchicalData((prev) => {
      const newData = structuredClone(prev);

      // Helper function to generate the next numeric code
      const generateNextCode = (items, levelKey) => {
        if (!items || items.length === 0) return "01";
        const codes = items
          .map(item => parseInt(item[levelKey], 10))
          .filter(code => !isNaN(code));
        const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
        return (maxCode + 1).toString().padStart(2, "0");
      };

      if (key === "barrelTwo") {
        if (!newData.level1[focusedRows.level1]?.level2) {
          newData.level1[focusedRows.level1].level2 = [];
        }
        const nextCode = generateNextCode(newData.level1[focusedRows.level1].level2, "level2");
        const newRow = { level2: nextCode, cat_desc: "", level3: [], isNew: true };
        newData.level1[focusedRows.level1].level2.push(newRow);
        setFocusedRows((prev) => ({
          ...prev,
          level2: newData.level1[focusedRows.level1].level2.length - 1,
          level3: 0,
          level4: 0,
        }));
 
      } else if (key === "barrelThree") {
        // Check if level2 exists and has at least one row
        if (
          !newData.level1[focusedRows.level1]?.level2 ||
          newData.level1[focusedRows.level1].level2.length === 0
        ) {
          toast.error("Parent row missing. Add Level 2 entry before adding Level 3.");
          return prev;
        }
        if (!newData.level1[focusedRows.level1]?.level2[focusedRows.level2]?.level3) {
          newData.level1[focusedRows.level1].level2[focusedRows.level2].level3 = [];
        }
        const nextCode = generateNextCode(
          newData.level1[focusedRows.level1].level2[focusedRows.level2].level3,
          "level3"
        );
        const newRow = { level3: nextCode, cat_desc: "", level4: [], isNew: true };
        newData.level1[focusedRows.level1].level2[focusedRows.level2].level3.push(newRow);
        setFocusedRows((prev) => ({
          ...prev,
          level3: newData.level1[focusedRows.level1].level2[focusedRows.level2].level3.length - 1,
          level4: 0,
        }));
       
      } else if (key === "barrelFour") {
        // Check if level3 exists and has at least one row
        if (
          !newData.level1[focusedRows.level1]?.level2[focusedRows.level2]?.level3 ||
          newData.level1[focusedRows.level1].level2[focusedRows.level2].level3.length === 0
        ) {
          toast.error("Parent row missing. Add Level 3 entry before adding Level 4.");
          return prev;
        }
        if (!newData.level1[focusedRows.level1]?.level2[focusedRows.level2]?.level3[focusedRows.level3]?.level4) {
          newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[focusedRows.level3].level4 = [];
        }
        const nextCode = generateNextCode(
          newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[focusedRows.level3].level4,
          "level4"
        );
        const newRow = { level4: nextCode, cat_desc: "", isNew: true };
        newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[focusedRows.level3].level4.push(newRow);
        setFocusedRows((prev) => ({
          ...prev,
          level4: newData.level1[focusedRows.level1].level2[focusedRows.level2].level3[focusedRows.level3].level4.length - 1,
        }));
       
      }
      return newData;
    });
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
        isQueryReqOnInsertBtn={true}
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_GL_ROLLUP_MSTR_FORM_DATA}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <GLrollupMasterDtl
              hierarchicalData={hierarchicalData}
              setHierarchicalData={setHierarchicalData}
              focusedRows={focusedRows}
              setFocusedRows={setFocusedRows}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              setDeletedData={setDeletedData} 
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default GlRollUpMaster;