import React from 'react'
import { Form, Row, Col, Card, Container } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Checkbox from '../../../../components/basic/checkbox'
import Select from '../../../../components/basic/select'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import { accDescHeader, accNoHeader, handleGenerateAccNo, handleValidateField, rollUpAcc1FcHeader, rollUpAcc1Header, rollUpAcc2FcHeader, rollUpAcc2Header, rollUpAcc3FcHeader, rollUpAcc3Header, rollUpAcc4FcHeader, rollUpAcc4Header, validateRollUpAcc} from './gl_master_helper'
import toast from 'react-hot-toast'

const GlMasterHeader = ({ 
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
        if (field === "rollUpAcc2" && !formData?.rollup_acc1) {
          toast.error("Rollup Acc. 1 is required before selecting Rollup Acc. 2");
          return;
        }

        if (field === "rollUpAcc3" && (!formData?.rollup_acc1 || !formData?.rollup_acc2)) {
          toast.error("Rollup Acc. 1 and 2 are required before selecting Rollup Acc. 3");
          return;
        }

        if (field === "rollUpAcc4" && (!formData?.rollup_acc1 || !formData?.rollup_acc2 || !formData?.rollup_acc3)) {
          toast.error("Rollup Acc. 1, 2 and 3 are required before selecting Rollup Acc. 4");
          return;
        }

        // If all checks pass, open help list
        setHelpFor(field);
        setHelpListHeader(header);
        handleHelpList(true);
      };



  return (
    < Form id="gl-master-trial-bal">
      <div className="text-wrapper  box-border p-3 mt-4">
        <span className="text-label">Rollup Account (Trial Balance)</span>
        {/* <Container> */}
        <Row className='mt-1'>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 1"
                  type="text"
                  id='rollup_acc1'
                  name="rollup_acc1"
                  value={formData?.rollup_acc1 || ""}
                  onChange={(e) => handleChange( "formData","rollup_acc1", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc1", rollUpAcc1Header)}
                  onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                   required={!formData?.controlacc}
                  // required={activeTab === 1 && !formData?.controlacc}
                   disabled={formStatus === 'Search'}
                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc1_desc"
                  value={formData?.rollup_acc1_desc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc1_desc", e.target.value,e)}
                  disabled
                /> 
                </Col>
            </Row>


          </Col>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 2"
                  type="text"
                  id='rollup_acc2'
                  name="rollup_acc2"
                  value={formData?.rollup_acc2 || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc2", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc2", rollUpAcc2Header)}
                  onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                  // disabled={formStatus === 'Insert' && !formData?.rollup_acc1}
                  required={!formData?.controlacc}
                  //    required={activeTab === 1 && !formData?.controlacc}
                  disabled={formStatus === 'Search'}
                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc2_desc"
                  value={formData?.rollup_acc2_desc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc2_desc", e.target.value,e)}
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
                  id='rollup_acc3'
                  name="rollup_acc3"
                  value={formData?.rollup_acc3 || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc3", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc3", rollUpAcc3Header)}
                 onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                  //  disabled={formStatus === 'Insert' && !formData?.rollup_acc2}
                         required={!formData?.controlacc}
                   // required={activeTab === 1 && !formData?.controlacc}
                   disabled={formStatus === 'Search'}
                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc3_desc"
                  value={formData?.rollup_acc3_desc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc3_desc", e.target.value,e)}
                  disabled
                />
                 </Col>
            </Row>


          </Col>
          <Col xl={5}>
            <Row>
              <Col xl={4}>
                <TextField
                  label="Rollup Acc. 4"
                  type="text"
                  id='rollup_acc4'
                  name="rollup_acc4"
                  value={formData?.rollup_acc4 || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc4", e.target.value,e)}
                  onDoubleClick={() => handleDoubleClick("rollUpAcc4", rollUpAcc4Header)}
                  onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                  // disabled={formStatus === 'Insert' && !formData?.rollup_acc3}
                  required={!formData?.controlacc}
                  //required={activeTab === 1 && !formData?.controlacc}
                  disabled={formStatus === 'Search'}
                />
              </Col>

              <Col xl={8} className='mt-4'>
                <TextField
                  label=""
                  type="text"
                  name="rollup_acc4_desc"
                  value={formData?.rollup_acc4_desc || ""}
                  onChange={(e) => handleChange(  "formData","rollup_acc4_desc", e.target.value,e)}
                  disabled
                />
                 </Col>
            </Row>

          </Col>
          <Col xl={2}>
            <TextField
              label="Rollup Account (Trial)"
              type="text"
              name="rollup_acc"
              value={formData?.rollup_acc || ""}
              onChange={(e) => handleChange(  "formData","rollup_acc", e.target.value,e)}
              disabled
            />
          </Col>
        </Row>
        
         {/* <Row className='mt-1'>
         
           
              <Col xl={2}>
               <TextField
              label="Rev. RollUp"
              type="text"
              maxLength={13}
              name="rollup_rev"
              value={formData?.rollup_rev || ""}
              onChange={(e) => handleChange(  "formData","rollup_rev", e.target.value,e)}
            />
              </Col>
         
         
            
        
         
        </Row> */}
      </div>

        

    

    </Form>
  )
}

export default GlMasterHeader

