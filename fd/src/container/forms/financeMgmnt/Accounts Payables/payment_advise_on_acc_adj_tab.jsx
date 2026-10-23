import React, { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import {
  onAccAdjTapHeaders,
  onAccAdjTapHeaders2,
} from "./payment_advise_helper";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";

const PaymentAdviseOnAccAdjTab = ({
  onAccAdjFormData,
  handleChange,
  formStatus,
  triggerAddRow
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = onAccAdjFormData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  function handleDelete() {}
  function handleUpdate() {}

  return (
    <Form id="on-Acc-Adj-form">
      <div className="table-title">
        <span> On Account Adj.</span>
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
                {onAccAdjTapHeaders.map((header, index) => (
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
              {onAccAdjFormData.map((data, rowIndex) => (
                <tr
                  key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                  style={{
                    border: `${
                      rowIndex === focusedRowIndex ? "2px solid black" : "none"
                    }`,
                  }}
                  tabIndex={0}
                >
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <td className="">
                      <RowAction
                        formStatus={formStatus}
                        canDelete={onAccAdjFormData.length > 1}
                        onDelete={() => handleDelete(data, rowIndex)}
                        onUpdate={
                          handleUpdate ? () => handleUpdate(data) : undefined
                        }
                      />
                    </td>
                  )}
                  <td>
                    <Checkbox
                      onChange={(e) =>
                        handleChange(
                          "flag",
                          e.target.checked ? "Y" : "N",
                          rowIndex,
                          e
                        )
                      }
                      checked={data?.flag === "Y"}
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      required
                      name="doc_no"
                      value={data.doc_no || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("doc_no", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                      type="date"
                      name="doc_dt"
                      value={data.doc_dt || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("doc_dt", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      required
                      name="init_db_amt"
                      value={data.init_db_amt || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("init_db_amt", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      required
                      name="init_cr_amt"
                      value={data.init_cr_amt || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("init_cr_amt", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      required
                      name="amount"
                      value={data.amount || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("amount", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>  </div>
        </SimpleBar>
      </div>
      <Row className="d-flex justify-content-end">
        <Col lg={2}>
          <TextField
            type="text"
            label="Total of Selection"
            value={onAccAdjFormData.total_sel_oa || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange("total_sel_oa", e.target.value, rowIndex, e)
            }
            disabled={formStatus !== "Query"}
          />
        </Col>
      </Row>

      <div className="table-title">
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
      <div className="table-container">
        <SimpleBar forceVisible="y" autoHide={false}
        style={{ height: "140px", maxHeight: "140px" }}
        >
          <Table hover>
            {/* <thead>
              <tr>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <th className="sticky-column left">Actions</th>
                )}
                {onAccAdjTapHeaders2.map((header, index) => (
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
            </thead> */}
            <tbody>
              {onAccAdjFormData.map((data, rowIndex) => (
                <tr key={rowIndex}>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <td className="sticky-column left">
                      <RowAction
                        formStatus={formStatus}
                        canDelete={onAccAdjFormData.length > 1}
                        onDelete={() => handleDelete(data, rowIndex)}
                        onUpdate={
                          handleUpdate ? () => handleUpdate(data) : undefined
                        }
                      />
                    </td>
                  )}
                  
                  <td>
                    <TextField
                    style={{ backgroundColor: "yellow" }}
                      type="text"
                      required
                      name="doc_no"
                      value={data.doc_no || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("doc_no", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                    style={{ backgroundColor: "yellow" }}
                      type="text"
                      name="doc_dt"
                      value={data.doc_dt || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("doc_dt", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                    style={{ backgroundColor: "yellow" }}
                      type="text"
                      required
                      name="init_db_amt"
                      value={data.init_db_amt || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("init_db_amt", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                    style={{ backgroundColor: "yellow" }}
                      type="text"
                      required
                      name="init_cr_amt"
                      value={data.init_cr_amt || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("init_cr_amt", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                  <td>
                    <TextField
                    style={{ backgroundColor: "yellow" }}
                      type="text"
                      required
                      name="amount"
                      value={data.amount || ""}
                      maxLength={30}
                      onChange={(e) =>
                        handleChange("amount", e.target.value, rowIndex, e)
                      }
                      disabled={formStatus !== "Query"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SimpleBar>
      </div>
    </Form>
  );
};

export default PaymentAdviseOnAccAdjTab;
