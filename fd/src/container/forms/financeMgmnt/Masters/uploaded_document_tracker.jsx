import React, { useEffect } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import UploadedDocTrackerHdr from "./uploaded_document_tracker_header";
import { createSearchPayloadForUplDocTrackerSpecificSearch, upldDocTrackerInitialData } from "./uploaded_document_tracker_helpler";
import { formatOptions } from "../../../../lib";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";


const UploadedDocumentTracker = () => {

  const [activeTab, setActiveTab] = useState(1);
      const [currentRecordNo, setCurrentRecordNo] = useState(0);
      const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ upldd_filename: "", details: []});
        const { formStatus, setFormStatus, handleOperation, releaseFormStatus,  searchQuery,
         setSearchQuery, } =
             useFormStatus();
      const [focusedRowIndex, setFocusedRowIndex] = useState(0);
     const [uploadfile, setUploadfile] = useState([]);

    const { user } = useSelector((state) => state.auth);


      const tabs = ["Uploaded Document Tracker"];
  
      const updateActiveTab = useCallback((tab) => {
          setActiveTab(tab);
      }, []);
  
      function handleOffset(data) {
          setCurrentRecordNo(data);
      }

    const navigate = useNavigate();


const location = useLocation();

 useEffect(() => {
  const params = new URLSearchParams(location.search);

  const file_name = params.get("file_name");


  if (file_name) {
    // flag consume karo taaki refresh par na chale
    sessionStorage.removeItem("fromTrackerNav");

    autoQueryFromTracker(file_name);
  }
}, []);

  const autoQueryFromTracker = (fileName) => {
    setFormData((prev) => ({
      ...prev,
      upldd_filename: fileName,
    }));

    setSearchQuery({ upldd_filename: fileName });

    handleOperation("Search");
  };


  useEffect(() => {
    if (formStatus === "Search" && formData?.upldd_filename) {
      handleSearch();
    }
  }, [formStatus, formData.upldd_filename]);


    const DOC_TYPE_ROUTE_MAP = {
      "INVOICE": {
        path: "/module/saleMgmnt/20303",
        formName: "Service Invoice",
      },
      "BIN KARD": {
        path: "/module/whMgmnt/30110",
        formName: "Bin Kard",
      },
      "GE": {
        path: "/module/materialMgmnt/60106",
        formName: "Gate Entry",
      },
      "ITC": {
        path: "/module/financeMgmnt/40406",
        formName: "ITC",
      },
      "PURCHASE VOUCHER": {
        path: "/module/financeMgmnt/40211",
        formName: "Purchase Voucher",
      },
      "JOURNAL VOUCHER": {
        path: "/module/financeMgmnt/40403",
        formName: "Journal Voucher",
      },
    };

 
const handleOpenForm = (docType, docId, docNo) => {
  const mapping = DOC_TYPE_ROUTE_MAP[docType?.toUpperCase()];
  if (!mapping) return;

sessionStorage.setItem(
  "TRACKER_STATE",
  JSON.stringify({
    formData,
    searchQuery,
    totalRecordCount,
    currentRecordNo,
    focusedRowIndex
  })
);

sessionStorage.setItem("fromTrackerNav", "true");

navigate(
  `${mapping.path}?doc_id=${docId}&doc_no=${docNo}&fromTracker=true`
);
}


useEffect(() => {
  const savedState = sessionStorage.getItem("TRACKER_STATE");

  if (savedState) {
    const parsed = JSON.parse(savedState);
    setFormData(parsed.formData);
    setSearchQuery(parsed.searchQuery);
    setTotalRecordCount(parsed.totalRecordCount || 0);
    setCurrentRecordNo(parsed.currentRecordNo || 0);
    setFocusedRowIndex(parsed.focusedRowIndex || 0);
    setFormStatus("Query");

    // ✅ important
    sessionStorage.removeItem("TRACKER_STATE");
  }
}, []);


  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_UPLD_DOC_TRACKER_LIST_OF_CONSTANTS
          }`,
          {
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setUploadfile([
            { value: "", label: "" },
            ...formatOptions(
              data.uploadFile || [],
              "upldd_filename",
              "upldd_filename"
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


  
      function formCleanup() {
          setFormData({ upldd_filename: "", details: [] });
          releaseFormStatus();
          setFocusedRowIndex(0);
      }
  
      const handleCancel = useCallback(() => {
          formCleanup();
      }, []);


  const handleChange = useCallback((name, value, index = null, event = null) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) return;

      const cursorPosition = event?.target?.selectionStart;
      const newVal = value?.toUpperCase();

      setFormData(prev => {
        //  HEADER UPDATE
        if (index === null || index === undefined) {
          return {
            ...prev,
            [name]: newVal,
          };
        }

        //  TABLE UPDATE
        const updatedDetails = [...prev.details];

        updatedDetails[index] = {
          ...updatedDetails[index],
          [name]: newVal,
        };

        return {
          ...prev,
          details: updatedDetails,
        };
      });

      if (event?.target && cursorPosition !== undefined) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }
    },
    [formStatus]
  );


  const triggerAddRow = () => {
      // setFormData(prev => {
      //   const newDetails = [
      //     ...prev.details,
      //     { ...upldDocTrackerInitialData },
      //   ];

      //   setFocusedRowIndex(newDetails.length - 1);

      //   return {
      //     ...prev,
      //     details: newDetails,
      //   };
      // });
  };


const setupQueryData = useCallback(
  (data, btnClicked) => {
    if (!data) return;

    if (data?.header?.type === "not found") {
      toast.error("No Record Found");
      handleCancel();
      return;
    }

    const { header, detail, count } = data;

    if (!header) {
      setFormData({
        upldd_filename: "",
        details: [],
      });
      return;
    }

    const formattedDetails =
      detail && detail.length > 0
        ? detail.map((item) => ({
            ...item,
            doc_date: item.doc_date
              ? dateFormatter(item.doc_date)
              : "",
          }))
        : [];

    setFormData({
      upldd_filename: header.upldd_filename || "",
      details: formattedDetails,
    });

    if (btnClicked === "Query") {
      setTotalRecordCount(count || 0);
    }

    setFocusedRowIndex(0);
  },
  [handleCancel]
);

  const handleDelete = (index) => {
    // setFormData(prev => {
    //   const updatedRows = prev.details.filter((_, i) => i !== index);

    //   return {
    //     ...prev,
    //     details:
    //       updatedRows.length > 0
    //         ? updatedRows
    //         : [{ ...upldDocTrackerInitialData }],
    //   };
    // });

    // setFocusedRowIndex(prev => (prev > 0 ? prev - 1 : 0));
    };
      
     const handleSubmit = async (e) => {
          
       };

          const handleSearch = async () => {
           try {
             setTotalRecordCount(0);
             setCurrentRecordNo(0);
             const searchPayload = createSearchPayloadForUplDocTrackerSpecificSearch(formData);
             const queryList = new URLSearchParams(searchPayload);
       
             if ([...queryList].length === 0) {
               toast.error("Please enter search criteria");
               return;
             }
       
             setSearchQuery(searchPayload);
       
             const data = await fetchAppData(
               `${APP_PROD_API.GET_UPLD_DOC_TRACKER_DATA}?formStatus=${formStatus}&appDivisionId=${
               user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
             );
       
             if (data?.count === 0) {
               toast.error("No matching data record found");
               handleCancel()
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
                QUERY_API={APP_PROD_API.GET_UPLD_DOC_TRACKER_DATA}
                formName={"Uploaded Document Tracker"}
                //  isQueryReqOnInsertBtn={true}
                // isQueryReqOnNextPreBtn={false}
                searchQueryPayload={formData}
                handleSearch={handleSearch}
                formPayload={{ searchQuery }}
                setSearchQuery={setSearchQuery}
                 btnEnableDtl={{ insert:false, update:false}}
            >
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <UploadedDocTrackerHdr
                            formData={formData}
                            handleChange={handleChange}
                            formStatus={formStatus}
                            triggerAddRow={triggerAddRow}
                            handleDelete={handleDelete}
                            focusedRowIndex={focusedRowIndex}
                            setFocusedRowIndex={setFocusedRowIndex}
                            details={formData.details}
                            uploadfile={uploadfile}
                            handleOpenForm={handleOpenForm}
                        />
                        
                    </TabPane>
                </TabContent>
            </FormSetup>
        </React.Fragment>
    );
};

export default UploadedDocumentTracker