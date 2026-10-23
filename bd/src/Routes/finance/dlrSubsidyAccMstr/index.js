const express = require("express");


const {getFormBaseConstants, handleFormOperation, handleSubmitData,handleUpdateFormData,downloadExcelReport} = require("../../../controllers/finance/forms/dlrSubsidyAccMstr");

const router = express.Router("router"); 

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
 router.post("/submit", handleSubmitData);
 router.put("/submit", handleUpdateFormData);
 router.get("/report-data", downloadExcelReport);

module.exports = router;