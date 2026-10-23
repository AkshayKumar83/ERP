import React, { useState, useEffect, useRef} from "react";
import { Col, Form, Row, Table } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import SimpleBar from "simplebar-react";
import RowAction from "../../../../components/common/rowAction";
import TextField from "../../../../components/basic/textField";
import {
  billNoHelpListHeader,
  detailHeader,
  purposeHelpListHeader,
  // journalVoucherMRIRInitData,
} from "./journal_voucher_helper";

import Checkbox from "../../../../components/basic/checkbox";
import {
  accHelpListHeader,
  costHelpListHeader,
  empHelpListHeader,
} from "./journal_voucher_helper";
import { APP_PROD_API } from "../../../../utils/api";


const JournalVoucherDetails = ({
  detailData = [{}],
  formData = {},
  purpose,
  handleChange,
  formStatus,
  triggerAddRow,
  setHelpFor,
  setHelpListHeader,
  handleHelpList = () => {},
  focusedRowIndex,
  setFocusedRowIndex,
  triggerDeleteRow,
   paginationPage,
  setPaginationPage,
  setNarrationData,
  user
}) => {

  const voucherIdRef = useRef(null);
const prevVoucherId = useRef(null);

  useEffect(() => {
  if (formData?.voucher_id) {
    voucherIdRef.current = formData.voucher_id;
  }
}, [formData]);



useEffect(() => {
  if (formData?.voucher_id !== prevVoucherId.current) {
    setPaginationPage(1);
    prevVoucherId.current = formData?.voucher_id;
  }
}, [formData?.voucher_id]);

// useEffect(() => {
//   if (formData?.detailTotal) {
//     totalRecordsRef.current = formData.detailTotal;
//   }
// }, [formData]);

// useEffect(() => {
//   pageRef.current = paginationPage;
// }, [paginationPage]);

const rowsPerPage = 14;
const prevDetailDataLength = useRef(detailData.length);

const totalRecords = detailData.length;
const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

const startIndex = (paginationPage - 1) * rowsPerPage;

const visibleRows = detailData.slice(
  startIndex,
  startIndex + rowsPerPage
);
 
 


// useEffect(() => {

//   if(formStatus !== "Insert") return;

//   if (
//     detailData.length > prevDetailDataLength.current &&
//     detailData.length > 0 &&
//     detailData[detailData.length - 1].it_code === ''
//   ) {
//     const newPage = Math.ceil(detailData.length / rowsPerPage);
//     setPaginationPage(newPage);
//     setFocusedRowIndex(detailData.length - 1);
//   } 
//   else if (detailData.length < prevDetailDataLength.current) {
//     const newTotalPages = Math.ceil(detailData.length / rowsPerPage) || 1;

//     setPaginationPage((prev) => Math.min(prev, newTotalPages));

//     setFocusedRowIndex((prev) => {
//       return Math.min(prev, detailData.length - 1);
//     });
//   }

//   prevDetailDataLength.current = detailData.length;

// }, [detailData.length, formStatus]);


useEffect(() => {
  if (formStatus !== "Insert" && formStatus !== "Update") return;

  if (
    detailData.length > prevDetailDataLength.current &&
    detailData.length > 0 &&
    detailData[detailData.length - 1].it_code === ""
  ) {
    const newPage = Math.ceil(detailData.length / rowsPerPage);

    setPaginationPage(newPage);
    setFocusedRowIndex(detailData.length - 1);
  } 
  else if (detailData.length < prevDetailDataLength.current) {
    const newTotalPages =
      Math.ceil(detailData.length / rowsPerPage) || 1;

    setPaginationPage((prev) =>
      Math.min(prev, newTotalPages)
    );

    setFocusedRowIndex((prev) =>
      Math.min(prev, detailData.length - 1)
    );
  }

  prevDetailDataLength.current = detailData.length;
}, [detailData.length, formStatus]);


// const fetchDetailPage = async (page) => {
//   try {

//     const offset = (page - 1) * rowsPerPage;

//     const queryParams = new URLSearchParams({
//       formStatus: "Query",
//     voucher_id: voucherIdRef.current,
//       limit: rowsPerPage,
//       detailOffset: offset,
//       appDivisionId :user?.global_division_id,
//       appFinYear:user?.global_fin_year
//     });

//     const res = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_JOURNAL_VOUCHER_DATA}?${queryParams.toString()}`,
//       {
//         method: "GET",
//         credentials: "include",
//       }
//     );

//     const data = await res.json();
//     if (!res.ok) return;

//  const formattedData = (data?.tdfmtranData || []).map((row) => {

//   if (row.db_cr === "D") {
//     row.db_amount = Number(row.amount);
//     row.cr_amount = 0;
//   } else if (row.db_cr === "C") {
//     row.cr_amount = Number(row.amount);
//     row.db_amount = 0;
//   }

//   return row;
// });

// setNarrationData(formattedData);

// //  totals calculate
// // formData.db_total = Number(data?.db_total || 0);
// // formData.cr_total = Number(data?.cr_total || 0);

//     setPaginationPage(page);

//   } catch (err) {
//     console.error("Pagination API error", err);
//   }
// };


const handlePreviousPage = () => {
  if (paginationPage > 1) {
    setPaginationPage((prev) => prev - 1);
  }
};

const handleNextPage = () => {
  if (paginationPage < totalPages) {
    setPaginationPage((prev) => prev + 1);
  }
};
   
  // const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [isMrirModelOpen, setIsMrirModelOpen] = useState(false);
  // const [mrirData, setMrirData] = useState([{ ...journalVoucherMRIRInitData }]);
  const toggleMrirModal = () => setIsMrirModelOpen(!isMrirModelOpen);

  const handleDoubleClick = (field, header) => {
    if (formStatus && focusedRowIndex !== null) {
      setHelpFor(field);
      setHelpListHeader(header);
      handleHelpList(true);
      // setActiveRowIndex(focusedRowIndex);
      
    }
  };

  const handleChangeDBCR = (value, rowIndex, e) => {
    const newValue = value.toUpperCase();
    if (["C", "D", ""].includes(newValue)) {
      handleChange("detailData", "db_cr", newValue, rowIndex, e);
    }

    // if (newValue === "C") {
    //   handleChange("detailData", "db_amount", "", rowIndex, e);
    // } else if (newValue === "D") {
    //   handleChange("detailData", "cr_amount", "", rowIndex, e);
    // }
  };

  const makeFocusOnTableRow = (rowIndex, id) => {
    const entry = detailData.find((entry) => entry.id === id);
    setFocusedRowIndex(rowIndex);
    // triggerFamilyDetail(id)
  };

  function handleDelete() {}
  function handleUpdate() {}

  return (
    <>
      <Form id="journal-voucher-detail-form" className="">
       <div className="table-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Journal Voucher </span>
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
                          <span style={{ marginLeft: '6px', padding: '2px 6px', fontWeight: "700" }}>
                       Total Records : {totalRecords || 0}
                           </span>
                        </span>
  </div>

        
        <div
          className="table-wrapper-v3"
          // style={{ height: "140px", maxHeight: "140px" }}
        >
          <SimpleBar forceVisible="y" autoHide={false}>
            <div className="table-sticky-wrapper">
              <Table hover>
                <thead>
                  <tr>
                    {(formStatus === "Insert" || formStatus === "Update") && (
                      <th className="">Actions</th>
                    )}
                    {detailHeader?.map((header, index) => (
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
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* <tbody>
                  {detailData.map((data, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onFocus={() => makeFocusOnTableRow(rowIndex, data.id)}
                      style={{
                        border: `${
                          rowIndex === focusedRowIndex
                            ? "2px solid black"
                            : "none"
                        }`,
                      }}
                      tabIndex={0}
                    >
                      {(formStatus === "Insert" || formStatus === "Update") && (
                        <td className="">
                          <RowAction
                            formStatus={formStatus}
                            canDelete={detailData.length > 1}
                            onDelete={() => triggerDeleteRow(data, rowIndex)}
                            // onUpdate={handleUpdate ? () => handleUpdate(data) : undefined}
                          />
                        </td>
                      )}
                      <td className="table_cell">
                        <TextField
                          type="text"
                          // required
                          name="remarks"
                          value={data.remarks || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "remarks",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          required
                          name="acc_no"
                          value={data.acc_no || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "acc_no",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          onDoubleClick={() =>
                            handleDoubleClick(
                              "acc",
                              accHelpListHeader,
                              rowIndex
                            )
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          // required
                          name="bill_no"
                          value={data.bill_no || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "bill_no",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                         
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="date"
                          //required
                          name="bill_dt"
                          value={data.bill_dt || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "bill_dt",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          // disabled
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          // required
                          name="cost"
                          value={data.cost || ""}
                          maxLength={30}
                          autocomplete="off"
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "cost",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          onDoubleClick={() => handleDoubleClick("cost", costHelpListHeader, rowIndex)}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="text"
                          name="pur_desc"
                          autocomplete="off"
                          value={data.pur_desc || ""}
                          // maxLength={30}
                          onChange={(e) => handleChange("detailData", "pur_desc", e.target.value, rowIndex, e)}
                          onDoubleClick={() => handleDoubleClick("pur_code", purposeHelpListHeader, rowIndex)}
                        />
                        
                      </td>
                      <td className="table_cell">
                        <TextField
                          required
                          name="db_cr"
                          value={data.db_cr || ""}
                          maxLength={1}
                          onChange={(e) =>
                            handleChangeDBCR(e.target.value, rowIndex, e)
                          }
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          style={{ textAlign: "right" }}
                          type="number"
                          required={data?.db_cr === 'D'}
                          name="db_amount"
                          value={data.db_amount || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "db_amount",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled={data?.db_cr == "C" ? true : false}
                        />
                      </td>
                      <td className="table_cell">
                        <TextField
                          type="number"
                         required={data?.db_cr === 'C'}
                          name="cr_amount"
                          value={data.cr_amount || ""}
                          maxLength={30}
                          onChange={(e) =>
                            handleChange(
                              "detailData",
                              "cr_amount",
                              e.target.value,
                              rowIndex,
                              e
                            )
                          }
                          disabled={data?.db_cr == "D" ? true : false}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody> */}
            <tbody>
            {visibleRows.map((data, index) => {
              const actualIndex = startIndex + index;
                  return (
      <tr
        key={actualIndex}
        onFocus={() => makeFocusOnTableRow(actualIndex, data.id)}
        onKeyDown={(e)=> {
          if(e.key === "Enter"){
            e.preventDefault();
            triggerAddRow();
          }
        }}
        style={{
          border:
            actualIndex === focusedRowIndex
              ? "2px solid black"
              : "none",
        }}
        tabIndex={0}
      >
        {(formStatus === "Insert" || formStatus === "Update") && (
          <td>
            <RowAction
              formStatus={formStatus}
              canDelete={detailData.length > 1}
              onDelete={() => triggerDeleteRow(data, actualIndex)}
            />
          </td>
        )}

        <td className="table_cell">
          <TextField
            type="text"
            name="remarks"
            value={data.remarks || ""}
            // maxLength={30}
            onChange={(e) =>
              handleChange(
                "detailData",
                "remarks",
                e.target.value,
                actualIndex,
                e
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            required
            name="acc_no"
            value={data.acc_no || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange(
                "detailData",
                "acc_no",
                e.target.value,
                actualIndex,
                e
              )
            }
            onDoubleClick={() =>
              handleDoubleClick(
                "acc",
                accHelpListHeader,
                actualIndex
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            name="bill_no"
            value={data.bill_no || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange(
                "detailData",
                "bill_no",
                e.target.value,
                actualIndex,
                e
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="date"
            name="bill_dt"
            value={data.bill_dt || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "bill_dt",
                e.target.value,
                actualIndex,
                e
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            name="cost"
            value={data.cost || ""}
            maxLength={30}
            onChange={(e) =>
              handleChange(
                "detailData",
                "cost",
                e.target.value,
                actualIndex,
                e
              )
            }
            onDoubleClick={() =>
              handleDoubleClick(
                "cost",
                costHelpListHeader,
                actualIndex
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            type="text"
            name="pur_desc"
            value={data.pur_desc || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "pur_desc",
                e.target.value,
                actualIndex,
                e
              )
            }
            onDoubleClick={() =>
              handleDoubleClick(
                "pur_code",
                purposeHelpListHeader,
                actualIndex
              )
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            required
            name="db_cr"
            value={data.db_cr || ""}
            maxLength={1}
            onChange={(e) =>
              handleChangeDBCR(e.target.value, actualIndex, e)
            }
          />
        </td>

        <td className="table_cell">
          <TextField
            style={{ textAlign: "right" }}
            type="number"
            required={data?.db_cr === "D"}
            name="db_amount"
            value={data.db_amount || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "db_amount",
                e.target.value,
                actualIndex,
                e
              )
            }
            disabled={data?.db_cr === "C"}
          />
        </td>

        <td className="table_cell">
          <TextField
            type="number"
            required={data?.db_cr === "C"}
            name="cr_amount"
            value={data.cr_amount || ""}
            onChange={(e) =>
              handleChange(
                "detailData",
                "cr_amount",
                e.target.value,
                actualIndex,
                e
              )
            }
            disabled={data?.db_cr === "D"}
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

      <>
        {/* -------- Row 1 : Employee + Account + Totals -------- */}
        <Row>
          {/* Employee Code (Reduced) */}
          <Col md={1}>
            <TextField
              type="text"
              label="Emp Code"
              value={detailData?.[focusedRowIndex]?.emp_cd || ""}
              onChange={(e) =>
                handleChange(
                  "detailData",
                  "emp_cd",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              onDoubleClick={() =>
                handleDoubleClick("emp", empHelpListHeader, focusedRowIndex)
              }
            />
          </Col>

          {/* Employee Name (Wide) + TDS Deposit */}
          <Col md={3} className="mt-4 ">
            <TextField
              type="text"
              value={detailData?.[focusedRowIndex]?.emp_name || ""}
              disabled
            />
          </Col>

          <Col md={1} className="mt-4 d-flex align-items-center gap-3">
            <Checkbox
              text="TDS Deposit"
              onChange={(e) =>
                handleChange(
                  "detailData",
                  "tds_debit_entry",
                  e.target.checked ? "Y" : "N",
                  focusedRowIndex,
                  e
                )
              }
              checked={detailData?.[focusedRowIndex]?.tds_debit_entry === "Y"}
            />
          </Col>

          

          <Col md={3} className="">
            <TextField
              type="text"
              label="Account Desc."
              value={detailData?.[focusedRowIndex]?.acc_desc || ""}
              disabled
            />
          </Col>

          <Col md={2}>
            <TextField
              type="number"
              label="Total Debit Amount"
              value={formData?.db_total || ""}
              disabled
            />
          </Col>

          <Col md={2}>
            <TextField
              type="number"
              label="Total Credit Amount"
              value={formData?.cr_total || ""}
              disabled
            />
          </Col>
        </Row>

        {/* -------- Row 2 : TDS Section -------- */}
        <Row className="mt-2">
          <Col md={2}>
            <TextField
              type="number"
              label="TDS Credit Amount"
              onChange={(e) =>
                handleChange(
                  "detailData",
                  "tds_cr_amt",
                  e.target.value,
                  focusedRowIndex,
                  e
                )
              }
              disabled
            />
          </Col>

          <Col md={1}>
            <TextField
              type="text"
              label="TDS %"
              value={detailData?.[focusedRowIndex]?.tds_perc || ""}
              disabled
            />
          </Col>

          <Col md={2}>
            <TextField
              type="text"
              label="TDS Amount"
              value={detailData?.[focusedRowIndex]?.tds_amt || ""}
              disabled
            />
          </Col>

          <Col md={1}>
            <TextField
              type="text"
              label="Surcharge %"
              value={detailData?.[focusedRowIndex]?.tds_sur_perc || ""}
              disabled
            />
          </Col>

          <Col md={2}>
            <TextField
              type="text"
              label="Surcharge Amount"
              value={detailData?.[focusedRowIndex]?.tds_sur_amt || ""}
              disabled
            />
          </Col>

          <Col md={1}>
            <TextField
              type="text"
              label="Edu. Cess %"
              value={detailData?.[focusedRowIndex]?.tds_cess_perc || ""}
              disabled
            />
          </Col>

          <Col md={2}>
            <TextField
              type="text"
              label="Edu. Cess Amount"
              value={detailData?.[focusedRowIndex]?.tds_cess_amt || ""}
              disabled
            />
          </Col>
        </Row>
      </>

      {/* {isMrirModelOpen && (
        <JournalVoucherMRIR
          mrirData={mrirData}
          // handleChangeMRIR={handleChangeMRIR}
          formStatus={formStatus}
          // triggerAddRowMRIR={triggerAddRowMRIR}
          isMrirModelOpen={isMrirModelOpen}
          toggleMrirModal={toggleMrirModal}
        />
      )} */}
    </>
  );
};

export default JournalVoucherDetails;
