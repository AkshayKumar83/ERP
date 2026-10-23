const express = require("express");
const { getFormBaseConstants, handleFormOperation, validateRecOnAdd, submitFormData } = require("../../../controllers/finance/forms/stateWiseGst");

const router = express.Router("router");

router.get("/list-constants", getFormBaseConstants); 
router.get("/form-data", handleFormOperation); // new
router.post('/form-data/validate-rec', validateRecOnAdd)
router.post('/form-data', submitFormData)

module.exports = router;
