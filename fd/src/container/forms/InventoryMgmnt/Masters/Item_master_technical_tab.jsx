import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Checkbox from '../../../../components/basic/checkbox'
import TextArea from '../../../../components/basic/textArea'

const ItemMasterTechnicalSpecs = ({ formData, handleChange, formStatus }) => {
  return (
    <Container>
      <Row>
        <Col sm={12} md={3} lg={4}>
          <TextField
            type="text"
            label="Prod level Rej."
            value={formData.prod_level_rej || ""}
            onChange={(e) => handleChange("prod_level_rej", e.target.value)}
          />
        </Col>
        <Col sm={12} md={3} lg={2}>
          <TextField
            type="date"
            label="Phase in Date"
            value={formData.it_dt_in || ""}
            onChange={(e) => handleChange("it_dt_in", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={12} md={3} lg={2}>
          <TextField
            type="date"
            label="Phase out date"
            value={formData.it_dt_out || ""}
            onChange={(e) => handleChange("it_dt_out", e.target.value)}
          />
        </Col>
        <Col sm={12} md={3} lg={4}>
          <TextField
            type="text"
            label="Old Drawing No."
            value={formData.old_drawing_no || ""}
            onChange={(e) => handleChange("old_drawing_no", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mt-1 ">
        <Col sm={12} md={3} lg={3}>
          <TextField
            type="text"
            label="Revision No."
            value={formData.rev_level_ref || ""}
            onChange={(e) => handleChange("rev_level_ref", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={12} md={3} lg={2}>
          <TextField
            type="date"
            label="Revision Date"
            value={formData.rev_date || ""}
            onChange={(e) => handleChange("rev_date", e.target.value)}
          />
        </Col>
        <Col sm={12} md={3} lg={4}>
          <TextField
            type="text"
            label="FC Code"
            value={formData.fc_code || ""}
            onChange={(e) => handleChange("fc_code", e.target.value)}
          />
        </Col>
        <Col sm={12} md={3} lg={3} className="button-group-wrapper mt-md-3 mt-lg-4">
          <Checkbox
            text="Tag to be Printed Individually"
            onChange={(e) => handleChange("tag_reqmnt_individual", e.target.checked ? "Y" : "N")}
            checked={formData?.tag_reqmnt_individual === "Y"}
          />
        </Col>
      </Row>
      <Row className="mt-1 ">
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Drawing No."
            value={formData.drawing_no_ref || ""}
            onChange={(e) => handleChange("drawing_no_ref", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Drawing Size"
            value={formData.drawing_size || ""}
            onChange={(e) => handleChange("drawing_size", e.target.value)}
          />
        </Col>
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Mfg process No."
            value={formData.mfg_process_no_ref || ""}
            onChange={(e) => handleChange("mfg_process_no_ref", e.target.value)}
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-1 ">
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Drawing ref."
            value={formData.drawing_ref || ""}
            onChange={(e) => handleChange("drawing_ref", e.target.value)}
          />
        </Col>
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="install.Drg No."
            value={formData.iic_ref_no || ""}
            onChange={(e) => handleChange("iic_ref_no", e.target.value)}
          />
        </Col>
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Customer Drg No."
            value={formData.customer_drawing_no || ""}
            onChange={(e) => handleChange("customer_drawing_no", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="install rev No."
            value={formData.install_rev_no || ""}
            onChange={(e) => handleChange("install_rev_no", e.target.value)}
          />
        </Col>
        <Col sm={12} md={4} lg={2}>
          <TextField
            type="date"
            label="install Effective date"
            value={formData.install_eff_date || ""}
            onChange={(e) => handleChange("install_eff_date", e.target.value)}
          />
        </Col>
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Install Size"
            value={formData.install_size || ""}
            onChange={(e) => handleChange("install_size", e.target.value)}
          />
        </Col>
      </Row>
      <Row className='mt-1'>
        <Col sm={12} md={12} lg={12}>
          <TextArea
            type="text"
            label="Technical Specification"
            value={formData.tech_spec || ""}
            onChange={(e) => handleChange("tech_spec", e.target.value)}
          />
        </Col>
      </Row>
    </Container>
  )
}

export default ItemMasterTechnicalSpecs