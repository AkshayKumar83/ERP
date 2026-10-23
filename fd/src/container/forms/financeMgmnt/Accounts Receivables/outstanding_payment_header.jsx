import React, { useEffect } from "react";
import { Card, Col, Container, Form, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import { handleValidateField, partyCodeHelpListHeader } from "./outstanding_payment_helper";
import toast from "react-hot-toast";

const OutstandingPaymentHeader = ({ formData, handleChange, formStatus,setFormData,
    handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
 }) => {


  
  const handleDoubleClick = (field, header) => {
  if (!["Insert","Search", "Update"].includes(formStatus)) return;

  // --- Check if trans_year is required before opening helplist ---
  if (field !== "trans_year" && !formData.trans_year && formStatus !== "Search") {
    toast.error("Please enter the Year of Outstanding Bill...");
    document.getElementById("trans_year")?.focus();
    return;
  }
  

  setHelpFor(field);
  setHelpListHeader(header);
  handleHelpList(true);
};


   useEffect(() => {
  if (formStatus === "Insert") {
    setFormData((prev) => ({
      ...prev,
      debt_cred: "D",   
      trans_type: "OS" 
    }));
  }
}, [formStatus]);

  return (
    // <Form id = 'out-pay-hdr'>
        <Row className="d-flex justify-content-center">
            <Col xl={7}>  

      <Card>
        <Container>
        <Row className="">
          <Col sm={12} md={4} xl={4} className="mt-4">
            <RadioGroup
              className="radio-button-wrapper box-border "
              options={[
                { text: "Debtor", value: "D" },
                { text: "Creditor", value: "C" },
              ]}
              onChange={(e) => handleChange("debt_cred", e.target.value, e)}
              checked={formData?.debt_cred }
            />
          </Col>
          <Col sm={4} md={3} xl={3}>
            <TextField
              type="text"
              label="Year"
               name="trans_year"
              maxLength={4}
              value={formData?.trans_year || ""}
              onChange={(e) => handleChange("trans_year", e.target.value, e)}
              onBlur={(e) => handleValidateField(e, formStatus)}
              required
            />
          </Col>

          <Col sm={7} md={5} xl={5} className="mt-4">
            <RadioGroup
              className="radio-button-wrapper box-border "
              options={[{ text: "Outstanding Payments", value: "OS" }]}
              onChange={(e) => handleChange("trans_type", e.target.value, e)}
              checked={formData?.trans_type }
              // maxLength={2}
            />
          </Col>
        </Row>

        <Row  className="mt-1">
          <Col sm={6} md={4} xl={3}>
            <TextField
              type="text"
              label="Party Code"
              name='acc_no'
              value={formData?.acc_no || ""}
              maxLength={20}
              onChange={(e) => handleChange("acc_no", e.target.value, e)}
               onDoubleClick={() => handleDoubleClick("PartyCode", partyCodeHelpListHeader)}
                onBlur={(e) => handleValidateField(e, formStatus)}
                required
            />
          </Col>
          <Col sm={6} md={4} xl={9}>
            <TextField
              type="text"
              label="Party Name"
              value={formData?.party_desc || ""}
              onChange={(e) => handleChange("party_desc", e.target.value, e)}
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1  mb-2">
          <Col sm={6} md={4} xl={3}>
            <TextField
              type="text"
              label="Voucher No"
              name='voucher_no'
              maxLength={15}
              value={formData?.voucher_no || ""}
              onChange={(e) => handleChange("voucher_no", e.target.value, e)}
                // onBlur={(e) => handleValidateField(e, formStatus)}
                // required
            />
          </Col>
          <Col sm={6} md={4} xl={3}>
            <TextField
              type="date"
              label="Date"
              name='voucher_dt'
              value={formData?.voucher_dt || ""}
              onChange={(e) => handleChange("voucher_dt", e.target.value, e)}
               onBlur={(e) => handleValidateField(e, formStatus)}
               required
            />
          </Col>
          <Col sm={12} md={12} xl={6}>
            <TextField
              type="text"
              label="Remarks"
              maxLength={1000}
              value={formData?.remarks || ""}
              onChange={(e) => handleChange("remarks", e.target.value, e)}
            />
          </Col>
        </Row>
        </Container>
      </Card>

      </Col>
      </Row>
    // </Form>
  );
};

export default OutstandingPaymentHeader;
