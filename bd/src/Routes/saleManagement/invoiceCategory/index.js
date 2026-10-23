const express = require("express");

const { userAuth } = require("../../../middleware/auth");

const { handleFormOperation, getFormBaseConstants, handlePostFormData, getValidateData} = require("../../../controllers/saleManagement/invoiceCategory") 
const router = express.Router("router");

// router.use(userAuth)

router.get("/form-data", handleFormOperation)
router.get("/list-constants", getFormBaseConstants)
router.post("/submit", handlePostFormData)
router.get("/invoice-data", getValidateData)

module.exports = router;
