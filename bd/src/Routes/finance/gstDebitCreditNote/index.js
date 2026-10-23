const express = require("express");  

const {getFormBaseConstants, handleFormOperation, handlePostFormData, authorizedGstDebitCreditData} = require("../../../controllers/finance/forms/gstDebitCreditNote")

const router = express.Router("router"); 

router.get("/form-data", handleFormOperation); 
router.get("/list-constants", getFormBaseConstants) 
router.post("/submit", handlePostFormData)
router.put("/auth_gstDebitCredit", authorizedGstDebitCreditData)

module.exports = router;