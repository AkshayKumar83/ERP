import React, { useState } from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import { ItemHeader } from "./scrap_order_helper";
import Select from "../../../../components/basic/select";
import TextArea from "../../../../components/basic/textArea";

const ScrapOrderItem = ({
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
    <>
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
                        rowIndex === focusedRowIndex
                          ? "2px solid black"
                          : "none"
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
                        name="hsn_sac_code"
                        value={data.hsn_sac_code || ""}
                        onChange={(e) =>
                          handleChange("hsn_sac_code", e.target.value, rowIndex)
                        }
                        disabled
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
                        onChange={(e) =>
                          handleChange("active", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </SimpleBar>
        </div>
      </Form>

      <Row>
        <Col lg={10}>
          <Row className="d-flex justify-content-end">
            <Col lg={2}>
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
        <Col lg={3}>
          <Select
            label="packing"
            name="pack_code"
            value={itemFormData[focusedRowIndex]?.["pack_code"] || "P"}
            onChange={(e) =>
              handleChange("pack_code", e.target.value, focusedRowIndex, e)
            }
            // options={[{ value: "P", label: "GENERAL ACCOUNTING" }]}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col lg={10}>
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
            disabled
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
            disabled
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
            disabled
            onClick={() => {
              handleChangeTab("Advance");
            }}
          >
            Advance
          </ButtonUi>
        </Col>
      </Row>
    </>
  );
};

export default ScrapOrderItem;
