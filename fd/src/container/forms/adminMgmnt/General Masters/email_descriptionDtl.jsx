import React from 'react'
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import { emailDescTHeader } from './email_description_helper'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import toast from 'react-hot-toast'

const EmailDescriptionDtl = ({ formData, emailDescData = [{}], formStatus, handleChange, handleAddRow, handleDelete, fetchValidateData, }) => {

    const validateRequiredField = (e, fieldLabel) => {
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`This ${fieldLabel} field is required`);
            e.target.focus();
            return false;
        }
        return true;
    };


    const handleValidateBlur = async (e, rowIndex, name) => {
        if (formStatus === 'Update' || formStatus === "Insert") {
            const field = e.target;
            const value = field.value; 
             validateRequiredField({ target: field }, `${name}`);

            if (value === 'undefined' || value === null || value === '') {
                return;
            }

        
            // try {
            //     const result = await fetchValidateData(name, value, rowIndex);
            //     console.log('Validation result:', result);

            //     if (!result.valid) {
            //         field.focus();
            //     }

            // } catch (err) {
            //     console.error("Validation error", err);
            // }
        }
    }


    return (
        <React.Fragment>

            <Form id="email-description-form">
                <Row>
                    <Col xl={8} className='m-auto'>
                        <div className="table-title">

                            {

                                (formStatus === 'Insert') &&
                                <ButtonUi color="primary" className="add-action"
                                    onClick={handleAddRow}
                                >Add Row</ButtonUi>}

                        </div>

                        <div className="table-wrapper-v3">
                            <SimpleBar style={{ border: '' }} forceVisible="Y" autoHide={false}>
                                <div className="table-sticky-wrapper height-auto">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                {(formStatus === 'Insert' || formStatus === 'Update') && (
                                                    <th className="sticky-column left" style={{ width: '30px' }}>Actions</th>
                                                )}
                                                {emailDescTHeader.map((header, index) => (
                                                    <th key={index} style={{ width: header.width, minWidth: header.width }}>
                                                        {header.label}
                                                        {header.required && (
                                                            <span className="required-asterisk"> *</span>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>


                                        <tbody>
                                            {emailDescData &&
                                                emailDescData.map((data, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {
                                                            (formStatus === 'Insert' || formStatus === 'Update') &&
                                                            <td className="sticky-column left">
                                                                <RowAction
                                                                    formStatus={formStatus}
                                                                    canDelete={emailDescData.length >= 1}
                                                                    onDelete={() => handleDelete(data, rowIndex)}
                                                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                                />
                                                            </td>

                                                        }
                                                        <td className="table_cell" style={{ width: '20px' }}>
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="email_type"
                                                                value={emailDescData[rowIndex]?.email_type || data.email_type || ""}
                                                                maxLength={10}
                                                                onChange={(e) => handleChange("emailDescData", "email_type", e.target.value, rowIndex, e)}

                                                                // onBlur={(e) => {
                                                                //     // Find the actual input field within MUI's structure
                                                                //     const inputElement = e.currentTarget.querySelector("input");
                                                                //     const fieldName = inputElement ? inputElement.name : "email_type";

                                                                //     console.log("Validating:", fieldName, e.target.value, "Row Index:", rowIndex);

                                                                //     if (formStatus === "Insert" || formStatus === "Update") {
                                                                //         validateRequiredField(e, "Email Type")
                                                                //         fetchValidateData(fieldName, e.target.value, rowIndex);
                                                                //         return
                                                                //     }
                                                                // }}  

                                                                onBlur={(e) => {
                                                                        if (formStatus === 'Insert' || formStatus === 'Update') {
                                                                            handleValidateBlur(e, rowIndex, 'email_type')
                                                                        }
                                                                    }
                                                                }

                                                            />
                                                        </td>

                                                        <td className="table_cell" style={{ width: '170px' }}>
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="email_desc"
                                                                maxLength={50}
                                                                value={emailDescData[rowIndex]?.email_desc || data.email_desc || ""}
                                                                onChange={(e) => handleChange("emailDescData", "email_desc", e.target.value, rowIndex, e)}
                                                                // onBlur={(e) => {
                                                                //     if (formStatus === 'Insert' || formStatus === 'Update') {
                                                                //         validateRequiredField(e, "Email Description")
                                                                //         fetchValidateData(fieldName, e.target.value, rowIndex);
                                                                //     }
                                                                // }
                                                                // } 
                                                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'email_desc')}
                                                            // (e, "Email Description")}validateRequiredField


                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>

                                    </Table>
                                </div>
                            </SimpleBar>

                        </div>
                    </Col>
                </Row>
            </Form>

        </React.Fragment>
    )
}

export default EmailDescriptionDtl
