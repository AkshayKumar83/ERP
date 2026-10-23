import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import TextArea from "../../../../components/basic/textArea"
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const PoTerms = ({formData, handleChange}) => {
  return (
   <Form id = "division-master-po-form"> 
    <Row>
        <Col xl = {8}  style = {{margin: 'auto'}}> 
        <TextArea 
              label = "PO Terms and Condition"
              name="po_term"
              maxLength = {4000}
              value={formData?.po_term || ""}
              onChange={(e) => handleChange("po_term", e.target.value, e)}
            />
        </Col>
    </Row> 

    <Row  className = 'mt-1'>
        <Col xl = {8}  style = {{margin: 'auto'}}> 
        <TextArea 
        label ="PO Schedule Terms and Condition"
              //required
              placeholder=""
              name="po_sch_term"
              type="text"
              value={formData?.po_sch_term|| ""}
              maxLength = {4000}
              onChange={(e) => handleChange("po_sch_term", e.target.value, e)}
             
            />
        </Col>
    </Row>

   </Form>
  )
}

export default PoTerms
