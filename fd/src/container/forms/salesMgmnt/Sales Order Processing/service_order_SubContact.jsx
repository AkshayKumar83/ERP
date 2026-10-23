import React, { useState } from 'react'
import { Row, Col, Form, Table, Card, Container } from "reactstrap"
import TextField from "../../../../components/basic/textField"
import RadioGroup from "../../../../components/basic/radioGroup"
import ButtonUi from "../../../../components/basic/button"
import SimpleBar from "simplebar-react"

import RowAction from "../../../../components/common/rowAction"
import Checkbox from "../../../../components/basic/checkbox"
import { subContractOrderHeader } from './service_order_helper';

const ServiceOrderSubContact = ({ 
  formData,
  formDetailData,
  formStatus,
  handleChange,
  subcontractData = [],
  handleAddRow,
  handleDelete,
  handleChangeTab=()=>{}
}) => {

  const [focusedRowIndex, setFocusedRowIndex] = useState(-1)

     const makeFocusOnTableRow = (rowIndex, id)=>{
        const entry = formDetailData.find((entry) => entry.id === id);
        setFocusedRowIndex(rowIndex)
    }


  return (
    <React.Fragment>
    <Card className="mt-1 mb-2 p-1 shadow-sm">
        <Row className='d-flex justify-content-between'>
            <Col xl={2} className="mb-1">
                <TextField
                    label="Order No."
                    value={formData.order_no || ""}
                    onChange={(e) => handleChange("order_no", e.target.value, null, e, 'head')}
                />
            </Col>
            <Col xl={5} className="mb-1">
                <TextField
                    type="text"
                    label="Customer"
                    value={formData.c_name || ""}
                    onChange={(e) => handleChange("c_name", e.target.value, null, e, 'head')}
                />
            </Col>
        </Row>

        <Row className='d-flex justify-content-between'>
            <Col xl={4} className="mb-1">
                <TextField
                    type="text"
                    label="Semi Finished Part"
                    value={formData.sf_code || ""}
                    onChange={(e) => handleChange("sf_code", e.target.value, null, e, 'head')}
                />
            </Col>
            <Col xl={5} className="mb-1">
                <TextField
                    type="text"
                    label="Description"
                    value={formData.sf_desc || ""}
                    onChange={(e) => handleChange("sf_desc", e.target.value, null, e, 'head')}
                />
            </Col>
        </Row>

        <Row className='d-flex justify-content-between'>
            <Col xl={4} className="mb-1">
                <TextField
                    type="text"
                    label="Customer Semi Finished Part"
                    value={formData.cus_sf_code || ""}
                    onChange={(e) => handleChange("cus_sf_code", e.target.value, null, e, 'head')}
                />
            </Col>
            <Col xl={5} className="mb-1">
                <TextField
                    type="text"
                    label="Description"
                    value={formData.cus_sf_desc || ""}
                    onChange={(e) => handleChange("cus_sf_desc", e.target.value, null, e, 'head')}
                />
            </Col>
        </Row>

        <Row className='d-flex justify-content-between'>
            <Col xl={3} className="mb-1">
                <TextField style={{ textAlign: 'right' }}
                    type="text"
                    label="Semi Finished Unit"
                    value={formData.sf_unit || ""}
                    onChange={(e) => handleChange("sf_unit", e.target.value, null, e, 'head')}
                />
            </Col>
            <Col xl={5} className="mb-1">
                <TextField style={{ width: '80px' }}
                    type="text"
                    label="UOM"
                    value={formData.sf_um || ""}
                    onChange={(e) => handleChange("sf_um", e.target.value, null, e, 'head')}
                />
            </Col>
        </Row>
    </Card>

    <Card className="mb-2 p-1 shadow-sm">
        <Form id="sales-order-subcontract-form">
            <div className="table-title">
                <span>Raw Material</span>
                {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi color="primary" className="add-action"
                        onClick={handleAddRow}
                    >
                        Add Row
                    </ButtonUi>
                )}
            </div>
            <div className="table-container" style={{ height: '140px', maxHeight: '140px' }}>
                <SimpleBar forceVisible="y" autoHide={false}>
                    <Table hover>
                        <thead>
                            <tr>
                                {(formStatus === "Insert" || formStatus === "Update") &&
                                    <th style={{ width: '80px' }} className="sticky-column left">Actions</th>
                                }
                                {subContractOrderHeader.map((header, index) => (
                                <th
                                    key={index}
                                    data-required={header.required || false}
                                    style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                    >
                                    {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {formDetailData.map((data, rowIndex) => (
                                <tr
                                 key={rowIndex}
                                 onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                                 style={{border:`${rowIndex=== focusedRowIndex? '2px solid black': 'none'}`}}
                                 tabIndex={0}
                                >
                                    {(formStatus === "Insert" || formStatus === "Update") && (
                                        <td className="sticky-column left">
                                        <RowAction
                                            formStatus={formStatus}
                                            canDelete={subcontractData.length > 1}
                                          //  onDelete={() => handleDelete(rowIndex)}
                                        />
                                        </td>
                                    )}
                                    <td>
                                        <TextField
                                            type="text"
                                            name="rm_code"
                                            value={data.rm_code || ""}
                                            onChange={(e) => handleChange("rm_code", e.target.value, rowIndex, e)}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="rm_desc"
                                            value={data.rm_desc || ""}
                                            onChange={(e) => handleChange("rm_desc", e.target.value, rowIndex, e)}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="rm_um"
                                            value={data.rm_um || ""}
                                            onChange={(e) => handleChange("rm_um", e.target.value, rowIndex, e)}
                                        />
                                    </td>

                                    <td>
                                        <TextField
                                            type="text"
                                            name="rm_unit"
                                            value={data.rm_unit || ""}
                                            onChange={(e) => handleChange("rm_unit", e.target.value, rowIndex, e)}
                                        />
                                    </td>

                                    <td>
                                        <TextField
                                            type="text"
                                            name="allow_perc"
                                            value={data.allow_prc || ""}
                                            onChange={(e) => handleChange("allow_prc", e.target.value, rowIndex, e)}
                                        />
                                    </td>
                                    <td>
                                        <TextField
                                            type="text"
                                            name="scrap_prc"
                                            value={data.scrap_prc || ""}
                                            onChange={(e) => handleChange("scrap_prc", e.target.value, rowIndex, e)}
                                        />
                                    </td>

                                    <td>
                                        <TextField
                                            type="text"
                                            name="scrap_prc_n"
                                            value={data.scrap_prc_n || ""}
                                            onChange={(e) => handleChange("scrap_prc_n", e.target.value, rowIndex, e)}
                                        />
                                    </td>

                                    <td>
                                        <Checkbox
                                            type="text"
                                            name="disc_value"
                                            value={data.disc_value || ""}
                                            onChange={(e) => handleChange("disc_value", e.target.value ? "Y" : "N", rowIndex, e)}
                                            checked={data?.disc_value === "Y"}
                                           
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </SimpleBar>
            </div>

            <Container>
                <Row className='d-flex justify-content-between'>
                    <Col className='box-border' xl={2}>
                        <RadioGroup
                            className="button-group-wrapper box-border justify-content-between mt-2"
                            options={[
                                { text: "%age", value: "1" },
                                { text: "Value", value: "2" },
                            ]}
                            onChange={(e) => handleChange("ex_amt_prc", e.target.value, focusedRowIndex, e)}
                            // checked={formDetailData[focusedRowIndex].ex_amt_prc|| ''}
                        />
                        <TextField style={{ width: '50px' }}
                            type="text"
                            label="Excise"
                            value={formDetailData[focusedRowIndex]?.ex_val || ""}
                            onChange={(e) => handleChange("ex_val", e.target.value, focusedRowIndex, e)}
                        />
                    </Col>

                    <Col className='box-border d-flex justify-content-center' xl={1}>
                        <TextField style={{ width: '50px' }}
                            type="text"
                            label=" Spl.Excise%"
                            value={formDetailData[focusedRowIndex]?.spl_ex_perc || ""}
                            onChange={(e) => handleChange("spl_ex_perc", e.target.value, focusedRowIndex, e)}
                        />
                    </Col>

                    <Col className='box-border' xl={3}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <RadioGroup
                                className="button-group-wrapper box-border justify-content-between mt-3"
                                options={[
                                    { text: "LST", value: "L" },
                                    { text: "CST", value: "C" },
                                ]}
                                onChange={(e) => handleChange("lst_cst_flag", e.target.value, focusedRowIndex, e)}
                            />

                            <TextField
                                style={{ width: "50px" }}
                                type="text"
                                label="ST(%)"
                                value={formDetailData[focusedRowIndex]?.cst_lst_perc || ""}
                                onChange={(e) => handleChange("cst_lst_perc", e.target.value, focusedRowIndex, e)}
                            />
                        </div>


                        <TextField style={{ width: '160px' }}
                            type="text"
                            label="ST Form"
                            value={formDetailData[focusedRowIndex]?.st_form || ""}
                            onChange={(e) => handleChange("st_form", e.target.value, focusedRowIndex, e)}
                        />


                    </Col>

                    <Col className='box-border d-flex justify-content-center' xl={2}>
                        <TextField style={{ width: '50px' }}
                            type="text"
                            label="Surcharge"
                            value={formDetailData[focusedRowIndex]?.surch_prc || ""}
                            onChange={(e) => handleChange("surch_prc", e.target.value, focusedRowIndex, e)}
                        />

                    </Col>

                    <Col className='box-border  d-flex justify-content-center' xl={2}>
                        <TextField style={{ width: '80px', textAlign: 'right' }}
                            type="text"
                            label="Rate"
                            value={formDetailData[focusedRowIndex]?.rate || ""}
                            onChange={(e) => handleChange("rate", e.target.value, focusedRowIndex, e)}
                        />

                    </Col>

                    <Col className='box-border  d-flex justify-content-center' xl={2}>
                        <TextField style={{ width: '90px' }}
                            type="text"
                            label="Conversion Factor"
                            value={formDetailData[focusedRowIndex]?.conv_fac || ""}
                            onChange={(e) => handleChange("conv_fac", e.target.value, focusedRowIndex, e)}
                        />
                    </Col>

                </Row>
            </Container>

        </Form>
    </Card>
    <Row className='d-flex justify-content-between'>
        <div style={{ display: "flex", border: "none", justifyContent: 'center', gap: '200px' }}>
            <ButtonUi color='secondary' onClick={()=>{handleChangeTab('Items')}}>Items</ButtonUi>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>VSI = Vendor Supplied Item</h3>
        </div>
    </Row>


</React.Fragment>
  )
}

export default ServiceOrderSubContact