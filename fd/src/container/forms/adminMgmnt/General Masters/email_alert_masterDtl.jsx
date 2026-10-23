import React from 'react'
import { Row, Col, Form, Table, Card } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import TextArea from '../../../../components/basic/textArea'
import toast from 'react-hot-toast'

const EmailAlertMasterDtl = ({ formData, formStatus, handleChange, emailTypes = [], divisions = [] }) => {

    const validateRequiredField = (e, fieldLabel) => {
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`this ${fieldLabel} field is required`);
            e.preventDefault();
            e.target.focus();
            return false;
        }
        return true;
    };


    return (
        <React.Fragment>
            <Form id='email-alert-master-form'>
                <Row>
                    <Col xl={11} className='m-auto'>
                        <Row>
                            <Col>
                                <Select
                                    label="Email Type"
                                    type="text"
                                    required
                                    name="email_type"
                                    value={formData.email_type || ""}
                                    onChange={(e) => handleChange("email_type", e.target.value, e)}
                                    options={emailTypes}
                                    maxLength={10}
                                    onBlur={  
                                      (e) =>  { 
                                        if(formStatus === 'Insert' || formStatus === 'Update') {
                                             validateRequiredField(e, "Email Type")  
                                        }
                                             
                                        }
                                              
                                    }
                                />
                            </Col>

                            <Col>
                                <TextField
                                    label="Email From"
                                    type="text"
                                    required
                                    name="email_from"
                                    maxLength={50}
                                    value={formData.email_from || ""}
                                    onChange={(e) => handleChange("email_from", e.target.value, e)}
                                    onBlur={(e) =>  validateRequiredField(e, "Email From")}
                                />
                            </Col>
                        </Row>

                        <Row className='d-flex mt-1'>
                            <Col xl={3}>
                                <TextField
                                    label="Email Server"
                                    type="text"
                                    name="email_server"
                                    required
                                    value={formData.email_server || ""}
                                    maxLength={100}
                                    onChange={(e) => handleChange("email_server", e.target.value, e)}
                                />
                            </Col>

                            <Col className='m-auto' xl={3}>
                                <TextField
                                    label="Email Server Port"
                                    type="text"
                                    required
                                    name="email_server_port"
                                    value={formData.email_server_port || ""}
                                    maxLength={10}
                                    onChange={(e) => handleChange("email_server_port", e.target.value, e)}
                                    onBlur={(e) => validateRequiredField(e, "Email Server Port")}
                                />
                            </Col>
                        </Row>

                        <Row className='d-flex mt-1'>
                            <Col xl={4}>
                                <TextField
                                    label="Email Domain"
                                    type="text"
                                    required
                                    name="email_domain"
                                    value={formData.email_domain || ""}
                                    maxLength={100}
                                    onChange={(e) => handleChange("email_domain", e.target.value, e)}
                                    onBlur={(e) => validateRequiredField(e, "Email Domain")}
                                />
                            </Col>

                            <Col xl={4} className='m-auto'>
                                <Select
                                    label="Division"
                                    type="text"
                                    name="division_id"
                                    value={formData.division_id || ""}
                                    onChange={(e) => handleChange("division_id", e.target.value, e)}
                                    options={divisions}
                                />
                            </Col>

                        </Row>

                    </Col>

                    <Row className='mt-1'>
                        <Col className='m-auto ' xl={11}>
                            <TextField
                                label="Email To"
                                type="text"
                                name="email_to"
                                value={formData.email_to || ""}
                                maxLength={500}
                                onChange={(e) => handleChange("email_to", e.target.value, e)}
                            />
                        </Col>
                    </Row>

                    <Row className='mt-1'>
                        <Col className='m-auto ' xl={11}>
                            <TextField
                                label="Email CC"
                                type="text"
                                name="email_cc"
                                value={formData.email_cc || ""}
                                onChange={(e) => handleChange("email_cc", e.target.value, e)}
                                maxLength={500}
                            />
                        </Col>
                    </Row>

                    <Row className='mt-1'>
                        <Col className='m-auto' xl={11}>
                            <TextField
                                label="Email BCC"
                                type="text"
                                name="email_bcc"
                                maxLength={500}
                                value={formData.email_bcc || ""}
                                onChange={(e) => handleChange("email_bcc", e.target.value, e)}
                            />
                        </Col>
                    </Row>

                    <Row className='mt-1'>
                        <Col className='m-auto' xl={11}>
                            <TextField className='text-area'
                                label="Email Subject"
                                type="text"
                                required
                                name="email_subject"
                                maxLength={2000}
                                value={formData.email_subject || ""}
                                onChange={(e) => handleChange("email_subject", e.target.value, e)}
                                onBlur={(e) => validateRequiredField(e, "Email Subject")}
                            />
                        </Col>
                    </Row>

                    <Row className='mt-1'>
                        <Col className='m-auto' xl={11}>
                            <TextArea
                                label="Email Body"
                                type="text"
                                required
                                name="email_body"
                                value={formData.email_body || ""}
                                maxLength={2000}
                                onChange={(e) => handleChange("email_body", e.target.value, e)}
                                onBlur={(e) => validateRequiredField(e, "Email Body")}
                            />
                        </Col>
                    </Row>
                    <Row className='mt-2'>
                        <Col xl={4} className='m-auto mt-1'>
                            <Checkbox
                                onChange={(e) => handleChange("email_active", e.target.checked ? "Y" : "N")}
                                text="Active"
                                checked={formData?.email_active === "Y"}
                            />
                        </Col>
                    </Row>

                </Row>
            </Form>

        </React.Fragment>
    )
}

export default EmailAlertMasterDtl

