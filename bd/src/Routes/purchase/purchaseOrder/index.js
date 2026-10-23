const express = require("express");
const { 
    getFormBaseConstants,
    handleFormOperation,
    handleValidate,
    validateItemForPO,
    handleSubmitData,
    updatePurchaseOrder,
    authorizePo,
    printPO,
    handleEmailAuthAction,
    getChargesMasterOnly,
    cancelPurchaseOrder

 } = require("../../../controllers/purchase/forms/purchaseOrder");


const router = express.Router("router");
router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation); 
router.get("/validate", handleValidate); 
router.get("/verify-item-code", validateItemForPO); 
router.post("/submit", handleSubmitData); 
router.put("/submit", updatePurchaseOrder); 
router.put("/authorization", authorizePo); 
 router.post('/print-po', printPO)
 router.get('/email-action', handleEmailAuthAction)
//  router.get('/charges-master', getChargesMaster)
//  router.get('/po-level-charges', getPoLevelCharges)
router.get('/po-level-charges-with-master', getChargesMasterOnly);
router.put("/cancel-po", cancelPurchaseOrder); 

module.exports = router;
