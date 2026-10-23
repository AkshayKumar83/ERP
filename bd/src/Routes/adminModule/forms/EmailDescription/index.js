const express = require("express") 

const {handleFormOperation, handlePostFormData, getValidateData} = require("../../../../controllers/adminModule/EmailDescription") 

const router = express.Router("router"); 

router.get("/form-data", handleFormOperation) 
router.post("/submit", handlePostFormData)
router.get("/email-data", getValidateData)

module.exports = router