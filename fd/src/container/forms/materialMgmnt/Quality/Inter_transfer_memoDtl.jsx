import React, { useState, useCallback } from "react";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import RowAction from "../../../../components/common/rowAction";
import Checkbox from "../../../../components/basic/checkbox";
//import { headers, accountHelpListHeader, costHelpListHeader } from './debit_credit_noteHelper'
import {
  headers,
  batchHeaders,
  itemHelpListHeader,
  costHelpListHeader,
  purHelpListHeader,
  batchHelpListHeader,
  physHelpListHeader,
} from "./inter_transfer_memo_helpers";
import { FcInfo } from "react-icons/fc";
//import { formatTwoDecimal } from '../../../../utils/fn'
import toast from "react-hot-toast";

const InterTransferMemoDtl = ({
  formDetailData = [{}],
  formStatus,
  handleChange,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  focusedRowIndex,
  setFocusedRowIndex,
  setActiveRowIndex,
  formBatchData = [{}],
  handleAddRow,
  getValidateData,
  otherQueryPera,
  handleDeleteRow,
  focusedRowIndex1,
  setFocusedRowIndex1,
}) => {
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formDetailData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    setFocusedRowIndex1(rowIndex);
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

  const handleQtyError = (data) => {
    console.log(data);
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

  const triggerAddrow = async (tableType) => {
    let dataToCheck = [];

    if (tableType === "formDetailData") {
      dataToCheck = formDetailData;
    } else if (tableType === "formBatchData") {
      dataToCheck = formBatchData;
    }

    for (let i = 0; i < dataToCheck.length; i++) {
      const row = dataToCheck[i];
      const qty = tableType === "formDetailData" ? row.qty : row.batch_qty;

      if (handleQtyError(qty)) {
        return;
      }

      if (
        tableType === "formDetailData" &&
        (formStatus === "Update" || formStatus === "Insert")
      ) {
        try {
          const isValid = await getValidateData("qty", qty, otherQueryPera, i);
          if (!isValid) {
            return;
          }
        } catch (error) {
          console.error("Validation API failed:", error);
          return;
        }
      }
    }

    handleAddRow(tableType);
  };

  const totalQty = (data) => {
    if (!data || data.length === 0) return 0;

    let total = 0;
    data.forEach((item) => {
      total += parseFloat(item.batch_qty) || 0;
    });

    return total.toFixed(2);
  };

  return (
    <React.Fragment>
      <Form id="inter-transfer-memoDtl-form">
        <Row>
          <Col>
            <div className="table-title">
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => triggerAddrow("formDetailData")}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th className="">Actions</th>
                        )}
                        {headers.map((header, index) => (
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
                      {formDetailData.map((data, rowIndex) => (
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
                                canDelete={formDetailData.length > 1}
                                onDelete={() =>
                                  handleDeleteRow("formDetailTable", rowIndex)
                                }
                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>
                          )}
                          <td className=" table_cell">
                            <TextField
                              type="text"
                              required
                              name="it_code"
                              value={data.it_code || ""}
                              maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "it_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "item",
                                  itemHelpListHeader,
                                  rowIndex
                                )
                              }
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const item = e.target.value;
                                  const isValid = await getValidateData(
                                    "it_code",
                                    item,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="it_name"
                              value={data.it_name || ""}
                              maxLength={20}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "it_name",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              //  required
                              name="catalog_code"
                              value={data.catalog_code || ""}
                              disabled
                              maxLength={40}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "catalog_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              //  required
                              name="um_code"
                              value={data.um_code || ""}
                              maxLength={4}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "um_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              // onBlur={(e) => validateRequiredField(e, "bill_date")}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              //  required
                              name="rate"
                              value={data.rate || ""}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "rate",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              // onDoubleClick={() => handleDoubleClick("cost", costHelpListHeader, rowIndex)}
                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="number"
                              // required
                              name="srs_qty"
                              value={data.srs_qty || ""}
                              //   value={
                              //     data.srs_qty !== null &&
                              //     data.srs_qty !== undefined
                              //       ? Number(data.srs_qty).toFixed(3)
                              //       : ""
                              //   }
                              //  maxLength={4}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "srs_qty",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="physical_loc"
                              value={data.physical_loc || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "physical_loc",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "physical",
                                  physHelpListHeader,
                                  rowIndex
                                )
                              }
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const physical = e.target.value;
                                  const isValid = await getValidateData(
                                    "physical_loc",
                                    physical,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              // required
                              name="qty"
                              value={data.qty || ""}
                              maxLength={4}
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "qty",
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
                                  const val = data.amount;
                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  // console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "qty",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                    e
                                  );
                                  const value = e.target.value;
                                
                                  if (
                                    value === "" ||
                                    value === null ||
                                    value === undefined
                                  ) {
                                    return;
                                  }
                                  const quantity = Number(e.target.value);

                                  const hasLocalError =
                                    handleQtyError(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  const isValid = await getValidateData(
                                    "qty",
                                    quantity,
                                    otherQueryPera,
                                    rowIndex
                                  );
                                  if (!isValid) {
                                    e.target.focus();
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
          </Col>
        </Row>

        <Row className="justify-content-end mt-2">
          <Col xl={3}>
            <TextField
              type="text"
              label="Cost Center"
              // required
              name="cc"
              value={formDetailData[focusedRowIndex]?.cc || ""}
              maxLength={40}
              onChange={(e) =>
                handleChange(
                  "formDetailData",
                  "cc",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              onDoubleClick={() =>
                handleDoubleClick("cost", costHelpListHeader, focusedRowIndex)
              }
            />
          </Col>

          <Col xl={3}>
            <TextField
              type="text"
              label="Description"
              // required
              name="cost_desc"
              disabled
              value={formDetailData[focusedRowIndex]?.cost_desc || ""}
              maxLength={30}
              onChange={(e) =>
                handleChange(
                  "formDetailData",
                  "cost_desc",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
            />
          </Col>

          <Col xl={3}>
            <TextField
              type="text"
              label="Purpose"
              // required
              name="purpose"
              value={formDetailData[focusedRowIndex]?.purpose || ""}
              maxLength={30}
              onChange={(e) =>
                handleChange(
                  "formDetailData",
                  "purpose",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              onDoubleClick={() =>
                handleDoubleClick("purp", purHelpListHeader, focusedRowIndex)
              }
            />
          </Col>

          <Col xl={3} className="m-auto">
            <TextField
              type="number"
              label="Store Stock"
              // required
              name="store_stock"
              value={
                formDetailData[focusedRowIndex]?.store_stock !== null &&
                formDetailData[focusedRowIndex]?.store_stock !== undefined
                  ? Number(formDetailData[focusedRowIndex].store_stock).toFixed(
                      3
                    )
                  : ""
              }
              maxLength={30}
              onChange={(e) =>
                handleChange(
                  "formDetailData",
                  "store_stock",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              disabled
            />
          </Col>
        </Row>

        <Row>
          <Col xl={8}>
            <div className="table-title">
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => handleAddRow("formBatchData")}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th className="">Actions</th>
                        )}
                        {batchHeaders.map((header, index) => (
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
                      {formBatchData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() =>
                            makeFocusOnTableRow(rowIndex, data.sr_no)
                          }
                          // onBlur={() => setFocusedRowIndex(-1)}
                          style={{
                            border: `${
                              rowIndex === focusedRowIndex1
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
                                canDelete={formBatchData.length > 1}
                                onDelete={() =>
                                  handleDeleteRow("formBatchData", rowIndex)
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
                                  const batch = e.target.value;
                                  const isValid = await getValidateData(
                                    "batch_no",
                                    batch,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              // required
                              name="batch_date"
                              value={data.batch_date || ""}
                              disabled
                              //maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "formBatchData",
                                  "batch_date",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              //  required
                              name="mrir_no"
                              value={data.mrir_no || ""}
                              maxLength={20}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formBatchData",
                                  "mrir_no",
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
                              // required
                              name="batch_store_qty"
                              value={data.batch_store_qty || ""}
                              //   value={
                              //     data.batch_store_qty !== null &&
                              //     data.batch_store_qty !== undefined
                              //       ? Number(data.batch_store_qty).toFixed(2)
                              //       : ""
                              //   }
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formBatchData",
                                  "batch_store_qty",
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
                              // required
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
                                  const val = data.batch_qty;
                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  // console.log(parsedValue);

                                  handleChange(
                                    "formDetailData",
                                    "batch_qty",
                                    parsedValue?.toFixed(2),
                                    rowIndex,
                                    e
                                  );  

                                    const value = e.target.value;
                                  
                                  if (
                                    value === "" ||
                                    value === null ||
                                    value === undefined
                                  ) {
                                    return;
                                  }

                                  const batch = Number(e.target.value);
                                  const hasLocalError =
                                    handleQtyError(batch);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }
                                  const isValid = await getValidateData(
                                    "batch_qty",
                                    batch,
                                    otherQueryPera,
                                    rowIndex
                                  );
                                  if (!isValid) {
                                    e.target.focus();
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
          </Col>
        </Row>

        <Row>
          <Col xl={8} className="d-flex justify-content-end">
            <TextField
              type="number"
              label="Total Batch Qty"
              // required
              name="tot_batch_qty"
              // value={formBatchData[focusedRowIndex]?.tot_batch_qty || ""}
              value={totalQty(formBatchData, "batch_qty")}
              onChange={(e) =>
                handleChange(
                  "formBatchData",
                  "tot_batch_qty",
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
    </React.Fragment>
  );
};

export default InterTransferMemoDtl;
