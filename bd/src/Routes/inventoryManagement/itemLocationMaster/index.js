const express = require("express");
 const { handleFormOperation, handlePostFormData, handleValidateData } = require("../../../controllers/inventoryManagement/itemLocationMaster");


const router = express.Router("router");

router.post("/submit", handlePostFormData); 
 router.get("/form-data", handleFormOperation); 
  router.get("/valid-data", handleValidateData); 
 
// router.get("/list-constants", getFormBaseConstants);


module.exports = router;