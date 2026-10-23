

import React, { useMemo, useRef } from "react";
import { Download } from "lucide-react";
import ReportGrid from "../../../components/AppLayout/Reports/reportGrid";

const MemberLoanModal = ({
  open,
  onClose,
  loan,
  members = [],
  loading,
}) => {

  
  const reportGridRef = useRef(null);

  const rows = useMemo(
    () =>
      members.map((row, index) => ({
        ...row,
        id: index + 1,
        s_no: index + 1,
      })),
    [members]
  );

  const columns = useMemo(
    () => [
      {
        field: "s_no",
        headerName: "S. No.",
        width: 90,
        align: "center",
      },
      {
        field: "member_name",
        headerName: "Member Name",
        flex: 1,
      },
      {
        field: "loan_date",
        headerName: "Loan Date",
        width: 140,
        align: "center",
      },
      {
        field: "loan_amount",
        headerName: "Loan Amount",
        width: 160,
        align: "right",
      },
      {
        field: "no_of_install",
        headerName: "No. of Installment",
        width: 170,
        align: "center",
      },
    ],
    []
  );

  if (!open) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,.45)",
      }}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        style={{ maxWidth: "90vw",}}
        >

        <div className="modal-content"
       style={{ height: "min(90vh, 900px)",}}
         >

          {/* Header */}
         <div className="modal-header d-flex justify-content-between align-items-center">

  {/* Left */}
  <div className="d-flex align-items-center flex-wrap gap-3 ms-3">
    <h5 className="modal-title fw-bold mb-0">
      Loan Members
    </h5>

    <span className="text-muted">|</span>

    <span className="fw-bold">Loan Type :</span>

    <span
      className="badge px-3 py-2"
      style={{
        backgroundColor: loan?.color,
        color: "#fff",
      }}
    >
      {loan?.loan_purpose_desc}
    </span>

    <span className="text-muted">|</span>

    <span className="fw-bold">Total Members :</span>

    <span className="badge bg-success px-3 py-2">
      {loan?.member_count}
    </span>

  </div>

  {/* Right */}
  <div className="d-flex align-items-center  gap-4 me-3">

    <button
      className={`btn btn-sm ${
    rows.length === 0 ? "btn-secondary" : "btn-success"
  }`}
      style={{
        backgroundColor: loan?.color,
        borderColor: loan?.color,
      }}
      title={
    rows.length === 0
      ? "No data available to export"
      : "Download Excel"
  }
  disabled={rows.length === 0}
  onClick={() => reportGridRef.current?.exportExcel()}
    >
      <Download size={18} />
    </button>

    <button
      type="button"
      className="btn-close"
      onClick={onClose}
    />

  </div>

</div>

          {/* Body */}
         <div className="modal-body d-flex flex-column"
                style={{
                    overflow: "hidden",
                }}
                >

         

       

        <div
  className="border rounded-3 overflow-hidden bg-white"
  style={{
    flex: 1,
    minHeight: 0,
  }}
>

  <div
    className="alert alert-info rounded-0 mb-0 py-2 px-3 border-bottom"
  >
    <strong>Note :</strong>{" "}
    Member loan details of the selected loan type are displayed.
  </div>

  <ReportGrid
    ref={reportGridRef}
    columns={columns}
    rowsData={rows}
    loading={loading}
    showHeaderMenu={false}
    reportTitle={`Loan Members - ${loan?.loan_purpose_desc}`}
    gridHeight="calc(100% - 44px)"
  />

</div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MemberLoanModal;