import React, { useState } from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap'
import SimpleBar from 'simplebar-react'
import ButtonUi from '../../../../components/basic/button'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import { headers1, headers2 } from './ap_bill_entry_helper'
import RadioGroup from '../../../../components/basic/radioGroup'

const ApBillEntryItCanTab= ({itemData,itemChlnData, handleChange, formStatus }) => {

    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const makeFocusOnTableRow = (rowIndex, id) => {
      const entry = itemData.find((entry) => entry.id === id);
      setFocusedRowIndex(rowIndex);
      // triggerFamilyDetail(id)
    };
  
    function handleDelete() {}
    function handleUpdate() {}

  return (
    <>
     <Row className="">
          <Col  xl={10} className="">
              <Form id="" className="">
                <div className="table-title">
                  {/* <span>Source User</span> */}
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div>
        
                {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
                <div className="table-wrapper-v3" style={{ height: "120px", maxHeight: "120px" }}>
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <div className='table-sticky-wrapper'>
               <Table>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <th>Actions</th>
                          )}
                          {headers1.map((header, index) => (
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
                        {itemChlnData.map((data, rowIndex) => (
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
                                  canDelete={itemChlnData.length > 1}
                                  onDelete={() => handleDelete(rowIndex)} // Delete row
                                  // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                                />
                              </td>
                            )}
                            <td>
                              <TextField
                                type="text"
                                name="chln_no"
                                value={data.chln_no || ""}
                                maxLength
                                onChange={(e) =>handleChange("chln_no", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="date"
                                name="chln_date"
                                value={data.chln_date || ""}
                                maxLength
                                onChange={(e) =>handleChange("chln_date", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="po_no"
                                value={data.po_no || ""}
                                maxLength
                                onChange={(e) =>handleChange("po_no", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="inward_control_no"
                                value={data.inward_control_no || ""}
                                maxLength
                                onChange={(e) =>handleChange("inward_control_no", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <Select
                                type="text"
                                required
                                name="register_type"
                                value={data.register_type || ""}
                                maxLength
                                onChange={(e) =>handleChange("register_type", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="srno_part2"
                                value={data.srno_part2 || ""}
                                maxLength
                                onChange={(e) =>handleChange("srno_part2", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="date"
                                required
                                name="credit_dt"
                                value={data.credit_dt || ""}
                                maxLength
                                onChange={(e) =>handleChange("credit_dt", e.target.value, rowIndex, e) }
                                disabled
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

  <Col xl={2} className='mt-4'>

     <Col xl={5} className='mt-2'>
                   <ButtonUi outline>Fill Items</ButtonUi>
                </Col>

              {/* This field maping is control block */}
    <Col xl={7} className='mt-2'>
            <TextField
            type="number"
            label="Gross Total"
            value={"gross_total" || ""}
            onChange={(e) =>handleChange("gross_total", e.target.value) }
        />
          </Col>
    </Col>

        

        </Row>
     <Row className="mt-2">
          <Col sm={12} md={8} lg={12} className="">
              <Form id="" className="">
                <div className="table-title">
                  {/* <span>Source User</span> */}
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div>
        
                {/* <div className="table-container" style={{ height: "180px", maxHeight: "180px" }}> */}
                <div className="table-wrapper-v3">
                  <SimpleBar forceVisible="y" autoHide={false}>
                    <div className='table-sticky-wrapper'>
               <Table>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" || formStatus === "Update") && (
                            <th>Actions</th>
                          )}
                          {headers2.map((header, index) => (
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
                        {itemData.map((data, rowIndex) => (
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
                                  canDelete={userSourceData.length > 1}
                                 onDelete={() => handleDelete(rowIndex)} // Delete row
                                  // onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                                />
                              </td>
                            )}
                            <td>
                              <TextField
                                type="text"
                                required
                                name="it_code"
                                value={data.it_code || ""}
                                maxLength
                                onChange={(e) =>handleChange("it_code", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="qty_recd"
                                value={data.qty_recd || ""}
                                maxLength
                                onChange={(e) =>handleChange("qty_recd", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="qty_accpted"
                                value={data.qty_accpted || ""}
                                maxLength
                                onChange={(e) =>handleChange("qty_accpted", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="number"
                                required
                                name="qty_bill"
                                value={data.qty_bill || ""}
                                maxLength
                                onChange={(e) =>handleChange("qty_bill", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="po_perunit"
                                value={data.po_perunit || ""}
                                maxLength
                                onChange={(e) =>handleChange("po_perunit", e.target.value, rowIndex, e) }
                                disabled
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="rate_fc"
                                value={data.rate_fc || ""}
                                maxLength
                                onChange={(e) =>handleChange("rate_fc", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="rate"
                                value={data.rate || ""}
                                maxLength
                                onChange={(e) =>handleChange("rate", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="po_rate"
                                value={data.po_rate || ""}
                                maxLength
                                onChange={(e) =>handleChange("po_rate", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="pack_forward_amt"
                                value={data.pack_forward_amt || ""}
                                maxLength
                                onChange={(e) =>handleChange("pack_forward_amt", e.target.value, rowIndex, e) }
                              />
                            </td>
                            <td>
                              <TextField
                                type="text"
                                required
                                name="osp_mat_rate"
                                value={data.osp_mat_rate || ""}
                                maxLength
                                onChange={(e) =>handleChange("osp_mat_rate", e.target.value, rowIndex, e) }
                                disabled
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

   <Row className='mt-1'>
     <Col xl={2}>
                    <TextField
                        type="text"
                        label="Exchange Rate"
                        value={itemData.exchange_rate || ""}
                        onChange={(e) =>handleChange("exchange_rate", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Payment Qty"
                        value={itemData.qty_payment || ""}
                        onChange={(e) =>handleChange("qty_payment", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="number"
                        label="original Rate"
                        value={itemData.orig_rate || ""}
                        onChange={(e) =>handleChange("orig_rate", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Misc Chargs in FC"
                        value={itemData.misc_chgs_in_fc || ""}
                        onChange={(e) =>handleChange("rmgp_no", e.target.value)}
                    />
                </Col>
        </Row>

<Row className='mt-1'>

   <Col lg={9}>
          <div className="text-wrapper box border mt-2">
            <span className="text-label">LD Details</span>
            <Row className="mb-2 mt-1 justify-content">
            
              <Col xl={5}>
                <RadioGroup
                 className="radio-button-wrapper mt-3"
                 options={[
                   { text: "Model1", value: "1" },
                   { text: "Model2", value: "2" },
                   { text: "None", value: "0" },
                 ]}
                 onChange={(e) => handleChange("ld_model", e.target.value)}
                 checked={itemData?.ld_model || " "}
               />
              </Col>
              <Col xl={2}>
                <TextField
                  type="text"
                  label="Delay in days"
                  value={itemData.ld_delay_day || ""}
                  onChange={(e) => handleChange("ld_delay_day", e.target.value)}
                  disabled
                />
              </Col>
              <Col xl={2}>
                <TextField
                  type="text"
                  label="LD %"
                  value={itemData.ld_perc || ""}
                  onChange={(e) => handleChange( "ld_perc", e.target.value)}
                  disabled
                />
              </Col>
              <Col xl={3} className=''>
                <TextField
                  type="text"
                  label="LD Rate Deduction"
                  value={itemData.ld_rate_deduction || ""}
                  onChange={(e) =>handleChange( "ld_rate_deduction", e.target.value)
                  }
                  disabled
                />
              </Col>
            </Row>
          </div>
  </Col>
</Row>

   <Row className='mt-1'>
     <Col xl={4}>
                    <TextField
                        type="text"
                        label="Item Description"
                        value={itemData.it_name || ""}
                        onChange={(e) =>handleChange("it_name", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="Purchase Acc. Head"
                        value={itemData.purac_head || ""}
                        onChange={(e) =>handleChange("purac_head", e.target.value)}
                    />
                </Col>
                <Col xl={4} className='mt-4'>
                    <TextField
                        type="text"
                        value={itemData.purch_ac_desc || ""}
                        onChange={(e) =>handleChange("purch_ac_desc", e.target.value)}
                        disabled
                    />
                </Col>
              
        </Row>

        <Row className='mt-1'>
     <Col xl={2}>
                    <TextField
                        type="text"
                        label="MRIR No"
                        value={itemData.mrir_no || ""}
                        onChange={(e) =>handleChange("mrir_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2}>
                    <TextField
                        type="text"
                        label="RMDA No"
                        value={itemData.rmda_no || ""}
                        onChange={(e) =>handleChange("rmda_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="text"
                        label='Org.Inward'
                        value={itemData.org_inward_control_no || ""}
                        onChange={(e) =>handleChange("org_inward_control_no", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={2} className=''>
                    <TextField
                        type="number"
                        label='Basic Value'
                        value={itemData.value || ""}
                        onChange={(e) =>handleChange("value", e.target.value)}
                        disabled
                    />
                </Col>
              
        </Row>
 
     <Row className='mt-1'>
      <Col xl={4} className=''>
      <Card>
      <Row className='mb-1 me-1'>
      <Col xl={3} className='mt-4  text-end'>
      <span className='ms-3'>Discount</span></Col>
     <Col xl={2}>
                    <TextField
                        type="text"
                        label="%age"
                        value={itemData.disc_perc || ""}
                        onChange={(e) =>handleChange("disc_perc", e.target.value)}
                    />
                </Col>
                <Col xl={3}>
                    <TextField
                        type="text"
                        label="per Unit"
                        value={itemData.disc_val || ""}
                        onChange={(e) =>handleChange("disc_val", e.target.value)}
                    />
                </Col>
              
                <Col xl={4} className=''>
                    <TextField
                        type="number"
                        label='Amount'
                        value={itemData.po_disc || ""}
                        onChange={(e) =>handleChange("po_disc", e.target.value)}
                        disabled
                    />
                </Col>
                </Row>
                </Card>
     </Col>
    
    <Col xl={2}>
     <TextField
      type="text"
      label="Devel.Cost"
      value={itemData.development_cost || ""}
      onChange={(e) =>handleChange("development_cost", e.target.value)}
      disabled
    />
    </Col>


        </Row>
          
         <Row className='mt-1'>
      <Col xl={4} className=''>
      <Card>
      <Row className='mb-1 me-1'>
      <Col xl={4} className='mt-4 ms-4 text-end'>
      <span className='ms-4'>SGST/UGST</span></Col>
     <Col xl={2}>
                    <TextField
                        type="text"
                        label="%age"
                        value={itemData.sgst_perc || ""}
                        onChange={(e) =>handleChange("sgst_perc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={4} className=''>
                    <TextField
                        type="number"
                        label='Amount'
                        value={itemData.sgst_val || ""}
                        onChange={(e) =>handleChange("sgst_val", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
      <Row className='mb-1 me-1'>
      <Col xl={4} className=' ms-4 text-end'>
      <span className='ms-4'>CESS</span>
      </Col>
     <Col xl={2} className=''>
                    <TextField
                        type="text"
                        // label="%age"
                        value={itemData.sgst_cess_perc || ""}
                        onChange={(e) =>handleChange("sgst_cess_perc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={4} className=''>
                    <TextField
                        type="number"
                        // label='Amount'
                        value={itemData.sgst_cess_val || ""}
                        onChange={(e) =>handleChange("sgst_cess_val", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
     </Card>
     </Col>
    <Col xl={3} className=''>
      <Card>
      <Row className='mb-1 me-1'>
      <Col xl={4} className='mt-4 text-end'>
      <span className=''>CGST</span></Col>
     <Col xl={3}>
                    <TextField
                        type="text"
                        label="%age"
                        value={itemData.cgst_perc || ""}
                        onChange={(e) =>handleChange("cgst_perc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={5} className=''>
                    <TextField
                        type="number"
                        label='Amount'
                        value={itemData.cgst_val || ""}
                        onChange={(e) =>handleChange("cgst_val", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
      <Row className='mb-1 me-1'>
      <Col xl={4} className='text-end'>
      <span>CESS</span>
      </Col>
     <Col xl={3} className=''>
                    <TextField
                        type="text"
                        // label="%age"
                        value={itemData.cgst_cess_perc || ""}
                        onChange={(e) =>handleChange("cgst_cess_perc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={5} className=''>
                    <TextField
                        type="number"
                        // label='Amount'
                        value={itemData.cgst_cess_val || ""}
                        onChange={(e) =>handleChange("cgst_cess_val", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
     </Card>
     </Col>

      <Col xl={3} className=''>
      <Card>
      <Row className='mb-1 me-1'>
      <Col xl={4} className='mt-4 text-end'>
      <span className=''>IGST</span></Col>
     <Col xl={3}>
                    <TextField
                        type="text"
                        label="%age"
                        value={itemData.igst_perc || ""}
                        onChange={(e) =>handleChange("igst_perc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={5} className=''>
                    <TextField
                        type="number"
                        label='Amount'
                        value={itemData.igst_val || ""}
                        onChange={(e) =>handleChange("igst_val", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
      <Row className='mb-1 me-1'>
      <Col xl={4} className='text-end'>
      <span>CESS</span>
      </Col>
     <Col xl={3} className=''>
                    <TextField
                        type="text"
                        // label="%age"
                        value={itemData.igst_cess_perc || ""}
                        onChange={(e) =>handleChange("igst_cess_perc", e.target.value)}
                        disabled
                    />
                </Col>
                <Col xl={5} className=''>
                    <TextField
                        type="number"
                        // label='Amount'
                        value={itemData.igst_cess_val || ""}
                        onChange={(e) =>handleChange("igst_cess_val", e.target.value)}
                        disabled
                    />
                </Col>
      </Row>
     </Card>
     </Col>
     
        </Row> 

    <Row>
        <Col xl={7}>
        <Row className='d-flex justify-content-end'>
          <Col xl={3}>
        
               <TextField
                        type="number"
                        label='Taxable Amount'
                        value={itemData.taxable_amt || ""}
                        onChange={(e) =>handleChange("taxable_amt", e.target.value)}
                        disabled
                    />
                    </Col>
                    </Row>
           </Col>
           <Col xl={3}>
                  <Row className='d-flex justify-content-end'>
          <Col xl={7}>
        
               <TextField
                        type="number"
                        label='Net Amount'
                        value={itemData.net_val || ""}
                        onChange={(e) =>handleChange("net_val", e.target.value)}
                        disabled
                    />
                    </Col></Row>
             </Col>
      </Row>


    </>
  )
}

export default ApBillEntryItCanTab
