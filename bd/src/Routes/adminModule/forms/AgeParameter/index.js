// const express = require("express");
const express = require("express");
const router = express.Router("router");   

const {
    handleFormOperation,
    getValidateData,
    handlePostFormData,
} = require("../../../../controllers/adminModule/forms/AgeParameter");


router.get("/query-data", handleFormOperation)
router.get("/form-data", getValidateData)
router.post("/submit", handlePostFormData)


module.exports = router; 