import React from "react";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import {
  itemDiscountHeader,
  serviceVolumeDiscountHeader,
} from "./service_order_helper";
import Checkbox from "../../../../components/basic/checkbox";

const ServiceOrderVolumeDiscount = ({
  formData,
  formStatus,
  volumeDiscountData,
  handleAddRow,
  handleDelete,
  itemDiscountData,
  handleVolumeDiscountChange,
  handleItemDiscountChange,
  handleChange,
  handleChangeTab,
}) => {
  return (
    <React.Fragment>
      <div className="text-wrapper box-border p-1">
        <span className="text-label">Discount</span>
        {/* <Card className="mt-1 mb-2 p-1 shadow-sm"> */}
        <Row>
          <Col xl={8}>
            <Form id="volume-order-discount-form">
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
              <div
                className="table-container"
                style={{ height: "280px", maxHeight: "280px" }}
              >
                <SimpleBar forceVisible="y" autoHide={false}>
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && (
                          <th
                            style={{ width: "80px" }}
                            className="sticky-column left"
                          >
                            Actions
                          </th>
                        )}
                        {serviceVolumeDiscountHeader.map((header, index) => (
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
                      {volumeDiscountData.map((data, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                          {/* First Row */}
                          <tr key={`${rowIndex}`}>
                            {(formStatus === "Insert" ||
                              formStatus === "Update") && (
                              <td className="sticky-column left">
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={volumeDiscountData.length > 1}
                                  onDelete={() => handleDelete(rowIndex)}
                                />
                              </td>
                            )}
                            <td>
                              <TextField
                                type="text"
                                name={`disc_desc_${rowIndex}`}
                                value={data.disc_desc || ""}
                                onChange={(e) => handleVolumeDiscountChange( "disc_desc", e.target.value, rowIndex ) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                name={`disc_qty_from_${rowIndex}`}
                                value={data.disc_qty_from || ""}
                                onChange={(e) => handleVolumeDiscountChange( "disc_qty_from", e.target.value, rowIndex ) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                name={`disc_qty_to_${rowIndex}`}
                                value={data.disc_qty_to || ""}
                                onChange={(e) => handleVolumeDiscountChange( "disc_qty_to", e.target.value, rowIndex ) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                name={`disc_value_${rowIndex}`}
                                value={data.disc_value || ""}
                                onChange={(e) => handleVolumeDiscountChange( "disc_value", e.target.value, rowIndex ) }
                              />
                            </td>
                            <td>
                              <Checkbox
                                type="text"
                                name={`chk_disc_${rowIndex}`}
                                value={data.chk_disc || ""}
                                onChange={(e) => handleVolumeDiscountChange( "chk_disc", e.target.value ? "Y" : "N", rowIndex ) }
                                checked={data?.chk_disc === "Y"}
                              />
                            </td>
                          </tr>

                          {/* Second Row */}
                          <tr key={`${rowIndex}_second`}>
                            <td>
                              <Checkbox
                                text="Auto Apply"
                                name={`auto_apply_${rowIndex}`}
                                value={data.auto_apply || ""}
                                onChange={(e) => handleVolumeDiscountChange( "auto_apply", e.target.value ? "Y" : "N", rowIndex ) }
                                checked={data?.auto_apply === "Y"}
                              />
                            </td>
                            <td>
                              <Checkbox
                                text="Based on Qty"
                                name={`disc_on_qty${rowIndex}`}
                                value={data.disc_on_qty || ""}
                                onChange={(e) => handleVolumeDiscountChange( "disc_on_qty", e.target.value ? "Y" : "N", rowIndex ) }
                                checked={data?.disc_on_qty === "Y"}
                              />
                            </td>

                            <td></td>

                            <td>
                              <RadioGroup
                                className="button-group-wrapper box-border justify-content-between"
                                options={[
                                  { text: "%", value: "P" },
                                  { text: "Pcs", value: "S" },
                                  { text: "Amt", value: "A" },
                                ]}
                                onChange={(e) => handleVolumeDiscountChange( "disc_prc_amt", e.target.value, rowIndex ) }
                                checked={data.disc_prc_amt}
                              />
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </Table>
                </SimpleBar>
              </div>
            </Form>
          </Col>
          <Col xl={4}>
            <Form id="item-order-discount-form">
              <div className="table-title"></div>
              <div
                className="table-container"
                style={{ height: "200px", maxHeight: "200px" }}
              >
                <SimpleBar forceVisible="y" autoHide={false}>
                  <Table hover>
                    <thead>
                      <tr>
                        {itemDiscountHeader.map((header, index) => (
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
                      {itemDiscountData.map((data, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>
                            <TextField
                              type="text"
                              name="it_code"
                              value={data.it_code || ""}
                              onChange={(e) => handleItemDiscountChange( "it_code", e.target.value, rowIndex ) }
                            />
                          </td>
                          <td>
                            <TextField
                              type="text"
                              name="min_qty"
                              value={data.min_qty || ""}
                              onChange={(e) => handleItemDiscountChange( "min_qty", e.target.value, rowIndex ) }
                            />
                          </td>
                          <td>
                            <TextField
                              type="text"
                              name="qty_offer"
                              value={data.qty_offer || ""}
                              onChange={(e) => handleItemDiscountChange( "qty_offer", e.target.value, rowIndex ) }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </SimpleBar>
              </div>
              <div style={{ marginLeft: "223px", alignSelf: "center" }}>
                <TextField
                  style={{ width: "100px" }}
                  type="text"
                  label="Total"
                  name="tot_qty"
                  value={formData.tot_qty || ""}
                  onChange={(e) =>handleItemDiscountChange("tot_qty", e.target.value) }
                />
              </div>
            </Form>
            <Row className="mt-5">
              <div
                style={{
                  display: "flex",
                  border: "none",
                  justifyContent: "center",
                }}
              >
                <ButtonUi
                  color="secondary"
                  onClick={() => { handleChangeTab("Main");}}
                >
                  Main Details
                </ButtonUi>
              </div>
            </Row>
          </Col>
        </Row>

        {/* </Card> */}
      </div>
    </React.Fragment>
  );
};

export default ServiceOrderVolumeDiscount;
