import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'


const General = ({ formData, handleChange,  excise = [], floor = [], party = [], service = [], receive = []  }) => {  

     // Map field.name to the corresponding dropdown options
  const getOptions = (fieldName) => {
    switch (fieldName) {
      case "excise_godown_wc_id":
        return excise;
      case "floor_stock_wc_id":
        return floor;
      case "service_cell_wc_id":
        return service;
      case "party_wc_id":
        return party;
      case "receiving_store_wc_id":
        return receive;
      default:
        return [];
    }
  };
    return (
        <React.Fragment> 
            <Form id = "general-parameter-general-form">
            <Row>
                <Col xl={6}>
                    <div className="text-wrapper box-border p-2" >
                        <span className="text-label">Work Center</span>
                        {[
                            { label: "Excise Godown", name: "excise_godown_wc_id" },
                            { label: "Floor Stock", name: "floor_stock_wc_id" },
                            { label: "Service Cell", name: "service_cell_wc_id" },
                            { label: "Party", name: "party_wc_id" },
                            { label: "Receiving Store", name: "receiving_store_wc_id" },
                        ].map((field) => (
                            <div key={field.name}>
                                <div style = {{marginTop: '1px'}}>
                                    {/* <label>{field.label}</label> */}
                                    <Select
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value, "MOITPARM")}
                                        label = {field.label}
                                        options={getOptions(field.name)} // Dynamically set options based on field name
                                    //className={styles.input}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>

                <Col xl={4} className='ms-lg-4 ms-md-0 mt-sm-3 mt-lg-1'>
                    <div className='text-wrapper'>
                        <span className="text-label">Planning time Bucket for MPS/MRP</span>
                        <RadioGroup 
                            //style
                            className="button-group-wrapper box-border d-flex  py-2 flex-wrap justify-content-around "

                            options={[
                                { text: "Daily", value: "C" },
                                { text: "Weekly", value: "W" },
                                { text: "Fornightly", value: "F" },
                                { text: "Yearly", value: "Y" },
                                { text: "Monthly", value: "M" },
                                { text: "Quaterly", value: "Q" },
                            ]}
                           
                           
                            onChange={(e) => handleChange("plan_time_bucket", e.target.value, "MOITPARM")}
                            checked={formData?.plan_time_bucket}
                        />
                    </div>

                    <div className='text-wrapper'  >
                        <span className="text-label">  For MPS/MRP Safety Stock based on</span>
                        <RadioGroup 
                            //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-3 justify-content-evenly"
                            options={[
                                { text: "Quantity", value: "Q" },
                                { text: "Time", value: "T" },
                            ]}
                            onChange={(e) => handleChange("safety_stock_based_qty_or_time", e.target.value, "MOITPARM")}
                            checked={formData?.safety_stock_based_qty_or_time}
                        />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xl={6}>
                    {[
                        { label: "Return Days of 57F(4)", name: "return_days_57f4" },
                        { label: "Shifts Working in a Day", name: "shifts_working" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                <label>{field.label}</label>
                                <TextField 
                                    //style={{ width: '200px' }}
                                    type="number"
                                    required
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOITPARM")}
                                //className={styles.input}
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

export default General;

