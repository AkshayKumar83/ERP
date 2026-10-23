const express = require("express");  

const {handleFormOperation, handlePostFormData, handleValidateData} = require("../../../controllers/finance/forms/blockPayment")

const router = express.Router("router"); 

router.get("/form-data", handleFormOperation);  
router.post("/submit", handlePostFormData)
router.get("/valid-data", handleValidateData)

module.exports = router;