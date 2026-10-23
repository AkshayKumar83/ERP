import React from 'react'
import { Row , Col, Form, Table} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import Checkbox from '../../../../components/basic/checkbox'
import { miscHeaders } from "./payment_received_entry_helper";
import RowAction from '../../../../components/common/rowAction'

const PaymentReceivedEntryMiscellaneous = ({miscFormData, handleChange, formStatus,
}) => {
  // BALANCE AMOUNT IS FRONTEND CALCULATION 
  // REST OF FIELD IS FROM miscInitData

  function triggerAddRow(){ 
  }
  function handleDelete (){
  }
  function handleUpdate (){
  }
  
   return (
    <>
    <Row >
        <Col>
        <Form id="GST-debit-credit-note" className=" mt-4">
        <div className="table-title">
          <span>Payment Received Entry Miscellaneous</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >
              Add Row
            </ButtonUi>
          )}
        </div>

        <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="">Actions</th>
                  )}
                  {miscHeaders.map((header, index) => (
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
                {miscFormData.map((data, rowIndex) => (
                  <tr key={rowIndex}>
                           {
                        (formStatus==='Insert' || formStatus==='Update') &&
                         <td className="">
                             <RowAction
                                 formStatus={formStatus}
                                 canDelete={miscFormData.length > 1}
                                 onDelete={() => handleDelete(data, rowIndex)}
                                 onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                             />
                         </td>
                    }            
                    <td className=" table_cell">
                      <TextField
                        type="text"
                        required
                        name="oth_acc"
                        value={data.oth_acc || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("oth_acc",  e.target.value,  rowIndex,  e)}
                         />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="acc_desc"
                        value={data.acc_desc || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("acc_desc", e.target.value, rowIndex,e )}                       
                        disabled
                        />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="emp_name"
                        value={data.emp_name || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("emp_name", e.target.value,rowIndex, e)}                        
                        />
                       </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange( "doc_no",  e.target.value, rowIndex,  e  )}                        
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="date"
                        required
                        name="doc_dt"
                        value={data.doc_dt || ""}
                        maxLength={30}
                        onChange={(e) =>handleChange("doc_dt", e.target.value, rowIndex, e)}                             
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="dr_cr"
                        value={data.dr_cr || ""}                    
                        maxLength={30}
                        onChange={(e) =>
                        handleChange(  "dr_cr",  e.target.value,  rowIndex,  e )} 
                       
                        />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="amount"
                        value={data.amount || ""}                    
                        maxLength={30}
                        onChange={(e) => handleChange(  "amount",  e.target.value,  rowIndex,e )}                   
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="explanation"
                        value={data.explanation || ""}                    
                        maxLength={30}
                        onChange={(e) => handleChange(  "explanation",  e.target.value,  rowIndex,e )}                   
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              </Table>    </div>
          </SimpleBar>
        </div>
      </Form>
    </Col>
  </Row>
  <Row>
    <Col lg={3}>
    <TextField
        type="text"
       label='Balance Amount'
        value={miscFormData[0]?.bal_amt3 || ""}                    
        onChange={(e) => handleChange("bal_amt3",  e.target.value,0,e )}                   
      disabled
     />
    </Col>
  </Row>
</>
   ) 
};

export default PaymentReceivedEntryMiscellaneous;
