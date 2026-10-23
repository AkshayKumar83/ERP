import React, { useState } from 'react'
import RadioGroup from '../../../../components/basic/radioGroup'
import { Row, Col, Form, Table } from 'reactstrap';
import SimpleBar from 'simplebar-react'
import ButtonUi from '../../../../components/basic/button'
import { AgeingParameterHeader } from './ageing_parameterHelpers'
import TextField from '../../../../components/basic/textField'
import { MdDeleteForever, MdAddCircle, MdRefresh } from "react-icons/md"
import RowAction from '../../../../components/common/rowAction';
import toast from 'react-hot-toast';

const AgeingparameterDtl = ({
    formData,
    formStatus,
    handleChange,
    periodData = [{}],
    handleAddRow,
    handleDeleteRow,
    handleSetPeriodData,
    actualPeriodData,
    //handleDelete,
    getValidateData,
    updateAgeForm,
    deleteRecordInUpdate,
    otherQueryPera,
    setSelectedUserFlag,
    setFilteredPeriodData,
    setCurrentRecordNo,
    setFormData

}) => {

    const validateRequiredField = (e, fieldLabel) => {
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`This ${fieldLabel} field is required`);
            e.target.focus();
            return false;
        }
        return true;
    };

    // console.log("actual data:", actualPeriodData)
    console.log("period Data:", periodData)

    const handleUserChange = (flag) => {

        console.log("actual data:", actualPeriodData)
        setSelectedUserFlag(flag);
        handleChange("formData", "debt_cred", flag);

        // if (formStatus === "Query") {
        let filteredData = [];

        if (flag === "C") {
            filteredData = actualPeriodData.filter((item) => item.debt_cred === "C");
            console.log("C, filtered Data", filteredData);
        } else if (flag === "D") {
            filteredData = actualPeriodData.filter((item) => item.debt_cred === "D");
            console.log("D, filtered Data", filteredData);
        }

        setFilteredPeriodData(filteredData);
        handleSetPeriodData(filteredData);
        setCurrentRecordNo(filteredData.length - 1)
        // }
    };


    const handleDelete = async (data, index) => {
        await deleteRecordInUpdate(index);
        handleDeleteRow(index);
    };


    const handleUpdate = async (data) => {
        console.log("Update button clicked");
        await updateAgeForm(data);
        //console.log("Updated Age Form:", updateFormPayload);
    };

    const handleValidateBlur = async (e, rowIndex, name) => {
        if (formStatus === 'Update' || formStatus === "Insert") {

            const field = e.target;
            const value = field.value;

            if (name) {
                validateRequiredField({ target: field }, `${name}`)
            }

            if (value === 'undefined' || value === null || value === '') {
                console.log('value', value)
                return
            }


            // validateRequiredField({target: field }, `${name}`) 
            // try {

            //     const result = await getValidateData(name, value, otherQueryPera, rowIndex);
            //     console.log('Validation result:', result);

            //     if (!result) {
            //         // Only focus if INVALID
            //         field.focus();
            //     } else if (result.data) {
            //         // console.log(data)

            //     }

            // }
            // catch (err) {
            //     console.error("Valdation error", err)
            // }
        }

    }

    return (

        <React.Fragment>
            <Row>
                <Col xl={4} style={{ margin: 'auto' }}>
                    <RadioGroup
                        className="button-group-wrapper box-border d-flex justify-content-evenly"
                        options={[
                            { text: "Creditor", value: "C" },
                            { text: "Debtor", value: "D" },

                        ]}
                        onChange={(e) => { handleUserChange(e.target.value) }}
                        checked={formData?.debt_cred}
                    //value={formData?.debt_cred}
                    />
                </Col>
            </Row>
            <Row>
                <Col xl={7} className='m-auto'>
                    <Form id="ageing-parameter-form">
                        <div className="table-title">
                            <span>Ageing Parameter</span>
                            {

                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <ButtonUi color="primary" className="add-action"
                                    onClick={handleAddRow}
                                >Add Row</ButtonUi>}

                        </div>
                        <div className="table-wrapper-v3">
                            <SimpleBar forceVisible="Y" autoHide={false}>
                                <div className="table-sticky-wrapper height-auto">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                {(formStatus === 'Insert' || formStatus === 'Update') && (
                                                    <th className="sticky-column left" style={{ width: '30px' }}>Actions</th>
                                                )}
                                                {AgeingParameterHeader.map((header, index) => (
                                                    <th key={index} style={{ width: header.width, minWidth: header.width }}>
                                                        {header.label}
                                                        {header.required && (
                                                            <span className="required-asterisk"> *</span>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periodData &&
                                                periodData?.map((data, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {
                                                            (formStatus === 'Insert' || formStatus === 'Update') &&
                                                            <td>
                                                                <RowAction
                                                                    formStatus={formStatus}
                                                                    canDelete={periodData.length > 1}
                                                                    onDelete={() => handleDelete(data, rowIndex)}
                                                                //onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                                                                />
                                                            </td>

                                                        }
                                                        <td className='table_cell'>
                                                            <TextField style={{ textAlign: 'left' }}
                                                                required
                                                                type="number"
                                                                name="from_period"
                                                                value={periodData[rowIndex]?.from_period || data.from_period}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    let value = e.target.value;
                                                                    // Remove non-numeric characters (for safety)
                                                                    value = value.replace(/\D/g, "");

                                                                    if (value.length > 7) {
                                                                        value = value.slice(0, 7);
                                                                    }

                                                                    handleChange("periodData", "from_period", value, rowIndex);
                                                                }}
                                                                // onBlur={(e) => {
                                                                //     if (formStatus === "Update" || formStatus === "Insert") {
                                                                //         const fromPeriod = e.target.value;
                                                                //         validateRequiredField(e, "From Period")
                                                                //         getValidateData("from_period", fromPeriod, otherQueryPera)
                                                                //     }
                                                                // }}  
                                                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'from_period')}
                                                            />
                                                        </td>

                                                        <td className='table_cell'>
                                                            <TextField style={{ textAlign: 'left' }}
                                                                required
                                                                //disabled
                                                                type="number"
                                                                name="to_period"
                                                                //value={data.to_period || ""}
                                                                value={periodData[rowIndex]?.to_period || data.to_period}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    let value = e.target.value;
                                                                    // Remove non-numeric characters (for safety)
                                                                    value = value.replace(/\D/g, "");

                                                                    if (value.length > 7) {
                                                                        value = value.slice(0, 7);
                                                                    }

                                                                    handleChange("periodData", "to_period", value, rowIndex);
                                                                }}

                                                                // onBlur={(e) => {
                                                                //     if (formStatus === "Update" || formStatus === "Insert") {
                                                                //         const toPeriod = e.target.value;
                                                                //         //console.log("")
                                                                //         validateRequiredField(e, "To Period")
                                                                //         getValidateData("to_period", toPeriod, otherQueryPera)
                                                                //     }
                                                                // }}  
                                                                onBlur={(e) => handleValidateBlur(e, rowIndex, 'to_period')}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </SimpleBar>
                        </div>
                    </Form>
                </Col>
            </Row>
        </React.Fragment>
    )
}

export default AgeingparameterDtl;
