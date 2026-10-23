const express = require("express");


const {  getFormBaseConstants, handleFormOperation, handlePostFormData, getValidateData} = require("../../../controllers/finance/forms/vendorTDSDec") 
const router = express.Router("router"); 



router.get("/list-constants", getFormBaseConstants)
router.get("/form-data", handleFormOperation)
router.post("/submit", handlePostFormData)
router.get("/valid-data", getValidateData)




module.exports = router;
