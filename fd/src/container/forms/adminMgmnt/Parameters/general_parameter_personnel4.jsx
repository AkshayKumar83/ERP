import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const Personnel4 = ({
  formData,
  formStatus,
  handleChange,
  attendance = [],
  payment = [],
  spay = [],
  comm = [],
  loan = [],
  others = [],
  leaseArr = [],
  imprest = [],
  proftax = [],
  medIns = [],
  monthlyatnd = [],
  PerkEd = [],
  rent = [],
  reslease = [],
  vrsAllow = [],
  vrsDed = [],
  busEd = [],
  leaseAdv = [],
  excess = [],
  convDed = [],
  sec88c = [],
}) => {

  const getOptions = (fieldName) => {

    switch (fieldName) {
      case "hraded_atndid":
        return attendance;

      case "pay_days_atnd_id":
        return payment;

      case "s_pay_ed_id":
        return spay;

      case "comm_pfable_ed_id":
        return comm;

      case "pf_loan_ed_id":
        return loan;

      case "others_ed_id":
        return others;


      case "empr_esi_ed_id":
        return imprest;

      case "prof_tax_ed_id":
        return proftax;


      case "med_ins_ed_id":
        return medIns;

      case "mon_atnd_id":
        return monthlyatnd;

      case "les_perk_id":
        return PerkEd;

      case "lease_arr_code":
        return leaseArr;

      case "rent_ed_id":
        return rent;

      case "res_lease_id":
        return reslease;

      case "vrs_allow_id":
        return vrsAllow;

      case "vrs_ded_id":
        return vrsDed;

      case "bus_ed_id":
        return busEd;

      case "lease_advance_code":
        return leaseAdv;

      case "excess_rent_ed_id":
        return excess;

      case "conv_ded_id":
        return convDed;

      case "sec88c_reb_id":
        return sec88c;

    }
  }


  return (
    <React.Fragment>
      <Form id="general-parameter-personnel4-form">
        <Row>
          <Col xl={5}>
            {[
              { label: "Attendance", name: "hraded_atndid" },
              { label: "Payment Days", name: "pay_days_atnd_id" },
              { label: "S Pay", name: "s_pay_ed_id" },
              { label: "Comm Pfable", name: "comm_pfable_ed_id" },
              { label: "Loan", name: "pf_loan_ed_id" },
              { label: "Others", name: "others_ed_id" },
              // { label: "ESI Employer Per", name: "esi_employer_per" },
              // { label: "Lease Acc No", name: "lease_acc_no" },
              // { label: "Bank Charges Acc No", name: "bank_charges_acc_no" }, 
              { label: "Emprest Esi", name: "empr_esi_ed_id" },
              { label: "Professional Tax", name: "prof_tax_ed_id" },
              { label: "Med Ins Ed Id", name: "med_ins_ed_id" },
              { label: "Monthly Attnd", name: "mon_atnd_id" },
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
              name="esi_employer_per"
              label="ESI Employer Per"
              value={formData.esi_employer_per || ""}
              onChange={(e) => handleChange("esi_employer_per", e.target.value, "MOPMPARM")}
            />
            
              <TextField
              type="text"
              name="lease_acc_no"
              label="Lease Acc No"
              value={formData.lease_acc_no || ""}
              onChange={(e) => handleChange("lease_acc_no", e.target.value, "MOPMPARM")}
            /> 

              <TextField
              type="text"
              name="bank_charges_acc_no"
              label="Bank Charges Acc No"
              value={formData.bank_charges_acc_no || ""}
              onChange={(e) => handleChange("bank_charges_acc_no", e.target.value, "MOPMPARM")}
            />
          </Col>

          <Col xl={5} className='ms-5'>
            {[
              { label: "Perk ED", name: "les_perk_id" },
              { label: "Lease Arr", name: "lease_arr_code" },
              { label: "Rent", name: "rent_ed_id" },
              { label: "Res Lease", name: "res_lease_id" },
              { label: "VRS Allow", name: "vrs_allow_id" },
              { label: "VRS Ded", name: "vrs_ded_id" },
              { label: "Bus ED", name: "bus_ed_id" },
              { label: "Lease Advance", name: "lease_advance_code" },
              { label: "Excess Rent", name: "excess_rent_ed_id" },
              { label: "ConvDed", name: "conv_ded_id" },
              { label: "Sec88c Rebate", name: "sec88c_reb_id" },
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
        </Row>
      </Form>

    </React.Fragment>
  )
}

export default Personnel4