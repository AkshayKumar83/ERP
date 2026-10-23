import React from 'react'
import { Card, Col, Container, Form, Row } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import RadioGroup from '../../../../components/basic/radioGroup'
import Checkbox from '../../../../components/basic/checkbox'
import { accHelpListHeader, handleValidateField, saleAccDescHelpListHeader, taxCodeHelpListHeader } from './tax_parameter_master_helper'

const TaxParameterMasterDetails = ({formData, handleChange, formStatus,handleHelpList = () => {},
setHelpFor,setHelpListHeader,}) => {

  const handleDoubleClick = (field, header) => {
     if (field === "TaxCode" && formStatus !== "Search") {
    return; // kuch na kare
  }
    if(['Insert',"Search",'Update'].includes(formStatus)) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  return (
    <Form id='tax-parameter'>
     
        <Card className='' >
          <Container className='my-2'> 
        {/* <Row className='m-4 mt-2'> */}
        <Row >
            <Col sm={6} md={6} xl={3} >
            <TextField
           type="text"
           label="Tax Code"
           name='tax_code'
          value={formData?.tax_code || ""}
           maxLength={5}
           onChange={(e) =>  handleChange("tax_code",e.target.value,e) }
           onBlur = {(e)=>handleValidateField(e,formStatus)}
           onDoubleClick={() => handleDoubleClick("TaxCode", taxCodeHelpListHeader)}
           required
          />
        </Col>
        <Col sm={6} md={6} xl={8} className=''>
            <TextField
           type="text"
           label='Tax Desc'
           name='tax_desc'
           maxLength={50}
          value={formData?.tax_desc || ""}
           onChange={(e) => handleChange("tax_desc",e.target.value,e) }
          onBlur = {(e)=>handleValidateField(e,formStatus,)}
        required
          />
        </Col>
        </Row>

        <Row className='mt-1'>
            <Col sm={6} md={6} xl={3} >
            <TextField
           type="text"
           label="Tax Account Code"
           maxLength={20}
          value={formData?.acc_no || ""}
           onChange={(e) =>  handleChange("acc_no",e.target.value,e) }
           onDoubleClick={() => handleDoubleClick("AccNo", accHelpListHeader)}
          />
        </Col>
        <Col sm={6} md={6} xl={8} className='mt-4'>
            <TextField
           type="text"
          value={formData?.acc_desc || ""}
           onChange={(e) => handleChange("acc_desc",e.target.value,e) }
           disabled
          />
        </Col>
        </Row>

        <Row className='mt-1' >
            <Col sm={6} md={6} xl={3} >
            <TextField
            required
           type="text"
           label="Sale Account Head"
           name='sale_acc_head'
           maxLength={20}
          value={formData?.sale_acc_head || ""}
           onChange={(e) =>  handleChange("sale_acc_head",e.target.value,e) }
          onDoubleClick={() => handleDoubleClick("SaleAccNo", saleAccDescHelpListHeader)}
          onBlur = {(e)=>handleValidateField(e,formStatus,)}
          />
        </Col>
        <Col sm={6} md={6} xl={8} className='mt-4'>
            <TextField
          type="text"
         value={formData?.sale_acc_head_desc || ""}
          onChange={(e) =>handleChange ("sale_acc_head_desc", e.target.value,e)}
          disabled
          />
        </Col>
        </Row>

     <Row className="mt-3">
       <Col sm={12} md={8} xl={3} className="mt-sm-1 mt-md-1 mt-xl-0">
            <div className="text-wrapper">
               <span className="text-label">Tax Applicable On</span>
               <RadioGroup
                 className="radio-button-wrapper flex-wrap  box-border py-sm-2 py-md-2 py-xl-2"
                 options={[
                   { text: "Sale", value: "S" },
                   { text: "Purchase", value: "P" },
                   { text: "None", value: "N" },
                 ]}
                 onChange={(e) => handleChange("sal_or_pur", e.target.value,e)}
                 checked={formData?.sal_or_pur || "S"}
               />
            </div>
        </Col>

        <Col sm={12} md={12} xl={6} className="mt-sm-3 mt-md-3 mt-xl-0" >
        <div className='text-wrapper'>
            <span className='text-label'>Tax Type</span>
            <RadioGroup  className='radio-button-wrapper flex-wrap box-border  py-sm-2 py-md-2 py-xl-2'
            options={[
                { text: "LST", value: "L"},
                { text: "CST", value: "C"},
                { text: "Excise", value:"E"},
                { text: "TDS", value: "T"},
                { text: "None", value:"N"},
            ]}
            onChange={(e) => handleChange("st_type", e.target.value,e)}
            checked={formData?.st_type || "L"}
            />
        </div>
        </Col>

          <Col sm={12} md={6} xl={2} className="mt-sm-3 mt-md-3 mt-xl-0" >
          <div className='text-wrapper'>
            <span className='text-label'>Tax In</span>
              <RadioGroup  className='radio-button-wrapper box-border  py-sm-2 py-md-2 py-xl-2'
                options={[
                    { text: "%", value: "P"},
                    { text: "Value", value: "V"},
                ]}
                onChange={(e) => handleChange("st_prc_val", e.target.value,e)}
                checked={formData?.st_prc_val || "P"}
              />
             </div>
          </Col>
        </Row>

        <Row className='mt-1'>
            <Col sm={12} md={6} xl={3} >
            <TextField
            required
           type="text"
           label="Form Name"
           name='st_form'
           maxLength={10}
          value={formData?.st_form || ""}
           onChange={(e) =>  handleChange("st_form",e.target.value,e) }
           onBlur = {(e)=>handleValidateField(e,formStatus,)}
          />
        </Col>
        <Col sm={12} md={6} xl={2} >
            <TextField
           type="number"
            label="Tax Percentage"
          value={formData?.tax_perc ?? ""}
           onChange={(e) => handleChange("tax_perc",e.target.value,e) }
          />
        </Col>
        <Col sm={12} md={6} xl={2} >
            <TextField
           type="number"
           label="Surcharge Percentage"
          value={formData?.surch_per ?? ""}
           onChange={(e) =>  handleChange("surch_per",e.target.value,e) }
          />
        </Col>
        </Row>

        <Row className='mt-2'>
          <Col md={4} xl={3}  className="button-group-wrapper ">
            <Checkbox
              text="Refundable"
              onChange={(e) =>
                handleChange("refundable", e.target.checked ? "Y" : "N"   ) }
              checked={formData?.refundable === "Y"}
            />
          </Col>
          <Col md={6} xl={3}  className="button-group-wrapper ">
            <Checkbox
             text="Separate in Purchase Voucher"
              onChange={(e) =>
                handleChange("separate_in_vch", e.target.checked ? "Y" : "N")} 
              checked={formData?.separate_in_vch === "Y"}
            />
          </Col>
          <Col md={2} xl={3}  className="button-group-wrapper ">
            <Checkbox
             text="Active"
              onChange={(e) =>
                handleChange("active", e.target.checked ? "Y" : "N")  }
                checked={formData?.active === "Y"}
            />
          </Col>
        </Row>
        {/* </Row> */}
         </Container>
        </Card>
   
    </Form>
  )
}

export default TaxParameterMasterDetails