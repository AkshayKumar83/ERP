const express = require('express') 
const router = express.Router("router");  

const {handleFormOperation, handleValidateFormData, handlePostFormData} = require("../../../../controllers/adminModule/forms/userSection")

router.get("/form-data", handleFormOperation );
router.get("/section-data", handleValidateFormData);
router.post("/submit", handlePostFormData)

module.exports = router;