import React, { useEffect, useState } from 'react'
import ButtonUi from '../../../../components/basic/button';
import { Col, Container, Form, Row, Table } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { ItemHeader } from './reverse_charge_invoice_helper';
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import RadioGroup from '../../../../components/basic/radioGroup';
import Select from '../../../../components/basic/select';
import RowAction from '../../../../components/common/rowAction';

const ReverseChargeInvoiceItem = ({
  itemDetail = [{}, {}, {}, {}],
  formStatus = "",
  handleChange = () => {},
  itemFormData,
  handleAddRow,
  formData = {},
  controlData={},
  setControlData,
  storageType=[],
  focusedRowIndex,
  setFocusedRowIndex
}) => {


    const triggerAddRow = () => {
      handleAddRow()
    };
    const handleDelete = () => {};
    const handleUpdate = () => {};
  
    const makeFocusOnTableRow = (rowIndex, id) => {
      const entry = itemFormData.find((entry) => entry.sr_no === id);
      setFocusedRowIndex(rowIndex);
      // triggerFamilyDetail(id)
    };



useEffect(() => {
  if (itemFormData?.length > 0) {
    const totalQty = itemFormData.reduce((sum, item) => {
      const qty = parseFloat(item.qty);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);

    setControlData((prev) => ({
      ...prev,
      tot_qty: totalQty,
    }));
  } else {
    setControlData((prev) => ({
      ...prev,
      tot_qty: null, 
    }));
  }
}, [itemFormData]);



  return (
    <Form id="reverse_charge_invoice-form">

      <div className="table-title d-flex justify-content-end">
        {/* <span>Member Directory</span> */}
        {(formStatus === "Insert" || formStatus === "Update") && (
          <ButtonUi
            color="primary"
            className="add-action"
            onClick={triggerAddRow}
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
                  <th className="" style={{ width: "5%" }}>
                    Actions
                  </th>
                )}
                {ItemHeader.map((header, index) => (
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
              {itemFormData.map((data, rowIndex) => (
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
                        canDelete={itemFormData.length > 1}
                        onDelete={() => handleDelete(data, rowIndex)}
                        onUpdate={
                          handleUpdate ? () => handleUpdate(data) : undefined
                        }
                      />
                    </td>
                  )}
                  <td>
                    <TextField
                      required
                      type="text"
                      name="it_code"
                      value={data?.it_code || ""}
                      onChange={(e) =>
                        handleChange("it_code", e.target.value, rowIndex)
                      }
                      
                    />
                  </td>
                  <td>
                    <TextField
                      required
                      type="text"
                      name="it_desc"
                      value={data?.it_desc || ""}
                      onChange={(e) =>
                        handleChange("it_desc", e.target.value, rowIndex)
                      }
                      disabled
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="rate"
                      value={data?.rate ?? ""}
                      onChange={(e) =>
                        handleChange("rate", e.target.value, rowIndex)
                      }
                      
                    />
                  </td>
                  <td>
                    <TextField
                      type="number"
                      name="qty"
                      value={data?.qty ?? ""}
                      onChange={(e) =>
                        handleChange("qty", e.target.value, rowIndex)
                      }
                      
                    />
                  </td>
                  <td>
                    <TextField
                      type="number"
                      name="basic_value"
                      value={data?.basic_value ?? ""}
                      onChange={(e) =>
                        handleChange("basic_value", e.target.value, rowIndex)
                      }
                      disabled
                    />
                  </td>
                  <td>
                    <Checkbox
                      checked={data?.access_flg || false}
                      onChange={(e) => handleChange("access_flg", e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>   </div>
        </SimpleBar>
      </div>

      <Container>
    <Row className="d-flex justify-content-between align-items-center mt-1">
      {/* Left Side */}
      <Col lg={6}>
        <Row className="d-flex justify-content-start">
          <Col lg={3}>
            <TextField
              type="number"
              label="Rate"
              value={itemFormData[focusedRowIndex]?.order_rate ?? ""}
              onChange={(e) => handleChange("order_rate", e.target.value, focusedRowIndex, e)}
              disabled
            />
          </Col>
        </Row>
      </Col>

      {/* Right Side  and this field map is control block */}
      <Col lg={6}>
        <Row className="d-flex justify-content-end">
          <Col lg={3}>
            <TextField
              type="number"
              label="Total Qty"
              value={controlData?.tot_qty ?? ""}
              onChange={(e) => handleChange("tot_qty", e.target.value, focusedRowIndex, e)}
              disabled
              inpClass="bkg-yellow"
            />
          </Col>

          <Col lg={4} className="d-flex align-items-end">
            <label
              htmlFor="perunit"
              style={{ fontSize: "13px", minWidth: "50%", textAlign: "right", paddingRight: "8px" }}
            >
              Rate Per Unit
            </label>
            <TextField
              type="number"
              name="perunit"
              value={itemFormData[focusedRowIndex]?.perunit ?? ""}
              onChange={(e) => handleChange("perunit", e.target.value, focusedRowIndex)}
            />
          </Col>
        </Row>
      </Col>
    </Row>

        <Row className="mt-1">
          <Col >
            <TextField
              type="text"
              label="Catalog Code"
              value={itemFormData[focusedRowIndex]?.catalog_code || ""}
              onChange={(e) => handleChange("catalog_code", e.target.value,focusedRowIndex,e)}
              disabled
            />
          </Col>
          <Col className='mt-4'>
            <Checkbox
              text="Different Assess. Val"
              value={itemFormData[focusedRowIndex]?.assess_flg || ""}
              onChange={(e) => handleChange("assess_flg", e.target.value,focusedRowIndex,e)}
            />
          </Col>
          <Col>
            <TextField
              type="number"
              label="Assess. Rate"
              value={itemFormData[focusedRowIndex]?.assess_rt ?? ""}
              onChange={(e) => handleChange("assess_rt", e.target.value,focusedRowIndex,e)}
             
            />
          </Col>
           <Col className='mt-4' >
            <span style={{fontSize:'12px', fontWeight:'bold', letterSpacing:'2px'}}>A#=Accessories</span>
          </Col>
        </Row>

        <Row className="mt-1">
          <Col lg="3">
            <TextField
              type="text"
              label="Customer Item Code"
              value={itemFormData[focusedRowIndex]?.cus_it_code || ""}
              onChange={(e) => handleChange("cus_it_code", e.target.value,focusedRowIndex,e)}
            />
          </Col>
          <Col lg={6} className="mt-4">
            <TextField
              type="text"
              // label="Customer Item Desc."
              value={itemFormData[focusedRowIndex]?.cus_it_desc || ""}
              onChange={(e) => handleChange("cus_it_desc", e.target.value,focusedRowIndex,e)}
              disabled
            />
          </Col>
          <Col lg={3} className="">
            <TextField
              type="text"
              label="Assess. val"
              value={itemFormData[focusedRowIndex]?.assess_value ?? ""}
              onChange={(e) => handleChange("assess_value", e.target.value,focusedRowIndex,e)}
               disabled
            />
          </Col>
        </Row>
        
        <Row className="mt-1">
          <Col lg={9}>
            <TextField
              type="text"
               label="Invoice Item Desc."
              value={itemFormData[focusedRowIndex]?.invoice_it_desp || ""}
              onChange={(e) => handleChange("invoice_it_desp", e.target.value,focusedRowIndex,e)}
              disabled
            />
          </Col>
          <Col lg={3} className="">
            <Select
              type="text"
              label="Storage type"
              value={itemFormData[focusedRowIndex]?.item_storage_type || ""}
              onChange={(e) => handleChange("item_storage_type", e.target.value,focusedRowIndex,e)}
              options={storageType}
               disabled
            />
          </Col>
        </Row>

       
            <Row className=" mt-2">
            <Col>
            <div className="  col-sm-12 col-md-12 col-lg-12 text-wrapper box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">  GST</span>
              
               

                <Row className=" justify-content-between">
                <Col lg={2} className="mt-4 p-4">
                    <RadioGroup
                      className=" radio-button-wrapper box-border "
                      options={[
                        { text: "%", value: "P" },
                        { text: "Value", value: "A" },
                      ]}
                       onChange={(e) => handleChange("gst_amt_prc", e.target.value ,focusedRowIndex,e)}
                       checked={itemFormData[focusedRowIndex]?.gst_amt_prc || "" }
                    />
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="SGST"
                         value={itemFormData[focusedRowIndex]?.gst_sgst_val ?? ""}
                         onChange={(e) => handleChange("gst_sgst_val",e.target.value ,focusedRowIndex,e)}
                      />
                      <TextField
                        type="number"
                        label="Cess"
                         value={itemFormData[focusedRowIndex]?.gst_sgst_cess_val ?? ""}
                         onChange={(e) =>  handleChange( "gst_sgst_cess_val",  e.target.value,focusedRowIndex,e )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="UGST"
                         value={itemFormData[focusedRowIndex]?.gst_ugst_val ?? ""}
                         onChange={(e) =>  handleChange("gst_ugst_val", e.target.value,focusedRowIndex,e )}
                      />

                      <TextField
                        type="number"
                        label="Cess"
                         value={itemFormData[focusedRowIndex]?.gst_ugst_cess_val ?? ""}
                         onChange={(e) =>  handleChange( "gst_ugst_cess_val", e.target.value ,focusedRowIndex,e)}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="CGST"
                         value={itemFormData[focusedRowIndex]?.gst_cgst_val ?? ""}
                         onChange={(e) =>  handleChange("gst_cgst_val",e.target.value,focusedRowIndex,e )}
                      />
                      <TextField
                        type="number"
                        label="Cess"
                         value={itemFormData[focusedRowIndex]?.gst_cgst_cess_val ?? ""}
                         onChange={(e) =>  handleChange("gst_cgst_cess_val", e.target.value,focusedRowIndex,e )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="IGST"
                         value={itemFormData[focusedRowIndex]?.gst_igst_val ?? ""}
                         onChange={(e) =>  handleChange("gst_igst_val", e.target.value ,focusedRowIndex,e )}
                      />

                      <TextField
                        type="number"
                        label="Cess"
                         value={itemFormData[focusedRowIndex]?.gst_igst_cess_val ?? ""}
                         onChange={(e) =>  handleChange("gst_igst_cess_val", e.target.value ,focusedRowIndex,e )}
                      />
                    </Row>
                  </Col>
                  <Col sm={6} md={3} lg={2}>
                    <Row>
                      <TextField
                        type="number"
                        label="Compensation Cess"
                         value={itemFormData[focusedRowIndex]?.gst_comp_cess_val ?? ""}
                         onChange={(e) =>  handleChange("gst_comp_cess_val", e.target.value ,focusedRowIndex,e )}
                      />
                    </Row>
                  </Col>
                </Row>
              
            </div>
          </Col>
            </Row>
         

         <Row>
         <Col lg={8} className='mt-2'>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Sales Account Head</span>
              <Row>
                  <Col lg={4} className="mt-1">
                  <TextField
                        type="text"
                         label="Sales Account Head "
                         value={itemFormData[focusedRowIndex]?.sale_ac_head || ""}
                         onChange={(e) =>  handleChange("sale_ac_head", e.target.value ,focusedRowIndex,e )}
                      />
                  </Col>
                  <Col lg={8} className="mt-4">
                  <TextField
                        type="text"
                        //  label="Sales Account Head "
                         value={itemFormData[focusedRowIndex]?.sale_ac_desc || ""}
                         onChange={(e) =>  handleChange("sale_ac_desc", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  </Row>
                  
            </div>
          </Col>
         </Row>

         <Row className='mt-2'>
         <Col>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Last Invoice Detail of Current Item</span>
              <Row className='mt-1'>
                  <Col lg={2} className="">
                  <TextField
                        type="text"
                         label="Invoice No. "
                         value={itemFormData[focusedRowIndex]?.last_inv_no || ""}
                         onChange={(e) =>  handleChange("last_inv_no", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="date"
                         label="Invoice dt. "
                         value={itemFormData[focusedRowIndex]?.last_inv_dt || ""}
                         onChange={(e) =>  handleChange("last_inv_dt", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Inv Rate. "
                         value={itemFormData[focusedRowIndex]?.last_inv_rate ?? ""}
                         onChange={(e) =>  handleChange("last_inv_rate", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Discount "
                         value={itemFormData[focusedRowIndex]?.last_di ?? ""}
                         onChange={(e) =>  handleChange("last_di", e.target.value  ,focusedRowIndex,e)}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Inv Qty. "
                         value={itemFormData[focusedRowIndex]?.last_inv_qty ?? ""}
                         onChange={(e) =>  handleChange("last_inv_qty", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                 
                  </Col>
                  
                  </Row>
              <Row className='mt-1'>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="SGST + Cess "
                         value={itemFormData[focusedRowIndex]?.last_sgst ?? ""}
                         onChange={(e) =>  handleChange("last_sgst", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="UGST + Cess "
                         value={itemFormData[focusedRowIndex]?.last_ugst ?? ""}
                         onChange={(e) =>  handleChange("last_ugst", e.target.value  ,focusedRowIndex,e)}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="CGST + Cess "
                         value={itemFormData[focusedRowIndex]?.last_cgst ?? ""}
                         onChange={(e) =>  handleChange("last_cgst", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="IGST + Cess  "
                         value={itemFormData[focusedRowIndex]?.last_igst ?? ""}
                         onChange={(e) =>  handleChange("last_igst", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Comp. Cess  "
                         value={itemFormData[focusedRowIndex]?.last_comp_cess ?? ""}
                         onChange={(e) =>  handleChange("last_comp_cess", e.target.value ,focusedRowIndex,e  )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Inv. Free Qty."
                         value={itemFormData[focusedRowIndex]?.last_inv_free_qty ?? ""}
                         onChange={(e) =>  handleChange("last_inv_free_qty", e.target.value ,focusedRowIndex,e )}
                         disabled
                      />
                  </Col>
                  
                  </Row>
                  
            </div>
          </Col>
         </Row>

{/* below maping data block is main tab block data */}
         <Row className='mt-2'>
         <Col>
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-2 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Totals</span>
              <Row className='mt-1'>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Basic Value "
                         value={formData?.t_basic_val_1 ?? ""}
                         onChange={(e) =>  handleChange("t_basic_val_1", e.target.value )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Discount "
                         value={formData?.t_discount_1 ?? ""}
                         onChange={(e) =>  handleChange("t_discount_1", e.target.value )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Assessable Value "
                         value={formData?.t_ass_val_1 ?? ""}
                         onChange={(e) =>  handleChange("t_ass_val_1", e.target.value  )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="SGST + Cess "
                         value={formData?.t_gst_sgst_amt_1 ?? ""}
                         onChange={(e) =>  handleChange("v", e.target.value  )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="UGST + Cess "
                         value={formData?.t_gst_ugst_amt_1 ?? ""}
                         onChange={(e) =>  handleChange("t_gst_ugst_amt_1", e.target.value   )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="CGST + Cess"
                         value={formData?.t_gst_cgst_amt_1 ?? ""}
                         onChange={(e) =>  handleChange("t_gst_cgst_amt_1", e.target.value  )}
                         disabled
                      />
                  </Col>
                  
                  </Row>
              <Row className='mt-1'>
                 

                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="IGST + Cess  "
                         value={formData?.t_gst_igst_amt_1 ?? ""}
                         onChange={(e) =>  handleChange("t_gst_igst_amt_1", e.target.value  )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Comp. Cess  "
                         value={formData?.t_gst_comp_cess_amt_1 ?? ""}
                         onChange={(e) =>  handleChange("t_gst_comp_cess_amt_1", e.target.value  )}
                         disabled
                      />
                  </Col>
                  <Col lg={2} className="">
                  <TextField
                        type="number"
                         label="Net Amount"
                         value={formData?.net_amt_1 ?? ""}
                         onChange={(e) =>  handleChange("net_amt_1", e.target.value  )}
                         disabled
                          inpClass="bkg-pink"
                      />
                  </Col>
                  
                  </Row>
                  
            </div>
          </Col>
         </Row>
         



{/* 
         <Row className="d-flex justify-content-center mt-4">
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Main')}}> Main Details </ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Despatch')}}>Despatch</ButtonUi>
          </Col>
          <Col lg={2}>
            <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Payment')}}>Payment</ButtonUi>
          </Col>
         </Row> */}
      </Container>
    </Form>
  )
}

export default ReverseChargeInvoiceItem