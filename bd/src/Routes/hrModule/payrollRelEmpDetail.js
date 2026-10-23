const express = require("express");
const {
  onQuery,
  getDropDownData,
  nextPre_onQuery,
  searchQueryRecord,
  onUpdate,
  getCostCenterData,
} = require("../../controllers/hrModule/payrollRelEmpDetailController");

const router = express.Router("router");

router.get("/query", onQuery);
router.get("/get_drpdown", getDropDownData);
router.get("/nextPre/query/:data", nextPre_onQuery);
router.post("/search_rec", searchQueryRecord);
router.put("/update_rec", onUpdate);
router.get("/get_cost_centr", getCostCenterData);

module.exports = router;
