const express = require("express");
const {
  handleFormOperation,
  handleShowBtnOperation,
  // handleFromDateValidation,
  handleGetTommmainData,
} = require("../../../../controllers/whManagement/reports/binKard");

const router = express.Router(); // ✅ Correct

router.get("/form-data", handleFormOperation);
router.get("/form-data/show-opn-Bal", handleShowBtnOperation);
router.get('/item-dtl', handleGetTommmainData)

module.exports = router;
