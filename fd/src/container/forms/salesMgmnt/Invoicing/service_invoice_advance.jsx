import React from "react";
import { Card, Col, Form, Row, Container } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";

const ServiceInvAdvance = ({ formData = {},formStatus, handleChange = () => {}, handleChangeTab }) => {
  const taxFields = [
    { label: "SGST", key: "gst_sgst_val_a" },
    { label: "CGST", key: "gst_cgst_val_a" },
    { label: "IGST", key: "gst_igst_val_a" },
    { label: "UGST", key: "gst_ugst_val_a" },
    { label: "CESS", key: "total_comp_cess" },
  ];

  return (
    <Container className="d-flex justify-content-center"> {/* Centers the card */}
      <Form id="service-inv-adv-form">
        <Card className="p-3 shadow-sm w-auto mx-auto text-center text-wrapper"> {/* Adjusts width */}
        <span className='text-label'>Advance Detail</span>

          {/* Row for Voucher Details */}
          <Row className="gx-2 gy-2 justify-content-start">
            <Col xs="auto">
              <TextField
                type="text"
                label="Advance Voucher No."
                value={formData.advance_voucher_no || ""}
                onChange={(e) => handleChange("advance_voucher_no", e)}
              />
            </Col>
            <Col xs="auto">
              <TextField
                type="date"
                label="Date"
                value={formData.advance_voucher_date || ""}
                onChange={(e) => handleChange("advance_voucher_date", e)}
              />
            </Col>
            <Col xs="auto">
              <TextField
                type="text"
                label="Amount"
                value={formData.gst_advance_adjusted || ""}
                onChange={(e) => handleChange("gst_advance_adjusted", e)}
              />
            </Col>
          </Row>

          {/* Row for Tax Details */}
          <Row className="gx-2 gy-2 mt-2 justify-content-center">
            {taxFields.map((field) => (
              <Col key={field.key} xs="auto">
                <TextField
                  type="text"
                  label={field.label}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e)}
                />
              </Col>
            ))}
          </Row>
        </Card>
        <Row className="mt-3 d-flex justify-content-end">
            <Col xl={2} className="">
                <ButtonUi color="secondary" outline onClick={()=>handleChangeTab('Main')}>
                    MAIN INFO
                </ButtonUi>
            </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ServiceInvAdvance;
