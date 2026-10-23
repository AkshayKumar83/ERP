import React from 'react'
import { Row, Col, Form, Table, Card } from 'reactstrap'
import RadioGroup from '../../../../components/basic/radioGroup'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import { sectionDescHeader } from './finance_section_helper'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import { authHelpListHeader, userHelpListHeader, sectionHelpListHeader } from './user_section_helpers'
import toast from 'react-hot-toast'

const FinanceSectionDtl = ({ formData, formStatus, handleChange, sectionData = [{}], handleDelete, handleAddRow, departments = [] , 
    handleDeptChange, setSelectedDepartment
  
}) => {   

  
    const validateRequiredField = (e, fieldLabel) => { 
        if (formStatus === 'Insert' || formStatus === 'Update') {
            
         const value = e.target.value?.trim();
         if (!value) {
           toast.error(`this ${fieldLabel} field is required`);
           e.preventDefault();
           e.target.focus();
           return false;
         }
         return true; 
        }
       };
   

    return (
        <React.Fragment> 
           <Form id = "finance-section-dept-form"> 
            <Row>
                <Col xl={4} className='m-auto'>
                    <Select 
                       required
                        label="Department Code"
                        name = "dept_cd"
                        value={formData.dept_cd || ""}
                        onChange={(e) => handleDeptChange("dept_cd", e.target.value)}
                        options = {departments}
                        onBlur={(e) => validateRequiredField(e, "Department Code")}
                    />

                </Col>


            </Row> 
            </Form>
            <Row className='mt-2'>
                <Col xl={10} className='m-auto'>
                    <Card className="mb-2 p-1 shadow-sm">
                        <Form id="finance-section-form">
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
                            <div  className="table-wrapper-v3">
                                <SimpleBar forceVisible="y" autoHide={false}> 
                                    <div  className="table-sticky-wrapper height-auto"> 
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                {(formStatus === "Insert" || formStatus === "Update") &&
                                                    <th style={{ width: '80px' }} className="sticky-column left">Actions</th>
                                                }
                                                {sectionDescHeader.map((header, index) => (
                                                    <th
                                                        key={index}
                                                        data-required={header.required || false}
                                                        style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width }}
                                                    >
                                                        {header.label}
                                                           {header.required && (
                                                            <span className="required-asterisk"> *</span>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sectionData.map((data, rowIndex, e) => (
                                                <tr key={rowIndex}>
                                                    {(formStatus === "Insert" || formStatus === "Update") && (
                                                        <td>
                                                            <RowAction
                                                                formStatus={formStatus}
                                                                canDelete={sectionData.length > 1}
                                                                onDelete={() => handleDelete(data, rowIndex)}

                                                            />
                                                        </td>
                                                    )}
                                                    <td>
                                                        <TextField 
                                                            required
                                                            type="text"
                                                            name="section_desc"
                                                            value={data.section_desc || ""}
                                                            maxLength = {40}
                                                            onChange={(e) => handleChange( "sectionData","section_desc", e.target.value, rowIndex,  e)}
                                                            onBlur={(e) => validateRequiredField(e, "Section Desc")}
                                                        />
                                                    </td>
                                                    <td>
                                                        <TextField 
                                                            required
                                                            type="text"
                                                            name="section_prefix"
                                                            value={data.section_prefix || ""}
                                                            maxLength = {1}
                                                            onChange={(e) => handleChange( "sectionData","section_prefix", e.target.value, rowIndex, e)}
                                                            onBlur={(e) => validateRequiredField(e, "Section Prefix")}
                                                        />

                                                    </td>
                                                    <td>
                                                        <Checkbox
                                                            name="default_sale"
                                                            value={data.default_sale || ""}
                                                            onChange={(e) => handleChange( "sectionData","default_sale", e.target.checked ? "Y" : "N", rowIndex, e)}
                                                            checked={data?.default_sale === "Y"}
                                                            maxLength = {1}
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

export default FinanceSectionDtl;
