import React, { useState, useEffect, useCallback } from "react";
import { Form, TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import DebitCreditNotesPayDtl from "./gst_debit_credit_note_detail";
import {
  debitCreditDetailInitialFormDataTemplate,
  debitCreditInitialFormDataTemplate,
  createSearchPayloadForBVSpecificSearch,
} from "./gst_debit_credit_note_helper";
import GstDebitCreditNoteHeader from "./gst_debit_credit_note_header";
import { APP_PROD_API } from "../../../../utils/api";
import { formatOptions } from "../../../../lib";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import toast from "react-hot-toast";
import { dateFormatter } from "../../../../utils/fn";
import { useSelector } from "react-redux";
import { validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";


const DebitCreditNotesPayment = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({
    ...debitCreditInitialFormDataTemplate,
  });
  const [detailFormData, setDetailFormData] = useState([
    { ...debitCreditDetailInitialFormDataTemplate },
  ]);
  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();
  const tabs = [];

  // for help list

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [deletedRecord, setDeletedRecord] = useState([]);

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  //Dropdown Data
  const [reason, setReason] = useState([]);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update main form data
    if (["party", "order", "prof", "inv"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "party":
            return {
              ...prev,
              party_code: data.code,
              party_name: data.name,
            };

          case "order":
            return {
              ...prev,
              order_no: data.order_no,
              order_dt: dateFormatter(data.order_dt),
              order_id: data.order_id,
            };

          case "prof":
            return {
              ...prev,
              prof_inv_no: data.prof_no,
              prof_inv_dt: dateFormatter(data.prof_dt),
            };

          case "inv":
            return {
              ...prev,
              inv_no: data.inv_no,
              inv_dt: dateFormatter(data.inv_dt),
              inv_id: data.inv_id,
            };

          default:
            return prev;
        }
      });
    }

    // Update detail data (table rows)
    if (["acc", "item"].includes(helpFor) && activeRowIndex !== null) {
      setDetailFormData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "item":
            currentRow.it_code = data.it_code;
            currentRow.it_name = data.it_name_long;
            currentRow.hsn_sac_code = data.hsn_sac_code;
            break;

          case "acc":
            currentRow.sal_pur_acc = data.acc_no;
            currentRow.acc_name = data.acc_desc;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData);
    if (helpFor === "prof") {
      return {
        vend_cust_flag: formData.vend_cust_flag,
        party_code: formData.party_code,
        order_id: formData.order_id,
      };
    } else if (helpFor === "inv") {
      const { party_code, vend_cust_flag, subject_2_reverse, order_id } =
        formData;
      return {
        party_code: party_code,
        vend_cust_flag: vend_cust_flag,
        subject_2_reverse: subject_2_reverse,
        order_id: order_id,
      };
    } else if (helpFor === "party") {
      const { vend_cust_flag } = formData;
      console.log("formData", formData.vend_cust_flag);
      return { vend_cust_flag: vend_cust_flag };
    } else if (helpFor === "order") {
      const { vend_cust_flag, party_code } = formData;
      return { vend_cust_flag: vend_cust_flag, party_code: party_code };
    } else if (helpFor === "item") {
      const {
        vend_cust_flag,
        order_id,
        inv_id,
        prof_inv_id,
        trans_type,
        subject_2_reverse,
      } = formData;
      return {
        vend_cust_flag: vend_cust_flag,
        order_id: order_id,
        inv_id: inv_id,
        prof_inv_id: prof_inv_id,
        trans_type: trans_type,
        subject_2_reverse: subject_2_reverse,
      };
    }
    return {};
  };

  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  function updateCalcTotals(formData, detailFormData) {
    console.log("this function called");
    // Reset all totals
    let amount = 0;
    let sgst_amt = 0;
    let sgst_cess_amt = 0;
    let cgst_amt = 0;
    let cgst_cess_amt = 0;
    let igst_amt = 0;
    let igst_cess_amt = 0;
    let ugst_amt = 0;
    let ugst_cess_amt = 0;
    let comp_cess_amt = 0;

    // Loop through each row
    detailFormData.forEach((row) => {
      amount += parseFloat(row.amount || 0);
      sgst_amt += parseFloat(row.sgst_amt || 0);
      sgst_cess_amt += parseFloat(row.sgst_cess_amt || 0);
      cgst_amt += parseFloat(row.cgst_amt || 0);
      cgst_cess_amt += parseFloat(row.cgst_cess_amt || 0);
      igst_amt += parseFloat(row.igst_amt || 0);
      igst_cess_amt += parseFloat(row.igst_cess_amt || 0);
      ugst_amt += parseFloat(row.ugst_amt || 0);
      ugst_cess_amt += parseFloat(row.ugst_cess_amt || 0);
      comp_cess_amt += parseFloat(row.comp_cess_amt || 0);
    });

    return {
      amount: amount.toFixed(2),
      igst_amt: igst_amt.toFixed(2),
      igst_cess_amt: igst_cess_amt.toFixed(2),
      cgst_amt: cgst_amt.toFixed(2),
      cgst_cess_amt: cgst_cess_amt.toFixed(2),
      sgst_amt: sgst_amt.toFixed(2),
      sgst_cess_amt: sgst_cess_amt.toFixed(2),
      ugst_amt: ugst_amt.toFixed(2),
      ugst_cess_amt: ugst_cess_amt.toFixed(2),
      comp_cess_amt: comp_cess_amt.toFixed(2),
    };
  }

  const totals = updateCalcTotals(formData, detailFormData);
  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GST_DEBIT_CREDIT_NOTE_DROPDOWNDATA}`,
          { credentials: "include" },
        );
        if (response.status === 200) {
          const data = await response.json();
          setReason([
            { value: "", label: "" },
            ...formatOptions(data.reason || [], "reason_id", "reason_desc"),
          ]);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  const callInsertGstData = async (e) => {
    if (e) e.preventDefault();

    const { party_code, vend_cust_flag } = formData;

    for (const [index, item] of detailFormData.entries()) {
      if (
        !item.gst_amt_prc ||
        !item.hsn_sac_code ||
        !item.it_code ||
        // !item.gst_state_code ||   remove by amit dt.24.02.2026 as this will be fetch in backend
        !item.rate
      ) {
        console.log(
          "gst_amt_prc, hsn_sac_code, it_code, gst_state_code, rate",
          item.gst_amt_prc,
          item.hsn_sac_code,
          item.it_code,
          item.gst_state_code,
          item.rate,
        );

        return;
      }
    }

    const requiredFields = {
      party_code,
      vend_cust_flag,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === null || value === undefined || value === "") {
        // toast.error(`Please fill in the "${key}" field.`);
        return;
      }
    }

    try {
      const body = {
        formData: formData,
        formDetailData: detailFormData,
        divisionId: user.global_division_id,
      };

      console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GST_DEBIT_CREDIT_NOTE_DATA}?form_status=${formStatus}&step=gst`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      //toast.success("Data inserted successfully!");
      return data; // Success
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator",
      );
      return null; // Failed
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const isValidFormData = validateForm("GST-debit-credit-noteDtl");
    if (!isValidFormData) {
      return;
    }

    const validateFormFields = (fields) => {
      for (const [field, message] of Object.entries(fields)) {
        if (!formData[field]) {
          toast.error(message);
          return false;
        }
      }
      return true;
    };

    // Usage
    const isValid = validateFormFields({
      party_code: "Party code cannot be null",
      trans_date: "Transaction date cannot be null",
      reason_id: "Reason ID cannot be null",
    });

    if (!isValid) return;

    if (!totals) return;
    // console.log("t_basic_value as totnetAmt", totnetAmt)

    const updatedFormData = {
      ...formData,
      ...totals,
    };

    try {
      let body = {
        formData: updatedFormData,
        formDetailData: detailFormData,
        finYear: user.global_fin_year,
        divisionId: user.global_division_id,
      };

      if (formStatus === "Update") {
        if (formData.cancel_flag === "Y") {
          toast.error("You cannot update Cancelled Document.");
        }

        if (formData.auth_flag === "Update") {
          toast.error("You cannot update Authorized Document.");
          return;
        }

        body = {
          formData: updatedFormData,
          formDetailData: detailFormData,
          deletedData: deletedRecord,
        };
      }

      setDeletedRecord([]);

      console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_GST_DEBIT_CREDIT_NOTE_DATA}?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await response.json();
      toast.success(data.message || "Data Saved successfully!");
      handleCancel();

      return data;
    } catch (error) {
      toast.error(
        error.message ||
          "Please check all the form fields or contact administrator",
      );
      return false;
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({ ...debitCreditInitialFormDataTemplate });
    setDetailFormData([debitCreditDetailInitialFormDataTemplate]);
  }, []);

  
  //   const handleChange = useCallback((stateKey, name, value, index, event) => {
  //   const cursorPosition = event?.target?.selectionStart;
  //   let newVal = typeof value === "string" ? value.toUpperCase() : value;

  //   if (
  //     ["Insert", "Update"].includes(formStatus) &&
  //     ["sal_pur_acc", "party_code", "inv_no", "prof_inv_no", "it_code", "order_no"].includes(name)
  //   ) {
  //     toast.error("Please select from Helplist");
  //     return;
  //   }

  //   setFormData((prev) => {
  //     if (stateKey === "formData") {
  //       return { ...prev, [name]: newVal };
  //     }
  //     return prev;
  //   });

  //   if (stateKey === "detailFormData") {
  //     setDetailFormData((prevData) => {
  //       const newData = [...prevData];
  //       newData[index] = { ...newData[index], [name]: newVal };
  //       return newData;
  //     });
  //   }

  //   // if (event) {
  //   //   setTimeout(() => {
  //   //     event.target.setSelectionRange(cursorPosition, cursorPosition);
  //   //   }, 0);
  //   // }
  // });

  const handleChange = useCallback(
    (stateKey, name, value, index, event) => {
      if (!["Insert", "Search", "Update"].includes(formStatus)) {
        return;
      }

      console.log("event", event);
      const cursorPosition = event?.target?.selectionStart;

      // const isNumericField = !isNaN(value) && value !== "";
      // const parsedValue = isNumericField ? parseFloat(value) : value;
      // const newVal = typeof parsedValue === "string" ? parsedValue.toUpperCase() : parsedValue;

      const newVal = typeof value === "string" ? value.toUpperCase() : value;

      // const newVal = value?.toUpperCase()

      if (
        ["Insert", "Update"].includes(formStatus) &&
        [
          "sal_pur_acc",
          "party_code",
          // "inv_no",
          "prof_inv_no",
          "it_code",
          "order_no",
        ].includes(name)
      ) {
        toast.error("Please select from Helplist");
        return;
      }

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

      // // Restore cursor only for text-compatible fields
      const supportedTypes = [
        "text",
        "search",
        "tel",
        "url",
        "password",
        "textarea",
      ];
      if (event && supportedTypes.includes(event.target?.type)) {
        setTimeout(() => {
          event.target.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
      }
    },
    [formStatus],
  );

  const triggerAddRow = () => {
    if (!validateRequiredField) {
      return;
    }

    const isValidFormData = validateForm("GST-debit-credit-noteDtl");
    if (!isValidFormData) {
      return;
    }

    setDetailFormData((prev) => [
      ...prev,
      { ...debitCreditDetailInitialFormDataTemplate },
    ]);
  };

  const handleDeleteRow = useCallback(
    (data, index) => {
      console.log("Deleting row", index, data);

      let newDeleteData = [...deletedRecord];
      newDeleteData.push(data);
      setDeletedRecord(newDeleteData);

      setDetailFormData((prev) => {
        if (prev.length === 0) return prev;

        const newData = prev.filter((_, i) => i !== index);

        // Adjust focus index if needed
        setFocusedRowIndex((currentFocusIndex) => {
          if (index === currentFocusIndex) {
            // Focus the previous row, or 0 if no previous
            return index > 0 ? index - 1 : 0;
          } else if (index < currentFocusIndex) {
            // Row above deleted, shift focus index down by 1
            return currentFocusIndex - 1;
          } else {
            // No change needed
            return currentFocusIndex;
          }
        });

        return newData;
      });
    },
    [deletedRecord],
  );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // Handle failure case
      if (queryData.getCount === 0) {
        toast.error(queryData.message);
        handleCancel();
        return;
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.thfmtranGstData);
      setDetailFormData(queryData.tdfmtranGstData);
    },
    [formStatus, currentRecordNo],
  );

  const handleAuthItc = async () => {
    const { auth_flag } = formData;
    const action = auth_flag === "Y" ? "Un-authorise" : "Authorise";
    const newAuthFlag = auth_flag === "Y" ? "N" : "Y";

    if (confirm(`Are you sure you want to ${action}?`)) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.AUTHORIZED_GST_DEBIT_CREDIT_NOTE_DATA}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              formData: { ...formData, auth_flag: newAuthFlag },
            }),
          },
        );

        const result = await response.json();
        console.log("Backend Response:", result);

        if (response.ok) {
          toast.success(result?.message || "Authorization status updated.");

          //Update formData with returned flag
          setFormData((prev) => ({
            ...prev,
            auth_flag: result?.auth_flag || newAuthFlag,
            voucher_no: result?.voucher_no,
          }));
        } else {
          toast.error(result?.message || "Failed to update authorization.");
        }
      } catch (error) {
        console.error("Authorization error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  // For Search Record
  const handleSearch = async () => {
    try {
      setTotalRecordCount(0);
      setCurrentRecordNo(0);
      const searchPayload = createSearchPayloadForBVSpecificSearch(formData);
      const queryList = new URLSearchParams(searchPayload);

      if ([...queryList].length === 0) {
        toast.error("Please enter search criteria");
        return;
      }

      setSearchQuery(searchPayload);

      const data = await fetchAppData(
        `${APP_PROD_API.GET_GST_DEBIT_CREDIT_NOTE}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`,
      );

      if (data?.error) {
        toast.error(data?.error);
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
        QUERY_API={APP_PROD_API.GET_GST_DEBIT_CREDIT_NOTE}
        formName={"Debit Credit Notes payment "}
        handleAuthRecord={handleAuthItc}
        authority={{
          insert: "Y",
          update: formData?.auth_flag === "Y" ? "N" : "Y",
          message:
            formData?.auth_flag === "Y"
              ? "YOU CANNOT MODIFY AUTHORISED DOCUMENT."
              : "",
        }}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <GstDebitCreditNoteHeader
              formData={formData}
              handleChange={handleChange}
              formStatus={formStatus}
              reason={reason}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
            />

            <DebitCreditNotesPayDtl
              detailFormData={detailFormData}
              handleChange={handleChange}
              formStatus={formStatus}
              triggerAddRow={triggerAddRow}
              handleDelete={handleDeleteRow}
              setActiveRowIndex={setActiveRowIndex}
              handleHelpList={handleHelpList}
              setHelpFor={setHelpFor}
              setHelpListHeader={setHelpListHeader}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              validateRequiredField={validateRequiredField}
              callInsertGstData={callInsertGstData}
              setDetailFormData={setDetailFormData}
            />
          </TabPane>
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_GST_DEBIT_CREDIT_NOTE}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                  whereClause={whereClauseForHelp(helpFor)}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default DebitCreditNotesPayment;
