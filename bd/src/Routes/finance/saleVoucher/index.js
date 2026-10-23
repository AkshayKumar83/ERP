const express = require("express") 

const {getFormBaseConstants, handleFormOperation} = require("../../../controllers/finance/forms/saleVoucher") 

const router = express.Router("router");  

router.get("/list-constants", getFormBaseConstants) 
router.get("/form-data", handleFormOperation) 

module.exports = router