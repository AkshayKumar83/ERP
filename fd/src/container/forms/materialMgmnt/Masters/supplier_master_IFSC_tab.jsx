import React from 'react'
import { Container, Row, Col} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import TextArea from '../../../../components/basic/textArea'

const SupplierMasterIFSCTab = ({formData, handleChange, formStatus}) => {
  return (
    <Container>
    <div className=" mx-auto justify-content-center col-sm-12 col-md-8 col-lg-8 text-wrapper customer-height box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
        <span className="text-label">IFSC DETAIL'S</span>
        <Row className='ms-4 me-4 mt-2'>
          <Col md={6} lg={6}>
            <TextField
            maxlengtgh = {20}
              type="text"
              label="IFSC Code"
              value={formData?.vend_bank_ifsc_code || ""}
              onChange={(e) => handleChange("vend_bank_ifsc_code", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
             maxlengtgh = {20}
              type="text"
              label="Account Number"
              value={formData?.vend_bank_acc_no || ""}
              onChange={(e) => handleChange("vend_bank_acc_no", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className='mt-1 ms-4 me-4'>
          <Col md={6} lg={6}>
            <TextField
             maxlengtgh = {200}
              type="text"
              label="Account Holder Name"
              value={formData?.acc_holder_name || ""}
              onChange={(e) => handleChange("acc_holder_name", e.target.value, e)}
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
            maxlengtgh = {100}
              type="text"
              label="Bank Name/Acc. Type"
              value={formData?.vend_bank_acc_name || ""}
              onChange={(e) => handleChange("vend_bank_acc_name", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className='mt-1 ms-4 me-4'>
        <Col sm={12} md={12} lg={12}>
          <TextArea
              maxlengtgh = {100}
            type="text"
            label="Bank Branch Name"
            value={formData?.vend_bank_add || ""}
            onChange={(e) => handleChange("vend_bank_add", e.target.value, e)}
          />
        </Col>
        </Row>
        <Row className='ms-4 me-4 mt-1'>
          <Col md={12} lg={6}>
            <TextField
             maxlengtgh = {100}
              type="text"
              label="Swift Code"
              value={formData?.bank_swift_code || ""}
              onChange={(e) => handleChange("bank_swift_code", e.target.value, e)}
            />
          </Col>
          <Col md={12} lg={6}>
            <TextField
            maxlengtgh = {50}
              type="text"
              label="Iban No/ Sort Code/ Bsb No/ Transit No"
              value={formData?.bank_iban_sort_bsb_transit_no || ""}
              onChange={(e) => handleChange("bank_iban_sort_bsb_transit_no", e.target.value, e)}
            />
          </Col>
        </Row>
        <Row className='ms-4 me-4 mt-1'>
          <Col md={12} lg={12}>
            <TextField
            maxlengtgh = {100}
              type="text"
              label="Correspondent/Intermediary Bank name and BIC Code (optional)"
              value={formData?.bank_intermediary_name || ""}
              onChange={(e) => handleChange("bank_intermediary_name", e.target.value, e)}
            />
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default SupplierMasterIFSCTab