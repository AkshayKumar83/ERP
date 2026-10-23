


import React, { useEffect } from "react";
import { Modal,Form, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { useSelector } from "react-redux";
import HelpList from "../../../../components/HelpList";
import toast from "react-hot-toast";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useFormLoading } from "../../../../hooks/useFormLoading";

import DlrSubsidyAccountMstrHdr from "./dlr_subsidy_account_mstr_hdr";
import { createSearchPayloadForDlrSubsidyAccountMstrSpecificSearch } from "./dlr_subsidy_account_mstr_hlpr";



const DlrSubsidyAccountMstr = () => {

   const [activeTab, setActiveTab] = useState(1);
    const [currentRecordNo, setCurrentRecordNo] = useState(0);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [formData, setFormData] = useState({});
   const {formStatus, setFormStatus, handleOperation, releaseFormStatus,searchQuery,setSearchQuery } = useFormStatus();
   const { loading, setLoading, formLoading, setFormLoading } = useFormLoading()
      const [focusedRowIndex, setFocusedRowIndex] = useState(0);
      const { user } = useSelector((state) => state.auth);
    const [brandList, setBrandList] = useState([]);

    const [oldData, setOldData] = useState({});
  
         const [helpList, setHelpList] = useState(false);
           const [helpFor, setHelpFor] = useState("");
           const [helpListHeader, setHelpListHeader] = useState([]);
           const [isHelpModelOpen, setIsHelpModelOpen] = useState();
           const toggleHelpModal = () => setHelpList(!helpList);
   
    const tabs = ["Dealer Subsidy Account Master"];

   
           const updateActiveTab = useCallback((tab) => {
      setActiveTab(tab);
    }, []);


           useEffect(() => {
              const fetchLevel1 = async () => {
                const response = await fetch(
                  `${import.meta.env.VITE_BASE_API_URL}${
                    APP_PROD_API.GET_DLR_SUBSIDY_ACCOUNT_CONSTANT_LIST
                  }`,
                  { credentials: "include" }
                );
                const data = await response.json();
                      setBrandList([{ value: "", label: "" },...formatOptions(data?.brandList || [], "brand_code","description")])
              //    setPoNo([{value:'', label:''}, ...formatOptions(data.poCategoryList || [],"po_cat_prefix", "po_cat_description" )])
              
              };
          
              fetchLevel1();
            }, []);
  
      function handleOffset(data) {
          setCurrentRecordNo(data);
        }


             const handleHelpList = (show,) => {
            setHelpList(show);
          };
        
  const onSelectHelpItem = async (data) => {
  setFormData((prev) => {
    switch (helpFor) {
      case "CR":
        return {
          ...prev,
          cr_acc_no: data.acc_no,
          cr_name: data.acc_desc, 
        };

      case "DB":
        return {
          ...prev,
          dr_acc_no: data.acc_no,
          dr_name: data.acc_desc, 
        };

      default:
        return prev;
    }
  });
};
    const handleCancel = useCallback(() => {
      releaseFormStatus();
      setFormData({});
      setCurrentRecordNo(0);
      setTotalRecordCount(0);
      
    }, []);
  
   
  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
  
   if (!queryData || queryData.type === "not found") {
              toast.error("No Query data found");   
              setFormData({});  
              handleCancel()         
              setTotalRecordCount(0);
              return;
              }
  
     setFormData(queryData?.dlrSubsidyAccountData || {});
     setOldData(queryData?.dlrSubsidyAccountData || {});
  
      if (btnClicked === "Query") {
        setTotalRecordCount(queryData?.count);
      }
    },
    [formStatus, currentRecordNo]
  );
  
    

      
  
  
     async function handleSubmit(e) {
     e.preventDefault();
   
     const isValid = validateForm( "dlr-subsidy", "Dealer Subsidy Account Master" );
      if (!isValid) return;
     
     // payload prepare
     const payload = {
  formHdrData: { ...formData },
  oldData: { ...oldData }
};
   

     try {
   
       const apiUrl = `${import.meta.env.VITE_BASE_API_URL}${
         APP_PROD_API.POST_DLR_SUBSIDY_ACCOUNT_FORM_DATA
       }?form_status=${formStatus}`;
   
       const response = await fetch(apiUrl, {
         method: formStatus === "Update" ? "PUT" : "POST",
         headers: {
           "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify(payload),
       });
   
       const responseData = await response.json();
   
       if (!response.ok) {
         throw new Error(
           responseData?.message || "Failed to save record"
         );
       }
   
       toast.success(
         formStatus === "Update"
           ? "Record updated successfully"
           : "Record saved successfully"
       );
   
       handleCancel();
   
       console.log("submit payload ::", payload);
       console.log("responseData ::", responseData);
     } catch (error) {
       console.error("Submission error:", error);
       toast.error(
         error?.message || "Something went wrong during submission"
       );
     }
   }
  
   
const handleChange = useCallback(
  (event, name, value) => {

    if (!["Insert", "Update", "Search"].includes(formStatus))
      return;

    const cursorPosition =
      event?.target?.selectionStart;

    let newVal = value;

    if (typeof value === "string") {

      newVal =
        name === "email"
          ? value.toLowerCase()
          : value.toUpperCase();
    }

    // ===== formData =====

    setFormData((prev) => ({
      ...prev,
      [name]: newVal,
    }));

    // cursor restore
  if (
    event?.target &&
    ["INPUT", "TEXTAREA"].includes(
      event.target.tagName
    ) &&
    !["number", "radio", "checkbox", "date"].includes(
      event.target.type
    )
  ) {

      setTimeout(() => {

        event.target.setSelectionRange(
          cursorPosition,
          cursorPosition
        );

      }, 0);
    }
  },
  [formStatus]
);
    
   const handleSearch = async () => {
        try {
          setTotalRecordCount(0);
          setCurrentRecordNo(0);
          const searchPayload = createSearchPayloadForDlrSubsidyAccountMstrSpecificSearch(formData);
          const queryList = new URLSearchParams(searchPayload);
    
          if ([...queryList].length === 0) {
            toast.error("Please enter search criteria");
            return;
          }
    
          setSearchQuery(searchPayload);
    
          const data = await fetchAppData(
            `${APP_PROD_API.GET_DLR_SUBSIDY_ACCOUNT_QUERY_DATA}?formStatus=${formStatus}&appDivisionId=${
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
      QUERY_API={APP_PROD_API.GET_DLR_SUBSIDY_ACCOUNT_QUERY_DATA}
      searchQueryPayload={formData}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      setSearchQuery={setSearchQuery}
      formName={"Board Member"}
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <Form id="dlr-subsidy">
            <DlrSubsidyAccountMstrHdr
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              brandList={brandList}
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
                                                        APP_PROD_API.GET_DLR_SUBSIDY_ACCOUNT_QUERY_DATA
                                                    }`}
                                                    helpListHeader={helpListHeader}
                                                    handleHelpList={handleHelpList}
                                                    onSelectHelpItem={onSelectHelpItem}
                                                    queryPera={{ needAppGlobalData: "Y" }}
                                                />
                                            </ModalBody>
                                        </Modal>
                                    )}

          </Form>
        </TabPane>
      
      </TabContent>
    </FormSetup>
  );
};

export default DlrSubsidyAccountMstr;
