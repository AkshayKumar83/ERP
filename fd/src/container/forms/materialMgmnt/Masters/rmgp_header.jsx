import React from "react";
import { Col, Row, Form } from "reactstrap";
import RadioGroup from "../../../../components/basic/radioGroup";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import {
  custHelpListHeaderRmgp,
  poNoHelpListHeaderRmgp,
  storeHelpListHeaderRmgp,
  vendorHelpListHeaderRmgp,
} from "./rmgp_helper";
import { FcInfo } from "react-icons/fc";


const RmgpHeader = ({

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
      <Form id="rmgp-header-data-form">

        <Row>
          <Col xl={4} className="mt-4">
            <RadioGroup
              className="radio-button-wrapper  box-border"
              options={[
                { text: "Misc.", value: "M" },
                { text: "Work Order", value: "W" },
                { text: "Service", value: "S" },
              ]}
              // onChange={(e) => handleChange(e, "chl_type", e.target.value)}
              onChange={handleChlTypeChange}
              checked={formData?.chl_type || "M"}
              name="chl_type"
            />
          </Col>
          {/* <Col xl={2}>
            <TextField
              text="text"
              label="Indent No."
              name="req_no"
              value={formData?.req_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col> */}
          <Col xl={2} className="button-group-wrapper mt-3">
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
          <Col xl={2} className="mt-3">
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

        <Row className="mt-1">
          <Col xl={2}>
            <TextField
              required
              type="text"
              label={formData?.customer_flag === 'Y' ? "Customer" : "Vendor"}
              name="v_code"
              value={formData?.v_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={() =>
                openHelpList(
                  "vendor",
                  formData?.customer_flag === 'Y'
                    ? custHelpListHeaderRmgp
                    : vendorHelpListHeaderRmgp
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
          <Col xl={2} className="mt-4">
            <TextField
              type="text"
              name="v_name"
              value={formData?.v_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={2}>
            <TextField
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
            <TextField
              required
              label="Date"
              type="date"
              name="doc_date"
              value={formData?.doc_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled = {formStatus === 'Insert' || formStatus === 'Update' || formStatus === 'Query'}
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

        <Row className="mt-1">
          <Col xl={2}>
            <TextField
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
          </Col>
          <Col xl={2} className="">
            <TextField
              type="text"
              label="Ref No."
              name="ref_no"
              value={formData?.ref_no || ""}
              maxLength={10}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="date"
              label="Date"
              name="ref_date"
              value={formData?.ref_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2} className="">
            <TextField
              label="Store"
              type="text"
              name="wc_no"
              value={formData?.wc_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>
                openHelpList("po_no", storeHelpListHeaderRmgp)
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
          <Col xl={2} className="">
            <TextField
              label="Created By"
              type="text"
              name="ein"
              value={formData?.ein || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={2} className="mt-4">
            <TextField
              label=""
              type="text"
              name="ein_name"
              value={formData?.ein_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col xl={2}>
            <Select
              label="Cost Centr"
              name="cost_centr"
              placeholder={" "}
              value={formData?.cost_centr || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={costCentr}
            />
          </Col>
          <Col xl={2}>
            <Select
              label="Purpose"
              name="pur_code"
              placeholder={" "}
              value={formData?.pur_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={purpose}
            />
          </Col>
          <Col xl={2}>
            <TextField
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
            <TextField
              type="text"
              label="Manual RMGP No."
              name="manual_no"
              value={formData?.manual_no || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2} className="button-group-wrapper mt-3">
            <Checkbox
              text="Chargable"
              onChange={(e) =>
                handleChange(e, "liability", e.target.checked ? 1 : 0)
              }
              checked={formData?.liability === 1}
              name="liability"
            />
          </Col>
          <Col xl={2} className="button-group-wrapper mt-3">
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

        <Row className="mt-1">
          <Col xl={2}>
            <Select
              label="Mode of Shipment"
              name="mode_cd"
              placeholder={" "}
              value={formData?.mode_cd || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              options={modeOfTransportList}
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="text"
              label="Recipient's name"
              name="mat_thru"
              value={formData?.mat_thru || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="text"
              label="EWAY Bill No."
              name="elec_ref_no"
              value={formData?.elec_ref_no || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="date"
              label="EWAY Bill Date"
              name="elec_ref_date"
              value={formData?.elec_ref_date || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="Carrier's Name/No"
              name="trnsporter"
              value={formData?.trnsporter || ""}
              maxLength={40}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="No of Cases"
              name="no_of_case"
              value={formData?.no_of_case || ""}
              maxLength={1}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-1">

          <Col xl={2}>
            <TextField
              type="text"
              label="Weight"
              name="weight"
              value={formData?.weight || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="Destination From"
              name="dest_frm"
              value={formData?.dest_frm || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="To"
              name="dest_to"
              value={formData?.dest_to || ""}
              maxLength={20}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="No of Days"
              name="no_of_days"
              value={formData?.no_of_days || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="Vehicle No"
              name="vehicle_no"
              value={formData?.vehicle_no || ""}
              maxLength={50}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>
        </Row>

        <Row className="mt-1">
          <Col xl={5}>
            <TextField
              type="text"
              label="Remarks"
              name="remarks"
              value={formData?.remarks || ""}
              maxLength={200}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          {/* <Col xl={5}>
            <TextField
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

export default RmgpHeader;
