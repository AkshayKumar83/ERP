const express = require("express");

const {handleFormOperation,getFormBaseConstants,handlePostFormData,validateWcNoAndToWcNo,validateAllItems} = require("../../../../controllers/whManagement/reports/itemStockLedger");

   

const router = express.Router("router");



router.get("/form-data", handleFormOperation); 
router.post("/form-data", handlePostFormData); 
router.get("/validate-wc-no", validateWcNoAndToWcNo); 
router.get("/list-constants",getFormBaseConstants);
router.get("/get-all-items",validateAllItems);

module.exports = router;