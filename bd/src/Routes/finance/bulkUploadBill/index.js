const express = require("express");
const {handleFormOperation, uploadBulkBills, generateSupplyChainEntry} = require("../../../controllers/finance/forms/bulkUploadBill");


const router = express.Router();


router.get("/form-data", handleFormOperation);
router.post('/temp-upload',uploadBulkBills)
router.post('/supply-chain-entries', generateSupplyChainEntry)


module.exports = router;
