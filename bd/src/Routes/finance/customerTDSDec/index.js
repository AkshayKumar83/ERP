const express = require('express');
const { handleFormOperation ,handlePostFormData,checkValidateYear} = require('../../../controllers/finance/forms/customerTDSDec');

const router = express.Router('router')

router.get('/form-data',handleFormOperation);
router.post('/form-data',handlePostFormData);
router.put('/form-data',handlePostFormData);
router.get('/check-year',checkValidateYear);

module.exports = router;