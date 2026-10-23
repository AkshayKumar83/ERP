


import React, { useCallback, useState } from 'react';
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { defineOpreationData } from './define_operation_helper';
import { APP_PROD_API } from "../../../../utils/api";
import toast from 'react-hot-toast';
import { validateForm } from '../../../../utils/fn';
import DefineOperationHeader from './define_operation_header';

  const DefineOperation = () => { 
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [deletedRecords, setDeletedRecords] = useState([]);


  const tabs = ["Define Operation"];

  const updateActiveTab = useCallback((tab) => setActiveTab(tab), []);



//   const handleChange = useCallback(
//   (name, value, index, event) => {
//     if (!["Insert", "Update"].includes(formStatus)) return;

//     const cursorPosition = event.target.selectionStart;
//     let newVal = value.toUpperCase();

//     setFormData((prevData) => {
//       const newData = [...prevData];
//       const updatedRow = {
//         ...defineOpreationData,
//         ...newData[index],
//         [name]: newVal,
//       };

//       // agar Insert me ho to isNew rakho, agar Update me ho to changed mark karo
//       if (formStatus === "Update" && !updatedRow.isNew) {
//         updatedRow.isStatus = "changed";
//       }

//       newData[index] = updatedRow;
//       return newData;
//     });

//        if (
//     event?.target &&
//     event.target.tagName === "INPUT" &&
//     !["number", "radio", "checkbox", "date"].includes(event.target.type)
//   ) {
//     setTimeout(() => {
//       event.target.setSelectionRange(cursorPosition, cursorPosition);
//     }, 0);
//   }
//     },
//   [formStatus]
// );

const handleChange = useCallback(
  (name, value, index, event) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    let newVal = value?.toUpperCase?.() ?? value;

    setFormData(prevData => {
      const newData = [...prevData];
      const row = newData[index];

      const updatedRow = {
        ...defineOpreationData,
        ...row,
        [name]: newVal,
      };

      // 🔥 UPDATE MODE – change detection
      if (formStatus === "Update" && !row.isNew) {
        const originalVal = row.__original?.[name] ?? "";
        const currentVal = newVal ?? "";

        if (originalVal === currentVal) {
          // ✅ user wapas original pe aa gaya
          delete updatedRow.isStatus;
        } else {
          updatedRow.isStatus = "changed";
        }
      }

      newData[index] = updatedRow;
      return newData;
    });
  },
  [formStatus]
);



const hasDuplicateInTable = (rows, field, value, currentIndex) => {
  if (!value) return false;

  const normalizedValue = value.trim().toUpperCase();

  return rows.some((row, index) => {
    if (index === currentIndex) return false; // same row skip

    // sirf new / changed rows consider karo
    if (!row.isNew && row.isStatus !== "changed") return false;

    const rowValue = row[field];
    if (!rowValue) return false;

    return rowValue.trim().toUpperCase() === normalizedValue;
  });
};



// const triggerAddRow = useCallback(() => {
//      const defineOprtn = validateForm('define-oprtn','Define Operation')
//     if(!defineOprtn) return;


//   setFormData((prevData) => {
//     const newRow = { ...defineOpreationData, isNew: true ,opn_id: ""}; 
//     const newData = [...prevData, newRow];
//     setFocusedRowIndex(newData.length - 1);
//     return newData;
//   });
// }, [formData]);

const triggerAddRow = useCallback(() => {
  const defineOprtn = validateForm("define-oprtn", "Define Operation");
  if (!defineOprtn) return;

  //  last row check karo (jo user ne abhi fill ki)
  const lastIndex = formData.length - 1;
  if (lastIndex >= 0) {
    const lastRow = formData[lastIndex];

    // sirf new / changed rows check karo
    if (lastRow?.isNew || lastRow?.isStatus === "changed") {

      // Operation No duplicate
      if (
        hasDuplicateInTable(
          formData,
          "operation_no",
          lastRow.operation_no,
          lastIndex
        )
      ) {
        toast.error("Duplicate Operation No found.");
        return;
      }

      // Operation Desc duplicate
      if (
        hasDuplicateInTable(
          formData,
          "opn_desc",
          lastRow.opn_desc,
          lastIndex
        )
      ) {
        toast.error("Duplicate Operation Description found.");
        return;
      }
    }
  }

  // ✅ safe to add new row
  setFormData(prevData => {
    const newRow = {
      ...defineOpreationData,
      isNew: true,
      opn_id: "",
    };
    const newData = [...prevData, newRow];
    setFocusedRowIndex(newData.length - 1);
    return newData;
  });

}, [formData]);




 const handleDelete = (rowIndex) => {
  setFormData((prev) => {
    const deletedRow = prev[rowIndex];
    // agar existing row hai (opn_id already hai) tabhi deletedRecords me add karein
    if (formStatus === "Update" && deletedRow.opn_id && !deletedRow.isNew) {
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

// const setupQueryData = useCallback((queryData, btnClicked) => {
//   if (queryData?.type === "not_found" && btnClicked === 'Query') {
//     toast.error("No Data Found");
//     handleCancel()
//     setFormData([]);
//     setTotalRecordCount(0);
//     return;
//   }

//   setFormData(queryData?.defineOprtn);
//   setFocusedRowIndex(0)

//   if (btnClicked === "Query") {
//     setTotalRecordCount(queryData?.totalCount);
//   }
// }, [formStatus, currentRecordNo]);
  

const setupQueryData = useCallback((queryData, btnClicked) => {
  const dataWithOriginal = queryData.defineOprtn.map(row => ({
    ...row,
    __original: {
      operation_no: row.operation_no,
      opn_desc: row.opn_desc,
      opn_stage_name: row.opn_stage_name,
      machin_based: row.machin_based,
      inspection_flag: row.inspection_flag,
      opn_dtl_desc: row.opn_dtl_desc,
    },
  }));

  setFormData(dataWithOriginal);
}, []);


const checkDuplicatesOnSubmit = (allRows) => {
  const opnNoMap = new Map();
  const descMap = new Map();

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];

    const opnId = row.opn_id || `NEW_${i}`;

    /* ========== OPERATION NO ========== */
    const opnNo = row.operation_no?.trim().toUpperCase();
    if (opnNo) {
      if (opnNoMap.has(opnNo)) {
        const existingOpnId = opnNoMap.get(opnNo);
        if (existingOpnId !== opnId) {
          toast.error(`Duplicate Operation No "${opnNo}" found`);
          return false;
        }
      }
      opnNoMap.set(opnNo, opnId);
    }

    /* ========== OPERATION DESC ========== */
    const desc = row.opn_desc?.trim().toUpperCase();
    if (desc) {
      if (descMap.has(desc)) {
        const existingOpnId = descMap.get(desc);
        if (existingOpnId !== opnId) {
          toast.error(`Duplicate Operation Description "${desc}" found`);
          return false;
        }
      }
      descMap.set(desc, opnId);
    }
  }

  return true;
};

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   const defineOprtn = validateForm("define-oprtn", "Define Operation");
//   if (!defineOprtn) return;

//   //  ONLY REQUIRED ROWS
//   let rowsToSend = [];

//   if (formStatus === "Insert") {
//     rowsToSend = formData.filter(row => row.isNew);
//   }

//   if (formStatus === "Update") {
//     rowsToSend = formData.filter(
//       row => row.isNew || row.isStatus === "changed"
//     );
//   }
  

//  if (!checkDuplicatesOnSubmit(rowsToSend)) {
//     return; 
//   }
//   // kuch bhi change nahi hua
//   if (rowsToSend.length === 0 && deletedRecords.length === 0) {
//     toast.error("No changes to submit");
//     return;
//   }

//   // normalize only filtered rows
//   const normalizedRows = rowsToSend.map(row => ({
//     ...defineOpreationData,
//     ...row,
//   }));

//   const payload = {
//     form_status: formStatus,
//     formData: normalizedRows,
//     deletedRecords,
//   };

//   let method = formStatus === "Insert" ? "POST" : "PUT";

//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DEFINE_OPERATION_DATA}?form_status=${formStatus}`,
//       {
//         method,
//         body: JSON.stringify(payload),
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Something went wrong!");
//     }

//     toast.success("Data saved successfully!");
//     formCleanup();

//   } catch (error) {
//     toast.error(error.message);
//   }
// };


const handleSubmit = async (e) => {
  e.preventDefault();

  const defineOprtn = validateForm("define-oprtn", "Define Operation");
  if (!defineOprtn) return;

  let rowsToSend = [];

  /* ================= INSERT ================= */
  if (formStatus === "Insert") {
    rowsToSend = formData.filter(row => row.isNew);
  }

  /* ================= UPDATE ================= */
  if (formStatus === "Update") {
    rowsToSend = formData.filter(row => {
      // new row → always send
      if (row.isNew) return true;

      // not marked changed → skip
      if (row.isStatus !== "changed") return false;

      // 🔥 original vs current compare
      const o = row.__original || {};

      return (
        row.operation_no !== o.operation_no ||
        row.opn_desc !== o.opn_desc ||
        row.opn_stage_name !== o.opn_stage_name ||
        row.machin_based !== o.machin_based ||
        row.inspection_flag !== o.inspection_flag ||
        (row.opn_dtl_desc || "") !== (o.opn_dtl_desc || "")
      );
    });
  }

  /* ================= DUPLICATE CHECK ================= */
  if (!checkDuplicatesOnSubmit(formData)) {
    return;
  }

  /* ================= NOTHING TO SAVE ================= */
  if (rowsToSend.length === 0 && deletedRecords.length === 0) {
    toast.error("No changes to submit");
    return;
  }

  /* ================= PAYLOAD ================= */
  const normalizedRows = rowsToSend.map(row => ({
    ...defineOpreationData,
    ...row,
  }));

  const payload = {
    form_status: formStatus,
    formData: normalizedRows,
    deletedRecords,
  };

  const method = formStatus === "Insert" ? "POST" : "PUT";

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DEFINE_OPERATION_DATA}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong!");
    }

    toast.success("Data saved successfully!");
    formCleanup();

  } catch (error) {
    toast.error(error.message);
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
        QUERY_API={APP_PROD_API.GET_DEFINE_OPERATION_FORM_DATA}
        formName={"Define Operation"}
        isQueryReqOnInsertBtn = {true}
        isQueryReqOnNextPreBtn={false}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <DefineOperationHeader
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

export default DefineOperation;


