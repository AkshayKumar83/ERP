import React, { useEffect } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import AccCodeForPurchaseVoucherHeader from "./acc_code_for_purchase_vouc_header";
import {
  accCodePurVcurBlockInitData,
  tempBlockInitData,
  createSearchPayloadForAccCodePurcVucrSearch,
  checkDuplicate,

} from "./acc_code_for_purchase_vouc_helper";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { v4 as uuidv4 } from "uuid";

const AccCodeForPurchaseVoucher = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([ ]);
  const [tempData, setTempData] = useState({ ...tempBlockInitData });
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [updateFormData, setUpdateFormData] = useState([]); // track updated row
  const [deleteRecord, setDeleteRecord] = useState([]); // track deleted row

  // BELOW STATE USED FOR DROPDOWN INPUTS
  const [poCat, setPoCat] = useState([]);

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);
  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // const [actualData, setActualData] = useState([{ ...accCodePurVcurBlockInitData }]);
  // const [showRecord, setShowRecord] = useState(10);

  const { user } = useSelector((state) => state.auth);

  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_ACC_CODE_PURC_VOCH_LIST_OF_CONSTANTS
          }`,
          {
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setPoCat([
            { value: "", label: "" },
            ...formatOptions(
              data.poCat || [],
              "po_cat_prefix",
              "po_cat_description"
            ),
          ]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (formStatus) {
      fetchConstantList();
    }
  }, [formStatus]);

  const handleHelpList = (data, rowIndex = -1) => {
    setHelpList(data);
    setSelectedRowIndex(rowIndex);
  };

  // put this near your other helpers
  const getHelpPatch = (helpFor, data) => {
    switch (helpFor) {
      case 'Type':
        return {type:data.type, type_desc:data.type_desc};
      case 'Desc':
        return {type:data.type, type_desc:data.type_desc};
      case "AccNo":
        return { acc_no: data.acc_no, acc_desc: data.acc_desc };
      case "SubAccNo":
        return { sub_acc_no: data.acc_no, sub_acc_desc: data.acc_desc };
      case "HscAccNo":
        return { hsc_acc_no: data.acc_no, hsc_acc_desc: data.acc_desc };
      case "ItCode":
        return { it_code: data.it_code, it_desc: data.it_name };
      case "VCode":
        return { v_code: data.v_code, v_name: data.v_name };
      case "ItType":
        return { it_type: data.level1, it_type_desc: data.cat_desc };
      case "ItBase":
        return { it_base: data.level2, it_base_desc: data.cat_desc };
      case "ItSubc":
        return { it_sub_c: data.level3, it_sub_c_desc: data.cat_desc };
      default:
        return {};
    }
   };

   const onSelectHelpItem = (data) => {
    const rowIndex = selectedRowIndex ?? focusedRowIndex ?? -1;

     if (helpFor === "Type" || helpFor === "Desc") {
    setTempData((prev) => ({
      ...prev,
      type: data.type,
      type_desc: data.type_desc
    }));
    
  } else {
    if (rowIndex < 0) return;
      //  console.log("data", data)
    setFormData((prev) => {
      const rows = [...prev];
      const curr = { ...(rows[rowIndex] || {}) };

      // ensure row_id
      if (!curr.row_id) curr.row_id = uuidv4();

      // apply patch from helplist
      const patch = getHelpPatch(helpFor, data);
      const changed = Object.entries(patch).some(([k, v]) => curr[k] !== v);
      if (!changed) return prev; // nothing to do

      const updatedRow = { ...curr, ...patch };
      rows[rowIndex] = updatedRow;

      // mirror FULL ROW into updateFormData (overwrite if exists)
      if (formStatus === "Update" && !updatedRow.isNew) {
        setUpdateFormData((prevUpdates) => {
          const i = prevUpdates.findIndex(
            (r) => r.row_id === updatedRow.row_id
          );
          const fullSnapshot = {
            ...updatedRow,
            // optional: make sure these always present in snapshot
            type: tempData?.type ?? updatedRow.type,
            division_id: user?.global_division_id ?? updatedRow.division_id,
          };
          if (i === -1) return [...prevUpdates, fullSnapshot];
          const next = prevUpdates.slice();
          next[i] = fullSnapshot; // overwrite with full row
          return next;
        });
      }

      return rows;
    });

    // UX
    setHelpList(false);
    setSelectedRowIndex(null);
  }
};



  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = () => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData([]);
    if (formStatus == "Insert" || formStatus == "Search" ) {
      setTempData({ ...tempBlockInitData });
    }
      setTempData({ ...tempBlockInitData });
    setFocusedRowIndex(0);
    setUpdateFormData([]);
    setDeleteRecord([])
  };



  const handleChange = (name, value, index = null, event = null) => {
    if (!["Insert", "Search", "Update"].includes(formStatus)) return;

          if (["acc_no", "sub_acc_no",'hsc_acc_no','it_code','v_code','it_type_desc','it_base_desc','it_sub_c_desc'].includes(name)) {
    toast.error("Please select value from help list only");
    return; 
  }

    let newVal = value.toUpperCase();

    if (index === null) {
      setTempData((prev) => ({ ...prev, [name]: newVal }));
    } else {
      const cursorPosition = event?.target?.selectionStart || 0;
setFormData((prevData) => {
  const newData = [...prevData];
  const currentRow = newData[index] || {};
  const updatedRow = { ...currentRow, [name]: newVal };

  // ensure row_id
  if (!updatedRow.row_id) updatedRow.row_id = uuidv4();

  //  Compare with snapshot
  const snapshot = updatedRow.originalSnapshot || {};
  const isDifferent = Object.keys(snapshot).some(
    (key) => snapshot[key] !== updatedRow[key]
  );

  updatedRow.isEdited = isDifferent; //  reset false if same as original

  newData[index] = updatedRow;

  // Track updates
  if (formStatus === "Update") {
    setUpdateFormData((prevUpdates) => {
      const i = prevUpdates.findIndex((r) => r.row_id === updatedRow.row_id);
      if (i === -1) return [...prevUpdates, updatedRow];
      const next = prevUpdates.slice();
      next[i] = updatedRow;
      return next;
    });
  }

  return newData;
    });
  // only apply selection if it's a text-like input
    setTimeout(() => {
      if (event?.target && ["text", "number", "email", "search", "tel", "url", "password"].includes(event.target.type)) {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }
};

  const setupQueryData = useCallback(
    (data, btnClicked) => {
      if (data?.header?.type === "not found") {
        toast.error("No Record Found");
        setFormStatus("");
        handleCancel()
        return;
      }

      if (data?.header) {
        setTempData({ ...data.header });
      }

     if (data?.detail?.length > 0) {
        const rowsWithSnapshot = data.detail.map(row => ({
          ...row,
          row_id: row.row_id || uuidv4(),
          originalSnapshot: { ...row }, //  original copy
          isEdited: false,
          isNew: false,
        }));
        setFormData(rowsWithSnapshot);
      } else {
        setFormData([]);
      }
        
       setFocusedRowIndex(0)

      if (btnClicked === "Query") {
        setTotalRecordCount(data.count);
      }
    },
    [formStatus, currentRecordNo]
  );



  // check duplicate within an array of objects

  const hasDuplicateRecords = (rows) => {
  const seen = new Set();

  for (const row of rows) {
    //  unique key banate hain combination of fields se
    const key = [
      row.type,
      row.acc_no,
      row.v_code,
      row.it_code,
      row.po_cat_prefix,
      row.st_type,
      row.it_type,
      row.it_base,
      row.it_sub_c
    ].join("|");

    if (seen.has(key)) {
      return { isDuplicate: true, duplicateRow: row };
    }
    seen.add(key);
  }

  return { isDuplicate: false };
};


const triggerAddRow = async () => {
  const lastRow = formData[formData.length - 1];

   const accCodePurcVoch = validateForm( "acc-code-pur-vucr","Acc Code For Purchase Voucher");
      if (!accCodePurcVoch) return;

  // UI-level check
  const { isDuplicate } = hasDuplicateRecords(formData);
  if (isDuplicate) {
    toast.error("Duplicate row, This Combination already exist.");
    return;
  }

  // DB-level check
  if (lastRow && (lastRow.isNew || lastRow.isEdited)) {
    const result = await checkDuplicate({
      type: lastRow.type,
      acc_no: lastRow.acc_no,
      v_code: lastRow.v_code,
      it_code: lastRow.it_code,
      po_cat_prefix: lastRow.po_cat_prefix,
      st_type: lastRow.st_type,
      it_type: lastRow.it_type,
      it_base: lastRow.it_base,
      it_sub_c: lastRow.it_sub_c,
    });

    if (!result.success) {
      toast.error(result.message || "Duplicate record found in database");
      return;
    }
  }

  // Add row
  setFormData((prev) => [
    ...prev,
    {
      ...accCodePurVcurBlockInitData,
      row_id: uuidv4(),
      isNew: ["Insert", "Update"].includes(formStatus),
    },
  ]);
  setFocusedRowIndex(formData.length);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!["Insert", "Update"].includes(formStatus)) return;
    try {
      const accCodePurcVoch = validateForm( "acc-code-pur-vucr","Acc Code For Purchase Voucher");
      if (!accCodePurcVoch) return;
      

      const { type } = tempData;
      let newFormDataUpd = [];


      if (formStatus === "Update") {
        newFormDataUpd = formData.reduce((acc, row) => {
          if (row?.isNew) {
            acc.push({ ...row, type });
          }
          return acc;
        }, []);
      }

      const newUpdatedFormData = updateFormData.filter((item) => {
        if (item?.type != "") {
          return item;
        }
      });

      const transFormData = formData.map((row) => ({
        ...row,
        type,
        division_id: user.global_division_id,
      }));

      
    if (formStatus === "Insert" && !formData.some((row) => row?.isNew)) {
      toast.error("No new record added. Please insert at least one row before submitting.");
      return; // stop submit
    }

  
    if (formStatus === "Update" && newFormDataUpd.length === 0 && newUpdatedFormData.length === 0 && deleteRecord.length === 0) {
      toast.error("No changes received. Please add/modify/delete records before submitting");
      return; // stop submit
    }

      //  1. UI-level duplicate check
  const { isDuplicate, duplicateRow } = hasDuplicateRecords([...formData]);
  if (isDuplicate) {
    toast.error(`Duplicate record found in form (Acc No: ${duplicateRow.acc_no}, Type: ${duplicateRow.type})`);
    return; // stop submit
  }
  
        //  Duplicate check
    let rowsToCheck = [];
    if (formStatus === "Insert") {
      rowsToCheck = transFormData; // Insert me sari nayi rows
    } else if (formStatus === "Update") {
      rowsToCheck = [...newFormDataUpd, ...newUpdatedFormData]; 
      // Sirf nayi ya updated rows
    }

      for (const row of rowsToCheck) {
      //  Skip if row unchanged (came from DB and restored back)
      if (!row.isNew && !row.isEdited) {
        continue;
      }

      const result = await checkDuplicate({
        type: row.type,
        acc_no: row.acc_no,
        v_code: row.v_code,
        it_code: row.it_code,
        po_cat_prefix: row.po_cat_prefix,
        st_type: row.st_type,
        it_type: row.it_type,
        it_base: row.it_base,
        it_sub_c: row.it_sub_c,
      });

      if (!result.success) {
        toast.error(result.message || "Duplicate record found");
        return; //  stop submit
      }
    }

      const payload = {
        formData: formStatus == "Insert" ? []: newUpdatedFormData,
        newFormData: formStatus == 'Insert'?formData.filter((item)=>item?.isNew == true):newFormDataUpd,
        deletedData: deleteRecord,
        type
      };



      let method = formStatus === "Insert" ? "POST" : "PUT";

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_ACC_CODE_PURC_VOCH_FORM_DATA
        }?form_status=${formStatus}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Can't fetching error while submiting data");
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

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload =
        createSearchPayloadForAccCodePurcVucrSearch(tempData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_ACC_CODE_PURC_VOCH_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
      );

      if (data?.count === 0) {
        toast.error("No matching data record found");
        return;
      }
      setupQueryData(data, "Query");
      handleOperation("Query");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error?.message || "Some error occurred");
    }
  };

  const handleDelete = (rowId) => {
    setFormData((prevData) => {
      const row = prevData.find((r) => r.row_id === rowId);
      if (!row) return prevData;

      // Track server-side deletion only for existing rows in Update mode
      if (formStatus === "Update" && !row.isNew) {
        setDeleteRecord((prev) => {
          // avoid duplicates
          if (prev.some((r) => r.row_id === rowId)) return prev;
          return [...prev, row];
        });
      }

      // If this row had pending field changes, drop them
      setUpdateFormData((prev) => prev.filter((r) => r.row_id !== rowId));

      // Remove from table
      const next = prevData.filter((r) => r.row_id !== rowId);

      // Keep at least one blank row
      // if (next.length === 0) {
      //   return [{ ...accCodePurVcurBlockInitData, row_id: uuidv4() }];
      // }

      // Adjust focus (optional but nice)
      if (focusedRowIndex >= next.length) {
        setFocusedRowIndex(Math.max(0, next.length - 1));
      }

      return next;
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
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_ACC_CODE_PURC_VOCH_FORM_DATA}
        formName={"Account Code For Purchase Voucher"}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
         isQueryReqOnInsertBtn = {true}
         isQueryReqOnNextPreBtn = {true}
        reqCurrentQueryRecOnInsert = {true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <AccCodeForPurchaseVoucherHeader
              formData={formData}
              setFormData={setFormData}
              formStatus={formStatus}
              tempData={tempData}
              handleChange={handleChange}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              triggerAddRow={triggerAddRow}
              poCat={poCat}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              handleDelete={handleDelete}
              setHelpListHeader={setHelpListHeader}
              // actualData={actualData}
              // showRecord={showRecord}
              // setShowRecord={setShowRecord}
            />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_ACC_CODE_PURC_VOCH_FORM_DATA
                    }`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: "Y" }}
                    whereClause={
                      helpFor === "ItBase"
                        ? {
                            level1:
                              formData[selectedRowIndex ?? focusedRowIndex]
                                ?.it_type,
                          }
                        : helpFor === "ItSubc"
                        ? {
                            level1:
                              formData[selectedRowIndex ?? focusedRowIndex]
                                ?.it_type,
                            level2:
                              formData[selectedRowIndex ?? focusedRowIndex]
                                ?.it_base,
                          }
                        : {}
                    }
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
export default AccCodeForPurchaseVoucher;
