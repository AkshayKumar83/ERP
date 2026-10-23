

import React, { useState } from 'react';
import TextField from '../../../../components/basic/textField';
import { Col, Container, Form, Row, Table } from 'reactstrap';
import { DetailBatchHeader, validateOkQty, validateRejQty } from './Item_stock_opening_mstr_helper';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import toast from 'react-hot-toast';

const ItemStockOpeningMstrBatchStock = ({ batchData, allBatchData = [], setAllBatchData,handleChange, formStatus, triggerAddRow, detailData, focusedBatchRowIndex ,setFocusedBatchRowIndex, handleDelete }) => {

  const makeFocusOnTableRow = (rowIndex, id) => {
    setFocusedBatchRowIndex(rowIndex); // only batch update
  };

  // Ensure new row focus and typing works
  const handleChangeWithFocus = (stateKey, name, value, index, event) => {
        if (formStatus !== 'Update') return;
    handleChange(stateKey, name, value, index, event);
    if(event?.target){
      const cursorPos = event.target.selectionStart;
       if (
    event?.target &&
    event.target.tagName === "INPUT" &&
    !["number", "radio", "checkbox", "date"].includes(event.target.type)
  ) 
      setTimeout(() => {
        event.target.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
  };

const currentItCode = batchData[0]?.it_code; //parent ka it_code

const totOkQty = allBatchData
  .filter(item => item.it_code === currentItCode)
  .reduce((sum, item) => sum + (Number(item.ok_qty) || 0), 0);

const totRejQty = allBatchData
  .filter(item => item.it_code === currentItCode)
  .reduce((sum, item) => sum + (Number(item.rej_qty) || 0), 0);




  
  return (
    <Row>
      <Col md={12} xl={12}>
        <Form id="item-stock-open-batch" className="">
          <div className="table-title">
            <span>Batch Stock</span>
            {(formStatus === 'Insert' || formStatus === 'Update') && (
              <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
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
                      {(formStatus === 'Insert' || formStatus === 'Update') && <th>Actions</th>}
                      {DetailBatchHeader.map((header, index) => (
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
                           {header.required && (
                        <span className='required-asterisk'>*</span>
                      )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batchData.map((data, rowIndex) => {
                      const globalIndex = allBatchData.findIndex(b => b.id === data.id);
                      return (
                        <tr
                          key={data.id}
                          onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                          style={{ border: `${rowIndex === focusedBatchRowIndex ? '2px solid black' : 'none'}` }}
                          tabIndex={0}
                        >
                          {(formStatus === 'Insert' || formStatus === 'Update') && (
                            <td>
                              <RowAction
                                formStatus={formStatus}
                                canDelete={allBatchData.length >= 0}
                                onDelete={() => handleDelete(data)}
                              />
                            </td>
                          )}
                          <td className="table_cell">
                            <TextField
                              type="text"
                               required
                              id='batch_no'
                              name="batch_no"
                              value={data?.batch_no || ''}
                              maxLength={60}
                              onChange={(e) => handleChangeWithFocus('batchData', 'batch_no', e.target.value, globalIndex, e)}

                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="date"
                               required
                              id='batch_date'
                              name="batch_date"
                              value={data?.batch_date || ''}
                             onChange={(e) => handleChangeWithFocus('batchData', 'batch_date', e.target.value, globalIndex, e)}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              name="ok_qty"
                              value={data?.ok_qty ?? 0}
                              onChange={(e) => handleChangeWithFocus('batchData', 'ok_qty', e.target.value, globalIndex, e)}
                           onBlur={(e) => {
                             if (formStatus !== "Update") return;
                          const relatedDetail = detailData.find((detail) => detail.it_code === data.it_code);
                          const yropQtyOk = relatedDetail?.yrop_qtyok || 0;
                          const isValid = validateOkQty(yropQtyOk, totOkQty, data.ok_qty);
                            if (!isValid) e.target.focus();
                           }}
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              // required
                              name="ytd_recpok"
                              value={data?.ytd_recpok ?? ''}
                              onChange={(e) => handleChangeWithFocus('batchData', 'ytd_recpok', e.target.value, globalIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              // required
                              name="ytd_issuok"
                              value={data?.ytd_issuok ?? ''}
                              onChange={(e) => handleChangeWithFocus('batchData', 'ytd_issuok', e.target.value, globalIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                              type="number"
                              // required
                              name="currbal_ok"
                              value={data?.currbal_ok ?? ''}
                              onChange={(e) => handleChangeWithFocus('batchData', 'currbal_ok', e.target.value, globalIndex, e)}
                              disabled
                            />
                          </td>
                          <td className="table_cell">
                            <TextField
                          type="number"
                          name="rej_qty"
                          value={data?.rej_qty ?? 0}
                          onChange={(e) => handleChangeWithFocus('batchData', 'rej_qty', e.target.value, globalIndex, e)}
                          onBlur={(e) => {
                             if (formStatus !== "Update") return;
                            const relatedDetail = detailData.find((detail) => detail.it_code === data.it_code);
                            const yropQtyRej = relatedDetail?.yrop_qtyre || 0;
                            const isValid = validateRejQty(yropQtyRej, totRejQty, data.rej_qty);
                            if (!isValid) {
                              // Keep focus in the same field if validation fails
                              setTimeout(() => e.target.focus(), 0);
                            }
                          }}
                          onKeyDown={(e) => {
                             if (formStatus !== "Update") return;
                            if (e.key === "Tab" || e.key === "Enter") {
                              const relatedDetail = detailData.find((detail) => detail.it_code === data.it_code);
                              const yropQtyRej = relatedDetail?.yrop_qtyre || 0;
                              const isValid = validateRejQty(yropQtyRej, totRejQty, data.rej_qty);
                              if (!isValid) {
                                e.preventDefault(); // prevent moving focus away
                                setTimeout(() => e.target.focus(), 0);
                              }
                            }
                          }}
                        />

                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </SimpleBar>
          </div>
        </Form>
      </Col>
      <Row>
        <Col xl={6} className=''>
          <Row className="d-flex justify-content-end ms-4">
            <Col xl={3} className="ms-4">
              <TextField
                type="number"
              // value={totOkQty.toFixed(3)}
               value={
    allBatchData.length > 0 && allBatchData.some(item => Number(item.ok_qty) >= 0)
      ? totOkQty.toFixed(3)
      : ''
  }
                disabled
              />
            </Col>
          </Row>
        </Col>
        <Col xl={6} className=''>
          <Row className=" d-flex justify-content-end">
            <Col md={5} xl={3} className="">
              <TextField
                type="number"
                  // value={totRejQty.toFixed(3)}
                 value={
    allBatchData.length > 0 && allBatchData.some(item => Number(item.rej_qty) >= 0)
      ? totRejQty.toFixed(3)
      : ''
  }
                
                disabled
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Row>
  );
};

export default ItemStockOpeningMstrBatchStock;












// import React, { useState } from 'react';
// import TextField from '../../../../components/basic/textField';
// import { Col, Container, Form, Row, Table } from 'reactstrap';
// import { DetailBatchHeader } from './Item_stock_opening_mstr_helper';
// import SimpleBar from 'simplebar-react';
// import ButtonUi from '../../../../components/basic/button';
// import RowAction from '../../../../components/common/rowAction';
// import toast from 'react-hot-toast';

// const ItemStockOpeningMstrBatchStock = ({ batchData = [], setBatchData,handleChange, formStatus, triggerAddRow, detailData  }) => {
//   const [focusedRowIndex, setFocusedRowIndex] = useState(0);

//   const makeFocusOnTableRow = (rowIndex, id) => {
//     setFocusedRowIndex(rowIndex); //  only parent update
//   };

//  const handleDelete = (data, rowIndex) => {
//   // Just filter out the row at the given index
//   const updatedDetailData = batchData.filter((_, i) => i !== rowIndex);
//   setBatchData(updatedDetailData);
// };
//   // Calculate totals for filtered batchData
//   const totOkQty = batchData.reduce((sum, item) => sum + (Number(item.ok_qty) || 0), 0);
//   const totRejQty = batchData.reduce((sum, item) => sum + (Number(item.rej_qty) || 0), 0);

//   const handleOkQtyBlur = (index, e) => {
//     console.log('handleOkQtyBlur')
//     if (!['Update'].includes(formStatus)) {
//         return;
//     }
//   const batchRow = batchData[index];
//   const detailRow = detailData.find((d) => d.id === batchRow.detailId);

//     // if (!detailRow || detailRow.batch_flag !== 'Y') return;

//   const yrop_qtyok = Number(detailRow?.yrop_qtyok || 0);
//   const ok_qty = Number(batchRow?.ok_qty || 0);

//   if (yrop_qtyok === 0 && ok_qty > 0) {
//     toast.error(' Cannot enter Ok Qty when Year Opening Ok Qty is 0');
//     e.target.focus()
//     return;
//   }

//   if (yrop_qtyok > 0 && ok_qty < 0) {
//     toast.error(' Batch Ok Qty cannot be negative');
//      e.target.focus()
//     return;
//   }

//   if (yrop_qtyok > 0 && ok_qty > yrop_qtyok) {
//     toast.error(' Batch Ok Qty cannot be greater than Year Opening Ok Qty');
//      e.target.focus()
//     return;
//   }
//   };

//   const handleRejQtyBlur = (index,e) => {
//     if (!['Update'].includes(formStatus)) {
//         return;
//     }
//   const batchRow = batchData[index];
//   const detailRow = detailData.find((d) => d.id === batchRow.detailId);

//     // if (!detailRow || detailRow.batch_flag !== 'Y') return;

//   const yrop_qtyre = Number(detailRow?.yrop_qtyre || 0);
//   const rej_qty = Number(batchRow?.rej_qty || 0);

//   if (yrop_qtyre === 0 && rej_qty > 0) {
//     toast.error(' Cannot enter Reject Qty when Year Opening Reject Qty is 0');
//      e.target.focus()
//     return;
//   }

//   if (yrop_qtyre > 0 && rej_qty < 0) {
//     toast.error(' Batch Reject Qty cannot be negative');
//      e.target.focus()
//     return;
//   }

//   if (yrop_qtyre > 0 && rej_qty > yrop_qtyre) {
//     toast.error(' Batch Reject Qty cannot be greater than Year Opening Reject Qty');
//      e.target.focus()
//     return;
//   }
//   };


//   return (
//     <Row>
//       <Col md={12} lg={11}>
//         <Form id="item-stock-open-batch" className="">
//           <div className="table-title">
//             <span>Batch Stock</span>
//             {(formStatus === 'Insert' || formStatus === 'Update') && (
//               <ButtonUi color="primary" className="add-action" onClick={triggerAddRow}>
//                 Add Row
//               </ButtonUi>
//             )}
//           </div>
//           <div className="table-wrapper-v3">
//             <SimpleBar forceVisible="y" autoHide={false}>
//               <div className="table-sticky-wrapper" style={{ height: '120px', maxHeight: '120px' }}>
//                 <Table hover>
//                   <thead>
//                     <tr>
//                       {(formStatus === 'Insert' || formStatus === 'Update') && <th>Actions</th>}
//                       {DetailBatchHeader.map((header, index) => (
//                         <th
//                           key={index}
//                           data-required={header.required || false}
//                           style={{
//                             whiteSpace: 'nowrap',
//                             width: header.width,
//                             minWidth: header.width,
//                           }}
//                         >
//                           {header.label}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {batchData.map((data, rowIndex) => (
//                       <tr
//                         key={data.id}
//                         onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
//                         style={{ border: `${rowIndex === focusedRowIndex ? '2px solid black' : 'none'}` }}
//                         tabIndex={0}
//                       >
//                         {(formStatus === 'Insert' || formStatus === 'Update') && (
//                           <td>
//                             <RowAction
//                               formStatus={formStatus}
//                               canDelete={batchData.length >= 1}
//                               onDelete={() => handleDelete(data, rowIndex)}
//                             />
//                           </td>
//                         )}
//                         <td className="table_cell">
//                           <TextField
//                             type="text"
//                              required
//                             id='batch_no'
//                             name="batch_no"
//                             value={data.batch_no || ''}
//                             maxLength={60}
//                             onChange={(e) => handleChange('batchData', 'batch_no', e.target.value, rowIndex, e)}

//                           />
//                         </td>
//                         <td className="table_cell">
//                           <TextField
//                             type="date"
//                              required
//                             id='batch_date'
//                             name="batch_date"
//                             value={data.batch_date || ''}
//                            onChange={(e) => handleChange('batchData', 'batch_date', e.target.value, rowIndex, e)}
//                           />
//                         </td>
//                         <td className="table_cell">
//                           <TextField
//                             type="number"
//                             // required={detailData?.batch_flag}
//                             name="ok_qty"
//                             value={String(data.ok_qty) || ''}
//                             onChange={(e) => handleChange('batchData', 'ok_qty', e.target.value, rowIndex, e)}
//                             onBlur = {(e)=>handleOkQtyBlur(rowIndex, e)}
//                           />
//                         </td>
//                         <td className="table_cell">
//                           <TextField
//                             type="number"
//                             // required
//                             name="ytd_recpok"
//                             value={data.ytd_recpok || ''}
//                             onChange={(e) => handleChange('batchData', 'ytd_recpok', e.target.value, rowIndex, e)}
//                             disabled
//                           />
//                         </td>
//                         <td className="table_cell">
//                           <TextField
//                             type="number"
//                             // required
//                             name="ytd_issuok"
//                             value={data.ytd_issuok || ''}
//                             onChange={(e) => handleChange('batchData', 'ytd_issuok', e.target.value, rowIndex, e)}
//                             disabled
//                           />
//                         </td>
//                         <td className="table_cell">
//                           <TextField
//                             type="number"
//                             // required
//                             name="currbal_ok"
//                             value={data.currbal_ok || ''}
//                             onChange={(e) => handleChange('batchData', 'currbal_ok', e.target.value, rowIndex, e)}
//                             disabled
//                           />
//                         </td>
//                         <td className="table_cell">
//                           <TextField
//                             type="number"
//                             // required
//                             name="rej_qty"
//                             value={String(data.rej_qty) || ''}
//                             onChange={(e) => handleChange('batchData', 'rej_qty', e.target.value, rowIndex, e)}
//                             onBlur = {(e)=> handleRejQtyBlur(rowIndex,e)}
//                           />
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             </SimpleBar>
//           </div>
//         </Form>
//       </Col>
//       <Row>
//         <Col xl={6}>
//           <Row className="">
//             <Col xl={3} className="ms-auto">
//               <TextField
//                 type="number"
//              // value={totOkQty.toFixed(3)}
//                value={
//     batchData.length > 0 && batchData.some(item => Number(item.ok_qty) >= 0)
//       ? totOkQty.toFixed(3)
//       : ''
//   }
//                 disabled
//               />
//             </Col>
//           </Row>
//         </Col>
//         <Col lg={6}>
//           <Row className="me-4 d-flex justify-content-end">
//             <Col md={5} lg={3} className="me-4">
//               <TextField
//                 type="number"
//                 //  value={totRejQty.toFixed(3)}
//                  value={
//     batchData.length > 0 && batchData.some(item => Number(item.rej_qty) >= 0)
//       ? totRejQty.toFixed(3)
//       : ''
//   }
                
//                 disabled
//               />
//             </Col>
//           </Row>
//         </Col>
//       </Row>
//     </Row>
//   );
// };

// export default ItemStockOpeningMstrBatchStock;