import React from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import {  userSourceHeaders, userTargetHeaders } from './user_grant_transfer_helper'
import Checkbox from '../../../../components/basic/checkbox'

const UserGrantTransferUser = ({userSourceData, userTargetData  ,handleChange , formStatus, triggerAddRow, handleDelete,focusedRowIndex,setFocusedRowIndex }) => {

  return (
  <>
   <Row className="d-flex justify-content-center">
     
{/* radio button value map is control data block */}
   <Col sm={12} md={12} lg={3} className="mt-sm-3 mt-md-3 mt-lg-0">
          <div className="text-wrapper">
            <span className="text-label">User Rights</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Copy", value: "C" },
                { text: "Transfer", value: "T" },
              ]}
              onChange={(e) => handleChange("trans_type", e.target.value)}
              //  checked={control?.RG_COPY_TRANSFER || "C"}
            />
          </div>
        </Col>
    </Row>

        
        <Row className="">
          <Col sm={12} md={8} lg={12} className="">
              <Form id="" className="">
                <div className="table-title">
                  <span>Source User</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div>
        
                {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
                <div className="table-wrapper-v3">
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <div className='table-sticky-wrapper'>
               <Table>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <th>Actions</th>
                          )}
                          {userSourceHeaders.map((header, index) => (
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
                        {userSourceData.map((data, rowIndex) => (
                          <tr 
                          key={rowIndex} 
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                          style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                          }} 
                          tabIndex={0}>
                            {(formStatus === "Insert" || formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={userSourceData.length > 1}
                                 onDelete={() => handleDelete(rowIndex)} // Delete row
                                  // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                                />
                              </td>
                            )}
                            <td>
                              <TextField
                                type="text"
                                required
                                name="user_id"
                                value={data.user_id || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("user_id", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="login_name"
                                value={data.login_name || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("login_name", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="user_name"
                                value={data.user_name || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("user_name", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="dept_short_desc"
                                value={data.dept_short_desc || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("dept_short_desc", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                              <td>
                        <Checkbox 
                        onChange={(e) =>  handleChange("active", e.target.checked ? "Y" : "N", rowIndex,e)}
                        checked={data?.active === "Y"}
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

   <Row className="">
          <Col sm={12} md={8} lg={12} className="">
              <Form id="" className="">
                <div className="table-title">
                  <span>Target User</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div>
        
                {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
                <div className="table-wrapper-v3">
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <div className='table-sticky-wrapper'>
               <Table>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <th>Actions</th>
                          )}
                          {userTargetHeaders.map((header, index) => (
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
                        {userTargetData.map((data, rowIndex) => (
                          <tr 
                          key={rowIndex} 
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                          style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                          }} 
                          tabIndex={0}>
                            {(formStatus === "Insert" || formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={userTargetData.length > 1}
                                 onDelete={() => handleDelete(rowIndex)} // Delete row
                                  // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                                />
                              </td>
                            )}
                            <td>
                              <TextField
                                type="text"
                                required
                                name="user_id"
                                value={data.user_id || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("user_id", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="login_name"
                                value={data.login_name || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("login_name", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="user_name"
                                value={data.user_name || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("user_name", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="dept_short_desc"
                                value={data.dept_short_desc || ""}
                                maxLength={30}
                                onChange={(e) =>handleChange("dept_short_desc", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                              <td>
                        <Checkbox 
                        onChange={(e) =>  handleChange("active", e.target.checked ? "Y" : "N", rowIndex,e)}
                        checked={data?.active === "Y"}
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
  </>
  )
}

export default UserGrantTransferUser
