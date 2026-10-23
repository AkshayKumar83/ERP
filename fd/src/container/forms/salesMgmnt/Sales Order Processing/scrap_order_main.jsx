import React from "react";
import { Card, Col, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";
import ButtonUi from "../../../../components/basic/button";

const SrapOderMain = ({ formData = {}, handleChange = () => {} , handleChangeTab=()=>{}}) => {
  return (
    <Form>

      <Row>
        <Col sm={12} md={7} lg={6}>

          <Card className="p-2 ms-2">

            <Row className="d-flex justify-content-center">
              <Col sm={7} md={8} lg={5} className="mt-1">
                <RadioGroup
                  className="radio-button-wrapper  box-border"
                  options={[
                    { text: "Open", value: "A" },
                    { text: "One Time", value: "O" },
                  ]}
                  onChange={(e) => handleChange("annual_flag", e.target.value) }
                  checked={formData?.annual_flag || " "}
                />
              </Col>
              <Col sm={4} md={3} lg={4} className="mt-2">
                <Checkbox
                  text="FOC"
                  name="foc_flag"
                  checked={formData.foc_flag !== "N"}
                  onChange={(e) =>
                    handleChange("foc_flag", e.target.checked ? "Y" : "N" ) }
                />
              </Col>
            </Row>

            <Row className="mt-1 ms-lg-2 ">
              <Col md={4} lg={4}>
                <TextField
                  type="text"
                  label="Customer Code"
                  value={formData.c_code || ""}
                  onChange={(e) => handleChange("c_code", e.target.value)}
                />
              </Col>
              <Col md={8} lg={7}>
                <TextField
                  type="text"
                  label=" Name"
                  value={formData.c_name || ""}
                  onChange={(e) => handleChange("c_name", e.target.value)}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mt-1 ms-lg-2">
              <Col md={4} lg={4}>
                <TextField
                  type="text"
                  label="Ship To "
                  value={formData.ship_to_code || ""}
                  onChange={(e) => handleChange("ship_to_code", e.target.value)}
                />
              </Col>
              <Col md={8} lg={7}>
                <TextField
                  type="text"
                  label=" Name"
                  value={formData.ship_to_name || ""}
                  onChange={(e) => handleChange("ship_to_name", e.target.value)}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mt-1 ms-lg-2">
              <Col md={4} lg={4}>
                <TextField
                  type="text"
                  label="Bill To"
                  value={formData.bill_to_code || ""}
                  onChange={(e) => handleChange("bill_to_code", e.target.value)}
                />
              </Col>
              <Col md={8} lg={7}>
                <TextField
                  type="text"
                  label=" Name"
                  value={formData.bill_to_name || ""}
                  onChange={(e) => handleChange("bill_to_name", e.target.value)}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mt-1 ms-lg-2 ">
              <Col md={7} lg={6}>
                <TextField
                  type="text"
                  label="Customer PO No."
                  value={formData.c_po_no || ""}
                  onChange={(e) => handleChange("c_po_no", e.target.value)}
                />
              </Col>
              <Col md={5} lg={4}>
                <TextField
                  type="date"
                  label="Date"
                  value={formData.c_po_dt || ""}
                  onChange={(e) => handleChange("c_po_dt", e.target.value)}
                />
              </Col>
            </Row>

            <Row className="mt-1 ms-lg-2 ">
              <Col md={7} lg={6}>
                <Select
                  label="Currency"
                  name="curr_cd"
                  value={formData["curr_cd"] || ""}
                  onChange={(e) => handleChange("curr_cd", e.target.value)}
                />
              </Col>
              <Col md={5} lg={4}>
                <TextField
                  type="text"
                  label="Currency Conv."
                  value={formData.curr_conv || ""}
                  onChange={(e) => handleChange("curr_conv", e.target.value)}
                />
              </Col>
            </Row>

          </Card>

        </Col>

        <Col sm={12} md={4} lg={4} className="mt-sm-4 mt-md-0 mt-lg-0 ms-lg-4">

          <Card className="p-3 position-relative border">
            <span
              className="position-absolute bg-white px-2 fw-bold"
              style={{ top: "-10px", left: "12px", fontSize: "14px" }}
            >
              Order
            </span>

            <Row>
              <Col md={12} lg={8}>
                <TextField
                  type="text"
                  label="Number"
                  value={formData.order_no || ""}
                  onChange={(e) => handleChange("order_no", e.target.value)}
                  disabled
                />
              </Col>
            </Row>

            <Row className="mt-2">

              <Col md={10} lg={6}>
                <Row>
                  <Col>
                    <TextField
                      type="date"
                      label="Date"
                      value={formData.order_dt || ""}
                      onChange={(e) => handleChange("order_dt", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <TextField
                      type="date"
                      label="Eff. Date"
                      value={formData.eff_dt || ""}
                      onChange={(e) => handleChange("eff_dt", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <TextField
                      type="date"
                      label="End Date"
                      value={formData.end_dt || ""}
                      onChange={(e) => handleChange("end_dt", e.target.value)}
                    />
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <TextField
                      type="date"
                      label="Delivery Date"
                      value={formData.delivery_date || ""}
                      onChange={(e) =>
                        handleChange("delivery_date", e.target.value)
                      }
                    />
                  </Col>
                </Row>
              </Col>

              <Col lg={6}>
                <Card className="p-2 mt-4 position-relative border">
                  <span
                    className="position-absolute bg-white px-2 fw-bold"
                    style={{ top: "-10px", left: "12px", fontSize: "14px" }}
                  >
                    Amendment
                  </span>
                  <Row className="">
                    <Col lg={8}>
                      <TextField
                        type="text"
                        label="No."
                        value={formData.order_amd_no || ""}
                        onChange={(e) => handleChange("order_amd_no", e.target.value) }
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row className="mt-1">
                    <Col md={10}>
                      <TextField
                        type="date"
                        label="Date."
                        value={formData.order_amd_dt || ""}
                        onChange={(e) => handleChange("order_amd_dt", e.target.value) }
                      />
                    </Col>
                  </Row>
                </Card>
                <Row className="mt-2">
                  <span className="text-danger">Authorised</span>
                </Row>
              </Col>

            </Row>
          </Card>

        </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={11} md={11} lg={10} className="border ms-sm-2 me-sm-4 ms-md-4 me-md-4 ms-lg-4">
            <div className="text-wrapper">
              <span className="text-label">Terms & Conditions</span>
               <Row >
                  <Col md={12} lg={12} className="mt-2">
                  <Select
                    label="Payment Terms"
                    name="term_code"
                    value={formData["term_code"] || ""}
                    onChange={(e) => handleChange("term_code", e.target.value)}
                    options={[{}]}
                  />
                </Col>
              </Row> 
              <Row>
                <Col md={6} lg={6} className="">
                  <Select
                    label="Mode of Transport"
                    name="mode_cd"
                    value={formData["mode_cd"] || ""}
                    onChange={(e) => handleChange("mode_cd", e.target.value)}
                    options={[{}]}
                  />
                </Col>
                <Col md={6} lg={6} className="">
                  <Select
                    label="Price Basis"
                    name="price_basis"
                    value={formData["price_basis"] || ""}
                    onChange={(e) =>
                      handleChange("price_basis", e.target.value)
                    }
                    options={[{}]}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <Row className="mt-2 ms-1">
          <Col sm={12} md={4} lg={4}>
            <TextField
              type="text"
              label="Document Thru"
              value={formData.desp_by || ""}
              onChange={(e) => handleChange("desp_by", e.target.value)}
            />
          </Col>
          <Col sm={4} md={3} lg={2}>
            <TextField
              type="text"
              label="Sales Person"
              value={formData.sales_pers_cd || ""}
              onChange={(e) => handleChange("sales_pers_cd", e.target.value)}
            />
          </Col>
          <Col sm={8} md={5} lg={4}>
            <TextField
              type="text"
              label=" Name"
              value={formData.sales_pers_name || ""}
              onChange={(e) => handleChange("sales_pers_name", e.target.value)}
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1 ms-1">
          <Col sm={12} md={4} lg={4}>
            <TextField
              type="text"
              label="Spl. Instruction"
              value={formData.sp_ins || ""}
              onChange={(e) => handleChange("sp_ins", e.target.value)}
            />
          </Col>
          <Col sm={6} md={4} lg={4}>
            <TextField
              type="text"
              label="Scheme No."
              value={formData.scheme_no || ""}
              onChange={(e) => handleChange("scheme_no", e.target.value)}
            />
          </Col>
          <Col sm={5} md={4} lg={2} className="mt-4">
            <Checkbox
              text="Special Discount"
              name="spl_disc_flg"
              checked={formData.spl_disc_flg !== "N"}
              onChange={(e) =>
                handleChange("spl_disc_flg", e.target.checked ? "Y" : "N")
              }
            />
          </Col>
        </Row>

        <Row className="mt-1 ms-1">
          <Col md={12} lg={6}>
            <TextField
              type="text"
              label="Final Dest."
              value={formData.final_dest || ""}
              onChange={(e) => handleChange("final_dest", e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-1 ms-1">
          <Col lg={11}>
            <TextArea
              label="Note"
              value={formData.note || ""}
              onChange={(e) => handleChange("note", e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-4">
    <div className="d-flex flex-row gap-3 justify-content-center">
        <ButtonUi type='button' color="primary" disabled outline >Copy of Sales Order</ButtonUi>
        <ButtonUi type='button' color="dark"  onClick={()=>{handleChangeTab('Charges')}}>Other Charges</ButtonUi>
        <ButtonUi type='button' color="dark"  onClick={()=>{handleChangeTab('Items')}}>Items</ButtonUi>
        <ButtonUi type='button' color="primary" outline disabled >Amendment</ButtonUi>
        <ButtonUi type='button' color="dark"  >Cancel Order</ButtonUi>
    </div>

</Row>

      
    </Form>
  );
};

export default SrapOderMain;
