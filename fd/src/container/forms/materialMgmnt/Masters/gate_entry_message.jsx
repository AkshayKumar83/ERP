import React from 'react'
import { Card, Col,  Modal, ModalBody, ModalHeader, Row } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'

const GateEntryMessage = ({ msgData,handleChange,formStatus, isMsgModelOpen,
  toggleMsgModal,}) => {
  return (
         <Modal isOpen={isMsgModelOpen} toggle={toggleMsgModal} backdrop="static">
        <ModalHeader toggle={toggleMsgModal}></ModalHeader>
        <ModalBody> 
 <Row className="justify-content-center">
  <Col>
    <Card className="p-3">
    <Row className='mt-1  d-flex justify-content-center'>
      <Col xl={5} className=''>
         <span>Dynamic Message here </span>
          </Col>
    </Row>

      <Row className='mt-1'>
        <Col xl={5}>
          <TextField
            type="number"
            label="Po Quantity Ordered"
            name='po_qty_ord'
            value={ msgData?.po_qty_ord || ""}
            onChange={(e) => handleChange("po_qty_ord", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={5}>
          <TextField
            type="number"
            label="This month Schd. Qty"
            name='schd_qty'
            value={ msgData?.schd_qty || ""}
            onChange={(e) => handleChange("schd_qty", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row className='mt-1'>
        <Col xl={5}>
          <TextField
            type="text"
            label="+/- Allowed"
            name='plus_minus_allowed'
            value={ msgData?.plus_minus_allowed || ""}
            onChange={(e) => handleChange("plus_minus_allowed", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={7}>
          <TextField
            type="text"
            label="Add/Ded Authorised Qty(MRP Req)"
             name='add_dedn_qty'
            value={ msgData?.add_dedn_qty || ""}
            onChange={(e) => handleChange("add_dedn_qty", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row className='mt-1'>
        <Col xl={5}>
          <TextField
            type="number"
            label="Total Qty at Gate"
             name='ge_qty'
            value={ msgData?.ge_qty || " "}
            onChange={(e) => handleChange("ge_qty", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={5}>
          <TextField
            type="number"
            label="U/I Receipts till date"
            name='total_ui'
            value={ msgData?.total_ui || ""}
            onChange={(e) => handleChange("total_ui", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row className='mt-1'>
        <Col xl={5}>
          <TextField
            type="number"
            label="OK Receipts till date"
             name='total_accpt'
            value={ msgData?.total_accpt || ""}
            onChange={(e) => handleChange("total_accpt", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={5}>
          <TextField
            type="number"
            label="Current Challan Quantity"
             name='challan_qty'
            value={ msgData?.challan_qty || ""}
            onChange={(e) => handleChange("challan_qty", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row className='mt-1'>
        <Col xl={5}>
          <TextField
            type="number"
            label="Total"
             name='total_qty'
            value={ msgData?.total_qty || ""}
            onChange={(e) => handleChange("total_qty", e.target.value)}
            disabled
          />
        </Col>
      </Row>
    </Card>
  </Col>
</Row>

   <Row>
     <Col className="mt-3 d-flex justify-content-center">
             <ButtonUi color="dark" 
             >OK
             </ButtonUi>
                </Col>
   </Row>
   </ModalBody>
      </Modal>

  )
}

export default GateEntryMessage
