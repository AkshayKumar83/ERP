import React, { useRef, useState } from "react";
import { Row, Col, Form, Label } from "reactstrap";
import * as XLSX from "xlsx";
import ButtonUi from "../../../../components/basic/button";
import TextField from "../../../../components/basic/textField";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

const PriceListRateExcelUpload = ({ formStatus, onDataReady = () => {}, user }) => {
  const fileRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [uploadedRows, setUploadedRows] = useState([]);

  /* ---------------- Download Template ---------------- */
  const handleDownloadTemplate = () => {
    const template = [
      {
        item_code: "ITEM001",
        effective_date: "2026-01-01",
        basic_rate: "100.00",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RATE_TEMPLATE");
    XLSX.writeFile(wb, "price_list_rate_template.xlsx");
  };

  /* ---------------- Upload Excel ---------------- */
  const handleUpload = () => {
    if (!fileRef.current?.files?.length) {
      toast.error("Please select an Excel file");
      return;
    }

    const file = fileRef.current.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const base64 = e.target.result;

        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.UPLOAD_RATE_LIST_EXCEL
          }?form_status=${formStatus}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              file_base64: base64,
              user_id: user.id,
            }),
          }
        );

        const data = await res.json();

        if (data.type !== "success") {
          toast.error(data.message);
          return;
        }

        setUploadedRows(data.rows); // 🔥 DB DATA
        toast.success("Excel data uploaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Upload failed");
      }
    };

    reader.readAsDataURL(file);
  };

  //   if (formStatus !== "Insert") return null;


  const handleClearUploader=()=>{
    setFileName('')
    setUploadedRows([])
  }

  return (
    <Form className="mt-3">
      <Row className="mb-3">
        {/* LEFT: Upload Section */}
        <Col md={5}>
          <Row className="mb-2">
            <Col>
              <ButtonUi
                color="info"
                size="sm"
                block
                onClick={handleDownloadTemplate}
              >
                Download Excel Template
              </ButtonUi>
            </Col>
          </Row>

          <Row className="align-items-end">
            <Col md={7}>
              <Label className="small text-muted mb-1">Upload File</Label>
              <TextField
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFileName(e.target.files?.[0]?.name)}
                innerRef={fileRef}
                className="form-control-sm"
              />
            </Col>

            <Col md={5}>
              <ButtonUi
                color="primary"
                size="sm"
                block
                disabled={!fileName}
                onClick={handleUpload}
              >
                Upload
              </ButtonUi>
            </Col>
          </Row>
        </Col>

        {/* RIGHT: Info Section */}
        <Col md={7}>
          <div className="alert alert-info py-2 mb-0 h-100">
            <strong className="small">Important Instructions:</strong>
            <ul className="mb-0 ps-3 small">
              <li>Download the Excel template and use the same format.</li>
              <li>
                <strong>item_code</strong> must exist in Product Master.
              </li>
              <li>
                <strong>effective_date</strong> must be in YYYY-MM-DD format.
              </li>
              <li>
                <strong>basic_rate</strong> should be numeric (up to 2
                decimals).
              </li>
            </ul>
          </div>
        </Col>
      </Row>

      <hr />

      {/* ---------------- Preview Table ---------------- */}
      {uploadedRows.length > 0 && (
  <>
    <h6 className="mb-2">Excel Data Preview</h6>

    <div
      style={{
        maxHeight: "250px",
        overflowY: "auto",
        overflowX: "hidden",   // 👈 no horizontal scroll
        position: "relative",
        border: "1px solid #dee2e6",
        borderRadius: "4px",
      }}
    >
      <table
        className="table table-bordered table-sm mb-0"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead
          className="table-light"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <tr>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                height: "38px",
                fontSize: "13px",
                whiteSpace: "nowrap",
              }}
            >
              Item Code
            </th>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                height: "38px",
                fontSize: "13px",
                whiteSpace: "nowrap",
              }}
            >
              Effective Date
            </th>
            <th
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                height: "38px",
                fontSize: "13px",
                whiteSpace: "nowrap",
              }}
            >
              Basic Rate
            </th>
          </tr>
        </thead>

        <tbody>
          {uploadedRows.map((row, idx) => (
            <tr key={idx}>
              <td
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  height: "36px",
                  lineHeight: "36px",
                  fontSize: "13px",
                  padding: "0 8px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={row.item_code}
              >
                {row.item_code}
              </td>

              <td
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  height: "36px",
                  lineHeight: "36px",
                  fontSize: "13px",
                  padding: "0 8px",
                  whiteSpace: "nowrap",
                }}
              >
                {row.effective_date}
              </td>

              <td
                style={{
                  textAlign: "right",
                  verticalAlign: "middle",
                  height: "36px",
                  lineHeight: "36px",
                  fontSize: "13px",
                  padding: "0 8px",
                  whiteSpace: "nowrap",
                }}
              >
                {row.basic_rate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

    </Form>
  );
};

export default PriceListRateExcelUpload;
