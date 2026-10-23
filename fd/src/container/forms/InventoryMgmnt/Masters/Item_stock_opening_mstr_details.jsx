


import React, { useState, useEffect, useRef } from 'react';
import TextField from '../../../../components/basic/textField';
import { Form, Table } from 'reactstrap';
import { DetailStockHeader, itCodeHelpListHeader } from './Item_stock_opening_mstr_helper';
import SimpleBar from 'simplebar-react';
import ButtonUi from '../../../../components/basic/button';
import RowAction from '../../../../components/common/rowAction';
import { FcInfo } from 'react-icons/fc'
import toast from 'react-hot-toast';

const ItemStockOpeningMstrDetail = ({
  detailData,
  setDetailData,
  handleChange,
  formStatus,
  triggerAddRow,
  handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  setFocusedRowIndex,
  focusedRowIndex,
  paginationPage,
  setPaginationPage,
  allBatchData ,
  setAllBatchData,
  handleDelete,
}) => {
  // const [paginationPage, setPaginationPage] = useState(1);
  const rowsPerPage = 9;
  const prevDetailDataLength = useRef(detailData.length);

  // Handle pagination and focus on detailData changes
  // useEffect(() => {
  //   // Check if a new row was added by comparing length and checking if last row is empty
  //   if (
  //     detailData.length > prevDetailDataLength.current &&
  //     detailData.length > 0 &&
  //     detailData[detailData.length - 1].it_code === ''
  //   ) {
  //     // New empty row added
  //     const newPage = Math.ceil(detailData.length / rowsPerPage);
  //     setPaginationPage(newPage);
  //     setFocusedRowIndex(detailData.length - 1);
  //   } else if (detailData.length !== prevDetailDataLength.current) {
  //     // Data length changed (e.g., query or delete), reset to page 1
  //     setPaginationPage(1);
  //     setFocusedRowIndex(0);
  //   }
  //   // Update prevDetailDataLength
  //   prevDetailDataLength.current = detailData.length;
  // }, [detailData, setFocusedRowIndex]);


  useEffect(() => {
  // Check if a new row was added
  if (
    detailData.length > prevDetailDataLength.current &&
    detailData.length > 0 &&
    detailData[detailData.length - 1].it_code === ''
  ) {
    // New empty row added → go to last page
    const newPage = Math.ceil(detailData.length / rowsPerPage);
    setPaginationPage(newPage);
    setFocusedRowIndex(detailData.length - 1);
  } 
  // If rows were deleted
  else if (detailData.length < prevDetailDataLength.current) {
    // Stay on current page, adjust focus if needed
    const newTotalPages = Math.ceil(detailData.length / rowsPerPage) || 1;
    setPaginationPage((prev) => Math.min(prev, newTotalPages));

    setFocusedRowIndex((prev) => {
      // If focused row deleted, move focus to previous row in page
      return Math.min(prev, detailData.length - 1);
    });
  }

  prevDetailDataLength.current = detailData.length;
}, [detailData]);



  const makeFocusOnTableRow = (rowIndex, id) => {
    setFocusedRowIndex(rowIndex); // Update focused row
  };

  const totalPages = Math.ceil(detailData.length / rowsPerPage);
  const paginatedData = detailData.slice(
    (paginationPage - 1) * rowsPerPage,
    paginationPage * rowsPerPage
  );

  const handlePreviousPage = () => {
    if (paginationPage > 1) {
      const newPage = paginationPage - 1;
      setPaginationPage(newPage);
      const firstIndex = (newPage - 1) * rowsPerPage;
      setFocusedRowIndex(firstIndex);
    }
  };

  const handleNextPage = () => {
    if (paginationPage < totalPages) {
      const newPage = paginationPage + 1;
      setPaginationPage(newPage);
      const firstIndex = (newPage - 1) * rowsPerPage;
      setFocusedRowIndex(firstIndex);
    }
  };

  const handleDoubleClick = (field, rowIndex) => {
    if (['Update'].includes(formStatus)) {
      setHelpFor(field);
      setHelpListHeader(itCodeHelpListHeader);
      handleHelpList(true, rowIndex);
    }
  };



  return (
    <Form id="item-stock-detail" className="mt-1">
      <div className="table-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Item Stock Opn. Bal</span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {(formStatus === 'Insert' || formStatus === 'Update') && (
            <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} style={{ marginRight: '3px', padding: '2px 6px' }}>
              Add Row
            </ButtonUi>
          )}
          <ButtonUi
            color="secondary"
            onClick={handlePreviousPage}
            disabled={paginationPage === 1}
            style={{ marginRight: '3px', padding: '2px 6px' }}
          >
            Previous
          </ButtonUi>
          <span style={{ marginRight: '3px', padding: '2px 6px' }}>
            Page {paginationPage} of {totalPages || 1}
          </span>
          <ButtonUi
            color="secondary"
            onClick={handleNextPage}
            disabled={paginationPage === totalPages || totalPages === 0}
            style={{ padding: '2px 6px' }}
          >
            Next
          </ButtonUi>
        </span>
      </div>
      <div className="table-wrapper-v3">
        <SimpleBar forceVisible="y" autoHide={false}>
          <div className="table-sticky-wrapper" style={{ height: '120px', maxHeight: '120px' }}>
            <Table hover>
              <thead>
                <tr>
                  {(formStatus === 'Insert' || formStatus === 'Update') && <th>Actions</th>}
                  {DetailStockHeader.map((header, index) => (
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
                      {header.isHelpExist && (<FcInfo title="Info" />)}
                      
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((data, index) => {
                  const globalIndex = (paginationPage - 1) * rowsPerPage + index;
                  return (
                    <tr
                      key={data.id}
                      onFocus={() => makeFocusOnTableRow(globalIndex, data.id)}
                      style={{
                        border: globalIndex === focusedRowIndex ? '2px solid black' : 'none',
                      }}
                      tabIndex={0}
                    >
                      {(formStatus === 'Insert' || formStatus === 'Update') && (
                        <td>
                          <RowAction
                            formStatus={formStatus}
                            canDelete={detailData.length > 0}
                            onDelete={() => handleDelete(data, globalIndex)}
                          />
                        </td>
                      )}
                      <td className="table_cell">
                        <TextField
                          required
                          type="text"
                          name="it_code"
                          value={data?.it_code || ''}
                          maxLength={20}
                          onChange={(e) => handleChange('detailData', 'it_code', e.target.value, globalIndex, e)}
                          onDoubleClick={() => handleDoubleClick('item', globalIndex)}
                          //  onBlur= {(e)=>handleValidateField(e,formStatus)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          name="item_name"
                          value={data?.item_name || ''}
                          onChange={(e) => handleChange('detailData', 'item_name', e.target.value, globalIndex, e)}
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          name="catalog_code"
                          value={data?.catalog_code || ''}
                          onChange={(e) => handleChange('detailData', 'catalog_code', e.target.value, globalIndex, e)}
                          disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="number"
                          name="yrop_qtyok"
                          value={data?.yrop_qtyok ?? 0}
                          //  value={data.yrop_qtyok !== null && data.yrop_qtyok !== undefined ? Number(data.yrop_qtyok).toFixed(3) : ''}
                          onChange={(e) => handleChange('detailData', 'yrop_qtyok', e.target.value, globalIndex, e)}
                          
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="number"
                          name="yrop_qtyre"
                           value={data?.yrop_qtyre ?? 0}
                          //  value={data.yrop_qtyre !== null && data.yrop_qtyre !== undefined ? Number(data.yrop_qtyre).toFixed(3) : ''}
                          onChange={(e) => handleChange('detailData', 'yrop_qtyre', e.target.value, globalIndex, e)}
                          
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
  );
};

export default ItemStockOpeningMstrDetail;







// import React, { useState, useEffect, useRef } from 'react';
// import TextField from '../../../../components/basic/textField';
// import { Form, Table } from 'reactstrap';
// import { DetailStockHeader, handleValidateField, itCodeHelpListHeader } from './Item_stock_opening_mstr_helper';
// import SimpleBar from 'simplebar-react';
// import ButtonUi from '../../../../components/basic/button';
// import RowAction from '../../../../components/common/rowAction';
// import { FcInfo } from 'react-icons/fc'
// import toast from 'react-hot-toast';

// const ItemStockOpeningMstrDetail = ({
//   detailData,
//   setDetailData,
//   handleChange,
//   formStatus,
//   triggerAddRow,
//   handleHelpList = () => {},
//   setHelpFor,
//   setHelpListHeader,
//   setFocusedRowIndex,
//   focusedRowIndex,
//   paginationPage,
//   setPaginationPage,
// }) => {
//   // const [paginationPage, setPaginationPage] = useState(1);
//   const rowsPerPage = 9;
//   const prevDetailDataLength = useRef(detailData.length);

//   // Handle pagination and focus on detailData changes
//   useEffect(() => {
//     // Check if a new row was added by comparing length and checking if last row is empty
//     if (
//       detailData.length > prevDetailDataLength.current &&
//       detailData.length > 0 &&
//       detailData[detailData.length - 1].it_code === ''
//     ) {
//       // New empty row added
//       const newPage = Math.ceil(detailData.length / rowsPerPage);
//       setPaginationPage(newPage);
//       setFocusedRowIndex(detailData.length - 1);
//     } else if (detailData.length !== prevDetailDataLength.current) {
//       // Data length changed (e.g., query or delete), reset to page 1
//       setPaginationPage(1);
//       setFocusedRowIndex(0);
//     }
//     // Update prevDetailDataLength
//     prevDetailDataLength.current = detailData.length;
//   }, [detailData, setFocusedRowIndex]);

//   const makeFocusOnTableRow = (rowIndex, id) => {
//     setFocusedRowIndex(rowIndex); // Update focused row
//   };

//   const totalPages = Math.ceil(detailData.length / rowsPerPage);
//   const paginatedData = detailData.slice(
//     (paginationPage - 1) * rowsPerPage,
//     paginationPage * rowsPerPage
//   );

//   const handlePreviousPage = () => {
//     if (paginationPage > 1) {
//       setPaginationPage(paginationPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (paginationPage < totalPages) {
//       setPaginationPage(paginationPage + 1);
//     }
//   };

//   const handleDoubleClick = (field, rowIndex) => {
//     if (['Update'].includes(formStatus)) {
//       setHelpFor(field);
//       setHelpListHeader(itCodeHelpListHeader);
//       handleHelpList(true, rowIndex);
//     }
//   };

//   const handleDelete = (data, rowIndex) => {
//     const updatedDetailData = detailData.filter((_, i) => i !== rowIndex);
//     setDetailData(updatedDetailData);
//     if (paginatedData.length === 1 && paginationPage > 1) {
//       setPaginationPage(paginationPage - 1);
//     }
//   };

//   const handleQtyError = (data) => {
//         if (data < 0) {
//             toast.error('This value can not be negative')
//             return true
//         }
//         return false
//     }


//   return (
//     <Form id="item-stock-detail" className="mt-1">
//       <div className="table-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span>Item Stock Opn. Bal</span>
//         <span style={{ display: 'flex', alignItems: 'center' }}>
//           {(formStatus === 'Insert' || formStatus === 'Update') && (
//             <ButtonUi color="primary" className="add-action" onClick={triggerAddRow} style={{ marginRight: '3px', padding: '2px 6px' }}>
//               Add Row
//             </ButtonUi>
//           )}
//           <ButtonUi
//             color="secondary"
//             onClick={handlePreviousPage}
//             disabled={paginationPage === 1}
//             style={{ marginRight: '3px', padding: '2px 6px' }}
//           >
//             Previous
//           </ButtonUi>
//           <span style={{ marginRight: '3px', padding: '2px 6px' }}>
//             Page {paginationPage} of {totalPages || 1}
//           </span>
//           <ButtonUi
//             color="secondary"
//             onClick={handleNextPage}
//             disabled={paginationPage === totalPages || totalPages === 0}
//             style={{ padding: '2px 6px' }}
//           >
//             Next
//           </ButtonUi>
//         </span>
//       </div>
//       <div className="table-wrapper-v3">
//         <SimpleBar forceVisible="y" autoHide={false}>
//           <div className="table-sticky-wrapper" style={{ height: '120px', maxHeight: '120px' }}>
//             <Table hover>
//               <thead>
//                 <tr>
//                   {(formStatus === 'Insert' || formStatus === 'Update') && <th>Actions</th>}
//                   {DetailStockHeader.map((header, index) => (
//                     <th
//                       key={index}
//                       data-required={header.required || false}
//                       style={{
//                         whiteSpace: 'nowrap',
//                         width: header.width,
//                         minWidth: header.width,
//                       }}
//                     >
//                       {header.label}
//                       {header.isHelpExist && (<FcInfo title="Info" />)}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedData.map((data, index) => {
//                   const globalIndex = (paginationPage - 1) * rowsPerPage + index;
//                   return (
//                     <tr
//                       key={data.id}
//                       onFocus={() => makeFocusOnTableRow(globalIndex, data.id)}
//                       style={{
//                         border: globalIndex === focusedRowIndex ? '2px solid black' : 'none',
//                       }}
//                       tabIndex={0}
//                     >
//                       {(formStatus === 'Insert' || formStatus === 'Update') && (
//                         <td>
//                           <RowAction
//                             formStatus={formStatus}
//                             canDelete={detailData.length > 0}
//                             onDelete={() => handleDelete(data, globalIndex)}
//                           />
//                         </td>
//                       )}
//                       <td className="table_cell">
//                         <TextField
//                           required
//                           type="text"
//                           name="it_code"
//                           value={data.it_code || ''}
//                           maxLength={20}
//                           onChange={(e) => handleChange('detailData', 'it_code', e.target.value, globalIndex, e)}
//                           onDoubleClick={() => handleDoubleClick('item', globalIndex)}
//                            onBlur= {(e)=>handleValidateField(e,formStatus)}
//                         />
//                       </td>
//                       <td className="table_cell">
//                         <TextField
//                           type="text"
//                           name="item_name"
//                           value={data.item_name || ''}
//                           onChange={(e) => handleChange('detailData', 'item_name', e.target.value, globalIndex, e)}
//                           disabled
//                         />
//                       </td>
//                       <td className="table_cell">
//                         <TextField
//                           type="text"
//                           name="catalog_code"
//                           value={data.catalog_code || ''}
//                           onChange={(e) => handleChange('detailData', 'catalog_code', e.target.value, globalIndex, e)}
//                           disabled
//                         />
//                       </td>
//                       <td className="table_cell">
//                         <TextField
//                           type="number"
//                           name="yrop_qtyok"
//                           // value={data.yrop_qtyok || ''}
//                            value={data.yrop_qtyok !== null && data.yrop_qtyok !== undefined ? Number(data.yrop_qtyok).toFixed(3) : ''}
//                           onChange={(e) => handleChange('detailData', 'yrop_qtyok', e.target.value, globalIndex, e)}
//                           onBlur={async (e) => {
//                                if (formStatus === "Update") {
//                                  const quantity = Number(e.target.value);
//                               const hasLocalError = handleQtyError(quantity);
//                                  if (hasLocalError) {
//                                      e.target.focus()
//                                      return;
//                                  }                               
//                                  }
//                                  }}
//                         />
//                       </td>
//                       <td className="table_cell">
//                         <TextField
//                           type="number"
//                           name="yrop_qtyre"
//                           // value={data.yrop_qtyre || ''}
//                            value={data.yrop_qtyre !== null && data.yrop_qtyre !== undefined ? Number(data.yrop_qtyre).toFixed(3) : ''}
//                           onChange={(e) => handleChange('detailData', 'yrop_qtyre', e.target.value, globalIndex, e)}
//                            onBlur={async (e) => {
//                                if (formStatus === "Update") {
//                                  const quantity = Number(e.target.value);
//                               const hasLocalError = handleQtyError(quantity);
//                                  if (hasLocalError) {
//                                      e.target.focus()
//                                      return;
//                                  }                               
//                                  }
//                                  }}
//                         />
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Table>
//           </div>
//         </SimpleBar>
//       </div>
//     </Form>
//   );
// };

// export default ItemStockOpeningMstrDetail;