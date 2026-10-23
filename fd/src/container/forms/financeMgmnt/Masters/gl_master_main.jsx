import React from 'react'
import { Form, Row, Col, Card, Container } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import Checkbox from '../../../../components/basic/checkbox'
import Select from '../../../../components/basic/select'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'
import { accDescHeader, accNoHeader, handleGenerateAccNo, handleValidateField, rollUpAcc1FcHeader, rollUpAcc1Header, rollUpAcc2FcHeader, rollUpAcc2Header, rollUpAcc3FcHeader, rollUpAcc3Header, rollUpAcc4FcHeader, rollUpAcc4Header, validateRollUpAcc} from './gl_master_helper'
import toast from 'react-hot-toast'

const GlMasterMain = ({ 
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
    < Form id="gl-master-main">

      <Card className="mb-2 p-3 shadow-sm mt-4">
        {/* <Container> */}
                    <Row>
                        <Col xl={2}>
                            <TextField
                                label="Account No"
                                type="text"
                                name="acc_no"
                                maxLength={20}
                                value={formData?.acc_no || ""}
                                onChange={(e) => handleChange( "formData","acc_no", e.target.value,e)}
                                // onBlur={(e)=>validateRollUpAcc(e,'acc_no', e.target.value,e, formStatus, formData,setFormData)}
                              required
                              disabled={!(formStatus === "Search")}
                              onDoubleClick={() => handleDoubleClick("accNo", accNoHeader)}
                            />
                        </Col>

                         <Col xl={3}>
                        <TextField
                        label="Account Description"
                        type="text"
                        id='acc_desc'
                        maxLength={100}
                        name="acc_desc"
                        value={formData?.acc_desc || ""}
                        onChange={(e) => handleChange( "formData","acc_desc", e.target.value,e)}
                        onBlur={(e)=> handleValidateField(e,formStatus,isCanceling)}
                          onDoubleClick={() => handleDoubleClick("accDesc", accDescHeader)}
                        required
                    />
                </Col>
                 
                 
                <Col xl={2} className='mt-4'>
                    <Checkbox
                        text="Cost Centre & Purpose Related"
                        checked={formData?.cc_purpose  === "Y"}
                        onChange={(e) => handleChange( "formData","cc_purpose", e.target.checked ? "Y" : "N")}
                    />
                    
                </Col>

                <Col xl={3} className='mt-4'>
                    <Checkbox
                        text="A/c exclusive to foreign Collaborator "
                        checked={formData?.acc_exclusive_to_fc === "Y"}
                        onChange={(e) => handleChange( "formData","acc_exclusive_to_fc", e.target.checked ? "Y" : "N")}
                    />
                </Col>
                <Col xl={2} className='mt-3'>
                             <ButtonUi color="secondary" 
                             disabled={formStatus !== 'Insert'}
                             onClick={()=>handleGenerateAccNo({formData, setFormData, setFormDetailData,formStatus,rollupType: "GL",})}>
                              Generate Acc. Code
                            </ButtonUi>
                          </Col>
            </Row>

            <Row className='mt-1'>
                <Col xl={3}>
                    <Select
                        label="Ref. Object Relation"
                        type="text"
                        name="gen_flag"
                        value={formData?.gen_flag || ""}
                        onChange={(e) => handleChange( "formData","gen_flag", e.target.value,e)} 
                         options={genFlag}
                         />
                </Col>
                 <Col xl={3}>
                    <Select
                        label="Control Acc. No."
                        type="text"
                        name="controlacc"
                        value={formData?.controlacc || ""}
                        onChange={(e) => handleChange( "formData","controlacc", e.target.value,e)} 
                         options={controlAcc}
                         />
                </Col>
                <Col xl={2} className='mt-4'>
                    <Checkbox
                        text="Employee Related"
                        name = "emp_relate"
                        checked={formData?.emp_relate === "Y"}
                    onChange={(e) =>
                      handleChange( "formData","emp_relate",e.target.checked ? "Y" : "N" )}
                    />
                </Col>

                <Col xl={2} className='mt-4'>
                    <Checkbox
                        text="Inter Plant Account"
                        checked={formData?.inter_plant_ac === "Y" }
                        onChange={(e) => handleChange( "formData","inter_plant_ac", e.target.checked ? "Y" : "N")}
                    />
                </Col>

                <Col xl={2} className='mt-4'>
                    <Checkbox
                        text="Db/Cr Note to be Made "
                        checked={formData?.allow_dn_cn === "Y"}
                        onChange={(e) => handleChange( "formData","allow_dn_cn", e.target.checked ? "Y" : "N")}
                    />
                </Col>
            </Row>

            <Row className='mt-1'>
                {/* <Col xl={2} className='mt-4'>
                    <Checkbox
                        text="Control Account"
                        checked={formData?.ctrlprefix === "Y"}
                        onChange={(e) => handleChange( "formData","ctrlprefix", e.target.checked ? "Y" : "N")}
                    />
                </Col> */}

                <Col xl={2}>
                            <TextField 
                                label=" Schedule No"
                                type="number"
                                name="sch_no"
                                value={formData?.sch_no ?? ""}
                                onChange={(e) => handleChange( "formData","sch_no", e.target.value,e)}
                                
                            />
                        </Col>

                <Col  xl={2}>
                            <TextField
                                label="Sub Schedule No"
                                type="number"
                                name="sub_sch_no"
                                value={formData?.sub_sch_no ?? ""}
                                onChange={(e) => handleChange( "formData","sub_sch_no", e.target.value,e)}
                                
                            />
                        </Col>
                         <Col xl={2} className="">
                    <label className="">Nature of Account</label>
                    <RadioGroup
                        className="radio-button-wrapper box-border"
                        options={[
                            { text: "Credit", value: "C" },
                            { text: "Debit", value: "D" },
                        ]}
                        onChange={(e) => handleChange( "formData","default_status", e.target.value, e)}
                        checked={formData?.default_status || "D"}
                    />
                </Col>
                         <Col xl={2} className='mt-4'>
                    <Checkbox
                        text="Control Account"
                        checked={formData?.ctrlprefix === "Y"}
                        onChange={(e) => handleChange( "formData","ctrlprefix", e.target.checked ? "Y" : "N")}
                    />
                </Col>
                         <Col className='mt-4' xl={2}>
                    <Checkbox
                        text="Has Fin. Transaction"
                        checked={formData?.has_fin_trans === "Y"}
                        onChange={(e) => handleChange( "formData","has_fin_trans", e.target.checked ? "Y" : "N")}
                    />
                </Col>
                <Col className="mt-4" xl={2}>
                    <Checkbox
                        text="Consolidated Point"
                        checked={formData?.consol_print === "Y"}
                        onChange={(e) => handleChange( "formData","consol_print", e.target.checked ? "Y" : "N")}
                    />
                </Col>
                {/* <Col xl={2} className="">
                    <label className="">Nature of Account</label>
                    <RadioGroup
                        className="radio-button-wrapper box-border"
                        options={[
                            { text: "Credit", value: "C" },
                            { text: "Debit", value: "D" },
                        ]}
                        onChange={(e) => handleChange( "formData","default_status", e.target.value, e)}
                        checked={formData?.default_status || "D"}
                    />
                </Col> */}
            </Row>

          
   {/* </Container> */}
     </Card>

    </Form>
  )
}

export default GlMasterMain

