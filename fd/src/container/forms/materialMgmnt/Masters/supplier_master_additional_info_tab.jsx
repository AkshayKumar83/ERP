import React from 'react'
import {Container, Row , Col} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import RadioGroup from '../../../../components/basic/radioGroup'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import { handleValidateField, taxCodeHelpListHeader } from './supplier_master_helper'

const SupplierMasterAdditionalTab = ({formData,formStatus, handleChange, modeOfTrans=[], pricebasis=[], currCodeList=[], termCodeList=[] ,handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader}) => {

  const handleDoubleClick = (field, header) => {
        if (["Insert", "Update"].includes(formStatus)) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
        }
    };
  return (
    <Container>
             <Row >
              <Col sm={12} md={6} lg={3} >
                <span style={{ fontSize: "14px" , fontWeight:'600' }}>Location</span>
                  <RadioGroup
                    className="radio-button-wrapper  box-border mt-1"
                    options={[
                      { text: "Local", value: "L" },
                      { text: "Outstation", value: "O" },
                    ]}
                    onChange={(e) => handleChange("v_loc", e.target.value, e)}
                    checked={formData?.v_loc || "L"}
                  />
                </Col>
                <Col sm={12} md={6} lg={3} >
                <span style={{fontSize: "14px" , fontWeight:'600' }}>Covered Under Excise</span>
                  <RadioGroup
                    className="radio-button-wrapper  box-border mt-1"
                    options={[
                      { text: "Yes", value: "Y" },
                      { text: "No", value: "N" },
                    ]}
                    onChange={(e) => handleChange("covered_excise", e.target.value, e)}
                    checked={formData?.covered_excise || "Y"}
                  />
                </Col>
        </Row> 
        <Row className="mt-1">
        <Col sm={6} md={3} lg={2}>
          <TextField
           maxLength={30}
            type="text"
            label="Contact Person [1]"
            value={formData?.con_per1 || ""}
            onChange={(e) => handleChange("con_per1", e.target.value, e)}
          />
         </Col>
          <Col sm={6} md={3} lg={2} >
           <TextField
               maxLength={30}
            type="text"
            label="Contact Person [2]"
            value={formData?.con_per2 || ""}
            onChange={(e) => handleChange("con_per2", e.target.value, e)}
          />
        </Col>
        <Col sm={6} md={3} lg={2}>
          <TextField
              maxLength={21}
            type="text"
            id="telephone1"
            name='telephone1'
            label="Telephone [1]"
            value={formData?.telephone1 || ""}
            onChange={(e) => handleChange("telephone1", e.target.value, e)}
            onBlur={(e)=>handleValidateField(e,formStatus,formData)}
            required
          />
        </Col>
        <Col sm={6} md={3} lg={2} >
           <TextField
               maxLength={21}
            type="text"
            label="Telephone [2]"
            value={formData?.telephone2 || ""}
            onChange={(e) => handleChange("telephone2", e.target.value, e)}
          />
        </Col>
        <Col sm={12} md={10} lg={4}>
          <TextField
              maxLength={70}
            type="text"
            id="email"
            name="email"
            label="Email"
            value={formData?.email || ""}
            onChange={(e) => handleChange("email", e.target.value, e)}
            onBlur={(e)=>handleValidateField(e,formStatus,formData)}
            required
          />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col sm={6} md={3} lg={3}>
          <TextField
           maxLength={20}
            type="text"
            label="Fax"
            value={formData?.fax || ""}
            onChange={(e) => handleChange("fax", e.target.value, e)}
          />
         </Col>
          <Col sm={6} md={3} lg={3} >
           <TextField
            maxLength={20}
            type="text"
             label="Tariff No"
            value={formData?.tarrif_no || ""}
            onChange={(e) => handleChange("tarrif_no", e.target.value, e)}
          />
        </Col>
        <Col sm={6} md={3} lg={3}>
          <TextField
          maxLength={21}
            type="text"
            label="Telex"
            value={formData?.telex || ""}
            onChange={(e) => handleChange("telex", e.target.value, e)}
          />
        </Col>
        <Col sm={6} md={3} lg={3} >
           <TextField
            maxLength={20}
            type="text"
             label="Grams"
            value={formData?.v_grams || ""}
            onChange={(e) => handleChange("v_grams", e.target.value, e)}
          />
        </Col>
      </Row>
      <Row className="mt-1 d-flex justify-content-center">
              <Col sm={12} md={10} lg={8} >
                <span style={{ fontSize: "14px" , fontWeight:'600' }}>MSME (Micro, Small & Medium Enterprises)</span>
                  <RadioGroup
                    className="radio-button-wrapper  box-border mt-1"
                    options={[
                      { text: "Micro", value: "M" },
                      { text: "Small", value: "S" },
                      { text: "Medium", value: "E" },
                      { text: "Other", value: "O" },
                    ]}
                    onChange={(e) => handleChange("msme_flag", e.target.value, e)}
                    checked={formData?.msme_flag || "E"}
                  />
                </Col>
        </Row>

        <Row className="mt-1">
        <Col sm={12} md={4} lg={3}>
          <TextField
            type="text"
            maxLength={40}
            label="CST Number"
            value={formData?.cst_no || ""}
            onChange={(e) => handleChange("cst_no", e.target.value, e)}
          />
         </Col>
         <Col sm={12} md={4} lg={3}>
          <TextField
           maxLength={40}
            type="text"
            label="LST Number"
            value={formData?.lst_no || ""}
            onChange={(e) => handleChange("lst_no", e.target.value, e)}
          />
        </Col>
         <Col sm={12} md={4} lg={3} >
           <TextField
            maxLength={40}
            type="text"
             label="ECC Number"
            value={formData?.ecc_no || ""}
            onChange={(e) => handleChange("ecc_no", e.target.value, e)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={4} lg={3} >
           <TextField
            type="text"
             label="MSME Regn No."
            value={formData?.msme_regn_no || ""}
            onChange={(e) => handleChange("msme_regn_no", e.target.value, e)}
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <TextField
            type="text"
            maxLength={30}
            label="Tin No."
            value={formData?.tin_no || ""}
            onChange={(e) => handleChange("tin_no", e.target.value, e)}
          />
         </Col>
        <Col sm={12} md={4} lg={3}>
          <TextField
            type="text"
            maxLength={30}
            label="Service Tax No."
            value={formData?.ser_tax_no || ""}
            onChange={(e) => handleChange("ser_tax_no", e.target.value, e)}
          />
        </Col>
      </Row>

      <Row className="mt-1">
      <Col sm="12" md={6} lg={12}>
          <Select
            // required
            label="Term Code"
            name="term_code"
            placeholder={" "}
            value={formData?.term_code || ""}
            onChange={(e) => handleChange("term_code", e.target.value, e,) }
            options={termCodeList}
          />
        </Col>
        <Col sm="12" md={6} lg={2}>
          <Select
            // required
            label="Mode of Transport"
            name="mode_cd"
            placeholder={" "}
            value={formData?.mode_cd || ""}
            onChange={(e) => handleChange("mode_cd", e.target.value, e) }
            options={modeOfTrans}
          />
        </Col>
        <Col sm="12" md={6} lg={2}>
          <Select
            // required
            label="Price Basis"
            name="pric_basis"
            placeholder={" "}
            value={formData?.pric_basis || ""}
            onChange={(e) => handleChange("pric_basis", e.target.value, e,) }
            options={pricebasis}
          />
        </Col>
        <Col sm="12" md={6} lg={2}>
          <Select
            // required
            maxLength={3}
            label="Currency"
            name="curr_cd"
            placeholder={" "}
            value={formData?.curr_cd || ""}
            onChange={(e) => handleChange("curr_cd", e.target.value, e,) }
            options={currCodeList}
          />
        </Col>
      </Row>

      <Row className='mt-1'>
      <Col sm={12} md={6} lg={3} className="button-group-wrapper   ">
            <Checkbox
              text="Direct Bill Create"
              onChange={(e) => handleChange("direct_bill_create", e.target.checked ? "Y" : "N" ,e)}
              checked={formData?.direct_bill_create === "Y"}
            />
          </Col>
          <Col sm={12} md={6} lg={3} className="button-group-wrapper   ">
            <Checkbox
              text="Small Scale Industries"
              onChange={(e) => handleChange("ssi_flag", e.target.checked ? "Y" : "N" ,e)}
              checked={formData?.ssi_flag === "Y"}
            />
          </Col>
          <Col sm={12} md={6} lg={3} className="button-group-wrapper   ">
            <Checkbox
              text="TDS Threshold Limit Applicable"
              onChange={(e) => handleChange("tds_thresh_hold_limit", e.target.checked ? "Y" : "N",e )}
              checked={formData?.tds_thresh_hold_limit === "Y"}
              // disabled
            />
          </Col>
          <Col sm={12} md={6} lg={3} className="button-group-wrapper   ">
            <Checkbox
              text="TDS Applicable"
              onChange={(e) => handleChange("tds_flag", e.target.checked ? "Y" : "N",e )}
              checked={formData?.tds_flag === "Y"}
            />
          </Col>
      </Row>

      <Row className="mt-1">
              <Col sm={12} md={4} lg={3} className='mt-3' >
                  <RadioGroup
                    className="radio-button-wrapper  box-border mt-1"
                    options={[
                      { text: "Company ", value: "C" },
                      { text: "Non Company", value: "N" },
                     
                    ]}
                    onChange={(e) => handleChange("tds_cat", e.target.value, e)}
                    checked={formData?.tds_cat || "N"}
                    disabled={formData?.tds_flag ==='N'}
                  
                  />
                </Col>
                <Col sm={6} md={3} lg={2}>
          <TextField
            type="text"
            label="Tax Info"
            maxLength={5}
            value={formData?.tax_code || ""}
            onChange={(e) => handleChange("tax_code", e.target.value, e)}
            onDoubleClick={() => handleDoubleClick("taxCode", taxCodeHelpListHeader)}
          />
         </Col>
          <Col sm={6} md={3} lg={4} className="mt-4" >
           <TextField
            type="text"
            // label="Party name"
            value={formData?.tax_desc || ""}
            onChange={(e) => handleChange("tax_desc", e.target.value, e)}
            disabled
          />
        </Col>

        </Row>

    </Container>
  )
}

export default SupplierMasterAdditionalTab