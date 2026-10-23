import React from 'react'
import { Col, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from '../../../../components/common/rowAction';
import { frtAccNoHelpListHeader, handleValidateField, POCatHelpListHeader, purCtgDfntHeader } from './puchase_category_defination_helper';
import TextField from '../../../../components/basic/textField'
import { FcInfo } from 'react-icons/fc';

const PurchaseCategoryDefinationHdr = ({
  formData, 
  setFormData,
  formStatus,
  handleChange,
  focusedRowIndex, 
  setFocusedRowIndex,
  triggerAddRow,     
  handleDelete,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
   }) => {
    
   const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = formData.find((entry) => entry.sr_no === id);
        setFocusedRowIndex(rowIndex);
    };

     const handleDoubleClick = (field, header, rowIndex) => {

     if (["Query","Insert", "Search", "Update"].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true, rowIndex);
     }
  };


  return (
   <>
       <Row>
    <Col>
    <Form id = 'pur-ctg-defination'>
        <div className="table-title">
              <span>Purchase Category Defination</span>
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
                                      <th className="sticky-column left">Actions</th>
                                    )}
                                {purCtgDfntHeader.map((header, index) => (
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
                                        {header.required && (
                             <span className='required-asterisk'>*</span>)}
                                         {header.isHelpExist && <FcInfo title="Info" />}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                               <tbody>
              {formData.map((data, rowIndex) => (
                <tr
                  key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                  style={{
                    border: rowIndex === focusedRowIndex? "2px solid black" : "none",
                  }}
                  tabIndex={0}
                >
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <td>
                      <RowAction
                        formStatus={formStatus}
                        canDelete={formData.length > 1}
                        onDelete={() => handleDelete(rowIndex)}
                      />
                    </td>
                  )}
                  <td className="table_cell">
                    <TextField
                      type="text"
                      name="trans_code"
                      value={data?.trans_code || ""}
                     maxLength={20}
                      onChange={(e) =>handleChange("trans_code", e.target.value, rowIndex, e,)}
                     disabled
                    />
                  </td>
                  <td className="table_cell">
                    <TextField
                      type="text"
                      name="po_cat_prefix"
                      value={data?.po_cat_prefix || ""}
                       maxLength={2}
                      onChange={(e) =>handleChange("po_cat_prefix", e.target.value, rowIndex, e)}
                      onDoubleClick={() =>handleDoubleClick("POCat", POCatHelpListHeader,rowIndex)}
                      onBlur= {(e)=>handleValidateField(e,formStatus)}
                      required
                     
                    />
                  </td>
                  <td className="table_cell">
                    <TextField
                      type="text"
                      name="po_cat_prefix_desc"
                      value={data?.po_cat_prefix_desc || ""}
                      maxLength={20}
                      onChange={(e) =>
                        handleChange("po_cat_prefix_desc", e.target.value, rowIndex, e)
                      }
                      disabled

                     
                    />
                  </td>
                  <td className="table_cell">
                    <TextField
                      type="text"
                      name="frt_acc_no"
                      maxLength={20}
                      value={data?.frt_acc_no || ""}
                      onChange={(e) =>handleChange("frt_acc_no", e.target.value, rowIndex, e)}
                      onDoubleClick={() =>handleDoubleClick("frtAccNo", frtAccNoHelpListHeader,rowIndex)}
                    />
                  </td>
                  <td className="table_cell">
                    <TextField
                      type="text"
                      name="acc_desc"
                      value={data?.acc_desc || ""}
                      onChange={(e) => handleChange("acc_desc", e.target.value, rowIndex, e) }
                      disabled
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
   
   </>
  )
}

export default PurchaseCategoryDefinationHdr