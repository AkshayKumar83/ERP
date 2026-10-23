import React, { useState, useEffect,useRef  } from 'react'
import { Row, Col, Form, Table } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import SimpleBar from 'simplebar-react'
import { checkDuplicateFromDB, CodeDefinitionTypeHeader } from './code_definitionHelpers.js'
import RowAction from '../../../../components/common/rowAction'
import ButtonUi from '../../../../components/basic/button'
import { FALSE } from 'sass'
//import { useState } from 'react' 
import toast from 'react-hot-toast'


const CodeDefinitionDetail = ({ categoryTypeData, handleChange, formStatus, handleAddRow, 
    handleDelete, categoryData, handleCatTypeDetailChange, formData, handleUpdateRow, 
    setSelectedCategory,
    catDesc,
    setCatDesc,
  focusedRowIndex,
  setFocusedRowIndex,
  page,
  setPage,
  totalPages,
  selectedCategory


}) => {
    // const [catDesc, setCatDesc] = useState([]);

    // useEffect(() => {
    //     const transformedCatDesc = categoryData.map((category) => ({
    //         value: category.cat_group,
    //         label: category.cat_desc,
    //     }));

    //     setCatDesc(transformedCatDesc);
    //     console.log(transformedCatDesc)
    //     setSelectedCategory(transformedCatDesc[0]?.value)
    // }, [categoryData]);  

    // useEffect(() => {
    //     if (Array.isArray(categoryData) && categoryData.length > 0) {
    //         const transformedCatDesc = categoryData.map((category) => ({
    //             value: category.cat_group,
    //             label: category.cat_desc,
    //         }));
    //         setCatDesc(transformedCatDesc);
    //         setSelectedCategory(transformedCatDesc[0]?.value || "");
    //     } else {
    //         setCatDesc([]);
    //         setSelectedCategory("");
    //     }
    // }, [categoryData]);

   const simpleBarRef = useRef(null);
const isAddingRowRef = useRef(false);


const scrollToBottom = () => {
  if (!simpleBarRef.current) return;

  const scrollElement = simpleBarRef.current.getScrollElement();
  if (!scrollElement) return;

  scrollElement.scrollTop = scrollElement.scrollHeight;
};

useEffect(() => {
   scrollToBottom();
}, [categoryTypeData.length]);  

    useEffect(() => {

    if (!categoryTypeData.length) return;

    if (isAddingRowRef.current) {

        setTimeout(() => {

        scrollToBottom();

        const lastInput = document.querySelector(
            `tbody tr:last-child input`
        );

        lastInput?.focus();

        setFocusedRowIndex(categoryTypeData.length - 1);

        isAddingRowRef.current = false;

        }, 0);

        return;
    }

    setTimeout(() => {

        const firstInput = document.querySelector(
        `tbody tr:first-child input`
        );

        firstInput?.focus();

        setFocusedRowIndex(0);

    }, 0);

    }, [categoryTypeData.length]);   

useEffect(() => {
    if (
        (formStatus === "Query" ||formStatus === "Insert" || formStatus === "Update") &&
        Array.isArray(categoryData) &&
        categoryData.length > 0
    ) {
        const transformedCatDesc = categoryData.map((category) => ({
            value: category.cat_group,
            label: category.cat_desc,
        }));

        setCatDesc(transformedCatDesc);

        // ✅ Only set if empty
        setSelectedCategory(prev => prev || transformedCatDesc[0]?.value || "");

    } else {
        setCatDesc([]);
    }
}, [categoryData, formStatus]);


    const validateRequiredField = (e, fieldLabel) => {
        if(formStatus !== 'Insert' && formStatus !== 'Update') return true;
        const value = e.target.value?.trim();
        if (!value) {
            toast.error(`this ${fieldLabel} field is required`);
            e.preventDefault();
            e.target.focus();
            return false;
        }
        return true;
    };

     const makeFocusOnTableRow = (rowIndex, id) => {
     const entry = categoryTypeData.find((entry) => entry.sr_no === id);
     setFocusedRowIndex(rowIndex);
     
   };
const handleDescriptionBlur = async (value, rowIndex) => {

   if (!value?.trim()) return;

   const row = categoryTypeData[rowIndex];

   if (!row) return;

   const isNewRow = !row.code || row.code.trim() === "";

   //  EXISTING ROW → CHECK ONLY IF CHANGED
   if (!isNewRow) {

      const originalValue = row.create_description || row.description;

      if (originalValue === value) {
         return;   
      }
   }

   //  CALL DB CHECK
   const duplicateInDB = await checkDuplicateFromDB(
      value,
      selectedCategory,
      formStatus
   );

   if (duplicateInDB) {
      handleCatTypeDetailChange("description", "", rowIndex);
   }
};

    return (
        <React.Fragment>
            <Form
                id="code-defination-category-form"
            >

                {/* <h2 style = {{fontSize: '14px', fontWeight: 'bold', marginLeft: '42px'}}>Category</h2> */}
                <Row>
                    <Col xl={11} style={{ margin: 'auto' }}>
                        <Select
                            label="Category"
                            required
                            placeholder="Enter category"
                            name="cat_group"
                            value={formData?.cat_group || ""}
                            options={catDesc}
                            //  onChange={(e) => handleChange("cat_group", e.target.value, e)} 
                            onChange={(e) => {
                                handleChange("cat_group", e.target.value, e);
                                setSelectedCategory(e.target.value); 
                            }}
                        >

                        </Select>

                    </Col>
                </Row>

            </Form>

            <Row>
                <Col xl={11} style={{ margin: 'auto' }}>
                    <Form id="code-defination-cat-type-form">
                        <div className="table-title">
                            <span>Type</span>
                            {

                                (formStatus === 'Insert' || formStatus === 'Update') &&
                                <ButtonUi color="primary" className="add-action"
                                   onClick={() => {
                                    isAddingRowRef.current = true;
                                    handleAddRow();
                                }}
                                >Add Row</ButtonUi>}

                        </div>


                        <div className="table-wrapper-v3">
                            <SimpleBar  ref={simpleBarRef} style={{ border: '' }} forceVisible="Y" autoHide={false}>
                                <div className="table-sticky-wrapper" >
                                    <Table hover>
                                        <thead style={{ border: '' }}>
                                            <tr>
                                                {
                                                    (formStatus === 'Insert' || formStatus === 'Update') &&
                                                    <th className="sticky-column left">Actions</th>
                                                }
                                                {CodeDefinitionTypeHeader.map((header, index) => (
                                                    <th
                                                        key={index}
                                                        data-required={header.required || false}
                                                        style={{ whiteSpace: "nowrap", width: header.width, minWidth: header.width, }}>
                                                        {header.label}
                                                        {header.required && (
                                                            <span className="required-asterisk"> *</span>
                                                        )}

                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {categoryTypeData &&
                                                categoryTypeData.map((data, rowIndex) => (
                                                    <tr 
                                                    key={rowIndex} 
                                                onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                                                style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                                                }} 
                                                tabIndex={0}>
                                                        {
                                                            (formStatus === 'Insert' || formStatus === 'Update') &&
                                                            <td >
                                                                <RowAction
                                                                    formStatus={formStatus}
                                                                    canDelete={categoryTypeData.length > 0}
                                                                    onDelete={() => handleDelete(data, rowIndex)}
                                                               // onUpdate={handleUpdateRow ? () => handleUpdateRow(data) : undefined}
                                                                />
                                                            </td>

                                                        }
                                                        <td className="table_cell">
                                                            <TextField
                                                                required
                                                                type="text"
                                                                name="description"
                                                                value={data.description || ""}
                                                                //inputClassName={styles["input"]}
                                                                maxLength={100}
                                                                onChange={(e) => handleCatTypeDetailChange("description", e.target.value, rowIndex, e)}
                                                                // onBlur={(e) => validateRequiredField(e, "Description")}
                                                                onBlur={(e) => handleDescriptionBlur(e.target.value, rowIndex,formStatus)}
                                                            />
                                                        </td>

                                                        <td className="table_cell" style={{ width: '250px' }}>
                                                            <TextField
                                                                required={false}
                                                                type="text"
                                                                name="prefix"
                                                                value={data.prefix || ""}
                                                                maxLength={4}
                                                                onChange={(e) => handleCatTypeDetailChange("prefix", e.target.value, rowIndex, e)}
                                                            // onFocus={() => handleFieldFocus(rowIndex)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>

                                    </Table>
                                </div>
                            </SimpleBar>

                         </div>
                <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "10px"
                        }}>
                        <ButtonUi
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Prev
                        </ButtonUi>

                        <span style={{ fontWeight: "500" }}>
                            Page {page} / {totalPages}
                        </span>

                        <ButtonUi
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </ButtonUi>
            </div>
            
                    </Form>
                </Col>
            </Row>

        </React.Fragment>

        // for type 


    )
}

export default CodeDefinitionDetail
