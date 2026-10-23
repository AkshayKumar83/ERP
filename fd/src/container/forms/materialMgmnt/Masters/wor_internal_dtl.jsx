import React from "react";
import { Row, Col, Form, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import { formDetailHeader } from "./wor_internal_helper";
import RowAction from "../../../../components/common/rowAction";
import ButtonUi from "../../../../components/basic/button";
import RadioButton from "../../../../components/basic/radioButton";
import { batchHelpListHeader } from "./wor_internal_helper";
import { FcInfo } from "react-icons/fc";
import toast from "react-hot-toast";

const WorInternalDtl = ({
  formDetailData,
  handleChange,
  formStatus,
  handleAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  setActiveRowIndex,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  formData
}) => {
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formDetailData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    //setFocusedRowIndex1(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleDoubleClick = (field, header, rowIndex) => {
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };

  const handleBatchQtyError = (qty, batch_no) => {
    // If batch_no exists but qty is missing
    if (batch_no && (qty === "" || qty === null || qty === undefined)) {
      toast.error("Received Qty cannot be left blank");
      return true;
    } 

    if(!batch_no) {
        toast.error('Please first feed batch no')
    }

    // Skip validation if qty is empty and no batch_no condition
    if (qty === "" || qty === null || qty === undefined) {
      return false;
    }  

    if(formData.qty < qty) {
        toast.error('Total Batch Received Qty has to be same as Item Received Qty')
    }

    const num = parseFloat(qty);

    if (isNaN(num)) {
      toast.error("Invalid number");
      return true;
    }

    if (num < 0) {
      toast.error("This value cannot be negative");
      return true;
    }

    if (num === 0) {
      toast.error("This value cannot be zero");
      return true;
    }

    return false;
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={11} className="">
          <div className="box-border mt-4">
            <Form id="wor-internal-dtl-form">
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
                            <th className="">Actions</th>
                          )}
                          {formDetailHeader?.map((header, index) => (
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
                              // onBlur={() => setFocusedRowIndex(-1)}
                              style={{
                                border: `${
                                  rowIndex === focusedRowIndex
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
                                    canDelete={formDetailData.length > 0}
                                    onDelete={() =>
                                      handleDelete(data, rowIndex)
                                    }
                                    //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                  />
                                </td>
                              )}
                              <td className=" table_cell">
                                <TextField
                                  type="text"
                                  //required
                                  name="batch_no"
                                  value={data.batch_no || ""}
                                  maxLength={60}
                                  onChange={(e) =>
                                    handleChange(
                                      "formBatchData",
                                      "batch_no",
                                      e.target.value,
                                      rowIndex,
                                      e
                                    )
                                  }
                                  onDoubleClick={() =>
                                    handleDoubleClick(
                                      "batch",
                                      batchHelpListHeader,
                                      rowIndex
                                    )
                                  }
                                  onBlur={async (e) => {
                                    if (
                                      formStatus === "Update" ||
                                      formStatus === "Insert"
                                    ) {
                                      const value = e.target.value;

                                      if (
                                        value === "" ||
                                        value === null ||
                                        value === undefined
                                      )
                                        return;

                                      const quantity = parseFloat(value);
                                      if (isNaN(quantity)) return;

                                      // Round and update qty
                                      handleChange(
                                        "formDetailData",
                                        "batch_qty",
                                        quantity.toFixed(2),
                                        rowIndex,
                                        e
                                      );

                                      // Validate Batch Qty
                                      const hasLocalError = handleBatchQtyError(
                                        quantity,
                                        data.batch_no
                                      );
                                      if (hasLocalError) {
                                        e.target.focus();
                                        return;
                                      }
                                    }
                                  }}
                                />
                              </td>
                              <td className="table_cell">
                                <TextField
                                  type="date"
                                  // required
                                  name="batch_dt"
                                  value={data.batch_dt || ""}
                                  disabled
                                  //maxLength={20}
                                  onChange={(e) =>
                                    handleChange(
                                      "formBatchData",
                                      "batch_dt",
                                      e.target.value,
                                      rowIndex,
                                      e
                                    )
                                  }
                                />
                              </td>

                              <td className="table_cell">
                                <TextField
                                  type="date"
                                  // required
                                  name="expiry_date"
                                  value={data.expiry_date || ""}
                                  // disabled
                                  onChange={(e) =>
                                    handleChange(
                                      "formBatchData",
                                      "expiry_date",
                                      e.target.value,
                                      rowIndex,
                                      e
                                    )
                                  }
                                />
                              </td>
                              <td className="table_cell">
                                <TextField
                                  type="number"
                                  required={data.batch_no}
                                  name="batch_qty"
                                  value={data.batch_qty || ""}
                                  // maxLength={4}
                                  onChange={(e) =>
                                    handleChange(
                                      "formBatchData",
                                      "batch_qty",
                                      e.target.value,
                                      rowIndex,
                                      e
                                    )
                                  }
                                  onBlur={async (e) => {
                                    if (
                                      formStatus === "Update" ||
                                      formStatus === "Insert"
                                    ) {
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
                                        "formDetailData",
                                        "qty",
                                        quantity.toFixed(2),
                                        rowIndex,
                                        e
                                      );

                                      // Local validation
                                      const hasLocalError =
                                        handleBatchQtyError(quantity, data.batch_no);
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
                    </Table>{" "}
                  </div>
                </SimpleBar>
              </div>
              <Row>
                <Col xl={11} className="d-flex justify-content-end">
                  <TextField
                    type="number"
                    label="Total Batch Qty"
                    // required
                    name="total_qty"
                    value={formDetailData[focusedRowIndex]?.tot_batch_qty || ""}
                    // value={totalQty(formBatchData, "batch_qty")}
                    onChange={(e) =>
                      handleChange(
                        "formBatchData",
                        "total_qty",
                        e.target.value,
                        focusedRowIndex,
                        e
                      )
                    }
                    disabled
                  />
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default WorInternalDtl;
