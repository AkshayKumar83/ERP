import React from "react";
import { Col, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";

const SaleOrderChargesTab = ({chrgFormData, formStatus, handleChange=()=>{}, handleChangeTab=()=>{}}) => {
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
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("ins_flag", e.target.value)}
                 checked={chrgFormData?.ins_flag || "1"}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                 onChange={(e) => handleChange("ins_amt_prc", e.target.value)}
                 checked={chrgFormData?.ins_amt_prc || "P"}
              />
              <TextField
                type="text"
                 value={chrgFormData.ins_chg || ""}
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
                     onChange={(e) => handleChange("calc_gst_on_ins", e.target.checked ? "Y" : "N" )}
                     checked={chrgFormData?.calc_gst_on_ins === "Y"}
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
                       checked={chrgFormData?.gst_amt_prc_i || "P"}
                    />
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="SGST"
                         value={chrgFormData.gst_sgst_val_i || ""}
                         onChange={(e) => handleChange("gst_sgst_val_i",e.target.value)}
                      />
                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_sgst_cess_val_i || ""}
                         onChange={(e) =>  handleChange("gst_sgst_cess_val_i",  e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="UGST"
                         value={chrgFormData.gst_ugst_val_i || ""}
                         onChange={(e) =>  handleChange("gst_ugst_val_i", e.target.value )}
                      />

                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_ugst_cess_val_i || ""}
                         onChange={(e) =>  handleChange("gst_ugst_cess_val_i", e.target.value)}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="CGST"
                         value={chrgFormData.gst_cgst_val_i || ""}
                         onChange={(e) =>  handleChange("gst_cgst_val_i",e.target.value )}
                      />
                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_cgst_cess_val_i || ""}
                         onChange={(e) =>  handleChange("gst_cgst_cess_val_i", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="IGST"
                         value={chrgFormData.gst_igst_val_i || ""}
                         onChange={(e) =>  handleChange("gst_igst_val_i", e.target.value  )}
                      />

                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_igst_cess_val_i || ""}
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
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("frt_flg", e.target.value)}
                 checked={chrgFormData?.frt_flg || "1"}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                 onChange={(e) => handleChange("frt_amt_prc", e.target.value)}
                 checked={chrgFormData?.frt_amt_prc || "P"}
              />
              <TextField
                type="text"
                 value={chrgFormData.frt_chg || ""}
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
                     onChange={(e) => handleChange("calc_gst_on_frt", e.target.checked ? "Y" : "N" )}
                     checked={chrgFormData?.calc_gst_on_frt === "Y"}
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
                       checked={chrgFormData?.gst_amt_prc_f || "P"}
                    />
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="SGST"
                         value={chrgFormData.gst_sgst_val_f || ""}
                         onChange={(e) => handleChange("gst_sgst_val_f",e.target.value)}
                      />
                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_sgst_cess_val_f || ""}
                         onChange={(e) =>  handleChange( "gst_sgst_cess_val_f",  e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="UGST"
                         value={chrgFormData.gst_ugst_val_f || ""}
                         onChange={(e) =>  handleChange("gst_ugst_val_f", e.target.value )}
                      />

                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_ugst_cess_val_f || ""}
                         onChange={(e) =>  handleChange( "gst_ugst_cess_val_f", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="CGST"
                         value={chrgFormData.gst_cgst_val_f || ""}
                         onChange={(e) =>  handleChange("gst_cgst_val_f",e.target.value )}
                      />
                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_cgst_cess_val_f || ""}
                         onChange={(e) =>  handleChange("gst_cgst_cess_val_f", e.target.value )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="text"
                        label="IGST"
                         value={chrgFormData.gst_igst_val_f || ""}
                         onChange={(e) =>  handleChange("gst_igst_val_f", e.target.value  )}
                      />

                      <TextField
                        type="text"
                        label="Cess"
                         value={chrgFormData.gst_igst_cess_val_f || ""}
                         onChange={(e) =>  handleChange("gst_igst_cess_val_f", e.target.value  )}
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
              <span className="text-label">Packing & Forwarding</span>
              <span>Packing & Forwarding %</span>
              <Col lg={10} className="mt-2">
                <TextField
                  type="text"
                   value={chrgFormData.pack_forw || ""}
                   onChange={(e) => handleChange("pack_forw", e.target.value)}
                />
              </Col>
            </div>
          </Col>
        </Row>
      </div>
      <Row className="mt-2  ">
        <Col className="d-flex justify-content-center">
          <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Items')}}>
            Items
          </ButtonUi>
        </Col>
      </Row>
      <Row className="mt-2 ">
        <Col className="d-flex justify-content-center">
          <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Main')}}>
            Main Details
          </ButtonUi>
        </Col>
      </Row>
    </>
  );
};

export default SaleOrderChargesTab;
