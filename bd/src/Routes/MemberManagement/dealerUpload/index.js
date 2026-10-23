const express = require("express");
const { uploadDealers, uploadInMainDealer, deleteDataFromTempUpld } = require("../../../controllers/memberManangement/forms/dealerUpload");

const router = express.Router("router");

router.post("/dealers", uploadDealers);
router.get("/upl_in_main", uploadInMainDealer);
router.get("/delete_temp_upld", deleteDataFromTempUpld);


module.exports = router;
