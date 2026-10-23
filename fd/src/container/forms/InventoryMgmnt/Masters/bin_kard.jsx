
import React, { useEffect } from 'react';
import { Form, Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import BinKardHeader from './bin_kard_header';
import BinKardDetails from './bin_kard_dtl';
import { binKardDetailFormData, binKardHeaderFormData, storeHelpListHeader } from './bin_kard_helper';
import HelpList from '../../../../components/HelpList';
import { APP_PROD_API } from '../../../../utils/api';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const BinKard = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...binKardHeaderFormData });
  // const [detailFormData, setDetailFormData] = useState([{ ...binKardDetailFormData }]);
  const [detailFormData, setDetailFormData] = useState([]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();

  // Initialize helpList to true to open the modal on mount
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState('');
  const [helpListHeader, setHelpListHeader] = useState([]);

  const toggleHelpModal = () => setHelpList(!helpList);

  const tabs = ["Bin Kard"];

  // Set formStatus to "Insert" to allow help list opening
  const { user } = useSelector((state) => state.auth);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);


    const location = useLocation();
  
  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  
  //   const docNo = params.get("doc_no");
  //   const fromTracker = params.get("fromTracker");
  
  //   // har doc ke liye alag key
  //   const trackerKey = `trackerSearch_${docNo}`;
  
  //   if (fromTracker === "true" && docNo && !sessionStorage.getItem(trackerKey)) {
  
  //     autoQueryFromTracker(docNo);
  
  //     sessionStorage.setItem(trackerKey, "true");
  //   }
  
  // }, []);
  
  // const autoQueryFromTracker = (docNo) => {
  
  //   setFormData(prev => ({
  //     ...prev,
  //     inv_no: docNo,
  //   }));
  
  //   setSearchQuery({ inv_no: docNo });
  
  //   handleOperation("Search");
  // };
  
  // useEffect(() => {
  //   if (formStatus === "Search" && formData?.inv_no) {
  //     handleSearch();
  //   }
  // }, [formStatus, formData.inv_no]);
  

  // Shows the Help list
  const handleHelpList = (show) => {
    setHelpList(show);
  };

  const onSelectHelpItem = (data) => {
    // //console.log(data);
    setFormData((prev) => {
      switch (helpFor) {
        case "store":
          return {
            ...prev,
            wc_no: data.wc_no,
            wc_id: data.wc_id,
            wc_description: data.description,
              // Clear item fields when store changes
          it_code: "",
          it_name: "",
          rate: "",
          opening_balance: "",
          cl_rate:"",
          closing_balance:"",
          };
        case "item":
          return {
            ...prev,
            fc_code: data.fc_code,
            it_code: data.it_code,
            it_name: data.it_name,
            rate: "",
          opening_balance: "",
          cl_rate:"",
          closing_balance:"",
          };
        default:
          return prev;
      }
    });
    setHelpList(false); // Close the help list after selection
  };

  function handleSubmit(e) {
    e.preventDefault();
    // //console.log("Form submitted", { formData, detailFormData });
  }

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    releaseFormStatus();
    setFormData({ ...binKardHeaderFormData });
    setDetailFormData([{ ...binKardDetailFormData }]);
  }, []);

  const handleChange = useCallback((stateKey, name, value, index, event) => {
    const cursorPosition = event?.target?.selectionStart;
    let newVal = value.toUpperCase();

    setFormData((prev) => {
      if (stateKey === "formData") {
        return { ...prev, [name]: newVal };
      }
      return prev;
    });

    if (stateKey === "detailFormData") {
      setDetailFormData((prevData) => {
        const newData = [...prevData];
        newData[index] = { ...newData[index], [name]: newVal };
        return newData;
      });
    }

    if (event) {
      setTimeout(() => {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, []);

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // No query logic needed as per requirement
    },
    [formStatus, currentRecordNo]
  );

  const triggerAddRow = () => {
    setDetailFormData((prev) => [
      ...prev,
      { ...binKardDetailFormData },
    ]);
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
        formData={formData}
        authority={{ insert: "N", update: "N" }}
        handleOffset={handleOffset}
        QUERY_API={"APP_PROD_API.GET_BIN_KARD_FORM_DATA"}
        btnEnableDtl={{query:false, search:false, insert:false}}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Form id='bin-kard-form'>
              <BinKardHeader
                formData={formData}
                formStatus={formStatus}
                handleChange={(name, value, event) => handleChange("formData", name, value, null, event)}
                handleHelpList={handleHelpList}
                setHelpFor={setHelpFor}
                setHelpListHeader={setHelpListHeader}
                user={user}
                setFormData={setFormData}
                setDetailFormData={setDetailFormData}
              />
              {helpList && (
                <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                  <ModalHeader toggle={toggleHelpModal}>Select Store</ModalHeader>
                  <ModalBody>
                    <HelpList
                      formStatus={"Insert"}
                      helpFor={helpFor}
                      apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BIN_KARD_FORM_DATA}`}
                      helpListHeader={helpListHeader}
                      handleHelpList={handleHelpList}
                      onSelectHelpItem={onSelectHelpItem}
                      queryPera={{ needAppGlobalData: 'Y', appDivisionId: '1', appFinYear: '2024' }}
                      whereClause={helpFor === 'item' ? { wc_id: formData.wc_id } : {}}
                    />
                  </ModalBody>
                </Modal>
              )}
            </Form>
            <BinKardDetails
              formData={formData}
              detailFormData={detailFormData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default BinKard;