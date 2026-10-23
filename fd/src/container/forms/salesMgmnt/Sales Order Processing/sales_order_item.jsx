import React, { useState } from "react";
import PropTypes from "prop-types";
import { Container, Form, Row, Col, Table } from "reactstrap";
import SimpleBar from "simplebar-react";
import { salesOrderItemHeader } from "./sales_order_helper";
import ButtonUi from "../../../../components/basic/button";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import RadioGroup from "../../../../components/basic/radioGroup";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";

const SalesOrderItems = ({
  itemDetail = [{}, {}, {}, {}],
  formStatus = "",
  handleChange = () => {},
  itemFormData,
  handleChangeTab = () => {},
  handleAddRow,
  dropdownData,
  handleHelpList = () => {},
  validateFormFields = () => {},
  handleItemRowDelete,
  getFieldRef = () => {},
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const triggerAddRow = () => {
    handleAddRow();
  };
  const handleUpdate = () => {};

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = itemFormData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleDoubleClick = (name) => {
    //////console.log("double clicked ==>", formStatus);
    if (formStatus) {
      //////console.log("double clicked i", name);
      handleHelpList(true, name, focusedRowIndex);
    }
  };
  const doubleClickFieldsReadOnly =
    formStatus === "Insert" || formStatus === "Update";

  return (
    <Form id="sales-order-item-form">
      <div className="table-title d-flex justify-content-end">
        {/* <span>Member Directory</span> */}
        {(formStatus === "Insert" || formStatus === "Update") && (
          <ButtonUi
            color="primary"
            className="add-action"
            onClick={triggerAddRow}
          >
            Add Row
          </ButtonUi>
        )}
      </div>
      <div className="table-container">
        <SimpleBar forceVisible="y" autoHide={false}>
          <Table hover>
            <thead>
              <tr>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <th className="sticky-column left" style={{ width: "5%" }}>
                    Actions
                  </th>
                )}
                {salesOrderItemHeader.map((header, index) => (
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
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemFormData.map((data, rowIndex) => (
                <tr
                  key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                  style={{
                    border: `${
                      rowIndex === focusedRowIndex ? "2px solid black" : "none"
                    }`,
                  }}
                  tabIndex={0}
                >
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <td className="">
                      <RowAction
                        formStatus={formStatus}
                        canDelete={itemFormData.length > 1}
                        onDelete={() => handleItemRowDelete(rowIndex)}
                        onUpdate={
                          handleUpdate ? () => handleUpdate(data) : undefined
                        }
                      />
                    </td>
                  )}
                  <td>
                    <TextField
                      required
                      type="text"
                      name="catalog_code"
                      value={data.catalog_code || ""}
                      onChange={(e) =>
                        handleChange("catalog_code", e.target.value, rowIndex)
                      }
                      onDoubleClick={() => handleDoubleClick("catalog_code")}
                      readOnly={doubleClickFieldsReadOnly}
                      onBlur={() =>
                        validateFormFields("catalog_code", focusedRowIndex)
                      }
                      ref={getFieldRef(`catalog_code_${rowIndex}`)}
                    />
                  </td>
                  <td>
                    <TextField
                      required
                      type="text"
                      name="it_code"
                      value={data.it_code || ""}
                      onChange={(e) =>
                        handleChange("it_code", e.target.value, rowIndex)
                      }
                      onDoubleClick={() => handleDoubleClick("it_code")}
                      readOnly={doubleClickFieldsReadOnly}
                      onBlur={() =>
                        validateFormFields("it_code", focusedRowIndex)
                      }
                      ref={getFieldRef(`it_code_${rowIndex}`)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="text"
                      name="it_desc"
                      value={data.it_desc || ""}
                      onChange={(e) =>
                        handleChange("it_desc", e.target.value, rowIndex)
                      }
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      required
                      name="qty_ord"
                      value={data.qty_ord || ""}
                      onChange={(e) =>
                        handleChange("qty_ord", e.target.value, rowIndex)
                      }
                      onBlur={() =>
                        validateFormFields("qty_ord", focusedRowIndex)
                      }
                      ref={getFieldRef(`qty_ord_${rowIndex}`)}
                    />
                  </td>
                  <td>
                    <TextField
                      required
                      type="text"
                      name="mat_rat"
                      value={data.mat_rat || ""}
    
                      onChange={(e) =>
                        handleChange("mat_rat", e.target.value, rowIndex)
                      }
                      onBlur={() =>
                        validateFormFields("mat_rat", focusedRowIndex)
                      }
                      ref={getFieldRef(`mat_rat_${rowIndex}`)}
                    />
                  </td>
                  <td>
                    <Checkbox
                      checked={data?.active || false}
                      onChange={(e) => handleChange("active", e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </SimpleBar>
      </div>
      <Container>
        <Row>
          <Col>
            <TextField
              type="text"
              label="UOM"
              value={itemFormData[focusedRowIndex]?.it_uom || ""}
              onChange={(e) =>
                handleChange("it_uom", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col>
            <TextField
              required
              type="text"
              label="Rate Per Unit"
              value={itemFormData[focusedRowIndex]?.perunit || ""}
              onChange={(e) =>
                handleChange("perunit", e.target.value, focusedRowIndex, e)
              }
              onBlur={() => validateFormFields("perunit", focusedRowIndex)}
              ref={getFieldRef(`perunit`)}
            />
          </Col>
          <Col>
            <TextField
              type="text"
              label="Total Qty"
              value={itemFormData[focusedRowIndex]?.total_qty || ""}
              onChange={(e) =>
                handleChange("total_qty", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col>
            <TextField
              type="text"
              label="Customer Item Code"
              value={itemFormData[focusedRowIndex]?.cus_it_code || ""}
              onChange={(e) =>
                handleChange("cus_it_code", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col>
            <TextField
              type="text"
              label="Customer Item Desc."
              value={itemFormData[focusedRowIndex]?.cus_it_desc || ""}
              onChange={(e) =>
                handleChange("cus_it_desc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
          <Col>
            <TextField
              type="text"
              label="HSN"
              value={itemFormData[focusedRowIndex]?.hsn_sac_code || ""}
              onChange={(e) =>
                handleChange("hsn_sac_code", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col lg="3">
            <TextField
              type="text"
              label="Sale A/C Head"
              value={itemFormData[focusedRowIndex]?.sale_ac_head || ""}
              onChange={(e) =>
                handleChange("sale_ac_head", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
          <Col lg={6} className="mt-4">
            <TextField
              type="text"
              // label="Customer Item Desc."
              value={itemFormData[focusedRowIndex]?.sale_ac_desc || ""}
              onChange={(e) =>
                handleChange("sale_ac_desc", e.target.value, focusedRowIndex, e)
              }
              disabled
            />
          </Col>
        </Row>

        <Row className=" box border mt-2">
          <Row className="mb-2 justify-content-around mt-1">
            <Col lg={1} className="mt-4">
              <h5 className="mt-3">GST --</h5>
            </Col>
            <Col lg={3} className="mt-4">
              <RadioGroup
                className="mt-2 radio-button-wrapper box-border Transaction-height"
                options={[
                  { text: "%", value: "%" },
                  { text: "Value", value: "V" },
                ]}
                onChange={(e) =>
                  handleChange(
                    "gst_amt_prc",
                    e.target.value,
                    focusedRowIndex,
                    e
                  )
                }
                checked={itemFormData[focusedRowIndex]?.gst_amt_prc || "%"}
              />
            </Col>
            <Col sm={6} md={3} lg={2}>
              <Row>
                <TextField
                  type="text"
                  label="SGST"
                  value={itemFormData[focusedRowIndex]?.gst_sgst_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_sgst_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />
                <TextField
                  type="text"
                  label="Cess"
                  value={itemFormData[focusedRowIndex]?.gst_sgst_cess_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_sgst_cess_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />
              </Row>
            </Col>
            <Col sm={6} md={3} lg={2}>
              <Row>
                <TextField
                  type="text"
                  label="UGST"
                  value={itemFormData[focusedRowIndex]?.gst_ugst_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_ugst_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />

                <TextField
                  type="text"
                  label="Cess"
                  value={itemFormData[focusedRowIndex]?.gst_ugst_cess_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_ugst_cess_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />
              </Row>
            </Col>
            <Col sm={6} md={3} lg={2}>
              <Row>
                <TextField
                  type="text"
                  label="CGST"
                  value={itemFormData[focusedRowIndex]?.gst_cgst_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_cgst_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />
                <TextField
                  type="text"
                  label="Cess"
                  value={itemFormData[focusedRowIndex]?.gst_cgst_cess_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_cgst_cess_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />
              </Row>
            </Col>
            <Col sm={6} md={3} lg={2}>
              <Row>
                <TextField
                  type="text"
                  label="IGST"
                  value={itemFormData[focusedRowIndex]?.gst_igst_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_igst_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />

                <TextField
                  type="text"
                  label="Cess"
                  value={itemFormData[focusedRowIndex]?.gst_igst_cess_val || ""}
                  onChange={(e) =>
                    handleChange(
                      "gst_igst_cess_val",
                      e.target.value,
                      focusedRowIndex,
                      e
                    )
                  }
                />
              </Row>
            </Col>
          </Row>
        </Row>

        <Row className="mt-1">
          <Col md={4}>
            <Select
              label="packing"
              name="pack_code"
              value={itemFormData[focusedRowIndex]?.["pack_code"] || "P"}
              onChange={(e) =>
                handleChange("pack_code", e.target.value, focusedRowIndex, e)
              }
              options={[
                { value: "", label: "" },
                ...(dropdownData?.packingOptions || []),
              ]}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <TextArea
              type="text"
              label="Remark"
              value={itemFormData[focusedRowIndex]?.remark || ""}
              onChange={(e) =>
                handleChange("remark", e.target.value, focusedRowIndex, e)
              }
            />
          </Col>
        </Row>

        <Row className="d-flex justify-content-center">
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Main");
              }}
            >
              {" "}
              Main Details{" "}
            </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Discount");
              }}
            >
              Discount
            </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Subcontract");
              }}
            >
              Sub Contract
            </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi
              type="button"
              color="dark"
              outline
              onClick={() => {
                handleChangeTab("Advance");
              }}
            >
              Advance
            </ButtonUi>
          </Col>
        </Row>
      </Container>
    </Form>
  );
};
SalesOrderItems.propTypes = {
  formStatus: PropTypes.string,
  itemDetail: PropTypes.array,
  handleChange: PropTypes.func,
  itemFormData: PropTypes.array.isRequired,
  handleChangeTab: PropTypes.func,
  handleAddRow: PropTypes.func.isRequired,
  dropdownData: PropTypes.object,
  handleHelpList: PropTypes.func,
  validateFormFields: PropTypes.func,
  handleItemRowDelete: PropTypes.func.isRequired,
  getFieldRef: PropTypes.func,
};

export default SalesOrderItems;
