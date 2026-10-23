import React from 'react'
import { Row, Col } from 'reactstrap'
import ButtonUi from '../../../../components/basic/button'

const ItemMasterDrawing = () => {
  return (
    <Row>
      <Col sm={5} md={2} lg={2} className="mt-3 ms-4">
        <ButtonUi color="dark" outline>
          Show Drawing
        </ButtonUi>
      </Col>
      <Col className='mt-4'>
        <span>
          DRAWING_DISPLAY
        </span>
      </Col>
      <Col sm={5} md={2} lg={2} className="mt-3 ms-4">
        <ButtonUi color="dark" outline>
          Load Docs
        </ButtonUi>
      </Col>
      <Col sm={5} md={2} lg={2} className="mt-3 ms-4">
        <ButtonUi color="dark" outline>
          Extract Docs
        </ButtonUi>
      </Col>
      <Col sm={5} md={2} lg={2} className="mt-3 ms-4">
        <ButtonUi color="dark" outline>
          Remove Docs
        </ButtonUi>
      </Col>
    </Row>
  )
}

export default ItemMasterDrawing