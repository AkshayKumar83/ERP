import React, { useState } from "react";
import { Card, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";

const InvoiceQrCode = ({
    formData={},
    formStatus = '',
    isPrintInvQRModelOpen,
    togglePrintInvQRModal=()=>{},
    handleChange=()=>{},
}) => {
    return (
        <Modal isOpen={isPrintInvQRModelOpen} toggle={togglePrintInvQRModal} size="lg">
            <ModalHeader toggle={togglePrintInvQRModal}>
                INVOICE QR CODE
            </ModalHeader>
            <ModalBody>
                <Form id="print-invoice-qr-code">
                    <Card className="p-2 px-3">
                        <Row>
                            <Col xl={6}>
                                <RadioGroup
                                className="mt-2 radio-button-wrapper d-flex flex-row "
                                options={[{ text: "ASN", value: "P" },{ text: "Other Details", value: "A" },]}
                                onChange={(e) => handleChange("asn_flag", e.target.value)}
                                checked={formData?.asn_flag || "P"}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1" >
                            <Col xl={10}>
                                <TextField
                                    label='ASN No'
                                    name='asn_number'
                                    value={formData?.asn_number || ""}
                                    onChange={()=>{handleChange()}}
                                />
                            </Col>
                        </Row>
                        <Row  className="mt-1">
                            <Col xl={10}>
                                <TextField
                                    label='E Invoice QR Code'
                                    name='qr_code'
                                    value={formData?.qr_code || ""}
                                    onChange={()=>{handleChange()}}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col xl={10}>
                                <TextField
                                    label='IRN No'
                                    name='irn_no'
                                    value={formData?.irn_no || ""}
                                    onChange={()=>{handleChange()}}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Form>
            </ModalBody>
            <ModalFooter className=" d-flex flex-row">
                <Row style={{width:'100%'}}>
                    <Col xl={6}>
                        <ButtonUi color="secondary" onClick={togglePrintInvQRModal} >
                            Return
                        </ButtonUi>
                    </Col>
                    <Col xl={6}>
                        <ButtonUi color="secondary" >
                            Continue
                        </ButtonUi>
                    </Col>
                </Row>
            </ModalFooter>
        </Modal>
    );
};

export default InvoiceQrCode;
