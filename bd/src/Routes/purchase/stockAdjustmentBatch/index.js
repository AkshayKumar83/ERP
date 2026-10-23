const express = require("express");
const { handleFormOperation, getFormBaseConstants, handleValidateData, handlePostFormData, authorisedStockAdjustmentDetails, cancelStockAdjustmentDetails} = require("../../../controllers/purchase/forms/stockAdjustmentBatch");


const router = express.Router("router");

router.post("/submit", handlePostFormData); // new
router.get("/form-data", handleFormOperation); // new
router.get("/list-constants", getFormBaseConstants);
router.get("/valid-data", handleValidateData);
router.put("/auth_memo", authorisedStockAdjustmentDetails);
router.put("/cancel_memo", cancelStockAdjustmentDetails);
// router.put("/check_date", checkDateInFinyear);// new


module.exports = router;