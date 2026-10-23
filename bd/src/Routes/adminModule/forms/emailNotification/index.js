const express = require("express");  
const { handleEmailFormData, sendEmailNotification } = require("../../../../controllers/adminModule/forms/emailNotification");

 
const router = express.Router("router");

router.post("/form-data", handleEmailFormData)
router.post("/send", sendEmailNotification)

module.exports = router;