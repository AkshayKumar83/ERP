import React, { useState } from "react";
import { Card, Form, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { formatTwoDecimal } from "../../../../utils/fn";
import { getMosmDactData, setDocType, validateDivertInvNo, validateDocNo } from "./normal_invoice_helper";

const NormalInvMain = ({
    formData = {},
    formTempData = {},
    handleChange = () => { },
    handleChangeTab = () => { },
    controlFormData = {},
    currency = [],
    invType = [],
    docType = [],
    division = [],
    despatch = [],
    preInv = [],
    setFormData = ()=>{},
    setFormTempData =()=>{},
    user,
    formStatus,
    handleHelpList
}) => {

    const [isCreditInfoModelOpen, setIsCreditInfoModelOpen] = useState()
    const toggleCreditInfoModal = () => setIsCreditInfoModelOpen(!isCreditInfoModelOpen)

    const handleDoubleClick = (name) => {
        if (['Insert', 'Update'].includes(formStatus)) {
         handleHelpList(true, name);
        }
    };

    // doc_type handling
    const handleDocType = (e)=>{
        handleChange(e)
        const {name, value} = e.target;
        //console.log(name, value)
        setDocType({formHdrData:formData, setFormHdrData:setFormData, event:e, setFormTempData:setFormTempData})
    }

    // inv_type handling
    const handleInvType = async(e)=>{
        handleChange(e)
      
        if(!['Insert', 'Update'].includes(formStatus)){
            //console.log(formStatus)
            return
        }

         let isValid = await getMosmDactData({formData, setFormData, e, user})
         if(!isValid){
            e.target.focus()
         }
    }

    return (
        <Form id="normal-inv-main-form">
            <Row>
                <Col xl={9}>
                    <Card className="p-1 px-2">
                        <Row className='mt-1'>
                            <Col xl={4}>
                                <Select
                                    label="Division"
                                    name="division_id"
                                    value={formData?.division_id || ""}
                                    onChange={(e) => handleChange(e)}
                                    options={division}
                                />
                            </Col>
                            <Col xl={8} className="d-flex align-end pt-4 pb-1">
                                <div className="button-group-wrapper box-border">
                                    <Checkbox
                                        text="FOC"
                                        name="foc"
                                        checked={formData.foc === 'Y'}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <Checkbox
                                        text="Invoice Against DA"
                                        name="inv_agnst_da"
                                        checked={formData.inv_agnst_da === 'Y'}
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <Checkbox
                                        text="With GST And Without GST"
                                        name="with_gst"
                                        checked={formData.with_gst === 'Y'}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col xl={4}>
                                <Select
                                    label="Against"
                                    name="doc_type"
                                    value={formData?.doc_type || ""}
                                    onChange={(e) => handleDocType(e)}
                                    options={docType}
                                />
                            </Col>
                            <Col xl={4} >
                                <Select
                                    label="Invoice Type"
                                    name="inv_type"
                                    value={formData?.inv_type || ""}
                                    onChange={(e) => handleInvType(e)}
                                    options={invType}
                                />
                            </Col>
                            <Col xl={3} className="d-flex">
                                <div className="d-flex align-items-end">
                                    <Checkbox
                                        text="JW"
                                        name="jw"
                                        checked={formData.jw === 'Y'}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col xl={4}>
                                <TextField
                                    label={formTempData?.di_doc_no || 'di_doc_no'}
                                    name="doc_no"
                                    value={formData?.doc_no || ""}
                                    onChange={(e) => handleChange(e)}
                                    onDoubleClick={() => handleDoubleClick("doc_no")}
                                    onBlur={(e)=> validateDocNo({e,formData,setFormData, user})}
                                />
                            </Col>
                            <Col xl={4} >
                                <TextField
                                    //todo: look at the label of this field fmb form screen
                                    label={controlFormData?.di_divert_inv_no || 'di_divert_inv_no'}
                                    name="divert_inv_no"
                                    value={formData?.divert_inv_no || ""}
                                    onDoubleClick={() => handleDoubleClick("divert_inv_no")}
                                    onChange={(e) => handleChange(e)}
                                    onBlur={(e)=> validateDivertInvNo({e,formData,setFormData, user})}
                                />
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col xl={3}>
                                <TextField
                                    name='rmgp_no'
                                    label="RMGP No."
                                    onDoubleClick={() => handleDoubleClick("rmgp_no")}
                                    value={formData.rmgp_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={6}>
                                <Select
                                    label='Despatch From'
                                    name="despatch_fr"
                                    value={formData?.despatch_fr || ""}
                                    onChange={(e) => handleChange(e)}
                                    options={despatch}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="Invoice No."
                                    name= 'inv_no'
                                    value={formData.inv_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={3} className="d-flex align-items-end">
                                <TextField
                                    type="date"
                                    name='inv_dt'
                                    value={formData.inv_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4} className="d-flex align-items-end">
                                <TextField
                                    type="text"
                                    name='st38_no'
                                    value={formData.st38_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col xl={7}>
                                <TextField
                                    type="text"
                                    label="Commodity"
                                    name='commodity_desc'
                                    onDoubleClick={() => handleDoubleClick("commodity")}
                                    value={formData.commodity_desc || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="Po No."
                                    name='c_po_no'
                                    value={formData.c_po_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1 d-flex gap-0 gx-0">
                            <Col xl={2}>
                                <TextField
                                    //todo: fix this style as fmb
                                    disabled
                                    type="text"
                                    label={formTempData?.di_party_code || 'di_party_code'}
                                    name="party_code"
                                    value={formData.party_code || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={8} className="mt-auto">
                                <TextField
                                    disabled
                                    type="text"
                                    name="party_name"
                                    value={formData.party_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1 d-flex gap-0 gx-0">
                            <Col xl={2}>
                                <TextField
                                    //todo: fix this style as fmb
                                    type="text"
                                    label="Ship To"
                                    name="ship_to_code"
                                    value={formData.ship_to_code || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={8} className="mt-auto">
                                <TextField
                                    disabled
                                    type="text"
                                    name="ship_to_name"
                                    // label="Name"
                                    value={formData.ship_to_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1 d-flex gap-0 gx-0">
                            <Col xl={2}>
                                <TextField
                                    //todo: fix this style as fmb
                                    type="text"
                                    label="Bill To"
                                    name="bill_to_code"
                                    value={formData.bill_to_code || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={8} className="mt-auto">
                                <TextField
                                    disabled
                                    type="text"
                                    name="bill_to_name"
                                    // label="Name"
                                    value={formData.bill_to_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col xl={4}>
                                <TextField
                                    disabled
                                    type="text"
                                    label="Sales Vch No."
                                    name="voucher_no"
                                    value={formData.voucher_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="EWAY Bill No."
                                    name="elec_ref_no"
                                    value={formData.elec_ref_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="GR/RR No."
                                    name="gr_rr_no"
                                    value={formData.gr_rr_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="GR/RR Dt"
                                    name="gr_rr_dt"
                                    value={formData.gr_rr_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="text"
                                    label="End Cust PO No."
                                    name="end_c_po_no"
                                    value={formData.end_c_po_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col xl={4}>
                                <TextField
                                    type="datetime-local"
                                    label="Prep. Date & Time"
                                    name="prep_dt"
                                    value={formData.prep_dt || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4} className="d-flex align-items-end">
                                <span className="fw-bold" style={{ color: '#90ee90' }}>{controlFormData?.di_status_flag}</span>
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    type="date"
                                    label="End Cust Date"
                                    name="end_c_po_dt"
                                    value={formData.end_c_po_no || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col xl={4}>
                                <TextField
                                    disabled
                                    type="text"
                                    label="Curr. in Sales Ord."
                                    name="so_curr_cd"
                                    value={formData.so_curr_cd || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={2}>
                                <TextField
                                    disabled
                                    type="text"
                                    label="Exch. Rate"
                                    name="so_c_ex_rate"
                                    value={formData.so_c_ex_rate || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <TextField
                                    disabled
                                    type="text"
                                    label="Credit Note"
                                    name="credit_note"
                                    value={formData.credit_note || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1">
                            <Col xl={4}>
                                <Select
                                    label="Currency"
                                    name="curr_cd"
                                    value={formData.curr_cd || ""}
                                    onChange={(e) => handleChange(e)}
                                    options = {currency}
                                />
                            </Col>
                            <Col xl={2}>
                                <TextField
                                    type="text"
                                    label="Exch. Rate"
                                    name="c_ex_rate"
                                    value={formData.c_ex_rate || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={4}>
                                <Select
                                    disabled
                                    label="Pre-Shipment No."
                                    name="pre_id"
                                    value={formData.pre_id || ""}
                                    onChange={(e) => handleChange(e)}
                                    optins={preInv}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-1 d-flex ">
                            <Col xl={1}>
                                <TextField
                                    //todo: fix this style as fmb
                                    type="text"
                                    label="Bank"
                                    name="bank_code"
                                    value={formData.bank_code || ""}
                                    onChange={(e) => handleChange(e)}
                                    onDoubleClick={() => handleDoubleClick("bank_code")}
                                />
                            </Col>
                            <Col xl={5} className="mt-auto">
                                <TextField
                                    disabled
                                    type="text"
                                    name="bank_name"
                                    value={formData.bank_name || ""}
                                    onChange={(e) => handleChange(e)}
                                />
                            </Col>
                            <Col xl={3} className="mt-auto">
                                <ButtonUi color="secondary" outline >Cancel Invoice</ButtonUi>
                            </Col>
                            <Col xl={3} className="mt-auto">
                                <ButtonUi color="primary" outline onClick={toggleCreditInfoModal} >Show Credit Limit/Balance Info</ButtonUi>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xl={3} md={6} >
                    <Card className="p-2 d-flex flex-column gap-1 text-wrapper">
                        <span className="text-label">Total</span>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_basic_val"
                                >
                                    Basic Value
                                </label>
                                <TextField
                                    type="number"
                                    id="t_basic_val"
                                    //value={formData.t_basic_val || ""}
                                    
                                     value={
                                        typeof formData.t_basic_val === "number"
                                            ? formatTwoDecimal(formData.t_basic_val)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px', }}
                                    htmlFor="volume_discount_amt"
                                >
                                    Volume Disc
                                </label>
                                <TextField
                                    type="number"
                                    id="volume_discount_amt"
                                    //value={formData.volume_discount_amt || ""}
                                     value={
                                        typeof formData.volume_discount_amt === "number"
                                            ? formatTwoDecimal(formData.volume_discount_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                    inpClass="bkg-yellow"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="trade_discount_amt"
                                >
                                    Trade Disc
                                </label>
                                <TextField
                                    type="number"
                                    id="trade_discount_amt"
                                    //value={formData.trade_discount_amt || ""}
                                    value={
                                        typeof formData.trade_discount_amt === "number"
                                            ? formatTwoDecimal(formData.trade_discount_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_pack_forw"
                                >
                                    Pack/Forw
                                </label>
                                <TextField
                                    type="number"
                                    id="t_pack_forw"
                                    //value={formData.t_pack_forw || ""}
                                     value={
                                        typeof formData.t_pack_forw === "number"
                                            ? formatTwoDecimal(formData.t_pack_forw)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_ass_val"
                                >
                                    Assessable
                                </label>
                                <TextField
                                    type="number"
                                    id="t_ass_val"
                                   // value={formData.t_ass_val || ""}
                                    value={
                                        typeof formData.t_ass_val === "number"
                                            ? formatTwoDecimal(formData.t_ass_val)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row >
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_sgst_amt"
                                >
                                    SGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_sgst_amt"
                                    //value={formData.t_gst_sgst_amt || ""}
                                     value={
                                        typeof formData.t_gst_sgst_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_sgst_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>

                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_sgst_cess_amt"
                                >
                                    SGST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_sgst_cess_amt"
                                   // value={formData.t_gst_sgst_amt || ""}
                                     value={
                                        typeof formData.t_gst_sgst_cess_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_sgst_cess_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_ugst_amt"
                                >
                                    UGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_ugst_amt"
                                    //value={formData.t_gst_ugst_amt || ""}
                                     value={
                                        typeof formData.t_gst_ugst_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_ugst_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_ugst_cess_amt"
                                >
                                    GST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_ugst_cess_amt"
                                   // value={formData.t_gst_ugst_cess_amt || ""}
                                      value={
                                        typeof formData.t_gst_ugst_cess_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_ugst_cess_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_cgst_amt"
                                >
                                    CGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_cgst_amt"
                                   // value={formData.t_gst_cgst_amt || ""}
                                     value={
                                        typeof formData.t_gst_cgst_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_cgst_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_cgst_cess_amt"
                                >
                                    CGST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_cgst_cess_amt"
                                   // value={formData.t_gst_cgst_cess_amt || ""}
                                     value={
                                        typeof formData.t_gst_cgst_cess_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_cgst_cess_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_igst_amt"
                                >
                                    IGST
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_igst_amt"
                                    //value={formData.t_gst_igst_amt || ""}
                                      value={
                                        typeof formData.t_gst_igst_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_igst_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_igst_cess_amt"
                                >
                                    IGST Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_igst_cess_amt"
                                    //value={formData.t_gst_igst_cess_amt || ""}
                                      value={
                                        typeof formData.t_gst_igst_cess_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_igst_cess_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_gst_comp_cess_amt"
                                >
                                    Compensation Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="t_gst_comp_cess_amt"
                                   // value={formData.t_gst_comp_cess_amt || ""}
                                    value={
                                        typeof formData.t_gst_comp_cess_amt === "number"
                                            ? formatTwoDecimal(formData.t_gst_comp_cess_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_addtl_imp_duty"
                                >
                                    Addtl Imp Duty
                                </label>
                                <TextField
                                    type="number"
                                    id="t_addtl_imp_duty"
                                   // value={formData.t_addtl_imp_duty || ""}
                                     value={
                                        typeof formData.t_addtl_imp_duty === "number"
                                            ? formatTwoDecimal(formData.t_addtl_imp_duty)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }} htmlFor="t_freight">
                                    Freight
                                </label>
                                <TextField
                                    type="number"
                                    id="t_freight"
                                   // value={formData.t_freight || ""}
                                     value={
                                        typeof formData.t_freight === "number"
                                            ? formatTwoDecimal(formData.t_freight)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="t_insurance"
                                >
                                    Insurance
                                </label>
                                <TextField
                                    type="number"
                                    id="t_insurance"
                                   // value={formData.t_insurance || ""}
                                    value={
                                        typeof formData.t_insurance === "number"
                                            ? formatTwoDecimal(formData.t_insurance)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="tcs_amt"
                                >
                                    TCS
                                </label>
                                <TextField
                                    type="number"
                                    id="tcs_amt"
                                   // value={formData.tcs_amt || ""}
                                     value={
                                        typeof formData.tcs_amt === "number"
                                            ? formatTwoDecimal(formData.tcs_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="tcs_cess_amt"
                                >
                                    TCS Cess
                                </label>
                                <TextField
                                    type="number"
                                    id="tcs_cess_amt"
                                   // value={formData.tcs_cess_amt || ""}
                                     value={
                                        typeof formData.tcs_cess_amt === "number"
                                            ? formatTwoDecimal(formData.tcs_cess_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px' }}
                                    htmlFor="tcs_surch_amt"
                                >
                                    TCS Surcharge
                                </label>
                                <TextField
                                    type="number"
                                    id="tcs_surch_amt"
                                    //value={formData.tcs_surch_amt || ""}
                                     value={
                                        typeof formData.tcs_surch_amt === "number"
                                            ? formatTwoDecimal(formData.tcs_surch_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex">
                                <label
                                    style={{ minWidth: "140px", textAlign: 'right', paddingInline: '5px', color: 'blue', fontWeight: 'bold' }}
                                    htmlFor="net_amt"
                                >
                                    Net Amount
                                </label>
                                <TextField
                                    type="number"
                                    id="net_amt"
                                   // value={formData.net_amt || ""}
                                     value={
                                        typeof formData.net_amt === "number"
                                            ? formatTwoDecimal(formData.net_amt)
                                            : "0.00"
                                    }
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                    inpClass="bkg-pink"
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-3">
                <Modal isOpen={isCreditInfoModelOpen} toggle={toggleCreditInfoModal} size="lg">
                    <ModalHeader toggle={toggleCreditInfoModal}>Credit Limit & Balance Information</ModalHeader>
                    <ModalBody>
                    <>
                      <Row>
                                <Col xl={5}>
                                <Card className="p-2 text-wrapper">
                                    <span className="text-label">Credit Limit & Current Balance</span>
                                    <Row>
                                        <Col>
                                            <TextField
                                                disabled
                                                type="text"
                                                name="credit_limit"
                                                label="Credit Limit"
                                                lClass="text-primary"
                                                value={formData.credit_limit || ""}
                                                onChange={(e) => handleChange(e)}

                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-1">
                                        <Col xl={8}>
                                            <TextField
                                                disabled
                                                type="text"
                                                name="crrent_balance"
                                                label="Current Balance"
                                                lClass="text-primary"
                                                value={formData.crrent_balance || ""}
                                                onChange={(e) => handleChange(e)}
                                            />
                                        </Col>
                                        <Col xl={3} className="d-flex align-items-end">
                                            <TextField
                                                disabled
                                                type="text"
                                                name='current_balance_db_cr'
                                                value={formData.current_balance_db_cr || ""}
                                                onChange={(e) => handleChange(e)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-1">
                                        <Col xl={8}>
                                            <TextField
                                                disabled
                                                type="text"
                                                name="balance_credit"
                                                label="Balance Credit"
                                                lClass="text-primary"
                                                value={formData.balance_credit || ""}
                                                onChange={(e) => handleChange(e)}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col xl={4}>
                                <Card className="p-2 text-wrapper">
                                    <span className="text-label">Last Invoice Detail</span>
                                    <Row>
                                        <Col>
                                            <TextField
                                                disabled
                                                type="text"
                                                name="last_inv_no"
                                                label="Invoice No."
                                                lClass="text-primary"
                                                value={formData.last_inv_no || ""}
                                                onChange={(e) => handleChange(e)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-1">
                                        <Col>
                                            <TextField
                                                disabled
                                                type="text"
                                                name="last_inv_dt"
                                                label="Invoice Dt."
                                                lClass="text-primary"
                                                value={formData.last_inv_dt || ""}
                                                onChange={(e) => handleChange(e)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-1">
                                        <Col>
                                            <TextField
                                                disabled
                                                type="text"
                                                name="t_inv_net_amt"
                                                label="Net Amt."
                                                lClass="text-primary"
                                                value={formData.t_inv_net_amt || ""}
                                                onChange={(e) => handleChange(e)}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                      </Row>
                    </>
                    </ModalBody>
                    <ModalFooter>
                    <Button color="secondary" onClick={toggleCreditInfoModal}>
                        Close
                    </Button>
                    </ModalFooter>
                </Modal>
            </Row>
        </Form>
    );
};

export default NormalInvMain;
