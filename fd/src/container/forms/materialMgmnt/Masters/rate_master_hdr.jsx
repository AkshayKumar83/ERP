import React from 'react'
import { Col, Row, Table, Form, Card } from "reactstrap";
import { checkDuplicateFromDB, headers, ItemHelpListHeader, VendorHelpListHeader } from './rate_master_helper';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc';
import MuiTextField from '../../../../components/basic/muiTextField';
import toast from 'react-hot-toast';


const RateMasterHdr = ({formData = [{}],
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

  if (!row.it_code || !row.rate_eff_dt) return;

  //  IMPORTANT FIX
  if (
    row.it_code === row.old_it_code &&
    row.rate_eff_dt === row.old_rate_eff_dt
  ) {
    return; // no change → no API call
  }

  const res = await checkDuplicateFromDB(
    row.it_code,
    row.rate_eff_dt
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

   {/* <Row className='mt-2'>
   <Col xl={2}>
          <MuiTextField
            type="text"
            label="Vendor Code"
            name="v_code"
            // maxLength={20}
            value={headerData?.v_code}
            onChange={(e) =>handleHeaderChange( "v_code", e.target.value)}
            showHelpIcon
           onDoubleClick={() => handleDoubleClick("Vendor", VendorHelpListHeader, -1)}
            required
            disabled={formStatus === "Update"}
          />
        </Col>
   <Col xl={4}>
          <MuiTextField
            type="text"
            label="Name"
            name="v_name"
            value={headerData?.v_name}
            onChange={(e) =>handleHeaderChange( "v_name", e.target.value,)}
            disabled
            // onBlur = {(e) => handleValidateField(e, formStatus, headerData,setHeaderData)}
            // required
          />
        </Col>
   </Row> */}

     <div className=" ">
        
             <Row className="">
               <Col  xl={12}>
                 <Form id="rate-master" className="">
                   {/* <div className="table-title">
                     <span>Rate Master</span>
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
  <span>Rate Master</span>
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    {(formStatus === "Insert" || formStatus === "Update") && (
      <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
        Add Row
      </ButtonUi>
    )}

    {/* Pagination — show only in Query/Update/Search */}
    {["Query",  "Search"].includes(formStatus) && (
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
                                  <span className='required-asterisk'>*</span>)}
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
                                       disabled={formStatus === "Search"}
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
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                   name="it_name"
                                    value={data?.it_name || ""}
                                  
                                   onChange={(e) =>handleChange("it_name", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="date"
                                   required
                                     name="rate_eff_dt"
                                      value={data?.rate_eff_dt || ""}
                                     onChange={(e) =>  handleChange(  "rate_eff_dt",  e.target.value,  rowIndex,  e  )  }
                                   onBlur={(e) =>handleBlur(rowIndex,e)}
                                       disabled={formStatus === "Search"}

                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                   required
                                   name="it_rate"
                                    value={data?.it_rate || ""}
                                  
                                   onChange={(e) =>handleChange("it_rate", e.target.value, rowIndex, e)}
                                  
                                 />
                               </td>
                                 {/* <td className="table_cell">
                                 <TextField
                                   type="text"
                                   required
                                   hange={(e) =>handleChange("tax_paid", e.target.value, rowIndex, e)}
                                  name="tax_paid"
                                    value={data?.tax_paid || ""}
                                   maxLength={20}
                                   onC
                                 />
                               </td> */}
   
                                 <td className="table_cell">
                                   <Checkbox
                                     onChange={(e) => handleChange( "rate_apprvd_by_chairman", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.rate_apprvd_by_chairman === "Y"}
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
          
         </div></>
  )
}

export default RateMasterHdr