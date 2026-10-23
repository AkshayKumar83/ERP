import React from "react";
import { Card, Col, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";

const ApBillEntryMain = ({ formData, handleChange, formStatus }) => {
    return (
        <>
            <Row>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Bill No."
                        value={formData.bill_no || ""}
                        onChange={(e) =>handleChange("bill_no", e.target.value) }
                    />
                </Col>
                <Col xl={1}>
                    <TextField
                        type="text"
                        label="Rev No."
                        value={formData.rev_no || ""}
                        onChange={(e) => handleChange("rev_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="date"
                        label="Date"
                        value={formData.bill_dt || ""}
                        onChange={(e) =>handleChange("bill_dt", e.target.value) }
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Vendor Code"
                        value={formData.v_code || ""}
                        onChange={(e) =>handleChange("v_code", e.target.value)}
                    />
                </Col>
                <Col xl={4} className="mt-4">
                    <TextField
                        type="text"
                        label=""
                        value={formData.v_name || ""}
                        onChange={(e) =>handleChange("v_name", e.target.value)}
                        disabled
                    />
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Bill Log No."
                        value={formData.bill_log || ""}
                        onChange={(e) =>handleChange("bill_log", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="date"
                        label="Date"
                        value={formData.blog_dt|| ""}
                        onChange={(e) => handleChange("blog_dt", e.target.value)}
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Old BP No."
                        value={formData.chq_no || ""}
                        onChange={(e) =>handleChange("chq_no", e.target.value)}
                        disabled
                    />
                </Col>

                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Exchange Rate"
                        value={formData.exchange_rate || ""}
                        onChange={(e) =>handleChange("exchange_rate", e.target.value)  }
                    />
                </Col>
                <Col xl={2} className="">
                    <TextField
                        type="text"
                        label="Consignment No"
                        value={formData.consignment_no || ""}
                        onChange={(e) =>handleChange("consignment_no", e.target.value)}
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Vendor's Bill Amount"
                        value={formData.vnd_bamt || ""}
                        onChange={(e) =>handleChange("vnd_bamt", e.target.value)}
                    />
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Purchase Vch No."
                        value={formData.vch_no || ""}
                        onChange={(e) =>handleChange("vch_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="DN (Rate Diff)"
                        value={formData.dn_rate_diff || ""}
                        onChange={(e) =>handleChange("dn_rate_diff", e.target.value)}
                        disabled
                    />
                </Col>

                <Col xl={2}>
                    <TextField
                        type="text"
                        label="DN(Qty Rej.)"
                        value={formData.dn_qty_diff || ""}
                        onChange={(e) =>handleChange("dn_qty_diff", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className="">
                    <TextField
                        type="text"
                        label=" GST DN(Qty Rej.)"
                        value={formData.dn_gst || ""}
                        onChange={(e) =>handleChange("dn_gst", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className="">
                    <TextField
                        type="text"
                        label=" GST DN(LD)"
                        value={formData.dn_gst_ld || ""}
                        onChange={(e) => handleChange("dn_gst_ld", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className="">
                    <TextField
                        type="text"
                        label="DN Vchr(LD)"
                        value={formData.dn_vchr_ld || ""}
                        onChange={(e) =>handleChange("dn_vchr_ld", e.target.value)}
                        disabled
                    />
                </Col>
            </Row>
 <Card className="mt-1">
     <Row className='mt-1'>

      <Col xl={10} className=''>
 
      <Row className='mb-1 me-1'>
      <Col xl={2} className='mt-4 text-end'>
      <span className='ms-4'>Freight %</span></Col>
     <Col xl={2} className="mt-4">
                    <TextField
                        type="text"
                        // label="SGST/UGST"
                        value={formData.frt_val || ""}
                        onChange={(e) =>handleChange("frt_val", e.target.value)}
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        label="SGST/UGST"
                        value={formData.sgst_val_f || ""}
                        onChange={(e) =>handleChange("sgst_val_f", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        label="CGST"
                        value={formData.cgst_val_f || ""}
                        onChange={(e) =>handleChange("cgst_val_f", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        label="IGST"
                        value={formData.igst_val_f || ""}
                        onChange={(e) =>handleChange("igst_val_f", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        label="CESS"
                        value={formData.tot_cess_f || ""}
                        onChange={(e) =>handleChange("tot_cess_f", e.target.value)}
                        disabled
                    />
                </Col>
              
      </Row>
      <Row className='mb-1 me-1'>
      <Col xl={2} className=' text-end'>
      <span className='ms-4'>Insur.</span></Col>
     <Col xl={2} className="">
                    <TextField
                        type="text"
                        value={formData.ins_val_i || ""}
                        onChange={(e) =>handleChange("ins_val_i", e.target.value)}
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        value={formData.sgst_val_i || ""}
                        onChange={(e) =>handleChange("sgst_val_i", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        value={formData.cgst_val_i || ""}
                        onChange={(e) =>handleChange("cgst_val_i", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        value={formData.igst_val_i|| ""}
                        onChange={(e) =>handleChange("igst_val_i", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        value={formData.tot_cess_i || ""}
                        onChange={(e) =>handleChange("tot_cess_i", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
          </Col>
       <Col xl={2} className='mt-4'>
         <Checkbox
              text="Freight is part of purchase"
              name="cb_frt_in_pur"
              checked={formData.cb_frt_in_pur === "Y"}
              onChange={(e) =>handleChange( "cb_frt_in_pur", e.target.checked ? "Y" : "N")}
            />
                </Col>
        </Row> 
            </Card>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Amount"
                        value={formData.tds_amt || ""}
                        onChange={(e) =>handleChange("tds_amt", e.target.value) }
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Sur Amt."
                        value={formData.tds_sur_amt || ""}
                        onChange={(e) => handleChange("tds_sur_amt", e.target.value) }
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Cess Amt."
                        value={formData.tds_cess_amt || ""}
                        onChange={(e) =>handleChange("tds_cess_amt", e.target.value) }
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Hsc Amt."
                        value={formData.tds_hsc_amt || ""}
                        onChange={(e) => handleChange("tds_hsc_amt", e.target.value)}
                        disabled
                    />
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Acc Code"
                        value={formData.tds_acc_no || ""}
                        onChange={(e) =>handleChange("tds_acc_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={6} className="mt-4">
                    <TextField
                        type="number"
                        value={formData.tds_acc_desc || ""}
                        onChange={(e) =>handleChange("tds_acc_desc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col className="mt-4">
                <span>Dynamic msg here</span>
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Sur. Acc Code"
                        value={formData.tds_sur_acc_no || ""}
                        onChange={(e) =>handleChange("tds_sur_acc_no", e.target.value) }
                        disabled
                    />
                </Col>
                <Col xl={6} className="mt-4">
                    <TextField
                        type="number"
                        value={formData.tds_sur_acc_desc || ""}
                        onChange={(e) =>handleChange("tds_sur_acc_desc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className="ms-4 mt-3">
                    <ButtonUi outline>Revert Bill</ButtonUi>
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Cess. Acc Code"
                        value={formData.tds_cess_acc_no || ""}
                        onChange={(e) => handleChange("tds_cess_acc_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={6} className="mt-4">
                    <TextField
                        type="number"
                        value={formData.tds_cess_acc_desc || ""}
                        onChange={(e) =>handleChange("tds_cess_acc_desc", e.target.value)}
                        disabled
                    />
                </Col>
                 <Col className="mt-4">
                <span>Dynamic msg here</span>
                </Col>
            </Row>

            <Row>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="TDS Hsc. Acc Code"
                        value={formData.tds_hsc_acc_no || ""}
                        onChange={(e) =>handleChange("tds_hsc_acc_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={6} className="mt-4">
                    <TextField
                        type="number"
                        value={formData.tds_hsc_acc_desc || ""}
                        onChange={(e) =>handleChange("tds_hsc_acc_desc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={1}>
                    <TextField
                        type="text"
                        label="Bill Id"
                        value={formData.bill_id || ""}
                        onChange={(e) =>handleChange("bill_id", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={1}>
                    <TextField
                        type="number"
                        label="TCS %"
                        value={formData.tcs_perc || ""}
                        onChange={(e) =>handleChange("tcs_perc", e.target.value)}
                    />
                </Col>
                <Col xl={2} className="">
                    <TextField
                        type="number"
                        label="TCS Amount"
                        value={formData.tcs_amt || ""}
                        onChange={(e) =>handleChange("tcs_amt", e.target.value)}
                    />
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Total SGST/UGST"
                        value={formData.sgst_tot_val || ""}
                        onChange={(e) => handleChange("sgst_tot_val", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Total SGST/UGST Cess"
                        value={formData.sgst_tot_cess_val || ""}
                        onChange={(e) =>handleChange("sgst_tot_cess_val", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className="">
                    <TextField
                        type="number"
                        label="Total CGST"
                        value={formData.cgst_tot_val || ""}
                        onChange={(e) =>handleChange("cgst_tot_val", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Total CGST Cess"
                        value={formData.cgst_tot_cess_val || ""}
                        onChange={(e) => handleChange("cgst_tot_cess_val", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Total IGST"
                        value={formData.igst_tot_val || ""}
                        onChange={(e) =>handleChange("igst_tot_val", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Total IGST Cess"
                        value={formData.igst_tot_cess_val || ""}
                        onChange={(e) =>handleChange("igst_tot_cess_val", e.target.value)}
                        disabled
                    />
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Total Deval Cost"
                        value={formData.dev_cost || ""}
                        onChange={(e) => handleChange("dev_cost", e.target.value) }
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Round off Amt."
                        value={formData.round_of_amt || ""}
                        onChange={(e) =>handleChange("round_of_amt", e.target.value)}
                    />
                </Col>
                <Col xl={2} className="mt-4">
                    <Checkbox
                        text="Round"
                        name='calc_round_off'
                       checked={formData.calc_round_off === "Y"}
                       onChange={(e) =>handleChange("calc_round_off", e.target.checked ? "Y" : "N")}
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Diff"
                        value={formData.diff_in_vnd_pass || ""}
                        onChange={(e) =>handleChange("diff_in_vnd_pass", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="Net Amount"
                        value={formData.tot_amt || ""}
                        onChange={(e) =>handleChange("tot_amt", e.target.value) }
                        disabled
                    />
                </Col>
            </Row>

            <Row className="mt-1">
                <Col xl={8}>
                    <TextField
                        type="text"
                        label="Remarks"
                        value={formData.remarks || ""}
                        onChange={(e) =>handleChange("remarks", e.target.value)}
                    />
                </Col>
            </Row>
            <Row className="mt-1">
                <Col xl={8}>
                    <TextField
                        type="text"
                        label="Remarks for Purchase"
                        value={formData.remarks1 || ""}
                        onChange={(e) => handleChange("remarks1", e.target.value)}
                    />
                </Col>
            </Row>
        </>
    );
};

export default ApBillEntryMain;
