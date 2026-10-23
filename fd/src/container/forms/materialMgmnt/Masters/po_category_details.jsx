
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import { Table, Row, Col, Form, Card } from 'reactstrap';
import { handleValidateField, headers, validatePOCategory } from './po_category_helper';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import Checkbox from '../../../../components/basic/checkbox';
import RadioGroup from '../../../../components/basic/radioGroup';
import toast from 'react-hot-toast';

const PoCategoryDetails = ({
  formData = [{}],
  formStatus,
  handleAddRow,
  handleDeleteRow,
  handleChange,
  handleUpdateRow,
  focusedRowIndex,
  setFocusedRowIndex,
}) => {
  const rowRefs = useRef([]);
  const [isAddingRow, setIsAddingRow] = useState(false); // New state to track Add Row action

   const triggerAddRow = useCallback(() => {
      setIsAddingRow(true); // Set flag to true when adding row
     toast.dismiss(); // Clear any existing toasts to prevent duplicates
     const validationResult = validatePOCategory(formData);
     if (!validationResult.isValid) {
     toast.error(validationResult.error);
     setIsAddingRow(false); // Reset flag after validation
     return;
    }
     handleAddRow();
    }, [formData, handleAddRow]);

  const triggerUpdate = useCallback(
    (data, index) => {
      // Pass isUpdate=true to allow partial updates
      const validationResult = validatePOCategory([data], true);
      if (!validationResult.isValid) {
        toast.error(validationResult.error);
        return;
      }
      handleUpdateRow(data, index);
    },
    [handleUpdateRow]
  );

  const handleFieldFocus = useCallback(
    (index) => {
      setFocusedRowIndex(index);
    },
    [setFocusedRowIndex]
  );

  useEffect(() => {
    if (focusedRowIndex >= 0 && rowRefs.current[focusedRowIndex]) {
      const firstInput = rowRefs.current[focusedRowIndex].querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [focusedRowIndex]);

  return (
    <>
    <Form id="po-category-form" className="d-flex flex-column align-items-center">
      <Row className='w-50'>
        <Col>
          <div className="table-title">
            <span>PO Category</span>
            {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
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
                          {header.required && ( <span className='required-asterisk'>*</span>)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.map((data, rowIndex) => (
                      <tr
                        key={rowIndex}
                        ref={(el) => (rowRefs.current[rowIndex] = el)}
                        style={{
                          border: rowIndex === focusedRowIndex ? '2px solid black' : 'none',
                        }}
                        tabIndex={0}
                      >
                        {(formStatus === "Insert" || formStatus === "Update") && (
                          <td className="">
                            <RowAction
                              formStatus={formStatus}
                              canDelete={formData.length > 1}
                              onDelete={() => handleDeleteRow(data)}
                              // onUpdate={data.create_date && formStatus === 'Update' ? () => triggerUpdate(data, rowIndex) : undefined}
                            />
                          </td>
                        )}
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="po_cat_description"
                              id={`po_cat_description_${rowIndex}`} // <-- make id unique
                            value={data?.po_cat_description || ""}
                            maxLength={30}
                            onChange={(e) =>
                              handleChange("po_cat_description", e.target.value, rowIndex, e.target.type, e)
                            }
                            onFocus={() => handleFieldFocus(rowIndex)}
                            onBlur={(e)=>handleValidateField(e,formStatus,rowIndex,isAddingRow)}
                          />
                        </td>
                        <td className="table_cell">
                          <TextField
                            type="text"
                            required
                            name="po_cat_prefix"
                            id={`po_cat_prefix_${rowIndex}`}
                            value={data?.po_cat_prefix || ""}
                            maxLength={2}
                            onChange={(e) =>
                              handleChange("po_cat_prefix", e.target.value, rowIndex, e.target.type, e)
                            }
                            onFocus={() => handleFieldFocus(rowIndex)}
                             onBlur={(e)=>handleValidateField(e,formStatus,rowIndex,isAddingRow)}
                          />
                        </td>
                        <td className="table_cell">
                          <Checkbox
                            name="mod_vat"
                            checked={data.mod_vat === 'Y'}
                            onChange={(e) =>
                              handleChange('mod_vat', e.target.checked, rowIndex, 'checkbox', e)
                            }
                            onFocus={() => handleFieldFocus(rowIndex)}
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
     <Row className="mt-2 justify-content-center">
          <Col lg={6} className="">
            <RadioGroup
              className="radio-button-wrapper box-border py-sm-4 py-md-3 py-lg-0"
              options={[
                { text: "Job Work", value: "JW" },
                { text: "Work Order", value: "WO" },
                { text: "Capital", value: "CA" },
                { text: "Import", value: "IM" },
                { text: "Others", value: "OT" },
              ]}
              onChange={(e) =>
                handleChange("user_code", e.target.value, focusedRowIndex, e.target.type, e)
              }
              checked={formData[focusedRowIndex]?.user_code || " "}
            />
          </Col>
    </Row>
        </>
  );
};

export default PoCategoryDetails;