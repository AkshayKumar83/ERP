import React, { useState, useCallback } from "react";
import { Row, Col, Form, Table, Card } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import RadioGroup from "../../../../components/basic/radioGroup";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import Select from "../../../../components/basic/select";
import RowAction from "../../../../components/common/rowAction";
import Checkbox from "../../../../components/basic/checkbox";
import { formDataInitData, formDtlInitData, formDataHeader, gradeHelpListHeader, catHelpListHeader, desigHelpListHeader } from './increaments_helper.js'
import { FcInfo } from "react-icons/fc";
import toast from "react-hot-toast";

const IncreamentDtl = ({
    formDetailData = [{}],
    formStatus,
    handleChange,
    handleAddRow,
    handleDeleteRow,
    setHelpFor,
    setHelpListHeader,
    handleHelpList = () => { },
    focusedRowIndex,
    setFocusedRowIndex,
    setActiveRowIndex, 
    validateRequiredField

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

    const handleAmtError = (data) => {
        if (data < 0) {
            toast.error("Value can not be negative.");
            return true;
        }
        return false;
    };

    const handleBasic = (row) => {
        const old_basic = parseFloat(row.old_basic) || 0;
        const increament_amt = parseFloat(row.increament_amt) || 0;

        // correct basic
        const basic = old_basic + increament_amt;
        return {
            basic: basic.toFixed(2),
        };
    };



    return (
        <React.Fragment>
            <Row className='mt-4'>

                <Col xl={12} className='m-auto'>
                    <div className='box-border m-auto'>
                        <Form id="increaments-form">
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
                                                    {formDataHeader?.map((header, index) => (
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
                                                    formDetailData.map((data, rowIndex) => (
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
                                                                        onDelete={() => handleDeleteRow(data, rowIndex)}
                                                                    //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                                    />
                                                                </td>

                                                            }
                                                            <td className=" table_cell">
                                                                <TextField
                                                                    type="date"
                                                                    required
                                                                    name="eff_date"
                                                                    value={data.eff_date || ""}
                                                                    // maxLength={4}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "eff_date",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    } 
                                                                      onBlur={(e) => validateRequiredField(e, 'Effective Date')}

                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                   // required
                                                                    name="category_desc"
                                                                    value={data.category_desc || ""}
                                                                    // maxLength={4}
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "category_desc",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick("cat", catHelpListHeader, rowIndex)
                                                                    }

                                                                //  onBlur={(e) => handleGradeBlur(e, data.grd_no, rowIndex)}


                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    //  required
                                                                    name="grad_desc"
                                                                    value={data.grad_desc || ""}
                                                                    maxLength={3}
                                                                    // disabled
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "grad_desc",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick("grade", gradeHelpListHeader, rowIndex)
                                                                    }
                                                                //  onBlur={(e) => validateRequiredField(e, 'Short desc')}

                                                                />
                                                            </td>
                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "desg_desc",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="desg_desc"
                                                                    value={data.desg_desc || ""}
                                                                    // checked={data?.desg_desc === "Y"} 
                                                                    //  onBlur={(e) => validateRequiredField(e, 'Short desc')} 
                                                                    onDoubleClick={() =>
                                                                        handleDoubleClick("desig", desigHelpListHeader, rowIndex)
                                                                    }


                                                                // required
                                                                />
                                                            </td>


                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "rating",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="rating"
                                                                    value={data.rating || ""}
                                                                    disabled
                                                                // checked={data?.desg_desc === "Y"}

                                                                // required
                                                                // required
                                                                />
                                                            </td>
                                                            <td className="table_cell">

                                                                <TextField
                                                                    type="text"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "increament",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="increament"
                                                                    value={data.increament || ""}

                                                                />

                                                            </td>


                                                            <td className="table_cell">

                                                                <TextField
                                                                    type="text"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "old_basic",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="old_basic"
                                                                    value={data.old_basic || ""}
                                                                    disabled

                                                                />

                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="number"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "increament_amt",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="increament_amt"
                                                                    value={data.increament_amt || ""}
                                                                    onBlur={(e) => {
                                                                        if (formStatus === "Insert" || formStatus === "Update" || formStatus === "Search") {

                                                                            const quantity = Number(e.target.value);
                                                                            const hasLocalError = handleAmtError(quantity);

                                                                            if (hasLocalError) {
                                                                                e.target.focus();
                                                                                return;
                                                                            }

                                                                            const { basic } = handleBasic(data);
                                                                            handleChange(
                                                                                "formDetailData",
                                                                                "basic",
                                                                                basic,
                                                                                rowIndex
                                                                            );

                                                                            const val = data.increament_amt;
                                                                            const isNumericField =
                                                                                !isNaN(val) && val !== "";
                                                                            const parsedValue = isNumericField
                                                                                ? parseFloat(val)
                                                                                : val;
                                                                            // console.log(parsedValue);

                                                                            handleChange(
                                                                                "formDetailData",
                                                                                "increament_amt",
                                                                                parsedValue?.toFixed(2),
                                                                                rowIndex,
                                                                                e
                                                                            );
                                                                        }
                                                                    }}

                                                                />
                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="number"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "basic",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="basic"
                                                                    value={data.basic || ""}
                                                                    disabled

                                                                />

                                                            </td>

                                                            <td className="table_cell">
                                                                <TextField
                                                                    type="text"
                                                                    //  required
                                                                    onChange={(e) =>
                                                                        handleChange(
                                                                            "formDetailData",
                                                                            "month_name",
                                                                            e.target.value,
                                                                            rowIndex,
                                                                            e
                                                                        )
                                                                    }
                                                                    name="month_name"
                                                                    value={data.month_name || ""}
                                                                    disabled

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

            <Row className="mt-2">
                <Col sm="12" md={12} lg={4}>
                    <TextField
                        type="number"
                        label="Adjustment Amount"
                        value={formDetailData[focusedRowIndex]?.adjustment_amt || ""}
                        onChange={(e) =>
                            handleChange(
                                "formDetailData",
                                "adjustment_amt",
                                e.target.value,
                                focusedRowIndex,
                                e
                            )
                        }
                        onBlur={(e) => {
                            if (formStatus === "Insert" || formStatus === "Update" || formStatus === "Search") {

                              
                                const val = formDetailData[focusedRowIndex]?.adjustment_amt
                                const isNumericField =
                                    !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                // console.log(parsedValue);

                                handleChange(
                                    "formDetailData",
                                    "adjustment_amt",
                                    parsedValue?.toFixed(2),
                                    focusedRowIndex,
                                    e
                                );
                            }
                        }}

                    // disabled
                    />
                </Col>

                <Col sm="12" md={12} lg={4}>
                    <TextField
                        type="number"
                        label="Performance Award"
                        value={formDetailData[focusedRowIndex]?.perf_award_amt || ""}
                        onChange={(e) =>
                            handleChange(
                                "formDetailData",
                                "perf_award_amt",
                                e.target.value,
                                focusedRowIndex,
                                e
                            )
                        } 
                         onBlur={(e) => {
                            if (formStatus === "Insert" || formStatus === "Update" || formStatus === "Search") {

                                const val = formDetailData[focusedRowIndex]?.perf_award_amt
                                const isNumericField =
                                    !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                // console.log(parsedValue);

                                handleChange(
                                    "formDetailData",
                                    "perf_award_amt",
                                    parsedValue?.toFixed(2),
                                    focusedRowIndex,
                                    e
                                );
                            }
                        }}
                    // disabled
                    />
                </Col>

                <Col sm="12" md={12} lg={4}>
                    <TextField
                        type="number"
                        label="Exgratia Amount"
                        value={formDetailData[focusedRowIndex]?.exgratia_amt || ""}
                        onChange={(e) =>
                            handleChange(
                                "formDetailData",
                                "exgratia_amt",
                                e.target.value,
                                focusedRowIndex,
                                e
                            )
                        } 
                         onBlur={(e) => {
                            if (formStatus === "Insert" || formStatus === "Update" || formStatus === "Search") {
                                const val = formDetailData[focusedRowIndex]?.exgratia_amt
                                const isNumericField =
                                    !isNaN(val) && val !== "";
                                const parsedValue = isNumericField
                                    ? parseFloat(val)
                                    : val;
                                // console.log(parsedValue);

                                handleChange(
                                    "formDetailData",
                                    "exgratia_amt",
                                    parsedValue?.toFixed(2),
                                    focusedRowIndex,
                                    e
                                );
                            }
                        }}
                    //disabled
                    />
                </Col>
            </Row>


        </React.Fragment>
    );
};

export default IncreamentDtl
