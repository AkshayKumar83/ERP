import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Card,
  Form,
} from "reactstrap";
import Select from "../../../../components/basic/select";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import {
  genCreateGSTEntries,
  itcRefHelpListHeader,
} from "./purchase_voucher_helper";

const PurchaseGstDetail = ({
  formData = {},
  formStatus = "",
  handleChange = () => {},
  toggleModal = () => {},
  isModalOpen,
  openHelpList = () => {},
  setGSTFormData = () => {},
  division_id,
  setTdfmTranData,
  setThfmTranData,
  setFormControlData,
}) => {
  function handleSubmit() {}

  const resetGSTFormData = () => {
    setGSTFormData({});
    toggleModal();
  };
  return (
    <Modal isOpen={isModalOpen} toggle={resetGSTFormData} size="md">
      <ModalHeader toggle={resetGSTFormData}></ModalHeader>
      <ModalBody>
        <Form id={"exp-gst-form"}>
          {/* <Row>
                <Col xl={7} className="m-auto"> */}
          <Card
            className="mb-2 p-2 mt-2"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
            }}
          >
            <Row className="mt-3">
              <Col xl={6}>
                <TextField
                  label="ITC Reference"
                  name="itc_ref"
                  value={formData.itc_ref || ""}
                  onChange={(e) => handleChange(e, "itc_ref", e.target.value)}
                  onDoubleClick={(e) =>
                    openHelpList("itc_ref", itcRefHelpListHeader)
                  }
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <TextField
                  label="Party Reference"
                  name="disp_party"
                  value={formData.disp_party || ""}
                  onChange={(e) => handleChange(e, "itc_ref", e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={6}>
                <TextField
                  name="bill_no"
                  value={formData.bill_no || ""}
                  disabled
                  onChange={(e) => handleChange(e, "itc_ref", e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col xl={6}>
                <TextField
                  type="date"
                  name="bill_date"
                  value={formData.bill_date || ""}
                  disabled
                  onChange={(e) => handleChange(e, "itc_ref", e.target.value)}
                />
              </Col>
            </Row>

            <Row className="mt-3 ">
              <Col>
                <ButtonUi onClick={resetGSTFormData}>Return</ButtonUi>
              </Col>
              <Col>
                <ButtonUi
                  onClick={() =>
                    genCreateGSTEntries(
                      {
                        gstFormData: formData,
                        division_id,
                        setThfmTranData,
                        setTdfmTranData,
                        setFormControlData,
                      },
                      toggleModal
                    )
                  }
                >
                  Create GST Entries
                </ButtonUi>
              </Col>
            </Row>
          </Card>
          {/* </Col>
            </Row> */}
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default PurchaseGstDetail;
