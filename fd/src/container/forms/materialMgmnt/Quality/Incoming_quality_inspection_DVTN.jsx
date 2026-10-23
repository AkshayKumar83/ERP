import React from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import { BatchHeader } from './Incoming_quality_inspection';

const IncomeQualityDvtn = ({ formData, handleChange, formStatus }) => {
  return (
    <>
      <Row>

        <Col xl={3}>
          <TextField
            type="text"
            label="Deviation Type"
            value={formData.deviation_type_desc || ""}
            maxLength={100}
            onChange={(e) => handleChange("formDvtnData", "deviation_type_desc", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={3}>

        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Deviation No."
            value={formData.deviation_no || ""}
            maxLength={8}
            onChange={(e) => handleChange("formDvtnData", "deviation_no", e.target.value)}
            disabled
          />
        </Col>

      </Row>

      <Row>

        <Col xl={3}>
          <TextField
            type="date"
            label="Deviation Date"
            value={formData.deviation_date || ""}
            onChange={(e) => handleChange("formDvtnData", "deviation_date", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Department"
            value={formData.init_by || ""}
            onChange={(e) => handleChange("formDvtnData", "init_by", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Details"
            value={formData.deviation_desc || ""}
            onChange={(e) => handleChange("formDvtnData", "deviation_desc", e.target.value)}
            disabled
          />
        </Col>

      </Row>

      <Row>
        <Col xl={3}>
          <TextField
            type="text"
            label="Item Code"
            value={formData.it_code || ""}
            onChange={(e) => handleChange("formDvtnData", "it_code", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Item Description"
            value={formData.it_desc || ""}
            onChange={(e) => handleChange("formDvtnData", "it_desc", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Ok Quantity"
            value={formData.ok_quantity || ""}
            onChange={(e) => handleChange("formDvtnData", "ok_quantity", e.target.value)}
            disabled
          />
        </Col>

        <Col xl={2}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <ButtonUi className='w-25' />
              <ButtonUi className='w-25' />
            </div>
          </Card>
        </Col>


      </Row>

      <Row>
        <Col xl={3}>
          <TextField
            type="text"
            label="Vendor Code "
            value={formData.v_code || ""}
            onChange={(e) => handleChange("formDvtnData", "v_code", e.target.value)}
            disabled
          />
        </Col>
        <Col xl={3}>
          <TextField
            type="text"
            label="Vendor Name"
            value={formData.v_name || ""}
            onChange={(e) => handleChange("formDvtnData", "v_name", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row>
        <Col xl={5}>
          <TextField
            type="text"
            label="Reason"
            value={formData.reason || ""}
            onChange={(e) => handleChange("formDvtnData", "reason", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row>
        <Col xl={5}>
          <TextField
            type="text"
            label="Corractive Action"
            value={formData.prop_corr || ""}
            onChange={(e) => handleChange("formDvtnData", "prop_corr", e.target.value)}
            disabled
          />
        </Col>
      </Row>

      <Row>
        <Col xl={2}>
          <TextField
            type="text"
            label="Valid From"
            value={formData.valid_from || ""}
            onChange={(e) => handleChange("formDvtnData", "valid_from", e.target.value)}
            disabled
          />
        </Col>

        <Col xl={2}>
          <TextField
            type="text"
            label="Valid Upto"
            value={formData.valid_upto || ""}
            onChange={(e) => handleChange("formDvtnData", "valid_upto", e.target.value)}
            disabled
          />
        </Col>

        <Col xl={2}>
          <TextField
            type="text"
            label="Quantity"
            value={formData.quantity || ""}
            onChange={(e) => handleChange("formDvtnData", "quantity", e.target.value)}
            disabled
          />
        </Col>

        <Col xl={2}>
          <TextField
            type="text"
            label="MRIR No."
            value={formData.mrir_no || ""}
            onChange={(e) => handleChange("formDvtnData", "mrir_no", e.target.value)}
            disabled
          />
        </Col>
      </Row>

    </>



  );
};

export default IncomeQualityDvtn;
