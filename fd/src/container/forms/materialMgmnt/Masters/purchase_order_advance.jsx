import React, { useState } from 'react'
import { Col, Container, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import { purchaseOrderItemHeader } from './purchase_order_helper';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import RadioGroup from '../../../../components/basic/radioGroup';
import Select from '../../../../components/basic/select';
import TextArea from '../../../../components/basic/textArea';

const PurchaseOrderAdvance = ({ 
    formStatus = "",
    handleChange = () => { },
    formData, 
}) => {
    const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
    return (
        <Form id="purchase-order-advance-form">
            <Container>
                <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                    <span className="text-label">Advance</span>

                    <Row className='ms-4 me-4 mt-2'>
                        <Col md={6} lg={2}>
                            <TextField
                                type="text"
                                label="PO No"
                                value={formData.po_no || ""}
                                onChange={(e) => handleChange("po_no", e.target.value, e)}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row className='mt-2 ms-4'>
                        <Col md={2} className="button-group-wrapper ">
                            <TextField
                                type="text"
                                label="Item Code"
                                value={formData.it_code || ""}
                                onChange={(e) => handleChange("it_code", e.target.value, e)}
                                disabled
                            />
                        </Col>
                        <Col xl = {5} className="">
                            <TextField
                                type="text"
                                label="Item Name"
                                value={formData.desc || ""}
                                onChange={(e) => handleChange("desc", e.target.value, e)}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row className=' mt-2 ms-4'>
                        <Col className="">
                            <RadioGroup
                                className="mt-2 radio-button-wrapper box-border Transaction-height"
                                options={[{ text: "Single Adjustment", value: "S" },{ text: "Replica Adjustment", value: "R" }]}
                                onChange={(e) =>handleChange( "installment_type", e.target.value, focusedRowIndex, e)}
                                checked={formData[focusedRowIndex]?.installment_type || "%"}
                            />
                        </Col>
                        <Col className="">
                            <RadioGroup
                                className="mt-2 radio-button-wrapper box-border Transaction-height"
                                options={[{ text: "Rate/Pc", value: "R" },{ text: "%Age", value: "A" },{ text: "Times", value: "T" }]}
                                onChange={(e) =>handleChange( "installment_sub_type", e.target.value, focusedRowIndex, e)}
                                checked={formData[focusedRowIndex]?.installment_sub_type || "R"}
                            />
                        </Col>

                    </Row>
                    <Row className="ms-4 me-4 mt-1">
                        <Col>
                            <TextField
                                //maxLength={40}
                                type="number"
                                label="Rate per Unit"
                                value={formData.rate_per_unit || ""}
                                onChange={(e) =>handleChange("rate_per_unit", e.target.value, e)}
                            />
                        </Col>

                        <Col className="mt-2">
                            <RadioGroup
                                className="mt-2 radio-button-wrapper box-border Transaction-height"
                                options={[ { text: "Deduction", value: "R" }, { text: "Extra Paid", value: "A" }]}
                                onChange={(e) =>handleChange( "ded_ex_paid", e.target.value, focusedRowIndex, e)}
                                checked={formData[focusedRowIndex]?.ded_ex_paid || "R"}
                            />
                        </Col>

                       
                        <Col xl={3} className="d-flex justify-content-start align-items-center gap-2">
                            <ButtonUi>--</ButtonUi>
                            <ButtonUi>--</ButtonUi>
                        </Col>
                    </Row>

                    <Row className='ms-4 me-4 mt-1'> 
                        <Col xl = {2}>
                            <TextField
                                type="number"
                                label="Amount Limit"
                                value={formData.amount_limit || ""}
                                onChange={(e) =>handleChange("amount_limit", e.target.value, e)}
                            />
                        </Col>
                        <Col xl = {6}>
                            <TextField
                                maxLength={200}
                                type="text"
                                label="Remarks"
                                value={formData.remarks || ""}
                                onChange={(e) => handleChange("remarks", e.target.value, e)}
                            />
                        </Col>

                    </Row>
                </div>
            </Container>

        </Form>
    )
}

export default PurchaseOrderAdvance