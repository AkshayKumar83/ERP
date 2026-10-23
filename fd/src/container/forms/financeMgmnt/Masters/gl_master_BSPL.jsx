
import React from 'react'
import { Form, Row, Col, Card, Container } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Checkbox from '../../../../components/basic/checkbox'
import Select from '../../../../components/basic/select'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import { accDescHeader, accNoHeader, handleGenerateAccNo, handleValidateField, rollUpAcc1FcHeader, rollUpAcc1Header, rollUpAcc2FcHeader, rollUpAcc2Header, rollUpAcc3FcHeader, rollUpAcc3Header, rollUpAcc4FcHeader, rollUpAcc4Header, validateRollUpAcc} from './gl_master_helper'
import toast from 'react-hot-toast'

const GlMasterBSPL = ({ 
  formData, formStatus,activeTab,
  isCanceling, handleChange ,controlAcc = [], genFlag = [], handleHelpList = () => {}, setHelpFor, setHelpListHeader, setFormData, setFormDetailData }) => {

 
  // const handleDoubleClick = (field, header) => {
  //   if (formStatus) {
  //     setHelpFor(field); // Set the help type dynamically
  //     setHelpListHeader(header); // Set the appropriate header list
  //     handleHelpList(true); // Open the modal
  //   }
  // };

        const handleDoubleClick = (field, header) => {
        if (!formStatus) return;

          if ((field === "accNo" || field === "accDesc") && formStatus !== "Search") {
              return; // prevent opening helplist
            }

           const controlAccFilled = formData?.controlacc && formData?.controlacc.trim() !== "";
          if (controlAccFilled && field.toLowerCase().includes("rollup")) {
            toast.error("You cannot select Rollup when Control Account is filled");
            return;
          }

        // Validation logic
        if (field === "rollUpAcc2" && !formData?.rollup_acc1_fc) {
          toast.error("Rollup Acc. 1 is required before selecting Rollup Acc. 2");
          return;
        }

        if (field === "rollUpAcc3" && (!formData?.rollup_acc1_fc || !formData?.rollup_acc2_fc)) {
          toast.error("Rollup Acc. 1 and 2 are required before selecting Rollup Acc. 3");
          return;
        }

        if (field === "rollUpAcc4" && (!formData?.rollup_acc1_fc || !formData?.rollup_acc2_fc || !formData?.rollup_acc3_fc)) {
          toast.error("Rollup Acc. 1, 2 and 3 are required before selecting Rollup Acc. 4");
          return;
        }

        // If all checks pass, open help list
        setHelpFor(field);
        setHelpListHeader(header);
        handleHelpList(true);
      };



  return (
    < Form id="gl-master-bspl">
      

         {/* Ass discuss by PM Sir Rollup Account (Foreign Collaboration) textfield is disable for Eddal. */}

      <div className="text-wrapper box-border p-3 mt-4">
        <span className="text-label">Rollup Account (BSPL)</span>
        <Row className='mt-1'>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 1"
                  type="text"
                  name="rollup_acc1_fc"
                  value={formData?.rollup_acc1_fc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc1_fc", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc1Fc", rollUpAcc1FcHeader)}
                 disabled={formStatus === 'Search'}
                  required={!formData?.controlacc}
                  // required={activeTab === 2 && !formData?.controlacc}
                  onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                 

                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc1_fc_desc"
                  value={formData?.rollup_acc1_fc_desc|| ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc1_fc_desc", e.target.value,e)}
                  disabled
                /> </Col>
            </Row>


          </Col>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 2"
                  type="text"
                  name="rollup_acc2_fc"
                  value={formData?.rollup_acc2_fc  || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc2_fc", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc2Fc", rollUpAcc2FcHeader)}
                disabled={formStatus === 'Search'}
                 required={!formData?.controlacc}  
                // required={activeTab === 2 && !formData?.controlacc}
                onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                          
                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc2_fc_desc"
                  value={formData?.rollup_acc2_fc_desc ||  ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc2_fc_desc", e.target.value,e)}
                  disabled
                  /> 
                </Col>
            </Row>

          </Col>
          
        </Row>
        <Row className='mt-1'>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 3"
                  type="text"
                  name="rollup_acc3_fc"
                  value={formData?.rollup_acc3_fc ||  ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc3_fc", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc3Fc", rollUpAcc3FcHeader)}
                disabled={formStatus === 'Search'}
                  required={!formData?.controlacc}
                // required={activeTab === 2 && !formData?.controlacc}
                 onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                   

                  />    
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc3_fc_desc"
                  value={formData?.rollup_acc3_fc_desc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc3_fc_desc", e.target.value,e)}
                  disabled
                /> </Col>
            </Row>


          </Col>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 4"
                  type="text"
                  name="rollup_acc4_fc"
                  value={formData?.rollup_acc4_fc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc4_fc", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc4Fc", rollUpAcc4FcHeader)}
                 disabled={formStatus === 'Search'}
                   required={!formData?.controlacc}
                // required={activeTab === 2 && !formData?.controlacc}
                 onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                   

                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc4_fc_desc"
                  value={formData?.rollup_acc4_fc_desc ||  ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc4_fc_desc", e.target.value,e)} 
                  disabled
                  />
                </Col>
            </Row>

          </Col>
          {/* <Col xl={2} className='mt-4'>
            <TextField
              label=""
              type="text"
              maxLength={10}
              name="rollup_acc_fc_own"
              value={formData?.rollup_acc_fc_own || ""}
              onChange={(e) => handleChange(  "formData","rollup_acc_fc_own", e.target.value,e)}
            />

          </Col> */}

{/*         
          <Col xl={2} className='mt-3'>
             <ButtonUi color="secondary" onClick={()=>handleGenerateAccNo({formData, setFormData, setFormDetailData,formStatus,rollupType: "BSPL",})}>
              Generate Acc. Code
            </ButtonUi>
          </Col> */}
          <Col xl={2}>
            <TextField
              label="Rollup Account (BSPL)"
              type="text"
              name="rollup_acc_fc"
              value={formData?.rollup_acc_fc || ""}
              onChange={(e) => handleChange(  "formData","rollup_acc_fc ", e.target.value,e)}
              disabled
            />
          </Col>
          
        </Row>
      </div>

    

    </Form>
  )
}

export default GlMasterBSPL

