import React from 'react'
import { Card, Col, Container, Row } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Select from "../../../../components/basic/select";
import TextField from '../../../../components/basic/textField';

const AllMemberReactReportHdr = ({ formData, formStatus,handleChange,emfaFormData, dlrName = [] }) => {
  return (
    <>


<Row className='mt-4 d-flex justify-content-center'>
  {/* First Card */}
  {/* <Col xl={6}>
    <Card className="text-center px-2 shadow-sm">
      <Row>
        <Col>
          <span className="fw-bold fs-5">MEMBERS REPORTS</span>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xl={12} className="mt-1 mb-2">
          <RadioGroup
          className="radio-button-wrapper box-border"
          options={[
            { text: "All Members", value: "A" },
            { text: "Active Member", value: "M" },
            { text: "Inactive Member", value: "N" },
          ]}
          onChange={(e) => handleChange("member", "report_type", e.target.value)}
          checked={formData?.report_type || ""}
        />
                </Col>
      </Row>
    </Card>
  </Col> */}

  {/* Second Card */}
  <Col xl={6} >
    <Card className=" px-2 shadow-sm">
      <Row>
        <Col>
          <span className="d-flex justify-content-center fw-bold fs-5">EMFA STATUS ALL MEMBERS</span>
        </Col>
      </Row>

      <Row className="mt-3">
         {/* <Col xl={4}>
                <TextField
                type="number"
                name="member_id"
                label="Member Id"
                value={emfaFormData.member_id || ""}
                onChange={(e) => handleChange("emfa", "member_id", e.target.value)}
              />
                </Col> */}
                <Col xl={6}>
                  <Select
                        // required
                        name="dlr_name"
                        label="Dlr. Name"
                        value={emfaFormData.dlr_name || ""}
                         onChange={(e) => handleChange("emfa", "dlr_name", e.target.value)}
                         options={dlrName}
                        // disabled={['Insert', 'Update', 'Query',''].includes(formStatus)}
                    />
                    </Col>
         <Col xl={3}>
                  <TextField
                type="date"
                name="from_date"
                label="EFA Period (From)"
                value={emfaFormData.from_date || ""}
                onChange={(e) => handleChange("emfa", "from_date", e.target.value)}
              />
                </Col>
                <Col xl={3}>
         <TextField
          type="date"
          name="to_date"
          label="EFA Period (To)"
          value={emfaFormData.to_date || ""}
          onChange={(e) => handleChange("emfa", "to_date", e.target.value)}
        />
      </Col>
      </Row>
    </Card>
  </Col>
</Row>


    </>
  )
}

export default AllMemberReactReportHdr