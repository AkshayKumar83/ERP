const express = require("express");

const {
  handleFormOperation,
  handlePostFormData,
  getValidateData,
  handleCurrentYearData,
} = require("../../../../controllers/adminModule/forms/FiniancialYearOpen");

const router = express.Router("router");

router.get("/finance-data", handleFormOperation);
router.post("/submit", handlePostFormData);
router.get("/form-data", getValidateData);
router.post("/current-year", handleCurrentYearData);

module.exports = router;
