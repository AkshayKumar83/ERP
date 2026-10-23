import React, { useState, useCallback } from "react";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import RowAction from "../../../../components/common/rowAction";
import Checkbox from "../../../../components/basic/checkbox";
//import { headers, accountHelpListHeader, costHelpListHeader } from './stock_adjustment_batch.helper'
import {
  headers,
  batchHeaders,
  itemHelpListHeader,
  costHelpListHeader,
  purHelpListHeader,
  batchHelpListHeader,
  physHelpListHeader,
  cwoNoHelpListHeader,
  cwoItemHelpListHeader

} from "./stock_adjustment_batch.helper";
import { FcInfo } from "react-icons/fc";
//import { formatTwoDecimal } from '../../../../utils/fn'
import toast from "react-hot-toast";

const StockAdjustmentBatchDtl = ({
  formDetailData = [{}],
  formStatus,
  handleChange,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
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
  formData,
  getValidateQtyData

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
      <Form id="stock-adjustment-batch-dtl-form">
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
                              // disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "it_code",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() => {

                                if (!formData.trans_code || !formData.wc_id) {
                                  return
                                }
                                handleDoubleClick(
                                  "item",
                                  itemHelpListHeader,
                                  rowIndex
                                )
                              }
                                // handleDoubleClick(
                                //   "item",
                                //   itemHelpListHeader,
                                //   rowIndex
                                // )
                              }
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {

                                  if (!formDetailData[focusedRowIndex].it_code) {
                                    return
                                  }
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
                              name="drawing_no"
                              value={data.drawing_no || ""}
                              maxLength={20}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "drawing_no",
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
                              disabled
                              name="srs_qty"
                              value={data.srs_qty || ""}
                              //  disabled
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
                              name="srs_already_issue"
                              value={data.srs_already_issue || ""}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "srs_already_issue",
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
                              // onBlur={async (e) => {
                              //   if (
                              //     formStatus === "Update" ||
                              //     formStatus === "Insert"
                              //   ) {
                              //     const val = data.amount;
                              //     const isNumericField =
                              //       !isNaN(val) && val !== "";
                              //     const parsedValue = isNumericField
                              //       ? parseFloat(val)
                              //       : val;
                              //     // console.log(parsedValue);

                              //     handleChange(
                              //       "formDetailData",
                              //       "qty",
                              //       parsedValue?.toFixed(2),
                              //       rowIndex,
                              //       e
                              //     );
                              //     const value = e.target.value;

                              //     if (
                              //       value === "" ||
                              //       value === null ||
                              //       value === undefined
                              //     ) {
                              //       return;
                              //     }
                              //     const quantity = Number(e.target.value);

                              //     const hasLocalError =
                              //       handleQtyError(quantity);
                              //     if (hasLocalError) {
                              //       e.target.focus();
                              //       return;
                              //     }
                              //     const isValid = await getValidateData(
                              //       "qty",
                              //       quantity,
                              //       otherQueryPera,
                              //       rowIndex
                              //     );
                              //     if (!isValid) {
                              //       e.target.focus();
                              //     }
                              //   }
                              // }} 
                              onBlur={async (e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const value = e.target.value;

                                  if (value === "" || value === null || value === undefined) return;

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
                                  const hasLocalError = handleQtyError(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // Backend validation
                                  // const isValid = await getValidateQtyData(quantity, otherQueryPera, rowIndex)
                                  // if (!isValid) {
                                  //   e.target.focus();
                                  // }
                                }
                              }}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="store_stock"
                              value={data.store_stock || ""}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "store_stock",
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
                              name="store_iss_code_desc"
                              value={data.store_iss_code_desc || ""}
                              disabled
                              onChange={(e) =>
                                handleChange(
                                  "formDetailData",
                                  "store_iss_code_desc",
                                  e.target.value,
                                  rowIndex,
                                  e
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
          </Col>
        </Row>

        <Row className="justify-content-between mt-2">

          <Col xl={3}>
            <TextField
              type="text"
              label="Item Description"
              // required
              name="it_name"
              value={formDetailData[focusedRowIndex]?.it_name || ""}
              maxLength={30}
              onChange={(e) =>
                handleChange(
                  "formDetailData",
                  "it_name",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              disabled

            />
          </Col>

          <Col xl={2}>
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
              label="Cost Description"
              // required
              disabled
              name="cc"
              value={formDetailData[focusedRowIndex]?.cost_desc || ""}
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


        </Row>

        <Row>
          <Col xl={12}>
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
                      {formBatchData?.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() =>
                            makeFocusOnTableRow(rowIndex, data.sr_no)
                          }
                          // onBlur={() => setFocusedRowIndex(-1)}
                          style={{
                            border: `${rowIndex === focusedRowIndex1
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
                              name="cwo_no"
                              value={data.cwo_no || ""}
                              maxLength={60}
                              onChange={(e) =>
                                handleChange(
                                  "formBatchData",
                                  "cwo_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() => {
                                if (!formDetailData[focusedRowIndex]?.it_code || !formData.wc_id || !formData.doc_date) {
                                  return
                                }
                                handleDoubleClick(
                                  "cwono",
                                  cwoNoHelpListHeader,
                                  rowIndex
                                )
                              }

                              }
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  if (!formBatchData[focusedRowIndex].cwo_no) {
                                    return
                                  }
                                  const batch = e.target.value;
                                  const isValid = await getValidateData(
                                    "cwo_no",
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
                              type="text"
                              // required
                              name="cwo_item"
                              value={data.cwo_item || ""}
                              // disabled
                              //maxLength={20}
                              onChange={(e) =>
                                handleChange(
                                  "formBatchData",
                                  "cwo_item",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() => {
                                if (!formDetailData[focusedRowIndex]?.it_code || !formData.wc_id || !formData.doc_date) {
                                  return
                                }

                                handleDoubleClick(
                                  "cwoitem",
                                  cwoItemHelpListHeader,
                                  rowIndex
                                )
                              }
                              }

                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  if (!formBatchData[focusedRowIndex].cwo_item) {
                                    return
                                  }
                                  const batch = e.target.value;
                                  const isValid = await getValidateData(
                                    "cwo_item",
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
                              type="text"
                              //  required
                              name="batch_no"
                              value={data.batch_no || ""}
                              maxLength={20}
                              // disabled
                              onChange={(e) =>
                                handleChange(
                                  "formBatchData",
                                  "batch_no",
                                  e.target.value,
                                  rowIndex,
                                  e
                                )
                              }
                              onDoubleClick={() => {
                                if (!formDetailData[focusedRowIndex]?.it_code || !formData.wc_id) {
                                  return
                                }

                                handleDoubleClick(
                                  "batch",
                                  batchHelpListHeader,
                                  rowIndex
                                )
                              }

                              }
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  if (!formBatchData[focusedRowIndex].batch_no) {
                                    return
                                  }
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
                              //disabled
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
                              disabled
                              // required
                              name="mrir_no"
                              value={data.mrir_no || ""}
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

          <Col xl={8} className="d-flex justify-content-start">
            <TextField
              type="text"
              label="WO item Description"
              // required
              name="cwo_item_desc"
              value={formBatchData[focusedRowIndex]?.cwo_item_desc || ""}
              //  value={totalQty(formBatchData, "batch_qty")}
              onChange={(e) =>
                handleChange(
                  "formBatchData",
                  "cwo_item_desc",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              disabled
            />
          </Col>
          <Col xl={4} className="d-flex justify-content-end">
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

export default StockAdjustmentBatchDtl;
