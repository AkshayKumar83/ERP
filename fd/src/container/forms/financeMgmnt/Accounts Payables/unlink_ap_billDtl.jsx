import { Row, Col, Card, CardBody } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import { formatTwoDecimal } from "../../../../utils/fn";

const UnlinkAPbillDtl = ({
  formData = {},
  formStatus,
  handleChange = () => {},
}) => {
  return (
    <Row className="justify-content-center">
      <Col xs={12} md={10} xl={6}>
        <Card className="shadow-sm mt-3">
          <CardBody>
            <Row className="gy-3">
              <Col xs={12} md={4}>
                <TextField
                  type="text"
                  label="Bill Log No."
                  name="bill_log"
                  value={formData?.bill_log || ""}
                  style={{ backgroundColor: "yellow" }}
                  onChange={handleChange}
                  disabled
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  type="date"
                  label="Bill Log Date"
                  name="blog_dt"
                  value={formData?.blog_dt || ""}
                  disabled
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="gy-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  type="text"
                  label="Bill No."
                  name="bill_no"
                  value={formData?.bill_no || ""}
                  disabled={formStatus != "Search"}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={4}>
                <TextField
                  type="date"
                  label="Bill Date"
                  name="bill_dt"
                  value={formData?.bill_dt || ""}
                  disabled={formStatus != "Search"}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="gy-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  type="text"
                  label="Vendor"
                  name="v_code"
                  value={formData?.v_code || ""}
                  disabled
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={8} className="mt-auto">
                <TextField
                  type="text"
                  name="v_name"
                  value={formData?.v_name || ""}
                  disabled
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="gy-3 mt-1">
              <Col xs={12} md={4}>
                <TextField
                  type="number"
                  label="Total Bill Amount"
                  name="tot_amt"
                  value={formatTwoDecimal(formData?.tot_amt) || ""}
                  disabled
                  onChange={handleChange}
                />
              </Col>
              <Col xs={12} md={8} className="d-flex align-items-center mt-auto">
                <Checkbox
                  text="Bill Status"
                  disabled
                  checked={formData?.pend_flag === "Y"}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default UnlinkAPbillDtl;
