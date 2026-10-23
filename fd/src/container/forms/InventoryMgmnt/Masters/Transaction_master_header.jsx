import React from 'react'
import { Col, Row, Form,Card, Container } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Checkbox from '../../../../components/basic/checkbox'
import { DescHelpListHeader, fromHelpListHeader, handleValidateField, toHelpListHeader } from './Transaction_master_helper'

const TransactionMasterHeader = ({formData, handleChange,formStatus,handleHelpList = () => {},
setHelpFor,setHelpListHeader}) => {

  const handleDoubleClick = (field, header) => {
    if(['Insert',"Search",'Update'].includes(formStatus)) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };


  return (
  <Form id='trans-mstr'>
 <div className="d-flex justify-content-center mt-4">
  <Card className="w-50 mt-4">
  <Container>
  <Row className='mt-3'>
  <Col  xl={12} className="mt-sm-3 mt-md-3 mt-lg-0">
          <div className="text-wrapper">
            <span className="text-label">Transaction Type</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "OK-Receipt", value: "1" },
                { text: "OK-Issue", value: "2" },
                { text: "Rejection-Receipt", value: "3" },
                { text: "Rejection-Issue", value: "4" },
              ]}
               onChange={(e) => handleChange("type", e.target.value,e)}
               checked={String(formData?.type || "1")}
            />

          </div>
        </Col>
  </Row>

  <Row className='mt-1'>
    <Col xl={4} className='mt-4'>
         <TextField
                type="number"
                name='trans_code'
                 value={formData?.trans_code || ""}
                onChange={(e) => handleChange("trans_code", e.target.value,e)}
                // disabled = {formStatus !="Search"}
                disabled
              />
        </Col>
<Col xl={8} className=''>
         <TextField
                type="text"
                name='type_desc'
                label="Description"
                 value={formData?.type_desc || ""}
                onChange={(e) => handleChange("type_desc", e.target.value,e)}
               onDoubleClick={() => {
                if (formStatus === "Search") {
                handleDoubleClick("Desc", DescHelpListHeader);
                  } 
                }}
                required
              />
        </Col>

  </Row>
  

  <Row className='mt-1'>
    <Col xl={4} className=''>
         <TextField
                type="text"
                 label="From Site"
                 name='from_wc_no'
                 value={formData?.from_wc_no || ""}
                onChange={(e) => handleChange("from_wc_no", e.target.value,e)}
                 onDoubleClick={() => handleDoubleClick("from", fromHelpListHeader)}
                 onBlur = {(e) => handleValidateField(e, formStatus)}
                 required
              />
        </Col>
<Col xl={8} className='mt-4'>
         <TextField
                type="text"
                //  label="From Site"
                 value={formData?.from_desc || ""}
                onChange={(e) => handleChange("from_desc", e.target.value,e)}
                disabled
              />
        </Col>

  </Row>

  <Row>
    <Col xl={4} className=''>
         <TextField
                type="text"
                 label="To Site"
                 name='to_wc_no'
                 value={formData?.to_wc_no || ""}
                onChange={(e) => handleChange("to_wc_no", e.target.value,e)}
                 onDoubleClick={() => handleDoubleClick("to", toHelpListHeader)}
                 onBlur = {(e) => handleValidateField(e, formStatus)}
                 required
              />
        </Col>
<Col xl={8} className='mt-4'>
         <TextField
                type="text"
                //  label="From Site"
                 value={formData?.to_desc || ""}
                onChange={(e) => handleChange("to_desc", e.target.value,e)}
                disabled
              />
        </Col>
  </Row>

  <Row>
     <Col xl={7} className='mt-2'>
            <Checkbox
              text="Authorisation Require for this Movement"
              checked={formData?.authorised_req === "Y"}
              onChange={(e) => handleChange("authorised_req", e.target.checked ? "Y" : "N")}
            />
          </Col>
     <Col xl={4} className='mt-2'>
           <Checkbox
            text="Production Delivery"
            onChange={(e) => handleChange("prdn_dlvry_flag", e.target.checked ? "Y" : "N")}
            checked={formData?.prdn_dlvry_flag === "Y"}
          />
          </Col>
  </Row>
  
</Container>

 </Card>
</div>
  </Form>
  )
}

export default TransactionMasterHeader
