
import React from 'react'
import { Col, Row, Table, Form, Card } from "reactstrap";
import { checkDuplicateFromDB, headers, ItemHelpListHeader, ItemNameHelpListHeader, } from './item_wise_dealer_subsidy_helper';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc';
import MuiTextField from '../../../../components/basic/muiTextField';
import toast from 'react-hot-toast';


const ItemWiseDealerSubsidyHdr = ({formData = [{}],
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
setFormData
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

  if (!row.it_code || !row.eff_date) return;

  //  IMPORTANT FIX
  if (
    row.it_code === row.old_it_code &&
    row.eff_date === row.old_eff_date
  ) {
    return; // no change → no API call
  }

  const res = await checkDuplicateFromDB(
    row.it_code,
    row.eff_date
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

     <div className=" ">
        
             <Row className="">
               <Col  xl={12}>
                 <Form id="item-wise-dealer-subsidy" className="">
                   <div className="table-title">
                     <span>Item Wise Dealer Subsidy</span>
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
                                  disabled ={formStatus !== "Search"}
                                  onDoubleClick={() =>
                                       handleDoubleClick(
                                         "Name",
                                         ItemNameHelpListHeader,
                                         rowIndex
                                       )
                                       }
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="date"
                                     required
                                     name="eff_date"
                                      value={data?.eff_date || ""}
                                      onChange={(e) =>  handleChange(  "eff_date",  e.target.value,  rowIndex,  e  )  }
                                      onBlur={(e) =>handleBlur(rowIndex,e)}
                                       disabled={formStatus === "Search"}

                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="number"
                                  
                                   name="subsidy_perc"
                                    value={data?.subsidy_perc || ""}
                                  
                                   onChange={(e) =>handleChange("subsidy_perc", e.target.value, rowIndex, e)}
                                  
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

export default ItemWiseDealerSubsidyHdr