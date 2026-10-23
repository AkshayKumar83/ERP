import React from 'react'
import { Col, Row } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import RadioGroup from '../../../../components/basic/radioGroup'
import ButtonUi from '../../../../components/basic/button'

const ScrapOrderCharges = ({chrgFormData, formStatus, handleChange=()=>{}, handleChangeTab=()=>{}}) => {
  return (
    <>
    <Row>
       <Col >
       <div className=" col-sm-12 col-md-12 col-lg-12 text-wrapper  box border p-2 mt-sm-3 mt-md-3">
        <span className="text-label">Other Charges</span>
      
        <Row className='mt-2 ms-4'>
          <Col sm={8} md={3} lg={2} >
            <div className="  col-sm-12 col-md-12 col-lg-12  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span>Packing & Forwarding %</span>
              <Col lg={10} className="mt-2">
                <TextField
                  type="text"
                   value={chrgFormData.pack_forw || ""}
                   onChange={(e) => handleChange("pack_forw", e.target.value)}
                />
              </Col>
            </div>
          </Col>

          <Col sm={8} md={7} lg={5} >
          <Row>
            <Col>
            <div className="  col-sm-12 col-md-12 col-lg-8  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Insurance</span>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("ins_flag", e.target.value)}
                 checked={chrgFormData?.ins_flag || " "}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                 onChange={(e) => handleChange("ins_amt_prc", e.target.value)}
                 checked={chrgFormData?.ins_amt_prc || " "}
              />
              <TextField
                type="text"
                 value={chrgFormData.ins_chg || ""}
                 onChange={(e) => handleChange("ins_chg", e.target.value)}
              />
            </div>
            </Col>
          </Row>
          <Row className='mt-2'>
          <Col>
            <div className="  col-sm-12 col-md-12 col-lg-8  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Freight</span>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("frt_flg", e.target.value)}
                 checked={chrgFormData?.frt_flg || " "}
              />
              <RadioGroup
                className="mt-1 radio-button-wrapper"
                options={[
                  { text: "Percentage", value: "P" },
                  { text: "Value", value: "V" },
                ]}
                 onChange={(e) => handleChange("frt_amt_prc", e.target.value)}
                 checked={chrgFormData?.frt_amt_prc || " "}
              />
              <TextField
                type="text"
                 value={chrgFormData.frt_chg || ""}
                 onChange={(e) => handleChange("frt_chg", e.target.value)}
              />
            </div>
            </Col>
          </Row>
          <Row className='mt-2'>
          <Col>
            <div className="  col-sm-12 col-md-12 col-lg-8  text-wrapper  box border p-3 mt-sm-3 mt-md-3 mt-lg-2">
              <span className="text-label">Octroi</span>
              <RadioGroup
                className="radio-button-wrapper   box-border "
                options={[
                  { text: "None", value: "1" },
                  { text: "Customer", value: "2" },
                  { text: "Us", value: "3" },
                ]}
                 onChange={(e) => handleChange("octroi_flg", e.target.value)}
                 checked={chrgFormData?.octroi_flg || " "}
              />
              <TextField 
              style={{marginTop:"5%"}}
                type="text"
                 value={chrgFormData.octroi_chg || ""}
                 onChange={(e) => handleChange("octroi_chg", e.target.value)}
              />
            </div>
            </Col>
          </Row>
          </Col>
        </Row>
      </div>
       </Col> 

    </Row>

    <Row className="mt-4 ">
        <Col className="d-flex justify-content-center">
          <ButtonUi type="button" color="dark" outline onClick={()=>{handleChangeTab('Main')}}>
            Main Details
          </ButtonUi>
        </Col>
      </Row>
   
    </>
  )
}

export default ScrapOrderCharges