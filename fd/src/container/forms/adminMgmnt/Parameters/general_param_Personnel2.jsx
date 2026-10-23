import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const Personnel2 = ({
  formData,
  formStatus,
  handleChange,
  OtherDed = [],
  EsiWages = [],
  FfDay = [],
  ConveyanceEd = [],
  Tmcoin = [],
  Month = [],
  overtime = [],
  society = [],
  canteen = [],
  night = [],
  adjPaydayp = [],
  adjPaydayd = [],
  spf = [],
  bus = [],
  education = [],
  bonds = [],
  ca = [],
  leave = [],
  latehrs = [],
}) => {


  const getOptions = (fieldName) => {
    switch (fieldName) {
      case "other_ded_id":
        return OtherDed;

      case "esi_wages_id":
        return EsiWages;

      case "ff_day_check":
        return FfDay;

      case "conveyance_ed_id":
        return ConveyanceEd;

      case "tmcoinnot_ed_id":
        return Tmcoin;

      case "month_no":
        return Month;

      case "overtime_ed_id":
        return overtime;

      case "society_ed_id":
        return society;

      case "canteen_ed_id":
        return canteen;

      case "night_ed_id":
        return night;

      case "adj_paydaysp_atnd_id":
        return adjPaydayp;

      case "adj_paydaysd_atnd_id":
        return adjPaydayd;

      case "spf_ed_id":
        return spf;

      case "edu_ed_id":
        return education;

      case "busded_ed_id":
        return bus;

      case "ca_ed_id":
        return ca;

      case "lv_encash_ed_id":
        return leave;

      case "latehrs_atnd_id":
        return latehrs;

      case "bonds_rebate_id":
        return bonds;

      default:
        return [];
    }
  };

  return (
    <React.Fragment>
      <Form id="general-parameter-personnel2-form">
        <Row>
          <Col xl={5}>
            {[
              { label: "Other Ded ED", name: "other_ded_id" },
              { label: "ESI Wages ED", name: "esi_wages_id" },
              { label: "FF Day Check", name: "ff_day_check" },
              { label: "Conveyance ED", name: "conveyance_ed_id" },
              { label: "Tmcoin ED", name: "tmcoinnot_ed_id" },
              { label: "Month Desc", name: "month_no" },
              { label: "Overtime ED", name: "overtime_ed_id" },
              { label: "Society ED", name: "society_ed_id" },
              { label: "Canteen ED", name: "canteen_ed_id" },
              { label: "Night ED", name: "night_ed_id" },
              // { label: "Retirement Age", name: "retirement_age" },
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

            <TextField
              type="text"
              name="retiremnt_age"
              label="Retirement Age"
              value={formData.retiremnt_age || ""}
              onChange={(e) => handleChange("retiremnt_age", e.target.value, "MOPMPARM")}


            />

          </Col>

          <Col xl={5} className='ms-5'>
            {[
              {
                label: "Adj Payday Atnd ED",
                name: "adj_paydaysp_atnd_id",
              },
              {
                label: "Adj Payday Atnd ED",
                name: "adj_paydaysd_atnd_id",
              },
              { label: "SPF ED", name: "spf_ed_id" },
              { label: "Education ED", name: "edu_ed_id" },
              { label: "Bus Deduction ED", name: "busded_ed_id" },
              { label: "Bonds Rebate ED", name: "bonds_rebate_id" },
              { label: "CA ED", name: "ca_ed_id" },
              { label: "Leave Encash ED", name: "lv_encash_ed_id" },
              { label: "Late hrs Attend ED", name: "latehrs_atnd_id" },
              // { label: "Bank Code", name: "sal_bank_code" },
              // { label: "Bank Name", name: "sal_bank_name" },
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
             
             <Row className='mt-1'> 
            
           <TextField
              type="text"
              name="sal_bank_code"
              label="Bank Code"
              value={formData.sal_bank_code || ""}
              onChange={(e) => handleChange("sal_bank_code", e.target.value, "MOPMPARM")}


            />  
            </Row>
            
            <Row className='mt-1'>
            
          <TextField
              type="text"
              name="sal_bank_name"
              label="Bank Name"
              value={formData.sal_bank_name || ""}
              onChange={(e) => handleChange("sal_bank_name", e.target.value, "MOPMPARM")}


            /> 
            </Row>


          </Col>
        </Row>
      </Form>

    </React.Fragment>
  )
}

export default Personnel2