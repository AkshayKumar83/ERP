import React, { useEffect, useState } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { FcInfo } from "react-icons/fc";
import { routingToolsHeader, toolItCodeHelpListHeader } from "./routing_maintenance_helper";
import MuiTextArea from "../../../../components/basic/muiTextArea";
import MuiTextField from "../../../../components/basic/muiTextField";


const RoutingMaintenanceTools = ({toolData,setToolData,formStatus,handleChange,
  triggerAddRow,handleDelete,focusedRowIndex,setFocusedRowIndex , handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,headerData

  }) => {

  const handleDoubleClick = (field, rowIndex) => {
    if (["Insert",'Update'].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(toolItCodeHelpListHeader);
      handleHelpList(true, rowIndex);
    }
  };


  const makeFocusOnTableRow = (rowIndex) => {
  setFocusedRowIndex(rowIndex);
};






  return (
    <>  
    <Row className="mt-3 d-flex justify-content-center">
   <Col xl={3}>
        <MuiTextField
            type="text"
            label="Route Sheet No."
              maxLength={20}
            name="route_no"
            value={headerData?.route_no}
            onChange={(e) =>handleChange("header","route_no", e.target.value, 0, e) }
            disabled
          />
      </Col>
</Row>

    <Row className=" mt-3mb-2">
            <Col  xl={12}>
              <Form id="route-tools" className="">
                <div className="table-title">
                  <span>Tools Details</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi
                      color="primary"
                      className="add-action"
                       onClick={() => triggerAddRow("tool")}
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
                     <div className="table-sticky-wrapper" style={{ height: '180px', maxHeight: '180px' }}>
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
                          {routingToolsHeader.map((header, index) => (
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
                        {toolData &&
                          toolData.filter(row => row.isStatus !== "deleted")  
                        .map((data, rowIndex) => (
                            <tr
                              key={rowIndex}
                              onFocus={() =>
                                makeFocusOnTableRow(rowIndex)
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
                                    canDelete={toolData.length > 1}
                                    onDelete={() =>  handleDelete("tool", rowIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              <td className="table_cell">
                                <TextField
                                  type="text"
                                  name="it_code"
                                  value={data?.it_code || ""}
                                  maxLength={20}
                                  onChange={(e) =>handleChange("tool", "it_code", e.target.value, rowIndex, e)}
                                  onDoubleClick={() => handleDoubleClick('toolItCode', rowIndex)}
                                  required
                               
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="it_name"
                                 value={data?.it_name || ""}
                                onChange={(e) => handleChange("tool", "it_name", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="uom"
                                 value={data?.uom || ""}
                                maxLength={50}
                                onChange={(e) =>handleChange("tool", "uom", e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="no_off"
                                value={data?.no_off}
                                onChange={(e) => handleChange("tool", "no_off", e.target.value, rowIndex, e)}
                                // onBlur={(e)=>handleValidateBatchField(e, formStatus, toolData, settoolData, rowIndex)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="date"
                                name="wef_date"
                                value={data?.wef_date}
                                onChange={(e) => handleChange("tool", "wef_date", e.target.value, rowIndex, e)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="tool_no_years"
                                value={data?.tool_no_years}
                                onChange={(e) =>handleChange("tool", "tool_no_years", e.target.value, rowIndex, e)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="tool_cost"
                                value={data?.tool_cost}
                               onChange={(e) =>handleChange("tool", "tool_cost", e.target.value, rowIndex, e)}
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

<Row className="mt-3">
   <Col xl={12}>
         <MuiTextArea
        label="Remarks"
        name='remarks'
        value={toolData[focusedRowIndex]?.remarks}
        onChange={(e) =>handleChange("tool", "remarks", e.target.value, focusedRowIndex, e)}
        rows={2}
        maxLength={200}
        fullWidth
      />
      </Col>
</Row>

          </>
  )
}

export default RoutingMaintenanceTools