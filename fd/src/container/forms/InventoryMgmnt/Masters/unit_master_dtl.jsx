
import React from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import { headers } from "./unit_master_helper";
import ButtonUi from "../../../../components/basic/button";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";

const UnitMasterDetails = ({
  formData = [{}],
  handleChange,
  formStatus,
  triggerAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex
}) => {

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center ">
        <Card className="w-50 p-2">
          <Row className="mb-2">
            <Col  xl={12}>
              <Form id="unit-master" className="">
                <div className="table-title">
                  <span>Unit Master</span>
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
                  // style={{ height: "180px", maxHeight: "180px" }}
                >
                  <SimpleBar forceVisible="y" autoHide={false}>
                     <div className="table-sticky-wrapper height-auto">
                    <Table hover>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <th
                              style={{ width: "80px" }}
                              className="sticky-column left"
                            >
                              Actions
                            </th>
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
                        <span className='required-asterisk'>*</span>
                      )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData &&
                          formData.map((data, rowIndex) => (
                            <tr
                              key={rowIndex}
                              onFocus={() =>
                                makeFocusOnTableRow(rowIndex, data.id)
                              }
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
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={formData.length > 1}
                                    onDelete={() => handleDelete(rowIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              <td className="table_cell">
                                <TextField
                                  type="text"
                                  required
                                  name="unit"
                                   value={data?.unit || ""}
                                  maxLength={4}
                                  onChange={(e) =>  handleChange(  "unit",  e.target.value,  rowIndex,  e  )  }
                                
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                name="description"
                                 value={data?.description || ""}
                                maxLength={20}
                                onChange={(e) =>handleChange("description", e.target.value, rowIndex, e)}
                               
                              />
                            </td>

                              <td className="table_cell">
                                <Checkbox
                                  onChange={(e) => handleChange( "fraction", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                  checked={data?.fraction === "Y"}
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
        </Card>
      </div>
    </>
  );
};

export default UnitMasterDetails;

