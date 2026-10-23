const express = require("express");

const {handleFormOperation,getFormBaseConstants,handlePostFormData,validatePoNo,validatePoCategory} = require("../../../../controllers/whManagement/reports/incomingMaterialDetail/index");

const router = express.Router("router");



router.get("/form-data", handleFormOperation); 
router.post("/form-data", handlePostFormData); 
router.get("/validate-po-no", validatePoNo); 
router.get("/validate-po-category", validatePoCategory); 
router.get("/list-constants",getFormBaseConstants);

module.exports = router;