const express = require("express");
const { handleFormOperation, getBaseConstants, handleSubmitFormData, getVendorList } = require("../../../controllers/purchase/forms/supplierMaster");

const router = express.Router("router");

router.post("/form-data", handleSubmitFormData); 
router.get("/list-constants", getBaseConstants)
router.get("/form-data", handleFormOperation); 
router.get("/form-data/get_vendor_list", getVendorList); 

module.exports = router;
