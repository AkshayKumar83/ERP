const express = require("express");  

const {handleGoButtonOperation,
    handleHelpListOperation,
    handleBulkPrintingOperation
 } = require("../../../controllers/finance/forms/bulkPrinting")

const router = express.Router("router"); 

router.get("/form-data", handleGoButtonOperation);  
router.get("/help-list-data", handleHelpListOperation);  
router.post("/form-data", handleBulkPrintingOperation);  

module.exports = router;