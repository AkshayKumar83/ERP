import React from "react";
import { Container, Row, Col } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";

const ItemMasterAdditional = ({ formData, handleChange, formStatus }) => {
  return (
    <Container>
      <Row>
        <Col lg={6}>
          <div className="text-wrapper  box border p-2">
            <span className="text-label">Lead Time</span>
            <Row>
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Days"
                  value={formData.it_ltd || ""}
                  onChange={(e) => handleChange("it_ltd", e.target.value)}
                  disabled
                />
              </Col>
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Purchase"
                  value={formData.it_pu_lt || ""}
                  onChange={(e) => handleChange("it_pu_lt", e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Manufacturing"
                  value={formData.it_mfg_lt || ""}
                  onChange={(e) => handleChange("it_mfg_lt", e.target.value)}
                />
              </Col>
              <Col md={6} lg={6}>
                <TextField
                 type="number"
                  label="Inspection"
                  value={formData.it_insp_lt || ""}
                  onChange={(e) => handleChange("it_insp_lt", e.target.value)}
                />
              </Col>
            </Row>
          </div>
        </Col>

        <Col lg={6} className="mt-lg-0 mt-md-3 mt-sm-3">
          <div className=" text-wrapper  box border p-2">
            <span className="text-label">Cycle Counting</span>
            <Row>
              <Col md={6} lg={6}>
                <TextField
                   type="number"
                  label="Cycle Count Frequency"
                  value={formData.cycontfreq || ""}
                  onChange={(e) => handleChange("cycontfreq", e.target.value)}
                />
              </Col>
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Last Cycle Count Variance"
                  value={formData.cyc_contva || ""}
                  onChange={(e) => handleChange("cyc_contva", e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Last Cycle Count Date"
                  value={formData.last_cydt || ""}
                  onChange={(e) => handleChange("last_cydt", e.target.value)}
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <div className="text-wrapper  box border p-2 mt-3">
        <span className="text-label">Store Nom</span>
        <Row>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Optimum (in Nos.)"
              value={formData.optimumstk || ""}
              onChange={(e) => handleChange("optimumstk", e.target.value)}
              disabled
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Maximum (in Nos.)"
              value={formData.max_stock || ""}
              onChange={(e) => handleChange("max_stock", e.target.value)}
              disabled
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Minimum (in Nos.)"
              value={formData.min_stock || ""}
              onChange={(e) => handleChange("min_stock", e.target.value)}
              disabled
            />
          </Col>
        </Row>
        <Row>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Optimum (in Days)"
              value={formData.optimumstk_days || ""}
              onChange={(e) => handleChange("optimumstk_days", e.target.value)}
              disabled
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Maximum (in Days)"
              value={formData.max_stock_days || ""}
              onChange={(e) => handleChange("max_stock_days", e.target.value)}
              disabled
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="text"
              label="Minimum (in Days)"
              value={formData.min_stock_days || ""}
              onChange={(e) => handleChange("min_stock_days", e.target.value)}
              disabled
            />
          </Col>
        </Row>
      </div>

      <Row>
        <Col md={4} lg={4} className=" mt-lg-3 mt-md-3 mt-sm-3">
          <div className="text-wrapper  box border">
            <span className="text-label">WIP Norm</span>
            <Row className="d-flex justify-content-center p-1 mb-1">
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Qty"
                  value={formData.wip_norm || ""}
                  onChange={(e) => handleChange("wip_norm", e.target.value)}
                />
              </Col>
            </Row>
          </div>
        </Col>

        <Col md={7} lg={5} className=" mt-lg-3 mt-md-3 mt-sm-3">
          <div className="text-wrapper  box border">
            <span className="text-label">Reorder</span>
            <Row className="mb-1 p-1 ms-4 me-4 ">
              <Col md={6} lg={6}>
                <TextField
                  type="number"
                  label="Qty"
                  value={formData.reorder_qty || ""}
                  onChange={(e) => handleChange("reorder_qty", e.target.value)}
                  disabled
                />
              </Col>
              <Col md={6} lg={6}>
                <TextField
                  type="text"
                  label="Level"
                  value={formData.reorder_level || ""}
                  onChange={(e) =>
                    handleChange("reorder_level", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
          </div>
        </Col>
        <Col
          md={4}
          lg={2}
          className="button-group-wrapper mt-md-3 mt-lg-3 mt-sm-1 mt-ms-4"
        >
          <Checkbox
            text="Excise as capital"
            onChange={(e) =>
              handleChange("excise_as_capital", e.target.checked ? "Y" : "N")
            }
            checked={formData?.excise_as_capital === "Y"}
          />
        </Col>
      </Row>

      <div className="text-wrapper  box border p-2 mt-3">
        <span className="text-label">Item Cost</span>
        <Row>
          <Col md={4} lg={4}>
            <TextField
               type="number"
              label="Year Opening"
              value={formData.yrop_rate || ""}
              onChange={(e) => handleChange("yrop_rate", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="number"
              label="Standard"
              value={formData.std_cost || ""}
              onChange={(e) => handleChange("std_cost", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
               type="number"
              label="Material"
              value={formData.matrl_cost || ""}
              onChange={(e) => handleChange("matrl_cost", e.target.value)}
            />
          </Col>
        </Row>
        <Row className="mt-1">
          <Col md={4} lg={4}>
            <TextField
             type="number"
              label="Maximum"
              value={formData.max_rate || ""}
              onChange={(e) => handleChange("max_rate", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="number"
              label="Labour"
              value={formData.labor_cost || ""}
              onChange={(e) => handleChange("labor_cost", e.target.value)}
            />
          </Col>
          <Col md={4} lg={4}>
            <TextField
              type="number"
              label="OverHead"
              value={formData.ovrhd_cost || ""}
              onChange={(e) => handleChange("ovrhd_cost", e.target.value)}
            />
          </Col>
        </Row>
        <Row className="mt-1">
          <Col md={6} lg={4}>
            <TextField
              type="number"
              label="Current Weighted Average"
              value={formData.currwt_rt || ""}
              onChange={(e) => handleChange("currwt_rt", e.target.value)}
            />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default ItemMasterAdditional;
