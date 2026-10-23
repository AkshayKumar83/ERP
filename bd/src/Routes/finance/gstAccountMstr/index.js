const express = require("express");
const { gstAccMstrFormConstants, handleFormOperation, validateFields, submitFormData, getValidateData } = require("../../../controllers/finance/forms/gstAccountMstr");

const router = express.Router("router");

router.get("/list-constants", gstAccMstrFormConstants);
router.get("/form-data", handleFormOperation); // new
router.get("/form-data/validate_field", validateFields); // new
router.post("/form-data", submitFormData); // new
router.get("/valid-data", getValidateData); // new

module.exports = router;
