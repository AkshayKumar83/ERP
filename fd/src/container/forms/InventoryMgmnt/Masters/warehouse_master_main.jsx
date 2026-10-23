// WarehouseMasterMain.jsx
import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Form, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import WarehouseMasterProcess from "./warehouse_master_process";
import WarehouseMasterStore from "./warehouse_master_store";
import WarehouseMasterMcRate from "./warehouse_master_mc_rate";
import WarehouseMasterSkillSet from "./warehouse_master_skill_set";
import { checkDuplicateWorkCenterNo, DescriptionHelpListHeader, handleValidateField, WcNoHelpListHeader } from "./warehouse_master_helper";
import MuiSelectField from "../../../../components/basic/muiSelectField";

const WarehouseMasterMain = ({
  formData,
  handleChange,
  formStatus,
  handleChangeTab,
  divisionID = [],
  department = [],
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  setFormData,
  // wcIdGenerated,
  // setWcIdGenerated,
  focusedRowIndex, 
  setFocusedRowIndex,
}) => {
  const [isDefaultApplied, setIsDefaultApplied] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentSection, setCurrentSection] = useState("Process");

  // Reset currentSection based on formData.store_process and formData.inside_outside
  useEffect(() => {
    if (formData.store_process === "S" && formData.inside_outside) {
      setCurrentSection("Store"); // Show Store component
    } else if (formData.store_process === "P" && formData.inside_outside === "I") {
      setCurrentSection("Process"); // Show Process component
    } else {
      setCurrentSection("Process"); // Default to Process if conditions not met
    }
  }, [formData.store_process, formData.inside_outside]);

  // Apply default values for Insert mode
  useEffect(() => {
    if (formStatus === "Insert" && !isDefaultApplied) {
      if (!formData.store_process && !formData.inside_outside) {
        handleChange("formData", "store_process", "S");
        handleChange("formData", "inside_outside", "I");
      }
      setIsDefaultApplied(true);
    }
  }, [formStatus, handleChange, isDefaultApplied, formData]);

  // Reset isDefaultApplied when switching to Update or Query mode
  useEffect(() => {
    if (formStatus !== "Insert") {
      setIsDefaultApplied(false);
    }
  }, [formStatus]);

  // Generate new wc_id for Insert mode
  // useEffect(() => {
  //   if (formStatus === "Insert" && !wcIdGenerated) {
  //     generateNextWcId(setFormData);
  //     setWcIdGenerated(true);
  //   }
  // }, [formStatus, setFormData, wcIdGenerated, setWcIdGenerated]);

  const handleSectionChange = (section) => {
    setCurrentSection(section);
  };


       const handleDoubleClick = (field, header) => {
    if (["Search"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  return (
    <Form id="work-centre">
      <Row>
        <Col sm={12} md={6} lg={4}>
          <Select
            label="Division"
            name="division_id"
            id= 'division_id'
            value={formData?.division_id || ""}
            onChange={(e) => handleChange("formData", "division_id", e.target.value,null,e)}
            options={divisionID}
            onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData)}
            required
          />
          {/* <MuiSelectField
            label="Division"
            name="division_id"
            value={formData.division_id}
            onChange={(e) => handleChange("formData", "division_id", e.target.value, null, e)}
            options={divisionID}
            required
            onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData)}
          /> */}

        </Col>
        <Col sm={12} md={6} lg={3}>
          <Select
            required
            label="Department"
            name="dept_cd"
            id='dept_cd'
            value={formData?.dept_cd || ""}
            onChange={(e) => handleChange("formData", "dept_cd", e.target.value, null, e)}
            options={department}
            onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData)}
          />
        </Col>
        <Col sm={6} md={6} lg={2}>
          <span style={{ fontSize: "13px" }}>Type of Work Center</span>
          <RadioGroup
            className="radio-button-wrapper box-border"
            options={[
              { text: "Store", value: "S" },
              { text: "Process", value: "P" },
            ]}
            onChange={(e) => {
              handleChange("formData", "store_process", e.target.value,null,e);
              handleChange("formData", "inside_outside", "");
              setCurrentSection(e.target.value === "S" ? "Store" : "Process"); // Reset to Store or Process
            }}
            checked={formData.store_process}
          />
        </Col>
        <Col sm={6} md={6} lg={2} className="mt-4">
          <RadioGroup
            className="radio-button-wrapper box-border"
            options={[
              { text: "Inside", value: "I" },
              { text: "Outside", value: "O" },
            ]}
            onChange={(e) => {
              handleChange("formData", "inside_outside", e.target.value,null,e);
              setCurrentSection(e.target.value === "I" ? "Process" : "Process"); // Reset to Process
            }}
            checked={formData.inside_outside}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={4} md={2} lg={2}>
          <TextField
            type="number"
            label="Work Center id"
            value={formData?.wc_id || ""}
            disabled 
          />
        </Col>
        <Col sm={8} md={4} lg={2} className="">
          <TextField
            type="text"
            maxLength={15}
            label="Work Center"
            name="wc_no"
            id='wc_no'
            value={formData?.wc_no || ""}
            onChange={(e) => handleChange("formData", "wc_no", e.target.value,null,e)}
            onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData)}
            onDoubleClick={() => handleDoubleClick("wcNo", WcNoHelpListHeader)}
            required
          />
        </Col>
        <Col sm={12} md={6} lg={7}>
          <TextField
            type="text"
            label="Description"
            maxLength={40}
            name="description"
            value={formData?.description || ""}
            onChange={(e) => handleChange("formData", "description", e.target.value, null,e)}
            onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData)}
             onDoubleClick={() => handleDoubleClick("Desc", DescriptionHelpListHeader)}
            required
          />
        </Col>
      </Row>

      <Row>
        <Col sm={12} md={3} lg={2} className="button-group-wrapper mt-4">
          <Checkbox
            text="Final Assembly"
            onChange={(e) => handleChange("formData", "fa_assy", e.target.checked ? "Y" : "N")}
            checked={formData?.fa_assy === "Y"}
          />
        </Col>
      </Row>

      {(formData.store_process === "S" && formData.inside_outside && currentSection === "Store") && (
        <Row className="mt-4 d-flex justify-content-center">
          <Col sm={12} md={8} lg={6}>
            <Card className="text-center">
              <CardBody>
                <WarehouseMasterStore formData={formData} handleChange={handleChange} formStatus={formStatus} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {(formData.store_process === "P" && formData.inside_outside === "I") && (
        <Row className="mt-4">
          <Col sm={12}>
            <Card>
              <CardBody>
                {currentSection === "Process" && (
                  <WarehouseMasterProcess
                    formData={formData}
                    formStatus={formStatus}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    handleChangeTab={handleSectionChange}
                    handleHelpList={handleHelpList}
                    setHelpFor={setHelpFor}
                    setHelpListHeader={setHelpListHeader}
                  />
                )}
                {currentSection === "MC-Rate" && (
                  <WarehouseMasterMcRate
                    mcRateData={formData.mcRateData}
                    handleChange={handleChange}
                    handleChangeTab={handleSectionChange}
                    triggerAddRow={() => formData.triggerAddRow("MC-Rate")}
                    formStatus={formStatus}
                    setMcRateData={formData.setMcRateData}
                    wc_id={formData?.wc_id}
                    focusedRowIndex={focusedRowIndex}
                    setFocusedRowIndex={setFocusedRowIndex}
                  />
                )}
                {currentSection === "SkillSet" && (
                  <WarehouseMasterSkillSet
                    skillSetData={formData.skillSetData}
                    handleChange={handleChange}
                    handleChangeTab={handleSectionChange}
                    triggerAddRow={() => formData.triggerAddRow("SkillSet")}
                    formStatus={formStatus}
                    handleHelpList={handleHelpList}
                    setHelpFor={setHelpFor}
                    setHelpListHeader={setHelpListHeader}
                      focusedRowIndex={focusedRowIndex}
                    setFocusedRowIndex={setFocusedRowIndex}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default WarehouseMasterMain;