const express = require("express");
const {
    getFormBaseConstants,
    handleFormOperation,
    handlePost,
    handleValidation,
    handleUpdateData,
    createTdsEntries,
    authorizedExpVchData,
    cancelExpVchData,
    createTdsEntriesV2,
} = require("../../../controllers/finance/forms/expenseBillVoucher");
const { userAuth } = require("../../../middleware/auth");
const { createGstEntries } = require("../../../controllers/finance/forms/expenseBillVoucher");

const router = express.Router();

// router.use(userAuth)

router.get("/list-constants", getFormBaseConstants);
router.get("/form-data", handleFormOperation); // new
router.get('/form-data/validate', handleValidation)
router.post("/expense-data", handlePost); // new
router.put("/expense-data", handleUpdateData); // new
// router.post("/form-data/create-tds-entry", createTdsEntries); // CREATE TDS ENTRIES
router.post("/form-data/create-tds-entry", createTdsEntriesV2); // CREATE TDS ENTRIES
router.get('/form-data/create-gst-entry',createGstEntries)
router.put('/auth_vch',authorizedExpVchData)
router.put('/cancel_vch', cancelExpVchData)

module.exports = router;
