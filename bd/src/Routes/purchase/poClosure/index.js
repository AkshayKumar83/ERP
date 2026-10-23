const express = require("express");
const { 
    
    handleFormOperation,
     handleSubmitPOClosure,
     checkPOGateEntry
   
 } = require("../../../controllers/purchase/forms/poClosure");


const router = express.Router("router");

router.get("/form-data", handleFormOperation); 
router.put("/submit", handleSubmitPOClosure); 
router.get("/check-po-gate-entry", checkPOGateEntry); 


module.exports = router;
