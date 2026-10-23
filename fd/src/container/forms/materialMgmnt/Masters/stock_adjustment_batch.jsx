import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
import { Row, Col, Form, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RadioGroup from "../../../../components/basic/radioGroup";
import RowAction from "../../../../components/common/rowAction";
import ButtonUi from "../../../../components/basic/button";
import RadioButton from "../../../../components/basic/radioButton";
import {
  formDataInitData,
  formDetailInitData,
  formBatchInitData,
  wchHelpListHeader,
  transHelpListHeader,
  srsHelpListHeader,
  createSearchPayloadForBVSpecificSearch,
} from "./stock_adjustment_batch.helper";
import StockAdjustmentBatchDtl from "./stock_adjustment_batchDtl";
import { formatOptions } from "../../../../lib";
import { APP_PROD_API } from "../../../../utils/api";
import toast from "react-hot-toast";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";

const StockAdjustmentBatch = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({ ...formDataInitData });

  const [formDetailData, setFormDetailData] = useState([formDetailInitData]);
  const [formBatchData, setFormBatchData] = useState([formBatchInitData]);

  const {
    formStatus,
    setFormStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const [deletedRecord, setDeletedRecord] = useState([]);

  const [deletedRecord1, setDeletedRecord1] = useState([]);

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedRowIndex1, setFocusedRowIndex1] = useState(0);

  const [dept, setDept] = useState(null);

  // GLOBAL USERDATA
  const { user } = useSelector((state) => state.auth);

  // for help list

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update main form data
    if (["wcno", "trans", "srs"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "wcno":
            return {
              ...prev,
              wc_no: data.wc_no,
              wc_id: data.wc_id,
            };

          case "trans":
            return {
              ...prev,
              from_wc_desc: data.from_desc,
              to_wc_desc: data.to_desc,
              trans_code: data.trans_code,
            };

          case "srs":
            return {
              ...prev,
              srs_no: data.srs_no,
              srs_id: data.srs_id,
            };

          default:
            return prev;
        }
      });
    }

    // Update detail data (table rows)
    if (
      ["item", "cost", "purp", "physical"].includes(helpFor) &&
      activeRowIndex !== null
    ) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "item":
            currentRow.it_code = data.it_code;
            currentRow.it_name = data.it_name;
            currentRow.uom_code = data.um_code;
            currentRow.catalog_code = data.catalog_code;
            break;

          case "cost":
            currentRow.cc = data.prefix;
            currentRow.cost_desc = data.description;
            currentRow.cost_centr = data.code;
            break;

          case "purp":
            currentRow.purpose = data.description;
            currentRow.pur_code = data.code;
            break;

          case "physical":
            currentRow.physical_loc = data.physical_loc;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }

    if (
      ["batch", "cwono", "cwoitem"].includes(helpFor) &&
      activeRowIndex !== null
    ) {
      setFormBatchData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "batch":
            currentRow.batch_no = data.batch_no;
            currentRow.batch_date = dateFormatter(data.batch_date);
            currentRow.batch_store_qty = data.batch_qty;
            currentRow.mrir_no = data.mrir_no;
            break;

          case "cwono":
            currentRow.cwo_no = data.cwo_no;
            break;

          case "cwoitem":
            currentRow.cwo_item = data.cwo_item;
            //currentRow.cwo_item_desc= data.cwo_item_desc;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData);

    if (formData.ok_rej && formData.trans_type) {
      // console.log("Running proctranstype logic...");
      let newTrType = null;
      if (formData.ok_rej === "O") {
        newTrType =
          formData.trans_type === "R"
            ? 1
            : formData.trans_type === "I"
              ? 2
              : null;
      } else if (formData.ok_rej === "R") {
        newTrType =
          formData.trans_type === "R"
            ? 3
            : formData.trans_type === "I"
              ? 4
              : null;
      }

      if (formData.tr_type !== newTrType) {
        setFormData((prev) => ({
          ...prev,
          tr_type: newTrType,
        }));
      }
    }
    if (helpFor === "trans") {
      console.log(
        "tr_type",
        formData.tr_type,
        "ok_rej",
        formData.ok_rej,
        "mat_trans_type",
        formData.mat_trans_type
      );
      return {
        wc_id: formData.wc_id,
        tr_type: formData.tr_type,
        ok_rej: formData.ok_rej,
        mat_trans_type: formData.mat_trans_type,
      };
    }

    if (helpFor === "item") {
      return { trans_code: formData.trans_code, wc_id: formData.wc_id };
    }

    if (helpFor === "physical") {
      return { it_code: formDetailData[focusedRowIndex]?.it_code };
    }

    if (helpFor === "cwoitem") {
      return {
        it_code: formDetailData[focusedRowIndex]?.it_code,
        wc_id: formData.wc_id,
        doc_date: formData.doc_date,
        ok_rej: formData.ok_rej,
        trans_type: formData.trans_type
      };
    }

    if (helpFor === "cwono") {
      return {
        it_code: formDetailData[focusedRowIndex]?.it_code,
        wc_id: formData.wc_id,
        doc_date: formData.doc_date,
        trans_type: formData.trans_type
      };
    }

    if (helpFor === "batch") {
      return {
        it_code: formDetailData[focusedRowIndex]?.it_code,
        wc_id: formData.wc_id,
        doc_date: formData.doc_date,
        trans_type: formData.trans_type,
        ok_rej: formData.ok_rej

      };
    }
    return {};
  };

  const tabs = ["Stock Adjustment Batch"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const otherQueryPera = {
    receive_issue_flag: formData?.receive_issue_flag,
    wc_id: formData?.wc_id,
    trans_code: formData?.trans_code,
    ok_rej: formData?.ok_rej,
    doc_date: formData?.doc_date,
    division_id: formData?.division_id,
    srs_no: formData.srs_no,
    mat_trans_type: formData.mat_trans_type,
    batch_date: formBatchData[focusedRowIndex]?.batch_qty,
    tot_batch_qty: formBatchData[focusedRowIndex]?.tot_batch_qty,
    batch_store_qty: formBatchData[focusedRowIndex]?.batch_store_qty,
    store_stock: formDetailData[focusedRowIndex]?.store_stock,
    it_code: formDetailData[focusedRowIndex]?.it_code,
    doc_id: formData?.doc_id,
    from_wc_id: formData?.from_wc_id
  };

  // const getValidateItemData = async (
  //     fieldName,
  //     fieldValue,
  //     otherQueryPera = {},
  //     rowIndex = null
  // ) => {
  //     let API_STRING;

  //     try {
  //         const queryParams = new URLSearchParams({
  //             [fieldName]: fieldValue,
  //             ...otherQueryPera,
  //             appDivisionId: user?.global_division_id,
  //             appFinYear: user?.global_fin_year,
  //             appUserId: user?.id
  //         });

  //         API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_INTER_TRANSFER_MEMO_VALID_DATA}?${queryParams.toString()}`;

  //         const response = await fetch(API_STRING);

  //         // Always parse JSON to access the message even for 400 errors
  //         const data = await response.json();

  //         if (response.ok) {
  //             if (data.error) {
  //                 toast.error(data.error);
  //                 if (rowIndex !== null) {
  //                     setFormDetailData((prev) => {
  //                         const updated = [...prev];
  //                         if (updated[rowIndex]) {
  //                             updated[rowIndex][fieldName] = "";
  //                         }
  //                         return updated;
  //                     });
  //                 }
  //                 return false;
  //             }   else if (data.data && rowIndex !== null) {
  //                 const itemData = data.data;

  //                 setFormDetailData((prev) => {
  //                     const updated = [...prev];
  //                     if (updated[rowIndex]) {
  //                         updated[rowIndex] = {
  //                             ...updated[rowIndex],
  //                             it_name: itemData.it_name,
  //                             um_code: itemData.um_code,
  //                             rate: itemData.rate,
  //                           //  store_stock: itemData.store_stock,
  //                             [fieldName]: fieldValue
  //                         };
  //                     }
  //                     return updated;
  //                 });

  //                 return true;
  //             }
  //         } else if (response.status === 204) {
  //             return true;
  //         } else {

  //             const errMsg = data?.error || "Unexpected error occurred.";
  //             toast.error(errMsg);

  //             if (rowIndex !== null) {
  //                 setFormDetailData((prev) => {
  //                     const updated = [...prev];
  //                     if (updated[rowIndex]) {
  //                         updated[rowIndex][fieldName] = "";
  //                     }
  //                     return updated;
  //                 });
  //             }

  //             return false;
  //         }

  //     } catch (err) {
  //         console.error("Error validating field:", err);
  //         toast.error("Something went wrong while validating the data.");
  //         return false;
  //     }
  // };

  const fetchValidation = async (
    param,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    try {
      const queryParams = new URLSearchParams({
        param,
        [param]: fieldValue,
        ...otherQueryPera,
        appDivisionId: user?.global_division_id,
        appFinYear: user?.global_fin_year,
        appUserId: user?.id,
      });

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_STOCK_ADJUSTMENT_BATCH_FOR_VALID_DATA
        }/?${queryParams.toString()}`;

      const response = await fetch(API_STRING);
      const data = await response.json();

      return { ok: response.ok, data };
    } catch (err) {
      console.error("Error validating:", err);
      toast.error("Something went wrong while validating the data.");
      return { ok: false, data: { error: "Network error" } };
    }
  };

  const getValidateData = async (
    param,
    value,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    switch (param) {
      case "it_code":
        return await getValidateItemData(value, otherQueryPera, rowIndex);

      case "physical_loc":
        return await getValidatePhysicalData(value, otherQueryPera, rowIndex);

      // case "qty":
      //   //return await getValidateQtyData(value, otherQueryPera, rowIndex);

      case "batch_no":
        return await getValidateBatchData(value, otherQueryPera, rowIndex);

      case "batch_qty":
        return await getValidateBatchQtyData(value, otherQueryPera, rowIndex);

      case "cwo_no":
        return await getValidateBatchNoData(value, otherQueryPera, rowIndex);

      case "cwo_item":
        return await getValidateBatchItemData(value, otherQueryPera, rowIndex);

      default:
        console.warn(`Validation not implemented for param: ${param}`);
        return true;
    }
  };

  // for item level
  const getValidateItemData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "it_code",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Item");
      // if (rowIndex !== null) {
      //     setFormDetailData(prev => {
      //         const updated = [...prev];
      //         if (updated[rowIndex]) updated[rowIndex].it_code = "";
      //         return updated;
      //     });
      // }
      return false;
    }

    if (data.data && rowIndex !== null) {
      const itemData = data.data;
      setFormDetailData((prev) => {
        const updated = [...prev];
        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            it_name: itemData.it_name,
            um_code: itemData.um_code,
            rate: itemData.rate,
            it_code: fieldValue,
            store_stock: itemData.store_stock,
          };
        }
        return updated;
      });
    }

    return true;
  };

  // physical loc

  const getValidatePhysicalData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "physical_loc",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Physical Location");
      if (rowIndex !== null) {
      }
      return false;
    }

    return true;
  };

  // qty

  const getValidateQtyData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "qty",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Quantity");

      return false;
    }

    return true;
  };

  // batch_no

  const getValidateBatchData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "batch_no",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Batch No");
      if (rowIndex !== null) {
        setFormBatchData((prev) => {
          const updated = [...prev];
          if (updated[rowIndex]) updated[rowIndex].batch_no = "";
          return updated;
        });
      }
      return false;
    }

    return true;
  };

  // batch_qty

  const getValidateBatchQtyData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "batch_qty",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Batch No");

      return false;
    }

    return true;
  };

  // cwo_no

  const getValidateBatchNoData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "cwo_no",
      fieldValue,
      otherQueryPera,
      rowIndex
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Item");
      // if (rowIndex !== null) {
      //     setFormDetailData(prev => {
      //         const updated = [...prev];
      //         if (updated[rowIndex]) updated[rowIndex].it_code = "";
      //         return updated;
      //     });
      // }
      return false;
    }

    if (data.data && rowIndex !== null) {
      const itemData = data.data;
      setFormBatchData((prev) => {
        const updated = [...prev];
        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],
            cwo_id: itemData.cwo_id,
            cwo_type: itemData.cwo_type,

          };
        }
        return updated;
      });
    }

    return true;
  };

  // cwo_item

  const getValidateBatchItemData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "cwo_item",
      fieldValue,
      otherQueryPera
    );

    if (!ok || data.error) {
      toast.error(data.error || "Invalid Batch No");

      return false;
    }

    return true;
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
        `${APP_PROD_API.GET_DATA_FOR_STOCK_ADJUSTMENT_BATCH}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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

  // for handle authorisation

  const handleAuth = async () => {
    const {
      doc_id,
      doc_no,
      doc_date,
      division_id,
      trans_year,
      trans_code,
      authorised,
    } = formData;

    // Check if already authorised
    if (authorised === "Y") {
      toast.error("Cannot Unauthorise");
      return;
    }

    // Ask for confirmation
    if (!confirm("WANT TO AUTHORISED ?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.AUTHORIZED_STOCK_ADJUSTMENT_BATCH
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            formData: {
              doc_id,
              doc_no,
              doc_date,
              division_id,
              trans_year,
              trans_code,
              authorised: "N",
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message || "Voucher authorised successfully");

        // Update formData state to reflect authorised
        setFormData((prev) => ({
          ...prev,
          authorised: "Y",
          disp_flag: "Authorised",
        }));
      } else {
        toast.error(result?.message || "Authorization failed");
      }
    } catch (error) {
      console.error("Authorization error:", error);
      toast.error("Internal error while authorising voucher");
    }
  };

  // Memo Cancellation logic
  const handleCancelMemo = async () => {
    const {
      cancel_memo,
      authorised,
      wc_id,
      doc_id,
      doc_no,
      trans_code,
      division_id,
      trans_year,
      ok_rej,
    } = formData;

    if (cancel_memo === "Y") {
      alert("This Inter Transfer Memo has already been cancelled");
      return;
    }

    if (authorised === "Y") {
      alert("You cannot Cancel Authorised Inter Transfer Memo");
      return;
    }

    if (!confirm("Do you really want to cancel this Inter Transfer Memo?"))
      return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CANCELLATION_STOCK_ADJUSTMENT_BATCH
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            memoData: {
              division_id,
              trans_year,
              doc_no,
              trans_code,
              ok_rej,
              wc_id,
              doc_id,
              cancel_memo,
              authorised,
            },
            appUserId: user.id,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message || "Memo cancelled successfully.");
        setFormData((prev) => ({ ...prev, cancel_memo: "Y" }));
      } else {
        toast.error(result?.message || "Failed to cancel memo.");
      }
    } catch (error) {
      console.error("Error cancelling memo:", error);
      toast.error("An error occurred while cancelling the memo.");
    }
  };

  // ---- update handleCheckDate to accept a date ----
  const handleCheckDate = async (date) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_CHECK_DATE_IN_FINYEAR
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            memoData: { doc_date: date },
            appUserId: user.id,
            appFinYear: user.global_fin_year,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) toast.error(result?.message || "Failed to check date");
    } catch {
      toast.error("An error occurred while checking the date.");
    }
  };  


  
  // for submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValidFormData = validateForm("stock-adjustment-batch-dtl-form");
    if (!isValidFormData) return;

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
      wc_no: "Store code cannot be empty",
      from_wc_desc: "Transaction date cannot be null",
      trans_code: "Transaction code cannot be null",
      srs_no: "SRS cannot be null",
      dept_code: "Department cannot be null",
    });

    if (!isValid) return;

    try {
      let body = {
        formData: formData,
        formDetailData: formDetailData,
        formBatchData: formBatchData,
        transYear: user?.global_fin_year,
        divisionId: user?.global_division_id,
        // formBatchData: formBatchData,
        itCode: formDetailData[focusedRowIndex]?.it_code,
      };

      if (formStatus === "Update") {
        if (formData.authorised === "Y") {
          toast.error("You connot Modify Authorised Inter Transfer Memo");
          return;
        }

        if (formData.cancel_memo === "Y") {
          toast.error("This Inter Transfer Memo has already been cancelled");
          return;
        }

        if (formData.trans_code <= 100) {
          toast.error(
            "This entry is automatically generated, You connot Modify"
          );
          return;
        }

        body = {
          ...body,
          deletedFormDtlData: deletedRecord,
          deletedFormBatchData: deletedRecord1
        };
      }

      setDeletedRecord([]);
      setDeletedRecord1([]);

      console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_STOCK_ADJUSTMENT_BATCH
        }?form_status=${formStatus}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const responseData = await response.json();

      toast.success(
        formStatus === "Insert"
          ? "Data saved successfully!"
          : formStatus === "Update"
            ? "Transaction updated successfully"
            : responseData.message || "Data saved successfully!"
      );

      handleCancel();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }

    console.log("Form submitted", formData);
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({ ...formDataInitData });
    setFormDetailData([formDetailInitData]);
    setFormBatchData([formBatchInitData]);
  }, []);

  // fetch drop down data
  useEffect(() => {
    const fetchConstantList = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DROPDOWNDATA_STOCK_ADJUSTMENT_BATCH
          }`,
          { credentials: "include" }
        );
        if (response.status === 200) {
          const data = await response.json();
          setDept([
            { value: "", label: "" },
            ...formatOptions(data.department || [], "dept_cd", "department"),
          ]);
        }
      } catch (err) {
        console.error("Error fetching constants:", err);
      }
    };
    fetchConstantList();
  }, [formStatus]);

  // for generating today's date
  useEffect(() => {
    if (formStatus === "Insert") {
      if (formData.doc_date) {
        const docDateISO = formData.doc_date || new Date().toISOString();
        const formattedDate = dateFormatter(docDateISO);
        setFormData((prev) => ({ ...prev, doc_date: formattedDate }));

        // call API
        handleCheckDate(formattedDate);
      }
    }
  }, [formStatus]);

  const handleChange = useCallback(
    (type, name, value, rowIndex = null, e) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }

      if (
        [
          "wc_no",
          "srs_no",
          "it_code",
          "from_wc_desc",
          "it_code",
          "physical_loc",
          "cc",
          "purpose",
          "cwo_no",
          "cwo_item",
          "batch_no"
        ].includes(name)
      ) {
        toast.error("Please select from helplist");
        return;
      }

      const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value.toUpperCase() : value;

      // const getUpdatedValue = () => {
      //   if (!isNumberField && e?.target) {
      //     const { selectionStart, selectionEnd } = e.target;
      //     const newValue = processedValue;

      //     requestAnimationFrame(() => {
      //       e.target.setSelectionRange(selectionStart, selectionEnd);
      //     });

      //     return newValue;
      //   }
      //   return processedValue;
      // };  

      const inputType = e?.target?.type;
      const supportsSelection =
        inputType === "text" || inputType === "search" || inputType === "textarea";

      const getUpdatedValue = () => {
        if (supportsSelection && e?.target) {
          const { selectionStart, selectionEnd } = e.target;
          const newValue = processedValue;

          requestAnimationFrame(() => {
            e.target.setSelectionRange(selectionStart, selectionEnd);
          });

          return newValue;
        }
        return processedValue;
      };


      switch (type) {
        case "formData":
          setFormData((prev) => ({
            ...prev,
            [name]: getUpdatedValue(),
          }));

          break;

        case "formBatchData":
          setFormBatchData((prev) => {
            if (rowIndex !== null && rowIndex >= 0) {
              // Update a specific row
              const newData = [...prev];
              newData[rowIndex] = {
                ...newData[rowIndex],
                [name]: getUpdatedValue(),
              };
              return newData;
            } else {
              // Update all rows (used for Select field outside table)
              return prev.map((row) => ({
                ...row,
                [name]: getUpdatedValue(),
              }));
            }
          });
          break;

        case "formDetailData":
          setFormDetailData((prev) => {
            if (rowIndex !== null && rowIndex >= 0) {
              // Update a specific row
              const newData = [...prev];
              newData[rowIndex] = {
                ...newData[rowIndex],
                [name]: getUpdatedValue(),
              };
              return newData;
            } else {
              // Update all rows (used for Select field outside table)
              return prev.map((row) => ({
                ...row,
                [name]: getUpdatedValue(),
              }));
            }
          });
          break;

        default:
          console.log("handleChange is not properly defined");
      }
    },
    [formStatus]
  );

  // ADD NEW ROW
  const handleAddRow = useCallback((tableType) => {
    const isValidFormData = validateForm("stock-adjustment-batch-dtl-form");
    if (!isValidFormData) return;

    // for field level validation
    const isValid = getValidateData();

    switch (tableType) {
      case "formBatchData":
        setFormBatchData((prevData) => [
          ...prevData,
          {
            ...formBatchInitData,
            id: prevData.length + 1,
          },
        ]);
        break;
      case "formDetailData":
        setFormDetailData((prevData) => [
          ...prevData,
          {
            ...formDetailInitData,
            id: prevData.length + 1,
          },
        ]);
        break;

      default:
        console.log("something went wrong");
    }
  }, []);

  // handleDelete row

  const handleDeleteRow = useCallback(
    (tableType, index) => {
      if (tableType === "formDetailTable") {
        setFormDetailData((prev) => {
          if (prev.length === 0) return prev;

          const deletedItem = prev[index];
          const newData = prev.filter((_, i) => i !== index);

          let newDeleteData = [...deletedRecord];
          newDeleteData.push(deletedItem);
          setDeletedRecord(newDeleteData);

          // Adjust focus index
          setFocusedRowIndex((currentFocusIndex) => {
            if (index === currentFocusIndex) {
              return index > 0 ? index - 1 : 0;
            } else if (index < currentFocusIndex) {
              return currentFocusIndex - 1;
            } else {
              return currentFocusIndex;
            }
          });

          return newData;
        });
      }

      if (tableType === "formBatchTable") {
        setFormBatchData((prev) => {
          if (prev.length === 0) return prev;
          const deletedItem = prev[index];
          const newData = prev.filter((_, i) => i !== index);

          let newDeleteData = [...deletedRecord1];
          newDeleteData.push(deletedItem);
          setDeletedRecord1(newDeleteData);
          return newData;
        });
      }
    },
    [deletedRecord, deletedRecord1]
  );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        return;
      }

      setFormData(queryData.thmmmainData);

      const updatedData = queryData.tdmmmainData.map((item) => ({
        ...item,
        init_it_code: item.it_code,
      }));

      setFormBatchData(queryData.tdmmmainBatchData);

      const updatedData1 = queryData.tdmmmainBatchData.map((item) => ({
        ...item,
        init_it_code: item.it_code,
        init_batch_no: item.init_batch_no
      }));

      // setFormData(updatedData)

      setFormDetailData(updatedData);
      setFormBatchData(updatedData1)
      //setFormBatchData(queryData.tdmmmainBatchData);

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }
    },
    [formStatus, currentRecordNo]
  );

  const updateAllowed =
    formData?.cancel_memo !== "Y" && formData?.authorised !== "Y";

  // set doc_date to today's date 

  useEffect(() => {
    if (formStatus === "Insert") {
      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      setFormData((prev) => ({
        ...prev,
        doc_date: today,
      }));
    }
  }, [formStatus]);

  console.log("formStatus from memberform", formStatus);
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
        handleAuthRecord={handleAuth}
        authority={{
          insert: "Y",
          update: updateAllowed ? "Y" : "N",
          message:
            formData?.cancel_memo === "Y"
              ? "This Inter Transfer Memo has already been cancelled"
              : formData?.authorised === "Y"
                ? "You cannot Modify Authorised Inter Transfer Memo"
                : "",
        }}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        formData
        handleOffset={handleOffset}
        opterationBtn={[
          {
            name:
              formData.cancel === "Y" ? "Revert Cancellation" : "Cancel Memo",
            onClick: () => handleCancelMemo(),
          },
          // {
          //   name: "Adjust Advances",
          //   onClick: () => console.log("Adjust Advances clicked"),
          // },
        ]}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_STOCK_ADJUSTMENT_BATCH}
        getValidateBatchNoData={getValidateBatchNoData}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Row>
              <Col xl={3} className="mt-4">
                <RadioGroup
                  className="radio-button-wrapper  box-border"
                  options={[
                    { text: "Ok", value: "O" },
                    { text: "Rejection", value: "R" },
                  ]}
                  onChange={(e) =>
                    handleChange("formData", "ok_rej", e.target.value, null, e)
                  }
                  checked={formData?.ok_rej || "O"}
                />
              </Col>

              <Col xl={3} className="">
                <TextField
                  label="Store"
                  required
                  type="text"
                  name="wc_no"
                  value={formData.wc_no || ""}
                  maxLength={15}
                  // disabled
                  onChange={(e) =>
                    handleChange("formData", "wc_no", e.target.value, null, e)
                  }
                  onDoubleClick={() =>
                    handleDoubleClick("wcno", wchHelpListHeader)
                  }
                />
              </Col>

              <Col xl={3} className="mt-3">
                <p
                  style={{
                    textAlign: "center",
                    color: "red",
                    fontWeight: "Bold",
                    fontSize: "18px",
                  }}
                >
                  {formData.cancel_memo === "Y" ? "Memo Cancelled" : ""}
                </p>
              </Col>
            </Row>
            <Row className="">
              <Col xl={3} className="mt-4">
                <div className="">
                  <RadioGroup
                    className="radio-button-wrapper  box-border"
                    options={[
                      { text: "Ok", value: "I" },
                      { text: "Receive", value: "R" },
                    ]}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "trans_type",
                        e.target.value,
                        null,
                        e
                      )
                    }
                    checked={formData?.trans_type || "I"}
                  />
                </div>
              </Col>

              <Col xl={3} className="">
                <TextField
                  label="From"
                  required
                  type="text"
                  name="from_wc_desc"
                  value={formData.from_wc_desc || ""}
                  maxLength={60}
                  // disabled
                  onChange={(e) =>
                    handleChange(
                      "formData",
                      "from_wc_desc",
                      e.target.value,
                      null,
                      e
                    )
                  }
                  onDoubleClick={() =>
                    handleDoubleClick("trans", transHelpListHeader)
                  }
                />
              </Col>

              <Col xl={4} className="">
                <TextField
                  label="To"
                  required
                  type="text"
                  name="to_wc_desc"
                  value={formData.to_wc_desc || ""}
                  //maxLength={15}
                  disabled
                  onChange={(e) =>
                    handleChange(
                      "formData",
                      "to_wc_desc",
                      e.target.value,
                      null,
                      e
                    )
                  }
                />
              </Col>
            </Row>

            <Row className="mt-1">
              <Col xl={6} className="">
                <div className="text-wrapper mt-2">
                  <RadioGroup
                    className="radio-button-wrapper  box-border py-sm-4 py-md-3 py-lg-0"
                    options={[
                      { text: "Material Issue", value: "I" },
                      { text: "Material Returned", value: "R" },
                      { text: "Prod. Delivery", value: "P" },
                    ]}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "mat_trans_type",
                        e.target.value,
                        null,
                        e
                      )
                    }
                    checked={formData?.mat_trans_type || "I"}
                  />
                </div>
              </Col>

              <Col xl={2} className="mt-2">
                <Checkbox
                  //required
                  text="Temp Rect"
                  type="checkbox"
                  name="temp_rect"
                  checked={formData?.temp_rect === "Y"}
                  onChange={(e) =>
                    handleChange("formData", "temp_rect", e.target.checked ? "Y" : "N", null, e)
                  }
                //onChange={handleChange}
                />
              </Col>

              <Col xl={2} className="">
                <TextField
                  label="Entry No."
                  // required
                  type="text"
                  name="tmp_entry_no"
                  value={formData.tmp_entry_no || ""}
                  //maxLength={15}
                  disabled
                  onChange={(e) =>
                    handleChange(
                      "formData",
                      "tmp_entry_no",
                      e.target.value,
                      null,
                      e
                    )
                  }
                />
              </Col>

              <Col xl={2} className="">
                <p
                  style={{
                    textAlign: "center",
                    color: "green",
                    fontWeight: "Bold",
                    fontSize: "18px",
                  }}
                >
                  {formData.authorised === "Y" ? "Authorised" : ""}
                </p>
              </Col>
            </Row>
            <Row className="">
              <Col xl={2} className="">
                <TextField
                  label="SRS No"
                  required
                  type="text"
                  name="srs_no"
                  value={formData.srs_no || ""}
                  maxLength={40}
                  // disabled
                  onChange={(e) =>
                    handleChange("formData", "srs_no", e.target.value, null, e)
                  }
                  onDoubleClick={() =>
                    handleDoubleClick("srs", srsHelpListHeader)
                  }
                />
              </Col>

              <Col xl={2} className="">
                <TextField
                  label="Transaction Code"
                  required
                  type="text"
                  name="trans_code"
                  value={formData.trans_code || ""}
                  maxLength={3}
                  disabled={
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Query"
                  }
                  onChange={(e) =>
                    handleChange(
                      "formData",
                      "trans_code",
                      e.target.value,
                      null,
                      e
                    )
                  }
                />
              </Col>

              <Col xl={2} className="">
                <TextField
                  label="Document No"
                  // required
                  type="text"
                  name="doc_no"
                  value={formData.doc_no || ""}
                  maxLength={15}
                  disabled={
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Query"
                  }
                  onChange={(e) =>
                    handleChange("formData", "doc_no", e.target.value, null, e)
                  }
                />
              </Col>

              <Col xl={2} className="">
                <TextField
                  label="Document Date"
                  //required
                  type="date"
                  name="doc_date"
                  value={formData.doc_date || ""}
                  //maxLength={20}
                  disabled={
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Query"
                  }
                  onChange={(e) =>
                    handleChange(
                      "formData",
                      "doc_date",
                      e.target.value,
                      null,
                      e
                    )
                  }
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={4} className="">
                <Select
                  required
                  label="Department"
                  name="dept_code"
                  // placeholder={" "}
                  value={formData.dept_code || ""}
                  onChange={(e) =>
                    handleChange(
                      "formData",
                      "dept_code",
                      e.target.value,
                      null,
                      e
                    )
                  }
                  options={dept}
                />
              </Col>

              <Col xl={6} className="">
                <TextField
                  label="Remark"
                  //required
                  type="text"
                  name="remark"
                  value={formData.remark || ""}
                  maxLength={200}
                  //disabled
                  onChange={(e) =>
                    handleChange("formData", "remark", e.target.value, null, e)
                  }
                />
              </Col>

              <Col xl={1} className="m-auto"></Col>
            </Row>

            <StockAdjustmentBatchDtl
              formDetailData={formDetailData}
              formBatchData={formBatchData}
              formStatus={formStatus}
              handleChange={handleChange}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              setActiveRowIndex={setActiveRowIndex}
              setHelpFor={setHelpFor}
              handleHelpList={handleHelpList}
              setHelpListHeader={setHelpListHeader}
              handleAddRow={handleAddRow}
              getValidateData={getValidateData}
              otherQueryPera={otherQueryPera}
              handleDeleteRow={handleDeleteRow}
              // setFocusedRowIndex={setFocusedRowIndex}
              getValidateItemData={getValidateItemData}
              getValidateBatchData={getValidateBatchData}
              getValidatePhysicalData={getValidatePhysicalData}
              getValidateBatchNoData={getValidateBatchNoData}
              getValidateQtyData={getValidateQtyData}
              focusedRowIndex1={focusedRowIndex1}
              setFocusedRowIndex1={setFocusedRowIndex1}
              formData={formData}
            />
          </TabPane>

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={"Insert"}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_STOCK_ADJUSTMENT_BATCH
                    }`}
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

export default StockAdjustmentBatch;
