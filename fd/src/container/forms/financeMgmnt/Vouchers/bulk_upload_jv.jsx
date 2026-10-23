import React, { useState } from "react";
import { Card, CardBody, Form, Row, Col, Label } from "reactstrap";

import FormSetup from "../../../../components/common/formSetup";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import Loader from "../../../../components/GenricComponents/Loader";

import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";

const BulkUploadJV = () => {
  const { formStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const { loading, setLoading } = useFormLoading();

  const [formData, setFormData] = useState({
    file_name: "",
    file_type: "",
    file_base64: "",
  });
  const [uploadedRows, setUploadedRows] = useState([]);

  const [step, setStep] = useState(0);
  const [totals, setTotals] = useState({
    total_dr_amount: 0,
    total_cr_amount: 0,
  });

  const { user } = useSelector((state) => state.auth);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e, field) => {
    if (field === "file") {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          file_name: file.name,
          file_type: file.type,
          file_base64: reader.result, // base64 string
        }));
      };

      reader.readAsDataURL(file);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUpload = async () => {
    if (!formData.file_base64) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        file_name: formData.file_name,
        file_type: formData.file_type,
        file_base64: formData.file_base64,
        user_id: user?.id,
      };

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_BULK_UPLOAD_JV_FORM_DATA
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUploadedRows(data.rows || []); // 👈 directly from POST
      setTotals({
        total_dr_amount: data.total_dr_amount || 0,
        total_cr_amount: data.total_cr_amount || 0,
      });
      setStep(1);

      alert(`Upload successful. Rows inserted: ${data.inserted}`);
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJVTemplate = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BULK_UPLOAD_JV_TEMPLATE}`,
    );

    if (!res.ok) {
      alert("Failed to download template");
      return;
    }

    const blob = await res.blob();

    // 🔴 SAFETY: ensure correct MIME
    const file = new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(file);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_jv_upload_template.xlsx";
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader />
      </div>
    );
  }

  const handleCancel = () => {
    setFormData({
      file_name: "",
      file_type: "",
      file_base64: "",
    });
    setUploadedRows([]);
    releaseFormStatus();
    setTotals({ total_dr_amount: 0, total_cr_amount: 0 });
    setStep(0);
  };

  const handleBuildJV = async () => {
    if (totals.total_dr_amount !== totals.total_cr_amount) {
      alert("JV is not balanced");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: user?.id,
        trans_year: user?.global_fin_year,
        file_name: formData.file_name
      };

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BULK_UPLOAD_JV_BUILD_JV}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`JV Built Successfully. Voucher No: ${data.voucher_no}`);

      // Optional: reset form after success
      handleCancel();
    } catch (err) {
      alert(err.message || "Failed to build JV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSetup
      navType="tabs"
      activeTab={1}
      tabs={[]}
      updateActiveTab={() => {}}
      formStatus={formStatus}
      handleOperation={handleOperation}
      handleCancel={handleCancel}
      isSingleQuery
    >
      <Card className="shadow-sm">
        <CardBody>
          <Form>
            <Row className="mb-3">
              {/* LEFT SIDE: Actions */}
              <Col md={5}>
                {/* Download Template */}
                <Row className="mb-2">
                  <Col>
                    <ButtonUi
                      color="info"
                      size="sm"
                      block
                      onClick={handleDownloadJVTemplate}
                    >
                      Download Excel Template
                    </ButtonUi>
                  </Col>
                </Row>

                {/* Upload Section */}
                <Row className="align-items-end">
                  <Col md={7}>
                    <Label className="small text-muted mb-1">Upload File</Label>
                    <TextField
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      disabled={!formStatus}
                      onChange={(e) => handleChange(e, "file")}
                      className="form-control-sm"
                    />
                  </Col>

                  <Col md={5}>
                    <ButtonUi
                      color="primary"
                      size="sm"
                      block
                      onClick={handleUpload}
                      disabled={!formStatus || !formData.file_name || loading}
                    >
                      Upload
                    </ButtonUi>
                  </Col>
                </Row>

                {/* Totals + Build JV */}
                {uploadedRows.length > 0 && (
                  <Row className="mt-2  align-items-center">
                    {/* LEFT: Build JV Button */}
                    <Col md={5} className="text-start">
                      {totals.total_dr_amount === totals.total_cr_amount && (
                        <ButtonUi
                          color="success"
                          size="sm"
                          onClick={handleBuildJV}
                          disabled={loading}
                        >
                          Build Journal Voucher
                        </ButtonUi>
                      )}
                    </Col>

                    {/* RIGHT: Totals */}
                    <Col md={7} className="text-end">
                      <div className="fw-semibold small">
                        DR:{" "}
                        <span className="text-success">
                          {totals.total_dr_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="fw-semibold small">
                        CR:{" "}
                        <span className="text-danger">
                          {totals.total_cr_amount.toFixed(2)}
                        </span>
                      </div>

                      {totals.total_dr_amount === totals.total_cr_amount && (
                        <div className="text-success small fw-bold">
                          ✔ JV Balanced
                        </div>
                      )}
                    </Col>
                  </Row>
                )}
              </Col>

              {/* RIGHT SIDE: Instructions */}
              <Col md={7}>
                <div className="alert alert-info mb-0 h-80">
                  <strong className="small">Important Instructions:</strong>

                  <ul className="mb-0 ps-3 small">
                    <li>
                      <strong>Download the Excel template first</strong>,
                      prepare data in the same format, and{" "}
                      <strong>remove the sample row</strong> before upload.
                    </li>
                    <li>
                      Either <strong>DR or CR</strong> must be filled — not
                      both.
                    </li>
                    <li>
                      <strong>DR total must equal CR total</strong>.
                    </li>
                    <li>
                      <strong>Account No</strong> must exist in chart of
                      accounts.
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>

            <hr />

            {uploadedRows.length > 0 && (
              <>
                <h6 className="mb-2">Uploaded JV Preview</h6>

                <div className="member-upload-table-wrapper">
                  <table className="table table-bordered table-sm member-upload-table">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>Acc No</th>
                        <th style={{ width: "160px" }}>Account Name</th>

                        <th style={{ width: "60px" }}>Sub Code</th>
                        <th style={{ width: "150px" }}>Sub Name</th>
                        <th style={{ width: "150px" }}>Bill No.</th>
                        <th style={{ width: "150px" }}>Bill Date</th>
                        <th style={{ width: "150px" }}>Cost Center</th>

                        <th style={{ width: "120px" }} className="text-center">
                          Dr
                        </th>

                        <th style={{ width: "120px" }} className="text-end">
                          Cr
                        </th>

                        <th style={{ width: "260px" }}>Narration</th>
                      </tr>
                    </thead>

                    <tbody>
                      {uploadedRows.map((row, idx) => (
                        <tr key={idx}>
                          {/* Acc No */}
                          <td className="text-nowrap" title={row.acc_no}>
                            {row.acc_no}
                          </td>

                          {/* Acc Description */}
                          <td className="text-truncate" title={row.acc_desc}>
                            {row.acc_desc}
                          </td>

                          {/* Sub Code */}
                          <td className="text-nowrap" title={row.sub_code}>
                            {row.sub_code}
                          </td>

                          {/* Sub Description */}
                          <td className="text-truncate" title={row.sub_desc}>
                            {row.sub_desc}
                          </td>
                          <td className="text-truncate" title={row.bill_no}>
                            {row.bill_no}
                          </td>
                          <td className="text-truncate" title={row.bill_dt}>
                            {row.bill_dt}
                          </td>
                          <td className="text-truncate" title={row.cost_centr}>
                            {row.cost_centr}
                          </td>

                          <td className="text-end text-nowrap">
                            {row.dr ? Number(row.dr).toFixed(2) : ""}
                          </td>

                          <td className="text-end text-nowrap">
                            {row.cr ? Number(row.cr).toFixed(2) : ""}
                          </td>

                          {/* Narration */}
                          <td className="text-truncate" title={row.remarks}>
                            {row.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </FormSetup>
  );
};

export default BulkUploadJV;
