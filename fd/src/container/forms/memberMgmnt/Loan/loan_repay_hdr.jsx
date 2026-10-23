import React, { useEffect, useState } from "react";
import {Card, Col, Container, Form, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import { ButtonToolbar } from "react-bootstrap";
import ButtonUi from "../../../../components/basic/button";
import { memberNoHelpListHeader, loanReferenceHelpListHeader } from "./loan_repay_helper";
import RadioGroup from "../../../../components/basic/radioGroup";

const LoanRepayHdr = ({ loanBalance, formStatus, formHdrData ={}, handleLoanDateChange,handleRepayAdjustFifo, handleChange, openHelpList, loanPurpose, loanList, bankList}) => {
  
  
 const handleKeyDown = (e) => {
    const cursorPosition = e.target.selectionStart;
    
    if (
      (e.key === "Backspace" && cursorPosition <= 2) ||  // No backspace before/inside "LR"
      (e.key === "Delete" && cursorPosition < 2)        // No delete before/inside "LR"
    ) {
      e.preventDefault();
    }
  };

    return (
  <Form id='loan-repay-hdr-form' className="loan-repay-hdr-form">
<div style={{ marginLeft: '20px' }}>
 <Row>
      <Col xl={12}> 
        <Row>
            <Col xl={2}>
                <TextField
                    required
                    type="date"
                    label="Repayment Date"
                    name="receipt_date"
                    value={formHdrData.receipt_date || ""}
                    onChange={(e) => handleChange(e, "receipt_date", e.target.value)}
                />
            </Col>
            <Col xl={3}>
                <TextField
                    type="text"
                    label="Repayment Control No."
                    value={formHdrData.receipt_number || ""}
                    onChange={(e) => handleChange(e, "receipt_number", e.target.value)}
                    disabled={['Insert','Update'].includes(formStatus)}
                />
            </Col>
            <Col xl={4}>
                <TextField
                    required
                    type="text"
                    label="Member Name"
                    value={formHdrData.party_name || ""}
                    onChange={(e) =>handleChange(e, "party_name",e.target.value)}
                     onDoubleClick={()=>openHelpList('party_name', memberNoHelpListHeader)}
                     disabled={formStatus === "Search"}
                />
            </Col>
            <Col l={3}>
             {/* <Select
                 required
                 type="text"
                 label="Loan Reference"
                 name="efa_id"
                 value={formHdrData.efa_id|| ""}
                 onChange={(e) =>handleChange(e, "efa_id", e.target.value)}
                 options={loanList}
             /> */}

             <Col l={3}>
                <TextField
                    required
                    type="text"
                    label="Loan Reference"
                    name="efa_ctrl_id"
                    value={formHdrData.efa_ctrl_id || ""}
                    onChange={(e) =>
                        handleChange(e, "efa_ctrl_id", e.target.value)
                    }
                    onDoubleClick={() =>
                        openHelpList("efa_ctrl_id", loanReferenceHelpListHeader)
                    }
                    disabled={formStatus === "Search"}
                />
            </Col>
         </Col>

        </Row>
      </Col>

</Row>
<Row>
    <Col md={6} className="mt-4">
                <RadioGroup
                  className="button-group-wrapper box-border"
                  name="Trans Type"
                  options={[
                    { text: "Bank", value: "BN" },
                    { text: "Credit Note", value: "CN" },
                    { text: "Advance Adjustment", value: "AA" },
                  ]}
                  onChange={(e) => handleChange(e, "trans_type", e.target.value)}
                  checked={formHdrData?.trans_type || "BN"}
                />
              </Col>
              <Col md={4} >
              <TextField
                    // required
                    type="text"
                    disabled
                    label="Loan Type"
                    name="loan_purpose"
                    value={formHdrData.loan_purpose || ""}
                     onChange={(e) => handleChange(e, "loan_purpose", e.target.value)}
                />
              </Col>
</Row>
<Row>
    <Col xl={5}> 
        <Row>
              <Col l={5}>
             <Select
                 required
                 type="text"
                 label="Bank Account"
                 name="bank_cd"
                 value={formHdrData.bank_cd || ""}
                 onChange={(e) =>handleChange(e, "bank_cd", e.target.value)}
                 options={bankList}
             />
         </Col>
      </Row>
    </Col> 
     <Col xl={6}>
          <Row>
          <Col xl={4}>
                <TextField
                    required
                    type="text"
                    label="Instrument Number"
                    name="instrument_no"
                    value={formHdrData.instrument_no || ""}
                    onChange={(e) =>handleChange(e, "instrument_no", e.target.value)}
                />
            </Col>
            <Col xl={4}>
                <TextField
                    required
                    type="date"
                    label="Instrument date"
                    name="instrument_date"
                    value={formHdrData.instrument_date || ""}
                    onChange={(e) =>handleChange(e, "instrument_date", e.target.value)}
                />
            </Col>
          </Row>
      </Col>
</Row>  
<Row>  
        <Col xl={6}>
                <TextField
                    type="text"
                    label="Remarks"
                    name="remarks"
                    value={formHdrData.remarks || ""}
                    onChange={(e) =>handleChange(e, "remarks", e.target.value)}
                />
         </Col>
            <Col xl={2}  style={{display:'flex', justifyContent:'center', alignItems:'end'}}>
                <div className="checkbox-container">
                    <Checkbox
                        // disabled
                        text="Pre Closed"
                        checked={formHdrData?.pre_close_efa =='Y'}
                        onChange={(e) => handleChange(e, "pre_close_efa", e.target.checked ? "Y" : "N")}
                    />
                </div>
            </Col>
            <Col xl={2}>
                <TextField
                    disabled
                    type="number"
                    label="Balance Amt"
                    name="balance_amount"
                    inpClass='bkg-yellow'
                    value={formHdrData?.balance_amount || ""}
                    onChange={(e) =>handleChange(e, "balance_amount", e.target.value)}
                />
            </Col>

 </Row>
 <Row>
        <Col xl={2}> 
                <TextField
                    type="number"
                    label="AMOUNT RECEIVED (Rs.)" 
                    value={formHdrData?.amount_recd ||''}
                    onChange={(e) =>handleChange(e, "amount_recd", e.target.value)}
                    maxLength={20}
                />
        </Col>
        <Col xl={3} style={{display:'flex', justifyContent:'center', alignItems:'end'}}> 
                    <ButtonUi
                        type="button"
                        color="primary"
                        outline={true}
                        // className="btn-sm mt-4"
                        onClick={handleRepayAdjustFifo}
                        disabled={formStatus != 'Insert'}
                    >
                        Adjust amount on FIFO basis
                    </ButtonUi>
        </Col>
        <Col xl={5} style={{display:'flex', justifyContent:'center', alignItems:'end'}}>
            {formHdrData?.pre_close_efa === 'Y' && (
                <p style={{
                border:'1px solid black',
                color: 'white',
                backgroundColor: 'red',
                padding: '0px 12px',
                borderRadius: '4px',
                fontWeight: 'bold',

                }}>
                 This EFA has been declared as Pre-Closed
                </p>
            )}
        </Col>
   </Row>   

  </div>
  </Form>
   );
};

export default LoanRepayHdr;




