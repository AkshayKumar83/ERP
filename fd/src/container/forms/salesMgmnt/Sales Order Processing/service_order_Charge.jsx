import React from "react";
import { Card, Col, Form, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";

const ServiceOrderCharge = ({
  chrgFormData,
  formStatus,
  handleChange = () => {},
  handleChangeTab = () => {},
}) => {
  return (
    <Form>
      <Card className="mt-4 w-75 d-flex justify-content-center mx-auto">
        <Row className="d-flex justify-content-evenly p-4">
          <Col lg={3}>
            <Row>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                onChange={(e) => handleChange("ins_flag", e.target.value)}
                checked={chrgFormData?.ins_flag || " "}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                onChange={(e) => handleChange("ins_amt_prc", e.target.value)}
                checked={chrgFormData?.ins_amt_prc || " "}
              />
            </Row>
          </Col>
          <Col lg={3}>
            <Row>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                onChange={(e) => handleChange("frt_flag", e.target.value)}
                checked={chrgFormData?.frt_flag || " "}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                onChange={(e) => handleChange("frt_amt_prc", e.target.value)}
                checked={chrgFormData?.frt_amt_prc || " "}
              />
            </Row>
          </Col>
          <Col lg={3}>
            <Row>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                onChange={(e) => handleChange("octroi_flag", e.target.value)}
                checked={chrgFormData?.octroi_flag || " "}
              />
            </Row>
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

export default ServiceOrderCharge;
