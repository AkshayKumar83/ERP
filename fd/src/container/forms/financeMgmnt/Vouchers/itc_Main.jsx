import React, { useState } from 'react'
import { Row, Col, Form, Table, Card } from "reactstrap"
import TextField from "../../../../components/basic/textField"
import RadioGroup from "../../../../components/basic/radioGroup"
import ButtonUi from "../../../../components/basic/button"
import SimpleBar from "simplebar-react"
import Select from "../../../../components/basic/select"
import { mainTabHeaders, vendorHelpListHeader, invoiceHelpListHeader, poHelpListHeader } from './itc_helpers'
import RowAction from "../../../../components/common/rowAction"
import Checkbox from '../../../../components/basic/checkbox'
import toast from 'react-hot-toast'
import { validateForm } from '../../../../utils/fn'



const MainTab = ({ formData = {}, formStatus, handleChange, handleChangeTab, currency = [],
    setHelpFor,
    setHelpListHeader,
    handleHelpList = () => { },
    validateDateField,
    fetchValidateData,
    validateCurrField,
    setFormData,
    updateGstTotals,
    formDetailData,
    totals,
    handleDeleteItc,
    handleCancel,
    getValidateData,
    // navigateToVoucher,
}) => {

    //const totals = updateGstTotals(formData, formDetailData);

    const handleDoubleClick = (field, header) => {
        if (formStatus) {
            setHelpFor(field); // Set the help type dynamically
            setHelpListHeader(header); // Set the appropriate header list
            handleHelpList(true); // Open the modal
        }
    };

    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const makeFocusOnTableRow = (focusedRowIndex, id) => {
        const entry = formData.find((entry) => entry.id === id);
        setFocusedRowIndex(focusedRowIndex);
        // triggerFamilyDetail(id)
    };


    return (
        <React.Fragment>
            <Form id="itc-form">
                <Row>
                    <Col>
                        <RadioGroup
                            className="button-group-wrapper box-border justify-content-between"
                            options={[
                                { text: "Goods", value: "G" },
                                { text: "Services", value: "S" },

                            ]}
                            onChange={(e) => handleChange("formData", "register_type", e.target.value)}
                            checked={formData?.register_type}
                        />
                    </Col>
                    <Col>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "cash_receipt", e.target.checked ? "Y" : "N")}
                            text="Cash Receipt"
                            checked={formData?.cash_receipt === "Y"}
                        />
                    </Col>
                    <Col>
                        <RadioGroup
                            className="button-group-wrapper box-border justify-content-between"
                            options={[
                                { text: "Vendor", value: "V" },
                                { text: "Customer", value: "C" },

                            ]}
                            onChange={(e) => handleChange("formData", "v_type", e.target.value)}
                            checked={formData?.v_type}
                            disabled={formStatus === "Update"}
                        />
                    </Col>
                    <Col>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "whether_ge_yesno", e.target.checked ? "Y" : "N")}
                            text=" With Gate Entry"
                            checked={formData?.whether_ge_yesno === "Y"}
                        />
                    </Col>
                </Row>
                <Row className='mt-1'>
                    <Col>
                        <TextField
                            type="date"
                            label="Credit Date"
                            name="credit_availed_date"
                            value={formData?.credit_availed_date || ""}
                            onChange={(e) => handleChange("formData", "credit_availed_date", e.target.value)}
                            required
                            onBlur={() => {
                                if (formStatus === "Insert" || formStatus === "Update") {
                                    validateDateField();

                                }
                            }}
                            disabled={formStatus === "Update"}
                        />
                    </Col>
                    <Col className='mt-4'>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "isd_yesno", e.target.checked ? "Y" : "N")}
                            text="ISD"
                            checked={formData?.isd_yesno === "Y"}
                        />
                    </Col>

                    <Col className='mt-4'>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "rc_applicable", e.target.checked ? "Y" : "N")}
                            text="Reverse Charge Applicable"
                            checked={formData?.rc_applicable === "Y"}
                        />
                    </Col>

                    <Col className='mt-4'>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "transport", e.target.checked ? "Y" : "N")}
                            text="GTA/Transport"
                            checked={formData?.transport === "Y"}
                        />
                    </Col>
                     <Col className='mt-4'>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "whether_itc_eligible", e.target.checked ? "Y" : "N")}
                            text="ITC Eligible"
                            checked={formData?.whether_itc_eligible === "Y"}
                        />
                    </Col>

                </Row>
                <Row className='d-flex justify-content-between mt-1'>
                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Party"
                            name="v_code"
                            value={formData?.v_code || ""}
                            onChange={(e) => handleChange("formData", "v_code", e.target.value)}
                            onDoubleClick={() => handleDoubleClick("vendor", vendorHelpListHeader)}
                            onBlur={(e) => {
                                if (formStatus === "Insert" || formStatus === "Update") {
                                    fetchValidateData("v_code", e.target.value);
                                }
                            }}
                            required
                        />
                    </Col>
                    <Col xl={5} className='mt-4'>

                        <TextField
                            type="text"
                            name="v_name"
                            value={formData?.v_name || ""}
                            disabled
                            onChange={(e) => handleChange("formData", "v_name", e.target.value)}
                        />

                    </Col>
                
                     {/* <Col xl={2} className='mt-4' style={{ color: "red" }}>
                           <ButtonUi color="danger" onClick={()=>{navigateToVoucher('S')}} >
                            navigate to Voucher
                           </ButtonUi>
                    </Col> */}

                    <Col xl={2} className='mt-4' style={{ color: "red" }}>
                        <p style={{
                            textAlign: "center",
                            color: "red",
                            fontWeight: 'Bold',
                            fontSize: '18px'

                        }}
                        >
                            {formData.cAuth === "Y" ? "AUTHORISED" : ''}
                        </p>
                    </Col>
                </Row>

                <Row className='mt-1'>
                    <Col>
                        <TextField
                            label="GST No"
                            type="text"
                            name="gst_no"
                            value={formData?.gst_no || ""}
                            disabled
                            onChange={(e) => handleChange("formData", "gst_no", e.target.value)}
                        />
                    </Col>
                    <Col className='mt-4'>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "gst_registered", e.target.checked ? "Y" : "N")}
                            text="Gst Registered"
                            checked={formData?.gst_registered === "Y"}
                            disabled
                        />
                    </Col>
                    <Col>
                        <TextField
                            label="Invoice No"
                            type="text"
                            maxLength={20}
                            name="doc_no"
                            value={formData?.doc_no || ""}
                            onChange={(e) => handleChange("formData", "doc_no", e.target.value)}
                            onDoubleClick={() => handleDoubleClick("invoice", invoiceHelpListHeader)}
                            onBlur={(e) => {
                                if (formStatus === "Insert" || formStatus === "Update") {
                                    if (formData.register_type === "G" && formData.whether_ge_yesno === "Y") {
                                        fetchValidateData("doc_no", e.target.value);
                                    }
                                    //validateDateField();  
                                }
                            }}
                            disabled={formStatus === "Update"}
                            required
                        />
                    </Col>
                    <Col className=''>
                        <TextField
                            label="Invoice Date"
                            type="date"
                            name="doc_date"
                            value={formData?.doc_date || ""}
                            //disabled
                            onChange={(e) => handleChange("formData", "doc_date", e.target.value)}
                            required
                            disabled={formData.whether_ge_yesno === "Y"}
                        />
                    </Col>
                </Row>

                <Row className='mt-1 d-flex justify-content-between'>
                    <Col xl={3}>
                        <TextField
                            label={formData.register_type === "S" ? "Work Order No." : "G.E No."}
                            type="text"
                            name="ge_no"
                            value={formData?.ge_no || ""}
                            disabled={formData.register_type !== "S"}
                            onChange={(e) => handleChange("formData", "ge_no", e.target.value)}
                            onDoubleClick={() => handleDoubleClick("pono", poHelpListHeader)}
                            maxLength={100}
                            onBlur={(e) => {
                                if (formStatus === "Insert" || formStatus === "Update") {
                                    fetchValidateData("ge_no", e.target.value);

                                }
                            }}
                        />
                    </Col>
                    <Col xl={3} className=''>
                        <TextField
                            label={formData.register_type === "S" ? "Work Order Date" : "G.E Date"}
                            type="date"
                            name="ge_date"
                            value={formData?.ge_date || ""}
                            disabled
                            onChange={(e) => handleChange("formData", "ge_date", e.target.value)}
                        />
                    </Col>

                    <Col xl={3}>
                        <TextField
                            label="Reverse Charge Invoice No"
                            type="text"
                            name="rc_inv_no"
                            value={formData?.rc_inv_no || ""}
                            disabled
                            onChange={(e) => handleChange("formData", "rc_inv_no", e.target.value)}
                        />
                    </Col>
                </Row>

                <Row className='mt-1 d-flex justify-content-between'>
                    <Col xl={3} className=''>
                        <Select
                            label="Currency"
                            type="text"
                            name="curr_cd"
                            value={formData?.curr_cd || ""}
                            options={currency}
                            //  onChange={(e) => handleChange("formData", "curr_cd", e.target.value)}
                            onChange={(e) => {
                                const selectedCurrency = e.target.value;
                                handleChange("formData", "curr_cd", selectedCurrency);

                                if (selectedCurrency === "INR" && formData.curr_cd !== "INR") {
                                    handleChange("formData", "curr_conv", "1.00");
                                }

                                else {
                                    handleChange("formData", "curr_conv", "");
                                }

                            }}

                            disabled={formStatus === "Update"}
                        />
                    </Col>
                    <Col xl={3}>
                        <TextField
                            label="Currency Conv"
                            type="number"
                            name="curr_conv"
                            value={formData?.curr_conv || ""}
                            // value={
                            //     formData.curr_conv !== undefined && formData.curr_conv !== null
                            //         ? Number(formData.curr_conv).toFixed(2)
                            //         : ""
                            // }

                            onChange={(e) => handleChange("formData", "curr_conv", e.target.value)}
                            onBlur={(e) => {
                                if (formStatus === "Insert" || formStatus === "Update") {

                                    const val = formData?.curr_conv;

                                    const isNumericField =
                                        !isNaN(val) && val !== "";
                                    const parsedValue = isNumericField
                                        ? parseFloat(val)
                                        : val;
                                    //console.log(parsedValue);

                                    handleChange(
                                        "formData",
                                        "curr_conv",
                                        parsedValue?.toFixed(2),

                                    );

                                    const isValid = validateCurrField()
                                    if (!isValid) {
                                        toast.error("Currency conversion rate cannot be 1 for foreign currency");
                                        e.target.focus()
                                        return
                                    }
                                }
                            }}

                            disabled={formData?.curr_cd === 'INR'}
                        />
                    </Col>
                    <Col xl={3}>
                        <TextField
                            label="Voucher No"
                            type="text"
                            name="j_vch_no"
                            value={formData?.j_vch_no || ""}
                            disabled
                            onChange={(e) => handleChange("formData", "j_vch_no", e.target.value)}
                        />
                    </Col>
                </Row>
                <Row className='mt-1 d-flex justify-content-between'>
                    <Col xl={3}>
                        <TextField
                            label="Eway Bill No"
                            type="text"
                            name="eway_bill_no"
                            maxLength={50}
                            value={formData?.eway_bill_no || ""}
                            onChange={(e) => handleChange("formData", "eway_bill_no", e.target.value)}
                        />
                    </Col>

                    <Col xl={3}>
                        <TextField
                            label="Eway Bill Date"
                            type="date"
                            name="eway_bill_date"
                            value={formData?.eway_bill_date || ""}
                            onChange={(e) => handleChange("formData", "eway_bill_date", e.target.value)}
                        />
                    </Col>

                    <Col xl={3} className=''>
                        <TextField
                            label="ITC No."
                            type="text"
                            name="itc_sr_no"
                            value={formData?.itc_sr_no || ""}
                            maxLength={20}
                            disabled={formStatus === "Insert" || formStatus === "Update" || formStatus === "Query"}
                            onChange={(e) => handleChange("formData", "itc_sr_no", e.target.value)}
                        />
                        {/* <span className='mt-4 ms-3'>For</span>
                        <span className='ms-3' style={{ color: 'red', marginTop: '23px' }}> COMP_GST_NO</span> */}
                    </Col>

                    {/* <Col className='mt-2'>
                    <span style={{ color: 'red' }}> COMP_GST_NO</span>
                </Col> */}


                </Row>
                <Row className='d-flex justify-content-between mt-2'>
                    <Col xl={2}>
                        <TextField
                            label="Bill Of Entry No"
                            type="text"
                            name="bill_of_entry_no"
                            maxLength={50}
                            value={formData?.bill_of_entry_no || ""}
                            onChange={(e) => handleChange("formData", "bill_of_entry_no", e.target.value)}
                        />
                    </Col>
                    <Col xl={2}>
                        <TextField
                            label="Bill Of Entry Date"
                            type="date"
                            name="bill_of_entry_dt"
                            value={formData?.bill_of_entry_dt || ""}
                            onChange={(e) => handleChange("formData", "bill_of_entry_dt", e.target.value)}
                        />
                    </Col>
                    <Col xl={2}>
                        <TextField
                            label="Port Code"
                            type="text"
                            name="port_code"
                            maxLength={10}
                            value={formData?.port_code || ""}
                            onChange={(e) => handleChange("formData", "port_code", e.target.value)}
                        />
                    </Col>
                    <Col className='mt-4' xl={2}>
                        <Checkbox
                            onChange={(e) => handleChange("formData", "round_gst_flag_header", e.target.checked ? "Y" : "N")}
                            text="ROUND GST"
                            checked={formData?.round_gst_flag_header === "Y"}
                        />
                    </Col>
                    <Col xl={2}>
                        <ButtonUi color="secondary" className='mt-4' onClick={() => {
                            if (formStatus === "Query") {
                                handleDeleteItc();
                                handleCancel();
                            }
                        }}>
                            Delete ITC
                        </ButtonUi>
                    </Col>

                    <Col xl={2} className='mt-4'>
                        {/* <Row className="d-flex justify-content-center"> */}
                        {/* <Col xs="auto"> */}
                        <ButtonUi color="secondary" className='mt-1'
                            onClick={async (e) => {
                                const isValid = validateCurrField();
                                if (!isValid) {
                                    toast.error("Invalid currency conversion");
                                    return;
                                }

                                if(formStatus == 'Query'){
                                     handleChangeTab("Items")
                                     return
                                }

                                const isValidFormData = validateForm("itc-form");
                                if (!isValidFormData) {
                                  return;
                                }

                                const isValid1 = await getValidateData()
                                if (!isValid1) {
                                   // toast.error("Party already exists with same invoice no and invoice date");
                                    e.target.focus();
                                    return;
                                }

                                handleChangeTab("Items");
                            }}
                        >
                            Items
                        </ButtonUi>
                        {/* </Col> */}
                        {/* </Row> */}
                    </Col>
                </Row>

                {/* <Card className="mt-5 p-1 shadow-sm"> */}
                <>
                    <div className="table-title">

                    </div>
                    <div className="table-wrapper-v3">
                        <SimpleBar forceVisible="y" autoHide={false}>
                            <div className="table-sticky-wrapper">
                                <Table hover>
                                    <thead>
                                        <tr>

                                            {mainTabHeaders.map((header, index) => (
                                                <th
                                                    key={index}
                                                    // formData-required={header.required || false}
                                                    style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                                >
                                                    {header.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* { formData?.map((formData, focusedRowIndex) => ( */}
                                        <React.Fragment key={`row-${focusedRowIndex}`}>
                                            {/* First Row */}
                                            <tr>

                                                <td>
                                                    <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>IGST</span>
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`igst_tot_value_${focusedRowIndex}_1`}
                                                        // value={formData.igst_tot_value || ""} 
                                                        //value={formData.igst_tot_value === 0 ? "0.00" : formData.igst_tot_value || ""} 
                                                        // value={
                                                        //     typeof formData.igst_tot_value === "number"
                                                        //         ? formData.igst_tot_value.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.igst_tot_value}
                                                        onChange={(e) => handleChange("formData", "igst_tot_value", e.target.value, focusedRowIndex, 1)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`igst_tot_cess_val_${focusedRowIndex}_1`}
                                                        //value={formData.igst_tot_cess_val === 0 ? "0.00": formData.igst_tot_cess_val || ""}
                                                        // value={
                                                        //     typeof formData.igst_tot_cess_val === "number"
                                                        //         ? formData.igst_tot_cess_val.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.igst_tot_cess_val}
                                                        onChange={(e) => handleChange("formData", "igst_tot_cess_val", e.target.value, focusedRowIndex, 1)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`igst_tot_val_cr_allowable_${focusedRowIndex}_1`}
                                                        //value={formData.igst_tot_val_cr_allowable === 0 ? "0.00" : formData.igst_tot_val_cr_allowable || ""}
                                                        // value={
                                                        //     typeof formData.igst_tot_val_cr_allowable === "number"
                                                        //         ? formData.igst_tot_val_cr_allowable.toFixed(2)
                                                        //         : ""
                                                        // }
                                                        value={totals.igst_tot_val_cr_allowable}
                                                        onChange={(e) => handleChange("formData", "igst_tot_val_cr_allowable", e.target.value, focusedRowIndex, 1)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`igst_tot_cess_val_cr_allowable_${focusedRowIndex}_1`}
                                                        //value={formData.igst_tot_cess_val_cr_allowable === 0 ? "0.00" : formData.igst_tot_cess_val_cr_allowable || ""}
                                                        // value={
                                                        //     typeof formData.igst_tot_cess_val_cr_allowable === "number"
                                                        //         ? formData.igst_tot_cess_val_cr_allowable.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.igst_tot_cess_val_cr_allowable}
                                                        onChange={(e) => handleChange("formData", "igst_tot_cess_val_cr_allowable", e.target.value, focusedRowIndex, 1)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`igst_tot_val_cr_availed_${focusedRowIndex}_1`}
                                                        //value={formData.igst_tot_val_cr_availed === 0 ? "0.00" : formData.igst_tot_val_cr_availed || ""}
                                                        // value={
                                                        //     typeof formData.igst_tot_val_cr_availed === "number"
                                                        //         ? formData.igst_tot_val_cr_availed.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.igst_tot_val_cr_availed}
                                                        onChange={(e) => handleChange("formData", "igst_tot_val_cr_availed", e.target.value, focusedRowIndex, 1)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`igst_tot_cess_val_cr_availed_${focusedRowIndex}_1`}
                                                        //value={formData.igst_tot_cess_val_cr_availed === 0 ? "0.00" : formData.igst_tot_cess_val_cr_availed|| ""}
                                                        // value={
                                                        //     typeof formData.igst_tot_cess_val_cr_availed === "number"
                                                        //         ? formData.igst_tot_cess_val_cr_availed.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.igst_tot_cess_val_cr_availed}
                                                        onChange={(e) => handleChange("formData", "igst_tot_cess_val_cr_availed", e.target.value, focusedRowIndex, 1)}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>

                                            {/* Second Row (Duplicate of First Row) */}
                                            <tr>

                                                <td>
                                                    <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '21px' }}>SGST/UGST</span>
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`sgst_tot_value_${focusedRowIndex}_2`}
                                                        //value={formData.sgst_tot_value  === 0 ? "0.00" : formData.sgst_tot_value || ""}
                                                        // value={
                                                        //     typeof formData.sgst_tot_value === "number"
                                                        //         ? formData.sgst_tot_value.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_value}
                                                        onChange={(e) => handleChange("formData", "sgst_tot_value", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`sgst_tot_cess_val_${focusedRowIndex}_2`}
                                                        //value={formData.sgst_tot_cess_val === 0? "0.00" : formData.sgst_tot_cess_val || ""}
                                                        // value={
                                                        //     typeof formData.sgst_tot_cess_val === "number"
                                                        //         ? formData.sgst_tot_cess_val.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_cess_val}
                                                        onChange={(e) => handleChange("formData", "sgst_tot_cess_val", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`sgst_tot_val_cr_allowable_${focusedRowIndex}_2`}
                                                        //value={formData.sgst_tot_val_cr_allowable === 0 ? "0.00" : formData.sgst_tot_val_cr_allowable  || ""}
                                                        // value={
                                                        //     typeof formData.sgst_tot_val_cr_allowable === "number"
                                                        //         ? formData.sgst_tot_val_cr_allowable.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_val_cr_allowable}
                                                        onChange={(e) => handleChange("sgst_tot_val_cr_allowable", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`sgst_tot_cess_val_cr_allowable_${focusedRowIndex}_2`}
                                                        // value={formData.sgst_tot_cess_val_cr_allowable === 0 ? "0.00" :  formData.sgst_tot_cess_val_cr_allowable || ""}
                                                        // value={
                                                        //     typeof formData.sgst_tot_cess_val_cr_allowable === "number"
                                                        //         ? formData.sgst_tot_cess_val_cr_allowable.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_cess_val_cr_allowable}
                                                        onChange={(e) => handleChange("formData", "sgst_tot_cess_val_cr_allowable", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`sgst_tot_val_cr_availed_${focusedRowIndex}_2`}
                                                        //value={formData.sgst_tot_val_cr_availed === 0 ? "0.00" : formData.sgst_tot_val_cr_availed  || ""}
                                                        // value={
                                                        //     typeof formData.sgst_tot_val_cr_availed === "number"
                                                        //         ? formData.sgst_tot_val_cr_availed.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_val_cr_availed}
                                                        onChange={(e) => handleChange("formData", "sgst_tot_val_cr_availed", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`sgst_tot_cess_val_cr_availed_${focusedRowIndex}_2`}
                                                        //value={formData.sgst_tot_cess_val_cr_availed === 0 ? "0.00": formData.sgst_tot_cess_val_cr_availed || ""}
                                                        // value={
                                                        //     typeof formData.sgst_tot_cess_val_cr_availed === "number"
                                                        //         ? formData.sgst_tot_cess_val_cr_availed.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_cess_val_cr_availed}
                                                        onChange={(e) => handleChange("formData", "sgst_tot_cess_val_cr_availed", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>

                                            {/* Third Row (Duplicate of First Row) */}
                                            <tr>

                                                <td>
                                                    <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>CGST</span>
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`cgst_tot_value_${focusedRowIndex}_3`}
                                                        //value={formData.cgst_tot_value === 0 ? "0.00" :  formData.cgst_tot_value|| ""}
                                                        // value={
                                                        //     typeof formData.cgst_tot_value === "number"
                                                        //         ? formData.cgst_tot_value.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.cgst_tot_value}
                                                        onChange={(e) => handleChange("formData", "cgst_tot_value", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`cgst_tot_cess_val_${focusedRowIndex}_3`}
                                                        //value={formData.cgst_tot_cess_val === 0 ? "0.00" : formData.cgst_tot_cess_val || ""}
                                                        // value={
                                                        //     typeof formData.cgst_tot_cess_val === "number"
                                                        //         ? formData.cgst_tot_cess_val.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.cgst_tot_cess_val}
                                                        onChange={(e) => handleChange("formData", "cgst_tot_cess_val", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`cgst_tot_val_cr_allowable_${focusedRowIndex}_3`}
                                                        // value={formData.cgst_tot_val_cr_allowable === 0 ? "0.00" : formData.cgst_tot_val_cr_allowable || ""}
                                                        // value={
                                                        //     typeof formData.cgst_tot_val_cr_allowable === "number"
                                                        //         ? formData.cgst_tot_val_cr_allowable.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.cgst_tot_val_cr_allowable}
                                                        onChange={(e) => handleChange("formData", "cgst_tot_val_cr_allowable", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`cgst_tot_cess_val_cr_allowable_${focusedRowIndex}_3`}
                                                        //value={formData.cgst_tot_cess_val_cr_allowable === 0 ? "0.00" : formData.cgst_tot_cess_val_cr_allowable || ""}
                                                        // value={
                                                        //     typeof formData.cgst_tot_cess_val_cr_allowable === "number"
                                                        //         ? formData.cgst_tot_cess_val_cr_allowable.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_cess_val_cr_allowable}
                                                        onChange={(e) => handleChange("formData", "cgst_tot_cess_val_cr_allowable", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`cgst_tot_val_cr_availed_${focusedRowIndex}_2`}
                                                        //value={formData.cgst_tot_val_cr_availed === 0 ? "0.00"  : formData.cgst_tot_val_cr_availed || ""}
                                                        // value={
                                                        //     typeof formData.cgst_tot_val_cr_availed === "number"
                                                        //         ? formData.cgst_tot_val_cr_availed.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.cgst_tot_val_cr_availed}
                                                        onChange={(e) => handleChange("formData", "cgst_tot_val_cr_availed", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <TextField
                                                        type="number"
                                                        name={`cgst_tot_cess_val_cr_availed_${focusedRowIndex}_2`}
                                                        //value={formData.cgst_tot_cess_val_cr_availed === 0 ? "0.00" : formData.cgst_tot_cess_val_cr_availed || ""}
                                                        // value={
                                                        //     typeof formData.cgst_tot_cess_val_cr_availed === "number"
                                                        //         ? formData.cgst_tot_cess_val_cr_availed.toFixed(2)
                                                        //         : ""
                                                        // } 
                                                        value={totals.sgst_tot_cess_val_cr_availed}
                                                        onChange={(e) => handleChange("formData", "cgst_tot_cess_val_cr_availed", e.target.value, focusedRowIndex, 2)}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                        {/* ))} */}


                                    </tbody>
                                </Table>
                            </div>
                        </SimpleBar>
                    </div>
                </>
                {/* <Row className="d-flex justify-content-center">
                    <Col xs="auto">
                        <ButtonUi color="secondary" className='mt-1' onClick={() => { handleChangeTab('Items') }}>
                            Items
                        </ButtonUi>
                    </Col>
                </Row> */}
                {/* </Card> */}

            </Form>


        </React.Fragment>
    )
}

export default MainTab
