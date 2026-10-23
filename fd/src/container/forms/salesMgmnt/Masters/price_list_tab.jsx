import React from "react";
import { Row, Col, Form, Card, Container } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";
import {
    cusCodeHelpListHeader,
    handleCusItCodeBlur,
    handleShowCustomerProducts,
    handleValidateField,
    ProductCodeHelpListHeader,
    productDescHelpListHeader,
    showCusProdHelpListHeader,
} from "./price_list_helper";
import toast from "react-hot-toast";

const PriceListTab = ({
    formData,
    setFormData,
    formStatus,
    handleChange,
    handleHelpList = () => {},
    setHelpFor,
    setHelpListHeader,
    openHelpList = () => {},
}) => {

    

    const handleDoubleClick = (field, header) => {
  // Special check ONLY for Show Customer Product button
  if (field === "showCusProd" && ["Insert", "Update"].includes(formStatus)) {
    if (!formData.c_code || !formData.it_code) {
      toast.error("Fill Customer Code and Product Code first");
      return;
    }
  }

  // Open HelpList normally
  if (["Insert", "Search", "Update"].includes(formStatus)) {
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
  }
};

    


    return (
        <>
         <Card>
  <Container className='my-4'>
    <Row>
      <Col sm={12} md={5} xl={2}>
        <TextField
          type="text"
          id="c_code"
          name="c_code"
          label="Customer Code"
          value={formData?.c_code || ""}
          onChange={(e) => handleChange("c_code", e.target.value, e)}
          onDoubleClick={() => handleDoubleClick("cCode", cusCodeHelpListHeader)}
          onBlur={(e) => handleValidateField(e, formStatus)}
          required
        />
      </Col>
      <Col sm={12} md={7} xl={8}>
        <TextField
          type="text"
          label="Customer Name"
          value={formData?.c_name || ""}
          onChange={(e) => handleChange("c_name", e.target.value, e)}
          disabled
        />
      </Col>
    </Row>

    <Row className="mt-1">
      <Col sm={12} md={5} xl={2}>
        <TextField
          type="text"
          id="it_code"
          name="it_code"
          label="Product Code"
          value={formData?.it_code || ""}
          onChange={(e) => handleChange("it_code", e.target.value, e)}
          onDoubleClick={() => handleDoubleClick("itCode", ProductCodeHelpListHeader)}
          onBlur={(e) => handleValidateField(e, formStatus)}
          required
        />
      </Col>
      <Col sm={12} md={7} xl={8}>
        <TextField
          type="text"
          label="Description"
          value={formData?.it_desc || ""}
          onChange={(e) => handleChange("it_desc", e.target.value, e)}
          onDoubleClick={() => handleDoubleClick("itDesc", productDescHelpListHeader)}
          disabled={formStatus !== "Insert" && formStatus !== "Update"}
        />
      </Col>
    </Row>

    <Row className="mt-1">
      <Col sm={12} md={5} xl={2}>
        <TextField
          type="text"
          id="cus_it_code"
          name="cus_it_code"
          label="Customer Product Code"
          value={formData?.cus_it_code || ""}
          onChange={(e) => handleChange("cus_it_code", e.target.value, e)}
          onBlur={(e) => handleCusItCodeBlur(e,formData, formStatus)}
          required
        />
      </Col>
      <Col sm={12} md={7} xl={8}>
        <TextField
          type="text"
          id="cus_it_desc"
          name="cus_it_desc"
          label="Description"
          value={formData?.cus_it_desc || ""}
          onChange={(e) => handleChange("cus_it_desc", e.target.value, e)}
          onBlur={(e) => handleValidateField(e, formStatus)}
          required
        />
      </Col>
    </Row>

    <Row className="mt-1 ">
      <Col sm={12} md={4} xl={2}>
        <TextField
          type="date"
          id="eff_date"
          name="eff_date"
          label="Effective date for Price"
          value={formData?.eff_date || ""}
          onChange={(e) => handleChange("eff_date", e.target.value, e)}
          onBlur={(e) => handleValidateField(e, formStatus)}
          required
        />
      </Col>
      <Col sm={12} md={4} xl={2}>
        <TextField
          type="number"
          label="Customer Price"
          name='cus_it_prc'
          value={formData?.cus_it_prc ?? ""}
          onChange={(e) => handleChange("cus_it_prc", e.target.value, e)}
          //  onBlur={(e) => handleValidateField(e, formStatus)}
        />
      </Col>
      <Col sm={12} md={4} xl={2}>
        <TextField
          type="number"
          label="Tax paid Price"
          name='it_rate'
          value={formData?.it_rate ?? ""}
          onChange={(e) => handleChange("it_rate", e.target.value, e)}
          //  onBlur={(e) => handleValidateField(e, formStatus)}
        />
      </Col>
      <Col sm={12} md={3} xl={2} className="button-group-wrapper mt-4">
        <Checkbox
          text="Active"
          onChange={(e) => handleChange("active", e.target.checked ? "Y" : "N", e)}
          checked={formData?.active === "Y"}
        />
      </Col>
    </Row>
  </Container>
        </Card>


            <Row className="d-flex justify-content-center mt-4">
                <Col xl={2}>
                    <ButtonUi
                        color="secondary"
                        outline
                        // onClick={() =>handleShowCustomerProducts(formData,formStatus, setFormData)}
                         onClick={() => handleDoubleClick("showCusProd", showCusProdHelpListHeader)} >
                        Show Customer Product
                    </ButtonUi>
                </Col>
            </Row>
        </>
    );
};

export default PriceListTab;
