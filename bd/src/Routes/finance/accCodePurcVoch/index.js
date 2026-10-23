const express = require('express');
const { handleFormOperation, getFormBaseConstants,handlePostFormData,handleValidation } = require('../../../controllers/finance/forms/accCodePurcVoch');


const router = express.Router('router');


router.get("/form-data", handleFormOperation);
router.get('/list-constants',getFormBaseConstants);
router.post("/form-data",handlePostFormData)
router.put('/form-data',handlePostFormData);
 router.get('/check-duplicate',handleValidation)


module.exports = router;