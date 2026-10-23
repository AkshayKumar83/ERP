const express = require("express");

const {handleFormOperation,handlePostFormData} = require("../../../../controllers/purchase/reports/poDump");

   

const router = express.Router("router");



router.get("/form-data", handleFormOperation); 
router.post("/form-data", handlePostFormData); 



module.exports = router;