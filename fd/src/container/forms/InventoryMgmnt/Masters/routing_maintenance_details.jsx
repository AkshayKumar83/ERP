import React, { useEffect, useState } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { batchHelpListHeader, handleValidateBatchField, physicalInvBatch } from "./physical_Inventory_helper";
import { FcInfo } from "react-icons/fc";
import { inputItCodeHelpListHeader, routingDetailsHeader } from "./routing_maintenance_helper";


const RoutingMaintenanceDetails = ({  
  detailData,
  setDetailData,
  formStatus,
  handleChange,
  triggerAddRow,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
   handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
}) => {


  const makeFocusOnTableRow = (rowIndex) => {
    setFocusedRowIndex(rowIndex);
  };

  const handleDoubleClick = (field, rowIndex) => {
    if (["Insert",'Update'].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(inputItCodeHelpListHeader);
      handleHelpList(true, rowIndex);
    }
  };




  
  return (
    <>  
    
    <Row className="mb-2">
            <Col  xl={12}>
              <Form id="route-details" className="">
                <div className="table-title">
                  <span>Route Details</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi
                      color="primary"
                      className="add-action"
                       onClick={() => triggerAddRow("detail")}
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
                          {routingDetailsHeader.map((header, index) => (
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
                    {detailData &&
                      detailData
                        .filter(row => row.isStatus !== "deleted")  
                        .map((data, rowIndex) => (
                          <tr
                            key={rowIndex}
                            onFocus={() => makeFocusOnTableRow(rowIndex,data.id)}
                            tabIndex={0}
                              style={{
                                border: `${
                                  rowIndex === focusedRowIndex
                                    ? "2px solid black"
                                    : "none"
                                }`,
                              }}
                            >
                              {(formStatus === "Insert" ||
                                formStatus === "Update") && (
                                <td className="sticky-column left">
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={detailData.length > 1}
                                    onDelete={() =>  handleDelete("detail", rowIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              <td className="table_cell">
                                <TextField
                                  type="text"
                                  name="input_it_code"
                                  value={data?.input_it_code || ""}
                                  maxLength={20}
                                  onChange={(e) => handleChange("detail", "input_it_code", e.target.value, rowIndex, e) }
                                   onDoubleClick={() => handleDoubleClick('inputItCode', rowIndex)}
                                   required
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="it_name"
                                 value={data?.it_name || ""}
                               onChange={(e) => handleChange("detail", "it_name", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="it_bom_um"
                                 value={data?.it_bom_um || ""}
                                maxLength={4}
                                onChange={(e) => handleChange("detail", "it_bom_um", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="usage"
                                value={data?.usage ?? 0}
                               onChange={(e) => handleChange("detail", "usage", e.target.value, rowIndex, e) }
                               required
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="rej_perc"
                                value={data?.rej_perc ?? 0}
                                onChange={(e) => handleChange("detail", "rej_perc", e.target.value, rowIndex, e) }
                                required
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

          </>
  )
}

export default RoutingMaintenanceDetails