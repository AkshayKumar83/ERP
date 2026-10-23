import React, { useEffect } from 'react'
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import ChequeBookEntryHeader from './cheque_book_entry_header';
import ChequeBookEntryDetail from './cheque_book_entry_detail';
import { checkChequeNoExists, checkOpenFlagExists, createSearchPayloadForChqBookEntrySpecificSearch, detailsInitData, hasDuplicateSectionDivision, headersInitData } from './cheque_bookEntry_helper';
import { APP_PROD_API } from '../../../../utils/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import HelpList from '../../../../components/HelpList';
import { formatOptions } from '../../../../lib';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import { fetchAppData } from '../../../../utils/fetchUtils';

const ChequeBookEntry = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({...headersInitData});
    const [detailFormData, setDetailFormData] = useState([])
  const {formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,
    setSearchQuery } = useFormStatus();

  const [helpList, setHelpList] = useState(false);
    const [helpFor, setHelpFor] = useState("");
    const [helpListHeader, setHelpListHeader] = useState([]);
    const [isHelpModelOpen, setIsHelpModelOpen] = useState();
    const toggleHelpModal = () => setHelpList(!helpList);

    const { user } = useSelector((state) => state.auth);
   const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    
      
      // BELOW STATE USED FOR DROPDOWN INPUTS
      const [sectionId,setSectionId] = useState([]);
      const [divisionId, setDivisionId] = useState([]);

  const tabs = ["Cheque Book Entry"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


    const handleHelpList = (data) => {
        setHelpList(data);
    };

    const onSelectHelpItem = (data) => {
        
        setFormData((prev) => {
            switch (helpFor) {
                case "bankCode":
                    return {
                        ...prev,
                        bank_acc_no: data.acc_no,
                        acc_desc: data.bank_name,  
                    };
               
                default:
                    return prev;
            }
        });
    };

    // dropdown function
    
    useEffect(() =>{
       // HERE I FETCH ALL REQUIRED DROPDOWN DATA
              // REQURIED DATA FOR MAKING THE FORM AUTO OR MANUAL
    
               const fetchConstantList = async () =>{
                try {
                  const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CHEQUE_BOOK_ENTRY_DROPDOWN_DATA}`,{
                    credentials:'include'
                  })
                  if(response.status === 200) {
                    const data = await response.json();
                    setSectionId([{value:'', label:''}, ...formatOptions(data.sectionIdList || [],"section_id", "section_desc" )])
                    setDivisionId([{value:'', label:''}, ...formatOptions(data.divisionId || [],"division_id", "name" )])
                  }
                } catch (error) {
                 
                  
                }
               }
               if (formStatus){
                fetchConstantList();
               }
    
    },[formStatus])
    

  function handleOffset(data){
    setCurrentRecordNo(data)
}

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus()
    setFormData({});
    setDetailFormData([])
  }, []);

//  const handleChange = useCallback((name, value, index = null, event = null) => {
//   if(!["Insert","Search","Update"].includes(formStatus))return;

//   if(['bank_acc_no'].includes((name))){
//     toast.error("Please select bank acc on helplist")
//     return;
//   }
//       let newVal = value.toUpperCase();
    
//       if (index === null) {
//         // If index is null, update the main form data
//         setFormData(prev => ({ ...prev, [name]: newVal }));
//       } else {
//         // If index exists, update the detail form data (table)
//         const cursorPosition = event?.target?.selectionStart || 0;
    
//         setDetailFormData(prevData => {
//           const newData = [...prevData];
//           newData[index] = { ...newData[index], [name]: newVal };
//           return newData;
//         });
    
//         setTimeout(() => {
//           event?.target?.setSelectionRange(cursorPosition, cursorPosition);
//         }, 0);
//       }
//     }, [formStatus]);

 const handleChange = useCallback((name, value, index = null, event = null) => {
  if(!["Insert","Search","Update"].includes(formStatus)) return;

  if(['bank_acc_no'].includes(name)){
    toast.error("Please select bank acc on helplist");
    return;
  }

  const target = event?.target;
  const cursorPosition = target?.selectionStart ?? null;

  let newVal = value.toUpperCase();

  if (index === null) {
    // Update main form data
    setFormData(prev => ({ ...prev, [name]: newVal }));
  } else {
    // Update detail table data
    setDetailFormData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [name]: newVal };
      return newData;
    });
  }

  // Cursor restore both case run
  if (cursorPosition !== null && target?.setSelectionRange) {
    setTimeout(() => {
      try {
        target.setSelectionRange(cursorPosition, cursorPosition);
      } catch {}
    }, 0);
  }
}, [formStatus]);


  const triggerAddRow = () => {
  const lastRow = detailFormData[detailFormData.length - 1];
  
   const chqBookHdr = validateForm('chq-book', 'Cheque Book Entry');
        if (!chqBookHdr) {
          return;
        }

  // 1. Check duplicate combination
  if (hasDuplicateSectionDivision(detailFormData)) {
    toast.error("Duplicate combination (Section and Division) is not allowed!");
    return;
  }

        const chqBookDetail = validateForm('Cheque-Book-entry','Cheque Book Entry')
        if (!chqBookDetail) {
          return;
        }


  // 3. Add new row and focus on it
    setDetailFormData((prev) => [...prev, { ...detailsInitData }]);
    setFocusedRowIndex(detailFormData.length); // last index (new row)
  };


      
  const setupQueryData = useCallback(
      (queryData, btnClicked) => {
        
        
     if (queryData?.headerData) {
         const formattedData = {
           ...queryData.headerData,
           issue_dt: dateFormatter(queryData.headerData.issue_dt)
         };
         setFormData(formattedData);
       }
   setDetailFormData(
  (queryData.detailData || []).map((item) => ({
    ...item,
    _rowKey: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    prev_section_id: item.section_id,
    prev_division_id: item.division_id,
  }))
);
   setFocusedRowIndex(0)
  if (btnClicked === "Query") {
            setTotalRecordCount(queryData.count);
             if (!queryData?.headerData) {
        toast.error(queryData.message || "No User data found");
        handleCancel()
        return;
      }
          }
      },
      [formStatus, currentRecordNo]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!["Insert","Update"].includes(formStatus)) return;
    try {
     
        const chqBookHdr = validateForm('chq-book', 'Cheque Book Entry');
        if (!chqBookHdr) {
          return;
        }

        if (detailFormData.length === 0) {
            toast.error("At least one detail record is required");
            return;
          }
        const chqBookDetail = validateForm('Cheque-Book-entry','Cheque Book Entry')
        if (!chqBookDetail) {
          return;
        }

        // Additional open_flag validation before submission
          if (formData.open_flag === "Y" && formData.bank_acc_no) {
            const exists = await checkOpenFlagExists(
              formData.bank_acc_no,
              // formData.section_id,
              // formData.division_id,
              formData.chq_id 
            );

            if (exists) {
              setFormData((prev) => ({ ...prev, open_flag: "N" }));
              document.getElementById("open_flag")?.focus();
              return;
            }
          }
                    // Check duplicate section+division before submit
      if (hasDuplicateSectionDivision(detailFormData)) {
        toast.error("Duplicate combination of Section and Division  ");
        return;
      }

      // --- Duplicate cheque no. final validation ---
       // --- Last Cheque Validation on submit ---
       const { chq_no_strt, chq_no_end, last_chq_no_used, bank_acc_no, chq_id } = formData;
                if (
            chq_no_strt &&
            chq_no_end &&
            parseInt(chq_no_strt) > parseInt(chq_no_end)
          ) {
             toast.error("Cheque end number can not be less than Cheque start number")
             return;
          }

            if (last_chq_no_used) {
              if (
                parseInt(last_chq_no_used) < parseInt(chq_no_strt) ||
                parseInt(last_chq_no_used) > parseInt(chq_no_end)
              ) {
                //  toast.error("Last used No. does not fall between Start no. and End no.");
                document.getElementById("last_chq_no_used")?.focus();
                return;
              }
            }

    if (chq_no_strt && (await checkChequeNoExists(chq_no_strt, bank_acc_no, chq_id))) {
      document.getElementById("chq_no_strt")?.focus();
      return;
    }

    if (chq_no_end && (await checkChequeNoExists(chq_no_end, bank_acc_no, chq_id))) {
      document.getElementById("chq_no_end")?.focus();
      return;
    }
      const updatedDetailData = detailFormData.map((detail) => ({
        ...detail,
        chq_id,
      }));

      const payload = {
        ...formData,
        detailFormData: updatedDetailData,
      };

      let method = formStatus === "Insert" ? "POST" : "PUT";
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_CHEQUE_BOOK_ENTRY_FORM_DATA}?form_status=${formStatus}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Can't fecthing error while submiting data.");
      }

      toast.success(`Data saved successfully!`);
      handleCancel();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Please check all the form fields or contact administrator");
    }
  };


  const handleSearch = async () => {
      try {
        setTotalRecordCount(0);
        setCurrentRecordNo(0);
        const searchPayload = createSearchPayloadForChqBookEntrySpecificSearch(formData);
        const queryList = new URLSearchParams(searchPayload);
  
        if ([...queryList].length === 0) {
          toast.error("Please enter search criteria");
          return;
        }
  
        setSearchQuery(searchPayload);
  
        const data = await fetchAppData(
          `${APP_PROD_API.GET_CHEQUE_BOOK_ENTRY_FORM_DATA}?formStatus=${formStatus}&appDivisionId=${
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
        QUERY_API={APP_PROD_API.GET_CHEQUE_BOOK_ENTRY_FORM_DATA}
        formName={"Cheque Book Entry"}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
                <ChequeBookEntryHeader
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                detailFormData={detailFormData}
                formStatus={formStatus}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                />
                  {helpList && (
                            <Modal
                                isOpen={helpList}
                                toggle={toggleHelpModal}
                                size="lg"
                            >
                                <ModalHeader
                                    toggle={toggleHelpModal}
                                ></ModalHeader>
                                <ModalBody>
                                    <HelpList
                                        formStatus={formStatus}
                                        helpFor={helpFor}
                                        apiUrl={`${
                                            import.meta.env.VITE_BASE_API_URL
                                        }${
                                            APP_PROD_API.GET_CHEQUE_BOOK_ENTRY_FORM_DATA
                                        }`}
                                        helpListHeader={helpListHeader}
                                        handleHelpList={handleHelpList}
                                        onSelectHelpItem={onSelectHelpItem}
                                        queryPera={{ needAppGlobalData: "Y" }}
                                    />
                                </ModalBody>
                            </Modal>
                        )}
                <ChequeBookEntryDetail 
                detailFormData={detailFormData}
                handleChange={handleChange}
                triggerAddRow={triggerAddRow}
                // handleDelete={handleDelete}
                formStatus={formStatus}
                sectionId={sectionId}
                divisionId={divisionId}
                focusedRowIndex={focusedRowIndex}
                setFocusedRowIndex={setFocusedRowIndex}
                />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default ChequeBookEntry;

