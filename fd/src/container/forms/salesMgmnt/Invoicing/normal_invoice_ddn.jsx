import React from 'react'
import { Card, Col, Form, Row } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import ButtonUi from '../../../../components/basic/button'

const NormalInvDDN = ({
    formData={},
    formStatus='',
    handleChange=()=>{},
}) => {
  return (
 <Form id='normal-inv-ddn-form'>
    <Card className='p-2 px-auto'>
        <Row >
            <Col xl={4}>
                <TextField
                    type="number"
                    label='Account Debit Challan No.'
                    name="document_no"
                    value={formData.document_no || ""}
                    onChange={(e) =>handleChange(e)}
                />
            </Col>
        </Row>
        <Row  className='mt-2'>
            <Col xl={4} className='d-flex flex-row gap-3'>
                <ButtonUi color='secondary' className='px-3' onClick={()=>{}}>Ok</ButtonUi>
                <ButtonUi color='secondary' className='px-3' onClick={()=>{}}>Cancel</ButtonUi>
            </Col>
        </Row>
    </Card>
 </Form>
  )
}

export default NormalInvDDN
