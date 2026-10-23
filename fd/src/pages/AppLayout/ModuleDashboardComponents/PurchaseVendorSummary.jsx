


import React, { useMemo, useRef } from "react";
import { Download } from "lucide-react";
import ReportGrid from "../../../components/AppLayout/Reports/reportGrid";

const PurchaseVendorSummary = ({
  open,
  onClose,
  vendor,
  data = [],
  poType,
}) => {

  const reportGridRef = useRef(null);

  const rows = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        id: row.po_id,
      })),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        field: "po_no",
        headerName: "PO No",
        width: 120,
      },
      {
        field: "po_date",
        headerName: "PO Date",
        width: 130,
      
      },
      {
        field: "po_eff_dt",
        headerName: "PO Eff. Date",
        width: 130,
        
      },
      {
        field: "order_qty",
        headerName: "Order Qty",
        width: 140,
        align: "right",
      },
      {
        field: "received_qty",
        headerName: "Received Qty",
        width: 150,
        align: "right",
      },
      {
        field: "pending_qty",
        headerName: "Balance Qty",
        width: 150,
        align: "right",
      },
      {
        field: "ageing",
        headerName: "Ageing",
        width: 120,
        align: "right",
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
        style={{
          maxWidth: "95vw",
        }}
      >
        <div
          className="modal-content"
          style={{
            height: "90vh",
          }}
        >

          {/* Header */}

 <div className="modal-header d-flex justify-content-between align-items-center">

  {/* Left Section */}
  <div className="d-flex align-items-center flex-wrap ms-3">

    <h5 className="modal-title fw-bold mb-0">
  Vendor Wise Purchase Summary
</h5>

<span className="mx-2 text-muted">|</span>

<span className="badge bg-primary px-3 py-2">
  {vendor?.v_name}
</span>

<span className="mx-2 text-muted">|</span>

<span className="fw-semibold">
  Total PO :
</span>

<span className="badge bg-success ms-2 px-3 py-2">
  {rows.length}
</span>

  </div>

  {/* Right Section */}
  <div className="d-flex align-items-center gap-4 me-3">

   <button
  className={`btn btn-sm ${
    rows.length === 0 ? "btn-secondary" : "btn-success"
  }`}
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

          <div
            className="modal-body d-flex flex-column"
            style={{
              overflow: "hidden",
            }}
          >

            <div
    className="border rounded-2 overflow-hidden bg-white"
    style={{
        flex: 1,
        minHeight: 0,
    }}
>

   <div className="alert alert-info rounded-0 mb-0 py-2 px-3 border-bottom">
  <strong>Note :</strong>{" "}
  Only {poType === "A" ? "Purchase Advice" : "Purchase Orders"} having pending quantity (Ageing) are displayed.
</div>

    {/* <ReportGrid
        ref={reportGridRef}
        columns={columns}
        rowsData={rows}
        showHeaderMenu={false}
        reportTitle={`Vendor Wise Purchase Summary - ${vendor?.v_name}`}
        gridHeight="calc(100% - 44px)"
    /> */}

    {
rows.length === 0 ? (

<div className="d-flex flex-column justify-content-center align-items-center h-100">

    <h5 className="text-secondary">

        No pending {poType === "A"
            ? "Purchase Advice"
            : "Purchase Orders"} found.

    </h5>

    <p className="text-muted">

        All {poType === "A"
            ? "Purchase Advice"
            : "Purchase Orders"} have been fully received.

    </p>

</div>

) : (

<ReportGrid
    ref={reportGridRef}
    columns={columns}
    rowsData={rows}
    showHeaderMenu={false}
    reportTitle={`Vendor Wise Purchase Summary - ${vendor?.v_name}`}
    gridHeight="calc(100% - 44px)" />

)
}

</div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PurchaseVendorSummary;
