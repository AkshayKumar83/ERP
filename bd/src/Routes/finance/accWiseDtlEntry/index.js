const express = require("express");
const {
  handleFormOperation,
  getFormData,
} = require("../../../controllers/finance/forms/accWiseDtlEntry");

const router = express.Router();

router.get("/form-data", handleFormOperation);
router.get('/show', getFormData)

module.exports = router;
