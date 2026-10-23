const express = require("express")  

const { handleFormOperation,handlePostFormData, handleValidation} = require("../../../controllers/finance/forms/paymentReversal")

const { userAuth } = require("../../../middleware/auth");

const router = express.Router("router"); 
// router.use(userAuth)

router.get("/form-data", handleFormOperation);
router.post("/submit", handlePostFormData);
router.get("/validation", handleValidation);

module.exports = router