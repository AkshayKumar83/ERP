import React from 'react'

import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import { matConsumptionDtlTHeader } from './pl_schd_mat_consm_helper'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import RadioButton from '../../../../components/basic/radioButton'

const PlMatConsumptionDtl = ({ formDetailData, handleChange, formStatus, handleAddRow, handleDelete }) => {
    return (
        <React.Fragment>
            <Row>
                <Col>
                    <Form id="mat-consumption-dtl-form">
                        <div className="table-title">
                            {
                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <ButtonUi color="primary" className="add-action"
                                    onClick={handleAddRow}
                                >Add Row</ButtonUi>}

                        </div>

                         <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className='table-sticky-wrapper'>
                                <Table hover>
                                    <thead style={{ border: '' }}>
                                        <tr>
                                            {
                                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                                <th className="" style={{ width: '120px' }}>Actions</th>
                                            }
                                            {matConsumptionDtlTHeader.map((header, index) => (
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
                                        {formDetailData &&
                                            formDetailData.map((data, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {
                                                        (formStatus === 'Insert' || formStatus === 'Update') &&
                                                        <td className="">
                                                            <RowAction
                                                                formStatus={formStatus}
                                                                canDelete={formDetailData.length > 1}
                                                            onDelete={() => handleDelete(data, rowIndex)}
                                                            //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                            />
                                                        </td>

                                                    }
                                                    <td className="table_cell">
                                                        <TextField
                                                            required
                                                            type="text"
                                                            name="acc_no"
                                                            value={data.acc_no || ""}
                                                            maxLength={20}
                                                            onChange={(e) => handleChange("formDetailData", "acc_no", e.target.value, rowIndex)}
                                                        />
                                                    </td>

                                                    <td className="table_cell">
                                                        <TextField style={{ textAlign: 'left' }}
                                                            required
                                                            type="text"
                                                            name="desc"
                                                            value={data.desc || ""}
                                                            maxLength={250}
                                                            disabled
                                                            onChange={(e) => handleChange("formDetailData", "desc", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <RadioButton
                                                            className='radio-button'
                                                            required
                                                            //required={false}
                                                            type="radio"
                                                            name="acc_type" 
                                                            value="O"
                                                            checked={data?.acc_type === "O"}
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "formDetailData",
                                                                    "acc_type",
                                                                    e.target.value,
                                                                    rowIndex
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <RadioButton
                                                            className='radio-button'
                                                            required
                                                            //required={false}
                                                            type="radio"
                                                            name="acc_type"
                                                            value="P"
                                                            checked={data?.acc_type === "P"}
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "formDetailData",
                                                                    "acc_type",
                                                                    e.target.value,
                                                                    rowIndex
                                                                )
                                                            }
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
        </React.Fragment>
    )
}

export default PlMatConsumptionDtl