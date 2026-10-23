import React from "react";
import { Row, Col, Container, Card } from "reactstrap";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { voucherHelpListHeader } from "./unposting_voucher_helper"

const UnpostingVoucherHeader = ({ formData, handleChange, formStatus, currentYear = [], section = [], handleUnpost,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  handleCancel,
  handleExist
}) => {

  const handleDoubleClick = (field, header) => {
    // if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    // }
  };


  return (
    <>
   <Container fluid className="d-flex justify-content-center mt-4">
    <Row className="d-flex justify-content-center">
      <Col xl={8}>
    
      <Card
    className="shadow"
    style={{
      width: "900px",
      maxWidth: "95%",
      padding: "20px",
    }}
  >
      <Row>
        <Col  lg={6}>
          <Select
            required
            label="Financial Year"
            name="curryear"
            // placeholder={" "}
            value={formData.curryear || ""}
            onChange={(e) => handleChange("curryear", e.target.value)}
            options={currentYear}
          />
        </Col>

        <Col lg={6}>
          <Select
            required
            label="Section"
            name="section"
            //placeholder={" "}
            value={formData.section || ""}
            onChange={(e) => handleChange("section", e.target.value)}
            options={section}
          />
        </Col>
      </Row>
      <Row>
        <Col  lg={6}>
          <Select
            required
            label="Voucher Type"
            name="vch_type"
            // placeholder={" "}
            value={formData.vch_type || ""}
            onChange={(e) => handleChange("vch_type", e.target.value)}
            options={[
              { value: "", label: "" },
              { value: "B", label: "Bank" },
              { value: "C1", label: "Cash" },
              { value: "J1", label: "Journal" },
              { value: "S1", label: "Sales" },
              { value: "P", label: "Purchase" },
              { value: "P0", label: "Expense" },
              { value: "DN", label: "Debit Note" },
              { value: "RN", label: "Credit Note" }
            ]}
          />
        </Col>

        {/* <Col sm={6} md={6} lg={3}>
          <Select
            required
            label="DI_VCH_CAT"
            name="p_trans"
            // placeholder={" "}
            value={formData.p_trans || ""}
            onChange={(e) => handleChange("p_trans", e.target.value)}
          />
        </Col> */}
     
        <Col  lg={6}>
          <TextField
            type="text"
            label="Voucher No."
            name="voucher_no"
            // placeholder={" "}
            value={formData.voucher_no || ""}
            onChange={(e) => handleChange("voucher_no", e.target.value)}
            onDoubleClick={() => handleDoubleClick("voucher", voucherHelpListHeader)}
          />
        </Col>
      </Row>
      <Row className="mt-3 p-4  d-flex justify-content-center">
       
            <Col lg={3}>
              <ButtonUi color="secondary"
                onClick={handleUnpost}
              >Unpost</ButtonUi>
            </Col>
            <Col  lg={3}>
              <ButtonUi color="secondary"
               onClick={handleCancel}
               >Cancel

              </ButtonUi>
            </Col>
            <Col  lg={3}>
              <ButtonUi color="secondary"
              onClick={ handleExist}
               >Exit</ButtonUi>
            </Col>
         

      </Row>
      </Card>
        </Col>
      </Row>
      </Container>
    </>
  );
};

export default UnpostingVoucherHeader;
