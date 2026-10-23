import React from "react";
import Select from "../../../../components/basic/select";
import { Button, Card, Col, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import TextArea from "../../../../components/basic/textArea";
import ButtonUi from "../../../../components/basic/button";

const VoucherAuthHeader = ({ formData, handleChange, formStatus,sectionId=[],divisionId=[],finYear=[]
  
 }) => {
  return (
    <>
    <Card>
      <Row className="ms-2 mt-2">
        <Col sm={12} md={4} lg={3}>
          <Select
            required
            label="Division"
            name="division_id"
            placeholder={" "}
            value={formData.division_id || ""}
            onChange={(e) => handleChange("division_id", e.target.value)}
            options={divisionId}
          />
        </Col>
        <Col sm={12} md={4} lg={2}>
          <Select
            required
            label="Financial Year"
            name="curryear"
            placeholder={" "}
            value={formData.curryear || ""}
            onChange={(e) => handleChange("curryear", e.target.value)}
            options={finYear}
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <Select
            required
            label="Section"
            name="section"
            placeholder={" "}
            value={formData.section || ""}
            onChange={(e) => handleChange("section", e.target.value)}
            options={sectionId}
          />
        </Col>
      </Row>

      <Row className="ms-2">
        <Col sm={12} md={4} lg={3}>
          <TextField
            required
            label="Limit (upto)"
            name="upper_limit"
            placeholder={" "}
            value={formData.upper_limit || ""}
            onChange={(e) => handleChange("upper_limit", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <Select
            required
            label="Voucher Type"
            name="vch_type"
            placeholder={" "}
            value={formData.vch_type || ""}
            onChange={(e) => handleChange("vch_type", e.target.value)}
          />
        </Col>

        <Col sm={12} md={4} lg={3}>
          <Select
            required
            label="DI_VCH_CAT"
            name="p_trans"
            placeholder={" "}
            value={formData.p_trans || ""}
            onChange={(e) => handleChange("p_trans", e.target.value)}
          />
        </Col>
      </Row>

      <Row className="ms-2 mb-2">
        <Col sm={4} md={4} lg={2}>
          <TextField
            type="date"
            label="From Date"
            name="from_date"
            placeholder={" "}
            value={formData.from_date || ""}
            onChange={(e) => handleChange("from_date", e.target.value)}
          />
        </Col>
        <Col sm={4} md={4} lg={2}>
          <TextField
            type="date"
            label="To Date"
            name="to_date"
            placeholder={" "}
            value={formData.to_date || ""}
            onChange={(e) => handleChange("to_date", e.target.value)}
          />
        </Col>
        <Col sm={4} md={4} lg={2}>
          <TextField
            type="date"
            label="Posting Date"
            name="posting_date"
            placeholder={" "}
            value={formData.posting_date || ""}
            onChange={(e) => handleChange("posting_date", e.target.value)}
          />
        </Col>
      </Row>
      </Card>

      <Row className="mt-3">
        {/* First col */}
        <Col md={5} lg={5}>
          <Row className="d-flex justify-content-center">
            <Col md={8} lg={5}>
              <TextField
                type="text"
                // label="Voucher Available"
                name="no_unposted"
                placeholder={" "}
                value={formData.no_unposted || ""}
                onChange={(e) => handleChange("no_unposted", e.target.value)}
                disabled
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
            <p>Voucher Available</p>
              <span className="border bg-light  text-black px-3 fw-bold rounded">
                Source List
              </span>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={12} lg={12}>
              <TextArea
                className="form-control h-100"
                style={{ minHeight: "165px" }}
                type="text"
                value={formData.unposted_list || ""}
                onChange={(e) => handleChange("unposted_list", e.target.value)}
              />
            </Col>
          </Row>
        </Col>
        {/* Second Col */}
        <Col md={1} lg={1}
  className="mt-5 d-flex flex-column align-items-center justify-content-center">
  <ButtonUi color="secondary" className=" mt-5 mb-2 w-100">{">"}</ButtonUi>
  <ButtonUi color="secondary" className="mb-2 w-100">{">>"}</ButtonUi>
  <ButtonUi color="secondary" className="mb-2 w-100">{"<"}</ButtonUi>
  <ButtonUi color="secondary" className="w-100">{"<<"}</ButtonUi>
</Col>


        {/* Third col */}
        <Col md={5} lg={5}>
          <Row className="d-flex justify-content-center">
            <Col md={8} lg={5}>
              <TextField
                type="text"
                // label=""
                name="no_posted"
                placeholder={" "}
                value={formData.no_posted || ""}
                onChange={(e) => handleChange("no_posted", e.target.value)}
                disabled
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
            <p>Voucher Selected</p>
              <span className="border bg-light text-black px-3  fw-bold rounded">
                Selected List
              </span>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={12} lg={12}>
              <TextArea
                className="form-control h-100"
                style={{ minHeight: "165px" }}
                type="text"
                value={formData.posted_list || ""}
                onChange={(e) => handleChange("posted_list", e.target.value)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-2 d-flex justify-content-center ">
        <Col lg={7}>
          <TextField
            type="text"
            value={formData.di_message || ""}
            onChange={(e) => handleChange("di_message", e.target.value)}
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-3 ">
        <Col sm={12} md={10} lg={6} className="">
          <Row className="d-flex justify-content-center">
            <Col sm={3} md={3} lg={4}>
              <ButtonUi color="secondary">Authorise</ButtonUi>
            </Col>
            <Col sm={3} md={3} lg={2}>
              <ButtonUi color="secondary">View</ButtonUi>
            </Col>
            <Col sm={3} md={3} lg={2}>
              <ButtonUi color="secondary">Cancle</ButtonUi>
            </Col>
            <Col sm={3} md={3} lg={2}>
              <ButtonUi color="secondary">Exit</ButtonUi>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default VoucherAuthHeader;
