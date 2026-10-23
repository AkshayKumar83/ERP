import React, { useState, useCallback, useEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { APP_PROD_API } from "../../../../utils/api";
import LoanRepayHdr from "./loan_repay_hdr";
import LoanRepayDtl from "./loan_repay_dtl";
import LoanRepayDtlDtl from "./loan_repay_dtl_dtl";
import { useRecordCount } from "../../../../hooks/useRecordCount";

import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { formatOptions } from "../../../../lib";
import { fetchAppData } from "../../../../utils/fetchUtils";
import { useSelector } from "react-redux";
import {
  createSearchPayloadForLnReceiptSearch,
  getCurrentBalance,
} from "./loan_repay_helper";
import ConfirmationModal from "../../../../components/Modals/confirmationModal";

const LoanRepayParent = () => {
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
  const [formHdrData, setFormHdrData] = useState({ receipt_number: "FAR/" });
  const [formDtlData, setFormDtlData] = useState([{}]);
  const [formDtlDtlData, setFormDtlDtlData] = useState([{}]);

  const [allowManualAdj, setAllowManualAdj] = useState(false);

  //  const [tempData, setTempData] = useState([{}]);

  const [searchQueryData, setSearchQueryData] = useState({});

  const [activeTab, setActiveTab] = useState(1);
  const [updateFormPayload, setUpdateFormPayload] = useState({});

  const [loading, setLoading] = useState(true); // loading before form render
  const [formLoading, setFormLoading] = useState(false); //loading on submit

  // FOR HELP LIST
  const [helpList, setHelpList] = useState(false); // this will switch helpList true = on
  const [helpFor, setHelpFor] = useState(""); //fieldName for helpList you want
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  // DROP DOWN DATA
  const [LoanStatus, setLoanStatus] = useState([]);
  const [EmiFrequency, setEmiFrequency] = useState([]);
  const [EmiDateOption, setEmiDateOption] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [loanList, setloanList] = useState([]);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});

  const tabs = ["EDDAL Financial Assistance Receipt"];

  // fetch Loan No.
  const fetchLoanReceiptNo = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_LOAN_REPAYMENT_LOAN_RECEIPT_NO}`,
        { credentials: "include" },
      );
      if (!response.ok) {
        const errMsg = await response.json();
        throw new Error(errMsg?.message);
      }
      const data = await response.json();
      setFormHdrData((prev) => ({ ...prev, receipt_number: data?.newLrNo }));
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || "error on fetching loan no.");
    }
  };

  const fetchDropDownData = async (member_id) => {
    ////console.log("member_id from inside", member_id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.GET_LOAN_REPAY_DROPDOWN_DATA
        }?formStatus=${formStatus}&division_id=${
          user.global_division_id
        }&member_id=${member_id}`,
        {
          credentials: "include",
        },
      );
      if (response.status === 200) {
        const data = await response.json();
        setBankList([
          { value: "", label: "" },
          ...formatOptions(data.bankList || [], "bank_cd", "bank_name"),
        ]);
        setloanList([
          { value: "", label: "" },
          ...formatOptions(data.loanList || [], "efa_id", "efa_ctrl_id"),
        ]);
      }
      // setTotalRecordCount(0) // comment it while building search feature
      setCurrentRecordNo(0);
    } catch (err) {
      ////console.log(err);
    }
  };

  useEffect(() => {
    if (["Insert", "Update", "Query"].includes(formStatus)) {
      fetchDropDownData(1); // Hard coded for now, need to get member_id from the formHdrData

      if (formStatus === "Insert") {
        setFormHdrData((prev) => ({
          ...prev,
          receipt_date: new Date().toISOString().split("T")[0],
        }));
        fetchLoanReceiptNo();
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
      ////console.log("member_id", data.member_id);
      fetchDropDownData(data.member_id);
    }
    if (helpFor === "efa_ctrl_id") {
      setFormHdrData((prev) => ({
        ...prev,
        efa_id: data.efa_id,
        efa_ctrl_id: data.efa_ctrl_id,
        loan_id: data.loan_id,
        loan_purpose: data.loan_purpose,
      }));

      getCurrentBalance({ efa_id: data.efa_id }, setFormHdrData);
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

  const handleChange = (type, e, name, value, rowIndex = null) => {
    const cursorPosition = e?.target?.selectionStart;

    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }

    switch (type) {
      case "LoanRepayHdr":
        setFormHdrData((prev) => {
          if (name === "efa_id" && value) {
            getCurrentBalance({ efa_id: value }, setFormHdrData);
          }
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
      case "LoanRepayDtl":
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
      case "LoanRepayDtl2":
        setFormDtlDtlData((prev) => {
          if (rowIndex !== null && rowIndex >= 0) {
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [name]:
                e?.target?.type === "number"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : typeof value === "string"
                    ? value.toUpperCase()
                    : value,
            };
            return newData;
          } else {
            return prev.map((row) => ({
              ...row,
              [name]:
                e?.target?.type === "number"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : typeof value === "string"
                    ? value.toUpperCase()
                    : value,
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

  // Form submission logic In this we call a procedure whuch will insert the data into the final EMI Receipts tables from the Receipts temp table
  // const handleSubmit = async (e) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      if (!formHdrData?.receipt_date) {
        toast.error("Repayment date cannot be null");
        return;
      }

      // execute submit logic and hit the API
      let formPayload = {};
      if (formStatus === "Insert") {
        // todo : check the receipt amount
        formPayload = {
          LoanRepayHdr: formHdrData,
          loanReceiptData: formDtlDtlData,
          isManualAdj: allowManualAdj,
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_EMI_REPAYMENT_DATA
        }/repay_adjust_fifo_final?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Error: ${result.errMsg || "Something went wrong"}`);
      }
      const result = await response.json();
      toast.success(
        `Data ${formStatus === "Insert" ? "saved" : "updated"} successfully!`,
      );

      // show the data containing receipt no and newly generated bank voucher no in var generated_bank_vch_no
      showGeneratedFarNo(result?.data, result?.generated_bank_vch_no);
      formCleanup();
      setAllowManualAdj(false);
    } catch (error) {
      toast.error(
        error?.message ||
          "Please check all the form fields or contact administrator",
      );
      return;
    } finally {
      setFormLoading(false);
    }
  };

  const formCleanup = async (isCancelClicked = false) => {
    setFormHdrData({ receipt_number: "FAR/" });
    setFormDtlData([{}]);
    setFormDtlDtlData([{}]);
    // if (formStatus !== "Insert") {
    //   setFormStatus("");
    // }

    setSearchQueryData({});
    if (isCancelClicked) {
      return;
    }
    releaseFormStatus();
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
        toast.error("No EFA Repayment Record Found");
        return;
      }
      setFormHdrData(queryData?.formHdrData);
      // setFormDtlData(queryData?.formDtlData);
      setFormDtlDtlData(queryData?.repayDtlData);
      // ////console.log("query data:", queryData);
    }

    if (btnClicked == "Query") {
      setTotalRecordCount(queryData?.count);
    }
  };

  // ////console.log('formStatus from memberform', formStatus)
  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForLnReceiptSearch(formHdrData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_EMI_REPAYMENT_DATA}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`,
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

  const handleRepayAdjustFifo = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      if (!formHdrData?.receipt_date) {
        toast.error("Repayment date cannot be null");
        return;
      }
      // execute submit logic and hit the API
      let formPayload = {};
      if (formStatus === "Insert") {
        formPayload = {
          LoanRepayHdr: formHdrData,
          //  LoanMasterDtl: formDtlDataPayload,
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_EMI_REPAYMENT_DATA
        }/repay_adjust_fifo?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(formPayload),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`Error: ${result.errMsg || "Something went wrong"}`);
      }

      const result = await response.json();

      setFormDtlData(result?.dataEMI || []);
      setFormDtlDtlData(result?.dataRepay || []);

      /* Below linw added to convert date with timezone into YYYY-MM-DD format so that it gets displayed properly */
      let newData1 = result?.dataEMI?.map((item) => {
        return {
          ...item,
          //          emi_date: item.emi_date ? DateTime.fromISO(item.emi_date).toFormat("yyyy-MM-dd") : null,
          //          Total_amt: item.Total_amt ? item.principal_amt + item.service_chg_ded + item.igst_amt : null,
        };
      });
      let newData2 = result?.dataRepay?.map((item) => {
        return {
          ...item,
          //          receipt_date: item.receipt_date ? DateTime.fromISO(item.receipt_date).toFormat("yyyy-MM-dd") : null,
          //          instrument_date: item.instrument_date ? DateTime.fromISO(item.instrument_date).toFormat("yyyy-MM-dd") : null,
        };
      });

      // setFormDtlData()
      // setFormDtlDtlData()
      // ////console.log("newData1", newData1);
      // ////console.log("newData2", newData2);
      toast.success("Amount adjusted on Fifo basis successfully!");
      // formCleanup();
    } catch (error) {
      toast.error(
        error?.message ||
          "Please check all the form fields or contact administrator",
      );
      return;
    }
  };

  const onSuccessConfirmation = useCallback(
    (confirm, far_no) => {
      if (confirm && far_no) {
        ////console.log('generated_voucher_no is :', far_no)
      }
      setConfirmationConfig({});
      setConfirmationModal(false);
    },
    [formHdrData],
  );

  const showGeneratedFarNo = useCallback((far_no, bnk_vch) => {
    setConfirmationConfig({
      title: "FAR No. generated",
      // description: `New FAR No. ${far_no} has been generated along with Bank Voucher No. ${bnk_vch}.`,
      description: (
        <>
          New FAR No.{" "}
          <span style={{ color: "#0d6efd", fontWeight: 600 }}>{far_no}</span>{" "}
          has been generated along with Bank Voucher No.{" "}
          <span style={{ color: "#198754", fontWeight: 600 }}>{bnk_vch}</span>.
        </>
      ),
      uniqKey: "far_no",
    });
    setConfirmationModal(true);
  }, []);

  const handleAllowManualAdj = () => {
    if (!allowManualAdj) {
      setAllowManualAdj(true);
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
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_EMI_REPAYMENT_DATA}
        formName={"EFA EMI Repayment"}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        authority={{ insert: "Y", update: "N", message: "Update not allowed!" }}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <LoanRepayHdr
              formHdrData={formHdrData}
              handleChange={(e, name, value) =>
                handleChange("LoanRepayHdr", e, name, value, null)
              }
              handleRepayAdjustFifo={handleRepayAdjustFifo}
              openHelpList={openHelpList}
              onSelectHelpItem={onSelectHelpItem}
              bankList={bankList}
              loanList={loanList}
              formStatus={formStatus}
              handleHelpList={handleHelpList}
            />
            {formStatus != "Query" ? (
              <LoanRepayDtl
                formData={formDtlData}
                handleChange={handleChange}
                formStatus={formStatus}
              />
            ) : (
              ""
            )}

            <LoanRepayDtlDtl
              formData={formDtlDtlData}
              handleChange={(e, name, value, index) =>
                handleChange("LoanRepayDtl2", e, name, value, index)
              }
              formStatus={formStatus}
              handleAllowManualAdj={handleAllowManualAdj}
              allowManualAdj={allowManualAdj}
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
                    apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_EMI_REPAYMENT_DATA}`}
                    helpListHeader={helpListHeader}
                    handleHelpList={handleHelpList}
                    onSelectHelpItem={onSelectHelpItem}
                    whereClause={{
                      member_id: formHdrData.member_id,
                    }}
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

export default LoanRepayParent;
