const express = require("express");
const { getFinYearList } = require("../../../controllers/erp/changeFinYear");

const router = express.Router();

router.get("/", getFinYearList);

module.exports = router;
