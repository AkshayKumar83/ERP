import React, { useState } from 'react'
import { Row, Col, Form, Table, Card } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import { authHelpListHeader, sectionHelpListHeader, userDescHeader, userHelpListHeader } from './user_section_helpers'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import toast from 'react-hot-toast'
import { FcInfo } from "react-icons/fc";


const UserSectionDtl = ({ formStatus, userSectionData = [{}], handleChange, formData, handleAddRow, handleDelete,
    setHelpFor,
    setHelpListHeader,
    handleHelpList = () => { },
    activeRowIndex,
    setActiveRowIndex,
    fetchValidateData,

}) => {

    const handleDoubleClick = (field, header) => {
        if (formStatus && focusedRowIndex !== null) {
            setHelpFor(field);
            setHelpListHeader(header);
            handleHelpList(true);
            setActiveRowIndex(focusedRowIndex);
        }
    };

    const [focusedRowIndex, setFocusedRowIndex] = useState(0);
    const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = userSectionData.find((entry) => entry.id === id);
        setFocusedRowIndex(rowIndex);
        // triggerFamilyDetail(id)
    };

    const validateRequiredField = (e, fieldLabel) => {
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`this ${fieldLabel} field is required`);
            e.preventDefault();
            e.target.focus();
            return false;
        }
        return true;
    };


    return (
        <React.Fragment>
            <Row>
                <Col xl={10} className='m-auto'>
                    <Card className="mb-2 p-1 shadow-sm">
                        <Form id="user-section-form">
                            <div className="table-title">
                                {/* <span>Sales Order Discount</span> */}
                                {(formStatus === "Insert" || formStatus === "Update") && (
                                    <ButtonUi color="primary" className="add-action"
                                        onClick={handleAddRow}
                                    >
                                        Add Row
                                    </ButtonUi>
                                )}
                            </div>
                            <div className="table-wrapper-v3">
                                <SimpleBar forceVisible="y" autoHide={false}>
                                    <div className="table-sticky-wrapper height-auto">
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    {(formStatus === "Insert" || formStatus === "Update") &&
                                                        <th style={{ width: '80px' }} className="sticky-column left">Actions</th>
                                                    }
                                                    {userDescHeader.map((header, index) => (
                                                        <th
                                                            key={index}
                                                            data-required={header.required || false}
                                                            style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                                        >
                                                            {header.label}
                                                            {header.isHelpExist && (<FcInfo title="Info" />)}

                                                            {header.required && (
                                                                <span className="required-asterisk"> *</span>
                                                            )}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userSectionData && userSectionData.map((data, rowIndex) => (
                                                    <tr key={rowIndex}
                                                        onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                                                        style={{ border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`, }}
                                                    // tabIndex={0}
                                                    >
                                                        {(formStatus === "Insert" || formStatus === "Update") && (
                                                            <td className="">
                                                                <RowAction
                                                                    formStatus={formStatus}
                                                                    canDelete={userSectionData.length > 1}
                                                                    onDelete={() => handleDelete(data, rowIndex)}

                                                                />
                                                            </td>
                                                        )}
                                                        <td>
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="user_name"
                                                                value={data.user_name || ""}
                                                                onChange={(e) => handleChange("user_name", e.target.value, rowIndex)}
                                                                onDoubleClick={() => handleDoubleClick("user", userHelpListHeader, rowIndex)}
                                                                onBlur={async (e) => {
                                                                    if (formStatus === "Insert" || formStatus === "Update") {
                                                                        validateRequiredField(e, "User Name")
                                                                        const result = await fetchValidateData("user_name", e.target.value, rowIndex);
                                                                    }
                                                                }}


                                                            />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="section_name"
                                                                value={data.section_name || ""}
                                                                onChange={(e) => handleChange("section_name", e.target.value, rowIndex)}
                                                                onDoubleClick={() => handleDoubleClick("section", sectionHelpListHeader, rowIndex)}
                                                                onBlur={async (e) => {
                                                                    if (formStatus === "Insert" || formStatus === "Update") {
                                                                        validateRequiredField(e, "Section Name")
                                                                        const result = await fetchValidateData("section_name", e.target.value, rowIndex);
                                                                    }
                                                                }}
                                                            />

                                                        </td>

                                                        <td>
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="auth_name"
                                                                value={data.auth_name || ""}
                                                                onChange={(e) => handleChange("auth_name", e.target.value, rowIndex)}
                                                                onDoubleClick={() => handleDoubleClick("auth", authHelpListHeader, rowIndex)}
                                                                onBlur={(e) => {
                                                                    if (formStatus === "Insert" || formStatus === "Update") {
                                                                        validateRequiredField(e, "Auth Name")
                                                                        fetchValidateData("auth_name", e.target.value, rowIndex);
                                                                    }
                                                                }}
                                                            />

                                                        </td>
                                                        <td>
                                                            <Checkbox
                                                                //type="text"
                                                                name="default_section"
                                                                value={data.default_section || ""}
                                                                onChange={
                                                                    (e) => {
                                                                        //console.log("handle change clicked at checkbox")
                                                                        handleChange("default_section", e.target.checked ? "Y" : "N", rowIndex)
                                                                    }
                                                                }
                                                                checked={data?.default_section === "Y"}
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
                    </Card>

                </Col>
            </Row>

        </React.Fragment>
    )
}

export default UserSectionDtl

