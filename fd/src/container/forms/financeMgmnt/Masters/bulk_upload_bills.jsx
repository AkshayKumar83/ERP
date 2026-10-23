import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Form,
  Row,
  Col,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
} from "reactstrap";

import FormSetup from "../../../../components/common/formSetup";
import TextField from "../../../../components/basic/textField";
import ButtonUi from "../../../../components/basic/button";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useFormLoading } from "../../../../hooks/useFormLoading";
import Loader from "../../../../components/GenricComponents/Loader";
import HelpList from "../../../../components/HelpList";
import { APP_PROD_API } from "../../../../utils/api";
import { vendorHelpListHeaderBlkUpldBill } from "./bulk_upload_bills_helper";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BulkUploadBills = () => {
  const { formStatus, handleOperation, releaseFormStatus } = useFormStatus();
  const { loading, setLoading } = useFormLoading();
  const [showRedirectBtn, setShowRedirectBtn] = useState(true);

  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    v_code: "",
    v_name: "",
    po_no: "",
    file_name: "",
    file_type: "",
    file_base64: "",
    invoice_date: "",
    voucher_date: "",
    itc_gate_entry_date: "",
  });

  const [uploadedRows, setUploadedRows] = useState([]);
  const [hasErrors, setHasErrors] = useState(false);

  const [step, setStep] = useState(0);

  const [totals, setTotals] = useState({
    total_dr_amount: 0,
    total_cr_amount: 0,
  });

  /* ---------------- Help List ---------------- */
  const [helpList, setHelpList] = useState(false);
  const [helpFor, setHelpFor] = useState("");
  const [helpListHeader, setHelpListHeader] = useState([]);

  const toggleHelpModal = () => setHelpList(!helpList);

  const navigate = useNavigate();

  const openHelpList = (fieldName, header) => {
    if (["Insert", "Update"].includes(formStatus)) {
      setHelpFor(fieldName);
      setHelpListHeader(header);
      setHelpList(true);
    }
  };

  const onSelectHelpItem = (data) => {
    if (helpFor === "parties") {
      setFormData((prev) => ({
        ...prev,
        v_code: data.v_code,
        v_name: data.v_name,
      }));
    }
    setHelpList(false);
  };

  /* ---------- Derived Error Count ---------- */

  const errorCount = useMemo(() => {
    return uploadedRows.filter((r) => r.error_status === "error").length;
  }, [uploadedRows]);

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
          file_base64: reader.result,
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
    setLoading(true);

    try {
      const payload = {
        v_code: formData.v_code,
        po_no: formData.po_no,
        file_name: formData.file_name,
        file_type: formData.file_type,
        file_base64: formData.file_base64,
        user_id: user?.id,
        voucher_date: formData.voucher_date,
        invoice_date: formData.invoice_date,
        itc_gate_entry_date: formData.itc_gate_entry_date,
      };

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.POST_BULK_UPLOAD_BILLS_FORM_DATA}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUploadedRows(data.rows || []);
      setHasErrors(data.hasErrors || false);

      setTotals({
        total_dr_amount: data.total_dr_amount || 0,
        total_cr_amount: data.total_cr_amount || 0,
      });

      setStep(1);

      alert(data.message);
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      v_code: "",
      v_name: "",
      po_no: "",
      file_name: "",
      file_type: "",
      file_base64: "",
      invoice_date: "",
      voucher_date: "",
      itc_gate_entry_date: "",
    });
    setUploadedRows([]);
    setTotals({ total_dr_amount: 0, total_cr_amount: 0 });
    setHasErrors(false);
    setStep(0);
    releaseFormStatus();
  };

  const handleGenSupplyChainEntry = async () => {
    if (!window.confirm("Generate Supply Chain entries now?")) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.RUN_SUPPLY_CHAIN_ENTRIES_BULK_UPLOAD_BILLS}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            v_code: formData.v_code,
            po_no: formData.po_no,
            user_id: user?.id,
            file_name: formData.file_name,
            invoice_date: formData.invoice_date,
            voucher_date: formData.voucher_date,
            itc_gate_entry_date: formData.itc_gate_entry_date,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const processMsgList = [
        "Gate Entries created successfully",
        "GST Entries created successfully",
        "Purchase Voucher Entries created successfully",
        "Invoice Entries created successfully",
      ];

      const showProcessMessages = async () => {
        for (const msg of processMsgList) {
          toast.success(msg);
          await new Promise((r) => setTimeout(r, 900));
        }
      };

      showProcessMessages();

      setShowRedirectBtn(true);

      // for (const msg of processMsgList) {
      //   setTimeout(() => {
      //     toast.success(msg);
      //   }, 500);
      // }

      // toast.success(`${data.message} with Gate Entry No: ${data?.gateEntryNo}` || "Supply Chain entries generated successfully ✅");
    } catch (err) {
      toast.error(err.message || "Failed to generate supply chain entries");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectUploadedDocForm = async () => {
    navigate(`/module/financeMgmnt/40111?file_name=${formData?.file_name}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader />
      </div>
    );
  }

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
            {/* ---------------- Upload Section ---------------- */}

            <Row className="mb-3 align-items-end">
              <Col md={2}>
                <Label>Vendor Code</Label>
                <TextField value={formData.v_code} disabled />
              </Col>

              <Col md={3}>
                <Label>Vendor Name</Label>
                <TextField
                  value={formData.v_name}
                  placeholder="Select Vendor"
                  disabled={!formStatus}
                  onDoubleClick={() =>
                    openHelpList("parties", vendorHelpListHeaderBlkUpldBill)
                  }
                />
              </Col>
              <Col md={2}>
                <Label>Voucher Date</Label>
                <TextField
                  type="date"
                  value={formData.voucher_date}
                  disabled={!formStatus}
                  onChange={(e) => handleChange(e, "voucher_date")}
                />
              </Col>

              <Col md={2}>
                <Label>Invoice Date</Label>
                <TextField
                  type="date"
                  value={formData.invoice_date}
                  disabled={!formStatus}
                  onChange={(e) => handleChange(e, "invoice_date")}
                />
              </Col>

              <Col md={2}>
                <Label>ITC/Gate Entry Date</Label>
                <TextField
                  value={formData.itc_gate_entry_date}
                  type="date"
                  disabled={!formStatus}
                  onChange={(e) => handleChange(e, "itc_gate_entry_date")}
                />
              </Col>

              <Col md={3}>
                <Label>Upload File</Label>
                <TextField
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={!formStatus}
                  onChange={(e) => handleChange(e, "file")}
                />
              </Col>

              <Col md={2}>
                <ButtonUi
                  color="primary"
                  block
                  onClick={handleUpload}
                  disabled={
                    !formStatus || !formData.v_code || !formData.file_name
                  }
                >
                  Upload
                </ButtonUi>
              </Col>
            </Row>

            <hr />

            {/* ---------------- Preview Table ---------------- */}

            {uploadedRows.length > 0 && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6>Uploaded Bills Preview</h6>

                  {errorCount > 0 && (
                    <Badge color="danger">{errorCount} Error Row(s)</Badge>
                  )}
                </div>

                {/* <div className="member-upload-table-wrapper"> */}
                <div className="bulk-bill-table-wrapper">
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th style={{ width: "90px" }}>Status</th>
                        <th style={{ width: "100px" }}>Acc No</th>
                        <th style={{ width: "100px" }}>TDS %</th>
                        <th style={{ width: "100px" }}>Debit Acc Code</th>
                        <th style={{ width: "250px" }}>Debit Acc Name</th>
                        <th style={{ width: "100px" }}>Sub Code</th>
                        <th style={{ width: "90px" }}>Discount %</th>
                        <th style={{ width: "120px" }}>Item Code</th>
                        <th style={{ width: "80px" }}>Qty</th>
                        <th style={{ width: "110px" }}>Dr</th>
                        <th style={{ width: "110px" }}>Cr</th>
                        <th style={{ width: "130px" }}>Bill No</th>
                        <th style={{ width: "120px" }}>Bill Date</th>
                        <th style={{ width: "200px" }}>Remarks</th>
                        <th style={{ width: "250px" }}>Error Description</th>
                        <th style={{ width: "90px" }}>Invoicing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.error_status === "error" ? "table-danger" : ""
                          }
                        >
                          <td>
                            {row.error_status === "error" ? (
                              <span className="text-danger fw-semibold">
                                Error
                              </span>
                            ) : (
                              <span className="text-success fw-semibold">
                                OK
                              </span>
                            )}
                          </td>

                          <td>{row.acc_no}</td>
                          <td>{row.tds_perc}</td>
                          <td>{row.debit_acc_code}</td>
                          <td>{row.debit_acc_desc}</td>
                          <td>{row.sub_code}</td>
                          <td className="text-end">{row.discount_perc}</td>
                          <td>{row.item_code}</td>
                          <td>{row.qty}</td>
                          <td className="text-end">{row.dr_amount}</td>
                          <td className="text-end">{row.cr_amount}</td>
                          <td>{row.bill_no}</td>
                          <td>{row.bill_date}</td>
                          <td>{row.remarks}</td>

                          <td className="text-danger fw-semibold">
                            {row.error_status === "error" ? row.error_desc : ""}
                          </td>
                          <td>{row.invoicing_to_be_done}</td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot className="table-light">
                      <tr>
                        <th colSpan={6} className="text-end">
                          Total
                        </th>
                        <th className="text-end">
                          {Number(totals.total_dr_amount).toFixed(2)}
                        </th>
                        <th className="text-end">
                          {Number(totals.total_cr_amount).toFixed(2)}
                        </th>
                        <th colSpan={3}></th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* ---------------- Action Buttons ---------------- */}

            <div className="mt-4">
              <Row className="g-3">
                <Col md={3}>
                  <ButtonUi
                    color="info"
                    block
                    disabled={step < 1 || hasErrors}
                    onClick={handleGenSupplyChainEntry}
                  >
                    Generate Supply Chain Entries
                  </ButtonUi>
                </Col>
                {showRedirectBtn && (
                  <Col md={3}>
                    <ButtonUi
                      color="primary"
                      block
                      // disabled={step < 1 || hasErrors}
                      onClick={handleRedirectUploadedDocForm}
                    >
                      Open Generated Transaction Tracker
                    </ButtonUi>
                  </Col>
                )}
              </Row>
            </div>
          </Form>
          {/* ---------------- Help List Modal ---------------- */}

          {helpList && (
            <Modal isOpen={helpList} toggle={toggleHelpModal} size="lg">
              <ModalHeader toggle={toggleHelpModal} />
              <ModalBody>
                <HelpList
                  formStatus={formStatus}
                  helpFor={helpFor}
                  apiUrl={`${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.GET_BULK_UPLOAD_BILL_FORM_DATA}`}
                  helpListHeader={helpListHeader}
                  handleHelpList={setHelpList}
                  onSelectHelpItem={onSelectHelpItem}
                  queryPera={{ needAppGlobalData: "Y" }}
                />
              </ModalBody>
            </Modal>
          )}
        </CardBody>
      </Card>
    </FormSetup>
  );
};

export default BulkUploadBills;
