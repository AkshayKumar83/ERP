
import React, { useEffect } from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import HelpList from '../../../../components/HelpList';
import { useSelector } from 'react-redux';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import BulkPoCreationHdr from './bulk_po_creation_hdr';
import { createSearchPayloadForBulkPoCreationSpecificSearch, poCreationData } from './bulk_po_creation_helper';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { useLocation, useNavigate } from "react-router-dom";

const BulkPoCreation = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([{...poCreationData,isNew: true}]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,
    setSearchQuery} = useFormStatus();

  const [helpList , setHelpList] = useState(false);
  const [helpFor,setHelpFor] = useState('');
  const [helpListHeader,setHelpListHeader] = useState([])
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const [deletedRecords, setDeletedRecords] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

const [isBulkPoCreated, setIsBulkPoCreated] = useState(false);
const [hasValidEntry, setHasValidEntry] = useState(false);


  const toggleHelpModal = () =>setHelpList(!helpList)

    const {user} = useSelector((state) => state.auth);

    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

  const tabs = [" Bulk Po Creation"];


    const navigate = useNavigate();

  const handleOpenForm = (po_no) => {
  navigate(`/module/materialMgmnt/60111?po_no=${encodeURIComponent(po_no)}`);
  };


  const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

  const handlePageChange = async (direction) => {
  const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
  if (newPage < 1) return;

  try {
    const offset = (newPage - 1) * PAGE_SIZE;
    const queryList = new URLSearchParams({
      ...searchQuery,       // re-use the same search criteria
      offset,
      limit: PAGE_SIZE,
    });

    const data = await fetchAppData(
      `${APP_PROD_API.GET_DATA_FOR_BULK_PO_CREATION_FORM}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
    );

    if (data?.type === "not_found" || !data?.bulkPoCreation?.length) {
  toast.error("No more records");
  return;
}

    setupQueryData(data, "Page");
    setCurrentPage(newPage);
  } catch (error) {
    toast.error(error?.message || "Error fetching page");
  }
};








     const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };



  const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    // ----------------------  WC NO SELECTION ----------------------
case "Vendor":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      v_code: data.v_code,
      v_name: data.v_name,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;

case "item":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      it_code: data.it_code,
      it_name: data.it_name,
      rate: data.it_rate,
      // rate_apprvd_by_chairman: data.rate_apprvd_by_chairman,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;
  
case "shipTo":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      ship_to: data.c_code,
      c_name: data.c_name,
      ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;

    // ----------------------  DEFAULT ----------------------
    default:
      console.warn("Unhandled help type:", helpFor);
      break;
  }

  toggleHelpModal();
};


  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


  useEffect(() => {
  const validRows = formData.filter(
    (row) =>
      row.po_date &&
      row.v_code &&
      row.it_code &&
      row.qty
      // row.po_closer
  );

  setHasValidEntry(validRows.length > 0);

  // agar user row change kare to fir dubara bulk button press karna pade
  setIsBulkPoCreated(false);
}, [formData]);




// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
   

//     let method = formStatus === "Insert" ? "POST" : "PUT";

//     let payload = {
//       division_id: user?.global_division_id || 1,
//       creation_date: new Date().toISOString().split("T")[0],
//     };

//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_BULK_PO_CREATION_FORM}?form_status=${formStatus}`,
//       {
//         method,
//         body: JSON.stringify(payload),
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );

//     const data = await response.json();

//     if (data?.type === "success") {
//       toast.success("Po Created successfully!");
//       formCleanup();
//     } else {
//       toast.error(data.message || "Something went wrong");
//     }
//   } catch (error) {
//     toast.error(error.message);
//   }
// };


const handleSubmit = async (e) => {
  e.preventDefault();

  // submit se pehle check
  if (!hasValidEntry) {
    toast.error("Please fill at least one entry first");
    return;
  }

  if (!isBulkPoCreated) {
    toast.error("Please press Bulk Po Creation button first");
    return;
  }

  try {
    let method = formStatus === "Insert" ? "POST" : "PUT";

    let payload = {
      division_id: user?.global_division_id || 1,
      creation_date: new Date().toISOString().split("T")[0],
    };

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_BULK_PO_CREATION_FORM}?form_status=${formStatus}`,
      {
        method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (data?.type === "success") {
      toast.success("Po Created successfully!");
      formCleanup();
      setIsBulkPoCreated(false);
    } else {
      toast.error(data.message || "Something went wrong");
    }
  } catch (error) {
    toast.error(error.message);
  }
};


// const bulkPoButton = async (e) => {
//   e.preventDefault();
//  if (!["Insert"].includes(formStatus)) return;
//   try {
//     const unitMaster = validateForm("rate-master", "Rate Master");
//     if (!unitMaster) return;

//     //  sirf valid rows bhejo (new + filled)
//   const validRows = formData.filter(
//   (row) =>
//     (row.isNew !== false) &&  
//     row.po_date &&
//     row.v_code &&
//     row.it_code &&
//     // row.ship_to &&
//     row.qty &&
//     // row.receipt_qty &&
//     row.po_closer
// );
//     console.log("FORM DATA:", formData);
// console.log("VALID ROWS:", validRows);

//     if (validRows.length === 0) {
//       toast.error("Please fill at least one valid row ");
//       return;
//     }

//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_BULK_PO_CREATION_BUTTON_FORM}`,
//       {
//         method: "POST",
//         body: JSON.stringify({ rows: validRows }),
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       }
//     );

//     const data = await response.json();

//     if (data?.type === "success") {
//       toast.success("Data moved to temp table successfully ");
//     } else {
//       toast.error(data.message || "Something went wrong");
//     }
//   } catch (error) {
//     toast.error(error.message);
//   }
// };



const bulkPoButton = async (e) => {
  e.preventDefault();

  if (!["Insert"].includes(formStatus)) return;

  try {
    const unitMaster = validateForm("rate-master", "Rate Master");
    if (!unitMaster) return;

    const validRows = formData.filter(
      (row) =>
        (row.isNew !== false) &&
        row.po_date &&
        row.v_code &&
        row.it_code &&
        row.qty
        // row.po_closer
    );

    if (validRows.length === 0) {
      toast.error("Please fill at least one valid row");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_BULK_PO_CREATION_BUTTON_FORM}`,
      {
        method: "POST",
        body: JSON.stringify({ rows: validRows }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (data?.type === "success") {
      toast.success("Data moved to temp table successfully");

      // IMPORTANT
      setIsBulkPoCreated(true);
    } else {
      toast.error(data.message || "Something went wrong");
    }
  } catch (error) {
    toast.error(error.message);
  }
};




  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    formCleanup()
  }, []);

  const formCleanup = ()=>{
    setFormData([{...poCreationData}]);
    setDeletedRecords([]);
      setCurrentPage(1); 
    setIsBulkPoCreated(false);
    setHasValidEntry(false);
    releaseFormStatus()
  }


const checkDuplicate = (data, index, fieldName, value) => {
  const currentRow = data[index];

  const it_code = fieldName === "it_code" ? value : currentRow.it_code;
  const rate_eff_dt = fieldName === "rate_eff_dt" ? value : currentRow.rate_eff_dt;

  return data.some((row, i) => {
    if (i === index) return false;

    return (
      row.it_code === it_code &&
      row.rate_eff_dt === rate_eff_dt
    );
  });
};



  const handleChange = useCallback(
   (name, value, index, event) => {
     if (!["Insert","Search", "Update"].includes(formStatus)) return;

        if (["v_code",'it_code','ship_to'].includes(name)) {
        toast.error("Please select value from Help List (double click)");
        return;
      }
 
     const cursorPosition = event.target.selectionStart;
   let newVal =
  event.target.type === "date" ? value : value.toUpperCase();
 
     setFormData((prevData) => {
       const newData = [...prevData];
         //  duplicate check
      // if (["it_code", "rate_eff_dt"].includes(name)) {
      //   const isDuplicate = checkDuplicate(newData, index, name, newVal);

      //   if (isDuplicate) {
      //     toast.error("Same Item Code + Date already exists ");
      //     return prevData; // update rok do
      //   }
      // }

        //  VALIDATION HERE
  if (name === "receipt_qty") {
    const currentRow = newData[index];
    const qty = Number(currentRow.qty || 0);
    const receiptQty = Number(newVal || 0);

    if (receiptQty > qty) {
      toast.error("Receipt Qty cannot be greater than PO Qty");
      return prevData;
    }
  }

      const updatedRow = {
  ...poCreationData,
  ...newData[index],
  [name]: newVal,
  isNew: newData[index]?.isNew ?? true  
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
 


const setupQueryData = useCallback((queryData, btnClicked) => {
  if (queryData?.type === "not_found" && btnClicked === 'Query') {
    toast.error("No Data Found");
    handleCancel()
    setFormData([]);
    setTotalRecordCount(0);
    return;
  }

  //  DETAIL + DATE FORMAT
  const formattedDetail = (queryData?.bulkPoCreation || []).map((item) => ({
    ...item,
     eff_date: item.eff_date? dateFormatter(item.eff_date): "",
     po_date: item.po_date? dateFormatter(item.po_date): "",
    //  old_it_code:item.it_code,
    //  old_rate_eff_dt:item.rate_eff_dt,
  }));

  setFormData(formattedDetail);

  setFocusedRowIndex(0);

  if (btnClicked === "Query") {
    setTotalRecordCount(queryData?.totalCount);
  }
}, [formStatus, currentRecordNo]);



  const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForBulkPoCreationSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_DATA_FOR_BULK_PO_CREATION_FORM}?formStatus=${formStatus}&appDivisionId=${
            user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

      const triggerAddRow = useCallback(() => {
  const unitMaster = validateForm("rate-master", "Rate Master");
  if (!unitMaster) return;

   setFormData((prevData) => {
    const newRow = { ...poCreationData,
       isNew: true,
       po_date: getCurrentDate(),
       }; 
    const newData = [...prevData, newRow];
    setFocusedRowIndex(newData.length - 1);
    return newData;
  });
}, [formData]);


 const handleDelete = (rowIndex) => {
  setFormData((prev) => {
    const deletedRow = prev[rowIndex];

    if (formStatus === "Update" && !deletedRow.isNew) {
      setDeletedRecords((prevDel) => [...prevDel, { ...deletedRow }]);
    }
    return prev.filter((_, idx) => idx !== rowIndex);
  });
  setFocusedRowIndex(0);
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
        QUERY_API={APP_PROD_API.GET_DATA_FOR_BULK_PO_CREATION_FORM}
        searchQueryPayload={formData}
       handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
        formName={"Bulk Po Creation"}
          // isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn={false}
        btnEnableDtl={{ update:false}}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            
                <BulkPoCreationHdr
                formData={formData}
                setFormData={setFormData}
                formStatus= {formStatus}
                handleChange= {handleChange}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                handleDelete={handleDelete}
                triggerAddRow={triggerAddRow}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
                bulkPoButton={bulkPoButton}
                handleOpenForm={handleOpenForm}
                 isBulkPoCreated={isBulkPoCreated}
                 hasValidEntry={hasValidEntry}
                currentPage={currentPage}
                totalRecordCount={totalRecordCount}
                pageSize={PAGE_SIZE}
                onPrev={() => handlePageChange("prev")}
                onNext={() => handlePageChange("next")}
                />
                {helpList && (
                  <Modal isOpen={helpList} toggle={toggleHelpModal} size='lg'>
                    <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                    <ModalBody>
                      <HelpList
                      formStatus={formStatus}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_BULK_PO_CREATION_FORM}`}
                      helpListHeader={helpListHeader}
                      handleHelpList={handleHelpList}
                      onSelectHelpItem={onSelectHelpItem}
                      queryPera={{needAppGlobalData:'Y'}} 
                      whereClause={{}}
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

export default BulkPoCreation;

