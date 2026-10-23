import React from 'react'
import { Row, Col, Form, Table, Card } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'


const CalendarDtl = ({ formData, formStatus, handleChange }) => {
    return (
        <React.Fragment>
            <Row>
                <Col xl={4} className='m-auto'>
                    <Select
                        label=""
                        value={formData.fin_year || ""}
                        onChange={(e) => handleChange("fin_year", e.target.value)}
                    />

                </Col>

            </Row>
            <Row>
                <Col xl={6} className='m-auto'>

                    <Form id="finance-section-form">
                        <div className='box-border d-flex justify-content-center'>
                            <span style={{ color: '#00008b', fontWeight: 'bold' }}>HOLIDAYS/CALENDAR GENERATION</span>

                        </div>
                    </Form>

                </Col>
            </Row>

            <Row className='mt-2'>
                <Col xl={8} className='m-auto'>
                    <Card className="mb-2 p-1 shadow-sm">

                        <div className="d-flex flex-column">
                            <Row className="w-100 d-flex align-items-center">
                                <Col xs="auto">
                                    <ButtonUi color="secondary">Prev</ButtonUi>
                                </Col>
                                <Col className='mt-1' xl={3}>
                                    <Select
                                        label=""
                                        value={formData.listofmonths || ""}
                                        onChange={(e) => handleChange("listofmonths", e.target.value)}
                                    />
                                </Col>
                                <Col xl={2}>
                                    <TextField
                                        label=""
                                        value={formData.dispyear || ""}
                                        onChange={(e) => handleChange("dispyear", e.target.value)}
                                    />
                                </Col>

                                <Col xs="auto" className="d-flex align-items-center gap-5">
                                    <ButtonUi color="secondary">Next</ButtonUi>
                                    <span>Weekly Holiday</span>
                                </Col>
                            </Row>
                        </div>

                        <Row className='mt-1'>
                            <Col xl={8}>
                                <Row className="w-100 d-flex justify-content-center g-0"> {/* Remove spacing */}
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                                        <Col key={index} xs="auto" className="p-0"> {/* Remove padding */}
                                            <ButtonUi
                                                style={{
                                                    backgroundColor: "#E0E0E0", color: "#000", border: "1px solid #ccc",
                                                    width: "50px",
                                                    height: "40px",
                                                    textAlign: "center"
                                                }}
                                            >
                                                {day}
                                            </ButtonUi>
                                        </Col>
                                    ))}
                                </Row>

                                {[...Array(6)].map((_, rowIndex) => (
                                    <Row key={rowIndex} className="w-100 d-flex justify-content-center g-0"> {/* Remove spacing */}
                                        {[...Array(7)].map((_, colIndex) => (
                                            <Col key={colIndex} xs="auto" className="p-0"> {/* Remove padding */}
                                                <ButtonUi
                                                    style={{
                                                        backgroundColor: "#E0E0E0", color: "#000", border: "1px solid #ccc",
                                                        width: "50px",
                                                        height: "40px",
                                                    }}
                                                >
                                                    {/* Empty Button */}
                                                </ButtonUi>
                                            </Col>
                                        ))}
                                    </Row>
                                ))}
                            </Col>


                            <Col className='' xl={3}>
                                <div className='box-border p-2'>

                                    <Row className=''>
                                        <Col className="button-group-wrapper ">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow1", e.target.checked ? "Y" : "N")}
                                                text="Sunday"
                                                checked={formData?.dow1 === "Y"}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="button-group-wrapper ">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow2", e.target.checked ? "Y" : "N")}
                                                text="Monday"
                                                checked={formData?.dow2 === "Y"}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="button-group-wrapper ">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow3", e.target.checked ? "Y" : "N")}
                                                text="Tuesday"
                                                checked={formData?.dow3 === "Y"}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="button-group-wrapper ">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow4", e.target.checked ? "Y" : "N")}
                                                text="Wednesday"
                                                checked={formData?.dow4 === "Y"}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="button-group-wrapper ">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow5", e.target.checked ? "Y" : "N")}
                                                text="Thrusday"
                                                checked={formData?.dow5 === "Y"}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="button-group-wrapper ">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow6", e.target.checked ? "Y" : "N")}
                                                text="Friday"
                                                checked={formData?.dow6 === "Y"}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className='mt-3'>
                                        <Col className="button-group-wrapper">
                                            <Checkbox
                                                onChange={(e) => handleChange("dow7", e.target.checked ? "Y" : "N")}
                                                text="Saturday"
                                                checked={formData?.dow7 === "Y"}
                                            />
                                        </Col>
                                    </Row>

                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={2} className="">
                                <span style={{ fontSize: '14px' }}>CURRENTDATE</span>
                            </Col>
                        </Row>


                    </Card>
                </Col>

            </Row>
            <Row className="d-flex justify-content-center">
                <Col xl={5} className="d-flex align-items-center justify-content-center">
                    <label className="me-2">Holiday Description</label>
                    <TextField
                        style={{ flexGrow: 1, width: "220px" }} // Ensures full width
                        value={formData.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </Col>
                <Col xl={2}>
                    <Checkbox
                        onChange={(e) => handleChange("nh_flag", e.target.checked ? "Y" : "N")}
                        text="National Holiday"
                        checked={formData?.nh_flag === "Y"}
                    />
                </Col>
            </Row>




        </React.Fragment>
    )
}

export default CalendarDtl

