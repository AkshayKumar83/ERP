const express = require("express");
const fs = require("fs");
const { handleFormOperation, getBaseConstants, handleSubmitFormData } = require("../../../controllers/saleManagement/paymentTermSale");

const router = express.Router("router");

router.get("/list-constants",getBaseConstants); 
router.get("/form-data", handleFormOperation); 
router.post('/form-data', handleSubmitFormData)

module.exports = router;
