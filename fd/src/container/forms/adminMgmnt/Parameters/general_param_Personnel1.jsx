import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import RadioButton from '../../../../components/basic/radioButton'
import SelectField from '../../../../components/GenricComponents/Form/Select'

const Personnel1 = ({ 
    formData, 
    formStatus, 
    handleChange,  
    MnthlyTax = [],
    MnthlySurch = [],
    ytdTax = [],
    ytdSurch = [],
    deathBenv = [],
    actual = [],
    paydays = [],
    conveyance = [],
    epf = [],
    esiProd = [],
    prodInc = [],}) => {   

        const getOptions = (fieldName) => {
            switch (fieldName) {
              case "mnthly_instax_id":
                return MnthlyTax;
        
              case "mnthly_inssurchtax_id":
                return MnthlySurch;
        
              case "ytdtax_id":
                return ytdTax; 
               
                case "ytdsurchtax_id":
                  return ytdSurch; 
  
              case "death_benv_id":
                return deathBenv;
        
              case "actual_atnd_id":
                return actual;
        
              case "pay_days_atnd_id":
                return paydays;
        
              case "conveyance_atnd_id":
                return conveyance;
        
              case "epf_ed_id":
                return epf;
        
              case "esi_prod_ed_id":
                return esiProd;
        
              case "prod_inc_ed_id":
                return prodInc;
        
              default:
                return [];
            }
          };

    return (
        <React.Fragment> 
            <Form id = "general-parameter-personnel1-form"> 
            <Row className='d-flex'>
                <Col xl={4}>
                    {[
                        { label: "Mnthly Itax Instl", name: "mnthly_instax_id" },
                        { label: "Mnthly SurchInst", name: "mnthly_inssurchtax_id" },
                        { label: "YTD tax", name: "ytdtax_id" },
                        { label: "YTD Surcharge", name: "ytdsurchtax_id" },
                        { label: "Benevolent Fund", name: "death_benv_id" },
                        { label: "Actual Days", name: "actual_atnd_id" },
                        { label: "Pay Days", name: "pay_days_atnd_id" },
                        { label: "Conveyance Days", name: "conveyance_atnd_id" },
                        { label: "EPF ED", name: "epf_ed_id" },
                        { label: "ESI Prod", name: "esi_prod_ed_id" },
                        { label: "Production Inc ED", name: "prod_inc_ed_id" },
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

                </Col>
                <Col xl={4} className='ms-4 mt-4' >
                    <div className="text-wrapper box-border p-2 m-auto">
                        <span className="text-label">Conveyanace Days Based on</span>
                        <Row>
                            <Col xl={6}>
                                <RadioGroup
                                    className="button-group-wrapper mt-1 py-1"
                                    options={[
                                        { text: "Pay Days", value: "P" },
                                       
                                    ]}
                                    onChange={(e) => handleChange("conveyance_based_on", e.target.value, "MOPMPARM")}
                                    checked={formData?.conveyance_based_on}
                                />
                            </Col>
                        </Row> 
                        <Row>
                        <Col xl={8}>
                              
                              <RadioGroup
                                  className="button-group-wrapper mt-1 py-1"
                                  options={[
                                      { text: "Actual Working Days", value: "A" },
                                     
                                  ]}
                                  onChange={(e) => handleChange("conveyance_based_on", e.target.value, "MOPMPARM")}
                                  checked={formData?.conveyance_based_on}
                              />
                          </Col> 
                        </Row>
                    </div>
                     

                    <div className="text-wrapper box-border p-2 m-auto mt-4">
                        <span className="text-label">Bonus</span>
                        {[
                             { label: "Bonus Calc On", name: "bonus_calc_on" },
                             { label: "Bonus Wages Limit", name: "bonus_limit" },
                             { label: "% of Bonus", name: "bonus_perc" },
                             { label: "Ex-gratia Limit", name: "ex_gratia_limit" },
                        ].map((field) => (
                            <div key={field.name}>
                                <div style = {{marginTop: '1px'}}>
                                    {/* <label>{field.label}</label> */}
                                    <TextField style = {{textAlign: 'right'}}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value, "MOPMPARM")}
                                        label = {field.label}
                                    //options={getOptions(field.name)} // Dynamically set options based on field name
                                    //className={styles.input}
                                    />
                                </div>
                            </div>
                        ))}
                        </div>
                </Col> 

            </Row> 
            </Form>

        </React.Fragment>
    )
}

export default Personnel1