const express = require("express");  

const {handleFormOperation, handlePostFormData, getValidateData} = require("../../../controllers/finance/forms/accWiseTdsMstr")

const router = express.Router("router"); 

router.get("/form-data", handleFormOperation);  
router.post("/submit", handlePostFormData)
router.get("/acc-data", getValidateData)

module.exports = router;