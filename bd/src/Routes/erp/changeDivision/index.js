const express = require("express");
const { getDivisionList } = require("../../../controllers/erp/changeDivision");

const router = express.Router();

router.get("/", getDivisionList);

module.exports = router;
