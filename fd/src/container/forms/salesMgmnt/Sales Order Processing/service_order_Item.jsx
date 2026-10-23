import React, { useState } from "react";
import { Card, Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import { ItemHeader } from "./service_order_helper";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextArea from "../../../../components/basic/textArea";
const ServiceOrderItem = ({
  // FormData = {},
  itemDetail = [{}, {}, {}, {}],
  formStatus = "",
  handleChange = () => {},
  itemFormData,
  handleChangeTab = () => {},
  handleAddRow,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = itemFormData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const triggerAddRow = () => {
    handleAddRow();
  };
  const handleDelete = () => {};
  const handleUpdate = () => {};

  return (
    <Form>
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
                {ItemHeader.map((header, index) => (
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
                        onDelete={() => handleDelete(data, rowIndex)}
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
                      name="it_code"
                      value={data.it_code || ""}
                      onChange={(e) =>
                        handleChange("it_code", e.target.value, rowIndex)
                      }
                    />
                  </td>
                  <td>
                    <TextField
                      required
                      type="text"
                      name="it_name"
                      value={data.it_name || ""}
                      onChange={(e) =>
                        handleChange("it_name", e.target.value, rowIndex)
                      }
                      disabled
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="text"
                      name="it_uom"
                      value={data.it_uom || ""}
                      onChange={(e) =>
                        handleChange("it_uom", e.target.value, rowIndex)
                      }
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      name="qty_ord"
                      value={data.qty_ord || ""}
                      onChange={(e) =>
                        handleChange("qty_ord", e.target.value, rowIndex)
                      }
                    />
                  </td>
                  <td>
                    <TextField
                      type="text"
                      name="mat_rat"
                      value={data.mat_rat || ""}
                      onChange={(e) =>
                        handleChange("mat_rat", e.target.value, rowIndex)
                      }
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

      <Row>
        <Col sm={12} md={10} lg={10}>
          <Row className="d-flex justify-content-end">
            <Col sm={6} md={4} lg={2}>
              <TextField
                type="text"
                label="Total Qty"
                value={itemFormData[focusedRowIndex]?.total_qty || ""}
                onChange={(e) =>
                  handleChange("total_qty", e.target.value, focusedRowIndex, e)
                }
                style={{ backgroundColor: "yellow" }}
                disabled
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={6} md={4} lg={3}>
          <TextField
            type="text"
            label="Customer Item Code"
            value={itemFormData[focusedRowIndex]?.cus_it_code || ""}
            onChange={(e) =>
              handleChange("cus_it_code", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
        <Col sm={12} md={7} lg={8}>
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
      </Row>
      <Row className="mt-1">
        <Col sm={6} md={4} lg={3}>
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
      <Row className="mt-3">
        <Col md={10} lg={10}>
          <Row className=" box border mt-2">
            <Row className="mb-2 justify-content-around mt-1">
              <Col lg={3} className="mt-lg-4">
                <RadioGroup
                  className="mt-2 radio-button-wrapper box-border "
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
                    value={
                      itemFormData[focusedRowIndex]?.gst_sgst_cess_val || ""
                    }
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
                    value={
                      itemFormData[focusedRowIndex]?.gst_ugst_cess_val || ""
                    }
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
                    value={
                      itemFormData[focusedRowIndex]?.gst_cgst_cess_val || ""
                    }
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
                    value={
                      itemFormData[focusedRowIndex]?.gst_igst_cess_val || ""
                    }
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
        </Col>
      </Row>
      <Row className="mt-1">
        <Col lg={10}>
          <TextArea
            type="text"
            label="Item Level Remark"
            value={itemFormData[focusedRowIndex]?.remark || ""}
            onChange={(e) =>
              handleChange("remark", e.target.value, focusedRowIndex, e)
            }
          />
        </Col>
      </Row>
      <Row className="d-flex justify-content-center">
        <Col md={2} lg={2}>
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
        <Col md={2} lg={2}>
          <ButtonUi
            type="button"
            color="dark"
            outline
            disabled
            onClick={() => {
              handleChangeTab("Discount");
            }}
          >
            Discount
          </ButtonUi>
        </Col>
        <Col md={2} lg={2}>
          <ButtonUi
            type="button"
            color="dark"
            outline
            disabled
            onClick={() => {
              handleChangeTab("Subcontract");
            }}
          >
            Sub Contact
          </ButtonUi>
        </Col>
        <Col md={2} lg={2}>
          <ButtonUi
            type="button"
            color="dark"
            outline
            disabled
            onClick={() => {
              handleChangeTab("Advance");
            }}
          >
            Advance
          </ButtonUi>
        </Col>
        <Col md={2} lg={2}>
          <ButtonUi
            type="button"
            color="dark"
            outline
            disabled
            onClick={() => {
              handleChangeTab("Reason");
            }}
          >
            Reason
          </ButtonUi>
        </Col>
        <Col md={2} lg={2}>
          <ButtonUi
            type="button"
            color="dark"
            outline
            disabled
            onClick={() => {
              handleChangeTab("Srno");
            }}
          >
            SRNO
          </ButtonUi>
        </Col>
      </Row>
    </Form>
  );
};

export default ServiceOrderItem;
