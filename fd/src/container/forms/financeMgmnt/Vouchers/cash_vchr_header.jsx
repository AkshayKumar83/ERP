import { Col, Form, Row, Container } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";
import RadioGroup from "../../../../components/basic/radioGroup";
import { useMemo, useState } from "react";


import ItcReference from "../../../../components/Modals/itcReference";
import HelpListV2 from "../../../../components/HelpList/v2";
import { DISABLED_OPTIONS, triggerFetchITCRefData } from "./cash_voucher_helper";


const CashHeader = ({
  formStatus,
  formData,
  handleChange,
  dataset,
  gstEntry,
  setGSTEntry,
  isPayRecDisabled,
}) => {

  const [itcModal, setItcModal] = useState(false);
  const [triggerItcData, setTriggerItcData] = useState(false);
  const [itcDataList, setITCDataList] = useState([]);
  const [helpListConfig, setHelpListConfig] = useState({
    open: false,
    title: "",
    headers: [], // label, key
    list: [],
    searchKeys: [],
  });


  const divisionOptions = useMemo(() => {
    if (dataset?.division && Array.isArray(dataset?.division)) {
      return [
        { value: "", label: "Select" },
        ...(dataset?.division?.map((item) => ({
          value: item.division_id,
          label: item.name,
        })) || []),
      ];
    }
    return [];
  }, [dataset]);


  const sectionOptions = useMemo(() => {
    if (dataset?.section && Array.isArray(dataset?.section)) {
      return [
        { value: "", label: "Select" },
        ...(dataset?.section?.map((item) => ({
          value: item.section_id,
          label: item.section_desc,
        })) || []),
      ];
    }
    return [];
  }, [dataset]);

  const itcRefData = useMemo(async () => {
    //console.log("Trigger:: ", triggerItcData);
    if (triggerItcData) {
      const response = await triggerFetchITCRefData();
      setITCDataList(response);
    }
    return [];
  }, [triggerItcData]);

  const handleHelpListClickItem = (item) => {
    if (helpListConfig?.forKey === "itc") {
      setGSTEntry({
        itc_ref: item.itc_sr_no,
        disp_party: item.v_name,
        bill_no: item.doc_no,
        bill_date: item.doc_date,
      });
    }
    setHelpListConfig({
      open: false,
    });
  };

  // Added: Logic for disabling fields based on formStatus
  return (
    <Form id="cash-head-form">
      <Container fluid>
        <Row className="d-flex ">
          <Col md={4}>
            <Select
              label="Division"
              name="division"
              value={formData.division || ""}
              onChange={(e) => handleChange("division", e.target.value)}
              options={divisionOptions}
              required
            />
          </Col>
          <Col md={2} className="mt-4">
            <RadioGroup
              className="button-group-wrapper box-border"
              id='pay_rec'
              options={[
                { text: "Payment", value: "0" },
                { text: "Receipt", value: "1" },
              ]}
              onChange={(e) => handleChange("type_user", e.target.value)}
              checked={formData.type_user}
              // onBlur={(e)=> {setIsPayrecDisable(true)}}
              disabled = {formStatus === 'Update' || isPayRecDisabled == true}
              name= 'type_user'
              required
              
            />
          </Col>
          <Col md={1} className="mt-4">
            <Checkbox
              text="On Acc"
              name='onAccount'
              checked={formData.onAccount || formData.onAccount === "N"}
              onChange={(e) => handleChange("onAccount", e.target.checked)}
              // required
            />
          </Col>
          <Col md={2}>
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

          <Col md={2}>
            <Select
              label="For query only"
              name="posted"
              value={formData.forQuery}
              onChange={(e) => handleChange("posted", e.target.value)}
              options={[
                // { value: "", label: "" },
                { value: "", label: "Both" },
                { value: "Y", label: "Authorized" },
                { value: "N", label: "Unauthorized" },
              ]}
            />
          </Col>
        </Row>
        <Row className="d-flex justify-content-between">
          <Col md={4}>
            <Select
              required
              label="Section"
              name="section"
              value={formData.section || ""}
              onChange={(e) => handleChange("section", e.target.value)}
              options={sectionOptions}
            />
          </Col>
          
          {/* <Col
            md={4}
            className="d-flex justify-content-center align-items-end pb-1"
          >
            <ButtonUi
              type="button"
              color="primary"
              onClick={() => {
                setTriggerItcData(true);
                setItcModal(true);
              }}
              outline
            >
              Create GST Entries with ITC
            </ButtonUi>
          </Col> */}
          
        </Row>
        <Row className="">
          <Col md={3}>
            <TextField
              type="text"
              label="Reference No."
              // onClick={() => fetchData("division")}
              value={formData.reference_no || gstEntry?.itc_ref || ""}
              onChange={(e) => handleChange("reference_no", e.target.value)}
              // disabled={formStatus === "Insert" || formStatus === "Query"}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
          <Col md={3}>
            <TextField
              required
              type="date"
              name="reference_dt"
              label="Reference Date"
              value={formData.reference_dt || ""}
              onChange={(e) => handleChange("reference_dt", e.target.value)}
            />
          </Col>
          <Col className="mt-2" xl={4}>
            <p
              className=""
              style={{
                border: "1px solid black",
                backgroundColor: formData.type_user === "1" ? "green" : "red",
                textAlign: "center",
                color: "white",
              }}
            >
              {formData.type_user === "1" ? "Receipt" : "Payment"}
            </p>
          </Col>
        </Row>
        <Row className="">
          <Col md={3}>
            <TextField
              type="text"
              label="Currency Code"
              value={formData.cur_code || ""}
              onChange={(e) => handleChange("cur_code", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              label="Exchange Rate"
              value={formData.exchange_rate || ""}
              onChange={(e) => handleChange("exchange_rate", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              label="Voucher No."
              value={formData.voucher_no || ""}
              onChange={(e) => handleChange("voucher_no", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
          <Col md={3}>
            <TextField
              type="date"
              label="Voucher Date"
              value={formData.voucher_dt || ""}
              onChange={(e) => handleChange("voucher_dt", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
        </Row>
        <Row>
          <Col md={5}>
            <TextField
              type="text"
              label="Reference"
              value={formData.ref || ""}
              onChange={(e) => handleChange("ref", e.target.value)}
            />
          </Col>
          {/* <Col md={3}>
            <TextField
              type="text"
              label="Inter Div. Funds"
              value={formData.div_funds || ""}
              onChange={(e) => handleChange("div_funds", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col> */}
          <Col md={4}>
            <p></p>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <TextField
              // required
              type="date"
              label="Bill Date"
              name="bill_dt"
              value={formData.bill_dt || ""}
              onChange={(e) => handleChange("bill_dt", e.target.value)}
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              name="trans_amt"
              label="Net Vch Amt."
              value={formData.trans_amt || ""}
              onChange={(e) => handleChange("trans_amt", e.target.value)}
              disabled
              className={`blue-disabled input-field`}
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              name="db_amt"
              label="Total Debt. Amt"
              value={formData.debt_amt || ""}
              onChange={(e) => handleChange("debt_amt", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
          <Col md={3}>
            <TextField
              type="text"
              name="cr_amt"
              label="Total Credit Amt"
              value={formData.crdt_amt || ""}
              onChange={(e) => handleChange("crdt_amt", e.target.value)}
              disabled={DISABLED_OPTIONS.includes(formStatus)}
            />
          </Col>
        </Row>
      </Container>

      <ItcReference
        isOpen={itcModal}
        onClose={() => setItcModal(false)}
        gstEntry={gstEntry}
        setGSTEntry={setGSTEntry}
        handleHelpClick={() => {
          setHelpListConfig({
            forKey: "itc",
            uniqKey: "gst-help-list",
            open: true,
            title: "GST Help list",
            headers: [
              { label: "Sr no.", key: "itc_sr_no" },
              { label: "Party Ref", key: "v_code" },
              { label: "Bill no", key: "doc_no" },
            ],
            list: itcDataList ? itcDataList : [],
            searchKeys: ["itc_sr_no", "v_code", "doc_no"],
          });
        }}
      />
      <HelpListV2
        {...helpListConfig}
        uniqKey={helpListConfig.uniqKey || "helpListV2"}
        open={helpListConfig.open}
        onClose={() => setHelpListConfig({})}
        onSelectItem={handleHelpListClickItem}
      />
    </Form>
  );
};

export default CashHeader;
