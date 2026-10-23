import React from "react";
import Select from "../../../../components/basic/select";
import { Col, Row, Form } from "reactstrap";
import Checkbox from "../../../../components/basic/checkbox";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";

const JournalVoucherHeader = ({
  formData,
  handleChange,
  formStatus,
  sections = [],
  runValidations,
}) => {
  return (
    <Form id="journal-voucher-header-form" autocomplete="off">
      <Row className="justify-content-between">
        <Col sm={6} md={6} lg={3}>
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
        <Col sm={6} md={3} lg={2} className="button-group-wrapper mt-2 ">
          <Checkbox
            text="Memorandum Voucher"
            onChange={(e) => handleChange("memo_vchr", e.target.checked ? "Y" : "N")}
            checked={formData?.memo_vchr === "Y"}
          />
        </Col>
        <Col sm={6} md={6} lg={4}>
          <span style={{ fontSize: "13px" }}>For Query Only</span>
          <RadioGroup
            className="radio-button-wrapper  box-border mt-1"
            options={[
              { text: "Authorised", value: "Y" },
              { text: "Unauthorised", value: "N" },
              { text: "All", value: "" },
            ]}
            onChange={(e) => handleChange("posted", e.target.value)}
            checked={formData?.posted || ""}
            disabled={['Insert', 'Update'].includes(formStatus) ? true : false}
          />
        </Col>

        <Col lg={2}>
          {formData?.posted === "Y" ? (
            <p
              className="mt-3 px-3 py-1"
              style={{
                borderRadius: "6px",
                fontSize: '10px',
                backgroundColor: "yellow",
                color: "blue",
                textAlign: "center",
              }}
            >
              Posted
            </p>
          ) : formData?.cancel === "Y" ? (
            <p
              className="mt-3 px-3 py-1"
              style={{
                borderRadius: "6px",
                fontSize: '10px',
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

      <Row className="mt-1">
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Voucher No."
            value={formData.voucher_no || ""}
            onChange={(e) => handleChange("voucher_no", e.target.value)}
            disabled={formStatus == 'Search' ? false : true}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            required
            type="date"
            label="Voucher Date"
            value={formData.voucher_dt || ""}
            onChange={(e) => handleChange("voucher_dt", e.target.value)}
            onBlur={(e) => runValidations("voucher_dt", e.target.value)}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            required
            type="text"
            label="Currency"
            value={formData.curr_code || ""}
            onChange={(e) => handleChange("curr_code", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            required
            type="text"
            label="Exchange rate"
            //value={formData.exchang_rt || ""}
            value={
              formData.exchang_rt !== undefined && formData.exchang_rt !== null
                ? Number(formData.exchang_rt).toFixed(2)
                : ""
            }
            onChange={(e) => handleChange("exchang_rt", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="Date"
            label="Bill Date"
            value={formData.bill_dt || ""}
            onChange={(e) => handleChange("bill_dt", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={12} lg={8}>
          <TextField
            type="text"
            label="Reference"
            value={formData.reference || ""}
            onChange={(e) => handleChange("reference", e.target.value)}
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="number"
            label="Voucher Amount"
            //value={formData?.trans_amt || ""}
            value={
              formData.trans_amt !== undefined && formData.trans_amt !== null
                ? Number(formData.trans_amt).toFixed(2)
                : ""
            }
            onChange={(e) => handleChange("trans_amt", e.target.value)}
            disabled
          />
        </Col>
      </Row>
    </Form>
  );
};

export default JournalVoucherHeader;
