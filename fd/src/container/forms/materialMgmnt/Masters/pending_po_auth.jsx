import React, { useEffect } from "react";
import {
  Form,
  Modal,
  ModalBody,
  ModalHeader,
  TabContent,
  TabPane,
} from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { useSelector } from "react-redux";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { pendingPOData } from "./pending_po_auth_hlpr";
import PendingPOAuthHdr from "./pending_po_auth_hdr";
import { useLocation, useNavigate } from "react-router-dom";


const PendingPOAuth = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // const toggleHelpModal = () => setHelpList(!helpList);

  const { user } = useSelector((state) => state.auth);

  const tabs = ["Pending PO/PA authorization"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const navigate = useNavigate();

  const handleOpenForm = (poId, poNo) => {
    sessionStorage.setItem(
      "TRACKER_STATE",
      JSON.stringify({
        formData,
        searchQuery,
        totalRecordCount,
        currentRecordNo,
        focusedRowIndex,
      }),
    );

    sessionStorage.setItem("fromTrackerNav", "true");

    navigate(
      `/module/materialMgmnt/60111?po_id=${poId}&po_no=${poNo}&fromTracker=true`,
    );
  };

  useEffect(() => {
    const savedState = sessionStorage.getItem("TRACKER_STATE");

    if (savedState) {
      const state = JSON.parse(savedState);
      setFormData(state.formData || []);
      setTotalRecordCount(state.totalRecordCount || 0);
      setCurrentRecordNo(state.currentRecordNo || 0);
      setFocusedRowIndex(state.focusedRowIndex || 0);

      sessionStorage.removeItem("TRACKER_STATE");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const unitMaster = validateForm("rate-master", "Rate Master");
      if (!unitMaster) return;

      let method = formStatus === "Insert" ? "POST" : "PUT";

      let payload = {};

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API}?form_status=${formStatus}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data?.type === "success") {
        toast.success("Data saved successfully!");
        formCleanup();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    formCleanup();
  }, []);

  const formCleanup = () => {
    setFormData([]);
    releaseFormStatus();
    setTotalRecordCount(0);
  };

  const handleChange = useCallback(
    (name, value, index, event) => {
      const cursorPosition = event.target.selectionStart;
      let newVal = value.toUpperCase();

      setFormData((prevData) => {
        const newData = [...prevData];

        const updatedRow = {
          ...newData[index], //  bas ye rakho
          [name]: newVal,
          isNew: newData[index]?.isNew ?? false,
        };

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
    [formStatus],
  );

  const setupQueryData = useCallback((queryData, btnClicked) => {});

  const getUnauthorizedPO = async (poType) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_PENDING_PO_AUTH_FORM}?po_type=${poType}`,
        {
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data?.type === "not_found") {
        // toast.error("No Data Found ");
        toast.error(
          poType === "O"
            ? "No Pending Unauthorized Purchase Order Found"
            : "No Pending Unauthorized Purchase Advice Found",
        );
        handleCancel();
        setFormData([]);
        setTotalRecordCount(0);
        setCurrentRecordNo(0);
        return;
      }

      const formattedDetail = (data?.pendingPO || []).map((item) => ({
        ...item,
        po_type:
          item.po_type === "A"
            ? "Advice"
            : item.po_type === "O"
              ? "Order"
              : item.po_type,

        c_code: item.po_type === "O" ? "EDDAL" : item.c_code,

        c_name:
          item.po_type === "O"
            ? "ESCORTS DEALERS DEVELOPMENT ASSOCITION LIMITED"
            : item.c_name,
      }));

      setFormData(formattedDetail);
      setTotalRecordCount(data?.totalCount || 0);
      setCurrentRecordNo(formattedDetail.length ? 1 : 0);
      setFocusedRowIndex(0);
      // console.log("totalCount", data?.totalCount);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAllPOAuthorize = async () => {
    try {
      // const selectedPOIds = formData
      //   .filter((row) => row.auth_flag === "Y")
      //   .map((row) => row.po_id);

      const selectedRows = formData.filter((row) => row.auth_flag === "Y");

      const selectedPOIds = selectedRows.map((row) => row.po_id);

      const emailPOIds = selectedRows
        .filter((row) => row.send_email_flag === "Y")
        .map((row) => row.po_id);

      if (selectedPOIds.length === 0) {
        return toast.error("Please select at least one PO");
      }

      // Confirmation dialog
      const isConfirmed = window.confirm(
        "Emails for all selected Purchase Orders/Advice will be sent to the respective vendors. Would you like to proceed?",
      );

      if (!isConfirmed) {
        return;
      } 

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_PENDING_ALL_PO_AUTHORIZATION}`,
        {
          method: "POST",
          credentials: "include",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify({
            po_ids: selectedPOIds,
            email_po_ids: emailPOIds,
            userId: user.id,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(result.message || "PO Authorized Successfully");
      handleCancel();
    } catch (error) {
      toast.error(error.message);
    }
  };
  // console.log("state totalRecordCount", totalRecordCount);

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
        QUERY_API={APP_PROD_API.GET_DATA_FOR_PENDING_PO_AUTH_FORM}
        searchQueryPayload={formData}
        formName={"Pending PO Authorization"}
        // isQueryReqOnInsertBtn = {true}
        // isQueryReqOnNextPreBtn={false}
        btnEnableDtl={{ insert: false, update: false, query: false }}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <PendingPOAuthHdr
              formData={formData}
              setFormData={setFormData}
              formStatus={formStatus}
              handleChange={handleChange}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              getUnauthorizedPO={getUnauthorizedPO}
              totalRecordCount={totalRecordCount}
              handleAllPOAuthorize={handleAllPOAuthorize}
              handleOpenForm={handleOpenForm}
            />
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default PendingPOAuth;
