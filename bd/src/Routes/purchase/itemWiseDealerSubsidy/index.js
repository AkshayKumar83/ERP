const express = require("express");
const { 
    
    handleFormOperation,
    handleSubmitData,
    updateRatemstr,
    checkDuplicateItemEffDt
 } = require("../../../controllers/purchase/forms/itemWiseDealerSubsidy");


const router = express.Router("router");

router.get("/form-data", handleFormOperation); 
router.post("/submit", handleSubmitData); 
router.put("/submit", updateRatemstr); 
 router.post('/check-duplicate', checkDuplicateItemEffDt)


module.exports = router;
