const express = require("express");

const {handlePostFormData} = require("../../../../controllers/saleManagement/Reports/saleReturn/index");

const router = express.Router("router");




router.post("/form-data", handlePostFormData); 



module.exports = router;