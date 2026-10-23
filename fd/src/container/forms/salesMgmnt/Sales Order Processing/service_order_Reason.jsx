import React from "react";
import { Col, Form, Row } from "reactstrap";
import TextArea from "../../../../components/basic/textArea";
import ButtonUi from "../../../../components/basic/button";

const ServiceOrderReason = ({
  reasonFormData,
  formStatus,
  handleChange = () => {},
  handleChangeTab = () => {},
}) => {
  return (
    <Form>
      <Row className="d-flex justify-content-center">
        <Col lg={4} className="d-flex justify-content-center">
          <span className="border border-secondary bg-secondary text-white px-3 py-2 text-center d-inline-block">
            Amendment Reason
          </span>
        </Col>
      </Row>

      <Row>
        <Col>
          <TextArea
            type="text"
            label="Amend reason Customer"
            value={reasonFormData.amd_reason1_cust || ""}
            onChange={(e) => handleChange("amd_reason1_cust", e.target.value)}
          />
        </Col>
      </Row>
      <Row>
        <Col >
          <TextArea
            type="text"
            label="Amend reason Internal"
            value={reasonFormData.amd_reason2_internal || ""}
            onChange={(e) => handleChange("amd_reason2_internal", e.target.value) }
          />
        </Col>
      </Row>
      <Row className="mt-2 ">
        <Col className="d-flex justify-content-center">
          <ButtonUi type="button" color="dark" outline onClick={() => {handleChangeTab("Main") }}>
            Main Details
          </ButtonUi>
        </Col>
      </Row>
    </Form>
  );
};

export default ServiceOrderReason;
