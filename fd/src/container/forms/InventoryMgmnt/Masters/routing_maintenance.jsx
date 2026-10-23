
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import RoutingMaintenanceHeader from './routing_maintenance_header';
import RoutingMaintenanceDetails from './routing_maintenance_details';
import RoutingMaintenaceCopyRoute from './routing_maintenace_copy_route';
import RoutingMaintenaceDrawing from './routing_maintenace_drawing';
import RoutingMaintenanceTools from './routing_maintenance_tools';
import { copyRouteInitData, detailsInitData, headerInitData, isDuplicateDetailItem, isDuplicateToolItem, toollsInitData, validateFromDb } from './routing_maintenance_helper';
import { APP_PROD_API } from '../../../../utils/api';
import { dateFormatter, validateForm } from '../../../../utils/fn';
import toast from 'react-hot-toast';
import HelpList from "../../../../components/HelpList";
import { useSelector } from "react-redux";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";



  const RoutingMaintenance = () => { 
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [headerData, setHeaderData] = useState({});
  const [detailData, setDetailData] = useState([]);
  const [toolData, setToolData] = useState([]);
  const [copyData, setCopyData] = useState({});
  const [drawingData, setDrawingData] = useState({});


  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const [focusedDetailRowIndex, setFocusedDetailRowIndex] = useState(0);
  const [focusedToolRowIndex, setFocusedToolRowIndex] = useState(0);

     const [helpList, setHelpList] = useState(false);
      const [helpFor, setHelpFor] = useState("");
      const [helpListHeader, setHelpListHeader] = useState([]);
      const [isHelpModelOpen, setIsHelpModelOpen] = useState();
      const toggleHelpModal = () => setHelpList(!helpList);
    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
      const { user } = useSelector((state) => state.auth);

const [confirmationModal, setConfirmationModal] = useState(false);
const [confirmationConfig, setConfirmationConfig] = useState({});
const [pendingFmpCode, setPendingFmpCode] = useState(null);

     // for dynamic msg state
     const [statusMessage, setStatusMessage] = useState("");

  const tabs = ["Route","Tools","Copy Route",'Drawing'];

  const TAB_FORM_MAP = {
  1: "route-header",
  2: "route-tools",
  3: "route-copy",
//  4: "route-drawing",
};


  // const updateActiveTab = useCallback((tab) => setActiveTab(tab), []);

  const updateActiveTab = useCallback(
  (nextTab) => {

    if (!["Insert", "Update"].includes(formStatus)) {
      setActiveTab(nextTab);
      return;
    }

    const currentFormId = TAB_FORM_MAP[activeTab];

  if (currentFormId) {
  const formEl = document.getElementById(currentFormId);

  if (!formEl) {
    // no form present (e.g. Drawing tab)
    setActiveTab(nextTab);
    return;
  }

  const isValid = validateForm(currentFormId, "Routing Maintenance");
  if (!isValid) {
    toast.error("Please fill all required fields before moving ahead");
    return;
  }
}

    setActiveTab(nextTab); 
  },
 [activeTab, formStatus, detailData, toolData]
);


    function handleOffset(data) {
        setCurrentRecordNo(data);
    }

    useEffect(() => {
  if (formStatus === "Insert") {
    setHeaderData({ ...headerInitData });
    setDetailData([]);
    setToolData([]);
    setCopyData({});
    setDrawingData({});
  }
}, [formStatus]);

     const handleHelpList = (show, rowIndex = -1) => {
    setHelpList(show);
    setSelectedRowIndex(rowIndex);
  };

const onSelectHelpItem = async (data) => {

  /* ================= DETAIL HELP ================= */
  if (helpFor === "inputItCode") {

  /* ================= FRONTEND DUPLICATE CHECK (MANDATORY) ================= */
 
    const isDup = isDuplicateDetailItem({
      detailData,
      inputItCode: data.chl_it_cd,
      currentIndex: selectedRowIndex,
       ignoreDeleted: true,
    });

    if (isDup) {
      toast.error("Item already exist");
      return; //  yahin flow stop
    }
  

  /* ================= BACKEND VALIDATION (MANDATORY) ================= */
  (async () => {
    const res = await validateFromDb({
      type: "DETAIL_ITEM_VALIDATE",
      value: data.chl_it_cd,
      extra: {
        input_it_code: data.chl_it_cd,
        final_code: headerData?.final_code,
        usage: data.usage, // helpList usage pass
      },
    });

    if (!res) return;

    /* ================= STATE UPDATE ================= */
    setDetailData((prev) =>
      prev.map((row, index) =>
        index === selectedRowIndex
          ? {
              ...row,
              input_it_code: data.chl_it_cd,
              it_name: res.data.it_name,
              it_bom_um: res.data.it_bom_um,
              usage: row.usage || res.data.usage || null,
               isStatus: row.isNew ? "new" : "changed",
            }
          : row
      )
    );
    })();

    return;
  }


  /* ================= TOOL HELP ================= */
 if (helpFor === "toolItCode") {

  /* ================= FRONTEND DUPLICATE CHECK ================= */
 
    const isDup = isDuplicateToolItem({
      toolData,
      itCode: data.it_code,
      currentIndex: selectedRowIndex,
      ignoreDeleted: true,
    });

    if (isDup) {
      toast.error("Item already exist");
      return; 
    }
  

  /* ================= BACKEND VALIDATION ================= */
  (async () => {
    const res = await validateFromDb({
      type: "TOOL_ITEM_VALIDATE",
      value: data.it_code,
      extra: {
        it_code: data.it_code,
        route_no: headerData.route_no,
      },
    });

    if (!res) return;

    /* ================= STATE UPDATE ================= */
    setToolData((prev) =>
      prev.map((row, index) =>
        index === selectedRowIndex
          ? {
              ...row,
              it_code: data.it_code,
              it_name: res.data.it_name,
              uom: res.data.uom,
               isStatus: row.isNew ? "new" : "changed",
            }
          : row
      )
    );
  })();

  return;
}



  /* ================= MASTER ROUTE ( MAIN LOGIC) ================= */
  if (helpFor === "mstrRoute") {
    const routeNo = data.route_no; // selected value

    //  Oracle: IF :MASTER = 'N'
   if (headerData?.master === "N") {
  const isValid = await validateFromDb({
    type: "MASTER_ROUTE",
    value: routeNo,
  });

  if (!isValid) return; 
}

    // Oracle: value accept
    setHeaderData((prev) => ({
      ...prev,
      master_route_no: routeNo,
    }));

    handleHelpList(false); // modal close
    return;
  }

/* ================= OTHER HEADER HELP ================= */
setHeaderData((prev) => {
  switch (helpFor) {

    case "finalCode": {
      const finalCode = data.par_it_cd;

      (async () => {
        const res = await validateFromDb({
          type: "FINAL_STAGE_CODE",
          value: finalCode,
        });

        if (!res) return; 

        setHeaderData(prev => ({
          ...prev,
          final_code: finalCode,
          fianal_code_desc: data.it_name, 
        }));
      })();

      return prev;
    }

    case "outputCode":
      return {
        ...prev,
        it_code: data.it_code,
        it_name: data.it_desc,
      };

    default:
      return prev;
  }
});


  /* ================= COPY HELP ================= */
  setCopyData((prev) => {
    switch (helpFor) {
      case "newPrcdCode":
        return {
          ...prev,
          new_it_code: data.it_code,
        };
      default:
        return prev;
    }
  });
};


const handleChange = useCallback(
  (type, name, value, index = 0, event) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

     if (["master_route_no", "final_code","it_code","new_it_code","input_it_code"].includes(name)) {
    toast.error("Please select value from Help List (double click)");
    return;
  }

    const cursorPosition = event?.target?.selectionStart;
    const rawVal = value;
    const numVal = rawVal === "" ? "" : Number(rawVal);

    /* ================= DETAIL FIELD VALIDATION ================= */
    if (type === "detail") {
      // ---- usage: > 0 only ----
      if (name === "usage") {
      
        if (rawVal === "") {
         
        } else if (isNaN(numVal) || numVal <= 0) {
          toast.error("Usage must be greater than 0");
          return;
        }
      }

      // ---- rej_perc: >= 0 only ----
      if (name === "rej_perc") {
        if (rawVal === "") {
       
        } else if (isNaN(numVal) || numVal < 0) {
          toast.error("Rejection % cannot be negative");
          return;
        }
      }
    }
    if (type === "header") {
      // ---- usage: > 0 only ----
      if (name === "qty") {
    
        if (rawVal === "") {
         
        } else if (isNaN(numVal) || numVal <= 0) {
          toast.error("Qty. must be greater than 0");
          return;
        }
      }

      // ---- rej_perc: >= 0 only ----
      if (name === "rej_perc") {
        if (rawVal === "") {
          
        } else if (isNaN(numVal) || numVal < 0) {
          toast.error("Rejection % cannot be negative");
          return;
        }
      }
    }

    const newVal =
      event?.target?.type === "number" ? rawVal : rawVal?.toUpperCase?.();

    const markStatus = (row) => {
      if (formStatus === "Update" && !row?.isNew) {
        return { ...row, isStatus: "changed" };
      }
      return row;
    };

    switch (type) {
      // case "header":
      //   setHeaderData((prev) => ({
      //     ...prev,
      //     ...markStatus({ ...prev, [name]: newVal }),
      //   }));
      //   break;
      case "header":
  setHeaderData((prev) => ({
    ...prev,
    ...markStatus({ ...prev, [name]: newVal }),
  }));

  //  CRITICAL FIX: header route_no change ⇒ mark all child rows changed
  if (name === "route_no" && formStatus === "Update") {
    setDetailData((prev) =>
      prev.map((r) =>
        r.isStatus !== "new"
          ? { ...r, isStatus: "changed" }
          : r
      )
    );

    setToolData((prev) =>
      prev.map((r) =>
        r.isStatus !== "new"
          ? { ...r, isStatus: "changed" }
          : r
      )
    );
  }
  break;


      case "detail":
        setDetailData((prev) => {
          const data = [...prev];
          data[index] = markStatus({
            ...data[index],
            [name]: newVal,
          });
          return data;
        });
        break;

      case "tool":
        setToolData((prev) => {
          const data = [...prev];
          data[index] = markStatus({
            ...data[index],
            [name]: newVal,
          });
          return data;
        });
        break;

      case "copy":
        setCopyData((prev) => ({
          ...prev,
          [name]: newVal,
        }));
        break;

      default:
        break;
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
 
  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  const formCleanup = () => {
    setHeaderData({...headerInitData})
    setCopyData({...copyRouteInitData})
    setDrawingData({})
    setDetailData([])
    setToolData([])
    releaseFormStatus();
  };



        const setupQueryData = useCallback(
        (queryData, btnClicked) => {

            if (!queryData || queryData.type === "not_found") {
           toast.error(queryData?.message || "No data found"); 
            setHeaderData({});  
            handleCancel()         
            setTotalRecordCount(0);
            return;
            }

            // First record set in formData
             if (queryData?.headerData) {
               const formattedData = {
                 ...queryData.headerData,
                 old_route_no: queryData.headerData.route_no,
                 route_start_date:dateFormatter(queryData.headerData.route_start_date),
                 route_end_date:dateFormatter(queryData.headerData.route_end_date),
               }
               setHeaderData(formattedData);
             }

               // ---------- DETAIL ( MAIN FIX) ----------
    if (Array.isArray(queryData?.detailData)) {
      const formattedDetail = queryData.detailData.map((row) => ({
        ...row,
          old_input_it_code: row.input_it_code, 
          old_route_no: row.route_no,   
            isStatus: "unchanged",        
      }));
      setDetailData(formattedDetail);
      setFocusedDetailRowIndex(0); // optional: first row focus
    } else {
      setDetailData([]);
    }
    if (Array.isArray(queryData?.toolData)) {
      if (queryData.toolData.length >0) {
      const formattedTool = queryData.toolData.map((row) => ({
        ...row,
         wef_date: row.wef_date ? dateFormatter(row.wef_date) : "",
         old_it_code:row.it_code,
         old_route_no: row.route_no,  
           isStatus: "unchanged",
      }));
      setToolData(formattedTool);
      setFocusedToolRowIndex(0); // optional: first row focus
    } else {
      setToolData([]);
    }
  }

     if (queryData?.drawingData) {
        setDrawingData({
          ...queryData.drawingData,
          isChanged: false,
          file: null,
        });
      } else {
        setDrawingData({});
      }
    
     if (btnClicked === "Query") {
     setTotalRecordCount(queryData?.count || 0);
     }
        },
        [formStatus, currentRecordNo]
        );


const uploadDrawing = async (routeId) => {
  if (!drawingData?.isChanged || !drawingData?.file) return;

  const fd = new FormData();
  fd.append("route_id", routeId);
  fd.append("process_drw", drawingData.file);

  await fetch(
    `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.UPLOAD_ROUTE_DRAWING}`,
    {
      method: "POST",
      body: fd,
      credentials: "include",
    }
  );
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!["Insert", "Update"].includes(formStatus)) return;

  try {

  /* ================= REQUIRED FORM VALIDATION ================= */
  const headerValid = validateForm("route-header", "Routing Maintenance");
  if (!headerValid) return;

    const hasValidDetail = detailData.some(
    r =>
      r.input_it_code &&
      Number(r.usage) > 0 &&
      r.isStatus !== "deleted"
  );

  if (!hasValidDetail) {
    toast.error("Please add at least one valid Detail row before submit");
    setActiveTab(1); // Route tab pe le jao
    return;
  }

  const detailValid = validateForm("route-details", "Routing Maintenance");
  if (!detailValid) return;

   const hasValidTool = toolData.some(
    r =>
      r.it_code &&
      r.isStatus !== "deleted"
  );

  if (!hasValidTool) {
    toast.error("Please add at least one valid Tool row before submit");
    setActiveTab(2); // Tools tab pe le jao
    return;
  }


  const toolValid = validateForm("route-tools", "Routing Maintenance");
  if (!toolValid) return;

  /* ================= CLEAN PAYLOAD ================= */
  const payload = {
    header: headerData,
    user_id: user.id,

   details: detailData.map(r => ({
    ...r,
    route_id: headerData.route_id,
    route_no: headerData.route_no,
   })),

    tools: toolData.map(r => ({
      ...r,
      route_id: headerData.route_id,
      route_no: headerData.route_no,
    }))

    

  };


 const method = formStatus === "Insert" ? "POST" : "PUT";
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_ROUTE_MAINTENANCE_FORM_DATA}?form_status=${formStatus}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

   const result = await response.json();

if (!result.success) {
  toast.error(result?.message || "Failed to save route");
  return;
}

toast.success(result.message || "Route saved successfully");
const effectiveRouteId =
  formStatus === "Insert"
    ? result.route_id        // backend se aayi
    : headerData.route_id;   // already existing

await uploadDrawing(effectiveRouteId);

formCleanup();

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while saving");
  }
};



  const triggerAddRow = useCallback(
    (type) => {
      if (!["Insert", "Update"].includes(formStatus)) return;

       const routeDetails = validateForm("route-details", "Routing Maintenance");
         if (!routeDetails) return;

       const routeTools = validateForm("route-tools", "Routing Maintenance");
         if (!routeTools) return;

      const createNewRow = (initData) => ({
        ...initData,
         route_id: headerData.route_id, 
         route_no: headerData.route_no || null, 
        isNew: true,
        isStatus: "new",
      });

      switch (type) {
        case "detail":
          setDetailData((prev) => {
            const newData = [...prev, createNewRow(detailsInitData)];
            setFocusedDetailRowIndex(newData.length - 1);
            return newData;
          });
          break;

      case "tool":
    setToolData((prev) => {
      const newRow = {
        ...toollsInitData,
        route_id: headerData.route_id, 
        route_no: headerData?.route_no || null,
        isNew: true,
        isStatus: "new",
      };
      const newData = [...prev, newRow];
      setFocusedToolRowIndex(newData.length - 1);
      return newData;
    });
    break;


        default:
          break;
      }
    },
    [formStatus]
  );

  const handleDelete = useCallback(
    (type, index) => {
      if (!["Insert", "Update"].includes(formStatus)) return;

      switch (type) {
        case "detail":
          setDetailData((prev) => {
            const data = [...prev];

            if (formStatus === "Update" && !data[index]?.isNew) {
              data[index] = { ...data[index], isStatus: "deleted" };
              return data;
            }

            data.splice(index, 1);
            setFocusedDetailRowIndex((prevIndex) =>
              prevIndex > 0 ? prevIndex - 1 : 0
            );
            return data.length ? data : [{ ...detailsInitData }];
          });
          break;

        case "tool":
          setToolData((prev) => {
            const data = [...prev];

            if (formStatus === "Update" && !data[index]?.isNew) {
              data[index] = { ...data[index], isStatus: "deleted" };
              return data;
            }

            data.splice(index, 1);
            setFocusedToolRowIndex((prevIndex) =>
              prevIndex > 0 ? prevIndex - 1 : 0
            );
            return data.length ? data : [{ ...toollsInitData }];
          });
          break;

        default:
          break;
      }
    },
    [formStatus]
  );

const handleConfirmNo = () => {
  setConfirmationModal(false);
  setPendingFmpCode(null);
};

const handleConfirmYes = async () => {
  if (!pendingFmpCode) return;

  const res = await validateFromDb({
    type: "CRT_FMP_ITEM",
    value: pendingFmpCode,
    extra: {
      fin_year:user.global_fin_year,
      wc_id:headerData.wc_id,
      final_code: headerData.final_code,
      opn_no: headerData.opn_no,
    },
  });

  if (!res) return;

  setHeaderData(prev => ({
    ...prev,
    it_code: pendingFmpCode,
  }));

  setConfirmationModal(false);
  setPendingFmpCode(null);
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
        QUERY_API={APP_PROD_API.GET_ROUTE_MAINTENANCE_FORM_DATA}
        formName={"Routing Maintenance"}

      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <RoutingMaintenanceHeader
              headerData={headerData}
              handleChange={handleChange}
              formStatus={formStatus}
              setHeaderData={setHeaderData}
               handleHelpList={handleHelpList}
               setHelpFor={setHelpFor}
               setHelpListHeader={setHelpListHeader}
               confirmationModal={confirmationModal}
               setConfirmationModal={setConfirmationModal}
               confirmationConfig={confirmationConfig}
               setConfirmationConfig={setConfirmationConfig}
               setPendingFmpCode={setPendingFmpCode}
               pendingFmpCode={pendingFmpCode}

            />{confirmationModal && (
              <ConfirmationModal
                isOpen={confirmationModal}
                title={confirmationConfig.title}
                description={confirmationConfig.description}
                onClose={handleConfirmNo}
                onSuccess={handleConfirmYes}
              />
            )}
              <RoutingMaintenanceDetails
              detailData={detailData}
              setDetailData={setDetailData}
              handleChange={handleChange}
              formStatus={formStatus}
              focusedRowIndex={focusedDetailRowIndex}
              setFocusedRowIndex={setFocusedDetailRowIndex}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDelete}
              setHeaderData={setHeaderData}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              />
          </TabPane>

          <TabPane tabId={3}>
           <RoutingMaintenaceCopyRoute
            copyData={copyData}
            setCopyData={setCopyData}
            handleChange={handleChange}
            formStatus={formStatus} 
            setHeaderData={setHeaderData}
            handleHelpList={handleHelpList}
            setHelpFor={setHelpFor}
            setHelpListHeader={setHelpListHeader}
            user={user}
            headerData={headerData}
            />
          </TabPane>

          <TabPane tabId={2}>
           <RoutingMaintenanceTools
            headerData={headerData}
            toolData={toolData}
            setToolData={setToolData}
            handleChange={handleChange}
            formStatus={formStatus} 
            triggerAddRow={triggerAddRow}
            handleDelete={handleDelete}
            focusedRowIndex={focusedToolRowIndex}
            setFocusedRowIndex={setFocusedToolRowIndex}
            setHeaderData={setHeaderData}
            handleHelpList={handleHelpList}
            setHelpFor={setHelpFor}
            setHelpListHeader={setHelpListHeader}
            />
          </TabPane>

          <TabPane tabId={4}>
           <RoutingMaintenaceDrawing
           drawingData={drawingData}
           setDrawingData={setDrawingData}
            handleChange={handleChange}
            formStatus={formStatus} 
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
                                                        APP_PROD_API.GET_ROUTE_MAINTENANCE_FORM_DATA
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

export default RoutingMaintenance;
