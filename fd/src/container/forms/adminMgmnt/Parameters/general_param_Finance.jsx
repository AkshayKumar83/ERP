import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'



const Finance = ({ formData, formStatus, handleChange, defaultCost = [], defaultPurp = [] }) => {
    return ( 
        <React.Fragment> 
            <Form id = "general-parameter-finance-form"> 
            <Row>
                <Col xl={6}>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("common_seq_cash", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Generate common sequence for Cash Voucher"
                                checked={formData?.common_seq_cash === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("common_seq_bank", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="  Generate common sequence for Bank Voucher"
                                checked={formData?.common_seq_bank === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("common_seq_jrnl", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Generate common sequence for Journal Voucher"
                                checked={formData?.common_seq_jrnl === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("common_seq_purch", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Generate common sequence for Purchase Voucher"
                                checked={formData?.common_seq_purch === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("common_seq_sales", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Generate common sequence for Sales Voucher"
                                checked={formData?.common_seq_sales === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("auto_post_at_ap", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="  Automatically Post Purchase Voucher at AP Process"
                                checked={formData?.auto_post_at_ap === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("party_amt_net_of_tds_pur_vch", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Party Amount net of TDS Amount in Purchase Voucher"
                                checked={formData?.party_amt_net_of_tds_pur_vch === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("jv_for_misc_entry_in_ar", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" JV for Miscellaneous entry in Purchase Voucher"
                                checked={formData?.jv_for_misc_entry_in_ar === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("pay_adv_single_entry_of_bills", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Payment advice in single entry of bills"
                                checked={formData?.pay_adv_single_entry_of_bills === "Y"}
                            />
                        </Col>
                    </Row>


                </Col>

                <Col xl={6}>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("cost_centre_mandatory", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Cost Centres are mandatory"
                                checked={formData?.cost_centre_mandatory === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("excise_separate_in_purch_vch", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Excise in seperate in Purchase Voucher"
                                checked={formData?.excise_separate_in_purch_vch === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("auto_post_pay_adv", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="Automatically Post Voucher at Payment Advise"
                                checked={formData?.auto_post_pay_adv === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("include_prev_chln", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="  Include Previous Years of challans in AP Bill Entry"
                                checked={formData?.include_prev_chln === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("st_separate_in_purchase_vch", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="Sales tax seperate in Purchase Voucher"
                                checked={formData?.st_separate_in_purchase_vch === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("bank_voucher_auto_post", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="Automatically Post Bank Voucher"
                                checked={formData?.bank_voucher_auto_post === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("pdc_bank_vch_auto_post", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text=" Automatically Post PDC Bank Voucher"
                                checked={formData?.pdc_bank_vch_auto_post === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("excise_provisional_balance", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="Excise Provisional Balance"
                                checked={formData?.excise_provisional_balance === "Y"}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="button-group-wrapper ">
                            <Checkbox
                                onChange={(e) => handleChange("same_purch_vch_no_as_bill_log", e.target.checked ? "Y" : "N", "MOFMPARM")}
                                text="Purchase Voucher No. same as Bill Log No."
                                checked={formData?.same_purch_vch_no_as_bill_log === "Y"}
                            />
                        </Col>
                    </Row>


                </Col>
            </Row>
            <Row className='mt-1'>
                <Col xl= {6} className='mt-2'>
                    {[
                        { label: "Default Cost Centre", name: "default_cost_centre" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <Select style={{ width: '200px' }}
                                    type="text"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOFMPARM")}
                                    options={defaultCost} // Dynamically set options based on field name

                                />

                            </div>
                        </div>
                    ))}
                </Col>
                <Col className='mt-2'>
                    {[
                        { label: "Default Purpose", name: "default_purpose_cd" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <Select style={{ width: '260px' }}
                                    type="text"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOFMPARM")}
                                    options = {defaultPurp}
                                />

                            </div>
                        </div>
                    ))}
                </Col>
            </Row>

            <Row className='mt-1'>
                <Col xl = {6}>
                    {[
                        { label: "TDS Surcharge Perc", name: "tds_surcharge_perc" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <TextField style={{ width: '150px', textAlign: 'right' }}
                                    type="number"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOFMPARM")}
                                //options={getOptions(field.name)} // Dynamically set options based on field name
                                //className={styles.input}
                                />

                            </div>
                        </div>
                    ))}
                </Col>
                <Col>
                    {[
                        { label: "Days For Discount", name: "days_for_discount" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <TextField style={{ width: '150px', textAlign: 'right' }}
                                    type="number"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOFMPARM")}
                                //options={getOptions(field.name)} // Dynamically set options based on field name
                                //className={styles.input}
                                />

                            </div>
                        </div>
                    ))}
                </Col>
            </Row>

            <Row className='mt-1'>
                <Col xl={2}>
                    {[
                        { label: "Add Local Sales tax", name: "add_local_tax_perc" },
                    ].map((field) => (
                        <div key={field.name}>
                            <div>
                                {/* <label>{field.label}</label> */}
                                <TextField style={{ width: '180px', textAlign: 'right' }}
                                    type="number"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value, "MOFMPARM")}
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

export default Finance

