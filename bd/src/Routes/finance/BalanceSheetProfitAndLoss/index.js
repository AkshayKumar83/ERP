const express = require('express');
const { handleFormOperation, handlePostFormData, getValidateData, generateEntriesData } = require('../../../controllers/finance/forms/BalanceSheetProfitAndLoss');
const { userAuth } = require("../../../middleware/auth");

const router = express.Router("router"); 

router.get('/form-data',handleFormOperation)
router.post('/form-data',handlePostFormData)
router.get('/valid-data',getValidateData)
router.get('/valid-data',getValidateData)
router.post('/generate-data',generateEntriesData)



module.exports = router;