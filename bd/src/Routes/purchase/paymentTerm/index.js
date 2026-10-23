const express = require("express");
const fs = require("fs");
const { handleFormOperation, getBaseConstants, handleSubmitFormData } = require("../../../controllers/purchase/forms/paymentTerm");

const router = express.Router("router");

// router.post("/form-data", handlePostFormData); // new
router.get("/list-constants",getBaseConstants); // new
router.get("/form-data", handleFormOperation); // new
router.post('/form-data', handleSubmitFormData)

module.exports = router;
