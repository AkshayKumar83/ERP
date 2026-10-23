const express = require('express')

const {handlePostFormData} = require('../../../controllers/finance/reports/voucherReport')   


const router = express.Router("router")


router.post("/form-data", handlePostFormData); 

module.exports = router;
