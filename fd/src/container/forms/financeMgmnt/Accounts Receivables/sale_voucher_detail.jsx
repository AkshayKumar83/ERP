import React, { useState } from "react";
import { Col, Container, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import SaleVoucherheader from "./sale_voucher_header";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import { saleVoucherDetailHeader } from "./sale_voucher_helper";
import Select from "../../../../components/basic/select";
import RadioGroup from "../../../../components/basic/radioGroup";

const SaleVoucherDetail = ({
  detailData = [{}],
  handleChange,
  formStatus,
  mofData,
  triggerAddRow,
  purposes = [],
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  function handleDelete() {}
  function handleUpdate() {}

  return (
    <>
      <Form id="Sale-Voucher" className="">
        <div className="table-title">
          <span>Sale voucher</span>
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
        <div className="table-wrapper-v3">
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className="table-sticky-wrapper">
              <Table hover>
                <thead>
                  <tr>
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <th className="">Actions</th>
                    )}
                    {saleVoucherDetailHeader.map((header, index) => (
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
                  {detailData.map((data, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
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
                            canDelete={detailData.length > 1}
                            onDelete={() => handleDelete(data, rowIndex)}
                            // onUpdate={
                            //   handleUpdate
                            //     ? () => handleUpdate(data)
                            //     : undefined
                            // }
                          />
                        </td>
                      )}
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="remarks"
                          value={data.remarks || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "remarks",
                              e.target.value,
                              rowIndex
                            )
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="acc_no"
                          value={data.acc_no || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "acc_no",
                              e.target.value,
                              rowIndex
                            )
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="cost"
                          value={data.cost || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "cost",
                              e.target.value,
                              rowIndex
                            )
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="number"
                          style={{ textalign: "right" }}
                          required
                          name="amount"
                          value={data.amount || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "amount",
                              e.target.value,
                              rowIndex
                            )
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="db_cr"
                          value={data.db_cr || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "db_cr",
                              e.target.value,
                              rowIndex
                            )
                          }
                          disabled
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

      <Row>
        <Col sm={6} md={3} lg={2}>
          <Select
            required
            label="Purpose"
            name="pur_code"
            placeholder={" "}
            value={detailData[focusedRowIndex]?.pur_code || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "pur_code",
                e.target.value,
                focusedRowIndex,
                e
              )
            }
            options={purposes}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Cost Center"
            value={detailData[focusedRowIndex]?.cost_desc || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "cost_desc",
                e.target.value,
                focusedRowIndex,
                e
              )
            }
            // disabled
          />
        </Col>
        <Col sm={6} md={3} lg={4}>
          <TextField
            type="text"
            label="Acc Name"
            value={detailData[focusedRowIndex]?.acc_desc || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "acc_desc",
                e.target.value,
                focusedRowIndex,
                e
              )
            }
            // disabled
          />
        </Col>
        {/* below data is MOFMSTFO */}
      </Row>
      <Row className="mt-1">
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Taxable Amt"
            value={mofData.trans_amt || ""}
            onChange={(e) =>
              handleChange("mofData", "trans_amt", e.target.value)
            }
            //disabled
          />
        </Col>
        <Col sm={6} md={3} lg={2} className="mt-4">
          <RadioGroup
            className=" radio-button-wrapper box-border "
            options={[
              { text: "Local", value: "L" },
              { text: "Central", value: "C" },
            ]}
            onChange={(e) => handleChange("mofData", "st_flag", e.target.value)}
            checked={mofData?.st_flag || " "}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Form"
            value={mofData.st_form || ""}
            onChange={(e) => handleChange("mofData", "st_form", e.target.value)}
            //disabled
          />
        </Col>
        <Col sm={6} md={3} lg={1}>
          <TextField
            type="text"
            label="%"
            value={mofData.st_perc || ""}
            onChange={(e) => handleChange("mofData", "st_perc", e.target.value)}
            disabled
          />
        </Col>
        <Col lg={1} className="mt-4 ms-4 bg-secondary text-black f-bold">
          <span>Sales Tax</span>
        </Col>
      </Row>
    </>
  );
};

export default SaleVoucherDetail;
