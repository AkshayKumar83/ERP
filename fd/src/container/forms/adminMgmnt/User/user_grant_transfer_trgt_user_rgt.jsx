import React from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import { TargetProgramHeaders, TargetProgramsHdr } from './user_grant_transfer_helper'
const UserGrantTransferTarget = ({targetPrgData,targetPrgsData  ,handleChange , formStatus, triggerAddRow, handleDelete,focusedRowIndex,setFocusedRowIndex}) => {
  return (
     <>
      <Row className="">
             <Col sm={12} md={8} lg={12} className="">
                 <Form id="dashboard-user-right" className="">
                   <div className="table-title">
                     <span>Program</span>
                     {(formStatus === "Insert" || formStatus === "Update") && (
                       <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                       >
                         Add Row
                       </ButtonUi>
                     )}
                   </div>
           
                   {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
                   <div className="table-wrapper-v3" style={{ height: "160px", maxHeight: "160px" }}>
                     <SimpleBar forceVisible="y" autoHide={false}>
                       <div className='table-sticky-wrapper'>
                  <Table>
                         <thead>
                           <tr>
                             {(formStatus === "Insert" || formStatus === "Update") && (
                               <th>Actions</th>
                             )}
                             {TargetProgramHeaders.map((header, index) => (
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
                           {targetPrgData.map((data, rowIndex) => (
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
                                     canDelete={targetPrgData.length > 1}
                                    onDelete={() => handleDelete(rowIndex)} // Delete row
                                     // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                                   />
                                 </td>
                               )}
                               <td>
                                 <TextField
                                   type="text"
                                   required
                                   name="program_id"
                                   value={data.program_id || ""}
                                   maxLength={30}
                                   onChange={(e) =>handleChange("program_id", e.target.value, rowIndex, e) }
                                   disabled
                                 />
                               </td>
                               <td>
                                 <TextField
                                   type="text"
                                   required
                                   name="program_desc"
                                   value={data.program_desc || ""}
                                   maxLength={30}
                                   onChange={(e) =>handleChange("program_desc", e.target.value, rowIndex, e) }
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
                 <Form id="dashboard-user-right" className="">
                   <div className="table-title">
                     <span>Programs</span>
                     {(formStatus === "Insert" || formStatus === "Update") && (
                       <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                       >
                         Add Row
                       </ButtonUi>
                     )}
                   </div>
           
                   {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
                   <div className="table-wrapper-v3" style={{ height: "160px", maxHeight: "160px" }}>
                     <SimpleBar forceVisible="y" autoHide={false}>
                       <div className='table-sticky-wrapper'>
                  <Table>
                         <thead>
                           <tr>
                             {(formStatus === "Insert" || formStatus === "Update") && (
                               <th>Actions</th>
                             )}
                             {TargetProgramsHdr.map((header, index) => (
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
                           {targetPrgsData.map((data, rowIndex) => (
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
                                     canDelete={targetPrgsData.length > 1}
                                    onDelete={() => handleDelete(rowIndex)} // Delete row
                                     // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                                   />
                                 </td>
                               )}
                               <td>
                                 <TextField
                                   type="text"
                                   required
                                   name="activity_id"
                                   value={data.activity_id || ""}
                                   maxLength={30}
                                   onChange={(e) =>handleChange("activity_id", e.target.value, rowIndex, e) }
                                   disabled
                                 />
                               </td>
                               <td>
                                 <TextField
                                   type="text"
                                   required
                                   name="activity_disp_name"
                                   value={data.activity_disp_name || ""}
                                   maxLength={30}
                                   onChange={(e) =>handleChange("activity_disp_name", e.target.value, rowIndex, e) }
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

export default UserGrantTransferTarget
