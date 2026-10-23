import React from 'react'
import { Container, Row, Col} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Checkbox from '../../../../components/basic/checkbox'

const SupplierMasterGSTTab = ({formData, formStatus, handleChange}) => {

  
  const handleFieldChange = (name, value, e) => {
    // const { name, type, checked, value } = e.target;
    // const fieldValue = type === 'checkbox' ? (checked ? 'Y' : 'N') : value;
    const fieldValue = value

    handleChange(name, value, e);

    if (name === 'whether_gst_registered_dlr' && (formStatus === 'Insert'|| formStatus === 'Update')) {
      if (fieldValue === 'N') {
        // handleChange({ target: { name: 'gst_no', value: 'NA' } });
        handleChange('gst_no', 'NA', e);
      } else {
        // handleChange({ target: { name: 'gst_no', value: '' } });
        handleChange('gst_no', '', e);
      }
    }
  };


   const handleGstNoBlur = () => {
    const isValid = validateGstNo(formData);
    if (!isValid) {
      document.querySelector('#gst_no').focus();
    }
  };

  return (
    <Container>
    <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
        <span className="text-label">GST</span>
       
        <Row className='ms-4 me-4 mt-2'>
          <Col md={6} lg={2}>
            <TextField
              type="text"
              label="GST State Code"
              value={formData?.gst_state_code || ""}
              onChange={(e) => handleFieldChange("gst_state_code", e.target.value, e)}
              disabled
            />
          </Col>
        </Row>
        <Row className='mt-4 ms-4'>
        <Col sm={6} md={6} lg={5} className="button-group-wrapper ">
            <Checkbox
               text="Whether GST Registerd"
              onChange={(e) => handleFieldChange("whether_gst_registered_dlr", e.target.checked ? "Y" : "N",e )}
              checked={formData?.whether_gst_registered_dlr === "Y"}
            />
          </Col>
        </Row>
        <Row className='mt-1 ms-4 me-4'>
          <Col md={6} lg={6}>
            <TextField
            maxLength = {20}
              type="text"
              label="ARN number"
              value={formData?.arn_no || ""}
              onChange={(e) => handleFieldChange("arn_no", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
             maxLength = {20}
              type="text"
              label="GST number"
              value={formData?.gst_no || ""}
              onBlur={handleGstNoBlur} 
              onChange={(e) => handleFieldChange("gst_no", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className='ms-4 me-4 mt-1'>
          <Col md={12} lg={6}>
            <TextField
            maxLength = {40}
              type="text"
              label="GST Concerned Contact Person"
              value={formData?.gst_contact_person || ""}
              onChange={(e) => handleFieldChange("gst_contact_person", e.target.value, e)}
            />
          </Col>
          <Col md={12} lg={6}>
            <TextField
             maxLength = {40}
              type="text"
              label="GST Contact Person Designation"
              value={formData?.gst_contact_person_desig || ""}
              onChange={(e) => handleFieldChange("gst_contact_person_desig", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className='ms-4 me-4 mt-1'>
        <Col md={12} lg={6}>
            <TextField
            maxLength = {20}
              type="text"
              label="GST Contact Person's Number"
              value={formData?.gst_contact_no || ""}
              onChange={(e) => handleFieldChange("gst_contact_no", e.target.value, e)}
            />
          </Col>
          <Col md={12} lg={6}>
            <TextField
              type="text"
               maxLength = {100}
              label="GST Contact Person's Email"
              value={formData?.gst_contact_email || ""}
              onChange={(e) => handleFieldChange("gst_contact_email", e.target.value, e)}
            />
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default SupplierMasterGSTTab