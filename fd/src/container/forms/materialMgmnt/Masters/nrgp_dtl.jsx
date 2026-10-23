import React from "react";
import { Col, Form, Row, Table } from "reactstrap";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import ButtonUi from "../../../../components/basic/button";
import { FcInfo } from "react-icons/fc";
import toast from "react-hot-toast";
import { dtlHeaders,itemHelpListHeaderNrgp } from "./nrgp_helper";

const NrgpDtl = ({
  formData,
  detailData,
  batchData,
  formStatus,
  openHelpList,
  handleChange,
  handleDelete,
  focusedDtlRowIndex,
  focusedBatchRowIndex,
  handleAddDtlRow,
  handleAddBatchRow,
  handleDeleteRow,
  setFocusedDtlRowIndex,
  setFocusedBatchRowIndex,
  makeFocusOnTableRow,
  getValidateData,
  otherQueryPera,
  validateRequiredField
}) => {

  const handleQtyError = (data) => {
    console.log(data);
    if (data === null || data === undefined || data === "") {
      return;
    }

    if (data === "rate") {
      if (data < 0) {
        toast.error("This value can not be negative");
        return true;
      }
    }

    if (data < 0) {
      toast.error("This value can not be negative");
      return true;
    }
    if (data === 0) {
      toast.error("This value can not be zero");
      return true;
    }

    return false;
  };

  // total amount
  const totalAmt = (data) => {
    if (!data || data.length === 0) return 0;

    let total = 0;
    data.forEach((item) => {
      total += parseFloat(item.amount) || 0;
    });

    return Number(total.toFixed(2))
  };

  // total gst  

  const totalGst = Number(formData.t_igst_amt) + Number(formData.t_sgst_amt) + Number(formData.t_ugst_amt) + Number(formData.t_cgst_amt)

  // gross total  

 const grossTotal = Number(
  (Number(totalGst) + Number(totalAmt(detailData))).toFixed(2)
);


  // total batch qty 

  const totalBatchQty = (data) => {
    if (!data || data.length === 0) return 0;

    let total = 0;
    data.forEach((item) => {
      total += parseFloat(item.qty_desp) || 0;
    });

    return total.toFixed(2);
  };


  return (
    <>
      {/* table Section start here*/}
      <Form id="nrgp-dtl-data-form">
        <Row className="">
          <Col xl={12} className="">

            <div className="table-title">
              {/* <span>Source User</span> */}
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={handleAddDtlRow}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>

            {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
            <div className="table-wrapper-v3">
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && <th>Actions</th>}
                        {dtlHeaders.map((header, index) => (
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
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                          style={{
                            border: `${rowIndex === focusedDtlRowIndex
                              ? "2px solid black"
                              : "none"
                              }`,
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={detailData.length > 0}
                                  //onDelete={() => handleDelete(rowIndex)} 
                                  onDelete={() =>
                                    handleDeleteRow("formDetailTable", rowIndex)
                                  }
                                />
                              </td>
                            )}
                          <td>
                            <TextField
                              type="text"
                              required
                              name="it_code"
                              value={data.it_code || ""}
                              onChange={(e) => handleChange(e, "it_code", e.target.value, rowIndex, "rmgpDtlData")}
                              onDoubleClick={(e) =>
                                openHelpList("it_code", itemHelpListHeaderNrgp, rowIndex)

                              }
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {
                                  const item = e.target.value;
                                  validateRequiredField(e, "It code")

                                  if (!item) {
                                    return;
                                  }


                                  const isValid = await getValidateData(
                                    "it_code",
                                    item,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="text"
                              // required
                              name="it_name"
                              value={data.it_name}
                              onChange={(e) => handleChange(e, "it_name", e.target.value, rowIndex, "rmgpDtlData")}
                            />
                          </td>
                          {/* <td>
                            <TextField
                              type="text"
                              //required
                              name="it_hsn_sac_code"
                              value={data.it_hsn_sac_code}
                              onChange={(e) => handleChange(e, "it_hsn_sac_code", e.target.value, rowIndex, "rmgpDtlData")}
                            />
                          </td> */}
                          <td>
                            <TextField
                              type="text"
                              // required
                              name="um_code"
                              value={data.um_code || ""}
                              onChange={(e) => handleChange(e, "um_code", e.target.value, rowIndex, "rmgpDtlData")}
                              maxLength={4}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                             // required
                              name="store_stock"
                              value={data.store_stock}
                              onChange={(e) => handleChange(e, "store_stock", e.target.value, rowIndex, "rmgpDtlData")}
                              disabled
                            />
                          </td>
                           <td>
                            <TextField
                              type="number"
                              required
                              name="rate"
                              value={data.rate}
                              // maxLength
                              onChange={(e) => handleChange(e, "rate", e.target.value, rowIndex, "rmgpDtlData")}
                              onBlur={async (e) => {
                                if (formStatus === "Update" || formStatus === "Insert") {

                                  const value = e.target.value;

                                  if (value === "" || value === null || value === undefined) return;

                                  const rate = parseFloat(value);
                                  if (isNaN(rate)) return;

                                  if (rate < 0) {
                                    toast.error("This rate field can not be negative");
                                    e.target.focus();
                                    return;
                                  }

                                  // get qty from current row
                                  const qty = parseFloat(data.qty_desp) || 0;

                                  //calculate amount
                                  let amount = 0;
                                  if (rate > 0) {
                                    amount = qty * rate;
                                  }

                                  console.log("qty:", qty, "rate:", rate, "amount:", amount);

                                  handleChange(
                                    e,
                                    "amount",
                                    amount.toFixed(2),
                                    rowIndex,
                                    "rmgpDtlData"
                                  );
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              required
                              name="qty_desp"
                              value={data.qty_desp || ""}
                              onChange={(e) => handleChange(e, "qty_desp", e.target.value, rowIndex, "rmgpDtlData")}
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {

                                  const value = e.target.value;

                                  if (value === "" || value === null || value === undefined) return;

                                  const quantity = parseFloat(value);
                                  if (isNaN(quantity)) return;

                                  // Round to 2 decimal places and set the value
                                  handleChange(
                                    e,
                                    "qty_desp",
                                    quantity.toFixed(2),
                                    rowIndex,

                                  );

                                  // Local validation
                                  const hasLocalError = handleQtyError(quantity);
                                  if (hasLocalError) {
                                    e.target.focus();
                                    return;
                                  }

                                  // validateRequiredField(e, "It code")

                                  if (!detailData[focusedDtlRowIndex]?.qty_desp) {
                                    return
                                  }
                                  const qty = e.target.value;
                                  const isValid = await getValidateData(
                                    "qty_desp",
                                    qty,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                         
                          {/* <td>
                            <TextField
                              type="number"
                              required
                              name="amount"
                              value={data.amount}
                              // maxLength
                              onChange={(e) => handleChange(e, "amount", e.target.value, rowIndex, "rmgpDtlData")}
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {

                                  // validateRequiredField(e, "Batch No")


                                  const amount = e.target.value;

                                  if (!amount) {
                                    return
                                  }
                                  const isValid = await getValidateData(
                                    "amount",
                                    amount,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>

          </Col>
        </Row>
        {/* table Section end here*/}

        {/* Batch table Section start here*/}
        {/* <Row className="">
          <Col xl={9} className="">

            <div className="table-title">
           
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi
                  color="primary"
                  className="add-action"
                  onClick={handleAddBatchRow}
                >
                  Add Row
                </ButtonUi>
              )}
            </div>

            <div
              className="table-wrapper-v3"
              style={{ height: "100px", maxHeight: "100px" }}
            >
              <SimpleBar forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                  <Table>
                    <thead>
                      <tr>
                        {(formStatus === "Insert" ||
                          formStatus === "Update") && <th>Actions</th>}
                        {batchHeaders.map((header, index) => (
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
                            {header.required && (
                              <span className="required-asterisk">*</span>
                            )}
                            {header.isHelpExist && <FcInfo title="Info" />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {batchData.map((data, rowIndex) => (
                        <tr
                          key={rowIndex}
                          onFocus={() =>
                            makeFocusOnTableRow(rowIndex, data.sr_no)
                          }
                          style={{
                            border: `${rowIndex === focusedBatchRowIndex
                              ? "2px solid black"
                              : "none"
                              }`,
                          }}
                          tabIndex={0}
                        >
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={batchData.length > 0}
                                 
                                  onDelete={() =>
                                    handleDeleteRow("formBatchTable", rowIndex)
                                  }
                                />
                              </td>
                            )}
                          <td>
                            <TextField
                              type="text"
                             
                              name="batch_no"
                              value={data.batch_no || ""}
                              onChange={(e) => { handleChange(e, "batch_no", e.target.value, rowIndex, "rmgpBatchData") }}
                              onDoubleClick={(e) =>
                                openHelpList("batch", batchHelpListHeaderRmgp, rowIndex)

                              }

                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {

                                  const batch = e.target.value;

                                  if (!batch) {
                                    return
                                  }

                                  const isValid = await getValidateData(
                                    "batch_no",
                                    batch,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}

                            />
                          </td>
                          <td>
                            <TextField
                              type="date"
                              //required
                              name="batch_date"
                              value={data.batch_date || ""}
                              onChange={(e) => handleChange(e, "batch_date", e.target.value, rowIndex, "rmgpBatchData")}
                              disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              //required
                              name="batch_store_qty"
                              value={data.batch_store_qty || ""}
                              onChange={(e) => handleChange(e, "batch_store_qty", e.target.value, rowIndex, "rmgpBatchData")}
                              disabled
                            />
                          </td>
                          <td>
                            <TextField
                              type="text"
                              // required
                              name="loca_rack_bin_desc"
                              value={data.loca_rack_bin_desc || ""}
                              // maxLength
                              onChange={(e) => handleChange(e, "loca_rack_bin_desc", e.target.value, rowIndex, "rmgpBatchData")}
                              onBlur={async (e) => {
                                if (
                                  formStatus === "Update" ||
                                  formStatus === "Insert"
                                ) {

                                  const physical = e.target.value;

                                  if (!physical) {
                                    return
                                  }

                                  const isValid = await getValidateData(
                                    "loca_rack_bin_desc",
                                    physical,
                                    otherQueryPera,
                                    rowIndex
                                  );

                                  if (!isValid) {
                                    e.target.focus();
                                  }
                                }
                              }}
                            />
                          </td>
                          <td>
                            <TextField
                              type="number"
                              // required
                              name="qty_desp"
                              value={data.qty_desp || ""}
                              onChange={(e) => handleChange(e, "qty_desp", e.target.value, rowIndex, "rmgpBatchData")}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </SimpleBar>
            </div>
            <Row>
              <Col xl={2} className="ms-auto ms-4">
                <TextField
                  type="number"
                  // label="Gross Total"
                  name="tot_batch_qty"
                  // value={batchData?.tot_batch_qty || ""} 
                  value={totalBatchQty(batchData, "tot_batch_qty")}
                  onChange={(e) => handleChange(e, "tot_batch_qty", e.target.value, null, "rmgpBatchData")}
                  disabled
                />
              </Col>
            </Row>

          </Col>
          <Col xl={3} className="mt-1">
            <Row className="ms-4">
              <Col xl={6} className="ms-4">
                <TextField
                  type="number"
                  label="Total"
                  name="total_amt"
                  //value={detailData?.total_amt || ""} 
                  value={totalAmt(detailData, "total_amt")}
                  onChange={(e) => handleChange(e, "total_amt", e.target.value, null, "rmgpDetailData")}
                  disabled
                />
              </Col>
            </Row>
            <Row className="ms-4">
              <Col xl={6} className="ms-4">
                <TextField
                  type="number"
                  label="Total GST"
                  name="total_gst"
                  //  value={detailData?.total_gst || ""} 
                  value={totalGst}
                  onChange={(e) => handleChange(e, "total_gst", e.target.value, null, "rmgpDetailData")}
                  disabled
                />
              </Col>
            </Row>
            <Row className="ms-4">
              <Col xl={6} className="ms-4">
                <TextField
                  type="number"
                  label="Gross Total"
                  name="gross_amt"
                  // value={formData?.gross_amt || ""} 
                  value={grossTotal}
                  onChange={(e) => handleChange(e, "gross_amt", e.target.value, null, "rmgpHeaderData")}
                  disabled
                />
              </Col>
            </Row>
          </Col>
        </Row> */}
        
      </Form>
    </>
  );
};

export default NrgpDtl;
