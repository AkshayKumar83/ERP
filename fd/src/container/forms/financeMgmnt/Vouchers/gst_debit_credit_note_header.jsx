import React from "react";
import { Col, Row, Form } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";
import { profHelpListHeader, partyHelpListHeader, invHelpListHeader, orderHelpListHeader } from "./gst_debit_credit_note_helper";
import toast from "react-hot-toast";

const GstDebitCreditNoteHeader = ({ formData = {}, handleChange, formStatus, reason = [], setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
}) => {

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };


  return (
    <>
      <Form>
        <Row className="d-flex justify-content-center">
          <Col sm={6} md={6} lg={3} className="mt-1">
            <RadioGroup
              className="radio-button-wrapper  box-border"
              options={[
                { text: "Customer", value: "C" },
                { text: "Vendor", value: "V" },
              ]}
              onChange={(e) => handleChange("formData", "vend_cust_flag", e.target.value, null, e)}
              checked={formData?.vend_cust_flag || "C"}
            />
          </Col>
          <Col sm={12} md={12} lg={7} className="mt-sm-3 mt-md-3 mt-lg-0">
            <div className="text-wrapper">
              <span className="text-label">Transaction Type</span>
              <RadioGroup
                className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
                options={[
                  { text: "Credit Note", value: "C" },
                  { text: "Debit Note", value: "D" },
                  // { text: "Advance", value: "A" },
                  // { text: "Refund", value: "R" },
                  // { text: "Payment", value: "P" },
                ]}
                onChange={(e) => handleChange("formData", "trans_type", e.target.value, null, e)}
                checked={formData?.trans_type || "C"}
              />
            </div>
          </Col>
          <Col sm={12} md={12} lg={2} className="mt-2" style={{ color: "red" }}>
            <p style={{
              textAlign: "center",
              color: "red",
              fontWeight: 'Bold',
              fontSize: '18px'

            }}
            >
              {formData.auth_flag === "Y" ? "AUTHORISED" : ''}
            </p>
          </Col>
        </Row>

        <Row>
          <Col sm={12} md={12} lg={6}>
            <Row>
              <Col sm={5} md={4} lg={3}>
                <TextField
                  required
                  type="text"
                  label="Party Code"
                  value={formData.party_code || ""}
                  onChange={(e) => handleChange("formData", "party_code", e.target.value, null, e)}
                  onDoubleClick={() => handleDoubleClick("party", partyHelpListHeader)}
                  onBlur={(e) => validateRequiredField(e, "Party Code")}

                />
              </Col>
              <Col sm={7} md={8} lg={6} className="mt-4">
                <TextField
                  type="text"
                  // label="Party name"
                  value={formData.party_name || ""}
                  onChange={(e) => handleChange("formData", "party_name", e.target.value, null, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col sm={6} md={8} lg={6}>
                <TextField
                  type="text"
                  label=" Order Po/Wo No."
                  value={formData.order_no || ""}
                  onChange={(e) => handleChange("formData", "order_no", e.target.value, null, e)}
                  onDoubleClick={() => handleDoubleClick("order", orderHelpListHeader)}
                  // onBlur={(e) => validateRequiredField(e, "Order Po/Wo No.")}

                />
              </Col>
              <Col sm={6} md={4} lg={3}>
                <TextField
                  type="date"
                  label="Order Date"
                  value={formData.order_dt || ""}
                  onChange={(e) => handleChange("formData", "order_dt", e.target.value, null, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col sm={6} md={8} lg={6}>
                <TextField
                  type="text"
                  label="Prof Inv No."
                  value={formData.prof_inv_no || ""}
                  onChange={(e) => handleChange("formData", "prof_inv_no", e.target.value, null, e)}
                  onDoubleClick={() => handleDoubleClick("prof", profHelpListHeader)}
                />
              </Col>
              <Col sm={6} md={4} lg={3}>
                <TextField
                  type="date"
                  label="Prof Inv Date"
                  value={formData.prof_inv_dt || ""}
                  onChange={(e) => handleChange("formData", "prof_inv_dt", e.target.value, null, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col sm={6} md={8} lg={6}>
                <TextField
                  type="text"
                  label="Invoice No."
                  value={formData.inv_no || ""}
                  onChange={(e) => handleChange("formData", "inv_no", e.target.value, null, e)}
                  onDoubleClick={() => handleDoubleClick("inv", invHelpListHeader)}
                  // onBlur={(e) => validateRequiredField(e, "Invoice No")}

                />
              </Col>
              <Col sm={6} md={4} lg={3}>
                <TextField
                  type="date"
                  label="Invoice Date"
                  value={formData.inv_dt || ""}
                  onChange={(e) => handleChange("formData", "inv_dt", e.target.value, null, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col sm={6} md={8} lg={6}>
                <TextField
                  type="text"
                  label="Party Reference No."
                  value={formData?.party_ref_no || ""}
                  maxLength={30}
                  // onChange={(e) => handleChange("formData","party_ref_no", e.target.value, null, e)}
                  onChange={(e) => {

                    console.log(e.target.value, null, e)
                    handleChange("formData", "party_ref_no", e.target.value, null, e)
                  }

                  }

                />
              </Col>
              <Col sm={6} md={4} lg={3}>
                <TextField
                  type="date"
                  label="Party Date"
                  value={formData.party_ref_date || ""}
                  onChange={(e) => handleChange("formData", "party_ref_date", e.target.value, null, e)}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={12} md={12} lg={9}>
                <TextArea
                  type="text"
                  label="Remark"
                  value={formData.remark || ""}
                  maxLength={4000}
                  onChange={(e) => handleChange("formData", "remark", e.target.value, null, e)}
                />
              </Col>
            </Row>
          </Col>

          <Col lg={6}>
            <Row className="mt-1">
              <Col sm={12} md={10} lg={6}>
                <TextField
                  type="text"
                  label="Trans No."
                  value={formData.trans_no || ""}
                  onChange={(e) => handleChange("formData", "trans_no", e.target.value, null, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col sm={6} md={3} lg={3}>
                <TextField
                  required
                  type="date"
                  label=" Trans. Date"
                  value={formData.trans_date || ""}
                  onChange={(e) => handleChange("formData", "trans_date", e.target.value, null, e)}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col sm={12} md={10} lg={5}>
                <TextField
                  type="text"
                  label="Voucher"
                  value={formData.voucher_no || ""}
                  onChange={(e) => handleChange("formData", "voucher_no", e.target.value, null, e)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <Col sm={6} md={6} lg={4} className="button-group-wrapper mt-3">
                <Checkbox
                  // required
                  text="Subject to Reverse"
                  onChange={(e) => handleChange("formData", "subject_2_reverse", e.target.checked ? "Y" : "N")}
                  checked={formData?.subject_2_reverse === "Y"}
                />
              </Col>
              <Col sm={6} md={6} lg={6} className="button-group-wrapper mt-3   ">
                <Checkbox
                  text="LUT Bond"
                  onChange={(e) =>
                    handleChange("formData", "lut_bond_flag", e.target.checked ? "Y" : "N")
                  }
                  checked={formData?.lut_bond_flag === "Y"}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col lg={10}>
                <Select
                  required
                  label=" Reason"
                  name="reason_id"
                  // placeholder={" "}
                  value={formData.reason_id || ""}
                  onChange={(e) =>
                    handleChange("formData", "reason_id", e.target.value, null, e)
                  }
                  options={reason}
                />
              </Col>

            </Row>
            <Row className="mt-1">
              <Col sm={12} md={12} lg={10}>
                <TextArea
                  type="text"
                  label="Document Through"
                  value={formData.doc_thru || ""}
                  onChange={(e) => handleChange("formData", "doc_thru", e.target.value, null, e)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default GstDebitCreditNoteHeader;
