import React, { useState } from 'react'
import { Form, Table,Row, Col} from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import SimpleBar from 'simplebar-react';
import { retensionAdjTabHeader } from './payment_advise_helper'
import RowAction from '../../../../components/common/rowAction';

const PaymentAdviseRetensionAdjTab = ({retensionFormData,formStatus,handleChange, triggerAddRow}) => {

          const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
            const makeFocusOnTableRow = (rowIndex, id) => {
              const entry = retensionFormData.find((entry) => entry.id === id);
              setFocusedRowIndex(rowIndex);
            };
    
      function handleDelete() {}
      function handleUpdate() {}
  return (
    <Form id="on-Acc-Adj-form">
    <div className="table-title">
        <span>retension Adj.</span>
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
                            <th className="">Actions</th>
                        }
                        {retensionAdjTabHeader.map((header, index) => (
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
                    {retensionFormData.map((data, rowIndex) => (
                    <tr key={rowIndex}
                    onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                  style={{border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,}}
                  tabIndex={0}
                    >
                        {
                       (formStatus==='Insert' || formStatus==='Update') &&
                        <td className="">
                            <RowAction
                            formStatus={formStatus}
                            canDelete={retensionFormData.length > 1}
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
    <Col sm={12} md={6} lg={10}>
            <TextField
            type="text"
            label="Acc. Desc."
            value={retensionFormData.acc_name || ""}
            onChange={(e) => handleChange("acc_name", e.target.value)}
            disabled={formStatus !== "Query"}
            />
            </Col>
            <Col sm={12} md={6} lg={2}>
            <TextField
            type="text"
            label="Totals"
            value={retensionFormData.total_sel_rt || ""}
            onChange={(e) => handleChange("total_sel_rt", e.target.value)}
            disabled ={formStatus !== "Query"}
            />
            </Col>
        </Row>
</Form>

  )
}

export default PaymentAdviseRetensionAdjTab ;