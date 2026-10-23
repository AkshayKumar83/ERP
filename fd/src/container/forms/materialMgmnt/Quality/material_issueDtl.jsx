import React, { useState, useCallback } from 'react'
import { Row, Col, Form, Table, Card } from "reactstrap"
import TextField from "../../../../components/basic/textField"
import RadioGroup from "../../../../components/basic/radioGroup"
import ButtonUi from "../../../../components/basic/button"
import SimpleBar from "simplebar-react"
import Select from "../../../../components/basic/select"
import RowAction from "../../../../components/common/rowAction"
import Checkbox from '../../../../components/basic/checkbox'
import { headers, batchHeaders, itemHelpListHeader, costHelpListHeader, purHelpListHeader, batchHelpListHeader, physHelpListHeader } from './material_issue_helpers'
import { FcInfo } from 'react-icons/fc'

const MaterialIssueDtl = ({ formDetailData = [{}], formStatus, handleChange,
    setHelpFor,
    setHelpListHeader,
    handleHelpList = () => { },
    focusedRowIndex,
    setFocusedRowIndex,
    setActiveRowIndex,
    formBatchData = [{}],
    handleAddRow,
    getValidateData,
    otherQueryPera,
    handleDeleteRow

}) => {


    const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = formDetailData.find((entry) => entry.sr_no === id);
        setFocusedRowIndex(rowIndex);
        // triggerFamilyDetail(id)
    };

    const handleDoubleClick = (field, header, rowIndex) => {
        if (formStatus && focusedRowIndex !== null) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
            setActiveRowIndex(rowIndex);
        }
    };

    return (
        <React.Fragment>
            <Form id="inter-transfer-memoDtl-form">
                <Row >
                    <Col>

                        <div className="table-title">

                            {(formStatus === "Insert" || formStatus === "Update") && (

                                <ButtonUi color="primary" className="add-action"
                                    onClick={() => handleAddRow("formDetailData")}

                                >
                                    Add Row
                                </ButtonUi>

                            )}
                        </div>

                        <div className="table-wrapper-v3">
                            <SimpleBar forceVisible="y" autoHide={false}>
                                <div className='table-sticky-wrapper'>
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                {(formStatus === "Insert" || formStatus === "Update") && (
                                                    <th className="">Actions</th>
                                                )}
                                                {headers.map((header, index) => (
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
                                                        {header.isHelpExist && (<FcInfo title="Info" />)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formDetailData.map((data, rowIndex) => (
                                                <tr key={rowIndex}
                                                    onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                                                    // onBlur={() => setFocusedRowIndex(-1)}
                                                    style={{
                                                        border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"
                                                            }`,
                                                    }}
                                                >
                                                    {
                                                        (formStatus === 'Insert' || formStatus === 'Update') &&
                                                        <td className="">
                                                            <RowAction
                                                                formStatus={formStatus}
                                                                canDelete={formDetailData.length > 1}
                                                              onDelete={() => handleDeleteRow("formDetailTable", rowIndex)}
                                                            //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                            />
                                                        </td>
                                                    }
                                                    <td className=" table_cell">
                                                        <TextField
                                                            type="text"
                                                            required
                                                            name="it_code"
                                                            value={data.it_code || ""}
                                                            maxLength={20}
                                                            onChange={(e) => handleChange("formDetailData", "it_code", e.target.value, rowIndex)}
                                                            onDoubleClick={() => handleDoubleClick("item", itemHelpListHeader, rowIndex)}
                                                            onBlur={(e) => {
                                                                if (formStatus === "Update" || formStatus === "Insert") {
                                                                    const item = e.target.value;
                                                                    getValidateData("it_code", item, otherQueryPera, rowIndex)
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="text"
                                                            required
                                                            name="it_name"
                                                            value={data.it_name || ""}
                                                            maxLength={20}
                                                            disabled
                                                            onChange={(e) => handleChange("formDetailData", "it_name", e.target.value, rowIndex, e)}


                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="text"
                                                            //  required
                                                            name="catalog_code"
                                                            value={data.catalog_code || ""}
                                                            disabled
                                                            maxLength={40}
                                                            onChange={(e) => handleChange("formDetailData", "catalog_code", e.target.value, rowIndex, e)}

                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="text"
                                                            //  required
                                                            name="um_code"
                                                            value={data.um_code || ""}
                                                            maxLength={4}
                                                            disabled
                                                            onChange={(e) => handleChange("formDetailData", "um_code", e.target.value, rowIndex, e)}
                                                        // onBlur={(e) => validateRequiredField(e, "bill_date")}
                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="number"
                                                            //  required
                                                            name="rate"
                                                            value={data.rate ?? ""}
                                                            maxLength={4}
                                                            disabled
                                                            onChange={(e) => handleChange("formDetailData", "rate", e.target.value, rowIndex, e)}
                                                        // onDoubleClick={() => handleDoubleClick("cost", costHelpListHeader, rowIndex)}

                                                        />
                                                    </td>

                                                    <td className="table_cell">
                                                        <TextField
                                                            type="number"
                                                            // required
                                                            name="srs_qty"
                                                            value={data.srs_qty || ""}
                                                            maxLength={4}
                                                            disabled
                                                            onChange={(e) => handleChange("formDetailData", "srs_qty", e.target.value, rowIndex, e)}
                                                        // onDoubleClick={() => handleDoubleClick("cost", costHelpListHeader, rowIndex)}

                                                        />
                                                    </td>

                                                    <td className="table_cell">
                                                        <TextField
                                                            type="text"
                                                            // required
                                                            name="physical_loc"
                                                            value={data.physical_loc || ""}
                                                            maxLength={30}
                                                            onChange={(e) => handleChange("formDetailData", "physical_loc", e.target.value, rowIndex, e)}
                                                            onDoubleClick={() => handleDoubleClick("physical", physHelpListHeader, rowIndex)}
                                                            onBlur={(e) => {
                                                                if (formStatus === "Update" || formStatus === "Insert") {
                                                                    const physical = e.target.value;
                                                                    getValidateData("physical_loc", physical, otherQueryPera, rowIndex)
                                                                }
                                                            }}

                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="number"
                                                           // required
                                                            name="qty"
                                                            value={data.qty ?? ""}
                                                            maxLength={4}
                                                            onChange={(e) => handleChange("formDetailData", "qty", e.target.value, rowIndex, e)}
                                                         onBlur={(e) => {
                                                                if (formStatus === "Update" || formStatus === "Insert") {
                                                                    const quantity = e.target.value;
                                                                    getValidateData("qty", quantity, otherQueryPera, rowIndex)
                                                                }
                                                            }}
                                                        />
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table> </div>
                            </SimpleBar>
                        </div>

                    </Col>
                </Row>

                <Row className="justify-content-end mt-2">
                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Cost Center"
                            // required
                            name="cc"
                            value={formDetailData[focusedRowIndex]?.cc || ""}
                            maxLength={40}
                            onChange={(e) => handleChange("formDetailData", "cc", e.target.value, focusedRowIndex)}
                            onDoubleClick={() => handleDoubleClick("cost", costHelpListHeader, focusedRowIndex)}

                        />

                    </Col>

                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Description"
                            // required
                            name="cost_desc"
                            disabled
                            value={formDetailData[focusedRowIndex]?.cost_desc || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formDetailData", "cost_desc", e.target.value, focusedRowIndex)}
                        />

                    </Col>

                    <Col xl={3}>
                        <TextField
                            type="text"
                            label="Purpose"
                            // required
                            name="purpose"
                            value={formDetailData[focusedRowIndex]?.purpose || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formDetailData", "purpose", e.target.value, focusedRowIndex)}
                            onDoubleClick={() => handleDoubleClick("purp", purHelpListHeader, focusedRowIndex)}

                        />

                    </Col>

                    <Col xl={3} className='m-auto'>
                        <TextField
                            type="number"
                            label="Store Stock"
                            // required
                            name="store_stock"
                            value={formDetailData[focusedRowIndex]?.store_stock || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formDetailData", "store_stock", e.target.value, focusedRowIndex)}
                            disabled
                        />

                    </Col>
                </Row>

                <Row >
                    <Col xl={12}>

                        <div className="table-title">
                            {(formStatus === "Insert" || formStatus === "Update") && (

                                <ButtonUi color="primary" className="add-action"
                                    onClick={() => handleAddRow("formBatchData")}

                                >
                                    Add Row
                                </ButtonUi>

                            )}
                        </div>

                        <div className="table-wrapper-v3">
                            <SimpleBar forceVisible="y" autoHide={false}>
                                <div className='table-sticky-wrapper'>
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                {(formStatus === "Insert" || formStatus === "Update") && (
                                                    <th className="">Actions</th>
                                                )}
                                                {batchHeaders.map((header, index) => (
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
                                                        {header.isHelpExist && (<FcInfo title="Info" />)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formBatchData.map((data, rowIndex) => (
                                                <tr key={rowIndex}
                                                    onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                                                    // onBlur={() => setFocusedRowIndex(-1)}
                                                    style={{
                                                        border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"
                                                            }`,
                                                    }}
                                                >
                                                    {
                                                        (formStatus === 'Insert' || formStatus === 'Update') &&
                                                        <td className="">
                                                            <RowAction
                                                                formStatus={formStatus}
                                                                canDelete={formBatchData.length > 1}
                                                              onDelete={() => handleDeleteRow("formBatchData", rowIndex)}
                                                            //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                            />
                                                        </td>
                                                    }
                                                    <td className=" table_cell">
                                                        <TextField
                                                            type="text"
                                                            //required
                                                            name="batch_no"
                                                            value={data.batch_no || ""}
                                                            maxLength={60}
                                                            onChange={(e) => handleChange("formBatchData", "batch_no", e.target.value, rowIndex)}
                                                            onDoubleClick={() => handleDoubleClick("batch", batchHelpListHeader, rowIndex)}
                                                            onBlur={(e) => {
                                                                if (formStatus === "Update" || formStatus === "Insert") {
                                                                    const batch = e.target.value;
                                                                    getValidateData("batch_no", batch, otherQueryPera, rowIndex)
                                                                }
                                                            }}

                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="date"
                                                            // required
                                                            name="batch_date"
                                                            value={data.batch_date || ""}
                                                            disabled
                                                            //maxLength={20}
                                                            onChange={(e) => handleChange("formBatchData", "batch_date", e.target.value, rowIndex, e)}
                                                       
                                                        />
                                                    </td>
                                                  
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="number"
                                                            // required
                                                            name="batch_store_qty"
                                                            value={data.batch_store_qty ?? ""}
                                                            
                                                            disabled
                                                            onChange={(e) => handleChange("formBatchData", "batch_store_qty", e.target.value, rowIndex, e)}
                                                      
                                                        />
                                                    </td>  

                                                    <td className="table_cell">
                                                        <TextField
                                                            type="text"
                                                            //  required
                                                            name="loca_rack_bin_desc"
                                                            value={data.loca_rack_bin_desc || ""}
                                                            maxLength={20}
                                                           // disabled
                                                            onChange={(e) => handleChange("formBatchData", "loca_rack_bin_desc", e.target.value, rowIndex, e)}
                                                      
                                                        />
                                                    </td>
                                                    <td className="table_cell">
                                                        <TextField
                                                            type="number"
                                                            // required
                                                            name="batch_qty"
                                                            value={data.batch_qty ?? ""}
                                                            // maxLength={4}
                                                            onChange={(e) => handleChange("formBatchData", "batch_qty", e.target.value, rowIndex, e)}
                                                       
                                                        />
                                                    </td>



                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table> </div>
                            </SimpleBar>
                        </div>

                    </Col>
                </Row>

                <Row>
                    <Col xl={8} className='d-flex justify-content-end'>
                        <TextField
                            type="number"
                            label="Total Batch Qty"
                            // required
                            name="tot_batch_qty"
                            value={formBatchData[focusedRowIndex]?.tot_batch_qty || ""}
                            maxLength={30}
                            onChange={(e) => handleChange("formBatchData", "tot_batch_qty", e.target.value, focusedRowIndex)}
                            disabled
                        />

                    </Col>
                </Row>
            </Form>

        </React.Fragment >
    )
}

export default MaterialIssueDtl
