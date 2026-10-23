import React, { useState } from 'react'
import TextField from '../../../../components/basic/textField'
import {Card, Col, Row ,Table,Form} from 'reactstrap'
import { headers } from './unit_conversion_mstr_helper'
import ButtonUi from '../../../../components/basic/button'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import Select from '../../../../components/basic/select'

const UnitConversionMasterDetails = ({formData, handleChange, formStatus,triggerAddRow,handleDelete,handleUpdate, fromUnitList=[],
  toUnitList=[],focusedRowIndex,setFocusedRowIndex}) => {

  // const [focusedRowIndex, setFocusedRowIndex] = useState(-1)
    
         const makeFocusOnTableRow = (rowIndex, id)=>{
            const entry = formData.find((entry) => entry.id === id);
            setFocusedRowIndex(rowIndex)
        }


  return (
      <>
    <div className="d-flex justify-content-center align-items-center">
    <Card className="w-50 p-2">
    <Row className='mb-2'>
    <Col xl={12}>
    <Form id="unit-conversion-mstr-form">
        <div className="table-title">
          <span>Unit Conversion Master</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )}
        </div>

         <div className="table-wrapper-v3">
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
              {(formData || []).map((data, rowIndex) => (
                !data.isDeleted && (
              <tr key={rowIndex} onFocus={() =>
               makeFocusOnTableRow(rowIndex, data.id)} 
               style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}` }} tabIndex={0}>
                  {
                        (formStatus==='Insert' || formStatus==='Update') &&
                         <td className=" ">
                             <RowAction
                                 formStatus={formStatus}
                                //  canDelete={formData.length > 1}
                                //  onDelete={() => handleDelete(data, rowIndex)}
                                     canDelete={formData.filter(row => !row.isDeleted).length > 0}
                                      onDelete={() => handleDelete(rowIndex)}
                                //  onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                             />
                         </td>
                    }
                <td className="table_cell">
                <Select
                required
                name="from_id"
                 value={data?.from_id || ""}
                onChange={(e) => handleChange("from_id", e.target.value, rowIndex, null)}
                options={fromUnitList}
                />
                  
               </td>
                <td className="table_cell">
                  <TextField
                    type="number"
                    required
                    name="multiplier"
                     value={data?.multiplier || ""}
                     maxLength={30}
                    onChange={(e) => handleChange("multiplier", e.target.value,rowIndex,e)}
                   
                  />
                </td>
                <td className="table_cell">
                <Select
                name="to_id"
                id={`to_id_${rowIndex}`} 
                 value={data?.to_id || ""}
                onChange={(e) => handleChange("to_id", e.target.value, rowIndex, null)}
                options={toUnitList}
                required
                />
               </td>
              </tr>
           ) ))}
          </tbody>
          </Table>
                </div>
          </SimpleBar>
        </div>
      </Form>
    </Col>
    </Row>
    </Card>
    </div>
  </>
  
  )
}

export default UnitConversionMasterDetails