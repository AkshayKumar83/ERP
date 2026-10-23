import React, { useState } from 'react'
import { Button, Card, Col, Container, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import { getItemCodeDependentData, normalInvBatchDetailHeader, normalInvItemsheader } from './normal_invoice_helper';
import TextField from '../../../../components/basic/textField';
import Select from '../../../../components/basic/select';
import Checkbox from '../../../../components/basic/checkbox';
import RowAction from '../../../../components/common/rowAction';
import RadioGroup from '../../../../components/basic/radioGroup';

const NormalInvItems = ({
  itemFormDetail = [{}, {}],
  formStatus,
  handleChange = () => { },
  handleAddRow = () => { },
  handleDelete = () => { },
  handleUpdate = () => { },
  storage = [],
  handleHelpList = () => { },
  formData,
  user,
  formControlData,
  formDetailData,
  setFormDetailData,
}) => {
  // Tracking Focus in Table Row
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  
  const [isCostBreakupModalOpen, setIsCostBreakupModelOpen] = useState()
  const toggleCostBreakupModal = () => setIsCostBreakupModelOpen(!isCostBreakupModalOpen)

  const triggerAddRow = () => {
    handleAddRow()
  };


  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = itemFormDetail.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
  };

  const handleDoubleClick = (name) => {
        if (['Insert', 'Update'].includes(formStatus)) {
         handleHelpList(true, name);
        }
  };

  return (
    <Form id='service-inv-items-form'>
      {/* Table Header */}
      <div className="table-title d-flex justify-content-end gap-2">
        {(formStatus === "Insert" || formStatus === "Update") && (
          <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>Add Row</ButtonUi>
        )}
      </div>
      {/* Items Table */}
      <div className="table-container">
        <SimpleBar forceVisible="y" autoHide={false}>
          <Table hover >
            <thead>
              <tr>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <th  style={{ width: "2%" }}>Actions</th>
                )}
                {normalInvItemsheader.map((header, index) => (
                  <th
                    key={index}
                    data-required={header.required || false}
                    style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemFormDetail && itemFormDetail.map((data, rowIndex) => (
                <tr
                  key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                  style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                  tabIndex={0}
                >
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <td className="">
                      <RowAction
                        formStatus={formStatus}
                        canDelete={itemFormDetail.length > 1}
                        onDelete={() => handleDelete(data, rowIndex)}
                      />
                    </td>
                  )}
                  <td>
                    <TextField
                      required
                      name="it_code"
                      value={data.it_code || ""}
                      onDoubleClick={() => handleDoubleClick("it_code")}
                      onChange={(e) => handleChange(e, rowIndex)}
                      onBlur = {(e)=>getItemCodeDependentData({
                        e,
                        formData,
                        formStatus,
                        user,
                        formControlData,
                        formDetailData,
                        setFormDetailData,
                        itemFocusedRowIndex: focusedRowIndex,
                      })}
                      
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      name="it_desc"
                      value={data.it_desc || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      name="hsn_sac_code"
                      value={data.hsn_sac_code || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      type="number"
                      name="qty"
                      value={data.qty || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="rate"
                      value={data.rate || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="gst_cgst_val"
                      value={data.gst_cgst_val || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="gst_sgst_val"
                      value={data.gst_sgst_val || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="gst_igst_val"
                      value={data.gst_igst_val || ""}
                      onChange={(e) => handleChange(e, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="basic_value"
                      value={data.rate || ""}
                      onChange={(e) => handleChange(e,rowIndex)}
                    />
                  </td>
                  {/* <td>
                    <Checkbox
                      checked={data?.access_flg || false}
                      onChange={(e) => handleChange("access_flg", e.target.checked)}
                    />
                  </td> */}
                </tr>
              ))}
            </tbody>
          </Table>
        </SimpleBar>
      </div>

      <Container>
        <Row>
          <Col xl={2} className='d-flex flex-row'>
            <label htmlFor="tot_qty" style={{ fontSize: '13px', minWidth: "40%", textAlign: 'right', paddingRight: '8px' }}>
              Rate
            </label>
            <div >
              <TextField
                disabled
                type="number"
                name='tot_qty'
                value={itemFormDetail[focusedRowIndex]?.tot_qty ?? ""}
                onChange={(e) => handleChange(e, focusedRowIndex)}
              />
            </div>
          </Col>
          {/* <Col xl={3} className='d-flex flex-row gap-2 w-auto'>
            <ButtonUi color='secondary' >Discount</ButtonUi>
            <ButtonUi color='secondary' disabled >Supplementary Item</ButtonUi>
          </Col> */}
          <Col xl={3} className='d-flex flex-row '>
            <label htmlFor="tot_qty" style={{ fontSize: '13px', minWidth: "40%", textAlign: 'right', paddingRight: '8px' }}>
              Total Ordered Qty
            </label>
            <div style={{ width: '40%' }}>
              <TextField
                type="number"
                name='tot_qty'
                inpClass='bkg-yellow'
                value={itemFormDetail[focusedRowIndex]?.tot_qty ?? ""}
                onChange={(e) => handleChange(e, focusedRowIndex)}
                disabled
              />
            </div>
          </Col>
          <Col xl={3} className='d-flex flex-row '>
            <label htmlFor="tot_qty" style={{ fontSize: '13px', minWidth: "40%", textAlign: 'right', paddingRight: '8px' }}>
              Rate Per Unit
            </label>
            <div>
              <TextField
                type="number"
                name='perunit'
                value={itemFormDetail[focusedRowIndex]?.perunit ?? ""}
                onChange={(e) => handleChange(e, focusedRowIndex)}
              />
            </div>
          </Col>
        </Row>
        <Row className='mt-1'>
          <Col xl={4}>
            <Row>
              <Col xl={6}>
                <TextField
                  disabled
                  label='Catalog Code'
                  name="catalog_code"
                  value={itemFormDetail[focusedRowIndex]?.catalog_code || ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
              <Col xl={6} className='d-flex align-items-end'>
                <Checkbox
                  text="Different Assess. Val"
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                  checked={itemFormDetail[focusedRowIndex]?.assess_flg === "Y"}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={4}>
            <Row>
              <Col xl={6}>
                <TextField
                  type="number"
                  label='Assess Rate'
                  name="assess_rt"
                  value={itemFormDetail[focusedRowIndex]?.assess_rt ?? ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={4}>
            <Row>
              {/* <Col xl={6}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>A#=Accessories</span>
              </Col> */}
              <Col xl={6}>
                <TextField
                  disabled
                  type="number"
                  label='Assess Val'
                  name="assess_val"
                  value={itemFormDetail[focusedRowIndex]?.assess_val ?? ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className='mt-1 d-flex flex-row gx-0'>
          <Col xl={2} className='d-flex flex-column'>
            <label htmlFor="cus_it_code" style={{ fontSize: '13px', textAlign: 'right', paddingInline: '5px' }}>Customer item Code</label>
            <label htmlFor="cus_it_code" style={{ fontSize: '13px', textAlign: 'right', paddingInline: '5px' }}>Invoice item description</label>
          </Col>
          <Col xl={6} className=''>
            <Row className='d-flex flex-row gx-0'>
              <Col xl={2}>
                <TextField
                  name='cus_it_code'
                  id="cus_it_code"
                  value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
              <Col xl={10}>
                <TextField
                  name='cus_it_desc'
                  value={itemFormDetail[focusedRowIndex]?.cus_it_desc || ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <TextField
                  name='cus_it_desc'
                  value={itemFormDetail[focusedRowIndex]?.cus_it_desc || ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
            </Row>

          </Col>
          <Col xl={2} className='px-2'>
            <Select 
              name = "item_storage_type"
              label="Storage Type"
              options={storage}
              disabled
            />
          </Col>
        </Row>
        {/* <Row className='mt-1'>
          <Col>
            <Card className="  col-sm-12 col-md-12 col-lg-12 text-wrapper p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">GST</span>
              <Row className=" justify-content-between">
                <Col lg={2} className="mt-4">
                  <RadioGroup
                    className="mt-2 radio-button-wrapper box-border d-flex flex-column "
                    options={[{ text: "%", value: "P" }, { text: "Value", value: "A" },]}
                    onChange={(e) => handleChange("gst_amt_prc_f", e.target.value)}
                    checked={itemFormDetail[focusedRowIndex]?.gst_amt_prc_f || "P"}
                  />
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="SGST"
                      // value={itemFormDetail[focusedRowIndex]?.gst_sgst_val || ""}
                      value={itemFormDetail[focusedRowIndex]?.gst_sgst_val ?? ""}
                      onChange={(e) => handleChange("gst_sgst_val", e.target.value, focusedRowIndex)}
                    />
                  
                    <TextField
                      type="number"
                      label="Cess"
                      value={itemFormDetail[focusedRowIndex].gst_sgst_cess_val ?? ""}
                      onChange={(e) => handleChange("gst_sgst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="UGST"
                      value={itemFormDetail[focusedRowIndex].gst_ugst_val ?? ""}
                      onChange={(e) => handleChange("gst_ugst_val", e.target.value, focusedRowIndex)}
                    />

                    <TextField
                      type="number"
                      label="Cess"
                      value={itemFormDetail[focusedRowIndex].gst_ugst_cess_val ?? ""}
                      onChange={(e) => handleChange("gst_ugst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="CGST"
                      value={itemFormDetail[focusedRowIndex].gst_cgst_val ?? ""}
                      onChange={(e) => handleChange("gst_cgst_val", e.target.value, focusedRowIndex)}
                    />
                    <TextField
                      type="number"
                      label="Cess"
                      value={itemFormDetail[focusedRowIndex].gst_cgst_cess_val ?? ""}
                      onChange={(e) => handleChange("gst_cgst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2}>
                  <Row>
                    <TextField
                      type="number"
                      label="IGST"
                      value={itemFormDetail[focusedRowIndex].gst_igst_val ?? ""}
                      onChange={(e) => handleChange("gst_igst_val", e.target.value, focusedRowIndex)}
                    />

                    <TextField
                      type="number"
                      label="Cess"
                      value={itemFormDetail[focusedRowIndex].gst_igst_cess_val ?? ""}
                      onChange={(e) => handleChange("gst_igst_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
                <Col sm={6} md={3} lg={2} className='mt-auto'>
                  <Row>
                    <TextField
                      type="number"
                      label="Compensation Cess"
                      value={itemFormDetail[focusedRowIndex].gst_comp_cess_val ?? ""}
                      onChange={(e) => handleChange("gst_comp_cess_val", e.target.value, focusedRowIndex)}
                    />
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row> */}
        <Row className='mt-1'>
          <Col xl={6} className='mt-sm-3 mt-md-3 mt-lg-2'>
            <Card className='text-wrapper px-2'>
              <span className='text-label'>Sales Account Head</span>
              <Row className='py-2'>
                <Col>
                  <Row className='d-flex flex-row gx-0'>
                    <Col xl={3}>
                      <TextField
                        name='cus_it_code'
                        label='Sales A/C Head'
                        value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                        onChange={(e) => handleChange(e, focusedRowIndex)}
                        disabled
                      />
                    </Col>
                    <Col xl={9} className='mt-auto'>
                      <TextField
                        name='cus_it_code'
                        disabled
                        value={itemFormDetail[focusedRowIndex]?.cus_it_code || ""}
                        onChange={(e) => handleChange(e, focusedRowIndex)}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xl={4} className=''>
            <Row className=''>
              {/* <Col xl={6}>
                <TextField
                  disabled
                  type="text"
                  label="HSN/SAC Code"
                  value={itemFormDetail.hsn_sac_code || ""}
                  onChange={(e) => handleChange("hsn_sac_code", e.target.value)}
                />
              </Col> */}
              <Col xl={6}>
                <TextField
                  type="text"
                  label="Addtl Imp Duty"
                  value={itemFormDetail[focusedRowIndex]?.addtl_import_duty || ""}
                  onChange={(e) => handleChange(e, focusedRowIndex)}
                />
              </Col>
                <Col xl={6} className="mt-auto">
                    <ButtonUi color="primary" outline onClick={toggleCostBreakupModal} >Show Cost Breakup</ButtonUi>
                </Col>
            </Row>
          </Col>
        </Row>
        {/* <Row>
          <Col>
            <div className="table-title d-flex justify-content-end gap-2">
              {(formStatus === "Insert" || formStatus === "Update") && (
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>Add Row</ButtonUi>
              )}
              <ButtonUi color="primary" className="add-action" onClick={() => alert('button I clicked')}>B</ButtonUi>
            </div>
  
            <div className="table-container">
              <SimpleBar forceVisible="y" autoHide={false}>
                <Table hover>
                  <thead>
                    <tr>
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <th className="sticky-column left" style={{ width: "5%" }}>Actions</th>
                      )}
                      {normalInvBatchDetailHeader.map((header, index) => (
                        <th
                          key={index}
                          data-required={header.required || false}
                          style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
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
                        style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
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
                            name="mrir_no"
                            value={data.mrir_no || ""}
                            onChange={(e) => handleChange("mrir_no", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            name="batch_no"
                            value={data.batch_no || ""}
                            onChange={(e) => handleChange("batch_no", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            disabled
                            type="number"
                            name="be_no"
                            value={data.be_no || ""}
                            onChange={(e) => handleChange("be_no", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            disabled
                            type="date"
                            name="be_date"
                            value={data.be_date || ""}
                            onChange={(e) => handleChange("be_date", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            type="number"
                            name="batch_qty"
                            value={data.batch_qty || ""}
                            onChange={(e) => handleChange("batch_qty", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            disabled
                            type="number"
                            name="ex_value_per_unit"
                            value={data.ex_value_per_unit || ""}
                            onChange={(e) => handleChange("ex_value_per_unit", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            disabled
                            type="number"
                            name="splex_value_per_unit"
                            value={data.splex_value_per_unit || ""}
                            onChange={(e) => handleChange("splex_value_per_unit", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            disabled
                            type="number"
                            name="higher_edu_cess_per_unit"
                            value={data.higher_edu_cess_per_unit || ""}
                            onChange={(e) => handleChange("higher_edu_cess_per_unit", e.target.value, rowIndex)}
                          />
                        </td>
                        <td>
                          <TextField
                            disabled
                            type="number"
                            name="add_duty_per_unit"
                            value={data.add_duty_per_unit || ""}
                            onChange={(e) => handleChange("add_duty_per_unit", e.target.value, rowIndex)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="">
                      <td colSpan={4} className="text-end pe-2">
                        <span style={{ fontSize: '13px' }}>Total</span>
                      </td>
                      <td className="p-0">
                        <TextField
                          disabled
                          type="number"
                          name="tot_qty"
                          value={itemFormDetail[focusedRowIndex]?.tot_qty || ""}
                          onChange={(e) => handleChange("tot_qty", e.target.value, focusedRowIndex)}
                        />
                      </td>
                      <td colSpan={5} className="text-start">
                        <ButtonUi className="py-0">Fill Batch</ButtonUi>
                      </td>
                    </tr>
                  </tfoot>

                </Table>
              </SimpleBar>
            </div>
          </Col>
        </Row> */}
        {/* <Row className='mt-2'>
          <Card className='text-wrapper py-2'>
            <span className='text-label'>Last Invoice Detail of Current Item</span>
            <Row>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Invoice No.'
                  name="last_inv_no"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_no || ""}
                  onChange={(e) => handleChange("last_inv_no", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Invoice Dt'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='Inv Rate'
                  name="st_inv_rate"
                  value={itemFormDetail[focusedRowIndex]?.st_inv_rate ?? ""}
                  onChange={(e) => handleChange("st_inv_rate", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='Discount'
                  name="last_di"
                  value={itemFormDetail[focusedRowIndex]?.last_di ?? ""}
                  onChange={(e) => handleChange("last_di", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='Inv Qty'
                  name="t_inv_qty"
                  value={itemFormDetail[focusedRowIndex]?.t_inv_qty ?? ""}
                  onChange={(e) => handleChange("t_inv_qty", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
            <Row className='mt-1'>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='SGST + Cess'
                  name="last_sgst"
                  value={itemFormDetail[focusedRowIndex]?.last_sgst ?? ""}
                  onChange={(e) => handleChange("last_sgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='UGST + Cess'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt ?? ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='CGST + Cess'
                  name="last_cgst"
                  value={itemFormDetail[focusedRowIndex]?.last_cgst ?? ""}
                  onChange={(e) => handleChange("last_cgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='IGST + Cess'
                  name="last_igst"
                  value={itemFormDetail[focusedRowIndex]?.last_igst ?? ""}
                  onChange={(e) => handleChange("last_igst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='Comp + Cess'
                  name="comp_cess"
                  value={itemFormDetail[focusedRowIndex]?.comp_cess ?? ""}
                  onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='Inv Free Qty'
                  name="free_qty"
                  value={itemFormDetail[focusedRowIndex]?.free_qty ?? ""}
                  onChange={(e) => handleChange("free_qty", e.target.value, focusedRowIndex)}
                />
              </Col>
            </Row>
          </Card>
        </Row> */}


        <Row className='mt-3'>
          {/* <Card className='text-wrapper py-2'>
            <span className='text-label'>Totals</span>
            <Row>
              <Col xl={2}>
                <TextField
                  disabled

                  label='Basic Value'
                  name="last_inv_no"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_no || ""}
                  onChange={(e) => handleChange("last_inv_no", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='Discount'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='Accessable Value'
                  name="st_inv_rate"
                  value={itemFormDetail[focusedRowIndex]?.st_inv_rate ?? ""}
                  onChange={(e) => handleChange("st_inv_rate", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='SGST + Cess'
                  name="last_sgst"
                  value={itemFormDetail[focusedRowIndex]?.last_sgst ?? ""}
                  onChange={(e) => handleChange("last_sgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  label='UGST + Cess'
                  name="last_inv_dt"
                  value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                  onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Col xl={2}>
                <TextField
                  disabled
                  type="number"
                  label='CGST + Cess'
                  name="last_cgst"
                  value={itemFormDetail[focusedRowIndex]?.last_cgst ?? ""}
                  onChange={(e) => handleChange("last_cgst", e.target.value, focusedRowIndex)}
                />
              </Col>
              <Row className='mt-1'>
                <Col xl={2}>
                  <TextField
                    disabled
                    type="number"
                    label='IGST + Cess'
                    name="last_igst"
                    value={itemFormDetail[focusedRowIndex]?.last_igst ?? ""}
                    onChange={(e) => handleChange("last_igst", e.target.value, focusedRowIndex)}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    disabled
                    type="number"
                    label='Comp + Cess'
                    name="comp_cess"
                    value={itemFormDetail[focusedRowIndex]?.comp_cess ?? ""}
                    onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    disabled
                    type="number"
                    label='Net Amount'
                    name="comp_cess"
                    inpClass='bkg-pink'
                    value={itemFormDetail[focusedRowIndex]?.comp_cess ?? ""}
                    onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                  />
                </Col>
              </Row>
            </Row>
          </Card> */}
                <Modal isOpen={isCostBreakupModalOpen} toggle={toggleCostBreakupModal} size="lg">
                    <ModalHeader toggle={toggleCostBreakupModal}>Cost Breakup</ModalHeader>
                    <ModalBody>
                      <Card className='text-wrapper p-2'>
                          <span className='text-label'>Totals</span>
                          <Row>
                            <Col xl={2}>
                              <TextField
                                disabled

                                label='Basic Value'
                                name="last_inv_no"
                                value={itemFormDetail[focusedRowIndex]?.last_inv_no || ""}
                                onChange={(e) => handleChange("last_inv_no", e.target.value, focusedRowIndex)}
                              />
                            </Col>
                            <Col xl={2}>
                              <TextField
                                disabled
                                label='Discount'
                                name="last_inv_dt"
                                value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                                onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                              />
                            </Col>
                            <Col xl={2}>
                              <TextField
                                disabled
                                type="number"
                                label='Accessable Value'
                                name="st_inv_rate"
                                value={itemFormDetail[focusedRowIndex]?.st_inv_rate ?? ""}
                                onChange={(e) => handleChange("st_inv_rate", e.target.value, focusedRowIndex)}
                              />
                            </Col>
                            <Col xl={2}>
                              <TextField
                                disabled
                                type="number"
                                label='SGST + Cess'
                                name="last_sgst"
                                value={itemFormDetail[focusedRowIndex]?.last_sgst ?? ""}
                                onChange={(e) => handleChange("last_sgst", e.target.value, focusedRowIndex)}
                              />
                            </Col>
                            <Col xl={2}>
                              <TextField
                                disabled
                                label='UGST + Cess'
                                name="last_inv_dt"
                                value={itemFormDetail[focusedRowIndex]?.last_inv_dt || ""}
                                onChange={(e) => handleChange("last_inv_dt", e.target.value, focusedRowIndex)}
                              />
                            </Col>
                            <Col xl={2}>
                              <TextField
                                disabled
                                type="number"
                                label='CGST + Cess'
                                name="last_cgst"
                                value={itemFormDetail[focusedRowIndex]?.last_cgst ?? ""}
                                onChange={(e) => handleChange("last_cgst", e.target.value, focusedRowIndex)}
                              />
                            </Col>
                            <Row className='mt-1'>
                              <Col xl={2}>
                                <TextField
                                  disabled
                                  type="number"
                                  label='IGST + Cess'
                                  name="last_igst"
                                  value={itemFormDetail[focusedRowIndex]?.last_igst ?? ""}
                                  onChange={(e) => handleChange("last_igst", e.target.value, focusedRowIndex)}
                                />
                              </Col>
                              <Col xl={2}>
                                <TextField
                                  disabled
                                  type="number"
                                  label='Comp + Cess'
                                  name="comp_cess"
                                  value={itemFormDetail[focusedRowIndex]?.comp_cess ?? ""}
                                  onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                                />
                              </Col>
                              <Col xl={2}>
                                <TextField
                                  disabled
                                  type="number"
                                  label='Net Amount'
                                  name="comp_cess"
                                  inpClass='bkg-pink'
                                  value={itemFormDetail[focusedRowIndex]?.comp_cess ?? ""}
                                  onChange={(e) => handleChange("comp_cess", e.target.value, focusedRowIndex)}
                                />
                              </Col>
                            </Row>
                          </Row>
                      </Card>
                    </ModalBody>
                    <ModalFooter>
                    <Button color="secondary" onClick={toggleCostBreakupModal}>
                        Close
                    </Button>
                    </ModalFooter>
                </Modal>
        </Row>
      </Container>
    </Form>
  )
}

export default NormalInvItems
