import React from "react";
import { Row, Col, Form, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import {
  formDetailHeader,
  seqdHelpListHeader,
} from "./balance_sheet_formula_helper";
import RowAction from "../../../../components/common/rowAction";
import ButtonUi from "../../../../components/basic/button";
import { FcInfo } from "react-icons/fc";

const BalanceSheetFormulaDtl = ({
  formDetailData,
  handleChange,
  formStatus,
  handleAddRow,
  handleDelete,
  setActiveRowIndex,
  setFocusedRowIndex,
  focusedRowIndex,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  validateRequiredField,
  validateForFlag,
  validateForPlus,
}) => {
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formDetailData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleDoubleClick = (field, header, rowIndex) => {
    if (formStatus === "Search") {
      toast.error("Help list is not available in search mode");
    }
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} className="m-auto">
          <Form id="balance-sheet-formula-dtl-form">
            <div className="table-title">
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={handleAddRow}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>

            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table hover>
                    <thead style={{ border: "" }}>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                            <th className="" style={{ width: "120px" }}>
                              Actions
                            </th>
                          )}
                        {formDetailHeader.map((header, index) => (
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
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {formDetailData &&
                        formDetailData?.map((data, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onFocus={() =>
                              makeFocusOnTableRow(rowIndex, data.sr_no)
                            }
                            style={{
                              border: `${rowIndex === focusedRowIndex
                                  ? "2px solid black"
                                  : "none"
                                }`,
                            }}
                          >
                            {(formStatus === "Insert" ||
                              formStatus === "Update") && (
                                <td className="">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={formDetailData.length >= 1}
                                    onDelete={() => handleDelete(data, rowIndex)}
                                  //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                  />
                                </td>
                              )}
                            <td className="table_cell">
                              <TextField
                               // required
                                type="text"
                                name="ass_lib_inc_exp_sch_flag"
                                value={data.ass_lib_inc_exp_sch_flag || ""}
                                maxLength={1}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "ass_lib_inc_exp_sch_flag",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                                onBlur={(e) => {
                                  if (formStatus === 'Insert' || formStatus === "Update") {
                                    validateRequiredField(e, "Ass Lib Inc Exp Sch Flag")
                                    const isValid = validateForFlag(e.target.value)
                                    if (!isValid) {
                                      e.target.focus();
                                    }

                                  }
                                }
                                }
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                // required
                                type="text"
                                name="seq_no"
                                value={data.seq_no || ""}
                                maxLength={7}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "seq_no",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                                onDoubleClick={() =>
                                  handleDoubleClick(
                                    "seqd",
                                    seqdHelpListHeader,
                                    rowIndex
                                  )
                                }
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                // required
                                type="text"
                                name="seqd"
                                value={data.seqd || ""}
                                maxLength={200}
                                disabled
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "seqd",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                               // required
                                type="text"
                                name="plus_minus"
                                value={data.plus_minus || ""}
                                maxLength={1}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "plus_minus",
                                    e.target.value,
                                    rowIndex
                                  )
                                }
                                onBlur={(e) => {
                                  if (
                                    formStatus === "Insert" ||
                                    formStatus === "Update"
                                  ) {
                                    validateRequiredField(e, "Plus Minus");
                                    //validateForPlus(e.target.value);
                                     const isValid = validateForPlus(e.target.value)
                                    if (!isValid) {
                                      e.target.focus();
                                    }
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>{" "}
                </div>
              </SimpleBar>
            </div>
          </Form>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BalanceSheetFormulaDtl;
