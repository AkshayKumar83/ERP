import React, { useCallback } from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import { accNoHelpListHeader, costCentreHelpListHeader, expenseDetailHeader, generateTDSEntries, handleDbCrChange, validateAccNo, validateAmount, validateCostCentr, validatePurCode, whenValidateNarr } from './purchase_voucher_helper';
import RowAction from '../../../../components/common/rowAction';
import Select from '../../../../components/basic/select';
import TextField from '../../../../components/basic/textField';
import { FcInfo } from "react-icons/fc";
import { useSelector } from 'react-redux';

const PurchaseDetail = ({
    formData=[{}],
    thfmtranData = {},
    formStatus="",
    formControlData = {},
    handleChange=()=>{},
    handleAddRow=()=>{},
    purpose=[],
    registerType=[],
    handleHelpList=()=>{},
    openHelpList=()=>{},
    onSelectHelpItem=()=>{},
    focusedRowIndex = 0,
    setFocusedRowIndex=()=>{},
    parameter = '',
    setParameter=()=>{},
    setTdfmTranData=()=>{},
    handleDeleteRow=()=>{},
    updateFormData,
    handleCancelVch=()=>{},

}) => {
    const { user } = useSelector((state) => state.auth);

    // MAKE CURSOR ON DETAIL BLOCK
    const makeFocusOnTableRow = (rowIndex, row_id) => {
      const entry = formData.find((entry) => entry.row_id === row_id);
      setFocusedRowIndex(rowIndex);
    };

    // ADD NEW ROW
    const triggerAddRow = () => {
      handleAddRow()

      // todo : i make this logic by my own way might be required to check actual impolementation in oracle fmb
      if(parameter?.common_narr === 'Y' && parameter?.narr){
        setTdfmTranData(prev =>{
            const newData = [...prev];
            newData[formData.length] = { ...newData[formData.length], ['remarks']: parameter?.narr };
            return newData;
        })
      }   
    };


    // UPDATE ROW
    const handleUpdate = () => {};
    // FOR AMT FIELD
    const handleAmountChange = useCallback((e, index) => {
        const { value } = e.target;
        const { amount, db_cr } = handleDbCrChange(value, formData[index].db_cr);
         
        if(amount === '0'){
          handleChange(e, "amount", amount, index);
          handleChange(e, "db_cr", '', index);
          handleChange(e, "old_amount", amount, index); // ADDED AS PER CALCULATE AMOUNT PROGRAM UNIT
        }else{
            handleChange(e, "amount", amount, index);
            handleChange(e, "db_cr", db_cr, index);
        }
        },
        [formData, handleChange]
    );
      
    const reverseDbCr = (currentDbCr) => {
      return currentDbCr === 'D' ? 'C' : 'D';
    };

    // MAKE ENTRY REVERS
    const handleKeyDownOnAmt = useCallback((e, index) => {
      if (e.key === "-") {
        e.preventDefault();
        if(confirm('Do you want to revers the Entry')){
          let newValDbCr = reverseDbCr(formData[index].db_cr)
          //console.log('value of dbcr', newValDbCr)
          handleChange(e,"db_cr", newValDbCr, index);
        }
      }
    }, [formData]);

    // WHEN VALIDATE REMARKS / AUTOMAIZATION NARRATION
    const handleBlurRemarks =(e, data)=>{
        if(['Insert', 'Update'].includes(formStatus)){
            if(parameter.common_narr != 'Y' || parameter.common_narr == ''){
                let newParaData =   whenValidateNarr(e, data, parameter)
                setParameter(prev =>{
                    return {
                        ...prev, ...newParaData
                    }
                })
            }
        }
    }

    return (
        <Form id="exp-tdmftran-form">
            <div className="table-title">
                <span></span>
                {
                (formStatus === 'Insert' || formStatus === 'Update') &&
                <div className='d-flex gap-2'>
                    {formStatus == 'Insert' && 
                    <ButtonUi color="secondary" 
                    outline  
                    onClick={()=>{
                        generateTDSEntries({
                            thfmtranData,
                            tdfmtranData:formData[focusedRowIndex],
                            srl_no: formData.reduce((max, item) => Math.max(max, item.srl_no), 0) + 1,
                            detailData:formData,
                            formStatus,
                            updateFormData
                        }, setTdfmTranData)}}
                    type='button'>
                        TDS
                </ButtonUi>
                    }
                
                {/* <ButtonUi color="secondary" outline  onClick={()=>{}} type='button'>MRIR</ButtonUi> */}
                <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} >Add Row</ButtonUi>
                </div>
                }
            </div>
            <div className="table-wrapper-v3">
                <SimpleBar  forceVisible="y" autoHide={false}>
                <div className="table-sticky-wrapper">
                    <Table >
                        <thead>
                            <tr>{
                                    (formStatus==='Insert' || formStatus==='Update') &&
                                    <th className="" style={{width:'5%'}}>Actions</th>
                                }
                                {expenseDetailHeader.map((header, index) => (
                                    <th
                                        key={index}
                                        data-required={header.required || false}
                                        style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                            {header.label}
                                            {header.isHelpExist && (<FcInfo title="Info" />)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {formData.map((data, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <tr
                                 key={rowIndex}
                                 onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                                style={{
                                    borderTop: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                                    borderLeft: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                                    borderRight: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                                    borderBottom: "none"
                                }}
                                 tabIndex={0}
                                >
                                    {
                                        (formStatus==='Insert' || formStatus==='Update') &&
                                        <td className="">
                                            <RowAction
                                                formStatus={formStatus}
                                                canDelete={formData.length > 1}
                                                onDelete={() => handleDeleteRow(data, data.row_id)}
                                                // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                            />
                                        </td> 
                                    }
                                    <td>
                                        <TextField
                                            type="text"
                                            required
                                            name="remarks"
                                            value={data.remarks || ""}
                                            onChange={(e) => handleChange(e, "remarks", e.target.value, rowIndex)}
                                            onBlur={(e)=>handleBlurRemarks(e, data)}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            required
                                            name="sa_code"
                                            value={data.sa_code || ""}
                                            onChange={(e) => handleChange(e, "sa_code", e.target.value, rowIndex)}
                                            disabled
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            required
                                            name="acc_no"
                                            value={data.acc_no || ""}
                                            onChange={(e) => handleChange(e, "acc_no", e.target.value, rowIndex)}
                                            onDoubleClick={()=>openHelpList('acc_no', accNoHelpListHeader, rowIndex)}
                                            onBlur={(e)=>validateAccNo(e, e.target.value, formStatus, user, formData, thfmtranData, setTdfmTranData, rowIndex)}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            // required={data?.cc_purpose==='Y'?true:false}
                                            name="cost"
                                            value={data.cost || ""}
                                            onChange={(e) => handleChange(e, "cost", e.target.value, rowIndex)}
                                            onDoubleClick={()=>openHelpList('cost_centre', costCentreHelpListHeader, rowIndex)}
                                            onBlur={(e)=>validateCostCentr(e, e.target.value, formStatus, formData, setTdfmTranData, rowIndex)}
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            // required={data?.cc_purpose==='Y'?true:false}
                                            name="pur_code"
                                            value={data.pur_code || ""}
                                            onChange={(e) =>handleChange(e, "pur_code", e.target.value, rowIndex)}
                                            onBlur={(e)=>validatePurCode(e, e.target.value, formStatus, formData, setTdfmTranData, rowIndex)}
                                            options={purpose}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="Number"
                                            required
                                            name="amount"
                                            value={data.amount || ""}
                                            onChange={(e) => handleAmountChange(e, rowIndex)}
                                            onKeyDown={(e) => handleKeyDownOnAmt(e, rowIndex)}
                                            onBlur={(e)=>validateAmount(e, data)}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="db_cr"
                                            value={data.db_cr || ""}
                                            onChange={(e) => handleChange(e, "db_cr", e.target.value, rowIndex)}
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr 
                                onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                                style={{
                                    borderBottom: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                                    borderLeft: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                                    borderRight: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                                    borderTop: "none" 
                                }}
                                tabIndex={0}
                                >
                                    <td colSpan={formStatus === 'Query'|| formStatus === ''? 2 : 3}>
                                        <TextField
                                            type="text"
                                            name="service_cat"
                                            value={data.service_cat || ""}
                                            onChange={(e) => handleChange(e, "service_cat", e.target.value,rowIndex)}
                                            disabled
                                        />
                                    </td>
                                    <td colSpan={5}>
                                        <TextField
                                            type="text"
                                            name="acc_desc"
                                            value={data.acc_desc || ""}
                                            onChange={(e) =>handleChange(e, "acc_desc", e.target.value, rowIndex)}
                                            disabled
                                        />
                                    </td>
                                </tr>
                            </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                </div>
                </SimpleBar>
            </div>
            <Row className='mt-2'>
                <Col xl={7}>
                    <Card className='p-2'>
                        <Row>
                            <Col xl={2}>
                                <TextField
                                    required={formData[focusedRowIndex]?.emp_rel==='Y'?true:false}
                                    type="text"
                                    label='Emp Code'
                                    name="emp_cd"
                                    value={formData[focusedRowIndex]?.emp_cd || ""}
                                    onChange={(e) =>handleChange(e, "emp_cd", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </Col>
                            <Col xl={6}>
                                <TextField
                                    type="text"
                                    label='Emp Name'
                                    name="emp_name"
                                    value={formData[focusedRowIndex]?.emp_name || ""}
                                    onChange={(e) =>handleChange(e, "emp_name", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </Col>
                            <Col xl={3}>
                                <TextField
                                    type="Number"
                                    label='Total Amt'
                                    name="party_amt"
                                    value={formControlData.party_amt || ""}
                                    inpClass='bkg-yellow'
                                    onChange={(e) =>handleChange(e, "party_amt", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </Col>
                        </Row>
                        <Row className='mt-2'>
                            <Col xl={8}>
                                <TextField
                                    type="text"
                                    label='Cost Center'
                                    name="cost_desc"
                                    value={formData[focusedRowIndex]?.cost_desc || ""}
                                    onChange={(e) =>handleChange(e, "cost_desc", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                    onBlur={()=>validateCostCentr}
                                />
                            </Col>
                            <Col xl={3}>
                                <TextField
                                    type="text"
                                    label='Quantity'
                                    name="ref_obj_qty"
                                    value={formData[focusedRowIndex]?.ref_obj_qty || ""}
                                    onChange={(e) =>handleChange(e, "ref_obj_qty", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </Col>
                        </Row>
                        <Row className='mt-2'>
                            <Col xl={3}>
                                <Select
                                    // required
                                    label='Register Type'
                                    name="register_type"
                                    value={formData[focusedRowIndex]?.register_type || ""}
                                    onChange={(e) =>handleChange(e, "register_type", e.target.value, focusedRowIndex)}
                                    options={registerType}
                                /> 
                            </Col>
                            <Col xl={5} className='d-flex justify-content-center align-items-end pb-1'>
                                <ButtonUi disabled={formStatus != 'Query'} color='danger' onClick={handleCancelVch}>Cancel Voucher</ButtonUi>
                            </Col>
                            <Col xl={3}>
                                <TextField
                                    type="text"
                                    label='Ref. Obj'
                                    name="tel_no"
                                    value={formData[focusedRowIndex]?.tel_no || ""}
                                    onChange={(e) =>handleChange(e, "tel_no", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xl={5}>
                    <Card className='box-border p-2'>
                        <Row className=''>
                            <Col xl={6} className='d-flex'>
                            <div style={{width:"40%"}}>
                                <TextField
                                    type="Number"
                                    label='TDS %'
                                    name="tds_perc"
                                    value={formData[focusedRowIndex]?.tds_perc || ""}
                                    onChange={(e) =>handleChange(e, "tds_perc", e.target.value, focusedRowIndex)}

                                /> 
                            </div>
                            <div style={{width:"60%"}}>
                                <TextField
                                    type="Number"
                                    label='Amt'
                                    name="tds_amt"
                                     placeholder = "0.00"
                                    value={formData[focusedRowIndex]?.tds_amt || ""}
                                    onChange={(e) =>handleChange(e, "tds_amt", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </div>
                            </Col>
                            <Col xl={6} className='d-flex'>
                                <div style={{width:"40%"}}>
                                    <TextField
                                        type="Number"
                                        label='CESS %'
                                        name="tds_cess_perc"
                                        value={formData[focusedRowIndex]?.tds_cess_perc || ""}
                                        onChange={(e) =>handleChange(e, "tds_cess_perc", e.target.value, focusedRowIndex)}
                                        disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                    /> 
                                </div>
                                <div style={{width:"60%"}}>
                                    <TextField
                                        type="Number"
                                        label='Amt'
                                        name="tds_cess_amt"
                                         placeholder = "0.00"
                                        value={formData[focusedRowIndex]?.tds_cess_amt || ""}
                                        onChange={(e) =>handleChange(e, "tds_cess_amt", e.target.value, focusedRowIndex)}
                                        disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                    /> 
                                </div>
                            </Col>
                        </Row>
                        <Row className='mt-2'>
                            <Col xl={6} className='d-flex'>
                            <div style={{width:"40%"}}>
                                <TextField
                                    type="Number"
                                    label='SUR %'
                                    name="tds_sur_perc"
                                    value={formData[focusedRowIndex]?.tds_sur_perc || ""}
                                    onChange={(e) =>handleChange(e, "tds_sur_perc", e.target.value, focusedRowIndex)}

                                /> 
                            </div>
                            <div style={{width:"60%"}}>
                                <TextField
                                    type="Number"
                                    label='Amt'
                                    name="tds_sur_amt"
                                     placeholder = "0.00"
                                    value={formData[focusedRowIndex]?.tds_sur_amt || ""}
                                    onChange={(e) =>handleChange(e, "tds_sur_amt", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </div>
                            </Col>
                            <Col xl={6} className='d-flex'>
                                <div style={{width:"40%"}}>
                                    <TextField
                                        type="Number"
                                        label='HSC %'
                                        name="tds_hsc_perc"

                                        value={formData[focusedRowIndex]?.tds_hsc_perc || ""}
                                        onChange={(e) =>handleChange(e, "tds_hsc_perc", e.target.value, focusedRowIndex)}
                                        disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                    /> 
                                </div>
                                <div style={{width:"60%"}}>
                                    <TextField
                                        type="Number"
                                        label='Amt'
                                        name="tds_hsc_amt"
                                         placeholder = "0.00"
                                        value={formData[focusedRowIndex]?.tds_hsc_amt || ""}
                                        onChange={(e) =>handleChange(e, "tds_hsc_amt", e.target.value, focusedRowIndex)}
                                        disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                    /> 
                                </div>
                            </Col>
                        </Row>
                        <Row className='mt-2'>
                            <Col xl={6}>
                                <TextField
                                    type="Number"
                                    label='TDS Cr. Amt.'
                                    name="tds_cr_amt"
                                    placeholder = "0.00"
                                    value={formData[focusedRowIndex]?.tds_cr_amt || ""}
                                    onChange={(e) =>handleChange(e, "tds_cr_amt", e.target.value, focusedRowIndex)}
                                    disabled={formData[focusedRowIndex]?.emp_rel === "N" ? true : false}
                                /> 
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
}

export default PurchaseDetail
