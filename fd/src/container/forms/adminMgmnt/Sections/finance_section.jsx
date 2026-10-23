import React from 'react'
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import FinanceSectionDtl from './finance_section_Detail';
import { sectionInitFormDataTemplate } from './finance_section_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { formatOptions } from '../../../../lib';
import { deprecations } from 'sass';
import toast from 'react-hot-toast';
import { Delete } from 'lucide-react';


const FinanceSection = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  const [sectionData, setSectionData] = useState([{ ...sectionInitFormDataTemplate }])

  const [sectionDataMap, setSectionDataMap] = useState({});

  const [selectedDepartment, setSelectedDepartment] = useState("")

  const [deletedSectionData, setDeletedSectionData] = useState([])

  const [shouldAutoSelectDept, setShouldAutoSelectDept] = useState(true);

  // for Dropdown Data  

  const [departments, setDepartments] = useState([])



  const tabs = ["Finance Section"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // fetch drop down data
  useEffect(() => {

    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_FINANCE_SECTION_LIST_DATA}`, { credentials: 'include', }
        )
        if (response.status === 200) {
          const data = await response.json()
          setDepartments([...formatOptions(data.department || [], "dept_cd", "department")])
          setSelectedDepartment(data.department[0]?.dept_cd)


        }
      } catch (err) {
        console.error("Error fetching constants:", err)
      }
    }
    // only run for valid form states
    if (["Insert", "Update", "Search", "Query"].includes(formStatus)) {
      fetchConstantList();
    }
    //fetchConstantList();
  }, [formStatus])


  useEffect(() => {

    if (!selectedDepartment || formStatus === "") return;

    if (selectedDepartment) {

      // Check if we already have data for selectedDepartment
      if (sectionDataMap[selectedDepartment]) {
        setSectionData(sectionDataMap[selectedDepartment]);
        return;
      }


      const fetchDeptSectionData = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_FINANCE_SECTION_DATA}?dept_cd=${selectedDepartment}`, { credentials: 'include', }
        );
        const result = await response.json();
        if (result.type === "found") {
          const hasDeptSectionData = result?.sectionData?.length > 0;
          setSectionData(
            hasDeptSectionData
              ? result?.sectionData
              : []
          );
        }

        // else if (result.type === "created") {
        //    setSectionData([sectionInitFormDataTemplate]); 

        //    setSectionDataMap(prev => ( {
        //     ...prev,
        //     [selectedDepartment]: newData,
        //    }

        //    ))
        // }
      };
      fetchDeptSectionData();
    }
  }, [selectedDepartment, formStatus]);


  function formCleanup() {
    setShouldAutoSelectDept(false);
    releaseFormStatus()
    setSectionData([sectionInitFormDataTemplate])
    // setDepartments([])
    setSelectedDepartment("")
    setFormData({});

  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const financeSectionForm = document.getElementById("finance-section-form")
      if (!financeSectionForm.checkValidity()) {
        financeSectionForm.reportValidity();
        return;
      }

      const financeSectionDeptForm = document.getElementById("finance-section-dept-form")
      if (!financeSectionDeptForm.checkValidity()) {
        financeSectionDeptForm.reportValidity();
        return;
      }


      // Validation for duplicate dept_cd + prefix combination
      const seenCombos = new Set();
      const duplicates = sectionData.filter((item) => {
        const trimmedPrefix = item.section_prefix?.trim();
        const key = `${selectedDepartment}||${trimmedPrefix}`;

        console.log('Checking combination:', key); // Debug log

        if (seenCombos.has(key)) {
          toast.error(
            `Combination of Department and Prefix already exists.`
          );
          return true;
        }

        seenCombos.add(key);
        return false;
      });

      if (duplicates.length > 0) {
        // Prevent submission
        return;
      }

      // Validation: Only one "default_sale: Y" per sec_desc
      const saleCheckMap = new Map();

      for (const item of sectionData) {
        const desc = item.sec_desc?.trim();
        const isDefaultSale = item.default_sale === "Y";

        if (isDefaultSale) {
          if (saleCheckMap.has(desc)) {
            // Already has one with default_sale = "Y"
            toast.error(
              "One of the section already defined for Sales,\nPlease Uncheck that section first..."
            );
            return; // Prevent submission
          } else {
            saleCheckMap.set(desc, true);
          }
        }
      }

      const modifiedOrNew = Object.values(sectionDataMap)
        .flat()
        .filter((item) => item.isNew || item.isModified);

      console.log(modifiedOrNew)


      let body = {
        dept_cd: selectedDepartment,
        sectionData: sectionData
      }

      if (formStatus === "Update") {
        console.log(deletedSectionData)
        body = {
          deletedSectionData: deletedSectionData,
          sectionData: sectionData,
          dept_cd: selectedDepartment
        }
      }

      setDeletedSectionData([])

      console.log("Final body to send", body)

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_FINANCE_SECTION_DATA}?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        }
      );


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }


      toast.success("Data saved successfully!");
      formCleanup()

    }

    catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  }



  function handleOffset(data) {
    setCurrentRecordNo(data)
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});

    setSectionData([sectionInitFormDataTemplate])
  }, []);

  // const handleChange = useCallback((type, name, value, rowIndex = null) => {
  //   switch (type) {
  //     //  case "formData":
  //     //    setFormData(prev => ({ ...prev, [name]: value }));
  //     //    break;

  //     case "sectionData":
  //       setSectionData(prev => {
  //         if (rowIndex !== null && rowIndex >= 0) {
  //           // Update a specific row
  //           const newData = [...prev];
  //           newData[rowIndex] = {
  //             ...newData[rowIndex],
  //             [name]: typeof value === "string" ? value.toUpperCase() : value
  //           };
  //           return newData;
  //         } else {
  //           // Update all rows (used for Select field outside table)
  //           return prev.map(row => ({
  //             ...row,
  //             [name]: typeof value === "string" ? value.toUpperCase() : value
  //           }));
  //         }   

  //          // Update both current state and map
  //   setSectionDataMap(prevMap => ({
  //     ...prevMap,
  //     [selectedDepartment]: updated,
  //   }));

  //   return updated;

  //       });
  //       break;

  //     default:
  //       console.log("handleChange is not properly defined");
  //   }
  // }, []);

  // if department change then show section accordingly   

  const handleChange = useCallback((type, name, value, rowIndex = null, e) => {

    if (!["Insert", "Update"].includes(formStatus)) {
      return;
    }

    const isNumberField = e?.target?.type === "number";
    const isStringField = typeof value === "string";
    const processedValue = isStringField ? value.toUpperCase() : value;

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


    switch (type) {
      case "sectionData": {
        let updated;

        setSectionData(prev => {
          if (rowIndex !== null && rowIndex >= 0) {
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              //  [name]: typeof value === "string" ? value.toUpperCase() : value, 
              [name]: getUpdatedValue()
            };
            updated = newData;
            return newData;
          } else {
            const newData = prev.map(row => ({
              ...row,
              // [name]: typeof value === "string" ? value.toUpperCase() : value,
              [name]: getUpdatedValue()
            }));
            updated = newData;
            return newData;
          }
        });

        //  Safely update the map outside the setState callback
        setSectionDataMap(prevMap => ({
          ...prevMap,
          [selectedDepartment]: updated,
        }));

        break;
      }

      default:
        console.log("handleChange is not properly defined");
    }
  }, [formStatus]);


  const handleDeptChange = useCallback((name, value) => {
    if (name === "dept_cd") {
      setSelectedDepartment(value);
      setFormData({ ...formData, [name]: value });
    }
  }, []);




  // const handleAddRecordInTable = useCallback(() => { 
  //    const financeSectionForm = document.getElementById("finance-section-form")
  //     if (!financeSectionForm.checkValidity()) {
  //       financeSectionForm.reportValidity();
  //       return;
  //     }

  //     const financeSectionDeptForm = document.getElementById("finance-section-dept-form")
  //     if (!financeSectionDeptForm.checkValidity()) {
  //       financeSectionDeptForm.reportValidity();
  //       return;
  //     }
  //   setSectionData((prevData) => [
  //     ...prevData,
  //     {
  //       ...sectionInitFormDataTemplate,
  //       id: prevData.length + 1,
  //     },
  //   ]);
  // }, [setSectionData]);  

  const handleAddRecordInTable = useCallback(() => {
    const financeSectionForm = document.getElementById("finance-section-form");
    if (!financeSectionForm.checkValidity()) {
      financeSectionForm.reportValidity();
      return;
    }

    const financeSectionDeptForm = document.getElementById("finance-section-dept-form");
    if (!financeSectionDeptForm.checkValidity()) {
      financeSectionDeptForm.reportValidity();
      return;
    }

    // Create new row
    setSectionData((prevData) => {
      const newRow = {
        ...sectionInitFormDataTemplate,
        id: prevData.length + 1,
        isNew: true
      };
      const updated = [...prevData, newRow];

      // Also update the sectionDataMap
      setSectionDataMap((prevMap) => ({
        ...prevMap,
        [selectedDepartment]: updated,
      }));

      return updated;
    });
  }, [selectedDepartment]);



  //DELETE ROW
  const handleDeleteRow = useCallback((data, index) => {
    console.log("delete row")
    let newDeleteData = [...deletedSectionData]

    newDeleteData.push(data)
    setDeletedSectionData(newDeleteData)

    setSectionData((prev) => {
      if (prev.length === 0) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, [sectionData]);


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
        // QUERY_API={APP_PROD_API.GET_FINANCE_SECTION_DATA}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <FinanceSectionDtl
              formData={formData}
              formStatus={formStatus}
              handleChange={handleChange}
              sectionData={sectionData}
              handleAddRow={handleAddRecordInTable}
              handleDelete={handleDeleteRow}
              departments={departments}
              handleDeptChange={handleDeptChange}
              setSelectedDepartment={setSelectedDepartment}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default FinanceSection;

