import { Col, Form, Row, Container, Button } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";
import RadioGroup from "../../../../components/basic/radioGroup";
import {
  isEmptyField,
  partyHelpListHeader,
  validateBillDate,
  validateBillNo,
  validateExpWork,
  validateParty,
  validateVoucherDate,
  validateWoNo,
  woNoHelpListHeader,
} from "./expense_voucher_helper";
import { useSelector } from "react-redux";

const ExpenseHeader = ({
  formData = {},
  formControlData = {},
  handleChange = () => {},
  formStatus = "",
  openGSTCanvas = () => {},
  section = [],
  poCategory = [],
  setParameter = () => {},
  handleHelpList = () => {},
  openHelpList = () => {},
  onSelectHelpItem = () => {},
  setThfmTranData = () => {},
}) => {
  const { user } = useSelector((state) => state.auth);

  // item validate section
  function handleSection(e) {
    if (e.target.value) {
      setParameter({ p_sect: e.target.value });
    }
    handleChange(e, "section", e.target.value);
  }

  return (
    <Form id="exp-thfmtran-form">
      <Container fluid>
        <Row className="d-flex justify-content-between">
          <Col md={4}>
            <Select
              required={true}
              label="Section"
              name="section"
              value={formData["section"] || "P"}
              onChange={(e) => handleSection(e)}
              options={section}
              onBlur={(e) => isEmptyField(e, formStatus)}
            />
          </Col>
          <Col
            md={4}
            className="d-flex justify-content-center align-items-end pb-1"
          >
            {formStatus == "Insert" && (
              <ButtonUi
                type="button"
                color="primary"
                outline
                onClick={openGSTCanvas}
                disabled={formData?.gst_id}
              >
                Create GST Entries with ITC
              </ButtonUi>
            )}
            {/* <Col md={2}> */}
            
            {formData?.posted === "Y" ? (
              <p
                className="mt-4 px-3 py-1"
                style={{
                  borderRadius: "6px",
                  fontSize: "10px",
                  backgroundColor: "yellow",
                  color: "blue",
                  textAlign: "center",
                }}
              >
                Posted
              </p>
            ) : formData?.cancel === "Y" ? (
              <p
                className="mt-4 px-3 py-1"
                style={{
                  borderRadius: "6px",
                  fontSize: "10px",
                  backgroundColor: "yellow",
                  color: "red",
                  textAlign: "center",
                }}
              >
                Cancelled
              </p>
            ) : null}
            {/* </Col> */}
          </Col>
          <Col md={3}>
            <TextField
              required={true}
              disabled={formStatus == "Search" ? false : true}
              type="text"
              name="voucher_no"
              label="Voucher No."
              value={formData.voucher_no || ""}
              onChange={(e) => handleChange(e, "voucher_no", e.target.value)}
            />
          </Col>
        </Row>
        <Row className="d-flex justify-content-between">
          <Col md={2} className="">
            <TextField
              required={true}
              type="text"
              label="Party Code"
              name="party_code"
              value={formData.party_code || ""}
              onChange={(e) => handleChange(e, "party_code", e.target.value)}
              onDoubleClick={(e) =>openHelpList("parties", partyHelpListHeader)}
              onBlur={(e) =>validateParty(e,  e.target.value,  formStatus,  user,  formData,  setThfmTranData)}
            />
          </Col>
          <Col md={5}>
            <TextField
              type="text"
              label="Party Name"
              name="party_name"
              value={formData.party_name || ""}
              onChange={(e) => handleChange(e, "party_name", e.target.value)}
              disabled
            />
          </Col>
          <Col md={2}>
            <span>{formControlData?.di_formstatus}</span>
          </Col>
          <Col md={3}>
            <TextField
              type="date"
              label="Voucher Date"
              name="voucher_dt"
              value={formData.voucher_dt || ""}
              onChange={(e) => handleChange(e, "voucher_dt", e.target.value)}
              max={new Date().toISOString().split("T")[0]} // Restrict future dates
              onBlur={(e) => {
                validateVoucherDate(setParameter, e, formStatus);
              }}
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col md={3}>
            <TextField
              required
              label="Bill No"
              type="text"
              name="bill_no"
              value={formData.bill_no || ""}
              onChange={(e) => handleChange(e, "bill_no", e.target.value)}
              onBlur={(e) => {
                validateBillNo(e, formStatus);
              }}
              maxLength={16}
            />
          </Col>
          <Col md={3}>
            <TextField
              required
              type="date"
              label="Bill Date"
              name="bill_dt"
              value={formData.bill_dt || ""}
              onChange={(e) => handleChange(e, "bill_dt", e.target.value)}
              onBlur={(e) => {
                validateBillDate(e, formStatus);
              }}
              max={new Date().toISOString().split("T")[0]}
            />
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Checkbox
              text="Party Register Under GST"
              name="gst_registered"
              checked={formData.gst_registered === "Y"}
              onChange={(e) =>
                handleChange(e, "gst_registered", e.target.checked ? "Y" : "N")
              }
              disabled
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              label="GST No."
              name="party_gst_no"
              value={formData.party_gst_no || ""}
              onChange={(e) => handleChange(e, "party_gst_no", e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-1 d-flex justify-content-between">
          <Col md={4} className="mt-4">
            <RadioGroup
              className="button-group-wrapper box-border"
              name="exp_work"
              options={[
                { text: "Expense", value: "E" },
                { text: "Work Order", value: "W" },
              ]}
              onChange={(e) => handleChange(e, "exp_work", e.target.value)}
              checked={formData?.exp_work || "E"}
            />
          </Col>
          <Col md={4}>
            <TextField
              type="text"
              label="Work Order No."
              name="wo_no"
              value={formData.wo_no || ""}
              onChange={(e) => handleChange(e, "wo_no", e.target.value)}
              disabled={formData.exp_work === "E"}
              onDoubleClick={(e) =>
                formData.exp_work !== "E" &&
                openHelpList("wo_no", woNoHelpListHeader)
              }
              onBlur={(e) =>
                validateWoNo(
                  e,
                  e.target.value,
                  formStatus,
                  user,
                  formData,
                  setThfmTranData
                )
              }
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              name="cons_ctrl_no"
              label="Import Consignment No."
              value={formData.cons_ctrl_no || ""}
              onChange={(e) => handleChange(e, "cons_ctrl_no", e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-1 d-flex justify-content-between">
          <Col md={8}>
            <TextField
              type="text"
              label="References"
              name="reference"
              value={formData.reference || ""}
              onChange={(e) => handleChange(e, "reference", e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Select
              label="Purchase Category"
              name="po_cat"
              value={formData["po_cat"] || "P"}
              onChange={(e) => handleChange(e, "po_cat", e.target.value)}
              options={poCategory}
              disabled={formData.exp_work === "E"}
            />
          </Col>
        </Row>
        <Row>
          <Col md={2} className="d-flex align-items-end">
            <Checkbox
              text="Capital"
              name="capital_flag"
              checked={formData.capital_flag === "Y"}
              onChange={(e) =>
                handleChange(e, "capital_flag", e.target.checked ? "Y" : "N")
              }
            />
          </Col>
          <Col md={5}>
            <TextField
              type="number"
              label="WO Amt."
              value={formData.wo_amt || ""}
              name="wo_amt"
              disabled
              onChange={(e) => handleChange(e, "wo_amt", e.target.value)}
            />
          </Col>
          <Col md={5}>
            <TextField
              type="number"
              label="WO Balance Amt."
              value={formData.wo_bal_amt || ""}
              name="wo_bal_amt"
              disabled
              onChange={(e) => handleChange(e, "wo_bal_amt", e.target.value)}
            />
          </Col>
        </Row>
      </Container>
    </Form>
  );
};

export default ExpenseHeader;
