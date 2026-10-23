// const express = require("express");
const express = require("express");
const router = express.Router("router");

const {
  getFormBaseConstants,
  getYearData
} = require("../../../../controllers/adminModule/forms/YearOpenUpdation");

router.get("/list-constants", getFormBaseConstants);
router.post("/year-data", getYearData)

module.exports = router;
