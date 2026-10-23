
import React from 'react'
import { Col, Row, Table, Form } from "reactstrap";
import { headers, PoNoHelpListHeader, shipToHelpListHeader, VendorHelpListHeader } from './po_closure_hlpr';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc';


const PoClosureHdr = ({formData = [{}],
  handleChange,
  formStatus,
  triggerAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  bulkPoButton,
  handleOpenForm,
  setPage,
  page,
  limit,
  totalRecordCount,
  isBulkPoCreated,
  hasValidEntry,
   currentPage,
  pageSize = 20,
  onPrev,
  onNext,
}) => {

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };


   const handleDoubleClick = (field, header, rowIndex) => {
    if (["Insert", "Search", "Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true, rowIndex);
    }
  };

  return (
   <>


     <div className=" ">
             <Row className="">
               <Col  xl={12}>
                 <Form id="rate-master" className="">
                   {/* <div className="table-title">
                     <span>Bulk Po Creation</span>
                     {(formStatus === "Insert" || formStatus === "Update") && (
                       <ButtonUi
                         color="primary"
                         className="add-action"
                         onClick={triggerAddRow}
                       >
                         Add Row
                       </ButtonUi>
                     )}
                   </div> */}

               <div className="table-title">
                  {/* <span>Bulk Po Creation</span> */}
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       {/* {(formStatus === "Insert" || formStatus === "Update") && (
                         <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
                           Add Row
                         </ButtonUi>
                       )} */}
                   
                       {/* Pagination — show only in Query/Update/Search */}
                       {["Query"].includes(formStatus) && (
                         <>
                           <ButtonUi
                             color="secondary"
                             disabled={currentPage <= 1}
                             onClick={onPrev}
                               style={{ fontSize: "13px", padding: "2px 8px" }}
                           >
                             ← Prev
                           </ButtonUi>
                   
                           <span style={{ fontSize: "14px", whiteSpace: "nowrap" }}>
                             Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalRecordCount)} of {totalRecordCount} records
                            
                            || Page {currentPage} / {Math.ceil(totalRecordCount / pageSize) || 1}
                           </span>
                   
                           <ButtonUi
                             color="secondary"
                             disabled={currentPage >= Math.ceil(totalRecordCount / pageSize)}
                             onClick={onNext}
                             style={{ fontSize: "13px", padding: "2px 8px" }}

                           >
                             Next →
                           </ButtonUi>
                         </>
                       )}
                     </div>
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
                             {/* {(formStatus === "Insert" ||
                               formStatus === "Update") && (
                               <th
                                 style={{ width: "80px" }}
                                 className="sticky-column left"
                               >
                                 Actions
                               </th>
                             )} */}
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
                                 {/* {header.required && (
                                  <span className='required-asterisk'>*</span>)} */}
                                  {(
                                  header.required ||
                                  (
                                    header.label === "Ship To" &&
                                    formData?.[focusedRowIndex]?.advice === "Y"
                                  )
                                ) && (
                                  <span className="required-asterisk">*</span>
                                )}
                                 {header.isHelpExist && <FcInfo title="Info" />}
                         
                               </th>
                             ))}
                           </tr>
                         </thead>
                         <tbody>
                           {formData &&
                             formData.map((data, rowIndex) => {
                               const rowStyle =
                                data.original_closure_flag === "Y"
                                  ? {
                                      backgroundColor: "#198754",
                                      color: "#000",
                                      fontWeight: 600,
                                    }
                                  : {};
                              return (
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
                                 {/* {(formStatus === "Insert" ||
                                   formStatus === "Update") && (
                                   <td className="sticky-column left">
                                     <RowAction
                                       formStatus={formStatus}
                                       canDelete={formData.length > 1}
                                       onDelete={() => handleDelete(rowIndex)}
                                       // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                     />
                                   </td>
                                 )} */}
                               
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="v_code"
                                     value={data?.v_code || ""}
                                     onChange={(e) =>  handleChange(  "v_code",  e.target.value,  rowIndex,  e  )  }
                                     onDoubleClick={() =>
                                     handleDoubleClick( "Vendor", VendorHelpListHeader, rowIndex)}
                                     disabled={formStatus !== "Search"}
                                       style={rowStyle}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                  //  required
                                   name="v_name"
                                    value={data?.v_name || ""}
                                   onChange={(e) =>handleChange("v_name", e.target.value, rowIndex, e)}
                                  disabled
                                   style={rowStyle}
                                 />
                               </td>
                                
                                
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="c_code"
                                      value={data?.c_code || ""}
                                     onChange={(e) =>  handleChange(  "c_code",  e.target.value,  rowIndex,  e  )  }
                                     onDoubleClick={() => handleDoubleClick( "shipTo", shipToHelpListHeader, rowIndex ) }
                                        disabled={formStatus !== "Search"}
                                         style={rowStyle}
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required
                                     name="c_name"
                                      value={data?.c_name || ""}
                                     onChange={(e) =>  handleChange(  "c_name",  e.target.value,  rowIndex,  e  )  }
                                   disabled
                                    style={rowStyle}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                   name="po_no"
                                   value={data?.po_no || ""}
                                   onChange={(e) =>handleChange("po_no", e.target.value, rowIndex, e)}                                 
                                    onDoubleClick={() => handleDoubleClick( "PoNo", PoNoHelpListHeader, rowIndex ) }
                                        disabled={formStatus !== "Search"}
                                         style={rowStyle}
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                   required
                                   onChange={(e) =>handleChange("po_value", e.target.value, rowIndex, e)}
                                   name="po_value"
                                    value={data?.po_value ?? ""}
                                   disabled
                                    style={rowStyle}
                                   
                                 />
                               </td>
                                 <td className="table_cell"  style={rowStyle}>
                                   <Checkbox
                                     onChange={(e) => handleChange( "closure_flag", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.closure_flag === "Y"}
                                    // required
                                  disabled={data?.original_closure_flag=== "Y"}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   onChange={(e) =>handleChange("closure_by", e.target.value, rowIndex, e)}
                                  name="closure_by"
                                    value={data?.closure_by || ""}
                                     style={rowStyle}
                                   
                                disabled
                                 />
                               </td>
                                <td className="table_cell">
                                   <TextField
                                     type="date"
                                     name="closure_date"
                                      value={data?.closure_date || ""}
                                     onChange={(e) =>  handleChange(  "closure_date",  e.target.value,  rowIndex,  e  )  }
                                     disabled
                                     style={rowStyle}
                                   />
                                 </td>
                                 
                                
                                 
                               </tr>
                             )})}
                         </tbody>
                       </Table>
                       </div>
                     </SimpleBar>
                   </div>
                 </Form>
               </Col>
             </Row>
          
         </div>
         
{/* <Row className='mt-3'>
  <Col className='d-flex justify-content-center'>
  <ButtonUi
                         color="primary"
                         className="add-action"
                          onClick={bulkPoButton}
                          disabled={formStatus !=='Insert'}
                       >
                        Bulk Po Creation
                       </ButtonUi>
  </Col>
</Row> */}


         
         </>
         
  )
}

export default PoClosureHdr

