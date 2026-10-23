import React, { useEffect } from "react";
import { Row, Col, Container } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Select from "../../../../components/basic/select";
import RadioGroup from "../../../../components/basic/radioGroup";
import Checkbox from "../../../../components/basic/checkbox";
import { cityHelpListHeader, CustomerHelpListHeader, CustomerNameHelpListHeader, handleValidateField, setShipBillFlag, shipBillCodeHelpListHeader, supplierCodeHelpListHeader, validateCcode, validateShipBillCd } from "./customer_master_helper";

const CustomerMasterMainTab = ({ formData, handleChange, formStatus,  handleHelpList = () => {},setHelpFor, setHelpListHeader,custType=[],custInd=[],   diShipBillCode,
    handleDiShipBillCode=()=>{}}) => {

    // Function to determine label based on ship_bill_flag
    // const getShipBillLabel = () => {
    //   switch (formData?.ship_bill_flag) {
    //     case "S":
    //       return "Ship To Code";
    //     case "B":
    //       return "Bill To Code";
    //     case "A":
    //       return "Ship/Bill To Code";
    //     default:
    //       return ""; // Empty label when "None" is selected
    //   }
    // };

     const handleDoubleClick = (field, header) => {
      if (["Insert","Search", "Update"].includes(formStatus)) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
        }
    };

         const ValidateFieldFromDB=(e, data, setData, formStatus, cb)=>{
        if(!formData?.c_name){
            toast.error('Customer Name cannot be left blank')
            setData({...data, c_city_name:''})
            return;
        }
        if(e.key === 'Enter' || e.key === 'Tab'){
            cb(e, setData, data, formStatus);
        }
    }
  
    
    // const handleShipBillCodeField = ()=>{
    //     let labelVal = setShipBillFlag(formData.ship_bill_flag)
    //     if(!labelVal){
    //         handleDiShipBillCode('')
    //         handleChange('ship_bill_code',  '')
    //         handleChange('ship_bill_name',  '')
    //     }
    //     handleDiShipBillCode(labelVal)
    // }
    
    const handleShipBillCodeField = () => {
    const labelVal = setShipBillFlag(formData.ship_bill_flag);
    if (!labelVal) {
        handleDiShipBillCode('');
        handleChange( "ship_bill_code", '', null);
        handleChange( "ship_bill_name", '', null);
    }
    handleDiShipBillCode(labelVal);
};
    
    //c_code validate
    const handleCCodeBlur = async (e) => {
        if (formStatus === "Insert" || formStatus === "Update") {
            const isValid = await validateCcode(formData.c_code, formData.ccode_auto);
            if (!isValid) {
                document.getElementById("c_code").focus(); // Corrected ID selector and added parentheses
            }
        }
    };
    // ship_bill_code validate
    const handleShipBillCodeBlur = async (e) => {
        if (formStatus === "Insert" || formStatus === "Update") {
            const isValid = await validateCcode(formData.c_code);
            if (!isValid) {
                document.getElementById("c_code").focus(); // Corrected ID selector and added parentheses
            }
        }
    };

    useEffect(() => {
        handleShipBillCodeField();
    }, [formData.ship_bill_flag]);




  return (
    <Container>
      <Row>
        <Col sm={12} md={4} lg={2}>
          <TextField
            type="text"
            id='c_code'
            name='c_code'
            label="Customer Code"
            value={formData?.c_code || ""}
            onChange={(e) => handleChange("c_code", e.target.value ,e)}
            // onBlur={(e) => handleValidateField(e,formStatus)}
            // disabled={formData.ccode_auto === "Y" || formStatus === 'Update'}
           disabled={formStatus !== 'Search'}
            onDoubleClick={() => handleDoubleClick("CCode",CustomerHelpListHeader)}  
            //  required={formData.ccode_auto ==='N'?true:false}
          />
        </Col>
        <Col sm={12} md={4} lg={5}>
                <TextField
                  type="text"
                  id='c_name'
                  name='c_name'
                  label="Name"
                  value={formData?.c_name || ""}
                   onBlur={(e) => handleValidateField(e,formStatus)}
                  onChange={(e) => handleChange("c_name", e.target.value ,e)}
                   onDoubleClick={() => handleDoubleClick("CName",CustomerNameHelpListHeader)}  
                 required
                />
        </Col>
        <Col sm={12} md={4} lg={4} className="mt-4">
          <TextField
            type="text"
            value={formData?.c_name1 || ""}
            onChange={(e) => handleChange("c_name1", e.target.value ,e)}
           
          />
        </Col>
      </Row>

      <Row className="mt-1">
        <Col sm={12} md={4} lg={4}>
          <Select
            label="Customer Type"
            id='cust_type'
            name="cust_type"
            placeholder={" "}
            value={formData?.cust_type || ""}
            onChange={(e) => handleChange("cust_type", e.target.value ,e) }
            onBlur={(e) => handleValidateField(e,formStatus)}
            options={custType}
             required
            
          />
        </Col>
        <Col sm={12} md={4} lg={3}>
          <Select
            label="Industry"
            name="c_industry_type"
            placeholder={" "}
            value={formData?.c_industry_type || ""}
            onChange={(e) =>handleChange("c_industry_type", e.target.value,e ) }
            // onBlur={(e) => handleValidateField(e,formStatus)}
            options={custInd}
            // required
            
          />
        </Col>
        <Col sm={12} md={4} lg={3} className="mt-1">
          <TextField
            type="text"
            label="Short Name"
            value={formData?.cshort_name || ""}
            onChange={(e) => handleChange("cshort_name", e.target.value ,e)}
          />
        </Col>
      </Row>

      <Row className="d-flex flex-row align-items-end mt-1">
        <Col sm={12} md={4} lg={3}>
          <TextField
            type="text"
            id='ship_bill_code'
            name='ship_bill_code'
            // label="DI_SHIP_BILL_CODE"
            label={diShipBillCode} // Dynamic label
            value={formData?.ship_bill_code || ""}
            onChange={(e) => handleChange("ship_bill_code", e.target.value ,e)}
            onDoubleClick={() => handleDoubleClick("shipBillCode",shipBillCodeHelpListHeader)}     
            onBlur={(e)=>{validateShipBillCd(formData, diShipBillCode)}}
            disabled={formData.ship_bill_flag === 'N'}
            required
          />
        </Col>
        <Col sm={12} md={8} lg={6}>
          <TextField
            type="text"
            label="Name"
            value={formData?.ship_bill_name || ""}
            onChange={(e) => handleChange("ship_bill_name", e.target.value ,e)}
            disabled
          />
        </Col>
      </Row>

      <Row className="d-flex justify-content-between mt-1">
        <Col sm={12} md={10} lg={2}>
          <Row className="ms-4 mt-lg-4 mt-md-2 mt-sm-2">
            <RadioGroup
              className="d-flex flex-wrap justify-content-between box-border radio-button-wrapper"
              options={[
                { text: "None", value: "N" },
                { text: "Ship To", value: "S" },
                { text: "Bill To", value: "B" },
                { text: "Both ", value: "A" },
              ]}
              onChange={(e) => handleChange("ship_bill_flag", e.target.value ,e)}
              checked={formData?.ship_bill_flag || "N"}
            />
          </Row>
          
        </Col>
        <Col md={12} lg={8}>
          <Row>
            <TextField
              type="text"
              id='c_add1'
              name='c_add1'
              label="Address"
              value={formData?.c_add1 || ""}
              onChange={(e) => handleChange("c_add1", e.target.value ,e)}
              onBlur={(e)=> handleValidateField(e,formStatus)}
              required
            />
          </Row>
          <Row className="mt-1">
            <TextField
              type="text"
              value={formData?.c_add2 || ""}
              onChange={(e) => handleChange("c_add2", e.target.value ,e)}
            />
          </Row>
          <Row className="mt-1">
            <TextField
              type="text"
              value={formData?.c_add3 || ""}
              onChange={(e) => handleChange("c_add3", e.target.value , e)}
            />
          </Row>
        </Col>
      </Row>

      <Row className="mt-1">
        <Col lg={4}>
          <Row className="ms-1 mt-3">
            <Col sm={12} md={10} lg={10} className=" ">
              <div className="text-wrapper">
                <span className="text-label">Customer Location</span>
                <RadioGroup
                  className="flex-wrap p-2 box-border radio-button-wrapper"
                  options={[
                    { text: "Local", value: "L" },
                    { text: "Inter State", value: "I" },
                    { text: "Foreign", value: "F" },
                  ]}
                  onChange={(e) => handleChange("local_flag", e.target.value ,e)}
                  checked={formData?.local_flag || "L"}
                />
              </div>
            </Col>
          </Row>

          <Row className="ms-3">
            <Col  sm={12}  md={12}  lg={10}  className="button-group-wrapper mt-3" >
              <Checkbox
                text="Active"
                onChange={(e) => handleChange("active", e.target.checked ? "Y" : "N",e)}
                checked={formData?.active === "Y"}
              />
            </Col>
          </Row>
          <Row className="ms-3">
            <Col  sm={12}  md={12}  lg={10}  className="button-group-wrapper mt-1"  >
              <Checkbox
                text="Print QR Code"
                onChange={(e) =>handleChange("print_qr_code", e.target.checked ? "Y" : "N",e) }
                checked={formData?.print_qr_code === "Y"}
              />
            </Col>
          </Row>
          <Row className="ms-3">
            <Col  sm={12}  md={12}  lg={10}  className="button-group-wrapper mb-1 mt-1"  >
            <Checkbox
              text="Way Bill/Road permit Required"
              onChange={(e) =>  handleChange("st38_flag", e.target.checked ? "Y" : "N",e) }
              checked={formData?.st38_flag === "Y"}
            />
            </Col>
          </Row>
        </Col>

        <Col lg={8}>
          <Row >
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                id='c_city_name'
                name='c_city_name'
                label="City"
                value={formData?.c_city_name || ""}
                onChange={(e) => handleChange("c_city_name", e.target.value ,e)}
                onDoubleClick={() => handleDoubleClick("city", cityHelpListHeader)}
                onBlur={(e)=> handleValidateField(e,formStatus,)}
             // onKeyDown={(e) =>ValidateFieldFromDB(e, formData, setFormDataOnValidateField, formStatus, validateCity)}
             required
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="District"
                value={formData?.c_district || ""}
                onChange={(e) => handleChange("c_district", e.target.value ,e)}
                disabled
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="State"
                value={formData?.c_state || ""}
                onChange={(e) => handleChange("c_state", e.target.value ,e)}
                disabled
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Zone"
                value={formData?.c_zone || ""}
                onChange={(e) => handleChange("c_zone", e.target.value,e )}
                disabled
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Country"
                value={formData?.c_country || ""}
                onChange={(e) => handleChange("c_country", e.target.value ,e)}
                disabled
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Region"
                value={formData?.c_region || ""}
                onChange={(e) => handleChange("c_region", e.target.value ,e)}
                disabled
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                id='c_zip_code'
                name='c_zip_code'
                label="Pin Code"
                value={formData?.c_zip_code || ""}
                onChange={(e) => handleChange("c_zip_code", e.target.value,e )}
                onBlur={(e)=> handleValidateField(e,formStatus)}
                required
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="E-Mail"
                value={formData?.email || ""}
                onChange={(e) => handleChange("email", e.target.value ,e)}
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Website"
                value={formData?.telex || ""}
                onChange={(e) => handleChange("telex", e.target.value ,e)}
              />
            </Col>
          </Row>

          <Row className="mt-1">
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Company telephone [1]"
                value={formData?.telephone1 || ""}
                onChange={(e) => handleChange("telephone1", e.target.value ,e)}
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Company telephone [2]"
                value={formData?.telephone2 || ""}
                onChange={(e) => handleChange("telephone2", e.target.value ,e)}
              />
            </Col>
            <Col sm={12} md={4} lg={4}>
              <TextField
                type="text"
                label="Fax"
                value={formData?.fax || ""}
                onChange={(e) => handleChange("fax", e.target.value ,e)}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <div className="col-lg-10 col-md-10 col-sm-10 border p-2 text-wrapper box customer-height ms-3 mt-lg-2 mt-md-3 mt-sm-3">
        <span className="text-label">Customer is supplier</span>
        <Row>
          <Col md={6} lg={6}>
            <TextField
              type="text"
              label="Supplier Code"
              value={formData?.c_v_code || ""}
              onChange={(e) => handleChange("c_v_code", e.target.value ,e)}
                 onDoubleClick={() => handleDoubleClick("supplierCode", supplierCodeHelpListHeader)}
            />
          </Col>
          <Col md={6} lg={6}>
            <TextField
              type="text"
              label="Name"
              value={formData?.c_v_name || ""}
              onChange={(e) => handleChange("c_v_name", e.target.value ,e)}
              disabled
            />
          </Col>
        </Row>
      </div>

      <Row className="mt-1">
        <Col md={6} lg={3}>
          <TextField
            type="text"
            label="Customer Legal Name"
            value={formData?.c_legal_name || ""}
            onChange={(e) => handleChange("c_legal_name", e.target.value,e )}
          />
        </Col>
        <Col md={6} lg={2}>
          <TextField
            type="text"
            label="Dist in Km"
            value={formData?.trans_dist_km || ""}
            onChange={(e) => handleChange("trans_dist_km", e.target.value ,e)}
          />
        </Col>

        <Col md={6} lg={3}>
          <TextField
            type="text"
            label="Create By"
            value={formData?.create_by || ""}
            onChange={(e) => handleChange("create_by", e.target.value,e)}
            disabled
          />
        </Col>
        <Col md={6} lg={3}>
          <TextField
            type="text"
            label="Update By"
            value={formData?.update_by || ""}
            onChange={(e) => handleChange("update_by", e.target.value,e )}
            disabled
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerMasterMainTab;


