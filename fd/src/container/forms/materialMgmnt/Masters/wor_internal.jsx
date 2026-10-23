import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";

import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState, useEffect } from "react";
//import { formDetailInitData } from './provision_for_balSheetHelper';
import ButtonUi from "../../../../components/basic/button";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
//import { formDetailHeader, formDetailInitData } from "./wor_internal_helper";
import RowAction from "../../../../components/common/rowAction";
import WorInternalDtl from "./wor_internal_dtl";
import {
  formDataInitData,
  formDetailInitData,
  toWCHelpListHeader,
  fromWCHelpListHeader,
  itemHelpListHeader,
  createSearchPayloadForBVSpecificSearch
} from "./wor_internal_helper";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextArea from "../../../../components/basic/textArea";
import { APP_PROD_API } from "../../../../utils/api";
//import { toWCHelpListHeader, fromWCHelpListHeader, itemHelpListHeader } from "./wor_internal_helper";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { dateFormatter, validateForm } from "../../../../utils/fn";
import { fetchAppData } from "../../../../utils/fetchUtils";
import toast from "react-hot-toast";



const WorInternal = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState([formDataInitData]);
  const [formDetailData, setFormDetailData] = useState([formDetailInitData]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus, searchQuery,
    setSearchQuery, } =
    useFormStatus();

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const [deletedRecord, setDeletedRecord] = useState([]);

  const tabs = ["WOR Internal"];

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

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // for submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValidFormData = validateForm("wor-internal-dtl-form");
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
      // adj_no: "Stock adjustment no. cannot be empty",
      wc_desc_from: "Store cannot be null",
      it_code: "Item code cannot be null",
      // qty: "Quantity cannot be null"
    });

    if (!isValid) return;

    try {
      let body = {
        formData: formData,
        formDetailData: formDetailData,
        transYear: user?.global_fin_year,
        divisionId: user?.global_division_id,
        //itCode: formDetailData[focusedRowIndex]?.it_code,
      };

      if (formStatus === "Update") {
        if (formData.authorised === "Y") {
          toast.error("You can not modify an Authorised Document");
          return;
        }

        if (formData.cancel_memo === "Y") {
          toast.error("This Inter Transfer Memo has already been cancelled");
          return;
        }

        body = {
          ...body,
          deletedFormDtlData: deletedRecord,
        };
      }

      setDeletedRecord([]);

      console.log("Final body to send:", body);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_DATA_FOR_WOR_INTERNAL
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
    setFormData({});
  }, []);

  const handleChange = useCallback(
    (type, name, value, rowIndex = null, e) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }

      if (
        ["it_code", "batch_no", "wc_desc_from", "wc_desc_to"].includes(name)
      ) {
        toast.error("Please select from helplist");
        return;
      }

      const isNumberField = e?.target?.type === "number";
      const isStringField = typeof value === "string";
      const processedValue = isStringField ? value.toUpperCase() : value;

      const inputType = e?.target?.type;
      const supportsSelection =
        inputType === "text" ||
        inputType === "search" ||
        inputType === "textarea";

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

  // for handle authorisation

 const handleAuth = async () => {
  const {
    division_id,
    trans_year,
    adj_no,
    auth_flag,
    adj_dt,
    ok_reg_from,
    ok_reg_to,
    cancel_flag,
    it_code,
    remark,
    qty,
    rate,
    wc_id_to,
    wc_id_from
  } = formData;

  // 1 Prevent Authorising cancelled document
  if (cancel_flag === "Y") {
    toast.error("You can not Authorise a cancelled Document");
    return;
  }

  // 2 Confirmation popup
  if (auth_flag === "Y") {
    if (!confirm("WANT TO UNAUTHORISE ?")) return;
  } else {
    if (!confirm("WANT TO AUTHORISE ?")) return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.AUTHORIZED_FOR_WOR_INTERNAL}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",

       
        //  NOW: Send the CURRENT flag so backend can decide next state
        body: JSON.stringify({
          formData: {
            division_id,
            trans_year,
            adj_no,
            auth_flag,  // send current state
            adj_dt,
            ok_reg_from,
            ok_reg_to,
            cancel_flag,
            it_code,
            remark,
            qty,
            rate,
            wc_id_to,
            wc_id_from
          }
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      toast.success(result?.message);

      // Backend returns newAuthFlag ("Y" or "N")
      setFormData((prev) => ({
        ...prev,
        auth_flag: result?.newAuthFlag,
        disp_flag: result?.newAuthFlag === "Y" ? "Authorised" : "Unauthorised",
      }));
    } else {
      toast.error(result?.message || "Authorization failed");
    }
  } catch (error) {
    console.error("Authorization error:", error);
    toast.error("Internal error while authorising voucher");
  }
};


  // Document Cancellation logic
  const handleCancelWor = async () => {
    const { cancel_flag, cancel_dt, division_id, trans_year, it_code, adj_no, auth_flag } = formData;

    if (!confirm("Do you really want to cancel this document?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.CANCELLATION_FOR_WOR_INTERNAL
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            formData: {
              cancel_flag,
              cancel_dt,
              division_id,
              trans_year,
              it_code,
              adj_no,
              auth_flag
            },
            appUserId: user.id,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result?.message || "Document is cancelled");
        setFormData((prev) => ({ ...prev, cancel_flag: "Y", disp_flag: "Cancelled", }));
      } else {
        toast.error(result?.message || "Failed to cancel document.");
      }
    } catch (error) {
      console.error("Error cancelling memo:", error);
      toast.error("An error occurred while cancelling the memo.");
    }
  };

  // for generating today's date
  useEffect(() => {
    if (formStatus === "Insert") {
      if (!formData.adj_dt) {
        const docDateISO = new Date().toISOString();
        const formattedDate = dateFormatter(docDateISO);

        setFormData((prev) => ({ ...prev, adj_dt: formattedDate }));

        // call API after setting date
        handleCheckDate(formattedDate);
      }

      console.log("Current adj_dt:", formData.adj_dt);
    }
  }, [formStatus]);

  // ADD NEW ROW
  const handleAddRow = useCallback(() => {
    setFormDetailData((prevData) => [...prevData, formDetailInitData]);
  }, [formDetailData]);

  // DELETE ROW
  const handleDeleteRow = useCallback(
    (data, index) => {
      console.log("Deleting row", index, data);

      //  Always get the latest deletedRecord
      setDeletedRecord((prevDeleted) => [...prevDeleted, data]);

      setFormDetailData((prev) => {
        if (prev.length === 0) return prev;

        const newData = prev.filter((_, i) => i !== index);
        console.log("Row deleted:", data);

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
    },
    [deletedRecord]
  );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      // Handle failure case
      if (queryData.recordCount === 0) {
        toast.error(queryData.message);
        handleCancel();
        return;
      }

      if (btnClicked === "Query") {
        setTotalRecordCount(queryData.count || totalRecordCount);
      }

      setFormData(queryData.tommstokAdjData);

      // // Set ass_lib_sch_exp_flag = init_flag for every item
      // const updatedtommserBatchData = queryData.tommserBatchData?.map(
      //   (item) => ({
      //     ...item,
      //     init_it_code: item.it_code,
      //   })
      // );

      setFormDetailData(queryData.tommserBatchData);
    },
    [formStatus, currentRecordNo]
  );

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update main form data
    if (["wcfrom", "wcto", "item"].includes(helpFor)) {
      setFormData((prev) => {
        switch (helpFor) {
          case "wcfrom":
            return {
              ...prev,

              wc_id: data.wc_id,
              wc_desc_from: data.description,
              wc_id_from: data.wc_id,
            };

          case "wcto":
            return {
              ...prev,
              wc_id: data.wc_id,
              wc_desc_to: data.description,
              wc_id_to: data.wc_id,
            };

          case "item":
            return {
              ...prev,
              it_code: data.it_code,
              it_desc: data.it_name,
            };

          default:
            return prev;
        }
      });
    }

    // Update detail data (table rows)
    if (["batch"].includes(helpFor) && activeRowIndex !== null) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "batch":
            currentRow.batch_no = data.batch_no;
            currentRow.batch_dt = data.batch_dt;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
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
        `${APP_PROD_API.GET_DATA_FOR_WOR_INTERNAL}?formStatus=${formStatus}&appDivisionId=${user?.global_division_id}&appFinYear=${user?.global_fin_year}&userId=${user?.id}&${queryList}`
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


  const whereClauseForHelp = (helpFor) => {
    console.log("formData data", formData);

    if (helpFor === "item") {
      return { wc_id_from: formData.wc_id_from };
    }

    if (helpFor === "batch") {
      return {
        it_code: formData?.it_code,
        wc_id_from: formData.wc_id_from,
        adj_dt: formData.adj_dt,
      };
    }
    return {};
  };

  const handleDoubleClick = (field, header) => {
    console.log(field, header);
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const otherQueryPera = {
    // receive_issue_flag: formData?.receive_issue_flag,
    wc_id_from: formData?.wc_id_from,
    wc_id_to: formData?.wc_id_to,
    trans_code: formData?.trans_code,
    it_code: formData?.it_code,
    batch_it_code: formDetailData[focusedRowIndex]?.it_code,
    ok_reg_from: formData.ok_reg_from,
    adj_dt: formData.adj_dt,
    batch_dt: formDetailData[focusedRowIndex]?.batch_dt,
  };

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

      const API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_WOR_INTERNAL_FOR_VALID_DATA
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

      case "wc_from_desc":
        return await getValidateWCfromData(value, otherQueryPera, rowIndex);

      case "batch_no":
        return await getValidateBatchData(value, otherQueryPera, rowIndex);

      case "wc_to_desc":
        return await getValidateWCtoData(value, otherQueryPera, rowIndex);

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
      return false;
    }

    // data contains item_name, store_stock, fifo_rate
    if (data) {
      setFormData((prev) => ({
        ...prev,
        stock_qty: data.stock_qty,
        it_desc: data.item_name,
        rate: data.fifo_rate,
      }));
    }

    return true;
  };

  // work center from

  const getValidateWCfromData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "wc_from_desc",
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

  // work center to

  const getValidateWCtoData = async (
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    const { ok, data } = await fetchValidation(
      "wc_to_desc",
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

    if (data.data && rowIndex !== null) {
      const itemData = data.data;
      setFormDetailData((prev) => {
        const updated = [...prev];
        if (updated[rowIndex]) {
          updated[rowIndex] = {
            ...updated[rowIndex],

            batch_dt: itemData.batch_dt,
          };
        }
        return updated;
      });
    }

    return true;
  };

  // for quantity error
  const handleQtyError = (data) => {
    console.log(data);

    if (data > Number(formData.stock_qty)) {
      toast.error("Quantity Can not be more then Stock Quantity");
    }
    if (data === null || data === undefined || data === "") {
      return;
    }

    if (data < 0) {
      toast.error("This value can not be negative");
      return true;
    }
    if (data === 0) {
      toast.error("This value can not be zero");
      return true;
    }

    return false;
  };

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
        formData
        handleOffset={handleOffset}
        QUERY_API={APP_PROD_API.GET_DATA_FOR_WOR_INTERNAL}
        formName={""}
        handleAuthRecord={handleAuth}
        searchQueryPayload={formData}
        handleSearch={handleSearch}
        formPayload={{ searchQuery }}
        setSearchQuery={setSearchQuery}
        opterationBtn={[
          {
            name:
              formData.cancel_flag === "Y" ? "Cancel WOR" : "Cancel WOR",
            onClick: () => handleCancelWor(),
          },
        ]}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Row>
              <Row>
                <Col xl={2}>
                  <TextField
                    label="Doc No"
                    // required
                    type="text"
                    name="adj_no"
                    value={formData.adj_no || ""}
                    disabled={formStatus === 'Insert' || formStatus === 'Update'}
                    maxLength={15}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "adj_no",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>

                <Col xl={2} className="">
                  <TextField
                    label="Doc Date"
                    //require
                    type="date"
                    name="adj_dt"
                    value={formData.adj_dt || ""}
                    // maxLength={20}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "adj_dt",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>
                <Col xl={4} className="mt-2">
                  <div className="text-wrapper mt-2">
                    <RadioGroup
                      className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
                      options={[
                        { text: "WOR", value: "W" },
                        { text: "WOR Store", value: "N" },
                        { text: "Scrap", value: "S" },
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
                      checked={formData?.mat_trans_type || "W"}
                    />
                  </div>
                </Col>

                <Col xl={4} className="m-auto">
                  <p className="note-text me-4 " style={{ fontSize: "14px" }}>
                    Note: To write off inventory / transfer stocks
                  </p>
                </Col>
              </Row>
              <Row className="mt-1">
                <Col xl={7} className="mt-2">
                  <p className="note-text me-4 " style={{ fontSize: "14px" }}>
                    Note: For writing off the inventory, the TO work center in
                    right side should be blank.
                  </p>
                </Col>

                <Col xl={3} className="m-auto">
                  <p
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "18px",
                      color:
                        formData.cancel_flag === "Y"
                          ? "red"
                          : formData.auth_flag === "Y"
                            ? "green"
                            : "",
                    }}
                  >
                    {formData.cancel_flag === "Y"
                      ? "Cancelled"
                      : formData.auth_flag === "Y"
                        ? "Authorised"
                        : ""}
                  </p>
                </Col>

              </Row>

              <Row className="mt-1">
                <Col xl={5}>
                  <Card className="text-wrapper py-3 px-3">
                    <span className="text-label">From</span>
                    <Row>
                      <Col>
                        <RadioGroup
                          className="radio-button-wrapper box-border "
                          options={[
                            { text: "Ok", value: "O" },
                            { text: "Rejection", value: "R" },
                          ]}
                          onChange={(e) =>
                            handleChange(
                              "formData",
                              "ok_reg_from",
                              e.target.value,
                              null,
                              e
                            )
                          }
                          checked={formData?.ok_reg_from || "O"}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        <TextField
                          label="Store"
                          name="wc_desc_from"
                          required
                          value={formData.wc_desc_from || ""}
                          maxLength={200}
                          onChange={(e) =>
                            handleChange(
                              "formData",
                              "wc_desc_from",
                              e.target.value,
                              null,
                              e
                            )
                          }
                          onDoubleClick={() =>
                            handleDoubleClick("wcfrom", fromWCHelpListHeader)
                          }
                          onBlur={async (e) => {
                            if (
                              formStatus === "Update" ||
                              formStatus === "Insert"
                            ) {
                              if (!formDetailData[focusedRowIndex].it_code) {
                                return;
                              }
                              const item = e.target.value;
                              const isValid = await getValidateData(
                                "wc_desc_from",
                                item,
                                otherQueryPera,
                                null
                              );

                              if (!isValid) {
                                e.target.focus();
                              }
                            }
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col xl={5}>
                  <Card className="text-wrapper py-3 px-3">
                    <span className="text-label">To</span>
                    <Row>
                      <Col>
                        <RadioGroup
                          className="radio-button-wrapper box-border "
                          options={[
                            { text: "Ok", value: "O" },
                            { text: "Rejection", value: "R" },
                          ]}
                          onChange={(e) =>
                            handleChange(
                              "formData",
                              "ok_reg_to",
                              e.target.value,
                              null,
                              e
                            )
                          }
                          checked={formData?.ok_reg_to || "O"}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        <TextField
                          label="Store"
                          name="wc_desc_to"
                          value={formData.wc_desc_to || ""}
                          onChange={(e) =>
                            handleChange(
                              "formData",
                              "wc_desc_to",
                              e.target.value,
                              null,
                              e
                            )
                          }
                          onDoubleClick={() =>
                            handleDoubleClick("wcto", toWCHelpListHeader)
                          }
                          onBlur={async (e) => {
                            if (
                              formStatus === "Update" ||
                              formStatus === "Insert"
                            ) {
                              if (!formDetailData[focusedRowIndex].it_code) {
                                return;
                              }
                              const item = e.target.value;
                              const isValid = await getValidateData(
                                "wc_desc_to",
                                item,
                                otherQueryPera,
                                null
                              );

                              if (!isValid) {
                                e.target.focus();
                              }
                            }
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-2">
                <Col xl={3}>
                  <TextField
                    label="Item"
                    required
                    name="it_code"
                    value={formData.it_code || ""}
                    maxLength={20}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "it_code",
                        e.target.value,
                        null,
                        e
                      )
                    }
                    onDoubleClick={() =>
                      handleDoubleClick("item", itemHelpListHeader)
                    }
                    onBlur={async (e) => {
                      console.log("dss");
                      if (formStatus === "Update" || formStatus === "Insert") {
                        // if (!formDetailData[focusedRowIndex].it_code) {
                        //   return;
                        // }

                        console.log("chc");
                        const item = e.target.value;
                        const isValid = await getValidateData(
                          "it_code",
                          item,
                          otherQueryPera,
                          null
                        );

                        if (!isValid) {
                          e.target.focus();
                        }
                      }
                    }}
                  />
                </Col>
                <Col xl={3} className="">
                  <TextField
                    label="Description"
                    disabled
                    type="text"
                    name="it_desc"
                    value={formData.it_desc || ""}
                    maxLength={200}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "it_desc",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>

                <Col xl={3}>
                  <TextField
                    label="Qty"
                    type="number"
                    name="qty"
                    //  required
                    value={formData.qty || ""}
                    maxLength={13}
                    onChange={(e) =>
                      handleChange("formData", "qty", e.target.value, null, e)
                    }
                    onBlur={async (e) => {
                      if (formStatus === "Update" || formStatus === "Insert") {
                        const value = e.target.value;

                        if (
                          value === "" ||
                          value === null ||
                          value === undefined
                        )
                          return;

                        const quantity = parseFloat(value);
                        if (isNaN(quantity)) return;

                        // Round to 2 decimal places and set the value
                        handleChange(
                          "formData",
                          "qty",
                          quantity.toFixed(2),
                          null,
                          e
                        );

                        // Local validation
                        const hasLocalError = handleQtyError(quantity);
                        if (hasLocalError) {
                          e.target.focus();
                          return;
                        }
                      }
                    }}
                  />
                </Col>
                <Col xl={3} className="">
                  <TextField
                    label="Stock Qty"
                    disabled
                    type="number"
                    name="stock_qty"
                    maxLength={13}
                    value={formData.stock_qty || ""}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "stock_qty",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>
              </Row>

              <Row className="mt-1">
                <Col xl={3} className="">
                  <TextField
                    label="Rate"
                    type="number"
                    name="rate"
                    disabled
                    value={formData.rate || ""}
                    maxLength={15}
                    onChange={(e) =>
                      handleChange("formData", "rate", e.target.value, null, e)
                    }
                  />
                </Col>

                <Col xl={3} className="">
                  <TextField
                    label="Value"
                    type="number"
                    name="tot_value"
                    disabled
                    value={formData.tot_value || ""}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "tot_value",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>
                <Col xl={3} className="">
                  <TextField
                    label="Cancel Date"
                    type="date"
                    name="cancel_dt"
                    value={formData.cancel_dt || ""}
                    disabled
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "cancel_dt",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>
                <Col xl={3} className="">
                  <Checkbox
                    label="Authorised"
                    name="auth_flag"
                    // value={formData.auth_flag || "Y"}
                    // onChange={(e) => handleChange("formData", "auth_flag", e.target.value, null, e)}
                    checked={formData?.auth_flag === "Y"}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "auth_flag",
                        e.target.checked ? "Y" : "N",
                        null,
                        e
                      )
                    }
                  />
                </Col>
              </Row>

              <Row className="mt-2">
                <Col className="">
                  <TextArea
                    label="Remark"
                    type="text"
                    name="remark"
                    value={formData.remark || ""}
                    maxLength={2000}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "remark",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>
                <Col className="">
                  <TextArea
                    label="Cancel Reason"
                    type="text"
                    name="cancel_reason"
                    value={formData.cancel_reason || ""}
                    maxLength={200}
                    onChange={(e) =>
                      handleChange(
                        "formData",
                        "cancel_reason",
                        e.target.value,
                        null,
                        e
                      )
                    }
                  />
                </Col>
              </Row>
            </Row>
            <WorInternalDtl
              formDetailData={formDetailData}
              handleChange={handleChange}
              formStatus={formStatus}
              handleAddRow={handleAddRow}
              handleDelete={handleDeleteRow}
              focusedRowIndex={focusedRowIndex}
              setFocusedRowIndex={setFocusedRowIndex}
              setActiveRowIndex={setActiveRowIndex}
              setHelpFor={setHelpFor}
              handleHelpList={handleHelpList}
              setHelpListHeader={setHelpListHeader}
              getValidateData={getValidateData}
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
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_DATA_FOR_WOR_INTERNAL
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

export default WorInternal;
