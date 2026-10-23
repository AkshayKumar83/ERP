import React from 'react'
import { Row, Col, Table, Form } from 'reactstrap'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import { makeHeaders } from './Item_master_helper'

const ItemMasterMakeDetail = ({ makeFormData, handleChangeMake, formStatus, triggerAddRow }) => {

  // function triggerAddRow(){ 
  // }
  function handleDelete() {
  }
  function handleUpdate() {
  }

  return (
    <Row className="" >
      <Col xs={12} lg={12}>
        <Form id="item-master-make-details">
          <div className="table-title">
            <span>Item Master Make Details</span>
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
                    {makeHeaders.map((header, index) => (
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
                  {makeFormData.map((data, rowIndex) => (
                    <tr key={rowIndex}>
                      {
                        (formStatus === 'Insert' || formStatus === 'Update') &&
                        <td className="sticky-column left">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={makeFormData.length > 1}
                            onDelete={() => handleDelete(data, rowIndex)}
                            onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                          />
                        </td>
                      }
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="make_abb"
                          value={data.make_abb || ""}
                          maxLength={30}
                          onChange={(e) => handleChangeMake("make_abb", e.target.value, rowIndex, e)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="make_desc"
                          value={data.make_desc || ""}
                          maxLength={30}
                          onChange={(e) => handleChangeMake("make_desc", e.target.value, rowIndex, e)}
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

export default ItemMasterMakeDetail