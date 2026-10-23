import React, { useState } from 'react'
import { Col, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import { blockPymtOptnHeader, docHelpListHeader, accHelpListHeader } from './block_payment_option_helper';
import Checkbox from '../../../../components/basic/checkbox';
import { FcInfo } from "react-icons/fc";


const BlockPaymentOptionMain = ({ formData = [{}], handleChange = () => { }, formStatus = '', triggerAddRow,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => { },
  setFocusedRowIndex,
  focusedRowIndex,
  setActiveRowIndex,
  handleDeleteRow,
  getValidateData,
  otherQueryPera


}) => {

  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = formData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  const handleDoubleClick = (field, header, rowIndex) => {
    // if (formStatus === "Search") {
    //   toast.error("Help list is not available in search mode")
    // }
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      setActiveRowIndex(rowIndex);
    }
  };


  return (
    <>

      <Form id="block-payment-form" className="ms-4 me-4 mt-4">
        <div className="table-title">
          <span>Block payment Option</span>
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
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <th className="sticky-column left">Actions</th>
                  )}
                  {blockPymtOptnHeader.map((header, index) => (
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
                       {header.required 
                      //  && 
                      //  (
                      //       <span className="required-asterisk">*</span>
                      //     )
                          }
                      {header.isHelpExist && (<FcInfo title="Info" />)}
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
                      border: `${rowIndex === focusedRowIndex ? "2px solid black" : "none"}`,
                    }}
                    tabIndex={0}>
                    {
                      (formStatus === 'Insert' || formStatus === 'Update') &&
                      <td className="sticky-column left">
                        <RowAction
                          formStatus={formStatus}
                          canDelete={formData.length > 1}
                          onDelete={() => handleDeleteRow(data, rowIndex)}
                        //  onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                        />
                      </td>
                    }
                    <td className="table_cell">
                      <TextField
                        type="text"
                         required
                        name="acc_no"
                        value={data.acc_no || ""}
                        maxLength={30}
                        onChange={(e) => handleChange("acc_no", e.target.value, rowIndex, e)}
                        onDoubleClick={
                          () => handleDoubleClick("acc", accHelpListHeader, rowIndex)}
                        onBlur={async (e) => {
                          if (formStatus === "Update" || formStatus === "Insert") {
                            const acc = e.target.value;
                            const isValid = await getValidateData("acc_no", acc, otherQueryPera, rowIndex);

                            if (!isValid) {
                              e.target.focus()
                            }
                          }
                        }}


                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="acc_desc"
                        value={data.acc_desc || ""}
                        maxLength={20}
                        onChange={(e) => handleChange("acc_desc", e.target.value, rowIndex, e)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="text"
                        required
                        name="doc_no"
                        value={data.doc_no || ""}
                        maxLength={20}
                        onChange={(e) => handleChange("doc_no", e.target.value, rowIndex, e)}
                        onDoubleClick={
                          () => handleDoubleClick("doc", docHelpListHeader, rowIndex)}
                        onBlur={async (e) => {
                          if (formStatus === "Update" || formStatus === "Insert") {
                            const doc = e.target.value;
                            const isValid = await getValidateData("doc_no", doc, otherQueryPera, rowIndex);

                            if (!isValid) {
                              e.target.focus()
                            }
                          }
                        }}


                      />
                    </td>
                    <td className="table_cell">
                      <TextField
                        type="date"
                        required
                        name="doc_dt"
                        value={data.doc_dt || ""}
                        maxLength={20}
                        onChange={(e) => handleChange("doc_dt", e.target.value, rowIndex, e)}
                        disabled
                      />
                    </td>
                    <td className="table_cell">
                      <Checkbox
                        onChange={(e) => handleChange("block_flag", e.target.checked ? "Y" : "N", rowIndex, e)}
                        checked={data?.block_flag === "Y"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </SimpleBar>
        </div>
      </Form>

    </>
  )
}

export default BlockPaymentOptionMain