import { Row, Col, Form } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Select from "../../../../components/basic/select";
import {
  dbcrAccHelpListHeader,
  CurrencyHelpListHeader,
  BillHelpListHeader,
} from "./debit_credit_noteHelper";

const DebitCreditNoteHeader = ({
  formData = {},
  formStatus,
  handleChange,
  noteType = [],
  division = [],
  section = [],
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  validateRequiredField,
}) => {
  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
    }
  };

  return (
    <Form id="debit-credit-note-form">
      <div className="p-3 m-auto border rounded-3">

        {/* -------- Row 1 -------- */}
        <Row className="gy-2 align-items-end">
          <Col xl={2} lg={3} md={4}>
            <Select
              label="Note Type"
              value={formData.note_type || ""}
              onChange={(e) =>
                handleChange("formData", "note_type", e.target.value)
              }
              options={noteType}
              required
            />
          </Col>

          <Col xl={5} lg={4} md={5}>
            <Select
              label="Division"
              value={formData.division_id || ""}
              onChange={(e) =>
                handleChange("formData", "division_id", e.target.value)
              }
              options={division}
              required
            />
          </Col>

          <Col xl={3} lg={5} md={6}>
            <RadioGroup
              className="radio-button-wrapper box-border"
              options={[
                { text: "Credit Note", value: "RN" },
                { text: "Debit Note", value: "DN" },
              ]}
              onChange={(e) =>
                handleChange("formData", "trans_type", e.target.value)
              }
              checked={formData?.trans_type || "DN"}
              required
            />
          </Col>

          <Col xl={2} lg={3} md={3}>
            <Select
              label="For Query Only"
              value={formData.query_only || ""}
              onChange={(e) =>
                handleChange("formData", "query_only", e.target.value)
              }
              options={[
                { value: "", label: "" },
                { value: "Y", label: "Authorised" },
                { value: "N", label: "Unauthorised" },
                { value: "B", label: "Both" },
              ]}
              disabled={['Insert', 'Update'].includes(formStatus)}
            />
          </Col>
        </Row>

        {/* -------- Row 2 -------- */}
        <Row className="gy-2 mt-1">
          <Col xl={2} lg={3} md={4}>
            <Select
              label="Section"
              value={formData.section || ""}
              onChange={(e) =>
                handleChange("formData", "section", e.target.value)
              }
              options={section}
              required
            />
          </Col>

          <Col xl={2} lg={3} md={4}>
            <TextField
              label="Voucher No"
              value={formData.voucher_no || ""}
              disabled={["Query", "Insert", "Update"].includes(formStatus)}
              onChange={(e) =>
                handleChange("formData", "voucher_no", e.target.value)
              }
            />
          </Col>
           <Col  xl={2} lg={3} md={4}>
                <TextField
                  required
                  type="date"
                  label="Voucher Date"
                  value={formData.voucher_dt || ""}
                  onChange={(e) =>
                    handleChange("formData", "voucher_dt", e.target.value)
                  }
                />
              </Col>

          <Col xl={2} lg={3} md={4}>
            <TextField
              label="Currency Code"
              required
              value={formData.curr_code || ""}
              onChange={(e) =>
                handleChange("formData", "curr_code", e.target.value)
              }
              onDoubleClick={() =>
                handleDoubleClick("curr", CurrencyHelpListHeader)
              }
            />
          </Col>

          <Col xl={2} lg={3} md={4}>
            <TextField
              type="number"
              required
              label="Exchange Rate"
              style={{ textAlign: "right" }}
              value={formData.exchang_rt || ""}
              disabled = {formData?.curr_code === 'INR' || formData?.curr_code == ''}
              onChange={(e) =>
                handleChange("formData", "exchang_rt", e.target.value)
              }
            />
          </Col>

           <Col  xl={2} lg={3} md={4}>
                <TextField
                  label="Bill No."
                  value={formData.bill_no || ""}
                  onChange={(e) =>
                    handleChange("formData", "bill_no", e.target.value)
                  }
                  onDoubleClick={() =>
                    handleDoubleClick("bill", BillHelpListHeader)
                  }
                />
              </Col>
        </Row>

        {/* -------- Row 3 -------- */}
        <Row className="gy-2 mt-1">
          <Col xl={1} lg={3} md={4}>
            <TextField
              label="A/c Code"
              value={formData.dbcr_code || ""}
              onChange={(e) =>
                handleChange("formData", "dbcr_code", e.target.value)
              }
              onDoubleClick={() =>
                handleDoubleClick("dbcrAcc", dbcrAccHelpListHeader)
              }
              onBlur={(e) => validateRequiredField(e, "A/c Code")}
              required
            />
          </Col>

          <Col xl={4} lg={6} md={6}>
            <TextField
              label="A/c Description"
              value={formData.dbcr_name || ""}
              disabled
              onChange={(e) =>
                handleChange("formData", "dbcr_name", e.target.value)
              }
            />
          </Col>

          <Col xl={4} lg={6} md={6}>
            <TextField
              label="References"
              value={formData.reference || ""}
              maxLength={1000}
              onChange={(e) =>
                handleChange("formData", "reference", e.target.value)
              }
            />
          </Col>

          <Col xl={2} lg={3} md={3}>
            <TextField
              type="number"
              label="Total Amount"
              style={{ textAlign: "right" }}
              value={formData.trans_amt || ""}
              disabled
            />
          </Col>
          <Col md={1} className="  mt-auto ">
            {formData?.posted === "Y" ? (
              <p
                 className="mt-4 px-3 py-1"
                style={{
                  borderRadius: "6px",
                  fontSize: '10px',
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
                  fontSize: '10px',
                  backgroundColor: "yellow",
                  color: "red",
                  textAlign: "center",
                }}
              >
                Cancelled
              </p>
            ) : null}
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default DebitCreditNoteHeader;
