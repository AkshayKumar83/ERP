import React from "react";
import { Card, Col, Form, Row } from "reactstrap";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";

const ServiceInvPayment = ({
    formData = {},
    formStatus = "",
    handleChange = () => {},
    handleChangeTab = () => {},
    paymentTerm = []
}) => {
    return (
        <Form id="service-inv-payment-form">
            <Row>
                <Col xl={12}>
                    <Card className="text-wrapper py-3 px-3">
                    <span className="text-label">Payment Details</span>
                    <Row>
                        <Col xl={9}>
                            <Select
                                label="Pmt. Terms"
                                name="pmt_terms"
                                value={formData.pmt_terms || ""}
                                onChange={(e) => handleChange(e)}
                                options={paymentTerm}
                            />
                        </Col>
                        <Col xl={3}>
                            <TextField
                                disabled
                                type="date"
                                label="Due Date"
                                name="due_dt"
                                value={formData.due_dt || ""}
                                onChange={(e) => handleChange(e)}
                            />
                        </Col>
                    </Row>
                    {/* <Row className="mt-1"> */}
                        {/* <Col xl={3}>
                            <TextField
                                type="text"
                                label="Hundi. No."
                                name="hundi_no"
                                value={formData.hundi_no || ""}
                                onChange={(e) => handleChange(e)}
                            />
                        </Col> */}
                    {/* </Row> */}
                    </Card>
                </Col>
                {/* <Col xl={3} className="d-flex flex-column gap-2">
                    <Row>
                        <Col xl={6}>
                            <TextField
                                pClass="mt-1"
                                type="text"
                                value={formData.octroi_chg || ""}
                                onChange={(e) => handleChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <RadioGroup
                                className="radio-button-wrapper box-border "
                                options={[{ text: "None", value: "1" },{ text: "Customer", value: "2" },{ text: "Us", value: "3" },]}
                                onChange={(e) => handleChange("octroi_flg", e.target.value)}
                                checked={formData?.octroi_flg || "1"}
                            />
                        </Col>
                    </Row>
                </Col> */}
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
                            <span className="mt-1 text-end py-1" style={{fontSize:"14px"}}>Desc</span>
                        </Row>
                    </Col>
                    <Col xl={3}>
                        <Card className="text-wrapper py-2 px-1 d-flex flex-column">
                            <span className="text-label">{'[1] Acc. Code'}</span>
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
                            <span className="text-label">{'[2] Acc. Code'}</span>
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
                                        type="text"
                                        name="other_amt1"
                                        value={formData.other_amt1 || ""}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Col>
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
                            <span className="text-label">{'[3] Acc. Code'}</span>
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
                </Row>
            </Card>
            {/* <div className=" col-sm-12 col-md-12 col-lg-12 text-wrapper  box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
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
                                <Col sm={6} md={3} lg={2} className="d-flex align-items-end ">
                                    <Row>
                                        <TextField
                                            type="text"
                                            label="Compensation Cess"
                                            value={formData.gst_comp_cess_val_i || ""}
                                            onChange={(e) =>  handleChange("gst_comp_cess_val_i", e.target.value  )}
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
                            <Col sm={6} md={3} lg={2} className="d-flex align-items-end ">
                                <Row>
                                <TextField
                                    type="text"
                                    label="Compensation Cess"
                                    value={formData.gst_comp_cess_val_f || ""}
                                    onChange={(e) =>  handleChange("gst_comp_cess_val_f", e.target.value  )}
                                />
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </Col>
                </Row>
            </div>
            <Row className="mt-2">
                <Col xl={5}>
                <Card  className="text-wrapper p-2 mt-2 d-flex flex-row gap-2">
                    <span className="text-label">packing & Forwarding</span>
                    <RadioGroup
                        className=" mt-1 radio-button-wrapper box-border"
                        options={[{ text: "Percentage", value: "P" },{ text: "Value", value: "V" },]}
                        onChange={(e) => handleChange("ins_amt_prc", e.target.value)}
                        checked={formData?.ins_amt_prc || "P"}
                    />
                    <TextField
                        pClass="mt-1"
                        type="text"
                        value={formData.pack_forw || ""}
                        onChange={(e) => handleChange("pack_forw", e.target.value)}
                    />
                </Card>
                </Col>
                <Col xl={7} className="text-wrapper">
                    <Card  className="text-wrapper p-2 mt-2 d-flex flex-row gap-2">
                        <span className="text-label">TCS</span>
                        <Col xl={3}>
                        <TextField
                            label="TCS %"
                            pClass="mt-1"
                            type="text"
                            value={formData.tcs_perc || ""}
                            onChange={(e) => handleChange("tcs_perc", e.target.value)}
                        />
                        </Col>
                        <Col xl={3}>
                        <TextField
                            label="TCS Surch %"
                            pClass="mt-1"
                            type="text"
                            value={formData.tcs_surch || ""}
                            onChange={(e) => handleChange("tcs_surch", e.target.value)}
                        />
                        </Col>
                        <Col xl={3}>
                        <TextField
                            label="TCS Cess %"
                            pClass="mt-1"
                            type="text"
                            value={formData.tcs_cess || ""}
                            onChange={(e) => handleChange("tcs_cess", e.target.value)}
                        />
                        </Col>
                    </Card>
                </Col>
            </Row> */}
        </Form>
    );
};

export default ServiceInvPayment;
