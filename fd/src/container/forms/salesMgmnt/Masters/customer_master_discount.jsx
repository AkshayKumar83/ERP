import React, { useState } from 'react'
import { Card, Form, Table } from 'reactstrap'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import { discountHeader } from './customer_master_helper'
import Checkbox from '../../../../components/basic/checkbox'

const CustomerMasterDiscount = ({disFormData,handleChange,formStatus,handleAddRow, handleDelete,handleUpdate}) => {

       const [focusedRowIndex, setFocusedRowIndex] = useState(-1)
    
         const makeFocusOnTableRow = (rowIndex, id)=>{
            const entry = disFormData.find((entry) => entry.id === id);
            setFocusedRowIndex(rowIndex)
        }

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
    <Card className=" p-4 w-50 shadow-sm ">
    <Form id="customer-mstr-discount">
        <div className="table-title">
            <span>Discount</span>
            {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action"
                    onClick={handleAddRow}
                >
                    Add Row
                </ButtonUi>
            )}
        </div>
        <div className="table-container" style={{ height: '140px', maxHeight: '140px' }}>
            <SimpleBar forceVisible="y" autoHide={false}>
                <Table hover>
                    <thead>
                        <tr>
                            {(formStatus === "Insert" || formStatus === "Update") &&
                                <th style={{ width: '80px' }} className="sticky-column left">Actions</th>
                            }
                            {discountHeader.map((header, index) => (
                                <th
                                    key={index}
                                    data-required={header.required || false}
                                    style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {disFormData.map((data, rowIndex) => (
                            <tr
                             key={rowIndex}
                             onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                             style={{border:`${rowIndex=== focusedRowIndex? '2px solid black': 'none'}`}}
                             tabIndex={0}
                            >
                                {(formStatus === "Insert" || formStatus === "Update") && (
                                    <td className="sticky-column left">
                                        <RowAction
                                            formStatus={formStatus}
                                            canDelete={disFormData.length > 1}
                                          //  onDelete={() => handleDelete(rowIndex)}
                                          onDelete={() => handleDelete(rowIndex)} // Delete row
                                          onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }

                                        />
                                    </td>
                                )}
                                <td>
                                    <TextField
                                        type="text"
                                        name="disc_desc"
                                        value={data?.disc_desc || ""}
                                        onChange={(e) => handleChange("disc_desc", e.target.value, rowIndex, e)}
                                    />
                                </td>

                                <td>
                                <Checkbox
                                        name="active"
                                        checked={data?.active === "Y"}
                                        onChange={(e) => handleChange("active", e.target.checked ? "Y" : "N", rowIndex, e)}
                                    />

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </SimpleBar>
        </div>


    </Form>
</Card>
</div>
  )
}

export default CustomerMasterDiscount