import React from "react";
import { Row, Col, Form, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import {
  formDetailHeader,
  accHelpListHeader,
} from "./closing_inv_for_balSheetHelper";
import RowAction from "../../../../components/common/rowAction";
import ButtonUi from "../../../../components/basic/button";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";

const ClosingInvforBalSheetDtl = ({
  formDetailData = [{}],
  handleChange,
  formStatus,
  handleAddRow,
  handleDelete,
  setActiveRowIndex,
  setFocusedRowIndex,
  focusedRowIndex,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  formData = [],
  otherQueryPera,
  getValidateData,
}) => {
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


  const handleAmtError = (data) => {
    if (data < 0) {

      toast.error('Amount value can not be negative')
      return true;
    }
    return false;

  }


  // validateRequiredField
  const validateRequiredField = (e, fieldLabel) => {
    if (!['Insert', 'Update'].includes(formStatus)) {
      return
    }
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

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
        formDetailData[focusedRowIndex]?.init_acc_no === formDetailData[focusedRowIndex]?.acc_no;
      formDetailData[focusedRowIndex]?.init_inv_dt === formDetailData[focusedRowIndex]?.inv_dt;

      if (!isChecked) {
        const result = await getValidateData(
          name,
          value,
          otherQueryPera,
          rowIndex
        );
        console.log("Validation result:", result);

        if (!result) {
          // Only focus if INVALID
          field.focus();
        }
        else if (result.data) {

        }
      }
    } catch (err) {
      console.error("Validation error:", err);
    }
  };



  return (
    <React.Fragment>
      <Row>
        <Form id="closing-inv-balance-dtl-form">
          <Col xl={11} className="m-auto">
            <Row>
              <Col xl={3} className="m-auto">
                <TextField
                  required
                  label="Inventory Date"
                  type="date"
                  name="inv_dt"
                  value={formDetailData[focusedRowIndex]?.inv_dt || ""}
                  onChange={(e) =>
                    handleChange(
                      "formDetailData",
                      "inv_dt",
                      e.target.value,
                      focusedRowIndex
                    )
                  }
                />
              </Col>
            </Row>
            <div className="box-border mt-4">
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
                              <th className="" style={{ width: "10px" }}>
                                Actions
                              </th>
                            )}
                          {formDetailHeader.map((header, index) => (
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
                              {header.isHelpExist && <FcInfo title="Info" />}
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
                              {(formStatus === "Insert" ||
                                formStatus === "Update") && (
                                  <td className="">
                                    <RowAction
                                      formStatus={formStatus}
                                      canDelete={formDetailData.length > 1}
                                      onDelete={() =>
                                        handleDelete(data, rowIndex)
                                      }
                                    //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                    />
                                  </td>
                                )}
                              <td className="table_cell">
                                <TextField
                                  required
                                  type="text"
                                  name="acc_no"
                                  value={data.acc_no || ""}
                                  maxLength={20}
                                  onChange={(e) =>
                                    handleChange(
                                      "formDetailData",
                                      "acc_no",
                                      e.target.value,
                                      rowIndex
                                    )
                                  }
                                  onDoubleClick={() =>
                                    handleDoubleClick(
                                      "account",
                                      accHelpListHeader,
                                      rowIndex
                                    )
                                  }
                                  onBlur={(e) => {
                                    handleValidate(e, rowIndex, 'acc_no')
                                  }}
                                />
                              </td>
                              <td className="table_cell">
                                <TextField
                                  // required
                                  type="text"
                                  name="acc_desc"
                                  value={data.acc_desc || ""}
                                  maxLength={60}
                                  disabled
                                  onChange={(e) =>
                                    handleChange(
                                      "formDetailData",
                                      "acc_desc",
                                      e.target.value,
                                      rowIndex
                                    )
                                  }
                                />
                              </td>
                              <td className="table_cell">
                                <TextField
                                  required
                                  type="number"
                                  name="amount"
                                  value={data.amount ?? ""}
                                  maxLength={18}
                                  onChange={(e) =>
                                    handleChange(
                                      "formDetailData",
                                      "amount",
                                      e.target.value,
                                      rowIndex
                                    )
                                  }

                                  onBlur={(e) => {
                                    if (formStatus === "Insert" || formStatus === "Update" || formStatus === 'Search') {
                                      const val = parseFloat(data.amount);
                                      if (!isNaN(val)) {
                                        handleChange("formDetailData", "amount", val.toFixed(2), rowIndex);
                                      }


                                      const quantity = Number(e.target.value);
                                      const hasLocalError = handleAmtError(quantity);

                                      if (hasLocalError) {
                                        e.target.focus();
                                        return;
                                      }
                                    }
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </SimpleBar>
              </div>
            </div>
          </Col>
        </Form>
      </Row>
    </React.Fragment>
  );
};

export default ClosingInvforBalSheetDtl;
