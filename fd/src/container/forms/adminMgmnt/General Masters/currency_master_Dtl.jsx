import React, { useState } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Form, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { headers1, headers2 } from "./Currency_master_helper";

const CurrencyMasterDtl = ({
  formData = [{}],
  handleChange = () => {},
  formStatus = "",
  historyFormData = [{}],
  triggerAddRow,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const makeFocusOnTableRow = (rowIndex, id) => {
    setFocusedRowIndex(rowIndex);
  };

  const handleDelete = (data, rowIndex) => {
    // You can implement row deletion logic here
 
  };

  const handleUpdate = (data) => {
    // You can implement update logic here
  
  };

  const HistoryRow = ({ data, index }) => {
    return (
      <tr key={index}>
        <td className="table_cell">
          <TextField type="text" name="curr_code" value={data.curr_code || ""} disabled />
        </td>
        <td className="table_cell">
          <TextField  type="text" name="eff_date" value={data.eff_date || ""} disabled />
        </td>
        <td className="table_cell">
          <TextField style={{ textAlign: "right" }} type="text" name="rate" value={data.rate || ""} disabled />
        </td>
        <td className="table_cell">
          <TextField type="text" name="curr_frac" value={data.curr_frac || ""} disabled />
        </td>
        <td className="table_cell">
          <TextField type="text" name="end_date" value={data.end_date || ""} disabled />
        </td>
      </tr>
    );
  };

  return (
    <>
      <Row>
        <Col lg="12">
          <Form id="Currency-master" className="ms-4 me-4">
            <div className="table-title">
              <span>Currency Master</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
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
                        <th className="sticky-column left">Actions</th>
                      )}
                      {headers1.map((header, index) => (
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
                    {formData.map((data, rowIndex) => (
                      <tr
                        key={rowIndex}
                        onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                        style={{
                          border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                        }}
                        tabIndex={0}
                      >
                        {(formStatus === "Insert" || formStatus === "Update") && (
                          <td>
                            <RowAction
                              formStatus={formStatus}
                              canDelete={formData.length > 1}
                              onDelete={() => handleDelete(data, rowIndex)}
                              onUpdate={() => handleUpdate(data)}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="curr_desc"
                            value={data.curr_desc || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("curr_desc", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="curr_sdesc"
                            value={data.curr_sdesc || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("curr_sdesc", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="curr_code"
                            value={data.curr_code || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("curr_code", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="curr_frac"
                            value={data.curr_frac || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("curr_frac", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            type="text"
                            required
                            name="ex_rate"
                            value={data.ex_rate || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("ex_rate", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            style={{ textAlign: "right" }}
                            type="text"
                            required
                            name="curr_customs"
                            value={data.curr_customs || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("curr_customs", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="date"
                            required
                            name="eff_date"
                            value={data.eff_date || ""}
                            onChange={(e) =>
                              handleChange("eff_date", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="date"
                            required
                            name="end_date"
                            value={data.end_date || ""}
                            onChange={(e) =>
                              handleChange("end_date", e.target.value, rowIndex, e, "formData")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "def_flag",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                "formData"
                              )
                            }
                            checked={data?.def_flag === "Y"}
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

      {/* History Table */}
      <Row className="ms-4 me-4 mt-2">
        <div className="text-wrapper history_height box-border mt-2 d-flex justify-content-center">
          <div className="history-container w-100" style={{ maxWidth: "1000px", width: "90%" }}>
            <div className="d-flex justify-content-center align-items-center mb-3">
              <span className="text-label">History</span>
            </div>
            <Form id="dashboard-user-right" className="ms-4 me-4 mt-4">
          <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
                  <Table hover>
                    <thead>
                      <tr>
                        {headers2.map((header, index) => (
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
                    {Array.isArray(historyFormData) && historyFormData.map((data, index) => (
            <HistoryRow key={index} data={data} />
          ))}
                    </tbody>
                  </Table>
                  </div>
                </SimpleBar>
              </div>
            </Form>
          </div>
        </div>
      </Row>
    </>
  );
};

export default CurrencyMasterDtl;
