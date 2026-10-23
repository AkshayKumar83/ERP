const express = require("express");
const { handleFormOperation, handlePostFormData, getFormBaseConstants, handleValidateData, authorisedInterTransferMemo, cancelInterTransferMemo, checkDateInFinyear } = require("../../../controllers/purchase/forms/interTransferMemo");


const router = express.Router("router");

router.post("/submit", handlePostFormData); // new
router.get("/form-data", handleFormOperation); // new
router.get("/list-constants", getFormBaseConstants);
router.get("/valid-data", handleValidateData);
router.put("/auth_memo", authorisedInterTransferMemo);
router.put("/cancel_memo", cancelInterTransferMemo);
router.put("/check_date", checkDateInFinyear);// new


module.exports = router;