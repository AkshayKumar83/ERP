const express = require("express");

// const { userAuth } = require("../../../middleware/auth");

const { getFormBaseConstants, handleFormOperation, fetchCustomerDependentData,
     verifyHSNCode, handleSubmitData,
      updateSerInvData, cancelSerInv, printInv, authInvoice} = require("../../../controllers/saleManagement/serviceInvoice") 
const router = express.Router("router");


router.get("/form-data", handleFormOperation)
router.get("/list-constants", getFormBaseConstants)
router.get("/customer-dependent-data", fetchCustomerDependentData);
router.get("/verify-hsn-code", verifyHSNCode);
router.post('/form-data', handleSubmitData)
router.put('/form-data', updateSerInvData)
router.put('/cancel-inv', cancelSerInv)
router.post('/print-inv', printInv) 
router.put('/auth-inv', authInvoice) 

module.exports = router;
