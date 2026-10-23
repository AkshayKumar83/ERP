import React from "react";
import { Card, Col, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";
import ButtonUi from "../../../../components/basic/button";

const ReverseChargeInvoiceDespatch = ({ despatchFormData, handleChange,   handleChangeTab = ()=>{}, 
modeOfTransport=[],
priceBasis=[],
}) => {
  return (
<Form>
<Card className="position-relative p-2">
  {/* Left-aligned title */}
  <span className="position-absolute top-0 start-10 translate-middle-y bg-white px-2 fw-bold">
    Despatch Details
  </span>

      <Row className="mt-1">
        <Col xl={3}>
          <TextField
            type="text"
            label="Final Destination"
            value={despatchFormData?.final_dest || ""}
            onChange={(e) => handleChange("final_dest", e.target.value)}
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Despatch Note No."
            value={despatchFormData?.disp_nt_no || ""}
            onChange={(e) => handleChange("disp_nt_no", e.target.value)}
          />
        </Col>

        <Col xl={3}>
          <Select
            label="Mode of Transport"
            name="mode_cd"
            value={despatchFormData?.mode_cd || ""}
            onChange={(e) => handleChange("mode_cd", e.target.value)}
            options={modeOfTransport}
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Transport Name"
            value={despatchFormData?.tpt_name || ""}
            onChange={(e) => handleChange("tpt_name", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col xl={2}>
          <TextField
            type="text"
            label="Vehicel No."
            value={despatchFormData?.vessel_no || ""}
            onChange={(e) => handleChange("vessel_no", e.target.value)}
          />
        </Col>
        <Col xl={2}>
          <TextField
            type="text"
            label="Case Mark"
            value={despatchFormData?.case_mrk || ""}
            onChange={(e) => handleChange("case_mrk", e.target.value)}
          />
        </Col>
        <Col xl={2}>
          <TextField
            type="number"
            label="Weight"
            value={despatchFormData?.weight ?? ""}
            onChange={(e) => handleChange("weight", e.target.value)}
          />
        </Col>
        <Col xl={2}>
          <TextField
            type="text"
            maxlength={40}
            label="Document Through"
            value={despatchFormData?.doc_thru || ""}
            onChange={(e) => handleChange("doc_thru", e.target.value)}
          />
        </Col>
    
        <Col xl={2}>
          <TextField
             type="date"
            // type="datetime-local" // Allows both date and time
            label="Removal Date & Time"
            value={despatchFormData?.removal_dt || ""}
            onChange={(e) => handleChange("removal_dt", e.target.value)}
          />
        </Col>
        <Col xl={2}>
          <Select
            type="number"
            label="Price Basis"
            value={despatchFormData?.del_terms || ""}
            onChange={(e) => handleChange("del_terms", e.target.value)}
            options={priceBasis}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col xl={12}>
          <TextField
            type="text"
            maxlength={200}
            label="Insurence Policy No."
            value={despatchFormData?.policy_no || ""}
            onChange={(e) => handleChange("policy_no", e.target.value)}
          />
        </Col>
        </Row>
        
      
      <Row className="mt-1">
        <Col xl={7}>
          <TextField
            type="text"
            maxlength={100}
            label="No.of packet"
            value={despatchFormData?.no_of_packet || ""}
            onChange={(e) => handleChange("no_of_packet", e.target.value)}
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            maxlength={40}
            label="LC No."
            value={despatchFormData?.cust_lc_no || ""}
            onChange={(e) => handleChange("cust_lc_no", e.target.value)}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col lg={12}>
          <TextArea
          maxlength={2000}
            label="Remarks"
            value={despatchFormData?.remark || ""}
            onChange={(e) => handleChange("remark", e.target.value)}
          />
        </Col>
      </Row>

      {/* <Row className="d-flex justify-content-center">
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Main')}}> Main Details </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Items')}}> Items</ButtonUi>
          </Col>
          </Row> */}
      </Card>
    </Form>
  );
};

export default ReverseChargeInvoiceDespatch;
