import React from "react";
import { Container, Row, Col, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import { cityHelpListHeader, handleValidateField, validateCity, validateVcode, validateVname, vendorNameHelpListHeader } from "./supplier_master_helper";

const SupplierMasterMainTab = ({
  formData,
  handleChange = ()=>{},
  formStatus,
  vendType = [],
  vendorNameList,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
   setFormDataOnValidateField, 
    diLastCode, 
    handleDiLastCode
}) => {
 
  const handleDoubleClick = (field, header) => {
  // Help fields for QUERY mode
  const queryHelpFields = ["vendorCode", "vendorName"];  // Only for Search
  // Help fields for INSERT/UPDATE mode
  const editHelpFields = ["city"];            // Only for Insert/Update

  if (
    (formStatus === "Search" && queryHelpFields.includes(field)) ||
    ((formStatus === "Insert" || formStatus === "Update") && editHelpFields.includes(field))
  ) {
    setHelpFor(field);
    setHelpListHeader(header);
    handleHelpList(true);
  }
};

  // const handleDoubleClick = (field, header) => {
  //       if (["Insert","Update","Search",].includes(formStatus)) {
  //           setHelpFor(field);
  //           setHelpListHeader(header);
  //           handleHelpList(true);
  //       }
  //   };

  // const handleValidateField=(e, data, setData, formStatus, cb)=>{
  //       if(!formData?.v_name){
  //           toast.error('Vendor Name cannot be left blank')
  //           setData({...data, v_city_name:''})
  //           return;
  //       }
  //       if(e.key === 'Enter' || e.key === 'Tab'){
  //           cb(e, setData, data, formStatus);
  //       }
  //   }

    // const handleVCodeBlur = async () => {
    //     if(formStatus === 'Insert' || formStatus ==='Update'){

    //         const isValid = await validateVcode(formData?.v_code, formData?.vcode_auto);
    //         if (!isValid) {
    //             document.getElementById('v_code').focus(); // Corrected ID selector and added parentheses
    //         }
    //     }
    // };

    const handleVNameBlur = async () => {
        if(formStatus === 'Insert' || formStatus ==='Update'){
            const isValid = await validateVname(formData, handleDiLastCode);
            if (!isValid) {
                document.getElementById('v_name').focus(); // Corrected ID selector and added parentheses
            }
        }
    };


  return (
    <Container>
      <Card>
        <Row className=" p-2">
          <Row className=" ms-3">
            <Col sm={12} md={6} lg={2} className="button-group-wrapper">
              <Checkbox
                text="Expense Vendor"
                onChange={(e) =>
                  handleChange("expense_flg", e.target.checked ? "Y" : "N", e)
                }
                checked={formData?.expense_flg === "Y"}
              />
            </Col>
            <Col sm={12} md={6} lg={2} className="button-group-wrapper">
              <Checkbox
                text="Manufacturer/Importer"
                onChange={(e) =>
                  handleChange("manuf_flag", e.target.checked ? "Y" : "N", e)
                }
                checked={formData?.manuf_flag === "Y"}
              />
            </Col>
            <Col sm={12} md={12} lg={3} className="button-group-wrapper">
              <Checkbox
                text="Reverse Charge Applicable Always"
                onChange={(e) =>handleChange("rc_applicable", e.target.checked ? "Y" : "N", e)}
                checked={formData?.rc_applicable === "Y"}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={6} md={2} lg={2}>
              <TextField
                maxLength={19}
                type="text"
                label="Code"
                value={formData?.v_code || ""}
                onChange={(e) => handleChange("v_code", e.target.value, e)}
                 onDoubleClick={() => handleDoubleClick("vendorCode", vendorNameHelpListHeader)}
                //  onBlur={(e)=>handleValidateField(e,formStatus,formData)}
              //  disabled={formData?.vcode_auto === "Y" || formStatus === 'Update'}
              disabled={formStatus !== 'Search'}
              />
            </Col>
            <Col sm={12} md={5} lg={5}>
                <TextField
                maxLength={40}
                   type="text"
                   id='v_name'
                   name='v_name'
                   label="Name"
                   value={formData?.v_name || ""}
                   onChange={(e) => { handleChange("v_name", e.target.value, e) }}
                   onDoubleClick={() => handleDoubleClick("vendorName", vendorNameHelpListHeader)}
                   onBlur={(e)=>handleValidateField(e,formStatus,formData)}
                    // disabled={formStatus !== 'Search'}
                  required

                />
                        
            </Col>

            <Col sm={12} md={5} lg={5} className="mt-4">

              <TextField
              maxLength={30}
                type="text"
                // label="DI_LAST_CODE" // todo..  This label name show is query mode at this time by Default give
                value={formData?.v_name1 || ""}
                onChange={(e) => handleChange("v_name1", e.target.value, e)}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={12} md={12} lg={12}>
              <TextField
              maxLength={50}
                type="text"
                id='v_add1'
                name='v_add1'
                label="Address"
                value={formData?.v_add1 || ""}
                onChange={(e) => handleChange("v_add1", e.target.value, e)}
                onBlur={(e)=>handleValidateField(e,formStatus,formData)}
                required

              />
            </Col>
            <Col sm={12} md={12} lg={12} className="mt-1">
              <TextField
               maxLength={50}
                type="text"
                //   label="Address"
                value={formData?.v_add2 || ""}
                onChange={(e) => handleChange("v_add2", e.target.value, e)}
              />
            </Col>
            <Col sm={12} md={12} lg={12} className="mt-1">
              <TextField
               maxLength={50}
                type="text"
                //   label="Address"
                value={formData?.v_add3 || ""}
                onChange={(e) => handleChange("v_add3", e.target.value, e)}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="text"
                label="City"
                maxLength={100}
                id='v_city_name'
                name='v_city_name'
                value={formData?.v_city_name || ""}
                onChange={(e) => handleChange("v_city_name", e.target.value, e)}
                onDoubleClick={() => handleDoubleClick("city", cityHelpListHeader)}
                onBlur={(e)=>handleValidateField(e,formStatus,formData)}
                required
              />
            </Col>
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="text"
                maxLength={100}
                label="District"
                value={formData?.v_district || ""}
                onChange={(e) => handleChange("v_district", e.target.value, e)}
                disabled
              />
            </Col>
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="text"
                label="State"
                maxLength={100}
                value={formData?.v_state || ""}
                onChange={(e) => handleChange("v_state", e.target.value, e)}
                disabled
              />
            </Col>
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="text"
                label="Zone"
                value={formData?.v_zone || ""}
                onChange={(e) => handleChange("v_zone", e.target.value, e)}
                disabled
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="text"
                label="Country"
                value={formData?.v_country || ""}
                onChange={(e) => handleChange("v_country", e.target.value, e)}
                disabled
              />
            </Col>
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="text"
                label="Region"
                value={formData?.v_region || ""}
                onChange={(e) => handleChange("v_region", e.target.value, e)}
                disabled
              />
            </Col>
            <Col sm={6} md={3} lg={3}>
              <TextField
               maxLength={10}
                type="text"
                id='v_zip_code'
                name='v_zip_code'
                label="Pin Code"
                value={formData?.v_zip_code || ""}
                onChange={(e) => handleChange("v_zip_code", e.target.value, e)}
                onBlur={(e)=>handleValidateField(e,formStatus,formData)}
                required

              />
            </Col>
            <Col sm={6} md={3} lg={3}>
              <TextField
                type="number"
                label="TurnOver (Rs.)"
                value={formData?.turnover ?? ""}
                onChange={(e) => handleChange("turnover", e.target.value, e)}
              />
            </Col>
          </Row>
          <Row className="mt-1">
            <Col sm={12} md={4} lg={3}>
              <Select
                // required
                label="Vendor Type"
                name="vend_type"
                placeholder={" "}
                value={formData?.vend_type || ""}
                onChange={(e) =>
                  handleChange("vend_type", e.target.value, e)
                }
                options={vendType}
                onBlur={(e)=>handleValidateField(e,formStatus,formData)}
                required
              />
            </Col>
            <Col sm={12} md={4} lg={3}>
              <TextField
                type="text"
                maxLength={200}
                label="Vendor legal Name"
                value={formData?.v_legal_name || ""}
                onChange={(e) =>
                  handleChange("v_legal_name", e.target.value, e)
                }
              />
            </Col>
            <Col sm={12} md={4} lg={3}>
              <TextField
                type="text"
                label="Dist in Km"
                value={formData?.trans_dist_km || ""}
                onChange={(e) =>
                  handleChange("trans_dist_km", e.target.value, e)
                }
              />
            </Col>
          </Row>

          <Row className="mt-1 fw-bold">
            <Col sm={6} md={4} lg={2} className="button-group-wrapper   ">
              <Checkbox
                text="Include Rating"
                onChange={(e) =>
                  handleChange("incl_vend_rat", e.target.checked ? "Y" : "N", e)
                }
                checked={formData?.incl_vend_rat === "Y"}
              />
            </Col>
            <Col sm={6} md={4} lg={2} className="button-group-wrapper   ">
              <Checkbox
                text="Approved"
                onChange={(e) =>
                  handleChange("active", e.target.checked ? "Y" : "N", e)
                }
                checked={formData?.active === "Y"}
              />
            </Col>
            <Col sm={6} md={4} lg={2} className="button-group-wrapper   ">
              <Checkbox
                text="GTA/Transport"
                onChange={(e) =>
                  handleChange("transport", e.target.checked ? "Y" : "N", e)
                }
                checked={formData?.transport === "Y"}
              />
            </Col>
            <Col sm={6} md={4} lg={2} className="button-group-wrapper   ">
              <Checkbox
                text="Security Service"
                onChange={(e) =>
                  handleChange(
                    "security_service",
                    e.target.checked ? "Y" : "N",
                    e
                  )
                }
                checked={formData?.security_service === "Y"}
              />
            </Col>
            <Col sm={6} md={4} lg={2} className="button-group-wrapper    ">
              <Checkbox
                text="Legal"
                onChange={(e) =>
                  handleChange("legal", e.target.checked ? "Y" : "N", e)
                }
                checked={formData?.legal === "Y"}
              />
            </Col>
            <Col sm={6} md={4} lg={2} className="button-group-wrapper    ">
              <Checkbox
                text="Travel Agency"
                onChange={(e) =>
                  handleChange(
                    "travel_agency_yn",
                    e.target.checked ? "Y" : "N",
                    e
                  )
                }
                checked={formData?.travel_agency_yn === "Y"}
              />
            </Col>
          </Row>
        </Row>
      </Card>
      <Row className="mt-1 d-flex justify-content-between">
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="text"
            label="Created By"
            value={formData?.create_by || ""}
            onChange={(e) => handleChange("create_by", e.target.value, e)}
            disabled
          />
        </Col>
        <Col sm={12} md={6} lg={3}>
          <TextField
            type="text"
            label="Updated By"
            value={formData?.update_by || ""}
            onChange={(e) => handleChange("update_by", e.target.value, e)}
            disabled
          />
        </Col>
      </Row>
    </Container>
  );
};

export default SupplierMasterMainTab;
