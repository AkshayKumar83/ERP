const express = require("express");


const {getFormBaseConstants, handleFormOperation, handlePostFormData} = require("../../../../controllers/adminModule/forms/GeneralParameter");

const router = express.Router("router"); 

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation);
router.post("/submit", handlePostFormData);

module.exports = router;