const express = require("express") 

const {handleFormOperation, getFormBaseConstants} = require("../../../controllers/finance/forms/purchaseVchrEntry"); 

const router = express.Router();  

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation)

module.exports = router