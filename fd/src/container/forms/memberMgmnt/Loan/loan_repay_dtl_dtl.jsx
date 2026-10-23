import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Row, Col, Form, Table } from 'reactstrap';
import SimpleBar from 'simplebar-react'
import ButtonUi from '../../../../components/basic/button'
import TextField from '../../../../components/basic/textField'
import RowAction from '../../../../components/common/rowAction';
import { efaDetalDtlHeader, efaDetalDtlHeaderOnQuery, efaDetalHeader } from './loan_repay_helper';
import Select from '../../../../components/basic/select';


const LoanRepayDtlDtl= ({
    formData,
    formStatus,
    handleChange,
    handleAddRow,
    handleDeleteRow,
    handleHelpList=()=>{},
    openHelpList=()=>{},
    onSelectHelpItem=()=>{},
    focusedRowIndex = 0,
    setFocusedRowIndex=()=>{},
    handleAllowManualAdj= ()=>{},
    allowManualAdj,

}) => {
    const tableContainerRef = useRef(null);

    // const [allowManualAdj, setAllowManualAdj] =useState(true)

   let efaDetalDtlHdr = formStatus == 'Query'?efaDetalDtlHeaderOnQuery:efaDetalDtlHeader
    

    const scrollToBottom = useCallback(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
        }
    }, []);

    const handleDelete = async (data, index) => {
        handleDeleteRow(index); 
    };

    const handleUpdate = async (data) => {
        ////console.log("Update button clicked");
    };

    const handleAdd = () => {
        handleAddRow(); 
        setTimeout(() => {
            setFocusedRowIndex(formData.length); // Ensure it updates AFTER state change
        }, 0);
    };

    const makeFocusOnTableRow = (rowIndex, row_id) => {
        const entry = formData.find((entry) => entry.row_id === row_id);
        setFocusedRowIndex(rowIndex);
    };

    useEffect(() => {
        if (formStatus !== 'Query') {
            scrollToBottom();
        }
    }, [formData.length, formStatus, scrollToBottom]); // Scroll only when the number of rows changes

    // const handleAllowManualAdj = ()=>{
    //     if(allowManualAdj){
    //         setAllowManualAdj(false)
    //     }
    // }
    

    return (
        <Form id="loan-repay-dtl-dtl-form">
            <Row>
                <Col className='m-auto'>
            
                        <div className="table-title">
                        <span>Receipts Detail (FIFO adjusted)</span>
                            {
                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <ButtonUi color="primary" className="add-action" onClick={handleAllowManualAdj}>
                                    Allow Manual Adjustment  
                                </ButtonUi>
                            }

                        </div>
                        {/* <div style={{ height: '180px', maxHeight: '180px' }} className='table-container'> */}
                        <div className="table-wrapper-v3">
                            <SimpleBar forceVisible="Y" autoHide={false}>
                               <div className={`table-sticky-wrapper`}>
                                <Table hover >
                                    <thead>
                                        <tr>
                                          {(formStatus === "Insert" || formStatus === "Update") && (
                                            <th style={{ width: "5%" }}>Actions</th>
                                          )}
                                          {efaDetalDtlHdr.map((header, index) => (
                                            <th
                                              key={index}
                                              data-required={header.required || false}
                                              style={{
                                                whiteSpace: "nowrap",
                                                width: header.width,
                                                minWidth: header.width,
                                              }}
                                            >
                                              {header.label}
                                              {header.isHelpExist && <span title="Info">ℹ️</span>}
                                            </th>
                                          ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData &&
                                            formData.map((data, rowIndex) => (
                                                <tr key={rowIndex}
 //                                               style={{border:`${rowIndex=== focusedRowIndex? '2px solid black': 'none'}`}}
                                                onFocus={() => makeFocusOnTableRow(rowIndex, data.row_id)}
                                                >
                                                    {
                                                        (formStatus === 'Insert' || formStatus === 'Update') &&
                                                        <td className="">
                                                            <RowAction
                                                                formStatus={formStatus}
                                                                canDelete={formData.length > 1}
                                                                onDelete={() => handleDelete(data, rowIndex)}
                                                                // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                            />
                                                        </td>
                                                    }
                                                    {/* <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                            name="efa_id"
                                                            value={data?.efa_id || ''}
                                                            onChange={(e) =>handleChange(e, "efa_id", e.target.value, rowIndex)}
                                                        />
                                                    </td> */}
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                            disabled
                                                            name="emi_sno"
                                                            value={data?.emi_sno || ''}
                                                            onChange={(e) =>handleChange(e, "emi_sno", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    {
                                                        formStatus == 'Query' && 
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                            name="party_name"
                                                            disabled
                                                            value={data?.party_name || ''}
                                                            onChange={(e) =>handleChange(e, "party_name", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    }
                                                    {
                                                        formStatus == 'Query' && 
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                             disabled
                                                            name="efa_ctrl_id"
                                                            value={data?.efa_ctrl_id || ''}
                                                            onChange={(e) =>handleChange(e, "efa_ctrl_id", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    }
                                                   
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                            disabled
                                                            name="receipt_number"
                                                            value={data?.receipt_number || ''}
                                                            onChange={(e) =>handleChange(e, "receipt_number", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                   <td className='table_cell'>
                                                       <TextField 
                                                    //    style={{ width: '100%', padding: '5px' }}
                                                           name="receipt_date"
                                                           type="date"
                                                           disabled
                                                           value={data?.receipt_date || ''}    
//                                                           value={data?.acc_no || ''}
                                                            onChange={(e) =>handleChange(e, "receipt_date", e.target.value, rowIndex)}
//                                                            onDoubleClick={()=>openHelpList('acc_no', accNoHelpListHeader, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                       <TextField 
                                                    //    style={{ width: '100%', padding: '5px' }}
                                                            disabled
                                                           name="bank_name"
                                                           type="text"
                                                           value={data?.bank_name || ''}    
//                                                           value={data?.acc_no || ''}
                                                            onChange={(e) =>handleChange(e, "bank_name", e.target.value, rowIndex)}
//                                                            onDoubleClick={()=>openHelpList('acc_no', accNoHelpListHeader, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                       <TextField 
                                                    //    style={{ width: '100%', padding: '5px' }}
                                                    disabled
                                                           name="instrument_no"
                                                           type="text"
                                                           value={data?.instrument_no || ''}    
//                                                           value={data?.acc_no || ''}
                                                            onChange={(e) =>handleChange(e, "instrument_no", e.target.value, rowIndex)}
//                                                            onDoubleClick={()=>openHelpList('acc_no', accNoHelpListHeader, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                       <TextField 
                                                    //    style={{ width: '100%', padding: '5px' }}
                                                    disabled
                                                           name="instrument_date"
                                                           type="date"
                                                           value={data?.instrument_date || ''}    
//                                                           value={data?.acc_no || ''}
                                                            onChange={(e) =>handleChange(e, "instrument_date", e.target.value, rowIndex)}
//                                                            onDoubleClick={()=>openHelpList('acc_no', accNoHelpListHeader, rowIndex)}
                                                        />
                                                    </td>
                                                        <td className='table_cell'>
                                                        <TextField style={{ textAlign: 'Right' }}
                                                                disabled = {!allowManualAdj}
                                                            required
                                                            type="text"
                                                            name="remarks"
                                                            value={data?.remarks || ''}
                                                            onChange={(e) =>handleChange(e, "remarks", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                      <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                                    disabled = {!allowManualAdj}
                                                            type="number"
                                                            name="amt_principal_adjust"
                                                            value={data?.amt_principal_adjust || ''}
                                                            onChange={(e) =>handleChange(e, "amt_principal_adjust", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                
                                                    <td className='table_cell'>
                                                        <TextField 
                                                                disabled = {!allowManualAdj}
                                                            required
                                                            type="number"
                                                            name="amt_serv_chg_adjust"
                                                            value={data?.amt_serv_chg_adjust || ''}
                                                            onChange={(e) =>handleChange(e, "amt_serv_chg_adjust", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                                    disabled = {!allowManualAdj}
                                                            type="number"
                                                            name="amt_interest_adjust"
                                                            value={data?.amt_interest_adjust || ''}
                                                            onChange={(e) =>handleChange(e, "amt_interest_adjust", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                                    disabled = {!allowManualAdj}
                                                            type="number"
                                                            name="amt_igst_adjust"
                                                            value={data?.amt_igst_adjust || ''}
                                                            onChange={(e) =>handleChange(e, "amt_igst_adjust", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                            disabled = {!allowManualAdj}
                                                            type="number"
                                                            name="amt_cgst_adjust"
                                                            value={data?.amt_cgst_adjust || ''}
                                                            onChange={(e) =>handleChange(e, "amt_cgst_adjust", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                    <td className='table_cell'>
                                                        <TextField 
                                                            required
                                                           disabled = {!allowManualAdj}
                                                            type="number"
                                                            name="amt_sgst_adjust"
                                                            value={data?.amt_sgst_adjust || ''}
                                                            onChange={(e) =>handleChange(e, "amt_sgst_adjust", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                                
                                                        <td className='table_cell'>
                                                        <TextField style={{ textAlign: 'Right' }}
                                                        disabled = {!allowManualAdj}
                                                            required
                                                            type="number"
                                                            name="amount_recd"
                                                            value={data?.amount_recd|| ''}
                                                            onChange={(e) =>handleChange(e, "amount_recd", e.target.value, rowIndex)}
                                                        />
                                                    </td>
                                               </tr> 
                                            ))}
                                    </tbody>
                                </Table>
                                </div>
                            </SimpleBar>
                        </div>
                  
                </Col>
            </Row>
        </Form>
    )
}

export default LoanRepayDtlDtl;

