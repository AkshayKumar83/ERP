const express = require("express");
const { getFormBaseConstants, updateVehicalInfo } = require("../../../../controllers/memberManangement/forms/loan/vehicalDetail");

const router = express.Router("router");



router.get("/list-constants", getFormBaseConstants); // for Insert
router.put("/form-data", updateVehicalInfo); // for Insert


module.exports = router;

