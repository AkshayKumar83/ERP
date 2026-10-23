import React from "react";
import { Container, Row, Col } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import _ from "lodash";

const ItemMasterDivisionDetail = ({ 
  apiData,
  formData, 
  divFormData, 
  handleChange, 
  formStatus 
}) => {
  const productionTransferOptions = _.map(apiData?.productionDetailsList || [], item => ({ value: item.wc_id, label: `${item.wc_no} [${item.wc_id}]` })) || [];

  return (
    <Container>
      <div className="text-wrapper  box border p-2 mt-3">
        <span className="text-label">Store Norm</span>
        <Row>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Optimum (in Nos.)"
              value={divFormData.optimum_stock_oty || ""}
              onChange={(e) => handleChange("optimum_stock_oty", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Maximum (in Nos.)"
              value={divFormData.max_stock_qty || ""}
              onChange={(e) => handleChange("max_stock_qty", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Minimum (in Nos.)"
              value={divFormData.min_stock_qty || ""}
              onChange={(e) => handleChange("min_stock_qty", e.target.value)}
            />
          </Col>
        </Row>
        <Row>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Optimum (in Days)"
              value={divFormData.optimumstk_days || ""}
              onChange={(e) => handleChange("optimumstk_days", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Maximum (in Days)"
              value={divFormData.max_stock_days || ""}
              onChange={(e) => handleChange("max_stock_days", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Minimum (in Days)"
              value={divFormData.min_stock_days || ""}
              onChange={(e) => handleChange("min_stock_days", e.target.value)}
            />
          </Col>
        </Row>
      </div>

      <Row>
        <Col lg="3">
          <div className="text-wrapper  box border p-2 mt-3">
            <span className="text-label">Reorder</span>
            <Row className="ms-3">
              <Col md={12} lg={12}>
                <TextField
                  type="text"
                  label="Level"
                  value={divFormData.reorder_level || ""}
                  onChange={(e) =>
                    handleChange("reorder_level", e.target.value)
                  }
                />
              </Col>

            </Row>
          </div>
        </Col>
        <Col md={6} lg={5} className=" mt-1 ms-4">
          <Select
            type="text"
            label="Production Transfer To"
            value={divFormData.prod_transfer_to_wc_id || ""}
            onChange={(e) => handleChange("prod_transfer_to_wc_id", e.target.value)}
            options={[
              { value: "", label: "Select an option" },
              ...productionTransferOptions
            ]}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col md={3} lg={2} className="button-group-wrapper " >
          <Checkbox
            text="Include in MRP"
            onChange={(e) => handleChange("mrp_yn", e.target.checked ? "Y" : "N")}
            checked={divFormData?.mrp_yn === "Y"}
          />
        </Col>

        <Col lg="4" md={6} className="mt-lg-2">
          <div className="text-wrapper  box border p-2 mt-md-2 mt-sm-2 ">
            <span className="text-label">Excise Chapter(Purchase)</span>
            <Row className="p-2 ">
              <Col md={12} lg={12} >
                <TextField
                  type="text"
                  // label="Level"
                  value={formData.tarrif_no || ""}
                  onChange={(e) => handleChange("tarrif_no", e.target.value)}
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ItemMasterDivisionDetail;
