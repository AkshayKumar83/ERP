const express = require("express");

const {
  handleFormOperation,
  handlePostFormData,
  getValidateData,
} = require("../../../controllers/finance/forms/balanceSheetAccLink");

const router = express.Router("router");

router.get("/form-data", handleFormOperation);
router.get("/valid-data", getValidateData);
router.post("/submit", handlePostFormData);
// router.put("/auth_gstDebitCredit", authorizedGstDebitCreditData)

module.exports = router;
