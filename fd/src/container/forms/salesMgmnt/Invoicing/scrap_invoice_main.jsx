import React from "react";
import { Card, Form } from "react-bootstrap";
import { Col, Row } from "reactstrap";
import Select from "../../../../components/basic/select";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";

const ScrapInvMain = ({
    formData = {},
    formControlData,
    formStatus = "",
    handleChange = () => {},
}) => {
    return (
        <Form id="scrap-inv-main-form">
            <Row className="gy-3">
                {/* Invoice Type */}
                <Col xs={12} md={6} lg={4} xl={3}>
                    <Select
                        label="Invoice Type"
                        name="inv_type"
                        value={formData?.inv_type || ""}
                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                        options={[{}]}
                    />
                </Col>

                {/* Document Type (Scrap, RMDA, D/C) */}
                <Col xs={12} md={6} lg={4} xl={4} className="d-flex align-items-end">
                    <RadioGroup
                        className="radio-button-wrapper box-border d-flex gap-3 mb-1 flex-wrap"
                        options={[ { text: "Scrap", value: "S" }, { text: "RMDA", value: "R" },{ text: "D/C", value: "D" },]}
                        onChange={(e) => handleChange('doc_type', e.target.value)}
                        checked={formData?.doc_type || "D"}
                    />
                </Col>

                {/* Query Only (Auth/UnAuth) */}
                <Col xs={12} md={12} lg={4} xl={5} className="  d-flex align-items-end">
                    <div className="d-flex align-items-center mb-1">
                        <label
                            htmlFor="auth_flag"
                            className="px-2 text-md-end mb-0 py-1"
                            style={{ fontSize: "13px", minWidth: "100px", textAlign: "right",}}
                        >
                            Query Only
                        </label>
                    </div>
                    <RadioGroup
                        id="auth_flag"
                        className="radio-button-wrapper box-border d-flex gap-3 mb-1 flex-wrap"
                        options={[{ text: "Authorised", value: "Y" }, { text: "UnAuthorised", value: "N" },]}
                        onChange={(e) => handleChange('auth_flag', e.target.value)}
                        checked={formData?.auth_flag || "Y"}
                    />
                </Col>
            </Row>
            <Row className="mt-2">
                <Col xl={9}>
                    <Card className="p-1 d-flex flex-column gap-1">
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    disabled
                                    type="text"
                                    label="Invoice No."
                                    value={formData.inv_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="Date"
                                    value={formData.inv_dt || ""}
                                    onChange={(e) => handleChange('inv_dt', e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    disabled
                                    type="text"
                                    label="Commodity"
                                    value={formData.commodity_desc || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={2} className="d-flex align-end pt-4 pb-1">
                                <div className="button-group-wrapper">
                                    <Checkbox
                                        text="FOC"
                                        name="foc"
                                        checked={formData.foc !== "N"}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </div>
                            </Col>
                            <Col xl={4} className="d-flex align-end pt-4 pb-1">
                                <div
                                    style={{fontSize: "18px",fontWeight: "bold",color: "red",letterSpacing: "1px",}}
                                >
                                    {formControlData.di_status_flag || "Authorised"}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={3}>
                                <TextField
                                    type="text"
                                    label={`${formControlData.di_party_code ||"di_party_code"}`}
                                    value={formData.party_code || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={9}>
                                <TextField
                                    type="text"
                                    label="Name"
                                    disabled
                                    value={formData.party_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={3}>
                                <TextField
                                    type="text"
                                    label="Ship To"
                                    disabled
                                    value={formData.ship_to || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={9}>
                                <TextField
                                    type="text"
                                    label="Name"
                                    disabled
                                    value={formData.ship_to_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={3}>
                                <TextField
                                    type="text"
                                    label="Bill To"
                                    disabled
                                    value={formData.bill_to || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={9}>
                                <TextField
                                    type="text"
                                    label="Name"
                                    disabled
                                    value={formData.bill_to_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="57F(4) Ref.No."
                                    value={formData.exc_doc_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="57F(4) Ref.dt."
                                    value={formData.exc_doc_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="Prep. Date & Time"
                                    value={formData.prep_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="GR/RR No."
                                    value={formData.gr_rr_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="GR/RR Dt."
                                    value={formData.gr_rr_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="PLA No."
                                    value={formData.pla_sno || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="PLA Dt."
                                    value={formData.pla_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="RG23A SI. No."
                                    value={formData.rg23a_sno || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="RG23A SI. Dt."
                                    value={formData.rg23a_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col>
                                <ButtonUi color="secondary">
                                    Cancel Invoice
                                </ButtonUi>
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="RG23C SI. No."
                                    value={formData.rg23c_sno || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="RG23C SI. Dt."
                                    value={formData.rg23c_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="Currency in Sales Order"
                                    value={formData.so_curr_cd || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="Exchange Rate"
                                    value={formData.so_c_ex_rate || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xl={4}>
                                <Select
                                    type="text"
                                    label="Currency"
                                    value={formData.curr_cd || ""}
                                    onChange={(e) => handleChange(e)}
                                    options={[{}]}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="Exchange Rate"
                                    value={formData.c_ex_rate || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col>
                                <TextField
                                    type="text"
                                    label="Sales Voucher No."
                                    value={formData.voucher_no || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-center ">
                            <Col xl={4} className="d-flex align-end pt-4 pb-1 ">
                                <div className="button-group-wrapper">
                                    <label
                                        htmlFor="special_dis"
                                        style={{ display: "flex", color: "red", fontWeight: "bold",}}
                                    >
                                        <Checkbox
                                            name="spl_disc_flg"
                                            checked={formData.spl_disc_flg !== "N"}
                                            onChange={(e) => handleChange(e)}
                                        />
                                        Special Discount
                                    </label>
                                </div>
                            </Col>
                            <Col xl={4} className="d-flex align-end pt-4 pb-1">
                                <div className="button-group-wrapper">
                                    <label
                                        htmlFor="cancel"
                                        style={{
                                            display: "flex",
                                            color: "red",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        <Checkbox
                                            name="calcel_flag"
                                            checked={formData.calcel_flag !== "N"}
                                            onChange={(e) => handleChange(e)}
                                        />
                                        Cancel
                                    </label>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xl={3}>
                    <Card className="p-2 d-flex flex-column gap-1 text-wrapper">
                        <span className="text-label">Total</span>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_basic_val">
                                    Basic Value
                                </label>
                                <TextField
                                    type="number"
                                    id="t_basic_val"
                                    value={formData.t_basic_val || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_ass_val">
                                    Assessable
                                </label>
                                <TextField
                                    type="number"
                                    id="t_ass_val"
                                    value={formData.t_ass_val || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_ass_val">
                                    Discount
                                </label>
                                <TextField
                                    type="number"
                                    id="t_discount"
                                    value={formData.t_discount || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_gst_sgst_amt">
                                    SGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_sgst_amt"
                                    value={formData.t_gst_sgst_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px", }} htmlFor="t_gst_sgst_cess_amt">
                                    SGST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_sgst_cess_amt"
                                    value={formData.t_gst_sgst_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{
                                        minWidth: "100px",
                                        textAlign: "right",
                                        paddingInline: "5px",
                                    }}
                                    htmlFor="t_gst_ugst_amt"
                                >
                                    UGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_ugst_amt"
                                    value={formData.t_gst_ugst_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}}
                                    htmlFor="t_gst_ugst_cess_amt"
                                >
                                    GST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_ugst_cess_amt"
                                    value={formData.t_gst_ugst_cess_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px", }} htmlFor="t_gst_cgst_amt">
                                    CGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_cgst_amt"
                                    value={formData.t_gst_cgst_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_gst_cgst_cess_amt">
                                    CGST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_cgst_cess_amt"
                                    value={formData.t_gst_cgst_cess_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_gst_igst_amt">
                                    IGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_igst_amt"
                                    value={formData.t_gst_igst_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_gst_igst_cess_amt">
                                    IGST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_igst_cess_amt"
                                    value={formData.t_gst_igst_cess_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px",}} htmlFor="t_tcs_val">
                                    TCS
                                </label>
                                <TextField
                                    type="number"
                                    id="t_tcs_val"
                                    value={formData.t_tcs_val || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "100px", textAlign: "right", paddingInline: "5px", color: "blue", fontWeight: "bold",}}
                                    htmlFor="net_amt"
                                >
                                    Net Amount
                                </label>
                                <TextField
                                    type="number"
                                    id="net_amt"
                                    value={formData.net_amt || ""}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                    inpClass="bkg-pink"
                                />
                            </Col>
                        </Row>
                    </Card>
                    <Row className="d-flex justify-content-center mt-4">
                      <Col xl={1}>
                        <TextField
                          disabled
                          type="number"
                          name="curr_plabal"
                          value={formData.curr_plabal||''}
                          onChange={(e) => handleChange(e)}
                        />
                      </Col>
                      <Col xl={1}>
                        <TextField
                          disabled
                          type="number"
                          name="curr_rg23cbal"
                          value={formData.curr_plabal||''}
                          onChange={(e) => handleChange(e)}
                        />
                      </Col>
                      <Col xl={1}>
                        <TextField
                          disabled
                          type="number"
                          name="curr_rg23abal"
                          value={formData.curr_plabal||''}
                          onChange={(e) => handleChange(e)}
                        />
                      </Col>
                    </Row>
                </Col>
            </Row>
        </Form>
    );
};

export default ScrapInvMain;
