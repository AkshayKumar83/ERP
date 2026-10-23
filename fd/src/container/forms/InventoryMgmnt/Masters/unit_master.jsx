
import React, { useCallback, useState } from 'react';
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import UnitMasterDetails from './unit_master_dtl';
import { unitMasterData } from './unit_master_helper';
import { APP_PROD_API } from "../../../../utils/api";
import toast from 'react-hot-toast';
import { validateForm } from '../../../../utils/fn';

  const UnitMaster = () => { 
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [deletedRecords, setDeletedRecords] = useState([]);


  const tabs = ["Unit Master"];
  const updateActiveTab = useCallback((tab) => setActiveTab(tab), []);



  const handleChange = useCallback(
  (name, value, index, event) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const cursorPosition = event.target.selectionStart;
    let newVal = value.toUpperCase();

    setFormData((prevData) => {
      const newData = [...prevData];
      const updatedRow = {
        ...unitMasterData,
        ...newData[index],
        [name]: newVal,
      };

      // agar Insert me ho to isNew rakho, agar Update me ho to changed mark karo
      if (formStatus === "Update" && !updatedRow.isNew) {
        updatedRow.isStatus = "changed";
      }

      newData[index] = updatedRow;
      return newData;
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

const checkDuplicateUnits = (rows) => {
  const seen = new Set();
  for (let row of rows) {
    if (!row.unit) continue; // empty skip
    const key = row.unit.trim().toUpperCase();
    if (seen.has(key)) {
      return key; // duplicate mila
    }
    seen.add(key);
  }
  return null;
};



const triggerAddRow = useCallback(() => {
  const unitMaster = validateForm("unit-master", "Unit Master");
  if (!unitMaster) return;

  // duplicate check only for ui
   const dup = checkDuplicateUnits(formData); 
   if (dup) { 
    toast.error(`Duplicate Unit found: ${dup}`);
     return; 
    }
  setFormData((prevData) => {
    const newRow = { ...unitMasterData, isNew: true ,unit_id: ""}; 
    const newData = [...prevData, newRow];
    setFocusedRowIndex(newData.length - 1);
    return newData;
  });
}, [formData]);


 const handleDelete = (rowIndex) => {
  setFormData((prev) => {
    const deletedRow = prev[rowIndex];
    // agar existing row hai (unit_id already hai) tabhi deletedRecords me add karein
    if (formStatus === "Update" && deletedRow.unit_id && !deletedRow.isNew) {
      setDeletedRecords((prevDel) => [...prevDel, { ...deletedRow }]);
    }
    return prev.filter((_, idx) => idx !== rowIndex);
  });
  setFocusedRowIndex(0);
};

  

  const formCleanup = () => {
    setFormData([]);
    setDeletedRecords([]); 
    releaseFormStatus();
  };

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

const setupQueryData = useCallback((queryData, btnClicked) => {
  if (queryData?.type === "not_found" && btnClicked === 'Query') {
    toast.error("No Data Found");
    handleCancel()
    setFormData([]);
    setTotalRecordCount(0);
    return;
  }

  setFormData(queryData?.unitMaster);
  setFocusedRowIndex(0)

  if (btnClicked === "Query") {
    setTotalRecordCount(queryData?.totalCount);
  }
}, [formStatus, currentRecordNo]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const unitMaster = validateForm('unit-master','Unit Master')
    if(!unitMaster) return;

  // 🔹 Step 2: Prepare rows by type
  const newRows = formData.filter((row) => row.isNew && !row.isDeleted);
  const updatedRows = formData.filter((row) => row.isChanged && !row.isDeleted);
  const deletedRows = deletedRecords || [];

  // 🔹 Step 3: Prevent submission if no change
  if (formStatus === "Insert" && newRows.length === 0) {
    toast.error("No new rows to submit.");
    return;
  }

  // if (formStatus === "Update" && newRows.length === 0 && updatedRows.length === 0 && deletedRows.length === 0) {
  //   toast.error("No changes to submit.");
  //   return;
  // }

    // duplicate check only for ui and (backend also check for database duplicate  in insert and update case)
      const dup = checkDuplicateUnits(formData);
      if (dup) {
        toast.error(`Duplicate Unit found: ${dup}`);
        return;
      }

    // normalize each row with base structure
    const normalizedData = formData.map((row) => ({
        ...unitMasterData, // ensure all fields present
        ...row,
      }));

  const payload = { formData: normalizedData,    deletedRecords };

 let method = formStatus === "Insert" ? "POST" : "PUT";

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_UNIT_MSTR_DATA}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      }
    );

   const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      if (data.type === "success") {
        toast.success("Data saved successfully!");
        formCleanup();
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error(error.message || "Please check all the form fields or contact administrator");
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
        handleOffset={setCurrentRecordNo}
        QUERY_API={APP_PROD_API.GET_UNIT_MSTR_FORM_DATA}
        formName={"Unit Master"}
        isQueryReqOnInsertBtn = {true}
        isQueryReqOnNextPreBtn={false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <UnitMasterDetails
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDelete}
               focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default UnitMaster;


