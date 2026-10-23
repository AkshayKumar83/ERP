
import React, { useMemo, useState } from "react";
import { Form, Row, Col } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import TextField from "../../../../components/basic/textField"; 
import { bankHelpListHeader } from "./bank_voucher_helper";
import toast from "react-hot-toast";


const BankVoucherHeader = ({ 
  formData,
  handleChange,
  formStatus,
  divisions = [],
  setHelpFor,
  setHelpListHeader, 
  handleHelpList = () => {},
  dataset,
  isPayRecDisabled,
  setNarrationData,
  parameterData={parameterData}
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

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };  

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

  const bankOptions = useMemo(() => {
    if (dataset?.bankList && Array.isArray(dataset?.bankList)) {
      return [
        { value: "", label: "Select" },
        ...(dataset?.bankList?.map((item) => ({
          value: item.acc_no,
          label: item.bank_name,
        })) || []),
      ];
    }
    return [];
  }, [dataset]);

  const handleSelectBank = (accNo, e) => {
    const selectedBank = dataset?.bankList?.find(item => item.acc_no === accNo);
  
    // Update acct_type and trans_type
    handleChange("acct_type", accNo, e);
    handleChange("trans_type", selectedBank?.trans_type || "", e);
  };
  

    const copyCheckDetail = (e, field, value) => {
      if (!['Insert', 'Update', 'Search'].includes(formStatus)) {
        return;
      }

      if (field === 'chq_no' && !value) {
        toast.error(`Cheque Number is blank, must be entered`);
        e.target.focus();
        return;
      }

      setNarrationData(prev => {
        const newData = [...prev];
        newData[0] = {
          ...(newData[0] || {}),
          chq_no: formData?.chq_no,
          chq_dt: formData?.chq_dt,
        };
        return newData;
      });
    };


  return (
    <Form id="bank-head-form">
      <Row >
        <Col xl = {4}>
          <Select
            required
            label="Division"
            name="division_id"
            value={formData.division_id || ""}
            onChange={(e) => handleChange("division_id", e.target.value, e)}
            options={divisionOptions}
          />
        </Col>
        <Col xl = {2}>
          <RadioGroup
            className="radio-button-wrapper  box-border mt-4"
            options={[
              { text: "Payment", value: "0" },
              { text: "Receipt", value: "1" },
            ]}
            onChange={(e) => handleChange("pay_rec", e.target.value, e)}
            checked={formData?.pay_rec || "0"}
            disabled={isPayRecDisabled || formStatus == 'Update'}
          />
        </Col>
        <Col xl = {4}>
          <div className="button-group-wrapper box-border d-flex justify-content-evenly mt-4">
            <Checkbox
              text={"On Account"}
              name='on_acc'
              onChange={(e) => handleChange("on_acc", e.target.checked ? "Y" : "N", e)}
              checked={formData?.on_acc === "Y"}
            />
            <Checkbox
              text={"Memorandum"}
              name ='memo_vchr'
              onChange={(e) => handleChange("memo_vchr", e.target.checked ? "Y" : "N", e)}
              checked={formData?.memo_vchr === "Y"}
            />
            <Checkbox
              text={"Bank Transaction"}
              name = 'bank_trnf_flg'
              onChange={(e) => handleChange("bank_trnf_flg", e.target.checked ? "Y" : "N", e)}
              checked={formData?.bank_trnf_flg === "Y"}
            />
          </div>
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
      </Row>
      <Row className="mt-1 ">
        <Col sm={6} md={3} lg={2}>
          <Select
            required
            label="Section"
            name="section"
            value={formData.section || ""}
            onChange={(e) => handleChange("section", e.target.value, e)}
            options={sectionOptions}
          />
        </Col>   
        <Col sm={6} md={6} lg={1}>
          <TextField
            type="text"
            label="Curr Code"
            name = 'curr_code'
            value={formData.curr_code || ""}
            onChange={(e) => handleChange("curr_code", e.target.value, e)}
            disabled
          />
        </Col>
        <Col sm={6} md={6} lg={1}>
          <TextField
            type="number"
            label="Exch. Rate"
            name = 'exchang_rt'
            value={formData.exchang_rt || ""}
            onChange={(e) => handleChange("exchang_rt", e.target.value, e)}
            disabled
          />
        </Col>
        <Col sm={12} md={7} lg={5} className="mt-auto">
          <p style={{
            border: "1px solid black",
            backgroundColor: formData.pay_rec === "1" ? "green" : "red",
            textAlign: "center",
            color: "white",
          }} 
          > 
            
            {formData.pay_rec === "1" ? "Receipt" : "Payment"}
            </p>
        
        </Col>
        <Col sm={6} md={3} lg={2}>
          <Select
            label="For Query Only"
            name="posted"
            placeholder={""}
            value={formData?.posted || ""}
            disabled={formStatus =='Search'?false:true}
            onChange={(e) => handleChange("posted", e.target.value, e)}
            options={[
              { label: "", value: "" },
              { label: "Authorised", value: "Y" },
              { label: "Unauthorised", value: "N" },
              { label: "Both", value: "" },
            ]}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={6} lg={2}>
          <TextField
            type="text"
            label="Voucher No."
            name = 'voucher_no'
            value={formData.voucher_no || ""}
            onChange={(e) => handleChange("voucher_no", e.target.value, e)}
            disabled = {formStatus == 'Search'? false : true}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
            type="date"
            label="Voucher Date"
            name = 'voucher_dt'
            value={formData.voucher_dt || ""}
            onChange={(e) => handleChange("voucher_dt", e.target.value, e)}
            max={new Date().toISOString().split("T")[0]} // Restrict future dates
          />
        </Col>
        <Col sm={6} md={6} lg={2}>
          <TextField
            type="text"
            label="Dep. Slip No."
            name = 'dep_slip'
            value={formData.dep_slip || ""}
            onChange={(e) => handleChange("dep_slip", e.target.value, e)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="date"
            label="Deposit Date"
            name = 'dep_slip_dt'
            value={formData.dep_slip_dt || ""}
            onChange={(e) => handleChange("dep_slip_dt", e.target.value, e)}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Ref No."
            name = 'ref_no'
            value={formData.ref_no || ""}
            onChange={(e) => handleChange("ref_no", e.target.value, e)}
            disabled
          />
        </Col>
        <Col sm={6} md={6} lg={2}>
          <TextField
            type="date"
            label="Ref. date"
            name = 'ref_date'
            value={formData.ref_date || ""}
            onChange={(e) => handleChange("ref_date", e.target.value, e)}
            disabled
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={3} md={5} lg={4}>
          <Select
            required
            type="text"
            label="Bank"
            value={formData.acct_type || ""}
            name = 'acct_type'
            // onChange={(e) => handleChange("acct_type", e.target.value)}
            onChange={(e) => handleSelectBank(e.target.value, e)}
            // onBlur={(e)=> validate}
            options={bankOptions}
          />
        </Col>
        <Col sm={6} md={6} lg={2}>
          <TextField
            type="text"
            required={parameterData?.chq_print == 'N'? true:false}
            label="Cheque No"
            name = 'chq_no'
            value={formData.chq_no || ""}
            onChange={(e) => handleChange("chq_no", e.target.value, e)}
            onBlur={(e) => copyCheckDetail(e, "chq_no", e.target.value)}
          />
        </Col>
        <Col sm={3} md={4} lg={2}>
          <TextField
            type="date"
            label="Cheque date"
            name = 'chq_print'
            value={formData.chq_dt || ""}
            required={parameterData?.chq_print == 'N'? true:false}
            onChange={(e) => handleChange("chq_dt", e.target.value, e)}
             onBlur={(e) => copyCheckDetail(e, "chq_dt", e.target.value)}
          />
        </Col>
        <Col sm={4} md={4} lg={2}>
          <TextField
            type="text"
            label="PO No."
            name = 'po_no'
            value={formData.po_no || ""}
            onChange={(e) => handleChange("po_no", e.target.value, e)}
            disabled={formStatus !== "Query"}
          />
        </Col>
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="date"
            label="Bill date"
            name = 'bill_dt'
            value={formData.bill_dt || ""}
            onChange={(e) => handleChange("bill_dt", e.target.value, e)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={6} md={8} lg={3}>
          <TextField
            type="text"
            label="Reference"
            name = 'reference'
            value={formData.reference || ""}
            onChange={(e) => handleChange("reference", e.target.value, e)}
          />
        </Col>
        <Col sm={6} md={4} lg={2} >
          <TextField
            style={{ textAlign: "right" }}
            type="text"
            label="Voucher Amount"
            name = 'trans_amt'
            value={formData.trans_amt || ""}
            onChange={(e) => handleChange("trans_amt", e.target.value, e)}
            inpClass='bkg-yellow'
            disabled
          />
        </Col>
         <Col lg={7}>
          <div className="button-group-wrapper box-border d-flex justify-content-evenly mt-4">
            <Checkbox
              text="Electronic Clearing"
              name = 'ecs_flag'
              onChange={(e) => handleChange("ecs_flag", e.target.checked ? "Y" : "N", e)}
              checked={formData?.ecs_flag === "Y"}
            />
            <Checkbox
              text="Computerized Cheque"
              name = 'computrized_chq'
              onChange={(e) => handleChange("computrized_chq", e.target.checked ? "Y" : "N", e)}
              checked={formData?.computrized_chq === "Y"}
            />
            <Checkbox
              text="A/C Payee"
              name = 'chq_acc_payee'
              onChange={(e) => handleChange("chq_acc_payee", e.target.checked ? "Y" : "N", e)}
              checked={formData?.chq_acc_payee === "Y"}
            />
            <Checkbox
              text="Not To Exceed Amt"
              name = 'not_exceed_flag'
              onChange={(e) => handleChange("not_exceed_flag", e.target.checked ? "Y" : "N", e)}
              checked={formData?.not_exceed_flag === "Y"}
            />
            <Checkbox
              text="Capital"
              name = 'capital_flag'
              onChange={(e) => handleChange("capital_flag", e.target.checked ? "Y" : "N", e)}
              checked={formData?.capital_flag === "Y"}
            />
          </div>
        </Col>
      </Row>

      {/* <Row className="mt-1">
      </Row> */}
    </Form>
  );
};


export default BankVoucherHeader;
