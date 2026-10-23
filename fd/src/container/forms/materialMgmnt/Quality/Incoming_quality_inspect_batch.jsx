import React from 'react'
import { Card, Col, Form, Row, Table } from 'reactstrap';
import ButtonUi from '../../../../components/basic/button';
import SimpleBar from 'simplebar-react';
import RowAction from '../../../../components/common/rowAction';
import TextField from '../../../../components/basic/textField';
import { BatchHeader } from './Incoming_quality_inspection';
import toast from 'react-hot-toast';

const IncomingQualityInspectBatch = ({ batchData,
  handleChange,
  formStatus,
  focusedRowIndex,
  setFocusedRowIndex,
  setActiveTab,
  handleAddRow,
  handleDeleteRow

}) => {

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = batchData.find((entry) => entry.sr_no === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };




  // field validation  


  const validateAndFormatNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return true;
    }

    const num = parseFloat(value);

    if (isNaN(num)) {
      return true;
    }

    if (num < 0) {
      toast.error("This field value cannot be negative");
      return false;
    }

    return true;
  };



  const handleBatchQty = (row) => {
    const qtyAcp = parseFloat(row.qty_accptd) || 0;
    const qtyRcd = parseFloat(row.qty_recd) || 0;
    const batchNo = row.supp_batch_no?.trim() || '';

    if (!batchNo) {
      toast.error('Cannot enter Accepted Qty when Batch No is null');
      return null;
    }

    if (qtyAcp > qtyRcd) {
      toast.error('Accepted Qty cannot be greater than Received Qty');
      return { qty_rej: '' };
    }

    // Cal Rejected Qty
    let qty_rej = '';
    if (qtyAcp < qtyRcd) {
      qty_rej = qtyRcd - qtyAcp;
    }

    return { qty_rej };
  };

  //   const totalQty = (data) => {
  //   if (!data || data.length === 0) return 0;

  //   let total = 0;
  //   data.forEach((item) => {
  //     total += parseFloat(item.qty_accpt) || 0;
  //   });

  //   return total;
  // };

  // for handle total qty or rej
  const totalQty = (data, key) => {
    if (!Array.isArray(data) || data.length === 0) return "0.000";

    const sum = data.reduce((sum, item) => {
      return sum + (parseFloat(item[key]) || 0);
    }, 0);

    return sum.toFixed(3);
  };



  return (
    <>
      <Row>
        <Col xl={11} >
          <Card className=' p-2'>
            <Form id=" " className="form-batch-data">
              <div className="table-title">
                <span>Batch Details</span>
                {(formStatus === 'Insert' || formStatus === 'Update') && (
                  <ButtonUi color="primary" className="add-action"
                    onClick={() => handleAddRow('batchData')}
                  >
                    Add Row
                  </ButtonUi>
                )}
              </div>
              <div className="table-wrapper-v3">
                <SimpleBar forceVisible="y" autoHide={false}>
                  <div className="table-sticky-wrapper" style={{ height: '120px', maxHeight: '120px' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          {(formStatus === 'Insert' || formStatus === 'Update') && <th style={{ width: '20px' }}>Actions</th>}
                          {BatchHeader.map((header, index) => (
                            <th
                              key={index}
                              data-required={header.required || false}
                              style={{
                                whiteSpace: 'nowrap',
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
                        {batchData.map((data, rowIndex) => (
                          <tr
                            key={data.id}
                            onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                            style={{ border: `${rowIndex === focusedRowIndex ? '2px solid black' : 'none'}` }}
                            tabIndex={0}
                          >
                            {(formStatus === 'Insert' || formStatus === 'Update') && (
                              <td>
                                <RowAction
                                  formStatus={formStatus}
                                  canDelete={batchData.length >= 1}
                                  onDelete={() => handleDeleteRow('batchData', data, rowIndex)}
                                />
                              </td>
                            )}
                            <td className="table_cell">
                              <TextField
                                type="text"
                                required
                                // id='batch_no'
                                name="supp_batch_no"
                                value={data.supp_batch_no || ''}
                                maxLength={60}
                                onChange={(e) => handleChange('formBatchData', 'supp_batch_no', e.target.value, rowIndex, e)}
                                disabled

                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="date"
                                // id='batch_date'
                                name="batch_date"
                                value={data.batch_date || ''}
                                onChange={(e) => handleChange('formBatchData', 'batch_date', e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="date"
                                name="expiry_date"
                                value={String(data.expiry_date) || ''}
                                onChange={(e) => handleChange('formBatchData', 'expiry_date', e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="number"
                                // required
                                name="qty_recd"
                                // value={data.qty_recd || ''}
                                value={
                                  Number.isFinite(Number(data.qty_recd))
                                    ? Number(data.qty_recd).toFixed(3)
                                    : ""
                                }
                                onChange={(e) => handleChange('formBatchData', 'qty_recd', e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>
                            <td className="table_cell">
                              <TextField
                                type="number"
                                name="qty_accptd"
                                value={
                                  Number.isFinite(Number(data.qty_accptd))
                                    ? Number(data.qty_accptd).toFixed(3)
                                    : ""
                                }
                                onChange={(e) =>
                                  handleChange("formBatchData", "qty_accptd", e.target.value, rowIndex, e)
                                }
                                onBlur={(e) => {
                                  if (formStatus === "Update" || formStatus === "Insert") {
                                    const qty = e.target.value
                                   
                                    if (!validateAndFormatNumber(qty)) {
                                      e.target.focus(); 
                                      return; 
                                    }
                                    const result = handleBatchQty(data);
                                    if (!result) return;

                                    const { qty_rej } = result;
                                    handleChange("formBatchData", "qty_rej", qty_rej, rowIndex);
                                  }
                                }}
                              />

                            </td>
                            <td className="table_cell">
                              <TextField
                                type="number"
                                // required
                                name="qty_rej"
                                // value={data.qty_rej || ''}
                                value={
                                  Number.isFinite(Number(data.qty_rej))
                                    ? Number(data.qty_rej).toFixed(3)
                                    : ""
                                }
                                onChange={(e) => handleChange('formBatchData', 'qty_rej', e.target.value, rowIndex, e)}
                                disabled
                              />
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </SimpleBar>
              </div>
              <Row className='d-flex justify-content-end mb-2'>
                <Col xl={2}>
                  <TextField
                    type='text'
                    label='Total Accepted'
                    // value={batchData.tot_accepted || ""} 
                    value={totalQty(batchData, "qty_accptd")}
                    onChange={(e) => handleChange('formBatchData', 'tot_accepted', e.target.value, rowIndex, e)}
                    disabled
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    type='text'
                    label='Total Rejected'
                    // value={batchData.tot_rejected || ""}
                    value={totalQty(batchData, "qty_rej")}
                    onChange={(e) => handleChange('formBatchData', 'tot_rejected', e.target.value, rowIndex, e)}
                    disabled
                  />
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

      </Row>
      <Row className='mt-4 '>
        <Col className=' mt-4 d-flex justify-content-center'>
          <ButtonUi outline
            onClick={() => setActiveTab(1)}
          >Main Form

          </ButtonUi>
        </Col>
      </Row>
    </>
  );
}
export default IncomingQualityInspectBatch
