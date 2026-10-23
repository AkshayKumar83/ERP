const express = require("express")  

const {getFormBaseConstants, handleFormOperation, handlePostFormData, getValidateData} = require("../../../controllers/finance/forms/bankDetails")

const router = express.Router("router");    

router.get("/list-constants", getFormBaseConstants)
router.get("/form-data", handleFormOperation)
router.post("/submit", handlePostFormData )
router.get("/bank-data", getValidateData )



module.exports = router