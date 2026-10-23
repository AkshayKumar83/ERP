const express = require("express");

const {
  handleFormOperation,
  getFormBaseConstants,
  getAccountDetailsList,
  postBankVoucherData,
  getDataBasedOnAccMeta,
  authorizedBankVchData,
  cancelBankVchData,
  updateBankVoucherData,
  createTdsEntriesBnk,
} = require("../../../controllers/finance/forms/bankVoucher");

const router = express.Router("router");

router.get("/form-data", handleFormOperation);
router.get("/list-constants", getFormBaseConstants);
router.get("/acc-meta", getAccountDetailsList);
router.post("/form-data", postBankVoucherData); // insert back voucher form
router.put("/form-data", updateBankVoucherData); // update bank voucher form
router.get("/acc-bill-meta", getDataBasedOnAccMeta);
router.put("/auth_vch", authorizedBankVchData);
router.put("/cancel_vch", cancelBankVchData);
router.post("/form-data/create-tds-entry", createTdsEntriesBnk ); // CREATE TDS ENTRIES

module.exports = router;
