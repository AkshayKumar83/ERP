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

const PurchaseOrderAmend = ({ 
    formStatus = "",
    handleChange = () => {},
    formData,
}) => {

    const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

    return (
        <Form id="purchase-order-advance-form">
            <Container>

                <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                    <Row className='ms-4 me-4 mt-2'>
                        <Col xl={5}>
                            <TextField
                                type="text"
                                label="PO No"
                                value={formData.po_no || ""}
                                onChange={(e) => handleChange("po_no", e.target.value, e)}
                            //disabled
                            />
                        </Col>
                    </Row>

                    <Row className='mt-4 ms-4 '>
                        <Col xl={6} className="d-flex justify-content-start align-items-center gap-3">
                            <ButtonUi>OK</ButtonUi>
                            <ButtonUi>Cancel</ButtonUi>
                        </Col>
                    </Row>
                </div>


            </Container>

        </Form>
    )
}

export default PurchaseOrderAmend