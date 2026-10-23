const express = require("express");
const { handleFormOperation, getValidateData, handlePostFormData} = require("../../../controllers/hrModule/increament");


const router = express.Router("router");

router.post("/submit", handlePostFormData); 
router.get("/form-data", handleFormOperation); 
router.get("/valid-data",  getValidateData); 
 
// router.get("/list-constants", getFormBaseConstants);


module.exports = router;