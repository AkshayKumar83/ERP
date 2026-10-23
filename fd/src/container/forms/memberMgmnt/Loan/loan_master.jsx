import React, { useState, useCallback, useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";

import LoanMasterHdr from "./loan_mas_hdr";
import LoanMasterDtl from "./loan_mas_dtl";
import { useRecordCount } from "../../../../hooks/useRecordCount";
import { DateTime } from "luxon";

import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { formatOptions } from "../../../../lib";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  createSearchPayloadForLnMstrSearch,
  getRepaySchPrint,
  loanHdrFormInitData,
} from "./loan_mas_helper";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";
import { validateForm } from "../../../../utils/fn";
import { selectLoader } from "../../../../features/loader/loaderSlice";
import Loader from "../../../../components/GenricComponents/Loader";

const LoanMaster = () => {
  //GLOBAL PARAMETERS
  const { user } = useSelector((state) => state.auth);

  // HOOKS
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const {
    handleOffset,
    currentRecordNo,
    totalRecordCount,
    setTotalRecordCount,
    setCurrentRecordNo,
  } = useRecordCount();

  // FORM DATA STATE FOR EACH FORM COMPONENT
  const [formHdrData, setFormHdrData] = useState({ ...loanHdrFormInitData });
  const [formDtlData, setFormDtlData] = useState([{}]);

  const [activeTab, setActiveTab] = useState(1);

  // FOR HELP LIST
  const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState(""); //fieldName for helpList you want
  const [helpListHeader, setHelpListHeader] = useState([]);

  const toggleHelpModal = () => setHelpList(!helpList);
  const [isGstRateFound, setIsGstRateFound] = useState(true);

  // DROP DOWN DATA
  const [loanPurpose, setloanPurpose] = useState([]);
  const [bankList, setBankList] = useState([]);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  const [isDocsUploaded, setIsDocsUploaded] = useState(false);

  const tabs = ["EDDAL Financial Assistance"];

  const formLoading = useSelector(selectLoader("form"));
  const dispatch = useDispatch();

  // fetch Loan No.
  const fetchLoanNo = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_LOAN_MASTER_LOAN_NO
        }`,
        { credentials: "include" }
      );
      if (!response.ok) {
        const errMsg = await response.json();
        throw new Error(errMsg?.message);
      }

      const data = await response.json();
      setFormHdrData((prev) => ({ ...prev, efa_ctrl_id: data?.getLoanNo }));
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || "error on fetching loan no.");
    }
  };

  useEffect(() => {
    const fetchDropDownData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_LOAN_MASTER_DROPDOWN_DATA
          }?division_id=${user.global_division_id}`,
          {
            credentials: "include",
          }
        );
        if (response.status === 200) {
          const data = await response.json();
          setloanPurpose([
            { value: "", label: "" },
            ...formatOptions(
              data.loanPurpose || [],
              "loan_id",
              "loan_purpose_desc"
            ),
          ]);
          setBankList([
            { value: "", label: "" },
            ...formatOptions(data.bankList || [], "bank_cd", "bank_name"),
          ]);
        }
        // setTotalRecordCount(0) // comment it while building search feature
        setCurrentRecordNo(0);
      } catch (err) {
        //console.log(err);
      }
    };
    if (["Insert", "Update", "Query"].includes(formStatus)) {
      fetchDropDownData();

      // fetch loan No.
      if (formStatus == "Insert") {
        setFormHdrData((prev) => ({
          ...prev,
          efa_application_date: new Date().toISOString().split("T")[0],
        }));
        fetchLoanNo();
      }
    }
  }, [formStatus]);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    if (helpFor === "party_name") {
      setFormHdrData((prev) => ({
        ...prev,
        party_name: data.dlr_name,
        member_id: data.member_id,
        member_no: data.member_no,
      }));
      fetchGstRateDetail(data?.member_no);
    }
  };
  // HELP LIST OPENING
  const openHelpList = (fieldName, helpListHeader, index = null) => {
    if (["Insert", "Update", "Search"].includes(formStatus)) {
      setHelpFor(fieldName);
      setHelpListHeader(helpListHeader);
      setHelpList(true);
    }
  };

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const fetchGstRateDetail = async (member_no) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_LOAN_MASTER_DATA
        }/get_state_code?member_no=${member_no}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const errMsg = await response.json();
        toast.error(errMsg?.message);
        setIsGstRateFound(false);
        setFormHdrData((prev) => ({
          ...prev,
          igst_rate: "",
          cgst_rate: "",
          sgst_rate: "",
        }));
      }
      if (response.ok) {
        const data = await response.json();
        setFormHdrData((prev) => ({ ...prev, ...data?.data }));
        setIsGstRateFound(true);
      }
    } catch (err) {
      //console.log(err);
    }
  };

  const handleChange = (type, e, name, value, rowIndex = null) => {
    const cursorPosition = e?.target?.selectionStart;

    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    switch (type) {
      case "loanHdr":
        if (name === "efa_application_date") {
          const today = new Date().toISOString().split("T")[0];
          if (value > today) {
            toast.error("Future dates are not allowed for EFA Date.");
            return;
          }
        }

        setFormHdrData((prev) => {
          return {
            ...prev,
            [name]:
              e.target.type === "number"
                ? value === ""
                  ? ""
                  : Number(value)
                : typeof value === "string"
                ? value.toUpperCase()
                : value,
          };
        });
        break;
      case "loanDetail":
        setFormDtlData((prev) => {
          if (rowIndex !== null && rowIndex >= 0) {
            // Update a specific row
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]: typeof value === "string" ? value.toUpperCase() : value,
            };
            return newData;
          } else {
            // Update all rows (used for Select field outside table)
            return prev.map((row) => ({
              ...row,
              [name]: typeof value === "string" ? value.toUpperCase() : value,
            }));
          }
        });
        break;

      default:
        break;
    }
    if (
      e?.target &&
      e.target.tagName === "INPUT" &&
      !["number", "radio", "checkbox", "date"].includes(e.target.type)
    ) {
      setTimeout(() => {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // setFormLoading(true);

      // execute submit logic and hit the API
      let formPayload = {};
      if (formStatus === "Insert") {
        formPayload = {
          LoanMasterHdr: {
            ...formHdrData,
            voucher_dt:
              formHdrData?.trans_type == "BN" ? "" : formHdrData?.trans_type,
          },
          efa_id: formDtlData[0]?.efa_id,

          //  LoanMasterDtl: formDtlDataPayload,
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_LOAN_MASTER_DATA
        }/create_emi_final?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Error: ${result.errMsg || "Something went wrong"}`);
      }
      const result = await response.json();
      // toast.success(
      //   `Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`
      // );

       toast.success(
        result.message || 'Loan Created Successfully'
      );
      if(formHdrData?.efa_ctrl_id != result?.data){
        showGeneratedFaNo(result?.data);
      }
      formCleanup();
    } catch (error) {
      toast.error(
        error?.message ||
          "Please check all the form fields or contact administrator"
      );
      return;
    }
  };

  const formCleanup = (isCancelClicked = false) => {
    setFormHdrData({ ...loanHdrFormInitData });
    setFormDtlData([{}]);
    setloanPurpose([]);
    setBankList([]);

    if (isCancelClicked) {
      return;
    }
    releaseFormStatus();
    setIsDocsUploaded(false);
    setTimeout(() => {
      setFormStatus("Insert");
    }, 200);
  };

  const handleCancel = useCallback(() => {
    formCleanup(true);
    releaseFormStatus();
  }, []);

  const setupQueryData = (queryData, btnClicked) => {
    if (["Query", "Last", "Next", "Prev", "First"].includes(btnClicked)) {
      if (queryData?.count == 0 && btnClicked == "Query") {
        toast.error("No EFA Record Found");
        return;
      }
      //todo change the hardcaded trans_type to dynamic
      setFormHdrData((prev) => ({
        ...prev,
        ...queryData?.formHdrData,
        trans_type: "BN",
      }));
      setFormDtlData(queryData?.formDtlData);
      // ////console.log("query data:", queryData);
    }

    if (btnClicked == "Query") {
      setTotalRecordCount(queryData?.count);
    }
  };

  const handleCreateEMIData = async (e) => {
    e.preventDefault();

    const isValidFormHdrData = validateForm(
      "loan-mas-hdr-form",
      "Loan Master Header"
    );
    if (!isValidFormHdrData) {
      return;
    }

    try {
      if (
        formHdrData?.efa_compliance_yesno === "N" &&
        !confirm("Do you want to proceed if Loan Eligibility is unchecked?")
      ) {
        return;
      }
      ////console.log(formHdrData);

      // setFormLoading(true);

      // execute submit logic and hit the API
      let formPayload = {};
      if (formStatus === "Insert") {
        formPayload = {
          LoanMasterHdr: formHdrData,
          //  LoanMasterDtl: formDtlDataPayload,
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_LOAN_MASTER_DATA
        }/create_emi?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Error: ${result.errMsg || "Something went wrong"}`);
      }

      const result = await response.json();

      /* Below linw added to convert date with timezone into YYYY-MM-DD format so that it gets displayed properly */
      let newData = result?.data?.map((item) => {
        return {
          ...item,
          emi_date: item.emi_date
            ? DateTime.fromISO(item.emi_date).toFormat("yyyy-MM-dd")
            : null,
          Total_amt: item.Total_amt
            ? item.principal_amt + item.service_chg_ded + item.igst_amt
            : null,
        };
      });

      setFormDtlData(newData);
      toast.success("Emi created successfully!");
      // formCleanup();
    } catch (error) {
      toast.error(
        error?.message ||
          "Please check all the form fields or contact administrator"
      );
      return;
    }
  };
  ////console.log("formHdrData", formHdrData);

  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForLnMstrSearch(formHdrData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_LOAN_MASTER_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

  const onSuccessConfirmation = useCallback(
    (confirm, fa_no) => {
      if (confirm && fa_no) {
        ////console.log("generated_voucher_no is :", fa_no);
      }
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formHdrData]
  );

  const showGeneratedFaNo = useCallback((fa_no) => {
    setConfirmationConfig({
      title: "FA No. generated",
      description: `New FA no generated is ${fa_no}`,
      uniqKey: "fa_no",
    });
    setConfirmationModal(true);
  }, []);

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
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_LOAN_MASTER_DATA}
        formName={"EFA Disbursement"}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        handlePrint={() => getRepaySchPrint(formHdrData, formStatus, dispatch, user?.username)}
        // authority={{ insert: "Y", update: "N", message: "Update not allowed!" }}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            {formLoading && <Loader overlayContainer />}
            <LoanMasterHdr
              formHdrData={formHdrData}
              handleChange={(e, name, value) =>
                handleChange("loanHdr", e, name, value, null)
              }
              handleCreateEMIData={handleCreateEMIData}
              openHelpList={openHelpList}
              onSelectHelpItem={onSelectHelpItem}
              loanPurpose={loanPurpose}
              bankList={bankList}
              formStatus={formStatus}
              handleHelpList={handleHelpList}
              handleSearch={handleSearch}
              formPayload={{ searchQuery }}
              setSearchQuery={setSearchQuery}
              setFormHdrData={setFormHdrData}
              isGstRateFound={isGstRateFound}
              isDocsUploaded={isDocsUploaded}
              setIsDocsUploaded={setIsDocsUploaded}
            />
            <LoanMasterDtl
              formData={formDtlData}
              handleChange={handleChange}
              formStatus={formStatus}
            />

            {helpList && (
              <Modal
                id="help-list-modal"
                isOpen={helpList}
                toggle={toggleHelpModal}
                size="xl"
              >
                <ModalHeader toggle={toggleHelpModal}></ModalHeader>
                <ModalBody>
                  <HelpList
                    formStatus={formStatus}
                    helpFor={helpFor}
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${
                      APP_PROD_API.GET_LOAN_MASTER_DATA
                    }`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                  />
                </ModalBody>
              </Modal>
            )}
            {confirmationModal && (
              <ConfirmationModal
                isOpen={confirmationModal}
                onClose={() => {
                  onSuccessConfirmation(false, confirmationConfig);
                  setConfirmationModal(false);
                }}
                {...confirmationConfig}
                onSuccess={() =>
                  onSuccessConfirmation(true, confirmationConfig)
                }
              />
            )}
          </TabPane>
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default LoanMaster;
