import React from 'react'
import { Form, Row, Col, Card } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import { handleValidateDetailField, } from './gl_master_helper'


const GlMasterDetail = ({ formStatus, handleChange =()=>{}, formDetailData = [{}],   }) => {
    return (
        
 < Form id="gl-master-detail-form">
        <Card className="mb-2 p-3 shadow-sm mt-4">
            <div className="text-wrapper box-border mt-2 mb-2">
               
                    <Row className='mt-2 mb-2'>
                        <Col xl={2}>
                            <TextField 
                                label="Year Opening Balance"
                                type="number"
                                id='yr_op_bal'
                                name="yr_op_bal"
                                // value={formDetailData[0]?.yr_op_bal || ""}
                                value={formDetailData[0]?.yr_op_bal ?? "0.00"}
                                onChange={(e) => handleChange("yr_op_bal", e.target.value, e)}
                                onBlur={(e)=>handleValidateDetailField(e,formStatus)}
                                required
                            />
                        </Col>

                        <Col xl={2} className='mt-3'>
                            <RadioGroup
                                className="mt-2 radio-button-wrapper box-border"
                                options={[
                                    { text: "Credit", value: "C" },
                                    { text: "Debit", value: "D" },
                                ]}
                                onChange={(e) => handleChange("yr_db_cr", e.target.value,  e)}
                                checked={formDetailData[0]?.yr_db_cr || "C"}
                                required
                            />
                        </Col>

                        <Col xl={2} className="">
                    <label className="">Account Status</label>
                    <RadioGroup
                        className="radio-button-wrapper box-border"
                        options={[
                            { text: "Active", value: "Y" },
                            { text: "Inactive", value: "N" },
                        ]}
                        onChange={(e) => handleChange("active", e.target.value, e)}
                        checked={formDetailData[0]?.active || "Y"}
                        required
                    />
                </Col>
                 <Col xl={2}>
                            <TextField style = {{textAlign: 'right'}}
                                label="Current Balance"
                                type="number"
                                name="cur_bal"
                                // value={formDetailData[0]?.cur_bal || ""}
                                value={formDetailData[0]?.cur_bal ?? ""}
                                onChange={(e) => handleChange("cur_bal", e.target.value, e)}
                                disabled
                            />
                        </Col>

                        <Col xl={2} className='mt-3'>
                            <RadioGroup
                                className="mt-2 radio-button-wrapper box-border"
                                options={[
                                    { text: "Credit", value: "C" },
                                    { text: "Debit", value: "D" },
                                ]}
                                onChange={(e) => handleChange("cur_db_cr", e.target.value, e)}
                                checked={formDetailData[0]?.cur_db_cr || "C"}
                            />
                        </Col>

                        <Col xl={2}>
                            <TextField
                                label="Date"
                                type="date"
                                name="cur_bal_dt"
                                value={formDetailData[0]?.cur_bal_dt || ""}
                                onChange={(e) => handleChange("cur_bal_dt ", e.target.value, e)}
                                disabled
                            />
                        </Col>
                    </Row>

                    <Row>
                       
                    </Row>
               
            </div>

        </Card>
        </Form>



    )
}

export default GlMasterDetail
