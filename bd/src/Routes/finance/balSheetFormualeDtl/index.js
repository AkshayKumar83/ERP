const express = require("express");  

const {handleFormOperation, handlePostFormData, getValidateData} = require("../../../controllers/finance/forms/balSheetFormulaeDtl")

const router = express.Router("router"); 

router.get("/form-data", handleFormOperation);  
router.post("/submit", handlePostFormData)
router.get("/valid-data", getValidateData)

module.exports = router;