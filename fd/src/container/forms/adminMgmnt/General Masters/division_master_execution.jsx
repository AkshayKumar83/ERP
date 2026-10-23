import React from 'react'
import { Row, Col, Form } from 'reactstrap'
import TextField from '../../../../components/basic/textField'
import Select from '../../../../components/basic/select'
import Checkbox from '../../../../components/basic/checkbox'
import TextArea from '../../../../components/basic/textArea'

const Execution = ({formData, handleChange}) => {
    return (
        <Form id = "division-master-execution-form">
            <Row>
                <Col xl = {8} style = {{margin: 'auto'}}>
                    <TextArea
                        label="Execution Handler"
                        //required
                        placeholder=""
                        name="execution_handler"
                        type="text"
                        maxLength = {500}
                        value={formData?.execution_handler || ""}
                        onChange={(e) => handleChange("execution_handler", e.target.value, e)}

                    />
                </Col>
            </Row>

            <Row  className = 'mt-1'>
                <Col xl = {8} style = {{margin: 'auto'}}>
                    <TextArea
                        label="Execution Head"
                        //required
                        placeholder=""
                        name="execution_head"
                        type="text"
                        value={formData?.execution_head || ""}
                        maxLength = {100}
                        onChange={(e) => handleChange("execution_head", e.target.value, e)}
                    />
                </Col>
            </Row>
        </Form>

    )
}

export default Execution;