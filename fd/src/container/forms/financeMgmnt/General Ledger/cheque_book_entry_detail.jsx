import React, { useState } from 'react'
import RowAction from '../../../../components/common/rowAction';
import { Col, Form, Row, Table } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import { chqBookheader } from './cheque_bookEntry_helper';
import Select from '../../../../components/basic/select';

const ChequeBookEntryDetail = ({detailFormData, handleChange, triggerAddRow, formStatus ,
  focusedRowIndex,setFocusedRowIndex,handleDelete,sectionId=[],divisionId=[]}) => {

    
      const makeFocusOnTableRow = (rowIndex, id) => {
        const entry = detailFormData.find((entry) => entry.sr_no === id);
        setFocusedRowIndex(rowIndex);
        // triggerFamilyDetail(id)
      };
    
    
  return (
   
       
<Row className="justify-content-center">
<Col xs={12} md={10} lg={8} xl={8}> 
      <Form  id="Cheque-Book-entry" className=" mt-5">
        <div className="table-title">
          <span>Cheque Book Entry</span>
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}
            >
              Add Row
            </ButtonUi>
          )}
        </div>

        <div
          className="table-container"
          style={{ height: "180px", maxHeight: "180px" }}
        >
          <SimpleBar forceVisible="y" autoHide={false}>
            <Table hover>
              <thead>
                <tr>
                  {/* {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="sticky-column left">Actions</th>
                  )} */}
                  {chqBookheader.map((header, index) => (
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
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailFormData.map((data, rowIndex) => (
                  <tr 
                  key={rowIndex} 
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)} 
                  style={{  border: `${  rowIndex === focusedRowIndex ? "2px solid black" : "none"  }`, 
                  }} 
                  tabIndex={0}>
                    {/* {(formStatus === "Insert" || formStatus === "Update") && (
                      <td className="sticky-column left">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={detailFormData.length > 1}
                          onDelete={() => handleDelete( rowIndex)}
                          onUpdate={ handleUpdate ? () => handleUpdate(data) : undefined }
                        />
                      </td>
                    )} */}
                    <td>
                    <Select
                    type="text"
                    name='section_id'
                    value={data?.section_id || ""}
                    onChange={(e) => handleChange("section_id", e.target.value, rowIndex,e)}
                    options={sectionId}
                    required
                
                />
                    </td>
                    <td>
                    <Select
                    type="text"
                    name='division_id'
                    value={data?.division_id || ""}
                    onChange={(e) => handleChange("division_id", e.target.value, rowIndex,e)}
                    options={divisionId}
                    required
                />
                    </td>

                  </tr>
                ))}
              </tbody>
            </Table>
          </SimpleBar>
        </div>
      </Form>
      </Col>
      </Row>
  )
}

export default ChequeBookEntryDetail