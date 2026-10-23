const express = require("express");
const { 
    getFormBaseConstants,
    handleFormOperation,
    updatePurchaseOrder,
    getChargesMasterOnly,
    validateItemForPO

 } = require("../../../controllers/purchase/forms/updatePurchaseOrder");


const router = express.Router("router");
router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation); 
router.get("/verify-item-code", validateItemForPO); 
router.put("/submit", updatePurchaseOrder); 
router.get('/po-level-charges-with-master', getChargesMasterOnly);


module.exports = router;
