const express = require("express");
const { handleFormOperation, handlePostFormData,validateCommon} = require("../../../../controllers/whManagement/forms/defineOperations");

const router = express.Router();

//  Ensure these routes match frontend requests
router.get("/form-data", handleFormOperation); 
 router.post("/submit", handlePostFormData); 
 router.put("/submit",handlePostFormData) ;  
 router.post("/validate", validateCommon); 

module.exports = router;
