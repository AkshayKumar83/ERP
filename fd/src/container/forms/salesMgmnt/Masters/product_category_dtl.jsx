import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, Row, Col, Card, Table } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import RadioButton from "../../../../components/basic/radioButton";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { headers, Dtlheaders } from "./product_category_helper";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { validateForm } from "../../../../utils/fn";
import toast from "react-hot-toast";

const ProductCategoryDetails = ({
  formData = [{}],
  formDetailData = [{}],
  formStatus,
  triggerAddRow,
  handleDelete,
  handleChange,
  focusedRowIndex,
  setFocusedRowIndex,
  setActiveFormDetailData,
  activeFormDetailData,
  focusedRowIndex1,
  childDataMap,
  mainCatId,
  //setFocusedRowIndex1,
}) => {
  // const makeFocusOnTableRow = (rowIndex, id) => {

  //     const entry = formData[rowIndex];
  //     if (!entry) return;

  //      setFocusedRowIndex(rowIndex);

  //     const relatedChildren = formDetailData.filter(
  //         (child) => child.main_cat_id === entry.main_cat_id
  //     );

  //     console.log("Focused Row Index:", rowIndex);
  //     console.log("entry.da_cat:", entry.da_cat);
  //     console.log("Matching children:", relatedChildren.map(c => c.da_cat));

  //     setActiveFormDetailData(relatedChildren);

  // };

  useEffect(() => {
    if (mainCatId && childDataMap) {
      const children = childDataMap[mainCatId] || [];
      setActiveFormDetailData(children);
      console.log("Setting activeFormDisData for", mainCatId, children);
    }
  }, [mainCatId, childDataMap]);

  const makeFocusOnTableRow = (rowIndex) => {
    const entry = formData[rowIndex];
    if (!entry) return;

    setFocusedRowIndex(rowIndex);
    const relatedChildren = childDataMap[entry.main_cat_id] || [];
    setActiveFormDetailData([...relatedChildren]); // Always use a clone
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
      <Form id="product-mainCat-form">
        <div className="table-title">
          <span>Main Category</span>
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
                    {formStatus === "Insert" && (
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
                        {formStatus === "Insert" && (
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
                            name={`main_cat_desc_${rowIndex}_1`}
                            maxLength={40}
                            value={data.main_cat_desc || ""}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "main_cat_desc",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            onBlur={(e) =>
                              validateRequiredField(e, "Main Category Desc")
                            }
                            required
                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="text"
                            name={`main_cat_seq_${rowIndex}_1`}
                            value={data.main_cat_seq || ""}
                            // maxLength={40}
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "main_cat_seq",
                                e.target.value,
                                rowIndex,
                                e,
                                1
                              )
                            }
                            onBlur={(e) =>
                              validateRequiredField(e, "Main Cat sequence")
                            }
                            required
                          />
                        </td>

                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "flag_accessories",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                1
                              )
                            }
                            name="flag_accessories"
                            value={data.flag_accessories || ""}
                            checked={data?.flag_accessories === "Y"}
                          />
                        </td>

                        <td className="table_cell">
                          <Checkbox
                            onChange={(e) =>
                              handleChange(
                                "formData",
                                "flag_configurator",
                                e.target.checked ? "Y" : "N",
                                rowIndex,
                                e,
                                1
                              )
                            }
                            name="flag_cofigurator"
                            value={data.flag_configurator || ""}
                            checked={data?.flag_configurator === "Y"}
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
      <Form id="product-subCat-form">
        <div className="table-title">
          <span>Sub Category</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
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
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <th
                        style={{ width: "80px" }}
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
                            rowIndex === focusedRowIndex1
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
                              canDelete={activeFormDetailData.length > 0}
                              onDelete={() =>
                                handleDelete("formDetailData", data, rowIndex)
                              }
                            />
                          </td>
                        )}

                        <td className="table_cell">
                          <TextField
                            type="text"
                            name={`sub_cat_desc_${rowIndex}_1`}
                            value={data.sub_cat_desc || ""}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "sub_cat_desc",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                            required
                            maxLength={40}
                            onBlur={(e) =>
                              validateRequiredField(e, "Sub Category Desc")
                            }
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            //  maxLength={5}
                            name={`sub_cat_seq_${rowIndex}_1`}
                            value={data.sub_cat_seq || ""}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "sub_cat_seq",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="text"
                            name={`acc_seq_${rowIndex}_1`}
                            value={data.acc_seq || ""}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "acc_seq",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                            inputProps={{
                              style: { textAlign: "left" },
                            }}
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

export default ProductCategoryDetails;
