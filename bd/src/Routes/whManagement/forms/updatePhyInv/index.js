const express = require("express");
const router = express.Router();

const { getFormBaseConstants , generateAdjustments} = require("../../../../controllers/whManagement/forms/updatePhyInv");

router.get("/list-constants", getFormBaseConstants);
router.post("/generate-adjustments", generateAdjustments);

module.exports = router;
