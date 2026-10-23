import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const Sales = ({ formData, formStatus, handleChange, stockDesc = [] }) => { 


    return (
        <React.Fragment> 
            <Form id = "general-parameter-sales-form">
            <Row>
                <Col xl={4}>
                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label"> Create Sales Voucher</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Posted", value: "Y" },
                                { text: "Unposted", value: "N" },
                            ]}
                            onChange={(e) => handleChange("sales_voucher_posted", e.target.value, "MOSMPARM")}
                            checked={formData?.sales_voucher_posted}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label"> Pick List Store Entry</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("picklist_store_entry_reqd", e.target.value, "MOSMPARM")}
                            checked={formData?.picklist_store_entry_reqd}
                        />
                    </div>

                    {[
                        { label: "Length of Invoice No", name: "inv_no_length" },

                    ].map((field) => (
                        <div className='mt-2' key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <TextField style={{ width: '100px' }}
                                    type="number"
                                    name={field.name}
                                    label={field.label}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOSMPARM")}
                                //options={getOptions(field.name)} // Dynamically set options based on field name
                                //className={styles.input}
                                />
                            </div>
                        </div>
                    ))}


                </Col>
                <Col xl={4}>
                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label"> Invoice No. Generated Automt.</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("inv_no_auto", e.target.value, "MOSMPARM")}
                            checked={formData?.inv_no_auto}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label">Invoice Authorisation Manually</span>
                        <RadioGroup
                        // style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("authorise_inv_manually", e.target.value, "MOSMPARM")}
                            checked={formData?.authorise_inv_manually
                            }
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label">  Discount Seperate in Sales Vchr.</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("disc_separate_in_sales_voucher", e.target.value, "MOSMPARM")}
                            checked={formData?.disc_separate_in_sales_voucher}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label"> Customer Code Generated Auto.</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("c_code_auto_gen", e.target.value, "MOSMPARM")}
                            checked={formData?.c_code_auto_gen}
                        />
                    </div>
                </Col>

                <Col xl={4}>
                    <div className='text-wrapper box-border py-3 mt-2'>
                        <span className="text-label"> Dates Enterable or Not</span>

                        <div className='text-wrapper' style={{ width: '240px', margin: 'auto' }}>
                            <span className="text-label"> SO DATE</span>
                            <RadioGroup 
                            //style
                                className="button-group-wrapper box-border mt-1 py-2 justify-content-evenly"
                                options={[
                                    { text: "Yes", value: "Y" },
                                    { text: "No", value: "N" },
                                ]}
                                onChange={(e) => handleChange("so_dt_enterable", e.target.value, "MOSMPARM")}
                                checked={formData?.so_dt_enterable}
                            />
                        </div>
                        <div className='text-wrapper' style={{ width: '240px', margin: 'auto' }}  >
                            <span className="text-label"> ADV.NOTE DATE</span>
                            <RadioGroup 
                            //style
                                className="button-group-wrapper box-border  m-auto mt-3 py-2 justify-content-evenly"
                                options={[
                                    { text: "Yes", value: "Y" },
                                    { text: "No", value: "N" },
                                ]}
                                onChange={(e) => handleChange("pl_dt_enterable", e.target.value, "MOSMPARM")}
                                checked={formData?.pl_dt_enterable}
                            />
                        </div>
                        <div className='text-wrapper' style={{ width: '240px', margin: 'auto' }}  >
                            <span className="text-label"> PKG NOTE DATE</span>
                            <RadioGroup 
                            //style
                                className="button-group-wrapper box-border  m-auto mt-3 py-2 justify-content-evenly"
                                options={[
                                    { text: "Yes", value: "Y" },
                                    { text: "No", value: "N" },
                                ]}
                                onChange={(e) => handleChange("da_dt_enterablet", e.target.value, "MOSMPARM")}
                                checked={formData?.da_dt_enterable}
                            />
                        </div>
                        <div className='text-wrapper' style={{ width: '240px', margin: 'auto' }}  >
                            <span className="text-label"> INVOICE DATE</span>
                            <RadioGroup 
                            //style
                                className="button-group-wrapper box-border  m-auto mt-3 py-2 justify-content-evenly"
                                options={[
                                    { text: "Yes", value: "Y" },
                                    { text: "No", value: "N" },
                                ]}
                                onChange={(e) => handleChange("inv_dt_enterable", e.target.value, "MOSMPARM")}
                                checked={formData?.inv_dt_enterable}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col xl={4}>
                    <div className='text-wrapper box-border m-auto justify-content-center py-1' style={{ border: '1px solid red' }}>
                        <span className="text-label" style={{ color: 'red' }}>For back date invoice</span>
                        <div className='text-wrapper' style={{ width: '230px', margin: 'auto' }}  >
                            <span className="text-label">Back Dt Invoice</span>
                            <RadioGroup 
                            //style={{ margin: 'auto' }}
                                className="button-group-wrapper box-border  m-auto mt-3 py-2 justify-content-evenly"
                                options={[
                                    { text: "Yes", value: "Y" },
                                    { text: "No", value: "N" },
                                ]}
                                onChange={(e) => handleChange("back_dt_invoice", e.target.value, "MOSMPARM")}
                                checked={formData?.back_dt_invoice}
                            />
                        </div>
                    </div>
                </Col>

                <Col xl={4}>


                </Col>

                <Col xl={4}>

                    <div className='text-wrapper' style={{ width: '240px' }}  >
                        <span className="text-label">Commodity wise invoice</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("commodity_wise_invoice", e.target.value, "MOSMPARM")}
                            checked={formData?.commodity_wise_invoice}
                        />
                    </div>

                </Col>

            </Row>

            <Row className='mt-3' style={{ justifyContent: '' }}>
                <div className='text-wrapper box-border m-auto justify-content-between py-3' style={{ display: 'flex' }}>
                    <span className="text-label">Rounded Value in Invoice</span>
                    <div className='text-wrapper' style={{ width: '200px' }}  >
                        <span className="text-label">Basic Value</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("round_basic_value", e.target.value, "MOSMPARM")}
                            checked={formData?.round_basic_value}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '200px' }}  >
                        <span className="text-label">Assess Value</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("round_basic_value", e.target.value, "MOSMPARM")}
                            checked={formData?.round_basic_value}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '200px' }}  >
                        <span className="text-label">Discount</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("round_basic_value", e.target.value, "MOSMPARM")}
                            checked={formData?.round_basic_value}
                        />
                    </div>
                    <div className='text-wrapper' style={{ width: '200px' }}  >
                        <span className="text-label">Excise</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("round_basic_value", e.target.value, "MOSMPARM")}
                            checked={formData?.round_basic_value}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '200px' }}  >
                        <span className="text-label">Sales Tax</span>
                        <RadioGroup 
                        //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("round_basic_value", e.target.value, "MOSMPARM")}
                            checked={formData?.round_basic_value}
                        />
                    </div>
                </div>
            </Row>

            <Row className='mt-1'>
                <Col xl={6}>
                    {[
                        { label: "Stock Transfer Type", name: "stock_transfer_ctype" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <Select style={{ width: '260px' }}
                                    type="text"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOSMPARM")}
                                    options={stockDesc}
                                //className={styles.input}
                                />

                            </div>
                        </div>
                    ))}

                </Col>

                <Col xl={6}>

                    {[
                        { label: "Number of Record Trading Invoice", name: "trading_invoice_max_item" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <TextField style={{ width: '100px' }}
                                    type="text"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOSMPARM")}
                                //options={getOptions(field.name)} // Dynamically set options based on field name
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

export default Sales