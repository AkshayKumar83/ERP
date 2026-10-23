import React, { useState } from 'react'
import TextField from '../../../../components/basic/textField'
import { Col, Row, Table, Form, Card, Container } from 'reactstrap'
import { headers } from './standard_remarks_helper'
import ButtonUi from '../../../../components/basic/button'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'

const StandardRemarksDetails = ({formData =[{}] ,handleChange =()=>{},
 formStatus = '',
  triggerAddRow,handleDeleteRow,
 focusedRowIndex,
  setFocusedRowIndex,
}) => {

  // const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  
    const makeFocusOnTableRow = (rowIndex, id) => {
      const entry = formData.find((entry) => entry.sr_no === id);
      setFocusedRowIndex(rowIndex);
      // triggerFamilyDetail(id)
    };
    function handleDelete(data, rowIndex) {
      if (handleDeleteRow) {
        handleDeleteRow(data, rowIndex);
      }
    }
  function handleUpdate (){
  }

  return (
  
    <Form id="standard-remark" className="">
     <div className="d-flex justify-content-center align-items-center ">
        <Card className="w-50">
          <Container className='mb-3'>
        <div className="table-title">
          <span>Standard Remarks</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )}
        </div>

        <div  className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
          <div className="table-sticky-wrapper height-auto">
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="">Actions</th>
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
                        <span className='required-asterisk'>*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
        <tbody>
          {formData?.map((data, rowIndex) => (
            <tr 
            key={rowIndex} 
            onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
            style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
            }} 
            tabIndex={0}>
                   {
                        (formStatus==='Insert' || formStatus==='Update') &&
                         <td>
                             <RowAction
                                 formStatus={formStatus}
                                 canDelete={formData.length > 0}
                                 onDelete={() => handleDelete(data, rowIndex)}
                                //  onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                             />
                         </td>
                    }  
              <td className="table_cell">
                <TextField
                  type="text"
                  required
                  name="remark_desc"
                  value={data?.remark_desc || ""}
                  maxLength={2000}
                  onChange={(e) =>handleChange("remark_desc", e.target.value,rowIndex,e)}
                />
              </td>
              <td className="table_cell">
                <TextField
                  type="text"
                  required
                  name="remark_cat"
                  value={data?.remark_cat || ""}
                  maxLength={2}
                  onChange={(e) => handleChange("remark_cat", e.target.value,rowIndex,e)} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
       </div>
      </SimpleBar>
    </div>
    </Container>
    </Card>
      </div>
    </Form>

  )
}

export default StandardRemarksDetails