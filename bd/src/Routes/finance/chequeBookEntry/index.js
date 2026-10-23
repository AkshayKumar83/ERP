const express  = require('express');
const { handleFormOperation,getFormBaseConstants,handlePostFormData,handleValidation,handleOpenFlag } = require('../../../controllers/finance/forms/chequeBookEntry');

const router = express.Router("router");

router.get("/form-data", handleFormOperation);
router.get("/list-constants", getFormBaseConstants);
router.post("/form-data",handlePostFormData)
router.put('/form-data',handlePostFormData);
router.get('/check-dup',handleValidation)
router.get('/open-flag',handleOpenFlag)

module.exports = router;



