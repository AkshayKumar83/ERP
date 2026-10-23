import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, FormGroup, Row } from "reactstrap";
import TextField from "../../../../components/basic/textField";
import Checkbox from "../../../../components/basic/checkbox";
import Select from "../../../../components/basic/select";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import { memberNoHelpListHeader } from "./loan_mas_helper";
import RadioGroup from "../../../../components/basic/radioGroup";
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { APP_PROD_API } from "../../../../utils/api";

const LoanMasterHdr = ({
  formStatus,
  formHdrData = {},
  handleLoanDateChange,
  handleCreateEMIData,
  handleChange,
  openHelpList,
  loanPurpose,
  bankList,
  cNVoucherList = [],
  aAVoucherList = [],
  setFormHdrData,
  isGstRateFound,
  isDocsUploaded,
  setIsDocsUploaded = () => {},
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const toggleUploadModal = () => setIsUploadModalOpen(!isUploadModalOpen);
  const [files, setFiles] = useState([]);
  const [requiredDocs, setRequiredDocs] = useState([
    "Aadhaar Card",
    "PAN Card",
    "Photograph",
    "Bank Statement",
    "Salary Slip",
  ]);

  // const openUpldDocModal = () => {
  //   const { member_no, loan_id } = formHdrData;
  //   if (member_no && loan_id) {
  //     toggleUploadModal();
  //   } else {
  //     toast.error("Please Select Member and loan purpose to upload document");
  //     return;
  //   }
  // };


  const openUpldDocModal = () => {
      const { member_no, loan_id } = formHdrData;

      if (member_no && loan_id) {
        // Previous record ki selected files clear karo
        setFiles([]);

        setIsUploadModalOpen(true);
      } else {
        toast.error("Please Select Member and loan purpose to upload document");
      }
    };

  // fetch required doc list
  useEffect(() => {
    if (formStatus != "insert") return;
    if (!formHdrData?.loan_id) return;

    const fetchRequiredDocs = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}${
            APP_PROD_API.GET_LOAN_MASTER_DOC_LIST
          }?loan_id=${formHdrData.loan_id}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data?.data?.length) {
          setRequiredDocs(data.data);
        } else {
          toast.error("No required documents found for this loan.");
        }
      } catch (error) {
        console.error("Failed to fetch required documents", error);
        toast.error("Failed to load required documents.");
      }
    };

    fetchRequiredDocs();
  }, [formHdrData?.loan_id]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleSubmitDocuments = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one document.");
      return;
    }

    if (!formHdrData?.efa_ctrl_id) {
      toast.error("Missing EFA Control ID.");
      return;
    }

    const formData = new FormData();
    formData.append("efa_ctrl_id", formHdrData.efa_ctrl_id);

    files.forEach(({ file }) => {
      formData.append("documents", file);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.UPLD_LOAN_MASTER_DOC
        }`,
        {
          method: "POST",
          body: formData,
          credentials: "include", // Include cookies/session if needed
        }
      );

      // if (response.ok) {
      //   toast.success("Documents submitted successfully!");
      //   // setFiles([]);
      //   toggleUploadModal();
      //   setIsDocsUploaded(true);
      //   setFormHdrData((prev) => ({ ...prev, efa_compliance_yesno: "Y" }));
      // } else {
      //   toast.error("Failed to upload documents.");
      // }
      if (response.ok) {
  toast.success("Documents submitted successfully!");

  // Reset uploaded file state
  setFiles([]);

  // Reset file input
  const fileInput = document.querySelector(
    'input[type="file"]'
  );
  if (fileInput) fileInput.value = "";
  setIsUploadModalOpen(false);
  setIsDocsUploaded(true);
  setFormHdrData((prev) => ({ ...prev,efa_compliance_yesno: "Y" }));
    } else {
      toast.error("Failed to upload documents.");
    }
    } catch (error) {
      console.error("Error submitting documents:", error);
      toast.error("An error occurred during upload.");
    }
  };

  const handleSeeDocuments = async () => {
    const { efa_ctrl_id } = formHdrData;

    if (!efa_ctrl_id) {
      toast.error("No EFA Control ID available");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${
          APP_PROD_API.UPLD_LOAN_MASTER_DOC
        }?efa_ctrl_id=${efa_ctrl_id}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (data?.data?.length > 0) {
        const fetchedFiles = data.data.map((doc) => ({
          file: { name: doc.file_name },
          previewUrl: doc.file_url, // Make sure your backend gives this
        }));
        setFiles(fetchedFiles);
        setIsUploadModalOpen(true);
      } else {
        toast.error("No documents found.");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    }
  };

  return (
    <>
      <Form id="loan-mas-hdr-form" className="loan-mas-hdr-form">
        <div style={{ marginLeft: "20px" }}>
          <Row>
            <Col l={8}>
              <Row>
                <Col l={4}>
                  <TextField
                    required
                    type="date"
                    label="EFA Date"
                    name="efa_application_date"
                    value={formHdrData.efa_application_date || ""}
                    max={new Date().toISOString().split("T")[0]} // 👈 Prevent future dates
                    onChange={(e) =>
                      handleChange(e, "efa_application_date", e.target.value)
                    }
                  />
                </Col>
                <Col l={4}>
                  <TextField
                    type="text"
                    label="EMFA Control No."
                    value={formHdrData.efa_ctrl_id || ""}
                    onChange={(e) =>
                      handleChange(e, "efa_ctrl_id", e.target.value)
                    }
                    disabled={["Insert", "Update"].includes(formStatus)}
                  />
                </Col>

                {/* <Col l={3}>
                  <TextField
                    required
                    type="number"
                    name="service_charge_rate"
                    label="Service Charges flat p.a. (%)"
                    value={formHdrData?.service_charge_rate || ""}
                    onChange={(e) =>
                      handleChange(e, "service_charge_rate", e.target.value)
                    }
                    maxLength={6}
                  />
                </Col> */}
                <Col
                  l={4}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "end",
                  }}
                >
                  <div className="checkbox-container">
                    <Checkbox
                      text="Loan Eligibility"
                      checked={formHdrData.efa_compliance_yesno == "Y"}
                      onChange={(e) =>
                        handleChange(
                          e,
                          "efa_compliance_yesno",
                          e.target.checked ? "Y" : "N"
                        )
                      }
                      disabled
                    />
                  </div>
                </Col>
              </Row>
            </Col>

            <Col xl={4}>
              <Col xl={4}>
                <Select
                  required
                  label="EMFA Status"
                  name="status"
                  value={formHdrData["status"] || ""}
                  onChange={(e) => handleChange(e, "status", e.target.value)}
                  options={[
                    { value: "", label: "" },
                    { value: "O", label: "Open" },
                    { value: "C", label: "Closed" },
                  ]}
                />
              </Col>
            </Col>
         <Col xl={3} className="mt-auto">
        {formStatus === "Insert" || formStatus === "Update" ? (
          <ButtonUi color="secondary" onClick={openUpldDocModal}>
            Upload Document
          </ButtonUi>
        ) : formStatus === "Query" ? (
          <ButtonUi color="info" outline onClick={handleSeeDocuments}>
            See Documents
          </ButtonUi>
        ) : null}
      </Col>
          </Row>
          <Row>
            <Col xl={12}>
              <Row>
                <Col xl={4}>
                  <TextField
                    required
                    type="text"
                    label="Member Name"
                    value={formHdrData.party_name || ""}
                    onChange={(e) => handleChange(e, "party_name", e.target.value)}
                    onDoubleClick={() => openHelpList("party_name", memberNoHelpListHeader)}
                    disabled={isDocsUploaded == true}
                  />
                </Col>

                <Col xl={3}>
                  <Select
                    required
                    label="EMFA Purpose"
                    name="loan_id"
                    value={formHdrData["loan_id"] || ""}
                    onChange={(e) => handleChange(e, "loan_id", e.target.value)}
                    options={loanPurpose}
                    disabled={isDocsUploaded == true}
                  />
                </Col>
                <Col xl={2}>
                  <TextField
                    required
                    type="number"
                    name="service_charge_rate"
                    label="Service Charges flat p.a. (%)"
                    value={formHdrData?.service_charge_rate || ""}
                    onChange={(e) =>
                      handleChange(e, "service_charge_rate", e.target.value)
                    }
                    maxLength={3}
                  />
                </Col>
                {/* <Col xl={3} className="mt-auto">
                  {formStatus === "Insert" ? (
                    <ButtonUi color="secondary" onClick={openUpldDocModal}>
                      Upload Document
                    </ButtonUi>
                  ) : formStatus === "Query" ? (
                    <ButtonUi color="info" outline onClick={handleSeeDocuments}>
                      See Documents
                    </ButtonUi>
                  ) : null}
                </Col> */}
              </Row>
            </Col>
            {/* <Col xl={4}> */}
            {/* <Row> */}
            {/* <Col xl={6}>
                  <TextField
                    type="number"
                    label="Interest Rate %"
                    name="interest_rate"
                    value={formHdrData?.interest_rate || ""}
                    onChange={(e) => handleChange(e, "interest_rate", e.target.value)}
                    maxLength={20}
                  />
                </Col> */}
            {/* <Col xl={6} className="mt-auto border">
                  <ButtonUi color="primary" outline onClick={openUpldDocModal} disabled={!["Insert"].includes(formStatus)}>
                    Upload Document
                  </ButtonUi>
                </Col> */}
            {/* </Row> */}
            {/* </Col> */}
          </Row>
          <Row>
            <Col l={6}>
              <Row>
                <Col l={6}>
                  <TextField
                    required
                    type="number"
                    label="Member Financial Assistance Amount"
                    name="efa_amount"
                    value={formHdrData?.efa_amount || ""}
                    onChange={(e) =>
                      handleChange(e, "efa_amount", e.target.value)
                    }
                    maxLength={20}
                  />
                </Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col l={6}>
                  <TextField
                    required
                    type="number"
                    label="No. of Installments"
                    name="no_of_install"
                    value={formHdrData?.no_of_install || ""}
                    onChange={(e) =>
                      handleChange(e, "no_of_install", e.target.value)
                    }
                    maxLength={3}
                  />
                </Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col xl={6}>
                  <TextField
                    type="number"
                    label="IGST %"
                    name="igst_rate"
                    value={formHdrData?.igst_rate || ""}
                    onChange={(e) =>
                      handleChange(e, "igst_rate", e.target.value)
                    }
                    maxLength={20}
                    disabled={isGstRateFound == true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mt-4">
              <RadioGroup
                className="button-group-wrapper box-border"
                name="Trans Type"
                options={[
                  { text: "Bank", value: "BN" },
                  { text: "Credit Note", value: "CN" },
                  { text: "Advance Adjustment", value: "AA" },
                ]}
                onChange={(e) => handleChange(e, "trans_type", e.target.value)}
                checked={formHdrData?.trans_type || "BN"}
              />
            </Col>
            <Col md={4}>
              <Select
                label="EMI Frequency"
                name="emi_frequency_flag"
                value={formHdrData["emi_frequency_flag"] || ""}
                onChange={(e) =>
                  handleChange(e, "emi_frequency_flag", e.target.value)
                }
                required
                options={[
                  { value: "", label: "" },
                  { value: "M", label: "Monthly" },
                  { value: "Q", label: "Quarterly" },
                  { value: "H", label: "Half Yearly" },
                  { value: "Y", label: "Yearly" },
                ]}
              />
            </Col>
          </Row>
          <Row>
            <Col xl={8}>
              <Row>
                <Col xl={4}>
                  {formHdrData?.trans_type == "BN" && (
                    <Select
                      required
                      type="text"
                      label="Bank Account"
                      name="bank_cd"
                      value={formHdrData.bank_cd || ""}
                      onChange={(e) =>
                        handleChange(e, "bank_cd", e.target.value)
                      }
                      options={bankList}
                    />
                  )}
                  {formHdrData?.trans_type == "CN" && (
                    <Select
                      required
                      type="text"
                      label="Credit Note"
                      name="credit_note"
                      value={formHdrData.credit_note || ""}
                      onChange={(e) =>
                        handleChange(e, "credit_note", e.target.value)
                      }
                      options={cNVoucherList}
                    />
                  )}
                  {formHdrData?.trans_type == "AA" && (
                    <Select
                      required
                      type="text"
                      label="Advance Adjusted"
                      name="adv_adjust"
                      value={formHdrData.adv_adjust || ""}
                      onChange={(e) =>
                        handleChange(e, "adv_adjust", e.target.value)
                      }
                      options={aAVoucherList}
                    />
                  )}
                </Col>
                <Col xl={4}>
                  <Row>
                    <Col>
                      <TextField
                        type="date"
                        label="Voucher Date"
                        value={formHdrData?.voucher_dt || ""}
                        onChange={(e) =>
                          handleChange(e, "voucher_dt", e.target.value)
                        }
                        disabled={formHdrData?.trans_type == "BN"}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col xl={6}>
                  <TextField
                    type="number"
                    label="CGST %"
                    value={formHdrData?.cgst_rate || ""}
                    onChange={(e) =>
                      handleChange(e, "cgst_rate", e.target.value)
                    }
                    maxLength={20}
                    disabled={isGstRateFound == true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xl={8}>
              <Row>
                <Col xl={6}>
                  <TextField
                    required
                    type="text"
                    label="Instrument Number"
                    name="instrument_no"
                    value={formHdrData.instrument_no || ""}
                    onChange={(e) => handleChange(e, "instrument_no", e.target.value)}
                  />
                </Col>
                <Col xl={4}>
                  <Row>
                    <Col xl={12}>
                      <Select
                        type="text"
                        label="EMI Date option"
                        name="emi_date_option"
                        value={formHdrData.emi_date_option || ""}
                        onChange={(e) =>
                          handleChange(e, "emi_date_option", e.target.value)
                        }
                        options={[
                          { value: "", label: "" },
                          { value: "M", label: "First of Every Month" },
                          { value: "F", label: "15th of Every Month" },
                        ]}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col xl={6}>
                  <TextField
                    type="number"
                    label="SGST %"
                    name="sgst_rate"
                    value={formHdrData?.sgst_rate || ""}
                    onChange={(e) =>
                      handleChange(e, "sgst_rate", e.target.value)
                    }
                    maxLength={20}
                    disabled={isGstRateFound == true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xl={8}>
              <Row>
                <Col xl={6}>
                  <TextField
                    required
                    type="date"
                    label="Instrument date"
                    name="instrument_date"
                    value={formHdrData.instrument_date || ""}
                    onChange={(e) =>
                      handleChange(e, "instrument_date", e.target.value)
                    }
                  />
                </Col>
                <Col xl={4}>
                  <Row>
                    <Col xl={12}>
                      <TextField
                        type="number"
                        label="EMI % to be calculated on"
                        name="emi_compute_perc_on"
                        value={formHdrData?.emi_compute_perc_on || ""}
                        onChange={(e) =>
                          handleChange(e, "emi_compute_perc_on", e.target.value)
                        }
                        maxLength={5}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col xl={7}>
                  <TextField
                    type="number"
                    label="Penal Rate %"
                    name="penal_sc_rate"
                    value={formHdrData?.penal_sc_rate || ""}
                    onChange={(e) =>
                      handleChange(e, "penal_sc_rate", e.target.value)
                    }
                    maxLength={20}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xl={8}>
              <Row>
                <Col xl={8}>
                  <TextField
                    type="text"
                    label="Remarks"
                    name="efa_remarks"
                    value={formHdrData.efa_remarks || ""}
                    onChange={(e) =>
                      handleChange(e, "efa_remarks", e.target.value)
                    }
                  />
                </Col>
                <Col xl={8}></Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col xl={7}>
                  <TextField
                    type="number"
                    label="TRI %"
                    name="timely_receipt_incent_rate"
                    value={formHdrData?.timely_receipt_incent_rate || ""}
                    onChange={(e) =>
                      handleChange(
                        e,
                        "timely_receipt_incent_rate",
                        e.target.value
                      )
                    }
                    maxLength={20}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xl={8}>
              <Row>
                <Col xl={8}>
                  <TextField
                    type="text"
                    label="EMFA Ref no"
                    name="loan_ref_no"
                    value={formHdrData.loan_ref_no || ""}
                    onChange={(e) =>
                      handleChange(e, "loan_ref_no", e.target.value)
                    }
                    maxLength={20}
                  />
                </Col>
              </Row>
            </Col>
            <Col xl={4}>
              <Row>
                <Col xl={7}>
                  <ButtonUi
                    type="button"
                    color="primary"
                    outline={true}
                    className="btn-sm mt-4"
                    disabled={formStatus != "Insert"}
                    onClick={handleCreateEMIData}
                  >
                    Create EMI Data
                  </ButtonUi>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Form>

      {/* Canvas for Document Upload */}
      <Modal isOpen={isUploadModalOpen} toggle={toggleUploadModal} size="xl">
        <ModalHeader toggle={toggleUploadModal}>
          {formStatus === "Query" ? "Uploaded Documents" : "Upload Documents"}
        </ModalHeader>

        <ModalBody
          style={{ maxHeight: "500px", padding: 0, overflow: "hidden" }}
        >
          {/* Sticky Header */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "#fff",
              borderBottom: "1px solid #dee2e6",
              padding: "16px 24px",
            }}
          >
            <Row>
              {/* Left: Required Documents */}
              <Col md={6}>
                <h6 className="fw-bold mb-3">📋 Required Documents</h6>
                <Row>
                  {requiredDocs.slice(0, 6).map((doc, index) => (
                    <Col
                      xs={6}
                      key={index}
                      className="mb-2 d-flex align-items-center gap-2"
                    >
                      <span style={{ color: "#6f42c1", fontSize: "1rem" }}>
                        ✔
                      </span>
                      <span style={{ fontSize: "0.9rem" }}>{doc}</span>
                    </Col>
                  ))}
                </Row>
              </Col>

              {/* Right: Upload Input (Insert only) */}
            {["Insert", "Update"].includes(formStatus) && (
              <Col md={6}>
                <h6 className="fw-bold mb-3">📎 Upload PDF Documents</h6>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="form-control form-control-sm"
                />
              </Col>
            )}
            </Row>
          </div>

          {/* Scrollable Preview Section */}
          <div
            style={{ height: "400px", overflowY: "auto", padding: "20px 24px" }}
          >
            {files.length > 0 ? (
              <Row className="g-3">
                {files.map(({ file, previewUrl }, index) => (
                  <Col key={index} xs="12" sm="6" md="4" lg="3">
                    <Card
                      className="p-3 shadow-sm h-100 d-flex flex-column justify-content-between"
                      style={{
                        fontSize: "0.85rem",
                        borderRadius: "10px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <FaFilePdf size={32} color="#d9534f" />
                        <div className="fw-semibold text-truncate">
                          {file.name}
                        </div>
                      </div>
                      {file.size && (
                        <div className="text-muted mt-2">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      )}
                      {previewUrl && (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-primary"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Preview
                        </a>
                      )}
                      {/* Show delete only in insert mode */}
                      {formStatus === "Insert" && (
                        <div className="text-end mt-2">
                          <FaTrashAlt
                            size={14}
                            color="#dc3545"
                            onClick={() => removeFile(index)}
                            style={{ cursor: "pointer" }}
                            title="Remove"
                          />
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-muted">No documents uploaded yet.</div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            outline
            type="button"
            onClick={toggleUploadModal}
          >
            Close
          </Button>
          {["Insert", "Update"].includes(formStatus) && (
            <Button
              color="primary"
              onClick={handleSubmitDocuments}
            >
              Submit Documents
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default LoanMasterHdr;
