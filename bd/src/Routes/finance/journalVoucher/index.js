const express = require("express")  

const {getFormBaseConstants, handleFormOperation, postJournalVoucher, handleUpdateData, authorizedJvVchData, cancelJvVchData } = require("../../../controllers/finance/journalVoucher")

const router = express.Router("router");    

router.get("/list-constants", getFormBaseConstants)
router.get("/form-data", handleFormOperation)
router.post("/form-data", postJournalVoucher);
router.put("/form-data", handleUpdateData)
router.put("/auth_vch", authorizedJvVchData) 
router.put("/cancel_vch", cancelJvVchData);



module.exports = router