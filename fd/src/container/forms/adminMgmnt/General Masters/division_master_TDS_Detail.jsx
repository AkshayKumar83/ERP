import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const TdsDetail = ({ formData, handleChange, states }) => {
    return (
        <Form id="division-master-tds-form">
            <Row style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        //required
                        label="Emp Name"
                        placeholder=""
                        name="responsible_emp_name"
                        type="text"
                        value={formData?.responsible_emp_name || ""}
                        maxLength={100}
                        onChange={(e) => handleChange("responsible_emp_name", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Designation"
                        name="emp_desig"
                        type="text"
                        maxLength={50}
                        value={formData?.emp_desig || ""}
                        onChange={(e) => handleChange("emp_desig", e.target.value, e)}
                    />
                </Col>
            </Row>

            <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="address"
                        //required
                        placeholder=""
                        name="emp_add1"
                        type="text"
                        value={formData?.emp_add1 || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("emp_add1", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Email Id"
                        //required
                        name="emp_email_id"
                        type="text"
                        value={formData?.emp_email_id || ""}
                        maxLength={100}
                        onChange={(e) => handleChange("emp_email_id", e.target.value, e)}
                    />
                </Col>
            </Row>

            <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
                <Col style={{ marginTop: '1.4rem' }}>
                    <TextField
                        label=''
                        //required
                        placeholder=""
                        name="emp_add2"
                        type="text"
                        value={formData?.emp_add2 || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("emp_add2", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="TAN No"
                        name="tan_no"
                        type="text"
                        value={formData?.tan_no || ""}
                        maxLength={50}
                        onChange={(e) => handleChange("tan_no", e.target.value, e)}
                    />
                </Col>
            </Row>


            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col style={{ marginTop: '1.4rem' }}>
                    <TextField
                        label=""
                        //required
                        placeholder=""
                        name="emp_add3"
                        type="text"
                        maxLength={30}
                        value={formData?.emp_add3 || ""}
                        onChange={(e) => handleChange("emp_add3", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Tan Regn No"
                        name="tan_regn_no"
                        placeholder=""
                        type="text"
                        maxLength={25}
                        value={formData?.tan_regn_no || ""}
                        onChange={(e) => handleChange("tan_regn_no", e.target.value, e)}
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <Select
                        label="State"
                        //required
                        placeholder="--select--"
                        name="state_id"
                        type="text"
                        maxLength={5}
                        value={formData?.state_id || ""}
                        onChange={(e) =>
                            handleChange("state_id", e.target.value)
                        }
                        options={states}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Pan No"
                        //required
                        name="pan_no"
                        type="text"
                        maxLength={40}
                        value={formData?.pan_no || ""}
                        onChange={(e) => handleChange("pan_no", e.target.value, e)}
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Pin Code"
                        //required
                        placeholder=""
                        name="emp_pin_no"
                        type="text"
                        //  maxLength={10}
                        value={formData?.emp_pin_no || ""}
                        onChange={(e) => handleChange("emp_pin_no", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Place Name of the Division"
                        name="place_desc"
                        placeholder=""
                        //required
                        type="text"
                        maxLength={20}
                        value={formData?.place_desc || ""}
                        onChange={(e) => handleChange("place_desc", e.target.value, e)}
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Std Code"
                        //required
                        placeholder=""
                        name="emp_std_code"
                        type="text"
                        maxLength={5}
                        value={formData?.emp_std_code || ""}
                        onChange={(e) => handleChange("emp_std_code", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Vendor Code"
                        //required
                        name="v_code"
                        type="text"
                        placeholder=""
                        maxLength={19}
                        value={formData?.v_code || ""}
                        onChange={(e) => handleChange("v_code", e.target.value, e)}
                    />


                </Col>

                <Col style={{ marginTop: '1.4rem' }}>
                    <TextField
                        label=""
                        name="v_name"
                        type="text"
                        placeholder=""
                        disabled
                        maxLength={60}
                        value={formData?.v_name || ""}
                        onChange={(e) => handleChange("v_name", e.target.value, e)}
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Telephone No"
                        // required
                        placeholder=""
                        name="emp_tel_phone"
                        type="number"
                        maxLength={10}
                        value={formData?.emp_tel_phone || ""}
                        onChange={(e) => {
                            handleChange("emp_tel_phone", value, e);
                        }}
                    />
                </Col>
                <Col>
                    <TextField
                        label="TDS Ass Range"
                        //required
                        name="tds_ass_range"
                        type="text"
                        placeholder=""
                        value={formData?.tds_ass_range || ""}
                        maxLength={60}
                        onChange={(e) =>
                            handleChange("tds_ass_range", e.target.value, e)
                        }
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Mobile No"
                        // required
                        placeholder=""
                        name="emp_mobile_no"
                        type="number"
                        maxLength={10}
                        value={formData?.emp_mobile_no || ""}
                        onChange={(e) => {
                            handleChange("emp_mobile_no", value, e);
                        }}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Signature Path"
                        name="emp_signature_path"
                        type="text"
                        placeholder=""
                        value={formData?.emp_signature_path || ""}
                        maxLength={100}
                        onChange={(e) =>
                            handleChange("emp_signature_path", e.target.value, e)
                        }
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Vat Signing Employee"
                        //required
                        placeholder=""
                        name="vat_signing_employee"
                        type="text"
                        value={formData?.vat_signing_employee || ""}
                        maxLength={100}
                        onChange={(e) =>
                            handleChange("vat_signing_employee", e.target.value, e)
                        }
                    />
                </Col>
                <Col>
                    <TextField
                        label="Vat Signing Status"
                        name="vat_signing_status"
                        type="text"
                        placeholder=""
                        value={formData?.vat_signing_status || ""}
                        maxLength={100}
                        onChange={(e) =>
                            handleChange("vat_signing_status", e.target.value, e)
                        }
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Drug Licence No"
                        // required
                        placeholder=""
                        name="drug_licence_no"
                        type="text"
                        maxLength={50}
                        value={formData?.drug_licence_no || ""}
                        onChange={(e) => handleChange("drug_licence_no", e.target.value, e)}
                    />
                </Col>
                <Col>
                    <TextField
                        label="Esi Acc No"
                        //required
                        name="esi_acc_no"
                        type="text"
                        placeholder=""
                        value={formData?.esi_acc_no || ""}
                        maxLength={20}
                        onChange={(e) => handleChange("esi_acc_no", e.target.value, e)}
                    />


                </Col>
            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Economic Act Code"
                        //required
                        placeholder=""
                        name="economic_act_code"
                        type="text"
                        value={formData?.economic_act_code || ""}
                        maxLength={50}
                        onChange={(e) =>
                            handleChange("economic_act_code", e.target.value, e)
                        }
                    />
                </Col>
                <Col>
                    <TextField
                        label="Esi Off Add"
                        //required
                        name="esi_off_add"
                        type="text"
                        placeholder=""
                        value={formData?.esi_off_add || ""}
                        maxLength={100}
                        onChange={(e) => handleChange("esi_off_add", e.target.value, e)}
                    />


                </Col>
            </Row>


            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Inv Declaration"
                        //required
                        placeholder=""
                        name="inv_declaration"
                        type="text"
                        value={formData?.inv_declaration || ""}
                        onChange={(e) =>
                            handleChange("inv_declaration", e.target.value, e)
                        }
                    />
                </Col>
                <Col>
                    <TextField
                        label="Project Based"
                        required
                        name="project_based"
                        type="text"
                        value={formData?.project_based || ""}
                        maxLength={1}
                        onChange={(e) =>
                            handleChange("project_based", e.target.value, e)
                        }
                    />


                </Col>
            </Row>



        </Form>
    )
}

export default TdsDetail
