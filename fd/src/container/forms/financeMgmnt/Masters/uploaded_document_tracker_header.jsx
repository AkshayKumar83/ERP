import React from 'react'
import MuiSelectField from '../../../../components/basic/muiSelectField'
import { Col, Form, Row, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import RowAction from "../../../../components/common/rowAction";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import RadioButton from "../../../../components/basic/radioButton";
import { FcInfo } from "react-icons/fc";
import {  upldDocTrackerHeader } from './uploaded_document_tracker_helpler';


const UploadedDocTrackerHdr = ({ 
  formData = [{}],
  setFormData,
  formStatus,
  handleChange,
  focusedRowIndex,
  setFocusedRowIndex,
  triggerAddRow,
  handleDelete=()=>{},
  uploadfile =[],
  handleOpenForm,

  }) => {
  
  
   const makeFocusOnTableRow = (rowIndex) => {
     setFocusedRowIndex(rowIndex);
    };

  
    return (
  <>
  <Row>
       <Col xl={6} className="mt-2">
                    <MuiSelectField
                      label="Uploaded File Name"
                      name="upldd_filename"
                      value={formData.upldd_filename}
                      onChange={(e) =>handleChange("upldd_filename", e.target.value, null, e)}
                      options={uploadfile}
                      required
                    />
    
                  </Col>
  </Row>

     <Row>
          <Col>
            <Form id="uploaded-doc-tracker">
              <div className="table-title">
                <span>Uploaded Document Tracker</span>
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
                {/* <SimpleBar forceVisible="y" autoHide={false} onScrollCapture={(e)=> handleScroll(e)}> */}
                <SimpleBar forceVisible="y" autoHide={false}>
                  <div className="table-sticky-wrapper height-auto">
                    <Table hover>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <th className="sticky-column left">Actions</th>
                          )}
                          {upldDocTrackerHeader.map((header, index) => (
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
                               <span className='required-asterisk'>*</span>)}
                              {header.isHelpExist && <FcInfo title="Info" />}
                            </th>
                          ))}
                           {/* <th style={{ width: "6%" }}>Go To</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.details.map((data, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onFocus={() =>
                              makeFocusOnTableRow(rowIndex, data.sr_no)
                            }
                            style={{
                              border:
                                rowIndex === focusedRowIndex
                                  ? "2px solid black"
                                  : "none",
                            }}
                            tabIndex={0}
                          >
                            {(formStatus === "Insert" ||
                              formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                 canDelete={formData.details.length > 1}
                                  onDelete={() => handleDelete(rowIndex)}
                                />
                              </td>
                            )}
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="doc_type"
                                value={data?.doc_type || ""}
                                maxLength={20}
                                onChange={(e) =>
                                  handleChange(
                                    "doc_type",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                            
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="wc_id"
                                value={data?.wc_id || ""}
                                maxLength={20}
                                onChange={(e) =>
                                  handleChange(
                                    "wc_id",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                            
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="wc_name"
                                value={data?.wc_name || ""}
                                maxLength={20}
                                onChange={(e) =>
                                  handleChange(
                                    "wc_name",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                              
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="doc_id"
                                value={data?.doc_id || ""}
                                maxLength={20}
                                onChange={(e) =>
                                  handleChange(
                                    "doc_id",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                              
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="doc_no"
                                value={data?.doc_no || ""}
                                maxLength={20}
                                onChange={(e) =>
                                  handleChange(
                                    "doc_no",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                              
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="date"
                                name="doc_date"
                                value={data?.doc_date || ""}
                                maxLength={19}
                                onChange={(e) =>
                                  handleChange(
                                    "doc_date",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                              
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="party_cd"
                                maxLength={20}
                                value={data?.party_cd || ""}
                                onChange={(e) =>
                                  handleChange(
                                    "party_cd",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                              
                              />
                            </td>
                           
                            <td className="table_cell">
                              <TextField
                                type="text"
                                name="party_name"
                                value={data?.party_name || ""}
                                onChange={(e) =>
                                  handleChange(
                                    "party_name",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                               
                              />
                            </td>
                            <td>
<ButtonUi
  style={{
    padding: "2px 8px",
    fontSize: "11px",
    borderRadius: "20px",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    border: "none"
  }}
    onClick={ () =>handleOpenForm(data.doc_type, data.doc_id, data.doc_no) }
>
  View
</ButtonUi>
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


  
  </>
  )
}

export default UploadedDocTrackerHdr