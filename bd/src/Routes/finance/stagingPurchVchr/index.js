const express = require("express");
const { 
    
    handleFormOperation,
    updateStagingPurchaseVoucher
 } = require("../../../controllers/finance/forms/stagingPurchVchr");


const router = express.Router("router");
router.get("/form-data", handleFormOperation); 
router.put("/submit", updateStagingPurchaseVoucher); 
//  router.post('/check-duplicate-bill-date', checkDuplicateRateEffDt)


module.exports = router;
