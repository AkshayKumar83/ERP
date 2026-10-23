const express = require("express");
const { 
    getFormBaseConstants,
    handleFormOperation,
    handleValidateData,
    handlePostFormData,
    // validateItemForPO,
    // handleSubmitData,
    // updatePurchaseOrder,
    // authorizePo, 
    deleteRmgpData,
    printNRGP
    
 } = require("../../../controllers/purchase/forms/nrgp");


const router = express.Router("router");
router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.get("/validate", handleValidateData); 
router.post("/submit", handlePostFormData); 
router.put("/delete", deleteRmgpData);
router.post("/print", printNRGP);




module.exports = router;
