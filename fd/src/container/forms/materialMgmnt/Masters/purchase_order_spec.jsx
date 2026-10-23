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

const PurchaseOrderSpec = ({ formStatus = "",
    handleChange = () => { },
    formData, }) => {


    const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

    return (
        <Form id="purchase-order-advance-form">
            <Container>
                <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                    <span className="text-label">Specification</span>

                    <Row className='ms-4 me-4 mt-2'>
                        <Col>
                            <TextArea
                                type="text"
                                label="Specification"
                                value={formData.spec || ""}
                                onChange={(e) => handleChange("spec", e.target.value, e)}
                                //disabled
                            />
                        </Col>
                    </Row>

                </div>
            </Container>

        </Form>
    )
}

export default PurchaseOrderSpec