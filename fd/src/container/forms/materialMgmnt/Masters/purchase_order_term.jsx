import React from "react";
import { Col, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";

const TermsTab = ({ formData = [{}], formStatus, handleChange = () => { } }) => {
    return (
        <>
            <div className=" col-sm-12 col-md-12 col-lg-12 text-wrapper  box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
                <span className="text-label">Other Charges</span>
                <Row>
                    <Col lg={3}>
                        <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
                            <span className="text-label">Insurance</span>
                            <RadioGroup
                                className="radio-button-wrapper   box-border "
                                options={[
                                    { text: "None", value: "1" },
                                    { text: "Vendor", value: "2" },
                                    { text: "Us", value: "3" },
                                ]}
                                onChange={(e) => handleChange("ins_flag", e.target.value)}
                                checked={formData?.ins_flag || "1"}
                            />
                            <RadioGroup
                                className="mt-1 radio-button-wrapper"
                                options={[
                                    { text: "Percentage", value: "P" },
                                    { text: "Value", value: "V" },
                                ]}
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
                            <span className="text-label">GST Insurance</span>
                            <Row>
                                <Col lg={2} className="mt-1">
                                    <Checkbox
                                        text="Calc GST"
                                        onChange={(e) => handleChange("calc_gst_on_ins", e.target.checked ? "Y" : "N")}
                                        checked={formData?.calc_gst_on_ins === "Y"}
                                    />
                                </Col>
                                <Row className=" justify-content-between">
                                    <Col lg={3} className="mt-4">
                                        <RadioGroup
                                            className="mt-2 radio-button-wrapper box-border Transaction-height"
                                            options={[
                                                { text: "%", value: "P" },
                                                { text: "Value", value: "A" },
                                            ]}
                                            onChange={(e) => handleChange("gst_amt_prc_i", e.target.value)}
                                            checked={formData?.gst_amt_prc_i || "P"}
                                        />
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="SGST"
                                                value={formData.gst_sgst_val_i || ""}
                                                onChange={(e) => handleChange("gst_sgst_val_i", e.target.value)}
                                            />
                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_sgst_cess_val_i || ""}
                                                onChange={(e) => handleChange("gst_sgst_cess_val_i", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="UGST"
                                                value={formData.gst_ugst_val_i || ""}
                                                onChange={(e) => handleChange("gst_ugst_val_i", e.target.value)}
                                            />

                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_ugst_cess_val_i || ""}
                                                onChange={(e) => handleChange("gst_ugst_cess_val_i", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="CGST"
                                                value={formData.gst_cgst_val_i || ""}
                                                onChange={(e) => handleChange("gst_cgst_val_i", e.target.value)}
                                            />
                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_cgst_cess_val_i || ""}
                                                onChange={(e) => handleChange("gst_cgst_cess_val_i", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="IGST"
                                                value={formData.gst_igst_val_i || ""}
                                                onChange={(e) => handleChange("gst_igst_val_i", e.target.value)}
                                            />

                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_igst_cess_val_i || ""}
                                                onChange={(e) => handleChange("gst_igst_cess_val_i", e.target.value)}
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
                                options={[
                                    { text: "None", value: "1" },
                                    { text: "Vendor", value: "2" },
                                    { text: "Us", value: "3" },
                                ]}
                                onChange={(e) => handleChange("frt_flg", e.target.value)}
                                checked={formData?.frt_flg || "1"}
                            />
                            <RadioGroup
                                className="mt-1 radio-button-wrapper"
                                options={[
                                    { text: "Percentage", value: "P" },
                                    { text: "Value", value: "V" },
                                ]}
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
                            <span className="text-label">GST Freight</span>
                            <Row>
                                <Col lg={2} className="mt-1">
                                    <Checkbox
                                        text="Calc GST"
                                        onChange={(e) => handleChange("calc_gst_on_frt", e.target.checked ? "Y" : "N")}
                                        checked={formData?.calc_gst_on_frt === "Y"}
                                    />
                                </Col>

                                <Row className=" justify-content-between">
                                    <Col lg={3} className="mt-4">
                                        <RadioGroup
                                            className="mt-2 radio-button-wrapper box-border Transaction-height"
                                            options={[
                                                { text: "%", value: "P" },
                                                { text: "Value", value: "A" },
                                            ]}
                                            onChange={(e) => handleChange("gst_amt_prc_f", e.target.value)}
                                            checked={formData?.gst_amt_prc_f || "P"}
                                        />
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="SGST"
                                                value={formData.gst_sgst_val_f || ""}
                                                onChange={(e) => handleChange("gst_sgst_val_f", e.target.value)}
                                            />
                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_sgst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_sgst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="UGST"
                                                value={formData.gst_ugst_val_f || ""}
                                                onChange={(e) => handleChange("gst_ugst_val_f", e.target.value)}
                                            />

                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_ugst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_ugst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="CGST"
                                                value={formData.gst_cgst_val_f || ""}
                                                onChange={(e) => handleChange("gst_cgst_val_f", e.target.value)}
                                            />
                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_cgst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_cgst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="IGST"
                                                value={formData.gst_igst_val_f || ""}
                                                onChange={(e) => handleChange("gst_igst_val_f", e.target.value)}
                                            />

                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_igst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_igst_cess_val_f", e.target.value)}
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
                            <span className="text-label">packed forwarding</span>
                            <RadioGroup
                                className="radio-button-wrapper   box-border "
                                options={[
                                    { text: "None", value: "1" },
                                    { text: "Vendor", value: "2" },
                                    { text: "Us", value: "3" },
                                ]}
                                onChange={(e) => handleChange("frt_flg", e.target.value)}
                                checked={formData?.frt_flg || "1"}
                            />
                            <RadioGroup
                                className="mt-1 radio-button-wrapper"
                                options={[
                                    { text: "Percentage", value: "P" },
                                    { text: "Value", value: "V" },
                                ]}
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
                            <span className="text-label">GST Freight</span>
                            <Row>
                                <Col lg={2} className="mt-1">
                                    <Checkbox
                                        text="Calc GST"
                                        onChange={(e) => handleChange("calc_gst_on_frt", e.target.checked ? "Y" : "N")}
                                        checked={formData?.calc_gst_on_frt === "Y"}
                                    />
                                </Col>

                                <Row className=" justify-content-between">
                                    <Col lg={3} className="mt-4">
                                        <RadioGroup
                                            className="mt-2 radio-button-wrapper box-border Transaction-height"
                                            options={[
                                                { text: "%", value: "P" },
                                                { text: "Value", value: "A" },
                                            ]}
                                            onChange={(e) => handleChange("gst_amt_prc_f", e.target.value)}
                                            checked={formData?.gst_amt_prc_f || "P"}
                                        />
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="SGST"
                                                value={formData.gst_sgst_val_f || ""}
                                                onChange={(e) => handleChange("gst_sgst_val_f", e.target.value)}
                                            />
                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_sgst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_sgst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="UGST"
                                                value={formData.gst_ugst_val_f || ""}
                                                onChange={(e) => handleChange("gst_ugst_val_f", e.target.value)}
                                            />

                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_ugst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_ugst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="CGST"
                                                value={formData.gst_cgst_val_f || ""}
                                                onChange={(e) => handleChange("gst_cgst_val_f", e.target.value)}
                                            />
                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_cgst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_cgst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                    <Col sm={6} md={3} lg={2}>
                                        <Row>
                                            <TextField
                                                type="text"
                                                label="IGST"
                                                value={formData.gst_igst_val_f || ""}
                                                onChange={(e) => handleChange("gst_igst_val_f", e.target.value)}
                                            />

                                            <TextField
                                                type="text"
                                                label="Cess"
                                                value={formData.gst_igst_cess_val_f || ""}
                                                onChange={(e) => handleChange("gst_igst_cess_val_f", e.target.value)}
                                            />
                                        </Row>
                                    </Col>
                                </Row>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
            <Row className="mt-2 mt-2 justify-content-between ">
                <Col xl={3} className="">
                    <TextField
                        type="text"
                        label="Despatch By"
                        value={formData.desp_by || ""}
                        onChange={(e) => handleChange("desp_by", e.target.value)}
                    />
                </Col>

                <Col xl={3} className="">
                    <TextField
                        type="text"
                        label="Banker"
                        value={formData.our_bankers || ""}
                        onChange={(e) => handleChange("our_bankers", e.target.value)}
                    />
                </Col>


                <Col xl={3} className="">
                    <TextField
                        type="text"
                        label="Sp Instruction"
                        value={formData.sp_ins || ""}
                        onChange={(e) => handleChange("sp_ins", e.target.value)}
                    />
                </Col>

                <Col xl={3} className="">
                    <TextField
                        type="text"
                        label="Delivery Schedule"
                        value={formData.dlvr_schd || ""}
                        onChange={(e) => handleChange("dlvr_schd", e.target.value)}
                    />
                </Col>

            </Row>

            <Row className="mt-4 border">
                <div className="text-wrapper">
                    <span className="text-label">Authorised Signatory</span>
                    <Row>
                        <Col className="mt-1">
                            <TextField
                                label="Signatory Name1"
                                type="text"
                                name="auth_signatory_name1"
                                value={formData?.auth_signatory_name1 || ""}
                                //maxLength={20}
                                onChange={(e) => handleChange("formData", "auth_signatory_name1", e.target.value)}
                            />
                        </Col>


                        <Col className="mt-1">
                            <TextField
                                label="Designation"
                                type="text"
                                name="auth_signatory_desig1"
                                value={formData?.auth_signatory_desig1 || ""}
                                //maxLength={20}
                                onChange={(e) => handleChange("formData", "auth_signatory_desig1", e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="">
                            <TextField
                                label="Signatory Name2"
                                type="text"
                                name="auth_signatory_name2"
                                value={formData?.auth_signatory_name2 || ""}
                                maxLength={12}
                                onChange={(e) => handleChange("formData", "auth_signatory_name2", e.target.value)}
                            // disabled
                            />
                        </Col>
                        <Col className="">
                            <TextField
                                label="Designation"
                                type="text"
                                name="auth_signatory_desig2"
                                value={formData?.auth_signatory_desig2 || ""}
                                maxLength={12}
                                onChange={(e) => handleChange("formData", "auth_signatory_desig2", e.target.value)}
                            // disabled
                            />
                        </Col>


                    </Row>
                </div>
            </Row>

        </>
    );
};

export default TermsTab;
