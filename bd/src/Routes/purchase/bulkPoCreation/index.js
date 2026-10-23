const express = require("express");
const { 
    
    handleFormOperation,
    handleSubmitBulkPO,
    handlebulkPoCreationButton,
 } = require("../../../controllers/purchase/forms/bulkPoCreation");


const router = express.Router("router");

router.get("/form-data", handleFormOperation); 
 router.post("/submit", handleSubmitBulkPO); 
// router.put("/submit", updateRatemstr); 
 router.post('/bulk-btn', handlebulkPoCreationButton);


module.exports = router;
