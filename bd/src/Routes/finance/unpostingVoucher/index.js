const express = require("express");
const {
  getFormBaseConstants,
  postUnpostedData,
  handleFormOperation,
} = require("../../../controllers/finance/forms/unpostingVoucher");

const router = express.Router("router");

router.get("/list-constants", getFormBaseConstants);
router.post("/submit", postUnpostedData);
router.get("/form-data", handleFormOperation);

module.exports = router;
