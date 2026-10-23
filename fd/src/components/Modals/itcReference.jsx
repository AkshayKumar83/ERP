import React, { useEffect, useState } from "react";
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
// import TextField from "../components/TextField";

const ItcReference = ({ 
  isOpen, 
  onClose,
  gstEntry,
  setGSTEntry
}) => {
  // State for form fields
  const [formData, setFormData] = useState({
    itc_ref: "",
    disp_party: "",
    bill_no: "",
    bill_date: "",
  });

  useEffect(() => {
    if (gstEntry && Object.values(gstEntry)) {
      setFormData(gstEntry);
    };

    return () => {
      setFormData({
        itc_ref: "",
        disp_party: "",
        bill_no: "",
        bill_date: ""
      });
    };
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ITC Ref:: ", formData);
    setGSTEntry(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>GST Entry Form</ModalHeader>

      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <TextField
                label="ITC Reference"
                type="text"
                name="itc_ref"
                value={formData.itc_ref}
                onChange={(e) => handleChange("itc_ref", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={11}>
              <TextField
                label="Party Reference"
                type="text"
                name="disp_party"
                value={formData.disp_party}
                onChange={(e) => handleChange("disp_party", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextField
                label="Bill No"
                type="text"
                name="bill_no"
                value={formData.bill_no}
                onChange={(e) => handleChange("bill_no", e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextField
                label="Bill Date"
                type="text"
                name="bill_date"
                value={formData.bill_date}
                onChange={(e) => handleChange("bill_date", e.target.value)}
              />
            </Col>
          </Row>
        </Form>
      </ModalBody>

      <ModalFooter>
        <ButtonUi color="secondary" outline onClick={onClose} type="button">
          Return
        </ButtonUi>
        <ButtonUi color="primary" outline type="button" onClick={handleSubmit}>
          Create GST Entries
        </ButtonUi>
      </ModalFooter>
    </Modal>
  );
};

export default ItcReference;
