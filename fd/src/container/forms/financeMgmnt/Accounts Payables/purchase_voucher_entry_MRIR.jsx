import React from 'react'
import { Col, Form, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap'
import ButtonUi from '../../../../components/basic/button'
import SimpleBar from 'simplebar-react'
import RowAction from '../../../../components/common/rowAction'
import TextField from '../../../../components/basic/textField'
import { MRIRHeader } from './purchase_voucher_entry_helper'

const PurchaseVoucherEntryMRIR = ({
  mrirData, 
  handleChangeMRIR, 
  formStatus, 
  triggerAddRowMRIR,
  isMrirModelOpen,
  toggleMrirModal,
}) => {

    // const handleDelete = (rowIndex) => {
  //   if (mrirData.length > 1) {
  //     const updatedData = mrirData.filter((_, index) => index !== rowIndex);
  //     handleChangeMRIR("mrirData", updatedData);
  //   }
  // };

    function handleDelete (){
    }
    function handleUpdate (){
    }
    
    return (

      <Modal isOpen={isMrirModelOpen} toggle={toggleMrirModal} backdrop="static">
        <ModalHeader toggle={toggleMrirModal}>MRIR</ModalHeader>
        <ModalBody> 

      <Row className="" >
        <Col xs={12} lg={12}>
        <Form id="mrir" className="">
          <div className="table-title">
            <span>MRIR</span>
            {(formStatus === "Insert" || formStatus === "Update") && (
              <ButtonUi color="primary" className="add-action" onClick={triggerAddRowMRIR}
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
                    {MRIRHeader.map((header, index) => (
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
              {mrirData.map((data, rowIndex) => (
                <tr key={rowIndex}>
                            {
                          (formStatus==='Insert' || formStatus==='Update') &&
                           <td className="sticky-column left">
                               <RowAction
                                   formStatus={formStatus}
                                   canDelete={mrirData.length > 1}
                                   onDelete={() => handleDelete(data, rowIndex)}
                                   onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                               />
                           </td>
                      }
                  <td className="table_cell">
                    <TextField
                      type="text"
                      required
                      name="mrir_no"
                      value={data.mrir_no || ""}
                      maxLength={30}
                      onChange={(e) =>handleChangeMRIR("mrir_no", e.target.value,rowIndex,e)}
                    />
                  </td>
                  <td className="table_cell">
                    <TextField
                      type="date"
                      required
                      name="mrir_dt"
                      value={data.mrir_dt || ""}
                      maxLength={30}
                      onChange={(e) => handleChangeMRIR("mrir_dt", e.target.value,rowIndex,e)}
                      disabled 
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
      <Row className='mt-3'>
          <Col md={6} lg={6} className='d-flex justify-content-end'>
          <ButtonUi color='dark' outline onClick={toggleMrirModal}>Return</ButtonUi>
          </Col>
          <Col md={3} lg={6}>
          <ButtonUi color='dark' outline>Delete</ButtonUi>
          </Col>
        </Row>
      </Row>
      </ModalBody>
      </Modal>
    )
  }


export default PurchaseVoucherEntryMRIR