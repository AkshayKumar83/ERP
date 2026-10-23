import React from 'react'
import { Card, Col, Container, Form, Row } from 'reactstrap';
import TextField from '../../../../components/basic/textField';
import Select from '../../../../components/basic/select';
import TextArea from "../../../../components/basic/textArea";

const ScrapInvDespatch = ({
  formData = {},
  formStatus = "",
  handleChange = () => {},
  handleChangeTab = () => {},
}) => {
  return (
    <Container className="d-flex justify-content-center">
        <Card style={{ width: "80%" }} className="text-wrapper p-2 px-4">
          <span className="text-label">Despatch Details</span>
            <Form id="service-inv-despatch-form">
                <Row>
                    <Col xl={5}>
                        <TextField
                            type="text"
                            label="Final Destination"
                            name="final_dest"
                            value={formData.final_dest || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                    <Col xl={5}>
                        <TextField
                            type="text"
                            label="Despatch Note No."
                            name="desp_nt_no"
                            value={formData.desp_nt_no || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className="mt-1">
                    <Col xl={5}>
                        <Select
                            label="Mode of Transport"
                            name="mode_cd"
                            value={formData.mode_cd || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                            options={[{ value: "road", label: "Road" }, { value: "air", label: "Air" },{ value: "sea", label: "Sea" }]}
                        />
                    </Col>
                    <Col xl={7}  >
                      <Row className='d-flex align-item-end'>
                        <Col xl={4}>
                          <TextField
                              type="text"
                              label="Transporter Name"
                              name="transporter_code"
                              value={formData.transporter_code || ""}
                              onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </Col>
                        <Col xl={8} className=' mt-auto'>
                          <TextField
                              type="text"
                              name="tpt_name"
                              value={formData.tpt_name || ""}
                              onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </Col>
                      </Row>
                    </Col>
                </Row>

                <Row className="mt-1">
                    <Col xl={5}>
                        <TextField
                            type="text"
                            label="Vehicle No."
                            name="vessel_no"
                            value={formData.vessel_no || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                    <Col xl={5}>
                        <TextField
                            type="text"
                            label="Case Mark"
                            name="case_mrk"
                            value={formData.case_mrk || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className="mt-1">
                    <Col xl={5}>
                        <TextField
                            type="number"
                            label="Weight"
                            name="weight"
                            value={formData.weight || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                    <Col xl={5}>
                        <TextField
                            type="text"
                            label="Document Through"
                            name="doc_thru"
                            value={formData.doc_thru || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className="mt-1">
                    <Col xl={5}>
                        <TextField
                            type="date"
                            label="Removal Date & Time"
                            name="removal_dt"
                            value={formData.removal_dt || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                    <Col xl={5}>
                        <Select
                            label="Price Basis"
                            name="del_terms"
                            value={formData.del_terms || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                            options={[
                                { value: "FOB", label: "FOB" },
                                { value: "CIF", label: "CIF" },
                                { value: "EXW", label: "EXW" }
                            ]}
                        />
                    </Col>
                </Row>

                <Row className="mt-1">
                    <Col xl={10}>
                        <TextField
                            type="number"
                            label="Insurance Policy No."
                            name="policy_no"
                            value={formData.policy_no || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xl={10}>
                        <TextArea
                            label="Remarks"
                            name="excise_text"
                            value={formData.excise_text || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                            rows={4}
                        />
                    </Col>
                </Row>
            </Form>
        </Card>
    </Container>
);
}

export default ScrapInvDespatch
