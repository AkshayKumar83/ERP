import React from "react";
import { Card, Col, Form, Row, Table } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import { srnoHeader } from "./service_order_helper";
import Checkbox from "../../../../components/basic/checkbox";
import TextArea from "../../../../components/basic/textArea";

const ServiceOrderEqpmntSrNo = ({
  formData,
  formStatus,
  handleChange,
  handleSrnoChange,
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
          <Col xl={2} className="mt-4 ms-5">
            <TextField
              // label="Item Code"
              value={formData[0].order_id || ""}
              onChange={(e) => handleChange("order_id", e.target.value)}
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col xl={3}>
            <TextField
              type="text"
              label="Item Code"
              value={formData[0].it_code || ""}
              onChange={(e) => handleChange("it_code", e.target.value)}
              disabled
            />
          </Col>
          <Col xl={4} className="mb-1">
            <TextField
              type="text"
              label=" Item Desc"
              value={formData[0].it_desc || ""}
              onChange={(e) => handleChange("it_desc", e.target.value)}
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
                    {srnoHeader.map((header, index) => (
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
                            canDelete={srnoData.length > 1}
                            onDelete={() => handleDelete(rowIndex)}
                          />
                        </td>
                      )}
                      <td>
                        <TextField
                          type="text"
                          name="sr_no"
                          value={data.sr_no || ""}
                          onChange={(e) => handleChange("sr_no", e.target.value, rowIndex, e) }
                        />
                      </td>
                      <td>
                        <Checkbox
                          type="text"
                          name="active"
                          value={data.active || ""}
                          checked={data?.active || false}
                        onChange={(e) => handleChange("active", e.target.checked) }
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
        <Row className="mt-1">
          <Col lg={10}>
            <TextArea
              type="text"
              label="Remark"
              value={formData[0].remarks || ""}
              onChange={(e) => handleChange("remarks", e.target.value)}
            />
          </Col>
        </Row>
        <div
          style={{ display: "flex", border: "none", justifyContent: "center" }}
        >
          <ButtonUi
            color="secondary"
            onClick={() => {
              handleChangeTab("Items");
            }}
          >
            {" "}
            Main Items
          </ButtonUi>
        </div>
      </Row>
    </React.Fragment>
  );
};

export default ServiceOrderEqpmntSrNo;
