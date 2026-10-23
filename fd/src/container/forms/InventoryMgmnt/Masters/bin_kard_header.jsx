import { Col, Row } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import {
  fetchOpeningBalance,
  getFormattedCurrentDate,
  itemHelpListHeader,
  storeHelpListHeader,
} from "./bin_kard_helper";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { checkDateFinYear } from "../../../../utils/fn";



const BinKardHeader = ({
  formData,
  formStatus,
  handleChange,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  user,
  setFormData,
  setDetailFormData = () => {},
}) => {
  // console.log(user)
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
  const trans_year = user?.global_fin_year; // or wherever you store it
  if(!value)return
  const isValid = await checkDateFinYear({ date: value, trans_year });

  if (!isValid) {
    handleChange(fieldName, "", null, null, { target: { selectionStart: 0 } });
    e.target.focus();
  }
};


  return (
    <>
      <Row>
        <Col sm={6} md={6} lg={2} className="mt-4">
          <RadioGroup
            className="radio-button-wrapper  box-border"
            options={[
              { text: "OK", value: "O" },
              { text: "Rejection", value: "R" },
            ]}
            onChange={(e) => handleChange("ok_rej", e.target.value)}
            checked={formData?.ok_rej || "RB_OK"}
          />
        </Col>
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="Store"
            id="wc_no"
            name="wc_no"
            value={formData?.wc_no || ""}
            onChange={(e) => handleChange("wc_no", e.target.value)}
            onDoubleClick={() =>
              handleDoubleClick("store", storeHelpListHeader)
            }
            // onBlur={(e) => handleValidateField(e)}
          />
        </Col>
        <Col sm={7} md={8} lg={3} className="mt-4">
          <TextField
            type="text"
            name="wc_description"
            value={formData?.wc_description || ""}
            onChange={(e) => handleChange("wc_description", e.target.value)}
            disabled
          />
        </Col>
         <Col sm={5} md={4} lg={1}>
          <TextField
            type="text"
            label="Item"
            id="it_code"
            name="it_code"
            value={formData?.it_code || ""}
            onChange={(e) => handleChange("it_code", e.target.value)}
            onDoubleClick={() => handleDoubleClick("item", itemHelpListHeader)}
            // onBlur={(e) => handleValidateField(e)}
          />
        </Col>
        <Col sm={7} md={8} lg={3} className="mt-4">
          <TextField
            type="text"
            name="it_name"
            value={formData?.it_name || ""}
            onChange={(e) => handleChange("it_name", e.target.value)}
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-1">
        {/* <Col sm={5} md={4} lg={2}>
          <TextField
            type="text"
            label="Item"
            id="it_code"
            name="it_code"
            value={formData?.it_code || ""}
            onChange={(e) => handleChange("it_code", e.target.value)}
            onDoubleClick={() => handleDoubleClick("item", itemHelpListHeader)}
            // onBlur={(e) => handleValidateField(e)}
          />
        </Col>
        <Col sm={7} md={8} lg={5} className="mt-4">
          <TextField
            type="text"
            name="it_name"
            value={formData?.it_name || ""}
            onChange={(e) => handleChange("it_name", e.target.value)}
            disabled
          />
        </Col> */}
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
            label="To Date"
            name="to_date"
            value={formData?.to_date || ""}
            onChange={(e) => handleChange("to_date", e.target.value)}
            onBlur={(e) => handleValidateDate("to_date", e.target.value, e)}
          />
        </Col>
        <Col sm={5} md={4} lg={3}>
          <TextField
            type="text"
            label="It Size"
            name="iic_ref_no"
            value={formData?.iic_ref_no || ""}
            onChange={(e) => handleChange("iic_ref_no", e.target.value)}
            disabled
          />
        </Col>

        <Col sm={7} md={8} lg={2} className="mt-4">
          <TextField
            type="text"
            name="um_code"
            value={formData?.um_code || ""}
            onChange={(e) => handleChange("um_code", e.target.value)}
            disabled
          />
        </Col>
        <Col className="mt-3">
          <ButtonUi
            color="dark"
            onClick={() =>
              fetchOpeningBalance(
                {
                  formData,
                  user: user,
                  setDetailData: setDetailFormData,
                },
                setFormData
              )
            }
          >
            Show
          </ButtonUi>
        </Col>
      </Row>
      <Row className="mt-1">
        {/* <Col sm={5} md={4} lg={2}>
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
            label="To Date"
            name="to_date"
            value={formData?.to_date || ""}
            onChange={(e) => handleChange("to_date", e.target.value)}
            onBlur={(e) => handleValidateDate("to_date", e.target.value, e)}
          />
        </Col>
        <Col sm={5} md={4} lg={3}>
          <TextField
            type="text"
            label="It Size"
            name="iic_ref_no"
            value={formData?.iic_ref_no || ""}
            onChange={(e) => handleChange("iic_ref_no", e.target.value)}
            disabled
          />
        </Col> */}
      </Row>
      <Row className="mt-1">
        <Col sm={5} md={4} lg={2}>
          <TextField
            type="number"
            label="Year OP. Rate"
            name="rate"
            value={formData?.rate || ""}
            onChange={(e) => handleChange("rate", e.target.value)}
          />
        </Col>
        {/*  opening_date filled make by dynmic  */}
        <Col sm={7} md={8} lg={3} className="mt-4">
          <div
            style={{
              backgroundColor: "#d9d9d9",
              fontSize: "0.85rem",
              borderRadius: "6px",
              width: "100%",
              padding: "2px 6px",
            }}
          >
            Opening Balance as on {getFormattedCurrentDate(formData?.from_date)}
          </div>
        </Col>
        <Col sm={7} md={8} lg={2} className="mt-4">
          <TextField
            type="number"
            name="opening_balance"
            value={formData?.opening_balance || ""}
            onChange={(e) => handleChange("opening_balance", e.target.value)}
            disabled
          />
        </Col>
      </Row>
    </>
  );
};

export default BinKardHeader;
