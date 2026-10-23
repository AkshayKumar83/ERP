

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Row,
  Col,
  Form,
  Table,
} from "reactstrap";
import SimpleBar from "simplebar-react";

import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import RowAction from "../../../../components/common/rowAction";

import { loanDetalHeader} from "./loan_mas_helper";

const LoanMasterDtl = ({
  formData,
  formStatus,
  handleChange,
  handleAddRow,
  handleDeleteRow,
  handleHelpList = () => {},
  openHelpList = () => {},
  onSelectHelpItem = () => {},
  focusedRowIndex = 0,
  setFocusedRowIndex = () => {},
}) => {
  const tableContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop =
        tableContainerRef.current.scrollHeight;
    }
  }, []);

  const handleDelete = (data, index) => {
    handleDeleteRow(index);
  };

  const handleUpdate = (data) => {
    ////console.log("Update button clicked");
  };

  const handleAdd = () => {
    handleAddRow();
    setTimeout(() => {
      setFocusedRowIndex(formData.length);
    }, 0);
  };

  const makeFocusOnTableRow = (rowIndex, row_id) => {
    const entry = formData.find((entry) => entry.row_id === row_id);
    setFocusedRowIndex(rowIndex);
  };

  useEffect(() => {
    if (formStatus !== "Query") {
      scrollToBottom();
    }
  }, [formData.length, formStatus, scrollToBottom]);

  return (
    <Form id="loan-mas-dtl-form">
      <Row>
        <Col className="m-auto">
          <div className="table-title">
            <span>EFA Detail</span>
            {/* {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi
                color="primary"
                className="add-action"
                onClick={handleAdd}
              >
                Add Row
              </ButtonUi>
            )} */}
          </div>

          <div className="table-wrapper-v3">
            <SimpleBar forceVisible="Y" autoHide={false}>
              <div className="table-sticky-wrapper">
                <Table hover>
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th style={{ width: "5%" }}>Actions</th>
                      )}
                      {loanDetalHeader.map((header, index) => (
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
                          {header.isHelpExist && <span title="Info">ℹ️</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData?.map((data, rowIndex) => (
                      <tr
                        key={rowIndex}
                        onFocus={() =>
                          makeFocusOnTableRow(rowIndex, data.row_id)
                        }
                      >
                        {(formStatus === "Insert" || formStatus === "Update") && (
                          <td >
                            <RowAction
                              formStatus={formStatus}
                              canDelete={formData.length > 1}
                              onDelete={() => handleDelete(data, rowIndex)}
                              // onUpdate={() => handleUpdate(data)}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                            required
                            name="emi_sno"
                            value={data?.emi_sno || ""}
                            onChange={(e) =>
                              handleChange(e, "emi_sno", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            // style={{ width: "100%", padding: "5px" }}
                            name="emi_date"
                            type="date"
                            value={data?.emi_date || ""}
                            onChange={(e) =>
                              handleChange(e, "emi_date", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="principal_amt"
                            value={data?.principal_amt || ""}
                            onChange={(e) =>
                              handleChange(e, "principal_amt", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="service_chg_ded"
                            value={data?.service_chg_ded || ""}
                            onChange={(e) =>
                              handleChange(e, "service_chg_ded", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="interest_amt"
                            value={data?.interest_amt || ""}
                            onChange={(e) =>
                              handleChange(e, "interest_amt", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="igst_amt"
                            value={data?.igst_amt || ""}
                            onChange={(e) =>
                              handleChange(e, "igst_amt", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="cgst_amt"
                            value={data?.cgst_amt || ""}
                            onChange={(e) =>
                              handleChange(e, "cgst_amt", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="sgst_amt"
                            value={data?.sgst_amt || ""}
                            onChange={(e) =>
                              handleChange(e, "sgst_amt", e.target.value, rowIndex)
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            required
                            type="number"
                            name="total_amt"
                            value={data?.total_amt || ""}
                            onChange={(e) =>
                              handleChange(e, "total_amt", e.target.value, rowIndex)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default LoanMasterDtl;

