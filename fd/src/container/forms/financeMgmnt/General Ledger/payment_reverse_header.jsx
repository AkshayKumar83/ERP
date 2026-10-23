import React from 'react'
import { Card, Col, Form, Row } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import {accHelpListHeader,chqNoHelpListHeader,handleValidateField,oldVchrNoHelpListHeader} from "./payment_reverse_helper"
import toast from 'react-hot-toast'

const PaymentReverseHeader = ({formData,setFormData=()=>{}, handleChange, formStatus,handleHelpList = () => {}, setHelpFor, setHelpListHeader}) => {
  
  // const handleDoubleClick = (field, header) => {
  //   if (formStatus) {
  //     setHelpFor(field); // Set the help type dynamically
  //     setHelpListHeader(header); // Set the appropriate header list
  //     handleHelpList(true); // Open the modal
  //   }
  // };

   const handleDoubleClick = (field, header) => {
  if (!formStatus) return;

  if (field === "AccNo") {
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
    return;
  }

   // For Insert: block ChqNo & OldVchrNo if acc_no not filled
  
  if (formStatus === "Insert") {
    if (field === "ChqNo") {
      if (!formData.acc_no || formData.acc_no.trim() === "") {
        toast.error("Please select Acc No first");
        return;
      }
    }

    if (field === "OldVchrNo") {
      if (!formData.chq_no || formData.chq_no.trim() === "") {
        toast.error("Please select Cheque No first");
        return;
      }
    }
  }

  if (["ChqNo", "OldVchrNo"].includes(field) && formStatus !== "Search") {
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
  }
};

   
  return (
    <Form id="payment-reverse-form">
    <Card className='ms-5 me-5 mt-2 position-relative border'>
            <span
              className="position-absolute bg-white px-2 fw-bold"
              style={{ top: "-10px", left: "12px", fontSize: "14px" }}
            >
             Payment Reversal
            </span>
   
    <Row  className='mt-4 ms-2'>
    <Col sm={10} md={6} lg={3} className="mt-sm-3 mt-md-3 mt-lg-1">
      <div className="text-wrapper">
        <span className="text-label">Cheque Type</span>
        <RadioGroup
          className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
          options={[
            { text: "Payment", value: "0" },
            { text: "Receive", value: "1" },
          ]}
          onChange={(e) => handleChange("pay_rec", e.target.value,e)}
          checked={formStatus === 'Insert'?(formData?.pay_rec || '0'):formData?.pay_rec}
        />
      </div>
    </Col>
    <Col sm={12} md={11} lg={5} className="mt-1">
      <RadioGroup
        className="radio-button-wrapper Transaction-height  box-border"
        options={[
          { text: "Cheque Cancellation", value: "C" },
          { text: "Stop payment", value: "S" },
          { text: "Bounced", value: "B" },
        ]}
        onChange={(e) => handleChange("type_reversal", e.target.value,e)}
        checked={formStatus === 'Insert'?(formData?.type_reversal || 'C'):formData?.type_reversal}
      />
    </Col>

  </Row>
  <Row className='mt-2 ms-2'>
  <Col sm={5} md={4} lg={2}>
              <TextField
              required
                type="text"
                label="Acc No"
                name ='acc_no'
                value={formData?.acc_no || " "}
                onChange={(e) => handleChange("acc_no", e.target.value,e)}
                 onDoubleClick={() => handleDoubleClick("AccNo", accHelpListHeader)}
                  // onBlur = {(e)=> handleValidateField(e,formStatus)}
              />
              
            </Col>
            <Col sm={5} md={4} lg={6}>
              <TextField
                type="text"
                label="Acc Desc"
                value={formData?.acc_desc || ""}
                onChange={(e) => handleChange("acc_desc", e.target.value,e)}
                disabled
              />
            </Col>
  </Row>
  <Row className='mt-2 ms-2'>
  <Col sm={5} md={4} lg={2}>
              <TextField
                type="text"
                label="Cheque No"
                name='chq_no'
                value={formData?.chq_no || ""}
                onChange={(e) => handleChange("chq_no", e.target.value,e)}
                onDoubleClick={() => handleDoubleClick("ChqNo", chqNoHelpListHeader)}
                // onBlur = {(e)=> handleValidateField(e,formStatus)}
                required
               
              />
            </Col>
            <Col sm={5} md={4} lg={2}>
              <TextField
                type="date"
                label="Chq_dt"
                value={formData?.chq_dt || ""}
                onChange={(e) => handleChange("chq_dt", e.target.value,e)}
                disabled
              />
            </Col>
      </Row>
      <Row className='mt-2 ms-2'>
      <Col sm={5} md={4} lg={2}>
              <TextField
                type="text"
                label="Old Voucher No"
                name='old_voucher_no'
                value={formData?.old_voucher_no || ""}
                onChange={(e) => handleChange("old_voucher_no", e.target.value,e)}
                onDoubleClick={() => handleDoubleClick("OldVchrNo", oldVchrNoHelpListHeader)}
                // onBlur={(e)=>validateParty(e, formData,formStatus,setFormData)}
                 onBlur={(e) => handleValidateField(e, formStatus, formData, setFormData)}
                required

              />
            </Col>
            <Col sm={5} md={4} lg={2}>
              <TextField
                type="text"
                label="Amount"
                value={formData?.chq_amt || ""}
                onChange={(e) => handleChange("chq_amt", e.target.value,e)}
                disabled
              />
            </Col>
  </Row>
  <Row className='mt-2 ms-2'>
  <Col sm={5} md={4} lg={2}>
              <TextField
                type="text"
                label="Party Code"
                value={formData?.party_code || ""}
                onChange={(e) => handleChange("party_code", e.target.value,e)}
                disabled

              />
            </Col>
            <Col sm={5} md={4} lg={6}>
              <TextField
                type="text"
                label="Party Desc."
                value={formData?.party_desc || ""}
                onChange={(e) => handleChange("party_desc", e.target.value,e)}
                disabled
              />
            </Col>
  </Row>
  <Row className='mt-2 ms-2 mb-3'>
  <Col sm={5} md={4} lg={2}>
              <TextField
                type="date"
                name='reverse_date'
                label="Reverse Date"
                value={formData?.reverse_date || ""}
                onChange={(e) => handleChange("reverse_date", e.target.value,e)}
                 onBlur = {(e)=> handleValidateField(e,formStatus)}
                required
              />
            </Col>
            <Col sm={5} md={4} lg={2}>
              <TextField
                type="text"
                label="Voucher No"
                value={formData?.voucher_no || ""}
                onChange={(e) => handleChange("voucher_no", e.target.value,e)}
                disabled
              />
            </Col>
  </Row>
  </Card>
  </Form>
  )
}

export default PaymentReverseHeader