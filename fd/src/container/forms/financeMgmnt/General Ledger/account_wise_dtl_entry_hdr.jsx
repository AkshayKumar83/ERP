import { Col, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import {
  accHelpListHeader,
  fetchFormDataOnShow,
  fetchOpeningBalance,
  getFormattedCurrentDate,
  validateAccNo,
} from "./account_wise_dtl_entry_helper";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { checkDateFinYear, formatTwoDecimal } from "../../../../utils/fn";
import ButtonUi from "../../../../components/basic/button";

const AccWiseDtlEntryHdr = ({
  formData,
  formStatus,
  handleChange,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  user,
  setFormData = () => {},
  setDetailFormData = () => {},
  formControl,
  setFormControl = () => {},
}) => {
  // //console.log(user)
  const handleDoubleClick = (field, header) => {
    // Remove formStatus check since no operations are needed
    if (field === "item" && !formData?.wc_id) {
      toast.error("Please select  Store first");
      return;
    }
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
  };
  
  //  Prefill From Date and To Date with today's date
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // Format: yyyy-mm-dd
    if (!formData.from_date) {
      handleChange("from_date", today, null, null, {
        target: { selectionStart: 0 },
      });
    }
    if (!formData.to_date) {
      handleChange("to_date", today, null, null, {
        target: { selectionStart: 0 },
      });
    }
  }, []);

  

  const handleValidateDate = async (fieldName, value, e) => {
    const nextElement = e.relatedTarget;

    if (nextElement && ["show_btn"].includes(nextElement.id)) {
      return;
    }

    const trans_year = user?.global_fin_year;
    if (!value) {
      toast.error(
        `${
          fieldName === "from_date" ? "From Date" : "Till Date"
        } is blank, please enter ${
          fieldName === "from_date" ? "From Date" : "Till Date"
        }.`
      );
      e.target.focus();
      return;
    }

    const inputDate = new Date(value);
    const currentDate = new Date();

    inputDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (inputDate > currentDate) {
      toast.error(
        `${
          fieldName === "from_date" ? "From Date" : "Till Date"
        } cannot be higher than system Date.`
      );
      handleChange(fieldName, "", null, null, {
        target: { selectionStart: 0 },
      });
      e.target.focus();
      return;
    }

    const isValid = await checkDateFinYear({ date: value, trans_year });

    if (!isValid) {
      handleChange(fieldName, "", null, null, {
        target: { selectionStart: 0 },
      });
      e.target.focus();
      return;
    }

    // Swap logic
    const fromDate = formData.from_date ? new Date(formData.from_date) : null;
    const toDate = formData.to_date ? new Date(formData.to_date) : null;

    if (fromDate && toDate) {
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      if (fromDate > toDate) {
        // Swap dates
        setFormData((prev) => ({
          ...prev,
          from_date: toDate.toISOString().split("T")[0],
          to_date: fromDate.toISOString().split("T")[0],
        }));
        toast.success("From Date and To Date were swapped for correctness.");
      }
    }
  };

  return (
    <>
      <Row>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="Account Code"
            id="acc_no"
            name="acc_no"
            value={formData?.acc_no || ""}
            onChange={(e) => handleChange("acc_no", e.target.value)}
            onDoubleClick={() => handleDoubleClick("acc_no", accHelpListHeader)}
            onBlur={(e) =>
              validateAccNo(
                {
                  acc_no: e.target.value,
                  e,
                  trans_year: user?.global_fin_year,
                  division_id: user?.global_division_id,
                  setFormData,
                },
                setFormControl
              )
            }
          />
        </Col>
        <Col sm={7} md={8} lg={3} className="mt-4">
          <TextField
            type="text"
            name="acc_desc"
            value={formData?.acc_desc || ""}
            onChange={(e) => handleChange("acc_desc", e.target.value)}
            disabled
          />
        </Col>
        <Col sm={6} md={6} lg={3} className="mt-4">
          <RadioGroup
            className="radio-button-wrapper  box-border"
            options={[
              { text: "All Vouchers", value: "Y" },
              { text: "Posted Vouchers", value: "N" },
            ]}
            onChange={(e) => handleChange("rg_vch", e.target.value)}
            checked={formData?.rg_vch || "Y"}
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="Date"
            name="from_date"
            label="From Date"
            value={formData?.from_date || ""}
            onChange={(e) => handleChange("from_date", e.target.value)}
            onBlur={(e) => handleValidateDate("from_date", e.target.value, e)}
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="Date"
            label="Till Date"
            name="to_date"
            value={formData?.to_date || ""}
            onChange={(e) => handleChange("to_date", e.target.value)}
            onBlur={(e) => handleValidateDate("to_date", e.target.value, e)}
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={7} md={8} lg={2} className="mt-4">
          <div
            style={{
              backgroundColor: "#dddadaff",
              fontSize: "0.85rem",
              borderRadius: "6px",
              width: "100%",
              padding: "2px 6px",
              textAlign: "right",
              color: "#0d6efd",
            }}
          >
            {` Opening as on  ${getFormattedCurrentDate(formData?.from_date)} `}
            {/* {} */}
          </div>
        </Col>
        <Col sm={5} md={4} lg={3} className="mt-auto">
          <Row>
            <Col xl={9}>
              <TextField
                type="number"
                name="yr_op_bal"
                // value={formData?.yr_op_bal || ""}
                value={formatTwoDecimal(formData?.yr_op_bal)}
                onChange={(e) => handleChange("yr_op_bal", e.target.value)}
                disabled
                inpClass="text-primary"
              />
            </Col>
            <Col xl={3}>
              <TextField
                type="text"
                name="yr_db_cr"
                value={formData?.yr_db_cr || ""}
                onChange={(e) => handleChange("yr_db_cr", e.target.value)}
                disabled
                inpClass="text-primary"
              />
            </Col>
          </Row>
        </Col>
        <Col sm={5} md={4} lg={3} className="mt-auto">
          <Row>
            <Col xl={9}>
              <TextField
                type="number"
                label="Current Balance"
                name="curr_bal"
                // value={formData?.curr_bal || ""}
                value={formatTwoDecimal(formData?.curr_bal)}
                inpClass="text-primary"
                onChange={(e) => handleChange("curr_bal", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={3} className="mt-auto">
              <TextField
                type="text"
                name="curr_db_cr"
                value={formData?.curr_db_cr || ""}
                inpClass="text-primary"
                onChange={(e) => handleChange("curr_db_cr", e.target.value)}
                disabled
              />
            </Col>
          </Row>
        </Col>
        <Col lg={2} className="mt-auto">
          <ButtonUi
            id="show_btn"
            color="dark"
            onClick={(e) =>
              fetchFormDataOnShow({
                formData,
                formControl,
                user,
                setFormData,
                setDetailFormData,
              })
            }
          >
            Show
          </ButtonUi>
        </Col>
      </Row>
    </>
  );
};

export default AccWiseDtlEntryHdr;
