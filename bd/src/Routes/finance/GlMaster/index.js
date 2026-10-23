const express = require("express");


const {getFormBaseConstants, handleFormOperation, handlePostFormData, handleValidation, handleUpdateFormData, generateAccNo} = require("../../../controllers/finance/forms/GlMaster");

const router = express.Router("router"); 

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.get("/form-data/generate-account-no", generateAccNo);
router.post("/submit", handlePostFormData);
router.put("/submit", handleUpdateFormData);
router.get('/form-data/validate', handleValidation)

module.exports = router;