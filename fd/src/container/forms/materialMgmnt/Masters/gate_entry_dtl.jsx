

import React, { useState } from 'react'
import { Col, Form, Row, Table } from 'reactstrap'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import Checkbox from '../../../../components/basic/checkbox'
import { ddnNoHelpListHeader, dtlTableHeaders, messageInitialData,
   poItemHelpListHeader,
   poNoHelpListHeader, rmdaNoHelpListHeader, validateGEPoNo } from './gate_entry_helper'
import ButtonUi from '../../../../components/basic/button'
import GateEntryMessage from './gate_entry_message'
import { FcInfo } from 'react-icons/fc'

const GateEntryDtl = ({
  formData,
  detailData,
  f57Data,
  f57QtyData,
  formStatus,
  handleChange,
  handleDelete,
  focusedRowIndex,
  setFocusedRowIndex,
  makeFocusOnTableRow,
  triggerAddRow,
  openHelpList,
  setDetailData,
  setFormData,
  user,
  setDisableFreight
}) => {

  const [msgData, setMsgData] = useState({...messageInitialData})
  const [isMsgModelOpen, setIsMsgModelOpen] = useState(false)
  const toggleMsgModal = () => setIsMsgModelOpen(!isMsgModelOpen)



  return (
   <Form id='gate-entry-dtl-form'>
       {/* table Section start here*/}
    <Row className="">
        <Col xl={12} className="">
              < >
                <div className="table-title">
                  <span>Gate Entry Detail</span>

                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <div>
                      <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                      >
                        Add Row
                      </ButtonUi>
                    </div>
                    //todo add gen mrir no button here to generate the mrir no for all item
                    
                  )}
                 
                </div>
  
                <div className="table-wrapper-v3">
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <div className='table-sticky-wrapper'>
                      <Table>
                        <thead>
                          <tr>
                            {(formStatus === "Insert" || formStatus === "Update") && (
                              <th>Actions</th>
                            )}
                            {dtlTableHeaders.map((header, index) => (
                              // <th
                              //     key={index}
                              //     data-required={header.required || false}
                              //     style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                              //         {header.label}
                              //         {header.isHelpExist && (<FcInfo title="Info" />)}
                              // </th>
                              <th
                                  key={index}
                                  data-required={header.required || false}
                                  style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                      {header.label}
                                      {header.isHelpExist && (<FcInfo title="Info" />)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.map((data, rowIndex) => (
                            <tr 
                            key={rowIndex} 
                            onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)} 
                            style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                            }} 
                            tabIndex={0}>
                              {(formStatus === "Insert" || formStatus === "Update") && (
                                <td>
                                  <RowAction
                                    formStatus={formStatus}
                                    canDelete={detailData.length > 1}
                                    onDelete={() => handleDelete(rowIndex)} 
                                  />
                                </td>
                              )}
                              <td>
                                <TextField
                                  type="text"
                                  required
                                  name="po_no"
                                  value={data.po_no || ""}
                                  onChange={(e) => handleChange(e, "po_no", e.target.value, rowIndex)}
                                  onDoubleClick={() => openHelpList("po_no",  poNoHelpListHeader,  rowIndex)}
                                  onBlur={(e)=>validateGEPoNo({data, setDetailData, setDisableFreight,formData, current_po_no: e.target.value, user, rowIndex, setFormData,formStatus})}
                                  disabled={formData?.sale_return === '5'}
                                  
                                />
                              </td>
                              <td>
                                <TextField
                                  type="text"
                                  required
                                  name="it_code"
                                  value={data.it_code || ""}
                                  onChange={(e) => handleChange(e, "it_code", e.target.value, rowIndex)}
                                  onDoubleClick={() => {
                                    if (formStatus === "Update") {
                                        openHelpList( "it_code",poItemHelpListHeader, rowIndex );
                                    }
                                }}
                                />
                              </td>
                              <td>
                                <TextField
                                  type="text"
                                  // required
                                  name="it_name"
                                  value={data.it_name || ""}
                                  onChange={(e) =>handleChange(e, "it_name", e.target.value, rowIndex)}
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  disabled ={formData?.sale_return !== '5'}
                                  name="rate_rs"
                                  value={data.rate_rs || ""}
                                  onChange={(e) =>handleChange(e, "rate_rs", e.target.value, rowIndex)}
                                />
                              </td>
                              <td>
                                <TextField
                                  type="text"
                                  // required
                                  name="it_pu_um"
                                  value={data.it_pu_um || ""}
                                  onChange={(e) =>handleChange(e, "it_pu_um", e.target.value, rowIndex)}
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="po_qty_ord"
                                  value={data.po_qty_ord || ""}
                                  onChange={(e) =>handleChange(e, "po_qty_ord", e.target.value, rowIndex)}
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  required
                                  name="qty_advise"
                                  value={data?.qty_advise ?? ""}
                                  onChange={(e) =>handleChange(e, "qty_advise", e.target.value, rowIndex)}
                                  disabled={data.it_code === "WS22"}
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  required
                                  name="recd_qty" 
                                  value={data?.recd_qty ?? ""}
                                  onChange={(e) =>handleChange(e, "recd_qty", e.target.value, rowIndex)}
                                  disabled={data.it_code === "WS22"}
                                />
                              </td>
                               <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="bal_qty" 
                                  value={data.bal_qty ?? ""}
                                  onChange={(e) =>handleChange(e, "bal_qty", e.target.value, rowIndex)}
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="text"
                                  // required
                                  name="mrir_no"
                                  value={data.mrir_no || ""}
                                  onChange={(e) =>handleChange(e, "mrir_no", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="text"
                                  // required
                                  name="mrir_date"
                                  value={data.mrir_date || ""}
                                  onChange={(e) =>handleChange(e, "mrir_date", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="gst_igst_val"
                                  value={data.gst_igst_val  ?? ""}
                                  onChange={(e) =>handleChange(e, "gst_igst_val", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                              
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="gst_sgst_val"
                                  value={data.gst_sgst_val ?? ""}
                                  onChange={(e) =>handleChange(e, "gst_sgst_val", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="gst_cgst_val"
                                  value={data.gst_cgst_val ?? ""}
                                  onChange={(e) =>handleChange(e, "gst_cgst_val", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="basic_val"
                                  value={data.basic_val ?? ""}
                                  onChange={(e) =>handleChange(e, "basic_val", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                              <td>
                                <TextField
                                  type="number"
                                  // required
                                  name="total_value"
                                  value={data?.total_value ?? ""}
                                  onChange={(e) =>handleChange(e, "total_value", e.target.value, rowIndex) }
                                  disabled
                                />
                              </td>
                                  {/* <button style={{padding:"0px 6px", fontSize:"12px", width:"100%", cursor:'pointer', backgroundColor:'black', color:'white'}}
                                      // onClick={() => {triggerFamilyDetail(data.id)}} type="button"
                                      type='button'
                                      >
                                      Gen MRIR
                                  </button> */}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </SimpleBar>
                </div>
              </>
        </Col>
    </Row>
     {/* table Section end here*/}
     {/* 57FA  table Section start here*/}

      <Row className="">
          {/* <Col xl={4} className="">
              <Form id="" className="">
                <div className="table-title">
                  <span>57F4 Challan No</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div>
        
                <div className="table-wrapper-v3"  style={{ height: "130px", maxHeight: "130px" }}>
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <div className='table-sticky-wrapper '>
               <Table>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <th>Actions</th>
                          )}
                          {tableHeaders57F4.map((header, index) => (
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
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {f57Data.map((data, rowIndex) => (
                          <tr 
                          key={rowIndex} 
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                          style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                          }} 
                          tabIndex={0}>
                            {(formStatus === "Insert" || formStatus === "Update") && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={f57Data.length > 1}
                                 onDelete={() => handleDelete(rowIndex)} // Delete row
                     
                                />
                              </td>
                            )}
                            <td>
                              <TextField
                                type="text"
                                required
                                name="chlnr57f_no"
                                value={data.chlnr57f_no || ""}
                             
                                onChange={(e) =>handleChange("chlnr57f_no", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="date"
                                required
                                name="chlnr57f_date"
                                value={data.chlnr57f_date || ""}
                            
                                onChange={(e) =>handleChange("chlnr57f_date", e.target.value, rowIndex, e) }
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
          </Col> */}

          <Col xl={12} className='mt-2'>
          <Row>
           <Col xl={2}>
            <TextField
              type="text"
              label="Size."
              name='iic_ref_no'
              value={detailData[focusedRowIndex]?.iic_ref_no || ""}
              onChange={(e) => handleChange(e, "iic_ref_no", e.target.value, focusedRowIndex)}
              disabled
            />
          </Col>
           <Col xl={2}>
            <TextField
              type="text"
              label="ETS Qty"
              name='qty_ets'
              value={detailData[focusedRowIndex]?.qty_ets || ""}
              onChange={(e) => handleChange(e, "qty_ets", e.target.value, focusedRowIndex)}
              disabled
            />
          </Col>
           <Col xl={2}>
            <TextField
              type="text"
              label="No of Cases"
              name='no_of_case'
              value={detailData[focusedRowIndex]?.no_of_case || ""}
              onChange={(e) => handleChange(e, "no_of_case", e.target.value, focusedRowIndex)}
            />
          </Col>
               <Col xl={2} className=''>
            <TextField
              type="number"
              label="Conversion Purchase --> Stock"
              name='conversion_factor'
              value={detailData[focusedRowIndex]?.conversion_factor || ""}
              onChange={(e) => handleChange(e, "conversion_factor", e.target.value, focusedRowIndex)}
              // disabled
            />
          </Col>
           <Col xl={2} className=''>
            <TextField
              type="text"
              label="converted Qty"
              name='qty_converted'
              value={detailData[focusedRowIndex]?.qty_converted ?? ""}
              onChange={(e) => handleChange(e, "qty_converted", e.target.value, focusedRowIndex)}
              // disabled
            />
          </Col>
           <Col xl={2}>
              <TextField
                type="text"
                label="Damaged Qty"
                name='qty_damaged'
                value={detailData[focusedRowIndex]?.qty_damaged || ""}
                onChange={(e) => handleChange(e, "qty_damaged", e.target.value, focusedRowIndex)}
              />
            </Col>
           {/* <Col xl={3}>
           <span>{formData.cancel_message}</span>
            
          </Col> */}
          </Row>

          <Row className='mt-1'>
             <Col xl={2}>
            <TextField
              type="text"
              label="RMDA No."
              name='rej_gpno'
              value={detailData[focusedRowIndex]?.rej_gpno || ""}
              onChange={(e) => handleChange(e, "rej_gpno", e.target.value, focusedRowIndex)}
              onDoubleClick={() => openHelpList("rej_gpno",  rmdaNoHelpListHeader,  rowIndex)}

            />
          </Col>
           <Col xl={2}>
            <TextField
              type="date"
              label="RMDA Date"
              name='rej_gpdt'
              value={detailData[focusedRowIndex]?.rej_gpdt || ""}
              onChange={(e) => handleChange(e, "rej_gpdt", e.target.value, focusedRowIndex)}
              disabled
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="text"
              label="DDN No."
              name='ddn_no'
              value={detailData[focusedRowIndex]?.ddn_no || ""}
              onChange={(e) => handleChange(e, "ddn_no", e.target.value, focusedRowIndex)}
              onDoubleClick={() => openHelpList("ddn_no",  ddnNoHelpListHeader,  rowIndex)}
              
            />
          </Col>
           {/* <Col xl={2}>
            <TextField
              type="date"
              label="DDN Date"
              name='ddn_dt'
              value={detailData[focusedRowIndex]?.ddn_dt || ""}
              onChange={(e) => handleChange(e, "ddn_dt", e.target.value, focusedRowIndex)}
              disabled
            />
          </Col> */}
              <Col xl={2} className=''>
            <TextField
              type="number"
              label='PO Level Extra Charges'
              name="po_level_charge"
              value={formData?.po_level_charge ?? ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
              inpClass='bkg-yellow'
            />
          </Col>
              <Col xl={2} className=''>
            <TextField
              type="number"
              label='PO Value'
              name="po_value"
              value={formData?.po_value ?? ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
              inpClass='bkg-yellow'
            />
          </Col>
           <Col xl={2} className=''>
            <TextField
              type="number"
              label='GE Received Value'
              name="ge_value"
              value={formData?.ge_value ?? ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
              inpClass='bkg-yellow'
            />
          </Col>
          
           {/* <Col xl={3} className='mt-4'>
           <button
           type="button"
           onClick={toggleMsgModal}
              style={{ backgroundColor: "black", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}} >
              Schedule Details
           </button>
          </Col> */}
     </Row>
      {/* {
          isMsgModelOpen && 
          <GateEntryMessage
          msgData={msgData}
          handleChange={handleChange}
          formStatus={formStatus}
          isMsgModelOpen={isMsgModelOpen}
          toggleMsgModal={toggleMsgModal}
        />
         } */}

          <Row className='mt-1'>
          {/* <Col xl={3}>
            <TextField
              type="text"
              label="DDN No."
              name='ddn_no'
              value={detailData[focusedRowIndex]?.ddn_no || ""}
              onChange={(e) => handleChange(e, "ddn_no", e.target.value, focusedRowIndex)}
              onDoubleClick={() => openHelpList("ddn_no",  ddnNoHelpListHeader,  rowIndex)}
              
            />
          </Col>
           <Col xl={3}>
            <TextField
              type="date"
              label="DDN Date"
              name='ddn_dt'
              value={detailData[focusedRowIndex]?.ddn_dt || ""}
              onChange={(e) => handleChange(e, "ddn_dt", e.target.value, focusedRowIndex)}
              disabled
            />
          </Col> */}
          
           {/* <Col xl={2} className=''>
            <TextField
              type="number"
              label="Conversion Purchase --> Stock"
              name='conversion_factor'
              value={detailData[focusedRowIndex]?.conversion_factor || ""}
              onChange={(e) => handleChange(e, "conversion_factor", e.target.value, focusedRowIndex)}
              // disabled
            />
          </Col>
           <Col xl={2} className=''>
            <TextField
              type="text"
              label="converted Qty"
              name='qty_converted'
              value={detailData[focusedRowIndex]?.qty_converted || ""}
              onChange={(e) => handleChange(e, "qty_converted", e.target.value, focusedRowIndex)}
              // disabled
            />
          </Col>
           <Col xl={2}>
              <TextField
                type="text"
                label="Damaged Qty"
                name='qty_damaged'
                value={detailData[focusedRowIndex]?.qty_damaged || ""}
                onChange={(e) => handleChange(e, "qty_damaged", e.target.value, focusedRowIndex)}
              />
            </Col> */}
          </Row>
          </Col>
    </Row>
    
   </Form>
  )
}

export default GateEntryDtl
