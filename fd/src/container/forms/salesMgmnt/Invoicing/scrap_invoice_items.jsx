import React, { useState } from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap'
import SimpleBar from 'simplebar-react'
import { scrapInvItemsheader } from './scrap_invoice_helper'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import RadioGroup from '../../../../components/basic/radioGroup'

const ScrapInvItems = ({
  itemFormDetail=[{}],
  formControl={},
  formStatus,
  handleChange=()=>{},
  handleAddRow=()=>{},
  handleDelete=()=>{},
  handleUpdate=()=>{},
}) => {
    // Tracking Focus in Table Row
    const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
    const triggerAddRow = () => {
      handleAddRow()
    };
  
    const makeFocusOnTableRow = (rowIndex, id) => {
      const entry = itemFormDetail.find((entry) => entry.sr_no === id);
      setFocusedRowIndex(rowIndex);
    };

  return (
  <Form>
        {/* Table Header */}
        <div className="d-flex table-title justify-content-end gap-2">
            {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>Add Row</ButtonUi>
            )}
        </div>
        {/* Items Table */}
        <div className="table-container">
          <SimpleBar forceVisible="y" autoHide={false}>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="left sticky-column" style={{ width: "5%" }}>Actions</th>
                  )}
                   <th style={{ width: "15%" }}>{formControl?.doc_no|| 'Scrap Order'}</th>
                  {scrapInvItemsheader.map((header, index) => (
                    <th
                      key={index}
                      data-required={header.required || false}
                      style={{whiteSpace: "nowrap", width: header.width, minWidth: header.width}}
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itemFormDetail.map((data, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                    style={{border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,}}
                    tabIndex={0}
                  >
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <td className="">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={itemFormDetail.length > 1}
                          onDelete={() => handleDelete(data, rowIndex)}
                          onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                        />
                      </td>
                    )}
                    <td>
                      <TextField
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        onChange={(e) =>handleChange("doc_no", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        required
                        name="it_code"
                        value={data.it_code || ""}
                        onChange={(e) =>handleChange("it_code", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        disabled
                        name="it_desc"
                        value={data.it_desc || ""}
                        onChange={(e) =>handleChange("it_desc", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        type="number"
                        name="qty"
                        value={data.qty || ""}
                        disabled
                        onChange={(e) =>handleChange("qty", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        disabled
                        type="number"
                        name="rate"
                        value={data.rate || ""}
                        onChange={(e) =>handleChange("rate", e.target.value, rowIndex)}
                      />
                    </td>
                    <td>
                      <TextField
                        disabled
                        type="number"
                        name="basic_value"
                        value={data.rate || ""}
                        onChange={(e) =>handleChange("rate", e.target.value, rowIndex)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className='text-end pe-2'>
                    <div style={{display:'flex', justifyContent:'end'}}>
                      <ButtonUi>Discount</ButtonUi>
                    </div>
                  </td>
                  <td colSpan={1}>
                  <TextField
                    required
                    name="tot_qty"
                    value={formControl?.tot_qty || ""}
                    inpClass='bkg-yellow'
                    onChange={(e) =>handleChange("tot_qty", e.target.value, rowIndex)}
                  />
                  </td>
                  <td colSpan={2}>
                    <span style={{fontSize:'12px', fontWeight:'bold', letterSpacing:'2px'}}>A#=Accessories</span>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </SimpleBar>
        </div>
        <Row>
          <Col xl={6}>
            <Row className='d-flex flex-row gx-0'>
              <Col xl={3}>
                <TextField
                  name='cus_it_code'
                  label='Customer Item Code'
                  id="cus_it_code"
                  value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                  onChange={(e) =>handleChange("cus_it_code", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={9}>
                <TextField
                  name='cus_it_desc'
                  label='Customer Item Description'
                  disabled
                  value={itemFormDetail[focusedRowIndex]?.cus_it_desc || ""}
                  onChange={(e) =>handleChange("cus_it_desc", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={2}>
            <TextField
              name='hsn_sac_code'
              label='HSN No.'
              disabled
              value={itemFormDetail[focusedRowIndex]?.hsn_sac_code || ""}
              onChange={(e) =>handleChange("hsn_sac_code", e.target.value, focusedRowIndex)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              name='perunit'
              label='Rate Per Unit'
              value={itemFormDetail[focusedRowIndex]?.perunit || ""}
              onChange={(e) =>handleChange("perunit", e.target.value, focusedRowIndex)}
            />
          </Col>
          <Col xl={2}>
            <TextField
              name='perunit'
              label='Assessable Val'
              disabled
              value={itemFormDetail[focusedRowIndex]?.assess_value || ""}
              onChange={(e) =>handleChange("assess_value", e.target.value, focusedRowIndex)}
            />
          </Col>
        </Row>
        <Row className='mt-1'>
          <Col>
              <Card className="col-lg-12 col-md-12 col-sm-12 p-2 text-wrapper mt-lg-2 mt-md-3 mt-sm-3">
                <span className="text-label">GST TAX DETAILS</span>
                  <Row className="justify-content-between">
                    <Col lg={3} className="mt-4">
                      <RadioGroup
                        className="box-border mt-2 radio-button-wrapper"
                        options={[{ text: "%", value: "P" },{ text: "Value", value: "A" },]}
                        onChange={(e) => handleChange("gst_amt_prc_f", e.target.value)}
                        checked={itemFormDetail?.gst_amt_prc_f || "P"}
                      />
                    </Col>
                    <Col sm={6} md={3} lg={2}>
                      <Row>
                        <TextField
                          type="text"
                          label="SGST"
                          disabled
                          value={itemFormDetail.gst_sgst_val || ""}
                          onChange={(e) => handleChange("gst_sgst_val",e.target.value)}
                        />
                        <TextField
                          type="text"
                          label="Cess"
                          disabled
                          value={itemFormDetail.gst_sgst_cess_val || ""}
                          onChange={(e) =>  handleChange( "gst_sgst_cess_val",  e.target.value )}
                        />
                      </Row>
                    </Col>
                    <Col sm={6} md={3} lg={2}>
                      <Row>
                        <TextField
                          type="text"
                          label="UGST"
                          disabled
                          value={itemFormDetail.gst_ugst_val || ""}
                          onChange={(e) =>  handleChange("gst_ugst_val", e.target.value )}
                        />

                        <TextField
                          type="text"
                          label="Cess"
                          disabled
                          value={itemFormDetail.gst_ugst_cess_val || ""}
                          onChange={(e) =>  handleChange( "gst_ugst_cess_val", e.target.value )}
                        />
                      </Row>
                    </Col>
                    <Col sm={6} md={3} lg={2}>
                      <Row>
                        <TextField
                          type="text"
                          label="CGST"
                          disabled
                          value={itemFormDetail.gst_cgst_val || ""}
                          onChange={(e) =>  handleChange("gst_cgst_val",e.target.value )}
                        />
                        <TextField
                          type="text"
                          label="Cess"
                          disabled
                          value={itemFormDetail.gst_cgst_cess_val || ""}
                          onChange={(e) =>  handleChange("gst_cgst_cess_val", e.target.value )}
                        />
                      </Row>
                    </Col>
                    <Col sm={6} md={3} lg={2}>
                      <Row>
                        <TextField
                          type="text"
                          label="IGST"
                          disabled
                          value={itemFormDetail.gst_igst_val || ""}
                          onChange={(e) =>  handleChange("gst_igst_val", e.target.value  )}
                        />

                        <TextField
                          type="text"
                          label="Cess"
                          disabled
                          value={itemFormDetail.gst_igst_cess_val || ""}
                          onChange={(e) =>  handleChange("gst_igst_cess_val", e.target.value  )}
                        />
                      </Row>
                    </Col>
                  </Row>
              </Card>
          </Col>
        </Row>
            <Row className='d-flex flex-row align-items-end gx-0 mt-1'>
              <Col xl={2}>
                <TextField
                  name='cus_it_code'
                  label='Sales A/C Head'
                  id="sale_ac_head"
                  value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                  onChange={(e) =>handleChange("cus_it_code", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={6}>
                <TextField
                  name='sale_ac_desc'
                  disabled
                  value={itemFormDetail[focusedRowIndex]?.sale_ac_desc || ""}
                  onChange={(e) =>handleChange("sale_ac_desc", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
            <Row className='mt-1'>
              <Col xl={8} className='d-flex flex-row justify-content-center gx-0'>
                <ButtonUi disabled color='secondary' outline className='px-3'>Total</ButtonUi>
              </Col>
            </Row>
            
         <Row className='mt-1'>
          <Col >
           <Card className='px-2 py-2'>
                <Row>
                  <Col xl={2}>
                    <TextField
                      disabled
                      label='Accessable Value'
                      name="t_ass_val_1"
                      value={itemFormDetail[focusedRowIndex]?.t_ass_val_1 || ""}
                      onChange={(e) =>handleChange("t_ass_val_1", e.target.value, focusedRowIndex)}
                    /> 
                  </Col>
                  <Col xl={2}>
                    <TextField
                      disabled
                      label='Basic Value'
                      name="t_basic_val_1"
                      value={itemFormDetail[focusedRowIndex]?.t_basic_val_1 || ""}
                      onChange={(e) =>handleChange("t_basic_val_1", e.target.value, focusedRowIndex)}
                    /> 
                  </Col>
                  <Col xl={2}>
                    <TextField
                      disabled
                      label='Net Amt'
                      name="net_amt_1"
                      value={itemFormDetail[focusedRowIndex]?.net_amt_1 || ""}
                      onChange={(e) =>handleChange("net_amt_1", e.target.value, focusedRowIndex)}
                    /> 
                  </Col>
                </Row>


                  <Row className='mt-1'>
                    <Col xl={2}>
                      <TextField
                        disabled
                        label='IGST + Cess'
                        name="last_igst"
                        value={itemFormDetail[focusedRowIndex]?.last_igst || ""}
                        onChange={(e) =>handleChange("last_igst", e.target.value, focusedRowIndex)}
                        /> 
                    </Col>
                    <Col xl={2}>
                      <TextField
                        disabled
                        label='SGST + Cess'
                        name="last_sgst"
                        value={itemFormDetail[focusedRowIndex]?.last_sgst || ""}
                        onChange={(e) =>handleChange("last_sgst", e.target.value, focusedRowIndex)}
                      /> 
                    </Col>
                    <Col xl={2}>
                      <TextField
                        disabled
                        label='UGST + Cess'
                        name="last_inv_dt"
                        value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                        onChange={(e) =>handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                      /> 
                    </Col>
                    <Col xl={2}>
                      <TextField
                        disabled
                        label='CGST + Cess'
                        name="last_cgst"
                        value={itemFormDetail[focusedRowIndex]?.last_cgst || ""}
                        onChange={(e) =>handleChange("last_cgst", e.target.value, focusedRowIndex)}
                      /> 
                    </Col>
                  </Row>
           </Card>
          </Col>
         </Row>
  </Form>
  )
}

export default ScrapInvItems
