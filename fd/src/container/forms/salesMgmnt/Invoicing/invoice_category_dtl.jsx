import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, Row, Col, Card, Table } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import RadioButton from "../../../../components/basic/radioButton";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { headers, Dtlheaders } from "./invoice_category_helper";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";

const InvoiceCategoryDetails = ({
  formData = [{}],
  formDetailData = [{}],
  formStatus,
  triggerAddRow,
  handleDelete,
  handleChange,
  deptHeadOffice = [],
  section = [],
  getValidateData,
  focusedRowIndex,
  setFocusedRowIndex,
  activeFormDetailData = [{}],
  setActiveFormDetailData,
}) => {
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData[rowIndex];
    if (!entry) return;

    setFocusedRowIndex(rowIndex);

    const relatedChildren = formDetailData.filter(
      (child) => child.da_cat === entry.da_cat
    );

    // console.log("Focused Row Index:", rowIndex);
    //console.log("entry.da_cat:", entry.da_cat);
    // console.log("Matching children:", relatedChildren.map(c => c.da_cat));

    setActiveFormDetailData(relatedChildren);
  };

  const validateRequiredField = (e, fieldLabel) => {
    if (!["Insert", "Update", "Search"].includes(formStatus)) {
      return;
    }
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };

  return (
    <React.Fragment>
      {/* <Card className="mb-2 p-1 shadow-sm"> */}
      <Form id="invoice-header-form">
        <div className="table-title">
          {/* <span>Sales Order Discount</span> */}
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi
              color="primary"
              className="add-action"
              onClick={() => triggerAddRow("formDataTable")}
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
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <th
                        style={{ width: "80px" }}
                        className="sticky-column left"
                      >
                        Actions
                      </th>
                    )}
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        data-required={header.required || false}
                        style={{
                          whiteSpace: "nowrap",
                          width: header.width,
                          minWidth: header.width,
                          maxWidth: header.width,
                        }}
                      >
                        {header.label}
                        {header.required && (
                          <span className="required-asterisk">*</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData?.map((data, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                      <tr
                        onClick={() => makeFocusOnTableRow(rowIndex, data.id)}
                        style={{
                          border: `${
                            rowIndex === focusedRowIndex
                              ? "2px solid black"
                              : "none"
                          }`,
                        }}
                        tabIndex={0}
                      >
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <td className="sticky-column left">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={formData.length > 0}
                              onDelete={() =>
                                handleDelete("formData", data, rowIndex)
                              }
                            />
                          </td>
                        )}

                        <td className="table_cell">
                          <TextField
                            type="text"
                            name={`da_cat${rowIndex}_1`}
                            maxLength={1}
                            value={data.da_cat || ""}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "da_cat",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            // onBlur={(e) => {
                            //   const inputElement =
                            //     e.currentTarget.querySelector("input");
                            //   const fieldName = inputElement
                            //     ? inputElement.name
                            //     : "da_cat";

                            //   console.log(
                            //     "Validating:",
                            //     fieldName,
                            //     e.target.value,
                            //     "Row Index:",
                            //     rowIndex
                            //   );

                            //   if (
                            //     formStatus === "Insert" ||
                            //     formStatus === "Update"
                            //   ) {
                            //     //validateRequiredField(e, "DA category")
                            //     getValidateData(
                            //       fieldName,
                            //       e.target.value,
                            //       rowIndex
                            //     );
                            //     return;
                            //   }
                            // }}
                            onBlur={async (e) => {
                              if (
                                formStatus !== "Insert" &&
                                formStatus !== "Update"
                              ) {
                                return;
                              }

                              const field = e.target;
                              const fieldName = field?.name || "da_cat";
                              const fieldValue = field?.value;

                              if (!fieldValue) return;

                              try {
                                const result = await getValidateData(
                                  fieldName,
                                  fieldValue,
                                  rowIndex
                                );
                                console.log("Validation result:", result);

                                if (!result) {
                                  field.focus();
                                } else if (result.data) {
                                  console.log("Valid data:", result.data);
                                }
                              } catch (err) {
                                console.error("Validation error", err);
                              }
                            }}
                            disabled={formStatus === "Update"}
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            name={`da_cat_desc_${rowIndex}_1`}
                            value={data.da_cat_desc || ""}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "da_cat_desc",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            maxLength={30}
                            //                         onBlur={(e) => {
                            //                           const inputElement =
                            //                             e.currentTarget.querySelector("input");
                            //                           const fieldName = inputElement
                            //                             ? inputElement.name
                            //                             : "da_cat_desc";

                            //                           if (
                            //                             formStatus === "Insert" ||
                            //                             formStatus === "Update"
                            //                           ) {
                            //                             // getValidateData(
                            //                             //   fieldName,
                            //                             //   e.target.value,
                            //                             //   rowIndex
                            //                             // );
                            //                             //return;
                            //                             try {

                            //                                 if(!e.target.value) {
                            //                                     return
                            //                                 }

                            //      const result = await getValidateData(fieldName, e.target.value, rowIndex);
                            //   console.log('Validation result:', result);

                            //      if (!result) {
                            //     // Only focus if INVALID
                            //     field.focus();
                            //   } else if (result.data) {
                            //      // console.log(data)

                            //   }

                            //   }
                            //   catch (err) {
                            //     console.error("Valdation error", err)
                            //   }
                            //                           }
                            //                         }}

                            onBlur={async (e) => {
                              if (
                                formStatus !== "Insert" &&
                                formStatus !== "Update"
                              ) {
                                return;
                              }

                              const field = e.target;
                              const fieldName = field?.name || "da_cat_desc";
                              const fieldValue = field?.value;

                              if (!fieldValue) return;

                              try {
                                const result = await getValidateData(
                                  fieldName,
                                  fieldValue,
                                  rowIndex
                                );
                                console.log("Validation result:", result);

                                if (!result) {
                                  field.focus();
                                } else if (result.data) {
                                  console.log("Valid data:", result.data);
                                }
                              } catch (err) {
                                console.error("Validation error", err);
                              }
                            }}
                          />
                        </td>
                        <td className="table_cell">
                          <Select
                            type="text"
                            name={`user_code_${rowIndex}_1`}
                            value={data.user_code || ""}
                            maxLength={2}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "user_code",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            options={[
                              { label: "", value: "" },
                              { label: "Export", value: "E" },
                              { label: "Free of Cost", value: "F" },
                              { label: "Job Work", value: "J" },
                              { label: "Normal", value: "N" },
                              { label: "Repair/Warranty", value: "W" },
                              { label: "Against CT-3", value: "C" },
                              { label: "Against CT-1", value: "T" },
                              { label: "Against SEZ", value: "S" },
                              { label: "Against Notification", value: "P" },
                            ]}
                            onBlur={(e) =>
                              validateRequiredField(e, "User Code")
                            }
                            required
                          />
                        </td>
                        <td className="table_cell">
                          <Select
                            type="text"
                            name={`section_id_${rowIndex}_1`}
                            value={data.section_id || ""}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "section_id",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            onBlur={(e) =>
                              validateRequiredField(e, "Section id")
                            }
                            required
                            options={section}
                          />
                        </td>
                        <td className="table_cell">
                          <Select
                            type="text"
                            name={`rg23_reg_type_${rowIndex}_1`}
                            value={data.rg23_reg_type || ""}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "rg23_reg_type",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            options={[
                              { label: "", value: "" },
                              { label: "A", value: "A" },
                              { label: "C", value: "C" },
                              { label: "P", value: "P" },
                            ]}
                            onBlur={(e) =>
                              validateRequiredField(e, "rg23 type")
                            }
                            required
                          />
                        </td>
                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "excisable",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                1
                              )
                            }
                            name="excisable"
                            value={data.excisable || ""}
                            checked={data?.excisable === "Y"}
                            // required
                          />
                        </td>

                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "excise_sr_no_reqd",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                1
                              )
                            }
                            name="excise_sr_no_reqd"
                            value={data.excise_sr_no_reqd || ""}
                            checked={data?.excise_sr_no_reqd === "Y"}
                            // required
                          />
                        </td>

                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "invoice",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                1
                              )
                            }
                            name="invoice"
                            value={data.invoice || ""}
                            checked={data?.invoice === "Y"}
                            // required
                          />
                        </td>

                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "despatch_in_prdn",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                1
                              )
                            }
                            name="despatch_in_prdn"
                            value={data.despatch_in_prdn || ""}
                            checked={data?.despatch_in_prdn === "Y"}
                            //required
                          />
                        </td>

                        <td className="table_cell">
                          <RadioButton
                            className="radio-button"
                            required
                            //required={false}
                            type="radio"
                            name={`exp_dome_flag_${rowIndex}`} // unique name for each row
                            value="D"
                            checked={data?.exp_dome_flag === "D"}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "exp_dome_flag",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            onBlur={(e) =>
                              validateRequiredField(e, "Exp Dome flag")
                            }
                          />
                        </td>

                        <td className="table_cell">
                          <RadioButton
                            className="radio-button"
                            required
                            //required={false}
                            type="radio"
                            name={`exp_dome_flag_${rowIndex}`} // unique name for each row
                            value="E"
                            checked={data?.exp_dome_flag === "E"}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "exp_dome_flag",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            // onBlur={(e) => validateRequiredField(e, "Email Description")}
                          />
                        </td>

                        <td className="table_cell">
                          <RadioButton
                            className="radio-button"
                            required
                            //required={false}
                            type="radio"
                            name={`exp_dome_flag_${rowIndex}`} // unique name for each row
                            value="S"
                            checked={data?.exp_dome_flag === "S"}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "exp_dome_flag",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </div>
          </SimpleBar>
        </div>
      </Form>
      {/* </Card> */}
      {/* <Card className='mb-2 p-1 shadow-sm'> */}
      <Form id="invoice-detail-form">
        <div className="table-title">
          {/* <span>Sales Order Discount</span> */}
          {formStatus === "Insert" && (
            <ButtonUi
              color="primary"
              className="add-action"
              onClick={() => triggerAddRow("formDetailData")}
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
                    {formStatus === "Insert" && (
                      <th
                        style={{ width: "30px" }}
                        className="sticky-column left"
                      >
                        Actions
                      </th>
                    )}
                    {Dtlheaders.map((header, index) => (
                      <th
                        key={index}
                        data-required={header.required || false}
                        style={{
                          whiteSpace: "nowrap",
                          width: header.width,
                          minWidth: header.width,
                          maxWidth: header.width,
                        }}
                      >
                        {header.label}
                        {header.required && (
                          <span className="required-asterisk">*</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeFormDetailData?.map((data, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                      <tr
                        //onClick={() => makeFocusOnTableRow(rowIndex, data.id)}
                        //onClick={() => setFocusedDetailRowIndex(rowIndex)}
                        style={{
                          border: `${
                            rowIndex === focusedRowIndex
                              ? "2px solid black"
                              : "none"
                          }`,
                        }}
                        tabIndex={0}
                      >
                        {formStatus === "Insert" && (
                          <td className="sticky-column left">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={activeFormDetailData.length > 0}
                              onDelete={() =>
                                handleDelete("formDetailData", data, rowIndex)
                              }
                              //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                          </td>
                        )}

                        <td className="table_cell">
                          <Select
                            type="text"
                            name={`c_code${rowIndex}_1`}
                            value={data.c_code || ""}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "c_code",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                            options={deptHeadOffice}
                            // required
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            maxLength={5}
                            name={`prefix_${rowIndex}_1`}
                            value={data.prefix || ""}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "prefix",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                            // options={hsnSacCodeList}
                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="text"
                            name={`inv_length_${rowIndex}_1`}
                            value={data.inv_length || ""}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "inv_length",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </div>
          </SimpleBar>
        </div>
      </Form>
      {/* </Card> */}
    </React.Fragment>
  );
};

export default InvoiceCategoryDetails;
