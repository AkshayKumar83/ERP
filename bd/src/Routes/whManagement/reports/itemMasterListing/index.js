const express = require("express");

const {handleFormOperation,getFormBaseConstants,handlePostFormData} = require("../../../../controllers/whManagement/reports/itemMasterListing");

const router = express.Router("router");



router.get("/form-data", handleFormOperation); 
 router.post("/form-data", handlePostFormData);  
 router.get("/list-constants",getFormBaseConstants);

module.exports = router;