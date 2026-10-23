import React from 'react'
import { Row , Col, Form, Table} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import {  invoiceHeaders } from './payment_received_entry_helper'
import Checkbox from '../../../../components/basic/checkbox'
import RowAction from '../../../../components/common/rowAction'

const PaymentReceivedEntryInvoiceTab = ({invoiceFormData,handleChange, formStatus}) => {

  //  PARTY NAME AND PARTY CODE CAME HERE FROM MAINTAB FORM DATA
  // BALANCE AMT AND TOTAL IS THE FRONTEND CALCULATION

  // AND REST OF FIELDS IS TAKEN FROM invoiceTabInitData

  function triggerAddRow(){ 
  }
  function handleDelete (){
  }
  function handleUpdate (){
  }

  return (
    <>
      <Row className='d-flex justify-content-center'>
    <Col sm={6} md={6} lg={2}>
           <TextField
            type="text"
            label="Balance Amount"
           value={invoiceFormData[0]?.bal_amt1 || ""}
           onChange={(e) => handleChange("bal_amt1", e.target.value,0,e)}
           disabled
          />
        </Col>
        </Row>
    <Row className='mt-1'>
    <Col sm={3} md={2} lg={2}>
          <TextField
            type="text"
            label="Party Code"
            value={invoiceFormData[0]?.inv_acc_no || ""}
            onChange={(e) => handleChange("inv_acc_no", e.target.value,0,e)}
            disabled
          />
         </Col>
          <Col sm={3} md={4} lg={6}>
           <TextField
            type="text"
             label="Name"
            value={invoiceFormData[0]?.inv_acc_desc || ""}
            onChange={(e) => handleChange("inv_acc_desc", e.target.value,0,e)}
            disabled
          />
        </Col>
        {/* <Col sm={3} md={4} lg={4}>
           <TextField
            type="text"
             label="Balance Amount"
            value={invoiceFormData[0]?.bal_amt1 || ""}
            onChange={(e) => handleChange("bal_amt1", e.target.value,0,e)}
            disabled
          />
        </Col> */}
    </Row>
  
    <Row >
        <Col>
        <Form id="GST-debit-credit-note" className=" mt-4">
        <div className="table-title">
          <span>Payment Received Entry Invoice</span>
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
                  {invoiceHeaders.map((header, index) => (
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
                {invoiceFormData.map((data, rowIndex) => (
                  <tr key={rowIndex}> 
                                             {
                        (formStatus==='Insert' || formStatus==='Update') &&
                         <td className="">
                             <RowAction
                                 formStatus={formStatus}
                                 canDelete={invoiceFormData.length > 1}
                                 onDelete={() => handleDelete(data, rowIndex)}
                                 onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                             />
                         </td>
                    }            
                    <td className=" table_cell">
                      <TextField
                        type="text"
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("doc_no",  e.target.value,  rowIndex,  e)}
                         />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="date"
                        required
                        name="doc_dt"
                        value={data.doc_dt || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("doc_dt", e.target.value, rowIndex,e )}                       
                        disabled
                        />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="date"
                        required
                        name="due_date"
                        value={data.due_date || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("due_date", e.target.value,rowIndex, e)}
                        disabled
                        />
                       </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="dr_cr"
                        value={data.dr_cr || ""}
                        maxLength={30}
                        onChange={(e) => handleChange( "dr_cr",  e.target.value, rowIndex,  e  )} 
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="amt"
                        value={data.amt || ""}
                        maxLength={30}
                        onChange={(e) =>handleChange("amt", e.target.value, rowIndex, e)}      
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="bal_amt"
                        value={data.bal_amt || ""}                    
                        maxLength={30}
                        onChange={(e) =>
                        handleChange(  "bal_amt",  e.target.value,  rowIndex,  e )} 
                        disabled
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
                    <Checkbox
                        onChange={(e) => handleChange("inv_selection", e.target.checked ? "Y" : "N" , rowIndex,e)}
                        checked={invoiceFormData[rowIndex]?.inv_selection === "Y"}
                         disabled
                    />
                    </td>
                    <td className="table_cell">
                    <Checkbox
                        onChange={(e) => handleChange("include_in_servtax", e.target.checked ? "Y" : "N" ,rowIndex,e)}
                        checked={invoiceFormData[rowIndex]?.include_in_servtax === "Y"}
                         disabled
                    />
                    </td>
                  </tr>
                ))}
              </tbody>
              </Table> </div>
          </SimpleBar>
        </div>
      </Form>
     </Col>
   </Row>

        <Row>
        <Col sm={3} md={2} lg={3}>
          <TextField
            type="text"
            label="Total"
            value={invoiceFormData[0]?.sum_inv || ""}
            onChange={(e) => handleChange("sum_inv", e.target.value,0,e)}
             disabled
          />
         </Col>
        </Row>
  
    </>
  )
}

export default PaymentReceivedEntryInvoiceTab