import React, { useRef } from 'react'
import { Row, Col, Form } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import { stateHelpListHeader, cityHelpListHeader, customerHelpListHeader, bankHelpListHeader } from './division_masterHelper'
import { stubTrue } from 'lodash'
import toast from 'react-hot-toast'

const MainDetail = ({ formData, handleChange, regions = [],
  formStatus,
  setHelpFor,
  setHelpListHeader,
  fetchValidateData,


  handleHelpList = () => { },
}) => {

  // Inside your component:
  const skipValidation = useRef(false);

  const handleDoubleClick = (field, header) => {
    if (formStatus) {
      setHelpFor(field); // Set the help type dynamically
      setHelpListHeader(header); // Set the appropriate header list
      handleHelpList(true); // Open the modal
    }
  };

  const validateRequiredField = (e, fieldLabel) => {
    const value = e.target.value?.trim();
    if (!value) {
      toast.error(`this ${fieldLabel} field is required`);
      e.preventDefault();
      e.target.focus();
      return false;
    }
    return true;
  };


  return (
    <Form id="division-master-main-form">
      <Row style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            required
            type="text"
            label="Division Name"
            name="name"
            maxLength={100}
            value={formData?.name || ""}
            onChange={(e) => handleChange("name", e.target.value, e)}
            onBlur={async (e) => {

              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;
                validateRequiredField(e, "Division Name")

                if (!fieldValue.trim()) {
                  toast.error("Division name can not be empty.");
                  return;
                }


              }
            }}

          />
        </Col>


        <Col style={{ marginTop: '1.45rem' }} >
          <Checkbox style={{ marginLeft: '10px', marginTop: 'rem' }}
            onChange={(e) => handleChange("default_co", e.target.checked ? "Y" : "N")}
            text="Default Company"
            checked={formData?.default_co === "Y"}
          />
        </Col>

        <Col style={{ marginTop: '1.45rem' }} >
          <Checkbox style={{ marginLeft: '10px' }}
            onChange={(e) => handleChange("registered_flag", e.target.checked ? "Y" : "N")}
            text="Registered_flag"
            checked={formData?.registered_flag === "Y"}
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Address"
            name="add1"
            maxLength={30}
            value={formData?.add1 || ""}
            onChange={(e) => handleChange("add1", e.target.value, e)}
            required
            onBlur={async (e) => {

              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;
                validateRequiredField(e, "Address")
                if (!fieldValue.trim()) {
                  toast.error("Address can not be empty.");
                  return;
                }


              }
            }}
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="Additional Division"
            name="addl_division_desc"
            value={formData?.addl_division_desc || ""}
            maxLength={30}
            onChange={(e) => handleChange("addl_division_desc", e.target.value, e)}
          //required
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5} style={{ marginTop: '1.4rem' }}>
          <TextField
            type="text"
            label=""
            name="add2"
            maxLength={30}
            value={formData?.add2 || ""}
            onChange={(e) => handleChange("add2", e.target.value, e)}
          //required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="Division Doc Prefix"
            name="div_doc_prefix"
            maxLength={5}
            value={formData?.div_doc_prefix || ""}
            onChange={(e) => handleChange("div_doc_prefix", e.target.value, e)}
            onBlur={async (e) => {

              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;

                if (!fieldValue.trim()) {
                  toast.error("Division Prefix can not be empty.");
                  return;
                }


              }
            }}
            required
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5} style={{ marginTop: '1.4rem' }}>
          <TextField
            type="text"
            label=""
            name="add3"
            maxLength={30}
            value={formData?.add3 || ""}
            onChange={(e) => handleChange("add3", e.target.value, e)}
          //required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="PO NO Suffix"
            name="po_no_suffix"
            maxLength={2}
            value={formData?.po_no_suffix || ""}
            onChange={(e) => handleChange("po_no_suffix", e.target.value, e)}
            onBlur={async (e) => {

              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;
                // validateRequiredField(e, "PO No Suffix")
                if (!fieldValue.trim()) {
                  toast.error("PO NO suffix can not be empty.");
                  return;
                }


              }
            }}
            required
          />
        </Col>
      </Row>


      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5} style={{ marginTop: '0rem' }}>
          <TextField
            type="text"
            label="City"
            name="city_name"
            value={formData?.city_name || ""}
            onChange={(e) => handleChange("city_name", e.target.value, e)}
            onDoubleClick={() => {
              skipValidation.current = true;
              handleDoubleClick("city", cityHelpListHeader)
            }
            }
            onBlur={async (e) => {
              if (skipValidation.current) {
                skipValidation.current = false; // reset it
                return;
              }
              // validateRequiredField(e, "City Name")
              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;

                if (!fieldValue.trim()) {
                  toast.error("City name can not be empty.");
                  return;
                }


              }
            }}
            required
          />
        </Col>

        <Col xl={5}>
          <Select
            type="text"
            label="Region"
            name="region_id"
            value={formData?.region_id || ""}
            onChange={(e) =>
              handleChange("region_id", e.target.value)}
            //required
            options={regions}
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={4}>
          <TextField
            type="text"
            label="State"
            name="state_name"
            value={formData?.state_name || ""}
            onChange={(e) => handleChange("state_name", e.target.value, e)}
            onDoubleClick={() => {
              handleDoubleClick("state", stateHelpListHeader)
            }
            }
            onBlur={async (e) => {
              if (skipValidation.current) {
                skipValidation.current = false; // reset it
                return;
              }
              // validateRequiredField(e, "State Name")
              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;

                if (!fieldValue.trim()) {
                  toast.error("State name can not be empty.");
                  return;
                }


              }
            }}
            required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="text"
            label="LST No"
            name="lst_no"
            value={formData?.lst_no || ""}
            maxLength={40}
            onChange={(e) => handleChange("lst_no", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="date"
            label="Dated"
            name="lst_dt"
            value={formData?.lst_dt || ""}
            onChange={(e) => handleChange("lst_dt", e.target.value)}
          // required
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={4}>
          <TextField
            type="text"
            label="Country"
            name="country"
            value={formData?.country || ""}
            maxLength={30}
            onChange={(e) => handleChange("country", e.target.value, e)}
            required
            onBlur={async (e) => {

              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;
                //validateRequiredField(e, "Country")
                if (!fieldValue.trim()) {
                  toast.error("Country can not be empty.");
                  return;
                }


              }
            }}
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="text"
            label="CST No"
            name="cst_no"
            value={formData?.cst_no || ""}
            maxLength={40}
            onChange={(e) => handleChange("cst_no", e.target.value, e)}
          //required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="date"
            label="Dated"
            name="cst_dt"
            value={formData?.cst_dt || ""}
            onChange={(e) => handleChange("cst_dt", e.target.value)}
          // required
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Pin Code"
            name="pin_code"
            value={formData?.pin_code || ""}
            //  maxLenght={10}
            onChange={(e) => handleChange("pin_code", e.target.value, e)}
            onBlur={async (e) => {


              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;

                if (!fieldValue.trim()) {
                  toast.error("Pin code can not be empty.");
                  return;
                }


              }
            }}
            required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="Company Logo Path"
            name="company_logo_path"
            value={formData?.company_logo_path || ""}
            maxLength={100}
            onChange={(e) => handleChange("company_logo_path", e.target.value, e)}
          //required
          />
        </Col>


      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={4}>
          <TextField
            type="text"
            label="E Mail"
            name="e_mail"
            value={formData?.e_mail || ""}
            maxLength={100}
            onChange={(e) => handleChange("e_mail", e.target.value, e)}
          //required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="text"
            label="GR No"
            name="gr1_no"
            value={formData?.gr1_no || ""}
            maxLength={30}
            onChange={(e) => handleChange("gr1_no", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="text"
            label="IE Code"
            name="ie_code"
            value={formData?.ie_code || ""}
            maxLength={20}
            onChange={(e) => handleChange("ie_code", e.target.value, e)}
          //required
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={4}>
          <TextField
            type="text"
            label="Website"
            name="website"
            value={formData?.website || ""}
            maxLength={100}
            onChange={(e) => handleChange("website", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="text"
            label="RBI Code"
            name="rbi_code"
            value={formData?.rbi_code || ""}
            maxLength={20}
            onChange={(e) => handleChange("rbi_code", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={4}>
          <TextField
            type="text"
            label="Employee Code Prefix"
            name="emp_prefix"
            value={formData?.emp_prefix || ""}
            maxLength={2}
            onChange={(e) => handleChange("emp_prefix", e.target.value, e)}
            required
            onBlur={async (e) => {

              if (formStatus === "Insert" || formStatus === "Update") {
                const fieldValue = e.target.value;

                if (!fieldValue.trim()) {
                  toast.error("Emp Prefix can not be empty.");
                  return;
                }


              }
            }}
          />
        </Col>
      </Row>


      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Purch Email"
            name="purch_email"
            value={formData?.purch_email || ""}
            maxLength={100}
            onChange={(e) => handleChange("purch_email", e.target.value, e)}
          //required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="Ref No"
            name="ref_no"
            value={formData?.ref_no || ""}
            maxLength={15}
            onChange={(e) => handleChange("ref_no", e.target.value, e)}
          //required
          />
        </Col>
      </Row>



      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Std Code"
            name="std_code"
            value={formData?.std_code || ""}
            maxLength={5}
            onChange={(e) => handleChange("std_code", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="Company Logo Path 2"
            name="company_logo_path2"
            value={formData?.company_logo_path2 || ""}
            maxLength={100}
            onChange={(e) => handleChange("company_logo_path2", e.target.value, e)}
          //required
          />
        </Col>
      </Row>


      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Telephone"
            name="telephone_no"
            maxLength={100}
            value={formData?.telephone_no || ""}
            onChange={(e) => handleChange("telephone_no", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="Nature of Industry"
            name="nature_of_industry"
            value={formData?.nature_of_industry || ""}
            maxLength={100}
            onChange={(e) => handleChange("nature_of_industry", e.target.value, e)}
          // required
          />
        </Col>
      </Row>


      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Mobile No"
            name="fax_no"
            value={formData?.fax_no || ""}
            maxLength={10}
            onChange={(e) => handleChange("fax_no", e.target.value, e)}
          // required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="CIN No"
            name="cin_no"
            value={formData?.cin_no || ""}
            maxLength={30}
            onChange={(e) => handleChange("cin_no", e.target.value, e)}
          //required
          />
        </Col>
      </Row>



      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField style={{ textAlign: 'left' }}
            type="number"
            label="Location Code"
            name="location_code"
            value={formData?.location_code || ""}
            maxLength={10}
            onChange={(e) => {
              let value = e.target.value;
              // Remove non-numeric characters (for safety)
              value = value.replace(/\D/g, "");

              if (value.length > 10) {
                value = value.slice(0, 10);
              }

              handleChange("location_code", value, e);
            }}
          //required
          />
        </Col>

        <Col xl={5}>
          <TextField
            type="text"
            label="TIN No"
            name="tin_no"
            value={formData?.tin_no || ""}
            maxLength={20}
            onChange={(e) => handleChange("tin_no", e.target.value, e)}
          // required
          />
        </Col>
      </Row>


      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            //required
            label="C Code"
            name="c_code"
            type="text"
            value={formData?.c_code || ""}
            maxLength={5}
            onChange={(e) => handleChange("c_code", e.target.value, e)}
            onDoubleClick={(e) =>
              handleDoubleClick("customer", customerHelpListHeader)
            }
            onBlur={(e) => {
              if (formStatus === "Insert" || formStatus === "Update") {
                fetchValidateData(
                  e.target.name,
                  e.target.value
                );
              }

            }}

          />
        </Col>

        <Col xl={5} style={{ marginTop: '1.4rem' }}>
          <TextField
            type="text"
            label=""
            name="c_name"
            value={formData?.c_name || ""}
            disabled
            onChange={(e) => handleChange("c_name", e.target.value, e)}
          // required
          />
        </Col>
      </Row>


      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col xl={5}>
          <TextField
            type="text"
            label="Default Bank"
            name="bank_code"
            value={formData?.bank_code || ""}
            onChange={(e) => handleChange("bank_code", e.target.value, e)}
            //required
            maxLength={20}
            onDoubleClick={(e) =>
              handleDoubleClick("bank", bankHelpListHeader)
            }
            onBlur={(e) => {
              if (formStatus === "Insert" || formStatus === "Update") {
                fetchValidateData(
                  e.target.name,
                  e.target.value
                );
              }

            }}

          />
        </Col>

        <Col xl={5} style={{ marginTop: '1.4rem' }}>
          <TextField
            type="text"
            label=""
            name="bank_name"
            value={formData?.bank_name || ""}
            onChange={(e) => handleChange("bank_name", e.target.value, e)}
            //required
            disabled
          />
        </Col>
      </Row>

      <Row className="mt-1" style={{ justifyContent: 'space-between' }}>
        <Col>
          <TextField
            //required
            placeholder=""
            name="gst_no"
            label="GST No"
            type="text"
            value={formData?.gst_no || ""}
            maxLength={20}
            onChange={(e) => handleChange("gst_no", e.target.value, e)}
          />
        </Col>

        <Col>
          <TextField
            name="gst_state_code"
            label="GST State Code"
            type="text"
            value={formData?.gst_state_code || ""}
            maxLength={2}
            onChange={(e) => handleChange("gst_state_code", e.target.value, e)}
            disabled
          />
        </Col>

        <Col>
          <TextField
            name="jurisdiction"
            label="Jurisdiction"
            type="text"
            value={formData?.jurisdiction || ""}
            maxLength={20}
            onChange={(e) => handleChange("jurisdiction", e.target.value, e)}
          />
        </Col>
      </Row>

    </Form>
  )
}

export default MainDetail;