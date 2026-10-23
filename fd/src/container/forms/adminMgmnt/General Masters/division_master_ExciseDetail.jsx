import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import toast from 'react-hot-toast'

const ExciseDetail = ({ formData, handleChange, formStatus }) => {

    const handleRateValue = (data) => { 

        if(data === '' || data === 'undefined' || data === null) {
            return
        }
        if (data < 0) {
            toast.error('This value can not be negative')
            return true
        }

        return false
    }



    return (
        <Form id="division-master-excise-form">
            <Row style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Collectorate"
                        //required
                        placeholder=""
                        name="collectorate"
                        type="text"
                        value={formData?.collectorate || ""}
                        maxLength={50}
                        onChange={(e) =>
                            handleChange("collectorate", e.target.value, e)
                        }
                    />
                </Col>
                <Col>
                    <TextField
                        label="Excise Division"
                        //required
                        placeholder=""
                        name="ex_div"
                        type="text"
                        value={formData?.ex_div || ""}
                        maxLength={40}
                        onChange={(e) =>
                            handleChange("ex_div", e.target.value, e)
                        }
                    />
                </Col>


            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Excise Circles"
                        //required
                        placeholder=""
                        name="circle"
                        type="text"
                        value={formData?.circle || ""}
                        maxLength={50}
                        onChange={(e) =>
                            handleChange("circle", e.target.value, e)
                        }
                    />
                </Col>

                <Col>
                    <TextField
                        label="Excise Range"
                        //required
                        placeholder=""
                        name="ex_range"
                        type="text"
                        value={formData?.ex_range || ""}
                        maxLength={40}
                        onChange={(e) =>
                            handleChange("ex_range", e.target.value, e)
                        }
                    />
                </Col>

            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Excise Region No"
                        //required
                        placeholder=""
                        name="excise_region_no"
                        type="text"
                        value={formData?.excise_region_no || ""}
                        maxLength={50}
                        onChange={(e) =>
                            handleChange("excise_region_no", e.target.value, e)
                        }
                    />
                </Col>

                <Col>
                    <TextField
                        label="Ecc No"
                        //required
                        placeholder=""
                        name="ecc_no"
                        type="text"
                        value={formData?.ecc_no || ""}
                        maxLength={50}
                        onChange={(e) =>
                            handleChange("ecc_no", e.target.value, e)
                        }
                    />
                </Col>

            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col>
                    <TextField
                        label="Excise Duty Rate"
                        //required
                        placeholder=""
                        name="ex_duty_rt"
                        type="number"
                        value={formData?.ex_duty_rt || ""}
                        onChange={(e) =>
                            handleChange("ex_duty_rt", e.target.value, e)
                        }

                        onBlur={(e) => {
                            if (formStatus === 'Insert' || formStatus === 'Update') {
                                 //console.log('rate') 
                                 
                                const rate = Number(e.target.value);
                                console.log('errg', rate)
                                const hasLocalError = handleRateValue(rate);
                                if (hasLocalError) {
                                    e.target.focus()
                                    return;
                                }

                            }
                        }
                        }
                    />
                </Col>

                <Col>
                    <TextField
                        label="Sale Voucher Prefix"
                        //required
                        placeholder=""
                        name="sale_vch_prefix"
                        type="text"
                        value={formData?.sale_vch_prefix || ""}
                        maxLength={3}
                        onChange={(e) =>
                            handleChange("sale_vch_prefix", e.target.value, e)
                        }
                    />
                </Col>


            </Row>

            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col lg={6}>
                    <TextField
                        label="Legal Name"
                        //required
                        placeholder=""
                        name="legal_name"
                        type="text"
                        value={formData?.legal_name || ""}
                        maxLength={200}
                        onChange={(e) =>
                            handleChange("legal_name", e.target.value, e)
                        }
                    />
                </Col>
                <Col lg={6} className='mt-4 note-text'>
                    <span>(For E-Invoice Purpose and do not put ',' in this field)</span>
                </Col>
            </Row>

            <Row>
                <Col lg={6}>
                    <TextField
                        label="Company Name"
                        //required
                        placeholder=""
                        name="company_name"
                        type="text"
                        value={formData?.company_name || ""}
                        maxLength={200}
                        onChange={(e) =>
                            handleChange("company_name", e.target.value, e)
                        }
                    />
                </Col>
                <Col lg={6} className='mt-4 note-text'>
                    <span>(For E-Invoice Purpose and do not put ',' in this field)</span>
                </Col>

            </Row>


            <Row className='mt-1' style={{ justifyContent: 'space-between' }}>
                <Col lg={6}>
                    <TextField
                        label="LUT No"
                        // required
                        placeholder=""
                        name="lut_no"
                        type="text"
                        maxLength={100}
                        value={formData?.lut_no || ""}
                        onChange={(e) =>
                            handleChange("lut_no", e.target.value, e)
                        }
                    />
                </Col>

            </Row>
            <Row>
                <Col lg={6}>
                    <TextField
                        label="MSME UDAM No"
                        //required
                        placeholder=""
                        name="msme_udam_no"
                        type="text"
                        value={formData?.msme_udam_no || ""}
                        maxLength={20}
                        onChange={(e) =>
                            handleChange("msme_udam_no", e.target.value, e)
                        }
                    />
                </Col>
            </Row>


        </Form>
    )
}

export default ExciseDetail;

