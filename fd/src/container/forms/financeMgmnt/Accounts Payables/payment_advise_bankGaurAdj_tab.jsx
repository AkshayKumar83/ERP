import React, { useState } from 'react'
import { Form, Table,Row, Col} from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import SimpleBar from 'simplebar-react';
import { bankGaurTabHeader } from './payment_advise_helper'
import RowAction from '../../../../components/common/rowAction';

const PaymentAdviseBankGaurAdjTab = ({bankFormData,formStatus,handleChange, triggerAddRow}) => {

         const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
            const makeFocusOnTableRow = (rowIndex, id) => {
              const entry = bankFormData.find((entry) => entry.id === id);
              setFocusedRowIndex(rowIndex);
              // triggerFamilyDetail(id)
            };
    
      function handleDelete() {}
      function handleUpdate() {}


  return (
    <Form id="Bank-Gaur-Adj">
    <div className="table-title">
        <span>Bank Gaur Adj.</span>
        {
        (formStatus === 'Insert' || formStatus === 'Update') &&
        <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
        }
    </div>
 <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
            <Table hover>
                <thead>
                    <tr>{
                            (formStatus==='Insert' || formStatus==='Update') &&
                            <th >Actions</th>
                        }
                        {bankGaurTabHeader.map((header, index) => (
                            <th
                            key={index}
                            data-required={header.required || false}
                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                {header.label}
                            </th>
                        ))}
                        
                    </tr>
                </thead>
                <tbody>
                    {bankFormData.map((data, rowIndex) => (
                    <tr key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                  style={{border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,}}
                  tabIndex={0}
                    >
                        {
                       (formStatus==='Insert' || formStatus==='Update') &&
                        <td >
                            <RowAction
                            formStatus={formStatus}
                            canDelete={bankFormData.length > 1}
                            onDelete={() => handleDelete(data, rowIndex)}
                            onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                        </td>  
                        }
                        <td>
                        <TextField
                        type="text"
                        required
                        name="remarks"
                        value={data.remarks || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("remarks", e.target.value, rowIndex,e )}                       
                        />
                        </td>
                        <td>
                        <TextField
                        type="text"
                        name="acc_no"
                        value={data.acc_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("acc_no", e.target.value,rowIndex, e)}
                          />
                        </td>
                        <td>
                        <TextField
                        type="text"
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("doc_no", e.target.value, rowIndex,  e  )} 
                        />
                        </td>
                        <td>
                        <TextField
                        type="date"
                        required
                        name="doc_dt"
                        value={data.doc_dt || ""}
                        maxLength={30}
                        onChange={(e) =>handleChange("doc_dt", e.target.value, rowIndex, e)}      
                       />
                        </td>
                        <td>
                        <TextField
                        type="text"
                        required
                        name="amount"
                        value={data.amount || ""}                    
                        maxLength={30}
                        onChange={(e) => handleChange("amount", e.target.value, rowIndex,e )}   
                       />
                        </td>
                        <td>
                        <TextField
                        type="text"
                        required
                        name="db_cr"
                        value={data.db_cr || ""}                    
                        maxLength={30}
                        onChange={(e) => handleChange("db_cr", e.target.value, rowIndex,e )}                       
                       />
                       </td>
                    </tr>
                    ))}
                </tbody>
            </Table>  </div>
        </SimpleBar>
    </div>
  
  

    <Row>
    <Col sm={12} md={10} lg={10}>
            <TextField
            type="text"
            label="Acc. Desc."
            value={bankFormData.acc_name || ""}
            onChange={(e) => handleChange("acc_name", e.target.value, rowIndex ,e)}
            disabled={formStatus !== "Query"}
            />
            </Col>
            <Col sm={12} md={2} lg={2}>
            <TextField
            type="text"
            label="Totals"
            value={bankFormData.total_sel_bg || ""}
            onChange={(e) => handleChange("total_sel_bg", e.target.value,rowIndex, e)}
            disabled ={formStatus !== "Query"}
            />
            </Col>
        </Row>
</Form>

  )
}

export default PaymentAdviseBankGaurAdjTab ;