const express = require("express");
const { getBaseConstants, handleFormOperation, handleSubmitFormData, getCustomerList } = require("../../../controllers/saleManagement/customerMaster");
const { userAuth } = require("../../../middleware/auth");


const router = express.Router("router");

// router.use(userAuth)

router.post("/form-data", handleSubmitFormData); 
router.get("/list-constants", getBaseConstants)
router.get("/form-data", handleFormOperation); 
router.get("/form-data/get_customer_list", getCustomerList); 

module.exports = router;
