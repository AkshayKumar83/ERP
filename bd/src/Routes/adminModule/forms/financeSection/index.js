
const express = require('express') 
const router = express.Router("router");  

const {getFormBaseConstants, getSectionDataByDeptCode, handlePostFormData} = require("../../../../controllers/adminModule/forms/financeSection")

router.get("/list-constants", getFormBaseConstants );  
router.get("/form-data", getSectionDataByDeptCode);
router.post("/submit", handlePostFormData);

module.exports = router;