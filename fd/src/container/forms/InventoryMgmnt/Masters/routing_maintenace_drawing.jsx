

import React, { useRef } from "react";
import { Card, Col, Row } from "reactstrap";
import ButtonUi from "../../../../components/basic/button";
import toast from "react-hot-toast";

const RoutingMaintenaceDrawing = ({
  drawingData,
  setDrawingData,
  formStatus,
}) => {
  const fileRef = useRef(null);

  const handlePictureClick = () => {
    if (formStatus === "Query") {
      toast.error("Picture not allowed in Query mode");
      return;
    }
    fileRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size too large (max 2MB)");
      return;
    }

    setDrawingData({
      file,
      preview: URL.createObjectURL(file),
      isChanged: true,
    });
  };

  const handleCancel = () => {
      if (!["Insert"].includes(formStatus)) return;

    if (drawingData?.preview) {
      URL.revokeObjectURL(drawingData.preview);
    }
    setDrawingData({});
  };

  const imageSrc =
    drawingData?.preview ||
    (drawingData?.process_drw
      ? `${import.meta.env.VITE_BASE_API_URL}/${drawingData.process_drw}`
      : null);

  return (
    <Card
      className="p-1"
      style={{
        height: "calc(100vh - 200px)", //  whole visible area
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* IMAGE AREA */}
      <div
        style={{
          flex: 1,
          border: "1px solid #999",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Process Drawing"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", //  MAIN FIX
            }}
          />
        ) : (
          <span style={{ color: "#888" }}>No Drawing Available</span>
        )}
      </div>

      {/* BUTTONS (ALWAYS VISIBLE) */}
      <Row className="mt-3">
        <Col xl="6" className="d-flex justify-content-center">
          <ButtonUi outline onClick={handlePictureClick}>
            Picture
          </ButtonUi>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />
        </Col>

        <Col xl="6" className="d-flex justify-content-center">
          <ButtonUi outline onClick={handleCancel}>
            Cancel
          </ButtonUi>
        </Col>
      </Row>
    </Card>
  );
};

export default RoutingMaintenaceDrawing;
