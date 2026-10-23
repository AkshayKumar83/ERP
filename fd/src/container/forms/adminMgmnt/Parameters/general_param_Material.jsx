import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'

const Material = ({ formData, formStatus, handleChange }) => {
    return (
        <React.Fragment> 
            <Form id = "general-parameter-material-form"> 
            <Row>
                <Col xl={6}>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("pr_authorisation", e.target.checked ? "Y" : "N", "MOMMPARM")}
                                text="PR Authorization Required"
                                checked={formData?.pr_authorisation === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("vcode_auto", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text=" Auto Generation Vendor Code"
                                checked={formData?.vcode_auto === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("authorised_po", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Incoming Material received with authorised PO"
                                checked={formData?.authorised_po === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("cust_rej_move_to_service_cell", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Auto Incoming Customer Rejection Movement to Service Cell"
                                checked={formData?.cust_rej_move_to_service_cell === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("line_rej_move_to_rej_store", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Auto movement from Line Rejection to Rejection Store"
                                checked={formData?.line_rej_move_to_rej_store === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("material_move_against_tag", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Material Movement Against Tag"
                                checked={formData?.material_move_against_tag === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("ANNUAL_PO_CAN_BE_ZERO_QTY ", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text=" Annual PO can be a Zero Qty"
                                checked={formData?.ANNUAL_PO_CAN_BE_ZERO_QTY === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("inward_control_no", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Auto Generation of Inwards Shipmemt Control No.(ASP Only)"
                                checked={formData?.inward_control_no === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("buyer_based_items_yes_no", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="In PO selection of items based on buyer? (RED only)"
                                checked={formData?.buyer_based_items_yes_no === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("rej_allow_calc_required_in_osp", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Rejection Allow calculation is Required in Osp"
                                checked={formData?.rej_allow_calc_required_in_osp === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("auto_item_code ", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Automatic generation of item Codes"
                                checked={formData?.auto_item_code === "Y"}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("doc_dt_in_store_is_sysdate_y_n", e.target.checked ? "Y" : "N",  "MOMMPARM")}
                                text="Document Date in Store Acknowledge is Server Date"
                                checked={formData?.doc_dt_in_store_is_sysdate_y_n === "Y"}
                            />
                        </Col>
                    </Row>

                </Col>
                <Col xl={4}>

                    <div className="text-wrapper box-border" style={{ width: '230px', padding: '10px' }}>
                        <span className="text-label">FSN Analysis</span>
                        {[
                            { label: "Fast Moving Items", name: "fast_moving" },
                            { label: "Slow Moving Items", name: "slow_moving" },
                            { label: "Non Moving Items", name: "non_moving" },
                        ].map((field) => (
                            <div key={field.name}>
                                <div style={{ display: 'flex', marginTop: '5px', justifyContent: 'center' }}>
                                    {/* <label>{field.label}</label> */}
                                    <TextField
                                        style={{ width: '100px' }}
                                        type="number"
                                        label={field.label}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleChange(field.name, e.target.value, "MOMMPARM")}
                                    //options={getOptions(field.name)} // Dynamically set options based on field name
                                    //className={styles.input}
                                    />
                                    <span style={{ textAlign: 'end', fontSize: '12px', paddingTop: '23px' }}>Days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='text-wrapper' style={{ width: '300px' }}  >
                        <span className="text-label"> Inter Transfer Memo Date Validation</span>
                        <RadioGroup
                            //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Document Wise", value: "D" },
                                { text: "Item Wise", value: "I" },
                            ]}
                            onChange={(e) => handleChange("itmemo_no_base", e.target.value, "MOMMPARM")}
                            checked={formData?.itmemo_no_base}
                        />
                    </div>

                    <div className='text-wrapper' style={{ width: '300px' }}>
                        <span className="text-label"> Auto Generation of GE No.(RED Only)</span>
                        <RadioGroup
                            //style
                            className="button-group-wrapper box-border  m-auto mt-4 py-2 justify-content-evenly"
                            options={[
                                { text: "Yes", value: "Y" },
                                { text: "No", value: "N" },
                            ]}
                            onChange={(e) => handleChange("auto_ge_no_yes_no", e.target.value, "MOMMPARM")}
                            checked={formData?.auto_ge_no_yes_no}
                        />
                    </div>
                </Col>
            </Row>

            <Row className='mt-1'>
                <Col xl={6}>
                    {[
                        { label: "Contact Person for PO", name: "contact_pers" },

                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                <label style={{ fontWeight: 'bold' }}>{field.label}</label>
                                <TextField
                                    //style={{ width: '400px' }}
                                    type="text"
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOMMPARM")}
                                //className={styles.input}
                                />
                            </div>
                        </div>
                    ))}


                </Col>

                <Col xl={2} className='ms-5'>
                    {[
                        { label: "RMGP MAX Quantity", name: "rmgp_max_qty" },

                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                <label>{field.label}</label>
                                <TextField
                                    //style={{ width: '150px' }}
                                    type="number"
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOMMPARM")}
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

export default Material

