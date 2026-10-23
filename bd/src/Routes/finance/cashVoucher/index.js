const express = require("express");
const {
    getCashVoucherBaseConstants,
    getAccountDetailsList,
    getDataBasedOnAccMeta,
    postCashVoucherData,
    validateField,
    getCurrencyMetaBasedOnSection,
    getITCMetaData,
    updateCashVoucherData,
    authorizedCashVchData,
    cancelCachVchData,
} = require("../../../controllers/finance/forms/cashVoucher");
const router = express.Router("router");

router.get("/fetch-constants", getCashVoucherBaseConstants);
router.get("/acc-meta", getAccountDetailsList);
router.get("/acc-bill-meta", getDataBasedOnAccMeta);
router.get("/balance-meta", getCurrencyMetaBasedOnSection);
router.get("/itc-meta", getITCMetaData);

router.get("/form-data/validate", validateField);
router.post("/form-data", postCashVoucherData);
router.put("/form-data", updateCashVoucherData);

router.put('/auth_vch', authorizedCashVchData);
router.put('/cancel_vch', cancelCachVchData)

module.exports = router;
