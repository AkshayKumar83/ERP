import React from 'react'
import { Col, Form, Row } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import RadioGroup from '../../../../components/basic/radioGroup'
import ButtonUi from '../../../../components/basic/button'

const BankRecoEntryHeader = ({formData, handleChange, formStatus}) => {
  return (
   <Form>
<Row>
<Col sm={4} md={3} lg={2}>
          <TextField
            type="text"
            label="Bank Acc No"
            value={formData.acc_no || ""}
            onChange={(e) => handleChange("acc_no", e.target.value)}
          />
        </Col>
        <Col sm={8} md={7} lg={5}>
          <TextField
            type="text"
            label="Bank Acc Name"
            value={formData.acc_name || ""}
            onChange={(e) => handleChange("acc_name", e.target.value)}
            disabled
          />
        </Col>
</Row>
<Row className='mt-1'>
   <Col sm={12} md={6} lg={3} className="mt-4">
                <RadioGroup
                  className="radio-button-wrapper  box-border"
                  options={[
                    { text: "Voucher", value: "V" },
                    { text: "Opening", value: "O" },
                    { text: "All", value: "A" },
                  ]}
                  onChange={(e) => handleChange("rg_rec_type", e.target.value) }
                  checked={formData?.rg_rec_type || " "}
                />
              </Col>
        <Col sm={4} md={6} lg={2}>
          <TextField
            type="date"
            label="Ason Date"
            value={formData.to_vch_date || ""}
            onChange={(e) => handleChange("to_vch_date", e.target.value)}
            disabled
          />
        </Col>
        <Col  sm={4} md={4} lg={2} className='mt-4 ms-lg-5 ms-md-5'>
        <ButtonUi type="button" color='dark'  >
            Show Pending
        </ButtonUi>
        </Col>
        <Col  sm={3} md={4} lg={2} className='mt-4'>
        <ButtonUi type="button" color='dark'  >
            Show All
        </ButtonUi>
        </Col>
</Row>
   </Form>
  )
}

export default BankRecoEntryHeader