import React, { useState } from 'react'
import { Form, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import { normalInvOnAccBillheader } from './normal_invoice_helper';


const NormalInvoiceOnAccBill = ({formData, handleChange,formStatus}) => {

const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = itemFormDetail.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
  };

  return (
     <Form id=''>
      {/* Table Header */}
      <div className="table-title d-flex justify-content-end gap-2">
          {(formStatus === "Insert" || formStatus === "Update") && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>Add Row</ButtonUi>
          )}
      </div>
      {/* Items Table */}
      <div className="table-container">
        <SimpleBar forceVisible="y" autoHide={false}>
          <Table hover>
            <thead>
              <tr>
                {(formStatus === "Insert" || formStatus === "Update") && (
                  <th className="sticky-column left" style={{ width: "5%" }}>Actions</th>
                )}
                {normalInvOnAccBillheader.map((header, index) => (
                  <th
                    key={index}
                    data-required={header.required || false}
                    style={{whiteSpace: "nowrap", width: header.width, minWidth: header.width}}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formData.map((data, rowIndex) => (
                <tr
                  key={rowIndex}
                  onFocus={() => makeFocusOnTableRow(rowIndex, data.sr_no)}
                  style={{border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,}}
                  tabIndex={0}
                >
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <td className="">
                      <RowAction
                        formStatus={formStatus}
                        canDelete={formData.length > 1}
                        onDelete={() => handleDelete(data, rowIndex)}
                        onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                      />
                    </td>
                  )}
                  <td>
                    <TextField
                      name="voucher_no"
                      value={data.voucher_no || ""}
                      onChange={(e) =>handleChange("voucher_no", e.target.value, rowIndex)}
                      disabled
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      name="doc_no"
                      value={data.doc_no || ""}
                      onChange={(e) =>handleChange("doc_no", e.target.value, rowIndex)}
                     
                    />
                  </td>
                  <td>
                    <TextField
                      type="date"
                      name="doc_dt"
                      value={data.doc_dt || ""}
                      onChange={(e) =>handleChange("doc_dt", e.target.value, rowIndex)}
                      disabled
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="text"
                      name="po_no"
                      value={data.po_no || ""}
                      onChange={(e) =>handleChange("po_no", e.target.value, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="number"
                      name="amount"
                      value={data.amount || ""}
                      onChange={(e) =>handleChange("amount", e.target.value, rowIndex)}
                    />
                  </td>
                  <td>
                    <TextField
                      disabled
                      type="text"
                      name="db_cr"
                      value={data.db_cr || ""}
                      onChange={(e) =>handleChange("db_cr", e.target.value, rowIndex)}
                    />
                  </td>
              
                 
                </tr>
              ))}
            </tbody>
          </Table>
        </SimpleBar>
      </div>
      </Form>
  )
}

export default NormalInvoiceOnAccBill