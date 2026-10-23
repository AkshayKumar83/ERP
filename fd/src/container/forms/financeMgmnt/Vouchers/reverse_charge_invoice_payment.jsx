import React from "react";
import { Col, Form, Row } from "reactstrap";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";

const ReverseChargeInvoicePayment = ({
  paymentFormData,
  formStatus,
  handleChange = () => {},
  handleChangeTab = () => {},
  paymentTerm=[],
}) => {
  return (
    <Form>
      <Row>
        <Col lg={9}>
          <div className="  col-sm-12 col-md-12 col-lg-12 text-wrapper box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
            <span className="text-label">Payment Details</span>
            <Row>
              <Col xl={12}>
                <Select
                  type="text"
                  label="Payment Terms"
                  value={paymentFormData?.pmt_terms || ""}
                  onChange={(e) => handleChange("pmt_terms", e.target.value)}
                  options={paymentTerm}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={2}>
              <TextField
                type="date"
                label="Due Date"
                value={paymentFormData?.due_dt || ""}
                onChange={(e) => handleChange("due_dt", e.target.value)}
                disabled
              />
              </Col>
              <Col xl={3}>
              <TextField
                type="text"
                label="Hundi No."
                value={paymentFormData?.hundi_no || ""}
                onChange={(e) => handleChange("hundi_no", e.target.value)}
              />
              </Col>
            </Row>

          </div>
        </Col>
      </Row>

      <Row className="mt-2">
          <Col lg={3}>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Insurance</span>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("ins_flg", e.target.value)}
                 checked={paymentFormData?.ins_flg || " "}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                 onChange={(e) => handleChange("ins_amt_prc", e.target.value)}
                 checked={paymentFormData?.ins_amt_prc || " "}
              />
              <TextField
                type="number"
                 value={paymentFormData?.ins_chg ?? ""}
                 onChange={(e) => handleChange("ins_chg", e.target.value)}
              />
            </div>
          </Col>
          <Col lg={9}>
            <div className="col-sm-12 col-md-12 col-lg-12 text-wrapper box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label"> Insurance GST</span>
              <Row>
                <Col lg={2} className="mt-2">
                  <Checkbox
                    text="Calc GST"
                     onChange={(e) => handleChange("calc_gst_on_ins", e.target.checked ? "Y" : "N" )}
                     checked={paymentFormData?.calc_gst_on_ins === "Y"}
                  />
                </Col>
                <Col lg={3} className="">
                    <RadioGroup
                      className=" radio-button-wrapper box-border "
                      options={[
                        { text: "%", value: "P" },
                        { text: "Value", value: "A" },
                      ]}
                       onChange={(e) => handleChange("gst_amt_prc_i", e.target.value)}
                       checked={paymentFormData?.gst_amt_prc_i || " "}
                    />
                  </Col>

                <Row className=" justify-content-between">
                 
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="SGST"
                         value={paymentFormData?.gst_sgst_val_i ?? ""}
                         onChange={(e) => handleChange("gst_sgst_val_i",e.target.value)}
                      />
                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_sgst_cess_val_i ?? ""}
                         onChange={(e) =>  handleChange( "gst_sgst_cess_val_i",  e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="UGST"
                         value={paymentFormData?.gst_ugst_val_i ?? ""}
                         onChange={(e) =>  handleChange("gst_ugst_val_i", e.target.value )}
                      />

                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_ugst_cess_val_i ?? ""}
                         onChange={(e) =>  handleChange( "gst_ugst_cess_val_i", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="CGST"
                         value={paymentFormData?.gst_cgst_val_i ?? ""}
                         onChange={(e) =>  handleChange("gst_cgst_val_i",e.target.value )}
                      />
                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_cgst_cess_val_i ?? ""}
                         onChange={(e) =>  handleChange("gst_cgst_cess_val_i", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="IGST"
                         value={paymentFormData?.gst_igst_val_i ?? ""}
                         onChange={(e) =>  handleChange("gst_igst_val_i", e.target.value  )}
                      />

                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_igst_cess_val_i ?? ""}
                         onChange={(e) =>  handleChange("gst_igst_cess_val_i", e.target.value  )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="Compensation Cess"
                         value={paymentFormData?.gst_comp_cess_val_i ?? ""}
                         onChange={(e) =>  handleChange("gst_comp_cess_val_i", e.target.value  )}
                      />
                    </Row>
                  </Col>
                </Row>
              </Row>
            </div>
          </Col>
        </Row>

      <Row className="mt-2">
          <Col lg={3}>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Freight</span>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("frt_flg", e.target.value)}
                 checked={paymentFormData?.frt_flg || ""}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                 onChange={(e) => handleChange("frt_amt_prc", e.target.value)}
                 checked={paymentFormData?.frt_amt_prc || ""}
              />
              <TextField
                type="number"
                 value={paymentFormData?.frt_chg ?? ""}
                 onChange={(e) => handleChange("frt_chg", e.target.value)}
              />
            </div>
          </Col>
          <Col lg={9}>
            <div className="  col-sm-12 col-md-12 col-lg-12 text-wrapper box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label"> Freight GST</span>
              <Row>
                <Col lg={2} className="mt-2">
                  <Checkbox
                    text="Calc GST"
                     onChange={(e) => handleChange("calc_gst_on_frt", e.target.checked ? "Y" : "N" )}
                     checked={paymentFormData?.calc_gst_on_frt === "Y"}
                  />
                </Col>
                <Col lg={3} className="">
                    <RadioGroup
                      className=" radio-button-wrapper box-border "
                      options={[
                        { text: "%", value: "P" },
                        { text: "Value", value: "A" },
                      ]}
                       onChange={(e) => handleChange("gst_amt_prc_f", e.target.value)}
                       checked={paymentFormData?.gst_amt_prc_f || " "}
                    />
                  </Col>

                <Row className=" justify-content-between">
                 
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="SGST"
                         value={paymentFormData?.gst_sgst_val_f ?? ""}
                         onChange={(e) => handleChange("gst_sgst_val_f",e.target.value)}
                      />
                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_sgst_cess_val_f ?? ""}
                         onChange={(e) =>  handleChange( "gst_sgst_cess_val_f",  e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="UGST"
                         value={paymentFormData?.gst_ugst_val_f ?? ""}
                         onChange={(e) =>  handleChange("gst_ugst_val_f", e.target.value )}
                      />

                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_ugst_cess_val_f ?? ""}
                         onChange={(e) =>  handleChange( "gst_ugst_cess_val_f", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="CGST"
                         value={paymentFormData?.gst_cgst_val_f ?? ""}
                         onChange={(e) =>  handleChange("gst_cgst_val_f",e.target.value )}
                      />
                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_cgst_cess_val_f ?? ""}
                         onChange={(e) =>  handleChange("gst_cgst_cess_val_f", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="IGST"
                         value={paymentFormData?.gst_igst_val_f ?? ""}
                         onChange={(e) =>  handleChange("gst_igst_val_f", e.target.value  )}
                      />

                      <TextField
                        type="number"
                        label="Cess"
                         value={paymentFormData?.gst_igst_cess_val_f ?? ""}
                         onChange={(e) =>  handleChange("gst_igst_cess_val_f", e.target.value  )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="Compensation Cess"
                         value={paymentFormData?.gst_comp_cess_val_f ?? ""}
                         onChange={(e) =>  handleChange("gst_comp_cess_val_f", e.target.value  )}
                      />
                    </Row>
                  </Col>
                </Row>
              </Row>
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col lg={5}>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Packing & Forwarding</span>
              <Row>
              <Col lg={6} className="mt-1">
                    <RadioGroup
                      className=" radio-button-wrapper box-border "
                      options={[
                        { text: "Percentage", value: "P" },
                        { text: "Value", value: "A" },
                      ]}
                       onChange={(e) => handleChange("pack_amt_prc", e.target.value)}
                       checked={paymentFormData?.pack_amt_prc ?? " "}
                    />
                  </Col>
                  <Col lg={6} className="mt-1">
                  <TextField
                        type="number"
                        // label="Compensation Cess"
                         value={paymentFormData?.pack_forw ?? ""}
                         onChange={(e) =>  handleChange("pack_forw", e.target.value  )}
                      />
                  </Col>
                  </Row>
                  
            </div>
          </Col>
          <Col lg={6}>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">TCS</span>
              <Row>
                  <Col lg={4} className="mt-1">
                  <TextField
                        type="number"
                         label="TCS %"
                         value={paymentFormData?.tcs_perc ?? ""}
                         onChange={(e) =>  handleChange("tcs_perc", e.target.value  )}
                      />
                  </Col>
                  <Col lg={4} className="mt-1">
                  <TextField
                        type="number"
                         label="TCS Surch  %"
                         value={paymentFormData?.tcs_surch ?? ""}
                         onChange={(e) =>  handleChange("tcs_surch", e.target.value  )}
                      />
                  </Col>
                  <Col lg={4} className="mt-1">
                  <TextField
                        type="number"
                         label="TCS Cess %"
                         value={paymentFormData?.tcs_cess ?? ""}
                         onChange={(e) =>  handleChange("tcs_cess", e.target.value  )}
                      />
                  </Col>
                  </Row>
                  
            </div>
          </Col>
        </Row>
        {/* <Row className="d-flex justify-content-center mt-4">
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Main')}}> Main Details </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Items')}}> Items </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Despatch')}}>Despatch </ButtonUi>
          </Col>
          </Row> */}
    </Form>
  );
};

export default ReverseChargeInvoicePayment;
