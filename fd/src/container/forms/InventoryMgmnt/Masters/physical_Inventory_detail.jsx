import React, { useEffect, useRef } from "react";
import TextField from "../../../../components/basic/textField";
import { Col, Row, Table, Form, Card } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import { handleValidateDetailsField, itCodeHelpListHeader, physicalInvHeader } from "./physical_Inventory_helper";
import { FcInfo } from "react-icons/fc";

const PhysicalInventoryDetail = ({detailData,setDetailData,formStatus,handleChange,triggerAddRow,handleDelete,
  focusedRowIndex,setFocusedRowIndex,handleHelpList = () => {},
  setHelpFor,
  setHelpListHeader,
  paginationPage,
  setPaginationPage,
}) => {

  const rowsPerPage = 9;
  const prevDetailDataLength = useRef(detailData.length);


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
  
 
  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
  };

   const handleDoubleClick = (field, rowIndex) => {
      if (['Insert','Update'].includes(formStatus)) {
        setHelpFor(field);
        setHelpListHeader(itCodeHelpListHeader);
        handleHelpList(true, rowIndex);
      }
    };
  

  return (
    <>
          <Row className="mb-2">
            <Col  xl={12}>
              <Form id="item-phy-inv" className="">
                {/* <div className="table-title">
                  <span>Physical Inv. Item</span>
                  {(formStatus === "Insert" || formStatus === "Update") && (
                    <ButtonUi
                      color="primary"
                      className="add-action"
                       onClick={() => triggerAddRow("detail")}
                    >
                      Add Row
                    </ButtonUi>
                  )}
                </div> */}
                      <div className="table-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Item Stock Opn. Bal</span>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {(formStatus === 'Insert' || formStatus === 'Update') && (
                            <ButtonUi color="primary" className="add-action"  onClick={() => triggerAddRow("detail")} 
                            style={{ marginRight: '3px', padding: '2px 6px' }}>
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
                <div
                  className="table-wrapper-v3"
                  // style={{ height: "180px", maxHeight: "180px" }}
                >
                  <SimpleBar forceVisible="y" autoHide={false}>
                     <div className="table-sticky-wrapper" style={{ height: '120px', maxHeight: '120px' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          {(formStatus === "Insert" ||
                            formStatus === "Update") && (
                            <th
                              style={{ width: "80px" }}
                              className="sticky-column left"
                            >
                              Actions
                            </th>
                          )}
                          {physicalInvHeader.map((header, index) => (
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
                              {header.isHelpExist && (<FcInfo title="Info" />)}
                              {header.required && (
                                <span className='required-asterisk'>*</span>
                               )}
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
                                    onDelete={() =>  handleDelete("detail", globalIndex)}
                                    // onUpdate= {handleUpdate  ? () => handleUpdate(data)  : undefined }
                                  />
                                </td>
                              )}
                              <td className="table_cell">
                                <TextField
                                  type="text"
                                  name="it_code"
                                   value={data?.it_code || ""}
                                  maxLength={20}
                                  onChange={(e) =>  handleChange(  "it_code",   e.target.value, e, "detail", globalIndex)}
                                   onDoubleClick={() => handleDoubleClick('item', globalIndex)}
                                    required
                                />
                              </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="it_name"
                                value={data?.it_name || ""}
                                onChange={(e) =>handleChange("it_name", e.target.value, e, "detail", globalIndex)}
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="cat_code"
                                 value={data?.cat_code || ""}
                                onChange={(e) =>handleChange("cat_code", e.target.value, e, "detail", globalIndex)}
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="drawing_no"
                                 value={data?.drawing_no || ""}
                                onChange={(e) =>handleChange("drawing_no",  e.target.value, e, "detail", globalIndex)}
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="um_code"
                                 value={data?.um_code || ""}
                                onChange={(e) =>handleChange("um_code",  e.target.value, e, "detail", globalIndex)}
                                disabled
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="it_ok_qty"
                                value={data?.it_ok_qty ?? 0}
                                maxLength={13}
                                onChange={(e) =>handleChange("it_ok_qty", e.target.value, e, "detail", globalIndex)}
                                required={data?.it_code}
                                onBlur={(e) => handleValidateDetailsField(e, formStatus, detailData,setDetailData, globalIndex)}
                                 
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="number"
                                name="it_rej_qty"
                                value={data?.it_rej_qty ?? 0}
                                maxLength={13}
                                onChange={(e) =>handleChange("it_rej_qty",e.target.value, e, "detail", globalIndex)}
                                required={data?.it_code}
                                onBlur={(e) => handleValidateDetailsField(e, formStatus, detailData,setDetailData, globalIndex)}
                              />
                            </td>
                              <td className="table_cell">
                              <TextField
                                type="text"
                                name="status_flag"
                                value={data?.status_flag || ""}
                                maxLength={1}
                                onChange={(e) =>handleChange("status_flag",e.target.value, e, "detail", globalIndex)}
                                disabled
                              />
                            </td>

                            </tr>
                          )})}
                      </tbody>
                    </Table>
                    </div>
                  </SimpleBar>
                </div>
              </Form>
            </Col>
          </Row>
    </>
  );
};

export default PhysicalInventoryDetail