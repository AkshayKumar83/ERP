import React, { useEffect, useState } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { batchHelpListHeader, handleValidateBatchField, physicalInvBatch } from "./physical_Inventory_helper";
import { FcInfo } from "react-icons/fc";

const PhysicalInventoryBatch = ({batchData,setBatchData,formStatus,handleChange,
  triggerAddRow,handleDelete,focusedRowIndex,setFocusedRowIndex,setDetailData,detailData,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader}) => {

    const [totOkQty, setTotOkQty] = useState(0);
    const [totRejQty, setTotRejQty] = useState(0);

 useEffect(() => {
  if (!Array.isArray(batchData)) return;

  // Parse numbers safely (null/empty -> 0)
  const totalOk = batchData.reduce(
    (sum, row) => sum + (parseFloat(row.qty_ok) || 0),
    0
  );
  const totalRej = batchData.reduce(
    (sum, row) => sum + (parseFloat(row.qty_rej) || 0),
    0
  );

  // Update state with 3-decimal formatted values
  setTotOkQty(Number(totalOk.toFixed(3)));
  setTotRejQty(Number(totalRej.toFixed(3)));
}, [batchData]);

    const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = batchData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

    const handleDoubleClick = (field, rowIndex) => {
        if (['Insert','Update'].includes(formStatus)) {
          setHelpFor(field);
          setHelpListHeader(batchHelpListHeader);
          handleHelpList(true, rowIndex);
        }
      };

  return (
    <>
          <Row className="mb-2">
            <Col  xl={12}>
              <Form id="unit-master" className="">
                <div className="table-title">
                  <span>Physical Inv. Batch</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi
                      color="primary"
                      className="add-action"
                       onClick={() => triggerAddRow("batch")}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div>
                <div
                  className="table-wrapper-v3"
                  // style={{ height: "180px", maxHeight: "180px" }}
                >
                  <SimpleBar forceVisible="y" autoHide={false}>
                     <div className="table-sticky-wrapper" style={{ height: '120px', maxHeight: '120px' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <th
                              style={{ width: "80px" }}
                              className="sticky-column left"
                            >
                              Actions
                            </th>
                          )}
                          {physicalInvBatch.map((header, index) => (
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
                                {header.required && (
                             <span className='required-asterisk'>*</span>
                             )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {batchData &&
                          batchData.map((data, rowIndex) => (
                            <tr
                              key={rowIndex}
                              onFocus={() =>
                                makeFocusOnTableRow(rowIndex, data.id)
                              }
                              style={{
                                border: `${
                                  rowIndex === focusedRowIndex
                                    ? "2px solid black"
                                    : "none"
                                }`,
                              }}
                              tabIndex={0}
                            >
                              {(formStatus === "Insert" ||
                                formStatus === "Update") && (
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={batchData.length > 0}
                                    onDelete={() =>  handleDelete("batch", rowIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              <td className="table_cell">
                                <TextField
                                  type="text"
                                  name="batch_no"
                                  value={data?.batch_no || ""}
                                  maxLength={60}
                                  onChange={(e) =>  handleChange(  "batch_no",  e.target.value, e, "batch", rowIndex)}
                                  onDoubleClick={() => handleDoubleClick('batch', rowIndex)}
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="date"
                                name="batch_date"
                                 value={data?.batch_date || ""}
                                onChange={(e) =>handleChange("batch_date", e.target.value, e, "batch", rowIndex)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="tag_no"
                                 value={data?.tag_no || ""}
                                maxLength={50}
                                onChange={(e) =>handleChange("tag_no", e.target.value, e, "batch", rowIndex)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="qty_ok"
                                value={data?.qty_ok ?? 0}
                                onChange={(e) =>handleChange("qty_ok", e.target.value, e, "batch", rowIndex)}
                                onBlur={(e)=>handleValidateBatchField(e, formStatus, batchData, setBatchData, rowIndex)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="qty_rej"
                                value={data?.qty_rej ?? 0}
                                onChange={(e) =>handleChange("qty_rej", e.target.value, e, "batch", rowIndex)}
                                onBlur={(e)=>handleValidateBatchField(e, formStatus, batchData, setBatchData, rowIndex)}
                                onKeyDown={(e) => {
                                if (["Enter", "Tab"].includes(e.key)) {
                                  handleValidateBatchField(e, formStatus, batchData, setBatchData, rowIndex);
                                }
                              }}
                              />
                            </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                    </div>
                  </SimpleBar>
                </div>
              </Form>
            </Col>
          </Row>
          <Row className="d-flex justify-content-end mt-2">
  <Col xl={2}>
    <TextField
      label="Total OK Qty"
      type="number"
      value={totOkQty.toFixed(3)}   // 👈 always 3 decimals
      disabled
    />
  </Col>

  <Col xl={2}>
    <TextField
      label="Total Rej Qty"
      type="number"
      value={totRejQty.toFixed(3)}  // 👈 always 3 decimals
      disabled
    />
  </Col>
</Row>

    </>
  );
};

export default PhysicalInventoryBatch