


import React from 'react'
import { Col, Form, Row } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import { chalanNoHelpListHeader, consNoHelpListHeader, custHelpListHeader,
handleFillItems, manurHelpListHeader, orderNoHelpListHeader,  shipToHelpListHeader,  validateChlnDate,  validateVendorChlnNO,  vendorHelpListHeader } from './gate_entry_helper'

const GateEntryHeader = ({ 
  formData,
  handleChange,
  formStatus,
  openHelpList,
  setFormData,
  setDetailData,
  user,
  detailData,
  disableFreight

}) => {

  const changeCustVendorHelp = (formData)=>{
    const {material_fr} = formData

    if(material_fr === 'S'){
      console.log('material_fr is S and vendor helplist is open')
      openHelpList("v_code", vendorHelpListHeader)
    }else{
      console.log('material_fr is S and customer helplist is open')
      openHelpList("c_code", custHelpListHeader)
    }
  }


  return (
  <Form id='gate-entry-hdr-form'>
    <Row className="">
        <Col xl={3} className="">
          <div className="text-wrapper">
            <span className="text-label">Material From</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Supplier", value: "S" },
                { text: "Customer", value: "C" },
              ]}
              onChange={(e) => handleChange(e, "material_fr", e.target.value)}
              checked={formData?.material_fr || "S"}
              name= 'material_fr'
            />
          </div>
        </Col>
        <Col  xl={4} className="">
          <div className="text-wrapper">
            <span className="text-label"> From Supplier</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Regular", value: "0" },
                { text: "Cash Receipt", value: "5" },
                { text: "RMGP", value: "4" },
              ]}
              onChange={(e) => handleChange(e, "sale_return", e.target.value)}
              checked={formData?.sale_return || "0"}
              name ='sale_return'
              disabled = {formData?.material_fr === 'C'}
            />
          </div>
        </Col>
        <Col  xl={4} className="">
          <div className="text-wrapper">
            <span className="text-label">Stock Transfer</span>
             <RadioGroup
               className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Against Invoice", value: "I" },
                { text: "Against NRMGP", value: "R" },
                { text: "None", value: "N" },
              ]}
              onChange={(e) => handleChange(e, "inter_div", e.target.value)}
              checked={formData?.inter_div || "I"}
              name='inter_div'
            />
          </div>
        </Col>
      </Row>

    <Row className="mt-3">
        <Col xl={2} className="">
          <div className="text-wrapper">
            <span className="text-label">Material Type</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "OK", value: "O" },
                { text: "Rejection", value: "R" },
              ]}
              onChange={(e) => handleChange(e, "ok_rej", e.target.value)}
              checked={formData?.ok_rej || "O"}
              name="ok_rej"
            />
          </div>
        </Col>
        <Col xl={2} className="">
          <div className="text-wrapper">
            <span className="text-label">Ship To Type</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Eddal", value: "E" },
                { text: "Member", value: "M" },
              ]}
              onChange={(e) => handleChange(e, "ship_to_type", e.target.value)}
              checked={formData?.ship_to_type || "M"}
              name= 'ship_to_type'
            />
          </div>
        </Col>
        <Col  xl={8} className="">
          <div className="text-wrapper">
            <span className="text-label"> From Customer</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "For Repair", value: "2",  },
                { text: "Warranty Return", value: "3" },
                { text: "Against D3", value: "6" },
                { text: "Against Customer 57 F4", value: "1" },
                { text: "Against Customer ETS", value: "7" },
              ]}
              onChange={(e) => handleChange(e, "sale_return", e.target.value)}
              // onBlur = {(e)=> validateSaleReturn({sale_return: e.target.value, setFormData, formData})}
              checked={formData?.sale_return || ""}
              name="sale_return"
              disabled = {formData?.material_fr === 'S'}
            />
          </div>
        </Col>
      </Row>

    <Row className="mt-1">
         <Col xl={2}>
            <TextField
              type="text"
              label={['Insert', 'Query'].includes(formStatus)?`${formData?.inw_no} ${formData?.inw_no1}`:'-'}
              name="inward_control_no"
              value={formData?.inward_control_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="text"
              label="Gate Entry No."
              name="ge_no"
              disabled = {formStatus != 'Search'}
              value={formData?.ge_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col xl={2}>
            <TextField
              type="date"
              label="Date"
               name="ge_date"
              value={formData?.ge_date || ""}
              required
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
            />
          </Col>

          <Col  xl={6} className="mt-2">
          <div className="text-wrapper">
            <span className="text-label">Transaction Type</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Normal", value: "N" },
                { text: "Return as it is", value: "R" },
                { text: "Process Rej", value: "P" },
                { text: "Material Rej", value: "M" },
                { text: "Scrap", value: "S" },
              ]}
              onChange={(e) => handleChange(e, "material_type", e.target.value)}
              checked={formData?.material_type || "N"}
              name="material_type"
            />
          </div>
        </Col>

      </Row>
      <Row className='mt-1'>
          <Col xl={1}>
            <TextField
              type="text"
              label="Party"
              name="v_code"
              value={formData?.v_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // onDoubleClick={(e) =>openHelpList("v_code", vendorHelpListHeader)}
              onDoubleClick={(e) =>changeCustVendorHelp(formData)}
              required
            />
          </Col>
          <Col xl={4} className='mt-4'>
            <TextField
              type="text"
               name="v_name"
              value={formData?.v_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>

        {/* <Col xl={2} className="">
          <div className="text-wrapper">
            <span className="text-label">Ship To</span>
            <RadioGroup
              className="radio-button-wrapper Transaction-height  box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Eddal", value: "S" },
                { text: "Member", value: "C" },
              ]}
              onChange={(e) => handleChange(e, "material_fr", e.target.value)}
              checked={formData?.material_fr || "S"}
              name= 'material_fr'
            />
          </div>
        </Col> */}

          <Col xl={1}>
            <TextField
              type="text"
              label="Ship To"
              name="ship_to"
              value={formData?.ship_to || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // onDoubleClick={(e) =>openHelpList("v_code", vendorHelpListHeader)}
              // onDoubleClick={(e) =>changeCustVendorHelp(formData)}
              onDoubleClick={(e) =>openHelpList("ship_to", shipToHelpListHeader)}
              required
            />
          </Col>
          <Col xl={4} className='mt-4'>
            <TextField
              type="text"
               name="ship_to_name"
              value={formData?.ship_to_name || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
           {/* <Col xl={2}>
            <TextField
              type="text"
              label="Consignment No "
               name="cons_no"
              value={formData?.cons_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>openHelpList("cons_no", consNoHelpListHeader)}
            />
          </Col> */}
            {/* <Col className="mt-3">
              <ButtonUi color="dark">
                Fill Data
              </ButtonUi>
            </Col> */}
        </Row>

      <Row className='mt-1'>
          <Col xl={2}>
            <TextField
              type="text"
              label="Challan No."
              name="chln_no"
              // required
              value={formData?.chln_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>openHelpList("chln_no", chalanNoHelpListHeader)}
              onBlur={(e) => validateVendorChlnNO({ e, ge_id: formData.ge_id, v_code: formData?.v_code, chln_no: formData?.chln_no, formStatus: formStatus })}
              maxlength={20}
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="Date"
              label="Date"
               name="chln_date"
              value={formData?.chln_date || ""}
              // required
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // onBlur={(e) =>
              //   validateChlnDate({
              //     chln_date: e.target.value,
              //     ge_date: formData?.ge_date, // must be already in header data
              //     formStatus,
              //     setFormData,
              //   })
              // }
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="text"
              label="Invoice No"
              name="invoice_no"
              value={formData?.invoice_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="Date"
              label="Invoice Date"
              name="invoice_dt"
              value={formData?.invoice_dt || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
        <Col xl={2}>
            <TextField
              type="text"
              label="Order No"
              name="order_no"
              value={formData?.order_no || ""}
              disabled={formData?.material_fr === 'S'}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>openHelpList("order_no", orderNoHelpListHeader)}
            />
          </Col>
          <Col xl={1} className=''>
            <TextField
              type="text"
              label='Ord Amd No.'
              name="amd_no"
              value={formData?.amd_no || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col>
          {/* <Col className="mt-3">
            <ButtonUi 
              color="dark"
              onClick={(e)=>handleFillItems({formData, user, setDetailData})}
            >
              Fill Items
            </ButtonUi>
          </Col> */}
        </Row>

      <Row className='mt-1'>
          <Col xl={2}>
            <TextField
              type="number"
              label="Freight Charges Without GST"
              name="freight_charges"
              value={formData?.freight_charges || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
//              disabled={
//   formStatus === "Insert" &&
//   !detailData?.some(row => row.po_no)
// }

//  disabled={disableFreight}
              // onDoubleClick={(e) =>openHelpList("freight_charges", manurHelpListHeader)}
            />
          </Col>
          <Col xl={1}>
            <TextField
              type="number"
              label="GST %"
              name="transport_chg_gst_perc"
              value={formData?.transport_chg_gst_perc || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // onDoubleClick={(e) =>openHelpList("freight_charges", manurHelpListHeader)}
              disabled={Number(formData.freight_charges || 0) <= 0}
            />
          </Col>
          <Col xl={2}>
            <TextField
              type="number"
              label="Other Charges Include GST"
              name="other_charges"
              value={formData?.other_charges || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              // onDoubleClick={(e) =>openHelpList("freight_charges", manurHelpListHeader)}
            />
          </Col>

          {/* <Col xl={2}>
            <TextField
              type="text"
              label="Manufacturer"
              name="manuf_code"
              value={formData?.manuf_code || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              onDoubleClick={(e) =>openHelpList("manuf_code", manurHelpListHeader)}
            />
          </Col>
          <Col xl={4} className='mt-4'>
            <TextField
              type="text"
               name="manufacturer_desc"
              value={formData?.manufacturer_desc || ""}
              onChange={(e) => handleChange(e, e.target.name, e.target.value)}
              disabled
            />
          </Col> */}

           <Col className="">
              <p
                style={{
                  textAlign: "center",
                  color: "red",
                  fontWeight: "Bold",
                  fontSize: "14px",
                }}
              >
                {formData?.cancel_ge == 'Y'?'Gate Entry Cancelled':''}
              </p>
            </Col>
        </Row>

  </Form>
  )
}

export default GateEntryHeader
