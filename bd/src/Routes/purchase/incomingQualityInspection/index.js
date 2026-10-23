const express = require("express");
 const { handleFormOperation, handlePostFormData } = require("../../../controllers/purchase/forms/incomingQualityInspection");


const router = express.Router("router");

router.post("/submit", handlePostFormData); // new
router.get("/form-data", handleFormOperation); 
// router.get("/list-constants", getFormBaseConstants);
// router.get("/valid-data", getValidateData);
// router.put("/auth_memo", authorisedInterTransferMemo);
// router.put("/cancel_memo", cancelInterTransferMemo);


module.exports = router;