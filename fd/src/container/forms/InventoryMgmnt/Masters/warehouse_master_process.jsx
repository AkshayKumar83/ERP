
import React from "react";
import { Col, Container, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { Card, CardBody } from "reactstrap";
import Checkbox from "../../../../components/basic/checkbox";
import { handleValidateField, mainWorkHelpListHeader, validateMainWorkCenter } from "./warehouse_master_helper";
import toast from "react-hot-toast";

const WarehouseMasterProcess = ({
  formData,
  handleChange,
  formStatus,
  handleChangeTab, // Now handleSectionChange
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  setFormData,
}) => {
  const handleDoubleClick = (field, header) => {
    if (["Insert", "Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  const handleBlur = (name, value, stateKey) => {
    if (name === "efficiency" || name === "labour_burden_rate") {
      if (value !== "") {
        let formattedValue = parseFloat(value).toFixed(2);
        if (formattedValue >= 1 && formattedValue <= 99.99) {
          if (stateKey === "formData") {
            setFormData((prev) => ({ ...prev, [name]: formattedValue }));
          }
        } else {
          if (stateKey === "formData") {
            setFormData((prev) => ({ ...prev, [name]: "" }));
          }
        }
      }
    }
  };

  const handleWorkCentreNoBlur = async () => {
    if (formData.sub_work_centre === "Y") {
      if (!formData.work_centre_no || formData.work_centre_no.trim() === "") {
        toast.error("Main work centre cannot be null");
        return;
      }

      const result = await validateMainWorkCenter(formData.sub_work_centre, formData.work_centre_no);

      if (result.valid) {
        setFormData((prev) => ({ ...prev, main_wc_id: result.main_wc_id }));
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <Container>
      <Row>
        <Col sm={4} md={3} lg={2}>
          <TextField
            type="number"
            label="No of Machine(s)"
            value={formData?.no_of_machine || ""}
            onChange={(e) => handleChange("formData", "no_of_machine", e.target.value,null,e)}
          />
        </Col>
        <Col sm={8} md={5} lg={2}>
          <TextField
            type="number"
            label="Machine Hour rate"
            value={formData?.machine_hour_rate || ""}
            onChange={(e) => handleChange("formData", "machine_hour_rate", e.target.value,null,e)}
            disabled
          />
        </Col>
        <Col sm={8} md={6} lg={2} className="d-flex align-items-center mt-3 ms-4">
          <ButtonUi
            outline
            // className="px-4 py-3"
            onClick={() => handleChangeTab("MC-Rate")} // Switch to MC-Rate section
          >
            M/C Hr Master
          </ButtonUi>
        </Col>
        <Col sm={12} md={4} lg={2} className="mt-md-1">
          <TextField
            type="number"
            label="Efficiency%"
            value={formData?.efficiency || ""}
            onChange={(e) => handleChange("formData", "efficiency", e.target.value,null,e)}
            //  onBlur={() => handleBlur("efficiency", formData.efficiency, "formData")}
          />
        </Col>
      </Row>

      <Row className="mt-3 justify-content-center">
        <Col md={8} lg={9}>
          <Card className="shadow-sm">
            <CardBody>
              <Row className="justify-content-center">
                <Col md={4} lg={2} className="mt-4">
                  <span>Setup Crew</span>
                </Col>
                <Col md={4} lg={3}>
                  <TextField
                    type="number"
                    label="Number"
                    value={formData?.setup_crew_no || ""}
                    onChange={(e) => handleChange("formData", "setup_crew_no", e.target.value,null,e)}
                  />
                </Col>
                <Col md={4} lg={3}>
                  <TextField
                    type="number"
                    label="Rate"
                    value={formData?.setup_crew_rate || ""}
                    onChange={(e) => handleChange("formData", "setup_crew_rate", e.target.value,null,e)}
                  />
                </Col>
              </Row>
              <Row className="justify-content-center mt-1">
                <Col md={4} lg={2} className="mt-4">
                  <span>Operator Crew</span>
                </Col>
                <Col md={4} lg={3}>
                  <TextField
                    type="number"
                    label="Number"
                    value={formData?.operator_crew_no || ""}
                    onChange={(e) => handleChange("formData", "operator_crew_no", e.target.value,null,e)}
                  />
                </Col>
                <Col md={4} lg={3}>
                  <TextField
                    type="number"
                    label="Rate"
                    value={formData?.operator_crew_rate || ""}
                    onChange={(e) => handleChange("formData", "operator_crew_rate", e.target.value,null,e)}
                  />
                </Col>
              </Row>
              <Row className="justify-content-center mt-1">
                <Col md={4} lg={2} className="mt-4">
                  <span>Helper Crew</span>
                </Col>
                <Col md={4} lg={3}>
                  <TextField
                    type="number"
                    label="Number"
                    value={formData?.helper_crew_no || ""}
                    onChange={(e) => handleChange("formData", "helper_crew_no", e.target.value,null,e)}
                  />
                </Col>
                <Col md={4} lg={3}>
                  <TextField
                    type="number"
                    label="Rate"
                    value={formData?.helper_crew_rate || ""}
                    onChange={(e) => handleChange("formData", "helper_crew_rate", e.target.value,null,e)}
                  />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Col md={4} lg={2} className="d-flex justify-content-center align-items-center">
          <ButtonUi
            outline
            className="px-4 py-3 fs-5 w-50"
            onClick={() => handleChangeTab("SkillSet")} // Switch to SkillSet section
          >
            Skill Set
          </ButtonUi>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col sm={12} md={3} lg={2} className="button-group-wrapper mt-4">
          <Checkbox
            text="Last Stage"
            onChange={(e) => handleChange("formData", "last_stage", e.target.checked ? "Y" : "N")}
            checked={formData?.last_stage === "Y"}
          />
        </Col>
        <Col md={4} lg={2}>
          <TextField
            type="number"
            label="Labour Burden rate %"
            value={formData?.labour_burden_rate || ""}
            onChange={(e) => handleChange("formData", "labour_burden_rate", e.target.value,null,e)}
            onBlur={() => handleBlur("labour_burden_rate", formData.labour_burden_rate, "formData")}
          />
        </Col>
      </Row>

      <Row className="mt-2">
        <Col md={10} lg={6} className="box-border">
          <Row>
            <Col sm={12} md={6} lg={5} className="button-group-wrapper mt-1">
              <Checkbox
                text="Sub Process Work Center"
                onChange={(e) => handleChange("formData", "sub_work_centre", e.target.checked ? "Y" : "N")}
                checked={formData?.sub_work_centre === "Y"}
              />
            </Col>
            <Col md={6} lg={6} className="mt-1 mb-2">
              <TextField
                type="text"
                label="Main Work Center"
                name="work_centre_no"
                value={formData?.work_centre_no || ""}
                onChange={(e) => handleChange("formData", "work_centre_no", e.target.value === "null" ? "" : e.target.value)}
                onDoubleClick={() => handleDoubleClick("mainWorkCenter", mainWorkHelpListHeader)}
                onBlur={() => handleWorkCentreNoBlur()}
                disabled={formData.sub_work_centre !== "Y"}
                required
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default WarehouseMasterProcess;