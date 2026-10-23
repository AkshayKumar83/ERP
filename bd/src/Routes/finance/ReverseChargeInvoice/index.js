const express = require ('express');
const { handleFormOperation,getFormBaseConstants } = require('../../../controllers/finance/forms/reverseChargeInvoice');

const router = express.Router();

router.get("/form-data",handleFormOperation)
router.get("/list-constants", getFormBaseConstants);

module.exports = router;