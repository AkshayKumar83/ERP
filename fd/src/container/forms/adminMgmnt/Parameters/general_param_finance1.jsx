import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import { cvdAccListHeader, modvatAccListHeader } from './general_param_helpers'
const Finance1 = ({ 
    formData, 
    handleChange, 
    setHelpFor,
    setHelpListHeader, 
    formStatus,
    handleHelpList = () => { },
  }) => {    

    const handleDoubleClick = (field, header) => {
        if (formStatus) {
          setHelpFor(field); // Set the help type dynamically
          setHelpListHeader(header); // Set the appropriate header list
          handleHelpList(true); // Open the modal
        }
      };


    return (
        <React.Fragment> 
            <Form id = "general-parameter-finance1-form"> 
            <Row>
                <Col>
                    <div className="text-wrapper box-border p-2 m-auto" >
                        <span className="text-label">Custom Duty (Calculation)</span>
                        {[
                            { label: "Landing Cost", name: "cvd_land_cost_per" },
                            { label: "Insurance", name: "cvd_ins_per" },
                          
                        ].map((field) => (
                            <div key={field.name}>
                                <div>
                                    {/* <label>{field.label}</label> */}
                                    <TextField
                                        type="number"
                                        name={field.name}
                                        label={field.label}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value, "MOFMPARM")}
                                        //options={getOptions(field.name)} // Dynamically set options based on field name
                                        //className={styles.input}
                                        disabled={field.name === "cvd_acc_desc"}
                                    />
                                </div>
                            </div>
                        ))} 
                         
                         <TextField
                            type="text"
                            name="cvd_acc_code"
                            label="CVD Acc (Custom)"
                            value={formData.cvd_acc_code || ""}
                            onChange={(e) => handleChange("cvd_acc_code", e.target.value, "MOFMPARM")}
                            onDoubleClick={() => handleDoubleClick("cvd", cvdAccListHeader)}
                            //options={getOptions(field.name)} // Dynamically set options based on field name
                            //className={styles.input}
                            
                        />  

                          <TextField style = {{marginTop: '1.2rem'}}
                            type="text"
                            name="cvd_acc_desc"
                            label=""
                            value={formData.cvd_acc_desc || ""}
                            onChange={(e) => handleChange("cvd_acc_desc", e.target.value, "MOFMPARM")}
                            //options={getOptions(field.name)} // Dynamically set options based on field name
                            //className={styles.input}
                            disabled
                            
                        /> 

                    </div>
                </Col>
                <Col xl= {6}>
                    <Row> 
                        <Col className='mt-1' xl = {3}>
                        <TextField
                            type="text"
                            name="modvat_rec_acc"
                            label="Modvat Rec Acc (Import)"
                            value={formData.modvat_rec_acc || ""}
                            onChange={(e) => handleChange("modvat_rec_acc", e.target.value, "MOFMPARM")}
                            onDoubleClick={() => handleDoubleClick("modvat", modvatAccListHeader)}
                            //options={getOptions(field.name)} // Dynamically set options based on field name
                            //className={styles.input}
                            
                        /> 
                        </Col>  

                        <Col className='mt-5' xl = {6}>
                        <TextField
                            type="text"
                            name="modrec_acc_desc"
                            label=""
                            value={formData.modrec_acc_desc || ""}
                            onChange={(e) => handleChange("modrec_acc_desc", e.target.value, "MOFMPARM")}
                            disabled
                            //options={getOptions(field.name)} // Dynamically set options based on field name
                            //className={styles.input}
                            
                        /> 
                        </Col> 


                    </Row> 
                    <Row className='mt-2'>
                    <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("cheque_printing", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="Cheque Printing"
                                checked={formData?.cheque_printing === "Y"}
                            />
                        </Col> 
                    </Row>
                </Col>
            </Row> 
            </Form>
        </React.Fragment>
    )
}

export default Finance1



