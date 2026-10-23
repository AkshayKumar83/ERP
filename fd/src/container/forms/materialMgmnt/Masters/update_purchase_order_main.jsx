import React, { useState } from "react";
import { Row, Col, Form } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import Select from "../../../../components/basic/select";
import Checkbox from "../../../../components/basic/checkbox";
import TextArea from "../../../../components/basic/textArea";
import { validateVendor, vendorHelpListHeader,paymentTermHelpListHeader, shipToHelpListHeader, 
  advanceGLHelpListHeader } from "./update_purchase_order_hlpr";

const UpdateMainTab = ({
  formData = {},
  formStatus,
  handleChange,
  poCategory,
  modeOfTransportList,
  paymentTermList,
  workCenterList,
  priceBasisList,
  currencyList,
  openHelpList,
  formControlData,
  setFormData,
  user,
  brandList,
  allowedDocTypes,
  itemFormData
}) => {
    return (
    <React.Fragment>
      <Form id="purchase-order-main-form">
        <Row className="">
          <Col xl={2} className="m-auto">
           <RadioGroup className="button-group-wrapper box-border justify-content-between"
            name="po_type"
            options={[
              {
                text: "Advice",
                value: "A",
                disabled:
                  formStatus === "Insert"
                    ? !allowedDocTypes.includes("PA")
                    : false,
              },
              {
                text: "Order",
                value: "O",
                disabled:
                  formStatus === "Insert"
                    ? !allowedDocTypes.includes("PO")
                    : false,
              },
            ]}
            
            onChange={(e) => handleChange(e, "po_type", e.target.value)}
            checked={formData?.po_type || ""}
          />
          </Col>
          <Col className="">
            <p
              style={{
                textAlign: "center",
                color: "red",
                fontWeight: "Bold",
                fontSize: "14px",
              }}
            >
              {formData?.disp_po_type}
            </p>
          </Col>

          <Col>
            <p
              style={{
                textAlign: "center",
                color: formData?.flag === "F" ? "#0BDA51" : "red",
                fontWeight: "Bold",
                fontSize: "14px",
              }}
            >
              {formData?.disp_flag}
            </p>
          </Col>
        </Row>
        <Row className="mt-1 ">
          {/* <Col xl={5} className="mt-auto">
            <div className="box-border button-group-wrapper d-flex justify-content-between">
              <Checkbox
                onChange={(e) => handleChange(e, e.target.name, e.target.checked ? "Y" : "N")}
                name="trial_po"
                text="Trial PO"
                checked={formData?.trial_po === "Y"}
              />
              <Checkbox
                onChange={(e) => handleChange(e, e.target.name, e.target.checked ? "Y" : "N")}
                name="order_acceptance"
                text="Order Acceptance"
                checked={formData?.order_acceptance === "Y"}
              />
              <Checkbox
                onChange={(e) => handleChange(e, e.target.name, e.target.checked ? "Y" : "N")}
                name="mat_disp_clearence_flag"
                text="Material Dispatch Clearance Certificate"
                checked={formData?.mat_disp_clearence_flag === "Y"}
              />
            </div>
          </Col> */}
          <Col xl={2}>
            <TextField
              // label="PO No"
              label={formData?.po_type === "A" ? "Purchase Advice No." : "Purchase Order No."}
              type="text"
              name="po_no"
              value={formData?.po_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              maxLength={20}
              disabled ={formStatus !=='Search'}
            />
          </Col>
          <Col xl={1}>
            <TextField
              label="Amd. No."
              type="number"
              name="amd_no"
              value={formData?.amd_no ?? ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              maxLength={4}
              disabled
            />
          </Col>
          <Col xl={8}>
            <TextField
              label="Amendment Reason"
              type="text"
              name="amd_reason"
              value={formData?.amd_reason ?? ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              maxLength={40000}
              // disabled
            />
          </Col>
          {/* <Col xl={3} className="mt-auto">
            <Checkbox
              name="hide_rate_import_po"
              onChange={(e) => handleChange(e, e.target.name, e.target.checked ? "Y" : "N")}
              text="Hide Rate For Import PO"
              checked={formData?.hide_rate_import_po === "Y"}
            />
          </Col> */}
        </Row>

        <Row className="mt-1">
          <Col xl={2}>
            <Select
              // label="Category"
              label={formData?.po_type === "A" ? "PA Category" : "PO Category"}
              type="text"
              name="category"
              value={formData?.category || ""}
              options={poCategory}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              required
            />
          </Col>
          <Col xl={9} className="ms-2">
            <Row className="mt-4 d-flex align-items-center me-2">
              <div className="d-flex justify-content-evenly text-wrapper box border">
                <span className="text-label">For Query</span>
                <RadioGroup
                  className="button-group-wrapper"
                  options={[
                    { text: "Unauthorised", value: "N" },
                    { text: "Authorised", value: "A" },
                    { text: "Printed", value: "P" },
                    { text: "Refused", value: "R" },
                    { text: "With Finance", value: "F" },
                  ]}
                  name="flag"
                  onChange={(e) => handleChange(e, 'flag', e.target.value)}
                  checked={formData?.flag || 'N'}
                  disabled={formStatus != "Search"}
                />

                <RadioGroup
                  className="button-group-wrapper"
                  options={[{ text: "Cancelled", value: "Y" }]}
                  name="cancel_flag"
                  onChange={(e) => handleChange(e, 'cancel_flag', e.target.value)}
                  checked={formData?.cancel_flag}
                  disabled={formStatus != "Search"}
                />
                {/* <div className="mt-1" style={{ width: "200px" }}>
                  <Select
                    type="text"
                    name="buyer_code"
                    value={formData?.buyer_code || ""}
                    onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                    disabled
                  />
                </div> */}
              </div>
            </Row>
          </Col>
        </Row>
        <Row className="mt-1">
          {/* <Col xl={2}>
            <Select
              label="To be Shipped in Unit"
              type="text"
              name="wc_id"
              value={formData?.wc_id || ""}
              options={workCenterList}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              required
            />
          </Col> */}
          <Col xl={2} className="">
            <TextField
              // label="PO Date"
              label={formData?.po_type === "A" ? "PA Date" : "PO Date"}
              type="date"
              name="po_date"
              value={formData?.po_date || ""}
              required
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              // label="PO Amend Date"
              label={formData?.po_type === "A" ? "PA Amend Date" : "PO Amend Date"}
              type="date"
              name="amd_date"
              value={formData?.amd_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={2}>
            <TextField
              // label="Effective date"
              label={formData?.po_type === "A" ? "PA Effective Date" : "PO Effective Date"}
              type="date"
              name="po_eff_dt"
              required
              value={formData?.po_eff_dt || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              // label="PO End Date"
              label={formData?.po_type === "A" ? "PA End Date" : "PO End Date"}
              type="date"
              name="po_end_dt"
              required
              value={formData?.po_end_dt || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          {/* <Col xl={2}>
            <TextField
              label="Fin App. Date"
              type="date"
              name="fin_approval_date"
              value={formData?.fin_approval_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col> */}
        </Row>
        <Row className="mt-1">
          <Col xl={2}>
            <TextField
              label="Vendor Code"
              type="text"
              name="v_code"
              required
              value={formData?.v_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>openHelpList("vendor", vendorHelpListHeader)}
              onBlur={(e)=> validateVendor(e, formStatus, user, formData, setFormData)}
              disabled={itemFormData.length > 0}
            />
          </Col>
          <Col xl={4}>
            <TextField
              label="Vendor Name"
              type="text"
              name="v_name"
              value={formData?.v_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={5}>
            <TextField
              label="Vendor Ref No."
              type="text"
              name="qtn_ref"
              maxLength={20}
              value={formData?.qtn_ref || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col xl={2}>
            <TextField
              label="Ship To"
              type="text"
              name="c_code"
               required ={formData.po_type ==='A'}
              value={formData?.c_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>openHelpList("shipTo", shipToHelpListHeader)}
              // onBlur={(e)=> validateVendor(e, formStatus, user, formData, setFormData)}
               disabled={itemFormData.length > 0}
            />
          </Col>

          <Col xl={4}>
            <TextField
              label="Ship To Name"
              type="text"
              name="c_name"
              value={formData?.c_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>

          {/* <Col xl={6} className="mt-4">
            <RadioGroup
              className="button-group-wrapper box-border justify-content-between"
              options={[
                { text: "PO Direct to OSP", value: "Y" },
                { text: "Quality Assured", value: "Q" },
                { text: "None", value: "N" },
              ]}
              name="rb_direct_to_ost"
              onChange={(e) => handleChange(e, 'rb_direct_to_ost', e.target.value)}
              checked={formData?.rb_direct_to_ost || 'Q'}
            />
          </Col> */}
           <Col xl={3}>
            <Select
              label="Currency"
              type="text"
              name="curr_cd"
              value={formData?.curr_cd || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={currencyList}
              required
            />
          </Col>
          <Col xl={2}>
            <TextField
              label="Currency Conv."
              type="number"
              name="curr_conv"
              value={formData?.curr_conv || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled = {formData?.curr_cd == 'INR'}
            />
          </Col>
         
        </Row>
       
        {/* <Row className="mt-1">
          <Col xl={3}>
            <Select
              label="Currency"
              type="text"
              name="curr_cd"
              value={formData?.curr_cd || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={currencyList}
              required
            />
          </Col>
          <Col xl={2}>
            <TextField
              label="Currency Conv."
              type="number"
              name="curr_conv"
              value={formData?.curr_conv || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled = {formData?.curr_cd == 'INR'}
            />
          </Col>
          
        </Row> */}
        <Row className="">
          <Col xl={6} className="mt-2">
            <Row>
              {/* <Col>
                <TextArea
                  label="Amendment Reason"
                  type="text"
                  name="amd_reason"
                  value={formData?.amd_reason || ""}
                  maxLength={40000}
                  rows={3}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                />
              </Col> */}
              <Col xl={4}>
                <TextField
                  label="Adv. GL Acc"
                  type="text"
                  name="adv_gl_acc_no"
                  value={formData?.adv_gl_acc_no || ""}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                 onDoubleClick={(e) =>openHelpList("AdvanceGL", advanceGLHelpListHeader)}

                />
              </Col>
              <Col xl={8}>
                <TextField
                  label="Name"
                  type="text"
                  name="acc_desc"
                  value={formData?.acc_desc || ""}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                  disabled
                />
              </Col>
              <Col xl={4} className="mt-1">
                <TextField
                  // label="Adv. Against PO"
                  label={formData?.po_type === "A" ? "Adv. Against PA" : "Adv. Against PO"}
                  type="number"
                  name="adv_against_po"
                  value={formData?.adv_against_po || ""}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                  disabled
                />
              </Col>
              <Col xl={4} className="mt-1">
                <TextField
                  label="EDDAL Subsidy %"
                  type="number"
                  name="subsidy_perc"
                  value={formData?.subsidy_perc || ""}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                />
              </Col>
              <Col xl={4} className="mt-1">
                <Select
              label="Brand"
              type="text"
              name="brand_code"
              value={formData?.brand_code || ""}
              options={brandList}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // required
            />
              </Col>
            </Row>
            <Row>
              <Col xl={4} className="mt-1">
                <p
                  style={{
                     textAlign: "center",
                    color: "red",
                    fontWeight: "Bold",
                    fontSize: "14px",
                  }}
                >
                  {formData?.di_buyer}
                </p>
              </Col>
              <Col xl={4} className="mt-1">
                <TextField
                  // label="PO Item Value"
                  label={formData?.po_type === "A" ? "PA Item Value" : "PO Item Value"}
                  type="number"
                  name="po_value"
                  value={formData?.po_value || ""}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                  disabled
                />
              </Col>
              <Col xl={4} className="mt-1">
                <TextField
                  // label="Total PO Value"
                  label={formData?.po_type === "A" ? "Total PA Value" : "Total PO Value"}
                  type="number"
                  name="total_po_value"
                  // value={(formData?.total_po_value) || ""}
                  value={Number(formData?.total_po_value || 0).toFixed(3)}
                  onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                  disabled
                />
              </Col>
            </Row>
          </Col>
          <Col xl={5} className="mt-2">
            <div className="text-wrapper box border">
              <span className="text-label">Terms & Conditions</span>
              <Row className="ms-1 me-1">
                <Col className="mt-1">
                  <TextField
                    label="Payment Term"
                    type="text"
                    name="term_desc"
                    value={formData?.term_desc || ""}
                    onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                    // options={paymentTermList}
                    onDoubleClick={(e) =>openHelpList("payTerm", paymentTermHelpListHeader)}


                  />
                </Col>
              </Row>
              <Row className="ms-1 me-1">
                <Col className="">
                  <Select
                    label="Mode of Transport"
                    type="text"
                    name="mode_cd"
                    value={formData?.mode_cd || ""}
                    onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                    options={modeOfTransportList}
                  />
                </Col>
              </Row>
              <Row className="ms-1 me-1">
                <Col className="">
                  <Select
                    label="Price Basis"
                    type="text"
                    name="pric_basis"
                    value={formData?.pric_basis || ""}
                    onChange={(e) => handleChange(e, e.target.name, e.target.value)}
                    options={priceBasisList}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default UpdateMainTab;
