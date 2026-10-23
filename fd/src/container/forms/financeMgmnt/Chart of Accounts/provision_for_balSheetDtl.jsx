import React from 'react'
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import { formDetailHeader } from './provision_for_balSheetHelper'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import RadioButton from '../../../../components/basic/radioButton'

const ProvisionForBalanceSheetDtl = ({ formDetailData, handleChange, formStatus, handleAddRow, handleDelete }) => {
    return (
        <React.Fragment>
            <Row>
                <Col xl={11} className='m-auto'>
                    <div className='box-border mt-4'>
                        <Form id="balance-sheet-formula-dtl-form">
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
                                                {formDetailHeader.map((header, index) => (
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
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="acc_desc"
                                                                value={data.acc_desc || ""}
                                                                maxLength={60}
                                                                disabled
                                                                onChange={(e) => handleChange("formDetailData", "acc_desc", e.target.value, rowIndex)}
                                                            />
                                                        </td>
                                                        <td className="table_cell">
                                                            <TextField
                                                                required
                                                                type="number"
                                                                name="amount"
                                                                value={data.amount || ""}
                                                                maxLength={18}
                                                                onChange={(e) => handleChange("formDetailData", "amount", e.target.value, rowIndex)}
                                                            />
                                                        </td>

                                                        <td className="table_cell">
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                                                                <RadioButton
                                                                    className='radio-button'
                                                                    required
                                                                    type="radio"
                                                                    name="db_cr"
                                                                    value="D"
                                                                    checked={data?.db_cr === "D"}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "db_cr",
                                                                            e.target.value,
                                                                            rowIndex
                                                                        )
                                                                    }
                                                                />
                                                                Dr
                                                            </label>
                                                        </td>

                                                        <td className="table_cell">
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                                                                <RadioButton
                                                                    className='radio-button'
                                                                    required
                                                                    type="radio"
                                                                    name="db_cr"
                                                                    value="C"
                                                                    checked={data?.db_cr === "C"}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "db_cr",
                                                                            e.target.value,
                                                                            rowIndex
                                                                        )
                                                                    }
                                                                />
                                                                Cr
                                                            </label>
                                                        </td>

                                                    </tr>
                                                ))}
                                        </tbody>

                                    </Table>  </div>
                                </SimpleBar>

                            </div>

                        </Form>
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    )
}

export default ProvisionForBalanceSheetDtl