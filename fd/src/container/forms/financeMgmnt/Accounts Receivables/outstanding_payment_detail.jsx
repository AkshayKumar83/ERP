import React, { useEffect, useState } from "react";
import { Card, Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { AccNoHelpListHeader, handleValidateDetailsField, outstandingDetailHeader } from "./outstanding_payment_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import { FcInfo } from "react-icons/fc";

const OutstandingPaymentDetail = ({
  detailData = [{}],
  setDetailData,
  handleChange,
  triggerAddRow,
  formStatus,
  focusedRowIndex,
  setFocusedRowIndex,
   handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  handleDelete,
}) => {


  const makeFocusOnTableRow = (rowIndex, id) => {
    setFocusedRowIndex(rowIndex);
  };

      const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  useEffect(() => {
    if (formStatus === "Insert") {
      setDetailData((prev) =>
        prev.map((row) => ({
          ...row,
          doc_type: row.doc_type || "BL",
          inv_type: row.inv_type || "P",
          due_type: row.due_type || "N",
        }))
      );
    }
  }, [formStatus]);



  return (
    <>
    <Card className="mt-3">
      <Row className="mt-2 d-flex justify-content-center">
        <Col xl={4}>
          <RadioGroup
            className="button-group-wrapper box-border justify-content-between d-flex ms-4"
            options={[
              { text: "Invoice", value: "BL" },
              { text: "Debit Note", value: "DN" },
              { text: "Credit Note", value: "RN" },
            ]}
            onChange={(e) =>
              handleChange("detailData", "doc_type", e.target.value, 0)
            }
            checked={detailData[0]?.doc_type || "BL"}
          />
        </Col>
      </Row>

      <Form id="out-pay-dtl" className="ms-3 me-3">
        <div className="table-title">
          <span>Outstanding payment</span>

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

        <div
          className="table-wrapper-v3"
           style={{ height: "180px", maxHeight: "180px" }}
        >
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="sticky-column left">Actions</th>
                  )}
                  {outstandingDetailHeader.map((header, index) => (
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
                      {header.required && (<span className='required-asterisk'>*</span>)}
                      {header.isHelpExist && (<FcInfo title="Info" />)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {detailData.map((data, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    <tr   onClick={() => makeFocusOnTableRow(rowIndex, data.id)}
              style={{
                border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                backgroundColor: rowIndex === focusedRowIndex ? "#f5f5f5" : "transparent",
                cursor: "pointer",
              }}>
                      <td colSpan={5}>
                        <Row>
                          <Col xl={6}>
                            <RadioGroup
                              className="button-group-wrapper box-border justify-content-between ms-4"
                              options={[
                                { text: "Project", value: "P" },
                                { text: "Spare", value: "R" },
                                { text: "Servicing", value: "S" },
                              ]}
                              onChange={(e) =>
                                handleChange( "detailData", "inv_type", e.target.value, rowIndex,e)}
                                checked={data?.inv_type || "P" } 
                            />
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={4}>
                        <Col xl={6}>
                          <RadioGroup
                            className="button-group-wrapper box-border justify-content-between d-flex ms-4"
                            options={[
                              { text: "Normal", value: "N" },
                              { text: "LD", value: "L" },
                              { text: "Retention", value: "R" },
                            ]}
                            onChange={(e) =>handleChange("detailData","due_type",e.target.value,rowIndex,e)}
                            checked={data?.due_type || "N" } 
                          />
                        </Col>
                      </td>
                    </tr>

                    <tr
                      key={rowIndex}
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                      tabIndex={0}
                      style={{
                        border:
                          rowIndex === focusedRowIndex
                            ? "2px solid black"
                            : "none",
                      }}
                    >
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="sticky-column left">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={detailData.length > 1}
                            onDelete={() => handleDelete(data, rowIndex)}
                            // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined}
                          />
                        </td>
                      )}

                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="party_acc"
                          id={`party_acc_${rowIndex}`} 
                          value={data?.party_acc || ""}
                          maxLength={20}
                          onChange={(e) =>handleChange("detailData","party_acc",e.target.value,rowIndex,e)}
                          onDoubleClick={() => handleDoubleClick("AccNo", AccNoHelpListHeader)}
                          onBlur={(e) => handleValidateDetailsField(e, formStatus, rowIndex,setDetailData)}
                        />
                      </td>

                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="doc_no"
                           id={`doc_no_${rowIndex}`} 
                          value={data?.doc_no || ""}
                          maxLength={30}
                          onChange={(e) =>handleChange("detailData","doc_no",e.target.value,rowIndex,e)}
                           onBlur={(e) => handleValidateDetailsField(e, formStatus,rowIndex,setDetailData)}
                        />
                      </td>

                      <td className="table_cell">
                        <TextField
                          type="date"
                          required
                          name="doc_dt"
                           id={`doc_dt_${rowIndex}`} 
                          value={data?.doc_dt || ""}
                          onChange={(e) =>handleChange("detailData","doc_dt",e.target.value,rowIndex,e)}
                           onBlur={(e) => handleValidateDetailsField(e, formStatus,rowIndex,setDetailData)}
                        />
                      </td>

                      <td className="table_cell">
                        <TextField
                          type="text"
                          style={{ textAlign: "right" }}
                          required
                          name="amount"
                           id={`amount_${rowIndex}`} 
                          value={data?.amount || ""}
                          onChange={(e) => handleChange( "detailData", "amount", e.target.value, rowIndex,e ) }
                          onBlur={(e) => handleValidateDetailsField(e, formStatus,rowIndex,setDetailData)}
                         />
                      </td>

                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="db_cr"
                           id={`db_cr_${rowIndex}`} 
                          value={data?.db_cr || ""}
                          maxLength={1}
                          onChange={(e) => handleChange( "detailData", "db_cr", e.target.value, rowIndex,e ) }
                          onBlur={(e) => handleValidateDetailsField(e, formStatus,rowIndex,setDetailData)}
                        />
                      </td>

                      <td className="table_cell">
                        <TextField
                          type="date"
                          required
                          name="due_date"
                           id={`due_date_${rowIndex}`} 
                          value={data?.due_date || ""}
                          onChange={(e) => handleChange( "detailData", "due_date", e.target.value, rowIndex,e ) }
                           onBlur={(e) => handleValidateDetailsField(e, formStatus,rowIndex,setDetailData)}
                        />
                      </td>

                      <td className="table_cell">
                        <TextField
                          type="text"
                          name="explanation"
                          value={data?.explanation || ""}
                          maxLength={1000}
                          onChange={(e) => handleChange( "detailData", "explanation", e.target.value, rowIndex ,e) }
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
            </div>
          </SimpleBar>
        </div>
      </Form>

      <Row className="ms-1 mb-2">
        <Col lg={11}>
          <TextField
            type="text"
            label="Account Desc"
            value={detailData[focusedRowIndex]?.party_acc_desc || ""}
            onChange={(e) =>
              handleChange("detailData", "party_acc_desc", e.target.value,0,e)
            }
             disabled
          />
        </Col>
      </Row>
    </Card>
    </>
  );
};

export default OutstandingPaymentDetail;
