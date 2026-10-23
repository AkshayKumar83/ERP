import React from 'react'
import { Col,Row , Modal, ModalBody, ModalHeader} from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'

const GateEntryCancel = ({formData,handleChange,formStatus,toggleCnclModal,isCnclModelOpen

}) => {
  return (
  <Modal isOpen={isCnclModelOpen} toggle={toggleCnclModal} backdrop="static">
        <ModalHeader toggle={toggleCnclModal}></ModalHeader>
        <ModalBody> 
<Row className='mt-1 justify-content-center'>
  <Col xl={8} className="">
    <TextField
      type="text"
      label="Reason for Cancellation"
      name='cancel_remarks'
      value={formData?.cancel_remarks || ""}
      onChange={(e) => handleChange(e, "cancle_remarks", e.target.value)}
      // disabled
    />
  </Col>
</Row>

<Row className='mt-1 justify-content-center'>
  <Col xl={6} className="mt-3 d-flex justify-content-center gap-5">
    <ButtonUi color="dark">
      Save
    </ButtonUi>
    <ButtonUi color="dark">
      Cancel
    </ButtonUi>
  </Col>
</Row>

  </ModalBody>
      </Modal>
  )
}

export default GateEntryCancel
