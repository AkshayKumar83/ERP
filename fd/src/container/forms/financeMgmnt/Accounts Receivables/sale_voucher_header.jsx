import React from "react";
import { Col, Form, Row } from "reactstrap";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";

const SaleVoucherheader = ({
  formData,
  handleChange,
  formStatus,
  sections = [],
  invoices = [],
  divisions = [],
}) => {
  return (
    <Form>
      <Row>
        <Col sm={6} md={3} lg={3}>
          <Select
            required
            label="Division"
            name="division_id"
            placeholder={" "}
            value={formData.division_id || ""}
            onChange={(e) => handleChange("party_name", e.target.value)}
            options={divisions}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <Select
            required
            label="Section"
            name="section"
            placeholder={" "}
            value={formData.section || ""}
            onChange={(e) => handleChange("section", e.target.value)}
            options={sections}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <Select
            required
            label="Inv. Type"
            name="inv_type"
            placeholder={" "}
            value={formData.inv_type || ""}
            onChange={(e) => handleChange("inv_type", e.target.value)}
            options={invoices}
          />
        </Col>
        <Col sm={6} md={2} lg={1}>
          <TextField
            type="text"
            label="Curr. Code"
            value={formData.curr_code || ""}
            onChange={(e) => handleChange("curr_code", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={2} lg={1}>
          <TextField
            type="number"
            label="Exch. Rate"
            value={formData.exchang_rt || ""}
            disabled
            onChange={(e) => handleChange("exchang_rt", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="">
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Voucher No."
            value={formData.voucher_no || ""}
            onChange={(e) => handleChange("voucher_no", e.target.value)}
            disabled={formStatus != "Search"}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="date"
            label="Voucher Date"
            value={formData.voucher_dt || ""}
            onChange={(e) => handleChange("voucher_dt", e.target.value)}
          />
        </Col>

        {/* <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Curr. Code"
            value={formData.curr_code || ""}
            onChange={(e) => handleChange("curr_code", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Exch. Rate"
            value={formData.exchang_rt || ""}
            onChange={(e) => handleChange("exchang_rt", e.target.value)}
          />
        </Col> */}
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Bill No."
            value={formData.bill_no || ""}
            onChange={(e) => handleChange("bill_no", e.target.value)}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="date"
            label="Bill Date"
            value={formData.bill_dt || ""}
            onChange={(e) => handleChange("bill_dt", e.target.value)}
          />
        </Col>
        <Col md={2} className="mt-4  flex mt-auto">
          {formData?.posted === "Y" ? (
            <p
              className=" px-3 py-1"
              style={{
                borderRadius: "6px",
                fontSize: "10px",
                backgroundColor: "yellow",
                color: "blue",
                textAlign: "center",
              }}
            >
              Posted
            </p>
          ) : formData?.cancel === "Y" ? (
            <p
              className="px-3 py-1"
              style={{
                borderRadius: "6px",
                fontSize: "10px",
                backgroundColor: "yellow",
                color: "red",
                textAlign: "center",
              }}
            >
              Cancelled
            </p>
          ) : null}
        </Col>
      </Row>
      <Row className="">
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Account Code"
            value={formData.party_code || ""}
            onChange={(e) => handleChange("party_code", e.target.value)}
            //disabled
          />
        </Col>
        <Col sm={6} md={3} lg={4}>
          <TextField
            type="text"
            label="Account Name"
            value={formData.party_name || ""}
            onChange={(e) => handleChange("party_name", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={4}>
          <TextField
            type="text"
            label="Reference"
            value={formData.reference || ""}
            onChange={(e) => handleChange("reference", e.target.value)}
            disabled
          />
        </Col>

        <Col sm={6} md={3} lg={2}>
          <TextField
            type="number"
            label="Total Amount"
            value={formData.trans_amt || ""}
            onChange={(e) => handleChange("trans_amt", e.target.value)}
            disabled
          />
        </Col>
      </Row>
    </Form>
  );
};

export default SaleVoucherheader;
