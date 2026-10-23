import React from "react";
import { Card, Col, Form, Row, Table } from "reactstrap";
import { DiscountHeader } from "./service_order_helper";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import RadioGroup from "../../../../components/basic/radioGroup";

const ServiceOrderDiscount = ({
  formData,
  formStatus,
  handleChange,
  handleDiscountChange,
  handleAddRow,
  handleDelete,
  handleChangeTab = () => {},
}) => {
  return (
    // Above card field values should be dynamicaly visible as per selecting the row of the table
    // for time being i did selecing the zeroth index
    <React.Fragment>
      <Card className="mt-1 mb-2 p-1 shadow-sm">
        <Row>
          <Col md={4} lg={3} xl={2} className=" ms-4 mb-1">
            <TextField
              label="Item Code"
              value={formData[0].disc_it_code || ""}
              onChange={(e) => handleChange("disc_it_code", e.target.value)}
              disabled
            />
          </Col>
          <Col md={6} lg={5} xl={4} className="mb-1">
            <TextField
              type="text"
              label="Item Desc"
              value={formData[0].disc_it_desc || ""}
              onChange={(e) => handleChange("disc_it_desc", e.target.value)}
              disabled
            />
          </Col>
        </Row>

        <Row>
          <Col md={4} lg={3} xl={2} className=" ms-4 mb-1">
            <TextField
              type="text"
              label="Customer Item Code"
              value={formData[0].disc_cust_it_code || ""}
              onChange={(e) => handleChange("disc_cust_it_code", e.target.value) }
              disabled
            />
          </Col>
          <Col md={6} lg={5} xl={4} className="mb-1">
            <TextField
              type="text"
              label="Customer Item Desc"
              value={formData[0].disc_cust_it_desc || ""}
              onChange={(e) => handleChange("disc_cust_it_desc", e.target.value) }
              disabled
            />
          </Col>
        </Row>

        <Row>
          <Col md={2} lg={3} xl={1} className=" ms-4 mb-1">
            <TextField
              type="text"
              label="UOM"
              value={formData[0].disc_it_uom || ""}
              onChange={(e) => handleChange("disc_it_uom", e.target.value)}
              disabled
            />
          </Col>
          <Col md={3} lg={5} xl={2} className=" lg-ms-5 mb-1">
            <TextField
              type="number"
              label="Quantity"
              value={formData[0].disc_qty_ord || ""}
              onChange={(e) => handleChange("disc_qty_ord", e.target.value)}
              disabled
            />
          </Col>
        </Row>
      </Card>

      <Card className="mb-2 p-1 shadow-sm">
        <Form id="sales-order-discount-form">
          <div className="table-title d-flex justify-content-end">
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
            style={{ height: "140px", maxHeight: "140px" }}
          >
            <SimpleBar forceVisible="y" autoHide={false}>
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
                    {DiscountHeader.map((header, index) => (
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
                  {formData.map((data, rowIndex) => (
                    <tr key={rowIndex}>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="sticky-column left">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={discountData.length > 1}
                            onDelete={() => handleDelete(rowIndex)}
                          />
                        </td>
                      )}
                      <td>
                        <TextField
                          type="text"
                          name="disc_desc"
                          value={data.disc_desc || ""}
                          onChange={(e) => handleChange( "disc_desc", e.target.value, rowIndex, e ) }
                        />
                      </td>
                      <td>
                        <RadioGroup
                          className="button-group-wrapper box-border justify-content-between"
                          options={[
                            { text: "%", value: "P" },
                            { text: "Pcs", value: "S" },
                            { text: "Amt", value: "A" },
                          ]}
                          onChange={(e) => handleChange( "disc_prc_amt", e.target.value, rowIndex, e ) }
                          checked={data.disc_prc_amt}
                        />
                      </td>
                      <td>
                        <TextField
                          type="text"
                          name="disc_value"
                          value={data.disc_value || ""}
                          onChange={(e) => handleChange( "disc_value", e.target.value, rowIndex, e ) }
                          disabled
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </SimpleBar>
          </div>
        </Form>
      </Card>
      <Row>
        <div
          style={{ display: "flex", border: "none", justifyContent: "center" }}
        >
          <ButtonUi
            color="secondary"
            onClick={() => { handleChangeTab("Items");
            }}
          >
            Items
          </ButtonUi>
        </div>
      </Row>
    </React.Fragment>
  );
};

export default ServiceOrderDiscount;
