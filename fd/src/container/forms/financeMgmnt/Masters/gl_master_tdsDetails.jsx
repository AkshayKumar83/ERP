import React from 'react'
import { Form, Row, Col, Card } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Checkbox from '../../../../components/basic/checkbox'
import Select from '../../../../components/basic/select'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'

const TdsDetails = ({ formData, formStatus, tdsDetailData, handleChange }) => {
    return (
        <React.Fragment>
            <div className="text-wrapper box-border p-1">
                <span className="text-label">Address Details For TDS Certificate</span>

                <Row>
                    <Col xl={5} className='m-auto'>
                        <TextField
                            label="Name"
                            type="text"
                            name="transporter_name"
                            value={tdsDetailData?.transporter_name || ""}
                            onChange={(e) => handleChange( "tdsDetailData","transporter_name", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col xl={5} className='m-auto'>
                        <TextField
                            label="Address 1"
                            type="text"
                            name="transporter_add1"
                            value={formData?.transporter_add1 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","transporter_add1", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col xl={5} className='m-auto'>
                        <TextField
                            label="Address 2"
                            type="text"
                            name="transporter_add2"
                            value={formData?.transporter_add2 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","transporter_add2 ", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col xl={5} className='m-auto'>
                        <TextField
                            label="Address 3"
                            type="text"
                            name="transporter_add3"
                            value={formData?.transporter_add3 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","transporter_add3", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col xl={5} className='m-auto'>

                        <Row>
                            <Col xl={8}>
                                <TextField
                                    label="City"
                                    type="text"
                                    name="city_name"
                                    value={formData?.city_name || ""}
                                      onChange={(e) => handleChange( "tdsDetailData","city_name", e.target.value)}
                                />
                            </Col>

                            <Col xl={4} className=''>
                                <TextField
                                    label="Pin Code"
                                    type="text"
                                    name="zip_code"
                                    value={formData?.zip_code || ""}
                                      onChange={(e) => handleChange( "tdsDetailData","zip_code", e.target.value)}
                                />
                            </Col>

                        </Row>

                    </Col>

                </Row>

                <Row className='mt-1'>
                    <Col className='m-auto' xl={5}>
                        <TextField
                            label="Telephone 1"
                            type="text"
                            name="telephone1"
                            value={formData?.telephone1 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","telephone1", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col className='m-auto' xl={5}>
                        <TextField
                            label="Telephone 2"
                            type="text"
                            name="telephone2"
                            value={formData?.telephone2 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","telephone2", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col className='m-auto' xl={5}>
                        <TextField
                            label="Fax"
                            type="text"
                            name="fax"
                            value={formData?.fax || ""}
                              onChange={(e) => handleChange( "tdsDetailData","fax", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col className='m-auto' xl={5}>
                        <TextField
                            label="Contact Person 1"
                            type="text"
                            name="con_per1"
                            value={formData?.con_per1 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","con_per1", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col className='m-auto' xl={5}>
                        <TextField
                            label="Contact Person 2"
                            type="text"
                            name="con_per2"
                            value={formData?.con_per2 || ""}
                              onChange={(e) => handleChange( "tdsDetailData","con_per2", e.target.value)}
                        />
                    </Col>

                </Row>

                <Row className='mt-1'>
                    <Col className='m-auto' xl={5}>
                        <TextField
                            label="PAN Number"
                            type="text"
                            name="pan_no"
                            value={formData?.pan_no || ""}
                              onChange={(e) => handleChange( "tdsDetailData","pan_no", e.target.value)}
                        />
                    </Col>

                </Row>

                <Row className='mt-1'>

                    <Col xl={4} className='m-auto'>
                        <div className="text-wrapper box-border p-1 mt-3">
                            <span className="text-label">TDS Category</span>
                            <RadioGroup
                                className="radio-button-wrapper"
                                options={[
                                    { text: "Company", value: "C" },
                                    { text: "Non-company", value: "N" },
                                ]}
                                 onChange={(e) => handleChange( "tdsDetailData","tds_cat", e.target.value)}
                                checked={formData?.tds_cat || ""}
                            />
                        </div>
                    </Col>

                </Row>


            </div>

        </React.Fragment>
    )
}

export default TdsDetails