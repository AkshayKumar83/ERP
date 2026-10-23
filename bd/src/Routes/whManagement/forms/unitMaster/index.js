const express = require("express");
const { handleFormOperation, handlePostFormData ,getValidateData} = require("../../../../controllers/whManagement/forms/unitMaster");

const router = express.Router();

//  Ensure these routes match frontend requests
router.get("/form-data", handleFormOperation); 
 router.post("/submit", handlePostFormData); 
 router.put("/submit",handlePostFormData) ;   

module.exports = router;
