const express = require("express");

const { userAuth } = require("../../../middleware/auth");

const { getFormBaseConstants, handleFormOperation, validateFormField} = require("../../../controllers/saleManagement/normalInvoice") 
const router = express.Router("router");


router.get("/form-data", handleFormOperation)
router.get("/list-constants", getFormBaseConstants)
router.get("/validate", validateFormField)


module.exports = router;