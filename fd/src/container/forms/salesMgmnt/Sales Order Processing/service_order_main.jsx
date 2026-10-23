import React from "react";
import { Card, Col, Form, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";
import ButtonUi from "../../../../components/basic/button";

const ServiceOrderMain = ({
  formData = {},
  handleChange = () => {},
  handleChangeTab = () => {},
}) => {
  return (
    <Form>
      <Row>
        <Col sm={12} md={8} lg={8}>
          <Card className="p-2">
            <Row className="d-flex ">
              <Col sm={7} md={8} lg={4} className="mt-1">
                <RadioGroup
                  className="radio-button-wrapper  box-border"
                  options={[
                    { text: "Open", value: "A" },
                    { text: "One Time", value: "O" },
                  ]}
                  onChange={(e) => handleChange("annual_flag", e.target.value)}
                  checked={formData?.annual_flag || " "}
                />
              </Col>

              <Col sm={4} md={12} lg={8} className="d-flex mt-2">
              <p className="note-text me-4 " style={{ fontSize: "14px" }}>
                  Note: Tick this check box to do past data entry
                </p>
                <Checkbox
                  text="Past Data Entry"
                  name="foc_flag"
                  checked={formData.foc_flag !== "N"}
                  onChange={(e) => handleChange("foc_flag", e.target.checked ? "Y" : "N") }
                />
                
              </Col>
            </Row>

            <Row>

            <Col md={12} lg={3} className="mt-2 order-md-1 order-lg-1">

    <p className="note-text " style={{ fontSize: "14px" }}>
      Note: 1{")"} In case of past data entry, project number pattern
      should be like this 700/20-21
    </p>
    <span className="note-text " style={{ fontSize: "14px" }}>
      2{")"} Sales order number pattern should be like this
      BE121006350001, BS121005630001
    </span>
  </Col>

  <Col md={12} lg={9} className="order-md-2 order-lg-0">
                <Row className="mt-1  ">
                  <Col md={6} lg={5}>
                    <Select
                      label="Invoice Type"
                      name="inv_type"
                      value={formData["inv_type"] || ""}
                      onChange={(e) => handleChange("inv_type", e.target.value)}
                    />
                  </Col>
                  <Col md={6} lg={5}>
                    <Select
                      label="Order Type"
                      name="order_cat"
                      value={formData["order_cat"] || ""}
                      onChange={(e) => handleChange("order_cat", e.target.value)
                      }
                    />
                  </Col>
                </Row>

                <Row className="mt-1 ">
                  <Col md={4} lg={5}>
                    <TextField
                      type="text"
                      label="Project No."
                      value={formData.project_no || ""}
                      onChange={(e) => handleChange("project_no", e.target.value)}
                    />
                  </Col>
                  <Col md={8} lg={5}>
                    <Select
                      label="Sub Type"
                      name="inv_sub_type"
                      value={formData["inv_sub_type"] || ""}
                      onChange={(e) => handleChange("inv_sub_type", e.target.value)}
                    />
                  </Col>
                </Row>

                <Row className="mt-1  ">
                  <Col md={4} lg={3}>
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

                <Row className="mt-1 ">
                  <Col md={4} lg={3}>
                    <TextField
                      type="text"
                      label="Ship To "
                      value={formData.ship_to_code || ""}
                      onChange={(e) =>handleChange("ship_to_code", e.target.value) }
                    />
                  </Col>
                  <Col md={8} lg={7}>
                    <TextField
                      type="text"
                      label=" Name"
                      value={formData.ship_to_name || ""}
                      onChange={(e) =>handleChange("ship_to_name", e.target.value)}
                      disabled
                    />
                  </Col>
                </Row>

                <Row className="mt-1 ">
                  <Col md={4} lg={3}>
                    <TextField
                      type="text"
                      label="Bill To"
                      value={formData.bill_to_code || ""}
                      onChange={(e) => handleChange("bill_to_code", e.target.value) }
                    />
                  </Col>
                  <Col md={8} lg={7}>
                    <TextField
                      type="text"
                      label=" Name"
                      value={formData.bill_to_name || ""}
                      onChange={(e) => handleChange("bill_to_name", e.target.value) }
                      disabled
                    />
                  </Col>
                </Row>

                <Row className="mt-1  ">
                  <Col md={7} lg={7}>
                    <TextField
                      type="text"
                      label="Customer Ref. No."
                      value={formData.c_po_no || ""}
                      onChange={(e) => handleChange("c_po_no", e.target.value)}
                    />
                  </Col>
                  <Col md={5} lg={3}>
                    <TextField
                      type="date"
                      label="Date"
                      value={formData.c_po_dt || ""}
                      onChange={(e) => handleChange("c_po_dt", e.target.value)}
                    />
                  </Col>
                </Row>

                <Row className="mt-1  ">
                  <Col md={3} lg={3}>
                    <TextField
                      type="text"
                      label="Offer No."
                      value={formData.serv_offer || ""}
                      onChange={(e) =>
                        handleChange("serv_offer", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={4} lg={3}>
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
                      onChange={(e) => handleChange("curr_conv", e.target.value) }
                    />
                  </Col>
                </Row>

                <Row className="mt-1  ">
                  <Col md={4} lg={3}>
                    <Select
                      label="Location Id"
                      name="curr_cd"
                      value={formData["curr_cd"] || ""}
                      onChange={(e) => handleChange("curr_cd", e.target.value)}
                    />
                  </Col>
                  <Col md={8} lg={7}>
                    <span style={{ fontSize: "13px" }}>Method of Payment</span>
                    <RadioGroup
                      className="radio-button-wrapper  box-border"
                      options={[
                        { text: "Cash", value: "C" },
                        { text: "Cheque", value: "H" },
                        { text: "PI", value: "I" },
                        { text: "PO", value: "P" },
                      ]}
                      onChange={(e) => handleChange("mode_of_payment", e.target.value) }
                      checked={formData?.mode_of_payment || " "}
                    />
                  </Col>
                </Row>

                <Row className="mt-1  ">
                  <Col md={9} lg={10}>
                    <TextField
                      type="text"
                      label="Dealing Customer Email"
                      value={formData.deal_cust_email || ""}
                      onChange={(e) => handleChange("deal_cust_email", e.target.value) }
                    />
                  </Col>
                </Row>
              </Col>

            
            </Row>
          </Card>
        </Col>

        <Col sm={12} md={4} lg={4}>
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
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col sm={11} md={11} lg={10} className="border ms-sm-2 me-sm-4 ms-md-4 me-md-4 ms-lg-4"
        >
          <div className="text-wrapper">
            <span className="text-label">Terms & Conditions</span>
            <Row>
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
              <Col md={3} lg={6} className="">
                <Select
                  label="Price BAsis"
                  name="mode_cd"
                  value={formData["mode_cd"] || ""}
                  onChange={(e) => handleChange("mode_cd", e.target.value)}
                  options={[{}]}
                />
              </Col>
              <Col md={4} lg={2} className="">
                <TextField
                  type="text"
                  label="Sales Person"
                  value={formData.sales_pers || ""}
                  onChange={(e) => handleChange("sales_pers", e.target.value)}
                />
              </Col>
              <Col md={5} lg={4} className="">
                <TextField
                  type="text"
                  label="Name"
                  value={formData.sales_pers_name || ""}
                  onChange={(e) => handleChange("sales_pers_name", e.target.value) }
                  disabled
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row className="mt-3 ">
        <Col sm={12} md={4} lg={4}>
          <TextField
            type="text"
            label="Our Ref. No."
            value={formData.sp_ins || ""}
            onChange={(e) => handleChange("sp_ins", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="date"
            label="Our ref. Date"
            value={formData.sp_ns_date || ""}
            onChange={(e) => handleChange("sp_ns_date", e.target.value)}
          />
        </Col>
        <Col md ={3} lg={4} className="mt-4 ms-5">
          <span className="text-danger">Authorised</span>
        </Col>
      </Row>

      <Row className="mt-1">
        <Col  md ={11} lg={11}>
          <TextArea
            label="Note"
            value={formData.note || ""}
            onChange={(e) => handleChange("note", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-2">
    <div className="d-flex flex-row gap-3 justify-content-center">
        <ButtonUi type='button' color="primary" outline disabled  >Copy of Sales Order</ButtonUi>
        <ButtonUi type='button' color="dark"  onClick={()=>{handleChangeTab('Items')}}>Items</ButtonUi>
        <ButtonUi type='button' color="dark"  >Cancel Order</ButtonUi>
        <ButtonUi type='button' color="dark" onClick={()=> {handleChangeTab('Amendment')}} >Amendment</ButtonUi>
        <ButtonUi type='button' color="primary" outline disabled onClick={()=>{handleChangeTab('Volume Discount')}}>Volume Discount</ButtonUi>
        <ButtonUi type='button' color="primary" outline disabled onClick={()=>{handleChangeTab('Charges')}}>Other Charges</ButtonUi>
    </div>

</Row>
    </Form>
  );
};

export default ServiceOrderMain;
