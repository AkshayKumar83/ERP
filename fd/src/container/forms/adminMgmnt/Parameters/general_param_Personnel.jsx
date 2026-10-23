import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
//import Select from '../../../../components/basic/select'

const Personnel = ({ 
    formData, 
    handleChange,  
    basic = [],
    perPay = [],
    hra = [],
    da = [],
    pfund = [],
    vpf = [],
    esi = [],
    negative = [],
    tmc = [],
    lmc = [],
    ytdTds = [],
    ytdSur = [],
    arrear = [], }) => {  
        const getOptions = (fieldName) => {
            switch (fieldName) {
              case "basic_ed_id":
                return basic;
        
              case "da_ed_id":
                return da;
        
              case "hra_ed_id":
                return hra;
        
              case "p_pay_ed_id":
                return perPay;
        
              case "pf_ed_id":
                return pfund;
        
              case "vpf_ed_id":
                return vpf;
        
              case "esi_ed_id":
                return esi; 
        
                case "arrears_recovery_ed_id":
                  return arrear;
        
              case "neg_salary_ed_id":
                return negative;
              
              case "tmcoin_ed_id":
                return tmc;
        
              case "lmcoin_ed_id":
                return lmc;
        
              case "ytdtds_id":
                return ytdTds;
        
              case "ytdsurchtds_id":
                return ytdSur; 
        
                default: 
                return [];
            }
          };

    return (
        <React.Fragment> 

            <Form id = "general-parameter-personnel-form"> 
            <Row className="d-flex">
                <Col className="m-auto" xl={4}>

                    <Row className="d-flex align-items-center">
                        <Col xl="auto">
                            <Checkbox
                                onChange={(e) => handleChange("grade_wise_sanction", e.target.checked ? "Y" : "N", "MOPMPARM")}
                                text="Grade Wise Sanction"
                                checked={formData?.grade_wise_sanction === "Y"}
                            />
                        </Col>
                        <Col xl="auto">
                            <Checkbox
                                onChange={(e) => handleChange("gen_night_days", e.target.checked ? "Y" : "N","MOPMPARM" )}
                                text="Generate Night Days"
                                checked={formData?.gen_night_days === "Y"}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>


            <Row className='d-flex'>
                <Col xl={5}>
                    {[
                        { label: "Basic", name: "basic_ed_id" },
                        { label: "DA", name: "da_ed_id" },
                        { label: "HRA", name: "hra_ed_id" },
                        { label: "Pers. pay", name: "p_pay_ed_id" },
                        { label: "Provident Fund", name: "pf_ed_id" },
                        { label: "VPF", name: "vpf_ed_id" },
                        { label: "ESI ED Id", name: "esi_ed_id" },
                        { label: "Negative Salary", name: "neg_salary_ed_id" },
                        { label: "Arrears Recovery", name: "arrears_recovery_ed_id" },
                        { label: "This month coin", name: "tmcoin_ed_id" },
                        { label: "Last month coin", name: "lmcoin_ed_id" },
                        { label: "YTD TDS", name: "ytdtds_id" },
                        { label: "YTD Surcharge", name: "ytdsurchtds_id" },
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

                <Col xl={6} className='mt-4 ms-5'>

                    <div className="text-wrapper box-border p-2 m-auto">
                        <span className="text-label">PF Contribution</span>
                        <Row>
                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="pf_rperc"
                                    label="Employees's Contribution%"
                                    value={formData.pf_rperc || ""}
                                    onChange={(e) => handleChange("pf_rperc", e.target.value, "MOPMPARM")}
                                //options={getOptions(field.name)} 

                                />
                            </Col>

                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="pf_fpflimit"
                                    label="Maximum PF Limit"
                                    value={formData.pf_fpflimit || ""}
                                    onChange={(e) => handleChange("pf_fpflimit", e.target.value, "MOPMPARM")}
                                  
                                //options={getOptions(field.name)}

                                />
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <span style={{ fontSize: "12px", fontWeight: "bold" }}>Employer's Contribution%</span>


                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="pf_fpfperc"
                                    label="Family Pension Fund % (FPF)"
                                    value={formData.pf_fpfperc|| ""}
                                    onChange={(e) => handleChange("pf_fpfperc", e.target.value, "MOPMPARM")}
                                  
                                //options={getOptions(field.name)} 

                                />
                            </Col>

                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="pf_fpflimit"
                                    label="EPS%"
                                    value={formData.pf_fpflimit || ""}
                                    onChange={(e) => handleChange("pf_fpflimit", e.target.value, "MOPMPARM")}
                                //options={getOptions(field.name)}

                                />
                            </Col>

                        </Row>
                    </div>

                    <div className="text-wrapper box-border p-2 m-auto mt-4">
                        <span className="text-label">ESI Contribution</span>
                        <Row>
                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="esi_rperc"
                                    label="Employer's Contribution%"
                                    value={formData.esi_rperc || ""}
                                    onChange={(e) => handleChange("pf_fpflimit", e.target.value, "MOPMPARM")}
                                //options={getOptions(field.name)} 

                                />
                            </Col>

                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="esi_eperc"
                                    label="Employee's Contribution%"
                                    value={formData.esi_eperc || ""}
                                    onChange={(e) => handleChange("esi_eperc", e.target.value, "MOPMPARM")}
                                //options={getOptions(field.name)}

                                />
                            </Col>
                        </Row>

                        <Row className='mt-1'>
                            <Col xl={6}>
                                <TextField style={{ textAlign: 'right' }}
                                    type="number"
                                    name="esi_limit"
                                    label="ESI Limit"
                                    value={formData.esi_limit || ""}
                                    onChange={(e) => handleChange("esi_limit", e.target.value, "MOPMPARM")}
                                //options={getOptions(field.name)} 

                                />
                            </Col>


                        </Row>
                    </div>

                    <div className="text-wrapper box-border p-1 m-auto mt-4">
                        <span className="text-label">Rounded off</span>
                        <Row>
                            <Col className="button-group-wrapper ">
                                <Checkbox
                                    onChange={(e) => handleChange("rounded_off", e.target.checked ? "Y" : "N", "MOPMPARM")}
                                    text="Rounded off"
                                    checked={formData?.rounded_off === "Y"}
                                />
                            </Col>

                            <Col xl={6}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Rupees/Paise</span>
                                <RadioGroup

                                    className="button-group-wrapper box-border  m-auto mt-1 py-1 justify-content-evenly"
                                    options={[
                                        { text: "Rupee(s)", value: "R" },
                                        { text: "Paise", value: "P" },
                                    ]} 
                                    onChange={(e) => { handleChange("rupees_paise",e.target.value, "MOPMPARM") }}
                                    checked={formData?.rupees_paise}
                                   
                                />
                            </Col>
                        </Row>

                        <Row className='mt-1'>
                            <Col xl={6}>
                                <Select
                                    type="number"
                                    name="rounded_upto"
                                    label="Round upto"
                                    value={formData.rounded_upto || ""}
                                    onChange={(e) => handleChange("rounded_upto", e.target.value, "MOPMPARM")}
                                    options={[ 
                                        { label: "", value: "" },
                                        { label: "1", value: "1" },
                                        { label: "5", value: "5" },
                                        { label: "10", value: "10" },
                                        { label: "50", value: "50" }
                                    ]}
                                />
                            </Col>

                            <Col xl={6}>
                                <Select
                                    type="number"
                                    name="round_direction"
                                    label="Round Direction"
                                    value={formData.round_direction || ""}
                                    onChange={(e) => handleChange("round_direction", e.target.value, "MOPMPARM")}
                                    options={[ 
                                        { label: "", value: "" },
                                        { label: "Lower", value: "L" },
                                        { label: "Upper", value: "U" },
                                        { label: "None", value: "N" },
                                        
                                    ]}

                                />
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row> 
            </Form>
        </React.Fragment>

    )
}

export default Personnel