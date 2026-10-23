

import React from 'react'
import { Col, Row, Table, Form } from "reactstrap";
import { exportToExcel, headers, ItemHelpListHeader, shipToHelpListHeader, VendorHelpListHeader } from './bulk_po_creation_helper';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc';


const BulkPoCreationHdr = ({formData = [{}],
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
   <Row className=''>
    <Col xl={2} >
    <ButtonUi
     onClick={() => exportToExcel(formData)}
       disabled={!hasValidEntry}>
  Export Excel
</ButtonUi>
 </Col>
  <Col className='d-flex justify-content-end'>
  <ButtonUi
                         color="success"
                         className="add-action"
                          onClick={bulkPoButton}
                           disabled={formStatus !== "Insert" || !hasValidEntry}

                       >
                        Bulk Po Creation
                       </ButtonUi>
  </Col>
   </Row>
   
{/* <Row className="align-items-center">


  <Col xl={6}>
    <ButtonUi onClick={() => exportToExcel(formData)}>
      Export Excel
    </ButtonUi>
  </Col>

 
  <Col xl={6} className="d-flex justify-content-end align-items-center gap-2">

    <ButtonUi
      disabled={page === 0}
      onClick={() => setPage(prev => prev - 1)}
    >
      Prev
    </ButtonUi>

    <span>Page {page + 1}</span>

    <ButtonUi
      disabled={(page + 1) * limit >= totalRecordCount}
      onClick={() => setPage(prev => prev + 1)}
    >
      Next
    </ButtonUi>

  </Col>

</Row> */}

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
                  <span>Bulk Po Creation</span>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       {(formStatus === "Insert" || formStatus === "Update") && (
                         <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
                           Add Row
                         </ButtonUi>
                       )}
                   
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
                                     type="date"
                                     name="eff_date"
                                      value={data?.eff_date || ""}
                                     onChange={(e) =>  handleChange(  "eff_date",  e.target.value,  rowIndex,  e  )  }
                                     disabled
                                      //  required
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="date"
                                     name="po_date"
                                      value={data?.po_date || ""}
                                     onChange={(e) =>  handleChange(  "po_date",  e.target.value,  rowIndex,  e  )  }
                                       required
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="v_code"
                                      value={data?.v_code || ""}
                                     onChange={(e) =>  handleChange(  "v_code",  e.target.value,  rowIndex,  e  )  }
                                     onDoubleClick={() =>
                                       handleDoubleClick(
                                         "Vendor",
                                         VendorHelpListHeader,
                                         rowIndex
                                       )
                                       }
                                       required
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
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required
                                     name="it_code"
                                      value={data?.it_code || ""}
                                   
                                     onChange={(e) =>  handleChange(  "it_code",  e.target.value,  rowIndex,  e  )  }
                                    onDoubleClick={() =>
                                       handleDoubleClick(
                                         "item",
                                         ItemHelpListHeader,
                                         rowIndex
                                       )
                                       }
                                        disabled={formStatus === "Search"}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                  //  required
                                   name="it_name"
                                    value={data?.it_name || ""}
                                   onChange={(e) =>handleChange("it_name", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                   <Checkbox
                                     onChange={(e) => handleChange( "advice", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.advice === "Y"}
                                
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required ={data?.advice ==='Y'}
                                     name="ship_to"
                                      value={data?.ship_to || ""}
                                     onChange={(e) =>  handleChange(  "ship_to",  e.target.value,  rowIndex,  e  )  }
                                    onDoubleClick={() =>
                                       handleDoubleClick(
                                         "shipTo",
                                         shipToHelpListHeader,
                                         rowIndex
                                       )
                                       }
                                        disabled={formStatus === "Search"}
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
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                   name="po_no"
                                    value={data?.po_no || ""}
                                  
                                   onChange={(e) =>handleChange("po_no", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                   required
                                   onChange={(e) =>handleChange("qty", e.target.value, rowIndex, e)}
                                   name="qty"
                                    value={data?.qty ?? ""}
                                   maxLength={15}
                                   
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                   required
                                   onChange={(e) =>handleChange("rate", e.target.value, rowIndex, e)}
                                  name="rate"
                                    value={data?.rate ?? ""}
                                    // maxLength={15}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                  //  required
                                   onChange={(e) =>handleChange("receipt_qty", e.target.value, rowIndex, e)}
                                  name="receipt_qty"
                                    value={data?.receipt_qty ?? ""}
                                    maxLength={15}
                                  // disabled
                                 />
                               </td>
   
                                 <td className="table_cell">
                                   <Checkbox
                                     onChange={(e) => handleChange( "po_closer", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.po_closer === "Y"}
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
                                     onClick={() => handleOpenForm(data.po_no)}
                                      disabled={formStatus === "Insert"}
                                    
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

export default BulkPoCreationHdr