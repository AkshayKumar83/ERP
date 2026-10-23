
import React, { useEffect } from "react";
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from "../../../../utils/api";
import HelpList from "../../../../components/HelpList";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";
import CopyRoutingHeader from "./copy_routing_header";
import { copyRoutingData, validateFromDb } from "./copy_routing_helper";

const CopyRouting = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [tempData, setTempData] = useState({});
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery, setSearchQuery} = useFormStatus();
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);
  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);


  const { user } = useSelector((state) => state.auth);

  const tabs = [];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);





  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = () => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData([]);
    setTempData({});
    setFocusedRowIndex(0);
  };

   const handleHelpList = (show, rowIndex = -1) => {
      setHelpList(show);
    
    };
  
  
  
const onSelectHelpItem = async (data) => {
  switch (helpFor) {
    case "fromRoute": {
      const value = data.route_no;

      const res = await validateFromDb({
        type: "FROM_ROUTE_NO",
        value,
      });
      if (!res) return;

      setTempData(prev => ({
        ...prev,
        from_route_no: value,
      }));
      break;
    }

    case "toRoute": {
      const value = data.it_code;

      const res = await validateFromDb({
        type: "TO_ROUTE_NO",
        value,
      });
      if (!res) return;

      setTempData(prev => ({
        ...prev,
        to_route_no: value,
      }));
      break;
    }
  }

  setHelpList(false);
};


  const handleChange = (name, value, index = null, event = null) => {
  if (!["Insert"].includes(formStatus)) return;

    if (["from_route_no", "to_route_no"].includes(name)) {
             toast.error("Please select value from Help List (double click)");     return;
           }

  const newVal = typeof value === "string" ? value.toUpperCase() : value;

  //  HEADER (tempData)
  if (index === null) {
    setTempData(prev => ({
      ...prev,
      [name]: newVal,
    }));
    return;
  }

  //  TABLE (formData)
  setFormData(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      [name]: newVal,
    };
    return updated;
  });
    setTimeout(() => {
      if (event?.target && ["text", "number", "email", "search", "tel", "url", "password"].includes(event.target.type)) {
        event.target.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
};


  const setupQueryData = useCallback(
   
  );


// const triggerAddRow = () => {
//   if (!["Insert", "Update"].includes(formStatus)) return;

//   setFormData(prev => [
//     ...prev,
//     {
//       ...copyRoutingData
//     },
//   ]);

//   setFocusedRowIndex(formData.length);
// };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
   
    const isValid = validateForm("copy-routing", "Copy Routing");
    if (!isValid) return;

  
    if (!formData || formData.length === 0) {
      toast.error("Please use Fill button to load routing rows");
      return;
    }

    for (let i = 0; i < formData.length; i++) {
      const row = formData[i];

      if (!row.new_it_code || !row.new_final_code) {
        toast.error(
          `Row ${i + 1}: New Output Code and New Final Code are required`
        );
        return;
      }
    }

   
    // Only SELECT_CHECK = 'N' rows will be copied
    const rowsToCopy = formData.filter(
      row => row.select_check === 'N'
    );

    if (rowsToCopy.length === 0) {
      toast.error("No rows available for copy");
      return;
    }

    //  payload (aligned with PG procedure)
    const payload = {
      from_route_no: tempData.from_route_no,
      to_route_no: tempData.to_route_no,
      fin_year: user?.global_fin_year,
      rows: rowsToCopy.map(row => ({
        new_it_code: row.new_it_code,
        new_final_code: row.new_final_code,
      })),
    };

  
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_COPY_ROUTING_DATA}?form_status=${formStatus}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error while copying routing");
    }

    toast.success("Routing copied successfully");
    handleCancel();

  } catch (error) {
    console.error("Submit error:", error);
    toast.error(
      error.message ||
      "Please check all the form fields or contact administrator"
    );
  }
};


  // const handleSearch = async () => {
  //   try {
  //     setTotalRecordCount(0);
  //     setCurrentRecordNo(0);
  //     const searchPayload =
  //       createSearchPayloadForAccCodePurcVucrSearch(tempData);
  //     const queryList = new URLSearchParams(searchPayload);

  //     if ([...queryList].length === 0) {
  //       toast.error("Please enter search criteria");
  //       return;
  //     }

  //     setSearchQuery(searchPayload);

  //     const data = await fetchAppData(
  //       `${APP_PROD_API.POST_COPY_ROUTING_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&${queryList}`
  //     );

  //     if (data?.count === 0) {
  //       toast.error("No matching data record found");
  //       return;
  //     }
  //     setupQueryData(data, "Query");
  //     handleOperation("Query");
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error(error?.message || "Some error occurred");
  //   }
  // };

// const handleDelete = (index) => {
//   if (!["Insert", "Update"].includes(formStatus)) return;

//   setFormData(prev => prev.filter((_, i) => i !== index));

//   setFocusedRowIndex(prev =>
//     prev > 0 ? prev - 1 : 0
//   );
// };


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
        QUERY_API={APP_PROD_API.GET_COPY_ROUTING_FORM_DATA}
        formName={"Copy Routing"}
        //  isQueryReqOnInsertBtn = {true}
        //  isQueryReqOnNextPreBtn = {true}
        // reqCurrentQueryRecOnInsert = {true}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <CopyRoutingHeader
              formData={formData}
              setFormData={setFormData}
              formStatus={formStatus}
              tempData={tempData}
              setTempData={setTempData}
              handleChange={handleChange}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              // triggerAddRow={triggerAddRow}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              // handleDelete={handleDelete}
              setHelpListHeader={setHelpListHeader}
            />
            {helpList && (
              <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_COPY_ROUTING_FORM_DATA
                    }`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    queryPera={{ needAppGlobalData: "Y" }}
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
export default CopyRouting;
