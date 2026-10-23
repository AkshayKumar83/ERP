import React from "react";
import RadioGroup from "../../../../components/basic/radioGroup";
import { Row, Col } from "reactstrap";
import TextField from "../../../../components/basic/textField";

const PaymentReceivedEntryMainTab = ({
  mainFormData,
  handleChange,
  formStatus,
}) => {
  return (
    <>
      <Row className="d-flex justify-content-center">
        <Col sm={12} md={8} lg={5}>
          <RadioGroup
            className="radio-button-wrapper  box-border"
            options={[
              { text: "Bank", value: "B" },
              { text: "Cash", value: "C" },
              { text: "Journal", value: "J" },
              { text: "Credit Note", value: "R" },
            ]}
            onChange={(e) => handleChange("trans_code", e.target.value)}
            checked={mainFormData?.trans_code || "B"}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={6} md={4} lg={3}>
          <TextField
            type="text"
            label="Party Code"
            value={mainFormData.acc_no || ""}
            onChange={(e) => handleChange("acc_no", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={7}>
          <TextField
            type="text"
            label="Party name"
            value={mainFormData.acc_desc || ""}
            onChange={(e) => handleChange("acc_desc", e.target.value)}
             disabled
          />
        </Col>
      </Row>
      <Row className="mt-1 ">
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Voucher No."
            value={mainFormData.voucher_no || ""}
            onChange={(e) => handleChange("voucher_no", e.target.value)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="date"
            label="Voucher Date"
            value={mainFormData.voucher_dt || ""}
            onChange={(e) => handleChange("voucher_dt", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Instrument No."
            value={mainFormData.instr_no || ""}
            onChange={(e) => handleChange("instr_no", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="date"
            label="Instrument Date"
            value={mainFormData.instr_dt || ""}
            onChange={(e) => handleChange("instr_dt", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Amount"
            value={mainFormData.chq_amt || ""}
            onChange={(e) => handleChange("chq_amt", e.target.value)}
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Bank Code"
            value={mainFormData.bank_code || ""}
            onChange={(e) => handleChange("bank_code", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <TextField
            type="text"
            label="Balance Amount"
            value={mainFormData.bal_amt || ""}
            onChange={(e) => handleChange("bal_amt", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={6}>
          <TextField
            type="text"
            label="Bank Name"
            value={mainFormData.bank_name || ""}
            onChange={(e) => handleChange("bank_name", e.target.value)}
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={12} md={10} lg={8}>
          <TextField
            type="text"
            label="Remarks"
            value={mainFormData.remarks || ""}
            onChange={(e) => handleChange("remarks", e.target.value)}
          />
        </Col>
        <Col sm={6} md={6} lg={2}>
          <TextField
            type="text"
            label="Misc. Jrnl Vch No."
            value={mainFormData.jrnl_vch_no || ""}
            onChange={(e) => handleChange("jrnl_vch_no", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="date"
            label="Misc. Jrnl Vch Date"
            value={mainFormData.jrnl_vch_dt || ""}
            onChange={(e) => handleChange("jrnl_vch_dt", e.target.value)}
          />
        </Col>
      </Row>
    </>
  );
};

export default PaymentReceivedEntryMainTab;
