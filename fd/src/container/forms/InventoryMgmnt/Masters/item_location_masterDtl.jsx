import React from 'react'
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import { formDetailHeader, itemHelpListHeader, rackHelpListHeader, binHelpListHeader, physicalListHeader } from './item_location_master_helper'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import RadioButton from '../../../../components/basic/radioButton'
import { physHelpListHeader } from '../../materialMgmnt/Masters/stock_adjustment_batch.helper'
import { FcInfo } from "react-icons/fc"; 
import toast from 'react-hot-toast'

const ItemLocationMasterDtl = ({ formDetailData, handleChange, formStatus, handleAddRow, handleDelete,
    setHelpFor,
    setHelpListHeader,
    handleHelpList = () => { },
    setActiveRowIndex,
    setFocusedRowIndex,
    focusedRowIndex,
    getValidateData,
    otherQueryPera
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

    const handleValidateBlur = async (e, rowIndex, name) => {
        if (formStatus === 'Update' || formStatus === "Insert") {
            console.log(name)


            const field = e.target;
            const value = field.value;

            if (value === 'undefined' || value === null || value === '') {
                console.log('value', value)
                return
            }

            try {

                const result = await getValidateData(name, value, otherQueryPera, rowIndex);
                console.log('Validation result:', result);

                if (!result) {
                    // Only focus if INVALID
                    field.focus();
                } else if (result.data) {
                    // console.log(data)

                }

            }
            catch (err) {
                console.error("Valdation error", err)
            }
        }

    }

    const handleQtyError = (data) => {
        console.log(data);
        if (data === null || data === undefined || data === "") {
            return;
        }

        if (data < 0) {
            toast.error("This value can not be negative");
            return true;
        }
        if (data === 0) {
            toast.error("This value can not be zero");
            return true;
        }

        return false;
    };


    return (
        <React.Fragment>
            <Row>
                <Col xl={11} className=''>
                    <div className='box-border mt-4'>
                        <Form id="item-location-master-dtl-form">
                            <div className="table-title">

                                {
                                    (formStatus === 'Insert' || formStatus === 'Update') &&
                                    <ButtonUi color="primary" className="add-action"
                                        onClick={handleAddRow}
                                    >Add Row</ButtonUi>}

                            </div>

                            <div className="table-wrapper-v3">
                                <SimpleBar forceVisible="y" autoHide={false}>
                                    <div className='table-sticky-wrapper'>
                                        <Table hover>
                                            <thead style={{ border: '' }}>
                                                <tr>
                                                    {
                                                        (formStatus === 'Insert' || formStatus === 'Update') &&
                                                        <th className="" style={{}}>Actions</th>
                                                    }
                                                    {formDetailHeader?.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            data-required={header.required || false}
                                                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                                            {header.label}
                                                            {header.required && (
                                                                <span className="required-asterisk">*</span>
                                                            )}
                                                            {header.isHelpExist && <FcInfo title="Info" />}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {formDetailData &&
                                                    formDetailData?.map((data, rowIndex) => (
                                                        <tr key={rowIndex}
                                                            onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                                                            style={{
                                                                border: rowIndex === focusedRowIndex ? "2px solid black" : "none",
                                                            }}
                                                        >

                                                            {
                                                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                                                <td className="">
                                                                    <RowAction
                                                                        formStatus={formStatus}
                                                                        canDelete={formDetailData?.length > 0}
                                                                        onDelete={() => handleDelete(data, rowIndex)}
                                                                    //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                                    />
                                                                </td>

                                                            }
                                                            <td className=" table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    required
                                                                    name="Item Code"
                                                                    value={data.it_code || ""}
                                                                    maxLength={60}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "it_code",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick(
                                                                            "item",
                                                                            itemHelpListHeader,
                                                                            rowIndex
                                                                        )
                                                                    }
                                                                    // onBlur={async (e) => {
                                                                    //     if (
                                                                    //         formStatus === "Update" ||
                                                                    //         formStatus === "Insert"
                                                                    //     ) {
                                                                    //         const batch = e.target.value;
                                                                    //         const isValid = await getValidateData(
                                                                    //             "it_code",
                                                                    //             batch,
                                                                    //             otherQueryPera,
                                                                    //             rowIndex
                                                                    //         );

                                                                    //         if (!isValid) {
                                                                    //             e.target.focus();
                                                                    //         }
                                                                    //     }
                                                                    // }}  
                                                                    onBlur={(e) => handleValidateBlur(e, rowIndex, 'it_code')}

                                                                />
                                                            </td>
                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    // required
                                                                    name="Description"
                                                                    value={data.description || ""}
                                                                    disabled
                                                                    //maxLength={20}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "description",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    required
                                                                    name="physical_loca"
                                                                    value={data.physical_loca || ""}
                                                                    // disabled
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "physical_loca",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick(
                                                                            "physical",
                                                                            physHelpListHeader,
                                                                            rowIndex
                                                                        )
                                                                    }
                                                                    // onBlur={async (e) => {
                                                                    //     if (
                                                                    //         formStatus === "Update" ||
                                                                    //         formStatus === "Insert"
                                                                    //     ) {
                                                                    //         const batch = e.target.value;
                                                                    //         const isValid = await getValidateData(
                                                                    //             "physical_loca",
                                                                    //             batch,
                                                                    //             otherQueryPera,
                                                                    //             rowIndex
                                                                    //         );

                                                                    //         if (!isValid) {
                                                                    //             e.target.focus();
                                                                    //         }
                                                                    //     }
                                                                    // }} 
                                                                    onBlur={(e) => handleValidateBlur(e, rowIndex, 'physical_loca')}
                                                                />
                                                            </td>
                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    required
                                                                    name="rack_no"
                                                                    value={data.rack_no || ""}
                                                                    // disabled
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "rack_no",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick(
                                                                            "rack",
                                                                            rackHelpListHeader,
                                                                            rowIndex
                                                                        )
                                                                    }
                                                                    // onBlur={async (e) => {
                                                                    //     if (
                                                                    //         formStatus === "Update" ||
                                                                    //         formStatus === "Insert"
                                                                    //     ) {
                                                                    //         const batch = e.target.value;
                                                                    //         const isValid = await getValidateData(
                                                                    //             "rack_no",
                                                                    //             batch,
                                                                    //             otherQueryPera,
                                                                    //             rowIndex
                                                                    //         );

                                                                    //         if (!isValid) {
                                                                    //             e.target.focus();
                                                                    //         }
                                                                    //     }
                                                                    // }} 
                                                                    onBlur={(e) => handleValidateBlur(e, rowIndex, 'rack_no')}
                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    required
                                                                    name="bin_no"
                                                                    value={data.bin_no || ""}
                                                                    // disabled
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "bin_no",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick(
                                                                            "bin",
                                                                            binHelpListHeader,
                                                                            rowIndex
                                                                        )
                                                                    }
                                                                    // onBlur={async (e) => {
                                                                    //     if (
                                                                    //         formStatus === "Update" ||
                                                                    //         formStatus === "Insert"
                                                                    //     ) {
                                                                    //         const batch = e.target.value;
                                                                    //         const isValid = await getValidateData(
                                                                    //             "bin_no",
                                                                    //             batch,
                                                                    //             otherQueryPera,
                                                                    //             rowIndex
                                                                    //         );

                                                                    //         if (!isValid) {
                                                                    //             e.target.focus();
                                                                    //         }
                                                                    //     }
                                                                    // }} 
                                                                    onBlur={(e) => handleValidateBlur(e, rowIndex, 'bin_no')}
                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="number"
                                                                    required
                                                                    name="loc_qty"
                                                                    value={data.loc_qty || ""}
                                                                    // maxLength={4}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "loc_qty",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onBlur={async (e) => {
                                                                        if (formStatus === "Update" || formStatus === "Insert") {
                                                                            const value = e.target.value;

                                                                            if (value === "" || value === null || value === undefined) return;

                                                                            const quantity = parseFloat(value);
                                                                            if (isNaN(quantity)) return;

                                                                            // Round to 2 decimal places and set the value
                                                                            handleChange(
                                                                                "formDetailData",
                                                                                "loc_qty",
                                                                                quantity.toFixed(2),
                                                                                rowIndex,
                                                                                e
                                                                            );

                                                                            // Local validation
                                                                            const hasLocalError = handleQtyError(quantity);
                                                                            if (hasLocalError) {
                                                                                e.target.focus();
                                                                                return;
                                                                            } 
                                                                        }
                                                                    }}
                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    // required
                                                                    name="coordinate"
                                                                    value={data.coordinate || ""}
                                                                    disabled
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "coordinate",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>

                                        </Table>  </div>
                                </SimpleBar>

                            </div>


                        </Form>
                    </div>
                </Col>
            </Row>
        </React.Fragment>
    )
}

export default ItemLocationMasterDtl