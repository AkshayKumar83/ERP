const express = require("express");
const {
  handleRepayAdjustFifo,
  handleRepayAdjustFifoFinal,
  handleFormOperation,
  getFormBaseConstants,
  calculateBalAmt,
  getLoanReceiptNo,
} = require("../../../../controllers/memberManangement/forms/loan/loanRepay");

const router = express.Router("router");

//  router.use(userAuth) // middleware

// router.get("/form-data", handleFormOperation); // for Query
router.post("/form-data/repay_adjust_fifo", handleRepayAdjustFifo); // for Insert
router.post("/form-data/repay_adjust_fifo_final", handleRepayAdjustFifoFinal); // for Insert
router.get("/form-data", handleFormOperation); // for Insert
router.get("/form-data/get-loan-rec-no", getLoanReceiptNo); // for Insert
router.get("/list-constants", getFormBaseConstants); // for Insert
router.get("/form-data/get_balance", calculateBalAmt);

module.exports = router;
