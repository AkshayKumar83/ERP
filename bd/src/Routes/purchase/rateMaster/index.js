const express = require("express");
const { 
    
    handleFormOperation,
    handleSubmitData,
    updateRatemstr,
    checkDuplicateRateEffDt
 } = require("../../../controllers/purchase/forms/rateMaster");


const router = express.Router("router");
router.get("/form-data", handleFormOperation); 
router.post("/submit", handleSubmitData); 
router.put("/submit", updateRatemstr); 
 router.post('/check-duplicate-eff-date', checkDuplicateRateEffDt)


module.exports = router;
