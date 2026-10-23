
// const express = require("express"); 
const express = require('express')
const router = express.Router("router");
//const router = express.Router("router"); 
const {getFormBaseConstants, handleFormOperation, getValidateData, handlePostFormData} = require("../../../../controllers/adminModule/forms/DivisionMaster") 


router.get("/list-constants", getFormBaseConstants); 
router.get("/form-data", handleFormOperation); // new
router.get("/division-data", getValidateData);
router.post("/submit", handlePostFormData)

module.exports = router;

// api/v1/division-master/list-constants