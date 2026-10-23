import React, { useState, useCallback } from 'react'
import { Row, Col, Form, Table, Card } from "reactstrap"
import TextField from "../../../../components/basic/textField"
import RadioGroup from "../../../../components/basic/radioGroup"
import ButtonUi from "../../../../components/basic/button"
import SimpleBar from "simplebar-react"
import Select from "../../../../components/basic/select"
import RowAction from "../../../../components/common/rowAction"
import Checkbox from '../../../../components/basic/checkbox'
//import { headers, accountHelpListHeader, costHelpListHeader } from './debit_credit_noteHelper'
import { INQCIHeader, INQCIdetails, mrirHelpListHeader, defectHelpListHeader, specHelpListHeader } from './Incoming_quality_inspection';
import { FcInfo } from 'react-icons/fc'
import toast from 'react-hot-toast'
import IncomingQualityInspectBatch from './Incoming_quality_inspect_batch'

const IncomingQualityInspectINQCI = ({ formData = {}, handleChange, formStatus, formDetailData = [{}],

  focusedRowIndex,
  setFocusedRowIndex,
  setActiveRowIndex,
  formDtlInqData = [{}],
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  callInsertFillParam,
  callInsertFillBatch,
  setFormDetailData,
  setActiveTab,
  setBatchData,
  handleAddRow,
  handleDeleteRow,
  callProcDvtnCheck,
  showDeviationModal,
  remarkData

}) => {

  const [isdetailDataAutoFilled, setIsDetailDataAutoFilled] = useState(false)
  const [isDvtnChecked, setIsDvtnChecked] = useState(false)


  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formDetailData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  // for handle -ve value 

  const validateAndFormatNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return true;
    }

    const num = parseFloat(value);

    if (isNaN(num)) {
      return true;
    }

    if (num < 0) {
      toast.error("This field value cannot be negative");
      return false;
    }

    return true;
  };


  // for field level validation

  const handleQtyStk = (row) => {
    const qtyAcp = parseFloat(row.qty_acp_in_pur_um) || 0;
    const convFactor = parseFloat(row.conversion_factor) || 1;

    const qty_ok_in_stk_um = qtyAcp * convFactor;

    // Other quantities needed for payment calculation
    const movtktQty = parseFloat(row.movtkt_qty) || 0;
    const material_fr = row.material_fr || "";

    // Calculate payment quantity
    let qty_payment = qty_ok_in_stk_um + movtktQty;
    if (material_fr === "C") {
      qty_payment = 0;
    }

    // //console.log("qty_payment:", qty_payment);

    return {
      qty_ok_in_stk_um,
      qty_payment
    };
  };

  const handleQtyStk1 = (row) => {
    //console.log("formDetailData", formDetailData)
    //console.log("qty converted", parseFloat(row.qty_converted))
    const okQty = parseFloat(row.qty_ok_in_stk_um) || 0;
    const etsQty = parseFloat(row.qty_ets) || 0;
    const convertedQty = parseFloat(row.qty_converted) || 0;
    const movtktQty = parseFloat(row.movtkt_qty) || 0;
    const material_fr = row.material_fr || "";


    if (okQty < 0) {
      toast.error("Accepted Quantity cannot be negative");
      return null;
    }

    let qty_rejd = null;

    if (etsQty >= okQty) {
      if (okQty > (convertedQty - movtktQty)) {
        toast.error(
          "Qty accepted cannot be greater than (Qty Received - Qty ETS - Movement Ticket Qty)"
        );
        return null;
      } else {
        qty_rejd = convertedQty - (okQty + etsQty + movtktQty);

      }
    } else {
      if (okQty > (convertedQty - movtktQty)) {

      } else {

      }
    }

    // Calculate qty_payment
    let qty_payment = okQty + movtktQty;
    if (material_fr === "C") {
      qty_payment = 0;
    }


    const result = {
      qty_ok_in_stk_um: okQty,
      qty_rejd,
      qty_payment: qty_payment
    };

    return result;
  };

  const qtyprc = (row) => {
    const qty_rejd = parseFloat(row.qty_rejd) || 0;
    const qty_mat_flt_in_stk_um = parseFloat(row.qty_mat_flt_in_stk_um) || 0;
    const qty_prc_flt_stk_um = parseFloat(row.qty_prc_flt_stk_um) || 0;

    const qty1 = qty_rejd - qty_mat_flt_in_stk_um;

    if (qty_prc_flt_stk_um < 0) {
      toast.error("Process Fault quantity cannot be negative");
      return null;
    }

    if (qty_prc_flt_stk_um > qty1) {
      toast.error(
        "Process fault quantity cannot be greater than Total Rejected qty - Material fault quantity"
      );
      return null;
    }
    return {
      qty1,
      qty_prc_flt_stk_um
    };
  };

  const qtyMat = (row) => {
    const qty_rejd = parseFloat(row.qty_rejd) || 0;
    const qty_prc_flt_stk_um = parseFloat(row.qty_prc_flt_stk_um) || 0;
    const qty_mat_flt_in_stk_um = parseFloat(row.qty_mat_flt_in_stk_um) || 0;

    const qty1 = qty_rejd - qty_prc_flt_stk_um;

    if (qty_mat_flt_in_stk_um < 0) {
      toast.error("Material Fault quantity cannot be negative");
      return null;
    }

    if (qty_mat_flt_in_stk_um > qty1) {
      toast.error(
        "Material fault quantity cannot be greater than Total Rejected qty - Process fault quantity"
      );
      return null;
    }
    return {
      qty1,
      qty_mat_flt_in_stk_um
    };
  };

  const qtyRework = (row) => {
    const qty_rework_in_stk_um = parseFloat(row.qty_rework_in_stk_um) || 0;
    const qty_recd = parseFloat(row.qty_recd) || 0;

    //console.log("Row Data:", row);
    //console.log("Parsed Values -> qty_rework_in_stk_um:", qty_rework_in_stk_um, ", qty_recd:", qty_recd);

    if (qty_rework_in_stk_um < 0) {
      console.error("Validation Failed: Reworked quantity cannot be negative");
      toast.error("Reworked quantity cannot be negative");
      return null;
    }

    if (qty_rework_in_stk_um > qty_recd) {
      console.error("Validation Failed: Reworked Quantity cannot be greater than Received Quantity");
      toast.error("Reworked Quantity cannot be greater than Received Quantity");
      return null;
    }

    //console.log("Validation Passed. Returning:", { qty_rework_in_stk_um });

    return {
      qty_rework_in_stk_um
    };
  };

  const handleQtyPayment = (row) => {

    let qty_payment = parseFloat(row.qty_payment);
    const qty_recd = parseFloat(row.qty_recd) || 0;
    const qty_prc_flt_stk_um = parseFloat(row.qty_prc_flt_stk_um) || 0;
    const qty_ok_in_stk_um = parseFloat(row.qty_ok_in_stk_um) || 0;
    const movtkt_qty = parseFloat(row.movtkt_qty) || 0;
    const qty_destruct_in_stk_um = parseFloat(row.qty_destruct_in_stk_um) || 0;
    const material_fr = row.material_fr || "";

    if (isNaN(qty_payment)) {
      qty_payment = 0;
    }

    if (qty_payment < 0) {
      toast.error("Payment quantity cannot be negative");
      return null;
    }

    if (qty_prc_flt_stk_um > 0 && qty_payment > qty_recd - qty_prc_flt_stk_um) {
      toast.error(
        "Payment qty cannot be greater than Received qty - Process Fault Qty."
      );
      return null;
    }

    if (!isNaN(qty_destruct_in_stk_um) && material_fr === "S") {
      if (qty_ok_in_stk_um + qty_destruct_in_stk_um + movtkt_qty > qty_payment) {
        toast.error(
          "Payment qty cannot be less than (Accepted + Movement Ticket + Destructed) Qty."
        );
        return null;
      }
    }

    return {
      qty_payment
    };
  };

  const qtyScrap = (row) => {
    const qty_scrap_in_stk_um = parseFloat(row.qty_scrap_in_stk_um) || 0;
    const qty_rejd = parseFloat(row.qty_rejd) || 0;

    if (qty_scrap_in_stk_um < 0) {
      toast.error("Scrap quantity cannot be negative");
      return null;
    }


    if (qty_scrap_in_stk_um > qty_rejd) {
      toast.error("Scrap quantity cannot be greater than Rejected Quantity");
      return null;
    }

    return {
      qty_scrap_in_stk_um
    };
  };

  const qtyDestruct = (row) => {
    const qty_destruct_in_stk_um = parseFloat(row.qty_destruct_in_stk_um) || 0;
    const qty_ok_in_stk_um = parseFloat(row.qty_ok_in_stk_um) || 0;
    const movtkt_qty = parseFloat(row.movtkt_qty) || 0;
    const qty_recd = parseFloat(row.qty_recd) || 0;


    if (row.qty_destruct_in_stk_um === null || row.qty_destruct_in_stk_um === undefined) {
      return {
        qty_payment: qty_ok_in_stk_um + movtkt_qty
      };
    }


    if (qty_destruct_in_stk_um < 0) {
      toast.error("Destructed quantity cannot be negative");
      return null;
    }

    if (qty_ok_in_stk_um + qty_destruct_in_stk_um + movtkt_qty > qty_recd) {
      toast.error(
        "(Accepted + Movement Ticket + Destructed) qty cannot be greater than Received qty."
      );
      return null;
    }


    const qty_payment = qty_ok_in_stk_um + movtkt_qty + qty_destruct_in_stk_um;

    return {
      qty_payment
    };
  };

  // for tommiqci block  for 

  const validateQcRejection = (row) => {
    const qtyRejd = formDetailData[focusedRowIndex].qty_rejd
    const totalRejQty = parseFloat(row.total_rej_qty) || 0;  // :total_rej_qty
    const qcRej = parseFloat(row.qc_rej) || 0;               // :qc_rej
    const oldQcRej = parseFloat(row.old_qc_rej) || 0;        // :old_qc_rej
    const sampleSize = parseFloat(row.sample_size) || 0;     // :sample_size

    // 1️ Check total defect qty vs QC rejection qty
    if (qtyRejd < (totalRejQty + qcRej - oldQcRej)) {
      toast.error("Total defect quantity is greater than QC rejection quantity");
      return null;
    }

    // 2️ Check QC rejection vs sample size
    if (qcRej > sampleSize) {
      toast.error("QC rejection quantity cannot be greater than Sample Size");
      return null;
    }

    return {
      total_rej_qty: totalRejQty + qcRej - oldQcRej,
      old_qc_rej: qcRej
    };
  };
  
  return (
    <>
      <Row className=''>
        <Col xl={9}>
          <Row>
            <Col xl={3}>
              <TextField
                required
                label="MRIR No."
                name="mrir_no"
                placeholder={" "}
                value={formData?.mrir_no || ""}
                onChange={(e) => handleChange("formData", "mrir_no", e.target.value)}
                onDoubleClick={() => handleDoubleClick("mrir", mrirHelpListHeader)}


              />
            </Col>
            <Col xl={2}>
              <TextField
                type="date"
                label="MRIR Date"
                value={formDetailData[focusedRowIndex]?.mrir_date || ""}
                onChange={(e) => handleChange("formData", "mrir_date", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="date"
                label="Clearance Date"
                value={formDetailData[focusedRowIndex]?.clear_date || ""}
                onChange={(e) => handleChange("formData", "clear_date", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="text"
                label="MRN No."
                value={formData.invward_control_no || ""}
                onChange={(e) => handleChange("formData", "invward_control_no", e.target.value)}
                disabled
              />
            </Col>

          </Row>
          <Row className='mt-1'>
            <Col xl={2}>
              <TextField
                type="text"
                label="Item Code"
                value={formData.it_code || ""}
                onChange={(e) => handleChange("formData", "it_code", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={7}>
              <TextField
                type="text"
                label="Description"
                value={formData.desc || ""}
                onChange={(e) => handleChange("formData", "desc", e.target.value)}
                disabled
              />
            </Col>


          </Row>
          <Row>
            <Col xl={2}>
              <TextField
                type="text"
                label="Vendor Code"
                value={formData.v_code || ""}
                onChange={(e) => handleChange("formData", "v_code", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={7}>
              <TextField
                type="text"
                label="Description"
                value={formData.v_name || ""}
                onChange={(e) => handleChange("formData", "v_name", e.target.value)}
                disabled
              />
            </Col>
          </Row>
          <Row className='mt-1'>
            <Col xl={2}>
              <TextField
                type="text"
                label="Challen No."
                value={formData.chln_no || ""}
                onChange={(e) => handleChange("formData", "chln_no", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="date"
                label="Challen Date"
                value={formData.chln_date || ""}
                onChange={(e) => handleChange("formData", "chln_date", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="text"
                label="Insp Report No"
                value={formData.insp_report_no || ""}
                onChange={(e) => handleChange("formData", "insp_report_no", e.target.value)}
                disabled
              />
            </Col>
            <Col xl={2}>
              <TextField
                type="text"
                label="Lab Report No"
                value={formData.lab_report_no || ""}
                onChange={(e) => handleChange("formData", "lab_report_no", e.target.value)}

              />
            </Col>
            <Col xl={2}>
              <TextField
                type="number"
                label="Qty in No"
                value={formData.qty_in_no || ""}
                onChange={(e) => handleChange("formData", "qty_in_no", e.target.value)}
                disabled
              />
            </Col>

          </Row>
          <Row className='mt-1'>
            <Col xl={9}>
              <TextField
                type='text'
                label='Remarks'
                value={formData.remarks || ""}
                onChange={(e) => handleChange("formData", "remarks", e.target.value)}
                disabled 
                options = {remarkData}
              />
            </Col>
          </Row>
        </Col>

        <Col xl={3}>
          <Card>
            <Row>
              <Col className="button-group-wrapper ms-2 mt-1" >
                <Checkbox
                  text="Under Segregation"
                  onChange={(e) => handleChange("formData", "under_seg", e.target.checked ? "Y" : "N")}
                  checked={formData?.under_seg === "Y"}
                />
              </Col>
            </Row>
            <Row>
              <Col className="button-group-wrapper ms-2"  >
                <Checkbox
                  text="Under Decision"
                  onChange={(e) => handleChange("formData", "under_dc", e.target.checked ? "Y" : "N")}
                  checked={formData?.under_dc === "Y"}
                />
              </Col>
            </Row>
            <Row>
              <Col className="button-group-wrapper ms-2"  >
                <Checkbox
                  text="Packed"
                  onChange={(e) => handleChange("formData", "packed_material", e.target.checked ? "Y" : "N")}
                  checked={formData?.packed_material === "Y"}
                />
              </Col>
            </Row>
            <Row>
              <Col className="button-group-wrapper ms-2"  >
                <Checkbox
                  text="Scrap"
                  onChange={(e) => handleChange("formData", "scrap", e.target.checked ? "Y" : "N")}
                  checked={formData?.scrap === "Y"}
                />
              </Col>
            </Row>
            <Row>
              <Col xl={7} className="button-group-wrapper ms-2 mb-2"  >
                <TextField
                  text="number"
                  label='DVTN No.'
                  value={formData.dev_no}
                  onChange={(e) => handleChange("formData", "dev_no", e.target.value)}

                />
              </Col>
            </Row>
          </Card>
          <Row className="mt-3">

            <div className="text-wrapper border text-wrapper box  customer-height ">
              <span className="text-label">Tested by Vendor</span>
              <Row>
                <Col className="button-group-wrapper ms-2 mt-2 " >
                  <Checkbox
                    text="Material Test"
                    onChange={(e) => handleChange("formData", "material_test", e.target.checked ? "Y" : "N")}
                    checked={formData?.material_test === "Y"}
                  />
                </Col>

                <Col className="button-group-wrapper ms-2 "  >
                  <Checkbox
                    text="Dimensional"
                    onChange={(e) => handleChange("formData", "dimen_test", e.target.checked ? "Y" : "N")}
                    checked={formData?.dimen_test === "Y"}
                  />
                </Col>
              </Row>
            </div>

          </Row>
          <Row className="mt-3">

            <div className="text-wrapper border text-wrapper box  customer-height ">
              <span className="text-label">Tested by US</span>
              <Row>
                <Col className="button-group-wrapper ms-2 mt-2 " >
                  <Checkbox
                    text="Frequency"
                    onChange={(e) => handleChange("formData", "ail_test", e.target.checked ? "Y" : "N")}
                    checked={formData?.ail_test === "Y"}
                  />
                </Col>
              </Row>
            </div>

          </Row>
        </Col>
      </Row>

      <Row >
        <Col>

          <div className="table-title">

            {/* {(formStatus === "Insert" || formStatus === "Update") && (

              <ButtonUi color="primary" className="add-action"
              // onClick={() => handleAddRow("formDetailData")}

              >
                Add Row
              </ButtonUi>

            )} */}
          </div>


          <div className="table-wrapper-v3">
            <SimpleBar forceVisible="y" autoHide={false}>
              <div className='table-sticky-wrapper'>
                <Table hover>
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th className="">Actions</th>
                      )}
                      {INQCIHeader.map((header, index) => (
                        <th
                          key={index}
                          data-required={header.required || false}
                          style={{
                            whiteSpace: "nowrap",
                            width: header.width,
                            minWidth: header.width,
                          }}
                        >
                          {header.label}
                          {header.isHelpExist && (<FcInfo title="Info" />)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formDetailData.map((data, rowIndex) => (
                      <tr key={rowIndex}
                        onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                        onBlur={() => setFocusedRowIndex(-1)}
                        style={{
                          border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"
                            }`,
                        }}
                      >
                        {
                          (formStatus === 'Insert' || formStatus === 'Update') &&
                          <td className="">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={formDetailData.length > 1}
                              onDelete={() => handleDeleteRow("formDtlData", data, rowIndex)}
                            //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                            />
                          </td>
                        }
                        <td className=" table_cell">
                          <TextField
                            type="number"
                            step="0.001"
                            //  required
                            name="qty_ets"
                            //  value={typeof (data.qty_ets) === "number" ? (data.qty_ets).toFixed(3) : ''}
                            value={
                              Number.isFinite(Number(data.qty_ets))
                                ? Number(data.qty_ets).toFixed(3)
                                : ""
                            }
                            max={99999999.999}
                            disabled
                            onChange={(e) => handleChange("formDetailData", "qty_ets", e.target.value, rowIndex)}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            // required
                            name="move_tktqty"
                            step="0.001"
                            // value={typeof (data.move_tktqty) === "number" ? (data.move_tktqty).toFixed(3) : ''}
                            value={
                              Number.isFinite(Number(data.move_tktqty))
                                ? Number(data.move_tktqty).toFixed(3)
                                : ""
                            }
                            maxLength={13}
                            max={9999999999.999}
                            disabled
                            onChange={(e) => handleChange("formDetailData", "move_tktqty", e.target.value, rowIndex, e)}


                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            //  required
                            step="0.00001"
                            name="qty_recd"
                            // value={typeof (data.qty_recd) === "number" ? (data.qty_recd).toFixed(5) : ''}
                            value={
                              Number.isFinite(Number(data.qty_recd))
                                ? Number(data.qty_recd).toFixed(5)
                                : ""
                            }
                            disabled
                            max={9999999999.99999}
                            maxLength={15}
                            onChange={(e) => handleChange("formDetailData", "qty_recd", e.target.value, rowIndex, e)}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            //  required
                            name="uom"
                            value={formData.uom || ""}
                            maxLength={5}
                            disabled
                            onChange={(e) => handleChange("formData", "uom", e.target.value, rowIndex, e)}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            //  required
                            step="0.00001"
                            name="qty_converted"
                            //  value={typeof (data.qty_converted) === "number" ? (data.qty_converted).toFixed(5) : ''}
                            value={
                              Number.isFinite(Number(data.qty_converted))
                                ? Number(data.qty_converted).toFixed(5)
                                : ""
                            }
                            max={9999999999.99999}
                            disabled
                            onChange={(e) => handleChange("formDetailData", "qty_converted", e.target.value, rowIndex, e)}

                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="stok_uom"
                            value={formData.stok_uom || ""}
                            maxLength={5}
                            disabled
                            onChange={(e) => handleChange("formData", "stok_uom", e.target.value, rowIndex, e)}

                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="number"
                            required
                            step="0.00001"
                            name="qty_acp_in_pur_um"
                            value={
                              Number.isFinite(Number(data.qty_acp_in_pur_um))
                                ? Number(data.qty_acp_in_pur_um).toFixed(5)
                                : ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              handleChange("formDetailData", "qty_acp_in_pur_um", val, rowIndex, e);
                            }}
                            onBlur={(e) => {
                              if (formStatus === 'Insert' || formStatus === 'Update') {
                                const fixedValue = Number(parseFloat(e.target.value || 0).toFixed(5));
                                //validateAndFormatNumber(fixedValue)
                                handleChange("formDetailData", "qty_acp_in_pur_um", fixedValue, rowIndex, e);

                                // Recalculate dependent fields
                                const updatedRow = { ...data, qty_acp_in_pur_um: fixedValue };
                                const { qty_ok_in_stk_um, qty_payment } = handleQtyStk(updatedRow);
                                if (!qty_ok_in_stk_um && !qty_payment) return;

                                const updateIdx = focusedRowIndex !== -1 ? focusedRowIndex : rowIndex;
                                handleChange("formDetailData", "qty_ok_in_stk_um", qty_ok_in_stk_um, updateIdx);
                                handleChange("formDetailData", "qty_payment", qty_payment, updateIdx);

                                // Deviation check
                                if (!isDvtnChecked) {
                                  (async () => {
                                    const response = await callProcDvtnCheck();
                                    const deviationStatus = response?.deviation_test || "N";

                                    if (deviationStatus !== "N") {
                                      const userConfirmed = window.confirm("Deviation exists, clear through Deviation");
                                      if (userConfirmed) {
                                        await showDeviationModal({
                                          ...updatedRow,
                                          deviation_test: deviationStatus,
                                        });
                                      } else {
                                        handleChange("formDetailData", "DEV_NO", null, rowIndex);
                                        handleChange("formDetailData", "DEV_QTY", null, rowIndex);
                                      }
                                    }
                                    setIsDvtnChecked(true);
                                  })();
                                }
                              }

                            }}
                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="pur_uom"
                            value={formData.pur_uom || ""}
                            maxLength={5}
                            disabled
                            onChange={(e) => handleChange("formData", "pur_uom", e.target.value, rowIndex, e)}

                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="number"
                            step="0.00001"
                            name="qty_ok_in_stk_um"
                            //value={data.qty_ok_in_stk_um ?? ""}
                            value={
                              Number.isFinite(Number(data.qty_ok_in_stk_um))
                                ? Number(data.qty_ok_in_stk_um).toFixed(5)
                                : ""
                            }
                            //  inputProps={{ max: 9999999999.99999 }}
                            onChange={(e) =>
                              handleChange(
                                "formDetailData",
                                "qty_ok_in_stk_um",
                                e.target.value,
                                rowIndex,
                                e
                              )
                            }
                            onBlur={(e) => {
                              const formattedValue = parseFloat(e.target.value || 0).toFixed(5);

                              handleChange(
                                "formDetailData",
                                "qty_ok_in_stk_um",
                                formattedValue,
                                rowIndex
                              );


                              const result = handleQtyStk1(data) || {};
                              const {
                                qty_converted = 0,
                                movtkt_qty = 0,
                                qty_payment = 0,
                                material_fr = 0,
                                qty_ets = 0,
                              } = result;

                              handleChange("formDetailData", "qty_converted", qty_converted || 0, rowIndex);
                              handleChange("formDetailData", "movtkt_qty", movtkt_qty || 0, rowIndex);

                            }}
                          />

                        </td>

                        <td className="table_cell">
                          <TextField
                            type="text"
                            // required
                            name="stk_um"
                            value={formData.stk_um || ""}
                            maxLength={5}
                            disabled
                            onChange={(e) => handleChange("formData", "stk_um", e.target.value, rowIndex, e)}

                          />
                        </td>

                        <td className="table_cell">
                          <TextField
                            type="number"
                            step="0.001"
                            name="qty_rejd"
                            // value={data.qty_rejd ?? ""}
                            value={
                              Number.isFinite(Number(data.qty_rejd))
                                ? Number(data.qty_rejd).toFixed(5)
                                : ""
                            }
                            inputProps={{ max: 9999999999.999 }}
                            onChange={(e) =>
                              handleChange("formDetailData", "qty_rejd", e.target.value, rowIndex, e)
                            }
                            onBlur={(e) => {
                              let qtyRejd = parseFloat(e.target.value || 0);

                              if (qtyRejd < 0) {
                                toast.error("Rejected quantity cannot be negative");
                                return;
                              }
                              const formattedValue = qtyRejd.toFixed(3);
                              handleChange("formDetailData", "qty_rejd", formattedValue, rowIndex);
                            }}
                          />

                        </td>

                        <td className="table_cell">
                          <TextField
                            type="number"
                            step="0.001"
                            name="qty_rejd_stk"
                            // value={data.qty_rejd_stk ?? ""}
                            value={
                              Number.isFinite(Number(data.qty_rejd_stk))
                                ? Number(data.qty_rejd_stk).toFixed(5)
                                : ""
                            }
                            inputProps={{ max: 9999999999.999 }}
                            onChange={(e) =>
                              handleChange("formDetailData", "qty_rejd_stk", e.target.value, rowIndex, e)
                            }
                            onBlur={(e) => {
                              let qtyRejdStk = parseFloat(e.target.value || 0);

                              if (qtyRejdStk < 0) {
                                toast.error("Rejected quantity cannot be negative");
                                return;
                              }

                              const formattedValue = qtyRejdStk.toFixed(3);
                              handleChange("formDetailData", "qty_rejd_stk", formattedValue, rowIndex);
                            }}
                          />

                        </td>
                        <td className="table_cell">
                          <ButtonUi />
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </Table> </div>
            </SimpleBar>
          </div>

        </Col>
      </Row>

      <Row>
        <Col xl={2}>
          <TextField
            type="number"
            label="Processing Fault"
            step="0.001"
            name="qty_prc_flt_stk_um"
            value={
              formDetailData[focusedRowIndex]?.qty_prc_flt_stk_um !== null &&
                formDetailData[focusedRowIndex]?.qty_prc_flt_stk_um !== undefined
                ? Number(formDetailData[focusedRowIndex].qty_prc_flt_stk_um).toFixed(3)
                : ""
            }
            inputProps={{ max: 9999999999.99999 }}
            onChange={(e) =>
              handleChange(
                "formDetailData",
                "qty_prc_flt_stk_um",
                e.target.value,
                focusedRowIndex
              )
            }
            onBlur={(e) => {
              const value = parseFloat(e.target.value || 0).toFixed(5);
              handleChange("formDetailData", "qty_prc_flt_stk_um", value, focusedRowIndex);

              const currentRow = formDetailData[focusedRowIndex];
              const result = qtyprc(currentRow);
              if (!result) return;
            }}
            disabled
          />


        </Col>

        <Col xl={2}>
          <TextField
            type="number"
            label="Material Fault"
            step="0.001"
            name="qty_mat_flt_in_stk_um"
            value={
              formDetailData[focusedRowIndex]?.qty_mat_flt_in_stk_um !== null &&
                formDetailData[focusedRowIndex]?.qty_mat_flt_in_stk_um !== undefined
                ? Number(formDetailData[focusedRowIndex].qty_mat_flt_in_stk_um).toFixed(3)
                : ""
            }
            max={999999999999.999}
            onChange={(e) =>
              handleChange(
                "formDetailData",
                "qty_mat_flt_in_stk_um",
                e.target.value,
                focusedRowIndex
              )
            }
            onBlur={() => {
              const currentRow = formDetailData[focusedRowIndex];
              const result = qtyMat(currentRow);
              if (!result) return;
            }}
            disabled
          />
        </Col>

        <Col xl={2}>
          <TextField
            type="number"
            label="Reworked Qty"
            step="0.001"
            name="qty_rework_in_stk_um"
            value={
              formDetailData[focusedRowIndex]?.qty_rework_in_stk_um !== null &&
                formDetailData[focusedRowIndex]?.qty_rework_in_stk_um !== undefined
                ? Number(formDetailData[focusedRowIndex].qty_rework_in_stk_um).toFixed(3)
                : ""
            }
            max={999999999999.999}
            onChange={(e) =>
              handleChange(
                "formDetailData",
                "qty_rework_in_stk_um",
                e.target.value,
                focusedRowIndex
              )
            }
            onBlur={() => {
              const currentRow = formDetailData[focusedRowIndex];
              const result = qtyRework(currentRow);
              if (!result) return;
            }}
          />
        </Col>



      </Row>

      <Row>
        <Col xl={2}>
          <TextField
            type="number"
            label="Payment Quantity"
            step="0.001"
            name="qty_payment"
            value={
              formDetailData[focusedRowIndex]?.qty_payment !== null &&
                formDetailData[focusedRowIndex]?.qty_payment !== undefined
                ? Number(formDetailData[focusedRowIndex].qty_payment).toFixed(3)
                : ""
            }
            max={999999999999.999}
            onChange={(e) =>
              handleChange(
                "formDetailData",
                "qty_payment",
                e.target.value,
                focusedRowIndex
              )
            }
            disabled
            onBlur={() => {
              const currentRow = formDetailData[focusedRowIndex];
              const result = handleQtyPayment(currentRow);
              if (!result) return;
            }}
          />
        </Col>



        <Col xl={2}>
          <TextField
            type="number"
            label="Scrap Quantity"
            step="0.00001"
            required
            name="qty_scrap_in_stk_um"
            value={
              formDetailData[focusedRowIndex]?.qty_scrap_in_stk_um !== null &&
                formDetailData[focusedRowIndex]?.qty_scrap_in_stk_um !== undefined
                ? Number(formDetailData[focusedRowIndex].qty_scrap_in_stk_um).toFixed(3)
                : ""
            }
            max={99999999.99999}
            onChange={(e) =>
              handleChange(
                "formDetailData",
                "qty_scrap_in_stk_um",
                e.target.value,
                focusedRowIndex
              )
            }
            onBlur={() => {
              if (formStatus === 'Insert' || formStatus === 'Update') {
                const currentRow = formDetailData[focusedRowIndex];
                const result = qtyScrap(currentRow);
                if (!result) return;
              }

            }}
            disabled
          />
        </Col>


        <Col xl={2}>
          <TextField
            type="number"
            label="Destructed Quantity"
            step="0.00001"
            name="qty_desctruct_in_stk_um"
            value={
              formDetailData[focusedRowIndex]?.qty_desctruct_in_stk_um !== null &&
                formDetailData[focusedRowIndex]?.qty_desctruct_in_stk_um !== undefined
                ? Number(formDetailData[focusedRowIndex].qty_desctruct_in_stk_um).toFixed(3)
                : ""
            }
            max={9999999999.99999}
            onChange={(e) =>
              handleChange(
                "formDetailData",
                "qty_desctruct_in_stk_um",
                e.target.value,
                focusedRowIndex
              )
            }
            onBlur={() => {
              const currentRow = formDetailData[focusedRowIndex];
              const result = qtyDestruct(currentRow);
              if (!result) return;
            }}
          // disabled
          />
        </Col>



        <Col xl={3}>
          <ButtonUi
            outline
            onClick={async () => {
              if (
                formStatus === "Insert" && !isdetailDataAutoFilled
              ) {
                const result = await callInsertFillParam();
                //console.log("result", result);

                if (!result) return;
                setIsDetailDataAutoFilled(true);
                //console.log("Data before setting in setFormDetailData:", result.tommiqciData);
                setFormDetailData(result.tommiqciData);
              }
            }}
          >
            <span>Fill Item Parameter</span>
          </ButtonUi>
        </Col>

      </Row>


      <Form id="form-item-data">
        <Row >
          <Col>

            <div className="table-title">

              {(formStatus === "Insert" || formStatus === "Update") && (

                <ButtonUi color="primary" className="add-action"
                  onClick={() => handleAddRow("formDtlInqData")}
                >
                  Add Row
                </ButtonUi>

              )}
            </div>


            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className='table-sticky-wrapper'>
                  <Table hover>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" || formStatus === "Update") && (
                          <th className="">Actions</th>
                        )}
                        {INQCIdetails.map((header, index) => (
                          <th
                            key={index}
                            data-required={header.required || false}
                            style={{
                              whiteSpace: "nowrap",
                              width: header.width,
                              minWidth: header.width,
                            }}
                          >
                            {header.label}
                            {header.isHelpExist && (<FcInfo title="Info" />)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formDtlInqData.map((data, rowIndex) => (
                        <tr key={rowIndex}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                          onBlur={() => setFocusedRowIndex(-1)}
                          style={{
                            border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"
                              }`,
                          }}
                        >
                          {
                            (formStatus === 'Insert' || formStatus === 'Update') &&
                            <td className="">
                              <RowAction
                                formStatus={formStatus}
                                canDelete={formDetailData.length > 1}
                                onDelete={() => handleDeleteRow("formDtlInqData", data, rowIndex)}
                              //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                              />
                            </td>
                          }
                          <td className=" table_cell">
                            <TextField
                              type="number"
                              // required
                              name="sample_size"
                              // value={data.sample_size || ""}
                              value={
                                Number.isFinite(Number(data.sample_size))
                                  ? Number(data.sample_size).toFixed(3)
                                  : ""
                              }
                              // maxLength={14}
                              onChange={(e) => handleChange("formDtlInqData", "sample_size", e.target.value, rowIndex)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value

                                  if (!validateAndFormatNumber(qty)) {
                                    e.target.focus();
                                    return;
                                  }

                                }
                              }}

                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              //  required
                              name="qc_rej"
                              // value={data.qc_rej || ""}
                              value={
                                Number.isFinite(Number(data.qc_rej))
                                  ? Number(data.qc_rej).toFixed(3)
                                  : ""
                              }
                              maxLength={20}
                              // disabled
                              onChange={(e) => handleChange("formDtlInqData", "qc_rej", e.target.value, rowIndex)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value
                                  const currentRow = formDtlInqData[focusedRowIndex]
                                  const result = validateQcRejection(currentRow)
                                  if (!result) return;

                                  if (!validateAndFormatNumber(qty)) {
                                    e.target.focus();
                                    return;
                                  }

                                }
                              }}


                            />
                          </td>
                          <td className="table_cell">
                            <TextField

                              type="text"
                              required
                              name="defect_code"
                              value={data.defect_code || ""}
                              // disabled
                              maxLength={14}
                              onChange={(e) => handleChange("formDtlInqData", "defect_code", e.target.value, rowIndex, e)}
                              onDoubleClick={() => handleDoubleClick("defect", defectHelpListHeader)}


                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              //  required
                              name="defect_desc"
                              value={data.defect_desc || ""}
                              maxLength={30}
                              disabled
                              onChange={(e) => handleChange("formDtlInqData", "defect_desc", e.target.value, rowIndex, e)}

                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              //  required
                              name="spec_no"
                              value={data.spec_no || ""}
                              maxLength={2}
                              // disabled
                              onChange={(e) => handleChange("formDtlInqData", "spec_no", e.target.value, rowIndex, e)}
                              onDoubleClick={() => handleDoubleClick("spec", specHelpListHeader)}


                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="spec_desc"
                              value={data.spec_desc || ""}
                              maxLength={30}
                              disabled
                              onChange={(e) => handleChange("formDtlInqData", "spec_desc", e.target.value, rowIndex, e)}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="inspection_mode"
                              value={data.inspection_mode || ""}
                              maxLength={30}
                              onChange={(e) => handleChange("formDtlInqData", "inspection_mode", e.target.value, rowIndex, e)}
                              disabled


                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="obs_red1"
                              value={data.obs_red1 || ""}
                              maxLength={100}
                              onChange={(e) => handleChange("formDtlInqData", "obs_red1", e.target.value, rowIndex, e)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value
                                  const currentRow = formDtlInqData[focusedRowIndex]
                                  const result = validateQcRejection(currentRow)
                                  if (!result) return;



                                }
                              }}

                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="obs_red2"
                              value={data.obs_red2 || ""}
                              maxLength={100}
                              onChange={(e) => handleChange("formDtlInqData", "obs_red2", e.target.value, rowIndex, e)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value
                                  const currentRow = formDtlInqData[focusedRowIndex]
                                  const result = validateQcRejection(currentRow)
                                  if (!result) return;

                                  if (!validateAndFormatNumber(qty)) {
                                    e.target.focus();
                                    return;
                                  }

                                }
                              }}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="obs_red3"
                              value={data.obs_red3 || ""}
                              maxLength={100}
                              onChange={(e) => handleChange("formDtlInqData", "obs_red3", e.target.value, rowIndex, e)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value
                                  const currentRow = formDtlInqData[focusedRowIndex]
                                  const result = validateQcRejection(currentRow)
                                  if (!result) return;

                                  if (!validateAndFormatNumber(qty)) {
                                    e.target.focus();
                                    return;
                                  }

                                }
                              }}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="obs_red4"
                              value={data.obs_red4 || ""}
                              maxLength={100}
                              onChange={(e) => handleChange("formDtlInqData", "obs_red4", e.target.value, rowIndex, e)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value
                                  const currentRow = formDtlInqData[focusedRowIndex]
                                  const result = validateQcRejection(currentRow)
                                  if (!result) return;

                                  if (!validateAndFormatNumber(qty)) {
                                    e.target.focus();
                                    return;
                                  }

                                }
                              }}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="obs_red5"
                              value={data.obs_red5 || ""}
                              maxLength={100}
                              onChange={(e) => handleChange("formDtlInqData", "obs_red5", e.target.value, rowIndex, e)}
                              onBlur={(e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {
                                  const qty = e.target.value
                                  const currentRow = formDtlInqData[focusedRowIndex]
                                  const result = validateQcRejection(currentRow)
                                  if (!result) return;

                                  if (!validateAndFormatNumber(qty)) {
                                    e.target.focus();
                                    return;
                                  }

                                }
                              }}

                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="judgement"
                              value={data.judgement || ""}
                              maxLength={2000}
                              onChange={(e) => handleChange("formDtlInqData", "judgement", e.target.value, rowIndex, e)}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="rejc_reason"
                              value={data.rejc_reason || ""}
                              maxLength={2000}
                              onChange={(e) => handleChange("formDtlInqData", "rejc_reason", e.target.value, rowIndex, e)}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="disposition"
                              value={data.disposition || ""}
                              maxLength={2000}
                              onChange={(e) => handleChange("formDtlInqData", "disposition", e.target.value, rowIndex, e)}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="nc_ref_no"
                              value={data.nc_ref_no || ""}
                              maxLength={2000}
                              onChange={(e) => handleChange("formDtlInqData", "nc_ref_no", e.target.value, rowIndex, e)}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="actuals"
                              value={data.actuals || ""}
                              maxLength={100}
                              onChange={(e) => handleChange("formDtlInqData", "actuals", e.target.value, rowIndex, e)}

                            />
                          </td>

                          <td className="table_cell">
                            <TextField
                              type="text"
                              // required
                              name="remarks"
                              value={data.remarks || ""}
                              maxLength={4000}
                              onChange={(e) => handleChange("formDtlInqData", "remarks", e.target.value, rowIndex, e)}

                            />
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </Table> </div>
              </SimpleBar>
            </div>

          </Col>
        </Row>
      </Form>
      <Row className='mt-1'>
        <Col>
        </Col>

        <Col className='m-auto'>
          <ButtonUi outline className="secondary"
            onClick={async () => {
              // Switch to tab 3
              setActiveTab(2);

              // Only call function if conditions are met
              if (formStatus === "Update" && !isdetailDataAutoFilled) {
                try {
                  const result = await callInsertFillBatch();
                  //console.log("result", result);

                  if (!result) return;

                  setIsDetailDataAutoFilled(true);
                  //console.log(
                  //   "Data before setting in setFormBatchData:",
                  //   result.tommBatchData
                  // );
                  setBatchData(result.tommBatchData);
                } catch (error) {
                  console.error("Error filling batch details:", error);
                }
              }
            }}
          >
            <span>Fill Batch Details</span>
          </ButtonUi>


        </Col>

      </Row>


    </>
  )
}

export default IncomingQualityInspectINQCI
