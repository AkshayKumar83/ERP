import React from "react";
import { Container } from "react-bootstrap";
import TextField from "../../../../components/basic/textField";
import { Row, Col, Form } from "reactstrap";
import TextArea from "../../../../components/basic/textArea";
import Checkbox from "../../../../components/basic/checkbox";
import { termCodeHelpListHeader, validateTermDesc } from "./payment_term_sale_helper";

const PaymentTermSaleHeader = ({ formData, handleChange, formStatus, handleHelpList = () => {},
  setHelpFor,setHelpListHeader}) => {

const handleDoubleClick = (field, header) => {
  if (formStatus === "Search") {  
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
  }
};



  return (
    <>
      <Container>
        <Form id='payment-term-head-form'>
        <Row>
          <Col sm={6} md={3} xl={1}>
            <TextField
              type="number"
              label="Code"
              value={formData?.term_code ?? ""}
              onChange={(e) => handleChange("term_code", e.target.value,null,e)}
             disabled={formStatus !=="Search"}
             onDoubleClick={() => handleDoubleClick("Code", termCodeHelpListHeader)}
             
            />
          </Col>
           <Col sm={6} md={6} lg={2} className="button-group-wrapper mt-4 ms-4">
            <Checkbox
              text="Letter of Credit"
              onChange={(e) => handleChange("lc", e.target.checked ? "Y" : "N",null,e)}
              checked={formData?.lc === "Y"}
            />
          </Col>
        </Row>
        <Row className="mt-1">
          <Col sm={12} md={12} lg={12}>
            <TextArea
            type="text"
            id="term_desc"
            name="term_desc"
            label="Description"
            value={formData?.term_desc || ""}
            onChange={(e) => handleChange("term_desc", e.target.value,null,e)}
             onBlur={(e) => validateTermDesc(e,formStatus)}
            
            required
          />
          </Col>
        </Row>
        <Row>
         
        </Row>
        </Form>
      </Container>
    </>
  );
};

export default PaymentTermSaleHeader;
