const express = require('express')


const {handleFormOperation,handlePostFormData,handleCheckDuplicate} = require('../../../controllers/finance/forms/purchaseCategoryDefination')

const router = express.Router('router');

router.get('/form-data',handleFormOperation);
router.post('/form-data',handlePostFormData);
router.put('/form-data',handlePostFormData);
router.get('/check-duplicate',handleCheckDuplicate);



module.exports = router;
