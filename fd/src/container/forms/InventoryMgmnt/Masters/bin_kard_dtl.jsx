import { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { getFormattedCurrentDate, headers } from "./bin_kard_helper";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import { formatTwoDecimal } from "../../../../utils/fn";

const BinKardDetails = ({
  handleChange,
  formData = {},
  formStatus,
  detailFormData = [{}],
  triggerAddRow,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailFormData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

  const handleDelete = (data, rowIndex) => {
    const newDetailFormData = detailFormData.filter((_, index) => index !== rowIndex);
    // //console.log("Deleting row:", data);
  };

  const handleUpdate = (data, rowIndex) => {
    // Implement update logic if needed
    // //console.log("Updating row:", data, rowIndex);
  };

  

  return (
    <>
      <Row>
        <Col>
          <Form id="bin-kard" className="mt-4">
            <div className="table-title">
              {/* <span></span> */}
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
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
                        {(formStatus === "Insert" || formStatus === "Update") && (
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
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detailFormData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                          style={{
                            border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <td className="table_cell">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={detailFormData.length > 1}
                                onDelete={() => handleDelete(data, rowIndex)}
                                onUpdate={data.id ? () => handleUpdate(data, rowIndex) : undefined}
                              />
                            </td>
                          )}
                          <td className="table_cell">
                            <TextField
                              type="date"
                              name="doc_date"
                              value={data.doc_date || getFormattedCurrentDate()}
                              onChange={(e) =>
                                handleChange("detailFormData", "doc_date", e.target.value, rowIndex, e)
                              }
                              
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="doc_no"
                              value={data.doc_no || ""}
                              onChange={(e) =>
                                handleChange("detailFormData", "doc_no", e.target.value, rowIndex, e)
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="po_no"
                              value={data.po_no || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange("detailFormData", "po_no", e.target.value, rowIndex, e)
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              name="dept_vend"
                              value={data.dept_vend || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange("detailFormData", "dept_vend", e.target.value, rowIndex, e)
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="recp_qty"
                              value={String(data.recp_qty) || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange("detailFormData", "recp_qty", e.target.value, rowIndex, e)
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="issu_qty"
                              value={String(data.issu_qty) || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange("detailFormData", "issu_qty", e.target.value, rowIndex, e)
                              }
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="balance"
                              value={String(data.balance) || ""}
                              maxLength={30}
                              onChange={(e) =>
                                handleChange("detailFormData", "balance", e.target.value, rowIndex, e)
                              }
                              disabled
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="Bill No"
            name="chln_no"
            value={detailFormData[focusedRowIndex]?.chln_no || ""}
            onChange={(e) =>
              handleChange("detailFormData", "chln_no", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="date"
            label="Bill Date"
            name="chln_date"
            value={detailFormData[focusedRowIndex]?.chln_date || ""}
            onChange={(e) =>
              handleChange("detailFormData", "chln_date", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="STND EFF Rate"
            name="stnd_rate"
            value={detailFormData[focusedRowIndex]?.stnd_rate || ""}
            onChange={(e) =>
              handleChange("detailFormData", "stnd_rate", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={5} md={4} lg={2} className="ms-auto">
          <TextField
            type="number"
            label="Total Receipt"
            name="total_recp"
            // value={String(formData.total_recp) || ""}
            value={formatTwoDecimal(formData?.total_recp)}
            onChange={(e) => handleChange("total_recp", e.target.value, undefined, undefined, e)}
            disabled
          />
        </Col>
        <Col sm={5} md={4} lg={2} className="me-4">
          <TextField
            type="number"
            label="Total Issue"
            name="total_issu"
            // value={String(formData.total_issu )|| ""}
            value={formatTwoDecimal(formData?.total_issu)}
            onChange={(e) => handleChange("total_issu", e.target.value, undefined, undefined, e)}
            disabled
          />
        </Col>
      </Row>

      {/* Rest Detail */}
      {/* <Row className="mt-1">
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="Bill No"
            name="chln_no"
            value={detailFormData[focusedRowIndex]?.chln_no || ""}
            onChange={(e) =>
              handleChange("detailFormData", "chln_no", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="date"
            label="Bill Date"
            name="chln_date"
            value={detailFormData[focusedRowIndex]?.chln_date || ""}
            onChange={(e) =>
              handleChange("detailFormData", "chln_date", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="STND EFF Rate"
            name="stnd_rate"
            value={detailFormData[focusedRowIndex]?.stnd_rate || ""}
            onChange={(e) =>
              handleChange("detailFormData", "stnd_rate", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
      </Row> */}
      <Row className="mt-1">
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="Transaction Type"
            name="type"
            value={detailFormData[focusedRowIndex]?.type || ""}
            onChange={(e) =>
              handleChange("detailFormData", "type", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="P.O. Discount"
            name="po_disc"
            value={detailFormData[focusedRowIndex]?.po_disc || ""}
            onChange={(e) =>
              handleChange("detailFormData", "po_disc", e.target.value, focusedRowIndex, e)
            }
            />
            </Col>
            <Col sm={5} md={4} lg={2}>
              <TextField
                type="text"
                label="P.O Rate"
                name="po_rate"
                value={detailFormData[focusedRowIndex]?.po_rate || ""}
                onChange={(e) =>
                  handleChange("detailFormData", "po_rate", e.target.value, focusedRowIndex, e)
                }
                /> 
            </Col>
                 <Col sm={5} md={4} lg={2}>
              <TextField
                type="number"
                label="Closing Rate"
                name="cl_rate"
                value={formData.cl_rate || ""}
                onChange={(e) => handleChange("formData", "cl_rate", e.target.value, undefined, e)}
              />
            </Col>
              <Col sm={7} md={8} lg={2} className="mt-4">
                  <div
                    style={{
                      backgroundColor: "#d9d9d9",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      width: "100%",
                      padding: "2px 6px",
                      textAlign:'right'
                    }}
                  >
                   Closing Balance as on {getFormattedCurrentDate(formData?.to_date)}
                  </div>          
              </Col>
            <Col sm={5} md={6} lg={2} className="mt-4">
              <TextField
                type="number"
                name="closing_balance"
                value={formData.closing_balance || ""}
                onChange={(e) =>handleChange("formData", "closing_balance", e.target.value, undefined, e)}
              />
            </Col>
          </Row>
          {/* <Row className="mt-1">
            <Col sm={5} md={4} lg={2}>
              <TextField
                type="number"
                label="Closing Rate"
                name="cl_rate"
                value={formData.cl_rate || ""}
                onChange={(e) => handleChange("formData", "cl_rate", e.target.value, undefined, e)}
              />
            </Col>
              <Col sm={7} md={8} lg={3} className="mt-4">
                  <div
                    style={{
                      backgroundColor: "#d9d9d9",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      width: "100%",
                      padding: "2px 6px",
                    }}
                  >
                   Closing Balance as on {getFormattedCurrentDate(formData?.to_date)}
                  </div>          
              </Col>
            <Col sm={5} md={6} lg={2} className="mt-4">
              <TextField
                type="number"
                name="closing_balance"
                value={formData.closing_balance || ""}
                onChange={(e) =>handleChange("formData", "closing_balance", e.target.value, undefined, e)}
              />
            </Col>
          </Row> */}
        </>
      );
    };
    
    export default BinKardDetails;