import React, { useState } from 'react'
import { Row, Col, Form, Table, Card } from "reactstrap"
import TextField from "../../../../components/basic/textField"
import RadioGroup from "../../../../components/basic/radioGroup"
import ButtonUi from "../../../../components/basic/button"
import SimpleBar from "simplebar-react"
import Select from "../../../../components/basic/select"
import { insOrFreightHeaders, freightTabGstHeaders } from './itc_helpers'

import RowAction from "../../../../components/common/rowAction"
import Checkbox from '../../../../components/basic/checkbox'
import { tableData } from './itc_helpers'

const Freight = ({ formData, formStatus, handleChange, handleChangeTab }) => {

    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const makeFocusOnTableRow = (focusedRowIndex, id) => {
        const entry = formData.find((entry) => entry.id === id);
        setFocusedRowIndex(focusedRowIndex);
        // triggerFamilyDetail(id)
    };


    return (
        // <React.Fragment>
        //     <Row>
        //         {/* <Card className="mb-2 p-1 shadow-sm"> */}
        //             <Row>
        //                 <Col xl={3}>
        //                     <div className="text-wrapper box-border p-2 m-auto" >
        //                         <span className="text-label">Insurence</span>

        //                         <Row className='mt-1'>
        //                             <Col>
        //                                 <RadioGroup
        //                                     className="button-group-wrapper box-border justify-content-between"
        //                                     options={[
        //                                         { text: "Percentage", value: "P" },
        //                                         { text: "value", value: "V" },

        //                                     ]}
        //                                     onChange={(e) => handleChange("formData", "ins_amt_prc", e.target.value)}
        //                                     checked={formData[focusedRowIndex]?.ins_amt_prc}
        //                                 />
        //                             </Col>
        //                         </Row>
        //                         <Row className='mt-2'>
        //                             <Form id="itc-entry-freight-form">

        //                                 <div className="table-container" style={{ height: '90px', maxHeight: '90px' }}>
        //                                     <SimpleBar forceVisible="y" autoHide={false}>
        //                                         <Table hover>
        //                                             <thead>
        //                                                 <tr>

        //                                                     {insOrFreightHeaders.map((header, index) => (

        //                                                         <th
        //                                                             key={index}
        //                                                             formData-required={header.required || false}
        //                                                             style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
        //                                                         >
        //                                                             {header.label}
        //                                                         </th>

        //                                                     ))}
        //                                                 </tr>
        //                                             </thead>
        //                                             <tbody>
        //                                                 {formData?.map((formData, focusedRowIndex) => (
        //                                                     <React.Fragment key={`row-${focusedRowIndex}`}>
        //                                                         <tr>
        //                                                             <td>

        //                                                             </td>

        //                                                             <td>
        //                                                                 <TextField
        //                                                                     type="number"
        //                                                                     name={`ins_chg_${focusedRowIndex}_1`}
        //                                                                     value={formData[focusedRowIndex]?.ins_chg === 0 ? "0.00" :  formData[focusedRowIndex]?.ins_chg|| ""}
        //                                                                     onChange={(e) => handleChange("formData", "ins_chg", e.target.value, focusedRowIndex, 1)}
        //                                                                 />
        //                                                             </td>


        //                                                         </tr>

        //                                                         <tr>
        //                                                             <td>
        //                                                                 <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>Value</span>
        //                                                             </td>

        //                                                             <td>
        //                                                                 <TextField
        //                                                                     type="number"
        //                                                                     name={`ins_value_${focusedRowIndex}_2`}
        //                                                                     value={formData[focusedRowIndex]?.ins_value === 0 ? "0.00" : formData[focusedRowIndex]?.ins_value || ""}
        //                                                                     onChange={(e) => handleChange("formData", "ins_value", e.target.value, focusedRowIndex, 1)}
        //                                                                 />
        //                                                             </td>


        //                                                         </tr>


        //                                                     </React.Fragment>

        //                                                 ))}
        //                                             </tbody>
        //                                         </Table>
        //                                     </SimpleBar>
        //                                 </div>
        //                             </Form>

        //                         </Row>
        //                     </div>


        //                 </Col>


        //                 <Col xl={9}>
        //                     <div className="text-wrapper box-border p-2 m-auto" >
        //                         <span className="text-label"> GST Insurence</span>
        //                         {/* <Row className='mt-1'> */}
        //                         <div className="table-container" style={{ height: '124px', maxHeight: '124px' }}>
        //                             <SimpleBar forceVisible="y" autoHide={false}>
        //                                 <Table hover>
        //                                     <thead>
        //                                         <tr>

        //                                             {freightTabGstHeaders.map((header, index) => (

        //                                                 <th
        //                                                     key={index}
        //                                                     formData-required={header.required || false}
        //                                                     style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
        //                                                 >
        //                                                     {header.label}
        //                                                 </th>

        //                                             ))}
        //                                         </tr>
        //                                     </thead>
        //                                     <tbody>
        //                                         {formData?.map((formData, focusedRowIndex) => (
        //                                             <React.Fragment key={`row-${focusedRowIndex}`}>
        //                                                 <tr className=''>
        //                                                     <td>
        //                                                         <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>%</span>
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cr_perc_i_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.igst_cr_perc_i === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cr_perc_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cr_perc_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cess_perc_i_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.igst_cess_perc_i === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cess_perc_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cess_perc_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cr_perc_i_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cr_perc_i === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cr_perc_i  || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cr_perc_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cess_perc_i_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cess_perc_i === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cess_perc_i  || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cess_perc_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cr_perc_i_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cr_perc_i === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cr_perc_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cr_perc_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cess_perc_i_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cess_perc_i === 0 ? "0.00" :  formData[focusedRowIndex]?.cgst_cess_perc_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cess_perc_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>


        //                                                 </tr>

        //                                                 <tr>
        //                                                     <td>
        //                                                         <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>Value</span>
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cr_val_i_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.igst_cr_val_i === 0 ? "0.00": formData[focusedRowIndex]?.igst_cr_val_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cr_val_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cess_val_i_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.igst_cess_val_i  === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cess_val_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cess_val_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cr_val_i_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cr_val_i === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cr_val_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cr_val_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cess_val_i_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cess_val_i === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cess_val_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cess_val_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cr_val_i_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cr_val_i === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cr_val_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cr_val_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cess_val_i_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cess_val_i === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cess_val_i || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cess_val_i", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>


        //                                                 </tr>


        //                                             </React.Fragment>

        //                                         ))}
        //                                     </tbody>
        //                                 </Table>
        //                             </SimpleBar>
        //                         </div>
        //                         {/* </Row> */}
        //                     </div>
        //                 </Col>
        //             </Row>

        //         {/* </Card> */}
        //     </Row>

        //     <Row className='mt-4'>
        //         {/* <Card className="mb-2 p-1 shadow-sm"> */}
        //             <Row>
        //                 <Col xl={3}>
        //                     <div className="text-wrapper box-border p-2 m-auto" >
        //                         <span className="text-label">Freight</span>

        //                         <Row className='mt-1'>
        //                             <Col>
        //                                 <RadioGroup
        //                                     className="button-group-wrapper box-border justify-content-between"
        //                                     options={[
        //                                         { text: "Percentage", value: "P" },
        //                                         { text: "value", value: "V" },

        //                                     ]}
        //                                     onChange={(e) => handleChange("formData", "frt_amt_prc", e.target.value)}
        //                                     checked={formData[focusedRowIndex]?.frt_amt_prc}
        //                                 />
        //                             </Col>
        //                         </Row>
        //                         <Row className='mt-2'>
        //                             <Form id="itc-entry-freight-form">

        //                                 <div className="table-container" style={{ height: '90px', maxHeight: '90px' }}>
        //                                     <SimpleBar forceVisible="y" autoHide={false}>
        //                                         <Table hover>
        //                                             <thead>
        //                                                 <tr>

        //                                                     {insOrFreightHeaders.map((header, index) => (

        //                                                         <th
        //                                                             key={index}
        //                                                             formData-required={header.required || false}
        //                                                             style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
        //                                                         >
        //                                                             {header.label}
        //                                                         </th>

        //                                                     ))}
        //                                                 </tr>
        //                                             </thead>
        //                                             <tbody>
        //                                                 {formData?.map((formData, focusedRowIndex) => (
        //                                                     <React.Fragment key={`row-${focusedRowIndex}`}>
        //                                                         <tr>
        //                                                             <td>

        //                                                             </td>

        //                                                             <td>
        //                                                                 <TextField
        //                                                                     type="number"
        //                                                                     name={`frt_chg_${focusedRowIndex}_1`}
        //                                                                     value={formData[focusedRowIndex]?.frt_chg === 0 ? "0.00" : formData[focusedRowIndex]?.frt_chg || ""}
        //                                                                     onChange={(e) => handleChange("formData", "frt_chg", e.target.value, focusedRowIndex)}
        //                                                                 />
        //                                                             </td>


        //                                                         </tr>

        //                                                         <tr>
        //                                                             <td>
        //                                                                 <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>Value</span>
        //                                                             </td>

        //                                                             <td>
        //                                                                 <TextField
        //                                                                     type="number"
        //                                                                     name={`frt_value_${focusedRowIndex}_2`}
        //                                                                     value={formData[focusedRowIndex]?.frt_value === 0 ? "0.00" : formData[focusedRowIndex]?.frt_value || ""}
        //                                                                     onChange={(e) => handleChange("formData", "frt_value", e.target.value, focusedRowIndex)}
        //                                                                 />
        //                                                             </td>


        //                                                         </tr>


        //                                                     </React.Fragment>

        //                                                 ))}
        //                                             </tbody>
        //                                         </Table>
        //                                     </SimpleBar>
        //                                 </div>
        //                             </Form>

        //                         </Row>
        //                     </div>


        //                 </Col>


        //                 <Col xl={9}>
        //                     <div className="text-wrapper box-border p-3 m-auto" >
        //                         <span className="text-label"> GST Freight</span>
        //                         {/* <Row className='mt-1'> */}
        //                         <div className="table-container" style={{ height: '124px', maxHeight: '124px' }}>
        //                             <SimpleBar forceVisible="y" autoHide={false}>
        //                                 <Table hover>
        //                                     <thead>
        //                                         <tr>

        //                                             {freightTabGstHeaders.map((header, index) => (

        //                                                 <th
        //                                                     key={index}
        //                                                     formData-required={header.required || false}
        //                                                     style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
        //                                                 >
        //                                                     {header.label}
        //                                                 </th>

        //                                             ))}
        //                                         </tr>
        //                                     </thead>
        //                                     <tbody>
        //                                         {formData?.map((formData, focusedRowIndex) => (
        //                                             <React.Fragment key={`row-${focusedRowIndex}`}>
        //                                                 <tr className=''>
        //                                                     <td>
        //                                                         <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>%</span>
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cr_perc_f_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.igst_cr_perc_f === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cr_perc_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cr_perc_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cess_perc_f_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.igst_cess_perc_f === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cess_perc_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cess_perc_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cr_perc_f_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cr_perc_f  === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cr_perc_f || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cr_perc_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cess_perc_f_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cess_perc_f === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cess_perc_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cess_perc_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cr_perc_f_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cr_perc_f === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cr_perc_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cr_perc_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cess_perc_f_${focusedRowIndex}_1`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cess_perc_f === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cess_perc_f || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cess_perc_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>


        //                                                 </tr>

        //                                                 <tr>
        //                                                     <td>
        //                                                         <span style={{ fontWeight: 'bold', fontSize: '12px', marginLeft: '35px' }}>Value</span>
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cr_val_f_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.igst_cr_val_f === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cr_val_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cr_val_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>

        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`igst_cess_val_f_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.igst_cess_val_f === 0 ? "0.00" : formData[focusedRowIndex]?.igst_cess_val_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "igst_cess_val_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cr_val_f_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cess_val_f === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cess_val_f || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cr_val_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`sgst_cess_val_f_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.sgst_cess_val_f  === 0 ? "0.00" : formData[focusedRowIndex]?.sgst_cess_val_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "sgst_cess_val_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cr_val_f_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cr_val_f === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cr_val_f || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cr_val_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>
        //                                                     <td>
        //                                                         <TextField
        //                                                             type="number"
        //                                                             name={`cgst_cess_val_f_${focusedRowIndex}_2`}
        //                                                             value={formData[focusedRowIndex]?.cgst_cess_val_f === 0 ? "0.00" : formData[focusedRowIndex]?.cgst_cess_val_f  || ""}
        //                                                             onChange={(e) => handleChange("formData", "cgst_cess_val_f", e.target.value, focusedRowIndex)}
        //                                                         />
        //                                                     </td>


        //                                                 </tr>


        //                                             </React.Fragment>

        //                                         ))}
        //                                     </tbody>
        //                                 </Table>
        //                             </SimpleBar>
        //                         </div>
        //                         {/* </Row> */}
        //                     </div>
        //                 </Col>
        //             </Row>
        //            <Row className="d-flex justify-content-center">
        //           <Col xs="auto">
        //       <ButtonUi color="secondary" className='mt-4' onClick={()=>{handleChangeTab('Main')}}>
        //         Main
        //       </ButtonUi>
        //     </Col></Row>
        //         {/* </Card> */}
        //     </Row>


        // </React.Fragment> 

        <React.Fragment>
            <Row>
                {/* ---------- Insurance ---------- */}
                <Col xl={3}>
                    <div className="text-wrapper box-border p-2 m-auto">
                        <span className="text-label">Insurance</span>

                        <Row className="mt-1">
                            <Col>
                                <RadioGroup
                                    className="button-group-wrapper box-border justify-content-between"
                                    options={[
                                        { text: "Percentage", value: "P" },
                                        { text: "Value", value: "V" },
                                    ]}
                                    checked={formData.ins_amt_prc}
                                    onChange={(e) => handleChange("formData", "ins_amt_prc", e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Form id="itc-entry-insurance-form">
                                <div className="table-container" style={{ height: "90px", maxHeight: "90px" }}>
                                    <SimpleBar forceVisible="y" autoHide={false}>
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    {insOrFreightHeaders.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                                        >
                                                            {header.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td></td>
                                                    <td>
                                                        <TextField
                                                            type="number"
                                                            name="ins_chg"
                                                            //  value={formData.ins_chg || ""}
                                                            value={
                                                                typeof formData.ins_chg === "number"
                                                                    ? formData.ins_chg.toFixed(2)
                                                                    : ""
                                                            }
                                                            onChange={(e) => handleChange("formData", "ins_chg", e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span style={{ fontWeight: "bold", fontSize: "12px", marginLeft: "35px" }}>
                                                            Value
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <TextField
                                                            type="number"
                                                            name="ins_value"
                                                            //value={formData.ins_value || ""}
                                                            value={
                                                                typeof formData.ins_value === "number"
                                                                    ? formData.ins_value.toFixed(2)
                                                                    : ""
                                                            }
                                                            onChange={(e) => handleChange("formData", "ins_value", e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </SimpleBar>
                                </div>
                            </Form>
                        </Row>
                    </div>
                </Col>

                {/* ---------- GST Insurance ---------- */}
                <Col xl={9}>
                    <div className="text-wrapper box-border p-2 m-auto">
                        <span className="text-label">GST Insurance</span>
                        <div className="table-container" style={{ height: "124px", maxHeight: "124px" }}>
                            <SimpleBar forceVisible="y" autoHide={false}>
                                <Table hover>
                                    <thead>
                                        <tr>
                                            {freightTabGstHeaders.map((header, index) => (
                                                <th key={index} style={{ whiteSpace: "nowrap", width: header.width }}>
                                                    {header.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Percentage Row */}
                                        <tr>
                                            <td>
                                                <span style={{ fontWeight: "bold", fontSize: "12px", marginLeft: "35px" }}>%</span>
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cr_perc_i"
                                                    // value={formData.igst_cr_perc_i || ""}
                                                    value={
                                                        typeof formData.igst_cr_perc_i === "number"
                                                            ? formData.igst_cr_perc_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "igst_cr_perc_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cess_perc_i"
                                                    // value={formData.igst_cess_perc_i || ""}
                                                    value={
                                                        typeof formData.igst_cess_perc_i === "number"
                                                            ? formData.igst_cess_perc_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "igst_cess_perc_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cr_perc_i"
                                                    value={
                                                        typeof formData.sgst_cr_perc_i === "number"
                                                            ? formData.sgst_cr_perc_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "sgst_cr_perc_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cess_perc_i"
                                                    // value={formData.sgst_cess_perc_i || ""}
                                                    value={
                                                        typeof formData.sgst_cess_perc_i === "number"
                                                            ? formData.sgst_cess_perc_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "sgst_cess_perc_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cr_perc_i"
                                                    // value={formData.cgst_cr_perc_i || ""}
                                                    value={
                                                        typeof formData.cgst_cr_perc_i === "number"
                                                            ? formData.cgst_cr_perc_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "cgst_cr_perc_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cess_perc_i"
                                                    // value={formData.cgst_cess_perc_i || ""}
                                                    value={
                                                        typeof formData.cgst_cess_perc_i === "number"
                                                            ? formData.cgst_cess_perc_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "cgst_cess_perc_i", e.target.value)}
                                                />
                                            </td>
                                        </tr>

                                        {/* Value Row */}
                                        <tr>
                                            <td>
                                                <span style={{ fontWeight: "bold", fontSize: "12px", marginLeft: "35px" }}>Value</span>
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cr_val_i"
                                                    // value={formData.igst_cr_val_i || ""}
                                                    value={
                                                        typeof formData.igst_cr_val_i === "number"
                                                            ? formData.igst_cr_val_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "igst_cr_val_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cess_val_i"
                                                    // value={formData.igst_cess_val_i || ""}
                                                    value={
                                                        typeof formData.igst_cess_val_i === "number"
                                                            ? formData.igst_cess_val_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "igst_cess_val_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cr_val_i"
                                                    // value={formData.sgst_cr_val_i || ""}
                                                    value={
                                                        typeof formData.sgst_cr_val_i === "number"
                                                            ? formData.sgst_cr_val_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "sgst_cr_val_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cess_val_i"
                                                    //value={formData.sgst_cess_val_i || ""}
                                                    value={
                                                        typeof formData.sgst_cess_val_i === "number"
                                                            ? formData.sgst_cess_val_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "sgst_cess_val_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cr_val_i"
                                                    // value={formData.cgst_cr_val_i || ""}
                                                    value={
                                                        typeof formData.cgst_cr_val_i === "number"
                                                            ? formData.cgst_cr_val_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "cgst_cr_val_i", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cess_val_i"
                                                    // value={formData.cgst_cess_val_i || ""}
                                                    value={
                                                        typeof formData.cgst_cess_val_i === "number"
                                                            ? formData.cgst_cess_val_i.toFixed(2)
                                                            : ""
                                                    }
                                                    onChange={(e) => handleChange("formData", "cgst_cess_val_i", e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </SimpleBar>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* ---------- Freight / GST Freight ---------- */}
            <Row className="mt-4">
                <Col xl={3}>
                    <div className="text-wrapper box-border p-2 m-auto">
                        <span className="text-label">Freight</span>
                        <Row className="mt-1">
                            <Col>
                                <RadioGroup
                                    className="button-group-wrapper box-border justify-content-between"
                                    options={[
                                        { text: "Percentage", value: "P" },
                                        { text: "Value", value: "V" },
                                    ]}
                                    checked={formData.frt_amt_prc}
                                    onChange={(e) => handleChange("formData", "frt_amt_prc", e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Form id="itc-entry-freight-form">
                                <div className="table-container" style={{ height: "90px", maxHeight: "90px" }}>
                                    <SimpleBar forceVisible="y" autoHide={false}>
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    {insOrFreightHeaders.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                                        >
                                                            {header.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td></td>
                                                    <td>
                                                        <TextField
                                                            type="number"
                                                            name="frt_chg"
                                                            //  value={formData.frt_chg || ""}
                                                            value={
                                                                typeof formData.frt_chg === "number"
                                                                    ? formData.frt_chg.toFixed(2)
                                                                    : ""
                                                            }
                                                            onChange={(e) => handleChange("formData", "frt_chg", e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span style={{ fontWeight: "bold", fontSize: "12px", marginLeft: "35px" }}>Value</span>
                                                    </td>
                                                    <td>
                                                        <TextField
                                                            type="number"
                                                            name="frt_value"
                                                            // value={formData.frt_value || ""}
                                                            value={
                                                                typeof formData.frt_value === "number"
                                                                    ? formData.frt_value.toFixed(2)
                                                                    : ""
                                                            }
                                                            onChange={(e) => handleChange("formData", "frt_value", e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </SimpleBar>
                                </div>
                            </Form>
                        </Row>
                    </div>
                </Col>

                <Col xl={9}>
                    <div className="text-wrapper box-border p-3 m-auto">
                        <span className="text-label">GST Freight</span>
                        <div className="table-container" style={{ height: "124px", maxHeight: "124px" }}>
                            <SimpleBar forceVisible="y" autoHide={false}>
                                <Table hover>
                                    <thead>
                                        <tr>
                                            {freightTabGstHeaders.map((header, index) => (
                                                <th key={index} style={{ whiteSpace: "nowrap", width: header.width }}>
                                                    {header.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Percentage Row */}
                                        <tr>
                                            <td>
                                                <span style={{ fontWeight: "bold", fontSize: "12px", marginLeft: "35px" }}>%</span>
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cr_perc_f"
                                                    value={formData.igst_cr_perc_f || ""}
                                                    onChange={(e) => handleChange("formData", "igst_cr_perc_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cess_perc_f"
                                                    value={formData.igst_cess_perc_f || ""}
                                                    onChange={(e) => handleChange("formData", "igst_cess_perc_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cr_perc_f"
                                                    value={formData.sgst_cr_perc_f || ""}
                                                    onChange={(e) => handleChange("formData", "sgst_cr_perc_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cess_perc_f"
                                                    value={formData.sgst_cess_perc_f || ""}
                                                    onChange={(e) => handleChange("formData", "sgst_cess_perc_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cr_perc_f"
                                                    value={formData.cgst_cr_perc_f || ""}
                                                    onChange={(e) => handleChange("formData", "cgst_cr_perc_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cess_perc_f"
                                                    value={formData.cgst_cess_perc_f || ""}
                                                    onChange={(e) => handleChange("formData", "cgst_cess_perc_f", e.target.value)}
                                                />
                                            </td>
                                        </tr>

                                        {/* Value Row */}
                                        <tr>
                                            <td>
                                                <span style={{ fontWeight: "bold", fontSize: "12px", marginLeft: "35px" }}>Value</span>
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cr_val_f"
                                                    value={formData.igst_cr_val_f || ""}
                                                    onChange={(e) => handleChange("formData", "igst_cr_val_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="igst_cess_val_f"
                                                    value={formData.igst_cess_val_f || ""}
                                                    onChange={(e) => handleChange("formData", "igst_cess_val_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cr_val_f"
                                                    value={formData.sgst_cr_val_f || ""}
                                                    onChange={(e) => handleChange("formData", "sgst_cr_val_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="sgst_cess_val_f"
                                                    value={formData.sgst_cess_val_f || ""}
                                                    onChange={(e) => handleChange("formData", "sgst_cess_val_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cr_val_f"
                                                    value={formData.cgst_cr_val_f || ""}
                                                    onChange={(e) => handleChange("formData", "cgst_cr_val_f", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <TextField
                                                    type="number"
                                                    name="cgst_cess_val_f"
                                                    value={formData.cgst_cess_val_f || ""}
                                                    onChange={(e) => handleChange("formData", "cgst_cess_val_f", e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </SimpleBar>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* ---------- Main Button ---------- */}
            <Row className="d-flex justify-content-center">
                <Col xs="auto">
                    <ButtonUi color="secondary" className="mt-4" onClick={() => handleChangeTab("Main")}>
                        Main
                    </ButtonUi>
                </Col>
            </Row>
        </React.Fragment>

    )
}

export default Freight

