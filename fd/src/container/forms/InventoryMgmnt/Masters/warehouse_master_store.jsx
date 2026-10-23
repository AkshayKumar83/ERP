import React from "react";
import { Col, Container, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";

const WarehouseMasterStore = ({ formData, handleChange, formStatus }) => {
  return (
    <Container>
      <Row className="">
        <Col lg={12}>
          <Row className="justify-content-center align-items-center">
            {/* Store No. Input Field */}
            <Col sm={6} md={4} lg={4} className="d-flex justify-content-center">
              <div className="border p-2 bg-light rounded w-100">
                <TextField
                  type="text"
                  label="Store No."
                  value={formData?.store_no || ""}
                  onChange={(e) => handleChange("store_no", e.target.value)}
                  disabled
                />
              </div>
            </Col>

            {/* Radio Button Group */}
            {/* <Col md={6} lg={6} className="mt-3 d-flex justify-content-center">
        <RadioGroup
          className="radio-button-wrapper"
          options={[{ text: "Assembly Line", value: "L" }]}
           onChange={(e) => handleChange('formData', "store_type", e.target.value)}
          checked={formData?.store_type || " "}
        />
      </Col> */}
          </Row>
        </Col>
      </Row>

      <Row className="text-wrapper mt-3">
        <Col md={12} lg={12}>
          <span className="text-label ms-3">Store Type</span>
          <div className="border rounded ">
            <Row className="mt-1 p-2">
              {/* Column 1 */}
              <Col lg={4}>
                <div className="d-flex flex-column  align-items-start">
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "General", value: "G" }]}
                    onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type|| "G"}
                  />
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "Scrap", value: "C" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "Excise Godown", value: "E" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                </div>
              </Col>

              {/* Column 2 */}
              <Col lg={4}>
                <div className="d-flex flex-column  align-items-start">
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "Party Work Center", value: "P" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "Floor Stock", value: "F" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "Service Cell (D3)", value: "S" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                </div>
              </Col>

              {/* Column 3 */}
              <Col lg={4}>
                <div className="d-flex flex-column  align-items-start">
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "Receiving Store", value: "R" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                  <RadioGroup
                    name="store_type"
                    className="radio-button-wrapper"
                    options={[{ text: "57F4", value: "5" }]}
                     onChange={(e) => handleChange('formData', "store_type", e.target.value)}
                    checked={formData?.store_type}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        
      </Row>
    </Container>
  );
};

export default WarehouseMasterStore;
