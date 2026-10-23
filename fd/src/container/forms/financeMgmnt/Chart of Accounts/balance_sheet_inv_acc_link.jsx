import React from "react";
import { TabContent, TabPane } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useCallback, useState } from "react";
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
  formDataHeader,
  formDetailInitData,
  opAccHelpListHeader,
  clAccHelpListHeader,
  invAccHelpListHeader,
} from "./balance_sheet_invHelper";
import HelpList from "../../../../components/HelpList";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";
import { FcInfo } from "react-icons/fc";

const BalanceSheetInvAccLink = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [currentRecordNo, setCurrentRecordNo] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [formData, setFormData] = useState({});
  const [formDetailData, setFormDetailData] = useState([
    { ...formDetailInitData },
  ]);
  const { formStatus, setFormStatus, handleOperation, releaseFormStatus } =
    useFormStatus();

  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // for help list

  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const [isHelpModelOpen, setIsHelpModelOpen] = useState();
  const toggleHelpModal = () => setHelpList(!helpList);

  const tabs = ["Balance Sheet Inv. Account  Linkage"];

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleHelpList = (data) => {
    setHelpList(data);
  };

  const onSelectHelpItem = (data) => {
    console.log("Selected Data:", data);

    // Update detail data (table rows)
    if (
      ["opAccount", "clAccount", "invAccount"].includes(helpFor) &&
      activeRowIndex !== null
    ) {
      setFormDetailData((prev) => {
        const updated = [...prev];
        const currentRow = { ...updated[activeRowIndex] };

        switch (helpFor) {
          case "opAccount":
            currentRow.op_inv_acc = data.acc_no;
            currentRow.op_acc_desc = data.acc_desc;
            break;

          case "clAccount":
            currentRow.cl_inv_acc = data.acc_no;
            currentRow.cl_acc_desc = data.acc_desc;
            break;

          case "invAccount":
            currentRow.inv_assets_acc = data.acc_no;
            currentRow.inv_acc_desc = data.acc_desc;
            break;
        }

        updated[activeRowIndex] = currentRow;
        return updated;
      });
    }
  };

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formDetailData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleDoubleClick = (field, header, rowIndex) => {
    if (formStatus === "Search") {
      toast.error("Help list is not available in search mode");
    }
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };

  // validateRequiredField
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

  const otherQueryPera = {

  }

  // handle handleValidateBlur

  const handleValidate = async (e, rowIndex, name) => {
    if (!["Insert", "Update"].includes(formStatus)) {
      return;
    }

    const field = e.target;
    const value = field.value;

    validateRequiredField({ target: field }, `${name}`);

    try {

      const isChecked =
        formDetailData[focusedRowIndex]?.init_op_inv_acc ===
        formDetailData[focusedRowIndex]?.op_inv_acc &&
        formDetailData[focusedRowIndex]?.init_cl_inv_acc ===
        formDetailData[focusedRowIndex]?.cl_inv_acc &&
        formDetailData[focusedRowIndex]?.init_inv_assets_acc ===
        formDetailData[focusedRowIndex]?.inv_assets_acc;

      if (!isChecked) {
        const result = await getValidateData(
          name,
          value,
          otherQueryPera,
          rowIndex
        );
        console.log("Validation result:", result);

        if (!result.valid) {
          // Only focus if INVALID
          field.focus();
        } else if (result.data) {

        }
      }
    } catch (err) {
      console.error("Validation error:", err);
    }
  };



  // for validate fields

  const getValidateData = async (
    fieldName,
    fieldValue,
    otherQueryPera = {},
    rowIndex = null
  ) => {
    let API_STRING;

    try {
      const queryParam = `${fieldName}=${fieldValue}`;
      const otherParams = new URLSearchParams(otherQueryPera).toString();
      const fullParams = otherParams
        ? `${queryParam}&${otherParams}`
        : queryParam;

      API_STRING = `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BALANCE_SHEET_ACC_LINK_DATA
        }?${fullParams}`;
      console.log("API URL:", API_STRING);

      const response = await fetch(API_STRING);

      if (response.status === 200) {
        const data = await response.json();
        console.log("Validation successful:", data);
        return true;
      } else if (response.status === 400) {
        const { message } = await response.json();
        toast.error(message);
        return false

        // setFormDetailData((prevData) => {
        //   const updated = [...prevData];
        //   if (updated[rowIndex]) {
        //     updated[rowIndex][fieldName] = ""; // reset the field that failed
        //   }
        //   return updated;
        // });
      } else if (response.status === 500) {
        const errmsg = await response.json();
        throw new Error(errmsg.message);
      } else if (response.status === 204) {
        //toast.info("No matching data found");
      } else {
        console.error("Unexpected status:", response.status);
      }
    } catch (err) {
      console.error("Error fetching validation data:", err);
      toast.error("Something went wrong while validating the data.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const balanceAccForm = document.getElementById(
        "balance-sheet-inv-link-form"
      );
      const balAccFormValidity = balanceAccForm.checkValidity();
      if (!balAccFormValidity) {
        if (balanceAccForm.reportValidity) {
          balanceAccForm.reportValidity();
        } else {
          throw new Error(
            "Please fill all the required details in balance account linkage form"
          );
        }
        return;
      }

      if (formStatus === 'Update') { 
         // 3. Validation logic
    const fields = [
      { name: "op_inv_acc", value: formDetailData[focusedRowIndex]?.op_inv_acc },
      { name: "cl_inv_acc", value: formDetailData[focusedRowIndex]?.cl_inv_acc },
      { name: "inv_assets_acc", value: formDetailData[focusedRowIndex]?.inv_assets_acc },
    ];

    if (formStatus === "Update" || formStatus === "Insert") {
      const isChecked =
        formDetailData[focusedRowIndex]?.init_op_inv_acc ===
        formDetailData[focusedRowIndex]?.op_inv_acc &&
        formDetailData[focusedRowIndex]?.init_cl_inv_acc ===
        formDetailData[focusedRowIndex]?.cl_inv_acc &&
        formDetailData[focusedRowIndex]?.init_inv_assets_acc ===
        formDetailData[focusedRowIndex]?.inv_assets_acc;

      if (!isChecked) {
        for (const f of fields) {
          const result = await getValidateData(
            f.name,
            f.value,
            otherQueryPera,
            focusedRowIndex
          );
          if (!result) return;
        }
      }
    }
      
      }

      let body = {
        formData: formDetailData,
      };

      //  Modify the body for "Update" status
      if (formStatus === "Update") {
        body = {
          ...body,
          // deletedData: deletedRecord,
        };
      }

      console.log("Final body to send:", body);
      const response = await fetch(
        ` ${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BALANCE_SHEET_ACC_LINK_DATA
        }?form_status=${formStatus}&step=submit`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      toast.success("Data saved successfully!");
      handleCancel();
    } catch (error) {
      toast.error(
        error.message ||
        "Please check all the form fields or contact administrator"
      );
    }
  };

  function handleOffset(data) {
    setCurrentRecordNo(data);
  }

  const handleCancel = useCallback(() => {
    // Implement cancel logic here
    releaseFormStatus();
    setFormData({});
    setFormDetailData([formDetailInitData]);
  }, []);

  const handleChange = useCallback(
    (name, value, rowIndex = null) => {
      if (!["Insert", "Update", "Search"].includes(formStatus)) {
        return;
      }

      if (
        ["Insert", "Update"].includes(formStatus) &&
        ["op_inv_acc", "cl_inv_acc", "inv_assets_acc"].includes(name)
      ) {
        toast.error("Please select from Helplist");
        return;
      }

      setFormDetailData((prev) => {
        if (
          !prev ||
          rowIndex === null ||
          rowIndex < 0 ||
          rowIndex >= prev.length
        ) {
          return prev; // Return previous state if index is invalid
        }

        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [name]: typeof value === "string" ? value.toUpperCase() : value,
        };

        return newData;
      });
    },
    [formStatus]
  );

  // ADD NEW ROW
  const handleAddRow = useCallback(async () => {
    // 1. Required field check
    const balanceAccForm = document.getElementById("balance-sheet-inv-link-form");
    if (balanceAccForm && !balanceAccForm.checkValidity()) {
      if (balanceAccForm.reportValidity) {
        balanceAccForm.reportValidity();
      } else {
        throw new Error(
          "Please fill all the required details in balance account linkage form"
        );
      }
      return;
    }

    // 2. Duplicate entry check
    const seen = new Set();
    for (const item of formDetailData) {
      const key = `${item.op_inv_acc}-${item.cl_inv_acc}-${item.inv_assets_acc}`;
      if (seen.has(key)) {
        toast.error(
          "Duplicate record found with same opening inv, closing inv and inv assets"
        );
        return;
      }
      seen.add(key);
    }

    // 3. Validation logic
    const fields = [
      { name: "op_inv_acc", value: formDetailData[focusedRowIndex]?.op_inv_acc },
      { name: "cl_inv_acc", value: formDetailData[focusedRowIndex]?.cl_inv_acc },
      { name: "inv_assets_acc", value: formDetailData[focusedRowIndex]?.inv_assets_acc },
    ];

    if (formStatus === "Update" || formStatus === "Insert") {
      const isChecked =
        formDetailData[focusedRowIndex]?.init_op_inv_acc ===
        formDetailData[focusedRowIndex]?.op_inv_acc &&
        formDetailData[focusedRowIndex]?.init_cl_inv_acc ===
        formDetailData[focusedRowIndex]?.cl_inv_acc &&
        formDetailData[focusedRowIndex]?.init_inv_assets_acc ===
        formDetailData[focusedRowIndex]?.inv_assets_acc;

      if (!isChecked) {
        for (const f of fields) {
          const result = await getValidateData(
            f.name,
            f.value,
            otherQueryPera,
            focusedRowIndex
          );
          if (!result) return;
        }
      }
    }

    // 4. Add new row
    setFormDetailData((prevData) => [...prevData, formDetailInitData]);
  }, [
    formDetailData,
    formStatus,
    focusedRowIndex,
    otherQueryPera,
    formDetailInitData,
  ]);


  // DELETE ROW
  const handleDeleteRow = useCallback(
    (data, index) => {
      setFormDetailData((prev) => {
        if (prev.length === 0) return prev;
        return prev.filter((_, i) => i !== index);
      });
    },
    [formDetailData]
  );

  const setupQueryData = useCallback(
    (queryData, btnClicked) => {
      const updatedData = queryData.accLinkData.map((item) => ({
        ...item,
        init_cl_inv_acc: item.cl_inv_acc,
        init_op_inv_acc: item.op_inv_acc,
        init_inv_assets_acc: item.inv_assets_acc

      }));

      setFormDetailData(updatedData);

      //setFormDetailData(queryData.accLinkData)

      setTotalRecordCount(queryData.count || totalRecordCount);
    },
    [formStatus, currentRecordNo]
  );

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
        QUERY_API={APP_PROD_API.GET_BALANCE_SHEET_ACC_LINK}
        isQueryReqOnInsertBtn={true}
        formName={""}
      >
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1}>
            <Row>
              <Col>
                <Form id="balance-sheet-inv-link-form">
                  <div className="table-title">
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <ButtonUi
                        color="primary"
                        className="add-action"
                        onClick={handleAddRow}
                      >
                        Add Row
                      </ButtonUi>
                    )}
                  </div>

                  <div className="table-wrapper-v3">
                    <SimpleBar forceVisible="y" autoHide={false}>
                      <div className="table-sticky-wrapper">
                        <Table hover>
                          <thead style={{ border: "" }}>
                            <tr>
                              {(formStatus === "Insert" ||
                                formStatus === "Update") && (
                                  <th className="" style={{ width: "120px" }}>
                                    Actions
                                  </th>
                                )}
                              {formDataHeader.map((header, index) => (
                                <th
                                  key={index}
                                  data-required={header.required || false}
                                  style={{
                                    whiteSpace: "nowrap",
                                    width: header.width,
                                    minWidth: header.width,
                                  }}
                                >
                                  {header.label}
                                  {header.required && (
                                    <span className="required-asterisk">*</span>
                                  )}
                                  {header.isHelpExist && (
                                    <FcInfo title="Info" />
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {formDetailData &&
                              formDetailData.map((data, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  onFocus={() =>
                                    makeFocusOnTableRow(rowIndex, data.sr_no)
                                  }
                                  style={{
                                    border: `${rowIndex === focusedRowIndex
                                      ? "2px solid black"
                                      : "none"
                                      }`,
                                  }}
                                >
                                  {(formStatus === "Insert" || formStatus === 'Update') && (
                                      <td className="">
                                        <RowAction
                                          formStatus={formStatus}
                                          canDelete={formDetailData.length >= 1}
                                          onDelete={() =>
                                            handleDeleteRow(data, rowIndex)
                                          }
                                        //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                        />
                                      </td>
                                    )}
                                  <td className="table_cell">
                                    <TextField
                                      required
                                      type="text"
                                      name="op_inv_acc"
                                      value={data.op_inv_acc || ""}
                                      maxLength={20}
                                      onChange={(e) =>
                                        handleChange(
                                          "op_inv_acc",
                                          e.target.value,
                                          rowIndex
                                        )
                                      }
                                      onDoubleClick={() =>
                                        handleDoubleClick(
                                          "opAccount",
                                          opAccHelpListHeader,
                                          rowIndex
                                        )
                                      }
                                      onBlur={(e) => {
                                        setTimeout(() => {
                                          handleValidate(e, rowIndex, 'op_inv_acc')
                                        }, 2000)

                                      }}
                                    />
                                  </td>
                                  <td className="table_cell">
                                    <TextField
                                      //  required
                                      type="text"
                                      name="op_acc_desc"
                                      value={data.op_acc_desc || ""}
                                      maxLength={60}
                                      disabled
                                      onChange={(e) =>
                                        handleChange(
                                          "op_acc_desc",
                                          e.target.value,
                                          rowIndex
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="table_cell">
                                    <TextField
                                      required
                                      type="text"
                                      name="cl_inv_acc"
                                      value={data.cl_inv_acc || ""}
                                      maxLength={20}
                                      onChange={(e) =>
                                        handleChange(
                                          "cl_inv_acc",
                                          e.target.value,
                                          rowIndex
                                        )
                                      }
                                      onDoubleClick={() =>
                                        handleDoubleClick(
                                          "clAccount",
                                          clAccHelpListHeader,
                                          rowIndex
                                        )
                                      }
                                      onBlur={(e) => {
                                        handleValidate(e, rowIndex, 'cl_inv_acc')
                                      }}
                                    />
                                  </td>
                                  <td className="table_cell">
                                    <TextField
                                      //  required
                                      type="text"
                                      name="cl_acc_desc"
                                      value={data.cl_acc_desc || ""}
                                      disabled
                                      maxLength={60}
                                      onChange={(e) =>
                                        handleChange(
                                          "cl_acc_desc",
                                          e.target.value,
                                          rowIndex
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="table_cell">
                                    <TextField
                                      required
                                      type="text"
                                      name="inv_assets_acc"
                                      value={data.inv_assets_acc || ""}
                                      maxLength={20}
                                      onChange={(e) =>
                                        handleChange(
                                          "inv_assets_acc",
                                          e.target.value,
                                          rowIndex
                                        )
                                      }
                                      onDoubleClick={() =>
                                        handleDoubleClick(
                                          "invAccount",
                                          invAccHelpListHeader,
                                          rowIndex
                                        )
                                      }
                                      onBlur={(e) => {
                                        handleValidate(e, rowIndex, 'inv_assets_acc')
                                      }}
                                    />
                                  </td>

                                  <td className="table_cell">
                                    <TextField
                                      // required
                                      type="text"
                                      name="inv_acc_desc"
                                      value={data.inv_acc_desc || ""}
                                      disabled
                                      maxLength={60}
                                      onChange={(e) =>
                                        handleChange(
                                          "inv_acc_desc",
                                          e.target.value,
                                          rowIndex
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>{" "}
                      </div>
                    </SimpleBar>
                  </div>
                </Form>
              </Col>
            </Row>
          </TabPane>
          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal}></ModalHeader>
              <ModalBody>
                <HelpList
                  // formStatus={formStatus='Insert'}
                  formStatus={"Insert"}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BALANCE_SHEET_ACC_LINK
                    }`}
                  helpListHeader={helpListHeader}
                  handleHelpList={handleHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                />
              </ModalBody>
            </Modal>
          )}
        </TabContent>
      </FormSetup>
    </React.Fragment>
  );
};

export default BalanceSheetInvAccLink;
