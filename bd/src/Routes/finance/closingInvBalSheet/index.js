const express = require("express");

const {
  handleFormOperation,
  handlePostFormData,
  getValidateData

} = require("../../../controllers/finance/forms/closingInvBalSheet");

const router = express.Router("router"); 


router.get("/form-data", handleFormOperation);
router.get("/valid-data", getValidateData);
router.post("/submit", handlePostFormData);

module.exports = router;