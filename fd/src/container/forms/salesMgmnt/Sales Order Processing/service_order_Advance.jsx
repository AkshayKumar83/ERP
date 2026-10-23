import React, { useState } from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import Checkbox from '../../../../components/basic/checkbox'
import RadioGroup from '../../../../components/basic/radioGroup'

const ServiceOrderAdvance =({
  formData = {},
  formStatus = "",
  advanceDetailData = [{}],
  handleChange = () => {},
  handleChangeTab = () => {},
  controlFieldData = {},
  handleAddRow=()=>{},
}) => {


      const [focusedRowIndex, setFocusedRowIndex] = useState(-1)
    
      const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = advanceDetailData.find((entry) => entry.sr_no === id)
        setFocusedRowIndex(rowIndex)
      }
    
      const triggerAddRow = () => {
        // Implement add row functionality
        handleAddRow()
      }
    
      const handleDelete = (data, index) => {
        // Implement delete row functionality
      }
    
      const handleUpdate = (data) => {
        // Implement update row functionality
      }
  
  return (
    <React.Fragment>
      <Card className="mb-2">
        <Form id="sales-order-item-desc">
          <Row className="py-1 px-3">
            <Col xl={2}>
              <TextField
                type="text"
                label="Item Code"
                value={formData.it_code || ""}
                onChange={(e) => handleChange("it_code", e.target.value, null, e, "head")}
                disabled
              />
            </Col>
            <Col xl={6}>
              <TextField
                type="text"
                label="Item Description"
                value={formData.it_desc || ""}
                onChange={(e) => handleChange("it_desc", e.target.value, null, e, "head")}
                disabled
              />
            </Col>
          </Row>
          <Row className="py-1 px-3">
            <Col xl={2}>
              <TextField
                type="text"
                label="Customer Item Code"
                value={formData.cus_it_code || ""}
                onChange={(e) => handleChange("cus_it_code", e.target.value, null, e, "head")}
                disabled
              />
            </Col>
            <Col xl={6}>
              <TextField
                type="text"
                label="Customer Item Description"
                value={formData.cus_it_desc || ""}
                onChange={(e) => handleChange("cus_it_desc", e.target.value, null, e, "head")}
                disabled
              />
            </Col>
          </Row>
        </Form>
      </Card>

      <Form id="sales-order-item-detail">
        <div className="table-title d-flex justify-content-end">
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
              Add Row
            </ButtonUi>
          )}
        </div>
        <div className="table-container" >
          <SimpleBar forceVisible="y" autoHide={false}>
            <Table bordered responsive>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="sticky-column left" style={{ width: "5%" }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {advanceDetailData.map((data, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    <tr
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                      style={{border: rowIndex === focusedRowIndex ? "2px solid black" : "none",}}
                      tabIndex={0}
                    >
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="sticky-column left">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={advanceDetailData.length > 1}
                            onDelete={() => handleDelete(data, rowIndex)}
                            onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                          />
                        </td>
                      )}
                      <td>
                        <div className="d-flex flex-column p-1">
                          {/* First Row Content */}
                          <div className="d-flex flex-row px-2">
                            <div className="col-xl-2 d-flex align-items-center" style={{ maxWidth: "2rem" }}>
                              <Checkbox
                                checked={controlFieldData?.pointer1 || false}
                                onChange={(e) => handleChange("pointer1", e.target.checked, rowIndex, e)}
                              />
                            </div>
                            <div className="col-xl-3 d-flex align-items-center" style={{ minWidth: "40%" }}>
                              <RadioGroup
                                className="button-group-wrapper box-border"
                                options={[
                                  { text: "Single Adjustment", value: "S" },
                                  { text: "Replica Adjustment", value: "R" },
                                ]}
                                onChange={(e) => handleChange("installment_type", e.target.value, rowIndex, e)}
                                checked={data.installment_type || ""}
                              />
                            </div>
                            <div className="col-xl-3 d-flex align-items-center">
                              <RadioGroup
                                className="button-group-wrapper box-border"
                                options={[
                                  { text: "Rate/Pc", value: "R" },
                                  { text: "%age", value: "P" },
                                  { text: "Time", value: "T" },
                                ]}
                                onChange={(e) => handleChange(`installment_sub_type`, e.target.value, rowIndex, e)}
                                checked={data.installment_sub_type || ""}
                              />
                            </div>
                            <div className="col-xl-3 d-flex align-items-center">
                              <RadioGroup
                                className="button-group-wrapper box-border"
                                options={[
                                  { text: "Deduction", value: "D" },
                                  { text: "Extra Paid", value: "P" },
                                ]}
                                onChange={(e) => handleChange(`ded_ex_paid`, e.target.value, rowIndex, e)}
                                checked={data.ded_ex_paid || ""}
                              />
                            </div>
                          </div>

                          {/* Second Row Inside the First Row (Additional Fields) */}
                          <div className="d-flex flex-row mt-1 px-2">
                            <div className="col-xl-3 d-flex align-items-center" style={{ width: "30%" }}>
                              <label className="me-2 text-end">Rate Per Unit</label>
                              <TextField
                                name="rate_per_unit"
                                value={data.rate_per_unit || ""}
                                onChange={(e) => handleChange("rate_per_unit", e.target.value, rowIndex, e)}
                                inpClass="flex-grow-1"
                              />
                            </div>
                            <div className="col-xl-3 d-flex align-items-center" style={{ width: "30%" }}>
                              <label className="me-2 text-end">Amount Limit</label>
                              <TextField
                                name="amount_limit"
                                value={data.amount_limit || ""}
                                onChange={(e) => handleChange("amount_limit", e.target.value, rowIndex, e)}
                                inpClass="flex-grow-1"
                              />
                            </div>
                            <div className="col-xl-3 d-flex align-items-center" style={{ width: "40%" }}>
                              <label className="me-2 text-end">Amount Deduction/Paid</label>
                              <TextField
                                name="amount_ded_paid"
                                value={data.amount_ded_paid || ""}
                                onChange={(e) => handleChange("amount_ded_paid", e.target.value, rowIndex, e)}
                                inpClass="flex-grow-1"
                              />
                            </div>
                          </div>

                          {/* Remarks Section */}
                          <div className="mt-1">
                            <Col className="d-flex" xl={11}>
                              <label style={{width: "95px", textAlign: "right", paddingRight: "8px",}} htmlFor="">Remarks</label>
                              <TextField
                                name="remarks"
                                value={data.remarks || ""}
                                onChange={(e) => handleChange(`remarks`, e.target.value, rowIndex, e)}
                                pClass="flex-grow-1"
                              />
                            </Col>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </SimpleBar>
        </div>
      </Form>
      
      <Row>
        <Col xl={2}>
          <ButtonUi color="primary" outline onClick={() => handleChangeTab("Main")}>
            Main Details
          </ButtonUi>
        </Col>
        <Col xl={2}>
          <ButtonUi color="primary" outline onClick={() => handleChangeTab("Items")}>
            Items
          </ButtonUi>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default ServiceOrderAdvance