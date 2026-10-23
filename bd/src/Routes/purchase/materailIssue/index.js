const express = require("express");
const { handleFormOperation, handlePostFormData, getFormBaseConstants, getValidateData, authorisedInterTransferMemo, cancelInterTransferMemo } = require("../../../controllers/purchase/forms/materialIssue");


const router = express.Router("router");

router.post("/submit", handlePostFormData); // new
router.get("/form-data", handleFormOperation); // new
router.get("/list-constants", getFormBaseConstants);
router.get("/valid-data", getValidateData);
router.put("/auth_memo", authorisedInterTransferMemo);
router.put("/cancel_memo", cancelInterTransferMemo);


module.exports = router;