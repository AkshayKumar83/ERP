// WarehouseMasterSkillSet.jsx
import React, { useState } from "react";
import { Col, Container, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import { checkDuplicateSkillId, skillDescHelpListHeader, SkillHeader } from "./warehouse_master_helper";
import toast from "react-hot-toast";
import { FcInfo } from "react-icons/fc";

const WarehouseMasterSkillSet = ({
  skillSetData,
  handleChange,
  formStatus,
  triggerAddRow,
  handleChangeTab,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  focusedRowIndex,
  setFocusedRowIndex,
}) => {
  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = skillSetData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

  function handleDelete(deletedRow, rowIndex) {
    const updatedRows = skillSetData.filter((_, index) => index !== rowIndex);
    handleChange("skillSetData", "deleteRow", updatedRows);
    setFocusedRowIndex(0);
  }

  const handleDoubleClick = (field, header, rowIndex) => {
    if (["Insert", "Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true, rowIndex);
    }
  };

  const handleValidateFieldSkillDesc = async (e, formStatus, rowIndex) => {
    if (!["Insert", "Update"].includes(formStatus)) return;

    const { name, value } = e.target;

    if (name === "skill_desc" && !value) {
      toast.error("Description cannot be null");
      document.getElementById(`skill_desc_${rowIndex}`).focus();
      setFocusedRowIndex(rowIndex);
      return;
    }

    const currentRow = skillSetData[rowIndex];

    const isDuplicate = skillSetData.some((row, index) => {
      return index !== rowIndex && row.skill_desc === value;
    });

    if (isDuplicate) {
      toast.error("Description exists in the table");
      document.getElementById(`skill_desc_${rowIndex}`).focus();
      setFocusedRowIndex(rowIndex);
      return;
    }

    if (formStatus === "Update" && value !== currentRow?.skill_desc) {
      const result = await checkDuplicateSkillId({
        wc_id: currentRow?.wc_id,
        skill_id: currentRow?.skill_id,
      });

      if (result.type === "error") {
        toast.error(result.message);
        document.getElementById(`skill_desc_${rowIndex}`).focus();
        setFocusedRowIndex(rowIndex);
        return;
      }
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <Form id="skill-set" className="">
            <div className="table-title">
              <span>Work Center Skill Set</span>
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={() => {
                    triggerAddRow(); // Call triggerAddRow with "SkillSet" already passed in WarehouseMasterMain
                    setFocusedRowIndex(skillSetData.length);
                  }}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" || formStatus === "Update") && <th className="">Actions</th>}
                        {SkillHeader.map((header, index) => (
                          <th
                            key={index}
                            data-required={header.required || false}
                            style={{
                              whiteSpace: "nowrap",
                              width: header.width,
                              minWidth: header.width,
                            }}
                          >
                            {header.label}
                            {header.isHelpExist && (<FcInfo title="Info" />)}
                          </th>
                         
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {skillSetData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                          style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}` }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={skillSetData.length > 0}
                                onDelete={() => handleDelete(data, rowIndex)}
                              />
                            </td>
                          )}
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="skill_desc"
                              id={`skill_desc_${rowIndex}`}
                              value={data?.skill_desc || ""}
                              maxLength={30}
                              onChange={(e) => handleChange("skillSetData", "skill_desc", e.target.value, rowIndex, e)}
                              onDoubleClick={() => handleDoubleClick("skillDesc", skillDescHelpListHeader, rowIndex)}
                              onBlur={(e) => handleValidateFieldSkillDesc(e, formStatus, rowIndex)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              required
                              name="skill_type"
                              value={data?.skill_type || ""}
                              maxLength={30}
                              onChange={(e) => handleChange("skillSetData", "skill_type", e.target.value, rowIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              required
                              name="no_of_emp"
                              value={data?.no_of_emp || ""}
                              maxLength={30}
                              onChange={(e) => handleChange("skillSetData", "no_of_emp", e.target.value, rowIndex, e)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
          </Form>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs="auto" className="mt-2">
          <ButtonUi outline onClick={() => handleChangeTab("Process")}>
            Main Screen
          </ButtonUi>
        </Col>
      </Row>
    </Container>
  );
};

export default WarehouseMasterSkillSet;