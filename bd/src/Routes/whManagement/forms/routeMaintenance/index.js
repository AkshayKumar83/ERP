const express = require("express");
const multer = require("multer");
const { handleFormOperation,handlePostFormData,validateCommon, uploadRouteDrawing, uploadRouteDrawingMulter } = require("../../../../controllers/whManagement/forms/routeMaintenance");

const router = express.Router();

router.get("/form-data", handleFormOperation);  
router.post('/form-data',handlePostFormData);
router.put('/form-data',handlePostFormData);
router.post("/validate", validateCommon);
router.post("/uploadDrawing", uploadRouteDrawingMulter.single("process_drw"), uploadRouteDrawing);  // WITH MULTER

module.exports = router;