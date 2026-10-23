import React from 'react'
import { Col, Form, Row} from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import TableComponent from "../../../../components/basic/table";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";

const PaymentAdviseBillTab = ({billHeadFormData,handleChange,formStatus,}) => {

  return (
    <Row>
        <Row>
            <Col sm={5} md={5} lg={2}>
            <TextField
            type="text"
            label="Vendor Code"
            value={billHeadFormData.v_code || ""}
            onChange={(e) => handleChange("v_code", e.target.value)}
            />
            </Col>
            <Col sm={7} md={7} lg={4}  className='mt-4'>
            <TextField
            type="text"
            value={billHeadFormData.v_name || ""}
            onChange={(e) => handleChange("v_name", e.target.value)}
            disabled
            />
            </Col>
            <Col sm={12} md={5} lg={2} className="" >
            <Select
            required
            label="Prepaid"
            name="paid_b4_due_date_yesno"
            placeholder={" "}
            value={billHeadFormData.paid_b4_due_date_yesno || ""}
            onChange={(e) => handleChange("paid_b4_due_date_yesno", e.target.value, rowIndex) }
         />
          </Col>
          <Col sm={12} md={7} lg={4} className="mt-4 mt-sm-1 mt-md-4">
                <RadioGroup
                 className="radio-button-wrapper  box-border"
                 options={[
                  //  { text: "Cash", value: "C" },
                   { text: "Bank", value: "B" },
                   { text: "Adjustment", value: "A" },
                 ]}
                 onChange={(e) => handleChange("rg_bank_cash", e.target.value)}
                 checked={billHeadFormData?.rg_bank_cash || "C"}
                 />
           </Col>
        </Row>
        <Row>
            <Col sm={12} md={6}  lg={3} className='mt-sm-3 mt-md-0 mt-lg-0'>
            <TextField
            type="text"
            label="Vendor Bank"
            value={billHeadFormData.vendor_bank || ""}
            onChange={(e) => handleChange("vendor_bank", e.target.value)}
            disabled
            />
            </Col>
            <Col sm={12} md={6} lg={6} className="d-flex justify-content-around">
            <Col sm={6} md={3} lg={3} className="button-group-wrapper mt-2   ">
            <Checkbox
              text="On Account"
              onChange={(e) => handleChange("on_acc", e.target.checked ? "Y" : "N" )}
              checked={billHeadFormData?.on_acc === "Y"}
            />
          </Col>
          <Col sm={6} md={3} lg={3} className="button-group-wrapper mt-2   ">
            <Checkbox
              text="Capital"
              onChange={(e) => handleChange("capital_flag", e.target.checked ? "Y" : "N" )}
              checked={billHeadFormData?.capital_flag === "Y"}
            />
          </Col>
          </Col>
          <Col  sm={12} md={6} lg={3} className='mt-sm-3 mt-md-0 mt-lg-0'>
            <TextField
            type="text"
            label="PO No"
            value={billHeadFormData.po_no || ""}
            onChange={(e) => handleChange("po_no", e.target.value)}
            disabled
            />
            </Col>
          
        </Row>

        <Row>
            <Col sm={12} md={6} lg={5}>
            <TextField
            type="text"
            label="Pay Adv No"
            value={billHeadFormData.pay_advno || ""}
            onChange={(e) => handleChange("pay_advno", e.target.value)}
            disabled
            />
            </Col>
            
          <Col sm={4} md={4} lg={2}>
            <TextField
            type="date"
            label="Pay Adv Date"
            value={billHeadFormData.pay_advdt || ""}
            onChange={(e) => handleChange("pay_advdt", e.target.value)}
            />
            </Col>
            <Col sm={8} md={12} lg={3} className='mt-1' >
            <Select
            required
            label="Section"
            name="paid_b4_due_date_yesno"
            placeholder={" "}
            value={billHeadFormData.section || ""}
            onChange={(e) => handleChange("section", e.target.value, rowIndex) }
         />
          </Col>
          
        </Row>

        <Row>
            <Col sm={4} md={2} lg={2}>
            <TextField
            type="text"
            label="Bank Name"
            value={billHeadFormData.bank_cd || ""}
            onChange={(e) => handleChange("bank_cd", e.target.value)}
            />
            </Col>
            <Col sm={8} md={4} lg={4} className='mt-4'>
            <TextField
            type="text"
            // label="Bank Name"
            value={billHeadFormData.bank_name || ""}
            onChange={(e) => handleChange("bank_name", e.target.value)}
            disabled
            />
            </Col>
            
          <Col sm={12} md={6} lg={4}>
            <TextField
            type="text"
            label="Voucher NO"
            value={billHeadFormData.vch_no || ""}
            onChange={(e) => handleChange("vch_no", e.target.value)}
            />
            </Col>
          
        </Row>

        <Row>
            <Col sm={12} md={6} lg={6}>
            <TextField
            type="text"
            label="Chq In Favour"
            value={billHeadFormData.chq_in_favour || ""}
            onChange={(e) => handleChange("chq_in_favour", e.target.value)}
            disabled
            />
            </Col>
            
          <Col sm={12} md={6} lg={6}>
            <TextField
            type="text"
            label="On Acc payment"
            value={billHeadFormData.on_acc_amt || ""}
            onChange={(e) => handleChange("on_acc_amt", e.target.value)}
            />
            </Col>
          
        </Row>

        <Row className="">
               <Col sm={12} md={12} lg={6} className="mt-1">
                 <RadioGroup
                   className="radio-button-wrapper  box-border"
                   options={[
                     { text: "Manual Cheque No", value: "N" },
                     { text: "Computerized Cheque", value: "Y" },
                     { text: "Bank Transfer File", value: "T" },
                   ]}
                   onChange={(e) => handleChange("computrized_chq", e.target.value)}
                   checked={billHeadFormData?.computrized_chq || "N"}
                 />
               </Col>

               <Col sm={12} md={12} lg={6} className="mt-1">
                 <RadioGroup
                   className="radio-button-wrapper  box-border"
                   options={[
                     { text: "NEFT", value: "N" },
                     { text: "RTGS", value: "R" },
                     { text: "FUNDS TRF", value: "I" },
                     { text: "DD", value: "D" },
                   ]}
                   onChange={(e) => handleChange("fund_trf_thru", e.target.value)}
                   checked={billHeadFormData?.fund_trf_thru || "N"}
                 />
               </Col>
        </Row>

         <Row className='mt-3 d-flex justify-content-between'>
            <Col sm={12} md={6} lg={3}>
            <TextField
            type="text"
            label="Chq No."
            value={billHeadFormData.chq_no || ""}
            onChange={(e) => handleChange("chq_no", e.target.value)}
            disabled
            />
            </Col>
            
          <Col sm={6} md={6} lg={2}>
            <TextField
            type="date"
            label="Chq Date"
            value={billHeadFormData.chq_dt || ""}
            onChange={(e) => handleChange("chq_dt", e.target.value)}
            />
            </Col>
            <Col sm={6} md={3} lg={2} className="button-group-wrapper mt-2   ">
            <Checkbox
              text="A/C Payee"
              onChange={(e) => handleChange("chq_acc_payee", e.target.checked ? "Y" : "N" )}
              checked={billHeadFormData?.chq_acc_payee === "Y"}
            />
          </Col>
          <Col sm={12} md={6} lg={3}>
            <TextField
            type="text"
            label="Cheque  Amount"
            value={billHeadFormData.chq_amt || ""}
            onChange={(e) => handleChange("chq_amt", e.target.value)}
            />
            </Col>
          
         </Row>

         <Row className='d-flex justify-content-between'>
        <Col  sm={6} md={6} lg={3}>
            <TextField
            type="text"
            label="Narration"
            value={billHeadFormData.narration || ""}
            onChange={(e) => handleChange("narration", e.target.value)}
            />
            </Col>
            <Col sm={6} md={6} lg={2}>
            <TextField
            type="date"
            label="UpTo Due Date"
            value={billHeadFormData.upto_due_date || ""}
            onChange={(e) => handleChange("upto_due_date", e.target.value)}
            />
            </Col>
            <Col sm={6} md={6}  lg={3}>
            <TextField
            type="text"
            label="Addition(Debit)"
            value={billHeadFormData.db_total || ""}
            onChange={(e) => handleChange("db_total", e.target.value)}
            disabled
            />
            </Col>
            <Col sm={6} md={6} lg={3}>
            <TextField
            type="text"
            label="Deduction(Credit)"
            value={billHeadFormData.cr_total || ""}
            onChange={(e) => handleChange("cr_total", e.target.value)}
            disabled
            />
            </Col>
         </Row>
        
         <Row>
            <Col sm={6} md={6} lg={3}>
            <TextField
            type="text"
            label="On Acc. Adj."
            value={billHeadFormData.on_acc_total || ""}
            onChange={(e) => handleChange("on_acc_total", e.target.value)}
            disabled
            />
            </Col>
            <Col sm={6} md={6} lg={3}>
            <TextField
            type="text"
            label="DB Note Adj."
            value={billHeadFormData.db_note_total || ""}
            onChange={(e) => handleChange("db_note_total", e.target.value)}
            disabled
            />
            </Col>
            <Col sm={5} md={6} lg={3}>
            <TextField
            type="text"
            label="CR Note Adj."
            value={billHeadFormData.cr_note_total || ""}
            onChange={(e) => handleChange("cr_note_total", e.target.value)}
            disabled
            />
            </Col>
             <Col sm={7} md={6} lg={3} className="mt-4 mt-sm-4 mt-md-4" style={{ color: "red" }}>
                      <h5>DI_CANCEL_STATUS</h5>
                    </Col>
         </Row>

      </Row>
  )
}

export default PaymentAdviseBillTab

