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
import { useNavigate } from "react-router-dom";

const UploadUpdatedMemberDtl = () => {
  const { formStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const { loading, setLoading } = useFormLoading();

  const [formData, setFormData] = useState({
    file_name: "",
    file_type: "",
    file_base64: "",
  });

  const [uploadedRows, setUploadedRows] = useState([]);
  const navigate = useNavigate();
  const [showReportBtn, setShowReportBtn] = useState(false);
  const [uploadId, setUploadId] = useState(null);

  const [failedMembers, setFailedMembers] = useState([]);

  const [duplicateMembers, setDuplicateMembers] = useState([]);
  const [notExistingMembers, setNotExistingMembers] = useState([]);

  const [validationErrors, setValidationErrors] = useState([]);

  const { user } = useSelector((state) => state.auth);

  // dealer (division) cannot be changed as per telephonic discusson with sahil on dt.07.01.2026

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

  const handleUpload = async (confirmReupload = "N") => {
    setLoading(true);
    setDuplicateMembers([]);
    setNotExistingMembers([]);

    try {
      const payload = {
        file_name: formData.file_name,
        file_type: formData.file_type,
        file_base64: formData.file_base64,
        user_id: user?.id,
        confirm_reupload: confirmReupload, // 🔥 important
        trans_year:user?.global_fin_year,
      };

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_BULK_UPDATE_MEMBER_DTL_UPLOAD
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      // 🔴 DUPLICATE FILE CASE
      if (res.status === 409) {
        const yes = window.confirm(data.message);
        if (yes) {
          return handleUpload("Y"); // 🔁 retry with confirmation
        }
        return;
      }

      // if (!res.ok) throw new Error(data.message);

      if (!res.ok) {
        setUploadedRows([]);
        setDuplicateMembers([]);
        setNotExistingMembers([]);
        setValidationErrors([]);

        // 🔥 NEW unified validation handling
        if (data.code === "EXCEL_VALIDATION_FAILED") {
          setValidationErrors(data.errors || []);
          return; // ❗ DO NOT THROW
        }

        // Only throw for unexpected errors
        throw new Error(data.message);
      }

      // ✅ STORE upload_id
      setUploadId(data.upload_id);

      setUploadedRows(data.rows || []);

      alert(`Upload successful. Rows inserted: ${data.inserted}`);
    } catch (err) {
      // alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIntoMainTable = async () => {
    if (!uploadedRows.length || !uploadId) return;

    if (
      !window.confirm(
        "Are you sure you want to update Member & Customer data into main tables?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user?.id,
        trans_year: user?.global_fin_year,
        upload_id: uploadId,
      };

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.POST_BULK_UPDATE_MEMBER_DTL_MAIN
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFailedMembers(data.failedMembers || []); // 🔥 NEW

      alert("Member data updated successfully into main table");

      setUploadedRows([]);
      setShowReportBtn(true);
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReport = () => {
    navigate("/module/memberMgmnt/10301");
  };

  const handleDownloadTemplate = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}${
        APP_PROD_API.GET_BULK_UPDATE_MEMBER_DTL_EXL_FORMATE
      }`
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "member_update_template.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader />
      </div>
    );
  }

  const fmtDate = (d) => {
    if (!d) return "";
    const date = new Date(d);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const handleCancel = () => {
    setFormData({
      file_name: "",
      file_type: "",
      file_base64: "",
    });

    setUploadedRows([]);
    setDuplicateMembers([]);
    setNotExistingMembers([]);
    setFailedMembers([]);
    setShowReportBtn(false);
    setUploadId(null);
    setValidationErrors([]);
    releaseFormStatus();
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
                      accept=".csv,.xlsx,.xls"
                      disabled={!formStatus}
                      onChange={(e) => handleChange(e, "file")}
                      className="form-control-sm"
                    />
                  </Col>

                  <Col md={5}>
                    {/* <ButtonUi
                      color="primary"
                      block
                      size="sm"
                      // onClick={handleUpload}
                      onClick={() => handleUpload()}
                      disabled={!formStatus || !formData.file_name}
                    >
                      Upload
                    </ButtonUi> */}

                    <ButtonUi
                      color="primary"
                      block
                      size="sm"
                      onClick={() => handleUpload()}
                      disabled={!formStatus || !formData.file_name || loading}
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
                    <li>
                      <strong>Download the Excel template first</strong> using
                      the
                      <strong> “Download Excel Template”</strong> button,
                      prepare your data in the same format, and{" "}
                      <strong>remove the sample (dummy) row</strong> before
                      uploading the file.
                    </li>

                    <li>
                      <strong>Dealer Code and Dealer Name</strong> are read-only
                      in this bulk update process. Any changes made to these
                      fields in the uploaded file will be{" "}
                      <strong>ignored</strong>.
                    </li>

                    <li>
                      To update dealer-related details, please use the
                      <strong> Dealer Upload / Dealer Master</strong> screen
                      only.
                    </li>

                    <li>
                      <strong>All Date column</strong> should be in
                      <strong> YYYY-MM-DD</strong> formate.
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>

            <hr />

            {validationErrors.length > 0 && (
              <div className="alert alert-danger">
                <h6 className="mb-2">Excel Validation Errors</h6>

                <table className="table table-bordered table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Row No</th>
                      <th>Member No</th>
                      <th>Field</th>
                      <th>Error Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationErrors.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.row}</td>
                        <td>{e.member_no || "-"}</td>
                        <td>{e.field || "-"}</td>
                        <td>{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="small mt-2">
                  Please correct the Excel file and re-upload.
                </div>
              </div>
            )}

            {duplicateMembers.length > 0 && (
              <div className="alert alert-danger">
                <h6 className="mb-2">
                  Duplicate Member Numbers Found in Excel
                </h6>
                <ul className="mb-0 small">
                  {duplicateMembers.map((d, idx) => (
                    <li key={idx}>
                      <strong>{d.member_no}</strong> found in rows:{" "}
                      {d.rows.join(", ")}
                    </li>
                  ))}
                </ul>
                <div className="small mt-2">
                  Please correct the Excel file and re-upload.
                </div>
              </div>
            )}

            {notExistingMembers.length > 0 && (
              <div className="alert alert-warning">
                <h6 className="mb-2">Members Not Found in System</h6>
                <ul className="mb-0 small">
                  {notExistingMembers.map((m, idx) => (
                    <li key={idx}>
                      <strong>{m.member_no}</strong> (Excel Row {m.row})
                    </li>
                  ))}
                </ul>
                <div className="small mt-2">
                  Only existing members can be updated using this upload.
                </div>
              </div>
            )}

            {uploadedRows.length > 0 && (
              <>
                <h6 className="mb-2">Excel Data Preview Befor Update</h6>

                <div className="member-upload-table-wrapper">
                  <table className="table table-bordered table-sm member-upload-table">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Member No</th>
                        <th>Dealer Code</th>
                        <th>Member Name</th>
                        {/* <th>Division</th>
                        <th>Status</th> */}
                        <th>Member Date</th>
                        <th>Board Appointment Date</th>
                        <th>Board Cessation Date</th>
                        <th>Reinstate Date</th>
                        <th>Membership Fee</th>
                        <th>Form</th>
                        <th>Other</th>
                        <th>Pay Instr No</th>
                        <th>Pay Instr Date</th>
                        <th>Start Kit Tool</th>
                        <th>Start Kit Uniform</th>
                        <th>Start Kit Promotion</th>
                        <th>Start Kit Stationery</th>
                        <th>Start Kit (All)</th>
                        <th>Fee Amount</th>
                        <th>Forfeiture Amount</th>
                        <th>Facebook Handle</th>
                      </tr>
                    </thead>

                    <tbody>
                      {uploadedRows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.member_no}</td>
                          <td>{row.dealer_code}</td>
                          <td>{row.dlr_name}</td>
                          {/* <td>{row.division}</td>
                          <td>{row.member_status}</td> */}
                          <td>{fmtDate(row.member_date)}</td>
                          <td>{fmtDate(row.member_board_appnt_date)}</td>
                          <td>{fmtDate(row.member_board_cease_date)}</td>
                          <td>{fmtDate(row.member_board_reinstate)}</td>
                          <td>{row.membership_fee}</td>
                          <td>{row.member_form}</td>
                          <td>{row.other}</td>
                          <td>{row.pay_instr_no}</td>
                          <td>{fmtDate(row.pay_instr_date)}</td>
                           <td>{row.start_kit_tool}</td>
                           <td>{row.start_kit_uniform}</td>
                           <td>{row.start_kit_promotion}</td>
                           <td>{row.start_kit_stationery}</td>
                          <td>{row.start_kit_all}</td>
                          <td>{row.member_fee_amount}</td>
                          <td>{row.forfeiture_amount}</td>
                          <td>{row.facebook_acc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {failedMembers.length > 0 && (
              <>
                {/* <hr /> */}
                <h6 className="text-danger mb-2">Members Not Updated</h6>

                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Member No</th>
                      <th>Error Stage</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedMembers.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.member_no}</td>
                        <td>{row.error_stage}</td>
                        <td>{row.error_message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <Row className="g-3">
              <Col md={3}>
                {/* <ButtonUi
                  color="secondary"
                  block
                  disabled={!uploadedRows.length}
                  onClick={handleUpdateIntoMainTable}
                >
                  Update into Main Table
                </ButtonUi> */}

                <ButtonUi
                  color="secondary"
                  block
                  // disabled={
                  //   !uploadedRows.length ||
                  //   duplicateMembers.length > 0 ||
                  //   notExistingMembers.length > 0
                  // }
                  disabled={!uploadId || validationErrors.length > 0}
                  onClick={handleUpdateIntoMainTable}
                >
                  Update into Main Table
                </ButtonUi>
              </Col>

              {showReportBtn && (
                <Col md={3}>
                  <ButtonUi color="success" block onClick={handleGoToReport}>
                    See Updated Member Report
                  </ButtonUi>
                </Col>
              )}
            </Row>
          </Form>
        </CardBody>
      </Card>
    </FormSetup>
  );
};

export default UploadUpdatedMemberDtl;
