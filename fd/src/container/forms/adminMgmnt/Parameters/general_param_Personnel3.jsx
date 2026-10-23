import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const Personnel3 = ({
  formData,
  formStatus,
  handleChange,
  gratuity = [],
  stdded = [],
  esiot = [],
  overtimeatnd = [],
  fpf = [],
  special = [],
  conveyanceEd1 = [],
  wash = [],
  svpf = [],
  gured = [],
  adhoc = [],
  otherall = [],
  ccaed = [],
  basicarrear = [],
  overtimeEd = [],
  superAtt = []
}) => {

  const getOptions = (fieldName) => {
    switch (fieldName) {
      case "gratuity_ed_id":
        return gratuity;

      case "stdded_deduct_id":
        return stdded;

      case "esi_ot_ed_id":
        return esiot;

      case "overtime_atnd_id":
        return overtimeatnd;

      case "fpf_ed_id":
        return fpf;

      case "special_ed_id":
        return special;

      case "conv_ed_id":
        return conveyanceEd1;

      case "wash_ed_id":
        return wash;

      case "svpf_ed_id":
        return svpf;

      case "gur_ed_id":
        return gured;

      case "adhoc_ed_id":
        return adhoc;

      case "otherall_ed_id":
        return otherall;

      case "cca_ed_id":
        return ccaed;

      case "basic_arr_ed_id":
        return basicarrear;

      case "overtime_ed_id_s":
        return overtimeEd;

      case "sa_fund_ed_id":
        return superAtt;

      default:
        return [];

    }
  }

  return (
    <React.Fragment>
      <Form id="general-parameter-personnel3-form">
        <Row>
          <Col xl={5}>
            {[
              { label: "Gratuity ED", name: "gratuity_ed_id" },
              { label: "STDDED ED", name: "stdded_deduct_id" },
              { label: "ESI OT ED", name: "esi_ot_ed_id" },
              { label: "Overtime Atnd ED", name: "overtime_atnd_id" },
              { label: "FPF ED", name: "fpf_ed_id" },
              { label: "Special ED", name: "special_ed_id" },
              { label: "Conveyance ED", name: "conv_ed_id" },
              { label: "Wash ED", name: "wash_ed_id" },
              { label: "SVPF ED", name: "svpf_ed_id" },
            ].map((field) => (
              <div key={field.name}>
                <div className='p-1'>
                  {/* <label>{field.label}</label> */}
                  <Select
                    type="text"
                    name={field.name}
                    label={field.label}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value, "MOPMPARM")}
                    options={getOptions(field.name)}


                  />
                </div>
              </div>
            ))}

          </Col>

          <Col xl={5} className='ms-5'>
            {[
              { label: "GUR ED", name: "gur_ed_id" },
              { label: "Adhoc ED", name: "adhoc_ed_id" },
              { label: "Other all Ded ED", name: "otherall_ed_id" },
              { label: "CCA ED ", name: "cca_ed_id" },
              { label: "Basic Arrear ED", name: "basic_arr_ed_id" },
              { label: "Super Annuation ED", name: "sa_fund_ed_id" },
              //  { label: "Super Annuation%", name: "sa_fund_perc" },
              { label: "Overtime ED (S)", name: "overtime_ed_id_s" },

            ].map((field) => (
              <div key={field.name}>
                <div className='p-1'>
                  {/* <label>{field.label}</label> */}
                  <Select
                    type="text"
                    name={field.name}
                    label={field.label}
                    value={formData[field.name] || ""}
                    options={getOptions(field.name)}
                    onChange={(e) => handleChange(field.name, e.target.value, "MOPMPARM")}


                  />
                </div>
              </div>
            ))}

            <TextField
              type="number"
              name="sa_fund_perc"
              label="Super Annuation%"
              value={formData.sa_fund_perc || ""}
              onChange={(e) => handleChange("sa_fund_perc", e.target.value, "MOPMPARM")}


            />



          </Col>
        </Row>
      </Form>

    </React.Fragment>
  )
}

export default Personnel3
