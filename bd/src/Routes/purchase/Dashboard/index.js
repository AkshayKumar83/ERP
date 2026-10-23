const express = require("express");

const {  handleFormOperation,handleVendorMonthData,handleVendorPurchaseMonthData } = require("../../../controllers/purchase/Dashboard/index");


const router = express.Router("router");

router.get("/dashboard-data", handleFormOperation); 
router.get("/month-data", handleVendorMonthData); 
router.get("/summary-data", handleVendorPurchaseMonthData); 

module.exports = router;
