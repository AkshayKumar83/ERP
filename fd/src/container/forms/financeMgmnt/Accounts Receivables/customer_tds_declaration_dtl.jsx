import React, { useRef, useEffect } from "react";  // Fixed: Added useRef, useEffect import
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form } from "reactstrap";
import { headers1, headers2, yearHelpListHeader } from "./customer_tds_declaration_helper";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { FcInfo } from "react-icons/fc";
// import toast from "react-hot-toast";  // Uncomment if needed

const CustomerTdsDeclarationDetails = ({
  formData = [{}],
  handleChange = () => {},
  formStatus = "",
  triggerAddRow,
  disFormData,
  handleDelete,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  setFocusedRowIndex,
  focusedRowIndex,
  paginationPage,
  setPaginationPage,
  selectedCustomer,
  currentCCode,
  focusedRowIndexDec,
  setFocusedRowIndexDec,
}) => {
  const rowsPerPage = 20;
  const prevformDataLength = useRef(formData.length);

    
  useEffect(() => {
    // Check if a new row was added
    if (
      formData.length > prevformDataLength.current &&
      formData.length > 0 &&
      formData[formData.length - 1].c_code === '' 
    ) {
      // New empty row added → go to last page
      const newPage = Math.ceil(formData.length / rowsPerPage);
      setPaginationPage(newPage);
      setFocusedRowIndex(formData.length - 1);
    } 
    // If rows were deleted
    else if (formData.length < prevformDataLength.current) {
      // Stay on current page, adjust focus if needed
      const newTotalPages = Math.ceil(formData.length / rowsPerPage) || 1;
      setPaginationPage((prev) => Math.min(prev, newTotalPages));

      setFocusedRowIndex((prev) => {
        // If focused row deleted, move focus to previous row in page
        return Math.min(prev, formData.length - 1);
      });
    }

    prevformDataLength.current = formData.length;
  }, [formData, setPaginationPage, setFocusedRowIndex]);  // Added deps
  
  const makeFocusOnTableRow = (rowIndex, id) => {
  setFocusedRowIndex(rowIndex);

  const selectedCustomer = formData[rowIndex];
  const ccode = selectedCustomer?.c_code;

  const firstChildGlobalIndex = disFormData.findIndex(
    (r) => r.c_code === ccode && r.isStatus !== "delete"
  );

  setFocusedRowIndexDec(firstChildGlobalIndex === -1 ? 0 : firstChildGlobalIndex);
};

  const totalPages = Math.ceil(formData.length / rowsPerPage);
  const paginatedData = formData.slice(
    (paginationPage - 1) * rowsPerPage,
    paginationPage * rowsPerPage
  );

  const handlePreviousPage = () => {
    if (paginationPage > 1) {
      const newPage = paginationPage - 1;
      setPaginationPage(newPage);
      const firstIndex = (newPage - 1) * rowsPerPage;
      setFocusedRowIndex(firstIndex);
    }
  };

  const handleNextPage = () => {
    if (paginationPage < totalPages) {
      const newPage = paginationPage + 1;
      setPaginationPage(newPage);
      const firstIndex = (newPage - 1) * rowsPerPage;
      setFocusedRowIndex(firstIndex);
    }
  };

const handleDoubleClick = (field, globalIndex) => {
  if (['Insert','Update'].includes(formStatus)) {
    setHelpFor(field);
    setHelpListHeader(yearHelpListHeader);
    handleHelpList(true, globalIndex);
  }
};


  return (
    <>
      <Row>
        <Col md={8} lg="8">
          <Form id="GST-debit-credit-note" className=" ">
            <div className="table-title">
              <span>Customer TDS Declaration</span>
             <div
     style={{ display: "flex", alignItems: "center", gap: "6px",     marginLeft: "20px" }} >
    <ButtonUi
    color="secondary"
    onClick={handlePreviousPage}
    disabled={paginationPage === 1}
    style={{ padding: "2px 6px" }}
  >
    Previous
  </ButtonUi>

  <span style={{ padding: "0", margin: "0", fontSize: "14px" }}>
    Page {paginationPage} of {totalPages || 1}
  </span>

  <ButtonUi
    color="secondary"
    onClick={handleNextPage}
    disabled={paginationPage === totalPages || totalPages === 0}
    style={{ padding: "2px 6px" }}
  >
    Next
  </ButtonUi>
</div>

        </div>
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className='table-sticky-wrapper'>
                  <Table hover>
                    <thead>
                      <tr>
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
                      {paginatedData.map((data, index) => {  // Fixed: Wrapped in {} for block body
                        const globalIndex = (paginationPage - 1) * rowsPerPage + index;  // Now valid inside {}
                        return (
                          <tr
                            key={data.id || globalIndex}  // Fixed: Stable key
                            onFocus={() => makeFocusOnTableRow(globalIndex, data.id)}
                            style={{
                              border: globalIndex === focusedRowIndex ? '2px solid black' : 'none',
                            }}
                            tabIndex={0}
                          >
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="c_code"
                                value={data.c_code || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("c_code", e.target.value, globalIndex, e)}  // Fixed: Added missing arg (name first? Match parent)
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="c_name"
                                value={data.c_name || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("c_name", e.target.value, globalIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="pan_no"
                                value={data.pan_no || ""}
                                maxLength={30}
                                onChange={(e) => handleChange("pan_no", e.target.value, globalIndex, e)}
                                disabled
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col lg="12" className="">
          <Form id="cus-tds" className=" ">  {/* Fixed: id was vendor-tds-detail-form? But ok */}
            <div className="table-title">
              <span>Customer TDS Declaration</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >
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
                             {header.required && (<span className='required-asterisk'>*</span>)}
                             {header.isHelpExist && (<FcInfo title="Info" />)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {/* <tbody>
                    {disFormData
                      .filter((row) => row.c_code === currentCCode && row.isStatus !== "delete")
                      .map((data, filteredIndex) => (
                        <tr
                          key={data.id || filteredIndex}
                          onFocus={() => setFocusedRowIndexDec(filteredIndex)}
                          style={{
                            border:
                              filteredIndex === focusedRowIndexDec
                                ? "2px solid black"
                                : "none",
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <td>
                              <RowAction
                                formStatus={formStatus}
                                canDelete={disFormData.length > 0}
                                onDelete={() => handleDelete(filteredIndex)}
                              />
                            </td>
                        )}

                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="trans_year"
                            value={data.trans_year || ""}
                            onChange={(e) =>
                              handleChange("trans_year", e.target.value, filteredIndex, e)
                            }
                            onDoubleClick={() => handleDoubleClick("year", filteredIndex)}
                          />
                        </td>

                            <td className="table_cell">
                              <Checkbox
                                onChange={(e) => handleChange( "return_filed", e.target.checked ? "Y" : "N", filteredIndex, e ) }
                                checked={data?.return_filed === "Y"}
                              />
                            </td>

                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="acknowledgement_no"
                                value={data.acknowledgement_no || ""}
                                onChange={(e) =>
                                  handleChange("acknowledgement_no", e.target.value, filteredIndex, e)
                                }
                              />
                            </td>

                            <td className="table_cell">
                              <TextField
                                type="date"
                                name="acknowledgement_date"
                                value={data.acknowledgement_date || ""}
                                onChange={(e) =>
                                  handleChange("acknowledgement_date", e.target.value, filteredIndex, e)
                                }
                              />
                            </td>

                            <td className="table_cell">
                              <TextField
                                type="date"
                                name="last_date_return_file"
                                value={data.last_date_return_file || ""}
                                onChange={(e) =>
                                  handleChange("last_date_return_file", e.target.value, filteredIndex, e)
                                }
                                required
                              />
                            </td>

                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="contact_person"
                                value={data.contact_person || ""}
                                onChange={(e) =>
                                  handleChange("contact_person", e.target.value, filteredIndex, e)
                                }
                                required
                              />
                            </td>

                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="contact_person_tel"
                                value={data.contact_person_tel || ""}
                                onChange={(e) =>
                                  handleChange("contact_person_tel", e.target.value, filteredIndex, e)
                                }
                                required
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody> */}
<tbody>
  {disFormData.map((data, globalIndex) => {
    // only current customer and not deleted
    if (data.c_code !== currentCCode || data.isStatus === "delete") return null;

    return (
      <tr
        key={data.id || `${data.c_code}_${data.trans_year}_${globalIndex}`}
        onFocus={() => setFocusedRowIndexDec(globalIndex)}
        style={{
          border:
            globalIndex === focusedRowIndexDec ? "2px solid black" : "none",
        }}
        tabIndex={0}
      >
        {(formStatus === "Insert" || formStatus === "Update") && (
          <td>
            <RowAction
              formStatus={formStatus}
              canDelete={disFormData.length > 0}
              onDelete={() => handleDelete(globalIndex)}   // 👈 yahan globalIndex
            />
          </td>
        )}

        <td className="table_cell">
          <TextField
            type="text"
            required
            name="trans_year"
            value={data.trans_year || ""}
            onChange={(e) =>
              handleChange("trans_year", e.target.value, globalIndex, e) // 👈 yahan bhi globalIndex
            }
            onDoubleClick={() => handleDoubleClick("year", globalIndex)}
          />
        </td>

        <td className="table_cell">
          <Checkbox
            onChange={(e) =>
              handleChange(
                "return_filed",
                e.target.checked ? "Y" : "N",
                globalIndex,
                e
              )
            }
            checked={data?.return_filed === "Y"}
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            name="acknowledgement_no"
            value={data.acknowledgement_no || ""}
            onChange={(e) =>
              handleChange(
                "acknowledgement_no",
                e.target.value,
                globalIndex,
                e
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="date"
            name="acknowledgement_date"
            value={data.acknowledgement_date || ""}
            onChange={(e) =>
              handleChange(
                "acknowledgement_date",
                e.target.value,
                globalIndex,
                e
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="date"
            name="last_date_return_file"
            value={data.last_date_return_file || ""}
            onChange={(e) =>
              handleChange(
                "last_date_return_file",
                e.target.value,
                globalIndex,
                e
              )
            }
            required
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            name="contact_person"
            value={data.contact_person || ""}
            onChange={(e) =>
              handleChange("contact_person", e.target.value, globalIndex, e)
            }
            required
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            name="contact_person_tel"
            value={data.contact_person_tel || ""}
            onChange={(e) =>
              handleChange("contact_person_tel", e.target.value, globalIndex, e)
            }
            required
          />
        </td>
      </tr>
    );
  })}
</tbody>

                  </Table>
                </div>
              </SimpleBar>
            </div>
          </Form>
        </Col>

        <p className="mt-1 note-text d-flex justify-content-center">
          Note :- Only Active Customer are Considered.
        </p>
      </Row>
    </>
  );
};

export default CustomerTdsDeclarationDetails;