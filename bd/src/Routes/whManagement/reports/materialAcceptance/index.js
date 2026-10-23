const express = require("express");

const {handleFormOperation,getFormBaseConstants,handlePostFormData,validateStore} = require("../../../../controllers/whManagement/reports/materialAcceptance/index");

const router = express.Router("router");



router.get("/form-data", handleFormOperation); 
router.post("/form-data", handlePostFormData); 
router.get("/validate-store", validateStore);

// router.get("/list-constants",getFormBaseConstants);

module.exports = router;