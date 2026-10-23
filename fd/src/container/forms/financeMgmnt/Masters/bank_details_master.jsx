import React, { useRef } from 'react'
import { Row, Col, Form } from "reactstrap"
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import { accHelpListHeader } from './bank_detail_helper'
import toast from 'react-hot-toast'

const BankDetailsMaster = ({
    formData = {},
    formStatus,
    handleChange,
    currency = [],
    setHelpFor,
    setHelpListHeader,
    handleHelpList = () => { },
    fetchValidateData
}) => {

    const handleDoubleClick = (field, header) => {
        if (['Insert', 'Update', 'Search'].includes(formStatus)) {
            setHelpFor(field); // Set the help type dynamically
            setHelpListHeader(header); // Set the appropriate header list
            handleHelpList(true); // Open the modal
        }
    };

    const validateRequiredField = (e, fieldLabel) => { 
     if (!['Insert','Update', 'Search'].includes(formStatus)) {
          return
     }
        
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`this ${fieldLabel} field is required`);
            e.preventDefault();
            e.target.focus();
            return false;
        }
        return true;
    };

    // Inside your component:
    const skipValidation = useRef(false);

    return (
        <React.Fragment>
            <Form id="bank-detail-form">
                <Row style={{ justifyContent: 'space-between' }}>
                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Account Number"
                            name="acc_no"
                            value={formData?.acc_no || ""}
                            onChange={(e) => handleChange("acc_no", e.target.value)}
                            required
                            onDoubleClick={() => {
                                skipValidation.current = true;
                                handleDoubleClick("acc", accHelpListHeader, "text", e);
                            }}
                            onBlur={async (e) => {
                                if (skipValidation.current) {
                                    skipValidation.current = false; // reset it
                                    return;
                                }

                                if (formStatus === "Insert" || formStatus === "Update") {
                                    const fieldValue = e.target.value;

                                    if (!fieldValue.trim()) {
                                        toast.error("Account Code is blank, must be entered.");
                                        return;
                                    }

                                    const result = await fetchValidateData("acc_no", fieldValue);
                                    if (!result.valid) { 
                                        e.target.focus()
                                        return;
                                    }
                                }
                            }} 
                            disabled = {formStatus === 'Update'}

                        />
                    </Col>

                    <Col xl={2} >
                        <TextField
                            type="text"
                            label="Transaction Type"
                            name="trans_type"
                            maxLength={2}
                            value={formData?.trans_type || ""}
                            onChange={(e) => handleChange("trans_type", e.target.value, "text", e)}
                            onBlur={(e) => validateRequiredField(e, "Transaction Type")}
                            required
                            disabled
                        />
                    </Col>
                </Row>
                <Row className='mt-1' style={{ justifyContent: 'space-between', border: '' }}>

                    <Col xl={7}>
                        <TextField
                            required
                            type="text"
                            label="Bank Name"
                            name="bank_name"
                            maxLength={60}
                            value={formData?.bank_name || ""}
                            onChange={(e) => handleChange("bank_name", e.target.value, "text", e)}
                            onBlur={(e) => validateRequiredField(e, "Bank Name")}
                            disabled
                        />
                    </Col>

                    <Col xl={4}>
                        <TextField
                            type="text"
                            label="Short Name"
                            name="bshort_name"
                            value={formData?.bshort_name || ""}
                            maxLength={10}
                            onChange={(e) => handleChange("bshort_name", e.target.value, "text", e)}
                            required
                        />
                    </Col>


                </Row>

                <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                    <Col xl={6}>
                        <TextField
                            type="text"
                            label="Address"
                            name="badd1"
                            value={formData?.badd1 || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("badd1", e.target.value, "text", e, e)}
                            onBlur={(e) => validateRequiredField(e, "Address")}
                            required
                        />
                    </Col>

                    <Col xl={6}>
                        <TextField
                            type="text"
                            label="IFSC Code"
                            name="ifsc_code"
                            value={formData?.ifsc_code || ""}
                            maxLength={20}
                            onChange={(e) => handleChange("ifsc_code", e.target.value, "text", e)}
                            onBlur={(e) => validateRequiredField(e, "IFSC Code")}
                            required
                        />
                    </Col>
                </Row>

                <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                    <Col xl={6} style={{ marginTop: '1.45rem' }}>
                        <TextField
                            type="text"
                            label=""
                            name="badd2"
                            maxLength={30}
                            value={formData?.badd2 || ""}
                            onChange={(e) => handleChange("badd2", e.target.value, "text", e)}

                        />
                    </Col>

                    <Col xl={6}>
                        <TextField
                            type="text"
                            label="MICR Code"
                            name="micr_code"
                            value={formData?.micr_code || ""}
                            maxLength={20}
                            onChange={(e) => handleChange("micr_code", e.target.value, "text", e)}
                            onBlur={(e) => validateRequiredField(e, "MICR Code")}
                            required
                        />
                    </Col>
                </Row>

                <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                    <Col xl={6} style={{ marginTop: '1.45rem' }}>
                        <TextField
                            type="text"
                            label=""
                            name="badd3"
                            maxLength={30}
                            value={formData?.badd3 || ""}
                            onChange={(e) => handleChange("badd3", e.target.value, "text", e)}

                        />
                    </Col>

                    <Col xl={6}>
                        <TextField
                            type="text"
                            label="Swift Code"
                            name="swift_no"
                            maxLength={50}
                            value={formData?.swift_no || ""}
                            onChange={(e) => handleChange("swift_no", e.target.value, "text", e)}

                        />
                    </Col>
                </Row>

                <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                    <Col xl={6} style={{}}>
                        <TextField
                            type="text"
                            label="Account Type"
                            name="acc_type"
                            maxLength={20}
                            value={formData?.acc_type || ""}
                            onChange={(e) => handleChange("acc_type", e.target.value, "text", e)}
                            onBlur={(e) => validateRequiredField(e, "Account Type")}
                            required
                        />
                    </Col>

                    <Col xl={6}>
                        <TextField
                            type="text"
                            label="Bank Account No."
                            name="bnk_ac_no"
                            maxLength={30}
                            value={formData?.bnk_ac_no || ""}
                            onChange={(e) => handleChange("bnk_ac_no", e.target.value, "text", e)}

                        />
                    </Col>
                </Row>


                <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                    <Col xl={5} style={{ marginTop: '0.2rem' }}>
                        <Select
                            type="text"
                            label="Currency"
                            name="curr_code"
                            value={formData?.curr_code || ""}
                            maxLength={3}
                            onChange={(e) => handleChange("curr_code", e.target.value, "text", e)}
                            onBlur={(e) => validateRequiredField(e, "Currency")}
                            required
                            options={currency}
                        />
                    </Col>

                    <Col xl={3}>
                        <TextField
                            type="number"
                            label="Credit Limit"
                            name="cr_limit"
                            value={formData?.cr_limit || ""}
                            onChange={(e) => handleChange("cr_limit", e.target.value, "number", e)}

                        />
                    </Col>
                </Row >

                <Row style={{ border: "", justifyContent: 'space-between' }}>

                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Report Name For Cheque Printing"
                            name="cheque_printing_report"
                            value={formData?.cheque_printing_report || ""}
                            maxLength={20}
                            onChange={(e) => handleChange("cheque_printing_report", e.target.value, "text", e)}

                        />
                    </Col>
                </Row>


            </Form>



        </React.Fragment>

    )
}

export default BankDetailsMaster;

