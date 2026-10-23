import React from 'react'
import { Row , Col, Form, Table} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import { debitCreditNoteHeaders } from './payment_received_entry_helper'
import Checkbox from '../../../../components/basic/checkbox'
import RowAction from '../../../../components/common/rowAction'

const PaymentReceivedEntryDebitCreditNoteTab = ({dcFormData, handleChange, formStatus}) => {

  // PARTY CODE AND PARTY NAME TAKE FORM MAINTAB FORM DATA
  // AND REST OF FIELD IS FROM debitCreditInitData
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
            value={dcFormData[0]?.bal_amt2 || ""}
            onChange={(e) => handleChange("bal_amt2", e.target.value,0,e)}
             disabled
          />
        </Col>
        </Row>
        <Row >
    <Col sm={6} md={6} lg={2}>
          <TextField
            type="text"
            label="Party Code"
            value={dcFormData[0]?.dc_acc_no || ""}
            onChange={(e) => handleChange("dc_acc_no", e.target.value,0,e)}
             disabled
          />
         </Col>
          <Col sm={6} md={6} lg={5}>
           <TextField
            type="text"
             label="Name"
            value={dcFormData[0]?.dc_acc_desc || ""}
            onChange={(e) => handleChange("dc_acc_desc", e.target.value,0,e)}
             disabled
          />
        </Col>
    </Row>
  
    <Row >
        <Col>
        <Form id="GST-debit-credit-note" className=" mt-4">
        <div className="table-title">
          <span>Payment Received Entry Debit Credit Note</span>
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
                  {debitCreditNoteHeaders.map((header, index) => (
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
                {dcFormData.map((data, rowIndex) => (
                  <tr key={rowIndex}> 
                                             {
                        (formStatus==='Insert' || formStatus==='Update') &&
                         <td className="">
                             <RowAction
                                 formStatus={formStatus}
                                 canDelete={dcFormData.length > 1}
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
                        />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="db_cr"
                        value={data.db_cr || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("db_cr", e.target.value,rowIndex, e)}                       
                        />
                       </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="amount"
                        value={data.amount || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("amount",  e.target.value, rowIndex,  e  )}                
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="explanation"
                        value={data.explanation || ""}
                        maxLength={30}
                        onChange={(e) =>handleChange("explanation", e.target.value, rowIndex, e)}                       
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              </Table>  </div>
          </SimpleBar>
        </div>
      </Form>
         </Col>
        </Row>

  
    </>
  )
}

export default PaymentReceivedEntryDebitCreditNoteTab