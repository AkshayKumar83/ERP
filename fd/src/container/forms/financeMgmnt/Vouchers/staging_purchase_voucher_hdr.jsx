import React from 'react'
import { Col, Row, Table, Form, Card, FormGroup, Input } from "reactstrap";
import { accNoHelpListHeader, billNoHelpListHeader, checkDuplicateFromDB, headers, VendorHelpListHeader } from './staging_purchase_voucher_hlpr';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc';
import MuiTextField from '../../../../components/basic/muiTextField';
import toast from 'react-hot-toast';
import RadioGroup from '../../../../components/basic/radioGroup';


const StagingPurchaseVoucherHdr = ({formData = [{}],
  handleChange,
  formStatus,
  triggerAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
handleHeaderChange,
headerData,
setFormData,
 currentPage,
  totalRecordCount,
  pageSize = 20,
  onPrev,
  onNext,
    handleDeleteClick,
    user,
    statusFilter,
    handleStatusChange
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

const handleBlur = async (rowIndex, event) => {
  const row = formData[rowIndex];

  if (!row.bill_no || !row.bill_dt) return;

  //  IMPORTANT FIX
  if (
    row.bill_no === row.old_bill_no &&
    row.bill_dt === row.old_bill_dt
  ) {
    return; // no change → no API call
  }

  const res = await checkDuplicateFromDB(
    row.bill_no,
    row.bill_dt
  );

  if (res.type === "error") {
    toast.error(res.message);

    setTimeout(() => {
      event.target.focus();
    }, 0);
  }
};


  return (
   <>



<Row className="d-flex justify-content-center">
  <Col lg={5}>
    <div className="d-flex gap-5 justify-content-between align-items-center box-border">

      <label
        style={{
          color: "#000",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <input
          type="radio"
          name="statusFilter"
          value="A"
          checked={statusFilter === "A"}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{ marginRight: "6px" }}
        />
        All
      </label>

      <label
        style={{
          color: "#198754",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <input
          type="radio"
          name="statusFilter"
          value="Y"
          checked={statusFilter === "Y"}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            marginRight: "6px",
            accentColor: "#198754",
          }}
        />
        Approved
      </label>

      <label
        style={{
          color: "#0d6efd",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <input
          type="radio"
          name="statusFilter"
          value="P"
          checked={statusFilter === "P"}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            marginRight: "6px",
            accentColor: "#0d6efd",
          }}
        />
        Pending
      </label>

      <label
        style={{
          color: "#dc3545",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        <input
          type="radio"
          name="statusFilter"
          value="N"
          checked={statusFilter === "N"}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            marginRight: "6px",
            accentColor: "#dc3545",
          }}
        />
        Cancel
      </label>

    </div>
  </Col>
</Row>
 

     <div className=" ">
        
             <Row className="">
               <Col  xl={12}>
                 <Form id="staging-puchr" className="">
                  
                   <div className="table-title">
  <span>Staging Purchase Voucher</span>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    
    {/* Pagination — show only in Query/Update/Search */}
    {["Query",  "Search","Update"].includes(formStatus) && (
    <>
  <ButtonUi
    color="secondary"
    disabled={currentPage <= 1}
    onClick={onPrev}
    style={{ fontSize: "13px", padding: "2px 8px" }}
  >
    ← Prev
  </ButtonUi>

  <span style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
    Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalRecordCount)} of {totalRecordCount} records
   ||  Page {currentPage} / {Math.ceil(totalRecordCount / pageSize) || 1}
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
                                  <span className='required-asterisk'>*</span>)}
                                 {header.isHelpExist && <FcInfo title="Info" />}
                         
                               </th>
                             ))}
                           </tr>
                         </thead>
                         <tbody>
                          {formData &&
                            formData.map((data, rowIndex) => {

                                 const isLocked =  formStatus === "Update" && data.isLocked;

                            const rowStyle =
                              data.cancel === "Y"
                                ? {
                                    backgroundColor: data.flag === "Y" ? "#b02a37" : "#f8d7da", // Dark Red / Light Red
                                    color: data.flag === "Y" ? "#fff" : "#000",
                                    fontWeight: data.flag === "Y" ? "600" : "500",
                                  }
                                : data.approve === "Y"
                                ? {
                                    backgroundColor: data.flag === "Y" ? "#198754" : "#d1e7dd", // Dark Green / Light Green
                                    color: data.flag === "Y" ? "#fff" : "#000",
                                    fontWeight: data.flag === "Y" ? "600" : "500",
                                  }
                                : {
                                    backgroundColor: data.flag === "Y" ? "#0d6efd" : "#A7C7E7", // Dark Blue / Light Gray
                                    color: data.flag === "Y" ? "#fff" : "#000",
                                    fontWeight: data.flag === "Y" ? "600" : "500",
                                  };

                                const getStyle = (fieldName) => {
                                  // Search mode
                                  if (
                                    formStatus === "Search" &&
                                    ["v_code", "bill_no", "bill_dt"].includes(fieldName)
                                  ) {
                                    return {};
                                  }

                                  // Update mode
                                  if (
                                    formStatus === "Update" &&
                                    ["bill_no", "bill_dt","acc_no"].includes(fieldName)
                                  ) {
                                    return {};
                                  }

                                  // return totalRowStyle;
                                  return rowStyle
                                };

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
                                   <td className="sticky-column left"> */}
                                     {/* <RowAction
                                       formStatus={formStatus}
                                       canDelete={formData.length > 1}
                                       onDelete={() => handleDelete(rowIndex)}
                                       // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                     /> */}
                                  {/* <RowAction
                                        formStatus={formStatus}
                                        canDelete={formData.length > 1}
                                        onDelete={() => handleDelete(rowIndex)}
                                        deleteMessage={ "The Whole Purchase Voucher, ITC, Gate Entry etc. will get deleted.\nDo you want to delete?" }
                                        onDeleteClick={handleDeleteClick}
                                    />
                                   </td>
                                 )} */}
                                
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="v_code"
                                     value={data?.v_code || ""}
                                     onChange={(e) =>  handleChange(  "v_code",  e.target.value,  rowIndex,  e  )  }
                                     disabled ={formStatus !== "Search"}
                                     onDoubleClick={() =>
                                      handleDoubleClick(
                                        "Vendor",
                                        VendorHelpListHeader,
                                        rowIndex
                                      )
                                      }
                                       style={getStyle("v_code")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   name="v_name"
                                   value={data?.v_name || ""}
                                   onChange={(e) =>handleChange("v_name", e.target.value, rowIndex, e)}
                                   disabled
                                   style={getStyle("v_name")}
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="acc_no"
                                     value={data?.acc_no || ""}
                                     onChange={(e) =>  handleChange(  "acc_no",  e.target.value,  rowIndex,  e  )  }
                                    //  disabled={data?.cancel === "Y"}
                                    disabled={isLocked}
                                     style={getStyle("acc_no")}
                                     onDoubleClick={() =>
                                      handleDoubleClick(
                                        "AccNo",
                                        accNoHelpListHeader,
                                        rowIndex
                                      )
                                      }
                                      required
                                   />
                                  
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   name="acc_desc"
                                   value={data?.acc_desc || ""}
                                   onChange={(e) =>handleChange("acc_desc", e.target.value, rowIndex, e)}
                                   disabled
                                  style={getStyle("acc_desc")}
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                    //  required
                                     name="party_reference"
                                      value={data?.party_reference || ""}
                                     onChange={(e) =>  handleChange(  "party_reference",  e.target.value,  rowIndex,  e  )  }
                                   disabled
                                   style={getStyle("party_reference")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required
                                     name="vch_no"
                                      value={data?.vch_no || ""}
                                     onChange={(e) =>  handleChange(  "vch_no",  e.target.value,  rowIndex,  e  )  }
                                   disabled
                                    style={getStyle("vch_no")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required
                                     name="vch_dt"
                                      value={data?.vch_dt || ""}
                                     onChange={(e) =>  handleChange(  "vch_dt",  e.target.value,  rowIndex,  e  )  }
                                   disabled
                                    style={getStyle("vch_dt")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required
                                     name="voucher_no"
                                      value={data?.voucher_no || ""}
                                     onChange={(e) =>  handleChange(  "voucher_no",  e.target.value,  rowIndex,  e  )  }
                                   disabled
                                    style={getStyle("voucher_no")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     required
                                     name="voucher_dt"
                                      value={data?.voucher_dt || ""}
                                     onChange={(e) =>  handleChange(  "voucher_dt",  e.target.value,  rowIndex,  e  )  }
                                   disabled
                                    style={getStyle("voucher_dt")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                   maxLength={30}
                                   name="bill_no"
                                    value={data?.bill_no || ""}
                                   onChange={(e) =>handleChange("bill_no", e.target.value, rowIndex, e)}
                                  disabled={isLocked}
                                  //  disabled={data?.cancel === "Y"}
                                    onDoubleClick={() =>
                                      handleDoubleClick(
                                        "billNo",
                                        billNoHelpListHeader,
                                        rowIndex
                                      )
                                      }
                                      style={getStyle("bill_no")}
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="date"
                                   required
                                     name="bill_dt"
                                      value={data?.bill_dt || ""}
                                     onChange={(e) =>  handleChange(  "bill_dt",  e.target.value,  rowIndex,  e  )  }
                                  //  onBlur={(e) =>handleBlur(rowIndex,e)}
                                  // disabled={data?.cancel === "Y"}
                                  disabled={isLocked}
                                   style={getStyle("bill_dt")}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                   disabled
                                   name="amount"
                                    value={data?.amount || ""}
                                   onChange={(e) =>handleChange("amount", e.target.value, rowIndex, e)}
                                 style={getStyle("amount")}
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                   onChange={(e) =>handleChange("db_cr", e.target.value, rowIndex, e)}
                                  name="db_cr"
                                    value={data?.db_cr || ""}
                                   maxLength={20}
                                   style={getStyle("db_cr")}
                                  disabled

                                   
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                  onChange={(e) =>handleChange("remarks", e.target.value, rowIndex, e)}
                                  name="remarks"
                                    value={data?.remarks || ""}
                                   maxLength={20}
                                    style={getStyle("remarks")}
                                   disabled 
                                 />
                               </td>
                                <td className="table_cell" style={getStyle("cancel")}>
                                    <Checkbox
                                     onChange={(e) => handleChange( "cancel", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.cancel === "Y"}
                                    //  disabled={data?.approve === "Y"} 
                                    disabled={isLocked}
                                      //  style={getStyle("cancel")}
                                   />
                                 </td>
                                <td className="table_cell" style={getStyle("approve")} >
                                    <Checkbox
                                     onChange={(e) => handleChange( "approve", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.approve === "Y"}
                                    //  disabled={data?.cancel === "Y"} 
                                    disabled={isLocked}
                                    // style={getStyle("approve")}
                                   />
                                 </td>
   
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                  onChange={(e) =>handleChange("prepared_by", e.target.value, rowIndex, e)}
                                  name="prepared_by"
                                    value={data?.prepared_by || ""}
                                   maxLength={20}
                                    style={getStyle("prepared_by")}
                                   disabled 
                                 />
                               </td>
   
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                  onChange={(e) =>handleChange("checked_by", e.target.value, rowIndex, e)}
                                  name="checked_by"
                                    value={data?.checked_by || ""}
                                   maxLength={20}
                                    style={getStyle("checked_by")}
                                   disabled 
                                 />
                               </td>
   
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                  onChange={(e) =>handleChange("authorized_by", e.target.value, rowIndex, e)}
                                  name="authorized_by"
                                    value={data?.authorized_by || ""}
                                   maxLength={20}
                                    style={getStyle("authorized_by")}
                                   disabled 
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
          
         </div></>
  )
}

export default StagingPurchaseVoucherHdr