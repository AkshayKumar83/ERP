import React from 'react'
import { Col, Form, Row, Card, } from 'reactstrap';
import Select from '../../../../components/basic/select';
import TextField from '../../../../components/basic/textField';
import RadioGroup from '../../../../components/basic/radioGroup';
import Checkbox from '../../../../components/basic/checkbox';

const ScrapInvPayment = ({
  formData = {},
  formStatus = "",
  handleChange = () => {},
  handleChangeTab = () => {},
}) => {
  return (
    <Form id="scrap-inv-payment-form">
        <Row>
            <Col lg={5}>
                <Card className="text-wrapper py-1 px-3">
                <span className="text-label">Payment Details</span>
                <Row>
                    <Col>
                        <Select
                            label="Pmt. Terms"
                            name="pmt_terms"
                            value={formData.pmt_terms || ""}
                            onChange={(e) => handleChange(e)}
                            optional={[{}]}
                        />
                    </Col>
                </Row>
                <Row className="mt-1">
                    <Col xl={6}>
                        <TextField
                            type="date"
                            label="Due Date"
                            name="due_dt"
                            value={formData.due_dt || ""}
                            onChange={(e) => handleChange(e)}
                        />
                    </Col>
                    <Col xl={6}>
                        <TextField
                            type="text"
                            label="Hundi. No."
                            name="hundi_no"
                            value={formData.hundi_no || ""}
                            onChange={(e) => handleChange(e)}
                        />
                    </Col>
                </Row>
                </Card>
            </Col>
            <Col lg={4}>
                <Card className="text-wrapper py-1 px-3">
                <span className="text-label">Tax Collection at Source</span>
                <Row>
                    <Col lg={6}>
                      <TextField
                          type="number"
                          label="TCS %"
                          name="tcs_perc"
                          value={formData.tcs_perc || ""}
                          onChange={(e) => handleChange(e)}
                      />
                    </Col>
                    {/* <Col>
                      <TextField
                          type="number"
                          label="TCS Cess"
                          name="tcs_perc"
                          value={formData.tcs_perc || ""}
                          onChange={(e) => handleChange(e)}
                      />
                    </Col> */}
                </Row>
                <Row className="mt-1">
                    <Col xl={6}>
                        <TextField
                            type="number"
                            label="TCS Amount"
                            name="tcs_amt"
                            value={formData.due_dt || ""}
                            onChange={(e) => handleChange(e)}
                        />
                    </Col>
                    {/* <Col xl={6}>
                        <TextField
                            type="number"
                            label="TCS Surch %"
                            name="tcs_surch"
                            value={formData.due_dt || ""}
                            onChange={(e) => handleChange(e)}
                        />
                    </Col> */}
                </Row>
                </Card>
            </Col>
            <Col lg={3}>
                <Card className="text-wrapper py-3 px-3">
                <span className="text-label">Packing & Forwarding %</span>
                <Row>
                    <Col>
                      <RadioGroup
                        className="radio-button-wrapper box-border "
                        options={[{ text: "Percentage", value: "P" },{ text: "Value", value: "V" },]}
                        onChange={(e) => handleChange("pack_amt_perc", e.target.value)}
                        checked={formData?.ins_flag || "P"}
                      />
                    </Col>
                </Row>
                <Row className="mt-1">
                    <Col>
                        <TextField
                          name="pack_forw"
                          value={formData.pack_forw || ""}
                          onChange={(e) => handleChange(e)}
                        />
                    </Col>
                </Row>
                </Card>
            </Col>
        </Row>

        <Card className="text-wrapper py-3 mt-3">
            <span className="text-label">Other Charges</span>
            <Row>
                <Col xl={2} className="py-2">
                    <Row>
                        <span className="text-end py-1" style={{fontSize:"14px"}}>Desc</span>
                    </Row>
                    <Row>
                        <span className="text-end py-1" style={{fontSize:"14px"}}>Amount in</span>
                    </Row>
                    <Row>
                        <span className="mt-1 text-end py-1" style={{fontSize:"14px"}}>Amount</span>
                    </Row>
                    <Row>
                        <span className="mt-1 text-end py-1" style={{fontSize:"14px"}}>Acc. Code</span>
                    </Row>
                    <Row>
                        <span className="mt-1 text-end py-1" style={{fontSize:"14px"}}>Desc</span>
                    </Row>
                </Col>
                <Col xl={3}>
                    <Card className="text-wrapper py-2 px-1 d-flex flex-column">
                        <span className="text-label">{'[1]'}</span>
                        <Row className="mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_chg1"
                                    value={formData.other_chg1 || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex g-1 mt-1">
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper box-border"
                                    options={[{ text: "%", value: "G" },{ text: "value", value: "U" },]}
                                    onChange={(e) => handleChange("is_group", e.target.value)}
                                    checked={formData?.is_group || "U"}
                                />
                            </Col>
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper box-border"
                                    options={[{ text: "Add", value: "G" },{ text: "Less", value: "U" },]}
                                    onChange={(e) => handleChange("is_group", e.target.value)}
                                    checked={formData?.is_group || "U"}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex g-1 mt-1">
                            <Col>
                                <TextField
                                    type="number"
                                    name="other_amt1"
                                    value={formData.other_amt1 || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col>
                              <TextField
                                  type="text"
                                  name="other_ac_head1"
                                  value={formData.other_ac_head1 || ""}
                                  onChange={(e) => handleChange(e)}
                              />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_ac_desc1"
                                    value={formData.other_ac_desc1 || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xl={3}>
                <Card className="text-wrapper py-2 px-1 d-flex flex-column">
                        <span className="text-label">{'[2]'}</span>
                        <Row className="mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_chg2"
                                    value={formData.other_chg2 || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex g-1 mt-1">
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper box-border"
                                    options={[{ text: "%", value: "G" },{ text: "value", value: "U" },]}
                                    onChange={(e) => handleChange("is_group", e.target.value)}
                                    checked={formData?.is_group || "U"}
                                />
                            </Col>
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper box-border"
                                    options={[{ text: "Add", value: "G" },{ text: "Less", value: "U" },]}
                                    onChange={(e) => handleChange("is_group", e.target.value)}
                                    checked={formData?.is_group || "U"}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex g-1 mt-1">
                            <Col>
                                <TextField
                                    type="number"
                                    name="other_amt1"
                                    value={formData.other_amt1 || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col>
                              <TextField
                                  type="text"
                                  name="other_ac_head2"
                                  value={formData.other_ac_head2 || ""}
                                  onChange={(e) => handleChange(e)}
                              />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_ac_desc1"
                                    value={formData.other_ac_desc1 || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xl={3}>
                <Card className="text-wrapper py-2 px-1 d-flex flex-column">
                        <span className="text-label">{'[3]'}</span>
                        <Row className="mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_chg1"
                                    value={formData.other_chg1 || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex g-1 mt-1">
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper box-border"
                                    options={[{ text: "%", value: "G" },{ text: "value", value: "U" },]}
                                    onChange={(e) => handleChange("is_group", e.target.value)}
                                    checked={formData?.is_group || "U"}
                                />
                            </Col>
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper box-border"
                                    options={[{ text: "Add", value: "G" },{ text: "Less", value: "U" },]}
                                    onChange={(e) => handleChange("is_group", e.target.value)}
                                    checked={formData?.is_group || "U"}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex g-1 mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_amt1"
                                    value={formData.other_amt1 || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col>
                              <TextField
                                  type="text"
                                  name="other_ac_head3"
                                  value={formData.other_ac_head3 || ""}
                                  onChange={(e) => handleChange(e)}
                              />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col>
                                <TextField
                                    type="text"
                                    name="other_ac_desc1"
                                    value={formData.other_ac_desc1 || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Card>
        <div className=" col-sm-12 col-md-12 col-lg-12 text-wrapper  box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
            <Row>
                <Col lg={3}>
                    <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
                        <span className="text-label">Insurance</span>
                        <RadioGroup
                            className="radio-button-wrapper box-border "
                            options={[{ text: "None", value: "1" },{ text: "Customer", value: "2" },{ text: "Us", value: "3" },]}
                            onChange={(e) => handleChange("ins_flag", e.target.value)}
                            checked={formData?.ins_flag || "1"}
                        />
                        <RadioGroup
                            className="mt-1 radio-button-wrapper"
                            options={[{ text: "Percentage", value: "P" },{ text: "Value", value: "V" },]}
                            onChange={(e) => handleChange("ins_amt_prc", e.target.value)}
                            checked={formData?.ins_amt_prc || "P"}
                        />
                        <TextField
                            type="text"
                            value={formData.ins_chg || ""}
                            onChange={(e) => handleChange("ins_chg", e.target.value)}
                        />
                    </div>
                </Col>
            <Col lg={9}>
                <div className="  col-sm-12 col-md-12 col-lg-12 text-wrapper box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                <span className="text-label">Insurance GST</span>
                    <Row>
                        <Col lg={6} className="mt-1">
                            <Row className="">
                                <Col xl={6}>
                                    <Checkbox
                                        text="Calc GST"
                                        onChange={(e) => handleChange("calc_gst_on_ins", e.target.checked ? "Y" : "N" )}
                                        checked={formData?.calc_gst_on_ins === "Y"}
                                    />
                                </Col>
                                <Col xl={6} className="">
                                    <RadioGroup
                                        className=" radio-button-wrapper box-border"
                                        options={[{ text: "%", value: "P" },{ text: "Value", value: "A" },]}
                                        onChange={(e) => handleChange("gst_amt_prc_i", e.target.value)}
                                        checked={formData?.gst_amt_prc_i || "P"}
                                    />
                                </Col>
                            </Row>
                            
                        </Col>
                    </Row>
                    <Row>
                        <Row className=" justify-content-between">
                            <Col sm={6} md={3} lg={2}>
                                <Row>
                                    <TextField
                                        type="text"
                                        label="SGST"
                                        value={formData.gst_sgst_val_i || ""}
                                        onChange={(e) => handleChange("gst_sgst_val_i",e.target.value)}
                                    />
                                    <TextField
                                        type="text"
                                        label="Cess"
                                        value={formData.gst_sgst_cess_val_i || ""}
                                        onChange={(e) =>  handleChange("gst_sgst_cess_val_i",  e.target.value )}
                                    />
                                </Row>
                            </Col>
                            <Col sm={6} md={3} lg={2}>
                                <Row>
                                    <TextField
                                        type="text"
                                        label="UGST"
                                        value={formData.gst_ugst_val_i || ""}
                                        onChange={(e) =>  handleChange("gst_ugst_val_i", e.target.value )}
                                    />

                                    <TextField
                                        type="text"
                                        label="Cess"
                                        value={formData.gst_ugst_cess_val_i || ""}
                                        onChange={(e) =>  handleChange("gst_ugst_cess_val_i", e.target.value)}
                                    />
                                </Row>
                            </Col>
                            <Col sm={6} md={3} lg={2}>
                                <Row>
                                <TextField
                                    type="text"
                                    label="CGST"
                                    value={formData.gst_cgst_val_i || ""}
                                    onChange={(e) =>  handleChange("gst_cgst_val_i",e.target.value )}
                                />
                                <TextField
                                    type="text"
                                    label="Cess"
                                    value={formData.gst_cgst_cess_val_i || ""}
                                    onChange={(e) =>  handleChange("gst_cgst_cess_val_i", e.target.value )}
                                />
                                </Row>
                            </Col>
                            <Col sm={6} md={3} lg={2}>
                                <Row>
                                <TextField
                                    type="text"
                                    label="IGST"
                                    value={formData.gst_igst_val_i || ""}
                                    onChange={(e) =>  handleChange("gst_igst_val_i", e.target.value  )}
                                />

                                <TextField
                                    type="text"
                                    label="Cess"
                                    value={formData.gst_igst_cess_val_i || ""}
                                    onChange={(e) =>  handleChange("gst_igst_cess_val_i", e.target.value  )}
                                />
                                </Row>
                            </Col>
                        </Row>
                    </Row>
                </div>
            </Col>
            </Row>
            <Row>
            <Col lg={3}>
                <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
                <span className="text-label">Freight</span>
                <RadioGroup
                    className="radio-button-wrapper   box-border "
                    options={[{ text: "None", value: "1" },{ text: "Customer", value: "2" },{ text: "Us", value: "3" },]}
                    onChange={(e) => handleChange("frt_flg", e.target.value)}
                    checked={formData?.frt_flg || "1"}
                />
                <RadioGroup
                    className="mt-1 radio-button-wrapper"
                    options={[{ text: "Percentage", value: "P" },{ text: "Value", value: "V" },]}
                    onChange={(e) => handleChange("frt_amt_prc", e.target.value)}
                    checked={formData?.frt_amt_prc || "P"}
                />
                <TextField
                    type="text"
                    value={formData.frt_chg || ""}
                    onChange={(e) => handleChange("frt_chg", e.target.value)}
                />
                </div>
            </Col>
            <Col lg={9}>
                <div className="  col-sm-12 col-md-12 col-lg-12 text-wrapper box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                    <span className="text-label">Freight GST</span>
                    <Row>
                        <Col lg={6} className="mt-1">
                            <Row className="">
                                <Col xl={6}>
                                    <Checkbox
                                        text="Calc GST"
                                        onChange={(e) => handleChange("calc_gst_on_frt", e.target.checked ? "Y" : "N" )}
                                        checked={formData?.calc_gst_on_frt === "Y"}
                                    />
                                </Col>
                                <Col xl={6} className="">
                                    <RadioGroup
                                        className=" radio-button-wrapper box-border"
                                        options={[{ text: "%", value: "P" },{ text: "Value", value: "A" },]}
                                        onChange={(e) => handleChange("gst_amt_prc_f", e.target.value)}
                                        checked={formData?.gst_amt_prc_f || "P"}
                                    />
                                </Col>
                            </Row>
                            
                        </Col>
                    </Row>
                    <Row className=" justify-content-between mt-1">
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                            <TextField
                                type="text"
                                label="SGST"
                                value={formData.gst_sgst_val_f || ""}
                                onChange={(e) => handleChange("gst_sgst_val_f",e.target.value)}
                            />
                            <TextField
                                type="text"
                                label="Cess"
                                value={formData.gst_sgst_cess_val_f || ""}
                                onChange={(e) =>  handleChange( "gst_sgst_cess_val_f",  e.target.value )}
                            />
                            </Row>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                            <TextField
                                type="text"
                                label="UGST"
                                value={formData.gst_ugst_val_f || ""}
                                onChange={(e) =>  handleChange("gst_ugst_val_f", e.target.value )}
                            />

                            <TextField
                                type="text"
                                label="Cess"
                                value={formData.gst_ugst_cess_val_f || ""}
                                onChange={(e) =>  handleChange( "gst_ugst_cess_val_f", e.target.value )}
                            />
                            </Row>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                            <TextField
                                type="text"
                                label="CGST"
                                value={formData.gst_cgst_val_f || ""}
                                onChange={(e) =>  handleChange("gst_cgst_val_f",e.target.value )}
                            />
                            <TextField
                                type="text"
                                label="Cess"
                                value={formData.gst_cgst_cess_val_f || ""}
                                onChange={(e) =>  handleChange("gst_cgst_cess_val_f", e.target.value )}
                            />
                            </Row>
                        </Col>
                        <Col sm={6} md={3} lg={2}>
                            <Row>
                            <TextField
                                type="text"
                                label="IGST"
                                value={formData.gst_igst_val_f || ""}
                                onChange={(e) =>  handleChange("gst_igst_val_f", e.target.value  )}
                            />

                            <TextField
                                type="text"
                                label="Cess"
                                value={formData.gst_igst_cess_val_f || ""}
                                onChange={(e) =>  handleChange("gst_igst_cess_val_f", e.target.value  )}
                            />
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Col>
            </Row>
        </div>
    </Form>
);
}

export default ScrapInvPayment
