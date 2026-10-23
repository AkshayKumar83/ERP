const express = require('express')

const {getFormBaseConstants,getTransactionNumbers,handlePostFormData} = require('../../../controllers/finance/reports/auditTrial')   


const router = express.Router("router")


 router.get("/list-constants",getFormBaseConstants);
 router.get("/transaction-no", getTransactionNumbers);
router.post("/form-data", handlePostFormData); 

module.exports = router;
