const express = require("express");  

const {getFormBaseConstants, handleFormOperation, handlePostFormData, authorisedDebitCreditData, cancelDbCrVchData} = require("../../../controllers/finance/forms/debitCreditNote")

const router = express.Router("router"); 

router.get("/form-data", handleFormOperation); 
router.get("/list-constants", getFormBaseConstants) 
router.post("/submit", handlePostFormData)
router.put("/auth_DebitCredit", authorisedDebitCreditData)
router.put("/cancel-vchr", cancelDbCrVchData);

module.exports = router;