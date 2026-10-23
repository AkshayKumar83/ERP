import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import { handleValidateField, validatePanNo } from './supplier_master_helper';

const SupplierMasterVendorsTab = ({formData,handleChange,formStatus}) => {

  //  const handlePanNoBlur = () => {
  //       const isValid = validatePanNo(formData, formStatus);
  //       if (!isValid) {
  //           document.querySelector('#pan_no').focus();
  //       }
  //   };


  return (
    <Container>
         <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
        <span className="text-label">General Information</span>
        <Row className='ms-4 me-4 mt-1'>
          <Col md={6} lg={6}>
            <TextField
            maxLength={100}
              type="text"
              label="Range"
              value={formData?.range || ""}
              onChange={(e) => handleChange("range", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
            maxLength={100}
              type="text"
              label="Division"
              value={formData?.division || ""}
              onChange={(e) => handleChange("division", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className='mt-1 ms-4 me-4'>
          <Col md={6} lg={6}>
            <TextField
             maxLength={20}
              type="text"
              id='pan_no'
              name='pan_no'
              label="Pan No."
              value={formData?.pan_no || ""}
              onChange={(e) => handleChange("pan_no", e.target.value, e)}
               onBlur={(e)=>handleValidateField(e,formStatus,formData)} // Attach onBlur for pan_no
               required
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
              type="text"
              maxLength={100}
              label="Commisionary"
              value={formData?.comm || ""}
              onChange={(e) => handleChange("comm", e.target.value, e)}
            />
          </Col>
        </Row>
      </div>

      <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-4">
        <span className="text-label">Banker Information</span>
        <Row className='ms-4 me-4 mt-1'>
          <Col md={6} lg={6}>
            <TextField
                maxLength={40}
              type="text"
              label="Banker"
              value={formData?.v_banker || ""}
              onChange={(e) => handleChange("v_banker", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
              maxLength={30}
              type="text"
              label="Acc No"
              value={formData?.bnk_ac_no || ""}
              onChange={(e) => handleChange("bnk_ac_no", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className=' mt-1 ms-4 me-4'>
          <Col md={6} lg={12}>
            <TextField
             maxLength={40}
              type="text"
              label="Banker Address"
              value={formData?.v_banker_add1 || ""}
              onChange={(e) => handleChange("v_banker_add1", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={12} className='mt-1'>
            <TextField
            maxLength={40}
              type="text"
              value={formData?.v_banker_add2 || ""}
              onChange={(e) => handleChange("v_banker_add2", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={12} className='mt-1'>
            <TextField
            maxLength={40}
              type="text"
              value={formData?.v_banker_add3 || ""}
              onChange={(e) => handleChange("v_banker_add3", e.target.value, e)}
            />
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default SupplierMasterVendorsTab