import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Row,
  Col,
} from "reactstrap";
import ButtonUi from "../basic/button";
import TextField from "../basic/textField";
import Select from "../basic/select";
// import TextField from "../components/TextField";

const LoanDetailsModal = ({ isOpen, onClose }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    emp_cd: "",
    emp_name: "",
    loan_code: "",
    loan_acc_no: "",
    principal: "",
    installment: "",
    int_perc: "",
    int_amt: "",
    balance: "",
    start_month: "",
  });

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Loan Details</ModalHeader>

      <ModalBody>
        <Form>
          <Row>
            <Col md={6}>
              <TextField
                label="Emp Code"
                type="text"
                name="emp_cd"
                value={formData.emp_cd}
                onChange={(e) => handleChange("emp_cd", e.target.value)}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Installment Amount"
                type="text"
                name="installment"
                value={formData.installment}
                onChange={(e) => handleChange("installment", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextField
                label="Name"
                type="text"
                name="emp_name"
                value={formData.emp_name}
                onChange={(e) => handleChange("emp_name", e.target.value)}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Interest Percentage"
                type="text"
                name="int_perc"
                value={formData.int_perc}
                onChange={(e) => handleChange("int_perc", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Select
                label="Loan Description"
                name="loan_code"
                value={formData.loan_code}
                onChange={(e) => handleChange("loan_code", e.target.value)}
                options={[{ value: "P", label: "sdsdsd" }]}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Interest Amount"
                type="text"
                name="int_amt"
                value={formData.int_amt}
                onChange={(e) => handleChange("int_amt", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextField
                label="Loan A/C No."
                type="text"
                name="loan_acc_no"
                value={formData.loan_acc_no}
                onChange={(e) => handleChange("loan_acc_no", e.target.value)}
              />
            </Col>
            <Col md={6}>
              <TextField
                label="Current Balance"
                type="text"
                name="balance"
                value={formData.balance}
                onChange={(e) => handleChange("balance", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextField
                label="Principal Amount"
                type="text"
                name="principal"
                value={formData.principal}
                onChange={(e) => handleChange("principal", e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Select
                label="Start Month"
                name="start_month"
                value={formData.start_month}
                onChange={(e) => handleChange("start_month", e.target.value)}
                options={[{ value: "P", label: "March" }]}
              />
            </Col>
          </Row>
        </Form>
      </ModalBody>

      <ModalFooter>
        <ButtonUi color="secondary" outline onClick={onClose} type="button">
          Return
        </ButtonUi>
      </ModalFooter>
    </Modal>
  );
};

export default LoanDetailsModal;
