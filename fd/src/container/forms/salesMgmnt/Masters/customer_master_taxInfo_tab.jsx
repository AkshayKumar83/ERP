import React from "react";
import { Row, Col, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";

const CustomerMasterTaxInfoTab = ({ formData, formStatus, handleChange }) => {

     const handleFieldChange = (name, value, e) => {
        // const { name, type, checked, value } = e.target;
        // const fieldValue = type === "checkbox" ? (checked ? "Y" : "N") : value;
      
        const fieldValue = value
       handleChange(name, value, e);

        if (
            name === "whether_gst_registered_dlr" &&
            (formStatus === "Insert" || formStatus === "Update")
        ) {
            if (fieldValue === "N") {
                // handleFieldChange({ target: { name: "gst_no", value: "NA" } });
                  handleChange('gst_no', 'NA', e);
            } else if(fieldValue === 'Y') {
                if(formData.gst_no === 'NA'){
                    // handleFieldChange({ target: { name: "gst_no", value: "" } });
                      handleChange('gst_no', '', e);
                }else{
                    gstNoValidation()
                }
            }
        }
    };

    const handleGstNoBlur = (e) => {
        if(e.target.name == 'gst_no'){
            const isValid = gstNoValidation(formData);
            if (!isValid) {
                document.querySelector("#gst_no").focus();
            }
        }
        if(e.target.name == 'gst_no_sez'){
            confirm('GST Number SEZ blank...Are You Sure for continue the entry')
        }
    };


  return (
    <>
      <Row className="justify-content-center">
        <Col sm={6} md={4} lg={2}>
          <TextField
            type="text"
            label="Pan No."
            value={formData?.pan_no || ""}
            onChange={(e) => handleFieldChange("pan_no", e.target.value,e)}
          />
        </Col>
      </Row>
    
      <Card className="w-50 mt-3 mx-auto">
        {/* i use custom class of cusMstGST-height , write is basicComponents.scss  */}
        <Row className="mb-2">
          <Col className="cusMstGST-height">
            <div className="text-wrapper">
              <span className="text-label">GST</span>
              <Row className="me-2 ms-4">
                <Col lg={6} className="">
                  <Row>
                    <Col lg={5} className="mt-2">
                      <TextField
                        type="text"
                        label="GST State Code"
                        value={formData?.gst_state_code || ""}
                        onChange={(e) => handleFieldChange("gst_state_code", e.target.value ,e)}
                        disabled
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={8} className="mt-2">
                      <TextField
                        type="text"
                        label="GST Number"
                        value={formData?.gst_no || ""}
                         onBlur={handleGstNoBlur} 
                        onChange={(e) => handleFieldChange("gst_no", e.target.value,e )}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={8} className="mt-2">
                      <TextField
                        type="text"
                        label="GST No SEZ"
                        value={formData?.gst_no_sez || ""}
                        onChange={(e) => handleFieldChange("gst_no_sez", e.target.value ,e)}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col lg={6} className="mt-4">
                <Row>
                <Col sm={12} md={12} lg={6} className="button-group-wrapper mt-2">
            <Checkbox
              text="TCS Applicable"
              onChange={(e) => handleFieldChange("tcs_applicable", e.target.checked ? "Y" : "N",e)}
              checked={formData?.tcs_applicable === "Y"}
            />
          </Col>
                </Row>
                <Row>
                <Col sm={12} md={12} lg={10} className="button-group-wrapper mt-2">
            <Checkbox
              text="Whether GST Registered"
              onChange={(e) => handleFieldChange("whether_gst_registered_dlr", e.target.checked ? "Y" : "N",e)}
              checked={formData?.whether_gst_registered_dlr === "Y"}
            />
          </Col>
                </Row>
                <Row>
                <Col sm={12} md={12} lg={10} className="button-group-wrapper mt-2">
            <Checkbox
              text="Whether Registered Under Comp."
              onChange={(e) => handleFieldChange("whether_rgstrd_under_comp", e.target.checked ? "Y" : "N" ,e)}
              checked={formData?.whether_rgstrd_under_comp === "Y"}
            />
          </Col>
                </Row>
                <Row>
                <Col sm={12} md={12} lg={6} className="button-group-wrapper mt-2">
            <Checkbox
              text="UTN"
              onChange={(e) => handleFieldChange("utn_flag", e.target.checked ? "Y" : "N",e )}
              checked={formData?.utn_flag === "Y"}
            />
          </Col>
                </Row>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default CustomerMasterTaxInfoTab;
