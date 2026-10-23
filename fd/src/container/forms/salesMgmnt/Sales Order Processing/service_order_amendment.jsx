import React from 'react'
import { Col, Form, Row } from 'reactstrap'
import TextArea from '../../../../components/basic/textArea'
import ButtonUi from '../../../../components/basic/button'

const ServiceOrderAmendment = ({
    amdntFormData = {},
    handleChange = () => {},
    handleChangeTab = () => {},
}) => {
  return (
    <Form>
<Row className="d-flex justify-content-center">
  <Col lg={2} className="d-flex justify-content-center border border-dark bg-secondary text-dark fw-bold px-3 py-1 rounded">
    <span>Amendment Reason</span>
  </Col>
</Row>
     <Row>
        <Col  md ={12} lg={12}>
          <TextArea
            label="Amend Reason Customer"
            value={amdntFormData.amd_reason1_cust || ""}
            onChange={(e) => handleChange("amd_reason1_cust", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col  md ={12} lg={12}>
          <TextArea
            label="Amend Reason Internal"
            value={amdntFormData.amd_reason2_Internal || ""}
            onChange={(e) => handleChange("amd_reason2_Internal", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-2">
    <div className="d-flex justify-content-center">
    <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Main')}}> Main Details </ButtonUi>
       
    </div>

</Row>
      
    </Form>
  )
}

export default ServiceOrderAmendment