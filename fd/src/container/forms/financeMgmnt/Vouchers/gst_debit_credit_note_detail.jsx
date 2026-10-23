import React, { useState } from "react";
import RadioGroup from "../../../../components/basic/radioGroup";
import { Col, Form, Row, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import {
  headers,
  itemHelpListHeader,
  accountHelpListHeader,
} from "./gst_debit_credit_note_helper";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";

const DebitCreditNotesPayDtl = ({
  handleChange,
  formStatus,
  detailFormData = [{}],
  triggerAddRow,
  setActiveRowIndex,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  focusedRowIndex,
  setFocusedRowIndex,
  handleDelete,
  validateRequiredField,
  callInsertGstData,
  setDetailFormData,
}) => {
  const handleDoubleClick = (field, header, rowIndex) => {
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailFormData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const validatePercField = (detailFormData, rowIndex, fieldName, label, e) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }
    const value = detailFormData[rowIndex]?.[fieldName];

    // Skip validation if field is empty
    if (value === "" || value === null || value === undefined) {
      return true;
    }

    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      toast.error(`${label} cannot be negative or zero`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  const handlePercentageError = (data) => {
    if (data < 0 || data > 100) {
      toast.error("Percentage value can not be negative or greater than 100");
      return true;
    }
    return false;
  };

  const handleAmtError = (data) => {
    if (data < 0) {
      toast.error("Value can not be negative.");
      return true;
    }
    return false;
  };

  function calcGstAmt(detailFormData) {
    return detailFormData.map((row) => {
      const amount = parseFloat(row.amount) || 0;
      const gst_amt_prc = row.gst_amt_prc;

      console.log("amount", amount);
      console.log("gst_amt_prc raw value:", gst_amt_prc);

      let igst_amt = 0,
        igst_cess_amt = 0;
      let cgst_amt = 0,
        cgst_cess_amt = 0;
      let sgst_amt = 0,
        sgst_cess_amt = 0;
      let ugst_amt = 0,
        ugst_cess_amt = 0;
      let comp_cess_amt = 0;

      if (gst_amt_prc === "P") {
        console.log("gst_amt_prc", gst_amt_prc);

        igst_amt = (amount * parseFloat(row.igst_val || 0)) / 100;
        igst_cess_amt = (amount * parseFloat(row.igst_cess_val || 0)) / 100;

        cgst_amt = (amount * parseFloat(row.cgst_val || 0)) / 100;
        cgst_cess_amt = (amount * parseFloat(row.cgst_cess_val || 0)) / 100;

        sgst_amt = (amount * parseFloat(row.sgst_val || 0)) / 100;
        sgst_cess_amt = (amount * parseFloat(row.sgst_cess_val || 0)) / 100;

        ugst_amt = (amount * parseFloat(row.ugst_val || 0)) / 100;
        ugst_cess_amt = (amount * parseFloat(row.ugst_cess_val || 0)) / 100;

        comp_cess_amt = (amount * parseFloat(row.comp_cess_val || 0)) / 100;

        console.log("sgst_amt", sgst_amt);
      }

      return {
        ...row,
        igst_amt: Number(igst_amt),
        igst_cess_amt: Number(igst_cess_amt),
        cgst_amt: Number(cgst_amt),
        cgst_cess_amt: Number(cgst_cess_amt),
        sgst_amt: Number(sgst_amt),
        sgst_cess_amt: Number(sgst_cess_amt),
        ugst_amt: Number(ugst_amt),
        ugst_cess_amt: Number(ugst_cess_amt),
        comp_cess_amt: Number(comp_cess_amt),
      };
    });
  }

  const handleAmount = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.rate) || 0;

    // correct amount
    const amount = qty * rate;
    return {
      amount: amount,
    };
  };

  const totAmt = (detailFormData) => {
    return detailFormData.reduce((total, row) => {
      const amount = parseFloat(row.amount) || 0;
      return total + (parseFloat(amount) || 0);
    }, 0);
  };

  const totGstAmt = (detailFormData) => {
    return detailFormData.reduce((total, row) => {
      const cgst = parseFloat(row.cgst_amt) || 0;
      const sgst = parseFloat(row.sgst_amt) || 0;
      const igst = parseFloat(row.igst_amt) || 0;
      const ugst = parseFloat(row.ugst_amt) || 0;
      const cgstCess = parseFloat(row.cgst_cess_amt) || 0;
      const sgstCess = parseFloat(row.sgst_cess_amt) || 0;
      const igstCess = parseFloat(row.igst_cess_amt) || 0;
      const ugstCess = parseFloat(row.ugst_cess_amt) || 0;

      return (
        total +
        cgst +
        sgst +
        igst +
        ugst +
        cgstCess +
        igstCess +
        sgstCess +
        ugstCess
      );
    }, 0);
  };

  const totGrossAmt = (detailFormData) => {
    const amountTotal = totAmt(detailFormData);
    const gstTotal = totGstAmt(detailFormData);
    return amountTotal + gstTotal;
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form id="GST-debit-credit-noteDtl" className=" mt-4">
            <div className="table-title">
              <span>GST Debit Credit Note</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={triggerAddRow}
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
                        {headers?.map((header, index) => (
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
                      {detailFormData?.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                          style={{
                            border: `${
                              rowIndex === focusedRowIndex
                                ? "2px solid black"
                                : "none"
                            }`,
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={detailFormData?.length > 1}
                                onDelete={() => {
                                  handleDelete(data, rowIndex);
                                }}
                              />
                            </td>
                          )}
                          <td className=" table_cell">
                            <TextField
                              type="text"
                              required
                              name="it_code"
                              value={data.it_code || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "it_code",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "item",
                                  itemHelpListHeader,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) =>
                                validateRequiredField(e, "It Code")
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="sal_pur_acc"
                              value={data.sal_pur_acc || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "sal_pur_acc",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  "acc",
                                  accountHelpListHeader,
                                  rowIndex,
                                )
                              }
                              onBlur={(e) =>
                                validateRequiredField(e, "Account Code")
                              }
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="it_name"
                              value={data.it_name || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "it_name",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="hsn_sac_code"
                              value={data.hsn_sac_code || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "hsn_sac_code",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              required
                              name="qty"
                              value={data.qty || ""}
                              // value={
                              //   typeof data?.qty === "number"
                              //     ? data?.qty.toFixed(2)
                              //     : ""
                              // }
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "qty",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              onBlur={(e) => {
                                //console.log('fgw')
                                if (
                                  formStatus === "Insert" ||
                                  formStatus === "Update" ||
                                  formStatus === "Search"
                                ) {
                                  const val = data.qty;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  console.log(parsedValue);

                                  handleChange(
                                    "detailFormData",
                                    "qty",
                                    parsedValue,
                                    rowIndex,
                                  );

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleAmtError(quantity);

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
                              type="number"
                              required
                              name="rate"
                              value={data.rate || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "rate",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              onBlur={(e) => {
                                if (
                                  ["Insert", "Update", "search"].includes(
                                    formStatus,
                                  )
                                ) {
                                  const val = data.rate;

                                  const isNumericField =
                                    !isNaN(val) && val !== "";
                                  const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                  console.log(parsedValue);

                                  handleChange(
                                    "detailFormData",
                                    "rate",
                                    parsedValue,
                                    rowIndex,
                                  );

                                  const { amount } = handleAmount(data);
                                  handleChange(
                                    "detailFormData",
                                    "amount",
                                    amount,
                                    rowIndex,
                                  );

                                  const quantity = Number(e.target.value);
                                  const hasLocalError =
                                    handleAmtError(quantity);

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
                              type="number"
                              required
                              name="amount"
                              value={data.amount || ""}
                              // value={
                              //   typeof data?.amount === "number"
                              //     ? data?.amount.toFixed(2)
                              //     : ""
                              // }

                              maxLength={30}
                              onChange={(e) =>
                                handleChange(
                                  "detailFormData",
                                  "amount",
                                  e.target.value,
                                  rowIndex,
                                  e,
                                )
                              }
                              // onBlur={async (e) => {
                              //   console.log("on blur amount", formStatus);

                              //   if (
                              //     formStatus === "Insert" ||
                              //     formStatus === "Update"
                              //   ) {

                              //     // const val = data.amount
                              //     // const isNumericField =
                              //     //   !isNaN(val) && val !== "";
                              //     // const parsedValue = isNumericField
                              //     //   ? parseFloat(val)
                              //     //   : val;
                              //     // console.log(parsedValue);

                              //     // handleChange(
                              //     //   "detailFormData",
                              //     //   "amount",
                              //     //   parsedValue?.toFixed(2),
                              //     //   rowIndex
                              //     // );

                              //     const val = data.amount;

                              //     const parsedValue = parseFloat(val);

                              //     const formattedValue = !isNaN(parsedValue)
                              //       ? parsedValue.toFixed(2)
                              //       : "";

                              //     handleChange(
                              //       "detailFormData",
                              //       "amount",
                              //       formattedValue,
                              //       rowIndex,
                              //     );

                              //     validatePercField(
                              //       detailFormData,
                              //       rowIndex,
                              //       "amount",
                              //       "Amount",
                              //       e,
                              //     );

                              //     try {
                              //       if (!e.target.value) {
                              //         return;
                              //       }
                              //       const result = await callInsertGstData();
                              //       const newGstData =
                              //         result?.tdfmtranGstData || [];

                              //       if (newGstData.length > 0) {
                              //         const updatedGSTFields = newGstData[0];

                              //         const mergedDetailData =
                              //           detailFormData.map((item, index) => {
                              //             if (index === rowIndex) {
                              //               const updatedItem = { ...item };

                              //               // Only update keys present in updatedGSTFields
                              //               for (const key in updatedGSTFields) {
                              //                 if (
                              //                   updatedGSTFields.hasOwnProperty(
                              //                     key,
                              //                   ) &&
                              //                   updatedGSTFields[key] !==
                              //                     null &&
                              //                   updatedGSTFields[key] !==
                              //                     undefined
                              //                 ) {
                              //                   updatedItem[key] =
                              //                     updatedGSTFields[key];
                              //                 }
                              //               }

                              //               return updatedItem;
                              //             }
                              //             return item; // Keep other rows unchanged
                              //           });

                              //         setDetailFormData(mergedDetailData);
                              //         console.log(
                              //           "detailFormData",
                              //           detailFormData,
                              //         );
                              //         const updatedGstVals =
                              //           calcGstAmt(mergedDetailData);
                              //         const updatedRow =
                              //           updatedGstVals[focusedRowIndex];
                              //         if (updatedRow) {
                              //           handleChange(
                              //             "detailFormData",
                              //             "sgst_amt",
                              //             updatedRow.sgst_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "sgst_cess_amt",
                              //             updatedRow.sgst_cess_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "ugst_amt",
                              //             updatedRow.ugst_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "ugst_cess_amt",
                              //             updatedRow.ugst_cess_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "cgst_amt",
                              //             updatedRow.cgst_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "cgst_cess_amt",
                              //             updatedRow.cgst_cess_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "igst_amt",
                              //             updatedRow.igst_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "igst_cess_amt",
                              //             updatedRow.igst_cess_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //           handleChange(
                              //             "detailFormData",
                              //             "comp_cess_amt",
                              //             updatedRow.comp_cess_amt,
                              //             focusedRowIndex,
                              //           ); // Correct value here
                              //         }
                              //       }

                              //       // // 4. Update overall GST totals
                              //       // updateGstTotals(formData1, mergedDetailData);
                              //     } catch (error) {
                              //       console.error(
                              //         "Error during onBlur GST flow:",
                              //         error,
                              //       );
                              //       toast.error("Failed to update GST data.");
                              //     }
                              //   }
                              // }}

                              onBlur={async (e) => {
                                console.log("on blur amount", formStatus);

                                if (
                                  formStatus !== "Insert" &&
                                  formStatus !== "Update"
                                )
                                  return;

                                const rawValue = e.target.value;

                                // ✅ sanitize input
                                if (
                                  rawValue === null ||
                                  rawValue === undefined ||
                                  rawValue === ""
                                ) {
                                  handleChange(
                                    "detailFormData",
                                    "amount",
                                    "",
                                    rowIndex,
                                  );
                                  return;
                                }
                                console.log('onBlur amount stage:: 2')
                                const parsed = Number(rawValue);

                                // ✅ ensure valid finite number
                                if (!Number.isFinite(parsed)) {
                                  handleChange(
                                    "detailFormData",
                                    "amount",
                                    "",
                                    rowIndex,
                                  );
                                  return;
                                }

                                // ✅ keep NUMBER in state (not string)
                                const roundedNumber = Number(parsed);

                                handleChange(
                                  "detailFormData",
                                  "amount",
                                  roundedNumber,
                                  rowIndex,
                                );

                                validatePercField(
                                  detailFormData,
                                  rowIndex,
                                  "amount",
                                  "Amount",
                                  e,
                                );
                                console.log('onBlur amount stage:: 3')

                                try {
                                  const result = await callInsertGstData();
                                  console.log('onBlur amount stage:: 4', result)
                                  const newGstData =
                                    result?.tdfmtranGstData || [];

                                  if (!newGstData.length) return;

                                  const updatedGSTFields = newGstData[0];

                                  const mergedDetailData = detailFormData.map(
                                    (item, index) => {
                                      if (index !== rowIndex) return item;

                                      const updatedItem = { ...item };

                                      Object.keys(updatedGSTFields).forEach(
                                        (key) => {
                                          const val = updatedGSTFields[key];
                                          if (
                                            val !== null &&
                                            val !== undefined
                                          ) {
                                            updatedItem[key] = val;
                                          }
                                        },
                                      );

                                      return updatedItem;
                                    },
                                  );

                                  setDetailFormData(mergedDetailData);

                                  const updatedGstVals =
                                    calcGstAmt(mergedDetailData);
                                  const updatedRow = updatedGstVals[rowIndex];

                                  if (updatedRow) {
                                    [
                                      "sgst_amt",
                                      "sgst_cess_amt",
                                      "ugst_amt",
                                      "ugst_cess_amt",
                                      "cgst_amt",
                                      "cgst_cess_amt",
                                      "igst_amt",
                                      "igst_cess_amt",
                                      "comp_cess_amt",
                                    ].forEach((field) => {
                                      handleChange(
                                        "detailFormData",
                                        field,
                                        updatedRow[field],
                                        rowIndex,
                                      );
                                    });
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error during onBlur GST flow:",
                                    error,
                                  );
                                  toast.error("Failed to update GST data.");
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
          </Form>
        </Col>
      </Row>

      {/* RestDetails Start here */}

      {/* {detailFormData.map((data, rowIndex) => ( */}
      <Row>
        <Row className="mb-3">
          <Col sm="12" md={12} lg={4}>
            <TextField
              type="text"
              label="Account Name"
              value={detailFormData[focusedRowIndex]?.acc_name || ""}
              onChange={(e) =>
                handleChange(
                  "detailFormData",
                  "acc_name",
                  e.target.value,
                  focusedRowIndex,
                  e,
                )
              }
              disabled
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={10}>
            <div className=" text-wrapper gst-height box-border ">
              <span className="text-label text-wrapper radio-button-wrapper">
                GST
              </span>
              <Row className=" d-flex justify-content-center text-align-center">
                <Col sm={12} md={12} lg={4} className=" mt-2">
                  <RadioGroup
                    className="radio-button-wrapper  box-border mt-2"
                    options={[
                      { text: "%", value: "P" },
                      { text: "Value", value: "V" },
                    ]}
                    onChange={(e) =>
                      handleChange(
                        "detailFormData",
                        "gst_amt_prc",
                        e.target.value,
                        focusedRowIndex,
                        e,
                      )
                    }
                    checked={
                      detailFormData[focusedRowIndex]?.gst_amt_prc || "P"
                    }
                  />
                </Col>
              </Row>
              <Row className="my-3 mx-3 justify-content-between">
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="SGST"
                      value={detailFormData[focusedRowIndex]?.sgst_val ?? ""}
                      // value={
                      //   typeof detailFormData[focusedRowIndex]?.sgst_val === "number"
                      //     ? detailFormData[focusedRowIndex]?.sgst_val.toFixed(2)
                      //     : ""
                      // }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "sgst_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val = detailFormData[focusedRowIndex]?.sgst_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "sgst_val",
                            parsedValue,
                            focusedRowIndex,
                          );
                          // validatePercField(detailFormData, focusedRowIndex, "sgst_val", "SGST", e);
                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            // console.log("updated sgst_amt", updatedRow.sgst_amt);
                            handleChange(
                              "detailFormData",
                              "sgst_amt",
                              updatedRow.sgst_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      value={detailFormData[focusedRowIndex]?.sgst_amt ?? ""}
                      // value={
                      //   typeof detailFormData[focusedRowIndex]?.sgst_amt ===
                      //     "number"
                      //     ? detailFormData[focusedRowIndex]?.sgst_amt.toFixed(2)
                      //     : ""
                      // }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "sgst_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={
                        detailFormData[focusedRowIndex]?.sgst_cess_val ?? ""
                      }
                      // value={
                      //   typeof detailFormData[focusedRowIndex]?.sgst_cess_val === "number"
                      //     ? detailFormData[focusedRowIndex]?.sgst_cess_val.toFixed(2)
                      //     : ""
                      // }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "sgst_cess_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        //validatePercField(detailFormData, focusedRowIndex, "sgst_cess_val", "Cess", e);
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update" ||
                          formStatus === "Search"
                        ) {
                          const val =
                            detailFormData[focusedRowIndex]?.sgst_cess_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "sgst_cess_val",
                            parsedValue,
                            focusedRowIndex,
                          );

                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "sgst_cess_amt",
                              updatedRow.sgst_cess_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      // value={detailFormData[focusedRowIndex]?.sgst_cess_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]
                          ?.sgst_cess_amt === "number"
                          ? detailFormData[
                              focusedRowIndex
                            ]?.sgst_cess_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "sgst_cess_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="UGST"
                      value={detailFormData[focusedRowIndex]?.ugst_val ?? ""}
                      // value={
                      //   typeof detailFormData[focusedRowIndex]?.ugst_val === "number"
                      //     ? detailFormData[focusedRowIndex]?.ugst_val.toFixed(2)
                      //     : ""
                      // }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "ugst_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        // validatePercField(detailFormData, focusedRowIndex, "ugst_val", "UGST", e);

                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update" ||
                          formStatus === "Search"
                        ) {
                          const val = detailFormData[focusedRowIndex]?.ugst_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "ugst_val",
                            parsedValue,
                            focusedRowIndex,
                          );

                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "ugst_amt",
                              updatedRow.ugst_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      // value={detailFormData[focusedRowIndex]?.ugst_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]?.ugst_amt ===
                        "number"
                          ? detailFormData[focusedRowIndex]?.ugst_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "ugst_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={
                        detailFormData[focusedRowIndex]?.ugst_cess_val ?? ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "ugst_cess_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        // validatePercField(detailFormData, focusedRowIndex, "ugst_cess_val", "Cess", e);
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val =
                            detailFormData[focusedRowIndex]?.ugst_cess_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "ugst_cess_val",
                            parsedValue,
                            focusedRowIndex,
                          );

                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "ugst_cess_amt",
                              updatedRow.ugst_cess_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      //value={detailFormData[focusedRowIndex]?.ugst_cess_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]
                          ?.ugst_cess_amt === "number"
                          ? detailFormData[
                              focusedRowIndex
                            ]?.ugst_cess_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "ugst_cess_amt",
                          e.target.val,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="CGST"
                      value={detailFormData[focusedRowIndex]?.cgst_val ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "cgst_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        //validatePercField(detailFormData, focusedRowIndex, "cgst_val", "CGST", e);

                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val = detailFormData[focusedRowIndex]?.cgst_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "cgst_val",
                            parsedValue,
                            focusedRowIndex,
                          );

                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "cgst_amt",
                              updatedRow.cgst_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      //value={detailFormData[focusedRowIndex]?.cgst_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]?.cgst_amt ===
                        "number"
                          ? detailFormData[focusedRowIndex]?.cgst_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "cgst_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={
                        detailFormData[focusedRowIndex]?.cgst_cess_val ?? ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "cgst_cess_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        // validatePercField(detailFormData, focusedRowIndex, "cgst_cess_val", "Cess", e);
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val =
                            detailFormData[focusedRowIndex]?.cgst_cess_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "cgst_cess_val",
                            parsedValue,
                            focusedRowIndex,
                          );
                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "cgst_cess_amt",
                              updatedRow.cgst_cess_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      //value={detailFormData[focusedRowIndex]?.cgst_cess_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]
                          ?.cgst_cess_amt === "number"
                          ? detailFormData[
                              focusedRowIndex
                            ]?.cgst_cess_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "cgst_cess_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="IGST"
                      value={detailFormData[focusedRowIndex]?.igst_val ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "igst_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        //validatePercField(detailFormData, focusedRowIndex, "igst_val", "IGST", e);
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val = detailFormData[focusedRowIndex]?.igst_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "igst_val",
                            parsedValue,
                            focusedRowIndex,
                          );

                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "igst_amt",
                              updatedRow.igst_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      // value={detailFormData[focusedRowIndex]?.igst_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]?.igst_amt ===
                        "number"
                          ? detailFormData[focusedRowIndex]?.igst_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "igst_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={
                        detailFormData[focusedRowIndex]?.igst_cess_val ?? ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "igst_cess_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        // validatePercField(detailFormData, focusedRowIndex, "igst_cess_val", "Cess", e);

                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val =
                            detailFormData[focusedRowIndex]?.igst_cess_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "igst_cess_val",
                            parsedValue,
                            focusedRowIndex,
                          );

                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "igst_cess_amt",
                              updatedRow.igst_cess_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Amount"
                      // value={detailFormData[focusedRowIndex]?.igst_cess_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]
                          ?.igst_cess_amt === "number"
                          ? detailFormData[
                              focusedRowIndex
                            ]?.igst_cess_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "igst_cess_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="Comp. Cess"
                      value={
                        detailFormData[focusedRowIndex]?.comp_cess_val ?? ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "comp_cess_val",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      onBlur={(e) => {
                        //  validatePercField(detailFormData, focusedRowIndex, "comp_cess_val", "Comp. Cess", e);
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          const val =
                            detailFormData[focusedRowIndex]?.comp_cess_val;
                          const isNumericField = !isNaN(val) && val !== "";
                          const parsedValue = isNumericField
                            ? parseFloat(val)
                            : val;
                          console.log(parsedValue);

                          handleChange(
                            "detailFormData",
                            "comp_cess_val",
                            parsedValue,
                            focusedRowIndex,
                          );
                          const updatedPercVals = calcGstAmt(detailFormData);
                          const updatedRow = updatedPercVals[focusedRowIndex];
                          const quantity = Number(e.target.value);
                          const hasLocalError = handlePercentageError(quantity);

                          if (hasLocalError) {
                            e.target.focus();
                            return;
                          }

                          if (updatedRow) {
                            handleChange(
                              "detailFormData",
                              "comp_cess_amt",
                              updatedRow.comp_cess_amt,
                              focusedRowIndex,
                            ); // Correct value here
                          }
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      label="Comp. Cess Amount"
                      //   value={detailFormData[focusedRowIndex]?.comp_cess_amt ?? ""}
                      value={
                        typeof detailFormData[focusedRowIndex]
                          ?.comp_cess_amt === "number"
                          ? detailFormData[
                              focusedRowIndex
                            ]?.comp_cess_amt
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "detailFormData",
                          "comp_cess_amt",
                          e.target.value,
                          focusedRowIndex,
                          e,
                        )
                      }
                      disabled
                    />
                  </Row>
                </Col>
              </Row>
            </div>
          </Col>

          <Col md={6} lg={2} className="mt-lg-4">
            <Row>
              <TextField
                type="number"
                label="Total"
                //value={detailFormData[focusedRowIndex]?.total_amt ?? ""}
                value={totAmt(detailFormData)}
                onChange={(e) =>
                  handleChange(
                    "detailFormData",
                    "total_amt",
                    e.target.value,
                    focusedRowIndex,
                    e,
                  )
                }
                disabled
              />
              <TextField
                type="number"
                label="Total GST"
                //value={detailFormData[focusedRowIndex]?.total_gst ?? ""}
                value={totGstAmt(detailFormData)}
                onChange={(e) =>
                  handleChange(
                    "detailFormData",
                    "total_gst",
                    e.target.value,
                    focusedRowIndex,
                    e,
                  )
                }
                disabled
              />
              <TextField
                type="number"
                label=" Gross Total"
                //value={detailFormData[focusedRowIndex]?.gross_amt ?? ""}
                value={totGrossAmt(detailFormData)}
                onChange={(e) =>
                  handleChange(
                    "detailFormData",
                    "gross_amt",
                    e.target.value,
                    focusedRowIndex,
                    e,
                  )
                }
                disabled
              />
            </Row>
          </Col>
        </Row>
      </Row>
      {/* ))} */}
      {/* RestDetails End */}
    </React.Fragment>
  );
};

export default DebitCreditNotesPayDtl;
