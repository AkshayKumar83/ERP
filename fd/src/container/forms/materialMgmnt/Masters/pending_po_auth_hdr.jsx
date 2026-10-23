import React from 'react'
import { Col, Row, Table, Form, Card } from "reactstrap";
import { headers  } from './pending_po_auth_hlpr';
import Checkbox from '../../../../components/basic/checkbox';
import TextField from '../../../../components/basic/textField';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc';
import MuiTextField from '../../../../components/basic/muiTextField';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaCheckSquare,
  FaCheckCircle
} from "react-icons/fa";


const PendingPOAuthHdr = ({formData = [{}],
  handleChange,
  formStatus,
  focusedRowIndex,
  setFocusedRowIndex,
  setFormData,
  getUnauthorizedPO,
  totalRecordCount,
  handleAllPOAuthorize,
  handleOpenForm
}) => {

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };


const handleTickAll = () => {
  const allChecked = formData.every(
    (row) => row.auth_flag === "Y"
  );

  setFormData((prev) =>
    prev.map((row) => ({
      ...row,
      auth_flag: allChecked ? "N" : "Y",
    }))
  );
};

const handleTickAllEmail = () => {
    const allChecked = formData.every(
        (row) => row.send_email_flag === "Y"
    );

    setFormData((prev) =>
        prev.map((row) => ({
            ...row,
            send_email_flag: allChecked ? "N" : "Y",
        }))
    );
};

const authorizedCount = formData.filter(
  (row) => row.auth_flag === "Y"
).length;

  return (
   <>


   <Row className="mb-2">
  <Col>
    <div className="d-flex justify-content-between align-items-center">
      
      <ButtonUi
        outline
        onClick={() => getUnauthorizedPO("O")}
        className="action-btn"
      >
        <FaSearch className="me-2" />
        Show Pending Unauthorized Purchase Order
      </ButtonUi>
      <ButtonUi
        outline
        onClick={() => getUnauthorizedPO("A")}
        className="action-btn"
      >
        <FaSearch className="me-2" />
        Show Pending Unauthorized Purchase Advice
      </ButtonUi>

      {/* <div className="d-flex gap-2"> */}

        <ButtonUi
          outline
          onClick={handleTickAll}
          disabled={!formData?.length}
          className="action-btn"
        >
          <FaCheckSquare className="me-2" />
          Select All
        </ButtonUi>

        <ButtonUi
          outline
          onClick={handleTickAllEmail}
          disabled={!formData?.length}
          className="action-btn"
        >
          <FaCheckSquare className="me-2" />
          Select All Email
        </ButtonUi>

        <ButtonUi
          color="success"
          onClick={handleAllPOAuthorize}
          disabled={!authorizedCount}
          className="authorize-btn"
        >
          <FaCheckCircle className="me-2" />
          Authorize
          {/* Authorize Selected ({authorizedCount}) */}
        </ButtonUi>

      </div>
    {/* </div> */}
  </Col>
</Row>

     <div className=" ">
    <div className="table-title d-flex justify-content-between align-items-center">
  <span>
    Pending PO ({totalRecordCount})
  </span>

  <span
    style={{
      fontWeight: "700",
      color: "green"
    }}
  >
    Authorized ({authorizedCount})
  </span>
</div>

        
             <Row className="">
               <Col  xl={12}>
                 <Form id="rate-master" className="">
                  
                   <div
                     className="table-wrapper-v3"
                    //  style={{ height: "180px", maxHeight: "180px" }}
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
                            
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="po_no"
                                     disabled
                                      value={data?.po_no || ""}
                                     onChange={(e) =>  handleChange(  "po_no",  e.target.value,  rowIndex,  e  )  }
                                   />
                                 </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="text"
                                     name="v_code"
                                      value={data?.v_code || ""}
                                     onChange={(e) =>  handleChange(  "v_code",  e.target.value,  rowIndex,  e)}
                                     disabled
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
                                     name="c_code"
                                     disabled
                                      value={data?.c_code || ""}
                                     onChange={(e) =>  handleChange(  "c_code",  e.target.value,  rowIndex,  e)}
                                   />
                                 </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                  //  required
                                   name="c_name"
                                    value={data?.c_name || ""}
                                   onChange={(e) =>handleChange("c_name", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="date"
                                  //  required
                                   name="member_date"
                                    value={data?.member_date || ""}
                                   onChange={(e) =>handleChange("member_date", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                 <TextField
                                   type="text"
                                  //  required
                                   name="po_type"
                                    value={data?.po_type || ""}
                                   onChange={(e) =>handleChange("po_type", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                <td className="table_cell">
                                 <TextField
                                   type="date"
                                  //  required
                                   name="po_date"
                                    value={data?.po_date || ""}
                                   onChange={(e) =>handleChange("po_date", e.target.value, rowIndex, e)}
                                  disabled
                                 />
                               </td>
                                 <td className="table_cell">
                                   <TextField
                                     type="number"
                                    //  required
                                     name="po_value"
                                      value={data?.po_value ?? ""}
                                     onChange={(e) =>  handleChange(  "po_value",  e.target.value,  rowIndex,  e  )  }
                                    disabled
                                   />
                                 </td>
                                 
                                 <td className="table_cell">
                                   <Checkbox
                                     onChange={(e) => handleChange( "auth_flag", e.target.checked ? "Y" : "N", rowIndex, e ) }
                                     checked={data?.auth_flag === "Y"}
                                   />
                                 </td>
                                 <td className="table_cell">
                                      <Checkbox
                                          onChange={(e) =>
                                              handleChange(
                                                  "send_email_flag",
                                                  e.target.checked ? "Y" : "N",
                                                  rowIndex,
                                                  e
                                              )
                                          }
                                          checked={data?.send_email_flag === "Y"}
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
                                        onClick={ () => handleOpenForm(data.po_id, data.po_no) }
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
          
         </div></>
  )
}

export default PendingPOAuthHdr