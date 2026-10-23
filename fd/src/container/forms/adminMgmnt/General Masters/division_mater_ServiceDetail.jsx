import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const ServiceTaxDetail = ({formData, handleChange,}) => {
  return (
   <Form id = "division-master-service-form">
    <Row>
        <Col xl={4} style = {{margin: 'auto'}}>
        <TextField 
        label='Service Tax Regn No'
              //required
              placeholder=""
              name="serv_tax_no"
              type="text"
              value={formData?.serv_tax_no || ""}
              maxLength = {20}
              onChange={(e) => handleChange("serv_tax_no", e.target.value, e)}
            />
        </Col>
    </Row>  

    <Row  className = 'mt-1'>
        <Col xl= {4} style = {{margin: 'auto'}}> 
        <TextField 
              label = 'STC No'
              //required
              placeholder=""
              name="serv_tax_reg_no"
              type="text"
              value={formData?.serv_tax_reg_no || ""}
              maxLength = {50}
              onChange={(e) => handleChange("serv_tax_reg_no", e.target.value, e)}
            />
        </Col>
    </Row>  

    <Row  className = 'mt-1'>
        <Col xl = {4} style = {{margin: 'auto'}}> 
        <TextField
              //required 
              label = 'Date'
              placeholder=""
              name="serv_tax_reg_dt"
              type="date"
              value={formData?.serv_tax_reg_dt || ""}
              onChange={(e) => handleChange("serv_tax_reg_dt", e.target.value)}
            />
        </Col>
    </Row> 


   </Form>
  )
}

export default ServiceTaxDetail;


