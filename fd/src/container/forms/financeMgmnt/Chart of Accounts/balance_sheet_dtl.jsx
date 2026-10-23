import React from "react";
import { Row, Col, Form, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import SimpleBar from "simplebar-react";
import {
  balanceSheetDtlTHeader,
  RollUpAccHeadHelpListHeader,
} from "./balance_sheet_helper";
import RowAction from "../../../../components/common/rowAction";
import ButtonUi from "../../../../components/basic/button";
import { FcInfo } from "react-icons/fc"; 
import toast from "react-hot-toast";

const BalanceSheetDtl = ({
  formDetailData,
  formStatus,
  handleChange,
  handleAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  handleHelpList = () => { },
  setHelpFor,
  setHelpListHeader,
  getValidateData,
  otherQueryPera,
}) => {
  const makeFocusOnTableRow = (rowIndex, id) => {
    setFocusedRowIndex(rowIndex);
  };

  const handleDoubleClick = (field, header) => {
    // console.log("handleDoubleClick - formStatus:", formStatus, "field:", field);
    if (!["Insert", "Update"].includes(formStatus)) return;
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
  };

  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  const handleValidateBlur = async (e, rowIndex, name) => {
    if (formStatus === 'Update' || formStatus === "Insert") {  
      console.log(name)


      const field = e.target;
      const value = field.value; 

        if(value === 'undefined' || value === null || value === '') { 
        console.log('value', value)
        return
      }

      if (name === 'sno') {
        validateRequiredField({ target: field }, `${name}`)
      }

      validateRequiredField({target: field }, `${name}`) 
      try {

        const result = await getValidateData(name, value, otherQueryPera, rowIndex);
        console.log('Validation result:', result);

        if (!result) {
          // Only focus if INVALID
          field.focus();
        } else if (result.data) {
          // console.log(data)

        }

      }
      catch (err) {
        console.error("Valdation error", err)
      }
    }

  }

  return (
    <React.Fragment>
      <Row>
        <Col xl={12} className="m-auto">
          <Form id="balance-sheet-form">
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
                        {balanceSheetDtlTHeader.map((header, index) => (
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
                              makeFocusOnTableRow(rowIndex, data.id)
                            }
                            style={{
                              border: `${rowIndex === focusedRowIndex
                                  ? "2px solid black"
                                  : "none"
                                }`,
                            }}
                            tabIndex={0}
                          >
                            {(formStatus === "Insert" ||
                              formStatus === "Update") && (
                                <td className="">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={formDetailData?.length > 0}
                                    onDelete={() => handleDelete(data, rowIndex)}
                                  />
                                </td>
                              )}
                            <td className="table_cell">
                              <TextField
                                required
                                type="text"
                                name="description"
                                value={data.description || ""}
                                maxLength={200}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "description",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                              />
                            </td>

                            <td className="table_cell">
                              <Checkbox
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "total_flag",
                                    e.target.checked ? "Y" : "N",
                                    rowIndex, e
                                  )
                                }
                                name="total_flag"
                                checked={data?.total_flag === "Y"}
                              />
                            </td>
                            <td className="table_cell">
                              <Checkbox
                                name="line_flag"
                                checked={data?.line_flag === "Y"}
                                onChange={(e) => {
                                  handleChange(
                                    "formDetailData",
                                    "line_flag",
                                    e.target.checked ? "Y" : "N",
                                    rowIndex, e
                                  );
                                }}
                              />
                            </td>

                            <td className="table_cell">
                              <Checkbox
                                name="heading_flag"
                                checked={data?.heading_flag === "Y"}
                                onChange={(e) => {
                                  handleChange(
                                    "formDetailData",
                                    "heading_flag",
                                    e.target.checked ? "Y" : "N",
                                    rowIndex, e
                                  );
                                }}
                              />
                            </td>

                            <td className="table_cell">
                              <Checkbox
                                name="plus_minus"
                                checked={data?.plus_minus === "Y"}
                                onChange={(e) => {
                                  handleChange(
                                    "formDetailData",
                                    "plus_minus",
                                    e.target.checked ? "Y" : "N",
                                    rowIndex, e
                                  );
                                }}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                style={{ textAlign: "left" }}
                                required
                                type="text"
                                name="sno"
                                value={data.sno || ""}
                                maxLength={5}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "sno",
                                    e.target.value,
                                    rowIndex, e
                                  )
                                }
                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'sno')}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                // required
                                type="text"
                                name="schd_no"
                                value={data.schd_no || ""}
                                maxLength={10}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "schd_no",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'schd_no')}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                style={{ textAlign: "left" }}
                                //  required
                                type="text"
                                //   name="sch_sno"
                                value={data.sch_sno || ""}
                                maxLength={10}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "sch_sno",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'sch_sno')}
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                //  required
                                type="text"
                                name="rollup_acc1"
                                value={data.rollup_acc1 || ""}
                                maxLength={10}
                                onChange={(e) =>
                                  handleChange(
                                    "formDetailData",
                                    "rollup_acc1",
                                    e.target.value,
                                    rowIndex,
                                    e
                                  )
                                }
                                onDoubleClick={() => {
                                  console.log(
                                    "Double-clicked rollup_acc1, rowIndex:",
                                    rowIndex
                                  );
                                  handleDoubleClick(
                                    "RollupAcc",
                                    RollUpAccHeadHelpListHeader
                                  );
                                }}
                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'rollup_acc1')}
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

export default BalanceSheetDtl;
