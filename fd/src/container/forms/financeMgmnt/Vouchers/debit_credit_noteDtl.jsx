import React, { useState, useCallback } from "react";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import RowAction from "../../../../components/common/rowAction";
import Checkbox from "../../../../components/basic/checkbox";
import {
  headers,
  accountHelpListHeader,
  costHelpListHeader,
  handleDbCrChng,
} from "./debit_credit_noteHelper";
import { FcInfo } from "react-icons/fc";
import toast from "react-hot-toast";

const DebitCreditNoteDtl = ({
  formDetailData = [{}],
  formStatus,
  handleChange,
  formData,
  triggerAddRow,
  handleDelete,
  purpose = [],
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  focusedRowIndex,
  setFocusedRowIndex,
  setActiveRowIndex,
  validateRequiredField,
  setParameter,
  parameter,
  handleBlurRemarks,
  callInsertTdsData,
  setDebitCreditDetailData,
}) => {
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formDetailData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
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

  const reverseDbCr = (currentDbCr) => {
    return currentDbCr === "D" ? "C" : "D";
  };

  // // MAKE ENTRY REVERS
  // const handleKeyDownOnAmt = useCallback((e, index) => {
  //     if (e.key === "-") {
  //         e.preventDefault();
  //         if (confirm('Do you want to reverse the Entry')) {
  //             let newValDbCr = reverseDbCr(formDetailData[index].db_cr)
  //             //console.log('value of dbcr', newValDbCr)
  //             handleChange(e, "db_cr", newValDbCr, index);
  //         }
  //     }
  // }, [formDetailData]);

  const handleKeyDownOnAmt = useCallback(
    (e, index) => {
      if (e.key === "-") {
        e.preventDefault();
        if (confirm("Do you want to reverse the Entry")) {
          let newValDbCr = reverseDbCr(formDetailData[index].db_cr);
          //console.log("value of dbcr", newValDbCr);
          handleChange("debitCreditDetailData", "db_cr", newValDbCr, index, e);

          // Optional: convert amount to positive after reverse
          const positiveAmt = Math.abs(parseFloat(e.target.value));
          handleChange(
            "debitCreditDetailData",
            "amount",
            positiveAmt,
            index,
            e
          );
        }
      }
    },
    [formDetailData]
  );

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


  const handleAmountChange = (e, index) => {
      const { value } = e.target;
      const { amount, db_cr } = handleDbCrChng(value, formData[index]?.db_cr);
       
        if(amount === '0'){
          handleChange('debitCreditDetailData', "amount", amount, index);
          handleChange('debitCreditDetailData', "db_cr", '', index);
          handleChange('debitCreditDetailData', "old_amount", amount, index); //copy from expense bill form
        }else{
            handleChange('debitCreditDetailData', "amount", amount, index);
            handleChange('debitCreditDetailData', "db_cr", db_cr, index);
        }

      };


  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form id="debit-credit-noteDtl" className=" mt-4">
            <div className="table-title">
              <span></span>

              {(formStatus === "Insert" || formStatus === "Update") && (
               <div className='d-flex gap-2'>
                  {/* <span>Debit/Credit</span> */}
                  {formStatus == "Insert" && (
                    <ButtonUi
                      color="secondary"
                      outline
                      onClick={(e) => {
                        if (
                          formStatus === "Insert" ||
                          formStatus === "Update"
                        ) {
                          (async () => {
                            try {
                              // 1. Call GST insert API
                              const result = await callInsertTdsData();
                              const newGstData = result?.tdfmtranGstData || [];

                              // 2. Create a copy of the current form detail data
                              const updatedDetailData = [...formDetailData];

                              // 3. Insert new GST data starting at the focused row index (without overwriting)
                              // This will push items at the right position, shifting any existing rows below
                              updatedDetailData.splice(
                                focusedRowIndex + 1,
                                0,
                                ...newGstData
                              );

                              // 4. Update state
                              setDebitCreditDetailData(updatedDetailData);

                              // 5. Debug logs
                              // //console.log("Updated Detail Data with GST:", updatedDetailData);
                              // //console.log("New GST Data:", newGstData);
                              // //console.log("Original Form Detail Data:", formDetailData);
                            } catch (error) {
                              console.error("Error during GST flow:", error);
                              toast.error("Failed to update GST data.");
                            }
                          })();
                        }
                      }}
                      type="button"
                    >
                      TDS
                    </ButtonUi>
                  )}
                  <ButtonUi
                    color="primary"
                    className="add-action"
                    onClick={triggerAddRow}
                  >
                    Add Row
                  </ButtonUi>
                </div>
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
                                onDelete={() => handleDelete(data, rowIndex)}
                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>
                          )}

                          <td className=" table_cell">
                            <TextField
                              type="text"
                              required
                              name="remarks"
                              value={data.remarks || ""}
                              maxLength={1000}
                              onChange={(e) =>
                                handleChange(
                                  "debitCreditDetailData",
                                  "remarks",
                                  e.target.value,
                                  rowIndex
                                )
                              }
                              onBlur={(e) => handleBlurRemarks(e, data)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="acc_no"
                              value={data.acc_no || ""}
                              maxLength={20}
                              onChange={(e) =>handleChange("debitCreditDetailData", "acc_no", e.target.value, rowIndex, e)}
                              onDoubleClick={() => handleDoubleClick("acc", accountHelpListHeader, rowIndex)}
                              onBlur={(e) => validateRequiredField(e, "acc_no")}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="bill_no"
                              value={data.bill_no || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("debitCreditDetailData","bill_no", e.target.value, rowIndex, e)}
                              onBlur={(e) =>validateRequiredField(e, "bill_no")}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                              required
                              name="bill_dt"
                              value={data.bill_dt || ""}
                              maxLength={30}
                              onChange={(e) =>handleChange("debitCreditDetailData", "bill_dt", e.target.value, rowIndex, e)}
                              onBlur={(e) => validateRequiredField(e, "bill_date")}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="cost"
                              value={data.cost || ""}
                              maxLength={4}
                              onChange={(e) =>handleChange("debitCreditDetailData", "cost", e.target.value, rowIndex, e)}
                              onDoubleClick={() =>handleDoubleClick("cost", costHelpListHeader, rowIndex)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              style={{ textAlign: "right" }}
                              type="number"
                              name="amount"
                              value={data.amount || ""}
                              maxLength={17}
                              // onChange={(e) =>handleChange("debitCreditDetailData","amount", e.target.value, rowIndex, e)}
                              onChange={(e) =>handleAmountChange(e, rowIndex)}
                              onBlur={(e) => validateRequiredField(e, "Amount")}
                              onKeyDown={(e) => handleKeyDownOnAmt(e, rowIndex)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="db_cr"
                              value={data.db_cr ?? ""}
                              disabled
                              maxLength={1}
                              onChange={(e) => handleChange("debitCreditDetailData", "db_cr", e.target.value, rowIndex, e)}
                              onBlur={(e) => {validateRequiredField(e, "(D)ebit or (C)redit");}}
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

      <Row >
         <Col xl={4}>
          <TextField
            label="Account Name"
            name="acc_desc"
            value={formDetailData[focusedRowIndex]?.acc_desc || ""}
            // maxLength={60}
            disabled
            onChange={(e) =>
              handleChange(
                "debitCreditDetailData",
                "acc_desc",
                e.target.value,
                focusedRowIndex
              )
            }
            onDoubleClick={() =>
              handleDoubleClick("acc", itemHelpListHeader, rowIndex)
            }
          />
        </Col>
        <Col xl={2} >
          <TextField
            label="Cost Center"
            name="cost_desc"
            value={formDetailData[focusedRowIndex]?.cost_desc || ""}
            // maxLength={60}
            disabled
            onChange={(e) =>
              handleChange(
                "debitCreditDetailData",
                "cost_desc",
                e.target.value,
                focusedRowIndex
              )
            }
          />
        </Col>
        <Col xl={4} >
          <Select
            label="Purpose Code"
            name="pur_code"
            value={formDetailData[focusedRowIndex]?.pur_code || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange(
                "debitCreditDetailData",
                "pur_code",
                e.target.value,
                focusedRowIndex
              )
            }
            options={purpose}
          />
        </Col>
        <Col xl={2}>
          <TextField
            type="number"
            label="TDS Cr Amount"
            name="tds_cr_amt"
            value={
              typeof formDetailData[focusedRowIndex]?.tds_cr_amt === "number"
                ? formDetailData[focusedRowIndex]?.tds_cr_amt.toFixed(2)
                : ""
            }
            maxLength={30}
            onChange={(e) => handleChange("debitCreditDetailData","tds_cr_amt",e.target.value,focusedRowIndex)}  
            onBlur={(e) => { 
                  if ( formStatus === "Insert" || formStatus === "Update" || formStatus === "Search") {
                   
                    const quantity = Number(e.target.value);
                    const hasLocalError = handleAmtError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
          />
        </Col>
      </Row>
      <Row >
        <Col xl={3}>
          <Row>
            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="TDS%"
                type="number"
                name="tds_perc"
               // value={formDetailData[focusedRowIndex]?.tds_perc ?? ""}
                value={
                    typeof formDetailData[focusedRowIndex]?.tds_perc === "number"
                        ? formDetailData[focusedRowIndex]?.tds_perc.toFixed(2)
                        : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_perc",
                    e.target.value,
                    focusedRowIndex
                  )
                }
                onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      handleChange(
                        "debitCreditDetailData",
                        "tds_perc",
                        val.toFixed(2),
                        focusedRowIndex
                      );
                    }

                    const quantity = Number(e.target.value);
                    const hasLocalError = handlePercentageError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>

            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="TDS Amount"
                type="number"
                name="tds_amt"
                // value={formDetailData[focusedRowIndex]?.tds_amt ?? ""}
                value={
                  typeof formDetailData[focusedRowIndex]?.tds_amt === "number"
                    ? formDetailData[focusedRowIndex]?.tds_amt.toFixed(2)
                    : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_amt",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                 onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   
                    const quantity = Number(e.target.value);
                    const hasLocalError = handleAmtError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col xl={3}>
          <Row>
            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="Surcharge%"
                type="number"
                name="tds_sur_perc"
               // value={formDetailData[focusedRowIndex]?.tds_sur_perc ?? ""}
                value={
                    typeof formDetailData[focusedRowIndex]?.tds_sur_perc === "number"
                        ? formDetailData[focusedRowIndex]?.tds_sur_perc.toFixed(2)
                        : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_sur_perc",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                  onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   

                    const quantity = Number(e.target.value);
                    const hasLocalError = handlePercentageError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>

            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="Surcharge Amount"
                type="number"
                name="tds_sur_amt"
                //value={formDetailData[focusedRowIndex]?.tds_sur_amt ?? ""}
                value={
                  typeof formDetailData[focusedRowIndex]?.tds_sur_amt ===
                  "number"
                    ? formDetailData[focusedRowIndex]?.tds_sur_amt.toFixed(2)
                    : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_sur_amt",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                 onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   
                    const quantity = Number(e.target.value);
                    const hasLocalError = handleAmtError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col xl={3}>
          <Row>
            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="Cess%"
                type="number"
                name="tds_cess_perc"
                //value={formDetailData[focusedRowIndex]?.tds_cess_perc ?? ""}
                value={
                    typeof formDetailData[focusedRowIndex]?.tds_cess_perc === "number"
                        ? formDetailData[focusedRowIndex]?.tds_cess_perc.toFixed(2)
                        : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_cess_perc",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                 onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   
                    const quantity = Number(e.target.value);
                    const hasLocalError = handlePercentageError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>

            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="Cess Amount"
                type="number"
                name="tds_cess_amt"
                //value={formDetailData[focusedRowIndex]?.tds_cess_amt ?? ""}
                value={
                  typeof formDetailData[focusedRowIndex]?.tds_cess_amt ===
                  "number"
                    ? formDetailData[focusedRowIndex]?.tds_cess_amt.toFixed(2)
                    : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_cess_amt",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                 onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   

                    const quantity = Number(e.target.value);
                    const hasLocalError = handleAmtError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col xl={3}>
          <Row>
            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="Hsc%"
                type="number"
                name="tds_hsc_perc"
               // value={formDetailData[focusedRowIndex]?.tds_hsc_perc ?? ""}
                value={
                    typeof formDetailData[focusedRowIndex]?.tds_hsc_perc === "number"
                        ? formDetailData[focusedRowIndex]?.tds_hsc_perc.toFixed(2)
                        : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_hsc_perc",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                 onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   
                    const quantity = Number(e.target.value);
                    const hasLocalError = handlePercentageError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>

            <Col xl={6}>
              <TextField
                style={{ textAlign: "right" }}
                label="Hsc Amount"
                type="number"
                name="tds_hsc_amt"
                // value={formDetailData[focusedRowIndex]?.tds_hsc_amt ?? ""}
                value={
                  typeof formDetailData[focusedRowIndex]?.tds_hsc_amt ===
                  "number"
                    ? formDetailData[focusedRowIndex]?.tds_hsc_amt.toFixed(2)
                    : ""
                }
                maxLength={17}
                onChange={(e) =>
                  handleChange(
                    "debitCreditDetailData",
                    "tds_hsc_amt",
                    e.target.value,
                    focusedRowIndex
                  )
                } 
                 onBlur={(e) => { 
                    ////console.log('fgw')
                  if (
                    formStatus === "Insert" ||
                    formStatus === "Update" ||
                    formStatus === "Search"
                  ) {
                   
                    const quantity = Number(e.target.value);
                    const hasLocalError = handleAmtError(quantity);

                    if (hasLocalError) {
                      e.target.focus();
                      return;
                    }
                  }
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

    </React.Fragment>
  );
};

export default DebitCreditNoteDtl;
