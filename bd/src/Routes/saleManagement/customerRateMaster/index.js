const express = require("express");
const { 
    
    handleFormOperation,
    handleSubmitData,
    updateRatemstr,
    checkDuplicate
 } = require("../../../controllers/saleManagement/customerRateMaster");


const router = express.Router("router");
router.get("/form-data", handleFormOperation); 
router.post("/submit", handleSubmitData); 
router.put("/submit", updateRatemstr); 
 router.post('/check-duplicate', checkDuplicate)


module.exports = router;
