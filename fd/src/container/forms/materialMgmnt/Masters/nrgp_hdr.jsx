import React from "react";
import { Col, Row, Form,Card } from "reactstrap";
import MuiDateField from '../../../../components/basic/MuiDateField'
import MuiSelectField from '../../../../components/basic/muiSelectField'
import Checkbox from '../../../../components/basic/checkbox'
import ButtonUi from '../../../../components/basic/button'
import Select from '../../../../components/basic/select';
import RowAction from '../../../../components/common/rowAction';
import RadioGroup from '../../../../components/basic/radioGroup';


import {
  custHelpListHeaderNrgp,
  poNoHelpListHeaderNrgp,
  storeHelpListHeaderNrgp,
  vendorHelpListHeaderNrgp,
} from "./nrgp_helper";
import { FcInfo } from "react-icons/fc";
import MuiTextField from "../../../../components/basic/muiTextField";


const NrgpHeader = ({

  formData,
  formStatus,
  handleChange,
  costCentr,
  purpose,
  modeOfTransportList,
  openHelpList,
  setFormData,
  getValidateData,
  otherQueryPera,
  validateRequiredField

}) => {

  // const handleChlTypeChange = (e) => {
  //   const chlType = e.target.value;

  //   if (!["Insert", "Update"].includes(formStatus)) return;

  //   // ---------------------------------
  //   // PROCEDURE_TRANSCODE
  //   // ---------------------------------
  //   // procedureTranscode(chlType);

  //   // ---------------------------------
  //   // RESET DEPENDENT FIELDS
  //   // ---------------------------------
  //   setFormData((prev) => ({
  //     ...prev,
  //     chl_type: chlType,
  //     wc_description: null,
  //     v_code: null,
  //     v_name: null,
  //     po_id: null,
  //     po_no: null,
  //   }));


  //   // ---------------------------------
  //   // CHL TYPE CONDITIONS
  //   // ---------------------------------
  //   if (chlType === "M") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       customer_enabled: "Y",
  //       po_no_enabled: "N",
  //       po_no_display: "DISPLAY",
  //       text_item253: "Supplier",
  //       item254: "WO NO",
  //       trans_code: 55,
  //     }));
  //   } else if (chlType === "W") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       nonkardex_flag: "N",
  //       customer_flag: "N",
  //       customer_enabled: "N",
  //       po_no_enabled: "Y",
  //       po_no_display: "ENTRY",
  //       text_item253: "Supplier",
  //       item254: "WO NO",
  //       trans_code: 54,
  //     }));
  //   } else if (chlType === "S") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       customer_enabled: "N",
  //       po_no_enabled: "Y",
  //       po_no_display: "ENTRY",
  //       text_item253: "Customer",
  //       item254: "Service No.",
  //     }));

  //     // Oracle LOV calls
  //     // openHelpList("vendor", vendorHelpListHeaderRmgp);
  //     // openHelpList("po_no", poNoHelpListHeaderRmgp);
  //   }

  //   let getTransCd = updateTranscode(chlType)
  //   setFormData((prev) => ({ ...prev, trans_code: getTransCd }))

  //   // ---------------------------------
  //   // FOLLOW-UP PROGRAM UNITS
  //   // ---------------------------------
  //   // setChlType(chlType);
  //   // changeLovParty(chlType);
  //   // setKardexNonKardex(chlType);
  // };




  const updateTranscode = (chl_type) => {
    let trans_code;
    if (chl_type === "J") {
      trans_code = 53;
    } else if (chl_type === "W") {
      trans_code = 54;
    } else if (chl_type === "M") {
      trans_code = 55;
    }
    return trans_code
  };

  const handleChlTypeChange = (e) => {
    const chlType = e.target.value;

    if (!["Insert", "Update"].includes(formStatus)) return;

    let updatedData = {
      ...formData,

      // reset fields (use "" NOT null)
      chl_type: chlType,
      wc_description: "",
      v_code: "",
      v_name: "",
      po_id: "",
      po_no: "",
    };

    // -------------------------
    // Apply conditions
    // -------------------------
    if (chlType === "M") {
      updatedData = {
        ...updatedData,
        customer_enabled: "Y",
        po_no_enabled: "N",
        po_no_display: "DISPLAY",
        text_item253: "Supplier",
        item254: "WO NO",
        trans_code: 55,
      };
    }

    else if (chlType === "W") {
      updatedData = {
        ...updatedData,
        nonkardex_flag: "N",
        customer_flag: "N",
        customer_enabled: "N",
        po_no_enabled: "Y",
        po_no_display: "ENTRY",
        text_item253: "Supplier",
        item254: "WO NO",
        trans_code: 54,
      };
    }

    else if (chlType === "S") {
      updatedData = {
        ...updatedData,
        customer_enabled: "N",
        po_no_enabled: "Y",
        po_no_display: "ENTRY",
        text_item253: "Customer",
        item254: "Service No.",
      };
    }

    // final trans_code override (if needed)
    updatedData.trans_code = updateTranscode(chlType);
    setFormData(updatedData);
  };

  return (
    <>
      <Form id="nrgp-header-data-form">

        <Row>
          <Col xl={3} className="">
            <RadioGroup
              className="radio-button-wrapper  box-border"
              options={[
                { text: "Misc.", value: "M" },
                { text: "Work Order", value: "W" },
                // { text: "Service", value: "S" },
              ]}
              // onChange={(e) => handleChange(e, "chl_type", e.target.value)}
              onChange={handleChlTypeChange}
              checked={formData?.chl_type || "M"}
              name="chl_type"
            />
          </Col>
          <Col xl={3} className="">
            <RadioGroup
              className="radio-button-wrapper  box-border"
              options={[
                { text: "Kardex", value: "Y" },
                { text: "Non Kardex", value: "N" },
                // { text: "Service", value: "S" },
              ]}
              // onChange={(e) => handleChange(e, "chl_type", e.target.value)}
              onChange={handleChlTypeChange}
              checked={formData?.nonkardex_flag || "N"}
              name="nonkardex_flag"
              disabled
            />
          </Col>
          {/* <Col xl={2}>
            <MuiTextField
              text="text"
              label="Indent No."
              name="req_no"
              value={formData?.req_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col> */}
          <Col xl={2} className="button-group-wrapper">
            <Checkbox
              text="Customer"
              disabled={formData?.customer_enabled === "N"}
              onChange={(e) =>
                handleChange(e, "customer_flag", e.target.checked ? "Y" : "N")
              }
              checked={formData?.customer_flag === "Y"}
              name="customer_flag"
            />
          </Col>
          <Col xl={2} className="button-group-wrapper">
            <Checkbox
              text="GST Challan"
              // disabled={formData?.is_gst_chln === "N"}
              onChange={(e) =>
                handleChange(e, "is_gst_chln", e.target.checked ? "Y" : "N")
              }
              checked={formData?.is_gst_chln === "Y"}
              name="is_gst_chln"
            />
          </Col>
          <Col xl={2} className="">
            <p
              style={{
                textAlign: "center",
                color: "red",
                fontWeight: "Bold",
                fontSize: "14px",
              }}
            >
              {formData?.sdv_message}
            </p>
          </Col>
        </Row>

        <Row className="mt-3">
           <Col xl={2}>
            <MuiTextField
              type="text"
              label="Challan No."
              name="doc_no"
              maxLength={15}
              value={formData?.doc_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled = {formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Query'}
            />
          </Col>
          <Col xl={2} className="">
            <MuiDateField
              required
              label="Date"
              type="date"
              name="doc_date"
              value={formData?.doc_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled = {formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Query'}
            />
          </Col>

          <Col xl={2}>
            <MuiTextField
              required
              type="text"
              maxLength={19}
              label={formData?.customer_flag === 'Y' ? "Customer" : "Vendor"}
              name="v_code"
              value={formData?.v_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={() =>
                openHelpList(
                  "vendor",
                  formData?.customer_flag === 'Y'
                    ? custHelpListHeaderNrgp
                    : vendorHelpListHeaderNrgp
                )
              }
              onBlur={async (e) => {
                if (
                  formStatus === "Update" ||
                  formStatus === "Insert"
                ) {

                  validateRequiredField(e, "Vendor")

                  if (!formData.v_code) {
                    return
                  }
                  const vendor = e.target.value;
                  const isValid = await getValidateData(
                    "v_code",
                    vendor,
                    otherQueryPera,
                    null
                  );

                  if (!isValid) {
                    e.target.focus();
                  }
                }
              }}
            />
          </Col>
          <Col xl={4} className="">
            <MuiTextField
              type="text"
              name="v_name"
              value={formData?.v_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
         
          <Col xl={3} className="">
            <p
              style={{
                textAlign: "center",
                color: "red",
                fontWeight: "Bold",
                fontSize: "14px",
              }}
            >
              {formData?.flag === 'A' ? 'Authorized' : ''}
            </p>
          </Col>
        </Row>

        <Row className="mt-3">
          {/* <Col xl={2}>
            <MuiTextField
              type="text"
              label={formData?.item254}
              name="po_no"
              maxLength={15}
              value={formData?.po_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) => openHelpList("po_no", poNoHelpListHeaderRmgp)}
              onBlur={async (e) => {
                if (
                  formStatus === "Update" ||
                  formStatus === "Insert"
                ) {

                  validateRequiredField(e, "PO No.")

                  if (!formData.po_no) {
                    return
                  }
                  const po = e.target.value;
                  const isValid = await getValidateData(
                    "po_no",
                    po,
                    otherQueryPera,
                    null
                  );

                  if (!isValid) {
                    e.target.focus();
                  }
                }
              }}
            />
          </Col> */}
          <Col xl={2} className="">
            <MuiTextField
              type="text"
              label="Ref No."
              name="ref_no"
              value={formData?.ref_no || ""}
              maxLength={10}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <MuiDateField
              type="date"
              label="Date"
              name="ref_date"
              value={formData?.ref_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={3} className="">
            <MuiTextField
              label="GST #"
              type="text"
              name="gst_no"
              value={formData?.gst_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // onDoubleClick={(e) =>
              //   openHelpList("po_no", storeHelpListHeaderNrgp)
              // }
              // onBlur={async (e) => {
              //   if (
              //     formStatus === "Update" ||
              //     formStatus === "Insert"
              //   ) {

              //     validateRequiredField(e, "WC No.")

              //     if (!formData.wc_no) {
              //       return
              //     }
              //     const wcno = e.target.value;
              //     const isValid = await getValidateData(
              //       "wc_no",
              //       wcno,
              //       otherQueryPera,
              //       null
              //     );

              //     if (!isValid) {
              //       e.target.focus();
              //     }
              //   }
              // }}
              disabled
            />
          </Col>
          {/* <Col xl={2} className="">
            <MuiTextField
              label="Created By"
              type="text"
              name="ein"
              value={formData?.ein || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={2} className="mt-4">
            <MuiTextField
              label=""
              type="text"
              name="ein_name"
              value={formData?.ein_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col> */}
           <Col xl={2}>
            <MuiSelectField
              label="Cost Centr"
              name="cost_centr"
              placeholder={" "}
              value={formData?.cost_centr || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={costCentr}
            />
          </Col>
          <Col xl={3}>
            <MuiSelectField
              label="Purpose"
              name="pur_code"
              placeholder={" "}
              value={formData?.pur_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={purpose}
            />
          </Col>
        </Row>

        <Row className="mt-3">
         
          <Col xl={12}>
            <MuiTextField
              type="text"
              label="Address 1"
              name="v_add1"
              value={formData?.v_add1 || ""}
              maxLength={15}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
             disabled
            />
          </Col>
          <Col xl={12} className="mt-3">
            <MuiTextField
              type="text"
             label="Address 2"
              name="v_add2"
              value={formData?.v_add2 || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={12} className="mt-3">
            <MuiTextField
              type="text"
             label="Address 3"
              name="v_add3"
              value={formData?.v_add3 || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          
        </Row>

        <Row className="mt-3">
          <Col xl={3}>
         <Card xl={2}>
          <Row>
          <Col xl={6} className="button-group-wrapper">
            <Checkbox
              text="Liability Our's"
              onChange={(e) =>
                handleChange(e, "liability", e.target.checked ? 1 : 0)
              }
              checked={formData?.liability === 1}
              name="liability"
            />
          </Col>
          <Col xl={6} className="button-group-wrapper">
            <Checkbox
              text="Freight Paid"
              onChange={(e) =>
                handleChange(e, "freg_pay", e.target.checked ? 1 : 0)
              }
              checked={formData?.freg_pay === 1}
              name="freg_pay"
            />
          </Col>
          </Row>
    </Card>
     </Col>
            {/* <Col xl={2}>
            <MuiTextField
              type="text"
              label={formData?.item254}
              name="po_no"
              maxLength={15}
              value={formData?.po_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) => openHelpList("po_no", poNoHelpListHeaderNrgp)}
              onBlur={async (e) => {
                if (
                  formStatus === "Update" ||
                  formStatus === "Insert"
                ) {

                  validateRequiredField(e, "PO No.")

                  if (!formData.po_no) {
                    return
                  }
                  const po = e.target.value;
                  const isValid = await getValidateData(
                    "po_no",
                    po,
                    otherQueryPera,
                    null
                  );

                  if (!isValid) {
                    e.target.focus();
                  }
                }
              }}
            />
          </Col> */}
             <Col xl={2} className="">
            <MuiTextField
              label="Store"
              type="text"
              name="wc_no"
              value={formData?.wc_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>
                openHelpList("wc_no", storeHelpListHeaderNrgp)
              }
              onBlur={async (e) => {
                if (
                  formStatus === "Update" ||
                  formStatus === "Insert"
                ) {

                  validateRequiredField(e, "WC No.")

                  if (!formData.wc_no) {
                    return
                  }
                  const wcno = e.target.value;
                  const isValid = await getValidateData(
                    "wc_no",
                    wcno,
                    otherQueryPera,
                    null
                  );

                  if (!isValid) {
                    e.target.focus();
                  }
                }
              }}
            />
          </Col>
          <Col xl={2}>
            <MuiTextField
              type="text"
              label="DLVR Note No."
              name="dlvr_note_no"
              value={formData?.dlvr_note_no || ""}
              maxLength={15}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={2}>
            <MuiTextField
              type="text"
              label="Manual RMGP No."
              name="manual_no"
              value={formData?.manual_no || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col xl={3}>
            <MuiSelectField
              label="Mode of Shipment"
              name="mode_cd"
              placeholder={" "}
              value={formData?.mode_cd || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={modeOfTransportList}
            />
          </Col>
          <Col xl={2}>
            <MuiTextField
              type="text"
              label="Recipient's name"
              name="mat_thru"
              value={formData?.mat_thru || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              maxLength={30}
            />
          </Col>
          {/* <Col xl={2}>
            <MuiTextField
              type="text"
              label="EWAY Bill No."
              name="elec_ref_no"
              value={formData?.elec_ref_no || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <MuiDateField
              label="EWAY Bill Date"
              name="elec_ref_date"
              value={formData?.elec_ref_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col> */}

          <Col xl={3}>
            <MuiTextField
              type="text"
              label="Carrier's Name"
              name="trnsporter"
              value={formData?.trnsporter || ""}
              maxLength={40}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <MuiTextField
              type="text"
              label="No of Cases"
              name="no_of_case"
              value={formData?.no_of_case || ""}
              maxLength={1}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
           <Col xl={2}>
            <MuiTextField
              type="text"
              label="Weight"
              name="weight"
              value={formData?.weight || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-3">

         

          <Col xl={2}>
            <MuiTextField
              type="text"
              label="Destination From"
              name="dest_frm"
              value={formData?.dest_frm || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <MuiTextField
              type="text"
              label="To"
              name="dest_to"
              value={formData?.dest_to || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          {/* <Col xl={2}>
            <MuiTextField
              type="text"
              label="No of Days"
              name="no_of_days"
              value={formData?.no_of_days || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <MuiTextField
              type="text"
              label="Vehicle No"
              name="vehicle_no"
              value={formData?.vehicle_no || ""}
              maxLength={50}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col> */}
        {/* </Row> */}

        {/* <Row className="mt-3"> */}
          <Col xl={8}>
            <MuiTextField
              type="text"
              label="Remarks"
              name="remarks"
              value={formData?.remarks || ""}
              maxLength={200}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          {/* <Col xl={5}>
            <MuiTextField
              type="text"
              label="Indent Raised By"
              name="req_created_by"
              value={formData?.req_created_by || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col> */}


        </Row>


      </Form>
    </>
  );
};

export default NrgpHeader;
