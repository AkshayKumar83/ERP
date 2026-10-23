import React, { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import Checkbox from "../../../../components/basic/checkbox";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import { billDetailHeaders } from "./payment_advise_helper";

const PaymentAdviseBillDetail = ({
  billDetailFormData,
  handleChange,
  triggerAddRow,
  formStatus,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = billDetailFormData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
  };



  const handleDelete = (data, index) => {
    // Implement delete row functionality
  };

  const handleUpdate = (data) => {
    // Implement update row functionality
  };
  return (
    <>
      <Form id="Payment-Advise">
        <div className="table-title">
          <span>Payment-Advise</span>
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
            <div className='table-sticky-wrapper'>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="">Actions</th>
                  )}
                  {billDetailHeaders.map((header, index) => (
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
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billDetailFormData.map((data, rowIndex) => (
                    <tr
                    key={rowIndex}
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                      style={{
                        border:
                          rowIndex === focusedRowIndex
                            ? "2px solid black"
                            : "none",
                      }}
                      tabIndex={0}
                    >
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={billDetailFormData.length > 1}
                            onDelete={() => handleDelete(data, rowIndex)}
                            onUpdate={
                              handleUpdate
                                ? () => handleUpdate(data)
                                : undefined
                            }
                          />
                        </td>
                      )}
                      <td className="table_cell">
                        <Checkbox
                          onChange={(e) =>
                            handleChange(
                              "capital_flag",
                              e.target.checked ? "Y" : "N",
                              rowIndex,
                              e
                            )
                          }
                          checked={data?.capital_flag === "Y"}
                          disabled
                        />
                      </td>
                      <td className=" table_cell">
                        <TextField
                          type="text"
                          required
                          name="doc_no"
                          value={data.doc_no || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange("doc_no", e.target.value, rowIndex, e)
                          }
                         disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="date"
                          required
                          name="doc_dt"
                          value={data.doc_dt || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange("doc_dt", e.target.value, rowIndex, e)
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="po_no"
                          value={data.po_no || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange("po_no", e.target.value, rowIndex, e)
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="cost_center"
                          value={data.cost_center || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "cost_center",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="project_no"
                          value={data.project_no || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "project_no",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="due_date"
                          value={data.due_date || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "due_date",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="init_cr_amt"
                          value={data.init_cr_amt || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "init_cr_amt",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="init_db_amt"
                          value={data.init_db_amt || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "init_db_amt",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="amount"
                          value={data.amount || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange("amount", e.target.value, rowIndex, e)
                          }
                          disabled
                        />
                      </td>
                     
                    </tr>
                 
                ))}
              </tbody>
            </Table> </div>
          </SimpleBar>
        </div>
      </Form>
      <Row>
      <Col  md={2} lg={2}>
          <TextField
            type="text"
            label=" Total Voucher Amount"
            name="voucher_amt"
            value={billDetailFormData.voucher_amt || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange("voucher_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col  md={2} lg={2}>
          <TextField
            type="text"
            label=" Total of Selection"
            name="total_sel_bill"
            value={billDetailFormData.total_sel_bill || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange("total_sel_bill", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col  md={2} lg={2}>
          <TextField
            type="text"
            label="Bill Total"
            name="bill_total"
            value={billDetailFormData.bill_total || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange("bill_total", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
        <Col  md={2} lg={2}>
          <TextField
            type="text"
            label="Current Bal."
            name="out_amt"
            value={billDetailFormData.out_amt || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange("out_amt", e.target.value, rowIndex, e)
            }
            disabled
          />
        </Col>
      </Row>

      <Row className="mt-2">
        <Col
          xl={2}
          className="d-flex align-items-center justify-content-around"
        >
          <ButtonUi color="primary" outline>
            Show All
          </ButtonUi>
          <ButtonUi color="primary" outline>
            FIFO
          </ButtonUi>
        </Col>
      </Row>
    </>
  );
};

export default PaymentAdviseBillDetail;
