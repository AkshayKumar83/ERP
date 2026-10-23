
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
import { createSearchPayloadForBulkPoCreationSpecificSearch } from './po_closure_hlpr';
import { fetchAppData } from '../../../../utils/fetchUtils';
import { useLocation, useNavigate } from "react-router-dom";
import PoClosureHdr from './po_closure_hdr';

const PoClosure = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus ,searchQuery,
    setSearchQuery} = useFormStatus();

  const [helpList , setHelpList] = useState(false);
  const [helpFor,setHelpFor] = useState('');
  const [helpListHeader,setHelpListHeader] = useState([{}])
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);


  const toggleHelpModal = () =>setHelpList(!helpList)

    const {user} = useSelector((state) => state.auth);

    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

  const tabs = ["PO Closure"];

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
      `${APP_PROD_API.GET_DATA_FOR_PO_CLOSURE_FORM}?formStatus=${formStatus}&appDivisionId=${
        user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
    );

    if (data?.type === "not_found" || !data?.PoClosure?.length) {
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
 
case "Vendor":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      v_code: data.v_code,
      v_name: data.v_name,
    //   ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
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
      c_code: data.c_code,
      c_name: data.c_name,
    //   ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
    };

    return updated;
  });
  break;
case "PoNo":
  setFormData((prev) => {
    const updated = [...prev];
    const row = updated[selectedRowIndex];

    updated[selectedRowIndex] = {
      ...row,
      po_no: data.po_no,
    //   ...(formStatus === "Update" && !row?.isNew && { isStatus: "changed" })
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

const handleSubmit = async (e) => {
  e.preventDefault();


  try {
    let method = formStatus === "Insert" ? "POST" : "PUT";

  const payload = formData
   .filter(row => row.isChanged)
  .map((row) => ({
    po_id: row.po_id,
    closure_flag: row.closure_flag,
    closure_date: row.closure_date,
    closure_by: row.user_id,  
  }));

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_PO_CLOSURE_FORM}?form_status=${formStatus}`,
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
    setFormData([{}]);
      setCurrentPage(1); 
    releaseFormStatus()
  }

const userMap = {
  611: "AKSHAY KUMAR",
  613: "SANDEEP",
  614: "REKHA",
};



const handleChange = useCallback(
  async (name, value, index, event) => {
     if (!["Search", "Update"].includes(formStatus)) return;

        if (["v_code",'c_code'].includes(name)) {
        toast.error("Please select value from Help List (double click)");
        return;
      }
 
     const cursorPosition = event.target.selectionStart;
    let newVal = event.target.type === "date" ? value : value.toUpperCase();
 
//      if (name === "closure_flag") {
 
//   if (value === "Y" && !userMap[user.id]) {
//     toast.error("You have not rights to close these PO.");
//     return;
//   }

//      const today = new Date().toISOString().split("T")[0];
//      const loggedUserName = userMap[user.id] || "";

// setFormData((prev) => {
//     const updated = [...prev];

//     updated[index] = {
//       ...updated[index],
//       closure_flag: value,
//       closure_date: value === "Y" ? today : null,
//       closure_by: value === "Y" ? loggedUserName : "",
//       user_id: value === "Y" ? user.id : null,
//       isChanged:updated[index].original_closure_flag !== value
//     };

//     return updated;
//   });

//   return;
// }


if (name === "closure_flag") {

  // Only when checking the checkbox
  if (value === "Y") {

    // Rights check
    if (!userMap[user.id]) {
      toast.error("You have not rights to close these PO.");
      return;
    }

    const poId = formData?.[index]?.po_id;

    if (!poId) {
      toast.error("PO ID not found.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.CHECK_PO_GATE_ENTRY
        }?po_id=${poId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.can_close) {
        toast.error(
          data?.message ||
            "You cannot close this PO because gate entry is required."
        );

        // ❌ Do not update checkbox state
        return;
      }

    } catch (error) {
      console.error("Gate entry check error:", error);

      toast.error(
        "Unable to verify gate entry. PO cannot be closed."
      );

      // ❌ Do not update checkbox
      return;
    }
  }

  // ✅ Only reaches here when:
  // - value = N
  // OR
  // - value = Y and gate entry exists

  const today = new Date().toISOString().split("T")[0];
  const loggedUserName = userMap[user.id] || "";

  setFormData((prev) => {
    const updated = [...prev];

    updated[index] = {
      ...updated[index],
      closure_flag: value,
      closure_date: value === "Y" ? today : null,
      closure_by: value === "Y" ? loggedUserName : "",
      user_id: value === "Y" ? user.id : null,
      isChanged: updated[index].original_closure_flag !== value,
    };

    return updated;
  });

  return;
}

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
  const formattedDetail = (queryData?.PoClosure || []).map((item) => ({
    ...item,
     original_closure_flag: item.closure_flag,
     closure_date: item.closure_date? dateFormatter(item.closure_date): "",

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
            `${APP_PROD_API.GET_DATA_FOR_PO_CLOSURE_FORM}?formStatus=${formStatus}&appDivisionId=${
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
        QUERY_API={APP_PROD_API.GET_DATA_FOR_PO_CLOSURE_FORM}
        searchQueryPayload={formData}
       handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
        formName={"PO Closure"}
          // isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn={false}
        btnEnableDtl={{ insert:false}}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            
                <PoClosureHdr
                formData={formData}
                setFormData={setFormData}
                formStatus= {formStatus}
                handleChange= {handleChange}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
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
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_PO_CLOSURE_FORM}`}
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

export default PoClosure;



