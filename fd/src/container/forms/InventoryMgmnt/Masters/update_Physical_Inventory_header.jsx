import React from 'react'
import { Card, Col, Container, Row } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Select from '../../../../components/basic/select'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'

const UpdatePhysicalInventoryHeader = ({formData, formStatus, handleChange, handleCancel,itemBase = [],
  itemType = [],
  itemSubCat = [],
  wcList = [],
  handleGenerate,
  statusMessage ,
  
}) => {

  return (
  <Row className="d-flex justify-content-center">
  <Col xl={6} lg={8} md={10}>
    <Card className="p-2 rounded-4">
      <Container>
        <Row className="d-flex justify-content-center mb-2">
          <Col className="text-center">
            <h5 className="fw-bold">Update Physical Inventories</h5>
          </Col>
        </Row>

        <Row className="d-flex justify-content-center">
          <Col xl={6} className="mt-1 mb-2">
            <RadioGroup
              className="radio-button-wrapper box-border"
              options={[
                { text: "Store", value: "S" },
                { text: "Process", value: "P" },
              ]}
              onChange={(e) => handleChange("store_process", e.target.value, e)}
              checked={formData?.store_process || "S"}
            />
          </Col>
        </Row>

        <Row className='d-flex justify-content-center'>
          <Col xl={3}>
            <Select
              // required
              label="Work Center"
              name="wc_id"
              placeholder=" "
              value={formData?.wc_id || ""}
              onChange={(e) => handleChange("wc_id", e.target.value, e)}
              options={wcList}
            />
          </Col>
          <Col xl={3}>
            <TextField
              type="date"
              label="Inventory Month"
              name="adj_date"
              value={formData?.adj_date || ""}
              onChange={(e) => handleChange("adj_date", e.target.value, e)}
            />
          </Col>
          <Col xl={3}>
            <TextField
              type="text"
              label="Inventory Year"
              name="curryear"
              value={formData?.curryear || ""}
              onChange={(e) => handleChange("curryear", e.target.value, e)}
              disabled
            />
          </Col>
         
        </Row>

        <Row className="mt-1 d-flex justify-content-center">
          <Col xl={9}>
            <Select
              // required
              label="Item Type"
              name="it_type"
              placeholder=" "
              value={formData?.it_type || ""}
              onChange={(e) => handleChange("it_type", e.target.value, e)}
              options={itemType}
            />
          </Col>
        </Row>

        <Row className='d-flex justify-content-center'>
          <Col xl={9}>
            <Select
              // required
              label="Item Base"
              name="it_base"
              placeholder=" "
              value={formData?.it_base || ""}
              onChange={(e) => handleChange("it_base", e.target.value, e)}
                options={itemBase}
            />
          </Col>
        </Row>

        <Row className='d-flex justify-content-center'>
          <Col xl={9}>
            <Select
              // required
              label="Base Sub Category"
              name="it_sub_c"
              placeholder=" "
              value={formData?.it_sub_c || ""}
              onChange={(e) => handleChange("it_sub_c", e.target.value, e)}
              options={itemSubCat}
            />
          </Col>
        </Row>

          <Row className='d-flex justify-content-center text-center'>
            <span style={{ fontWeight: "500", color: "red" }}>
              {statusMessage || ""}
            </span>
          </Row>
        
        <Row className='mt-4  d-flex justify-content-center'>
            <Col xl={5}>
           <ButtonUi onClick={handleGenerate}>Generate Adjustments</ButtonUi>
            </Col>
            <Col xl={3}>
           <ButtonUi color='danger' onClick={handleCancel}>Cancel</ButtonUi>

            </Col>
        </Row>
      </Container>
    </Card>
  </Col>
</Row>

  )
}

export default UpdatePhysicalInventoryHeader