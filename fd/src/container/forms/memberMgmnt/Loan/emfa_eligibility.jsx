import React, { useState, useCallback } from "react";
import { TabContent, TabPane, Form, Col, Row, Card } from "reactstrap";
import FormSetup from "../../../../components/common/formSetup";
import { useFormStatus } from "../../../../hooks/useFormStatus";
import { useRecordCount } from "../../../../hooks/useRecordCount";
import { APP_PROD_API } from "../../../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";

const EmfaEligibilty = () => {
  const { user } = useSelector((state) => state.auth);

  const {
    formStatus,
    handleOperation,
    releaseFormStatus,
    searchQuery,
    setSearchQuery,
  } = useFormStatus();

  const { handleOffset, currentRecordNo, totalRecordCount } = useRecordCount();

  const [activeTab, setActiveTab] = useState(1);
  const [files, setFiles] = useState([]);

  const tabs = ["Upload Document"];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      if (file.type !== "application/pdf") {
        toast.error(`${file.name} is not a PDF`);
        return false;
      }
      return true;
    });

    const filesWithPreview = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Please upload at least one PDF file.");
      return;
    }

    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append("documents", file);
    });
    formData.append("uploaded_by", user?.user_name || "unknown");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}${APP_PROD_API.UPLOAD_DOC_API}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Documents uploaded successfully!");
        formCleanup();
      } else {
        toast.error(result?.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while uploading.");
    }
  };

  const formCleanup = () => {
    setFiles([]);
    releaseFormStatus();
  };

  const handleCancel = useCallback(() => {
    formCleanup();
  }, []);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const setupQueryData = () => {};
  const handleSearch = () => {};

  return (
    <FormSetup
      navType="tabs"
      activeTab={activeTab}
      tabs={tabs}
      updateActiveTab={updateActiveTab}
      formStatus={formStatus}
      currentRecordNo={currentRecordNo}
      totalRecordCount={totalRecordCount}
      pageCount={1}
      totalPageCount={1}
      isSingleQuery={true}
      setupQueryData={setupQueryData}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      handleOperation={handleOperation}
      handleOffset={handleOffset}
      isQueryReqOnNextPreBtn={false}
      QUERY_API={APP_PROD_API.GET_EMI_REPAYMENT_DATA}
      formName={"Upload Document"}
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      formPayload={{ searchQuery }}
      authority={{ insert: "Y", update: "N", message: "Update not allowed!" }}
    >
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          <Form
            id="upload-multiple-pdf-form"
            className="p-4 bg-white shadow rounded w-100"
          >
            <Row>
              <Col xl={12}>
                <label className="form-label fw-bold mb-2">
                  Upload PDF Documents
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="form-control"
                />
              </Col>
            </Row>

            {files.length > 0 && (
              <Row className="mt-4 g-3">
                {files.map(({ file, previewUrl }, index) => (
                  <Col key={index} xs="12" sm="6" md="4" lg="3">
                    <Card className="p-3 shadow-sm h-100">
                      <div className="d-flex flex-column gap-2">
                        <FaFilePdf size={40} color="#d9534f" />
                        <div className="fw-semibold">{file.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "#666" }}>
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                        {previewUrl && (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "0.875rem", color: "#007bff" }}
                          >
                            Preview PDF
                          </a>
                        )}
                      </div>
                      <div className="mt-2 text-end">
                        <FaTrashAlt
                          size={16}
                          color="#dc3545"
                          onClick={() => removeFile(index)}
                          style={{ cursor: "pointer" }}
                          title="Remove"
                        />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Form>
        </TabPane>
      </TabContent>
    </FormSetup>
  );
};

export default EmfaEligibilty;
