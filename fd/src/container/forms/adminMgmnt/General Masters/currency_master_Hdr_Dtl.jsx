

import React, { useState } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Form, Table, Container } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { handleValidateField, headers1, headers2 } from "./Currency_master_helper";

const CurrencyMasterHdrDtl = ({
  formData = [{}],
  handleChange = () => {},
  formStatus = "",
  historyFormData = [{}],
  triggerAddRow,
  focusedHeaderRowIndex,
  setFocusedHeaderRowIndex,
  focusedHistoryRowIndex,
  setFocusedHistoryRowIndex,
  handleDelete = () => {},
  historyPage,
  setHistoryPage

  
}) => {


  //  const [historyPage, setHistoryPage] = useState(1);
  const rowsPerPage = 5;

  const handleHeaderRowFocus = (rowIndex) => {
    setFocusedHeaderRowIndex(rowIndex);
    setHistoryPage(1); // reset pagination on row focus change
  };

  const handleHistoryRowFocus = (rowIndex) => {
    setFocusedHistoryRowIndex(rowIndex);
  };

  const historyData = formData[focusedHeaderRowIndex]?.historyData || [];
  const totalPages = Math.ceil(historyData.length / rowsPerPage);
  const paginatedHistory = historyData.slice(
    (historyPage - 1) * rowsPerPage,
    historyPage * rowsPerPage
  );

  return (
    <>
    <Container>
      <Row className="">
        <Col lg="12" className="">
          <Form id="curr-mstr" className="">
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
                <div className="table-sticky-wrapper">
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
                             {header.required && (
                        <span className='required-asterisk'>*</span>
                      )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                   <tbody>
  {formData.map((data, rowIndex) => (
    <tr
      key={rowIndex}
      onFocus={() => handleHeaderRowFocus(rowIndex)}
      style={{
        border: rowIndex === focusedHeaderRowIndex ? "2px solid black" : "none",
      }}
      tabIndex={0}
    >
      {(formStatus === "Insert" || formStatus === "Update") && (
        <td>
          <RowAction
            formStatus={formStatus}
             canDelete={formData.length > 1}
            onDelete={() => handleDelete(data, rowIndex)}
          />
        </td>
      )}
      <td className="table_cell">
        <TextField
          type="text"
          name="curr_desc"
          id={`curr_desc-${rowIndex}`}
          value={data?.curr_desc || ""}
          maxLength={40}
          onChange={(e) =>
            handleChange("curr_desc", e.target.value, rowIndex, e, "formData")
          }
          onBlur={(e) =>
            handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData           )
          }
          required
        />
      </td>
      <td className="table_cell">
        <TextField
          type="text"
          name="curr_sdesc"
          id={`curr_sdesc-${rowIndex}`}
          value={data?.curr_sdesc || ""}
          maxLength={10}
          onChange={(e) =>
            handleChange("curr_sdesc", e.target.value, rowIndex, e, "formData")
          }
          onBlur={(e) =>
            handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData           )
          }
          required
        />
      </td>
      <td className="table_cell">
        <TextField
          type="text"
          name="curr_code"
          id={`curr_code-${rowIndex}`}
          value={data?.curr_code || ""}
          maxLength={3}
          onChange={(e) =>
            handleChange("curr_code", e.target.value, rowIndex, e, "formData")
          }
          onBlur={(e) =>
            handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData           )
          }
          required
        />
      </td>
      <td className="table_cell">
        <TextField
        required
          type="text"
          name="curr_frac"
          id={`curr_frac-${rowIndex}`}
          value={data?.curr_frac || ""}
          maxLength={20}
          onChange={(e) => handleChange("curr_frac", e.target.value, rowIndex, e, "formData")}
          //  onBlur={(e) => handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData )}
        />
      </td>
      <td className="table_cell">
        <TextField
          // style={{ textAlign: "right" }}
          type="number"
          name="ex_rate"
          id={`ex_rate-${rowIndex}`}
          value={data?.ex_rate ?? ''}
          onChange={(e) =>
            handleChange("ex_rate", e.target.value, rowIndex, e, "formData")
          }
          onBlur={(e) =>
            handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData           )
          }
          required
        />
      </td>
      <td className="table_cell">
        <TextField
          style={{ textAlign: "right" }}
          type="text"
          maxLength={1}
          name="curr_customs"
          id={`curr_customs-${rowIndex}`}
          value={data?.curr_customs || ""}
          onChange={(e) =>
            handleChange("curr_customs", e.target.value, rowIndex, e, "formData")
          }
        />
      </td>
      <td className="table_cell">
        <TextField
          type="date"
          name="eff_date"
          id={`eff_date-${rowIndex}`}
          value={data?.eff_date || ""}
          onChange={(e) => handleChange("eff_date", e.target.value, rowIndex, e, "formData")}
          onBlur={(e) => handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData)}
          required
        />
      </td>
      <td className="table_cell">
        <TextField
          type="date"
          name="end_date"
          id={`end_date-${rowIndex}`}
          value={data?.end_date || ""}
          onChange={(e) => handleChange("end_date", e.target.value, rowIndex, e, "formData")}
          onBlur={(e) => handleValidateField(e, formStatus, formData[rowIndex],  rowIndex,historyFormData           ) }
          // required
        />
      </td>
      <td className="table_cell">
        <Checkbox
          onChange={(e) =>handleChange("def_flag", e.target.checked ? "Y" : "N", rowIndex, e, "formData") }
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

     <Row>
        <Col lg="8">
          <Form  className=''>
            <div className="table-title">
              <span>History</span>
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table hover>
                    <thead>
                      <tr>
                        {/* {(formStatus === "Insert" || formStatus === "Update") && <th>Actions</th>} */}
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
                      {paginatedHistory.length > 0 ? (
                        paginatedHistory.map((data, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onFocus={() => handleHistoryRowFocus(rowIndex)}
                            style={{
                              border: rowIndex === focusedHistoryRowIndex ? "2px solid black" : "none",
                            }}
                            tabIndex={0}
                          >
                            {/* {(formStatus === "Insert" || formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={formData.length > 1}
                                  onDelete={() => handleDelete(data, rowIndex)}
                                />
                              </td>
                            )} */}
                            <td className="table_cell">
                              <TextField type="text" maxLength={3} name="curr_code" value={data?.curr_code || ""} disabled />
                            </td>
                            <td className="table_cell">
                              <TextField type="date" name="eff_date" value={data?.eff_date || ""} disabled />
                            </td>
                            <td className="table_cell">
                              <TextField
                                style={{ textAlign: "right" }}
                                type="text"
                                name="rate"
                                value={data?.rate || ""}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="curr_frac"
                                maxLength={20}
                                value={data?.curr_frac || ""}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField type="date" name="end_date" value={data?.end_date || ""} disabled />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          {/* <td colSpan={headers2.length + 1} className="text-center text-muted">
                            No history data found
                          </td> */}
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
             {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-2 px-2">
              <span className="me-3">Page {historyPage} of {totalPages}</span>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={historyPage === totalPages}
                  onClick={() => setHistoryPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
  </div>
          </Form>
        </Col>
        
      </Row>
    </Container>
    </>
  );
};

export default CurrencyMasterHdrDtl;


